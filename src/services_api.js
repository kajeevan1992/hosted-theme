// Hosted theme service layer (internal SaaS)
// Keep this file UI-compatible: old screens import named helpers, newer code can use grouped services.

function sf() {
  return window.storefront || {};
}

function asArray(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.orders)) return payload.orders;
  if (Array.isArray(payload?.data?.orders)) return payload.data.orders;
  if (Array.isArray(payload?.finalOrders) || Array.isArray(payload?.draftOrders)) return [...(payload.finalOrders || []), ...(payload.draftOrders || [])];
  if (Array.isArray(payload?.data?.finalOrders) || Array.isArray(payload?.data?.draftOrders)) return [...(payload.data.finalOrders || []), ...(payload.data.draftOrders || [])];
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data?.items)) return payload.data.items;
  return [];
}

export const products = {
  list: (params) => sf().products?.list?.(params),
  get: (id) => sf().products?.get?.(id),
  search: (q) => sf().products?.search?.(q),
};

export const rules = {
  evaluate: (data) => sf().rules?.evaluate?.(data),
};

export async function evaluateProductRules(data = {}) {
  if (!sf().rules?.evaluate) {
    return { ok: true, blocked: false, selections: data.selections || {}, messages: [], disabledValues: [], hiddenOptions: [], priceAdjustments: [] };
  }
  return sf().rules.evaluate(data);
}

export const cart = {
  get: () => sf().cart?.get?.(),
  add: (item) => sf().cart?.add?.(item),
  update: (item) => sf().cart?.update?.(item),
  remove: (id) => sf().cart?.remove?.(id),
  clear: () => sf().cart?.clear?.(),
};

export const checkout = {
  precheck: () => sf().checkout?.precheck?.(),
  createDraft: (data) => sf().checkout?.createDraft?.(data),
  createOrder: (data) => sf().checkout?.createOrder?.(data),
  finalise: (data) => sf().checkout?.finalise?.(data),
};

export const artwork = {
  upload: (file, meta = {}) => sf().artwork?.upload?.({ file, ...meta }),
  preflight: (data) => sf().artwork?.preflight?.(data),
};

export const payment = {
  update: (data) => sf().payment?.update?.(data),
};

export const customer = {
  orders: {
    list: (params) => sf().customer?.orders?.list?.(params),
    get: (id) => sf().customer?.orders?.get?.(id),
  }
};

export const health = {
  get: () => sf().health?.get?.(),
};

// Backward-compatible named exports used by existing theme screens.
export const createOrder = (data) => checkout.createOrder(data);
export const uploadArtwork = (file, meta = {}) => artwork.upload(file, meta);
export const runPreflight = (data) => artwork.preflight(data);
export const createDraftOrder = (data) => checkout.createDraft(data);
export const finaliseOrder = (data) => checkout.finalise(data);
export const updatePayment = (data) => payment.update(data);
export const getHealth = () => health.get();

export const listProducts = (params) => products.list(params);
export const getProducts = (params) => products.list(params);
export const getProduct = (id) => products.get(id);
export const searchProducts = (q) => products.search(q);

export const getCart = () => cart.get();
export const addToCart = (item) => cart.add(item);
export const updateCart = (item) => cart.update(item);
export const removeFromCart = (id) => cart.remove(id);
export const clearCart = () => cart.clear();

export const getOrders = async (params) => asArray(await customer.orders.list(params));
export const listOrders = getOrders;
export const getOrder = (id) => customer.orders.get(id);

export default {
  products,
  rules,
  cart,
  checkout,
  artwork,
  payment,
  customer,
  health,
  createOrder,
  uploadArtwork,
  getOrders,
  getOrder,
  evaluateProductRules,
};
