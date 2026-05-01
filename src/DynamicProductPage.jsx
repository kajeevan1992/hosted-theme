import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Clock3, Download, FileText, Leaf, Package, ShoppingCart, Sparkles, Truck } from 'lucide-react';
import DynamicOptionGroups from './DynamicOptionGroups';
import { addToCart, products as productApi } from './services_api';

function money(minor = 0, currency = 'GBP') {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency }).format(Number(minor || 0) / 100);
}

function content(product) {
  return product?.content || product?.metadataJson?.content || {};
}

function media(product) {
  return product?.media || product?.metadataJson?.media || {};
}

function delivery(product) {
  return product?.delivery || product?.metadataJson?.delivery || {};
}

function designServices(product) {
  return product?.designServices || product?.metadataJson?.designServices || [];
}

function artwork(product) {
  return product?.artwork || product?.metadataJson?.artwork || product?.artworkRules || {};
}

function editor(product) {
  return product?.editor || product?.metadataJson?.editor || {};
}

function addWorkingDays(start, days) {
  const date = new Date(start);
  let remaining = Number(days || 0);
  while (remaining > 0) {
    date.setDate(date.getDate() + 1);
    const day = date.getDay();
    if (day !== 0 && day !== 6) remaining -= 1;
  }
  return date;
}

function formatDate(date) {
  return new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }).format(date);
}

function timeUntilCutoff(cutoff = '14:00') {
  const [hour, minute] = String(cutoff || '14:00').split(':').map(Number);
  const now = new Date();
  const target = new Date();
  target.setHours(hour || 14, minute || 0, 0, 0);
  if (target < now) target.setDate(target.getDate() + 1);
  const diff = Math.max(0, target.getTime() - now.getTime());
  const hours = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  return `${hours}hrs ${mins}mins`;
}

function deliveryServices(product) {
  const d = delivery(product);
  const services = Array.isArray(d.services) ? d.services : [];
  if (services.length) return services.filter((s) => s.enabled !== false);
  return [
    { id: 'saver', label: 'Saver', workingDays: 5, extraMinor: 0 },
    { id: 'standard', label: 'Standard', workingDays: 3, extraMinor: 500 },
    { id: 'express', label: 'Express', workingDays: 1, extraMinor: 1000 },
  ];
}

