"""
L'Agora - Serializers Accounts
"""
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.password_validation import validate_password
from apps.accounts.models import User, Role, Message


class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ['id', 'role_name']


class UserPublicSerializer(serializers.ModelSerializer):
    """Profil public minimal — exposé dans les publications/commentaires."""
    role = RoleSerializer(read_only=True)
    photo_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'pseudonyme', 'photo_url',
            'points_solidarite', 'badge', 'role', 'created_at',
        ]

    def get_photo_url(self, obj):
        request = self.context.get('request')
        if obj.photo and request:
            return request.build_absolute_uri(obj.photo.url)
        return None


class UserDetailSerializer(serializers.ModelSerializer):
    """Profil complet — exposé pour le propriétaire et les admins."""
    role = RoleSerializer(read_only=True)
    photo_url = serializers.SerializerMethodField()
    publications_count = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'pseudonyme', 'first_name', 'last_name',
            'email', 'photo', 'photo_url', 'bio',
            'points_solidarite', 'badge', 'is_active', 'role',
            'publications_count', 'comments_count',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'points_solidarite', 'is_active', 'created_at', 'updated_at']
        extra_kwargs = {'photo': {'write_only': True}}

    def get_photo_url(self, obj):
        request = self.context.get('request')
        if obj.photo and request:
            return request.build_absolute_uri(obj.photo.url)
        return None

    def get_publications_count(self, obj):
        return obj.publications.count()

    def get_comments_count(self, obj):
        return obj.comments.count()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True, required=True, validators=[validate_password]
    )
    password_confirm = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = [
            'pseudonyme', 'first_name', 'last_name',
            'email', 'password', 'password_confirm',
        ]

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError(
                {'password': 'Les mots de passe ne correspondent pas.'}
            )
        return attrs

    def validate_pseudonyme(self, value):
        if User.objects.filter(pseudonyme__iexact=value).exists():
            raise serializers.ValidationError('Ce pseudonyme est déjà utilisé.')
        return value

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        role, _ = Role.objects.get_or_create(role_name=Role.STUDENT)
        user = User.objects.create_user(
            **validated_data,
            role=role,
        )
        return user


class UpdateProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'bio', 'photo']

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])
    new_password_confirm = serializers.CharField(required=True)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError(
                {'new_password': 'Les mots de passe ne correspondent pas.'}
            )
        return attrs

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Mot de passe actuel incorrect.')
        return value


class MessageSerializer(serializers.ModelSerializer):
    sender = UserPublicSerializer(read_only=True)
    recipient = UserPublicSerializer(read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'sender', 'recipient', 'contenu', 'is_read', 'created_at', 'updated_at']
        read_only_fields = ['id', 'sender', 'recipient', 'is_read', 'created_at', 'updated_at']


class MessageCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['contenu']


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """JWT enrichi avec les informations utilisateur."""

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['pseudonyme'] = user.pseudonyme
        token['email'] = user.email
        token['role'] = user.role.role_name if user.role else None
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user
        data['user'] = {
            'id': user.id,
            'pseudonyme': user.pseudonyme,
            'email': user.email,
            'role': user.role.role_name if user.role else None,
            'points_solidarite': user.points_solidarite,
            'badge': user.badge,
        }
        return data
