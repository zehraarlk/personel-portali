from rest_framework import serializers
from .models import Haber, Duyuru, Personel, AnasayfaLink, SiteIkon


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
