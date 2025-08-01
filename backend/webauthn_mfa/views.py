from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from django.shortcuts import get_object_or_404
from datetime import timedelta
import secrets
import base64
from webauthn import generate_registration_options, verify_registration_response, generate_authentication_options, verify_authentication_response
from webauthn.helpers.structs import PublicKeyCredentialDescriptor, AuthenticatorSelectionCriteria, UserVerificationRequirement, AuthenticatorAttachment
from django.conf import settings
from .models import WebAuthnCredential, WebAuthnChallenge
from .serializers import WebAuthnCredentialSerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_devices(request, user_id):
    """Get user's WebAuthn devices"""
    user = request.user
    
    # For Clerk integration, we'll use the user_id from the URL
    # but only allow users to access their own devices
    # The user_id from Clerk should match the authenticated user
    
    devices = WebAuthnCredential.objects.filter(user=user)
    serializer = WebAuthnCredentialSerializer(devices, many=True)
    
    return Response({
        'devices': serializer.data,
        'count': devices.count()
    })

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_device(request, device_id):
    """Delete a specific WebAuthn device"""
    user = request.user
    
    # Get the device and ensure it belongs to the user
    device = get_object_or_404(WebAuthnCredential, id=device_id, user=user)
    device.delete()
    
    return Response({
        'message': 'Device deleted successfully'
    }, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def register_begin(request):
    """Generate challenge for WebAuthn registration"""
    user = request.user
    
    # Extract data from request
    user_id = request.data.get('userId')
    username = request.data.get('username', user.email)
    display_name = request.data.get('displayName', f"{user.first_name} {user.last_name}".strip() or user.email)
    
    # Generate challenge
    challenge = base64.urlsafe_b64encode(secrets.token_bytes(32)).decode('utf-8').rstrip('=')
    
    # Store challenge
    WebAuthnChallenge.objects.create(
        user=user,
        challenge=challenge,
        challenge_type='register',
        expires_at=timezone.now() + timedelta(minutes=5)
    )
    
    # Get existing credentials
    existing_credentials = WebAuthnCredential.objects.filter(user=user)
    exclude_credentials = [
        PublicKeyCredentialDescriptor(id=base64.b64decode(cred.credential_id + '=='))
        for cred in existing_credentials
    ]
    
    # Generate registration options
    options = generate_registration_options(
        rp_id=settings.WEBAUTHN_RP_ID,
        rp_name=settings.WEBAUTHN_RP_NAME,
        user_id=str(user.id),
        user_name=username,
        user_display_name=display_name,
        challenge=challenge.encode(),
        exclude_credentials=exclude_credentials,
        authenticator_selection=AuthenticatorSelectionCriteria(
            authenticator_attachment=AuthenticatorAttachment.CROSS_PLATFORM,  # Exclude platform authenticators (fingerprint, Face ID)
            user_verification=UserVerificationRequirement.PREFERRED
        )
    )
    
    # Convert options to format expected by frontend
    return Response({
        'challenge': list(challenge.encode()),
        'rp': {
            'id': settings.WEBAUTHN_RP_ID,
            'name': settings.WEBAUTHN_RP_NAME
        },
        'user': {
            'id': list(str(user.id).encode()),
            'name': username,
            'displayName': display_name
        },
        'pubKeyCredParams': [
            {'type': 'public-key', 'alg': -7},   # ES256
            {'type': 'public-key', 'alg': -257}, # RS256
            {'type': 'public-key', 'alg': -8},   # EdDSA
        ],
        'timeout': options.timeout,
        'attestation': options.attestation,
        'excludeCredentials': [
            {
                'id': list(cred.id),
                'type': cred.type
            } for cred in options.exclude_credentials
        ],
        'authenticatorSelection': {
            'authenticatorAttachment': 'cross-platform',  # Only external devices
            'userVerification': options.authenticator_selection.user_verification if options.authenticator_selection else 'preferred'
        }
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def register_complete(request):
    """Verify WebAuthn registration response"""
    user = request.user
    credential_data = request.data.get('credential')
    key_name = request.data.get('keyName', 'Security Key')
    
    if not credential_data:
        return Response({'error': 'Missing credential data'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Extract challenge from stored challenges (get latest for this user)
    try:
        challenge_obj = WebAuthnChallenge.objects.filter(
            user=user,
            challenge_type='register',
            expires_at__gt=timezone.now()
        ).latest('created_at')
        challenge = challenge_obj.challenge
    except WebAuthnChallenge.DoesNotExist:
        return Response({'error': 'No valid challenge found'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Convert arrays back to bytes for the verification
        raw_id = bytes(credential_data['rawId'])
        attestation_object = bytes(credential_data['response']['attestationObject'])
        client_data_json = bytes(credential_data['response']['clientDataJSON'])
        
        # Create a proper credential object for verification
        from webauthn.helpers.structs import AuthenticatorAttestationResponse, RegistrationCredential
        
        credential = RegistrationCredential(
            id=credential_data['id'],
            raw_id=raw_id,
            response=AuthenticatorAttestationResponse(
                client_data_json=client_data_json,
                attestation_object=attestation_object
            ),
            type=credential_data['type']
        )
        
        # Verify registration
        verification = verify_registration_response(
            credential=credential,
            expected_challenge=challenge.encode(),
            expected_origin=settings.WEBAUTHN_ORIGIN,
            expected_rp_id=settings.WEBAUTHN_RP_ID
        )
        
        # Save credential - if we got here without exception, verification was successful
        webauthn_credential = WebAuthnCredential.objects.create(
            user=user,
            credential_id=base64.b64encode(verification.credential_id).decode('utf-8'),
            public_key=base64.b64encode(verification.credential_public_key).decode('utf-8'),
            sign_count=verification.sign_count,
            name=key_name
        )
        
        # Delete used challenge
        challenge_obj.delete()
        
        serializer = WebAuthnCredentialSerializer(webauthn_credential)
        return Response({
            'verified': True,
            'credential': serializer.data
        })
    
    except Exception as e:
        return Response({'error': f'Registration failed: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def authenticate_begin(request):
    """Generate challenge for WebAuthn authentication"""
    user = request.user
    
    # Extract user ID from request
    user_id = request.data.get('userId')
    
    # Check if user has any credentials
    credentials = WebAuthnCredential.objects.filter(user=user)
    if not credentials.exists():
        return Response({'error': 'No WebAuthn credentials registered'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Generate challenge
    challenge = base64.urlsafe_b64encode(secrets.token_bytes(32)).decode('utf-8').rstrip('=')
    
    # Store challenge
    WebAuthnChallenge.objects.create(
        user=user,
        challenge=challenge,
        challenge_type='verify',
        expires_at=timezone.now() + timedelta(minutes=5)
    )
    
    # Generate authentication options
    allow_credentials = []
    for cred in credentials:
        try:
            credential_id = base64.b64decode(cred.credential_id + '==')
            allow_credentials.append({
                'id': list(credential_id),
                'type': 'public-key'
            })
        except Exception:
            continue
    
    return Response({
        'challenge': list(challenge.encode()),
        'timeout': 60000,
        'rpId': settings.WEBAUTHN_RP_ID,
        'allowCredentials': allow_credentials,
        'userVerification': 'preferred'
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def authenticate_complete(request):
    """Verify WebAuthn authentication response"""
    user = request.user
    assertion_data = request.data.get('assertion')
    
    if not assertion_data:
        return Response({'error': 'Missing assertion data'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Get challenge
    try:
        challenge_obj = WebAuthnChallenge.objects.filter(
            user=user,
            challenge_type='verify',
            expires_at__gt=timezone.now()
        ).latest('created_at')
        challenge = challenge_obj.challenge
    except WebAuthnChallenge.DoesNotExist:
        return Response({'error': 'No valid challenge found'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Get credential
    credential_id = assertion_data.get('id')
    if not credential_id:
        return Response({'error': 'Missing credential ID'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Find credential by base64 encoded ID
        credential_id_b64 = base64.b64encode(bytes(assertion_data['rawId'])).decode('utf-8')
        credential = WebAuthnCredential.objects.get(
            user=user,
            credential_id=credential_id_b64
        )
    except WebAuthnCredential.DoesNotExist:
        return Response({'error': 'Credential not found'}, status=status.HTTP_404_NOT_FOUND)
    
    try:
        # Convert arrays back to bytes
        raw_id = bytes(assertion_data['rawId'])
        authenticator_data = bytes(assertion_data['response']['authenticatorData'])
        client_data_json = bytes(assertion_data['response']['clientDataJSON'])
        signature = bytes(assertion_data['response']['signature'])
        user_handle = bytes(assertion_data['response']['userHandle']) if assertion_data['response'].get('userHandle') else None
        
        # Create proper assertion object
        from webauthn.helpers.structs import AuthenticatorAssertionResponse, AuthenticationCredential
        
        assertion = AuthenticationCredential(
            id=assertion_data['id'],
            raw_id=raw_id,
            response=AuthenticatorAssertionResponse(
                client_data_json=client_data_json,
                authenticator_data=authenticator_data,
                signature=signature,
                user_handle=user_handle
            ),
            type=assertion_data['type']
        )
        
        # Verify authentication
        verification = verify_authentication_response(
            credential=assertion,
            expected_challenge=challenge.encode(),
            expected_origin=settings.WEBAUTHN_ORIGIN,
            expected_rp_id=settings.WEBAUTHN_RP_ID,
            credential_public_key=base64.b64decode(credential.public_key),
            credential_current_sign_count=credential.sign_count
        )
        
        # Check if verification was successful (newer WebAuthn library structure)
        if hasattr(verification, 'verified') and verification.verified:
            verified = True
        elif hasattr(verification, 'verification_successful') and verification.verification_successful:
            verified = True
        elif verification:  # Some versions return the verification object directly
            verified = True
        else:
            verified = False
        
        if verified:
            # Update sign count and last used
            credential.sign_count = verification.new_sign_count
            credential.last_used_at = timezone.now()
            credential.save()
            
            # Delete used challenge
            challenge_obj.delete()
            
            # Set admin session variables for successful WebAuthn verification
            request.session['webauthn_verified'] = True
            request.session['webauthn_verified_at'] = timezone.now().isoformat()
            
            # Prepare response data
            response_data = {
                'verified': True,
                'message': 'Authentication successful'
            }
            
            # If there's an admin redirect URL, include it in response
            if 'admin_redirect_url' in request.session:
                response_data['redirect_url'] = request.session.pop('admin_redirect_url')
            
            return Response(response_data)
        else:
            return Response({'error': 'Authentication verification failed'}, status=status.HTTP_400_BAD_REQUEST)
    
    except Exception as e:
        return Response({'error': f'Authentication failed: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)