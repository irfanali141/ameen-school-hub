/* eslint-disable */
import { useState, useEffect } from "react";
import { C, S, hBadge, pBar } from "../../constants";
import { supabase } from "../../supabase";

function WifaqCompliance({addData}){
  const [records,setRecords]=useState([]); const [show,setShow]=useState(false);
  const [f,setF]=useState({subject:"",class:"",teacher:"",syllabusCompleted:0,totalSyllabus:100,examDate:"",examType:"internal",status:"in_progress",notes:""});
  useEffect(()=>{ const load=async()=>{ const {data}=await supabase.from("wifaq_compliance").select("*").order("created_at",{ascending:false}).limit(50); setRecords(data||[]); }; load(); },[]);
  const add=async()=>{ if(!f.subject)return; await addData("wifaq_compliance",{...f,syllabusCompleted:Number(f.syllabusCompleted),totalSyllabus:Number(f.totalSyllabus)}); setShow(false); setF({subject:"",class:"",teacher:"",syllabusCompleted:0,totalSyllabus:100,examDate:"",examType:"internal",status:"in_progress",notes:""}); };
  const subjects=["Tafseer","Hadith","Fiqh","Aqeedah","Nahw","Sarf","Balaghat","Mantiq","Falsafa","Seerah","Tajweed","Urdu","English","Mathematics"];
  const statConfig={in_progress:{c:C.amber,l:"جاری"},completed:{c:C.green,l:"مکمل"},delayed:{c:C.red,l:"تاخیر"},pending:{c:"#888",l:"زیر التواء"}};
  const overallPct=records.length>0?Math.round(records.reduce((s,r)=>s+Math.round((r.syllabusCompleted/r.totalSyllabus)*100),0)/records.length):0;
  return <div style={S.page}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
      <div><div style={{fontSize:"1.1rem",fontWeight:"700",color:C.navy}}>🕌 Wifaq Compliance</div><div style={{fontSize:"0.62rem",color:"#888",marginTop:"2px"}}>Curriculum Completion — Wifaq ul Madaris Standard</div></div>
      <button style={S.addBtn} onClick={()=>setShow(!show)}>+ New Subject</button>
    </div>
    <div className="hv-card" style={{...S.card,marginBottom:"20px",background:`linear-gradient(135deg,${C.navyDark},${C.navyMid})`,color:C.white,textAlign:"center"}}>
      <div style={{fontSize:"0.65rem",opacity:0.6,marginBottom:"8px"}}>Total Curriculum Completion</div>
      <div style={{fontSize:"3rem",fontWeight:"900",color:C.gold}}>{overallPct}%</div>
      <div style={{marginTop:"12px",background:"rgba(255,255,255,0.1)",borderRadius:"20px",height:"8px",overflow:"hidden"}}><div style={{height:"100%",background:`linear-gradient(90deg,${C.gold},${C.goldDark})`,width:`${overallPct}%`,borderRadius:"20px"}}/></div>
      <div style={{fontSize:"0.6rem",opacity:0.6,marginTop:"8px"}}>{records.length} Subjects</div>
    </div>
    {show&&<div className="hv-card" style={{...S.card,marginBottom:"20px",background:`linear-gradient(135deg,${C.goldLight},#fdf8ee)`}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>Subject *</label><select style={S.inpSm} value={f.subject} onChange={e=>setF({...f,subject:e.target.value})}><option value="">-- Select --</option>{subjects.map(s=><option key={s}>{s}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>درجہ</label><input style={S.inpSm} value={f.class} onChange={e=>setF({...f,class:e.target.value})} placeholder="Thaniyah, Thalitha..."/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>استاد</label><input style={S.inpSm} value={f.teacher} onChange={e=>setF({...f,teacher:e.target.value})} placeholder="Name..."/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>Status</label><select style={S.inpSm} value={f.status} onChange={e=>setF({...f,status:e.target.value})}>{Object.entries(statConfig).map(([k,v])=><option key={k} value={k}>{v.l}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>Completed Lessons</label><input style={{...S.inpSm,direction:"ltr"}} type="number" value={f.syllabusCompleted} onChange={e=>setF({...f,syllabusCompleted:e.target.value})}/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>Total Lessons</label><input style={{...S.inpSm,direction:"ltr"}} type="number" value={f.totalSyllabus} onChange={e=>setF({...f,totalSyllabus:e.target.value})}/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>Exam Date</label><input style={{...S.inpSm,direction:"ltr"}} type="date" value={f.examDate} onChange={e=>setF({...f,examDate:e.target.value})}/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>Type</label><select style={S.inpSm} value={f.examType} onChange={e=>setF({...f,examType:e.target.value})}><option value="internal">Internal</option><option value="wifaq">Wifaq</option><option value="board">Board</option></select></div>
      </div>
      <button style={S.saveBtn} onClick={add}>✅ Save</button>
    </div>}
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:"14px"}}>
      {records.map(r=>{ const sc=statConfig[r.status]||statConfig.in_progress; const pct=Math.round((r.syllabusCompleted/(r.totalSyllabus||1))*100); return <div key={r.id} className="hv-card" style={{...S.card,borderTop:`4px solid ${sc.c}`}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:"8px"}}><div><div style={{fontSize:"0.82rem",fontWeight:"700",color:C.navy}}>🕌 {r.subject}</div><div style={{fontSize:"0.6rem",color:"#888",marginTop:"2px"}}>{r.class} • {r.teacher}</div></div><span style={hBadge(sc.c,sc.c+"15")}>{sc.l}</span></div>
        <div style={{marginBottom:"6px"}}>{pBar(r.syllabusCompleted,r.totalSyllabus||1,pct>=80?C.green:pct>=50?C.amber:C.red)}</div>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:"0.62rem"}}><span style={{color:"#888"}}>{r.syllabusCompleted}/{r.totalSyllabus} lessons</span><span style={{fontWeight:"700",color:pct>=80?C.green:pct>=50?C.amber:C.red}}>{pct}%</span></div>
        {r.examDate&&<div style={{fontSize:"0.58rem",color:C.gold,marginTop:"6px",fontFamily:"monospace",direction:"ltr"}}>Exam: {r.examDate}</div>}
      </div>; })}
      {records.length===0&&<div className="hv-card ur" style={{...S.card,textAlign:"center",color:"#bbb",padding:"40px",gridColumn:"1/-1"}}>کوئی اندراج نہیں</div>}
    </div>
  </div>;
}

export default WifaqCompliance;
