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

## Documentation Index

- [Documentation Home](docs/index.md)
- [Architecture](docs/architecture.md)
- [Environment Configuration](docs/environment.md)
- [Database](docs/database.md)
- [API Reference](docs/api-reference.md)
- [Domain Rules](docs/domain-rules.md)
- [Squarespace Integration Runbook](docs/squarespace-integration.md)
- [Square Data Structure and Integration Model](docs/square-integration-model.md)

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
- `SQUARE_SYNC_ENABLED`
- `SQUARE_SYNC_CRON`

For sample-data seeding workflows, set `SQUARE_ENVIRONMENT=sandbox` and use a Square sandbox access token.

## Scheduled Square Sync

The API supports a background scheduler that fetches Square catalog data and syncs it into local wines/inventory.

- Set `SQUARE_SYNC_ENABLED=true` to turn on the scheduler.
- Set `SQUARE_SYNC_CRON` to control the interval (default: `*/10 * * * *`, every 10 minutes).
- Each run logs start, completion summary (created/updated/skipped/inventoryRowsSynced), and failures.

For detailed integration usage, see [Squarespace Integration Runbook](docs/squarespace-integration.md).

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

## API and Rules

- For endpoints, request/response examples, and query parameters, see [API Reference](docs/api-reference.md).
- For business constraints and behavior guarantees, see [Domain Rules](docs/domain-rules.md).
