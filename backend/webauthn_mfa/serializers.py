from rest_framework import serializers
from .models import WebAuthnCredential

class WebAuthnCredentialSerializer(serializers.ModelSerializer):
    class Meta:
        model = WebAuthnCredential
        fields = [
            'id', 'name', 'created_at', 'last_used_at',
            'sign_count', 'device_type'
        ]
        read_only_fields = ['id', 'created_at', 'last_used_at', 'sign_count']