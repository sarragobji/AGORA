# 🎓 L'Agora — Portail Interactif des Étudiants Universitaires Tunisiens

> Plateforme centralisée d'entraide, de partage et de communication pour la communauté estudiantine tunisienne.

---

## 📋 Table des matières

1. [Présentation](#présentation)
2. [Technologies](#technologies)
3. [Architecture](#architecture)
4. [Installation rapide](#installation-rapide)
5. [Configuration](#configuration)
6. [Base de données MySQL](#base-de-données-mysql)
7. [API Reference](#api-reference)
8. [Données de démonstration](#données-de-démonstration)
9. [Structure des dossiers](#structure-des-dossiers)

---

## Présentation

**L'Agora** répond aux besoins réels des étudiants tunisiens :

| Problème | Solution L'Agora |
|----------|-----------------|
| Logement dispersé sur Facebook | Catégorie **Logement** centralisée |
| Cours partagés sur Telegram | Catégorie **Entraide académique** |
| Stress non adressé | Catégorie **Soutien moral** + publication anonyme |
| Offres de stages éparpillées | Catégorie **Emplois & Stages** |
| Aucun système de réputation | **Points de solidarité** gamifiés |

---

## Technologies

### Backend
| Technologie | Version | Usage |
|-------------|---------|-------|
| Django | 4.2.9 | Framework web |
| Django REST Framework | 3.14 | API REST |
| SimpleJWT | 5.3.1 | Authentification JWT |
| django-cors-headers | 4.3.1 | CORS |
| django-filter | 23.5 | Filtrage avancé |
| drf-nested-routers | 0.93.4 | Routes imbriquées |
| mysqlclient | 2.2.0 | Connecteur MySQL |
| Pillow | 10.2.0 | Upload images |

### Frontend
| Technologie | Version | Usage |
|-------------|---------|-------|
| React | 18.2 | UI |
| React Router | 6.22 | Navigation SPA |
| Axios | 1.6.7 | Requêtes HTTP + intercepteurs |
| TanStack Query | 5.17 | Cache & état serveur |
| Zustand | 4.5 | État global auth |
| Tailwind CSS | 3.4 | Styling |
| react-hook-form | 7.51 | Formulaires |
| Zod | 3.22 | Validation schémas |
| date-fns | 3.3 | Formatage dates |
| react-hot-toast | 2.4 | Notifications toast |
| lucide-react | 0.323 | Icônes |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    NAVIGATEUR (React)                    │
│  ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │  Auth   │  │   Feed   │  │ Profile  │  │  Admin  │ │
│  └────┬────┘  └────┬─────┘  └────┬─────┘  └────┬────┘ │
│       └────────────┴──────────────┴──────────────┘      │
│                     Axios + JWT Interceptors              │
└──────────────────────────┬──────────────────────────────┘
                           │ HTTPS / REST JSON
┌──────────────────────────▼──────────────────────────────┐
│                  BACKEND (Django + DRF)                   │
│  ┌─────────┐  ┌──────────────┐  ┌─────────────────────┐ │
│  │ accounts│  │ publications │  │ notifications/admin │ │
│  └────┬────┘  └──────┬───────┘  └──────────┬──────────┘ │
│       └──────────────┴─────────────────────┘            │
│                   Django ORM                             │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│                    MySQL 8.0+                            │
│  users │ roles │ publications │ commentaires │ reactions │
│  tags  │ categories │ notifications │ signalements       │
└─────────────────────────────────────────────────────────┘
```

---

## Installation rapide

### Prérequis
- Python 3.10+
- Node.js 18+
- MySQL 8.0+
- pip & npm

### 1. Cloner et préparer

```bash
git clone <repo>
cd agora
```

### 2. Backend

```bash
cd backend

# Environnement virtuel
python -m venv venv
source venv/bin/activate        # Linux/macOS
# venv\Scripts\activate         # Windows

# Dépendances
pip install -r requirements.txt

# Variables d'environnement
cp .env.example .env
# ✏️  Éditez .env avec vos paramètres MySQL
```

### 3. Base de données MySQL

```sql
-- Dans MySQL CLI ou phpMyAdmin :
CREATE DATABASE agora_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'agora_user'@'localhost' IDENTIFIED BY 'agora_password';
GRANT ALL PRIVILEGES ON agora_db.* TO 'agora_user'@'localhost';
FLUSH PRIVILEGES;
```

### 4. Migrations et données

```bash
python manage.py makemigrations
python manage.py migrate
python manage.py seed_data        # Données de démonstration
```

### 5. Lancer le backend

```bash
python manage.py runserver
# API disponible sur : http://localhost:8000/api/v1/
```

### 6. Frontend

```bash
cd ../frontend

npm install

cp .env.example .env
# VITE_API_URL=http://localhost:8000/api/v1

npm run dev
# Application disponible sur : http://localhost:3000
```

---

## Configuration

### Backend `.env`

```env
SECRET_KEY=votre-cle-secrete-longue-et-aleatoire
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

DB_NAME=agora_db
DB_USER=agora_user
DB_PASSWORD=agora_password
DB_HOST=localhost
DB_PORT=3306

CORS_ALLOWED_ORIGINS=http://localhost:3000
```

### Frontend `.env`

```env
VITE_API_URL=http://localhost:8000/api/v1
```

---

## Base de données MySQL

### Schéma relationnel

```
roles (id, role_name)
  └── users (id, pseudonyme, email, photo, bio, points_solidarite, role_id, is_active, ...)
        ├── publications (id, auteur_id, titre, contenu, categorie_id, is_anonymous, ...)
        │     ├── publication_tags (publication_id, tag_id)
        │     ├── commentaires (id, publication_id, auteur_id, contenu, ...)
        │     ├── reactions (id, publication_id, utilisateur_id, type, ...)
        │     └── signalements (id, publication_id, utilisateur_id, motif, statut, ...)
        └── notifications (id, utilisateur_id, message, is_read, publication_id, ...)

categories (id, nom, description, couleur, icone)
tags (id, nom)
```

---

## API Reference

### Authentification

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/v1/auth/register/` | Inscription |
| POST | `/api/v1/auth/login/` | Connexion → JWT |
| POST | `/api/v1/auth/logout/` | Invalidation token |
| POST | `/api/v1/auth/token/refresh/` | Rafraîchir access token |

### Utilisateurs

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/api/v1/users/me/` | Mon profil complet | ✅ |
| PATCH | `/api/v1/users/me/` | Modifier profil + photo | ✅ |
| POST | `/api/v1/users/me/change-password/` | Changer mot de passe | ✅ |
| GET | `/api/v1/users/me/history/` | Historique activité | ✅ |
| GET | `/api/v1/users/<pseudonyme>/` | Profil public | 🔓 |

### Publications

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/api/v1/publications/` | Feed (paginé, filtrable) | 🔓 |
| POST | `/api/v1/publications/` | Créer publication | ✅ |
| GET | `/api/v1/publications/<id>/` | Détail + commentaires | 🔓 |
| PATCH | `/api/v1/publications/<id>/` | Modifier (auteur/admin) | ✅ |
| DELETE | `/api/v1/publications/<id>/` | Supprimer (auteur/admin) | ✅ |
| POST | `/api/v1/publications/<id>/react/` | Réagir (like/love/support) | ✅ |
| DELETE | `/api/v1/publications/<id>/react/` | Retirer réaction | ✅ |
| POST | `/api/v1/publications/<id>/report/` | Signaler | ✅ |

**Paramètres de filtre du feed :**
```
?search=     — Recherche texte (titre, contenu, tags)
?categorie=  — ID catégorie
?tag=        — Nom du tag
?date_from=  — Date début (YYYY-MM-DD)
?date_to=    — Date fin (YYYY-MM-DD)
?ordering=   — -created_at | created_at | -views_count | -reactions_count
?page=       — Numéro de page (15 par page)
```

### Commentaires

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/api/v1/publications/<id>/comments/` | Liste commentaires | 🔓 |
| POST | `/api/v1/publications/<id>/comments/` | Ajouter commentaire | ✅ |
| PATCH | `/api/v1/publications/<id>/comments/<cid>/` | Modifier (auteur) | ✅ |
| DELETE | `/api/v1/publications/<id>/comments/<cid>/` | Supprimer (auteur/admin) | ✅ |

### Notifications

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/v1/notifications/` | Mes notifications |
| POST | `/api/v1/notifications/mark-all-read/` | Tout marquer lu |
| PATCH | `/api/v1/notifications/<id>/read/` | Marquer une comme lue |

### Administration (Admin uniquement)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/v1/admin/stats/` | Statistiques globales |
| GET | `/api/v1/admin/users/` | Liste utilisateurs |
| PATCH | `/api/v1/admin/users/<id>/` | Activer/désactiver compte |
| GET | `/api/v1/admin/publications/` | Toutes les publications |
| DELETE | `/api/v1/admin/publications/<id>/` | Retirer publication |
| GET | `/api/v1/admin/signalements/` | Signalements (?statut=) |
| PATCH | `/api/v1/admin/signalements/<id>/` | Valider/rejeter |

### Référentiels

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/v1/categories/` | Liste catégories |
| GET | `/api/v1/tags/` | Liste tags (?search=) |

---

## Données de démonstration

Après `python manage.py seed_data` :

### Comptes disponibles

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Admin | admin@agora.tn | admin@agora2024 |
| Étudiant | sarra@agora.tn | password123 |
| Étudiant | med@agora.tn | password123 |
| Étudiant | rania@agora.tn | password123 |
| Étudiant | youssef@agora.tn | password123 |
| Étudiant | leila@agora.tn | password123 |

### Contenu généré
- 7 catégories thématiques
- 22 tags pertinents
- 6 publications réalistes
- 8 commentaires
- 15 réactions

---

## Structure des dossiers

```
agora/
├── backend/
│   ├── agora_backend/         # Cœur Django
│   │   ├── settings.py        # Configuration
│   │   ├── urls.py            # Routes principales
│   │   ├── utils.py           # Helpers
│   │   └── wsgi.py
│   ├── apps/
│   │   ├── accounts/          # Utilisateurs & Auth
│   │   │   ├── models.py      # User, Role
│   │   │   ├── serializers.py # JWT enrichi
│   │   │   ├── views.py       # Register, Login, Profile...
│   │   │   ├── permissions.py # IsOwnerOrAdmin, IsAdminUser...
│   │   │   └── urls/          # auth_urls.py, user_urls.py
│   │   ├── publications/      # Contenu principal
│   │   │   ├── models.py      # Publication, Commentaire, Reaction, Signalement, Tag, Category
│   │   │   ├── serializers.py
│   │   │   ├── views.py       # ViewSets complets
│   │   │   ├── filters.py     # django-filter
│   │   │   └── urls.py        # Nested router
│   │   ├── notifications/     # Système de notifications
│   │   │   ├── models.py
│   │   │   ├── services.py    # NotificationService
│   │   │   └── views.py
│   │   └── administration/    # Interface admin
│   │       └── views.py       # Stats, modération
│   ├── requirements.txt
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── App.jsx             # Routeur principal + gardes
    │   ├── services/
    │   │   └── api.js          # Axios + tous les services
    │   ├── store/
    │   │   └── authStore.js    # Zustand auth
    │   ├── components/
    │   │   ├── layout/         # MainLayout, AuthLayout
    │   │   ├── publications/   # PublicationCard, ReportModal
    │   │   └── ui/             # LoadingSpinner
    │   └── pages/
    │       ├── auth/           # LoginPage, RegisterPage
    │       ├── user/           # Feed, Detail, Create, Profile, History, Notifications
    │       └── admin/          # Dashboard, Users, Publications, Signalements
    ├── tailwind.config.js
    ├── vite.config.js
    └── .env.example
```

---

## Points techniques notables

### Sécurité
- JWT avec blacklist au logout (rotation automatique)
- Permissions granulaires par rôle (IsOwnerOrAdmin, IsAdminUser, IsModeratorOrAdmin)
- Upload images sécurisé via Pillow
- CORS configuré par variable d'environnement
- `sql_mode=STRICT_TRANS_TABLES` MySQL

### Performance
- Requêtes ORM optimisées avec `select_related` et `prefetch_related`
- `annotate` pour les compteurs (évite les N+1)
- Pagination 15 résultats/page
- TanStack Query avec cache côté client
- Lazy loading des pages React

### UX
- Dark mode natif (classe Tailwind)
- Responsive mobile-first avec sidebar collapsible
- Toast notifications contextuelles
- Rafraîchissement automatique JWT transparent
- Publication anonyme pour les sujets sensibles
- Système de points de solidarité gamifié

---

*Développé dans le cadre d'un projet académique — L'Agora, portail étudiant tunisien.*
