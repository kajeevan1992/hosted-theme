import { BLOCK_TYPES } from './blockRegistry';

export const HOLO_HOME_LAYOUT = [
  {
    id: 'home-hero',
    type: BLOCK_TYPES.HERO,
    enabled: true,
    lockedDesign: true,
  },
  {
    id: 'home-category-strip',
    type: BLOCK_TYPES.CATEGORY_STRIP,
    enabled: true,
    lockedDesign: true,
  },
  {
    id: 'home-trust-badges',
    type: BLOCK_TYPES.TRUST_BADGES,
    enabled: true,
    lockedDesign: true,
  },
  {
    id: 'home-featured-products',
    type: BLOCK_TYPES.FEATURED_PRODUCTS,
    enabled: true,
    lockedDesign: true,
  },
  {
    id: 'home-testimonials',
    type: BLOCK_TYPES.TESTIMONIALS,
    enabled: true,
    lockedDesign: true,
  },
  {
    id: 'home-faq',
    type: BLOCK_TYPES.FAQ,
    enabled: true,
    lockedDesign: true,
  },
  {
    id: 'home-newsletter',
    type: BLOCK_TYPES.NEWSLETTER,
    enabled: true,
    lockedDesign: true,
  },
];

export const HOLO_PRODUCT_LAYOUT = [
  {
    id: 'product-gallery',
    type: BLOCK_TYPES.PRODUCT_GALLERY,
    enabled: true,
    lockedDesign: true,
  },
  {
    id: 'product-configurator',
    type: BLOCK_TYPES.PRODUCT_CONFIGURATOR,
    enabled: true,
    lockedDesign: true,
  },
  {
    id: 'product-delivery',
    type: BLOCK_TYPES.PRODUCT_DELIVERY,
    enabled: true,
    lockedDesign: true,
  },
  {
    id: 'product-specs',
    type: BLOCK_TYPES.PRODUCT_SPECS,
    enabled: true,
    lockedDesign: true,
  },
  {
    id: 'product-faq',
    type: BLOCK_TYPES.FAQ,
    enabled: true,
    lockedDesign: true,
  },
];

export const HOLO_CATEGORY_LAYOUT = [
  {
    id: 'category-hero',
    type: BLOCK_TYPES.HERO,
    enabled: true,
    lockedDesign: true,
  },
  {
    id: 'category-grid',
    type: BLOCK_TYPES.FEATURED_PRODUCTS,
    enabled: true,
    lockedDesign: true,
  },
  {
    id: 'category-faq',
    type: BLOCK_TYPES.FAQ,
    enabled: true,
    lockedDesign: true,
  },
];

export const HOLO_PAGE_LAYOUTS = {
  home: HOLO_HOME_LAYOUT,
  product: HOLO_PRODUCT_LAYOUT,
  category: HOLO_CATEGORY_LAYOUT,
};

export function getHoloLayout(pageType) {
  return HOLO_PAGE_LAYOUTS[pageType] || [];
}

export default HOLO_PAGE_LAYOUTS;
