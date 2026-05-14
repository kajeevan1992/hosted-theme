import React from 'react';
import { Search, ShoppingCart, User } from 'lucide-react';
import { PrintStorefrontRenderer } from './renderers/PrintStorefrontRenderer';
import { normalizePathSlug, useLiveProductPricing } from './useLiveProductPricing';

const navItems = [
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

function navigate(path) {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new Event('locationchange'));
}

function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="bg-[#242528] text-white">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between px-5 py-2 text-[11px] font-bold">
          <span>Professional print, same day printing, signage and packaging solutions</span>
          <div className="hidden gap-6 md:flex"><span>Business orders</span><span>Bulk pricing</span><span>Fast turnaround</span><span>Bespoke quote support</span></div>
        </div>
      </div>
      <div className="mx-auto flex max-w-[1240px] items-center gap-5 px-5 py-4">
        <button type="button" onClick={() => navigate('/')} className="text-3xl font-black tracking-tight text-[#18a7d0]">HOLO<span className="text-[#151b26]">PRINT</span></button>
        <nav className="hidden flex-1 items-center gap-4 text-xs font-black text-[#151b26] lg:flex">
          {navItems.map(([label, path]) => <button key={label} type="button" onClick={() => navigate(path)} className="hover:text-[#18a7d0]">{label}</button>)}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <button className="grid h-10 w-10 place-items-center rounded-xl border border-[#dfe7f1] bg-white"><Search size={17} /></button>
          <button className="grid h-10 w-10 place-items-center rounded-xl border border-[#dfe7f1] bg-white"><User size={17} /></button>
          <button className="flex h-10 items-center gap-2 rounded-xl border border-[#dfe7f1] bg-white px-3 text-xs font-black"><ShoppingCart size={16} /> £0.00</button>
        </div>
      </div>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-[#dfe7f1] bg-white">
      <div className="bg-[#18a7d0] text-white">
        <div className="mx-auto flex max-w-[1240px] flex-col gap-3 px-5 py-4 text-xs font-bold md:flex-row md:items-center md:justify-between">
          <span>Get the very best print solutions for your business, events and brand campaigns.</span>
          <div className="flex gap-2"><input className="rounded-full px-4 py-2 text-[#151b26]" placeholder="Email address" /><button className="rounded-full bg-black px-5 py-2 text-white">Subscribe</button></div>
        </div>
      </div>
      <div className="mx-auto grid max-w-[1240px] gap-8 px-5 py-12 md:grid-cols-[1.4fr_repeat(4,1fr)]">
        <div><div className="text-3xl font-black text-[#18a7d0]">HOLO<span className="text-[#151b26]">PRINT</span></div><p className="mt-4 max-w-xs text-sm leading-7 text-[#667487]">A fuller ecommerce print storefront direction with broader navigation, clearer sections and cleaner visual tone.</p></div>
        <div><h4 className="text-xs font-black uppercase tracking-wider">Products</h4><p className="mt-4 text-sm text-[#667487]">Business Cards<br/>Flyers<br/>Posters<br/>Booklets</p></div>
        <div><h4 className="text-xs font-black uppercase tracking-wider">Categories</h4><p className="mt-4 text-sm text-[#667487]">Labels<br/>Stationery<br/>Signage<br/>Packaging</p></div>
        <div><h4 className="text-xs font-black uppercase tracking-wider">Business</h4><p className="mt-4 text-sm text-[#667487]">Bulk pricing<br/>Custom quotes<br/>Artwork advice<br/>Delivery support</p></div>
        <div><h4 className="text-xs font-black uppercase tracking-wider">Support</h4><p className="mt-4 text-sm text-[#667487]">All products<br/>Cart<br/>Contact<br/>Quote request</p></div>
      </div>
    </footer>
  );
}

export default function ProductLiveConfigurator({ pathname }) {
  const liveProduct = useLiveProductPricing(pathname);
  const slug = normalizePathSlug(pathname);

  return (
    <>
      <SiteHeader />
      <PrintStorefrontRenderer {...liveProduct} slug={slug} />
      <SiteFooter />
    </>
  );
}
