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

const BUILD_FINGERPRINT = 'HOSTED-THEME-ADMIN-CATEGORY-ROUTES-v2026-06-17';
const PRODUCT_HINTS = ['standard-business-cards', 'standard-cards', 'business-card', 'flyer', 'leaflet', 'poster', 'booklet', 'label', 'sticker', 'banner', 'sign', 'ncr', 'letterhead', 'compliment', 'notepad'];
const RESERVED = new Set(['cart', 'checkout', 'account', 'login', 'contact', 'collection-pass', 'artwork-upload', 'bespoke-quote', 'quote']);

function currentPath() { return typeof window === 'undefined' ? '/' : window.location.pathname || '/'; }
function clean(pathname) { return String(pathname || '').replace(/^\//, '').replace(/\/$/, ''); }
function segments(pathname) { return clean(pathname).split('/').filter(Boolean); }
function looksProduct(pathname) { const slug = clean(pathname); return Boolean(slug) && PRODUCT_HINTS.some((hint) => slug.includes(hint)); }
function oneSegment(pathname) { const slug = clean(pathname); return Boolean(slug) && !slug.includes('/') && !RESERVED.has(slug); }
function twoSegment(pathname) { const parts = segments(pathname); return parts.length === 2 && !RESERVED.has(parts[0]); }
function internalPath(path = '/') { const text = String(path || '/'); if (/^https?:\/\//i.test(text)) { try { return new URL(text).pathname || '/'; } catch { return '/'; } } return text.startsWith('/') ? text : `/${text}`; }
function syncParentRoute(path) { if (typeof window === 'undefined' || window.parent === window) return; const nextPath = internalPath(path); window.parent.postMessage({ type: 'holo-storefront:navigate', path: nextPath }, '*'); }

function BuildFingerprintBanner() { if (import.meta.env.PROD) return null; return <div style={{ position: 'fixed', right: 12, bottom: 12, zIndex: 999999, background: '#111827', color: '#fff', fontSize: 11, padding: '8px 10px', borderRadius: 10 }}>{BUILD_FINGERPRINT}</div>; }
function navigate(path) { if (typeof window === 'undefined') return; const nextPath = internalPath(path); window.history.pushState({}, '', nextPath); window.scrollTo({ top: 0, behavior: 'smooth' }); }
function DynamicSeoWithFallback({ pathname, fallback }) { return <><LaunchSeo pathname={pathname} /><DynamicSeoLandingPage pathname={pathname} navigate={navigate} fallback={fallback} /><BuildFingerprintBanner /></>; }
function UnknownSlugFallback({ pathname }) { return <DynamicSeoWithFallback pathname={pathname} fallback={<AppLive />} />; }

export default function ConnectedApp() {
  const [pathname, setPathname] = useState(currentPath());

  useEffect(() => {
    const update = () => setPathname(currentPath());
    window.addEventListener('popstate', update);
    window.addEventListener('locationchange', update);
    const originalPush = window.history.pushState;
    const originalReplace = window.history.replaceState;
    window.history.pushState = function patchedPush(...args) { const result = originalPush.apply(this, args); syncParentRoute(args[2] || currentPath()); window.dispatchEvent(new Event('locationchange')); return result; };
    window.history.replaceState = function patchedReplace(...args) { const result = originalReplace.apply(this, args); syncParentRoute(args[2] || currentPath()); window.dispatchEvent(new Event('locationchange')); return result; };
    syncParentRoute(currentPath());
    return () => { window.removeEventListener('popstate', update); window.removeEventListener('locationchange', update); window.history.pushState = originalPush; window.history.replaceState = originalReplace; };
  }, []);

  if (pathname === '/') return <><LaunchSeo pathname={pathname} /><EnhancedHomePage /><BuildFingerprintBanner /></>;
  if (pathname === '/collection-pass') return <><CollectionPassPage navigate={navigate} /><BuildFingerprintBanner /></>;
  if (isProductLocationRoute(pathname)) return <DynamicSeoWithFallback pathname={pathname} fallback={<ProductLocationPage pathname={pathname} navigate={navigate} />} />;
  if (isLocationRoute(pathname)) return <DynamicSeoWithFallback pathname={pathname} fallback={<LocationPageRouter pathname={pathname} navigate={navigate} />} />;
  if (launchPagePaths.includes(pathname)) return <DynamicSeoWithFallback pathname={pathname} fallback={<LaunchPageRouter pathname={pathname} />} />;
  if (twoSegment(pathname)) return <><LaunchSeo pathname={pathname} /><ProductLiveConfigurator pathname={pathname} fallback={<UnknownSlugFallback pathname={pathname} />} showDiagnostic={false} /><BuildFingerprintBanner /></>;
  if (isCategoryLandingRoute(pathname)) return <><LaunchSeo pathname={pathname} /><CategoryLandingPage pathname={pathname} /><BuildFingerprintBanner /></>;
  if (looksProduct(pathname)) return <><LaunchSeo pathname={pathname} /><ProductLiveConfigurator pathname={pathname} fallback={<AppLive />} showDiagnostic /><BuildFingerprintBanner /></>;
  if (oneSegment(pathname)) return <><LaunchSeo pathname={pathname} /><CategoryLandingPage pathname={pathname} /><BuildFingerprintBanner /></>;
  return <DynamicSeoWithFallback pathname={pathname} fallback={<AppLive />} />;
}
