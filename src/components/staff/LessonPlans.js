/* eslint-disable */
import { useState, useEffect } from "react";
import { C, S, hBadge } from "../../constants";
import { db, collection, onSnapshot, query, orderBy, limit } from "../../firebase";

function LessonPlans({teachers,addData}){
  const [plans,setPlans]=useState([]); const [show,setShow]=useState(false);
  const [f,setF]=useState({title:"",subject:"",grade:"",teacherId:"",date:"",duration:40,objectives:"",activities:"",materials:"",homework:""});
  useEffect(()=>{ return onSnapshot(query(collection(db,"lesson_plans"),orderBy("createdAt","desc"),limit(50)),s=>setPlans(s.docs.map(d=>({id:d.id,...d.data()}))));  },[]);
  const add=async()=>{ if(!f.title||!f.subject)return; await addData("lesson_plans",{...f,duration:Number(f.duration)}); setShow(false); setF({title:"",subject:"",grade:"",teacherId:"",date:"",duration:40,objectives:"",activities:"",materials:"",homework:""}); };
  const subjects=["قرآن","تفسیر","حدیث","فقہ","عقیدہ","اردو","انگریزی","ریاضی","سائنس","نحو","صرف","تجوید"];

  const G="#d4af37"; const N="#0f172a"; const N2="#1e293b";
  const glass={background:"rgba(255,255,255,0.07)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:"16px"};
  const inp={width:"100%",padding:"10px 14px",borderRadius:"10px",border:"1px solid rgba(212,175,55,0.25)",background:"rgba(255,255,255,0.06)",color:"#f1f5f9",fontSize:"0.8rem",fontFamily:"'Public Sans',sans-serif",outline:"none",boxSizing:"border-box",direction:"rtl",colorScheme:"dark"};
  const lbl={fontSize:"0.7rem",color:"rgba(212,175,55,0.8)",marginBottom:"6px",display:"block",fontWeight:"600"};
  return <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#0f172a 0%,#0d1f3c 50%,#0a1628 100%)",padding:"24px 20px",fontFamily:"'Public Sans',sans-serif",direction:"rtl"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"24px",flexWrap:"wrap",gap:"12px"}}>
      <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
        <div style={{width:"44px",height:"44px",borderRadius:"12px",background:"linear-gradient(135deg,#d4af37,#b8960a)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 20px rgba(212,175,55,0.4)"}}><span className="material-symbols-rounded" style={{fontSize:"24px",color:N}}>assignment</span></div>
        <div><h2 style={{margin:0,fontSize:"1.4rem",fontWeight:"800",color:"#f1f5f9"}}>سبق کا منصوبہ</h2><p style={{margin:0,fontSize:"0.72rem",color:"rgba(212,175,55,0.7)"}}>Lesson Plans — مضامین اور اہداف</p></div>
      </div>
      <button style={{display:"flex",alignItems:"center",gap:"8px",padding:"10px 20px",borderRadius:"12px",border:"1px solid #d4af37",background:show?"rgba(212,175,55,0.15)":"transparent",color:"#d4af37",fontWeight:"700",fontSize:"0.82rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif"}} onClick={()=>setShow(!show)}><span className="material-symbols-rounded" style={{fontSize:"18px"}}>{show?"close":"add_circle"}</span>{show?"منسوخ":"نیا منصوبہ"}</button>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:"12px",marginBottom:"20px"}}>
      {[{c:"#60a5fa",i:"📅",n:plans.length,l:"کل منصوبے"},{c:"#4ade80",i:"📖",n:[...new Set(plans.map(p=>p.subject))].length,l:"مضامین"},{c:"#d4af37",i:"👨‍🏫",n:[...new Set(plans.map(p=>p.teacherId))].filter(Boolean).length,l:"اساتذہ"},{c:"#fb923c",i:"⏱️",n:plans.reduce((s,p)=>s+(p.duration||0),0),l:"کل منٹ"}].map((x,i)=><div key={i} style={{background:`${x.c}15`,borderRadius:"16px",padding:"16px",border:`1px solid ${x.c}30`,textAlign:"center"}}><div style={{fontSize:"1.3rem"}}>{x.i}</div><div style={{fontSize:"1.4rem",fontWeight:"900",color:x.c}}>{x.n}</div><div style={{fontSize:"0.6rem",color:"rgba(255,255,255,0.5)"}}>{x.l}</div></div>)}
    </div>
    {show&&<div className="hv-card" style={{...S.card,marginBottom:"20px",background:`linear-gradient(135deg,${C.goldLight},#fdf8ee)`,border:`2px solid ${C.gold}30`}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div style={{gridColumn:"1/-1"}}><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>عنوان *</label><input style={S.inpSm} value={f.title} onChange={e=>setF({...f,title:e.target.value})} placeholder="سبق کا عنوان..."/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>مضمون *</label><select style={S.inpSm} value={f.subject} onChange={e=>setF({...f,subject:e.target.value})}><option value="">-- منتخب کریں --</option>{subjects.map(s=><option key={s}>{s}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>جماعت</label><input style={S.inpSm} value={f.grade} onChange={e=>setF({...f,grade:e.target.value})} placeholder="8، 9..."/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>استاد</label><select style={S.inpSm} value={f.teacherId} onChange={e=>setF({...f,teacherId:e.target.value})}><option value="">-- منتخب کریں --</option>{teachers.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>تاریخ</label><input style={{...S.inpSm,direction:"ltr"}} type="date" value={f.date} onChange={e=>setF({...f,date:e.target.value})}/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>دورانیہ (منٹ)</label><input style={{...S.inpSm,direction:"ltr"}} type="number" value={f.duration} onChange={e=>setF({...f,duration:e.target.value})}/></div>
        <div style={{gridColumn:"1/-1"}}><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>اہداف</label><textarea style={{...S.inpSm,minHeight:"60px",resize:"vertical"}} value={f.objectives} onChange={e=>setF({...f,objectives:e.target.value})} placeholder="طالب علم کیا سیکھیں گے..."/></div>
        <div style={{gridColumn:"1/-1"}}><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>سرگرمیاں</label><textarea style={{...S.inpSm,minHeight:"60px",resize:"vertical"}} value={f.activities} onChange={e=>setF({...f,activities:e.target.value})} placeholder="کلاس میں کیا ہوگا..."/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>مواد</label><input style={S.inpSm} value={f.materials} onChange={e=>setF({...f,materials:e.target.value})} placeholder="کتاب، بورڈ..."/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>گھر کا کام</label><input style={S.inpSm} value={f.homework} onChange={e=>setF({...f,homework:e.target.value})} placeholder="ہوم ورک..."/></div>
      </div>
      <button style={S.saveBtn} onClick={add}>✅ منصوبہ محفوظ کریں</button>
    </div>}
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:"14px"}}>
      {plans.map(p=>{ const t=teachers.find(x=>x.id===p.teacherId); return <div key={p.id} className="hv-card" style={{...S.card,borderTop:`4px solid ${C.abuBakr}`}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:"8px"}}><div><div style={{fontSize:"0.85rem",fontWeight:"700",color:C.navy}}>{p.title}</div><div style={{fontSize:"0.62rem",color:"#888",marginTop:"2px"}}>{p.subject} • جماعت {p.grade}</div></div><span style={hBadge(C.abuBakr,"#dbeafe")}>⏱️ {p.duration}م</span></div>
        {t&&<div style={{fontSize:"0.62rem",color:"#888",marginBottom:"6px"}}>👤 {t.name}</div>}
        {p.objectives&&<div style={{background:"#f0fdf4",borderRadius:"8px",padding:"8px 12px",fontSize:"0.62rem",color:C.green,marginBottom:"6px"}}>🎯 {p.objectives.slice(0,80)}</div>}
        {p.homework&&<div style={{fontSize:"0.6rem",color:C.amber,fontWeight:"600"}}>📝 {p.homework}</div>}
      </div>; })}
      {plans.length===0&&<div className="hv-card" style={{...S.card,textAlign:"center",color:"#bbb",padding:"40px",gridColumn:"1/-1"}}><div style={{fontSize:"3rem",marginBottom:"12px"}}>📅</div>کوئی منصوبہ نہیں</div>}
    </div>
  </div>;
}

export default LessonPlans;
