from rest_framework import serializers

from .models import (
    Haber,
    Duyuru,
    Personel,
    AnasayfaLink,
    SiteIkon,
    Videolar,
    VideolarKategori,
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