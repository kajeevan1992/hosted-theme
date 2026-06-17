function cleanSlug(value = '') {
  return String(value || '').toLowerCase().trim().replace(/^\/+/, '').replace(/\/+$/, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

async function readJson(url) {
  const response = await fetch(url, { headers: { Accept: 'application/json' }, credentials: 'include', cache: 'no-store' });
  if (!response.ok) throw new Error(`Request failed ${response.status}`);
  const payload = await response.json().catch(() => ({}));
  if (payload?.ok === false) throw new Error(payload.error || 'Admin config request failed');
  return payload.data || payload;
}

export async function loadAdminMenuAndContent(base) {
  const [menuResult, contentResult] = await Promise.allSettled([
    readJson(`${base}/api/internal/config/storefront-menu-builder/items`),
    readJson(`${base}/api/internal/config/content-records/items`),
  ]);

  const menuItems = menuResult.status === 'fulfilled' && Array.isArray(menuResult.value.items)
    ? menuResult.value.items
        .map((item, index) => ({ ...item, id: item.id || `menu-${index}`, label: item.label || item.name || item.title || item.path, path: item.path || '/', enabled: item.enabled !== false, order: Number(item.order || index + 1) }))
        .filter((item) => item.enabled && item.label && item.path)
        .sort((a, b) => Number(a.order || 999) - Number(b.order || 999))
    : [];

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

export function buildNavFromMenuItems(catalog) {
  const menuItems = catalog?.menuItems || [];
  if (!menuItems.length) return null;
  const products = catalog?.products || [];
  return menuItems.slice(0, 10).map((item) => {
    const categorySlug = cleanSlug(item.categorySlug || item.path);
    const categoryProducts = products.filter((product) => product.categorySlug === categorySlug).slice(0, 8);
    const links = categoryProducts.length ? categoryProducts.map((product) => [product.title, product.path]) : [[item.label, item.path], ['Bespoke quote', '/bespoke-quote']];
    return { label: item.label, path: item.path, feature: { title: item.label, body: item.description || 'Browse products, upload artwork or request quote support.', image: item.imageUrl || categoryProducts[0]?.image || '/images/hero-slide-2.svg', cta: `View ${item.label}` }, columns: [{ title: 'Products', links: links.slice(0, 6) }, { title: 'Support', links: [['Artwork help', '/artwork-upload'], ['Custom quote', '/bespoke-quote'], ['Cart', '/cart']] }, { title: 'More', links: links.slice(6).length ? links.slice(6) : [['All products', '/all-products']] }] };
  });
}
