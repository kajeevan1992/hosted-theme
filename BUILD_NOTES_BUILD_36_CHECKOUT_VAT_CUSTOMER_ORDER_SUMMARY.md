# Build 36 — Checkout VAT Display + Customer Order VAT Summary

## Scope
- Preserve existing hosted theme checkout flow.
- Reuse existing checkout VAT concepts instead of creating a separate VAT model.
- Add customer-facing VAT visibility to account/order pages.

## What was already there and reused
- `src/Checkout.jsx` already had:
  - `lineVatProfile(...)`
  - `buildTaxSummary(...)`
  - net/VAT/gross totals
  - VAT breakdown by rate
  - `taxSummary` and `totals.vatBreakdown` included in checkout payload
- This build keeps that checkout flow intact and does not replace it.

## Changed files
- `src/utils/orderVat.js`
  - New shared customer order VAT summary normaliser.
  - Reads existing `taxSummary`, `tax_summary`, `totals`, minor-unit fields, order items, VAT rates and delivery VAT.
  - Falls back safely when older synced orders only have partial totals.
- `src/OrderDetail.jsx`
  - Replaced local VAT helper with shared `buildOrderVatSummary(...)`.
  - Shows net, VAT, delivery gross, total inc VAT and mixed VAT breakdown.
- `src/Account.jsx`
  - Customer order cards now show net, VAT, total inc VAT and mixed VAT badge before opening the order.
  - Keeps existing order/artwork/production/delivery card structure.

## Notes
- No duplicate checkout/order flow was created.
- No public `/api/v1` calls were added.
- Hosted theme still uses the existing `services_api.js` / internal storefront service bridge.
- Checkout VAT calculation was not rewritten; this build focuses on displaying the existing VAT payload in customer order views.
