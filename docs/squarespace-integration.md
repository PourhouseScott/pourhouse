# Squarespace Integration Runbook

Use this guide to embed the Pourhouse wine list inside a Squarespace page with predictable setup, safe security defaults, and clear validation steps.

## Prerequisites

- Backend is deployed on a public HTTPS URL (example: `https://api.yourdomain.com`).
- Squarespace site is deployed on HTTPS.
- Wine data endpoint is available and returning grouped wines.

If either side is HTTP, browsers can block requests or iframe loads due to mixed-content protections.

## Backend Routes Used by the Embed

The integration depends on these backend routes:

- `GET /embed/wine-list`: serves the embeddable frontend shell
- `GET /api/wines/grouped`: returns grouped wine data consumed by the embed script

If either route is unavailable, the embed cannot render correctly.

## Squarespace Embed Option A: Direct Iframe

Use a Squarespace `Code` block and paste:

```html
<iframe
  src="https://api.yourdomain.com/embed/wine-list?apiBase=https://api.yourdomain.com"
  style="width:100%;height:780px;border:0;display:block"
  loading="lazy"
  referrerpolicy="strict-origin-when-cross-origin">
</iframe>
```

When to use this:

- Fastest setup
- One embed on one page
- Minimal customization

## Squarespace Embed Option B: Loader Script

Use a Squarespace `Code` block and paste:

```html
<div id="pourhouse-embed"></div>
<script src="https://api.yourdomain.com/static/wine-list-embed-loader.js"></script>
<script>
  window.createPourhouseWineListEmbed(
    document.getElementById("pourhouse-embed"),
    {
      baseUrl: "https://api.yourdomain.com",
      apiBase: "https://api.yourdomain.com",
      compact: false,
      height: "780px"
    }
  );
</script>
```

When to use this:

- You want adjustable height/compact mode
- You want to keep a reusable embed block template

Supported options:

- `baseUrl`: origin serving `/embed/wine-list`
- `apiBase`: origin serving `/api/wines/grouped`
- `compact`: `true` or `false`
- `height`: iframe height string (for example `780px`)
- `width`: optional iframe width (default `100%`)

## Security/Header Requirements for Iframe Embedding

### Why this matters

Express + Helmet defaults are secure but can block third-party iframe embedding.

Common blockers:

- `X-Frame-Options` (for example `SAMEORIGIN`)
- CSP `frame-ancestors` restrictions

### Required policy behavior

For the embed page route (`/embed/wine-list`), allow framing from your Squarespace domain. Keep stricter defaults for the rest of the app.

Recommended approach:

1. Keep global Helmet defaults for API/admin routes.
2. Add route-specific policy for `/embed/wine-list` to allow Squarespace origins.
3. Explicitly document allowed framing origins in deployment config.

Example policy strategy (illustrative):

- global default: deny framing
- embed route override: allow `https://your-squarespace-domain.com`

Do not use wildcard framing in production.

## Scheduler Settings for Production Data Freshness

The embed only shows current data if the Square sync scheduler is configured.

Required env variables:

- `SQUARE_SYNC_ENABLED=true`
- `SQUARE_SYNC_CRON=*/10 * * * *` (every 10 minutes by default)

Recommended starting value:

- `*/10 * * * *` for standard menu freshness without excessive API churn

## Post-Launch Validation Checklist

After deployment and Squarespace update:

1. Open the Squarespace page and confirm wine groups render.
2. Verify network calls to:
- `/embed/wine-list`
- `/api/wines/grouped`
3. Confirm no browser console errors for CSP, frame policy, CORS, or mixed content.
4. Confirm scheduler logs show successful sync runs with created/updated/skipped counts.
5. Validate at least one known recently changed Square item appears correctly after a sync cycle.

## Troubleshooting

### Blank iframe or blocked frame

Symptoms:

- Iframe area is blank
- Browser console mentions `X-Frame-Options` or CSP `frame-ancestors`

Fix:

- Update embed route security headers to allow your Squarespace origin.
- Ensure the allowed origin exactly matches your live Squarespace domain.

### CORS or mixed-content errors

Symptoms:

- Browser console shows blocked cross-origin or insecure content messages

Fix:

- Ensure both Squarespace page and backend use HTTPS.
- Verify backend CORS policy allows expected browser origin where applicable.

### API base URL mismatch

Symptoms:

- Embed shell loads but wine data fails
- Requests go to wrong host or 404

Fix:

- Set `apiBase` to the correct backend origin.
- Confirm `/api/wines/grouped` is reachable from browser.

### Stale data in embed

Symptoms:

- Embed renders but inventory/menu updates lag indefinitely

Fix:

- Confirm `SQUARE_SYNC_ENABLED=true` in deployed environment.
- Confirm `SQUARE_SYNC_CRON` is set and valid.
- Check application logs for scheduler run success/failure entries.

## Ownership

- Primary owner: backend/integrations team
- Update this runbook whenever embed routes, security policy, or scheduler behavior changes
