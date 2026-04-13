// Provide safe defaults for tests that import env-dependent modules at load time.
process.env.NODE_ENV ??= "test";
process.env.PORT ??= "8080";
process.env.DATABASE_URL ??= "postgresql://test:test@localhost:5432/pourhouse_test?schema=public";
process.env.JWT_SECRET ??= "test-secret-123456";
process.env.JWT_EXPIRES_IN ??= "7d";
process.env.GOOGLE_CLIENT_ID ??= "google-client-id-test";
process.env.GOOGLE_CLIENT_SECRET ??= "google-client-secret-test";
process.env.GOOGLE_REDIRECT_URI ??= "http://localhost:8080/auth/google/callback";
process.env.SQUARE_ACCESS_TOKEN ??= "square-test-token";
process.env.SQUARE_ENVIRONMENT ??= "sandbox";
process.env.SQUARE_SYNC_ENABLED ??= "false";
process.env.SQUARE_SYNC_CRON ??= "*/10 * * * *";
