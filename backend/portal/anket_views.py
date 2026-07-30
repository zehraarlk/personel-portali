"""Anketler API (anketler + anket_sorulari + anket_secenekleri + anket_cevaplari)."""
from django.db import transaction
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import (
    Anketler,
    AnketSorulari,
    AnketSecenekleri,
    AnketCevaplari,
    AnketKatilimlari,
    Personeller,
    normalize_image_path,
)

_TR_MONTHS = (
    '',
    'Ocak',
    'Şubat',
    'Mart',
    'Nisan',
    'Mayıs',
    'Haziran',
    'Temmuz',
    'Ağustos',
    'Eylül',
    'Ekim',
    'Kasım',
    'Aralık',
)

_ANKET_STATUS = {
    'pending': {'label': 'Beklemede', 'class': 'is-pending', 'icon': 'schedule'},
    'completed': {'label': 'Tamamlandı', 'class': 'is-completed', 'icon': 'check_circle'},
    'expired': {'label': 'Süresi Doldu', 'class': 'is-expired', 'icon': 'cancel'},
    'active': {'label': 'Aktif', 'class': 'is-active', 'icon': 'play_circle'},
}


def resolve_personel(request):
    """X-Personel-Id / ?personel_id / body.personel_id."""
    raw = request.query_params.get('personel_id') or request.headers.get('X-Personel-Id')
    if request.method in ('POST', 'PUT', 'PATCH') and hasattr(request, 'data'):
        raw = request.data.get('personel_id') or raw
    if raw:
        try:
            return Personeller.objects.filter(pk=int(raw)).first()
        except (TypeError, ValueError):
            pass
    return None


def _date_label(value):
    if not value:
        return ''
    return f'{value.day} {_TR_MONTHS[value.month]} {value.year}'


def _serialize_anket(a, participated=False):
    slug = (a.kategori.slug if a.kategori_id and a.kategori else '') or 'active'
    meta = _ANKET_STATUS.get(slug, _ANKET_STATUS['active'])
    katilim = int(a.katilim_sayisi or 0)
    hedef = max(1, int(a.hedef_katilim or 1))
    start = _date_label(a.baslangic_tarihi)
    end = _date_label(a.bitis_tarihi)
    aciklama = a.aciklama or ''
    excerpt = aciklama if len(aciklama) <= 140 else f'{aciklama[:139].rstrip()}…'
    return {
        'id': a.id,
        'baslik': a.baslik,
        'aciklama': aciklama,
        'excerpt': excerpt,
        'resim': normalize_image_path(a.resim_url or ''),
        'resim_url': a.resim_url or '',
        'baslangic_tarihi': a.baslangic_tarihi.isoformat() if a.baslangic_tarihi else None,
        'bitis_tarihi': a.bitis_tarihi.isoformat() if a.bitis_tarihi else None,
        'date_label': f'{start} - {end}'.strip(' -') if (start or end) else '',
        'katilim_sayisi': katilim,
        'hedef_katilim': a.hedef_katilim,
        'percent': min(100, int(round((katilim / hedef) * 100))),
        'kategori': a.kategori.ad if a.kategori else None,
        'kategori_ad': a.kategori.ad if a.kategori else '',
        'kategori_slug': slug,
        'status_label': meta['label'],
        'status_class': meta['class'],
        'status_icon': meta['icon'],
        'favorite': int(a.favori or 0) == 1,
        'participated': participated,
        'katildi_mi': participated,
    }


@api_view(['GET'])
def anketler_list(request):
    """Aktif anketlerin listesi."""
    qs = Anketler.objects.select_related('kategori').order_by('-id')

    personel = resolve_personel(request)
    katilinan_id_seti = set()
    if personel:
        katilinan_id_seti = set(
            AnketKatilimlari.objects.filter(personel_id=personel.id).values_list(
                'anket_id', flat=True
            )
        )

    items = [_serialize_anket(a, a.id in katilinan_id_seti) for a in qs]
    return Response({'anketler': items, 'toplam': len(items)})


