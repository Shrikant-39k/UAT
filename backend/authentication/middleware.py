from django.utils.functional import SimpleLazyObject
from django.contrib.auth import get_user_model
from django.shortcuts import redirect
from django.urls import reverse
from django.utils import timezone
from django.contrib import messages
from datetime import timedelta
import re
from .backends import ClerkAuthentication

User = get_user_model()

class ClerkAuthenticationMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        self.auth_backend = ClerkAuthentication()
    
    def __call__(self, request):
        request.user = SimpleLazyObject(lambda: self.get_user(request))
        response = self.get_response(request)
        return response
    
    def get_user(self, request):
        try:
            user_auth_tuple = self.auth_backend.authenticate(request)
            if user_auth_tuple:
                return user_auth_tuple[0]
        except:
            pass
        
        from django.contrib.auth.models import AnonymousUser
        return AnonymousUser()


class AdminWebAuthnMiddleware:
    """Middleware to handle admin authentication with Clerk + WebAuthn"""
    
    def __init__(self, get_response):
        self.get_response = get_response
        # Define admin URL patterns that require authentication
        self.admin_patterns = [
            r'^/admin/$',  # Admin index
            r'^/admin/(?!login|clerk-auth-complete|webauthn-verify).*',  # All admin URLs except auth endpoints
        ]
        
    def __call__(self, request):
        # Check if this is an admin request that needs authentication
        if self._is_admin_request(request):
            auth_response = self._check_admin_authentication(request)
            if auth_response:
                return auth_response
        
        response = self.get_response(request)
        return response
    
    def _is_admin_request(self, request):
        """Check if this request is for an admin page that requires auth"""
        for pattern in self.admin_patterns:
            if re.match(pattern, request.path):
                return True
        return False
    
    def _check_admin_authentication(self, request):
        """Check authentication and return redirect response if needed"""
        
        # Step 1: Check if user is authenticated via Clerk
        if not request.user.is_authenticated:
            return redirect('admin:login')
        
        # Step 2: Check if user is staff
        if not request.user.is_staff:
            messages.error(request, "You do not have permission to access the admin panel.")
            return redirect('admin:login')
        
        # Step 3: Check WebAuthn verification
        webauthn_verified = request.session.get('webauthn_verified', False)
        webauthn_verified_at = request.session.get('webauthn_verified_at')
        
        # Check if WebAuthn verification is valid and not expired (30 minutes)
        if webauthn_verified and webauthn_verified_at:
            try:
                verified_time = timezone.datetime.fromisoformat(webauthn_verified_at)
                if timezone.now() - verified_time < timedelta(minutes=30):
                    # Valid verification, allow access
                    return None
            except (ValueError, TypeError):
                # Invalid timestamp, clear session
                pass
        
        # WebAuthn verification needed or expired
        # Clear expired verification
        if 'webauthn_verified' in request.session:
            del request.session['webauthn_verified']
        if 'webauthn_verified_at' in request.session:
            del request.session['webauthn_verified_at']
        
        # Store the intended URL for redirect after verification
        request.session['admin_redirect_url'] = request.get_full_path()
        
        # Redirect to WebAuthn verification
        return redirect('admin:webauthn_verify')