from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta
import secrets
import base64
from webauthn import generate_registration_options, verify_registration_response, generate_authentication_options, verify_authentication_response
from webauthn.helpers.structs import PublicKeyCredentialDescriptor
from django.conf import settings
from .models import WebAuthnCredential, WebAuthnChallenge
from .serializers import WebAuthnCredentialSerializer

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def register_begin(request):
    """Generate challenge for WebAuthn registration"""
    user = request.user
    
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
        PublicKeyCredentialDescriptor(id=base64.b64decode(cred.credential_id))
        for cred in existing_credentials
    ]
    
    # Generate registration options
    options = generate_registration_options(
        rp_id=settings.WEBAUTHN_RP_ID,
        rp_name=settings.WEBAUTHN_RP_NAME,
        user_id=str(user.id).encode(),
        user_name=user.email,
        user_display_name=f"{user.first_name} {user.last_name}".strip() or user.email,
        challenge=challenge.encode(),
        exclude_credentials=exclude_credentials,
        authenticator_selection={
            'authenticator_attachment': 'cross-platform',
            'user_verification': 'preferred'
        }
    )
    
    return Response({
        'options': options,
        'challenge': challenge
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def register_complete(request):
    """Verify WebAuthn registration response"""
    user = request.user
    credential_response = request.data.get('credential')
    challenge = request.data.get('challenge')
    name = request.data.get('name', 'Security Key')
    
    # Verify challenge
    try:
        challenge_obj = WebAuthnChallenge.objects.get(
            user=user,
            challenge=challenge,
            challenge_type='register',
            expires_at__gt=timezone.now()
        )
    except WebAuthnChallenge.DoesNotExist:
        return Response({'error': 'Invalid or expired challenge'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Verify registration
        verification = verify_registration_response(
            credential=credential_response,
            expected_challenge=challenge.encode(),
            expected_origin=settings.WEBAUTHN_ORIGIN,
            expected_rp_id=settings.WEBAUTHN_RP_ID
        )
        
        if verification.verified:
            # Save credential
            credential = WebAuthnCredential.objects.create(
                user=user,
                credential_id=base64.b64encode(verification.credential_id).decode('utf-8'),
                public_key=base64.b64encode(verification.credential_public_key).decode('utf-8'),
                sign_count=verification.sign_count,
                name=name
            )
            
            # Delete used challenge
            challenge_obj.delete()
            
            serializer = WebAuthnCredentialSerializer(credential)
            return Response({
                'verified': True,
                'credential': serializer.data
            })
        else:
            return Response({'error': 'Verification failed'}, status=status.HTTP_400_BAD_REQUEST)
    
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_begin(request):
    """Generate challenge for WebAuthn verification"""
    user = request.user
    
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
    allow_credentials = [
        PublicKeyCredentialDescriptor(id=base64.b64decode(cred.credential_id))
        for cred in credentials
    ]
    
    options = generate_authentication_options(
        rp_id=settings.WEBAUTHN_RP_ID,
        challenge=challenge.encode(),
        allow_credentials=allow_credentials,
        user_verification='preferred'
    )
    
    return Response({
        'options': options,
        'challenge': challenge
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_complete(request):
    """Verify WebAuthn authentication response"""
    user = request.user
    credential_response = request.data.get('credential')
    challenge = request.data.get('challenge')
    
    # Verify challenge
    try:
        challenge_obj = WebAuthnChallenge.objects.get(
            user=user,
            challenge=challenge,
            challenge_type='verify',
            expires_at__gt=timezone.now()
        )
    except WebAuthnChallenge.DoesNotExist:
        return Response({'error': 'Invalid or expired challenge'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Get credential
    credential_id = credential_response.get('id')
    try:
        credential = WebAuthnCredential.objects.get(
            user=user,
            credential_id=credential_id
        )
    except WebAuthnCredential.DoesNotExist:
        return Response({'error': 'Credential not found'}, status=status.HTTP_404_NOT_FOUND)
    
    try:
        # Verify authentication
        verification = verify_authentication_response(
            credential=credential_response,
            expected_challenge=challenge.encode(),
            expected_origin=settings.WEBAUTHN_ORIGIN,
            expected_rp_id=settings.WEBAUTHN_RP_ID,
            credential_public_key=base64.b64decode(credential.public_key),
            credential_current_sign_count=credential.sign_count
        )
        
        if verification.verified:
            # Update sign count and last used
            credential.sign_count = verification.new_sign_count
            credential.last_used_at = timezone.now()
            credential.save()
            
            # Delete used challenge
            challenge_obj.delete()
            
            # For admin access, create a session
            if request.data.get('for_admin_access'):
                from django.contrib.auth import login
                login(request, user, backend='django.contrib.auth.backends.ModelBackend')
            
            return Response({
                'verified': True,
                'message': 'Authentication successful'
            })
        else:
            return Response({'error': 'Verification failed'}, status=status.HTTP_400_BAD_REQUEST)
    
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)