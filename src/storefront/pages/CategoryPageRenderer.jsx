import React from 'react';
import PageRenderer from '../renderers/PageRenderer';
import createCategoryPagePayload from '../data/categoryPagePayload';

export function CategoryPageRenderer({ category = {} }) {
  const payload = createCategoryPagePayload(category);

  return (
    <PageRenderer
      page={payload}
      context={{
        pageType: 'category',
        category,
      }}
    />
  );
}

export default CategoryPageRenderer;
