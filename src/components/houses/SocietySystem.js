/* eslint-disable */
import { useState, useEffect } from "react";
import { toast } from "../../components/ui/Toast";
import { getData } from "../../supabase";
import { HOUSES } from "../../constants";
import letterhead from "../../assets/letterhead.png";

const PRINT_STYLE = `
@media print {
  body * { visibility: hidden !important; }
  #soc-print-area, #soc-print-area * { visibility: visible !important; }
  #soc-print-area { position:fixed !important; top:0; left:0; width:100%; background:white; padding:0; margin:0; }
  .no-print { display:none !important; }
  @page { margin:0; size:A4; }
}
`;

const SOCIETIES = [
  { id:"language", nameUr:"Language & Expression",      nameEn:"Language Club",   icon:"🗣️", leadHouse:"umar",    color:"#22c55e", bg:"rgba(34,197,94,0.1)"  },
  { id:"science",  nameUr:"Science & Reflection",       nameEn:"Science Group",   icon:"🔬", leadHouse:"",        color:"#60a5fa", bg:"rgba(96,165,250,0.1)" },
  { id:"art",      nameUr:"Art & Projects",   nameEn:"Art Society",     icon:"🎨", leadHouse:"uthman",  color:"#f59e0b", bg:"rgba(245,158,11,0.1)" },
  { id:"sports",   nameUr:"Sports & Fitness",       nameEn:"Sports Council",  icon:"⚽", leadHouse:"ali",     color:"#f87171", bg:"rgba(248,113,113,0.1)"},
  { id:"moral",    nameUr:"Ethics & Service",      nameEn:"Moral Circle",    icon:"🕊️", leadHouse:"abuBakr", color:"#a78bfa", bg:"rgba(167,139,250,0.1)"},
];
const MAX_PER_SOC = 12;
const now = new Date();
const thisMonth = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;

