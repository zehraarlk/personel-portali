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
        return f'https://img.youtube.com/vi/{obj.youtube_id}/hqdefault.jpg'

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

