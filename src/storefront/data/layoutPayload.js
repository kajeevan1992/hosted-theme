export const storefrontLayoutPayload = {
  announcement: {
    enabled: true,
    message: 'Same day printing, signage and packaging solutions across London & the UK.',
    background: '#0F1012',
    textColor: '#ffffff',
  },

  navigation: {
    items: [
      {
        label: 'Business Cards',
        href: '/standard-business-cards',
      },
      {
        label: 'Flyers',
        href: '/flyers',
      },
      {
        label: 'Signage',
        href: '/signage',
        children: [
          { label: 'PVC Banners', href: '/pvc-banners' },
          { label: 'Foamex Boards', href: '/foamex-boards' },
        ],
      },
      {
        label: 'Packaging',
        href: '/packaging',
      },
      {
        label: 'All Products',
        href: '/all-products',
      },
    ],
  },

  footer: {
    columns: [
      {
        title: 'Products',
        links: [
          { label: 'Business Cards', href: '/standard-business-cards' },
          { label: 'Flyers', href: '/flyers' },
          { label: 'Posters', href: '/posters-large-format-prints' },
        ],
      },
      {
        title: 'Help',
        links: [
          { label: 'Artwork Guide', href: '/artwork-guide' },
          { label: 'Delivery', href: '/delivery' },
          { label: 'Contact', href: '/contact' },
        ],
      },
    ],

    copyright: '© HOLO PRINT. All rights reserved.',
  },
};

export default storefrontLayoutPayload;
