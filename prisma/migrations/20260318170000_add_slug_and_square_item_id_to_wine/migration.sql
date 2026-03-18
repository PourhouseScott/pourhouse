-- AlterTable
ALTER TABLE "public"."Wine" ADD COLUMN "slug" TEXT NOT NULL DEFAULT '',
ADD COLUMN "squareItemId" TEXT;

-- AlterTable: drop default now that existing rows are handled
ALTER TABLE "public"."Wine" ALTER COLUMN "slug" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "Wine_slug_key" ON "public"."Wine"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Wine_squareItemId_key" ON "public"."Wine"("squareItemId");
