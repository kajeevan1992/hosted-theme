import React, { useState } from 'react';
import { AlertTriangle, Check, ShoppingCart } from 'lucide-react';
import { moneyFromMinor } from './livePricingBridge';
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

export default function ProductLiveConfigurator({ pathname }) {
  const {
    product,
    optionGroups,
    loading,
    live,
    selections,
    setSelections,
    price,
    priceError,
    addResolvedItemToCart,
  } = useLiveProductPricing(pathname);

  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  if (loading) {
    return <main className="min-h-screen bg-[#F7F8FC] px-6 py-16 text-[#161A22]">Loading backend product…</main>;
  }

  if (!live || !product || !optionGroups.length) {
    const slug = normalizePathSlug(pathname);
    return (
      <main className="min-h-screen bg-[#F7F8FC] px-6 py-16 text-[#161A22]">
        <div className="mx-auto max-w-4xl rounded-[28px] border border-amber-200 bg-white p-8 shadow-sm">
          <div className="flex items-start gap-4">
            <AlertTriangle className="mt-1 text-amber-500" size={28} />
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-600">Backend product not connected</p>
              <h1 className="mt-3 text-3xl font-black">{slug}</h1>
              <p className="mt-4 text-[#667487]">
                This route is now using the backend configurator, but the backend did not return a CSV-ready product for this slug.
              </p>
              <div className="mt-6 rounded-2xl bg-[#F7F8FC] p-4 text-sm text-[#161A22]">
                <p><strong>Expected API:</strong> /api/internal/catalog/storefront-products?slug={slug}</p>
                <p><strong>Product found:</strong> {product ? 'yes' : 'no'}</p>
                <p><strong>Option groups:</strong> {optionGroups.length}</p>
                <p><strong>Live CSV matrix:</strong> {live ? 'yes' : 'no'}</p>
              </div>
              <p className="mt-4 text-sm text-[#667487]">
                Re-import the CSV with this exact slug, then redeploy/refresh. If this page still does not change after deploy, the frontend service is still running an old build.
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const title = product?.name || product?.title || 'Print Product';
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
    <main className="min-h-screen bg-[#F7F8FC] text-[#161A22]">
      <section className="border-b border-[#E3E8F0] bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[1fr_390px]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#18A7D0]">Backend connected product</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">{title}</h1>
            <p className="mt-4 max-w-3xl text-lg text-[#667487]">
              This product is now rendering from backend CSV option groups and live pricing rules.
            </p>
          </div>
          <aside className="rounded-[28px] border border-[#E3E8F0] bg-[#FAFBFE] p-6 shadow-sm">
            <p className="text-sm font-semibold text-[#667487]">Live backend price</p>
            <div className="mt-2 text-4xl font-black">{moneyFromMinor(total, currency)}</div>
            {price ? (
              <p className="mt-2 text-sm text-[#667487]">SKU {price.sku || '—'} · VAT {moneyFromMinor(price.vatMinor || 0, currency)}</p>
            ) : (
              <p className="mt-2 text-sm text-[#667487]">Choose options to calculate exact price.</p>
            )}
            {priceError ? <p className="mt-3 rounded-2xl bg-amber-50 p-3 text-sm text-amber-700">{priceError}</p> : null}
            <button type="button" onClick={handleAdd} disabled={adding || !price} className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#18A7D0] px-5 py-4 font-bold text-white hover:bg-[#127B98] disabled:opacity-50">
              <ShoppingCart size={18} /> {adding ? 'Adding…' : 'Add to basket'}
            </button>
            {added ? <p className="mt-3 text-center text-sm font-bold text-emerald-600">Added to basket.</p> : null}
          </aside>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[1fr_340px]">
        <div className="space-y-5">
          {optionGroups.map((group) => {
            const key = groupKey(group);
            return (
              <div key={key} className="rounded-[28px] border border-[#E3E8F0] bg-white p-6 shadow-sm">
                <h2 className="text-xl font-black">{group.label || key}</h2>
                <p className="mt-1 text-sm text-[#667487]">Selected: {selections[key] || 'Not selected'}</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {groupValues(group).map((value) => {
                    const raw = valueKey(value);
                    const active = String(selections[key]) === raw;
                    return (
                      <button key={`${key}-${raw}`} type="button" onClick={() => setSelections((current) => ({ ...current, [key]: raw }))} className={`rounded-2xl border p-4 text-left font-semibold transition ${active ? 'border-[#18A7D0] bg-[#EAF8FC]' : 'border-[#E3E8F0] bg-white hover:border-[#18A7D0]'}`}>
                        <span className="flex items-center justify-between gap-3">{valueLabel(value)} {active ? <Check size={18} className="text-[#18A7D0]" /> : null}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        <aside className="rounded-[28px] border border-[#E3E8F0] bg-white p-6 shadow-sm h-fit">
          <h3 className="font-black">Selected backend specification</h3>
          <dl className="mt-4 space-y-2 text-sm">
            {Object.entries(selections).map(([key, value]) => (
              <div key={key} className="flex justify-between gap-4 border-b border-[#F3F5FA] pb-2">
                <dt className="text-[#667487]">{key}</dt>
                <dd className="text-right font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
        </aside>
      </section>
    </main>
  );
}
