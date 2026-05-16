export const fallbackProductsBySlug = {
  'standard-business-cards': {
    id: 'fallback-standard-business-cards',
    slug: 'standard-business-cards',
    name: 'Standard Business Cards',
    description: 'Professional business cards with premium stock, flexible quantities and fast turnaround. This fallback keeps the storefront product page live while backend product hydration is unavailable.',
    price: '£11.13',
    gallery: [
      '/images/business-card-front.svg',
      '/images/flyer-front.svg',
      '/images/poster-main.svg',
    ],
    badges: ['Premium quality', 'Fast turnaround', 'Artwork support'],
    optionGroups: [
      {
        key: 'size',
        label: 'Size',
        style: 'grid',
        valueLabel: '85 x 55mm',
        options: [
          { value: '85 x 55mm', recommended: true },
          { value: '90 x 55mm' },
          { value: 'Square' },
          { value: 'Rounded Corners' },
        ],
      },
      {
        key: 'paper',
        label: 'Paper Type',
        style: 'grid',
        valueLabel: '350gsm Silk',
        options: [
          { value: '350gsm Silk', recommended: true },
          { value: '450gsm Silk' },
          { value: 'Uncoated' },
        ],
      },
      {
        key: 'finish',
        label: 'Finishing',
        style: 'grid',
        valueLabel: 'Matt Lamination',
        options: [
          { value: 'No Lamination' },
          { value: 'Matt Lamination', recommended: true },
          { value: 'Gloss Lamination' },
          { value: 'Soft-touch Lamination' },
        ],
      },
      {
        key: 'turnaround',
        label: 'Turnaround',
        style: 'pill',
        valueLabel: '3-4 Working Days',
        options: [
          { value: '1 Working Day' },
          { value: '3-4 Working Days', recommended: true },
          { value: 'Express' },
        ],
      },
    ],
    pricingRows: [
      { qty: '100', price: 11.13 },
      { qty: '250', price: 16.99, recommended: true },
      { qty: '500', price: 21.99 },
      { qty: '1,000', price: 27.99 },
      { qty: '2,500', price: 43.99 },
      { qty: '5,000', price: 85.99 },
    ],
    deliveryOptions: [
      { day: 'Monday April 27', latest: 'Latest Tuesday April 28', selected: true },
      { day: 'Thursday April 23', latest: 'Latest Friday April 24', addon: '+ £1.00' },
      { day: 'Wednesday April 22', latest: 'Latest Thursday April 23', addon: '+ £2.00' },
    ],
    tabs: [
      {
        label: 'Product Details',
        content: 'Create lasting connections with professional business cards. Choose from multiple paper weights, finishes and quantities.',
      },
      {
        label: 'Artwork Guide',
        content: 'Upload CMYK artwork with 3mm bleed, outlined fonts and images above 300 DPI.',
      },
      {
        label: 'FAQ',
        content: 'Need help with artwork or custom sizes? Contact our team before ordering.',
      },
    ],
  },
};

export function getFallbackProduct(slug) {
  return fallbackProductsBySlug[slug] || null;
}

export default fallbackProductsBySlug;
