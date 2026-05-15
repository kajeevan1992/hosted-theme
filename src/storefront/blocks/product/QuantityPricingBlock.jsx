import React from 'react';

export function QuantityPricingBlock({ data = {} }) {
  const rows = Array.isArray(data.rows) ? data.rows : [];

  return (
    <section className="rounded-[32px] border border-[#E3E8F0] bg-white p-6 shadow-sm lg:p-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-[11px] font-black uppercase tracking-[0.18em] text-[#18A7D0]">Pricing matrix</div>
          <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-[#161A22]">{data.title || 'Choose your quantity'}</h2>
        </div>

        {data.note ? <div className="text-sm font-bold text-[#667487]">{data.note}</div> : null}
      </div>

      <div className="mt-8 overflow-hidden rounded-[24px] border border-[#E3E8F0]">
        <div className="grid grid-cols-2 bg-[#F7F8FC] px-6 py-4 text-xs font-black uppercase tracking-[0.16em] text-[#667487]">
          <div>Quantity</div>
          <div className="text-right">Price</div>
        </div>

        <div className="divide-y divide-[#EEF2F7] bg-white">
          {rows.map((row, index) => (
            <button key={`${row.qty}-${index}`} className={`grid w-full grid-cols-2 items-center px-6 py-5 text-left transition hover:bg-[#F8FCFE] ${row.recommended ? 'bg-[#EAF9FD]' : ''}`}>
              <div>
                <div className="text-base font-black text-[#161A22]">{row.qty}</div>
                {row.description ? <div className="mt-1 text-sm text-[#667487]">{row.description}</div> : null}
              </div>

              <div className="text-right">
                <div className="text-xl font-black text-[#161A22]">£{Number(row.price).toFixed(2)}</div>
                {row.recommended ? <div className="mt-1 text-xs font-black uppercase tracking-[0.16em] text-[#18A7D0]">Recommended</div> : null}
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

export default QuantityPricingBlock;
