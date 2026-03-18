/* eslint-disable */
import { useState, useEffect } from "react";
import { C, S, hBadge, pBar, HOUSES } from "../../constants";

function DirectorPortal({students,teachers,houses,fees,results,hvsLogs}){
  const totalFees=fees.reduce((s,f)=>s+(f.amount||0),0);
  const paidFees=fees.filter(f=>f.status==="paid").reduce((s,f)=>s+(f.amount||0),0);
  const sortedHouses=[...houses].sort((a,b)=>(b.points||0)-(a.points||0));
  const winner=sortedHouses[0]; const winnerInfo=HOUSES.find(x=>x.id===winner?.id);
  const avgResult=results.length>0?Math.round(results.reduce((s,r)=>s+(r.percentage||0),0)/results.length):0;

  const G="#d4af37"; const N="#0f172a"; const N2="#1e293b";
  const glass={background:"rgba(255,255,255,0.07)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:"16px"};
  const inp={width:"100%",padding:"10px 14px",borderRadius:"10px",border:"1px solid rgba(212,175,55,0.25)",background:"rgba(255,255,255,0.06)",color:"#f1f5f9",fontSize:"0.8rem",fontFamily:"'Public Sans',sans-serif",outline:"none",boxSizing:"border-box",direction:"rtl",colorScheme:"dark"};
  const lbl={fontSize:"0.7rem",color:"rgba(212,175,55,0.8)",marginBottom:"6px",display:"block",fontWeight:"600"};
  return <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#0f172a 0%,#0d1f3c 50%,#0a1628 100%)",padding:"24px 20px",fontFamily:"'Public Sans',sans-serif",direction:"rtl"}}>
    <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"24px"}}>
      <div style={{width:"44px",height:"44px",borderRadius:"12px",background:"linear-gradient(135deg,#d4af37,#b8960a)",display:"flex",alignItems:"center",justifyContent:"center"}}><span className="material-symbols-rounded" style={{fontSize:"24px",color:N}}>admin_panel_settings</span></div>
      <div><h2 style={{margin:0,fontSize:"1.4rem",fontWeight:"800",color:"#f1f5f9"}}>ڈائریکٹر پورٹل</h2><p style={{margin:0,fontSize:"0.72rem",color:"rgba(212,175,55,0.7)"}}>مکمل ادارہ — اعلیٰ نظریہ</p></div>
    </div>
    <div style={{background:"linear-gradient(135deg,#0d1f3c,#0a1628)",borderRadius:"22px",padding:"24px",marginBottom:"24px",border:"1px solid rgba(212,175,55,0.2)"}}>
      <div style={{fontSize:"0.65rem",color:"rgba(212,175,55,0.6)",marginBottom:"8px",letterSpacing:"0.15em"}}>EXECUTIVE SUMMARY</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:"16px"}}>
        {[{i:"🎓",n:students.length,l:"طلبا"},{i:"👨‍🏫",n:teachers.length,l:"اساتذہ"},{i:"📊",n:`${avgResult}%`,l:"اوسط نتیجہ"},{i:"💰",n:`${totalFees>0?Math.round((paidFees/totalFees)*100):0}%`,l:"فیس وصولی"},{i:"🏆",n:winnerInfo?.nameEn||"—",l:"سپر ہاؤس"},{i:"📈",n:hvsLogs.length,l:"HVS لاگز"}].map((x,i)=><div key={i} style={{textAlign:"center"}}><div style={{fontSize:"1.6rem"}}>{x.i}</div><div style={{fontSize:"1.4rem",fontWeight:"900",color:"#d4af37",marginTop:"4px"}}>{x.n}</div><div style={{fontSize:"0.58rem",color:"rgba(255,255,255,0.5)",marginTop:"2px"}}>{x.l}</div></div>)}
      </div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"20px",marginBottom:"20px"}}>
      <div style={{...glass,padding:"20px"}}>
        <div style={{fontSize:"0.85rem",fontWeight:"700",color:"#d4af37",marginBottom:"16px"}}>🏆 ہاؤس رینکنگ</div>
        {sortedHouses.map((h,i)=>{ const info=HOUSES.find(x=>x.id===h.id)||{}; return <div key={h.id} style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"12px"}}>
          <div style={{width:"28px",height:"28px",borderRadius:"50%",background:i===0?"linear-gradient(135deg,#d4af37,#b8960a)":"rgba(255,255,255,0.08)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.65rem",fontWeight:"900",color:i===0?"#0f172a":"rgba(255,255,255,0.4)",flexShrink:0}}>{i===0?"👑":`${i+1}`}</div>
          <span style={{fontSize:"1.2rem"}}>{info.emoji}</span>
          <div style={{flex:1}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:"4px"}}><span style={{fontSize:"0.7rem",fontWeight:"700",color:"#f1f5f9"}}>{info.nameEn}</span><span style={{fontSize:"0.7rem",fontWeight:"800",color:info.color||"#d4af37"}}>{h.points||0}</span></div>{pBar(h.points||0,Math.max(...houses.map(x=>x.points||0),1),info.color||"#d4af37")}</div>
        </div>; })}
      </div>
      <div style={{...glass,padding:"20px"}}>
        <div style={{fontSize:"0.85rem",fontWeight:"700",color:"#d4af37",marginBottom:"16px"}}>💰 مالی خلاصہ</div>
        <div style={{marginBottom:"16px"}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:"6px"}}><span style={{fontSize:"0.68rem",color:"rgba(255,255,255,0.5)"}}>کل فیس</span><span style={{fontSize:"0.72rem",fontWeight:"700",color:"#f1f5f9"}}>Rs. {totalFees.toLocaleString()}</span></div>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:"6px"}}><span style={{fontSize:"0.68rem",color:"rgba(255,255,255,0.5)"}}>وصول</span><span style={{fontSize:"0.72rem",fontWeight:"700",color:"#4ade80"}}>Rs. {paidFees.toLocaleString()}</span></div>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:"10px"}}><span style={{fontSize:"0.68rem",color:"rgba(255,255,255,0.5)"}}>باقی</span><span style={{fontSize:"0.72rem",fontWeight:"700",color:"#f87171"}}>Rs. {(totalFees-paidFees).toLocaleString()}</span></div>
          {pBar(paidFees,totalFees||1,"#4ade80")}
        </div>
        <div style={{background:"rgba(255,255,255,0.04)",borderRadius:"12px",padding:"12px",border:"1px solid rgba(255,255,255,0.06)"}}><div style={{fontSize:"0.65rem",color:"rgba(255,255,255,0.5)",marginBottom:"4px"}}>وصولی کا تناسب</div><div style={{fontSize:"2rem",fontWeight:"900",color:totalFees>0&&(paidFees/totalFees)>=0.8?"#4ade80":"#fb923c"}}>{totalFees>0?Math.round((paidFees/totalFees)*100):0}%</div></div>
      </div>
    </div>
    <div style={{...glass,padding:"20px"}}>
      <div style={{fontSize:"0.85rem",fontWeight:"700",color:"#d4af37",marginBottom:"16px"}}>📊 نتائج تجزیہ</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:"12px"}}>
        {[["A+",results.filter(r=>r.grade==="A+").length,"#4ade80"],["A",results.filter(r=>r.grade==="A").length,"#4ade80"],["B",results.filter(r=>r.grade==="B").length,"#60a5fa"],["C",results.filter(r=>r.grade==="C").length,"#fb923c"],["D",results.filter(r=>r.grade==="D").length,"#fb923c"],["F",results.filter(r=>r.grade==="F").length,"#f87171"]].map(([g,n,c])=><div key={g} style={{background:`${c}12`,borderRadius:"12px",padding:"12px",textAlign:"center",border:`1px solid ${c}25`}}><div style={{fontSize:"1.2rem",fontWeight:"900",color:c}}>{g}</div><div style={{fontSize:"1.4rem",fontWeight:"900",color:c}}>{n}</div><div style={{fontSize:"0.6rem",color:"rgba(255,255,255,0.5)"}}>طلبا</div></div>)}
      </div>
    </div>
  </div>;
}

export default DirectorPortal;
