from django.contrib import admin

from . import models as m

# Admin listelerinde id 1'den artsın
admin.site.site_header = 'Personel Portalı Admin'
admin.site.site_title = 'Personel Portalı'
admin.site.index_title = 'personel_db tabloları'


class IdOrderedAdmin(admin.ModelAdmin):
    ordering = ('id',)
    list_per_page = 50


@admin.register(m.AnasayfaDuyurular)
class AnasayfaDuyurularAdmin(IdOrderedAdmin):
    list_display = ('id', 'baslik', 'view')
    search_fields = ('baslik',)


@admin.register(m.AnasayfaLinkler)
class AnasayfaLinklerAdmin(IdOrderedAdmin):
    list_display = ('id', 'baslik', 'hedef_url', 'logo_url')
    search_fields = ('baslik',)


@admin.register(m.AnketlerKategori)
class AnketlerKategoriAdmin(IdOrderedAdmin):
    list_display = ('id', 'slug', 'ad')
    search_fields = ('slug', 'ad')


@admin.register(m.Anketler)
class AnketlerAdmin(IdOrderedAdmin):
    list_display = ('id', 'baslik', 'kategori', 'baslangic_tarihi', 'bitis_tarihi', 'favori')
    list_filter = ('favori', 'kategori')
    search_fields = ('baslik',)


@admin.register(m.AnketSorulari)
class AnketSorulariAdmin(IdOrderedAdmin):
    list_display = ('id', 'anket', 'sira', 'soru_tipi', 'soru_metni')
    list_filter = ('soru_tipi',)
    search_fields = ('soru_metni',)


@admin.register(m.AnketSecenekleri)
class AnketSecenekleriAdmin(IdOrderedAdmin):
    list_display = ('id', 'soru', 'secenek_metni')
    search_fields = ('secenek_metni',)


@admin.register(m.AnketCevaplari)
class AnketCevaplariAdmin(IdOrderedAdmin):
    list_display = ('id', 'anket', 'personel', 'soru', 'olusturma_tarihi')
    search_fields = ('cevap_metni',)


@admin.register(m.AnketKatilimlari)
class AnketKatilimlariAdmin(IdOrderedAdmin):
    list_display = ('id', 'anket_id', 'personel_id', 'tamamlanma_tarihi')


@admin.register(m.DuyurularKategori)
class DuyurularKategoriAdmin(IdOrderedAdmin):
    list_display = ('id', 'slug', 'ad')
    search_fields = ('slug', 'ad')


@admin.register(m.Duyurular)
class DuyurularAdmin(IdOrderedAdmin):
    list_display = ('id', 'baslik', 'view')
    search_fields = ('baslik',)


@admin.register(m.EtkinliklerDurum)
class EtkinliklerDurumAdmin(IdOrderedAdmin):
    list_display = ('id', 'slug', 'ad')


@admin.register(m.Etkinlikler)
class EtkinliklerAdmin(IdOrderedAdmin):
    list_display = ('id', 'baslik', 'tarih', 'bitis_tarihi', 'durum', 'view')
    list_filter = ('durum',)
    search_fields = ('baslik',)


@admin.register(m.EtkinliklerDuyurular)
class EtkinliklerDuyurularAdmin(IdOrderedAdmin):
    list_display = ('id', 'sayfa_tipi', 'baslik', 'tarih', 'kategori')
    list_filter = ('sayfa_tipi',)
    search_fields = ('baslik',)


@admin.register(m.Haberler)
class HaberlerAdmin(IdOrderedAdmin):
    list_display = ('id', 'baslik', 'resim')
    search_fields = ('baslik',)


@admin.register(m.HaberGaleri)
class HaberGaleriAdmin(IdOrderedAdmin):
    list_display = ('id', 'haber', 'sira', 'resim_url')


@admin.register(m.IcerikIzlemeleri)
class IcerikIzlemeleriAdmin(IdOrderedAdmin):
    list_display = ('id', 'tablo', 'kayit_id', 'izleyici', 'olusturma_tarihi')
    list_filter = ('tablo',)
    search_fields = ('izleyici',)


@admin.register(m.KaynaklarKategori)
class KaynaklarKategoriAdmin(IdOrderedAdmin):
    list_display = ('id', 'slug', 'ad')


@admin.register(m.KaynaklarAltKategori)
class KaynaklarAltKategoriAdmin(IdOrderedAdmin):
    list_display = ('id', 'kaynak_kategori', 'slug', 'ad')


@admin.register(m.Kaynaklar)
class KaynaklarAdmin(IdOrderedAdmin):
    list_display = ('id', 'baslik', 'kategori', 'alt_kategori', 'tarih', 'boyut')
    search_fields = ('baslik',)


@admin.register(m.OturumKayitlari)
class OturumKayitlariAdmin(IdOrderedAdmin):
    list_display = ('id', 'personel', 'giris_zamani', 'cikis_zamani', 'ip_adresi')
    search_fields = ('ip_adresi',)


@admin.register(m.Personeller)
class PersonellerAdmin(IdOrderedAdmin):
    list_display = ('id', 'sicil_no', 'ad', 'soyad', 'email', 'dogum_tarihi')
    search_fields = ('ad', 'soyad', 'sicil_no', 'email')


@admin.register(m.SiteIkonlari)
class SiteIkonlariAdmin(IdOrderedAdmin):
    list_display = ('id', 'anahtar', 'ad', 'kategori', 'ikon_sinifi', 'sira', 'aktif')
    list_filter = ('kategori', 'aktif')
    search_fields = ('anahtar', 'ad', 'ikon_sinifi')


@admin.register(m.SizdengelenlerKategori)
class SizdengelenlerKategoriAdmin(IdOrderedAdmin):
    list_display = ('id', 'slug', 'ad')


@admin.register(m.SizdenGelenler)
class SizdenGelenlerAdmin(IdOrderedAdmin):
    list_display = ('id', 'baslik', 'tarih', 'kategori', 'goruntulenme')
    search_fields = ('baslik',)


@admin.register(m.VefatBilgileri)
class VefatBilgileriAdmin(IdOrderedAdmin):
    list_display = ('id', 'vefat_eden_adi', 'vefat_tarihi')
    search_fields = ('vefat_eden_adi',)


@admin.register(m.VideolarKategori)
class VideolarKategoriAdmin(IdOrderedAdmin):
    list_display = ('id', 'slug', 'ad')


@admin.register(m.Videolar)
class VideolarAdmin(IdOrderedAdmin):
    list_display = ('id', 'baslik', 'youtube_id', 'kategori', 'vitrin', 'sure')
    list_filter = ('vitrin', 'kategori')
    search_fields = ('baslik', 'youtube_id')


@admin.register(m.YardimciLinklerKategori)
class YardimciLinklerKategoriAdmin(IdOrderedAdmin):
    list_display = ('id', 'slug', 'ad')


@admin.register(m.YardimciLinkler)
class YardimciLinklerAdmin(IdOrderedAdmin):
    list_display = ('id', 'baslik', 'kategori', 'hedef_url')
    search_fields = ('baslik',)


@admin.register(m.Yoneticiler)
class YoneticilerAdmin(IdOrderedAdmin):
    list_display = ('id', 'kullanici_adi', 'ad', 'soyad', 'yetki', 'aktif')
    list_filter = ('aktif',)
    search_fields = ('kullanici_adi', 'ad', 'soyad')


@admin.register(m.YoneticiOturumKayitlari)
class YoneticiOturumKayitlariAdmin(IdOrderedAdmin):
    list_display = ('id', 'yonetici', 'giris_zamani', 'cikis_zamani', 'ip_adresi')
