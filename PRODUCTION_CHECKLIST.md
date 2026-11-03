# İLLURÊ FRAGRANCE — Production Pre-Flight Checklist

> **IMPORTANT WARNING**: DO NOT DEPLOY TO PRODUCTION YET.
> This document outlines the mandatory pre-flight checklist and operational requirements to complete prior to eventual production launch.

---

## 1. Domain & Network Security
- [ ] Configure production DNS A & AAAA records pointing `illurefragrance.com` and `api.illurefragrance.com` (or unified domain) to production VPS IP.
- [ ] Verify TLS/SSL certificate issuance via Let's Encrypt / Cloudflare.
- [ ] Configure CAA records to authorize Let's Encrypt / ZeroSSL certificate issuance.
- [ ] Enable HTTP to HTTPS redirection across all endpoints.
- [ ] Configure Strict Transport Security (HSTS) header (`max-age=31536000; includeSubDomains; preload`).

---

## 2. Production Database Infrastructure
- [ ] Provision dedicated PostgreSQL 16 instance with connection pooling (e.g., PgBouncer).
- [ ] Set high-entropy, unique production database credentials.
- [ ] Ensure database port 5432 is locked down to private internal VPC network only.
- [ ] Configure automated daily WAL archive backups with point-in-time recovery (PITR).
- [ ] Verify database indexes (`20260928085810_performance_indexes`) are applied.

---

## 3. Production Authentication & Secrets
- [ ] Generate fresh 64-character cryptographically secure random keys for:
  - `JWT_ACCESS_SECRET`
  - `JWT_REFRESH_SECRET`
  - `RAZORPAY_WEBHOOK_SECRET`
- [ ] Verify no secrets or `.env` files are tracked in Git repository or exposed in client JS bundles.
- [ ] Ensure `COOKIE_DOMAIN` matches production domain for secure cross-subdomain auth if required.

---

## 4. Live Razorpay Payment Gateway Integration
- [ ] Complete Razorpay KYB / Business Account Verification.
- [ ] Swap staging test keys (`rzp_test_...`) for Live API credentials (`rzp_live_...`).
- [ ] Configure Live Razorpay Webhook URL: `https://api.illurefragrance.com/api/payments/razorpay/webhook`.
- [ ] Subscribe to events: `payment.authorized`, `payment.captured`, `payment.failed`, `order.paid`.
- [ ] Set production Razorpay Webhook secret and verify HMAC signature validation in live mode.

---

## 5. Production Transactional Email Dispatch (SMTP)
- [ ] Provision production SMTP service (AWS SES / SendGrid / Postmark).
- [ ] Configure SPF (`v=spf1 ...`), DKIM, and DMARC (`p=reject`) DNS records for `illurefragrance.com` to ensure 100% email deliverability.
- [ ] Test transactional email templates: Order Confirmation, Shipping Status Update, Admin Order Alerts.

---

## 6. Super Admin & Catalogue Onboarding
- [ ] Create production Super Admin account via `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` or command-line admin setup.
- [ ] Remove all dummy / test product listings and replace with official production product catalogue, high-resolution WebP images, accurate SKUs, and inventory counts.

---

## 7. Monitoring, Logging & Error Tracking
- [ ] Integrate Sentry or Datadog error tracking on backend Express server.
- [ ] Set up uptime monitoring (Better Uptime / Healthchecks.io) on `GET /api/health`.
- [ ] Configure log aggregation and log rotation (`max-size 10m`, `max-file 5`).

---

## 8. Final Launch Sign-off
- [ ] Full end-to-end audit completed in Staging environment.
- [ ] Security audit & vulnerability scan (`npm audit`, dependency checks) passed.
- [ ] Core team sign-off for production deployment.
