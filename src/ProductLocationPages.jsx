import React, { useEffect, useMemo, useState } from 'react';
import { Check, Clock, FileCheck2, MapPin, PackageCheck, ShieldCheck, Truck } from 'lucide-react';
import { LaunchPageLayout } from './LaunchPages';

const BRAND = {
  line: '#E3E8F0',
  ink: '#161A22',
  muted: '#667487',
  primary: '#18A7D0',
  accent: '#7B3FE4',
};

const API_BASE = import.meta.env.VITE_INTERNAL_STOREFRONT_BASE_URL || import.meta.env.VITE_ADMIN_BASE_URL || import.meta.env.VITE_INTERNAL_API_BASE || import.meta.env.VITE_API_URL || '';

const productAliases = {
  flyers: 'flyers-leaflets',
  leaflets: 'flyers-leaflets',
  banners: 'pvc-banners',
  'pvc-banner': 'pvc-banners',
  signage: 'shop-boards-signage',
  'shop-boards': 'shop-boards-signage',
};

const productFallbacks = {
  'business-cards': { slug: 'business-cards', name: 'Business Cards', description: 'Premium business cards for local businesses, events and startups.', priceFromMinor: 1900, currency: 'GBP' },
  'flyers-leaflets': { slug: 'flyers-leaflets', name: 'Flyers & Leaflets', description: 'A6, A5 and A4 flyers/leaflets for promotions, menus and events.', priceFromMinor: 2900, currency: 'GBP' },
  'pvc-banners': { slug: 'pvc-banners', name: 'PVC Banners', description: 'Outdoor PVC banners with hemming and eyelets for shops, events and promotions.', priceFromMinor: 3900, currency: 'GBP' },
  posters: { slug: 'posters', name: 'Posters', description: 'Indoor posters for promotions, events, windows and wall displays.', priceFromMinor: 1200, currency: 'GBP' },
  'stickers-labels': { slug: 'stickers-labels', name: 'Stickers & Labels', description: 'Sticker sheets, product labels and promotional stickers.', priceFromMinor: 2500, currency: 'GBP' },
  booklets: { slug: 'booklets', name: 'Booklets', description: 'Stapled booklets, brochures and programmes. Final price depends on pages and finishing.', priceFromMinor: 0, currency: 'GBP' },
  'shop-boards-signage': { slug: 'shop-boards-signage', name: 'Shop Boards & Signage', description: 'Foamex, ACM and shop signage. Custom sizing and fitting needs approval.', priceFromMinor: 0, currency: 'GBP' },
};

const locationFallbacks = {
  sidcup: { slug: 'sidcup', name: 'Sidcup', type: 'main-store', cutoffTime: '15:00', collectionFeeMinor: 0, pickupInstructions: 'Collect from Holo Print Sidcup. Bring your order confirmation or collection PIN.', collectionTruth: 'Holo Print store and production base.', googleBusinessEligible: true },
  wimbledon: { slug: 'wimbledon', name: 'Wimbledon', type: 'partner-collection-point', cutoffTime: '13:00', collectionFeeMinor: 0, pickupInstructions: 'Partner collection details will be confirmed when the order is ready. This is not a Holo Print branch.', collectionTruth: 'Partner collection point, not a Holo Print branch.', googleBusinessEligible: false },
  kingston: { slug: 'kingston', name: 'Kingston', type: 'partner-collection-point', cutoffTime: '13:00', collectionFeeMinor: 0, pickupInstructions: 'Partner collection details will be confirmed when the order is ready. This is not a Holo Print branch.', collectionTruth: 'Partner collection point, not a Holo Print branch.', googleBusinessEligible: false },
  croydon: { slug: 'croydon', name: 'Croydon', type: 'service-area', cutoffTime: '15:00', collectionFeeMinor: 0, pickupInstructions: 'Delivery or future collection options will be shown at checkout where available.', collectionTruth: 'Service area, not a Holo Print branch.', googleBusinessEligible: false },
  bromley: { slug: 'bromley', name: 'Bromley', type: 'service-area', cutoffTime: '15:00', collectionFeeMinor: 0, pickupInstructions: 'Delivery or future collection options will be shown at checkout where available.', collectionTruth: 'Service area, not a Holo Print branch.', googleBusinessEligible: false },
  sutton: { slug: 'sutton', name: 'Sutton', type: 'service-area', cutoffTime: '15:00', collectionFeeMinor: 0, pickupInstructions: 'Delivery or future collection options will be shown at checkout where available.', collectionTruth: 'Service area, not a Holo Print branch.', googleBusinessEligible: false },
};

