"""Admin CRUD — etkinlikler, etkinlikler_duyurular, personeller, yoneticiler."""
from django.contrib.auth.hashers import make_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.utils import timezone
from rest_framework import serializers, viewsets
from rest_framework.permissions import AllowAny

from .models import (
    Etkinlikler,
    EtkinliklerDuyurular,
    Personeller,
    Yoneticiler,
    Videolar,
    VideolarKategori,
    SizdenGelenler,
    SizdengelenlerKategori,
    Kaynaklar,
    KaynaklarKategori,
    normalize_image_path,
)
from .validators import (
    validate_birth_date,
    validate_email_address,
    validate_password,
    validate_person_name,
    validate_phone_optional,
    validate_sicil,
    validate_tc_optional,
    validate_username,
)


def _django_to_drf(exc: DjangoValidationError):
    messages = getattr(exc, "messages", None) or [str(exc)]
    raise serializers.ValidationError(messages[0])


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

    def validate_ad(self, value):
        try:
            return validate_person_name(value, 'Ad')
        except DjangoValidationError as exc:
            _django_to_drf(exc)

    def validate_soyad(self, value):
        try:
            return validate_person_name(value, 'Soyad')
        except DjangoValidationError as exc:
            _django_to_drf(exc)

    def validate_sicil_no(self, value):
        try:
            return validate_sicil(value)
        except DjangoValidationError as exc:
            _django_to_drf(exc)

    def validate_email(self, value):
        try:
            return validate_email_address(value)
        except DjangoValidationError as exc:
            _django_to_drf(exc)

    def validate_tc_no(self, value):
        try:
            return validate_tc_optional(value)
        except DjangoValidationError as exc:
            _django_to_drf(exc)

    def validate_telefon(self, value):
        try:
            return validate_phone_optional(value)
        except DjangoValidationError as exc:
            _django_to_drf(exc)

    def validate_dogum_tarihi(self, value):
        try:
            return validate_birth_date(value)
        except DjangoValidationError as exc:
            _django_to_drf(exc)

    def validate_sifre(self, value):
        required = self.instance is None
        try:
            return validate_password(value, required=required)
        except DjangoValidationError as exc:
            _django_to_drf(exc)

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

    def validate_ad(self, value):
        try:
            return validate_person_name(value, 'Ad')
        except DjangoValidationError as exc:
            _django_to_drf(exc)

    def validate_soyad(self, value):
        try:
            return validate_person_name(value, 'Soyad')
        except DjangoValidationError as exc:
            _django_to_drf(exc)

    def validate_kullanici_adi(self, value):
        try:
            return validate_username(value)
        except DjangoValidationError as exc:
            _django_to_drf(exc)

    def validate_sifre(self, value):
        required = self.instance is None
        try:
            return validate_password(value, required=required)
        except DjangoValidationError as exc:
            _django_to_drf(exc)

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


class AdminVideoSerializer(serializers.ModelSerializer):
    kategori_ad = serializers.SerializerMethodField(read_only=True)
    thumbnail = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Videolar
        fields = [
            'id',
            'youtube_id',
            'baslik',
            'aciklama',
            'sure',
            'kategori',
            'kategori_ad',
            'vitrin',
            'vitrin_baslik',
            'vitrin_aciklama',
            'thumbnail',
        ]

    def get_kategori_ad(self, obj):
        return obj.kategori.ad if obj.kategori_id else None

    def get_thumbnail(self, obj):
        if not obj.youtube_id:
            return ''
        return f'https://img.youtube.com/vi/{obj.youtube_id}/hqdefault.jpg'

    def create(self, validated_data):
        if validated_data.get('vitrin') is None:
            validated_data['vitrin'] = 0
        if not validated_data.get('sure'):
            validated_data['sure'] = '00:00'
        if not validated_data.get('aciklama'):
            validated_data['aciklama'] = ''
        return super().create(validated_data)


class AdminSizdenGelenSerializer(serializers.ModelSerializer):
    kategori_ad = serializers.SerializerMethodField(read_only=True)
    gorsel_display = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = SizdenGelenler
        fields = [
            'id',
            'baslik',
            'ozet',
            'tarih',
            'goruntulenme',
            'gorsel_yolu',
            'gorsel_display',
            'olusturma_tarihi',
            'kategori',
            'kategori_ad',
        ]
        read_only_fields = ['olusturma_tarihi']

    def get_kategori_ad(self, obj):
        return obj.kategori.ad if obj.kategori_id else None

    def get_gorsel_display(self, obj):
        return normalize_image_path(obj.gorsel_yolu)

    def create(self, validated_data):
        validated_data['olusturma_tarihi'] = timezone.now()
        if validated_data.get('goruntulenme') is None:
            validated_data['goruntulenme'] = 0
        return super().create(validated_data)


