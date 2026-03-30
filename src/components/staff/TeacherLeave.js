/* eslint-disable */
import { useState, useEffect } from "react";
import { C, S, hBadge } from "../../constants";
import { supabase } from "../../supabase";

function TeacherLeave({teachers,addData}){
  const glass={background:"rgba(255,255,255,0.07)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:"16px"};
  const [leaves,setLeaves]=useState([]); const [show,setShow]=useState(false);
  const [f,setF]=useState({teacherId:"",type:"sick",startDate:"",endDate:"",reason:"",substitute:""});
  useEffect(()=>{ const load=async()=>{ const {data}=await supabase.from("teacher_leaves").select("*").order("created_at",{ascending:false}).limit(50); setLeaves(data||[]); }; load(); },[]);
  const add=async()=>{ if(!f.teacherId||!f.startDate)return; await addData("teacher_leaves",{...f,status:"pending"}); setShow(false); setF({teacherId:"",type:"sick",startDate:"",endDate:"",reason:"",substitute:""}); };
  const approve=async(id,status)=>{ await supabase.from("teacher_leaves").update({status}).eq("id",id); };
  const types={sick:{c:C.red,bg:"#fee2e2",i:"🏥",l:"بیماری"},casual:{c:C.abuBakr,bg:"#dbeafe",i:"🏖️",l:"عام"},emergency:{c:"#dc2626",bg:"#fee2e2",i:"🚨",l:"ہنگامی"},hajj:{c:C.gold,bg:C.goldLight,i:"🕋",l:"حج"},other:{c:"#888",bg:"#f3f4f6",i:"📋",l:"دیگر"}};
  const pending=leaves.filter(l=>l.status==="pending");
  return <div style={S.page}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
      <div><div style={{fontSize:"1.1rem",fontWeight:"700",color:C.navy}}>🏖️ Leave Application</div><div style={{fontSize:"0.62rem",color:"#888",marginTop:"2px"}}>Teacher Leave — Approval</div></div>
      <button style={S.addBtn} onClick={()=>setShow(!show)}>+ New Application</button>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:"12px",marginBottom:"20px"}}>
      {[{c:C.amber,i:"⏳",n:pending.length,l:"Pending"},{c:C.green,i:"✅",n:leaves.filter(l=>l.status==="approved").length,l:"Approved"},{c:C.red,i:"❌",n:leaves.filter(l=>l.status==="rejected").length,l:"Rejected"},{c:C.abuBakr,i:"📋",n:leaves.length,l:"Total"}].map((x,i)=><div key={i} style={{background:`linear-gradient(135deg,${x.c}12,${x.c}05)`,borderRadius:"16px",padding:"16px",border:`2px solid ${x.c}20`,textAlign:"center"}}><div style={{fontSize:"1.3rem"}}>{x.i}</div><div style={{fontSize:"1.4rem",fontWeight:"900",color:x.c}}>{x.n}</div><div style={{fontSize:"0.6rem",color:"#888"}}>{x.l}</div></div>)}
    </div>
    {pending.length>0&&<div className="hv-card" style={{...S.card,marginBottom:"20px",background:"linear-gradient(135deg,#fef3c7,#fff)",border:`2px solid ${C.amber}20`}}>
      <div style={{fontSize:"0.82rem",fontWeight:"700",color:C.amber,marginBottom:"12px"}}>⏳ Awaiting Approval ({pending.length})</div>
      {pending.map(l=>{ const t=teachers.find(x=>x.id===l.teacherId); const tp=types[l.type]||types.other; return <div key={l.id} style={{background:C.white,borderRadius:"12px",padding:"12px 16px",marginBottom:"10px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div><div style={{fontSize:"0.75rem",fontWeight:"700",color:C.navy}}>{tp.i} {t?.name||"—"}</div><div style={{fontSize:"0.6rem",color:"#888"}}>{tp.l} • {l.startDate}</div>{l.reason&&<div style={{fontSize:"0.6rem",color:"#555"}}>{l.reason.slice(0,50)}</div>}</div>
        <div style={{display:"flex",gap:"6px"}}><button onClick={()=>approve(l.id,"approved")} style={{...S.saveBtn,padding:"6px 12px",fontSize:"0.6rem"}}>✅</button><button onClick={()=>approve(l.id,"rejected")} style={{...S.dangerBtn,padding:"6px 12px",fontSize:"0.6rem"}}>❌</button></div>
      </div>; })}
    </div>}
    {show&&<div className="hv-card" style={{...S.card,marginBottom:"20px",background:`linear-gradient(135deg,${C.goldLight},#fdf8ee)`,border:`2px solid ${C.gold}30`}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>Teacher *</label><select style={S.inpSm} value={f.teacherId} onChange={e=>setF({...f,teacherId:e.target.value})}><option value="">-- Select --</option>{teachers.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>قسم</label><select style={S.inpSm} value={f.type} onChange={e=>setF({...f,type:e.target.value})}>{Object.entries(types).map(([k,v])=><option key={k} value={k}>{v.i} {v.l}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>Start *</label><input style={{...S.inpSm,direction:"ltr"}} type="date" value={f.startDate} onChange={e=>setF({...f,startDate:e.target.value})}/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>Ended</label><input style={{...S.inpSm,direction:"ltr"}} type="date" value={f.endDate} onChange={e=>setF({...f,endDate:e.target.value})}/></div>
        <div style={{gridColumn:"1/-1"}}><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>وجہ</label><textarea style={{...S.inpSm,minHeight:"60px",resize:"vertical"}} value={f.reason} onChange={e=>setF({...f,reason:e.target.value})} placeholder="Reason for leave..."/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>متبادل استاد</label><input style={S.inpSm} value={f.substitute} onChange={e=>setF({...f,substitute:e.target.value})} placeholder="Name..."/></div>
      </div>
      <button style={S.saveBtn} onClick={add}>✅ Application Submit</button>
    </div>}
    <div style={{...glass,overflow:"hidden"}}><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}>
      <thead><tr style={{background:"rgba(255,255,255,0.04)"}}><th style={{padding:"12px 14px",textAlign:"left",fontSize:"0.65rem",color:"rgba(212,175,55,0.8)",fontWeight:"700"}}>Teacher</th><th style={{padding:"12px 14px",textAlign:"left",fontSize:"0.65rem",color:"rgba(212,175,55,0.8)",fontWeight:"700"}}>Type</th><th style={{padding:"12px 14px",textAlign:"left",fontSize:"0.65rem",color:"rgba(212,175,55,0.8)",fontWeight:"700"}}>Date</th><th style={{padding:"12px 14px",textAlign:"left",fontSize:"0.65rem",color:"rgba(212,175,55,0.8)",fontWeight:"700"}}>Status</th></tr></thead>
      <tbody>{leaves.map(l=>{ const t=teachers.find(x=>x.id===l.teacherId); const tp=types[l.type]||types.other; return <tr key={l.id}><td style={{...S.td,fontWeight:"700"}}>{t?.name||"—"}</td><td style={S.td}><span style={hBadge(tp.c,tp.bg)}>{tp.i} {tp.l}</span></td><td style={{...S.td,fontFamily:"monospace",direction:"ltr",fontSize:"0.6rem"}}>{l.startDate}</td><td style={S.td}><span style={{padding:"3px 8px",borderRadius:"20px",fontSize:"0.55rem",fontWeight:"700",background:l.status==="approved"?"#dcfce7":l.status==="rejected"?"#fee2e2":"#fef3c7",color:l.status==="approved"?C.green:l.status==="rejected"?C.red:C.amber}}>{l.status==="approved"?"✅":l.status==="rejected"?"❌":"⏳"}</span></td></tr>; })}{leaves.length===0&&<tr><td colSpan={4} style={{...S.td,textAlign:"center",color:"#bbb",padding:"40px"}}>No records</td></tr>}</tbody>
    </table></div></div>
  </div>;
}

export default TeacherLeave;
