/* eslint-disable */
import { useState, useEffect } from "react";
import { C, S, hBadge, sLabel } from "../../constants";
import { supabase } from "../../supabase";

function PrideMessages({students,teachers,addData}){
  const [messages,setMessages]=useState([]); const [show,setShow]=useState(false);
  const [f,setF]=useState({studentId:"",type:"pride",message:"",from:"",sendToParent:true,housePoints:0});
  useEffect(()=>{ const load=async()=>{ const {data}=await supabase.from("pride_messages").select("*").order("created_at",{ascending:false}).limit(50); setMessages(data||[]); }; load(); },[]);
  const add=async()=>{ if(!f.studentId||!f.message)return; await addData("pride_messages",{...f,housePoints:Number(f.housePoints)}); setShow(false); setF({studentId:"",type:"pride",message:"",from:"",sendToParent:true,housePoints:0}); };
  const types={pride:{c:C.gold,bg:C.goldLight,i:"🌟",l:"Pride"},achievement:{c:C.green,bg:"#dcfce7",i:"🏆",l:"Success"},improvement:{c:C.abuBakr,bg:"#dbeafe",i:"📈",l:"Improvement"},warning:{c:C.amber,bg:"#fef3c7",i:"⚠️",l:"Warning"},concern:{c:C.red,bg:"#fee2e2",i:"😟",l:"Concern"},islamic:{c:C.purple,bg:"#ede9fe",i:"🕌",l:"Islamic"}};
  const selStudent=students.find(s=>s.id===f.studentId);
  const getTemplate=(type)=>{ const n=selStudent?.name||"طالب علم"; return type==="pride"?`محترم والدین،\n\nآپ کے بیٹے/بیٹی ${n} نے شاندار کارکردگی دکھائی ہے۔ ادارہ آپ پر فخر کرتا ہے۔\n\nجزاک اللہ خیراً\nامین اسکول ہب`:`محترم والدین،\n\n${n} نے آج قابل تعریف کامیابی حاصل کی ہے۔\n\nجزاک اللہ خیراً`; };
  return <div style={S.page}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
      <div><div style={{fontSize:"1.1rem",fontWeight:"700",color:C.navy}}>💌 Pride Messages Portal</div><div style={{fontSize:"0.62rem",color:"#888",marginTop:"2px"}}>Message to parents — Pride, Achievement, Warning</div></div>
      <button style={S.addBtn} onClick={()=>setShow(!show)}>+ New Message</button>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:"12px",marginBottom:"20px"}}>
      {[{c:C.gold,i:"🌟",n:messages.filter(m=>m.type==="pride").length,l:"Pride"},{c:C.green,i:"🏆",n:messages.filter(m=>m.type==="achievement").length,l:"Success"},{c:C.amber,i:"⚠️",n:messages.filter(m=>m.type==="warning").length,l:"Warning"},{c:C.abuBakr,i:"💌",n:messages.length,l:"Total"}].map((x,i)=><div key={i} style={{background:`linear-gradient(135deg,${x.c}12,${x.c}05)`,borderRadius:"16px",padding:"16px",border:`2px solid ${x.c}20`,textAlign:"center"}}><div style={{fontSize:"1.3rem"}}>{x.i}</div><div style={{fontSize:"1.4rem",fontWeight:"900",color:x.c}}>{x.n}</div><div style={{fontSize:"0.6rem",color:"#888"}}>{x.l}</div></div>)}
    </div>
    {show&&<div className="hv-card" style={{...S.card,marginBottom:"20px",background:`linear-gradient(135deg,${C.goldLight},#fdf8ee)`,border:`2px solid ${C.gold}30`}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>Student *</label><select style={S.inpSm} value={f.studentId} onChange={e=>setF({...f,studentId:e.target.value})}><option value="">-- Select --</option>{students.map(s=><option key={s.id} value={s.id}>{sLabel(s)}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>Type</label><select style={S.inpSm} value={f.type} onChange={e=>setF({...f,type:e.target.value})}>{Object.entries(types).map(([k,v])=><option key={k} value={k}>{v.i} {v.l}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>From</label><select style={S.inpSm} value={f.from} onChange={e=>setF({...f,from:e.target.value})}><option value="">-- Select --</option>{teachers.map(t=><option key={t.id} value={t.name}>{t.name}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>House Points</label><input style={{...S.inpSm,direction:"ltr"}} type="number" value={f.housePoints} onChange={e=>setF({...f,housePoints:e.target.value})}/></div>
        <div style={{gridColumn:"1/-1",display:"flex",gap:"8px"}}><button onClick={()=>setF({...f,message:getTemplate("pride")})} style={{...hBadge(C.gold,C.goldLight),cursor:"pointer",border:"none",padding:"6px 12px",borderRadius:"8px",fontSize:"0.6rem"}}>🌟 Pride Template</button><button onClick={()=>setF({...f,message:getTemplate("achievement")})} style={{...hBadge(C.green,"#dcfce7"),cursor:"pointer",border:"none",padding:"6px 12px",borderRadius:"8px",fontSize:"0.6rem"}}>🏆 Achievement Template</button></div>
        <div style={{gridColumn:"1/-1"}}><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>Message *</label><textarea style={{...S.inpSm,minHeight:"120px",resize:"vertical",lineHeight:"1.8"}} value={f.message} onChange={e=>setF({...f,message:e.target.value})} placeholder="پیغام لکھیں..."/></div>
      </div>
      <button style={S.saveBtn} onClick={add}>💌 Send Message</button>
    </div>}
    <div style={{display:"flex",flexDirection:"column",gap:"14px"}}>
      {messages.map(m=>{ const tc=types[m.type]||types.pride; const st=students.find(s=>s.id===m.studentId); return <div key={m.id} className="hv-card" style={{...S.card,borderRight:`4px solid ${tc.c}`,background:`linear-gradient(135deg,${tc.bg},#fff)`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"10px"}}><div><div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"4px"}}><span style={{fontSize:"1.2rem"}}>{tc.i}</span><span style={{fontSize:"0.85rem",fontWeight:"700",color:C.navy}}>{st?.name||"—"}</span></div>{m.from&&<div style={{fontSize:"0.6rem",color:"#888"}}>From: {m.from}</div>}</div><span style={hBadge(tc.c,tc.bg)}>{tc.l}</span></div>
        <div style={{fontSize:"0.68rem",color:"#555",lineHeight:"1.8",whiteSpace:"pre-line"}}>{m.message}</div>
        {m.housePoints>0&&<div style={{marginTop:"8px"}}><span style={hBadge(C.gold,C.goldLight)}>+{m.housePoints} House Points</span></div>}
      </div>; })}
      {messages.length===0&&<div className="hv-card" style={{...S.card,textAlign:"center",color:"#bbb",padding:"60px"}}><div style={{fontSize:"3rem",marginBottom:"12px"}}>💌</div>Any Message No</div>}
    </div>
  </div>;
}

export default PrideMessages;
