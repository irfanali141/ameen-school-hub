/* eslint-disable */
import { useState, useEffect } from "react";
import { supabase } from "../../supabase";
import { HOUSES, sLabel } from "../../constants";

const G = "#d4af37"; const N = "#0f172a"; const N2 = "#1e293b";
const glass = { background:"rgba(255,255,255,0.07)", backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:"16px" };
const inp = { padding:"9px 12px", borderRadius:"9px", border:"1px solid rgba(212,175,55,0.25)", background:"rgba(255,255,255,0.06)", color:"#f1f5f9", fontSize:"0.75rem", fontFamily:"'Public Sans',sans-serif", outline:"none", boxSizing:"border-box", colorScheme:"dark", width:"100%" };

const today = () => new Date().toISOString().slice(0, 10);

// Streak badge helper
function streakBadge(streak) {
  if (streak >= 90) return { icon:"🥇", label:"Gold",   color:"#fbbf24", bg:"rgba(251,191,36,0.12)" };
  if (streak >= 30) return { icon:"🥈", label:"Silver",   color:"#94a3b8", bg:"rgba(148,163,184,0.12)" };
  if (streak >= 7)  return { icon:"🥉", label:"Bronze",  color:"#cd7f32", bg:"rgba(205,127,50,0.12)" };
  return null;
}

