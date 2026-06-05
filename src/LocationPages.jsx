import React, { useEffect, useMemo, useState } from 'react';
import { Check, Clock, MapPin, PackageCheck, ShieldCheck, Truck } from 'lucide-react';
import { LaunchPageLayout } from './LaunchPages';

const BRAND = {
  line: '#E3E8F0',
  ink: '#161A22',
  muted: '#667487',
  primary: '#18A7D0',
  accent: '#7B3FE4',
};

const API_BASE = import.meta.env.VITE_INTERNAL_STOREFRONT_BASE_URL || import.meta.env.VITE_ADMIN_BASE_URL || import.meta.env.VITE_INTERNAL_API_BASE || import.meta.env.VITE_API_URL || '';

const fallbackLocations = [
  { slug: 'sidcup', name: 'Sidcup', type: 'main-store', status: 'active', seoPath: '/locations/sidcup', address: { line1: 'Sidcup High Street', town: 'Sidcup', county: 'London', country: 'GB' }, collectionHours: weekdays(), openingHours: weekdays(), cutoffTime: '15:00', pickupInstructions: 'Collect from Holo Print Sidcup. Bring your order confirmation or collection PIN.', description: 'Holo Print Sidcup is the main production and collection store for local customers ordering print, signage, design support and artwork services online or in person.', googleBusinessEligible: true, collectionTruth: 'Holo Print store and production base' },
  { slug: 'wimbledon', name: 'Wimbledon', type: 'partner-collection-point', status: 'draft', seoPath: '/print-collection/wimbledon', address: { town: 'Wimbledon', county: 'London', country: 'GB' }, collectionHours: weekdays(), cutoffTime: '13:00', pickupInstructions: 'Partner collection point details will be confirmed when the order is ready. This is not a Holo Print branch.', description: 'Customers in Wimbledon can order print online from Holo Print and collect from an approved partner point when the collection network is active. This is a collection option, not a Holo Print branch.', googleBusinessEligible: false, collectionTruth: 'partner collection point, not a Holo Print branch' },
  { slug: 'kingston', name: 'Kingston', type: 'partner-collection-point', status: 'draft', seoPath: '/print-collection/kingston', address: { town: 'Kingston', county: 'London', country: 'GB' }, collectionHours: weekdays(), cutoffTime: '13:00', pickupInstructions: 'Partner collection point details will be confirmed when the order is ready. This is not a Holo Print branch.', description: 'Customers in Kingston can order print online from Holo Print and collect from an approved partner point when available. This page clearly describes partner collection, not a fake branch.', googleBusinessEligible: false, collectionTruth: 'partner collection point, not a Holo Print branch' },
  { slug: 'croydon', name: 'Croydon', type: 'service-area', status: 'draft', seoPath: '/printing/croydon', address: { town: 'Croydon', county: 'London', country: 'GB' }, collectionHours: [], cutoffTime: '15:00', pickupInstructions: 'Delivery or future collection options will be shown at checkout where available.', description: 'Holo Print can support customers in Croydon through online ordering, artwork upload, quote approval, payment links and delivery or future collection options.', googleBusinessEligible: false, collectionTruth: 'service area page, not a Holo Print branch' },
  { slug: 'bromley', name: 'Bromley', type: 'service-area', status: 'draft', seoPath: '/printing/bromley', address: { town: 'Bromley', county: 'London', country: 'GB' }, collectionHours: [], cutoffTime: '15:00', pickupInstructions: 'Delivery or future collection options will be shown at checkout where available.', description: 'Holo Print can support customers in Bromley through online ordering, artwork upload, quote approval, payment links and delivery or future collection options.', googleBusinessEligible: false, collectionTruth: 'service area page, not a Holo Print branch' },
  { slug: 'sutton', name: 'Sutton', type: 'service-area', status: 'draft', seoPath: '/printing/sutton', address: { town: 'Sutton', county: 'London', country: 'GB' }, collectionHours: [], cutoffTime: '15:00', pickupInstructions: 'Delivery or future collection options will be shown at checkout where available.', description: 'Holo Print can support customers in Sutton through online ordering, artwork upload, quote approval, payment links and delivery or future collection options.', googleBusinessEligible: false, collectionTruth: 'service area page, not a Holo Print branch' },
];

