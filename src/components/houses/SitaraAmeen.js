/* eslint-disable */
import { useState, useEffect, useMemo } from "react";
import { getData } from "../../supabase";
import letterhead from "../../assets/letterhead.png";
import { C, S, HOUSES } from "../../constants";

const G = C.gold; const W = C.white;

const MERIT = [
  { id:"position",   labelUr:"Annual Exam Position", labelEn:"Exam Position",      max:30, icon:"🎓", auto:true,
    desc:"1st=30 · 2nd=25 · 3rd=20 · 4th=15 · 5th=10 · 6th+=5" },
  { id:"attendance", labelUr:"Attendance 95%+",             labelEn:"Attendance",         max:20, icon:"✅", auto:true,
    desc:"95%+=20 · pro-rata below 95%" },
  { id:"hvs",        labelUr:"HVS Points",            labelEn:"HVS Points Collected",max:20, icon:"🏅", auto:false,
    desc:"Highest HVS = 20 · Pending pro-rata" },
  { id:"spiritual",  labelUr:"Namaz / Spiritual Tracker",    labelEn:"Spiritual Tracker",  max:15, icon:"📿", auto:false,
    desc:"Consistent Namaz and training = 15" },
  { id:"stage",      labelUr:"Stage Participation",             labelEn:"Stage Participation",max:10, icon:"🎤", auto:false,
    desc:"Speech, Nasheed, Presentation, Quiz" },
  { id:"role",       labelUr:"Captain / Monitor Bonus",   labelEn:"Captain/Monitor",    max:5,  icon:"👑", auto:true,
    desc:"Any leadership role = 5" },
];

const COMMITTEE = [
  { title:"Principal", titleEn:"Principal" },
  { title:"Deputy Principal", titleEn:"Vice Principal" },
  { title:"HM Abu Bakr", titleEn:"HM Abu Bakr" },
  { title:"HM Umar",    titleEn:"HM Umar"     },
  { title:"HM Uthman",  titleEn:"HM Uthman"   },
  { title:"HM Ali",    titleEn:"HM Ali"       },
];

const glass  = { background:"rgba(255,255,255,0.07)", backdropFilter:"blur(20px)", borderRadius:"18px", border:"1px solid rgba(255,255,255,0.1)", padding:"20px" };
const glassS = { background:"rgba(255,255,255,0.05)", borderRadius:"14px", border:"1px solid rgba(255,255,255,0.08)", padding:"14px" };

function positionPts(pos){ return pos===1?30:pos===2?25:pos===3?20:pos===4?15:pos===5?10:5; }
function gradeColor(t){ return t>=80?"#4ade80":t>=60?G:t>=40?"#fb923c":"#f87171"; }
function ordinal(n){ const s=["th","st","nd","rd"]; const v=n%100; return n+(s[(v-20)%10]||s[v]||s[0]); }

