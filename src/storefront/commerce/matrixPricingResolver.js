export function getMatrixRows(product = {}) {
  return (
    product?.metadataJson?.pricingMatrix?.rows ||
    product?.pricingMatrix?.rows ||
    product?.matrix?.rows ||
    product?.matrixRows ||
    product?.pricingRows ||
    []
  );
}

function clean(value) {
  return String(value ?? '').trim().toLowerCase();
}

function rowValue(row, key) {
  const source = row?.options && typeof row.options === 'object' ? row.options : row;
  const keys = [key, key?.toLowerCase?.(), key?.toUpperCase?.(), String(key || '').replace(/[-_]/g, ' ')];
  return keys.map((item) => source?.[item]).find((value) => value !== undefined && value !== null && value !== '');
}

export function rowMatchesConfig(row = {}, selections = {}, quantity) {
  const source = row?.options && typeof row.options === 'object' ? row.options : row;
  const rowQuantity = row.quantity || row.qty || source.quantity || source.Quantity;

  if (rowQuantity && String(rowQuantity) !== String(quantity)) return false;

  return Object.entries(selections).every(([key, value]) => {
    if (value === undefined || value === null || value === '') return true;
    const fromRow = rowValue(row, key);
    if (fromRow === undefined || fromRow === null || fromRow === '') return true;
    return clean(fromRow) === clean(value);
  });
}

export function priceFromMatrixRow(row = {}) {
  const minor = row?.priceMinor ?? row?.supplierPriceMinor ?? row?.totalMinor;
  if (minor !== undefined && minor !== null) return Number(minor) / 100;

  const major = row?.price ?? row?.Price ?? row?.total ?? row?.Total;
  if (major !== undefined && major !== null && major !== '') return Number(String(major).replace(/[^0-9.]/g, ''));

  return null;
}

export function findMatrixPrice(product, selections = {}, quantity) {
  const row = getMatrixRows(product).find((item) => rowMatchesConfig(item, selections, quantity));
  const price = priceFromMatrixRow(row);
  return price === null || Number.isNaN(price) ? null : price;
}

export function buildQuantityMatrix(product, quantityValues = [], selections = {}) {
  return quantityValues.map((value, index) => {
    const qty = value?.qty || value?.quantity || value?.value || value?.label || value;
    return {
      qty,
      price: findMatrixPrice(product, selections, qty) ?? 0,
      recommended: Boolean(value?.recommended || value?.default || index === 0),
    };
  });
}
