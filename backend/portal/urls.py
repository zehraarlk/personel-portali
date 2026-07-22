from django.urls import path
from .views import home_dashboard, site_icons, sizden_gelenler_list
from .profile_views import (
    profile_me,
    profile_sessions,
    profile_change_email,
    profile_change_password,
)

urlpatterns = [
    path('home/', home_dashboard, name='home-dashboard'),
    path('icons/', site_icons, name='site-icons'),
    path('profile/', profile_me, name='profile-me'),
    path('profile/sessions/', profile_sessions, name='profile-sessions'),
    path('profile/change-email/', profile_change_email, name='profile-change-email'),
    path('profile/change-password/', profile_change_password, name='profile-change-password'),
    path('sizden-gelenler/', sizden_gelenler_list, name='sizden-gelenler'),
]
