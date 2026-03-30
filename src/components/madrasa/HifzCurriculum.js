/* eslint-disable */
import { useState, useEffect } from "react";
import { supabase } from "../../supabase";

const C = {
  primary: "#1B4332",
  gold: "#B8860B",
  goldLight: "#D4AF37",
  card: "rgba(255,255,255,0.04)",
  border: "rgba(255,255,255,0.08)",
  text: "#e2e8f0",
  muted: "rgba(255,255,255,0.4)",
  green: "#4ade80",
  red: "#f87171",
  blue: "#60a5fa",
  purple: "#a78bfa",
  orange: "#fb923c",
};

const glass = {
  background: C.card,
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: `1px solid ${C.border}`,
  borderRadius: "16px",
};

const urdu = {
  fontFamily: "'Noto Nastaliq Urdu','Segoe UI',sans-serif",
  direction: "rtl",
  textAlign: "right",
};

const CLASSES = ["Class 6", "Class 7", "Class 8"];
const CLASS_LABELS_UR = { "Class 6": "کلاس ۶", "Class 7": "کلاس ۷", "Class 8": "کلاس ۸" };

const DAYS_UR = ["پیر", "منگل", "بدھ", "جمعرات", "جمعہ", "ہفتہ", "اتوار"];
const DAYS_EN = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// Default curriculum data per class — can be overridden from DB
const DEFAULT_CURRICULUM = {
  "Class 6": {
    description: "بنیادی حفظ — ناظرہ سے حفظ کی شروعات",
    target: "پہلا پارہ مکمل کریں",
    daily_lines: "1/8 صفحہ (سطریں: ~2)",
    weekly_goal: "1 صفحہ",
    term_goal: "5 پارے",
    annual_goal: "10 پارے",
    schedule: [
      { day: 0, session: "صبح", type: "sabaq", lesson: "نیا سبق — ½ صفحہ", surah: "البقرة" },
      { day: 0, session: "شام", type: "dohrai", lesson: "کل کا دہرانا", surah: "" },
      { day: 1, session: "صبح", type: "sabaq", lesson: "نیا سبق — ½ صفحہ", surah: "البقرة" },
      { day: 1, session: "شام", type: "dohrai", lesson: "ہفتہ کا دہرانا", surah: "" },
      { day: 2, session: "صبح", type: "sabaq", lesson: "نیا سبق — ½ صفحہ", surah: "البقرة" },
      { day: 2, session: "شام", type: "dohrai", lesson: "گذشتہ 3 دن کا دہرانا", surah: "" },
      { day: 3, session: "صبح", type: "sabaq", lesson: "نیا سبق — ½ صفحہ", surah: "البقرة" },
      { day: 3, session: "شام", type: "manzil", lesson: "منزل — ابتدائی 2 پارے", surah: "" },
      { day: 4, session: "صبح", type: "sabaq", lesson: "نیا سبق — ½ صفحہ", surah: "البقرة" },
      { day: 4, session: "شام", type: "dohrai", lesson: "ہفتے کا مجموعی دہرانا", surah: "" },
      { day: 5, session: "صبح", type: "test", lesson: "ہفتہ وار ٹیسٹ", surah: "" },
      { day: 6, session: "صبح", type: "rest", lesson: "چھٹی / گھر پر مشق", surah: "" },
    ],
    milestones: [
      { para: 1, reward: "سرٹیفکیٹ", color: C.orange },
      { para: 5, reward: "اعزازی بیج", color: C.goldLight },
      { para: 10, reward: "ہاؤس پوائنٹس +50", color: C.green },
    ],
  },
  "Class 7": {
    description: "درمیانی حفظ — رفتار اور روانی",
    target: "15 پارے مکمل کریں",
    daily_lines: "1/4 صفحہ (سطریں: ~4)",
    weekly_goal: "2 صفحے",
    term_goal: "8 پارے",
    annual_goal: "15 پارے",
    schedule: [
      { day: 0, session: "صبح", type: "sabaq", lesson: "نیا سبق — 1 صفحہ", surah: "آل عمران" },
      { day: 0, session: "شام", type: "dohrai", lesson: "کل کا دہرانا", surah: "" },
      { day: 1, session: "صبح", type: "sabaq", lesson: "نیا سبق — 1 صفحہ", surah: "النساء" },
      { day: 1, session: "شام", type: "dohrai", lesson: "ہفتہ کا دہرانا", surah: "" },
      { day: 2, session: "صبح", type: "sabaq", lesson: "نیا سبق — 1 صفحہ", surah: "المائدة" },
      { day: 2, session: "شام", type: "manzil", lesson: "منزل — 5 پارے", surah: "" },
      { day: 3, session: "صبح", type: "sabaq", lesson: "نیا سبق — 1 صفحہ", surah: "الأنعام" },
      { day: 3, session: "شام", type: "dohrai", lesson: "گذشتہ ہفتے کا دہرانا", surah: "" },
      { day: 4, session: "صبح", type: "sabaq", lesson: "نیا سبق — 1 صفحہ", surah: "الأعراف" },
      { day: 4, session: "شام", type: "dohrai", lesson: "ہفتے کا مجموعی دہرانا", surah: "" },
      { day: 5, session: "صبح", type: "test", lesson: "ہفتہ وار ٹیسٹ + دہرانا", surah: "" },
      { day: 6, session: "صبح", type: "rest", lesson: "چھٹی / گھر پر مشق", surah: "" },
    ],
    milestones: [
      { para: 5, reward: "سرٹیفکیٹ", color: C.orange },
      { para: 10, reward: "اعزازی بیج + ہاؤس پوائنٹس", color: C.goldLight },
      { para: 15, reward: "نصف قرآن — خصوصی تقریب", color: C.green },
    ],
  },
  "Class 8": {
    description: "اعلیٰ حفظ — تکمیل کی جانب",
    target: "قرآن مجید مکمل حفظ",
    daily_lines: "1/2 صفحہ (سطریں: ~8)",
    weekly_goal: "3 صفحے",
    term_goal: "10 پارے",
    annual_goal: "30 پارے (مکمل)",
    schedule: [
      { day: 0, session: "صبح", type: "sabaq", lesson: "نیا سبق — 1½ صفحہ", surah: "یٰسین" },
      { day: 0, session: "شام", type: "dohrai", lesson: "کل کا دہرانا", surah: "" },
      { day: 1, session: "صبح", type: "sabaq", lesson: "نیا سبق — 1½ صفحہ", surah: "الصافات" },
      { day: 1, session: "شام", type: "manzil", lesson: "منزل — 8 پارے", surah: "" },
      { day: 2, session: "صبح", type: "sabaq", lesson: "نیا سبق — 1½ صفحہ", surah: "الزمر" },
      { day: 2, session: "شام", type: "dohrai", lesson: "ہفتہ کا دہرانا", surah: "" },
      { day: 3, session: "صبح", type: "sabaq", lesson: "نیا سبق — 1½ صفحہ", surah: "غافر" },
      { day: 3, session: "شام", type: "dohrai", lesson: "گذشتہ ماہ کا دہرانا", surah: "" },
      { day: 4, session: "صبح", type: "sabaq", lesson: "نیا سبق — 1½ صفحہ", surah: "فصلت" },
      { day: 4, session: "شام", type: "dohrai", lesson: "ہفتے کا مجموعی دہرانا", surah: "" },
      { day: 5, session: "صبح", type: "test", lesson: "ہفتہ وار ٹیسٹ + منزل", surah: "" },
      { day: 6, session: "صبح", type: "rest", lesson: "چھٹی / گھر پر مشق", surah: "" },
    ],
    milestones: [
      { para: 15, reward: "سرٹیفکیٹ + تقریب", color: C.orange },
      { para: 20, reward: "اعزازی بیج + والدین کو دعوت", color: C.goldLight },
      { para: 30, reward: "حافظ قرآن — خصوصی جشن", color: C.green },
    ],
  },
};

