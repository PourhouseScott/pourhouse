# Development Setup

This guide covers local development setup for the Pourhouse backend.

## Prerequisites

- Node.js 20+
- PostgreSQL running locally or remotely

For local containerized PostgreSQL, use `npm run db:up` (see [database.md](database.md)).

## Setup Steps

1. Install dependencies:

```bash
npm install
```

2. Create environment file:

```bash
cp .env.example .env
```

3. Update `.env` values for your environment.

4. Run development migrations:

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

6. Start the development server:

```bash
npm run dev
```

API runs at `http://localhost:8080` by default.

## Sample Data Workflow

For realistic local demo data synced with Square sandbox:

```bash
npm run seed:sample:data
```

This runs in order:

1. `npm run prisma:seed`
2. `npm run square:seed:sandbox`
3. `npm run square:sync:wines`

When `sample_data/*.xlsx` exists, `npm run square:seed:sandbox` reads the newest workbook and seeds catalog items from the `Items` sheet. If no workbook is found, it falls back to bundled sample fixtures.

## Useful Commands

- `npm run dev:full` - start Postgres and run API in development
- `npm run build` - compile TypeScript to `dist`
- `npm run test` - run tests once
- `npm run test:coverage` - run tests with coverage thresholds
- `npm run db:status` - inspect local Postgres container status

## Scripts Reference

- `npm run dev` - run API in development with auto-reload
- `npm run dev:full` - start Postgres and run API in development
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

For variable validation rules and defaults, see [Environment Configuration](environment.md).
