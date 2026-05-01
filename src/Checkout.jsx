
import React, { useMemo, useState } from "react";
import { Check, Upload, Image as ImageIcon, FileText, Truck, CreditCard, ShieldCheck } from "lucide-react";
import { createOrder, uploadArtwork } from "./services_api";

const STEPS = ["Customer", "Company", "Billing & delivery", "Delivery", "Artwork", "Review", "Payment", "Confirm"];

function currency(value) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(value || 0);
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

export default function Checkout({ cart, navigate }) {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitState, setSubmitState] = useState(null);
  const [artworkState, setArtworkState] = useState({ mode: "later", file: null, uploaded: null, error: "" });
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    companyName: "", vatNumber: "",
    billingAddress1: "", billingAddress2: "", billingCity: "", billingPostcode: "", billingCountry: "United Kingdom",
    sameAsBilling: true,
    deliveryAddress1: "", deliveryAddress2: "", deliveryCity: "", deliveryPostcode: "", deliveryCountry: "United Kingdom",
    delivery: "Standard (3–5 working days)",
    paymentMethod: "Pay now",
    notes: "",
    agree: false,
  });

  const items = cart?.items || [];
  const subtotal = cart?.subtotal || 0;
  const vat = subtotal * 0.2;
  const deliveryFee = form.delivery.startsWith("Express") ? 9.95 : form.delivery.startsWith("Priority") ? 14.95 : 0;
  const total = subtotal + vat + deliveryFee;
  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const canContinue = useMemo(() => {
    if (step === 1) return !!form.firstName && !!form.lastName && !!form.email;
    if (step === 3) {
      const billingOk = !!form.billingAddress1 && !!form.billingCity && !!form.billingPostcode;
      const deliveryOk = form.sameAsBilling || (!!form.deliveryAddress1 && !!form.deliveryCity && !!form.deliveryPostcode);
      return billingOk && deliveryOk;
    }
    if (step === 5) return artworkState.mode === "later" || !!artworkState.file || !!artworkState.uploaded;
    if (step === 7) return !!form.paymentMethod && form.agree;
    return true;
  }, [step, form, artworkState]);

  async function handleArtworkUpload() {
    if (!artworkState.file) return;
    const res = await uploadArtwork(artworkState.file, { mode: artworkState.mode });
    if (res?.success || res?.id || res?.url) setArtworkState((prev) => ({ ...prev, uploaded: res, error: "" }));
    else setArtworkState((prev) => ({ ...prev, error: res?.message || "Artwork upload failed. You can still upload later." }));
  }

  async function handleSubmit() {
    setSubmitting(true);
    const payload = {
      customer: { first_name: form.firstName, last_name: form.lastName, email: form.email, phone: form.phone, company_name: form.companyName, vat_number: form.vatNumber },
      billing_address: { address1: form.billingAddress1, address2: form.billingAddress2, city: form.billingCity, postcode: form.billingPostcode, country: form.billingCountry },
      delivery_address: form.sameAsBilling ? { address1: form.billingAddress1, address2: form.billingAddress2, city: form.billingCity, postcode: form.billingPostcode, country: form.billingCountry } : { address1: form.deliveryAddress1, address2: form.deliveryAddress2, city: form.deliveryCity, postcode: form.deliveryPostcode, country: form.deliveryCountry },
      delivery: form.delivery,
      payment_method: form.paymentMethod,
      notes: form.notes,
      artwork_mode: artworkState.mode,
      artwork_reference: artworkState.uploaded || null,
      items: items.map((item) => ({ name: item.name, qty: item.qty, price: item.price, config: item.config || {} })),
      totals: { subtotal, vat, delivery: deliveryFee, total },
    };
    const res = await createOrder(payload);
    setSubmitting(false);
    setSubmitState(res);
    setStep(8);
  }

  return (
    <section className="py-6">
      <div className="mx-auto max-w-[1000px] px-4 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: "rgb(24, 167, 208)" }}>Checkout</div>
            <h1 className="mt-2 text-[28px] font-black tracking-[-0.04em]" style={{ color: "#121517" }}>Secure print order checkout (final review)</h1>
            <p className="mt-2 max-w-[760px] text-[12px] leading-6" style={{ color: "#667179" }}>A multi-step print-commerce flow with delivery, artwork, review and payment placeholders ready for live API integration.</p>
          </div>
          <button onClick={() => navigate("/cart")} className="rounded-full border px-4 py-2 text-[12px] font-bold" style={{ borderColor: "#E2E6E8", color: "#121517", backgroundColor: "white" }}>Back to cart</button>
        </div>

        <div className="mb-5 flex flex-wrap gap-2">{STEPS.map((label, i) => <StepPill key={label} label={label} index={i + 1} current={step} />)}</div>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="rounded-[22px] border bg-white p-5 shadow-[0_12px_28px_rgba(0,0,0,0.03)]" style={{ borderColor: "#E2E6E8" }}>
            {step === 1 && <div className="grid gap-4 sm:grid-cols-2"><Field label="First name"><input value={form.firstName} onChange={(e) => setField("firstName", e.target.value)} className="h-11 rounded-xl border px-3 text-[13px]" style={{ borderColor: "#E2E6E8" }} /></Field><Field label="Last name"><input value={form.lastName} onChange={(e) => setField("lastName", e.target.value)} className="h-11 rounded-xl border px-3 text-[13px]" style={{ borderColor: "#E2E6E8" }} /></Field><Field label="Email"><input value={form.email} onChange={(e) => setField("email", e.target.value)} className="h-11 rounded-xl border px-3 text-[13px]" style={{ borderColor: "#E2E6E8" }} /></Field><Field label="Phone" hint="Optional"><input value={form.phone} onChange={(e) => setField("phone", e.target.value)} className="h-11 rounded-xl border px-3 text-[13px]" style={{ borderColor: "#E2E6E8" }} /></Field></div>}
            {step === 2 && <div className="grid gap-4 sm:grid-cols-2"><Field label="Company name" hint="Optional"><input value={form.companyName} onChange={(e) => setField("companyName", e.target.value)} className="h-11 rounded-xl border px-3 text-[13px]" style={{ borderColor: "#E2E6E8" }} /></Field><Field label="VAT number" hint="Optional"><input value={form.vatNumber} onChange={(e) => setField("vatNumber", e.target.value)} className="h-11 rounded-xl border px-3 text-[13px]" style={{ borderColor: "#E2E6E8" }} /></Field><div className="sm:col-span-2 rounded-[16px] border bg-[#F8FBFC] p-4 text-[12px]" style={{ borderColor: "#E2E6E8", color: "#667179" }}>Add company details if this is a business order or if you need invoicing information on the order.</div></div>}
            {step === 3 && <div className="grid gap-5"><SectionCard title="Billing address" eyebrow="Billing"><div className="grid gap-4 sm:grid-cols-2"><div className="sm:col-span-2"><Field label="Address line 1"><input value={form.billingAddress1} onChange={(e) => setField("billingAddress1", e.target.value)} className="h-11 w-full rounded-xl border px-3 text-[13px]" style={{ borderColor: "#E2E6E8" }} /></Field></div><div className="sm:col-span-2"><Field label="Address line 2" hint="Optional"><input value={form.billingAddress2} onChange={(e) => setField("billingAddress2", e.target.value)} className="h-11 w-full rounded-xl border px-3 text-[13px]" style={{ borderColor: "#E2E6E8" }} /></Field></div><Field label="City"><input value={form.billingCity} onChange={(e) => setField("billingCity", e.target.value)} className="h-11 rounded-xl border px-3 text-[13px]" style={{ borderColor: "#E2E6E8" }} /></Field><Field label="Postcode"><input value={form.billingPostcode} onChange={(e) => setField("billingPostcode", e.target.value)} className="h-11 rounded-xl border px-3 text-[13px]" style={{ borderColor: "#E2E6E8" }} /></Field><Field label="Country"><input value={form.billingCountry} onChange={(e) => setField("billingCountry", e.target.value)} className="h-11 rounded-xl border px-3 text-[13px]" style={{ borderColor: "#E2E6E8" }} /></Field></div></SectionCard><label className="flex items-center gap-3 rounded-[14px] border bg-[#FBFCFD] px-4 py-3 text-[12px]" style={{ borderColor: "#E2E6E8", color: "#667179" }}><input type="checkbox" checked={form.sameAsBilling} onChange={(e) => setField("sameAsBilling", e.target.checked)} />Delivery address is the same as billing</label>{!form.sameAsBilling && <SectionCard title="Delivery address" eyebrow="Delivery"><div className="grid gap-4 sm:grid-cols-2"><div className="sm:col-span-2"><Field label="Address line 1"><input value={form.deliveryAddress1} onChange={(e) => setField("deliveryAddress1", e.target.value)} className="h-11 w-full rounded-xl border px-3 text-[13px]" style={{ borderColor: "#E2E6E8" }} /></Field></div><div className="sm:col-span-2"><Field label="Address line 2" hint="Optional"><input value={form.deliveryAddress2} onChange={(e) => setField("deliveryAddress2", e.target.value)} className="h-11 w-full rounded-xl border px-3 text-[13px]" style={{ borderColor: "#E2E6E8" }} /></Field></div><Field label="City"><input value={form.deliveryCity} onChange={(e) => setField("deliveryCity", e.target.value)} className="h-11 rounded-xl border px-3 text-[13px]" style={{ borderColor: "#E2E6E8" }} /></Field><Field label="Postcode"><input value={form.deliveryPostcode} onChange={(e) => setField("deliveryPostcode", e.target.value)} className="h-11 rounded-xl border px-3 text-[13px]" style={{ borderColor: "#E2E6E8" }} /></Field><Field label="Country"><input value={form.deliveryCountry} onChange={(e) => setField("deliveryCountry", e.target.value)} className="h-11 rounded-xl border px-3 text-[13px]" style={{ borderColor: "#E2E6E8" }} /></Field></div></SectionCard>}</div>}
            {step === 4 && <div className="grid gap-3">{[{ label: "Standard (3–5 working days)", fee: 0, desc: "Best-value default delivery option" }, { label: "Express (24–48 hours)", fee: 9.95, desc: "Faster production and dispatch" }, { label: "Priority same-day review", fee: 14.95, desc: "Urgent review and production queue" }].map((option) => { const active = form.delivery === option.label; return <button key={option.label} onClick={() => setField("delivery", option.label)} className="flex items-start justify-between rounded-[14px] border bg-white p-4 text-left shadow-[0_6px_16px_rgba(0,0,0,0.02)]" style={{ borderColor: active ? "rgb(24, 167, 208)" : "#E2E6E8", boxShadow: active ? "inset 0 0 0 1px rgb(24, 167, 208)" : "0 6px 16px rgba(0,0,0,0.02)" }}><div className="flex items-start gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-[#F1FAFD]" style={{ color: "rgb(24, 167, 208)" }}><Truck className="h-5 w-5" /></div><div><div className="text-[14px] font-bold" style={{ color: "#121517" }}>{option.label}</div><div className="mt-1 text-[12px]" style={{ color: "#667179" }}>{option.desc}</div></div></div><div className="text-[14px] font-black" style={{ color: "#121517" }}>{option.fee ? currency(option.fee) : "Free"}</div></button>})}</div>}
            {step === 5 && <div className="grid gap-4"><div className="grid gap-3 md:grid-cols-2"><button onClick={() => setArtworkState((p) => ({ ...p, mode: "now" }))} className="rounded-[16px] border bg-white p-4 text-left" style={{ borderColor: artworkState.mode === "now" ? "rgb(24, 167, 208)" : "#E2E6E8", boxShadow: artworkState.mode === "now" ? "inset 0 0 0 1px rgb(24, 167, 208)" : "none" }}><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-[#F1FAFD]" style={{ color: "rgb(24, 167, 208)" }}><Upload className="h-5 w-5" /></div><div><div className="text-[14px] font-bold" style={{ color: "#121517" }}>Upload artwork now</div><div className="text-[12px]" style={{ color: "#667179" }}>Attach files before placing the order.</div></div></div></button><button onClick={() => setArtworkState((p) => ({ ...p, mode: "later" }))} className="rounded-[16px] border bg-white p-4 text-left" style={{ borderColor: artworkState.mode === "later" ? "rgb(24, 167, 208)" : "#E2E6E8", boxShadow: artworkState.mode === "later" ? "inset 0 0 0 1px rgb(24, 167, 208)" : "none" }}><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-[#F1FAFD]" style={{ color: "rgb(24, 167, 208)" }}><FileText className="h-5 w-5" /></div><div><div className="text-[14px] font-bold" style={{ color: "#121517" }}>Upload artwork later</div><div className="text-[12px]" style={{ color: "#667179" }}>Place the order first and send files after.</div></div></div></button></div>{artworkState.mode === "now" && <SectionCard title="Artwork upload" eyebrow="Upload now"><div className="grid gap-3"><input type="file" onChange={(e) => setArtworkState((prev) => ({ ...prev, file: e.target.files?.[0] || null, uploaded: null, error: "" }))} />{artworkState.file && <div className="flex items-center justify-between rounded-[12px] border bg-white px-3 py-3 text-[12px]" style={{ borderColor: "#E2E6E8" }}><div className="flex items-center gap-2" style={{ color: "#121517" }}><ImageIcon className="h-4 w-4" /> {artworkState.file.name}</div><button onClick={handleArtworkUpload} className="rounded-full bg-[#121517] px-3 py-2 text-[11px] font-bold text-white">Upload file</button></div>}{artworkState.uploaded && <div className="text-[12px]" style={{ color: "rgb(24, 167, 208)" }}>Artwork uploaded successfully.</div>}{artworkState.error && <div className="text-[12px]" style={{ color: "#C23636" }}>{artworkState.error}</div>}</div></SectionCard>}{artworkState.mode === "later" && <SectionCard title="Upload later guidance" eyebrow="Artwork handoff"><div className="text-[12px] leading-6" style={{ color: "#667179" }}>You can place the order now and hand artwork over later. This route is useful when your design team is still preparing files.</div></SectionCard>}</div>}
            {step === 6 && <div className="grid gap-5"><SectionCard title="Order review" eyebrow="Final check"><div className="grid gap-2 text-[12px]" style={{ color: "#667179" }}><div><b>Customer:</b> {form.firstName} {form.lastName}</div><div><b>Email:</b> {form.email}</div><div><b>Billing:</b> {form.billingAddress1}, {form.billingCity}, {form.billingPostcode}</div><div><b>Delivery:</b> {form.sameAsBilling ? "Same as billing" : `${form.deliveryAddress1}, ${form.deliveryCity}, ${form.deliveryPostcode}`}</div><div><b>Shipping option:</b> {form.delivery}</div><div><b>Artwork:</b> {artworkState.mode === "later" ? "Upload later" : artworkState.uploaded ? "Uploaded now" : "Ready to upload"}</div></div></SectionCard><Field label="Order notes" hint="Optional"><textarea value={form.notes} onChange={(e) => setField("notes", e.target.value)} className="min-h-[140px] rounded-[14px] border px-3 py-3 text-[13px]" style={{ borderColor: "#E2E6E8" }} /></Field></div>}
            {step === 7 && <div className="grid gap-3">{["Pay now", "Invoice me later", "Request proforma invoice"].map((method) => <button key={method} onClick={() => setField("paymentMethod", method)} className="flex items-center justify-between rounded-[14px] border bg-white p-4 text-left shadow-[0_6px_16px_rgba(0,0,0,0.02)]" style={{ borderColor: form.paymentMethod === method ? "rgb(24, 167, 208)" : "#E2E6E8", boxShadow: form.paymentMethod === method ? "inset 0 0 0 1px rgb(24, 167, 208)" : "0 6px 16px rgba(0,0,0,0.02)" }}><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-[#F1FAFD]" style={{ color: "rgb(24, 167, 208)" }}><CreditCard className="h-5 w-5" /></div><div><div className="text-[14px] font-bold" style={{ color: "#121517" }}>{method}</div><div className="text-[12px]" style={{ color: "#667179" }}>Payment-step placeholder ready for gateway integration.</div></div></div>{form.paymentMethod === method && <Check className="h-5 w-5" style={{ color: "rgb(24, 167, 208)" }} />}</button>)}<label className="mt-2 flex items-start gap-3 rounded-[14px] border bg-[#FBFCFD] p-4 text-[12px]" style={{ borderColor: "#E2E6E8", color: "#667179" }}><input type="checkbox" checked={form.agree} onChange={(e) => setField("agree", e.target.checked)} /><span>I confirm the order details are correct and understand this payment step is currently a frontend placeholder until the live payment integration is connected.</span></label></div>}
            {step === 8 && <div className="rounded-[18px] border bg-[#F8FBFC] p-6 text-center" style={{ borderColor: "#E2E6E8" }}><div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[rgb(24,167,208)] text-white"><Check className="h-6 w-6" /></div><div className="mt-4 text-[28px] font-black tracking-[-0.04em]" style={{ color: "#121517" }}>{submitState?.success === false ? "Order submitted with fallback state" : "Order submitted"}</div><p className="mx-auto mt-3 max-w-[600px] text-[13px] leading-7" style={{ color: "#667179" }}>{submitState?.message || "This confirmation page is ready to connect to your real payment and order APIs."}</p><div className="mt-4 rounded-[14px] border bg-white px-4 py-4 text-left text-[12px]" style={{ borderColor: "#E2E6E8", color: "#667179" }}><div><b>Checkout total:</b> {currency(total)}</div><div className="mt-1"><b>Artwork route:</b> {artworkState.mode === "later" ? "Upload later" : "Uploaded during checkout (final review)"}</div><div className="mt-1"><b>Payment method:</b> {form.paymentMethod}</div></div><div className="mt-5 flex flex-wrap justify-center gap-3"><button onClick={() => navigate("/account")} className="rounded-full bg-[#121517] px-5 py-3 text-[12px] font-bold text-white">Go to account</button><button onClick={() => navigate("/artwork-upload")} className="rounded-full border px-5 py-3 text-[12px] font-bold" style={{ borderColor: "#E2E6E8", color: "#121517", backgroundColor: "white" }}>Artwork handoff</button></div></div>}
            {step < 8 && <div className="mt-6 flex items-center justify-between gap-3"><button disabled={step === 1} onClick={() => setStep((s) => Math.max(1, s - 1))} className="rounded-full border px-5 py-3 text-[12px] font-bold disabled:opacity-50" style={{ borderColor: "#E2E6E8", color: "#121517", backgroundColor: "white" }}>Back</button>{step < 7 && <button disabled={!canContinue} onClick={() => setStep((s) => s + 1)} className="rounded-full bg-[rgb(24,167,208)] px-5 py-3 text-[12px] font-bold text-white disabled:opacity-50">Continue</button>}{step === 7 && <button disabled={submitting || !canContinue} onClick={handleSubmit} className="rounded-full bg-[#121517] px-5 py-3 text-[12px] font-bold text-white disabled:opacity-50">{submitting ? "Submitting..." : "Place order"}</button>}</div>}
          </div>

          <div className="rounded-[22px] border bg-white p-5 shadow-[0_14px_30px_rgba(0,0,0,0.038)] lg:sticky lg:top-24" style={{ borderColor: "#E2E6E8", height: "fit-content" }}><div className="text-[20px] font-black tracking-[-0.03em]" style={{ color: "#121517" }}>Order summary</div><div className="mt-4 grid gap-3">{items.length === 0 ? <div className="rounded-[14px] border bg-[#FBFCFD] px-4 py-4 text-[12px]" style={{ borderColor: "#E2E6E8", color: "#667179" }}>Your cart is empty.</div> : items.map((item) => <div key={item.id} className="rounded-[14px] border bg-[#FBFCFD] px-4 py-4" style={{ borderColor: "#E2E6E8" }}><div className="flex items-start justify-between gap-3"><div><div className="text-[13px] font-bold" style={{ color: "#121517" }}>{item.name}</div><div className="mt-1 text-[11px]" style={{ color: "#667179" }}>Qty {item.qty}</div></div><div className="text-[13px] font-black" style={{ color: "#121517" }}>{currency(item.price * item.qty)}</div></div></div>)}</div><div className="mt-5 space-y-3 text-[12px]" style={{ color: "#667179" }}><div className="flex justify-between"><span>Subtotal</span><span>{currency(subtotal)}</span></div><div className="flex justify-between"><span>VAT</span><span>{currency(vat)}</span></div><div className="flex justify-between"><span>Delivery</span><span>{currency(deliveryFee)}</span></div></div><div className="mt-4 border-t pt-4" style={{ borderColor: "#E2E6E8" }}><div className="flex justify-between text-[16px] font-black" style={{ color: "#121517" }}><span>Total</span><span>{currency(total)}</span></div></div><div className="mt-5 rounded-[14px] border bg-[#F8FBFC] p-4 text-[12px]" style={{ borderColor: "#E2E6E8", color: "#667179" }}><div className="flex items-center gap-2 font-bold" style={{ color: "#121517" }}><ShieldCheck className="h-4 w-4" style={{ color: "rgb(24, 167, 208)" }} />Print-order guidance</div><div className="mt-2">Artwork can be uploaded now or after the order is placed. Delivery options and payment methods are ready for real API integration.</div></div></div>
        </div>
      </div>
    </section>
  );
}
