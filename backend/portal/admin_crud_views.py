"""Admin CRUD — etkinlikler, etkinlikler_duyurular, personeller, yoneticiler."""
from datetime import date

from django.contrib.auth.hashers import make_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.utils import timezone
from rest_framework import serializers, viewsets
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from django.db import transaction

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
    Anketler,
    AnketlerKategori,
    AnketSorulari,
    AnketSecenekleri,
    AnketCevaplari,
    AnketKatilimlari,
    YardimciLinkler,
    YardimciLinklerKategori,
    VefatBilgileri,
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
        return f'https://i.ytimg.com/vi/{obj.youtube_id}/maxresdefault.jpg'

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


# ───────────────────── Genel Kaynak ViewSet (Dökümanlar, Mevzuatlar, Eğitimler) ─────────────────────

def _kaynak_viewset_factory(kategori_slug, default_icon):
    """Verilen kategori slug için ViewSet üretir (Protokoller ile aynı model/serializer)."""

    class _Serializer(serializers.ModelSerializer):
        kategori_ad = serializers.SerializerMethodField(read_only=True)
        alt_kategori_ad = serializers.SerializerMethodField(read_only=True)

        class Meta:
            model = Kaynaklar
            fields = [
                'id', 'baslik', 'aciklama', 'ikon', 'dosya_yolu',
                'resmi_sayfa', 'boyut', 'tarih', 'kategori', 'kategori_ad',
                'alt_kategori', 'alt_kategori_ad',
            ]
            read_only_fields = ['kategori']

        def get_kategori_ad(self, obj):
            return obj.kategori.ad if obj.kategori_id else None

        def get_alt_kategori_ad(self, obj):
            return obj.alt_kategori.ad if obj.alt_kategori_id else None

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
            kategori = KaynaklarKategori.objects.filter(slug=kategori_slug).first()
            if not kategori:
                raise serializers.ValidationError(
                    {'kategori': f'{kategori_slug} kategorisi bulunamadı.'}
                )
            validated_data['kategori'] = kategori
            if not validated_data.get('ikon'):
                validated_data['ikon'] = default_icon
            if validated_data.get('resmi_sayfa') == '':
                validated_data['resmi_sayfa'] = None
            return super().create(validated_data)

        def update(self, instance, validated_data):
            validated_data.pop('kategori', None)
            if validated_data.get('resmi_sayfa') == '':
                validated_data['resmi_sayfa'] = None
            if not validated_data.get('ikon'):
                validated_data['ikon'] = instance.ikon or default_icon
            return super().update(instance, validated_data)

    class _ViewSet(viewsets.ModelViewSet):
        serializer_class = _Serializer
        permission_classes = [AllowAny]
        authentication_classes = []
        pagination_class = None

        def get_queryset(self):
            from django.db.models import Q

            # Public API ile aynı esnek eşleme (Türkçe karakter / ASCII varyantları)
            slug_q = Q(kategori__slug=kategori_slug) | Q(kategori__ad=kategori_slug)
            if kategori_slug == 'Dökümanlar':
                slug_q |= (
                    Q(kategori__slug__iexact='Dokümanlar')
                    | Q(kategori__slug__iexact='Dökümanlar')
                    | Q(kategori__ad__iexact='Dokümanlar')
                    | Q(kategori__ad__iexact='Dökümanlar')
                )
            elif kategori_slug == 'Eğitimler':
                slug_q |= (
                    Q(kategori__slug__iexact='Eğitimler')
                    | Q(kategori__slug__iexact='Egitimler')
                    | Q(kategori__ad__iexact='Eğitimler')
                    | Q(kategori__ad__iexact='Egitimler')
                )
            elif kategori_slug == 'Mevzuatlar':
                slug_q |= (
                    Q(kategori__slug__iexact='Mevzuatlar')
                    | Q(kategori__ad__iexact='Mevzuatlar')
                )

            return (
                Kaynaklar.objects.select_related('kategori', 'alt_kategori')
                .filter(slug_q)
                .order_by('-id')
            )

    _Serializer.__name__ = f'Admin{kategori_slug.replace("ö","o").replace("ü","u").replace("ı","i").replace("İ","I")}Serializer'
    _ViewSet.__name__ = f'{kategori_slug.replace("ö","o").replace("ü","u").replace("ı","i").replace("İ","I")}ViewSet'
    return _ViewSet


