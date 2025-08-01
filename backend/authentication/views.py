from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
import hmac
import hashlib
from django.conf import settings
from django.contrib.auth import get_user_model
from .serializers import UserSerializer

User = get_user_model()

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def clerk_webhook_sync_user(request):
    """Webhook endpoint for Clerk user events"""
    # Verify webhook signature
    signature = request.META.get('HTTP_SVIX_SIGNATURE')
    if not verify_webhook_signature(request.body, signature):
        return Response({'error': 'Invalid signature'}, status=status.HTTP_401_UNAUTHORIZED)
    
    event_type = request.data.get('type')
    data = request.data.get('data')
    
    if event_type == 'user.created' or event_type == 'user.updated':
        clerk_id = data.get('id')
        email = data.get('email_addresses', [{}])[0].get('email_address', '')
        
        user_data = {
            'clerk_id': clerk_id,
            'email': email,
            'first_name': data.get('first_name', ''),
            'last_name': data.get('last_name', ''),
            'profile_image_url': data.get('profile_image_url', ''),
        }
        
        user, created = User.objects.update_or_create(
            clerk_id=clerk_id,
            defaults=user_data
        )
        
        return Response({'status': 'success', 'created': created})
    
    elif event_type == 'user.deleted':
        clerk_id = data.get('id')
        User.objects.filter(clerk_id=clerk_id).update(is_active=False)
        return Response({'status': 'success'})
    
    return Response({'status': 'ignored'})

def verify_webhook_signature(payload, signature):
    """Verify Clerk webhook signature"""
    expected_signature = hmac.new(
        settings.CLERK_WEBHOOK_SECRET.encode(),
        payload,
        hashlib.sha256
    ).hexdigest()
    
    return hmac.compare_digest(expected_signature, signature)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):
    """Get current authenticated user"""
    serializer = UserSerializer(request.user)
    return Response(serializer.data)