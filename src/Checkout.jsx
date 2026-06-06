import React, { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Check, FileQuestion, FileText, Image as ImageIcon, MapPin, PackageCheck, ShieldCheck, Truck, Upload } from "lucide-react";
import { createOrder, uploadArtwork } from "./services_api";
import { createQuoteRequest, resolveArtworkPreflight, resolveCartPrice, resolveDeliveryOptions } from "./services/internalStorefront";

const STEPS = ["Customer", "Company", "Billing & delivery", "Collection / delivery", "Artwork", "Review", "Payment", "Confirm"];
const API_BASE = import.meta.env.VITE_INTERNAL_STOREFRONT_BASE_URL || import.meta.env.VITE_ADMIN_BASE_URL || import.meta.env.VITE_INTERNAL_API_BASE || import.meta.env.VITE_API_URL || "";

function currency(value) { return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(Number(value || 0)); }
function moneyFromMinor(value) { return Number(value || 0) / 100; }
function minorFromMoney(value) { return Math.round(Number(value || 0) * 100); }
function itemQty(item = {}) { return Number(item.quantity || item.qty || item.config?.quantity || item.selections?.quantity || 1); }
function itemProductKey(item = {}) { return item.productId || item.slug || item.productSlug || item.product_id || item.id?.split?.("-")?.[0] || item.name || "print-product"; }
function itemSelections(item = {}) { return item.selections || item.config || item.options || {}; }
function fileMeta(file) { if (!file) return null; return { name: file.name, type: file.type, size: file.size, sizeBytes: file.size }; }
function readLocalCartItems() { if (typeof window === "undefined") return []; try { const parsed = JSON.parse(window.localStorage.getItem("holo-cart") || "[]"); return Array.isArray(parsed) ? parsed : []; } catch { return []; } }
function hasQuoteFlag(item = {}) { return Boolean(item.quoteRequired || item.checkoutBlocked || item.checkout?.quoteRequired || item.checkout?.blocked || item.pricing?.quoteRequired || item.resolverSnapshot?.checkout?.quoteRequired || item.resolverSnapshot?.checkout?.blocked); }
function deliveryLabel(option = {}) { return option.publicLabel || option.label || option.name || option.day || option.value || "Delivery option"; }
function deliveryDescription(option = {}) { return option.checkoutDescription || option.description || option.latest || option.transitDays || "Calculated by delivery settings"; }
function deliveryPrice(option = {}) { if (typeof option.priceMinor === "number") return moneyFromMinor(option.priceMinor); if (typeof option.basePriceMinor === "number") return moneyFromMinor(option.basePriceMinor); if (typeof option.collectionFeeMinor === "number") return moneyFromMinor(option.collectionFeeMinor); if (typeof option.fee === "number") return option.fee; return 0; }
function optionId(option = {}) { return option.id || option.value || option.slug || deliveryLabel(option); }
function apiUrl(path, params = {}) { const base = API_BASE.replace(/\/$/, ""); const url = new URL(`${base}${path}`, window.location.origin); Object.entries(params).forEach(([key, value]) => { if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, String(value)); }); return url.toString(); }

function fallbackLocations() {
  return [
    { id: "loc-sidcup", slug: "sidcup", name: "Sidcup", type: "main-store", address: { line1: "Sidcup High Street", town: "Sidcup", country: "GB" }, cutoffTime: "15:00", collectionFeeMinor: 0, pickupInstructions: "Collect from Holo Print Sidcup. Bring your order confirmation or collection PIN.", description: "Main Holo Print store and production base.", googleBusinessEligible: true, collectionTruth: "Holo Print store and production base" },
    { id: "loc-wimbledon", slug: "wimbledon", name: "Wimbledon", type: "partner-collection-point", address: { town: "Wimbledon", country: "GB" }, cutoffTime: "13:00", collectionFeeMinor: 0, pickupInstructions: "Partner collection details will be confirmed when the order is ready. This is not a Holo Print branch.", description: "Partner collection point where available.", googleBusinessEligible: false, collectionTruth: "Partner collection point, not a Holo Print branch" },
    { id: "loc-kingston", slug: "kingston", name: "Kingston", type: "partner-collection-point", address: { town: "Kingston", country: "GB" }, cutoffTime: "13:00", collectionFeeMinor: 0, pickupInstructions: "Partner collection details will be confirmed when the order is ready. This is not a Holo Print branch.", description: "Partner collection point where available.", googleBusinessEligible: false, collectionTruth: "Partner collection point, not a Holo Print branch" },
  ];
}

async function fetchStorefrontLocations(productSlug) {
  const response = await fetch(apiUrl("/api/internal/storefront/locations", { productSlug }), { credentials: "include" });
  const payload = await response.json().catch(() => null);
  if (!response.ok || payload?.ok === false) throw new Error(payload?.error || "Location options unavailable.");
  const items = payload?.data?.items || [];
  return Array.isArray(items) ? items : [];
}

