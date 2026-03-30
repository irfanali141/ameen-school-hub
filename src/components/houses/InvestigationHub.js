/* eslint-disable */
import { useState } from "react";
import { C } from "../../constants";

// ===================== 12 FORMULA DEFINITIONS =====================
const GROUPS = [
  { id: 1, label: "Investigation Formulas", labelEn: "Investigation Formulas", color: "#dc2626", icon: "🔍" },
  { id: 2, label: "Performance Formulas", labelEn: "Performance Formulas",   color: "#b7860b", icon: "📊" },
  { id: 3, label: "Growth Formulas",     labelEn: "Growth Formulas",        color: "#166534", icon: "📈" },
];

const FORMULAS = [
  // ── GROUP 1 ───────────────────────────────────────────────
  {
    group: 1, id: "AI", name: "Ameen Index", nameUr: "Ameen Index",
    formula: "(P×0.4) + (B×0.2) + (E×0.2) + (T×0.2)",
    desc: "Index of Performance, Behavior, Environment, and Teaching",
    color: "#1e40af",
    vars: [
      { id:"P", label:"Performance (P)", labelEn:"Performance" },
      { id:"B", label:"Behavior (B)",      labelEn:"Behaviour"   },
      { id:"E", label:"Environment (E)",     labelEn:"Environment" },
      { id:"T", label:"Teaching (T)",     labelEn:"Teaching"    },
    ],
    calc: v => (v.P||0)*0.4 + (v.B||0)*0.2 + (v.E||0)*0.2 + (v.T||0)*0.2,
    threshold: 70, dir: "gte",
  },
  {
    group: 1, id: "SBI", name: "Student Behaviour Index", nameUr: "Student Behavior Index",
    formula: "(F×0.4) + (C×0.3) + (R×0.3)",
    desc: "Behavior index based on Family Cooperation, Class Environment, and Results",
    color: "#7c3aed",
    vars: [
      { id:"F", label:"Family Cooperation (F)", labelEn:"Family"  },
      { id:"C", label:"Class Environment (C)",    labelEn:"Class"   },
      { id:"R", label:"Results (R)",          labelEn:"Results" },
    ],
    calc: v => (v.F||0)*0.4 + (v.C||0)*0.3 + (v.R||0)*0.3,
    threshold: 70, dir: "gte",
  },
  {
    group: 1, id: "LEI", name: "Learning Effectiveness Index", nameUr: "Learning Effectiveness Index",
    formula: "(N×0.3) + (C×0.4) + (A×0.3)",
    desc: "Index of Understanding, Comprehension, and Application",
    color: "#0d9488",
    vars: [
      { id:"N", label:"Understanding (N)",      labelEn:"Nature/Understanding" },
      { id:"C", label:"Comprehension (C)",      labelEn:"Comprehension"        },
      { id:"A", label:"Application (A)",     labelEn:"Application"          },
    ],
    calc: v => (v.N||0)*0.3 + (v.C||0)*0.4 + (v.A||0)*0.3,
    threshold: 70, dir: "gte",
  },
  {
    group: 1, id: "TQI", name: "Teaching Quality Index", nameUr: "Teaching Quality Index",
    formula: "(E×0.3) + (M×0.3) + (I×0.4)",
    desc: "Index of Engagement, Teaching Methodology, and Impact",
    color: "#854d0e",
    vars: [
      { id:"E", label:"Engagement (E)",  labelEn:"Engagement"  },
      { id:"M", label:"Methodology (M)",    labelEn:"Methodology" },
      { id:"I", label:"Impact (I)",      labelEn:"Impact"      },
    ],
    calc: v => (v.E||0)*0.3 + (v.M||0)*0.3 + (v.I||0)*0.4,
    threshold: 70, dir: "gte",
  },
  {
    group: 1, id: "PSI", name: "Performance Sustainability Index", nameUr: "Sustainable Performance Index",
    formula: "(C×0.5) + (S×0.3) + (F×0.2)",
    desc: "Sustainable Performance based on Consistency, Skill, and Family Support",
    color: "#166534",
    vars: [
      { id:"C", label:"Consistency (C)", labelEn:"Consistency"   },
      { id:"S", label:"Skill Level (S)",        labelEn:"Skill Level"   },
      { id:"F", label:"Family Support (F)",labelEn:"Family Support"},
    ],
    calc: v => (v.C||0)*0.5 + (v.S||0)*0.3 + (v.F||0)*0.2,
    threshold: 60, dir: "gte",
  },
  {
    group: 1, id: "HPRI", name: "High Priority Risk Index", nameUr: "High Risk Index",
    formula: "(LowP×0.4) + (LowB×0.2) + (LowA×0.2) + (LowT×0.2)",
    desc: "Risk index — ≤25 safe, >25 requires investigation",
    color: "#dc2626",
    vars: [
      { id:"LowP", label:"Low Performance (Low P)",  labelEn:"Low Performance" },
      { id:"LowB", label:"Low Behavior (Low B)",       labelEn:"Low Behaviour"   },
      { id:"LowA", label:"Low Attendance (Low A)",      labelEn:"Low Attendance"  },
      { id:"LowT", label:"Low Teaching (Low T)",      labelEn:"Low Teaching"    },
    ],
    calc: v => (v.LowP||0)*0.4 + (v.LowB||0)*0.2 + (v.LowA||0)*0.2 + (v.LowT||0)*0.2,
    threshold: 25, dir: "lte", // ≤25 = safe
  },

  // ── GROUP 2 ───────────────────────────────────────────────
  {
    group: 2, id: "HPI", name: "House Performance Index", nameUr: "House Performance Index",
    formula: "(A + D + M + E + C + L + S) ÷ 7",
    desc: "Average of 7 HVS categories — House total performance index",
    color: "#b7860b",
    vars: [
      { id:"A", label:"Attendance (A)",   labelEn:"Attendance"  },
      { id:"D", label:"Discipline (D)",     labelEn:"Discipline"  },
      { id:"M", label:"Ethics (M)",   labelEn:"Morality"    },
      { id:"E", label:"Education (E)",   labelEn:"Education"   },
      { id:"C", label:"Cleanliness (C)",   labelEn:"Cleanliness" },
      { id:"L", label:"Leadership (L)",   labelEn:"Leadership"  },
      { id:"S", label:"Spirit (S)",   labelEn:"Spirit"      },
    ],
    calc: v => ([v.A,v.D,v.M,v.E,v.C,v.L,v.S].reduce((s,x)=>s+(x||0),0)) / 7,
    threshold: 75, dir: "gte",
  },
  {
    group: 2, id: "DI", name: "Decline Index", nameUr: "Decline Index",
    formula: "100 − HPI",
    desc: "Decline index — lower scores are better",
    color: "#475569",
    vars: [
      { id:"HPI", label:"House Performance (HPI)", labelEn:"HPI Score" },
    ],
    calc: v => 100 - (v.HPI||0),
    threshold: 25, dir: "lte", // lower is better
  },

  // ── GROUP 3 ───────────────────────────────────────────────
  {
    group: 3, id: "SGI", name: "Student Growth Index", nameUr: "Student Growth Index",
    formula: "(After − Before) ÷ Before × 100",
    desc: "Percentage progress in score across previous competitions",
    color: "#0d9488",
    vars: [
      { id:"Before", label:"Before Score (Before)", labelEn:"Before Score" },
      { id:"After",  label:"After Score (After)", labelEn:"After Score"  },
    ],
    calc: v => (v.Before||0) > 0 ? (((v.After||0) - (v.Before||0)) / (v.Before||1)) * 100 : 0,
    threshold: 0, dir: "gte", allowNeg: true,
  },
  {
    group: 3, id: "CAF", name: "Corrective Action Follow-up", nameUr: "Corrective Action Follow-up",
    formula: "(Implemented ÷ Planned) × 100",
    desc: "Percentage of planned corrective actions implemented",
    color: "#166534",
    vars: [
      { id:"Planned",     label:"Planned (Planned)",  labelEn:"Planned Actions"      },
      { id:"Implemented", label:"Implemented (Implemented)", labelEn:"Implemented Actions" },
    ],
    calc: v => (v.Planned||0) > 0 ? Math.min(100, ((v.Implemented||0) / (v.Planned||1)) * 100) : 0,
    threshold: 80, dir: "gte",
  },
  {
    group: 3, id: "API", name: "Average Performance Index", nameUr: "Average Performance Index",
    formula: "(HPI₁ + HPI₂ + HPI₃) ÷ 3",
    desc: "Average HPI of three terms — annual performance trend",
    color: "#7c3aed",
    vars: [
      { id:"HPI1", label:"Term 1 HPI₁", labelEn:"Term 1 HPI" },
      { id:"HPI2", label:"Term 2 HPI₂", labelEn:"Term 2 HPI" },
      { id:"HPI3", label:"Term 3 HPI₃", labelEn:"Term 3 HPI" },
    ],
    calc: v => ((v.HPI1||0) + (v.HPI2||0) + (v.HPI3||0)) / 3,
    threshold: 75, dir: "gte",
  },
  {
    group: 3, id: "OGE", name: "Overall Growth Effectiveness", nameUr: "Overall Growth Effectiveness",
    formula: "(HPI + SGI + CAF) ÷ 3",
    desc: "Combined index of Performance, Progress, and Corrective Actions",
    color: "#b7860b",
    vars: [
      { id:"HPI", label:"House Performance (HPI)", labelEn:"HPI Score" },
      { id:"SGI", label:"Growth Index (SGI)",    labelEn:"SGI Score" },
      { id:"CAF", label:"Corrective Actions % (CAF)", labelEn:"CAF %"     },
    ],
    calc: v => ((v.HPI||0) + (v.SGI||0) + (v.CAF||0)) / 3,
    threshold: 70, dir: "gte",
  },
];

