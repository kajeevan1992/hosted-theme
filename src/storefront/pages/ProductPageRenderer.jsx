import React from 'react';
import HoloApiProductTemplate from './HoloApiProductTemplate';

export function ProductPageRenderer({ product = {} }) {
  return <HoloApiProductTemplate product={product} />;
}

export default ProductPageRenderer;
