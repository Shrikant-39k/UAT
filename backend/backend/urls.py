from django.contrib import admin
from django.urls import path, include
from authentication.admin import admin_site

urlpatterns = [
    path('admin/', admin_site.urls),  # Use custom admin site
    path('api/v1/', include('api.urls')),  # Add this line
]