from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'clerk_id', 'email', 'first_name', 'last_name',
            'is_active', 'is_staff', 'created_at', 'updated_at',
            'profile_image_url', 'phone_number'
        ]
        read_only_fields = ['id', 'clerk_id', 'created_at', 'updated_at']