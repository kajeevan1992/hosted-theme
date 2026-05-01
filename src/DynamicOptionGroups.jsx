import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { evaluateProductRules } from './services_api';

function normaliseValues(option) {
  const values = option.values || option.options || option.choices || [];
  if (Array.isArray(values) && values.length) {
    return values.map((item) => typeof item === 'string' || typeof item === 'number' ? { value: item, label: String(item) } : item);
  }
  return [{ value: 'standard', label: 'Standard' }];
}

function initialSelections(options = []) {
  return options.reduce((acc, option) => {
    const values = normaliseValues(option);
    const defaultValue = option.defaultValue || values.find((item) => item.default)?.value || values[0]?.value || '';
    acc[option.id] = defaultValue;
    return acc;
  }, {});
}

function toneFor(severity) {
  if (severity === 'blocking') return 'border-red-200 bg-red-50 text-red-800';
  if (severity === 'warning') return 'border-amber-200 bg-amber-50 text-amber-800';
  if (severity === 'auto-applied') return 'border-blue-200 bg-blue-50 text-blue-800';
  return 'border-sky-200 bg-sky-50 text-sky-800';
}

function OptionCard({ option, item, selected, disabled, onSelect }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onSelect(item.value)}
      className={`relative rounded-2xl border p-4 text-left transition ${selected ? 'border-sky-400 bg-sky-50 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'} ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
    >
      {item.imageUrl ? <img src={item.imageUrl} alt="" className="mb-3 h-20 w-full rounded-xl object-contain bg-slate-50" /> : null}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-bold text-slate-950">{item.label || item.value}</p>
          {item.subtitle || item.sublabel ? <p className="mt-1 text-xs text-slate-500">{item.subtitle || item.sublabel}</p> : null}
          {item.helpText ? <p className="mt-2 text-xs leading-5 text-slate-500">{item.helpText}</p> : null}
        </div>
        {selected ? <CheckCircle2 size={18} className="text-sky-500" /> : null}
      </div>
      {item.badge || item.recommended ? <span className="mt-3 inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-800">{item.badge || 'Recommended'}</span> : null}
    </button>
  );
}

function RenderOption({ option, value, disabledValues, onChange }) {
  const values = normaliseValues(option);
  const display = option.display || option.displayType || option.type || 'text-card-grid';
  const isDisabled = (candidate) => disabledValues.some((entry) => entry.option === option.id && String(entry.value) === String(candidate));

  if (display === 'dropdown' || display === 'select') {
    return (
      <select value={value || ''} onChange={(event) => onChange(option.id, event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950">
        {values.map((item) => <option key={item.value} value={item.value} disabled={isDisabled(item.value)}>{item.label || item.value}</option>)}
      </select>
    );
  }

  if (display === 'checkbox') {
    return (
      <div className="grid gap-2">
        {values.map((item) => (
          <label key={item.value} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 text-sm text-slate-700">
            <input type="checkbox" checked={Array.isArray(value) ? value.includes(item.value) : false} disabled={isDisabled(item.value)} onChange={(event) => {
              const current = Array.isArray(value) ? value : [];
              onChange(option.id, event.target.checked ? [...current, item.value] : current.filter((next) => next !== item.value));
            }} />
            {item.label || item.value}
          </label>
        ))}
      </div>
    );
  }

  if (display === 'custom-size-input') {
    return (
      <div className="grid grid-cols-2 gap-3">
        <input type="number" placeholder="Width mm" value={value?.widthMm || ''} onChange={(event) => onChange(option.id, { ...(value || {}), widthMm: Number(event.target.value) })} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
        <input type="number" placeholder="Height mm" value={value?.heightMm || ''} onChange={(event) => onChange(option.id, { ...(value || {}), heightMm: Number(event.target.value) })} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
      </div>
    );
  }

  const cols = display === 'image-card-grid' || display === 'swatch-card-grid' ? 'md:grid-cols-2' : 'md:grid-cols-2';
  return (
    <div className={`grid gap-3 ${cols}`}>
      {values.map((item) => <OptionCard key={item.value} option={option} item={item} selected={String(value) === String(item.value)} disabled={isDisabled(item.value)} onSelect={(next) => onChange(option.id, next)} />)}
    </div>
  );
}

export default function DynamicOptionGroups({ product, onChange, onBlockedChange }) {
  const options = useMemo(() => product?.options || product?.metadataJson?.options || [], [product]);
  const [selections, setSelections] = useState(() => initialSelections(options));
  const [messages, setMessages] = useState([]);
  const [hiddenOptions, setHiddenOptions] = useState([]);
  const [disabledValues, setDisabledValues] = useState([]);
  const [priceAdjustments, setPriceAdjustments] = useState([]);
  const [blocked, setBlocked] = useState(false);
  const [evaluating, setEvaluating] = useState(false);

  useEffect(() => {
    const initial = initialSelections(options);
    setSelections(initial);
    setMessages([]);
    setHiddenOptions([]);
    setDisabledValues([]);
    setBlocked(false);
    onChange?.({ selections: initial, messages: [], blocked: false, priceAdjustments: [] });
  }, [product?.id]);

  async function evaluate(nextSelections) {
    if (!product?.id) return;
    setEvaluating(true);
    try {
      const customFields = Object.values(nextSelections || {}).reduce((acc, value) => {
        if (value && typeof value === 'object' && !Array.isArray(value)) return { ...acc, ...value };
        return acc;
      }, {});
      const result = await evaluateProductRules({ productId: product.id, selections: nextSelections, customFields });
      const resultSelections = { ...nextSelections, ...(result?.selections || {}) };
      setSelections(resultSelections);
      setMessages(result?.messages || []);
      setHiddenOptions(result?.hiddenOptions || []);
      setDisabledValues(result?.disabledValues || []);
      setPriceAdjustments(result?.priceAdjustments || []);
      setBlocked(Boolean(result?.blocked));
      onBlockedChange?.(Boolean(result?.blocked));
      onChange?.({ selections: resultSelections, messages: result?.messages || [], blocked: Boolean(result?.blocked), priceAdjustments: result?.priceAdjustments || [] });
    } catch (error) {
      setMessages([{ severity: 'warning', text: error?.message || 'Rules could not be evaluated.' }]);
    } finally {
      setEvaluating(false);
    }
  }

  function handleChange(optionId, value) {
    const next = { ...selections, [optionId]: value };
    setSelections(next);
    evaluate(next);
  }

  if (!options.length) return null;

  return (
    <div className="space-y-5">
      {messages.length ? <div className="space-y-2">
        {messages.map((message, index) => (
          <div key={`${message.ruleId || index}-${message.text}`} className={`flex gap-2 rounded-2xl border p-3 text-sm ${toneFor(message.severity)}`}>
            {message.severity === 'blocking' ? <AlertTriangle size={17} /> : <Info size={17} />}
            <span>{message.text}</span>
          </div>
        ))}
      </div> : null}

      {options.filter((option) => !hiddenOptions.includes(option.id)).map((option) => (
        <section key={option.id} className="rounded-3xl border border-slate-200 bg-white/80 p-4">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-black text-slate-950">{option.label || option.name || option.id}</h3>
              {option.helpText || option.tooltip ? <p className="mt-1 text-sm leading-5 text-slate-500">{option.helpText || option.tooltip}</p> : null}
            </div>
            {option.required ? <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-500">Required</span> : null}
          </div>
          <RenderOption option={option} value={selections[option.id]} disabledValues={disabledValues} onChange={handleChange} />
        </section>
      ))}

      {priceAdjustments.length ? <div className="rounded-2xl border border-sky-200 bg-sky-50 p-3 text-sm text-sky-900">
        <p className="font-bold">Price adjustments</p>
        <ul className="mt-1 list-disc pl-5">
          {priceAdjustments.map((item, index) => <li key={index}>{item.label || item.ruleId}: £{(Number(item.amountMinor || 0) / 100).toFixed(2)}</li>)}
        </ul>
      </div> : null}

      {evaluating ? <p className="text-xs font-semibold text-slate-500">Checking product rules…</p> : null}
    </div>
  );
}
