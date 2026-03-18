/* eslint-disable */
import { useState, useEffect } from "react";
import { C, S, hBadge, HOUSES } from "../../constants";
import { db, collection, onSnapshot, updateDoc, doc, serverTimestamp, query, orderBy, limit } from "../../firebase";

function HPRISystem({students,addData}){
  const [risks,setRisks]=useState([]); const [show,setShow]=useState(false);
  const [f,setF]=useState({studentId:"",riskType:"attendance",severity:"medium",description:"",actionRequired:"",assignedTo:"",dueDate:"",status:"open"});
  const [filterStatus,setFilterStatus]=useState("all");
  useEffect(()=>{ return onSnapshot(query(collection(db,"hpri_risks"),orderBy("createdAt","desc"),limit(50)),s=>setRisks(s.docs.map(d=>({id:d.id,...d.data()}))));  },[]);
  const add=async()=>{ if(!f.studentId||!f.description)return; await addData("hpri_risks",{...f}); setShow(false); setF({studentId:"",riskType:"attendance",severity:"medium",description:"",actionRequired:"",assignedTo:"",dueDate:"",status:"open"}); };
  const resolveRisk=async(id)=>{ await updateDoc(doc(db,"hpri_risks",id),{status:"resolved",resolvedAt:serverTimestamp()}); };
  const riskTypes={attendance:"✅ حاضری",academic:"📚 تعلیمی",behavioral:"⚠️ رویہ",hifz:"📖 حفظ",fee:"💰 فیس",family:"🏠 خاندانی"};
  const sevConfig={high:{c:C.red,bg:"#fee2e2",l:"زیادہ خطرہ"},medium:{c:C.amber,bg:"#fef3c7",l:"درمیانہ"},low:{c:C.green,bg:"#dcfce7",l:"کم"}};
  const filtered=risks.filter(r=>filterStatus==="all"||r.status===filterStatus);
  const openCount=risks.filter(r=>r.status==="open").length;
  const highCount=risks.filter(r=>r.severity==="high"&&r.status==="open").length;
  return <div style={S.page}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
      <div><div style={{fontSize:"1.1rem",fontWeight:"700",color:C.navy}}>⚠️ HPRI رسک سسٹم</div><div style={{fontSize:"0.62rem",color:"#888",marginTop:"2px"}}>High Priority Risk Intervention</div></div>
      <button style={{...S.addBtn,background:`linear-gradient(135deg,${C.red},#b91c1c)`}} onClick={()=>setShow(!show)}>+ نیا رسک</button>
    </div>
    {highCount>0&&<div style={{background:"#fee2e2",border:`2px solid ${C.red}`,borderRadius:"14px",padding:"14px 18px",marginBottom:"20px",display:"flex",alignItems:"center",gap:"12px"}}><span style={{fontSize:"1.5rem"}}>🚨</span><div><div style={{fontSize:"0.78rem",fontWeight:"700",color:C.red}}>فوری توجہ درکار!</div><div style={{fontSize:"0.62rem",color:"#888"}}>{highCount} طلبا کو فوری مداخلت کی ضرورت</div></div></div>}
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:"12px",marginBottom:"20px"}}>
      {[{c:C.red,i:"🚨",n:highCount,l:"فوری"},{c:C.amber,i:"⚠️",n:openCount,l:"کھلے"},{c:C.green,i:"✅",n:risks.filter(r=>r.status==="resolved").length,l:"حل شدہ"},{c:C.navy,i:"📋",n:risks.length,l:"کل"}].map((x,i)=><div key={i} style={{background:`linear-gradient(135deg,${x.c}12,${x.c}05)`,borderRadius:"16px",padding:"16px",border:`2px solid ${x.c}20`,textAlign:"center"}}><div style={{fontSize:"1.3rem"}}>{x.i}</div><div style={{fontSize:"1.4rem",fontWeight:"900",color:x.c}}>{x.n}</div><div style={{fontSize:"0.6rem",color:"#888"}}>{x.l}</div></div>)}
    </div>
    {show&&<div className="hv-card" style={{...S.card,marginBottom:"20px",background:"linear-gradient(135deg,#fee2e2,#fff5f5)",border:`2px solid ${C.red}20`}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>طالب علم *</label><select style={S.inpSm} value={f.studentId} onChange={e=>setF({...f,studentId:e.target.value})}><option value="">-- منتخب کریں --</option>{students.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>قسم</label><select style={S.inpSm} value={f.riskType} onChange={e=>setF({...f,riskType:e.target.value})}>{Object.entries(riskTypes).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>شدت</label><select style={S.inpSm} value={f.severity} onChange={e=>setF({...f,severity:e.target.value})}><option value="high">🔴 زیادہ</option><option value="medium">🟡 درمیانہ</option><option value="low">🟢 کم</option></select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>ذمہ دار</label><input style={S.inpSm} value={f.assignedTo} onChange={e=>setF({...f,assignedTo:e.target.value})} placeholder="استاد کا نام..."/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>آخری تاریخ</label><input style={{...S.inpSm,direction:"ltr"}} type="date" value={f.dueDate} onChange={e=>setF({...f,dueDate:e.target.value})}/></div>
        <div style={{gridColumn:"1/-1"}}><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>تفصیل *</label><textarea style={{...S.inpSm,minHeight:"60px",resize:"vertical"}} value={f.description} onChange={e=>setF({...f,description:e.target.value})} placeholder="مسئلے کی تفصیل..."/></div>
        <div style={{gridColumn:"1/-1"}}><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>مطلوبہ اقدام</label><textarea style={{...S.inpSm,minHeight:"50px",resize:"vertical"}} value={f.actionRequired} onChange={e=>setF({...f,actionRequired:e.target.value})} placeholder="کیا کرنا ضروری ہے..."/></div>
      </div>
      <button style={{...S.saveBtn,background:`linear-gradient(135deg,${C.red},#b91c1c)`}} onClick={add}>⚠️ رسک درج کریں</button>
    </div>}
    <div style={{display:"flex",gap:"8px",marginBottom:"16px"}}>{[["all","سب"],["open","کھلے"],["resolved","حل"]].map(([v,l])=><button key={v} onClick={()=>setFilterStatus(v)} style={{padding:"7px 14px",borderRadius:"10px",border:"none",cursor:"pointer",fontSize:"0.62rem",fontWeight:filterStatus===v?"700":"400",background:filterStatus===v?`linear-gradient(135deg,${C.red},#b91c1c)`:C.white,color:filterStatus===v?C.white:"#888",fontFamily:"inherit"}}>{l}</button>)}</div>
    <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
      {filtered.map(r=>{ const st=students.find(s=>s.id===r.studentId); const h=HOUSES.find(x=>x.id===st?.houseId); const sev=sevConfig[r.severity]||sevConfig.medium; const isOD=r.dueDate&&r.status==="open"&&new Date(r.dueDate)<new Date(); return <div key={r.id} className="hv-card" style={{...S.card,borderRight:`4px solid ${sev.c}`,padding:"16px 20px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"8px"}}>
          <div><div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"4px"}}><span style={{fontSize:"0.85rem",fontWeight:"700",color:C.navy}}>{st?.name||"—"}</span>{h&&<span style={hBadge(h.color,h.light)}>{h.emoji}</span>}<span style={{padding:"3px 8px",borderRadius:"20px",fontSize:"0.58rem",fontWeight:"700",background:sev.bg,color:sev.c}}>{sev.l}</span>{isOD&&<span style={{padding:"3px 8px",borderRadius:"20px",fontSize:"0.55rem",fontWeight:"700",background:"#fee2e2",color:C.red}}>⏰ تاخیر</span>}</div><div style={{fontSize:"0.62rem",color:"#888"}}>{riskTypes[r.riskType]}</div></div>
          <span style={{padding:"4px 10px",borderRadius:"20px",fontSize:"0.58rem",fontWeight:"700",background:r.status==="resolved"?"#dcfce7":"#fef3c7",color:r.status==="resolved"?C.green:C.amber}}>{r.status==="resolved"?"✅ حل":"⏳ کھلا"}</span>
        </div>
        <div style={{fontSize:"0.68rem",color:"#555",marginBottom:"8px",lineHeight:"1.6"}}>{r.description}</div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{display:"flex",gap:"8px"}}>{r.assignedTo&&<span style={{fontSize:"0.6rem",color:"#888"}}>👤 {r.assignedTo}</span>}{r.dueDate&&<span style={{fontSize:"0.6rem",color:isOD?C.red:"#888",fontFamily:"monospace",direction:"ltr"}}>{r.dueDate}</span>}</div>
          {r.status==="open"&&<button onClick={()=>resolveRisk(r.id)} style={{...S.saveBtn,padding:"5px 14px",fontSize:"0.6rem"}}>✅ حل کریں</button>}
        </div>
      </div>; })}
      {filtered.length===0&&<div className="hv-card" style={{...S.card,textAlign:"center",color:"#bbb",padding:"60px"}}>{filterStatus==="open"?"✅ کوئی کھلا رسک نہیں!":"کوئی ریکارڈ نہیں"}</div>}
    </div>
  </div>;
}

export default HPRISystem;