DokumanlarViewSet = _kaynak_viewset_factory('Dökümanlar', 'fas fa-file-alt')
MevzuatlarViewSet = _kaynak_viewset_factory('Mevzuatlar', 'fas fa-folder-open')
EgitimlerViewSet = _kaynak_viewset_factory('Eğitimler', 'fas fa-graduation-cap')


# ───────────────────── Anketler ─────────────────────

ANKET_SORU_TIPLERI = ('coktan_secmeli', 'acik_uclu')


class AdminAnketKategoriSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnketlerKategori
        fields = ['id', 'slug', 'ad']


class AdminAnketSecenekSerializer(serializers.Serializer):
    id = serializers.IntegerField(required=False, allow_null=True)
    secenek_metni = serializers.CharField(max_length=255)


class AdminAnketSoruSerializer(serializers.Serializer):
    id = serializers.IntegerField(required=False, allow_null=True)
    soru_metni = serializers.CharField()
    soru_tipi = serializers.ChoiceField(choices=ANKET_SORU_TIPLERI)
    sira = serializers.IntegerField(min_value=1)
    secenekler = AdminAnketSecenekSerializer(many=True, required=False)

    def validate(self, attrs):
        tip = attrs.get('soru_tipi')
        secenekler = attrs.get('secenekler') or []
        if tip == 'coktan_secmeli' and len(secenekler) < 2:
            raise serializers.ValidationError(
                {'secenekler': 'Çoktan seçmeli soruda en az 2 seçenek gerekir.'}
            )
        if tip == 'acik_uclu':
            attrs['secenekler'] = []
        return attrs


