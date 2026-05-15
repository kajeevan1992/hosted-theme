import React from 'react';
import { Truck } from 'lucide-react';

export function DeliveryOptionsBlock({ data = {} }) {
  const options = Array.isArray(data.options) ? data.options : [];

  return (
    <section className="rounded-[32px] border border-[#E3E8F0] bg-white p-6 shadow-sm lg:p-8">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EAF9FD] text-[#18A7D0]">
          <Truck size={22} />
        </div>

        <div>
          <div className="text-[11px] font-black uppercase tracking-[0.18em] text-[#18A7D0]">Delivery</div>
          <h2 className="mt-1 text-2xl font-black tracking-[-0.04em] text-[#161A22]">{data.title || 'Estimated delivery date'}</h2>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {options.map((option, index) => (
          <button key={`${option.day}-${index}`} className={`flex w-full items-center justify-between rounded-2xl border px-5 py-4 text-left transition ${option.selected ? 'border-[#18A7D0] bg-[#EAF9FD]' : 'border-[#E3E8F0] bg-white hover:border-[#18A7D0]/40'}`}>
            <div>
              <div className="text-sm font-black text-[#161A22]">{option.day}</div>
              <div className="mt-1 text-sm text-[#667487]">{option.latest}</div>
            </div>

            <div className="text-right">
              {option.addon ? (
                <div className="text-sm font-black text-[#161A22]">{option.addon}</div>
              ) : (
                <div className="text-xs font-black uppercase tracking-[0.16em] text-[#18A7D0]">Included</div>
              )}
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

export default DeliveryOptionsBlock;
