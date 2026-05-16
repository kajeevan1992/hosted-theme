import React, { useEffect, useMemo, useState } from 'react';
import { Check, ShoppingCart } from 'lucide-react';
import { requestAddToCart, requestLivePrice } from '../commerce/liveConfiguratorEngine';

const BRAND = { line: '#E3E8F0', ink: '#161A22', muted: '#667487', primary: '#18A7D0' };
const clean = (value) => String(value ?? '').trim().toLowerCase();
const money = (value) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(Number(value || 0));
const img = (value) => typeof value === 'string' ? value : (value?.url || value?.src || value?.image || value?.assetUrl || value?.thumbnail || '');

function Shell({ children }) {
  return <div className="mx-auto w-full max-w-[1220px] px-4 sm:px-6 lg:px-8">{children}</div>;
}

function asArray(...values) {
  for (const value of values) {
    if (Array.isArray(value) && value.length) return value;
  }
  return [];
}

function valueList(group = {}) {
  return asArray(group.values, group.options, group.choices, group.items, group.optionValues).map((option, index) => {
    if (typeof option === 'string' || typeof option === 'number') {
      return { id: String(option), value: String(option), label: String(option), recommended: index === 0, default: index === 0, visible: true };
    }
    const value = option.value ?? option.label ?? option.name ?? option.key ?? option.id ?? '';
    return {
      ...option,
      id: option.id || option.key || String(value),
      value: String(value),
      label: option.label || option.name || String(value),
      recommended: Boolean(option.recommended || option.default || option.isDefault || index === 0),
      default: Boolean(option.default || option.isDefault || index === 0),
      visible: option.visible !== false && option.hidden !== true,
      disabled: Boolean(option.disabled || option.isDisabled),
    };
  }).filter((option) => option.value);
}

function apiGroups(product = {}) {
  const groups = asArray(
    product.optionGroups,
    product.metadataJson?.optionGroups,
    product.configurator?.optionGroups,
    product.configuration?.optionGroups,
    product.options,
    product.metadataJson?.options,
  );

  return groups.map((group, index) => {
    const values = valueList(group);
    return {
      ...group,
      id: group.id || group.key || `group-${index}`,
      key: group.key || group.id || `group-${index}`,
      label: group.label || group.name || group.title || group.key || `Option ${index + 1}`,
      displayType: group.storefrontDisplayType || group.displayType || group.style || group.inputType || group.type || 'pill',
      visible: group.visible !== false && group.hidden !== true,
      sortOrder: Number(group.sortOrder ?? group.order ?? index),
      options: values,
    };
  }).filter((group) => group.visible !== false && group.options.length).sort((a, b) => a.sortOrder - b.sortOrder);
}

function isQuantityGroup(group = {}) {
  const key = clean(`${group.key} ${group.label}`);
  return key.includes('quantity') || key.includes('print run') || key.includes('print-run') || key.includes('qty');
}

function initialSelections(groups = []) {
  const next = {};
  groups.forEach((group) => {
    const option = group.options.find((item) => item.default || item.recommended) || group.options[0];
    if (option) next[group.key] = option.value;
  });
  return next;
}

function matrixRows(product = {}) {
  return asArray(
    product.pricingMatrix?.rows,
    product.metadataJson?.pricingMatrix?.rows,
    product.pricingRows,
    product.matrixRows,
    product.csvRows,
  );
}

function rowOptions(row = {}) {
  return row.options || row.selections || row.config || row.configuration || row.attributes || row;
}

function readRowValue(row = {}, key) {
  const source = rowOptions(row);
  const keys = [key, String(key).toLowerCase(), String(key).toUpperCase(), String(key).replace(/[-_]/g, ' '), String(key).replace(/\s+/g, '')];
  return keys.map((item) => source?.[item]).find((value) => value !== undefined && value !== null && value !== '');
}

function rowMatches(row = {}, selections = {}, qty) {
  const source = rowOptions(row);
  const rowQty = row.quantity || row.qty || source.quantity || source.Quantity || source.Qty;
  if (qty !== undefined && qty !== null && rowQty && String(rowQty) !== String(qty)) return false;

  return Object.entries(selections).every(([key, value]) => {
    if (value === undefined || value === null || value === '' || clean(key).includes('quantity')) return true;
    const rowValue = readRowValue(row, key);
    if (rowValue === undefined || rowValue === null || rowValue === '') return true;
    return clean(rowValue) === clean(value);
  });
}

