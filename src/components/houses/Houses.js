/* eslint-disable */
import { useState, useEffect } from "react";
import { C, S, hBadge, pBar, HOUSES, HVS_TOTAL, HVS_CATS } from "../../constants";

function Houses({houses,hvsLogs,students}){
  const G="#d4af37";const N="#0f172a";
  const glass={background:"rgba(255,255,255,0.07)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:"16px"};
  const [selected,setSelected]=useState(null);
  const houseStats=HOUSES.map(info=>{ const hd=houses.find(h=>h.id===info.id)||{}; const studs=students.filter(s=>s.houseId===info.id); const hLogs=hvsLogs.filter(l=>l.houseId===info.id); const avgHvs=hLogs.length?Math.round(hLogs.reduce((s,l)=>s+(l.totalScore||0),0)/hLogs.length):0; const bestWeek=hLogs.length?Math.max(...hLogs.map(l=>l.totalScore||0)):0; return {...info,...hd,studs,hLogs,avgHvs,bestWeek}; }).sort((a,b)=>(b.points||0)-(a.points||0)).map((h,i)=>({...h,rank:i+1}));
  const selectedStats=selected?houseStats.find(h=>h.id===selected):null;
  const selectedInfo=selected?HOUSES.find(h=>h.id===selected):null;
  const rankMedal=["👑","🥈","🥉","4️⃣"];
  const maxPts=houseStats[0]?.points||1;
  return (
    <div style={{minHeight:"100vh",background:`linear-gradient(160deg,${N} 0%,#0d1f3c 50%,#0a1628 100%)`,padding:"24px 20px",fontFamily:"'Public Sans',sans-serif",direction:"rtl"}}>
      {/* Header */}
      <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"28px"}}>
        <div style={{width:"44px",height:"44px",borderRadius:"12px",background:`linear-gradient(135deg,${G},#b8960a)`,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 4px 20px rgba(212,175,55,0.4)`}}>
          <span className="material-symbols-rounded" style={{fontSize:"24px",color:N}}>emoji_events</span>
        </div>
        <div>
          <h1 style={{margin:0,fontSize:"1.5rem",fontWeight:"800",color:"#f1f5f9"}}>ہاؤس سسٹم</h1>
          <p style={{margin:0,fontSize:"0.75rem",color:"rgba(212,175,55,0.7)",fontWeight:"500"}}>House Leaderboard & Points</p>
        </div>
      </div>
      {/* House Cards */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:"16px",marginBottom:"28px"}}>
        {houseStats.map((h,i)=>{ const info=HOUSES.find(x=>x.id===h.id)||{}; const isSel=selected===h.id; const pct=maxPts>0?Math.round(((h.points||0)/maxPts)*100):0; return (
          <div key={h.id} className="hv-card" onClick={()=>setSelected(isSel?null:h.id)} style={{...glass,padding:"22px",cursor:"pointer",borderTop:`3px solid ${info.color}`,position:"relative",overflow:"hidden",boxShadow:isSel?`0 0 0 2px ${info.color},0 8px 32px ${info.color}30`:undefined,transition:"all 0.25s"}}>
            <div style={{position:"absolute",top:"-20px",left:"-20px",width:"90px",height:"90px",borderRadius:"50%",background:`${info.color}10`,pointerEvents:"none"}}/>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"14px"}}>
              <div style={{fontSize:"2.2rem"}}>{info.emoji}</div>
              <div style={{fontSize:"1.4rem"}}>{rankMedal[i]||`#${i+1}`}</div>
            </div>
            <div style={{fontWeight:"800",fontSize:"1rem",color:info.color,marginBottom:"3px"}}>{info.nameEn}</div>
            <div style={{fontSize:"0.62rem",color:"rgba(241,245,249,0.4)",marginBottom:"14px"}}>{info.slogan}</div>
            <div style={{fontSize:"2rem",fontWeight:"900",color:"#f1f5f9",lineHeight:1,marginBottom:"2px"}}>{h.points||0}</div>
            <div style={{fontSize:"0.6rem",color:"rgba(212,175,55,0.6)",marginBottom:"12px"}}>پوائنٹس</div>
            {/* Progress bar */}
            <div style={{height:"4px",borderRadius:"2px",background:"rgba(255,255,255,0.08)",marginBottom:"12px",overflow:"hidden"}}>
              <div style={{height:"100%",width:`${pct}%`,borderRadius:"2px",background:`linear-gradient(90deg,${info.color},${info.color}aa)`,transition:"width 0.5s"}}/>
            </div>
            <div style={{display:"flex",gap:"8px"}}>
              <div style={{background:`${info.color}15`,borderRadius:"8px",padding:"7px 10px",flex:1,textAlign:"center",border:`1px solid ${info.color}25`}}>
                <div style={{fontSize:"1rem",fontWeight:"800",color:info.color}}>{h.studs?.length||0}</div>
                <div style={{fontSize:"0.52rem",color:"rgba(241,245,249,0.4)"}}>طلبا</div>
              </div>
              <div style={{background:`${info.color}15`,borderRadius:"8px",padding:"7px 10px",flex:1,textAlign:"center",border:`1px solid ${info.color}25`}}>
                <div style={{fontSize:"1rem",fontWeight:"800",color:info.color}}>{h.avgHvs}</div>
                <div style={{fontSize:"0.52rem",color:"rgba(241,245,249,0.4)"}}>اوسط HVS</div>
              </div>
            </div>
          </div>
        ); })}
      </div>
      {/* Detail Panel */}
      {selectedStats&&selectedInfo&&(
        <div style={{...glass,padding:"20px",marginBottom:"24px",borderColor:`rgba(${selectedInfo.color},0.3)`,borderTopColor:selectedInfo.color,borderTopWidth:"3px"}}>
          <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"16px"}}>
            <span style={{fontSize:"1.5rem"}}>{selectedInfo.emoji}</span>
            <div>
              <div style={{fontWeight:"700",color:selectedInfo.color,fontSize:"0.95rem"}}>{selectedInfo.nameEn} — طلبا کی فہرست</div>
              <div style={{fontSize:"0.65rem",color:"rgba(241,245,249,0.4)"}}>{selectedStats.studs?.length||0} طلبا</div>
            </div>
          </div>
          <div style={{display:"flex",flexWrap:"wrap",gap:"8px"}}>
            {selectedStats.studs?.map(s=><span key={s.id} style={{padding:"5px 12px",borderRadius:"20px",fontSize:"0.68rem",fontWeight:"600",background:`${selectedInfo.color}15`,color:selectedInfo.color,border:`1px solid ${selectedInfo.color}30`}}>{s.name} — {s.grade}</span>)}
            {!selectedStats.studs?.length&&<div style={{color:"rgba(241,245,249,0.35)",fontSize:"0.72rem"}}>کوئی طالب علم نہیں</div>}
          </div>
        </div>
      )}
      {/* Comparison Table */}
      <div style={{...glass,overflow:"hidden"}}>
        <div style={{padding:"14px 20px",borderBottom:"1px solid rgba(255,255,255,0.08)",display:"flex",alignItems:"center",gap:"8px"}}>
          <span className="material-symbols-rounded" style={{color:G,fontSize:"20px"}}>leaderboard</span>
          <span style={{color:"#f1f5f9",fontWeight:"700",fontSize:"0.9rem"}}>لیڈر بورڈ</span>
        </div>
        <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr style={{background:"rgba(255,255,255,0.04)"}}>
            {["ہاؤس","درجہ","پوائنٹس","طلبا","اوسط HVS","بہترین"].map(h=><th key={h} style={{padding:"12px 16px",textAlign:"right",fontSize:"0.68rem",fontWeight:"700",color:"rgba(212,175,55,0.8)",borderBottom:"1px solid rgba(255,255,255,0.08)"}}>{h}</th>)}
          </tr></thead>
          <tbody>{houseStats.map((h,i)=>{ const info=HOUSES.find(x=>x.id===h.id)||{}; return (
            <tr key={h.id} style={{borderBottom:"1px solid rgba(255,255,255,0.05)",background:i===0?"rgba(212,175,55,0.05)":i%2===0?"rgba(255,255,255,0.02)":"transparent"}}>
              <td style={{padding:"12px 16px"}}><span style={{padding:"4px 12px",borderRadius:"20px",fontSize:"0.7rem",fontWeight:"600",background:`${info.color}20`,color:info.color,border:`1px solid ${info.color}40`}}>{info.emoji} {info.nameEn}</span></td>
              <td style={{padding:"12px 16px",fontWeight:"800",color:i===0?G:"rgba(241,245,249,0.5)",fontSize:"0.85rem"}}>{rankMedal[i]||`#${i+1}`}</td>
              <td style={{padding:"12px 16px",fontWeight:"800",color:info.color,fontSize:"1rem"}}>{h.points||0}</td>
              <td style={{padding:"12px 16px",color:"rgba(241,245,249,0.65)",fontSize:"0.78rem"}}>{h.studs?.length||0}</td>
              <td style={{padding:"12px 16px",color:"rgba(241,245,249,0.65)",fontSize:"0.78rem"}}>{h.avgHvs}/{HVS_TOTAL}</td>
              <td style={{padding:"12px 16px",color:"#4ade80",fontWeight:"700",fontSize:"0.78rem"}}>{h.bestWeek}</td>
            </tr>
          ); })}
          </tbody>
        </table></div>
      </div>
    </div>
  );
}

export default Houses;
