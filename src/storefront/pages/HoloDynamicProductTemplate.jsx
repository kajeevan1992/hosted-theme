import React, { useEffect, useMemo, useState } from 'react';
import { Check, ChevronDown, ShoppingCart } from 'lucide-react';
import { findLocalPrice, requestAddToCart, requestLivePrice } from '../commerce/liveConfiguratorEngine';
import { resolveProductConfiguration } from '../commerce/resolvedProductConfigEngine';
import { buildQuantityMatrix, getMatrixRows } from '../commerce/matrixPricingResolver';

const BRAND = { bg: '#F7F8FC', line: '#E3E8F0', ink: '#161A22', muted: '#667487', primary: '#18A7D0' };
const clean = (v) => String(v ?? '').trim().toLowerCase();
const money = (v) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(Number(v || 0));
const img = (v) => typeof v === 'string' ? v : (v?.url || v?.src || v?.image || v?.assetUrl || v?.thumbnail || '');
const isQtyGroup = (g = {}) => { const k = clean(g.key || g.id || g.label || g.name); return ['quantity', 'qty', 'print-run', 'print run', 'run'].some((x) => k === x || k.includes(x)); };

function Shell({ children }) { return <div className="mx-auto w-full max-w-[1220px] px-4 sm:px-6 lg:px-8">{children}</div>; }

function getQuantityValues(product, group) {
  const fromGroup = (group?.options || []).map((o, i) => ({ value: o.value || o.label || o.qty || o.quantity, label: o.label || o.value || o.qty || o.quantity, recommended: o.recommended || o.default || i === 0 })).filter((x) => x.value);
  if (fromGroup.length) return fromGroup;
  const fromRows = [...new Set(getMatrixRows(product).map((r) => r.quantity || r.qty || r.options?.quantity || r.options?.Quantity).filter(Boolean))];
  if (fromRows.length) return fromRows.map((q, i) => ({ value: q, label: String(q), recommended: i === 0 }));
  return [100, 250, 500, 1000, 2500, 5000].map((q, i) => ({ value: q, label: String(q), recommended: i === 0 }));
}

function priceRows(product, quantityValues, selections) {
  const rows = buildQuantityMatrix(product, quantityValues, selections);
  if (rows.some((r) => Number(r.price || 0) > 0)) return rows;
  return rows.map((r) => ({ ...r, price: findLocalPrice({ product, quantity: r.qty, selections }) }));
}

function Accordion({ title, children, open = false }) {
  return <details open={open} className="group rounded-[14px] border bg-white" style={{ borderColor: BRAND.line }}><summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-[13px] font-bold" style={{ color: BRAND.ink }}>{title}<ChevronDown className="h-4 w-4 transition group-open:rotate-180" /></summary><div className="border-t px-4 py-4 text-[12px] leading-6" style={{ borderColor: BRAND.line, color: BRAND.muted }}>{children}</div></details>;
}

function Choice({ group, option, active, onPick }) {
  const type = group.displayType || group.style || 'pill';
  const disabled = group.disabled || option.disabled;
  const style = { borderColor: active ? BRAND.primary : BRAND.line, boxShadow: active ? 'inset 0 0 0 1px rgb(24,167,208)' : 'none', opacity: disabled ? 0.45 : 1 };
  if (type === 'dropdown') return null;
  if (type === 'checkbox') return <button disabled={disabled} onClick={() => onPick(option.value)} className="inline-flex items-center gap-2 rounded-[10px] border bg-white px-4 py-3 text-[13px] font-semibold disabled:cursor-not-allowed" style={style}><span className="grid h-5 w-5 place-items-center rounded border text-[10px] text-white" style={{ borderColor: active ? BRAND.primary : BRAND.line, backgroundColor: active ? BRAND.primary : 'white' }}>{active ? '✓' : ''}</span>{option.label || option.value}</button>;
  if (type === 'swatch') return <button disabled={disabled} onClick={() => onPick(option.value)} className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-2 text-[12px] font-bold disabled:cursor-not-allowed" style={style}><span className="h-6 w-6 rounded-full border" style={{ backgroundColor: option.colour || option.color || '#EEF3F7', borderColor: BRAND.line }} />{option.label || option.value}</button>;
  if (type === 'cards') return <button disabled={disabled} onClick={() => onPick(option.value)} className="relative rounded-[14px] border bg-white p-4 text-center shadow-[0_8px_18px_rgba(0,0,0,0.02)] disabled:cursor-not-allowed" style={style}>{option.image ? <img src={option.image} alt="" className="mx-auto mb-4 h-[68px] w-[92px] rounded-[10px] object-cover" /> : <div className="mx-auto mb-4 h-[68px] w-[92px] rounded-[10px] bg-[linear-gradient(135deg,#f7f7f7,#eceff1)]" />}<div className="text-[13px] font-bold leading-5" style={{ color: BRAND.ink }}>{option.label || option.value}</div>{option.sublabel ? <div className="mt-1 text-[12px]" style={{ color: BRAND.muted }}>{option.sublabel}</div> : null}{option.recommended ? <div className="absolute inset-x-0 bottom-0 rounded-b-[12px] py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-white" style={{ backgroundColor: BRAND.primary }}>Recommended</div> : null}</button>;
  return <button disabled={disabled} onClick={() => onPick(option.value)} className="relative rounded-[10px] border bg-white px-4 py-3 text-[13px] font-semibold disabled:cursor-not-allowed" style={style}>{option.label || option.value}{option.recommended ? <span className="ml-2 rounded-full px-2 py-1 text-[9px] font-bold uppercase tracking-[0.1em] text-white" style={{ backgroundColor: BRAND.primary }}>Recommended</span> : null}</button>;
}

