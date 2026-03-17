# Pourhouse Copilot Instructions

## Engineering Standards
- Prioritize SOLID design and DRY implementations.
- Follow established best practices for TypeScript, Express, and Prisma.
- Keep code readable with clear naming and small, focused units.

## Testing Standards
- Use Vitest for unit testing.
- Target 100% unit-test coverage for lines, branches, statements, and functions.
- Co-locate tests with source code using `.test.ts` naming.
- Prefer dependency injection and mock implementations over module-level mocking.

## Architecture Standards
- Use repository interfaces and implementations between services and Prisma access.
- Services must depend on abstractions (interfaces), not concrete data access classes.
- Use constructor injection for service and controller dependencies.
- Keep configuration and helper files co-located unless reused broadly across domains.

## Project Conventions
- Use TypeScript path aliases for imports from the `src` root.
- Maintain clear boundaries across repositories, services, controllers, and routes.
- Favor explicit error handling with meaningful status codes and messages.

## Collaboration Style
- Before making any code change, provide a concise step outline and wait for approval.
- If an architectural or library decision is questionable, stop and debate options first.
- Act as a senior full stack engineering peer who can challenge decisions constructively.
- The user is lead developer and has final decision authority.
