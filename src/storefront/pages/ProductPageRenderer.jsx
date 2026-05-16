import React from 'react';
import HoloOriginalProductTemplate from './HoloOriginalProductTemplate';

export function ProductPageRenderer({ product = {} }) {
  return <HoloOriginalProductTemplate product={product} />;
}

export default ProductPageRenderer;
