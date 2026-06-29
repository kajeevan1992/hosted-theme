function cleanSlug(value = '') {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/^\/+/, '')
    .replace(/\/+$/, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function queryParam(name) {
  if (typeof window === 'undefined') return '';
  return new URLSearchParams(window.location.search).get(name) || '';
}

function rememberValue(key, value) {
  if (typeof window === 'undefined') return value || '';
  if (value) window.localStorage?.setItem(key, value);
  return value || window.localStorage?.getItem(key) || '';
}

function menuContext() {
  return {
    tenantId: rememberValue('holo:tenantId', queryParam('tenantId')) || rememberValue('holo:tenant-id', queryParam('tenantId')),
    tenantSlug: rememberValue('holo:tenantSlug', queryParam('tenantSlug')) || rememberValue('holo:tenant-slug', queryParam('tenantSlug')),
    channelSlug: rememberValue('holo:channelSlug', queryParam('channelSlug') || queryParam('storeSlug')) || rememberValue('holo:channel-slug', queryParam('channelSlug') || queryParam('storeSlug')) || 'default-store',
  };
}

function normalisePath(value = '/') {
  const text = String(value || '').trim();
  if (!text) return '/';
  if (text.startsWith('http://') || text.startsWith('https://') || text.startsWith('mailto:') || text.startsWith('tel:')) return text;
  return text.startsWith('/') ? text : `/${text}`;
}

async function readJson(url) {
  const context = menuContext();
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      ...(context.tenantId || context.tenantSlug ? { 'X-Tenant-Id': context.tenantId || context.tenantSlug, 'X-Print-Tenant': context.tenantId || context.tenantSlug } : {}),
      ...(context.channelSlug ? { 'X-Site-Id': context.channelSlug, 'X-Print-Store': context.channelSlug } : {}),
    },
    credentials: 'include',
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(`Request failed ${response.status}`);
  const payload = await response.json().catch(() => ({}));
  if (payload?.ok === false) throw new Error(payload.error || 'Admin config request failed');
  return payload.data || payload;
}

function publicMenuUrl(base) {
  const context = menuContext();
  const params = new URLSearchParams();
  if (context.tenantId) params.set('tenantId', context.tenantId);
  if (context.tenantSlug) params.set('tenantSlug', context.tenantSlug);
  if (context.channelSlug) params.set('channelSlug', context.channelSlug);
  const query = params.toString();
  return `${base}/api/internal/storefront/menu-v2${query ? `?${query}` : ''}`;
}

function normaliseMenuItem(raw = {}, index = 0) {
  const label = raw.label || raw.name || raw.title || raw.menuLabel || raw.path || `Menu ${index + 1}`;
  return {
    ...raw,
    id: String(raw.id || raw.slug || raw.key || `menu-${index}`),
    slug: cleanSlug(raw.slug || label || raw.id || `menu-${index}`),
    label,
    path: normalisePath(raw.path || raw.href || raw.url || raw.link || '/'),
    enabled: raw.enabled !== false && raw.status !== 'hidden' && raw.status !== 'disabled',
    order: Number(raw.order || raw.sortOrder || raw.position || index + 1),
    parentId: String(raw.parentId || raw.parent || raw.parentKey || ''),
    parentSlug: cleanSlug(raw.parentSlug || raw.parentLabel || ''),
    group: raw.group || raw.column || raw.columnTitle || raw.menuGroup || 'Menu',
    description: raw.description || raw.featureBody || '',
    imageUrl: raw.imageUrl || raw.image || '',
    children: Array.isArray(raw.children)
      ? raw.children.map((child, childIndex) => normaliseMenuItem(child, childIndex)).filter((child) => child.enabled)
      : Array.isArray(raw.items)
        ? raw.items.map((child, childIndex) => normaliseMenuItem(child, childIndex)).filter((child) => child.enabled)
        : [],
  };
}

