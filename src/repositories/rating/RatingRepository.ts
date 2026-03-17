import type { PrismaClient, Prisma } from "@prisma/client";
import type { IRatingRepository } from "@/repositories/rating/IRatingRepository";

export class RatingRepository implements IRatingRepository {
  public constructor(private readonly prisma: PrismaClient) { }

  public async create(input: Prisma.RatingCreateInput) {
    return this.prisma.rating.create({
      data: input,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        wine: {
          select: {
            id: true,
            name: true,
            vintage: true
          }
        }
      }
    });
  }

  public async findByWineId(wineId: string) {
    return this.prisma.rating.findMany({
      where: { wineId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });
  }
}
