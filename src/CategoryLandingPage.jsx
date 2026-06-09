import React from 'react';
import { ChevronRight, HelpCircle, Search, ShieldCheck, Sparkles, Star } from 'lucide-react';
import StorefrontChrome from './components/StorefrontChrome';

const BRAND = {
  bg: '#F7F8FC',
  line: '#E3E8F0',
  ink: '#161A22',
  muted: '#667487',
  primary: '#18A7D0',
  primaryDark: '#127B98',
  accent: '#7B3FE4',
};

const sharedRelated = [
  { title: 'Standard Business Cards', image: '/images/business-card-front.svg', price: 'From £21.99', path: '/standard-business-cards' },
  { title: 'Premium Flyers', image: '/images/flyer-front.svg', price: 'From £18.40', path: '/flyers' },
  { title: 'Large Format Posters', image: '/images/poster-main.svg', price: 'From £8.49', path: '/posters-large-format-prints' },
  { title: 'Wiro Bound Booklets', image: '/images/hero-slide-2.svg', price: 'Quote ready', path: '/booklets' },
  { title: 'Labels & Stickers', image: '/images/hero-slide-3.svg', price: 'Quote ready', path: '/all-products' },
];

const categoryData = {
  '/flyers': {
    eyebrow: 'Flyers & leaflets',
    title: 'Flyers and leaflets for local promotions, menus and events.',
    intro: 'Choose from simple handouts, folded leaflets and promotional sheets with a cleaner category journey before checkout or quote approval.',
    image: '/images/flyer-front.svg',
    breadcrumb: 'Home / Categories / Flyers & Leaflets',
    groups: [
      {
        title: 'Printed flyers',
        description: 'Turn ideas into quick promotional print with compact product cards, clear pricing cues and simple artwork routes.',
        products: [
          { title: 'Budget Flyers', description: 'Simple handouts for everyday local marketing.', price: 'From £17.62', image: '/images/flyer-front.svg', path: '/flyers' },
          { title: 'Premium Flyers', description: 'Cleaner stock and stronger campaign presentation.', price: 'From £24.91', image: '/images/flyer-back.svg', path: '/flyers' },
          { title: 'A5 Flyer Printing', description: 'Popular size for menus, offers and events.', price: 'From £17.94', image: '/images/flyer-front.svg', path: '/flyers' },
          { title: 'Recycled Flyers', description: 'Eco-conscious promotional handouts.', price: 'From £15.75', image: '/images/hero-slide-3.svg', path: '/flyers' },
          { title: 'Same Day Flyers', description: 'Fast print option for urgent campaigns.', price: 'Quote ready', image: '/images/hero-slide-1.svg', path: '/bespoke-quote' },
        ],
      },
      {
        title: 'Printed leaflets',
        description: 'Folded and flat leaflet options for information packs, door drops, takeaway menus and local advertising.',
        products: [
          { title: 'Half Fold Leaflets', description: 'Simple folded layout for offers and menus.', price: 'From £23.55', image: '/images/hero-slide-2.svg', path: '/flyers' },
          { title: 'Roll Fold Leaflets', description: 'Useful for guides and information packs.', price: 'From £23.70', image: '/images/flyer-front.svg', path: '/flyers' },
          { title: 'Concertina Fold Leaflets', description: 'Structured panels for step-by-step content.', price: 'From £23.70', image: '/images/flyer-back.svg', path: '/flyers' },
          { title: 'Custom Folded Leaflets', description: 'For special sizes, folds and stock choices.', price: 'Quote ready', image: '/images/poster-main.svg', path: '/bespoke-quote' },
        ],
      },
      {
        title: 'Printed flat sheets',
        description: 'Simple flat sheets for inserts, handouts, letters and business communication.',
        products: [
          { title: 'Flat Sheet Printing', description: 'A4, A5 and custom sheet options.', price: 'Quote ready', image: '/images/poster-main.svg', path: '/bespoke-quote' },
          { title: 'Menu Sheets', description: 'Flat menus for restaurants and takeaways.', price: 'Quote ready', image: '/images/flyer-front.svg', path: '/flyers' },
          { title: 'Event Handouts', description: 'One-page programmes, maps and guides.', price: 'Quote ready', image: '/images/hero-slide-1.svg', path: '/bespoke-quote' },
        ],
      },
    ],
    seoTitle: 'Flyer and leaflet printing',
    seoBody: 'Flyers and leaflets remain a fast way to promote events, local offers, menus and campaigns. This layout keeps the current Holo Print look while giving customers clear category sections, product tiles and helpful guidance before they order.',
    blogs: [
      { title: 'Promote your business with leaflet distribution', body: 'Use flyers and leaflets to introduce services, offers and opening events locally.', image: '/images/flyer-front.svg' },
      { title: 'The advantage of door drop marketing', body: 'Simple printed campaigns can support digital activity and local visibility.', image: '/images/hero-slide-3.svg' },
    ],
    faqs: [
      'What is the difference between flyers and leaflets?',
      'Can I order folded leaflets?',
      'What flyer sizes are available?',
      'Can you help with artwork?',
      'Do you offer fast turnaround?',
    ],
  },
  '/stationery': {
    eyebrow: 'Business stationery',
    title: 'Stationery that keeps your brand consistent across every customer touchpoint.',
    intro: 'A cleaner category page for letterheads, compliment slips, notepads, NCR pads and branded office essentials.',
    image: '/images/hero-slide-1.svg',
    breadcrumb: 'Home / Categories / Stationery',
    groups: [
      {
        title: 'Office stationery',
        description: 'Core branded print for daily communication, quotes, invoices and customer packs.',
        products: [
          { title: 'Letterheads', description: 'Professional letterhead paper for business communication.', price: 'Quote ready', image: '/images/business-card-front.svg', path: '/bespoke-quote' },
          { title: 'Compliment Slips', description: 'Small branded slips for parcels and correspondence.', price: 'Quote ready', image: '/images/flyer-front.svg', path: '/bespoke-quote' },
          { title: 'NCR Pads', description: 'Duplicate and triplicate pads for orders and forms.', price: 'Quote ready', image: '/images/poster-main.svg', path: '/bespoke-quote' },
          { title: 'Notepads', description: 'Branded pads for desks, events and customer notes.', price: 'Quote ready', image: '/images/hero-slide-2.svg', path: '/bespoke-quote' },
        ],
      },
      {
        title: 'Branded essentials',
        description: 'Helpful add-ons for business packs, events and professional presentation.',
        products: [
          { title: 'Presentation Folders', description: 'Give quotes, documents and brochures a polished finish.', price: 'Quote ready', image: '/images/hero-slide-3.svg', path: '/bespoke-quote' },
          { title: 'Appointment Cards', description: 'Useful for clinics, salons, garages and service businesses.', price: 'Quote ready', image: '/images/business-card-front.svg', path: '/standard-business-cards' },
          { title: 'Envelopes', description: 'Match your letterheads and mailouts with brand details.', price: 'Quote ready', image: '/images/flyer-back.svg', path: '/bespoke-quote' },
        ],
      },
    ],
    seoTitle: 'Business stationery printing',
    seoBody: 'Stationery pages should help customers understand the range quickly: letterheads, pads, slips, forms and branded extras. The page keeps Holo Print styling while giving each product a clearer tile and short description.',
    blogs: [
      { title: 'How branded stationery builds trust', body: 'Small details make your quotes, invoices and handovers feel more professional.', image: '/images/hero-slide-1.svg' },
      { title: 'Stationery for new businesses', body: 'Start with letterheads, cards, slips and order pads, then add custom items as you grow.', image: '/images/business-card-front.svg' },
    ],
    faqs: ['Can you match my brand colours?', 'Can I order stationery bundles?', 'Do you print NCR pads?', 'Can you design my letterhead?', 'Do you offer repeat order pricing?'],
  },
  '/signage': {
    eyebrow: 'Signs & display',
    title: 'Signage and display print for shops, events and local promotions.',
    intro: 'Group boards, banners, posters and display products into a clearer shopping page while keeping the existing Holo Print design language.',
    image: '/images/poster-main.svg',
    breadcrumb: 'Home / Categories / Signage',
    groups: [
      {
        title: 'Display signage',
        description: 'Large-format products for retail, events, windows and directional display.',
        products: [
          { title: 'Foamex Boards', description: 'Rigid signs for indoor and short-term outdoor use.', price: 'Quote ready', image: '/images/poster-main.svg', path: '/bespoke-quote' },
          { title: 'PVC Banners', description: 'Outdoor banners for events, offers and shopfronts.', price: 'Quote ready', image: '/images/hero-slide-3.svg', path: '/bespoke-quote' },
          { title: 'Window Graphics', description: 'Promotional graphics and opening-hour vinyl.', price: 'Quote ready', image: '/images/hero-slide-1.svg', path: '/bespoke-quote' },
          { title: 'Roller Banners', description: 'Portable display stands for exhibitions and counters.', price: 'Quote ready', image: '/images/poster-main.svg', path: '/bespoke-quote' },
        ],
      },
      {
        title: 'Posters and promotion',
        description: 'Posters and campaign display pieces for high-street marketing.',
        products: [
          { title: 'A3 Posters', description: 'Small display posters for counters and windows.', price: 'From £8.49', image: '/images/poster-main.svg', path: '/posters-large-format-prints' },
          { title: 'A2 Posters', description: 'Larger promotional print for walls and events.', price: 'From £8.49', image: '/images/poster-main.svg', path: '/posters-large-format-prints' },
          { title: 'A1/A0 Posters', description: 'Big impact posters for displays and launch campaigns.', price: 'Quote ready', image: '/images/hero-slide-2.svg', path: '/posters-large-format-prints' },
        ],
      },
    ],
    seoTitle: 'Signage and display printing',
    seoBody: 'A stronger signage category page should help customers compare boards, posters, banners and display print before they send artwork or request a quote.',
    blogs: [
      { title: 'Choosing the right sign material', body: 'Foamex, PVC and poster materials all suit different indoor and outdoor uses.', image: '/images/poster-main.svg' },
      { title: 'Shopfront promotion ideas', body: 'Use posters, banners and window graphics to make offers visible from the street.', image: '/images/hero-slide-3.svg' },
    ],
    faqs: ['Can you print outdoor signs?', 'Which material should I choose?', 'Can you cut custom sizes?', 'Do you offer design help?', 'Can I collect signs locally?'],
  },
  '/booklets': {
    eyebrow: 'Booklets & brochures',
    title: 'Booklets, brochures and bound print with a more editorial category journey.',
    intro: 'Show stitched, folded, wiro and brochure-style products with clean tiles, descriptions and guidance.',
    image: '/images/hero-slide-2.svg',
    breadcrumb: 'Home / Categories / Booklets',
    groups: [
      {
        title: 'Booklet printing',
        description: 'Useful for brochures, menus, guides, lookbooks and business presentations.',
        products: [
          { title: 'Stapled Booklets', description: 'Classic saddle-stitched booklets for guides and brochures.', price: 'Quote ready', image: '/images/hero-slide-2.svg', path: '/booklets' },
          { title: 'Wiro Bound Booklets', description: 'Durable binding for manuals, menus and workbooks.', price: 'Quote ready', image: '/images/hero-slide-3.svg', path: '/booklets' },
          { title: 'Brochures', description: 'Promotional brochures for services and product ranges.', price: 'Quote ready', image: '/images/flyer-front.svg', path: '/booklets' },
          { title: 'Notebooks', description: 'Branded notebooks and internal business stationery.', price: 'Quote ready', image: '/images/hero-slide-1.svg', path: '/bespoke-quote' },
        ],
      },
    ],
    seoTitle: 'Booklet and brochure printing',
    seoBody: 'Booklets and brochures need more guidance than simple flat print. This page introduces product types, use cases and artwork help before quote or checkout.',
    blogs: [
      { title: 'Booklet setup checklist', body: 'Prepare page order, bleed, margins and cover options before sending artwork.', image: '/images/hero-slide-2.svg' },
      { title: 'Brochures for local businesses', body: 'A small brochure can explain services, prices and examples in one polished handout.', image: '/images/flyer-front.svg' },
    ],
    faqs: ['What booklet sizes are available?', 'Can you staple or wiro bind?', 'Do I need artwork as single pages?', 'Can you design my brochure?', 'How many pages can I print?'],
  },
  '/same-day-printing': {
    eyebrow: 'Same day printing',
    title: 'Fast turnaround print options for urgent jobs and last-minute campaigns.',
    intro: 'Use this page to group urgent products clearly while setting expectations around artwork, stock and collection.',
    image: '/images/hero-slide-3.svg',
    breadcrumb: 'Home / Categories / Same Day Printing',
    groups: [
      {
        title: 'Fast print options',
        description: 'Products that can be prepared quickly when artwork is print-ready and materials are available.',
        products: [
          { title: 'Same Day Business Cards', description: 'Fast card print for events and new starters.', price: 'Quote ready', image: '/images/business-card-front.svg', path: '/standard-business-cards' },
          { title: 'Same Day Flyers', description: 'Urgent promotional handouts and menus.', price: 'Quote ready', image: '/images/flyer-front.svg', path: '/flyers' },
          { title: 'Same Day Posters', description: 'Quick posters for windows, events and notices.', price: 'Quote ready', image: '/images/poster-main.svg', path: '/posters-large-format-prints' },
          { title: 'Artwork Check', description: 'Need file help before print? Request support.', price: 'Quote ready', image: '/images/hero-slide-1.svg', path: '/bespoke-quote' },
        ],
      },
    ],
    seoTitle: 'Same day printing',
    seoBody: 'Same day print pages should be clear about what can be produced quickly and when artwork or material checks are needed.',
    blogs: [
      { title: 'How to prepare files for urgent printing', body: 'Send print-ready PDFs with bleed, correct size and clear quantity requirements.', image: '/images/hero-slide-3.svg' },
      { title: 'Last-minute event print checklist', body: 'Cards, posters, flyers and signage are often the most urgent local print requests.', image: '/images/poster-main.svg' },
    ],
    faqs: ['What products can be printed same day?', 'Do I need print-ready artwork?', 'Can I collect from store?', 'Can you design urgent artwork?', 'Are same-day jobs guaranteed?'],
  },
  '/all-products': {
    eyebrow: 'All products',
    title: 'Browse print products by category, use case and support type.',
    intro: 'A fuller catalogue view for business cards, flyers, posters, booklets, signage, labels, stationery and custom quotes.',
    image: '/images/hero-slide-2.svg',
    breadcrumb: 'Home / Categories / All Products',
    groups: [
      {
        title: 'Popular categories',
        description: 'The most common print products customers need first.',
        products: sharedRelated,
      },
      {
        title: 'Custom and business support',
        description: 'For products that need material advice, artwork support or quote approval.',
        products: [
          { title: 'Bespoke Quote', description: 'Custom sizes, materials, quantities and finishing.', price: 'Quote ready', image: '/images/hero-slide-3.svg', path: '/bespoke-quote' },
          { title: 'Artwork Upload', description: 'Send artwork now or after order approval.', price: 'Support', image: '/images/hero-slide-1.svg', path: '/artwork-upload' },
          { title: 'Collection Support', description: 'Collect locally when your order is ready.', price: 'Support', image: '/images/business-card-front.svg', path: '/checkout' },
        ],
      },
    ],
    seoTitle: 'All print products',
    seoBody: 'The all-products page groups key print products into clear sections while keeping the Holo Print design and checkout routes intact.',
    blogs: [
      { title: 'Choosing print products for a launch', body: 'Start with cards, flyers, posters and signage, then add booklets and stationery.', image: '/images/hero-slide-2.svg' },
      { title: 'When to request a quote', body: 'Custom sizes, large quantities and specialist materials should go through quote review.', image: '/images/hero-slide-3.svg' },
    ],
    faqs: ['Can I order online?', 'Can I request a quote?', 'Can I upload artwork later?', 'Do you support business accounts?', 'Can I collect locally?'],
  },
};

