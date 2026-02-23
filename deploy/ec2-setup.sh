#!/bin/bash
# EC2 Setup Script for Cloud Invoice App
# Tested on: Amazon Linux 2023 / Ubuntu 22.04+
# Run as: sudo bash ec2-setup.sh

set -euo pipefail

echo "=== Cloud Invoice App — EC2 Setup ==="

# Detect OS
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
else
    echo "Unsupported OS"
    exit 1
fi

# Install Docker
echo "Installing Docker..."
if [ "$OS" = "amzn" ]; then
    yum update -y
    yum install -y docker git
    systemctl start docker
    systemctl enable docker
elif [ "$OS" = "ubuntu" ]; then
    apt-get update
    apt-get install -y ca-certificates curl gnupg
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    chmod a+r /etc/apt/keyrings/docker.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" > /etc/apt/sources.list.d/docker.list
    apt-get update
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin git
else
    echo "Unsupported OS: $OS. Install Docker manually."
    exit 1
fi

# Install Docker Compose plugin (Amazon Linux)
if [ "$OS" = "amzn" ]; then
    DOCKER_COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep -oP '"tag_name": "\K[^"]+')
    curl -SL "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-linux-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose
fi

# Add ec2-user to docker group
usermod -aG docker ec2-user 2>/dev/null || usermod -aG docker ubuntu 2>/dev/null || true

echo ""
echo "=== Docker installed ==="
docker --version
docker compose version 2>/dev/null || docker-compose --version

echo ""
echo "=== Next Steps ==="
echo "1. Clone your repo:"
echo "   git clone https://github.com/YOUR_USER/cloud-invoice-app.git"
echo "   cd cloud-invoice-app"
echo ""
echo "2. Create your .env file:"
echo "   cp deploy/.env.example .env"
echo "   nano .env    # fill in real values"
echo ""
echo "3. Generate a JWT secret:"
echo "   openssl rand -base64 32"
echo ""
echo "4. Start the app:"
echo "   docker compose -f docker-compose.prod.yml --env-file .env up -d --build"
echo ""
echo "5. View logs:"
echo "   docker compose -f docker-compose.prod.yml logs -f"
echo ""
echo "6. Open port 80 in your EC2 Security Group if not already done."
echo ""
echo "=== Setup Complete ==="
