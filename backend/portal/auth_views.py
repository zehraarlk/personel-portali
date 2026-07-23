"""Personel / yönetici giriş ve şifre sıfırlama API."""
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .admin_profile_views import resolve_yonetici, yonetici_payload
from .models import OturumKayitlari, Personeller, YoneticiOturumKayitlari, Yoneticiler
from .profile_views import personel_payload, resolve_personel, verify_sifre

KAPANIS_TIPLERI = frozenset({'manuel', 'sekme', 'otomatik', 'eski', 'cikis'})


def _client_meta(request):
    ip = (
        request.META.get('HTTP_X_FORWARDED_FOR', '').split(',')[0].strip()
        or request.META.get('REMOTE_ADDR')
        or ''
    )
    ua = (request.META.get('HTTP_USER_AGENT') or '')[:255]
    return ip[:45], ua


def _kapanis_tipi(raw, default='manuel'):
    tip = (raw or default).strip().lower()
    return tip if tip in KAPANIS_TIPLERI else default


def _close_open_personel_sessions(personel_id, *, except_id=None, tip='otomatik'):
    now = timezone.now()
    qs = OturumKayitlari.objects.filter(personel_id=personel_id, cikis_zamani__isnull=True)
    if except_id:
        qs = qs.exclude(pk=except_id)
    qs.update(cikis_zamani=now, kapanis_tipi=tip, son_aktivite=now)


def _close_open_yonetici_sessions(yonetici_id, *, except_id=None, tip='otomatik'):
    now = timezone.now()
    qs = YoneticiOturumKayitlari.objects.filter(yonetici_id=yonetici_id, cikis_zamani__isnull=True)
    if except_id:
        qs = qs.exclude(pk=except_id)
    qs.update(cikis_zamani=now, kapanis_tipi=tip, son_aktivite=now)


def _close_personel_oturum(oturum_id, personel_id, tip):
    now = timezone.now()
    qs = OturumKayitlari.objects.filter(pk=oturum_id, cikis_zamani__isnull=True)
    if personel_id:
        qs = qs.filter(personel_id=personel_id)
    return qs.update(cikis_zamani=now, kapanis_tipi=tip, son_aktivite=now)


def _close_yonetici_oturum(oturum_id, yonetici_id, tip):
    now = timezone.now()
    qs = YoneticiOturumKayitlari.objects.filter(pk=oturum_id, cikis_zamani__isnull=True)
    if yonetici_id:
        qs = qs.filter(yonetici_id=yonetici_id)
    return qs.update(cikis_zamani=now, kapanis_tipi=tip, son_aktivite=now)


