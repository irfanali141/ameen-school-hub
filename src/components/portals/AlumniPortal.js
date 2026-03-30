/* eslint-disable */
import { useState, useEffect } from "react";
import { C, S, hBadge, HOUSES } from "../../constants";
import { supabase } from "../../supabase";

function AlumniPortal({addData}){
  const [alumni,setAlumni]=useState([]); const [show,setShow]=useState(false);
  const [f,setF]=useState({name:"",graduationYear:"",field:"",university:"",job:"",phone:"",achievement:"",houseId:"",notes:""});
  useEffect(()=>{ const load=async()=>{ const {data}=await supabase.from("alumni").select("*").order("created_at",{ascending:false}).limit(50); setAlumni(data||[]); }; load(); },[]);
  const add=async()=>{ if(!f.name)return; await addData("alumni",{...f}); setShow(false); setF({name:"",graduationYear:"",field:"",university:"",job:"",phone:"",achievement:"",houseId:"",notes:""}); };
  const fields={medicine:"🏥 Medicine",engineering:"⚙️ Engineering",islamic:"🕌 Islamic Sciences",teaching:"👨‍🏫 Teaching",business:"💼 Business",government:"🏛️ Government",other:"📋 Other"};
  const byYear=alumni.reduce((acc,a)=>{ const y=a.graduationYear||"Unknown"; if(!acc[y])acc[y]=[]; acc[y].push(a); return acc; },{});
  return <div style={S.page}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
      <div><div style={{fontSize:"1.1rem",fontWeight:"700",color:C.navy}}>🎓 Alumni Portal</div><div style={{fontSize:"0.62rem",color:"#888",marginTop:"2px"}}>Graduates — Achievements & Contact</div></div>
      <button style={S.addBtn} onClick={()=>setShow(!show)}>+ New Alumni</button>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:"12px",marginBottom:"20px"}}>
      {[{c:C.gold,i:"🎓",n:alumni.length,l:"Total Alumni"},{c:C.green,i:"🏥",n:alumni.filter(a=>a.field==="medicine").length,l:"Doctor"},{c:C.abuBakr,i:"⚙️",n:alumni.filter(a=>a.field==="engineering").length,l:"Engineer"},{c:C.purple,i:"🕌",n:alumni.filter(a=>a.field==="islamic").length,l:"Islamic Scholar"}].map((x,i)=><div key={i} style={{background:`linear-gradient(135deg,${x.c}12,${x.c}05)`,borderRadius:"16px",padding:"16px",border:`2px solid ${x.c}20`,textAlign:"center"}}><div style={{fontSize:"1.3rem"}}>{x.i}</div><div style={{fontSize:"1.4rem",fontWeight:"900",color:x.c}}>{x.n}</div><div style={{fontSize:"0.6rem",color:"#888"}}>{x.l}</div></div>)}
    </div>
    {show&&<div className="hv-card" style={{...S.card,marginBottom:"20px",background:`linear-gradient(135deg,${C.goldLight},#fdf8ee)`,border:`2px solid ${C.gold}30`}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>نام *</label><input style={S.inpSm} value={f.name} onChange={e=>setF({...f,name:e.target.value})} placeholder="Complete Name..."/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>فراغت کا سال</label><input style={{...S.inpSm,direction:"ltr"}} value={f.graduationYear} onChange={e=>setF({...f,graduationYear:e.target.value})} placeholder="2020"/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>Department</label><select style={S.inpSm} value={f.field} onChange={e=>setF({...f,field:e.target.value})}><option value="">-- Select --</option>{Object.entries(fields).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>House</label><select style={S.inpSm} value={f.houseId} onChange={e=>setF({...f,houseId:e.target.value})}><option value="">-- Select --</option>{HOUSES.map(h=><option key={h.id} value={h.id}>{h.emoji} {h.nameEn}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>یونیورسٹی</label><input style={S.inpSm} value={f.university} onChange={e=>setF({...f,university:e.target.value})} placeholder="University name..."/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>عہدہ</label><input style={S.inpSm} value={f.job} onChange={e=>setF({...f,job:e.target.value})} placeholder="Doctor, Teacher..."/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>Phone</label><input style={{...S.inpSm,direction:"ltr"}} value={f.phone} onChange={e=>setF({...f,phone:e.target.value})} placeholder="03xx-xxxxxxx"/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>کامیابی</label><input style={S.inpSm} value={f.achievement} onChange={e=>setF({...f,achievement:e.target.value})} placeholder="Key achievement..."/></div>
      </div>
      <button style={S.saveBtn} onClick={add}>✅ Save</button>
    </div>}
    <div style={{display:"flex",flexDirection:"column",gap:"20px"}}>
      {Object.entries(byYear).sort((a,b)=>b[0].localeCompare(a[0])).map(([year,list])=><div key={year}>
        <div style={{fontSize:"0.75rem",fontWeight:"800",color:C.gold,marginBottom:"12px",borderBottom:`2px solid ${C.goldLight}`,paddingBottom:"6px"}}>🎓 {year} — {list.length} Graduated</div>
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
      {alumni.length===0&&<div className="hv-card" style={{...S.card,textAlign:"center",color:"#bbb",padding:"60px"}}><div style={{fontSize:"3rem",marginBottom:"12px"}}>🎓</div>No alumni records yet</div>}
    </div>
  </div>;
}

export default AlumniPortal;
