$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot

Set-Location $projectRoot
docker compose up -d

$api = Start-Process powershell.exe -PassThru -WorkingDirectory $projectRoot -ArgumentList @(
    "-NoExit",
    "-Command",
    "`$Host.UI.RawUI.WindowTitle = 'Thugzcation API'; npm run dev:api"
)

$web = Start-Process powershell.exe -PassThru -WorkingDirectory $projectRoot -ArgumentList @(
    "-NoExit",
    "-Command",
    "`$Host.UI.RawUI.WindowTitle = 'Thugzcation Web'; npm run dev:web"
)

$api.Id | Set-Content (Join-Path $projectRoot ".dev-api.pid")
$web.Id | Set-Content (Join-Path $projectRoot ".dev-web.pid")

Write-Host "Started API and web terminals."
Write-Host "Open http://localhost:5173"