@api_view(['POST'])
def auth_login(request):
    sicil_no = (request.data.get('sicil_no') or '').strip()
    sifre = request.data.get('sifre') or ''

    if not sicil_no or not sifre:
        return Response(
            {'status': 'error', 'message': 'Sicil no ve şifre zorunludur.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    personel = Personeller.objects.filter(sicil_no=sicil_no).first()
    if not personel or not verify_sifre(sifre, personel.sifre):
        return Response(
            {'status': 'error', 'message': 'Sicil no veya şifre hatalı.'},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    # Önceki açık oturumları kapat (PHP oturumCloseOtherOpen)
    _close_open_personel_sessions(personel.id, tip='otomatik')

    now = timezone.now()
    ip, ua = _client_meta(request)
    oturum = OturumKayitlari.objects.create(
        personel=personel,
        giris_zamani=now,
        ip_adresi=ip or None,
        user_agent=ua or None,
        son_aktivite=now,
    )

    return Response(
        {
            'status': 'ok',
            'message': 'Giriş başarılı.',
            'personel': personel_payload(personel),
            'oturum_id': oturum.id,
        }
    )


@api_view(['POST'])
def auth_admin_login(request):
    kullanici_adi = (request.data.get('kullanici_adi') or '').strip()
    sifre = request.data.get('sifre') or ''

    if not kullanici_adi or not sifre:
        return Response(
            {'status': 'error', 'message': 'Kullanıcı adı ve şifre zorunludur.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    yonetici = Yoneticiler.objects.filter(kullanici_adi__iexact=kullanici_adi, aktif=1).first()
    if not yonetici or not verify_sifre(sifre, yonetici.sifre):
        return Response(
            {'status': 'error', 'message': 'Kullanıcı adı veya şifre hatalı.'},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    _close_open_yonetici_sessions(yonetici.id, tip='otomatik')

    now = timezone.now()
    ip, ua = _client_meta(request)
    oturum = YoneticiOturumKayitlari.objects.create(
        yonetici=yonetici,
        giris_zamani=now,
        ip_adresi=ip or None,
        user_agent=ua or None,
        son_aktivite=now,
    )

    return Response(
        {
            'status': 'ok',
            'message': 'Giriş başarılı.',
            'yonetici': yonetici_payload(yonetici),
            'oturum_id': oturum.id,
        }
    )


@api_view(['POST'])
def auth_forgot_password(request):
    tc_no = ''.join(c for c in (request.data.get('tc_no') or '') if c.isdigit())
    telefon = ''.join(c for c in (request.data.get('telefon') or '') if c.isdigit())

    if len(tc_no) != 11:
        return Response(
            {
                'status': 'error',
                'message': 'Geçerli bir T.C. Kimlik Numarası giriniz.',
            },
            status=status.HTTP_400_BAD_REQUEST,
        )
    if len(telefon) != 11 or not telefon.startswith('05'):
        return Response(
            {
                'status': 'error',
                'message': 'Geçerli bir cep telefonu numarası giriniz. Örn: 05XX XXX XX XX',
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    personel = Personeller.objects.filter(tc_no=tc_no).first()
    if not personel:
        return Response(
            {
                'status': 'error',
                'message': 'Girdiğiniz bilgilerle eşleşen bir personel kaydı bulunamadı.',
            },
            status=status.HTTP_404_NOT_FOUND,
        )

    stored_phone = ''.join(c for c in (personel.telefon or '') if c.isdigit())
    if stored_phone != telefon:
        if not (len(stored_phone) == 10 and ('0' + stored_phone) == telefon):
            return Response(
                {
                    'status': 'error',
                    'message': 'Girdiğiniz bilgilerle eşleşen bir personel kaydı bulunamadı.',
                },
                status=status.HTTP_404_NOT_FOUND,
            )

    return Response(
        {
            'status': 'ok',
            'message': 'Şifreniz sıfırlandı. Yeni şifreniz kayıtlı iletişim bilgilerinize gönderildi.',
        }
    )


@api_view(['POST'])
def auth_logout(request):
    """
    Personel oturum kapatma.
    Body (sendBeacon uyumlu): oturum_id, personel_id, kapanis_tipi
    veya X-Personel-Id ile açık oturumlar.
    """
    tip = _kapanis_tipi(request.data.get('kapanis_tipi'), 'manuel')
    raw_oturum = request.data.get('oturum_id')
    raw_personel = request.data.get('personel_id') or request.headers.get('X-Personel-Id')

    try:
        oturum_id = int(raw_oturum) if raw_oturum not in (None, '') else None
    except (TypeError, ValueError):
        oturum_id = None
    try:
        personel_id = int(raw_personel) if raw_personel not in (None, '') else None
    except (TypeError, ValueError):
        personel_id = None

    closed = 0
    if oturum_id:
        closed = _close_personel_oturum(oturum_id, personel_id, tip)
    elif personel_id:
        now = timezone.now()
        closed = OturumKayitlari.objects.filter(
            personel_id=personel_id, cikis_zamani__isnull=True
        ).update(cikis_zamani=now, kapanis_tipi=tip, son_aktivite=now)
    else:
        personel = resolve_personel(request)
        if personel:
            now = timezone.now()
            closed = OturumKayitlari.objects.filter(
                personel=personel, cikis_zamani__isnull=True
            ).update(cikis_zamani=now, kapanis_tipi=tip, son_aktivite=now)

    return Response({'status': 'ok', 'message': 'Çıkış yapıldı.', 'closed': closed})


@api_view(['POST'])
def auth_admin_logout(request):
    tip = _kapanis_tipi(request.data.get('kapanis_tipi'), 'manuel')
    raw_oturum = request.data.get('oturum_id')
    raw_yonetici = request.data.get('yonetici_id') or request.headers.get('X-Yonetici-Id')

    try:
        oturum_id = int(raw_oturum) if raw_oturum not in (None, '') else None
    except (TypeError, ValueError):
        oturum_id = None
    try:
        yonetici_id = int(raw_yonetici) if raw_yonetici not in (None, '') else None
    except (TypeError, ValueError):
        yonetici_id = None

    closed = 0
    if oturum_id:
        closed = _close_yonetici_oturum(oturum_id, yonetici_id, tip)
    elif yonetici_id:
        now = timezone.now()
        closed = YoneticiOturumKayitlari.objects.filter(
            yonetici_id=yonetici_id, cikis_zamani__isnull=True
        ).update(cikis_zamani=now, kapanis_tipi=tip, son_aktivite=now)
    else:
        yonetici = resolve_yonetici(request)
        if yonetici:
            now = timezone.now()
            closed = YoneticiOturumKayitlari.objects.filter(
                yonetici=yonetici, cikis_zamani__isnull=True
            ).update(cikis_zamani=now, kapanis_tipi=tip, son_aktivite=now)

    return Response({'status': 'ok', 'message': 'Çıkış yapıldı.', 'closed': closed})
