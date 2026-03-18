/* eslint-disable */
import { useState, useEffect } from "react";
import { C, S, hBadge, pBar, HOUSES, HVS_TOTAL } from "../../constants";
import { PrintBtn, printHVSReport } from "../../utils/print";

function SuperHouseDashboard({houses,hvsLogs,students}){
  const sorted=[...houses].sort((a,b)=>(b.points||0)-(a.points||0));
  const winner=sorted[0]; const winnerInfo=HOUSES.find(x=>x.id===winner?.id);
  const [selHouse,setSelHouse]=useState(null);
  const houseStats=HOUSES.map(h=>{ const hd=houses.find(x=>x.id===h.id)||{}; const studs=students.filter(s=>s.houseId===h.id); const hLogs=hvsLogs.filter(l=>l.houseId===h.id); const avgHvs=hLogs.length>0?Math.round(hLogs.reduce((s,l)=>s+(l.total||0),0)/hLogs.length):0; const bestWeek=hLogs.length>0?Math.max(...hLogs.map(l=>l.total||0)):0; const rank=sorted.findIndex(x=>x.id===h.id)+1; return {...h,...hd,studs,hLogs,avgHvs,bestWeek,rank}; });
  const selectedStats=selHouse?houseStats.find(x=>x.id===selHouse):null;
  const selectedInfo=HOUSES.find(x=>x.id===selHouse);
  return <div style={S.page}>
    <div style={{fontSize:"1.1rem",fontWeight:"700",color:C.navy,marginBottom:"6px"}}>🏆 سپر ہاؤس ڈیش بورڈ</div>
    <div style={{fontSize:"0.62rem",color:"#888",marginBottom:"20px"}}>تفصیلی ہاؤس تجزیہ و کارکردگی</div>
    {winner&&winnerInfo&&<div style={{background:winnerInfo.gradient,borderRadius:"22px",padding:"28px",marginBottom:"24px",color:C.white,textAlign:"center",position:"relative",overflow:"hidden"}}>
      <div style={{fontSize:"3rem",marginBottom:"8px"}}>👑</div>
      <div style={{fontSize:"0.7rem",opacity:0.8,letterSpacing:"0.2em",marginBottom:"6px"}}>سپر ہاؤس — موجودہ لیڈر</div>
      <div style={{fontSize:"2rem",fontWeight:"900"}}>{winnerInfo.emoji} {winnerInfo.nameEn} House</div>
      <div style={{fontSize:"0.75rem",opacity:0.85,margin:"8px 0",fontStyle:"italic"}}>{winnerInfo.slogan}</div>
      <div style={{fontSize:"3rem",fontWeight:"900"}}>{winner.points||0}</div>
    </div>}
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:"16px",marginBottom:"24px"}}>
      {houseStats.map((h,i)=>{ const info=HOUSES.find(x=>x.id===h.id)||{}; const isSel=selHouse===h.id; return <div key={h.id} onClick={()=>setSelHouse(isSel?null:h.id)} className="hv-card" style={{...S.card,cursor:"pointer",borderTop:`4px solid ${info.color||C.gold}`,border:isSel?`2px solid ${info.color}`:undefined,transform:isSel?"scale(1.02)":"scale(1)",transition:"all 0.2s"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"10px"}}>
          <div><div style={{fontSize:"1.5rem"}}>{info.emoji}</div><div style={{fontSize:"0.85rem",fontWeight:"800",color:info.color||C.navy,marginTop:"4px"}}>{info.nameEn}</div></div>
          <div style={{background:h.rank===1?`linear-gradient(135deg,${C.gold},${C.goldDark})`:"#eee",color:h.rank===1?C.white:"#aaa",width:"32px",height:"32px",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.7rem",fontWeight:"900"}}>{h.rank===1?"👑":`#${h.rank}`}</div>
        </div>
        <div style={{fontSize:"2rem",fontWeight:"900",color:info.color||C.navy}}>{h.points||0}</div>
        {pBar(h.points||0,Math.max(...houses.map(x=>x.points||0),1),info.color||C.gold)}
        <div style={{display:"flex",justifyContent:"space-between",marginTop:"8px"}}>
          <span style={{fontSize:"0.6rem",color:"#888"}}>👥 {h.studs?.length||0}</span>
          <span style={{fontSize:"0.6rem",color:"#888"}}>📊 avg {h.avgHvs}</span>
        </div>
      </div>; })}
    </div>
    {selectedStats&&selectedInfo&&<div className="hv-card" style={{...S.card,marginBottom:"20px",borderTop:`4px solid ${selectedInfo.color}`}}>
      <div style={{fontSize:"0.9rem",fontWeight:"700",color:C.navy,marginBottom:"16px"}}>{selectedInfo.emoji} {selectedInfo.nameEn} House — تفصیل</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:"10px",marginBottom:"16px"}}>
        {[{l:"کل پوائنٹس",v:selectedStats.points||0,c:selectedInfo.color},{l:"طلبا",v:selectedStats.studs?.length||0,c:C.abuBakr},{l:"HVS اندراجات",v:selectedStats.hLogs?.length||0,c:C.teal},{l:"اوسط HVS",v:`${selectedStats.avgHvs}/${HVS_TOTAL}`,c:C.amber},{l:"بہترین",v:selectedStats.bestWeek,c:C.green},{l:"درجہ",v:`#${selectedStats.rank}`,c:C.gold}].map((x,i)=><div key={i} style={{background:`${x.c}10`,borderRadius:"12px",padding:"12px",border:`1px solid ${x.c}20`,textAlign:"center"}}><div style={{fontSize:"1.2rem",fontWeight:"800",color:x.c}}>{x.v}</div><div style={{fontSize:"0.6rem",color:"#888",marginTop:"2px"}}>{x.l}</div></div>)}
      </div>
      <div style={{fontSize:"0.72rem",fontWeight:"700",color:C.navy,marginBottom:"10px"}}>👥 طلبا</div>
      <div style={{display:"flex",flexWrap:"wrap",gap:"8px"}}>
        {selectedStats.studs?.map(s=><span key={s.id} style={{...hBadge(selectedInfo.color,selectedInfo.light),fontSize:"0.65rem"}}>{s.name}</span>)}
      </div>
    </div>}
    <div style={S.card} className="hv-card">
     <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}><div style={{fontSize:"0.85rem",fontWeight:"700",color:C.navy}}>📊 ہاؤس موازنہ</div><PrintBtn onClick={()=>printHVSReport(houses,hvsLogs,students)} label="HVS رپورٹ PDF"/></div>
      <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead><tr><th style={S.th}>ہاؤس</th><th style={S.th}>درجہ</th><th style={S.th}>پوائنٹس</th><th style={S.th}>طلبا</th><th style={S.th}>اوسط HVS</th><th style={S.th}>بہترین</th></tr></thead>
        <tbody>{houseStats.map((h,i)=>{ const info=HOUSES.find(x=>x.id===h.id)||{}; return <tr key={h.id} style={{background:i===0?`${info.color}08`:undefined}}>
          <td style={S.td}><span style={hBadge(info.color,info.light)}>{info.emoji} {info.nameEn}</span></td>
          <td style={{...S.td,fontWeight:"800",color:i===0?C.gold:"#888"}}>{i===0?"👑 1st":`#${i+1}`}</td>
          <td style={{...S.td,fontWeight:"800",color:info.color}}>{h.points||0}</td>
          <td style={S.td}>{h.studs?.length||0}</td>
          <td style={S.td}>{h.avgHvs}/{HVS_TOTAL}</td>
          <td style={{...S.td,color:C.green,fontWeight:"700"}}>{h.bestWeek}</td>
        </tr>; })}
        </tbody>
      </table></div>
    </div>
  </div>;
}

export default SuperHouseDashboard;
