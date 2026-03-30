/* eslint-disable */
import { useState, useEffect } from "react";
import { C, S, hBadge, sLabel } from "../../constants";
import { supabase } from "../../supabase";

function TarbiyahDiary({students,addData,updateHousePoints}){
  const [logs,setLogs]=useState([]); const [show,setShow]=useState(false); const [tab,setTab]=useState("entry");
  const [f,setF]=useState({studentId:"",date:new Date().toISOString().split("T")[0],fajr:false,dhuhr:false,asr:false,maghrib:false,isha:false,adabRating:3,selfReflection:false,notes:""});
  const [saving,setSaving]=useState(false);
  useEffect(()=>{ const load=async()=>{ const {data}=await supabase.from("tarbiyah_logs").select("*").order("created_at",{ascending:false}).limit(50); setLogs(data||[]); }; load(); },[]);
  const calcPoints=(f)=>{ const n=[f.fajr,f.dhuhr,f.asr,f.maghrib,f.isha].filter(Boolean).length; return n*4+(f.adabRating>=4?5:f.adabRating>=3?3:1)+(f.selfReflection?5:0); };
  const save=async()=>{ if(!f.studentId)return; setSaving(true); const pts=calcPoints(f); const student=students.find(s=>s.id===f.studentId); await addData("tarbiyah_logs",{...f,points:pts,houseId:student?.houseId||""}); if(student?.houseId&&pts>0) await updateHousePoints(student.houseId,Math.floor(pts/5)); setShow(false); setF({studentId:"",date:new Date().toISOString().split("T")[0],fajr:false,dhuhr:false,asr:false,maghrib:false,isha:false,adabRating:3,selfReflection:false,notes:""}); setSaving(false); };
  const SALAH=["fajr","dhuhr","asr","maghrib","isha"]; const SALAH_UR={fajr:"Fajr",dhuhr:"Dhuhr",asr:"Asr",maghrib:"Maghrib",isha:"Isha"};
  const todayLogs=logs.filter(l=>l.date===new Date().toISOString().split("T")[0]);
  const studentSummary=students.map(st=>{ const stL=logs.filter(l=>l.studentId===st.id); const totalPts=stL.reduce((s,l)=>s+(l.points||0),0); const namazAvg=stL.length>0?Math.round(stL.reduce((s,l)=>s+[l.fajr,l.dhuhr,l.asr,l.maghrib,l.isha].filter(Boolean).length,0)/stL.length):0; return {...st,totalPts,namazAvg,entries:stL.length}; }).sort((a,b)=>b.totalPts-a.totalPts);
  return <div style={S.page}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
      <div><div style={{fontSize:"1.1rem",fontWeight:"700",color:C.navy}}>📖 Training Diary</div><div style={{fontSize:"0.62rem",color:"#888",marginTop:"2px"}}>Namaz, Adab, and Daily Performance</div></div>
      <button style={S.addBtn} onClick={()=>setShow(!show)}>+ New Entry</button>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:"12px",marginBottom:"20px"}}>
      {[{c:C.navy,i:"📋",n:logs.length,l:"Total Entries"},{c:C.gold,i:"📅",n:todayLogs.length,l:"Today"},{c:C.green,i:"🎓",n:students.length,l:"Total Students"}].map((x,i)=><div key={i} style={{background:`linear-gradient(135deg,${x.c}12,${x.c}05)`,borderRadius:"16px",padding:"16px",border:`2px solid ${x.c}20`,textAlign:"center"}}><div style={{fontSize:"1.3rem"}}>{x.i}</div><div style={{fontSize:"1.4rem",fontWeight:"900",color:x.c}}>{x.n}</div><div style={{fontSize:"0.6rem",color:"#888",marginTop:"2px"}}>{x.l}</div></div>)}
    </div>
    {show&&<div className="hv-card" style={{...S.card,marginBottom:"20px",background:`linear-gradient(135deg,${C.goldLight},#fdf8ee)`,border:`2px solid ${C.gold}30`}}>
      <div style={{fontSize:"0.85rem",fontWeight:"700",color:C.navy,marginBottom:"16px"}}>📖 Daily Training Entry</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"14px"}}>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>Student *</label><select style={S.inpSm} value={f.studentId} onChange={e=>setF({...f,studentId:e.target.value})}><option value="">-- Select --</option>{students.map(s=><option key={s.id} value={s.id}>{sLabel(s)}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>Date</label><input style={{...S.inpSm,direction:"ltr"}} type="date" value={f.date} onChange={e=>setF({...f,date:e.target.value})}/></div>
      </div>
      <div style={{background:C.white,borderRadius:"14px",padding:"14px",marginBottom:"12px",border:`1px solid ${C.goldLight}`}}>
        <div style={{fontSize:"0.75rem",fontWeight:"700",color:C.navy,marginBottom:"10px"}}>🕌 5 Daily Prayers</div>
        <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
          {SALAH.map(s=><button key={s} onClick={()=>setF({...f,[s]:!f[s]})} style={{padding:"8px 14px",borderRadius:"12px",border:"none",cursor:"pointer",fontSize:"0.68rem",fontWeight:"700",fontFamily:"inherit",background:f[s]?`linear-gradient(135deg,${C.green},#15803d)`:"#f3f4f6",color:f[s]?C.white:"#888",transition:"all 0.2s"}}>{f[s]?"✅":"⬜"} {SALAH_UR[s]}</button>)}
        </div>
        <div style={{marginTop:"8px",fontSize:"0.65rem",color:C.gold,fontWeight:"700"}}>{[f.fajr,f.dhuhr,f.asr,f.maghrib,f.isha].filter(Boolean).length}/5 Namaz</div>
      </div>
      <div style={{background:C.white,borderRadius:"14px",padding:"14px",marginBottom:"12px",border:`1px solid ${C.goldLight}`}}>
        <div style={{fontSize:"0.72rem",fontWeight:"700",color:C.navy,marginBottom:"8px"}}>💎 Adab Rating</div>
        <div style={{display:"flex",gap:"6px"}}>{[1,2,3,4,5].map(star=><button key={star} onClick={()=>setF({...f,adabRating:star})} style={{fontSize:"1.4rem",background:"none",border:"none",cursor:"pointer",color:star<=f.adabRating?C.gold:"#ddd",transition:"color 0.15s"}}>★</button>)}</div>
      </div>
      <div style={{background:C.white,borderRadius:"14px",padding:"12px",marginBottom:"12px",border:`1px solid ${C.goldLight}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{fontSize:"0.72rem",fontWeight:"700",color:C.navy}}>🪞 Self-Assessment</div>
        <button onClick={()=>setF({...f,selfReflection:!f.selfReflection})} style={{padding:"6px 14px",borderRadius:"20px",border:"none",cursor:"pointer",fontSize:"0.62rem",fontWeight:"700",fontFamily:"inherit",background:f.selfReflection?`linear-gradient(135deg,${C.gold},${C.goldDark})`:"#f3f4f6",color:f.selfReflection?C.white:"#888"}}>{f.selfReflection?"✅ Yes":"⬜ No"}</button>
      </div>
      <div style={{background:C.white,borderRadius:"12px",padding:"12px",marginBottom:"12px",textAlign:"center",border:`2px solid ${C.gold}20`}}>
        <div style={{fontSize:"0.62rem",color:"#888"}}>Total Points</div>
        <div style={{fontSize:"2rem",fontWeight:"900",color:C.gold}}>{calcPoints(f)}</div>
      </div>
      <button style={{...S.saveBtn,width:"100%"}} onClick={save} disabled={saving}>{saving?"Saving...":"✅ Training Entry Save"}</button>
    </div>}
    <div style={{display:"flex",gap:"8px",marginBottom:"16px"}}>{[["entry","📋 Entries"],["report","📊 Report"]].map(([t,l])=><button key={t} onClick={()=>setTab(t)} style={{padding:"8px 14px",borderRadius:"10px",border:"none",cursor:"pointer",fontSize:"0.65rem",fontWeight:tab===t?"700":"400",background:tab===t?`linear-gradient(135deg,${C.gold},${C.goldDark})`:C.white,color:tab===t?C.white:"#888",fontFamily:"inherit"}}>{l}</button>)}</div>
    {tab==="entry"&&<div style={S.card} className="hv-card"><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}>
      <thead><tr><th style={S.th}>Student</th><th style={S.th}>Date</th><th style={S.th}>Namaz</th><th style={S.th}>Adab</th><th style={S.th}>Points</th></tr></thead>
      <tbody>{logs.map(l=>{ const st=students.find(s=>s.id===l.studentId); const nc=[l.fajr,l.dhuhr,l.asr,l.maghrib,l.isha].filter(Boolean).length; return <tr key={l.id}>
        <td style={{...S.td,fontWeight:"700"}}>{st?.name||"—"}</td>
        <td style={{...S.td,fontFamily:"monospace",direction:"ltr",fontSize:"0.6rem"}}>{l.date}</td>
        <td style={S.td}><span style={{color:nc>=4?C.green:nc>=2?C.amber:C.red,fontWeight:"700"}}>{nc}/5</span></td>
        <td style={S.td}><span style={{color:C.gold}}>{"★".repeat(l.adabRating||0)}</span></td>
        <td style={{...S.td,fontWeight:"800",color:C.gold}}>{l.points||0}</td>
      </tr>; })}{logs.length===0&&<tr><td colSpan={5} style={{...S.td,textAlign:"center",color:"#bbb",padding:"40px"}}><span className="ur">ابھی کوئی اندراج نہیں</span></td></tr>}</tbody>
    </table></div></div>}
    {tab==="report"&&<div style={S.card} className="hv-card"><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}>
      <thead><tr><th style={S.th}>#</th><th style={S.th}>Student</th><th style={S.th}>Entries</th><th style={S.th}>Average Namaz</th><th style={S.th}>Total Points</th></tr></thead>
      <tbody>{studentSummary.map((st,i)=><tr key={st.id} style={{background:i===0?`${C.gold}08`:undefined}}>
        <td style={{...S.td,fontWeight:"800",color:i===0?C.gold:"#aaa"}}>{i===0?"👑":i+1}</td>
        <td style={{...S.td,fontWeight:"700"}}>{st.name}</td>
        <td style={S.td}>{st.entries}</td>
        <td style={S.td}><span style={{color:st.namazAvg>=4?C.green:st.namazAvg>=2?C.amber:C.red,fontWeight:"700"}}>{st.namazAvg}/5</span></td>
        <td style={{...S.td,fontWeight:"900",color:C.gold}}>{st.totalPts}</td>
      </tr>)}</tbody>
    </table></div></div>}
  </div>;
}

export default TarbiyahDiary;
