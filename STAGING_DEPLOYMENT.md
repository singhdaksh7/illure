# İLLURÊ FRAGRANCE — Staging Deployment Guide

This document defines the complete end-to-end architecture, environment configuration, deployment steps, database migration strategy, backup/restore procedures, and troubleshooting guidelines for deploying **İLLURÊ FRAGRANCE** to the staging environment on an existing VPS.

---

## 1. Staging Architecture Overview

The staging environment runs on an isolated Docker Compose setup alongside the host's existing **Traefik** reverse proxy.

```
                         ┌──────────────────────────────────────────────┐
                         │             Traefik Reverse Proxy            │
                         │           (Ports 80 / 443 on host)          │
                         └──────────────────────┬───────────────────────┘
                                                │
                                        (traefik_public)
                                                │
                 ┌──────────────────────────────┴──────────────────────────────┐
                 │                                                             │
                 ▼                                                             ▼
    ┌─────────────────────────┐                                   ┌─────────────────────────┐
    │       illure-web        │                                   │       illure-api        │
    │     (nginx:alpine)      │                                   │    (node:22-alpine)     │
    │  Serves Vite SPA Build  │                                   │  Express REST API Port 5000│
    └────────────┬────────────┘                                   └────────────┬────────────┘
                 │                                                             │
                 └──────────────────────────────┬──────────────────────────────┘
                                                │
                                        (illure-internal)
                                                │
                                                ▼
                                  ┌───────────────────────────┐
                                  │         illure-db         │
                                  │   (postgres:16-alpine)    │
                                  │ Port 5432 (Internal Only) │
                                  └───────────────────────────┘
```

### Core Architecture Components
1. **Frontend (`illure-web`)**:
   - Multi-stage Docker build (`node:22-alpine` builder -> `nginx:alpine` runner).
   - Serves optimized Vite SPA production bundle.
   - Nginx handles static asset caching (1 year immutable for hashed assets) and SPA fallback (`try_files $uri $uri/ /index.html`).
   - Routed by Traefik on port 80/443.

2. **Backend API (`illure-api`)**:
   - Multi-stage Docker build (`node:22-alpine` builder -> `node:22-alpine` runner).
   - Express TypeScript API running on port 5000.
   - Internal DNS resolution to PostgreSQL container (`illure-db:5432`).
   - Exposes `/api/health` endpoint for Docker and proxy healthchecks.

3. **Database (`illure-db`)**:
   - PostgreSQL 16 Alpine container.
   - Dedicated persistent volume `illure_postgres_staging_data`.
   - **Host port 5432 is NOT exposed** to the public internet.
   - Healthchecked via `pg_isready`.

4. **Reverse Proxy & HTTPS (Traefik Integration)**:
   - Existing Traefik instance on host manages ports `80` and `443`.
   - Automatic SSL certificate provisioned via Let's Encrypt / sslip.io.

---

## 2. Recommended VPS Directory & Repository

- **Target Directory**: `/opt/illure`
- **Repository URL**: `https://github.com/singhdaksh7/illure.git`
- **Deploy Branch**: `main`

---

## 3. Staging Environment Setup (`/opt/illure/.env.staging`)

Create `/opt/illure/.env.staging` on the VPS using fresh values. **Do NOT commit `.env.staging` to Git.**

```env
# Staging Domain & Traefik Configuration
STAGING_DOMAIN=illure.YOUR_SERVER_IP.sslip.io
TRAEFIK_CERT_RESOLVER=letsencrypt

# Database Credentials
POSTGRES_USER=illure_staging_user
POSTGRES_PASSWORD=generate_fresh_random_staging_db_password_here
POSTGRES_DB=illure_staging_db

# Authentication Secrets (Must be min 32 characters, generated fresh)
JWT_ACCESS_SECRET=generate_fresh_32_plus_char_staging_access_secret_key_2026
JWT_REFRESH_SECRET=generate_fresh_32_plus_char_staging_refresh_secret_key_2026
ACCESS_TOKEN_TTL=15m
REFRESH_TOKEN_TTL=7d

# Frontend & CORS
FRONTEND_URL=https://illure.YOUR_SERVER_IP.sslip.io
COOKIE_DOMAIN=
LOG_LEVEL=info

# Initial Admin Seeding Credentials
SEED_ADMIN_EMAIL=admin-staging@illurefragrance.com
SEED_ADMIN_PASSWORD=StagingSuperAdminPass2026!
SEED_ADMIN_NAME=Illure Staging Super Admin

# Razorpay TEST Mode Credentials
RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID
RAZORPAY_KEY_SECRET=YOUR_KEY_SECRET
RAZORPAY_WEBHOOK_SECRET=generate_fresh_staging_webhook_secret_key_2026

# Staging SMTP Dispatch
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=587
SMTP_USER=your_staging_smtp_user
SMTP_PASS=your_staging_smtp_password
SMTP_FROM_NAME=İLLURÊ FRAGRANCE Staging
SMTP_FROM_EMAIL=noreply-staging@illurefragrance.com
ORDER_NOTIFICATION_EMAIL=orders-staging@illurefragrance.com
```

---

## 4. Initial Deployment Step-by-Step

