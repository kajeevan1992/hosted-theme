import React from "react";
import { openOrderDocument } from "./services_api";

function currency(v){return new Intl.NumberFormat("en-GB",{style:"currency",currency:"GBP"}).format(v||0);}
function nice(value){return String(value||'').replace(/_/g,' ').replace(/-/g,' ');}
function tone(status){const s=String(status||'').toLowerCase();if(s.includes('approved')||s.includes('production')||s.includes('dispatch')||s.includes('paid'))return '#059669';if(s.includes('pending')||s.includes('await')||s.includes('quality'))return '#B45309';if(s.includes('reject')||s.includes('replacement')||s.includes('block')||s.includes('fail')||s.includes('refund'))return '#DC2626';return '#18A7D0';}
function Card({title,children}){return <div className="p-4 border rounded-[16px] bg-white" style={{borderColor:'#E3E8F0'}}><b>{title}</b><div className="mt-2 text-[12px] leading-6 text-[#667487]">{children}</div></div>}
function Step({label,active}){return <div className="text-center p-3 border rounded-[14px]" style={{borderColor:active?'#18A7D0':'#E2E6E8',background:active?'#EAF7FC':'white',color:active?'#127B98':'#667487'}}><div className="text-[10px] font-bold uppercase tracking-[0.1em]">{label}</div></div>}

export default function OrderDetail({order,navigate}){
  if(!order){return <div className="p-6">No order selected. <button onClick={()=>navigate('/account')} className="underline">Back to account</button></div>}
  const artwork=order.artwork||{};
  const production=order.production||{};
  const delivery=order.deliveryStatus||{};
  const status=String(order.status||'').toUpperCase();
  const steps=[['Placed',true],['Artwork',artwork.count>0 || ['ARTWORK_CHECK','IN_PRODUCTION','QUALITY_CHECK','DISPATCHED'].includes(status)],['Production',production.count>0 || ['IN_PRODUCTION','QUALITY_CHECK','DISPATCHED'].includes(status)],['Quality / Packing',['QUALITY_CHECK','DISPATCHED'].includes(status)||production.status==='packing'],['Dispatched',status==='DISPATCHED'||delivery.status==='dispatched']];
  const orderId=order.id||order.orderNumber;
  const email=order.customer?.email||order.customerEmail||'';

  return <section className="py-6">
    <div className="mx-auto max-w-[1100px] px-4">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div><div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#7B3FE4]">Order detail</div><h1 className="text-[28px] font-black">Order #{order.orderNumber||order.id}</h1></div>
        <button onClick={()=>navigate('/account')} className="px-4 py-2 border rounded-full text-[11px] font-bold uppercase tracking-[0.08em]">Back to account</button>
      </div>
      <div className="grid gap-3 md:grid-cols-5 mb-5">{steps.map(([label,active])=><Step key={label} label={label} active={active} />)}</div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Items">{(order.items||[]).length?order.items.map((item)=><div key={item.id||item.productName} className="mb-2 flex justify-between gap-3"><span>{item.productName||item.titleSnapshot||'Print item'} × {item.quantity||1}</span><span>{currency(item.totalPrice||0)}</span></div>):<div>Order item details are syncing.</div>}<div className="mt-3 font-bold text-[#161A22]">Total {currency(order.total)}</div></Card>
        <Card title="Artwork"><div style={{color:tone(artwork.status)}} className="font-bold">{nice(artwork.status||order.artwork_status||'Awaiting artwork')}</div>{artwork.count? <div>{artwork.count} artwork file(s) linked.</div>:<div>No artwork file linked yet.</div>}{(artwork.items||[]).slice(0,4).map((file)=><div key={file.id} className="mt-2 rounded-[12px] border bg-[#FBFCFF] px-3 py-2" style={{borderColor:'#E3E8F0'}}><div className="font-bold text-[#161A22]">{file.originalName||file.id}</div><div>{nice(file.reviewStatus||'pending-review')}</div>{file.downloadUrl?<a href={file.downloadUrl} target="_blank" className="underline text-[#18A7D0]">View file</a>:null}</div>)}<button onClick={()=>navigate('/artwork-upload')} className="mt-3 px-4 py-2 bg-black text-white rounded-full text-[11px] font-bold uppercase tracking-[0.08em]">Upload artwork</button></Card>
        <Card title="Production"><div style={{color:tone(production.status)}} className="font-bold">{nice(production.status||'Not started')}</div>{production.latest?<><div>Machine: {production.latest.machine||'Unassigned'}</div><div>Due: {production.latest.dueDate||'TBC'}</div><div>Priority: {nice(production.latest.priority||'normal')}</div></>:<div>Production will start after artwork approval.</div>}{(production.items||[]).slice(0,3).map((job)=><div key={job.id} className="mt-2 rounded-[12px] border bg-[#FBFCFF] px-3 py-2" style={{borderColor:'#E3E8F0'}}>{job.productName} — {nice(job.status)}</div>)}</Card>
        <Card title="Delivery"><div style={{color:tone(delivery.status)}} className="font-bold">{nice(delivery.status||'Not dispatched')}</div><div>Method: {delivery.method||order.delivery||'Standard'}</div>{delivery.carrier?<div>Carrier: {delivery.carrier}</div>:null}{delivery.trackingNumber?<div>Tracking: <span className="font-bold text-[#161A22]">{delivery.trackingNumber}</span></div>:<div>Tracking will appear once dispatched.</div>}</Card>
        <Card title="Documents"><div className="flex flex-wrap gap-2"><button onClick={()=>openOrderDocument(orderId,'invoice',email)} className="text-[11px] border px-3 py-1 rounded-full font-bold uppercase tracking-[0.08em]">Download invoice</button><button onClick={()=>openOrderDocument(orderId,'receipt',email)} className="text-[11px] border px-3 py-1 rounded-full font-bold uppercase tracking-[0.08em]">Download receipt</button></div><div className="mt-2">Invoice and receipt PDFs are generated from the live order/payment record.</div><div className="mt-2" style={{color:tone(order.paymentStatus)}}>Payment: {nice(order.paymentStatus||'unpaid')}</div></Card>
        <Card title="Need help?"><div>Contact support with order number <b className="text-[#161A22]">{order.orderNumber||order.id}</b>.</div><button onClick={()=>navigate('/bespoke-quote')} className="mt-3 px-4 py-2 border rounded-full text-[11px] font-bold uppercase tracking-[0.08em]">Contact support</button></Card>
      </div>
    </div>
  </section>
}