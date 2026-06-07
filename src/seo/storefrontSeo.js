const SITE_URL = (import.meta.env.VITE_STOREFRONT_URL || window.location.origin || 'https://holoprint.co.uk').replace(/\/$/, '');
const DEFAULT_IMAGE = `${SITE_URL}/images/hero-slide-1.svg`;

const FALLBACK_META = {
  '/': {
    title: 'Holo Print | Design, Print, Sign and Web in Sidcup',
    metaDescription: 'Holo Print offers business cards, flyers, leaflets, posters, banners, stickers, shop boards, booklets, design support and local print services in Sidcup.',
    h1: 'Design, print, sign and web support in Sidcup',
    schemaTypes: ['Organization', 'WebPage'],
    ogImage: DEFAULT_IMAGE,
  },
  '/standard-business-cards': {
    title: 'Business Cards Printing | Holo Print Sidcup',
    metaDescription: 'Order professional business cards from Holo Print. Choose paper, finish, quantity and artwork support with local collection or delivery.',
    h1: 'Business cards printing',
    schemaTypes: ['Product', 'BreadcrumbList', 'FAQPage', 'WebPage'],
    productName: 'Business Cards',
    ogImage: `${SITE_URL}/images/business-card-front.svg`,
  },
  '/flyers': {
    title: 'Flyers & Leaflets Printing | Holo Print',
    metaDescription: 'Print flyers and leaflets online with Holo Print. Ideal for menus, promotions, events and local business marketing.',
    h1: 'Flyers and leaflets printing',
    schemaTypes: ['Product', 'BreadcrumbList', 'FAQPage', 'WebPage'],
    productName: 'Flyers & Leaflets',
    ogImage: `${SITE_URL}/images/flyer-front.svg`,
  },
  '/posters-large-format-prints': {
    title: 'Poster & Large Format Printing | Holo Print',
    metaDescription: 'Order posters and large format prints from Holo Print for displays, signage, events, promotions and retail graphics.',
    h1: 'Posters and large format printing',
    schemaTypes: ['Product', 'BreadcrumbList', 'FAQPage', 'WebPage'],
    productName: 'Posters & Large Format Prints',
    ogImage: `${SITE_URL}/images/poster-main.svg`,
  },
  '/booklets': {
    title: 'Booklet & Brochure Printing | Holo Print',
    metaDescription: 'Order booklets, brochures, manuals and wiro bound print from Holo Print with artwork support, local collection and delivery.',
    h1: 'Booklet and brochure printing',
    schemaTypes: ['Product', 'BreadcrumbList', 'FAQPage', 'WebPage'],
    productName: 'Booklets & Brochures',
    ogImage: `${SITE_URL}/images/hero-slide-2.svg`,
  },
  '/all-products': {
    title: 'All Print Products | Holo Print',
    metaDescription: 'Browse Holo Print products including business cards, flyers, leaflets, posters, booklets, signage, stickers, labels and stationery.',
    h1: 'All print products',
    schemaTypes: ['CollectionPage', 'BreadcrumbList', 'WebPage'],
    ogImage: DEFAULT_IMAGE,
  },
  '/bespoke-quote': {
    title: 'Bespoke Print Quote | Holo Print',
    metaDescription: 'Request a bespoke print quote for custom sizes, signage, special finishes, artwork help, bulk print orders and unusual production jobs.',
    h1: 'Bespoke print quote',
    schemaTypes: ['Service', 'FAQPage', 'WebPage'],
    ogImage: DEFAULT_IMAGE,
  },
};

function cleanPath(value) {
  const clean = String(value || '/').split('?')[0].split('#')[0] || '/';
  return clean.startsWith('/') ? clean : `/${clean}`;
}

function canonicalFor(path) {
  const clean = cleanPath(path);
  return `${SITE_URL}${clean === '/' ? '' : clean}`;
}

function socialFor(meta) {
  return {
    ogTitle: meta.ogTitle || meta.title,
    ogDescription: meta.ogDescription || meta.metaDescription,
    ogImage: meta.ogImage || meta.twitterImage || DEFAULT_IMAGE,
    twitterTitle: meta.twitterTitle || meta.ogTitle || meta.title,
    twitterDescription: meta.twitterDescription || meta.ogDescription || meta.metaDescription,
    twitterImage: meta.twitterImage || meta.ogImage || DEFAULT_IMAGE,
    twitterCard: meta.twitterCard || 'summary_large_image',
  };
}

