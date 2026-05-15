import React from 'react';
import { Check } from 'lucide-react';

function OptionChip({ option, active }) {
  return (
    <button className={`rounded-2xl border px-4 py-3 text-left transition ${active ? 'border-[#18A7D0] bg-[#EAF9FD]' : 'border-[#E3E8F0] bg-white hover:border-[#18A7D0]/40'}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-black text-[#161A22]">{option.value}</div>
          {option.sublabel ? <div className="mt-1 text-xs text-[#667487]">{option.sublabel}</div> : null}
        </div>
        {active ? <Check size={16} className="text-[#18A7D0]" /> : null}
      </div>
    </button>
  );
}

export function ProductConfiguratorBlock({ data = {} }) {
  const groups = Array.isArray(data.optionGroups) ? data.optionGroups : [];

  return (
    <section className="rounded-[32px] border border-[#E3E8F0] bg-white p-6 shadow-sm lg:p-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-black uppercase tracking-[0.18em] text-[#18A7D0]">Configurator</div>
          <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-[#161A22]">{data.title || 'Configure your product'}</h2>
        </div>

        {data.price ? (
          <div className="rounded-2xl bg-[#161A22] px-5 py-4 text-white shadow-[0_16px_40px_rgba(0,0,0,0.18)]">
            <div className="text-xs uppercase tracking-[0.16em] text-white/60">Live price</div>
            <div className="mt-1 text-2xl font-black">{data.price}</div>
          </div>
        ) : null}
      </div>

      <div className="mt-8 space-y-8">
        {groups.map((group) => (
          <div key={group.key}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-base font-black text-[#161A22]">{group.label}</div>
                {group.valueLabel ? <div className="mt-1 text-sm text-[#667487]">Selected: {group.valueLabel}</div> : null}
              </div>
            </div>

            <div className={`mt-4 grid gap-3 ${group.style === 'pill' ? 'sm:grid-cols-2' : 'sm:grid-cols-2 xl:grid-cols-3'}`}>
              {(group.options || []).map((option, index) => (
                <OptionChip key={`${group.key}-${option.value}-${index}`} option={option} active={option.recommended} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default ProductConfiguratorBlock;