function cleanSlug(value) {
  return String(value || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function productSlug(value) {
  const clean = cleanSlug(value);
  return productAliases[clean] || clean;
}

function routeParts(pathname) {
  const parts = String(pathname || '').split('/').filter(Boolean);
  if (parts.length !== 2) return null;
  const [product, location] = parts;
  if (!isKnownProduct(product)) return null;
  if (!isKnownLocation(location)) return null;
  return { productSlug: productSlug(product), requestedProductSlug: cleanSlug(product), locationSlug: cleanSlug(location) };
}

function isKnownProduct(slug) {
  const clean = cleanSlug(slug);
  return Boolean(productFallbacks[productSlug(clean)] || productAliases[clean]);
}

function isKnownLocation(slug) {
  return Boolean(locationFallbacks[cleanSlug(slug)]);
}

function apiUrl(path, params = {}) {
  const base = API_BASE.replace(/\/$/, '');
  const url = new URL(`${base}${path}`, window.location.origin);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, String(value));
  });
  return url.toString();
}

async function resolveProductLocation(pathname, parts) {
  const response = await fetch(apiUrl('/api/internal/storefront/product-location-pages/resolve', { path: pathname, productSlug: parts.productSlug, locationSlug: parts.locationSlug }), { credentials: 'include' });
  const payload = await response.json().catch(() => null);
  if (!response.ok || payload?.ok === false) throw new Error(payload?.error || 'Product-location page unavailable.');
  return payload?.data || null;
}

function fallbackData(pathname, parts) {
  const product = productFallbacks[parts.productSlug] || { slug: parts.productSlug, name: parts.productSlug.replace(/-/g, ' '), description: 'Local print product from Holo Print.', priceFromMinor: 0, currency: 'GBP' };
  const location = locationFallbacks[parts.locationSlug] || { slug: parts.locationSlug, name: parts.locationSlug.replace(/-/g, ' '), type: 'service-area', collectionTruth: 'Location availability will be confirmed at checkout.', googleBusinessEligible: false };
  const productName = product.name;
  const locationName = location.name;
  return {
    product,
    location,
    localTruth: location.collectionTruth,
    orderPath: `/${product.slug}`,
    quotePath: '/bespoke-quote',
    artworkGuidePath: '/artwork-guide',
    seo: {
      path: pathname,
      title: `${productName} in ${locationName} | Order Online & Collect Locally | Holo Print`,
      h1: `${productName} in ${locationName}`,
      metaDescription: `Order ${productName} in ${locationName} with Holo Print. Upload artwork online, request design help, choose delivery or local collection where available.`,
      introCopy: `Holo Print helps customers in ${locationName} order ${productName} online with artwork upload, quote support, payment options and honest local collection or delivery information.`,
      targetKeyword: `${productName} ${locationName}`,
      faqItems: [
        { question: `Can I order ${productName} in ${locationName}?`, answer: `Yes. You can order online and Holo Print will show available collection or delivery options at checkout.` },
        { question: `Can I collect in ${locationName}?`, answer: location.collectionTruth },
        { question: 'Can I upload artwork later?', answer: 'Yes. You can upload artwork during checkout or provide it after placing the order.' },
      ],
      internalLinks: [{ label: 'All products', href: '/all-products' }, { label: 'Artwork guide', href: '/artwork-guide' }, { label: 'Request quote', href: '/bespoke-quote' }],
    },
  };
}

function money(product) {
  const amount = Number(product?.priceFromMinor || 0);
  if (!amount) return 'Quote first';
  return `From £${(amount / 100).toFixed(2)}`;
}

