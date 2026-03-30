/* eslint-disable */
import { useState, useEffect } from "react";
import { C, S, hBadge, sLabel } from "../../constants";
import { supabase } from "../../supabase";

function WelfareFeedback({students,addData}){
  const [feedbacks,setFeedbacks]=useState([]); const [show,setShow]=useState(false);
  const [f,setF]=useState({studentId:"",type:"academic",severity:"low",description:"",actionTaken:"",followUpDate:"",reportedBy:"",anonymous:false});
  useEffect(()=>{ const load=async()=>{ const {data}=await supabase.from("welfare_feedback").select("*").order("created_at",{ascending:false}).limit(50); setFeedbacks(data||[]); }; load(); },[]);
  const add=async()=>{ if(!f.studentId&&!f.anonymous)return; await addData("welfare_feedback",{...f}); setShow(false); setF({studentId:"",type:"academic",severity:"low",description:"",actionTaken:"",followUpDate:"",reportedBy:"",anonymous:false}); };
  const types={academic:{c:C.abuBakr,bg:"#dbeafe",i:"📚",l:"Academic"},behavioral:{c:C.amber,bg:"#fef3c7",i:"😤",l:"Behavior"},emotional:{c:C.purple,bg:"#ede9fe",i:"💭",l:"Emotional"},health:{c:C.red,bg:"#fee2e2",i:"🏥",l:"Health"},family:{c:C.green,bg:"#dcfce7",i:"👪",l:"Family"},bullying:{c:"#dc2626",bg:"#fee2e2",i:"⚠️",l:"Bullying"},suggestion:{c:C.gold,bg:C.goldLight,i:"💡",l:"Proposal"}};
  const sevConfig={low:{c:C.green,l:"Low"},medium:{c:C.amber,l:"Medium"},high:{c:C.red,l:"High"},critical:{c:"#dc2626",l:"Critical"}};
  return <div style={S.page}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
      <div><div style={{fontSize:"1.1rem",fontWeight:"700",color:C.navy}}>💬 Student Welfare</div><div style={{fontSize:"0.62rem",color:"#888",marginTop:"2px"}}>Feedback, Consultations, Suggestions</div></div>
      <button style={S.addBtn} onClick={()=>setShow(!show)}>+ New Report</button>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:"12px",marginBottom:"20px"}}>
      {[{c:C.red,i:"⚠️",n:feedbacks.filter(f=>!f.resolved).length,l:"Open"},{c:C.amber,i:"😤",n:feedbacks.filter(f=>f.type==="behavioral").length,l:"Behavior"},{c:C.purple,i:"💭",n:feedbacks.filter(f=>f.type==="emotional").length,l:"Emotional"},{c:C.gold,i:"💡",n:feedbacks.filter(f=>f.type==="suggestion").length,l:"Suggestions"}].map((x,i)=><div key={i} style={{background:`linear-gradient(135deg,${x.c}12,${x.c}05)`,borderRadius:"16px",padding:"16px",border:`2px solid ${x.c}20`,textAlign:"center"}}><div style={{fontSize:"1.3rem"}}>{x.i}</div><div style={{fontSize:"1.4rem",fontWeight:"900",color:x.c}}>{x.n}</div><div style={{fontSize:"0.6rem",color:"#888"}}>{x.l}</div></div>)}
    </div>
    {show&&<div className="hv-card" style={{...S.card,marginBottom:"20px",background:`linear-gradient(135deg,${C.goldLight},#fdf8ee)`,border:`2px solid ${C.gold}30`}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>Student</label><select style={S.inpSm} value={f.studentId} onChange={e=>setF({...f,studentId:e.target.value})} disabled={f.anonymous}><option value="">-- Select --</option>{students.map(s=><option key={s.id} value={s.id}>{sLabel(s)}</option>)}</select></div>
        <div style={{display:"flex",alignItems:"center",gap:"8px",paddingTop:"20px"}}><input type="checkbox" checked={f.anonymous} onChange={e=>setF({...f,anonymous:e.target.checked,studentId:""})} id="anon2"/><label htmlFor="anon2" style={{fontSize:"0.68rem",color:C.navy,cursor:"pointer"}}>Anonymous Report</label></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>Type</label><select style={S.inpSm} value={f.type} onChange={e=>setF({...f,type:e.target.value})}>{Object.entries(types).map(([k,v])=><option key={k} value={k}>{v.i} {v.l}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>Severity</label><select style={S.inpSm} value={f.severity} onChange={e=>setF({...f,severity:e.target.value})}>{Object.entries(sevConfig).map(([k,v])=><option key={k} value={k}>{v.l}</option>)}</select></div>
        <div style={{gridColumn:"1/-1"}}><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>تفصیل</label><textarea style={{...S.inpSm,minHeight:"80px",resize:"vertical"}} value={f.description} onChange={e=>setF({...f,description:e.target.value})} placeholder="Issue details..."/></div>
        <div style={{gridColumn:"1/-1"}}><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>کی گئی کارروائی</label><textarea style={{...S.inpSm,minHeight:"60px",resize:"vertical"}} value={f.actionTaken} onChange={e=>setF({...f,actionTaken:e.target.value})} placeholder="What step was taken..."/></div>
      </div>
      <button style={S.saveBtn} onClick={add}>✅ Report Enter</button>
    </div>}
    <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
      {feedbacks.map(fb=>{ const tc=types[fb.type]||types.suggestion; const sc=sevConfig[fb.severity]||sevConfig.low; const st=students.find(s=>s.id===fb.studentId); return <div key={fb.id} className="hv-card" style={{...S.card,borderRight:`4px solid ${tc.c}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"8px"}}><div style={{display:"flex",alignItems:"center",gap:"8px"}}><span style={{fontSize:"1rem"}}>{tc.i}</span><span style={{fontSize:"0.8rem",fontWeight:"700",color:C.navy}}>{fb.anonymous?"Anonymous":st?.name||"—"}</span></div><div style={{display:"flex",gap:"6px"}}><span style={hBadge(tc.c,tc.bg)}>{tc.l}</span><span style={hBadge(sc.c,sc.c+"15")}>{sc.l}</span></div></div>
        <div style={{fontSize:"0.68rem",color:"#555",lineHeight:"1.6",marginBottom:"8px"}}>{fb.description}</div>
        {fb.actionTaken&&<div style={{background:"#f0fdf4",borderRadius:"8px",padding:"8px 12px",fontSize:"0.62rem",color:C.green}}>✅ {fb.actionTaken}</div>}
      </div>; })}
      {feedbacks.length===0&&<div className="hv-card" style={{...S.card,textAlign:"center",color:"#bbb",padding:"60px"}}>ابھی کوئی فیڈبیک نہیں</div>}
    </div>
  </div>;
}

export default WelfareFeedback;
