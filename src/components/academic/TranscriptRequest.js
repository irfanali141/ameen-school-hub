/* eslint-disable */
import { useState, useEffect } from "react";
import { C, S, hBadge, sLabel } from "../../constants";
import { supabase } from "../../supabase";

function TranscriptRequest({students,addData}){
  const glass={background:"rgba(255,255,255,0.07)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:"16px"};
  const [requests,setRequests]=useState([]); const [show,setShow]=useState(false);
  const [f,setF]=useState({studentId:"",purpose:"university",institution:"",urgency:"normal",notes:""});
  useEffect(()=>{ const load=async()=>{ const {data}=await supabase.from("transcript_requests").select("*").order("created_at",{ascending:false}).limit(50); setRequests(data||[]); }; load(); },[]);
  const add=async()=>{ if(!f.studentId)return; await addData("transcript_requests",{...f,status:"pending"}); setShow(false); setF({studentId:"",purpose:"university",institution:"",urgency:"normal",notes:""}); };
  const approve=async(id)=>{ await supabase.from("transcript_requests").update({status:"approved"}).eq("id",id); };
  const purposes={university:{c:C.abuBakr,i:"🎓",l:"University"},job:{c:C.green,i:"💼",l:"Job"},scholarship:{c:C.gold,i:"🏆",l:"Scholarship"},transfer:{c:C.amber,i:"🔄",l:"Transfer"},personal:{c:"#888",i:"📄",l:"Personal"}};
  const urgencies={normal:{c:C.green,l:"Normal"},urgent:{c:C.amber,l:"Urgent"},express:{c:C.red,l:"Express"}};
  return <div style={S.page}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
      <div><div style={{fontSize:"1.1rem",fontWeight:"700",color:C.navy}}>📜 Transcript Request</div><div style={{fontSize:"0.62rem",color:"#888",marginTop:"2px"}}>Official academic document</div></div>
      <button style={S.addBtn} onClick={()=>setShow(!show)}>+ New Application</button>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:"12px",marginBottom:"20px"}}>
      {[{c:C.amber,i:"⏳",n:requests.filter(r=>r.status==="pending").length,l:"Pending"},{c:C.green,i:"✅",n:requests.filter(r=>r.status==="approved").length,l:"Approved"},{c:C.red,i:"🚨",n:requests.filter(r=>r.urgency==="express").length,l:"Express"},{c:C.abuBakr,i:"📜",n:requests.length,l:"Total"}].map((x,i)=><div key={i} style={{background:`linear-gradient(135deg,${x.c}12,${x.c}05)`,borderRadius:"16px",padding:"16px",border:`2px solid ${x.c}20`,textAlign:"center"}}><div style={{fontSize:"1.3rem"}}>{x.i}</div><div style={{fontSize:"1.4rem",fontWeight:"900",color:x.c}}>{x.n}</div><div style={{fontSize:"0.6rem",color:"#888"}}>{x.l}</div></div>)}
    </div>
    {show&&<div className="hv-card" style={{...S.card,marginBottom:"20px",background:`linear-gradient(135deg,${C.goldLight},#fdf8ee)`,border:`2px solid ${C.gold}30`}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>Student *</label><select style={S.inpSm} value={f.studentId} onChange={e=>setF({...f,studentId:e.target.value})}><option value="">-- Select --</option>{students.map(s=><option key={s.id} value={s.id}>{sLabel(s)}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>Purpose</label><select style={S.inpSm} value={f.purpose} onChange={e=>setF({...f,purpose:e.target.value})}>{Object.entries(purposes).map(([k,v])=><option key={k} value={k}>{v.i} {v.l}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>ادارہ</label><input style={S.inpSm} value={f.institution} onChange={e=>setF({...f,institution:e.target.value})} placeholder="University..."/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>Urgency</label><select style={S.inpSm} value={f.urgency} onChange={e=>setF({...f,urgency:e.target.value})}>{Object.entries(urgencies).map(([k,v])=><option key={k} value={k}>{v.l}</option>)}</select></div>
        <div style={{gridColumn:"1/-1"}}><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>نوٹس</label><textarea style={{...S.inpSm,minHeight:"60px",resize:"vertical"}} value={f.notes} onChange={e=>setF({...f,notes:e.target.value})} placeholder="Extra Information..."/></div>
      </div>
      <button style={S.saveBtn} onClick={add}>✅ Application Submit</button>
    </div>}
    <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
      {requests.map(r=>{ const p=purposes[r.purpose]||purposes.personal; const u=urgencies[r.urgency]||urgencies.normal; const st=students.find(s=>s.id===r.studentId); return <div key={r.id} className="hv-card" style={{...S.card,borderRight:`4px solid ${p.c}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"8px"}}>
          <div><div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"4px"}}><span>{p.i}</span><span style={{fontSize:"0.82rem",fontWeight:"700",color:C.navy}}>{st?.name||"—"}</span></div>{r.institution&&<div style={{fontSize:"0.62rem",color:"#888"}}>🏫 {r.institution}</div>}</div>
          <div style={{display:"flex",gap:"6px",flexWrap:"wrap",justifyContent:"flex-end"}}><span style={hBadge(p.c,p.c+"15")}>{p.l}</span><span style={hBadge(u.c,u.c+"15")}>{u.l}</span><span style={{padding:"3px 8px",borderRadius:"20px",fontSize:"0.55rem",fontWeight:"700",background:r.status==="approved"?"#dcfce7":"#fef3c7",color:r.status==="approved"?C.green:C.amber}}>{r.status==="approved"?"✅ Approved":"⏳ Pending"}</span></div>
        </div>
        {r.status==="pending"&&<button onClick={()=>approve(r.id)} style={{...S.saveBtn,padding:"6px 14px",fontSize:"0.62rem",marginTop:"6px"}}>✅ Approve</button>}
      </div>; })}
      {requests.length===0&&<div style={{...glass,textAlign:"center",color:"rgba(255,255,255,0.3)",padding:"60px"}}>Any Application No</div>}
    </div>
  </div>;
}

export default TranscriptRequest;
