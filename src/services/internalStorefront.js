const DEFAULT_ADMIN_BASE_URL = import.meta.env.VITE_INTERNAL_STOREFRONT_BASE_URL || import.meta.env.VITE_ADMIN_BASE_URL || import.meta.env.VITE_INTERNAL_API_BASE || import.meta.env.VITE_API_URL || '';

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

async function requestFirst(paths, options) {
  let lastError;
  for (const path of paths) {
    try {
      return await request(path, options);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error('Internal storefront request failed');
}

async function uploadMultipart(path, formData) {
  const response = await fetch(buildUrl(path), {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok || payload?.ok === false) {
    throw new Error(payload?.error || `Internal artwork upload failed: ${path}`);
  }
  return payload;
}

export function extractArtworkUploadId(value) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value.id || value.upload?.id || value.artworkUploadId || value.artwork?.id || value.data?.upload?.id || value.data?.id || '';
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
  return requestFirst(['/api/internal/storefront/artwork/preflight', '/api/internal/catalog/artwork-preflight'], {
    method: 'POST',
    body: { productId, slug, files, selections, artworkMode },
  });
}

export async function uploadArtworkFile(file, { productId, slug, orderId, quoteId, mode, preflight } = {}) {
  const formData = new FormData();
  formData.append('file', file);
  if (productId) formData.append('productId', productId);
  if (slug) formData.append('slug', slug);
  if (orderId) formData.append('orderId', orderId);
  if (quoteId) formData.append('quoteId', quoteId);
  if (mode) formData.append('mode', mode);
  if (preflight) formData.append('preflight', JSON.stringify(preflight));
  const payload = await uploadMultipart('/api/internal/storefront/artwork/upload', formData);
  const upload = payload.upload || payload.data?.upload || payload;
  return { ...payload, success: true, id: upload.id, url: upload.fileUrl, downloadUrl: upload.downloadUrl, upload };
}

export function updateArtworkUploadStatus(uploadId, { action = 'pending-review', note = '', orderId, quoteId, actor = 'hosted-theme' } = {}) {
  if (!uploadId) return Promise.resolve(null);
  return request(`/api/internal/storefront/artwork/uploads/${encodeURIComponent(uploadId)}/status`, {
    method: 'PATCH',
    body: { action, note, orderId, quoteId, actor },
  });
}

export function attachArtworkUploadToOrder(uploadReference, { orderId, quoteId, note } = {}) {
  const uploadId = extractArtworkUploadId(uploadReference);
  if (!uploadId || (!orderId && !quoteId)) return Promise.resolve(null);
  return updateArtworkUploadStatus(uploadId, {
    action: 'pending-review',
    orderId,
    quoteId,
    note: note || (orderId ? `Attached to order ${orderId}` : `Attached to quote ${quoteId}`),
    actor: 'checkout-submit',
  });
}

function responseOrderId(value) {
  if (!value) return '';
  return value.order?.id || value.data?.order?.id || value.data?.id || value.id || value.orderId || value.orderNumber || '';
}

function responseQuoteId(value) {
  if (!value) return '';
  return value.quoteRequest?.id || value.data?.quoteRequest?.id || value.data?.id || value.id || value.quoteId || '';
}

export async function createInternalOrder(payload) {
  const artworkUploadId = extractArtworkUploadId(payload?.artwork_reference || payload?.artwork || payload?.artworkUpload);
  const body = {
    ...payload,
    artworkUploadIds: [...new Set([...(payload?.artworkUploadIds || []), artworkUploadId].filter(Boolean))],
  };
  const response = await request('/api/internal/orders', {
    method: 'POST',
    body,
  });
  await attachOrderResponseArtwork(response, body).catch(() => null);
  return response;
}

export async function createQuoteRequest(payload) {
  try {
    const response = await request('/api/internal/storefront/quote/request', {
      method: 'POST',
      body: payload,
    });
    const quoteId = responseQuoteId(response);
    const uploadId = extractArtworkUploadId(payload?.artwork || payload?.artwork_reference || payload?.checkout?.artwork_reference);
    if (uploadId && quoteId) await attachArtworkUploadToOrder(uploadId, { quoteId, note: 'Attached to quote request during hosted checkout.' }).catch(() => null);
    return response;
  } catch (error) {
    const fallbackPayload = { ...(payload.checkout || payload), payment_method: 'Quote request', quoteRequired: true, artwork_reference: payload.artwork || payload.artwork_reference || payload.checkout?.artwork_reference };
    return createInternalOrder(fallbackPayload);
  }
}

export async function attachOrderResponseArtwork(response, payload) {
  const orderId = responseOrderId(response);
  const uploadId = extractArtworkUploadId(payload?.artwork_reference || payload?.artwork || payload?.artworkUpload);
  if (uploadId && orderId) {
    await attachArtworkUploadToOrder(uploadId, { orderId, note: 'Attached to final order during hosted checkout.' }).catch(() => null);
  }
  return response;
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
