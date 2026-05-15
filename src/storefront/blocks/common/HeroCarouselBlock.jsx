import React from 'react';
import { ArrowRight } from 'lucide-react';

const fallbackSlides = [
  {
    title: 'Premium print for growing brands',
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
];

export function HeroCarouselBlock({ data = {} }) {
  const slides = Array.isArray(data.slides) && data.slides.length ? data.slides : fallbackSlides;

  return (
    <section className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
      <div className="overflow-hidden rounded-[32px] bg-[#161A22] text-white shadow-[0_30px_80px_rgba(0,0,0,0.18)]">
        <div className="grid gap-10 p-8 lg:grid-cols-[1fr_440px] lg:items-center lg:p-12">
          <div>
            <div className="inline-flex rounded-full bg-white/10 px-4 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-[#6EE0FF]">
              {data.badge || 'Professional print solutions'}
            </div>
            <h1 className="mt-5 text-4xl font-black leading-tight tracking-[-0.05em] lg:text-6xl">
              {slides[0]?.title}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-white/80 lg:text-lg">
              {slides[0]?.subtitle}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a href={slides[0]?.ctaLink} className="inline-flex items-center gap-2 rounded-full bg-[#18A7D0] px-6 py-3 text-sm font-black text-white shadow-[0_16px_36px_rgba(24,167,208,0.35)] transition hover:-translate-y-[1px]">
                {slides[0]?.ctaText}
                <ArrowRight size={16} />
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 rounded-[28px] bg-gradient-to-br from-[#18A7D0]/20 to-[#7B3FE4]/20 blur-2xl" />
            <img src={slides[0]?.image} alt={slides[0]?.title} className="relative z-10 w-full rounded-[28px] border border-white/10 bg-white/5 p-4" />
          </div>
        </div>
      </div>

      <div className="grid gap-5">
        {slides.slice(1, 3).map((slide, index) => (
          <a key={`${slide.title}-${index}`} href={slide.ctaLink} className="group overflow-hidden rounded-[28px] border border-[#E3E8F0] bg-white shadow-sm transition hover:-translate-y-[2px] hover:shadow-[0_18px_44px_rgba(0,0,0,0.08)]">
            <img src={slide.image} alt={slide.title} className="h-44 w-full object-cover" />
            <div className="p-6">
              <h3 className="text-2xl font-black tracking-[-0.03em] text-[#161A22]">{slide.title}</h3>
              <p className="mt-3 text-sm leading-7 text-[#667487]">{slide.subtitle}</p>
              <div className="mt-5 inline-flex items-center gap-2 text-sm font-black text-[#18A7D0]">
                {slide.ctaText}
                <ArrowRight size={15} className="transition group-hover:translate-x-1" />
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

export default HeroCarouselBlock;
