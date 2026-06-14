from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient

from apps.accounts.models import Role, User
from apps.publications.models import Publication


class PublicationFeedTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.role = Role.objects.create(role_name=Role.STUDENT)
        self.user = User.objects.create_user(
            email='feed@example.com',
            pseudonyme='feeduser',
            password='password123',
            first_name='Feed',
            last_name='User',
            role=self.role,
        )

    def test_feed_list_returns_active_publications(self):
        Publication.objects.create(
            auteur=self.user,
            titre='Visible publication',
            contenu='This should appear in the feed',
            is_active=True,
        )
        Publication.objects.create(
            auteur=self.user,
            titre='Hidden publication',
            contenu='This should not appear in the feed',
            is_active=False,
        )

        self.client.force_authenticate(self.user)
        response = self.client.get(reverse('publication-list'))

        self.assertEqual(response.status_code, 200)
        titles = [item['titre'] for item in response.json()['results']]
        self.assertIn('Visible publication', titles)
        self.assertNotIn('Hidden publication', titles)

    def test_create_publication_awards_points_to_author(self):
        self.client.force_authenticate(self.user)
        response = self.client.post(
            reverse('publication-list'),
            {'titre': 'Nouvelle pub', 'contenu': 'Contenu solidaire'},
            format='json'
        )

        self.assertEqual(response.status_code, 201)
        self.user.refresh_from_db()
        self.assertEqual(self.user.points_solidarite, 5)

    def test_reacting_awards_points_to_reacting_user(self):
        author = User.objects.create_user(
            email='author@example.com',
            pseudonyme='authoruser',
            password='password123',
            first_name='Author',
            last_name='User',
            role=self.role,
        )
        publication = Publication.objects.create(
            auteur=author,
            titre='Publication cible',
            contenu='Aidez-moi',
        )

        self.client.force_authenticate(self.user)
        response = self.client.post(
            reverse('publication-react', kwargs={'pk': publication.id}),
            {'type': 'like'},
            format='json'
        )

        self.assertEqual(response.status_code, 200)
        self.user.refresh_from_db()
        self.assertEqual(self.user.points_solidarite, 1)
