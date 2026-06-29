function cleanSlug(value = '') {
  return String(value || '').toLowerCase().trim().replace(/^\/+/, '').replace(/\/+$/, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function queryParam(name) {
  if (typeof window === 'undefined') return '';
  return new URLSearchParams(window.location.search).get(name) || '';
}

function remember(key, value) {
  if (typeof window === 'undefined') return value || '';
  if (value) window.localStorage?.setItem(key, value);
  return value || window.localStorage?.getItem(key) || '';
}

function context() {
  return {
    tenantId: remember('holo:tenantId', queryParam('tenantId')) || remember('holo:tenant-id', queryParam('tenantId')),
    tenantSlug: remember('holo:tenantSlug', queryParam('tenantSlug')) || remember('holo:tenant-slug', queryParam('tenantSlug')),
    channelSlug: remember('holo:channelSlug', queryParam('channelSlug') || queryParam('storeSlug')) || remember('holo:channel-slug', queryParam('channelSlug') || queryParam('storeSlug')) || 'default-store',
  };
}

function path(value = '/') {
  const text = String(value || '').trim();
  if (!text) return '/';
  if (/^(https?:|mailto:|tel:)/i.test(text)) return text;
  return text.startsWith('/') ? text : `/${text}`;
}

function item(raw = {}, index = 0) {
  const label = raw.label || raw.name || raw.title || raw.menuLabel || raw.path || `Menu ${index + 1}`;
  return {
    ...raw,
    id: String(raw.id || raw.slug || raw.key || `menu-${index}`),
    slug: cleanSlug(raw.slug || label || raw.id || `menu-${index}`),
    label,
    path: path(raw.path || raw.href || raw.url || raw.link || '/'),
    enabled: raw.enabled !== false && raw.status !== 'hidden' && raw.status !== 'disabled',
    order: Number(raw.order || raw.sortOrder || raw.position || index + 1),
    parentId: String(raw.parentId || raw.parent || raw.parentKey || ''),
    parentSlug: cleanSlug(raw.parentSlug || raw.parentLabel || ''),
    group: raw.group || raw.column || raw.columnTitle || raw.menuGroup || 'Menu',
    description: raw.description || raw.featureBody || '',
    imageUrl: raw.imageUrl || raw.image || '',
    children: Array.isArray(raw.children) ? raw.children.map(item).filter((child) => child.enabled) : [],
  };
}

async function readPublicMenu(base) {
  const c = context();
  const params = new URLSearchParams();
  if (c.tenantId) params.set('tenantId', c.tenantId);
  if (c.tenantSlug) params.set('tenantSlug', c.tenantSlug);
  if (c.channelSlug) params.set('channelSlug', c.channelSlug);
  const response = await fetch(`${base}/api/internal/storefront/menu-v2?${params.toString()}`, {
    headers: {
      Accept: 'application/json',
      ...(c.tenantId || c.tenantSlug ? { 'X-Tenant-Id': c.tenantId || c.tenantSlug, 'X-Print-Tenant': c.tenantId || c.tenantSlug } : {}),
      ...(c.channelSlug ? { 'X-Site-Id': c.channelSlug, 'X-Print-Store': c.channelSlug } : {}),
    },
    credentials: 'omit',
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(`Menu request failed ${response.status}`);
  const payload = await response.json().catch(() => ({}));
  if (payload?.ok === false) throw new Error(payload.error || 'Menu request failed');
  return payload.data || payload;
}

export async function loadAdminMenuAndContent(base) {
  const data = await readPublicMenu(base);
  const raw = Array.isArray(data.items) ? data.items : [];
  const menuItems = raw.map(item).filter((row) => row.enabled && row.label && row.path).sort((a, b) => a.order - b.order);
  return { menuItems, categoryContent: [] };
}

export function applyCategoryContent(categories) {
  return categories;
}

function linkFromItem(row) {
  return [String(row.label || row.name || row.title || 'Menu item'), path(row.path || row.href || row.url || '/')];
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
  const byParent = new Map();
  menuItems.forEach((row) => {
    if (!row.parentId && !row.parentSlug) return;
    [row.parentId, row.parentSlug].filter(Boolean).forEach((key) => byParent.set(String(key), [...(byParent.get(String(key)) || []), row]));
  });
  return menuItems.filter((row) => !row.parentId && !row.parentSlug).slice(0, 10).map((row) => {
    const children = uniqueChildren([
      ...(Array.isArray(row.children) ? row.children : []),
      ...(byParent.get(String(row.id)) || []),
      ...(byParent.get(String(row.slug)) || []),
      ...(byParent.get(cleanSlug(row.label)) || []),
    ]).filter((child) => String(child.id || '') !== String(row.id || '') && cleanSlug(child.label || '') !== cleanSlug(row.label || ''));
    const childLinks = children.map(linkFromItem);
    const columns = [];
    if (childLinks.length) columns.push({ title: 'Menu', links: childLinks.slice(0, 8) });
    columns.push({ title: 'Support', links: [['Artwork help', '/artwork-upload'], ['Custom quote', '/bespoke-quote'], ['Cart', '/cart']] });
    return {
      label: row.label,
      path: row.path,
      feature: { title: row.label, body: row.description || 'Browse menu links.', image: row.imageUrl || row.image || '/images/hero-slide-2.svg', cta: `View ${row.label}` },
      columns,
    };
  });
}
