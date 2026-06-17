import { applyCategoryContent, buildNavFromMenuItems, loadAdminMenuAndContent } from './admin-menu-content';

const DEV_INTERNAL_API_BASE = 'http://yccfmd4h13a1y6hi691si73r.13.61.22.39.sslip.io';

function getApiBaseCandidates() {
  const candidates = [import.meta.env.VITE_INTERNAL_STOREFRONT_BASE_URL, import.meta.env.VITE_INTERNAL_API_BASE, import.meta.env.VITE_ADMIN_BASE_URL, import.meta.env.VITE_API_URL, typeof window !== 'undefined' ? window.__HOLO_INTERNAL_API_BASE__ : '', typeof window !== 'undefined' ? window.__HOLO_STOREFRONT_API_BASE__ : '', typeof window !== 'undefined' ? window.localStorage?.getItem('holo:internal-api-base') : '', '', DEV_INTERNAL_API_BASE];
  return [...new Set(candidates.filter(Boolean).map((value) => String(value).replace(/\/$/, '')))];
}

function slugify(value = '') { return String(value || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''); }
function cleanSlug(value = '') { return slugify(String(value || '').replace(/^\/+/, '').replace(/\/+$/, '')); }

async function fetchJson(url) {
  const response = await fetch(url, { headers: { Accept: 'application/json' }, credentials: 'include', cache: 'no-store' });
  if (!response.ok) throw new Error(`${url} failed with ${response.status}`);
  const payload = await response.json().catch(() => null);
  if (!payload || payload.ok === false) throw new Error(payload?.error || `${url} returned an invalid payload`);
  return payload.data || payload;
}

function normalizeCategory(item, index = 0) {
  const name = item.name || item.title || item.slug || item.id;
  const slug = cleanSlug(item.slug || item.friendlyUrl || name);
  return { id: item.id || slug, slug, name, label: name, description: item.description || item.subtitle || '', path: `/${slug}`, thumbnail: item.thumbnail || item.image || '/images/hero-slide-2.svg', sortOrder: Number(item.sortOrder || index + 1), productCount: Number(item.productCount || 0), published: item.isActive !== false && item.published !== false };
}

function normalizeProduct(item, categoryById = new Map(), index = 0) {
  const name = item.name || item.title || item.slug || item.id;
  const slug = cleanSlug(item.slug || name);
  const category = categoryById.get(item.categoryId) || categoryById.get(item.categorySlug) || null;
  const categorySlug = cleanSlug(item.categorySlug || category?.slug || category?.name || 'all-products');
  const priceMinor = Number(item.priceFromMinor || item.pricing?.priceFromMinor || 0);
  const price = priceMinor > 0 ? `From £${(priceMinor / 100).toFixed(2)}` : item.price || item.priceLabel || 'Quote ready';
  return { id: item.id || slug, slug, categoryId: item.categoryId || category?.id || '', categorySlug, title: name, name, description: item.description || item.subtitle || 'Browse options, upload artwork or request support before ordering.', image: item.thumbnail || item.image || item.imageUrl || '/images/business-card-front.svg', path: `/${categorySlug}/${slug}`, legacyPath: `/${slug}`, price, sortOrder: Number(item.sortOrder || index + 1), published: item.isActive !== false && item.published !== false };
}

export async function loadAdminCatalog() {
  let lastError = null;
  for (const base of getApiBaseCandidates()) {
    try {
      const [categoriesData, productsData, menuAndContent] = await Promise.all([fetchJson(`${base}/api/internal/catalog/categories?limit=200`), fetchJson(`${base}/api/internal/catalog/products?limit=300`), loadAdminMenuAndContent(base)]);
      let categories = (categoriesData.items || []).map(normalizeCategory).filter((item) => item.published && item.slug);
      categories = applyCategoryContent(categories, menuAndContent.categoryContent);
      const byId = new Map();
      categories.forEach((category) => { byId.set(category.id, category); byId.set(category.slug, category); });
      const products = (productsData.items || []).map((item, index) => normalizeProduct(item, byId, index)).filter((item) => item.published && item.slug);
      return { categories, products, menuItems: menuAndContent.menuItems, categoryContent: menuAndContent.categoryContent, source: base };
    } catch (error) { lastError = error; }
  }
  throw lastError || new Error('Unable to load admin catalog');
}

export function groupProductsByCategory(products = []) {
  return products.reduce((acc, product) => { const key = product.categorySlug || 'all-products'; acc[key] = acc[key] || []; acc[key].push(product); return acc; }, {});
}

export function buildNavItemsFromAdminCatalog(catalog, fallbackItems = []) {
  const menuNav = buildNavFromMenuItems(catalog);
  if (menuNav?.length) return menuNav;
  const grouped = groupProductsByCategory(catalog?.products || []);
  const categories = (catalog?.categories || []).filter((category) => category.slug && category.slug !== 'all-products');
  if (!categories.length) return fallbackItems;
  const items = categories.slice(0, 9).map((category) => {
    const products = (grouped[category.slug] || []).slice(0, 12);
    const links = products.length ? products.map((product) => [product.title, product.path]) : [[`Browse ${category.name}`, category.path], ['Request quote', '/bespoke-quote']];
    return { label: category.name, path: category.path, feature: { title: category.content?.heroTitle || category.name, body: category.content?.heroIntro || category.description || `Browse ${category.name} products, upload artwork or request quote support.`, image: category.content?.heroImage || category.thumbnail || products[0]?.image || '/images/hero-slide-2.svg', cta: `View ${category.name}` }, columns: [{ title: 'Products', links: links.slice(0, 6) }, { title: 'More options', links: links.slice(6, 12).length ? links.slice(6, 12) : [['All products', '/all-products'], ['Bespoke quote', '/bespoke-quote']] }, { title: 'Support', links: [['Artwork help', '/artwork-upload'], ['Custom quote', '/bespoke-quote'], ['Cart', '/cart'], ['Contact', '/bespoke-quote']] }] };
  });
  items.push({ label: 'All Products', path: '/all-products', feature: { title: 'Explore the full catalog', body: 'Browse all admin-connected products and categories.', image: '/images/hero-slide-2.svg', cta: 'Shop all products' }, columns: [{ title: 'Categories', links: categories.slice(0, 8).map((category) => [category.name, category.path]) }, { title: 'Popular products', links: (catalog.products || []).slice(0, 8).map((product) => [product.title, product.path]) }, { title: 'Support', links: [['Bespoke quote', '/bespoke-quote'], ['Artwork upload', '/artwork-upload'], ['Cart', '/cart']] }] });
  return items;
}

export default { loadAdminCatalog, groupProductsByCategory, buildNavItemsFromAdminCatalog };