function OptionGroup({ group, value, onChange }) {
  const options = (group.options || []).filter((o) => o.visible !== false);
  const active = options.find((o) => clean(o.value) === clean(value));
  const type = group.displayType || group.style || 'pill';
  return <div className="border-b pb-5" style={{ borderColor: BRAND.line }}><div className="mb-3 flex items-center gap-2 text-[14px] font-semibold" style={{ color: BRAND.ink }}><span>{group.label || group.name || group.key}:</span><span style={{ color: BRAND.primary }}>{active?.label || value || 'Choose option'}</span></div>{type === 'dropdown' ? <select disabled={group.disabled} value={value || ''} onChange={(e) => onChange(e.target.value)} className="h-12 w-full rounded-[12px] border bg-white px-4 text-[13px] font-semibold disabled:opacity-50" style={{ borderColor: BRAND.line, color: BRAND.ink }}>{options.map((o) => <option key={o.id || o.value} value={o.value}>{o.label || o.value}</option>)}</select> : <div className={type === 'cards' ? 'grid gap-3 sm:grid-cols-2 xl:grid-cols-4' : 'flex flex-wrap gap-2'}>{options.map((o) => <Choice key={o.id || o.value} group={group} option={o} active={clean(value) === clean(o.value)} onPick={onChange} />)}</div>}</div>;
}

