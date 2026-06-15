"""
L'Agora - Serializers Publications
"""
from rest_framework import serializers
from apps.publications.models import (
    Category, Tag, Publication, Commentaire, Reaction, Signalement
)
from apps.accounts.serializers import UserPublicSerializer


class CategorySerializer(serializers.ModelSerializer):
    publications_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'nom', 'description', 'couleur', 'icone', 'publications_count']

    def get_publications_count(self, obj):
        return obj.publications.filter(is_active=True).count()


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'nom']


class ReactionSummarySerializer(serializers.Serializer):
    """Résumé des réactions groupées par type."""
    like = serializers.IntegerField(default=0)
    love = serializers.IntegerField(default=0)
    support = serializers.IntegerField(default=0)
    total = serializers.IntegerField(default=0)
    user_reaction = serializers.CharField(allow_null=True, default=None)


class CommentSerializer(serializers.ModelSerializer):
    auteur = UserPublicSerializer(read_only=True)

    class Meta:
        model = Commentaire
        fields = ['id', 'auteur', 'contenu', 'created_at', 'updated_at']
        read_only_fields = ['id', 'auteur', 'created_at', 'updated_at']

    def create(self, validated_data):
        return Commentaire.objects.create(**validated_data)


class PublicationListSerializer(serializers.ModelSerializer):
    """Sérialiseur léger pour le feed principal."""
    auteur = serializers.SerializerMethodField()
    categorie = CategorySerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    reactions_summary = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    is_mine = serializers.SerializerMethodField()

    class Meta:
        model = Publication
        fields = [
            'id', 'auteur', 'titre', 'contenu',
            'categorie', 'tags', 'is_anonymous',
            'reactions_summary', 'comments_count', 'views_count',
            'is_mine', 'created_at', 'updated_at',
        ]

    def get_auteur(self, obj):
        if obj.is_anonymous:
            return {'pseudonyme': 'Anonyme', 'photo_url': None, 'id': None}
        request = self.context.get('request')
        return UserPublicSerializer(obj.auteur, context={'request': request}).data

    def get_comments_count(self, obj):
        return getattr(obj, 'comments_total', obj.comments.count())

    def get_reactions_summary(self, obj):
        reactions = obj.reactions.all()
        user = self.context.get('request').user if self.context.get('request') else None
        user_reaction = None
        if user and user.is_authenticated:
            user_r = reactions.filter(utilisateur=user).first()
            user_reaction = user_r.type if user_r else None
        return {
            'like': reactions.filter(type='like').count(),
            'love': reactions.filter(type='love').count(),
            'support': reactions.filter(type='support').count(),
            'total': reactions.count(),
            'user_reaction': user_reaction,
        }

    def get_is_mine(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.auteur == request.user
        return False


class PublicationDetailSerializer(PublicationListSerializer):
    """Sérialiseur complet avec commentaires."""
    comments = CommentSerializer(many=True, read_only=True)
    auteur_full = serializers.SerializerMethodField()

    class Meta(PublicationListSerializer.Meta):
        fields = PublicationListSerializer.Meta.fields + ['comments', 'auteur_full']

    def get_auteur_full(self, obj):
        """Profil complet visible uniquement pour les publications non anonymes."""
        if obj.is_anonymous:
            return None
        request = self.context.get('request')
        return UserPublicSerializer(obj.auteur, context={'request': request}).data


class PublicationCreateSerializer(serializers.ModelSerializer):
    tags = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Tag.objects.all(),
        required=False
    )
    tag_names = serializers.ListField(
        child=serializers.CharField(max_length=50),
        write_only=True,
        required=False
    )

    class Meta:
        model = Publication
        fields = [
            'titre', 'contenu', 'categorie',
            'tags', 'tag_names', 'is_anonymous',
        ]

    def create(self, validated_data):
        tag_names = validated_data.pop('tag_names', [])
        tags = list(validated_data.pop('tags', []))

        # Créer les tags inexistants
        for name in tag_names:
            tag, _ = Tag.objects.get_or_create(nom=name.lower().strip())
            tags.append(tag)

        pub = Publication.objects.create(**validated_data)
        pub.tags.set(tags)
        return pub

    def update(self, instance, validated_data):
        tag_names = validated_data.pop('tag_names', [])
        tags = list(validated_data.pop('tags', instance.tags.all()))

        for name in tag_names:
            tag, _ = Tag.objects.get_or_create(nom=name.lower().strip())
            tags.append(tag)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        instance.tags.set(tags)
        return instance


class ReactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reaction
        fields = ['id', 'type', 'created_at']
        read_only_fields = ['id', 'created_at']


class SignalementSerializer(serializers.ModelSerializer):
    utilisateur = UserPublicSerializer(read_only=True)
    publication = serializers.PrimaryKeyRelatedField(read_only=True)
    publication_titre = serializers.CharField(source='publication.titre', read_only=True)

    class Meta:
        model = Signalement
        fields = [
            'id', 'publication', 'publication_titre',
            'utilisateur', 'motif', 'description',
            'statut', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'publication', 'utilisateur', 'statut', 'created_at', 'updated_at']