class VideoViewSet(viewsets.ModelViewSet):
    queryset = Videolar.objects.select_related('kategori').all().order_by('-id')
    serializer_class = AdminVideoSerializer
    permission_classes = [AllowAny]
    authentication_classes = []
    pagination_class = None


class SizdenGelenViewSet(viewsets.ModelViewSet):
    queryset = SizdenGelenler.objects.select_related('kategori').all().order_by('-id')
    serializer_class = AdminSizdenGelenSerializer
    permission_classes = [AllowAny]
    authentication_classes = []
    pagination_class = None


class VideoKategoriSerializer(serializers.ModelSerializer):
    class Meta:
        model = VideolarKategori
        fields = ['id', 'slug', 'ad']


class SizdenGelenKategoriSerializer(serializers.ModelSerializer):
    class Meta:
        model = SizdengelenlerKategori
        fields = ['id', 'slug', 'ad']


class VideoKategoriViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = VideolarKategori.objects.all().order_by('id')
    serializer_class = VideoKategoriSerializer
    permission_classes = [AllowAny]
    authentication_classes = []
    pagination_class = None


class SizdenGelenKategoriViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = SizdengelenlerKategori.objects.all().order_by('id')
    serializer_class = SizdenGelenKategoriSerializer
    permission_classes = [AllowAny]
    authentication_classes = []
    pagination_class = None


PROTOKOL_KATEGORI_SLUG = 'Protokoller'


def _protokol_kategori():
    return KaynaklarKategori.objects.filter(slug=PROTOKOL_KATEGORI_SLUG).first()


class AdminProtokolSerializer(serializers.ModelSerializer):
    kategori_ad = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Kaynaklar
        fields = [
            'id',
            'baslik',
            'aciklama',
            'ikon',
            'dosya_yolu',
            'resmi_sayfa',
            'boyut',
            'tarih',
            'kategori',
            'kategori_ad',
            'alt_kategori',
        ]
        read_only_fields = ['kategori', 'alt_kategori']

    def get_kategori_ad(self, obj):
        return obj.kategori.ad if obj.kategori_id else None

    def validate_baslik(self, value):
        title = (value or '').strip()
        if not title:
            raise serializers.ValidationError('Başlık zorunludur.')
        if len(title) > 255:
            raise serializers.ValidationError('Başlık en fazla 255 karakter olabilir.')
        return title

    def validate_aciklama(self, value):
        text = (value or '').strip()
        if not text:
            raise serializers.ValidationError('Açıklama zorunludur.')
        return text

    def validate_dosya_yolu(self, value):
        path = (value or '').strip()
        if not path:
            raise serializers.ValidationError('Dosya yolu / bağlantı zorunludur.')
        return path

    def validate_boyut(self, value):
        size = (value or '').strip()
        if not size:
            raise serializers.ValidationError('Boyut zorunludur. Örn: 1.7 MB')
        return size

    def validate_tarih(self, value):
        tarih = (value or '').strip()
        if not tarih:
            raise serializers.ValidationError('Tarih zorunludur.')
        return tarih

    def create(self, validated_data):
        kategori = _protokol_kategori()
        if not kategori:
            raise serializers.ValidationError(
                {'kategori': 'Protokoller kategorisi bulunamadı (kaynaklar_kategori).'}
            )
        validated_data['kategori'] = kategori
        validated_data['alt_kategori'] = None
        if not validated_data.get('ikon'):
            validated_data['ikon'] = 'fas fa-file-signature'
        if validated_data.get('resmi_sayfa') == '':
            validated_data['resmi_sayfa'] = None
        return super().create(validated_data)

    def update(self, instance, validated_data):
        validated_data.pop('kategori', None)
        validated_data.pop('alt_kategori', None)
        if validated_data.get('resmi_sayfa') == '':
            validated_data['resmi_sayfa'] = None
        if not validated_data.get('ikon'):
            validated_data['ikon'] = instance.ikon or 'fas fa-file-signature'
        return super().update(instance, validated_data)


class ProtokolViewSet(viewsets.ModelViewSet):
    """kaynaklar tablosu — yalnızca Protokoller kategorisi."""

    serializer_class = AdminProtokolSerializer
    permission_classes = [AllowAny]
    authentication_classes = []
    pagination_class = None

    def get_queryset(self):
        return (
            Kaynaklar.objects.select_related('kategori', 'alt_kategori')
            .filter(kategori__slug=PROTOKOL_KATEGORI_SLUG)
            .order_by('-id')
        )
