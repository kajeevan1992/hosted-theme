import { BLOCK_TYPES, PAGE_LAYOUTS, createBlock } from '../types/blockTypes';

export function createCategoryPagePayload(category = {}) {
  return {
    layout: PAGE_LAYOUTS.CATEGORY,

    seo: {
      title: category.name || 'Category',
      description: category.description || 'Professional print category storefront.',
    },

    category: {
      slug: category.slug,
      name: category.name,
    },

    blocks: [
      createBlock(BLOCK_TYPES.CATEGORY_HERO, {
        eyebrow: category.eyebrow || 'Print category',
        title: category.name || 'Print Products',
        description: category.description || 'Professional print products with premium finishes and fast turnaround.',
        image: category.heroImage || '/images/hero-slide-1.svg',
        ctaText: category.ctaText || 'Browse Products',
        ctaLink: category.ctaLink || '#',
      }),

      createBlock(BLOCK_TYPES.ANCHOR_NAV, {
        items: category.anchorLinks || [],
      }),

      createBlock(BLOCK_TYPES.PRODUCT_GRID, {
        eyebrow: 'Category products',
        title: category.gridTitle || `Browse ${category.name || 'products'}`,
        description: category.gridDescription || 'Explore configurable print products.',
        products: category.products || [],
      }),

      createBlock(BLOCK_TYPES.FAQ, {
        title: 'Frequently asked questions',
        description: category.faqText || 'Need help selecting products or artwork settings? Contact our team for support.',
      }),
    ],
  };
}

export default createCategoryPagePayload;