export default function HoloDynamicProductTemplate({ product = {} }) {
  const initial = useMemo(() => resolveProductConfiguration(product), [product]);
  const [selections, setSelections] = useState(initial.selections || {});
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedDelivery, setSelectedDelivery] = useState(0);
  const [priceStatus, setPriceStatus] = useState('matrix');
  const [cartStatus, setCartStatus] = useState('idle');

  useEffect(() => { setSelections(initial.selections || {}); }, [product?.id, product?.slug]);

  const resolved = useMemo(() => resolveProductConfiguration(product, selections), [product, selections]);
  const groups = useMemo(() => resolved.visibleGroups.filter((g) => !isQtyGroup(g)), [resolved.visibleGroups]);
  const qtyGroup = useMemo(() => resolved.groups.find(isQtyGroup), [resolved.groups]);
  const qValues = useMemo(() => getQuantityValues(product, qtyGroup), [product, qtyGroup]);
  const [qty, setQty] = useState(qValues[0]?.value || 1);
  useEffect(() => { if (!qValues.some((q) => String(q.value) === String(qty))) setQty(qValues[0]?.value || 1); }, [qValues, qty]);

  const pricingSelections = resolved.pricingPayload || selections;
  const qRows = useMemo(() => priceRows(product, qValues, pricingSelections), [product, qValues, pricingSelections]);
  const matrixPrice = useMemo(() => (qRows.find((r) => String(r.qty) === String(qty)) || qRows[0])?.price || 0, [qRows, qty]);
  const [price, setPrice] = useState(matrixPrice);

  useEffect(() => {
    let stopped = false;
    setPrice(matrixPrice);
    setPriceStatus('checking');
    const t = window.setTimeout(async () => {
      try {
        const res = await requestLivePrice({ product, selections: pricingSelections, quantity: qty, delivery: null });
        if (!stopped) { setPrice(res.price || matrixPrice); setPriceStatus('live'); }
      } catch {
        if (!stopped) { setPrice(matrixPrice); setPriceStatus('matrix'); }
      }
    }, 250);
    return () => { stopped = true; window.clearTimeout(t); };
  }, [product, pricingSelections, qty, matrixPrice]);

  const title = product.name || product.title || 'Standard Business Cards';
  const description = product.description || product.shortDescription || 'Professional business cards with premium stock, flexible quantities and fast turnaround.';
  const gallery = (product.gallery || product.images || product.media || ['/images/business-card-front.svg', '/images/business-card-back.svg', '/images/flyer-front.svg']).map(img).filter(Boolean);
  const delivery = product.deliveryOptions || product.delivery?.services || [{ day: 'Monday April 27', latest: 'Latest Tuesday April 28' }, { day: 'Thursday April 23', latest: 'Latest Friday April 24', addon: '+ £1.00' }, { day: 'Wednesday April 22', latest: 'Latest Thursday April 23', addon: '+ £2.00' }];

  const addToCart = async () => {
    setCartStatus('adding');
    try { await requestAddToCart({ product, selections: pricingSelections, quantity: qty, delivery: delivery[selectedDelivery], price }); setCartStatus('added'); }
    catch { setCartStatus('error'); }
  };

  return <section className="py-6"><Shell><div className="mb-4 flex flex-wrap items-center gap-2 text-[11px]" style={{ color: BRAND.muted }}><span>Home</span><span>/</span><span>{title}</span></div><div className="mb-4 flex flex-wrap gap-2">{['Product info', 'Specifications', 'Design guidelines', "FAQ's", 'Ordering process'].map((tab) => <button key={tab} className="rounded-full border bg-white px-4 py-2 text-[12px] font-semibold" style={{ borderColor: BRAND.line, color: BRAND.muted }}>{tab}</button>)}</div><div className="mb-5 flex items-center justify-between gap-4"><div><h1 className="text-[40px] font-black tracking-[-0.045em]" style={{ color: BRAND.ink }}>{title}</h1><p className="mt-2 max-w-[760px] text-[12px] leading-6" style={{ color: BRAND.muted }}>Configure format, stock, finishing and quantity with live backend product options.</p></div><div className="hidden items-center gap-3 rounded-[18px] border bg-white px-4 py-3 lg:flex" style={{ borderColor: BRAND.line }}><div className="flex -space-x-2">{['A', 'K', 'S'].map((x, i) => <div key={x} className="grid h-9 w-9 place-items-center rounded-full border-2 text-[12px] font-bold text-white" style={{ borderColor: 'white', backgroundColor: i === 0 ? BRAND.primary : i === 1 ? '#1F2937' : '#94A3B8' }}>{x}</div>)}</div><div><div className="text-[13px] font-bold" style={{ color: BRAND.ink }}>Do you need help?</div><div className="text-[12px] font-semibold" style={{ color: BRAND.primary }}>Chat with us</div></div></div></div><div className="grid gap-8 lg:grid-cols-[1.02fr_1fr]"><div><div className="overflow-hidden rounded-[22px] border bg-[#F5F6F7]" style={{ borderColor: BRAND.line }}><div className="relative"><img src={gallery[selectedImage] || gallery[0] || '/images/business-card-front.svg'} alt={title} className="h-[560px] w-full object-cover" /><button type="button" onClick={() => setSelectedImage((v) => (v <= 0 ? Math.max(gallery.length - 1, 0) : v - 1))} className="absolute left-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[20px]">‹</button><button type="button" onClick={() => setSelectedImage((v) => (v + 1) % Math.max(gallery.length, 1))} className="absolute right-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[20px]">›</button></div></div><div className="mt-4 flex flex-wrap gap-3">{gallery.slice(0, 6).map((g, i) => <button key={`${g}-${i}`} onClick={() => setSelectedImage(i)} className="overflow-hidden rounded-[14px] border bg-white" style={{ borderColor: selectedImage === i ? BRAND.primary : BRAND.line }}><img src={g} alt="" className="h-[70px] w-[70px] object-cover" /></button>)}</div><div className="mt-6 space-y-3"><Accordion title="Description" open><p>{description}</p><div className="mt-5 space-y-3">{['High-quality full colour print', 'Artwork check included before print', 'Dynamic options and pricing from backend'].map((x) => <div key={x} className="flex items-start gap-3"><span style={{ color: BRAND.primary }}>＋</span><span>{x}</span></div>)}</div></Accordion><Accordion title="Product specifications"><div className="overflow-hidden rounded-[12px] border" style={{ borderColor: BRAND.line }}>{groups.slice(0, 10).map((g, i) => <div key={g.key} className={`grid grid-cols-[170px_1fr] gap-4 px-4 py-3 ${i % 2 === 0 ? 'bg-[#F7F8F9]' : 'bg-white'}`}><b style={{ color: BRAND.ink }}>{g.label}</b><span>{String(pricingSelections[g.key] || '')}</span></div>)}</div></Accordion><Accordion title="Design guidelines">Use CMYK, 300dpi artwork and add bleed where required.</Accordion><Accordion title="Frequently asked questions">Pricing and option availability are controlled by the backend configuration.</Accordion><Accordion title="Ordering process">Choose options, add to basket, then upload artwork or request support.</Accordion></div></div><div className="space-y-5">{groups.length ? groups.map((g) => <OptionGroup key={g.key} group={g} value={pricingSelections[g.key] || selections[g.key]} onChange={(v) => { setCartStatus('idle'); setSelections((p) => ({ ...p, [g.key]: v })); }} />) : <div className="rounded-[18px] border bg-white p-5 text-[12px]" style={{ borderColor: BRAND.line, color: BRAND.muted }}>No backend option groups were found for this product.</div>}<div><div className="mb-3 flex items-center gap-2 text-[14px] font-semibold" style={{ color: BRAND.ink }}><span>Print run:</span><span style={{ color: BRAND.primary }}>{qty}</span></div><div className="grid gap-3 sm:grid-cols-2">{qRows.map((r) => <button key={r.qty} onClick={() => { setQty(r.qty); setCartStatus('idle'); }} className="relative rounded-[12px] border bg-white px-4 py-4 text-left" style={{ borderColor: String(qty) === String(r.qty) ? BRAND.primary : BRAND.line, boxShadow: String(qty) === String(r.qty) ? 'inset 0 0 0 1px rgb(24,167,208)' : 'none' }}>{r.recommended ? <div className="absolute left-0 top-0 rounded-br-[10px] rounded-tl-[10px] px-3 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-white" style={{ backgroundColor: BRAND.primary }}>Recommended</div> : null}<div className="flex items-center justify-between pt-2"><span className="text-[14px] font-semibold" style={{ color: BRAND.ink }}>{String(r.qty).toLocaleString()}</span><span className="text-[16px] font-black" style={{ color: BRAND.ink }}>{money(r.price)}</span></div></button>)}</div></div><div><div className="mb-3 text-[14px] font-semibold" style={{ color: BRAND.ink }}>Estimated delivery date</div><div className="space-y-3">{delivery.map((d, i) => <button key={`${d.day || d.label || d.name}-${i}`} onClick={() => setSelectedDelivery(i)} className="w-full rounded-[12px] border bg-white px-4 py-4 text-left" style={{ borderColor: selectedDelivery === i ? BRAND.primary : BRAND.line, boxShadow: selectedDelivery === i ? 'inset 0 0 0 1px rgb(24,167,208)' : 'none' }}><div className="flex items-start justify-between gap-4"><div><div className="text-[15px] font-bold" style={{ color: BRAND.ink }}>{d.day || d.label || d.name}</div><div className="mt-1 text-[12px]" style={{ color: BRAND.muted }}>{d.latest || d.description || 'Delivery calculated at checkout'}</div></div>{d.addon || d.extra ? <div className="text-[14px] font-bold" style={{ color: BRAND.ink }}>{d.addon || d.extra}</div> : null}</div></button>)}</div></div><div className="rounded-[20px] border bg-white p-5" style={{ borderColor: BRAND.line }}><div className="flex items-center justify-between gap-4"><div><div className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: BRAND.primary }}>Selected price</div><div className="mt-2 text-[40px] font-black tracking-[-0.04em]" style={{ color: BRAND.ink }}>{money(price)}</div><div className="mt-1 text-[11px]" style={{ color: BRAND.muted }}>{priceStatus === 'live' ? 'Live backend price' : priceStatus === 'checking' ? 'Checking backend price…' : 'Matrix/local price'}</div></div><div className="text-right text-[12px]" style={{ color: BRAND.muted }}><div>Standard delivery</div><b style={{ color: BRAND.ink }}>{delivery[selectedDelivery]?.day || delivery[selectedDelivery]?.label}</b></div></div><div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]"><button onClick={addToCart} disabled={cartStatus === 'adding'} className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-[12px] font-bold text-white disabled:opacity-60" style={{ backgroundColor: BRAND.primary }}><ShoppingCart className="h-4 w-4" />{cartStatus === 'adding' ? 'Adding…' : cartStatus === 'added' ? 'Added to basket' : 'Add to cart'}</button><button className="inline-flex items-center justify-center rounded-full border px-5 py-2.5 text-[12px] font-bold" style={{ borderColor: BRAND.line, color: BRAND.ink, backgroundColor: 'white' }}>Browse design templates</button></div>{cartStatus === 'error' ? <div className="mt-3 rounded-[10px] border border-red-200 bg-red-50 px-3 py-2 text-[12px] font-semibold text-red-700">Could not add to basket. Please try again.</div> : null}<div className="mt-4 grid gap-2 text-[12px]" style={{ color: BRAND.muted }}>{['Artwork check included before print', 'Dynamic options and pricing powered by backend config', 'Future products render from the same engine'].map((x) => <div key={x} className="flex items-center gap-2"><Check className="h-4 w-4" style={{ color: BRAND.primary }} />{x}</div>)}</div></div></div></div></Shell></section>;
}
