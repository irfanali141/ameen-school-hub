/* eslint-disable */
import { useState, useEffect } from "react";
import { C, S, hBadge } from "../../constants";
import { supabase } from "../../supabase";

function CurriculumHub({teachers,addData}){
  const [resources,setResources]=useState([]); const [show,setShow]=useState(false); const [filter,setFilter]=useState("all");
  const [f,setF]=useState({title:"",subject:"",grade:"",type:"notes",description:"",link:"",uploadedBy:"",tags:""});
  useEffect(()=>{ const load=async()=>{ const {data}=await supabase.from("curriculum_resources").select("*").order("created_at",{ascending:false}).limit(100); setResources(data||[]); }; load(); },[]);
  const add=async()=>{ if(!f.title)return; await addData("curriculum_resources",{...f}); setShow(false); setF({title:"",subject:"",grade:"",type:"notes",description:"",link:"",uploadedBy:"",tags:""}); };
  const types={notes:{c:C.abuBakr,bg:"#dbeafe",i:"📝",l:"Notes"},book:{c:C.navy,bg:"#e0e7ff",i:"📚",l:"Book"},video:{c:C.red,bg:"#fee2e2",i:"🎬",l:"Video"},worksheet:{c:C.green,bg:"#dcfce7",i:"📋",l:"Worksheet"},exam_paper:{c:C.amber,bg:"#fef3c7",i:"📄",l:"Exam Paper"},islamic:{c:C.gold,bg:C.goldLight,i:"🕌",l:"Islamic"},other:{c:"#888",bg:"#f3f4f6",i:"📦",l:"Other"}};
  const filtered=filter==="all"?resources:resources.filter(r=>r.type===filter);
  return <div style={S.page}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
      <div><div style={{fontSize:"1.1rem",fontWeight:"700",color:C.navy}}>📚 Curriculum Resources</div><div style={{fontSize:"0.62rem",color:"#888",marginTop:"2px"}}>Notes, books, videos, exam papers</div></div>
      <button style={S.addBtn} onClick={()=>setShow(!show)}>+ New Resource</button>
    </div>
    <div style={{display:"flex",gap:"8px",marginBottom:"16px",flexWrap:"wrap"}}>
      {[["all","📦 All"],["notes","📝 Notes"],["book","📚 Book"],["video","🎬 Video"],["worksheet","📋 Worksheet"],["exam_paper","📄 Exam Paper"],["islamic","🕌 Islamic"]].map(([t,l])=><button key={t} onClick={()=>setFilter(t)} style={{padding:"6px 12px",borderRadius:"20px",border:"none",cursor:"pointer",fontSize:"0.62rem",fontWeight:filter===t?"700":"400",background:filter===t?`linear-gradient(135deg,${C.gold},${C.goldDark})`:C.white,color:filter===t?C.white:"#888",fontFamily:"inherit"}}>{l}</button>)}
    </div>
    {show&&<div className="hv-card" style={{...S.card,marginBottom:"20px",background:`linear-gradient(135deg,${C.goldLight},#fdf8ee)`,border:`2px solid ${C.gold}30`}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div style={{gridColumn:"1/-1"}}><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>Title *</label><input style={S.inpSm} value={f.title} onChange={e=>setF({...f,title:e.target.value})} placeholder="Resource name..."/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>Type</label><select style={S.inpSm} value={f.type} onChange={e=>setF({...f,type:e.target.value})}>{Object.entries(types).map(([k,v])=><option key={k} value={k}>{v.i} {v.l}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>Subject</label><input style={S.inpSm} value={f.subject} onChange={e=>setF({...f,subject:e.target.value})} placeholder="Mathematics, Urdu..."/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>Grade</label><input style={S.inpSm} value={f.grade} onChange={e=>setF({...f,grade:e.target.value})} placeholder="8, 9, 10..."/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>Uploaded By</label><select style={S.inpSm} value={f.uploadedBy} onChange={e=>setF({...f,uploadedBy:e.target.value})}><option value="">-- Select --</option>{teachers.map(t=><option key={t.id} value={t.name}>{t.name}</option>)}</select></div>
        <div style={{gridColumn:"1/-1"}}><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>Link (optional)</label><input style={{...S.inpSm,direction:"ltr"}} value={f.link} onChange={e=>setF({...f,link:e.target.value})} placeholder="https://..."/></div>
        <div style={{gridColumn:"1/-1"}}><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>Details</label><textarea style={{...S.inpSm,minHeight:"60px",resize:"vertical"}} value={f.description} onChange={e=>setF({...f,description:e.target.value})} placeholder="Short Details..."/></div>
      </div>
      <button style={S.saveBtn} onClick={add}>✅ Add</button>
    </div>}
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:"14px"}}>
      {filtered.map(r=>{ const tc=types[r.type]||types.other; return <div key={r.id} className="hv-card" style={{...S.card,borderTop:`4px solid ${tc.c}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"8px"}}><div style={{flex:1}}><div style={{display:"flex",alignItems:"center",gap:"6px",marginBottom:"4px"}}><span style={{fontSize:"1.1rem"}}>{tc.i}</span><span style={{fontSize:"0.8rem",fontWeight:"700",color:C.navy}}>{r.title}</span></div></div><span style={hBadge(tc.c,tc.bg)}>{tc.l}</span></div>
        {r.subject&&<div style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px"}}>📖 {r.subject}{r.grade&&` • Grade ${r.grade}`}</div>}
        {r.uploadedBy&&<div style={{fontSize:"0.62rem",color:"#888",marginBottom:"6px"}}>👤 {r.uploadedBy}</div>}
        {r.description&&<div style={{fontSize:"0.62rem",color:"#666",lineHeight:"1.5",marginBottom:"8px"}}>{r.description.slice(0,100)}</div>}
        {r.link&&<a href={r.link} target="_blank" rel="noreferrer" style={{fontSize:"0.62rem",color:C.abuBakr,fontWeight:"600",direction:"ltr",display:"block"}}>🔗 Open Link</a>}
      </div>; })}
      {filtered.length===0&&<div className="hv-card" style={{...S.card,textAlign:"center",color:"#bbb",padding:"40px",gridColumn:"1/-1"}}>No resources found</div>}
    </div>
  </div>;
}

export default CurriculumHub;
