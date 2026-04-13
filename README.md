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

## Development Setup

For prerequisites, local environment setup, database migration flow, and sample-data seeding, see [Development Setup](docs/development-setup.md).

## Documentation Index

- [Documentation Home](docs/index.md)
- [Development Setup](docs/development-setup.md)
- [Architecture](docs/architecture.md)
- [Environment Configuration](docs/environment.md)
- [Database](docs/database.md)
- [API Reference](docs/api-reference.md)
- [Domain Rules](docs/domain-rules.md)
- [Squarespace Integration Runbook](docs/squarespace-integration.md)
- [Square Data Structure and Integration Model](docs/square-integration-model.md)

## Scheduled Square Sync

The API supports a background scheduler that fetches Square catalog data and syncs it into local wines/inventory.

- Set `SQUARE_SYNC_ENABLED=true` to turn on the scheduler.
- Set `SQUARE_SYNC_CRON` to control the interval (default: `*/10 * * * *`, every 10 minutes).
- Each run logs start, completion summary (created/updated/skipped/inventoryRowsSynced), and failures.

For detailed integration usage, see [Squarespace Integration Runbook](docs/squarespace-integration.md).

## API and Rules

- For endpoints, request/response examples, and query parameters, see [API Reference](docs/api-reference.md).
- For business constraints and behavior guarantees, see [Domain Rules](docs/domain-rules.md).
