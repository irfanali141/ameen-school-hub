/* eslint-disable */
import { useState, useEffect } from "react";
import { HOUSES, HVS_TOTAL, HVS_CATS } from "../../constants";
import { getData } from "../../supabase";
import letterhead from "../../assets/letterhead.png";
import AwardsHub from "./AwardsHub";

// ─── Grand Total 300 Component Definitions ────────────────────────────────────

const GRAND_COMPS = [
  { key:"hvs100",      label:"HVS Score",           labelEn:"HVS Score",              max:100, icon:"🏅", manual:false },
  { key:"duties60",    label:"Weekly Responsibilities", labelEn:"Weekly Responsibilities", max:60,  icon:"📋", manual:false },
  { key:"training40",  label:"Training Integration",        labelEn:"Training Integration",    max:40,  icon:"🎯", manual:true  },
  { key:"society60",   label:"Societies & Activities",  labelEn:"Societies & Activities",  max:60,  icon:"🏛️", manual:false },
  { key:"leadership40",label:"Leadership & Character",         labelEn:"Leadership & Roles",      max:40,  icon:"👑", manual:false },
];

// ─── Super House of the Year 400 Categories ───────────────────────────────────

const SUPER400_CATS = [
  { key:"hvsDiscipline", label:"HVS Discipline & Behaviour",         labelEn:"HVS Discipline & Behaviour", max:100, icon:"🏅", manual:false, color:"#60a5fa" },
  { key:"academic",      label:"Academic Performance",          labelEn:"Academic Performance",       max:100, icon:"📚", manual:true,  color:"#34d399" },
  { key:"activities",    label:"Activities & Competitions",        labelEn:"Activities & Competitions",  max:100, icon:"🏆", manual:false, color:"#fb923c" },
  { key:"leadership",    label:"Leadership & Initiative",             labelEn:"Leadership & Initiative",    max:50,  icon:"👑", manual:false, color:"#a78bfa" },
  { key:"community",     label:"Community / Service",           labelEn:"Community / Service",        max:50,  icon:"🤝", manual:true,  color:"#f472b6" },
];

const AWARDS_PRINT_STYLE = `
@media print {
  body * { visibility: hidden !important; }
  #awards-print-area, #awards-print-area * { visibility: visible !important; }
  #awards-print-area {
    position: fixed !important; top: 0; left: 0;
    width: 100%; background: white; padding: 0; margin: 0;
  }
  .no-print { display: none !important; }
  @page { margin: 0; size: A4; }
}
`;

