import React, { useState } from 'react';

const fallbackImages = [
  '/images/business-card-front.svg',
  '/images/flyer-front.svg',
  '/images/poster-main.svg',
  '/images/hero-slide-2.svg',
];

export function ProductGalleryBlock({ data = {} }) {
  const images = Array.isArray(data.images) && data.images.length ? data.images : fallbackImages;
  const [selected, setSelected] = useState(images[0]);

  return (
    <section className="grid gap-5 lg:grid-cols-[120px_1fr]">
      <div className="order-2 flex gap-3 overflow-auto lg:order-1 lg:flex-col">
        {images.map((image, index) => (
          <button
            key={`${image}-${index}`}
            onClick={() => setSelected(image)}
            className={`overflow-hidden rounded-[20px] border bg-white transition ${selected === image ? 'border-[#18A7D0]' : 'border-[#E3E8F0]'}`}
          >
            <img src={image} alt={`Preview ${index + 1}`} className="h-24 w-24 object-cover" />
          </button>
        ))}
      </div>

      <div className="order-1 overflow-hidden rounded-[32px] border border-[#E3E8F0] bg-white p-6 shadow-sm lg:order-2">
        <div className="aspect-square overflow-hidden rounded-[24px] bg-[#F7F8FC]">
          <img src={selected} alt="Selected product preview" className="h-full w-full object-cover" />
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {(data.badges || ['Premium print', 'Fast turnaround', 'Artwork support']).map((badge, index) => (
            <span key={`${badge}-${index}`} className="rounded-full bg-[#EAF9FD] px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-[#18A7D0]">
              {badge}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ProductGalleryBlock;
