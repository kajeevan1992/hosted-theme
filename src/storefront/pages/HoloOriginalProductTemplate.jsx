import React, { useMemo, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';

const BRAND = {
  bg: '#F7F8FC',
  line: '#E3E8F0',
  ink: '#161A22',
  muted: '#667487',
  primary: '#18A7D0',
};

function Shell({ children }) {
  return <div className="mx-auto w-full max-w-[1220px] px-4 sm:px-6 lg:px-8">{children}</div>;
}

function currency(value) {
  if (typeof value === 'string' && value.trim().startsWith('£')) return value;
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(Number(value || 0));
}

function normalizeOptions(product = {}) {
  const raw = product.optionGroups || product.options || [];
  if (Array.isArray(raw) && raw.length) {
    return raw.map((group, index) => {
      const values = group.values || group.options || [];
      return {
        key: group.key || group.id || `option-${index}`,
        label: group.label || group.name || group.key || `Option ${index + 1}`,
        valueLabel: group.valueLabel || group.selectedLabel || '',
        style: group.style || group.displayType || group.storefrontDisplayType || (values.length > 3 ? 'tile' : 'pill'),
        options: values.map((value, optionIndex) => {
          if (typeof value === 'string' || typeof value === 'number') {
            return { value: String(value), label: String(value), recommended: optionIndex === 0 };
          }
          return {
            value: String(value.value || value.label || value.name || value.key || `value-${optionIndex}`),
            label: String(value.label || value.name || value.value || value.key || `Value ${optionIndex + 1}`),
            sublabel: value.sublabel || value.subtitle || value.helpText || '',
            recommended: Boolean(value.recommended || value.default || optionIndex === 0),
            muted: Boolean(value.disabled),
          };
        }),
      };
    });
  }

  return [
    { key: 'size', label: 'Size', valueLabel: '85 × 55 mm', style: 'tile', options: [{ value: 'Standard', label: 'Standard', sublabel: '85 × 55 mm', recommended: true }, { value: 'Portrait', label: 'Portrait', sublabel: '55 × 85 mm' }, { value: 'Folded Portrait', label: 'Folded Portrait', sublabel: '110 × 85 mm' }, { value: 'Landscape Folded', label: 'Landscape Folded', sublabel: '170 × 55 mm' }] },
    { key: 'materialType', label: 'Material Type', valueLabel: 'Matt', style: 'pill', options: [{ value: 'Matt', label: 'Matt', recommended: true }, { value: 'Glossy', label: 'Glossy' }, { value: 'Eco', label: 'Eco' }, { value: 'Uncoated', label: 'Uncoated' }, { value: 'Special', label: 'Special' }] },
    { key: 'paperType', label: 'Paper type', valueLabel: '400 gsm Silk', style: 'tile', options: [{ value: 'Matte (Silk) 300 gsm', label: 'Matte (Silk) 300 gsm' }, { value: 'Matte (Silk) 350 gsm', label: 'Matte (Silk) 350 gsm' }, { value: 'Matte (Silk) 400 gsm', label: 'Matte (Silk) 400 gsm', recommended: true }, { value: 'Matte (Silk) 450 gsm', label: 'Matte (Silk) 450 gsm' }] },
    { key: 'finishing', label: 'Finishing', valueLabel: 'No finishing', style: 'tile', options: [{ value: 'No finishing', label: 'No finishing' }, { value: 'Double-sided Matte lamination', label: 'Double-sided Matte lamination', recommended: true }, { value: 'Double-sided Gloss lamination', label: 'Double-sided Gloss lamination' }, { value: 'Double-sided UV Glossy', label: 'Double-sided UV Glossy' }] },
    { key: 'printing', label: 'Printing', valueLabel: 'Double-sided', style: 'pill', options: [{ value: 'Single-sided printing', label: 'Single-sided printing' }, { value: 'Double-sided printing', label: 'Double-sided printing', recommended: true }] },
    { key: 'corners', label: 'Corners', valueLabel: 'Straight corners', style: 'pill', options: [{ value: 'Straight corners', label: 'Straight corners' }, { value: 'Rounded Corners + £8.00', label: 'Rounded Corners + £8.00' }] },
  ];
}

function normalizeQuantities(product = {}) {
  const rows = product.pricingRows || product.quantities || product.prices || [];
  if (Array.isArray(rows) && rows.length) {
    return rows.map((row, index) => ({
      qty: row.qty || row.quantity || row.label || row.value || row,
      price: row.price || (row.priceMinor ? Number(row.priceMinor) / 100 : product.price || product.priceFromMinor / 100 || 0),
      recommended: Boolean(row.recommended || row.default || index === 0),
    }));
  }
  return [
    { qty: 50, price: 11.29 }, { qty: 100, price: 13.49 }, { qty: 250, price: 16.99 }, { qty: 500, price: 21.99, recommended: true },
    { qty: 1000, price: 27.99 }, { qty: 2500, price: 43.99 }, { qty: 5000, price: 85.99 }, { qty: 10000, price: 128.99 },
  ];
}

function normalizeDelivery(product = {}) {
  const rows = product.deliveryOptions || product.delivery?.services || [];
  if (Array.isArray(rows) && rows.length) return rows.map((row, index) => ({ day: row.day || row.label || row.name || 'Delivery', latest: row.latest || row.description || 'Latest delivery shown at checkout', addon: row.addon || row.extra || null, selected: row.selected || index === 0 }));
  return [
    { day: 'Monday April 27', latest: 'Latest Tuesday April 28', selected: true },
    { day: 'Thursday April 23', latest: 'Latest Friday April 24', addon: '+ £1.00' },
    { day: 'Wednesday April 22', latest: 'Latest Thursday April 23', addon: '+ £2.00' },
  ];
}

function Accordion({ title, defaultOpen = false, children }) {
  return (
    <details open={defaultOpen} className="group rounded-[14px] border bg-white shadow-[0_6px_16px_rgba(0,0,0,0.015)]" style={{ borderColor: BRAND.line }}>
      <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-[13px] font-bold" style={{ color: BRAND.ink }}>
        {title}<ChevronDown className="h-4 w-4 transition group-open:rotate-180" />
      </summary>
      <div className="border-t px-4 py-4" style={{ borderColor: BRAND.line }}>{children}</div>
    </details>
  );
}

export function HoloOriginalProductTemplate({ product = {} }) {
  const groups = useMemo(() => normalizeOptions(product), [product]);
  const quantities = useMemo(() => normalizeQuantities(product), [product]);
  const delivery = useMemo(() => normalizeDelivery(product), [product]);
  const images = product.gallery || product.images || ['/images/business-card-front.svg', '/images/business-card-back.svg', '/images/business-card-front.svg'];

  const initialSelected = useMemo(() => {
    const next = {};
    groups.forEach((group) => {
      const recommended = group.options.find((option) => option.recommended);
      next[group.key] = recommended?.value || group.options[0]?.value;
    });
    return next;
  }, [groups]);

  const [selected, setSelected] = useState(initialSelected);
  const [selectedQty, setSelectedQty] = useState(quantities.find((q) => q.recommended)?.qty || quantities[0]?.qty);
  const [selectedDelivery, setSelectedDelivery] = useState(0);
  const [selectedImage, setSelectedImage] = useState(0);
  const currentPrice = quantities.find((q) => String(q.qty) === String(selectedQty))?.price || product.price || product.priceFromMinor / 100 || 0;

  const title = product.name || product.title || 'Standard Business Cards';
  const description = product.description || 'Create lasting connections with affordable, professional business cards. Choose from multiple sizes, papers and finishes to match your brand identity.';

  return (
    <section className="py-6">
      <Shell>
        <div className="mb-4 flex flex-wrap items-center gap-2 text-[11px]" style={{ color: BRAND.muted }}>
          <button onClick={() => window.history.pushState({}, '', '/')}>Home</button><span>/</span><span>{title}</span>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {['Product info', 'Specifications', 'Design guidelines', "FAQ's", 'Ordering process'].map((tab) => (
            <button key={tab} className="rounded-full border bg-white px-4 py-2 text-[12px] font-semibold shadow-[0_6px_14px_rgba(0,0,0,0.02)]" style={{ borderColor: BRAND.line, color: BRAND.muted }}>{tab}</button>
          ))}
        </div>

        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-[40px] font-black tracking-[-0.045em]" style={{ color: BRAND.ink }}>{title}</h1>
            <p className="mt-2 max-w-[760px] text-[12px] leading-6" style={{ color: BRAND.muted }}>Configure format, stock, finishing and quantity with the original HOLO product page UI.</p>
          </div>
          <div className="hidden items-center gap-3 rounded-[18px] border bg-white px-4 py-3 shadow-[0_10px_24px_rgba(0,0,0,0.03)] lg:flex" style={{ borderColor: BRAND.line }}>
            <div className="flex -space-x-2">{['A', 'K', 'S'].map((x, i) => <div key={x} className="grid h-9 w-9 place-items-center rounded-full border-2 text-[12px] font-bold text-white" style={{ borderColor: 'white', backgroundColor: i === 0 ? BRAND.primary : i === 1 ? '#1F2937' : '#94A3B8' }}>{x}</div>)}</div>
            <div><div className="text-[13px] font-bold" style={{ color: BRAND.ink }}>Do you need help?</div><div className="text-[12px] font-semibold" style={{ color: BRAND.primary }}>Chat with us</div></div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.02fr_1fr]">
          <div>
            <div className="overflow-hidden rounded-[22px] border bg-[#F5F6F7] shadow-[0_14px_28px_rgba(0,0,0,0.03)]" style={{ borderColor: BRAND.line }}>
              <div className="relative"><img src={images[selectedImage] || images[0]} alt={title} className="h-[560px] w-full object-cover" /><button className="absolute left-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[20px] shadow-[0_10px_24px_rgba(0,0,0,0.08)]">‹</button><button className="absolute right-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[20px] shadow-[0_10px_24px_rgba(0,0,0,0.08)]">›</button></div>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">{images.concat(images[0]).slice(0, 6).map((img, index) => <button key={`${img}-${index}`} onClick={() => setSelectedImage(index % images.length)} className="overflow-hidden rounded-[14px] border bg-white" style={{ borderColor: selectedImage === index % images.length ? BRAND.primary : BRAND.line }}><img src={img} alt="" className="h-[70px] w-[70px] object-cover" /></button>)}</div>

            <div className="mt-6 space-y-3">
              <Accordion title="Description" defaultOpen>
                <p className="text-[13px] leading-7" style={{ color: BRAND.ink }}>{description}</p>
                <div className="mt-5 space-y-3">{['High-quality full colour print', 'Possibility of cutting deviation', 'Artwork check included before print', 'Eco-friendly options available'].map((item, index) => <div key={item} className="flex items-start gap-3 text-[12px]" style={{ color: BRAND.muted }}><span className="mt-0.5 grid h-5 w-5 place-items-center rounded-full border" style={{ borderColor: index === 1 ? BRAND.line : BRAND.primary, color: index === 1 ? BRAND.muted : BRAND.primary }}>{index === 1 ? '−' : '＋'}</span><span>{item}</span></div>)}</div>
              </Accordion>
              <Accordion title="Product specifications"><div className="overflow-hidden rounded-[12px] border" style={{ borderColor: BRAND.line }}>{[['Material', 'Matt | Eco | Writable | Special'], ['Finishing', 'Gloss | Matte | Velvet | No finishing'], ['Print', 'Full colour'], ['Printing options', 'Single-sided | Double-sided']].map(([label, value], index) => <div key={label} className={`grid grid-cols-[170px_1fr] gap-4 px-4 py-3 text-[12px] ${index % 2 === 0 ? 'bg-[#F7F8F9]' : 'bg-white'}`}><div style={{ color: BRAND.ink, fontWeight: 700 }}>{label}</div><div style={{ color: BRAND.muted }}>{value}</div></div>)}</div></Accordion>
              <Accordion title="Design guidelines"><div className="space-y-3 text-[12px]">{['Use CMYK as the colour mode.', 'Resolution of at least 300 dpi.', 'Add 3 mm bleed and keep 4 mm safety margin.'].map((item) => <div key={item} className="font-medium underline" style={{ color: BRAND.primary }}>{item}</div>)}</div></Accordion>
              <Accordion title="Frequently asked questions"><div className="space-y-3 text-[12px]">{['What is this product?', 'What materials can I choose from?', 'What turnaround options are available?'].map((item) => <div key={item} className="font-medium underline" style={{ color: BRAND.primary }}>{item}</div>)}</div></Accordion>
              <Accordion title="Ordering process"><div className="space-y-3 text-[12px]"><div className="font-medium underline" style={{ color: BRAND.primary }}>Ordering with own design</div><div className="font-medium underline" style={{ color: BRAND.primary }}>Using editor design</div></div></Accordion>
            </div>
          </div>

          <div className="space-y-5">
            {groups.map((group) => (
              <div key={group.key}>
                <div className="mb-3 flex items-center gap-2 text-[18px] font-black tracking-[-0.03em]" style={{ color: BRAND.ink }}><span className="text-[15px] font-semibold tracking-normal">{group.label}:</span><span className="text-[15px] font-semibold tracking-normal" style={{ color: BRAND.primary }}>{selected[group.key] || group.valueLabel}</span></div>
                {group.style === 'tile' || group.style === 'cards' ? (
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{group.options.map((option) => { const active = selected[group.key] === option.value; return <button key={option.value} onClick={() => setSelected((prev) => ({ ...prev, [group.key]: option.value }))} className="relative rounded-[14px] border bg-white p-4 text-center shadow-[0_8px_18px_rgba(0,0,0,0.02)]" style={{ borderColor: active ? BRAND.primary : BRAND.line, boxShadow: active ? 'inset 0 0 0 1px rgb(24, 167, 208)' : 'none', opacity: option.muted ? 0.72 : 1 }}><div className="mx-auto mb-4 h-[68px] w-[92px] rounded-[10px] bg-[linear-gradient(135deg,#f7f7f7,#eceff1)]" /><div className="text-[13px] font-bold leading-5" style={{ color: BRAND.ink }}>{option.label || option.value}</div>{option.sublabel ? <div className="mt-1 text-[12px]" style={{ color: BRAND.muted }}>{option.sublabel}</div> : null}{option.recommended ? <div className="absolute inset-x-0 bottom-0 rounded-b-[12px] py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white" style={{ backgroundColor: BRAND.primary }}>Recommended</div> : null}</button>; })}</div>
                ) : (
                  <div className="flex flex-wrap gap-2">{group.options.map((option) => { const active = selected[group.key] === option.value; return <button key={option.value} onClick={() => setSelected((prev) => ({ ...prev, [group.key]: option.value }))} className="relative rounded-[10px] border bg-white px-4 py-3 text-[13px] font-semibold" style={{ borderColor: active ? BRAND.primary : BRAND.line, boxShadow: active ? 'inset 0 0 0 1px rgb(24, 167, 208)' : 'none' }}>{option.label || option.value}{option.recommended ? <span className="ml-2 rounded-full px-2 py-1 text-[9px] font-bold uppercase tracking-[0.1em] text-white" style={{ backgroundColor: BRAND.primary }}>Recommended</span> : null}</button>; })}</div>
                )}
              </div>
            ))}

            <div><div className="mb-3 flex items-center gap-2 text-[14px] font-semibold" style={{ color: BRAND.ink }}><span>Print run:</span><span style={{ color: BRAND.primary }}>{selectedQty}</span></div><div className="grid gap-3 sm:grid-cols-2">{quantities.map((row) => <button key={row.qty} onClick={() => setSelectedQty(row.qty)} className="relative rounded-[12px] border bg-white px-4 py-4 text-left shadow-[0_6px_16px_rgba(0,0,0,0.02)]" style={{ borderColor: String(selectedQty) === String(row.qty) ? BRAND.primary : BRAND.line, boxShadow: String(selectedQty) === String(row.qty) ? 'inset 0 0 0 1px rgb(24, 167, 208)' : 'none' }}>{row.recommended ? <div className="absolute left-0 top-0 rounded-br-[10px] rounded-tl-[10px] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white" style={{ backgroundColor: BRAND.primary }}>Recommended</div> : null}<div className="flex items-center justify-between pt-2"><span className="text-[14px] font-semibold" style={{ color: BRAND.ink }}>{String(row.qty).toLocaleString()}</span><span className="text-[16px] font-black" style={{ color: BRAND.ink }}>{currency(row.price)}</span></div></button>)}</div><div className="mt-3 text-right text-[12px] font-semibold underline" style={{ color: BRAND.primary }}>Show all quantities</div></div>

            <div><div className="mb-3 text-[14px] font-semibold" style={{ color: BRAND.ink }}>Estimated delivery date</div><div className="space-y-3">{delivery.map((item, index) => <button key={`${item.day}-${index}`} onClick={() => setSelectedDelivery(index)} className="w-full rounded-[12px] border bg-white px-4 py-4 text-left shadow-[0_6px_16px_rgba(0,0,0,0.02)]" style={{ borderColor: selectedDelivery === index ? BRAND.primary : BRAND.line, boxShadow: selectedDelivery === index ? 'inset 0 0 0 1px rgb(24, 167, 208)' : 'none' }}><div className="flex items-start justify-between gap-4"><div><div className="text-[15px] font-bold" style={{ color: BRAND.ink }}>{item.day}</div><div className="mt-1 text-[12px]" style={{ color: BRAND.muted }}>{item.latest}</div></div>{item.addon ? <div className="text-[14px] font-bold" style={{ color: BRAND.ink }}>{item.addon}</div> : null}</div></button>)}</div></div>

            <div className="rounded-[20px] border bg-white p-5 shadow-[0_16px_34px_rgba(0,0,0,0.04)]" style={{ borderColor: BRAND.line }}>
              <div className="flex items-center justify-between gap-4"><div><div className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: BRAND.primary }}>Selected price</div><div className="mt-2 text-[40px] font-black tracking-[-0.04em]" style={{ color: BRAND.ink }}>{currency(currentPrice)}</div><div className="mt-1 text-[11px]" style={{ color: BRAND.muted }}>Ex VAT visual placeholder pricing</div></div><div className="text-right text-[12px]" style={{ color: BRAND.muted }}><div>Standard delivery</div><div className="font-semibold" style={{ color: BRAND.ink }}>{delivery[selectedDelivery]?.day}</div></div></div>
              <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]"><button className="inline-flex items-center justify-center rounded-full px-5 py-2.5 text-[12px] font-bold text-white shadow-[0_12px_26px_rgba(24,167,208,0.22)]" style={{ backgroundColor: BRAND.primary }}>Add to cart</button><button className="inline-flex items-center justify-center rounded-full border px-5 py-2.5 text-[12px] font-bold" style={{ borderColor: BRAND.line, color: BRAND.ink, backgroundColor: 'white' }}>Browse design templates</button></div>
              <div className="mt-4 grid gap-2 text-[12px]" style={{ color: BRAND.muted }}><div className="mb-2 flex flex-wrap gap-2">{['Secure checkout later', 'Artwork support', 'Bespoke quote route'].map((item) => <span key={item} className="rounded-full border bg-[#F8FBFC] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em]" style={{ borderColor: BRAND.line, color: BRAND.primary }}>{item}</span>)}</div><div className="flex items-center gap-2"><Check className="h-4 w-4" style={{ color: BRAND.primary }} /> Artwork check included before print</div><div className="flex items-center gap-2"><Check className="h-4 w-4" style={{ color: BRAND.primary }} /> Custom sizes and specialist materials via bespoke quote</div><div className="flex items-center gap-2"><Check className="h-4 w-4" style={{ color: BRAND.primary }} /> Production advice available from support</div></div>
            </div>
          </div>
        </div>
      </Shell>
    </section>
  );
}

export default HoloOriginalProductTemplate;
