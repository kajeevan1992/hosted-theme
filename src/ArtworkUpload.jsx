import React, { useEffect, useMemo, useState } from "react";
import { Upload, Image as ImageIcon, FileText, Check, AlertCircle } from "lucide-react";
import { getReuploadContext, submitReplacementArtwork, uploadArtwork } from "./services_api";

function Status({ success, error }) {
  if (success) return <div className="mt-4 flex items-start gap-2 rounded-[12px] border bg-[#F1FAFD] px-4 py-3 text-[12px]" style={{ borderColor: "#BEE9F4", color: "#0F172A" }}><Check className="mt-0.5 h-4 w-4" style={{ color: "rgb(24, 167, 208)" }} />{success}</div>;
  if (error) return <div className="mt-4 flex items-start gap-2 rounded-[12px] border bg-[#FFF5F5] px-4 py-3 text-[12px]" style={{ borderColor: "#F1C4C4", color: "#7F1D1D" }}><AlertCircle className="mt-0.5 h-4 w-4" />{error}</div>;
  return null;
}

export default function ArtworkUpload({ navigate }) {
  const token = useMemo(() => new URLSearchParams(window.location.search).get("token") || "", []);
  const isReupload = Boolean(token);
  const [orderRef, setOrderRef] = useState("");
  const [mode, setMode] = useState(isReupload ? "replacement" : "order");
  const [file, setFile] = useState(null);
  const [context, setContext] = useState(null);
  const [status, setStatus] = useState({ loading: false, success: "", error: "" });

  useEffect(() => {
    let mounted = true;
    async function loadReupload() {
      if (!token) return;
      setStatus({ loading: true, success: "", error: "" });
      try {
        const result = await getReuploadContext(token);
        if (!mounted) return;
        setContext(result?.upload || result);
        setStatus({ loading: false, success: "", error: "" });
      } catch (error) {
        if (!mounted) return;
        setStatus({ loading: false, success: "", error: error instanceof Error ? error.message : "This artwork re-upload link is invalid or expired." });
      }
    }
    void loadReupload();
    return () => { mounted = false; };
  }, [token]);

  async function handleSubmit() {
    if (!file) {
      setStatus({ loading: false, success: "", error: "Please choose a file before uploading." });
      return;
    }
    setStatus({ loading: true, success: "", error: "" });
    try {
      if (isReupload) {
        const res = await submitReplacementArtwork(token, file);
        setContext(res?.upload || res);
        setStatus({ loading: false, success: "Replacement artwork uploaded successfully. It is now back with our artwork team for review.", error: "" });
        return;
      }
      const res = await uploadArtwork(file, { order_reference: orderRef, handoff_mode: mode });
      if (res?.success || res?.id || res?.url) setStatus({ loading: false, success: "Artwork uploaded successfully. This route is ready to be linked to real order-level handoff logic.", error: "" });
      else setStatus({ loading: false, success: "", error: res?.message || "Artwork upload failed. You can still submit artwork later through support." });
    } catch (error) {
      setStatus({ loading: false, success: "", error: error instanceof Error ? error.message : "Artwork upload failed." });
    }
  }

  return (
    <section className="py-6">
      <div className="mx-auto max-w-[1000px] px-4 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: "rgb(24, 167, 208)" }}>{isReupload ? "Replacement artwork" : "Artwork handoff"}</div>
            <h1 className="mt-2 text-[34px] font-black tracking-[-0.04em]" style={{ color: "#121517" }}>{isReupload ? "Upload replacement artwork" : "Upload artwork (Step 1) for your print order"}</h1>
            <p className="mt-2 max-w-[760px] text-[12px] leading-6" style={{ color: "#667179" }}>{isReupload ? "Use the secure email link to replace artwork requested by our prepress team." : "A dedicated artwork handoff route for upload-now or upload-later workflows, with safer fallback messaging if the API is unavailable."}</p>
          </div>
          <button onClick={() => navigate("/account")} className="rounded-full border px-4 py-2 text-[12px] font-bold" style={{ borderColor: "#E2E6E8", color: "#121517", backgroundColor: "white" }}>Back to account</button>
        </div>

        {isReupload && context && <div className="mb-5 rounded-[18px] border bg-[#FFFBEB] p-4 text-[12px] leading-6" style={{ borderColor: "#FDE68A", color: "#92400E" }}><b>Artwork team note:</b><br />{context.reviewNote || "Replacement artwork has been requested for this order."}<div className="mt-2 text-[#667179]">Previous file: {context.originalName || "Artwork file"}</div></div>}

        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="rounded-[22px] border bg-white p-5 shadow-[0_12px_28px_rgba(0,0,0,0.03)]" style={{ borderColor: "#E2E6E8" }}>
            {!isReupload && <div className="grid gap-4 md:grid-cols-2">
              <button onClick={() => setMode("order")} className="rounded-[16px] border bg-white p-4 text-left" style={{ borderColor: mode === "order" ? "rgb(24, 167, 208)" : "#E2E6E8", boxShadow: mode === "order" ? "inset 0 0 0 1px rgb(24, 167, 208)" : "none" }}><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-[#F1FAFD]" style={{ color: "rgb(24, 167, 208)" }}><FileText className="h-5 w-5" /></div><div><div className="text-[14px] font-bold" style={{ color: "#121517" }}>Link to order reference</div><div className="text-[12px]" style={{ color: "#667179" }}>Use this when the customer already has an order number.</div></div></div></button>
              <button onClick={() => setMode("general")} className="rounded-[16px] border bg-white p-4 text-left" style={{ borderColor: mode === "general" ? "rgb(24, 167, 208)" : "#E2E6E8", boxShadow: mode === "general" ? "inset 0 0 0 1px rgb(24, 167, 208)" : "none" }}><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-[#F1FAFD]" style={{ color: "rgb(24, 167, 208)" }}><Upload className="h-5 w-5" /></div><div><div className="text-[14px] font-bold" style={{ color: "#121517" }}>General artwork upload</div><div className="text-[12px]" style={{ color: "#667179" }}>Use this if the order will be linked later by support.</div></div></div></button>
            </div>}
            {!isReupload && mode === "order" && <div className="mt-5"><label className="mb-2 block text-[12px] font-bold" style={{ color: "#121517" }}>Order reference</label><input value={orderRef} onChange={(e) => setOrderRef(e.target.value)} className="h-11 w-full rounded-xl border px-3 text-[13px]" placeholder="Order #12345" style={{ borderColor: "#E2E6E8" }} /></div>}
            <div className="mt-5 rounded-[18px] border bg-[#FBFCFD] p-5" style={{ borderColor: "#E2E6E8" }}><div className="text-[14px] font-bold" style={{ color: "#121517" }}>{isReupload ? "Replacement file" : "Artwork file"}</div><p className="mt-1 text-[12px] leading-6" style={{ color: "#667179" }}>{isReupload ? "Upload the corrected artwork file. PDF is preferred." : "Upload print-ready files now, or use this as a placeholder until full order-linked artwork management is connected."}</p><div className="mt-4 grid gap-3"><input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />{file && <div className="flex items-center justify-between rounded-[12px] border bg-white px-4 py-3 text-[12px]" style={{ borderColor: "#E2E6E8" }}><div className="flex items-center gap-2" style={{ color: "#121517" }}><ImageIcon className="h-4 w-4" />{file.name}</div><div style={{ color: "#667179" }}>{Math.round(file.size / 1024)} KB</div></div>}<button onClick={handleSubmit} disabled={status.loading} className="rounded-full bg-[#121517] px-5 py-3 text-[12px] font-bold text-white disabled:opacity-50">{status.loading ? "Uploading..." : isReupload ? "Submit replacement artwork" : "Upload artwork (Step 1)"}</button></div><Status success={status.success} error={status.error} /></div>
          </div>
          <div className="rounded-[22px] border bg-white p-5 shadow-[0_12px_28px_rgba(0,0,0,0.03)]" style={{ borderColor: "#E2E6E8", height: "fit-content" }}><div className="text-[20px] font-black tracking-[-0.03em]" style={{ color: "#121517" }}>Artwork guidance</div><div className="mt-4 grid gap-3 text-[12px]" style={{ color: "#667179" }}><div className="rounded-[14px] border bg-[#FBFCFD] px-4 py-3" style={{ borderColor: "#E2E6E8" }}>Use CMYK colour mode and 300 dpi artwork where possible.</div><div className="rounded-[14px] border bg-[#FBFCFD] px-4 py-3" style={{ borderColor: "#E2E6E8" }}>Include bleed and keep important content away from trim edges.</div><div className="rounded-[14px] border bg-[#FBFCFD] px-4 py-3" style={{ borderColor: "#E2E6E8" }}>If artwork upload is unavailable, the UI will fail gracefully instead of crashing.</div></div></div>
        </div>
      </div>
    </section>
  );
}