import React, { useEffect, useMemo, useState } from 'react';
import HoloMatrixProductTemplate from './HoloMatrixProductTemplate';

const API_BASE = import.meta.env.VITE_INTERNAL_API_BASE || '';

function unwrap(payload) {
  return payload?.data?.product || payload?.data || payload?.product || payload || {};
}

function getSlug(product = {}) {
  return String(product.slug || window.location.pathname.split('/').filter(Boolean).pop() || '').replace(/^\//, '');
}

function mergeProduct(base = {}, full = {}) {
  const source = unwrap(base);
  const hydrated = unwrap(full);
  return {
    ...source,
    ...hydrated,
    metadataJson: { ...(source.metadataJson || {}), ...(hydrated.metadataJson || {}) },
    optionGroups: hydrated.optionGroups || hydrated.metadataJson?.optionGroups || source.optionGroups || source.metadataJson?.optionGroups,
    pricingMatrix: hydrated.pricingMatrix || hydrated.metadataJson?.pricingMatrix || source.pricingMatrix || source.metadataJson?.pricingMatrix,
  };
}

export function ProductPageRenderer({ product = {} }) {
  const baseProduct = useMemo(() => unwrap(product), [product]);
  const [fullProduct, setFullProduct] = useState(null);
  const slug = useMemo(() => getSlug(baseProduct), [baseProduct]);

  useEffect(() => {
    if (!slug) return;
    let active = true;

    fetch(`${API_BASE}/api/internal/catalog/products/${slug}`)
      .then((response) => (response.ok ? response.json() : null))
      .then((json) => {
        if (active && json) setFullProduct(unwrap(json));
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [slug]);

  return <HoloMatrixProductTemplate product={mergeProduct(baseProduct, fullProduct || {})} />;
}

export default ProductPageRenderer;
