import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ChevronRight, Menu, Search, ShoppingCart, User, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { buildNavItemsFromAdminCatalog, loadAdminCatalog } from '@/storefront/services/admin-catalog';

const BRAND = {
  bg: '#F7F8FC',
  line: '#E3E8F0',
  ink: '#161A22',
  muted: '#667487',
  primary: '#18A7D0',
  accent: '#7B3FE4',
  black: '#0F1012',
};

const FALLBACK_NAV_ITEMS = [
  { label: 'Same Day Printing', path: '/same-day-printing', feature: { title: 'Need it today?', body: 'Fast-turnaround print products for urgent jobs, events and last-minute business needs.', image: '/images/hero-slide-3.svg', cta: 'Shop same day print' }, columns: [{ title: 'Fast options', links: [['Same Day Business Cards', '/business-cards/standard-business-cards'], ['Same Day Flyers', '/flyers'], ['Same Day Posters', '/posters-large-format-prints'], ['Urgent Booklets', '/booklets']] }, { title: 'Helpful services', links: [['Artwork Check', '/artwork-upload'], ['Priority Quote', '/bespoke-quote'], ['Express Delivery', '/checkout'], ['Call Support', '/bespoke-quote']] }, { title: 'Popular categories', links: [['Business Cards', '/business-cards'], ['Flyers', '/flyers'], ['Labels', '/all-products'], ['Signage', '/signage']] }] },
  { label: 'Business Cards', path: '/business-cards', feature: { title: 'Professional business cards', body: 'Premium presentation for your brand, team and customer touchpoints.', image: '/images/business-card-front.svg', cta: 'Shop business cards' }, columns: [{ title: 'Popular styles', links: [['Standard Business Cards', '/business-cards/standard-business-cards'], ['Premium Business Cards', '/business-cards/standard-business-cards'], ['Rounded Corner Cards', '/business-cards/standard-business-cards'], ['Loyalty Cards', '/all-products']] }, { title: 'By finish', links: [['Matte', '/business-cards/standard-business-cards'], ['Gloss', '/business-cards/standard-business-cards'], ['Soft Touch', '/business-cards/standard-business-cards'], ['Recycled', '/business-cards/standard-business-cards']] }, { title: 'Business essentials', links: [['Letterheads', '/stationery'], ['Compliment Slips', '/stationery'], ['Presentation Folders', '/all-products'], ['Name Badges', '/all-products']] }] },
  { label: 'Flyers', path: '/flyers', feature: { title: 'Flyers and leaflets', body: 'Compact, promotional print for campaigns, menus and events.', image: '/images/flyer-front.svg', cta: 'View flyers' }, columns: [{ title: 'Flyer formats', links: [['A6 Flyers', '/flyers'], ['A5 Flyers', '/flyers'], ['A4 Flyers', '/flyers'], ['DL Flyers', '/flyers']] }, { title: 'Marketing print', links: [['Leaflets', '/flyers'], ['Menus', '/flyers'], ['Promotional Handouts', '/flyers'], ['Event Sheets', '/flyers']] }, { title: 'Related products', links: [['Posters', '/posters-large-format-prints'], ['Booklets', '/booklets'], ['Brochures', '/booklets'], ['Stickers', '/all-products']] }] },
  { label: 'Posters', path: '/posters-large-format-prints', feature: { title: 'Posters and large format', body: 'Strong image-led products for displays, signage and retail promotion.', image: '/images/poster-main.svg', cta: 'Explore posters' }, columns: [{ title: 'Large format', links: [['A3 Posters', '/posters-large-format-prints'], ['A2 Posters', '/posters-large-format-prints'], ['A1 Posters', '/posters-large-format-prints'], ['A0 Posters', '/posters-large-format-prints']] }, { title: 'Display products', links: [['Roller Banners', '/signage'], ['PVC Banners', '/signage'], ['Foamex Boards', '/signage'], ['Window Graphics', '/signage']] }, { title: 'Signage', links: [['Indoor Signage', '/signage'], ['Outdoor Signage', '/signage'], ['Retail POS', '/signage'], ['Event Signage', '/signage']] }] },
  { label: 'Booklets', path: '/booklets', feature: { title: 'Booklets and brochures', body: 'Editorial-style layouts for stitched, wiro and premium bound print.', image: '/images/hero-slide-2.svg', cta: 'Shop booklets' }, columns: [{ title: 'Booklet types', links: [['Stapled Booklets', '/booklets'], ['Wiro Bound', '/booklets'], ['Perfect Bound', '/booklets'], ['Brochures', '/booklets']] }, { title: 'Use cases', links: [['Company Profiles', '/booklets'], ['Product Brochures', '/booklets'], ['Lookbooks', '/booklets'], ['Manuals', '/booklets']] }, { title: 'Related items', links: [['Flyers', '/flyers'], ['Presentation Folders', '/all-products'], ['Posters', '/posters-large-format-prints'], ['Custom Quote', '/bespoke-quote']] }] },
  { label: 'Stationery', path: '/stationery', feature: { title: 'Professional stationery', body: 'Core office and brand stationery with a calm, polished presentation.', image: '/images/hero-slide-1.svg', cta: 'View stationery' }, columns: [{ title: 'Essentials', links: [['Letterheads', '/stationery'], ['Compliment Slips', '/stationery'], ['NCR Pads', '/stationery'], ['Notepads', '/stationery']] }, { title: 'Branded print', links: [['Presentation Folders', '/stationery'], ['Envelopes', '/stationery'], ['Notebooks', '/booklets'], ['Appointment Cards', '/business-cards']] }, { title: 'Useful links', links: [['Business Cards', '/business-cards'], ['Booklets', '/booklets'], ['Custom Quote', '/bespoke-quote'], ['All Products', '/all-products']] }] },
  { label: 'Signage', path: '/signage', feature: { title: 'Display and signage', body: 'Retail, event and wayfinding graphics with large-format flexibility.', image: '/images/poster-main.svg', cta: 'Explore signage' }, columns: [{ title: 'Display print', links: [['Roller Banners', '/signage'], ['Foamex Boards', '/signage'], ['PVC Signs', '/signage'], ['Window Graphics', '/signage']] }, { title: 'Events', links: [['Directional Signs', '/signage'], ['Exhibition Panels', '/signage'], ['Outdoor Banners', '/signage'], ['Promotional Boards', '/signage']] }, { title: 'Need help?', links: [['Installation Advice', '/bespoke-quote'], ['Custom Sizing', '/bespoke-quote'], ['Material Guidance', '/bespoke-quote'], ['Request Quote', '/bespoke-quote']] }] },
  { label: 'All Products', path: '/all-products', feature: { title: 'Explore the full catalog', body: 'A broader storefront view with cleaner sections and stronger product grouping.', image: '/images/hero-slide-2.svg', cta: 'Shop all products' }, columns: [{ title: 'Core categories', links: [['Business Cards', '/business-cards'], ['Flyers', '/flyers'], ['Posters', '/posters-large-format-prints'], ['Booklets', '/booklets']] }, { title: 'Expanded range', links: [['Labels', '/all-products'], ['Signage', '/signage'], ['Stationery', '/stationery'], ['Packaging', '/all-products']] }, { title: 'Custom support', links: [['Bespoke Quote', '/bespoke-quote'], ['Bulk Orders', '/bespoke-quote'], ['Artwork Advice', '/bespoke-quote'], ['Delivery Support', '/all-products']] }] },
  { label: 'Bespoke Quote', path: '/bespoke-quote', feature: { title: 'Custom print projects', body: 'Perfect for specialist materials, unusual sizes and larger bespoke jobs.', image: '/images/hero-slide-3.svg', cta: 'Request a quote' }, columns: [{ title: 'Best for', links: [['Bulk Orders', '/bespoke-quote'], ['Special Finishes', '/bespoke-quote'], ['Large Projects', '/bespoke-quote'], ['Complex Specs', '/bespoke-quote']] }, { title: 'Support', links: [['Artwork Help', '/bespoke-quote'], ['Material Advice', '/bespoke-quote'], ['Production Queries', '/bespoke-quote'], ['Pricing Guidance', '/bespoke-quote']] }, { title: 'Related pages', links: [['All Products', '/all-products'], ['Business Cards', '/business-cards'], ['Flyers', '/flyers'], ['Posters', '/posters-large-format-prints']] }] },
];