export async function loadAdminMenuAndContent(base) {
  const [publicMenuResult, legacyMenuResult, contentResult] = await Promise.allSettled([
    readJson(publicMenuUrl(base)),
    readJson(`${base}/api/internal/config/storefront-menu-builder/items`),
    readJson(`${base}/api/internal/config/content-records/items`),
  ]);

  const publicItems = publicMenuResult.status === 'fulfilled' && Array.isArray(publicMenuResult.value.items)
    ? publicMenuResult.value.items
    : [];
  const legacyItems = legacyMenuResult.status === 'fulfilled'
    ? (Array.isArray(legacyMenuResult.value.items) ? legacyMenuResult.value.items : Array.isArray(legacyMenuResult.value) ? legacyMenuResult.value : [])
    : [];

  const menuItems = (publicItems.length ? publicItems : legacyItems)
    .map(normaliseMenuItem)
    .filter((item) => item.enabled && item.label && item.path)
    .sort((a, b) => Number(a.order || 999) - Number(b.order || 999));

  const categoryContent = contentResult.status === 'fulfilled' && Array.isArray(contentResult.value.items)
    ? contentResult.value.items
        .filter((item) => item.kind === 'category' && (item.status === 'published' || item.published === true))
        .map((item) => ({ ...item, slug: cleanSlug(item.slug || item.canonicalPath || item.title) }))
        .filter((item) => item.slug)
    : [];

  return { menuItems, categoryContent };
}

export function applyCategoryContent(categories, categoryContent) {
  const bySlug = new Map((categoryContent || []).map((item) => [item.slug, item]));
  return categories.map((category) => {
    const content = bySlug.get(category.slug) || bySlug.get(`${category.slug}-category`);
    if (!content) return category;
    return { ...category, content, name: content.menuLabel || category.name, description: content.menuDescription || content.summary || category.description, thumbnail: content.heroImage || category.thumbnail };
  });
}

function linkFromItem(item) {
  if (Array.isArray(item)) return [String(item[0] || 'Untitled'), normalisePath(item[1] || '/')];
  return [String(item.label || item.name || item.title || item.path || 'Untitled'), normalisePath(item.path || item.href || item.url || item.link || '/')];
}

function uniqueChildren(children = []) {
  const seen = new Set();
  return children
    .filter((child) => child && child.enabled !== false && (child.label || child.name || child.title))
    .sort((a, b) => Number(a.order || 999) - Number(b.order || 999))
    .filter((child) => {
      const key = `${child.id || ''}|${child.slug || ''}|${child.label || ''}|${child.path || ''}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

export function buildNavFromMenuItems(catalog) {
  const menuItems = catalog?.menuItems || [];
  if (!menuItems.length) return null;

  const products = catalog?.products || [];
  const byParent = new Map();
  menuItems.forEach((item) => {
    if (!item.parentId && !item.parentSlug) return;
    [item.parentId, item.parentSlug].filter(Boolean).forEach((key) => {
      byParent.set(String(key), [...(byParent.get(String(key)) || []), item]);
    });
  });

  return menuItems
    .filter((item) => !item.parentId && !item.parentSlug)
    .slice(0, 10)
    .map((item) => {
      const categorySlug = cleanSlug(item.categorySlug || item.path);
      const categoryProducts = products.filter((product) => product.categorySlug === categorySlug).slice(0, 8);
      const children = uniqueChildren([
        ...(Array.isArray(item.children) ? item.children : []),
        ...(byParent.get(String(item.id)) || []),
        ...(byParent.get(String(item.slug)) || []),
        ...(byParent.get(cleanSlug(item.label)) || []),
      ]).filter((child) => String(child.id || '') !== String(item.id || '') && cleanSlug(child.label || '') !== cleanSlug(item.label || ''));

      const childLinks = children.map(linkFromItem);
      const productLinks = categoryProducts.map((product) => [product.title, product.path]);
      const primaryLinks = childLinks.length ? childLinks : productLinks;
      const columns = [];
      if (primaryLinks.length) columns.push({ title: childLinks.length ? 'Menu' : 'Products', links: primaryLinks.slice(0, 8) });
      columns.push({ title: 'Support', links: [['Artwork help', '/artwork-upload'], ['Custom quote', '/bespoke-quote'], ['Cart', '/cart']] });
      if (primaryLinks.slice(8).length) columns.push({ title: 'More', links: primaryLinks.slice(8, 16) });

      return {
        label: item.label,
        path: item.path,
        feature: {
          title: item.featureTitle || item.label,
          body: item.description || item.featureBody || 'Browse menu links.',
          image: item.imageUrl || item.image || categoryProducts[0]?.image || '/images/hero-slide-2.svg',
          cta: item.ctaLabel || `View ${item.label}`,
        },
        columns,
      };
    });
}
