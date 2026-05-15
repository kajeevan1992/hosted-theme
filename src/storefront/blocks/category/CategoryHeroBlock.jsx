import React from 'react';
import { ArrowRight } from 'lucide-react';

export function CategoryHeroBlock({ data = {} }) {
  return (
    <section className="overflow-hidden rounded-[32px] border border-[#E3E8F0] bg-white shadow-sm">
      <div className="grid gap-8 p-8 lg:grid-cols-[1fr_420px] lg:items-center lg:p-10">
        <div>
          <div className="text-[11px] font-black uppercase tracking-[0.18em] text-[#18A7D0]">
            {data.eyebrow || 'Print category'}
          </div>

          <h1 className="mt-4 text-5xl font-black tracking-[-0.055em] text-[#161A22]">
            {data.title || 'Print Products'}
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-8 text-[#667487]">
            {data.description || 'Explore professional print products with flexible options, fast turnaround and premium finish choices.'}
          </p>

          {data.ctaText ? (
            <a href={data.ctaLink || '#'} className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#18A7D0] px-6 py-3 text-sm font-black text-white shadow-[0_16px_36px_rgba(24,167,208,0.28)]">
              {data.ctaText}
              <ArrowRight size={16} />
            </a>
          ) : null}
        </div>

        <div className="rounded-[28px] bg-[#F7F8FC] p-6">
          <img src={data.image || '/images/hero-slide-1.svg'} alt={data.title || 'Category'} className="w-full rounded-[22px] object-cover" />
        </div>
      </div>
    </section>
  );
}

export default CategoryHeroBlock;
