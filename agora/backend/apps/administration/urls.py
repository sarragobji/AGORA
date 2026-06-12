from django.urls import path
from apps.administration.views import (
    AdminStatsView,
    AdminUserListView,
    AdminUserDetailView,
    AdminPublicationListView,
    AdminPublicationDeleteView,
    AdminSignalementListView,
    AdminSignalementActionView,
)

urlpatterns = [
    path('stats/', AdminStatsView.as_view(), name='admin-stats'),
    path('users/', AdminUserListView.as_view(), name='admin-users'),
    path('users/<int:pk>/', AdminUserDetailView.as_view(), name='admin-user-detail'),
    path('publications/', AdminPublicationListView.as_view(), name='admin-publications'),
    path('publications/<int:pk>/', AdminPublicationDeleteView.as_view(), name='admin-pub-delete'),
    path('signalements/', AdminSignalementListView.as_view(), name='admin-signalements'),
    path('signalements/<int:pk>/', AdminSignalementActionView.as_view(), name='admin-signalement-action'),
]
