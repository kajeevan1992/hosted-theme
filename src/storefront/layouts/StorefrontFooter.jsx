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
  {
    title: 'Company',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'Trade Printing', href: '/trade-printing' },
      { label: 'Careers', href: '/careers' },
    ],
  },
];

export function StorefrontFooter({ data = {} }) {
  const columns = Array.isArray(data.columns) && data.columns.length ? data.columns : fallbackColumns;

  return (
    <footer className="mt-20 overflow-hidden border-t border-[#E7EDF3] bg-white">
      <div className="mx-auto max-w-[1380px] px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 border-b border-[#EEF2F7] py-16 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="leading-none">
              <span className="text-[42px] font-black tracking-[-0.08em] text-[#18A7D0]">
                HOLO
              </span>
              <span className="text-[42px] font-black tracking-[-0.08em] text-[#161A22]">
                PRINT
              </span>
            </div>

            <p className="mt-6 max-w-md text-sm leading-8 text-[#667487]">
              Professional print, signage and branding solutions with same day printing in London and fast UK delivery.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <div className="rounded-full border border-[#E7EDF3] bg-[#F7F8FC] px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#161A22]">
                Same Day Printing
              </div>
              <div className="rounded-full border border-[#E7EDF3] bg-[#F7F8FC] px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#161A22]">
                UK Delivery
              </div>
              <div className="rounded-full border border-[#E7EDF3] bg-[#F7F8FC] px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#161A22]">
                Trade Prices
              </div>
            </div>
          </div>

          {columns.map((column, index) => (
            <div key={`${column.title}-${index}`}>
              <div className="text-[12px] font-black uppercase tracking-[0.18em] text-[#161A22]">
                {column.title}
              </div>

              <div className="mt-6 space-y-3">
                {(column.links || []).map((link, linkIndex) => (
                  <a
                    key={`${link.label}-${linkIndex}`}
                    href={link.href}
                    className="block text-sm font-bold text-[#667487] transition hover:translate-x-[2px] hover:text-[#18A7D0]"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-4 py-6 text-sm font-bold text-[#667487] md:flex-row md:items-center md:justify-between">
          <div>
            {data.copyright || '© HOLO PRINT. All rights reserved.'}
          </div>

          <div className="flex flex-wrap items-center gap-5">
            <a href="/privacy-policy" className="transition hover:text-[#18A7D0]">
              Privacy Policy
            </a>
            <a href="/terms" className="transition hover:text-[#18A7D0]">
              Terms & Conditions
            </a>
            <a href="/delivery" className="transition hover:text-[#18A7D0]">
              Delivery
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default StorefrontFooter;
