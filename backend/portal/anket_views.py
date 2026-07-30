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
)


def resolve_personel(request):
    """profile_views.py'deki ile aynı mantık: X-Personel-Id header veya ?personel_id."""
    raw = request.query_params.get('personel_id') or request.headers.get('X-Personel-Id')
    if raw:
        try:
            return Personeller.objects.filter(pk=int(raw)).first()
        except (TypeError, ValueError):
            pass
    return None


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

    items = [
        {
            'id': a.id,
            'baslik': a.baslik,
            'aciklama': a.aciklama,
            'resim_url': a.resim_url or '',
            'baslangic_tarihi': a.baslangic_tarihi.isoformat() if a.baslangic_tarihi else None,
            'bitis_tarihi': a.bitis_tarihi.isoformat() if a.bitis_tarihi else None,
            'katilim_sayisi': a.katilim_sayisi or 0,
            'hedef_katilim': a.hedef_katilim,
            'kategori': a.kategori.ad if a.kategori else None,
            'katildi_mi': a.id in katilinan_id_seti,
        }
        for a in qs
    ]
    return Response({'anketler': items, 'toplam': len(items)})


@api_view(['GET'])
def anket_detay(request, pk):
    """Tek bir anketin soruları ve seçenekleriyle birlikte detayı."""
    anket = Anketler.objects.select_related('kategori').filter(pk=pk).first()
    if not anket:
        return Response({'detail': 'Anket bulunamadı.'}, status=status.HTTP_404_NOT_FOUND)

    sorular = AnketSorulari.objects.filter(anket=anket).order_by('sira', 'id')
    soru_listesi = []
    for soru in sorular:
        secenekler = AnketSecenekleri.objects.filter(soru=soru).order_by('id')
        soru_listesi.append(
            {
                'id': soru.id,
                'soru_metni': soru.soru_metni,
                'soru_tipi': soru.soru_tipi,
                'sira': soru.sira,
                'secenekler': [
                    {'id': s.id, 'secenek_metni': s.secenek_metni} for s in secenekler
                ],
            }
        )

    personel = resolve_personel(request)
    katildi_mi = False
    if personel:
        katildi_mi = AnketKatilimlari.objects.filter(
            anket_id=anket.id, personel_id=personel.id
        ).exists()

    return Response(
        {
            'id': anket.id,
            'baslik': anket.baslik,
            'aciklama': anket.aciklama,
            'resim_url': anket.resim_url or '',
            'katilim_sayisi': anket.katilim_sayisi or 0,
            'hedef_katilim': anket.hedef_katilim,
            'katildi_mi': katildi_mi,
            'sorular': soru_listesi,
        }
    )


@api_view(['POST'])
def anket_katil(request, pk):
    """Kullanıcının anket cevaplarını kaydeder."""
    personel = resolve_personel(request)
    if not personel:
        return Response({'detail': 'Personel bulunamadı.'}, status=status.HTTP_404_NOT_FOUND)

    anket = Anketler.objects.filter(pk=pk).first()
    if not anket:
        return Response({'detail': 'Anket bulunamadı.'}, status=status.HTTP_404_NOT_FOUND)

    zaten_katilmis = AnketKatilimlari.objects.filter(
        anket_id=anket.id, personel_id=personel.id
    ).exists()
    if zaten_katilmis:
        return Response(
            {'detail': 'Bu ankete zaten katıldınız.'}, status=status.HTTP_400_BAD_REQUEST
        )

    cevaplar = request.data.get('cevaplar') or []
    if not cevaplar:
        return Response({'detail': 'Cevap gönderilmedi.'}, status=status.HTTP_400_BAD_REQUEST)

    with transaction.atomic():
        for cevap in cevaplar:
            soru_id = cevap.get('soru_id')
            secenek_id = cevap.get('secenek_id')
            cevap_metni = cevap.get('cevap_metni')

            soru = AnketSorulari.objects.filter(pk=soru_id, anket=anket).first()
            if not soru:
                continue

            secenek = None
            if secenek_id:
                secenek = AnketSecenekleri.objects.filter(pk=secenek_id, soru=soru).first()

            AnketCevaplari.objects.create(
                anket=anket,
                personel=personel,
                soru=soru,
                secenek=secenek,
                cevap_metni=cevap_metni,
                olusturma_tarihi=timezone.now(),
            )

        AnketKatilimlari.objects.create(
            anket_id=anket.id,
            personel_id=personel.id,
            tamamlanma_tarihi=timezone.now(),
        )

        anket.katilim_sayisi = (anket.katilim_sayisi or 0) + 1
        anket.save(update_fields=['katilim_sayisi'])

    return Response({'status': 'ok', 'message': 'Anket cevaplarınız kaydedildi.'})
