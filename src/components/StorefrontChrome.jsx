import React, { useState } from 'react';
import { Menu, Search, ShoppingCart, User, X } from 'lucide-react';
import AnnouncementBar from '../storefront/layouts/AnnouncementBar';
import NavigationEngine from '../storefront/layouts/NavigationEngine';
import StorefrontFooter from '../storefront/layouts/StorefrontFooter';
import storefrontLayoutPayload from '../storefront/data/layoutPayload';

const BRAND = {
  line: '#E3E8F0',
  ink: '#161A22',
  muted: '#667487',
  primary: '#18A7D0',
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

function IconButton({ icon, onClick }) {
  return (
    <button onClick={onClick} className="grid h-9 w-9 place-items-center rounded-xl border bg-white" style={{ borderColor: BRAND.line }}>
      {icon}
    </button>
  );
}

function StorefrontHeader({ currentPath = '/', cartCount = 0, cartSubtotal = 0, layout = storefrontLayoutPayload }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navItems = layout?.navigation?.items || [];

  return (
    <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur shadow-[0_12px_30px_rgba(0,0,0,0.04)]" style={{ borderColor: BRAND.line }}>
      <Shell>
        <div className="grid h-[74px] grid-cols-[auto_1fr_auto] items-center gap-6">
          <div className="flex items-center gap-3">
            <button className="rounded-xl p-2 xl:hidden" onClick={() => setMobileOpen(true)}>
              <Menu className="h-5 w-5" />
            </button>
            <button onClick={() => navigate('/')} className="flex items-center gap-0.5">
              <span className="text-[42px] font-black tracking-[-0.055em]" style={{ color: BRAND.primary }}>HOLO</span>
              <span className="text-[42px] font-black tracking-[-0.055em]" style={{ color: BRAND.ink }}>PRINT</span>
            </button>
          </div>

          <NavigationEngine data={layout?.navigation || {}} currentPath={currentPath} />

          <div className="ml-auto flex items-center gap-2">
            <IconButton icon={<Search className="h-4 w-4" />} onClick={() => window.dispatchEvent(new CustomEvent('storefront:search'))} />
            <IconButton icon={<User className="h-4 w-4" />} onClick={() => navigate('/login')} />
            <button onClick={() => navigate('/cart')} className="flex items-center gap-2 rounded-xl border px-3 py-2 text-[12px] font-semibold" style={{ borderColor: BRAND.line, color: BRAND.muted, backgroundColor: 'white' }}>
              <ShoppingCart className="h-4 w-4" />
              <span>{currency(cartSubtotal)}</span>
              {cartCount > 0 ? <span className="rounded-full px-1.5 py-0.5 text-[10px] text-white" style={{ background: 'linear-gradient(135deg, #18A7D0, #7B3FE4)' }}>{cartCount}</span> : null}
            </button>
          </div>
        </div>
      </Shell>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 bg-black/25 xl:hidden" onClick={() => setMobileOpen(false)}>
          <div className="h-full w-[320px] bg-white p-5" onClick={(event) => event.stopPropagation()}>
            <div className="mb-6 flex items-center justify-between">
              <div className="text-[24px] font-black">Menu</div>
              <button onClick={() => setMobileOpen(false)}><X className="h-5 w-5" /></button>
            </div>
            <div className="grid gap-1">
              {navItems.map((item) => (
                <button key={item.label} className="rounded-xl px-3 py-3 text-left text-[14px] font-semibold hover:bg-[#F6F7F8]" onClick={() => { navigate(item.href || '#'); setMobileOpen(false); }}>
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}

export function StorefrontChrome({ currentPath = '/', children, layout = storefrontLayoutPayload }) {
  return (
    <>
      <AnnouncementBar data={layout?.announcement} />
      <StorefrontHeader currentPath={currentPath} layout={layout} />
      <main>{children}</main>
      <StorefrontFooter data={layout?.footer} />
    </>
  );
}

export default StorefrontChrome;
