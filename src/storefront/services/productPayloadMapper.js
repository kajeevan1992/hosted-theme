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
  const value = option.value ?? option.label ?? option.name ?? option.id ?? '';

  return {
    ...option,
    id: option.id || option.key || String(value),
    key: option.key || option.id || String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    value: String(value),
    label: option.label || option.name || String(value),
    sublabel: option.sublabel || option.description || option.helpText || meta.tooltip || meta.helpText || '',
    recommended: Boolean(option.recommended || option.default || option.isDefault || meta.recommended || meta.featured),
    default: Boolean(option.default || option.isDefault),
    badge: meta.badge || option.badge || '',
    tooltip: meta.tooltip || meta.helpText || option.tooltip || '',
    sortOrder: Number(option.sortOrder ?? option.order ?? 0),
    visible: option.visible !== false && option.hidden !== true,
    disabled: Boolean(option.disabled || option.isDisabled),
  };
}

function normalizeOptionGroup(group = {}, index = 0) {
  const meta = group.storefrontMeta || group.meta || group.metadata || {};
  const values = asArray(group.values, group.options, group.choices, group.items);

  return {
    ...group,
    id: group.id || group.key || `group-${index}`,
    key: group.key || group.id || `group-${index}`,
    name: group.name || group.label || group.title || 'Option',
    label: group.label || group.name || group.title || 'Option',
    type: group.type || group.inputType || 'select',
    inputType: group.inputType || group.type || 'select',
    displayType: group.storefrontDisplayType || group.displayType || meta.displayType || group.style || 'buttons',
    storefrontDisplayType: group.storefrontDisplayType || group.displayType || meta.displayType || group.style || 'buttons',
    style: group.storefrontDisplayType || group.displayType || meta.displayType || group.style || 'buttons',
    valueLabel: group.selectedValue || group.defaultValue || values?.[0]?.label || values?.[0]?.value || '',
    helpText: meta.helpText || group.helpText || group.description || '',
    required: group.required !== false,
    visible: group.visible !== false && group.hidden !== true,
    sortOrder: Number(group.sortOrder ?? group.order ?? index),
    values: values.map(normalizeOption).filter((option) => option.value),
    options: values.map(normalizeOption).filter((option) => option.value),
  };
}

function normalizeDelivery(product = {}, optionGroups = []) {
  const explicit = asArray(product.deliveryOptions, product.turnaroundOptions);
  if (explicit.length) return explicit;

  const turnaround = optionGroups.find((group) => /turnaround|delivery/i.test(`${group.key} ${group.label}`));
  const options = asArray(turnaround?.options, turnaround?.values);

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
  const rawOptionGroups = asArray(product.optionGroups, metadata.optionGroups, product.options, metadata.options);
  const optionGroups = rawOptionGroups
    .map(normalizeOptionGroup)
    .filter((group) => group.options.length)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const currency = product.currency || metadata.currency || 'GBP';
  const priceMinor = product.priceFromMinor || product.basePriceMinor || product.lowestPriceMinor || metadata.priceFromMinor || 0;
  const pricingMatrix = product.pricingMatrix || metadata.pricingMatrix || null;

  return {
    ...product,
    id: product.id,
    slug: product.slug,
    name: product.name || product.title || metadata.name || 'Print Product',
    description: product.description || metadata.description,
    price: product.displayPrice || product.price || moneyFromMinor(priceMinor, currency),
    currency,
    gallery: normalizeGallery(product, metadata),
    images: normalizeGallery(product, metadata),
    badges: asArray(product.badges, metadata.badges),
    metadataJson: {
      ...metadata,
      optionGroups,
      pricingMatrix,
    },
    optionGroups,
    pricingMatrix,
    pricingRows: asArray(product.pricingRows, product.matrixRows, product.csvRows, pricingMatrix?.rows, metadata.pricingRows, metadata.pricingMatrix?.rows),
    deliveryOptions: normalizeDelivery(product, optionGroups),
    tabs: normalizeTabs(product, metadata),
    relatedProducts: asArray(product.relatedProducts, metadata.relatedProducts),
  };
}

export default mapBackendProductToStorefrontPayload;