function SocietySystem({ addData, students=[], updateHousePoints }){
  const G="#d4af37"; const N="#0f172a"; const N2="#1e293b";
  const glass={background:"rgba(255,255,255,0.07)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:"16px"};
  const inp={padding:"8px 11px",borderRadius:"9px",border:"1px solid rgba(212,175,55,0.22)",background:"rgba(255,255,255,0.06)",color:"#f1f5f9",fontSize:"0.75rem",fontFamily:"'Public Sans',sans-serif",outline:"none",width:"100%",boxSizing:"border-box",colorScheme:"dark"};

  const [selSoc, setSelSoc]     = useState("language");
  const [filterMonth, setFilterMonth] = useState(thisMonth);
  const [activities, setActivities]   = useState([]);
  const [heads, setHeads]             = useState({language:"",science:"",art:"",sports:"",moral:""});
  const [members, setMembers]         = useState({language:"",science:"",art:"",sports:"",moral:""});
  const [showForm, setShowForm]       = useState(false);
  const [form, setForm]               = useState({date:new Date().toISOString().slice(0,10),activity:"",outcome:"",points:2,houseId:"abuBakr"});
  const [participants, setParticipants] = useState([]); // student ids

  // Students of selected house for participant dropdown
  const houseStudents = students.filter(s=>(s.houseId||s.house_id)===form.houseId);
  const toggleParticipant = (id) => setParticipants(prev=>prev.includes(id)?prev.filter(x=>x!==id):[...prev,id]);

  useEffect(()=>{
    getData("society_scores").then(rows=>{ if(rows?.length) setActivities(rows); }).catch(()=>{});
  },[]);

  const soc = SOCIETIES.find(s=>s.id===selSoc)||SOCIETIES[0];
  const leadInfo = HOUSES.find(h=>h.id===soc.leadHouse)||null;

  /* filtered entries for current society + selected month */
  const socEntries = activities.filter(a=>
    a.societyId===selSoc &&
    (a.date||"").startsWith(filterMonth)
  ).sort((a,b)=>(b.date||"").localeCompare(a.date||""));

  /* monthly pts per house (current society, selected month) */
  const socHousePts = {};
  HOUSES.forEach(h=>{ socHousePts[h.id]=0; });
  activities.filter(a=>a.societyId===selSoc&&(a.date||"").startsWith(filterMonth))
    .forEach(a=>{ socHousePts[a.houseId]=(socHousePts[a.houseId]||0)+(a.points||0); });

  /* monthly pts per house across ALL societies */
  const totalHousePts = {};
  HOUSES.forEach(h=>{ totalHousePts[h.id]=0; });
  activities.filter(a=>(a.date||"").startsWith(filterMonth))
    .forEach(a=>{ totalHousePts[a.houseId]=(totalHousePts[a.houseId]||0)+(a.points||0); });

  const socMonthTotal = socEntries.reduce((s,a)=>s+(a.points||0),0);
  const remaining = Math.max(0, MAX_PER_SOC - socMonthTotal);

  const addEntry = async()=>{
    if(!form.activity.trim())return;
    const maxAllowed = Math.min(form.points, remaining);
    if(maxAllowed<=0){ toast.warning(`اس ماہ زیادہ سے زیادہ ${MAX_PER_SOC} پوائنٹس جائز ہیں`); return; }
    const participantNames = participants.map(id=>students.find(s=>s.id===id)?.name||id);
    const entry={...form, points:Number(maxAllowed), societyId:selSoc,
      participant_ids: participants, participant_names: participantNames,
      participant_count: participants.length };
    await addData("society_scores", entry);
    setActivities(prev=>[...prev,{...entry,id:Date.now()}]);
    // Link to house points
    if(updateHousePoints && maxAllowed>0){
      try{ await updateHousePoints(form.houseId, maxAllowed); } catch(e){}
    }
    setShowForm(false);
    setParticipants([]);
    setForm({date:new Date().toISOString().slice(0,10),activity:"",outcome:"",points:2,houseId:"abuBakr"});
  };

  const doPrint=()=>{
    if(!document.getElementById("soc-print-style")){
      const s=document.createElement("style");s.id="soc-print-style";s.innerHTML=PRINT_STYLE;document.head.appendChild(s);
    }
    window.print();
  };

  return (
    <div style={{minHeight:"100vh",background:`linear-gradient(160deg,${N} 0%,#0d1f3c 50%,#0a1628 100%)`,padding:"24px 20px",fontFamily:"'Public Sans',sans-serif",direction:"ltr"}}>

      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"24px",flexWrap:"wrap",gap:"12px"}}>
        <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
          <div style={{width:"44px",height:"44px",borderRadius:"12px",background:`linear-gradient(135deg,${G},#b8960a)`,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 4px 20px rgba(212,175,55,0.4)`}}>
            <span className="material-symbols-rounded" style={{fontSize:"24px",color:N}}>groups</span>
          </div>
          <div>
            <h1 style={{margin:0,fontSize:"1.4rem",fontWeight:"800",color:"#f1f5f9"}}>Society System</h1>
            <p style={{margin:0,fontSize:"0.72rem",color:"rgba(212,175,55,0.7)"}}>Society System — 60 Marks Total (12 × 5)</p>
          </div>
        </div>
        <div style={{display:"flex",gap:"8px",alignItems:"center",flexWrap:"wrap"}}>
          <input type="month" value={filterMonth} onChange={e=>setFilterMonth(e.target.value)}
            style={{...inp,width:"140px",direction:"ltr",colorScheme:"dark"}}/>
          <button onClick={doPrint} style={{display:"flex",alignItems:"center",gap:"6px",padding:"9px 16px",borderRadius:"10px",border:"1px solid rgba(74,222,128,0.4)",background:"rgba(74,222,128,0.08)",color:"#4ade80",fontSize:"0.72rem",cursor:"pointer",fontFamily:"inherit",fontWeight:"700"}}>
            <span className="material-symbols-rounded" style={{fontSize:"16px"}}>print</span>Print
          </button>
        </div>
      </div>

      {/* ── Society Tabs ── */}
      <div style={{display:"flex",gap:"6px",marginBottom:"20px",flexWrap:"wrap"}}>
        {SOCIETIES.map(s=>{
          const pts=activities.filter(a=>a.societyId===s.id&&(a.date||"").startsWith(filterMonth)).reduce((t,a)=>t+(a.points||0),0);
          const isSel=selSoc===s.id;
          return (
            <button key={s.id} onClick={()=>{setSelSoc(s.id);setShowForm(false);}}
              style={{display:"flex",alignItems:"center",gap:"7px",padding:"9px 16px",borderRadius:"12px",border:`1px solid ${isSel?s.color:"rgba(255,255,255,0.1)"}`,background:isSel?s.bg:"rgba(255,255,255,0.03)",cursor:"pointer",fontFamily:"inherit",transition:"all 0.15s"}}>
              <span style={{fontSize:"1.1rem"}}>{s.icon}</span>
              <div style={{textAlign:"left"}}>
                <div style={{fontSize:"0.72rem",fontWeight:isSel?"700":"500",color:isSel?s.color:"rgba(255,255,255,0.6)"}}>{s.nameUr}</div>
                <div style={{fontSize:"0.55rem",color:isSel?s.color+"aa":"rgba(255,255,255,0.25)",direction:"ltr"}}>{s.nameEn}</div>
              </div>
              <span style={{background:pts>=MAX_PER_SOC?"rgba(74,222,128,0.15)":s.bg,border:`1px solid ${pts>=MAX_PER_SOC?"rgba(74,222,128,0.4)":s.color+"40"}`,borderRadius:"8px",padding:"2px 7px",fontSize:"0.6rem",fontWeight:"700",color:pts>=MAX_PER_SOC?"#4ade80":s.color,marginRight:"4px"}}>{pts}/{MAX_PER_SOC}</span>
            </button>
          );
        })}
      </div>

      {/* ── Society Info Card ── */}
      <div style={{...glass,padding:"18px",marginBottom:"18px",borderTop:`3px solid ${soc.color}`}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"16px",flexWrap:"wrap"}}>
          {/* Society identity */}
          <div>
            <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"10px"}}>
              <span style={{fontSize:"2rem"}}>{soc.icon}</span>
              <div>
                <div style={{color:soc.color,fontWeight:"800",fontSize:"0.95rem"}}>{soc.nameUr}</div>
                <div style={{color:"rgba(255,255,255,0.4)",fontSize:"0.62rem",direction:"ltr"}}>{soc.nameEn}</div>
                {leadInfo&&<div style={{marginTop:"3px"}}><span style={{background:`${leadInfo.color}20`,color:leadInfo.color,borderRadius:"6px",padding:"2px 8px",fontSize:"0.58rem",fontWeight:"700",border:`1px solid ${leadInfo.color}30`}}>{leadInfo.emoji} {leadInfo.nameEn} Lead</span></div>}
              </div>
            </div>
            <div>
              <div style={{fontSize:"0.6rem",color:"rgba(212,175,55,0.7)",marginBottom:"4px"}}>سوسائٹی سربراہ</div>
              <input style={inp} placeholder="Head's name..." value={heads[selSoc]||""} onChange={e=>setHeads(p=>({...p,[selSoc]:e.target.value}))}/>
            </div>
          </div>
          {/* Members */}
          <div>
            <div style={{fontSize:"0.6rem",color:"rgba(212,175,55,0.7)",marginBottom:"4px"}}>ارکان (تمام گھروں سے)</div>
            <textarea
              style={{...inp,resize:"vertical",minHeight:"80px",fontSize:"0.68rem"}}
              placeholder="Members' names (one per line)..."
              value={members[selSoc]||""}
              onChange={e=>setMembers(p=>({...p,[selSoc]:e.target.value}))}
            />
          </div>
          {/* Monthly score */}
          <div>
            <div style={{fontSize:"0.6rem",color:"rgba(212,175,55,0.7)",marginBottom:"8px"}}>Monthly Score ({filterMonth})</div>
            <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"8px"}}>
              <div style={{fontSize:"2.2rem",fontWeight:"900",color:socMonthTotal>=MAX_PER_SOC?"#4ade80":soc.color}}>{socMonthTotal}</div>
              <div>
                <div style={{fontSize:"0.62rem",color:"rgba(255,255,255,0.35)"}}>/ {MAX_PER_SOC} زیادہ سے زیادہ</div>
                <div style={{fontSize:"0.62rem",color:remaining>0?"#fb923c":"#4ade80"}}>{remaining>0?`${remaining} باقی`:"مکمل ✓"}</div>
              </div>
            </div>
            <div style={{height:"6px",background:"rgba(255,255,255,0.08)",borderRadius:"3px",overflow:"hidden"}}>
              <div style={{width:`${Math.min(100,(socMonthTotal/MAX_PER_SOC)*100)}%`,height:"100%",background:`linear-gradient(90deg,${soc.color},${soc.color}aa)`,borderRadius:"3px",transition:"width 0.5s"}}/>
            </div>
            <div style={{marginTop:"8px",fontSize:"0.6rem",color:"rgba(255,255,255,0.35)"}}>{socEntries.length} اس ماہ سرگرمیاں</div>
          </div>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 320px",gap:"18px",alignItems:"start"}}>

        {/* ── Activity Log ── */}
        <div>
          {/* Add Activity Button */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"12px"}}>
            <div style={{color:"#f1f5f9",fontWeight:"700",fontSize:"0.88rem"}}>📋 Activity Log — {filterMonth}</div>
            <button onClick={()=>setShowForm(!showForm)}
              style={{display:"flex",alignItems:"center",gap:"6px",padding:"8px 16px",borderRadius:"10px",border:`1px solid ${showForm?"rgba(248,113,113,0.5)":G}`,background:"transparent",color:showForm?"#f87171":G,fontSize:"0.72rem",cursor:"pointer",fontFamily:"inherit",fontWeight:"700"}}>
              <span className="material-symbols-rounded" style={{fontSize:"16px"}}>{showForm?"close":"add_circle"}</span>
              {showForm?"Cancel":"+New Activity"}
            </button>
          </div>

          {/* Add Form */}
          {showForm&&(
            <div style={{...glass,padding:"18px",marginBottom:"14px",borderColor:`${soc.color}40`}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
                <div>
                  <div style={{fontSize:"0.62rem",color:"rgba(212,175,55,0.7)",marginBottom:"4px"}}>تاریخ</div>
                  <input style={{...inp,direction:"ltr",colorScheme:"dark"}} type="date" value={form.date} onChange={e=>setForm(p=>({...p,date:e.target.value}))}/>
                </div>
                <div>
                  <div style={{fontSize:"0.62rem",color:"rgba(212,175,55,0.7)",marginBottom:"4px"}}>گھر</div>
                  <select style={inp} value={form.houseId} onChange={e=>setForm(p=>({...p,houseId:e.target.value}))}>
                    {HOUSES.map(h=><option key={h.id} value={h.id} style={{background:N2}}>{h.emoji} {h.nameEn}</option>)}
                  </select>
                </div>
                <div style={{gridColumn:"1/-1"}}>
                  <div style={{fontSize:"0.62rem",color:"rgba(212,175,55,0.7)",marginBottom:"4px"}}>سرگرمی *</div>
                  <input style={inp} placeholder="Activity name e.g. Essay Writing Competition..." value={form.activity} onChange={e=>setForm(p=>({...p,activity:e.target.value}))}/>
                </div>
                <div style={{gridColumn:"1/-1"}}>
                  <div style={{fontSize:"0.62rem",color:"rgba(212,175,55,0.7)",marginBottom:"4px"}}>نتیجہ / حاصل</div>
                  <input style={inp} placeholder="e.g. 8 students participated, 1st position earned" value={form.outcome} onChange={e=>setForm(p=>({...p,outcome:e.target.value}))}/>
                </div>
                <div>
                  <div style={{fontSize:"0.62rem",color:"rgba(212,175,55,0.7)",marginBottom:"4px"}}>پوائنٹس (زیادہ سے زیادہ: {remaining})</div>
                  <input style={{...inp,direction:"ltr"}} type="number" min={1} max={remaining||1} value={form.points} onChange={e=>setForm(p=>({...p,points:Number(e.target.value)}))}/>
                </div>
                <div style={{display:"flex",alignItems:"flex-end"}}>
                  <div style={{background:`${soc.color}15`,borderRadius:"10px",padding:"8px 12px",border:`1px solid ${soc.color}30`,width:"100%",textAlign:"center"}}>
                    <div style={{fontSize:"0.58rem",color:"rgba(255,255,255,0.35)"}}>اس ماہ باقی</div>
                    <div style={{fontWeight:"800",color:remaining>0?soc.color:"#4ade80",fontSize:"1.1rem"}}>{remaining}</div>
                  </div>
                </div>
              </div>
              {/* Participants */}
              {houseStudents.length>0&&(
                <div style={{marginBottom:"12px"}}>
                  <div style={{fontSize:"0.62rem",color:"rgba(212,175,55,0.7)",marginBottom:"6px",fontWeight:"700"}}>👥 شریک طلباء (Participants)</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:"5px",maxHeight:"120px",overflowY:"auto"}}>
                    {houseStudents.map(s=>(
                      <button key={s.id} onClick={()=>toggleParticipant(s.id)}
                        style={{padding:"4px 10px",borderRadius:"20px",border:`1px solid ${participants.includes(s.id)?soc.color:"rgba(255,255,255,0.15)"}`,background:participants.includes(s.id)?`${soc.color}20`:"transparent",color:participants.includes(s.id)?soc.color:"rgba(241,245,249,0.5)",fontSize:"0.65rem",cursor:"pointer",fontFamily:"inherit",fontWeight:participants.includes(s.id)?"700":"400"}}>
                        {participants.includes(s.id)?"✓ ":""}{s.name}
                      </button>
                    ))}
                  </div>
                  {participants.length>0&&<div style={{marginTop:"5px",fontSize:"0.6rem",color:soc.color}}>{participants.length} طلباء منتخب</div>}
                </div>
              )}
              <div style={{display:"flex",gap:"8px",justifyContent:"flex-end"}}>
                <button onClick={()=>{setShowForm(false);setParticipants([]);}} style={{padding:"8px 18px",borderRadius:"9px",border:"1px solid rgba(255,255,255,0.15)",background:"transparent",color:"rgba(241,245,249,0.5)",fontSize:"0.75rem",cursor:"pointer",fontFamily:"inherit"}}>منسوخ</button>
                <button onClick={addEntry} style={{padding:"8px 22px",borderRadius:"9px",border:"none",background:`linear-gradient(135deg,${soc.color},${soc.color}cc)`,color:"#fff",fontWeight:"700",fontSize:"0.75rem",cursor:"pointer",fontFamily:"inherit"}}>محفوظ ✓</button>
              </div>
            </div>
          )}

          {/* Activity Table */}
          <div style={{...glass,overflow:"hidden"}}>
            {socEntries.length===0
              ? <div style={{padding:"48px",textAlign:"center",color:"rgba(255,255,255,0.2)"}}>
                  <span style={{fontSize:"2rem",display:"block",marginBottom:"8px"}}>{soc.icon}</span>
                  اس ماہ کوئی سرگرمی نہیں
                </div>
              : <div style={{overflowX:"auto"}}>
                  <table style={{width:"100%",borderCollapse:"collapse",minWidth:"520px"}}>
                    <thead><tr style={{background:"rgba(255,255,255,0.04)"}}>
                      {["تاریخ","سرگرمی","نتیجہ","گھر","پوائنٹس"].map(h=>(
                        <th key={h} style={{padding:"10px 14px",textAlign:"left",fontSize:"0.62rem",fontWeight:"700",color:`${soc.color}cc`,borderBottom:"1px solid rgba(255,255,255,0.08)"}}>{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      {socEntries.map((a,i)=>{
                        const hInfo=HOUSES.find(h=>h.id===a.houseId)||{};
                        return (
                          <tr key={a.id||i} style={{borderBottom:"1px solid rgba(255,255,255,0.05)",background:i%2===0?"rgba(255,255,255,0.02)":"transparent"}}>
                            <td style={{padding:"10px 14px",direction:"ltr",fontFamily:"monospace",color:"rgba(255,255,255,0.4)",fontSize:"0.68rem"}}>{a.date}</td>
                            <td style={{padding:"10px 14px",fontWeight:"600",color:"#f1f5f9",fontSize:"0.78rem"}}>{a.activity}</td>
                            <td style={{padding:"10px 14px",color:"rgba(241,245,249,0.55)",fontSize:"0.72rem"}}>{a.outcome||"—"}</td>
                            <td style={{padding:"10px 14px"}}>
                              <span style={{background:`${hInfo.color||"#888"}18`,color:hInfo.color||"#888",borderRadius:"8px",padding:"3px 9px",fontSize:"0.62rem",fontWeight:"700",border:`1px solid ${hInfo.color||"#888"}30`}}>{hInfo.emoji} {hInfo.nameEn||"—"}</span>
                            </td>
                            <td style={{padding:"10px 14px",textAlign:"center",fontWeight:"900",color:soc.color,fontSize:"1rem"}}>{a.points}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
            }
          </div>
        </div>

        {/* ── Right Panel: House Scores ── */}
        <div style={{display:"flex",flexDirection:"column",gap:"14px"}}>

          {/* This Society: Points per House */}
          <div style={{...glass,padding:"16px"}}>
            <div style={{fontSize:"0.62rem",color:`${soc.color}cc`,fontWeight:"700",marginBottom:"12px",textTransform:"uppercase",letterSpacing:"0.1em"}}>{soc.icon} {soc.nameEn} — This Month</div>
            {HOUSES.map(h=>{
              const pts=socHousePts[h.id]||0;
              const pct=Math.round((pts/MAX_PER_SOC)*100);
              return (
                <div key={h.id} style={{marginBottom:"10px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"4px"}}>
                    <span style={{fontSize:"0.72rem",fontWeight:"600",color:h.color}}>{h.emoji} {h.nameEn}</span>
                    <span style={{fontWeight:"800",color:pts>=MAX_PER_SOC?"#4ade80":soc.color,fontSize:"0.82rem",fontFamily:"'Public Sans',sans-serif"}}>{pts}<span style={{fontSize:"0.6rem",color:"rgba(255,255,255,0.3)",fontWeight:"400"}}>/{MAX_PER_SOC}</span></span>
                  </div>
                  <div style={{height:"5px",background:"rgba(255,255,255,0.06)",borderRadius:"3px",overflow:"hidden"}}>
                    <div style={{width:`${pct}%`,height:"100%",background:`linear-gradient(90deg,${soc.color},${soc.color}aa)`,borderRadius:"3px",transition:"width 0.5s"}}/>
                  </div>
                </div>
              );
            })}
          </div>

          {/* All Societies Total per House */}
          <div style={{...glass,padding:"16px"}}>
            <div style={{fontSize:"0.62rem",color:"rgba(212,175,55,0.8)",fontWeight:"700",marginBottom:"12px",textTransform:"uppercase",letterSpacing:"0.1em"}}>🏆 Total Score — {filterMonth}</div>
            {[...HOUSES].sort((a,b)=>(totalHousePts[b.id]||0)-(totalHousePts[a.id]||0)).map((h,rank)=>{
              const pts=totalHousePts[h.id]||0;
              const pct=Math.round((pts/60)*100);
              const medal=rank===0?"🥇":rank===1?"🥈":rank===2?"🥉":"";
              return (
                <div key={h.id} style={{marginBottom:"12px",background:rank===0?`${h.color}08`:"rgba(255,255,255,0.02)",borderRadius:"10px",padding:"10px 12px",border:`1px solid ${rank===0?h.color+"25":"rgba(255,255,255,0.06)"}`}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"5px"}}>
                    <span style={{fontSize:"0.78rem",fontWeight:"700",color:h.color}}>{medal} {h.emoji} {h.nameEn}</span>
                    <span style={{fontWeight:"900",color:h.color,fontSize:"0.95rem",fontFamily:"'Public Sans',sans-serif"}}>{pts}<span style={{fontSize:"0.58rem",color:"rgba(255,255,255,0.3)",fontWeight:"400"}}>/60</span></span>
                  </div>
                  <div style={{height:"4px",background:"rgba(255,255,255,0.06)",borderRadius:"2px",overflow:"hidden"}}>
                    <div style={{width:`${pct}%`,height:"100%",background:`linear-gradient(90deg,${h.color},${h.color}aa)`,borderRadius:"2px",transition:"width 0.5s"}}/>
                  </div>
                </div>
              );
            })}
            <div style={{fontSize:"0.6rem",color:"rgba(255,255,255,0.2)",marginTop:"6px",textAlign:"center"}}>12 × 5 = 60 Maximum</div>
          </div>

          {/* All 5 societies breakdown */}
          <div style={{...glass,padding:"16px"}}>
            <div style={{fontSize:"0.62rem",color:"rgba(212,175,55,0.8)",fontWeight:"700",marginBottom:"12px",textTransform:"uppercase",letterSpacing:"0.1em"}}>Society Breakdown</div>
            {SOCIETIES.map(s=>{
              const total=activities.filter(a=>a.societyId===s.id&&(a.date||"").startsWith(filterMonth)).reduce((t,a)=>t+(a.points||0),0);
              return (
                <div key={s.id} style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"8px"}}>
                  <span style={{fontSize:"0.9rem",flexShrink:0}}>{s.icon}</span>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:"3px"}}>
                      <span style={{fontSize:"0.65rem",color:s.color,fontWeight:"600"}}>{s.nameUr}</span>
                      <span style={{fontSize:"0.65rem",fontWeight:"700",color:total>=MAX_PER_SOC?"#4ade80":s.color}}>{total}/{MAX_PER_SOC}</span>
                    </div>
                    <div style={{height:"3px",background:"rgba(255,255,255,0.06)",borderRadius:"2px",overflow:"hidden"}}>
                      <div style={{width:`${Math.min(100,(total/MAX_PER_SOC)*100)}%`,height:"100%",background:s.color,borderRadius:"2px"}}/>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Print Area ── */}
      <div id="soc-print-area" style={{position:"absolute",left:"-9999px",top:0,width:"210mm"}}>
        <div style={{background:"#fff",fontFamily:"'Segoe UI','Public Sans',sans-serif",direction:"ltr",color:"#0f172a"}}>
          <img src={letterhead} alt="" style={{width:"100%",display:"block"}}/>
          <div style={{padding:"14px 40px 8px",borderBottom:"2px solid #b7860b",textAlign:"center"}}>
            <div style={{fontSize:"1.1rem",fontWeight:"800",color:"#7a5807"}}>{soc.icon} {soc.nameUr} — Activity Report</div>
            <div style={{fontSize:"0.72rem",color:"#888",fontFamily:"'Public Sans',sans-serif",marginTop:"3px"}}>{soc.nameEn} — {filterMonth}</div>
            {heads[selSoc]&&<div style={{fontSize:"0.68rem",color:"#555",marginTop:"3px"}}>Head: {heads[selSoc]}</div>}
          </div>
          <div style={{padding:"16px 40px"}}>
            {/* Stats row */}
            <div style={{display:"flex",gap:"20px",marginBottom:"14px",padding:"10px 14px",background:"#fffdf8",borderRadius:"8px",border:"1px solid #f5e9c8"}}>
              <div style={{textAlign:"center"}}>
                <div style={{fontWeight:"800",fontSize:"1.1rem",color:"#7a5807"}}>{socMonthTotal}/{MAX_PER_SOC}</div>
                <div style={{fontSize:"0.6rem",color:"#666"}}>Monthly Score</div>
              </div>
              <div style={{textAlign:"center"}}>
                <div style={{fontWeight:"800",fontSize:"1.1rem",color:"#1e293b"}}>{socEntries.length}</div>
                <div style={{fontSize:"0.6rem",color:"#666"}}>Activities</div>
              </div>
              {leadInfo&&<div style={{textAlign:"center"}}>
                <div style={{fontWeight:"800",fontSize:"0.82rem",color:"#1e293b"}}>{leadInfo.emoji} {leadInfo.nameEn}</div>
                <div style={{fontSize:"0.6rem",color:"#666"}}>Lead House</div>
              </div>}
            </div>
            {/* Activity table */}
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:"0.78rem",marginBottom:"20px"}}>
              <thead><tr style={{background:"#f5e9c8"}}>
                {["تاریخ","سرگرمی","نتیجہ","گھر","پوائنٹس"].map(h=>(
                  <th key={h} style={{padding:"7px 8px",textAlign:"left",fontWeight:"700",color:"#7a5807",border:"1px solid #f0ede8"}}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {socEntries.length===0
                  ? <tr><td colSpan={5} style={{padding:"20px",textAlign:"center",color:"#aaa"}}>کوئی سرگرمی نہیں</td></tr>
                  : socEntries.map((a,i)=>{
                      const hInfo=HOUSES.find(h=>h.id===a.houseId)||{};
                      return (
                        <tr key={i} style={{background:i%2===0?"#fffdf8":"#fff",borderBottom:"1px solid #f5e9c8"}}>
                          <td style={{padding:"7px 8px",direction:"ltr",fontFamily:"monospace",fontSize:"0.68rem",border:"1px solid #f0ede8"}}>{a.date}</td>
                          <td style={{padding:"7px 8px",fontWeight:"600",border:"1px solid #f0ede8"}}>{a.activity}</td>
                          <td style={{padding:"7px 8px",color:"#555",fontSize:"0.68rem",border:"1px solid #f0ede8"}}>{a.outcome||"—"}</td>
                          <td style={{padding:"7px 8px",border:"1px solid #f0ede8"}}>{hInfo.emoji} {hInfo.nameEn||"—"}</td>
                          <td style={{padding:"7px 8px",textAlign:"center",fontWeight:"800",color:"#7a5807",border:"1px solid #f0ede8"}}>{a.points}</td>
                        </tr>
                      );
                    })
                }
                <tr style={{background:"#f5e9c8",borderTop:"2px solid #b7860b"}}>
                  <td colSpan={4} style={{padding:"7px 8px",fontWeight:"700",color:"#7a5807",border:"1px solid #f0ede8",fontFamily:"'Noto Nastaliq Urdu',serif"}}>کل اسکور</td>
                  <td style={{padding:"7px 8px",textAlign:"center",fontWeight:"900",fontSize:"1rem",color:"#7a5807",border:"1px solid #f0ede8"}}>{socMonthTotal}</td>
                </tr>
              </tbody>
            </table>
            {/* House breakdown */}
            <div style={{marginBottom:"14px"}}>
              <div style={{fontWeight:"700",color:"#7a5807",marginBottom:"8px",fontSize:"0.82rem",fontFamily:"'Noto Nastaliq Urdu',serif"}}>گھر کے مطابق پوائنٹس</div>
              <div style={{display:"flex",gap:"12px",flexWrap:"wrap"}}>
                {HOUSES.map(h=><div key={h.id} style={{textAlign:"center",padding:"8px 16px",background:"#fffdf8",borderRadius:"8px",border:"1px solid #f5e9c8"}}>
                  <div style={{fontWeight:"800",fontSize:"1rem",color:"#1e293b"}}>{socHousePts[h.id]||0}</div>
                  <div style={{fontSize:"0.6rem",color:"#666"}}>{h.emoji} {h.nameEn}</div>
                </div>)}
              </div>
            </div>
            {/* Footer */}
            <div style={{marginTop:"28px",display:"flex",justifyContent:"space-between",paddingTop:"10px",borderTop:"1px solid #f0ede8"}}>
              <div style={{textAlign:"center",minWidth:"160px"}}>
                <div style={{borderTop:"1.5px solid #0f172a",paddingTop:"8px",fontSize:"0.68rem",color:"#444",fontWeight:"600",fontFamily:"'Noto Nastaliq Urdu',serif"}}>گھر ماسٹر کا دستخط</div>
              </div>
              <div style={{textAlign:"center",fontSize:"0.6rem",color:"#aaa",fontFamily:"'Public Sans',sans-serif",alignSelf:"flex-end"}}>
                Printed on: {new Date().toLocaleDateString("en-PK",{year:"numeric",month:"long",day:"numeric"})}
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

export default SocietySystem;
