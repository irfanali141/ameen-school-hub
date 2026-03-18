/* eslint-disable */
import { useState, useEffect } from "react";
import { C, S, hBadge } from "../../constants";
import { db, collection, onSnapshot, query, orderBy, limit } from "../../firebase";

function ExamSchedule({addData}){
  const G="#d4af37"; const N="#0f172a"; const N2="#1e293b";
  const glass={background:"rgba(255,255,255,0.07)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:"16px"};
  const inp={width:"100%",padding:"10px 14px",borderRadius:"10px",border:"1px solid rgba(212,175,55,0.25)",background:"rgba(255,255,255,0.06)",color:"#f1f5f9",fontSize:"0.8rem",fontFamily:"'Public Sans',sans-serif",outline:"none",boxSizing:"border-box",direction:"rtl",colorScheme:"dark"};
  const lbl={fontSize:"0.7rem",color:"rgba(212,175,55,0.8)",marginBottom:"6px",display:"block",fontWeight:"600"};
  const [exams,setExams]=useState([]); const [show,setShow]=useState(false);
  const [f,setF]=useState({subject:"",grade:"Grade 7",examDate:"",startTime:"09:00",duration:120,room:"Room 1",examType:"monthly"});
  useEffect(()=>{ return onSnapshot(query(collection(db,"exam_schedule"),orderBy("examDate","asc"),limit(50)),s=>setExams(s.docs.map(d=>({id:d.id,...d.data()})))); },[]);
  const add=async()=>{ if(!f.subject||!f.examDate)return; await addData("exam_schedule",{...f,duration:Number(f.duration)}); setShow(false); setF({subject:"",grade:"Grade 7",examDate:"",startTime:"09:00",duration:120,room:"Room 1",examType:"monthly"}); };
  const today=new Date().toISOString().split("T")[0];
  const upcoming=exams.filter(e=>e.examDate>=today);
  const past=exams.filter(e=>e.examDate<today);
  const examTypes={monthly:"ماہانہ",midterm:"نیم سالانہ",annual:"سالانہ",quiz:"کوئز",hifz:"حفظ"};
  return <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#0f172a 0%,#0d1f3c 50%,#0a1628 100%)",padding:"24px 20px",fontFamily:"'Public Sans',sans-serif",direction:"rtl"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"24px",flexWrap:"wrap",gap:"12px"}}>
      <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
        <div style={{width:"44px",height:"44px",borderRadius:"12px",background:"linear-gradient(135deg,#d4af37,#b8960a)",display:"flex",alignItems:"center",justifyContent:"center"}}><span className="material-symbols-rounded" style={{fontSize:"24px",color:N}}>quiz</span></div>
        <div><h2 style={{margin:0,fontSize:"1.4rem",fontWeight:"800",color:"#f1f5f9"}}>امتحان شیڈول</h2><p style={{margin:0,fontSize:"0.72rem",color:"rgba(212,175,55,0.7)"}}>Exam Schedule</p></div>
      </div>
      <button style={{display:"flex",alignItems:"center",gap:"8px",padding:"10px 20px",borderRadius:"12px",border:"1px solid #d4af37",background:show?"rgba(212,175,55,0.15)":"transparent",color:"#d4af37",fontWeight:"700",fontSize:"0.82rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif"}} onClick={()=>setShow(!show)}><span className="material-symbols-rounded" style={{fontSize:"18px"}}>{show?"close":"add_circle"}</span>{show?"منسوخ":"نیا امتحان"}</button>
    </div>
    {upcoming.length>0&&<div style={{background:"rgba(251,146,60,0.1)",border:"1px solid rgba(251,146,60,0.3)",borderRadius:"14px",padding:"14px 18px",marginBottom:"20px"}}>
      <div style={{fontSize:"0.75rem",fontWeight:"700",color:"#fb923c",marginBottom:"8px"}}>📅 آنے والے امتحانات ({upcoming.length})</div>
      {upcoming.slice(0,3).map(e=><div key={e.id} style={{fontSize:"0.65rem",color:"rgba(255,255,255,0.65)",marginBottom:"4px"}}>• {e.subject} — {e.grade} — {e.examDate} {e.startTime}</div>)}
    </div>}
    {show&&<div style={{...glass,padding:"24px",marginBottom:"20px",borderColor:"rgba(212,175,55,0.3)"}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div><label style={lbl}>مضمون *</label><input style={inp} value={f.subject} onChange={e=>setF({...f,subject:e.target.value})} placeholder="ریاضی، انگریزی..."/></div>
        <div><label style={lbl}>جماعت</label><select style={inp} value={f.grade} onChange={e=>setF({...f,grade:e.target.value})}>{["Grade 6","Grade 7","Grade 8","Grade 9","All Grades"].map(g=><option key={g} style={{background:N2}}>{g}</option>)}</select></div>
        <div><label style={lbl}>تاریخ *</label><input style={{...inp,direction:"ltr",colorScheme:"dark"}} type="date" value={f.examDate} onChange={e=>setF({...f,examDate:e.target.value})}/></div>
        <div><label style={lbl}>وقت</label><input style={{...inp,direction:"ltr",colorScheme:"dark"}} type="time" value={f.startTime} onChange={e=>setF({...f,startTime:e.target.value})}/></div>
        <div><label style={lbl}>دورانیہ (منٹ)</label><input style={{...inp,direction:"ltr",colorScheme:"dark"}} type="number" value={f.duration} onChange={e=>setF({...f,duration:e.target.value})}/></div>
        <div><label style={lbl}>کمرہ</label><input style={inp} value={f.room} onChange={e=>setF({...f,room:e.target.value})} placeholder="Room 1..."/></div>
        <div><label style={lbl}>قسم</label><select style={inp} value={f.examType} onChange={e=>setF({...f,examType:e.target.value})}>{Object.entries(examTypes).map(([k,v])=><option key={k} value={k} style={{background:N2}}>{v}</option>)}</select></div>
      </div>
      <button style={{background:"linear-gradient(135deg,#d4af37,#b8960a)",color:N,border:"none",borderRadius:"12px",padding:"11px 26px",fontSize:"0.82rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif",fontWeight:"700"}} onClick={add}>محفوظ کریں</button>
    </div>}
    <div style={{...glass,overflow:"hidden"}}><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}>
      <thead><tr style={{background:"rgba(255,255,255,0.04)"}}>{["مضمون","جماعت","تاریخ","وقت","دورانیہ","کمرہ","حال"].map(h=><th key={h} style={{padding:"12px 14px",textAlign:"right",fontSize:"0.65rem",color:"rgba(212,175,55,0.8)",fontWeight:"700"}}>{h}</th>)}</tr></thead>
      <tbody>{exams.map((e,ri)=>{ const isUp=e.examDate>=today; return <tr key={e.id} style={{background:ri%2===0?"rgba(255,255,255,0.02)":"transparent"}}>
        <td style={{padding:"11px 14px",color:"#f1f5f9",fontWeight:"700",fontSize:"0.75rem",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>{e.subject}</td>
        <td style={{padding:"11px 14px",color:"rgba(255,255,255,0.7)",fontSize:"0.75rem",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>{e.grade}</td>
        <td style={{padding:"11px 14px",fontFamily:"monospace",direction:"ltr",fontSize:"0.6rem",fontWeight:isUp?"700":"400",color:isUp?"#d4af37":"rgba(255,255,255,0.4)",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>{e.examDate}</td>
        <td style={{padding:"11px 14px",fontFamily:"monospace",direction:"ltr",fontSize:"0.6rem",color:"rgba(255,255,255,0.6)",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>{e.startTime}</td>
        <td style={{padding:"11px 14px",color:"rgba(255,255,255,0.7)",fontSize:"0.75rem",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>{e.duration} min</td>
        <td style={{padding:"11px 14px",color:"rgba(255,255,255,0.7)",fontSize:"0.75rem",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>{e.room}</td>
        <td style={{padding:"11px 14px",borderBottom:"1px solid rgba(255,255,255,0.05)"}}><span style={{padding:"3px 8px",borderRadius:"20px",fontSize:"0.55rem",fontWeight:"700",background:isUp?"rgba(251,146,60,0.15)":"rgba(255,255,255,0.06)",color:isUp?"#fb923c":"rgba(255,255,255,0.4)"}}>{isUp?"آنے والا":"گزرا"}</span></td>
      </tr>; })}{exams.length===0&&<tr><td colSpan={7} style={{padding:"40px",textAlign:"center",color:"rgba(255,255,255,0.3)"}}>کوئی امتحان شیڈول نہیں</td></tr>}</tbody>
    </table></div></div>
  </div>;
}

export default ExamSchedule;
