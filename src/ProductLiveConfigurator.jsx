import React from 'react';
import { StorefrontChrome } from './components/StorefrontChrome';
import ProductPageRenderer from './storefront/pages/ProductPageRenderer';
import { useStorefrontProduct } from './storefront/hooks/useStorefrontProduct';

function AlignedStatusShell({ children }) {
  return <div className="mx-auto w-full max-w-[1360px] px-4 py-6 sm:px-6 lg:px-8">{children}</div>;
}

export default function ProductLiveConfigurator({ pathname }) {
  const { loading, error, product, slug } = useStorefrontProduct(pathname);

  return (
    <div className="min-h-screen bg-[#F7F8FC]">
      <StorefrontChrome currentPath={pathname}>
        {loading ? (
          <AlignedStatusShell>
            <div className="rounded-[32px] border border-[#E3E8F0] bg-white p-10 text-center shadow-sm">
              <div className="text-[11px] font-black uppercase tracking-[0.18em] text-[#18A7D0]">
                Loading product
              </div>
              <div className="mt-4 text-3xl font-black text-[#161A22]">
                Building storefront payload…
              </div>
            </div>
          </AlignedStatusShell>
        ) : error ? (
          <AlignedStatusShell>
            <div className="rounded-[32px] border border-[#FFD7D7] bg-white p-10 shadow-sm">
              <div className="text-[11px] font-black uppercase tracking-[0.18em] text-[#E33D3D]">
                Storefront product diagnostic
              </div>

              <div className="mt-4 text-3xl font-black text-[#161A22]">
                Product not found
              </div>

              <div className="mt-6 space-y-2 text-sm text-[#667487]">
                <div><strong>Slug:</strong> {slug}</div>
                <div><strong>Error:</strong> {error}</div>
                <div><strong>Expected:</strong> /api/internal/catalog/products/{slug}</div>
              </div>
            </div>
          </AlignedStatusShell>
        ) : (
          <ProductPageRenderer product={product} />
        )}
      </StorefrontChrome>
    </div>
  );
}
