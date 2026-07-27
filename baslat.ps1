# Personel Portali - backend + frontend
# Admin paneli: http://127.0.0.1:5173/admin/ (frontend icinde)
# Gorseller: proje kokundeki images/ — Vite root-images eklentisi ile /images
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()
$OutputEncoding = [Console]::OutputEncoding
try { chcp 65001 | Out-Null } catch {}

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$Images = Join-Path $Root "images"

if (-not (Test-Path "$Root\backend\venv\Scripts\python.exe")) {
    Write-Host "Backend venv yok." -ForegroundColor Red
    exit 1
}

if (-not (Test-Path "$Root\frontend\node_modules")) {
    Write-Host "Frontend paketleri yok. Once: cd frontend; npm install" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path "$Root\frontend\.env")) {
    Copy-Item "$Root\frontend\.env.example" "$Root\frontend\.env"
}

if (-not (Test-Path $Images)) {
    Write-Host "Kok images klasoru yok: $Images" -ForegroundColor Red
    exit 1
}

# Eski public/images kopya veya junction varsa kaldir (tek kaynak: kok/images)
foreach ($app in @("frontend", "admin")) {
    $legacy = Join-Path $Root "$app\public\images"
    if (Test-Path $legacy) {
        Remove-Item $legacy -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "Kaldirildi: $legacy" -ForegroundColor Yellow
    }
    $legacyFiles = Join-Path $Root "$app\public\files"
    if (Test-Path $legacyFiles) {
        Remove-Item $legacyFiles -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "Kaldirildi: $legacyFiles" -ForegroundColor Yellow
    }
}

foreach ($port in 8000, 5173) {
    $pids = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue |
        Select-Object -ExpandProperty OwningProcess -Unique
    foreach ($procId in $pids) {
        if ($procId -and $procId -ne 0) {
            Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
            Write-Host "Port $port temizlendi (PID $procId)" -ForegroundColor Yellow
        }
    }
}
Start-Sleep -Seconds 1

Write-Host "Personel Portali baslatiliyor..." -ForegroundColor Cyan

Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location '$Root\backend'; .\venv\Scripts\Activate.ps1; python manage.py runserver 127.0.0.1:8000"
)

Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location '$Root\frontend'; npm run dev -- --host 127.0.0.1 --port 5173"
)

Write-Host ""
Write-Host "Anasayfa     -> http://127.0.0.1:5173/" -ForegroundColor Green
Write-Host "Test         -> http://127.0.0.1:5173/test" -ForegroundColor Green
Write-Host "Admin panel  -> http://127.0.0.1:5173/admin/" -ForegroundColor Green
Write-Host "Backend API  -> http://127.0.0.1:8000/api/" -ForegroundColor Green
Write-Host "Django Admin -> http://127.0.0.1:8000/admin/" -ForegroundColor Green
Write-Host "Gorseller    -> $Images (/images)" -ForegroundColor Green
Write-Host ""
Write-Host "Iki pencere acildi. Durdurmak icin pencereleri kapatin."
Write-Host "Tarayici anasayfa ile aciliyor..."

Start-Sleep -Seconds 5
Start-Process "http://127.0.0.1:5173/"
