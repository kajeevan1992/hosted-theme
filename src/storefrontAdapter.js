const DEFAULT_BASE_URL = '';

function envBaseUrl() {
  try {
    return import.meta?.env?.VITE_API_URL || import.meta?.env?.VITE_BACKEND_URL || import.meta?.env?.VITE_INTERNAL_API_BASE_URL || '';
  } catch {
    return '';
  }
}

function getBaseUrl() {
  const configured = window.__STORE_FRONT_INTERNAL_BASE_URL__ || window.__SAAS_INTERNAL_BASE_URL__ || envBaseUrl() || DEFAULT_BASE_URL;
  return String(configured || '').replace(/\/$/, '');
}

async function request(path, options = {}) {
  const url = `${getBaseUrl()}${path}`;

  const response = await fetch(url, {
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...(options.headers || {}),
    },
    ...options,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok || payload.ok === false) {
    const message = payload?.error?.message || payload?.error || `Request failed: ${response.status}`;

    const error = new Error(message);
    error.status = response.status;
    error.payload = payload;
    error.url = url;

    throw error;
  }

  return payload;
}

function toQuery(params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, String(value));
    }
  });

  const text = query.toString();
  return text ? `?${text}` : '';
}

function normalizeStorefrontPayload(payload, idOrSlug) {
  if (!payload) return null;

  if (payload.data) {
    return normalizeStorefrontPayload(payload.data, idOrSlug);
  }

  if (payload.product) return payload.product;
  if (payload.item) return payload.item;

  if (Array.isArray(payload.items)) {
    return payload.items.find((item) => item?.slug === idOrSlug || item?.id === idOrSlug) || payload.items[0] || null;
  }

  return payload;
}

async function getProductWithFallback(idOrSlug) {
  try {
    const storefront = await request(`/api/internal/catalog/storefront-products${toQuery({ slug: idOrSlug, includeDrafts: true })}`);

    const product = normalizeStorefrontPayload(storefront, idOrSlug);

    if (product?.slug || product?.id) {
      return {
        product,
        found: true,
        source: 'storefront-products',
      };
    }
  } catch {}

  try {
    const raw = await request(`/api/internal/catalog/products/${encodeURIComponent(idOrSlug)}`);

    const product = normalizeStorefrontPayload(raw, idOrSlug);

    if (product?.slug || product?.id) {
      const metadata = typeof product.metadataJson === 'string'
        ? (() => {
            try {
              return JSON.parse(product.metadataJson);
            } catch {
              return {};
            }
          })()
        : (product.metadataJson || {});

      return {
        product: {
          ...product,
          name: product.name || product.title,
          optionGroups: product.optionGroups || metadata.optionGroups || [],
          pricingMatrix: product.pricingMatrix || metadata.pricingMatrix || null,
          metadataJson: metadata,
          readiness: {
            ready: true,
            csvMatrixReady: Boolean(metadata?.pricingMatrix?.rows?.length),
          },
        },
        found: true,
        source: 'raw-product-endpoint',
      };
    }
  } catch {}

  return {
    product: null,
    found: false,
    source: 'not-found',
  };
}

export function installStorefrontAdapter() {
  const existing = window.storefront || {};

  window.storefront = {
    ...existing,
    _config: {
      baseUrl: getBaseUrl(),
      mode: getBaseUrl() ? 'configured-backend' : 'same-origin-hosted-theme',
    },
    products: {
      ...existing.products,
      list: (params = {}) => request(`/api/internal/catalog/storefront-products${toQuery({ includeDrafts: true, ...params })}`),
      get: getProductWithFallback,
      search: (q) => request(`/api/internal/catalog/storefront-products${toQuery({ q, includeDrafts: true })}`),
    },
    pricing: {
      ...(existing.pricing || {}),
      resolve: (data = {}) => request('/api/internal/catalog/pricing-resolve', {
        method: 'POST',
        body: JSON.stringify(data || {}),
      }),
    },
    rules: {
      ...(existing.rules || {}),
      evaluate: (data = {}) => request('/api/internal/catalog/evaluate-rules', {
        method: 'POST',
        body: JSON.stringify(data || {}),
      }),
    },
    cart: {
      ...existing.cart,
      get: () => request('/api/internal/storefront/cart'),
      add: (item) => request('/api/internal/storefront/cart', {
        method: 'POST',
        body: JSON.stringify(item || {}),
      }),
      update: (item) => request('/api/internal/storefront/cart', {
        method: 'PUT',
        body: JSON.stringify(item || {}),
      }),
      remove: (id) => request(`/api/internal/storefront/cart${toQuery({ id })}`, {
        method: 'DELETE',
      }),
      clear: () => request('/api/internal/storefront/cart?clear=true', {
        method: 'DELETE',
      }),
    },
    checkout: {
      ...existing.checkout,
      precheck: () => request('/api/internal/storefront/checkout'),
      createDraft: (data) => request('/api/internal/storefront/checkout', {
        method: 'POST',
        body: JSON.stringify(data || {}),
      }),
      createOrder: async (data = {}) => {
        const draft = await request('/api/internal/storefront/checkout', {
          method: 'POST',
          body: JSON.stringify(data),
        });

        const draftOrderId = draft?.draftOrder?.id || draft?.record?.id || data.draftOrderId || data.orderId;

        if (!draftOrderId) return draft;

        return request('/api/internal/storefront/finalise', {
          method: 'POST',
          body: JSON.stringify({ draftOrderId }),
        });
      },
      finalise: (data) => request('/api/internal/storefront/finalise', {
        method: 'POST',
        body: JSON.stringify(data || {}),
      }),
    },
    payment: {
      ...existing.payment,
      update: (data) => request('/api/internal/storefront/payments', {
        method: 'POST',
        body: JSON.stringify(data || {}),
      }),
    },
    artwork: {
      ...existing.artwork,
      upload: (data) => {
        if (data instanceof FormData) {
          return request('/api/internal/storefront/artwork', {
            method: 'POST',
            body: data,
          });
        }

        return request('/api/internal/storefront/artwork', {
          method: 'POST',
          body: JSON.stringify(data || {}),
        });
      },
      preflight: (data) => request('/api/internal/storefront/preflight', {
        method: 'POST',
        body: JSON.stringify(data || {}),
      }),
    },
    customer: {
      ...existing.customer,
      orders: {
        ...(existing.customer?.orders || {}),
        list: (params = {}) => request(`/api/internal/storefront/orders${toQuery(params)}`),
        get: async (id) => {
          const data = await request('/api/internal/storefront/orders');
          const payload = data?.data || data;
          const orders = payload.orders || payload.finalOrders || payload.draftOrders || [];

          return orders.find(
            (order) =>
              String(order.id) === String(id) ||
              String(order.orderNumber) === String(id) ||
              String(order.quoteReference) === String(id),
          ) || null;
        },
      },
    },
    health: {
      ...existing.health,
      get: () => request('/api/internal/storefront/health'),
    },
  };

  return window.storefront;
}

export default installStorefrontAdapter;
