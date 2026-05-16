import { extractOptionGroups, normaliseDisplayType } from './liveConfiguratorEngine';

function normaliseKey(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-');
}

function sameValue(a, b) {
  return String(a ?? '').trim().toLowerCase() === String(b ?? '').trim().toLowerCase();
}

function readRuleValue(rule, keys) {
  for (const key of keys) {
    if (rule?.[key] !== undefined && rule?.[key] !== null) return rule[key];
  }
  return undefined;
}

export function extractProductRules(product = {}) {
  const candidates = [
    product.rules,
    product.conditionalRules,
    product.conditions,
    product.configRules,
    product.configurator?.rules,
    product.configurator?.conditionalRules,
    product.configuration?.rules,
    product.configuration?.conditionalRules,
    product.csvConfig?.rules,
    product.matrix?.rules,
    product.metadataJson?.rules,
    product.metadataJson?.conditionalRules,
    product.metadataJson?.configurator?.rules,
    product.metadataJson?.configuration?.rules,
  ];

  return candidates.find((item) => Array.isArray(item) && item.length) || [];
}

export function normaliseOptionValue(value, optionIndex = 0) {
  if (typeof value === 'string' || typeof value === 'number') {
    return {
      id: normaliseKey(value),
      value: String(value),
      label: String(value),
      recommended: optionIndex === 0,
      visible: true,
      disabled: false,
      selected: optionIndex === 0,
    };
  }

  const label = value.label || value.name || value.value || value.key || `Value ${optionIndex + 1}`;
  const rawValue = value.value || value.key || value.slug || label;

  return {
    ...value,
    id: value.id || value.optionValueId || value.key || normaliseKey(rawValue),
    value: String(rawValue),
    label: String(label),
    sublabel: value.sublabel || value.subtitle || value.helpText || value.description || '',
    image: value.image || value.thumbnail || value.assetUrl || value.imageUrl || '',
    colour: value.colour || value.color || value.hex || '',
    recommended: Boolean(value.recommended || value.default || value.isDefault || optionIndex === 0),
    default: Boolean(value.default || value.isDefault || value.recommended || optionIndex === 0),
    visible: value.visible !== false && value.hidden !== true && value.isHidden !== true,
    disabled: Boolean(value.disabled || value.isDisabled),
    hiddenButSelected: Boolean(value.hiddenButSelected || value.hiddenSelected),
    priceKey: value.priceKey || value.matrixKey || value.csvKey || rawValue,
  };
}

export function normaliseConfigGroup(group = {}, index = 0) {
  const values = group.values || group.options || group.choices || group.items || [];
  const key = group.key || group.id || group.slug || group.name || `option-${index}`;

  return {
    ...group,
    id: group.id || key,
    key,
    normalisedKey: normaliseKey(key),
    label: group.label || group.name || group.title || key,
    displayType: normaliseDisplayType(group),
    inputType: group.inputType || group.type || 'select',
    required: group.required !== false,
    visible: group.visible !== false && group.hidden !== true && group.isHidden !== true,
    disabled: Boolean(group.disabled || group.isDisabled),
    hiddenButSelected: Boolean(group.hiddenButSelected || group.hiddenSelected),
    sortOrder: Number(group.sortOrder ?? group.order ?? index),
    pricingKey: group.pricingKey || group.matrixKey || group.csvKey || key,
    options: values.map(normaliseOptionValue),
  };
}

