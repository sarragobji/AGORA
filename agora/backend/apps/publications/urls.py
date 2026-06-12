"""
L'Agora - Routes Publications
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_nested.routers import NestedSimpleRouter
from apps.publications.views import (
    CategoryViewSet, TagViewSet,
    PublicationViewSet, CommentaireViewSet,
)

router = DefaultRouter()
router.register('categories', CategoryViewSet, basename='category')
router.register('tags', TagViewSet, basename='tag')
router.register('publications', PublicationViewSet, basename='publication')

# Router imbriqué pour les commentaires
publications_router = NestedSimpleRouter(router, 'publications', lookup='publication')
publications_router.register('comments', CommentaireViewSet, basename='publication-comments')

urlpatterns = [
    path('', include(router.urls)),
    path('', include(publications_router.urls)),
]
