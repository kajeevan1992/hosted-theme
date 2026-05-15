import React from 'react';
import BlockRenderer from './BlockRenderer';

export function PageRenderer({ page, context = {} }) {
  if (!page) {
    return (
      <div className="mx-auto max-w-[1280px] px-5 py-16">
        <div className="rounded-[24px] border border-dashed border-[#cfd9e6] bg-white p-10 text-center shadow-sm">
          <div className="text-[11px] font-black uppercase tracking-[0.18em] text-[#18A7D0]">Storefront Page Renderer</div>
          <h1 className="mt-4 text-3xl font-black text-[#161A22]">No page payload provided</h1>
        </div>
      </div>
    );
  }

  const blocks = Array.isArray(page.blocks) ? page.blocks : [];

  return (
    <div className="space-y-6 py-6">
      {blocks.map((block) => (
        <div
          key={block.id || `${block.type}-${Math.random()}`}
          id={block?.settings?.anchorId || undefined}
          className={block?.settings?.fullWidth ? '' : 'mx-auto max-w-[1280px] px-5'}
        >
          <BlockRenderer block={block} context={context} />
        </div>
      ))}
    </div>
  );
}

export default PageRenderer;
