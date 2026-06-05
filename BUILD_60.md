# Build 60

Checkout Collection Selector.

Changed files:
- `src/Checkout.jsx`
- `BUILD_60.md`

Summary:
- Reused the existing checkout flow instead of creating a duplicate checkout.
- Reused the existing delivery resolver.
- Reused Build 57 storefront locations API: `/api/internal/storefront/locations`.
- Added collection and delivery into the existing checkout fulfilment step.
- Customers can now choose:
  - delivery options
  - collect from Holo Print Sidcup
  - collect from partner point where available
- Partner collection options are clearly marked as not fake Holo Print branches.
- Selected fulfilment is included in the checkout/quote payload as:
  - `fulfilmentMode`
  - `fulfilmentChoice`
  - `fulfilmentSelection`
  - `delivery`
- VAT summary includes collection/delivery fee VAT.
- Partner collection can require manual review, so quote/payment-link flow is reused.
- Safe fallback collection locations are included for launch testing if live Location Manager records are not active yet.

Not changed:
- No duplicate checkout page.
- No new location storage.
- No new SEO storage.
- No payment rewrite.
- No VAT rewrite.
- No QR/PIN handover yet.

Next recommended build:
- Build 61 — QR/PIN Collection System.
