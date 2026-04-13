# API Reference

All API routes are mounted under `/api` unless otherwise noted.

## Auth

- `GET /api/auth/google/start` - Redirects browser to Google OAuth consent.
- `GET /api/auth/google/callback` - Exchanges Google code and redirects back with app JWT.
- `POST /api/auth/google` - Authenticates using a Google ID token payload.

## Wines

- `GET /api/wines` - Returns paginated wines with filters.
- `GET /api/wines/grouped` - Returns wines grouped by inferred type, then by region.
- `GET /api/wines/:slug` - Returns a single wine by slug.
- `GET /api/wines/qr/:code` - Resolves QR token (slug or Square item id) and redirects to `/wines/:slug`.
- `GET /api/wines/search?q=term` - Searches wines.
- `POST /api/wines` - Creates a wine.
- `GET /api/wines/:id/ratings` - Lists ratings for a wine.

### Wines Query Params

Supported `GET /api/wines` query params:

- `page` - 1-based page number, default `1`
- `pageSize` - 1 to 100, default `20`
- `sort` - `createdAt`, `name`, `priceGlass`, or `priceBottle`
- `order` - `asc` or `desc`
- `country` - exact country filter, case-insensitive
- `regionId` - filter by region id
- `wineryId` - filter by winery id
- `featuredOnly` - `true` or `false`
- `hasGlass` - `true` or `false`
- `hasBottle` - `true` or `false`

Example filtered request:

```text
GET /api/wines?page=1&pageSize=10&sort=priceGlass&order=asc&country=US&featuredOnly=true
```

Example `GET /api/wines` response:

```json
{
  "items": [
    {
      "id": "wine-id",
      "slug": "cabernet-2020",
      "name": "Cabernet",
      "vintage": 2020,
      "country": "US",
      "description": "Bold",
      "imageUrl": "https://example.com/wine.png",
      "winery": {
        "id": "winery-1",
        "name": "Alpha Winery"
      },
      "region": {
        "id": "region-1",
        "name": "Napa Valley"
      },
      "availableByBottle": true,
      "availableByGlass": true,
      "availableForFlight": false
    }
  ],
  "page": 1,
  "pageSize": 20,
  "total": 1,
  "totalPages": 1
}
```

Example `GET /api/wines/grouped` response:

```json
{
  "groups": [
    {
      "type": "red",
      "regions": [
        {
          "id": "region-1",
          "name": "Napa Valley",
          "wines": [
            {
              "id": "wine-id",
              "slug": "cabernet-2020",
              "name": "Cabernet",
              "vintage": 2020,
              "country": "US",
              "description": "Bold",
              "imageUrl": "https://example.com/wine.png",
              "winery": {
                "id": "winery-1",
                "name": "Alpha Winery"
              },
              "region": {
                "id": "region-1",
                "name": "Napa Valley"
              },
              "availableByBottle": true,
              "availableByGlass": true,
              "availableForFlight": false
            }
          ]
        }
      ]
    }
  ],
  "totalWines": 1
}
```

Example `POST /api/wines` body:

```json
{
  "name": "Opus One",
  "vintage": 2019,
  "wineryId": "winery-id",
  "regionId": "region-id",
  "country": "US",
  "grapeVarieties": ["Cabernet Sauvignon", "Merlot"],
  "alcoholPercent": 14.5,
  "description": "Structured and age-worthy.",
  "imageUrl": "https://example.com/opus-one.png"
}
```

Generated slugs are based on `name` and `vintage`, with a numeric suffix when needed.

## Admin Wines

Requires `Authorization: Bearer <app-jwt>` and `role=ADMIN`.

- `GET /api/admin/wines`
- `POST /api/admin/wines`
- `PUT /api/admin/wines/:id`
- `DELETE /api/admin/wines/:id`

## Inventory

- `GET /api/inventory`
- `GET /api/inventory/:id`
- `POST /api/inventory`
- `PATCH /api/inventory/:id`

## Ratings

- `POST /api/ratings` (requires JWT)

## Frontend Routes (non-API)

- `GET /wines/:slug` - Wine detail page.
- `GET /embed/wine-list` - Embeddable wine list shell.

For embed setup, security, and troubleshooting, see [Squarespace Integration Runbook](squarespace-integration.md).
