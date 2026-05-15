export const BLOCK_TYPES = Object.freeze({
  HERO_BANNER: 'hero_banner',
  HERO_CAROUSEL: 'hero_carousel',
  TRUST_BAR: 'trust_bar',
  USP_BAR: 'usp_bar',
  SUPPORT_CALLOUT: 'support_callout',
  ANCHOR_NAV: 'anchor_nav',
  PRODUCT_GRID: 'product_grid',
  PROMO_CARD_GRID: 'promo_card_grid',
  RICH_TEXT: 'rich_text',
  FAQ: 'faq',
  CATEGORY_HERO: 'category_hero',
  PRODUCT_GALLERY: 'product_gallery',
  PRODUCT_CONFIGURATOR: 'product_configurator',
  PRODUCT_PRICE_SUMMARY: 'product_price_summary',
  PRODUCT_DELIVERY: 'product_delivery',
  RELATED_PRODUCTS: 'related_products',
});

export const PAGE_LAYOUTS = Object.freeze({
  HOME: 'home-v1',
  CATEGORY: 'category-v1',
  PRODUCT: 'product-v1',
  CMS: 'cms-v1',
});

export function createBlock(type, data = {}, settings = {}) {
  return {
    id: settings.id || `${type}-${Math.random().toString(36).slice(2, 9)}`,
    type,
    data,
    settings: {
      enabled: true,
      fullWidth: false,
      anchorId: '',
      ...settings,
    },
  };
}

export function isBlockEnabled(block) {
  return block?.settings?.enabled !== false;
}

export function blockAnchor(block) {
  return block?.settings?.anchorId || block?.id || undefined;
}
