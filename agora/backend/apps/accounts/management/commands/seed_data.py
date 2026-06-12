"""
L'Agora - Commande de génération de données de démonstration
Usage: python manage.py seed_data
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.accounts.models import User, Role
from apps.publications.models import Category, Tag, Publication, Commentaire, Reaction
from datetime import timedelta
import random


class Command(BaseCommand):
    help = 'Génère des données de démonstration pour L\'Agora'

    def handle(self, *args, **kwargs):
        self.stdout.write('🌱 Génération des données de démonstration...\n')

        # Rôles
        role_student, _ = Role.objects.get_or_create(role_name=Role.STUDENT)
        role_admin, _ = Role.objects.get_or_create(role_name=Role.ADMIN)
        role_mod, _ = Role.objects.get_or_create(role_name=Role.MODERATOR)
        self.stdout.write('✅ Rôles créés')

        # Administrateur
        admin, _ = User.objects.get_or_create(
            email='admin@agora.tn',
            defaults={
                'pseudonyme': 'Admin_Agora',
                'first_name': 'Admin',
                'last_name': 'Agora',
                'role': role_admin,
                'is_staff': True,
                'is_superuser': True,
                'bio': 'Administrateur de la plateforme L\'Agora.',
                'points_solidarite': 500,
            }
        )
        if _:
            admin.set_password('admin@agora2024')
            admin.save()

        # Étudiants
        students_data = [
            {
                'pseudonyme': 'sarra_fseg', 'first_name': 'Sarra', 'last_name': 'Ben Ali',
                'email': 'sarra@agora.tn', 'bio': 'Étudiante en Économie à la FSEG Tunis. Passionnée de finance.',
                'points_solidarite': 120,
            },
            {
                'pseudonyme': 'med_isitcom', 'first_name': 'Mohamed', 'last_name': 'Trabelsi',
                'email': 'med@agora.tn', 'bio': 'Ingénieur en informatique à l\'ISITCOM. Fan de Django et React.',
                'points_solidarite': 85,
            },
            {
                'pseudonyme': 'rania_enit', 'first_name': 'Rania', 'last_name': 'Chahed',
                'email': 'rania@agora.tn', 'bio': 'Future ingénieure civile à l\'ENIT. Tutrice en mathématiques.',
                'points_solidarite': 200,
            },
            {
                'pseudonyme': 'youssef_fst', 'first_name': 'Youssef', 'last_name': 'Hamdi',
                'email': 'youssef@agora.tn', 'bio': 'Étudiant en physique à la FST. Cherche coloc à Tunis.',
                'points_solidarite': 45,
            },
            {
                'pseudonyme': 'leila_isg', 'first_name': 'Leila', 'last_name': 'Nasri',
                'email': 'leila@agora.tn', 'bio': 'MBA à l\'ISG. Organisatrice d\'événements étudiants.',
                'points_solidarite': 160,
            },
        ]

        students = []
        for data in students_data:
            user, created = User.objects.get_or_create(
                email=data['email'],
                defaults={**data, 'role': role_student}
            )
            if created:
                user.set_password('password123')
                user.save()
            students.append(user)
        self.stdout.write(f'✅ {len(students)} étudiants créés')

        # Catégories
        categories_data = [
            {'nom': 'Logement', 'description': 'Colocation, résidences universitaires, conseils logement', 'couleur': '#10b981', 'icone': '🏠'},
            {'nom': 'Entraide académique', 'description': 'Cours, exercices, révisions, projets de groupe', 'couleur': '#6366f1', 'icone': '📚'},
            {'nom': 'Emplois & Stages', 'description': 'Offres de stage, jobs étudiants, conseils carrière', 'couleur': '#f59e0b', 'icone': '💼'},
            {'nom': 'Vie universitaire', 'description': 'Événements, clubs, activités, sortie entre étudiants', 'couleur': '#ec4899', 'icone': '🎓'},
            {'nom': 'Soutien moral', 'description': 'Stress, anxiété, pression académique, partage d\'expérience', 'couleur': '#8b5cf6', 'icone': '💙'},
            {'nom': 'Achats & Ventes', 'description': 'Livres, matériel scolaire, objets divers entre étudiants', 'couleur': '#14b8a6', 'icone': '🛍️'},
            {'nom': 'Bourses & Aides', 'description': 'Informations sur les bourses, aides financières, CROUS', 'couleur': '#f97316', 'icone': '💰'},
        ]

        categories = []
        for data in categories_data:
            cat, _ = Category.objects.get_or_create(nom=data['nom'], defaults=data)
            categories.append(cat)
        self.stdout.write(f'✅ {len(categories)} catégories créées')

        # Tags
        tags_names = [
            'urgent', 'tunis', 'sfax', 'sousse', 'maths', 'informatique',
            'physique', 'économie', 'stage', 'coloc', 'cours-particuliers',
            'résidence', 'bourse', 'anxiété', 'révision', 'projets', 'fseg',
            'enit', 'isg', 'isitcom', 'gratuit', 'en-ligne',
        ]
        tags = []
        for name in tags_names:
            tag, _ = Tag.objects.get_or_create(nom=name)
            tags.append(tag)
        self.stdout.write(f'✅ {len(tags)} tags créés')

        # Publications
        publications_data = [
            {
                'auteur': students[0], 'categorie': categories[0],
                'titre': '🏠 Cherche coloc — Résidence El Manar, budget 200 DT',
                'contenu': 'Salut tout le monde ! Je cherche une coloc pour la prochaine année universitaire à proximité de la faculté. Budget max 200 DT par mois charges comprises. Je suis propre, calme et respectueuse. Si vous avez une chambre ou cherchez aussi un coloc, contactez-moi !',
                'is_anonymous': False,
                'tags_names': ['coloc', 'tunis', 'urgent'],
            },
            {
                'auteur': students[1], 'categorie': categories[1],
                'titre': '📖 Partage mes notes de Algo & Structures de données (S3 Info)',
                'contenu': 'Salut les ingés ! J\'ai compilé toutes mes notes du cours d\'algorithmique et structures de données du semestre 3. Cours, exercices corrigés et anciens examens. Je les partage gratuitement ici. Bonne révision à tous ! 💪\n\nLien vers le drive : [disponible sur demande]',
                'is_anonymous': False,
                'tags_names': ['informatique', 'cours-particuliers', 'gratuit', 'révision'],
            },
            {
                'auteur': students[2], 'categorie': categories[4],
                'titre': 'Comment gérez-vous le stress des examens finaux ?',
                'contenu': 'Je voulais ouvrir une discussion sur quelque chose dont on parle peu : la pression académique. Cette période d\'examens est vraiment difficile pour moi. Je dors peu, j\'ai du mal à me concentrer et je me sens dépassée. Vous avez des conseils ou des techniques qui marchent pour vous ? Savoir qu\'on est pas seuls aide déjà un peu.',
                'is_anonymous': True,
                'tags_names': ['anxiété', 'révision'],
            },
            {
                'auteur': students[3], 'categorie': categories[2],
                'titre': '💼 Stage développeur web disponible — Startup Tunis (été 2024)',
                'contenu': 'Bonjour la communauté ! Une startup tunisienne de fintech cherche des stagiaires développeurs web pour l\'été. Stack : Django + React (exactement ce qu\'on apprend !). Durée : 2 mois. Indemnité : 400 DT/mois. Envoyer CV à l\'adresse que je partage en MP.',
                'is_anonymous': False,
                'tags_names': ['stage', 'informatique', 'tunis'],
            },
            {
                'auteur': students[4], 'categorie': categories[3],
                'titre': '🎉 Afterwork étudiant vendredi soir — Lac 2',
                'contenu': 'On organise une sortie décompression vendredi soir pour tous les étudiants ISG/FSEG/ENIT. Pizzeria conviviale au Lac 2. On sera une vingtaine. Inscription gratuite, on se partage juste la note. Tagguez vos amis et rejoignez le groupe WhatsApp en MP !',
                'is_anonymous': False,
                'tags_names': ['tunis', 'isg', 'fseg', 'enit'],
            },
            {
                'auteur': students[0], 'categorie': categories[6],
                'titre': '💰 Guide complet des bourses universitaires tunisiennes 2024',
                'contenu': 'J\'ai rassemblé toutes les informations sur les aides financières disponibles pour les étudiants tunisiens :\n\n• Bourse d\'excellence MESRS : jusqu\'à 600 DT/an\n• Bourse sociale COUS : 300 DT/semestre\n• Aide campus : restauration et hébergement subventionnés\n• Bourse DAAD (coopération allemande)\n• Programme Erasmus+\n\nConditions et dossiers disponibles dans les commentaires. Partagez à ceux qui en ont besoin !',
                'is_anonymous': False,
                'tags_names': ['bourse', 'urgent', 'gratuit'],
            },
        ]

        publications = []
        for data in publications_data:
            tags_names = data.pop('tags_names', [])
            pub_tags = [t for t in tags if t.nom in tags_names]
            pub, created = Publication.objects.get_or_create(
                titre=data['titre'],
                defaults=data
            )
            if created:
                pub.tags.set(pub_tags)
            publications.append(pub)
        self.stdout.write(f'✅ {len(publications)} publications créées')

        # Commentaires
        comments_data = [
            (publications[0], students[1], 'J\'ai justement une chambre disponible dans une coloc à El Manar ! DM moi.'),
            (publications[0], students[4], 'Il y a aussi une résidence privée très bien notée à côté de la fac, je t\'envoie le contact.'),
            (publications[1], students[2], 'Merci beaucoup ! J\'en avais vraiment besoin pour mes révisions. Tu es un super pote 🙏'),
            (publications[1], students[0], 'Est-ce que tu as aussi les notes de Réseaux ? Si oui ce serait vraiment top !'),
            (publications[2], students[3], 'Tu n\'es vraiment pas seul(e). Moi aussi je passe par là. Ce qui m\'aide : sport le matin, et couper les réseaux sociaux à 22h.'),
            (publications[2], students[4], 'La bibliothèque universitaire organise des sessions de gestion du stress. Je te recommande d\'y aller !'),
            (publications[3], students[2], 'Super opportunité ! Tu peux partager le contact en MP ? Je cherche un stage pour l\'été.'),
            (publications[5], students[1], 'Merci pour ce guide complet ! La bourse DAAD c\'est vraiment intéressant, les délais de candidature c\'est quand ?'),
        ]

        for pub, auteur, contenu in comments_data:
            Commentaire.objects.get_or_create(
                publication=pub,
                auteur=auteur,
                contenu=contenu
            )
        self.stdout.write(f'✅ Commentaires créés')

        # Réactions
        reactions_data = [
            (publications[0], students[1], 'support'),
            (publications[0], students[2], 'like'),
            (publications[1], students[0], 'love'),
            (publications[1], students[2], 'love'),
            (publications[1], students[3], 'like'),
            (publications[2], students[0], 'support'),
            (publications[2], students[1], 'support'),
            (publications[2], students[4], 'love'),
            (publications[3], students[0], 'like'),
            (publications[3], students[2], 'support'),
            (publications[4], students[1], 'like'),
            (publications[4], students[3], 'like'),
            (publications[5], students[1], 'love'),
            (publications[5], students[2], 'love'),
            (publications[5], students[3], 'like'),
        ]

        for pub, user, rtype in reactions_data:
            Reaction.objects.get_or_create(
                publication=pub,
                utilisateur=user,
                defaults={'type': rtype}
            )
        self.stdout.write('✅ Réactions créées')

        self.stdout.write(self.style.SUCCESS('\n🎉 Données de démonstration générées avec succès !\n'))
        self.stdout.write('Comptes disponibles :')
        self.stdout.write('  Admin  → admin@agora.tn / admin@agora2024')
        self.stdout.write('  Étudiant → sarra@agora.tn / password123')
        self.stdout.write('  Étudiant → med@agora.tn / password123')
