import React from 'react';
import { BLOCK_TYPES } from '../types/blockTypes';
import HeroCarouselBlock from '../blocks/common/HeroCarouselBlock';
import TrustBarBlock from '../blocks/common/TrustBarBlock';
import ProductGridBlock from '../blocks/product/ProductGridBlock';
import ProductConfiguratorBlock from '../blocks/product/ProductConfiguratorBlock';
import QuantityPricingBlock from '../blocks/product/QuantityPricingBlock';
import DeliveryOptionsBlock from '../blocks/product/DeliveryOptionsBlock';

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
  [BLOCK_TYPES.HERO_BANNER]: HeroCarouselBlock,
  [BLOCK_TYPES.HERO_CAROUSEL]: HeroCarouselBlock,
  [BLOCK_TYPES.TRUST_BAR]: TrustBarBlock,
  [BLOCK_TYPES.USP_BAR]: TrustBarBlock,
  [BLOCK_TYPES.SUPPORT_CALLOUT]: ({ data }) => <Placeholder title={data?.title || 'Support Callout'} description={data?.description || 'Floating support / help CTA block.'} />,
  [BLOCK_TYPES.ANCHOR_NAV]: ({ data }) => <Placeholder title={data?.title || 'Anchor Navigation'} description={data?.description || 'Sticky section navigation tabs.'} />,
  [BLOCK_TYPES.PRODUCT_GRID]: ProductGridBlock,
  [BLOCK_TYPES.PRODUCT_CONFIGURATOR]: ProductConfiguratorBlock,
  [BLOCK_TYPES.PRODUCT_PRICE_SUMMARY]: QuantityPricingBlock,
  [BLOCK_TYPES.PRODUCT_DELIVERY]: DeliveryOptionsBlock,
  [BLOCK_TYPES.PROMO_CARD_GRID]: ({ data }) => <Placeholder title={data?.title || 'Promo Cards'} description={data?.description || 'Marketing promo cards and campaign tiles.'} />,
  [BLOCK_TYPES.RICH_TEXT]: ({ data }) => <Placeholder title={data?.title || 'Rich Text'} description={data?.content || 'SEO content, guides and marketing copy.'} />,
  [BLOCK_TYPES.FAQ]: ({ data }) => <Placeholder title={data?.title || 'FAQ'} description={data?.description || 'Frequently asked questions block.'} />,
  [BLOCK_TYPES.CATEGORY_HERO]: HeroCarouselBlock,
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
