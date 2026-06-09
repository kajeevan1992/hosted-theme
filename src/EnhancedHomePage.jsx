import React, { useEffect, useState } from 'react';
import { ArrowRight, Check, ChevronRight, HeartHandshake, Package, Search, ShieldCheck, Sparkles, Star, Truck, Upload } from 'lucide-react';
import StorefrontChrome from './components/StorefrontChrome';
import { Input } from '@/components/ui/input';

const BRAND = {
  bg: '#F7F8FC',
  line: '#E3E8F0',
  ink: '#161A22',
  muted: '#667487',
  primary: '#18A7D0',
  primaryDark: '#127B98',
  accent: '#7B3FE4',
};

const heroSlides = [
  {
    eyebrow: 'Professional print solutions',
    title: 'Design, print, sign and web support for local businesses.',
    body: 'A polished Holo Print storefront for business cards, flyers, booklets, posters, signage, stationery, artwork help and collection support.',
    image: '/images/hero-slide-1.svg',
  },
  {
    eyebrow: 'Fast local print support',
    title: 'Order online, upload artwork and request quotes with confidence.',
    body: 'Browse products, choose options, send artwork later or ask for bespoke print advice before production.',
    image: '/images/hero-slide-2.svg',
  },
  {
    eyebrow: 'Built for business growth',
    title: 'A cleaner print shop experience for repeat customers and trade work.',
    body: 'Useful for local businesses, event teams, designers, agencies and customers who need regular print support.',
    image: '/images/hero-slide-3.svg',
  },
];

const popularProducts = [
  { title: 'Business Cards', text: 'Premium cards for teams, networking and brand launches.', image: '/images/business-card-front.svg', path: '/standard-business-cards', price: 'From £21.99' },
  { title: 'Flyers & Leaflets', text: 'Handouts, menus and local marketing print.', image: '/images/flyer-front.svg', path: '/flyers', price: 'From £18.40' },
  { title: 'Booklet Printing', text: 'Brochures, programmes, manuals and stitched print.', image: '/images/hero-slide-2.svg', path: '/booklets', price: 'Quote ready' },
  { title: 'Posters & Large Format', text: 'Window posters, events and display graphics.', image: '/images/poster-main.svg', path: '/posters-large-format-prints', price: 'From £8.49' },
  { title: 'Stationery', text: 'Letterheads, slips, NCR pads and office essentials.', image: '/images/hero-slide-1.svg', path: '/stationery', price: 'Quote ready' },
];

const eventProducts = [
  { title: 'Roller Banners', image: '/images/poster-main.svg', path: '/signage', price: 'Quote ready' },
  { title: 'Event Flyers', image: '/images/flyer-front.svg', path: '/flyers', price: 'From £18.40' },
  { title: 'Outdoor Banners', image: '/images/hero-slide-3.svg', path: '/signage', price: 'Quote ready' },
  { title: 'Custom Posters', image: '/images/poster-main.svg', path: '/posters-large-format-prints', price: 'From £8.49' },
];

const helpBlogs = [
  { title: 'How to prepare artwork for print', text: 'Bleed, safe margins and PDF setup made simple before upload.', image: '/images/hero-slide-1.svg' },
  { title: 'Flyers, posters or banners?', text: 'Pick the right product for promotions, events and shop windows.', image: '/images/flyer-front.svg' },
  { title: 'When to request a bespoke quote', text: 'Use quotes for custom sizes, special finishes and larger quantities.', image: '/images/hero-slide-3.svg' },
  { title: 'Local collection made easier', text: 'Order online and collect once your job is approved and produced.', image: '/images/business-card-front.svg' },
];