function lineVatProfile(item = {}) {
  const pricing = item.resolverSnapshot?.pricing || {};
  const selected = pricing.selected || {};
  const explicit = [item.vatRate, item.taxRate, pricing.vatRate, selected.vatRate, item.config?.vatRate, item.selections?.vatRate].find((value) => Number.isFinite(Number(value)));
  if (explicit !== undefined) { const rate = Number(explicit); return { rate, label: rate === 0 ? "0% VAT" : `${rate}% VAT`, reason: pricing.vatReason || selected.vatReason || item.vatReason || "VAT metadata" }; }
  const name = String(item.name || item.productName || itemProductKey(item) || "").toLowerCase();
  if (["design", "artwork service", "proof", "setup", "installation", "file fix"].some((term) => name.includes(term))) return { rate: 20, label: "20% VAT", reason: "Standard-rated service/add-on" };
  if (["leaflet", "flyer", "booklet", "brochure"].some((term) => name.includes(term))) return { rate: 0, label: "0% VAT", reason: "Zero-rated printed matter" };
  return { rate: 20, label: "20% VAT", reason: "Standard VAT" };
}

function buildTaxSummary(items = [], fulfilmentFee = 0, selectedFulfilment = {}) {
  const buckets = new Map();
  let itemGross = 0;
  let itemVat = 0;
  items.forEach((item) => {
    const gross = Number(item.price || 0) * itemQty(item);
    const profile = lineVatProfile(item);
    const net = profile.rate ? gross / (1 + profile.rate / 100) : gross;
    const vat = Math.max(0, gross - net);
    itemGross += gross;
    itemVat += vat;
    const current = buckets.get(profile.rate) || { rate: profile.rate, label: profile.label, net: 0, vat: 0, gross: 0, reasons: [] };
    current.net += net; current.vat += vat; current.gross += gross;
    if (!current.reasons.includes(profile.reason)) current.reasons.push(profile.reason);
    buckets.set(profile.rate, current);
  });
  const rate = Number.isFinite(Number(selectedFulfilment?.vatRate)) ? Number(selectedFulfilment.vatRate) : 20;
  const fee = Number(fulfilmentFee || 0);
  const fulfilmentNet = rate ? fee / (1 + rate / 100) : fee;
  const fulfilmentVat = Math.max(0, fee - fulfilmentNet);
  if (fee > 0) {
    const current = buckets.get(rate) || { rate, label: `${rate}% VAT`, net: 0, vat: 0, gross: 0, reasons: [] };
    current.net += fulfilmentNet; current.vat += fulfilmentVat; current.gross += fee;
    if (!current.reasons.includes("Collection / delivery")) current.reasons.push("Collection / delivery");
    buckets.set(rate, current);
  }
  return { net: itemGross - itemVat + fulfilmentNet, vat: itemVat + fulfilmentVat, fulfilment: fee, delivery: fee, gross: itemGross + fee, itemsGross: itemGross, breakdown: [...buckets.values()].sort((a, b) => a.rate - b.rate) };
}

function StepPill({ label, index, current }) {
  const done = current > index;
  const active = current === index;
  return <div className={`flex items-center gap-2 rounded-full border px-3 py-2 text-[12px] font-semibold ${active ? "shadow-[0_10px_24px_rgba(0,0,0,0.04)]" : ""}`} style={{ borderColor: active || done ? "rgb(24, 167, 208)" : "#E2E6E8", color: active || done ? "#121517" : "#667179", backgroundColor: active ? "#F1FAFD" : "white" }}><span className="grid h-5 w-5 place-items-center rounded-full text-[10px] font-bold" style={{ backgroundColor: done || active ? "rgb(24, 167, 208)" : "#EEF1F3", color: done || active ? "white" : "#667179" }}>{done ? "✓" : index}</span>{label}</div>;
}
function Field({ label, children, hint = "" }) { return <label className="grid gap-2"><div className="flex items-center justify-between gap-3"><span className="text-[12px] font-bold" style={{ color: "#121517" }}>{label}</span>{hint ? <span className="text-[11px]" style={{ color: "#667179" }}>{hint}</span> : null}</div>{children}</label>; }
function SectionCard({ title, eyebrow = "", children }) { return <div className="rounded-[18px] border bg-[#FBFCFD] p-4" style={{ borderColor: "#E2E6E8" }}>{eyebrow ? <div className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: "rgb(24, 167, 208)" }}>{eyebrow}</div> : null}<div className="mt-1 text-[15px] font-bold" style={{ color: "#121517" }}>{title}</div><div className="mt-3">{children}</div></div>; }
function ResolverNotice({ type = "info", children }) { const isWarn = type === "warn"; const isOk = type === "ok"; const isBad = type === "bad"; return <div className="rounded-[14px] border px-4 py-3 text-[12px] leading-6" style={{ borderColor: isBad ? "#FCA5A5" : isWarn ? "#FACC15" : isOk ? "#86EFAC" : "#BAE6FD", backgroundColor: isBad ? "#FEF2F2" : isWarn ? "#FEFCE8" : isOk ? "#F0FDF4" : "#F0F9FF", color: isBad ? "#991B1B" : isWarn ? "#854D0E" : isOk ? "#166534" : "#075985" }}>{children}</div>; }