export default function SitaraAmeen({ addData, students=[] }) {
  const [selYear,    setSelYear]    = useState(new Date().getFullYear());
  const [results,    setResults]    = useState([]);
  const [attLogs,    setAttLogs]    = useState([]);
  const [lroles,     setLroles]     = useState([]);
  const [winners,    setWinners]    = useState([]);   // sitara_ameen table
  const [overrides,  setOverrides]  = useState({});   // {studentId: {catId: number}}
  const [editId,     setEditId]     = useState(null); // student being edited
  const [editForm,   setEditForm]   = useState({});
  const [finalizing, setFinalizing] = useState(false);
  const [showCert,   setShowCert]   = useState(false);
  const [certStudent,setCertStudent]= useState(null);

  useEffect(()=>{
    getData("results").then(d=>{ if(d&&!d.error) setResults(d); });
    getData("attendance").then(d=>{ if(d&&!d.error) setAttLogs(d); });
    getData("leadership_roles").then(d=>{ if(d&&!d.error) setLroles(d); });
    getData("sitara_ameen").then(d=>{ if(d&&!d.error) setWinners(d); });
  },[]);

  // ── Auto-score helpers ────────────────────────────────────────
  const autoScores = useMemo(()=>{
    const map={};
    students.forEach(st=>{
      const sid=st.id;
      const scores={};

      // 1. Exam Position (within same grade)
      const stuRes=results.filter(r=>(r.studentId||r.student_id)===sid&&r.percentage!=null);
      const bestPct=stuRes.length?Math.max(...stuRes.map(r=>r.percentage||0)):0;
      const grademates=students.filter(s=>s.grade===st.grade);
      const ranked=[...grademates].map(s=>{
        const sRes=results.filter(r=>(r.studentId||r.student_id)===s.id);
        return {id:s.id,pct:sRes.length?Math.max(...sRes.map(r=>r.percentage||0)):0};
      }).sort((a,b)=>b.pct-a.pct);
      const pos=ranked.findIndex(r=>r.id===sid)+1;
      scores.position=bestPct>0?positionPts(pos):0;
      scores._pos=pos;
      scores._pct=bestPct;

      // 2. Attendance Score
      const stuAtt=attLogs.filter(a=>(a.studentId||a.student_id)===sid);
      const present=stuAtt.filter(a=>a.status==="present").length;
      const attPct=stuAtt.length?present/stuAtt.length:0;
      scores.attendance=stuAtt.length?Math.round(Math.min(1,attPct/0.95)*20):0;
      scores._attPct=Math.round(attPct*100);

      // 3–5. HVS, Spiritual, Stage → manual (default 0, overridable)
      scores.hvs=0; scores.spiritual=0; scores.stage=0;

      // 6. Role Bonus
      const hasRole=lroles.some(r=>r.holder_name===st.name&&r.week!=="assign"&&r.week!=="");
      scores.role=hasRole?5:0;

      map[sid]=scores;
    });
    return map;
  },[students,results,attLogs,lroles]);

  // Effective score for a student (override takes priority over auto)
  const effScore=(sid,catId)=>{
    const ov=overrides[sid]?.[catId];
    return ov!=null?ov:(autoScores[sid]?.[catId]||0);
  };
  const totalScore=(sid)=>MERIT.reduce((s,m)=>s+Math.min(m.max,effScore(sid,m.id)),0);

  // Ranked list
  const ranked=useMemo(()=>{
    return [...students]
      .map(st=>({...st,total:totalScore(st.id)}))
      .sort((a,b)=>b.total-a.total)
      .map((st,i)=>({...st,rank:i+1}));
  },[students,overrides,autoScores]);

  const thisYearWinner=winners.find(w=>w.year===selYear);
  const topRanked=ranked[0];

  // ── Open edit panel ───────────────────────────────────────────
  const openEdit=(st)=>{
    const sid=st.id;
    const form={};
    MERIT.forEach(m=>{
      form[m.id]=overrides[sid]?.[m.id]??autoScores[sid]?.[m.id]??0;
    });
    setEditForm(form);
    setEditId(sid);
  };
  const saveOverride=()=>{
    setOverrides(prev=>({...prev,[editId]:{...editForm}}));
    setEditId(null);
  };

  // ── Finalize Winner ───────────────────────────────────────────
  const finalizeWinner=async(st)=>{
    setFinalizing(true);
    const scores={};
    MERIT.forEach(m=>{ scores[m.id]=effScore(st.id,m.id); });
    const rec={year:selYear,student_id:st.id,student_name:st.name,house_id:st.houseId,
               grade:st.grade,total:totalScore(st.id),...scores,finalized:true,
               finalized_at:new Date().toISOString()};
    await addData("sitara_ameen",rec);
    setWinners(prev=>[...prev.filter(w=>w.year!==selYear),rec]);
    setFinalizing(false);
  };

  // ── Certificate Print ─────────────────────────────────────────
  const printCertificate=(st)=>{
    const hi=HOUSES.find(h=>h.id===st?.houseId)||HOUSES[0];
    const sigLines=COMMITTEE.map(m=>`
      <div style="text-align:center;min-width:120px">
        <div style="border-top:1.5px solid #0f172a;padding-top:5px;font-size:11px">${m.title}<br/><span style="color:#64748b">${m.titleEn}</span></div>
      </div>`).join("");
    const w=window.open("","_blank","width=900,height=750");
    w.document.write(`<!DOCTYPE html><html dir="ltr"><body style="font-family:serif;padding:24px;direction:rtl;background:#fffdf8;color:#1e293b">
      <img src="${letterhead}" style="width:100%;max-width:700px;display:block;margin:0 auto 16px" onerror="this.style.display='none'"/>
      <div style="border:4px double ${G};border-radius:20px;padding:32px;max-width:680px;margin:0 auto;background:#fff;position:relative">
        <div style="position:absolute;top:-18px;left:50%;transform:translateX(-50%);background:#fffdf8;padding:0 16px;font-size:1.6rem">🌟</div>
        <div style="text-align:center;margin-bottom:20px">
          <div style="font-size:0.9rem;color:#94a3b8;letter-spacing:0.15em">Bismillah ir-Rahman ir-Raheem</div>
          <div style="font-size:1.6rem;font-weight:900;color:${G};margin:10px 0 4px;letter-spacing:0.05em">Sitara Ameen Award</div>
          <div style="font-size:1.1rem;font-weight:700;color:#1e293b">Sitara-e-Ameen Award</div>
          <div style="font-size:0.8rem;color:#64748b;margin-top:4px">Ameen Islamic Institute's highest individual honor</div>
          <div style="font-size:0.72rem;color:#94a3b8">Ameen Islamic Institute's Highest Individual Award — ${selYear}</div>
        </div>
        <div style="text-align:center;margin:24px 0;padding:20px;background:#fef3c7;border-radius:12px;border:2px dashed ${G}">
          <div style="font-size:0.75rem;color:#64748b;margin-bottom:8px">This honour is awarded</div>
          <div style="font-size:0.75rem;color:#64748b;margin-bottom:6px">This Award is Presented to</div>
          <div style="font-size:1.8rem;font-weight:900;color:#1e293b;border-bottom:2px solid ${G};display:inline-block;min-width:300px;padding-bottom:6px;margin:8px 0">
            ${st?st.name:"______________________________"}
          </div>
          ${st?`<div style="margin-top:8px;font-size:0.78rem;color:#475569">${st.grade} · ${hi.nameEn} House · Merit Score: ${totalScore(st.id)}/100</div>`:""}
        </div>
        <div style="font-size:0.72rem;color:#64748b;text-align:center;margin-bottom:24px;line-height:1.8">
          Best Academic Performance, Best Attendance, HVS Performance,<br/>
          Spiritual Training, Stage Participation and Leadership Recognition<br/>
          <em>In recognition of Academic Excellence, Attendance, HVS Performance, Spiritual Development, Stage Participation & Leadership</em>
        </div>
        <div style="display:flex;justify-content:space-around;flex-wrap:wrap;gap:16px;margin-top:8px">${sigLines}</div>
        <div style="text-align:center;margin-top:20px;font-size:11px;color:#94a3b8">
          Date: ${new Date().toLocaleDateString("en-PK",{year:"numeric",month:"long",day:"numeric"})}
        </div>
      </div>
      <script>window.print();window.close();<\/script>
    </body></html>`);
  };

  const years=Array.from({length:5},(_,i)=>new Date().getFullYear()-i);

  return (
    <div style={{background:`linear-gradient(135deg,${C.navyDark} 0%,${C.navyMid} 60%,${C.navy} 100%)`,minHeight:"100vh",padding:"20px",direction:"ltr"}}>

      {/* ── Header ── */}
      <div style={{...glass,marginBottom:"18px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"12px"}}>
          <div>
            <div style={{fontSize:"1.4rem",fontWeight:"900",color:G}}>🌟 Sitara Ameen Award</div>
            <div style={{fontSize:"0.72rem",color:"rgba(255,255,255,0.45)",marginTop:"3px"}}>Sitara-e-Ameen Award — Ameen Islamic Institute's highest individual honor</div>
          </div>
          <div style={{display:"flex",gap:"10px",alignItems:"center",flexWrap:"wrap"}}>
            <select value={selYear} onChange={e=>setSelYear(+e.target.value)}
              style={{...S.inpSm,background:"rgba(255,255,255,0.07)",color:W,border:`1px solid ${G}40`,width:"100px"}}>
              {years.map(y=><option key={y} value={y} style={{background:C.navyDark}}>{y}</option>)}
            </select>
            <button onClick={()=>printCertificate(thisYearWinner?students.find(s=>s.id===thisYearWinner.student_id):topRanked)}
              style={{...S.addBtn,padding:"9px 18px",fontSize:"0.75rem"}}>
              🖨️ Certificate Print
            </button>
          </div>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 300px",gap:"18px",alignItems:"start"}}>

        {/* ── Left: Leaderboard ── */}
        <div>
          {/* Winner Banner */}
          {thisYearWinner&&(()=>{
            const ws=students.find(s=>s.id===thisYearWinner.student_id);
            const hi=HOUSES.find(h=>h.id===thisYearWinner.house_id)||HOUSES[0];
            return (
              <div style={{marginBottom:"16px",padding:"18px 22px",borderRadius:"16px",background:`linear-gradient(135deg,${G}22,${G}08)`,border:`2px solid ${G}55`,display:"flex",alignItems:"center",gap:"16px"}}>
                <span style={{fontSize:"2.5rem"}}>🌟</span>
                <div style={{flex:1}}>
                  <div style={{fontSize:"0.68rem",color:"rgba(255,255,255,0.5)",marginBottom:"4px"}}>{selYear} Winner — Sitara Ameen Award</div>
                  <div style={{fontSize:"1.2rem",fontWeight:"900",color:G}}>{ws?.name||thisYearWinner.student_name}</div>
                  <div style={{fontSize:"0.7rem",color:"rgba(255,255,255,0.5)",marginTop:"3px"}}>{ws?.grade||""} · {hi.name} · Merit: {thisYearWinner.total}/100</div>
                </div>
                <span style={{fontSize:"2rem"}}>{hi.emoji}</span>
              </div>
            );
          })()}

          {/* Leaderboard Table */}
          <div style={glass}>
            <div style={{fontSize:"0.85rem",fontWeight:"700",color:G,marginBottom:"14px"}}>📊 Merit Leaderboard — {selYear}</div>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",minWidth:"700px"}}>
                <thead>
                  <tr>
                    {["Rank","Student","House",
                      "🎓/30","✅/20","🏅/20","📿/15","🎤/10","👑/5",
                      "Total/100",""].map((h,i)=>(
                      <th key={i} style={{padding:"9px 10px",textAlign:"left",fontSize:"0.62rem",color:"rgba(255,255,255,0.45)",borderBottom:"2px solid rgba(255,255,255,0.07)",fontWeight:"700",whiteSpace:"nowrap"}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ranked.map((st,i)=>{
                    const isTop=i===0;
                    const isWinner=thisYearWinner?.student_id===st.id;
                    const hi=HOUSES.find(h=>h.id===st.houseId)||HOUSES[0];
                    const tot=totalScore(st.id);
                    const tc=gradeColor(tot);
                    const auto=autoScores[st.id]||{};
                    return (
                      <tr key={st.id}
                        style={{borderBottom:"1px solid rgba(255,255,255,0.05)",
                          background:isWinner?`${G}12`:isTop?"rgba(255,255,255,0.04)":"transparent",
                          outline:isWinner?`2px solid ${G}44`:"none"}}>
                        <td style={{padding:"10px 10px",textAlign:"center",fontWeight:"900",fontSize:"0.85rem",color:i===0?G:i===1?"#94a3b8":i===2?"#cd7f32":"rgba(255,255,255,0.35)"}}>
                          {i===0?"🥇":i===1?"🥈":i===2?"🥉":i+1}
                        </td>
                        <td style={{padding:"10px 10px"}}>
                          <div style={{fontSize:"0.78rem",fontWeight:"700",color:isWinner?G:W}}>{st.name} {isWinner&&"🌟"}</div>
                          <div style={{fontSize:"0.6rem",color:"rgba(255,255,255,0.35)"}}>{st.grade}</div>
                        </td>
                        <td style={{padding:"10px 10px"}}>
                          <span style={{background:hi.color+"22",color:hi.color,borderRadius:"6px",padding:"2px 8px",fontSize:"0.62rem",fontWeight:"700"}}>{hi.emoji} {hi.nameEn}</span>
                        </td>
                        {MERIT.map(m=>{
                          const v=effScore(st.id,m.id);
                          const isAuto=overrides[st.id]?.[m.id]==null;
                          return (
                            <td key={m.id} style={{padding:"10px 8px",textAlign:"center"}}>
                              <span style={{fontSize:"0.78rem",fontWeight:"700",color:v>=m.max*0.8?"#4ade80":v>=m.max*0.5?G:"rgba(255,255,255,0.4)"}}>{v}</span>
                              {!isAuto&&<span style={{fontSize:"0.52rem",color:"rgba(255,183,11,0.6)",display:"block"}}>Edit</span>}
                            </td>
                          );
                        })}
                        <td style={{padding:"10px 10px",textAlign:"center"}}>
                          <div style={{fontSize:"1rem",fontWeight:"900",color:tc}}>{tot}</div>
                          <div style={{fontSize:"0.52rem",color:"rgba(255,255,255,0.3)"}}>/100</div>
                        </td>
                        <td style={{padding:"8px 6px"}}>
                          <div style={{display:"flex",flexDirection:"column",gap:"4px"}}>
                            <button onClick={()=>openEdit(st)}
                              style={{padding:"4px 8px",borderRadius:"6px",border:`1px solid ${G}44`,background:`${G}12`,color:G,fontSize:"0.6rem",fontWeight:"700",cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>
                              ✏️ Edit
                            </button>
                            {!thisYearWinner&&i===0&&(
                              <button onClick={()=>finalizeWinner(st)} disabled={finalizing}
                                style={{padding:"4px 8px",borderRadius:"6px",border:"none",background:`linear-gradient(135deg,${G},${C.goldDark})`,color:W,fontSize:"0.6rem",fontWeight:"800",cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap",opacity:finalizing?0.6:1}}>
                                ✅ Final
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {students.length===0&&(
                    <tr><td colSpan={11} style={{textAlign:"center",padding:"40px",color:"rgba(255,255,255,0.2)"}}>Any Student No</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ── Right Panel ── */}
        <div style={{display:"flex",flexDirection:"column",gap:"14px"}}>

          {/* Merit Breakdown */}
          <div style={glass}>
            <div style={{fontSize:"0.78rem",fontWeight:"700",color:G,marginBottom:"12px"}}>💯 Merit Breakdown</div>
            {MERIT.map(m=>(
              <div key={m.id} style={{marginBottom:"12px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"4px"}}>
                  <div style={{fontSize:"0.7rem",color:W}}>{m.icon} {m.labelUr}</div>
                  <div style={{fontSize:"0.72rem",fontWeight:"800",color:G}}>{m.max}</div>
                </div>
                <div style={{fontSize:"0.58rem",color:"rgba(255,255,255,0.3)",marginBottom:"3px"}}>{m.desc}</div>
                <div style={{height:"3px",background:"rgba(255,255,255,0.07)",borderRadius:"2px"}}>
                  <div style={{width:`${(m.max/100)*100}%`,height:"100%",background:`${G}55`,borderRadius:"2px"}}/>
                </div>
              </div>
            ))}
            <div style={{borderTop:"1px solid rgba(255,255,255,0.1)",paddingTop:"8px",display:"flex",justifyContent:"space-between",fontSize:"0.8rem",fontWeight:"800"}}>
              <span style={{color:"rgba(255,255,255,0.6)"}}>Total</span>
              <span style={{color:G}}>100</span>
            </div>
          </div>

          {/* Selection Committee */}
          <div style={glass}>
            <div style={{fontSize:"0.78rem",fontWeight:"700",color:G,marginBottom:"12px"}}>👥 Election Committee</div>
            {COMMITTEE.map((m,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"8px",padding:"8px 10px",borderRadius:"8px",background:"rgba(255,255,255,0.04)"}}>
                <div style={{width:"28px",height:"28px",borderRadius:"7px",background:i<2?`${G}22`:`${HOUSES[i-2]?.color}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.8rem",flexShrink:0}}>
                  {i<2?"🎓":HOUSES[i-2]?.emoji}
                </div>
                <div>
                  <div style={{fontSize:"0.72rem",fontWeight:"600",color:W}}>{m.title}</div>
                  <div style={{fontSize:"0.58rem",color:"rgba(255,255,255,0.35)"}}>{m.titleEn}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Top 3 quick view */}
          {ranked.length>0&&(
            <div style={glass}>
              <div style={{fontSize:"0.78rem",fontWeight:"700",color:G,marginBottom:"12px"}}>🏆 Top 3</div>
              {ranked.slice(0,3).map((st,i)=>{
                const hi=HOUSES.find(h=>h.id===st.houseId)||HOUSES[0];
                const medals=["🥇","🥈","🥉"];
                return (
                  <div key={st.id} style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"8px",padding:"9px 10px",borderRadius:"10px",background:i===0?`${G}12`:"rgba(255,255,255,0.04)",border:i===0?`1px solid ${G}33`:"1px solid transparent"}}>
                    <span style={{fontSize:"1.2rem"}}>{medals[i]}</span>
                    <div style={{flex:1}}>
                      <div style={{fontSize:"0.73rem",fontWeight:"700",color:i===0?G:W}}>{st.name}</div>
                      <div style={{fontSize:"0.6rem",color:"rgba(255,255,255,0.35)"}}>{st.grade} · {hi.nameEn}</div>
                    </div>
                    <div style={{fontSize:"0.88rem",fontWeight:"900",color:gradeColor(st.total)}}>{st.total}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Edit Override Modal ── */}
      {editId&&(()=>{
        const st=students.find(s=>s.id===editId);
        const auto=autoScores[editId]||{};
        return (
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,backdropFilter:"blur(6px)"}}
            onClick={e=>{if(e.target===e.currentTarget)setEditId(null);}}>
            <div style={{...glass,maxWidth:"440px",width:"90%",maxHeight:"85vh",overflowY:"auto"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
                <div style={{fontSize:"0.92rem",fontWeight:"700",color:G}}>✏️ Score Edit — {st?.name}</div>
                <button onClick={()=>setEditId(null)} style={{background:"none",border:"none",color:"rgba(255,255,255,0.5)",fontSize:"1.2rem",cursor:"pointer"}}>✕</button>
              </div>
              {MERIT.map(m=>(
                <div key={m.id} style={{marginBottom:"14px",padding:"12px",borderRadius:"10px",background:"rgba(255,255,255,0.04)"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"6px"}}>
                    <div>
                      <div style={{fontSize:"0.75rem",fontWeight:"700",color:W}}>{m.icon} {m.labelUr}</div>
                      <div style={{fontSize:"0.6rem",color:"rgba(255,255,255,0.35)"}}>Auto: {auto[m.id]??0} · Maximum: {m.max}</div>
                    </div>
                    {m.auto&&<span style={{fontSize:"0.58rem",background:"rgba(74,222,128,0.15)",color:"#4ade80",borderRadius:"6px",padding:"2px 7px"}}>Auto</span>}
                  </div>
                  <div style={{display:"flex",gap:"6px",alignItems:"center"}}>
                    <input type="number" min={0} max={m.max}
                      value={editForm[m.id]??auto[m.id]??0}
                      onChange={e=>setEditForm(p=>({...p,[m.id]:Math.min(m.max,Math.max(0,+e.target.value||0))}))}
                      style={{...S.inpSm,width:"70px",textAlign:"center",background:"rgba(255,255,255,0.07)",color:W,border:`1px solid ${G}40`}}/>
                    <div style={{flex:1,height:"6px",background:"rgba(255,255,255,0.07)",borderRadius:"3px",overflow:"hidden"}}>
                      <div style={{width:`${((editForm[m.id]??auto[m.id]??0)/m.max)*100}%`,height:"100%",background:G,borderRadius:"3px",transition:"width 0.2s"}}/>
                    </div>
                    <span style={{fontSize:"0.65rem",color:"rgba(255,255,255,0.4)",minWidth:"24px"}}>/{m.max}</span>
                  </div>
                </div>
              ))}
              <div style={{padding:"10px 12px",borderRadius:"10px",background:`${G}15`,border:`1px solid ${G}33`,textAlign:"center",marginBottom:"14px"}}>
                <span style={{fontSize:"0.7rem",color:"rgba(255,255,255,0.5)"}}>New Total: </span>
                <span style={{fontSize:"1.1rem",fontWeight:"900",color:G}}>{MERIT.reduce((s,m)=>s+Math.min(m.max,editForm[m.id]??auto[m.id]??0),0)}/100</span>
              </div>
              <div style={{display:"flex",gap:"10px"}}>
                <button onClick={saveOverride} style={{...S.saveBtn,flex:1,padding:"11px"}}>✔ Save</button>
                <button onClick={()=>{ setOverrides(p=>{ const n={...p}; delete n[editId]; return n; }); setEditId(null); }}
                  style={{padding:"11px 16px",borderRadius:"10px",border:"1px solid rgba(255,255,255,0.15)",background:"transparent",color:"rgba(255,255,255,0.5)",cursor:"pointer",fontFamily:"inherit",fontSize:"0.75rem"}}>
                  Reset
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
