"""
L'Agora - Filtres Publications
"""
import django_filters
from apps.publications.models import Publication


class PublicationFilter(django_filters.FilterSet):
    categorie = django_filters.NumberFilter(field_name='categorie__id')
    tag = django_filters.CharFilter(field_name='tags__nom', lookup_expr='iexact')
    date_from = django_filters.DateFilter(field_name='created_at', lookup_expr='gte')
    date_to = django_filters.DateFilter(field_name='created_at', lookup_expr='lte')
    auteur = django_filters.CharFilter(field_name='auteur__pseudonyme', lookup_expr='iexact')

    class Meta:
        model = Publication
        fields = ['categorie', 'tag', 'date_from', 'date_to', 'auteur']
