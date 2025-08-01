from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.db import models
from django.utils import timezone

class UserManager(BaseUserManager):
    def create_user(self, clerk_id, email, **extra_fields):
        if not clerk_id:
            raise ValueError('Users must have a clerk_id')
        email = self.normalize_email(email)
        user = self.model(clerk_id=clerk_id, email=email, **extra_fields)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, clerk_id, email, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(clerk_id, email, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    clerk_id = models.CharField(max_length=255, unique=True, db_index=True)
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=150, blank=True)
    last_name = models.CharField(max_length=150, blank=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    last_synced_at = models.DateTimeField(null=True, blank=True)
    
    # Additional fields from Clerk
    profile_image_url = models.URLField(blank=True)
    phone_number = models.CharField(max_length=20, blank=True)
    
    objects = UserManager()
    
    USERNAME_FIELD = 'clerk_id'
    REQUIRED_FIELDS = ['email']
    
    class Meta:
        db_table = 'users'
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['created_at']),
        ]