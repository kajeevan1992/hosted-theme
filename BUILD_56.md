# Build 56 — Hosted theme JSON-LD schema

Changed file:
- `src/LaunchPages.jsx`

Summary:
- `LaunchSeo` now injects JSON-LD schema into the page head.
- It uses SaaS SEO resolver output from `/api/internal/seo/resolve?path=/...` when available.
- It keeps a safe fallback WebPage schema when the resolver is unavailable.
- It uses one managed script tag only:
  - `holo-print-seo-jsonld`

This connects hosted theme pages to Build 56 schema output without changing checkout, cart, product or account flows.
