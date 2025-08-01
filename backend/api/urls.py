from django.urls import path, include

urlpatterns = [
    path('auth/', include('authentication.urls')),
    path('webauthn/', include('webauthn_mfa.urls')),
]