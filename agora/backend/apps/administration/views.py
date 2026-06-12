"""
L'Agora - Vues Administration
"""
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Count, Q
from django.utils import timezone
from datetime import timedelta

from apps.accounts.models import User
from apps.publications.models import Publication, Signalement, Commentaire, Reaction
from apps.accounts.serializers import UserDetailSerializer
from apps.publications.serializers import PublicationListSerializer, SignalementSerializer
from apps.accounts.permissions import IsAdminUser, IsModeratorOrAdmin
from apps.notifications.services import NotificationService


class AdminStatsView(APIView):
    """GET /api/v1/admin/stats/ — Tableau de bord statistiques."""
    permission_classes = [IsAdminUser]

    def get(self, request):
        now = timezone.now()
        last_7d = now - timedelta(days=7)
        last_30d = now - timedelta(days=30)

        stats = {
            'users': {
                'total': User.objects.count(),
                'active': User.objects.filter(is_active=True).count(),
                'new_this_week': User.objects.filter(created_at__gte=last_7d).count(),
                'new_this_month': User.objects.filter(created_at__gte=last_30d).count(),
            },
            'publications': {
                'total': Publication.objects.count(),
                'active': Publication.objects.filter(is_active=True).count(),
                'anonymous': Publication.objects.filter(is_anonymous=True).count(),
                'new_this_week': Publication.objects.filter(created_at__gte=last_7d).count(),
            },
            'comments': {
                'total': Commentaire.objects.count(),
                'new_this_week': Commentaire.objects.filter(created_at__gte=last_7d).count(),
            },
            'reactions': {
                'total': Reaction.objects.count(),
            },
            'signalements': {
                'total': Signalement.objects.count(),
                'en_attente': Signalement.objects.filter(statut='en_attente').count(),
                'valides': Signalement.objects.filter(statut='valide').count(),
            },
        }
        return Response({'success': True, 'data': stats})


class AdminUserListView(generics.ListAPIView):
    """GET /api/v1/admin/users/ — Gestion des utilisateurs."""
    permission_classes = [IsAdminUser]
    serializer_class = UserDetailSerializer
    search_fields = ['pseudonyme', 'email', 'first_name', 'last_name']

    def get_queryset(self):
        qs = User.objects.select_related('role').order_by('-created_at')
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            qs = qs.filter(is_active=is_active.lower() == 'true')
        return qs


class AdminUserDetailView(APIView):
    """PATCH /api/v1/admin/users/<id>/ — Activer/désactiver un compte."""
    permission_classes = [IsAdminUser]

    def patch(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({'success': False, 'message': 'Utilisateur introuvable.'}, status=404)

        action = request.data.get('action')

        if action == 'activate':
            user.is_active = True
            user.save(update_fields=['is_active'])
            NotificationService.create(
                utilisateur=user,
                message='Votre compte a été activé par un administrateur.',
            )
            return Response({'success': True, 'message': 'Compte activé.'})

        elif action == 'deactivate':
            if user.is_admin:
                return Response(
                    {'success': False, 'message': 'Impossible de désactiver un administrateur.'},
                    status=403
                )
            user.is_active = False
            user.save(update_fields=['is_active'])
            return Response({'success': True, 'message': 'Compte désactivé.'})

        return Response({'success': False, 'message': 'Action invalide.'}, status=400)


class AdminPublicationListView(generics.ListAPIView):
    """GET /api/v1/admin/publications/ — Toutes les publications."""
    permission_classes = [IsModeratorOrAdmin]
    serializer_class = PublicationListSerializer

    def get_queryset(self):
        return Publication.objects.select_related(
            'auteur', 'categorie'
        ).prefetch_related('tags', 'reactions', 'comments').order_by('-created_at')


class AdminPublicationDeleteView(APIView):
    """DELETE /api/v1/admin/publications/<id>/ — Supprimer une publication."""
    permission_classes = [IsModeratorOrAdmin]

    def delete(self, request, pk):
        try:
            pub = Publication.objects.get(pk=pk)
        except Publication.DoesNotExist:
            return Response({'success': False, 'message': 'Publication introuvable.'}, status=404)

        pub.is_active = False
        pub.save(update_fields=['is_active'])

        NotificationService.create(
            utilisateur=pub.auteur,
            message=f'Votre publication "{pub.titre}" a été supprimée par un modérateur.',
            publication=pub,
        )

        return Response({'success': True, 'message': 'Publication désactivée.'})


class AdminSignalementListView(generics.ListAPIView):
    """GET /api/v1/admin/signalements/ — Liste des signalements."""
    permission_classes = [IsModeratorOrAdmin]
    serializer_class = SignalementSerializer

    def get_queryset(self):
        qs = Signalement.objects.select_related(
            'publication', 'utilisateur', 'traite_par'
        ).order_by('-created_at')
        statut = self.request.query_params.get('statut', 'en_attente')
        if statut:
            qs = qs.filter(statut=statut)
        return qs


class AdminSignalementActionView(APIView):
    """PATCH /api/v1/admin/signalements/<id>/ — Valider/rejeter un signalement."""
    permission_classes = [IsModeratorOrAdmin]

    def patch(self, request, pk):
        try:
            signalement = Signalement.objects.select_related(
                'publication__auteur', 'utilisateur'
            ).get(pk=pk)
        except Signalement.DoesNotExist:
            return Response({'success': False, 'message': 'Signalement introuvable.'}, status=404)

        action = request.data.get('action')

        if action == 'valider':
            signalement.statut = Signalement.VALIDE
            signalement.traite_par = request.user
            signalement.save()

            # Désactiver la publication
            pub = signalement.publication
            pub.is_active = False
            pub.save(update_fields=['is_active'])

            NotificationService.create(
                utilisateur=pub.auteur,
                message=f'Votre publication "{pub.titre}" a été retirée suite à un signalement.',
            )
            return Response({'success': True, 'message': 'Signalement validé, publication retirée.'})

        elif action == 'rejeter':
            signalement.statut = Signalement.REJETE
            signalement.traite_par = request.user
            signalement.save()
            return Response({'success': True, 'message': 'Signalement rejeté.'})

        return Response({'success': False, 'message': 'Action invalide.'}, status=400)
