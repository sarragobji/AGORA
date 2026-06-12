"""
L'Agora - Service Notifications
"""
from apps.notifications.models import Notification


class NotificationService:
    @staticmethod
    def create(utilisateur, message, publication=None):
        """Créer une notification pour un utilisateur."""
        return Notification.objects.create(
            utilisateur=utilisateur,
            message=message,
            publication=publication,
        )

    @staticmethod
    def mark_all_read(utilisateur):
        """Marquer toutes les notifications d'un utilisateur comme lues."""
        Notification.objects.filter(utilisateur=utilisateur, is_read=False).update(is_read=True)

    @staticmethod
    def unread_count(utilisateur):
        """Nombre de notifications non lues."""
        return Notification.objects.filter(utilisateur=utilisateur, is_read=False).count()
