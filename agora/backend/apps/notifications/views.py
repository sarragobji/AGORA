"""
L'Agora - Vues Notifications
"""
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import serializers
from apps.notifications.models import Notification
from apps.notifications.services import NotificationService


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'message', 'is_read', 'publication', 'created_at']
        read_only_fields = ['id', 'message', 'created_at']


class NotificationListView(generics.ListAPIView):
    """GET /api/v1/notifications/ — Liste des notifications de l'utilisateur connecté."""
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(utilisateur=self.request.user)

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        return Response({
            'success': True,
            'unread_count': NotificationService.unread_count(request.user),
            'data': response.data,
        })


class MarkAllReadView(APIView):
    """POST /api/v1/notifications/mark-all-read/ — Marquer tout comme lu."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        NotificationService.mark_all_read(request.user)
        return Response({'success': True, 'message': 'Toutes les notifications ont été lues.'})


class MarkOneReadView(APIView):
    """PATCH /api/v1/notifications/<id>/read/ — Marquer une notification comme lue."""
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        try:
            notif = Notification.objects.get(pk=pk, utilisateur=request.user)
            notif.is_read = True
            notif.save(update_fields=['is_read'])
            return Response({'success': True})
        except Notification.DoesNotExist:
            return Response({'success': False}, status=status.HTTP_404_NOT_FOUND)
