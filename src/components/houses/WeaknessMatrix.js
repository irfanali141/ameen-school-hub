/* eslint-disable */
import { useState, useEffect } from "react";
import { HOUSES } from "../../constants";
import { getData } from "../../supabase";
import letterhead from "../../assets/letterhead.png";

// ── Config ──
const DEFAULT_AREAS = [
  { area:"Academic",      areaUr:"علمی"       },
  { area:"Discipline",    areaUr:"نظم و ضبط"  },
  { area:"Moral",         areaUr:"اخلاقی"     },
  { area:"Participation", areaUr:"شرکت"       },
  { area:"Cleanliness",   areaUr:"صفائی"      },
  { area:"Leadership",    areaUr:"قیادت"      },
];

const SCORES = {
  1: { label:"بہت کمزور",  labelEn:"بہت کمزور",  color:"#dc2626", bg:"#fff5f5" },
  2: { label:"کمزور",      labelEn:"کمزور",       color:"#f97316", bg:"#fff7ed" },
  3: { label:"معمولی",     labelEn:"معمولی",      color:"#eab308", bg:"#fefce8" },
  4: { label:"اچھا",       labelEn:"اچھا",        color:"#3b82f6", bg:"#eff6ff" },
  5: { label:"بہترین",     labelEn:"بہترین",      color:"#22c55e", bg:"#f0fdf4" },
};

const STATUS_OPTS = [
  { id:"Open",        icon:"🔴", label:"کھلا",      color:"#dc2626" },
  { id:"In Progress", icon:"🟠", label:"جاری",       color:"#f97316" },
  { id:"Resolved",    icon:"✅", label:"حل شدہ",    color:"#22c55e" },
];

const emptyRow = (area="", areaUr="") => ({
  area, areaUr, weaknessSign:"", score:3, observation:"", action:"", status:"Open", custom:!area,
});

const makeDefaultRows = () => DEFAULT_AREAS.map(a=>emptyRow(a.area, a.areaUr));

const prevMonth = (m) => {
  const [y,mo] = m.split("-").map(Number);
  return mo===1 ? `${y-1}-12` : `${y}-${String(mo-1).padStart(2,"0")}`;
};

// ── Shared styles ──
const G="#d4af37"; const N="#0f172a"; const N2="#1e293b";
const glass = { background:"rgba(255,255,255,0.06)", backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"16px" };
const inp   = { padding:"7px 10px", borderRadius:"8px", border:"1px solid rgba(212,175,55,0.2)", background:"rgba(255,255,255,0.05)", color:"#f1f5f9", fontSize:"0.7rem", fontFamily:"inherit", outline:"none", boxSizing:"border-box", colorScheme:"dark", width:"100%" };

const injectPrint = () => {
  if(!document.getElementById("wdm-print-style")){
    const s=document.createElement("style");
    s.id="wdm-print-style";
    s.innerHTML=`@media print{body *{visibility:hidden!important}#wdm-print-area,#wdm-print-area *{visibility:visible!important}#wdm-print-area{position:fixed!important;top:0;left:0;width:100%;background:white;padding:0;margin:0;color:#000;font-family:serif;direction:rtl}@page{margin:0;size:A4}.no-print{display:none!important}}`;
    document.head.appendChild(s);
  }
  window.print();
};

