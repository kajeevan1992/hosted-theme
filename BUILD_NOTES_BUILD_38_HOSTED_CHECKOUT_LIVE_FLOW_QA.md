# Build 38 — Hosted Checkout Live-Flow QA Hardening

## Goal
Harden the hosted theme live ordering path without redesigning pages or creating a duplicate flow.

Target flow:
`product/cart -> checkout -> order/payment or quote -> customer account -> order detail -> invoice/receipt`

## Changed in hosted theme

### `src/services_api.js`
- Exports `confirmCardPayment` from the internal storefront service.
- Fixes account payment-return import path used by `Account.jsx`.
- Keeps existing internal hosted storefront service wrapper.

### `src/services/internalStorefront.js`
- Improves API error parsing so structured backend errors show their message instead of `[object Object]`.
- `createInternalOrder(...)` now tries:
  1. `/api/internal/storefront/checkout`
  2. `/api/internal/orders`
- This keeps hosted theme checkout on internal storefront routes first, with the older direct order route only as fallback.
- No public `/api/v1` calls were added.

## Changed in print-admin backend

### `app/api/internal/storefront/checkout/route.ts`
- Accepts the actual hosted checkout payload items when the theme submits checkout directly.
- Still supports server-side stored cart validation when no payload items are sent.
- Allows quote/manual-review and upload-artwork-later flows without incorrectly blocking on cart preflight.
- Normalises customer name from `first_name` / `last_name` payloads.
- Phone number is no longer a hard blocker for hosted checkout submission.
- Saves internal orders through the existing `saveOrder(...)` service.
- Preserves mixed VAT payload data, VAT breakdown, delivery, artwork mode, and resolver status.

## Not changed
- No theme redesign.
- No duplicate checkout/order flow.
- No external/headless `/api/v1` route.
- No public API key auth changes.
- No Stripe behaviour change other than fixing the missing confirm export.

## Manual test path
1. Add product to cart.
2. Open checkout.
3. Enter customer, billing, delivery and artwork choice.
4. Submit as quote request or pay-now order.
5. Confirm customer account loads orders by email.
6. Open order detail.
7. Download invoice and receipt.
8. Confirm VAT totals match Build 37 backend VAT summary.
