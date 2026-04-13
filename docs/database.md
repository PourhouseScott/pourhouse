# Database

## Technology

- **PostgreSQL 16** as the relational database.
- **Prisma ORM** for schema management, migrations, and type-safe query building.
- **Docker Compose** for the local development database.

## Local Setup

PostgreSQL runs in a Docker container. Start it with:

```bash
npm run db:up
```

The container is configured in `docker-compose.yml`:

| Setting | Value |
|---|---|
| Image | `postgres:16` |
| Container name | `pourhouse-postgres` |
| Port | `5432` (host) → `5432` (container) |
| Database | `pourhouse` |
| User | `postgres` |
| Password | `postgres` |

Data is persisted in a named Docker volume (`pourhouse-postgres-data`) so it survives container restarts.

## Database Scripts

| Script | Description |
|---|---|
| `npm run db:up` | Start the PostgreSQL container in the background |
| `npm run db:down` | Stop the container (data preserved) |
| `npm run db:status` | Show container health and port bindings |
| `npm run db:logs` | Tail container logs |
| `npm run db:reset` | Stop the container and destroy the data volume |
| `npm run db:setup` | `db:up` + `prisma:migrate` + `prisma:seed` in one command |

## Prisma

### Schema

The Prisma schema lives at `prisma/schema.prisma`. It defines the datasource, generator, and all models.

Models:

| Model | Description |
|---|---|
| `Wine` | Core wine record; unique on `(name, wineryId, vintage)`. Has a unique `slug` for URL-safe identification and an optional unique `squareItemId` for Square POS integration. |
| `WineVariation` | Price/size variation records for a wine, including optional `squareVariationId` mapping. |
| `WineVariationServingMode` | Serving-mode metadata (for example `GLASS_5OZ`, `BOTTLE_750ML`) associated with a variation. |
| `Winery` | Wine producer; belongs to a `Region` |
| `Region` | Hierarchical geographic region (self-referencing) |
| `Flight` | Curated tasting flight definition. |
| `FlightWine` | Join model between flights and wines with pour position ordering. |
| `Inventory` | Per-wine stock, pricing, and availability |
| `User` | Application user account |
| `Rating` | User rating (1–5) with optional notes for a wine |
| `SquareCatalogItem` | Staging record of synced Square item payloads and sync metadata. |
| `SquareCatalogVariation` | Staging record of synced Square variation payloads and sync metadata. |
| `SquareServingModeOverride` | Manual override mapping from Square variation id to serving mode. |

### Scripts

| Script | Description |
|---|---|
| `npm run prisma:generate` | Regenerate the Prisma client after schema changes |
| `npm run prisma:migrate` | Apply pending migrations in development |
| `npm run prisma:seed` | Run the seed script |

### Migrations

Migrations are managed by Prisma Migrate. Each migration is a SQL file stored under `prisma/migrations/` and checked into version control.

### Pre-Production Rebaseline (Issue 43)

Before first production deployment, migration history was rebaselined to a single canonical migration.

Completed artifacts:

- Backup created at `prisma/backups/dev-schema-backup-issue43.sql`
- Single baseline migration at `prisma/migrations/20260413150000_baseline/migration.sql`

Why this was done:

- No production database had been deployed yet
- Schema had evolved quickly during early feature development
- A single baseline avoids long-term migration drift and simplifies first deploy

Team workflow after rebaseline:

1. Keep baseline migration untouched.
2. Add all future schema changes as normal incremental migrations.
3. Validate with `npx prisma validate` and regenerate client with `npx prisma generate`.
4. In CI/CD and production, apply migrations with `npx prisma migrate deploy`.

First production deploy notes:

1. Ensure target production database is empty and not previously migrated.
2. Apply baseline migration with `npx prisma migrate deploy`.
3. Run `npx prisma migrate status` and confirm database and migration history are in sync.
4. Run application smoke checks after deploy.

To create and apply a new migration after editing `schema.prisma`:

```bash
npm run prisma:migrate
```

### Seeding

The seed script at `prisma/seed.ts` populates the database with initial reference data:

- Regions (France, Bordeaux, Napa Valley, etc.)
- Wineries
- Wines
- Inventory records
- Default user email (`admin@pourhousewineco.com`) for Google identity linking and role assignment

> Use the admin role scripts to grant/revoke admin access as needed.

Run the seed:

```bash
npm run prisma:seed
```

## Prisma Client Usage

A single shared `PrismaClient` instance is exported from `src/config/prisma.ts`. Only repository implementations import this instance — services and controllers never access Prisma directly.
