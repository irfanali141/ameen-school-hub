/* eslint-disable */
import { useState, useEffect } from "react";
import { C, S, hBadge, pBar, HOUSES } from "../../constants";

function ClassAnalytics({students,results}){
  const [selGrade,setSelGrade]=useState("all");
  const grades=[...new Set(students.map(s=>s.grade).filter(Boolean))].sort();
  const filtered=selGrade==="all"?students:students.filter(s=>s.grade===selGrade);
  const getAvg=(s)=>{ const sR=results.filter(r=>r.studentId===s.id); return sR.length>0?Math.round(sR.reduce((a,r)=>a+(r.percentage||0),0)/sR.length):0; };
  const overallAvg=filtered.length>0?Math.round(filtered.map(getAvg).reduce((a,b)=>a+b,0)/filtered.length):0;
  const topStudents=[...filtered].map(s=>({...s,avg:getAvg(s)})).sort((a,b)=>b.avg-a.avg).slice(0,10);
  const houseData=HOUSES.map(h=>{ const hs=filtered.filter(s=>s.houseId===h.id); const avg=hs.length>0?Math.round(hs.map(getAvg).reduce((a,b)=>a+b,0)/hs.length):0; return {...h,count:hs.length,avg}; });
  const subjectData=results.reduce((acc,r)=>{ if(!r.subject)return acc; if(!acc[r.subject])acc[r.subject]={total:0,count:0}; acc[r.subject].total+=(r.percentage||0); acc[r.subject].count++; return acc; },{});

  const G="#d4af37"; const N="#0f172a"; const N2="#1e293b";
  const glass={background:"rgba(255,255,255,0.07)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:"16px"};
  const inp={width:"100%",padding:"10px 14px",borderRadius:"10px",border:"1px solid rgba(212,175,55,0.25)",background:"rgba(255,255,255,0.06)",color:"#f1f5f9",fontSize:"0.8rem",fontFamily:"'Public Sans',sans-serif",outline:"none",boxSizing:"border-box",direction:"rtl",colorScheme:"dark"};
  const lbl={fontSize:"0.7rem",color:"rgba(212,175,55,0.8)",marginBottom:"6px",display:"block",fontWeight:"600"};
  return <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#0f172a 0%,#0d1f3c 50%,#0a1628 100%)",padding:"24px 20px",fontFamily:"'Public Sans',sans-serif",direction:"rtl"}}>
    <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"24px"}}>
      <div style={{width:"44px",height:"44px",borderRadius:"12px",background:"linear-gradient(135deg,#d4af37,#b8960a)",display:"flex",alignItems:"center",justifyContent:"center"}}><span className="material-symbols-rounded" style={{fontSize:"24px",color:N}}>insights</span></div>
      <div><h2 style={{margin:0,fontSize:"1.4rem",fontWeight:"800",color:"#f1f5f9"}}>کلاس تجزیہ</h2></div>
    </div>
    <div style={{marginBottom:"4px",display:"none"}}>
    <div style={{display:"flex",gap:"8px",marginBottom:"20px",flexWrap:"wrap"}}>
      {[["all","📊 سب"],...grades.map(g=>[g,`جماعت ${g}`])].map(([g,l])=><button key={g} onClick={()=>setSelGrade(g)} style={{padding:"6px 14px",borderRadius:"20px",border:"none",cursor:"pointer",fontSize:"0.62rem",fontWeight:selGrade===g?"700":"400",background:selGrade===g?`linear-gradient(135deg,${C.gold},${C.goldDark})`:C.white,color:selGrade===g?C.white:"#888",fontFamily:"inherit"}}>{l}</button>)}
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:"12px",marginBottom:"20px"}}>
      {[{c:C.navy,i:"👥",n:filtered.length,l:"طلبا"},{c:overallAvg>=70?C.green:C.amber,i:"📈",n:`${overallAvg}%`,l:"اوسط"},{c:C.gold,i:"🏆",n:filtered.filter(s=>getAvg(s)>=80).length,l:"A گریڈ"},{c:C.red,i:"⚠️",n:filtered.filter(s=>{ const a=getAvg(s); return a<50&&results.some(r=>r.studentId===s.id); }).length,l:"کمزور"}].map((x,i)=><div key={i} style={{background:`linear-gradient(135deg,${x.c}12,${x.c}05)`,borderRadius:"16px",padding:"16px",border:`2px solid ${x.c}20`,textAlign:"center"}}><div style={{fontSize:"1.3rem"}}>{x.i}</div><div style={{fontSize:"1.4rem",fontWeight:"900",color:x.c}}>{x.n}</div><div style={{fontSize:"0.6rem",color:"#888"}}>{x.l}</div></div>)}
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"20px",marginBottom:"20px"}}>
      <div style={{...glass,padding:"20px"}}><div style={{fontSize:"0.85rem",fontWeight:"700",color:"#d4af37",marginBottom:"16px"}}>🏠 ہاؤس کارکردگی</div>
        {houseData.map(h=><div key={h.id} style={{marginBottom:"14px"}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:"4px"}}><span style={{fontSize:"0.72rem",fontWeight:"700",color:C.navy}}>{h.emoji} {h.nameEn}</span><span style={{fontSize:"0.68rem",fontWeight:"700",color:h.avg>=70?C.green:h.avg>=50?C.amber:C.red}}>{h.avg}%</span></div>{pBar(h.avg,100,h.avg>=70?C.green:h.avg>=50?C.amber:C.red)}<div style={{fontSize:"0.58rem",color:"#aaa",marginTop:"2px"}}>{h.count} طلبا</div></div>)}
      </div>
      <div style={S.card} className="hv-card"><div style={{fontSize:"0.85rem",fontWeight:"700",color:C.navy,marginBottom:"16px"}}>🏆 ٹاپ طلبا</div>
        {topStudents.map((s,i)=>{ const h=HOUSES.find(x=>x.id===s.houseId)||{}; return <div key={s.id} style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"10px",padding:"6px 10px",background:i===0?"linear-gradient(135deg,#fef3c7,#fff)":"#fafaf8",borderRadius:"10px"}}>
          <div style={{width:"22px",height:"22px",borderRadius:"50%",background:i<3?`linear-gradient(135deg,${C.gold},${C.goldDark})`:"#eee",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.55rem",fontWeight:"900",color:i<3?C.white:"#aaa",flexShrink:0}}>{i===0?"👑":i+1}</div>
          <span>{h.emoji||"👤"}</span><div style={{flex:1}}><div style={{fontSize:"0.68rem",fontWeight:"700",color:C.navy}}>{s.name}</div></div>
          <span style={{fontSize:"0.72rem",fontWeight:"800",color:s.avg>=70?C.green:s.avg>=50?C.amber:C.red}}>{s.avg}%</span>
        </div>; })}
        {topStudents.length===0&&<div style={{textAlign:"center",color:"#bbb",padding:"20px"}}>کوئی ڈیٹا نہیں</div>}
      </div>
    </div>
    <div style={S.card} className="hv-card"><div style={{fontSize:"0.85rem",fontWeight:"700",color:C.navy,marginBottom:"16px"}}>📚 مضمون وار تجزیہ</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:"12px"}}>
        {Object.entries(subjectData).map(([sub,data])=>{ const avg=Math.round(data.total/data.count); return <div key={sub} style={{background:"#fafaf8",borderRadius:"12px",padding:"12px"}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:"6px"}}><span style={{fontSize:"0.72rem",fontWeight:"700",color:C.navy}}>{sub}</span><span style={{fontSize:"0.65rem",fontWeight:"700",color:avg>=70?C.green:avg>=50?C.amber:C.red}}>{avg}%</span></div>{pBar(avg,100,avg>=70?C.green:avg>=50?C.amber:C.red)}<div style={{fontSize:"0.58rem",color:"#aaa",marginTop:"4px"}}>{data.count} ریکارڈ</div></div>; })}
        {Object.keys(subjectData).length===0&&<div style={{textAlign:"center",color:"#bbb",padding:"20px",gridColumn:"1/-1"}}>کوئی ڈیٹا نہیں</div>}
      </div>
    </div>
  </div></div>;
}

export default ClassAnalytics;
