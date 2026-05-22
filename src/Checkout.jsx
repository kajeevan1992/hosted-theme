
import React, { useEffect, useMemo, useState } from "react";
import { Check, Upload, Image as ImageIcon, FileText, Truck, CreditCard, ShieldCheck, AlertTriangle, FileQuestion } from "lucide-react";
import { createOrder, uploadArtwork } from "./services_api";
import { createQuoteRequest, resolveCartPrice, resolveDeliveryOptions } from "./services/internalStorefront";

const STEPS = ["Customer", "Company", "Billing & delivery", "Delivery", "Artwork", "Review", "Payment", "Confirm"];

function currency(value) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(Number(value || 0));
}

function moneyFromMinor(value) {
  return Number(value || 0) / 100;
}

function minorFromMoney(value) {
  return Math.round(Number(value || 0) * 100);
}

function itemQty(item = {}) {
  return Number(item.quantity || item.qty || item.config?.quantity || item.selections?.quantity || 1);
}

function itemProductKey(item = {}) {
  return item.productId || item.slug || item.productSlug || item.product_id || item.id?.split?.('-')?.[0] || item.name;
}

function itemSelections(item = {}) {
  return item.selections || item.config || item.options || {};
}

function deliveryLabel(option = {}) {
  return option.publicLabel || option.label || option.name || option.day || option.value || "Delivery option";
}

function deliveryDescription(option = {}) {
  return option.checkoutDescription || option.description || option.latest || option.transitDays || "Calculated by delivery settings";
}

function deliveryPrice(option = {}) {
  if (typeof option.priceMinor === "number") return moneyFromMinor(option.priceMinor);
  if (typeof option.basePriceMinor === "number") return moneyFromMinor(option.basePriceMinor);
  if (typeof option.fee === "number") return option.fee;
  return 0;
}

function readLocalCartItems() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem("holo-cart");
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function hasQuoteFlag(item = {}) {
  return Boolean(
    item.quoteRequired ||
    item.checkoutBlocked ||
    item.checkout?.quoteRequired ||
    item.checkout?.blocked ||
    item.pricing?.quoteRequired ||
    item.resolverSnapshot?.checkout?.quoteRequired ||
    item.resolverSnapshot?.checkout?.blocked
  );
}

function StepPill({ label, index, current }) {
  const done = current > index;
  const active = current === index;
  return (
    <div className={`flex items-center gap-2 rounded-full border px-3 py-2 text-[12px] font-semibold ${active ? "shadow-[0_10px_24px_rgba(0,0,0,0.04)]" : ""}`} style={{ borderColor: active || done ? "rgb(24, 167, 208)" : "#E2E6E8", color: active || done ? "#121517" : "#667179", backgroundColor: active ? "#F1FAFD" : "white" }}>
      <span className="grid h-5 w-5 place-items-center rounded-full text-[10px] font-bold" style={{ backgroundColor: done || active ? "rgb(24, 167, 208)" : "#EEF1F3", color: done || active ? "white" : "#667179" }}>{done ? "✓" : index}</span>
      {label}
    </div>
  );
}

function Field({ label, children, hint = "" }) {
  return (
    <label className="grid gap-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[12px] font-bold" style={{ color: "#121517" }}>{label}</span>
        {hint ? <span className="text-[11px]" style={{ color: "#667179" }}>{hint}</span> : null}
      </div>
      {children}
    </label>
  );
}

function SectionCard({ title, eyebrow = "", children }) {
  return <div className="rounded-[18px] border bg-[#FBFCFD] p-4" style={{ borderColor: "#E2E6E8" }}>{eyebrow ? <div className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: "rgb(24, 167, 208)" }}>{eyebrow}</div> : null}<div className="mt-1 text-[15px] font-bold" style={{ color: "#121517" }}>{title}</div><div className="mt-3">{children}</div></div>;
}

function ResolverNotice({ type = "info", children }) {
  const isWarn = type === "warn";
  const isOk = type === "ok";
  return (
    <div className="rounded-[14px] border px-4 py-3 text-[12px] leading-6" style={{ borderColor: isWarn ? "#FACC15" : isOk ? "#86EFAC" : "#BAE6FD", backgroundColor: isWarn ? "#FEFCE8" : isOk ? "#F0FDF4" : "#F0F9FF", color: isWarn ? "#854D0E" : isOk ? "#166534" : "#075985" }}>
      {children}
    </div>
  );
}