const SESSION_COLORS = {
  sabaq: C.green,
  dohrai: C.blue,
  manzil: C.goldLight,
  test: C.purple,
  rest: C.muted,
};

const SESSION_LABELS = {
  sabaq: "سبق",
  dohrai: "دہرائی",
  manzil: "منزل",
  test: "ٹیسٹ",
  rest: "چھٹی",
};

const SESSION_ICONS = {
  sabaq: "📖",
  dohrai: "🔄",
  manzil: "✅",
  test: "📝",
  rest: "🌙",
};

function getTodayDayIndex() {
  // 0=Monday, 6=Sunday (matching our schedule days)
  const d = new Date().getDay();
  return d === 0 ? 6 : d - 1;
}

export default function HifzCurriculum({ role }) {
  const [selectedClass, setSelectedClass] = useState("Class 6");
  const [viewMode, setViewMode] = useState("week"); // "week" | "today" | "milestones"
  const [dbCurriculum, setDbCurriculum] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editNotes, setEditNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const todayIdx = getTodayDayIndex();
  const curriculum = dbCurriculum || DEFAULT_CURRICULUM[selectedClass];

  useEffect(() => {
    fetchDbCurriculum();
  }, [selectedClass]);

  async function fetchDbCurriculum() {
    try {
      const { data } = await supabase
        .from("hifz_curriculum")
        .select("*")
        .eq("class_name", selectedClass)
        .maybeSingle();
      if (data?.notes) setEditNotes(data.notes);
      // Keep default curriculum structure, just store custom notes from DB
    } catch (e) {
      console.error(e);
    }
  }

  async function saveNotes() {
    setSaving(true);
    try {
      await supabase.from("hifz_curriculum").upsert(
        { class_name: selectedClass, notes: editNotes, updated_at: new Date().toISOString() },
        { onConflict: "class_name" }
      );
      setEditing(false);
    } catch (e) {
      console.error("محفوظ نہیں ہو سکا:", e.message);
    }
    setSaving(false);
  }

  const todaySchedule = curriculum.schedule.filter(s => s.day === todayIdx);

  const canEdit = ["director", "admin", "madrasa", "madrasaustad"].includes(role);

  return (
    <div style={{ padding: "0" }}>
      {/* Class tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
        {CLASSES.map(cls => (
          <button
            key={cls}
            onClick={() => setSelectedClass(cls)}
            style={{
              flex: 1, padding: "10px", borderRadius: "10px", border: "none",
              cursor: "pointer", fontFamily: "inherit",
              background: selectedClass === cls ? `${C.goldLight}16` : "rgba(255,255,255,0.04)",
              color: selectedClass === cls ? C.goldLight : C.muted,
              borderBottom: `2px solid ${selectedClass === cls ? C.goldLight : "transparent"}`,
              fontSize: "0.72rem", fontWeight: "700", transition: "all 0.15s",
            }}
          >
            {CLASS_LABELS_UR[cls]}
          </button>
        ))}
      </div>

      {/* Overview card */}
      <div style={{
        ...glass, padding: "18px", marginBottom: "18px",
        borderTop: `3px solid ${C.goldLight}`,
        background: `linear-gradient(135deg,rgba(27,67,50,0.3),rgba(0,0,0,0))`,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ ...urdu, fontSize: "1rem", fontWeight: "800", color: C.goldLight }}>
              {selectedClass} — نصاب
            </div>
            <div style={{ ...urdu, fontSize: "0.72rem", color: C.muted, marginTop: "4px" }}>
              {curriculum.description}
            </div>
          </div>
          <div style={{
            width: "46px", height: "46px", borderRadius: "12px",
            background: `${C.goldLight}15`, border: `1px solid ${C.goldLight}30`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem",
          }}>
            📚
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px", marginTop: "14px" }}>
          {[
            { label: "روزانہ ہدف", value: curriculum.daily_lines },
            { label: "ہفتہ وار ہدف", value: curriculum.weekly_goal },
            { label: "سالانہ ہدف", value: curriculum.annual_goal },
            { label: "ہدف", value: curriculum.target },
          ].map(item => (
            <div key={item.label} style={{
              padding: "10px 12px", borderRadius: "10px",
              background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}`,
            }}>
              <div style={{ fontSize: "0.58rem", color: C.muted, marginBottom: "3px", direction: "ltr", textAlign: "left" }}>
                {item.label}
              </div>
              <div style={{ ...urdu, fontSize: "0.75rem", color: C.text, fontWeight: "700" }}>
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* View mode toggle */}
      <div style={{ display: "flex", gap: "6px", marginBottom: "16px" }}>
        {[
          { key: "today", labelUr: "آج کا سبق" },
          { key: "week", labelUr: "ہفتہ وار شیڈول" },
          { key: "milestones", labelUr: "سنگ میل" },
        ].map(v => (
          <button
            key={v.key}
            onClick={() => setViewMode(v.key)}
            style={{
              flex: 1, padding: "8px 4px", borderRadius: "9px", border: "none",
              cursor: "pointer", fontFamily: "inherit", fontSize: "0.68rem",
              background: viewMode === v.key ? `rgba(27,67,50,0.4)` : "rgba(255,255,255,0.03)",
              color: viewMode === v.key ? C.green : C.muted,
              border: `1px solid ${viewMode === v.key ? "rgba(74,222,128,0.2)" : C.border}`,
              transition: "all 0.15s",
              ...urdu,
            }}
          >
            {v.labelUr}
          </button>
        ))}
      </div>

      {/* ── TODAY VIEW ── */}
      {viewMode === "today" && (
        <div>
          <div style={{ ...urdu, fontSize: "0.75rem", color: C.muted, marginBottom: "12px" }}>
            آج: {DAYS_UR[todayIdx]}
          </div>

          {todaySchedule.length === 0 ? (
            <div style={{
              ...glass, padding: "32px", textAlign: "center",
            }}>
              <div style={{ fontSize: "2rem", marginBottom: "8px" }}>🌙</div>
              <div style={{ ...urdu, fontSize: "0.85rem", color: C.muted }}>آج چھٹی ہے</div>
              <div style={{ ...urdu, fontSize: "0.68rem", color: "rgba(255,255,255,0.2)", marginTop: "4px" }}>
                گھر پر مشق جاری رکھیں
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {todaySchedule.map((item, i) => (
                <div key={i} style={{
                  ...glass, padding: "16px 18px",
                  borderRight: `4px solid ${SESSION_COLORS[item.type] || C.muted}`,
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{
                      width: "44px", height: "44px", borderRadius: "12px", flexShrink: 0,
                      background: `${SESSION_COLORS[item.type] || C.muted}14`,
                      border: `1px solid ${SESSION_COLORS[item.type] || C.muted}25`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "1.3rem",
                    }}>
                      {SESSION_ICONS[item.type] || "📖"}
                    </div>
                    <div>
                      <div style={{ ...urdu, fontSize: "0.82rem", fontWeight: "700", color: C.text }}>
                        {item.lesson}
                      </div>
                      {item.surah && (
                        <div style={{ ...urdu, fontSize: "0.65rem", color: C.muted, marginTop: "2px" }}>
                          {item.surah}
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
                    <span style={{
                      fontSize: "0.6rem", padding: "2px 8px", borderRadius: "20px",
                      background: `${SESSION_COLORS[item.type] || C.muted}14`,
                      color: SESSION_COLORS[item.type] || C.muted,
                      border: `1px solid ${SESSION_COLORS[item.type] || C.muted}25`,
                    }}>
                      {SESSION_LABELS[item.type] || item.type}
                    </span>
                    <span style={{ fontSize: "0.6rem", color: C.muted }}>{item.session}</span>
                  </div>
                </div>
              ))}

              {/* Tip for today */}
              <div style={{
                ...glass, padding: "12px 14px",
                background: "rgba(27,67,50,0.15)",
                border: `1px solid rgba(74,222,128,0.1)`,
              }}>
                <div style={{ ...urdu, fontSize: "0.68rem", color: C.green }}>
                  💡 آج کا ہدف: {curriculum.daily_lines}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── WEEKLY SCHEDULE VIEW ── */}
      {viewMode === "week" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {DAYS_UR.map((dayLabel, dayIdx) => {
            const daySessions = curriculum.schedule.filter(s => s.day === dayIdx);
            const isToday = dayIdx === todayIdx;

            return (
              <div key={dayIdx} style={{
                ...glass, padding: "14px 16px",
                borderRight: isToday ? `3px solid ${C.green}` : `3px solid transparent`,
                background: isToday ? "rgba(74,222,128,0.04)" : C.card,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {isToday && (
                      <span style={{
                        fontSize: "0.58rem", padding: "2px 8px", borderRadius: "20px",
                        background: "rgba(74,222,128,0.1)", color: C.green,
                        border: "1px solid rgba(74,222,128,0.2)",
                      }}>
                        آج
                      </span>
                    )}
                    <span style={{ fontSize: "0.65rem", color: C.muted, direction: "ltr" }}>
                      {DAYS_EN[dayIdx]}
                    </span>
                  </div>
                  <div style={{ ...urdu, fontSize: "0.82rem", fontWeight: "700", color: isToday ? C.green : C.text }}>
                    {dayLabel}
                  </div>
                </div>

                {daySessions.length === 0 ? (
                  <div style={{ ...urdu, fontSize: "0.65rem", color: "rgba(255,255,255,0.15)" }}>
                    کوئی سرگرمی نہیں
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {daySessions.map((item, i) => (
                      <div key={i} style={{
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        padding: "8px 10px", borderRadius: "8px",
                        background: "rgba(255,255,255,0.025)",
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontSize: "0.9rem" }}>{SESSION_ICONS[item.type] || "📖"}</span>
                          <div>
                            <div style={{ ...urdu, fontSize: "0.72rem", color: C.text }}>{item.lesson}</div>
                            {item.surah && (
                              <div style={{ ...urdu, fontSize: "0.6rem", color: C.muted }}>{item.surah}</div>
                            )}
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                          <span style={{
                            fontSize: "0.58rem", padding: "2px 7px", borderRadius: "20px",
                            background: `${SESSION_COLORS[item.type] || C.muted}12`,
                            color: SESSION_COLORS[item.type] || C.muted,
                          }}>
                            {SESSION_LABELS[item.type]}
                          </span>
                          <span style={{ fontSize: "0.58rem", color: C.muted }}>{item.session}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── MILESTONES VIEW ── */}
      {viewMode === "milestones" && (
        <div>
          <div style={{ ...urdu, fontSize: "0.75rem", color: C.muted, marginBottom: "14px" }}>
            {selectedClass} — سنگ ہائے میل اور انعامات
          </div>

          {/* Milestone cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
            {curriculum.milestones.map((m, i) => (
              <div key={i} style={{
                ...glass, padding: "16px 18px",
                borderRight: `4px solid ${m.color}`,
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <div>
                  <div style={{ ...urdu, fontSize: "0.82rem", fontWeight: "700", color: m.color }}>
                    🏆 {m.reward}
                  </div>
                  <div style={{ ...urdu, fontSize: "0.65rem", color: C.muted, marginTop: "2px" }}>
                    انعام
                  </div>
                </div>
                <div style={{
                  padding: "8px 16px", borderRadius: "12px",
                  background: `${m.color}12`, border: `1px solid ${m.color}30`,
                  textAlign: "center",
                }}>
                  <div style={{ fontSize: "1.4rem", fontWeight: "900", color: m.color }}>
                    {m.para}
                  </div>
                  <div style={{ ...urdu, fontSize: "0.6rem", color: C.muted }}>پارے</div>
                </div>
              </div>
            ))}
          </div>

          {/* 30-para progress grid */}
          <div style={{ ...glass, padding: "16px", marginBottom: "16px" }}>
            <div style={{ ...urdu, fontSize: "0.72rem", color: C.muted, fontWeight: "700", marginBottom: "12px" }}>
              30 پاروں کا نقشہ
            </div>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(6, 1fr)",
              gap: "6px",
            }}>
              {Array.from({ length: 30 }, (_, i) => {
                const paraNum = i + 1;
                const achieved = curriculum.milestones.some(m => m.para >= paraNum);
                const milestone = curriculum.milestones.find(m => m.para === paraNum);
                return (
                  <div key={paraNum} style={{
                    aspectRatio: "1", borderRadius: "8px",
                    background: milestone
                      ? `${milestone.color}20`
                      : achieved
                        ? "rgba(74,222,128,0.08)"
                        : "rgba(255,255,255,0.03)",
                    border: `1px solid ${milestone
                      ? milestone.color + "40"
                      : achieved
                        ? "rgba(74,222,128,0.15)"
                        : C.border}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexDirection: "column", cursor: "default",
                    position: "relative",
                  }}>
                    {milestone && (
                      <div style={{
                        position: "absolute", top: "-4px", right: "-4px",
                        fontSize: "0.6rem",
                      }}>
                        🏆
                      </div>
                    )}
                    <div style={{
                      fontSize: "0.72rem", fontWeight: "700",
                      color: milestone ? milestone.color : achieved ? C.green : C.muted,
                    }}>
                      {paraNum}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dua for hifz */}
          <div style={{
            ...glass, padding: "16px", textAlign: "center",
            background: "rgba(212,175,55,0.04)",
            border: `1px solid rgba(212,175,55,0.12)`,
          }}>
            <div style={{ fontSize: "1.2rem", marginBottom: "6px" }}>📿</div>
            <div style={{ ...urdu, fontSize: "0.8rem", color: C.goldLight, fontWeight: "700", lineHeight: 2 }}>
              رَبِّ زِدْنِي عِلْمًا
            </div>
            <div style={{ fontSize: "0.62rem", color: C.muted, marginTop: "2px", direction: "ltr" }}>
              "My Lord, increase me in knowledge" — Taha 20:114
            </div>
          </div>
        </div>
      )}

      {/* Custom notes section (editable by madrasa/admin) */}
      {canEdit && (
        <div style={{ ...glass, padding: "16px", marginTop: "18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <div style={{ ...urdu, fontSize: "0.72rem", color: C.muted, fontWeight: "700" }}>
              استاد کے خصوصی نوٹس
            </div>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                style={{
                  padding: "5px 12px", borderRadius: "8px", border: `1px solid ${C.border}`,
                  background: "rgba(255,255,255,0.04)", color: C.muted,
                  cursor: "pointer", fontSize: "0.65rem", fontFamily: "inherit",
                }}
              >
                ✏️ ترمیم
              </button>
            ) : (
              <div style={{ display: "flex", gap: "6px" }}>
                <button
                  onClick={() => setEditing(false)}
                  style={{
                    padding: "5px 10px", borderRadius: "8px", border: `1px solid ${C.border}`,
                    background: "transparent", color: C.muted,
                    cursor: "pointer", fontSize: "0.65rem", fontFamily: "inherit",
                  }}
                >
                  منسوخ
                </button>
                <button
                  onClick={saveNotes}
                  disabled={saving}
                  style={{
                    padding: "5px 12px", borderRadius: "8px", border: "none",
                    background: `${C.primary}`, color: "#fff",
                    cursor: "pointer", fontSize: "0.65rem", fontFamily: "inherit",
                    opacity: saving ? 0.7 : 1,
                  }}
                >
                  {saving ? "..." : "محفوظ"}
                </button>
              </div>
            )}
          </div>

          {editing ? (
            <textarea
              value={editNotes}
              onChange={e => setEditNotes(e.target.value)}
              rows={4}
              placeholder="اس کلاس کے لیے خصوصی ہدایات، نوٹس، یا تبدیلیاں..."
              style={{
                width: "100%", padding: "10px 12px", borderRadius: "10px",
                background: "rgba(255,255,255,0.05)", border: `1px solid ${C.border}`,
                color: C.text, fontSize: "0.75rem", resize: "vertical",
                fontFamily: "'Noto Nastaliq Urdu','Segoe UI',sans-serif",
                direction: "rtl", boxSizing: "border-box", outline: "none",
              }}
            />
          ) : (
            <div style={{ ...urdu, fontSize: "0.75rem", color: editNotes ? C.text : C.muted, lineHeight: 1.8 }}>
              {editNotes || "کوئی خصوصی نوٹس نہیں۔ ترمیم بٹن دبائیں۔"}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
