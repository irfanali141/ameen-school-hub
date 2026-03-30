/* eslint-disable */
import { useState, useEffect } from "react";
import { supabase } from "../../supabase";
import { HOUSES, sLabel } from "../../constants";
import NominationForm from "../houses/NominationForm";

const G = "#d4af37"; const N = "#0f172a"; const N2 = "#1e293b";
const glass = { background:"rgba(255,255,255,0.07)", backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:"16px" };
const inp = { padding:"9px 12px", borderRadius:"9px", border:"1px solid rgba(212,175,55,0.25)", background:"rgba(255,255,255,0.06)", color:"#f1f5f9", fontSize:"0.75rem", fontFamily:"'Public Sans',sans-serif", outline:"none", boxSizing:"border-box", colorScheme:"dark", width:"100%" };

const SCORE_LABELS = {
  1: { urdu:"Weak",    en:"Weak",      color:"#f87171", bg:"rgba(248,113,113,0.12)" },
  2: { urdu:"Adequate",   en:"Fair",      color:"#fb923c", bg:"rgba(251,146,60,0.12)"  },
  3: { urdu:"Good",    en:"Good",      color:G,          bg:"rgba(212,175,55,0.12)"  },
  4: { urdu:"Very Good", en:"Very Good", color:"#60a5fa", bg:"rgba(96,165,250,0.12)"  },
  5: { urdu:"Excellent",  en:"Excellent", color:"#4ade80", bg:"rgba(74,222,128,0.12)"  },
};

const thisMonthYear = () => {
  const d = new Date();
  return { month: d.getMonth() + 1, year: d.getFullYear(), label: `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}` };
};

const DINI_AWARD = { key:"tajweed_award", titleUr:"Tajweed Award", titleEn:"Tajweed Award" };

