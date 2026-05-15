import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ChevronRight, Menu, Search, ShoppingCart, User, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

const BRAND = {
  line: '#E3E8F0',
  ink: '#161A22',
  muted: '#667487',
  primary: '#18A7D0',
  accent: '#7B3FE4',
  black: '#0F1012',
};

const NAV_ITEMS = [
  ['Same Day Printing', '/same-day-printing'],
  ['Business Cards', '/standard-business-cards'],
  ['Flyers', '/flyers'],
  ['Posters', '/posters-large-format-prints'],
  ['Booklets', '/booklets'],
  ['Labels', '/all-products'],
  ['Stationery', '/stationery'],
  ['Signage', '/signage'],
  ['All Products', '/all-products'],
  ['Bespoke Quote', '/bespoke-quote'],
];

const FEATURE_BY_LABEL = {
  'Same Day Printing': ['Need it today?', 'Fast-turnaround print products for urgent jobs, events and last-minute business needs.', '/images/hero-slide-3.svg'],
  'Business Cards': ['Professional business cards', 'Premium presentation for your brand, team and customer touchpoints.', '/images/business-card-front.svg'],
  Flyers: ['Flyers and leaflets', 'Compact, promotional print for campaigns, menus and events.', '/images/flyer-front.svg'],
  Posters: ['Posters and large format', 'Display graphics and retail promotion.', '/images/poster-main.svg'],
  Booklets: ['Booklets and brochures', 'Editorial-style layouts for stitched, wiro and premium bound print.', '/images/hero-slide-2.svg'],
  Labels: ['Labels and stickers', 'Product labels, sticker sheets and packaging-ready print.', '/images/hero-slide-3.svg'],
  Stationery: ['Professional stationery', 'Core office and brand stationery.', '/images/hero-slide-1.svg'],
  Signage: ['Display and signage', 'Retail, event and wayfinding graphics.', '/images/poster-main.svg'],
  'All Products': ['Explore the full catalog', 'A broader storefront view with stronger product grouping.', '/images/hero-slide-2.svg'],
  'Bespoke Quote': ['Custom print projects', 'For specialist materials, unusual sizes and larger bespoke jobs.', '/images/hero-slide-3.svg'],
};

function Shell({ children }) {
  return <div className="mx-auto w-full max-w-[1360px] px-4 sm:px-6 lg:px-8">{children}</div>;
}

function currency(value) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(Number(value || 0));
}

function navigate(path) {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new Event('locationchange'));
}

