import React, { useState, useEffect } from "react";
import { supabase } from "../../supabase";

const N = "#0f172a", G = "#d4af37";

export default function QuizResults({ quiz, students, onClose }) {
  const [attempts, setAttempts] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("overview"); // overview | perQuestion | students
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      const [{ data: atts }, { data: qs }] = await Promise.all([
        supabase
          .from("quiz_attempts")
          .select("*")
          .eq("quiz_id", quiz.id)
          .eq("status", "submitted"),
        supabase
          .from("quiz_questions")
          .select("*")
          .eq("quiz_id", quiz.id)
          .order("order_num"),
      ]);
      setAttempts(atts || []);
      setQuestions(qs || []);
      setLoading(false);
    })();
  }, [quiz.id]);

  if (loading) return (
    <div style={overlay}>
      <div style={card}>
        <p style={{ color: "#94a3b8", textAlign: "center" }}>نتائج لوڈ ہو رہے ہیں...</p>
      </div>
    </div>
  );

  const total = questions.reduce((s, q) => s + (q.marks || 1), 0);
  const attempted = attempts.length;
  const passed = attempts.filter(a => a.passed).length;
  const failed = attempted - passed;
  const avgScore = attempted ? Math.round(attempts.reduce((s, a) => s + (a.score || 0), 0) / attempted) : 0;
  const avgPct = total ? Math.round((avgScore / total) * 100) : 0;
  const highScore = attempted ? Math.max(...attempts.map(a => a.score || 0)) : 0;

  // Per-question analysis
  const qStats = questions.map((q, idx) => {
    const optCounts = { A: 0, B: 0, C: 0, D: 0, none: 0 };
    attempts.forEach(a => {
      const ans = a.answers?.[idx];
      if (ans && optCounts[ans] !== undefined) optCounts[ans]++;
      else optCounts.none++;
    });
    const correctCount = optCounts[q.correct_option] || 0;
    const difficulty = attempted ? Math.round((1 - correctCount / attempted) * 100) : 0;
    return { ...q, optCounts, correctCount, difficulty };
  });

  // Student list with details
  const studentMap = {};
  students.forEach(s => { studentMap[s.id] = s; });

  const filteredAttempts = attempts.filter(a => {
    const st = studentMap[a.student_id];
    return !search || (st?.name || "").toLowerCase().includes(search.toLowerCase());
  });

  const diffColor = (d) => d >= 70 ? "#f87171" : d >= 40 ? "#f59e0b" : "#4ade80";
  const pctColor = (p) => p >= 70 ? "#4ade80" : p >= 50 ? "#f59e0b" : "#f87171";

  return (
    <div style={overlay}>
      <div style={{ ...card, maxWidth: 800 }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <h2 style={{ color: G, margin: "0 0 4px", fontSize: 20 }}>📊 نتائج: {quiz.title}</h2>
            <p style={{ color: "#94a3b8", margin: 0, fontSize: 13 }}>{quiz.subject} | {quiz.grade}</p>
          </div>
          <button onClick={onClose} style={closeBtn}>✕</button>
        </div>

        {/* Summary stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 20 }}>
          {[
            ["شریک", attempted, "#60a5fa"],
            ["کامیاب", passed, "#4ade80"],
            ["ناکام", failed, "#f87171"],
            ["اوسط نمبر", `${avgScore}/${total}`, G],
            ["اوسط %", `${avgPct}%`, pctColor(avgPct)],
            ["سب سے زیادہ", highScore, "#a78bfa"],
          ].map(([label, val, color]) => (
            <div key={label} style={{ background: "#1e293b", borderRadius: 10, padding: "12px 16px", textAlign: "center" }}>
              <div style={{ color, fontSize: 22, fontWeight: 700 }}>{val}</div>
              <div style={{ color: "#64748b", fontSize: 12, marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Pass/Fail bar */}
        {attempted > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#94a3b8", marginBottom: 6 }}>
              <span>کامیاب: {Math.round((passed / attempted) * 100)}%</span>
              <span>ناکام: {Math.round((failed / attempted) * 100)}%</span>
            </div>
            <div style={{ height: 10, background: "#f87171", borderRadius: 5, overflow: "hidden" }}>
              <div style={{
                height: "100%", background: "#4ade80",
                width: `${Math.round((passed / attempted) * 100)}%`,
                transition: "width .5s",
              }} />
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {[["overview", "📋 جائزہ"], ["perQuestion", "❓ سوال وار"], ["students", "👥 طلبہ"]].map(([v, label]) => (
            <button
              key={v}
              onClick={() => setView(v)}
              style={{
                ...tabBtn,
                background: view === v ? G : "#1e293b",
                color: view === v ? N : "#94a3b8",
              }}
            >{label}</button>
          ))}
        </div>

        {/* Content */}
        <div style={{ maxHeight: 380, overflowY: "auto" }}>

          {/* Overview: Score distribution */}
          {view === "overview" && (
            <div>
              {attempted === 0 ? (
                <p style={{ color: "#64748b", textAlign: "center", padding: 40 }}>ابھی کوئی طالب علم نے ٹیسٹ نہیں دیا</p>
              ) : (
                <>
                  {/* Score distribution buckets */}
                  <h4 style={{ color: "#94a3b8", fontSize: 13, margin: "0 0 12px" }}>نمبروں کی تقسیم</h4>
                  {[
                    ["90-100%", 90, 100, "#4ade80"],
                    ["70-89%", 70, 89, "#86efac"],
                    ["50-69%", 50, 69, "#f59e0b"],
                    ["Below 50%", 0, 49, "#f87171"],
                  ].map(([label, lo, hi, color]) => {
                    const count = attempts.filter(a => {
                      const p = total ? Math.round((a.score / total) * 100) : 0;
                      return p >= lo && p <= hi;
                    }).length;
                    const w = attempted ? Math.round((count / attempted) * 100) : 0;
                    return (
                      <div key={label} style={{ marginBottom: 10 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#94a3b8", marginBottom: 4 }}>
                          <span>{label}</span>
                          <span>{count} طالب علم</span>
                        </div>
                        <div style={{ height: 8, background: "#334155", borderRadius: 4, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${w}%`, background: color, transition: "width .5s" }} />
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          )}

          {/* Per Question */}
          {view === "perQuestion" && (
            <div>
              {qStats.map((q, i) => (
                <div key={i} style={{ background: "#1e293b", borderRadius: 10, padding: 16, marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div style={{ flex: 1 }}>
                      <span style={{ color: "#64748b", fontSize: 11, marginRight: 8 }}>سوال {i + 1}</span>
                      <p style={{ color: "#e2e8f0", fontSize: 13, margin: "4px 0 0", lineHeight: 1.5 }}>
                        {q.question_text}
                      </p>
                    </div>
                    <div style={{ textAlign: "center", flexShrink: 0, marginRight: 12 }}>
                      <div style={{ color: diffColor(q.difficulty), fontWeight: 700, fontSize: 16 }}>
                        {q.difficulty}%
                      </div>
                      <div style={{ color: "#64748b", fontSize: 10 }}>مشکل</div>
                    </div>
                  </div>

                  {/* Option bars */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                    {["A", "B", "C", "D"].map(opt => {
                      const count = q.optCounts[opt] || 0;
                      const w = attempted ? Math.round((count / attempted) * 100) : 0;
                      const isCorrect = opt === q.correct_option;
                      return (
                        <div key={opt} style={{ background: "#0f172a", borderRadius: 6, padding: "6px 10px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
                            <span style={{ color: isCorrect ? "#4ade80" : "#94a3b8" }}>
                              {isCorrect ? "✓ " : ""}{opt}: {q.options?.[opt] || "-"}
                            </span>
                            <span style={{ color: "#64748b" }}>{count}</span>
                          </div>
                          <div style={{ height: 4, background: "#334155", borderRadius: 2, overflow: "hidden" }}>
                            <div style={{
                              height: "100%", width: `${w}%`,
                              background: isCorrect ? "#4ade80" : "#475569",
                            }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Students list */}
          {view === "students" && (
            <div>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="طالب علم تلاش کریں..."
                style={{ ...input, marginBottom: 12, width: "100%" }}
              />
              {filteredAttempts.length === 0 ? (
                <p style={{ color: "#64748b", textAlign: "center", padding: 20 }}>کوئی نتیجہ نہیں</p>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#1e293b" }}>
                      {["طالب علم", "نمبر", "%", "درست", "نتیجہ"].map(h => (
                        <th key={h} style={{ color: "#94a3b8", fontSize: 12, padding: "10px 12px", textAlign: "right", fontWeight: 600 }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAttempts
                      .sort((a, b) => (b.score || 0) - (a.score || 0))
                      .map((att, i) => {
                        const st = studentMap[att.student_id];
                        const pct = total ? Math.round((att.score / total) * 100) : 0;
                        return (
                          <tr key={att.id} style={{ background: i % 2 ? "#0f172a" : "#1e293b" }}>
                            <td style={{ color: "#f1f5f9", padding: "10px 12px", fontSize: 13 }}>
                              {st?.name || att.student_id}
                            </td>
                            <td style={{ color: "#e2e8f0", padding: "10px 12px", fontSize: 13 }}>
                              {att.score}/{total}
                            </td>
                            <td style={{ padding: "10px 12px" }}>
                              <span style={{ color: pctColor(pct), fontWeight: 600, fontSize: 13 }}>{pct}%</span>
                            </td>
                            <td style={{ color: "#94a3b8", padding: "10px 12px", fontSize: 13 }}>
                              {att.correct_count}/{questions.length}
                            </td>
                            <td style={{ padding: "10px 12px" }}>
                              <span style={{
                                background: att.passed ? "#14532d" : "#450a0a",
                                color: att.passed ? "#4ade80" : "#f87171",
                                padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
                              }}>
                                {att.passed ? "کامیاب" : "ناکام"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>

        <button onClick={onClose} style={{ ...btn, background: G, color: N, width: "100%", marginTop: 20, fontWeight: 700 }}>
          بند کریں
        </button>
      </div>
    </div>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const overlay = {
  position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)",
  display: "flex", alignItems: "center", justifyContent: "center",
  zIndex: 1000, padding: 16,
};
const card = {
  background: N, borderRadius: 16, padding: 28, width: "100%",
  maxHeight: "95vh", overflowY: "auto",
  border: `1px solid ${G}44`,
  boxShadow: `0 0 40px ${G}22`,
};
const btn = {
  border: "none", borderRadius: 8, padding: "10px 20px",
  cursor: "pointer", fontSize: 14, fontWeight: 600,
};
const tabBtn = {
  border: "none", borderRadius: 8, padding: "8px 16px",
  cursor: "pointer", fontSize: 13, fontWeight: 600, transition: "all .2s",
};
const closeBtn = {
  background: "#334155", border: "none", color: "#94a3b8",
  width: 32, height: 32, borderRadius: "50%", cursor: "pointer", fontSize: 16,
};
const input = {
  background: "#1e293b", border: "1px solid #334155", borderRadius: 8,
  padding: "10px 14px", color: "#f1f5f9", fontSize: 14, outline: "none",
  boxSizing: "border-box",
};
