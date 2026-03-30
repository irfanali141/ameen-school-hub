/* eslint-disable */
import { useState, useEffect } from "react";
import { supabase } from "../../supabase";

const G = "#d4af37"; const N = "#0f172a"; const N2 = "#1e293b";
const glass = { background:"rgba(255,255,255,0.07)", backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:"16px" };
const inp = { padding:"9px 12px", borderRadius:"9px", border:"1px solid rgba(212,175,55,0.25)", background:"rgba(255,255,255,0.06)", color:"#f1f5f9", fontSize:"0.75rem", fontFamily:"'Public Sans',sans-serif", outline:"none", boxSizing:"border-box", colorScheme:"dark", width:"100%" };

const PRAYERS = [
  { id:"fajr",    urdu:"فجر",   en:"Fajr"    },
  { id:"zuhr",    urdu:"ظہر",   en:"Zuhr"    },
  { id:"asr",     urdu:"عصر",   en:"Asr"     },
  { id:"maghrib", urdu:"مغرب",  en:"Maghrib" },
  { id:"isha",    urdu:"عشاء",   en:"Isha"    },
];

const today = () => new Date().toISOString().slice(0, 10);
const thisMonth = () => new Date().toISOString().slice(0, 7);

export default function NamazAttendance({ students = [], role }) {
  const [date, setDate]           = useState(today());
  const [month, setMonth]         = useState(thisMonth());
  const [gradeFilter, setGradeFilter] = useState("all");
  const [rows, setRows]           = useState({});      // { studentId: { fajr, zuhr, asr, maghrib, isha } }
  const [existing, setExisting]   = useState([]);      // records already in DB for this date
  const [monthlySummary, setMonthlySummary] = useState([]);
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);
  const [view, setView]           = useState("entry"); // "entry" | "summary"

  const grades = ["all", ...new Set(students.map(s => s.grade).filter(Boolean).sort())];

  const filtered = gradeFilter === "all"
    ? students
    : students.filter(s => s.grade === gradeFilter);

  // ── Load existing records for selected date ──────────────────────────────
  useEffect(() => { loadForDate(); }, [date, students]);
  useEffect(() => { if (view === "summary") loadMonthlySummary(); }, [month, view, students]);

  const loadForDate = async () => {
    if (!students.length) return;
    try {
      const { data } = await supabase
        .from("namaz_attendance")
        .select("*")
        .eq("date", date);
      setExisting(data || []);
      // Pre-populate rows from existing
      const map = {};
      (data || []).forEach(r => {
        map[r.student_id] = { fajr: !!r.fajr, zuhr: !!r.zuhr, asr: !!r.asr, maghrib: !!r.maghrib, isha: !!r.isha };
      });
      // Initialize all filtered students (unchecked if no record)
      students.forEach(s => {
        if (!map[s.id]) map[s.id] = { fajr:false, zuhr:false, asr:false, maghrib:false, isha:false };
      });
      setRows(map);
    } catch (e) { console.error("namaz load:", e.message); }
  };

  const loadMonthlySummary = async () => {
    const [y, m] = month.split("-");
    const from = `${month}-01`;
    const to   = `${month}-31`;
    try {
      const { data } = await supabase
        .from("namaz_attendance")
        .select("*")
        .gte("date", from)
        .lte("date", to);
      // Aggregate per student
      const agg = {};
      (data || []).forEach(r => {
        if (!agg[r.student_id]) agg[r.student_id] = { total_days:0, fajr:0, zuhr:0, asr:0, maghrib:0, isha:0 };
        agg[r.student_id].total_days++;
        PRAYERS.forEach(p => { if (r[p.id]) agg[r.student_id][p.id]++; });
      });
      const summary = students.map(s => ({
        ...s,
        stats: agg[s.id] || { total_days:0, fajr:0, zuhr:0, asr:0, maghrib:0, isha:0 },
      })).sort((a,b) => (b.stats.total_days - a.stats.total_days));
      setMonthlySummary(summary);
    } catch (e) { console.error("monthly summary:", e.message); }
  };

  // ── Toggle checkbox ───────────────────────────────────────────────────────
  const toggle = (sId, prayer) => {
    setRows(prev => ({
      ...prev,
      [sId]: { ...prev[sId], [prayer]: !prev[sId]?.[prayer] },
    }));
  };

  // ── Mark all for prayer ───────────────────────────────────────────────────
  const markAll = (prayer, val) => {
    setRows(prev => {
      const next = { ...prev };
      filtered.forEach(s => { next[s.id] = { ...next[s.id], [prayer]: val }; });
      return next;
    });
  };

  // ── Save to DB ────────────────────────────────────────────────────────────
  const save = async () => {
    setSaving(true);
    try {
      const upserts = filtered.map(s => ({
        student_id: s.id,
        student_name: s.name,
        date,
        fajr:    rows[s.id]?.fajr    || false,
        zuhr:    rows[s.id]?.zuhr    || false,
        asr:     rows[s.id]?.asr     || false,
        maghrib: rows[s.id]?.maghrib || false,
        isha:    rows[s.id]?.isha    || false,
        marked_by: "madrasa_ustad",
        created_at: new Date().toISOString(),
      }));
      // Use upsert on (student_id, date) — requires unique constraint in DB
      const { error } = await supabase
        .from("namaz_attendance")
        .upsert(upserts, { onConflict: "student_id,date" });
      if (error) throw error;
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      loadForDate();
    } catch (e) { console.error("محفوظ نہیں ہو سکا:", e.message); }
    setSaving(false);
  };

  // ── Namaz score for a student (out of 5 for the day) ─────────────────────
  const dailyScore = (sId) => PRAYERS.filter(p => rows[sId]?.[p.id]).length;

  // ── Is Namaz Paband candidate (25+ days in month) ─────────────────────────
  const isPaband = (stats) => stats.total_days >= 25;

  return (
    <div style={{ direction:"ltr", fontFamily:"'Public Sans',sans-serif" }}>

      {/* Tab toggle */}
      <div style={{ display:"flex", gap:"6px", marginBottom:"18px" }}>
        {[["entry","✏️ Mark Attendance"],["summary","📊 Monthly Summary"]].map(([v,l]) => (
          <button key={v} onClick={() => setView(v)}
            style={{ padding:"8px 18px", borderRadius:"10px", border:"none", cursor:"pointer",
              fontFamily:"inherit", fontSize:"0.72rem", fontWeight:view===v?"700":"400",
              background:view===v?`linear-gradient(135deg,${G},#b8960a)`:"rgba(255,255,255,0.06)",
              color:view===v?N:"rgba(255,255,255,0.5)" }}>
            {l}
          </button>
        ))}
      </div>

      {/* ── ENTRY VIEW ─────────────────────────────────────────────────────── */}
      {view === "entry" && (
        <>
          {/* Filters row */}
          <div style={{ display:"flex", gap:"10px", flexWrap:"wrap", marginBottom:"18px", alignItems:"center" }}>
            <div style={{ flex:1, minWidth:"130px" }}>
              <div style={{ fontSize:"0.62rem", color:"rgba(212,175,55,0.7)", fontWeight:"700", marginBottom:"4px" }}>Date</div>
              <input type="date" value={date} onChange={e=>setDate(e.target.value)}
                style={{ ...inp, width:"auto", direction:"ltr" }} />
            </div>
            <div style={{ flex:1, minWidth:"130px" }}>
              <div style={{ fontSize:"0.62rem", color:"rgba(212,175,55,0.7)", fontWeight:"700", marginBottom:"4px" }}>Grade</div>
              <select value={gradeFilter} onChange={e=>setGradeFilter(e.target.value)}
                style={{ ...inp, width:"auto" }}>
                {grades.map(g => <option key={g} value={g} style={{ background:N2 }}>{g==="all"?"All":g}</option>)}
              </select>
            </div>
          </div>

          {/* Table */}
          <div style={{ ...glass, overflow:"hidden", marginBottom:"16px" }}>
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", minWidth:"600px" }}>
                <thead>
                  <tr style={{ background:"rgba(212,175,55,0.08)" }}>
                    <th style={{ padding:"12px 14px", textAlign:"left", fontSize:"0.68rem", color:"rgba(212,175,55,0.8)", borderBottom:"1px solid rgba(255,255,255,0.08)", fontWeight:"700", whiteSpace:"nowrap" }}>
                      طالب علم
                    </th>
                    {PRAYERS.map(p => (
                      <th key={p.id} style={{ padding:"10px 12px", textAlign:"center", fontSize:"0.65rem", color:"rgba(212,175,55,0.8)", borderBottom:"1px solid rgba(255,255,255,0.08)", fontWeight:"700", minWidth:"72px" }}>
                        <div>{p.urdu}</div>
                        <div style={{ fontSize:"0.52rem", color:"rgba(255,255,255,0.3)" }}>{p.en}</div>
                        <div style={{ marginTop:"4px", display:"flex", gap:"3px", justifyContent:"center" }}>
                          <button onClick={() => markAll(p.id, true)}
                            style={{ padding:"1px 5px", borderRadius:"4px", border:"none", cursor:"pointer", fontSize:"0.48rem", background:"rgba(74,222,128,0.15)", color:"#4ade80", fontFamily:"inherit" }}>✓ All</button>
                          <button onClick={() => markAll(p.id, false)}
                            style={{ padding:"1px 5px", borderRadius:"4px", border:"none", cursor:"pointer", fontSize:"0.48rem", background:"rgba(239,68,68,0.1)", color:"#f87171", fontFamily:"inherit" }}>✗ All</button>
                        </div>
                      </th>
                    ))}
                    <th style={{ padding:"10px 12px", textAlign:"center", fontSize:"0.65rem", color:"rgba(212,175,55,0.8)", borderBottom:"1px solid rgba(255,255,255,0.08)", fontWeight:"700", whiteSpace:"nowrap" }}>
                      Score<div style={{ fontSize:"0.52rem", color:"rgba(255,255,255,0.3)" }}>/5</div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s, i) => {
                    const score = dailyScore(s.id);
                    const scoreColor = score === 5 ? "#4ade80" : score >= 3 ? G : score >= 1 ? "#fb923c" : "#f87171";
                    return (
                      <tr key={s.id}
                        style={{ background: i%2===0 ? "rgba(255,255,255,0.02)" : "transparent",
                          borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                        <td style={{ padding:"10px 14px" }}>
                          <div style={{ fontSize:"0.78rem", fontWeight:"600", color:"#f1f5f9" }}>{s.name}</div>
                          <div style={{ fontSize:"0.58rem", color:"rgba(255,255,255,0.3)" }}>{s.grade}</div>
                        </td>
                        {PRAYERS.map(p => (
                          <td key={p.id} style={{ padding:"10px 12px", textAlign:"center" }}>
                            <label style={{ cursor:"pointer", display:"flex", justifyContent:"center", alignItems:"center" }}>
                              <input
                                type="checkbox"
                                checked={!!rows[s.id]?.[p.id]}
                                onChange={() => toggle(s.id, p.id)}
                                style={{ width:"18px", height:"18px", cursor:"pointer", accentColor:G }}
                              />
                            </label>
                          </td>
                        ))}
                        <td style={{ padding:"10px 12px", textAlign:"center" }}>
                          <span style={{ fontSize:"0.85rem", fontWeight:"900", color:scoreColor }}>{score}</span>
                          <span style={{ fontSize:"0.55rem", color:"rgba(255,255,255,0.3)" }}>/5</span>
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr><td colSpan={7} style={{ padding:"30px", textAlign:"center", color:"rgba(255,255,255,0.3)", fontSize:"0.75rem" }}>Any Student No</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Save button */}
          <button onClick={save} disabled={saving}
            style={{ padding:"12px 32px", borderRadius:"12px", border:"none", cursor:saving?"not-allowed":"pointer",
              fontFamily:"inherit", fontSize:"0.85rem", fontWeight:"800",
              background:saved?"rgba(74,222,128,0.2)":`linear-gradient(135deg,${G},#b8960a)`,
              color:saved?"#4ade80":N, opacity:saving?0.7:1 }}>
            {saving ? "Saving..." : saved ? "✅ Saved" : "💾 Attendance Save"}
          </button>
        </>
      )}

      {/* ── MONTHLY SUMMARY VIEW ─────────────────────────────────────────────── */}
      {view === "summary" && (
        <>
          <div style={{ display:"flex", gap:"10px", marginBottom:"18px", alignItems:"center" }}>
            <div>
              <div style={{ fontSize:"0.62rem", color:"rgba(212,175,55,0.7)", fontWeight:"700", marginBottom:"4px" }}>Month</div>
              <input type="month" value={month} onChange={e=>setMonth(e.target.value)}
                style={{ ...inp, width:"auto", direction:"ltr" }} />
            </div>
          </div>

          <div style={{ ...glass, overflow:"hidden" }}>
            <div style={{ padding:"12px 16px", borderBottom:"1px solid rgba(255,255,255,0.08)", display:"flex", gap:"8px", alignItems:"center" }}>
              <span style={{ fontSize:"1.1rem" }}>📊</span>
              <span style={{ color:"#f1f5f9", fontWeight:"700", fontSize:"0.9rem" }}>Monthly Namaz Summary</span>
              <span style={{ fontSize:"0.62rem", color:"rgba(255,255,255,0.35)", marginRight:"auto" }}>Namaz regular: 25+ days</span>
            </div>
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", minWidth:"520px" }}>
                <thead>
                  <tr style={{ background:"rgba(212,175,55,0.06)" }}>
                    {["طالب علم","دن",  ...PRAYERS.map(p=>p.urdu), "باقاعدہ"].map(h => (
                      <th key={h} style={{ padding:"10px 12px", textAlign:"left", fontSize:"0.65rem", color:"rgba(212,175,55,0.7)", borderBottom:"1px solid rgba(255,255,255,0.07)", fontWeight:"700" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {monthlySummary.map((s, i) => {
                    const paband = isPaband(s.stats);
                    return (
                      <tr key={s.id}
                        style={{ background:paband?"rgba(74,222,128,0.04)": i%2===0?"rgba(255,255,255,0.02)":"transparent",
                          borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                        <td style={{ padding:"10px 12px" }}>
                          <div style={{ fontSize:"0.78rem", fontWeight:"600", color:"#f1f5f9" }}>{s.name}</div>
                          <div style={{ fontSize:"0.56rem", color:"rgba(255,255,255,0.3)" }}>{s.grade}</div>
                        </td>
                        <td style={{ padding:"10px 12px", fontSize:"0.78rem", fontWeight:"700", color:G }}>{s.stats.total_days}</td>
                        {PRAYERS.map(p => (
                          <td key={p.id} style={{ padding:"10px 12px", fontSize:"0.72rem", color:"rgba(255,255,255,0.6)" }}>
                            {s.stats[p.id] || 0}
                          </td>
                        ))}
                        <td style={{ padding:"10px 12px" }}>
                          {paband ? (
                            <span style={{ padding:"3px 10px", borderRadius:"20px", fontSize:"0.6rem", fontWeight:"800",
                              background:"rgba(74,222,128,0.15)", color:"#4ade80", border:"1px solid rgba(74,222,128,0.3)" }}>
                              ✅ Regular
                            </span>
                          ) : (
                            <span style={{ fontSize:"0.6rem", color:"rgba(255,255,255,0.25)" }}>{s.stats.total_days}/25</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {monthlySummary.length === 0 && (
                    <tr><td colSpan={8} style={{ padding:"30px", textAlign:"center", color:"rgba(255,255,255,0.3)", fontSize:"0.75rem" }}><span className="ur">کوئی اندراج نہیں</span></td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
