import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const distDir = path.join(root, 'dist');
const indexPath = path.join(distDir, 'index.html');
const siteUrl = String(process.env.VITE_STOREFRONT_URL || process.env.STOREFRONT_URL || 'https://holoprint.co.uk').replace(/\/$/, '');
const adminBase = String(process.env.VITE_SEO_API_BASE || process.env.VITE_ADMIN_BASE_URL || process.env.VITE_INTERNAL_STOREFRONT_BASE_URL || process.env.VITE_INTERNAL_API_BASE || process.env.VITE_API_URL || '').replace(/\/$/, '');
const exportUrl = process.env.SEO_STATIC_EXPORT_URL || (adminBase ? `${adminBase}/api/internal/seo/static` : '');

const FALLBACK_PAGES = [
  {
    path: '/',
    title: 'Holo Print | Design, Print, Sign and Web in Sidcup',
    metaDescription: 'Holo Print offers business cards, flyers, leaflets, posters, banners, stickers, shop boards, booklets, design support and local print services in Sidcup.',
    h1: 'Design, print, sign and web support in Sidcup',
    canonicalUrl: siteUrl,
    robots: 'index,follow',
    ogTitle: 'Holo Print | Design, Print, Sign and Web in Sidcup',
    ogDescription: 'Order print online from Holo Print for business cards, flyers, posters, booklets, signage, stickers, artwork support and local collection.',
    ogImage: `${siteUrl}/images/hero-slide-1.svg`,
    twitterTitle: 'Holo Print | Design, Print, Sign and Web in Sidcup',
    twitterDescription: 'Business cards, flyers, leaflets, signage, stickers, booklets, design support and local print services in Sidcup.',
    twitterImage: `${siteUrl}/images/hero-slide-1.svg`,
    twitterCard: 'summary_large_image',
    schemaJsonLd: { '@context': 'https://schema.org', '@graph': [{ '@type': 'WebSite', name: 'Holo Print', url: siteUrl }, { '@type': 'Organization', name: 'Holo Print', url: siteUrl }] },
  },
  {
    path: '/standard-business-cards',
    title: 'Business Cards Printing | Holo Print Sidcup',
    metaDescription: 'Order professional business cards from Holo Print. Choose paper, finish, quantity and artwork support with local collection or delivery.',
    h1: 'Business cards printing',
    canonicalUrl: `${siteUrl}/standard-business-cards`,
    robots: 'index,follow',
    ogTitle: 'Business Cards Printing | Holo Print Sidcup',
    ogDescription: 'Order professional business cards from Holo Print with artwork support, collection and delivery options.',
    ogImage: `${siteUrl}/images/business-card-front.svg`,
    twitterCard: 'summary_large_image',
    schemaJsonLd: { '@context': 'https://schema.org', '@graph': [{ '@type': 'WebPage', name: 'Business Cards Printing | Holo Print Sidcup', url: `${siteUrl}/standard-business-cards` }, { '@type': 'Product', name: 'Business Cards', brand: { '@type': 'Brand', name: 'Holo Print' } }] },
  },
  {
    path: '/flyers',
    title: 'Flyers & Leaflets Printing | Holo Print',
    metaDescription: 'Print flyers and leaflets online with Holo Print. Ideal for menus, promotions, events and local business marketing.',
    h1: 'Flyers and leaflets printing',
    canonicalUrl: `${siteUrl}/flyers`,
    robots: 'index,follow',
    ogTitle: 'Flyers & Leaflets Printing | Holo Print',
    ogDescription: 'Order flyers and leaflets online with artwork support, local collection and delivery.',
    ogImage: `${siteUrl}/images/flyer-front.svg`,
    twitterCard: 'summary_large_image',
    schemaJsonLd: { '@context': 'https://schema.org', '@graph': [{ '@type': 'WebPage', name: 'Flyers & Leaflets Printing | Holo Print', url: `${siteUrl}/flyers` }, { '@type': 'Product', name: 'Flyers & Leaflets', brand: { '@type': 'Brand', name: 'Holo Print' } }] },
  },
];

