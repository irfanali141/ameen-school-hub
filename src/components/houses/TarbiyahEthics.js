/* eslint-disable */
import { useState, useEffect } from "react";
import { C, S, hBadge, HOUSES } from "../../constants";
import { db, collection, onSnapshot, query, orderBy, limit } from "../../firebase";

function TarbiyahEthics({students,addData}){
  const [logs,setLogs]=useState([]); const [show,setShow]=useState(false);
  const [f,setF]=useState({studentId:"",date:new Date().toISOString().split("T")[0],category:"adab",description:"",points:5,type:"positive"});
  useEffect(()=>{ return onSnapshot(query(collection(db,"ethics_logs"),orderBy("createdAt","desc"),limit(100)),s=>setLogs(s.docs.map(d=>({id:d.id,...d.data()}))));  },[]);
  const add=async()=>{ if(!f.studentId)return; await addData("ethics_logs",{...f,points:Number(f.points)}); setShow(false); setF({studentId:"",date:new Date().toISOString().split("T")[0],category:"adab",description:"",points:5,type:"positive"}); };
  const cats={adab:{c:C.gold,bg:C.goldLight,i:"🌟",l:"ادب"},prayer:{c:C.purple,bg:"#ede9fe",i:"🕌",l:"نماز"},quran:{c:C.green,bg:"#dcfce7",i:"📖",l:"قرآن"},honesty:{c:C.abuBakr,bg:"#dbeafe",i:"✨",l:"صداقت"},discipline:{c:C.navy,bg:"#e0e7ff",i:"⚡",l:"نظم"},helping:{c:C.teal,bg:"#ccfbf1",i:"🤝",l:"تعاون"},misconduct:{c:C.red,bg:"#fee2e2",i:"⚠️",l:"خلاف ورزی"}};
  const studentPoints=students.map(s=>{ const sL=logs.filter(l=>l.studentId===s.id); const pos=sL.filter(l=>l.type==="positive").reduce((sum,l)=>sum+(l.points||0),0); const neg=sL.filter(l=>l.type==="negative").reduce((sum,l)=>sum+(l.points||0),0); return {...s,points:pos-neg,logs:sL.length}; }).sort((a,b)=>b.points-a.points);
  return <div style={S.page}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
      <div><div style={{fontSize:"1.1rem",fontWeight:"700",color:C.navy}}>🌟 تربیت اخلاق مانیٹر</div><div style={{fontSize:"0.62rem",color:"#888",marginTop:"2px"}}>کردار، ادب، اخلاق کا ریکارڈ</div></div>
      <button style={S.addBtn} onClick={()=>setShow(!show)}>+ نئی انٹری</button>
    </div>
    {show&&<div className="hv-card" style={{...S.card,marginBottom:"20px",background:`linear-gradient(135deg,${C.goldLight},#fdf8ee)`,border:`2px solid ${C.gold}30`}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>طالب علم *</label><select style={S.inpSm} value={f.studentId} onChange={e=>setF({...f,studentId:e.target.value})}><option value="">-- منتخب کریں --</option>{students.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>قسم</label><select style={S.inpSm} value={f.type} onChange={e=>setF({...f,type:e.target.value})}><option value="positive">✅ مثبت</option><option value="negative">❌ منفی</option></select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>زمرہ</label><select style={S.inpSm} value={f.category} onChange={e=>setF({...f,category:e.target.value})}>{Object.entries(cats).map(([k,v])=><option key={k} value={k}>{v.i} {v.l}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>پوائنٹس</label><input style={{...S.inpSm,direction:"ltr"}} type="number" min="1" max="50" value={f.points} onChange={e=>setF({...f,points:e.target.value})}/></div>
        <div style={{gridColumn:"1/-1"}}><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>تفصیل</label><textarea style={{...S.inpSm,minHeight:"60px",resize:"vertical"}} value={f.description} onChange={e=>setF({...f,description:e.target.value})} placeholder="واقعے کی تفصیل..."/></div>
      </div>
      <button style={{...S.saveBtn,background:f.type==="positive"?`linear-gradient(135deg,${C.green},#15803d)`:`linear-gradient(135deg,${C.red},#991b1b)`}} onClick={add}>{f.type==="positive"?"✅ مثبت درج":"❌ منفی درج"}</button>
    </div>}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"20px"}}>
      <div style={S.card} className="hv-card">
        <div style={{fontSize:"0.85rem",fontWeight:"700",color:C.navy,marginBottom:"16px"}}>🏆 اخلاق لیڈر بورڈ</div>
        {studentPoints.slice(0,10).map((s,i)=>{ const h=HOUSES.find(x=>x.id===s.houseId)||{}; return <div key={s.id} style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"10px",padding:"8px 10px",background:i===0?"linear-gradient(135deg,#fef3c7,#fff)":"#fafaf8",borderRadius:"10px"}}>
          <div style={{width:"26px",height:"26px",borderRadius:"50%",background:i===0?`linear-gradient(135deg,${C.gold},${C.goldDark})`:"#eee",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.6rem",fontWeight:"900",color:i===0?C.white:"#aaa",flexShrink:0}}>{i===0?"👑":i+1}</div>
          <span style={{fontSize:"1rem"}}>{h.emoji||"👤"}</span>
          <div style={{flex:1}}><div style={{fontSize:"0.7rem",fontWeight:"700",color:C.navy}}>{s.name}</div><div style={{fontSize:"0.55rem",color:"#888"}}>{s.logs} انٹری</div></div>
          <span style={{fontSize:"0.82rem",fontWeight:"900",color:s.points>=0?C.green:C.red}}>{s.points>0?"+":""}{s.points}</span>
        </div>; })}
        {studentPoints.length===0&&<div style={{textAlign:"center",color:"#bbb",padding:"20px"}}>کوئی ڈیٹا نہیں</div>}
      </div>
      <div style={S.card} className="hv-card">
        <div style={{fontSize:"0.85rem",fontWeight:"700",color:C.navy,marginBottom:"16px"}}>📋 حالیہ انٹریاں</div>
        {logs.slice(0,8).map(l=>{ const tc=cats[l.category]||cats.adab; const st=students.find(s=>s.id===l.studentId); return <div key={l.id} style={{display:"flex",gap:"10px",marginBottom:"10px",padding:"8px 10px",background:l.type==="positive"?"#f0fdf4":"#fff5f5",borderRadius:"10px"}}>
          <span style={{fontSize:"1.1rem"}}>{tc.i}</span>
          <div style={{flex:1}}><div style={{fontSize:"0.68rem",fontWeight:"700",color:C.navy}}>{st?.name||"—"}</div><div style={{fontSize:"0.58rem",color:"#888"}}>{l.description?.slice(0,50)}</div></div>
          <span style={{fontSize:"0.7rem",fontWeight:"800",color:l.type==="positive"?C.green:C.red}}>{l.type==="positive"?"+":"-"}{l.points}</span>
        </div>; })}
        {logs.length===0&&<div style={{textAlign:"center",color:"#bbb",padding:"20px"}}>کوئی انٹری نہیں</div>}
      </div>
    </div>
  </div>;
}

export default TarbiyahEthics;
