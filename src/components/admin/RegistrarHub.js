/* eslint-disable */
import { useState, useEffect } from "react";
import { C, S, hBadge } from "../../constants";
import { db, collection, onSnapshot, updateDoc, doc, serverTimestamp, query, orderBy, limit } from "../../firebase";

function RegistrarHub({students,addData}){
  const [admissions,setAdmissions]=useState([]); const [show,setShow]=useState(false);
  const [f,setF]=useState({studentName:"",fatherName:"",dob:"",address:"",phone:"",grade:"Grade 1",previousSchool:"",admissionDate:new Date().toISOString().split("T")[0],admissionNo:"",status:"pending",documents:""});
  const [q,setQ]=useState("");
  useEffect(()=>{ return onSnapshot(query(collection(db,"admissions"),orderBy("createdAt","desc"),limit(50)),s=>setAdmissions(s.docs.map(d=>({id:d.id,...d.data()}))));  },[]);
  const add=async()=>{ if(!f.studentName||!f.phone)return; await addData("admissions",{...f}); setShow(false); setF({studentName:"",fatherName:"",dob:"",address:"",phone:"",grade:"Grade 1",previousSchool:"",admissionDate:new Date().toISOString().split("T")[0],admissionNo:"",status:"pending",documents:""}); };
  const updateStatus=async(id,status)=>{ await updateDoc(doc(db,"admissions",id),{status,updatedAt:serverTimestamp()}); };
  const statusConfig={pending:{c:C.amber,bg:"#fef3c7",l:"زیر التواء"},approved:{c:C.green,bg:"#dcfce7",l:"منظور"},rejected:{c:C.red,bg:"#fee2e2",l:"مسترد"},enrolled:{c:C.abuBakr,bg:"#dbeafe",l:"داخل"}};
  const filtered=admissions.filter(a=>!q||a.studentName?.includes(q)||a.admissionNo?.includes(q));
  return <div style={S.page}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
      <div><div style={{fontSize:"1.1rem",fontWeight:"700",color:C.navy}}>📋 رجسٹرار ہب</div><div style={{fontSize:"0.62rem",color:"#888",marginTop:"2px"}}>داخلہ، دستاویزات، سرکاری ریکارڈ</div></div>
      <button style={S.addBtn} onClick={()=>setShow(!show)}>+ نیا داخلہ</button>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:"12px",marginBottom:"20px"}}>
      {[{c:C.amber,i:"⏳",n:admissions.filter(a=>a.status==="pending").length,l:"زیر التواء"},{c:C.green,i:"✅",n:admissions.filter(a=>a.status==="approved").length,l:"منظور"},{c:C.abuBakr,i:"🎓",n:admissions.filter(a=>a.status==="enrolled").length,l:"داخل"},{c:C.navy,i:"📋",n:admissions.length,l:"کل"}].map((x,i)=><div key={i} style={{background:`linear-gradient(135deg,${x.c}12,${x.c}05)`,borderRadius:"16px",padding:"16px",border:`2px solid ${x.c}20`,textAlign:"center"}}><div style={{fontSize:"1.3rem"}}>{x.i}</div><div style={{fontSize:"1.4rem",fontWeight:"900",color:x.c}}>{x.n}</div><div style={{fontSize:"0.6rem",color:"#888"}}>{x.l}</div></div>)}
    </div>
    {show&&<div className="hv-card" style={{...S.card,marginBottom:"20px",background:`linear-gradient(135deg,${C.goldLight},#fdf8ee)`,border:`2px solid ${C.gold}30`}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>طالب علم کا نام *</label><input style={S.inpSm} value={f.studentName} onChange={e=>setF({...f,studentName:e.target.value})} placeholder="مکمل نام..."/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>والد کا نام</label><input style={S.inpSm} value={f.fatherName} onChange={e=>setF({...f,fatherName:e.target.value})} placeholder="والد کا نام..."/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>جماعت</label><select style={S.inpSm} value={f.grade} onChange={e=>setF({...f,grade:e.target.value})}>{["Grade 1","Grade 2","Grade 3","Grade 4","Grade 5","Grade 6","Grade 7","Grade 8","Grade 9","Grade 10"].map(g=><option key={g}>{g}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>فون *</label><input style={{...S.inpSm,direction:"ltr"}} value={f.phone} onChange={e=>setF({...f,phone:e.target.value})} placeholder="0300-1234567"/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>داخلہ نمبر</label><input style={{...S.inpSm,direction:"ltr"}} value={f.admissionNo} onChange={e=>setF({...f,admissionNo:e.target.value})} placeholder="ADM-2026-001"/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>داخلہ تاریخ</label><input style={{...S.inpSm,direction:"ltr"}} type="date" value={f.admissionDate} onChange={e=>setF({...f,admissionDate:e.target.value})}/></div>
        <div style={{gridColumn:"1/-1"}}><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>پتہ</label><input style={S.inpSm} value={f.address} onChange={e=>setF({...f,address:e.target.value})} placeholder="مکمل پتہ..."/></div>
      </div>
      <button style={S.saveBtn} onClick={add}>✅ درخواست محفوظ کریں</button>
    </div>}
    <div style={{marginBottom:"16px"}}><input style={{...S.inpSm,direction:"rtl"}} placeholder="🔍 نام یا داخلہ نمبر..." value={q} onChange={e=>setQ(e.target.value)}/></div>
    <div style={S.card} className="hv-card"><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}>
      <thead><tr><th style={S.th}>نام</th><th style={S.th}>والد</th><th style={S.th}>جماعت</th><th style={S.th}>داخلہ نمبر</th><th style={S.th}>فون</th><th style={S.th}>حال</th><th style={S.th}>عمل</th></tr></thead>
      <tbody>{filtered.map(a=>{ const sc=statusConfig[a.status]||statusConfig.pending; return <tr key={a.id}>
        <td style={{...S.td,fontWeight:"700"}}>{a.studentName}</td><td style={S.td}>{a.fatherName||"—"}</td><td style={S.td}>{a.grade}</td>
        <td style={{...S.td,fontFamily:"monospace",direction:"ltr",fontSize:"0.6rem",color:C.gold}}>{a.admissionNo||"—"}</td>
        <td style={{...S.td,fontFamily:"monospace",direction:"ltr",fontSize:"0.6rem"}}>{a.phone}</td>
        <td style={S.td}><span style={{padding:"4px 10px",borderRadius:"20px",fontSize:"0.58rem",fontWeight:"700",background:sc.bg,color:sc.c}}>{sc.l}</span></td>
        <td style={S.td}>
          {a.status==="pending"&&<div style={{display:"flex",gap:"4px"}}><button onClick={()=>updateStatus(a.id,"approved")} style={{...S.saveBtn,padding:"4px 8px",fontSize:"0.55rem"}}>✅</button><button onClick={()=>updateStatus(a.id,"rejected")} style={{...S.dangerBtn,padding:"4px 8px",fontSize:"0.55rem"}}>❌</button></div>}
          {a.status==="approved"&&<button onClick={()=>updateStatus(a.id,"enrolled")} style={{...S.addBtn,padding:"4px 10px",fontSize:"0.55rem"}}>داخل 🎓</button>}
        </td>
      </tr>; })}{filtered.length===0&&<tr><td colSpan={7} style={{...S.td,textAlign:"center",color:"#bbb",padding:"40px"}}>کوئی ریکارڈ نہیں</td></tr>}</tbody>
    </table></div></div>
  </div>;
}

export default RegistrarHub;
