/* eslint-disable */
import { useState, useEffect } from "react";
import { C, S, hBadge, pBar } from "../../constants";
import { db, collection, onSnapshot, query, orderBy, limit } from "../../firebase";

function MadrasaHub({students,addData}){
  const [classes,setClasses]=useState([]); const [progress,setProgress]=useState([]); const [show,setShow]=useState(false); const [tab,setTab]=useState("classes");
  const [f,setF]=useState({subject:"",level:"Ibtidai",teacher:"",schedule:"",kitab:"",totalDars:100});
  const [progF,setProgF]=useState({studentId:"",subjectId:"",darsCompleted:0,grade:"",notes:""});
  const LEVELS=["Ibtidai","Mutawassit","Thanawi","Aali"]; const LEVEL_UR={Ibtidai:"ابتدائی",Mutawassit:"متوسط",Thanawi:"ثانوی",Aali:"عالی"};
  useEffect(()=>{
    const u1=onSnapshot(collection(db,"madrasa_subjects"),s=>setClasses(s.docs.map(d=>({id:d.id,...d.data()}))));
    const u2=onSnapshot(query(collection(db,"madrasa_progress"),orderBy("createdAt","desc"),limit(50)),s=>setProgress(s.docs.map(d=>({id:d.id,...d.data()}))));
    return()=>{u1();u2();};
  },[]);
  const add=async()=>{ if(!f.subject)return; await addData("madrasa_subjects",{...f,totalDars:Number(f.totalDars)}); setShow(false); setF({subject:"",level:"Ibtidai",teacher:"",schedule:"",kitab:"",totalDars:100}); };
  const addProg=async()=>{ if(!progF.studentId||!progF.subjectId)return; await addData("madrasa_progress",{...progF,darsCompleted:Number(progF.darsCompleted)}); setProgF({studentId:"",subjectId:"",darsCompleted:0,grade:"",notes:""}); };
  const islamicSubjects=["تفسیر","حدیث","فقہ","عقیدہ","نحو","صرف","بلاغت","منطق","فلسفہ","تاریخ اسلام","سیرت","تجوید"];

  const G="#d4af37"; const N="#0f172a"; const N2="#1e293b";
  const glass={background:"rgba(255,255,255,0.07)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:"16px"};
  const inp={width:"100%",padding:"10px 14px",borderRadius:"10px",border:"1px solid rgba(212,175,55,0.25)",background:"rgba(255,255,255,0.06)",color:"#f1f5f9",fontSize:"0.8rem",fontFamily:"'Public Sans',sans-serif",outline:"none",boxSizing:"border-box",direction:"rtl",colorScheme:"dark"};
  const lbl={fontSize:"0.7rem",color:"rgba(212,175,55,0.8)",marginBottom:"6px",display:"block",fontWeight:"600"};
  return <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#0f172a 0%,#0d1f3c 50%,#0a1628 100%)",padding:"24px 20px",fontFamily:"'Public Sans',sans-serif",direction:"rtl"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"24px",flexWrap:"wrap",gap:"12px"}}>
      <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
        <div style={{width:"44px",height:"44px",borderRadius:"12px",background:"linear-gradient(135deg,#d4af37,#b8960a)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 20px rgba(212,175,55,0.4)"}}><span className="material-symbols-rounded" style={{fontSize:"24px",color:N}}>mosque</span></div>
        <div><h2 style={{margin:0,fontSize:"1.4rem",fontWeight:"800",color:"#f1f5f9"}}>درس نظامی ہب</h2><p style={{margin:0,fontSize:"0.72rem",color:"rgba(212,175,55,0.7)"}}>اسلامی علوم — نصاب و پیشرفت</p></div>
      </div>
      <button style={{display:"flex",alignItems:"center",gap:"8px",padding:"10px 20px",borderRadius:"12px",border:"1px solid #d4af37",background:show?"rgba(212,175,55,0.15)":"transparent",color:"#d4af37",fontWeight:"700",fontSize:"0.82rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif"}} onClick={()=>setShow(!show)}><span className="material-symbols-rounded" style={{fontSize:"18px"}}>{show?"close":"add_circle"}</span>{show?"منسوخ":"نیا مضمون"}</button>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:"12px",marginBottom:"20px"}}>
      {LEVELS.map(l=>{ const cnt=classes.filter(c=>c.level===l).length; return <div key={l} style={{background:"rgba(212,175,55,0.08)",borderRadius:"16px",padding:"16px",border:"1px solid rgba(212,175,55,0.2)",textAlign:"center"}}><div style={{fontSize:"0.75rem",fontWeight:"800",color:"#d4af37"}}>{LEVEL_UR[l]}</div><div style={{fontSize:"1.8rem",fontWeight:"900",color:"#d4af37",marginTop:"4px"}}>{cnt}</div><div style={{fontSize:"0.58rem",color:"rgba(255,255,255,0.5)"}}>مضامین</div></div>; })}
    </div>
    {show&&<div style={{...glass,padding:"24px",marginBottom:"20px",borderColor:"rgba(212,175,55,0.3)"}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div><label style={lbl}>مضمون *</label><select style={inp} value={f.subject} onChange={e=>setF({...f,subject:e.target.value})}><option value="" style={{background:N2}}>-- منتخب کریں --</option>{islamicSubjects.map(s=><option key={s} style={{background:N2}}>{s}</option>)}</select></div>
        <div><label style={lbl}>درجہ</label><select style={inp} value={f.level} onChange={e=>setF({...f,level:e.target.value})}>{LEVELS.map(l=><option key={l} value={l} style={{background:N2}}>{LEVEL_UR[l]}</option>)}</select></div>
        <div><label style={lbl}>استاد</label><input style={inp} value={f.teacher} onChange={e=>setF({...f,teacher:e.target.value})} placeholder="استاد کا نام..."/></div>
        <div><label style={lbl}>کتاب</label><input style={inp} value={f.kitab} onChange={e=>setF({...f,kitab:e.target.value})} placeholder="ہدایہ، نورالانوار..."/></div>
        <div><label style={lbl}>کل دروس</label><input style={{...inp,direction:"ltr",colorScheme:"dark"}} type="number" value={f.totalDars} onChange={e=>setF({...f,totalDars:e.target.value})}/></div>
        <div><label style={lbl}>شیڈول</label><input style={inp} value={f.schedule} onChange={e=>setF({...f,schedule:e.target.value})} placeholder="صبح 8-9..."/></div>
      </div>
      <button style={{background:"linear-gradient(135deg,#d4af37,#b8960a)",color:N,border:"none",borderRadius:"12px",padding:"11px 26px",fontSize:"0.82rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif",fontWeight:"700"}} onClick={add}>محفوظ کریں</button>
    </div>}
    <div style={{display:"flex",gap:"8px",marginBottom:"16px"}}>{[["classes","📚 مضامین"],["progress","📊 پیشرفت"],["add_prog","➕ پیشرفت درج"]].map(([t,l])=><button key={t} onClick={()=>setTab(t)} style={{padding:"8px 14px",borderRadius:"10px",border:tab===t?"none":"1px solid rgba(255,255,255,0.1)",cursor:"pointer",fontSize:"0.65rem",fontWeight:tab===t?"700":"400",background:tab===t?"linear-gradient(135deg,#d4af37,#b8960a)":"rgba(255,255,255,0.04)",color:tab===t?"#0f172a":"rgba(255,255,255,0.6)",fontFamily:"inherit"}}>{l}</button>)}</div>
    {tab==="classes"&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:"14px"}}>
      {classes.map(c=><div key={c.id} style={{...glass,padding:"18px",borderRight:"3px solid #d4af37"}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:"8px"}}><div style={{fontSize:"0.85rem",fontWeight:"700",color:"#f1f5f9"}}>🕌 {c.subject}</div><span style={{padding:"3px 8px",borderRadius:"20px",fontSize:"0.6rem",fontWeight:"700",background:"rgba(212,175,55,0.15)",color:"#d4af37"}}>{LEVEL_UR[c.level]||c.level}</span></div>
        {c.kitab&&<div style={{fontSize:"0.65rem",color:"rgba(255,255,255,0.5)",marginBottom:"4px"}}>📖 {c.kitab}</div>}
        {c.teacher&&<div style={{fontSize:"0.65rem",color:"rgba(255,255,255,0.5)",marginBottom:"4px"}}>👤 {c.teacher}</div>}
        {c.schedule&&<div style={{fontSize:"0.65rem",color:"#d4af37"}}>⏰ {c.schedule}</div>}
        <div style={{marginTop:"8px"}}>{pBar(0,c.totalDars||100,"#d4af37")}<div style={{fontSize:"0.58rem",color:"rgba(255,255,255,0.35)",marginTop:"2px"}}>کل {c.totalDars} دروس</div></div>
      </div>)}
      {classes.length===0&&<div style={{...glass,textAlign:"center",color:"rgba(255,255,255,0.3)",padding:"40px",gridColumn:"1/-1"}}>کوئی مضمون نہیں</div>}
    </div>}
    {tab==="add_prog"&&<div style={{...glass,padding:"24px"}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div><label style={lbl}>طالب علم</label><select style={inp} value={progF.studentId} onChange={e=>setProgF({...progF,studentId:e.target.value})}><option value="" style={{background:N2}}>-- منتخب کریں --</option>{students.map(s=><option key={s.id} value={s.id} style={{background:N2}}>{s.name}</option>)}</select></div>
        <div><label style={lbl}>مضمون</label><select style={inp} value={progF.subjectId} onChange={e=>setProgF({...progF,subjectId:e.target.value})}><option value="" style={{background:N2}}>-- منتخب کریں --</option>{classes.map(c=><option key={c.id} value={c.id} style={{background:N2}}>{c.subject}</option>)}</select></div>
        <div><label style={lbl}>مکمل دروس</label><input style={{...inp,direction:"ltr",colorScheme:"dark"}} type="number" value={progF.darsCompleted} onChange={e=>setProgF({...progF,darsCompleted:e.target.value})}/></div>
        <div><label style={lbl}>گریڈ</label><select style={inp} value={progF.grade} onChange={e=>setProgF({...progF,grade:e.target.value})}><option value="" style={{background:N2}}>-- منتخب کریں --</option>{["ممتاز","جید جداً","جید","مقبول","ناکام"].map(g=><option key={g} style={{background:N2}}>{g}</option>)}</select></div>
      </div>
      <button style={{background:"linear-gradient(135deg,#d4af37,#b8960a)",color:N,border:"none",borderRadius:"12px",padding:"11px 26px",fontSize:"0.82rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif",fontWeight:"700"}} onClick={addProg}>پیشرفت درج کریں</button>
    </div>}
    {tab==="progress"&&<div style={{...glass,overflow:"hidden"}}><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}>
      <thead><tr style={{background:"rgba(255,255,255,0.04)"}}>{["طالب علم","مضمون","دروس","گریڈ"].map(h=><th key={h} style={{padding:"12px 14px",textAlign:"right",fontSize:"0.65rem",color:"rgba(212,175,55,0.8)",fontWeight:"700"}}>{h}</th>)}</tr></thead>
      <tbody>{progress.map((p,ri)=>{ const st=students.find(s=>s.id===p.studentId); const subj=classes.find(c=>c.id===p.subjectId); const pct=subj?Math.round((p.darsCompleted/subj.totalDars)*100):0; return <tr key={p.id} style={{background:ri%2===0?"rgba(255,255,255,0.02)":"transparent"}}>
        <td style={{padding:"11px 14px",color:"#f1f5f9",fontWeight:"700",fontSize:"0.75rem",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>{st?.name||"—"}</td>
        <td style={{padding:"11px 14px",color:"rgba(255,255,255,0.7)",fontSize:"0.75rem",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>{subj?.subject||"—"}</td>
        <td style={{padding:"11px 14px",borderBottom:"1px solid rgba(255,255,255,0.05)"}}><div style={{display:"flex",alignItems:"center",gap:"6px"}}><div style={{flex:1,minWidth:"60px"}}>{pBar(p.darsCompleted,subj?.totalDars||100,"#d4af37")}</div><span style={{fontSize:"0.6rem",color:"#d4af37",fontWeight:"700"}}>{pct}%</span></div></td>
        <td style={{padding:"11px 14px",borderBottom:"1px solid rgba(255,255,255,0.05)"}}><span style={{padding:"3px 8px",borderRadius:"20px",fontSize:"0.6rem",fontWeight:"700",background:"rgba(212,175,55,0.15)",color:"#d4af37"}}>{p.grade||"—"}</span></td>
      </tr>; })}{progress.length===0&&<tr><td colSpan={4} style={{padding:"40px",textAlign:"center",color:"rgba(255,255,255,0.3)"}}>کوئی ریکارڈ نہیں</td></tr>}</tbody>
    </table></div></div>}
  </div>;
}

export default MadrasaHub;
