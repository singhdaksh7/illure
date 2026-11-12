-- AlterTable Customer
ALTER TABLE "customers" ADD COLUMN "passwordResetToken" TEXT,
ADD COLUMN "passwordResetExpires" TIMESTAMP(3);

-- AlterTable ProductImage
ALTER TABLE "product_images" ADD COLUMN "storageKey" TEXT;

-- CreateEnum
CREATE TYPE "BannerPosition" AS ENUM ('HOMEPAGE', 'CATALOG', 'PDP', 'CART', 'ACCOUNT');

-- CreateEnum
CREATE TYPE "PageStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "IntegrationProvider" AS ENUM ('R2', 'SHIPROCKET', 'RAZORPAY', 'SMTP');

-- CreateEnum
CREATE TYPE "ShipmentStatus" AS ENUM ('PENDING', 'READY_TO_SHIP', 'MANIFESTED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED', 'RTO', 'CANCELLED');

-- CreateTable UrlRedirect
CREATE TABLE "url_redirects" (
    "id" TEXT NOT NULL,
    "sourcePath" TEXT NOT NULL,
    "targetPath" TEXT NOT NULL,
    "statusCode" INTEGER NOT NULL DEFAULT 301,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "hitCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "url_redirects_pkey" PRIMARY KEY ("id")
);

-- CreateTable MediaItem
CREATE TABLE "media_items" (
    "id" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "publicUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "altText" TEXT,
    "folder" TEXT NOT NULL DEFAULT 'general',
    "usedByCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable Banner
CREATE TABLE "banners" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "position" "BannerPosition" NOT NULL DEFAULT 'HOMEPAGE',
    "desktopImageUrl" TEXT NOT NULL,
    "mobileImageUrl" TEXT,
    "headline" TEXT,
    "subheadline" TEXT,
    "ctaLabel" TEXT,
    "ctaUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "startAt" TIMESTAMP(3),
    "endAt" TIMESTAMP(3),
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "banners_pkey" PRIMARY KEY ("id")
);

-- CreateTable AnnouncementTicker
CREATE TABLE "announcement_tickers" (
    "id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "linkLabel" TEXT,
    "linkUrl" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "startAt" TIMESTAMP(3),
    "endAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "announcement_tickers_pkey" PRIMARY KEY ("id")
);

-- CreateTable StaticPage
CREATE TABLE "static_pages" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" "PageStatus" NOT NULL DEFAULT 'DRAFT',
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "static_pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable IntegrationConfig
CREATE TABLE "integration_configs" (
    "id" TEXT NOT NULL,
    "provider" "IntegrationProvider" NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "encryptedCredentials" TEXT NOT NULL,
    "settings" JSONB NOT NULL DEFAULT '{}',
    "lastTestedAt" TIMESTAMP(3),
    "lastTestStatus" TEXT,
    "lastTestMessage" TEXT,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "integration_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable Shipment
CREATE TABLE "shipments" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'SHIPROCKET',
    "providerOrderId" TEXT,
    "shipmentId" TEXT,
    "awb" TEXT,
    "courierName" TEXT,
    "status" "ShipmentStatus" NOT NULL DEFAULT 'PENDING',
    "trackingUrl" TEXT,
    "labelUrl" TEXT,
    "manifestUrl" TEXT,
    "rawMetadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shipments_pkey" PRIMARY KEY ("id")
);

-- CreateTable WebhookLog
CREATE TABLE "webhook_logs" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "eventId" TEXT,
    "eventType" TEXT,
    "payload" JSONB NOT NULL,
    "status" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 1,
    "error" TEXT,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "webhook_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "url_redirects_sourcePath_key" ON "url_redirects"("sourcePath");
CREATE INDEX "url_redirects_sourcePath_idx" ON "url_redirects"("sourcePath");

CREATE UNIQUE INDEX "media_items_storageKey_key" ON "media_items"("storageKey");
CREATE INDEX "media_items_storageKey_idx" ON "media_items"("storageKey");
CREATE INDEX "media_items_folder_idx" ON "media_items"("folder");

CREATE INDEX "banners_position_isEnabled_idx" ON "banners"("position", "isEnabled");

CREATE INDEX "announcement_tickers_isEnabled_idx" ON "announcement_tickers"("isEnabled");

CREATE UNIQUE INDEX "static_pages_slug_key" ON "static_pages"("slug");
CREATE INDEX "static_pages_slug_idx" ON "static_pages"("slug");
CREATE INDEX "static_pages_status_idx" ON "static_pages"("status");

CREATE UNIQUE INDEX "integration_configs_provider_key" ON "integration_configs"("provider");
CREATE INDEX "integration_configs_provider_idx" ON "integration_configs"("provider");

CREATE UNIQUE INDEX "shipments_awb_key" ON "shipments"("awb");
CREATE INDEX "shipments_orderId_idx" ON "shipments"("orderId");
CREATE INDEX "shipments_awb_idx" ON "shipments"("awb");
CREATE INDEX "shipments_status_idx" ON "shipments"("status");

CREATE INDEX "webhook_logs_provider_eventId_idx" ON "webhook_logs"("provider", "eventId");
CREATE INDEX "webhook_logs_status_idx" ON "webhook_logs"("status");

-- AddForeignKey
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
