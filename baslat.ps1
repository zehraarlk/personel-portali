# Personel Portalı - backend + frontend başlat
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path

if (-not (Test-Path "$Root\backend\venv\Scripts\python.exe")) {
    Write-Host "Backend venv yok. Önce şunu çalıştırın:" -ForegroundColor Red
    Write-Host "  cd backend; python -m venv venv; .\venv\Scripts\pip install -r requirements.txt; .\venv\Scripts\python manage.py migrate"
    exit 1
}

if (-not (Test-Path "$Root\frontend\node_modules")) {
    Write-Host "Frontend paketleri yok. Önce: cd frontend; npm install" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path "$Root\frontend\.env")) {
    Copy-Item "$Root\frontend\.env.example" "$Root\frontend\.env"
}

# Eski süreçler portu kilitlemesin
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

Write-Host "Personel Portalı başlatılıyor..." -ForegroundColor Cyan

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
Write-Host "Backend  -> http://127.0.0.1:8000"
Write-Host "Frontend -> http://127.0.0.1:5173"
Write-Host "Test     -> http://127.0.0.1:5173/test"
Write-Host "İki pencere açıldı. Durdurmak için o pencereleri kapatın."
Start-Sleep -Seconds 2
