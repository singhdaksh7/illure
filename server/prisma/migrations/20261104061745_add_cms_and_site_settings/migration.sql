-- CreateTable
CREATE TABLE "site_settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "homepage_sections" (
    "id" TEXT NOT NULL,
    "sectionKey" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "layoutVariant" TEXT NOT NULL DEFAULT 'DEFAULT',
    "title" TEXT,
    "subtitle" TEXT,
    "description" TEXT,
    "ctaLabel" TEXT,
    "ctaUrl" TEXT,
    "desktopImage" TEXT,
    "mobileImage" TEXT,
    "customData" JSONB,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "homepage_sections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "site_settings_key_key" ON "site_settings"("key");

-- CreateIndex
CREATE UNIQUE INDEX "homepage_sections_sectionKey_key" ON "homepage_sections"("sectionKey");

-- CreateIndex
CREATE INDEX "homepage_sections_sortOrder_idx" ON "homepage_sections"("sortOrder");

-- CreateIndex
CREATE INDEX "homepage_sections_isEnabled_idx" ON "homepage_sections"("isEnabled");
