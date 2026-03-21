-- CreateTable WineVariation
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

-- CreateIndex
CREATE INDEX "WineVariation_wineId_idx" ON "public"."WineVariation"("wineId");

-- CreateIndex
CREATE INDEX "WineVariation_squareVariationId_idx" ON "public"."WineVariation"("squareVariationId");

-- Create a unique variation for each Inventory row
-- This preserves the existing data structure where an Inventory row represents a distinct variation
INSERT INTO "public"."WineVariation" (id, "wineId", "squareVariationId", "name", "price", "volumeOz", "isPublic", "isDefault", "createdAt")
SELECT
    gen_random_uuid(),
    i."wineId",
    CASE
        WHEN i."locationId" LIKE 'square:%' THEN substring(i."locationId" FROM 8)
        ELSE NULL
    END as "squareVariationId",
    CASE
        WHEN i."priceGlass" > 0 THEN 'By the Glass - $' || i."priceGlass"
        WHEN i."priceBottle" > 0 THEN 'Bottle - $' || i."priceBottle"
        ELSE 'Variation'
    END as "name",
    GREATEST(i."priceGlass", i."priceBottle"),
    NULL,
    true,
    false,
    i."createdAt"
FROM "public"."Inventory" i;

-- Add wineVariationId column to Inventory
ALTER TABLE "public"."Inventory" ADD COLUMN "wineVariationId" TEXT;

-- Populate wineVariationId by matching each Inventory row to its corresponding variation
-- We do this by matching the wine + price combination
UPDATE "public"."Inventory" i
SET "wineVariationId" = (
    SELECT wv.id
    FROM "public"."WineVariation" wv
    WHERE wv."wineId" = i."wineId"
    AND wv."price" = GREATEST(i."priceGlass", i."priceBottle")
    AND (
        CASE
            WHEN i."locationId" LIKE 'square:%' THEN substring(i."locationId" FROM 8)
            ELSE NULL
        END IS NOT DISTINCT FROM wv."squareVariationId"
    )
    LIMIT 1
);

-- Make wineVariationId NOT NULL
ALTER TABLE "public"."Inventory" ALTER COLUMN "wineVariationId" SET NOT NULL;

-- Add foreign key constraint
ALTER TABLE "public"."Inventory" ADD CONSTRAINT "Inventory_wineVariationId_fkey" FOREIGN KEY ("wineVariationId") REFERENCES "public"."WineVariation"("id") ON DELETE CASCADE;

-- Remove old columns from Inventory
ALTER TABLE "public"."Inventory" DROP COLUMN "wineId";
ALTER TABLE "public"."Inventory" DROP COLUMN "priceGlass";
ALTER TABLE "public"."Inventory" DROP COLUMN "priceBottle";

-- Remove old index on wineId
DROP INDEX IF EXISTS "public"."Inventory_wineId_idx";

-- Add AddForeignKey
ALTER TABLE "public"."WineVariation" ADD CONSTRAINT "WineVariation_wineId_fkey" FOREIGN KEY ("wineId") REFERENCES "public"."Wine"("id") ON DELETE CASCADE;
