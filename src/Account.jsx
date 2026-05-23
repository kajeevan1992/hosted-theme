import React, { useEffect, useState } from "react";
import { getCustomerEmail, getOrders, setCustomerEmail } from "./services_api";

function currency(v){return new Intl.NumberFormat("en-GB",{style:"currency",currency:"GBP"}).format(v||0);}
function nice(value){return String(value||'').replace(/_/g,' ').replace(/-/g,' ');}

function State({title,text,children}){
  return <div className="p-6 border rounded-[18px] text-[12px] bg-white shadow-[0_14px_34px_rgba(0,0,0,0.04)]" style={{borderColor:"#E3E8F0",color:"#667487"}}>
    <b className="text-[18px]" style={{color:"#161A22"}}>{title}</b>
    <div className="mt-2 leading-6">{text}</div>
    {children}
  </div>
}

function Pill({children,tone='blue'}){
  const map={blue:['#EAF7FC','#18A7D0'],green:['#ECFDF5','#059669'],amber:['#FFFBEB','#B45309'],red:['#FEF2F2','#DC2626'],dark:['#F3F4F6','#111827']};
  const [bg,fg]=map[tone]||map.blue;
  return <span className="px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-[0.12em]" style={{borderColor:'#E3E8F0',background:bg,color:fg}}>{children}</span>
}
function toneFor(status){const s=String(status||'').toLowerCase();if(s.includes('approved')||s.includes('production')||s.includes('dispatched'))return 'green';if(s.includes('pending')||s.includes('awaiting')||s.includes('quality'))return 'amber';if(s.includes('reject')||s.includes('replacement')||s.includes('block'))return 'red';return 'blue';}

export default function Account({navigate,setSelectedOrder}){
  const [orders,setOrders]=useState([]);
  const [loading,setLoading]=useState(false);
  const [email,setEmail]=useState(()=>getCustomerEmail()||'');
  const [message,setMessage]=useState('');

  async function load(nextEmail=email){
    const clean=String(nextEmail||'').trim();
    setCustomerEmail(clean);
    if(!clean){setOrders([]);setMessage('Enter your order email to view live order and artwork status.');return;}
    setLoading(true);setMessage('');
    try{const r=await getOrders({email:clean});setOrders(Array.isArray(r)?r:[]);}catch(error){setMessage(error instanceof Error?error.message:'Could not load orders.');setOrders([]);}finally{setLoading(false);}
  }

  useEffect(()=>{ if(email) void load(email); else setLoading(false); },[]);

  return <section className="py-8">
    <div className="mx-auto max-w-[1100px] px-4">
      <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#7B3FE4]">Customer dashboard</div>
          <h1 className="text-[30px] font-black tracking-[-0.04em]">Your print orders</h1>
          <p className="mt-1 text-[12px] text-[#667487]">Track order status, artwork approval, production and delivery from the hosted storefront.</p>
        </div>
        <button onClick={()=>navigate('/checkout')} className="px-4 py-2 bg-black text-white rounded-full text-[11px] font-bold uppercase tracking-[0.08em]">Start order</button>
      </div>

      <div className="mb-4 grid gap-3 md:grid-cols-[1fr_auto] p-4 border rounded-[18px] bg-white" style={{borderColor:'#E3E8F0'}}>
        <input value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Enter the email used at checkout" className="h-11 rounded-[14px] border px-4 text-[13px] outline-none" style={{borderColor:'#E3E8F0'}} />
        <button onClick={()=>void load(email)} className="px-5 py-2 bg-black text-white rounded-full text-[11px] font-bold uppercase tracking-[0.08em]">Load orders</button>
      </div>

      {message && <State title="Account lookup" text={message} />}
      {loading && <State title="Loading orders" text="Fetching your latest jobs, artwork status and production updates." />}
      {!loading && !message && orders.length===0 && <State title="No orders found" text="No orders were found for this email yet. Start your first print job and this dashboard will show live updates."><div className="mt-4 flex gap-3"><button onClick={()=>navigate('/checkout')} className="px-4 py-2 bg-black text-white rounded-full text-[11px] font-bold uppercase tracking-[0.08em]">Start your first print job</button><button onClick={()=>navigate('/all-products')} className="px-4 py-2 border rounded-full text-[11px] font-bold uppercase tracking-[0.08em]">Browse products</button></div></State>}

      <div className="grid gap-4 mt-4">
        {orders.map((o,i)=>(
          <div key={o.id||i} className="p-5 border rounded-[18px] bg-white shadow-[0_14px_34px_rgba(0,0,0,0.04)]" style={{borderColor:"#E3E8F0"}}>
            <div className="flex flex-wrap justify-between items-start gap-3">
              <div>
                <b className="text-[16px]">Order #{o.orderNumber||o.id||i+1}</b>
                <div className="mt-1 text-[12px] text-[#667487]">Created {o.created_at ? new Date(o.created_at).toLocaleDateString() : 'Pending sync'}</div>
              </div>
              <Pill tone={toneFor(o.status)}>{nice(o.status||'Processing')}</Pill>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-[1fr_150px_150px_150px_170px]">
              <div className="rounded-[14px] border bg-[#FBFCFF] px-4 py-3 text-[12px]" style={{borderColor:'#E3E8F0'}}><div className="font-bold text-[#161A22]">Order summary</div><div className="mt-1 text-[#667487]">Total {currency(o.total)}</div><div className="mt-1 text-[#667487]">{(o.items||[]).length} item(s)</div></div>
              <div className="rounded-[14px] border bg-[#FBFCFF] px-4 py-3 text-[12px]" style={{borderColor:'#E3E8F0'}}><div className="font-bold text-[#161A22]">Artwork</div><div className="mt-1 text-[#667487]">{nice(o.artwork?.status||o.artwork_status||'Awaiting artwork')}</div></div>
              <div className="rounded-[14px] border bg-[#FBFCFF] px-4 py-3 text-[12px]" style={{borderColor:'#E3E8F0'}}><div className="font-bold text-[#161A22]">Production</div><div className="mt-1 text-[#667487]">{nice(o.production?.status||'Not started')}</div></div>
              <div className="rounded-[14px] border bg-[#FBFCFF] px-4 py-3 text-[12px]" style={{borderColor:'#E3E8F0'}}><div className="font-bold text-[#161A22]">Delivery</div><div className="mt-1 text-[#667487]">{nice(o.deliveryStatus?.status||o.delivery||'Standard')}</div></div>
              <div className="flex flex-col gap-2"><button onClick={()=>{setSelectedOrder(o);navigate('/account/order')}} className="px-3 py-2 bg-black text-white rounded-full text-[11px] font-bold uppercase tracking-[0.08em]">View order</button><button onClick={()=>navigate('/artwork-upload')} className="px-3 py-2 border rounded-full text-[11px] font-bold uppercase tracking-[0.08em]">Upload artwork</button></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
}