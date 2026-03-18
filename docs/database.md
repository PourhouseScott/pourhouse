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
| `Winery` | Wine producer; belongs to a `Region` |
| `Region` | Hierarchical geographic region (self-referencing) |
| `Inventory` | Per-wine stock, pricing, and availability |
| `User` | Application user account |
| `Rating` | User rating (1–5) with optional notes for a wine |

### Scripts

| Script | Description |
|---|---|
| `npm run prisma:generate` | Regenerate the Prisma client after schema changes |
| `npm run prisma:migrate` | Apply pending migrations in development |
| `npm run prisma:seed` | Run the seed script |

### Migrations

Migrations are managed by Prisma Migrate. Each migration is a SQL file stored under `prisma/migrations/` and checked into version control.

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
- Default user (`admin@pourhousewineco.com`, password `password123`)

> Change the seeded credentials before deploying to any shared or production environment.

Run the seed:

```bash
npm run prisma:seed
```

## Prisma Client Usage

A single shared `PrismaClient` instance is exported from `src/config/prisma.ts`. Only repository implementations import this instance — services and controllers never access Prisma directly.
