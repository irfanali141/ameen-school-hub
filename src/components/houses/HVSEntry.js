/* eslint-disable */
import { useState, useEffect, useMemo } from "react";
import { getData, updateData } from "../../supabase";
import { C, HOUSES, HVS_TOTAL, sLabel } from "../../constants";

// ─── Category Definitions ─────────────────────────────────────────────────────

const HM_CATS = [
  { id:"zabt",    label:"Discipline & Order",    labelEn:"Discipline",  max:15, icon:"⚔️", desc:"Queue, Uniform, Silence" },
  { id:"safai",   label:"Cleanliness",         labelEn:"Cleanliness", max:15, icon:"🧹", desc:"Personal, Class, House" },
  { id:"josh",    label:"House Spirit",     labelEn:"House Spirit", max:10, icon:"🔥", desc:"Chant, Team Spirit, Enthusiasm" },
  { id:"qiyadat", label:"Leadership",         labelEn:"Leadership",  max:10, icon:"👑", desc:"Captain, Monitor Performance" },
];
const HM_MAX = 50;

const TEACHER_CATS = [
  { id:"ilm",    label:"Knowledge & Education",  labelEn:"Academic",   max:25, icon:"📚", desc:"Homework, Questions, Test Standard", auto:false },
  { id:"haziri", label:"Attendance",        labelEn:"Attendance", max:10, icon:"✅", desc:"Today's Attendance — auto from attendance table", auto:true  },
];
const TEACHER_MAX = 35;

const MADRASA_CATS = [
  { id:"akhlaq",   label:"Morality",     labelEn:"Morality",       max:15, icon:"💎", desc:"Truthfulness, Respect, Mutual Help",        auto:false },
  { id:"dini_ilm", label:"Islamic Studies",     labelEn:"Islamic Studies", max:10, icon:"📖", desc:"Auto from Hifz log",            auto:true  },
  { id:"qiyadat",  label:"Spiritual Leadership", labelEn:"Spiritual Lead",  max:5,  icon:"🕌", desc:"Recitation, Iqamat, Literary Society",  auto:false },
  { id:"josh",     label:"Dini Spirit",     labelEn:"Dini Spirit",     max:5,  icon:"🌟", desc:"Namaz, Dhikr, Group Activity",  auto:false },
];
const MADRASA_MAX = 25; // manual only; dini_ilm auto added separately

const ALL_EXC_CATS = [
  ...HM_CATS.map(c => ({...c, roleLabel:"House Master"})),
  ...TEACHER_CATS.map(c => ({...c, roleLabel:"Class Teacher"})),
  ...MADRASA_CATS.map(c => ({...c, roleLabel:"Madrasa Ustad"})),
];

const ROLES = [
  { id:"housemaster", label:"🏠 House Master", en:"House Master",  color:C.abuBakr, light:C.abuBakrLight },
  { id:"teacher",     label:"👨‍🏫 Class Teacher", en:"Class Teacher", color:C.umar,    light:C.umarLight    },
  { id:"madrasa",     label:"📖 Madrasa Ustad", en:"Madrasa Ustad", color:C.uthman,  light:C.uthmanLight  },
];

// 3-consecutive-day thresholds (50% of max for each cat)
const THRESHOLDS = { zabt:8, safai:8, josh:5, qiyadat:5, ilm:13, haziri:5, akhlaq:8, dini_ilm:5, qiyadat_m:3, josh_m:3 };

// ─── Sub-field Breakdown Definitions ─────────────────────────────────────────

const SUB_FIELDS = {
  zabt: [
    { id:"nizam",   label:"Discipline & Silence",       labelEn:"Nizam wa Khamoshi",     max:5 },
    { id:"ihtaram", label:"Respect of Teachers",      labelEn:"Ihtaram-e-Asatiza",     max:5 },
    { id:"vardi",   label:"Uniform & Appearance",  labelEn:"Vardi wa Zahiri Halat", max:5 },
  ],
  safai: [
    { id:"zati",    label:"Personal Cleanliness",     labelEn:"Zati Safai",       max:5 },
    { id:"class",   label:"Class Room Cleanliness", labelEn:"Class Room Safai", max:5 },
    { id:"ijtamai", label:"Group Cleanliness",  labelEn:"Ijtamai Safai",    max:5 },
  ],
  josh: [
    { id:"naara", label:"Enthusiasm & Chant",  labelEn:"Josh wa Naara", max:4 },
    { id:"team",  label:"Team Work",    labelEn:"Team Work",     max:3 },
    { id:"mood",  label:"Mood & Spirit", labelEn:"Mood wa Jazba", max:3 },
  ],
  qiyadat: [
    { id:"kirdar", label:"Leadership Character",      labelEn:"Qaidana Kirdar",    max:4 },
    { id:"zimma",  label:"Responsibility & Management",  labelEn:"Zimmedari/Intizam", max:3 },
    { id:"taluq",  label:"Connection & Communication",         labelEn:"Taluq wa Rabt",     max:3 },
  ],
  ilm: [
    { id:"participation", label:"Class Participation",       labelEn:"Class Participation",  max:5  },
    { id:"homework",      label:"Homework/Assignment", labelEn:"Homework/Assignment",  max:5  },
    { id:"test",          label:"Test/Result",        labelEn:"Test/Result",          max:10 },
    { id:"reading",       label:"Reading Hub/Projects",  labelEn:"Reading Hub/Projects", max:5  },
  ],
  akhlaq: [
    { id:"bartao",  label:"Ethics & Behaviour",        labelEn:"Akhlaq wa Bartao",      max:5 },
    { id:"taawun",  label:"Cooperation & Goodwill",     labelEn:"Taawun wa Khairkhwahi", max:5 },
    { id:"namaz",   label:"Namaz/Dini Responsibility", labelEn:"Namaz/Dini Zimmedari",  max:5 },
  ],
};

// ─── Weekly Duties ────────────────────────────────────────────────────────────

const DUTY_ITEMS = [
  { id:"assembly",     label:"Assembly System",        labelEn:"Assembly System",    icon:"🎺", desc:"Quran, Dua, Thought, Discipline, Queue" },
  { id:"cleanliness",  label:"Cleanliness System",          labelEn:"Cleanliness System", icon:"🧹", desc:"Classroom, ground, dustbin" },
  { id:"chacha",       label:"Chacha Assistance",         labelEn:"Chacha Assistance",  icon:"🤝", desc:"Break management, water, food" },
  { id:"salah",        label:"Salah Arrangement",         labelEn:"Salah Arrangement",  icon:"🕌", desc:"Row Order, Wudu, Adhan, Iqamat" },
  { id:"akhlaq",       label:"Ethics & Behaviour",       labelEn:"Akhlaq & Behaviour", icon:"💎", desc:"Respect, Kindness, Manners" },
  { id:"coordination", label:"House Coordination",    labelEn:"House Coordination", icon:"🤜", desc:"Cooperation, Contact, Harmony" },
];