function rowPrice(row = {}) {
  const minor = row.priceMinor ?? row.totalMinor ?? row.supplierPriceMinor;
  if (minor !== undefined && minor !== null) return Number(minor) / 100;
  const major = row.price ?? row.Price ?? row.total ?? row.Total;
  if (major !== undefined && major !== null && major !== '') return Number(String(major).replace(/[^0-9.]/g, ''));
  return null;
}

function quantityRows(product, qtyGroup, selections) {
  const quantities = valueList(qtyGroup).length ? valueList(qtyGroup) : [...new Set(matrixRows(product).map((row) => row.quantity || row.qty || rowOptions(row).quantity || rowOptions(row).Quantity).filter(Boolean))].map((value, index) => ({ value: String(value), label: String(value), recommended: index === 0 }));
  const fallback = quantities.length ? quantities : [100, 250, 500, 1000, 2500, 5000].map((value, index) => ({ value: String(value), label: String(value), recommended: index === 0 }));

  return fallback.map((item, index) => {
    const qty = item.value || item.label;
    const row = matrixRows(product).find((candidate) => rowMatches(candidate, selections, qty));
    return { qty, price: rowPrice(row) ?? Number(item.price || item.priceExVat || 0), recommended: Boolean(item.recommended || item.default || index === 0) };
  });
}

function OptionGroup({ group, value, onChange }) {
  const display = clean(group.displayType);
  const options = group.options.filter((option) => option.visible !== false);
  const selected = options.find((option) => clean(option.value) === clean(value));
  const isCards = display.includes('card') || display.includes('grid') || display.includes('tile');
  const isDropdown = display.includes('dropdown') || display.includes('select');

  return <div className="border-b pb-5" style={{ borderColor: BRAND.line }}><div className="mb-3 flex gap-2 text-[14px] font-semibold"><span style={{ color: BRAND.ink }}>{group.label}:</span><span style={{ color: BRAND.primary }}>{selected?.label || value || 'Choose option'}</span></div>{isDropdown ? <select value={value || ''} onChange={(e) => onChange(e.target.value)} className="h-12 w-full rounded-[12px] border bg-white px-4 text-[13px] font-semibold" style={{ borderColor: BRAND.line }}>{options.map((option) => <option key={option.id || option.value} value={option.value}>{option.label}</option>)}</select> : <div className={isCards ? 'grid gap-3 sm:grid-cols-2 xl:grid-cols-4' : 'flex flex-wrap gap-2'}>{options.map((option) => { const active = clean(option.value) === clean(value); return <button key={option.id || option.value} disabled={option.disabled} onClick={() => onChange(option.value)} className={isCards ? 'relative rounded-[14px] border bg-white p-4 text-center disabled:cursor-not-allowed' : 'rounded-[10px] border bg-white px-4 py-3 text-[12px] font-semibold disabled:cursor-not-allowed'} style={{ borderColor: active ? BRAND.primary : BRAND.line, boxShadow: active ? 'inset 0 0 0 1px rgb(24,167,208)' : 'none', opacity: option.disabled ? 0.45 : 1 }}>{isCards ? <div className="mx-auto mb-3 h-[58px] w-[86px] rounded-[10px] bg-[linear-gradient(135deg,#f7f7f7,#eceff1)]" /> : null}<span>{option.label}</span>{option.recommended ? <span className="ml-2 rounded-full px-2 py-1 text-[8px] font-bold uppercase text-white" style={{ backgroundColor: BRAND.primary }}>Recommended</span> : null}</button>; })}</div>}</div>;
}

