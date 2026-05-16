import { getFallbackProduct } from '../data/fallbackProducts';

const DEV_INTERNAL_API_BASE = 'http://yccfmd4h13a1y6hi691si73r.13.61.22.39.sslip.io';

function getApiBaseCandidates() {
  const candidates = [
    import.meta.env.VITE_INTERNAL_API_BASE,
    typeof window !== 'undefined' ? window.__HOLO_INTERNAL_API_BASE__ : '',
    typeof window !== 'undefined' ? window.__HOLO_STOREFRONT_API_BASE__ : '',
    typeof window !== 'undefined' ? window.localStorage?.getItem('holo:internal-api-base') : '',
    '',
    DEV_INTERNAL_API_BASE,
  ];

  return [...new Set(candidates.filter((value) => value !== undefined && value !== null).map((value) => String(value).replace(/\/$/, ''))))];
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
        const response = await fetch(`${base}${endpoint}`, { headers: { Accept: 'application/json' } });

        if (!response.ok) {
          lastError = new Error(`API ${base}${endpoint} failed with ${response.status}`);
          continue;
        }

        const payload = await response.json();
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
