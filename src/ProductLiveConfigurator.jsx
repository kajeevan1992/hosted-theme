import React, { useMemo, useState } from 'react';
import { AlertTriangle, Check, ChevronDown, FileCheck, ShoppingCart, Sparkles, Truck, UploadCloud } from 'lucide-react';
import { moneyFromMinor, pricingMatrixRows } from './livePricingBridge';
import { normalizePathSlug, useLiveProductPricing } from './useLiveProductPricing';

function groupKey(group) { return group.id || group.key || group.label; }
function groupName(group) { return group.label || group.name || prettyKey(groupKey(group)); }
function groupValues(group) { return Array.isArray(group.values) ? group.values : Array.isArray(group.options) ? group.options : []; }
function valueKey(value) { return typeof value === 'object' ? String(value.value || value.label || '') : String(value || ''); }
function valueLabel(value) { return typeof value === 'object' ? String(value.label || value.value || '') : String(value || ''); }
function prettyKey(value = '') { return String(value).replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()); }
function normaliseName(value = '') { return String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''); }

function getGroupRole(group) {
  const key = normaliseName(`${groupKey(group)} ${groupName(group)}`);
  if (key.includes('quantity')) return 'quantity';
  if (key.includes('paper-size') || key === 'size') return 'size';
  if (key.includes('finished-size')) return 'finished-size';
  if (key.includes('paper-type') || key.includes('material')) return 'paper';
  if (key.includes('lamination')) return 'lamination';
  if (key.includes('print-type')) return 'printing';
  if (key.includes('turnaround')) return 'turnaround';
  if (key.includes('product-finishing')) return 'corners';
  if (key.includes('spotuv') || key.includes('spot-uv')) return 'spotuv';
  if (key.includes('fold-type')) return 'fold';
  if (key.includes('orientation')) return 'orientation';
  if (key.includes('cut-type')) return 'cut';
  if (key.includes('sets')) return 'sets';
  if (key.includes('page-number')) return 'pages';
  return 'other';
}

const ROLE_ORDER = { size: 10, 'finished-size': 11, paper: 20, lamination: 30, printing: 40, corners: 50, quantity: 60, turnaround: 70, spotuv: 80, fold: 90, orientation: 100, cut: 110, sets: 120, pages: 130, other: 999 };
function isSecondaryRole(role) { return ['spotuv', 'fold', 'orientation', 'cut', 'sets', 'pages', 'other'].includes(role); }

function optionPriceForSelection(rows, selections, groupKeyValue, optionValue) {
  const match = rows.find((row) => {
    const options = row?.options || {};
    return Object.entries({ ...selections, [groupKeyValue]: optionValue }).every(([key, value]) => !(key in options) || String(options[key]) === String(value));
  });
  return match?.priceMinor || null;
}

function shouldRecommend(role, index, label) {
  const normal = normaliseName(label);
  if (role === 'quantity') return ['500', '1000'].includes(normal) || index === 3;
  if (role === 'paper') return normal.includes('400') || normal.includes('silk');
  if (role === 'lamination') return normal.includes('matt') || normal.includes('soft-touch');
  if (role === 'printing') return normal.includes('double');
  if (role === 'size') return index === 0;
  return false;
}

function DiagnosticPanel({ title, slug, children }) {
  return <main className="min-h-screen bg-[#F5F7FB] px-6 py-16 text-[#151B26]"><div className="mx-auto max-w-4xl rounded-[24px] border border-amber-200 bg-white p-8 shadow-sm"><div className="flex items-start gap-4"><AlertTriangle className="mt-1 text-amber-500" size={28} /><div><p className="text-xs font-black uppercase tracking-[0.22em] text-amber-600">Storefront product diagnostic</p><h1 className="mt-3 text-3xl font-black">{title}</h1><p className="mt-2 text-[#667487]">Slug: {slug}</p><div className="mt-6 rounded-2xl bg-[#F7F8FC] p-4 text-sm text-[#151B26]">{children}</div></div></div></div></main>;
}

