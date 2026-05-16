import React, { useEffect, useMemo, useState } from 'react';
import { Check, ShoppingCart } from 'lucide-react';
import { requestAddToCart, requestLivePrice } from '../commerce/liveConfiguratorEngine';
import { resolveProductConfiguration } from '../commerce/resolvedProductConfigEngine';
import { inferGroupsFromMatrix, matrixQuantityRows, matrixRows, resolveGroupAvailability } from '../commerce/matrixDynamicOptions';

const BRAND = { line: '#E3E8F0', ink: '#161A22', muted: '#667487', primary: '#18A7D0' };
const clean = (v) => String(v ?? '').trim().toLowerCase();
const money = (v) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(Number(v || 0));
const isQty = (g = {}) => ['quantity', 'qty', 'print-run', 'print run', 'run'].some((x) => clean(g.key || g.label || g.id).includes(x));
const img = (v) => typeof v === 'string' ? v : (v?.url || v?.src || v?.image || v?.assetUrl || v?.thumbnail || '');

function Shell({ children }) {
  return <div className="mx-auto w-full max-w-[1220px] px-4 sm:px-6 lg:px-8">{children}</div>;
}

function mergeGroups(configGroups, matrixGroups) {
  const seen = new Set((configGroups || []).map((g) => clean(g.key || g.label || g.id)));
  return [...(configGroups || []), ...(matrixGroups || []).filter((g) => !seen.has(clean(g.key || g.label || g.id)))].sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0));
}

function initialSelections(groups, existing = {}) {
  const next = { ...existing };
  groups.forEach((group) => {
    if (!next[group.key]) {
      const option = group.options?.find((item) => item.default || item.recommended) || group.options?.[0];
      if (option) next[group.key] = option.value;
    }
  });
  return next;
}

function quantityValues(product, group) {
  const groupValues = (group?.options || []).map((o, i) => ({ value: o.value || o.label || o.qty || o.quantity, label: o.label || o.value || o.qty || o.quantity, recommended: o.recommended || o.default || i === 0 })).filter((x) => x.value);
  if (groupValues.length) return groupValues;
  const rowValues = [...new Set(matrixRows(product).map((r) => r.quantity || r.qty || r.options?.quantity || r.options?.Quantity || r.options?.Qty).filter(Boolean))];
  if (rowValues.length) return rowValues.map((q, i) => ({ value: q, label: String(q), recommended: i === 0 }));
  return [100, 250, 500, 1000, 2500, 5000].map((q, i) => ({ value: q, label: String(q), recommended: i === 0 }));
}

function OptionChoice({ group, option, selected, onPick }) {
  const display = group.displayType || 'pill';
  const active = clean(selected) === clean(option.value);
  const disabled = Boolean(group.disabled || option.disabled);
  const style = { borderColor: active ? BRAND.primary : BRAND.line, boxShadow: active ? 'inset 0 0 0 1px rgb(24,167,208)' : 'none', opacity: disabled ? 0.45 : 1 };
  if (display === 'dropdown') return null;
  if (display === 'cards') {
    return <button disabled={disabled} onClick={() => onPick(option.value)} className="relative rounded-[14px] border bg-white p-4 text-center disabled:cursor-not-allowed" style={style}><div className="mx-auto mb-3 h-[58px] w-[86px] rounded-[10px] bg-[linear-gradient(135deg,#f7f7f7,#eceff1)]" /><div className="text-[12px] font-bold" style={{ color: BRAND.ink }}>{option.label || option.value}</div>{option.recommended ? <div className="absolute inset-x-0 bottom-0 rounded-b-[12px] py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-white" style={{ backgroundColor: BRAND.primary }}>Recommended</div> : null}</button>;
  }
  return <button disabled={disabled} onClick={() => onPick(option.value)} className="rounded-[10px] border bg-white px-4 py-3 text-[12px] font-semibold disabled:cursor-not-allowed" style={style}>{option.label || option.value}{option.recommended ? <span className="ml-2 rounded-full px-2 py-1 text-[8px] font-bold uppercase text-white" style={{ backgroundColor: BRAND.primary }}>Recommended</span> : null}</button>;
}

