from datetime import timezone
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth import get_user_model
from django.http import JsonResponse
from django.urls import path, reverse
from django.shortcuts import redirect
from django.contrib.auth.views import LogoutView
from django.contrib import messages
from django.utils.decorators import method_decorator
from django.views.decorators.cache import never_cache
from django.contrib.admin.views.decorators import staff_member_required
from functools import wraps

User = get_user_model()

def webauthn_required(view_func):
    """Decorator to require WebAuthn verification for admin views"""
    @wraps(view_func)
    def wrapped_view(request, *args, **kwargs):
        # Check if user has verified with WebAuthn in this session
        if not request.session.get('webauthn_verified'):
            # Store the intended URL
            request.session['admin_redirect_url'] = request.get_full_path()
            return redirect('admin:webauthn_verify')
        return view_func(request, *args, **kwargs)
    return wrapped_view

class WebAuthnAdminSite(admin.AdminSite):
    """Custom admin site that requires WebAuthn verification"""
    
    def has_permission(self, request):
        """Check if user has permission to view admin"""
        # First check basic permission
        has_perm = super().has_permission(request)
        if not has_perm:
            return False
        
        # For login page, don't require WebAuthn
        if request.path == reverse('admin:login'):
            return True
        
        # Check WebAuthn verification
        return request.session.get('webauthn_verified', False)
    
    def login(self, request, extra_context=None):
        """Override login to use Clerk authentication"""
        # If user is already authenticated via Clerk
        if request.user.is_authenticated and request.user.is_staff:
            # Redirect to WebAuthn verification
            return redirect('admin:webauthn_verify')
        
        # Otherwise, redirect to main app login
        return redirect('/sign-in')
    
    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('webauthn-verify/', self.admin_view(self.webauthn_verify_view), name='webauthn_verify'),
            path('webauthn-verify-complete/', self.admin_view(self.webauthn_verify_complete), name='webauthn_verify_complete'),
        ]
        return custom_urls + urls
    
    def webauthn_verify_view(self, request):
        """WebAuthn verification page for admin access"""
        from django.shortcuts import render
        from webauthn_mfa.models import WebAuthnCredential
        
        # Check if user has any WebAuthn credentials
        has_credentials = WebAuthnCredential.objects.filter(user=request.user).exists()
        
        if not has_credentials:
            messages.error(request, "You need to set up a security key before accessing the admin panel.")
            return redirect('/security')
        
        context = {
            'title': 'Verify Your Identity',
            'site_header': self.site_header,
            'has_permission': True,
        }
        
        return render(request, 'admin/webauthn_verify.html', context)
    
    def webauthn_verify_complete(self, request):
        """Handle WebAuthn verification completion"""
        if request.method == 'POST':
            # This will be called via AJAX after successful WebAuthn verification
            request.session['webauthn_verified'] = True
            request.session['webauthn_verified_at'] = timezone.now().isoformat()
            
            # Get redirect URL or default to admin index
            redirect_url = request.session.pop('admin_redirect_url', reverse('admin:index'))
            
            return JsonResponse({'success': True, 'redirect_url': redirect_url})
        
        return JsonResponse({'success': False, 'error': 'Invalid request'})

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