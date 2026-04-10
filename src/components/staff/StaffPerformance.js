/* eslint-disable */
import { useState, useEffect } from "react";
import { C, S, hBadge, pBar, HOUSES } from "../../constants";
import { supabase, getData } from "../../supabase";
import EmptyState from '../ui/EmptyState';

function StaffPerformance({teachers,addData}){
  const [reviews,setReviews]=useState([]); const [show,setShow]=useState(false);
  const [f,setF]=useState({teacherId:"",month:"",punctuality:3,teaching:3,discipline:3,islamic:3,teamwork:3,comments:"",reviewedBy:""});
  useEffect(()=>{ getData("staff_reviews").then(data=>setReviews(data||[])); },[]);
  const calcTotal=(f)=>Math.round(((f.punctuality+f.teaching+f.discipline+f.islamic+f.teamwork)/25)*100);
  const add=async()=>{ if(!f.teacherId||!f.month)return; const score=calcTotal(f); await addData("staff_reviews",{...f,score}); setShow(false); setF({teacherId:"",month:"",punctuality:3,teaching:3,discipline:3,islamic:3,teamwork:3,comments:"",reviewedBy:""}); };
  const criteria=[{id:"punctuality",l:"وقت کی پابندی"},{id:"teaching",l:"تدریسی معیار"},{id:"discipline",l:"نظم و ضبط"},{id:"islamic",l:"اسلامی کردار"},{id:"teamwork",l:"ٹیم ورک"}];
  const teacherScores=teachers.map(t=>{ const tR=reviews.filter(r=>r.teacherId===t.id); const avgScore=tR.length>0?Math.round(tR.reduce((s,r)=>s+(r.score||0),0)/tR.length):0; return {...t,avgScore,reviews:tR.length}; }).sort((a,b)=>b.avgScore-a.avgScore);

  const G="#d4af37"; const N="#0f172a"; const N2="#1e293b";
  const glass={background:"rgba(255,255,255,0.07)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:"16px"};
  const inp={width:"100%",padding:"10px 14px",borderRadius:"10px",border:"1px solid rgba(212,175,55,0.25)",background:"rgba(255,255,255,0.06)",color:"#f1f5f9",fontSize:"0.8rem",fontFamily:"'Public Sans',sans-serif",outline:"none",boxSizing:"border-box",direction:"ltr",colorScheme:"dark"};
  const lbl={fontSize:"0.7rem",color:"rgba(212,175,55,0.8)",marginBottom:"6px",display:"block",fontWeight:"600"};
  return <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#0f172a 0%,#0d1f3c 50%,#0a1628 100%)",padding:"24px 20px",fontFamily:"'Public Sans',sans-serif",direction:"ltr"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"24px",flexWrap:"wrap",gap:"12px"}}>
      <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
        <div style={{width:"44px",height:"44px",borderRadius:"12px",background:"linear-gradient(135deg,#d4af37,#b8960a)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 20px rgba(212,175,55,0.4)"}}><span className="material-symbols-rounded" style={{fontSize:"24px",color:N}}>analytics</span></div>
        <div><h2 style={{margin:0,fontSize:"1.4rem",fontWeight:"800",color:"#f1f5f9"}}>Staff Performance</h2><p style={{margin:0,fontSize:"0.72rem",color:"rgba(212,175,55,0.7)"}}>Monthly Review & Assessment</p></div>
      </div>
      <button style={{display:"flex",alignItems:"center",gap:"8px",padding:"10px 20px",borderRadius:"12px",border:"1px solid #d4af37",background:show?"rgba(212,175,55,0.15)":"transparent",color:"#d4af37",fontWeight:"700",fontSize:"0.82rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif"}} onClick={()=>setShow(!show)}><span className="material-symbols-rounded" style={{fontSize:"18px"}}>{show?"close":"add_circle"}</span>{show?"Cancel":"New Review"}</button>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:"14px",marginBottom:"20px"}}>
      {teacherScores.map((t,i)=>{ const h=HOUSES.find(x=>x.id===t.houseId)||{}; return <div key={t.id} style={{...glass,padding:"18px",borderTop:`3px solid ${i===0?"#d4af37":h.color||"#60a5fa"}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"8px"}}>
          <div><div style={{fontSize:"0.82rem",fontWeight:"700",color:"#f1f5f9"}}>{t.name}</div><div style={{fontSize:"0.6rem",color:"rgba(255,255,255,0.5)"}}>{t.subject}</div></div>
          <div style={{background:i===0?"linear-gradient(135deg,#d4af37,#b8960a)":"rgba(255,255,255,0.08)",color:i===0?"#0f172a":"rgba(255,255,255,0.4)",padding:"4px 10px",borderRadius:"20px",fontSize:"0.65rem",fontWeight:"900"}}>{i===0?"👑":`${i+1}`}</div>
        </div>
        <div style={{fontSize:"2rem",fontWeight:"900",color:t.avgScore>=80?"#4ade80":t.avgScore>=60?"#fb923c":t.avgScore>0?"#f87171":"rgba(255,255,255,0.2)"}}>{t.avgScore>0?`${t.avgScore}%`:"—"}</div>
        {pBar(t.avgScore,100,t.avgScore>=80?"#4ade80":t.avgScore>=60?"#fb923c":"#f87171")}
        <div style={{fontSize:"0.58rem",color:"rgba(255,255,255,0.35)",marginTop:"4px"}}>{t.reviews} reviews</div>
      </div>; })}
    </div>
    {show&&<div style={{...glass,padding:"24px",marginBottom:"20px",borderColor:"rgba(212,175,55,0.3)"}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"16px"}}>
        <div><label style={lbl}>استاد *</label><select style={inp} value={f.teacherId} onChange={e=>setF({...f,teacherId:e.target.value})}><option value="" style={{background:N2}}>-- منتخب کریں --</option>{teachers.map(t=><option key={t.id} value={t.id} style={{background:N2}}>{t.name}</option>)}</select></div>
        <div><label style={lbl}>ماہ *</label><input style={{...inp,direction:"ltr",colorScheme:"dark"}} type="month" value={f.month} onChange={e=>setF({...f,month:e.target.value})}/></div>
      </div>
      {criteria.map(c=><div key={c.id} style={{background:"rgba(255,255,255,0.04)",borderRadius:"12px",padding:"12px 16px",marginBottom:"10px",border:"1px solid rgba(255,255,255,0.08)"}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:"6px"}}><span style={{fontSize:"0.72rem",fontWeight:"700",color:"#f1f5f9"}}>{c.l}</span><span style={{fontSize:"0.68rem",fontWeight:"700",color:"#d4af37"}}>{f[c.id]}/5</span></div>
        <div style={{display:"flex",gap:"6px"}}>{[1,2,3,4,5].map(star=><button key={star} onClick={()=>setF({...f,[c.id]:star})} style={{fontSize:"1.3rem",background:"none",border:"none",cursor:"pointer",color:star<=f[c.id]?"#d4af37":"rgba(255,255,255,0.15)"}}>★</button>)}</div>
      </div>)}
      <div style={{background:"rgba(212,175,55,0.1)",padding:"10px 16px",borderRadius:"10px",marginBottom:"12px",textAlign:"center",border:"1px solid rgba(212,175,55,0.2)"}}><div style={{fontSize:"0.62rem",color:"rgba(255,255,255,0.5)"}}>مجموعی اسکور</div><div style={{fontSize:"1.8rem",fontWeight:"900",color:calcTotal(f)>=80?"#4ade80":calcTotal(f)>=60?"#fb923c":"#f87171"}}>{calcTotal(f)}%</div></div>
      <div style={{marginBottom:"12px"}}><label style={lbl}>تبصرہ</label><textarea style={{...inp,minHeight:"60px",resize:"vertical"}} value={f.comments} onChange={e=>setF({...f,comments:e.target.value})} placeholder="تبصرہ..."/></div>
      <button style={{background:"linear-gradient(135deg,#d4af37,#b8960a)",color:N,border:"none",borderRadius:"12px",padding:"11px 26px",fontSize:"0.82rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif",fontWeight:"700"}} onClick={add}>جائزہ محفوظ کریں</button>
    </div>}
    <div style={{...glass,overflow:"hidden"}}><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}>
      <thead><tr style={{background:"rgba(255,255,255,0.04)"}}>{["استاد","ماہ","وقت","تدریس","سکور"].map(h=><th key={h} style={{padding:"12px 14px",textAlign:"left",fontSize:"0.65rem",color:"rgba(212,175,55,0.8)",fontWeight:"700"}}>{h}</th>)}</tr></thead>
      <tbody>{reviews.map((r,ri)=>{ const t=teachers.find(x=>x.id===r.teacherId); const sc=r.score||0; return <tr key={r.id} style={{background:ri%2===0?"rgba(255,255,255,0.02)":"transparent"}}>
        <td style={{padding:"11px 14px",color:"#f1f5f9",fontWeight:"700",fontSize:"0.75rem",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>{t?.name||"—"}</td>
        <td style={{padding:"11px 14px",fontFamily:"monospace",direction:"ltr",fontSize:"0.6rem",color:"rgba(255,255,255,0.6)",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>{r.month}</td>
        <td style={{padding:"11px 14px",borderBottom:"1px solid rgba(255,255,255,0.05)"}}><span style={{color:"#d4af37"}}>{"★".repeat(r.punctuality||0)}</span></td>
        <td style={{padding:"11px 14px",borderBottom:"1px solid rgba(255,255,255,0.05)"}}><span style={{color:"#d4af37"}}>{"★".repeat(r.teaching||0)}</span></td>
        <td style={{padding:"11px 14px",borderBottom:"1px solid rgba(255,255,255,0.05)"}}><span style={{padding:"4px 10px",borderRadius:"20px",fontSize:"0.62rem",fontWeight:"800",background:sc>=80?"rgba(74,222,128,0.15)":sc>=60?"rgba(251,191,36,0.15)":"rgba(248,113,113,0.15)",color:sc>=80?"#4ade80":sc>=60?"#fbbf24":"#f87171"}}>{sc}%</span></td>
      </tr>; })}{reviews.length===0&&<tr><td colSpan={5} style={{padding:"0"}}><EmptyState icon="📊" title="کوئی جائزہ نہیں" subtitle="ابھی تک کوئی اسٹاف کارکردگی جائزہ نہیں ہے" compact/></td></tr>}</tbody>
    </table></div></div>
  </div>;
}

export default StaffPerformance;
