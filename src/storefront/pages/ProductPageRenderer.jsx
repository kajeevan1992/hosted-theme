import React from 'react';
import HoloDynamicProductTemplate from './HoloDynamicProductTemplate';

export function ProductPageRenderer({ product = {} }) {
  return <HoloDynamicProductTemplate product={product} />;
}

export default ProductPageRenderer;
