import React, { useState, useEffect, useCallback } from "react";
import { confirm } from '../ui/ConfirmDialog';
import EmptyState from '../ui/EmptyState';
import { supabase } from "../../supabase";
import { toast } from "../../components/ui/Toast";
import QuizBuilder from "./QuizBuilder";
import QuizAttempt from "./QuizAttempt";
import QuizResults from "./QuizResults";

const N = "#0f172a", G = "#d4af37";
const SUBJECTS = [
  "اردو","انگریزی","ریاضی","سائنس","اسلامیات","معاشرتی علوم",
  "عربی","فارسی","حفظ","تجوید","منطق","فقہ","حدیث","تفسیر",
];
const GRADES = ["نرسری","پریپ","1","2","3","4","5","6","7","8","9","10","11","12"];

export default function QuizHub({ user, role }) {
  const [quizzes, setQuizzes] = useState([]);
  const [students, setStudents] = useState([]);
  const [myAttempts, setMyAttempts] = useState([]); // for student/parent
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("available");
  const [showBuilder, setShowBuilder] = useState(false);
  const [editQuiz, setEditQuiz] = useState(null);
  const [attemptQuiz, setAttemptQuiz] = useState(null);
  const [resultsQuiz, setResultsQuiz] = useState(null);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [filterGrade, setFilterGrade] = useState("");
  const [filterSubject, setFilterSubject] = useState("");

  const isTeacher = ["admin", "teacher", "director"].includes(role);
  const isStudent = role === "student";
  const isParent = role === "parent";

  // Find current student
  const myStudent = isStudent
    ? students.find(s => s.user_id === user?.uid || s.email === user?.email)
    : isParent
    ? students.find(s => s.parent_email === user?.email)
    : null;

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: qz }, { data: st }] = await Promise.all([
      supabase.from("quizzes").select("*").order("created_at", { ascending: false }),
      supabase.from("students").select("*"),
    ]);

    let filteredQuizzes = qz || [];
    if ((isStudent || isParent) && myStudent) {
      filteredQuizzes = filteredQuizzes.filter(q =>
        !q.grade || q.grade === myStudent.grade
      );
    }
    setQuizzes(filteredQuizzes);
    setStudents(st || []);

    if (isStudent && myStudent) {
      const { data: atts } = await supabase
        .from("quiz_attempts")
        .select("*")
        .eq("student_id", myStudent.id);
      setMyAttempts(atts || []);
    }
    setLoading(false);
  }, [isStudent, isParent, myStudent]);

  useEffect(() => { load(); }, [load]);

  const getMyAttempt = (quizId) => myAttempts.find(a => a.quiz_id === quizId);

  const deleteQuiz = async (id) => {
    if (!await confirm("کیا آپ یہ ٹیسٹ حذف کرنا چاہتے ہیں؟")) return;
    await supabase.from("quizzes").delete().eq("id", id);
    setQuizzes(prev => prev.filter(q => q.id !== id));
  };

  const handleSave = async (quizData) => {
    const { questions, ...meta } = quizData;
    let quizId;

    if (editQuiz) {
      await supabase.from("quizzes").update({ ...meta, updated_at: new Date().toISOString() }).eq("id", editQuiz.id);
      await supabase.from("quiz_questions").delete().eq("quiz_id", editQuiz.id);
      quizId = editQuiz.id;
    } else {
      const { data } = await supabase
        .from("quizzes")
        .insert({ ...meta, created_by: user?.uid || "admin", status: "active" })
        .select()
        .single();
      quizId = data?.id;
    }

    if (quizId && questions?.length) {
      await supabase.from("quiz_questions").insert(
        questions.map((q, i) => ({
          quiz_id: quizId,
          order_num: i + 1,
          question_text: q.text,
          options: q.options,
          correct_option: q.correct,
          marks: q.marks || 1,
        }))
      );
    }

    setShowBuilder(false);
    setEditQuiz(null);
    load();
  };

  const handleAIGenerate = async (meta, applyAI) => {
    setAiGenerating(true);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: "quiz_questions",
          data: { subject: meta.subject, grade: meta.grade, count: 10, title: meta.title },
        }),
      });
      let fullText = "";
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter(l => l.startsWith("data:"));
        for (const line of lines) {
          try {
            const d = JSON.parse(line.slice(5));
            if (d.text) fullText += d.text;
          } catch {} // eslint-disable-line no-empty
        }
      }
      // Parse JSON from AI response
      const match = fullText.match(/\[[\s\S]*\]/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        applyAI(parsed);
      }
    } catch (e) {
      toast.warning("AI سوالات نہیں بنا سکا: " + e.message);
    } finally {
      setAiGenerating(false);
    }
  };

  // ─── Filtered quizzes by tab ────────────────────────────────────────────────
  const filtered = quizzes.filter(q => {
    if (filterGrade && q.grade !== filterGrade) return false;
    if (filterSubject && q.subject !== filterSubject) return false;
    return true;
  });

  const available = filtered.filter(q => {
    if (isTeacher) return true;
    const att = getMyAttempt(q.id);
    return !att;
  });
  const inProgress = filtered.filter(q => {
    const att = getMyAttempt(q.id);
    return att?.status === "in_progress";
  });
  const completed = filtered.filter(q => {
    const att = getMyAttempt(q.id);
    return att?.status === "submitted";
  });

  const tabs = isTeacher
    ? [["available", "📋 تمام ٹیسٹ", filtered.length]]
    : [
        ["available", "📋 دستیاب", available.length],
        ["inprogress", "⏳ جاری", inProgress.length],
        ["completed", "✅ مکمل", completed.length],
      ];

  const currentList =
    tab === "available" ? (isTeacher ? filtered : available) :
    tab === "inprogress" ? inProgress : completed;

  const statusBadge = (quizId) => {
    const att = getMyAttempt(quizId);
    if (!att) return { label: "شروع کریں", color: "#60a5fa", bg: "#1e3a5f" };
    if (att.status === "in_progress") return { label: "جاری", color: "#f59e0b", bg: "#451a03" };
    if (att.passed) return { label: "کامیاب", color: "#4ade80", bg: "#14532d" };
    return { label: "ناکام", color: "#f87171", bg: "#450a0a" };
  };

  return (
    <div style={{ padding: 24, minHeight: "100vh", background: N, color: "#f1f5f9" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ color: G, margin: "0 0 4px", fontSize: 24 }}>📝 آن لائن ٹیسٹ</h1>
          <p style={{ color: "#64748b", margin: 0, fontSize: 13 }}>MCQ کوئز سسٹم</p>
        </div>
        {isTeacher && (
          <button
            onClick={() => { setEditQuiz(null); setShowBuilder(true); }}
            style={{ background: G, color: N, border: "none", borderRadius: 10, padding: "10px 20px", fontWeight: 700, cursor: "pointer", fontSize: 14 }}
          >
            + نیا ٹیسٹ
          </button>
        )}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <select value={filterGrade} onChange={e => setFilterGrade(e.target.value)} style={sel}>
          <option value="">تمام جماعتیں</option>
          {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
        <select value={filterSubject} onChange={e => setFilterSubject(e.target.value)} style={sel}>
          <option value="">تمام مضامین</option>
          {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        {(filterGrade || filterSubject) && (
          <button
            onClick={() => { setFilterGrade(""); setFilterSubject(""); }}
            style={{ ...sel, cursor: "pointer", color: "#f87171" }}
          >✕ صاف</button>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {tabs.map(([v, label, count]) => (
          <button
            key={v}
            onClick={() => setTab(v)}
            style={{
              border: "none", borderRadius: 8, padding: "8px 16px",
              cursor: "pointer", fontSize: 13, fontWeight: 600,
              background: tab === v ? G : "#1e293b",
              color: tab === v ? N : "#94a3b8",
            }}
          >
            {label}
            <span style={{
              marginRight: 8,
              background: tab === v ? "#0005" : "#334155",
              borderRadius: 10, padding: "1px 7px", fontSize: 11,
            }}>{count}</span>
          </button>
        ))}
      </div>

      {/* Quiz cards */}
      {loading ? (
        <p style={{ color: "#94a3b8", textAlign: "center", padding: 40 }}>لوڈ ہو رہا ہے...</p>
      ) : currentList.length === 0 ? (
        <EmptyState
          icon="📝"
          title="کوئی ٹیسٹ نہیں ملا"
          subtitle="اس وقت کوئی ٹیسٹ دستیاب نہیں ہے"
          action={isTeacher ? { label: "+ پہلا ٹیسٹ بنائیں", onClick: () => setShowBuilder(true) } : undefined}
        />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 16 }}>
          {currentList.map(quiz => {
            const badge = !isTeacher ? statusBadge(quiz.id) : null;
            const att = getMyAttempt(quiz.id);
            const pct = att?.status === "submitted" && quiz.total_marks
              ? Math.round((att.score / quiz.total_marks) * 100) : null;

            return (
              <div key={quiz.id} style={{
                background: "#1e293b", borderRadius: 14, padding: 20,
                border: `1px solid ${G}22`, transition: "border .2s",
              }}>
                {/* Subject + grade badges */}
                <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
                  <span style={{ background: "#1a2744", color: G, fontSize: 11, padding: "2px 10px", borderRadius: 20 }}>
                    {quiz.subject}
                  </span>
                  <span style={{ background: "#334155", color: "#94a3b8", fontSize: 11, padding: "2px 10px", borderRadius: 20 }}>
                    جماعت {quiz.grade}
                  </span>
                  {badge && (
                    <span style={{ background: badge.bg, color: badge.color, fontSize: 11, padding: "2px 10px", borderRadius: 20, fontWeight: 600 }}>
                      {badge.label}
                    </span>
                  )}
                </div>

                <h3 style={{ color: "#f1f5f9", margin: "0 0 8px", fontSize: 16 }}>{quiz.title}</h3>

                <div style={{ display: "flex", gap: 16, fontSize: 12, color: "#64748b", marginBottom: 14 }}>
                  <span>⏱ {quiz.duration_minutes} منٹ</span>
                  <span>📊 {quiz.total_marks} نمبر</span>
                  <span>✅ پاس: {quiz.pass_marks}</span>
                </div>

                {/* Score for completed */}
                {pct !== null && (
                  <div style={{
                    background: "#0f172a", borderRadius: 8, padding: "8px 12px", marginBottom: 12,
                    display: "flex", justifyContent: "space-between",
                  }}>
                    <span style={{ color: "#94a3b8", fontSize: 12 }}>آپ کا نتیجہ</span>
                    <span style={{ color: att?.passed ? "#4ade80" : "#f87171", fontWeight: 700 }}>
                      {att.score}/{quiz.total_marks} ({pct}%)
                    </span>
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: "flex", gap: 8 }}>
                  {isTeacher ? (
                    <>
                      <button
                        onClick={() => setResultsQuiz(quiz)}
                        style={{ ...actionBtn, background: "#1a2744", color: "#60a5fa", flex: 1 }}
                      >📊 نتائج</button>
                      <button
                        onClick={() => { setEditQuiz(quiz); setShowBuilder(true); }}
                        style={{ ...actionBtn, background: "#2d1f5e", color: "#a78bfa", flex: 1 }}
                      >✏️ ترمیم</button>
                      <button
                        onClick={() => deleteQuiz(quiz.id)}
                        style={{ ...actionBtn, background: "#450a0a", color: "#f87171" }}
                      >🗑</button>
                    </>
                  ) : (
                    <button
                      onClick={() => setAttemptQuiz(quiz)}
                      disabled={att?.status === "submitted"}
                      style={{
                        ...actionBtn, flex: 1,
                        background: att?.status === "submitted" ? "#334155" : G,
                        color: att?.status === "submitted" ? "#64748b" : N,
                        fontWeight: 700,
                        opacity: att?.status === "submitted" ? 0.7 : 1,
                      }}
                    >
                      {att?.status === "submitted" ? "✅ مکمل" :
                       att?.status === "in_progress" ? "⏳ جاری رکھیں" : "▶ شروع کریں"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {showBuilder && (
        <QuizBuilder
          students={students}
          quiz={editQuiz}
          onSave={handleSave}
          onClose={() => { setShowBuilder(false); setEditQuiz(null); }}
          aiGenerating={aiGenerating}
          onAIGenerate={handleAIGenerate}
        />
      )}

      {attemptQuiz && myStudent && (
        <QuizAttempt
          quiz={attemptQuiz}
          student={myStudent}
          onClose={() => setAttemptQuiz(null)}
          onDone={() => { setAttemptQuiz(null); load(); }}
        />
      )}

      {resultsQuiz && (
        <QuizResults
          quiz={resultsQuiz}
          students={students}
          onClose={() => setResultsQuiz(null)}
        />
      )}
    </div>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const sel = {
  background: "#1e293b", border: "1px solid #334155", borderRadius: 8,
  padding: "8px 12px", color: "#f1f5f9", fontSize: 13, outline: "none",
};
const actionBtn = {
  border: "none", borderRadius: 8, padding: "8px 14px",
  cursor: "pointer", fontSize: 13, fontWeight: 600, transition: "opacity .2s",
};
