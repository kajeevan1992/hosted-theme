const INTERNAL_API_BASE =
  import.meta.env.VITE_INTERNAL_API_BASE ||
  window.__HOLO_INTERNAL_API_BASE__ ||
  '';

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

      if (payload?.data) {
        return payload.data;
      }

      if (payload?.product) {
        return payload.product;
      }

      return payload;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error('Unable to load storefront product');
}

export default {
  fetchStorefrontProduct,
};
