# İLLURÊ FRAGRANCE — Production Pre-Flight Checklist

> **STATUS**: PRODUCTION PREP PASS COMPLETED — WAITING FOR DOMAIN / LIVE CREDENTIALS
> **TARGET VPS**: `77.37.45.177` | Reverse Proxy: `Traefik` (`kp-proxy` network)
> **NOTE**: Staging is fully operational and verified at `https://illure.77.37.45.177.sslip.io`. DO NOT switch or start production until all pre-flight items below are finalized by the client.

---

## 1. Production Domain & DNS Routing
- [ ] Client provides official production domain (e.g. `illurefragrance.com` / `shop.illurefragrance.com`).
- [ ] Configure DNS `A` record pointing root/subdomain to VPS IP `77.37.45.177`.
- [ ] Set `PRODUCTION_DOMAIN` in `/opt/illure/.env.production`.
- [ ] Verify Traefik automatically issues valid Let's Encrypt TLS certificate for the production domain.
- [ ] Configure CAA DNS records authorizing Let's Encrypt / ZeroSSL certificate issuance.

---

## 2. Production Secret Rotation (Zero-Reuse Policy)
Generate all fresh, high-entropy secrets for production (never reuse staging or local values):
- [ ] Database credentials:
  - `POSTGRES_USER=illure_prod_user`
  - `POSTGRES_PASSWORD`: Generated fresh with `openssl rand -base64 32`
  - `POSTGRES_DB=illure_prod_db`
- [ ] JWT authentication keys:
  - `JWT_ACCESS_SECRET`: Generated fresh with `openssl rand -hex 32` (64 characters)
  - `JWT_REFRESH_SECRET`: Generated fresh with `openssl rand -hex 32` (64 characters)
- [ ] CORS & Cookie:
  - `FRONTEND_URL=https://<PRODUCTION_DOMAIN>`
  - `COOKIE_DOMAIN=.<PRODUCTION_DOMAIN>`

---

## 3. Live Razorpay Gateway & Webhooks
- [ ] Replace staging test keys (`rzp_test_...`) with official Live Razorpay credentials (`rzp_live_...`).
- [ ] Generate fresh live `RAZORPAY_WEBHOOK_SECRET`.
- [ ] Configure Live Razorpay Webhook in Razorpay Dashboard:
  - URL: `https://<PRODUCTION_DOMAIN>/api/payments/razorpay/webhook`
  - Active Events: `payment.authorized`, `payment.captured`, `payment.failed`, `order.paid`
  - Secret: Match `RAZORPAY_WEBHOOK_SECRET` in `.env.production`.

---

## 4. Production Transactional Email (SMTP)
- [ ] Provision dedicated transactional email service (Amazon SES, SendGrid, Postmark, or Google Workspace SMTP Relay).
- [ ] Set production credentials in `.env.production`:
  - `SMTP_HOST`
  - `SMTP_PORT` (587 or 465)
  - `SMTP_USER`
  - `SMTP_PASS`
  - `SMTP_FROM_NAME="İLLURÊ FRAGRANCE"`
  - `SMTP_FROM_EMAIL="concierge@<PRODUCTION_DOMAIN>"`
  - `ORDER_NOTIFICATION_EMAIL="orders@<PRODUCTION_DOMAIN>"`
- [ ] Configure DNS SPF (`v=spf1 ...`), DKIM, and DMARC (`p=reject`) for the production domain to ensure 100% inbox delivery.

---

## 5. Production Admin Account
- [ ] Set client's official production admin email in `SEED_ADMIN_EMAIL` (e.g. `admin@illurefragrance.com`).
- [ ] Generate strong distinct password for `SEED_ADMIN_PASSWORD` (do NOT reuse staging admin password).
- [ ] Set `SEED_ADMIN_NAME="Illure Super Admin"`.

---

## 6. Client Catalog & Inventory Data Seed
- [ ] Clear demo/staging products (`Aqua Edge`, `Oud Silk Royal`, `Imperial Sovereign`).
- [ ] Import client's official product catalog with high-resolution imagery, fragrance notes, volume sizes (30ml/50ml/100ml), retail pricing, and live inventory counts.
- [ ] Configure production shipping settings (`flatRate`, `freeShippingThreshold`, `isEnabled`).
- [ ] Configure initial promotional coupons if applicable.

---

## 7. Production Isolated Infrastructure Verification
- [ ] Production compose configuration template: `docker-compose.production.yml`.
- [ ] Environment file template: `.env.production.example`.
- [ ] Validate compose configuration:
  ```bash
  docker compose -f docker-compose.production.yml --env-file .env.production config
  ```
- [ ] Isolated persistent database volume: `illure_postgres_production_data`.
- [ ] Database port `5432` remains private within Docker network (`illure-prod-internal`).
- [ ] Automated database backup cron configured (`pg_dump` daily archive with rotation).

---

## 8. Go-Live Deployment Commands (Run ONLY upon approval)
```bash
# 1. SSH to VPS
ssh -i <SSH_KEY> root@77.37.45.177

# 2. Navigate to deployment directory
cd /opt/illure

# 3. Pull latest main
git pull origin main

# 4. Prepare production env
cp .env.production.example .env.production
chmod 600 .env.production
nano .env.production  # Fill in real domain and live credentials

# 5. Build and launch production containers
docker compose -f docker-compose.production.yml --env-file .env.production up -d --build

# 6. Apply database migrations
docker exec -i illure-production-api npx prisma migrate deploy

# 7. Verify health
curl -s https://<PRODUCTION_DOMAIN>/api/health
```