function Houses({houses,hvsLogs,students,userRole}){
  const G="#d4af37";const N="#0f172a";
  const glass={background:"rgba(255,255,255,0.07)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:"16px"};
  const inp={padding:"9px 12px",borderRadius:"9px",border:"1px solid rgba(212,175,55,0.25)",background:"rgba(255,255,255,0.06)",color:"#f1f5f9",fontSize:"0.75rem",fontFamily:"'Public Sans',sans-serif",outline:"none",width:"100%",boxSizing:"border-box",colorScheme:"dark"};

  const [selected,setSelected]=useState(null);
  const [housesTab,setHousesTab]=useState("leaderboard");
  const [manualWinners,setManualWinners]=useState({stoy:"",reader:"",storyteller:"",akhlaq:"",teacher:""});
  const [overrides,setOverrides]=useState({superhouse:"",discipline:"",academic:"",reading:"",akhlaqhouse:""});

  // ── Grand 300 state ──
  const [weeklyDuties,  setWeeklyDuties]  = useState([]);
  const [societyScores, setSocietyScores] = useState([]);
  const [leadershipData,setLeadershipData]= useState([]);
  const [trainingScores,setTrainingScores]= useState(() => {
    try { return JSON.parse(localStorage.getItem("grand300_training") || "{}"); } catch { return {}; }
  });
  const [trainingSaved, setTrainingSaved] = useState(false);

  // ── Super 400 state ──
  const [academicScores, setAcademicScores] = useState(() => {
    try { return JSON.parse(localStorage.getItem("super400_academic") || "{}"); } catch { return {}; }
  });
  const [community400, setCommunity400] = useState(() => {
    try { return JSON.parse(localStorage.getItem("super400_community") || "{}"); } catch { return {}; }
  });
  const [super400Saved, setSuper400Saved] = useState(false);
  const [eventData, setEventData]         = useState([]);

  useEffect(() => {
    if (housesTab === "grand300") {
      getData("weekly_duties").then(d  => { if(d&&!d.error) setWeeklyDuties(d);   });
      getData("society_scores").then(d => { if(d&&!d.error) setSocietyScores(d); });
      getData("leadership_roles").then(d => { if(d&&!d.error) setLeadershipData(d); });
    }
    if (housesTab === "super400") {
      getData("events").then(d          => { if(d&&!d.error) setEventData(d);      });
      getData("leadership_roles").then(d => { if(d&&!d.error) setLeadershipData(d); });
    }
  }, [housesTab]);

  const saveTraining = () => {
    localStorage.setItem("grand300_training", JSON.stringify(trainingScores));
    setTrainingSaved(true);
    setTimeout(() => setTrainingSaved(false), 2500);
  };

  const saveSuper400Manual = () => {
    localStorage.setItem("super400_academic",  JSON.stringify(academicScores));
    localStorage.setItem("super400_community", JSON.stringify(community400));
    setSuper400Saved(true);
    setTimeout(() => setSuper400Saved(false), 2500);
  };

  const doPrintSuper400 = () => {
    const el = document.getElementById("super400-print-area");
    if (!el) return;
    const w = window.open("", "_blank", "width=900,height=700");
    w.document.write(`<!DOCTYPE html><html dir="ltr"><head><meta charset="utf-8">
      <title>Super House of the Year — 400 Marks</title>
      <style>body{margin:0;padding:0;font-family:'Segoe UI',Tahoma,sans-serif;}table{border-collapse:collapse;width:100%;}
      th,td{border:1px solid #ddd;padding:7px 10px;text-align:right;font-size:12px;}
      th{background:#f5f5f5;font-weight:700;}@page{size:A4;margin:0;}</style>
    </head><body>${el.innerHTML}</body></html>`);
    w.document.close();
    setTimeout(() => { w.focus(); w.print(); }, 500);
  };

  // ── Super 400 per-house scores ──
  const super400Stats = HOUSES.map(info => {
    const hmLogs = hvsLogs.filter(l =>
      (l.houseId||l.house_id) === info.id && (l.type==="housemaster"||!l.type));
    const hvsDiscipline = hmLogs.length
      ? Math.min(100, Math.round(hmLogs.reduce((s,l) => s+(l.totalScore||0),0) / hmLogs.length * 2))
      : 0;
    const ac = academicScores[info.id] || {};
    const academic = Math.min(100, (Number(ac.t1)||0) + (Number(ac.t2)||0) + (Number(ac.t3)||0));
    const hEvt = eventData.filter(e => (e.house_id||e.houseId) === info.id);
    const activities = Math.min(100, hEvt.reduce((s,e) => s+(e.score||e.points||e.total_score||0),0));
    const hLead = leadershipData.filter(l => (l.house_id||l.houseId) === info.id);
    const leadership = Math.min(50, hLead.reduce((s,x) => s+(x.score||x.points||x.total_score||0),0));
    const community = Math.min(50, Number(community400[info.id]) || 0);
    const total = hvsDiscipline + academic + activities + leadership + community;
    return { ...info, hvsDiscipline, academic, activities, leadership, community, total };
  }).sort((a,b) => b.total - a.total);

  // ── Grand 300 per-house scores ──
  const grand300Stats = HOUSES.map(info => {
    const hmLogs = hvsLogs.filter(l =>
      (l.houseId||l.house_id) === info.id && (l.type==="housemaster"||!l.type));
    const hvs100 = hmLogs.length
      ? Math.min(100, Math.round(hmLogs.reduce((s,l) => s+(l.totalScore||0),0) / hmLogs.length * 2))
      : 0;
    const hDuties = weeklyDuties.filter(d => (d.house_id||d.houseId) === info.id);
    const duties60 = hDuties.length
      ? Math.min(60, Math.round(hDuties.reduce((s,d) => s+(d.total||0),0) / hDuties.length))
      : 0;
    const training40 = Math.min(40, Number(trainingScores[info.id]) || 0);
    const hSoc = societyScores.filter(s => (s.house_id||s.houseId) === info.id);
    const society60 = Math.min(60, hSoc.reduce((s,x) => s+(x.score||x.points||x.total_score||0),0));
    const hLead = leadershipData.filter(l => (l.house_id||l.houseId) === info.id);
    const leadership40 = Math.min(40, hLead.reduce((s,x) => s+(x.score||x.points||x.total_score||0),0));
    const total = hvs100 + duties60 + training40 + society60 + leadership40;
    return { ...info, hvs100, duties60, training40, society60, leadership40, total };
  }).sort((a,b) => b.total - a.total);

  const houseStats=HOUSES.map(info=>{
    const hd=houses.find(h=>h.id===info.id)||{};
    const studs=students.filter(s=>s.houseId===info.id);
    const hLogs=hvsLogs.filter(l=>l.houseId===info.id);
    const avgHvs=hLogs.length?Math.round(hLogs.reduce((s,l)=>s+(l.totalScore||0),0)/hLogs.length):0;
    const bestWeek=hLogs.length?Math.max(...hLogs.map(l=>l.totalScore||0)):0;
    return {...info,...hd,studs,hLogs,avgHvs,bestWeek};
  }).sort((a,b)=>(b.points||0)-(a.points||0)).map((h,i)=>({...h,rank:i+1}));

  const selectedStats=selected?houseStats.find(h=>h.id===selected):null;
  const selectedInfo=selected?HOUSES.find(h=>h.id===selected):null;
  const rankMedal=["👑","🥈","🥉","4️⃣"];
  const maxPts=houseStats[0]?.points||1;

  // ── Award auto-calculations ──
  const houseAvgCat=(hId,catId)=>{
    const logs=hvsLogs.filter(l=>l.houseId===hId);
    if(!logs.length)return 0;
    return Math.round(logs.reduce((s,l)=>s+(l.scores?.[catId]||0),0)/logs.length);
  };
  const catMax=(catId)=>HVS_CATS.find(c=>c.id===catId)?.max||0;

  const autoAwards={
    superhouse:(()=>{
      const h=houseStats[0];const info=HOUSES.find(x=>x.id===h?.id)||{};
      return {winner:info.nameEn||"—",data:`${h?.points||0} Points (Total)`,color:info.color,emoji:info.emoji};
    })(),
    discipline:(()=>{
      // HVSEntry saves housemaster discipline as "zabt"
      const ranked=[...HOUSES].map(h=>({...h,avg:houseAvgCat(h.id,"zabt")})).sort((a,b)=>b.avg-a.avg);
      const w=ranked[0];
      return {winner:w?.nameEn||"—",data:`Average: ${w?.avg||0}/15`,color:w?.color,emoji:w?.emoji};
    })(),
    academic:(()=>{
      // HVSEntry saves teacher academic as "ilm"
      const ranked=[...HOUSES].map(h=>({...h,avg:houseAvgCat(h.id,"ilm")})).sort((a,b)=>b.avg-a.avg);
      const w=ranked[0];
      return {winner:w?.nameEn||"—",data:`Average: ${w?.avg||0}/25`,color:w?.color,emoji:w?.emoji};
    })(),
    reading:(()=>{
      const m11Logs=hvsLogs.filter(l=>{const d=l.created_at?new Date(l.created_at):null;return d&&d.getMonth()===10;});
      const ranked=[...HOUSES].map(h=>{
        const logs=m11Logs.filter(l=>l.houseId===h.id);
        // HVSEntry saves teacher sub-scores under "ilm" → { reading: N }
        const pts=logs.reduce((s,l)=>s+(l.subScores?.ilm?.reading||l.subScores?.education?.reading||0),0);
        return {...h,pts};
      }).sort((a,b)=>b.pts-a.pts);
      const w=ranked[0];
      return {winner:w?.nameEn||"—",data:`Reading (Month 11): ${w?.pts||0} Points`,color:w?.color,emoji:w?.emoji};
    })(),
    akhlaqhouse:(()=>{
      // HVSEntry saves madrasa morality as "akhlaq"
      const ranked=[...HOUSES].map(h=>({...h,avg:houseAvgCat(h.id,"akhlaq")})).sort((a,b)=>b.avg-a.avg);
      const w=ranked[0];
      return {winner:w?.nameEn||"—",data:`Average: ${w?.avg||0}/15`,color:w?.color,emoji:w?.emoji};
    })(),
  };

  const doPrintAwards=()=>{
    if(!document.getElementById("awards-print-style")){
      const s=document.createElement("style");s.id="awards-print-style";s.innerHTML=AWARDS_PRINT_STYLE;document.head.appendChild(s);
    }
    window.print();
  };

  const doPrintGrand300 = () => {
    const el = document.getElementById("grand300-print-area");
    if (!el) return;
    const w = window.open("", "_blank", "width=900,height=700");
    w.document.write(`<!DOCTYPE html><html dir="ltr"><head><meta charset="utf-8">
      <title>Grand Total 300 Marks</title>
      <style>body{margin:0;padding:0;font-family:'Segoe UI',Tahoma,sans-serif;}table{border-collapse:collapse;width:100%;}
      th,td{border:1px solid #ddd;padding:7px 10px;text-align:right;font-size:12px;}
      th{background:#f5f5f5;font-weight:700;}@page{size:A4;margin:0;}</style>
    </head><body>${el.innerHTML}</body></html>`);
    w.document.close();
    setTimeout(() => { w.focus(); w.print(); }, 500);
  };

  const HOUSE_AWARDS=[
    {key:"superhouse",no:1,icon:"🏆",titleUr:"Super House of the Year",titleEn:"Super House of the Year",basis:"highest 400-mark total"},
    {key:"discipline",no:2,icon:"⚔️",titleUr:"Best Discipline House",titleEn:"Best Discipline House",basis:"highest Discipline avg"},
    {key:"academic",no:3,icon:"📚",titleUr:"Best Academic House",titleEn:"Best Academic House",basis:"highest Education avg"},
    {key:"reading",no:4,icon:"📖",titleUr:"Best Reading House",titleEn:"Best Reading House",basis:"Month 11 reading points"},
    {key:"akhlaqhouse",no:5,icon:"💎",titleUr:"Best Ethics House",titleEn:"Best Akhlaq House",basis:"highest Morality avg"},
  ];
  const MANUAL_AWARDS=[
    {key:"stoy",no:6,icon:"🌟",titleUr:"Student of the Year",titleEn:"Student of the Year",type:"student"},
    {key:"reader",no:7,icon:"📗",titleUr:"Best Reader",titleEn:"Best Reader",type:"student"},
    {key:"storyteller",no:8,icon:"🎙️",titleUr:"Best Storyteller",titleEn:"Best Storyteller",type:"student"},
    {key:"akhlaq",no:9,icon:"🕊️",titleUr:"Akhlaq Champion",titleEn:"Akhlaq Champion",type:"student"},
    {key:"teacher",no:10,icon:"👨‍🏫",titleUr:"Best Teacher",titleEn:"Best Teacher (House Support)",type:"teacher"},
  ];

  return (
    <div style={{minHeight:"100vh",background:`linear-gradient(160deg,${N} 0%,#0d1f3c 50%,#0a1628 100%)`,padding:"24px 20px",fontFamily:"'Public Sans',sans-serif",direction:"ltr"}}>

      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"24px",flexWrap:"wrap",gap:"12px"}}>
        <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
          <div style={{width:"44px",height:"44px",borderRadius:"12px",background:`linear-gradient(135deg,${G},#b8960a)`,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 4px 20px rgba(212,175,55,0.4)`}}>
            <span className="material-symbols-rounded" style={{fontSize:"24px",color:N}}>emoji_events</span>
          </div>
          <div>
            <h1 style={{margin:0,fontSize:"1.5rem",fontWeight:"800",color:"#f1f5f9"}}>House System</h1>
            <p style={{margin:0,fontSize:"0.75rem",color:"rgba(212,175,55,0.7)",fontWeight:"500"}}>House Leaderboard & Points</p>
          </div>
        </div>
        {/* Tab switcher */}
        <div style={{display:"flex",gap:"4px",background:"rgba(255,255,255,0.05)",borderRadius:"12px",padding:"4px"}}>
          {[["leaderboard","leaderboard","Leaderboard"],["grand300","leaderboard","🏆 Grand 300"],["super400","military_tech","🌟 Super 400"],["awards","military_tech","🏅 Awards"]].map(([v,ic,l])=>(
            <button key={v} onClick={()=>setHousesTab(v)}
              style={{display:"flex",alignItems:"center",gap:"6px",padding:"8px 16px",borderRadius:"9px",border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:"0.75rem",fontWeight:housesTab===v?"700":"400",background:housesTab===v?`linear-gradient(135deg,${G},#b8960a)`:"transparent",color:housesTab===v?N:"rgba(255,255,255,0.5)"}}>
              <span className="material-symbols-rounded" style={{fontSize:"16px"}}>{ic}</span>{l}
            </button>
          ))}
        </div>
      </div>

      {/* ══ LEADERBOARD TAB ══ */}
      {housesTab==="leaderboard"&&(<>
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
              <div style={{fontSize:"0.6rem",color:"rgba(212,175,55,0.6)",marginBottom:"12px"}}>Points</div>
              <div style={{height:"4px",borderRadius:"2px",background:"rgba(255,255,255,0.08)",marginBottom:"12px",overflow:"hidden"}}>
                <div style={{height:"100%",width:`${pct}%`,borderRadius:"2px",background:`linear-gradient(90deg,${info.color},${info.color}aa)`,transition:"width 0.5s"}}/>
              </div>
              <div style={{display:"flex",gap:"8px"}}>
                <div style={{background:`${info.color}15`,borderRadius:"8px",padding:"7px 10px",flex:1,textAlign:"center",border:`1px solid ${info.color}25`}}>
                  <div style={{fontSize:"1rem",fontWeight:"800",color:info.color}}>{h.studs?.length||0}</div>
                  <div style={{fontSize:"0.52rem",color:"rgba(241,245,249,0.4)"}}>Students</div>
                </div>
                <div style={{background:`${info.color}15`,borderRadius:"8px",padding:"7px 10px",flex:1,textAlign:"center",border:`1px solid ${info.color}25`}}>
                  <div style={{fontSize:"1rem",fontWeight:"800",color:info.color}}>{h.avgHvs}</div>
                  <div style={{fontSize:"0.52rem",color:"rgba(241,245,249,0.4)"}}>Avg HVS</div>
                </div>
              </div>
            </div>
          ); })}
        </div>

        {/* Detail Panel */}
        {selectedStats&&selectedInfo&&(
          <div style={{...glass,padding:"20px",marginBottom:"24px",borderTopColor:selectedInfo.color,borderTopWidth:"3px"}}>
            <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"16px"}}>
              <span style={{fontSize:"1.5rem"}}>{selectedInfo.emoji}</span>
              <div>
                <div style={{fontWeight:"700",color:selectedInfo.color,fontSize:"0.95rem"}}>{selectedInfo.nameEn} — Student List</div>
                <div style={{fontSize:"0.65rem",color:"rgba(241,245,249,0.4)"}}>{selectedStats.studs?.length||0} students</div>
              </div>
            </div>
            <div style={{display:"flex",flexWrap:"wrap",gap:"8px"}}>
              {selectedStats.studs?.map(s=><span key={s.id} style={{padding:"5px 12px",borderRadius:"20px",fontSize:"0.68rem",fontWeight:"600",background:`${selectedInfo.color}15`,color:selectedInfo.color,border:`1px solid ${selectedInfo.color}30`}}>{s.name} — {s.grade}</span>)}
              {!selectedStats.studs?.length&&<div style={{color:"rgba(241,245,249,0.35)",fontSize:"0.72rem"}} className="ur">کوئی طالب علم نہیں ملا</div>}
            </div>
          </div>
        )}

        {/* Comparison Table */}
        <div style={{...glass,overflow:"hidden"}}>
          <div style={{padding:"14px 20px",borderBottom:"1px solid rgba(255,255,255,0.08)",display:"flex",alignItems:"center",gap:"8px"}}>
            <span className="material-symbols-rounded" style={{color:G,fontSize:"20px"}}>leaderboard</span>
            <span style={{color:"#f1f5f9",fontWeight:"700",fontSize:"0.9rem"}}>Leaderboard</span>
          </div>
          <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead><tr style={{background:"rgba(255,255,255,0.04)"}}>
              {["House","Rank","Points","Students","Avg HVS","Best"].map(h=><th key={h} style={{padding:"12px 16px",textAlign:"left",fontSize:"0.68rem",fontWeight:"700",color:"rgba(212,175,55,0.8)",borderBottom:"1px solid rgba(255,255,255,0.08)"}}>{h}</th>)}
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
      </>)}

      {/* ══ GRAND 300 TAB ══ */}
      {housesTab==="grand300"&&(
        <div>
          {/* Header */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"20px",flexWrap:"wrap",gap:"12px"}}>
            <div>
              <div style={{color:G,fontSize:"0.6rem",fontWeight:"700",letterSpacing:"0.12em",direction:"ltr",marginBottom:"4px"}}>HOUSE EVALUATION SYSTEM</div>
              <div style={{color:"#f1f5f9",fontSize:"1.2rem",fontWeight:"800"}}>🏆 Grand Total — 300 Points</div>
              <div style={{color:"rgba(255,255,255,0.35)",fontSize:"0.65rem",marginTop:"3px"}}>HVS(100) + Duties(60) + Training(40) + Society(60) + Leadership(40)</div>
            </div>
            <button onClick={doPrintGrand300} style={{display:"flex",alignItems:"center",gap:"8px",padding:"10px 20px",borderRadius:"10px",border:"1px solid rgba(74,222,128,0.4)",background:"rgba(74,222,128,0.08)",color:"#4ade80",fontWeight:"700",fontSize:"0.75rem",cursor:"pointer",fontFamily:"inherit"}}>
              🖨️ Print Grand Total
            </button>
          </div>

          {/* ── 4 House Summary Cards ── */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(210px,1fr))",gap:"14px",marginBottom:"24px"}}>
            {grand300Stats.map((h,rankIdx)=>{
              const pct=Math.round((h.total/300)*100);
              const rankLabels=["🥇 1st","🥈 2nd","🥉 3rd","4th"];
              const rankColors=["#d4af37","#94a3b8","#cd7f32","rgba(255,255,255,0.3)"];
              return (
                <div key={h.id} style={{...glass,padding:"18px",borderTop:`3px solid ${h.color}`,position:"relative"}}>
                  {/* Rank badge */}
                  <div style={{position:"absolute",top:"12px",left:"12px",background:`${rankColors[rankIdx]}20`,border:`1px solid ${rankColors[rankIdx]}50`,borderRadius:"8px",padding:"3px 9px",fontSize:"0.65rem",fontWeight:"800",color:rankColors[rankIdx]}}>
                    {rankLabels[rankIdx]}
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"14px",paddingTop:"12px"}}>
                    <span style={{fontSize:"1.8rem"}}>{h.emoji}</span>
                    <div>
                      <div style={{fontWeight:"800",color:h.color,fontSize:"0.88rem"}}>{h.nameEn}</div>
                    </div>
                  </div>
                  {/* Total score */}
                  <div style={{textAlign:"center",marginBottom:"12px",padding:"10px",background:`${h.color}10`,borderRadius:"10px",border:`1px solid ${h.color}20`}}>
                    <div style={{fontSize:"2.4rem",fontWeight:"900",color:h.color,lineHeight:1}}>{h.total}</div>
                    <div style={{fontSize:"0.62rem",color:"rgba(255,255,255,0.3)",marginTop:"2px"}}>/300 pts</div>
                  </div>
                  {/* Progress bar */}
                  <div style={{height:"6px",background:"rgba(255,255,255,0.08)",borderRadius:"3px",overflow:"hidden",marginBottom:"12px"}}>
                    <div style={{height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,${h.color}88,${h.color})`,borderRadius:"3px",transition:"width 0.6s"}}/>
                  </div>
                  {/* Component mini rows */}
                  {GRAND_COMPS.map(comp=>{
                    const val=h[comp.key];
                    const cpct=Math.round((val/comp.max)*100);
                    const col=cpct>=70?"#4ade80":cpct>=40?"#fb923c":"#f87171";
                    return (
                      <div key={comp.key} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"4px 0",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                        <div style={{fontSize:"0.62rem",color:"rgba(255,255,255,0.45)"}}>{comp.icon} {comp.labelEn}</div>
                        <div style={{display:"flex",alignItems:"center",gap:"6px"}}>
                          {val===0&&!comp.manual&&<span style={{fontSize:"0.5rem",color:"rgba(255,255,255,0.2)"}}>Pending</span>}
                          <span style={{fontSize:"0.72rem",fontWeight:"800",color:val>0?col:"rgba(255,255,255,0.2)"}}>{val}<span style={{fontSize:"0.52rem",color:"rgba(255,255,255,0.25)"}}>/{comp.max}</span></span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* ── Component Comparison (all 4 houses per component) ── */}
          <div style={{...glass,padding:"20px",marginBottom:"20px"}}>
            <div style={{fontSize:"0.78rem",fontWeight:"800",color:G,marginBottom:"18px"}}>📊 Component Comparison</div>
            {GRAND_COMPS.map(comp=>{
              const sortedForComp=[...grand300Stats].sort((a,b)=>b[comp.key]-a[comp.key]);
              return (
                <div key={comp.key} style={{marginBottom:"20px",paddingBottom:"18px",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"10px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
                      <span style={{fontSize:"1rem"}}>{comp.icon}</span>
                      <div>
                        <div style={{fontSize:"0.8rem",fontWeight:"800",color:"#f1f5f9"}}>{comp.labelEn}</div>
                        <div style={{fontSize:"0.58rem",color:"rgba(255,255,255,0.3)"}}>{comp.manual?"Director Entry":""}</div>
                      </div>
                    </div>
                    <span style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"8px",padding:"3px 10px",fontSize:"0.62rem",color:"rgba(255,255,255,0.4)",fontWeight:"700"}}>max {comp.max}</span>
                  </div>
                  {sortedForComp.map((h,ci)=>{
                    const val=h[comp.key];
                    const pct=Math.round((val/comp.max)*100);
                    const barCol=pct>=70?"#4ade80":pct>=40?"#fb923c":"#f87171";
                    const isPending=val===0&&!comp.manual;
                    return (
                      <div key={h.id} style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"8px"}}>
                        <span style={{fontSize:"0.9rem",flexShrink:0}}>{h.emoji}</span>
                        <div style={{width:"68px",flexShrink:0,fontSize:"0.65rem",fontWeight:"700",color:h.color,whiteSpace:"nowrap"}}>{h.nameEn}</div>
                        <div style={{flex:1,height:"10px",background:"rgba(255,255,255,0.06)",borderRadius:"5px",overflow:"hidden"}}>
                          <div style={{width:`${pct}%`,height:"100%",background:isPending?"rgba(255,255,255,0.1)":`linear-gradient(90deg,${h.color}88,${h.color})`,borderRadius:"5px",transition:"width 0.6s"}}/>
                        </div>
                        <div style={{width:"52px",textAlign:"left",flexShrink:0}}>
                          <span style={{fontSize:"0.75rem",fontWeight:"900",color:isPending?"rgba(255,255,255,0.2)":barCol}}>{val}</span>
                          <span style={{fontSize:"0.55rem",color:"rgba(255,255,255,0.25)"}}>/{comp.max}</span>
                        </div>
                        {isPending&&<span style={{fontSize:"0.55rem",color:"rgba(255,255,255,0.2)",flexShrink:0}}>Data Pending</span>}
                        {ci===0&&val>0&&<span style={{fontSize:"0.65rem",flexShrink:0}}>🥇</span>}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* ── Director: Training Scores Entry ── */}
          <div style={{...glass,padding:"20px",marginBottom:"20px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px",flexWrap:"wrap",gap:"10px"}}>
              <div>
                <div style={{fontSize:"0.8rem",fontWeight:"800",color:G}}>🎯 Training Integration</div>
                <div style={{fontSize:"0.62rem",color:"rgba(255,255,255,0.35)",marginTop:"3px"}}>Director Manual Entry • max 40 per house</div>
              </div>
              <button onClick={saveTraining} style={{padding:"8px 18px",borderRadius:"10px",border:"1px solid rgba(74,222,128,0.35)",background:"rgba(74,222,128,0.08)",color:"#4ade80",fontSize:"0.72rem",fontWeight:"700",cursor:"pointer",fontFamily:"inherit"}}>
                {trainingSaved?"✓ Saved":"💾 Save"}
              </button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:"14px"}}>
              {HOUSES.map(h=>{
                const val=Number(trainingScores[h.id])||0;
                const pct=Math.round((val/40)*100);
                const col=pct>=70?"#4ade80":pct>=40?"#fb923c":"#f87171";
                return (
                  <div key={h.id} style={{background:"rgba(255,255,255,0.04)",border:`1px solid ${h.color}25`,borderRadius:"12px",padding:"14px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"10px"}}>
                      <span style={{fontSize:"1.2rem"}}>{h.emoji}</span>
                      <div style={{fontSize:"0.75rem",fontWeight:"700",color:h.color}}>{h.nameEn}</div>
                    </div>
                    <input type="number" min={0} max={40} value={val||""}
                      onChange={e=>setTrainingScores(p=>({...p,[h.id]:Math.min(40,Math.max(0,Number(e.target.value)||0))}))}
                      placeholder="0"
                      style={{...inp,textAlign:"center",fontSize:"1.1rem",fontWeight:"800",color:val>0?col:"rgba(255,255,255,0.5)",border:`1px solid ${h.color}30`,marginBottom:"8px"}}/>
                    <div style={{height:"4px",background:"rgba(255,255,255,0.08)",borderRadius:"2px",overflow:"hidden"}}>
                      <div style={{width:`${pct}%`,height:"100%",background:`linear-gradient(90deg,${h.color}88,${h.color})`,borderRadius:"2px",transition:"width 0.4s"}}/>
                    </div>
                    <div style={{fontSize:"0.58rem",color:"rgba(255,255,255,0.25)",textAlign:"center",marginTop:"4px"}}>{val}/40 pts</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Ranking Table ── */}
          <div style={{...glass,overflow:"hidden"}}>
            <div style={{padding:"14px 20px",borderBottom:"1px solid rgba(255,255,255,0.08)",display:"flex",alignItems:"center",gap:"8px"}}>
              <span style={{color:G,fontSize:"1rem"}}>🏆</span>
              <span style={{color:"#f1f5f9",fontWeight:"800",fontSize:"0.9rem"}}>Grand 300 Ranking Table</span>
            </div>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",minWidth:"620px"}}>
                <thead>
                  <tr style={{background:"rgba(255,255,255,0.04)"}}>
                    {["Rank","House","HVS /100","Duties /60","Training /40","Society /60","Leadership /40","Total /300"].map(h=>(
                      <th key={h} style={{padding:"11px 14px",textAlign:"left",fontSize:"0.65rem",fontWeight:"700",color:"rgba(212,175,55,0.8)",borderBottom:"1px solid rgba(255,255,255,0.08)",whiteSpace:"nowrap"}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {grand300Stats.map((h,i)=>{
                    const rankBg=[
                      "rgba(212,175,55,0.08)","rgba(148,163,184,0.06)",
                      "rgba(205,127,50,0.05)","transparent"];
                    const rankCol=["#d4af37","#94a3b8","#cd7f32","rgba(255,255,255,0.4)"];
                    const rankMed=["🥇","🥈","🥉","4️⃣"];
                    const mkCell=(val,max)=>{
                      const pct=Math.round((val/max)*100);
                      const col=pct>=70?"#4ade80":pct>=40?"#fb923c":val>0?"#f87171":"rgba(255,255,255,0.25)";
                      return <td style={{padding:"11px 14px",whiteSpace:"nowrap"}}>
                        <span style={{fontWeight:"800",color:col,fontSize:"0.82rem"}}>{val}</span>
                        <span style={{fontSize:"0.55rem",color:"rgba(255,255,255,0.25)"}}>/{max}</span>
                        {val===0&&<span style={{fontSize:"0.5rem",color:"rgba(255,255,255,0.2)",marginRight:"4px"}}> —</span>}
                      </td>;
                    };
                    return (
                      <tr key={h.id} style={{borderBottom:"1px solid rgba(255,255,255,0.05)",background:rankBg[i]}}>
                        <td style={{padding:"11px 14px",fontWeight:"800",color:rankCol[i],fontSize:"1rem"}}>{rankMed[i]}</td>
                        <td style={{padding:"11px 14px"}}>
                          <span style={{padding:"4px 12px",borderRadius:"20px",fontSize:"0.72rem",fontWeight:"700",background:`${h.color}20`,color:h.color,border:`1px solid ${h.color}35`}}>
                            {h.emoji} {h.nameEn}
                          </span>
                        </td>
                        {mkCell(h.hvs100,100)}
                        {mkCell(h.duties60,60)}
                        {mkCell(h.training40,40)}
                        {mkCell(h.society60,60)}
                        {mkCell(h.leadership40,40)}
                        <td style={{padding:"11px 14px"}}>
                          <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
                            <span style={{fontSize:"1.1rem",fontWeight:"900",color:h.color}}>{h.total}</span>
                            <span style={{fontSize:"0.6rem",color:"rgba(255,255,255,0.25)"}}>/300</span>
                            <div style={{width:"50px",height:"5px",background:"rgba(255,255,255,0.08)",borderRadius:"3px",overflow:"hidden"}}>
                              <div style={{width:`${Math.round((h.total/300)*100)}%`,height:"100%",background:`linear-gradient(90deg,${h.color}88,${h.color})`,borderRadius:"3px"}}/>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ══ SUPER 400 TAB ══ */}
      {housesTab==="super400"&&(
        <div>
          {/* Tab header */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"20px",flexWrap:"wrap",gap:"12px"}}>
            <div>
              <div style={{color:G,fontSize:"0.6rem",fontWeight:"700",letterSpacing:"0.12em",direction:"ltr",marginBottom:"4px"}}>ANNUAL EVALUATION</div>
              <div style={{color:"#f1f5f9",fontSize:"1.2rem",fontWeight:"800"}}>🌟 Super House of the Year — 400 Points</div>
              <div style={{color:"rgba(255,255,255,0.35)",fontSize:"0.65rem",marginTop:"3px"}}>HVS(100) + Academic(100) + Activities(100) + Leadership(50) + Community(50)</div>
            </div>
            <button onClick={doPrintSuper400} style={{display:"flex",alignItems:"center",gap:"8px",padding:"10px 20px",borderRadius:"10px",border:"1px solid rgba(167,139,250,0.4)",background:"rgba(167,139,250,0.08)",color:"#a78bfa",fontWeight:"700",fontSize:"0.75rem",cursor:"pointer",fontFamily:"inherit"}}>
              🖨️ Print Annual Report
            </button>
          </div>

          {/* ── Current Leader Gold Banner ── */}
          {super400Stats[0]&&(
            <div style={{...glass,padding:"20px",marginBottom:"20px",border:`2px solid ${G}`,background:`linear-gradient(135deg,rgba(212,175,55,0.12),rgba(184,150,10,0.06))`,boxShadow:`0 0 40px rgba(212,175,55,0.18)`}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"12px"}}>
                <div style={{display:"flex",alignItems:"center",gap:"16px"}}>
                  <div style={{width:"56px",height:"56px",borderRadius:"50%",background:`linear-gradient(135deg,${G},#b8960a)`,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 4px 20px rgba(212,175,55,0.4)`,flexShrink:0}}>
                    <span style={{fontSize:"1.6rem"}}>{super400Stats[0].emoji}</span>
                  </div>
                  <div>
                    <div style={{fontSize:"0.65rem",color:G,fontWeight:"700",letterSpacing:"0.1em",marginBottom:"3px"}}>🏆 CURRENT LEADER</div>
                    <div style={{fontSize:"1.4rem",fontWeight:"900",color:"#f1f5f9",lineHeight:1}}>{super400Stats[0].nameEn}</div>
                  </div>
                </div>
                <div style={{textAlign:"center"}}>
                  <div style={{fontSize:"3rem",fontWeight:"900",color:G,lineHeight:1}}>{super400Stats[0].total}</div>
                  <div style={{fontSize:"0.7rem",color:"rgba(212,175,55,0.6)",fontWeight:"600"}}>/400 pts</div>
                  <div style={{fontSize:"0.62rem",color:"rgba(255,255,255,0.3)",marginTop:"4px"}}>{Math.round((super400Stats[0].total/400)*100)}% complete</div>
                </div>
              </div>
            </div>
          )}

          {/* ── 4 Circular Progress Cards ── */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:"16px",marginBottom:"24px"}}>
            {super400Stats.map((h,rankIdx)=>{
              const pct = Math.round((h.total/400)*100);
              const rankColors=["#d4af37","#94a3b8","#cd7f32","rgba(255,255,255,0.3)"];
              const rankLabels=["🥇 1st","🥈 2nd","🥉 3rd","4th"];
              const conicBg = `conic-gradient(${h.color} ${pct}%, rgba(255,255,255,0.08) ${pct}%)`;
              return (
                <div key={h.id} style={{...glass,padding:"20px",borderTop:`3px solid ${h.color}`,display:"flex",flexDirection:"column",alignItems:"center",position:"relative"}}>
                  {/* Rank badge */}
                  <div style={{position:"absolute",top:"12px",left:"12px",background:`${rankColors[rankIdx]}20`,border:`1px solid ${rankColors[rankIdx]}50`,borderRadius:"8px",padding:"3px 9px",fontSize:"0.62rem",fontWeight:"800",color:rankColors[rankIdx]}}>
                    {rankLabels[rankIdx]}
                  </div>
                  {/* Circular progress */}
                  <div style={{position:"relative",width:"110px",height:"110px",margin:"12px 0 16px"}}>
                    {/* Outer ring: conic-gradient */}
                    <div style={{width:"110px",height:"110px",borderRadius:"50%",background:conicBg,display:"flex",alignItems:"center",justifyContent:"center"}}>
                      {/* Inner circle mask */}
                      <div style={{width:"80px",height:"80px",borderRadius:"50%",background:"rgba(15,23,42,0.95)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",border:`2px solid rgba(255,255,255,0.06)`}}>
                        <span style={{fontSize:"1.5rem",lineHeight:1}}>{h.emoji}</span>
                        <div style={{fontSize:"0.68rem",fontWeight:"900",color:h.color,lineHeight:1,marginTop:"3px"}}>{h.total}</div>
                        <div style={{fontSize:"0.5rem",color:"rgba(255,255,255,0.3)"}}>/400</div>
                      </div>
                    </div>
                    {/* Percentage label */}
                    <div style={{position:"absolute",bottom:"-6px",left:"50%",transform:"translateX(-50%)",background:`${h.color}30`,border:`1px solid ${h.color}50`,borderRadius:"10px",padding:"2px 8px",fontSize:"0.58rem",fontWeight:"800",color:h.color,whiteSpace:"nowrap"}}>
                      {pct}%
                    </div>
                  </div>
                  <div style={{fontWeight:"800",color:h.color,fontSize:"0.9rem",marginBottom:"14px",textAlign:"center"}}>{h.nameEn}</div>
                  {/* Per-category breakdown */}
                  {SUPER400_CATS.map(cat=>{
                    const val = h[cat.key];
                    const cpct = Math.round((val/cat.max)*100);
                    const barCol = cpct>=70?"#4ade80":cpct>=40?"#fb923c":"#f87171";
                    return (
                      <div key={cat.key} style={{width:"100%",marginBottom:"6px"}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"2px"}}>
                          <div style={{fontSize:"0.58rem",color:"rgba(255,255,255,0.4)"}}>{cat.icon} {cat.labelEn}</div>
                          <div style={{fontSize:"0.65rem",fontWeight:"800",color:val>0?barCol:"rgba(255,255,255,0.2)"}}>{val}<span style={{fontSize:"0.5rem",color:"rgba(255,255,255,0.2)"}}>/{cat.max}</span></div>
                        </div>
                        <div style={{height:"4px",background:"rgba(255,255,255,0.06)",borderRadius:"2px",overflow:"hidden"}}>
                          <div style={{width:`${cpct}%`,height:"100%",background:`linear-gradient(90deg,${cat.color}88,${cat.color})`,borderRadius:"2px",transition:"width 0.5s"}}/>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* ── Component Comparison bars ── */}
          <div style={{...glass,padding:"20px",marginBottom:"20px"}}>
            <div style={{fontSize:"0.78rem",fontWeight:"800",color:G,marginBottom:"18px"}}>📊 Component Comparison</div>
            {SUPER400_CATS.map(cat=>{
              const sortedForCat=[...super400Stats].sort((a,b)=>b[cat.key]-a[cat.key]);
              return (
                <div key={cat.key} style={{marginBottom:"20px",paddingBottom:"18px",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"10px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
                      <span style={{fontSize:"1.1rem"}}>{cat.icon}</span>
                      <div>
                        <div style={{fontSize:"0.8rem",fontWeight:"800",color:"#f1f5f9"}}>{cat.labelEn}{cat.manual?" • Director Entry":""}</div>
                      </div>
                    </div>
                    <span style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"8px",padding:"3px 10px",fontSize:"0.62rem",color:"rgba(255,255,255,0.4)",fontWeight:"700"}}>max {cat.max}</span>
                  </div>
                  {sortedForCat.map((h,ci)=>{
                    const val = h[cat.key];
                    const pct = Math.round((val/cat.max)*100);
                    const isPending = val===0 && !cat.manual;
                    return (
                      <div key={h.id} style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"8px"}}>
                        <span style={{fontSize:"0.9rem",flexShrink:0}}>{h.emoji}</span>
                        <div style={{width:"68px",flexShrink:0,fontSize:"0.65rem",fontWeight:"700",color:h.color,whiteSpace:"nowrap"}}>{h.nameEn}</div>
                        <div style={{flex:1,height:"10px",background:"rgba(255,255,255,0.06)",borderRadius:"5px",overflow:"hidden"}}>
                          <div style={{width:`${pct}%`,height:"100%",background:isPending?"rgba(255,255,255,0.1)":`linear-gradient(90deg,${cat.color}88,${cat.color})`,borderRadius:"5px",transition:"width 0.6s"}}/>
                        </div>
                        <div style={{width:"52px",textAlign:"left",flexShrink:0}}>
                          <span style={{fontSize:"0.75rem",fontWeight:"900",color:isPending?"rgba(255,255,255,0.2)":pct>=70?"#4ade80":pct>=40?"#fb923c":"#f87171"}}>{val}</span>
                          <span style={{fontSize:"0.55rem",color:"rgba(255,255,255,0.25)"}}>/{cat.max}</span>
                        </div>
                        {ci===0&&val>0&&<span style={{fontSize:"0.65rem",flexShrink:0}}>🥇</span>}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* ── Director Manual Entry: Academic (3 terms) + Community ── */}
          <div style={{...glass,padding:"20px",marginBottom:"20px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"18px",flexWrap:"wrap",gap:"10px"}}>
              <div>
                <div style={{fontSize:"0.8rem",fontWeight:"800",color:G}}>📝 Director Manual Entry</div>
                <div style={{fontSize:"0.62rem",color:"rgba(255,255,255,0.35)",marginTop:"3px"}}>Academic (3 Terms, max 100 total) • Community/Service (max 50)</div>
              </div>
              <button onClick={saveSuper400Manual} style={{padding:"8px 18px",borderRadius:"10px",border:"1px solid rgba(74,222,128,0.35)",background:"rgba(74,222,128,0.08)",color:"#4ade80",fontSize:"0.72rem",fontWeight:"700",cursor:"pointer",fontFamily:"inherit"}}>
                {super400Saved?"✓ Saved":"💾 Save"}
              </button>
            </div>
            {/* Academic 3 Terms grid */}
            <div style={{fontSize:"0.72rem",fontWeight:"700",color:"#34d399",marginBottom:"12px"}}>📚 Academic Performance (3 Terms)</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:"14px",marginBottom:"24px"}}>
              {HOUSES.map(h=>{
                const ac = academicScores[h.id] || {};
                const t1=Number(ac.t1)||0, t2=Number(ac.t2)||0, t3=Number(ac.t3)||0;
                const total = Math.min(100, t1+t2+t3);
                const pct = Math.round((total/100)*100);
                return (
                  <div key={h.id} style={{background:"rgba(255,255,255,0.04)",border:`1px solid ${h.color}25`,borderRadius:"12px",padding:"14px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"12px"}}>
                      <span style={{fontSize:"1.2rem"}}>{h.emoji}</span>
                      <div style={{fontSize:"0.78rem",fontWeight:"700",color:h.color}}>{h.nameEn}</div>
                      <div style={{marginRight:"auto",fontSize:"0.72rem",fontWeight:"800",color:pct>=70?"#4ade80":pct>=40?"#fb923c":"#f87171"}}>{total}/100</div>
                    </div>
                    {[["t1","Term 1",35],["t2","Term 2",35],["t3","Term 3",30]].map(([k,en,mx])=>(
                      <div key={k} style={{marginBottom:"8px"}}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:"3px"}}>
                          <span style={{fontSize:"0.6rem",color:"rgba(255,255,255,0.4)"}}>{en}</span>
                          <span style={{fontSize:"0.58rem",color:"rgba(255,255,255,0.25)"}}>max {mx}</span>
                        </div>
                        <input type="number" min={0} max={mx} value={Number(ac[k])||""}
                          onChange={e=>setAcademicScores(p=>({...p,[h.id]:{...(p[h.id]||{}),[k]:Math.min(mx,Math.max(0,Number(e.target.value)||0))}}))}
                          placeholder="0"
                          style={{...inp,textAlign:"center",fontSize:"0.9rem",fontWeight:"700",color:Number(ac[k])>0?"#34d399":"rgba(255,255,255,0.4)",border:`1px solid ${h.color}25`}}/>
                      </div>
                    ))}
                    <div style={{height:"4px",background:"rgba(255,255,255,0.08)",borderRadius:"2px",overflow:"hidden",marginTop:"6px"}}>
                      <div style={{width:`${pct}%`,height:"100%",background:"linear-gradient(90deg,#34d39988,#34d399)",borderRadius:"2px",transition:"width 0.4s"}}/>
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Community/Service grid */}
            <div style={{fontSize:"0.72rem",fontWeight:"700",color:"#f472b6",marginBottom:"12px"}}>🤝 Community / Service</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:"14px"}}>
              {HOUSES.map(h=>{
                const val = Number(community400[h.id])||0;
                const pct = Math.round((val/50)*100);
                const col = pct>=70?"#4ade80":pct>=40?"#fb923c":"#f87171";
                return (
                  <div key={h.id} style={{background:"rgba(255,255,255,0.04)",border:`1px solid ${h.color}25`,borderRadius:"12px",padding:"14px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"10px"}}>
                      <span style={{fontSize:"1.1rem"}}>{h.emoji}</span>
                      <div style={{fontSize:"0.75rem",fontWeight:"700",color:h.color}}>{h.nameEn}</div>
                    </div>
                    <input type="number" min={0} max={50} value={val||""}
                      onChange={e=>setCommunity400(p=>({...p,[h.id]:Math.min(50,Math.max(0,Number(e.target.value)||0))}))}
                      placeholder="0"
                      style={{...inp,textAlign:"center",fontSize:"1.1rem",fontWeight:"800",color:val>0?col:"rgba(255,255,255,0.5)",border:`1px solid ${h.color}30`,marginBottom:"8px"}}/>
                    <div style={{height:"4px",background:"rgba(255,255,255,0.08)",borderRadius:"2px",overflow:"hidden"}}>
                      <div style={{width:`${pct}%`,height:"100%",background:"linear-gradient(90deg,#f472b688,#f472b6)",borderRadius:"2px",transition:"width 0.4s"}}/>
                    </div>
                    <div style={{fontSize:"0.58rem",color:"rgba(255,255,255,0.25)",textAlign:"center",marginTop:"4px"}}>{val}/50 pts</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Ranking Table ── */}
          <div style={{...glass,overflow:"hidden"}}>
            <div style={{padding:"14px 20px",borderBottom:"1px solid rgba(255,255,255,0.08)",display:"flex",alignItems:"center",gap:"8px"}}>
              <span style={{color:G,fontSize:"1rem"}}>🌟</span>
              <span style={{color:"#f1f5f9",fontWeight:"800",fontSize:"0.9rem"}}>Super 400 Ranking Table</span>
            </div>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",minWidth:"640px"}}>
                <thead>
                  <tr style={{background:"rgba(255,255,255,0.04)"}}>
                    {["Rank","House","HVS /100","Academic /100","Activities /100","Leadership /50","Community /50","Total /400"].map(h=>(
                      <th key={h} style={{padding:"11px 14px",textAlign:"left",fontSize:"0.65rem",fontWeight:"700",color:"rgba(212,175,55,0.8)",borderBottom:"1px solid rgba(255,255,255,0.08)",whiteSpace:"nowrap"}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {super400Stats.map((h,i)=>{
                    const rankBg=["rgba(212,175,55,0.08)","rgba(148,163,184,0.06)","rgba(205,127,50,0.05)","transparent"];
                    const rankCol=["#d4af37","#94a3b8","#cd7f32","rgba(255,255,255,0.4)"];
                    const rankMed=["🥇","🥈","🥉","4️⃣"];
                    const mkCell=(val,max)=>{
                      const pct=Math.round((val/max)*100);
                      const col=pct>=70?"#4ade80":pct>=40?"#fb923c":val>0?"#f87171":"rgba(255,255,255,0.25)";
                      return <td style={{padding:"11px 14px",whiteSpace:"nowrap"}}>
                        <span style={{fontWeight:"800",color:col,fontSize:"0.82rem"}}>{val}</span>
                        <span style={{fontSize:"0.55rem",color:"rgba(255,255,255,0.25)"}}>/{max}</span>
                      </td>;
                    };
                    return (
                      <tr key={h.id} style={{borderBottom:"1px solid rgba(255,255,255,0.05)",background:rankBg[i]}}>
                        <td style={{padding:"11px 14px",fontWeight:"800",color:rankCol[i],fontSize:"1rem"}}>{rankMed[i]}</td>
                        <td style={{padding:"11px 14px"}}>
                          <span style={{padding:"4px 12px",borderRadius:"20px",fontSize:"0.72rem",fontWeight:"700",background:`${h.color}20`,color:h.color,border:`1px solid ${h.color}35`}}>
                            {h.emoji} {h.nameEn}
                          </span>
                        </td>
                        {mkCell(h.hvsDiscipline,100)}
                        {mkCell(h.academic,100)}
                        {mkCell(h.activities,100)}
                        {mkCell(h.leadership,50)}
                        {mkCell(h.community,50)}
                        <td style={{padding:"11px 14px"}}>
                          <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
                            <span style={{fontSize:"1.1rem",fontWeight:"900",color:h.color}}>{h.total}</span>
                            <span style={{fontSize:"0.6rem",color:"rgba(255,255,255,0.25)"}}>/400</span>
                            <div style={{width:"50px",height:"5px",background:"rgba(255,255,255,0.08)",borderRadius:"3px",overflow:"hidden"}}>
                              <div style={{width:`${Math.round((h.total/400)*100)}%`,height:"100%",background:`linear-gradient(90deg,${h.color}88,${h.color})`,borderRadius:"3px"}}/>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ══ AWARDS TAB ══ */}
      {housesTab==="awards"&&(
        <div>
          {/* Awards Hub header */}
          <div style={{marginBottom:"20px"}}>
            <div style={{color:G,fontSize:"0.62rem",fontWeight:"700",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:"4px",direction:"ltr"}}>AWARDS SYSTEM</div>
            <div style={{color:"#f1f5f9",fontSize:"1.2rem",fontWeight:"800"}}>🏆 Awards Hub</div>
          </div>
          <AwardsHub role={userRole||"teacher"} students={students} hvsLogs={hvsLogs} hifzLogs={[]} />

        </div>
      )}

      {/* ── Super 400 Print Area (hidden on screen) ── */}
      <div id="super400-print-area" style={{position:"absolute",left:"-9999px",top:0,width:"210mm"}}>
        <div style={{background:"#fff",fontFamily:"'Segoe UI',Tahoma,sans-serif",direction:"ltr",color:"#0f172a"}}>
          <img src={letterhead} alt="" style={{width:"100%",display:"block"}}/>
          <div style={{padding:"12px 36px 8px",borderBottom:"2px solid #b7860b",textAlign:"center"}}>
            <div style={{fontSize:"1.2rem",fontWeight:"800",color:"#7a5807"}}>🌟 Super House of the Year — 400 Points</div>
            <div style={{fontSize:"0.68rem",color:"#888",fontFamily:"'Segoe UI',sans-serif",marginTop:"4px"}}>
              Annual Review — Academic Year {new Date().getFullYear()}-{new Date().getFullYear()+1}
            </div>
          </div>
          <div style={{padding:"16px 36px"}}>
            {/* Ranking Table */}
            <div style={{fontWeight:"800",color:"#7a5807",fontSize:"0.85rem",marginBottom:"10px",borderBottom:"1px solid #f5e9c8",paddingBottom:"6px"}}>📊 Annual Ranking</div>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:"0.8rem",marginBottom:"20px"}}>
              <thead>
                <tr style={{background:"#fffdf8"}}>
                  {["Rank","House","HVS/100","Academic/100","Activities/100","Leadership/50","Community/50","Total/400"].map(h=>(
                    <th key={h} style={{padding:"7px 10px",textAlign:"left",borderBottom:"2px solid #b7860b",color:"#7a5807",fontWeight:"700"}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {super400Stats.map((h,i)=>{
                  const medals=["🥇","🥈","🥉","4️⃣"];
                  return (
                    <tr key={h.id} style={{background:i%2===0?"#fffdf8":"#fff",borderBottom:"1px solid #f5e9c8"}}>
                      <td style={{padding:"7px 10px",fontWeight:"800",fontSize:"1rem"}}>{medals[i]}</td>
                      <td style={{padding:"7px 10px",fontWeight:"800",color:"#1e293b"}}>{h.emoji} {h.nameEn}</td>
                      <td style={{padding:"7px 10px",textAlign:"center"}}>{h.hvsDiscipline}</td>
                      <td style={{padding:"7px 10px",textAlign:"center"}}>{h.academic}</td>
                      <td style={{padding:"7px 10px",textAlign:"center"}}>{h.activities}</td>
                      <td style={{padding:"7px 10px",textAlign:"center"}}>{h.leadership}</td>
                      <td style={{padding:"7px 10px",textAlign:"center"}}>{h.community}</td>
                      <td style={{padding:"7px 10px",textAlign:"center",fontWeight:"900",fontSize:"1rem",color:"#7a5807"}}>{h.total}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {/* Component key */}
            <div style={{fontSize:"0.7rem",color:"#666",marginBottom:"20px",background:"#fffbee",padding:"8px 12px",borderRadius:"6px",border:"1px solid #f5e9c8"}}>
              <strong>Note:</strong> HVS = Annual avg HM score ×2 | Academic = 3-term total | Activities = Event score | Leadership = Leadership module | Community = Director entry
            </div>
            {/* Academic details */}
            <div style={{fontWeight:"800",color:"#7a5807",fontSize:"0.82rem",marginBottom:"8px",borderBottom:"1px solid #f5e9c8",paddingBottom:"6px"}}>📚 Academic Term Details</div>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:"0.78rem",marginBottom:"20px"}}>
              <thead><tr style={{background:"#fffdf8"}}>
                {["House","Term 1","Term 2","Term 3","Total"].map(h=><th key={h} style={{padding:"6px 10px",textAlign:"left",borderBottom:"1px solid #b7860b",color:"#7a5807",fontWeight:"700"}}>{h}</th>)}
              </tr></thead>
              <tbody>
                {super400Stats.map((h,i)=>{
                  const ac = academicScores[h.id]||{};
                  return (
                    <tr key={h.id} style={{background:i%2===0?"#fffdf8":"#fff",borderBottom:"1px solid #f5e9c8"}}>
                      <td style={{padding:"6px 10px",fontWeight:"700"}}>{h.emoji} {h.nameEn}</td>
                      <td style={{padding:"6px 10px",textAlign:"center"}}>{Number(ac.t1)||0}</td>
                      <td style={{padding:"6px 10px",textAlign:"center"}}>{Number(ac.t2)||0}</td>
                      <td style={{padding:"6px 10px",textAlign:"center"}}>{Number(ac.t3)||0}</td>
                      <td style={{padding:"6px 10px",textAlign:"center",fontWeight:"800"}}>{h.academic}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {/* Signature */}
            <div style={{display:"flex",justifyContent:"space-between",paddingTop:"12px",borderTop:"1px solid #f0ede8"}}>
              <div style={{textAlign:"center",minWidth:"160px"}}>
                <div style={{borderTop:"1.5px solid #0f172a",paddingTop:"8px",fontSize:"0.7rem",color:"#444",fontWeight:"600"}}>Director Signature</div>
              </div>
              <div style={{textAlign:"center",fontSize:"0.6rem",color:"#aaa",fontFamily:"'Segoe UI',sans-serif",alignSelf:"flex-end"}}>
                Printed on: {new Date().toLocaleDateString("en-PK",{year:"numeric",month:"long",day:"numeric"})}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Grand 300 Print Area (hidden on screen) ── */}
      <div id="grand300-print-area" style={{position:"absolute",left:"-9999px",top:0,width:"210mm"}}>
        <div style={{background:"#fff",fontFamily:"'Segoe UI',Tahoma,sans-serif",direction:"ltr",color:"#0f172a"}}>
          <img src={letterhead} alt="" style={{width:"100%",display:"block"}}/>
          <div style={{padding:"12px 36px 8px",borderBottom:"2px solid #b7860b",textAlign:"center"}}>
            <div style={{fontSize:"1.2rem",fontWeight:"800",color:"#7a5807"}}>🏆 Grand Total — 300 Points</div>
            <div style={{fontSize:"0.7rem",color:"#888",fontFamily:"'Segoe UI',sans-serif",marginTop:"4px"}}>
              Academic Year {new Date().getFullYear()}-{new Date().getFullYear()+1}
            </div>
          </div>
          <div style={{padding:"16px 36px"}}>
            {/* Summary table */}
            <div style={{fontWeight:"800",color:"#7a5807",fontSize:"0.85rem",marginBottom:"10px",borderBottom:"1px solid #f5e9c8",paddingBottom:"6px"}}>📊 Grand 300 Ranking</div>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:"0.8rem",marginBottom:"20px"}}>
              <thead>
                <tr style={{background:"#fffdf8"}}>
                  {["Rank","House","HVS/100","Duties/60","Training/40","Society/60","Leadership/40","Total/300"].map(h=>(
                    <th key={h} style={{padding:"7px 10px",textAlign:"left",borderBottom:"2px solid #b7860b",color:"#7a5807",fontWeight:"700"}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {grand300Stats.map((h,i)=>{
                  const medals=["🥇","🥈","🥉","4️⃣"];
                  return (
                    <tr key={h.id} style={{background:i%2===0?"#fffdf8":"#fff",borderBottom:"1px solid #f5e9c8"}}>
                      <td style={{padding:"7px 10px",fontWeight:"800",fontSize:"1rem"}}>{medals[i]}</td>
                      <td style={{padding:"7px 10px",fontWeight:"800",color:"#1e293b"}}>{h.emoji} {h.nameEn}</td>
                      <td style={{padding:"7px 10px",textAlign:"center"}}>{h.hvs100}</td>
                      <td style={{padding:"7px 10px",textAlign:"center"}}>{h.duties60}</td>
                      <td style={{padding:"7px 10px",textAlign:"center"}}>{h.training40}</td>
                      <td style={{padding:"7px 10px",textAlign:"center"}}>{h.society60}</td>
                      <td style={{padding:"7px 10px",textAlign:"center"}}>{h.leadership40}</td>
                      <td style={{padding:"7px 10px",textAlign:"center",fontWeight:"900",fontSize:"1rem",color:"#7a5807"}}>{h.total}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {/* Component note */}
            <div style={{fontSize:"0.7rem",color:"#666",marginBottom:"20px",background:"#fffbee",padding:"8px 12px",borderRadius:"6px",border:"1px solid #f5e9c8"}}>
              <strong>Note:</strong> HVS = Avg HM score × 2 | Duties = Weekly duty avg | Training = Director entry | Society = Total society score | Leadership = Total leadership score
            </div>
            {/* Signature */}
            <div style={{display:"flex",justifyContent:"space-between",paddingTop:"12px",borderTop:"1px solid #f0ede8"}}>
              <div style={{textAlign:"center",minWidth:"160px"}}>
                <div style={{borderTop:"1.5px solid #0f172a",paddingTop:"8px",fontSize:"0.7rem",color:"#444",fontWeight:"600"}}>Director Signature</div>
              </div>
              <div style={{textAlign:"center",fontSize:"0.6rem",color:"#aaa",fontFamily:"'Segoe UI',sans-serif",alignSelf:"flex-end"}}>
                Printed on: {new Date().toLocaleDateString("en-PK",{year:"numeric",month:"long",day:"numeric"})}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Print Area (hidden on screen) ── */}
      <div id="awards-print-area" style={{position:"absolute",left:"-9999px",top:0,width:"210mm"}}>
        <div style={{background:"#fff",fontFamily:"'Segoe UI','Public Sans',sans-serif",direction:"ltr",color:"#0f172a"}}>
          <img src={letterhead} alt="" style={{width:"100%",display:"block"}}/>
          <div style={{padding:"16px 40px 8px",borderBottom:"2px solid #b7860b",textAlign:"center"}}>
            <div style={{fontSize:"1.3rem",fontWeight:"800",color:"#7a5807"}}>🏅 Annual Awards</div>
            <div style={{fontSize:"0.72rem",color:"#888",fontFamily:"'Public Sans',monospace",marginTop:"4px"}}>Academic Year {new Date().getFullYear()}-{new Date().getFullYear()+1}</div>
          </div>
          <div style={{padding:"20px 40px"}}>
            {/* House Awards */}
            <div style={{fontWeight:"800",color:"#7a5807",fontSize:"0.88rem",marginBottom:"10px",borderBottom:"1px solid #f5e9c8",paddingBottom:"6px"}}>🏠 House Awards</div>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:"0.82rem",marginBottom:"20px"}}>
              <thead><tr style={{background:"#fffdf8"}}>
                {["#","Award","Winning House","Basis"].map(h=><th key={h} style={{padding:"8px 10px",textAlign:"left",borderBottom:"2px solid #b7860b",color:"#7a5807",fontWeight:"700"}}>{h}</th>)}
              </tr></thead>
              <tbody>
                {HOUSE_AWARDS.map((aw,i)=>{
                  const auto=autoAwards[aw.key];
                  const winner=overrides[aw.key]?.trim()||auto.winner;
                  return (
                    <tr key={aw.key} style={{background:i%2===0?"#fffdf8":"#fff",borderBottom:"1px solid #f5e9c8"}}>
                      <td style={{padding:"8px 10px",fontWeight:"700",color:"#7a5807"}}>{aw.no}</td>
                      <td style={{padding:"8px 10px",fontWeight:"600"}}>{aw.icon} {aw.titleEn}</td>
                      <td style={{padding:"8px 10px",fontWeight:"800",color:"#1e293b"}}>{auto.emoji} {winner}</td>
                      <td style={{padding:"8px 10px",color:"#666",fontSize:"0.72rem"}}>{auto.data}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {/* Individual + Teacher Awards */}
            <div style={{fontWeight:"800",color:"#7a5807",fontSize:"0.88rem",marginBottom:"10px",borderBottom:"1px solid #f5e9c8",paddingBottom:"6px"}}>🌟 Individual &amp; Teacher Awards</div>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:"0.82rem",marginBottom:"32px"}}>
              <thead><tr style={{background:"#fffdf8"}}>
                {["#","Award","Winner"].map(h=><th key={h} style={{padding:"8px 10px",textAlign:"left",borderBottom:"2px solid #b7860b",color:"#7a5807",fontWeight:"700"}}>{h}</th>)}
              </tr></thead>
              <tbody>
                {MANUAL_AWARDS.map((aw,i)=>(
                  <tr key={aw.key} style={{background:i%2===0?"#fffdf8":"#fff",borderBottom:"1px solid #f5e9c8"}}>
                    <td style={{padding:"8px 10px",fontWeight:"700",color:"#7a5807"}}>{aw.no}</td>
                    <td style={{padding:"8px 10px",fontWeight:"600"}}>{aw.icon} {aw.titleEn}</td>
                    <td style={{padding:"8px 10px",fontWeight:"800",color:"#1e293b"}}>{manualWinners[aw.key]||"—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Signature */}
            <div style={{display:"flex",justifyContent:"space-between",paddingTop:"12px",borderTop:"1px solid #f0ede8"}}>
              <div style={{textAlign:"center",minWidth:"160px"}}>
                <div style={{borderTop:"1.5px solid #0f172a",paddingTop:"8px",fontSize:"0.72rem",color:"#444",fontWeight:"600"}}>Director Signature</div>
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

export default Houses;