class AdminAnketSerializer(serializers.ModelSerializer):
    kategori_ad = serializers.SerializerMethodField(read_only=True)
    kategori_slug = serializers.SerializerMethodField(read_only=True)
    resim_display = serializers.SerializerMethodField(read_only=True)
    sorular = AdminAnketSoruSerializer(many=True, required=False)

    class Meta:
        model = Anketler
        fields = [
            'id',
            'baslik',
            'aciklama',
            'resim_url',
            'resim_display',
            'baslangic_tarihi',
            'bitis_tarihi',
            'katilim_sayisi',
            'hedef_katilim',
            'favori',
            'kategori',
            'kategori_ad',
            'kategori_slug',
            'sorular',
        ]
        read_only_fields = ['katilim_sayisi']

    def get_kategori_ad(self, obj):
        return obj.kategori.ad if obj.kategori_id else None

    def get_kategori_slug(self, obj):
        return obj.kategori.slug if obj.kategori_id else None

    def get_resim_display(self, obj):
        return normalize_image_path(obj.resim_url) or (obj.resim_url or '')

    def _serialize_sorular(self, obj):
        rows = []
        for soru in AnketSorulari.objects.filter(anket=obj).order_by('sira', 'id'):
            secenekler = [
                {'id': s.id, 'secenek_metni': s.secenek_metni}
                for s in AnketSecenekleri.objects.filter(soru=soru).order_by('id')
            ]
            rows.append(
                {
                    'id': soru.id,
                    'soru_metni': soru.soru_metni,
                    'soru_tipi': soru.soru_tipi,
                    'sira': soru.sira,
                    'secenekler': secenekler,
                }
            )
        return rows

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['sorular'] = self._serialize_sorular(instance)
        return data

    def validate_baslik(self, value):
        title = (value or '').strip()
        if not title:
            raise serializers.ValidationError('Başlık zorunludur.')
        if len(title) > 255:
            raise serializers.ValidationError('Başlık en fazla 255 karakter olabilir.')
        return title

    def validate_favori(self, value):
        try:
            n = int(value)
        except (TypeError, ValueError):
            raise serializers.ValidationError('Favori 0 veya 1 olmalıdır.')
        if n not in (0, 1):
            raise serializers.ValidationError('Favori 0 veya 1 olmalıdır.')
        return n

    def validate_hedef_katilim(self, value):
        if value is None or value == '':
            return None
        try:
            n = int(value)
        except (TypeError, ValueError):
            raise serializers.ValidationError('Hedef katılım sayı olmalıdır.')
        if n < 0:
            raise serializers.ValidationError('Hedef katılım negatif olamaz.')
        return n

    def validate(self, attrs):
        start = attrs.get('baslangic_tarihi', getattr(self.instance, 'baslangic_tarihi', None))
        end = attrs.get('bitis_tarihi', getattr(self.instance, 'bitis_tarihi', None))
        if start and end and end < start:
            raise serializers.ValidationError(
                {'bitis_tarihi': 'Bitiş tarihi başlangıçtan önce olamaz.'}
            )
        return attrs

    def _sync_sorular(self, anket, sorular):
        if sorular is None:
            return
        keep_ids = []
        for idx, item in enumerate(sorular):
            soru_id = item.get('id')
            sira = item.get('sira') or (idx + 1)
            tip = item['soru_tipi']
            metin = item['soru_metni'].strip()
            if soru_id:
                soru = AnketSorulari.objects.filter(id=soru_id, anket=anket).first()
                if not soru:
                    soru = AnketSorulari(anket=anket)
            else:
                soru = AnketSorulari(anket=anket)
            soru.soru_metni = metin
            soru.soru_tipi = tip
            soru.sira = sira
            soru.save()
            keep_ids.append(soru.id)

            secenekler = item.get('secenekler') or []
            if tip == 'acik_uclu':
                AnketSecenekleri.objects.filter(soru=soru).delete()
                continue

            keep_secenek = []
            for sec in secenekler:
                sid = sec.get('id')
                text = (sec.get('secenek_metni') or '').strip()
                if not text:
                    continue
                if sid:
                    row = AnketSecenekleri.objects.filter(id=sid, soru=soru).first()
                    if not row:
                        row = AnketSecenekleri(soru=soru)
                else:
                    row = AnketSecenekleri(soru=soru)
                row.secenek_metni = text
                row.save()
                keep_secenek.append(row.id)
            AnketSecenekleri.objects.filter(soru=soru).exclude(id__in=keep_secenek).delete()

        stale = AnketSorulari.objects.filter(anket=anket).exclude(id__in=keep_ids)
        stale_ids = list(stale.values_list('id', flat=True))
        if stale_ids:
            AnketCevaplari.objects.filter(soru_id__in=stale_ids).delete()
            AnketSecenekleri.objects.filter(soru_id__in=stale_ids).delete()
            stale.delete()

    @transaction.atomic
    def create(self, validated_data):
        sorular = validated_data.pop('sorular', None)
        if validated_data.get('resim_url') == '':
            validated_data['resim_url'] = None
        if validated_data.get('katilim_sayisi') is None:
            validated_data['katilim_sayisi'] = 0
        if validated_data.get('favori') is None:
            validated_data['favori'] = 0
        anket = super().create(validated_data)
        self._sync_sorular(anket, sorular if sorular is not None else [])
        return anket

    @transaction.atomic
    def update(self, instance, validated_data):
        sorular = validated_data.pop('sorular', None)
        if validated_data.get('resim_url') == '':
            validated_data['resim_url'] = None
        anket = super().update(instance, validated_data)
        if sorular is not None:
            self._sync_sorular(anket, sorular)
        return anket


class AnketKategoriViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AnketlerKategori.objects.all().order_by('id')
    serializer_class = AdminAnketKategoriSerializer
    permission_classes = [AllowAny]
    authentication_classes = []
    pagination_class = None


class AnketViewSet(viewsets.ModelViewSet):
    queryset = Anketler.objects.select_related('kategori').all().order_by('-id')
    serializer_class = AdminAnketSerializer
    permission_classes = [AllowAny]
    authentication_classes = []
    pagination_class = None

    @transaction.atomic
    def perform_destroy(self, instance):
        soru_ids = list(
            AnketSorulari.objects.filter(anket=instance).values_list('id', flat=True)
        )
        AnketCevaplari.objects.filter(anket=instance).delete()
        AnketKatilimlari.objects.filter(anket_id=instance.id).delete()
        if soru_ids:
            AnketSecenekleri.objects.filter(soru_id__in=soru_ids).delete()
            AnketSorulari.objects.filter(id__in=soru_ids).delete()
        instance.delete()


# ───────────────────── Yardımcı Linkler ─────────────────────

class AdminYardimciLinkKategoriSerializer(serializers.ModelSerializer):
    class Meta:
        model = YardimciLinklerKategori
        fields = ['id', 'slug', 'ad']


class AdminYardimciLinkSerializer(serializers.ModelSerializer):
    kategori_ad = serializers.SerializerMethodField(read_only=True)
    logo_display = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = YardimciLinkler
        fields = [
            'id',
            'baslik',
            'logo_url',
            'logo_display',
            'hedef_url',
            'kategori',
            'kategori_ad',
        ]

    def get_kategori_ad(self, obj):
        return obj.kategori.ad if obj.kategori_id else None

    def get_logo_display(self, obj):
        return normalize_image_path(obj.logo_url) or (obj.logo_url or '')

    def validate_baslik(self, value):
        title = (value or '').strip()
        if not title:
            raise serializers.ValidationError('Başlık zorunludur.')
        if len(title) > 255:
            raise serializers.ValidationError('Başlık en fazla 255 karakter olabilir.')
        return title

    def validate_hedef_url(self, value):
        url = (value or '').strip()
        if not url:
            raise serializers.ValidationError('Hedef URL zorunludur.')
        if len(url) > 500:
            raise serializers.ValidationError('Hedef URL en fazla 500 karakter olabilir.')
        return url

    def validate_logo_url(self, value):
        if value is None:
            return None
        path = (value or '').strip()
        return path or None

    def create(self, validated_data):
        if validated_data.get('logo_url') == '':
            validated_data['logo_url'] = None
        return super().create(validated_data)

    def update(self, instance, validated_data):
        if validated_data.get('logo_url') == '':
            validated_data['logo_url'] = None
        return super().update(instance, validated_data)


class YardimciLinkKategoriViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = YardimciLinklerKategori.objects.all().order_by('id')
    serializer_class = AdminYardimciLinkKategoriSerializer
    permission_classes = [AllowAny]
    authentication_classes = []
    pagination_class = None


class YardimciLinkViewSet(viewsets.ModelViewSet):
    queryset = YardimciLinkler.objects.select_related('kategori').all().order_by('id')
    serializer_class = AdminYardimciLinkSerializer
    permission_classes = [AllowAny]
    authentication_classes = []
    pagination_class = None

    def get_queryset(self):
        qs = super().get_queryset()
        kategori = self.request.query_params.get('kategori')
        if kategori:
            qs = qs.filter(kategori_id=kategori)
        return qs


# ───────────────────── Vefat Bilgileri ─────────────────────

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


def _vefat_tarih_metin(tarih):
    if not tarih:
        return ''
    return f'{tarih.day} {_TR_MONTHS[tarih.month]} {tarih.year}'


