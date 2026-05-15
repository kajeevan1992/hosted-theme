import React from 'react';

const fallbackColumns = [
  {
    title: 'Products',
    links: [
      { label: 'Business Cards', href: '/standard-business-cards' },
      { label: 'Flyers', href: '/flyers' },
      { label: 'Posters', href: '/posters-large-format-prints' },
    ],
  },
  {
    title: 'Help',
    links: [
      { label: 'Artwork Guide', href: '/artwork-guide' },
      { label: 'Delivery', href: '/delivery' },
      { label: 'Contact', href: '/contact' },
    ],
  },
];

export function StorefrontFooter({ data = {} }) {
  const columns = Array.isArray(data.columns) && data.columns.length ? data.columns : fallbackColumns;

  return (
    <footer className="mt-16 border-t border-[#E3E8F0] bg-white">
      <div className="mx-auto max-w-[1280px] px-5 py-14">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr_1fr_1fr]">
          <div>
            <div className="text-3xl font-black tracking-[-0.05em] text-[#161A22]">
              HOLO PRINT
            </div>

            <p className="mt-5 max-w-md text-sm leading-8 text-[#667487]">
              Professional print, signage and branding solutions with fast UK delivery and premium quality production.
            </p>
          </div>

          {columns.map((column, index) => (
            <div key={`${column.title}-${index}`}>
              <div className="text-sm font-black uppercase tracking-[0.14em] text-[#161A22]">
                {column.title}
              </div>

              <div className="mt-5 space-y-3">
                {(column.links || []).map((link, linkIndex) => (
                  <a
                    key={`${link.label}-${linkIndex}`}
                    href={link.href}
                    className="block text-sm font-bold text-[#667487] transition hover:text-[#18A7D0]"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-[#EEF2F7] pt-6 text-sm font-bold text-[#667487]">
          {data.copyright || '© HOLO PRINT. All rights reserved.'}
        </div>
      </div>
    </footer>
  );
}

export default StorefrontFooter;
