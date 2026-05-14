import React, { useMemo, useState } from 'react';
import { AlertTriangle, Check, ChevronDown, FileCheck, ShoppingCart, Truck, UploadCloud } from 'lucide-react';
import { moneyFromMinor, pricingMatrixRows } from './livePricingBridge';
import { normalizePathSlug, useLiveProductPricing } from './useLiveProductPricing';

function groupKey(group) {
  return group.id || group.key || group.label;
}

function groupValues(group) {
  return Array.isArray(group.values) ? group.values : Array.isArray(group.options) ? group.options : [];
}

function valueKey(value) {
  return typeof value === 'object' ? String(value.value || value.label || '') : String(value || '');
}

function valueLabel(value) {
  return typeof value === 'object' ? String(value.label || value.value || '') : String(value || '');
}

function prettyKey(value = '') {
  return String(value).replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function isQuantityGroup(group) {
  const key = String(groupKey(group) || '').toLowerCase();
  const label = String(group.label || group.name || '').toLowerCase();
  return key.includes('quantity') || label.includes('quantity');
}

function isCompactGroup(group) {
  return groupValues(group).length <= 4 && !isQuantityGroup(group);
}

function DiagnosticPanel({ title, slug, children }) {
  return (
    <main className="min-h-screen bg-[#F5F7FB] px-6 py-16 text-[#151B26]">
      <div className="mx-auto max-w-4xl rounded-[28px] border border-amber-200 bg-white p-8 shadow-sm">
        <div className="flex items-start gap-4">
          <AlertTriangle className="mt-1 text-amber-500" size={28} />
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-amber-600">Storefront product diagnostic</p>
            <h1 className="mt-3 text-3xl font-black">{title}</h1>
            <p className="mt-2 text-[#667487]">Slug: {slug}</p>
            <div className="mt-6 rounded-2xl bg-[#F7F8FC] p-4 text-sm text-[#151B26]">{children}</div>
          </div>
        </div>
      </div>
    </main>
  );
}

function ProductPreviewCard({ title }) {
  return (
    <div className="overflow-hidden rounded-[30px] border border-[#DDE6F2] bg-white shadow-sm">
      <div className="h-72 bg-gradient-to-br from-[#BFF6FF] via-white to-[#F7E7FF] p-6">
        <div className="mb-16 flex gap-2">
          <span className="h-4 w-4 rounded-full bg-[#20B8D8]" />
          <span className="h-4 w-4 rounded-full bg-white/70" />
        </div>
        <div className="rounded-[24px] bg-white/65 p-6 shadow-sm backdrop-blur">
          <div className="mb-4 h-4 w-28 rounded-full bg-[#20B8D8]/20" />
          <h2 className="text-3xl font-black leading-tight text-[#123044]">{title}</h2>
          <p className="mt-2 text-sm font-semibold text-[#667487]">Live product preview placeholder</p>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-3 border-t border-[#DDE6F2] p-4">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="h-16 rounded-2xl border border-[#DDE6F2] bg-gradient-to-br from-[#DFFAFF] to-white" />
        ))}
      </div>
    </div>
  );
}

