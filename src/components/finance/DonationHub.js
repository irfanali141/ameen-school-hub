/* eslint-disable */
import { useState, useEffect } from "react";
import { C, S, hBadge } from "../../constants";
import { supabase } from "../../supabase";

function DonationHub({addData}){
  const [donations,setDonations]=useState([]); const [show,setShow]=useState(false);
  const [f,setF]=useState({donorName:"",amount:0,type:"sadaqah",purpose:"",date:new Date().toISOString().split("T")[0],anonymous:false,notes:""});
  useEffect(()=>{ const load=async()=>{ const {data}=await supabase.from("donations").select("*").order("created_at",{ascending:false}).limit(50); setDonations(data||[]); }; load(); },[]);
  const add=async()=>{ if(!f.amount)return; await addData("donations",{...f,amount:Number(f.amount)}); setShow(false); setF({donorName:"",amount:0,type:"sadaqah",purpose:"",date:new Date().toISOString().split("T")[0],anonymous:false,notes:""}); };
  const types={sadaqah:{c:C.green,bg:"#dcfce7",i:"💝",l:"Sadaqah"},zakat:{c:C.gold,bg:C.goldLight,i:"🌙",l:"Zakat"},khairat:{c:C.abuBakr,bg:"#dbeafe",i:"🤲",l:"Khairat"},waqf:{c:C.purple,bg:"#ede9fe",i:"🏛️",l:"Waqf"},other:{c:C.teal,bg:"#ccfbf1",i:"💰",l:"Other"}};
  const totalByType=(type)=>donations.filter(d=>d.type===type).reduce((s,d)=>s+(d.amount||0),0);
  const grandTotal=donations.reduce((s,d)=>s+(d.amount||0),0);

  const G="#d4af37"; const N="#0f172a"; const N2="#1e293b";
  const glass={background:"rgba(255,255,255,0.07)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:"16px"};
  const inp={width:"100%",padding:"10px 14px",borderRadius:"10px",border:"1px solid rgba(212,175,55,0.25)",background:"rgba(255,255,255,0.06)",color:"#f1f5f9",fontSize:"0.8rem",fontFamily:"'Public Sans',sans-serif",outline:"none",boxSizing:"border-box",direction:"ltr",colorScheme:"dark"};
  const lbl={fontSize:"0.7rem",color:"rgba(212,175,55,0.8)",marginBottom:"6px",display:"block",fontWeight:"600"};
  return <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#0f172a 0%,#0d1f3c 50%,#0a1628 100%)",padding:"24px 20px",fontFamily:"'Public Sans',sans-serif",direction:"ltr"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"24px",flexWrap:"wrap",gap:"12px"}}>
      <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
        <div style={{width:"44px",height:"44px",borderRadius:"12px",background:"linear-gradient(135deg,#d4af37,#b8960a)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 20px rgba(212,175,55,0.4)"}}><span className="material-symbols-rounded" style={{fontSize:"24px",color:N}}>volunteer_activism</span></div>
        <div><h2 style={{margin:0,fontSize:"1.4rem",fontWeight:"800",color:"#f1f5f9"}}>Donations & Charity</h2><p style={{margin:0,fontSize:"0.72rem",color:"rgba(212,175,55,0.7)"}}>Sadaqah, Zakat, Khairat, Waqf</p></div>
      </div>
      <button style={{display:"flex",alignItems:"center",gap:"8px",padding:"10px 20px",borderRadius:"12px",border:"1px solid #d4af37",background:show?"rgba(212,175,55,0.15)":"transparent",color:"#d4af37",fontWeight:"700",fontSize:"0.82rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif"}} onClick={()=>setShow(!show)}><span className="material-symbols-rounded" style={{fontSize:"18px"}}>{show?"close":"add_circle"}</span>{show?"Cancel":"New Donation"}</button>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:"12px",marginBottom:"20px"}}>
      {Object.entries(types).map(([k,v])=><div key={k} style={{background:`${v.c}12`,borderRadius:"16px",padding:"16px",border:`1px solid ${v.c}30`,textAlign:"center"}}><div style={{fontSize:"1.4rem"}}>{v.i}</div><div style={{fontSize:"0.72rem",fontWeight:"800",color:v.c,marginTop:"4px"}}>{v.l}</div><div style={{fontSize:"1rem",fontWeight:"900",color:v.c}}>Rs. {(totalByType(k)/1000).toFixed(1)}K</div></div>)}
    </div>
    <div style={{...glass,padding:"20px",marginBottom:"20px",textAlign:"center",borderColor:"rgba(212,175,55,0.3)"}}>
      <div style={{fontSize:"0.65rem",color:"rgba(255,255,255,0.5)"}}>Total Donations Collected</div>
      <div style={{fontSize:"2.5rem",fontWeight:"900",color:"#d4af37"}}>Rs. {grandTotal.toLocaleString()}</div>
      <div style={{fontSize:"0.62rem",color:"rgba(255,255,255,0.4)",marginTop:"4px"}}>{donations.length} donations</div>
    </div>
    {show&&<div style={{...glass,padding:"24px",marginBottom:"20px",borderColor:"rgba(212,175,55,0.3)"}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div><label style={lbl}>عطیہ دہندہ</label><input style={inp} value={f.donorName} onChange={e=>setF({...f,donorName:e.target.value})} placeholder="Name (optional)"/></div>
        <div><label style={lbl}>Amount *</label><input style={{...inp,direction:"ltr",colorScheme:"dark"}} type="number" value={f.amount} onChange={e=>setF({...f,amount:e.target.value})}/></div>
        <div><label style={lbl}>Type</label><select style={inp} value={f.type} onChange={e=>setF({...f,type:e.target.value})}>{Object.entries(types).map(([k,v])=><option key={k} value={k} style={{background:N2}}>{v.i} {v.l}</option>)}</select></div>
        <div><label style={lbl}>مقصد</label><input style={inp} value={f.purpose} onChange={e=>setF({...f,purpose:e.target.value})} placeholder="Construction, education..."/></div>
        <div><label style={lbl}>Date</label><input style={{...inp,direction:"ltr",colorScheme:"dark"}} type="date" value={f.date} onChange={e=>setF({...f,date:e.target.value})}/></div>
        <div style={{display:"flex",alignItems:"center",gap:"8px"}}><input type="checkbox" checked={f.anonymous} onChange={e=>setF({...f,anonymous:e.target.checked})} id="anon"/><label htmlFor="anon" style={{fontSize:"0.68rem",color:"#f1f5f9",cursor:"pointer"}}>Anonymous Donation</label></div>
      </div>
      <button style={{background:"linear-gradient(135deg,#d4af37,#b8960a)",color:N,border:"none",borderRadius:"12px",padding:"11px 26px",fontSize:"0.82rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif",fontWeight:"700"}} onClick={add}>Donation Enter</button>
    </div>}
    <div style={{...glass,overflow:"hidden"}}><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}>
      <thead><tr style={{background:"rgba(255,255,255,0.04)"}}>{["Donor","Type","Amount","Purpose","Date"].map(h=><th key={h} style={{padding:"12px 14px",textAlign:"left",fontSize:"0.65rem",color:"rgba(212,175,55,0.8)",fontWeight:"700"}}>{h}</th>)}</tr></thead>
      <tbody>{donations.map((d,ri)=>{ const tc=types[d.type]||types.other; return <tr key={d.id} style={{background:ri%2===0?"rgba(255,255,255,0.02)":"transparent"}}>
        <td style={{padding:"11px 14px",color:"#f1f5f9",fontWeight:"700",fontSize:"0.75rem",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>{d.anonymous?"Anonymous":d.donorName||"—"}</td>
        <td style={{padding:"11px 14px",borderBottom:"1px solid rgba(255,255,255,0.05)"}}><span style={{padding:"3px 8px",borderRadius:"20px",fontSize:"0.6rem",fontWeight:"700",background:`${tc.c}20`,color:tc.c}}>{tc.i} {tc.l}</span></td>
        <td style={{padding:"11px 14px",fontWeight:"800",color:"#4ade80",fontSize:"0.75rem",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>Rs. {(d.amount||0).toLocaleString()}</td>
        <td style={{padding:"11px 14px",color:"rgba(255,255,255,0.7)",fontSize:"0.75rem",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>{d.purpose||"—"}</td>
        <td style={{padding:"11px 14px",fontFamily:"monospace",direction:"ltr",fontSize:"0.6rem",color:"rgba(255,255,255,0.6)",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>{d.date}</td>
      </tr>; })}{donations.length===0&&<tr><td colSpan={5} style={{padding:"40px",textAlign:"center",color:"rgba(255,255,255,0.3)"}}><span className="ur">کوئی اندراج نہیں</span></td></tr>}</tbody>
    </table></div></div>
  </div>;
}

export default DonationHub;
