import { getFallbackProduct } from '../data/fallbackProducts';

const INTERNAL_API_BASE =
  import.meta.env.VITE_INTERNAL_API_BASE ||
  window.__HOLO_INTERNAL_API_BASE__ ||
  '';

function normalizeProductPayload(payload) {
  if (!payload) return null;

  if (payload?.data?.product) {
    return payload.data.product;
  }

  if (payload?.data?.item) {
    return payload.data.item;
  }

  if (payload?.data) {
    return payload.data;
  }

  if (payload?.product) {
    return payload.product;
  }

  if (payload?.item) {
    return payload.item;
  }

  return payload;
}

export async function fetchStorefrontProduct(slug) {
  if (!slug) {
    throw new Error('Missing product slug');
  }

  const endpoints = [
    `/api/internal/catalog/products/${slug}`,
    `/api/internal/catalog/storefront-products?slug=${slug}`,
  ];

  let lastError = null;

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${INTERNAL_API_BASE}${endpoint}`);

      if (!response.ok) {
        lastError = new Error(`API ${endpoint} failed with ${response.status}`);
        continue;
      }

      const payload = await response.json();
      const normalized = normalizeProductPayload(payload);

      if (normalized) {
        return normalized;
      }
    } catch (error) {
      lastError = error;
    }
  }

  const fallback = getFallbackProduct(slug);

  if (fallback) {
    console.warn('[storefront] using fallback product for slug:', slug);
    return fallback;
  }

  throw lastError || new Error('Unable to load storefront product');
}

export default {
  fetchStorefrontProduct,
};
