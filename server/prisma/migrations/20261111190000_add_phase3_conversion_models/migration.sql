-- CreateEnum
CREATE TYPE "DiscoverySetType" AS ENUM ('CUSTOM', 'PREBUILT');

-- CreateEnum
CREATE TYPE "DiscoverySetSelectionMode" AS ENUM ('PRODUCT', 'VARIANT');

-- CreateEnum
CREATE TYPE "DiscoverySetPricingMode" AS ENUM ('FIXED', 'SUM', 'DISCOUNTED_SUM');

-- CreateEnum
CREATE TYPE "DiscoverySetStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "StockAlertStatus" AS ENUM ('ACTIVE', 'SENT', 'CANCELLED');

-- AlterTable
ALTER TABLE "cart_items" ADD COLUMN     "bundleConfigId" TEXT,
ADD COLUMN     "bundleSelections" JSONB;

-- AlterTable
ALTER TABLE "order_items" ADD COLUMN     "bundleConfigId" TEXT,
ADD COLUMN     "bundleSelections" JSONB;

-- CreateTable
CREATE TABLE "discovery_set_configs" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" "DiscoverySetType" NOT NULL DEFAULT 'CUSTOM',
    "status" "DiscoverySetStatus" NOT NULL DEFAULT 'ACTIVE',
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "description" TEXT,
    "imageUrl" TEXT,
    "selectionMode" "DiscoverySetSelectionMode" NOT NULL DEFAULT 'PRODUCT',
    "minSelections" INTEGER NOT NULL DEFAULT 3,
    "maxSelections" INTEGER NOT NULL DEFAULT 3,
    "pricingMode" "DiscoverySetPricingMode" NOT NULL DEFAULT 'FIXED',
    "fixedPrice" DECIMAL(10,2),
    "discountPercent" DECIMAL(5,2),
    "allowDuplicates" BOOLEAN NOT NULL DEFAULT false,
    "maxPerOrder" INTEGER NOT NULL DEFAULT 5,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "discovery_set_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discovery_set_eligible_items" (
    "id" TEXT NOT NULL,
    "discoverySetId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "variantId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "discovery_set_eligible_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discovery_set_prebuilt_items" (
    "id" TEXT NOT NULL,
    "discoverySetId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "variantId" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "discovery_set_prebuilt_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wishlist_items" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wishlist_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_alert_subscriptions" (
    "id" TEXT NOT NULL,
    "productVariantId" TEXT NOT NULL,
    "customerId" TEXT,
    "email" TEXT NOT NULL,
    "status" "StockAlertStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sentAt" TIMESTAMP(3),

    CONSTRAINT "stock_alert_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "discovery_set_configs_slug_key" ON "discovery_set_configs"("slug");

-- CreateIndex
CREATE INDEX "discovery_set_configs_slug_idx" ON "discovery_set_configs"("slug");

-- CreateIndex
CREATE INDEX "discovery_set_configs_status_idx" ON "discovery_set_configs"("status");

-- CreateIndex
CREATE INDEX "discovery_set_configs_type_idx" ON "discovery_set_configs"("type");

-- CreateIndex
CREATE INDEX "discovery_set_eligible_items_discoverySetId_idx" ON "discovery_set_eligible_items"("discoverySetId");

-- CreateIndex
CREATE INDEX "discovery_set_eligible_items_productId_idx" ON "discovery_set_eligible_items"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "discovery_set_eligible_items_discoverySetId_productId_varia_key" ON "discovery_set_eligible_items"("discoverySetId", "productId", "variantId");

-- CreateIndex
CREATE INDEX "discovery_set_prebuilt_items_discoverySetId_idx" ON "discovery_set_prebuilt_items"("discoverySetId");

-- CreateIndex
CREATE INDEX "discovery_set_prebuilt_items_productId_idx" ON "discovery_set_prebuilt_items"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "discovery_set_prebuilt_items_discoverySetId_productId_varia_key" ON "discovery_set_prebuilt_items"("discoverySetId", "productId", "variantId");

-- CreateIndex
CREATE INDEX "wishlist_items_customerId_idx" ON "wishlist_items"("customerId");

-- CreateIndex
CREATE INDEX "wishlist_items_productId_idx" ON "wishlist_items"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "wishlist_items_customerId_productId_key" ON "wishlist_items"("customerId", "productId");

-- CreateIndex
CREATE INDEX "stock_alert_subscriptions_productVariantId_idx" ON "stock_alert_subscriptions"("productVariantId");

-- CreateIndex
CREATE INDEX "stock_alert_subscriptions_email_idx" ON "stock_alert_subscriptions"("email");

-- CreateIndex
CREATE INDEX "stock_alert_subscriptions_status_idx" ON "stock_alert_subscriptions"("status");

-- CreateIndex
CREATE UNIQUE INDEX "stock_alert_subscriptions_productVariantId_email_status_key" ON "stock_alert_subscriptions"("productVariantId", "email", "status");

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_bundleConfigId_fkey" FOREIGN KEY ("bundleConfigId") REFERENCES "discovery_set_configs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_bundleConfigId_fkey" FOREIGN KEY ("bundleConfigId") REFERENCES "discovery_set_configs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discovery_set_eligible_items" ADD CONSTRAINT "discovery_set_eligible_items_discoverySetId_fkey" FOREIGN KEY ("discoverySetId") REFERENCES "discovery_set_configs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discovery_set_eligible_items" ADD CONSTRAINT "discovery_set_eligible_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discovery_set_eligible_items" ADD CONSTRAINT "discovery_set_eligible_items_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discovery_set_prebuilt_items" ADD CONSTRAINT "discovery_set_prebuilt_items_discoverySetId_fkey" FOREIGN KEY ("discoverySetId") REFERENCES "discovery_set_configs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discovery_set_prebuilt_items" ADD CONSTRAINT "discovery_set_prebuilt_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discovery_set_prebuilt_items" ADD CONSTRAINT "discovery_set_prebuilt_items_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_alert_subscriptions" ADD CONSTRAINT "stock_alert_subscriptions_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_alert_subscriptions" ADD CONSTRAINT "stock_alert_subscriptions_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
