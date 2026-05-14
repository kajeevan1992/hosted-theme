import React, { useEffect, useState } from 'react';
import AppLive from './AppLive';
import ProductLiveConfigurator from './ProductLiveConfigurator';

const PRODUCT_ROUTE_HINTS = [
  'standard-business-cards',
  'business-cards',
  'flyers',
  'leaflets',
  'posters',
  'posters-large-format-prints',
  'booklets',
  'stickers',
  'labels',
  'banners',
  'signage',
];

function currentPath() {
  if (typeof window === 'undefined') return '/';
  return window.location.pathname || '/';
}

function looksLikeProductRoute(pathname) {
  const slug = String(pathname || '').replace(/^\//, '').replace(/\/$/, '');
  if (!slug) return false;
  return PRODUCT_ROUTE_HINTS.some((hint) => slug.includes(hint));
}

export default function ConnectedApp() {
  const [pathname, setPathname] = useState(currentPath());

  useEffect(() => {
    const update = () => setPathname(currentPath());
    window.addEventListener('popstate', update);
    window.addEventListener('pushstate', update);
    window.addEventListener('replacestate', update);

    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function pushStatePatched(...args) {
      const result = originalPushState.apply(this, args);
      window.dispatchEvent(new Event('pushstate'));
      window.dispatchEvent(new Event('locationchange'));
      return result;
    };

    window.history.replaceState = function replaceStatePatched(...args) {
      const result = originalReplaceState.apply(this, args);
      window.dispatchEvent(new Event('replacestate'));
      window.dispatchEvent(new Event('locationchange'));
      return result;
    };

    window.addEventListener('locationchange', update);

    return () => {
      window.removeEventListener('popstate', update);
      window.removeEventListener('pushstate', update);
      window.removeEventListener('replacestate', update);
      window.removeEventListener('locationchange', update);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, []);

  if (looksLikeProductRoute(pathname)) {
    return <ProductLiveConfigurator pathname={pathname} fallback={<AppLive />} />;
  }

  return <AppLive />;
}
