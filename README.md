# Pourhouse Wine Co. Backend

Production-ready backend API for Pourhouse Wine Co., built with Node.js, Express, TypeScript, PostgreSQL, Prisma, JWT auth, and Zod validation.

## Tech Stack

- Node.js
- Express
- TypeScript
- PostgreSQL
- Prisma ORM
- JWT authentication
- dotenv
- Zod validation

## Project Structure

```text
src/
  app.ts
  server.ts
  config/
  controllers/
  middleware/
  models/
  routes/
  services/
  utils/
prisma/
  schema.prisma
  seed.ts
```

## Prerequisites

- Node.js 20+
- PostgreSQL running locally or remotely

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create environment file:

```bash
cp .env.example .env
```

3. Update `.env` values for your environment.

4. Run database migrations:

```bash
npx prisma migrate dev
```

5. Seed sample data:

```bash
npm run prisma:seed
```

6. Start dev server:

```bash
npm run dev
```

API runs at `http://localhost:4000` by default.

## Scripts

- `npm run dev` - run API in development with auto-reload
- `npm run dev:full` - start Postgres and run the API in development
- `npm run build` - compile TypeScript to `dist`
- `npm run lint` - run ESLint across the project
- `npm run format` - format the project with Prettier
- `npm run test` - run the Vitest suite once
- `npm run test:watch` - run Vitest in watch mode
- `npm run test:coverage` - run Vitest with 100% coverage thresholds enabled
- `npm run start` - run compiled server
- `npm run square:fetch` - fetch catalog data from Square
- `npm run square:sync:wines` - sync Square catalog wines into the database
- `npm run prisma:generate` - generate Prisma client
- `npm run prisma:migrate` - run migrations in development
- `npm run prisma:seed` - seed sample data
- `npm run db:up` - start the local Postgres container
- `npm run db:down` - stop the local Postgres container
- `npm run db:status` - inspect the local Postgres container
- `npm run db:logs` - tail Postgres container logs
- `npm run db:reset` - destroy the local Postgres data volume
- `npm run db:setup` - start Postgres, run migrations, and seed data

## Environment Variables

Use `.env.example` as a template:

- `NODE_ENV`
- `PORT`
- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `SQUARE_ACCESS_TOKEN`
- `SQUARE_ENVIRONMENT`

## API Endpoints

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`

### Wines

- `GET /api/wines` - returns wines with at least one available inventory row, including winery, region, and summarized `pricing.glass` / `pricing.bottle` values
- `GET /api/wines/:id`
- `POST /api/wines`
- `GET /api/wines/search?q=term`
- `GET /api/wines/:id/ratings`

Example `GET /api/wines` response item:

```json
{
  "id": "wine-id",
  "slug": "cabernet-2020",
  "name": "Cabernet",
  "vintage": 2020,
  "country": "US",
  "description": "Bold",
  "imageUrl": "https://example.com/wine.png",
  "winery": {
    "id": "winery-1",
    "name": "Alpha Winery"
  },
  "region": {
    "id": "region-1",
    "name": "Napa Valley"
  },
  "pricing": {
    "glass": 16,
    "bottle": 68
  }
}
```

### Inventory

- `GET /api/inventory`
- `GET /api/inventory/:id`
- `POST /api/inventory`
- `PATCH /api/inventory/:id`

### Ratings

- `POST /api/ratings` (requires JWT)

## Business Rules Implemented

- Duplicate wines prevented by composite unique constraint on `(name, wineryId, vintage)`.
- Ratings constrained to 1-5 by validation and service guard.
- Only authenticated users can create ratings.
- Inventory references wines by foreign key (`wineId`) and does not duplicate wine records.
- Public wine list responses include only wines with available inventory.
- Public wine list pricing is summarized from available inventory rows using the lowest available glass and bottle prices.

## Seed Data

Seed includes:

- Regions (France, Bordeaux, Napa Valley)
- Wineries
- Wines
- Inventory records
- Default user (`admin@pourhousewineco.com`, password `password123`)

Change seeded credentials before production use.
