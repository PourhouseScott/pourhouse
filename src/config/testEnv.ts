// Provide safe defaults for tests that import env-dependent modules at load time.
process.env.NODE_ENV ??= "test";
process.env.PORT ??= "4000";
process.env.DATABASE_URL ??= "postgresql://test:test@localhost:5432/pourhouse_test?schema=public";
process.env.JWT_SECRET ??= "test-secret-123456";
process.env.JWT_EXPIRES_IN ??= "7d";
process.env.ADMIN_API_TOKEN ??= "test-admin-token-1234567890";
process.env.SQUARE_ACCESS_TOKEN ??= "square-test-token";
process.env.SQUARE_ENVIRONMENT ??= "sandbox";
