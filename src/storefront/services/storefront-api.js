import { getFallbackProduct } from '../data/fallbackProducts';

const DEV_INTERNAL_API_BASE = 'http://yccfmd4h13a1y6hi691si73r.13.61.22.39.sslip.io';
const PRODUCT_FETCH_TIMEOUT_MS = 4500;

function getApiBaseCandidates() {
  const candidates = [
    import.meta.env.VITE_INTERNAL_STOREFRONT_BASE_URL,
    import.meta.env.VITE_INTERNAL_API_BASE,
    import.meta.env.VITE_ADMIN_BASE_URL,
    import.meta.env.VITE_API_URL,
    typeof window !== 'undefined' ? window.__HOLO_INTERNAL_API_BASE__ : '',
    typeof window !== 'undefined' ? window.__HOLO_STOREFRONT_API_BASE__ : '',
    typeof window !== 'undefined' ? window.localStorage?.getItem('holo:internal-api-base') : '',
    '',
    DEV_INTERNAL_API_BASE,
  ];

  return [
    ...new Set(
      candidates
        .filter((value) => value !== undefined && value !== null)
        .map((value) => String(value).replace(/\/$/, ''))
    ),
  ];
}

async function fetchJsonWithTimeout(url, init = {}) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), PRODUCT_FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      headers: { Accept: 'application/json', ...(init.headers || {}) },
      signal: controller.signal,
      credentials: 'include',
      ...init,
    });

    if (!response.ok) {
      throw new Error(`API ${url} failed with ${response.status}`);
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      throw new Error(`API ${url} did not return JSON`);
    }

    return response.json();
  } finally {
    window.clearTimeout(timeout);
  }
}

function normalizeProductPayload(payload) {
  if (!payload) return null;

  if (payload?.source === 'internal-storefront-resolver' && payload?.product) {
    return {
      ...payload.product,
      __resolvedStorefrontPayload: payload,
      __hydrationStatus: 'resolved-config-api',
      optionGroups: payload.resolvedOptions || payload.optionGroups || [],
      deliveryOptions: payload.deliveryOptions || [],
      productMode: payload.productMode,
      pricing: payload.pricing,
      appliedRules: payload.appliedRules,
      checkout: payload.checkout,
      templateRules: payload.templateRules,
      selectedOptions: payload.selectedOptions,
    };
  }

  if (payload?.data?.source === 'internal-storefront-resolver' && payload?.data?.product) {
    return normalizeProductPayload(payload.data);
  }

  if (payload?.data?.product) return payload.data.product;
  if (payload?.data?.item) return payload.data.item;
  if (payload?.data) return payload.data;
  if (payload?.product) return payload.product;
  if (payload?.item) return payload.item;

  return payload;
}

function cleanProductSlug(value = '') {
  const clean = String(value || '')
    .replace(/^\//, '')
    .replace(/\?.*$/, '')
    .replace(/#.*$/, '')
    .replace(/\/$/, '')
    .trim();
  const segments = clean.split('/').filter(Boolean);
  return segments[segments.length - 1] || clean;
}

function cleanFullPath(value = '') {
  return String(value || '')
    .replace(/^\//, '')
    .replace(/\?.*$/, '')
    .replace(/#.*$/, '')
    .replace(/\/$/, '')
    .trim();
}

export async function fetchStorefrontProduct(slug, options = {}) {
  const productSlug = cleanProductSlug(slug);
  const fullPath = cleanFullPath(options.fullPath || slug);

  if (!productSlug) {
    throw new Error('Missing product slug');
  }

  const cleanSlug = encodeURIComponent(productSlug);
  const cleanPath = encodeURIComponent(fullPath);
  const endpoints = [
    `/api/internal/storefront/products/${cleanSlug}/resolved`,
    `/api/internal/catalog/products/${cleanSlug}`,
    `/api/internal/catalog/storefront-products/${cleanSlug}`,
    `/api/internal/catalog/storefront-products?slug=${cleanSlug}`,
  ];

  if (fullPath && fullPath !== productSlug) {
    endpoints.push(
      `/api/internal/catalog/storefront-products?path=${cleanPath}`,
      `/api/internal/catalog/storefront-products?slug=${cleanSlug}&path=${cleanPath}`,
    );
  }

  let lastError = null;

  for (const base of getApiBaseCandidates()) {
    for (const endpoint of endpoints) {
      try {
        const payload = await fetchJsonWithTimeout(`${base}${endpoint}`);
        const normalized = normalizeProductPayload(payload);

        if (normalized && Object.keys(normalized).length) {
          return normalized;
        }
      } catch (error) {
        lastError = error;
      }
    }
  }

  const fallback = getFallbackProduct(productSlug);

  if (fallback) {
    console.warn('[storefront] API unavailable; using marked fallback product for slug:', productSlug, lastError);
    return { ...fallback, __isFallbackProduct: true, __apiError: lastError?.message || 'Unable to load API product' };
  }

  throw lastError || new Error('Unable to load storefront product');
}

export default {
  fetchStorefrontProduct,
};
