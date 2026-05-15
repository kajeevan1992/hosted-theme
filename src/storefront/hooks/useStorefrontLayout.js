import { useEffect, useState } from 'react';
import fallbackLayout from '../data/layoutPayload';
import { fetchStorefrontLayout } from '../services/layout-api';

export function useStorefrontLayout() {
  const [state, setState] = useState({
    loading: true,
    layout: fallbackLayout,
    error: null,
  });

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const layout = await fetchStorefrontLayout();

        if (!active) return;

        setState({
          loading: false,
          layout,
          error: null,
        });
      } catch (error) {
        if (!active) return;

        setState({
          loading: false,
          layout: fallbackLayout,
          error: error?.message || 'Unable to load storefront layout',
        });
      }
    }

    load();

    return () => {
      active = false;
    };
  }, []);

  return state;
}

export default useStorefrontLayout;
