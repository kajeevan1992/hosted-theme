import React, { useEffect, useMemo, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import {
  findLocalPrice,
  normaliseDisplayType,
  requestAddToCart,
  requestLivePrice,
} from '../commerce/liveConfiguratorEngine';
import {
  resolveProductConfiguration,
} from '../commerce/resolvedProductConfigEngine';
import {
  buildQuantityMatrix,
} from '../commerce/matrixPricingResolver';

const BRAND = {
  bg: '#F7F8FC',
  line: '#E3E8F0',
  ink: '#161A22',
  muted: '#667487',
  primary: '#18A7D0',
};

function Shell({ children }) {
  return <div className="mx-auto w-full max-w-[1220px] px-4 sm:px-6 lg:px-8">{children}</div>;
}

function currency(value) {
  if (typeof value === 'string' && value.trim().startsWith('£')) return value;
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(Number(value || 0));
}

function normaliseOptionValue(value, optionIndex) {
  if (typeof value === 'string' || typeof value === 'number') {
    return { value: String(value), label: String(value), recommended: optionIndex === 0 };
  }

  return {
    value: String(value.value || value.label || value.name || value.key || `value-${optionIndex}`),
    label: String(value.label || value.name || value.value || value.key || `Value ${optionIndex + 1}`),
    sublabel: value.sublabel || value.subtitle || value.helpText || value.description || '',
    image: value.image || value.thumbnail || value.assetUrl || '',
    colour: value.colour || value.color || value.hex || '',
    recommended: Boolean(value.recommended || value.default || optionIndex === 0),
    muted: Boolean(value.disabled),
  };
}

function normalizeOptions(product = {}) {
  const resolved = resolveProductConfiguration(product);

  if (resolved?.visibleGroups?.length) {
    return resolved.visibleGroups.map((group) => ({
      key: group.key,
      label: group.label,
      valueLabel: resolved.selections?.[group.key] || '',
      style: group.displayType || normaliseDisplayType(group),
      required: group.required !== false,
      options: (group.options || [])
        .filter((option) => option.visible !== false)
        .map(normaliseOptionValue),
    }));
  }

  return [];
}

function normalizeQuantities(product = {}, selections = {}) {
  const quantityGroup = normalizeOptions(product).find((group) =>
    ['quantity', 'qty', 'print-run', 'run'].includes(String(group.key || '').toLowerCase())
  );

  const quantityValues = quantityGroup?.options || [
    { value: 100, label: '100' },
    { value: 250, label: '250' },
    { value: 500, label: '500' },
    { value: 1000, label: '1,000' },
    { value: 2500, label: '2,500' },
    { value: 5000, label: '5,000' },
  ];

  return buildQuantityMatrix(product, quantityValues, selections);
}

function normalizeDelivery(product = {}) {
  const rows = product.deliveryOptions || product.delivery?.services || [];
  if (Array.isArray(rows) && rows.length) return rows.map((row, index) => ({ day: row.day || row.label || row.name || 'Delivery', latest: row.latest || row.description || 'Latest delivery shown at checkout', addon: row.addon || row.extra || null, selected: row.selected || index === 0 }));

  return [
    { day: 'Monday April 27', latest: 'Latest Tuesday April 28', selected: true },
    { day: 'Thursday April 23', latest: 'Latest Friday April 24', addon: '+ £1.00' },
    { day: 'Wednesday April 22', latest: 'Latest Thursday April 23', addon: '+ £2.00' },
  ];
}
