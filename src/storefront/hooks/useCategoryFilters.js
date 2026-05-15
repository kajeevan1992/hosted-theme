import { useEffect, useMemo, useState } from 'react';

function readQuery() {
  const params = new URLSearchParams(window.location.search || '');
  const selected = {};

  params.forEach((value, key) => {
    if (!value) return;
    selected[key] = value.split(',').filter(Boolean);
  });

  return selected;
}

function writeQuery(selected = {}) {
  const params = new URLSearchParams(window.location.search || '');

  Object.keys(selected).forEach((key) => {
    const values = selected[key] || [];
    if (values.length) {
      params.set(key, values.join(','));
    } else {
      params.delete(key);
    }
  });

  const query = params.toString();
  const next = `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash || ''}`;
  window.history.pushState({}, '', next);
  window.dispatchEvent(new Event('locationchange'));
}

export function normalizeFilterKey(value = '') {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export function normalizeFilterValue(value = '') {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export function useCategoryFilters(filters = []) {
  const [selected, setSelected] = useState(() => readQuery());

  useEffect(() => {
    const sync = () => setSelected(readQuery());
    window.addEventListener('popstate', sync);
    window.addEventListener('locationchange', sync);
    return () => {
      window.removeEventListener('popstate', sync);
      window.removeEventListener('locationchange', sync);
    };
  }, []);

  const normalizedFilters = useMemo(() => {
    return filters.map((filter) => {
      const key = normalizeFilterKey(filter.key || filter.label);
      return {
        ...filter,
        key,
        options: (filter.options || []).map((option) => ({
          ...option,
          value: option.value || normalizeFilterValue(option.label),
          selected: (selected[key] || []).includes(option.value || normalizeFilterValue(option.label)),
        })),
      };
    });
  }, [filters, selected]);

  function toggleFilter(filterKey, optionValue) {
    const key = normalizeFilterKey(filterKey);
    const value = optionValue || '';
    const current = new Set(selected[key] || []);

    if (current.has(value)) {
      current.delete(value);
    } else {
      current.add(value);
    }

    const next = {
      ...selected,
      [key]: Array.from(current),
    };

    setSelected(next);
    writeQuery(next);
  }

  function clearFilters() {
    const next = {};
    filters.forEach((filter) => {
      next[normalizeFilterKey(filter.key || filter.label)] = [];
    });
    setSelected(next);
    writeQuery(next);
  }

  return {
    selected,
    filters: normalizedFilters,
    toggleFilter,
    clearFilters,
  };
}

export function productMatchesFilters(product = {}, selected = {}) {
  const attributes = product.attributes || product.filters || {};

  return Object.entries(selected).every(([key, values]) => {
    if (!values?.length) return true;

    const raw = attributes[key] || attributes[normalizeFilterKey(key)] || product[key];
    const productValues = Array.isArray(raw) ? raw : raw ? [raw] : [];
    const normalizedProductValues = productValues.map(normalizeFilterValue);

    return values.some((value) => normalizedProductValues.includes(normalizeFilterValue(value)));
  });
}

export default useCategoryFilters;
