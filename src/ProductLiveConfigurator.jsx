import React from 'react';
import { PrintStorefrontRenderer } from './renderers/PrintStorefrontRenderer';
import { normalizePathSlug, useLiveProductPricing } from './useLiveProductPricing';
import { StorefrontChrome } from './components/StorefrontChrome';

export default function ProductLiveConfigurator({ pathname }) {
  const liveProduct = useLiveProductPricing(pathname);
  const slug = normalizePathSlug(pathname);

  return (
    <div className="min-h-screen bg-[#F7F8FC]">
      <StorefrontChrome currentPath={pathname}>
        <PrintStorefrontRenderer {...liveProduct} slug={slug} />
      </StorefrontChrome>
    </div>
  );
}