function Shell({ children, narrow = false }) {
  return <div className={`mx-auto w-full px-4 sm:px-6 lg:px-8 ${narrow ? 'max-w-[1220px]' : 'max-w-[1360px]'}`}>{children}</div>;
}

function currency(value) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(Number(value || 0));
}

function navigate(path) {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new Event('locationchange'));
  window.dispatchEvent(new PopStateEvent('popstate'));
}

function UtilityBar() {
  return (
    <div style={{ backgroundColor: BRAND.black, color: 'white' }}>
      <Shell>
        <div className="flex h-8 items-center justify-between text-[11px] font-medium">
          <span>Professional print, same day printing, signage and packaging solutions</span>
          <div className="hidden gap-5 sm:flex"><span>Business orders</span><span>Bulk pricing</span><span>Fast turnaround</span><span>Bespoke quote support</span></div>
        </div>
      </Shell>
    </div>
  );
}

function IconButton({ icon }) {
  return <div className="grid h-9 w-9 place-items-center rounded-xl border bg-white" style={{ borderColor: BRAND.line }}>{icon}</div>;
}

function Header({ currentPath = '/', cartCount = 0, cartSubtotal = 0 }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openLabel, setOpenLabel] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [navItems, setNavItems] = useState(FALLBACK_NAV_ITEMS);
  const wrapperRef = useRef(null);

  useEffect(() => {
    let active = true;
    loadAdminCatalog()
      .then((catalog) => {
        if (!active) return;
        setNavItems(buildNavItemsFromAdminCatalog(catalog, FALLBACK_NAV_ITEMS));
      })
      .catch(() => setNavItems(FALLBACK_NAV_ITEMS));
    return () => { active = false; };
  }, []);

  const searchSuggestions = useMemo(() => {
    const suggestions = [];
    navItems.forEach((item) => {
      suggestions.push([item.label, item.path]);
      item.columns?.forEach((column) => column.links?.forEach((link) => suggestions.push(link)));
    });
    const seen = new Set();
    return suggestions.filter(([label, path]) => {
      const key = `${label}|${path}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, 40);
  }, [navItems]);

  useEffect(() => {
    const close = (event) => { if (wrapperRef.current && !wrapperRef.current.contains(event.target)) setOpenLabel(null); };
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    const onOpenSearch = () => setSearchOpen(true);
    document.addEventListener('mousedown', close);
    window.addEventListener('scroll', onScroll);
    window.addEventListener('open-holo-search', onOpenSearch);
    window.addEventListener('storefront:search', onOpenSearch);
    onScroll();
    return () => {
      document.removeEventListener('mousedown', close);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('open-holo-search', onOpenSearch);
      window.removeEventListener('storefront:search', onOpenSearch);
    };
  }, []);

  return (
    <header className={`sticky top-0 z-40 border-b bg-white/95 backdrop-blur transition-all duration-300 ${isScrolled ? 'shadow-[0_12px_30px_rgba(0,0,0,0.06)]' : ''}`} style={{ borderColor: BRAND.line }}>
      <Shell>
        <div ref={wrapperRef} className="relative">
          <div className={`grid grid-cols-[auto_1fr_auto] items-center gap-6 transition-all duration-300 ${isScrolled ? 'h-[64px]' : 'h-[74px]'}`}>
            <div className="flex items-center gap-3">
              <button className="rounded-xl p-2 xl:hidden" onClick={() => setMobileOpen(true)}><Menu className="h-5 w-5" /></button>
              <button onClick={() => navigate('/')} className="flex items-center gap-0.5"><span className="text-[42px] font-black tracking-[-0.055em]" style={{ color: BRAND.primary }}>HOLO</span><span className="text-[42px] font-black tracking-[-0.055em]" style={{ color: BRAND.ink }}>PRINT</span></button>
            </div>

            <nav className="hidden items-center justify-center gap-4 xl:flex">
              {navItems.map((item) => {
                const active = currentPath === item.path || currentPath.startsWith(`${item.path}/`);
                const open = openLabel === item.label;
                return <button key={item.label} className="inline-flex items-center gap-1 text-[13px] font-semibold tracking-[-0.01em]" style={{ color: active || open ? BRAND.primary : BRAND.ink }} onMouseEnter={() => setOpenLabel(item.label)} onClick={() => navigate(item.path)}>{item.label}<ChevronDown className={`h-4 w-4 transition ${open ? 'rotate-180' : ''}`} /></button>;
              })}
            </nav>

            <div className="ml-auto flex items-center gap-2">
              <button onClick={() => setSearchOpen(true)}><IconButton icon={<Search className="h-4 w-4" />} /></button>
              <button onClick={() => navigate('/login')}><IconButton icon={<User className="h-4 w-4" />} /></button>
              <button onClick={() => navigate('/cart')} className="flex items-center gap-2 rounded-xl border px-3 py-2 text-[12px] font-semibold" style={{ borderColor: BRAND.line, color: BRAND.muted, backgroundColor: 'white' }}><ShoppingCart className="h-4 w-4" /><span>{currency(cartSubtotal)}</span>{cartCount > 0 ? <span className="rounded-full px-1.5 py-0.5 text-[10px] text-white" style={{ background: 'linear-gradient(135deg, #18A7D0, #7B3FE4)' }}>{cartCount}</span> : null}</button>
            </div>
          </div>

          <AnimatePresence>
            {searchOpen ? <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} className="fixed inset-0 z-[70] bg-[rgba(16,18,24,0.45)] px-4 py-6 md:px-10">
              <div className="mx-auto flex max-w-[1080px] items-start justify-end"><button onClick={() => setSearchOpen(false)} className="mt-3 rounded-full bg-white p-3 shadow-[0_12px_28px_rgba(0,0,0,0.10)]"><X className="h-5 w-5" style={{ color: BRAND.ink }} /></button></div>
              <div className="mx-auto mt-4 max-w-[1080px] rounded-[28px] border bg-white p-6 shadow-[0_30px_90px_rgba(0,0,0,0.20)] md:p-8" style={{ borderColor: BRAND.line }}>
                <div className="text-center"><div className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: BRAND.accent }}>Search HOLO Print</div><div className="mt-3 text-[34px] font-black tracking-[-0.045em]" style={{ color: BRAND.ink }}>Find the right print product faster</div></div>
                <div className="relative mx-auto mt-6 max-w-[760px]"><Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2" style={{ color: BRAND.muted }} /><Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="h-14 rounded-[18px] border pl-12 text-[14px]" placeholder="Search business cards, flyers, posters, booklets..." style={{ borderColor: BRAND.line }} /></div>
                <div className="mt-8 grid gap-4 md:grid-cols-2">
                  {searchSuggestions.filter(([label]) => label.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 12).map(([label, path], index) => <button key={`${label}-${path}`} onClick={() => { navigate(path); setSearchOpen(false); }} className="group flex items-center justify-between rounded-[18px] border bg-[#FBFCFF] px-5 py-4 text-left shadow-[0_10px_24px_rgba(0,0,0,0.03)] transition hover:-translate-y-[1px] hover:shadow-[0_16px_32px_rgba(0,0,0,0.06)]" style={{ borderColor: BRAND.line }}><div><div className="text-[14px] font-black tracking-[-0.02em]" style={{ color: BRAND.ink }}>{label}</div><div className="mt-1 text-[12px]" style={{ color: BRAND.muted }}>{index < 4 ? 'Admin connected product/category' : 'Browse products and options'}</div></div><ChevronRight className="h-5 w-5" style={{ color: BRAND.primary }} /></button>)}
                </div>
              </div>
            </motion.div> : null}
          </AnimatePresence>

          <AnimatePresence>
            {openLabel ? <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }} transition={{ duration: 0.18 }} onMouseLeave={() => setOpenLabel(null)} className="absolute left-0 right-0 top-full hidden xl:block">
              <div className="mt-2 rounded-[22px] border bg-white p-5 shadow-[0_34px_100px_rgba(0,0,0,0.13)]" style={{ borderColor: BRAND.line }}>
                {(() => {
                  const item = navItems.find((entry) => entry.label === openLabel) || navItems[0];
                  return <div className="grid gap-5"><div className="grid grid-cols-[270px_1fr_1fr_1fr] gap-6"><div className="rounded-[20px] border p-4" style={{ borderColor: BRAND.line, background: 'linear-gradient(180deg, #FBFDFE 0%, #F4F9FB 100%)' }}><img src={item.feature.image} alt={item.feature.title} className="h-36 w-full rounded-[12px] object-cover" /><div className="mt-4 text-[18px] font-black tracking-[-0.03em]" style={{ color: BRAND.ink }}>{item.feature.title}</div><p className="mt-2 text-[12px] leading-6" style={{ color: BRAND.muted }}>{item.feature.body}</p><button onClick={() => navigate(item.path)} className="mt-4 text-[12px] font-bold" style={{ color: BRAND.primary }}>{item.feature.cta}</button></div>{item.columns.map((column) => <div key={column.title}><div className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: BRAND.primary }}>{column.title}</div><div className="grid gap-1">{column.links.map(([label, path]) => <button key={`${label}-${path}`} onClick={() => { navigate(path); setOpenLabel(null); }} className="rounded-xl px-3 py-2 text-left text-[12px] font-medium hover:bg-[#F6F7F8]" style={{ color: BRAND.ink }}>{label}</button>)}</div></div>)}</div><div className="grid grid-cols-4 gap-3 border-t pt-4" style={{ borderColor: BRAND.line }}>{['Fast turnaround', 'Premium stock', 'Bulk pricing', 'Artwork support'].map((itemText) => <div key={itemText} className="rounded-[16px] border px-4 py-3 text-[11px] font-semibold" style={{ borderColor: BRAND.line, color: BRAND.muted, background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FBFC 100%)' }}>{itemText}</div>)}</div></div>;
                })()}
              </div>
            </motion.div> : null}
          </AnimatePresence>
        </div>
      </Shell>

      {mobileOpen ? <div className="fixed inset-0 z-50 bg-black/25 xl:hidden" onClick={() => setMobileOpen(false)}><div className="h-full w-[320px] bg-white p-5" onClick={(event) => event.stopPropagation()}><div className="mb-6 flex items-center justify-between"><div className="text-[24px] font-black">Menu</div><button onClick={() => setMobileOpen(false)}><X className="h-5 w-5" /></button></div><div className="grid gap-1">{navItems.map((item) => <button key={item.label} className="rounded-xl px-3 py-3 text-left text-[14px] font-semibold hover:bg-[#F6F7F8]" onClick={() => { navigate(item.path); setMobileOpen(false); }}>{item.label}</button>)}</div></div></div> : null}
    </header>
  );
}

function FooterCol({ title, items }) {
  return <div><div className="mb-3 text-[12px] font-bold uppercase tracking-[0.16em]" style={{ color: BRAND.ink }}>{title}</div><div className="grid gap-2">{items.map(([label, path]) => <button key={label} onClick={() => navigate(path)} className="text-left text-[12px]" style={{ color: BRAND.muted }}>{label}</button>)}</div></div>;
}

function Footer() {
  return (
    <footer className="mt-8 border-t bg-white" style={{ borderColor: BRAND.line }}>
      <div className="border-b py-3" style={{ borderColor: BRAND.line, backgroundColor: BRAND.primary }}><Shell><div className="flex flex-col items-center justify-between gap-3 text-[12px] font-semibold text-white md:flex-row"><span>Get the very best print solutions for your business, events and brand campaigns — with room to grow into a full admin-connected storefront.</span><div className="flex gap-2"><Input className="h-9 w-[250px] rounded-full border-0 bg-white text-[12px] text-black" placeholder="Email address" /><button className="rounded-full bg-black px-4 text-[12px] font-bold text-white">Subscribe</button></div></div></Shell></div>
      <Shell>
        <div className="grid gap-3 py-5 md:grid-cols-4">{[[ 'Business printing', '20+' ], [ 'Event signage', '12+' ], [ 'Labels & packaging', '18+' ], [ 'Custom quote support', '1:1' ]].map(([item, count]) => <div key={item} className="rounded-[18px] border px-4 py-3" style={{ borderColor: BRAND.line, color: BRAND.muted, background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FBFC 100%)' }}><div className="text-[10px] font-bold uppercase tracking-[0.14em]">{item}</div><div className="mt-1 text-[16px] font-black" style={{ color: BRAND.ink }}>{count}</div></div>)}</div>
        <div className="grid gap-8 py-10 md:grid-cols-[1.25fr_0.8fr_0.8fr_0.8fr_0.8fr]"><div><button onClick={() => navigate('/')} className="flex items-center gap-0.5"><span className="text-[50px] font-black tracking-[-0.055em]" style={{ color: BRAND.primary }}>HOLO</span><span className="text-[50px] font-black tracking-[-0.055em]" style={{ color: BRAND.ink }}>PRINT</span></button><p className="mt-4 max-w-[360px] text-[12px] leading-7" style={{ color: BRAND.muted }}>A fuller ecommerce print storefront direction with broader navigation, denser sections and a cleaner visual tone.</p></div><FooterCol title="Products" items={[[ 'Business Cards', '/business-cards' ], [ 'Flyers', '/flyers' ], [ 'Posters', '/posters-large-format-prints' ], [ 'Booklets', '/booklets' ]]} /><FooterCol title="Categories" items={[[ 'Labels', '/all-products' ], [ 'Stationery', '/stationery' ], [ 'Signage', '/signage' ], [ 'Packaging', '/all-products' ]]} /><FooterCol title="Business" items={[[ 'Bulk pricing', '/bespoke-quote' ], [ 'Custom quotes', '/bespoke-quote' ], [ 'Artwork advice', '/bespoke-quote' ], [ 'Delivery support', '/all-products' ]]} /><FooterCol title="Support" items={[[ 'All products', '/all-products' ], [ 'Cart', '/cart' ], [ 'Contact', '/bespoke-quote' ], [ 'Quote request', '/bespoke-quote' ]]} /></div>
      </Shell>
      <Shell><div className="flex flex-col gap-2 border-t py-4 text-[11px] md:flex-row md:items-center md:justify-between" style={{ borderColor: BRAND.line, color: BRAND.muted }}><span>© 2026 HOLO PRINT. All rights reserved. Professional print storefront theme.</span><div className="flex gap-4"><button onClick={() => navigate('/all-products')}>All products</button><button onClick={() => navigate('/bespoke-quote')}>Custom quote</button><button onClick={() => navigate('/cart')}>Cart</button></div></div></Shell>
    </footer>
  );
}

export function StorefrontChrome({ currentPath = '/', children, cartCount = 0, cartSubtotal = 0 }) {
  return <div style={{ backgroundColor: BRAND.bg, color: BRAND.ink }}><UtilityBar /><Header currentPath={currentPath} cartCount={cartCount} cartSubtotal={cartSubtotal} />{children}<Footer /></div>;
}

export default StorefrontChrome;
