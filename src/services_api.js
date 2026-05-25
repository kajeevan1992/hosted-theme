import { attachOrderResponseArtwork, createInternalOrder, createPaidOrder, uploadArtworkFile, listCustomerOrders, getCustomerOrder, setCustomerEmail, getCustomerEmail, customerOrderDocumentUrl, openCustomerOrderDocument, getArtworkReuploadContext, submitReplacementArtwork } from './services/internalStorefront';

function storefront() { return typeof window !== 'undefined' ? (window.storefront || {}) : {}; }
function missingService(name) { return new Error(`Hosted storefront service is not available: window.storefront.${name}`); }
async function call(path, fn, fallback) { if (typeof fn !== 'function') { if (fallback !== undefined) return fallback; throw missingService(path); } return fn(); }
function normaliseList(payload) { if (Array.isArray(payload)) return { items: payload, count: payload.length }; if (Array.isArray(payload?.items)) return { ...payload, count: payload.count ?? payload.items.length }; if (Array.isArray(payload?.data?.items)) return { ...payload.data, count: payload.data.count ?? payload.data.items.length }; return { items: [], count: 0 }; }
function normaliseCart(payload) { const data = payload?.data || payload || {}; return { ...data, items: Array.isArray(data.items) ? data.items : [], totals: data.totals || { currency: 'GBP', itemCount: 0, lineCount: 0, netTotalMinor: 0, vatTotalMinor: 0, grossTotalMinor: 0 } }; }
function normaliseOrders(payload) { if (Array.isArray(payload)) return payload; if (Array.isArray(payload?.orders)) return payload.orders; if (Array.isArray(payload?.items)) return payload.items; if (Array.isArray(payload?.data?.orders)) return payload.data.orders; if (Array.isArray(payload?.data?.items)) return payload.data.items; if (Array.isArray(payload?.finalOrders) || Array.isArray(payload?.draftOrders)) return [...(payload.finalOrders || []), ...(payload.draftOrders || [])]; if (Array.isArray(payload?.data?.finalOrders) || Array.isArray(payload?.data?.draftOrders)) return [...(payload.data.finalOrders || []), ...(payload.data.draftOrders || [])]; return []; }
function normaliseRuleResult(payload, selections = {}) { const data = payload?.data || payload || {}; return { ok: data.ok !== false, blocked: Boolean(data.blocked), selections: data.selections || selections || {}, messages: Array.isArray(data.messages) ? data.messages : [], disabledValues: Array.isArray(data.disabledValues) ? data.disabledValues : [], hiddenOptions: Array.isArray(data.hiddenOptions) ? data.hiddenOptions : [], requiredFields: Array.isArray(data.requiredFields) ? data.requiredFields : [], priceAdjustments: Array.isArray(data.priceAdjustments) ? data.priceAdjustments : [] }; }
function normalisePrice(payload) { const data = payload?.data || payload || {}; return { ok: data.ok !== false, sku: data.sku || null, oldSku: data.oldSku || null, quantity: data.quantity || data.options?.quantity || null, options: data.options || {}, currency: data.currency || 'GBP', netMinor: Number(data.netMinor || data.priceMinor || 0), vatRate: Number(data.vatRate ?? 20), vatMinor: Number(data.vatMinor || 0), grossMinor: Number(data.grossMinor || data.totalMinor || data.netMinor || data.priceMinor || 0), supplierPriceMinor: data.supplierPriceMinor || null, matchedRow: data.matchedRow || null }; }
function wantsCardPayment(data = {}) { return String(data.payment_method || data.paymentMethod || '').toLowerCase() === 'pay now'; }