function ProductPreviewCard({ title }) {
  return <div className="overflow-hidden rounded-[24px] border border-[#DDE6F2] bg-white shadow-sm"><div className="relative h-[360px] md:h-[430px] bg-gradient-to-br from-[#B7EDF5] via-[#F7FCFF] to-[#EDF4FA] p-7"><button className="absolute left-5 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white font-black shadow-sm">‹</button><button className="absolute right-5 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white font-black shadow-sm">›</button><div className="flex gap-2"><span className="h-4 w-4 rounded-full bg-[#20B8D8]" /><span className="h-4 w-4 rounded-full bg-white/70" /></div><div className="mx-auto mt-12 md:mt-16 h-36 md:h-40 w-[78%] rotate-[-7deg] rounded-xl bg-white p-8 shadow-2xl shadow-slate-300/70"><p className="text-2xl font-black text-[#20A8C8]">HOLO<span className="text-[#151B26]">PRINT</span></p></div><div className="mx-auto -mt-3 md:-mt-4 h-36 md:h-44 w-[82%] rotate-[2deg] rounded-xl bg-white p-8 shadow-2xl shadow-slate-300/70"><h2 className="text-2xl md:text-3xl font-black leading-tight text-[#123044]">{title.replace('Standard ', '')} Front</h2><p className="mt-2 text-base md:text-lg font-semibold text-[#667487]">Replace later</p></div></div><div className="grid grid-cols-5 gap-3 border-t border-[#DDE6F2] p-4">{[1, 2, 3, 4, 5].map((item) => <div key={item} className={`h-14 md:h-16 rounded-xl border ${item === 5 ? 'border-[#20B8D8]' : 'border-[#DDE6F2]'} bg-gradient-to-br from-[#DFFAFF] to-white`} />)}</div></div>;
}

function OptionGroup({ group, selections, setSelections, matrixRows }) {
  const key = groupKey(group);
  const values = groupValues(group);
  const selected = selections[key];
  const role = getGroupRole(group);
  const quantity = role === 'quantity';
  const label = role === 'quantity' ? 'Print run' : groupName(group);
  return <section className="py-3 border-b border-[#F1F4F8] last:border-b-0"><div className="mb-3 flex flex-wrap items-baseline gap-2"><h3 className="text-sm font-black text-[#151B26]">{label}:</h3><p className="text-sm font-bold text-[#20A8C8]">{selected || 'Choose option'}</p></div><div className={quantity ? 'grid grid-cols-1 gap-3 sm:grid-cols-2' : values.length <= 5 ? 'flex flex-wrap gap-3' : 'grid grid-cols-1 gap-3 sm:grid-cols-2'}>{values.map((value, index) => { const raw = valueKey(value); const optionLabel = valueLabel(value); const active = String(selected) === raw; const optionPrice = quantity ? optionPriceForSelection(matrixRows, selections, key, raw) : null; const recommended = shouldRecommend(role, index, optionLabel); return <button key={`${key}-${raw}`} type="button" onClick={() => setSelections((current) => ({ ...current, [key]: raw }))} className={`${quantity ? 'min-h-[58px] justify-between' : 'min-h-[42px]'} relative flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${active ? 'border-[#20B8D8] bg-white shadow-[0_0_0_2px_rgba(32,184,216,0.10)]' : 'border-[#DDE6F2] bg-white hover:border-[#20B8D8]'}`}>{active && !quantity ? <Check size={15} className="text-[#20A8C8]" /> : null}<span className={quantity ? 'text-sm font-black text-[#151B26]' : 'text-sm font-extrabold text-[#151B26]'}>{optionLabel}</span>{recommended && !active ? <span className="rounded-full bg-[#EAF8FC] px-2 py-1 text-[9px] font-black uppercase tracking-wider text-[#20A8C8]">Recommended</span> : null}{optionPrice ? <span className="ml-auto text-sm font-black text-[#151B26]">{moneyFromMinor(optionPrice)}</span> : null}{active && quantity ? <span className="absolute left-0 top-0 rounded-br-lg rounded-tl-xl bg-[#20B8D8] px-2 py-1 text-[9px] font-black uppercase tracking-wider text-white">Selected</span> : null}{active && recommended ? <span className="absolute bottom-0 right-0 rounded-br-xl rounded-tl-lg bg-[#20B8D8] px-2 py-1 text-[8px] font-black uppercase tracking-wider text-white">Recommended</span> : null}</button>;})}</div></section>;
}

