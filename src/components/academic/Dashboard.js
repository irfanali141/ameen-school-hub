/* eslint-disable */
import { useState, useEffect } from "react";
import { C, S, hBadge, pBar, HOUSES, HVS_TOTAL } from "../../constants";

function Dashboard({students,teachers,houses,hvsLogs,fees,results,setPage}){
  /* ── Data computations (all Firebase props kept) ── */
  const totalStudents    = students.length;
  const totalTeachers    = teachers.length;
  const activeStudents   = students.filter(s=>s.enrollmentStatus==="active").length;
  const pendingFees      = fees.filter(f=>f.status==="pending").length;
  const totalFeesPaid    = fees.filter(f=>f.status==="paid").reduce((s,f)=>s+(f.amount||0),0);
  const houseRanked      = [...houses].sort((a,b)=>(b.points||0)-(a.points||0));
  const topHouse         = houseRanked[0];
  const topHouseInfo     = HOUSES.find(h=>h.id===topHouse?.id)||{};
  const recentFees       = fees.slice(0,6);
  const recentResults    = results.slice(0,6);
  const attendanceToday  = hvsLogs.filter(l=>{
    const d=l.createdAt?.toDate?.();
    return d && d.toDateString()===new Date().toDateString();
  }).length;

  const todayStr = new Date().toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric"});
  const todayUrStr = new Date().toLocaleDateString("ur-PK");

  /* ── Design tokens ── */
  const G = "#d4af37";          // prestige gold
  const N = "#0f172a";          // prestige navy
  const glass = {
    background:"rgba(255,255,255,0.07)",
    backdropFilter:"blur(20px)",
    WebkitBackdropFilter:"blur(20px)",
    border:"1px solid rgba(212,175,55,0.18)",
    borderRadius:"20px",
  };
  const glassLight = {
    background:"rgba(255,255,255,0.11)",
    backdropFilter:"blur(20px)",
    WebkitBackdropFilter:"blur(20px)",
    border:"1px solid rgba(212,175,55,0.25)",
    borderRadius:"16px",
  };

  /* ── Stats row ── */
  const stats = [
    { icon:"school",          labelEn:"Total Students",  labelUr:"کل طلبا",      value:totalStudents,            sub:`${activeStudents} active`,     accent:"#60a5fa", page:"students" },
    { icon:"supervisor_account", labelEn:"Faculty",       labelUr:"اساتذہ",       value:totalTeachers,            sub:"staff members",                accent:"#34d399", page:"teachers" },
    { icon:"fact_check",      labelEn:"HVS Today",       labelUr:"آج کی سرگرمی", value:attendanceToday,          sub:"entries logged",               accent:"#a78bfa", page:"hvs" },
    { icon:"payments",        labelEn:"Fees Pending",    labelUr:"باقی فیس",     value:pendingFees,              sub:`Rs ${totalFeesPaid.toLocaleString()} collected`, accent:"#fb923c", page:"fees" },
    { icon:"emoji_events",    labelEn:"Top House",       labelUr:"سرِفہرست",     value:topHouseInfo.nameEn||"—", sub:`${topHouse?.points||0} pts`,   accent:topHouseInfo.color||G, isText:true },
  ];

  /* ── Quick access navigation ── */
  const quickLinks = [
    { icon:"school",           label:"طلبا",           labelEn:"Students",    page:"students",    grad:"linear-gradient(135deg,#1e40af,#2563eb)" },
    { icon:"supervisor_account",label:"اساتذہ",         labelEn:"Teachers",    page:"teachers",   grad:"linear-gradient(135deg,#166534,#16a34a)" },
    { icon:"fact_check",       label:"حاضری",          labelEn:"Attendance",  page:"attendance", grad:"linear-gradient(135deg,#7c3aed,#9333ea)" },
    { icon:"payments",         label:"فیس",            labelEn:"Fees",        page:"fees",       grad:"linear-gradient(135deg,#92400e,#d97706)" },
    { icon:"analytics",        label:"نتائج",          labelEn:"Results",     page:"results",    grad:"linear-gradient(135deg,#0e7490,#0891b2)" },
    { icon:"emoji_events",     label:"ہاؤس",           labelEn:"Houses",      page:"houses",     grad:"linear-gradient(135deg,#991b1b,#dc2626)" },
    { icon:"volunteer_activism",label:"HVS",            labelEn:"HVS Entry",  page:"hvs",        grad:"linear-gradient(135deg,#854d0e,#ca8a04)" },
    { icon:"manage_accounts",  label:"تنخواہ",         labelEn:"Salary",      page:"salary",     grad:"linear-gradient(135deg,#1e3a5f,#1e40af)" },
  ];

  const medalIcon = i => i===0?"👑":i===1?"🥈":i===2?"🥉":"4️⃣";
  const maxPts = Math.max(...houseRanked.map(h=>h.points||0), 1);

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#0f172a 0%,#13203a 45%,#1a2c4a 100%)",direction:"rtl",fontFamily:"'Public Sans','Noto Nastaliq Urdu',sans-serif",position:"relative",overflowX:"hidden"}}>

      {/* Gold shimmer top bar */}
      <div style={{position:"sticky",top:0,left:0,right:0,height:"3px",background:"linear-gradient(90deg,transparent,#d4af37,#f5e4a1,#d4af37,transparent)",zIndex:10}}/>

      <div style={{padding:"28px 32px",maxWidth:"1500px",margin:"0 auto"}}>

        {/* ══ HERO HEADER ══ */}
        <div style={{...glass,padding:"28px 36px",marginBottom:"28px",display:"flex",flexWrap:"wrap",justifyContent:"space-between",alignItems:"center",gap:"20px",position:"relative",overflow:"hidden"}}>
          {/* Decorative circle */}
          <div style={{position:"absolute",left:"-60px",top:"-60px",width:"220px",height:"220px",borderRadius:"50%",background:"rgba(212,175,55,0.06)",pointerEvents:"none"}}/>
          <div style={{position:"absolute",left:"80px",bottom:"-80px",width:"180px",height:"180px",borderRadius:"50%",background:"rgba(212,175,55,0.04)",pointerEvents:"none"}}/>

          <div>
            <div style={{fontFamily:"'Public Sans',sans-serif",color:G,fontSize:"0.7rem",fontWeight:"700",letterSpacing:"0.2em",textTransform:"uppercase",marginBottom:"8px",direction:"ltr"}}>
              <span className="material-symbols-rounded" style={{fontSize:"14px",verticalAlign:"middle",marginLeft:"6px"}}>dashboard</span>
              Executive Dashboard
            </div>
            <div style={{color:"white",fontSize:"2rem",fontWeight:"800",lineHeight:1.1,marginBottom:"6px"}}>امین اسکول ہب</div>
            <div style={{color:"rgba(255,255,255,0.45)",fontSize:"0.72rem",letterSpacing:"0.08em",fontFamily:"'Public Sans',sans-serif",direction:"ltr"}}>AMEEN ISLAMIC INSTITUTE • SWAT</div>
          </div>

          <div style={{display:"flex",gap:"16px",flexWrap:"wrap",alignItems:"center"}}>
            {/* Date card */}
            <div style={{...glassLight,padding:"14px 20px",textAlign:"center",minWidth:"170px"}}>
              <div style={{color:"rgba(255,255,255,0.4)",fontSize:"0.62rem",fontFamily:"'Public Sans',sans-serif",direction:"ltr",marginBottom:"4px"}}>{todayStr}</div>
              <div style={{color:G,fontSize:"0.85rem",fontWeight:"700"}}>{todayUrStr}</div>
            </div>
            {/* Top house trophy */}
            {topHouseInfo.nameEn && (
              <div style={{...glassLight,padding:"14px 20px",textAlign:"center",borderColor:`${topHouseInfo.color||G}40`}}>
                <div style={{color:"rgba(255,255,255,0.45)",fontSize:"0.6rem",fontFamily:"'Public Sans',sans-serif",marginBottom:"4px",direction:"ltr"}}>Top House</div>
                <div style={{fontSize:"1.1rem",marginBottom:"2px"}}>{topHouseInfo.emoji} <span style={{color:"white",fontWeight:"700",fontSize:"0.9rem"}}>{topHouseInfo.nameEn}</span></div>
                <div style={{color:G,fontWeight:"800",fontSize:"1rem",fontFamily:"'Public Sans',sans-serif"}}>{topHouse?.points||0} <span style={{fontSize:"0.62rem",fontWeight:"500",color:"rgba(255,255,255,0.4)"}}>pts</span></div>
              </div>
            )}
          </div>
        </div>

        {/* ══ STATS ROW ══ */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:"16px",marginBottom:"28px"}}>
          {stats.map((s,i)=>(
            <div key={i} className="hv-stat" onClick={()=>s.page&&setPage&&setPage(s.page)} style={{...glass,padding:"22px 24px",cursor:s.page?"pointer":"default",position:"relative",overflow:"hidden"}}>
              {/* Accent blob */}
              <div style={{position:"absolute",top:"-20px",left:"-20px",width:"80px",height:"80px",borderRadius:"50%",background:`${s.accent}18`,pointerEvents:"none"}}/>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"14px"}}>
                <div style={{background:`${s.accent}20`,borderRadius:"12px",padding:"10px",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <span className="material-symbols-rounded" style={{fontSize:"22px",color:s.accent}}>{s.icon}</span>
                </div>
                <div style={{textAlign:"left",direction:"ltr"}}>
                  <div style={{color:"rgba(255,255,255,0.35)",fontSize:"0.58rem",fontFamily:"'Public Sans',sans-serif",marginBottom:"2px"}}>{s.labelEn}</div>
                  <div style={{color:"rgba(255,255,255,0.6)",fontSize:"0.65rem",fontFamily:"'Noto Nastaliq Urdu',serif"}}>{s.labelUr}</div>
                </div>
              </div>
              <div style={{color:"white",fontSize:s.isText?"1.2rem":"2rem",fontWeight:"800",fontFamily:"'Public Sans',sans-serif",lineHeight:1,marginBottom:"6px"}}>
                {s.value}
              </div>
              <div style={{color:"rgba(255,255,255,0.35)",fontSize:"0.62rem",fontFamily:"'Public Sans',sans-serif"}}>{s.sub}</div>
              {/* Bottom accent line */}
              <div style={{position:"absolute",bottom:0,right:0,left:0,height:"2px",background:`linear-gradient(90deg,transparent,${s.accent}60,transparent)`}}/>
            </div>
          ))}
        </div>

        {/* ══ MIDDLE SECTION: House LB + Recent Activity ══ */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1.4fr",gap:"20px",marginBottom:"28px"}}>

          {/* House Leaderboard */}
          <div style={{...glass,padding:"24px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"20px"}}>
              <div>
                <div style={{color:G,fontSize:"0.62rem",fontWeight:"700",letterSpacing:"0.15em",textTransform:"uppercase",fontFamily:"'Public Sans',sans-serif",direction:"ltr",marginBottom:"4px"}}>STANDINGS</div>
                <div style={{color:"white",fontSize:"1rem",fontWeight:"700"}}>🏆 ہاؤس لیڈربورڈ</div>
              </div>
              {setPage&&<button onClick={()=>setPage("houses")} style={{background:"rgba(212,175,55,0.12)",border:"1px solid rgba(212,175,55,0.3)",borderRadius:"10px",padding:"6px 14px",color:G,fontSize:"0.65rem",fontFamily:"'Public Sans',sans-serif",cursor:"pointer",fontWeight:"600"}}>View All</button>}
            </div>
            {houseRanked.map((h,i)=>{
              const info=HOUSES.find(x=>x.id===h.id)||{};
              const pct=Math.round(((h.points||0)/maxPts)*100);
              return (
                <div key={h.id} style={{marginBottom:"16px",padding:"14px 16px",background:"rgba(255,255,255,0.04)",borderRadius:"14px",border:`1px solid ${info.color||G}22`}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"10px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
                      <span style={{fontSize:"1.1rem"}}>{medalIcon(i)}</span>
                      <div>
                        <div style={{color:"white",fontWeight:"700",fontSize:"0.82rem"}}>{info.emoji} {info.nameEn}</div>
                        <div style={{color:"rgba(255,255,255,0.35)",fontSize:"0.58rem",fontFamily:"'Public Sans',sans-serif"}}>{info.name}</div>
                      </div>
                    </div>
                    <div style={{textAlign:"left",direction:"ltr"}}>
                      <div style={{color:info.color||G,fontWeight:"800",fontSize:"1.1rem",fontFamily:"'Public Sans',sans-serif"}}>{h.points||0}</div>
                      <div style={{color:"rgba(255,255,255,0.3)",fontSize:"0.55rem",fontFamily:"'Public Sans',sans-serif"}}>points</div>
                    </div>
                  </div>
                  <div style={{height:"5px",background:"rgba(255,255,255,0.08)",borderRadius:"3px",overflow:"hidden"}}>
                    <div style={{width:`${pct}%`,height:"100%",background:`linear-gradient(90deg,${info.color||G},${info.color||G}aa)`,borderRadius:"3px",transition:"width 0.6s ease"}}/>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recent Activity */}
          <div style={{...glass,padding:"24px",display:"flex",flexDirection:"column",gap:"0"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"20px"}}>
              <div>
                <div style={{color:G,fontSize:"0.62rem",fontWeight:"700",letterSpacing:"0.15em",textTransform:"uppercase",fontFamily:"'Public Sans',sans-serif",direction:"ltr",marginBottom:"4px"}}>LIVE FEED</div>
                <div style={{color:"white",fontSize:"1rem",fontWeight:"700"}}>📋 حالیہ سرگرمی</div>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px",flex:1}}>
              {/* Recent Fees */}
              <div>
                <div style={{color:"rgba(255,255,255,0.4)",fontSize:"0.6rem",fontWeight:"600",letterSpacing:"0.1em",fontFamily:"'Public Sans',sans-serif",marginBottom:"12px",display:"flex",alignItems:"center",gap:"6px",direction:"ltr"}}>
                  <span className="material-symbols-rounded" style={{fontSize:"14px",color:"#fb923c"}}>payments</span> RECENT FEES
                </div>
                {recentFees.length===0 && <div style={{color:"rgba(255,255,255,0.2)",fontSize:"0.65rem",textAlign:"center",padding:"20px 0"}}>No records</div>}
                {recentFees.map(f=>{ const st=students.find(s=>s.id===f.studentId); return (
                  <div key={f.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
                    <div style={{fontSize:"0.68rem",fontWeight:"600",color:"rgba(255,255,255,0.75)"}}>{st?.name||"—"}</div>
                    <span style={{fontSize:"0.6rem",padding:"3px 9px",borderRadius:"20px",fontWeight:"700",fontFamily:"'Public Sans',sans-serif",background:f.status==="paid"?"rgba(52,211,153,0.15)":"rgba(251,146,60,0.15)",color:f.status==="paid"?"#34d399":"#fb923c",border:`1px solid ${f.status==="paid"?"#34d39930":"#fb923c30"}`}}>
                      Rs.{(f.amount||0).toLocaleString()}
                    </span>
                  </div>
                );})}
              </div>
              {/* Recent Results */}
              <div>
                <div style={{color:"rgba(255,255,255,0.4)",fontSize:"0.6rem",fontWeight:"600",letterSpacing:"0.1em",fontFamily:"'Public Sans',sans-serif",marginBottom:"12px",display:"flex",alignItems:"center",gap:"6px",direction:"ltr"}}>
                  <span className="material-symbols-rounded" style={{fontSize:"14px",color:"#a78bfa"}}>analytics</span> RECENT RESULTS
                </div>
                {recentResults.length===0 && <div style={{color:"rgba(255,255,255,0.2)",fontSize:"0.65rem",textAlign:"center",padding:"20px 0"}}>No records</div>}
                {recentResults.map(r=>{ const st=students.find(s=>s.id===r.studentId); const pct=r.percentage||r.totalMarks||0; const col=pct>=80?"#34d399":pct>=50?"#fbbf24":"#f87171"; return (
                  <div key={r.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
                    <div style={{fontSize:"0.68rem",fontWeight:"600",color:"rgba(255,255,255,0.75)"}}>{st?.name||"—"}</div>
                    <span style={{fontSize:"0.68rem",fontWeight:"800",color:col,fontFamily:"'Public Sans',sans-serif"}}>{pct}%</span>
                  </div>
                );})}
              </div>
            </div>
          </div>
        </div>

        {/* ══ QUICK ACCESS ══ */}
        <div style={{marginBottom:"8px"}}>
          <div style={{color:G,fontSize:"0.62rem",fontWeight:"700",letterSpacing:"0.2em",textTransform:"uppercase",fontFamily:"'Public Sans',sans-serif",direction:"ltr",marginBottom:"16px"}}>
            <span className="material-symbols-rounded" style={{fontSize:"14px",verticalAlign:"middle",marginLeft:"6px"}}>apps</span>
            Quick Access
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(170px,1fr))",gap:"14px"}}>
            {quickLinks.map((lk,i)=>(
              <button key={i} onClick={()=>setPage&&setPage(lk.page)}
                style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"18px",padding:"22px 20px",cursor:"pointer",fontFamily:"inherit",textAlign:"right",transition:"transform 0.18s ease,box-shadow 0.2s ease,background 0.2s ease",display:"flex",flexDirection:"column",alignItems:"flex-end",gap:"12px",position:"relative",overflow:"hidden"}}>
                {/* Gradient orb */}
                <div style={{position:"absolute",top:"-20px",left:"-20px",width:"90px",height:"90px",borderRadius:"50%",background:lk.grad,opacity:0.25,filter:"blur(20px)",pointerEvents:"none"}}/>
                <div style={{background:lk.grad,borderRadius:"14px",padding:"10px",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 4px 16px rgba(0,0,0,0.3)`}}>
                  <span className="material-symbols-rounded" style={{fontSize:"22px",color:"white"}}>{lk.icon}</span>
                </div>
                <div>
                  <div style={{color:"white",fontSize:"0.9rem",fontWeight:"700",marginBottom:"2px"}}>{lk.label}</div>
                  <div style={{color:"rgba(255,255,255,0.35)",fontSize:"0.6rem",fontFamily:"'Public Sans',sans-serif",direction:"ltr"}}>{lk.labelEn}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

      </div>{/* end max-width wrapper */}
    </div>
  );
}

export default Dashboard;
