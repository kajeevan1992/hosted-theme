import React from 'react';
import { BLOCK_TYPES } from '../types/blockTypes';

function Placeholder({ title, description }) {
  return (
    <section className="rounded-[24px] border border-dashed border-[#cfd9e6] bg-white p-8 shadow-sm">
      <div className="text-[11px] font-black uppercase tracking-[0.18em] text-[#18A7D0]">Storefront Block</div>
      <h2 className="mt-3 text-2xl font-black text-[#161A22]">{title}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-7 text-[#667487]">{description}</p>
    </section>
  );
}

const BLOCK_REGISTRY = {
  [BLOCK_TYPES.HERO_BANNER]: ({ data }) => <Placeholder title={data?.title || 'Hero Banner'} description={data?.description || 'Large hero marketing section powered by backend block data.'} />,
  [BLOCK_TYPES.HERO_CAROUSEL]: ({ data }) => <Placeholder title={data?.title || 'Hero Carousel'} description={data?.description || 'Carousel driven by backend slides and CTA data.'} />,
  [BLOCK_TYPES.TRUST_BAR]: ({ data }) => <Placeholder title={data?.title || 'Trust Bar'} description={data?.description || 'Trustpilot, review and confidence messaging block.'} />,
  [BLOCK_TYPES.USP_BAR]: ({ data }) => <Placeholder title={data?.title || 'USP Bar'} description={data?.description || 'Fast delivery, premium print and support highlights.'} />,
  [BLOCK_TYPES.SUPPORT_CALLOUT]: ({ data }) => <Placeholder title={data?.title || 'Support Callout'} description={data?.description || 'Floating support / help CTA block.'} />,
  [BLOCK_TYPES.ANCHOR_NAV]: ({ data }) => <Placeholder title={data?.title || 'Anchor Navigation'} description={data?.description || 'Sticky section navigation tabs.'} />,
  [BLOCK_TYPES.PRODUCT_GRID]: ({ data }) => <Placeholder title={data?.title || 'Product Grid'} description={data?.description || 'Category-driven or bestseller product listing block.'} />,
  [BLOCK_TYPES.PROMO_CARD_GRID]: ({ data }) => <Placeholder title={data?.title || 'Promo Cards'} description={data?.description || 'Marketing promo cards and campaign tiles.'} />,
  [BLOCK_TYPES.RICH_TEXT]: ({ data }) => <Placeholder title={data?.title || 'Rich Text'} description={data?.content || 'SEO content, guides and marketing copy.'} />,
  [BLOCK_TYPES.FAQ]: ({ data }) => <Placeholder title={data?.title || 'FAQ'} description={data?.description || 'Frequently asked questions block.'} />,
  [BLOCK_TYPES.CATEGORY_HERO]: ({ data }) => <Placeholder title={data?.title || 'Category Hero'} description={data?.description || 'Category page hero and subcategory summary.'} />,
};

export function BlockRenderer({ block, context = {} }) {
  if (!block || block?.settings?.enabled === false) return null;

  const Component = BLOCK_REGISTRY[block.type];

  if (!Component) {
    return (
      <Placeholder
        title={`Unknown block: ${block.type}`}
        description="No renderer registered for this block type yet."
      />
    );
  }

  return <Component block={block} data={block.data || {}} context={context} />;
}

export default BlockRenderer;
