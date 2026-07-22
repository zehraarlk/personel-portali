"""Yönetici profil API (yoneticiler + yonetici_oturum_kayitlari)."""
from django.contrib.auth.hashers import make_password
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Yoneticiler, YoneticiOturumKayitlari, normalize_image_path
from .profile_views import verify_sifre


def resolve_yonetici(request):
    """Giriş yokken: ?yonetici_id= veya X-Yonetici-Id, yoksa ilk aktif kayıt."""
    raw = request.query_params.get('yonetici_id') or request.headers.get('X-Yonetici-Id')
    if raw:
        try:
            return Yoneticiler.objects.filter(pk=int(raw)).first()
        except (TypeError, ValueError):
            pass
    return (
        Yoneticiler.objects.filter(aktif=1).order_by('id').first()
        or Yoneticiler.objects.order_by('id').first()
    )


def yonetici_payload(y: Yoneticiler) -> dict:
    return {
        'id': y.id,
        'kullanici_adi': y.kullanici_adi,
        'ad': y.ad,
        'soyad': y.soyad,
        'ad_soyad': f'{y.ad} {y.soyad}'.strip(),
        'yetki': y.yetki or '',
        'foto': normalize_image_path(y.foto_url),
        'aktif': bool(y.aktif),
        'rol': 'Yönetici',
        'rol_kod': 'yonetici',
    }


@api_view(['GET'])
def admin_profile_me(request):
    yonetici = resolve_yonetici(request)
    if not yonetici:
        return Response({'detail': 'Yönetici bulunamadı.'}, status=status.HTTP_404_NOT_FOUND)
    return Response(yonetici_payload(yonetici))


@api_view(['GET'])
def admin_profile_sessions(request):
    yonetici = resolve_yonetici(request)
    if not yonetici:
        return Response({'detail': 'Yönetici bulunamadı.'}, status=status.HTTP_404_NOT_FOUND)

    rows = YoneticiOturumKayitlari.objects.filter(yonetici=yonetici).order_by('-giris_zamani')[:10]
    data = [
        {
            'id': r.id,
            'giris_zamani': r.giris_zamani.isoformat() if r.giris_zamani else None,
            'cikis_zamani': r.cikis_zamani.isoformat() if r.cikis_zamani else None,
            'ip_adresi': r.ip_adresi or '',
            'user_agent': r.user_agent or '',
            'kapanis_tipi': r.kapanis_tipi or '',
            'son_aktivite': r.son_aktivite.isoformat() if r.son_aktivite else None,
            'aktif': r.cikis_zamani is None,
        }
        for r in rows
    ]
    return Response({'yonetici_id': yonetici.id, 'oturumlar': data})


@api_view(['POST'])
def admin_profile_change_password(request):
    yonetici = resolve_yonetici(request)
    if not yonetici:
        return Response({'detail': 'Yönetici bulunamadı.'}, status=status.HTTP_404_NOT_FOUND)

    mevcut = request.data.get('mevcut_sifre') or ''
    yeni = request.data.get('yeni_sifre') or ''
    tekrar = request.data.get('yeni_sifre_tekrar') or ''

    if len(yeni) < 6:
        return Response(
            {'detail': 'Yeni şifre en az 6 karakter olmalı.'},
            status=status.HTTP_400_BAD_REQUEST,
        )
    if yeni != tekrar:
        return Response({'detail': 'Yeni şifreler eşleşmiyor.'}, status=status.HTTP_400_BAD_REQUEST)
    if not verify_sifre(mevcut, yonetici.sifre):
        return Response({'detail': 'Mevcut şifre hatalı.'}, status=status.HTTP_400_BAD_REQUEST)

    yonetici.sifre = make_password(yeni)
    yonetici.save(update_fields=['sifre'])
    return Response({'status': 'ok', 'message': 'Şifre güncellendi.'})
