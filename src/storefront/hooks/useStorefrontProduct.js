import { useEffect, useMemo, useState } from 'react';
import { fetchStorefrontProduct } from '../services/storefront-api';
import mapBackendProductToStorefrontPayload from '../services/productPayloadMapper';

function normalizeSlug(pathname = '') {
  return pathname
    .replace(/^\//, '')
    .replace(/\?.*$/, '')
    .replace(/#.*$/, '')
    .trim();
}

export function useStorefrontProduct(pathname) {
  const slug = useMemo(() => normalizeSlug(pathname), [pathname]);

  const [state, setState] = useState({
    loading: true,
    error: null,
    product: null,
  });

  useEffect(() => {
    let active = true;

    async function load() {
      if (!slug) {
        setState({
          loading: false,
          error: 'Missing product slug',
          product: null,
        });
        return;
      }

      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));

        const backendProduct = await fetchStorefrontProduct(slug);

        if (!active) return;

        const mapped = mapBackendProductToStorefrontPayload(backendProduct);

        setState({
          loading: false,
          error: null,
          product: mapped,
        });
      } catch (error) {
        if (!active) return;

        setState({
          loading: false,
          error: error?.message || 'Unable to load product',
          product: null,
        });
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [slug]);

  return {
    slug,
    ...state,
  };
}

export default useStorefrontProduct;
