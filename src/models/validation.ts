import { z } from "zod";

const booleanQuerySchema = z
  .union([z.boolean(), z.enum(["true", "false"])])
  .transform((value) => value === true || value === "true");

const wineListSortSchema = z.enum(["createdAt", "name", "priceGlass", "priceBottle"]);
const sortOrderSchema = z.enum(["asc", "desc"]);

const wineListFilterSchema = z.object({
  country: z.string().trim().min(1).optional(),
  regionId: z.string().uuid().optional(),
  wineryId: z.string().uuid().optional(),
  featuredOnly: booleanQuerySchema.optional(),
  hasGlass: booleanQuerySchema.optional(),
  hasBottle: booleanQuerySchema.optional()
});

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2)
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export const createWineSchema = z.object({
  name: z.string().min(1),
  vintage: z.number().int().min(1900).max(2100),
  wineryId: z.string().uuid(),
  regionId: z.string().uuid(),
  country: z.string().min(1),
  grapeVarieties: z.array(z.string().min(1)).min(1),
  alcoholPercent: z.number().min(0).max(100),
  description: z.string().min(1),
  imageUrl: z.string().url(),
  squareItemId: z.string().min(1).optional()
});

export const searchWineSchema = z.object({
  q: z.string().min(1)
});

export const listWinesSchema = wineListFilterSchema.extend({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sort: wineListSortSchema.default("createdAt"),
  order: sortOrderSchema.default("desc")
});

export const groupedWinesSchema = wineListFilterSchema;

export const listFlightsQuerySchema = z.object({
  activeOnly: booleanQuerySchema.optional()
});

export const createFlightSchema = z.object({
  name: z.string().trim().min(1),
  description: z.string().trim().min(1).optional(),
  isActive: z.boolean().optional()
});

export const updateFlightSchema = z.object({
  name: z.string().trim().min(1).optional(),
  description: z.string().trim().min(1).optional(),
  isActive: z.boolean().optional()
});

export const addWineToFlightSchema = z.object({
  wineId: z.string().uuid(),
  position: z.number().int().min(0).optional()
});

export const createInventorySchema = z.object({
  wineId: z.string().uuid(),
  locationId: z.string().min(1),
  sealedBottleCount: z.number().int().min(0),
  isAvailable: z.boolean().optional(),
  isFeatured: z.boolean().optional()
});

export const updateInventorySchema = z.object({
  locationId: z.string().min(1).optional(),
  sealedBottleCount: z.number().int().min(0).optional(),
  isAvailable: z.boolean().optional(),
  isFeatured: z.boolean().optional()
});

export const createRatingSchema = z.object({
  wineId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  notes: z.string().min(1)
});
