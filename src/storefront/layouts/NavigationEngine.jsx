import React from 'react';
import { ChevronDown } from 'lucide-react';

const fallbackItems = [
  {
    label: 'Business Cards',
    href: '/standard-business-cards',
  },
  {
    label: 'Flyers',
    href: '/flyers',
  },
  {
    label: 'Signage',
    href: '/signage',
  },
  {
    label: 'Packaging',
    href: '/packaging',
  },
];

export function NavigationEngine({ data = {} }) {
  const items = Array.isArray(data.items) && data.items.length ? data.items : fallbackItems;

  return (
    <nav className="hidden items-center gap-7 xl:flex">
      {items.map((item, index) => (
        <div key={`${item.label}-${index}`} className="group relative">
          <a href={item.href || '#'} className="flex items-center gap-2 text-sm font-black text-[#161A22] transition hover:text-[#18A7D0]">
            {item.label}
            {item.children?.length ? <ChevronDown size={15} /> : null}
          </a>

          {item.children?.length ? (
            <div className="invisible absolute left-0 top-full z-40 mt-4 min-w-[240px] rounded-[24px] border border-[#E3E8F0] bg-white p-5 opacity-0 shadow-[0_24px_54px_rgba(0,0,0,0.08)] transition-all group-hover:visible group-hover:opacity-100">
              <div className="space-y-3">
                {item.children.map((child, childIndex) => (
                  <a
                    key={`${child.label}-${childIndex}`}
                    href={child.href || '#'}
                    className="block text-sm font-bold text-[#667487] transition hover:text-[#18A7D0]"
                  >
                    {child.label}
                  </a>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ))}
    </nav>
  );
}

export default NavigationEngine;
