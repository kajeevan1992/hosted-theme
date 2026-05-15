function asArray(...values) {
  for (const value of values) {
    if (Array.isArray(value) && value.length) return value;
  }
  return [];
}

export function mapBackendCategoryToStorefrontPayload(category = {}) {
  const products = asArray(category.products, category.items).map((product) => ({
    title: product.name || product.title,
    description: product.description || '',
    price: product.displayPrice || product.price || '',
    image: product.thumbnail || product.image || '/images/business-card-front.svg',
    href: `/${product.slug}`,
  }));

  return {
    slug: category.slug,
    name: category.name || category.title || 'Print Products',
    description: category.description || 'Explore professional print products.',
    heroImage: category.heroImage || category.image,
    products,
    filters: asArray(category.filters),
    anchorLinks: asArray(category.anchorLinks),
    faqText: category.faqText,
  };
}

export default mapBackendCategoryToStorefrontPayload;
