/* eslint-disable */
import { useState, useEffect } from "react";
import { C, S, hBadge } from "../../constants";
import { supabase } from "../../supabase";

function VisitorHub({addData}){
  const [visitors,setVisitors]=useState([]); const [show,setShow]=useState(false);
  const [f,setF]=useState({name:"",cnic:"",phone:"",purpose:"meeting",meetingWith:"",vehicleNo:"",checkIn:new Date().toTimeString().slice(0,5),date:new Date().toISOString().split("T")[0]});
  useEffect(()=>{ const load=async()=>{ const {data}=await supabase.from("visitors").select("*").order("created_at",{ascending:false}).limit(50); setVisitors(data||[]); }; load(); },[]);
  const add=async()=>{ if(!f.name)return; await addData("visitors",{...f,status:"inside"}); setShow(false); setF({name:"",cnic:"",phone:"",purpose:"meeting",meetingWith:"",vehicleNo:"",checkIn:new Date().toTimeString().slice(0,5),date:new Date().toISOString().split("T")[0]}); };
  const checkout=async(id)=>{ await supabase.from("visitors").update({status:"left",check_out:new Date().toTimeString().slice(0,5)}).eq("id",id); };
  const purposes={meeting:{c:C.abuBakr,i:"🤝",l:"Meeting"},delivery:{c:C.amber,i:"📦",l:"Delivery"},maintenance:{c:C.teal,i:"🔧",l:"Maintenance"},parent:{c:C.green,i:"👪",l:"Parents"},official:{c:C.gold,i:"🏛️",l:"Official"},other:{c:"#888",i:"👤",l:"Other"}};
  const inside=visitors.filter(v=>v.status==="inside");
  return <div style={S.page}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
      <div><div style={{fontSize:"1.1rem",fontWeight:"700",color:C.navy}}>🔒 Security / Visitor Hub</div><div style={{fontSize:"0.62rem",color:"#888",marginTop:"2px"}}>Record of visitors</div></div>
      <button style={S.addBtn} onClick={()=>setShow(!show)}>+ New Visitor</button>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:"12px",marginBottom:"20px"}}>
      {[{c:C.green,i:"✅",n:inside.length,l:"Inside Now"},{c:C.abuBakr,i:"👥",n:visitors.filter(v=>v.date===new Date().toISOString().split("T")[0]).length,l:"Today's Visitors"},{c:C.gold,i:"📋",n:visitors.length,l:"Total Record"},{c:C.amber,i:"🚗",n:visitors.filter(v=>v.vehicleNo&&v.status==="inside").length,l:"Vehicles Inside"}].map((x,i)=><div key={i} style={{background:`linear-gradient(135deg,${x.c}12,${x.c}05)`,borderRadius:"16px",padding:"16px",border:`2px solid ${x.c}20`,textAlign:"center"}}><div style={{fontSize:"1.3rem"}}>{x.i}</div><div style={{fontSize:"1.4rem",fontWeight:"900",color:x.c}}>{x.n}</div><div style={{fontSize:"0.6rem",color:"#888"}}>{x.l}</div></div>)}
    </div>
    {inside.length>0&&<div className="hv-card" style={{...S.card,marginBottom:"20px",background:"linear-gradient(135deg,#dcfce7,#f0fdf4)",border:`2px solid ${C.green}20`}}>
      <div style={{fontSize:"0.78rem",fontWeight:"700",color:C.green,marginBottom:"12px"}}>✅ Currently on Campus ({inside.length})</div>
      {inside.map(v=>{ const p=purposes[v.purpose]||purposes.other; return <div key={v.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"10px",background:C.white,borderRadius:"10px",padding:"10px 14px"}}>
        <div><div style={{fontSize:"0.75rem",fontWeight:"700",color:C.navy}}>{p.i} {v.name}</div><div style={{fontSize:"0.6rem",color:"#888"}}>{p.l} {v.meetingWith&&`• ${v.meetingWith}`}</div><div style={{fontSize:"0.58rem",color:C.green,fontFamily:"monospace",direction:"ltr"}}>Entered: {v.checkIn}</div></div>
        <button onClick={()=>checkout(v.id)} style={{...S.dangerBtn,padding:"6px 12px",fontSize:"0.6rem"}}>🚪 Exit</button>
      </div>; })}
    </div>}
    {show&&<div className="hv-card" style={{...S.card,marginBottom:"20px",background:`linear-gradient(135deg,${C.goldLight},#fdf8ee)`,border:`2px solid ${C.gold}30`}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>نام *</label><input style={S.inpSm} value={f.name} onChange={e=>setF({...f,name:e.target.value})} placeholder="Visitor name..."/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>فون</label><input style={{...S.inpSm,direction:"ltr"}} value={f.phone} onChange={e=>setF({...f,phone:e.target.value})} placeholder="03xx-xxxxxxx"/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>Purpose</label><select style={S.inpSm} value={f.purpose} onChange={e=>setF({...f,purpose:e.target.value})}>{Object.entries(purposes).map(([k,v])=><option key={k} value={k}>{v.i} {v.l}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>کس سے ملنا</label><input style={S.inpSm} value={f.meetingWith} onChange={e=>setF({...f,meetingWith:e.target.value})} placeholder="Teacher / Officer..."/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>شناختی کارڈ</label><input style={{...S.inpSm,direction:"ltr"}} value={f.cnic} onChange={e=>setF({...f,cnic:e.target.value})} placeholder="xxxxx-xxxxxxx-x"/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>گاڑی نمبر</label><input style={{...S.inpSm,direction:"ltr"}} value={f.vehicleNo} onChange={e=>setF({...f,vehicleNo:e.target.value})} placeholder="LEA-xxx"/></div>
      </div>
      <button style={S.saveBtn} onClick={add}>✅ Register Visitor</button>
    </div>}
    <div style={S.card} className="hv-card"><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}>
      <thead><tr><th style={S.th}>Name</th><th style={S.th}>Purpose</th><th style={S.th}>Check-In</th><th style={S.th}>Status</th><th style={S.th}>Action</th></tr></thead>
      <tbody>{visitors.slice(0,30).map(v=>{ const p=purposes[v.purpose]||purposes.other; return <tr key={v.id}>
        <td style={{...S.td,fontWeight:"700"}}>{v.name}</td>
        <td style={S.td}><span style={hBadge(p.c,p.c+"15")}>{p.i} {p.l}</span></td>
        <td style={{...S.td,fontFamily:"monospace",direction:"ltr",fontSize:"0.6rem"}}>{v.checkIn}</td>
        <td style={S.td}><span style={{padding:"3px 8px",borderRadius:"20px",fontSize:"0.55rem",fontWeight:"700",background:v.status==="inside"?"#dcfce7":"#f3f4f6",color:v.status==="inside"?C.green:"#888"}}>{v.status==="inside"?"اندر ہے":"چلے گئے"}</span></td>
        <td style={S.td}>{v.status==="inside"&&<button onClick={()=>checkout(v.id)} style={{...S.dangerBtn,padding:"4px 8px",fontSize:"0.55rem"}}>Exit</button>}</td>
      </tr>; })}{visitors.length===0&&<tr><td colSpan={5} style={{...S.td,textAlign:"center",color:"#bbb",padding:"40px"}}><span className="ur">کوئی اندراج نہیں</span></td></tr>}</tbody>
    </table></div></div>
  </div>;
}

export default VisitorHub;
