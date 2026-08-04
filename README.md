# Personel Portalı

Gebze Belediyesi personel portalı. Duyurular, etkinlikler, videolar, anketler, kaynaklar ve yönetim paneli; ortak bir Django API üzerinden çalışır.

Üç arayüz aynı backend’i kullanır:

| Arayüz | Teknoloji | Klasör | Port |
|--------|-----------|--------|------|
| Personel sitesi | React + Vite | `frontend/` | `5173` |
| Yönetim paneli | React + Vite | `admin/` (React) veya `personel-portal-html/admin/` | `5173/admin` veya `8080` |
| HTML kopya | HTML + CSS + vanilla JS | `personel-portal-html/` | `8080` |

---

## Gereksinimler

- Python 3.11+
- Node.js 20+
- PostgreSQL 16 (veya Docker)
- Windows için PowerShell (hızlı başlat scriptleri)

---

## Proje yapısı

```
personel-portali/
├── backend/          # Django + DRF API
│   ├── config/       # settings, urls, health endpoints
│   └── portal/       # anasayfa API, modeller (haber, duyuru, …)
├── frontend/         # React (Vite)
│   └── src/
│       ├── components/  # SideNav, Footer, Layout
│       ├── pages/       # Home, Test, ComingSoon
│       ├── styles/
│       └── api/
├── baslat.ps1
├── docker-compose.yml
└── .github/workflows/backend-ci.yml
```

## Hızlı başlat (Windows)

Önce bir kez kurulum yapın (aşağıdaki “Kurulum” bölümü). Sonra:

### React (personel + admin)

```powershell
.\baslat.ps1
```

| Adres | Açıklama |
|-------|----------|
| http://127.0.0.1:5173/ | Ana sayfa |
| http://127.0.0.1:5173/giris | Personel girişi |
| http://127.0.0.1:5173/admin/ | Yönetim paneli |
| http://127.0.0.1:5173/test | Sistem testleri |
| http://127.0.0.1:8000/api/ | Django API |
| http://127.0.0.1:8000/admin/ | Django Admin |

## 1) Yerelde Docker ile çalıştırma (önerilen)

```powershell
.\personel-portal-html.ps1
```

| Adres | Açıklama |
|-------|----------|
| http://127.0.0.1:8080/ | Girişe yönlendirir |
| http://127.0.0.1:8080/personel-portal-html/giris.html | Personel girişi |
| http://127.0.0.1:8080/personel-portal-html/index.html | Ana sayfa |
| http://127.0.0.1:8080/personel-portal-html/admin/index.html | Yönetim paneli |
| http://127.0.0.1:8000/api/ | Django API |

> **Önemli:** `http://127.0.0.1:8000/` yalnızca API’dir; site sayfaları burada değildir. HTML site için `8080`, React için `5173` kullanın.

---

## Kurulum

### 1) Backend

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
```

`backend/.env` içinde PostgreSQL bilgilerini ve CORS köklerini ayarlayın:

```env
POSTGRES_DB=personel_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=...
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,http://localhost:8080,http://127.0.0.1:8080
```

Veritabanı hazırsa:

```powershell
python manage.py migrate
python manage.py createsuperuser   # isteğe bağlı (Django Admin)
python manage.py runserver 127.0.0.1:8000
```

PostgreSQL yoksa Docker ile:

```powershell
docker compose up -d db
```

veya yalnızca API + DB:

```powershell
docker compose up --build
```

- API: http://localhost:8000/api/home/
- Admin panel: http://localhost:8000/admin/ (önce `docker compose exec backend python manage.py createsuperuser`)

Frontend'i ayrı çalıştırın (Docker'a dahil etmedim ki hot-reload hızlı kalsın) veya `.\baslat.ps1` kullanın:

```bash
cd frontend
copy .env.example .env
npm install
npm run dev
```

### 3) React admin (ayrı çalıştırılacaksa)

`baslat.ps1` admin’i frontend üzerinden `/admin` ile sunar. Ayrı Vite süreci için:

```powershell
cd admin
copy .env.example .env
npm install
npm run dev
```

### 4) HTML site (elle)

```powershell
# Terminal 1 — API
cd backend
.\venv\Scripts\Activate.ps1
python manage.py runserver 127.0.0.1:8000

# Terminal 2 — statik sunucu
python serve-template.py
```

---

## Modüller

### Personel sitesi

- Ana sayfa (haber / duyuru bandı, doğum günü, otomasyon linkleri)
- Duyurular, etkinlikler (detay sayfaları dahil)
- Videolar, anketler, sizden gelenler
- Kaynaklar: protokoller, dokümanlar, mevzuatlar, eğitimler
- Doğum günü, vefat, yardımcı linkler
- Profil: şifre / e-posta / oturum kayıtları

### Yönetim paneli

- Dashboard ve CRUD: duyurular, etkinlikler, videolar, anketler, personeller, yöneticiler
- Kaynaklar, yardımcı linkler, sizden gelenler, vefat kayıtları
- Profil ve oturum yönetimi

Giriş: personel için **sicil no + şifre**; yönetici için admin girişi.

---

## API

Temel uç noktalar (`http://127.0.0.1:8000/api/`):

| Uç nokta | Açıklama |
|----------|----------|
| `GET /health/` | Sağlık kontrolü |
| `GET /home/` | Ana sayfa verisi |
| `GET /duyurular/` | Duyuru listesi |
| `GET /etkinlikler/` | Etkinlik listesi |
| `POST /auth/login/` | Personel girişi |
| `GET /admin/...` | Yönetim CRUD (oturum gerekli) |

Detaylı uç noktalar `backend/config/urls.py` ve `backend/portal/` altında tanımlıdır.

---

## Ortam değişkenleri

| Dosya | Rol |
|-------|-----|
| `backend/.env` | Django, Postgres, CORS |
| `frontend/.env` | API taban adresi |
| `admin/.env` | API taban adresi |

`.env` dosyalarını commit etmeyin (`.gitignore` içinde). Örnekler: `*.env.example`.

---

## Geliştirme notları

- Görseller tek kaynaktan gelir: kök `images/` → tarayıcıda `/images/...`
- HTML kopya, React ile aynı DOM / sınıf / API davranışını hedefler (`personel-portal-html/_CONVENTIONS.md`)
- CORS’ta kullandığınız origin’ler (`5173`, `8080`, …) `backend/.env` içinde olmalı
- CI: `.github/workflows/backend-ci.yml` — push/PR’da Django check + test

---

## Sık sorunlar

**“Failed to fetch” / CORS**  
Backend kapalı olabilir veya origin CORS listesinde yoktur. `backend/.env` içindeki `CORS_ALLOWED_ORIGINS` değerini kontrol edin; Django’yu yeniden başlatın.

**8000’de site açılmıyor**  
Beklenen davranış. Site `5173` (React) veya `8080` (HTML); `8000` yalnızca API.

**HTML’de giriş çalışıyor, React’te değil (veya tersi)**  
Aynı API’yi kullanırlar; farklı port/origin CORS’ta eksik olabilir.

---

## Lisans / kullanım

Kurumsal iç kullanım. Dağıtım ve erişim politikası Gebze Belediyesi BT birimine aittir.
