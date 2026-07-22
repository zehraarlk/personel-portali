# Personel Portali - backend + frontend
# Admin paneli: http://127.0.0.1:5173/admin/ (frontend icinde, ayni CSS)
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()
$OutputEncoding = [Console]::OutputEncoding
try { chcp 65001 | Out-Null } catch {}

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$Images = Join-Path $Root "images"

function Ensure-ImagesJunction($AppDir) {
    $pub = Join-Path $AppDir "public"
    $link = Join-Path $pub "images"
    if (-not (Test-Path $pub)) {
        New-Item -ItemType Directory -Path $pub | Out-Null
    }
    if (Test-Path $link) {
        $item = Get-Item $link -Force
        if ($item.LinkType -eq "Junction") { return }
        Remove-Item $link -Recurse -Force -ErrorAction SilentlyContinue
    }
    cmd /c "mklink /J `"$link`" `"$Images`"" | Out-Null
    Write-Host "images baglandi: $link" -ForegroundColor Yellow
}

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

# Tablodaki ../images/... yollari -> /images/... (kok images klasoru)
Ensure-ImagesJunction (Join-Path $Root "frontend")

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
Write-Host "Gorseller    -> $Images (public/images junction)" -ForegroundColor Green
Write-Host ""
Write-Host "Iki pencere acildi. Durdurmak icin pencereleri kapatin."
Write-Host "Tarayici anasayfa ile aciliyor..."

Start-Sleep -Seconds 5
Start-Process "http://127.0.0.1:5173/"