### Step 1: Clone Repository on VPS
```bash
sudo mkdir -p /opt/illure
sudo chown -R $USER:$USER /opt/illure
cd /opt/illure
git clone https://github.com/singhdaksh7/illure.git .
```

### Step 2: Configure Staging Environment Variables
```bash
cp .env.staging.example .env.staging
nano .env.staging
# Enter your VPS IP, generated DB password, fresh JWT secrets, and Razorpay TEST keys
```

### Step 3: Validate Docker Compose File
```bash
docker compose -f docker-compose.staging.yml --env-file .env.staging config
```

### Step 4: Build and Launch Staging Containers
```bash
docker compose -f docker-compose.staging.yml --env-file .env.staging up -d --build
```

### Step 5: Verify Container Status
```bash
docker compose -f docker-compose.staging.yml ps
```
*Expected Output*: `illure-staging-db`, `illure-staging-api`, `illure-staging-web` are all `running` / `healthy`.

---

## 5. Controlled Database Migration & Seeding Workflow

### Step 1: Run Production Safe Prisma Migration Deploy
```bash
docker compose -f docker-compose.staging.yml --env-file .env.staging run --rm illure-api npx prisma migrate deploy
```

> **CRITICAL RULE**: NEVER run `prisma db push`, `prisma migrate reset`, or `prisma migrate dev` on staging. Only run `npx prisma migrate deploy`.

### Step 2: Seed Initial Catalogue & Super Admin Account
```bash
docker compose -f docker-compose.staging.yml --env-file .env.staging run --rm illure-api npm run prisma:seed
```

---

## 6. Staging Validation & E2E Testing Protocol

Perform the following verification checks on `https://illure.<SERVER_IP>.sslip.io`:

1. **API Health Endpoint**:
   ```bash
   curl -i https://illure.<SERVER_IP>.sslip.io/api/health
   ```
   *Expected Response*: HTTP 200 OK with `{"success": true, "data": {"status": "ok", "database": "connected"}}`.

2. **Public Catalog Routes**:
   - Verify `/api/products`, `/api/categories/public`, `/api/reference-brands/public`, `/api/gift-packaging/public`.
   - Verify frontend routes `/`, `/login`, `/register`, `/checkout`, `/admin` render properly without Nginx 404 errors on hard refresh.

3. **Admin Dashboard & CRUD Verification**:
   - Access `https://illure.<SERVER_IP>.sslip.io/admin`.
   - Authenticate with `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD`.
   - Test Product CRUD, Category CRUD, Reference Brand CRUD, Gift Packaging CRUD, and Stock Adjustment in Inventory tab.

4. **Customer Auth & Address Management**:
   - Register a new customer account.
   - Test login, refresh token persistence, profile view (`/api/auth/customer/me`), and logout.
   - Add, edit, set default, and delete shipping addresses.

5. **Cart Persistence & Guest-to-Customer Cart Merge**:
   - Add items as a guest customer. Verify cart persists across page reloads.
   - Log in to customer account. Verify guest items merge into server cart.

6. **Checkout & COD Order Verification**:
   - Apply staging coupon code (e.g. `WELCOME10`). Verify server-side discount calculation.
   - Place COD order. Verify stock deduction, order status `CONFIRMED`, payment status `COD_PENDING`, inventory movement `SALE`, and order confirmation email dispatch.

7. **Razorpay TEST Mode Payment & Webhook Idempotency**:
   - Initiate a Razorpay TEST payment.
   - Webhook target endpoint: `https://illure.<SERVER_IP>.sslip.io/api/payments/razorpay/webhook`.
   - Perform test payment completion. Verify HMAC signature validation, database record in `ProcessedWebhookEvent`, order marked `PAID`, and single stock deduction.
   - Resend duplicate webhook event. Verify HTTP 200 returned with no duplicate inventory deduction or status change.

8. **Admin Order Status Transition & Stock Restoration**:
   - Cancel an eligible order from Admin Orders dashboard.
   - Verify inventory stock is restored exactly once with movement type `CANCELLATION`.

---

## 7. PostgreSQL Database Backup & Restoration

### Manual Database Backup
To create a timestamped SQL dump of the staging database:
```bash
docker exec -t illure-staging-db pg_dump -U illure_staging_user -d illure_staging_db -F c -b -v -f /var/lib/postgresql/data/staging_backup_$(date +%Y%m%d_%H%M%S).dump
```

### Manual Database Restoration
To restore a database dump:
```bash
docker exec -t illure-staging-db pg_restore -U illure_staging_user -d illure_staging_db -v -c /var/lib/postgresql/data/staging_backup_YYYYMMDD_HHMMSS.dump
```

---

## 8. Rollback Procedure

If a deployment issue is identified:
1. Revert Git repository to previous stable commit:
   ```bash
   git checkout <PREVIOUS_STABLE_SHA>
   ```
2. Rebuild containers:
   ```bash
   docker compose -f docker-compose.staging.yml --env-file .env.staging up -d --build
   ```

---

## 9. Troubleshooting & Log Inspection

- View combined service logs:
  ```bash
  docker compose -f docker-compose.staging.yml logs -f
  ```
- View specific backend API logs:
  ```bash
  docker compose -f docker-compose.staging.yml logs -f illure-api
  ```
- View specific Nginx web logs:
  ```bash
  docker compose -f docker-compose.staging.yml logs -f illure-web
  ```