export default function HoloApiProductTemplate({ product = {} }) {
  const groups = useMemo(() => apiGroups(product), [product]);
  const qtyGroup = useMemo(() => groups.find(isQuantityGroup), [groups]);
  const visibleGroups = useMemo(() => groups.filter((group) => !isQuantityGroup(group)), [groups]);
  const [selections, setSelections] = useState(() => initialSelections(groups));
  const [qty, setQty] = useState('');
  const [price, setPrice] = useState(0);
  const [priceStatus, setPriceStatus] = useState('api');
  const [cartStatus, setCartStatus] = useState('idle');
  const [selectedImage, setSelectedImage] = useState(0);
  const [deliveryIndex, setDeliveryIndex] = useState(0);

  useEffect(() => {
    const next = initialSelections(groups);
    setSelections(next);
    const qRows = quantityRows(product, qtyGroup, next);
    setQty(qRows[0]?.qty || '1');
  }, [product?.id, product?.slug, groups, qtyGroup]);

  const qRows = useMemo(() => quantityRows(product, qtyGroup, selections), [product, qtyGroup, selections]);
  const selectedRow = qRows.find((row) => String(row.qty) === String(qty)) || qRows[0];

  useEffect(() => {
    let cancelled = false;
    const matrixPrice = selectedRow?.price || 0;
    setPrice(matrixPrice);
    setPriceStatus('matrix');
    const timer = window.setTimeout(async () => {
      try {
        const live = await requestLivePrice({ product, selections, quantity: qty, delivery: null });
        if (!cancelled) { setPrice(live.price || matrixPrice); setPriceStatus('live'); }
      } catch {
        if (!cancelled) { setPrice(matrixPrice); setPriceStatus('matrix'); }
      }
    }, 250);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [product, selections, qty, selectedRow?.price]);

  const title = product.name || product.title || 'Product';
  const description = product.description || product.shortDescription || 'Configure this product using backend option groups.';
  const gallery = asArray(product.gallery, product.images, product.media).map(img).filter(Boolean);
  const displayGallery = gallery.length ? gallery : ['/images/business-card-front.svg', '/images/flyer-front.svg', '/images/poster-main.svg'];
  const delivery = asArray(product.deliveryOptions, product.delivery?.services, product.turnaroundOptions);
  const displayDelivery = delivery.length ? delivery : [{ day: 'Standard delivery', latest: 'Calculated at checkout' }];

  const addToCart = async () => {
    setCartStatus('adding');
    try {
      await requestAddToCart({ product, selections, quantity: qty, delivery: displayDelivery[deliveryIndex], price });
      setCartStatus('added');
    } catch {
      setCartStatus('error');
    }
  };

  return <section className="py-6"><Shell><div className="mb-4 flex flex-wrap items-center gap-2 text-[11px]" style={{ color: BRAND.muted }}><span>Home</span><span>/</span><span>{title}</span>{product.__isFallbackProduct ? <span className="rounded-full bg-amber-100 px-2 py-1 text-amber-700">Fallback data</span> : null}</div><div className="mb-4 flex flex-wrap gap-2">{['Product info', 'Specifications', 'Design guidelines', "FAQ's", 'Ordering process'].map((tab) => <button key={tab} className="rounded-full border bg-white px-4 py-2 text-[12px] font-semibold" style={{ borderColor: BRAND.line, color: BRAND.muted }}>{tab}</button>)}</div><div className="mb-5 flex items-center justify-between gap-4"><div><h1 className="text-[40px] font-black tracking-[-0.045em]" style={{ color: BRAND.ink }}>{title}</h1><p className="mt-2 max-w-[760px] text-[12px] leading-6" style={{ color: BRAND.muted }}>Rendering backend API option groups directly.</p></div></div><div className="grid gap-8 lg:grid-cols-[1.02fr_1fr]"><div><div className="overflow-hidden rounded-[22px] border bg-[#F5F6F7]" style={{ borderColor: BRAND.line }}><div className="relative"><img src={displayGallery[selectedImage] || displayGallery[0]} alt={title} className="h-[560px] w-full object-cover" /><button type="button" onClick={() => setSelectedImage((value) => (value <= 0 ? displayGallery.length - 1 : value - 1))} className="absolute left-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[20px]">‹</button><button type="button" onClick={() => setSelectedImage((value) => (value + 1) % displayGallery.length)} className="absolute right-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[20px]">›</button></div></div><div className="mt-4 flex flex-wrap gap-3">{displayGallery.slice(0, 6).map((image, index) => <button key={`${image}-${index}`} onClick={() => setSelectedImage(index)} className="overflow-hidden rounded-[14px] border bg-white" style={{ borderColor: selectedImage === index ? BRAND.primary : BRAND.line }}><img src={image} alt="" className="h-[70px] w-[70px] object-cover" /></button>)}</div><div className="mt-6 space-y-3"><details open className="rounded-[14px] border bg-white" style={{ borderColor: BRAND.line }}><summary className="px-4 py-3 text-[13px] font-bold">Description</summary><div className="border-t px-4 py-4 text-[12px] leading-6" style={{ borderColor: BRAND.line, color: BRAND.muted }}><p>{description}</p><div className="mt-5 space-y-3">{['API option groups only', 'No hardcoded Size/Paper/Finish fallback', 'Matrix/live pricing ready'].map((text) => <div key={text} className="flex items-start gap-3"><span style={{ color: BRAND.primary }}>＋</span><span>{text}</span></div>)}</div></div></details><details className="rounded-[14px] border bg-white" style={{ borderColor: BRAND.line }}><summary className="px-4 py-3 text-[13px] font-bold">Product specifications</summary><div className="border-t px-4 py-4 text-[12px] leading-6" style={{ borderColor: BRAND.line, color: BRAND.muted }}>{groups.map((group) => <div key={group.key} className="flex justify-between border-b py-2" style={{ borderColor: BRAND.line }}><b>{group.label}</b><span>{String(selections[group.key] || '')}</span></div>)}</div></details></div></div><div className="space-y-5">{visibleGroups.length ? visibleGroups.map((group) => <OptionGroup key={group.key} group={group} value={selections[group.key]} onChange={(value) => { setCartStatus('idle'); setSelections((prev) => ({ ...prev, [group.key]: value })); }} />) : <div className="rounded-[18px] border bg-white p-5 text-[12px]" style={{ borderColor: BRAND.line, color: BRAND.muted }}>No API option groups found for this product.</div>}<div><div className="mb-3 flex items-center gap-2 text-[14px] font-semibold"><span>{qtyGroup?.label || 'Quantity'}:</span><span style={{ color: BRAND.primary }}>{qty}</span></div><div className="grid gap-3 sm:grid-cols-2">{qRows.map((row) => <button key={row.qty} onClick={() => { setQty(row.qty); setCartStatus('idle'); }} className="relative rounded-[12px] border bg-white px-4 py-4 text-left" style={{ borderColor: String(qty) === String(row.qty) ? BRAND.primary : BRAND.line, boxShadow: String(qty) === String(row.qty) ? 'inset 0 0 0 1px rgb(24,167,208)' : 'none' }}>{row.recommended ? <div className="absolute left-0 top-0 rounded-br-[10px] rounded-tl-[10px] px-3 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-white" style={{ backgroundColor: BRAND.primary }}>Recommended</div> : null}<div className="flex items-center justify-between pt-2"><span className="text-[14px] font-semibold">{String(row.qty).toLocaleString()}</span><span className="text-[16px] font-black">{money(row.price)}</span></div></button>)}</div></div><div><div className="mb-3 text-[14px] font-semibold">Estimated delivery date</div><div className="space-y-3">{displayDelivery.map((item, index) => <button key={`${item.day || item.label || item.name}-${index}`} onClick={() => setDeliveryIndex(index)} className="w-full rounded-[12px] border bg-white px-4 py-4 text-left" style={{ borderColor: deliveryIndex === index ? BRAND.primary : BRAND.line, boxShadow: deliveryIndex === index ? 'inset 0 0 0 1px rgb(24,167,208)' : 'none' }}><div className="flex items-start justify-between gap-4"><div><div className="text-[15px] font-bold">{item.day || item.label || item.name}</div><div className="mt-1 text-[12px]" style={{ color: BRAND.muted }}>{item.latest || item.description || 'Delivery calculated at checkout'}</div></div>{item.addon || item.extra ? <div className="text-[14px] font-bold">{item.addon || item.extra}</div> : null}</div></button>)}</div></div><div className="rounded-[20px] border bg-white p-5" style={{ borderColor: BRAND.line }}><div className="flex items-center justify-between gap-4"><div><div className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: BRAND.primary }}>Selected price</div><div className="mt-2 text-[40px] font-black tracking-[-0.04em]">{money(price)}</div><div className="mt-1 text-[11px]" style={{ color: BRAND.muted }}>{priceStatus === 'live' ? 'Live backend price' : 'Matrix/API price'}</div></div><div className="text-right text-[12px]" style={{ color: BRAND.muted }}><div>Delivery</div><b style={{ color: BRAND.ink }}>{displayDelivery[deliveryIndex]?.day || displayDelivery[deliveryIndex]?.label}</b></div></div><div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]"><button onClick={addToCart} disabled={cartStatus === 'adding'} className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-[12px] font-bold text-white disabled:opacity-60" style={{ backgroundColor: BRAND.primary }}><ShoppingCart className="h-4 w-4" />{cartStatus === 'adding' ? 'Adding…' : cartStatus === 'added' ? 'Added to basket' : 'Add to cart'}</button><button className="inline-flex items-center justify-center rounded-full border px-5 py-2.5 text-[12px] font-bold" style={{ borderColor: BRAND.line, color: BRAND.ink, backgroundColor: 'white' }}>Browse design templates</button></div>{cartStatus === 'error' ? <div className="mt-3 rounded-[10px] border border-red-200 bg-red-50 px-3 py-2 text-[12px] font-semibold text-red-700">Could not add to basket. Please try again.</div> : null}<div className="mt-4 grid gap-2 text-[12px]" style={{ color: BRAND.muted }}>{['Artwork check included before print', 'Backend option groups render directly', 'No inferred product options unless API has no groups'].map((x) => <div key={x} className="flex items-center gap-2"><Check className="h-4 w-4" style={{ color: BRAND.primary }} />{x}</div>)}</div></div></div></div></Shell></section>;
}
