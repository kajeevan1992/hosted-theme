import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

const fallbackItems = [
  { label: 'Same Day Printing', href: '/same-day-printing' },
  { label: 'Business Cards', href: '/standard-business-cards' },
  { label: 'Flyers', href: '/flyers' },
  { label: 'Posters', href: '/posters-large-format-prints' },
  { label: 'Booklets', href: '/booklets' },
  { label: 'Signage', href: '/signage' },
  { label: 'All Products', href: '/all-products' },
];

export function NavigationEngine({ data = {}, currentPath = '/' }) {
  const items = Array.isArray(data.items) && data.items.length ? data.items : fallbackItems;

  return (
    <nav className="hidden items-center justify-center gap-1 xl:flex">
      {items.map((item, index) => {
        const active = currentPath === item.href || currentPath?.startsWith(`${item.href}/`);
        const hasChildren = Array.isArray(item.children) && item.children.length > 0;

        return (
          <div key={`${item.label}-${index}`} className="group relative">
            <a
              href={item.href || '#'}
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2.5 text-[13px] font-black tracking-[-0.01em] transition ${active ? 'bg-[#EAF9FD] text-[#18A7D0]' : 'text-[#161A22] hover:bg-[#F7F8FC] hover:text-[#18A7D0]'}`}
            >
              {item.label}
              {hasChildren ? <ChevronDown size={14} className="transition group-hover:rotate-180" /> : null}
            </a>

            {hasChildren ? (
              <div className="invisible absolute left-1/2 top-full z-50 mt-5 w-[520px] -translate-x-1/2 translate-y-2 rounded-[28px] border border-[#E7EDF3] bg-white p-5 opacity-0 shadow-[0_34px_90px_rgba(0,0,0,0.14)] transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                <div className="grid gap-4 md:grid-cols-[1fr_1.2fr]">
                  <div className="rounded-[22px] bg-gradient-to-br from-[#EAF9FD] to-[#F7F8FC] p-5">
                    <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#18A7D0]">
                      Featured
                    </div>
                    <div className="mt-3 text-2xl font-black tracking-[-0.05em] text-[#161A22]">
                      {item.featureTitle || item.label}
                    </div>
                    <p className="mt-3 text-sm leading-7 text-[#667487]">
                      {item.featureText || 'Explore popular print options, finishes and fast turnaround services.'}
                    </p>
                  </div>

                  <div className="grid gap-1">
                    {item.children.map((child, childIndex) => (
                      <a
                        key={`${child.label}-${childIndex}`}
                        href={child.href || '#'}
                        className="group/link flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-black text-[#161A22] transition hover:bg-[#F7F8FC] hover:text-[#18A7D0]"
                      >
                        <span>{child.label}</span>
                        <ChevronRight size={15} className="opacity-40 transition group-hover/link:translate-x-1 group-hover/link:opacity-100" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        );
      })}
    </nav>
  );
}

export default NavigationEngine;