function locationTypeLabel(location) {
  if (location?.type === 'main-store') return 'Holo Print store';
  if (location?.type === 'owned-branch') return 'Holo Print branch';
  if (location?.type === 'partner-collection-point') return 'Partner collection point';
  return 'Service area';
}

function Shell({ children, narrow = false }) {
  return <div className={`mx-auto w-full px-4 sm:px-6 lg:px-8 ${narrow ? 'max-w-[980px]' : 'max-w-[1180px]'}`}>{children}</div>;
}

function Hero({ data, navigate }) {
  const { product, location, seo } = data;
  return <section className="py-8"><Shell narrow><div className="rounded-[28px] border bg-white p-6 shadow-[0_18px_50px_rgba(0,0,0,0.05)] md:p-8" style={{ borderColor: BRAND.line }}><div className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: BRAND.primary }}>{seo?.targetKeyword || `${product.name} ${location.name}`}</div><h1 className="mt-3 text-[34px] font-black leading-[1.04] tracking-[-0.045em] md:text-[48px]" style={{ color: BRAND.ink }}>{seo?.h1 || `${product.name} in ${location.name}`}</h1><p className="mt-4 max-w-[780px] text-[13px] leading-7" style={{ color: BRAND.muted }}>{seo?.introCopy || product.description}</p><div className="mt-6 flex flex-wrap gap-3"><PrimaryButton onClick={() => navigate(data.orderPath || `/${product.slug}`)}>Order {product.name}</PrimaryButton><SecondaryButton onClick={() => navigate(data.quotePath || '/bespoke-quote')}>Request a quote</SecondaryButton></div></div></Shell></section>;
}

function PrimaryButton({ children, onClick }) {
  return <button onClick={onClick} className="rounded-full px-5 py-3 text-[12px] font-black uppercase tracking-[0.08em] text-white shadow-[0_14px_30px_rgba(24,167,208,0.22)]" style={{ backgroundColor: BRAND.primary }}>{children}</button>;
}

function SecondaryButton({ children, onClick }) {
  return <button onClick={onClick} className="rounded-full border bg-white px-5 py-3 text-[12px] font-black uppercase tracking-[0.08em]" style={{ borderColor: BRAND.line, color: BRAND.ink }}>{children}</button>;
}

function Info({ title, icon, children }) {
  return <div className="rounded-[22px] border bg-white p-5 shadow-[0_12px_30px_rgba(0,0,0,0.035)]" style={{ borderColor: BRAND.line }}><div className="mb-3 flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-full text-white" style={{ backgroundColor: BRAND.primary }}>{icon}</div><h2 className="text-[17px] font-black" style={{ color: BRAND.ink }}>{title}</h2></div><div className="text-[12px] leading-7" style={{ color: BRAND.muted }}>{children}</div></div>;
}

function Badge({ children }) {
  return <span className="rounded-full border bg-white px-3 py-1 text-[11px]" style={{ borderColor: BRAND.line, color: BRAND.muted }}>{children}</span>;
}

function TruthNotice({ data }) {
  const { location, localTruth } = data;
  const real = location?.type === 'main-store' || location?.type === 'owned-branch';
  return <div className="rounded-[18px] border p-4 text-[12px] leading-6" style={{ borderColor: real ? '#B7E8BF' : '#F2D79B', backgroundColor: real ? '#F0FFF3' : '#FFF8E8', color: real ? '#286D35' : '#7A5414' }}><ShieldCheck className="mb-2 h-5 w-5" />{localTruth || 'Collection and delivery availability is confirmed at checkout.'}</div>;
}

function Faq({ items = [] }) {
  if (!items.length) return null;
  return <Shell narrow><div className="mt-6 rounded-[24px] border bg-white p-6" style={{ borderColor: BRAND.line }}><h2 className="text-[24px] font-black tracking-[-0.04em]" style={{ color: BRAND.ink }}>Questions about this page</h2><div className="mt-4 grid gap-3">{items.map((item, index) => <div key={`${item.question}-${index}`} className="rounded-xl border p-4" style={{ borderColor: BRAND.line }}><h3 className="text-[13px] font-black" style={{ color: BRAND.ink }}>{item.question}</h3><p className="mt-2 text-[12px] leading-7" style={{ color: BRAND.muted }}>{item.answer}</p></div>)}</div></div></Shell>;
}

