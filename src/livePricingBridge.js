import { getLivePrice, getProduct } from './services_api';

export function moneyFromMinor(value = 0, currency = 'GBP') {
  const amount = Number(value || 0) / 100;
  try {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency }).format(amount);
  } catch {
    return `£${amount.toFixed(2)}`;
  }
}

export function optionGroupsFromBackendProduct(product) {
  const direct = product?.optionGroups;
  const metadata = product?.metadataJson?.optionGroups;
  return Array.isArray(direct) ? direct : Array.isArray(metadata) ? metadata : [];
}

export function defaultSelectionsFromOptionGroups(optionGroups = []) {
  const selections = {};

  optionGroups.forEach((group) => {
    const key = group.id || group.key || group.label;
    const first = Array.isArray(group.values) ? group.values[0] : Array.isArray(group.options) ? group.options[0] : null;
    const value = typeof first === 'object' ? first.value || first.label : first;
    if (key && value !== undefined && value !== null) selections[key] = String(value);
  });

  return selections;
}

export async function loadBackendProductForPath(pathname) {
  const slug = String(pathname || '').replace(/^\//, '') || 'standard-business-cards';
  try {
    return await getProduct(slug);
  } catch (error) {
    console.warn('[livePricingBridge] backend product unavailable, using theme fallback', error);
    return null;
  }
}

export async function resolveLiveCsvPrice({ product, productSlug, selections }) {
  const slug = product?.slug || productSlug;
  if (!slug) return null;

  try {
    return await getLivePrice({
      productSlug: slug,
      options: selections || {},
    });
  } catch (error) {
    console.warn('[livePricingBridge] live price unavailable, using theme fallback', error);
    return null;
  }
}

export function mergeResolvedPriceIntoCartItem(item, price) {
  if (!price) return item;
  return {
    ...item,
    sku: price.sku || item.sku,
    quantity: price.quantity || item.quantity,
    unitPriceMinor: price.netMinor,
    totalPriceMinor: price.netMinor,
    vatRate: price.vatRate,
    vatMinor: price.vatMinor,
    grossMinor: price.grossMinor,
    currency: price.currency || item.currency || 'GBP',
    resolvedPricing: price,
  };
}
