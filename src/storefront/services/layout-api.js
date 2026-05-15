import fallbackLayout from '../data/layoutPayload';

const INTERNAL_API_BASE =
  import.meta.env.VITE_INTERNAL_API_BASE ||
  window.__HOLO_INTERNAL_API_BASE__ ||
  '';

export async function fetchStorefrontLayout() {
  const endpoints = [
    '/api/internal/storefront/layout',
    '/api/internal/storefront/layouts/default',
    '/api/internal/config/storefront-layout',
  ];

  let lastError = null;

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${INTERNAL_API_BASE}${endpoint}`);

      if (!response.ok) {
        lastError = new Error(`Layout API ${endpoint} failed with ${response.status}`);
        continue;
      }

      const payload = await response.json();
      const layout = payload?.data || payload?.layout || payload;

      if (layout && typeof layout === 'object') {
        return {
          ...fallbackLayout,
          ...layout,
          announcement: {
            ...fallbackLayout.announcement,
            ...(layout.announcement || {}),
          },
          navigation: {
            ...fallbackLayout.navigation,
            ...(layout.navigation || {}),
          },
          footer: {
            ...fallbackLayout.footer,
            ...(layout.footer || {}),
          },
        };
      }
    } catch (error) {
      lastError = error;
    }
  }

  if (import.meta.env.DEV && lastError) {
    console.warn('[storefront-layout] using fallback layout:', lastError.message);
  }

  return fallbackLayout;
}

export default {
  fetchStorefrontLayout,
};
