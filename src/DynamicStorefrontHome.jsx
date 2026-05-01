import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Loader2, Search, ShoppingCart, Sparkles } from 'lucide-react';
import { products as productApi, cart as cartApi } from './services_api';

function money(minor = 0, currency = 'GBP') {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency }).format(Number(minor || 0) / 100);
}

export default function DynamicStorefrontHome({ onOpenProduct, onOpenCheckout }) {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const [productData, cartData] = await Promise.all([
        productApi.list(),
        cartApi.get().catch(() => null),
      ]);
      setProducts(productData.items || productData || []);
      setCart(cartData);
    } catch (err) {
      setError(err?.message || 'Storefront products failed to load.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((product) => [product.name, product.slug, product.categoryName, product.productType].some((value) => String(value || '').toLowerCase().includes(q)));
  }, [products, query]);

  const categories = useMemo(() => Array.from(new Set(products.map((p) => p.categoryName || p.productType || 'Print Products'))), [products]);

  return <main className="min-h-screen bg-[#F7F8FC] text-slate-950">
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 lg:px-8">
        <button type="button" onClick={() => window.history.pushState({}, '', '/')} className="text-2xl font-black tracking-[-0.05em]">HOLO PRINT</button>
        <div className="hidden flex-1 items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 md:flex">
          <Search size={17} className="text-slate-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products" className="w-full bg-transparent text-sm outline-none" />
        </div>
        <button type="button" onClick={onOpenCheckout} className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-black text-white"><ShoppingCart size={17}/>{cart?.items?.length || 0}</button>
      </div>
    </header>

    <section className="mx-auto grid max-w-7xl gap-8 px-5 py-8 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
      <div className="rounded-[36px] border border-slate-200 bg-white p-8 shadow-sm">
        <p className="inline-flex rounded-full bg-sky-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-sky-700">Dynamic hosted theme</p>
        <h1 className="mt-5 text-5xl font-black tracking-[-0.07em] lg:text-6xl">Print products powered by your admin backend.</h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">Products, descriptions, options, delivery, artwork guides, rules and checkout now come from the SaaS core instead of static demo data.</p>
        <div className="mt-6 flex flex-wrap gap-3">{categories.slice(0, 6).map((category) => <span key={category} className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-600">{category}</span>)}</div>
      </div>
      <div className="rounded-[36px] border border-slate-200 bg-slate-950 p-8 text-white shadow-sm">
        <Sparkles size={28} className="text-sky-300" />
        <h2 className="mt-5 text-3xl font-black tracking-[-0.05em]">Real storefront flow</h2>
        <div className="mt-6 space-y-3 text-sm text-slate-300">
          <p>1. Choose published product</p>
          <p>2. Configure dynamic options</p>
          <p>3. Upload artwork</p>
          <p>4. Checkout and create order</p>
        </div>
      </div>
    </section>

    <section className="mx-auto max-w-7xl px-5 pb-12 lg:px-8">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div><h2 className="text-3xl font-black tracking-[-0.05em]">Products</h2><p className="mt-1 text-sm text-slate-500">Only ready/published products from admin are shown.</p></div>
        <button onClick={load} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-black">Refresh</button>
      </div>

      {loading ? <div className="flex min-h-[220px] items-center justify-center rounded-[28px] border border-slate-200 bg-white text-slate-500"><Loader2 className="mr-2 animate-spin"/>Loading products...</div> : null}
      {error ? <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div> : null}
      {!loading && !filtered.length ? <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-10 text-center"><h3 className="text-2xl font-black">No products showing yet</h3><p className="mt-2 text-sm text-slate-500">Create a product in admin, complete readiness, then Save & Publish.</p></div> : null}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((product) => {
          const media = product.media || product.metadataJson?.media || {};
          const content = product.content || product.metadataJson?.content || {};
          const image = media.heroImageUrl || media.gallery?.[0] || '/images/business-card-front.svg';
          return <button key={product.id} type="button" onClick={() => onOpenProduct(product.slug || product.id)} className="group overflow-hidden rounded-[28px] border border-slate-200 bg-white text-left shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
            <div className="h-56 bg-slate-50 p-5"><img src={image} alt="" className="h-full w-full object-contain" /></div>
            <div className="p-5">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-sky-700">{product.productType || product.categoryName || 'Print product'}</p>
              <h3 className="mt-2 text-2xl font-black tracking-[-0.04em]">{product.name}</h3>
              <p className="mt-2 min-h-[44px] text-sm leading-6 text-slate-500">{content.shortDescription || product.description || 'Configure and order this print product online.'}</p>
              <div className="mt-4 flex items-center justify-between"><span className="text-sm text-slate-500">From</span><span className="text-xl font-black">{money(product.priceFromMinor, product.currency || 'GBP')}</span></div>
              <div className="mt-4 inline-flex items-center gap-2 text-sm font-black text-sky-700">Configure <ArrowRight size={16} className="transition group-hover:translate-x-1"/></div>
            </div>
          </button>;
        })}
      </div>
    </section>
  </main>;
}
