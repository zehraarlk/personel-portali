from django.db import models


def normalize_image_path(path: str) -> str:
    """../images/foo.webp → /images/foo.webp"""
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


class Haber(models.Model):
    baslik = models.CharField(max_length=255)
    resim = models.CharField(max_length=255)

    class Meta:
        db_table = 'haberler'
        ordering = ['-id']

    def __str__(self):
        return self.baslik

    @property
    def resim_url(self):
        return normalize_image_path(self.resim)


class Duyuru(models.Model):
    baslik = models.CharField(max_length=255)
    aciklama = models.TextField()
    resim = models.CharField(max_length=255)
    view = models.IntegerField(default=0)

    class Meta:
        db_table = 'duyurular'
        ordering = ['-id']

    def __str__(self):
        return self.baslik

    @property
    def resim_url(self):
        return normalize_image_path(self.resim)


class Personel(models.Model):
    sicil_no = models.CharField(max_length=50)
    ad = models.CharField(max_length=50)
    soyad = models.CharField(max_length=50)
    email = models.EmailField(max_length=100)
    sifre = models.CharField(max_length=255)
    dogum_tarihi = models.DateField()
    foto_url = models.CharField(max_length=255)
    remember_token_hash = models.CharField(max_length=64, null=True, blank=True)
    remember_token_expires = models.DateTimeField(null=True, blank=True)
    tc_no = models.CharField(max_length=11, null=True, blank=True)
    telefon = models.CharField(max_length=20, null=True, blank=True)

    class Meta:
        db_table = 'personeller'
        ordering = ['ad', 'soyad']

    def __str__(self):
        return f'{self.ad} {self.soyad}'

    @property
    def foto(self):
        return normalize_image_path(self.foto_url)


class AnasayfaLink(models.Model):
    """Kurum içi otomasyon sistemleri (ana sayfa)."""
    baslik = models.CharField(max_length=255)
    logo_url = models.CharField(max_length=255, null=True, blank=True)
    hedef_url = models.CharField(max_length=500)

    class Meta:
        db_table = 'anasayfa_linkler'
        ordering = ['id']

    def __str__(self):
        return self.baslik

    @property
    def logo(self):
        return normalize_image_path(self.logo_url or '')