function schemaFor(meta) {
  const nodes = [
    { '@type': 'WebSite', '@id': `${SITE_URL}#website`, name: 'Holo Print', url: SITE_URL },
    { '@type': 'Organization', '@id': `${SITE_URL}#organization`, name: 'Holo Print', url: SITE_URL, logo: DEFAULT_IMAGE },
    { '@type': meta.schemaTypes?.includes('CollectionPage') ? 'CollectionPage' : 'WebPage', '@id': `${meta.canonicalUrl}#webpage`, url: meta.canonicalUrl, name: meta.title, description: meta.metaDescription },
  ];
  if (meta.schemaTypes?.includes('Product')) {
    nodes.push({ '@type': 'Product', '@id': `${meta.canonicalUrl}#product`, name: meta.productName || meta.h1 || meta.title, description: meta.metaDescription, brand: { '@type': 'Brand', name: 'Holo Print' }, image: meta.ogImage || DEFAULT_IMAGE, offers: { '@type': 'Offer', priceCurrency: 'GBP', availability: 'https://schema.org/InStock', url: meta.canonicalUrl } });
  }
  return { '@context': 'https://schema.org', '@graph': nodes };
}

function fallbackFor(path) {
  const clean = cleanPath(path);
  const base = FALLBACK_META[clean] || FALLBACK_META['/'];
  const meta = { found: false, path: clean, canonicalUrl: canonicalFor(clean), robots: 'index,follow', twitterCard: 'summary_large_image', ...base };
  return { ...meta, ...socialFor(meta), schemaJsonLd: schemaFor(meta) };
}

function embeddedSeoForPath(path) {
  if (typeof document === 'undefined') return null;
  const element = document.getElementById('holo-seo-ssr-data');
  if (!element?.textContent) return null;
  try {
    const meta = JSON.parse(element.textContent);
    if (cleanPath(meta.path || '/') !== cleanPath(path)) return null;
    return { ...meta, ...socialFor(meta), schemaJsonLd: meta.schemaJsonLd || schemaFor(meta), fromStaticHtml: true };
  } catch {
    return null;
  }
}

function setMetaByName(name, content) {
  if (!content) return;
  let element = document.head.querySelector(`meta[name="${name}"]`);
  if (!element) { element = document.createElement('meta'); element.setAttribute('name', name); document.head.appendChild(element); }
  element.setAttribute('content', content);
}

function setMetaByProperty(property, content) {
  if (!content) return;
  let element = document.head.querySelector(`meta[property="${property}"]`);
  if (!element) { element = document.createElement('meta'); element.setAttribute('property', property); document.head.appendChild(element); }
  element.setAttribute('content', content);
}

function setLink(rel, href) {
  if (!href) return;
  let element = document.head.querySelector(`link[rel="${rel}"]`);
  if (!element) { element = document.createElement('link'); element.setAttribute('rel', rel); document.head.appendChild(element); }
  element.setAttribute('href', href);
}

function setJsonLd(json) {
  let element = document.head.querySelector('#holo-seo-jsonld');
  if (!element) { element = document.createElement('script'); element.id = 'holo-seo-jsonld'; element.type = 'application/ld+json'; document.head.appendChild(element); }
  element.textContent = JSON.stringify(json || {}, null, 2);
}

function applySeo(rawMeta) {
  const meta = { ...rawMeta, ...socialFor(rawMeta) };
  document.title = meta.title || 'Holo Print';
  setMetaByName('description', meta.metaDescription);
  setMetaByName('robots', meta.robots || 'index,follow');
  setLink('canonical', meta.canonicalUrl || canonicalFor(meta.path));
  setMetaByProperty('og:site_name', 'Holo Print');
  setMetaByProperty('og:type', meta.schemaTypes?.includes('Product') ? 'product' : 'website');
  setMetaByProperty('og:title', meta.ogTitle);
  setMetaByProperty('og:description', meta.ogDescription);
  setMetaByProperty('og:url', meta.canonicalUrl || canonicalFor(meta.path));
  setMetaByProperty('og:image', meta.ogImage);
  setMetaByName('twitter:card', meta.twitterCard);
  setMetaByName('twitter:title', meta.twitterTitle);
  setMetaByName('twitter:description', meta.twitterDescription);
  setMetaByName('twitter:image', meta.twitterImage);
  setJsonLd(meta.schemaJsonLd || schemaFor(meta));
  window.dispatchEvent(new CustomEvent('holo-seo-updated', { detail: meta }));
}

