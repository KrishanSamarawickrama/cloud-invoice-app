# Deployment Guide

## Hosting Options

| Provider | Tier | Cost | Architecture |
|----------|------|------|-------------|
| **Oracle Cloud** (recommended) | Always Free | **$0/mo** | ARM64 (Ampere A1) |
| Hetzner | CX23 | ~€3.49/mo | x86 (Intel/AMD) |

Both are fully supported — Docker images auto-detect the architecture.

## Prerequisites

- An Oracle Cloud account (or Hetzner VPS)
- A domain name (e.g. `krishan.io`)
- Your Google OAuth Client ID (for authentication)

---

## Oracle Cloud Setup

### 1. Create an Always Free ARM Instance

1. Sign up at [Oracle Cloud](https://cloud.oracle.com)
   - **Home region**: pick **Australia Southeast (Melbourne)** or **Sydney** for best free-tier capacity
   - Upgrade to **Pay As You Go** (still free, unlocks capacity)

2. Go to **Compute > Instances > Create Instance**
   - **Shape**: VM.Standard.A1.Flex (Ampere)
   - **OCPUs**: 4, **Memory**: 24 GB (max free allocation)
   - **Image**: Ubuntu 24.04 (aarch64)
   - **Boot volume**: 100 GB (free up to 200 GB total)
   - **Add your SSH public key**

3. Note the **Public IP** from the instance details page

### 2. Open Ports in OCI Security List

This is required — Oracle blocks all traffic except SSH by default.

1. Go to **Networking > Virtual Cloud Networks**
2. Click your VCN > **Security Lists** > **Default Security List**
3. Click **Add Ingress Rules** and add:

| Source CIDR | Protocol | Dest Port | Description |
|-------------|----------|-----------|-------------|
| `0.0.0.0/0` | TCP | 80 | HTTP |
| `0.0.0.0/0` | TCP | 443 | HTTPS |

### 3. SSH and Run Setup

```bash
ssh ubuntu@<PUBLIC_IP>
```

```bash
# Download and run setup script
curl -sSL https://raw.githubusercontent.com/YOUR_USER/cloud-invoice-app/main/deployment/setup.sh | sudo bash
```

Or manually:

```bash
sudo apt-get update && sudo apt-get upgrade -y
curl -fsSL https://get.docker.com | sudo sh
sudo apt-get install -y docker-compose-plugin git

# Open ports in iptables (Oracle blocks them by default)
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
sudo netfilter-persistent save
```

### 4. Add your user to the docker group

```bash
sudo usermod -aG docker $USER
# Log out and back in for this to take effect
exit
ssh ubuntu@<PUBLIC_IP>
```

---

## Hetzner Setup (Alternative)

1. Create a **CX23** server (€3.49/mo) at [Hetzner Cloud](https://console.hetzner.cloud)
   - **Location**: Falkenstein (cheapest)
   - **OS**: Ubuntu 24.04
   - Add your SSH key

2. SSH in and run the setup script:

```bash
ssh root@<PUBLIC_IP>
curl -sSL https://raw.githubusercontent.com/YOUR_USER/cloud-invoice-app/main/deployment/setup.sh | bash
```

---

## Deploy (Same for Both Providers)

### 1. Clone the Repository

```bash
sudo mkdir -p /opt/cloud-invoice-app && sudo chown $USER:$USER /opt/cloud-invoice-app
cd /opt/cloud-invoice-app
git clone https://github.com/YOUR_USER/cloud-invoice-app.git .
```

### 2. Configure Environment

```bash
cd deployment
cp .env.example .env
nano .env
```

Fill in these values:

| Variable | What to set |
|----------|-------------|
| `DOMAIN` | Your domain (e.g. `krishan.io`) |
| `ACME_EMAIL` | Your email (for Let's Encrypt SSL certs) |
| `POSTGRES_PASSWORD` | A strong random password |
| `ConnectionStrings__invoice-db` | Update the password to match above |
| `Jwt__SecretKey` | A random string, at least 32 characters |
| `Google__ClientId` | Your Google OAuth client ID |

Generate secure values:

```bash
# Generate a random password
openssl rand -base64 24

# Generate a JWT secret
openssl rand -base64 48
```

### 3. Configure DNS

At your domain registrar (Cloudflare, Namecheap, etc.), add these records:

```
Type    Name    Value           TTL
A       @       <PUBLIC_IP>     Auto
A       *       <PUBLIC_IP>     Auto
```

The wildcard `*` record covers all subdomains (`invoice.`, `tools.`, etc.) so you only do this once.

Verify DNS propagation:

```bash
dig +short krishan.io
dig +short invoice.krishan.io
```

Both should return your instance's public IP.

### 4. Deploy

```bash
cd /opt/cloud-invoice-app/deployment
docker compose up -d --build
```

First run takes a few minutes (building images, provisioning SSL certs). ARM builds may take slightly longer than x86.

Check that everything is running:

```bash
docker compose ps
```

You should see all 4 services (`caddy`, `backend`, `frontend`, `database`) with status `Up`.

### 5. Verify

- Open `https://invoice.krishan.io` — should load the invoice app
- Open `https://invoice.krishan.io/api/version` — should return version JSON

---

## Common Operations

### View logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f caddy
```

### Update after code changes

```bash
cd /opt/cloud-invoice-app
git pull
cd deployment
docker compose up -d --build
```

### Restart a single service

```bash
docker compose restart backend
```

### Stop everything

```bash
docker compose down
```

### Stop and remove data (database included)

```bash
docker compose down -v
```

### Database backup

```bash
docker compose exec database pg_dump -U postgres invoice_db > backup_$(date +%Y%m%d).sql
```

### Database restore

```bash
cat backup_20260222.sql | docker compose exec -T database psql -U postgres invoice_db
```

---

## Adding a New App

1. Add the service to `docker-compose.yml`:

```yaml
  my-new-app:
    build:
      context: ../src/MyNewApp
      dockerfile: ../../deployment/Dockerfile.mynewapp
    restart: unless-stopped
```

2. Add a block to `Caddyfile`:

```
myapp.{$DOMAIN} {
    reverse_proxy my-new-app:3000
}
```

3. Redeploy:

```bash
docker compose up -d --build
```

No DNS changes needed — the wildcard record already covers it.

---

## Oracle Cloud Specific

### Prevent idle instance reclamation

Oracle reclaims free instances that stay below 20% CPU for 7 days. Add a lightweight cron job:

```bash
# Add to crontab (runs a small CPU task every 6 hours)
(crontab -l 2>/dev/null; echo "0 */6 * * * /usr/bin/nice -n 19 /usr/bin/stress-ng --cpu 1 --timeout 60s > /dev/null 2>&1") | crontab -
sudo apt-get install -y stress-ng
```

### Instance resource limits

| Resource | Free Allocation |
|----------|----------------|
| OCPUs | 4 (= 4 vCPUs on ARM) |
| Memory | 24 GB |
| Boot volume | Up to 200 GB |
| Outbound traffic | 10 TB/month |

You can split this across multiple VMs if needed (e.g. 2 OCPUs + 12 GB each).

---

## Troubleshooting

### SSL certs not provisioning

- Ensure DNS is pointing to your instance's public IP
- Check Caddy logs: `docker compose logs caddy`
- **Oracle Cloud**: Verify ports 80/443 are open in BOTH iptables AND the VCN Security List

### Backend can't connect to database

- Verify the password in `ConnectionStrings__invoice-db` matches `POSTGRES_PASSWORD`
- Check database health: `docker compose ps database`
- Check backend logs: `docker compose logs backend`

### Frontend shows blank page

- Check frontend build: `docker compose logs frontend`
- Verify nginx is serving: `docker compose exec frontend curl localhost`

### Oracle: "Out of host capacity" error

- Try a different availability domain in the same region
- Try at off-peak hours (early morning UTC)
- Upgrade to Pay As You Go account (still free, unlocks reserved capacity)
- Try another region: Sydney, Melbourne, London, or Ashburn
