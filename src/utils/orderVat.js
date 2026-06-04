export function formatCurrency(value) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(Number(value || 0));
}

export function moneyFromMinor(value) {
  return Number(value || 0) / 100;
}

function firstFinite(...values) {
  for (const value of values) {
    if (value === null || value === undefined || value === "") continue;
    const numeric = Number(value);
    if (Number.isFinite(numeric)) return numeric;
  }
  return null;
}

function firstAmount(...values) {
  const direct = firstFinite(...values);
  return direct === null ? 0 : direct;
}

function rateLabel(rate) {
  return `${Number(rate || 0)}% VAT`;
}

function normaliseRate(value, fallback = 20) {
  const rate = firstFinite(value);
  return rate === null ? fallback : rate;
}

function normaliseBreakdownRows(rows = []) {
  if (!Array.isArray(rows)) return [];

  return rows
    .map((row) => {
      const rate = normaliseRate(row.rate ?? row.vatRate ?? row.taxRate, 20);
      const net = firstAmount(row.net, row.netTotal, row.netAmount, row.netMinor !== undefined ? moneyFromMinor(row.netMinor) : undefined, row.netTotalMinor !== undefined ? moneyFromMinor(row.netTotalMinor) : undefined);
      const vat = firstAmount(row.vat, row.tax, row.vatTotal, row.vatAmount, row.vatMinor !== undefined ? moneyFromMinor(row.vatMinor) : undefined, row.vatTotalMinor !== undefined ? moneyFromMinor(row.vatTotalMinor) : undefined, row.taxMinor !== undefined ? moneyFromMinor(row.taxMinor) : undefined);
      const gross = firstAmount(row.gross, row.total, row.grossTotal, row.grossMinor !== undefined ? moneyFromMinor(row.grossMinor) : undefined, row.grossTotalMinor !== undefined ? moneyFromMinor(row.grossTotalMinor) : undefined, row.totalMinor !== undefined ? moneyFromMinor(row.totalMinor) : undefined);

      return {
        rate,
        label: row.label || rateLabel(rate),
        net,
        vat,
        gross: gross || net + vat,
        reasons: Array.isArray(row.reasons) ? row.reasons : row.reason ? [row.reason] : [],
      };
    })
    .filter((row) => row.net || row.vat || row.gross);
}

function lineGross(item = {}) {
  const quantity = Number(item.quantity || item.qty || 1);
  const direct = firstFinite(item.gross, item.total, item.totalPrice, item.grossTotal, item.lineTotal);
  if (direct !== null) return direct;

  const minor = firstFinite(item.grossMinor, item.totalMinor, item.grossTotalMinor, item.lineTotalMinor);
  if (minor !== null) return moneyFromMinor(minor);

  return Number(item.price || item.unitPrice || 0) * quantity;
}

function addBucket(buckets, rate, gross, reason) {
  const safeRate = normaliseRate(rate, 20);
  const safeGross = Number(gross || 0);
  const net = safeRate ? safeGross / (1 + safeRate / 100) : safeGross;
  const vat = Math.max(0, safeGross - net);
  const current = buckets.get(safeRate) || { rate: safeRate, label: rateLabel(safeRate), net: 0, vat: 0, gross: 0, reasons: [] };
  current.net += net;
  current.vat += vat;
  current.gross += safeGross;
  if (reason && !current.reasons.includes(reason)) current.reasons.push(reason);
  buckets.set(safeRate, current);
}

function deriveBreakdownFromItems(order = {}) {
  const buckets = new Map();
  const items = Array.isArray(order.items) ? order.items : [];

  items.forEach((item) => {
    const rate = normaliseRate(item.vatRate ?? item.taxRate ?? item.vat_rate, 20);
    addBucket(buckets, rate, lineGross(item), item.vatReason || item.taxReason || item.vatClass || "Order item");
  });

  const deliveryGross = firstAmount(
    order.taxSummary?.delivery,
    order.tax_summary?.delivery,
    order.totals?.delivery,
    order.delivery,
    order.shipping,
    order.shippingMinor !== undefined ? moneyFromMinor(order.shippingMinor) : undefined,
    order.deliveryMinor !== undefined ? moneyFromMinor(order.deliveryMinor) : undefined
  );

  if (deliveryGross > 0) {
    const deliveryRate = normaliseRate(order.delivery?.vatRate ?? order.deliveryVatRate ?? order.shippingVatRate, 20);
    addBucket(buckets, deliveryRate, deliveryGross, "Delivery");
  }

  return [...buckets.values()].sort((a, b) => a.rate - b.rate);
}

export function buildOrderVatSummary(order = {}) {
  const tax = order.taxSummary || order.tax_summary || {};
  const totals = order.totals || {};
  const breakdown = normaliseBreakdownRows(
    tax.breakdown || tax.vatBreakdown || tax.vat_breakdown || totals.vatBreakdown || totals.vat_breakdown || order.vatBreakdown || order.vat_breakdown || []
  );
  const derivedBreakdown = breakdown.length ? breakdown : deriveBreakdownFromItems(order);

  const derivedNet = derivedBreakdown.reduce((sum, row) => sum + Number(row.net || 0), 0);
  const derivedVat = derivedBreakdown.reduce((sum, row) => sum + Number(row.vat || 0), 0);
  const derivedGross = derivedBreakdown.reduce((sum, row) => sum + Number(row.gross || 0), 0);

  const net = firstAmount(
    tax.net,
    tax.netTotal,
    tax.subtotal,
    totals.net,
    totals.netTotal,
    totals.subtotal,
    order.net,
    order.subtotal,
    order.subtotalMinor !== undefined ? moneyFromMinor(order.subtotalMinor) : undefined,
    order.netTotalMinor !== undefined ? moneyFromMinor(order.netTotalMinor) : undefined,
    derivedNet
  );
  const vat = firstAmount(
    tax.vat,
    tax.tax,
    tax.vatTotal,
    totals.vat,
    totals.tax,
    totals.vatTotal,
    order.vat,
    order.tax,
    order.taxMinor !== undefined ? moneyFromMinor(order.taxMinor) : undefined,
    order.vatTotalMinor !== undefined ? moneyFromMinor(order.vatTotalMinor) : undefined,
    derivedVat
  );
  const delivery = firstAmount(
    tax.delivery,
    totals.delivery,
    order.shipping,
    order.shippingMinor !== undefined ? moneyFromMinor(order.shippingMinor) : undefined,
    order.deliveryMinor !== undefined ? moneyFromMinor(order.deliveryMinor) : undefined
  );
  const gross = firstAmount(
    tax.gross,
    tax.total,
    tax.grossTotal,
    totals.gross,
    totals.total,
    totals.grossTotal,
    order.total,
    order.totalMinor !== undefined ? moneyFromMinor(order.totalMinor) : undefined,
    order.grossTotalMinor !== undefined ? moneyFromMinor(order.grossTotalMinor) : undefined,
    derivedGross,
    net + vat
  );

  return {
    net,
    vat,
    delivery,
    gross,
    breakdown: derivedBreakdown,
    hasBreakdown: derivedBreakdown.length > 0,
    isMixedVat: derivedBreakdown.length > 1,
  };
}
