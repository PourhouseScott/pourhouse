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

For first deployment (and all non-development environments), use deploy-mode migrations:

```bash
npx prisma migrate deploy
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
- `npm run square:seed:sandbox` - seed sample catalog items into Square sandbox (safe-guarded to sandbox env)
- `npm run square:sync:wines` - sync Square catalog wines into the database
- `npm run seed:sample:data` - seed local DB, seed Square sandbox catalog, then sync Square data into local wines
- `npm run admin:grant -- <email>` - grant admin role to an existing user
- `npm run admin:revoke -- <email>` - revoke admin role from a user
- `npm run prisma:generate` - generate Prisma client
- `npm run prisma:migrate` - run migrations in development
- `npx prisma migrate deploy` - apply committed migrations in CI/staging/production
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
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI`
- `SQUARE_ACCESS_TOKEN`
- `SQUARE_ENVIRONMENT`

For sample-data seeding workflows, set `SQUARE_ENVIRONMENT=sandbox` and use a Square sandbox access token.

## Sample Data Seeding

Use the combined command when you want realistic demo data in both Square sandbox and your local database:

```bash
npm run seed:sample:data
```

This runs three steps in order:

1. `npm run prisma:seed`
2. `npm run square:seed:sandbox`
3. `npm run square:sync:wines`

When `sample_data/*.xlsx` exists, `npm run square:seed:sandbox` reads the newest workbook and seeds catalog items from the `Items` sheet. If no workbook is found, it falls back to bundled sample fixtures.

You can also run individual steps as needed.

## API Endpoints

### Auth

- `GET /api/auth/google/start` - redirects browser to Google OAuth consent
- `GET /api/auth/google/callback` - exchanges Google code and redirects back with app JWT
- `POST /api/auth/google`

### Wines

- `GET /api/wines` - returns a paginated wine list with optional filters and public availability flags
- `GET /api/wines/grouped` - returns wines grouped by inferred type, then by region
- `GET /api/wines/:slug`
- `GET /api/wines/qr/:code` - resolves a QR code token (slug or Square item id) and redirects to `/wines/:slug`
- `POST /api/wines` - creates a wine and generates its slug from `name` + `vintage`
- `GET /api/wines/search?q=term`
- `GET /api/wines/:id/ratings`

### Admin Wines

Admin routes require `Authorization: Bearer <app-jwt>`, and the authenticated user must have `role=ADMIN` in the database.
The admin UI at `/admin/wines` now uses Google sign-in and stores the app JWT in browser local storage.

- `GET /api/admin/wines`
- `POST /api/admin/wines`
- `PUT /api/admin/wines/:id`
- `DELETE /api/admin/wines/:id`

Supported `GET /api/wines` query params:

- `page` - 1-based page number, defaults to `1`
- `pageSize` - page size between `1` and `100`, defaults to `20`
- `sort` - `createdAt`, `name`, `priceGlass`, or `priceBottle`
- `order` - `asc` or `desc`
- `country` - exact country filter, case-insensitive
- `regionId` - filter by region id
- `wineryId` - filter by winery id
- `featuredOnly` - `true` or `false`
- `hasGlass` - `true` or `false`
- `hasBottle` - `true` or `false`

Example `GET /api/wines` response:

```json
{
  "items": [
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
      "availableByBottle": true,
      "availableByGlass": true,
      "availableForFlight": false
    }
  ],
  "page": 1,
  "pageSize": 20,
  "total": 1,
  "totalPages": 1
}
```

Example filtered request:

```text
GET /api/wines?page=1&pageSize=10&sort=priceGlass&order=asc&country=US&featuredOnly=true
```

Example `GET /api/wines/grouped` response:

```json
{
  "groups": [
    {
      "type": "red",
      "regions": [
        {
          "id": "region-1",
          "name": "Napa Valley",
          "wines": [
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
              "availableByBottle": true,
              "availableByGlass": true,
              "availableForFlight": false
            }
          ]
        }
      ]
    }
  ],
  "totalWines": 1
}
```

## Embeddable Wine List

The embeddable wine list is available at `GET /embed/wine-list` and loads grouped wines from `GET /api/wines/grouped`.

### Iframe Embed

```html
<iframe
  src="https://your-domain.example/embed/wine-list"
  style="width:100%;height:780px;border:0;display:block"
  loading="lazy"
></iframe>
```

Optional compact mode:

```html
<iframe
  src="https://your-domain.example/embed/wine-list?compact=true"
  style="width:100%;height:700px;border:0;display:block"
  loading="lazy"
></iframe>
```

### Script Embed

Load the helper script and mount the iframe programmatically:

```html
<div id="pourhouse-wine-list"></div>
<script src="https://your-domain.example/static/wine-list-embed-loader.js"></script>
<script>
  window.createPourhouseWineListEmbed(document.getElementById("pourhouse-wine-list"), {
    baseUrl: "https://your-domain.example",
    compact: false,
    height: "780px"
  });
</script>
```

Example `POST /api/wines` request body:

```json
{
  "name": "Opus One",
  "vintage": 2019,
  "wineryId": "winery-id",
  "regionId": "region-id",
  "country": "US",
  "grapeVarieties": ["Cabernet Sauvignon", "Merlot"],
  "alcoholPercent": 14.5,
  "description": "Structured and age-worthy.",
  "imageUrl": "https://example.com/opus-one.png"
}
```

Generated slugs are based on `name` + `vintage` and receive a numeric suffix when needed to stay unique, for example `opus-one-2019` or `opus-one-2019-2`.

### Inventory

- `GET /api/inventory`
- `GET /api/inventory/:id`
- `POST /api/inventory`
- `PATCH /api/inventory/:id`

### Ratings

- `POST /api/ratings` (requires JWT)

### Frontend Page

- `GET /wines/:slug` - mobile-friendly wine detail page that loads data from `GET /api/wines/:slug` and displays name, description, and pricing

## Business Rules Implemented

- Duplicate wines prevented by composite unique constraint on `(name, wineryId, vintage)`.
- Ratings constrained to 1-5 by validation and service guard.
- Only authenticated users can create ratings.
- Inventory references wines by foreign key (`wineId`) and does not duplicate wine records.
- Public wine list responses include only wines with available inventory.
- Public wine list pricing is summarized from available inventory rows using the lowest available glass and bottle prices.
- Public wine list filtering is applied in the repository layer; price sorting and pagination are applied in the service layer.

## Seed Data

Seed includes:

- Regions (France, Bordeaux, Napa Valley)
- Wineries
- Wines
- Inventory records
- Default user email (`admin@pourhousewineco.com`) for Google identity linking and role assignment

Grant or revoke admin access with `npm run admin:grant -- <email>` and `npm run admin:revoke -- <email>`.
