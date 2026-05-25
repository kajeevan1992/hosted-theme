const DEFAULT_ADMIN_BASE_URL = import.meta.env.VITE_INTERNAL_STOREFRONT_BASE_URL || import.meta.env.VITE_ADMIN_BASE_URL || import.meta.env.VITE_INTERNAL_API_BASE || import.meta.env.VITE_API_URL || '';

function buildUrl(path, params = {}) {
  const base = DEFAULT_ADMIN_BASE_URL.replace(/\/$/, '');
  const url = new URL(`${base}${path}`, window.location.origin);
  Object.entries(params).forEach(([key, value]) => { if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, String(value)); });
  return url.toString();
}
function customerEmail() { try { return localStorage.getItem('holo-customer-email') || ''; } catch { return ''; } }
export function setCustomerEmail(email) { try { localStorage.setItem('holo-customer-email', String(email || '').trim()); } catch {} }
export function getCustomerEmail() { return customerEmail(); }
async function request(path, { method = 'GET', body, params, customer = false } = {}) {
  const email = customerEmail();
  const response = await fetch(buildUrl(path, params), { method, headers: body || customer ? { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(customer && email ? { 'X-Customer-Email': email } : {}) } : undefined, body: body ? JSON.stringify(body) : undefined, credentials: 'include' });
  const payload = await response.json().catch(() => null);
  if (!response.ok || payload?.ok === false) throw new Error(payload?.error || `Internal storefront request failed: ${path}`);
  return payload;
}
async function requestFirst(paths, options) { let lastError; for (const path of paths) { try { return await request(path, options); } catch (error) { lastError = error; } } throw lastError || new Error('Internal storefront request failed'); }
async function uploadMultipart(path, formData, params = {}) { const response = await fetch(buildUrl(path, params), { method: 'POST', body: formData, credentials: 'include' }); const payload = await response.json().catch(() => null); if (!response.ok || payload?.ok === false) throw new Error(payload?.error || `Internal artwork upload failed: ${path}`); return payload; }
export function extractArtworkUploadId(value) { if (!value) return ''; if (typeof value === 'string') return value; return value.id || value.upload?.id || value.artworkUploadId || value.artwork?.id || value.data?.upload?.id || value.data?.id || ''; }
export function extractOrderId(value) { if (!value) return ''; return value.order?.id || value.data?.order?.id || value.data?.id || value.id || value.orderId || value.orderNumber || ''; }
function text(value) { return String(value || '').toLowerCase().replace(/[_-]+/g, ' '); }
function moneyToMinor(value) { const n = Number(value || 0); if (!Number.isFinite(n) || n < 0) return 0; return n > 10000 ? Math.round(n) : Math.round(n * 100); }
function vatProfileForLine(item = {}) {
  const resolver = item.resolverSnapshot || {};
  const product = resolver.product || {};
  const pricing = resolver.pricing || {};
  const explicit = [item.vatRate, item.taxRate, product.vatRate, product.taxRate, pricing.vatRate, pricing.selected?.vatRate, item.config?.vatRate, item.selections?.vatRate].find((value) => Number.isFinite(Number(value)));
  if (explicit !== undefined) { const rate = Number(explicit); return { vatRate: rate, vatClass: rate === 0 ? 'zero' : rate === 20 ? 'standard' : 'custom', vatReason: 'resolver-or-item-vat-rate' }; }
  const source = [item.name, item.title, item.productName, item.productId, item.slug, product.name, product.title, product.categoryName, product.categorySlug, item.config?.taxClass, item.config?.vatClass].map(text).join(' ');
  if (['design', 'artwork service', 'proof', 'setup', 'installation', 'file fix'].some((term) => source.includes(term))) return { vatRate: 20, vatClass: 'standard', vatReason: 'standard-rated-service-or-add-on' };
  if (['business card', 'board', 'sign', 'signage', 'banner', 'sticker', 'label', 'ncr', 'pvc', 'poster'].some((term) => source.includes(term))) return { vatRate: 20, vatClass: 'standard', vatReason: 'standard-rated-print-product-fallback' };
  if (['leaflet', 'flyer', 'booklet', 'brochure'].some((term) => source.includes(term))) return { vatRate: 0, vatClass: 'zero', vatReason: 'zero-rated-printed-matter-fallback' };
  return { vatRate: 20, vatClass: 'standard', vatReason: 'default-standard-vat-fallback' };
}
function enrichCheckoutVat(payload = {}) {
  const rawItems = Array.isArray(payload.items) ? payload.items : [];
  let itemGrossMinor = 0;
  let itemVatMinor = 0;
  const vatBuckets = new Map();
  const items = rawItems.map((item) => {
    const quantity = Number(item.quantity || item.qty || 1) || 1;
    const grossMinor = moneyToMinor(item.totalPrice ?? item.total ?? item.lineTotal ?? (Number(item.price || 0) * quantity));
    const profile = vatProfileForLine(item);
    const netMinor = profile.vatRate > 0 ? Math.round(grossMinor / (1 + profile.vatRate / 100)) : grossMinor;
    const vatMinor = Math.max(0, grossMinor - netMinor);
    itemGrossMinor += grossMinor;
    itemVatMinor += vatMinor;
    const current = vatBuckets.get(profile.vatRate) || { rate: profile.vatRate, vatClass: profile.vatClass, netMinor: 0, vatMinor: 0, grossMinor: 0, reasons: [] };
    current.netMinor += netMinor; current.vatMinor += vatMinor; current.grossMinor += grossMinor; if (!current.reasons.includes(profile.vatReason)) current.reasons.push(profile.vatReason); vatBuckets.set(profile.vatRate, current);
    return { ...item, quantity, qty: quantity, vatRate: profile.vatRate, vatClass: profile.vatClass, vatReason: profile.vatReason, netTotalMinor: netMinor, vatMinor, grossTotalMinor: grossMinor, unitNetMinor: Math.round(netMinor / quantity), unitGrossMinor: Math.round(grossMinor / quantity) };
  });
  const deliveryGrossMinor = moneyToMinor(payload.totals?.delivery ?? payload.delivery?.price ?? payload.delivery?.fee ?? 0);
  const deliveryRate = Number.isFinite(Number(payload.delivery?.vatRate)) ? Number(payload.delivery.vatRate) : 20;
  const deliveryNetMinor = deliveryRate > 0 ? Math.round(deliveryGrossMinor / (1 + deliveryRate / 100)) : deliveryGrossMinor;
  const deliveryVatMinor = Math.max(0, deliveryGrossMinor - deliveryNetMinor);
  if (deliveryGrossMinor > 0) {
    const current = vatBuckets.get(deliveryRate) || { rate: deliveryRate, vatClass: deliveryRate === 0 ? 'zero' : 'standard', netMinor: 0, vatMinor: 0, grossMinor: 0, reasons: [] };
    current.netMinor += deliveryNetMinor; current.vatMinor += deliveryVatMinor; current.grossMinor += deliveryGrossMinor; if (!current.reasons.includes('delivery-tax-class')) current.reasons.push('delivery-tax-class'); vatBuckets.set(deliveryRate, current);
  }
  const subtotalMinor = Math.max(0, itemGrossMinor - itemVatMinor) + deliveryNetMinor;
  const vatTotalMinor = itemVatMinor + deliveryVatMinor;
  const totalMinor = itemGrossMinor + deliveryGrossMinor;
  return { ...payload, items, totals: { ...(payload.totals || {}), subtotalMinor, netTotalMinor: subtotalMinor, vatTotalMinor, taxMinor: vatTotalMinor, grossTotalMinor: totalMinor, totalMinor, subtotal: subtotalMinor / 100, vat: vatTotalMinor / 100, total: totalMinor / 100, delivery: deliveryGrossMinor / 100, vatBreakdown: [...vatBuckets.values()].sort((a, b) => a.rate - b.rate) }, vatBreakdown: [...vatBuckets.values()].sort((a, b) => a.rate - b.rate), taxMode: 'mixed-product-line-vat' };
}
export function resolveProductConfig(slug, selections = {}, extraParams = {}) { return request(`/api/internal/storefront/products/${encodeURIComponent(slug)}/resolved`, { method: 'POST', body: { selections, ...extraParams } }); }
export function resolveCartPrice(productId, selections = {}, quantity) { return request('/api/internal/storefront/cart/price', { method: 'POST', body: { productId, selections, quantity } }); }
export function resolveDeliveryOptions({ postcode, subtotalMinor } = {}) { return request('/api/internal/storefront/delivery/options', { method: 'POST', body: { postcode, subtotalMinor } }); }
export function resolveArtworkPreflight({ productId, slug, files = [], selections = {}, artworkMode = 'upload' } = {}) { return requestFirst(['/api/internal/storefront/artwork/preflight', '/api/internal/catalog/artwork-preflight'], { method: 'POST', body: { productId, slug, files, selections, artworkMode } }); }
export async function uploadArtworkFile(file, { productId, slug, orderId, quoteId, mode, preflight } = {}) { const formData = new FormData(); formData.append('file', file); if (productId) formData.append('productId', productId); if (slug) formData.append('slug', slug); if (orderId) formData.append('orderId', orderId); if (quoteId) formData.append('quoteId', quoteId); if (mode) formData.append('mode', mode); if (preflight) formData.append('preflight', JSON.stringify(preflight)); const payload = await uploadMultipart('/api/internal/storefront/artwork/upload', formData); const upload = payload.upload || payload.data?.upload || payload; return { ...payload, success: true, id: upload.id, url: upload.fileUrl, downloadUrl: upload.downloadUrl, upload }; }
export function updateArtworkUploadStatus(uploadId, { action = 'pending-review', note = '', orderId, quoteId, actor = 'hosted-theme' } = {}) { if (!uploadId) return Promise.resolve(null); return request(`/api/internal/storefront/artwork/uploads/${encodeURIComponent(uploadId)}/status`, { method: 'PATCH', body: { action, note, orderId, quoteId, actor } }); }
export function attachArtworkUploadToOrder(uploadReference, { orderId, quoteId, note } = {}) { const uploadId = extractArtworkUploadId(uploadReference); if (!uploadId || (!orderId && !quoteId)) return Promise.resolve(null); return updateArtworkUploadStatus(uploadId, { action: 'pending-review', orderId, quoteId, note: note || (orderId ? `Attached to order ${orderId}` : `Attached to quote ${quoteId}`), actor: 'checkout-submit' }); }
function responseQuoteId(value) { if (!value) return ''; return value.quoteRequest?.id || value.data?.quoteRequest?.id || value.data?.id || value.id || value.quoteId || ''; }
export async function createInternalOrder(payload) { const artworkUploadId = extractArtworkUploadId(payload?.artwork_reference || payload?.artwork || payload?.artworkUpload); const customerEmailFromPayload = payload?.customerEmail || payload?.customer?.email || payload?.payload?.customer?.email || ''; if (customerEmailFromPayload) setCustomerEmail(customerEmailFromPayload); const body = enrichCheckoutVat({ ...payload, artworkUploadIds: [...new Set([...(payload?.artworkUploadIds || []), artworkUploadId].filter(Boolean))] }); const response = await request('/api/internal/orders', { method: 'POST', body }); await attachOrderResponseArtwork(response, body).catch(() => null); return response; }
export async function createQuoteRequest(payload) { try { const response = await request('/api/internal/storefront/quote/request', { method: 'POST', body: enrichCheckoutVat(payload) }); const quoteId = responseQuoteId(response); const uploadId = extractArtworkUploadId(payload?.artwork || payload?.artwork_reference || payload.checkout?.artwork_reference); if (uploadId && quoteId) await attachArtworkUploadToOrder(uploadId, { quoteId, note: 'Attached to quote request during hosted checkout.' }).catch(() => null); return response; } catch (error) { const fallbackPayload = enrichCheckoutVat({ ...(payload.checkout || payload), payment_method: 'Quote request', quoteRequired: true, artwork_reference: payload.artwork || payload.artwork_reference || payload.checkout?.artwork_reference }); return createInternalOrder(fallbackPayload); } }
export async function attachOrderResponseArtwork(response, payload) { const orderId = extractOrderId(response); const uploadId = extractArtworkUploadId(payload?.artwork_reference || payload?.artwork || payload?.artworkUpload); if (uploadId && orderId) await attachArtworkUploadToOrder(uploadId, { orderId, note: 'Attached to final order during hosted checkout.' }).catch(() => null); return response; }
export async function createCardPaymentSession(orderResponse, { customerEmail, successUrl, cancelUrl } = {}) { const orderId = extractOrderId(orderResponse); if (!orderId) throw new Error('Order was created but no order id was returned for payment.'); const payload = await request('/api/internal/storefront/payments/card/create-session', { method: 'POST', body: { orderId, customerEmail, successUrl, cancelUrl } }); return payload?.data || payload; }
export async function confirmCardPayment(sessionId) { return request('/api/internal/storefront/payments/card/confirm', { params: { session_id: sessionId } }); }
export async function createPaidOrder(payload) { const order = await createInternalOrder({ ...payload, paymentStatus: 'pending', paymentProvider: 'stripe' }); const origin = window.location.origin; const successUrl = `${origin}/account?payment=success&orderId=${encodeURIComponent(extractOrderId(order))}&session_id={CHECKOUT_SESSION_ID}`; const cancelUrl = `${origin}/account?payment=cancel&orderId=${encodeURIComponent(extractOrderId(order))}`; const session = await createCardPaymentSession(order, { customerEmail: payload?.customer?.email || payload?.customerEmail || '', successUrl, cancelUrl }); if (session?.url) window.location.href = session.url; return { order, session }; }
export async function listCustomerOrders(params = {}) { const email = params.email || customerEmail(); const payload = await request('/api/internal/storefront/customer/orders', { params: { ...params, email }, customer: true }); return payload?.data?.orders || payload?.data?.items || payload?.orders || []; }
export async function getCustomerOrder(id, params = {}) { const email = params.email || customerEmail(); const payload = await request(`/api/internal/storefront/customer/orders/${encodeURIComponent(id)}`, { params: { ...params, email }, customer: true }); return payload?.data?.order || payload?.data?.item || payload?.order || null; }
export function customerOrderDocumentUrl(orderId, type = 'invoice', email = customerEmail()) { return buildUrl(`/api/internal/storefront/customer/orders/${encodeURIComponent(orderId)}/documents/${encodeURIComponent(type)}`, { email }); }
export function openCustomerOrderDocument(orderId, type = 'invoice', email = customerEmail()) { window.open(customerOrderDocumentUrl(orderId, type, email), '_blank', 'noopener,noreferrer'); }
export async function getArtworkReuploadContext(token) { const payload = await request('/api/internal/storefront/artwork/reupload', { params: { token } }); return payload?.upload || payload?.data?.upload || payload; }
export async function submitReplacementArtwork(token, file) { const formData = new FormData(); formData.append('file', file); const payload = await uploadMultipart('/api/internal/storefront/artwork/reupload', formData, { token }); return payload?.upload ? payload : { upload: payload }; }
export function resolvedPriceToPounds(pricing) { const minor = pricing?.selected?.totalMinor ?? pricing?.totalMinor ?? null; return typeof minor === 'number' ? minor / 100 : null; }
export function mapResolvedOptionsToThemeGroups(resolvedOptions = []) { return resolvedOptions.map((group) => ({ key: group.pricingKey || group.key || group.id, label: group.name || group.key || 'Option', valueLabel: group.values?.find((value) => value.id === group.selectedValueId)?.label || group.values?.[0]?.label || '', style: ['radio', 'swatches', 'checkboxes'].includes(group.displayType) ? 'pill' : 'tile', required: !!group.required, selectedValueId: group.selectedValueId, options: (group.values || []).map((value) => ({ id: value.id, value: value.label || value.id, sublabel: value.description || value.unit || '', recommended: value.id === group.selectedValueId || value.isDefault, muted: value.isHidden, raw: value })), raw: group })); }
export function mapThemeSelectionsToResolver(selected = {}, quantity) { const next = { ...selected }; if (quantity !== undefined) next.quantity = quantity; return next; }