function OptionGroup({ group, selections, setSelections }) {
  const key = groupKey(group);
  const values = groupValues(group);
  const selected = selections[key];
  const quantity = isQuantityGroup(group);
  const compact = isCompactGroup(group);

  return (
    <section className="rounded-[26px] border border-[#DDE6F2] bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-black text-[#151B26]">{group.label || group.name || prettyKey(key)}</h3>
          <p className="mt-1 text-xs font-semibold text-[#738195]">Selected: <span className="text-[#20A8C8]">{selected || 'Choose option'}</span></p>
        </div>
        {group.required ? <span className="rounded-full bg-[#EAF8FC] px-3 py-1 text-[10px] font-black uppercase tracking-wide text-[#1689A3]">Required</span> : null}
      </div>

      <div className={quantity ? 'grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4' : compact ? 'grid grid-cols-2 gap-3 md:grid-cols-4' : 'grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3'}>
        {values.map((value) => {
          const raw = valueKey(value);
          const label = valueLabel(value);
          const active = String(selected) === raw;
          return (
            <button
              key={`${key}-${raw}`}
              type="button"
              onClick={() => setSelections((current) => ({ ...current, [key]: raw }))}
              className={`group min-h-[58px] rounded-2xl border px-4 py-3 text-left transition ${active ? 'border-[#20B8D8] bg-[#EAFBFF] shadow-[0_12px_30px_rgba(32,184,216,0.15)]' : 'border-[#DDE6F2] bg-white hover:border-[#20B8D8] hover:bg-[#FAFEFF]'}`}
            >
              <span className="flex items-center justify-between gap-3">
                <span className={quantity ? 'text-base font-black text-[#151B26]' : 'text-sm font-extrabold text-[#151B26]'}>{label}</span>
                {active ? <Check size={17} className="shrink-0 text-[#20A8C8]" /> : <ChevronDown size={14} className="shrink-0 text-[#AAB5C3] opacity-0 group-hover:opacity-100" />}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default function ProductLiveConfigurator({ pathname }) {
  const { product, optionGroups, loading, selections, setSelections, price, priceError, addResolvedItemToCart } = useLiveProductPricing(pathname);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const slug = normalizePathSlug(pathname);
  const matrixRows = pricingMatrixRows(product);

  const orderedGroups = useMemo(() => {
    return [...optionGroups].sort((a, b) => {
      if (isQuantityGroup(a)) return -1;
      if (isQuantityGroup(b)) return 1;
      return Number(a.sortOrder || 999) - Number(b.sortOrder || 999);
    });
  }, [optionGroups]);

  if (loading) return <main className="min-h-screen bg-[#F5F7FB] px-6 py-16 text-[#151B26]">Loading product options…</main>;

  if (!product) {
    return <DiagnosticPanel title="Product not found" slug={slug}><p>No exact backend product matched this slug.</p><p className="mt-2"><strong>Expected:</strong> /api/internal/catalog/products/{slug}</p></DiagnosticPanel>;
  }

  if (!optionGroups.length) {
    return <DiagnosticPanel title="Product has no option groups" slug={slug}><p><strong>Product found:</strong> yes</p><p><strong>Option groups:</strong> 0</p><p><strong>Pricing rows:</strong> {matrixRows.length}</p></DiagnosticPanel>;
  }

  if (!matrixRows.length) {
    return <DiagnosticPanel title="Product has no pricing matrix" slug={slug}><p><strong>Product found:</strong> yes</p><p><strong>Option groups:</strong> {optionGroups.length}</p><p><strong>Pricing rows:</strong> 0</p></DiagnosticPanel>;
  }

  const title = product?.name || product?.title || 'Print Product';
  const description = product?.description || 'Configure your print product using live backend options and CSV matrix pricing.';
  const currency = price?.currency || 'GBP';
  const total = price?.grossMinor || price?.netMinor || product?.priceFromMinor || 0;

  async function handleAdd() {
    setAdding(true);
    setAdded(false);
    try {
      await addResolvedItemToCart();
      setAdded(true);
    } finally {
      setAdding(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F5F7FB] text-[#151B26]">
      <section className="border-b border-[#DDE6F2] bg-white">
        <div className="mx-auto max-w-7xl px-6 py-5 text-xs font-bold text-[#738195]">Home / Products / <span className="text-[#20A8C8]">{title}</span></div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-9 lg:grid-cols-[520px_1fr]">
        <div className="space-y-5">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#20A8C8]">Backend connected product</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-[#151B26] md:text-5xl">{title}</h1>
            <p className="mt-4 text-base leading-7 text-[#667487]">{description}</p>
          </div>
          <ProductPreviewCard title={title} />
          <div className="rounded-[26px] border border-[#DDE6F2] bg-white p-5 shadow-sm">
            <h2 className="text-lg font-black">Description</h2>
            <p className="mt-3 text-sm leading-7 text-[#667487]">Create production-ready print orders with live option selection, exact CSV pricing and artwork upload support.</p>
            <div className="mt-5 grid gap-3 text-sm text-[#667487]">
              <p className="flex gap-3"><FileCheck size={18} className="text-[#20A8C8]" /> Artwork check included before production</p>
              <p className="flex gap-3"><UploadCloud size={18} className="text-[#20A8C8]" /> Upload files after adding to basket</p>
              <p className="flex gap-3"><Truck size={18} className="text-[#20A8C8]" /> Delivery options confirmed at checkout</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_290px]">
          <div className="space-y-5">
            {orderedGroups.map((group) => <OptionGroup key={groupKey(group)} group={group} selections={selections} setSelections={setSelections} />)}
          </div>

          <aside className="lg:sticky lg:top-6 h-fit rounded-[28px] border border-[#DDE6F2] bg-white p-6 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#20A8C8]">Selected price</p>
            <div className="mt-3 text-4xl font-black">{moneyFromMinor(total, currency)}</div>
            {price ? <p className="mt-2 text-xs font-semibold text-[#738195]">SKU {price.sku || '—'} · VAT {moneyFromMinor(price.vatMinor || 0, currency)}</p> : <p className="mt-2 text-xs font-semibold text-[#738195]">Choose a valid option combination.</p>}
            {priceError ? <p className="mt-4 rounded-2xl bg-amber-50 p-3 text-xs font-bold text-amber-700">{priceError}</p> : null}
            <button type="button" onClick={handleAdd} disabled={adding || !price} className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#20B8D8] px-5 py-4 font-black text-white shadow-lg shadow-cyan-200 transition hover:bg-[#1689A3] disabled:cursor-not-allowed disabled:opacity-50">
              <ShoppingCart size={18} /> {adding ? 'Adding…' : 'Add to basket'}
            </button>
            {added ? <p className="mt-3 text-center text-sm font-black text-emerald-600">Added to basket.</p> : null}
            <div className="mt-5 border-t border-[#EDF2F7] pt-4">
              <h3 className="text-sm font-black">Selected specification</h3>
              <dl className="mt-3 max-h-[360px] space-y-2 overflow-auto pr-1 text-xs">
                {Object.entries(selections).map(([key, value]) => (
                  <div key={key} className="flex justify-between gap-4 border-b border-[#F1F4F8] pb-2">
                    <dt className="text-[#738195]">{prettyKey(key)}</dt>
                    <dd className="max-w-[140px] text-right font-bold text-[#151B26]">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