function buildCollectionOption(location = {}) {
  const id = `collection:${location.slug}`;
  const isPartner = location.type === "partner-collection-point";
  const isStore = location.type === "main-store" || location.type === "owned-branch";
  return {
    id,
    value: id,
    fulfilmentMode: isPartner ? "partner-collection" : "store-collection",
    type: isPartner ? "partner-collection" : "store-collection",
    locationSlug: location.slug,
    locationId: location.id,
    locationType: location.type,
    publicLabel: isStore ? `Collect from Holo Print ${location.name}` : `Collect from ${location.name} partner point`,
    checkoutDescription: location.description || location.pickupInstructions || "Collection details will be confirmed when your order is ready.",
    pickupInstructions: location.pickupInstructions || "Bring your confirmation email or collection PIN.",
    address: location.address || {},
    cutoffTime: location.cutoffTime,
    priceMinor: Number(location.collectionFeeMinor || 0),
    vatRate: 20,
    requiresManualApproval: isPartner,
    collectionTruth: location.collectionTruth || (isPartner ? "Partner collection point, not a Holo Print branch" : "Real Holo Print collection location"),
    googleBusinessEligible: Boolean(location.googleBusinessEligible),
    rawLocation: location,
  };
}

function buildDeliveryOption(option = {}) {
  const id = option.id || option.value || deliveryLabel(option);
  return { ...option, id, value: id, type: option.fulfilmentMode || "delivery", fulfilmentMode: option.fulfilmentMode || "delivery" };
}

function optionIcon(option = {}) {
  if (String(option.fulfilmentMode || option.type || "").includes("collection")) return <PackageCheck className="h-5 w-5" />;
  return <Truck className="h-5 w-5" />;
}

