# Domain Rules

This document captures the key business rules currently implemented in the application.

## Wine and Inventory Rules

- Duplicate wines are prevented by a composite unique constraint on `(name, wineryId, vintage)`.
- Inventory references wines by foreign key (`wineId`) and does not duplicate wine records.
- Public wine list responses include only wines with available inventory.
- Public wine list pricing is summarized from available inventory rows using the lowest available glass and bottle prices.
- Public wine list filtering is applied in the repository layer; price sorting and pagination are applied in the service layer.

## Ratings Rules

- Ratings are constrained to 1 through 5 by validation and service guards.
- Only authenticated users can create ratings.

## Admin and Access Rules

- Admin wine routes require bearer auth and a user with `role=ADMIN`.
- Public endpoints remain available without JWT except where explicitly protected.
