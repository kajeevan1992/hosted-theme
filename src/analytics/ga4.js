const ENV_GA4_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || import.meta.env.VITE_GOOGLE_ANALYTICS_ID || '';
const ENV_GTM_ID = import.meta.env.VITE_GTM_CONTAINER_ID || import.meta.env.VITE_GOOGLE_TAG_MANAGER_ID || '';
const ENV_DISABLED = String(import.meta.env.VITE_DISABLE_ANALYTICS || '').toLowerCase() === 'true';

let installed = false;
let installing = null;
let lastPath = '';
let runtimeConfig = null;
let queuedEvents = [];

function cleanPath(value = '/') {
  const clean = String(value || '/').split('?')[0].split('#')[0] || '/';
  return clean.startsWith('/') ? clean : `/${clean}`;
}

function defaultConfig() {
  return {
    enabled: !ENV_DISABLED && Boolean(ENV_GA4_ID || ENV_GTM_ID),
    ga4Enabled: Boolean(ENV_GA4_ID),
    ga4MeasurementId: ENV_GA4_ID,
    gtmEnabled: Boolean(ENV_GTM_ID),
    gtmContainerId: ENV_GTM_ID,
    googleAdsId: '',
    consentMode: 'off',
    anonymizeIp: true,
    debugMode: String(import.meta.env.VITE_ANALYTICS_DEBUG || '').toLowerCase() === 'true',
    trackPageViews: true,
    trackSeoEvents: true,
    trackViewItem: true,
    trackBeginCheckout: true,
    trackGenerateLead: true,
    trackPurchase: true,
    trackCheckoutErrors: true,
    currency: 'GBP',
  };
}

function apiBases() {
  const adapterBase = window.storefront?._config?.baseUrl || window.__STORE_FRONT_INTERNAL_BASE_URL__ || window.__SAAS_INTERNAL_BASE_URL__ || '';
  return [
    import.meta.env.VITE_ANALYTICS_SETTINGS_URL || '',
    import.meta.env.VITE_INTERNAL_STOREFRONT_BASE_URL || '',
    import.meta.env.VITE_ADMIN_BASE_URL || '',
    import.meta.env.VITE_INTERNAL_API_BASE || '',
    import.meta.env.VITE_API_URL || '',
    adapterBase,
    '',
  ].filter((value, index, arr) => value !== null && value !== undefined && arr.indexOf(value) === index).map((value) => String(value || '').replace(/\/$/, ''));
}

function settingsUrls() {
  const explicit = import.meta.env.VITE_ANALYTICS_SETTINGS_URL;
  if (explicit) return [explicit];
  return apiBases().map((base) => `${base}/api/internal/storefront/analytics-settings`);
}

async function fetchRuntimeSettings() {
  for (const url of settingsUrls()) {
    try {
      const response = await fetch(url, { cache: 'no-store', credentials: 'include' });
      const payload = await response.json().catch(() => null);
      const data = payload?.data || payload;
      if (response.ok && data && typeof data === 'object') return data;
    } catch {}
  }
  return null;
}

async function loadConfig() {
  if (runtimeConfig) return runtimeConfig;
  const fallback = defaultConfig();
  const remote = await fetchRuntimeSettings();
  const merged = remote ? { ...fallback, ...remote } : fallback;
  merged.enabled = Boolean(merged.enabled) && !ENV_DISABLED;
  merged.ga4MeasurementId = String(merged.ga4MeasurementId || '').trim();
  merged.gtmContainerId = String(merged.gtmContainerId || '').trim();
  merged.ga4Enabled = Boolean(merged.enabled && merged.ga4Enabled && merged.ga4MeasurementId);
  merged.gtmEnabled = Boolean(merged.enabled && merged.gtmEnabled && merged.gtmContainerId);
  runtimeConfig = merged;
  window.__HOLO_TRACKING_SETTINGS__ = merged;
  return merged;
}

