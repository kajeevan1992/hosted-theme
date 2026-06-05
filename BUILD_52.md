# Build 52

Holo Print branding, SEO and essential launch pages.

Changed files:
- `src/LaunchPages.jsx`
- `src/ConnectedApp.jsx`
- `index.html`
- `BUILD_52.md`

Summary:
- Added dedicated Holo Print launch pages:
  - `/contact`
  - `/artwork-guide`
  - `/terms`
  - `/privacy`
- Added route-level SEO metadata and canonical handling for launch pages.
- Updated `index.html` from old Atlantis placeholder metadata to Holo Print launch metadata.
- Added Contact page content for Holo Print in Sidcup:
  - sales@holoprint.co.uk
  - 020 3336 0322
  - Sidcup High Street
  - Monday to Saturday, 9:00–17:30
- Added Artwork Guide with PDF, bleed, CMYK, 300dpi, fonts and cut-line guidance.
- Added launch Terms page covering quote approval, payment, artwork responsibility, turnaround, collection/delivery and cancellations/reprints.
- Added launch Privacy page covering customer details, artwork files, payments, emails and suppliers.
- Routed the new pages through `ConnectedApp.jsx` without rewriting the existing storefront pages.
- Build fingerprint banner now hides in production.

Not changed:
- No checkout flow changes.
- No payment changes.
- No VAT changes.
- No admin/backend changes.
- No duplicate storefront flow.

Next recommended:
Build 53 — final launch readiness audit and build/deployment checklist.
