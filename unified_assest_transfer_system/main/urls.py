from django.urls import path
from .views import CfeView

urlpatterns = [
    # path('', LoginView.as_view(), name='login'),
    path('cfe/', CfeView.as_view(), name='cfe'),
    
]
