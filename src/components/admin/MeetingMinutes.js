/* eslint-disable */
import { useState, useEffect } from "react";
import { C, S, hBadge } from "../../constants";
import { db, collection, onSnapshot, query, orderBy, limit } from "../../firebase";

function MeetingMinutes({addData}){
  const [meetings,setMeetings]=useState([]); const [show,setShow]=useState(false);
  const [f,setF]=useState({title:"",date:new Date().toISOString().split("T")[0],type:"staff",attendees:"",agenda:"",minutes:"",decisions:"",nextMeeting:""});
  useEffect(()=>{ return onSnapshot(query(collection(db,"meetings"),orderBy("createdAt","desc"),limit(30)),s=>setMeetings(s.docs.map(d=>({id:d.id,...d.data()}))));  },[]);
  const add=async()=>{ if(!f.title)return; await addData("meetings",{...f}); setShow(false); setF({title:"",date:new Date().toISOString().split("T")[0],type:"staff",attendees:"",agenda:"",minutes:"",decisions:"",nextMeeting:""}); };
  const types={staff:{c:C.abuBakr,bg:"#dbeafe",i:"👨‍🏫",l:"اسٹاف"},parents:{c:C.green,bg:"#dcfce7",i:"👪",l:"والدین"},board:{c:C.gold,bg:C.goldLight,i:"🏛️",l:"بورڈ"},emergency:{c:C.red,bg:"#fee2e2",i:"🚨",l:"ہنگامی"},academic:{c:C.purple,bg:"#ede9fe",i:"📚",l:"تعلیمی"}};

  const G="#d4af37"; const N="#0f172a"; const N2="#1e293b";
  const glass={background:"rgba(255,255,255,0.07)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:"16px"};
  const inp={width:"100%",padding:"10px 14px",borderRadius:"10px",border:"1px solid rgba(212,175,55,0.25)",background:"rgba(255,255,255,0.06)",color:"#f1f5f9",fontSize:"0.8rem",fontFamily:"'Public Sans',sans-serif",outline:"none",boxSizing:"border-box",direction:"rtl",colorScheme:"dark"};
  const lbl={fontSize:"0.7rem",color:"rgba(212,175,55,0.8)",marginBottom:"6px",display:"block",fontWeight:"600"};
  return <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#0f172a 0%,#0d1f3c 50%,#0a1628 100%)",padding:"24px 20px",fontFamily:"'Public Sans',sans-serif",direction:"rtl"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"24px",flexWrap:"wrap",gap:"12px"}}>
      <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
        <div style={{width:"44px",height:"44px",borderRadius:"12px",background:"linear-gradient(135deg,#d4af37,#b8960a)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 20px rgba(212,175,55,0.4)"}}><span className="material-symbols-rounded" style={{fontSize:"24px",color:N}}>meeting_room</span></div>
        <div><h2 style={{margin:0,fontSize:"1.4rem",fontWeight:"800",color:"#f1f5f9"}}>میٹنگ منٹس</h2><p style={{margin:0,fontSize:"0.72rem",color:"rgba(212,175,55,0.7)"}}>اجلاس کا ریکارڈ اور فیصلے</p></div>
      </div>
      <button style={{display:"flex",alignItems:"center",gap:"8px",padding:"10px 20px",borderRadius:"12px",border:"1px solid #d4af37",background:show?"rgba(212,175,55,0.15)":"transparent",color:"#d4af37",fontWeight:"700",fontSize:"0.82rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif"}} onClick={()=>setShow(!show)}><span className="material-symbols-rounded" style={{fontSize:"18px"}}>{show?"close":"add_circle"}</span>{show?"منسوخ":"نئی میٹنگ"}</button>
    </div>
    {show&&<div style={{...glass,padding:"24px",marginBottom:"20px",borderColor:"rgba(212,175,55,0.3)"}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div style={{gridColumn:"1/-1"}}><label style={lbl}>میٹنگ کا عنوان *</label><input style={inp} value={f.title} onChange={e=>setF({...f,title:e.target.value})} placeholder="ماہانہ اسٹاف میٹنگ..."/></div>
        <div><label style={lbl}>تاریخ</label><input style={{...inp,direction:"ltr",colorScheme:"dark"}} type="date" value={f.date} onChange={e=>setF({...f,date:e.target.value})}/></div>
        <div><label style={lbl}>قسم</label><select style={inp} value={f.type} onChange={e=>setF({...f,type:e.target.value})}>{Object.entries(types).map(([k,v])=><option key={k} value={k} style={{background:N2}}>{v.i} {v.l}</option>)}</select></div>
        <div style={{gridColumn:"1/-1"}}><label style={lbl}>شرکاء</label><input style={inp} value={f.attendees} onChange={e=>setF({...f,attendees:e.target.value})} placeholder="ناموں کی فہرست..."/></div>
        <div style={{gridColumn:"1/-1"}}><label style={lbl}>ایجنڈا</label><textarea style={{...inp,minHeight:"60px",resize:"vertical"}} value={f.agenda} onChange={e=>setF({...f,agenda:e.target.value})} placeholder="اجلاس کے نکات..."/></div>
        <div style={{gridColumn:"1/-1"}}><label style={lbl}>کارروائی (منٹس)</label><textarea style={{...inp,minHeight:"80px",resize:"vertical"}} value={f.minutes} onChange={e=>setF({...f,minutes:e.target.value})} placeholder="اجلاس کی مکمل کارروائی..."/></div>
        <div style={{gridColumn:"1/-1"}}><label style={lbl}>فیصلے</label><textarea style={{...inp,minHeight:"60px",resize:"vertical"}} value={f.decisions} onChange={e=>setF({...f,decisions:e.target.value})} placeholder="اہم فیصلے اور احکامات..."/></div>
      </div>
      <button style={{background:"linear-gradient(135deg,#d4af37,#b8960a)",color:N,border:"none",borderRadius:"12px",padding:"11px 26px",fontSize:"0.82rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif",fontWeight:"700"}} onClick={add}>منٹس محفوظ کریں</button>
    </div>}
    <div style={{display:"flex",flexDirection:"column",gap:"14px"}}>
      {meetings.map(m=>{ const tc=types[m.type]||types.staff; return <div key={m.id} style={{...glass,padding:"18px 20px",borderRight:`3px solid ${tc.c}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"10px"}}>
          <div><div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"4px"}}><span style={{fontSize:"1rem"}}>{tc.i}</span><span style={{fontSize:"0.85rem",fontWeight:"700",color:"#f1f5f9"}}>{m.title}</span></div><div style={{fontSize:"0.6rem",color:"rgba(255,255,255,0.4)",fontFamily:"monospace",direction:"ltr"}}>{m.date}</div></div>
          <span style={{padding:"3px 8px",borderRadius:"20px",fontSize:"0.6rem",fontWeight:"700",background:`${tc.c}20`,color:tc.c}}>{tc.l}</span>
        </div>
        {m.attendees&&<div style={{fontSize:"0.62rem",color:"rgba(255,255,255,0.5)",marginBottom:"8px"}}>👥 {m.attendees}</div>}
        {m.decisions&&<div style={{background:"rgba(251,191,36,0.1)",borderRadius:"10px",padding:"10px 14px",marginBottom:"8px",border:"1px solid rgba(251,191,36,0.2)"}}><div style={{fontSize:"0.62rem",fontWeight:"700",color:"#fbbf24",marginBottom:"4px"}}>⚡ فیصلے</div><div style={{fontSize:"0.65rem",color:"rgba(255,255,255,0.65)",lineHeight:"1.6"}}>{m.decisions}</div></div>}
        {m.minutes&&<div style={{fontSize:"0.65rem",color:"rgba(255,255,255,0.5)",lineHeight:"1.6"}}>{m.minutes.slice(0,200)}{m.minutes.length>200?"...":""}</div>}
      </div>; })}
      {meetings.length===0&&<div style={{...glass,textAlign:"center",color:"rgba(255,255,255,0.3)",padding:"60px"}}>کوئی میٹنگ ریکارڈ نہیں</div>}
    </div>
  </div>;
}

export default MeetingMinutes;
