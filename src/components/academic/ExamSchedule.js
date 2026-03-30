/* eslint-disable */
import { useState, useEffect } from "react";
import { C, S, hBadge, SUBJECTS, EXAM_NAMES } from "../../constants";
import { supabase } from "../../supabase";
import useClasses from "../../hooks/useClasses";

function ExamSchedule({addData}){
  const { gradeOptions } = useClasses();
  const G="#d4af37"; const N="#0f172a"; const N2="#1e293b";
  const glass={background:"rgba(255,255,255,0.07)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:"16px"};
  const inp={width:"100%",padding:"10px 14px",borderRadius:"10px",border:"1px solid rgba(212,175,55,0.25)",background:"rgba(255,255,255,0.06)",color:"#f1f5f9",fontSize:"0.8rem",fontFamily:"'Public Sans',sans-serif",outline:"none",boxSizing:"border-box",direction:"ltr",colorScheme:"dark"};
  const lbl={fontSize:"0.7rem",color:"rgba(212,175,55,0.8)",marginBottom:"6px",display:"block",fontWeight:"600"};
  const [exams,setExams]=useState([]); const [show,setShow]=useState(false); const [customTitle,setCustomTitle]=useState(false);
  const [f,setF]=useState({title:"",subject:"",grade:"Grade 7",examDate:"",startTime:"09:00",duration:120,room:"Room 1",examType:"monthly"});
  const load=async()=>{ const {data}=await supabase.from("exam_schedule").select("*").order("exam_date",{ascending:true}).limit(50); setExams(data||[]); };
  useEffect(()=>{ load(); },[]);
  const add=async()=>{ if(!f.subject||!f.examDate)return; await addData("exam_schedule",{...f,duration:Number(f.duration)}); setShow(false); setF({title:"",subject:"",grade:"Grade 7",examDate:"",startTime:"09:00",duration:120,room:"Room 1",examType:"monthly"}); await load(); };
  const today=new Date().toISOString().split("T")[0];
  const upcoming=exams.filter(e=>e.exam_date>=today);
  const past=exams.filter(e=>e.exam_date<today);
  const examTypes={monthly:"ماہانہ",midterm:"وسط سال",annual:"سالانہ",quiz:"کوئز",hifz:"حفظ"};
  return <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#0f172a 0%,#0d1f3c 50%,#0a1628 100%)",padding:"24px 20px",fontFamily:"'Public Sans',sans-serif",direction:"ltr"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"24px",flexWrap:"wrap",gap:"12px"}}>
      <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
        <div style={{width:"44px",height:"44px",borderRadius:"12px",background:"linear-gradient(135deg,#d4af37,#b8960a)",display:"flex",alignItems:"center",justifyContent:"center"}}><span className="material-symbols-rounded" style={{fontSize:"24px",color:N}}>quiz</span></div>
        <div><h2 style={{margin:0,fontSize:"1.4rem",fontWeight:"800",color:"#f1f5f9"}}>Exam Schedule</h2><p style={{margin:0,fontSize:"0.72rem",color:"rgba(212,175,55,0.7)"}}>Exam Schedule</p></div>
      </div>
      <button style={{display:"flex",alignItems:"center",gap:"8px",padding:"10px 20px",borderRadius:"12px",border:"1px solid #d4af37",background:show?"rgba(212,175,55,0.15)":"transparent",color:"#d4af37",fontWeight:"700",fontSize:"0.82rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif"}} onClick={()=>setShow(!show)}><span className="material-symbols-rounded" style={{fontSize:"18px"}}>{show?"close":"add_circle"}</span>{show?"Cancel":"New Exam"}</button>
    </div>
    {upcoming.length>0&&<div style={{background:"rgba(251,146,60,0.1)",border:"1px solid rgba(251,146,60,0.3)",borderRadius:"14px",padding:"14px 18px",marginBottom:"20px"}}>
      <div style={{fontSize:"0.75rem",fontWeight:"700",color:"#fb923c",marginBottom:"8px"}}>📅 Upcoming Exams ({upcoming.length})</div>
      {upcoming.slice(0,3).map(e=><div key={e.id} style={{fontSize:"0.65rem",color:"rgba(255,255,255,0.65)",marginBottom:"4px"}}>• {e.subject} — {e.grade} — {e.exam_date} {e.start_time}</div>)}
    </div>}
    {show&&<div style={{...glass,padding:"24px",marginBottom:"20px",borderColor:"rgba(212,175,55,0.3)"}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div style={{gridColumn:"1/-1"}}>
          <label style={lbl}>امتحان کا نام</label>
          {!customTitle?(
            <div style={{display:"flex",gap:"6px"}}>
              <select style={{...inp,flex:1}} value={f.title} onChange={e=>{if(e.target.value==="__custom"){setCustomTitle(true);setF({...f,title:""});}else setF({...f,title:e.target.value});}}>
                <option value="" style={{background:N2}}>-- Exam منتخب کریں --</option>
                {EXAM_NAMES.map(n=><option key={n} value={n} style={{background:N2}}>{n}</option>)}
                <option value="__custom" style={{background:N2,color:"rgba(212,175,55,0.7)"}}>✏️ خود لکھیں...</option>
              </select>
            </div>
          ):(
            <div style={{display:"flex",gap:"6px"}}>
              <input style={{...inp,flex:1}} value={f.title} onChange={e=>setF({...f,title:e.target.value})} placeholder="Exam کا نام لکھیں..."/>
              <button onClick={()=>{setCustomTitle(false);setF(p=>({...p,title:""}));}} style={{padding:"0 10px",borderRadius:"10px",border:"1px solid rgba(255,255,255,0.15)",background:"transparent",color:"rgba(241,245,249,0.5)",cursor:"pointer",fontSize:"0.72rem",fontFamily:"inherit",whiteSpace:"nowrap"}}>← List</button>
            </div>
          )}
        </div>
        <div><label style={lbl}>مضمون *</label><select style={inp} value={f.subject} onChange={e=>setF({...f,subject:e.target.value})}><option value="" style={{background:N2}}>-- منتخب کریں --</option>{SUBJECTS.map(s=><option key={s} value={s} style={{background:N2}}>{s}</option>)}</select></div>
        <div><label style={lbl}>جماعت</label><select style={inp} value={f.grade} onChange={e=>setF({...f,grade:e.target.value})}>{[...gradeOptions,"تمام جماعتیں"].map(g=><option key={g} style={{background:N2}}>{g}</option>)}</select></div>
        <div><label style={lbl}>تاریخ *</label><input style={{...inp,direction:"ltr",colorScheme:"dark"}} type="date" value={f.examDate} onChange={e=>setF({...f,examDate:e.target.value})}/></div>
        <div><label style={lbl}>وقت</label><input style={{...inp,direction:"ltr",colorScheme:"dark"}} type="time" value={f.startTime} onChange={e=>setF({...f,startTime:e.target.value})}/></div>
        <div><label style={lbl}>دورانیہ (منٹ)</label><input style={{...inp,direction:"ltr",colorScheme:"dark"}} type="number" value={f.duration} onChange={e=>setF({...f,duration:e.target.value})}/></div>
        <div><label style={lbl}>کمرہ</label><input style={inp} value={f.room} onChange={e=>setF({...f,room:e.target.value})} placeholder="کمرہ نمبر..."/></div>
        <div><label style={lbl}>قسم</label><select style={inp} value={f.examType} onChange={e=>setF({...f,examType:e.target.value})}>{Object.entries(examTypes).map(([k,v])=><option key={k} value={k} style={{background:N2}}>{v}</option>)}</select></div>
      </div>
      <button style={{background:"linear-gradient(135deg,#d4af37,#b8960a)",color:N,border:"none",borderRadius:"12px",padding:"11px 26px",fontSize:"0.82rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif",fontWeight:"700"}} onClick={add}>Save</button>
    </div>}
    <div style={{...glass,overflow:"hidden"}}><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}>
      <thead><tr style={{background:"rgba(255,255,255,0.04)"}}>{["نام / مضمون","جماعت","تاریخ","وقت","دورانیہ","کمرہ","حیثیت"].map(h=><th key={h} style={{padding:"12px 14px",textAlign:"left",fontSize:"0.65rem",color:"rgba(212,175,55,0.8)",fontWeight:"700"}}>{h}</th>)}</tr></thead>
      <tbody>{exams.map((e,ri)=>{ const isUp=e.exam_date>=today; return <tr key={e.id} style={{background:ri%2===0?"rgba(255,255,255,0.02)":"transparent"}}>
        <td style={{padding:"11px 14px",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
          {e.title&&<div style={{color:"#f1f5f9",fontWeight:"700",fontSize:"0.75rem"}}>{e.title}</div>}
          <div style={{color:e.title?"rgba(255,255,255,0.5)":"#f1f5f9",fontSize:e.title?"0.65rem":"0.75rem",fontWeight:e.title?400:700}}>{e.subject}</div>
        </td>
        <td style={{padding:"11px 14px",color:"rgba(255,255,255,0.7)",fontSize:"0.75rem",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>{e.grade}</td>
        <td style={{padding:"11px 14px",fontFamily:"monospace",direction:"ltr",fontSize:"0.6rem",fontWeight:isUp?"700":"400",color:isUp?"#d4af37":"rgba(255,255,255,0.4)",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>{e.exam_date}</td>
        <td style={{padding:"11px 14px",fontFamily:"monospace",direction:"ltr",fontSize:"0.6rem",color:"rgba(255,255,255,0.6)",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>{e.start_time}</td>
        <td style={{padding:"11px 14px",color:"rgba(255,255,255,0.7)",fontSize:"0.75rem",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>{e.duration} min</td>
        <td style={{padding:"11px 14px",color:"rgba(255,255,255,0.7)",fontSize:"0.75rem",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>{e.room}</td>
        <td style={{padding:"11px 14px",borderBottom:"1px solid rgba(255,255,255,0.05)"}}><span style={{padding:"3px 8px",borderRadius:"20px",fontSize:"0.55rem",fontWeight:"700",background:isUp?"rgba(251,146,60,0.15)":"rgba(255,255,255,0.06)",color:isUp?"#fb923c":"rgba(255,255,255,0.4)"}}>{isUp?"آنے والا":"گزرا"}</span></td>
      </tr>; })}{exams.length===0&&<tr><td colSpan={7} style={{padding:"40px",textAlign:"center",color:"rgba(255,255,255,0.3)"}}>کوئی امتحانی نظام الاوقات نہیں</td></tr>}</tbody>
    </table></div></div>
  </div>;
}

export default ExamSchedule;