export default function Checkout({ cart, navigate }) {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitState, setSubmitState] = useState(null);
  const [artworkState, setArtworkState] = useState({ mode: "later", file: null, uploaded: null, error: "" });
  const [resolverStatus, setResolverStatus] = useState("idle");
  const [resolvedLines, setResolvedLines] = useState([]);
  const [deliveryOptions, setDeliveryOptions] = useState([]);
  const [deliveryStatus, setDeliveryStatus] = useState("idle");
  const [quoteSubmitState, setQuoteSubmitState] = useState(null);
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    companyName: "", vatNumber: "",
    billingAddress1: "", billingAddress2: "", billingCity: "", billingPostcode: "", billingCountry: "United Kingdom",
    sameAsBilling: true,
    deliveryAddress1: "", deliveryAddress2: "", deliveryCity: "", deliveryPostcode: "", deliveryCountry: "United Kingdom",
    delivery: "",
    paymentMethod: "Pay now",
    notes: "",
    agree: false,
  });

  const propItems = cart?.items || [];
  const localItems = useMemo(() => readLocalCartItems(), [propItems.length]);
  const items = propItems.length ? propItems : localItems;
  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const effectivePostcode = form.sameAsBilling ? form.billingPostcode : form.deliveryPostcode;

  useEffect(() => {
    let cancelled = false;
    async function reprice() {
      if (!items.length) {
        setResolvedLines([]);
        setResolverStatus("idle");
        return;
      }
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
          next.push({
            ...item,
            qty: quantity,
            quantity,
            price: resolvedMinor != null ? moneyFromMinor(resolvedMinor) : Number(item.price || 0),
            resolverSnapshot: resolved,
            quoteRequired: Boolean(resolved?.checkout?.quoteRequired),
            checkoutBlocked: Boolean(resolved?.checkout?.blocked),
            resolverMessages: resolved?.checkout?.messages || resolved?.appliedRules?.messages || [],
          });
        } catch (error) {
          next.push({
            ...item,
            qty: quantity,
            quantity,
            price: Number(item.price || 0),
            resolverError: error?.message || "Cart price resolver unavailable",
            quoteRequired: hasQuoteFlag(item),
          });
        }
      }
      if (!cancelled) {
        setResolvedLines(next);
        setResolverStatus(next.some((line) => line.resolverError) ? "fallback" : "resolved");
      }
    }
    reprice();
    return () => { cancelled = true; };
  }, [JSON.stringify(items.map((item) => ({ id: item.id, q: itemQty(item), key: itemProductKey(item), selections: itemSelections(item) })))]);

  const checkoutItems = resolvedLines.length ? resolvedLines : items;
  const subtotal = checkoutItems.reduce((sum, item) => sum + Number(item.price || 0) * itemQty(item), 0);
  const vat = subtotal * 0.2;

  useEffect(() => {
    let cancelled = false;
    async function loadDelivery() {
      setDeliveryStatus("checking");
      try {
        const payload = await resolveDeliveryOptions({ postcode: effectivePostcode, subtotalMinor: minorFromMoney(subtotal) });
        if (cancelled) return;
        const options = payload?.data?.options || payload?.options || [];
        setDeliveryOptions(Array.isArray(options) ? options : []);
        if (!form.delivery && options?.[0]) setField("delivery", options[0].id || options[0].value || deliveryLabel(options[0]));
        setDeliveryStatus("resolved");
      } catch {
        if (cancelled) return;
        setDeliveryOptions([]);
        if (!form.delivery) setField("delivery", "standard-fallback");
        setDeliveryStatus("fallback");
      }
    }
    loadDelivery();
    return () => { cancelled = true; };
  }, [effectivePostcode, subtotal]);

  const fallbackDeliveryOptions = [
    { id: "standard-fallback", publicLabel: "Standard (3–5 working days)", checkoutDescription: "Best-value default delivery option", priceMinor: 0, fulfilmentMode: "delivery" },
    { id: "express-fallback", publicLabel: "Express (24–48 hours)", checkoutDescription: "Faster production and dispatch", priceMinor: 995, fulfilmentMode: "delivery" },
    { id: "priority-fallback", publicLabel: "Priority same-day review", checkoutDescription: "Urgent review and production queue", priceMinor: 1495, fulfilmentMode: "local-courier", requiresManualApproval: true },
  ];

  const availableDeliveryOptions = deliveryOptions.length ? deliveryOptions : fallbackDeliveryOptions;
  const selectedDelivery = availableDeliveryOptions.find((option) => String(option.id || option.value || deliveryLabel(option)) === String(form.delivery)) || availableDeliveryOptions[0];
  const deliveryFee = deliveryPrice(selectedDelivery);
  const total = subtotal + vat + deliveryFee;
  const quoteRequired = checkoutItems.some(hasQuoteFlag) || checkoutItems.some((item) => item.quoteRequired || item.checkoutBlocked) || selectedDelivery?.requiresManualApproval;
  const checkoutBlocked = checkoutItems.some((item) => item.checkoutBlocked || item.resolverSnapshot?.checkout?.blocked);

  const canContinue = useMemo(() => {
    if (step === 1) return !!form.firstName && !!form.lastName && !!form.email;
    if (step === 3) {
      const billingOk = !!form.billingAddress1 && !!form.billingCity && !!form.billingPostcode;
      const deliveryOk = form.sameAsBilling || (!!form.deliveryAddress1 && !!form.deliveryCity && !!form.deliveryPostcode);
      return billingOk && deliveryOk;
    }
    if (step === 4) return !!selectedDelivery;
    if (step === 5) return artworkState.mode === "later" || !!artworkState.file || !!artworkState.uploaded;
    if (step === 7) return quoteRequired ? form.agree : (!!form.paymentMethod && form.agree && !checkoutBlocked);
    return true;
  }, [step, form, artworkState, selectedDelivery, quoteRequired, checkoutBlocked]);

  async function handleArtworkUpload() {
    if (!artworkState.file) return;
    const res = await uploadArtwork(artworkState.file, { mode: artworkState.mode });
    if (res?.success || res?.id || res?.url) setArtworkState((prev) => ({ ...prev, uploaded: res, error: "" }));
    else setArtworkState((prev) => ({ ...prev, error: res?.message || "Artwork upload failed. You can still upload later." }));
  }

  function buildPayload() {
    return {
      customer: { first_name: form.firstName, last_name: form.lastName, email: form.email, phone: form.phone, company_name: form.companyName, vat_number: form.vatNumber },
      billing_address: { address1: form.billingAddress1, address2: form.billingAddress2, city: form.billingCity, postcode: form.billingPostcode, country: form.billingCountry },
      delivery_address: form.sameAsBilling ? { address1: form.billingAddress1, address2: form.billingAddress2, city: form.billingCity, postcode: form.billingPostcode, country: form.billingCountry } : { address1: form.deliveryAddress1, address2: form.deliveryAddress2, city: form.deliveryCity, postcode: form.deliveryPostcode, country: form.deliveryCountry },
      delivery: selectedDelivery,
      payment_method: quoteRequired ? "Quote request" : form.paymentMethod,
      notes: form.notes,
      artwork_mode: artworkState.mode,
      artwork_reference: artworkState.uploaded || null,
      items: checkoutItems.map((item) => ({
        name: item.name,
        productId: itemProductKey(item),
        qty: itemQty(item),
        price: item.price,
        config: itemSelections(item),
        resolverSnapshot: item.resolverSnapshot || null,
        quoteRequired: Boolean(item.quoteRequired || item.resolverSnapshot?.checkout?.quoteRequired),
        checkoutBlocked: Boolean(item.checkoutBlocked || item.resolverSnapshot?.checkout?.blocked),
      })),
      resolver: {
        status: resolverStatus,
        deliveryStatus,
        quoteRequired,
        checkoutBlocked,
      },
      totals: { subtotal, vat, delivery: deliveryFee, total },
    };
  }

  async function handleSubmit() {
    setSubmitting(true);
    setQuoteSubmitState(null);
    const payload = buildPayload();
    try {
      if (quoteRequired || checkoutBlocked) {
        const res = await createQuoteRequest({
          productId: payload.items[0]?.productId,
          customer: payload.customer,
          selections: payload.items,
          artwork: payload.artwork_reference,
          notes: payload.notes,
          checkout: payload,
        });
        setQuoteSubmitState(res);
        setSubmitState({ success: true, message: "Quote request captured. We will review the specification, delivery and artwork route before confirming price/payment." });
      } else {
        const res = await createOrder(payload);
        setSubmitState(res);
      }
      setStep(8);
    } catch (error) {
      setSubmitState({ success: false, message: error?.message || "Checkout submission failed. Please try again." });
      setStep(8);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="py-6">
      <div className="mx-auto max-w-[1000px] px-4 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: "rgb(24, 167, 208)" }}>Checkout</div>
            <h1 className="mt-2 text-[28px] font-black tracking-[-0.04em]" style={{ color: "#121517" }}>Secure print order checkout</h1>
            <p className="mt-2 max-w-[760px] text-[12px] leading-6" style={{ color: "#667179" }}>Cart, delivery and quote state now come from the internal storefront resolver where available.</p>
          </div>
          <button onClick={() => navigate("/cart")} className="rounded-full border px-4 py-2 text-[12px] font-bold" style={{ borderColor: "#E2E6E8", color: "#121517", backgroundColor: "white" }}>Back to cart</button>
        </div>

        <div className="mb-5 flex flex-wrap gap-2">{STEPS.map((label, i) => <StepPill key={label} label={label} index={i + 1} current={step} />)}</div>

        <div className="mb-5 grid gap-3 md:grid-cols-3">
          <ResolverNotice type={resolverStatus === "resolved" ? "ok" : resolverStatus === "fallback" ? "warn" : "info"}>Cart price resolver: {resolverStatus === "resolved" ? "live" : resolverStatus === "checking" ? "checking…" : resolverStatus === "fallback" ? "fallback/local" : "idle"}</ResolverNotice>
          <ResolverNotice type={deliveryStatus === "resolved" ? "ok" : deliveryStatus === "fallback" ? "warn" : "info"}>Delivery resolver: {deliveryStatus === "resolved" ? "live" : deliveryStatus === "checking" ? "checking…" : "fallback/local"}</ResolverNotice>
          <ResolverNotice type={quoteRequired ? "warn" : "ok"}>{quoteRequired ? "Quote/manual approval route active" : "Normal checkout route"}</ResolverNotice>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="rounded-[22px] border bg-white p-5 shadow-[0_12px_28px_rgba(0,0,0,0.03)]" style={{ borderColor: "#E2E6E8" }}>
            {step === 1 && <div className="grid gap-4 sm:grid-cols-2"><Field label="First name"><input value={form.firstName} onChange={(e) => setField("firstName", e.target.value)} className="h-11 rounded-xl border px-3 text-[13px]" style={{ borderColor: "#E2E6E8" }} /></Field><Field label="Last name"><input value={form.lastName} onChange={(e) => setField("lastName", e.target.value)} className="h-11 rounded-xl border px-3 text-[13px]" style={{ borderColor: "#E2E6E8" }} /></Field><Field label="Email"><input value={form.email} onChange={(e) => setField("email", e.target.value)} className="h-11 rounded-xl border px-3 text-[13px]" style={{ borderColor: "#E2E6E8" }} /></Field><Field label="Phone" hint="Optional"><input value={form.phone} onChange={(e) => setField("phone", e.target.value)} className="h-11 rounded-xl border px-3 text-[13px]" style={{ borderColor: "#E2E6E8" }} /></Field></div>}
            {step === 2 && <div className="grid gap-4 sm:grid-cols-2"><Field label="Company name" hint="Optional"><input value={form.companyName} onChange={(e) => setField("companyName", e.target.value)} className="h-11 rounded-xl border px-3 text-[13px]" style={{ borderColor: "#E2E6E8" }} /></Field><Field label="VAT number" hint="Optional"><input value={form.vatNumber} onChange={(e) => setField("vatNumber", e.target.value)} className="h-11 rounded-xl border px-3 text-[13px]" style={{ borderColor: "#E2E6E8" }} /></Field><div className="sm:col-span-2 rounded-[16px] border bg-[#F8FBFC] p-4 text-[12px]" style={{ borderColor: "#E2E6E8", color: "#667179" }}>Add company details if this is a business order or if you need invoicing information on the order.</div></div>}
            {step === 3 && <div className="grid gap-5"><SectionCard title="Billing address" eyebrow="Billing"><div className="grid gap-4 sm:grid-cols-2"><div className="sm:col-span-2"><Field label="Address line 1"><input value={form.billingAddress1} onChange={(e) => setField("billingAddress1", e.target.value)} className="h-11 w-full rounded-xl border px-3 text-[13px]" style={{ borderColor: "#E2E6E8" }} /></Field></div><div className="sm:col-span-2"><Field label="Address line 2" hint="Optional"><input value={form.billingAddress2} onChange={(e) => setField("billingAddress2", e.target.value)} className="h-11 w-full rounded-xl border px-3 text-[13px]" style={{ borderColor: "#E2E6E8" }} /></Field></div><Field label="City"><input value={form.billingCity} onChange={(e) => setField("billingCity", e.target.value)} className="h-11 rounded-xl border px-3 text-[13px]" style={{ borderColor: "#E2E6E8" }} /></Field><Field label="Postcode"><input value={form.billingPostcode} onChange={(e) => setField("billingPostcode", e.target.value)} className="h-11 rounded-xl border px-3 text-[13px]" style={{ borderColor: "#E2E6E8" }} /></Field><Field label="Country"><input value={form.billingCountry} onChange={(e) => setField("billingCountry", e.target.value)} className="h-11 rounded-xl border px-3 text-[13px]" style={{ borderColor: "#E2E6E8" }} /></Field></div></SectionCard><label className="flex items-center gap-3 rounded-[14px] border bg-[#FBFCFD] px-4 py-3 text-[12px]" style={{ borderColor: "#E2E6E8", color: "#667179" }}><input type="checkbox" checked={form.sameAsBilling} onChange={(e) => setField("sameAsBilling", e.target.checked)} />Delivery address is the same as billing</label>{!form.sameAsBilling && <SectionCard title="Delivery address" eyebrow="Delivery"><div className="grid gap-4 sm:grid-cols-2"><div className="sm:col-span-2"><Field label="Address line 1"><input value={form.deliveryAddress1} onChange={(e) => setField("deliveryAddress1", e.target.value)} className="h-11 w-full rounded-xl border px-3 text-[13px]" style={{ borderColor: "#E2E6E8" }} /></Field></div><div className="sm:col-span-2"><Field label="Address line 2" hint="Optional"><input value={form.deliveryAddress2} onChange={(e) => setField("deliveryAddress2", e.target.value)} className="h-11 w-full rounded-xl border px-3 text-[13px]" style={{ borderColor: "#E2E6E8" }} /></Field></div><Field label="City"><input value={form.deliveryCity} onChange={(e) => setField("deliveryCity", e.target.value)} className="h-11 rounded-xl border px-3 text-[13px]" style={{ borderColor: "#E2E6E8" }} /></Field><Field label="Postcode"><input value={form.deliveryPostcode} onChange={(e) => setField("deliveryPostcode", e.target.value)} className="h-11 rounded-xl border px-3 text-[13px]" style={{ borderColor: "#E2E6E8" }} /></Field><Field label="Country"><input value={form.deliveryCountry} onChange={(e) => setField("deliveryCountry", e.target.value)} className="h-11 rounded-xl border px-3 text-[13px]" style={{ borderColor: "#E2E6E8" }} /></Field></div></SectionCard>}</div>}
            {step === 4 && <div className="grid gap-3">{availableDeliveryOptions.map((option) => { const id = option.id || option.value || deliveryLabel(option); const active = String(form.delivery) === String(id); const fee = deliveryPrice(option); return <button key={id} onClick={() => setField("delivery", id)} className="flex items-start justify-between rounded-[14px] border bg-white p-4 text-left shadow-[0_6px_16px_rgba(0,0,0,0.02)]" style={{ borderColor: active ? "rgb(24, 167, 208)" : "#E2E6E8", boxShadow: active ? "inset 0 0 0 1px rgb(24, 167, 208)" : "0 6px 16px rgba(0,0,0,0.02)" }}><div className="flex items-start gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-[#F1FAFD]" style={{ color: "rgb(24, 167, 208)" }}><Truck className="h-5 w-5" /></div><div><div className="text-[14px] font-bold" style={{ color: "#121517" }}>{deliveryLabel(option)}</div><div className="mt-1 text-[12px]" style={{ color: "#667179" }}>{deliveryDescription(option)}</div><div className="mt-1 text-[11px]" style={{ color: "#667179" }}>{option.zoneName ? `${option.zoneName} · ` : ""}{option.cutoffTime ? `Cutoff ${option.cutoffTime}` : ""}{option.freeApplied ? " · Free delivery applied" : ""}</div></div></div><div className="text-[14px] font-black" style={{ color: "#121517" }}>{fee ? currency(fee) : "Free"}</div></button>})}</div>}
            {step === 5 && <div className="grid gap-4"><div className="grid gap-3 md:grid-cols-2"><button onClick={() => setArtworkState((p) => ({ ...p, mode: "now" }))} className="rounded-[16px] border bg-white p-4 text-left" style={{ borderColor: artworkState.mode === "now" ? "rgb(24, 167, 208)" : "#E2E6E8", boxShadow: artworkState.mode === "now" ? "inset 0 0 0 1px rgb(24, 167, 208)" : "none" }}><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-[#F1FAFD]" style={{ color: "rgb(24, 167, 208)" }}><Upload className="h-5 w-5" /></div><div><div className="text-[14px] font-bold" style={{ color: "#121517" }}>Upload artwork now</div><div className="text-[12px]" style={{ color: "#667179" }}>Attach files before placing the order.</div></div></div></button><button onClick={() => setArtworkState((p) => ({ ...p, mode: "later" }))} className="rounded-[16px] border bg-white p-4 text-left" style={{ borderColor: artworkState.mode === "later" ? "rgb(24, 167, 208)" : "#E2E6E8", boxShadow: artworkState.mode === "later" ? "inset 0 0 0 1px rgb(24, 167, 208)" : "none" }}><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-[#F1FAFD]" style={{ color: "rgb(24, 167, 208)" }}><FileText className="h-5 w-5" /></div><div><div className="text-[14px] font-bold" style={{ color: "#121517" }}>Upload artwork later</div><div className="text-[12px]" style={{ color: "#667179" }}>Place the order first and send files after.</div></div></div></button></div>{artworkState.mode === "now" && <SectionCard title="Artwork upload" eyebrow="Upload now"><div className="grid gap-3"><input type="file" onChange={(e) => setArtworkState((prev) => ({ ...prev, file: e.target.files?.[0] || null, uploaded: null, error: "" }))} />{artworkState.file && <div className="flex items-center justify-between rounded-[12px] border bg-white px-3 py-3 text-[12px]" style={{ borderColor: "#E2E6E8" }}><div className="flex items-center gap-2" style={{ color: "#121517" }}><ImageIcon className="h-4 w-4" /> {artworkState.file.name}</div><button onClick={handleArtworkUpload} className="rounded-full bg-[#121517] px-3 py-2 text-[11px] font-bold text-white">Upload file</button></div>}{artworkState.uploaded && <div className="text-[12px]" style={{ color: "rgb(24, 167, 208)" }}>Artwork uploaded successfully.</div>}{artworkState.error && <div className="text-[12px]" style={{ color: "#C23636" }}>{artworkState.error}</div>}</div></SectionCard>}{artworkState.mode === "later" && <SectionCard title="Upload later guidance" eyebrow="Artwork handoff"><div className="text-[12px] leading-6" style={{ color: "#667179" }}>You can place the order now and hand artwork over later. This route is useful when your design team is still preparing files.</div></SectionCard>}</div>}
            {step === 6 && <div className="grid gap-5"><SectionCard title="Order review" eyebrow="Final check"><div className="grid gap-2 text-[12px]" style={{ color: "#667179" }}><div><b>Customer:</b> {form.firstName} {form.lastName}</div><div><b>Email:</b> {form.email}</div><div><b>Billing:</b> {form.billingAddress1}, {form.billingCity}, {form.billingPostcode}</div><div><b>Delivery:</b> {form.sameAsBilling ? "Same as billing" : `${form.deliveryAddress1}, ${form.deliveryCity}, ${form.deliveryPostcode}`}</div><div><b>Shipping option:</b> {deliveryLabel(selectedDelivery)}</div><div><b>Artwork:</b> {artworkState.mode === "later" ? "Upload later" : artworkState.uploaded ? "Uploaded now" : "Ready to upload"}</div><div><b>Resolver:</b> {resolverStatus} · {deliveryStatus}</div></div></SectionCard>{quoteRequired ? <ResolverNotice type="warn"><FileQuestion className="mr-2 inline h-4 w-4" />This basket includes quote/manual approval logic, so the final button will send a quote request instead of a normal payment order.</ResolverNotice> : null}<Field label="Order notes" hint="Optional"><textarea value={form.notes} onChange={(e) => setField("notes", e.target.value)} className="min-h-[140px] rounded-[14px] border px-3 py-3 text-[13px]" style={{ borderColor: "#E2E6E8" }} /></Field></div>}
            {step === 7 && <div className="grid gap-3">{quoteRequired ? <ResolverNotice type="warn"><AlertTriangle className="mr-2 inline h-4 w-4" />Payment is paused because this order requires a quote/manual review. Confirm below to send it to the quote request flow.</ResolverNotice> : ["Pay now", "Invoice me later", "Request proforma invoice"].map((method) => <button key={method} onClick={() => setField("paymentMethod", method)} className="flex items-center justify-between rounded-[14px] border bg-white p-4 text-left shadow-[0_6px_16px_rgba(0,0,0,0.02)]" style={{ borderColor: form.paymentMethod === method ? "rgb(24, 167, 208)" : "#E2E6E8", boxShadow: form.paymentMethod === method ? "inset 0 0 0 1px rgb(24, 167, 208)" : "0 6px 16px rgba(0,0,0,0.02)" }}><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-[#F1FAFD]" style={{ color: "rgb(24, 167, 208)" }}><CreditCard className="h-5 w-5" /></div><div><div className="text-[14px] font-bold" style={{ color: "#121517" }}>{method}</div><div className="text-[12px]" style={{ color: "#667179" }}>Payment-step placeholder ready for gateway integration.</div></div></div>{form.paymentMethod === method && <Check className="h-5 w-5" style={{ color: "rgb(24, 167, 208)" }} />}</button>)}<label className="mt-2 flex items-start gap-3 rounded-[14px] border bg-[#FBFCFD] p-4 text-[12px]" style={{ borderColor: "#E2E6E8", color: "#667179" }}><input type="checkbox" checked={form.agree} onChange={(e) => setField("agree", e.target.checked)} /><span>{quoteRequired ? "I confirm these details can be sent as a quote request for manual review." : "I confirm the order details are correct and understand this payment step is currently a frontend placeholder until the live payment integration is connected."}</span></label></div>}
            {step === 8 && <div className="rounded-[18px] border bg-[#F8FBFC] p-6 text-center" style={{ borderColor: "#E2E6E8" }}><div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[rgb(24,167,208)] text-white"><Check className="h-6 w-6" /></div><div className="mt-4 text-[28px] font-black tracking-[-0.04em]" style={{ color: "#121517" }}>{quoteRequired ? "Quote request submitted" : submitState?.success === false ? "Order submitted with fallback state" : "Order submitted"}</div><p className="mx-auto mt-3 max-w-[600px] text-[13px] leading-7" style={{ color: "#667179" }}>{submitState?.message || "This confirmation page is ready to connect to your real payment and order APIs."}</p>{quoteSubmitState?.quoteRequest?.id ? <div className="mt-3 text-[12px] font-bold" style={{ color: "rgb(24, 167, 208)" }}>Quote ID: {quoteSubmitState.quoteRequest.id}</div> : null}<div className="mt-4 rounded-[14px] border bg-white px-4 py-4 text-left text-[12px]" style={{ borderColor: "#E2E6E8", color: "#667179" }}><div><b>Checkout total:</b> {currency(total)}</div><div className="mt-1"><b>Artwork route:</b> {artworkState.mode === "later" ? "Upload later" : "Uploaded during checkout"}</div><div className="mt-1"><b>Flow:</b> {quoteRequired ? "Quote request" : form.paymentMethod}</div></div><div className="mt-5 flex flex-wrap justify-center gap-3"><button onClick={() => navigate("/account")} className="rounded-full bg-[#121517] px-5 py-3 text-[12px] font-bold text-white">Go to account</button><button onClick={() => navigate("/artwork-upload")} className="rounded-full border px-5 py-3 text-[12px] font-bold" style={{ borderColor: "#E2E6E8", color: "#121517", backgroundColor: "white" }}>Artwork handoff</button></div></div>}
            {step < 8 && <div className="mt-6 flex items-center justify-between gap-3"><button disabled={step === 1} onClick={() => setStep((s) => Math.max(1, s - 1))} className="rounded-full border px-5 py-3 text-[12px] font-bold disabled:opacity-50" style={{ borderColor: "#E2E6E8", color: "#121517", backgroundColor: "white" }}>Back</button>{step < 7 && <button disabled={!canContinue} onClick={() => setStep((s) => s + 1)} className="rounded-full bg-[rgb(24,167,208)] px-5 py-3 text-[12px] font-bold text-white disabled:opacity-50">Continue</button>}{step === 7 && <button disabled={submitting || !canContinue} onClick={handleSubmit} className="rounded-full bg-[#121517] px-5 py-3 text-[12px] font-bold text-white disabled:opacity-50">{submitting ? "Submitting..." : quoteRequired ? "Submit quote request" : "Place order"}</button>}</div>}
          </div>

          <div className="rounded-[22px] border bg-white p-5 shadow-[0_14px_30px_rgba(0,0,0,0.038)] lg:sticky lg:top-24" style={{ borderColor: "#E2E6E8", height: "fit-content" }}><div className="text-[20px] font-black tracking-[-0.03em]" style={{ color: "#121517" }}>Order summary</div><div className="mt-4 grid gap-3">{checkoutItems.length === 0 ? <div className="rounded-[14px] border bg-[#FBFCFD] px-4 py-4 text-[12px]" style={{ borderColor: "#E2E6E8", color: "#667179" }}>Your cart is empty.</div> : checkoutItems.map((item) => <div key={item.id} className="rounded-[14px] border bg-[#FBFCFD] px-4 py-4" style={{ borderColor: item.checkoutBlocked || item.quoteRequired ? "#FACC15" : "#E2E6E8" }}><div className="flex items-start justify-between gap-3"><div><div className="text-[13px] font-bold" style={{ color: "#121517" }}>{item.name}</div><div className="mt-1 text-[11px]" style={{ color: "#667179" }}>Qty {itemQty(item)}</div>{item.quoteRequired || item.checkoutBlocked ? <div className="mt-2 rounded-full bg-amber-100 px-2 py-1 text-[10px] font-bold text-amber-800">Quote/manual review</div> : null}{item.resolverError ? <div className="mt-2 text-[10px] text-amber-700">{item.resolverError}</div> : null}</div><div className="text-[13px] font-black" style={{ color: "#121517" }}>{currency(Number(item.price || 0) * itemQty(item))}</div></div></div>)}</div><div className="mt-5 space-y-3 text-[12px]" style={{ color: "#667179" }}><div className="flex justify-between"><span>Subtotal</span><span>{currency(subtotal)}</span></div><div className="flex justify-between"><span>VAT</span><span>{currency(vat)}</span></div><div className="flex justify-between"><span>Delivery</span><span>{currency(deliveryFee)}</span></div></div><div className="mt-4 border-t pt-4" style={{ borderColor: "#E2E6E8" }}><div className="flex justify-between text-[16px] font-black" style={{ color: "#121517" }}><span>Total</span><span>{currency(total)}</span></div></div><div className="mt-5 rounded-[14px] border bg-[#F8FBFC] p-4 text-[12px]" style={{ borderColor: "#E2E6E8", color: "#667179" }}><div className="flex items-center gap-2 font-bold" style={{ color: "#121517" }}><ShieldCheck className="h-4 w-4" style={{ color: "rgb(24, 167, 208)" }} />Resolver checkout</div><div className="mt-2">Delivery comes from internal delivery settings when available. Quote products are sent to quote request instead of normal payment.</div></div></div>
        </div>
      </div>
    </section>
  );
}