const categoryAliases = {
  '/business-cards': {
    ...categoryData['/all-products'],
    eyebrow: 'Business cards',
    title: 'Business card options for teams, brands and everyday networking.',
    intro: 'Compare standard, premium and related business stationery products before choosing a product or quote route.',
    image: '/images/business-card-front.svg',
    breadcrumb: 'Home / Categories / Business Cards',
    groups: [
      {
        title: 'Business card products',
        description: 'Start with standard cards, then add finishes, corners or supporting stationery.',
        products: [
          { title: 'Standard Business Cards', description: 'Everyday cards with clean stock and finish choices.', price: 'From £21.99', image: '/images/business-card-front.svg', path: '/standard-business-cards' },
          { title: 'Premium Business Cards', description: 'More polished cards for brand presentation.', price: 'Quote ready', image: '/images/business-card-back.svg', path: '/standard-business-cards' },
          { title: 'Appointment Cards', description: 'Useful for salons, clinics, garages and service teams.', price: 'Quote ready', image: '/images/business-card-front.svg', path: '/standard-business-cards' },
          { title: 'Letterheads', description: 'Pair your cards with matching stationery.', price: 'Quote ready', image: '/images/hero-slide-1.svg', path: '/stationery' },
        ],
      },
    ],
  },
};

export function isCategoryLandingRoute(pathname = '/') {
  const clean = String(pathname || '/').split('?')[0].replace(/\/$/, '') || '/';
  return Boolean(categoryData[clean] || categoryAliases[clean]);
}

