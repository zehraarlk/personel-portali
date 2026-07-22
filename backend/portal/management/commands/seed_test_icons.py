from django.core.management.base import BaseCommand
from django.db import connection

TEST_ICONS = [
    ('test_yenile', 'Test Yenile', 'test', 'fas fa-bolt', 100),
    ('test_tarayici', 'Tarayici', 'test', 'fas fa-window-maximize', 101),
    ('test_react', 'React', 'test', 'fab fa-react', 102),
    ('test_django', 'Django API', 'test', 'fas fa-server', 103),
    ('test_veritabani', 'Veritabani', 'test', 'fas fa-database', 104),
    ('test_api', 'Django API', 'test', 'fas fa-plug', 105),
    ('test_admin', 'Django Admin', 'test', 'fas fa-shield-halved', 106),
    ('test_health', 'Health API', 'test', 'fas fa-heart-pulse', 107),
    ('test_sistem', 'Sistem Testi', 'test', 'fas fa-stethoscope', 108),
    ('test_personel', 'Personel', 'test', 'fas fa-users', 109),
    ('test_haber', 'Anasayfa API', 'test', 'fas fa-newspaper', 111),
    ('test_pgadmin', 'pgAdmin / DBeaver', 'test', 'fas fa-table-columns', 112),
    ('test_kod', 'Kod / Stack', 'test', 'fas fa-code', 113),
    ('test_baglanti', 'API Baglanti', 'test', 'fas fa-plug-circle-check', 114),
]


class Command(BaseCommand):
    help = 'Sistem test sayfasi ikonlarini site_ikonlari tablosuna ekler'

    def handle(self, *args, **options):
        with connection.cursor() as c:
            for anahtar, ad, kategori, ikon_sinifi, sira in TEST_ICONS:
                c.execute(
                    """
                    INSERT INTO site_ikonlari
                        (anahtar, ad, kategori, ikon_sinifi, renk, sira, aktif)
                    VALUES (%s, %s, %s, %s, NULL, %s, 1)
                    ON CONFLICT (anahtar) DO UPDATE SET
                        ikon_sinifi = EXCLUDED.ikon_sinifi,
                        ad = EXCLUDED.ad,
                        kategori = EXCLUDED.kategori,
                        sira = EXCLUDED.sira,
                        aktif = 1
                    """,
                    [anahtar, ad, kategori, ikon_sinifi, sira],
                )
        self.stdout.write(self.style.SUCCESS(f'{len(TEST_ICONS)} test ikonu yazildi.'))