function DeliveryOptions() {
  return <section className="py-3"><div className="mb-3 flex items-baseline gap-2"><h3 className="text-sm font-black text-[#151B26]">Estimated delivery date</h3></div><div className="space-y-3"><button className="w-full rounded-xl border-2 border-[#20B8D8] bg-white px-4 py-4 text-left"><p className="font-black">Monday April 27</p><p className="text-xs font-semibold text-[#8A98AA]">Latest Tuesday April 28</p></button><button className="flex w-full items-center justify-between rounded-xl border border-[#DDE6F2] bg-white px-4 py-4 text-left"><span><p className="font-black">Thursday April 23</p><p className="text-xs font-semibold text-[#8A98AA]">Latest Friday April 24</p></span><strong>+ £1.00</strong></button><button className="flex w-full items-center justify-between rounded-xl border border-[#DDE6F2] bg-white px-4 py-4 text-left"><span><p className="font-black">Wednesday April 22</p><p className="text-xs font-semibold text-[#8A98AA]">Latest Thursday April 23</p></span><strong>+ £2.00</strong></button></div></section>;
}

export default function ProductLiveConfigurator({ pathname }) {
  const { product, optionGroups, loading, selections, setSelections, price, priceError, addResolvedItemToCart } = useLiveProductPricing(pathname);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const slug = normalizePathSlug(pathname);
  const matrixRows = pricingMatrixRows(product);
  const orderedGroups = useMemo(() => [...optionGroups].sort((a, b) => { const roleA = getGroupRole(a); const roleB = getGroupRole(b); return (ROLE_ORDER[roleA] || 999) - (ROLE_ORDER[roleB] || 999) || Number(a.sortOrder || 999) - Number(b.sortOrder || 999); }), [optionGroups]);
  const mainGroups = orderedGroups.filter((group) => !isSecondaryRole(getGroupRole(group)));
  const secondaryGroups = orderedGroups.filter((group) => isSecondaryRole(getGroupRole(group)));
  if (loading) return <main className="min-h-screen bg-[#F5F7FB] px-6 py-16 text-[#151B26]">Loading product options…</main>;
  if (!product) return <DiagnosticPanel title="Product not found" slug={slug}><p>No exact backend product matched this slug.</p></DiagnosticPanel>;
  if (!optionGroups.length) return <DiagnosticPanel title="Product has no option groups" slug={slug}><p><strong>Product found:</strong> yes</p><p><strong>Option groups:</strong> 0</p><p><strong>Pricing rows:</strong> {matrixRows.length}</p></DiagnosticPanel>;
  if (!matrixRows.length) return <DiagnosticPanel title="Product has no pricing matrix" slug={slug}><p><strong>Product found:</strong> yes</p><p><strong>Option groups:</strong> {optionGroups.length}</p><p><strong>Pricing rows:</strong> 0</p></DiagnosticPanel>;
  const title = product?.name || product?.title || 'Print Product';
  const description = product?.description || 'Configure format, stock, finishing and quantity with backend-controlled CSV pricing.';
  const currency = price?.currency || 'GBP';
  const total = price?.grossMinor || price?.netMinor || product?.priceFromMinor || 0;
  async function handleAdd() { setAdding(true); setAdded(false); try { await addResolvedItemToCart(); setAdded(true); } finally { setAdding(false); } }
  return <main className="min-h-screen bg-[#F7F8FC] text-[#151B26]"><section className="mx-auto max-w-7xl px-4 pt-5 sm:px-6 sm:pt-6"><div className="mb-5 text-xs font-bold text-[#8A98AA]">Home / <span className="text-[#20A8C8]">{title}</span></div><div className="mb-6 flex flex-wrap gap-3">{['Product info', 'Specifications', 'Design guidelines', 'FAQ\'s', 'Ordering process'].map((item, index) => <button key={item} className={`rounded-full border px-5 py-2 text-xs font-black ${index === 0 ? 'border-[#20B8D8] bg-white text-[#20A8C8]' : 'border-[#DDE6F2] bg-white text-[#738195]'}`}>{item}</button>)}</div><div className="grid gap-8 lg:grid-cols-[520px_1fr]"><div><h1 className="text-3xl font-black tracking-tight sm:text-4xl">{title.replace('Standard ', '')}</h1><p className="mt-4 text-sm leading-7 text-[#667487]">{description}</p></div><div className="hidden justify-end lg:flex"><div className="rounded-2xl bg-white px-5 py-4 shadow-sm"><strong>Do you need help?</strong><br /><span className="text-[#20A8C8]">Chat with us</span></div></div></div></section><section className="mx-auto grid max-w-7xl gap-8 px-4 py-6 sm:px-6 lg:grid-cols-[520px_1fr]"><div className="space-y-5"><ProductPreviewCard title={title} /><div className="rounded-[22px] border border-[#DDE6F2] bg-white shadow-sm"><div className="flex items-center justify-between border-b border-[#EDF2F7] px-5 py-4"><h2 className="font-black">Description</h2><ChevronDown size={16} /></div><div className="p-5"><p className="text-sm leading-7 text-[#667487]">Create lasting connections with affordable, professional business cards. Choose from multiple sizes, papers and finishes to match your brand identity.</p><div className="mt-5 grid gap-3 text-sm text-[#667487]"><p className="flex gap-3"><FileCheck size={18} className="text-[#20A8C8]" /> High-quality full colour print</p><p className="flex gap-3"><UploadCloud size={18} className="text-[#20A8C8]" /> Artwork check included before production</p><p className="flex gap-3"><Truck size={18} className="text-[#20A8C8]" /> Delivery and collection options at checkout</p></div></div></div>{['Product specifications', 'Design guidelines', 'Frequently asked questions', 'Ordering process'].map((item) => <button key={item} className="flex w-full items-center justify-between rounded-2xl border border-[#DDE6F2] bg-white px-5 py-4 text-left text-sm font-black shadow-sm">{item}<ChevronDown size={16} /></button>)}</div><div className="space-y-4"><div className="rounded-[24px] border border-[#DDE6F2] bg-white p-5 shadow-sm">{mainGroups.map((group) => <OptionGroup key={groupKey(group)} group={group} selections={selections} setSelections={setSelections} matrixRows={matrixRows} />)}{secondaryGroups.length ? <section className="border-t border-[#EDF2F7] pt-4"><button type="button" onClick={() => setShowMoreOptions((value) => !value)} className="flex w-full items-center justify-between text-sm font-black text-[#20A8C8]">{showMoreOptions ? 'Hide specialist options' : 'Show specialist options'} <ChevronDown size={16} /></button>{showMoreOptions ? <div className="mt-3 space-y-3">{secondaryGroups.map((group) => <OptionGroup key={groupKey(group)} group={group} selections={selections} setSelections={setSelections} matrixRows={matrixRows} />)}</div> : null}</section> : null}<DeliveryOptions /></div><section className="sticky bottom-4 z-20 rounded-[22px] border border-[#DDE6F2] bg-white/95 p-5 shadow-xl shadow-slate-200/80 backdrop-blur lg:bottom-auto lg:top-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between lg:block"><div><p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-[#20A8C8]"><Sparkles size={14} /> Selected price</p><div className="mt-2 text-4xl font-black">{moneyFromMinor(total, currency)}</div>{price ? <p className="mt-1 text-xs font-semibold text-[#738195]">SKU {price.sku || '—'} · VAT {moneyFromMinor(price.vatMinor || 0, currency)}</p> : <p className="mt-1 text-xs font-semibold text-[#738195]">Choose a valid option combination.</p>}</div><button type="button" onClick={handleAdd} disabled={adding || !price} className="flex min-w-[190px] items-center justify-center gap-2 rounded-2xl bg-[#20B8D8] px-5 py-4 font-black text-white shadow-lg shadow-cyan-200 transition hover:bg-[#1689A3] disabled:cursor-not-allowed disabled:opacity-50"><ShoppingCart size={18} /> {adding ? 'Adding…' : 'Add to cart'}</button></div>{priceError ? <p className="mt-4 rounded-2xl bg-amber-50 p-3 text-xs font-bold text-amber-700">{priceError}</p> : null}<div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]"><span className="hidden rounded-2xl border border-[#DDE6F2] bg-white px-5 py-3 text-center font-black sm:block">Browse design templates</span></div>{added ? <p className="mt-3 text-sm font-black text-emerald-600">Added to basket.</p> : null}<div className="mt-4 flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-wide text-[#20A8C8]"><span className="rounded-full bg-[#EAF8FC] px-3 py-2">Secure checkout later</span><span className="rounded-full bg-[#EAF8FC] px-3 py-2">Artwork support</span><span className="rounded-full bg-[#EAF8FC] px-3 py-2">Bespoke quote route</span></div></section></div></section></main>;
}
