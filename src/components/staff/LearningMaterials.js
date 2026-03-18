/* eslint-disable */
import { useState, useEffect } from "react";
import { C, S, hBadge } from "../../constants";
import { db, collection, onSnapshot, query, orderBy, limit } from "../../firebase";

function LearningMaterials({teachers,addData}){
  const [materials,setMaterials]=useState([]); const [show,setShow]=useState(false); const [filter,setFilter]=useState("all");
  const [f,setF]=useState({title:"",subject:"",grade:"",type:"pdf",description:"",link:"",teacherId:""});
  useEffect(()=>{ return onSnapshot(query(collection(db,"learning_materials"),orderBy("createdAt","desc"),limit(100)),s=>setMaterials(s.docs.map(d=>({id:d.id,...d.data()}))));  },[]);
  const add=async()=>{ if(!f.title)return; await addData("learning_materials",{...f}); setShow(false); setF({title:"",subject:"",grade:"",type:"pdf",description:"",link:"",teacherId:""}); };
  const types={pdf:{c:C.red,bg:"#fee2e2",i:"📄",l:"PDF"},video:{c:C.abuBakr,bg:"#dbeafe",i:"🎬",l:"ویڈیو"},audio:{c:C.purple,bg:"#ede9fe",i:"🎵",l:"آڈیو"},link:{c:C.teal,bg:"#ccfbf1",i:"🔗",l:"لنک"},quiz:{c:C.amber,bg:"#fef3c7",i:"❓",l:"کوئز"},assignment:{c:C.gold,bg:C.goldLight,i:"📝",l:"اسائنمنٹ"}};
  const filtered=filter==="all"?materials:materials.filter(m=>m.type===filter);

  const G="#d4af37"; const N="#0f172a"; const N2="#1e293b";
  const glass={background:"rgba(255,255,255,0.07)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:"16px"};
  const inp={width:"100%",padding:"10px 14px",borderRadius:"10px",border:"1px solid rgba(212,175,55,0.25)",background:"rgba(255,255,255,0.06)",color:"#f1f5f9",fontSize:"0.8rem",fontFamily:"'Public Sans',sans-serif",outline:"none",boxSizing:"border-box",direction:"rtl",colorScheme:"dark"};
  const lbl={fontSize:"0.7rem",color:"rgba(212,175,55,0.8)",marginBottom:"6px",display:"block",fontWeight:"600"};
  return <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#0f172a 0%,#0d1f3c 50%,#0a1628 100%)",padding:"24px 20px",fontFamily:"'Public Sans',sans-serif",direction:"rtl"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"24px",flexWrap:"wrap",gap:"12px"}}>
      <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
        <div style={{width:"44px",height:"44px",borderRadius:"12px",background:"linear-gradient(135deg,#d4af37,#b8960a)",display:"flex",alignItems:"center",justifyContent:"center"}}><span className="material-symbols-rounded" style={{fontSize:"24px",color:N}}>menu_book</span></div>
        <div><h2 style={{margin:0,fontSize:"1.4rem",fontWeight:"800",color:"#f1f5f9"}}>تعلیمی مواد</h2><p style={{margin:0,fontSize:"0.72rem",color:"rgba(212,175,55,0.7)"}}>ڈاؤنلوڈ، ویڈیو، اسائنمنٹ</p></div>
      </div>
      <button style={{display:"flex",alignItems:"center",gap:"8px",padding:"10px 20px",borderRadius:"12px",border:"1px solid #d4af37",background:show?"rgba(212,175,55,0.15)":"transparent",color:"#d4af37",fontWeight:"700",fontSize:"0.82rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif"}} onClick={()=>setShow(!show)}><span className="material-symbols-rounded" style={{fontSize:"18px"}}>{show?"close":"add_circle"}</span>{show?"منسوخ":"نیا مواد"}</button>
    </div>
    <div style={{display:"flex",gap:"8px",marginBottom:"16px",flexWrap:"wrap"}}>
      {[["all","📦 سب"],...Object.entries(types).map(([k,v])=>[k,`${v.i} ${v.l}`])].map(([t,l])=><button key={t} onClick={()=>setFilter(t)} style={{padding:"6px 12px",borderRadius:"20px",border:filter===t?"none":"1px solid rgba(255,255,255,0.1)",cursor:"pointer",fontSize:"0.62rem",fontWeight:filter===t?"700":"400",background:filter===t?"linear-gradient(135deg,#d4af37,#b8960a)":"rgba(255,255,255,0.04)",color:filter===t?"#0f172a":"rgba(255,255,255,0.6)",fontFamily:"inherit"}}>{l}</button>)}
    </div>
    {show&&<div style={{...glass,padding:"24px",marginBottom:"20px",borderColor:"rgba(212,175,55,0.3)"}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div style={{gridColumn:"1/-1"}}><label style={lbl}>عنوان *</label><input style={inp} value={f.title} onChange={e=>setF({...f,title:e.target.value})} placeholder="مواد کا نام..."/></div>
        <div><label style={lbl}>قسم</label><select style={inp} value={f.type} onChange={e=>setF({...f,type:e.target.value})}>{Object.entries(types).map(([k,v])=><option key={k} value={k} style={{background:N2}}>{v.i} {v.l}</option>)}</select></div>
        <div><label style={lbl}>مضمون</label><input style={inp} value={f.subject} onChange={e=>setF({...f,subject:e.target.value})} placeholder="ریاضی..."/></div>
        <div><label style={lbl}>جماعت</label><input style={inp} value={f.grade} onChange={e=>setF({...f,grade:e.target.value})} placeholder="8..."/></div>
        <div><label style={lbl}>استاد</label><select style={inp} value={f.teacherId} onChange={e=>setF({...f,teacherId:e.target.value})}><option value="" style={{background:N2}}>-- منتخب کریں --</option>{teachers.map(t=><option key={t.id} value={t.id} style={{background:N2}}>{t.name}</option>)}</select></div>
        <div style={{gridColumn:"1/-1"}}><label style={lbl}>لنک</label><input style={{...inp,direction:"ltr"}} value={f.link} onChange={e=>setF({...f,link:e.target.value})} placeholder="https://..."/></div>
        <div style={{gridColumn:"1/-1"}}><label style={lbl}>تفصیل</label><textarea style={{...inp,minHeight:"60px",resize:"vertical"}} value={f.description} onChange={e=>setF({...f,description:e.target.value})} placeholder="مختصر تفصیل..."/></div>
      </div>
      <button style={{background:"linear-gradient(135deg,#d4af37,#b8960a)",color:N,border:"none",borderRadius:"12px",padding:"11px 26px",fontSize:"0.82rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif",fontWeight:"700"}} onClick={add}>شامل کریں</button>
    </div>}
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:"14px"}}>
      {filtered.map(m=>{ const tc=types[m.type]||types.link; const t=teachers.find(x=>x.id===m.teacherId); return <div key={m.id} style={{...glass,padding:"18px",borderTop:`3px solid ${tc.c}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"8px"}}><div style={{flex:1,display:"flex",alignItems:"center",gap:"6px"}}><span style={{fontSize:"1.1rem"}}>{tc.i}</span><span style={{fontSize:"0.8rem",fontWeight:"700",color:"#f1f5f9"}}>{m.title}</span></div><span style={{padding:"3px 8px",borderRadius:"20px",fontSize:"0.6rem",fontWeight:"700",background:`${tc.c}20`,color:tc.c}}>{tc.l}</span></div>
        {m.subject&&<div style={{fontSize:"0.62rem",color:"rgba(255,255,255,0.5)",marginBottom:"4px"}}>📖 {m.subject}{m.grade&&` • جماعت ${m.grade}`}</div>}
        {t&&<div style={{fontSize:"0.62rem",color:"rgba(255,255,255,0.5)",marginBottom:"6px"}}>👤 {t.name}</div>}
        {m.description&&<div style={{fontSize:"0.62rem",color:"rgba(255,255,255,0.45)",lineHeight:"1.5",marginBottom:"8px"}}>{m.description.slice(0,80)}</div>}
        {m.link&&<a href={m.link} target="_blank" rel="noreferrer" style={{display:"inline-block",background:`linear-gradient(135deg,${tc.c},${tc.c}cc)`,color:"#fff",padding:"6px 14px",borderRadius:"8px",fontSize:"0.62rem",fontWeight:"700",textDecoration:"none",direction:"ltr"}}>⬇️ کھولیں</a>}
      </div>; })}
      {filtered.length===0&&<div style={{...glass,textAlign:"center",color:"rgba(255,255,255,0.3)",padding:"40px",gridColumn:"1/-1"}}>کوئی مواد نہیں</div>}
    </div>
  </div>;
}

export default LearningMaterials;
