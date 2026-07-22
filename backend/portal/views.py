from datetime import date

from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import (
    Haber,
    Duyuru,
    Personel,
    AnasayfaLink,
    SiteIkon,
    SizdenGelenler,
    SizdengelenlerKategori,
    Videolar,
    VideolarKategori,
)
from .serializers import (
    HaberSerializer,
    DuyuruSerializer,
    BirthdaySerializer,
    AnasayfaLinkSerializer,
    SiteIkonSerializer,
    SizdenGelenlerSerializer,
    SizdengelenlerKategoriSerializer,
    VideoSerializer,
    VideoKategoriSerializer,
)


@api_view(['GET'])
def home_dashboard(request):
    """Eski ana_sayfa.php mantığı: haberler, duyurular, doğum günleri, otomasyon."""
    today = date.today()
    birthdays = Personel.objects.filter(
        dogum_tarihi__month=today.month,
        dogum_tarihi__day=today.day,
    )

    return Response(
        {
            'haberler': HaberSerializer(Haber.objects.order_by('-id'), many=True).data,
            'duyurular': DuyuruSerializer(Duyuru.objects.order_by('-id'), many=True).data,
            'dogum_gunleri': BirthdaySerializer(birthdays, many=True).data,
            'otomasyon': AnasayfaLinkSerializer(
                AnasayfaLink.objects.order_by('id'), many=True
            ).data,
            'tarih': today.isoformat(),
            'tarih_tr': today.strftime('%d.%m.%Y'),
        }
    )


@api_view(['GET'])
def site_icons(request):
    """site_ikonlari — anahtar -> ikon_sinifi haritası (+ liste)."""
    qs = SiteIkon.objects.filter(aktif=1)
    kategori = request.query_params.get('kategori')
    if kategori:
        qs = qs.filter(kategori=kategori)

    items = SiteIkonSerializer(qs, many=True).data
    by_key = {row['anahtar']: row['ikon_sinifi'] for row in items}
    return Response({'icons': by_key, 'items': items})


@api_view(['GET'])
def sizden_gelenler_list(request):
    """Sizden Gelenler: kategori sekmeleri + (varsa filtrelenmiş) içerik listesi."""
    icerikler = SizdenGelenler.objects.order_by('-tarih')

    kategori_slug = request.query_params.get('kategori')
    if kategori_slug:
        icerikler = icerikler.filter(kategori__slug=kategori_slug)

    kategoriler = SizdengelenlerKategori.objects.all()

    return Response({
        'kategoriler': SizdengelenlerKategoriSerializer(kategoriler, many=True).data,
        'icerikler': SizdenGelenlerSerializer(icerikler, many=True).data,
    })


@api_view(['GET'])
def videos(request):
    video_queryset = (
        Videolar.objects
        .select_related('kategori')
        .order_by('-id')
    )

    kategori_slug = request.query_params.get('kategori')

    if kategori_slug:
        video_queryset = video_queryset.filter(
            kategori__slug=kategori_slug
        )

    kategoriler = VideolarKategori.objects.order_by('id')

    vitrin_video = (
        video_queryset
        .filter(vitrin=1)
        .first()
    )

    return Response({
        'videolar': VideoSerializer(
            video_queryset,
            many=True
        ).data,

        'kategoriler': VideoKategoriSerializer(
            kategoriler,
            many=True
        ).data,

        'vitrin': (
            VideoSerializer(vitrin_video).data
            if vitrin_video
            else None
        ),
    })