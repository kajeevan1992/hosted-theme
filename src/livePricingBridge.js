import { getLivePrice, getProduct } from './services_api';

function parseMetadata(product) {
  const raw = product?.metadataJson;

  if (!raw) return {};

  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }

  if (typeof raw === 'object') {
    return raw;
  }

  return {};
}

export function moneyFromMinor(value = 0, currency = 'GBP') {
  const amount = Number(value || 0) / 100;

  try {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency,
    }).format(amount);
  } catch {
    return `£${amount.toFixed(2)}`;
  }
}

export function optionGroupsFromBackendProduct(product) {
  const metadata = parseMetadata(product);

  const direct = product?.optionGroups;
  const metadataGroups = metadata?.optionGroups;

  return Array.isArray(direct)
    ? direct
    : Array.isArray(metadataGroups)
      ? metadataGroups
      : [];
}

export function pricingMatrixRows(product) {
  const metadata = parseMetadata(product);

  const matrix =
    product?.pricingMatrix ||
    metadata?.pricingMatrix ||
    null;

  return Array.isArray(matrix?.rows) ? matrix.rows : [];
}

export function defaultSelectionsFromOptionGroups(optionGroups = []) {
  const selections = {};

  optionGroups.forEach((group) => {
    const key = group.id || group.key || group.label;

    const first = Array.isArray(group.values)
      ? group.values[0]
      : Array.isArray(group.options)
        ? group.options[0]
        : null;

    const value = typeof first === 'object'
      ? first.value || first.label
      : first;

    if (key && value !== undefined && value !== null) {
      selections[key] = String(value);
    }
  });

  return selections;
}

export async function loadBackendProductForPath(pathname) {
  const slug = String(pathname || '').replace(/^\//, '') || 'standard-business-cards';

  try {
    return await getProduct(slug);
  } catch (error) {
    console.warn('[livePricingBridge] backend product unavailable', error);
    return null;
  }
}

export async function resolveLiveCsvPrice({ product, productSlug, selections }) {
  const slug = product?.slug || productSlug;

  if (!slug) return null;

  const rows = pricingMatrixRows(product);

  if (rows.length) {
    const exact = rows.find((row) => {
      const options = row?.options || {};

      return Object.entries(selections || {}).every(([key, value]) => {
        if (!(key in options)) return true;
        return String(options[key]) === String(value);
      });
    });

    if (exact) {
      return {
        ...exact,
        netMinor: exact.priceMinor || 0,
        grossMinor: exact.priceMinor || 0,
        vatMinor: 0,
        currency: exact.currency || 'GBP',
      };
    }
  }

  try {
    return await getLivePrice({
      productSlug: slug,
      options: selections || {},
    });
  } catch (error) {
    console.warn('[livePricingBridge] live price unavailable', error);
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
