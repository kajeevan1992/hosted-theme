
import React from "react";

function currency(v){return new Intl.NumberFormat("en-GB",{style:"currency",currency:"GBP"}).format(v||0);}

export default function OrderDetail({order,navigate}){
  if(!order){
    return <div className="p-6">No order</div>
  }

  return <section className="py-6">
    <div className="mx-auto max-w-[1100px] px-4">

      <h1 className="text-[28px] font-black mb-4">Order #{order.id}</h1>

      <div className="grid gap-3 md:grid-cols-5 mb-5">
        {["Placed","Artwork","Proof","Production","Done"].map((s,i)=>(
          <div key={i} className="text-center p-3 border rounded" style={{borderColor:"#E2E6E8"}}>
            <div className="text-[10px]">{s}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">

        <div className="p-4 border rounded">
          <b>Items</b>
          <div className="mt-2 text-[12px]">
            Business Cards – 500pcs – {currency(order.total)}
          </div>
        </div>

        <div className="p-4 border rounded">
          <b>Artwork</b>
          <div className="text-[12px] mt-2">Awaiting / Upload required</div>
        </div>

        <div className="p-4 border rounded">
          <b>Documents</b>
          <div className="mt-2 flex gap-2">
            <button className="text-[11px] border px-3 py-1 rounded-full">Invoice</button>
          </div>
        </div>

      </div>

      <div className="mt-5">
        <button onClick={()=>navigate("/artwork-upload")} className="px-4 py-2 bg-black text-white rounded-full text-[11px]">Upload Artwork</button>
      </div>

    </div>
  </section>
}