const RATING_OPTS = [
  { value:1, label:"1 — Weak", labelEn:"Kamzor", color:"#f87171" },
  { value:2, label:"2 — Average",  labelEn:"Theek",  color:"#fb923c" },
  { value:3, label:"3 — Good",  labelEn:"Acha",   color:"#facc15" },
  { value:4, label:"4 — Excellent",  labelEn:"Umda",   color:"#4ade80" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const today = () => new Date().toISOString().slice(0,10);

const getWeekNum = (d = new Date()) => {
  const tmp = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = tmp.getUTCDay() || 7;
  tmp.setUTCDate(tmp.getUTCDate() + 4 - day);
  const ys = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
  return Math.ceil(((tmp - ys) / 86400000 + 1) / 7);
};

const getWeekStr = (d) => {
  const tmp = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = tmp.getUTCDay() || 7;
  tmp.setUTCDate(tmp.getUTCDate() + 4 - day);
  const ys = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
  const w = Math.ceil(((tmp - ys) / 86400000 + 1) / 7);
  return `${tmp.getUTCFullYear()}-W${String(w).padStart(2,'0')}`;
};

const scColor = (pct) => pct >= 80 ? "#4ade80" : pct >= 50 ? "#fb923c" : "#f87171";
const medal   = (i) => i===0?"🥇":i===1?"🥈":i===2?"🥉":null;

// ─── Slider ───────────────────────────────────────────────────────────────────

function Slider({ cat, value, onChange, autoValue, roleColor }) {
  const isAuto = !!cat.auto;
  const val    = isAuto ? (autoValue ?? 0) : (value ?? 0);
  const pct    = Math.round((val / cat.max) * 100);
  const col    = isAuto ? "#4ade80" : scColor(pct);
  const ticks  = [0, Math.round(cat.max*0.25), Math.round(cat.max*0.5), Math.round(cat.max*0.75), cat.max];

  return (
    <div style={{ marginBottom:"22px" }}>
      {/* Label row */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"10px" }}>
        <div style={{ flex:1 }}>
          <div style={{ display:"flex", alignItems:"center", gap:"7px", marginBottom:"3px" }}>
            <span style={{ fontSize:"1rem" }}>{cat.icon}</span>
            <span style={{ fontSize:"0.86rem", fontWeight:"800", color:"#f1f5f9" }}>{cat.labelEn}</span>
            {isAuto && (
              <span style={{ background:"rgba(74,222,128,0.15)", color:"#4ade80", fontSize:"0.58rem",
                padding:"2px 8px", borderRadius:"10px", border:"1px solid rgba(74,222,128,0.35)",
                fontWeight:"800" }}>AUTO ✦</span>
            )}
          </div>
          <div style={{ fontSize:"0.62rem", color:"rgba(255,255,255,0.38)" }}>{cat.desc}</div>
        </div>
        <div style={{ textAlign:"center", flexShrink:0, marginRight:"12px",
          background:`${col}15`, border:`1px solid ${col}40`,
          borderRadius:"10px", padding:"4px 12px", minWidth:"54px" }}>
          <span style={{ fontSize:"1.5rem", fontWeight:"900", color:col, fontFamily:"'Public Sans',sans-serif" }}>{val}</span>
          <span style={{ fontSize:"0.6rem", color:"rgba(255,255,255,0.35)", display:"block", marginTop:"-2px" }}>/{cat.max}</span>
        </div>
      </div>

      {/* Track */}
      {isAuto ? (
        <div style={{ position:"relative", height:"10px", background:"rgba(255,255,255,0.08)",
          borderRadius:"5px", overflow:"hidden" }}>
          <div style={{ position:"absolute", left:0, top:0, bottom:0,
            width:`${pct}%`, borderRadius:"5px", transition:"width 0.5s ease",
            background:"linear-gradient(90deg,#22c55e,#4ade80)" }}/>
          <div style={{ position:"absolute", right:0, top:0, bottom:0, width:`${100-pct}%`,
            background:"rgba(255,255,255,0.04)" }}/>
        </div>
      ) : (
        <div style={{ position:"relative" }}>
          {/* filled track */}
          <div style={{ position:"absolute", top:"50%", left:0, transform:"translateY(-50%)",
            width:"100%", height:"6px", background:"rgba(255,255,255,0.08)", borderRadius:"3px", zIndex:0 }}>
            <div style={{ width:`${pct}%`, height:"100%", background:`linear-gradient(90deg,${col}88,${col})`,
              borderRadius:"3px", transition:"width 0.2s" }}/>
          </div>
          <input
            type="range" min={0} max={cat.max} step={1} value={val}
            onChange={e => onChange(Number(e.target.value))}
            style={{ position:"relative", zIndex:1, width:"100%", height:"6px",
              appearance:"none", WebkitAppearance:"none", outline:"none",
              background:"transparent", cursor:"pointer", margin:"8px 0",
              accentColor: col }}
          />
        </div>
      )}

      {/* Ticks */}
      <div style={{ display:"flex", justifyContent:"space-between", marginTop:"2px" }}>
        {ticks.map(t => (
          <span key={t} style={{ fontSize:"0.52rem", color: val>=t && !isAuto ? col+"99" : "rgba(255,255,255,0.18)" }}>{t}</span>
        ))}
      </div>
    </div>
  );
}

// ─── Sub-score Accordion ──────────────────────────────────────────────────────

function SubAccordion({ catId, subs, values, onChange, catTotal, catMax, roleColor, open, onToggle }) {
  const col = roleColor || "#d4af37";
  return (
    <div style={{ marginTop:"-10px", marginBottom:"20px" }}>
      {/* Toggle button */}
      <button onClick={onToggle} style={{
        width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between",
        background: open ? `${col}10` : "rgba(255,255,255,0.03)",
        border:`1px solid ${open ? col+"30" : "rgba(255,255,255,0.08)"}`,
        borderRadius: open ? "10px 10px 0 0" : "10px",
        padding:"8px 14px", cursor:"pointer", fontFamily:"'Public Sans',sans-serif",
        transition:"all 0.2s" }}>
        <span style={{ fontSize:"0.65rem", color:col, fontWeight:"700", letterSpacing:"0.04em" }}>
          📊 Sub-score Breakdown
        </span>
        <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
          {catTotal > 0 && (
            <span style={{ fontSize:"0.62rem", background:`${col}18`,
              color:col, padding:"2px 8px", borderRadius:"8px", fontWeight:"700" }}>
              {catTotal}/{catMax}
            </span>
          )}
          <span style={{ color:"rgba(255,255,255,0.35)", fontSize:"0.68rem" }}>{open ? "▲" : "▼"}</span>
        </div>
      </button>

      {open && (
        <div style={{ background:"rgba(255,255,255,0.03)",
          border:`1px solid ${col}20`, borderTop:"none",
          borderRadius:"0 0 10px 10px", padding:"12px 14px 10px" }}>
          {subs.map(sf => {
            const val = Number(values[sf.id] || 0);
            const isOver = val > sf.max;
            const pct = Math.round((val / sf.max) * 100);
            return (
              <div key={sf.id} style={{ marginBottom:"10px" }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:"10px" }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:"0.72rem", fontWeight:"700", color:"#e2e8f0" }}>{sf.labelEn}</div>
                    <div style={{ fontSize:"0.57rem", color:"rgba(255,255,255,0.3)", marginTop:"1px" }}>
                      max {sf.max}
                    </div>
                  </div>
                  {/* Mini progress bar */}
                  <div style={{ width:"60px", height:"4px", background:"rgba(255,255,255,0.08)",
                    borderRadius:"2px", overflow:"hidden", flexShrink:0 }}>
                    <div style={{ width:`${Math.min(100,pct)}%`, height:"100%",
                      background: isOver ? "#dc2626" : col, borderRadius:"2px",
                      transition:"width 0.2s" }}/>
                  </div>
                  {/* Number input */}
                  <input
                    type="number" min={0} max={sf.max} value={val || ""}
                    onChange={e => onChange(sf.id, Math.min(sf.max, Math.max(0, Number(e.target.value)||0)))}
                    onBlur={e => { if(e.target.value==="") onChange(sf.id, 0); }}
                    style={{ width:"54px", padding:"6px 8px", borderRadius:"8px", textAlign:"center",
                      border: isOver ? "2px solid #dc2626" : `1px solid ${col}30`,
                      background: isOver ? "rgba(220,38,38,0.12)" : "rgba(255,255,255,0.06)",
                      color: isOver ? "#f87171" : "#f1f5f9", fontSize:"0.88rem", fontWeight:"700",
                      outline:"none", colorScheme:"dark", fontFamily:"'Public Sans',sans-serif",
                      flexShrink:0 }}
                  />
                </div>
                {isOver && (
                  <div style={{ fontSize:"0.55rem", color:"#f87171", marginTop:"2px", textAlign:"left" }}>
                    ⚠ Exceeds max {sf.max}
                  </div>
                )}
              </div>
            );
          })}
          {/* Auto-sum total row */}
          <div style={{ borderTop:`1px solid ${col}20`, paddingTop:"10px", marginTop:"4px",
            display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontSize:"0.68rem", color:"rgba(255,255,255,0.4)", fontWeight:"600" }}>
              Auto Total
            </span>
            <div style={{ display:"flex", alignItems:"center", gap:"6px" }}>
              <span style={{ fontSize:"0.58rem", color:"rgba(255,255,255,0.25)" }}>readonly</span>
              <span style={{ fontSize:"1rem", fontWeight:"900", padding:"3px 12px",
                background:`${col}15`, border:`1px solid ${col}30`, borderRadius:"8px",
                color: catTotal >= catMax ? "#4ade80" : catTotal >= catMax*0.5 ? "#fb923c" : "#f1f5f9" }}>
                {catTotal}/{catMax}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function HVSEntry({ students=[], addData, updateHousePoints, hvsLogs=[], userRole="",
  results=[], hifzLogsData=[], attendanceLogs=[] }) {

  // If the logged-in user has a specific entry role, lock the tab to it
  // housemaster → "housemaster", madrasa → "madrasa", teacher → "teacher", others → null (all tabs)
  const lockedRole = userRole==="housemaster" ? "housemaster"
                   : userRole==="madrasa"     ? "madrasa"
                   : userRole==="teacher"     ? "teacher"
                   : null;

  // ── Core state ──
  const [role, setRole]                 = useState(lockedRole || "housemaster");
  const [selectedHouse, setSelectedHouse] = useState("abuBakr");
  const [selectedClass, setSelectedClass] = useState("");
  const [entryDate, setEntryDate]       = useState(today());

  // ── Score state (per role) ──
  const [hmScores, setHmScores]         = useState({zabt:0, safai:0, josh:0, qiyadat:0});
  const [teacherScores, setTeacherScores] = useState({ilm:0});
  const [madrasaScores, setMadrasaScores] = useState({akhlaq:0, qiyadat:0, josh:0});

  // ── Auto score source data — prefer props from App.js, fallback to internal fetch ──
  const [attLogsLocal,  setAttLogsLocal]  = useState([]);
  const [hifzLogsLocal, setHifzLogsLocal] = useState([]);
  const attLogs  = attendanceLogs.length  ? attendanceLogs  : attLogsLocal;
  const hifzLogs = hifzLogsData.length    ? hifzLogsData    : hifzLogsLocal;

  // ── Exception state ──
  const [exceptions, setExceptions]   = useState([]);
  const [excSearch, setExcSearch]     = useState("");
  const [excStudent, setExcStudent]   = useState(null);
  const [excCat, setExcCat]           = useState("zabt");
  const [excAdj, setExcAdj]           = useState(0);
  const [excReason, setExcReason]     = useState("");

  // ── UI state ──
  const [saving, setSaving]               = useState(false);
  const [done, setDone]                   = useState(false);
  const [savedTotal, setSavedTotal]       = useState(0);
  const [dismissedAlerts, setDismissedAlerts] = useState(new Set());
  const [lbTab, setLbTab]                 = useState("month");
  const [lbHouseFilter, setLbHouseFilter] = useState("all");
  const [excOpen, setExcOpen]             = useState(false);
  const [editMode, setEditMode]           = useState(false);

  // ── Sub-score state ──
  const [subScores, setSubScores]     = useState({});   // catId → { subfieldId: number }
  const [expandedCats, setExpandedCats] = useState(new Set());

  // ── Weekly Duties state ──
  const [dutyRatings, setDutyRatings]           = useState({});  // itemId → 1-4
  const [dutyStrengths, setDutyStrengths]       = useState("");
  const [dutyImprovements, setDutyImprovements] = useState("");
  const [dutySaving, setDutySaving]             = useState(false);
  const [dutyDone, setDutyDone]                 = useState(false);

  // ── Watch List state ──
  const [watchList, setWatchList]   = useState([]);
  const [wlScores, setWlScores]     = useState({});   // wl.id → individual score (0-50)

  // ── Fetch attendance + hifz only if not provided via props ──
  useEffect(() => {
    if (!attendanceLogs.length) getData("attendance").then(d => { if(d && !d.error) setAttLogsLocal(d); });
    if (!hifzLogsData.length)   getData("hifz_logs").then(d  => { if(d && !d.error) setHifzLogsLocal(d); });
    getData("watch_list").then(d => { if(d && !d.error) setWatchList(d); });
  }, []);

  // ── Grades list ──
  const grades = useMemo(() => {
    return [...new Set(students.map(s => s.grade).filter(Boolean))].sort();
  }, [students]);

  useEffect(() => {
    if (!selectedClass && grades.length) setSelectedClass(grades[0]);
  }, [grades]);

  // ── Auto: Haziri (Attendance) → 0-10 ──
  const haziriAuto = useMemo(() => {
    if (!selectedClass) return 0;
    const classStudents = students.filter(s => s.grade === selectedClass);
    if (!classStudents.length) return 0;
    const todayLogs = attLogs.filter(a => {
      const aDate = (a.date || a.created_at || "").slice(0,10);
      return aDate === entryDate;
    });
    const presentIds = new Set(
      todayLogs.filter(a => (a.status||"").toLowerCase() === "present" || a.present === true)
               .map(a => a.studentId || a.student_id)
    );
    const presentCount = classStudents.filter(s => presentIds.has(s.id)).length;
    return Math.round((presentCount / classStudents.length) * 10);
  }, [attLogs, selectedClass, entryDate, students]);

  // ── Auto: Dini Ilm (Hifz) → 0-10 ──
  const diniIlmAuto = useMemo(() => {
    if (!selectedClass) return 0;
    const classStudents = students.filter(s => s.grade === selectedClass);
    if (!classStudents.length) return 0;
    const ids = new Set(classStudents.map(s => s.id));
    const todayHifz = hifzLogs.filter(h => {
      const hDate = (h.date || h.created_at || "").slice(0,10);
      return hDate === entryDate && ids.has(h.studentId || h.student_id);
    });
    if (!todayHifz.length) return 0;
    const completed = todayHifz.filter(h =>
      (h.status || "").toLowerCase() === "complete" ||
      (h.sabaqStatus || "").toLowerCase() === "complete"
    ).length;
    return Math.round((completed / classStudents.length) * 10);
  }, [hifzLogs, selectedClass, entryDate, students]);

  // ── Auto: Ilm (Academic Results) → 0-25 from results table ──
  const ilmAuto = useMemo(() => {
    if (!selectedClass || !results.length) return null; // null = no data, keep manual
    const classStudents = students.filter(s => s.grade === selectedClass);
    if (!classStudents.length) return null;
    const ids = new Set(classStudents.map(s => s.id));
    const classResults = results.filter(r => ids.has(r.studentId || r.student_id));
    if (!classResults.length) return null;
    const avgPct = classResults.reduce((s,r) => s + (r.percentage || 0), 0) / classResults.length;
    return Math.min(25, Math.round((avgPct / 100) * 25));
  }, [results, selectedClass, students]);

  // ── Effective scores (sub-fields override slider when any sub > 0) ──
  const effectiveHmScores = useMemo(() => {
    const result = { ...hmScores };
    HM_CATS.forEach(cat => {
      const subs = subScores[cat.id];
      if (subs && Object.values(subs).some(v => Number(v) > 0)) {
        result[cat.id] = Math.min(cat.max,
          Object.values(subs).reduce((s,v) => s + (Number(v)||0), 0));
      }
    });
    return result;
  }, [hmScores, subScores]);

  const effectiveTeacherScores = useMemo(() => {
    const subs = subScores["ilm"];
    if (subs && Object.values(subs).some(v => Number(v) > 0)) {
      const total = Math.min(25, Object.values(subs).reduce((s,v) => s+(Number(v)||0), 0));
      return { ...teacherScores, ilm: total };
    }
    return teacherScores;
  }, [teacherScores, subScores]);

  const effectiveMadrasaScores = useMemo(() => {
    const subs = subScores["akhlaq"];
    if (subs && Object.values(subs).some(v => Number(v) > 0)) {
      const total = Math.min(15, Object.values(subs).reduce((s,v) => s+(Number(v)||0), 0));
      return { ...madrasaScores, akhlaq: total };
    }
    return madrasaScores;
  }, [madrasaScores, subScores]);

  // ── Totals ──
  const hmTotal      = HM_CATS.reduce((s,c) => s + (effectiveHmScores[c.id]||0), 0);
  // ilmAuto overrides manual slider when results data available
  const effectiveIlm = ilmAuto !== null ? ilmAuto : (effectiveTeacherScores.ilm||0);
  const teacherTotal = effectiveIlm + haziriAuto;
  const madrasaTotal = MADRASA_CATS.reduce((s,c) =>
    s + (c.auto ? diniIlmAuto : (effectiveMadrasaScores[c.id]||0)), 0);

  const currentTotal  = role==="housemaster" ? hmTotal : role==="teacher" ? teacherTotal : madrasaTotal;
  const currentMax    = role==="housemaster" ? HM_MAX : role==="teacher" ? TEACHER_MAX : (MADRASA_MAX + diniIlmAuto);
  const currentRole   = ROLES.find(r => r.id === role);

  // ── 3-day weakness alerts (house master only) ──
  const houseEntries = useMemo(() =>
    hvsLogs
      .filter(l => { const t=l.type||(l.scores||{}).type||""; return (l.houseId||l.house_id)===selectedHouse&&(t==="housemaster"||!t); })
      .sort((a,b) => (a.date||(a.scores||{}).date||a.week||"").localeCompare(b.date||(b.scores||{}).date||b.week||"")),
  [hvsLogs, selectedHouse]);

  const last3 = houseEntries.slice(-3);

  const weakAlerts = useMemo(() => {
    if (last3.length < 3 || role !== "housemaster") return [];
    return HM_CATS
      .filter(cat => {
        const thr = THRESHOLDS[cat.id] || 0;
        return last3.every(e => {
          const gs = e.group_scores || e.scores || {};
          return (gs[cat.id]||0) < thr;
        });
      })
      .filter(cat => !dismissedAlerts.has(cat.id));
  }, [last3, role, dismissedAlerts]);

  // ── Already-saved-today detection ──
  const todayEntry = useMemo(() => {
    return hvsLogs.find(l => {
      // date/type/class_id may live at top level (after SQL migration) or inside scores JSONB (before)
      const s = l.scores || {};
      const lDate = (l.date || s.date || l.created_at || "").slice(0,10);
      if (lDate !== entryDate) return false;
      const lType    = l.type    || s.type    || "";
      const lClassId = l.class_id || s.class_id || "";
      if (role === "housemaster") return (l.houseId||l.house_id) === selectedHouse && (lType==="housemaster"||!lType);
      if (role === "teacher")    return lClassId === selectedClass && lType === "teacher";
      if (role === "madrasa")    return lClassId === selectedClass && lType === "madrasa";
      return false;
    });
  }, [hvsLogs, entryDate, role, selectedHouse, selectedClass]);

  const loadExistingEntry = (entry) => {
    const gs = entry.group_scores || (entry.scores && typeof entry.scores === 'object' ? entry.scores : null) || {};
    const ss = entry.sub_scores || {};
    if (role === "housemaster") {
      setHmScores({ zabt: gs.zabt||0, safai: gs.safai||0, josh: gs.josh||0, qiyadat: gs.qiyadat||0 });
    } else if (role === "teacher") {
      setTeacherScores({ ilm: gs.ilm||0 });
    } else {
      setMadrasaScores({ akhlaq: gs.akhlaq||0, qiyadat: gs.qiyadat||0, josh: gs.josh||0 });
    }
    if (Object.keys(ss).length) setSubScores(ss);
    setEditMode(true);
  };

  // ── Active Watch List for current house (HM only) ──
  const activeWLForHouse = useMemo(() => {
    if (role !== "housemaster") return [];
    return watchList.filter(w =>
      (w.house_id || w.houseId) === selectedHouse &&
      (w.status || "active") === "active"
    );
  }, [watchList, selectedHouse, role]);

  // ── Exception: filtered students ──
  const filteredStudents = useMemo(() => {
    if (!excSearch.trim()) return [];
    const q = excSearch.trim().toLowerCase();
    return students.filter(s => (s.name||"").toLowerCase().includes(q)).slice(0,8);
  }, [excSearch, students]);

  const addException = () => {
    if (!excStudent) { alert("طالب علم منتخب کریں"); return; }
    if (!excAdj)     { alert("ایڈجسٹمنٹ درج کریں"); return; }
    if (!excReason.trim()) { alert("وجہ درج کریں"); return; }
    setExceptions(prev => [...prev, {
      student_id: excStudent.id,
      student_name: excStudent.name,
      house_id: excStudent.houseId,
      category: excCat,
      adjustment: excAdj,
      reason: excReason.trim(),
    }]);
    setExcStudent(null); setExcSearch(""); setExcAdj(0); setExcReason("");
  };

  const removeException = (i) => setExceptions(prev => prev.filter((_,idx) => idx!==i));

  // ── Save ──
  const save = async () => {
    setSaving(true);
    const week = getWeekStr(new Date(entryDate));

    let group_scores = {};
    let sub_scores = {};
    if (role === "housemaster") {
      console.log('Saving scores:', {zabt: effectiveHmScores.zabt, safai: effectiveHmScores.safai, josh: effectiveHmScores.josh, qiyadat: effectiveHmScores.qiyadat});
      group_scores.zabt     = effectiveHmScores.zabt     || 0;
      group_scores.safai    = effectiveHmScores.safai    || 0;
      group_scores.josh     = effectiveHmScores.josh     || 0;
      group_scores.qiyadat  = effectiveHmScores.qiyadat  || 0;
      HM_CATS.forEach(c => {
        if (subScores[c.id]) sub_scores[c.id] = subScores[c.id];
      });
    } else if (role === "teacher") {
      group_scores.ilm    = effectiveIlm;   // auto from results if available, else manual
      group_scores.haziri = haziriAuto;     // auto from attendance
      if (subScores["ilm"]) sub_scores["ilm"] = subScores["ilm"];
    } else {
      MADRASA_CATS.forEach(c => {
        group_scores[c.id] = c.auto ? diniIlmAuto : (effectiveMadrasaScores[c.id]||0);
        if (subScores[c.id]) sub_scores[c.id] = subScores[c.id];
      });
    }

    const logEntry = {
      house_id:         role==="housemaster" ? selectedHouse : null,
      class_id:         role!=="housemaster" ? selectedClass : null,
      week,
      date:             entryDate,
      type:             role,
      scores:           group_scores,
      group_scores,
      sub_scores:       Object.keys(sub_scores).length ? sub_scores : null,
      total_score:      role === "housemaster"
        ? (group_scores.zabt + group_scores.safai + group_scores.josh + group_scores.qiyadat)
        : currentTotal,
      entered_by:       role,
      exceptions_count: exceptions.length,
    };

    try {
      await addData("hvs_logs", logEntry);
    } catch(e) {
      setSaving(false);
      alert("Save failed: " + (e.message || e));
      return;
    }

    // Save each exception
    for (const exc of exceptions) {
      await addData("hvs_exceptions", { ...exc, date: entryDate, week });
    }

    // Save Watch List individual scores (HM only)
    if (role === "housemaster") {
      for (const wl of activeWLForHouse) {
        const score = wlScores[wl.id];
        if (score !== undefined) {
          await addData("hvs_exceptions", {
            student_id: wl.student_id || wl.studentId,
            house_id: selectedHouse,
            category: wl.category,
            adjustment: score,
            date: entryDate,
            week,
            reason: "Watch List Individual Entry",
            is_watchlist: true,
          });
        }
      }
      // Auto-detect new weak students → add to watch_list
      const houseLogs = [...hvsLogs
        .filter(l => (l.houseId||l.house_id)===selectedHouse && (l.type==="housemaster"||!l.type))
        .sort((a,b) => (a.date||"").localeCompare(b.date||"")),
        logEntry
      ].slice(-3);
      if (houseLogs.length >= 3) {
        const houseStudents = students.filter(s => (s.houseId||s.house_id)===selectedHouse);
        const existingWLIds = new Set(
          watchList.filter(w => (w.house_id||w.houseId)===selectedHouse && w.status==="active")
                   .map(w => w.student_id || w.studentId)
        );
        for (const cat of HM_CATS) {
          const thr = THRESHOLDS[cat.id] || 0;
          const allBelow = houseLogs.every(l => {
            const gs = l.group_scores || l.scores || {};
            return (gs[cat.id]||0) < thr;
          });
          if (allBelow) {
            for (const s of houseStudents) {
              if (!existingWLIds.has(s.id)) {
                await addData("watch_list", {
                  student_id: s.id,
                  house_id: selectedHouse,
                  category: cat.id,
                  reason: `${cat.labelEn} — 3 consecutive days below threshold`,
                  added_date: entryDate,
                  status: "active",
                });
              }
            }
          }
        }
        // Refresh watch_list after auto-detection
        getData("watch_list").then(d => { if(d && !d.error) setWatchList(d); });
      }
    }

    if (role === "housemaster") {
      await updateHousePoints(selectedHouse, hmTotal);
    }

    setSavedTotal(currentTotal);
    setSaving(false); setDone(true);
    setEditMode(false);
    setExceptions([]);
    setSubScores({});
    setExpandedCats(new Set());
    if (role==="housemaster") setHmScores({zabt:0,safai:0,josh:0,qiyadat:0});
    else if (role==="teacher") setTeacherScores({ilm:0});
    else setMadrasaScores({akhlaq:0,qiyadat:0,josh:0});
    setTimeout(() => setDone(false), 3000);
  };

  // ── Weekly Duties computed ──
  const weekNum    = getWeekNum();
  const dutyYear   = new Date().getFullYear();
  const dutyHouse  = HOUSES[weekNum % 4] || HOUSES[0];
  const dutyTotal  = DUTY_ITEMS.reduce((s, item) => s + (dutyRatings[item.id]||0) * 2.5, 0);

  const saveDuty = async () => {
    setDutySaving(true);
    const scores = {};
    DUTY_ITEMS.forEach(item => {
      scores[item.id] = { rating: dutyRatings[item.id]||0, score: (dutyRatings[item.id]||0) * 2.5 };
    });
    await addData("weekly_duties", {
      house_id:     selectedHouse,
      week_number:  weekNum,
      year:         dutyYear,
      date:         new Date().toISOString().split('T')[0],
      scores,
      total_score:  dutyTotal,
      strengths:    dutyStrengths.trim(),
      improvements: dutyImprovements.trim(),
    });
    setDutySaving(false); setDutyDone(true);
    setDutyRatings({}); setDutyStrengths(""); setDutyImprovements("");
    setTimeout(() => setDutyDone(false), 3000);
  };

  // ── Helper: compute total from group_scores when total_score is missing/0 ──
  const entryTotal = (entry) => {
    if (entry.total_score) return entry.total_score;
    const gs = entry.group_scores || (typeof entry.scores === "object" ? entry.scores : null) || {};
    const t = entry.type || "";
    if (t === "housemaster" || !t) return (gs.zabt||0)+(gs.safai||0)+(gs.josh||0)+(gs.qiyadat||0);
    if (t === "teacher")          return (gs.ilm||0)+(gs.haziri||0);
    return (gs.akhlaq||0)+(gs.dini_ilm||0)+(gs.qiyadat||0)+(gs.josh||0);
  };

  // ── Leaderboard data ──
  const now = new Date();
  const thisMonthLogs = hvsLogs.filter(l => {
    const d = l.created_at ? new Date(l.created_at) : null;
    return d && d.getFullYear()===now.getFullYear() && d.getMonth()===now.getMonth();
  });
  const lbSource = lbTab==="month" ? thisMonthLogs
    : hvsLogs.filter(l => lbHouseFilter==="all" || (l.houseId||l.house_id)===lbHouseFilter);
  const lbData = [...lbSource].sort((a,b) => entryTotal(b)-entryTotal(a)).slice(0,10);

  // ── Styles ──
  const G   = "#d4af37";
  const N   = "#0f172a";
  const N2  = "#1e293b";
  const glass = { background:"rgba(255,255,255,0.07)", backdropFilter:"blur(20px)",
    WebkitBackdropFilter:"blur(20px)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:"18px" };
  const lbl = { fontSize:"0.68rem", color:"rgba(212,175,55,0.8)", marginBottom:"6px",
    display:"block", fontWeight:"700" };
  const sel = { padding:"10px 14px", borderRadius:"10px", border:"1px solid rgba(212,175,55,0.25)",
    background:"rgba(255,255,255,0.06)", color:"#f1f5f9", fontSize:"0.78rem",
    fontFamily:"'Public Sans',sans-serif", outline:"none", width:"100%",
    boxSizing:"border-box", colorScheme:"dark" };
  const inp = { ...sel, direction:"ltr" };

  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div style={{ minHeight:"100vh",
      background:"linear-gradient(160deg,#0f172a 0%,#0d1f3c 50%,#0a1628 100%)",
      padding:"24px 16px", fontFamily:"'Public Sans',sans-serif", direction:"ltr" }}>

      {/* range slider thumb styles */}
      <style>{`
        input[type='range'] { -webkit-appearance:none; appearance:none; }
        input[type='range']::-webkit-slider-thumb { -webkit-appearance:none; width:20px; height:20px;
          border-radius:50%; background:#d4af37; border:2px solid #0f172a;
          box-shadow:0 0 8px rgba(212,175,55,0.6); cursor:pointer; margin-top:-7px; }
        input[type='range']::-moz-range-thumb { width:20px; height:20px; border-radius:50%;
          background:#d4af37; border:2px solid #0f172a; cursor:pointer; }
        input[type='range']::-webkit-slider-runnable-track { height:6px; border-radius:3px;
          background:rgba(255,255,255,0.1); }
        input[type='range']:focus { outline:none; }
      `}</style>

      {/* ── Header ── */}
      <div style={{ display:"flex", alignItems:"center", gap:"14px", marginBottom:"24px" }}>
        <div style={{ width:"46px", height:"46px", borderRadius:"14px", flexShrink:0,
          background:"linear-gradient(135deg,#d4af37,#b8960a)",
          display:"flex", alignItems:"center", justifyContent:"center",
          boxShadow:"0 4px 20px rgba(212,175,55,0.4)", fontSize:"1.4rem" }}>🏅</div>
        <div>
          <h2 style={{ margin:0, fontSize:"1.35rem", fontWeight:"800", color:"#f1f5f9" }}>HVS Group Entry</h2>
          <p style={{ margin:0, fontSize:"0.7rem", color:"rgba(212,175,55,0.7)" }}>
            House Values Scoring — Group Rating System • Student Score = Group Score ± Exception
          </p>
        </div>
      </div>

      {/* ── 3-day Weakness Alerts ── */}
      {weakAlerts.length > 0 && (
        <div style={{ position:"sticky", top:"56px", zIndex:99, margin:"0 -16px 20px",
          background:"#450a0a", borderTop:"3px solid #dc2626", borderBottom:"3px solid #dc2626" }}>
          {weakAlerts.map((cat, i) => (
            <div key={cat.id} style={{ display:"flex", alignItems:"flex-start", gap:"12px",
              padding:"12px 16px",
              borderBottom: i<weakAlerts.length-1 ? "1px solid rgba(255,255,255,0.08)" : "none" }}>
              <span style={{ fontSize:"1.3rem", flexShrink:0 }}>🚨</span>
              <div style={{ flex:1 }}>
                <div style={{ color:"#fca5a5", fontWeight:"800", fontSize:"0.78rem" }}>
                  ⚠️ Investigation Required — {HOUSES.find(h=>h.id===selectedHouse)?.nameEn} House
                </div>
                <div style={{ color:"rgba(255,255,255,0.75)", fontSize:"0.7rem", marginTop:"2px" }}>
                  {cat.icon} {cat.labelEn} — below threshold ({THRESHOLDS[cat.id]}) for 3 consecutive entries
                </div>
              </div>
              <button onClick={() => setDismissedAlerts(p => { const s=new Set(p); s.add(cat.id); return s; })}
                style={{ background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.15)",
                  borderRadius:"8px", color:"rgba(255,255,255,0.7)", padding:"5px 12px",
                  fontSize:"0.62rem", cursor:"pointer", fontFamily:"inherit", flexShrink:0 }}>✓ Dismiss</button>
            </div>
          ))}
        </div>
      )}

      {/* ── Success toast ── */}
      {done && (
        <div style={{ ...glass, padding:"12px 20px", marginBottom:"16px", textAlign:"center",
          border:"1px solid rgba(74,222,128,0.3)", background:"rgba(74,222,128,0.1)" }}>
          <span style={{ color:"#4ade80", fontWeight:"700", fontSize:"0.8rem" }}>
            ✓ Saved — Total Score: {savedTotal}/{currentMax}
          </span>
        </div>
      )}

      {/* ══════════════ WATCH LIST RED CARD ══════════════ */}
      {role === "housemaster" && activeWLForHouse.length > 0 && (
        <div style={{ border:"2px solid #dc2626", borderRadius:"16px", marginBottom:"20px",
          background:"rgba(220,38,38,0.08)", overflow:"hidden" }}>
          {/* Header */}
          <div style={{ background:"linear-gradient(90deg,#7f1d1d,#991b1b)",
            padding:"14px 18px", display:"flex", alignItems:"center", gap:"12px" }}>
            <span style={{ fontSize:"1.4rem" }}>⚠️</span>
            <div style={{ flex:1 }}>
              <div style={{ color:"#fca5a5", fontWeight:"800", fontSize:"0.9rem" }}>
                Watch List — These students require special attention
              </div>
              <div style={{ color:"rgba(255,200,200,0.6)", fontSize:"0.62rem", marginTop:"2px" }}>
                Individual entry required for each student • Enter score separately
              </div>
            </div>
            <div style={{ background:"rgba(255,255,255,0.12)", borderRadius:"10px",
              padding:"5px 12px", textAlign:"center" }}>
              <div style={{ color:"#f87171", fontSize:"1.2rem", fontWeight:"900" }}>{activeWLForHouse.length}</div>
              <div style={{ color:"rgba(255,200,200,0.5)", fontSize:"0.55rem" }}>Students</div>
            </div>
          </div>
          {/* Per-student rows */}
          <div style={{ padding:"12px 16px", display:"flex", flexDirection:"column", gap:"12px" }}>
            {activeWLForHouse.map(wl => {
              const st = students.find(s => s.id === (wl.student_id || wl.studentId));
              const catInfo = { zabt:"Discipline", safai:"Cleanliness", josh:"House Spirit", qiyadat:"Leadership",
                ilm:"Academic", haziri:"Attendance", akhlaq:"Morality", dini_ilm:"Islamic Studies" };
              const dayCount = wl.added_date
                ? Math.max(0, Math.floor((new Date() - new Date(wl.added_date)) / 86400000))
                : 0;
              const urgCol = dayCount >= 7 ? "#f87171" : dayCount >= 3 ? "#fb923c" : "#facc15";
              const curScore = wlScores[wl.id] ?? 0;
              return (
                <div key={wl.id} style={{ background:"rgba(255,255,255,0.05)",
                  border:`1px solid ${urgCol}30`, borderRight:`4px solid ${urgCol}`,
                  borderRadius:"12px", padding:"12px 14px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"10px" }}>
                    <div style={{ width:"32px", height:"32px", borderRadius:"50%",
                      background:`${urgCol}25`, display:"flex", alignItems:"center",
                      justifyContent:"center", fontSize:"0.9rem", flexShrink:0 }}>
                      {dayCount >= 7 ? "🔴" : dayCount >= 3 ? "🟠" : "🟡"}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ color:"#f1f5f9", fontWeight:"700", fontSize:"0.8rem" }}>
                        {st?.name || wl.student_id}
                      </div>
                      <div style={{ color:"rgba(255,255,255,0.45)", fontSize:"0.62rem", marginTop:"1px" }}>
                        {catInfo[wl.category] || wl.category} • {dayCount} days on Watch List
                      </div>
                    </div>
                    <div style={{ textAlign:"center", background:`${urgCol}15`,
                      border:`1px solid ${urgCol}40`, borderRadius:"8px", padding:"4px 10px" }}>
                      <div style={{ color:urgCol, fontSize:"1.1rem", fontWeight:"900" }}>{curScore}</div>
                      <div style={{ color:"rgba(255,255,255,0.3)", fontSize:"0.5rem" }}>/50</div>
                    </div>
                  </div>
                  {/* Score slider */}
                  <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                    <span style={{ color:"rgba(255,200,200,0.6)", fontSize:"0.6rem", whiteSpace:"nowrap" }}>0</span>
                    <input type="range" min={0} max={50} step={1} value={curScore}
                      onChange={e => setWlScores(p => ({ ...p, [wl.id]: Number(e.target.value) }))}
                      style={{ flex:1, accentColor: urgCol }} />
                    <span style={{ color:"rgba(255,200,200,0.6)", fontSize:"0.6rem", whiteSpace:"nowrap" }}>50</span>
                  </div>
                  {/* Remove from WL */}
                  <div style={{ display:"flex", justifyContent:"flex-end", marginTop:"8px" }}>
                    <button onClick={async () => {
                      await updateData("watch_list", wl.id, {
                        status:"removed", removed_date: new Date().toISOString().slice(0,10)
                      });
                      getData("watch_list").then(d => { if(d && !d.error) setWatchList(d); });
                    }} style={{ background:"rgba(74,222,128,0.1)", border:"1px solid rgba(74,222,128,0.3)",
                      color:"#4ade80", borderRadius:"8px", padding:"4px 12px",
                      fontSize:"0.6rem", cursor:"pointer", fontFamily:"inherit", fontWeight:"700" }}>
                      ✅ Improved — Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══════════════ PART 1: GROUP ENTRY ══════════════ */}
      <div style={{ ...glass, padding:"22px", marginBottom:"16px" }}>

        {/* Role tabs — hidden when user's role is locked */}
        {lockedRole ? (
          // Locked: show identity badge only, no switching allowed
          <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"20px",
            background:`${currentRole?.color||G}12`, border:`1px solid ${currentRole?.color||G}30`,
            borderRadius:"12px", padding:"12px 16px" }}>
            <span style={{ fontSize:"1.4rem" }}>
              {lockedRole==="housemaster"?"🏠":lockedRole==="madrasa"?"📖":"👨‍🏫"}
            </span>
            <div>
              <div style={{ fontSize:"0.82rem", fontWeight:"800", color:currentRole?.color||G }}>
                {currentRole?.en}
              </div>
              <div style={{ fontSize:"0.62rem", color:"rgba(255,255,255,0.4)", marginTop:"2px" }}>
                Role is fixed for your account
              </div>
            </div>
            <span style={{ marginRight:"auto", background:`${currentRole?.color||G}25`,
              color:currentRole?.color||G, fontSize:"0.6rem", padding:"3px 10px",
              borderRadius:"10px", border:`1px solid ${currentRole?.color||G}40`,
              fontWeight:"800" }}>🔒 LOCKED</span>
          </div>
        ) : (
          // Free-choice tabs for admin/director
          <div style={{ marginBottom:"20px" }}>
            <div style={{ fontSize:"0.68rem", color:"rgba(255,255,255,0.4)", marginBottom:"10px",
              fontWeight:"700", letterSpacing:"0.06em" }}>SELECT YOUR ROLE</div>
            <div style={{ display:"flex", gap:"6px", flexWrap:"wrap" }}>
              {ROLES.map(r => (
                <button key={r.id} onClick={() => setRole(r.id)} style={{
                  padding:"10px 18px", borderRadius:"12px", border:"none", cursor:"pointer",
                  fontFamily:"'Public Sans',sans-serif", fontSize:"0.78rem", fontWeight:"800",
                  background: role===r.id
                    ? `linear-gradient(135deg,${r.color},${r.color}bb)`
                    : "rgba(255,255,255,0.07)",
                  color: role===r.id ? "#fff" : "rgba(255,255,255,0.55)",
                  boxShadow: role===r.id ? `0 4px 16px ${r.color}40` : "none",
                  border: role===r.id ? "none" : "1px solid rgba(255,255,255,0.1)",
                  transition:"all 0.2s",
                }}>{r.en}</button>
              ))}
            </div>
          </div>
        )}

        {/* Selector + Date */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px", marginBottom:"20px" }}>
          {role==="housemaster" ? (
            <div>
              <label style={lbl}>Select House</label>
              <select style={sel} value={selectedHouse} onChange={e => setSelectedHouse(e.target.value)}>
                {HOUSES.map(h => <option key={h.id} value={h.id} style={{background:N2}}>{h.emoji} {h.nameEn}</option>)}
              </select>
            </div>
          ) : (
            <div>
              <label style={lbl}>Select Class / Grade</label>
              <select style={sel} value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
                {grades.map(g => <option key={g} value={g} style={{background:N2}}>{g}</option>)}
                {!grades.length && <option value="" style={{background:N2}}>— No classes found —</option>}
              </select>
            </div>
          )}
          <div>
            <label style={lbl}>Date</label>
            <input style={inp} type="date" value={entryDate}
              onChange={e => setEntryDate(e.target.value)}/>
          </div>
        </div>

        {/* House/class badge */}
        {role==="housemaster" ? (() => {
          const h = HOUSES.find(x => x.id===selectedHouse)||{};
          return (
            <div style={{ background:`${h.color||G}12`, border:`1px solid ${h.color||G}30`,
              borderRadius:"12px", padding:"12px 16px", marginBottom:"20px",
              display:"flex", alignItems:"center", gap:"12px" }}>
              <span style={{ fontSize:"1.8rem" }}>{h.emoji}</span>
              <div>
                <div style={{ fontWeight:"800", color:h.color||G, fontSize:"0.88rem" }}>{h.nameEn}</div>
                <div style={{ fontSize:"0.6rem", color:"rgba(255,255,255,0.35)", marginTop:"2px" }}>
                  {students.filter(s=>s.houseId===selectedHouse).length} students in this house
                </div>
                <div style={{ fontSize:"0.68rem", color:"rgba(74,222,128,0.85)", marginTop:"4px", fontWeight:"700" }}>
                  ✦ This score applies to all house students
                </div>
              </div>
              <div style={{ marginRight:"auto", textAlign:"center", background:"rgba(255,255,255,0.06)",
                borderRadius:"10px", padding:"8px 14px" }}>
                <div style={{ fontSize:"1.6rem", fontWeight:"900", color:G }}>{done ? savedTotal : hmTotal}</div>
                <div style={{ fontSize:"0.6rem", color:"rgba(255,255,255,0.35)" }}>/{HM_MAX}</div>
              </div>
            </div>
          );
        })() : (
          <div style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)",
            borderRadius:"12px", padding:"12px 16px", marginBottom:"20px",
            display:"flex", alignItems:"center", gap:"14px" }}>
            <span style={{ fontSize:"1.8rem" }}>
              {role==="teacher" ? "👨‍🏫" : "📖"}
            </span>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:"800", color:currentRole?.color||G, fontSize:"0.88rem" }}>
                {selectedClass || "کلاس منتخب نہیں"}
              </div>
              <div style={{ fontSize:"0.6rem", color:"rgba(255,255,255,0.4)", marginTop:"2px" }}>
                {students.filter(s=>s.grade===selectedClass).length} students in this class
              </div>
            </div>
            <div style={{ textAlign:"center", background:"rgba(255,255,255,0.06)",
              borderRadius:"10px", padding:"8px 14px" }}>
              <div style={{ fontSize:"1.6rem", fontWeight:"900", color:G }}>
                {done ? savedTotal : (role==="teacher" ? teacherTotal : madrasaTotal)}
              </div>
              <div style={{ fontSize:"0.6rem", color:"rgba(255,255,255,0.35)" }}>
                /{role==="teacher" ? TEACHER_MAX : `${MADRASA_MAX}+auto`}
              </div>
            </div>
          </div>
        )}

        {/* ── Already saved today banner ── */}
        {todayEntry && !editMode && (
          <div style={{
            background:"rgba(251,146,60,0.08)", border:"2px solid rgba(251,146,60,0.4)",
            borderRadius:"14px", padding:"14px 18px", marginBottom:"16px",
            display:"flex", alignItems:"center", gap:"12px", flexWrap:"wrap"
          }}>
            <span style={{ fontSize:"1.4rem", flexShrink:0 }}>⚠️</span>
            <div style={{ flex:1 }}>
              <div style={{ color:"#fb923c", fontWeight:"800", fontSize:"0.82rem" }}>
                Already Saved Today
              </div>
              <div style={{ color:"rgba(255,200,150,0.6)", fontSize:"0.62rem", marginTop:"3px" }}>
                {entryDate} • Total Score: {entryTotal(todayEntry)}
                {editMode ? " • Edit mode active" : ""}
              </div>
            </div>
            <button
              onClick={() => loadExistingEntry(todayEntry)}
              style={{
                padding:"8px 18px", borderRadius:"10px", fontFamily:"inherit",
                border:"1.5px solid rgba(251,146,60,0.5)",
                background:"rgba(251,146,60,0.12)", color:"#fb923c",
                fontSize:"0.72rem", fontWeight:"800", cursor:"pointer", flexShrink:0
              }}>
              ✏️ Edit Entry
            </button>
            <button
              onClick={() => { /* keep existing, do nothing — user may want to add a second record */ }}
              style={{
                padding:"8px 16px", borderRadius:"10px", fontFamily:"inherit",
                border:"1.5px solid rgba(255,255,255,0.12)",
                background:"rgba(255,255,255,0.04)", color:"rgba(255,255,255,0.4)",
                fontSize:"0.68rem", cursor:"pointer", flexShrink:0
              }}>
              Dismiss
            </button>
          </div>
        )}
        {editMode && (
          <div style={{
            background:"rgba(74,222,128,0.06)", border:"1.5px solid rgba(74,222,128,0.3)",
            borderRadius:"10px", padding:"10px 16px", marginBottom:"14px",
            display:"flex", alignItems:"center", gap:"10px"
          }}>
            <span style={{ fontSize:"1rem" }}>✏️</span>
            <div style={{ flex:1, fontSize:"0.72rem", color:"#4ade80", fontWeight:"700" }}>
              Edit Mode — Previous values loaded. Make changes and save again.
            </div>
            <button onClick={() => { setEditMode(false); setHmScores({zabt:0,safai:0,josh:0,qiyadat:0}); setTeacherScores({ilm:0}); setMadrasaScores({akhlaq:0,qiyadat:0,josh:0}); setSubScores({}); }}
              style={{ padding:"5px 12px", borderRadius:"8px", fontFamily:"inherit",
                border:"1px solid rgba(74,222,128,0.25)", background:"rgba(74,222,128,0.08)",
                color:"#4ade80", fontSize:"0.62rem", cursor:"pointer" }}>
              ✕ Cancel
            </button>
          </div>
        )}

        {/* Role-specific border */}
        <div style={{ borderTop:`2px solid ${currentRole?.color||G}40`, paddingTop:"20px" }}>
          <div style={{ fontSize:"0.72rem", color:currentRole?.color||G, fontWeight:"800",
            marginBottom:"18px", letterSpacing:"0.04em" }}>
            {role==="housemaster" && "⚔️ 4 Group Scores — for all house students"}
            {role==="teacher"     && "📚 Class Academic Rating — (attendance auto-calculated)"}
            {role==="madrasa"     && "🕌 Madrasa Rating — (Islamic studies auto from Hifz)"}
          </div>

          {/* House Master Sliders */}
          {role==="housemaster" && HM_CATS.map(cat => {
            const hasSubs = !!SUB_FIELDS[cat.id];
            const catSubs = subScores[cat.id] || {};
            const anySubFilled = hasSubs && Object.values(catSubs).some(v => Number(v) > 0);
            return (
              <div key={cat.id}>
                <Slider cat={cat}
                  value={effectiveHmScores[cat.id]||0}
                  onChange={v => {
                    setHmScores(p => ({...p, [cat.id]:v}));
                    if (hasSubs && anySubFilled) setSubScores(p => ({...p, [cat.id]:{}}));
                  }}
                  roleColor={currentRole?.color}/>
                {hasSubs && (
                  <SubAccordion
                    catId={cat.id}
                    subs={SUB_FIELDS[cat.id]}
                    values={catSubs}
                    onChange={(sfId, val) => setSubScores(p => ({...p, [cat.id]:{...(p[cat.id]||{}), [sfId]:val}}))}
                    catTotal={effectiveHmScores[cat.id]||0}
                    catMax={cat.max}
                    roleColor={currentRole?.color}
                    open={expandedCats.has(cat.id)}
                    onToggle={() => setExpandedCats(p => { const s=new Set(p); s.has(cat.id)?s.delete(cat.id):s.add(cat.id); return s; })}
                  />
                )}
              </div>
            );
          })}

          {/* Teacher Sliders */}
          {role==="teacher" && TEACHER_CATS.map(cat => {
            const hasSubs = !!SUB_FIELDS[cat.id];
            const catSubs = subScores[cat.id] || {};
            const anySubFilled = hasSubs && Object.values(catSubs).some(v => Number(v) > 0);
            return (
              <div key={cat.id}>
                <Slider cat={cat}
                  value={cat.id==="ilm" ? effectiveIlm : (effectiveTeacherScores[cat.id]||0)}
                  onChange={v => {
                    if (cat.id==="ilm" && ilmAuto!==null) return; // blocked: auto from results
                    setTeacherScores(p => ({...p, [cat.id]:v}));
                    if (hasSubs && anySubFilled) setSubScores(p => ({...p, [cat.id]:{}}));
                  }}
                  autoValue={cat.id==="haziri" ? haziriAuto : cat.id==="ilm" ? ilmAuto : undefined}
                  roleColor={currentRole?.color}/>
                {cat.id==="ilm" && ilmAuto!==null && (
                  <div style={{fontSize:"0.62rem",color:"#4ade80",marginTop:"4px",padding:"4px 10px",
                    background:"rgba(74,222,128,0.08)",borderRadius:"6px",border:"1px solid rgba(74,222,128,0.2)"}}>
                    ✅ Auto from Results — class avg: {Math.round((effectiveIlm/25)*100)}% → {effectiveIlm}/25
                  </div>
                )}
                {hasSubs && (
                  <SubAccordion
                    catId={cat.id}
                    subs={SUB_FIELDS[cat.id]}
                    values={catSubs}
                    onChange={(sfId, val) => setSubScores(p => ({...p, [cat.id]:{...(p[cat.id]||{}), [sfId]:val}}))}
                    catTotal={effectiveTeacherScores[cat.id]||0}
                    catMax={cat.max}
                    roleColor={currentRole?.color}
                    open={expandedCats.has(cat.id)}
                    onToggle={() => setExpandedCats(p => { const s=new Set(p); s.has(cat.id)?s.delete(cat.id):s.add(cat.id); return s; })}
                  />
                )}
              </div>
            );
          })}
          {role==="teacher" && haziriAuto===0 && (
            <div style={{ background:"rgba(251,146,60,0.1)", border:"1px solid rgba(251,146,60,0.3)",
              borderRadius:"10px", padding:"10px 14px", fontSize:"0.68rem",
              color:"rgba(251,146,60,0.9)", marginBottom:"16px" }}>
              ⚠️ No attendance record found for today ({entryDate}) — Please open the Attendance page first
            </div>
          )}

          {/* Madrasa Sliders */}
          {role==="madrasa" && MADRASA_CATS.map(cat => {
            const hasSubs = !!SUB_FIELDS[cat.id];
            const catSubs = subScores[cat.id] || {};
            const anySubFilled = hasSubs && Object.values(catSubs).some(v => Number(v) > 0);
            return (
              <div key={cat.id}>
                <Slider cat={cat}
                  value={hasSubs ? (effectiveMadrasaScores[cat.id]||0) : (madrasaScores[cat.id]||0)}
                  onChange={v => {
                    setMadrasaScores(p => ({...p, [cat.id]:v}));
                    if (hasSubs && anySubFilled) setSubScores(p => ({...p, [cat.id]:{}}));
                  }}
                  autoValue={cat.id==="dini_ilm" ? diniIlmAuto : undefined}
                  roleColor={currentRole?.color}/>
                {hasSubs && (
                  <SubAccordion
                    catId={cat.id}
                    subs={SUB_FIELDS[cat.id]}
                    values={catSubs}
                    onChange={(sfId, val) => setSubScores(p => ({...p, [cat.id]:{...(p[cat.id]||{}), [sfId]:val}}))}
                    catTotal={effectiveMadrasaScores[cat.id]||0}
                    catMax={cat.max}
                    roleColor={currentRole?.color}
                    open={expandedCats.has(cat.id)}
                    onToggle={() => setExpandedCats(p => { const s=new Set(p); s.has(cat.id)?s.delete(cat.id):s.add(cat.id); return s; })}
                  />
                )}
              </div>
            );
          })}
          {role==="madrasa" && diniIlmAuto===0 && (
            <div style={{ background:"rgba(251,146,60,0.1)", border:"1px solid rgba(251,146,60,0.3)",
              borderRadius:"10px", padding:"10px 14px", fontSize:"0.68rem",
              color:"rgba(251,146,60,0.9)", marginBottom:"16px" }}>
              ⚠️ آج کے حفظ کے اندراجات نہیں ملے — براہ کرم حفظ صفحہ پر آج کا اندراج یقینی بنائیں
            </div>
          )}
        </div>

        {/* Grand Total bar */}
        <div style={{ background:`${currentRole?.color||G}12`, border:`1px solid ${currentRole?.color||G}30`,
          borderRadius:"12px", padding:"14px 18px", marginTop:"8px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"10px" }}>
            <span style={{ fontSize:"0.78rem", fontWeight:"700", color:"rgba(255,255,255,0.8)" }}>Total Group Score</span>
            <div style={{ textAlign:"center" }}>
              <span style={{ fontSize:"2rem", fontWeight:"900", color:scColor(Math.round((currentTotal/currentMax)*100)) }}>
                {currentTotal}
              </span>
              <span style={{ fontSize:"0.65rem", color:"rgba(255,255,255,0.35)" }}>/{currentMax}</span>
            </div>
            <span style={{ fontSize:"0.88rem", fontWeight:"800",
              color:scColor(Math.round((currentTotal/currentMax)*100)) }}>
              {Math.round((currentTotal/currentMax)*100)}%
            </span>
          </div>
          <div style={{ height:"8px", background:"rgba(255,255,255,0.08)", borderRadius:"4px", overflow:"hidden" }}>
            <div style={{ width:`${Math.round((currentTotal/currentMax)*100)}%`, height:"100%",
              background:`linear-gradient(90deg,${scColor(Math.round((currentTotal/currentMax)*100))},${G})`,
              borderRadius:"4px", transition:"width 0.5s ease" }}/>
          </div>
        </div>
      </div>

      {/* ══════════════ PART 2: EXCEPTIONS ══════════════ */}
      <div style={{ ...glass, padding:"20px", marginBottom:"16px" }}>
        {/* Collapsible header */}
        <button onClick={() => setExcOpen(p => !p)} style={{
          width:"100%", background:"none", border:"none", cursor:"pointer",
          display:"flex", justifyContent:"space-between", alignItems:"center",
          fontFamily:"inherit", padding:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
            <span style={{ fontSize:"1.2rem" }}>⚡</span>
            <div style={{ textAlign:"left" }}>
              <div style={{ fontSize:"0.88rem", fontWeight:"800", color:"#f1f5f9" }}>
                Exceptions
                {exceptions.length > 0 && (
                  <span style={{ marginLeft:"8px", background:C.amber+"30", color:C.amber,
                    fontSize:"0.65rem", padding:"2px 8px", borderRadius:"10px",
                    border:`1px solid ${C.amber}40`, fontWeight:"800" }}>
                    {exceptions.length} added
                  </span>
                )}
              </div>
              <div style={{ fontSize:"0.65rem", color:"rgba(255,255,255,0.4)", marginTop:"2px" }}>
                Optional — +/- adjustment for a specific student
              </div>
            </div>
          </div>
          <span style={{ color:"rgba(255,255,255,0.4)", fontSize:"0.9rem" }}>
            {excOpen ? "▲" : "▼"}
          </span>
        </button>

        {excOpen && (
          <div style={{ marginTop:"18px", borderTop:"1px solid rgba(255,255,255,0.08)", paddingTop:"18px" }}>
            {/* Formula reminder */}
            <div style={{ background:"rgba(212,175,55,0.08)", border:"1px solid rgba(212,175,55,0.2)",
              borderRadius:"10px", padding:"10px 14px", marginBottom:"16px",
              fontSize:"0.72rem", color:"rgba(212,175,55,0.9)", textAlign:"center" }}>
              Student Score = Group Score ± Exception Adjustment
            </div>

            {/* Search student */}
            <div style={{ marginBottom:"12px" }}>
              <label style={lbl}>🔍 Search Student Name</label>
              <input style={{ ...sel, direction:"ltr" }}
                placeholder="Type name..."
                value={excSearch}
                onChange={e => { setExcSearch(e.target.value); setExcStudent(null); }}/>
              {filteredStudents.length > 0 && !excStudent && (
                <div style={{ background:"#1e293b", border:"1px solid rgba(255,255,255,0.12)",
                  borderRadius:"10px", marginTop:"4px", overflow:"hidden" }}>
                  {filteredStudents.map(s => (
                    <button key={s.id} onClick={() => { setExcStudent(s); setExcSearch(s.name); }}
                      style={{ width:"100%", padding:"9px 14px", background:"none",
                        border:"none", borderBottom:"1px solid rgba(255,255,255,0.06)",
                        color:"#f1f5f9", fontSize:"0.75rem", cursor:"pointer",
                        fontFamily:"inherit", textAlign:"left", display:"flex",
                        justifyContent:"space-between", alignItems:"center" }}>
                      <span>{s.name}</span>
                      <span style={{ fontSize:"0.62rem", color:"rgba(255,255,255,0.4)" }}>
                        {s.grade} — {HOUSES.find(h=>h.id===s.houseId)?.nameEn}
                      </span>
                    </button>
                  ))}
                </div>
              )}
              {excStudent && (
                <div style={{ marginTop:"6px", padding:"8px 12px",
                  background:"rgba(74,222,128,0.1)", border:"1px solid rgba(74,222,128,0.25)",
                  borderRadius:"8px", fontSize:"0.72rem", color:"#4ade80", fontWeight:"700" }}>
                  ✓ Selected: {excStudent.name} — {excStudent.grade}
                </div>
              )}
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px", marginBottom:"12px" }}>
              {/* Category */}
              <div>
                <label style={lbl}>Category</label>
                <select style={sel} value={excCat} onChange={e => setExcCat(e.target.value)}>
                  {ALL_EXC_CATS.map(c => (
                    <option key={`${c.id}-${c.roleLabel}`} value={c.id} style={{background:N2}}>
                      {c.icon} {c.labelEn}
                    </option>
                  ))}
                </select>
              </div>

              {/* Adjustment slider */}
              <div>
                <label style={lbl}>Adjustment: {excAdj > 0 ? "+" : ""}{excAdj}</label>
                <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                  <span style={{ fontSize:"0.8rem", color:C.red }}>-5</span>
                  <input type="range" min={-5} max={5} step={1} value={excAdj}
                    onChange={e => setExcAdj(Number(e.target.value))}
                    style={{ flex:1, accentColor: excAdj>0 ? "#4ade80" : excAdj<0 ? "#f87171" : G }}/>
                  <span style={{ fontSize:"0.8rem", color:C.green }}>+5</span>
                </div>
                <div style={{ textAlign:"center", marginTop:"4px" }}>
                  <span style={{ fontSize:"1.3rem", fontWeight:"900",
                    color: excAdj>0 ? "#4ade80" : excAdj<0 ? "#f87171" : "rgba(255,255,255,0.4)" }}>
                    {excAdj > 0 ? "+" : ""}{excAdj}
                  </span>
                </div>
              </div>
            </div>

            {/* Reason */}
            <div style={{ marginBottom:"14px" }}>
              <label style={lbl}>Reason</label>
              <input style={{ ...sel, direction:"ltr" }}
                placeholder="e.g. broke queue 3 times / outstanding performance today..."
                value={excReason}
                onChange={e => setExcReason(e.target.value)}/>
            </div>

            {/* Add button */}
            <button onClick={addException} style={{
              width:"100%", padding:"11px", borderRadius:"12px", border:"none",
              cursor:"pointer", fontFamily:"'Public Sans',sans-serif", fontSize:"0.78rem",
              fontWeight:"800", background: excAdj>0
                ? "linear-gradient(135deg,#16a34a,#15803d)"
                : excAdj<0
                ? "linear-gradient(135deg,#dc2626,#b91c1c)"
                : "rgba(255,255,255,0.1)",
              color:"#fff", marginBottom:"16px" }}>
              {excAdj>0 ? "✦ Add Bonus" : excAdj<0 ? "✦ Add Deduction" : "✦ Add Exception"}
            </button>

            {/* Exceptions list */}
            {exceptions.length > 0 && (
              <div>
                <div style={{ fontSize:"0.72rem", color:"rgba(255,255,255,0.5)",
                  marginBottom:"10px", fontWeight:"700" }}>
                  Added Exceptions — {exceptions.length} entries
                </div>
                {exceptions.map((exc, i) => {
                  const cat = ALL_EXC_CATS.find(c => c.id===exc.category) || {};
                  return (
                    <div key={i} style={{ display:"flex", alignItems:"center", gap:"10px",
                      background:"rgba(255,255,255,0.04)", borderRadius:"10px",
                      padding:"10px 14px", marginBottom:"6px",
                      border:`1px solid ${exc.adjustment>0 ? "rgba(74,222,128,0.2)" : "rgba(248,113,113,0.2)"}` }}>
                      <span style={{ fontSize:"1rem" }}>{cat.icon}</span>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:"0.75rem", fontWeight:"700", color:"#f1f5f9" }}>
                          {exc.student_name}
                          <span style={{ fontSize:"0.65rem", color:"rgba(255,255,255,0.4)", marginRight:"6px" }}>
                            — {cat.labelEn}
                          </span>
                          <span style={{ fontWeight:"900",
                            color: exc.adjustment>0 ? "#4ade80" : "#f87171", fontSize:"0.82rem" }}>
                            {exc.adjustment>0 ? "+" : ""}{exc.adjustment}
                          </span>
                        </div>
                        <div style={{ fontSize:"0.65rem", color:"rgba(255,255,255,0.4)", marginTop:"2px" }}>
                          {exc.reason}
                        </div>
                      </div>
                      <button onClick={() => removeException(i)}
                        style={{ background:"rgba(248,113,113,0.15)", border:"1px solid rgba(248,113,113,0.3)",
                          borderRadius:"6px", color:"#f87171", padding:"4px 10px",
                          fontSize:"0.65rem", cursor:"pointer", fontFamily:"inherit" }}>✕</button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Save Button ── */}
      <button onClick={save} disabled={saving} style={{
        width:"100%", padding:"15px", fontSize:"0.88rem",
        background: saving ? "rgba(255,255,255,0.1)"
          : `linear-gradient(135deg,${currentRole?.color||G},${currentRole?.color||G}bb)`,
        color:"#fff", border:"none", borderRadius:"14px", cursor: saving ? "not-allowed" : "pointer",
        fontWeight:"800", fontFamily:"'Public Sans',sans-serif", marginBottom:"24px",
        boxShadow: saving ? "none" : `0 6px 20px ${currentRole?.color||G}40`,
        transition:"all 0.2s" }}>
        {saving ? "Saving..." : `✦ Save ${currentRole?.en} Entry — ${currentTotal}/${currentMax} pts`}
      </button>

      {/* ══════════════ WEEKLY RESPONSIBILITIES ══════════════ */}
      {role === "housemaster" && (
        <div style={{ ...glass, padding:"22px", marginBottom:"24px" }}>

          {/* Section Header */}
          <div style={{ display:"flex", alignItems:"center", gap:"14px", marginBottom:"20px" }}>
            <div style={{ width:"44px", height:"44px", borderRadius:"14px", flexShrink:0,
              background:"linear-gradient(135deg,#16a34a,#15803d)",
              display:"flex", alignItems:"center", justifyContent:"center",
              boxShadow:"0 4px 20px rgba(22,163,74,0.4)", fontSize:"1.3rem" }}>📋</div>
            <div style={{ flex:1 }}>
              <h3 style={{ margin:0, fontSize:"1.1rem", fontWeight:"800", color:"#f1f5f9" }}>
                Weekly Responsibilities
              </h3>
              <p style={{ margin:0, fontSize:"0.66rem", color:"rgba(74,222,128,0.7)" }}>
                Weekly duty checklist
              </p>
            </div>
            <div style={{ background:"rgba(22,163,74,0.1)", border:"1px solid rgba(22,163,74,0.3)",
              borderRadius:"12px", padding:"8px 16px", textAlign:"center", flexShrink:0 }}>
              <div style={{ fontSize:"0.55rem", color:"rgba(74,222,128,0.6)", fontWeight:"700" }}>Week</div>
              <div style={{ fontSize:"1.4rem", fontWeight:"900", color:"#4ade80", lineHeight:1 }}>{weekNum}</div>
              <div style={{ fontSize:"0.5rem", color:"rgba(255,255,255,0.25)" }}>{dutyYear}</div>
            </div>
          </div>

          {/* Duty House Banner */}
          <div style={{ background:`linear-gradient(135deg,${dutyHouse?.color||"#16a34a"}18,${dutyHouse?.color||"#16a34a"}06)`,
            border:`2px solid ${dutyHouse?.color||"#16a34a"}45`,
            borderRadius:"14px", padding:"16px 20px", marginBottom:"20px",
            display:"flex", alignItems:"center", gap:"16px" }}>
            <span style={{ fontSize:"2.8rem", flexShrink:0 }}>{dutyHouse?.emoji}</span>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:"0.6rem", color:"rgba(255,255,255,0.38)", fontWeight:"700",
                letterSpacing:"0.08em", marginBottom:"4px" }}>THIS WEEK'S DUTY HOUSE</div>
              <div style={{ fontSize:"1.35rem", fontWeight:"900", color:dutyHouse?.color||"#4ade80" }}>
                {dutyHouse?.nameEn}
              </div>
              <div style={{ fontSize:"0.62rem", color:"rgba(255,255,255,0.3)", marginTop:"3px" }}>
                {dutyHouse?.nameEn} • Week {weekNum} of {dutyYear}
              </div>
            </div>
            <div style={{ textAlign:"center", flexShrink:0 }}>
              <div style={{ fontSize:"0.6rem", color:"rgba(255,255,255,0.3)", marginBottom:"2px" }}>Total</div>
              <div style={{ fontSize:"2rem", fontWeight:"900",
                color: dutyTotal >= 42 ? "#4ade80" : dutyTotal >= 30 ? "#fb923c" : dutyTotal > 0 ? "#f87171" : "rgba(255,255,255,0.2)" }}>
                {dutyTotal}
              </div>
              <div style={{ fontSize:"0.58rem", color:"rgba(255,255,255,0.25)" }}>/60</div>
            </div>
          </div>

          {/* 6 Duty Items */}
          <div style={{ display:"flex", flexDirection:"column", gap:"8px", marginBottom:"20px" }}>
            {DUTY_ITEMS.map((item, idx) => {
              const rating = dutyRatings[item.id] || 0;
              const score  = rating * 2.5;
              const rOpt   = RATING_OPTS.find(r => r.value === rating);
              const scoreCol = score >= 7.5 ? "#4ade80" : score >= 5 ? "#fb923c" : score > 0 ? "#f87171" : "rgba(255,255,255,0.2)";
              return (
                <div key={item.id} style={{
                  background:"rgba(255,255,255,0.04)",
                  border:`1px solid ${rOpt ? rOpt.color+"28" : "rgba(255,255,255,0.07)"}`,
                  borderRight:`4px solid ${rOpt ? rOpt.color : "rgba(255,255,255,0.1)"}`,
                  borderRadius:"12px", padding:"11px 14px",
                  display:"flex", alignItems:"center", gap:"10px" }}>
                  {/* Index badge */}
                  <div style={{ width:"24px", height:"24px", borderRadius:"50%", flexShrink:0,
                    background:"rgba(255,255,255,0.06)", display:"flex", alignItems:"center",
                    justifyContent:"center", fontSize:"0.68rem", fontWeight:"800",
                    color:"rgba(255,255,255,0.3)" }}>{idx+1}</div>
                  {/* Icon */}
                  <span style={{ fontSize:"1rem", flexShrink:0 }}>{item.icon}</span>
                  {/* Label */}
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:"0.78rem", fontWeight:"800", color:"#f1f5f9" }}>{item.labelEn}</div>
                    <div style={{ fontSize:"0.57rem", color:"rgba(255,255,255,0.27)", marginTop:"1px",
                      whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                      {item.desc}
                    </div>
                  </div>
                  {/* Score chip */}
                  <div style={{ textAlign:"center", minWidth:"34px", flexShrink:0 }}>
                    <div style={{ fontSize:"1rem", fontWeight:"900", color:scoreCol, lineHeight:1 }}>
                      {score > 0 ? score : "—"}
                    </div>
                    <div style={{ fontSize:"0.48rem", color:"rgba(255,255,255,0.2)" }}>/10</div>
                  </div>
                  {/* Rating dropdown */}
                  <select value={rating || ""}
                    onChange={e => setDutyRatings(p => ({...p, [item.id]: Number(e.target.value)}))}
                    style={{ padding:"7px 10px", borderRadius:"10px", flexShrink:0,
                      border:`1px solid ${rOpt ? rOpt.color+"45" : "rgba(212,175,55,0.25)"}`,
                      background:"rgba(255,255,255,0.06)",
                      color: rOpt ? rOpt.color : "rgba(255,255,255,0.38)",
                      fontSize:"0.7rem", fontFamily:"'Public Sans',sans-serif",
                      outline:"none", cursor:"pointer", colorScheme:"dark", fontWeight:"700" }}>
                    <option value="" style={{background:"#1e293b",color:"#94a3b8"}}>— Select —</option>
                    {RATING_OPTS.map(r => (
                      <option key={r.value} value={r.value} style={{background:"#1e293b",color:r.color}}>
                        {r.value} — {r.labelEn}
                      </option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>

          {/* Running total progress bar */}
          <div style={{ background:"rgba(22,163,74,0.07)", border:"1px solid rgba(22,163,74,0.2)",
            borderRadius:"12px", padding:"14px 18px", marginBottom:"20px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"8px" }}>
              <span style={{ fontSize:"0.75rem", fontWeight:"700", color:"rgba(255,255,255,0.7)" }}>
                Weekly Total Score
              </span>
              <div>
                <span style={{ fontSize:"1.8rem", fontWeight:"900",
                  color: dutyTotal>=42?"#4ade80":dutyTotal>=30?"#fb923c":dutyTotal>0?"#f87171":"rgba(255,255,255,0.2)" }}>
                  {dutyTotal}
                </span>
                <span style={{ fontSize:"0.62rem", color:"rgba(255,255,255,0.3)" }}>/60</span>
              </div>
              <span style={{ fontSize:"0.85rem", fontWeight:"800",
                color: dutyTotal>=42?"#4ade80":dutyTotal>=30?"#fb923c":dutyTotal>0?"#f87171":"rgba(255,255,255,0.2)" }}>
                {Math.round((dutyTotal/60)*100)}%
              </span>
            </div>
            <div style={{ height:"8px", background:"rgba(255,255,255,0.08)", borderRadius:"4px", overflow:"hidden" }}>
              <div style={{ width:`${Math.min(100,Math.round((dutyTotal/60)*100))}%`, height:"100%",
                background: dutyTotal>=42 ? "linear-gradient(90deg,#16a34a,#4ade80)"
                          : dutyTotal>=30 ? "linear-gradient(90deg,#d97706,#fb923c)"
                          : "linear-gradient(90deg,#b91c1c,#f87171)",
                borderRadius:"4px", transition:"width 0.4s ease" }}/>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", marginTop:"5px" }}>
              {[0,15,30,45,60].map(t => (
                <span key={t} style={{ fontSize:"0.5rem", color:"rgba(255,255,255,0.2)" }}>{t}</span>
              ))}
            </div>
            {/* Rating guide */}
            <div style={{ display:"flex", gap:"10px", marginTop:"12px", justifyContent:"center", flexWrap:"wrap" }}>
              {RATING_OPTS.map(r => (
                <span key={r.value} style={{ fontSize:"0.6rem", color:r.color, fontWeight:"700",
                  background:`${r.color}12`, padding:"3px 10px", borderRadius:"8px",
                  border:`1px solid ${r.color}25` }}>
                  {r.value} = {r.labelEn} ({r.value*2.5} pts)
                </span>
              ))}
            </div>
          </div>

          {/* Textareas */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px", marginBottom:"18px" }}>
            <div>
              <label style={{ fontSize:"0.68rem", color:"rgba(74,222,128,0.8)", marginBottom:"6px",
                display:"block", fontWeight:"700" }}>✨ Strengths</label>
              <textarea value={dutyStrengths} onChange={e => setDutyStrengths(e.target.value)}
                rows={4} placeholder="What went well this week..."
                style={{ width:"100%", padding:"10px 14px", borderRadius:"10px",
                  border:"1px solid rgba(74,222,128,0.2)", background:"rgba(255,255,255,0.04)",
                  color:"#f1f5f9", fontSize:"0.75rem", fontFamily:"'Public Sans',sans-serif",
                  outline:"none", resize:"vertical", colorScheme:"dark",
                  boxSizing:"border-box", direction:"ltr", lineHeight:1.6 }}/>
            </div>
            <div>
              <label style={{ fontSize:"0.68rem", color:"rgba(251,146,60,0.8)", marginBottom:"6px",
                display:"block", fontWeight:"700" }}>📈 Areas to Improve</label>
              <textarea value={dutyImprovements} onChange={e => setDutyImprovements(e.target.value)}
                rows={4} placeholder="What can be improved..."
                style={{ width:"100%", padding:"10px 14px", borderRadius:"10px",
                  border:"1px solid rgba(251,146,60,0.2)", background:"rgba(255,255,255,0.04)",
                  color:"#f1f5f9", fontSize:"0.75rem", fontFamily:"'Public Sans',sans-serif",
                  outline:"none", resize:"vertical", colorScheme:"dark",
                  boxSizing:"border-box", direction:"ltr", lineHeight:1.6 }}/>
            </div>
          </div>

          {/* Success toast */}
          {dutyDone && (
            <div style={{ background:"rgba(74,222,128,0.08)", border:"1px solid rgba(74,222,128,0.3)",
              borderRadius:"10px", padding:"10px 16px", marginBottom:"14px", textAlign:"center" }}>
              <span style={{ color:"#4ade80", fontWeight:"700", fontSize:"0.78rem" }}>
                ✓ Weekly responsibility report saved!
              </span>
            </div>
          )}

          {/* Save button */}
          <button onClick={saveDuty} disabled={dutySaving} style={{
            width:"100%", padding:"13px", fontSize:"0.82rem", fontWeight:"800",
            background: dutySaving ? "rgba(255,255,255,0.08)" : "linear-gradient(135deg,#16a34a,#15803d)",
            color:"#fff", border:"none", borderRadius:"12px",
            cursor: dutySaving ? "not-allowed" : "pointer",
            fontFamily:"'Public Sans',sans-serif",
            boxShadow: dutySaving ? "none" : "0 6px 20px rgba(22,163,74,0.35)",
            transition:"all 0.2s" }}>
            {dutySaving ? "Saving..." : `📋 Save Weekly Report — ${dutyTotal}/60 pts (Week ${weekNum})`}
          </button>
        </div>
      )}

      {/* ══════════════ LEADERBOARD ══════════════ */}
      <div style={{ ...glass, padding:"20px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
          marginBottom:"16px", flexWrap:"wrap", gap:"10px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
            <span style={{ color:G, fontWeight:"800", fontSize:"0.95rem" }}>🏆 HVS Leaderboard</span>
            <span style={{ background:"rgba(212,175,55,0.12)", border:"1px solid rgba(212,175,55,0.25)",
              borderRadius:"20px", padding:"2px 9px", fontSize:"0.58rem", color:G, fontWeight:"700" }}>Top 10</span>
          </div>
          <div style={{ display:"flex", gap:"4px", background:"rgba(255,255,255,0.05)",
            borderRadius:"10px", padding:"3px" }}>
            {[["month","This Month"],["alltime","All Time"]].map(([v,l]) => (
              <button key={v} onClick={() => setLbTab(v)} style={{
                padding:"6px 14px", borderRadius:"8px", border:"none", cursor:"pointer",
                background: lbTab===v ? "rgba(212,175,55,0.25)" : "transparent",
                color: lbTab===v ? G : "rgba(255,255,255,0.45)",
                fontWeight: lbTab===v ? "700" : "500", fontSize:"0.72rem",
                fontFamily:"'Public Sans',sans-serif" }}>{l}</button>
            ))}
          </div>
        </div>

        {lbTab==="alltime" && (
          <div style={{ display:"flex", gap:"6px", marginBottom:"12px", flexWrap:"wrap" }}>
            {[["all","🏠 All"],...HOUSES.map(h=>[h.id,`${h.emoji} ${h.nameEn}`])].map(([v,l]) => (
              <button key={v} onClick={() => setLbHouseFilter(v)} style={{
                padding:"5px 12px", borderRadius:"8px", cursor:"pointer",
                border:`1px solid ${lbHouseFilter===v?G:"rgba(255,255,255,0.1)"}`,
                background: lbHouseFilter===v ? "rgba(212,175,55,0.12)" : "transparent",
                color: lbHouseFilter===v ? G : "rgba(255,255,255,0.4)",
                fontSize:"0.68rem", fontFamily:"'Public Sans',sans-serif",
                fontWeight: lbHouseFilter===v ? "700" : "400" }}>{l}</button>
            ))}
          </div>
        )}

        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ background:"rgba(255,255,255,0.04)" }}>
                {["#","House / Class","Date","Type","Score","%"].map(h => (
                  <th key={h} style={{ padding:"10px 12px", textAlign:"left", fontSize:"0.65rem",
                    fontWeight:"700", color:"rgba(212,175,55,0.8)",
                    borderBottom:"1px solid rgba(255,255,255,0.08)", whiteSpace:"nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lbData.map((entry, i) => {
                const hInfo = HOUSES.find(h => h.id===(entry.houseId||entry.house_id)) || {};
                const score = entryTotal(entry);
                const denom = entry.type==="housemaster" ? HM_MAX
                            : entry.type==="teacher" ? TEACHER_MAX
                            : entry.type==="madrasa" ? (MADRASA_MAX+10)
                            : HVS_TOTAL;
                const pct   = Math.round((score/denom)*100);
                const col   = scColor(pct);
                const mk    = medal(i);
                const typeLabel = entry.type==="housemaster" ? "🏠 HM"
                               : entry.type==="teacher" ? "👨‍🏫 Teacher"
                               : entry.type==="madrasa" ? "📖 Madrasa"
                               : "—";
                return (
                  <tr key={i} style={{ borderBottom:"1px solid rgba(255,255,255,0.05)",
                    background: i===0?"rgba(212,175,55,0.07)":i===1?"rgba(192,192,192,0.04)":i===2?"rgba(205,127,50,0.04)":"transparent" }}>
                    <td style={{ padding:"10px 12px", textAlign:"center" }}>
                      {mk ? <span style={{fontSize:"1.2rem"}}>{mk}</span>
                           : <span style={{color:"rgba(255,255,255,0.3)",fontSize:"0.75rem",fontWeight:"700"}}>#{i+1}</span>}
                    </td>
                    <td style={{ padding:"10px 12px" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                        <span style={{ fontSize:"1rem" }}>{hInfo.emoji||"🏫"}</span>
                        <div>
                          <div style={{ fontSize:"0.75rem", fontWeight:"700", color:hInfo.color||G }}>
                            {hInfo.nameEn || entry.class_id || "—"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding:"10px 12px", direction:"ltr", fontFamily:"monospace",
                      color:"rgba(255,255,255,0.4)", fontSize:"0.65rem" }}>
                      {(entry.date||entry.week||"—").slice(0,10)}
                    </td>
                    <td style={{ padding:"10px 12px" }}>
                      <span style={{ fontSize:"0.62rem", fontWeight:"700",
                        color:"rgba(255,255,255,0.6)" }}>{typeLabel}</span>
                    </td>
                    <td style={{ padding:"10px 12px", fontWeight:"900",
                      color: i<3 ? G : "#f1f5f9", fontSize:"1rem",
                      fontFamily:"'Public Sans',sans-serif" }}>{score}</td>
                    <td style={{ padding:"10px 12px" }}>
                      <span style={{ padding:"3px 9px", borderRadius:"20px", fontSize:"0.65rem",
                        fontWeight:"700", background:`${col}18`, color:col, border:`1px solid ${col}35` }}>
                        {pct}%
                      </span>
                    </td>
                  </tr>
                );
              })}
              {lbData.length===0 && (
                <tr><td colSpan={6} style={{ padding:"30px", textAlign:"center",
                  color:"rgba(255,255,255,0.2)", fontSize:"0.75rem" }}>
                  <div style={{ fontSize:"2rem", marginBottom:"8px", opacity:0.3 }}>🏆</div>
                  {lbTab==="month" ? "اس ماہ کوئی سکور نہیں" : "ابھی کوئی سکور نہیں"}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
