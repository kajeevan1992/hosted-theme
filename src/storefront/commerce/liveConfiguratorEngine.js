const INTERNAL_API_BASE =
  import.meta.env.VITE_INTERNAL_API_BASE ||
  window.__HOLO_INTERNAL_API_BASE__ ||
  '';

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

export function buildSelectedPayload({ product, selections, quantity, deliveryIndex = 0, delivery = [] }) {
  return {
    productId: product?.id,
    slug: product?.slug,
    quantity,
    selections,
    delivery: delivery[deliveryIndex] || null,
  };
}

export function findLocalPrice({ product, quantities, quantity }) {
  const row = quantities.find((item) => String(item.qty) === String(quantity));
  if (row?.price !== undefined && row?.price !== null) return Number(row.price);

  if (typeof product?.price === 'string') {
    const parsed = Number(product.price.replace(/[^0-9.]/g, ''));
    if (!Number.isNaN(parsed)) return parsed;
  }

  if (product?.priceMinor) return Number(product.priceMinor) / 100;
  if (product?.priceFromMinor) return Number(product.priceFromMinor) / 100;
  return 0;
}

export async function requestLivePrice({ product, selections, quantity, delivery }) {
  const payload = buildSelectedPayload({ product, selections, quantity, deliveryIndex: 0, delivery: [delivery] });
  const endpoints = [
    `/api/internal/catalog/products/${product?.slug || product?.id}/price`,
    `/api/internal/catalog/pricing/estimate`,
    `/api/internal/catalog/products/${product?.id || product?.slug}/estimate`,
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
    productId: product?.id,
    slug: product?.slug,
    name: product?.name || product?.title,
    quantity,
    selections,
    delivery,
    price,
  };

  const endpoints = [
    '/api/internal/cart/items',
    '/api/internal/storefront/cart/items',
    '/api/internal/cart/add',
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
      window.dispatchEvent(new CustomEvent('holo:cart-updated', { detail: json }));
      return { ok: true, source: endpoint, data: json };
    } catch (error) {
      lastError = error;
    }
  }

  const localCart = JSON.parse(window.localStorage.getItem('holo-cart') || '[]');
  localCart.push({ ...payload, id: `${payload.slug || payload.productId}-${Date.now()}` });
  window.localStorage.setItem('holo-cart', JSON.stringify(localCart));
  window.dispatchEvent(new CustomEvent('holo:cart-updated', { detail: { items: localCart, fallback: true } }));

  return { ok: true, source: 'localStorage', data: { items: localCart }, warning: lastError?.message };
}
