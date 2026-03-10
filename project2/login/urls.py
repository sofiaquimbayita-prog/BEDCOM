from django.urls import path
from login.views import LoginFormView, CustomLogoutView


urlpatterns = [
    
    path('login/', LoginFormView.as_view(), name='login'),
    
    
    path('logout/', CustomLogoutView.as_view(), name='logout'),
]