// ===================== HELPERS =====================
function getZone(f, result) {
  const r = isNaN(result) ? 0 : result;
  if (f.dir === "gte") {
    if (r >= f.threshold) return { label:"Saved", labelEn:"Green Zone", color:"#16a34a", bg:"#dcfce7", icon:"✅" };
    if (r >= f.threshold * 0.75) return { label:"Risk", labelEn:"Warning", color:"#d97706", bg:"#fef3c7", icon:"⚠️" };
    return { label:"Investigation Required", labelEn:"Red Zone", color:"#dc2626", bg:"#fee2e2", icon:"🚨" };
  } else {
    if (r <= f.threshold) return { label:"Saved", labelEn:"Green Zone", color:"#16a34a", bg:"#dcfce7", icon:"✅" };
    if (r <= f.threshold * 1.5) return { label:"Risk", labelEn:"Warning", color:"#d97706", bg:"#fef3c7", icon:"⚠️" };
    return { label:"Investigation Required", labelEn:"Red Zone", color:"#dc2626", bg:"#fee2e2", icon:"🚨" };
  }
}

function ResultDisplay({ result, zone, f }) {
  const display = isNaN(result) ? "—" : result.toFixed(1);
  return (
    <div style={{
      textAlign:"center", padding:"16px 12px",
      background: zone.bg, borderRadius:"14px",
      border:`2px solid ${zone.color}40`,
    }}>
      <div style={{ fontSize:"2rem", fontWeight:"800", color: zone.color, lineHeight:1 }}>{display}</div>
      <div style={{ fontSize:"0.6rem", color: zone.color, marginTop:"4px" }}>
        {f.dir==="gte"?"Threshold: ≥"+f.threshold : "Threshold: ≤"+f.threshold}
      </div>
      <div style={{
        marginTop:"8px", display:"inline-flex", alignItems:"center", gap:"5px",
        background: zone.color+"15", border:`1px solid ${zone.color}40`,
        borderRadius:"20px", padding:"4px 12px",
      }}>
        <span>{zone.icon}</span>
        <span style={{ fontSize:"0.68rem", color: zone.color, fontWeight:"700" }}>{zone.labelEn}</span>
      </div>
    </div>
  );
}

