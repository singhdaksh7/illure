-- CreateEnum
CREATE TYPE "NotificationJobStatus" AS ENUM ('PENDING', 'PROCESSING', 'SENT', 'FAILED');

-- CreateEnum
CREATE TYPE "GiftCardStatus" AS ENUM ('ACTIVE', 'REDEEMED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "LoyaltyTxType" AS ENUM ('EARN', 'REDEEM', 'ADJUST', 'EXPIRE');

-- CreateEnum
CREATE TYPE "ReturnStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'RESOLVED');

-- CreateEnum
CREATE TYPE "RiskSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateTable NotificationJob
CREATE TABLE "notification_jobs" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" "NotificationJobStatus" NOT NULL DEFAULT 'PENDING',
    "payload" JSONB NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 3,
    "nextAttemptAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "lastError" TEXT,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable GiftCard
CREATE TABLE "gift_cards" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "initialBalance" DECIMAL(10,2) NOT NULL,
    "currentBalance" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "status" "GiftCardStatus" NOT NULL DEFAULT 'ACTIVE',
    "recipientEmail" TEXT,
    "recipientName" TEXT,
    "senderName" TEXT,
    "message" TEXT,
    "purchasedByCustomerId" TEXT,
    "expiresAt" TIMESTAMP(3),
    "redeemedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gift_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable CustomerScentProfile
CREATE TABLE "customer_scent_profiles" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "preferredFamilies" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "likedNotes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "avoidedNotes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "moods" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "occasions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "intensity" TEXT,
    "quizAnswers" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_scent_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable ProductReview
CREATE TABLE "product_reviews" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "variantId" TEXT,
    "customerId" TEXT NOT NULL,
    "orderId" TEXT,
    "rating" INTEGER NOT NULL,
    "scentRating" INTEGER,
    "longevityRating" INTEGER,
    "valueRating" INTEGER,
    "wouldBuyAgain" BOOLEAN DEFAULT true,
    "title" TEXT,
    "comment" TEXT NOT NULL,
    "mediaUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable LoyaltyAccount
CREATE TABLE "loyalty_accounts" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "balance" INTEGER NOT NULL DEFAULT 0,
    "tier" TEXT NOT NULL DEFAULT 'OBSIDIAN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "loyalty_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable LoyaltyTransaction
CREATE TABLE "loyalty_transactions" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "type" "LoyaltyTxType" NOT NULL,
    "points" INTEGER NOT NULL,
    "orderId" TEXT,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "loyalty_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable Referral
CREATE TABLE "referrals" (
    "id" TEXT NOT NULL,
    "referrerId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "referredEmail" TEXT,
    "referredId" TEXT,
    "rewardClaimed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "referrals_pkey" PRIMARY KEY ("id")
);

-- CreateTable LimitedDrop
CREATE TABLE "limited_drops" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3),
    "earlyAccess" BOOLEAN NOT NULL DEFAULT false,
    "productIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "limited_drops_pkey" PRIMARY KEY ("id")
);

-- CreateTable OrderReturnRequest
CREATE TABLE "order_return_requests" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "items" JSONB NOT NULL,
    "reason" TEXT NOT NULL,
    "evidenceUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "ReturnStatus" NOT NULL DEFAULT 'PENDING',
    "resolution" TEXT,
    "adminNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_return_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable PincodeRule
CREATE TABLE "pincode_rules" (
    "id" TEXT NOT NULL,
    "pincode" TEXT NOT NULL,
    "isServiceable" BOOLEAN NOT NULL DEFAULT true,
    "isCodAllowed" BOOLEAN NOT NULL DEFAULT true,
    "estimatedDays" INTEGER NOT NULL DEFAULT 3,
    "state" TEXT,
    "city" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pincode_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable RiskFlag
CREATE TABLE "risk_flags" (
    "id" TEXT NOT NULL,
    "orderId" TEXT,
    "customerId" TEXT,
    "reason" TEXT NOT NULL,
    "severity" "RiskSeverity" NOT NULL DEFAULT 'MEDIUM',
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "risk_flags_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notification_jobs_status_nextAttemptAt_idx" ON "notification_jobs"("status", "nextAttemptAt");
CREATE INDEX "notification_jobs_type_idx" ON "notification_jobs"("type");

CREATE UNIQUE INDEX "gift_cards_code_key" ON "gift_cards"("code");
CREATE INDEX "gift_cards_code_idx" ON "gift_cards"("code");
CREATE INDEX "gift_cards_status_idx" ON "gift_cards"("status");

CREATE UNIQUE INDEX "customer_scent_profiles_customerId_key" ON "customer_scent_profiles"("customerId");

CREATE INDEX "product_reviews_productId_status_idx" ON "product_reviews"("productId", "status");
CREATE INDEX "product_reviews_customerId_idx" ON "product_reviews"("customerId");

CREATE UNIQUE INDEX "loyalty_accounts_customerId_key" ON "loyalty_accounts"("customerId");
CREATE INDEX "loyalty_transactions_accountId_idx" ON "loyalty_transactions"("accountId");
CREATE INDEX "loyalty_transactions_orderId_idx" ON "loyalty_transactions"("orderId");

CREATE UNIQUE INDEX "referrals_code_key" ON "referrals"("code");
CREATE UNIQUE INDEX "referrals_referredId_key" ON "referrals"("referredId");
CREATE INDEX "referrals_code_idx" ON "referrals"("code");
CREATE INDEX "referrals_referrerId_idx" ON "referrals"("referrerId");

CREATE UNIQUE INDEX "limited_drops_slug_key" ON "limited_drops"("slug");
CREATE INDEX "limited_drops_slug_idx" ON "limited_drops"("slug");
CREATE INDEX "limited_drops_isActive_idx" ON "limited_drops"("isActive");

CREATE INDEX "order_return_requests_orderId_idx" ON "order_return_requests"("orderId");
CREATE INDEX "order_return_requests_customerId_idx" ON "order_return_requests"("customerId");
CREATE INDEX "order_return_requests_status_idx" ON "order_return_requests"("status");

CREATE UNIQUE INDEX "pincode_rules_pincode_key" ON "pincode_rules"("pincode");
CREATE INDEX "pincode_rules_pincode_idx" ON "pincode_rules"("pincode");

CREATE INDEX "risk_flags_orderId_idx" ON "risk_flags"("orderId");
CREATE INDEX "risk_flags_customerId_idx" ON "risk_flags"("customerId");
CREATE INDEX "risk_flags_isResolved_idx" ON "risk_flags"("isResolved");

-- AddForeignKey
ALTER TABLE "gift_cards" ADD CONSTRAINT "gift_cards_purchasedByCustomerId_fkey" FOREIGN KEY ("purchasedByCustomerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "customer_scent_profiles" ADD CONSTRAINT "customer_scent_profiles_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "product_reviews" ADD CONSTRAINT "product_reviews_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "product_reviews" ADD CONSTRAINT "product_reviews_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "product_reviews" ADD CONSTRAINT "product_reviews_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "loyalty_accounts" ADD CONSTRAINT "loyalty_accounts_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "loyalty_transactions" ADD CONSTRAINT "loyalty_transactions_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "loyalty_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referrerId_fkey" FOREIGN KEY ("referrerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referredId_fkey" FOREIGN KEY ("referredId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "order_return_requests" ADD CONSTRAINT "order_return_requests_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "order_return_requests" ADD CONSTRAINT "order_return_requests_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
