import React, { useState } from 'react';

const fallbackTabs = [
  {
    label: 'Product Details',
    content: 'Premium quality print products with fast UK turnaround and flexible configuration options.',
  },
  {
    label: 'Artwork Guide',
    content: 'Upload CMYK artwork with 3mm bleed and outlined fonts for best results.',
  },
  {
    label: 'FAQ',
    content: 'Need help? Contact our team for artwork checks, custom quotes and turnaround support.',
  },
];

export function ProductTabsBlock({ data = {} }) {
  const tabs = Array.isArray(data.tabs) && data.tabs.length ? data.tabs : fallbackTabs;
  const [active, setActive] = useState(tabs[0]?.label || '');

  const current = tabs.find((tab) => tab.label === active) || tabs[0];

  return (
    <section className="rounded-[32px] border border-[#E3E8F0] bg-white p-6 shadow-sm lg:p-8">
      <div className="flex flex-wrap gap-3 border-b border-[#EEF2F7] pb-5">
        {tabs.map((tab) => (
          <button
            key={tab.label}
            onClick={() => setActive(tab.label)}
            className={`rounded-full px-5 py-3 text-sm font-black transition ${active === tab.label ? 'bg-[#161A22] text-white' : 'bg-[#F7F8FC] text-[#161A22]'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="prose prose-sm mt-6 max-w-none text-[#667487]">
        <p className="text-base leading-8">{current?.content}</p>
      </div>
    </section>
  );
}

export default ProductTabsBlock;