export function normaliseConfigGroups(product = {}) {
  return extractOptionGroups(product)
    .map(normaliseConfigGroup)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

function buildInitialSelections(groups = []) {
  const selections = {};

  groups.forEach((group) => {
    const selected =
      group.options.find((option) => option.selected || option.default || option.recommended) ||
      group.options.find((option) => !option.disabled) ||
      group.options[0];

    if (selected) {
      selections[group.key] = selected.value;
    }
  });

  return selections;
}

function ruleMatches(rule = {}, selections = {}) {
  const sourceKey = readRuleValue(rule, ['ifGroup', 'sourceGroup', 'whenGroup', 'optionKey', 'field', 'key']);
  const expectedValue = readRuleValue(rule, ['ifValue', 'sourceValue', 'whenValue', 'equals', 'value']);

  if (!sourceKey) return false;
  const selectedValue = selections[sourceKey] ?? selections[normaliseKey(sourceKey)];

  if (Array.isArray(expectedValue)) {
    return expectedValue.some((value) => sameValue(value, selectedValue));
  }

  return sameValue(expectedValue, selectedValue);
}

function applyRuleToGroups(groups, rule, selections) {
  if (!ruleMatches(rule, selections)) return groups;

  const action = String(readRuleValue(rule, ['action', 'then', 'effect']) || '').toLowerCase();
  const targetGroupKey = readRuleValue(rule, ['targetGroup', 'targetOption', 'targetKey', 'group', 'toGroup']);
  const targetValue = readRuleValue(rule, ['targetValue', 'toValue', 'selectValue', 'valueToSelect']);

  return groups.map((group) => {
    const groupMatch = targetGroupKey && (group.key === targetGroupKey || group.normalisedKey === normaliseKey(targetGroupKey));
    if (!groupMatch) return group;

    if (['hide', 'hidden'].includes(action)) {
      return { ...group, visible: false, hiddenButSelected: true };
    }

    if (['show', 'visible'].includes(action)) {
      return { ...group, visible: true };
    }

    if (['disable', 'disabled'].includes(action)) {
      return { ...group, disabled: true };
    }

    if (['enable', 'enabled'].includes(action)) {
      return { ...group, disabled: false };
    }

    if (['select', 'set', 'default'].includes(action)) {
      return {
        ...group,
        options: group.options.map((option) => ({
          ...option,
          selected: targetValue ? sameValue(option.value, targetValue) : option.selected,
        })),
      };
    }

    if (['disable-value', 'disable_option', 'disable-option'].includes(action)) {
      return {
        ...group,
        options: group.options.map((option) => ({
          ...option,
          disabled: targetValue && sameValue(option.value, targetValue) ? true : option.disabled,
        })),
      };
    }

    if (['hide-value', 'hide_option', 'hide-option'].includes(action)) {
      return {
        ...group,
        options: group.options.map((option) => ({
          ...option,
          visible: targetValue && sameValue(option.value, targetValue) ? false : option.visible,
          hiddenButSelected: targetValue && sameValue(option.value, targetValue) ? true : option.hiddenButSelected,
        })),
      };
    }

    return group;
  });
}

function repairSelections(groups, selections) {
  const next = { ...selections };

  groups.forEach((group) => {
    const current = group.options.find((option) => sameValue(option.value, next[group.key]));
    const currentStillValid = current && !current.disabled;

    if (!currentStillValid) {
      const fallback = group.options.find((option) => option.selected && !option.disabled) || group.options.find((option) => option.default && !option.disabled) || group.options.find((option) => !option.disabled) || group.options[0];
      if (fallback) next[group.key] = fallback.value;
    }
  });

  return next;
}

export function resolveProductConfiguration(product = {}, selections = null) {
  const baseGroups = normaliseConfigGroups(product);
  const baseSelections = selections || buildInitialSelections(baseGroups);
  const rules = extractProductRules(product);

  let resolvedGroups = baseGroups;
  rules.forEach((rule) => {
    resolvedGroups = applyRuleToGroups(resolvedGroups, rule, baseSelections);
  });

  const resolvedSelections = repairSelections(resolvedGroups, baseSelections);

  return {
    groups: resolvedGroups,
    visibleGroups: resolvedGroups.filter((group) => group.visible !== false),
    hiddenGroups: resolvedGroups.filter((group) => group.visible === false),
    selections: resolvedSelections,
    rules,
    pricingPayload: buildPricingSelections(resolvedGroups, resolvedSelections),
  };
}

export function buildPricingSelections(groups = [], selections = {}) {
  const payload = {};

  groups.forEach((group) => {
    const selectedValue = selections[group.key];
    const selectedOption = group.options.find((option) => sameValue(option.value, selectedValue));
    payload[group.key] = selectedValue;
    payload[group.pricingKey] = selectedOption?.priceKey || selectedValue;
  });

  return payload;
}

export default {
  normaliseConfigGroups,
  resolveProductConfiguration,
  buildPricingSelections,
};
