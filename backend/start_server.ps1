Write-Host "=== HALAL TRADE PRO REPAIR & START ==="
Write-Host "1. Port 8000..."

# Kill any existing process on 8000
$connections = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue
if ($connections) {
    foreach ($conn in $connections) {
        $pid_to_kill = $conn.OwningProcess
        Write-Host "   Stopping existing backend (PID $pid_to_kill)..."
        try {
            Stop-Process -Id $pid_to_kill -Force -ErrorAction SilentlyContinue
            Write-Host "   ✅ Stopped."
        } catch {
            Write-Host "   ⚠️ Failed to stop PID $pid_to_kill. Please close it manually."
        }
    }
} else {
    Write-Host "   ✅ Port 8000 is available."
}

Write-Host "2. Resetting Database..."
if (Test-Path "tradebot.db") {
    Remove-Item "tradebot.db" -Force
    Write-Host "   ✅ Deleted old database."
}

Write-Host "3. Starting Backend on Port 8000..."
python -m app.main