function weekdays() {
  return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => ({ day, open: '09:00', close: '17:30' }));
}

function apiUrl(path, params = {}) {
  const base = API_BASE.replace(/\/$/, '');
  const url = new URL(`${base}${path}`, window.location.origin);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, String(value));
  });
  return url.toString();
}

function typeLabel(type) {
  if (type === 'main-store') return 'Holo Print main store';
  if (type === 'owned-branch') return 'Holo Print branch';
  if (type === 'partner-collection-point') return 'Partner collection point';
  return 'Service area';
}

function routeType(pathname) {
  if (pathname === '/locations') return { kind: 'list' };
  const parts = String(pathname || '').split('/').filter(Boolean);
  if (parts[0] === 'locations' && parts[1]) return { kind: 'detail', type: 'main-store', slug: parts[1] };
  if (parts[0] === 'print-collection' && parts[1]) return { kind: 'detail', type: 'partner-collection-point', slug: parts[1] };
  if (parts[0] === 'printing' && parts[1]) return { kind: 'detail', type: 'service-area', slug: parts[1] };
  return { kind: 'none' };
}

async function fetchLocations() {
  const response = await fetch(apiUrl('/api/internal/storefront/locations'), { credentials: 'include' });
  const payload = await response.json().catch(() => null);
  if (!response.ok || payload?.ok === false) throw new Error(payload?.error || 'Locations unavailable.');
  return payload?.data?.items || [];
}

async function fetchLocation(slug) {
  const response = await fetch(apiUrl(`/api/internal/storefront/locations/${slug}`), { credentials: 'include' });
  const payload = await response.json().catch(() => null);
  if (!response.ok || payload?.ok === false) throw new Error(payload?.error || 'Location unavailable.');
  return payload?.data?.item || null;
}

function Shell({ children, narrow = false }) {
  return <div className={`mx-auto w-full px-4 sm:px-6 lg:px-8 ${narrow ? 'max-w-[980px]' : 'max-w-[1180px]'}`}>{children}</div>;
}

function Hero({ eyebrow, title, body, children }) {
  return <section className="py-8"><Shell narrow><div className="rounded-[28px] border bg-white p-6 shadow-[0_18px_50px_rgba(0,0,0,0.05)] md:p-8" style={{ borderColor: BRAND.line }}><div className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: BRAND.primary }}>{eyebrow}</div><h1 className="mt-3 text-[34px] font-black leading-[1.04] tracking-[-0.045em] md:text-[48px]" style={{ color: BRAND.ink }}>{title}</h1><p className="mt-4 max-w-[760px] text-[13px] leading-7" style={{ color: BRAND.muted }}>{body}</p>{children ? <div className="mt-6">{children}</div> : null}</div></Shell></section>;
}

function PrimaryButton({ children, onClick }) {
  return <button onClick={onClick} className="rounded-full px-5 py-3 text-[12px] font-black uppercase tracking-[0.08em] text-white shadow-[0_14px_30px_rgba(24,167,208,0.22)]" style={{ backgroundColor: BRAND.primary }}>{children}</button>;
}

function SecondaryButton({ children, onClick }) {
  return <button onClick={onClick} className="rounded-full border bg-white px-5 py-3 text-[12px] font-black uppercase tracking-[0.08em]" style={{ borderColor: BRAND.line, color: BRAND.ink }}>{children}</button>;
}

function Address({ location }) {
  const lines = [location.address?.line1, location.address?.line2, location.address?.town, location.address?.county, location.address?.postcode, location.address?.country].filter(Boolean);
  return lines.length ? lines.join(', ') : location.name;
}

function HoursList({ rows = [] }) {
  if (!rows.length) return <p className="text-[12px]" style={{ color: BRAND.muted }}>Hours will be confirmed at checkout.</p>;
  return <div className="grid gap-2">{rows.map((row) => <div key={row.day} className="flex justify-between gap-4 rounded-xl border bg-white px-3 py-2 text-[12px]" style={{ borderColor: BRAND.line, color: BRAND.muted }}><span className="font-bold" style={{ color: BRAND.ink }}>{row.day}</span><span>{row.closed ? 'Closed' : `${row.open}–${row.close}`}</span></div>)}</div>;
}

