"""
L'Agora - Modèles Utilisateurs
"""
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone


class Role(models.Model):
    STUDENT = 'student'
    ADMIN = 'admin'
    MODERATOR = 'moderator'

    ROLE_CHOICES = [
        (STUDENT, 'Étudiant'),
        (ADMIN, 'Administrateur'),
        (MODERATOR, 'Modérateur'),
    ]

    role_name = models.CharField(
        max_length=50,
        choices=ROLE_CHOICES,
        unique=True
    )

    class Meta:
        db_table = 'roles'
        verbose_name = 'Rôle'
        verbose_name_plural = 'Rôles'

    def __str__(self):
        return self.get_role_name_display()


class UserManager(BaseUserManager):
    def create_user(self, email, pseudonyme, password=None, **extra_fields):
        if not email:
            raise ValueError("L'adresse email est obligatoire")
        if not pseudonyme:
            raise ValueError("Le pseudonyme est obligatoire")

        email = self.normalize_email(email)
        user = self.model(email=email, pseudonyme=pseudonyme, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, pseudonyme, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        role, _ = Role.objects.get_or_create(role_name=Role.ADMIN)
        extra_fields.setdefault('role', role)

        return self.create_user(email, pseudonyme, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    pseudonyme = models.CharField(max_length=50, unique=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    photo = models.ImageField(
        upload_to='avatars/',
        null=True,
        blank=True,
        default=None
    )
    bio = models.TextField(blank=True, max_length=500)
    points_solidarite = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    role = models.ForeignKey(
        Role,
        on_delete=models.SET_NULL,
        null=True,
        related_name='users'
    )
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['pseudonyme', 'first_name', 'last_name']

    class Meta:
        db_table = 'users'
        verbose_name = 'Utilisateur'
        verbose_name_plural = 'Utilisateurs'
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['pseudonyme']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"{self.pseudonyme} <{self.email}>"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

    @property
    def is_admin(self):
        return self.role and self.role.role_name == Role.ADMIN

    @property
    def is_moderator(self):
        return self.role and self.role.role_name in [Role.ADMIN, Role.MODERATOR]

    def award_points(self, points: int):
        """Ajouter des points de solidarité à l'utilisateur."""
        self.points_solidarite += points
        self.save(update_fields=['points_solidarite'])
