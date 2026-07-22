"""Admin dashboard — personel_db tablolarının özet istatistikleri ve son kayıtlar."""
from datetime import date

from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import (
    Personeller,
    AnasayfaLinkler,
    SiteIkonlari,
    Etkinlikler,
    EtkinliklerDuyurular,
    Videolar,
    SizdenGelenler,
    VefatBilgileri,
    Anketler,
    Kaynaklar,
    YardimciLinkler,
    Yoneticiler,
    OturumKayitlari,
    YoneticiOturumKayitlari,
    normalize_image_path,
)


def _count(model):
    try:
        return model.objects.count()
    except Exception:
        return 0


def _kaynak_count(slug):
    try:
        return Kaynaklar.objects.filter(kategori__slug=slug).count()
    except Exception:
        return 0


@api_view(['GET'])
def admin_dashboard(request):
    today = date.today()
    birthdays = Personeller.objects.filter(
        dogum_tarihi__month=today.month,
        dogum_tarihi__day=today.day,
    ).order_by('ad', 'soyad')[:20]

    try:
        dogum_gunu_count = Personeller.objects.filter(
            dogum_tarihi__month=today.month,
            dogum_tarihi__day=today.day,
        ).count()
    except Exception:
        dogum_gunu_count = 0

    counts = {
        'personeller': _count(Personeller),
        'yoneticiler': _count(Yoneticiler),
        'videolar': _count(Videolar),
        'sizden_gelenler': _count(SizdenGelenler),
        'etkinlikler': _count(Etkinlikler),
        'duyurular': EtkinliklerDuyurular.objects.filter(sayfa_tipi='duyuru').count(),
        'protokoller': _kaynak_count('Protokoller'),
        'dokumanlar': _kaynak_count('Dökümanlar'),
        'mevzuatlar': _kaynak_count('Mevzuatlar'),
        'egitimler': _kaynak_count('Eğitimler'),
        'anketler': _count(Anketler),
        'yardimci_linkler': _count(YardimciLinkler),
        'vefat_bilgileri': _count(VefatBilgileri),
        'dogum_gunu': dogum_gunu_count,
        # geriye dönük / diğer özetler
        'kaynaklar': _count(Kaynaklar),
        'anasayfa_linkler': _count(AnasayfaLinkler),
        'site_ikonlari': _count(SiteIkonlari),
        'oturum_kayitlari': _count(OturumKayitlari),
        'yonetici_oturum_kayitlari': _count(YoneticiOturumKayitlari),
    }

    return Response(
        {
            'tarih': today.isoformat(),
            'tarih_tr': today.strftime('%d.%m.%Y'),
            'counts': counts,
            'dogum_gunleri': [
                {
                    'id': p.id,
                    'ad_soyad': f'{p.ad} {p.soyad}'.strip(),
                    'foto': normalize_image_path(p.foto_url),
                }
                for p in birthdays
            ],
            'son_etkinlikler': [
                {
                    'id': e.id,
                    'baslik': e.baslik,
                    'tarih': e.tarih.isoformat() if e.tarih else None,
                    'durum': e.durum,
                    'resim': normalize_image_path(e.resim),
                }
                for e in Etkinlikler.objects.order_by('-id')[:8]
            ],
            'son_duyurular': [
                {
                    'id': d.id,
                    'baslik': d.baslik,
                    'tarih': d.tarih.isoformat() if d.tarih else None,
                }
                for d in EtkinliklerDuyurular.objects.filter(sayfa_tipi='duyuru').order_by('-id')[:8]
            ],
            'son_personeller': [
                {
                    'id': p.id,
                    'ad_soyad': f'{p.ad} {p.soyad}'.strip(),
                    'sicil_no': p.sicil_no,
                    'email': p.email,
                    'foto': normalize_image_path(p.foto_url),
                }
                for p in Personeller.objects.order_by('-id')[:8]
            ],
            'son_videolar': [
                {
                    'id': v.id,
                    'baslik': v.baslik,
                    'youtube_id': v.youtube_id,
                    'sure': v.sure,
                }
                for v in Videolar.objects.order_by('-id')[:8]
            ],
            'son_sizden_gelenler': [
                {
                    'id': s.id,
                    'baslik': s.baslik,
                    'tarih': s.tarih.isoformat() if s.tarih else None,
                }
                for s in SizdenGelenler.objects.order_by('-id')[:8]
            ],
            'son_vefat': [
                {
                    'id': v.id,
                    'vefat_eden_adi': v.vefat_eden_adi,
                    'vefat_tarihi': v.vefat_tarihi.isoformat() if v.vefat_tarihi else None,
                }
                for v in VefatBilgileri.objects.order_by('-id')[:8]
            ],
            'son_anketler': [
                {
                    'id': a.id,
                    'baslik': a.baslik,
                    'katilim_sayisi': a.katilim_sayisi,
                }
                for a in Anketler.objects.order_by('-id')[:8]
            ],
            'son_kaynaklar': [
                {
                    'id': k.id,
                    'baslik': k.baslik,
                    'boyut': k.boyut,
                    'tarih': k.tarih,
                }
                for k in Kaynaklar.objects.order_by('-id')[:8]
            ],
            'otomasyon': [
                {
                    'id': l.id,
                    'baslik': l.baslik,
                    'hedef_url': l.hedef_url,
                    'logo': normalize_image_path(l.logo_url),
                }
                for l in AnasayfaLinkler.objects.order_by('id')[:12]
            ],
            'yoneticiler': [
                {
                    'id': y.id,
                    'kullanici_adi': y.kullanici_adi,
                    'ad_soyad': f'{y.ad} {y.soyad}'.strip(),
                    'yetki': y.yetki,
                    'aktif': bool(y.aktif),
                    'foto': normalize_image_path(y.foto_url),
                }
                for y in Yoneticiler.objects.order_by('id')[:12]
            ],
            'son_oturumlar': [
                {
                    'id': o.id,
                    'personel': f'{o.personel.ad} {o.personel.soyad}'.strip() if o.personel_id else '—',
                    'giris_zamani': o.giris_zamani.isoformat() if o.giris_zamani else None,
                    'ip_adresi': o.ip_adresi or '',
                    'aktif': o.cikis_zamani is None,
                }
                for o in OturumKayitlari.objects.select_related('personel').order_by('-giris_zamani')[:10]
            ],
        }
    )
