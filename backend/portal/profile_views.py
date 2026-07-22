"""Aktif personel profil API (personeller + oturum_kayitlari)."""
from django.contrib.auth.hashers import check_password, make_password
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Personeller, OturumKayitlari, Yoneticiler, normalize_image_path


def resolve_personel(request):
    """Giriş yokken: ?personel_id= veya X-Personel-Id, yoksa ilk kayıt."""
    raw = request.query_params.get('personel_id') or request.headers.get('X-Personel-Id')
    if raw:
        try:
            return Personeller.objects.filter(pk=int(raw)).first()
        except (TypeError, ValueError):
            pass
    return Personeller.objects.order_by('id').first()


def personel_payload(p: Personeller) -> dict:
    is_yonetici = Yoneticiler.objects.filter(
        aktif=1, ad__iexact=p.ad, soyad__iexact=p.soyad
    ).exists()
    return {
        'id': p.id,
        'sicil_no': p.sicil_no,
        'ad': p.ad,
        'soyad': p.soyad,
        'ad_soyad': f'{p.ad} {p.soyad}'.strip(),
        'email': p.email,
        'telefon': p.telefon or '',
        'foto': normalize_image_path(p.foto_url),
        'dogum_tarihi': p.dogum_tarihi.isoformat() if p.dogum_tarihi else None,
        'rol': 'Yönetici' if is_yonetici else 'Personel',
        'rol_kod': 'yonetici' if is_yonetici else 'personel',
    }


def verify_sifre(raw: str, stored: str) -> bool:
    if not stored:
        return False
    if stored.startswith(('pbkdf2_', 'argon2', 'bcrypt$', 'scrypt')):
        return check_password(raw, stored)
    # PHP password_hash ($2y$ / $2a$)
    if stored.startswith(('$2y$', '$2a$', '$2b$')):
        try:
            import bcrypt

            normalized = stored.encode('utf-8')
            if stored.startswith('$2y$'):
                normalized = ('$2b$' + stored[4:]).encode('utf-8')
            return bcrypt.checkpw(raw.encode('utf-8'), normalized)
        except Exception:
            return False
    return stored == raw


@api_view(['GET'])
def profile_me(request):
    personel = resolve_personel(request)
    if not personel:
        return Response({'detail': 'Personel bulunamadı.'}, status=status.HTTP_404_NOT_FOUND)
    return Response(personel_payload(personel))


@api_view(['GET'])
def profile_sessions(request):
    personel = resolve_personel(request)
    if not personel:
        return Response({'detail': 'Personel bulunamadı.'}, status=status.HTTP_404_NOT_FOUND)

    rows = OturumKayitlari.objects.filter(personel=personel).order_by('-giris_zamani')[:50]
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
    return Response({'personel_id': personel.id, 'oturumlar': data})


@api_view(['POST'])
def profile_change_email(request):
    personel = resolve_personel(request)
    if not personel:
        return Response({'detail': 'Personel bulunamadı.'}, status=status.HTTP_404_NOT_FOUND)

    yeni = (request.data.get('yeni_email') or '').strip()
    sifre = request.data.get('sifre') or ''
    if not yeni or '@' not in yeni:
        return Response({'detail': 'Geçerli bir e-posta girin.'}, status=status.HTTP_400_BAD_REQUEST)
    if not verify_sifre(sifre, personel.sifre):
        return Response({'detail': 'Şifre hatalı.'}, status=status.HTTP_400_BAD_REQUEST)
    if (
        Personeller.objects.filter(email=yeni).exclude(pk=personel.pk).exists()
    ):
        return Response({'detail': 'Bu e-posta zaten kullanılıyor.'}, status=status.HTTP_400_BAD_REQUEST)

    personel.email = yeni
    personel.save(update_fields=['email'])
    return Response({'status': 'ok', 'personel': personel_payload(personel)})


@api_view(['POST'])
def profile_change_password(request):
    personel = resolve_personel(request)
    if not personel:
        return Response({'detail': 'Personel bulunamadı.'}, status=status.HTTP_404_NOT_FOUND)

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
    if not verify_sifre(mevcut, personel.sifre):
        return Response({'detail': 'Mevcut şifre hatalı.'}, status=status.HTTP_400_BAD_REQUEST)

    personel.sifre = make_password(yeni)
    personel.save(update_fields=['sifre'])
    return Response({'status': 'ok', 'message': 'Şifre güncellendi.'})
