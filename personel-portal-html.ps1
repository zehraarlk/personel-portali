# personel-portal-html (HTML/CSS/JS) + Django API
# Site:   http://127.0.0.1:8080/personel-portal-html/giris.html
# API:    http://127.0.0.1:8000/api/
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()
$OutputEncoding = [Console]::OutputEncoding
try { chcp 65001 | Out-Null } catch {}

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$Python = Join-Path $Root "backend\venv\Scripts\python.exe"
$Template = Join-Path $Root "personel-portal-html"

if (-not (Test-Path $Python)) {
    Write-Host "Backend venv yok: $Python" -ForegroundColor Red
    exit 1
}
if (-not (Test-Path $Template)) {
    Write-Host "personel-portal-html klasoru yok." -ForegroundColor Red
    exit 1
}

foreach ($port in 8000, 8080) {
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

Write-Host "personel-portal-html baslatiliyor..." -ForegroundColor Cyan

# Django API
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location '$Root\backend'; .\venv\Scripts\Activate.ps1; python manage.py runserver 127.0.0.1:8000"
)

# Statik dosya sunucusu (/ -> personel-portal-html/giris.html)
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location '$Root'; & '$Python' serve-template.py"
)

Start-Sleep -Seconds 2
Start-Process "http://127.0.0.1:8080/"

Write-Host ""
Write-Host "Giris sayfasi  -> http://127.0.0.1:8080/personel-portal-html/giris.html" -ForegroundColor Green
Write-Host "Ana sayfa      -> http://127.0.0.1:8080/personel-portal-html/index.html" -ForegroundColor Green
Write-Host "Admin panel    -> http://127.0.0.1:8080/personel-portal-html/admin/index.html" -ForegroundColor Green
Write-Host "Backend API    -> http://127.0.0.1:8000/api/" -ForegroundColor Green
Write-Host ""
Write-Host "Iki pencere acildi. Durdurmak icin pencereleri kapatin."
Write-Host "NOT: http://127.0.0.1:8000/ Django API'dir; site sayfalari orada degildir."
