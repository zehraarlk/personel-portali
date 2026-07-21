from django.contrib import admin
from django.urls import include, path

from .views import health, system_status

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health/', health, name='health'),
    path('api/system-status/', system_status, name='system-status'),
    path('api/', include('portal.urls')),
    path('api/', include('employees.urls')),
]
