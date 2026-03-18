/* eslint-disable */
import { useState, useEffect } from "react";
import { C, S, hBadge } from "../../constants";
import { db, collection, onSnapshot, updateDoc, doc, query, orderBy, limit } from "../../firebase";

function VisitorHub({addData}){
  const [visitors,setVisitors]=useState([]); const [show,setShow]=useState(false);
  const [f,setF]=useState({name:"",cnic:"",phone:"",purpose:"meeting",meetingWith:"",vehicleNo:"",checkIn:new Date().toTimeString().slice(0,5),date:new Date().toISOString().split("T")[0]});
  useEffect(()=>{ return onSnapshot(query(collection(db,"visitors"),orderBy("createdAt","desc"),limit(50)),s=>setVisitors(s.docs.map(d=>({id:d.id,...d.data()}))));  },[]);
  const add=async()=>{ if(!f.name)return; await addData("visitors",{...f,status:"inside"}); setShow(false); setF({name:"",cnic:"",phone:"",purpose:"meeting",meetingWith:"",vehicleNo:"",checkIn:new Date().toTimeString().slice(0,5),date:new Date().toISOString().split("T")[0]}); };
  const checkout=async(id)=>{ await updateDoc(doc(db,"visitors",id),{status:"left",checkOut:new Date().toTimeString().slice(0,5)}); };
  const purposes={meeting:{c:C.abuBakr,i:"🤝",l:"ملاقات"},delivery:{c:C.amber,i:"📦",l:"ڈیلیوری"},maintenance:{c:C.teal,i:"🔧",l:"مرمت"},parent:{c:C.green,i:"👪",l:"والدین"},official:{c:C.gold,i:"🏛️",l:"سرکاری"},other:{c:"#888",i:"👤",l:"دیگر"}};
  const inside=visitors.filter(v=>v.status==="inside");
  return <div style={S.page}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
      <div><div style={{fontSize:"1.1rem",fontWeight:"700",color:C.navy}}>🔒 سیکیورٹی / وزیٹر ہب</div><div style={{fontSize:"0.62rem",color:"#888",marginTop:"2px"}}>آنے جانے والوں کا ریکارڈ</div></div>
      <button style={S.addBtn} onClick={()=>setShow(!show)}>+ نیا وزیٹر</button>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:"12px",marginBottom:"20px"}}>
      {[{c:C.green,i:"✅",n:inside.length,l:"ابھی اندر"},{c:C.abuBakr,i:"👥",n:visitors.filter(v=>v.date===new Date().toISOString().split("T")[0]).length,l:"آج کے وزیٹر"},{c:C.gold,i:"📋",n:visitors.length,l:"کل ریکارڈ"},{c:C.amber,i:"🚗",n:visitors.filter(v=>v.vehicleNo&&v.status==="inside").length,l:"گاڑیاں اندر"}].map((x,i)=><div key={i} style={{background:`linear-gradient(135deg,${x.c}12,${x.c}05)`,borderRadius:"16px",padding:"16px",border:`2px solid ${x.c}20`,textAlign:"center"}}><div style={{fontSize:"1.3rem"}}>{x.i}</div><div style={{fontSize:"1.4rem",fontWeight:"900",color:x.c}}>{x.n}</div><div style={{fontSize:"0.6rem",color:"#888"}}>{x.l}</div></div>)}
    </div>
    {inside.length>0&&<div className="hv-card" style={{...S.card,marginBottom:"20px",background:"linear-gradient(135deg,#dcfce7,#f0fdf4)",border:`2px solid ${C.green}20`}}>
      <div style={{fontSize:"0.78rem",fontWeight:"700",color:C.green,marginBottom:"12px"}}>✅ ابھی کیمپس میں ({inside.length})</div>
      {inside.map(v=>{ const p=purposes[v.purpose]||purposes.other; return <div key={v.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"10px",background:C.white,borderRadius:"10px",padding:"10px 14px"}}>
        <div><div style={{fontSize:"0.75rem",fontWeight:"700",color:C.navy}}>{p.i} {v.name}</div><div style={{fontSize:"0.6rem",color:"#888"}}>{p.l} {v.meetingWith&&`• ${v.meetingWith}`}</div><div style={{fontSize:"0.58rem",color:C.green,fontFamily:"monospace",direction:"ltr"}}>داخل: {v.checkIn}</div></div>
        <button onClick={()=>checkout(v.id)} style={{...S.dangerBtn,padding:"6px 12px",fontSize:"0.6rem"}}>🚪 خروج</button>
      </div>; })}
    </div>}
    {show&&<div className="hv-card" style={{...S.card,marginBottom:"20px",background:`linear-gradient(135deg,${C.goldLight},#fdf8ee)`,border:`2px solid ${C.gold}30`}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>نام *</label><input style={S.inpSm} value={f.name} onChange={e=>setF({...f,name:e.target.value})} placeholder="وزیٹر کا نام..."/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>فون</label><input style={{...S.inpSm,direction:"ltr"}} value={f.phone} onChange={e=>setF({...f,phone:e.target.value})} placeholder="03xx-xxxxxxx"/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>مقصد</label><select style={S.inpSm} value={f.purpose} onChange={e=>setF({...f,purpose:e.target.value})}>{Object.entries(purposes).map(([k,v])=><option key={k} value={k}>{v.i} {v.l}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>ملاقات کس سے</label><input style={S.inpSm} value={f.meetingWith} onChange={e=>setF({...f,meetingWith:e.target.value})} placeholder="استاد / افسر..."/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>CNIC</label><input style={{...S.inpSm,direction:"ltr"}} value={f.cnic} onChange={e=>setF({...f,cnic:e.target.value})} placeholder="xxxxx-xxxxxxx-x"/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>گاڑی نمبر</label><input style={{...S.inpSm,direction:"ltr"}} value={f.vehicleNo} onChange={e=>setF({...f,vehicleNo:e.target.value})} placeholder="LEA-xxx"/></div>
      </div>
      <button style={S.saveBtn} onClick={add}>✅ وزیٹر رجسٹر کریں</button>
    </div>}
    <div style={S.card} className="hv-card"><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}>
      <thead><tr><th style={S.th}>نام</th><th style={S.th}>مقصد</th><th style={S.th}>داخل</th><th style={S.th}>حال</th><th style={S.th}>عمل</th></tr></thead>
      <tbody>{visitors.slice(0,30).map(v=>{ const p=purposes[v.purpose]||purposes.other; return <tr key={v.id}>
        <td style={{...S.td,fontWeight:"700"}}>{v.name}</td>
        <td style={S.td}><span style={hBadge(p.c,p.c+"15")}>{p.i} {p.l}</span></td>
        <td style={{...S.td,fontFamily:"monospace",direction:"ltr",fontSize:"0.6rem"}}>{v.checkIn}</td>
        <td style={S.td}><span style={{padding:"3px 8px",borderRadius:"20px",fontSize:"0.55rem",fontWeight:"700",background:v.status==="inside"?"#dcfce7":"#f3f4f6",color:v.status==="inside"?C.green:"#888"}}>{v.status==="inside"?"اندر":"باہر"}</span></td>
        <td style={S.td}>{v.status==="inside"&&<button onClick={()=>checkout(v.id)} style={{...S.dangerBtn,padding:"4px 8px",fontSize:"0.55rem"}}>خروج</button>}</td>
      </tr>; })}{visitors.length===0&&<tr><td colSpan={5} style={{...S.td,textAlign:"center",color:"#bbb",padding:"40px"}}>کوئی ریکارڈ نہیں</td></tr>}</tbody>
    </table></div></div>
  </div>;
}

export default VisitorHub;
