import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const france = await prisma.region.upsert({
    where: { id: "11111111-1111-1111-1111-111111111111" },
    update: {},
    create: {
      id: "11111111-1111-1111-1111-111111111111",
      name: "France"
    }
  });

  const bordeaux = await prisma.region.upsert({
    where: { id: "22222222-2222-2222-2222-222222222222" },
    update: {},
    create: {
      id: "22222222-2222-2222-2222-222222222222",
      name: "Bordeaux",
      parentId: france.id
    }
  });

  const napa = await prisma.region.upsert({
    where: { id: "33333333-3333-3333-3333-333333333333" },
    update: {},
    create: {
      id: "33333333-3333-3333-3333-333333333333",
      name: "Napa Valley"
    }
  });

  const wineryOne = await prisma.winery.upsert({
    where: { id: "44444444-4444-4444-4444-444444444444" },
    update: {},
    create: {
      id: "44444444-4444-4444-4444-444444444444",
      name: "Chateau Lumiere",
      regionId: bordeaux.id,
      country: "France",
      website: "https://chateaulumiere.example.com",
      description: "Traditional Bordeaux producer focused on elegant blends."
    }
  });

  const wineryTwo = await prisma.winery.upsert({
    where: { id: "55555555-5555-5555-5555-555555555555" },
    update: {},
    create: {
      id: "55555555-5555-5555-5555-555555555555",
      name: "Silver Crest Cellars",
      regionId: napa.id,
      country: "United States",
      website: "https://silvercrest.example.com",
      description: "Small-lot Napa winery producing bold reds."
    }
  });

  const wineOne = await prisma.wine.upsert({
    where: {
      name_wineryId_vintage: {
        name: "Reserve Cabernet",
        wineryId: wineryTwo.id,
        vintage: 2020
      }
    },
    update: {},
    create: {
      name: "Reserve Cabernet",
      slug: "reserve-cabernet-silver-crest-cellars-2020",
      vintage: 2020,
      wineryId: wineryTwo.id,
      regionId: napa.id,
      country: "United States",
      grapeVarieties: ["Cabernet Sauvignon"],
      alcoholPercent: 14.5,
      description: "Dark fruit, cedar, and long finish.",
      imageUrl: "https://images.example.com/reserve-cabernet.jpg"
    }
  });

  const wineTwo = await prisma.wine.upsert({
    where: {
      name_wineryId_vintage: {
        name: "Grand Bordeaux Blend",
        wineryId: wineryOne.id,
        vintage: 2019
      }
    },
    update: {},
    create: {
      name: "Grand Bordeaux Blend",
      slug: "grand-bordeaux-blend-chateau-lumiere-2019",
      vintage: 2019,
      wineryId: wineryOne.id,
      regionId: bordeaux.id,
      country: "France",
      grapeVarieties: ["Merlot", "Cabernet Franc", "Cabernet Sauvignon"],
      alcoholPercent: 13.8,
      description: "Silky tannins with plum and graphite notes.",
      imageUrl: "https://images.example.com/grand-bordeaux-blend.jpg"
    }
  });

  await prisma.inventory.createMany({
    data: [
      {
        wineId: wineOne.id,
        locationId: "main-bar",
        priceGlass: 18.0,
        priceBottle: 72.0,
        stockQuantity: 26,
        isAvailable: true,
        isFeatured: true
      },
      {
        wineId: wineTwo.id,
        locationId: "cellar-a",
        priceGlass: 16.0,
        priceBottle: 64.0,
        stockQuantity: 18,
        isAvailable: true,
        isFeatured: false
      }
    ],
    skipDuplicates: true
  });

  const passwordHash = await bcrypt.hash("password123", 10);

  await prisma.user.upsert({
    where: { email: "admin@pourhousewineco.com" },
    update: {},
    create: {
      email: "admin@pourhousewineco.com",
      password: passwordHash,
      name: "Pourhouse Admin"
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("Seed completed.");
  })
  .catch(async (error) => {
    await prisma.$disconnect();
    console.error(error);
    process.exit(1);
  });
