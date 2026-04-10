/* eslint-disable */
import { useState } from "react";
import { HOUSES } from "../../constants";
import houseAbuBakr from "../../assets/1769748237732.png";
import houseUmar    from "../../assets/1769748315462.png";
import houseUthman  from "../../assets/1769748410371.png";
import houseAli     from "../../assets/1769748548928.png";
import logo         from "../../logo.png";

const HOUSE_LOGOS = { abuBakr:houseAbuBakr, umar:houseUmar, uthman:houseUthman, ali:houseAli };

const G  = "#d4af37";
const W  = "#f1f5f9";
const N  = "#0f172a";
const glass = { background:"rgba(255,255,255,0.06)", backdropFilter:"blur(20px)",
  WebkitBackdropFilter:"blur(20px)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"16px" };

const SCALE_LABELS = [
  {id:"performance",en:"Performance",icon:"📈",color:"#f472b6"},
  {id:"discipline", en:"Discipline", icon:"⚔️", color:"#60a5fa"},
  {id:"academic",   en:"Academic",   icon:"📚",color:"#4ade80"},
  {id:"social",     en:"Social",     icon:"🤝",color:"#fb923c"},
  {id:"quran",      en:"Quranic",    icon:"📖",color:"#a78bfa"},
  {id:"motivation", en:"Motivation", icon:"🚀",color:"#34d399"},
  {id:"emotional",  en:"Emotional",  icon:"💫",color:"#fbbf24"},
  {id:"leadership", en:"Leadership", icon:"👑",color:G},
];

function gradeColor(p){ return p>=70?"#4ade80":p>=50?"#fbbf24":"#f87171"; }
function grade(p){ return p>=90?"A+":p>=80?"A":p>=70?"B":p>=60?"C":p>=50?"D":"F"; }

export default function ParentPortal({ students=[], fees=[], results=[], evalScales=[], hvsLogs=[], attendance=[] }) {
  const [selStudent, setSelStudent] = useState(null);
  const [q, setQ] = useState("");

  const filtered = students.filter(s =>
    (s.name||"").toLowerCase().includes(q.toLowerCase()) ||
    (s.studentCode||"").includes(q)
  );

  // ── Student Detail View ──
  if (selStudent) {
    const h       = HOUSES.find(x => x.id === selStudent.houseId) || HOUSES[0];
    const sFees   = fees.filter(f => f.studentId === selStudent.id);
    const sRes    = results.filter(r => r.studentId === selStudent.id);
    const pending = sFees.filter(f => f.status === "pending");
    const paid    = sFees.filter(f => f.status === "paid");
    const avgPct  = sRes.length ? Math.round(sRes.reduce((s,r)=>s+(r.percentage||0),0)/sRes.length) : 0;

    // Latest eval
    const stuEvals = evalScales.filter(e=>e.student_id===selStudent.id)
      .sort((a,b)=>(b.month||"").localeCompare(a.month||""));
    const latestEval = stuEvals[0] || null;
    const evalPct = latestEval ? Math.round(Number(latestEval.overall||0)) : null;

    // Attendance this month
    const now = new Date();
    const monthAtt = attendance.filter(a=>{
      const d=new Date(a.date||a.created_at||"");
      return a.studentId===selStudent.id&&d.getMonth()===now.getMonth()&&d.getFullYear()===now.getFullYear();
    });
    const presentDays = monthAtt.filter(a=>(a.status||"").toLowerCase()==="present"||a.present===true).length;
    const attPct = monthAtt.length ? Math.round((presentDays/monthAtt.length)*100) : null;

    // House rank this month
    const monthLogs = hvsLogs.filter(l=>{
      const d=l.created_at?new Date(l.created_at):null;
      return d&&d.getMonth()===now.getMonth()&&d.getFullYear()===now.getFullYear();
    });
    const houseScores = HOUSES.map(hx=>({
      id:hx.id,
      pts:monthLogs.filter(l=>(l.houseId||l.house_id)===hx.id)
        .reduce((s,l)=>{const gs=l.group_scores||l.scores||{};return s+Object.values(gs).filter(v=>typeof v==="number").reduce((a,b)=>a+b,0);},0)
    })).sort((a,b)=>b.pts-a.pts);
    const houseRank = houseScores.findIndex(x=>x.id===selStudent.houseId)+1;
    const housePts  = houseScores.find(x=>x.id===selStudent.houseId)?.pts||0;

    return (
      <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#0f172a 0%,#0d1f3c 50%,#0a1628 100%)",
        padding:"20px",fontFamily:"'Public Sans',sans-serif",direction:"ltr"}}>

        <button onClick={()=>setSelStudent(null)}
          style={{padding:"7px 16px",borderRadius:"10px",border:"1px solid rgba(255,255,255,0.15)",
            background:"transparent",color:"rgba(255,255,255,0.6)",fontSize:"0.75rem",
            cursor:"pointer",marginBottom:"18px",fontFamily:"inherit"}}>← Back</button>

        {/* ── Student Hero Card ── */}
        <div style={{background:`linear-gradient(135deg,${h.color}25,${h.color}08)`,
          border:`1px solid ${h.color}40`,borderRadius:"20px",padding:"22px 20px",marginBottom:"16px",
          display:"flex",alignItems:"center",gap:"18px",flexWrap:"wrap"}}>
          <div style={{width:"80px",height:"80px",borderRadius:"50%",overflow:"hidden",
            border:`3px solid ${h.color}70`,boxShadow:`0 0 20px ${h.color}30`,flexShrink:0}}>
            <img src={HOUSE_LOGOS[h.id]||logo} alt={h.nameEn}
              style={{width:"100%",height:"100%",objectFit:"cover"}}/>
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:"1.4rem",fontWeight:"900",color:W}}>{selStudent.name}</div>
            <div style={{fontSize:"0.7rem",color:"rgba(255,255,255,0.5)",marginTop:"3px"}}>
              Father: {selStudent.fatherName||"—"} &nbsp;|&nbsp; Code: {selStudent.studentCode||"—"}
            </div>
            <div style={{display:"flex",gap:"8px",marginTop:"8px",flexWrap:"wrap"}}>
              <span style={{background:`${h.color}20`,border:`1px solid ${h.color}50`,
                borderRadius:"20px",padding:"3px 12px",fontSize:"0.65rem",fontWeight:"700",color:h.color}}>
                {h.nameEn} House
              </span>
              <span style={{background:"rgba(255,255,255,0.08)",borderRadius:"20px",
                padding:"3px 12px",fontSize:"0.65rem",color:"rgba(255,255,255,0.6)"}}>
                {selStudent.grade}
              </span>
            </div>
          </div>
          {houseRank>0&&(
            <div style={{textAlign:"center",flexShrink:0}}>
              <div style={{fontSize:"2rem"}}>{houseRank===1?"🥇":houseRank===2?"🥈":houseRank===3?"🥉":"#"+houseRank}</div>
              <div style={{fontSize:"0.6rem",color:"rgba(255,255,255,0.35)"}}>House Rank</div>
              <div style={{fontSize:"0.75rem",fontWeight:"800",color:h.color}}>{housePts} pts</div>
            </div>
          )}
        </div>

        {/* ── Summary Stats ── */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"10px",marginBottom:"16px"}}>
          {[
            {icon:"📊",val:`${avgPct}%`,label:"Academic Avg",col:gradeColor(avgPct),show:sRes.length>0},
            {icon:"🎯",val:evalPct!==null?`${evalPct}%`:"—",label:"Character Score",col:evalPct!==null?gradeColor(evalPct):"rgba(255,255,255,0.3)",show:true},
            {icon:"✅",val:attPct!==null?`${attPct}%`:"—",label:"Attendance",col:attPct!==null?gradeColor(attPct):"rgba(255,255,255,0.3)",show:true},
            {icon:"💰",val:pending.length>0?`⚠️ ${pending.length}`:"✅ Clear",label:"Fee Status",col:pending.length>0?"#f87171":"#4ade80",show:true},
          ].filter(x=>x.show).map((x,i)=>(
            <div key={i} style={{...glass,padding:"14px",textAlign:"center"}}>
              <div style={{fontSize:"1.3rem",marginBottom:"4px"}}>{x.icon}</div>
              <div style={{fontSize:"1rem",fontWeight:"900",color:x.col}}>{x.val}</div>
              <div style={{fontSize:"0.55rem",color:"rgba(255,255,255,0.35)",marginTop:"2px"}}>{x.label}</div>
            </div>
          ))}
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px",marginBottom:"14px"}}>

          {/* Results */}
          <div style={{...glass,padding:"16px"}}>
            <div style={{fontSize:"0.8rem",fontWeight:"800",color:G,marginBottom:"12px"}}>📚 Subject Results</div>
            {sRes.length===0&&<div style={{textAlign:"center",color:"rgba(255,255,255,0.25)",padding:"20px",fontSize:"0.7rem"}}>No results yet</div>}
            {sRes.map(r=>(
              <div key={r.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",
                marginBottom:"7px",padding:"7px 10px",background:"rgba(255,255,255,0.04)",borderRadius:"8px"}}>
                <span style={{fontSize:"0.68rem",fontWeight:"600",color:W}}>{r.subject}</span>
                <div style={{display:"flex",gap:"8px",alignItems:"center"}}>
                  <span style={{fontSize:"0.65rem",color:"rgba(255,255,255,0.4)"}}>{r.obtained||0}/{r.total||100}</span>
                  <span style={{fontSize:"0.68rem",fontWeight:"800",color:gradeColor(r.percentage||0)}}>{r.grade||grade(r.percentage||0)}</span>
                </div>
              </div>
            ))}
            {sRes.length>0&&(
              <div style={{marginTop:"10px",padding:"8px 10px",background:`${gradeColor(avgPct)}12`,
                border:`1px solid ${gradeColor(avgPct)}30`,borderRadius:"8px",
                display:"flex",justifyContent:"space-between"}}>
                <span style={{fontSize:"0.65rem",color:"rgba(255,255,255,0.5)"}}>Overall Average</span>
                <span style={{fontSize:"0.75rem",fontWeight:"900",color:gradeColor(avgPct)}}>{avgPct}% — {grade(avgPct)}</span>
              </div>
            )}
          </div>

          {/* Fees */}
          <div style={{...glass,padding:"16px"}}>
            <div style={{fontSize:"0.8rem",fontWeight:"800",color:G,marginBottom:"12px"}}>💰 Fee Status</div>
            {pending.length>0&&(
              <div style={{background:"rgba(248,113,113,0.1)",border:"1px solid rgba(248,113,113,0.25)",
                borderRadius:"10px",padding:"10px 12px",marginBottom:"10px"}}>
                <div style={{fontSize:"0.65rem",fontWeight:"700",color:"#f87171",marginBottom:"4px"}}>
                  ⚠️ {pending.length} Outstanding Fee{pending.length>1?"s":""}
                </div>
                <div style={{fontSize:"1.1rem",fontWeight:"900",color:"#f87171"}}>
                  Rs. {pending.reduce((s,f)=>s+(f.amount||0),0).toLocaleString()}
                </div>
              </div>
            )}
            {paid.length===0&&pending.length===0&&(
              <div style={{textAlign:"center",color:"rgba(255,255,255,0.25)",padding:"20px",fontSize:"0.7rem"}}>No fee records</div>
            )}
            {paid.slice(0,4).map(f=>(
              <div key={f.id} style={{display:"flex",justifyContent:"space-between",marginBottom:"6px",
                padding:"6px 10px",background:"rgba(74,222,128,0.07)",borderRadius:"8px",
                border:"1px solid rgba(74,222,128,0.12)"}}>
                <span style={{fontSize:"0.62rem",color:"#4ade80"}}>✅ {f.month||f.type||"Fee"}</span>
                <span style={{fontSize:"0.62rem",fontWeight:"700",color:"#4ade80"}}>Rs. {(f.amount||0).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Character Evaluation */}
        {latestEval&&(
          <div style={{...glass,padding:"16px",marginBottom:"14px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"14px"}}>
              <div style={{fontSize:"0.8rem",fontWeight:"800",color:G}}>🎯 Character Assessment</div>
              <div style={{display:"flex",gap:"10px",alignItems:"center"}}>
                <span style={{fontSize:"0.62rem",color:"rgba(255,255,255,0.35)"}}>{latestEval.month}</span>
                <span style={{fontWeight:"900",fontSize:"0.85rem",color:gradeColor(evalPct)}}>{evalPct}%</span>
                <span style={{padding:"3px 10px",borderRadius:"20px",fontSize:"0.62rem",fontWeight:"800",
                  background:gradeColor(evalPct)+"20",color:gradeColor(evalPct),
                  border:`1px solid ${gradeColor(evalPct)}40`}}>
                  {evalPct>=70?"Excellent":evalPct>=50?"Good":"Needs Attention"}
                </span>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"8px"}}>
              {SCALE_LABELS.map(sc=>{
                const val=Number((latestEval.ratings||{})[sc.id]||0);
                return (
                  <div key={sc.id} style={{textAlign:"center",background:"rgba(255,255,255,0.04)",
                    borderRadius:"10px",padding:"8px 4px",border:`1px solid ${sc.color}20`}}>
                    <div style={{fontSize:"1rem",marginBottom:"3px"}}>{sc.icon}</div>
                    <div style={{fontSize:"0.55rem",color:"rgba(255,255,255,0.45)",marginBottom:"4px"}}>{sc.en}</div>
                    <div style={{display:"flex",gap:"2px",justifyContent:"center",marginBottom:"3px"}}>
                      {[1,2,3,4,5].map(i=>(
                        <div key={i} style={{width:"7px",height:"7px",borderRadius:"50%",
                          background:i<=val?sc.color:"rgba(255,255,255,0.1)"}}/>
                      ))}
                    </div>
                    <div style={{fontSize:"0.68rem",fontWeight:"800",color:val>=4?"#4ade80":val>=3?"#fbbf24":"#f87171"}}>
                      {val}/5
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* History of evaluations */}
        {stuEvals.length>1&&(
          <div style={{...glass,padding:"16px"}}>
            <div style={{fontSize:"0.8rem",fontWeight:"800",color:G,marginBottom:"12px"}}>📈 Progress History</div>
            <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
              {stuEvals.slice(0,6).map((e,i)=>{
                const p=Math.round(Number(e.overall||0));
                const prev=stuEvals[i+1]?Math.round(Number(stuEvals[i+1].overall||0)):null;
                const diff=prev!==null?p-prev:null;
                return (
                  <div key={i} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",
                    borderRadius:"10px",padding:"10px 14px",textAlign:"center",minWidth:"90px"}}>
                    <div style={{fontSize:"0.58rem",color:"rgba(255,255,255,0.35)",marginBottom:"4px"}}>{e.month}</div>
                    <div style={{fontSize:"1rem",fontWeight:"900",color:gradeColor(p)}}>{p}%</div>
                    {diff!==null&&(
                      <div style={{fontSize:"0.6rem",fontWeight:"700",
                        color:diff>0?"#4ade80":diff<0?"#f87171":"rgba(255,255,255,0.3)"}}>
                        {diff>0?`↑+${diff}`:diff<0?`↓${diff}`:"—"}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Search View ──
  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#0f172a 0%,#0d1f3c 50%,#0a1628 100%)",
      padding:"20px",fontFamily:"'Public Sans',sans-serif",direction:"ltr"}}>

      {/* Header */}
      <div style={{display:"flex",alignItems:"center",gap:"14px",marginBottom:"24px"}}>
        <div style={{width:"52px",height:"52px",borderRadius:"16px",overflow:"hidden",
          boxShadow:"0 4px 16px rgba(212,175,55,0.3)"}}>
          <img src={logo} alt="AII" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
        </div>
        <div>
          <h2 style={{margin:0,fontSize:"1.3rem",fontWeight:"900",color:W}}>Parent Portal</h2>
          <p style={{margin:0,fontSize:"0.68rem",color:"rgba(212,175,55,0.7)"}}>
            Ameen Islamic Institute — Student Progress View
          </p>
        </div>
      </div>

      {/* Search */}
      <div style={{position:"relative",marginBottom:"24px"}}>
        <input value={q} onChange={e=>setQ(e.target.value)}
          placeholder="🔍 Search by student name or admission number..."
          style={{width:"100%",padding:"14px 18px",borderRadius:"14px",
            border:`1px solid ${G}40`,background:"rgba(255,255,255,0.06)",
            color:W,fontSize:"0.85rem",fontFamily:"inherit",outline:"none",
            boxSizing:"border-box",colorScheme:"dark"}}/>
      </div>

      {/* Results grid */}
      {q&&(
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:"14px"}}>
          {filtered.map(s=>{
            const h=HOUSES.find(x=>x.id===s.houseId)||HOUSES[0];
            const sRes=results.filter(r=>r.studentId===s.id);
            const avg=sRes.length?Math.round(sRes.reduce((sum,r)=>sum+(r.percentage||0),0)/sRes.length):0;
            const latestE=evalScales.filter(e=>e.student_id===s.id).sort((a,b)=>(b.month||"").localeCompare(a.month||""))[0];
            const evalP=latestE?Math.round(Number(latestE.overall||0)):null;
            return (
              <div key={s.id} onClick={()=>setSelStudent(s)}
                style={{...glass,padding:"16px",cursor:"pointer",
                  border:`1px solid ${h.color}30`,transition:"all 0.2s"}}
                onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.1)"}
                onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.06)"}>
                <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"12px"}}>
                  <div style={{width:"46px",height:"46px",borderRadius:"50%",overflow:"hidden",
                    border:`2px solid ${h.color}50`,flexShrink:0}}>
                    <img src={HOUSE_LOGOS[h.id]||logo} alt={h.nameEn}
                      style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                  </div>
                  <div>
                    <div style={{fontSize:"0.88rem",fontWeight:"800",color:W}}>{s.name}</div>
                    <div style={{fontSize:"0.62rem",color:h.color}}>{h.nameEn} House · {s.grade}</div>
                  </div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px"}}>
                  {sRes.length>0&&(
                    <div style={{background:"rgba(255,255,255,0.05)",borderRadius:"8px",padding:"7px",textAlign:"center"}}>
                      <div style={{fontSize:"0.75rem",fontWeight:"900",color:gradeColor(avg)}}>{avg}%</div>
                      <div style={{fontSize:"0.52rem",color:"rgba(255,255,255,0.35)"}}>Academic</div>
                    </div>
                  )}
                  {evalP!==null&&(
                    <div style={{background:"rgba(255,255,255,0.05)",borderRadius:"8px",padding:"7px",textAlign:"center"}}>
                      <div style={{fontSize:"0.75rem",fontWeight:"900",color:gradeColor(evalP)}}>{evalP}%</div>
                      <div style={{fontSize:"0.52rem",color:"rgba(255,255,255,0.35)"}}>Character</div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {filtered.length===0&&(
            <div style={{...glass,textAlign:"center",color:"rgba(255,255,255,0.3)",
              padding:"50px",gridColumn:"1/-1",fontSize:"0.8rem"}}>
              "{q}" — کوئی نتیجہ نہیں
            </div>
          )}
        </div>
      )}

      {!q&&(
        <div style={{...glass,textAlign:"center",padding:"60px 20px"}}>
          <div style={{fontSize:"3.5rem",marginBottom:"14px"}}>👪</div>
          <div style={{fontSize:"1rem",fontWeight:"800",color:W,marginBottom:"8px"}}>
            Welcome to Parent Portal
          </div>
          <div style={{fontSize:"0.7rem",color:"rgba(255,255,255,0.4)"}}>
            اپنے بچے کا نام یا داخلہ نمبر لکھیں
          </div>
        </div>
      )}
    </div>
  );
}
