import React, { useEffect, useState } from 'react';
import AppLive from './AppLive';
import EnhancedHomePage from './EnhancedHomePage';
import ProductLiveConfigurator from './ProductLiveConfigurator';
import { LaunchPageRouter, LaunchSeo, launchPagePaths } from './LaunchPages';
import { LocationPageRouter, isLocationRoute } from './LocationPages';
import { ProductLocationPage, isProductLocationRoute } from './ProductLocationPages';
import CollectionPassPage from './CollectionPassPage';
import DynamicSeoLandingPage from './DynamicSeoLandingPage';
import CategoryLandingPage, { isCategoryLandingRoute } from './CategoryLandingPage';

const BUILD_FINGERPRINT = 'HOSTED-THEME-CATEGORY-PRODUCT-URLS-v2026-06-17';

const PRODUCT_ROUTE_HINTS = [
  'standard-business-cards',
  'business-card',
  'standard-cards',
  'cards',
  'flyer',
  'leaflet',
  'poster',
  'booklet',
  'label',
  'sticker',
  'banner',
  'sign',
  'ncr',
  'letterhead',
  'compliment',
  'notepad',
];

const RESERVED_TOP_LEVEL_ROUTES = new Set([
  'cart',
  'checkout',
  'account',
  'login',
  'auth',
  'contact',
  'collection-pass',
  'artwork-upload',
  'bespoke-quote',
  'quote',
]);

function currentPath() {
  if (typeof window === 'undefined') return '/';
  return window.location.pathname || '/';
}

function cleanSlug(pathname) {
  return String(pathname || '').replace(/^\//, '').replace(/\/$/, '');
}

function pathSegments(pathname) {
  return cleanSlug(pathname).split('/').filter(Boolean);
}

function looksLikeProductRoute(pathname) {
  const slug = cleanSlug(pathname);
  if (!slug) return false;
  return PRODUCT_ROUTE_HINTS.some((hint) => slug.includes(hint));
}

function isPlainSlugRoute(pathname) {
  const slug = cleanSlug(pathname);
  if (!slug) return false;
  if (slug.includes('/')) return false;
  if (slug.startsWith('api')) return false;
  if (RESERVED_TOP_LEVEL_ROUTES.has(slug)) return false;
  return true;
}

function isCategoryProductRoute(pathname) {
  const segments = pathSegments(pathname);
  if (segments.length !== 2) return false;
  const [categorySlug, productSlug] = segments;
  if (!categorySlug || !productSlug) return false;
  if (categorySlug === 'api' || categorySlug.startsWith('_')) return false;
  if (RESERVED_TOP_LEVEL_ROUTES.has(categorySlug)) return false;
  return true;
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

function DynamicSeoWithFallback({ pathname, fallback }) {
  return <><LaunchSeo pathname={pathname} /><DynamicSeoLandingPage pathname={pathname} navigate={navigate} fallback={fallback} /><BuildFingerprintBanner /></>;
}

function UnknownSlugFallback({ pathname }) {
  return <DynamicSeoWithFallback pathname={pathname} fallback={<AppLive />} />;
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

  if (pathname === '/') {
    return <><LaunchSeo pathname={pathname} /><EnhancedHomePage /><BuildFingerprintBanner /></>;
  }

  if (pathname === '/collection-pass') {
    return <><CollectionPassPage navigate={navigate} /><BuildFingerprintBanner /></>;
  }

  if (isProductLocationRoute(pathname)) {
    return <DynamicSeoWithFallback pathname={pathname} fallback={<ProductLocationPage pathname={pathname} navigate={navigate} />} />;
  }

  if (isLocationRoute(pathname)) {
    return <DynamicSeoWithFallback pathname={pathname} fallback={<LocationPageRouter pathname={pathname} navigate={navigate} />} />;
  }

  if (launchPagePaths.includes(pathname)) {
    return <DynamicSeoWithFallback pathname={pathname} fallback={<LaunchPageRouter pathname={pathname} navigate={navigate} />} />;
  }

  if (isCategoryProductRoute(pathname)) {
    return <><LaunchSeo pathname={pathname} /><ProductLiveConfigurator pathname={pathname} fallback={<UnknownSlugFallback pathname={pathname} />} showDiagnostic={false} /><BuildFingerprintBanner /></>;
  }

  if (isCategoryLandingRoute(pathname)) {
    return <><LaunchSeo pathname={pathname} /><CategoryLandingPage pathname={pathname} /><BuildFingerprintBanner /></>;
  }

  if (looksLikeProductRoute(pathname)) {
    return <><LaunchSeo pathname={pathname} /><ProductLiveConfigurator pathname={pathname} fallback={<AppLive />} showDiagnostic /><BuildFingerprintBanner /></>;
  }

  if (isPlainSlugRoute(pathname)) {
    return <><LaunchSeo pathname={pathname} /><ProductLiveConfigurator pathname={pathname} fallback={<UnknownSlugFallback pathname={pathname} />} showDiagnostic={false} /><BuildFingerprintBanner /></>;
  }

  return <DynamicSeoWithFallback pathname={pathname} fallback={<AppLive />} />;
}
