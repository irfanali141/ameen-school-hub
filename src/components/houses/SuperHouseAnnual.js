/* eslint-disable */
import { useState, useEffect } from "react";
import { HOUSES } from "../../constants";
import { getData } from "../../supabase";

const G = "#d4af37"; const N = "#0f172a"; const N2 = "#1e293b";

// ══ 400-Mark Annual Framework ═══════════════════════════════
// Cat 1 & 2: auto-computed from weekly logs
// Cat 3-5:   manual entry → stored in superhouse_annual table
const CATS = [
  { id:"hvs",        label:"HVS Annual Average",   labelEn:"HVS Annual Avg",    icon:"🏅", max:100, color:"#d4af37", auto:true  },
  { id:"duties",     label:"Duty Annual",       labelEn:"Annual Duties",     icon:"📋", max:60,  color:"#60a5fa", auto:true  },
  { id:"academic",   label:"Academic Performance",   labelEn:"Academic",          icon:"📚", max:80,  color:"#a78bfa", auto:false },
  { id:"tarbiyah",   label:"Tarbiyah & Ethics",     labelEn:"Tarbiyah",          icon:"💎", max:80,  color:"#4ade80", auto:false },
  { id:"activities", label:"Events & Sports",   labelEn:"Events & Sports",   icon:"🎭", max:80,  color:"#f472b6", auto:false },
];
const ANNUAL_MAX = 400; // 100+60+80+80+80

const currentYear = String(new Date().getFullYear());