function InternalLinks({ links = [], navigate }) {
  const safeLinks = links.length ? links : [{ label: 'All products', href: '/all-products' }, { label: 'Artwork guide', href: '/artwork-guide' }, { label: 'Contact', href: '/contact' }];
  return <Shell narrow><div className="mt-6 rounded-[24px] border bg-white p-6" style={{ borderColor: BRAND.line }}><h2 className="text-[20px] font-black tracking-[-0.035em]" style={{ color: BRAND.ink }}>Helpful links</h2><div className="mt-4 flex flex-wrap gap-2">{safeLinks.map((link) => <button key={`${link.href}-${link.label}`} onClick={() => navigate(link.href)} className="rounded-full border px-4 py-2 text-[12px] font-bold" style={{ borderColor: BRAND.line, color: BRAND.ink }}>{link.label}</button>)}</div></div></Shell>;
}

export function ProductLocationPage({ pathname, navigate }) {
  const parts = routeParts(pathname);
  const [data, setData] = useState(parts ? fallbackData(pathname, parts) : null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let cancelled = false;
    if (!parts) return undefined;
    resolveProductLocation(pathname, parts).then((next) => { if (!cancelled && next) setData(next); }).catch((error) => { if (!cancelled) setMessage(error.message); });
    return () => { cancelled = true; };
  }, [pathname]);

  const facts = useMemo(() => {
    if (!data) return [];
    return [
      ['Product', data.product?.name || 'Print'],
      ['Price', money(data.product)],
      ['Location', data.location?.name || parts?.locationSlug],
      ['Location type', locationTypeLabel(data.location)],
      ['Cutoff', data.location?.cutoffTime || 'Confirmed at checkout'],
      ['Collection fee', `£${((data.location?.collectionFeeMinor || 0) / 100).toFixed(2)}`],
    ];
  }, [data]);

  if (!parts || !data) return null;
  return <LaunchPageLayout navigate={navigate} pathname={pathname}><Hero data={data} navigate={navigate} />{message ? <Shell narrow><div className="mb-4 rounded-xl border bg-white p-3 text-[12px]" style={{ borderColor: BRAND.line, color: BRAND.muted }}>Using launch fallback content because live SEO/location data could not be loaded: {message}</div></Shell> : null}<Shell narrow><div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]"><div className="space-y-4"><Info title="Order online" icon={<PackageCheck className="h-5 w-5" />}><p>{data.product?.description}</p><div className="mt-3 flex flex-wrap gap-2">{facts.map(([label, value]) => <Badge key={label}>{label}: {value}</Badge>)}</div></Info><Info title="Artwork and approval" icon={<FileCheck2 className="h-5 w-5" />}><p>Upload print-ready artwork with 3mm bleed where possible. If your job needs manual review, Holo Print can approve the quote and send a secure payment link before production.</p></Info><Info title="Collection or delivery" icon={<Truck className="h-5 w-5" />}><p>{data.location?.pickupInstructions || 'Checkout will show collection and delivery options available for this product and location.'}</p></Info></div><div className="space-y-4"><TruthNotice data={data} /><Info title="Ready time guidance" icon={<Clock className="h-5 w-5" />}><p>Ready time depends on product type, payment, artwork approval, cutoff time and production capacity. The checkout/order flow will confirm the next step.</p></Info><Info title="Why use Holo Print?" icon={<Check className="h-5 w-5" />}><ul className="grid gap-2"><li>Local print support with online ordering.</li><li>Artwork upload and design help available.</li><li>Quote/order with secure payment link for custom jobs.</li><li>Honest collection-point and service-area wording.</li></ul></Info></div></div></Shell><Faq items={data.seo?.faqItems || []} /><InternalLinks links={data.seo?.internalLinks || []} navigate={navigate} /></LaunchPageLayout>;
}

export function isProductLocationRoute(pathname) {
  return Boolean(routeParts(pathname));
}
