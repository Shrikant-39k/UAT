from django.db import models
from django.conf import settings
import json

class WebAuthnCredential(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='webauthn_credentials')
    credential_id = models.CharField(max_length=255, unique=True, db_index=True)
    public_key = models.TextField()
    sign_count = models.IntegerField(default=0)
    device_type = models.CharField(max_length=50, blank=True)
    name = models.CharField(max_length=100, default='Security Key')
    created_at = models.DateTimeField(auto_now_add=True)
    last_used_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'webauthn_credentials'
        ordering = ['-created_at']

class WebAuthnChallenge(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    challenge = models.CharField(max_length=255, unique=True)
    challenge_type = models.CharField(max_length=20, choices=[('register', 'Register'), ('verify', 'Verify')])
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    
    class Meta:
        db_table = 'webauthn_challenges'
        indexes = [
            models.Index(fields=['challenge']),
            models.Index(fields=['expires_at']),
        ]