export const products = { async list(params = {}) { return normaliseList(await call('products.list', storefront().products?.list, { items: [], count: 0 }).then((fnResult) => fnResult || storefront().products?.list?.(params))); }, async get(idOrSlug) { const payload = await call('products.get', () => storefront().products?.get?.(idOrSlug), null); return payload?.product || payload?.data?.product || payload; }, async search(q) { const payload = await call('products.search', () => storefront().products?.search?.(q), { items: [], count: 0 }); return normaliseList(payload); } };
export const pricing = { async resolve(data = {}) { const payload = await call('pricing.resolve', () => storefront().pricing?.resolve?.(data), null); return normalisePrice(payload); } };
export async function resolveProductPrice(data = {}) { return pricing.resolve(data); }
export const rules = { async evaluate(data = {}) { const payload = await call('rules.evaluate', () => storefront().rules?.evaluate?.(data), null); return normaliseRuleResult(payload, data.selections || {}); } };
export async function evaluateProductRules(data = {}) { return rules.evaluate(data); }
export const cart = { async get() { return normaliseCart(await call('cart.get', storefront().cart?.get, null)); }, async add(item = {}) { return normaliseCart(await call('cart.add', () => storefront().cart?.add?.(item), null)); }, async update(item = {}) { return normaliseCart(await call('cart.update', () => storefront().cart?.update?.(item), null)); }, async remove(id) { return normaliseCart(await call('cart.remove', () => storefront().cart?.remove?.(id), null)); }, async clear() { return normaliseCart(await call('cart.clear', storefront().cart?.clear, null)); } };
export const checkout = { async precheck() { return call('checkout.precheck', storefront().checkout?.precheck, null); }, async createDraft(data = {}) { return call('checkout.createDraft', () => storefront().checkout?.createDraft?.(data), null); }, async createOrder(data = {}) { const hostedCreate = storefront().checkout?.createOrder; if (typeof hostedCreate === 'function') { const response = await hostedCreate(data); return attachOrderResponseArtwork(response, data); } return wantsCardPayment(data) ? createPaidOrder(data) : createInternalOrder(data); }, async finalise(data = {}) { const hostedFinalise = storefront().checkout?.finalise; if (typeof hostedFinalise === 'function') { const response = await hostedFinalise(data); return attachOrderResponseArtwork(response, data); } return wantsCardPayment(data) ? createPaidOrder(data) : createInternalOrder(data); } };
export const artwork = { async upload(dataOrFile, meta = {}) { const payload = dataOrFile instanceof File ? { file: dataOrFile, ...meta } : { ...(dataOrFile || {}), ...meta }; const hostedUpload = storefront().artwork?.upload; if (typeof hostedUpload === 'function') return hostedUpload(payload); if (payload.file instanceof File) return uploadArtworkFile(payload.file, payload); return null; }, async preflight(data = {}) { return call('artwork.preflight', () => storefront().artwork?.preflight?.(data), null); }, async reuploadContext(token) { return getArtworkReuploadContext(token); }, async submitReplacement(token, file) { return submitReplacementArtwork(token, file); } };
export const payment = { async update(data = {}) { return call('payment.update', () => storefront().payment?.update?.(data), null); } };
export const customer = { orders: { async list(params = {}) { const hosted = storefront().customer?.orders?.list; if (typeof hosted === 'function') return normaliseOrders(await hosted(params)); return normaliseOrders(await listCustomerOrders(params)); }, async get(id, params = {}) { const hosted = storefront().customer?.orders?.get; if (typeof hosted === 'function') return hosted(id, params); return getCustomerOrder(id, params); }, documentUrl: customerOrderDocumentUrl, openDocument: openCustomerOrderDocument } };
export const health = { async get() { return call('health.get', storefront().health?.get, null); } };

export const listProducts = (params) => products.list(params);
export const getProducts = (params) => products.list(params);
export const getProduct = (idOrSlug) => products.get(idOrSlug);
export const searchProducts = (q) => products.search(q);
export const getLivePrice = (data) => pricing.resolve(data);
export const getCart = () => cart.get();
export const addToCart = (item) => cart.add(item);
export const updateCart = (item) => cart.update(item);
export const removeFromCart = (id) => cart.remove(id);
export const clearCart = () => cart.clear();
export const createOrder = (data) => checkout.createOrder(data);
export const createDraftOrder = (data) => checkout.createDraft(data);
export const finaliseOrder = (data) => checkout.finalise(data);
export const uploadArtwork = (dataOrFile, meta = {}) => artwork.upload(dataOrFile, meta);
export const runPreflight = (data) => artwork.preflight(data);
export const getReuploadContext = (token) => artwork.reuploadContext(token);
export const submitReplacementArtwork = (token, file) => artwork.submitReplacement(token, file);
export const getOrderDocumentUrl = (orderId, type, email) => customer.orders.documentUrl(orderId, type, email);
export const openOrderDocument = (orderId, type, email) => customer.orders.openDocument(orderId, type, email);
export const updatePayment = (data) => payment.update(data);
export const getHealth = () => health.get();
export const getOrders = (params) => customer.orders.list(params);
export const listOrders = getOrders;
export const getOrder = (id, params) => customer.orders.get(id, params);
export { setCustomerEmail, getCustomerEmail };
export default { products, pricing, rules, cart, checkout, artwork, payment, customer, health, listProducts, getProducts, getProduct, searchProducts, getLivePrice, getCart, addToCart, updateCart, removeFromCart, clearCart, createOrder, createDraftOrder, finaliseOrder, uploadArtwork, runPreflight, getReuploadContext, submitReplacementArtwork, getOrderDocumentUrl, openOrderDocument, updatePayment, getHealth, getOrders, listOrders, getOrder, resolveProductPrice, evaluateProductRules, setCustomerEmail, getCustomerEmail };