function TabButton({ active, children, onClick }) {
  return <button type="button" onClick={onClick} className={`rounded-full px-4 py-2 text-sm font-bold transition ${active ? 'bg-slate-950 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}>{children}</button>;
}

function InfoTable({ items = [] }) {
  if (!items.length) return null;
  return <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">{items.map((item, index) => <div key={`${item.label}-${index}`} className="grid grid-cols-[160px_1fr] border-b border-slate-100 last:border-b-0"><div className="bg-slate-50 p-3 text-sm font-bold text-slate-600">{item.label}</div><div className="p-3 text-sm text-slate-800">{item.value}</div></div>)}</div>;
}

export default function DynamicProductPage({ slug, product: initialProduct, onCartChange }) {
  const [product, setProduct] = useState(initialProduct || null);
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedDelivery, setSelectedDelivery] = useState('standard');
  const [selectedDesignServices, setSelectedDesignServices] = useState([]);
  const [config, setConfig] = useState({ selections: {}, blocked: false, messages: [], priceAdjustments: [] });
  const [activeTab, setActiveTab] = useState('specifications');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialProduct) return;
    if (!slug) return;
    (async () => {
      try {
        const data = await productApi.get(slug);
        setProduct(data.product || data);
      } catch (err) {
        setError(err?.message || 'Product failed to load.');
      }
    })();
  }, [slug, initialProduct]);

  const c = content(product);
  const m = media(product);
  const d = delivery(product);
  const art = artwork(product);
  const ed = editor(product);
  const services = deliveryServices(product);
  const gallery = useMemo(() => {
    const images = [m.heroImageUrl, ...(Array.isArray(m.gallery) ? m.gallery : [])].filter(Boolean);
    return images.length ? images : ['/images/business-card-front.svg', '/images/flyer-front.svg', '/images/poster-main.svg'];
  }, [m.heroImageUrl, m.gallery]);

  useEffect(() => {
    if (!selectedImage && gallery[0]) setSelectedImage(gallery[0]);
  }, [gallery, selectedImage]);

  const selectedDeliveryData = services.find((item) => item.id === selectedDelivery) || services[0];
  const basePrice = Number(product?.priceFromMinor || product?.pricing?.priceFromMinor || 0);
  const deliveryExtra = Number(selectedDeliveryData?.extraMinor || 0);
  const designExtra = selectedDesignServices.reduce((sum, id) => sum + Number(designServices(product).find((item) => item.id === id)?.priceMinor || 0), 0);
  const ruleExtra = (config.priceAdjustments || []).reduce((sum, item) => sum + Number(item.amountMinor || 0), 0);
  const totalMinor = basePrice + deliveryExtra + designExtra + ruleExtra;

  async function handleAddToCart() {
    if (!product || config.blocked) return;
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const payload = {
        productId: product.id,
        productSlug: product.slug,
        productName: product.name,
        quantity: config.selections?.quantity || product.quantities?.[0] || 1,
        selections: config.selections,
        delivery: selectedDeliveryData,
        designServices: designServices(product).filter((item) => selectedDesignServices.includes(item.id)),
        pricePreviewMinor: totalMinor,
        artwork: { required: product.artworkRequired !== false, rules: product.artworkRules || art },
      };
      const cart = await addToCart(payload);
      setMessage(`${product.name} added to cart.`);
      onCartChange?.(cart);
    } catch (err) {
      setError(err?.message || 'Add to cart failed.');
    } finally {
      setBusy(false);
    }
  }

  if (!product) return <div className="mx-auto max-w-7xl p-8 text-slate-600">Loading product...</div>;

  const tabs = [
    ['specifications', 'Specifications'],
    ['design', 'Design guidelines'],
    ['artwork', 'Artwork'],
    ['technical', 'Technical specs'],
    ['faq', 'FAQs'],
    ['sustainability', 'Sustainability'],
    ['ordering', 'Ordering process'],
  ];

  return (
    <main className="bg-[#F7F8FC] text-slate-950">
      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-8 lg:grid-cols-[1fr_460px] lg:px-8">
        <div className="space-y-5">
          <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
            <img src={selectedImage || gallery[0]} alt={product.name} className="h-[420px] w-full rounded-3xl bg-slate-50 object-contain" />
            <div className="mt-4 grid grid-cols-5 gap-3">
              {gallery.slice(0, 5).map((image) => <button key={image} type="button" onClick={() => setSelectedImage(image)} className={`rounded-2xl border p-2 ${selectedImage === image ? 'border-sky-400 bg-sky-50' : 'border-slate-200 bg-white'}`}><img src={image} alt="" className="h-20 w-full object-contain" /></button>)}
            </div>
          </div>

          {Array.isArray(m.materialImages) && m.materialImages.length ? <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-black">Material images</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-3">{m.materialImages.map((item, index) => <div key={`${item.label}-${index}`} className="rounded-2xl border border-slate-200 p-3"><img src={item.url} alt="" className="h-32 w-full rounded-xl bg-slate-50 object-contain"/><p className="mt-2 text-sm font-bold">{item.label}</p></div>)}</div>
          </section> : null}
        </div>

        <aside className="space-y-5 lg:sticky lg:top-6 lg:self-start">
          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="inline-flex rounded-full bg-sky-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-sky-700">{product.productType || 'Print product'}</p>
            <h1 className="mt-4 text-4xl font-black tracking-[-0.06em]">{product.name}</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">{c.shortDescription || product.description || 'Configure this print product online and add artwork during checkout.'}</p>
            <div className="mt-5 rounded-2xl bg-slate-950 p-4 text-white">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Live price</p>
              <p className="mt-1 text-3xl font-black">{money(totalMinor, product.currency || 'GBP')}</p>
              <p className="mt-1 text-xs text-slate-400">Includes selected delivery/design extras shown below.</p>
            </div>
          </section>

          <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <DynamicOptionGroups product={product} onChange={setConfig} onBlockedChange={(blocked) => setConfig((prev) => ({ ...prev, blocked }))} />
          </section>

          <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2"><Truck size={18}/><h2 className="font-black">Delivery options</h2></div>
            {d.countdownEnabled !== false && selectedDeliveryData ? <div className="mb-3 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-900"><Clock3 size={16} className="mr-1 inline"/>Order within {timeUntilCutoff(selectedDeliveryData.cutoff || d.cutoffTime || '14:00')} to receive by {formatDate(addWorkingDays(new Date(), selectedDeliveryData.workingDays || 0))}</div> : null}
            <div className="grid gap-3">{services.map((service) => <button key={service.id} type="button" onClick={() => setSelectedDelivery(service.id)} className={`rounded-2xl border p-4 text-left ${selectedDelivery === service.id ? 'border-sky-400 bg-sky-50' : 'border-slate-200 bg-white'}`}><div className="flex items-center justify-between"><p className="font-black">{service.label}</p><p className="font-bold">{service.extraMinor ? `+ ${money(service.extraMinor)}` : 'Included'}</p></div><p className="mt-1 text-xs text-slate-500">Expected {formatDate(addWorkingDays(new Date(), service.workingDays || 0))}{service.cutoff ? ` · cutoff ${service.cutoff}` : ''}</p></button>)}</div>
          </section>

          {designServices(product).length ? <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2"><Sparkles size={18}/><h2 className="font-black">Design services</h2></div>
            <div className="grid gap-2">{designServices(product).map((service) => <label key={service.id} className="flex items-center justify-between rounded-2xl border border-slate-200 p-3 text-sm"><span><input type="checkbox" className="mr-3" checked={selectedDesignServices.includes(service.id)} onChange={(event) => setSelectedDesignServices((prev) => event.target.checked ? [...prev, service.id] : prev.filter((id) => id !== service.id))}/>{service.label}</span><b>{money(service.priceMinor)}</b></label>)}</div>
          </section> : null}

          {error ? <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div> : null}
          {message ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{message}</div> : null}
          <button type="button" disabled={busy || config.blocked} onClick={handleAddToCart} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-50"><ShoppingCart size={18}/>{config.blocked ? 'Fix options before adding' : busy ? 'Adding...' : 'Add to cart'}</button>
          {ed.useTemplateDesign ? <button type="button" className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-4 text-sm font-black text-slate-950">Use template to design</button> : null}
        </aside>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-12 lg:px-8">
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          {c.longDescription ? <p className="mb-5 text-sm leading-7 text-slate-600">{c.longDescription}</p> : null}
          <div className="mb-5 flex flex-wrap gap-2">{tabs.map(([id, label]) => <TabButton key={id} active={activeTab === id} onClick={() => setActiveTab(id)}>{label}</TabButton>)}</div>
          {activeTab === 'specifications' ? <InfoTable items={c.specifications || []} /> : null}
          {activeTab === 'technical' ? <InfoTable items={c.technicalSpecifications || []} /> : null}
          {activeTab === 'design' ? <ul className="grid gap-2 text-sm text-slate-700">{(c.designGuidelines || []).map((item, index) => <li key={index} className="flex gap-2 rounded-2xl bg-slate-50 p-3"><CheckCircle2 size={16} className="text-emerald-500"/>{item}</li>)}</ul> : null}
          {activeTab === 'artwork' ? <div className="grid gap-4 md:grid-cols-2"><AssetList title="Artwork guides" items={art.guides || []}/><AssetList title="Artwork templates" items={art.templates || []}/></div> : null}
          {activeTab === 'faq' ? <div className="space-y-3">{(c.faqs || []).map((item, index) => <details key={index} className="rounded-2xl border border-slate-200 p-4"><summary className="cursor-pointer font-bold">{item.question}</summary><p className="mt-2 text-sm leading-6 text-slate-600">{item.answer}</p></details>)}</div> : null}
          {activeTab === 'ordering' ? <ol className="grid gap-2 text-sm text-slate-700">{(c.orderingProcess || []).map((item, index) => <li key={index} className="rounded-2xl bg-slate-50 p-3"><b>{index + 1}.</b> {item}</li>)}</ol> : null}
          {activeTab === 'sustainability' ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm leading-7 text-emerald-900"><Leaf size={18} className="mb-2"/>{c.sustainabilityPolicy || 'No sustainability policy has been added for this product yet.'}</div> : null}
        </div>

        {Array.isArray(product.relatedProducts) && product.relatedProducts.length ? <RelatedProducts ids={product.relatedProducts} /> : null}
      </section>
    </main>
  );
}

function AssetList({ title, items = [] }) {
  return <div className="rounded-2xl border border-slate-200 p-4"><div className="mb-3 flex items-center gap-2"><FileText size={17}/><h3 className="font-black">{title}</h3></div>{items.length ? <div className="space-y-2">{items.map((item, index) => <a key={index} href={item.url} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-sm font-semibold text-slate-700"><span>{item.label || item.url}</span><Download size={16}/></a>)}</div> : <p className="text-sm text-slate-500">No files added yet.</p>}</div>;
}

function RelatedProducts({ ids = [] }) {
  const [items, setItems] = useState([]);
  useEffect(() => {
    (async () => {
      const loaded = [];
      for (const id of ids.slice(0, 4)) {
        try {
          const data = await productApi.get(id);
          if (data.product || data) loaded.push(data.product || data);
        } catch {}
      }
      setItems(loaded);
    })();
  }, [ids.join(',')]);
  if (!items.length) return null;
  return <section className="mt-6 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-4 flex items-center gap-2"><Package size={18}/><h2 className="text-xl font-black">Suggested products</h2></div><div className="grid gap-4 md:grid-cols-4">{items.map((item) => <a key={item.id} href={`/${item.slug}`} className="rounded-2xl border border-slate-200 p-4 hover:border-sky-300"><p className="font-black">{item.name}</p><p className="mt-1 text-sm text-slate-500">From {money(item.priceFromMinor, item.currency || 'GBP')}</p></a>)}</div></section>;
}
