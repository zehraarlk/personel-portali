"""Yardımcı Linkler API (yardimci_linkler + yardimci_linkler_kategori)."""
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import YardimciLinkler, normalize_image_path


@api_view(['GET'])
def yardimci_linkler_list(request):
    """Aktif yardımcı linklerin listesi (opsiyonel kategori filtresiyle)."""
    kategori_slug = request.query_params.get('kategori')

    qs = YardimciLinkler.objects.select_related('kategori').order_by('id')

    if kategori_slug:
        qs = qs.filter(kategori__slug__iexact=kategori_slug)

    items = [
        {
            'id': row.id,
            'baslik': row.baslik,
            'logo_url': normalize_image_path(row.logo_url or ''),
            'hedef_url': row.hedef_url,
            'kategori': row.kategori.ad if row.kategori else None,
            'kategori_slug': row.kategori.slug if row.kategori else None,
        }
        for row in qs
    ]

    return Response({'linkler': items, 'toplam': len(items)})
