import { useEffect, useMemo, useState } from 'react';
import { getFallbackProduct } from '../data/fallbackProducts';
import { fetchStorefrontProduct } from '../services/storefront-api';
import mapBackendProductToStorefrontPayload from '../services/productPayloadMapper';

function normalizeSlug(pathname = '') {
  const cleanPath = pathname
    .replace(/^\//, '')
    .replace(/\?.*$/, '')
    .replace(/#.*$/, '')
    .replace(/\/$/, '')
    .trim();

  const segments = cleanPath.split('/').filter(Boolean);
  return segments[segments.length - 1] || '';
}

function normalizeFullPath(pathname = '') {
  return pathname
    .replace(/^\//, '')
    .replace(/\?.*$/, '')
    .replace(/#.*$/, '')
    .replace(/\/$/, '')
    .trim();
}

function fallbackForSlug(slug) {
  const fallback = getFallbackProduct(slug);
  if (!fallback) return null;
  return mapBackendProductToStorefrontPayload({
    ...fallback,
    __isFallbackProduct: true,
    __hydrationStatus: 'fallback-rendered',
  });
}

export function useStorefrontProduct(pathname) {
  const slug = useMemo(() => normalizeSlug(pathname), [pathname]);
  const fullPath = useMemo(() => normalizeFullPath(pathname), [pathname]);
  const fallbackProduct = useMemo(() => fallbackForSlug(slug), [slug]);

  const [state, setState] = useState({
    loading: !fallbackProduct,
    hydrating: Boolean(fallbackProduct),
    error: null,
    product: fallbackProduct,
  });

  useEffect(() => {
    let active = true;

    async function load() {
      if (!slug) {
        setState({
          loading: false,
          hydrating: false,
          error: 'Missing product slug',
          product: null,
        });
        return;
      }

      setState({
        loading: !fallbackProduct,
        hydrating: true,
        error: null,
        product: fallbackProduct,
      });

      try {
        const backendProduct = await fetchStorefrontProduct(slug, { fullPath });
        if (!active) return;

        const mapped = mapBackendProductToStorefrontPayload(backendProduct);

        setState({
          loading: false,
          hydrating: false,
          error: null,
          product: mapped,
        });
      } catch (error) {
        if (!active) return;

        setState({
          loading: false,
          hydrating: false,
          error: fallbackProduct ? null : error?.message || 'Unable to load product',
          product: fallbackProduct
            ? {
                ...fallbackProduct,
                __apiError: error?.message || 'Unable to load full API product',
                __hydrationStatus: 'fallback-after-api-error',
              }
            : null,
        });
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [slug, fullPath, fallbackProduct]);

  return {
    slug,
    fullPath,
    ...state,
  };
}

export default useStorefrontProduct;
