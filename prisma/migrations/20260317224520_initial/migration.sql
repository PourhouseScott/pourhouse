-- CreateTable
CREATE TABLE "public"."Wine" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "vintage" INTEGER NOT NULL,
    "wineryId" TEXT NOT NULL,
    "regionId" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "grapeVarieties" JSONB NOT NULL,
    "alcoholPercent" DOUBLE PRECISION NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Wine_pkey" PRIMARY KEY ("id")
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
    "priceGlass" DECIMAL(10,2) NOT NULL,
    "priceBottle" DECIMAL(10,2) NOT NULL,
    "stockQuantity" INTEGER NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
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
CREATE INDEX "Wine_regionId_idx" ON "public"."Wine"("regionId");

-- CreateIndex
CREATE INDEX "Wine_wineryId_idx" ON "public"."Wine"("wineryId");

-- CreateIndex
CREATE UNIQUE INDEX "Wine_name_wineryId_vintage_key" ON "public"."Wine"("name", "wineryId", "vintage");

-- CreateIndex
CREATE INDEX "Winery_regionId_idx" ON "public"."Winery"("regionId");

-- CreateIndex
CREATE INDEX "Region_parentId_idx" ON "public"."Region"("parentId");

-- CreateIndex
CREATE INDEX "Inventory_wineId_idx" ON "public"."Inventory"("wineId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "Rating_wineId_idx" ON "public"."Rating"("wineId");

-- CreateIndex
CREATE INDEX "Rating_userId_idx" ON "public"."Rating"("userId");

-- AddForeignKey
ALTER TABLE "public"."Wine" ADD CONSTRAINT "Wine_wineryId_fkey" FOREIGN KEY ("wineryId") REFERENCES "public"."Winery"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Wine" ADD CONSTRAINT "Wine_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "public"."Region"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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
