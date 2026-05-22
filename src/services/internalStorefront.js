const DEFAULT_ADMIN_BASE_URL = import.meta.env.VITE_INTERNAL_STOREFRONT_BASE_URL || import.meta.env.VITE_ADMIN_BASE_URL || import.meta.env.VITE_INTERNAL_API_BASE || '';

function buildUrl(path, params = {}) {
  const base = DEFAULT_ADMIN_BASE_URL.replace(/\/$/, '');
  const url = new URL(`${base}${path}`, window.location.origin);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, String(value));
  });
  return url.toString();
}

async function request(path, { method = 'GET', body, params } = {}) {
  const response = await fetch(buildUrl(path, params), {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include',
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok || payload?.ok === false) {
    throw new Error(payload?.error || `Internal storefront request failed: ${path}`);
  }
  return payload;
}

export function resolveProductConfig(slug, selections = {}, extraParams = {}) {
  return request(`/api/internal/storefront/products/${encodeURIComponent(slug)}/resolved`, {
    method: 'POST',
    body: { selections, ...extraParams },
  });
}

export function resolveCartPrice(productId, selections = {}, quantity) {
  return request('/api/internal/storefront/cart/price', {
    method: 'POST',
    body: { productId, selections, quantity },
  });
}

export function resolveDeliveryOptions({ postcode, subtotalMinor } = {}) {
  return request('/api/internal/storefront/delivery/options', {
    method: 'POST',
    body: { postcode, subtotalMinor },
  });
}

export function resolveArtworkPreflight({ productId, slug, files = [], selections = {}, artworkMode = 'upload' } = {}) {
  return request('/api/internal/storefront/artwork/preflight', {
    method: 'POST',
    body: { productId, slug, files, selections, artworkMode },
  });
}

export function createQuoteRequest(payload) {
  return request('/api/internal/storefront/quote/request', {
    method: 'POST',
    body: payload,
  });
}

export function resolvedPriceToPounds(pricing) {
  const minor = pricing?.selected?.totalMinor ?? pricing?.totalMinor ?? null;
  return typeof minor === 'number' ? minor / 100 : null;
}

export function mapResolvedOptionsToThemeGroups(resolvedOptions = []) {
  return resolvedOptions.map((group) => ({
    key: group.pricingKey || group.key || group.id,
    label: group.name || group.key || 'Option',
    valueLabel: group.values?.find((value) => value.id === group.selectedValueId)?.label || group.values?.[0]?.label || '',
    style: ['radio', 'swatches', 'checkboxes'].includes(group.displayType) ? 'pill' : 'tile',
    required: !!group.required,
    selectedValueId: group.selectedValueId,
    options: (group.values || []).map((value) => ({
      id: value.id,
      value: value.label || value.id,
      sublabel: value.description || value.unit || '',
      recommended: value.id === group.selectedValueId || value.isDefault,
      muted: value.isHidden,
      raw: value,
    })),
    raw: group,
  }));
}

export function mapThemeSelectionsToResolver(selected = {}, quantity) {
  const next = { ...selected };
  if (quantity !== undefined) next.quantity = quantity;
  return next;
}
