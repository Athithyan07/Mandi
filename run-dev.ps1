# Mandi Connect PowerShell Runner
Write-Host "========================================================" -ForegroundColor Green
Write-Host " 🌾 Starting Mandi Connect (Backend + Frontend)" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Green
Write-Host "Backend API:  http://localhost:4000" -ForegroundColor Cyan
Write-Host "Frontend App: http://localhost:3000" -ForegroundColor Green
Write-Host ""
node scripts/dev.mjs $args
