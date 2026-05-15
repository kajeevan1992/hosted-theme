import React from 'react';
import { ArrowRight } from 'lucide-react';

const fallbackProducts = [
  {
    title: 'Premium Business Cards',
    image: '/images/business-card-front.svg',
    href: '/standard-business-cards',
  },
  {
    title: 'Flyers & Leaflets',
    image: '/images/flyer-front.svg',
    href: '/flyers',
  },
  {
    title: 'Posters & Signage',
    image: '/images/poster-main.svg',
    href: '/posters-large-format-prints',
  },
];

export function RelatedProductsBlock({ data = {} }) {
  const products = Array.isArray(data.products) && data.products.length ? data.products : fallbackProducts;

  return (
    <section>
      <div className="flex items-end justify-between gap-5">
        <div>
          <div className="text-[11px] font-black uppercase tracking-[0.18em] text-[#18A7D0]">Related products</div>
          <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-[#161A22]">
            {data.title || 'You may also like'}
          </h2>
        </div>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {products.map((product, index) => (
          <a
            key={`${product.title}-${index}`}
            href={product.href}
            className="group overflow-hidden rounded-[28px] border border-[#E3E8F0] bg-white shadow-sm transition hover:-translate-y-[2px] hover:shadow-[0_20px_48px_rgba(0,0,0,0.08)]"
          >
            <div className="aspect-[1/0.72] overflow-hidden bg-[#F7F8FC]">
              <img src={product.image} alt={product.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
            </div>

            <div className="p-6">
              <h3 className="text-xl font-black tracking-[-0.03em] text-[#161A22]">{product.title}</h3>

              <div className="mt-5 inline-flex items-center gap-2 text-sm font-black text-[#18A7D0]">
                View product
                <ArrowRight size={15} className="transition group-hover:translate-x-1" />
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

export default RelatedProductsBlock;