export default function TajweedAssessment({ students = [], role }) {
  const [view, setView]                     = useState("entry");
  const [monthLabel, setMonthLabel]         = useState(thisMonthYear().label);
  const [gradeFilter, setGradeFilter]       = useState("all");
  const [scores, setScores]                 = useState({});   // { studentId: { score, notes } }
  const [existing, setExisting]             = useState([]);
  const [saving, setSaving]                 = useState(false);
  const [saved, setSaved]                   = useState(false);
  const [nomStudent, setNomStudent]         = useState(null);  // student for nomination modal
  const [monthlyRecords, setMonthlyRecords] = useState([]);

  const grades = ["all", ...new Set(students.map(s => s.grade).filter(Boolean).sort())];
  const filtered = gradeFilter === "all" ? students : students.filter(s => s.grade === gradeFilter);

  const parsedMonth = { month: Number(monthLabel.split("-")[1]), year: Number(monthLabel.split("-")[0]) };

  // ── Load assessments for selected month ────────────────────────────────────
  useEffect(() => { loadForMonth(); }, [monthLabel, students]);

  const loadForMonth = async () => {
    if (!students.length) return;
    try {
      const { data } = await supabase
        .from("tajweed_assessments")
        .select("*")
        .eq("month", parsedMonth.month)
        .eq("year",  parsedMonth.year);
      setExisting(data || []);
      const map = {};
      (data || []).forEach(r => { map[r.student_id] = { score: r.score, notes: r.notes || "" }; });
      students.forEach(s => { if (!map[s.id]) map[s.id] = { score: 0, notes:"" }; });
      setScores(map);
      setMonthlyRecords(data || []);
    } catch (e) { console.error("tajweed load:", e.message); }
  };

  // ── Save assessments ────────────────────────────────────────────────────────
  const save = async () => {
    const toSave = filtered.filter(s => scores[s.id]?.score > 0);
    if (!toSave.length) return;
    setSaving(true);
    try {
      const upserts = toSave.map(s => ({
        student_id:   s.id,
        student_name: s.name,
        score:        scores[s.id].score,
        notes:        scores[s.id].notes || "",
        month:        parsedMonth.month,
        year:         parsedMonth.year,
        assessed_by:  "madrasa_ustad",
        created_at:   new Date().toISOString(),
      }));
      const { error } = await supabase
        .from("tajweed_assessments")
        .upsert(upserts, { onConflict: "student_id,month,year" });
      if (error) throw error;
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      loadForMonth();
    } catch (e) { console.error("محفوظ نہیں ہو سکا:", e.message); }
    setSaving(false);
  };

  // ── Star rating renderer ────────────────────────────────────────────────────
  const ScoreStars = ({ sId }) => {
    const cur = scores[sId]?.score || 0;
    return (
      <div style={{ display:"flex", gap:"3px" }}>
        {[1,2,3,4,5].map(n => (
          <button key={n} onClick={() => setScores(p => ({ ...p, [sId]: { ...p[sId], score: n === cur ? 0 : n } }))}
            style={{ width:"28px", height:"28px", borderRadius:"6px", border:"none", cursor:"pointer",
              background: n <= cur ? (SCORE_LABELS[cur]?.bg || "rgba(212,175,55,0.12)") : "rgba(255,255,255,0.04)",
              color: n <= cur ? (SCORE_LABELS[cur]?.color || G) : "rgba(255,255,255,0.2)",
              fontSize:"0.9rem", fontFamily:"inherit" }}>
            {n <= cur ? "★" : "☆"}
          </button>
        ))}
        {cur > 0 && (
          <span style={{ fontSize:"0.6rem", color:SCORE_LABELS[cur]?.color || G, fontWeight:"700",
            alignSelf:"center", marginRight:"6px" }}>
            {SCORE_LABELS[cur]?.urdu}
          </span>
        )}
      </div>
    );
  };

  return (
    <div style={{ direction:"ltr", fontFamily:"'Public Sans',sans-serif" }}>

      {/* Tab toggle */}
      <div style={{ display:"flex", gap:"6px", marginBottom:"18px" }}>
        {[["entry","✏️ Tajweed Ranking"],["monthly","📊 Monthly Results"]].map(([v,l]) => (
          <button key={v} onClick={() => setView(v)}
            style={{ padding:"8px 18px", borderRadius:"10px", border:"none", cursor:"pointer",
              fontFamily:"inherit", fontSize:"0.72rem", fontWeight:view===v?"700":"400",
              background:view===v?`linear-gradient(135deg,${G},#b8960a)`:"rgba(255,255,255,0.06)",
              color:view===v?N:"rgba(255,255,255,0.5)" }}>
            {l}
          </button>
        ))}
      </div>

      {/* Month + filter controls */}
      <div style={{ display:"flex", gap:"10px", flexWrap:"wrap", marginBottom:"18px", alignItems:"flex-end" }}>
        <div>
          <div style={{ fontSize:"0.62rem", color:"rgba(212,175,55,0.7)", fontWeight:"700", marginBottom:"4px" }}>Month</div>
          <input type="month" value={monthLabel} onChange={e=>setMonthLabel(e.target.value)}
            style={{ ...inp, width:"auto", direction:"ltr" }} />
        </div>
        {view === "entry" && (
          <div>
            <div style={{ fontSize:"0.62rem", color:"rgba(212,175,55,0.7)", fontWeight:"700", marginBottom:"4px" }}>Grade</div>
            <select value={gradeFilter} onChange={e=>setGradeFilter(e.target.value)}
              style={{ ...inp, width:"auto" }}>
              {grades.map(g => <option key={g} value={g} style={{ background:N2 }}>{g==="all"?"All":g}</option>)}
            </select>
          </div>
        )}
      </div>

      {/* ── ENTRY VIEW ──────────────────────────────────────────────────────── */}
      {view === "entry" && (
        <>
          <div style={{ display:"flex", flexDirection:"column", gap:"10px", marginBottom:"18px" }}>
            {filtered.map((s, i) => {
              const cur = scores[s.id]?.score || 0;
              const noteVal = scores[s.id]?.notes || "";
              const hInfo = HOUSES.find(h => h.id === s.houseId);
              return (
                <div key={s.id} style={{ ...glass, padding:"16px 18px",
                  borderRight:`3px solid ${cur > 0 ? (SCORE_LABELS[cur]?.color || G) : "rgba(255,255,255,0.08)"}` }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:"10px" }}>
                    {/* Student info */}
                    <div style={{ flex:1, minWidth:"120px" }}>
                      <div style={{ fontSize:"0.82rem", fontWeight:"700", color:"#f1f5f9" }}>{s.name}</div>
                      <div style={{ fontSize:"0.56rem", color:"rgba(255,255,255,0.35)", marginTop:"2px" }}>
                        {s.grade}
                        {hInfo && <span style={{ color:hInfo.color, marginRight:"6px" }}> • {hInfo.nameEn}</span>}
                      </div>
                    </div>
                    {/* Stars */}
                    <div>
                      <ScoreStars sId={s.id} />
                    </div>
                    {/* Nominate button — visible when score >= 4 */}
                    {cur >= 4 && (
                      <button onClick={() => setNomStudent(s)}
                        style={{ padding:"7px 14px", borderRadius:"9px", border:"none", cursor:"pointer",
                          fontFamily:"inherit", fontSize:"0.65rem", fontWeight:"700",
                          background:"rgba(74,222,128,0.12)", color:"#4ade80",
                          border:"1px solid rgba(74,222,128,0.25)" }}>
                        ✍️ Nominate
                      </button>
                    )}
                  </div>
                  {/* Notes */}
                  <input
                    value={noteVal}
                    onChange={e => setScores(p => ({ ...p, [s.id]: { ...p[s.id], notes: e.target.value } }))}
                    placeholder="Notes / Observations (optional)…"
                    style={{ ...inp, marginTop:"10px", fontSize:"0.72rem" }}
                  />
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div style={{ padding:"30px", textAlign:"center", color:"rgba(255,255,255,0.3)", fontSize:"0.75rem" }}>
                Any Student No
              </div>
            )}
          </div>

          {/* Score legend */}
          <div style={{ display:"flex", gap:"6px", flexWrap:"wrap", marginBottom:"16px" }}>
            {Object.entries(SCORE_LABELS).map(([n,l]) => (
              <span key={n} style={{ padding:"3px 10px", borderRadius:"20px", fontSize:"0.58rem", fontWeight:"700",
                background:l.bg, color:l.color }}>{n} — {l.urdu}</span>
            ))}
          </div>

          <button onClick={save} disabled={saving}
            style={{ padding:"12px 32px", borderRadius:"12px", border:"none", cursor:saving?"not-allowed":"pointer",
              fontFamily:"inherit", fontSize:"0.85rem", fontWeight:"800",
              background:saved?"rgba(74,222,128,0.2)":`linear-gradient(135deg,${G},#b8960a)`,
              color:saved?"#4ade80":N, opacity:saving?0.7:1 }}>
            {saving ? "Saving..." : saved ? "✅ Tajweed Assessment Saved" : "💾 Tajweed Assessment Save"}
          </button>
        </>
      )}

      {/* ── MONTHLY RESULTS VIEW ─────────────────────────────────────────────── */}
      {view === "monthly" && (
        <div style={{ ...glass, overflow:"hidden" }}>
          <div style={{ padding:"12px 16px", borderBottom:"1px solid rgba(255,255,255,0.08)", display:"flex", gap:"8px", alignItems:"center" }}>
            <span style={{ fontSize:"1.1rem" }}>📊</span>
            <span style={{ color:"#f1f5f9", fontWeight:"700", fontSize:"0.9rem" }}>Monthly Tajweed Results</span>
          </div>
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead>
                <tr style={{ background:"rgba(212,175,55,0.06)" }}>
                  {["طالب علم","درجہ","رینک","جائزہ","نوٹس","نامزدگی"].map(h => (
                    <th key={h} style={{ padding:"10px 14px", textAlign:"left", fontSize:"0.65rem",
                      color:"rgba(212,175,55,0.7)", borderBottom:"1px solid rgba(255,255,255,0.07)", fontWeight:"700" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {monthlyRecords.sort((a,b) => b.score - a.score).map((r, i) => {
                  const sl = SCORE_LABELS[r.score] || SCORE_LABELS[1];
                  const s  = students.find(x => x.id === r.student_id);
                  return (
                    <tr key={r.id || i} style={{ background:i%2===0?"rgba(255,255,255,0.02)":"transparent",
                      borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                      <td style={{ padding:"10px 14px", fontSize:"0.78rem", fontWeight:"600", color:"#f1f5f9" }}>
                        {r.student_name}
                      </td>
                      <td style={{ padding:"10px 14px", fontSize:"0.7rem", color:"rgba(255,255,255,0.5)" }}>
                        {s?.grade || "—"}
                      </td>
                      <td style={{ padding:"10px 14px" }}>
                        <span style={{ fontSize:"1rem" }}>{"★".repeat(r.score)}{"☆".repeat(5-r.score)}</span>
                      </td>
                      <td style={{ padding:"10px 14px" }}>
                        <span style={{ padding:"3px 10px", borderRadius:"20px", fontSize:"0.6rem", fontWeight:"700",
                          background:sl.bg, color:sl.color }}>
                          {r.score} — {sl.urdu}
                        </span>
                      </td>
                      <td style={{ padding:"10px 14px", fontSize:"0.68rem", color:"rgba(255,255,255,0.4)", maxWidth:"160px" }}>
                        {r.notes || "—"}
                      </td>
                      <td style={{ padding:"10px 14px" }}>
                        {r.score >= 4 && s && (
                          <button onClick={() => setNomStudent(s)}
                            style={{ padding:"5px 12px", borderRadius:"8px", border:"none", cursor:"pointer",
                              fontFamily:"inherit", fontSize:"0.62rem", fontWeight:"700",
                              background:"rgba(74,222,128,0.1)", color:"#4ade80",
                              border:"1px solid rgba(74,222,128,0.2)" }}>
                            ✍️ Nominate
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {monthlyRecords.length === 0 && (
                  <tr><td colSpan={6} style={{ padding:"30px", textAlign:"center", color:"rgba(255,255,255,0.3)", fontSize:"0.75rem" }}><span className="ur">اس ماہ کوئی اندراج نہیں</span></td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Nomination modal ──────────────────────────────────────────────────── */}
      {nomStudent && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", zIndex:1000,
          display:"flex", alignItems:"center", justifyContent:"center", padding:"20px" }}>
          <NominationForm
            students={[nomStudent]}
            preselectedAward={DINI_AWARD}
            period="dini"
            onClose={() => setNomStudent(null)}
            onSubmit={() => setNomStudent(null)}
          />
        </div>
      )}
    </div>
  );
}
