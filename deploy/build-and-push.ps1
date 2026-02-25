# Build and push Docker image to Docker Hub
#
# Usage:
#   .\deploy\build-and-push.ps1
#
# Optional environment variables:
#   IMAGE_NAME    Default: krishans1990/invoice-pulse
#   IMAGE_TAG     Default: latest
#   PLATFORM      Default: linux/amd64 (e.g., linux/amd64,linux/arm64)
#   VITE_API_BASE_URL  Default: /api
#
# Note: Google Client ID is now fetched at runtime from the backend,
#       so it no longer needs to be passed as a build argument.

param(
    [string]$ImageName = $env:IMAGE_NAME ?? "krishans1990/invoice-pulse",
    [string]$ImageTag = $env:IMAGE_TAG ?? "latest",
    [string]$ViteApiBaseUrl = $env:VITE_API_BASE_URL ?? "/api",
    [string]$Platform = $env:PLATFORM ?? "linux/amd64"
)

# Change to repo root (script is in deploy/)
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path -Parent $scriptDir
Push-Location $repoRoot

$FullTag = "${ImageName}:${ImageTag}"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Building Docker image: $FullTag" -ForegroundColor Cyan
Write-Host "Platform: $Platform" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Build and push
docker buildx build `
    --platform $Platform `
    --build-arg "VITE_API_BASE_URL=$ViteApiBaseUrl" `
    --tag $FullTag `
    --push `
    -f deploy/Dockerfile `
    .

Pop-Location

if ($LASTEXITCODE -eq 0) {
    Write-Host "==========================================" -ForegroundColor Green
    Write-Host "✓ Successfully pushed $FullTag to Docker Hub" -ForegroundColor Green
    Write-Host "==========================================" -ForegroundColor Green
} else {
    Write-Host "==========================================" -ForegroundColor Red
    Write-Host "✗ Build failed with exit code $LASTEXITCODE" -ForegroundColor Red
    Write-Host "==========================================" -ForegroundColor Red
    exit $LASTEXITCODE
}
