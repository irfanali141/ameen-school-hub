/* eslint-disable */
import { useState, useEffect } from "react";
import { C, S, hBadge } from "../../constants";
import { supabase } from "../../supabase";
import useClasses from "../../hooks/useClasses";

const EMPTY_F=()=>({studentName:"",fatherName:"",dob:"",address:"",phone:"",grade:"",section:"",previousSchool:"",admissionDate:new Date().toISOString().split("T")[0],admissionNo:"",status:"pending",documents:""});

function RegistrarHub({students,addData}){
  const { gradeOptions, sectionsFor } = useClasses();
  const [admissions,setAdmissions]=useState([]); const [show,setShow]=useState(false);
  const [f,setF]=useState(EMPTY_F());
  const [q,setQ]=useState("");
  useEffect(()=>{ const load=async()=>{ const {data}=await supabase.from("admissions").select("*").order("created_at",{ascending:false}).limit(50); setAdmissions(data||[]); }; load(); },[]);
  const add=async()=>{ if(!f.studentName||!f.phone)return; await addData("admissions",{...f}); setShow(false); setF(EMPTY_F()); };
  const sectionOptions=sectionsFor(f.grade);
  const updateStatus=async(id,status)=>{ await supabase.from("admissions").update({status,updated_at:new Date().toISOString()}).eq("id",id); };
  const statusConfig={pending:{c:C.amber,bg:"#fef3c7",l:"زیر التواء"},approved:{c:C.green,bg:"#dcfce7",l:"منظور"},rejected:{c:C.red,bg:"#fee2e2",l:"مسترد"},enrolled:{c:C.abuBakr,bg:"#dbeafe",l:"داخل"}};
  const filtered=admissions.filter(a=>!q||a.studentName?.includes(q)||a.admissionNo?.includes(q));
  return <div style={S.page}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
      <div><div style={{fontSize:"1.1rem",fontWeight:"700",color:C.navy}}>📋 Registrar Hub</div><div style={{fontSize:"0.62rem",color:"#888",marginTop:"2px"}}>Admission, Documents, Official Records</div></div>
      <button style={S.addBtn} onClick={()=>setShow(!show)}>+ New Admission</button>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:"12px",marginBottom:"20px"}}>
      {[{c:C.amber,i:"⏳",n:admissions.filter(a=>a.status==="pending").length,l:"Pending"},{c:C.green,i:"✅",n:admissions.filter(a=>a.status==="approved").length,l:"Approved"},{c:C.abuBakr,i:"🎓",n:admissions.filter(a=>a.status==="enrolled").length,l:"Enrolled"},{c:C.navy,i:"📋",n:admissions.length,l:"Total"}].map((x,i)=><div key={i} style={{background:`linear-gradient(135deg,${x.c}12,${x.c}05)`,borderRadius:"16px",padding:"16px",border:`2px solid ${x.c}20`,textAlign:"center"}}><div style={{fontSize:"1.3rem"}}>{x.i}</div><div style={{fontSize:"1.4rem",fontWeight:"900",color:x.c}}>{x.n}</div><div style={{fontSize:"0.6rem",color:"#888"}}>{x.l}</div></div>)}
    </div>
    {show&&<div className="hv-card" style={{...S.card,marginBottom:"20px",background:`linear-gradient(135deg,${C.goldLight},#fdf8ee)`,border:`2px solid ${C.gold}30`}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>Student Name *</label><input style={S.inpSm} value={f.studentName} onChange={e=>setF({...f,studentName:e.target.value})} placeholder="Complete Name..."/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>Father's Name</label><input style={S.inpSm} value={f.fatherName} onChange={e=>setF({...f,fatherName:e.target.value})} placeholder="Father's name..."/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>Grade</label><select style={S.inpSm} value={f.grade} onChange={e=>setF({...f,grade:e.target.value,section:""})}><option value="">-- Select Grade --</option>{gradeOptions.map(g=><option key={g}>{g}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>Section</label><select style={S.inpSm} value={f.section} onChange={e=>setF({...f,section:e.target.value})} disabled={!f.grade||sectionOptions.length===0}><option value="">-- Select Section --</option>{sectionOptions.map(s=><option key={s}>{s}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>Phone *</label><input style={{...S.inpSm,direction:"ltr"}} value={f.phone} onChange={e=>setF({...f,phone:e.target.value})} placeholder="0300-1234567"/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>Admission Marks</label><input style={{...S.inpSm,direction:"ltr"}} value={f.admissionNo} onChange={e=>setF({...f,admissionNo:e.target.value})} placeholder="ADM-2026-001"/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>Admission Date</label><input style={{...S.inpSm,direction:"ltr"}} type="date" value={f.admissionDate} onChange={e=>setF({...f,admissionDate:e.target.value})}/></div>
        <div style={{gridColumn:"1/-1"}}><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>Address</label><input style={S.inpSm} value={f.address} onChange={e=>setF({...f,address:e.target.value})} placeholder="Complete Address..."/></div>
      </div>
      <button style={S.saveBtn} onClick={add}>✅ Application Save</button>
    </div>}
    <div style={{marginBottom:"16px"}}><input style={{...S.inpSm,direction:"ltr"}} placeholder="🔍 Search by name or admission no..." value={q} onChange={e=>setQ(e.target.value)}/></div>
    <div style={S.card} className="hv-card"><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}>
      <thead><tr><th style={S.th}>Name</th><th style={S.th}>Father</th><th style={S.th}>Grade</th><th style={S.th}>Section</th><th style={S.th}>Admission No</th><th style={S.th}>Phone</th><th style={S.th}>Status</th><th style={S.th}>Action</th></tr></thead>
      <tbody>{filtered.map(a=>{ const sc=statusConfig[a.status]||statusConfig.pending; return <tr key={a.id}>
        <td style={{...S.td,fontWeight:"700"}}>{a.studentName}</td><td style={S.td}>{a.fatherName||"—"}</td><td style={S.td}>{a.grade}</td><td style={S.td}>{a.section||"—"}</td>
        <td style={{...S.td,fontFamily:"monospace",direction:"ltr",fontSize:"0.6rem",color:C.gold}}>{a.admissionNo||"—"}</td>
        <td style={{...S.td,fontFamily:"monospace",direction:"ltr",fontSize:"0.6rem"}}>{a.phone}</td>
        <td style={S.td}><span style={{padding:"4px 10px",borderRadius:"20px",fontSize:"0.58rem",fontWeight:"700",background:sc.bg,color:sc.c}}>{sc.l}</span></td>
        <td style={S.td}>
          {a.status==="pending"&&<div style={{display:"flex",gap:"4px"}}><button onClick={()=>updateStatus(a.id,"approved")} style={{...S.saveBtn,padding:"4px 8px",fontSize:"0.55rem"}}>✅</button><button onClick={()=>updateStatus(a.id,"rejected")} style={{...S.dangerBtn,padding:"4px 8px",fontSize:"0.55rem"}}>❌</button></div>}
          {a.status==="approved"&&<button onClick={()=>updateStatus(a.id,"enrolled")} style={{...S.addBtn,padding:"4px 10px",fontSize:"0.55rem"}}>Enroll 🎓</button>}
        </td>
      </tr>; })}{filtered.length===0&&<tr><td colSpan={8} style={{...S.td,textAlign:"center",color:"#bbb",padding:"40px"}}><span className="ur">کوئی اندراج نہیں</span></td></tr>}</tbody>
    </table></div></div>
  </div>;
}

export default RegistrarHub;
