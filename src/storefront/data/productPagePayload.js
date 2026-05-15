import { BLOCK_TYPES, PAGE_LAYOUTS, createBlock } from '../types/blockTypes';

export function createProductPagePayload(product = {}) {
  return {
    layout: PAGE_LAYOUTS.PRODUCT,
    seo: {
      title: product.name || 'Product',
      description: product.description || 'Professional print product configuration and ordering.',
    },

    product: {
      id: product.id,
      slug: product.slug,
      name: product.name,
    },

    blocks: [
      createBlock(BLOCK_TYPES.PRODUCT_GALLERY, {
        images: product.gallery || product.images || [
          '/images/business-card-front.svg',
          '/images/flyer-front.svg',
          '/images/poster-main.svg',
        ],
        badges: product.badges || ['Premium quality', 'Fast turnaround', 'Artwork support'],
      }),

      createBlock(BLOCK_TYPES.PRODUCT_CONFIGURATOR, {
        title: product.name || 'Configure your product',
        price: product.price || '£11.13',
        optionGroups: product.optionGroups || [],
      }),

      createBlock(BLOCK_TYPES.PRODUCT_PRICE_SUMMARY, {
        title: 'Choose your quantity',
        note: 'Live pricing powered by matrix pricing engine',
        rows: product.pricingRows || [
          { qty: '250', price: 11.13, recommended: true },
          { qty: '500', price: 18.42 },
          { qty: '1000', price: 27.95 },
        ],
      }),

      createBlock(BLOCK_TYPES.PRODUCT_DELIVERY, {
        title: 'Estimated delivery date',
        options: product.deliveryOptions || [
          {
            day: '1 Working Day',
            latest: 'Latest Tuesday April 28',
            addon: '+£12.00',
          },
          {
            day: '3-4 Working Days',
            latest: 'Latest Thursday April 30',
            selected: true,
          },
          {
            day: 'Express',
            latest: 'Latest Monday April 27',
            addon: '+£24.00',
          },
        ],
      }),

      createBlock(BLOCK_TYPES.PRODUCT_TABS, {
        tabs: product.tabs || [
          {
            label: 'Product Details',
            content: product.description || 'Professional print product with premium materials and fast turnaround.',
          },
          {
            label: 'Artwork Guide',
            content: 'Upload CMYK artwork with 3mm bleed and outlined fonts.',
          },
          {
            label: 'FAQ',
            content: 'Need help? Contact our support team for assistance.',
          },
        ],
      }),

      createBlock(BLOCK_TYPES.RELATED_PRODUCTS, {
        title: 'You may also like',
        products: product.relatedProducts || [],
      }),
    ],
  };
}

export default createProductPagePayload;
