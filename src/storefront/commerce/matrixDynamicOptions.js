export function matrixRows(product = {}) {
  return product?.metadataJson?.pricingMatrix?.rows || product?.pricingMatrix?.rows || product?.matrix?.rows || product?.matrixRows || product?.pricingRows || [];
}

const norm = (value) => String(value ?? '').trim().toLowerCase();
const slug = (value) => String(value ?? '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');

function objectValue(value) {
  return value && typeof value === 'object' && !Array.isArray(value);
}

function pick(obj, keys) {
  for (const key of keys) {
    if (obj?.[key] !== undefined && obj?.[key] !== null && obj?.[key] !== '') return obj[key];
  }
  return undefined;
}

function pairKey(item) {
  return pick(item, ['groupKey', 'group', 'groupName', 'optionGroup', 'optionGroupName', 'optionKey', 'key', 'field', 'name', 'title']);
}

function pairValue(item, key) {
  const value = pick(item, ['selectedValue', 'optionValue', 'value', 'csvValue', 'matrixValue', 'selected', 'choice']);
  if (value !== undefined) return value;
  const label = pick(item, ['optionLabel', 'label']);
  if (label !== undefined && norm(label) !== norm(key)) return label;
  return undefined;
}

function flattenArrayPart(part, merged) {
  if (!Array.isArray(part)) return;
  part.forEach((item) => {
    if (Array.isArray(item) && item.length >= 2) {
      merged[item[0]] = item[1];
      return;
    }
    if (!objectValue(item)) return;
    const key = pairKey(item);
    const value = pairValue(item, key);
    if (key !== undefined && value !== undefined) merged[key] = value;
  });
}

function source(row = {}) {
  const merged = {};
  [
    row.options,
    row.optionValues,
    row.selectedOptions,
    row.csvOptions,
    row.pricingOptions,
    row.variantOptions,
    row.selections,
    row.config,
    row.configuration,
    row.attributes,
    row.dimensions,
    row.values,
  ].forEach((part) => {
    if (objectValue(part)) Object.assign(merged, part);
    if (Array.isArray(part)) flattenArrayPart(part, merged);
  });
  Object.keys(row || {}).forEach((key) => {
    if (!objectValue(row[key]) && !Array.isArray(row[key])) merged[key] = row[key];
  });
  return merged;
}

function niceLabel(key) {
  return String(key || '')
    .replace(/[-_]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function rowValue(row, key) {
  const data = source(row);
  const keys = [key, String(key).toLowerCase(), String(key).toUpperCase(), String(key).replace(/[-_]/g, ' '), String(key).replace(/\s+/g, '')];
  return keys.map((item) => data?.[item]).find((value) => value !== undefined && value !== null && value !== '');
}

function isQtyKey(key) {
  const k = norm(key).replace(/_/g, ' ');
  return k === 'quantity' || k === 'qty' || k === 'print run' || k === 'print-run' || k === 'run';
}

function ignoreKey(key) {
  const k = slug(key);
  return [
    'id', 'product-id', 'slug', 'sku', 'name', 'title', 'description',
    'price', 'price-minor', 'supplier-price', 'supplier-price-minor', 'cost', 'cost-minor',
    'total', 'total-minor', 'currency', 'vat', 'vat-rate',
    'recommended', 'default', 'selected', 'visible', 'hidden', 'disabled', 'enabled',
    'created-at', 'updated-at', 'metadata-json', 'raw', 'source'
  ].includes(k);
}

function ignoreValue(value) {
  if (value === undefined || value === null || value === '') return true;
  if (typeof value === 'boolean') return true;
  const v = norm(value);
  return ['true', 'false', 'yes', 'no', 'null', 'undefined'].includes(v);
}

function displayType(key) {
  const k = norm(key);
  if (k.includes('size') || k.includes('paper') || k.includes('stock') || k.includes('material')) return 'cards';
  if (k.includes('colour') || k.includes('color')) return 'swatch';
  if (isQtyKey(key)) return 'quantity-grid';
  return 'pill';
}

export function inferGroupsFromMatrix(product = {}) {
  const rows = matrixRows(product);
  const keys = [];
  rows.forEach((row) => {
    Object.keys(source(row) || {}).forEach((key) => {
      if (!ignoreKey(key) && !keys.includes(key)) keys.push(key);
    });
  });

  return keys.map((key, groupIndex) => {
    const values = [];
    rows.forEach((row) => {
      const value = rowValue(row, key);
      if (!ignoreValue(value) && !values.some((item) => norm(item) === norm(value))) values.push(value);
    });

    return {
      id: slug(key),
      key,
      label: niceLabel(key),
      displayType: displayType(key),
      inputType: isQtyKey(key) ? 'quantity' : 'select',
      required: true,
      visible: true,
      sortOrder: groupIndex + 100,
      pricingKey: key,
      options: values.map((value, index) => ({
        id: `${slug(key)}-${slug(value)}`,
        value: String(value),
        label: String(value),
        priceKey: String(value),
        recommended: index === 0,
        default: index === 0,
        visible: true,
        disabled: false,
      })),
    };
  }).filter((group) => group.options.length > 1 || isQtyKey(group.key));
}

export function matrixRowMatches(row = {}, selections = {}, quantity = null) {
  const data = source(row);
  const rowQty = row.quantity || row.qty || data.quantity || data.Quantity || data.Qty;
  if (quantity !== null && rowQty && String(rowQty) !== String(quantity)) return false;

  return Object.entries(selections).every(([key, value]) => {
    if (value === undefined || value === null || value === '' || isQtyKey(key)) return true;
    const rowVal = rowValue(row, key);
    if (rowVal === undefined || rowVal === null || rowVal === '') return true;
    return norm(rowVal) === norm(value);
  });
}

export function resolveGroupAvailability(product = {}, groups = [], selections = {}) {
  return groups.map((group) => {
    if (isQtyKey(group.key)) return group;
    const options = (group.options || []).map((option) => {
      const valid = matrixRows(product).some((row) => matrixRowMatches(row, { ...selections, [group.key]: option.value }, null));
      return { ...option, disabled: valid ? Boolean(option.disabled) : true };
    });
    return { ...group, options };
  });
}

export function matrixPrice(product = {}, selections = {}, quantity = null) {
  const row = matrixRows(product).find((item) => matrixRowMatches(item, selections, quantity));
  const minor = row?.priceMinor ?? row?.supplierPriceMinor ?? row?.totalMinor;
  if (minor !== undefined && minor !== null) return Number(minor) / 100;
  const major = row?.price ?? row?.Price ?? row?.total ?? row?.Total;
  if (major !== undefined && major !== null && major !== '') return Number(String(major).replace(/[^0-9.]/g, ''));
  return null;
}

export function matrixQuantityRows(product = {}, quantityValues = [], selections = {}) {
  const rows = quantityValues.map((item, index) => {
    const qty = item?.qty || item?.quantity || item?.value || item?.label || item;
    const price = matrixPrice(product, selections, qty);
    return { qty, price: price ?? 0, valid: price !== null, recommended: Boolean(item?.recommended || item?.default || index === 0) };
  });
  const validRows = rows.filter((row) => row.valid && Number(row.price) > 0);
  return validRows.length ? validRows : rows;
}
