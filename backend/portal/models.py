"""personel_db tablolari — managed=False (Django Admin = ayni Postgres verisi)."""
from django.db import models


def normalize_image_path(path: str) -> str:
    if not path:
        return ''
    cleaned = path.replace('\\', '/')
    if cleaned.startswith('../'):
        cleaned = cleaned[2:]
    if cleaned.startswith('./'):
        cleaned = cleaned[1:]
    if not cleaned.startswith('/'):
        cleaned = '/' + cleaned.lstrip('/')
    return cleaned


class AnasayfaDuyurular(models.Model):
    baslik = models.CharField(max_length=255)
    aciklama = models.TextField()
    resim = models.CharField(max_length=255)
    view = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'anasayfa_duyurular'
        ordering = ['id']
        verbose_name = 'Anasayfa duyuru'
        verbose_name_plural = 'Anasayfa duyurular'

    def __str__(self):
        return self.baslik


class AnasayfaLinkler(models.Model):
    baslik = models.CharField(max_length=255)
    logo_url = models.CharField(max_length=255, blank=True, null=True)
    hedef_url = models.CharField(max_length=500)

    class Meta:
        managed = False
        db_table = 'anasayfa_linkler'
        ordering = ['id']
        verbose_name = 'Anasayfa link'
        verbose_name_plural = 'Anasayfa linkler'

    def __str__(self):
        return self.baslik

    @property
    def logo(self):
        return normalize_image_path(self.logo_url or '')


class AnketlerKategori(models.Model):
    slug = models.CharField(unique=True, max_length=100)
    ad = models.CharField(max_length=150)

    class Meta:
        managed = False
        db_table = 'anketler_kategori'
        ordering = ['id']
        verbose_name_plural = 'Anket kategorileri'

    def __str__(self):
        return self.ad


class Anketler(models.Model):
    baslik = models.CharField(max_length=255)
    aciklama = models.TextField(blank=True, null=True)
    resim_url = models.CharField(max_length=500, blank=True, null=True)
    baslangic_tarihi = models.DateField(blank=True, null=True)
    bitis_tarihi = models.DateField(blank=True, null=True)
    katilim_sayisi = models.IntegerField(blank=True, null=True)
    hedef_katilim = models.IntegerField(blank=True, null=True)
    favori = models.SmallIntegerField()
    kategori = models.ForeignKey(
        AnketlerKategori, models.DO_NOTHING, blank=True, null=True
    )

    class Meta:
        managed = False
        db_table = 'anketler'
        ordering = ['id']
        verbose_name_plural = 'Anketler'

    def __str__(self):
        return self.baslik


class AnketSorulari(models.Model):
    anket = models.ForeignKey(Anketler, models.DO_NOTHING)
    soru_metni = models.TextField()
    soru_tipi = models.CharField(max_length=255)
    sira = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'anket_sorulari'
        ordering = ['id']
        verbose_name_plural = 'Anket sorulari'

    def __str__(self):
        return self.soru_metni[:80]


class AnketSecenekleri(models.Model):
    soru = models.ForeignKey(AnketSorulari, models.DO_NOTHING)
    secenek_metni = models.CharField(max_length=255)

    class Meta:
        managed = False
        db_table = 'anket_secenekleri'
        ordering = ['id']
        verbose_name_plural = 'Anket secenekleri'

    def __str__(self):
        return self.secenek_metni


