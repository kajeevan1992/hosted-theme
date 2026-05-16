const INTERNAL_API_BASE =
  import.meta.env.VITE_INTERNAL_STOREFRONT_BASE_URL ||
  import.meta.env.VITE_INTERNAL_API_BASE ||
  window.__HOLO_INTERNAL_API_BASE__ ||
  window.__HOLO_STOREFRONT_API_BASE__ ||
  '';

const CART_KEY = 'holo-cart';

export function normaliseDisplayType(group = {}) {
  const raw = String(
    group.storefrontDisplayType ||
    group.displayType ||
    group.display ||
    group.style ||
    group.inputType ||
    group.type ||
    ''
  ).toLowerCase();

  if (['card', 'cards', 'tile', 'tiles', 'image-card-grid', 'text-card-grid', 'visual-card', 'visual-cards', 'image-cards'].includes(raw)) return 'cards';
  if (['quantity', 'quantity-grid', 'price-grid', 'pricing-grid', 'matrix'].includes(raw)) return 'quantity-grid';
  if (['select', 'dropdown', 'combobox'].includes(raw)) return 'dropdown';
  if (['checkbox', 'checkboxes', 'tick', 'tickbox', 'multi'].includes(raw)) return 'checkbox';
  if (['swatch', 'swatches', 'colour', 'color', 'colour-swatch', 'color-swatch'].includes(raw)) return 'swatch';
  if (['button', 'buttons', 'pill', 'pills', 'radio', 'chips'].includes(raw)) return 'pill';

  return 'pill';
}

export function extractOptionGroups(product = {}) {
  const resolved = product.__resolvedStorefrontPayload?.resolvedOptions || product.__resolvedStorefrontPayload?.optionGroups;
  const candidates = [
    resolved,
    product.resolvedOptions,
    product.optionGroups,
    product.options,
    product.configurator?.optionGroups,
    product.configurator?.options,
    product.configuration?.optionGroups,
    product.configuration?.options,
    product.csvConfig?.optionGroups,
    product.csvConfig?.options,
    product.csv?.optionGroups,
    product.csv?.options,
    product.matrix?.optionGroups,
    product.matrix?.options,
    product.pricingMatrix?.optionGroups,
    product.metadataJson?.optionGroups,
    product.metadataJson?.options,
    product.metadataJson?.configurator?.optionGroups,
    product.metadataJson?.configuration?.optionGroups,
    product.metadataJson?.csvConfig?.optionGroups,
    product.metadataJson?.matrix?.optionGroups,
  ];

  return candidates.find((item) => Array.isArray(item) && item.length) || [];
}

export function extractPricingRows(product = {}) {
  const candidates = [
    product.pricingRows,
    product.quantities,
    product.prices,
    product.priceRows,
    product.csvPricingRows,
    product.matrixRows,
    product.matrix?.rows,
    product.pricingMatrix?.rows,
    product.csv?.rows,
    product.csvConfig?.rows,
    product.metadataJson?.pricingRows,
    product.metadataJson?.quantities,
    product.metadataJson?.matrixRows,
    product.metadataJson?.matrix?.rows,
    product.metadataJson?.pricingMatrix?.rows,
  ];

  return candidates.find((item) => Array.isArray(item) && item.length) || [];
}