function OptionGroup({ group, value, onChange }) {
  const options = (group.options || []).filter((o) => o.visible !== false);
  const selected = options.find((o) => clean(o.value) === clean(value));
  return <div className="border-b pb-5" style={{ borderColor: BRAND.line }}><div className="mb-3 flex gap-2 text-[14px] font-semibold"><span style={{ color: BRAND.ink }}>{group.label || group.key}:</span><span style={{ color: BRAND.primary }}>{selected?.label || value}</span></div>{group.displayType === 'dropdown' ? <select value={value || ''} onChange={(e) => onChange(e.target.value)} className="h-12 w-full rounded-[12px] border bg-white px-4 text-[13px] font-semibold" style={{ borderColor: BRAND.line }}>{options.map((o) => <option key={o.id || o.value} value={o.value}>{o.label || o.value}</option>)}</select> : <div className={group.displayType === 'cards' ? 'grid gap-3 sm:grid-cols-2 xl:grid-cols-4' : 'flex flex-wrap gap-2'}>{options.map((o) => <OptionChoice key={o.id || o.value} group={group} option={o} selected={value} onPick={onChange} />)}</div>}</div>;
}

export default function HoloMatrixProductTemplate({ product = {} }) {
  const resolved = useMemo(() => resolveProductConfiguration(product), [product]);
  const allGroups = useMemo(() => mergeGroups(resolved.visibleGroups, inferGroupsFromMatrix(product)), [resolved.visibleGroups, product]);
  const [selections, setSelections] = useState(() => initialSelections(allGroups, resolved.selections));
  const available = useMemo(() => resolveGroupAvailability(product, allGroups, selections), [product, allGroups, selections]);
  const groups = available.filter((g) => !isQty(g));
  const qtyGroup = available.find(isQty);
  const qValues = useMemo(() => quantityValues(product, qtyGroup), [product, qtyGroup]);
  const [qty, setQty] = useState(qValues[0]?.value || 1);
  const qRows = useMemo(() => matrixQuantityRows(product, qValues, selections), [product, qValues, selections]);
  const selectedRow = qRows.find((row) => String(row.qty) === String(qty)) || qRows[0];
  const [price, setPrice] = useState(selectedRow?.price || 0);
  const [priceStatus, setPriceStatus] = useState('matrix');
  const [cartStatus, setCartStatus] = useState('idle');
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => setSelections(initialSelections(allGroups, resolved.selections)), [product?.id, product?.slug]);
  useEffect(() => { if (!qValues.some((item) => String(item.value) === String(qty))) setQty(qValues[0]?.value || 1); }, [qValues, qty]);

  useEffect(() => {
    let cancelled = false;
    const matrixPrice = selectedRow?.price || 0;
    setPrice(matrixPrice);
    setPriceStatus('checking');
    const t = window.setTimeout(async () => {
      try {
        const res = await requestLivePrice({ product, selections, quantity: qty, delivery: null });
        if (!cancelled) { setPrice(res.price || matrixPrice); setPriceStatus('live'); }
      } catch {
        if (!cancelled) { setPrice(matrixPrice); setPriceStatus('matrix'); }
      }
    }, 250);
    return () => { cancelled = true; window.clearTimeout(t); };
  }, [product, selections, qty, selectedRow?.price]);

  const title = product.name || product.title || 'Standard Business Cards';
  const description = product.description || product.shortDescription || 'Professional business cards with premium stock, flexible quantities and fast turnaround.';
  const gallery = (product.gallery || product.images || product.media || ['/images/business-card-front.svg', '/images/business-card-back.svg', '/images/flyer-front.svg']).map(img).filter(Boolean);
  const delivery = product.deliveryOptions || product.delivery?.services || [{ day: 'Monday April 27', latest: 'Latest Tuesday April 28' }, { day: 'Thursday April 23', latest: 'Latest Friday April 24', addon: '+ £1.00' }, { day: 'Wednesday April 22', latest: 'Latest Thursday April 23', addon: '+ £2.00' }];
  const [deliveryIndex, setDeliveryIndex] = useState(0);

  const addToCart = async () => {
    setCartStatus('adding');
    try { await requestAddToCart({ product, selections, quantity: qty, delivery: delivery[deliveryIndex], price }); setCartStatus('added'); }
    catch { setCartStatus('error'); }
  };

  return <section className="py-6"><Shell><div className="mb-4 flex flex-wrap items-center gap-2 text-[11px]" style={{ color: BRAND.muted }}><span>Home</span><span>/</span><span>{title}</span></div><div className="mb-4 flex flex-wrap gap-2">{['Product info', 'Specifications', 'Design guidelines', "FAQ's", 'Ordering process'].map((tab) => <button key={tab} className="rounded-full border bg-white px-4 py-2 text-[12px] font-semibold" style={{ borderColor: BRAND.line, color: BRAND.muted }}>{tab}</button>)}</div><div className="mb-5 flex items-center justify-between gap-4"><div><h1 className="text-[40px] font-black tracking-[-0.045em]" style={{ color: BRAND.ink }}>{title}</h1><p className="mt-2 max-w-[760px] text-[12px] leading-6" style={{ color: BRAND.muted }}>Configure format, stock, finishing and quantity with live backend product options.</p></div><div className="hidden items-center gap-3 rounded-[18px] border bg-white px-4 py-3 lg:flex" style={{ borderColor: BRAND.line }}><div className="flex -space-x-2">{['A', 'K', 'S'].map((x, i) => <div key={x} className="grid h-9 w-9 place-items-center rounded-full border-2 text-[12px] font-bold text-white" style={{ borderColor: 'white', backgroundColor: i === 0 ? BRAND.primary : i === 1 ? '#1F2937' : '#94A3B8' }}>{x}</div>)}</div><div><div className="text-[13px] font-bold" style={{ color: BRAND.ink }}>Do you need help?</div><div className="text-[12px] font-semibold" style={{ color: BRAND.primary }}>Chat with us</div></div></div></div><div className="grid gap-8 lg:grid-cols-[1.02fr_1fr]"><div><div className="overflow-hidden rounded-[22px] border bg-[#F5F6F7]" style={{ borderColor: BRAND.line }}><div className="relative"><img src={gallery[selectedImage] || gallery[0] || '/images/business-card-front.svg'} alt={title} className="h-[560px] w-full object-cover" /><button type="button" onClick={() => setSelectedImage((v) => (v <= 0 ? Math.max(gallery.length - 1, 0) : v - 1))} className="absolute left-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[20px]">‹</button><button type="button" onClick={() => setSelectedImage((v) => (v + 1) % Math.max(gallery.length, 1))} className="absolute right-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[20px]">›</button></div></div><div className="mt-4 flex flex-wrap gap-3">{gallery.slice(0, 6).map((g, i) => <button key={`${g}-${i}`} onClick={() => setSelectedImage(i)} className="overflow-hidden rounded-[14px] border bg-white" style={{ borderColor: selectedImage === i ? BRAND.primary : BRAND.line }}><img src={g} alt="" className="h-[70px] w-[70px] object-cover" /></button>)}</div><div className="mt-6 space-y-3"><details open className="rounded-[14px] border bg-white" style={{ borderColor: BRAND.line }}><summary className="px-4 py-3 text-[13px] font-bold">Description</summary><div className="border-t px-4 py-4 text-[12px] leading-6" style={{ borderColor: BRAND.line, color: BRAND.muted }}><p>{description}</p><div className="mt-5 space-y-3">{['High-quality full colour print', 'Artwork check included before print', 'Dynamic options and pricing from backend'].map((x) => <div key={x} className="flex items-start gap-3"><span style={{ color: BRAND.primary }}>＋</span><span>{x}</span></div>)}</div></div></details><details className="rounded-[14px] border bg-white" style={{ borderColor: BRAND.line }}><summary className="px-4 py-3 text-[13px] font-bold">Product specifications</summary><div className="border-t px-4 py-4 text-[12px] leading-6" style={{ borderColor: BRAND.line, color: BRAND.muted }}>{groups.slice(0, 14).map((g) => <div key={g.key} className="flex justify-between border-b py-2" style={{ borderColor: BRAND.line }}><b>{g.label}</b><span>{String(selections[g.key] || '')}</span></div>)}</div></details></div></div><div className="space-y-5">{groups.map((g) => <OptionGroup key={g.key} group={g} value={selections[g.key]} onChange={(v) => { setCartStatus('idle'); setSelections((p) => ({ ...p, [g.key]: v })); }} />)}<div><div className="mb-3 flex items-center gap-2 text-[14px] font-semibold"><span>Print run:</span><span style={{ color: BRAND.primary }}>{qty}</span></div><div className="grid gap-3 sm:grid-cols-2">{qRows.map((r) => <button key={r.qty} onClick={() => { setQty(r.qty); setCartStatus('idle'); }} className="relative rounded-[12px] border bg-white px-4 py-4 text-left" style={{ borderColor: String(qty) === String(r.qty) ? BRAND.primary : BRAND.line, boxShadow: String(qty) === String(r.qty) ? 'inset 0 0 0 1px rgb(24,167,208)' : 'none' }}>{r.recommended ? <div className="absolute left-0 top-0 rounded-br-[10px] rounded-tl-[10px] px-3 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-white" style={{ backgroundColor: BRAND.primary }}>Recommended</div> : null}<div className="flex items-center justify-between pt-2"><span className="text-[14px] font-semibold">{String(r.qty).toLocaleString()}</span><span className="text-[16px] font-black">{money(r.price)}</span></div></button>)}</div></div><div><div className="mb-3 text-[14px] font-semibold">Estimated delivery date</div><div className="space-y-3">{delivery.map((d, i) => <button key={`${d.day || d.label || d.name}-${i}`} onClick={() => setDeliveryIndex(i)} className="w-full rounded-[12px] border bg-white px-4 py-4 text-left" style={{ borderColor: deliveryIndex === i ? BRAND.primary : BRAND.line, boxShadow: deliveryIndex === i ? 'inset 0 0 0 1px rgb(24,167,208)' : 'none' }}><div className="flex items-start justify-between gap-4"><div><div className="text-[15px] font-bold">{d.day || d.label || d.name}</div><div className="mt-1 text-[12px]" style={{ color: BRAND.muted }}>{d.latest || d.description || 'Delivery calculated at checkout'}</div></div>{d.addon || d.extra ? <div className="text-[14px] font-bold">{d.addon || d.extra}</div> : null}</div></button>)}</div></div><div className="rounded-[20px] border bg-white p-5" style={{ borderColor: BRAND.line }}><div className="flex items-center justify-between gap-4"><div><div className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: BRAND.primary }}>Selected price</div><div className="mt-2 text-[40px] font-black tracking-[-0.04em]">{money(price)}</div><div className="mt-1 text-[11px]" style={{ color: BRAND.muted }}>{priceStatus === 'live' ? 'Live backend price' : priceStatus === 'checking' ? 'Checking backend price…' : 'Matrix/local price'}</div></div><div className="text-right text-[12px]" style={{ color: BRAND.muted }}><div>Standard delivery</div><b style={{ color: BRAND.ink }}>{delivery[deliveryIndex]?.day || delivery[deliveryIndex]?.label}</b></div></div><div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]"><button onClick={addToCart} disabled={cartStatus === 'adding'} className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-[12px] font-bold text-white disabled:opacity-60" style={{ backgroundColor: BRAND.primary }}><ShoppingCart className="h-4 w-4" />{cartStatus === 'adding' ? 'Adding…' : cartStatus === 'added' ? 'Added to basket' : 'Add to cart'}</button><button className="inline-flex items-center justify-center rounded-full border px-5 py-2.5 text-[12px] font-bold" style={{ borderColor: BRAND.line, color: BRAND.ink, backgroundColor: 'white' }}>Browse design templates</button></div>{cartStatus === 'error' ? <div className="mt-3 rounded-[10px] border border-red-200 bg-red-50 px-3 py-2 text-[12px] font-semibold text-red-700">Could not add to basket. Please try again.</div> : null}<div className="mt-4 grid gap-2 text-[12px]" style={{ color: BRAND.muted }}>{['Artwork check included before print', 'Dynamic options and pricing powered by backend config', 'Future products render from the same engine'].map((x) => <div key={x} className="flex items-center gap-2"><Check className="h-4 w-4" style={{ color: BRAND.primary }} />{x}</div>)}</div></div></div></div></Shell></section>;
}
