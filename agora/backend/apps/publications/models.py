"""
L'Agora - Modèles Publications
"""
from django.db import models
from django.conf import settings


class Category(models.Model):
    nom = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    couleur = models.CharField(max_length=7, default='#6366f1')  # Hex color
    icone = models.CharField(max_length=50, blank=True)

    class Meta:
        db_table = 'categories'
        verbose_name = 'Catégorie'
        verbose_name_plural = 'Catégories'
        ordering = ['nom']

    def __str__(self):
        return self.nom


class Tag(models.Model):
    nom = models.CharField(max_length=50, unique=True)

    class Meta:
        db_table = 'tags'
        verbose_name = 'Tag'
        verbose_name_plural = 'Tags'
        ordering = ['nom']

    def __str__(self):
        return self.nom


class Publication(models.Model):
    auteur = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='publications'
    )
    titre = models.CharField(max_length=255)
    contenu = models.TextField()
    categorie = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='publications'
    )
    tags = models.ManyToManyField(Tag, blank=True, related_name='publications')
    is_anonymous = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    views_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'publications'
        verbose_name = 'Publication'
        verbose_name_plural = 'Publications'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['-created_at']),
            models.Index(fields=['categorie']),
            models.Index(fields=['is_active']),
        ]

    def __str__(self):
        return self.titre

    @property
    def reactions_count(self):
        return self.reactions.count()

    @property
    def comments_count(self):
        return self.comments.count()

    def increment_views(self):
        self.views_count += 1
        self.save(update_fields=['views_count'])


class Commentaire(models.Model):
    publication = models.ForeignKey(
        Publication,
        on_delete=models.CASCADE,
        related_name='comments'
    )
    auteur = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='comments'
    )
    contenu = models.TextField(max_length=1000)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'commentaires'
        verbose_name = 'Commentaire'
        verbose_name_plural = 'Commentaires'
        ordering = ['created_at']

    def __str__(self):
        return f"Commentaire de {self.auteur.pseudonyme} sur '{self.publication.titre}'"


class Reaction(models.Model):
    LIKE = 'like'
    LOVE = 'love'
    SUPPORT = 'support'

    TYPE_CHOICES = [
        (LIKE, '👍 Like'),
        (LOVE, '❤️ Love'),
        (SUPPORT, '🤝 Support'),
    ]

    publication = models.ForeignKey(
        Publication,
        on_delete=models.CASCADE,
        related_name='reactions'
    )
    utilisateur = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='reactions'
    )
    type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'reactions'
        verbose_name = 'Réaction'
        verbose_name_plural = 'Réactions'
        unique_together = [('publication', 'utilisateur')]

    def __str__(self):
        return f"{self.utilisateur.pseudonyme} → {self.type} sur '{self.publication.titre}'"


class Signalement(models.Model):
    SPAM = 'spam'
    INAPPROPRIE = 'inapproprie'
    HARCELEMENT = 'harcelement'
    FAUSSE_INFO = 'fausse_info'
    AUTRE = 'autre'

    MOTIF_CHOICES = [
        (SPAM, 'Spam'),
        (INAPPROPRIE, 'Contenu inapproprié'),
        (HARCELEMENT, 'Harcèlement'),
        (FAUSSE_INFO, 'Fausse information'),
        (AUTRE, 'Autre'),
    ]

    EN_ATTENTE = 'en_attente'
    VALIDE = 'valide'
    REJETE = 'rejete'

    STATUT_CHOICES = [
        (EN_ATTENTE, 'En attente'),
        (VALIDE, 'Validé'),
        (REJETE, 'Rejeté'),
    ]

    publication = models.ForeignKey(
        Publication,
        on_delete=models.CASCADE,
        related_name='signalements'
    )
    utilisateur = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='signalements'
    )
    motif = models.CharField(max_length=20, choices=MOTIF_CHOICES)
    description = models.TextField(blank=True, max_length=500)
    statut = models.CharField(
        max_length=15,
        choices=STATUT_CHOICES,
        default=EN_ATTENTE
    )
    traite_par = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='signalements_traites'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'signalements'
        verbose_name = 'Signalement'
        verbose_name_plural = 'Signalements'
        unique_together = [('publication', 'utilisateur')]
        ordering = ['-created_at']

    def __str__(self):
        return f"Signalement de {self.utilisateur.pseudonyme} ({self.get_motif_display()})"
