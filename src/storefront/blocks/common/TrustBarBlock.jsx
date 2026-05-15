import React from 'react';
import { CheckCircle } from 'lucide-react';

const defaultItems = [
  { label: 'Best price guaranteed' },
  { label: 'All-inclusive prices' },
  { label: 'Artwork support included' },
  { label: 'Fast UK delivery' },
];

export function TrustBarBlock({ data = {} }) {
  const items = Array.isArray(data.items) && data.items.length ? data.items : defaultItems;

  return (
    <section className="rounded-[22px] border border-[#E3E8F0] bg-white px-5 py-4 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {data.title ? <h2 className="text-lg font-black text-[#161A22]">{data.title}</h2> : null}
        <div className="grid flex-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, index) => (
            <a key={`${item.label}-${index}`} href={item.href || '#'} className="flex items-center gap-2 text-sm font-bold text-[#161A22]">
              <CheckCircle size={16} className="shrink-0 text-[#18A7D0]" />
              <span dangerouslySetInnerHTML={{ __html: item.html || item.label }} />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TrustBarBlock;