class AdminVefatSerializer(serializers.ModelSerializer):
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

    def validate_vefat_eden_adi(self, value):
        name = (value or '').strip()
        if not name:
            raise serializers.ValidationError('Vefat eden adı zorunludur.')
        if len(name) > 255:
            raise serializers.ValidationError('Ad en fazla 255 karakter olabilir.')
        return name

    def validate_cenaze_mesaji(self, value):
        text = (value or '').strip()
        if not text:
            raise serializers.ValidationError('Cenaze mesajı zorunludur.')
        return text

    def validate_vefat_tarihi(self, value):
        if not value:
            raise serializers.ValidationError('Vefat tarihi zorunludur.')
        return value

    def validate_iliski_pozisyon(self, value):
        if value is None:
            return ''
        return (value or '').strip()

    def validate_vefat_tarihi_metin(self, value):
        if value is None:
            return ''
        text = (value or '').strip()
        if len(text) > 50:
            raise serializers.ValidationError('Tarih metni en fazla 50 karakter olabilir.')
        return text

    def create(self, validated_data):
        if not validated_data.get('vefat_tarihi_metin'):
            validated_data['vefat_tarihi_metin'] = _vefat_tarih_metin(
                validated_data.get('vefat_tarihi')
            )
        if validated_data.get('iliski_pozisyon') is None:
            validated_data['iliski_pozisyon'] = ''
        return super().create(validated_data)

    def update(self, instance, validated_data):
        metin = validated_data.get('vefat_tarihi_metin', instance.vefat_tarihi_metin)
        if not (metin or '').strip():
            tarih = validated_data.get('vefat_tarihi', instance.vefat_tarihi)
            validated_data['vefat_tarihi_metin'] = _vefat_tarih_metin(tarih)
        return super().update(instance, validated_data)


class VefatViewSet(viewsets.ModelViewSet):
    queryset = VefatBilgileri.objects.all().order_by('-vefat_tarihi', '-id')
    serializer_class = AdminVefatSerializer
    permission_classes = [AllowAny]
    authentication_classes = []
    pagination_class = None


# ───────────────────── Doğum Günü (personellerden) ─────────────────────

_TR_MONTHS_LONG = (
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


class AdminDogumGunuSerializer(serializers.ModelSerializer):
    ad_soyad = serializers.SerializerMethodField(read_only=True)
    foto = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Personeller
        fields = [
            'id',
            'sicil_no',
            'ad',
            'soyad',
            'ad_soyad',
            'email',
            'dogum_tarihi',
            'foto',
        ]

    def get_ad_soyad(self, obj):
        return f'{obj.ad} {obj.soyad}'.strip()

    def get_foto(self, obj):
        return normalize_image_path(obj.foto_url)


class DogumGunuViewSet(viewsets.ReadOnlyModelViewSet):
    """Bugün / bu ay / tüm personel doğum günleri — personeller tablosundan."""

    serializer_class = AdminDogumGunuSerializer
    permission_classes = [AllowAny]
    authentication_classes = []
    pagination_class = None

    def get_queryset(self):
        today = date.today()
        scope = (self.request.query_params.get('scope') or 'today').strip().lower()
        qs = Personeller.objects.all()
        if scope == 'month':
            qs = qs.filter(dogum_tarihi__month=today.month)
        elif scope != 'all':
            qs = qs.filter(
                dogum_tarihi__month=today.month,
                dogum_tarihi__day=today.day,
            )
        return qs.order_by('ad', 'soyad', 'id')

    def list(self, request, *args, **kwargs):
        today = date.today()
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        scope = (request.query_params.get('scope') or 'today').strip().lower()
        if scope not in ('today', 'month', 'all'):
            scope = 'today'
        return Response(
            {
                'tarih': today.isoformat(),
                'tarih_tr': f'{today.day} {_TR_MONTHS_LONG[today.month]} {today.year}',
                'scope': scope,
                'toplam': len(serializer.data),
                'kayitlar': serializer.data,
            }
        )
