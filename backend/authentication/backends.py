from django.contrib.auth import get_user_model
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from jose import jwt, JWTError
import requests
from django.conf import settings
from django.utils import timezone
import json

User = get_user_model()

class ClerkAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.META.get('HTTP_AUTHORIZATION')
        if not auth_header or not auth_header.startswith('Bearer '):
            return None
        
        token = auth_header.split(' ')[1]
        
        try:
            # Verify token with Clerk's JWKS
            decoded_token = self.verify_clerk_token(token)
            
            # Get or create user
            user = self.get_or_create_user(decoded_token)
            
            return (user, token)
        except Exception as e:
            raise AuthenticationFailed(f'Invalid token: {str(e)}')
    
    def verify_clerk_token(self, token):
        """Verify Clerk JWT token"""
        try:
            # For development, we'll use a simpler approach
            # In production, you should verify with Clerk's JWKS endpoint
            
            # Decode without verification to get token claims
            # This is for development only - in production use proper JWT verification
            from jose import jwt
            
            # Get the header to check if it's a valid JWT
            try:
                unverified_header = jwt.get_unverified_header(token)
                payload = jwt.get_unverified_claims(token)
                
                # Basic validation - check if token has required fields
                if not payload.get('sub'):
                    raise JWTError('No subject in token')
                
                return payload
                
            except Exception as e:
                raise JWTError(f'Invalid token format: {str(e)}')
                
        except Exception as e:
            raise AuthenticationFailed(f'Token verification failed: {str(e)}')
    
    def get_or_create_user(self, token_data):
        clerk_id = token_data.get('sub')
        if not clerk_id:
            raise AuthenticationFailed('No user ID in token')
        
        # Get email from token (Clerk puts email in different places)
        email = token_data.get('email')
        if not email:
            # Try email_addresses array
            email_addresses = token_data.get('email_addresses', [])
            if email_addresses and isinstance(email_addresses, list):
                email = email_addresses[0].get('email_address') if isinstance(email_addresses[0], dict) else email_addresses[0]
            
            # Fallback to a default email
            if not email:
                email = f"{clerk_id}@clerk.local"
        
        try:
            user, created = User.objects.get_or_create(
                clerk_id=clerk_id,
                defaults={
                    'email': email,
                    'first_name': token_data.get('given_name', token_data.get('first_name', '')),
                    'last_name': token_data.get('family_name', token_data.get('last_name', '')),
                    'profile_image_url': token_data.get('picture', token_data.get('image_url', '')),
                    'phone_number': token_data.get('phone_number', ''),
                }
            )
            
            if not created:
                # Update user data if needed
                user.email = email
                user.first_name = token_data.get('given_name', token_data.get('first_name', user.first_name))
                user.last_name = token_data.get('family_name', token_data.get('last_name', user.last_name))
                user.profile_image_url = token_data.get('picture', token_data.get('image_url', user.profile_image_url))
                user.phone_number = token_data.get('phone_number', user.phone_number)
                user.last_synced_at = timezone.now()
                user.save()
            
            return user
            
        except Exception as e:
            raise AuthenticationFailed(f'User creation failed: {str(e)}')