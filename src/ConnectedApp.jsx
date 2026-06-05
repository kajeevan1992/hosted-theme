import React, { useEffect, useState } from 'react';
import AppLive from './AppLive';
import ProductLiveConfigurator from './ProductLiveConfigurator';
import { LaunchPageRouter, LaunchSeo, launchPagePaths } from './LaunchPages';
import { LocationPageRouter, isLocationRoute } from './LocationPages';
import { ProductLocationPage, isProductLocationRoute } from './ProductLocationPages';

const BUILD_FINGERPRINT = 'HOSTED-THEME-BUILD-59-PRODUCT-LOCATION-SEO-PAGES-v2026-06-05';

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

function BuildFingerprintBanner() {
  if (import.meta.env.PROD) return null;
  return (
    <div style={{ position: 'fixed', right: 12, bottom: 12, zIndex: 999999, background: '#111827', color: '#fff', fontSize: 11, padding: '8px 10px', borderRadius: 10, boxShadow: '0 8px 30px rgba(0,0,0,.2)', opacity: 0.88 }}>
      {BUILD_FINGERPRINT}
    </div>
  );
}

function navigate(path) {
  if (typeof window === 'undefined') return;
  window.history.pushState({}, '', path);
  window.dispatchEvent(new Event('locationchange'));
  window.scrollTo({ top: 0, behavior: 'smooth' });
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

  if (isLocationRoute(pathname)) {
    return (
      <>
        <LocationPageRouter pathname={pathname} navigate={navigate} />
        <BuildFingerprintBanner />
      </>
    );
  }

  if (isProductLocationRoute(pathname)) {
    return (
      <>
        <ProductLocationPage pathname={pathname} navigate={navigate} />
        <BuildFingerprintBanner />
      </>
    );
  }

  if (launchPagePaths.includes(pathname)) {
    return (
      <>
        <LaunchPageRouter pathname={pathname} navigate={navigate} />
        <BuildFingerprintBanner />
      </>
    );
  }

  if (looksLikeProductRoute(pathname)) {
    return (
      <>
        <LaunchSeo pathname={pathname} />
        <ProductLiveConfigurator pathname={pathname} fallback={<AppLive />} />
        <BuildFingerprintBanner />
      </>
    );
  }

  return (
    <>
      <LaunchSeo pathname={pathname} />
      <AppLive />
      <BuildFingerprintBanner />
    </>
  );
}
