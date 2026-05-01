
import React, { useEffect, useState } from "react";
import { getOrders } from "./services_api";

function currency(v){return new Intl.NumberFormat("en-GB",{style:"currency",currency:"GBP"}).format(v||0);}

function State({title,text,children}){
  return <div className="p-6 border rounded-[18px] text-[12px] bg-white shadow-[0_14px_34px_rgba(0,0,0,0.04)]" style={{borderColor:"#E3E8F0",color:"#667487"}}>
    <b className="text-[18px]" style={{color:"#161A22"}}>{title}</b>
    <div className="mt-2 leading-6">{text}</div>
    {children}
  </div>
}

export default function Account({navigate,setSelectedOrder}){
  const [orders,setOrders]=useState([]);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    getOrders().then(r=>{
      setOrders(Array.isArray(r)?r:[]);
      setLoading(false);
    });
  },[]);

  return <section className="py-8">
    <div className="mx-auto max-w-[1100px] px-4">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#7B3FE4]">Customer dashboard</div>
          <h1 className="text-[30px] font-black tracking-[-0.04em]">Your print orders</h1>
        </div>
        <button onClick={()=>navigate('/checkout')} className="px-4 py-2 bg-black text-white rounded-full text-[11px] font-bold uppercase tracking-[0.08em]">Start order</button>
      </div>

      {loading && <State title="Loading orders" text="Fetching your latest jobs safely." />}
      {!loading && orders.length===0 && <State title="No orders yet" text="Start your first print job and this dashboard will fill with order updates, artwork requests and delivery tracking."><div className="mt-4 flex gap-3"><button onClick={()=>navigate('/checkout')} className="px-4 py-2 bg-black text-white rounded-full text-[11px] font-bold uppercase tracking-[0.08em]">Start your first print job</button><button onClick={()=>navigate('/all-products')} className="px-4 py-2 border rounded-full text-[11px] font-bold uppercase tracking-[0.08em]">Browse products</button></div></State>}

      <div className="grid gap-4 mt-4">
        {orders.map((o,i)=>(
          <div key={i} className="p-5 border rounded-[18px] bg-white shadow-[0_14px_34px_rgba(0,0,0,0.04)]" style={{borderColor:"#E3E8F0"}}>
            <div className="flex justify-between items-start gap-3">
              <div>
                <b className="text-[16px]">Order #{o.id||i+1}</b>
                <div className="mt-1 text-[12px] text-[#667487]">Created {o.created_at || 'Pending sync'}</div>
              </div>
              <span className="px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-[0.12em] text-[#18A7D0]" style={{borderColor:'#E3E8F0'}}>{o.status||'Processing'}</span>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-[1fr_150px_150px_170px]">
              <div className="rounded-[14px] border bg-[#FBFCFF] px-4 py-3 text-[12px]" style={{borderColor:'#E3E8F0'}}>
                <div className="font-bold text-[#161A22]">Order summary</div>
                <div className="mt-1 text-[#667487]">Total {currency(o.total)}</div>
              </div>
              <div className="rounded-[14px] border bg-[#FBFCFF] px-4 py-3 text-[12px]" style={{borderColor:'#E3E8F0'}}>
                <div className="font-bold text-[#161A22]">Artwork</div>
                <div className="mt-1 text-[#667487]">{o.artwork_status||'Awaiting artwork'}</div>
              </div>
              <div className="rounded-[14px] border bg-[#FBFCFF] px-4 py-3 text-[12px]" style={{borderColor:'#E3E8F0'}}>
                <div className="font-bold text-[#161A22]">Delivery</div>
                <div className="mt-1 text-[#667487]">{o.delivery||'Standard'}</div>
              </div>
              <div className="flex flex-col gap-2">
                <button onClick={()=>{setSelectedOrder(o);navigate('/account/order')}} className="px-3 py-2 bg-black text-white rounded-full text-[11px] font-bold uppercase tracking-[0.08em]">View order</button>
                <button onClick={()=>navigate('/artwork-upload')} className="px-3 py-2 border rounded-full text-[11px] font-bold uppercase tracking-[0.08em]">Upload artwork</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
}
