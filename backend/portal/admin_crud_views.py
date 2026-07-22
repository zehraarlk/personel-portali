"""Admin CRUD — etkinlikler, etkinlikler_duyurular, personeller, yoneticiler."""
from django.contrib.auth.hashers import make_password
from django.utils import timezone
from rest_framework import serializers, viewsets
from rest_framework.permissions import AllowAny

from .models import (
    Etkinlikler,
    EtkinliklerDuyurular,
    Personeller,
    Yoneticiler,
    normalize_image_path,
)


class AdminEtkinlikSerializer(serializers.ModelSerializer):
    resim_url = serializers.SerializerMethodField(read_only=True)

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
            'resim_url',
            'durum',
        ]

    def get_resim_url(self, obj):
        return normalize_image_path(obj.resim)


class AdminEtkinlikDuyuruSerializer(serializers.ModelSerializer):
    resim_display = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = EtkinliklerDuyurular
        fields = [
            'id',
            'sayfa_tipi',
            'baslik',
            'aciklama',
            'resim_url',
            'resim_display',
            'tarih',
            'kategori',
        ]

    def get_resim_display(self, obj):
        return normalize_image_path(obj.resim_url)


class AdminPersonelSerializer(serializers.ModelSerializer):
    ad_soyad = serializers.SerializerMethodField(read_only=True)
    foto = serializers.SerializerMethodField(read_only=True)
    sifre = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = Personeller
        fields = [
            'id',
            'sicil_no',
            'ad',
            'soyad',
            'ad_soyad',
            'email',
            'sifre',
            'telefon',
            'tc_no',
            'dogum_tarihi',
            'foto',
            'foto_url',
        ]

    def get_ad_soyad(self, obj):
        return f'{obj.ad} {obj.soyad}'.strip()

    def get_foto(self, obj):
        return normalize_image_path(obj.foto_url)

    def create(self, validated_data):
        raw = validated_data.pop('sifre', None)
        if not raw:
            raise serializers.ValidationError({'sifre': 'Şifre gerekli.'})
        validated_data['sifre'] = make_password(raw)
        if not validated_data.get('foto_url'):
            validated_data['foto_url'] = '../images/gebze-logo.webp'
        return super().create(validated_data)

    def update(self, instance, validated_data):
        raw = validated_data.pop('sifre', None)
        if raw:
            validated_data['sifre'] = make_password(raw)
        return super().update(instance, validated_data)


class AdminYoneticiSerializer(serializers.ModelSerializer):
    ad_soyad = serializers.SerializerMethodField(read_only=True)
    foto = serializers.SerializerMethodField(read_only=True)
    sifre = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = Yoneticiler
        fields = [
            'id',
            'kullanici_adi',
            'sifre',
            'ad',
            'soyad',
            'ad_soyad',
            'yetki',
            'aktif',
            'olusturma_tarihi',
            'foto',
            'foto_url',
        ]
        read_only_fields = ['olusturma_tarihi']

    def get_ad_soyad(self, obj):
        return f'{obj.ad} {obj.soyad}'.strip()

    def get_foto(self, obj):
        return normalize_image_path(obj.foto_url)

    def create(self, validated_data):
        raw = validated_data.pop('sifre', None)
        if not raw:
            raise serializers.ValidationError({'sifre': 'Şifre gerekli.'})
        validated_data['sifre'] = make_password(raw)
        validated_data['olusturma_tarihi'] = timezone.now()
        if validated_data.get('aktif') is None:
            validated_data['aktif'] = 1
        if not validated_data.get('yetki'):
            validated_data['yetki'] = 'yonetici'
        return super().create(validated_data)

    def update(self, instance, validated_data):
        raw = validated_data.pop('sifre', None)
        if raw:
            validated_data['sifre'] = make_password(raw)
        return super().update(instance, validated_data)


class EtkinlikViewSet(viewsets.ModelViewSet):
    queryset = Etkinlikler.objects.all().order_by('-id')
    serializer_class = AdminEtkinlikSerializer
    permission_classes = [AllowAny]
    authentication_classes = []
    pagination_class = None


class EtkinlikDuyuruViewSet(viewsets.ModelViewSet):
    """Portal duyurular menüsü → etkinlikler_duyurular (sayfa_tipi=duyuru)."""

    serializer_class = AdminEtkinlikDuyuruSerializer
    permission_classes = [AllowAny]
    authentication_classes = []
    pagination_class = None

    def get_queryset(self):
        return EtkinliklerDuyurular.objects.filter(sayfa_tipi='duyuru').order_by('-id')

    def perform_create(self, serializer):
        serializer.save(sayfa_tipi='duyuru')


class PersonelViewSet(viewsets.ModelViewSet):
    queryset = Personeller.objects.all().order_by('id')
    serializer_class = AdminPersonelSerializer
    permission_classes = [AllowAny]
    authentication_classes = []
    pagination_class = None


class YoneticiViewSet(viewsets.ModelViewSet):
    queryset = Yoneticiler.objects.all().order_by('id')
    serializer_class = AdminYoneticiSerializer
    permission_classes = [AllowAny]
    authentication_classes = []
    pagination_class = None
