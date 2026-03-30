/* eslint-disable */
import { useState, useEffect } from "react";
import { C, S, hBadge, HOUSES, sLabel } from "../../constants";
import { supabase } from "../../supabase";

function StudentHealth({students,addData}){
  const [records,setRecords]=useState([]); const [show,setShow]=useState(false);
  const [f,setF]=useState({studentId:"",date:new Date().toISOString().split("T")[0],type:"checkup",condition:"",treatment:"",doctor:"",followUp:"",notes:"",severity:"low"});
  useEffect(()=>{ const load=async()=>{ const {data}=await supabase.from("health_records").select("*").order("created_at",{ascending:false}).limit(50); setRecords(data||[]); }; load(); },[]);
  const add=async()=>{ if(!f.studentId)return; await addData("health_records",{...f}); setShow(false); setF({studentId:"",date:new Date().toISOString().split("T")[0],type:"checkup",condition:"",treatment:"",doctor:"",followUp:"",notes:"",severity:"low"}); };
  const types={checkup:"🩺 Routine Checkup",sick:"🤒 Illness",injury:"🤕 Injury",dental:"🦷 Dental",eye:"👁️ Eye",mental:"🧠 Mental Health",other:"📋 Other"};
  const sevConfig={low:{c:C.green,bg:"#dcfce7",l:"Minor"},medium:{c:C.amber,bg:"#fef3c7",l:"Medium"},high:{c:C.red,bg:"#fee2e2",l:"Serious"}};
  const recent=records.slice(0,5);
  const studentHealth=students.map(st=>{ const stR=records.filter(r=>r.studentId===st.id); return {...st,visits:stR.length,lastVisit:stR[0]?.date||"—"}; }).filter(s=>s.visits>0).slice(0,8);

  const G="#d4af37"; const N="#0f172a"; const N2="#1e293b";
  const glass={background:"rgba(255,255,255,0.07)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:"16px"};
  const inp={width:"100%",padding:"10px 14px",borderRadius:"10px",border:"1px solid rgba(212,175,55,0.25)",background:"rgba(255,255,255,0.06)",color:"#f1f5f9",fontSize:"0.8rem",fontFamily:"'Public Sans',sans-serif",outline:"none",boxSizing:"border-box",direction:"ltr",colorScheme:"dark"};
  const lbl={fontSize:"0.7rem",color:"rgba(212,175,55,0.8)",marginBottom:"6px",display:"block",fontWeight:"600"};
  return <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#0f172a 0%,#0d1f3c 50%,#0a1628 100%)",padding:"24px 20px",fontFamily:"'Public Sans',sans-serif",direction:"ltr"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"24px",flexWrap:"wrap",gap:"12px"}}>
      <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
        <div style={{width:"44px",height:"44px",borderRadius:"12px",background:"linear-gradient(135deg,#d4af37,#b8960a)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 20px rgba(212,175,55,0.4)"}}><span className="material-symbols-rounded" style={{fontSize:"24px",color:N}}>health_and_safety</span></div>
        <div><h2 style={{margin:0,fontSize:"1.4rem",fontWeight:"800",color:"#f1f5f9"}}>Health & Fitness</h2><p style={{margin:0,fontSize:"0.72rem",color:"rgba(212,175,55,0.7)"}}>Health records of students</p></div>
      </div>
      <button style={{display:"flex",alignItems:"center",gap:"8px",padding:"10px 20px",borderRadius:"12px",border:"1px solid #d4af37",background:show?"rgba(212,175,55,0.15)":"transparent",color:"#d4af37",fontWeight:"700",fontSize:"0.82rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif"}} onClick={()=>setShow(!show)}><span className="material-symbols-rounded" style={{fontSize:"18px"}}>{show?"close":"add_circle"}</span>{show?"Cancel":"New Record"}</button>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:"12px",marginBottom:"20px"}}>
      {[{c:"#60a5fa",i:"📋",n:records.length,l:"Total Visits"},{c:"#f87171",i:"🤒",n:records.filter(r=>r.type==="sick").length,l:"Illness"},{c:"#fb923c",i:"🤕",n:records.filter(r=>r.type==="injury").length,l:"Injury"},{c:"#4ade80",i:"✅",n:records.filter(r=>r.type==="checkup").length,l:"Checkup"}].map((x,i)=><div key={i} style={{background:`${x.c}15`,borderRadius:"16px",padding:"16px",border:`1px solid ${x.c}30`,textAlign:"center"}}><div style={{fontSize:"1.3rem"}}>{x.i}</div><div style={{fontSize:"1.4rem",fontWeight:"900",color:x.c}}>{x.n}</div><div style={{fontSize:"0.6rem",color:"rgba(255,255,255,0.5)"}}>{x.l}</div></div>)}
    </div>
    {show&&<div style={{...glass,padding:"24px",marginBottom:"20px",borderColor:"rgba(212,175,55,0.3)"}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div><label style={lbl}>Student *</label><select style={inp} value={f.studentId} onChange={e=>setF({...f,studentId:e.target.value})}><option value="" style={{background:N2}}>-- Select --</option>{students.map(s=><option key={s.id} value={s.id} style={{background:N2}}>{sLabel(s)}</option>)}</select></div>
        <div><label style={lbl}>Date</label><input style={{...inp,direction:"ltr",colorScheme:"dark"}} type="date" value={f.date} onChange={e=>setF({...f,date:e.target.value})}/></div>
        <div><label style={lbl}>Type</label><select style={inp} value={f.type} onChange={e=>setF({...f,type:e.target.value})}>{Object.entries(types).map(([k,v])=><option key={k} value={k} style={{background:N2}}>{v}</option>)}</select></div>
        <div><label style={lbl}>Severity</label><select style={inp} value={f.severity} onChange={e=>setF({...f,severity:e.target.value})}><option value="low" style={{background:N2}}>Minor</option><option value="medium" style={{background:N2}}>Moderate</option><option value="high" style={{background:N2}}>Serious</option></select></div>
        <div><label style={lbl}>بیماری/مسئلہ</label><input style={inp} value={f.condition} onChange={e=>setF({...f,condition:e.target.value})} placeholder="Fever, headache..."/></div>
        <div><label style={lbl}>علاج</label><input style={inp} value={f.treatment} onChange={e=>setF({...f,treatment:e.target.value})} placeholder="Medicine, rest..."/></div>
        <div><label style={lbl}>ڈاکٹر</label><input style={inp} value={f.doctor} onChange={e=>setF({...f,doctor:e.target.value})} placeholder="Doctor name..."/></div>
        <div><label style={lbl}>Follow-up Date</label><input style={{...inp,direction:"ltr",colorScheme:"dark"}} type="date" value={f.followUp} onChange={e=>setF({...f,followUp:e.target.value})}/></div>
      </div>
      <button style={{background:"linear-gradient(135deg,#d4af37,#b8960a)",color:N,border:"none",borderRadius:"12px",padding:"11px 26px",fontSize:"0.82rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif",fontWeight:"700"}} onClick={add}>Record Save</button>
    </div>}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"20px"}}>
      <div style={{...glass,padding:"20px"}}>
        <div style={{fontSize:"0.85rem",fontWeight:"700",color:"#d4af37",marginBottom:"16px"}}>📋 Historical Record</div>
        {recent.map(r=>{ const st=students.find(s=>s.id===r.studentId); const sev=sevConfig[r.severity]||sevConfig.low; return <div key={r.id} style={{display:"flex",gap:"10px",marginBottom:"12px",padding:"10px",background:"rgba(255,255,255,0.04)",borderRadius:"10px",border:"1px solid rgba(255,255,255,0.08)"}}>
          <div style={{width:"36px",height:"36px",borderRadius:"50%",background:sev.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1rem",flexShrink:0}}>{types[r.type]?.split(" ")[0]||"📋"}</div>
          <div style={{flex:1}}><div style={{fontSize:"0.7rem",fontWeight:"700",color:"#f1f5f9"}}>{st?.name||"—"}</div><div style={{fontSize:"0.6rem",color:"rgba(255,255,255,0.5)"}}>{r.condition||types[r.type]||r.type}</div><div style={{fontSize:"0.55rem",color:"rgba(255,255,255,0.35)",fontFamily:"monospace",direction:"ltr"}}>{r.date}</div></div>
          <span style={{...hBadge(sev.c,sev.bg),fontSize:"0.5rem",alignSelf:"flex-start"}}>{sev.l}</span>
        </div>; })}
        {records.length===0&&<div style={{textAlign:"center",color:"rgba(255,255,255,0.3)",fontSize:"0.65rem",padding:"20px"}} className="ur">کوئی اندراج نہیں</div>}
      </div>
      <div style={{...glass,padding:"20px"}}>
        <div style={{fontSize:"0.85rem",fontWeight:"700",color:"#d4af37",marginBottom:"16px"}}>👥 Students Health Summary</div>
        {studentHealth.map(s=>{ const h=HOUSES.find(x=>x.id===s.houseId)||{}; return <div key={s.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"10px",padding:"8px 12px",background:"rgba(255,255,255,0.04)",borderRadius:"10px",border:"1px solid rgba(255,255,255,0.06)"}}>
          <div><div style={{fontSize:"0.7rem",fontWeight:"700",color:"#f1f5f9"}}>{s.name}</div><div style={{fontSize:"0.58rem",color:"rgba(255,255,255,0.5)"}}>Last Visit: {s.lastVisit}</div></div>
          <span style={{padding:"3px 8px",borderRadius:"20px",fontSize:"0.55rem",fontWeight:"700",background:"rgba(212,175,55,0.15)",color:"#d4af37"}}>{s.visits} visits</span>
        </div>; })}
        {studentHealth.length===0&&<div style={{textAlign:"center",color:"rgba(255,255,255,0.3)",fontSize:"0.65rem",padding:"20px"}} className="ur">کوئی ڈیٹا نہیں</div>}
      </div>
    </div>
  </div>;
}

export default StudentHealth;
