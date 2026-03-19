import "dotenv/config";
import { randomUUID } from "node:crypto";
import { SquareClient, SquareEnvironment } from "square";
import { createSquareCatalogClient } from "../src/integrations/square/squareCatalogClient";
import { SquareCatalogService } from "../src/integrations/square/squareCatalogService";
import { env } from "../src/config/env";

type SampleVariation = {
  name: string;
  priceCents: number;
};

type SampleCatalogItem = {
  name: string;
  description: string;
  variations: SampleVariation[];
};

const SAMPLE_CATALOG_ITEMS: SampleCatalogItem[] = [
  {
    name: "Sample Napa Cabernet 2021",
    description: "Black cherry, cassis, and cocoa with polished tannins.",
    variations: [
      { name: "Glass", priceCents: 1900 },
      { name: "Bottle", priceCents: 7600 }
    ]
  },
  {
    name: "Sample Sonoma Pinot Noir 2022",
    description: "Bright red fruit and spice with silky texture.",
    variations: [
      { name: "Glass", priceCents: 1700 },
      { name: "Bottle", priceCents: 6800 }
    ]
  },
  {
    name: "Sample Willamette Chardonnay 2023",
    description: "Citrus blossom, pear, and balanced oak.",
    variations: [
      { name: "Glass", priceCents: 1500 },
      { name: "Bottle", priceCents: 6000 }
    ]
  },
  {
    name: "Sample Provence Rose 2024",
    description: "Strawberry and watermelon with crisp acidity.",
    variations: [
      { name: "Glass", priceCents: 1400 },
      { name: "Bottle", priceCents: 5600 }
    ]
  },
  {
    name: "Sample Mosel Riesling 2022",
    description: "Stone fruit, floral notes, and lively minerality.",
    variations: [
      { name: "Glass", priceCents: 1300 },
      { name: "Bottle", priceCents: 5200 }
    ]
  },
  {
    name: "Sample Rioja Reserva 2020",
    description: "Dried cherry, cedar, and vanilla spice.",
    variations: [
      { name: "Glass", priceCents: 1600 },
      { name: "Bottle", priceCents: 6400 }
    ]
  },
  {
    name: "Sample Chianti Classico 2021",
    description: "Sour cherry and herbs with grippy structure.",
    variations: [
      { name: "Glass", priceCents: 1450 },
      { name: "Bottle", priceCents: 5800 }
    ]
  },
  {
    name: "Sample Brut Sparkling NV",
    description: "Green apple and brioche with persistent bubbles.",
    variations: [
      { name: "Glass", priceCents: 1800 },
      { name: "Bottle", priceCents: 7200 }
    ]
  },
  {
    name: "Sample Sauternes 2018",
    description: "Apricot, honey, and saffron with rich sweetness.",
    variations: [
      { name: "Glass", priceCents: 2000 },
      { name: "Bottle", priceCents: 8000 }
    ]
  },
  {
    name: "Sample Ruby Port NV",
    description: "Plum and chocolate with warming finish.",
    variations: [
      { name: "Glass", priceCents: 1250 },
      { name: "Bottle", priceCents: 5000 }
    ]
  }
];

function toCatalogObject(item: SampleCatalogItem, index: number, currency: string): Record<string, unknown> {
  const safeId = `sample-${index + 1}`;

  return {
    type: "ITEM",
    id: `#${safeId}-item`,
    itemData: {
      name: item.name,
      description: item.description,
      productType: "REGULAR",
      variations: item.variations.map((variation, variationIndex) => ({
        type: "ITEM_VARIATION",
        id: `#${safeId}-variation-${variationIndex + 1}`,
        itemVariationData: {
          name: variation.name,
          pricingType: "FIXED_PRICING",
          priceMoney: {
            amount: BigInt(variation.priceCents),
            currency
          }
        }
      }))
    }
  };
}

async function resolveMerchantCurrency(): Promise<string> {
  const client = new SquareClient({
    token: env.SQUARE_ACCESS_TOKEN,
    environment:
      env.SQUARE_ENVIRONMENT === "production"
        ? SquareEnvironment.Production
        : SquareEnvironment.Sandbox
  });

  const locationsResponse = await client.locations.list();
  const activeLocation = locationsResponse.locations?.find((location) => location.status === "ACTIVE");
  const fallbackLocation = locationsResponse.locations?.[0];
  const currency = activeLocation?.currency ?? fallbackLocation?.currency;

  if (!currency) {
    throw new Error("Unable to determine merchant currency from Square locations API.");
  }

  return currency;
}

async function main() {
  if (env.SQUARE_ENVIRONMENT !== "sandbox") {
    throw new Error(
      "Refusing to seed Square catalog because SQUARE_ENVIRONMENT is not set to sandbox."
    );
  }

  const catalogClient = createSquareCatalogClient();
  const catalogService = new SquareCatalogService(catalogClient);
  const merchantCurrency = await resolveMerchantCurrency();

  console.log("Loading existing Square catalog items...");
  const existingObjects = await catalogService.fetchCatalogItems();
  const catalogRecords = existingObjects.filter(
    (item: unknown): item is Record<string, unknown> => typeof item === "object" && item !== null
  );
  const existingItemNames = new Set(
    catalogRecords
      .filter((item: Record<string, unknown>) => item.type === "ITEM")
      .map((item: Record<string, unknown>) => {
        const itemData = item.itemData as Record<string, unknown> | undefined;
        const name = itemData?.name;
        return typeof name === "string" ? name.trim().toLowerCase() : "";
      })
      .filter((name: string) => name.length > 0)
  );

  const missingItems = SAMPLE_CATALOG_ITEMS.filter(
    (item) => !existingItemNames.has(item.name.trim().toLowerCase())
  );

  if (missingItems.length === 0) {
    console.log("No missing sample Square items detected. Catalog seed is already up to date.");
    return;
  }

  console.log(`Creating ${missingItems.length} sample Square catalog items...`);

  const objects = missingItems.map((item, index) => toCatalogObject(item, index, merchantCurrency));

  await catalogClient.batchUpsert({
    idempotencyKey: randomUUID(),
    batches: [{ objects }]
  } as never);

  console.log(
    `Square sandbox seed complete. Added ${missingItems.length} catalog item(s) using ${merchantCurrency}.`
  );
}

main().catch((error) => {
  console.error("Failed to seed Square sandbox catalog:", error);
  process.exit(1);
});