export default function WeaknessMatrix({ addData, hvsLogs=[], houses=[], students=[] }) {
  const [houseId,  setHouseId]  = useState("abuBakr");
  const [month,    setMonth]    = useState(new Date().toISOString().slice(0,7));
  const [rows,     setRows]     = useState(makeDefaultRows());
  const [allData,  setAllData]  = useState([]);
  const [saving,   setSaving]   = useState(false);
  const [done,     setDone]     = useState(false);

  // ── Load all records ──
  const load = async () => {
    try {
      const data = await getData("weakness_matrix");
      setAllData(data||[]);
    } catch(e){ console.error("wdm load:",e.message); }
  };

  useEffect(()=>{ load(); },[]);

  // ── Populate rows when house or month changes ──
  useEffect(()=>{
    const rec = [...(allData||[])]
      .filter(d=>d.houseId===houseId && d.month===month)
      .sort((a,b)=>new Date(b.createdAt||0)-new Date(a.createdAt||0))[0];
    if(rec?.rows){ setRows(rec.rows); }
    else { setRows(makeDefaultRows()); }
  },[houseId, month, allData]);

  // ── AUTO: detect weak areas from hvsLogs for this house+month ──
  const autoWeakAreas = (() => {
    const [y,m] = month.split("-");
    const monthLogs = hvsLogs.filter(l=>{
      const lDate=(l.date||l.created_at||"").slice(0,7);
      return (l.houseId||l.house_id)===houseId && lDate===month;
    });
    if(!monthLogs.length) return {};
    // Map HVS categories to weakness areas
    const cats = { zabt:"Discipline", safai:"Cleanliness", josh:"Participation", qiyadat:"Leadership", ilm:"Academic", akhlaq:"Moral" };
    const sums = {}; const counts = {};
    monthLogs.forEach(l=>{
      const gs = l.group_scores||l.scores||{};
      Object.entries(cats).forEach(([cat,area])=>{
        if(gs[cat]!==undefined){ sums[area]=(sums[area]||0)+Number(gs[cat]); counts[area]=(counts[area]||0)+1; }
      });
    });
    // Convert avg to 1-5 score
    const maxes = { Discipline:15, Cleanliness:15, Participation:10, Leadership:10, Academic:25, Moral:15 };
    const result = {};
    Object.entries(sums).forEach(([area,sum])=>{
      const avg = sum/counts[area];
      const pct = avg/(maxes[area]||10);
      result[area] = Math.max(1, Math.min(5, Math.round(pct*5)));
    });
    return result;
  })();

  // House students count
  const houseStudentCount = students.filter(s=>(s.houseId||s.house_id)===houseId).length;

  // ── Computed values ──
  const currentAvg = rows.length ? (rows.reduce((s,r)=>s+(r.score||3),0)/rows.length) : 0;

  const prevRec = [...(allData||[])]
    .filter(d=>d.houseId===houseId && d.month===prevMonth(month))
    .sort((a,b)=>new Date(b.createdAt||0)-new Date(a.createdAt||0))[0];
  const prevAvg = prevRec?.rows?.length
    ? prevRec.rows.reduce((s,r)=>s+(r.score||3),0)/prevRec.rows.length : null;
  const improvePct = prevAvg ? Math.round(((currentAvg-prevAvg)/prevAvg)*100) : null;

  const top3Weak = [...rows].sort((a,b)=>a.score-b.score).slice(0,3);
  const resolvedCnt = rows.filter(r=>r.status==="Resolved").length;
  const openCnt     = rows.filter(r=>r.status==="Open").length;
  const inProgCnt   = rows.filter(r=>r.status==="In Progress").length;

  // ── Row helpers ──
  const setRow = (i, field, val) => {
    setRows(prev=>{ const r=[...prev]; r[i]={...r[i],[field]:val}; return r; });
  };
  const addCustomRow = () => {
    setRows(prev=>[...prev, { area:"", areaUr:"", weaknessSign:"", score:3, observation:"", action:"", status:"Open", custom:true }]);
  };
  const removeRow = (i) => setRows(prev=>prev.filter((_,idx)=>idx!==i));

  // ── Save ──
  const save = async () => {
    setSaving(true);
    const h = HOUSES.find(h=>h.id===houseId)||{};
    try {
      await addData("weakness_matrix",{ houseId, month, houseName:h.nameEn, rows, createdAt:new Date().toISOString() });
      await load();
      setDone(true); setTimeout(()=>setDone(false),3000);
    } catch(e){ console.error("save wdm:",e.message); }
    setSaving(false);
  };

  const selHouse = HOUSES.find(h=>h.id===houseId)||{};

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(160deg,#0f172a 0%,#0d1f3c 50%,#0a1628 100%)", padding:"24px 20px", fontFamily:"'Segoe UI',Arial,serif", direction:"ltr" }}>

      {/* ── Header ── */}
      <div style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"24px" }}>
        <div style={{ width:"44px", height:"44px", borderRadius:"12px", background:"linear-gradient(135deg,#7c3aed,#5b21b6)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.4rem", boxShadow:"0 4px 20px rgba(124,58,237,0.4)" }}>📊</div>
        <div>
          <h2 style={{ margin:0, fontSize:"1.25rem", fontWeight:"800", color:"#f1f5f9" }}>Weakness Distribution Matrix</h2>
          <p style={{ margin:0, fontSize:"0.68rem", color:"rgba(212,175,55,0.7)" }}>Weakness ranking — Per House, Per Month</p>
        </div>
      </div>

      {/* ── House Tabs ── */}
      <div style={{ display:"flex", gap:"8px", marginBottom:"16px", flexWrap:"wrap" }}>
        {HOUSES.map(h=>{
          const act=houseId===h.id;
          return (
            <button key={h.id} onClick={()=>setHouseId(h.id)} style={{ padding:"10px 20px", borderRadius:"12px", border:`2px solid ${act?h.color:h.color+"40"}`, background:act?`${h.color}18`:"rgba(255,255,255,0.03)", color:act?h.color:"rgba(255,255,255,0.45)", fontWeight:act?"800":"500", fontSize:"0.78rem", cursor:"pointer", fontFamily:"inherit", transition:"all 0.2s", display:"flex", alignItems:"center", gap:"6px" }}>
              {h.emoji} {h.nameEn}
            </button>
          );
        })}
        <div style={{ marginRight:"auto" }}/>
        {/* Month picker */}
        <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
          <span style={{ color:"rgba(212,175,55,0.7)", fontSize:"0.7rem", fontWeight:"700" }}>ماہ:</span>
          <input type="month" value={month} onChange={e=>setMonth(e.target.value)}
            style={{ ...inp, width:"140px", direction:"ltr", padding:"8px 12px" }}/>
        </div>
      </div>

      {/* ── Current house info bar ── */}
      <div style={{ ...glass, padding:"12px 18px", marginBottom:"16px", display:"flex", alignItems:"center", gap:"14px" }}>
        <div style={{ width:"38px", height:"38px", borderRadius:"10px", background:selHouse.gradient||selHouse.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.3rem", flexShrink:0 }}>{selHouse.emoji}</div>
        <div style={{ flex:1 }}>
          <div style={{ color:selHouse.color||G, fontWeight:"800", fontSize:"0.88rem" }}>{selHouse.name} — {month}</div>
          <div style={{ color:"rgba(255,255,255,0.4)", fontSize:"0.62rem" }}>{selHouse.slogan}</div>
        </div>
        <div style={{ textAlign:"center" }}>
          <div style={{ color:G, fontSize:"1.2rem", fontWeight:"800" }}>{currentAvg.toFixed(1)}</div>
          <div style={{ color:"rgba(255,255,255,0.35)", fontSize:"0.58rem" }}>اوسط اسکور / 5</div>
        </div>
        <div style={{ textAlign:"center", background:"rgba(99,102,241,0.1)", borderRadius:"10px", padding:"6px 14px", border:"1px solid rgba(99,102,241,0.25)" }}>
          <div style={{ color:"#818cf8", fontSize:"1rem", fontWeight:"800" }}>{houseStudentCount}</div>
          <div style={{ color:"rgba(255,255,255,0.35)", fontSize:"0.55rem" }}>طلباء</div>
        </div>
        {Object.keys(autoWeakAreas).length>0&&(
          <div style={{ background:"rgba(212,175,55,0.08)", border:"1px solid rgba(212,175,55,0.25)", borderRadius:"10px", padding:"6px 12px" }}>
            <div style={{ fontSize:"0.58rem", color:"rgba(212,175,55,0.7)", fontWeight:"700", marginBottom:"4px" }}>⚡ HVS AUTO</div>
            <div style={{ display:"flex", gap:"4px", flexWrap:"wrap" }}>
              {Object.entries(autoWeakAreas).filter(([,s])=>s<=2).map(([area,score])=>(
                <span key={area} style={{ fontSize:"0.55rem", background:"rgba(220,38,38,0.15)", color:"#f87171", borderRadius:"4px", padding:"1px 6px", fontWeight:"700" }}>⚠️ {area}</span>
              ))}
              {Object.entries(autoWeakAreas).filter(([,s])=>s<=2).length===0&&<span style={{fontSize:"0.58rem",color:"#4ade80"}}>✅ No weak areas</span>}
            </div>
          </div>
        )}
        {improvePct!==null&&(
          <div style={{ textAlign:"center", background:improvePct>=0?"rgba(34,197,94,0.12)":"rgba(220,38,38,0.12)", borderRadius:"10px", padding:"6px 14px", border:`1px solid ${improvePct>=0?"#22c55e":"#dc2626"}30` }}>
            <div style={{ color:improvePct>=0?"#4ade80":"#f87171", fontSize:"1rem", fontWeight:"800" }}>
              {improvePct>=0?"+":""}{improvePct}%
            </div>
            <div style={{ color:"rgba(255,255,255,0.35)", fontSize:"0.55rem" }}>گزشتہ ماہ کے مقابلے</div>
          </div>
        )}
      </div>

      {/* ── Success ── */}
      {done&&<div style={{ ...glass, padding:"12px 18px", marginBottom:"14px", border:"1px solid rgba(74,222,128,0.3)", background:"rgba(74,222,128,0.08)", textAlign:"center" }}>
        <span style={{ color:"#4ade80", fontWeight:"700", fontSize:"0.8rem" }}>✓ WDM Saved!</span>
      </div>}

      {/* ══ MATRIX TABLE ══ */}
      <div style={{ ...glass, padding:"0", overflow:"hidden", marginBottom:"16px" }}>

        {/* Table header */}
        <div style={{ background:"rgba(212,175,55,0.1)", borderBottom:"1px solid rgba(255,255,255,0.08)", padding:"10px 16px", display:"grid", gridTemplateColumns:"130px 140px 90px 1fr 1fr 110px 36px", gap:"8px", alignItems:"center" }}>
          {["شعبہ","کمزوری کی علامت","سکور (1-5)","مشاہدہ","عمل","صورتحال",""].map((h,i)=>(
            <div key={i} style={{ fontSize:"0.62rem", color:"rgba(212,175,55,0.8)", fontWeight:"700" }}>{h}</div>
          ))}
        </div>

        {/* Rows */}
        {rows.map((row,i)=>{
          const sc = SCORES[row.score]||SCORES[3];
          const st = STATUS_OPTS.find(s=>s.id===row.status)||STATUS_OPTS[0];
          return (
            <div key={i} style={{ display:"grid", gridTemplateColumns:"130px 140px 90px 1fr 1fr 110px 36px", gap:"8px", alignItems:"center", padding:"10px 16px", borderBottom:"1px solid rgba(255,255,255,0.05)", background:i%2?"rgba(255,255,255,0.015)":"transparent" }}>

              {/* Area */}
              <div>
                {row.custom ? (
                  <input style={{ ...inp, fontSize:"0.7rem" }} placeholder="Area..." value={row.area} onChange={e=>setRow(i,"area",e.target.value)}/>
                ) : (
                  <div>
                    <div style={{ fontSize:"0.75rem", color:"#f1f5f9", fontWeight:"700" }}>{row.areaUr||row.area}</div>
                    <div style={{ fontSize:"0.55rem", color:"rgba(255,255,255,0.3)" }}>{row.area}</div>
                  </div>
                )}
              </div>

              {/* Weakness sign */}
              <input style={{ ...inp }} placeholder="Weakness sign..." value={row.weaknessSign} onChange={e=>setRow(i,"weaknessSign",e.target.value)}/>

              {/* Score */}
              <div>
                <select
                  value={row.score}
                  onChange={e=>setRow(i,"score",Number(e.target.value))}
                  style={{ ...inp, background:sc.color+"15", color:sc.color, border:`1px solid ${sc.color}40`, fontWeight:"700" }}
                >
                  {[1,2,3,4,5].map(v=>(
                    <option key={v} value={v} style={{ background:N2, color:SCORES[v].color }}>
                      {v} — {SCORES[v].labelEn}
                    </option>
                  ))}
                </select>
                <div style={{ fontSize:"0.55rem", color:sc.color, marginTop:"3px", textAlign:"center" }}>{sc.label}</div>
              </div>

              {/* Observation */}
              <input style={{ ...inp }} placeholder="Observation..." value={row.observation} onChange={e=>setRow(i,"observation",e.target.value)}/>

              {/* Action */}
              <input style={{ ...inp }} placeholder="Proposed action..." value={row.action} onChange={e=>setRow(i,"action",e.target.value)}/>

              {/* Status */}
              <select
                value={row.status}
                onChange={e=>setRow(i,"status",e.target.value)}
                style={{ ...inp, color:st.color, border:`1px solid ${st.color}40`, background:`${st.color}10`, fontWeight:"700" }}
              >
                {STATUS_OPTS.map(s=>(
                  <option key={s.id} value={s.id} style={{ background:N2 }}>{s.icon} {s.label}</option>
                ))}
              </select>

              {/* Remove custom row */}
              <div style={{ display:"flex", justifyContent:"center" }}>
                {row.custom && (
                  <button onClick={()=>removeRow(i)} style={{ background:"rgba(220,38,38,0.15)", border:"1px solid rgba(220,38,38,0.3)", borderRadius:"6px", color:"#f87171", fontSize:"0.7rem", width:"28px", height:"28px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
                )}
              </div>
            </div>
          );
        })}

        {/* Add row */}
        <div style={{ padding:"12px 16px", borderTop:"1px solid rgba(255,255,255,0.05)" }}>
          <button onClick={addCustomRow} style={{ padding:"8px 20px", border:"1px dashed rgba(212,175,55,0.35)", borderRadius:"10px", background:"rgba(212,175,55,0.05)", color:G, fontSize:"0.72rem", cursor:"pointer", fontFamily:"inherit", fontWeight:"700" }}>
            + اپنا علاقہ شامل کریں
          </button>
        </div>
      </div>

      {/* ── Save button ── */}
      <div style={{ display:"flex", gap:"10px", marginBottom:"20px" }}>
        <button onClick={save} disabled={saving} style={{ flex:1, padding:"13px", borderRadius:"12px", border:"none", background:"linear-gradient(135deg,#d4af37,#b8960a)", color:N, fontSize:"0.82rem", cursor:saving?"not-allowed":"pointer", fontFamily:"inherit", fontWeight:"800" }}>
          {saving?"محفوظ ہو رہا ہے...":"💾 WDM محفوظ کریں"}
        </button>
        <button onClick={injectPrint} style={{ padding:"13px 24px", borderRadius:"12px", border:"1px solid rgba(212,175,55,0.3)", background:"rgba(212,175,55,0.08)", color:G, fontSize:"0.78rem", cursor:"pointer", fontFamily:"inherit", fontWeight:"700" }}>
          🖨️ Print
        </button>
      </div>

      {/* ══ SUMMARY SECTION ══ */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px", marginBottom:"20px" }}>

        {/* Top 3 weaknesses */}
        <div style={{ ...glass, padding:"18px 20px" }}>
          <div style={{ color:G, fontWeight:"800", fontSize:"0.82rem", marginBottom:"14px", display:"flex", alignItems:"center", gap:"8px" }}>
            <span>🔴</span> سرفہرست 3 کمزوریاں
          </div>
          {top3Weak.filter(r=>r.score<=3).length===0&&(
            <div style={{ color:"rgba(255,255,255,0.25)", fontSize:"0.72rem", textAlign:"center", padding:"16px 0" }}>No weaknesses this month ✅</div>
          )}
          {top3Weak.filter(r=>r.score<=3).map((row,i)=>{
            const sc=SCORES[row.score]||SCORES[3];
            return (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"10px", padding:"10px 12px", background:`${sc.color}10`, borderRadius:"10px", border:`1px solid ${sc.color}25` }}>
                <div style={{ background:sc.color, color:"white", borderRadius:"50%", width:"22px", height:"22px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.65rem", fontWeight:"800", flexShrink:0 }}>{i+1}</div>
                <div style={{ flex:1 }}>
                  <div style={{ color:"#f1f5f9", fontSize:"0.75rem", fontWeight:"700" }}>{row.areaUr||row.area}</div>
                  {row.weaknessSign&&<div style={{ color:"rgba(255,255,255,0.4)", fontSize:"0.6rem", marginTop:"2px" }}>{row.weaknessSign}</div>}
                </div>
                <div style={{ background:sc.color+"20", color:sc.color, borderRadius:"8px", padding:"3px 10px", fontSize:"0.62rem", fontWeight:"800" }}>
                  {row.score}/5 — {sc.labelEn}
                </div>
              </div>
            );
          })}
        </div>

        {/* Status summary */}
        <div style={{ ...glass, padding:"18px 20px" }}>
          <div style={{ color:G, fontWeight:"800", fontSize:"0.82rem", marginBottom:"14px", display:"flex", alignItems:"center", gap:"8px" }}>
            <span>📊</span> حیثیت خلاصہ
          </div>
          {/* Status bars */}
          {[
            { label:"کھلا",     count:openCnt,     color:"#dc2626" },
            { label:"جاری",     count:inProgCnt,   color:"#f97316" },
            { label:"حل شدہ",  count:resolvedCnt, color:"#22c55e" },
          ].map(s=>(
            <div key={s.label} style={{ marginBottom:"12px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"4px" }}>
                <span style={{ fontSize:"0.7rem", color:"rgba(255,255,255,0.6)" }}>{s.label}</span>
                <span style={{ fontSize:"0.7rem", color:s.color, fontWeight:"700" }}>{s.count} / {rows.length}</span>
              </div>
              <div style={{ height:"6px", background:"rgba(255,255,255,0.06)", borderRadius:"3px", overflow:"hidden" }}>
                <div style={{ width:rows.length?`${(s.count/rows.length)*100}%`:"0%", height:"100%", background:s.color, borderRadius:"3px", transition:"width 0.5s ease" }}/>
              </div>
            </div>
          ))}
          {/* Improvement from last month */}
          <div style={{ marginTop:"16px", padding:"12px", background:"rgba(255,255,255,0.04)", borderRadius:"10px", border:"1px solid rgba(255,255,255,0.07)" }}>
            <div style={{ fontSize:"0.65rem", color:"rgba(255,255,255,0.35)", marginBottom:"6px" }}>Improvement گزشتہ ماہ کے مقابلے competitions</div>
            {improvePct===null ? (
              <div style={{ fontSize:"0.7rem", color:"rgba(255,255,255,0.25)" }} className="ur">گزشتہ ماہ کا کوئی ڈیٹا نہیں</div>
            ) : (
              <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                <div style={{ fontSize:"1.6rem", fontWeight:"800", color:improvePct>=0?"#4ade80":"#f87171" }}>
                  {improvePct>=0?"+":""}{improvePct}%
                </div>
                <div style={{ fontSize:"0.65rem", color:"rgba(255,255,255,0.4)" }}>
                  {improvePct>0?"بہتری ✅":improvePct===0?"کوئی تبدیلی نہیں":"کمزوریاں بڑھیں ⚠️"}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ══ PRINT AREA ══ */}
      <div id="wdm-print-area" style={{ display:"none" }}>
        <img src={letterhead} alt="" style={{ width:"100%", display:"block" }}/>
        <div style={{ padding:"20px 30px", fontFamily:"'Segoe UI',Arial,serif", direction:"ltr", color:"#1e293b" }}>
          <h2 style={{ textAlign:"center", fontSize:"1rem", fontWeight:"800", marginBottom:"4px" }}>
            Weakness Distribution Matrix — Weakness Ranking
          </h2>
          <p style={{ textAlign:"center", fontSize:"0.72rem", color:"#64748b", marginBottom:"16px" }}>
            House: {selHouse.nameEn} | Month: {month} | Average Score: {currentAvg.toFixed(1)}/5
          </p>

          {/* Print stats */}
          <div style={{ display:"flex", gap:"12px", marginBottom:"16px", justifyContent:"center" }}>
            {[
              { label:"کھلا",    val:openCnt,     color:"#dc2626" },
              { label:"جاری",    val:inProgCnt,   color:"#f97316" },
              { label:"حل شدہ", val:resolvedCnt, color:"#22c55e" },
              { label:"بہتری",  val:improvePct!==null?(improvePct>=0?"+"+improvePct+"%":improvePct+"%"):"N/A", color:"#3b82f6" },
            ].map(s=>(
              <div key={s.label} style={{ border:`1px solid ${s.color}40`, borderRadius:"8px", padding:"8px 16px", textAlign:"center" }}>
                <div style={{ color:s.color, fontWeight:"800", fontSize:"1rem" }}>{s.val}</div>
                <div style={{ fontSize:"0.6rem", color:"#64748b" }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Print table */}
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"0.68rem" }}>
            <thead>
              <tr style={{ background:"#f8f4eb" }}>
                {["شعبہ","کمزوری کی علامت","سکور","مشاہدہ","عمل","صورتحال"].map(h=>(
                  <th key={h} style={{ padding:"8px 10px", textAlign:"left", borderBottom:"2px solid #e5e7eb", fontWeight:"700" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row,i)=>{
                const sc=SCORES[row.score]||SCORES[3];
                const st=STATUS_OPTS.find(s=>s.id===row.status)||STATUS_OPTS[0];
                return (
                  <tr key={i} style={{ borderBottom:"1px solid #f1f5f9", background:i%2?"#fafaf8":"white" }}>
                    <td style={{ padding:"8px 10px", fontWeight:"700" }}>{row.areaUr||row.area}</td>
                    <td style={{ padding:"8px 10px", color:"#64748b" }}>{row.weaknessSign||"—"}</td>
                    <td style={{ padding:"8px 10px" }}><span style={{ color:sc.color, fontWeight:"800" }}>{row.score}/5</span> {sc.labelEn}</td>
                    <td style={{ padding:"8px 10px", color:"#64748b" }}>{row.observation||"—"}</td>
                    <td style={{ padding:"8px 10px", color:"#64748b" }}>{row.action||"—"}</td>
                    <td style={{ padding:"8px 10px" }}><span style={{ color:st.color, fontWeight:"700" }}>{st.icon} {row.status}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p style={{ marginTop:"24px", fontSize:"0.6rem", color:"#94a3b8", textAlign:"center" }}>
            Ameen Islamic Institute • WDM Report — {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}
