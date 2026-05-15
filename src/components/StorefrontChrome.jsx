import React, { useState } from 'react';
import { Menu, Search, ShoppingCart, User, X } from 'lucide-react';
import AnnouncementBar from '../storefront/layouts/AnnouncementBar';
import NavigationEngine from '../storefront/layouts/NavigationEngine';
import StorefrontFooter from '../storefront/layouts/StorefrontFooter';
import storefrontLayoutPayload from '../storefront/data/layoutPayload';
import { useStorefrontLayout } from '../storefront/hooks/useStorefrontLayout';

const BRAND = {
  line: '#E7EDF3',
  ink: '#161A22',
  muted: '#667487',
  primary: '#18A7D0',
  background: '#F7F8FC',
};

function Shell({ children }) {
  return <div className="mx-auto w-full max-w-[1380px] px-4 sm:px-6 lg:px-8">{children}</div>;
}

function currency(value) {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(Number(value || 0));
}

function navigate(path) {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new Event('locationchange'));
}

function IconButton({ icon, onClick }) {
  return (
    <button
      onClick={onClick}
      className="grid h-11 w-11 place-items-center rounded-2xl border bg-white transition hover:-translate-y-[1px] hover:shadow-[0_12px_28px_rgba(0,0,0,0.08)]"
      style={{ borderColor: BRAND.line }}
    >
      {icon}
    </button>
  );
}

function StorefrontHeader({ currentPath = '/', cartCount = 0, cartSubtotal = 0, layout = storefrontLayoutPayload }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navItems = layout?.navigation?.items || [];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl">
      <div className="border-b border-[#EDF2F7] bg-white">
        <Shell>
          <div className="flex h-[88px] items-center gap-8">
            <div className="flex items-center gap-3 xl:hidden">
              <button className="rounded-2xl border border-[#E7EDF3] p-3" onClick={() => setMobileOpen(true)}>
                <Menu className="h-5 w-5" />
              </button>
            </div>

            <button onClick={() => navigate('/')} className="flex shrink-0 items-center leading-none">
              <span className="text-[44px] font-black tracking-[-0.08em]" style={{ color: BRAND.primary }}>
                HOLO
              </span>
              <span className="text-[44px] font-black tracking-[-0.08em]" style={{ color: BRAND.ink }}>
                PRINT
              </span>
            </button>

            <div className="hidden flex-1 xl:flex xl:justify-center">
              <NavigationEngine data={layout?.navigation || {}} currentPath={currentPath} />
            </div>

            <div className="ml-auto flex items-center gap-3">
              <IconButton icon={<Search className="h-4 w-4" />} onClick={() => window.dispatchEvent(new CustomEvent('storefront:search'))} />

              <IconButton icon={<User className="h-4 w-4" />} onClick={() => navigate('/login')} />

              <button
                onClick={() => navigate('/cart')}
                className="flex items-center gap-3 rounded-2xl border bg-white px-4 py-3 text-[13px] font-black shadow-sm transition hover:-translate-y-[1px] hover:shadow-[0_14px_30px_rgba(0,0,0,0.08)]"
                style={{ borderColor: BRAND.line, color: BRAND.ink }}
              >
                <ShoppingCart className="h-4 w-4" />

                <div className="hidden text-left sm:block">
                  <div className="text-[10px] uppercase tracking-[0.16em] text-[#7C8B9D]">
                    Cart Total
                  </div>
                  <div>{currency(cartSubtotal)}</div>
                </div>

                {cartCount > 0 ? (
                  <span className="rounded-full px-2 py-1 text-[10px] text-white" style={{ background: 'linear-gradient(135deg,#18A7D0,#7B3FE4)' }}>
                    {cartCount}
                  </span>
                ) : null}
              </button>
            </div>
          </div>
        </Shell>
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 bg-black/30 xl:hidden" onClick={() => setMobileOpen(false)}>
          <div className="h-full w-[340px] overflow-y-auto bg-white px-5 py-6 shadow-[0_30px_80px_rgba(0,0,0,0.18)]" onClick={(event) => event.stopPropagation()}>
            <div className="mb-8 flex items-center justify-between">
              <div className="text-[28px] font-black tracking-[-0.05em] text-[#161A22]">
                Menu
              </div>

              <button className="rounded-2xl border border-[#E7EDF3] p-3" onClick={() => setMobileOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-2">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  className="rounded-2xl px-4 py-4 text-left text-[15px] font-black text-[#161A22] transition hover:bg-[#F7F8FC]"
                  onClick={() => {
                    navigate(item.href || '#');
                    setMobileOpen(false);
                  }}
                >
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

export function StorefrontChrome({ currentPath = '/', children, layout: layoutOverride }) {
  const { layout: liveLayout } = useStorefrontLayout();

  const layout = layoutOverride || liveLayout || storefrontLayoutPayload;

  return (
    <div className="min-h-screen bg-[#F7F8FC] text-[#161A22]">
      <AnnouncementBar data={layout?.announcement} />
      <StorefrontHeader currentPath={currentPath} layout={layout} />
      <main>{children}</main>
      <StorefrontFooter data={layout?.footer} />
    </div>
  );
}

export default StorefrontChrome;
