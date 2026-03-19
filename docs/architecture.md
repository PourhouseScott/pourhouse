# Architecture

## Overview

Pourhouse is a REST API built with Node.js, Express, and TypeScript. It follows a layered architecture that keeps concerns separated and each layer independently testable.

## Layers

```
HTTP Request
    │
    ▼
Routes          (src/routes/)        — Express router definitions, middleware attachment
    │
    ▼
Controllers     (src/controllers/)   — Parse request, call service, return response
    │
    ▼
Services        (src/services/)      — Business logic, orchestration, validation rules
    │
    ▼
Repositories    (src/repositories/)  — Data access; one repository per domain entity
    │
    ▼
Prisma          (src/config/prisma.ts) — Shared PrismaClient; the only point of DB access
```

### Rules

- **Controllers** must not contain business logic; they delegate to services and translate results to HTTP responses.
- **Services** must not import `PrismaClient` directly; they receive repository interfaces via constructor injection.
- **Repositories** are the only layer that calls Prisma; each implements an interface (e.g. `IWineRepository`) so services depend on the abstraction.
- **No layer skips a level.** Routes do not call services; controllers do not call repositories.

## Dependency Injection

All dependencies flow inward via constructor injection. The composition root lives in `src/container.ts`, which wires concrete repository and service implementations together and provides controller instances to the routes.

This means:
- Unit tests inject mock repository implementations — no `vi.mock()` or module patching needed.
- Swapping a data store (e.g. from Prisma repository to an in-memory test double) requires no changes to the service layer.

## Folder Structure

```
src/
  app.ts                   Express app factory (middleware, routes, error handler)
  server.ts                HTTP listener entry point
  container.ts             Composition root — wires repositories, services, controllers
  config/
    env.ts                 Env var loading and Zod validation (fail-fast on startup)
    prisma.ts              Shared PrismaClient instance
  controllers/             One file per resource domain
  routes/                  One file per resource domain; index.ts mounts all routers under /api
  services/                One file per resource domain
  repositories/            One folder per domain entity
    <entity>/
      I<Entity>Repository.ts   Interface
      <Entity>Repository.ts    Prisma implementation
  middleware/
    authMiddleware.ts      JWT verification; attaches user to request
    errorHandler.ts        Centralised Express error handler
    validateRequest.ts     Zod schema validation middleware factory
  models/
    validation.ts          Shared Zod schemas for request bodies
  utils/
    appError.ts            Typed application error class with HTTP status
    asyncHandler.ts        Wraps async route handlers to forward errors
    jwt.ts                 JWT sign/verify helpers
  types/
    express.d.ts           Declaration merge — adds `user` to Express Request
prisma/
  schema.prisma            Data model definitions
  seed.ts                  Database seed script
```

## Request Lifecycle

1. Request hits an Express router in `src/routes/`.
2. Optional middleware runs (auth, validation).
3. The controller method is called via `asyncHandler` — unhandled promise rejections are automatically forwarded to the error handler.
4. The controller calls the service.
5. The service calls repository method(s) as needed.
6. The repository executes the Prisma query and returns a typed result.
7. The controller shapes the response and calls `res.json()`.
8. On any thrown `AppError`, the central `errorHandler` middleware returns the appropriate HTTP status and message.

## Testing Strategy

- **Unit tests** are co-located with source files as `*.test.ts`.
- Services are tested by injecting mock repository implementations.
- Controllers are tested as unit tests with mocked service implementations.
- No `vi.mock()` calls — all test isolation is achieved through constructor injection.
- Coverage target is 100% lines, branches, statements, and functions.