function LocationCard({ location, navigate }) {
  const path = location.seoPath || (location.type === 'partner-collection-point' ? `/print-collection/${location.slug}` : location.type === 'service-area' ? `/printing/${location.slug}` : `/locations/${location.slug}`);
  return <button onClick={() => navigate(path)} className="rounded-[22px] border bg-white p-5 text-left shadow-[0_12px_30px_rgba(0,0,0,0.035)] hover:shadow-[0_18px_42px_rgba(0,0,0,0.07)]" style={{ borderColor: BRAND.line }}><div className="flex items-start justify-between gap-3"><div><div className="text-[18px] font-black" style={{ color: BRAND.ink }}>{location.name}</div><div className="mt-1 text-[11px] font-black uppercase tracking-[0.12em]" style={{ color: BRAND.primary }}>{typeLabel(location.type)}</div></div><MapPin className="h-5 w-5" style={{ color: BRAND.accent }} /></div><p className="mt-3 text-[12px] leading-7" style={{ color: BRAND.muted }}>{location.description}</p><div className="mt-4 flex flex-wrap gap-2 text-[11px]"><Badge>{location.cutoffTime ? `Cutoff ${location.cutoffTime}` : 'Cutoff TBC'}</Badge><Badge>{location.googleBusinessEligible ? 'Real Holo Print location' : 'Not a Holo Print branch'}</Badge></div></button>;
}

function Badge({ children }) {
  return <span className="rounded-full border bg-white px-3 py-1" style={{ borderColor: BRAND.line, color: BRAND.muted }}>{children}</span>;
}

function TruthNotice({ location }) {
  if (location.type === 'main-store' || location.type === 'owned-branch') return <div className="rounded-[18px] border p-4 text-[12px] leading-6" style={{ borderColor: '#B7E8BF', backgroundColor: '#F0FFF3', color: '#286D35' }}><ShieldCheck className="mb-2 h-5 w-5" />This is a genuine Holo Print location. You can use it for local collection when your order is ready.</div>;
  return <div className="rounded-[18px] border p-4 text-[12px] leading-6" style={{ borderColor: '#F2D79B', backgroundColor: '#FFF8E8', color: '#7A5414' }}><ShieldCheck className="mb-2 h-5 w-5" />{location.collectionTruth || 'This is not a fake Holo Print branch. Collection/service availability is shown honestly at checkout.'}</div>;
}

export function LocationsIndexPage({ navigate }) {
  const [locations, setLocations] = useState(fallbackLocations);
  const [message, setMessage] = useState('');
  useEffect(() => { let cancelled = false; fetchLocations().then((items) => { if (!cancelled && items.length) setLocations(items); }).catch((error) => { if (!cancelled) setMessage(error.message); }); return () => { cancelled = true; }; }, []);
  const grouped = useMemo(() => ({ stores: locations.filter((item) => item.type === 'main-store' || item.type === 'owned-branch'), partners: locations.filter((item) => item.type === 'partner-collection-point'), service: locations.filter((item) => item.type === 'service-area') }), [locations]);
  return <LaunchPageLayout navigate={navigate} pathname="/locations"><Hero eyebrow="Locations & collection" title="Holo Print stores, collection points and service areas." body="Order online, upload artwork, choose payment or quote approval, then use the available collection or delivery option shown at checkout. Partner collection points are labelled honestly and are not presented as fake Holo Print branches."><div className="flex flex-wrap gap-3"><PrimaryButton onClick={() => navigate('/all-products')}>Browse products</PrimaryButton><SecondaryButton onClick={() => navigate('/contact')}>Ask about collection</SecondaryButton></div></Hero>{message ? <Shell narrow><div className="mb-4 rounded-xl border bg-white p-3 text-[12px]" style={{ borderColor: BRAND.line, color: BRAND.muted }}>Using launch fallback locations because live locations could not be loaded: {message}</div></Shell> : null}<LocationSection title="Holo Print stores" items={grouped.stores} navigate={navigate} /><LocationSection title="Partner collection points" items={grouped.partners} navigate={navigate} /><LocationSection title="Service areas" items={grouped.service} navigate={navigate} /></LaunchPageLayout>;
}

function LocationSection({ title, items, navigate }) {
  if (!items.length) return null;
  return <Shell><div className="mb-8"><h2 className="mb-4 text-[24px] font-black tracking-[-0.04em]" style={{ color: BRAND.ink }}>{title}</h2><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{items.map((location) => <LocationCard key={location.slug} location={location} navigate={navigate} />)}</div></div></Shell>;
}

