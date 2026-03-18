/* eslint-disable */
import { useState, useEffect } from "react";
import { C, S, hBadge, pBar, HOUSES, HVS_CATS, HVS_TOTAL } from "../../constants";

function HVSEntry({students,houses,addData,updateHousePoints,hvsLogs=[]}){
  const [houseId,setHouseId]=useState("abuBakr"); const [week,setWeek]=useState(""); const [scores,setScores]=useState({});
  const [saving,setSaving]=useState(false); const [done,setDone]=useState(false);
  const [lbTab,setLbTab]=useState("week");
  const houseStudents=students.filter(s=>s.houseId===houseId);
  const setScore=(cat,val)=>setScores(prev=>({...prev,[cat]:Math.min(HVS_CATS.find(c=>c.id===cat)?.max||10,Math.max(0,Number(val)))}));
  const total=HVS_CATS.reduce((s,c)=>s+(scores[c.id]||0),0);
  const save=async()=>{
    if(!week){alert("ہفتہ درج کریں"); return;}
    setSaving(true);
    const houseInfo=HOUSES.find(h=>h.id===houseId)||{};
    await addData("hvs_logs",{houseId,week,scores:{...scores},totalScore:total,houseName:houseInfo.nameEn});
    await updateHousePoints(houseId,total);
    setScores({}); setDone(true); setTimeout(()=>setDone(false),3000); setSaving(false);
  };

  // Current ISO week string e.g. "2026-W12"
  const currentWeek=(()=>{ const d=new Date(); const jan4=new Date(d.getFullYear(),0,4); const wk=Math.ceil(((d-jan4)/86400000+jan4.getDay()+1)/7); return `${d.getFullYear()}-W${String(wk).padStart(2,"0")}`; })();
  // This week: sum totalScore per house from hvsLogs
  const weekMap={}; hvsLogs.filter(l=>l.week===currentWeek).forEach(l=>{ weekMap[l.houseId]=(weekMap[l.houseId]||0)+(l.totalScore||0); });
  // All-time: sum ALL hvsLogs per house (source of truth, not houses.points which may lag)
  const allMap={}; hvsLogs.forEach(l=>{ allMap[l.houseId]=(allMap[l.houseId]||0)+(l.totalScore||0); });
  const weekBoard=[...HOUSES].map(h=>({...h,pts:weekMap[h.id]||0,studentCount:students.filter(s=>s.houseId===h.id).length})).sort((a,b)=>b.pts-a.pts);
  const allTimeBoard=[...HOUSES].map(h=>({...h,pts:allMap[h.id]||0,studentCount:students.filter(s=>s.houseId===h.id).length})).sort((a,b)=>b.pts-a.pts);
  const board=lbTab==="week"?weekBoard:allTimeBoard;
  const medal=i=>i===0?"🥇":i===1?"🥈":i===2?"🥉":`#${i+1}`;

  const G="#d4af37"; const N="#0f172a"; const N2="#1e293b";
  const glass={background:"rgba(255,255,255,0.07)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:"16px"};
  const inp={width:"100%",padding:"10px 14px",borderRadius:"10px",border:"1px solid rgba(212,175,55,0.25)",background:"rgba(255,255,255,0.06)",color:"#f1f5f9",fontSize:"0.8rem",fontFamily:"'Public Sans',sans-serif",outline:"none",boxSizing:"border-box",direction:"rtl",colorScheme:"dark"};
  const lbl={fontSize:"0.7rem",color:"rgba(212,175,55,0.8)",marginBottom:"6px",display:"block",fontWeight:"600"};
  return <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#0f172a 0%,#0d1f3c 50%,#0a1628 100%)",padding:"24px 20px",fontFamily:"'Public Sans',sans-serif",direction:"rtl"}}>
    <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"24px"}}>
      <div style={{width:"44px",height:"44px",borderRadius:"12px",background:"linear-gradient(135deg,#d4af37,#b8960a)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 20px rgba(212,175,55,0.4)"}}>
        <span className="material-symbols-rounded" style={{fontSize:"24px",color:N}}>emoji_events</span>
      </div>
      <div><h2 style={{margin:0,fontSize:"1.4rem",fontWeight:"800",color:"#f1f5f9"}}>HVS اندراج</h2><p style={{margin:0,fontSize:"0.72rem",color:"rgba(212,175,55,0.7)"}}>House Values Scoring</p></div>
    </div>
    {done&&<div style={{...glass,padding:"14px 20px",marginBottom:"16px",textAlign:"center",border:"1px solid rgba(74,222,128,0.3)",background:"rgba(74,222,128,0.1)"}}>
      <span style={{color:"#4ade80",fontWeight:"700",fontSize:"0.82rem"}}>✓ کامیابی سے محفوظ ہو گیا!</span>
    </div>}

    {/* ══ HVS LEADERBOARD ══ */}
    <div style={{...glass,padding:"20px",marginBottom:"20px"}}>
      {/* Title + tab toggle */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px",flexWrap:"wrap",gap:"10px"}}>
        <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
          <span className="material-symbols-rounded" style={{color:G,fontSize:"20px"}}>leaderboard</span>
          <span style={{color:G,fontWeight:"800",fontSize:"0.95rem"}}>HVS لیڈربورڈ</span>
        </div>
        <div style={{display:"flex",gap:"4px",background:"rgba(255,255,255,0.05)",borderRadius:"10px",padding:"3px"}}>
          {[["week","اس ہفتے"],["alltime","مجموعی"]].map(([v,l])=>(
            <button key={v} onClick={()=>setLbTab(v)} style={{padding:"6px 14px",borderRadius:"8px",border:"none",background:lbTab===v?"rgba(212,175,55,0.25)":"transparent",color:lbTab===v?G:"rgba(255,255,255,0.45)",fontWeight:lbTab===v?"700":"500",fontSize:"0.72rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif",transition:"all 0.15s"}}>{l}</button>
          ))}
        </div>
      </div>

      {/* Week label */}
      {lbTab==="week"&&<div style={{fontSize:"0.6rem",color:"rgba(255,255,255,0.3)",marginBottom:"12px",direction:"ltr",fontFamily:"monospace"}}>{currentWeek}</div>}

      {/* Leaderboard rows */}
      <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
        {board.map((h,i)=>{
          const maxPts=board[0]?.pts||1;
          const barPct=Math.round((h.pts/maxPts)*100);
          const isTop=i<3;
          return (
            <div key={h.id} style={{background:isTop?`${h.color}12`:"rgba(255,255,255,0.03)",borderRadius:"12px",padding:"12px 14px",border:`1px solid ${isTop?h.color+"30":"rgba(255,255,255,0.07)"}`,transition:"all 0.2s"}}>
              <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:h.pts>0?"8px":"0"}}>
                {/* Rank */}
                <div style={{fontSize:isTop?"1.3rem":"0.85rem",fontWeight:"800",minWidth:"32px",textAlign:"center",color:isTop?"inherit":"rgba(255,255,255,0.35)",fontFamily:"'Public Sans',sans-serif"}}>{medal(i)}</div>
                {/* House badge */}
                <div style={{width:"32px",height:"32px",borderRadius:"8px",background:h.gradient||h.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1rem",flexShrink:0,boxShadow:`0 2px 8px ${h.color}40`}}>{h.emoji}</div>
                {/* Name */}
                <div style={{flex:1}}>
                  <div style={{fontWeight:"700",fontSize:"0.82rem",color:isTop?h.color:"#f1f5f9"}}>{h.nameEn}</div>
                  <div style={{fontSize:"0.58rem",color:"rgba(255,255,255,0.35)"}}>{h.name} • {h.studentCount} طلبا</div>
                </div>
                {/* Points */}
                <div style={{textAlign:"left",direction:"ltr"}}>
                  <div style={{fontWeight:"900",fontSize:"1.1rem",color:isTop?h.color:G,fontFamily:"'Public Sans',sans-serif",lineHeight:1}}>{h.pts}</div>
                  <div style={{fontSize:"0.55rem",color:"rgba(255,255,255,0.3)"}}>pts</div>
                </div>
              </div>
              {/* Progress bar */}
              {h.pts>0&&<div style={{height:"4px",background:"rgba(255,255,255,0.06)",borderRadius:"2px",overflow:"hidden",marginRight:"44px"}}>
                <div style={{width:`${barPct}%`,height:"100%",background:`linear-gradient(90deg,${h.color},${h.color}aa)`,borderRadius:"2px",transition:"width 0.6s ease"}}/>
              </div>}
            </div>
          );
        })}
        {board.every(h=>h.pts===0)&&<div style={{textAlign:"center",padding:"24px",color:"rgba(255,255,255,0.2)",fontSize:"0.75rem"}}>
          {lbTab==="week"?"اس ہفتے کوئی اسکور نہیں":"ابھی تک کوئی اسکور نہیں"}
        </div>}
      </div>
    </div>
    {/* House & Week Selector */}
    <div style={{...glass,padding:"20px",marginBottom:"16px"}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div><label style={lbl}>ہاؤس</label>
          <select style={inp} value={houseId} onChange={e=>setHouseId(e.target.value)}>
            {HOUSES.map(h=><option key={h.id} value={h.id} style={{background:N2}}>{h.emoji} {h.nameEn}</option>)}
          </select>
        </div>
        <div><label style={lbl}>ہفتہ *</label>
          <input style={{...inp,direction:"ltr",colorScheme:"dark"}} placeholder="2026-W12" value={week} onChange={e=>setWeek(e.target.value)}/>
        </div>
      </div>
      {/* House Info */}
      {(()=>{ const h=HOUSES.find(x=>x.id===houseId)||{}; return <div style={{background:"rgba(255,255,255,0.05)",borderRadius:"12px",padding:"12px",border:`1px solid ${h.color||"#d4af37"}30`,display:"flex",alignItems:"center",gap:"12px"}}>
        <span style={{fontSize:"2rem"}}>{h.emoji}</span>
        <div><div style={{fontWeight:"700",color:h.color||G}}>{h.name}</div><div style={{fontSize:"0.6rem",color:"rgba(255,255,255,0.5)"}}>{h.slogan}</div><div style={{fontSize:"0.6rem",color:"rgba(255,255,255,0.4)",marginTop:"2px"}}>{houseStudents.length} طلبا</div></div>
      </div>; })()}
    </div>
    {/* Scoring Categories */}
    <div style={{...glass,padding:"24px"}}>
      <div style={{fontSize:"0.9rem",fontWeight:"700",color:G,marginBottom:"16px"}}>📊 اسکور درج کریں (کل: {HVS_TOTAL})</div>
      {HVS_CATS.map(cat=><div key={cat.id} style={{marginBottom:"16px",paddingBottom:"16px",borderBottom:"1px solid rgba(255,255,255,0.08)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"6px"}}>
          <div>
            <span style={{fontSize:"0.78rem",fontWeight:"700",color:"#f1f5f9"}}>{cat.icon} {cat.label}</span>
            <span style={{fontSize:"0.55rem",color:"rgba(255,255,255,0.4)",marginRight:"8px"}}> — {cat.desc}</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
            <input style={{...inp,width:"60px",textAlign:"center",direction:"ltr",colorScheme:"dark"}} type="number" min={0} max={cat.max} value={scores[cat.id]||0} onChange={e=>setScore(cat.id,e.target.value)}/>
            <span style={{fontSize:"0.62rem",color:"rgba(255,255,255,0.4)",minWidth:"30px"}}>/{cat.max}</span>
          </div>
        </div>
        {pBar(scores[cat.id]||0,cat.max,C.gold)}
      </div>)}
      {/* Total */}
      <div style={{background:"rgba(212,175,55,0.1)",borderRadius:"14px",padding:"16px",display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"14px",border:"1px solid rgba(212,175,55,0.2)"}}>
        <span style={{color:"rgba(255,255,255,0.8)",fontSize:"0.78rem",fontWeight:"700"}}>کل اسکور</span>
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:"2rem",fontWeight:"900",color:G}}>{total}</div>
          <div style={{fontSize:"0.55rem",color:"rgba(255,255,255,0.4)"}}>/{HVS_TOTAL}</div>
        </div>
        <div style={{fontSize:"1.2rem",fontWeight:"800",color:total>=120?"#4ade80":total>=80?"#fb923c":"#f87171"}}>{total>=120?"شاندار":total>=80?"اچھا":"کمزور"}</div>
      </div>
      {pBar(total,HVS_TOTAL,total>=120?"#4ade80":total>=80?"#fb923c":"#f87171")}
      <button style={{width:"100%",marginTop:"16px",padding:"14px",fontSize:"0.82rem",background:"linear-gradient(135deg,#d4af37,#b8960a)",color:N,border:"none",borderRadius:"12px",cursor:"pointer",fontWeight:"700",fontFamily:"'Public Sans',sans-serif"}} onClick={save} disabled={saving}>{saving?"محفوظ ہو رہا ہے...":"HVS محفوظ کریں"}</button>
    </div>
  </div>;
}

export default HVSEntry;
