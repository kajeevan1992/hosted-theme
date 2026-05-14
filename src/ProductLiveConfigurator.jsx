import React from 'react';
import { PrintStorefrontRenderer } from './renderers/PrintStorefrontRenderer';
import { normalizePathSlug, useLiveProductPricing } from './useLiveProductPricing';
import AppLive from './AppLive';

export default function ProductLiveConfigurator({ pathname }) {
  const liveProduct = useLiveProductPricing(pathname);
  const slug = normalizePathSlug(pathname);

  return (
    <div className="min-h-screen bg-[#F7F8FC]">
      <AppLive embeddedHeaderOnly currentPath={pathname} />
      <PrintStorefrontRenderer {...liveProduct} slug={slug} />
    </div>
  );
}