function IconButton({ icon }) {
  return <div className="grid h-9 w-9 place-items-center rounded-xl border bg-white" style={{ borderColor: BRAND.line }}>{icon}</div>;
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

function StorefrontHeader({ currentPath = '/', cartCount = 0, cartSubtotal = 0 }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openLabel, setOpenLabel] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const wrapperRef = useRef(null);
  const searchSuggestions = [['Business Cards', '/standard-business-cards'], ['Flyers', '/flyers'], ['Posters', '/posters-large-format-prints'], ['Booklets', '/booklets'], ['Stationery', '/stationery'], ['Signage', '/signage'], ['All Products', '/all-products']];

  useEffect(() => {
    const close = (event) => { if (wrapperRef.current && !wrapperRef.current.contains(event.target)) setOpenLabel(null); };
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    document.addEventListener('mousedown', close);
    window.addEventListener('scroll', onScroll);
    onScroll();
    return () => { document.removeEventListener('mousedown', close); window.removeEventListener('scroll', onScroll); };
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
              {NAV_ITEMS.map(([label, path]) => {
                const active = currentPath === path;
                const open = openLabel === label;
                return <button key={label} className="inline-flex items-center gap-1 text-[13px] font-semibold tracking-[-0.01em]" style={{ color: active || open ? BRAND.primary : BRAND.ink }} onMouseEnter={() => setOpenLabel(label)} onClick={() => navigate(path)}>{label}<ChevronDown className={`h-4 w-4 transition ${open ? 'rotate-180' : ''}`} /></button>;
              })}
            </nav>

            <div className="ml-auto flex items-center gap-2">
              <button onClick={() => setSearchOpen(true)}><IconButton icon={<Search className="h-4 w-4" />} /></button>
              <button onClick={() => navigate('/login')}><IconButton icon={<User className="h-4 w-4" />} /></button>
              <button onClick={() => navigate('/cart')} className="flex items-center gap-2 rounded-xl border px-3 py-2 text-[12px] font-semibold" style={{ borderColor: BRAND.line, color: BRAND.muted, backgroundColor: 'white' }}><ShoppingCart className="h-4 w-4" /><span>{currency(cartSubtotal)}</span>{cartCount > 0 && <span className="rounded-full px-1.5 py-0.5 text-[10px] text-white" style={{ background: 'linear-gradient(135deg, #18A7D0, #7B3FE4)' }}>{cartCount}</span>}</button>
            </div>
          </div>

          <AnimatePresence>
            {searchOpen && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} className="fixed inset-0 z-[70] bg-[rgba(16,18,24,0.45)] px-4 py-6 md:px-10">
                <div className="mx-auto flex max-w-[1080px] items-start justify-end"><button onClick={() => setSearchOpen(false)} className="mt-3 rounded-full bg-white p-3 shadow-[0_12px_28px_rgba(0,0,0,0.10)]"><X className="h-5 w-5" style={{ color: BRAND.ink }} /></button></div>
                <div className="mx-auto mt-4 max-w-[1080px] rounded-[28px] border bg-white p-6 shadow-[0_30px_90px_rgba(0,0,0,0.20)] md:p-8" style={{ borderColor: BRAND.line }}>
                  <div className="text-center"><div className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: BRAND.accent }}>Search HOLO Print</div><div className="mt-3 text-[34px] font-black tracking-[-0.045em]" style={{ color: BRAND.ink }}>Find the right print product faster</div></div>
                  <div className="relative mx-auto mt-6 max-w-[760px]"><Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2" style={{ color: BRAND.muted }} /><Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="h-14 rounded-[18px] border pl-12 text-[14px]" placeholder="Search business cards, flyers, posters, booklets..." style={{ borderColor: BRAND.line }} /></div>
                  <div className="mt-8 grid gap-4 md:grid-cols-2">{searchSuggestions.filter(([label]) => label.toLowerCase().includes(searchTerm.toLowerCase())).map(([label, path], index) => <button key={label} onClick={() => { navigate(path); setSearchOpen(false); }} className="group flex items-center justify-between rounded-[18px] border bg-[#FBFCFF] px-5 py-4 text-left shadow-[0_10px_24px_rgba(0,0,0,0.03)] transition hover:-translate-y-[1px] hover:shadow-[0_16px_32px_rgba(0,0,0,0.06)]" style={{ borderColor: BRAND.line }}><div><div className="text-[14px] font-black tracking-[-0.02em]" style={{ color: BRAND.ink }}>{label}</div><div className="mt-1 text-[12px]" style={{ color: BRAND.muted }}>{index < 2 ? 'Popular print category' : index < 5 ? 'Browse products and options' : 'Explore more products'}</div></div><ChevronRight className="h-5 w-5" style={{ color: BRAND.primary }} /></button>)}</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {openLabel && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }} transition={{ duration: 0.18 }} onMouseLeave={() => setOpenLabel(null)} className="absolute left-0 right-0 top-full hidden xl:block">
                <div className="mt-2 rounded-[22px] border bg-white p-5 shadow-[0_34px_100px_rgba(0,0,0,0.13)]" style={{ borderColor: BRAND.line }}>
                  {(() => {
                    const [title, body, image] = FEATURE_BY_LABEL[openLabel] || FEATURE_BY_LABEL['All Products'];
                    const links = NAV_ITEMS.map(([label, path]) => [label, path]).slice(0, 9);
                    return <div className="grid gap-5"><div className="grid grid-cols-[270px_1fr_1fr_1fr] gap-6"><div className="rounded-[20px] border p-4" style={{ borderColor: BRAND.line, background: 'linear-gradient(180deg, #FBFDFE 0%, #F4F9FB 100%)' }}><img src={image} alt={title} className="h-36 w-full rounded-[12px] object-cover" /><div className="mt-4 text-[18px] font-black tracking-[-0.03em]" style={{ color: BRAND.ink }}>{title}</div><p className="mt-2 text-[12px] leading-6" style={{ color: BRAND.muted }}>{body}</p></div>{[0, 1, 2].map((col) => <div key={col}><div className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: BRAND.primary }}>{col === 0 ? 'Popular' : col === 1 ? 'Products' : 'Support'}</div><div className="grid gap-1">{links.slice(col * 3, col * 3 + 3).map(([label, path]) => <button key={label} onClick={() => { navigate(path); setOpenLabel(null); }} className="rounded-xl px-3 py-2 text-left text-[12px] font-medium hover:bg-[#F6F7F8]" style={{ color: BRAND.ink }}>{label}</button>)}</div></div>)}</div><div className="grid grid-cols-4 gap-3 border-t pt-4" style={{ borderColor: BRAND.line }}>{['Fast turnaround', 'Premium stock', 'Bulk pricing', 'Artwork support'].map((item) => <div key={item} className="rounded-[16px] border px-4 py-3 text-[11px] font-semibold" style={{ borderColor: BRAND.line, color: BRAND.muted, background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FBFC 100%)' }}>{item}</div>)}</div></div>;
                  })()}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Shell>
      {mobileOpen && <div className="fixed inset-0 z-50 bg-black/25 xl:hidden" onClick={() => setMobileOpen(false)}><div className="h-full w-[320px] bg-white p-5" onClick={(event) => event.stopPropagation()}><div className="mb-6 flex items-center justify-between"><div className="text-[24px] font-black">Menu</div><button onClick={() => setMobileOpen(false)}><X className="h-5 w-5" /></button></div><div className="grid gap-1">{NAV_ITEMS.map(([label, path]) => <button key={label} className="rounded-xl px-3 py-3 text-left text-[14px] font-semibold hover:bg-[#F6F7F8]" onClick={() => { navigate(path); setMobileOpen(false); }}>{label}</button>)}</div></div></div>}
    </header>
  );
}

