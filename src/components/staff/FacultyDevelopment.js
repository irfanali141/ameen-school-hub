/* eslint-disable */
import { useState, useEffect } from "react";
import { C, S, hBadge } from "../../constants";
import { supabase } from "../../supabase";
import EmptyState from '../ui/EmptyState';

function FacultyDevelopment({teachers,addData}){
  const [programs,setPrograms]=useState([]); const [enrollments,setEnrollments]=useState([]); const [show,setShow]=useState(false); const [tab,setTab]=useState("programs");
  const [f,setF]=useState({title:"",type:"training",trainer:"",startDate:"",endDate:"",hours:0,description:"",certificate:false});
  const [enrF,setEnrF]=useState({teacherId:"",programId:"",status:"enrolled",score:"",notes:""});
  useEffect(()=>{ const load=async()=>{ const {data:p}=await supabase.from("faculty_programs").select("*"); setPrograms(p||[]); const {data:e}=await supabase.from("faculty_enrollments").select("*"); setEnrollments(e||[]); }; load(); },[]);
  const add=async()=>{ if(!f.title)return; await addData("faculty_programs",{...f,hours:Number(f.hours)}); setShow(false); setF({title:"",type:"training",trainer:"",startDate:"",endDate:"",hours:0,description:"",certificate:false}); };
  const enroll=async()=>{ if(!enrF.teacherId||!enrF.programId)return; await addData("faculty_enrollments",{...enrF}); setEnrF({teacherId:"",programId:"",status:"enrolled",score:"",notes:""}); };
  const types={training:{c:C.abuBakr,bg:"#dbeafe",i:"🎓",l:"Training"},workshop:{c:C.green,bg:"#dcfce7",i:"🔧",l:"Workshop"},seminar:{c:C.purple,bg:"#ede9fe",i:"🎤",l:"Seminar"},online:{c:C.teal,bg:"#ccfbf1",i:"💻",l:"Online"},islamic:{c:C.gold,bg:C.goldLight,i:"🕌",l:"Islamic"}};
  return <div style={S.page}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
      <div><div style={{fontSize:"1.1rem",fontWeight:"700",color:C.navy}}>👩‍🏫 Teacher Progress Program</div><div style={{fontSize:"0.62rem",color:"#888",marginTop:"2px"}}>Training Programs, Workshops, Certificates</div></div>
      <button style={S.addBtn} onClick={()=>setShow(!show)}>+ New Program</button>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:"12px",marginBottom:"20px"}}>
      {[{c:C.abuBakr,i:"📋",n:programs.length,l:"Program"},{c:C.green,i:"✅",n:enrollments.filter(e=>e.status==="completed").length,l:"Complete"},{c:C.amber,i:"⏳",n:enrollments.filter(e=>e.status==="enrolled").length,l:"Ongoing"},{c:C.gold,i:"🏆",n:enrollments.filter(e=>e.status==="completed"&&e.score).length,l:"Certified"}].map((x,i)=><div key={i} style={{background:`linear-gradient(135deg,${x.c}12,${x.c}05)`,borderRadius:"16px",padding:"16px",border:`2px solid ${x.c}20`,textAlign:"center"}}><div style={{fontSize:"1.3rem"}}>{x.i}</div><div style={{fontSize:"1.4rem",fontWeight:"900",color:x.c}}>{x.n}</div><div style={{fontSize:"0.6rem",color:"#888"}}>{x.l}</div></div>)}
    </div>
    {show&&<div className="hv-card" style={{...S.card,marginBottom:"20px",background:`linear-gradient(135deg,${C.goldLight},#fdf8ee)`}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div style={{gridColumn:"1/-1"}}><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>Program Name *</label><input style={S.inpSm} value={f.title} onChange={e=>setF({...f,title:e.target.value})} placeholder="Modern Teaching Methods..."/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>Type</label><select style={S.inpSm} value={f.type} onChange={e=>setF({...f,type:e.target.value})}>{Object.entries(types).map(([k,v])=><option key={k} value={k}>{v.i} {v.l}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>Trainer</label><input style={S.inpSm} value={f.trainer} onChange={e=>setF({...f,trainer:e.target.value})} placeholder="Trainer name..."/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>Start</label><input style={{...S.inpSm,direction:"ltr"}} type="date" value={f.startDate} onChange={e=>setF({...f,startDate:e.target.value})}/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>End</label><input style={{...S.inpSm,direction:"ltr"}} type="date" value={f.endDate} onChange={e=>setF({...f,endDate:e.target.value})}/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>Hours</label><input style={{...S.inpSm,direction:"ltr"}} type="number" value={f.hours} onChange={e=>setF({...f,hours:e.target.value})}/></div>
        <div style={{display:"flex",alignItems:"center",gap:"8px",paddingTop:"20px"}}><input type="checkbox" checked={f.certificate} onChange={e=>setF({...f,certificate:e.target.checked})} id="cert"/><label htmlFor="cert" style={{fontSize:"0.68rem",color:C.navy,cursor:"pointer"}}>🏆 Certificate will be issued</label></div>
      </div>
      <button style={S.saveBtn} onClick={add}>✅ Program Add</button>
    </div>}
    <div style={{display:"flex",gap:"8px",marginBottom:"16px"}}>{[["programs","📋 Program"],["enroll","➕ Entry"],["history","📊 Date"]].map(([t,l])=><button key={t} onClick={()=>setTab(t)} style={{padding:"8px 14px",borderRadius:"10px",border:"none",cursor:"pointer",fontSize:"0.65rem",fontWeight:tab===t?"700":"400",background:tab===t?`linear-gradient(135deg,${C.gold},${C.goldDark})`:C.white,color:tab===t?C.white:"#888",fontFamily:"inherit"}}>{l}</button>)}</div>
    {tab==="programs"&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:"14px"}}>
      {programs.map(p=>{ const tc=types[p.type]||types.training; const enrolled=enrollments.filter(e=>e.programId===p.id).length; return <div key={p.id} className="hv-card" style={{...S.card,borderTop:`4px solid ${tc.c}`}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:"8px"}}><div style={{fontSize:"0.82rem",fontWeight:"700",color:C.navy}}>{tc.i} {p.title}</div><span style={hBadge(tc.c,tc.bg)}>{tc.l}</span></div>
        {p.trainer&&<div style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px"}}>👤 {p.trainer}</div>}
        <div style={{fontSize:"0.6rem",color:"#aaa",marginBottom:"8px",fontFamily:"monospace",direction:"ltr"}}>{p.startDate} → {p.endDate}</div>
        <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}><span style={{fontSize:"0.62rem",color:C.abuBakr}}>⏱️ {p.hours} hours</span><span style={hBadge(C.green,"#dcfce7")}>{enrolled} participants</span>{p.certificate&&<span style={hBadge(C.gold,C.goldLight)}>🏆 Certificate</span>}</div>
      </div>; })}
      {programs.length===0&&<div style={{gridColumn:"1/-1"}}><EmptyState icon="👩‍🏫" title="کوئی پروگرام نہیں" subtitle="ابھی تک کوئی ترقیاتی پروگرام شامل نہیں کیا گیا"/></div>}
    </div>}
    {tab==="enroll"&&<div className="hv-card" style={{...S.card,background:`linear-gradient(135deg,${C.goldLight},#fdf8ee)`}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>Teacher</label><select style={S.inpSm} value={enrF.teacherId} onChange={e=>setEnrF({...enrF,teacherId:e.target.value})}><option value="">-- Select --</option>{teachers.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>Program</label><select style={S.inpSm} value={enrF.programId} onChange={e=>setEnrF({...enrF,programId:e.target.value})}><option value="">-- Select --</option>{programs.map(p=><option key={p.id} value={p.id}>{p.title}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>Status</label><select style={S.inpSm} value={enrF.status} onChange={e=>setEnrF({...enrF,status:e.target.value})}><option value="enrolled">Entry</option><option value="completed">Complete</option><option value="dropped">Dropped</option></select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>Score</label><input style={S.inpSm} value={enrF.score} onChange={e=>setEnrF({...enrF,score:e.target.value})} placeholder="A, 90%..."/></div>
      </div>
      <button style={S.saveBtn} onClick={enroll}>✅ Enroll</button>
    </div>}
    {tab==="history"&&<div style={S.card} className="hv-card"><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}>
      <thead><tr><th style={S.th}>Teacher</th><th style={S.th}>Program</th><th style={S.th}>Status</th><th style={S.th}>Score</th></tr></thead>
      <tbody>{enrollments.map(e=>{ const t=teachers.find(x=>x.id===e.teacherId); const p=programs.find(x=>x.id===e.programId); return <tr key={e.id}>
        <td style={{...S.td,fontWeight:"700"}}>{t?.name||"—"}</td><td style={S.td}>{p?.title||"—"}</td>
        <td style={S.td}><span style={{padding:"3px 8px",borderRadius:"20px",fontSize:"0.55rem",fontWeight:"700",background:e.status==="completed"?"#dcfce7":e.status==="dropped"?"#fee2e2":"#fef3c7",color:e.status==="completed"?C.green:e.status==="dropped"?C.red:C.amber}}>{e.status==="completed"?"✅ Complete":e.status==="dropped"?"❌ Dropped":"⏳ Ongoing"}</span></td>
        <td style={S.td}>{e.score||"—"}</td>
      </tr>; })}{enrollments.length===0&&<tr><td colSpan={4} style={{...S.td,textAlign:"center",color:"#bbb",padding:"40px"}}><span className="ur">کوئی اندراج نہیں</span></td></tr>}</tbody>
    </table></div></div>}
  </div>;
}

export default FacultyDevelopment;
