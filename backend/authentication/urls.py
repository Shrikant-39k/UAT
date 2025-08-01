from django.urls import path
from . import views

urlpatterns = [
    path('clerk/sync-user/', views.clerk_webhook_sync_user, name='clerk-sync-user'),
    path('me/', views.current_user, name='current-user'),
]