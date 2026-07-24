from datetime import date

from django.db.models import F, Q

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
    Etkinlikler,
    EtkinliklerDurum,
    EtkinliklerDuyurular,
    DuyurularKategori,
    Kaynaklar,
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
    EtkinlikSerializer,
    EtkinliklerDurumSerializer,
    EtkinlikDuyuruSerializer,
    DuyurularKategoriSerializer,
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

@api_view(['POST'])
def sizden_gelenler_goruntule(request, pk):
    """Bir Sizden Gelenler kaydının görüntülenme sayısını 1 artırır."""
    try:
        kayit = SizdenGelenler.objects.get(pk=pk)
    except SizdenGelenler.DoesNotExist:
        return Response({'detail': 'Kayıt bulunamadı.'}, status=404)

    kayit.goruntulenme = (kayit.goruntulenme or 0) + 1
    kayit.save(update_fields=['goruntulenme'])

    return Response({'goruntulenme': kayit.goruntulenme})


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


@api_view(['GET'])
def etkinlikler_list(request):
    """Etkinlikler: durum sekmeleri + (varsa filtrelenmiş) etkinlik listesi."""
    etkinlikler = Etkinlikler.objects.select_related('durum_ref').order_by('tarih')

    durum_slug = request.query_params.get('durum')
    if durum_slug:
        etkinlikler = etkinlikler.filter(durum_ref__slug=durum_slug)

    durumlar = EtkinliklerDurum.objects.order_by('id')

    return Response({
        'durumlar': EtkinliklerDurumSerializer(durumlar, many=True).data,
        'etkinlikler': EtkinlikSerializer(etkinlikler, many=True).data,
    })


@api_view(['GET'])
def etkinlik_duyurular_list(request):
    """Etkinlikler > Duyurular: kategori sekmeleri ve duyuru listesi."""
    duyurular = (
        EtkinliklerDuyurular.objects
        .filter(sayfa_tipi='duyuru')
        .select_related('kategori')
        .order_by(F('tarih').desc(nulls_last=True), '-id')
    )

    kategori_slug = request.query_params.get('kategori')
    if kategori_slug:
        duyurular = duyurular.filter(kategori__slug=kategori_slug)

    kategoriler = DuyurularKategori.objects.order_by('id')

    return Response({
        'kategoriler': DuyurularKategoriSerializer(kategoriler, many=True).data,
        'duyurular': EtkinlikDuyuruSerializer(duyurular, many=True).data,
    })


@api_view(['GET'])
def protokoller_list(request):
    """Personel portali - kaynaklar (kategori: Protokoller)."""
    q = (request.query_params.get('q') or '').strip()
    qs = (
        Kaynaklar.objects.select_related('kategori')
        .filter(kategori__slug='Protokoller')
        .order_by('-id')
    )
    if q:
        qs = qs.filter(Q(baslik__icontains=q) | Q(aciklama__icontains=q))

    items = [
        {
            'id': row.id,
            'baslik': row.baslik,
            'aciklama': row.aciklama,
            'ikon': row.ikon or 'fas fa-file-signature',
            'dosya_yolu': row.dosya_yolu,
            'resmi_sayfa': row.resmi_sayfa or '',
            'boyut': row.boyut,
            'tarih': row.tarih,
        }
        for row in qs
    ]
    return Response({'protokoller': items, 'toplam': len(items)})