function envBaseUrl() {
  return import.meta.env.VITE_SEO_API_BASE || import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_INTERNAL_API_BASE_URL || '';
}

function apiBases() {
  const adapterBase = window.storefront?._config?.baseUrl || window.__STORE_FRONT_INTERNAL_BASE_URL__ || window.__SAAS_INTERNAL_BASE_URL__ || '';
  return [envBaseUrl(), adapterBase, ''].filter((value, index, arr) => arr.indexOf(value) === index).map((value) => String(value || '').replace(/\/$/, ''));
}

function apiCandidates(path) {
  const explicit = import.meta.env.VITE_SEO_RESOLVE_URL;
  const encoded = encodeURIComponent(path);
  return [
    explicit ? `${explicit}${explicit.includes('?') ? '&' : '?'}path=${encoded}` : null,
    ...apiBases().flatMap((base) => [
      `${base}/api/internal/seo/resolve?path=${encoded}`,
      `${base}/seo/resolve?path=${encoded}`,
    ]),
  ].filter(Boolean);
}

function redirectCandidates(path) {
  const explicit = import.meta.env.VITE_SEO_REDIRECT_URL;
  const encoded = encodeURIComponent(path);
  return [
    explicit ? `${explicit}${explicit.includes('?') ? '&' : '?'}path=${encoded}` : null,
    ...apiBases().flatMap((base) => [
      `${base}/api/internal/seo/redirect?path=${encoded}`,
      `${base}/seo/redirect?path=${encoded}`,
    ]),
  ].filter(Boolean);
}

async function resolveSeo(path) {
  const embedded = embeddedSeoForPath(path);
  if (embedded?.title) return embedded;
  for (const url of apiCandidates(path)) {
    try {
      const response = await fetch(url, { cache: 'no-store', credentials: 'include' });
      const payload = await response.json().catch(() => null);
      const data = payload?.data || payload;
      if (response.ok && data?.title) return data;
    } catch {}
  }
  return fallbackFor(path);
}

async function resolveRedirect(path) {
  for (const url of redirectCandidates(path)) {
    try {
      const response = await fetch(url, { cache: 'no-store', credentials: 'include' });
      const payload = await response.json().catch(() => null);
      const data = payload?.data || null;
      if (response.ok && data?.fromPath) return data;
    } catch {}
  }
  return null;
}

function applyRedirect(redirect, path) {
  if (!redirect || !redirect.isActive) return false;
  if (Number(redirect.statusCode) === 410) {
    const meta = fallbackFor(path);
    applySeo({ ...meta, title: 'Page removed | Holo Print', metaDescription: 'This page has been removed or replaced. Browse Holo Print products or request a quote for help.', h1: 'Page removed', robots: 'noindex,nofollow', found: true, status: 'gone' });
    return true;
  }
  const target = cleanPath(redirect.toPath || '/');
  if (target && target !== cleanPath(path)) {
    window.location.replace(target);
    return true;
  }
  return false;
}

export async function getStorefrontSeo(path) {
  return resolveSeo(cleanPath(path));
}

export async function getStorefrontRedirect(path) {
  return resolveRedirect(cleanPath(path));
}

export function initStorefrontSeo() {
  let lastPath = '';
  let requestId = 0;
  const update = async () => {
    const path = cleanPath(window.location.pathname || '/');
    if (path === lastPath) return;
    lastPath = path;
    const id = ++requestId;
    const embedded = embeddedSeoForPath(path);
    if (embedded?.title) applySeo(embedded);
    const redirect = await resolveRedirect(path);
    if (id !== requestId) return;
    if (applyRedirect(redirect, path)) return;
    if (!embedded?.title) applySeo(fallbackFor(path));
    const remote = await resolveSeo(path);
    if (id === requestId) applySeo(remote);
  };
  const originalPushState = window.history.pushState;
  const originalReplaceState = window.history.replaceState;
  window.history.pushState = function patchedPushState(...args) { const result = originalPushState.apply(this, args); window.dispatchEvent(new Event('holo-route-change')); return result; };
  window.history.replaceState = function patchedReplaceState(...args) { const result = originalReplaceState.apply(this, args); window.dispatchEvent(new Event('holo-route-change')); return result; };
  window.addEventListener('popstate', update);
  window.addEventListener('holo-route-change', update);
  update();
}
