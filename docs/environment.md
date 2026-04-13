# Environment Configuration

## How It Works

Environment variables are loaded at startup by `src/config/env.ts` using `dotenv`. Every variable is validated immediately against a Zod schema. If any required variable is missing or fails validation the process exits with a descriptive error before the HTTP server starts.

This fail-fast approach prevents the application from starting in a misconfigured state.

## Setup

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

`.env` is git-ignored. `.env.example` is committed as a reference template and must be kept up to date when new variables are added.

## Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `NODE_ENV` | No | `development` | Runtime environment. Accepted values: `development`, `test`, `production`. |
| `PORT` | No | `8080` | Port the HTTP server listens on. |
| `DATABASE_URL` | Yes | — | PostgreSQL connection string. Example: `postgresql://postgres:postgres@localhost:5432/pourhouse?schema=public` |
| `JWT_SECRET` | Yes | — | Secret used to sign and verify JWTs. Must be at least 16 characters. |
| `JWT_EXPIRES_IN` | No | `7d` | JWT expiry duration in [vercel/ms](https://github.com/vercel/ms) format (e.g. `7d`, `1h`, `30m`). |
| `GOOGLE_CLIENT_ID` | Yes | — | OAuth client ID for Google sign-in. Used to validate Google ID token audience. |
| `GOOGLE_CLIENT_SECRET` | Yes | — | OAuth client secret used during authorization code exchange with Google. |
| `GOOGLE_REDIRECT_URI` | Yes | — | Callback URL registered in Google Cloud Console for the auth code flow. |
| `SQUARE_ACCESS_TOKEN` | Yes | — | Access token used for Square catalog API requests and sync operations. |
| `SQUARE_ENVIRONMENT` | No | `production` | Square environment selector. Accepted values: `sandbox`, `production`. |
| `SQUARE_SYNC_ENABLED` | No | `false` | Enables the background Square-to-database sync scheduler when set to `true`. |
| `SQUARE_SYNC_CRON` | No | `*/10 * * * *` | Cron expression used by the Square sync scheduler (default is every 10 minutes). |

## Adding a New Variable

1. Add the variable to `.env.example` with a placeholder value and a short comment.
2. Add a corresponding field to the Zod schema in `src/config/env.ts`.
3. Reference it via the exported `env` object — never read `process.env` directly outside of `src/config/env.ts`.
