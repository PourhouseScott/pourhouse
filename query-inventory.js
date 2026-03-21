const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  try {
    // 1. Total inventory rows
    const totalCount = await prisma.inventory.count();
    console.log("\n=== 1. TOTAL INVENTORY ROWS ===");
    console.log(`Total: ${totalCount}\n`);

    // 2. Get all inventory records with wineId and locationId
    const allInventory = await prisma.inventory.findMany({
      select: {
        wineId: true,
        locationId: true
      }
    });

    // Count distinct combinations manually
    const combos = {};
    allInventory.forEach(inv => {
      const key = `${inv.wineId}|${inv.locationId}`;
      combos[key] = (combos[key] || 0) + 1;
    });

    console.log("=== 2. DISTINCT wineId + locationId COMBINATIONS ===");
    const comboList = Object.entries(combos).map(([key, count]) => {
      const [wineId, locationId] = key.split('|');
      return { wineId, locationId, count };
    });
    console.log(`Found ${comboList.length} distinct combinations:\n`);
    console.log(comboList.sort((a, b) => b.count - a.count));

    // 3. Check for duplicates
    console.log("\n=== 3. CHECKING FOR DUPLICATE (wineId, locationId) PAIRS ===");
    const duplicates = comboList.filter(c => c.count > 1);
    if (duplicates.length === 0) {
      console.log("✓ No duplicates found - each (wineId, locationId) pair is unique");
    } else {
      console.log(`✗ Found ${duplicates.length} duplicate combinations:`);
      console.log(duplicates);
    }

    // 4. Show all raw data
    console.log("\n=== 4. ALL INVENTORY RECORDS (for reference) ===");
    const fullRecords = await prisma.inventory.findMany({
      orderBy: { wineId: 'asc' }
    });
    console.log(fullRecords);

  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
