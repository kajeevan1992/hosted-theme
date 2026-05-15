export function mapBackendProductToStorefrontPayload(product = {}) {
  const optionGroups = Array.isArray(product.optionGroups)
    ? product.optionGroups.map((group, index) => ({
        key: group.key || `group-${index}`,
        label: group.label || group.name || 'Option',
        style: group.style || 'grid',
        valueLabel: group.selectedValue || '',
        options: Array.isArray(group.options)
          ? group.options.map((option) => ({
              value: option.label || option.value || option.name,
              sublabel: option.description || '',
              recommended: Boolean(option.recommended),
            }))
          : [],
      }))
    : [];

  const pricingRows = Array.isArray(product.pricingRows)
    ? product.pricingRows
    : [];

  return {
    id: product.id,
    slug: product.slug,
    name: product.name || product.title,
    description: product.description,
    price: product.displayPrice || product.price,
    gallery: product.images || product.gallery,
    badges: product.badges,
    optionGroups,
    pricingRows,
    deliveryOptions: product.deliveryOptions,
    tabs: product.tabs,
    relatedProducts: product.relatedProducts,
  };
}

export default mapBackendProductToStorefrontPayload;
