from django.http import JsonResponse
from django.utils import timezone
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth import get_user_model
from django.urls import path, reverse
from django.shortcuts import redirect, render
from django.contrib import messages
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from django.utils.decorators import method_decorator
from clerk_backend_api import Clerk

clerk = Clerk(
    bearer_auth=settings.CLERK_SECRET_KEY,
)

User = get_user_model()

class WebAuthnAdminSite(admin.AdminSite):
    """Simplified admin site - authentication handled by middleware"""
    site_header = 'UAT Administration'
    site_title = 'UAT Admin'
    index_title = 'Welcome to UAT Administration'
    
    def login(self, request, extra_context=None):
        """Show Clerk login page"""
        context = {
            'site_header': self.site_header,
            'has_permission': True,
            'CLERK_FRONTEND_API_KEY': getattr(settings, 'CLERK_FRONTEND_API_KEY', ''),
            'CLERK_FRONTEND_API_URL': getattr(settings, 'CLERK_FRONTEND_API_URL', ''),
        }
        
        # Check if Clerk settings are configured
        if not context['CLERK_FRONTEND_API_KEY'] or not context['CLERK_FRONTEND_API_URL']:
            messages.error(request, "Clerk authentication is not properly configured. Please contact your administrator.")
        
        return render(request, 'admin/clerk_login.html', context)
    
    def logout(self, request, extra_context=None):
        """Custom logout that cleans up WebAuthn session"""
        # Clean up WebAuthn verification session
        session_keys = ['webauthn_verified', 'webauthn_verified_at', 'admin_redirect_url']
        for key in session_keys:
            if key in request.session:
                del request.session[key]
        
        # Logout from clerk
        clerk.sessions.revoke(request.user)
        
        
        # Call parent logout
        return super().logout(request, extra_context)
    
    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('logout/', self.logout, name='logout'),
            path('webauthn-verify/', self.webauthn_verify_view, name='webauthn_verify'),
            path('clerk-auth-complete/', csrf_exempt(self.clerk_auth_complete), name='clerk_auth_complete'),
        ]
        return custom_urls + urls
    
    def clerk_auth_complete(self, request):
        """Handle completion of Clerk authentication"""
        if request.method == 'POST':
            if not request.user.is_authenticated:
                return JsonResponse({
                    'success': False, 
                    'error': 'not_authenticated',
                    'message': 'User authentication failed. Please try logging in again.'
                })
            
            if not request.user.is_staff:
                return JsonResponse({
                    'success': False, 
                    'error': 'not_staff',
                    'message': 'You do not have permission to access the admin panel.'
                })
            
            # Check if user has WebAuthn credentials
            from webauthn_mfa.models import WebAuthnCredential
            has_credentials = WebAuthnCredential.objects.filter(user=request.user.id).exists()
            
            if not has_credentials:
                return JsonResponse({
                    'success': False, 
                    'error': 'no_webauthn',
                    'message': 'You need to set up a security key before accessing the admin panel. Please contact your administrator.'
                })
            
            # User has credentials, redirect to WebAuthn verification
            return JsonResponse({
                'success': True, 
                'redirect_url': reverse('admin:webauthn_verify')
            })
        
        return JsonResponse({'success': False, 'error': 'Invalid request method'})
    
    def webauthn_verify_view(self, request):
        """WebAuthn verification page for admin access"""
        from webauthn_mfa.models import WebAuthnCredential
        
        # Check if user has WebAuthn credentials
        has_credentials = WebAuthnCredential.objects.filter(user=request.user.id).exists()
        
        if not has_credentials:
            messages.error(request, "You need to set up a security key before accessing the admin panel. Please contact your administrator.")
            context = {
                'title': 'Admin Access Denied',
                'site_header': self.site_header,
                'has_permission': True,
                'user': request.user,
                'show_contact_admin': True,
            }
            return render(request, 'admin/clerk_webauthn_setup.html', context)
        
        # User has credentials, show verification page
        context = {
            'title': 'Verify Your Identity',
            'site_header': self.site_header,
            'has_permission': True,
            'user': request.user,
        }
        
        return render(request, 'admin/webauthn_verify.html', context)

# Create custom admin site instance
admin_site = WebAuthnAdminSite(name='webauthn_admin')

# Custom User Admin
@admin.register(User, site=admin_site)
class UserAdmin(BaseUserAdmin):
    list_display = ('email', 'first_name', 'last_name', 'is_staff', 'is_active', 'created_at')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'created_at')
    fieldsets = (
        (None, {'fields': ('clerk_id', 'email', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'profile_image_url', 'phone_number')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'created_at', 'updated_at', 'last_synced_at')}),
    )
    readonly_fields = ('clerk_id', 'created_at', 'updated_at', 'last_synced_at')
    search_fields = ('email', 'first_name', 'last_name', 'clerk_id')
    ordering = ('-created_at',)
    
    def has_add_permission(self, request):
        # Users should only be created through Clerk
        return False

# Register WebAuthn models
from webauthn_mfa.models import WebAuthnCredential, WebAuthnChallenge

@admin.register(WebAuthnCredential, site=admin_site)
class WebAuthnCredentialAdmin(admin.ModelAdmin):
    list_display = ('user', 'name', 'created_at', 'last_used_at', 'sign_count')
    list_filter = ('created_at', 'last_used_at')
    search_fields = ('user__email', 'name')
    readonly_fields = ('credential_id', 'public_key', 'sign_count', 'created_at', 'last_used_at')

@admin.register(WebAuthnChallenge, site=admin_site)
class WebAuthnChallengeAdmin(admin.ModelAdmin):
    list_display = ('user', 'challenge_type', 'created_at', 'expires_at')
    list_filter = ('challenge_type', 'created_at', 'expires_at')
    search_fields = ('user__email',)
    readonly_fields = ('challenge', 'created_at')