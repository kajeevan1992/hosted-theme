import React from 'react';
import PageRenderer from '../renderers/PageRenderer';
import createProductPagePayload from '../data/productPagePayload';

export function ProductPageRenderer({ product = {} }) {
  const payload = createProductPagePayload(product);

  return (
    <PageRenderer
      page={payload}
      context={{
        pageType: 'product',
        product,
      }}
    />
  );
}

export default ProductPageRenderer;