function navigate(path) {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new Event('locationchange'));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function Shell({ children, className = '' }) {
  return <div className={`mx-auto w-full max-w-[1360px] px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>;
}

function PrimaryButton({ children, onClick }) {
  return <button onClick={onClick} className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-[12px] font-black text-white shadow-[0_12px_28px_rgba(24,167,208,0.24)]" style={{ backgroundColor: BRAND.primary }}>{children}</button>;
}

function SecondaryButton({ children, onClick }) {
  return <button onClick={onClick} className="inline-flex items-center gap-2 rounded-full border bg-white px-5 py-3 text-[12px] font-black" style={{ borderColor: BRAND.line, color: BRAND.ink }}>{children}</button>;
}

function SectionHeading({ eyebrow, title, body, action }) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <div className="text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: BRAND.primary }}>{eyebrow}</div>
        <h2 className="mt-2 max-w-[760px] text-[30px] font-black leading-[1.02] tracking-[-0.045em]" style={{ color: BRAND.ink }}>{title}</h2>
        {body ? <p className="mt-3 max-w-[740px] text-[13px] leading-7" style={{ color: BRAND.muted }}>{body}</p> : null}
      </div>
      {action}
    </div>
  );
}

function ProductCard({ item, compact = false }) {
  return (
    <button onClick={() => navigate(item.path)} className="group rounded-[22px] border bg-white p-4 text-left shadow-[0_16px_36px_rgba(0,0,0,0.05)] transition hover:-translate-y-[2px] hover:shadow-[0_22px_50px_rgba(0,0,0,0.08)]" style={{ borderColor: BRAND.line }}>
      <div className="overflow-hidden rounded-[16px] bg-[#F4F7FA]">
        <img src={item.image} alt={item.title} className={`${compact ? 'h-36' : 'h-48'} w-full object-cover transition duration-500 group-hover:scale-[1.04]`} />
      </div>
      <div className="mt-4 text-[16px] font-black tracking-[-0.03em]" style={{ color: BRAND.ink }}>{item.title}</div>
      {item.text ? <p className="mt-2 min-h-[42px] text-[12px] leading-6" style={{ color: BRAND.muted }}>{item.text}</p> : null}
      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="text-[12px] font-bold" style={{ color: BRAND.ink }}>{item.price}</span>
        <span className="inline-flex items-center gap-1 text-[12px] font-black" style={{ color: BRAND.primary }}>View <ChevronRight className="h-4 w-4" /></span>
      </div>
    </button>
  );
}

function Hero() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setActive((value) => (value + 1) % heroSlides.length), 4800);
    return () => clearInterval(timer);
  }, []);
  const slide = heroSlides[active];
  return (
    <section className="relative overflow-hidden border-b" style={{ borderColor: BRAND.line, background: 'linear-gradient(135deg, rgba(24,167,208,0.10) 0%, rgba(123,63,228,0.06) 58%, rgba(255,200,61,0.08) 100%)' }}>
      <Shell className="py-10 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <div className="inline-flex rounded-full bg-white/80 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: BRAND.primary }}>{slide.eyebrow}</div>
            <h1 className="mt-5 max-w-[720px] text-[46px] font-black leading-[0.94] tracking-[-0.065em] sm:text-[66px]" style={{ color: BRAND.ink }}>{slide.title}</h1>
            <p className="mt-5 max-w-[620px] text-[14px] leading-7" style={{ color: BRAND.muted }}>{slide.body}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <PrimaryButton onClick={() => navigate('/all-products')}>Browse products <ArrowRight className="h-4 w-4" /></PrimaryButton>
              <SecondaryButton onClick={() => navigate('/bespoke-quote')}>Request bespoke quote</SecondaryButton>
            </div>
            <div className="mt-6 flex gap-2">
              {heroSlides.map((_, index) => <button key={index} onClick={() => setActive(index)} className="h-2 rounded-full transition-all" style={{ width: active === index ? 28 : 8, backgroundColor: active === index ? BRAND.primary : '#D6DFE7' }} />)}
            </div>
          </div>
          <div className="relative">
            <div className="rounded-[32px] border bg-white/74 p-4 shadow-[0_30px_90px_rgba(0,0,0,0.10)] backdrop-blur" style={{ borderColor: 'rgba(255,255,255,0.7)' }}>
              <img src={slide.image} alt={slide.title} className="h-[360px] w-full rounded-[24px] object-cover" />
            </div>
          </div>
        </div>
      </Shell>
    </section>
  );
}

export default function EnhancedHomePage() {
  return (
    <StorefrontChrome currentPath="/">
      <Hero />

      <section className="py-6">
        <Shell>
          <div className="grid gap-4 md:grid-cols-4">
            {[
              [ShieldCheck, 'Excellent print checks', 'Artwork, file and finish guidance before production.'],
              [Truck, 'Fast turnaround', 'Express options for urgent jobs and local collections.'],
              [Package, 'Business ready', 'Useful for repeat orders, bulk jobs and trade support.'],
              [Sparkles, 'Bespoke quote support', 'Custom sizes, special finishes and production advice.'],
            ].map(([Icon, title, text]) => (
              <div key={title} className="rounded-[22px] border bg-white p-5 shadow-[0_14px_30px_rgba(0,0,0,0.04)]" style={{ borderColor: BRAND.line }}>
                <Icon className="h-5 w-5" style={{ color: BRAND.primary }} />
                <div className="mt-4 text-[15px] font-black" style={{ color: BRAND.ink }}>{title}</div>
                <p className="mt-2 text-[12px] leading-6" style={{ color: BRAND.muted }}>{text}</p>
              </div>
            ))}
          </div>
        </Shell>
      </section>

      <section className="py-8">
        <Shell>
          <SectionHeading eyebrow="Why choose Holo Print" title="A local print partner for businesses, events and everyday customers." body="This section adds the trust and service depth from the reference homepage, but keeps the Holo Print tone: clean, blue, rounded and professional." />
          <div className="grid gap-5 md:grid-cols-3">
            {[
              ['Built for business, charities, schools and events', 'Order essentials online or request help for more complex jobs.', '/images/hero-slide-1.svg'],
              ['Real print-shop support, not just online checkout', 'Use bespoke quote routes when size, material or artwork needs advice.', '/images/hero-slide-2.svg'],
              ['Products grouped around how customers buy', 'Cards, flyers, signage, stationery and event print are easier to browse.', '/images/hero-slide-3.svg'],
              ['Calmer customer journey', 'Clear sections, fewer dead ends and better paths to quote, cart and artwork upload.', '/images/business-card-front.svg'],
              ['Trusted by repeat customers', 'Prepare for business accounts, trade support and saved repeat jobs later.', '/images/flyer-front.svg'],
              ['Simple local collection flow', 'Built around store collection, dispatch clarity and print approval steps.', '/images/poster-main.svg'],
            ].map(([title, text, image]) => (
              <div key={title} className="rounded-[22px] border bg-white p-4 shadow-[0_16px_36px_rgba(0,0,0,0.05)]" style={{ borderColor: BRAND.line }}>
                <img src={image} alt={title} className="h-52 w-full rounded-[16px] object-cover" />
                <div className="mt-4 text-[17px] font-black tracking-[-0.03em]" style={{ color: BRAND.ink }}>{title}</div>
                <p className="mt-2 text-[12px] leading-6" style={{ color: BRAND.muted }}>{text}</p>
              </div>
            ))}
          </div>
        </Shell>
      </section>

      <section className="py-8">
        <Shell>
          <SectionHeading eyebrow="Popular products" title="Popular print products for business, trade and events" action={<SecondaryButton onClick={() => navigate('/all-products')}>View all products</SecondaryButton>} />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {popularProducts.map((item) => <ProductCard key={item.title} item={item} compact />)}
          </div>
        </Shell>
      </section>

      <section className="py-8">
        <Shell>
          <div className="overflow-hidden rounded-[30px] border shadow-[0_24px_70px_rgba(0,0,0,0.08)]" style={{ borderColor: BRAND.line, background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.primaryDark} 55%, #EFFBFE 55%, #FFFFFF 100%)` }}>
            <div className="grid gap-8 p-8 md:grid-cols-[1fr_1.1fr] md:p-10 lg:p-12">
              <div className="flex flex-col justify-center text-white">
                <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/75">New trade customer?</div>
                <h2 className="mt-3 max-w-[560px] text-[36px] font-black leading-[1] tracking-[-0.05em]">Business print support for repeat orders and larger projects.</h2>
                <p className="mt-4 max-w-[560px] text-[13px] leading-7 text-white/85">Prepare the homepage for trade accounts, regular reorder customers, local designers, schools, charities, restaurants and event organisers.</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <button onClick={() => navigate('/bespoke-quote')} className="rounded-full bg-white px-5 py-3 text-[12px] font-black" style={{ color: BRAND.ink }}>Request trade quote</button>
                  <button onClick={() => navigate('/account')} className="rounded-full border border-white/50 px-5 py-3 text-[12px] font-black text-white">Account area</button>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {['Repeat ordering', 'Bulk quote support', 'Artwork help', 'Local collection'].map((item) => (
                  <div key={item} className="rounded-[22px] border bg-white/88 p-5 shadow-[0_16px_40px_rgba(0,0,0,0.08)]" style={{ borderColor: 'rgba(255,255,255,0.65)' }}>
                    <Check className="h-5 w-5" style={{ color: BRAND.primary }} />
                    <div className="mt-4 text-[16px] font-black" style={{ color: BRAND.ink }}>{item}</div>
                    <p className="mt-2 text-[12px] leading-6" style={{ color: BRAND.muted }}>Ready to connect into your admin dashboard later.</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Shell>
      </section>

      <section className="py-8">
        <Shell>
          <SectionHeading eyebrow="Event print essentials" title="Everything needed for launches, exhibitions, campaigns and local events" />
          <div className="grid gap-5 lg:grid-cols-[1.05fr_1fr]">
            <button onClick={() => navigate('/signage')} className="group overflow-hidden rounded-[26px] border bg-white text-left shadow-[0_18px_48px_rgba(0,0,0,0.06)]" style={{ borderColor: BRAND.line }}>
              <div className="bg-[linear-gradient(135deg,#18A7D0,#7B3FE4)] p-6 text-white">
                <div className="inline-flex rounded-full bg-white/18 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em]">Hero pick</div>
                <div className="mt-4 text-[34px] font-black tracking-[-0.05em]">Signs, banners and event displays</div>
                <p className="mt-3 max-w-[520px] text-[13px] leading-7 text-white/82">A stronger block for promoting high-value signage and event print without changing your brand colours.</p>
              </div>
              <img src="/images/poster-main.svg" alt="Event print" className="h-72 w-full object-cover" />
            </button>
            <div className="grid gap-5 sm:grid-cols-2">
              {eventProducts.map((item) => <ProductCard key={item.title} item={{ ...item, text: 'Useful for events, launches and promotional displays.' }} compact />)}
            </div>
          </div>
        </Shell>
      </section>

      <section className="py-8" style={{ background: 'linear-gradient(180deg,#FFFFFF 0%,#F3F7FA 100%)' }}>
        <Shell>
          <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-center">
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: BRAND.primary }}>Print more, save more</div>
              <h2 className="mt-3 text-[36px] font-black tracking-[-0.05em]" style={{ color: BRAND.ink }}>Bulk, repeat and quote-friendly ordering blocks.</h2>
              <p className="mt-4 max-w-[760px] text-[13px] leading-7" style={{ color: BRAND.muted }}>Use the homepage to push customers toward higher value orders: repeat business cards, event bundles, signage packs, seasonal campaigns and bespoke quote requests.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <PrimaryButton onClick={() => navigate('/bespoke-quote')}>Plan my print bundle</PrimaryButton>
                <SecondaryButton onClick={() => navigate('/all-products')}>Browse categories</SecondaryButton>
              </div>
            </div>
            <div className="rounded-[28px] border bg-white p-6 text-center shadow-[0_18px_44px_rgba(0,0,0,0.06)]" style={{ borderColor: BRAND.line }}>
              <div className="text-[58px] font-black tracking-[-0.08em]" style={{ color: BRAND.primary }}>B2B</div>
              <p className="mt-2 text-[13px] leading-6" style={{ color: BRAND.muted }}>Built for repeat customers, trade support and account workflows later.</p>
            </div>
          </div>
        </Shell>
      </section>

      <section className="py-8">
        <Shell>
          <SectionHeading eyebrow="Trending help" title="Print tips, product guidance and ideas" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {helpBlogs.map((item) => (
              <div key={item.title} className="rounded-[22px] border bg-white p-4 shadow-[0_14px_30px_rgba(0,0,0,0.04)]" style={{ borderColor: BRAND.line }}>
                <img src={item.image} alt={item.title} className="h-40 w-full rounded-[16px] object-cover" />
                <div className="mt-4 text-[15px] font-black" style={{ color: BRAND.ink }}>{item.title}</div>
                <p className="mt-2 text-[12px] leading-6" style={{ color: BRAND.muted }}>{item.text}</p>
              </div>
            ))}
          </div>
        </Shell>
      </section>

      <section className="py-8">
        <Shell>
          <div className="overflow-hidden rounded-[30px] border bg-white shadow-[0_22px_60px_rgba(0,0,0,0.06)]" style={{ borderColor: BRAND.line }}>
            <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="p-8 lg:p-10">
                <div className="text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: BRAND.primary }}>Community print support</div>
                <h2 className="mt-3 text-[34px] font-black tracking-[-0.05em]" style={{ color: BRAND.ink }}>Support for charity, school and community projects.</h2>
                <p className="mt-4 text-[13px] leading-7" style={{ color: BRAND.muted }}>A softer homepage block for local projects, fundraising events, community campaigns and education print enquiries.</p>
                <div className="mt-6"><SecondaryButton onClick={() => navigate('/bespoke-quote')}>Contact us</SecondaryButton></div>
              </div>
              <div className="flex items-center justify-center bg-[linear-gradient(135deg,#EAF7FC,#F8FBFF)] p-8">
                <div className="rounded-full border bg-white p-8 text-center shadow-[0_18px_44px_rgba(0,0,0,0.06)]" style={{ borderColor: BRAND.line }}>
                  <HeartHandshake className="mx-auto h-16 w-16" style={{ color: BRAND.primary }} />
                  <div className="mt-4 text-[26px] font-black tracking-[-0.05em]" style={{ color: BRAND.ink }}>Local support</div>
                </div>
              </div>
            </div>
          </div>
        </Shell>
      </section>

      <section className="py-8">
        <Shell>
          <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: BRAND.primary }}>Online printing services</div>
              <h2 className="mt-3 text-[34px] font-black tracking-[-0.05em]" style={{ color: BRAND.ink }}>Order online with local print-shop support.</h2>
              <div className="mt-5 grid gap-3">
                {['Choose the right product and quantity', 'Upload artwork now or after order approval', 'Request quote support for custom jobs', 'Collect locally or arrange delivery'].map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-[16px] border bg-white px-4 py-3 text-[13px] font-semibold" style={{ borderColor: BRAND.line, color: BRAND.ink }}><Check className="h-4 w-4" style={{ color: BRAND.primary }} />{item}</div>
                ))}
              </div>
            </div>
            <div className="rounded-[26px] border bg-white p-6 shadow-[0_18px_44px_rgba(0,0,0,0.06)]" style={{ borderColor: BRAND.line }}>
              <Upload className="h-8 w-8" style={{ color: BRAND.primary }} />
              <div className="mt-4 text-[22px] font-black tracking-[-0.04em]" style={{ color: BRAND.ink }}>Stay updated with print tips, offers and ideas</div>
              <p className="mt-2 text-[12px] leading-6" style={{ color: BRAND.muted }}>Newsletter block ready for later connection.</p>
              <div className="mt-5 flex gap-2">
                <Input className="h-11 rounded-full border text-[12px]" placeholder="Email address" style={{ borderColor: BRAND.line }} />
                <button className="rounded-full bg-black px-5 text-[12px] font-black text-white">Join</button>
              </div>
            </div>
          </div>
        </Shell>
      </section>
    </StorefrontChrome>
  );
}
