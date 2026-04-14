# Google Cloud Build (Docker)

This runbook configures Cloud Build to build and push the API container image on changes to `main`.

This setup intentionally does not auto-deploy. Deployment to Cloud Run is a separate manual (or separately-triggered) step.

## Region

- Preferred region: `us-west1` (Oregon)

## Files Used

- `Dockerfile` - multi-stage production image build
- `.dockerignore` - excludes local/development artifacts from build context
- `cloudbuild.yaml` - build + push pipeline for Artifact Registry

## Prerequisites (GCP)

1. Enable required APIs:
- Cloud Build API
- Artifact Registry API
- Cloud Run API (if you plan to deploy)

2. Create Artifact Registry Docker repository in `us-west1`:

```bash
gcloud artifacts repositories create pourhouse \
  --repository-format=docker \
  --location=us-west1 \
  --description="Pourhouse API images"
```

3. Ensure Cloud Build service account can push images:
- `roles/artifactregistry.writer` on the project or repository

## Cloud Build Trigger (main branch)

Configure your existing trigger to use `cloudbuild.yaml` from repo root.

Expected image outputs:

- `us-west1-docker.pkg.dev/$PROJECT_ID/pourhouse/pourhouse-api:$SHORT_SHA`
- `us-west1-docker.pkg.dev/$PROJECT_ID/pourhouse/pourhouse-api:latest`

## Manual Deploy to Cloud Run (recommended)

After a successful build on `main`, deploy a specific image tag manually:

```bash
gcloud run deploy pourhouse-api \
  --image us-west1-docker.pkg.dev/$PROJECT_ID/pourhouse/pourhouse-api:$SHORT_SHA \
  --region us-west1 \
  --platform managed \
  --allow-unauthenticated \
  --port 8080
```

## Runtime Configuration

Set runtime env vars/secrets on Cloud Run (do not bake secrets into image):

- `NODE_ENV=production`
- `PORT=8080` (Cloud Run also injects `PORT`; app supports env-based port)
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

Use Secret Manager for sensitive values.

## Verification Checklist

1. Trigger fires on `main` push.
2. Cloud Build completes build and push steps.
3. Artifact Registry contains `latest` and `$SHORT_SHA` image tags.
4. Cloud Run deploy command succeeds with selected tag.
5. Service responds on port `8080` and health routes return success.
