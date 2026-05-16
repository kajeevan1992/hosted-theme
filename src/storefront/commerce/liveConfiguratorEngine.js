const INTERNAL_API_BASE =
  import.meta.env.VITE_INTERNAL_API_BASE ||
  window.__HOLO_INTERNAL_API_BASE__ ||
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

  if (['card', 'cards', 'tile', 'tiles', 'image-card-grid', 'text-card-grid', 'visual-card', 'visual-cards'].includes(raw)) return 'cards';
  if (['quantity', 'quantity-grid', 'price-grid', 'pricing-grid', 'matrix'].includes(raw)) return 'quantity-grid';
  if (['select', 'dropdown', 'combobox'].includes(raw)) return 'dropdown';
  if (['checkbox', 'checkboxes', 'tick', 'tickbox', 'multi'].includes(raw)) return 'checkbox';
  if (['swatch', 'swatches', 'colour', 'color', 'colour-swatch', 'color-swatch'].includes(raw)) return 'swatch';
  if (['button', 'buttons', 'pill', 'pills', 'radio', 'chips'].includes(raw)) return 'pill';

  return 'pill';
}

export function extractOptionGroups(product = {}) {
  const candidates = [
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
    slug: String(product?.slug || '').replace(/^\//, ''),
    quantity,
    selections,
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

export async function requestLivePrice({ product, selections, quantity, delivery }) {
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
  };

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
