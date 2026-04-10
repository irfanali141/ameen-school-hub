import React, { useState, useEffect, useRef, useCallback } from "react";
import { confirm } from '../ui/ConfirmDialog';
import { supabase } from "../../supabase";

const N = "#0f172a", G = "#d4af37";
const OPTION_COLORS = { A: "#60a5fa", B: "#4ade80", C: "#f59e0b", D: "#f87171" };
const OPTION_BG = { A: "#1e3a5f", B: "#14532d", C: "#451a03", D: "#450a0a" };

export default function QuizAttempt({ quiz, student, onClose, onDone }) {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({}); // { qIdx: "A"|"B"|"C"|"D" }
  const [current, setCurrent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [phase, setPhase] = useState("loading"); // loading | intro | attempt | submitted | result
  const [result, setResult] = useState(null);
  const [existingAttempt, setExistingAttempt] = useState(null);
  const [saving, setSaving] = useState(false);
  const timerRef = useRef(null);

  // Load quiz questions and check existing attempt
  useEffect(() => {
    (async () => {
      const { data: qs } = await supabase
        .from("quiz_questions")
        .select("*")
        .eq("quiz_id", quiz.id)
        .order("order_num");

      const { data: attempt } = await supabase
        .from("quiz_attempts")
        .select("*")
        .eq("quiz_id", quiz.id)
        .eq("student_id", student.id)
        .maybeSingle();

      setQuestions(qs || []);

      if (attempt) {
        setExistingAttempt(attempt);
        if (attempt.status === "submitted") {
          // Show result directly
          setResult({
            score: attempt.score,
            total: attempt.total_marks,
            correct: attempt.correct_count,
            total_q: qs?.length || 0,
            passed: attempt.passed,
            answers: attempt.answers || {},
          });
          setAnswers(attempt.answers || {});
          setPhase("result");
          return;
        }
        // Resume in-progress attempt
        setAnswers(attempt.answers || {});
        const elapsed = Math.floor((Date.now() - new Date(attempt.started_at).getTime()) / 1000);
        const remaining = quiz.duration_minutes * 60 - elapsed;
        setTimeLeft(remaining > 0 ? remaining : 0);
        setPhase(remaining > 0 ? "attempt" : "submitting");
      } else {
        setTimeLeft(quiz.duration_minutes * 60);
        setPhase("intro");
      }
    })();
  }, [quiz.id, quiz.duration_minutes, student.id]);

  // Timer countdown
  useEffect(() => {
    if (phase !== "attempt" || timeLeft === null) return;
    if (timeLeft <= 0) { handleSubmit(true); return; }
    timerRef.current = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timerRef.current);
  });

  const startAttempt = async () => {
    const { data } = await supabase
      .from("quiz_attempts")
      .insert({
        quiz_id: quiz.id,
        student_id: student.id,
        started_at: new Date().toISOString(),
        status: "in_progress",
        answers: {},
        total_marks: questions.reduce((s, q) => s + (q.marks || 1), 0),
      })
      .select()
      .single();
    setExistingAttempt(data);
    setPhase("attempt");
  };

  const selectAnswer = async (optKey) => {
    const newAnswers = { ...answers, [current]: optKey };
    setAnswers(newAnswers);
    if (existingAttempt) {
      await supabase
        .from("quiz_attempts")
        .update({ answers: newAnswers })
        .eq("id", existingAttempt.id);
    }
  };

  const handleSubmit = useCallback(async (auto = false) => {
    if (saving) return;
    setSaving(true);
    clearTimeout(timerRef.current);

    let score = 0, correct = 0;
    const total = questions.reduce((s, q) => s + (q.marks || 1), 0);
    questions.forEach((q, idx) => {
      if (answers[idx] === q.correct_option) {
        score += q.marks || 1;
        correct++;
      }
    });
    const passed = score >= (quiz.pass_marks || Math.ceil(total * 0.5));

    await supabase
      .from("quiz_attempts")
      .update({
        status: "submitted",
        submitted_at: new Date().toISOString(),
        score,
        correct_count: correct,
        passed,
        answers,
      })
      .eq("id", existingAttempt?.id);

    setResult({ score, total, correct, total_q: questions.length, passed, answers });
    setPhase("result");
    setSaving(false);
    if (onDone) onDone();
  }, [saving, questions, answers, quiz, existingAttempt, onDone]);

  const fmtTime = (secs) => {
    const m = Math.floor(secs / 60), s = secs % 60;
    return `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
  };

  const timerColor = timeLeft !== null && timeLeft < 60 ? "#f87171" : timeLeft < 180 ? "#f59e0b" : "#4ade80";
  const answered = Object.keys(answers).length;
  const progress = questions.length ? Math.round((answered / questions.length) * 100) : 0;

  // ─── Phases ────────────────────────────────────────────────────────────────

  if (phase === "loading") return (
    <div style={overlay}>
      <div style={card}>
        <p style={{ color: "#94a3b8", textAlign: "center" }}>لوڈ ہو رہا ہے...</p>
      </div>
    </div>
  );

  if (phase === "intro") return (
    <div style={overlay}>
      <div style={{ ...card, maxWidth: 520 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ color: G, fontSize: 20, margin: 0 }}>📝 ٹیسٹ کی معلومات</h2>
          <button onClick={onClose} style={closeBtn}>✕</button>
        </div>

        <div style={{ background: "#1e293b", borderRadius: 12, padding: 20, marginBottom: 20 }}>
          <h3 style={{ color: "#f1f5f9", margin: "0 0 16px", fontSize: 18 }}>{quiz.title}</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              ["📚 مضمون", quiz.subject],
              ["🎓 جماعت", quiz.grade],
              ["❓ سوالات", questions.length],
              ["⏱️ وقت", `${quiz.duration_minutes} منٹ`],
              ["📊 کل نمبر", questions.reduce((s, q) => s + (q.marks || 1), 0)],
              ["✅ پاس نمبر", quiz.pass_marks || "50%"],
            ].map(([label, val]) => (
              <div key={label} style={{ background: "#0f172a", borderRadius: 8, padding: "10px 14px" }}>
                <div style={{ color: "#94a3b8", fontSize: 11, marginBottom: 4 }}>{label}</div>
                <div style={{ color: "#f1f5f9", fontWeight: 600 }}>{val}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: "#1a2744", border: "1px solid #d4af3744", borderRadius: 10, padding: 16, marginBottom: 20 }}>
          <p style={{ color: G, margin: "0 0 8px", fontWeight: 600 }}>⚠️ ہدایات</p>
          <ul style={{ color: "#94a3b8", margin: 0, paddingRight: 20, fontSize: 13, lineHeight: 1.8 }}>
            <li>ٹیسٹ شروع ہونے کے بعد ٹائمر چلتا رہے گا</li>
            <li>ہر سوال میں صرف ایک جواب منتخب کریں</li>
            <li>وقت ختم ہونے پر خودکار جمع ہو جائے گا</li>
            <li>جمع کرنے کے بعد دوبارہ تبدیل نہیں ہوگا</li>
          </ul>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={onClose} style={{ ...btn, background: "#334155", flex: 1 }}>واپس جائیں</button>
          <button onClick={startAttempt} style={{ ...btn, background: G, color: N, flex: 2, fontWeight: 700 }}>
            ✅ ٹیسٹ شروع کریں
          </button>
        </div>
      </div>
    </div>
  );

  if (phase === "attempt" && questions.length > 0) {
    const q = questions[current];
    return (
      <div style={overlay}>
        <div style={{ ...card, maxWidth: 700, padding: 0, overflow: "hidden" }}>
          {/* Header */}
          <div style={{ background: "#1e293b", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ color: "#94a3b8", fontSize: 14 }}>
              سوال {current + 1} / {questions.length}
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ color: "#94a3b8", fontSize: 13 }}>
                {answered}/{questions.length} جوابات
              </span>
              <span style={{
                background: "#0f172a", color: timerColor, fontWeight: 700,
                fontSize: 20, padding: "6px 14px", borderRadius: 8,
                border: `2px solid ${timerColor}`, fontFamily: "monospace"
              }}>
                ⏱ {fmtTime(timeLeft)}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ height: 4, background: "#334155" }}>
            <div style={{ height: "100%", width: `${progress}%`, background: G, transition: "width .3s" }} />
          </div>

          {/* Question */}
          <div style={{ padding: 24 }}>
            <div style={{ background: "#1e293b", borderRadius: 12, padding: 20, marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                <p style={{ color: "#f1f5f9", fontSize: 16, margin: 0, lineHeight: 1.7, flex: 1 }}>
                  {q.question_text}
                </p>
                <span style={{ background: "#0f172a", color: G, fontSize: 12, padding: "2px 10px", borderRadius: 20, whiteSpace: "nowrap" }}>
                  {q.marks || 1} نمبر
                </span>
              </div>
            </div>

            {/* Options */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {["A", "B", "C", "D"].map(opt => {
                const selected = answers[current] === opt;
                return (
                  <button
                    key={opt}
                    onClick={() => selectAnswer(opt)}
                    style={{
                      background: selected ? OPTION_BG[opt] : "#1e293b",
                      border: `2px solid ${selected ? OPTION_COLORS[opt] : "#334155"}`,
                      borderRadius: 10, padding: "14px 16px", cursor: "pointer",
                      display: "flex", alignItems: "flex-start", gap: 12, textAlign: "right",
                      transition: "all .2s", transform: selected ? "scale(1.02)" : "scale(1)",
                    }}
                  >
                    <span style={{
                      background: selected ? OPTION_COLORS[opt] : "#334155",
                      color: selected ? N : "#94a3b8",
                      borderRadius: "50%", width: 28, height: 28, display: "flex",
                      alignItems: "center", justifyContent: "center",
                      fontWeight: 700, fontSize: 14, flexShrink: 0,
                    }}>{opt}</span>
                    <span style={{ color: selected ? "#f1f5f9" : "#94a3b8", fontSize: 14, lineHeight: 1.5 }}>
                      {q.options?.[opt] || ""}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Navigation */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 24, gap: 12 }}>
              <button
                onClick={() => setCurrent(c => Math.max(0, c - 1))}
                disabled={current === 0}
                style={{ ...btn, background: "#334155", opacity: current === 0 ? 0.4 : 1 }}
              >
                ← پچھلا
              </button>

              {/* Question dots */}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center", flex: 1 }}>
                {questions.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    style={{
                      width: 28, height: 28, borderRadius: "50%", border: "none",
                      cursor: "pointer", fontSize: 11, fontWeight: 600,
                      background: i === current ? G : answers[i] ? "#22c55e" : "#334155",
                      color: i === current ? N : "#f1f5f9",
                    }}
                  >{i + 1}</button>
                ))}
              </div>

              {current < questions.length - 1 ? (
                <button
                  onClick={() => setCurrent(c => Math.min(questions.length - 1, c + 1))}
                  style={{ ...btn, background: "#334155" }}
                >
                  اگلا →
                </button>
              ) : (
                <button
                  onClick={async () => {
                    if (await confirm("کیا آپ واقعی جمع کرنا چاہتے ہیں؟ بعد میں تبدیل نہیں ہو سکتا۔"))
                      handleSubmit(false);
                  }}
                  disabled={saving}
                  style={{ ...btn, background: "#22c55e", color: N, fontWeight: 700 }}
                >
                  {saving ? "جمع ہو رہا ہے..." : "✅ جمع کریں"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "result" && result) {
    const pct = result.total ? Math.round((result.score / result.total) * 100) : 0;
    return (
      <div style={overlay}>
        <div style={{ ...card, maxWidth: 560 }}>
          {/* Result header */}
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ fontSize: 56, marginBottom: 8 }}>
              {result.passed ? "🏆" : "📝"}
            </div>
            <h2 style={{ color: result.passed ? "#4ade80" : "#f87171", margin: "0 0 4px", fontSize: 22 }}>
              {result.passed ? "مبارک ہو! پاس" : "ناکام"}
            </h2>
            <p style={{ color: "#94a3b8", margin: 0 }}>{quiz.title}</p>
          </div>

          {/* Score ring */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
            <div style={{
              width: 120, height: 120, borderRadius: "50%",
              border: `6px solid ${result.passed ? "#4ade80" : "#f87171"}`,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              background: "#1e293b",
            }}>
              <span style={{ color: "#f1f5f9", fontSize: 28, fontWeight: 700 }}>{pct}%</span>
              <span style={{ color: "#94a3b8", fontSize: 12 }}>{result.score}/{result.total}</span>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 20 }}>
            {[
              ["✅ درست", result.correct, "#4ade80"],
              ["❌ غلط", result.total_q - result.correct, "#f87171"],
              ["📊 نمبر", `${result.score}/${result.total}`, G],
            ].map(([label, val, color]) => (
              <div key={label} style={{ background: "#1e293b", borderRadius: 10, padding: 14, textAlign: "center" }}>
                <div style={{ color, fontSize: 20, fontWeight: 700 }}>{val}</div>
                <div style={{ color: "#64748b", fontSize: 12, marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Answer review */}
          <div style={{ maxHeight: 260, overflowY: "auto", marginBottom: 20 }}>
            {questions.map((q, i) => {
              const studentAns = result.answers[i];
              const correct = q.correct_option;
              const isRight = studentAns === correct;
              return (
                <div key={i} style={{
                  background: "#1e293b", borderRadius: 8, padding: "10px 14px",
                  marginBottom: 8, border: `1px solid ${isRight ? "#22c55e33" : "#f8717133"}`
                }}>
                  <div style={{ color: "#94a3b8", fontSize: 12, marginBottom: 4 }}>سوال {i + 1}</div>
                  <div style={{ color: "#e2e8f0", fontSize: 13, marginBottom: 6, lineHeight: 1.5 }}>
                    {q.question_text}
                  </div>
                  <div style={{ display: "flex", gap: 16, fontSize: 12 }}>
                    <span>
                      آپ کا جواب:{" "}
                      <span style={{ color: isRight ? "#4ade80" : "#f87171", fontWeight: 600 }}>
                        {studentAns ? `${studentAns}: ${q.options?.[studentAns] || "-"}` : "نہیں دیا"}
                      </span>
                    </span>
                    {!isRight && (
                      <span>
                        درست جواب:{" "}
                        <span style={{ color: "#4ade80", fontWeight: 600 }}>
                          {correct}: {q.options?.[correct] || "-"}
                        </span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <button onClick={onClose} style={{ ...btn, background: G, color: N, width: "100%", fontWeight: 700 }}>
            ✅ بند کریں
          </button>
        </div>
      </div>
    );
  }

  return null;
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
  color: "#f1f5f9", cursor: "pointer", fontSize: 14, fontWeight: 600,
};
const closeBtn = {
  background: "#334155", border: "none", color: "#94a3b8",
  width: 32, height: 32, borderRadius: "50%", cursor: "pointer", fontSize: 16,
};
