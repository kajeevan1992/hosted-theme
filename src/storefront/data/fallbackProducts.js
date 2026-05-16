export const fallbackProductsBySlug = {
  'standard-business-cards': {
    id: 'fallback-standard-business-cards',
    slug: 'standard-business-cards',
    name: 'Standard Business Cards',
    description: 'Professional business cards with premium stock, flexible quantities and fast turnaround. This fallback mirrors the API option-group shape so the storefront never shows old fake Size/Paper/Finish groups.',
    price: '£11.13',
    gallery: [
      '/images/business-card-front.svg',
      '/images/flyer-front.svg',
      '/images/poster-main.svg',
    ],
    badges: ['Premium quality', 'Fast turnaround', 'Artwork support'],
    metadataJson: {
      optionGroups: [
        {
          key: 'quantity',
          label: 'Quantity',
          displayType: 'quantity-grid',
          sortOrder: 10,
          values: [
            { value: '100', label: '100', recommended: true },
            { value: '250', label: '250' },
            { value: '500', label: '500' },
            { value: '1000', label: '1,000' },
            { value: '2500', label: '2,500' },
            { value: '5000', label: '5,000' },
          ],
        },
        {
          key: 'paper-size',
          label: 'Paper Size',
          displayType: 'cards',
          sortOrder: 20,
          values: [
            { value: 'SRA3', label: 'SRA3', recommended: true },
            { value: 'SRA2', label: 'SRA2' },
          ],
        },
        {
          key: 'finished-size',
          label: 'Finished Size',
          displayType: 'cards',
          sortOrder: 30,
          values: [
            { value: '85 x 55mm', label: '85 x 55mm', recommended: true },
            { value: '90 x 55mm', label: '90 x 55mm' },
          ],
        },
        {
          key: 'paper-type',
          label: 'Paper Type',
          displayType: 'cards',
          sortOrder: 40,
          values: [
            { value: '350gsm Silk', label: '350gsm Silk', recommended: true },
            { value: '450gsm Silk', label: '450gsm Silk' },
            { value: 'Uncoated', label: 'Uncoated' },
          ],
        },
        {
          key: 'print-type',
          label: 'Print Type',
          displayType: 'pill',
          sortOrder: 50,
          values: [
            { value: 'Single Sided', label: 'Single Sided' },
            { value: 'Double Sided', label: 'Double Sided', recommended: true },
          ],
        },
        {
          key: 'turnaround',
          label: 'Turnaround',
          displayType: 'pill',
          sortOrder: 60,
          values: [
            { value: '1 Working Day', label: '1 Working Day' },
            { value: '3-4 Working Days', label: '3-4 Working Days', recommended: true },
            { value: 'Express', label: 'Express' },
          ],
        },
        {
          key: 'print-page-number',
          label: 'Print Page Number',
          displayType: 'pill',
          sortOrder: 70,
          values: [
            { value: 'Single Sided', label: 'Single Sided' },
            { value: 'Double Sided', label: 'Double Sided', recommended: true },
          ],
        },
        {
          key: 'lamination',
          label: 'Lamination',
          displayType: 'pill',
          sortOrder: 80,
          values: [
            { value: 'No Lamination', label: 'No Lamination', recommended: true },
            { value: 'Matt Lamination', label: 'Matt Lamination' },
            { value: 'Gloss Lamination', label: 'Gloss Lamination' },
            { value: 'Soft-Touch Lamination', label: 'Soft-Touch Lamination' },
          ],
        },
        {
          key: 'cover',
          label: 'Cover',
          displayType: 'pill',
          sortOrder: 90,
          values: [
            { value: 'No Cover', label: 'No Cover', recommended: true },
            { value: 'Printed Cover', label: 'Printed Cover' },
          ],
        },
        {
          key: 'fold-type',
          label: 'Fold Type',
          displayType: 'pill',
          sortOrder: 100,
          values: [
            { value: 'No Fold', label: 'No Fold', recommended: true },
            { value: 'Half Fold', label: 'Half Fold' },
            { value: 'Tri Fold', label: 'Tri Fold' },
          ],
        },
        {
          key: 'print-orientation',
          label: 'Print Orientation',
          displayType: 'pill',
          sortOrder: 110,
          values: [
            { value: 'Portrait', label: 'Portrait' },
            { value: 'Landscape', label: 'Landscape', recommended: true },
          ],
        },
        {
          key: 'product-finishing',
          label: 'Product Finishing',
          displayType: 'pill',
          sortOrder: 120,
          values: [
            { value: 'None', label: 'None', recommended: true },
            { value: 'Rounded Corners', label: 'Rounded Corners' },
            { value: 'Foil', label: 'Foil' },
          ],
        },
        {
          key: 'cut-type',
          label: 'Cut Type',
          displayType: 'pill',
          sortOrder: 130,
          values: [
            { value: 'Straight Cut', label: 'Straight Cut', recommended: true },
            { value: 'Rounded Corners', label: 'Rounded Corners' },
          ],
        },
        {
          key: 'sets',
          label: 'Sets',
          displayType: 'pill',
          sortOrder: 140,
          values: [
            { value: '1 Set', label: '1 Set', recommended: true },
            { value: '2 Sets', label: '2 Sets' },
            { value: '4 Sets', label: '4 Sets' },
          ],
        },
        {
          key: 'spotuv',
          label: 'SpotUV',
          displayType: 'pill',
          sortOrder: 150,
          values: [
            { value: 'No SpotUV', label: 'No SpotUV', recommended: true },
            { value: 'Single Sided SpotUV', label: 'Single Sided SpotUV' },
            { value: 'Double Sided SpotUV', label: 'Double Sided SpotUV' },
          ],
        },
      ],
      pricingMatrix: {
        rows: [
          { quantity: '100', price: 11.13, options: { quantity: '100' } },
          { quantity: '250', price: 16.99, options: { quantity: '250' } },
          { quantity: '500', price: 21.99, options: { quantity: '500' } },
          { quantity: '1000', price: 27.99, options: { quantity: '1000' } },
          { quantity: '2500', price: 43.99, options: { quantity: '2500' } },
          { quantity: '5000', price: 85.99, options: { quantity: '5000' } },
        ],
      },
    },
    optionGroups: [],
    pricingRows: [
      { qty: '100', price: 11.13 },
      { qty: '250', price: 16.99, recommended: true },
      { qty: '500', price: 21.99 },
      { qty: '1000', price: 27.99 },
      { qty: '2500', price: 43.99 },
      { qty: '5000', price: 85.99 },
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
