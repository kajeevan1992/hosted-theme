import React, { useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, FileUp, Loader2, ShieldCheck } from "lucide-react";
import { getReuploadContext, submitReplacementArtwork } from "./services_api";

function nice(value){return String(value||'').replace(/_/g,' ').replace(/-/g,' ');}
function StatusBox({tone='blue',title,text}){
  const colours={blue:['#EAF7FC','#127B98'],green:['#ECFDF5','#047857'],red:['#FEF2F2','#DC2626'],amber:['#FFFBEB','#B45309']};
  const [bg,fg]=colours[tone]||colours.blue;
  return <div className="rounded-[16px] border p-4 text-[12px] leading-6" style={{borderColor:'#E3E8F0',background:bg,color:fg}}><b className="block text-[14px]">{title}</b>{text}</div>;
}

export default function ArtworkReupload({navigate}){
  const token=useMemo(()=>new URLSearchParams(window.location.search).get('token')||'',[]);
  const [upload,setUpload]=useState(null);
  const [file,setFile]=useState(null);
  const [loading,setLoading]=useState(true);
  const [sending,setSending]=useState(false);
  const [error,setError]=useState('');
  const [done,setDone]=useState(false);

  useEffect(()=>{
    let mounted=true;
    async function load(){
      setLoading(true);setError('');
      try{const result=await getReuploadContext(token);if(mounted)setUpload(result?.upload||result);}catch(err){if(mounted)setError(err instanceof Error?err.message:'This artwork upload link is invalid or expired.');}
      finally{if(mounted)setLoading(false);}
    }
    if(token) void load(); else {setError('Missing re-upload token. Please open the link from your email.');setLoading(false);}
    return()=>{mounted=false};
  },[token]);

  async function submit(){
    if(!file){setError('Please choose a replacement artwork file first.');return;}
    setSending(true);setError('');
    try{const result=await submitReplacementArtwork(token,file);setUpload(result?.upload||result);setDone(true);}
    catch(err){setError(err instanceof Error?err.message:'Replacement artwork upload failed.');}
    finally{setSending(false);}
  }

  return <section className="py-8">
    <div className="mx-auto max-w-[980px] px-4">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#7B3FE4]">Customer artwork</div>
          <h1 className="text-[32px] font-black tracking-[-0.04em]">Upload replacement artwork</h1>
          <p className="mt-2 text-[12px] leading-6 text-[#667487]">Use this secure link to replace artwork requested by our prepress/admin team.</p>
        </div>
        <button onClick={()=>navigate('/account')} className="px-4 py-2 border rounded-full text-[11px] font-bold uppercase tracking-[0.08em]">Back to account</button>
      </div>

      {loading && <StatusBox title="Checking link" text="Loading your artwork request securely." />}
      {error && <div className="mb-4"><StatusBox tone="red" title="Unable to continue" text={error} /></div>}
      {done && <div className="mb-4"><StatusBox tone="green" title="Replacement received" text="Your replacement artwork has been uploaded and sent back for review. We will check it before production continues." /></div>}

      {!loading && upload && <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <div className="rounded-[22px] border bg-white p-5 shadow-[0_14px_34px_rgba(0,0,0,0.04)]" style={{borderColor:'#E3E8F0'}}>
          <div className="flex items-start gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-[14px] bg-[#EAF7FC]"><FileUp className="h-5 w-5 text-[#18A7D0]" /></div>
            <div>
              <div className="text-[16px] font-black text-[#161A22]">Requested file replacement</div>
              <div className="mt-1 text-[12px] text-[#667487]">Previous file: {upload.originalName||'Artwork file'}</div>
              <div className="mt-1 text-[12px] text-[#667487]">Status: {nice(upload.reviewStatus||'replacement requested')}</div>
            </div>
          </div>

          {upload.reviewNote && <div className="mt-5 rounded-[16px] border bg-[#FFFBEB] p-4 text-[12px] leading-6 text-[#92400E]" style={{borderColor:'#FDE68A'}}><b>Reason from artwork team:</b><br />{upload.reviewNote}</div>}

          <div className="mt-5 rounded-[18px] border border-dashed p-6 text-center" style={{borderColor:'#CBD5E1',background:'#FBFCFF'}}>
            <input id="replacement-artwork" type="file" accept="application/pdf,image/*,.pdf,.ai,.eps,.indd,.jpg,.jpeg,.png,.tif,.tiff" className="hidden" onChange={(e)=>setFile(e.target.files?.[0]||null)} />
            <label htmlFor="replacement-artwork" className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-black px-5 py-3 text-[12px] font-bold text-white"><FileUp className="h-4 w-4" /> Choose replacement file</label>
            <div className="mt-3 text-[12px] text-[#667487]">{file?`${file.name} · ${(file.size/1024/1024).toFixed(2)} MB`:'PDF preferred. Add bleed and embed fonts where possible.'}</div>
          </div>

          <button onClick={()=>void submit()} disabled={!file||sending} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#18A7D0] px-5 py-3 text-[12px] font-bold uppercase tracking-[0.08em] text-white disabled:opacity-60">
            {sending?<Loader2 className="h-4 w-4 animate-spin" />:<CheckCircle2 className="h-4 w-4" />} Submit replacement artwork
          </button>
        </div>

        <div className="grid gap-4">
          <div className="rounded-[20px] border bg-white p-5" style={{borderColor:'#E3E8F0'}}>
            <ShieldCheck className="h-5 w-5 text-[#18A7D0]" />
            <div className="mt-3 text-[15px] font-bold text-[#161A22]">Before uploading</div>
            <ul className="mt-3 grid gap-2 text-[12px] leading-6 text-[#667487]">
              <li>• Supply print-ready PDF where possible.</li>
              <li>• Use the correct product size.</li>
              <li>• Add 3mm bleed if required.</li>
              <li>• Embed fonts and use high-resolution images.</li>
            </ul>
          </div>
          <div className="rounded-[20px] border bg-white p-5" style={{borderColor:'#E3E8F0'}}>
            <AlertCircle className="h-5 w-5 text-[#B45309]" />
            <div className="mt-3 text-[15px] font-bold text-[#161A22]">What happens next?</div>
            <p className="mt-3 text-[12px] leading-6 text-[#667487]">Your new file will go back to artwork review. If it passes, production can continue automatically from your order workflow.</p>
          </div>
        </div>
      </div>}
    </div>
  </section>
}