class Personeller(models.Model):
    sicil_no = models.CharField(unique=True, max_length=50)
    ad = models.CharField(max_length=50)
    soyad = models.CharField(max_length=50)
    email = models.CharField(unique=True, max_length=100)
    sifre = models.CharField(max_length=255)
    dogum_tarihi = models.DateField()
    foto_url = models.CharField(max_length=255)
    remember_token_hash = models.CharField(
        unique=True, max_length=64, blank=True, null=True
    )
    remember_token_expires = models.DateTimeField(blank=True, null=True)
    tc_no = models.CharField(max_length=11, blank=True, null=True)
    telefon = models.CharField(max_length=20, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'personeller'
        ordering = ['id']
        verbose_name_plural = 'Personeller'

    def __str__(self):
        return f'{self.ad} {self.soyad}'

    @property
    def foto(self):
        return normalize_image_path(self.foto_url)


class AnketCevaplari(models.Model):
    anket = models.ForeignKey(Anketler, models.DO_NOTHING)
    personel = models.ForeignKey(Personeller, models.DO_NOTHING)
    soru = models.ForeignKey(AnketSorulari, models.DO_NOTHING)
    secenek = models.ForeignKey(
        AnketSecenekleri, models.DO_NOTHING, blank=True, null=True
    )
    cevap_metni = models.TextField(blank=True, null=True)
    olusturma_tarihi = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'anket_cevaplari'
        ordering = ['id']
        verbose_name_plural = 'Anket cevaplari'


class AnketKatilimlari(models.Model):
    anket_id = models.IntegerField()
    personel_id = models.IntegerField()
    tamamlanma_tarihi = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'anket_katilimlari'
        ordering = ['id']
        verbose_name_plural = 'Anket katilimlari'


class DuyurularKategori(models.Model):
    slug = models.CharField(unique=True, max_length=100)
    ad = models.CharField(max_length=150)

    class Meta:
        managed = False
        db_table = 'duyurular_kategori'
        ordering = ['id']
        verbose_name_plural = 'Duyuru kategorileri'

    def __str__(self):
        return self.ad


class Duyurular(models.Model):
    baslik = models.CharField(max_length=255)
    aciklama = models.TextField()
    resim = models.CharField(max_length=255)
    view = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'duyurular'
        ordering = ['id']
        verbose_name_plural = 'Duyurular'

    def __str__(self):
        return self.baslik

    @property
    def resim_url(self):
        return normalize_image_path(self.resim)


class EtkinliklerDurum(models.Model):
    slug = models.CharField(unique=True, max_length=100)
    ad = models.CharField(max_length=150)

    class Meta:
        managed = False
        db_table = 'etkinlikler_durum'
        ordering = ['id']
        verbose_name_plural = 'Etkinlik durumlari'

    def __str__(self):
        return self.ad


class Etkinlikler(models.Model):
    baslik = models.CharField(max_length=255)
    aciklama = models.TextField(blank=True, null=True)
    tarih = models.DateField()
    bitis_tarihi = models.DateField(blank=True, null=True)
    view = models.IntegerField(blank=True, null=True)
    resim = models.CharField(max_length=255, blank=True, null=True)
    durum_ref = models.ForeignKey(
        EtkinliklerDurum,
        models.DO_NOTHING,
        db_column='durum_id',
        blank=True,
        null=True,
        related_name='etkinlikler',
    )
    durum = models.CharField(max_length=20, default='aktif')

    class Meta:
        managed = False
        db_table = 'etkinlikler'
        ordering = ['id']
        verbose_name_plural = 'Etkinlikler'

    def __str__(self):
        return self.baslik


class EtkinliklerDuyurular(models.Model):
    sayfa_tipi = models.CharField(max_length=50)
    baslik = models.CharField(max_length=255)
    aciklama = models.TextField(blank=True, null=True)
    resim_url = models.CharField(max_length=255, blank=True, null=True)
    tarih = models.DateField(blank=True, null=True)
    kategori = models.ForeignKey(
        DuyurularKategori, models.DO_NOTHING, blank=True, null=True
    )

    class Meta:
        managed = False
        db_table = 'etkinlikler_duyurular'
        ordering = ['id']
        verbose_name_plural = 'Etkinlik duyurulari'

    def __str__(self):
        return self.baslik


class Haberler(models.Model):
    baslik = models.CharField(max_length=255)
    resim = models.CharField(max_length=255)

    class Meta:
        managed = False
        db_table = 'haberler'
        ordering = ['id']
        verbose_name_plural = 'Haberler'

    def __str__(self):
        return self.baslik

    @property
    def resim_url(self):
        return normalize_image_path(self.resim)


class HaberGaleri(models.Model):
    haber = models.ForeignKey(Haberler, models.DO_NOTHING)
    resim_url = models.CharField(max_length=255)
    sira = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'haber_galeri'
        ordering = ['id']
        verbose_name_plural = 'Haber galeri'

    def __str__(self):
        return f'{self.haber_id} / {self.sira}'


class IcerikIzlemeleri(models.Model):
    tablo = models.CharField(max_length=64)
    kayit_id = models.IntegerField()
    izleyici = models.CharField(max_length=96)
    olusturma_tarihi = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'icerik_izlemeleri'
        ordering = ['id']
        verbose_name_plural = 'Icerik izlemeleri'


class KaynaklarKategori(models.Model):
    slug = models.CharField(unique=True, max_length=100)
    ad = models.CharField(max_length=150)

    class Meta:
        managed = False
        db_table = 'kaynaklar_kategori'
        ordering = ['id']
        verbose_name_plural = 'Kaynak kategorileri'

    def __str__(self):
        return self.ad


class KaynaklarAltKategori(models.Model):
    kaynak_kategori = models.ForeignKey(KaynaklarKategori, models.DO_NOTHING)
    slug = models.CharField(max_length=100)
    ad = models.CharField(max_length=150)

    class Meta:
        managed = False
        db_table = 'kaynaklar_alt_kategori'
        ordering = ['id']
        verbose_name_plural = 'Kaynak alt kategorileri'

    def __str__(self):
        return self.ad


class Kaynaklar(models.Model):
    baslik = models.CharField(max_length=255)
    aciklama = models.TextField()
    ikon = models.CharField(max_length=50, blank=True, null=True)
    dosya_yolu = models.CharField(max_length=255)
    resmi_sayfa = models.CharField(max_length=500, blank=True, null=True)
    boyut = models.CharField(max_length=50)
    tarih = models.CharField(max_length=50)
    kategori = models.ForeignKey(
        KaynaklarKategori, models.DO_NOTHING, blank=True, null=True
    )
    alt_kategori = models.ForeignKey(
        KaynaklarAltKategori, models.DO_NOTHING, blank=True, null=True
    )

    class Meta:
        managed = False
        db_table = 'kaynaklar'
        ordering = ['id']
        verbose_name_plural = 'Kaynaklar'

    def __str__(self):
        return self.baslik


class OturumKayitlari(models.Model):
    personel = models.ForeignKey(Personeller, models.DO_NOTHING)
    giris_zamani = models.DateTimeField()
    cikis_zamani = models.DateTimeField(blank=True, null=True)
    ip_adresi = models.CharField(max_length=45, blank=True, null=True)
    user_agent = models.CharField(max_length=255, blank=True, null=True)
    kapanis_tipi = models.CharField(max_length=20, blank=True, null=True)
    son_aktivite = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'oturum_kayitlari'
        ordering = ['id']
        verbose_name_plural = 'Oturum kayitlari'


class SiteIkonlari(models.Model):
    anahtar = models.CharField(unique=True, max_length=100)
    ad = models.CharField(max_length=150)
    kategori = models.CharField(max_length=50)
    ikon_sinifi = models.CharField(max_length=150)
    renk = models.CharField(max_length=30, blank=True, null=True)
    sira = models.IntegerField()
    aktif = models.SmallIntegerField()
    olusturma_tarihi = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'site_ikonlari'
        ordering = ['id']
        verbose_name_plural = 'Site ikonlari'

    def __str__(self):
        return self.anahtar


class SizdengelenlerKategori(models.Model):
    slug = models.CharField(unique=True, max_length=100)
    ad = models.CharField(max_length=150)

    class Meta:
        managed = False
        db_table = 'sizdengelenler_kategori'
        ordering = ['id']
        verbose_name_plural = 'Sizden gelenler kategorileri'

    def __str__(self):
        return self.ad


class SizdenGelenler(models.Model):
    baslik = models.CharField(max_length=255)
    ozet = models.TextField()
    tarih = models.DateField()
    goruntulenme = models.IntegerField(blank=True, null=True)
    gorsel_yolu = models.CharField(max_length=255, blank=True, null=True)
    olusturma_tarihi = models.DateTimeField()
    kategori = models.ForeignKey(
        SizdengelenlerKategori, models.DO_NOTHING, blank=True, null=True
    )

    class Meta:
        managed = False
        db_table = 'sizden_gelenler'
        ordering = ['id']
        verbose_name_plural = 'Sizden gelenler'

    def __str__(self):
        return self.baslik


class VefatBilgileri(models.Model):
    vefat_eden_adi = models.CharField(max_length=255)
    iliski_pozisyon = models.TextField()
    vefat_tarihi = models.DateField()
    vefat_tarihi_metin = models.CharField(max_length=50)
    cenaze_mesaji = models.TextField()

    class Meta:
        managed = False
        db_table = 'vefat_bilgileri'
        ordering = ['id']
        verbose_name_plural = 'Vefat bilgileri'

    def __str__(self):
        return self.vefat_eden_adi


class VideolarKategori(models.Model):
    slug = models.CharField(unique=True, max_length=100)
    ad = models.CharField(max_length=150)

    class Meta:
        managed = False
        db_table = 'videolar_kategori'
        ordering = ['id']
        verbose_name_plural = 'Video kategorileri'

    def __str__(self):
        return self.ad


class Videolar(models.Model):
    youtube_id = models.CharField(unique=True, max_length=50)
    baslik = models.CharField(max_length=255)
    aciklama = models.TextField()
    sure = models.CharField(max_length=20)
    kategori = models.ForeignKey(
        VideolarKategori, models.DO_NOTHING, blank=True, null=True
    )
    vitrin = models.SmallIntegerField()
    vitrin_baslik = models.CharField(max_length=255, blank=True, null=True)
    vitrin_aciklama = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'videolar'
        ordering = ['id']
        verbose_name_plural = 'Videolar'

    def __str__(self):
        return self.baslik


class YardimciLinklerKategori(models.Model):
    slug = models.CharField(unique=True, max_length=100)
    ad = models.CharField(max_length=150)

    class Meta:
        managed = False
        db_table = 'yardimci_linkler_kategori'
        ordering = ['id']
        verbose_name_plural = 'Yardimci link kategorileri'

    def __str__(self):
        return self.ad


class YardimciLinkler(models.Model):
    baslik = models.CharField(max_length=255)
    logo_url = models.CharField(max_length=255, blank=True, null=True)
    hedef_url = models.CharField(max_length=500)
    kategori = models.ForeignKey(
        YardimciLinklerKategori, models.DO_NOTHING, blank=True, null=True
    )

    class Meta:
        managed = False
        db_table = 'yardimci_linkler'
        ordering = ['id']
        verbose_name_plural = 'Yardimci linkler'

    def __str__(self):
        return self.baslik


class Yoneticiler(models.Model):
    kullanici_adi = models.CharField(unique=True, max_length=50)
    sifre = models.CharField(max_length=255)
    ad = models.CharField(max_length=100)
    soyad = models.CharField(max_length=100)
    yetki = models.CharField(max_length=255)
    aktif = models.SmallIntegerField()
    olusturma_tarihi = models.DateTimeField()
    foto_url = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'yoneticiler'
        ordering = ['id']
        verbose_name_plural = 'Yoneticiler'

    def __str__(self):
        return self.kullanici_adi


class YoneticiOturumKayitlari(models.Model):
    yonetici = models.ForeignKey(Yoneticiler, models.DO_NOTHING)
    giris_zamani = models.DateTimeField()
    cikis_zamani = models.DateTimeField(blank=True, null=True)
    ip_adresi = models.CharField(max_length=45, blank=True, null=True)
    user_agent = models.CharField(max_length=255, blank=True, null=True)
    kapanis_tipi = models.CharField(max_length=20, blank=True, null=True)
    son_aktivite = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'yonetici_oturum_kayitlari'
        ordering = ['id']
        verbose_name_plural = 'Yonetici oturum kayitlari'


# API uyumluluk takma adlari
Haber = Haberler
Duyuru = Duyurular
Personel = Personeller
AnasayfaLink = AnasayfaLinkler
SiteIkon = SiteIkonlari