// ===================== FORMULA CARD =====================
function FormulaCard({ f, vals, onChange }) {
  const [open, setOpen] = useState(false);
  const v = vals[f.id] || {};
  const result = f.calc(v);
  const zone = getZone(f, result);
  const grp = GROUPS.find(g => g.id === f.group);

  return (
    <div style={{
      background:"white", borderRadius:"18px",
      border:`2px solid ${open ? f.color : f.color+"40"}`,
      boxShadow: open ? `0 6px 24px ${f.color}20` : "0 2px 10px rgba(0,0,0,0.06)",
      overflow:"hidden", transition:"box-shadow 0.2s",
    }}>
      {/* Card header */}
      <div
        onClick={() => setOpen(!open)}
        style={{ cursor:"pointer", padding:"14px 18px", display:"flex", alignItems:"center", gap:"12px" }}
      >
        {/* Acronym badge */}
        <div style={{
          background:`linear-gradient(135deg,${f.color},${f.color}cc)`,
          color:"white", borderRadius:"10px", padding:"6px 10px",
          fontSize:"0.72rem", fontWeight:"800", flexShrink:0, minWidth:"46px", textAlign:"center",
          boxShadow:`0 4px 10px ${f.color}40`,
        }}>
          {f.id}
        </div>

        {/* Name + formula */}
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:"0.82rem", fontWeight:"800", color:f.color }}>{f.name}</div>
          <div style={{ fontSize:"0.58rem", color:"#888", marginTop:"2px", direction:"ltr", textAlign:"left" }}>{f.id}</div>
        </div>

        {/* Mini result + zone */}
        <div style={{
          flexShrink:0, textAlign:"center",
          background: zone.bg, borderRadius:"10px", padding:"6px 12px",
          border:`1px solid ${zone.color}30`,
        }}>
          <div style={{ fontSize:"1rem", fontWeight:"800", color:zone.color }}>
            {isNaN(result) ? "—" : result.toFixed(1)}
          </div>
          <div style={{ fontSize:"0.55rem", color:zone.color }}>{zone.icon} {zone.labelEn}</div>
        </div>

        {/* Group tag + expand */}
        <div style={{ flexShrink:0, display:"flex", flexDirection:"column", alignItems:"flex-end", gap:"4px" }}>
          <div style={{
            background: grp.color+"15", color:grp.color,
            borderRadius:"8px", padding:"2px 8px", fontSize:"0.55rem", fontWeight:"700",
          }}>
            G{f.group} {grp.icon}
          </div>
          <div style={{ color:f.color, fontSize:"0.6rem", opacity:0.6 }}>{open?"▲":"▼"}</div>
        </div>
      </div>

      {/* Expanded body */}
      {open && (
        <div style={{ padding:"0 18px 18px", borderTop:`1px solid ${f.color}15` }}>
          {/* Formula display */}
          <div style={{
            background:`${f.color}08`, borderRadius:"10px", padding:"10px 14px",
            marginBottom:"14px", marginTop:"12px",
          }}>
            <div style={{ fontSize:"0.6rem", color:"#999", marginBottom:"4px" }}>Formula</div>
            <div style={{ fontSize:"0.75rem", color:f.color, fontWeight:"700", direction:"ltr", textAlign:"left", fontFamily:"monospace" }}>
              {f.id} = {f.formula}
            </div>
            <div style={{ fontSize:"0.65rem", color:"#666", marginTop:"6px" }}>{f.desc}</div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr auto", gap:"14px", alignItems:"start" }}>
            {/* Variable inputs */}
            <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
              {f.vars.map(vr => (
                <div key={vr.id} style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                  <label style={{ flex:1, fontSize:"0.7rem", color:"#555", whiteSpace:"nowrap" }}>
                    {vr.labelEn}
                  </label>
                  <div style={{ display:"flex", alignItems:"center", gap:"6px" }}>
                    <input
                      type="range"
                      min={f.allowNeg ? -100 : 0}
                      max={vr.id==="Implemented"||vr.id==="Planned" ? 200 : 100}
                      value={v[vr.id] ?? 0}
                      onChange={e => onChange(f.id, vr.id, Number(e.target.value))}
                      style={{ width:"90px", accentColor:f.color, cursor:"pointer" }}
                    />
                    <input
                      type="number"
                      min={f.allowNeg ? -100 : 0}
                      max={vr.id==="Implemented"||vr.id==="Planned" ? 200 : 100}
                      value={v[vr.id] ?? 0}
                      onChange={e => onChange(f.id, vr.id, Number(e.target.value))}
                      style={{
                        width:"52px", padding:"5px 6px", border:`1.5px solid ${f.color}40`,
                        borderRadius:"8px", fontSize:"0.72rem", textAlign:"center",
                        outline:"none", fontFamily:"inherit", background:"#fafafa",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Result */}
            <div style={{ minWidth:"110px" }}>
              <ResultDisplay result={result} zone={zone} f={f} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ===================== MAIN COMPONENT =====================
export default function InvestigationHub() {
  const [vals, setVals] = useState({});
  const [activeGroup, setActiveGroup] = useState(0); // 0=All

  const setVar = (fId, vId, val) => {
    setVals(prev => ({ ...prev, [fId]: { ...(prev[fId]||{}), [vId]: val } }));
  };

  // Compute all results for summary
  const allResults = FORMULAS.map(f => {
    const result = f.calc(vals[f.id]||{});
    const zone = getZone(f, result);
    return { f, result, zone };
  });

  const redFlags = allResults.filter(r => r.zone.labelEn === "Red Zone");
  const warnings = allResults.filter(r => r.zone.labelEn === "Warning");
  const safeCount = allResults.filter(r => r.zone.labelEn === "Green Zone").length;

  const visibleFormulas = activeGroup === 0
    ? FORMULAS
    : FORMULAS.filter(f => f.group === activeGroup);

  return (
    <div style={{ padding:"20px 16px", maxWidth:"1100px", margin:"0 auto", fontFamily:"'Segoe UI',Arial,serif", direction:"ltr" }}>

      {/* ── Header ── */}
      <div style={{ background:"linear-gradient(135deg,#0f172a,#1e293b)", borderRadius:"20px", padding:"24px 28px", marginBottom:"24px", border:"1px solid rgba(183,134,11,0.3)", boxShadow:"0 8px 32px rgba(0,0,0,0.2)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"14px", marginBottom:"16px" }}>
          <div style={{ fontSize:"2.2rem" }}>🔬</div>
          <div>
            <div style={{ color:"#d4af37", fontSize:"1.25rem", fontWeight:"800" }}>Investigation Hub — 12 Formulas</div>
            <div style={{ color:"rgba(255,255,255,0.45)", fontSize:"0.68rem", direction:"ltr", textAlign:"left" }}>
              Investigation Hub — 12 Formula Calculators with Zone Alerts
            </div>
          </div>
        </div>

        {/* Status counters */}
        <div style={{ display:"flex", gap:"10px", flexWrap:"wrap" }}>
          {[
            { label:"Total Formulas",  val:"12",             color:"#d4af37" },
            { label:"Saved ✅",    val:safeCount,         color:"#4ade80" },
            { label:"Risk ⚠️",    val:warnings.length,   color:"#fb923c" },
            { label:"Dangerous 🚨",  val:redFlags.length,   color:"#f87171" },
          ].map(s => (
            <div key={s.label} style={{ background:"rgba(255,255,255,0.05)", borderRadius:"12px", padding:"10px 18px", textAlign:"center", border:`1px solid ${s.color}30`, flex:"1 1 80px" }}>
              <div style={{ color:s.color, fontSize:"1.4rem", fontWeight:"800" }}>{s.val}</div>
              <div style={{ color:"rgba(255,255,255,0.45)", fontSize:"0.62rem" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Director Summary — All 12 at a glance ── */}
      <div style={{ background:"white", borderRadius:"18px", padding:"20px 22px", marginBottom:"24px", border:"1px solid #e5e7eb", boxShadow:"0 2px 12px rgba(0,0,0,0.06)" }}>
        <div style={{ fontSize:"0.88rem", fontWeight:"800", color:"#1e293b", marginBottom:"14px", display:"flex", alignItems:"center", gap:"8px" }}>
          <span>📋</span> Director Summary — All 12 Formulas at a Glance
        </div>

        {/* 12 mini cards */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(120px,1fr))", gap:"8px", marginBottom:"16px" }}>
          {allResults.map(({ f, result, zone }) => (
            <div key={f.id} style={{
              textAlign:"center", padding:"10px 8px", borderRadius:"12px",
              background: zone.bg, border:`1.5px solid ${zone.color}40`,
            }}>
              <div style={{ fontSize:"0.68rem", fontWeight:"800", color:f.color }}>{f.id}</div>
              <div style={{ fontSize:"1.1rem", fontWeight:"800", color:zone.color, margin:"4px 0" }}>
                {isNaN(result) ? "—" : result.toFixed(1)}
              </div>
              <div style={{ fontSize:"0.55rem", color:zone.color }}>{zone.icon} {zone.labelEn}</div>
            </div>
          ))}
        </div>

        {/* Red flags list */}
        {redFlags.length > 0 && (
          <div style={{ background:"#fff5f5", border:"2px solid #fca5a5", borderRadius:"12px", padding:"12px 16px" }}>
            <div style={{ color:"#dc2626", fontWeight:"800", fontSize:"0.78rem", marginBottom:"8px" }}>
              🚨 Critical Indices — Immediate Attention Required
            </div>
            {redFlags.map(({ f, result }) => (
              <div key={f.id} style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"5px", fontSize:"0.72rem", color:"#7f1d1d" }}>
                <span style={{ background:"#dc2626", color:"white", borderRadius:"6px", padding:"2px 8px", fontSize:"0.6rem", fontWeight:"800" }}>{f.id}</span>
                <span>{f.name}</span>
                <span style={{ marginRight:"auto", color:"#dc2626", fontWeight:"700" }}>= {isNaN(result)?"—":result.toFixed(1)}</span>
                <span style={{ color:"#999", fontSize:"0.6rem" }}>{f.dir==="gte"?"Threshold ≥":"Threshold ≤"}{f.threshold}</span>
              </div>
            ))}
          </div>
        )}

        {redFlags.length === 0 && (
          <div style={{ background:"#f0fdf4", border:"1.5px solid #86efac", borderRadius:"10px", padding:"10px 14px", textAlign:"center", fontSize:"0.75rem", color:"#166534" }}>
            ✅ All indices are in the safe zone
          </div>
        )}
      </div>

      {/* ── Group Tabs ── */}
      <div style={{ display:"flex", gap:"8px", marginBottom:"20px", flexWrap:"wrap" }}>
        <button
          onClick={() => setActiveGroup(0)}
          style={{
            padding:"9px 18px", borderRadius:"12px", border:"none", cursor:"pointer",
            background: activeGroup===0 ? "linear-gradient(135deg,#1e293b,#0f172a)" : "#f1f5f9",
            color: activeGroup===0 ? "#d4af37" : "#64748b",
            fontWeight: activeGroup===0 ? "800" : "600", fontSize:"0.75rem",
            fontFamily:"inherit", transition:"all 0.2s",
          }}
        >
          🔢 All (12)
        </button>
        {GROUPS.map(g => {
          const cnt = FORMULAS.filter(f=>f.group===g.id).length;
          const isAct = activeGroup===g.id;
          return (
            <button
              key={g.id}
              onClick={() => setActiveGroup(g.id)}
              style={{
                padding:"9px 18px", borderRadius:"12px", border:`2px solid ${isAct?g.color:g.color+"40"}`,
                cursor:"pointer", background: isAct ? g.color+"15" : "white",
                color: isAct ? g.color : "#64748b",
                fontWeight: isAct ? "800" : "600", fontSize:"0.75rem", fontFamily:"inherit",
              }}
            >
              {g.icon} {g.labelEn} ({cnt})
            </button>
          );
        })}
      </div>

      {/* ── Formula Cards ── */}
      {GROUPS.filter(g => activeGroup===0 || g.id===activeGroup).map(grp => {
        const fms = visibleFormulas.filter(f => f.group === grp.id);
        if (!fms.length) return null;
        return (
          <div key={grp.id} style={{ marginBottom:"28px" }}>
            {/* Group header */}
            <div style={{
              display:"flex", alignItems:"center", gap:"10px",
              marginBottom:"12px", paddingBottom:"10px",
              borderBottom:`2px solid ${grp.color}30`,
            }}>
              <div style={{
                background:`linear-gradient(135deg,${grp.color},${grp.color}cc)`,
                color:"white", borderRadius:"10px", padding:"6px 14px",
                fontSize:"0.75rem", fontWeight:"800",
              }}>
                {grp.icon} Group {grp.id}
              </div>
              <div>
                <div style={{ fontSize:"0.88rem", fontWeight:"800", color:grp.color }}>{grp.labelEn}</div>
                <div style={{ fontSize:"0.62rem", color:"#888" }}>{fms.length} formulas</div>
              </div>
            </div>

            {/* Cards grid */}
            <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
              {fms.map(f => (
                <FormulaCard key={f.id} f={f} vals={vals} onChange={setVar} />
              ))}
            </div>
          </div>
        );
      })}

      {/* ── Guide ── */}
      <div style={{ background:"linear-gradient(135deg,#0f172a,#1e293b)", borderRadius:"16px", padding:"20px 24px", border:"1px solid rgba(183,134,11,0.2)", marginTop:"8px" }}>
        <div style={{ color:"#d4af37", fontSize:"0.82rem", fontWeight:"800", marginBottom:"12px" }}>📖 Zone Guide</div>
        <div style={{ display:"flex", gap:"12px", flexWrap:"wrap" }}>
          {[
            { icon:"✅", label:"Safe (Green Zone)", desc:"Above threshold — no action required", color:"#4ade80" },
            { icon:"⚠️", label:"Risk (Warning)",    desc:"Near threshold — monitoring required",       color:"#fb923c" },
            { icon:"🚨", label:"Critical (Red Zone)", desc:"Below threshold — immediate investigation required",   color:"#f87171" },
          ].map(z => (
            <div key={z.label} style={{ flex:"1 1 180px", background:"rgba(255,255,255,0.04)", borderRadius:"10px", padding:"10px 14px", border:`1px solid ${z.color}20` }}>
              <div style={{ fontSize:"1rem", marginBottom:"4px" }}>{z.icon}</div>
              <div style={{ color:z.color, fontSize:"0.72rem", fontWeight:"700" }}>{z.label}</div>
              <div style={{ color:"rgba(255,255,255,0.4)", fontSize:"0.62rem", marginTop:"3px" }}>{z.desc}</div>
            </div>
          ))}
        </div>
        <div style={{ color:"rgba(255,255,255,0.35)", fontSize:"0.62rem", marginTop:"12px", textAlign:"center" }}>
          💡 For HPRI and DI, lower scores are better — their threshold is ≤25
        </div>
      </div>
    </div>
  );
}
