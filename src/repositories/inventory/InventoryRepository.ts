import type { PrismaClient, Prisma } from "@prisma/client";
import type { IInventoryRepository } from "@/repositories/inventory/IInventoryRepository";

export class InventoryRepository implements IInventoryRepository {
  public constructor(private readonly prisma: PrismaClient) { }

  public async findMany() {
    return this.prisma.inventory.findMany({
      include: {
        wine: {
          include: {
            winery: true,
            region: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });
  }

  public async findById(id: string) {
    return this.prisma.inventory.findUnique({
      where: { id },
      include: {
        wine: {
          include: {
            winery: true,
            region: true
          }
        }
      }
    });
  }

  public async create(input: Prisma.InventoryCreateInput) {
    return this.prisma.inventory.create({
      data: input,
      include: {
        wine: true
      }
    });
  }

  public async update(id: string, input: Prisma.InventoryUpdateInput) {
    return this.prisma.inventory.update({
      where: { id },
      data: input,
      include: {
        wine: true
      }
    });
  }
}
