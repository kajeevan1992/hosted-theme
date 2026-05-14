import { useEffect, useMemo, useState } from 'react';
import { addToCart, getProduct } from './services_api';
import {
  defaultSelectionsFromOptionGroups,
  mergeResolvedPriceIntoCartItem,
  optionGroupsFromBackendProduct,
  resolveLiveCsvPrice,
} from './livePricingBridge';

export function normalizePathSlug(pathname) {
  return String(pathname || '').replace(/^\//, '').replace(/\/$/, '') || 'standard-business-cards';
}

function unwrapProduct(payload) {
  if (!payload) return null;
  if (payload.product) return payload.product;
  if (payload.item) return payload.item;
  return payload;
}

function hasBackendMatrix(product) {
  const rows = product?.metadataJson?.pricingMatrix?.rows || product?.pricingMatrix?.rows;
  return Array.isArray(rows) && rows.length > 0;
}

export function useLiveProductPricing(pathname) {
  const productSlug = normalizePathSlug(pathname);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selections, setSelections] = useState({});
  const [price, setPrice] = useState(null);
  const [priceError, setPriceError] = useState('');

  useEffect(() => {
    let alive = true;
    setLoading(true);

    getProduct(productSlug)
      .then((loaded) => {
        if (!alive) return;

        const normalized = unwrapProduct(loaded);
        const optionGroups = optionGroupsFromBackendProduct(normalized);

        setProduct(normalized);
        setSelections(defaultSelectionsFromOptionGroups(optionGroups));
      })
      .catch(() => {
        if (!alive) return;
        setProduct(null);
      })
      .finally(() => {
        if (!alive) return;
        setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [productSlug]);

  const optionGroups = useMemo(() => optionGroupsFromBackendProduct(product), [product]);
  const live = Boolean(product && optionGroups.length && hasBackendMatrix(product));

  useEffect(() => {
    let alive = true;

    if (!live) return undefined;

    setPriceError('');

    resolveLiveCsvPrice({
      product,
      productSlug,
      selections,
    })
      .then((resolved) => {
        if (!alive) return;

        setPrice(resolved);

        if (!resolved) {
          setPriceError('Choose a valid option combination.');
        }
      })
      .catch((error) => {
        if (!alive) return;

        setPrice(null);
        setPriceError(error?.message || 'No exact CSV price match found.');
      });

    return () => {
      alive = false;
    };
  }, [live, product, productSlug, selections]);

  async function addResolvedItemToCart() {
    const name = product?.name || product?.title || 'Print product';

    const item = {
      productId: product?.id,
      productSlug: product?.slug || productSlug,
      productName: name,
      title: name,
      quantity: price?.quantity || selections.quantity || selections.Quantity || 1,
      options: selections,
      currency: price?.currency || 'GBP',
      unitPriceMinor: price?.netMinor || 0,
      totalPriceMinor: price?.netMinor || 0,
    };

    return addToCart(mergeResolvedPriceIntoCartItem(item, price));
  }

  return {
    productSlug,
    product,
    optionGroups,
    loading,
    live,
    selections,
    setSelections,
    price,
    priceError,
    addResolvedItemToCart,
  };
}
