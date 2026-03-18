/* eslint-disable */
import { useState, useEffect } from "react";
import { C, S, hBadge, pBar, HOUSES } from "../../constants";

function ParentPortal({students,fees,results}){
  const [selStudent,setSelStudent]=useState(null); const [q,setQ]=useState("");
  const filtered=students.filter(s=>s.name?.includes(q)||s.studentCode?.includes(q));
  const G="#d4af37"; const N="#0f172a"; const N2="#1e293b";
  const glass={background:"rgba(255,255,255,0.07)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:"16px"};
  const inp={width:"100%",padding:"10px 14px",borderRadius:"10px",border:"1px solid rgba(212,175,55,0.25)",background:"rgba(255,255,255,0.06)",color:"#f1f5f9",fontSize:"0.8rem",fontFamily:"'Public Sans',sans-serif",outline:"none",boxSizing:"border-box",direction:"rtl",colorScheme:"dark"};
  const lbl={fontSize:"0.7rem",color:"rgba(212,175,55,0.8)",marginBottom:"6px",display:"block",fontWeight:"600"};
  if(selStudent){
    const h=HOUSES.find(x=>x.id===selStudent.houseId)||{};
    const sFees=fees.filter(f=>f.studentId===selStudent.id);
    const sResults=results.filter(r=>r.studentId===selStudent.id);
    const pendingFees=sFees.filter(f=>f.status==="pending");
    const avgResult=sResults.length>0?Math.round(sResults.reduce((s,r)=>s+(r.percentage||0),0)/sResults.length):0;
    return <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#0f172a 0%,#0d1f3c 50%,#0a1628 100%)",padding:"24px 20px",fontFamily:"'Public Sans',sans-serif",direction:"rtl"}}>
      <button style={{padding:"8px 16px",borderRadius:"10px",border:"1px solid rgba(255,255,255,0.15)",background:"transparent",color:"rgba(255,255,255,0.7)",fontSize:"0.75rem",cursor:"pointer",marginBottom:"20px",fontFamily:"'Public Sans',sans-serif"}} onClick={()=>setSelStudent(null)}>← واپس</button>
      <div style={{background:h.gradient||`linear-gradient(135deg,#0d1f3c,#1e3a5f)`,borderRadius:"22px",padding:"24px",marginBottom:"20px",border:"1px solid rgba(212,175,55,0.2)"}}>
        <div style={{display:"flex",alignItems:"center",gap:"16px"}}>
          <div style={{width:"64px",height:"64px",borderRadius:"50%",background:"rgba(212,175,55,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"2rem"}}>{h.emoji||"👤"}</div>
          <div><div style={{fontSize:"1.3rem",fontWeight:"800",color:"#f1f5f9"}}>{selStudent.name}</div><div style={{fontSize:"0.7rem",color:"rgba(212,175,55,0.7)",marginTop:"2px"}}>والد: {selStudent.fatherName}</div><div style={{fontSize:"0.65rem",color:"rgba(255,255,255,0.4)",fontFamily:"monospace",direction:"ltr",marginTop:"2px"}}>{selStudent.studentCode}</div></div>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:"14px",marginBottom:"20px"}}>
        {[{c:"#60a5fa",i:"📚",n:selStudent.grade,l:"جماعت"},{c:h.color||"#d4af37",i:h.emoji||"🏠",n:h.nameEn||"—",l:"ہاؤس"},{c:"#4ade80",i:"📊",n:`${avgResult}%`,l:"اوسط نتیجہ"},{c:"#f87171",i:"💰",n:pendingFees.length,l:"واجب الادا فیس"}].map((x,i)=><div key={i} style={{background:`${x.c}12`,borderRadius:"16px",padding:"16px",border:`1px solid ${x.c}30`,textAlign:"center"}}><div style={{fontSize:"1.4rem"}}>{x.i}</div><div style={{fontSize:"1.1rem",fontWeight:"900",color:x.c,marginTop:"4px"}}>{x.n}</div><div style={{fontSize:"0.6rem",color:"rgba(255,255,255,0.5)",marginTop:"2px"}}>{x.l}</div></div>)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px"}}>
        <div style={{...glass,padding:"18px"}}>
          <div style={{fontSize:"0.82rem",fontWeight:"700",color:"#d4af37",marginBottom:"12px"}}>📊 حالیہ نتائج</div>
          {sResults.slice(0,5).map(r=><div key={r.id} style={{display:"flex",justifyContent:"space-between",marginBottom:"8px",padding:"6px 10px",background:"rgba(255,255,255,0.04)",borderRadius:"8px"}}>
            <span style={{fontSize:"0.65rem",fontWeight:"600",color:"#f1f5f9"}}>{r.subject}</span>
            <span style={{fontSize:"0.65rem",fontWeight:"800",color:r.percentage>=70?"#4ade80":r.percentage>=50?"#fb923c":"#f87171"}}>{r.grade} ({r.percentage}%)</span>
          </div>)}
          {sResults.length===0&&<div style={{textAlign:"center",color:"rgba(255,255,255,0.3)",fontSize:"0.62rem",padding:"20px"}}>کوئی نتیجہ نہیں</div>}
        </div>
        <div style={{...glass,padding:"18px"}}>
          <div style={{fontSize:"0.82rem",fontWeight:"700",color:"#d4af37",marginBottom:"12px"}}>💰 فیس صورتحال</div>
          {pendingFees.length>0&&<div style={{background:"rgba(248,113,113,0.12)",borderRadius:"10px",padding:"10px 14px",marginBottom:"10px",border:"1px solid rgba(248,113,113,0.2)"}}><div style={{fontSize:"0.65rem",fontWeight:"700",color:"#f87171"}}>⚠️ {pendingFees.length} فیس باقی ہے</div><div style={{fontSize:"1rem",fontWeight:"900",color:"#f87171"}}>Rs. {pendingFees.reduce((s,f)=>s+(f.amount||0),0).toLocaleString()}</div></div>}
          {sFees.filter(f=>f.status==="paid").slice(0,3).map(f=><div key={f.id} style={{display:"flex",justifyContent:"space-between",marginBottom:"6px",padding:"6px 10px",background:"rgba(74,222,128,0.08)",borderRadius:"8px",border:"1px solid rgba(74,222,128,0.15)"}}>
            <span style={{fontSize:"0.62rem",color:"#4ade80"}}>✅ {f.month||f.type}</span>
            <span style={{fontSize:"0.62rem",fontWeight:"700",color:"#4ade80"}}>Rs. {(f.amount||0).toLocaleString()}</span>
          </div>)}
          {sFees.length===0&&<div style={{textAlign:"center",color:"rgba(255,255,255,0.3)",fontSize:"0.62rem",padding:"20px"}}>کوئی فیس ریکارڈ نہیں</div>}
        </div>
      </div>
    </div>;
  }
  return <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#0f172a 0%,#0d1f3c 50%,#0a1628 100%)",padding:"24px 20px",fontFamily:"'Public Sans',sans-serif",direction:"rtl"}}>
    <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"24px"}}>
      <div style={{width:"44px",height:"44px",borderRadius:"12px",background:"linear-gradient(135deg,#d4af37,#b8960a)",display:"flex",alignItems:"center",justifyContent:"center"}}><span className="material-symbols-rounded" style={{fontSize:"24px",color:N}}>family_restroom</span></div>
      <div><h2 style={{margin:0,fontSize:"1.4rem",fontWeight:"800",color:"#f1f5f9"}}>والدین پورٹل</h2><p style={{margin:0,fontSize:"0.72rem",color:"rgba(212,175,55,0.7)"}}>طالب علم کا نام یا کوڈ لکھ کر تلاش کریں</p></div>
    </div>
    <div style={{marginBottom:"20px"}}><input style={{width:"100%",padding:"14px 18px",borderRadius:"12px",border:"1px solid rgba(212,175,55,0.25)",background:"rgba(255,255,255,0.06)",color:"#f1f5f9",fontSize:"0.85rem",fontFamily:"'Public Sans',sans-serif",outline:"none",boxSizing:"border-box",direction:"rtl",colorScheme:"dark"}} placeholder="🔍 نام یا کوڈ لکھیں..." value={q} onChange={e=>setQ(e.target.value)}/></div>
    {q&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:"14px"}}>
      {filtered.map(s=>{ const h=HOUSES.find(x=>x.id===s.houseId)||{}; return <div key={s.id} onClick={()=>setSelStudent(s)} style={{...glass,padding:"18px",cursor:"pointer",borderRight:`3px solid ${h.color||"#d4af37"}`}}>
        <div style={{display:"flex",alignItems:"center",gap:"14px"}}>
          <div style={{width:"48px",height:"48px",borderRadius:"50%",background:h.gradient||"linear-gradient(135deg,#1e3a5f,#2563eb)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.4rem"}}>{h.emoji||"👤"}</div>
          <div><div style={{fontSize:"0.85rem",fontWeight:"700",color:"#f1f5f9"}}>{s.name}</div><div style={{fontSize:"0.62rem",color:"rgba(255,255,255,0.5)"}}>{s.grade} • {h.nameEn||"—"}</div><div style={{fontSize:"0.6rem",color:"#d4af37",fontFamily:"monospace",direction:"ltr"}}>{s.studentCode}</div></div>
        </div>
      </div>; })}
      {filtered.length===0&&<div style={{...glass,textAlign:"center",color:"rgba(255,255,255,0.3)",padding:"40px",gridColumn:"1/-1"}}>"{q}" کوئی نتیجہ نہیں</div>}
    </div>}
    {!q&&<div style={{...glass,textAlign:"center",padding:"60px"}}><div style={{fontSize:"3rem",marginBottom:"12px"}}>👪</div><div style={{fontSize:"0.85rem",fontWeight:"700",color:"#f1f5f9",marginBottom:"8px"}}>والدین پورٹل میں خوش آمدید</div><div style={{fontSize:"0.65rem",color:"rgba(255,255,255,0.5)"}}>اپنے بچے کا نام یا داخلہ نمبر تلاش کریں</div></div>}
  </div>;
}

export default ParentPortal;
