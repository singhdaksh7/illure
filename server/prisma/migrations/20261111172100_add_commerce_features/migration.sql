-- CreateEnum
CREATE TYPE "FeatureGroup" AS ENUM ('DISCOVERY', 'CONVERSION', 'GIFTING', 'RETENTION', 'LOYALTY', 'ORDERS', 'DELIVERY', 'MARKETING', 'ANALYTICS', 'CUSTOMER_EXPERIENCE');

-- CreateEnum
CREATE TYPE "FeatureStatus" AS ENUM ('DISABLED', 'DRAFT', 'ACTIVE', 'SCHEDULED', 'CONFIGURATION_REQUIRED');

-- CreateTable
CREATE TABLE "commerce_features" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "group" "FeatureGroup" NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "status" "FeatureStatus" NOT NULL DEFAULT 'DISABLED',
    "showInNavigation" BOOLEAN NOT NULL DEFAULT false,
    "navigationLabel" TEXT,
    "navigationPath" TEXT,
    "showOnHomepage" BOOLEAN NOT NULL DEFAULT false,
    "homepageSortOrder" INTEGER NOT NULL DEFAULT 0,
    "config" JSONB NOT NULL DEFAULT '{}',
    "minimumOrderValue" DECIMAL(10,2),
    "maximumOrderValue" DECIMAL(10,2),
    "startAt" TIMESTAMP(3),
    "endAt" TIMESTAMP(3),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "commerce_features_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commerce_audit_logs" (
    "id" TEXT NOT NULL,
    "featureId" TEXT,
    "featureKey" TEXT,
    "actorId" TEXT,
    "actorName" TEXT,
    "actorRole" TEXT,
    "action" TEXT NOT NULL,
    "oldValue" JSONB,
    "newValue" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "commerce_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commerce_event_logs" (
    "id" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "featureKey" TEXT,
    "customerId" TEXT,
    "sessionId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "commerce_event_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "commerce_features_key_key" ON "commerce_features"("key");

-- CreateIndex
CREATE INDEX "commerce_features_group_idx" ON "commerce_features"("group");

-- CreateIndex
CREATE INDEX "commerce_features_isEnabled_idx" ON "commerce_features"("isEnabled");

-- CreateIndex
CREATE INDEX "commerce_features_status_idx" ON "commerce_features"("status");

-- CreateIndex
CREATE INDEX "commerce_audit_logs_featureKey_idx" ON "commerce_audit_logs"("featureKey");

-- CreateIndex
CREATE INDEX "commerce_audit_logs_actorId_idx" ON "commerce_audit_logs"("actorId");

-- CreateIndex
CREATE INDEX "commerce_audit_logs_createdAt_idx" ON "commerce_audit_logs"("createdAt");

-- CreateIndex
CREATE INDEX "commerce_event_logs_eventType_idx" ON "commerce_event_logs"("eventType");

-- CreateIndex
CREATE INDEX "commerce_event_logs_featureKey_idx" ON "commerce_event_logs"("featureKey");

-- CreateIndex
CREATE INDEX "commerce_event_logs_customerId_idx" ON "commerce_event_logs"("customerId");

-- CreateIndex
CREATE INDEX "commerce_event_logs_createdAt_idx" ON "commerce_event_logs"("createdAt");

-- AddForeignKey
ALTER TABLE "commerce_audit_logs" ADD CONSTRAINT "commerce_audit_logs_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "commerce_features"("id") ON DELETE SET NULL ON UPDATE CASCADE;
