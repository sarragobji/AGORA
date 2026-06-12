from django.urls import path
from apps.notifications.views import NotificationListView, MarkAllReadView, MarkOneReadView

urlpatterns = [
    path('', NotificationListView.as_view(), name='notification-list'),
    path('mark-all-read/', MarkAllReadView.as_view(), name='notification-mark-all-read'),
    path('<int:pk>/read/', MarkOneReadView.as_view(), name='notification-mark-read'),
]
