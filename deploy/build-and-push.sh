#!/usr/bin/env bash
set -euo pipefail

# ---------------------------------------------------------------------------
# Build and push Docker image to Docker Hub
#
# Usage:
#   export IMAGE_NAME=yourusername/cloud-invoice-app
#   chmod +x deploy/build-and-push.sh
#   ./deploy/build-and-push.sh
#
# Optional environment variables:
#   IMAGE_TAG     Default: latest
#   PLATFORM      Default: linux/amd64 (e.g., linux/amd64,linux/arm64)
#   VITE_API_BASE_URL  Default: /api
#
# Note: Google Client ID is now fetched at runtime from the backend,
#       so it no longer needs to be passed as a build argument.
# ---------------------------------------------------------------------------

# Change to repo root (script is in deploy/)
cd "$(dirname "$0")/.."

# Configuration — override via environment or edit defaults below
IMAGE_NAME="${IMAGE_NAME:?IMAGE_NAME must be set (e.g., yourusername/cloud-invoice-app)}"
IMAGE_TAG="${IMAGE_TAG:-latest}"
VITE_API_BASE_URL="${VITE_API_BASE_URL:-/api}"
PLATFORM="${PLATFORM:-linux/amd64}"

FULL_TAG="${IMAGE_NAME}:${IMAGE_TAG}"

echo "=========================================="
echo "Building Docker image: ${FULL_TAG}"
echo "Platform: ${PLATFORM}"
echo "=========================================="

docker buildx build \
  --platform "${PLATFORM}" \
  --build-arg "VITE_API_BASE_URL=${VITE_API_BASE_URL}" \
  --tag "${FULL_TAG}" \
  --push \
  -f deploy/Dockerfile \
  .

echo "=========================================="
echo "✓ Successfully pushed ${FULL_TAG} to Docker Hub"
echo "=========================================="