export default function SabaqTracker({ students = [], role }) {
  const [date, setDate]           = useState(today());
  const [streaks, setStreaks]      = useState([]);    // sabaq_streaks rows
  const [marks, setMarks]         = useState({});    // { studentId: "present"|"absent" }
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);
  const [view, setView]           = useState("entry"); // "entry" | "leaderboard"
  const [gradeFilter, setGradeFilter] = useState("all");

  const grades = ["all", ...new Set(students.map(s => s.grade).filter(Boolean).sort())];
  const filtered = gradeFilter === "all" ? students : students.filter(s => s.grade === gradeFilter);

  // ── Load streaks ──────────────────────────────────────────────────────────
  useEffect(() => { loadStreaks(); }, [students]);

  const loadStreaks = async () => {
    if (!students.length) return;
    try {
      const { data } = await supabase.from("sabaq_streaks").select("*");
      setStreaks(data || []);
      // Pre-fill marks from today's records (check last_date)
      const todayStr = today();
      const todayMap = {};
      (data || []).forEach(r => {
        if (r.last_date === todayStr) todayMap[r.student_id] = "present";
      });
      setMarks(prev => ({ ...prev, ...todayMap }));
    } catch (e) { console.error("streaks load:", e.message); }
  };

  const getStreak = (sId) => streaks.find(r => r.student_id === sId);

  // ── Mark all present / absent ─────────────────────────────────────────────
  const markAll = (status) => {
    const m = {};
    filtered.forEach(s => { m[s.id] = status; });
    setMarks(prev => ({ ...prev, ...m }));
  };

  // ── Save & update streaks ──────────────────────────────────────────────────
  const save = async () => {
    if (!Object.keys(marks).length) return;
    setSaving(true);
    try {
      for (const s of filtered) {
        const status = marks[s.id];
        if (!status) continue;  // unset → skip
        const existing = getStreak(s.id);
        const isPresent = status === "present";
        const todayStr = date;
        // Don't double-count if already marked for this date
        if (existing?.last_date === todayStr) continue;
        const curStreak   = isPresent ? (existing?.current_streak || 0) + 1 : 0;
        const longestStreak = Math.max(curStreak, existing?.longest_streak || 0);
        const milestone7  = (existing?.milestone_7  || false) || curStreak >= 7;
        const milestone30 = (existing?.milestone_30 || false) || curStreak >= 30;
        const milestone90 = (existing?.milestone_90 || false) || curStreak >= 90;

        // Upsert streak record
        const upsertRow = {
          student_id:      s.id,
          student_name:    s.name,
          current_streak:  curStreak,
          longest_streak:  longestStreak,
          last_date:       todayStr,
          milestone_7:     milestone7,
          milestone_30:    milestone30,
          milestone_90:    milestone90,
          updated_at:      new Date().toISOString(),
        };
        await supabase.from("sabaq_streaks").upsert([upsertRow], { onConflict: "student_id" });

        // ── Auto-nominations at milestones ─────────────────────────────────
        // Only on first hit (existing milestone was false, now true)
        const milestones = [
          { flag:"milestone_7",  curHit: curStreak === 7,  prevHit: existing?.milestone_7,  key:"sabaq_streak_7",  title:"Lesson Streak — 7 days", period:"weekly"  },
          { flag:"milestone_30", curHit: curStreak === 30, prevHit: existing?.milestone_30, key:"sabaq_streak_30", title:"Lesson Streak — 30 days", period:"monthly" },
          { flag:"milestone_90", curHit: curStreak === 90, prevHit: existing?.milestone_90, key:"sabaq_streak_90", title:"Lesson Streak — 90 days", period:"dini"    },
        ];
        for (const ml of milestones) {
          if (ml.curHit && !ml.prevHit) {
            const hInfo = HOUSES.find(h => h.id === s.houseId);
            await supabase.from("award_nominations").insert([{
              award_key:    ml.key,
              award_title:  ml.title,
              student_id:   s.id,
              student_name: s.name,
              house_id:     s.houseId || null,
              house_name:   hInfo?.nameEn || null,
              reason:       `${curStreak} days consecutive lesson — Auto Nomination`,
              period:       ml.period,
              status:       "pending",
              nominated_by: "auto_sabaq_tracker",
              created_at:   new Date().toISOString(),
            }]);
          }
        }
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      loadStreaks();
    } catch (e) { console.error("محفوظ نہیں ہو سکا:", e.message); }
    setSaving(false);
  };

  // ── Leaderboard: top 10 by current streak ────────────────────────────────
  const leaderboard = [...students]
    .map(s => {
      const sr = getStreak(s.id);
      return { ...s, current: sr?.current_streak || 0, longest: sr?.longest_streak || 0,
               m7: sr?.milestone_7, m30: sr?.milestone_30, m90: sr?.milestone_90 };
    })
    .sort((a,b) => b.current - a.current)
    .slice(0, 10);

  const rankMedal = (i) => ["🥇","🥈","🥉"][i] || `#${i+1}`;

  return (
    <div style={{ direction:"ltr", fontFamily:"'Public Sans',sans-serif" }}>

      {/* Tab toggle */}
      <div style={{ display:"flex", gap:"6px", marginBottom:"18px" }}>
        {[["entry","✏️ Lesson Attendance"],["leaderboard","🏆 Leaderboard"]].map(([v,l]) => (
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
          {/* Filters */}
          <div style={{ display:"flex", gap:"10px", flexWrap:"wrap", marginBottom:"16px", alignItems:"flex-end" }}>
            <div>
              <div style={{ fontSize:"0.62rem", color:"rgba(212,175,55,0.7)", fontWeight:"700", marginBottom:"4px" }}>Date</div>
              <input type="date" value={date} onChange={e=>setDate(e.target.value)}
                style={{ ...inp, width:"auto", direction:"ltr" }} />
            </div>
            <div>
              <div style={{ fontSize:"0.62rem", color:"rgba(212,175,55,0.7)", fontWeight:"700", marginBottom:"4px" }}>Grade</div>
              <select value={gradeFilter} onChange={e=>setGradeFilter(e.target.value)}
                style={{ ...inp, width:"auto" }}>
                {grades.map(g => <option key={g} value={g} style={{ background:N2 }}>{g==="all"?"All":g}</option>)}
              </select>
            </div>
            <div style={{ display:"flex", gap:"6px", marginBottom:"1px" }}>
              <button onClick={() => markAll("present")}
                style={{ padding:"9px 16px", borderRadius:"9px", border:"none", cursor:"pointer",
                  fontFamily:"inherit", fontSize:"0.7rem", fontWeight:"700",
                  background:"rgba(74,222,128,0.15)", color:"#4ade80" }}>
                ✅ All Present
              </button>
              <button onClick={() => markAll("absent")}
                style={{ padding:"9px 16px", borderRadius:"9px", border:"none", cursor:"pointer",
                  fontFamily:"inherit", fontSize:"0.7rem", fontWeight:"700",
                  background:"rgba(239,68,68,0.1)", color:"#f87171" }}>
                ❌ All Absent
              </button>
            </div>
          </div>

          {/* Student list */}
          <div style={{ ...glass, overflow:"hidden", marginBottom:"16px" }}>
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead>
                  <tr style={{ background:"rgba(212,175,55,0.08)" }}>
                    {["طالب علم","زنجیر (موجودہ)","زنجیر (طویل)","بیج","آج"].map(h => (
                      <th key={h} style={{ padding:"11px 14px", textAlign:"left", fontSize:"0.65rem",
                        color:"rgba(212,175,55,0.8)", borderBottom:"1px solid rgba(255,255,255,0.08)", fontWeight:"700" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s, i) => {
                    const sr = getStreak(s.id);
                    const badge = streakBadge(sr?.current_streak || 0);
                    const mark = marks[s.id];
                    return (
                      <tr key={s.id} style={{ background:i%2===0?"rgba(255,255,255,0.02)":"transparent",
                        borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                        <td style={{ padding:"10px 14px" }}>
                          <div style={{ fontSize:"0.78rem", fontWeight:"600", color:"#f1f5f9" }}>{s.name}</div>
                          <div style={{ fontSize:"0.56rem", color:"rgba(255,255,255,0.3)" }}>{s.grade}</div>
                        </td>
                        <td style={{ padding:"10px 14px" }}>
                          <span style={{ fontSize:"1rem", fontWeight:"900", color:G }}>{sr?.current_streak || 0}</span>
                          <span style={{ fontSize:"0.55rem", color:"rgba(255,255,255,0.3)" }}> days</span>
                        </td>
                        <td style={{ padding:"10px 14px" }}>
                          <span style={{ fontSize:"0.8rem", color:"rgba(255,255,255,0.5)" }}>{sr?.longest_streak || 0}</span>
                        </td>
                        <td style={{ padding:"10px 14px" }}>
                          {badge ? (
                            <span style={{ padding:"3px 9px", borderRadius:"20px", fontSize:"0.6rem", fontWeight:"700",
                              background:badge.bg, color:badge.color }}>
                              {badge.icon} {badge.label}
                            </span>
                          ) : <span style={{ fontSize:"0.6rem", color:"rgba(255,255,255,0.2)" }}>—</span>}
                        </td>
                        <td style={{ padding:"10px 14px" }}>
                          <div style={{ display:"flex", gap:"6px" }}>
                            <button onClick={() => setMarks(p => ({ ...p, [s.id]: mark === "present" ? undefined : "present" }))}
                              style={{ padding:"6px 12px", borderRadius:"8px", border:"none", cursor:"pointer",
                                fontFamily:"inherit", fontSize:"0.65rem", fontWeight:"700",
                                background: mark === "present" ? "rgba(74,222,128,0.25)" : "rgba(255,255,255,0.06)",
                                color: mark === "present" ? "#4ade80" : "rgba(255,255,255,0.4)",
                                outline: mark === "present" ? "1px solid rgba(74,222,128,0.4)" : "none" }}>
                              ✅ Present
                            </button>
                            <button onClick={() => setMarks(p => ({ ...p, [s.id]: mark === "absent" ? undefined : "absent" }))}
                              style={{ padding:"6px 12px", borderRadius:"8px", border:"none", cursor:"pointer",
                                fontFamily:"inherit", fontSize:"0.65rem", fontWeight:"700",
                                background: mark === "absent" ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.06)",
                                color: mark === "absent" ? "#f87171" : "rgba(255,255,255,0.4)",
                                outline: mark === "absent" ? "1px solid rgba(239,68,68,0.35)" : "none" }}>
                              ❌ Absent
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr><td colSpan={5} style={{ padding:"30px", textAlign:"center", color:"rgba(255,255,255,0.3)", fontSize:"0.75rem" }}>Any Student No</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Milestone info */}
          <div style={{ display:"flex", gap:"10px", flexWrap:"wrap", marginBottom:"16px" }}>
            {[
              { icon:"🥉", label:"Bronze — 7 days", color:"#cd7f32" },
              { icon:"🥈", label:"Silver — 30 days",  color:"#94a3b8" },
              { icon:"🥇", label:"Gold — 90 days",  color:"#fbbf24" },
            ].map(b => (
              <div key={b.label} style={{ padding:"6px 14px", borderRadius:"20px", fontSize:"0.6rem",
                background:`${b.color}12`, color:b.color, border:`1px solid ${b.color}30`, fontWeight:"700" }}>
                {b.icon} {b.label} — Auto Nomination
              </div>
            ))}
          </div>

          <button onClick={save} disabled={saving}
            style={{ padding:"12px 32px", borderRadius:"12px", border:"none", cursor:saving?"not-allowed":"pointer",
              fontFamily:"inherit", fontSize:"0.85rem", fontWeight:"800",
              background:saved?"rgba(74,222,128,0.2)":`linear-gradient(135deg,${G},#b8960a)`,
              color:saved?"#4ade80":N, opacity:saving?0.7:1 }}>
            {saving ? "Saving..." : saved ? "✅ Lesson streaks updated" : "💾 Lesson Attendance Save"}
          </button>
        </>
      )}

      {/* ── LEADERBOARD VIEW ─────────────────────────────────────────────────── */}
      {view === "leaderboard" && (
        <div>
          <div style={{ marginBottom:"16px", fontSize:"0.7rem", color:"rgba(255,255,255,0.35)" }}>
            Longest Consecutive Lesson Streaks — Top 10
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
            {leaderboard.map((s, i) => {
              const badge = streakBadge(s.current);
              const hInfo = HOUSES.find(h => h.id === s.houseId);
              return (
                <div key={s.id} style={{ ...glass, padding:"14px 18px", display:"flex",
                  alignItems:"center", gap:"14px", borderRight: i===0?`3px solid ${G}`: i===1?"3px solid #94a3b8": i===2?"3px solid #cd7f32":"3px solid rgba(255,255,255,0.08)" }}>
                  {/* Rank */}
                  <div style={{ fontSize:"1.4rem", flexShrink:0, width:"36px", textAlign:"center" }}>{rankMedal(i)}</div>
                  {/* Name */}
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:"0.85rem", fontWeight:"700", color:"#f1f5f9" }}>{s.name}</div>
                    <div style={{ fontSize:"0.58rem", color:"rgba(255,255,255,0.35)" }}>{s.grade}
                      {hInfo && <span style={{ marginRight:"6px", color:hInfo.color }}> • {hInfo.nameEn}</span>}
                    </div>
                  </div>
                  {/* Current streak */}
                  <div style={{ textAlign:"center" }}>
                    <div style={{ fontSize:"1.6rem", fontWeight:"900", color:G, lineHeight:1 }}>{s.current}</div>
                    <div style={{ fontSize:"0.52rem", color:"rgba(255,255,255,0.3)" }}>Current</div>
                  </div>
                  {/* Longest */}
                  <div style={{ textAlign:"center" }}>
                    <div style={{ fontSize:"0.85rem", fontWeight:"700", color:"rgba(255,255,255,0.45)" }}>{s.longest}</div>
                    <div style={{ fontSize:"0.52rem", color:"rgba(255,255,255,0.3)" }}>Long</div>
                  </div>
                  {/* Badge */}
                  {badge && (
                    <span style={{ padding:"4px 12px", borderRadius:"20px", fontSize:"0.62rem", fontWeight:"800",
                      background:badge.bg, color:badge.color, flexShrink:0 }}>
                      {badge.icon} {badge.label}
                    </span>
                  )}
                  {/* Milestones */}
                  <div style={{ display:"flex", gap:"4px", flexShrink:0 }}>
                    {s.m7  && <span style={{ fontSize:"0.7rem" }} title="7-day milestone">🥉</span>}
                    {s.m30 && <span style={{ fontSize:"0.7rem" }} title="30-day milestone">🥈</span>}
                    {s.m90 && <span style={{ fontSize:"0.7rem" }} title="90-day milestone">🥇</span>}
                  </div>
                </div>
              );
            })}
            {leaderboard.every(s => s.current === 0) && (
              <div style={{ textAlign:"center", padding:"40px", color:"rgba(255,255,255,0.3)", fontSize:"0.75rem" }}>
                No lesson chains yet
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
