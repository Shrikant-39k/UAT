from django.urls import path
from . import views

urlpatterns = [
    path('register/begin/', views.register_begin, name='webauthn-register-begin'),
    path('register/complete/', views.register_complete, name='webauthn-register-complete'),
    path('verify/begin/', views.verify_begin, name='webauthn-verify-begin'),
    path('verify/complete/', views.verify_complete, name='webauthn-verify-complete'),
]