function cleanPath(pathname = '/') {
  return String(pathname || '/').split('?')[0].replace(/\/$/, '') || '/';
}

function navigate(path) {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new Event('locationchange'));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function CategoryShell({ children, className = '' }) {
  return <div className={`mx-auto w-full max-w-[1360px] px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>;
}

function ProductTile({ item }) {
  return (
    <button onClick={() => navigate(item.path)} className="group text-left">
      <div className="overflow-hidden rounded-[18px] border bg-white shadow-[0_14px_30px_rgba(0,0,0,0.04)] transition duration-200 group-hover:-translate-y-[2px] group-hover:shadow-[0_22px_48px_rgba(0,0,0,0.08)]" style={{ borderColor: BRAND.line }}>
        <div className="bg-[#F4F7FA] p-3">
          <img src={item.image} alt={item.title} className="h-44 w-full rounded-[12px] object-cover" />
        </div>
        <div className="p-4">
          <div className="text-[15px] font-black tracking-[-0.02em]" style={{ color: BRAND.ink }}>{item.title}</div>
          <p className="mt-1 min-h-[38px] text-[12px] leading-5" style={{ color: BRAND.muted }}>{item.description}</p>
          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="text-[13px] font-bold" style={{ color: BRAND.ink }}>{item.price}</span>
            <span className="inline-flex items-center gap-1 text-[12px] font-bold" style={{ color: BRAND.primary }}>View <ChevronRight className="h-4 w-4" /></span>
          </div>
        </div>
      </div>
    </button>
  );
}

function ProductGroup({ group }) {
  return (
    <section className="py-5">
      <CategoryShell>
        <div className="mb-4">
          <h2 className="text-[26px] font-black tracking-[-0.035em]" style={{ color: BRAND.ink }}>{group.title}</h2>
          <p className="mt-2 max-w-[860px] text-[13px] leading-6" style={{ color: BRAND.muted }}>{group.description}</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {group.products.map((item) => <ProductTile key={item.title} item={item} />)}
        </div>
      </CategoryShell>
    </section>
  );
}

function BlogCard({ item }) {
  return (
    <div className="rounded-[22px] border bg-white p-4 shadow-[0_14px_30px_rgba(0,0,0,0.04)]" style={{ borderColor: BRAND.line }}>
      <img src={item.image} alt={item.title} className="h-56 w-full rounded-[16px] object-cover" />
      <div className="mt-4 text-[18px] font-black tracking-[-0.03em]" style={{ color: BRAND.ink }}>{item.title}</div>
      <p className="mt-2 text-[12px] leading-6" style={{ color: BRAND.muted }}>{item.body}</p>
    </div>
  );
}

export default function CategoryLandingPage({ pathname = '/' }) {
  const clean = cleanPath(pathname);
  const page = categoryData[clean] || categoryAliases[clean] || categoryData['/all-products'];
  const related = sharedRelated.filter((item) => !page.groups.some((group) => group.products.some((product) => product.title === item.title))).slice(0, 5);

  return (
    <StorefrontChrome currentPath={clean}>
      <section className="border-b bg-white" style={{ borderColor: BRAND.line }}>
        <CategoryShell className="py-10 lg:py-14">
          <div className="overflow-hidden rounded-[28px] border shadow-[0_22px_60px_rgba(0,0,0,0.06)]" style={{ borderColor: BRAND.line, background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.primaryDark} 58%, #EAF9FD 58%, #F8FCFF 100%)` }}>
            <div className="grid gap-8 p-7 md:grid-cols-[0.95fr_1.05fr] md:p-10 lg:p-12">
              <div className="flex flex-col justify-center text-white">
                <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/80">{page.eyebrow}</div>
                <h1 className="mt-4 max-w-[620px] text-[38px] font-black leading-[0.98] tracking-[-0.055em] md:text-[54px]">{page.title}</h1>
                <p className="mt-5 max-w-[560px] text-[14px] leading-7 text-white/88">{page.intro}</p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <button onClick={() => window.dispatchEvent(new CustomEvent('open-holo-search'))} className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-[12px] font-black" style={{ color: BRAND.ink }}><Search className="h-4 w-4" />Search products</button>
                  <button onClick={() => navigate('/bespoke-quote')} className="rounded-full border border-white/45 px-5 py-3 text-[12px] font-black text-white">Request a quote</button>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative w-full max-w-[560px] rounded-[26px] border border-white/50 bg-white/70 p-4 shadow-[0_28px_80px_rgba(0,0,0,0.16)] backdrop-blur">
                  <img src={page.image} alt={page.title} className="h-[280px] w-full rounded-[18px] object-cover" />
                  <div className="absolute -bottom-4 left-7 rounded-2xl bg-white px-5 py-3 shadow-[0_18px_38px_rgba(0,0,0,0.11)]">
                    <div className="text-[11px] font-bold uppercase tracking-[0.16em]" style={{ color: BRAND.primary }}>Category ready</div>
                    <div className="text-[15px] font-black" style={{ color: BRAND.ink }}>{page.eyebrow}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CategoryShell>
      </section>

      <section className="py-4">
        <CategoryShell>
          <div className="text-[11px]" style={{ color: BRAND.muted }}>{page.breadcrumb}</div>
        </CategoryShell>
      </section>

      {page.groups.map((group) => <ProductGroup key={group.title} group={group} />)}

      <section className="py-8">
        <CategoryShell>
          <div className="mx-auto max-w-[860px] text-center">
            <div className="text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: BRAND.primary }}>{page.eyebrow} guidance</div>
            <h2 className="mt-3 text-[30px] font-black tracking-[-0.04em]" style={{ color: BRAND.ink }}>{page.seoTitle}</h2>
            <p className="mt-4 text-[13px] leading-7" style={{ color: BRAND.muted }}>{page.seoBody}</p>
          </div>
        </CategoryShell>
      </section>

      <section className="py-6">
        <CategoryShell>
          <div className="mb-5 text-center text-[26px] font-black tracking-[-0.04em]" style={{ color: BRAND.ink }}>{page.eyebrow} help and ideas</div>
          <div className="grid gap-5 md:grid-cols-2">
            {page.blogs.map((item) => <BlogCard key={item.title} item={item} />)}
          </div>
        </CategoryShell>
      </section>

      <section className="py-6">
        <CategoryShell>
          <div className="rounded-[24px] border bg-white p-6 shadow-[0_14px_30px_rgba(0,0,0,0.04)]" style={{ borderColor: BRAND.line }}>
            <div className="text-center">
              <div className="text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: BRAND.primary }}>Frequently asked questions</div>
              <h2 className="mt-3 text-[28px] font-black tracking-[-0.04em]" style={{ color: BRAND.ink }}>Common questions before customers order</h2>
            </div>
            <div className="mx-auto mt-6 max-w-[980px] divide-y" style={{ borderColor: BRAND.line }}>
              {page.faqs.map((question) => (
                <button key={question} className="flex w-full items-center justify-between gap-4 py-4 text-left text-[14px] font-semibold" style={{ color: BRAND.ink }}>
                  <span>{question}</span>
                  <HelpCircle className="h-4 w-4 shrink-0" style={{ color: BRAND.primary }} />
                </button>
              ))}
            </div>
          </div>
        </CategoryShell>
      </section>

      <section className="py-6">
        <CategoryShell>
          <div className="mb-5 text-center text-[26px] font-black tracking-[-0.04em]" style={{ color: BRAND.ink }}>Customers also order</div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {related.map((item) => <ProductTile key={item.title} item={{ ...item, description: 'Often ordered with this category for a complete print bundle.' }} />)}
          </div>
        </CategoryShell>
      </section>

      <section className="py-8">
        <CategoryShell>
          <div className="grid gap-4 md:grid-cols-3">
            {[['Artwork check included', 'Upload print-ready files or request help before production.', ShieldCheck], ['Business account ready', 'Useful for repeat jobs, local teams and larger orders.', Star], ['Custom quote route', 'Move complex sizes, materials and finishing into quote review.', Sparkles]].map(([title, body, Icon]) => (
              <div key={title} className="rounded-[20px] border bg-white p-5 shadow-[0_12px_28px_rgba(0,0,0,0.035)]" style={{ borderColor: BRAND.line }}>
                <Icon className="h-5 w-5" style={{ color: BRAND.primary }} />
                <div className="mt-4 text-[15px] font-black" style={{ color: BRAND.ink }}>{title}</div>
                <p className="mt-2 text-[12px] leading-6" style={{ color: BRAND.muted }}>{body}</p>
              </div>
            ))}
          </div>
        </CategoryShell>
      </section>
    </StorefrontChrome>
  );
}
