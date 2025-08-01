from django.contrib.auth import get_user_model
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from clerk_backend_api import Clerk
from jose import jwt
import requests
from django.conf import settings

User = get_user_model()

class ClerkAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.META.get('HTTP_AUTHORIZATION')
        if not auth_header or not auth_header.startswith('Bearer '):
            return None
        
        token = auth_header.split(' ')[1]
        
        try:
            # Initialize Clerk client
            clerk.api_key = settings.CLERK_SECRET_KEY
            
            # Verify token with Clerk
            decoded_token = self.verify_clerk_token(token)
            
            # Get or create user
            user = self.get_or_create_user(decoded_token)
            
            return (user, token)
        except Exception as e:
            raise AuthenticationFailed(f'Invalid token: {str(e)}')
    
    def verify_clerk_token(self, token):
        # Get Clerk's public keys
        jwks_url = "https://api.clerk.com/v1/jwks"
        jwks = requests.get(jwks_url).json()
        
        # Verify and decode the token
        decoded = jwt.decode(
            token,
            jwks,
            algorithms=['RS256'],
            audience=settings.CLERK_PUBLISHABLE_KEY
        )
        
        return decoded
    
    def get_or_create_user(self, token_data):
        clerk_id = token_data.get('sub')
        email = token_data.get('email', '')
        
        user, created = User.objects.get_or_create(
            clerk_id=clerk_id,
            defaults={
                'email': email,
                'first_name': token_data.get('first_name', ''),
                'last_name': token_data.get('last_name', ''),
                'profile_image_url': token_data.get('profile_image_url', ''),
            }
        )
        
        if not created:
            # Update user data if needed
            user.email = email
            user.first_name = token_data.get('first_name', user.first_name)
            user.last_name = token_data.get('last_name', user.last_name)
            user.profile_image_url = token_data.get('profile_image_url', user.profile_image_url)
            user.save()
        
        return user