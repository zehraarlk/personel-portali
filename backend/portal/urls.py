from django.urls import path
from .views import home_dashboard

urlpatterns = [
    path('home/', home_dashboard, name='home-dashboard'),
]
