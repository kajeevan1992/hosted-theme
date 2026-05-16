import React from 'react';
import createProductPagePayload from '../data/productPagePayload';
import ProductPageComposerV2 from './ProductPageComposerV2';

export function ProductPageRenderer({ product = {} }) {
  const payload = createProductPagePayload(product);

  return (
    <ProductPageComposerV2
      page={payload}
      product={product}
      context={{
        pageType: 'product',
        product,
      }}
    />
  );
}

export default ProductPageRenderer;
