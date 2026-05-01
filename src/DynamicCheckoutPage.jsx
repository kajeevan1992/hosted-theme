import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, CreditCard, FileUp, Loader2, Package, ShieldCheck, ShoppingCart, Truck } from 'lucide-react';
import { artwork, cart as cartApi, checkout, payment } from './services_api';

function money(minor = 0, currency = 'GBP') {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency }).format(Number(minor || 0) / 100);
}

function fileToArtworkPayload(file) {
  return {
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type || 'application/octet-stream',
    pageCount: 0,
    trimWidthMm: 0,
    trimHeightMm: 0,
    bleedMm: 0,
  };
}

function itemName(item) {
  return item.productName || item.name || item.productSlug || 'Print product';
}

export default function DynamicCheckoutPage({ onOrderComplete }) {
  const [cart, setCart] = useState(null);
  const [customer, setCustomer] = useState({ name: '', email: '', phone: '', company: '' });
  const [delivery, setDelivery] = useState({ address1: '', address2: '', city: '', postcode: '', country: 'United Kingdom', notes: '' });
  const [uploads, setUploads] = useState({});
  const [selectedItemId, setSelectedItemId] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [orderResult, setOrderResult] = useState(null);

  async function loadCart() {
    setLoading(true);
    setError('');
    try {
      const data = await cartApi.get();
      setCart(data);
      const first = data?.items?.[0]?.id;
      if (first && !selectedItemId) setSelectedItemId(first);
    } catch (err) {
      setError(err?.message || 'Cart failed to load.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadCart(); }, []);

  const items = cart?.items || [];
  const totals = cart?.totals || {};
  const selectedItem = useMemo(() => items.find((item) => item.id === selectedItemId) || items[0], [items, selectedItemId]);
  const artworkRequiredItems = items.filter((item) => item.artwork?.required !== false && item.artworkRequired !== false);
  const uploadedCount = Object.keys(uploads).length;
  const artworkReady = artworkRequiredItems.every((item) => uploads[item.id]?.uploaded || item.artwork?.status === 'preflight-passed' || item.artwork?.preflightStatus === 'pass');
  const customerReady = customer.name && customer.email && customer.phone;
  const deliveryReady = delivery.address1 && delivery.city && delivery.postcode;
  const ready = Boolean(items.length && customerReady && deliveryReady && artworkReady);

  function patchCustomer(patch) { setCustomer((prev) => ({ ...prev, ...patch })); }
  function patchDelivery(patch) { setDelivery((prev) => ({ ...prev, ...patch })); }

  async function uploadFiles(item, files) {
    if (!item || !files?.length) return;
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const payload = {
        cartItemId: item.id,
        files: Array.from(files).map(fileToArtworkPayload),
        notes: `Uploaded from checkout for ${itemName(item)}`,
      };
      const result = await artwork.upload(payload);
      setUploads((prev) => ({ ...prev, [item.id]: { uploaded: true, files: Array.from(files).map((file) => file.name), result } }));
      setMessage('Artwork uploaded and sent for preflight.');
      await loadCart();
    } catch (err) {
      setError(err?.message || 'Artwork upload failed.');
    } finally {
      setBusy(false);
    }
  }

  async function placeOrder() {
    if (!ready) {
      setError('Please complete customer details, delivery address and required artwork before checkout.');
      return;
    }
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const result = await checkout.createOrder({ customer, delivery, source: 'HostedThemeCheckoutV335' });
      setOrderResult(result);
      setMessage('Order created. Payment is ready.');
      onOrderComplete?.(result);
    } catch (err) {
      setError(err?.message || 'Order creation failed.');
    } finally {
      setBusy(false);
    }
  }

  async function markPaymentCaptured() {
    const intentId = orderResult?.paymentIntent?.id || orderResult?.intent?.id;
    if (!intentId) return;
    setBusy(true);
    setError('');
    try {
      const result = await payment.update({ intentId, action: 'mark-captured' });
      setOrderResult((prev) => ({ ...prev, paymentUpdate: result }));
      setMessage('Payment captured and order released to workflow.');
    } catch (err) {
      setError(err?.message || 'Payment update failed.');
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <div className="mx-auto flex max-w-5xl items-center gap-2 p-10 text-slate-600"><Loader2 className="animate-spin"/>Loading checkout...</div>;

  return <main className="min-h-screen bg-[#F7F8FC] px-5 py-8 text-slate-950 lg:px-8">
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="inline-flex rounded-full bg-sky-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-sky-700">v335 checkout</p>
            <h1 className="mt-4 text-4xl font-black tracking-[-0.06em]">Checkout & artwork upload</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">Upload artwork, enter delivery details, review totals and create a payment-ready order.</p>
          </div>
          <div className="rounded-2xl bg-slate-950 p-4 text-white">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Order total</p>
            <p className="mt-1 text-3xl font-black">{money(totals.grossTotalMinor || totals.totalMinor || 0, totals.currency || 'GBP')}</p>
          </div>
        </div>
      </section>

      {error ? <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"><AlertTriangle size={18}/>{error}</div> : null}
      {message ? <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"><CheckCircle2 size={18}/>{message}</div> : null}

      {!items.length ? <section className="rounded-[28px] border border-dashed border-slate-300 bg-white p-10 text-center"><ShoppingCart className="mx-auto mb-3 text-slate-400"/><h2 className="text-2xl font-black">Your cart is empty</h2><p className="mt-2 text-sm text-slate-500">Add a product before checkout.</p></section> : <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
        <div className="space-y-6">
          <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2"><Package size={18}/><h2 className="text-xl font-black">1. Review products</h2></div>
            <div className="space-y-3">{items.map((item) => <button key={item.id} type="button" onClick={() => setSelectedItemId(item.id)} className={`w-full rounded-2xl border p-4 text-left ${selectedItemId === item.id ? 'border-sky-400 bg-sky-50' : 'border-slate-200 bg-white'}`}><div className="flex items-start justify-between gap-4"><div><p className="font-black">{itemName(item)}</p><p className="mt-1 text-xs text-slate-500">Qty: {item.quantity || 1} · {item.productSlug}</p></div><p className="font-black">{money(item.pricing?.grossTotalMinor || item.grossTotalMinor || item.pricePreviewMinor || 0, totals.currency || 'GBP')}</p></div></button>)}</div>
          </section>

          <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2"><FileUp size={18}/><h2 className="text-xl font-black">2. Artwork upload</h2></div>
            {selectedItem ? <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); uploadFiles(selectedItem, event.dataTransfer.files); }}>
              <FileUp className="mx-auto mb-3 text-slate-400" size={34}/>
              <h3 className="font-black">Upload artwork for {itemName(selectedItem)}</h3>
              <p className="mt-2 text-sm text-slate-500">Drag and drop PDF artwork here, or choose files.</p>
              <input type="file" multiple className="mt-4" onChange={(event) => uploadFiles(selectedItem, event.target.files)} />
              {uploads[selectedItem.id]?.uploaded ? <p className="mt-3 text-sm font-bold text-emerald-700">Uploaded: {uploads[selectedItem.id].files.join(', ')}</p> : null}
            </div> : null}
            {artworkRequiredItems.length ? <div className="mt-4 grid gap-2">{artworkRequiredItems.map((item) => <div key={item.id} className="flex items-center justify-between rounded-2xl border border-slate-200 p-3 text-sm"><span>{itemName(item)}</span>{uploads[item.id]?.uploaded || item.artwork?.status === 'preflight-passed' ? <span className="font-bold text-emerald-700">Ready</span> : <span className="font-bold text-amber-700">Artwork needed</span>}</div>)}</div> : <p className="mt-4 text-sm text-slate-500">No artwork required for these items.</p>}
          </section>

          <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2"><ShieldCheck size={18}/><h2 className="text-xl font-black">3. Customer details</h2></div>
            <div className="grid gap-4 md:grid-cols-2">
              <input value={customer.name} onChange={(e) => patchCustomer({ name: e.target.value })} placeholder="Full name" className="rounded-2xl border border-slate-200 px-4 py-3" />
              <input value={customer.company} onChange={(e) => patchCustomer({ company: e.target.value })} placeholder="Company (optional)" className="rounded-2xl border border-slate-200 px-4 py-3" />
              <input value={customer.email} onChange={(e) => patchCustomer({ email: e.target.value })} placeholder="Email" className="rounded-2xl border border-slate-200 px-4 py-3" />
              <input value={customer.phone} onChange={(e) => patchCustomer({ phone: e.target.value })} placeholder="Phone" className="rounded-2xl border border-slate-200 px-4 py-3" />
            </div>
          </section>

          <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2"><Truck size={18}/><h2 className="text-xl font-black">4. Delivery address</h2></div>
            <div className="grid gap-4 md:grid-cols-2">
              <input value={delivery.address1} onChange={(e) => patchDelivery({ address1: e.target.value })} placeholder="Address line 1" className="rounded-2xl border border-slate-200 px-4 py-3 md:col-span-2" />
              <input value={delivery.address2} onChange={(e) => patchDelivery({ address2: e.target.value })} placeholder="Address line 2" className="rounded-2xl border border-slate-200 px-4 py-3 md:col-span-2" />
              <input value={delivery.city} onChange={(e) => patchDelivery({ city: e.target.value })} placeholder="Town / city" className="rounded-2xl border border-slate-200 px-4 py-3" />
              <input value={delivery.postcode} onChange={(e) => patchDelivery({ postcode: e.target.value })} placeholder="Postcode" className="rounded-2xl border border-slate-200 px-4 py-3" />
              <textarea value={delivery.notes} onChange={(e) => patchDelivery({ notes: e.target.value })} placeholder="Delivery notes" className="min-h-[100px] rounded-2xl border border-slate-200 px-4 py-3 md:col-span-2" />
            </div>
          </section>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-6 lg:self-start">
          <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-black">Order summary</h2>
            <div className="mt-4 space-y-3">{items.map((item) => <div key={item.id} className="flex items-start justify-between gap-3 text-sm"><div><p className="font-bold">{itemName(item)}</p><p className="text-xs text-slate-500">Qty {item.quantity || 1}</p></div><p className="font-bold">{money(item.pricing?.grossTotalMinor || item.grossTotalMinor || item.pricePreviewMinor || 0, totals.currency || 'GBP')}</p></div>)}</div>
            <div className="mt-5 border-t border-slate-200 pt-4 text-sm">
              <div className="flex justify-between"><span>Net</span><b>{money(totals.netTotalMinor || 0, totals.currency || 'GBP')}</b></div>
              <div className="mt-2 flex justify-between"><span>VAT</span><b>{money(totals.vatTotalMinor || 0, totals.currency || 'GBP')}</b></div>
              <div className="mt-3 flex justify-between text-xl"><span className="font-black">Total</span><b>{money(totals.grossTotalMinor || totals.totalMinor || 0, totals.currency || 'GBP')}</b></div>
            </div>
          </section>

          <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-black">Readiness</h2>
            <div className="mt-4 space-y-2 text-sm">
              <Status ok={Boolean(items.length)} label="Cart has items" />
              <Status ok={artworkReady} label="Artwork uploaded" />
              <Status ok={Boolean(customerReady)} label="Customer details" />
              <Status ok={Boolean(deliveryReady)} label="Delivery address" />
            </div>
            <button disabled={!ready || busy} onClick={placeOrder} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-50"><CreditCard size={18}/>{busy ? 'Processing...' : 'Create order & payment'}</button>
          </section>

          {orderResult ? <section className="rounded-[28px] border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
            <h2 className="text-xl font-black text-emerald-950">Order created</h2>
            <p className="mt-2 text-sm text-emerald-900">Order: {orderResult.order?.orderNumber || orderResult.order?.id || 'Created'}</p>
            <p className="mt-1 text-sm text-emerald-900">Invoice: {orderResult.invoice?.invoiceNumber || orderResult.invoice?.id || 'Generated'}</p>
            {orderResult.paymentIntent?.paymentUrl ? <a href={orderResult.paymentIntent.paymentUrl} className="mt-4 inline-flex w-full items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-black text-emerald-950">Open payment page</a> : null}
            <button onClick={markPaymentCaptured} disabled={busy} className="mt-3 inline-flex w-full items-center justify-center rounded-2xl bg-emerald-900 px-5 py-3 text-sm font-black text-white disabled:opacity-50">Mark test payment captured</button>
          </section> : null}
        </aside>
      </div>}
    </div>
  </main>;
}

function Status({ ok, label }) {
  return <div className="flex items-center justify-between rounded-2xl border border-slate-200 p-3"><span>{label}</span>{ok ? <span className="font-bold text-emerald-700">OK</span> : <span className="font-bold text-amber-700">Needed</span>}</div>;
}
