# Build 58 — Public Location Pages

Changed files:
- `src/LocationPages.jsx`
- `src/ConnectedApp.jsx`
- `BUILD_58.md`

Summary:
- Added public location page renderer for Holo Print hosted theme.
- Added routes for:
  - `/locations`
  - `/locations/sidcup`
  - `/print-collection/wimbledon`
  - `/print-collection/kingston`
  - `/printing/croydon`
  - `/printing/bromley`
  - `/printing/sutton`
- Pages use live Location Manager data from `/api/internal/storefront/locations` and `/api/internal/storefront/locations/[slug]`.
- Safe fallback location content is included for launch testing if API data is not seeded/active yet.
- Partner collection and service-area pages clearly avoid fake branch wording.
- Location routes are detected before product routes in `ConnectedApp.jsx`.

Not changed:
- Checkout collection selector is not added yet.
- QR/PIN handover is not added yet.
- Partner dashboard is not added yet.
