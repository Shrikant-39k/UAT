from django.utils.functional import SimpleLazyObject
from django.contrib.auth import get_user_model
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