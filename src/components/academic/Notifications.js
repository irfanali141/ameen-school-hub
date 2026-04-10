/* eslint-disable */
import { useState, useEffect } from "react";
import { C, S, hBadge } from "../../constants";
import { supabase } from "../../supabase";
import useClasses from "../../hooks/useClasses";
import EmptyState from '../ui/EmptyState';

function Notifications({students,addData}){
  const { gradeOptions } = useClasses();
  const G="#d4af37"; const N="#0f172a"; const N2="#1e293b";
  const glass={background:"rgba(255,255,255,0.07)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:"16px"};
  const inp={width:"100%",padding:"10px 14px",borderRadius:"10px",border:"1px solid rgba(212,175,55,0.25)",background:"rgba(255,255,255,0.06)",color:"#f1f5f9",fontSize:"0.8rem",fontFamily:"'Public Sans',sans-serif",outline:"none",boxSizing:"border-box",direction:"ltr",colorScheme:"dark"};
  const lbl={fontSize:"0.7rem",color:"rgba(212,175,55,0.8)",marginBottom:"6px",display:"block",fontWeight:"600"};
  const [notifs,setNotifs]=useState([]); const [show,setShow]=useState(false);
  const [f,setF]=useState({title:"",message:"",type:"general",targetGrade:"all",priority:"normal"});
  useEffect(()=>{ const load=async()=>{ const {data}=await supabase.from("notifications").select("*").order("created_at",{ascending:false}).limit(50); setNotifs(data||[]); }; load(); },[]);
  const add=async()=>{ if(!f.title||!f.message)return; await addData("notifications",{...f}); setShow(false); setF({title:"",message:"",type:"general",targetGrade:"all",priority:"normal"}); };
  const typeConfig={"general":{c:C.abuBakr,i:"📢",l:"General"},"urgent":{c:C.red,i:"🚨",l:"Urgent"},"event":{c:C.purple,i:"🎭",l:"Event"},"fee":{c:C.amber,i:"💰",l:"Fee"},"exam":{c:C.teal,i:"📝",l:"Exam"},"holiday":{c:C.green,i:"🌙",l:"Leave"}};
  return <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#0f172a 0%,#0d1f3c 50%,#0a1628 100%)",padding:"24px 20px",fontFamily:"'Public Sans',sans-serif",direction:"ltr"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"24px",flexWrap:"wrap",gap:"12px"}}>
      <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
        <div style={{width:"44px",height:"44px",borderRadius:"12px",background:"linear-gradient(135deg,#d4af37,#b8960a)",display:"flex",alignItems:"center",justifyContent:"center"}}><span className="material-symbols-rounded" style={{fontSize:"24px",color:N}}>notifications</span></div>
        <div><h2 style={{margin:0,fontSize:"1.4rem",fontWeight:"800",color:"#f1f5f9"}}>Notifications</h2><p style={{margin:0,fontSize:"0.72rem",color:"rgba(212,175,55,0.7)"}}>{notifs.length} notifications</p></div>
      </div>
      <button style={{display:"flex",alignItems:"center",gap:"8px",padding:"10px 20px",borderRadius:"12px",border:"1px solid #d4af37",background:show?"rgba(212,175,55,0.15)":"transparent",color:"#d4af37",fontWeight:"700",fontSize:"0.82rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif"}} onClick={()=>setShow(!show)}><span className="material-symbols-rounded" style={{fontSize:"18px"}}>{show?"close":"add_circle"}</span>{show?"Cancel":"New Notification"}</button>
    </div>
    {show&&<div style={{background:"rgba(255,255,255,0.07)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",border:"1px solid rgba(212,175,55,0.3)",borderRadius:"16px",padding:"24px",marginBottom:"20px"}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div style={{gridColumn:"1/-1"}}><label style={lbl}>Title *</label><input style={inp} value={f.title} onChange={e=>setF({...f,title:e.target.value})} placeholder="Notification title..."/></div>
        <div><label style={lbl}>Type</label><select style={inp} value={f.type} onChange={e=>setF({...f,type:e.target.value})}>{Object.entries(typeConfig).map(([k,v])=><option key={k} value={k} style={{background:N2}}>{v.i} {v.l}</option>)}</select></div>
        <div><label style={lbl}>Grade</label><select style={inp} value={f.targetGrade} onChange={e=>setF({...f,targetGrade:e.target.value})}><option value="all" style={{background:N2}}>All</option>{gradeOptions.map(g=><option key={g} style={{background:N2}}>{g}</option>)}</select></div>
        <div><label style={lbl}>Priority</label><select style={inp} value={f.priority} onChange={e=>setF({...f,priority:e.target.value})}><option value="normal" style={{background:N2}}>General</option><option value="high" style={{background:N2}}>High</option><option value="urgent" style={{background:N2}}>Urgent</option></select></div>
        <div style={{gridColumn:"1/-1"}}><label style={lbl}>Message *</label><textarea style={{...inp,minHeight:"80px",resize:"vertical"}} value={f.message} onChange={e=>setF({...f,message:e.target.value})} placeholder="Complete Message Enter..."/></div>
      </div>
      <button style={{background:"linear-gradient(135deg,#d4af37,#b8960a)",color:N,border:"none",borderRadius:"12px",padding:"11px 26px",fontSize:"0.82rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif",fontWeight:"700"}} onClick={add}>Send</button>
    </div>}
    <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
      {notifs.map(n=>{ const tc=typeConfig[n.type]||typeConfig.general; const isUrgent=n.priority==="urgent"||n.type==="urgent"; return <div key={n.id} style={{background:"rgba(255,255,255,0.07)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",border:`1px solid ${isUrgent?"rgba(248,113,113,0.3)":"rgba(255,255,255,0.12)"}`,borderRadius:"16px",padding:"16px 20px",borderRight:`4px solid ${tc.c}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"8px"}}>
          <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
            <span style={{fontSize:"1.2rem"}}>{tc.i}</span>
            <div style={{fontSize:"0.78rem",fontWeight:"700",color:"#f1f5f9"}}>{n.title}</div>
          </div>
          <span style={{...hBadge(tc.c),fontSize:"0.55rem"}}>{tc.l}</span>
        </div>
        <div style={{fontSize:"0.68rem",color:"rgba(255,255,255,0.65)",lineHeight:"1.6",marginBottom:"8px"}}>{n.message}</div>
        <div style={{fontSize:"0.58rem",color:"rgba(255,255,255,0.4)"}}>Grade: {n.targetGrade} • Priority: {n.priority==="urgent"?"🔴 Urgent":n.priority==="high"?"🟡 High":"🟢 General"}</div>
      </div>; })}
      {notifs.length===0&&<EmptyState icon="🔔" title="کوئی اطلاع نہیں" subtitle="ابھی تک کوئی اطلاع یا پیغام نہیں ہے"/>}
    </div>
  </div>;
}

export default Notifications;
