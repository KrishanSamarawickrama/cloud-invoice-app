#!/bin/bash
# Initial VPS setup for cloud-invoice-app
# Supports: Oracle Cloud (ARM64 Ubuntu) and Hetzner (x86 Ubuntu)
# Run on a fresh Ubuntu 24.04 instance:  bash setup.sh

set -e

echo "==> Detecting platform..."
ARCH=$(uname -m)
echo "    Architecture: $ARCH"

echo "==> Updating system..."
apt-get update && apt-get upgrade -y

echo "==> Installing Docker..."
curl -fsSL https://get.docker.com | sh

echo "==> Installing Docker Compose plugin..."
apt-get install -y docker-compose-plugin

echo "==> Installing Git..."
apt-get install -y git

# Oracle Cloud instances block ports 80/443 via iptables by default
echo "==> Opening firewall ports (80, 443)..."
if command -v iptables &> /dev/null; then
    iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
    iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
    netfilter-persistent save 2>/dev/null || iptables-save > /etc/iptables/rules.v4 2>/dev/null || true
    echo "    iptables rules added"
fi
if command -v ufw &> /dev/null; then
    ufw allow 80/tcp
    ufw allow 443/tcp
    echo "    ufw rules added"
fi

echo "==> Creating app directory..."
mkdir -p /opt/cloud-invoice-app

PUBLIC_IP=$(curl -s ifconfig.me)

echo ""
echo "========================================="
echo "  Setup complete!"
echo "  Platform: $ARCH"
echo "  Public IP: $PUBLIC_IP"
echo "========================================="
echo ""
echo "  1. Clone your repo:"
echo "     cd /opt/cloud-invoice-app"
echo "     git clone https://github.com/YOUR_USER/cloud-invoice-app.git ."
echo ""
echo "  2. Create your .env file:"
echo "     cd deployment"
echo "     cp .env.example .env"
echo "     nano .env"
echo ""
echo "  3. Point your DNS:"
echo "     A  @        -> $PUBLIC_IP"
echo "     A  *        -> $PUBLIC_IP"
echo ""
echo "  4. Deploy:"
echo "     docker compose up -d --build"
echo ""
echo "  NOTE: If using Oracle Cloud, also open ports 80 and 443"
echo "  in your VCN Security List via the OCI Console."
echo ""