export default function Checkout({ cart, navigate }) {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitState, setSubmitState] = useState(null);
  const [resolverStatus, setResolverStatus] = useState("idle");
  const [resolvedLines, setResolvedLines] = useState([]);
  const [deliveryOptions, setDeliveryOptions] = useState([]);
  const [collectionLocations, setCollectionLocations] = useState([]);
  const [deliveryStatus, setDeliveryStatus] = useState("idle");
  const [locationStatus, setLocationStatus] = useState("idle");
  const [quoteSubmitState, setQuoteSubmitState] = useState(null);
  const [artworkState, setArtworkState] = useState({ mode: "later", file: null, uploaded: null, error: "", preflight: null, preflightStatus: "idle" });
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", companyName: "", vatNumber: "", billingAddress1: "", billingAddress2: "", billingCity: "", billingPostcode: "", billingCountry: "United Kingdom", sameAsBilling: true, deliveryAddress1: "", deliveryAddress2: "", deliveryCity: "", deliveryPostcode: "", deliveryCountry: "United Kingdom", fulfilmentChoice: "", delivery: "", paymentMethod: "Pay now", notes: "", agree: false });

  const propItems = cart?.items || [];
  const localItems = useMemo(() => readLocalCartItems(), [propItems.length]);
  const items = propItems.length ? propItems : localItems;
  const checkoutItems = resolvedLines.length ? resolvedLines : items;
  const firstProductSlug = itemProductKey(items[0] || {});
  const effectivePostcode = form.sameAsBilling ? form.billingPostcode : form.deliveryPostcode;
  const itemSubtotalMinor = useMemo(() => checkoutItems.reduce((sum, item) => sum + minorFromMoney(Number(item.price || 0) * itemQty(item)), 0), [checkoutItems]);
  const collectionOptions = collectionLocations.map(buildCollectionOption);
  const deliveryList = deliveryOptions.map(buildDeliveryOption);
  const fulfilmentOptions = [...collectionOptions, ...deliveryList];
  const selectedFulfilment = fulfilmentOptions.find((option) => String(optionId(option)) === String(form.fulfilmentChoice || form.delivery)) || fulfilmentOptions[0] || null;
  const fulfilmentFee = selectedFulfilment ? deliveryPrice(selectedFulfilment) : 0;
  const taxSummary = useMemo(() => buildTaxSummary(checkoutItems, fulfilmentFee, selectedFulfilment || {}), [checkoutItems, fulfilmentFee, selectedFulfilment]);
  const quoteRequired = checkoutItems.some(hasQuoteFlag) || Boolean(selectedFulfilment?.requiresManualApproval);
  const checkoutBlocked = checkoutItems.some((item) => Boolean(item.checkoutBlocked || item.resolverSnapshot?.checkout?.blocked));
  const preflightBlocked = artworkState.preflightStatus === "blocked";

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  useEffect(() => {
    let cancelled = false;
    async function reprice() {
      if (!items.length) { setResolvedLines([]); setResolverStatus("idle"); return; }
      setResolverStatus("checking");
      const next = [];
      for (const item of items) {
        const productId = itemProductKey(item);
        const quantity = itemQty(item);
        const selections = itemSelections(item);
        try {
          const resolved = await resolveCartPrice(productId, selections, quantity);
          if (cancelled) return;
          const resolvedMinor = resolved?.pricing?.selected?.totalMinor ?? resolved?.pricing?.totalMinor ?? null;
          next.push({ ...item, qty: quantity, quantity, price: resolvedMinor != null ? moneyFromMinor(resolvedMinor) : Number(item.price || 0), resolverSnapshot: resolved, vatRate: resolved?.pricing?.vatRate ?? resolved?.pricing?.selected?.vatRate, vatClass: resolved?.pricing?.vatClass ?? resolved?.pricing?.selected?.vatClass, vatReason: resolved?.pricing?.vatReason ?? resolved?.pricing?.selected?.vatReason, quoteRequired: Boolean(resolved?.checkout?.quoteRequired), checkoutBlocked: Boolean(resolved?.checkout?.blocked), resolverMessages: resolved?.checkout?.messages || resolved?.appliedRules?.messages || [] });
        } catch (error) {
          next.push({ ...item, qty: quantity, quantity, price: Number(item.price || 0), resolverError: error?.message || "Cart price resolver unavailable", quoteRequired: hasQuoteFlag(item) });
        }
      }
      if (!cancelled) { setResolvedLines(next); setResolverStatus(next.some((item) => item.resolverError) ? "fallback" : "resolved"); }
    }
    void reprice();
    return () => { cancelled = true; };
  }, [items.length]);

  useEffect(() => {
    let cancelled = false;
    async function loadFulfilment() {
      setDeliveryStatus("checking");
      setLocationStatus("checking");
      try {
        const delivery = await resolveDeliveryOptions({ postcode: effectivePostcode, subtotalMinor: itemSubtotalMinor });
        if (!cancelled) { const options = delivery?.data?.items || delivery?.items || delivery?.options || []; setDeliveryOptions(Array.isArray(options) ? options : []); setDeliveryStatus("resolved"); }
      } catch {
        if (!cancelled) { setDeliveryOptions([{ id: "delivery:standard", label: "Standard UK delivery", description: "Calculated during review", priceMinor: 0, vatRate: 20, fulfilmentMode: "delivery" }]); setDeliveryStatus("fallback"); }
      }
      try {
        const locations = await fetchStorefrontLocations(firstProductSlug);
        if (!cancelled) { setCollectionLocations(locations.length ? locations : fallbackLocations()); setLocationStatus(locations.length ? "resolved" : "fallback"); }
      } catch {
        if (!cancelled) { setCollectionLocations(fallbackLocations()); setLocationStatus("fallback"); }
      }
    }
    void loadFulfilment();
    return () => { cancelled = true; };
  }, [effectivePostcode, itemSubtotalMinor, firstProductSlug]);

  useEffect(() => {
    if (!form.fulfilmentChoice && fulfilmentOptions[0]) {
      setField("fulfilmentChoice", optionId(fulfilmentOptions[0]));
      setField("delivery", optionId(fulfilmentOptions[0]));
    }
  }, [fulfilmentOptions.length]);

  async function runArtworkPreflight(file) {
    if (!file) return;
    setArtworkState((prev) => ({ ...prev, preflightStatus: "checking", error: "" }));
    try {
      const preflight = await resolveArtworkPreflight({ productId: firstProductSlug, slug: firstProductSlug, files: [fileMeta(file)], selections: itemSelections(items[0] || {}), artworkMode: "upload" });
      const status = preflight?.blocked ? "blocked" : preflight?.warnings?.length || preflight?.preflight?.warnings?.length ? "warning" : "passed";
      setArtworkState((prev) => ({ ...prev, preflight, preflightStatus: status }));
    } catch (error) {
      setArtworkState((prev) => ({ ...prev, preflight: null, preflightStatus: "warning", error: error?.message || "Preflight unavailable. We will manually review the artwork." }));
    }
  }

  async function handleArtworkUpload() {
    if (!artworkState.file) return;
    try {
      const uploaded = await uploadArtwork(artworkState.file, { productId: firstProductSlug, slug: firstProductSlug, mode: artworkState.mode, preflight: artworkState.preflight });
      setArtworkState((prev) => ({ ...prev, uploaded, error: "" }));
    } catch (error) {
      setArtworkState((prev) => ({ ...prev, error: error?.message || "Artwork upload failed." }));
    }
  }

  function buildPayload() {
    const deliveryAddress = form.sameAsBilling ? { line1: form.billingAddress1, line2: form.billingAddress2, city: form.billingCity, postcode: form.billingPostcode, country: form.billingCountry } : { line1: form.deliveryAddress1, line2: form.deliveryAddress2, city: form.deliveryCity, postcode: form.deliveryPostcode, country: form.deliveryCountry };
    return {
      source: "hosted-theme-checkout",
      customer: { firstName: form.firstName, lastName: form.lastName, name: `${form.firstName} ${form.lastName}`.trim(), email: form.email, phone: form.phone, company: form.companyName, vatNumber: form.vatNumber },
      customerEmail: form.email,
      billingAddress: { line1: form.billingAddress1, line2: form.billingAddress2, city: form.billingCity, postcode: form.billingPostcode, country: form.billingCountry },
      shippingAddress: deliveryAddress,
      delivery: selectedFulfilment,
      fulfilmentMode: selectedFulfilment?.fulfilmentMode || selectedFulfilment?.type || "delivery",
      fulfilmentChoice: form.fulfilmentChoice,
      fulfilmentSelection: selectedFulfilment,
      shippingMethod: deliveryLabel(selectedFulfilment || {}),
      shippingMinor: minorFromMoney(fulfilmentFee),
      payment_method: form.paymentMethod,
      paymentMethod: form.paymentMethod,
      notes: form.notes,
      artworkMode: artworkState.mode,
      artwork_reference: artworkState.uploaded,
      artwork_preflight: artworkState.preflight,
      items: checkoutItems.map((item) => ({ ...item, productId: itemProductKey(item), productName: item.name || item.productName || itemProductKey(item), quantity: itemQty(item), selections: itemSelections(item), totalPrice: Number(item.price || 0) * itemQty(item) })),
      totals: { subtotal: taxSummary.net, vat: taxSummary.vat, delivery: taxSummary.fulfilment, total: taxSummary.gross, netTotalMinor: minorFromMoney(taxSummary.net), vatTotalMinor: minorFromMoney(taxSummary.vat), grossTotalMinor: minorFromMoney(taxSummary.gross), totalMinor: minorFromMoney(taxSummary.gross), shippingMinor: minorFromMoney(taxSummary.fulfilment), vatBreakdown: taxSummary.breakdown },
      vatBreakdown: taxSummary.breakdown,
      quoteRequired,
      checkoutBlocked,
      clearCart: true,
      rawCheckout: { fulfilmentMode: selectedFulfilment?.fulfilmentMode || selectedFulfilment?.type, fulfilmentSelection: selectedFulfilment, delivery: selectedFulfilment },
    };
  }

  async function handleSubmit() {
    setSubmitting(true);
    setQuoteSubmitState(null);
    const payload = buildPayload();
    try {
      if (quoteRequired || checkoutBlocked) {
        const response = await createQuoteRequest({ productId: payload.items[0]?.productId, customer: payload.customer, selections: payload.items, artwork: payload.artwork_reference, artworkPreflight: payload.artwork_preflight, notes: payload.notes, checkout: payload });
        setQuoteSubmitState(response);
        setSubmitState({ success: true, message: "Quote request captured. We will review the specification, fulfilment and artwork before confirming payment." });
      } else {
        const response = await createOrder(payload);
        setSubmitState({ success: true, message: "Order submitted. If you selected pay now, secure payment will open next.", response });
      }
      setStep(8);
    } catch (error) {
      setSubmitState({ success: false, message: error?.message || "Checkout submission failed. Please try again." });
      setStep(8);
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass = "h-11 rounded-xl border px-3 text-[13px]";
  const canContinue = step === 1 ? Boolean(form.firstName && form.lastName && form.email) : step === 3 ? Boolean(form.billingAddress1 && form.billingCity && form.billingPostcode) : step === 4 ? Boolean(selectedFulfilment) : step === 5 ? !preflightBlocked : step === 7 ? Boolean(form.agree) : true;

  return <section className="py-6"><div className="mx-auto max-w-[1000px] px-4 sm:px-6 lg:px-8">
    <div className="mb-5 flex items-end justify-between gap-4"><div><div className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: "rgb(24, 167, 208)" }}>Checkout</div><h1 className="mt-2 text-[28px] font-black tracking-[-0.04em]" style={{ color: "#121517" }}>Secure print order checkout</h1><p className="mt-2 max-w-[760px] text-[12px] leading-6" style={{ color: "#667179" }}>Choose delivery or collection, upload artwork, review VAT and submit payment or quote approval.</p></div><button onClick={() => navigate("/cart")} className="rounded-full border px-4 py-2 text-[12px] font-bold" style={{ borderColor: "#E2E6E8", color: "#121517", backgroundColor: "white" }}>Back to cart</button></div>
    <div className="mb-5 flex flex-wrap gap-2">{STEPS.map((label, index) => <StepPill key={label} label={label} index={index + 1} current={step} />)}</div>
    <div className="mb-5 grid gap-3 md:grid-cols-4"><ResolverNotice type={resolverStatus === "resolved" ? "ok" : resolverStatus === "fallback" ? "warn" : "info"}>Cart price: {resolverStatus}</ResolverNotice><ResolverNotice type={deliveryStatus === "resolved" ? "ok" : deliveryStatus === "fallback" ? "warn" : "info"}>Delivery: {deliveryStatus}</ResolverNotice><ResolverNotice type={locationStatus === "resolved" ? "ok" : locationStatus === "fallback" ? "warn" : "info"}>Collection: {locationStatus}</ResolverNotice><ResolverNotice type={quoteRequired ? "warn" : "ok"}>{quoteRequired ? "Quote/manual review" : "Normal checkout"}</ResolverNotice></div>

    <div className="grid gap-6 lg:grid-cols-[1fr_360px]"><div className="rounded-[22px] border bg-white p-5 shadow-[0_12px_28px_rgba(0,0,0,0.03)]" style={{ borderColor: "#E2E6E8" }}>
      {step === 1 && <div className="grid gap-4 sm:grid-cols-2"><Field label="First name"><input value={form.firstName} onChange={(event) => setField("firstName", event.target.value)} className={inputClass} style={{ borderColor: "#E2E6E8" }} /></Field><Field label="Last name"><input value={form.lastName} onChange={(event) => setField("lastName", event.target.value)} className={inputClass} style={{ borderColor: "#E2E6E8" }} /></Field><Field label="Email"><input value={form.email} onChange={(event) => setField("email", event.target.value)} className={inputClass} style={{ borderColor: "#E2E6E8" }} /></Field><Field label="Phone" hint="Optional"><input value={form.phone} onChange={(event) => setField("phone", event.target.value)} className={inputClass} style={{ borderColor: "#E2E6E8" }} /></Field></div>}
      {step === 2 && <div className="grid gap-4 sm:grid-cols-2"><Field label="Company name" hint="Optional"><input value={form.companyName} onChange={(event) => setField("companyName", event.target.value)} className={inputClass} style={{ borderColor: "#E2E6E8" }} /></Field><Field label="VAT number" hint="Optional"><input value={form.vatNumber} onChange={(event) => setField("vatNumber", event.target.value)} className={inputClass} style={{ borderColor: "#E2E6E8" }} /></Field><div className="sm:col-span-2 rounded-[16px] border bg-[#F8FBFC] p-4 text-[12px]" style={{ borderColor: "#E2E6E8", color: "#667179" }}>Add company details if this is a business order or if you need invoicing information on the order.</div></div>}
      {step === 3 && <div className="grid gap-5"><SectionCard title="Billing address" eyebrow="Billing"><div className="grid gap-4 sm:grid-cols-2"><div className="sm:col-span-2"><Field label="Address line 1"><input value={form.billingAddress1} onChange={(event) => setField("billingAddress1", event.target.value)} className={`${inputClass} w-full`} style={{ borderColor: "#E2E6E8" }} /></Field></div><Field label="City"><input value={form.billingCity} onChange={(event) => setField("billingCity", event.target.value)} className={inputClass} style={{ borderColor: "#E2E6E8" }} /></Field><Field label="Postcode"><input value={form.billingPostcode} onChange={(event) => setField("billingPostcode", event.target.value)} className={inputClass} style={{ borderColor: "#E2E6E8" }} /></Field></div></SectionCard><label className="flex items-center gap-3 rounded-[14px] border bg-[#FBFCFD] px-4 py-3 text-[12px]" style={{ borderColor: "#E2E6E8", color: "#667179" }}><input type="checkbox" checked={form.sameAsBilling} onChange={(event) => setField("sameAsBilling", event.target.checked)} />Delivery address is the same as billing</label>{!form.sameAsBilling && <SectionCard title="Delivery address" eyebrow="Delivery"><div className="grid gap-4 sm:grid-cols-2"><div className="sm:col-span-2"><Field label="Address line 1"><input value={form.deliveryAddress1} onChange={(event) => setField("deliveryAddress1", event.target.value)} className={`${inputClass} w-full`} style={{ borderColor: "#E2E6E8" }} /></Field></div><Field label="City"><input value={form.deliveryCity} onChange={(event) => setField("deliveryCity", event.target.value)} className={inputClass} style={{ borderColor: "#E2E6E8" }} /></Field><Field label="Postcode"><input value={form.deliveryPostcode} onChange={(event) => setField("deliveryPostcode", event.target.value)} className={inputClass} style={{ borderColor: "#E2E6E8" }} /></Field></div></SectionCard>}</div>}
      {step === 4 && <div className="grid gap-4"><SectionCard title="Choose collection or delivery" eyebrow="Fulfilment"><div className="grid gap-3">{fulfilmentOptions.map((option) => { const id = optionId(option); const active = String(form.fulfilmentChoice || form.delivery) === String(id); const fee = deliveryPrice(option); const isCollection = String(option.fulfilmentMode || option.type || "").includes("collection"); return <button key={id} onClick={() => { setField("fulfilmentChoice", id); setField("delivery", id); }} className="flex items-start justify-between rounded-[14px] border bg-white p-4 text-left" style={{ borderColor: active ? "rgb(24, 167, 208)" : "#E2E6E8", boxShadow: active ? "inset 0 0 0 1px rgb(24, 167, 208)" : "none" }}><div className="flex items-start gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-[#F1FAFD]" style={{ color: "rgb(24, 167, 208)" }}>{optionIcon(option)}</div><div><div className="text-[14px] font-bold" style={{ color: "#121517" }}>{deliveryLabel(option)}</div><div className="mt-1 text-[12px]" style={{ color: "#667179" }}>{deliveryDescription(option)}</div><div className="mt-1 text-[11px]" style={{ color: "#667179" }}>{option.address?.town ? `${option.address.town} · ` : ""}{option.cutoffTime ? `Cutoff ${option.cutoffTime}` : "Cutoff shown after review"}{option.pickupInstructions ? ` · ${option.pickupInstructions}` : ""}</div>{isCollection && <div className="mt-2 rounded-xl border px-3 py-2 text-[11px]" style={{ borderColor: option.googleBusinessEligible ? "#BBF7D0" : "#FDE68A", backgroundColor: option.googleBusinessEligible ? "#F0FDF4" : "#FFFBEB", color: option.googleBusinessEligible ? "#166534" : "#854D0E" }}><ShieldCheck className="mr-1 inline h-3.5 w-3.5" />{option.collectionTruth}</div>}</div></div><div className="text-[14px] font-black" style={{ color: "#121517" }}>{fee ? currency(fee) : "Free"}</div></button>; })}</div></SectionCard>{selectedFulfilment?.requiresManualApproval ? <ResolverNotice type="warn"><AlertTriangle className="mr-2 inline h-4 w-4" />This collection option needs admin confirmation before payment. We will send a payment link after review.</ResolverNotice> : null}</div>}
      {step === 5 && <div className="grid gap-4"><div className="grid gap-3 md:grid-cols-2"><button onClick={() => setArtworkState((prev) => ({ ...prev, mode: "now" }))} className="rounded-[16px] border bg-white p-4 text-left" style={{ borderColor: artworkState.mode === "now" ? "rgb(24, 167, 208)" : "#E2E6E8" }}><div className="flex items-center gap-3"><Upload className="h-5 w-5" style={{ color: "rgb(24,167,208)" }} /><div><div className="text-[14px] font-bold">Upload artwork now</div><div className="text-[12px]" style={{ color: "#667179" }}>Attach files and run preflight before checkout.</div></div></div></button><button onClick={() => setArtworkState((prev) => ({ ...prev, mode: "later", preflightStatus: "idle" }))} className="rounded-[16px] border bg-white p-4 text-left" style={{ borderColor: artworkState.mode === "later" ? "rgb(24, 167, 208)" : "#E2E6E8" }}><div className="flex items-center gap-3"><FileText className="h-5 w-5" style={{ color: "rgb(24,167,208)" }} /><div><div className="text-[14px] font-bold">Upload artwork later</div><div className="text-[12px]" style={{ color: "#667179" }}>Place the order first and send files after.</div></div></div></button></div>{artworkState.mode === "now" && <SectionCard title="Artwork upload + preflight" eyebrow="Artwork"><div className="grid gap-3"><input type="file" onChange={(event) => { const file = event.target.files?.[0] || null; setArtworkState((prev) => ({ ...prev, file, uploaded: null, error: "", preflight: null, preflightStatus: file ? "checking" : "idle" })); if (file) void runArtworkPreflight(file); }} />{artworkState.file && <div className="flex items-center justify-between rounded-[12px] border bg-white px-3 py-3 text-[12px]" style={{ borderColor: "#E2E6E8" }}><div className="flex items-center gap-2"><ImageIcon className="h-4 w-4" />{artworkState.file.name}</div><button disabled={preflightBlocked} onClick={handleArtworkUpload} className="rounded-full bg-[#121517] px-3 py-2 text-[11px] font-bold text-white disabled:opacity-50">Upload file</button></div>}{artworkState.preflightStatus !== "idle" && <ResolverNotice type={artworkState.preflightStatus === "blocked" ? "bad" : artworkState.preflightStatus === "warning" ? "warn" : artworkState.preflightStatus === "passed" ? "ok" : "info"}>Preflight: {artworkState.preflightStatus}. {artworkState.preflight?.preflight?.customerInstructions || artworkState.error}</ResolverNotice>}{artworkState.uploaded && <div className="text-[12px]" style={{ color: "rgb(24, 167, 208)" }}>Artwork uploaded successfully.</div>}</div></SectionCard>}{artworkState.mode === "later" && <SectionCard title="Upload later guidance" eyebrow="Artwork handoff"><div className="text-[12px] leading-6" style={{ color: "#667179" }}>You can place the order now and hand artwork over later. The product artwork rules will still be included in the order/quote payload.</div></SectionCard>}</div>}
      {step === 6 && <div className="grid gap-5"><SectionCard title="Order review" eyebrow="Final check"><div className="grid gap-2 text-[12px]" style={{ color: "#667179" }}><div><b>Customer:</b> {form.firstName} {form.lastName}</div><div><b>Email:</b> {form.email}</div><div><b>Billing:</b> {form.billingAddress1}, {form.billingCity}, {form.billingPostcode}</div><div><b>Collection / delivery:</b> {deliveryLabel(selectedFulfilment || {})}</div><div><b>Fulfilment fee:</b> {fulfilmentFee ? currency(fulfilmentFee) : "Free"}</div><div><b>Artwork:</b> {artworkState.mode === "later" ? "Upload later" : artworkState.uploaded ? "Uploaded now" : `Preflight ${artworkState.preflightStatus}`}</div><div><b>VAT summary:</b> Net {currency(taxSummary.net)} · VAT {currency(taxSummary.vat)} · Gross {currency(taxSummary.gross)}</div>{selectedFulfilment?.pickupInstructions ? <div><b>Pickup:</b> {selectedFulfilment.pickupInstructions}</div> : null}</div></SectionCard>{quoteRequired ? <ResolverNotice type="warn"><FileQuestion className="mr-2 inline h-4 w-4" />This basket needs manual review before payment. We will capture your request and follow up with a confirmed quote/payment link.</ResolverNotice> : <ResolverNotice type="ok"><Check className="mr-2 inline h-4 w-4" />This basket is ready for checkout.</ResolverNotice>}</div>}
      {step === 7 && <div className="grid gap-4"><SectionCard title="Payment choice" eyebrow="Payment"><div className="grid gap-3"><label className="rounded-[14px] border bg-white p-4 text-[13px]" style={{ borderColor: form.paymentMethod === "Pay now" ? "rgb(24,167,208)" : "#E2E6E8" }}><input className="mr-2" type="radio" checked={form.paymentMethod === "Pay now"} onChange={() => setField("paymentMethod", "Pay now")} />Pay now by card</label><label className="rounded-[14px] border bg-white p-4 text-[13px]" style={{ borderColor: form.paymentMethod === "Quote request" ? "rgb(24,167,208)" : "#E2E6E8" }}><input className="mr-2" type="radio" checked={form.paymentMethod === "Quote request"} onChange={() => setField("paymentMethod", "Quote request")} />Request quote / payment link</label><textarea value={form.notes} onChange={(event) => setField("notes", event.target.value)} placeholder="Order notes" className="min-h-[90px] rounded-xl border p-3 text-[13px]" style={{ borderColor: "#E2E6E8" }} /><label className="flex items-center gap-3 rounded-[14px] border bg-[#FBFCFD] px-4 py-3 text-[12px]" style={{ borderColor: "#E2E6E8", color: "#667179" }}><input type="checkbox" checked={form.agree} onChange={(event) => setField("agree", event.target.checked)} />I confirm the order details, VAT summary and artwork notes are correct.</label></div></SectionCard></div>}
      {step === 8 && <div className="grid gap-4"><ResolverNotice type={submitState?.success !== false ? "ok" : "bad"}>{submitState?.message || (submitState?.success === false ? "Checkout failed" : quoteRequired ? "Quote submitted" : "Order submitted")}</ResolverNotice>{quoteSubmitState ? <pre className="max-h-[240px] overflow-auto rounded-xl bg-[#111827] p-3 text-[11px] text-white">{JSON.stringify(quoteSubmitState, null, 2)}</pre> : null}<button onClick={() => navigate("/account")} className="rounded-full bg-[#121517] px-5 py-3 text-[12px] font-bold text-white">Go to account</button></div>}
      {step < 8 && <div className="mt-6 flex items-center justify-between gap-3"><button disabled={step === 1} onClick={() => setStep((value) => Math.max(1, value - 1))} className="rounded-full border px-5 py-3 text-[12px] font-bold disabled:opacity-40" style={{ borderColor: "#E2E6E8", color: "#121517" }}>Back</button>{step === 7 ? <button disabled={!canContinue || submitting} onClick={handleSubmit} className="rounded-full bg-[#121517] px-5 py-3 text-[12px] font-bold text-white disabled:opacity-40">{submitting ? "Submitting…" : quoteRequired ? "Submit quote request" : "Place order"}</button> : <button disabled={!canContinue} onClick={() => setStep((value) => Math.min(7, value + 1))} className="rounded-full bg-[#121517] px-5 py-3 text-[12px] font-bold text-white disabled:opacity-40">Continue</button>}</div>}
    </div>

    <aside className="h-fit rounded-[22px] border bg-white p-5 shadow-[0_12px_28px_rgba(0,0,0,0.03)]" style={{ borderColor: "#E2E6E8" }}>
      <div className="mb-3 text-[15px] font-black" style={{ color: "#121517" }}>Order summary</div>
      <div className="grid gap-3">{checkoutItems.map((item, index) => <div key={item.id || index} className="rounded-[14px] border p-3" style={{ borderColor: "#E2E6E8" }}><div className="text-[13px] font-bold" style={{ color: "#121517" }}>{item.name || item.productName || itemProductKey(item)}</div><div className="mt-1 text-[12px]" style={{ color: "#667179" }}>Qty {itemQty(item)} · {currency(Number(item.price || 0) * itemQty(item))}</div><div className="mt-1 text-[11px]" style={{ color: "#667179" }}>{lineVatProfile(item).label} · {lineVatProfile(item).reason}</div></div>)}</div>
      <div className="mt-4 grid gap-2 border-t pt-4 text-[13px]" style={{ borderColor: "#E2E6E8", color: "#667179" }}><div className="flex justify-between"><span>Net</span><b>{currency(taxSummary.net)}</b></div><div className="flex justify-between"><span>VAT</span><b>{currency(taxSummary.vat)}</b></div><div className="flex justify-between"><span>Collection / delivery</span><b>{fulfilmentFee ? currency(fulfilmentFee) : "Free"}</b></div><div className="flex justify-between text-[16px]" style={{ color: "#121517" }}><span>Total</span><b>{currency(taxSummary.gross)}</b></div></div>
      <div className="mt-4 rounded-[14px] border bg-[#F8FBFC] p-3 text-[12px] leading-6" style={{ borderColor: "#E2E6E8", color: "#667179" }}><div className="mb-1 flex items-center gap-2 font-bold" style={{ color: "#121517" }}><MapPin className="h-4 w-4" />Selected fulfilment</div>{selectedFulfilment ? <><div>{deliveryLabel(selectedFulfilment)}</div><div>{selectedFulfilment.cutoffTime ? `Cutoff ${selectedFulfilment.cutoffTime}` : "Cutoff confirmed after review"}</div></> : "Choose an option in step 4."}</div>
      <div className="mt-4 grid gap-2">{taxSummary.breakdown.map((row) => <div key={row.rate} className="rounded-[12px] border bg-white px-3 py-2 text-[11px]" style={{ borderColor: "#E2E6E8", color: "#667179" }}><b style={{ color: "#121517" }}>{row.label}</b> · Net {currency(row.net)} · VAT {currency(row.vat)}</div>)}</div>
    </aside>
    </div>
  </div></section>;
}
