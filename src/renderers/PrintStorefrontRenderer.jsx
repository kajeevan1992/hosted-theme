import React, { useMemo, useState } from 'react';
import { AlertTriangle, Check, ChevronDown, FileCheck, ShoppingCart, Truck, UploadCloud } from 'lucide-react';
import { moneyFromMinor, pricingMatrixRows } from '../livePricingBridge';

const ROLE_ORDER = {
  size: 10,
  'finished-size': 11,
  paper: 20,
  lamination: 30,
  printing: 40,
  corners: 50,
  quantity: 60,
  turnaround: 70,
  spotuv: 80,
  fold: 90,
  orientation: 100,
  cut: 110,
  sets: 120,
  pages: 130,
  other: 999,
};

const SECONDARY_ROLES = new Set(['spotuv', 'fold', 'orientation', 'cut', 'sets', 'pages', 'other']);

function keyOf(group) {
  return group.id || group.key || group.label;
}

function valuesOf(group) {
  return Array.isArray(group.values) ? group.values : Array.isArray(group.options) ? group.options : [];
}

function rawValue(value) {
  return typeof value === 'object' ? String(value.value || value.label || '') : String(value || '');
}

function labelOf(value) {
  return typeof value === 'object' ? String(value.label || value.value || '') : String(value || '');
}

