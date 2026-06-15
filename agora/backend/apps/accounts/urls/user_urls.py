from django.urls import path
from apps.accounts.views import (
    MyProfileView,
    ChangePasswordView,
    UserPublicProfileView,
    UserHistoryView,
    UserConversationsView,
    UserMessagesView,
)

urlpatterns = [
    path('me/', MyProfileView.as_view(), name='user-me'),
    path('me/change-password/', ChangePasswordView.as_view(), name='user-change-password'),
    path('me/history/', UserHistoryView.as_view(), name='user-history'),
    path('messages/', UserConversationsView.as_view(), name='user-conversations'),
    path('messages/<str:pseudonyme>/', UserMessagesView.as_view(), name='user-messages'),
    path('<str:pseudonyme>/', UserPublicProfileView.as_view(), name='user-public-profile'),
]
