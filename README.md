# Personel Portalı

React + Django (DRF) + PostgreSQL ile geliştirilen personel yönetim portalı.

```
personel-portali/
├── backend/          # Django + DRF API
├── frontend/         # React (Vite) uygulaması
├── docker-compose.yml
└── .github/workflows/backend-ci.yml
```

## 1) Yerelde Docker ile çalıştırma (önerilen)

```bash
# backend/.env dosyasını oluştur
cp backend/.env.example backend/.env

# konteynerleri ayağa kaldır (postgres + django api)
docker compose up --build
```

- API: http://localhost:8000/api/employees/
- Admin panel: http://localhost:8000/admin/ (önce `docker compose exec backend python manage.py createsuperuser`)

Frontend'i ayrı çalıştırın (Docker'a dahil etmedim ki hot-reload hızlı kalsın):

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend: http://localhost:5173

## 2) Docker'sız yerel kurulum

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env          # POSTGRES_HOST=localhost yapıp yerel postgres kullanın
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

Yerel PostgreSQL'iniz yoksa: `docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:16-alpine`

---

## GitHub'a Yükleme ve Ekip Çalışması

### Adım 1 — GitHub'da repo oluşturun
1. github.com → sağ üstten **New repository**
2. İsim: `personel-portali`, görünürlük **Private** (ekip projesi için tavsiye edilir)
3. README/gitignore eklemeyin (zaten var), **Create repository**'ye tıklayın

### Adım 2 — Projeyi bu klasörden GitHub'a gönderin
```bash
cd personel-portali
git init
git add .
git commit -m "İlk commit: Django + React + PostgreSQL iskeleti"
git branch -M main
git remote add origin https://github.com/KULLANICI_ADIN/personel-portali.git
git push -u origin main
```
> `KULLANICI_ADIN` yerine kendi kullanıcı adınızı veya organizasyon adınızı yazın.

### Adım 3 — Ekip arkadaşlarını ekleyin
Repo → **Settings → Collaborators and teams → Add people** üzerinden e-posta/kullanıcı adlarıyla davet edin. Organizasyon kullanıyorsanız takım (team) oluşturup yetkiyi oradan verin.

### Adım 4 — Branch stratejisi (önerilen)
- `main` → her zaman çalışır durumda, korumalı (protected)
- `develop` → aktif geliştirme
- `feature/ozellik-adi` → her görev için ayrı dal

`main` için **Settings → Branches → Branch protection rule** ekleyip "Require pull request before merging" ve "Require status checks to pass" (CI testleri) seçeneklerini açın.

### Adım 5 — Günlük ekip akışı
```bash
git checkout develop
git pull
git checkout -b feature/personel-filtreleme
# ... kod yaz, commit at ...
git push -u origin feature/personel-filtreleme
```
GitHub üzerinden `feature/...` → `develop` için **Pull Request** açın, ekipten review isteyin, onay sonrası merge edin.

### Adım 6 — CI otomatik testler
`.github/workflows/backend-ci.yml` her push/PR'da otomatik çalışır: Postgres ayağa kalkar, Django `check` ve `test` komutları koşar. Kırmızı (fail) çıkan PR'lar merge edilmemeli.

### Adım 7 — Secrets / hassas bilgiler
`.env` dosyaları `.gitignore` içinde, asla commit etmeyin. Prod ortam değişkenlerini (secret key, DB şifresi vb.) GitHub → **Settings → Secrets and variables → Actions** kısmına ekleyin; deploy pipeline'ında oradan okunur.

---

## Sırada ne var?
- Kimlik doğrulama: `dj-rest-auth` + JWT veya Django session auth ile login ekranı
- Frontend: personel ekleme/düzenleme formları, React Router ile sayfalar
- Deploy: Backend için Railway/Render/Fly.io, Frontend için Vercel/Netlify, DB için yönetilen Postgres (Supabase, Neon, RDS)
