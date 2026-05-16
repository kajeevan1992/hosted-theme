import { getFallbackProduct } from '../data/fallbackProducts';

const DEV_INTERNAL_API_BASE = 'http://yccfmd4h13a1y6hi691si73r.13.61.22.39.sslip.io';
const PRODUCT_FETCH_TIMEOUT_MS = 4500;

function getApiBaseCandidates() {
  const candidates = [
    import.meta.env.VITE_INTERNAL_API_BASE,
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

async function fetchJsonWithTimeout(url) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), PRODUCT_FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
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

  if (payload?.data?.product) return payload.data.product;
  if (payload?.data?.item) return payload.data.item;
  if (payload?.data) return payload.data;
  if (payload?.product) return payload.product;
  if (payload?.item) return payload.item;

  return payload;
}

export async function fetchStorefrontProduct(slug) {
  if (!slug) {
    throw new Error('Missing product slug');
  }

  const cleanSlug = encodeURIComponent(String(slug).replace(/^\//, ''));
  const endpoints = [
    `/api/internal/catalog/products/${cleanSlug}`,
    `/api/internal/catalog/storefront-products/${cleanSlug}`,
    `/api/internal/catalog/storefront-products?slug=${cleanSlug}`,
  ];

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

  const fallback = getFallbackProduct(slug);

  if (fallback) {
    console.warn('[storefront] API unavailable; using marked fallback product for slug:', slug, lastError);
    return { ...fallback, __isFallbackProduct: true, __apiError: lastError?.message || 'Unable to load API product' };
  }

  throw lastError || new Error('Unable to load storefront product');
}

export default {
  fetchStorefrontProduct,
};
