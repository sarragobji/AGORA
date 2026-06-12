"""
L'Agora - URL Principal
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/auth/', include('apps.accounts.urls.auth_urls')),
    path('api/v1/users/', include('apps.accounts.urls.user_urls')),
    path('api/v1/', include('apps.publications.urls')),
    path('api/v1/notifications/', include('apps.notifications.urls')),
    path('api/v1/admin/', include('apps.administration.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
