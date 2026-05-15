import React, { useMemo } from 'react';
import { ArrowRight } from 'lucide-react';
import { productMatchesFilters, useCategoryFilters } from '../../hooks/useCategoryFilters';

const fallbackProducts = [
  {
    title: 'Standard Business Cards',
    price: 'From £11.13',
    image: '/images/business-card-front.svg',
    href: '/standard-business-cards',
    attributes: {
      size: ['85x55mm'],
      finish: ['matt'],
    },
  },
  {
    title: 'Flyers & Leaflets',
    price: 'From £18.50',
    image: '/images/flyer-front.svg',
    href: '/flyers',
    attributes: {
      size: ['a5'],
      finish: ['gloss'],
    },
  },
  {
    title: 'Large Format Posters',
    price: 'From £22.00',
    image: '/images/poster-main.svg',
    href: '/posters-large-format-prints',
    attributes: {
      size: ['a2'],
      finish: ['silk'],
    },
  },
  {
    title: 'Stapled Booklets',
    price: 'From £42.00',
    image: '/images/hero-slide-2.svg',
    href: '/booklets',
    attributes: {
      size: ['a4'],
      finish: ['matt'],
    },
  },
];

export function ProductGridBlock({ data = {} }) {
  const products = Array.isArray(data.products) && data.products.length ? data.products : fallbackProducts;
  const filterSource = Array.isArray(data.filters) ? data.filters : [];

  const { selected } = useCategoryFilters(filterSource);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => productMatchesFilters(product, selected));
  }, [products, selected]);

  return (
    <section>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-[11px] font-black uppercase tracking-[0.18em] text-[#18A7D0]">
            {data.eyebrow || 'Popular products'}
          </div>

          <h2 className="mt-3 text-4xl font-black tracking-[-0.04em] text-[#161A22]">
            {data.title || 'Discover our bestselling print products'}
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-8 text-[#667487]">
            {data.description || 'Reusable storefront product grid driven by backend block data and product sources.'}
          </p>
        </div>

        <div className="text-sm font-bold text-[#667487]">
          {filteredProducts.length} products
        </div>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {filteredProducts.map((product, index) => (
          <a
            key={`${product.title}-${index}`}
            href={product.href}
            className="group overflow-hidden rounded-[28px] border border-[#E3E8F0] bg-white shadow-sm transition hover:-translate-y-[2px] hover:shadow-[0_20px_48px_rgba(0,0,0,0.08)]"
          >
            <div className="aspect-[1/0.8] overflow-hidden bg-[#F7F8FC]">
              <img src={product.image} alt={product.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
            </div>

            <div className="p-6">
              <h3 className="text-xl font-black tracking-[-0.03em] text-[#161A22]">
                {product.title}
              </h3>

              <p className="mt-2 text-sm leading-7 text-[#667487]">
                {product.description || 'Premium quality print with fast turnaround and flexible options.'}
              </p>

              <div className="mt-5 flex items-center justify-between">
                <span className="text-sm font-black text-[#18A7D0]">{product.price}</span>

                <span className="inline-flex items-center gap-1 text-sm font-black text-[#161A22]">
                  View <ArrowRight size={15} />
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

export default ProductGridBlock;