// These are app routes that must hard-refresh correctly on static hosts.
// SEO pages above get rich metadata; these routes get a safe SPA index fallback when no SEO export writes them.
const SPA_REFRESH_ROUTES = [
  '/',
  '/same-day-printing',
  '/standard-business-cards',
  '/business-cards',
  '/flyers',
  '/posters-large-format-prints',
  '/posters',
  '/booklets',
  '/labels',
  '/stationery',
  '/signage',
  '/packaging',
  '/all-products',
  '/bespoke-quote',
  '/quote',
  '/cart',
  '/checkout',
  '/account',
  '/login',
  '/auth',
  '/artwork-upload',
  '/collection-pass',
  '/contact',
];

function cleanPath(value = '/') {
  const clean = String(value || '/').split('?')[0].split('#')[0] || '/';
  return clean.startsWith('/') ? clean : `/${clean}`;
}

function escapeAttr(value = '') {
  return String(value || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeJson(value) {
  return JSON.stringify(value || {}).replace(/</g, '\\u003c');
}

function absoluteImage(value = '') {
  const raw = String(value || '').trim();
  if (!raw) return `${siteUrl}/images/hero-slide-1.svg`;
  if (/^https?:\/\//i.test(raw)) return raw;
  return `${siteUrl}${raw.startsWith('/') ? raw : `/${raw}`}`;
}

function canonicalFor(page) {
  const clean = cleanPath(page.path);
  return page.canonicalUrl || `${siteUrl}${clean === '/' ? '' : clean}`;
}

function headFor(page) {
  const canonical = canonicalFor(page);
  const title = page.title || 'Holo Print';
  const description = page.metaDescription || page.description || 'Design, print, sign and web support from Holo Print.';
  const robots = page.robots || (page.noIndex ? 'noindex,nofollow' : 'index,follow');
  const ogTitle = page.ogTitle || title;
  const ogDescription = page.ogDescription || description;
  const ogImage = absoluteImage(page.ogImage || page.twitterImage);
  const twitterTitle = page.twitterTitle || ogTitle;
  const twitterDescription = page.twitterDescription || ogDescription;
  const twitterImage = absoluteImage(page.twitterImage || ogImage);
  const twitterCard = page.twitterCard || 'summary_large_image';
  const schema = page.schemaJsonLd || { '@context': 'https://schema.org', '@graph': [{ '@type': 'WebPage', name: title, url: canonical, description }] };
  const embedded = { ...page, canonicalUrl: canonical, robots, ogTitle, ogDescription, ogImage, twitterTitle, twitterDescription, twitterImage, twitterCard, schemaJsonLd: schema, staticRendered: true };
  return [
    '<!-- HOLO_STATIC_SEO_START -->',
    `<title>${escapeAttr(title)}</title>`,
    `<meta name="description" content="${escapeAttr(description)}" />`,
    `<meta name="robots" content="${escapeAttr(robots)}" />`,
    `<link rel="canonical" href="${escapeAttr(canonical)}" />`,
    '<meta property="og:site_name" content="Holo Print" />',
    `<meta property="og:type" content="${(page.schemaTypes || []).includes('Product') ? 'product' : 'website'}" />`,
    `<meta property="og:title" content="${escapeAttr(ogTitle)}" />`,
    `<meta property="og:description" content="${escapeAttr(ogDescription)}" />`,
    `<meta property="og:url" content="${escapeAttr(canonical)}" />`,
    `<meta property="og:image" content="${escapeAttr(ogImage)}" />`,
    `<meta name="twitter:card" content="${escapeAttr(twitterCard)}" />`,
    `<meta name="twitter:title" content="${escapeAttr(twitterTitle)}" />`,
    `<meta name="twitter:description" content="${escapeAttr(twitterDescription)}" />`,
    `<meta name="twitter:image" content="${escapeAttr(twitterImage)}" />`,
    `<script id="holo-seo-jsonld" type="application/ld+json">${escapeJson(schema)}</script>`,
    `<script id="holo-seo-ssr-data" type="application/json">${escapeJson(embedded)}</script>`,
    '<!-- HOLO_STATIC_SEO_END -->',
  ].join('\n    ');
}

function stripOldSeo(html) {
  return html
    .replace(/\s*<!-- HOLO_STATIC_SEO_START -->[\s\S]*?<!-- HOLO_STATIC_SEO_END -->/g, '')
    .replace(/\s*<title>[\s\S]*?<\/title>/gi, '')
    .replace(/\s*<meta\s+name=["']description["'][^>]*>/gi, '')
    .replace(/\s*<meta\s+name=["']robots["'][^>]*>/gi, '')
    .replace(/\s*<link\s+rel=["']canonical["'][^>]*>/gi, '')
    .replace(/\s*<meta\s+property=["']og:[^"']+["'][^>]*>/gi, '')
    .replace(/\s*<meta\s+name=["']twitter:[^"']+["'][^>]*>/gi, '')
    .replace(/\s*<script\s+id=["']holo-seo-jsonld["'][\s\S]*?<\/script>/gi, '')
    .replace(/\s*<script\s+id=["']holo-seo-ssr-data["'][\s\S]*?<\/script>/gi, '');
}

function injectSeo(html, page) {
  const stripped = stripOldSeo(html);
  return stripped.replace('</head>', `    ${headFor(page)}\n  </head>`);
}

async function fetchExport() {
  if (!exportUrl) return null;
  const url = `${exportUrl}${exportUrl.includes('?') ? '&' : '?'}limit=${encodeURIComponent(process.env.SEO_STATIC_LIMIT || '1000')}`;
  const response = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`SEO static export failed: ${response.status}`);
  const payload = await response.json();
  const pages = payload?.data?.pages || payload?.pages || [];
  return Array.isArray(pages) ? pages : [];
}

async function writeRoute(baseHtml, page) {
  const clean = cleanPath(page.path);
  const html = injectSeo(baseHtml, { ...page, path: clean });
  if (clean === '/') {
    await fs.writeFile(indexPath, html, 'utf8');
    return indexPath;
  }
  const routeDir = path.join(distDir, clean.replace(/^\//, ''));
  await fs.mkdir(routeDir, { recursive: true });
  const routeIndex = path.join(routeDir, 'index.html');
  await fs.writeFile(routeIndex, html, 'utf8');
  return routeIndex;
}

async function writeSpaRefreshRoute(baseHtml, route) {
  const clean = cleanPath(route);
  if (clean === '/') return null;
  const routeDir = path.join(distDir, clean.replace(/^\//, ''));
  const routeIndex = path.join(routeDir, 'index.html');
  try {
    await fs.access(routeIndex);
    return null;
  } catch {}
  await fs.mkdir(routeDir, { recursive: true });
  await fs.writeFile(routeIndex, baseHtml, 'utf8');
  return routeIndex;
}

async function writeStaticHostFallbacks(baseHtml) {
  await fs.writeFile(path.join(distDir, '404.html'), baseHtml, 'utf8');
  await fs.writeFile(path.join(distDir, '_redirects'), '/* /index.html 200\n', 'utf8');
}

async function main() {
  const baseHtml = await fs.readFile(indexPath, 'utf8');
  let pages = [];
  try {
    pages = await fetchExport() || [];
  } catch (error) {
    console.warn(`[seo-prerender] ${error.message}`);
  }
  if (!pages.length) pages = FALLBACK_PAGES;
  const unique = new Map();
  for (const page of pages) {
    const clean = cleanPath(page.path);
    if (!clean || clean.startsWith('/api')) continue;
    unique.set(clean, { ...page, path: clean });
  }
  let count = 0;
  for (const page of unique.values()) {
    await writeRoute(baseHtml, page);
    count += 1;
  }

  let spaCount = 0;
  for (const route of SPA_REFRESH_ROUTES) {
    const written = await writeSpaRefreshRoute(baseHtml, route);
    if (written) spaCount += 1;
  }
  await writeStaticHostFallbacks(baseHtml);
  console.log(`[seo-prerender] Wrote ${count} static SEO HTML route(s) and ${spaCount} SPA refresh fallback route(s).`);
}

main().catch((error) => {
  console.warn(`[seo-prerender] skipped: ${error.message}`);
});
