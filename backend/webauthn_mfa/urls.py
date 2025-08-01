from django.urls import path
from . import views

urlpatterns = [
    path('register/begin', views.register_begin, name='webauthn-register-begin'),
    path('register/complete', views.register_complete, name='webauthn-register-complete'),
    path('authenticate/begin', views.authenticate_begin, name='webauthn-authenticate-begin'),
    path('authenticate/complete', views.authenticate_complete, name='webauthn-authenticate-complete'),
    path('user/<str:user_id>/devices', views.user_devices, name='webauthn-user-devices'),
    path('device/<int:device_id>', views.delete_device, name='webauthn-delete-device'),
]