# Albuera EMS - Complete Startup Script for Windows PowerShell
# Run this in PowerShell as Administrator

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Albuera EMS System Startup" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

# Check Node.js
Write-Host "`nChecking Node.js..." -ForegroundColor Yellow
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: Node.js not found. Install from nodejs.org" -ForegroundColor Red
    exit 1
}
$nodeVersion = node --version
Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green

# Check MongoDB connection
Write-Host "`nTesting MongoDB connection..." -ForegroundColor Yellow
Set-Location "$PSScriptRoot\backend"

# Test MONGO_URI
try {
    $mongoCheck = node -e "require('dotenv').config(); console.log(process.env.MONGO_URI ? 'YES' : 'NO')"
    if ($mongoCheck -eq 'YES') {
        Write-Host "✓ Environment variables loaded" -ForegroundColor Green
    } else {
        Write-Host "✗ MONGO_URI not configured in .env" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "✗ Failed to load .env: $_" -ForegroundColor Red
    exit 1
}

# Start backend
Write-Host "`nStarting backend server on port 3000..." -ForegroundColor Yellow
Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; npm run dev" -WindowStyle Normal
Start-Sleep -Seconds 5

# Check backend health
Write-Host "Checking backend health..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✓ Backend is running (HTTP $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "✗ Backend failed to start or not responding: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Check the backend console window for errors." -ForegroundColor Yellow
}

# Test reports API
Write-Host "`nTesting reports API..." -ForegroundColor Yellow
try {
    $reports = Invoke-WebRequest -Uri "http://localhost:3000/api/reports/public" -TimeoutSec 10 -ErrorAction Stop
    $count = ($reports.Content | ConvertFrom-Json).Count
    Write-Host "✓ Reports API accessible ($count reports found)" -ForegroundColor Green
} catch {
    Write-Host "⚠ Reports API error: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "This may be normal if no reports exist yet." -ForegroundColor Gray
}

# Seed sample data
Write-Host "`nSeeding sample reports..." -ForegroundColor Yellow
try {
    Push-Location "$PSScriptRoot\backend"
    node seed-reports.js
    Pop-Location
    Write-Host "✓ Sample data seeded" -ForegroundColor Green
} catch {
    Write-Host "⚠ Seeding had errors: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "Check MongoDB connection and IP whitelist in Atlas." -ForegroundColor Gray
}

# Start frontend
Write-Host "`nStarting frontend on port 5173..." -ForegroundColor Yellow
Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm run dev" -WindowStyle Normal
Start-Sleep -Seconds 3

Write-Host "`n================================" -ForegroundColor Cyan
Write-Host "System Status:" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Backend: http://localhost:3000" -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Open http://localhost:5173/admin-login" -ForegroundColor White
Write-Host "2. Login with: admin / admin123" -ForegroundColor White
Write-Host "3. Dashboard should show reports" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to exit this script..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
