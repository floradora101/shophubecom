# Check if Next.js dev server is running on port 3000
Write-Host "🔍 Checking if Next.js dev server is running..." -ForegroundColor Cyan

try {
    $connection = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Where-Object { $_.State -eq 'Listen' }

    if ($connection) {
        $process = Get-Process -Id $connection.OwningProcess -ErrorAction SilentlyContinue
        if ($process) {
            Write-Host "✅ Next.js dev server is RUNNING" -ForegroundColor Green
            Write-Host "   Process: $($process.ProcessName) (PID: $($process.Id))" -ForegroundColor Gray
            Write-Host "   Port: 3000" -ForegroundColor Gray
            Write-Host "   URL: http://localhost:3000" -ForegroundColor Gray
            Write-Host ""
            Write-Host "To restart, run: .\restart-dev.ps1" -ForegroundColor Yellow
            exit 0
        }
    }

    Write-Host "❌ Next.js dev server is NOT running on port 3000" -ForegroundColor Red
    Write-Host ""
    Write-Host "To start, run: cd frontend; npm run dev" -ForegroundColor Yellow
    exit 1

} catch {
    Write-Host "⚠️  Could not check port 3000: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "This might be due to insufficient permissions." -ForegroundColor Yellow
    exit 2
}
