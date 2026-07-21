"""personel_db.sql içindeki ana sayfa verilerini yükler."""
from django.core.management.base import BaseCommand
from portal.models import Haber, Duyuru, Personel, AnasayfaLink


HABERLER = [
    (1, '8 Mart Dünya Kadınlar Günü Programı', '../images/8-mart-dunya-kadinlar-gunu-programi_8383.webp'),
    (2, '24 Kasım Öğretmenler Günü Ziyareti', '../images/24-kas-m-o-retmenler-gunu_2947.webp'),
    (3, 'Personel Bayramlaşma Programı', '../images/personel-bayramla-ma-programi_5965.webp'),
    (4, 'Personel İftar Programı', '../images/personel-ftar-program_109.webp'),
    (5, 'Personel Piknik Programı', '../images/personel-p-kn-k-programi_9118.webp'),
    (6, 'Ağız ve Diş Sağlığı Taraması', '../images/personellerimizin-a-z-ve-di-sa-l-n-onemsiyoruz_7091.webp'),
    (7, 'İkinci İftar Buluşması', '../images/pesonel-ftar-programi_3732.webp'),
    (8, 'Stajyer Dönem Sonu Etkinliği', '../images/stajyer-donem-sonu-etk-nl_6028.webp'),
    (9, 'Stajyer Film Okuma Programı', '../images/stajyer-f-lm-okuma-programi_3604.webp'),
    (10, 'Stajyer Öğrenci Oryantasyonu', '../images/stajyer-o-renci-oryantasyonu_2177.webp'),
    (11, 'Stajyer Oryantasyon Eğitimi', '../images/stajyer-oryantasyon-e-t-m_8697.webp'),
    (12, 'Ulusal Dağ Bisikleti Kupası', '../images/ulusal-da-bisikleti-kupas-yar-lar_128.webp'),
]

DUYURULAR = [
    (1, 'Stajyer Oryantasyon Eğitimi Tamamlandı', 'Belediyemizde yeni döneme başlayan stajyer öğrencilerimiz için oryantasyon programı düzenlendi.', '../images/stajyer-oryantasyon-e-t-m_8697.webp', 0),
    (2, 'Geleneksel Bayramlaşma Töreni Gerçekleşti', 'Kurban Bayramı vesilesiyle tüm personelimizin katılımıyla coşkulu bir bayramlaşma programı yapıldı.', '../images/24-kas-m-o-retmenler-gunu_2947.webp', 0),
    (3, '8 Mart Dünya Kadınlar Günü Kutlandı', "Belediyemizdeki kadın personelimizin Dünya Kadınlar Günü'nü özel bir etkinlikle kutladık.", '../images/8-mart-dunya-kadinlar-gunu-programi_8383.webp', 0),
    (4, 'Personel İftar Programı Büyük İlgi Gördü', 'Ramazan ayının manevi atmosferinde personelimizle birlikte iftar sofrasında buluştuk.', '../images/personel-ftar-program_109.webp', 0),
    (5, 'Öğretmenler Günü Unutulmadı', "Gebze'deki öğretmenlerimizi bu özel günlerinde yalnız bırakmadık ve çeşitli ziyaretler gerçekleştirdik.", '../images/24-kas-m-o-retmenler-gunu_2947.webp', 0),
    (6, "Dağ Bisikleti Kupası Gebze'de Nefes Kesti", "Türkiye Ulusal Dağ Bisikleti Kupası'nın bir ayağına ev sahipliği yapmanın gururunu yaşadık.", '../images/ulusal-da-bisikleti-kupas-yar-lar_128.webp', 0),
    (7, 'Personelimize Ağız ve Diş Sağlığı Taraması', 'Çalışanlarımızın sağlığını önemsiyor, düzenli olarak sağlık taramaları gerçekleştiriyoruz.', '../images/personellerimizin-a-z-ve-di-sa-l-n-onemsiyoruz_7091.webp', 0),
    (8, 'Yaz Sezonunu Piknikle Açtık', 'Yoğun çalışma temposuna mola vererek tüm birimlerimizin katıldığı bir piknik organizasyonu düzenledik.', '../images/personel-p-kn-k-programi_9118.webp', 0),
    (9, 'Stajyerlerle Film Okuma Etkinliği', 'Gençlerimizin vizyonunu geliştirmek amacıyla film okuma ve analiz programları düzenliyoruz.', '../images/stajyer-f-lm-okuma-programi_3604.webp', 0),
    (10, 'İkinci Geleneksel İftar Buluşması', 'Personelimiz ve aileleriyle birlikte Ramazan ayının bereketini paylaştığımız iftar programımız.', '../images/personel-ftar-program_109.webp', 0),
    (11, 'Stajyer Dönem Sonu Veda Programı', 'Staj dönemini başarıyla tamamlayan öğrencilerimiz için bir veda ve teşekkür etkinliği düzenlendi.', '../images/stajyer-donem-sonu-etk-nl_6028.webp', 0),
    (12, 'Yeni Stajyerlerimize "Hoş Geldin" Dedik', 'Belediye çalışmalarını yakından tanımaları için yeni stajyerlerimize yönelik bir oryantasyon yapıldı.', '../images/stajyer-oryantasyon-e-t-m_8697.webp', 0),
    (13, 'Kadın Personelimize Özel İkramlar', '8 Mart kapsamında belediyemizdeki tüm kadın çalışanlarımıza küçük bir jest hazırladık.', '../images/8-mart-dunya-kadinlar-gunu-programi_8383.webp', 0),
    (14, 'Ramazan Bayramı Buluşması', 'Ramazan Bayramı dolayısıyla personelimizle bir araya gelerek bayramlaştık.', '../images/personel-bayramla-ma-programi_5965.webp', 0),
    (15, 'Birlik ve Beraberlik İftarı', 'İftar programımız, personelimiz arasındaki birlik ve beraberliği pekiştirdi.', '../images/personel-ftar-program_109.webp', 0),
]

