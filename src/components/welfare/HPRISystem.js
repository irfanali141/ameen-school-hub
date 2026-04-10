/* eslint-disable */
import { useState, useEffect } from "react";
import { C, S, hBadge, HOUSES, sLabel } from "../../constants";
import { supabase } from "../../supabase";
import EmptyState from '../ui/EmptyState';

function HPRISystem({students,addData}){
  const [risks,setRisks]=useState([]); const [show,setShow]=useState(false);
  const [f,setF]=useState({studentId:"",riskType:"attendance",severity:"medium",description:"",actionRequired:"",assignedTo:"",dueDate:"",status:"open"});
  const [filterStatus,setFilterStatus]=useState("all");
  useEffect(()=>{ const load=async()=>{ const {data}=await supabase.from("hpri_risks").select("*").order("created_at",{ascending:false}).limit(50); setRisks(data||[]); }; load(); },[]);
  const add=async()=>{ if(!f.studentId||!f.description)return; await addData("hpri_risks",{...f}); setShow(false); setF({studentId:"",riskType:"attendance",severity:"medium",description:"",actionRequired:"",assignedTo:"",dueDate:"",status:"open"}); };
  const resolveRisk=async(id)=>{ await supabase.from("hpri_risks").update({status:"resolved",resolved_at:new Date().toISOString()}).eq("id",id); };
  const riskTypes={attendance:"✅ Attendance",academic:"📚 Academic",behavioral:"⚠️ Behavior",hifz:"📖 Hifz",fee:"💰 Fee",family:"🏠 Family"};
  const sevConfig={high:{c:C.red,bg:"#fee2e2",l:"High Risk"},medium:{c:C.amber,bg:"#fef3c7",l:"Medium"},low:{c:C.green,bg:"#dcfce7",l:"Low"}};
  const filtered=risks.filter(r=>filterStatus==="all"||r.status===filterStatus);
  const openCount=risks.filter(r=>r.status==="open").length;
  const highCount=risks.filter(r=>r.severity==="high"&&r.status==="open").length;
  return <div style={S.page}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
      <div><div style={{fontSize:"1.1rem",fontWeight:"700",color:C.navy}}>⚠️ HPRI Risk System</div><div style={{fontSize:"0.62rem",color:"#888",marginTop:"2px"}}>High Priority Risk Intervention</div></div>
      <button style={{...S.addBtn,background:`linear-gradient(135deg,${C.red},#b91c1c)`}} onClick={()=>setShow(!show)}>+ New Risk</button>
    </div>
    {highCount>0&&<div style={{background:"#fee2e2",border:`2px solid ${C.red}`,borderRadius:"14px",padding:"14px 18px",marginBottom:"20px",display:"flex",alignItems:"center",gap:"12px"}}><span style={{fontSize:"1.5rem"}}>🚨</span><div><div style={{fontSize:"0.78rem",fontWeight:"700",color:C.red}}>Immediate Attention Required!</div><div style={{fontSize:"0.62rem",color:"#888"}}>{highCount} students need immediate intervention</div></div></div>}
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:"12px",marginBottom:"20px"}}>
      {[{c:C.red,i:"🚨",n:highCount,l:"Urgent"},{c:C.amber,i:"⚠️",n:openCount,l:"Open"},{c:C.green,i:"✅",n:risks.filter(r=>r.status==="resolved").length,l:"Resolved"},{c:C.navy,i:"📋",n:risks.length,l:"Total"}].map((x,i)=><div key={i} style={{background:`linear-gradient(135deg,${x.c}12,${x.c}05)`,borderRadius:"16px",padding:"16px",border:`2px solid ${x.c}20`,textAlign:"center"}}><div style={{fontSize:"1.3rem"}}>{x.i}</div><div style={{fontSize:"1.4rem",fontWeight:"900",color:x.c}}>{x.n}</div><div style={{fontSize:"0.6rem",color:"#888"}}>{x.l}</div></div>)}
    </div>
    {show&&<div className="hv-card" style={{...S.card,marginBottom:"20px",background:"linear-gradient(135deg,#fee2e2,#fff5f5)",border:`2px solid ${C.red}20`}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>Student *</label><select style={S.inpSm} value={f.studentId} onChange={e=>setF({...f,studentId:e.target.value})}><option value="">-- Select --</option>{students.map(s=><option key={s.id} value={s.id}>{sLabel(s)}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>Type</label><select style={S.inpSm} value={f.riskType} onChange={e=>setF({...f,riskType:e.target.value})}>{Object.entries(riskTypes).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>Severity</label><select style={S.inpSm} value={f.severity} onChange={e=>setF({...f,severity:e.target.value})}><option value="high">🔴 High</option><option value="medium">🟡 Medium</option><option value="low">🟢 Low</option></select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>ذمہ دار</label><input style={S.inpSm} value={f.assignedTo} onChange={e=>setF({...f,assignedTo:e.target.value})} placeholder="Teacher name..."/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>Due Date</label><input style={{...S.inpSm,direction:"ltr"}} type="date" value={f.dueDate} onChange={e=>setF({...f,dueDate:e.target.value})}/></div>
        <div style={{gridColumn:"1/-1"}}><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>تفصیل *</label><textarea style={{...S.inpSm,minHeight:"60px",resize:"vertical"}} value={f.description} onChange={e=>setF({...f,description:e.target.value})} placeholder="Issue details..."/></div>
        <div style={{gridColumn:"1/-1"}}><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>ضروری اقدام</label><textarea style={{...S.inpSm,minHeight:"50px",resize:"vertical"}} value={f.actionRequired} onChange={e=>setF({...f,actionRequired:e.target.value})} placeholder="What action is required..."/></div>
      </div>
      <button style={{...S.saveBtn,background:`linear-gradient(135deg,${C.red},#b91c1c)`}} onClick={add}>⚠️ Add Risk</button>
    </div>}
    <div style={{display:"flex",gap:"8px",marginBottom:"16px"}}>{[["all","All"],["open","Open"],["resolved","Resolved"]].map(([v,l])=><button key={v} onClick={()=>setFilterStatus(v)} style={{padding:"7px 14px",borderRadius:"10px",border:"none",cursor:"pointer",fontSize:"0.62rem",fontWeight:filterStatus===v?"700":"400",background:filterStatus===v?`linear-gradient(135deg,${C.red},#b91c1c)`:C.white,color:filterStatus===v?C.white:"#888",fontFamily:"inherit"}}>{l}</button>)}</div>
    <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
      {filtered.map(r=>{ const st=students.find(s=>s.id===r.studentId); const h=HOUSES.find(x=>x.id===st?.houseId); const sev=sevConfig[r.severity]||sevConfig.medium; const isOD=r.dueDate&&r.status==="open"&&new Date(r.dueDate)<new Date(); return <div key={r.id} className="hv-card" style={{...S.card,borderRight:`4px solid ${sev.c}`,padding:"16px 20px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"8px"}}>
          <div><div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"4px"}}><span style={{fontSize:"0.85rem",fontWeight:"700",color:C.navy}}>{st?.name||"—"}</span>{h&&<span style={hBadge(h.color,h.light)}>{h.emoji}</span>}<span style={{padding:"3px 8px",borderRadius:"20px",fontSize:"0.58rem",fontWeight:"700",background:sev.bg,color:sev.c}}>{sev.l}</span>{isOD&&<span style={{padding:"3px 8px",borderRadius:"20px",fontSize:"0.55rem",fontWeight:"700",background:"#fee2e2",color:C.red}}>⏰ Overdue</span>}</div><div style={{fontSize:"0.62rem",color:"#888"}}>{riskTypes[r.riskType]}</div></div>
          <span style={{padding:"4px 10px",borderRadius:"20px",fontSize:"0.58rem",fontWeight:"700",background:r.status==="resolved"?"#dcfce7":"#fef3c7",color:r.status==="resolved"?C.green:C.amber}}>{r.status==="resolved"?"✅ Resolved":"⏳ Open"}</span>
        </div>
        <div style={{fontSize:"0.68rem",color:"#555",marginBottom:"8px",lineHeight:"1.6"}}>{r.description}</div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{display:"flex",gap:"8px"}}>{r.assignedTo&&<span style={{fontSize:"0.6rem",color:"#888"}}>👤 {r.assignedTo}</span>}{r.dueDate&&<span style={{fontSize:"0.6rem",color:isOD?C.red:"#888",fontFamily:"monospace",direction:"ltr"}}>{r.dueDate}</span>}</div>
          {r.status==="open"&&<button onClick={()=>resolveRisk(r.id)} style={{...S.saveBtn,padding:"5px 14px",fontSize:"0.6rem"}}>✅ Resolve</button>}
        </div>
      </div>; })}
      {filtered.length===0&&<EmptyState
        icon={filterStatus==="open"?"✅":"⚠️"}
        title={filterStatus==="open"?"کوئی کھلا خطرہ نہیں":"کوئی اندراج نہیں"}
        subtitle={filterStatus==="open"?"تمام خطرات حل ہو گئے ہیں":"ابھی تک کوئی HPRI اندراج نہیں ہے"}
      />}
    </div>
  </div>;
}

export default HPRISystem;
