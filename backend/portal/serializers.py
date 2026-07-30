from rest_framework import serializers

from .models import (
    Haber,
    Duyuru,
    Personel,
    AnasayfaLink,
    SiteIkon,
    SizdenGelenler,
    SizdengelenlerKategori,
    normalize_image_path,
    Videolar,
    VideolarKategori,
    Etkinlikler,
    EtkinliklerDurum,
    EtkinliklerDuyurular,
    DuyurularKategori,
    VefatBilgileri,
    Anketler,
    AnketKatilimlari,
)


class HaberSerializer(serializers.ModelSerializer):
    resim = serializers.CharField(source='resim_url', read_only=True)

    class Meta:
        model = Haber
        fields = ['id', 'baslik', 'resim']


class DuyuruSerializer(serializers.ModelSerializer):
    resim = serializers.CharField(source='resim_url', read_only=True)

    class Meta:
        model = Duyuru
        fields = ['id', 'baslik', 'aciklama', 'resim', 'view']


class BirthdaySerializer(serializers.ModelSerializer):
    foto = serializers.CharField(read_only=True)
    ad_soyad = serializers.SerializerMethodField()

    class Meta:
        model = Personel
        fields = ['id', 'ad', 'soyad', 'ad_soyad', 'foto', 'dogum_tarihi']

    def get_ad_soyad(self, obj):
        return f'{obj.ad} {obj.soyad}'


class AnasayfaLinkSerializer(serializers.ModelSerializer):
    logo = serializers.CharField(read_only=True)

    class Meta:
        model = AnasayfaLink
        fields = ['id', 'baslik', 'logo', 'hedef_url']


class SiteIkonSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteIkon
        fields = ['id', 'anahtar', 'ad', 'kategori', 'ikon_sinifi', 'renk', 'sira']


class SizdengelenlerKategoriSerializer(serializers.ModelSerializer):
    class Meta:
        model = SizdengelenlerKategori
        fields = ['id', 'slug', 'ad']


class SizdenGelenlerSerializer(serializers.ModelSerializer):
    kategori = serializers.StringRelatedField()
    kategori_slug = serializers.SerializerMethodField()
    resim = serializers.SerializerMethodField()

    class Meta:
        model = SizdenGelenler
        fields = ['id', 'baslik', 'ozet', 'tarih', 'goruntulenme', 'resim', 'kategori', 'kategori_slug']

    def get_resim(self, obj):
        return normalize_image_path(obj.gorsel_yolu)

    def get_kategori_slug(self, obj):
        return obj.kategori.slug if obj.kategori else None


class VideoKategoriSerializer(serializers.ModelSerializer):
    class Meta:
        model = VideolarKategori
        fields = ['id', 'slug', 'ad']


class VideoSerializer(serializers.ModelSerializer):
    kategori = VideoKategoriSerializer(read_only=True)
    thumbnail = serializers.SerializerMethodField()
    youtube_url = serializers.SerializerMethodField()
    embed_url = serializers.SerializerMethodField()

    class Meta:
        model = Videolar
        fields = [
            'id',
            'youtube_id',
            'baslik',
            'aciklama',
            'sure',
            'kategori',
            'vitrin',
            'vitrin_baslik',
            'vitrin_aciklama',
            'thumbnail',
            'youtube_url',
            'embed_url',
        ]

    def get_thumbnail(self, obj):
        return f'https://i.ytimg.com/vi/{obj.youtube_id}/maxresdefault.jpg'

    def get_youtube_url(self, obj):
        return f'https://www.youtube.com/watch?v={obj.youtube_id}'

    def get_embed_url(self, obj):
        return f'https://www.youtube.com/embed/{obj.youtube_id}'


class EtkinliklerDurumSerializer(serializers.ModelSerializer):
    class Meta:
        model = EtkinliklerDurum
        fields = ['id', 'slug', 'ad']


class EtkinlikSerializer(serializers.ModelSerializer):
    durum_ref = serializers.StringRelatedField()
    durum_ref_slug = serializers.SerializerMethodField()
    resim = serializers.SerializerMethodField()

    class Meta:
        model = Etkinlikler
        fields = [
            'id',
            'baslik',
            'aciklama',
            'tarih',
            'bitis_tarihi',
            'view',
            'resim',
            'durum',
            'durum_ref',
            'durum_ref_slug',
        ]

    def get_resim(self, obj):
        return normalize_image_path(obj.resim)

    def get_durum_ref_slug(self, obj):
        return obj.durum_ref.slug if obj.durum_ref else None

