$projectRoot = Split-Path -Parent $PSScriptRoot

foreach ($name in "api", "web") {
    $pidFile = Join-Path $projectRoot ".dev-$name.pid"
    if (Test-Path $pidFile) {
        $processId = Get-Content $pidFile
        taskkill /PID $processId /T /F 2>$null | Out-Null
        Remove-Item $pidFile
    }
}

Set-Location $projectRoot
docker compose down
Write-Host "Stopped API, web, and database."