@api_view(['GET'])
def anket_detay(request, pk):
    """Tek bir anketin soruları ve seçenekleriyle birlikte detayı."""
    anket = Anketler.objects.select_related('kategori').filter(pk=pk).first()
    if not anket:
        return Response({'detail': 'Anket bulunamadı.'}, status=status.HTTP_404_NOT_FOUND)

    personel = resolve_personel(request)
    katildi_mi = False
    cevaplar_map = {}
    if personel:
        katildi_mi = AnketKatilimlari.objects.filter(
            anket_id=anket.id, personel_id=personel.id
        ).exists()
        if katildi_mi:
            for row in AnketCevaplari.objects.filter(anket=anket, personel=personel):
                cevaplar_map[row.soru_id] = {
                    'secenek_id': row.secenek_id,
                    'cevap_metni': row.cevap_metni or '',
                }

    sorular = AnketSorulari.objects.filter(anket=anket).order_by('sira', 'id')
    soru_listesi = []
    for soru in sorular:
        secenekler = AnketSecenekleri.objects.filter(soru=soru).order_by('id')
        onceki = cevaplar_map.get(soru.id) or {}
        soru_listesi.append(
            {
                'id': soru.id,
                'soru_metni': soru.soru_metni,
                'soru_tipi': soru.soru_tipi,
                'sira': soru.sira,
                'secenekler': [
                    {'id': s.id, 'secenek_metni': s.secenek_metni} for s in secenekler
                ],
                'cevap_secenek_id': onceki.get('secenek_id'),
                'cevap_metni': onceki.get('cevap_metni') or '',
            }
        )

    return Response(
        {
            'anket': _serialize_anket(anket, katildi_mi),
            'sorular': soru_listesi,
            'participated': katildi_mi,
            'katildi_mi': katildi_mi,
            'soru_sayisi': len(soru_listesi),
            # geriye dönük düz alanlar
            'id': anket.id,
            'baslik': anket.baslik,
            'aciklama': anket.aciklama,
        }
    )


@api_view(['POST'])
def anket_katil(request, pk):
    """Kullanıcının anket cevaplarını kaydeder."""
    personel = resolve_personel(request)
    if not personel:
        return Response(
            {'detail': 'Ankete katılmak için personel hesabıyla giriş yapmalısınız.'},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    anket = Anketler.objects.filter(pk=pk).first()
    if not anket:
        return Response({'detail': 'Anket bulunamadı.'}, status=status.HTTP_404_NOT_FOUND)

    zaten_katilmis = AnketKatilimlari.objects.filter(
        anket_id=anket.id, personel_id=personel.id
    ).exists()
    if zaten_katilmis:
        return Response(
            {'detail': 'Bu ankete ait cevaplarınız kilitlenmiştir, tekrar düzenleyemezsiniz.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    raw = request.data.get('cevaplar')
    # Destek: [{soru_id, secenek_id, cevap_metni}] veya {soruId: secenek|metin}
    if isinstance(raw, dict):
        cevaplar = []
        for sid, val in raw.items():
            try:
                soru_id = int(sid)
            except (TypeError, ValueError):
                continue
            if isinstance(val, (int, float)) or (isinstance(val, str) and val.isdigit()):
                cevaplar.append(
                    {'soru_id': soru_id, 'secenek_id': int(val), 'cevap_metni': None}
                )
            else:
                cevaplar.append(
                    {
                        'soru_id': soru_id,
                        'secenek_id': None,
                        'cevap_metni': str(val or '').strip(),
                    }
                )
    elif isinstance(raw, list):
        cevaplar = raw
    else:
        cevaplar = []

    if not cevaplar:
        return Response({'detail': 'Cevap gönderilmedi.'}, status=status.HTTP_400_BAD_REQUEST)

    sorular = list(AnketSorulari.objects.filter(anket=anket).order_by('sira', 'id'))
    if not sorular:
        return Response(
            {'detail': 'Bu ankete henüz soru eklenmemiş.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    by_id = {c.get('soru_id'): c for c in cevaplar if c.get('soru_id')}
    hazir = []
    for soru in sorular:
        c = by_id.get(soru.id) or {}
        tip = (soru.soru_tipi or '').strip()
        if tip == 'coktan_secmeli':
            try:
                secenek_id = int(c.get('secenek_id') or 0)
            except (TypeError, ValueError):
                secenek_id = 0
            if secenek_id <= 0 or not AnketSecenekleri.objects.filter(
                id=secenek_id, soru=soru
            ).exists():
                return Response(
                    {'detail': 'Lütfen tüm soruları yanıtlayın.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            hazir.append({'soru': soru, 'secenek_id': secenek_id, 'metin': None})
        else:
            metin = (c.get('cevap_metni') or '').strip()
            if not metin:
                return Response(
                    {'detail': 'Lütfen tüm soruları yanıtlayın.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            hazir.append({'soru': soru, 'secenek_id': None, 'metin': metin})

    now = timezone.now()
    try:
        with transaction.atomic():
            for item in hazir:
                AnketCevaplari.objects.create(
                    anket=anket,
                    personel=personel,
                    soru=item['soru'],
                    secenek_id=item['secenek_id'],
                    cevap_metni=item['metin'],
                    olusturma_tarihi=now,
                )
            AnketKatilimlari.objects.create(
                anket_id=anket.id,
                personel_id=personel.id,
                tamamlanma_tarihi=now,
            )
            count = AnketKatilimlari.objects.filter(anket_id=anket.id).count()
            Anketler.objects.filter(pk=anket.id).update(katilim_sayisi=count)
    except Exception:
        return Response(
            {'detail': 'Cevaplar kaydedilirken bir hata oluştu.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    return Response(
        {
            'status': 'ok',
            'ok': True,
            'message': 'Katılımınız kaydedildi.',
            'baslik': anket.baslik,
        },
        status=status.HTTP_201_CREATED,
    )
