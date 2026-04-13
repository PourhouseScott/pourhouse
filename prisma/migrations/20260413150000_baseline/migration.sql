-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."AuthProvider" AS ENUM ('LOCAL', 'GOOGLE');

-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "public"."ServingMode" AS ENUM ('BOTTLE_750ML', 'GLASS_5OZ', 'GLASS_9OZ', 'FLIGHT_2OZ', 'UNKNOWN');

-- CreateTable
CREATE TABLE "public"."Wine" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "vintage" INTEGER NOT NULL,
    "wineryId" TEXT NOT NULL,
    "regionId" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "grapeVarieties" JSONB NOT NULL,
    "alcoholPercent" DOUBLE PRECISION NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "squareItemId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Wine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Flight" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Flight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FlightWine" (
    "id" TEXT NOT NULL,
    "flightId" TEXT NOT NULL,
    "wineId" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FlightWine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WineVariation" (
    "id" TEXT NOT NULL,
    "wineId" TEXT NOT NULL,
    "squareVariationId" TEXT,
    "name" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "volumeOz" INTEGER,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WineVariation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WineVariationServingMode" (
    "id" TEXT NOT NULL,
    "wineVariationId" TEXT NOT NULL,
    "servingMode" "public"."ServingMode" NOT NULL DEFAULT 'UNKNOWN',
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WineVariationServingMode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SquareServingModeOverride" (
    "id" TEXT NOT NULL,
    "squareVariationId" TEXT NOT NULL,
    "servingMode" "public"."ServingMode" NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SquareServingModeOverride_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SquareCatalogItem" (
    "id" TEXT NOT NULL,
    "squareItemId" TEXT NOT NULL,
    "wineId" TEXT,
    "rawPayload" JSONB NOT NULL,
    "extractedData" JSONB NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "lastSyncedAt" TIMESTAMP(3) NOT NULL,
    "syncFailedAt" TIMESTAMP(3),
    "syncError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SquareCatalogItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SquareCatalogVariation" (
    "id" TEXT NOT NULL,
    "squareVariationId" TEXT NOT NULL,
    "squareCatalogItemId" TEXT NOT NULL,
    "wineVariationId" TEXT,
    "rawPayload" JSONB NOT NULL,
    "extractedData" JSONB NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "lastSyncedAt" TIMESTAMP(3) NOT NULL,
    "syncFailedAt" TIMESTAMP(3),
    "syncError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SquareCatalogVariation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Winery" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "regionId" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "website" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Winery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Region" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "parentId" TEXT,

    CONSTRAINT "Region_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Inventory" (
    "id" TEXT NOT NULL,
    "wineId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "sealedBottleCount" INTEGER NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "name" TEXT NOT NULL,
    "authProvider" "public"."AuthProvider" NOT NULL DEFAULT 'LOCAL',
    "role" "public"."UserRole" NOT NULL DEFAULT 'USER',
    "googleSubject" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Rating" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "wineId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "notes" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Rating_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Wine_slug_key" ON "public"."Wine"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Wine_squareItemId_key" ON "public"."Wine"("squareItemId");

-- CreateIndex
CREATE INDEX "Wine_regionId_idx" ON "public"."Wine"("regionId");

-- CreateIndex
CREATE INDEX "Wine_wineryId_idx" ON "public"."Wine"("wineryId");

-- CreateIndex
CREATE UNIQUE INDEX "Wine_name_wineryId_vintage_key" ON "public"."Wine"("name", "wineryId", "vintage");

-- CreateIndex
CREATE INDEX "Flight_isActive_idx" ON "public"."Flight"("isActive");

-- CreateIndex
CREATE INDEX "FlightWine_flightId_position_idx" ON "public"."FlightWine"("flightId", "position");

-- CreateIndex
CREATE INDEX "FlightWine_wineId_idx" ON "public"."FlightWine"("wineId");

-- CreateIndex
CREATE UNIQUE INDEX "FlightWine_flightId_wineId_key" ON "public"."FlightWine"("flightId", "wineId");

-- CreateIndex
CREATE INDEX "WineVariation_wineId_idx" ON "public"."WineVariation"("wineId");

-- CreateIndex
CREATE INDEX "WineVariation_squareVariationId_idx" ON "public"."WineVariation"("squareVariationId");

-- CreateIndex
CREATE UNIQUE INDEX "WineVariationServingMode_wineVariationId_key" ON "public"."WineVariationServingMode"("wineVariationId");

-- CreateIndex
CREATE INDEX "WineVariationServingMode_servingMode_isAvailable_idx" ON "public"."WineVariationServingMode"("servingMode", "isAvailable");

-- CreateIndex
CREATE UNIQUE INDEX "SquareServingModeOverride_squareVariationId_key" ON "public"."SquareServingModeOverride"("squareVariationId");

-- CreateIndex
CREATE UNIQUE INDEX "SquareCatalogItem_squareItemId_key" ON "public"."SquareCatalogItem"("squareItemId");

-- CreateIndex
CREATE UNIQUE INDEX "SquareCatalogItem_wineId_key" ON "public"."SquareCatalogItem"("wineId");

-- CreateIndex
CREATE INDEX "SquareCatalogItem_wineId_idx" ON "public"."SquareCatalogItem"("wineId");

-- CreateIndex
CREATE UNIQUE INDEX "SquareCatalogVariation_squareVariationId_key" ON "public"."SquareCatalogVariation"("squareVariationId");

-- CreateIndex
CREATE UNIQUE INDEX "SquareCatalogVariation_wineVariationId_key" ON "public"."SquareCatalogVariation"("wineVariationId");

-- CreateIndex
CREATE INDEX "SquareCatalogVariation_squareCatalogItemId_idx" ON "public"."SquareCatalogVariation"("squareCatalogItemId");

-- CreateIndex
CREATE INDEX "SquareCatalogVariation_wineVariationId_idx" ON "public"."SquareCatalogVariation"("wineVariationId");

-- CreateIndex
CREATE INDEX "Winery_regionId_idx" ON "public"."Winery"("regionId");

-- CreateIndex
CREATE INDEX "Region_parentId_idx" ON "public"."Region"("parentId");

-- CreateIndex
CREATE INDEX "Inventory_wineId_idx" ON "public"."Inventory"("wineId");

-- CreateIndex
CREATE UNIQUE INDEX "Inventory_wineId_locationId_key" ON "public"."Inventory"("wineId", "locationId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_googleSubject_key" ON "public"."User"("googleSubject");

-- CreateIndex
CREATE INDEX "Rating_wineId_idx" ON "public"."Rating"("wineId");

-- CreateIndex
CREATE INDEX "Rating_userId_idx" ON "public"."Rating"("userId");

-- AddForeignKey
ALTER TABLE "public"."Wine" ADD CONSTRAINT "Wine_wineryId_fkey" FOREIGN KEY ("wineryId") REFERENCES "public"."Winery"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Wine" ADD CONSTRAINT "Wine_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "public"."Region"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FlightWine" ADD CONSTRAINT "FlightWine_flightId_fkey" FOREIGN KEY ("flightId") REFERENCES "public"."Flight"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FlightWine" ADD CONSTRAINT "FlightWine_wineId_fkey" FOREIGN KEY ("wineId") REFERENCES "public"."Wine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WineVariation" ADD CONSTRAINT "WineVariation_wineId_fkey" FOREIGN KEY ("wineId") REFERENCES "public"."Wine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WineVariationServingMode" ADD CONSTRAINT "WineVariationServingMode_wineVariationId_fkey" FOREIGN KEY ("wineVariationId") REFERENCES "public"."WineVariation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SquareCatalogItem" ADD CONSTRAINT "SquareCatalogItem_wineId_fkey" FOREIGN KEY ("wineId") REFERENCES "public"."Wine"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SquareCatalogVariation" ADD CONSTRAINT "SquareCatalogVariation_squareCatalogItemId_fkey" FOREIGN KEY ("squareCatalogItemId") REFERENCES "public"."SquareCatalogItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SquareCatalogVariation" ADD CONSTRAINT "SquareCatalogVariation_wineVariationId_fkey" FOREIGN KEY ("wineVariationId") REFERENCES "public"."WineVariation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Winery" ADD CONSTRAINT "Winery_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "public"."Region"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Region" ADD CONSTRAINT "Region_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."Region"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Inventory" ADD CONSTRAINT "Inventory_wineId_fkey" FOREIGN KEY ("wineId") REFERENCES "public"."Wine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Rating" ADD CONSTRAINT "Rating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Rating" ADD CONSTRAINT "Rating_wineId_fkey" FOREIGN KEY ("wineId") REFERENCES "public"."Wine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

