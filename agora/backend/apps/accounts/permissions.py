"""
L'Agora - Permissions personnalisées
"""
from rest_framework import permissions


class IsOwnerOrAdmin(permissions.BasePermission):
    """Autorise uniquement le propriétaire ou un administrateur."""

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        if hasattr(obj, 'auteur'):
            return obj.auteur == request.user or request.user.is_moderator
        return obj == request.user or request.user.is_admin


class IsAdminUser(permissions.BasePermission):
    """Autorise uniquement les administrateurs."""

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_admin


class IsModeratorOrAdmin(permissions.BasePermission):
    """Autorise les modérateurs et les administrateurs."""

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_moderator
