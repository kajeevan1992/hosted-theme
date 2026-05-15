function parseJson(value, fallback = {}) {
  if (!value) return fallback;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function asArray(...values) {
  for (const value of values) {
    if (Array.isArray(value) && value.length) return value;
  }
  return [];
}

function moneyFromMinor(value, currency = 'GBP') {
  const amount = Number(value || 0) / 100;
  try {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency }).format(amount);
  } catch {
    return `£${amount.toFixed(2)}`;
  }
}

function normalizeOption(option = {}) {
  const meta = option.storefrontMeta || option.meta || option.metadata || {};
  return {
    value: option.label || option.value || option.name || option.id || '',
    sublabel: option.description || option.helpText || meta.tooltip || meta.helpText || '',
    recommended: Boolean(option.recommended || meta.recommended || meta.featured),
    badge: meta.badge || option.badge || '',
    tooltip: meta.tooltip || meta.helpText || option.tooltip || '',
  };
}

function normalizeOptionGroup(group = {}, index = 0) {
  const meta = group.storefrontMeta || group.meta || group.metadata || {};
  const values = asArray(group.options, group.values, group.items);

  return {
    key: group.key || group.id || `group-${index}`,
    label: group.label || group.name || group.title || 'Option',
    style: meta.displayType || group.displayType || group.style || 'grid',
    valueLabel: group.selectedValue || group.defaultValue || values?.[0]?.label || values?.[0]?.value || '',
    helpText: meta.helpText || group.helpText || group.description || '',
    options: values.map(normalizeOption).filter((option) => option.value),
  };
}

function normalizePricingRows(product = {}, metadata = {}) {
  const matrixRows = asArray(
    product.pricingRows,
    product.matrixRows,
    product.csvRows,
    product.pricingMatrix?.rows,
    metadata.pricingRows,
    metadata.pricingMatrix?.rows
  );

  return matrixRows.slice(0, 12).map((row, index) => {
    const quantity = row.qty || row.quantity || row.options?.Quantity || row.options?.quantity || row.label || `${index + 1}`;
    const priceMinor = row.priceMinor || row.grossMinor || row.netMinor || row.price_minor || row.price;
    const price = Number(priceMinor) > 100 ? Number(priceMinor) / 100 : Number(priceMinor || 0);

    return {
      qty: String(quantity),
      price: Number.isFinite(price) && price > 0 ? price : Number(product.priceFromMinor || product.basePriceMinor || 0) / 100,
      recommended: Boolean(row.recommended || row.bestSeller || index === 0),
      description: row.description || row.sku || '',
    };
  }).filter((row) => row.qty && row.price > 0);
}

function normalizeDelivery(product = {}, optionGroups = []) {
  const explicit = asArray(product.deliveryOptions, product.turnaroundOptions);
  if (explicit.length) return explicit;

  const turnaround = optionGroups.find((group) => /turnaround|delivery/i.test(`${group.key} ${group.label}`));
  const options = asArray(turnaround?.options);

  if (options.length) {
    return options.map((option, index) => {
      const value = option.value || option.label || String(option);
      return {
        day: value,
        latest: index === 0 ? 'Standard estimated delivery' : 'Express estimated delivery',
        selected: index === 0,
        addon: option.addon || option.priceDelta || '',
      };
    });
  }

  return [
    { day: '1 Working Day', latest: 'Fastest available production', addon: '+£12.00' },
    { day: '3-4 Working Days', latest: 'Standard production window', selected: true },
    { day: 'Express', latest: 'Priority production and dispatch', addon: '+£24.00' },
  ];
}

function normalizeTabs(product = {}, metadata = {}) {
  const tabs = asArray(product.tabs, metadata.tabs);
  if (tabs.length) return tabs;

  return [
    {
      label: 'Product Details',
      content: product.description || metadata.description || 'Professional print product with premium materials and flexible configuration options.',
    },
    {
      label: 'Artwork Guide',
      content: metadata.artworkGuide || 'Upload CMYK artwork with 3mm bleed, outlined fonts and high-resolution images.',
    },
    {
      label: 'FAQ',
      content: metadata.faqText || 'Need help? Contact our support team for artwork checks, custom quotes and turnaround support.',
    },
  ];
}

function normalizeGallery(product = {}, metadata = {}) {
  const gallery = asArray(product.images, product.gallery, metadata.images, metadata.gallery);
  return gallery.length ? gallery : ['/images/business-card-front.svg', '/images/flyer-front.svg', '/images/poster-main.svg'];
}

export function mapBackendProductToStorefrontPayload(product = {}) {
  const metadata = parseJson(product.metadataJson || product.metadata || product.meta, {});
  const rawOptionGroups = asArray(product.optionGroups, product.options, metadata.optionGroups, metadata.options);
  const optionGroups = rawOptionGroups.map(normalizeOptionGroup).filter((group) => group.options.length);
  const currency = product.currency || metadata.currency || 'GBP';
  const priceMinor = product.priceFromMinor || product.basePriceMinor || product.lowestPriceMinor || metadata.priceFromMinor || 0;
  const pricingRows = normalizePricingRows(product, metadata);

  return {
    id: product.id,
    slug: product.slug,
    name: product.name || product.title || metadata.name || 'Print Product',
    description: product.description || metadata.description,
    price: product.displayPrice || product.price || moneyFromMinor(priceMinor, currency),
    gallery: normalizeGallery(product, metadata),
    badges: asArray(product.badges, metadata.badges),
    optionGroups,
    pricingRows,
    deliveryOptions: normalizeDelivery(product, optionGroups),
    tabs: normalizeTabs(product, metadata),
    relatedProducts: asArray(product.relatedProducts, metadata.relatedProducts),
  };
}

export default mapBackendProductToStorefrontPayload;
