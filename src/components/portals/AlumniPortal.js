/* eslint-disable */
import { useState, useEffect } from "react";
import { C, S, hBadge, HOUSES } from "../../constants";
import { db, collection, onSnapshot, query, orderBy, limit } from "../../firebase";

function AlumniPortal({addData}){
  const [alumni,setAlumni]=useState([]); const [show,setShow]=useState(false);
  const [f,setF]=useState({name:"",graduationYear:"",field:"",university:"",job:"",phone:"",achievement:"",houseId:"",notes:""});
  useEffect(()=>{ return onSnapshot(query(collection(db,"alumni"),orderBy("createdAt","desc"),limit(50)),s=>setAlumni(s.docs.map(d=>({id:d.id,...d.data()}))));  },[]);
  const add=async()=>{ if(!f.name)return; await addData("alumni",{...f}); setShow(false); setF({name:"",graduationYear:"",field:"",university:"",job:"",phone:"",achievement:"",houseId:"",notes:""}); };
  const fields={medicine:"🏥 طب",engineering:"⚙️ انجینئرنگ",islamic:"🕌 اسلامی علوم",teaching:"👨‍🏫 تدریس",business:"💼 تجارت",government:"🏛️ سرکاری",other:"📋 دیگر"};
  const byYear=alumni.reduce((acc,a)=>{ const y=a.graduationYear||"نامعلوم"; if(!acc[y])acc[y]=[]; acc[y].push(a); return acc; },{});
  return <div style={S.page}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
      <div><div style={{fontSize:"1.1rem",fontWeight:"700",color:C.navy}}>🎓 سابق طلبا پورٹل</div><div style={{fontSize:"0.62rem",color:"#888",marginTop:"2px"}}>فارغ التحصیل — کامیابیاں و رابطہ</div></div>
      <button style={S.addBtn} onClick={()=>setShow(!show)}>+ نیا سابق طالب علم</button>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:"12px",marginBottom:"20px"}}>
      {[{c:C.gold,i:"🎓",n:alumni.length,l:"کل سابق طلبا"},{c:C.green,i:"🏥",n:alumni.filter(a=>a.field==="medicine").length,l:"ڈاکٹر"},{c:C.abuBakr,i:"⚙️",n:alumni.filter(a=>a.field==="engineering").length,l:"انجینئر"},{c:C.purple,i:"🕌",n:alumni.filter(a=>a.field==="islamic").length,l:"عالم دین"}].map((x,i)=><div key={i} style={{background:`linear-gradient(135deg,${x.c}12,${x.c}05)`,borderRadius:"16px",padding:"16px",border:`2px solid ${x.c}20`,textAlign:"center"}}><div style={{fontSize:"1.3rem"}}>{x.i}</div><div style={{fontSize:"1.4rem",fontWeight:"900",color:x.c}}>{x.n}</div><div style={{fontSize:"0.6rem",color:"#888"}}>{x.l}</div></div>)}
    </div>
    {show&&<div className="hv-card" style={{...S.card,marginBottom:"20px",background:`linear-gradient(135deg,${C.goldLight},#fdf8ee)`,border:`2px solid ${C.gold}30`}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>نام *</label><input style={S.inpSm} value={f.name} onChange={e=>setF({...f,name:e.target.value})} placeholder="مکمل نام..."/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>فراغت سال</label><input style={{...S.inpSm,direction:"ltr"}} value={f.graduationYear} onChange={e=>setF({...f,graduationYear:e.target.value})} placeholder="2020"/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>شعبہ</label><select style={S.inpSm} value={f.field} onChange={e=>setF({...f,field:e.target.value})}><option value="">-- منتخب کریں --</option>{Object.entries(fields).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>ہاؤس</label><select style={S.inpSm} value={f.houseId} onChange={e=>setF({...f,houseId:e.target.value})}><option value="">-- منتخب کریں --</option>{HOUSES.map(h=><option key={h.id} value={h.id}>{h.emoji} {h.nameEn}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>یونیورسٹی</label><input style={S.inpSm} value={f.university} onChange={e=>setF({...f,university:e.target.value})} placeholder="یونیورسٹی کا نام..."/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>موجودہ عہدہ</label><input style={S.inpSm} value={f.job} onChange={e=>setF({...f,job:e.target.value})} placeholder="ڈاکٹر، استاد..."/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>فون</label><input style={{...S.inpSm,direction:"ltr"}} value={f.phone} onChange={e=>setF({...f,phone:e.target.value})} placeholder="03xx-xxxxxxx"/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>نمایاں کامیابی</label><input style={S.inpSm} value={f.achievement} onChange={e=>setF({...f,achievement:e.target.value})} placeholder="اہم کامیابی..."/></div>
      </div>
      <button style={S.saveBtn} onClick={add}>✅ محفوظ کریں</button>
    </div>}
    <div style={{display:"flex",flexDirection:"column",gap:"20px"}}>
      {Object.entries(byYear).sort((a,b)=>b[0].localeCompare(a[0])).map(([year,list])=><div key={year}>
        <div style={{fontSize:"0.75rem",fontWeight:"800",color:C.gold,marginBottom:"12px",borderBottom:`2px solid ${C.goldLight}`,paddingBottom:"6px"}}>🎓 {year} — {list.length} فارغ التحصیل</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:"12px"}}>
          {list.map(a=>{ const h=HOUSES.find(x=>x.id===a.houseId)||{}; const fi=fields[a.field]||fields.other; return <div key={a.id} className="hv-card" style={{...S.card,borderRight:`4px solid ${h.color||C.gold}`}}>
            <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"10px"}}>
              <div style={{width:"44px",height:"44px",borderRadius:"50%",background:h.gradient||`linear-gradient(135deg,${C.gold},${C.goldDark})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.2rem",flexShrink:0}}>{h.emoji||"🎓"}</div>
              <div><div style={{fontSize:"0.82rem",fontWeight:"700",color:C.navy}}>{a.name}</div><div style={{fontSize:"0.6rem",color:"#888"}}>{fi}</div></div>
            </div>
            {a.university&&<div style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px"}}>🏫 {a.university}</div>}
            {a.job&&<div style={{fontSize:"0.62rem",color:C.abuBakr,marginBottom:"4px",fontWeight:"600"}}>💼 {a.job}</div>}
            {a.achievement&&<div style={{background:C.goldLight,borderRadius:"8px",padding:"6px 10px",fontSize:"0.6rem",color:C.goldDark}}>⭐ {a.achievement}</div>}
          </div>; })}
        </div>
      </div>)}
      {alumni.length===0&&<div className="hv-card" style={{...S.card,textAlign:"center",color:"#bbb",padding:"60px"}}><div style={{fontSize:"3rem",marginBottom:"12px"}}>🎓</div>ابھی کوئی سابق طالب علم نہیں</div>}
    </div>
  </div>;
}

export default AlumniPortal;
