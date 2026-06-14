"""
L'Agora - Vues Accounts
"""
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.shortcuts import get_object_or_404

from apps.accounts.models import User
from apps.accounts.serializers import (
    RegisterSerializer,
    UserDetailSerializer,
    UserPublicSerializer,
    UpdateProfileSerializer,
    ChangePasswordSerializer,
    CustomTokenObtainPairSerializer,
)
from apps.accounts.permissions import IsOwnerOrAdmin


class RegisterView(generics.CreateAPIView):
    """POST /api/v1/auth/register/ — Inscription d'un nouvel étudiant."""
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Générer des tokens JWT directement
        refresh = RefreshToken.for_user(user)
        return Response({
            'success': True,
            'message': 'Compte créé avec succès. Bienvenue sur L\'Agora !',
            'data': {
                'user': UserDetailSerializer(user, context={'request': request}).data,
                'tokens': {
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                },
            },
        }, status=status.HTTP_201_CREATED)


class LoginView(TokenObtainPairView):
    """POST /api/v1/auth/login/ — Connexion avec JWT."""
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        response.data = {
            'success': True,
            'message': 'Connexion réussie.',
            'data': response.data,
        }
        return response


class LogoutView(APIView):
    """POST /api/v1/auth/logout/ — Invalidation du refresh token."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({
                'success': True,
                'message': 'Déconnexion réussie.',
            })
        except Exception:
            return Response({
                'success': False,
                'message': 'Token invalide ou déjà invalidé.',
            }, status=status.HTTP_400_BAD_REQUEST)


class MyProfileView(generics.RetrieveUpdateAPIView):
    """GET/PATCH /api/v1/users/me/ — Profil de l'utilisateur connecté."""
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method in ['PATCH', 'PUT']:
            return UpdateProfileSerializer
        return UserDetailSerializer

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return super().update(request, *args, **kwargs)


class ChangePasswordView(APIView):
    """POST /api/v1/users/me/change-password/ — Changement de mot de passe."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data['new_password'])
        request.user.save()
        return Response({
            'success': True,
            'message': 'Mot de passe modifié avec succès.',
        })


class UserPublicProfileView(generics.RetrieveAPIView):
    """GET /api/v1/users/<pseudonyme>/ — Profil public d'un utilisateur."""
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    serializer_class = UserPublicSerializer
    lookup_field = 'pseudonyme'
    queryset = User.objects.filter(is_active=True)


class UserHistoryView(APIView):
    """GET /api/v1/users/me/history/ — Historique des publications et commentaires."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        from apps.publications.serializers import PublicationListSerializer, CommentSerializer

        user = request.user
        publications = user.publications.filter(is_active=True).select_related(
            'categorie'
        ).prefetch_related('tags', 'reactions', 'comments').order_by('-created_at')[:20]

        comments = user.comments.select_related(
            'publication'
        ).order_by('-created_at')[:20]

        return Response({
            'success': True,
            'data': {
                'publications': PublicationListSerializer(
                    publications, many=True, context={'request': request}
                ).data,
                'comments': CommentSerializer(
                    comments, many=True, context={'request': request}
                ).data,
            },
        })