export function buildSelectedPayload({ product, selections, quantity, deliveryIndex = 0, delivery = [] }) {
  return {
    productId: product?.id,
    productSlug: String(product?.slug || '').replace(/^\//, ''),
    slug: String(product?.slug || '').replace(/^\//, ''),
    quantity,
    selections,
    options: selections,
    delivery: delivery[deliveryIndex] || null,
  };
}

function rowMatchesSelections(row = {}, selections = {}, quantity) {
  const rowQty = row.qty || row.quantity || row.Quantity || row.printRun || row.run;
  if (rowQty && String(rowQty) !== String(quantity)) return false;

  return Object.entries(selections).every(([key, value]) => {
    const possibleKeys = [key, key.toLowerCase(), key.toUpperCase(), key.replace(/[-_]/g, ' '), key.replace(/\s+/g, '')];
    const rowValue = possibleKeys.map((candidate) => row[candidate]).find((candidateValue) => candidateValue !== undefined && candidateValue !== null);
    if (rowValue === undefined || rowValue === null || rowValue === '') return true;
    return String(rowValue).trim().toLowerCase() === String(value).trim().toLowerCase();
  });
}

function priceFromRow(row = {}) {
  const value = row.price ?? row.Price ?? row.total ?? row.Total ?? row.amount ?? row.sellPrice ?? row.priceExVat ?? row.priceIncVat;
  if (value !== undefined && value !== null && value !== '') return Number(String(value).replace(/[^0-9.]/g, ''));
  const minor = row.priceMinor ?? row.totalMinor ?? row.amountMinor;
  if (minor !== undefined && minor !== null) return Number(minor) / 100;
  return null;
}

export function findLocalPrice({ product, quantities = [], quantity, selections = {} }) {
  const rows = extractPricingRows(product);
  const exactRow = rows.find((row) => typeof row === 'object' && rowMatchesSelections(row, selections, quantity));
  const exactPrice = priceFromRow(exactRow);
  if (exactPrice !== null && !Number.isNaN(exactPrice)) return exactPrice;

  const quantityRow = quantities.find((item) => String(item.qty) === String(quantity));
  if (quantityRow?.price !== undefined && quantityRow?.price !== null) return Number(quantityRow.price);

  const resolvedMinor = product.pricing?.selected?.totalMinor || product.__resolvedStorefrontPayload?.pricing?.selected?.totalMinor;
  if (resolvedMinor !== undefined && resolvedMinor !== null) return Number(resolvedMinor) / 100;

  if (typeof product?.price === 'string') {
    const parsed = Number(product.price.replace(/[^0-9.]/g, ''));
    if (!Number.isNaN(parsed)) return parsed;
  }

  if (product?.priceMinor) return Number(product.priceMinor) / 100;
  if (product?.priceFromMinor) return Number(product.priceFromMinor) / 100;
  return 0;
}

export function getLocalCartItems() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(CART_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getLocalCartSummary() {
  const items = getLocalCartItems();
  const count = items.reduce((sum, item) => sum + Number(item.quantity || item.qty || 1), 0);
  const subtotal = items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || item.qty || 1), 0);
  return { items, count, subtotal };
}

export function persistLocalCartItem(item) {
  const items = getLocalCartItems();
  const next = [...items, item];
  window.localStorage.setItem(CART_KEY, JSON.stringify(next));
  const summary = getLocalCartSummary();
  window.dispatchEvent(new CustomEvent('holo:cart-updated', { detail: summary }));
  window.dispatchEvent(new CustomEvent('storefront:cart-updated', { detail: summary }));
  return summary;
}

function priceValueFromResolvedData(data = {}) {
  const minor = data.pricing?.selected?.totalMinor ?? data.selected?.totalMinor ?? data.netMinor ?? data.priceMinor ?? data.grossMinor ?? data.totalMinor ?? data.resolvedConfig?.priceMinor;
  if (minor !== undefined && minor !== null && minor !== '') return Number(minor) / 100;
  const major = data.price ?? data.total ?? data.totalPrice ?? data.priceExVat;
  if (major !== undefined && major !== null && major !== '') return Number(major);
  return 0;
}

function normalizeResolverProductData(data = {}, selections = {}) {
  const pricing = data.pricing || {};
  const resolvedOptions = data.resolvedOptions || data.optionGroups || data.resolvedConfig?.groups || [];
  const deliveryRows = data.deliveryOptions || data.resolvedConfig?.deliveryRows || [];
  const messages = data.appliedRules?.messages || data.checkout?.messages || data.messages || data.resolvedConfig?.messages || [];
  return {
    ok: true,
    source: data.source || '/api/internal/storefront/*',
    price: priceValueFromResolvedData(data),
    resolvedConfig: {
      ...(data.resolvedConfig || {}),
      groups: resolvedOptions,
      messages,
      checkout: data.checkout,
      productMode: data.productMode,
      pricing,
    },
    quantityRows: data.quantityRows || data.resolvedConfig?.quantityRows || [],
    deliveryRows,
    selections: data.selectedOptions || data.selections || data.resolvedConfig?.selections || selections,
    messages,
    appliedActions: data.appliedRules?.actions || data.appliedActions || [],
    matchedRow: data.matchedRow || data.resolvedConfig?.matchedRow || null,
    checkout: data.checkout,
    pricing,
    raw: data,
  };
}

async function postJson(endpoint, payload) {
  const response = await fetch(`${INTERNAL_API_BASE}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  const json = await response.json().catch(() => ({}));
  const data = json?.data || json || {};

  if (!response.ok || json?.ok === false) {
    const error = new Error(json?.error || data?.error || `${endpoint} failed with ${response.status}`);
    error.payload = data;
    throw error;
  }

  return data;
}

export async function requestResolvedConfig({ product, selections = {}, quantity, delivery }) {
  const payload = buildSelectedPayload({ product, selections, quantity, deliveryIndex: 0, delivery: [delivery] });
  const productKey = String(product?.slug || product?.id || '').replace(/^\//, '');

  try {
    const cartPrice = await postJson('/api/internal/storefront/cart/price', {
      productId: product?.id || productKey,
      slug: productKey,
      quantity,
      selections,
      delivery,
    });
    return normalizeResolverProductData(cartPrice, selections);
  } catch (firstError) {
    try {
      const resolvedProduct = await postJson(`/api/internal/storefront/products/${encodeURIComponent(productKey)}/resolved`, {
        selections: { ...selections, quantity },
        delivery,
      });
      return normalizeResolverProductData(resolvedProduct, selections);
    } catch {}

    try {
      const legacy = await postJson('/api/internal/catalog/pricing-resolve', payload);
      return {
        ok: true,
        source: '/api/internal/catalog/pricing-resolve',
        price: priceValueFromResolvedData(legacy),
        resolvedConfig: legacy.resolvedConfig || null,
        quantityRows: legacy.quantityRows || legacy.resolvedConfig?.quantityRows || [],
        deliveryRows: legacy.deliveryRows || legacy.resolvedConfig?.deliveryRows || [],
        selections: legacy.selections || legacy.resolvedConfig?.selections || selections,
        messages: legacy.resolvedConfig?.messages || legacy.messages || [],
        appliedActions: legacy.resolvedConfig?.appliedActions || legacy.appliedActions || [],
        matchedRow: legacy.matchedRow || legacy.resolvedConfig?.matchedRow || null,
        raw: legacy,
      };
    } catch (legacyError) {
      throw firstError || legacyError;
    }
  }
}

export async function requestLivePrice({ product, selections, quantity, delivery }) {
  try {
    return await requestResolvedConfig({ product, selections, quantity, delivery });
  } catch {}

  const slug = String(product?.slug || product?.id || '').replace(/^\//, '');
  const payload = buildSelectedPayload({ product, selections, quantity, deliveryIndex: 0, delivery: [delivery] });
  const endpoints = [
    `/api/internal/catalog/products/${slug}/price`,
    `/api/internal/catalog/products/${slug}/estimate`,
    `/api/internal/catalog/pricing/estimate`,
    `/api/internal/catalog/storefront-products/${slug}/price`,
  ];

  let lastError = null;

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${INTERNAL_API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        lastError = new Error(`${endpoint} failed with ${response.status}`);
        continue;
      }

      const json = await response.json();
      const data = json?.data || json;
      const price = data.price ?? data.total ?? data.totalPrice ?? data.priceExVat ?? data.priceMinor;
      const priceValue = data.priceMinor || data.totalMinor ? Number(data.priceMinor || data.totalMinor) / 100 : Number(price);

      if (!Number.isNaN(priceValue)) {
        return {
          ok: true,
          price: priceValue,
          source: endpoint,
          rows: data.rows || data.quantities || null,
          warnings: data.warnings || data.messages || [],
          raw: data,
        };
      }
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error('No live pricing endpoint responded');
}

export async function requestAddToCart({ product, selections, quantity, delivery, price }) {
  const payload = {
    id: `${product?.slug || product?.id || 'product'}-${Date.now()}`,
    productId: product?.id,
    slug: String(product?.slug || '').replace(/^\//, ''),
    name: product?.name || product?.title,
    qty: Number(quantity || 1),
    quantity: Number(quantity || 1),
    selections,
    config: selections,
    delivery,
    price: Number(price || 0),
    checkout: product.checkout || product.__resolvedStorefrontPayload?.checkout || null,
    pricing: product.pricing || product.__resolvedStorefrontPayload?.pricing || null,
  };

  if (payload.checkout?.quoteRequired || payload.checkout?.blocked) {
    payload.quoteRequired = Boolean(payload.checkout?.quoteRequired);
    payload.checkoutBlocked = Boolean(payload.checkout?.blocked);
  }

  const endpoints = [
    '/api/internal/cart/items',
    '/api/internal/storefront/cart/items',
    '/api/internal/cart/add',
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${INTERNAL_API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) continue;

      const json = await response.json();
      persistLocalCartItem(payload);
      window.dispatchEvent(new CustomEvent('holo:cart-updated', { detail: json }));
      window.dispatchEvent(new CustomEvent('storefront:cart-updated', { detail: json }));
      return { ok: true, source: endpoint, data: json };
    } catch {}
  }

  const summary = persistLocalCartItem(payload);
  return { ok: true, source: 'localStorage', data: summary };
}