function loadScript(key, src) {
  if (!src || document.querySelector(`script[data-holo-analytics="${key}"]`)) return;
  const script = document.createElement('script');
  script.async = true;
  script.src = src;
  script.setAttribute('data-holo-analytics', key);
  document.head.appendChild(script);
}

function installConsentDefaults(config) {
  if (!window.gtag || config.consentMode === 'off') return;
  const denied = { ad_storage: 'denied', analytics_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' };
  const grantedAnalytics = { ad_storage: 'denied', analytics_storage: 'granted', ad_user_data: 'denied', ad_personalization: 'denied' };
  window.gtag('consent', 'default', config.consentMode === 'advanced' ? denied : grantedAnalytics);
}

function installGa4(config) {
  if (!config.ga4Enabled) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag(){ window.dataLayer.push(arguments); };
  installConsentDefaults(config);
  loadScript(`ga4-${config.ga4MeasurementId}`, `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(config.ga4MeasurementId)}`);
  window.gtag('js', new Date());
  window.gtag('config', config.ga4MeasurementId, {
    send_page_view: false,
    anonymize_ip: Boolean(config.anonymizeIp),
    debug_mode: Boolean(config.debugMode),
  });
}

function installGtm(config) {
  if (!config.gtmEnabled) return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
  loadScript(`gtm-${config.gtmContainerId}`, `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(config.gtmContainerId)}`);
}

function isEventEnabled(name, config) {
  if (!config?.enabled) return false;
  if (name === 'page_view') return Boolean(config.trackPageViews);
  if (name === 'seo_metadata_loaded') return Boolean(config.trackSeoEvents);
  if (name === 'view_item') return Boolean(config.trackViewItem);
  if (name === 'begin_checkout') return Boolean(config.trackBeginCheckout);
  if (name === 'generate_lead') return Boolean(config.trackGenerateLead);
  if (name === 'purchase') return Boolean(config.trackPurchase);
  if (name === 'checkout_error') return Boolean(config.trackCheckoutErrors);
  return true;
}

function sendEvent(name, params = {}) {
  const config = runtimeConfig;
  if (!isEventEnabled(name, config)) return;
  const payload = { ...params };
  if (config.debugMode) payload.debug_mode = true;
  if (config.ga4Enabled && window.gtag) window.gtag('event', name, payload);
  if (config.gtmEnabled) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: name, ...payload });
  }
}

function flushQueuedEvents() {
  const events = queuedEvents.slice(0, 50);
  queuedEvents = [];
  events.forEach(([name, params]) => sendEvent(name, params));
}

export function initGa4Analytics() {
  if (installed || typeof window === 'undefined') return installing;
  installing = (async () => {
    const config = await loadConfig();
    if (!config.enabled || (!config.ga4Enabled && !config.gtmEnabled)) return config;
    installed = true;
    installGtm(config);
    installGa4(config);
    if (config.trackPageViews) trackPageView();
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
    flushQueuedEvents();
    return config;
  })();
  return installing;
}

export function trackPageView(pathname = window.location.pathname) {
  const path = cleanPath(pathname);
  if (path === lastPath) return;
  lastPath = path;
  const params = { page_title: document.title, page_location: window.location.href, page_path: path };
  if (!installed) {
    queuedEvents.push(['page_view', params]);
    return;
  }
  sendEvent('page_view', params);
}

export function trackEvent(name, params = {}) {
  if (!installed) {
    queuedEvents.push([name, params]);
    if (!installing) void initGa4Analytics();
    return;
  }
  sendEvent(name, params);
}

export function trackCheckoutEvent(name, cart = {}, extra = {}) {
  const config = runtimeConfig || defaultConfig();
  const items = Array.isArray(cart.items) ? cart.items : [];
  const valueMinor = Number(cart.grossTotalMinor || cart.totalMinor || cart.total || 0);
  trackEvent(name, {
    currency: cart.currency || config.currency || 'GBP',
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
