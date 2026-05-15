import React from 'react';

export function CategoryFiltersBlock({ data = {} }) {
  const filters = Array.isArray(data.filters) ? data.filters : [];

  return (
    <section className="rounded-[32px] border border-[#E3E8F0] bg-white p-6 shadow-sm lg:p-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-[11px] font-black uppercase tracking-[0.18em] text-[#18A7D0]">
            Category filters
          </div>
          <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-[#161A22]">
            {data.title || 'Filter products'}
          </h2>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-4">
        {filters.map((filter, index) => (
          <div key={`${filter.label}-${index}`}>
            <div className="text-sm font-black text-[#161A22]">{filter.label}</div>

            <div className="mt-3 flex flex-wrap gap-2">
              {(filter.options || []).map((option, optionIndex) => (
                <button
                  key={`${option.label}-${optionIndex}`}
                  className={`rounded-full border px-4 py-2 text-sm font-bold transition ${option.selected ? 'border-[#18A7D0] bg-[#EAF9FD] text-[#18A7D0]' : 'border-[#E3E8F0] bg-white text-[#161A22]'}`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default CategoryFiltersBlock;
