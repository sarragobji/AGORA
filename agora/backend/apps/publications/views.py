"""
L'Agora - Vues Publications
"""
from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Count, Q
from django.shortcuts import get_object_or_404

from apps.publications.models import (
    Category, Tag, Publication, Commentaire, Reaction, Signalement
)
from apps.publications.serializers import (
    CategorySerializer, TagSerializer,
    PublicationListSerializer, PublicationDetailSerializer, PublicationCreateSerializer,
    CommentSerializer, ReactionSerializer, SignalementSerializer,
)
from apps.publications.filters import PublicationFilter
from apps.accounts.permissions import IsOwnerOrAdmin, IsModeratorOrAdmin
from apps.notifications.services import NotificationService


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """GET /api/v1/categories/ — Liste et détail des catégories."""
    queryset = Category.objects.annotate(
        pubs_count=Count('publications', filter=Q(publications__is_active=True))
    ).order_by('nom')
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class TagViewSet(viewsets.ReadOnlyModelViewSet):
    """GET /api/v1/tags/ — Liste des tags."""
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['nom']


class PublicationViewSet(viewsets.ModelViewSet):
    """
    CRUD complet des publications.
    GET    /api/v1/publications/          — Feed principal
    POST   /api/v1/publications/          — Créer
    GET    /api/v1/publications/<id>/     — Détail
    PATCH  /api/v1/publications/<id>/     — Modifier
    DELETE /api/v1/publications/<id>/     — Supprimer
    """
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = PublicationFilter
    search_fields = ['titre', 'contenu', 'tags__nom']
    ordering_fields = ['created_at', 'views_count', 'reactions_count']
    ordering = ['-created_at']

    def get_queryset(self):
        qs = Publication.objects.filter(is_active=True).select_related(
            'auteur', 'categorie'
        ).prefetch_related(
            'tags', 'reactions', 'comments'
        ).annotate(
            reactions_total=Count('reactions', distinct=True),
            comments_total=Count('comments', distinct=True),
        )
        return qs

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return PublicationCreateSerializer
        if self.action == 'retrieve':
            return PublicationDetailSerializer
        return PublicationListSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticatedOrReadOnly()]
        if self.action in ['update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsOwnerOrAdmin()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        pub = serializer.save(auteur=self.request.user)
        # Attribuer des points de solidarité
        self.request.user.award_points(5)
        return pub

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.increment_views()
        serializer = self.get_serializer(instance)
        return Response({'success': True, 'data': serializer.data})

    @action(detail=True, methods=['post', 'delete'], permission_classes=[permissions.IsAuthenticated])
    def react(self, request, pk=None):
        """POST/DELETE /api/v1/publications/<id>/react/ — Ajouter/retirer une réaction."""
        publication = self.get_object()

        if request.method == 'DELETE':
            Reaction.objects.filter(
                publication=publication,
                utilisateur=request.user
            ).delete()
            return Response({'success': True, 'message': 'Réaction retirée.'})

        reaction_type = request.data.get('type')
        if reaction_type not in [r[0] for r in Reaction.TYPE_CHOICES]:
            return Response(
                {'success': False, 'message': 'Type de réaction invalide.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        reaction, created = Reaction.objects.update_or_create(
            publication=publication,
            utilisateur=request.user,
            defaults={'type': reaction_type}
        )

        if created and publication.auteur != request.user:
            NotificationService.create(
                utilisateur=publication.auteur,
                message=f"{request.user.pseudonyme} a réagi à votre publication \"{publication.titre}\".",
                publication=publication,
            )
            publication.auteur.award_points(1)

        return Response({
            'success': True,
            'message': 'Réaction enregistrée.',
            'data': ReactionSerializer(reaction).data,
        })

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def report(self, request, pk=None):
        """POST /api/v1/publications/<id>/report/ — Signaler une publication."""
        publication = self.get_object()

        if publication.auteur == request.user:
            return Response(
                {'success': False, 'message': 'Vous ne pouvez pas signaler votre propre publication.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = SignalementSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        signalement, created = Signalement.objects.get_or_create(
            publication=publication,
            utilisateur=request.user,
            defaults={
                'motif': serializer.validated_data['motif'],
                'description': serializer.validated_data.get('description', ''),
            }
        )

        if not created:
            return Response(
                {'success': False, 'message': 'Vous avez déjà signalé cette publication.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response({
            'success': True,
            'message': 'Signalement enregistré. Nos modérateurs examineront cela rapidement.',
        }, status=status.HTTP_201_CREATED)


class CommentaireViewSet(viewsets.ModelViewSet):
    """
    CRUD des commentaires d'une publication.
    Accessible via: /api/v1/publications/<pub_id>/comments/
    """
    serializer_class = CommentSerializer

    def get_permissions(self):
        if self.action in ['list']:
            return [permissions.IsAuthenticatedOrReadOnly()]
        if self.action in ['update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsOwnerOrAdmin()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        return Commentaire.objects.filter(
            publication_id=self.kwargs['publication_pk']
        ).select_related('auteur')

    def perform_create(self, serializer):
        publication = get_object_or_404(Publication, pk=self.kwargs['publication_pk'])
        comment = serializer.save(auteur=self.request.user, publication=publication)

        # Notification à l'auteur
        if publication.auteur != self.request.user:
            NotificationService.create(
                utilisateur=publication.auteur,
                message=f"{self.request.user.pseudonyme} a commenté votre publication \"{publication.titre}\".",
                publication=publication,
            )
            publication.auteur.award_points(2)

        return comment