class DuyurularKategoriSerializer(serializers.ModelSerializer):
    class Meta:
        model = DuyurularKategori
        fields = ['id', 'slug', 'ad']


class EtkinlikDuyuruSerializer(serializers.ModelSerializer):
    kategori = serializers.StringRelatedField()
    kategori_slug = serializers.SerializerMethodField()
    resim = serializers.SerializerMethodField()

    class Meta:
        model = EtkinliklerDuyurular
        fields = [
            'id',
            'sayfa_tipi',
            'baslik',
            'aciklama',
            'resim',
            'tarih',
            'kategori',
            'kategori_slug',
        ]

    def get_resim(self, obj):
        return normalize_image_path(obj.resim_url or '')

    def get_kategori_slug(self, obj):
        return obj.kategori.slug if obj.kategori else None

class VefatBilgileriSerializer(serializers.ModelSerializer):
    class Meta:
        model = VefatBilgileri
        fields = [
            'id',
            'vefat_eden_adi',
            'iliski_pozisyon',
            'vefat_tarihi',
            'vefat_tarihi_metin',
            'cenaze_mesaji',
        ]


_ANKET_STATUS = {
    'pending': {'label': 'Beklemede', 'class': 'is-pending', 'icon': 'schedule'},
    'completed': {'label': 'Tamamlandı', 'class': 'is-completed', 'icon': 'check_circle'},
    'expired': {'label': 'Süresi Doldu', 'class': 'is-expired', 'icon': 'cancel'},
    'active': {'label': 'Aktif', 'class': 'is-active', 'icon': 'play_circle'},
}

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


def _anket_date_label(value):
    if not value:
        return ''
    return f'{value.day} {_TR_MONTHS[value.month]} {value.year}'


class AnketListSerializer(serializers.ModelSerializer):
    resim = serializers.SerializerMethodField()
    kategori_slug = serializers.SerializerMethodField()
    kategori_ad = serializers.SerializerMethodField()
    status_label = serializers.SerializerMethodField()
    status_class = serializers.SerializerMethodField()
    status_icon = serializers.SerializerMethodField()
    date_label = serializers.SerializerMethodField()
    percent = serializers.SerializerMethodField()
    favorite = serializers.SerializerMethodField()
    participated = serializers.SerializerMethodField()
    excerpt = serializers.SerializerMethodField()

    class Meta:
        model = Anketler
        fields = [
            'id',
            'baslik',
            'aciklama',
            'excerpt',
            'resim',
            'baslangic_tarihi',
            'bitis_tarihi',
            'date_label',
            'katilim_sayisi',
            'hedef_katilim',
            'percent',
            'kategori_slug',
            'kategori_ad',
            'status_label',
            'status_class',
            'status_icon',
            'favorite',
            'participated',
        ]

    def _slug(self, obj):
        slug = (obj.kategori.slug if obj.kategori_id and obj.kategori else '') or 'active'
        return slug

    def _meta(self, obj):
        return _ANKET_STATUS.get(self._slug(obj), _ANKET_STATUS['active'])

    def get_resim(self, obj):
        return normalize_image_path(obj.resim_url or '')

    def get_kategori_slug(self, obj):
        return self._slug(obj)

    def get_kategori_ad(self, obj):
        if obj.kategori_id and obj.kategori:
            return obj.kategori.ad
        return ''

    def get_status_label(self, obj):
        return self._meta(obj)['label']

    def get_status_class(self, obj):
        return self._meta(obj)['class']

    def get_status_icon(self, obj):
        return self._meta(obj)['icon']

    def get_date_label(self, obj):
        start = _anket_date_label(obj.baslangic_tarihi)
        end = _anket_date_label(obj.bitis_tarihi)
        if start and end:
            return f'{start} - {end}'
        return start or end

    def get_percent(self, obj):
        katilim = int(obj.katilim_sayisi or 0)
        hedef = max(1, int(obj.hedef_katilim or 1))
        return min(100, int(round((katilim / hedef) * 100)))

    def get_favorite(self, obj):
        return int(obj.favori or 0) == 1

    def get_participated(self, obj):
        ids = self.context.get('participated_ids') or set()
        return obj.id in ids

    def get_excerpt(self, obj):
        text = (obj.aciklama or '').strip()
        if len(text) <= 140:
            return text
        return f'{text[:139].rstrip()}…'