function SuperHouseAnnual({ hvsLogs = [], houses = [], students = [], addData }) {
  const [dutyLogs,    setDutyLogs]    = useState([]);
  const [annualRecs,  setAnnualRecs]  = useState([]);   // superhouse_annual table
  const [loading,     setLoading]     = useState(true);
  const [selYear,     setSelYear]     = useState(currentYear);
  const [showEntry,   setShowEntry]   = useState(false);
  const [entryHouse,  setEntryHouse]  = useState("abuBakr");
  const [entryVals,   setEntryVals]   = useState({ academic:0, tarbiyah:0, activities:0 });
  const [saving,      setSaving]      = useState(false);
  const [saved,       setSaved]       = useState(false);

  const loadAll = () => {
    Promise.all([getData("duty_logs"), getData("superhouse_annual")]).then(([d, a]) => {
      setDutyLogs(d || []);
      setAnnualRecs(a || []);
      setLoading(false);
    });
  };
  useEffect(() => { loadAll(); }, []);

  // ── Available years from all log sources ──
  const allYears = [...new Set([
    ...hvsLogs.map(l => l.week?.slice(0,4)).filter(Boolean),
    ...dutyLogs.map(l => l.week?.slice(0,4)).filter(Boolean),
    currentYear,
  ])].sort().reverse();

  // ── Auto-computed scores ──
  const hvsAnnual = (houseId) => {
    const entries = hvsLogs.filter(l => l.houseId === houseId && l.week?.startsWith(selYear));
    if (!entries.length) return 0;
    const avg = entries.reduce((s,l) => s+(l.totalScore||0), 0) / entries.length;
    return Math.min(100, Math.round(avg / 160 * 100));
  };
  const dutyAnnual = (houseId) => {
    const entries = dutyLogs.filter(l => l.houseId === houseId && l.week?.startsWith(selYear));
    if (!entries.length) return 0;
    const avg = entries.reduce((s,l) => s+(l.totalScore||0), 0) / entries.length;
    return Math.min(60, Math.round(avg));
  };

  // ── Manual scores (latest entry per house per year) ──
  const manualRec = (houseId) =>
    [...annualRecs].filter(r => r.houseId === houseId && r.year === selYear)
                   .sort((a,b) => (b.created_at||"").localeCompare(a.created_at||""))[0] || {};

  const catScore = (houseId, catId) => {
    if (catId === "hvs")        return hvsAnnual(houseId);
    if (catId === "duties")     return dutyAnnual(houseId);
    const rec = manualRec(houseId);
    return Math.min(CATS.find(c=>c.id===catId)?.max||0, rec[catId]||0);
  };

  const annualTotal = (houseId) => CATS.reduce((s, c) => s + catScore(houseId, c.id), 0);

  // ── Build ranked house list ──
  const houseData = [...HOUSES].map(h => ({
    ...h,
    scores: Object.fromEntries(CATS.map(c => [c.id, catScore(h.id, c.id)])),
    total:  annualTotal(h.id),
    studs:  students.filter(s => s.houseId === h.id).length,
    hvsEntries:  hvsLogs.filter(l=>l.houseId===h.id && l.week?.startsWith(selYear)).length,
    dutyEntries: dutyLogs.filter(l=>l.houseId===h.id && l.week?.startsWith(selYear)).length,
  })).sort((a,b) => b.total - a.total);

  const champion = houseData[0];
  const medal = i => i===0?"🥇":i===1?"🥈":i===2?"🥉":`#${i+1}`;

  // ── Pre-fill entry form with existing values ──
  const openEntry = (houseId) => {
    const rec = manualRec(houseId);
    setEntryHouse(houseId);
    setEntryVals({ academic: rec.academic||0, tarbiyah: rec.tarbiyah||0, activities: rec.activities||0 });
    setShowEntry(true);
  };

  const saveEntry = async () => {
    setSaving(true);
    const h = HOUSES.find(x => x.id === entryHouse) || {};
    await addData("superhouse_annual", {
      houseId: entryHouse,
      houseName: h.nameEn || "",
      year: selYear,
      academic:   Math.min(80, Math.max(0, Number(entryVals.academic)  || 0)),
      tarbiyah:   Math.min(80, Math.max(0, Number(entryVals.tarbiyah)  || 0)),
      activities: Math.min(80, Math.max(0, Number(entryVals.activities)|| 0)),
    });
    await loadAll();
    setSaving(false); setSaved(true); setTimeout(()=>setSaved(false),3000);
    setShowEntry(false);
  };

  const G = "#d4af37"; const N = "#0f172a";
  const glass = {
    background:"rgba(255,255,255,0.07)", backdropFilter:"blur(20px)",
    WebkitBackdropFilter:"blur(20px)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:"16px"
  };
  const inp = {
    padding:"10px 14px", borderRadius:"10px", border:"1px solid rgba(212,175,55,0.25)",
    background:"rgba(255,255,255,0.06)", color:"#f1f5f9", fontSize:"0.8rem",
    fontFamily:"'Public Sans',sans-serif", outline:"none", boxSizing:"border-box",
    direction:"ltr", colorScheme:"dark", width:"100%"
  };
  const lbl = { fontSize:"0.7rem", color:"rgba(212,175,55,0.8)", marginBottom:"6px", display:"block", fontWeight:"600" };

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(160deg,#0f172a 0%,#0d1f3c 50%,#0a1628 100%)", padding:"24px 20px", fontFamily:"'Public Sans',sans-serif", direction:"ltr" }}>

      {/* ══ HEADER ══ */}
      <div style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"24px" }}>
        <div style={{ width:"52px", height:"52px", borderRadius:"16px", background:"linear-gradient(135deg,#d4af37,#b8960a)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 6px 28px rgba(212,175,55,0.5)", flexShrink:0 }}>
          <span style={{ fontSize:"26px" }}>🏆</span>
        </div>
        <div>
          <h2 style={{ margin:0, fontSize:"1.5rem", fontWeight:"900", color:"#f1f5f9" }}>Super House — Annual 400 Marks</h2>
          <p style={{ margin:0, fontSize:"0.72rem", color:"rgba(212,175,55,0.7)" }}>Annual Super House Competition · 5 Categories · {ANNUAL_MAX} pts</p>
        </div>
      </div>

      {saved && <div style={{ ...glass, padding:"12px 20px", marginBottom:"16px", textAlign:"center", border:"1px solid rgba(74,222,128,0.3)", background:"rgba(74,222,128,0.08)" }}>
        <span style={{ color:"#4ade80", fontWeight:"700", fontSize:"0.82rem" }}>✓ Annual score saved!</span>
      </div>}

      {/* ══ 5-CATEGORY KEY ══ */}
      <div style={{ ...glass, padding:"16px 18px", marginBottom:"20px" }}>
        <div style={{ fontSize:"0.62rem", color:"rgba(255,255,255,0.4)", marginBottom:"12px", fontWeight:"700", letterSpacing:"0.05em" }}>400 Marks — 5 Categories:</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))", gap:"8px" }}>
          {CATS.map(c => (
            <div key={c.id} style={{ background:"rgba(255,255,255,0.04)", borderRadius:"10px", padding:"10px 12px", border:`1px solid ${c.color}30` }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"4px" }}>
                <span style={{ fontSize:"0.72rem", color:"rgba(255,255,255,0.6)" }}>{c.icon} {c.label}</span>
                <span style={{ fontSize:"0.55rem", color:c.auto?"#60a5fa":"#fb923c", fontWeight:"600" }}>{c.auto?"AUTO":"MANUAL"}</span>
              </div>
              <div style={{ fontSize:"0.9rem", fontWeight:"800", color:c.color }}>{c.max} <span style={{ fontSize:"0.55rem", color:"rgba(255,255,255,0.3)", fontWeight:"400" }}>pts</span></div>
            </div>
          ))}
          <div style={{ background:"rgba(212,175,55,0.08)", borderRadius:"10px", padding:"10px 12px", border:"1px solid rgba(212,175,55,0.25)", display:"flex", flexDirection:"column", justifyContent:"center" }}>
            <div style={{ fontSize:"0.6rem", color:"rgba(255,255,255,0.4)" }}>Total</div>
            <div style={{ fontSize:"1.1rem", fontWeight:"900", color:G }}>{ANNUAL_MAX} pts</div>
          </div>
        </div>
      </div>

      {/* ══ YEAR SELECTOR + ENTRY BUTTON ══ */}
      <div style={{ ...glass, padding:"14px 18px", marginBottom:"20px", display:"flex", alignItems:"center", gap:"12px", flexWrap:"wrap" }}>
        <span style={{ fontSize:"0.72rem", color:"rgba(212,175,55,0.7)", fontWeight:"600", flexShrink:0 }}>📅 Year:</span>
        <div style={{ display:"flex", gap:"6px", flexWrap:"wrap", flex:1 }}>
          {allYears.map(y => (
            <button key={y} onClick={() => setSelYear(y)}
              style={{ padding:"6px 16px", borderRadius:"8px", border:"none", background:selYear===y?"rgba(212,175,55,0.25)":"rgba(255,255,255,0.05)", color:selYear===y?G:"rgba(255,255,255,0.45)", fontWeight:selYear===y?"800":"500", fontSize:"0.72rem", cursor:"pointer", fontFamily:"'Public Sans',sans-serif" }}>
              {y}
            </button>
          ))}
        </div>
        <button onClick={() => setShowEntry(v => !v)}
          style={{ padding:"8px 18px", borderRadius:"10px", border:"none", background:"linear-gradient(135deg,#d4af37,#b8960a)", color:N, fontWeight:"700", fontSize:"0.72rem", cursor:"pointer", fontFamily:"'Public Sans',sans-serif", flexShrink:0 }}>
          ✏️ Score Enter
        </button>
      </div>

      {/* ══ MANUAL ENTRY FORM ══ */}
      {showEntry && (
        <div style={{ ...glass, padding:"24px", marginBottom:"20px", border:"1px solid rgba(212,175,55,0.25)" }}>
          <div style={{ fontSize:"0.85rem", fontWeight:"700", color:G, marginBottom:"16px" }}>✏️ Enter Annual Score — {selYear}</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px", marginBottom:"16px" }}>
            <div>
              <label style={lbl}>House</label>
              <select style={inp} value={entryHouse} onChange={e => openEntry(e.target.value)}>
                {HOUSES.map(h => <option key={h.id} value={h.id} style={{ background:"#1e293b" }}>{h.emoji} {h.nameEn}</option>)}
              </select>
            </div>
            <div style={{ display:"flex", alignItems:"flex-end" }}>
              <div style={{ background:"rgba(255,255,255,0.04)", borderRadius:"10px", padding:"10px 14px", width:"100%", border:"1px solid rgba(255,255,255,0.08)" }}>
                <div style={{ fontSize:"0.58rem", color:"rgba(255,255,255,0.4)", marginBottom:"4px" }}>HVS (Auto) + Duty (Auto)</div>
                <div style={{ fontSize:"0.75rem", color:"rgba(255,255,255,0.6)" }}>
                  <span style={{ color:"#d4af37", fontWeight:"700" }}>{hvsAnnual(entryHouse)}</span>/100 HVS &nbsp;+&nbsp;
                  <span style={{ color:"#60a5fa", fontWeight:"700" }}>{dutyAnnual(entryHouse)}</span>/60 Duty
                </div>
              </div>
            </div>
          </div>

          {/* Manual category sliders */}
          {CATS.filter(c => !c.auto).map(c => (
            <div key={c.id} style={{ marginBottom:"16px", background:"rgba(255,255,255,0.03)", borderRadius:"12px", padding:"14px", border:`1px solid ${c.color}20` }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"10px" }}>
                <label style={{ ...lbl, marginBottom:0 }}>{c.icon} {c.label}</label>
                <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                  <span style={{ fontWeight:"800", fontSize:"1rem", color:c.color }}>{entryVals[c.id]||0}</span>
                  <span style={{ fontSize:"0.6rem", color:"rgba(255,255,255,0.3)" }}>/{c.max}</span>
                </div>
              </div>
              <input
                type="range" min={0} max={c.max} step={1}
                value={entryVals[c.id]||0}
                onChange={e => setEntryVals(prev => ({ ...prev, [c.id]: Number(e.target.value) }))}
                style={{ width:"100%", accentColor:c.color, cursor:"pointer" }}
              />
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:"0.55rem", color:"rgba(255,255,255,0.2)", marginTop:"3px" }}>
                <span>0</span>
                <span>{Math.round(c.max*0.25)}</span>
                <span>{Math.round(c.max*0.5)}</span>
                <span>{Math.round(c.max*0.75)}</span>
                <span>{c.max}</span>
              </div>
              {/* Quick number input */}
              <input
                type="number" min={0} max={c.max}
                value={entryVals[c.id]||0}
                onChange={e => setEntryVals(prev => ({ ...prev, [c.id]: Math.min(c.max, Math.max(0, Number(e.target.value)||0)) }))}
                style={{ ...inp, width:"80px", marginTop:"8px", textAlign:"center" }}
              />
            </div>
          ))}

          {/* Preview total */}
          <div style={{ background:"rgba(212,175,55,0.1)", borderRadius:"12px", padding:"14px", marginBottom:"16px", border:"1px solid rgba(212,175,55,0.2)" }}>
            <div style={{ fontSize:"0.65rem", color:"rgba(255,255,255,0.5)", marginBottom:"4px" }}>Total marks after this entry:</div>
            <div style={{ fontSize:"1.8rem", fontWeight:"900", color:G }}>
              {hvsAnnual(entryHouse) + dutyAnnual(entryHouse) + (Number(entryVals.academic)||0) + (Number(entryVals.tarbiyah)||0) + (Number(entryVals.activities)||0)}
              <span style={{ fontSize:"0.9rem", color:"rgba(255,255,255,0.3)", fontWeight:"400" }}>/{ANNUAL_MAX}</span>
            </div>
          </div>

          <div style={{ display:"flex", gap:"10px" }}>
            <button onClick={saveEntry} disabled={saving}
              style={{ flex:1, padding:"13px", borderRadius:"12px", border:"none", background:"linear-gradient(135deg,#d4af37,#b8960a)", color:N, fontWeight:"700", fontSize:"0.8rem", cursor:"pointer", fontFamily:"'Public Sans',sans-serif" }}>
              {saving ? "Saving..." : "✅ Annual Score Save"}
            </button>
            <button onClick={() => setShowEntry(false)}
              style={{ padding:"13px 20px", borderRadius:"12px", border:"1px solid rgba(255,255,255,0.15)", background:"rgba(255,255,255,0.05)", color:"rgba(255,255,255,0.5)", fontWeight:"600", fontSize:"0.8rem", cursor:"pointer", fontFamily:"'Public Sans',sans-serif" }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ══ CHAMPION BANNER ══ */}
      {!loading && champion && champion.total > 0 && (() => {
        const info = HOUSES.find(h => h.id === champion.id) || champion;
        const pct = Math.round((champion.total / ANNUAL_MAX) * 100);
        return (
          <div style={{ background:info.gradient || `linear-gradient(135deg,${info.color},${info.color}bb)`, borderRadius:"24px", padding:"32px 28px", marginBottom:"28px", color:"#fff", position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", top:"-40px", right:"-40px", width:"200px", height:"200px", borderRadius:"50%", background:"rgba(255,255,255,0.05)" }}/>
            <div style={{ position:"absolute", bottom:"-50px", left:"-20px", width:"160px", height:"160px", borderRadius:"50%", background:"rgba(255,255,255,0.04)" }}/>
            <div style={{ position:"relative" }}>
              <div style={{ fontSize:"2.5rem", marginBottom:"6px" }}>👑</div>
              <div style={{ fontSize:"0.65rem", opacity:0.75, letterSpacing:"0.2em", marginBottom:"8px" }}>Super House Champion — {selYear}</div>
              <div style={{ fontSize:"2.4rem", fontWeight:"900", marginBottom:"4px" }}>{info.emoji} {info.nameEn} House</div>
              <div style={{ fontSize:"0.8rem", opacity:0.85, marginBottom:"20px", fontStyle:"italic" }}>{info.slogan}</div>

              {/* Big score */}
              <div style={{ display:"flex", alignItems:"flex-end", gap:"10px", marginBottom:"16px" }}>
                <div style={{ fontSize:"5rem", fontWeight:"900", lineHeight:1 }}>{champion.total}</div>
                <div style={{ marginBottom:"12px" }}>
                  <div style={{ fontSize:"1.2rem", opacity:0.6 }}>/{ANNUAL_MAX}</div>
                  <div style={{ fontSize:"1rem", fontWeight:"800", background:"rgba(255,255,255,0.2)", borderRadius:"8px", padding:"2px 10px" }}>{pct}%</div>
                </div>
              </div>

              {/* Segmented bar */}
              <div style={{ height:"14px", borderRadius:"7px", overflow:"hidden", background:"rgba(255,255,255,0.15)", display:"flex", marginBottom:"10px" }}>
                {CATS.map(c => (
                  <div key={c.id} style={{ width:`${(champion.scores[c.id]/ANNUAL_MAX)*100}%`, background:c.color, height:"100%", transition:"width 0.7s ease" }}/>
                ))}
              </div>

              {/* Category pills */}
              <div style={{ display:"flex", gap:"8px", flexWrap:"wrap" }}>
                {CATS.map(c => (
                  <div key={c.id} style={{ background:"rgba(255,255,255,0.15)", borderRadius:"8px", padding:"4px 12px", fontSize:"0.62rem" }}>
                    {c.icon} <span style={{ color:c.color, fontWeight:"800" }}>{champion.scores[c.id]}</span>
                    <span style={{ opacity:0.5 }}>/{c.max}</span>
                    <span style={{ opacity:0.6, marginRight:"4px" }}> {c.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ══ 4 HOUSE CARDS ══ */}
      {loading ? (
        <div style={{ ...glass, padding:"40px", textAlign:"center", color:"rgba(255,255,255,0.3)", fontSize:"0.8rem" }}>Loading...</div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))", gap:"16px", marginBottom:"24px" }}>
          {houseData.map((h, i) => {
            const info = HOUSES.find(x => x.id === h.id) || h;
            const pct = Math.round((h.total / ANNUAL_MAX) * 100);
            const grade = pct>=90?"A+":pct>=80?"A":pct>=70?"B+":pct>=60?"B":pct>=50?"C+":pct>=40?"C":"D";
            const gradeColor = pct>=70?"#4ade80":pct>=40?"#fb923c":"#f87171";

            return (
              <div key={h.id} style={{ ...glass, padding:"22px", borderTop:`4px solid ${info.color}`, position:"relative", overflow:"hidden" }}>

                {/* Rank */}
                <div style={{ position:"absolute", top:"14px", left:"14px", fontSize:i===0?"1.6rem":"1rem", fontWeight:"800" }}>{medal(i)}</div>

                {/* House header */}
                <div style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"18px" }}>
                  <div style={{ width:"44px", height:"44px", borderRadius:"12px", background:info.gradient||info.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.5rem", flexShrink:0, boxShadow:`0 4px 16px ${info.color}50` }}>
                    {info.emoji}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:"800", fontSize:"0.95rem", color:info.color }}>{info.nameEn}</div>
                    <div style={{ fontSize:"0.58rem", color:"rgba(255,255,255,0.4)" }}>{info.name} · {h.studs} Students</div>
                    <div style={{ fontSize:"0.55rem", color:"rgba(255,255,255,0.25)", marginTop:"1px" }}>
                      {h.hvsEntries} HVS · {h.dutyEntries} Duty entries
                    </div>
                  </div>
                  <div style={{ background:`${gradeColor}18`, borderRadius:"10px", padding:"6px 12px", border:`1px solid ${gradeColor}40`, textAlign:"center" }}>
                    <div style={{ fontWeight:"900", fontSize:"1.3rem", color:gradeColor, lineHeight:1 }}>{grade}</div>
                    <div style={{ fontSize:"0.5rem", color:"rgba(255,255,255,0.35)", marginTop:"2px" }}>Grade</div>
                  </div>
                </div>

                {/* Grand total */}
                <div style={{ display:"flex", alignItems:"flex-end", gap:"6px", marginBottom:"12px" }}>
                  <span style={{ fontSize:"3rem", fontWeight:"900", color:i===0?G:info.color, lineHeight:1 }}>{h.total}</span>
                  <span style={{ fontSize:"1rem", color:"rgba(255,255,255,0.3)", marginBottom:"6px" }}>/{ANNUAL_MAX}</span>
                  <span style={{ fontSize:"0.8rem", fontWeight:"700", color:gradeColor, marginBottom:"8px" }}>{pct}%</span>
                </div>

                {/* Segmented grand bar */}
                <div style={{ height:"10px", borderRadius:"5px", overflow:"hidden", background:"rgba(255,255,255,0.06)", display:"flex", marginBottom:"16px" }}>
                  {CATS.map(c => (
                    <div key={c.id} style={{ width:`${(h.scores[c.id]/ANNUAL_MAX)*100}%`, background:c.color, height:"100%", transition:"width 0.5s ease" }}/>
                  ))}
                </div>

                {/* Per-category rows */}
                <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
                  {CATS.map(c => {
                    const score = h.scores[c.id];
                    const cp = Math.round((score/c.max)*100);
                    const isZero = score === 0 && !c.auto;
                    return (
                      <div key={c.id}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"4px" }}>
                          <div style={{ display:"flex", alignItems:"center", gap:"6px" }}>
                            <span style={{ fontSize:"0.65rem", color:"rgba(255,255,255,0.6)" }}>{c.icon} {c.label}</span>
                            {c.auto && <span style={{ fontSize:"0.48rem", color:"#60a5fa", background:"rgba(96,165,250,0.1)", padding:"1px 5px", borderRadius:"4px" }}>AUTO</span>}
                          </div>
                          <div style={{ display:"flex", alignItems:"center", gap:"4px" }}>
                            {isZero
                              ? <span style={{ fontSize:"0.55rem", color:"rgba(255,255,255,0.2)", fontStyle:"italic" }}>Pending</span>
                              : <><span style={{ fontSize:"0.75rem", fontWeight:"800", color:c.color }}>{score}</span>
                                <span style={{ fontSize:"0.55rem", color:"rgba(255,255,255,0.3)" }}>/{c.max}</span></>
                            }
                          </div>
                        </div>
                        <div style={{ height:"5px", background:"rgba(255,255,255,0.06)", borderRadius:"3px", overflow:"hidden" }}>
                          <div style={{ width:`${cp}%`, height:"100%", background:c.color, borderRadius:"3px", transition:"width 0.5s ease", opacity: isZero?0.2:1 }}/>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Entry button */}
                <button onClick={() => openEntry(h.id)}
                  style={{ marginTop:"16px", width:"100%", padding:"9px", borderRadius:"10px", border:`1px solid ${info.color}40`, background:`${info.color}10`, color:info.color, fontWeight:"600", fontSize:"0.65rem", cursor:"pointer", fontFamily:"'Public Sans',sans-serif" }}>
                  ✏️ Update Manual Score
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* ══ ANNUAL COMPARISON TABLE ══ */}
      <div style={{ ...glass, padding:"20px" }}>
        <div style={{ fontSize:"0.85rem", fontWeight:"700", color:G, marginBottom:"16px" }}>📊 Annual Comparison — {selYear}</div>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ borderBottom:"1px solid rgba(255,255,255,0.08)" }}>
                {["#","House", ...CATS.map(c=>`${c.icon} ${c.labelEn}`), "Total /400","Grade"].map((h,i) => (
                  <th key={i} style={{ padding:"10px 12px", textAlign:"left", fontSize:"0.6rem", color:"rgba(212,175,55,0.7)", fontWeight:"700", whiteSpace:"nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {houseData.map((h, i) => {
                const info = HOUSES.find(x => x.id === h.id) || h;
                const pct = Math.round((h.total / ANNUAL_MAX) * 100);
                const grade = pct>=90?"A+":pct>=80?"A":pct>=70?"B+":pct>=60?"B":pct>=50?"C+":pct>=40?"C":"D";
                const gc = pct>=70?"#4ade80":pct>=40?"#fb923c":"#f87171";
                return (
                  <tr key={h.id} style={{ borderBottom:"1px solid rgba(255,255,255,0.04)", background:i===0?`${info.color}08`:undefined }}>
                    <td style={{ padding:"12px", fontSize:"0.85rem" }}>{medal(i)}</td>
                    <td style={{ padding:"12px" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                        <span style={{ fontSize:"1.1rem" }}>{info.emoji}</span>
                        <div>
                          <div style={{ fontSize:"0.72rem", fontWeight:"700", color:info.color }}>{info.nameEn}</div>
                          <div style={{ fontSize:"0.55rem", color:"rgba(255,255,255,0.3)" }}>{info.name}</div>
                        </div>
                      </div>
                    </td>
                    {CATS.map(c => (
                      <td key={c.id} style={{ padding:"12px", textAlign:"center" }}>
                        <div style={{ fontSize:"0.78rem", fontWeight:"700", color: h.scores[c.id]>0 ? c.color : "rgba(255,255,255,0.2)" }}>
                          {h.scores[c.id] || "—"}
                        </div>
                        <div style={{ height:"3px", background:"rgba(255,255,255,0.06)", borderRadius:"2px", marginTop:"3px" }}>
                          <div style={{ width:`${(h.scores[c.id]/c.max)*100}%`, height:"100%", background:c.color, borderRadius:"2px" }}/>
                        </div>
                        <div style={{ fontSize:"0.5rem", color:"rgba(255,255,255,0.2)", marginTop:"1px" }}>{c.auto?"auto":"manual"}</div>
                      </td>
                    ))}
                    <td style={{ padding:"12px", textAlign:"center" }}>
                      <div style={{ fontSize:"1.2rem", fontWeight:"900", color:i===0?G:info.color }}>{h.total}</div>
                      <div style={{ height:"4px", background:"rgba(255,255,255,0.06)", borderRadius:"2px", marginTop:"3px", width:"50px", margin:"3px auto 0" }}>
                        <div style={{ width:`${pct}%`, height:"100%", background:gc, borderRadius:"2px" }}/>
                      </div>
                    </td>
                    <td style={{ padding:"12px", textAlign:"center" }}>
                      <span style={{ background:`${gc}20`, color:gc, fontSize:"0.72rem", fontWeight:"800", padding:"3px 10px", borderRadius:"6px", border:`1px solid ${gc}40` }}>{grade}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Auto-source note */}
        <div style={{ marginTop:"14px", padding:"10px 14px", background:"rgba(255,255,255,0.03)", borderRadius:"8px", fontSize:"0.58rem", color:"rgba(255,255,255,0.3)", display:"flex", gap:"16px", flexWrap:"wrap" }}>
          <span>🏅 HVS: avg(hvs_logs.totalScore) / 160 × 100 — Annual Average</span>
          <span>📋 Duty: avg(duty_logs.totalScore) — Annual Average</span>
          <span>📚💎🎭 Manual: <code style={{color:"#fb923c"}}>superhouse_annual</code> table</span>
        </div>
      </div>
    </div>
  );
}

export default SuperHouseAnnual;
