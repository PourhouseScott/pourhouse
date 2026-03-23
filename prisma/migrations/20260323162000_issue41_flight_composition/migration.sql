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

-- CreateIndex
CREATE INDEX "Flight_isActive_idx" ON "public"."Flight"("isActive");

-- CreateIndex
CREATE INDEX "FlightWine_flightId_position_idx" ON "public"."FlightWine"("flightId", "position");

-- CreateIndex
CREATE INDEX "FlightWine_wineId_idx" ON "public"."FlightWine"("wineId");

-- CreateIndex
CREATE UNIQUE INDEX "FlightWine_flightId_wineId_key" ON "public"."FlightWine"("flightId", "wineId");

-- AddForeignKey
ALTER TABLE "public"."FlightWine" ADD CONSTRAINT "FlightWine_flightId_fkey" FOREIGN KEY ("flightId") REFERENCES "public"."Flight"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FlightWine" ADD CONSTRAINT "FlightWine_wineId_fkey" FOREIGN KEY ("wineId") REFERENCES "public"."Wine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

