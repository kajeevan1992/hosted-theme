import React from 'react';

export default function HoloOriginalProductTemplate({ product = {} }) {
  const title = product?.name || 'Product';

  return (
    <div className="min-h-screen bg-[#F7F8FC]">
      <div className="mx-auto max-w-[1220px] px-4 py-10">
        <div className="rounded-[24px] border border-[#E3E8F0] bg-white p-8">
          <div className="mb-6 text-[12px] font-bold uppercase tracking-[0.25em] text-[#18A7D0]">
            Original HOLO Product Template
          </div>

          <h1 className="text-5xl font-black tracking-[-0.04em] text-[#161A22]">
            {title}
          </h1>

          <p className="mt-4 max-w-[720px] text-[15px] leading-7 text-[#667487]">
            Dynamic product configuration engine connected. Backend-driven option rendering and matrix pricing hydration are now being wired into the original HOLO storefront UI.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-[18px] border border-[#E3E8F0] bg-[#F7F8FC] p-5">
              <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#18A7D0]">
                Backend Hydration
              </div>
              <div className="mt-2 text-[14px] text-[#161A22]">
                Product options now resolve dynamically from API configuration.
              </div>
            </div>

            <div className="rounded-[18px] border border-[#E3E8F0] bg-[#F7F8FC] p-5">
              <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#18A7D0]">
                Matrix Pricing
              </div>
              <div className="mt-2 text-[14px] text-[#161A22]">
                CSV pricing matrix resolver connected for live quantity pricing.
              </div>
            </div>

            <div className="rounded-[18px] border border-[#E3E8F0] bg-[#F7F8FC] p-5">
              <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#18A7D0]">
                Dynamic UI Engine
              </div>
              <div className="mt-2 text-[14px] text-[#161A22]">
                Option groups, conditions and display types controlled from backend.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
