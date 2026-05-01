// Hosted SaaS theme integration layer.
// Golden rule: UI imports this file only. This file calls window.storefront only.
// No fetch(), no /api/v1, no direct backend URLs inside UI/components.

function storefront() {
  return typeof window !== 'undefined' ? (window.storefront || {}) : {};
}

function missingService(name) {
  return new Error(`Hosted storefront service is not available: window.storefront.${name}`);
}

async function call(path, fn, fallback) {
  if (typeof fn !== 'function') {
    if (fallback !== undefined) return fallback;
    throw missingService(path);
  }
  return fn();
}

function normaliseList(payload) {
  if (Array.isArray(payload)) return { items: payload, count: payload.length };
  if (Array.isArray(payload?.items)) return { ...payload, count: payload.count ?? payload.items.length };
  if (Array.isArray(payload?.data?.items)) return { ...payload.data, count: payload.data.count ?? payload.data.items.length };
  return { items: [], count: 0 };
}

function normaliseCart(payload) {
  const data = payload?.data || payload || {};
  return {
    ...data,
    items: Array.isArray(data.items) ? data.items : [],
    totals: data.totals || {
      currency: 'GBP',
      itemCount: 0,
      lineCount: 0,
      netTotalMinor: 0,
      vatTotalMinor: 0,
      grossTotalMinor: 0,
    },
  };
}

function normaliseOrders(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.orders)) return payload.orders;
  if (Array.isArray(payload?.data?.orders)) return payload.data.orders;
  if (Array.isArray(payload?.finalOrders) || Array.isArray(payload?.draftOrders)) return [...(payload.finalOrders || []), ...(payload.draftOrders || [])];
  if (Array.isArray(payload?.data?.finalOrders) || Array.isArray(payload?.data?.draftOrders)) return [...(payload.data.finalOrders || []), ...(payload.data.draftOrders || [])];
  return [];
}

function normaliseRuleResult(payload, selections = {}) {
  const data = payload?.data || payload || {};
  return {
    ok: data.ok !== false,
    blocked: Boolean(data.blocked),
    selections: data.selections || selections || {},
    messages: Array.isArray(data.messages) ? data.messages : [],
    disabledValues: Array.isArray(data.disabledValues) ? data.disabledValues : [],
    hiddenOptions: Array.isArray(data.hiddenOptions) ? data.hiddenOptions : [],
    requiredFields: Array.isArray(data.requiredFields) ? data.requiredFields : [],
    priceAdjustments: Array.isArray(data.priceAdjustments) ? data.priceAdjustments : [],
  };
}

export const products = {
  async list(params = {}) {
    return normaliseList(await call('products.list', storefront().products?.list, { items: [], count: 0 }).then((fnResult) => fnResult || storefront().products?.list?.(params)));
  },
  async get(idOrSlug) {
    const payload = await call('products.get', () => storefront().products?.get?.(idOrSlug), null);
    return payload?.product || payload?.data?.product || payload;
  },
  async search(q) {
    const payload = await call('products.search', () => storefront().products?.search?.(q), { items: [], count: 0 });
    return normaliseList(payload);
  },
};

export const rules = {
  async evaluate(data = {}) {
    const payload = await call('rules.evaluate', () => storefront().rules?.evaluate?.(data), null);
    return normaliseRuleResult(payload, data.selections || {});
  },
};

export async function evaluateProductRules(data = {}) {
  return rules.evaluate(data);
}

export const cart = {
  async get() {
    return normaliseCart(await call('cart.get', storefront().cart?.get, null));
  },
  async add(item = {}) {
    return normaliseCart(await call('cart.add', () => storefront().cart?.add?.(item), null));
  },
  async update(item = {}) {
    return normaliseCart(await call('cart.update', () => storefront().cart?.update?.(item), null));
  },
  async remove(id) {
    return normaliseCart(await call('cart.remove', () => storefront().cart?.remove?.(id), null));
  },
  async clear() {
    return normaliseCart(await call('cart.clear', storefront().cart?.clear, null));
  },
};

export const checkout = {
  async precheck() {
    return call('checkout.precheck', storefront().checkout?.precheck, null);
  },
  async createDraft(data = {}) {
    return call('checkout.createDraft', () => storefront().checkout?.createDraft?.(data), null);
  },
  async createOrder(data = {}) {
    return call('checkout.createOrder', () => storefront().checkout?.createOrder?.(data), null);
  },
  async finalise(data = {}) {
    return call('checkout.finalise', () => storefront().checkout?.finalise?.(data), null);
  },
};

export const artwork = {
  async upload(dataOrFile, meta = {}) {
    const payload = dataOrFile instanceof File ? { file: dataOrFile, ...meta } : { ...(dataOrFile || {}), ...meta };
    return call('artwork.upload', () => storefront().artwork?.upload?.(payload), null);
  },
  async preflight(data = {}) {
    return call('artwork.preflight', () => storefront().artwork?.preflight?.(data), null);
  },
};

export const payment = {
  async update(data = {}) {
    return call('payment.update', () => storefront().payment?.update?.(data), null);
  },
};

export const customer = {
  orders: {
    async list(params = {}) {
      return normaliseOrders(await call('customer.orders.list', () => storefront().customer?.orders?.list?.(params), []));
    },
    async get(id) {
      const direct = await call('customer.orders.get', () => storefront().customer?.orders?.get?.(id), null);
      if (direct) return direct;
      const orders = await customer.orders.list();
      return orders.find((order) => String(order.id) === String(id) || String(order.orderNumber) === String(id)) || null;
    },
  },
};

export const health = {
  async get() {
    return call('health.get', storefront().health?.get, null);
  },
};

// Backward-compatible named exports for existing theme UI.
export const listProducts = (params) => products.list(params);
export const getProducts = (params) => products.list(params);
export const getProduct = (idOrSlug) => products.get(idOrSlug);
export const searchProducts = (q) => products.search(q);

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

export const updatePayment = (data) => payment.update(data);
export const getHealth = () => health.get();

export const getOrders = (params) => customer.orders.list(params);
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
  listProducts,
  getProducts,
  getProduct,
  searchProducts,
  getCart,
  addToCart,
  updateCart,
  removeFromCart,
  clearCart,
  createOrder,
  createDraftOrder,
  finaliseOrder,
  uploadArtwork,
  runPreflight,
  updatePayment,
  getHealth,
  getOrders,
  listOrders,
  getOrder,
  evaluateProductRules,
};
