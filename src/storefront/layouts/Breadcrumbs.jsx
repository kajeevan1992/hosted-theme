import React from 'react';
import { ChevronRight } from 'lucide-react';

export function Breadcrumbs({ items = [] }) {
  if (!items.length) return null;

  return (
    <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm font-bold text-[#667487]">
      {items.map((item, index) => (
        <React.Fragment key={`${item.label}-${index}`}>
          {index > 0 ? <ChevronRight size={15} /> : null}

          {item.href ? (
            <a href={item.href} className="transition hover:text-[#18A7D0]">
              {item.label}
            </a>
          ) : (
            <span className="text-[#161A22]">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

export default Breadcrumbs;