function pretty(value = '') {
  return String(value).replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function slugText(value = '') {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function groupName(group) {
  return group.label || group.name || pretty(keyOf(group));
}

function optionMeta(value = {}) {
  if (!value || typeof value !== 'object') return {};
  return value.storefrontMeta || value.meta || value.metadata || {};
}

function roleOf(group) {
  const key = slugText(`${keyOf(group)} ${groupName(group)}`);
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

function optionPrice(rows, selections, groupKey, value) {
  const match = rows.find((row) => {
    const options = row?.options || {};
    return Object.entries({ ...selections, [groupKey]: value }).every(([key, selected]) => {
      return !(key in options) || String(options[key]) === String(selected);
    });
  });
  return match?.priceMinor || null;
}

function isRecommended(value) {
  const meta = optionMeta(value);
  return Boolean(meta.recommended || meta.badge || meta.featured);
}

function badgeText(value) {
  const meta = optionMeta(value);
  if (meta.badge) return meta.badge;
  if (meta.recommended) return 'Recommended';
  if (meta.featured) return 'Featured';
  return '';
}

function Diagnostic({ title, slug, children }) {
  return (
    <main className="min-h-screen bg-[#f7f8fc] px-6 py-16">
      <div className="mx-auto max-w-4xl rounded-[22px] border border-amber-200 bg-white p-8 shadow-sm">
        <div className="flex gap-4">
          <AlertTriangle className="text-amber-500" />
          <div>
            <p className="text-xs font-black uppercase tracking-[.22em] text-amber-600">Storefront product diagnostic</p>
            <h1 className="mt-3 text-3xl font-black">{title}</h1>
            <p className="mt-2 text-[#667487]">Slug: {slug}</p>
            <div className="mt-6 rounded-2xl bg-[#f7f8fc] p-4 text-sm">{children}</div>
          </div>
        </div>
      </div>
    </main>
  );
}

function ProductPreview({ title }) {
  return (
    <div className="overflow-hidden rounded-[20px] border border-[#dfe7f1] bg-white shadow-sm">
      <div className="relative h-[390px] bg-gradient-to-br from-[#c9f7fb] via-[#f7fdff] to-[#edf4f8] p-6">
        <button className="absolute left-5 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white text-xl font-black shadow-sm">‹</button>
        <button className="absolute right-5 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white text-xl font-black shadow-sm">›</button>
        <div className="flex gap-2"><span className="h-4 w-4 rounded-full bg-[#20b8d8]" /><span className="h-4 w-4 rounded-full bg-white/70" /></div>
        <div className="mx-auto mt-14 h-36 w-[72%] rotate-[-7deg] rounded-xl bg-white p-8 shadow-2xl shadow-slate-300/60">
          <p className="text-2xl font-black text-[#20a8c8]">HOLO<span className="text-[#151b26]">PRINT</span></p>
        </div>
        <div className="mx-auto -mt-3 h-40 w-[78%] rotate-[2deg] rounded-xl bg-white p-8 shadow-2xl shadow-slate-300/60">
          <h2 className="text-3xl font-black leading-tight text-[#123044]">{title.replace('Standard ', '')} Front</h2>
          <p className="mt-2 text-lg font-semibold text-[#667487]">Replace later</p>
        </div>
      </div>
      <div className="grid grid-cols-5 gap-3 border-t border-[#dfe7f1] p-4">
        {[1, 2, 3, 4, 5].map((item) => <div key={item} className={`h-14 rounded-xl border ${item === 5 ? 'border-[#20b8d8]' : 'border-[#dfe7f1]'} bg-gradient-to-br from-[#dffaff] to-white`} />)}
      </div>
    </div>
  );
}

function Choice({ active, label, badge, tooltip, price, quantity, onClick }) {
  return (
    <button
      type="button"
      title={tooltip || ''}
      onClick={onClick}
      className={`${quantity ? 'min-h-[58px] justify-between' : 'min-h-[42px]'} relative flex items-center gap-2 rounded-xl border bg-white px-4 py-3 text-left transition ${active ? 'border-[#20b8d8] shadow-[0_0_0_2px_rgba(32,184,216,.08)]' : 'border-[#dfe7f1] hover:border-[#20b8d8]'}`}
    >
      {active && !quantity ? <Check size={14} className="text-[#20a8c8]" /> : null}
      <span className="text-sm font-extrabold text-[#151b26]">{label}</span>
      {badge && !active ? <span className="rounded-full bg-[#eafbff] px-2 py-1 text-[8px] font-black uppercase tracking-wider text-[#20a8c8]">{badge}</span> : null}
      {price ? <span className="ml-auto text-sm font-black">{moneyFromMinor(price)}</span> : null}
      {active && quantity ? <span className="absolute left-0 top-0 rounded-br-md rounded-tl-xl bg-[#20b8d8] px-2 py-1 text-[8px] font-black uppercase tracking-wider text-white">Selected</span> : null}
      {active && badge ? <span className="absolute bottom-0 right-0 rounded-br-xl rounded-tl-md bg-[#20b8d8] px-2 py-1 text-[8px] font-black uppercase tracking-wider text-white">{badge}</span> : null}
    </button>
  );
}

function OptionGroup({ group, selections, setSelections, rows }) {
  const groupKey = keyOf(group);
  const role = roleOf(group);
  const values = valuesOf(group);
  const quantity = role === 'quantity';
  const selected = selections[groupKey];
  const heading = quantity ? 'Print run' : groupName(group);
  const layout = quantity ? 'grid grid-cols-2 gap-3' : ['size', 'finished-size', 'paper', 'lamination'].includes(role) ? 'grid grid-cols-2 gap-3 md:grid-cols-4' : values.length <= 5 ? 'flex flex-wrap gap-3' : 'grid grid-cols-2 gap-3';

  return (
    <section className="border-b border-[#edf2f7] py-3.5 last:border-0">
      <div className="mb-3 flex items-baseline gap-2">
        <h3 className="text-sm font-black">{heading}:</h3>
        <span className="text-sm font-bold text-[#20a8c8]">{selected || 'Choose option'}</span>
      </div>
      <div className={layout}>
        {values.map((value) => {
          const raw = rawValue(value);
          const label = labelOf(value);
          const meta = optionMeta(value);
          const active = String(selected) === raw;
          return (
            <Choice
              key={`${groupKey}-${raw}`}
              active={active}
              label={label}
              badge={badgeText(value)}
              tooltip={meta.tooltip || meta.helpText || ''}
              price={quantity ? optionPrice(rows, selections, groupKey, raw) : null}
              quantity={quantity}
              onClick={() => setSelections((current) => ({ ...current, [groupKey]: raw }))}
            />
          );
        })}
      </div>
    </section>
  );
}

function Delivery() {
  return (
    <section className="py-4">
      <h3 className="mb-3 text-sm font-black">Estimated delivery date</h3>
      <div className="space-y-3">
        <button className="w-full rounded-xl border-2 border-[#20b8d8] bg-white px-4 py-4 text-left"><p className="font-black">Monday April 27</p><p className="text-xs font-semibold text-[#8a98aa]">Latest Tuesday April 28</p></button>
        <button className="flex w-full items-center justify-between rounded-xl border border-[#dfe7f1] bg-white px-4 py-4 text-left"><span><p className="font-black">Thursday April 23</p><p className="text-xs font-semibold text-[#8a98aa]">Latest Friday April 24</p></span><strong>+ £1.00</strong></button>
        <button className="flex w-full items-center justify-between rounded-xl border border-[#dfe7f1] bg-white px-4 py-4 text-left"><span><p className="font-black">Wednesday April 22</p><p className="text-xs font-semibold text-[#8a98aa]">Latest Thursday April 23</p></span><strong>+ £2.00</strong></button>
      </div>
    </section>
  );
}

function InfoPanels() {
  return (
    <>
      <div className="rounded-[18px] border border-[#dfe7f1] bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#edf2f7] px-5 py-4"><h2 className="font-black">Description</h2><ChevronDown size={16} /></div>
        <div className="p-5">
          <p className="text-sm leading-7 text-[#667487]">Create lasting connections with affordable, professional business cards. Choose from multiple sizes, papers and finishes to match your brand identity.</p>
          <div className="mt-5 grid gap-3 text-sm text-[#667487]"><p className="flex gap-3"><FileCheck size={18} className="text-[#20a8c8]" /> High-quality full colour print</p><p className="flex gap-3"><UploadCloud size={18} className="text-[#20a8c8]" /> Artwork check included before production</p><p className="flex gap-3"><Truck size={18} className="text-[#20a8c8]" /> Delivery and collection options at checkout</p></div>
        </div>
      </div>
      {['Product specifications', 'Design guidelines', 'Frequently asked questions', 'Ordering process'].map((item) => <button key={item} className="flex w-full items-center justify-between rounded-2xl border border-[#dfe7f1] bg-white px-5 py-4 text-left text-sm font-black shadow-sm">{item}<ChevronDown size={16} /></button>)}
    </>
  );
}

export function PrintStorefrontRenderer({ product, optionGroups, selections, setSelections, price, priceError, addResolvedItemToCart, slug }) {
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const rows = pricingMatrixRows(product);

  const ordered = useMemo(() => [...optionGroups].sort((a, b) => (ROLE_ORDER[roleOf(a)] || 999) - (ROLE_ORDER[roleOf(b)] || 999) || Number(a.sortOrder || 999) - Number(b.sortOrder || 999)), [optionGroups]);
  const main = ordered.filter((group) => !SECONDARY_ROLES.has(roleOf(group)));
  const secondary = ordered.filter((group) => SECONDARY_ROLES.has(roleOf(group)));

  if (!product) return <Diagnostic title="Product not found" slug={slug}><p>No exact backend product matched this slug.</p></Diagnostic>;
  if (!optionGroups.length) return <Diagnostic title="Product has no option groups" slug={slug}><p><strong>Product found:</strong> yes</p><p><strong>Option groups:</strong> 0</p><p><strong>Pricing rows:</strong> {rows.length}</p></Diagnostic>;
  if (!rows.length) return <Diagnostic title="Product has no pricing matrix" slug={slug}><p><strong>Product found:</strong> yes</p><p><strong>Option groups:</strong> {optionGroups.length}</p><p><strong>Pricing rows:</strong> 0</p></Diagnostic>;

  const title = product.name || product.title || 'Print Product';
  const total = price?.grossMinor || price?.netMinor || product.priceFromMinor || 0;
  const currency = price?.currency || 'GBP';

  async function handleAdd() {
    setAdding(true);
    setAdded(false);
    try { await addResolvedItemToCart(); setAdded(true); } finally { setAdding(false); }
  }

  return (
    <main className="min-h-screen bg-[#f7f8fc] text-[#151b26]">
      <section className="mx-auto max-w-[1140px] px-5 pt-6">
        <div className="mb-5 text-xs font-bold text-[#8a98aa]">Home / <span className="text-[#20a8c8]">{title}</span></div>
        <div className="mb-6 flex flex-wrap gap-3">{['Product info','Specifications','Design guidelines','FAQ\'s','Ordering process'].map((item, index) => <button key={item} className={`rounded-full border px-5 py-2 text-xs font-black ${index === 0 ? 'border-[#20b8d8] bg-white text-[#20a8c8]' : 'border-[#dfe7f1] bg-white text-[#738195]'}`}>{item}</button>)}</div>
        <div className="grid items-end gap-8 lg:grid-cols-[500px_1fr]"><div><h1 className="text-4xl font-black tracking-tight">{title.replace('Standard ', '')}</h1><p className="mt-4 text-sm leading-7 text-[#667487]">Configure format, stock, finishing and quantity with live CSV pricing.</p></div><div className="hidden justify-end lg:flex"><div className="rounded-2xl bg-white px-5 py-4 shadow-sm"><strong>Do you need help?</strong><br/><span className="text-[#20a8c8]">Chat with us</span></div></div></div>
      </section>
      <section className="mx-auto grid max-w-[1140px] gap-8 px-5 py-6 lg:grid-cols-[500px_1fr]">
        <div className="space-y-5"><ProductPreview title={title}/><InfoPanels/></div>
        <div className="space-y-5">
          <div className="rounded-[20px] border border-[#dfe7f1] bg-white p-5 shadow-sm">
            {main.map((group) => <OptionGroup key={keyOf(group)} group={group} selections={selections} setSelections={setSelections} rows={rows}/>) }
            {secondary.length ? <section className="border-t border-[#eef2f7] pt-4"><button type="button" onClick={() => setShowMore((value) => !value)} className="flex w-full items-center justify-between text-sm font-black text-[#20a8c8]">{showMore ? 'Hide specialist options' : 'Show specialist options'} <ChevronDown size={16}/></button>{showMore ? <div className="mt-3 space-y-3">{secondary.map((group) => <OptionGroup key={keyOf(group)} group={group} selections={selections} setSelections={setSelections} rows={rows}/>)}</div> : null}</section> : null}
            <Delivery/>
          </div>
          <section className="rounded-[20px] border border-[#dfe7f1] bg-white p-6 shadow-sm">
            <div className="grid gap-5 sm:grid-cols-[1fr_auto] sm:items-end"><div><p className="text-xs font-black uppercase tracking-[.18em] text-[#20a8c8]">Selected price</p><div className="mt-2 text-4xl font-black">{moneyFromMinor(total, currency)}</div>{price ? <p className="mt-1 text-xs font-semibold text-[#738195]">SKU {price.sku || '—'} · VAT {moneyFromMinor(price.vatMinor || 0, currency)}</p> : <p className="mt-1 text-xs font-semibold text-[#738195]">Choose a valid option combination.</p>}</div><button type="button" onClick={handleAdd} disabled={adding || !price} className="flex min-w-[220px] items-center justify-center gap-2 rounded-2xl bg-[#20b8d8] px-5 py-4 font-black text-white shadow-lg shadow-cyan-200 transition hover:bg-[#1689a3] disabled:opacity-50"><ShoppingCart size={18}/> {adding ? 'Adding…' : 'Add to cart'}</button></div>
            {priceError ? <p className="mt-4 rounded-2xl bg-amber-50 p-3 text-xs font-bold text-amber-700">{priceError}</p> : null}
            <button type="button" className="mt-4 rounded-2xl border border-[#dfe7f1] bg-white px-5 py-3 font-black">Browse design templates</button>
            {added ? <p className="mt-3 text-sm font-black text-emerald-600">Added to basket.</p> : null}
            <div className="mt-4 flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-wide text-[#20a8c8]"><span className="rounded-full bg-[#eafbff] px-3 py-2">Secure checkout later</span><span className="rounded-full bg-[#eafbff] px-3 py-2">Artwork support</span><span className="rounded-full bg-[#eafbff] px-3 py-2">Bespoke quote route</span></div>
          </section>
        </div>
      </section>
    </main>
  );
}

export default PrintStorefrontRenderer;