PERSONELLER = [
    (1, '12345', 'Zehra', 'Aralık', 'test3@gebze.bel.tr', '81dc9bdb52d04dc20036dbd8313ed055', '2006-07-14', '../images/gebze-logo.webp'),
    (2, '1234', 'yusuf', 'sancar', 'yusuf@gmail.com', '81dc9bdb52d04dc20036dbd8313ed055', '2026-07-21', '../images/favicon.webp'),
]

ANASAYFA_LINKLER = [
    (1, 'OMIS', '../images/otomasyon/omis_7572.webp', 'https://ebelediye.gebze.bel.tr/eBelediye/'),
    (2, 'Ulakbel', '../images/otomasyon/ulakbel_5496.webp', 'https://ulakbel.gebze.bel.tr/ulakbel#/'),
    (3, 'İmar Yönetim Sistemi', '../images/otomasyon/imar-yonetim-sistemi_8038.webp', 'https://www.gebze.bel.tr/ebelediye/'),
    (4, 'Dijital Arşiv', '../images/otomasyon/dijital-arsiv_415.webp', 'https://www.gebze.bel.tr/'),
    (5, 'Outlook', '../images/otomasyon/outlook_4005.webp', 'https://outlook.live.com/'),
    (6, 'Sosyal Yardım', '../images/otomasyon/sosyal-yardim_3767.webp', 'https://www.turkiye.gov.tr/ashb-sosyal-yardim-bilgileri-sorgulama'),
    (7, 'Netcad', '../images/otomasyon/netcad_3888.webp', 'https://www.netcad.com/'),
    (8, 'E-Belediye Sistemi', '../images/otomasyon/ebys_8493.webp', 'https://www.belediye.gov.tr/'),
    (9, 'E-Belediye Evlendrme Modülü', '../images/otomasyon/e-belediye-evlendirme-modulu_3993.webp', 'https://www.belediye.gov.tr/evlendirme-modulu'),
    (10, 'E-Belediye Sosyal Yardım Modülü', '../images/otomasyon/e-belediye-sosyal-yard-m-modulu_4432.webp', 'https://www.belediye.gov.tr/sosyal-yardim-takip-sistemi-syts-modulu'),
]


class Command(BaseCommand):
    help = 'personel_db ana sayfa tablolarını (haberler, duyurular, personeller, anasayfa_linkler) doldurur'

    def handle(self, *args, **options):
        Haber.objects.all().delete()
        for pk, baslik, resim in HABERLER:
            Haber.objects.create(id=pk, baslik=baslik, resim=resim)

        Duyuru.objects.all().delete()
        for pk, baslik, aciklama, resim, view in DUYURULAR:
            Duyuru.objects.create(id=pk, baslik=baslik, aciklama=aciklama, resim=resim, view=view)

        Personel.objects.all().delete()
        for row in PERSONELLER:
            Personel.objects.create(
                id=row[0],
                sicil_no=row[1],
                ad=row[2],
                soyad=row[3],
                email=row[4],
                sifre=row[5],
                dogum_tarihi=row[6],
                foto_url=row[7],
            )

        AnasayfaLink.objects.all().delete()
        for pk, baslik, logo, url in ANASAYFA_LINKLER:
            AnasayfaLink.objects.create(id=pk, baslik=baslik, logo_url=logo, hedef_url=url)

        self.stdout.write(self.style.SUCCESS(
            f'Yüklendi: {Haber.objects.count()} haber, '
            f'{Duyuru.objects.count()} duyuru, '
            f'{Personel.objects.count()} personel, '
            f'{AnasayfaLink.objects.count()} otomasyon linki'
        ))
