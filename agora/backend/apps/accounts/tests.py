from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient

from apps.accounts.models import Role, User
from apps.publications.models import Publication


class UserHistoryViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.role = Role.objects.create(role_name=Role.STUDENT)
        self.user = User.objects.create_user(
            email='history@example.com',
            pseudonyme='historyuser',
            password='password123',
            first_name='History',
            last_name='User',
            role=self.role,
        )

    def test_history_only_includes_active_publications(self):
        active_pub = Publication.objects.create(
            auteur=self.user,
            titre='Active publication',
            contenu='Visible in feed',
            is_active=True,
        )
        inactive_pub = Publication.objects.create(
            auteur=self.user,
            titre='Inactive publication',
            contenu='Should not be in history feed',
            is_active=False,
        )

        self.client.force_authenticate(self.user)
        response = self.client.get(reverse('user-history'))

        self.assertEqual(response.status_code, 200)
        titles = [item['titre'] for item in response.json()['data']['publications']]
        self.assertIn(active_pub.titre, titles)
        self.assertNotIn(inactive_pub.titre, titles)