export function LocationDetailPage({ pathname, navigate }) {
  const route = routeType(pathname);
  const fallback = fallbackLocations.find((item) => item.slug === route.slug && (route.type === item.type || (route.type === 'main-store' && ['main-store', 'owned-branch'].includes(item.type)))) || null;
  const [location, setLocation] = useState(fallback);
  const [message, setMessage] = useState('');
  useEffect(() => { let cancelled = false; if (!route.slug) return undefined; fetchLocation(route.slug).then((item) => { if (!cancelled && item) setLocation(item); }).catch((error) => { if (!cancelled) setMessage(error.message); }); return () => { cancelled = true; }; }, [route.slug]);
  if (!location) return <LaunchPageLayout navigate={navigate} pathname={pathname}><Hero eyebrow="Location not found" title="This location page is not live yet." body="The location may still be in setup. Please contact Holo Print for current collection and delivery options."><PrimaryButton onClick={() => navigate('/contact')}>Contact us</PrimaryButton></Hero></LaunchPageLayout>;
  return <LaunchPageLayout navigate={navigate} pathname={pathname}><Hero eyebrow={typeLabel(location.type)} title={location.type === 'partner-collection-point' ? `Print collection in ${location.name}` : location.type === 'service-area' ? `Printing for ${location.name}` : `Holo Print ${location.name}`} body={location.description}><div className="flex flex-wrap gap-3"><PrimaryButton onClick={() => navigate('/all-products')}>Order print online</PrimaryButton><SecondaryButton onClick={() => navigate('/bespoke-quote')}>Request a quote</SecondaryButton></div></Hero>{message ? <Shell narrow><div className="mb-4 rounded-xl border bg-white p-3 text-[12px]" style={{ borderColor: BRAND.line, color: BRAND.muted }}>Using launch fallback content because live location could not be loaded: {message}</div></Shell> : null}<Shell narrow><div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]"><div className="space-y-4"><Info title="Address / area" icon={<MapPin className="h-5 w-5" />}><p>{Address({ location })}</p></Info><Info title="Collection instructions" icon={<PackageCheck className="h-5 w-5" />}><p>{location.pickupInstructions}</p></Info><Info title="How it works" icon={<Truck className="h-5 w-5" />}><ol className="grid gap-2"><li>1. Choose your product or request a custom quote.</li><li>2. Upload artwork now or send it after ordering.</li><li>3. Pay online or wait for an approved quote payment link.</li><li>4. We confirm production and collection/delivery availability.</li></ol></Info></div><div className="space-y-4"><TruthNotice location={location} /><Info title="Collection hours" icon={<Clock className="h-5 w-5" />}><HoursList rows={location.collectionHours || location.openingHours || []} /></Info><Info title="Useful details" icon={<Check className="h-5 w-5" />}><div className="grid gap-2 text-[12px]"><p>Cutoff time: <strong>{location.cutoffTime || 'TBC'}</strong></p><p>Collection fee: <strong>£{((location.collectionFeeMinor || 0) / 100).toFixed(2)}</strong></p><p>Google Business eligible: <strong>{location.googleBusinessEligible ? 'Yes' : 'No'}</strong></p></div></Info></div></div></Shell></LaunchPageLayout>;
}

function Info({ title, icon, children }) {
  return <div className="rounded-[22px] border bg-white p-5 shadow-[0_12px_30px_rgba(0,0,0,0.035)]" style={{ borderColor: BRAND.line }}><div className="mb-3 flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-full text-white" style={{ backgroundColor: BRAND.primary }}>{icon}</div><h2 className="text-[17px] font-black" style={{ color: BRAND.ink }}>{title}</h2></div><div className="text-[12px] leading-7" style={{ color: BRAND.muted }}>{children}</div></div>;
}

export function LocationPageRouter({ pathname, navigate }) {
  const route = routeType(pathname);
  if (route.kind === 'list') return <LocationsIndexPage navigate={navigate} />;
  if (route.kind === 'detail') return <LocationDetailPage pathname={pathname} navigate={navigate} />;
  return null;
}

export function isLocationRoute(pathname) {
  return routeType(pathname).kind !== 'none';
}
