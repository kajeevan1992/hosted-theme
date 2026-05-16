import React from 'react';
import HoloMatrixProductTemplate from './HoloMatrixProductTemplate';

export function ProductPageRenderer({ product = {} }) {
  return <HoloMatrixProductTemplate product={product} />;
}

export default ProductPageRenderer;
