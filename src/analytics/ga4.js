const MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || import.meta.env.VITE_GOOGLE_ANALYTICS_ID || '';
const DISABLED = String(import.meta.env.VITE_DISABLE_ANALYTICS || '').toLowerCase() === 'true';

let installed = false;
let lastPath = '';

function cleanPath(value = '/') {
  const clean = String(value || '/').split('?')[0].split('#')[0] || '/';
  return clean.startsWith('/') ? clean : `/${clean}`;
}

function loadScript(id) {
  if (!id || document.querySelector(`script[data-holo-ga4="${id}"]`)) return;
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  script.setAttribute('data-holo-ga4', id);
  document.head.appendChild(script);
}

export function initGa4Analytics() {
  if (installed || DISABLED || !MEASUREMENT_ID || typeof window === 'undefined') return;
  installed = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag(){ window.dataLayer.push(arguments); };
  loadScript(MEASUREMENT_ID);
  window.gtag('js', new Date());
  window.gtag('config', MEASUREMENT_ID, { send_page_view: false });
  trackPageView();
  window.addEventListener('popstate', trackPageView);
  window.addEventListener('holo-route-change', trackPageView);
  window.addEventListener('locationchange', trackPageView);
  window.addEventListener('holo-seo-updated', (event) => {
    const detail = event.detail || {};
    trackEvent('seo_metadata_loaded', {
      page_path: cleanPath(detail.path || window.location.pathname),
      page_title: detail.title || document.title,
      seo_source: detail.fromStaticHtml ? 'static-html' : detail.found ? 'seo-engine' : 'fallback',
      page_type: detail.pageType || 'unknown',
    });
  });
}

export function trackPageView(pathname = window.location.pathname) {
  if (!window.gtag || !MEASUREMENT_ID) return;
  const path = cleanPath(pathname);
  if (path === lastPath) return;
  lastPath = path;
  window.gtag('event', 'page_view', {
    page_title: document.title,
    page_location: window.location.href,
    page_path: path,
  });
}

export function trackEvent(name, params = {}) {
  if (!window.gtag || !MEASUREMENT_ID) return;
  window.gtag('event', name, params);
}

export function trackCheckoutEvent(name, cart = {}, extra = {}) {
  const items = Array.isArray(cart.items) ? cart.items : [];
  const valueMinor = Number(cart.grossTotalMinor || cart.totalMinor || cart.total || 0);
  trackEvent(name, {
    currency: cart.currency || 'GBP',
    value: Math.round(valueMinor) / 100,
    items: items.map((item, index) => ({
      item_id: item.slug || item.productId || item.id || `item-${index + 1}`,
      item_name: item.name || item.productName || item.title || 'Print item',
      quantity: Number(item.quantity || 1),
      price: Number(item.unitPriceMinor || item.priceMinor || item.totalMinor || 0) / 100,
    })),
    ...extra,
  });
}
