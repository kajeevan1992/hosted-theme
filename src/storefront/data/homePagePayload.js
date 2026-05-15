import { BLOCK_TYPES, PAGE_LAYOUTS, createBlock } from '../types/blockTypes';

export const homePagePayload = {
  layout: PAGE_LAYOUTS.HOME,
  seo: {
    title: 'HOLO PRINT | Professional Print & Signage',
    description: 'Business cards, flyers, posters, signage and packaging with fast UK delivery.',
  },
  blocks: [
    createBlock(BLOCK_TYPES.HERO_CAROUSEL, {
      badge: 'Professional print solutions',
      slides: [
        {
          title: 'Professional print for growing brands',
          subtitle: 'Business cards, flyers, packaging and signage with fast UK delivery.',
          image: '/images/hero-slide-1.svg',
          ctaText: 'Shop Business Cards',
          ctaLink: '/standard-business-cards',
        },
        {
          title: 'Same day printing available',
          subtitle: 'Urgent turnaround for events, retail launches and campaigns.',
          image: '/images/hero-slide-2.svg',
          ctaText: 'Explore Same Day',
          ctaLink: '/same-day-printing',
        },
        {
          title: 'Large format signage & posters',
          subtitle: 'Retail graphics, exhibition signage and indoor/outdoor display print.',
          image: '/images/poster-main.svg',
          ctaText: 'View Signage',
          ctaLink: '/signage',
        },
      ],
    }),

    createBlock(BLOCK_TYPES.TRUST_BAR, {
      title: 'Why businesses choose HOLO PRINT',
      items: [
        { label: 'Best price guaranteed' },
        { label: 'Premium quality printing' },
        { label: 'Fast UK turnaround' },
        { label: 'Artwork support included' },
      ],
    }),

    createBlock(BLOCK_TYPES.PRODUCT_GRID, {
      eyebrow: 'Popular products',
      title: 'Discover our bestselling print products',
      description: 'Flexible print solutions for brands, events, retail and promotional campaigns.',
      ctaText: 'Browse all products',
      ctaLink: '/all-products',
      products: [
        {
          title: 'Standard Business Cards',
          price: 'From £11.13',
          image: '/images/business-card-front.svg',
          href: '/standard-business-cards',
        },
        {
          title: 'Flyers & Leaflets',
          price: 'From £18.50',
          image: '/images/flyer-front.svg',
          href: '/flyers',
        },
        {
          title: 'Large Format Posters',
          price: 'From £22.00',
          image: '/images/poster-main.svg',
          href: '/posters-large-format-prints',
        },
        {
          title: 'Stapled Booklets',
          price: 'From £42.00',
          image: '/images/hero-slide-2.svg',
          href: '/booklets',
        },
      ],
    }),
  ],
};

export default homePagePayload;
