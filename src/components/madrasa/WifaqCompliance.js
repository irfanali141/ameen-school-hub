/* eslint-disable */
import { useState, useEffect } from "react";
import { C, S, hBadge, pBar } from "../../constants";
import { db, collection, onSnapshot, query, orderBy, limit } from "../../firebase";

function WifaqCompliance({addData}){
  const [records,setRecords]=useState([]); const [show,setShow]=useState(false);
  const [f,setF]=useState({subject:"",class:"",teacher:"",syllabusCompleted:0,totalSyllabus:100,examDate:"",examType:"internal",status:"in_progress",notes:""});
  useEffect(()=>{ return onSnapshot(query(collection(db,"wifaq_compliance"),orderBy("createdAt","desc"),limit(50)),s=>setRecords(s.docs.map(d=>({id:d.id,...d.data()}))));  },[]);
  const add=async()=>{ if(!f.subject)return; await addData("wifaq_compliance",{...f,syllabusCompleted:Number(f.syllabusCompleted),totalSyllabus:Number(f.totalSyllabus)}); setShow(false); setF({subject:"",class:"",teacher:"",syllabusCompleted:0,totalSyllabus:100,examDate:"",examType:"internal",status:"in_progress",notes:""}); };
  const subjects=["تفسیر","حدیث","فقہ","عقیدہ","نحو","صرف","بلاغت","منطق","فلسفہ","سیرت","تجوید","اردو","انگریزی","ریاضی"];
  const statConfig={in_progress:{c:C.amber,l:"جاری"},completed:{c:C.green,l:"مکمل"},delayed:{c:C.red,l:"تاخیر"},pending:{c:"#888",l:"زیر التوا"}};
  const overallPct=records.length>0?Math.round(records.reduce((s,r)=>s+Math.round((r.syllabusCompleted/r.totalSyllabus)*100),0)/records.length):0;
  return <div style={S.page}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
      <div><div style={{fontSize:"1.1rem",fontWeight:"700",color:C.navy}}>🕌 وفاق کمپلائنس</div><div style={{fontSize:"0.62rem",color:"#888",marginTop:"2px"}}>نصاب تکمیل — وفاق المدارس معیار</div></div>
      <button style={S.addBtn} onClick={()=>setShow(!show)}>+ نیا مضمون</button>
    </div>
    <div className="hv-card" style={{...S.card,marginBottom:"20px",background:`linear-gradient(135deg,${C.navyDark},${C.navyMid})`,color:C.white,textAlign:"center"}}>
      <div style={{fontSize:"0.65rem",opacity:0.6,marginBottom:"8px"}}>مجموعی نصاب تکمیل</div>
      <div style={{fontSize:"3rem",fontWeight:"900",color:C.gold}}>{overallPct}%</div>
      <div style={{marginTop:"12px",background:"rgba(255,255,255,0.1)",borderRadius:"20px",height:"8px",overflow:"hidden"}}><div style={{height:"100%",background:`linear-gradient(90deg,${C.gold},${C.goldDark})`,width:`${overallPct}%`,borderRadius:"20px"}}/></div>
      <div style={{fontSize:"0.6rem",opacity:0.6,marginTop:"8px"}}>{records.length} مضامین</div>
    </div>
    {show&&<div className="hv-card" style={{...S.card,marginBottom:"20px",background:`linear-gradient(135deg,${C.goldLight},#fdf8ee)`}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>مضمون *</label><select style={S.inpSm} value={f.subject} onChange={e=>setF({...f,subject:e.target.value})}><option value="">-- منتخب کریں --</option>{subjects.map(s=><option key={s}>{s}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>جماعت</label><input style={S.inpSm} value={f.class} onChange={e=>setF({...f,class:e.target.value})} placeholder="ثانیہ، ثالثہ..."/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>استاد</label><input style={S.inpSm} value={f.teacher} onChange={e=>setF({...f,teacher:e.target.value})} placeholder="نام..."/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>حال</label><select style={S.inpSm} value={f.status} onChange={e=>setF({...f,status:e.target.value})}>{Object.entries(statConfig).map(([k,v])=><option key={k} value={k}>{v.l}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>مکمل دروس</label><input style={{...S.inpSm,direction:"ltr"}} type="number" value={f.syllabusCompleted} onChange={e=>setF({...f,syllabusCompleted:e.target.value})}/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>کل دروس</label><input style={{...S.inpSm,direction:"ltr"}} type="number" value={f.totalSyllabus} onChange={e=>setF({...f,totalSyllabus:e.target.value})}/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>امتحان تاریخ</label><input style={{...S.inpSm,direction:"ltr"}} type="date" value={f.examDate} onChange={e=>setF({...f,examDate:e.target.value})}/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>قسم</label><select style={S.inpSm} value={f.examType} onChange={e=>setF({...f,examType:e.target.value})}><option value="internal">اندرونی</option><option value="wifaq">وفاق</option><option value="board">بورڈ</option></select></div>
      </div>
      <button style={S.saveBtn} onClick={add}>✅ محفوظ کریں</button>
    </div>}
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:"14px"}}>
      {records.map(r=>{ const sc=statConfig[r.status]||statConfig.in_progress; const pct=Math.round((r.syllabusCompleted/(r.totalSyllabus||1))*100); return <div key={r.id} className="hv-card" style={{...S.card,borderTop:`4px solid ${sc.c}`}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:"8px"}}><div><div style={{fontSize:"0.82rem",fontWeight:"700",color:C.navy}}>🕌 {r.subject}</div><div style={{fontSize:"0.6rem",color:"#888",marginTop:"2px"}}>{r.class} • {r.teacher}</div></div><span style={hBadge(sc.c,sc.c+"15")}>{sc.l}</span></div>
        <div style={{marginBottom:"6px"}}>{pBar(r.syllabusCompleted,r.totalSyllabus||1,pct>=80?C.green:pct>=50?C.amber:C.red)}</div>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:"0.62rem"}}><span style={{color:"#888"}}>{r.syllabusCompleted}/{r.totalSyllabus} دروس</span><span style={{fontWeight:"700",color:pct>=80?C.green:pct>=50?C.amber:C.red}}>{pct}%</span></div>
        {r.examDate&&<div style={{fontSize:"0.58rem",color:C.gold,marginTop:"6px",fontFamily:"monospace",direction:"ltr"}}>امتحان: {r.examDate}</div>}
      </div>; })}
      {records.length===0&&<div className="hv-card" style={{...S.card,textAlign:"center",color:"#bbb",padding:"40px",gridColumn:"1/-1"}}>کوئی ریکارڈ نہیں</div>}
    </div>
  </div>;
}

export default WifaqCompliance;