function StorefrontFooter() {
  return (
    <footer className="border-t border-[#e3e8f0] bg-white">
      <div className="bg-[#18a7d0] text-white"><Shell><div className="flex flex-col gap-3 py-4 text-xs font-bold md:flex-row md:items-center md:justify-between"><span>Get the very best print solutions for your business, events and brand campaigns.</span><div className="flex gap-2"><input className="rounded-full px-4 py-2 text-[#161a22]" placeholder="Email address" /><button className="rounded-full bg-black px-5 py-2 text-white">Subscribe</button></div></div></Shell></div>
      <Shell><div className="grid gap-8 py-12 md:grid-cols-[1.4fr_repeat(4,1fr)]"><div><div className="text-3xl font-black text-[#18a7d0]">HOLO<span className="text-[#161a22]">PRINT</span></div><p className="mt-4 max-w-xs text-sm leading-7 text-[#667487]">A fuller ecommerce print storefront direction with broader navigation, clearer sections and cleaner visual tone.</p></div><div><h4 className="text-xs font-black uppercase tracking-wider">Products</h4><p className="mt-4 text-sm text-[#667487]">Business Cards<br/>Flyers<br/>Posters<br/>Booklets</p></div><div><h4 className="text-xs font-black uppercase tracking-wider">Categories</h4><p className="mt-4 text-sm text-[#667487]">Labels<br/>Stationery<br/>Signage<br/>Packaging</p></div><div><h4 className="text-xs font-black uppercase tracking-wider">Business</h4><p className="mt-4 text-sm text-[#667487]">Bulk pricing<br/>Custom quotes<br/>Artwork advice<br/>Delivery support</p></div><div><h4 className="text-xs font-black uppercase tracking-wider">Support</h4><p className="mt-4 text-sm text-[#667487]">All products<br/>Cart<br/>Contact<br/>Quote request</p></div></div></Shell>
    </footer>
  );
}

export function StorefrontChrome({ currentPath = '/', children }) {
  return <><UtilityBar /><StorefrontHeader currentPath={currentPath} /><main>{children}</main><StorefrontFooter /></>;
}

export default StorefrontChrome;
