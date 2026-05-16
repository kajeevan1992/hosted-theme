import React from 'react';
import BlockRenderer from '../renderers/BlockRenderer';
import Breadcrumbs from '../layouts/Breadcrumbs';
import { BLOCK_TYPES } from '../types/blockTypes';

function findBlock(blocks, type) {
  return blocks.find((block) => block.type === type);
}

function ProductHero({ product = {} }) {
  return (
    <section className="relative overflow-hidden rounded-[36px] border border-[#E7EDF3] bg-gradient-to-br from-white via-[#F7F8FC] to-[#EAF9FD] p-7 shadow-[0_24px_80px_rgba(12,18,28,0.06)] lg:p-10">
      <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-[#18A7D0]/10 blur-3xl" />
      <div className="relative z-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
        <div>
          <div className="text-[11px] font-black uppercase tracking-[0.2em] text-[#18A7D0]">
            Ready for live pricing
          </div>
          <h1 className="mt-4 max-w-3xl text-5xl font-black leading-[0.92] tracking-[-0.07em] text-[#111827] lg:text-7xl">
            {product.name || 'Print Product'}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-[#667487]">
            {product.description || 'Configure format, stock, finishing, turnaround and quantity using live backend product data.'}
          </p>
        </div>

        <div className="rounded-[30px] border border-[#E7EDF3] bg-white/90 p-6 shadow-[0_22px_60px_rgba(12,18,28,0.08)] backdrop-blur">
          <div className="text-[11px] font-black uppercase tracking-[0.18em] text-[#18A7D0]">Starting price</div>
          <div className="mt-2 text-5xl font-black tracking-[-0.06em] text-[#111827]">{product.price || '£0.00'}</div>
          <p className="mt-2 text-sm font-bold text-[#667487]">Ex VAT visual placeholder pricing</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <a href="#configure" className="rounded-full bg-[#18A7D0] px-5 py-3 text-center text-sm font-black text-white shadow-[0_16px_36px_rgba(24,167,208,0.28)]">Configure now</a>
            <a href="#artwork" className="rounded-full border border-[#E7EDF3] bg-white px-5 py-3 text-center text-sm font-black text-[#111827]">Artwork help</a>
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustStrip() {
  const items = [
    ['10k+', 'orders printed'],
    ['24hr', 'fast turnaround'],
    ['350gsm+', 'premium stock options'],
    ['B2B', 'trade support'],
  ];

  return (
    <section className="grid gap-4 rounded-[26px] border border-[#E7EDF3] bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
      {items.map(([value, label]) => (
        <div key={label} className="rounded-[20px] bg-[#F7F8FC] px-6 py-5 text-center">
          <div className="text-2xl font-black tracking-[-0.05em] text-[#111827]">{value}</div>
          <div className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#667487]">{label}</div>
        </div>
      ))}
    </section>
  );
}

function BlockSlot({ block, context }) {
  if (!block) return null;
  return <BlockRenderer block={block} context={context} />;
}

export function ProductPageComposerV2({ page, product = {}, context = {} }) {
  const blocks = Array.isArray(page?.blocks) ? page.blocks : [];
  const breadcrumbs = Array.isArray(page?.breadcrumbs) ? page.breadcrumbs : [];

  const gallery = findBlock(blocks, BLOCK_TYPES.PRODUCT_GALLERY);
  const configurator = findBlock(blocks, BLOCK_TYPES.PRODUCT_CONFIGURATOR);
  const pricing = findBlock(blocks, BLOCK_TYPES.PRODUCT_PRICE_SUMMARY);
  const delivery = findBlock(blocks, BLOCK_TYPES.PRODUCT_DELIVERY);
  const tabs = findBlock(blocks, BLOCK_TYPES.PRODUCT_TABS);
  const related = findBlock(blocks, BLOCK_TYPES.RELATED_PRODUCTS);

  return (
    <div className="bg-[#F7F8FC]">
      <div className="mx-auto max-w-[1380px] px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        {breadcrumbs.length ? <Breadcrumbs items={breadcrumbs} /> : null}

        <div className="space-y-8">
          <ProductHero product={product} />
          <TrustStrip />

          <section id="configure" className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
            <div className="space-y-6 lg:sticky lg:top-[126px]">
              <BlockSlot block={gallery} context={context} />
              <BlockSlot block={tabs} context={context} />
            </div>

            <div className="space-y-6">
              <BlockSlot block={configurator} context={context} />
              <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
                <BlockSlot block={pricing} context={context} />
                <BlockSlot block={delivery} context={context} />
              </div>

              <section className="rounded-[32px] border border-[#E7EDF3] bg-white p-7 shadow-[0_24px_70px_rgba(12,18,28,0.06)]">
                <div className="text-[11px] font-black uppercase tracking-[0.18em] text-[#18A7D0]">Checkout support</div>
                <h2 className="mt-3 text-3xl font-black tracking-[-0.05em] text-[#111827]">Ready to order with artwork support.</h2>
                <p className="mt-3 text-sm leading-7 text-[#667487]">Add to cart when the selected combination is valid. Artwork checks, custom sizes and production advice can be handled by support.</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <button className="rounded-full bg-[#18A7D0] px-6 py-3 text-sm font-black text-white shadow-[0_16px_36px_rgba(24,167,208,0.28)]">Add to cart</button>
                  <button className="rounded-full border border-[#E7EDF3] bg-white px-6 py-3 text-sm font-black text-[#111827]">Browse design templates</button>
                  <button className="rounded-full border border-[#E7EDF3] bg-[#F7F8FC] px-6 py-3 text-sm font-black text-[#111827]">Request quote</button>
                </div>
              </section>
            </div>
          </section>

          <section id="artwork" className="grid gap-6 lg:grid-cols-3">
            {[
              ['Choose your product', 'Select size, stock, print side and finish.'],
              ['Upload artwork or request help', 'Artwork checks and support before print.'],
              ['Approve and receive delivery', 'Production and dispatch updates.'],
            ].map(([title, body], index) => (
              <div key={title} className="rounded-[28px] border border-[#E7EDF3] bg-white p-6 shadow-sm">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#EAF9FD] text-sm font-black text-[#18A7D0]">{index + 1}</div>
                <h3 className="mt-5 text-xl font-black tracking-[-0.04em] text-[#111827]">{title}</h3>
                <p className="mt-2 text-sm leading-7 text-[#667487]">{body}</p>
              </div>
            ))}
          </section>

          <BlockSlot block={related} context={context} />
        </div>
      </div>
    </div>
  );
}

export default ProductPageComposerV2;
