/* eslint-disable */
import { useState, useEffect } from "react";
import { toast } from "../../components/ui/Toast";
import { supabase } from "../../supabase";

const C = {
  primary: "#1B4332",
  gold: "#B8860B",
  goldLight: "#D4AF37",
  bg: "#0a0f0d",
  card: "rgba(255,255,255,0.04)",
  border: "rgba(255,255,255,0.08)",
  text: "#e2e8f0",
  muted: "rgba(255,255,255,0.4)",
  green: "#4ade80",
  red: "#f87171",
  blue: "#60a5fa",
  purple: "#a78bfa",
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

const TABS = [
  { key: "ustad", labelUr: "استاد کی رپورٹ", labelEn: "Ustad Review" },
  { key: "parents", labelUr: "والدین کی رپورٹ", labelEn: "Parents Report" },
  { key: "student", labelUr: "طالب علم کا جائزہ", labelEn: "Student Self-Reflection" },
];

const QUALITY_OPTS = [
  { value: "excellent", label: "ممتاز", color: C.green },
  { value: "good", label: "اچھا", color: C.goldLight },
  { value: "average", label: "اوسط", color: C.blue },
  { value: "weak", label: "کمزور", color: C.red },
];

const RATING_STARS = [1, 2, 3, 4, 5];

function StarRating({ value, onChange, label }) {
  return (
    <div style={{ marginBottom: "14px" }}>
      {label && (
        <div style={{ ...urdu, fontSize: "0.75rem", color: C.muted, marginBottom: "6px" }}>
          {label}
        </div>
      )}
      <div style={{ display: "flex", gap: "6px" }}>
        {RATING_STARS.map(s => (
          <button
            key={s}
            onClick={() => onChange(s)}
            style={{
              width: "36px", height: "36px", borderRadius: "8px", border: "none",
              cursor: "pointer", fontSize: "1.1rem",
              background: s <= value ? "rgba(212,175,55,0.15)" : "rgba(255,255,255,0.04)",
              color: s <= value ? C.goldLight : "rgba(255,255,255,0.2)",
              transition: "all 0.15s",
            }}
          >
            ★
          </button>
        ))}
        {value > 0 && (
          <span style={{ fontSize: "0.7rem", color: C.muted, alignSelf: "center", marginRight: "6px" }}>
            {value}/5
          </span>
        )}
      </div>
    </div>
  );
}

function FormField({ label, children }) {
  return (
    <div style={{ marginBottom: "16px" }}>
      <div style={{ ...urdu, fontSize: "0.72rem", color: C.muted, marginBottom: "6px", fontWeight: "600" }}>
        {label}
      </div>
      {children}
    </div>
  );
}

function TextArea({ value, onChange, placeholder, rows = 3 }) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      style={{
        width: "100%", padding: "10px 12px", borderRadius: "10px",
        background: "rgba(255,255,255,0.05)", border: `1px solid ${C.border}`,
        color: C.text, fontSize: "0.78rem", resize: "vertical",
        fontFamily: "'Noto Nastaliq Urdu','Segoe UI',sans-serif",
        direction: "rtl", boxSizing: "border-box", outline: "none",
      }}
    />
  );
}

function TextInput({ value, onChange, placeholder }) {
  return (
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: "100%", padding: "10px 12px", borderRadius: "10px",
        background: "rgba(255,255,255,0.05)", border: `1px solid ${C.border}`,
        color: C.text, fontSize: "0.78rem",
        fontFamily: "'Noto Nastaliq Urdu','Segoe UI',sans-serif",
        direction: "rtl", boxSizing: "border-box", outline: "none",
      }}
    />
  );
}

// Returns ISO week string "YYYY-Www"
function getWeekStr(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const w1 = new Date(d.getFullYear(), 0, 4);
  const week = 1 + Math.round(((d - w1) / 86400000 - 3 + ((w1.getDay() + 6) % 7)) / 7);
  return `${d.getFullYear()}-W${String(week).padStart(2, "0")}`;
}

// Returns Monday and Sunday dates for a given "YYYY-Www" string
function getWeekBounds(weekStr) {
  const [yearStr, wPart] = weekStr.split("-W");
  const year = parseInt(yearStr);
  const w = parseInt(wPart);
  const jan4 = new Date(year, 0, 4);
  const dayOfWeek = (jan4.getDay() + 6) % 7;
  const monday = new Date(jan4);
  monday.setDate(jan4.getDate() - dayOfWeek + (w - 1) * 7);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return { monday, sunday };
}

export default function HifzWeeklyReport({ student, role, onClose }) {
  const [activeTab, setActiveTab] = useState("ustad");
  const [weekStr, setWeekStr] = useState(getWeekStr());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [weeklyLogs, setWeeklyLogs] = useState([]);

  // Ustad tab state
  const [ustadData, setUstadData] = useState({
    total_lines: "",
    avg_quality: "good",
    sabaq_days: "",
    manzil_done: false,
    dohrai_done: false,
    weak_ayat: "",
    improvement_areas: "",
    next_week_plan: "",
    weekly_rating: 0,
    ustad_weekly_comment: "",
    recommend_parent_meeting: false,
  });

  // Parents tab state
  const [parentData, setParentData] = useState({
    home_practice_rating: 0,
    home_practice_notes: "",
    recitation_accuracy: "good",
    parent_concerns: "",
    parent_suggestions: "",
    parent_rating: 0,
    parent_comment: "",
  });

  // Student self-reflection state
  const [studentData, setStudentData] = useState({
    best_ayat_today: "",
    what_i_learned: "",
    difficulties: "",
    proud_of: "",
    next_goal: "",
    student_experience: "",
    self_rating: 0,
  });

  useEffect(() => {
    if (student?.id) {
      fetchWeekData();
      fetchWeeklyLogs();
    }
  }, [student?.id, weekStr]);

  async function fetchWeekData() {
    setLoading(true);
    try {
      const { data } = await supabase
        .from("hifz_weekly_review")
        .select("*")
        .eq("student_id", student.id)
        .eq("week_str", weekStr)
        .maybeSingle();

      if (data) {
        setUstadData({
          total_lines: data.total_lines ?? "",
          avg_quality: data.avg_quality || "good",
          sabaq_days: data.sabaq_days ?? "",
          manzil_done: data.manzil_done || false,
          dohrai_done: data.dohrai_done || false,
          weak_ayat: data.weak_ayat || "",
          improvement_areas: data.improvement_areas || "",
          next_week_plan: data.next_week_plan || "",
          weekly_rating: data.weekly_rating || 0,
          ustad_weekly_comment: data.ustad_weekly_comment || "",
          recommend_parent_meeting: data.recommend_parent_meeting || false,
        });
        setParentData({
          home_practice_rating: data.home_practice_rating || 0,
          home_practice_notes: data.home_practice_notes || "",
          recitation_accuracy: data.recitation_accuracy || "good",
          parent_concerns: data.parent_concerns || "",
          parent_suggestions: data.parent_suggestions || "",
          parent_rating: data.parent_rating || 0,
          parent_comment: data.parent_comment || "",
        });
        setStudentData({
          best_ayat_today: data.best_ayat_today || "",
          what_i_learned: data.what_i_learned || "",
          difficulties: data.difficulties || "",
          proud_of: data.proud_of || "",
          next_goal: data.next_goal || "",
          student_experience: data.student_experience || "",
          self_rating: data.self_rating || 0,
        });
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  async function fetchWeeklyLogs() {
    if (!student?.id) return;
    try {
      const { monday, sunday } = getWeekBounds(weekStr);
      const fromDate = monday.toISOString().split("T")[0];
      const toDate = sunday.toISOString().split("T")[0];

      const { data } = await supabase
        .from("hifz_daily_log")
        .select("log_date,log_type,lines_count,quality,mistakes_count,ustad_rating,surah_name")
        .eq("student_id", student.id)
        .gte("log_date", fromDate)
        .lte("log_date", toDate)
        .order("log_date");

      const logs = data || [];
      setWeeklyLogs(logs);

      // Auto-populate ustad fields from logs
      const sabaqLogs = logs.filter(l => l.log_type === "sabaq");
      const totalLines = sabaqLogs.reduce((s, l) => s + (parseFloat(l.lines_count) || 0), 0);
      const qualityMap = { excellent: 0, good: 1, average: 2, weak: 3 };
      const qualityRevMap = ["excellent", "good", "average", "weak"];
      const avgQIdx = sabaqLogs.length
        ? Math.round(
            sabaqLogs.reduce((s, l) => s + (qualityMap[l.quality] ?? 1), 0) / sabaqLogs.length
          )
        : 1;

      setUstadData(prev => ({
        ...prev,
        total_lines: prev.total_lines || (totalLines > 0 ? totalLines.toFixed(1) : ""),
        avg_quality: prev.avg_quality || qualityRevMap[avgQIdx] || "good",
        sabaq_days: prev.sabaq_days || (sabaqLogs.length > 0 ? String(sabaqLogs.length) : ""),
        manzil_done: prev.manzil_done || logs.some(l => l.log_type === "manzil"),
        dohrai_done: prev.dohrai_done || logs.some(l => l.log_type === "dohrai_hafta"),
      }));
    } catch (e) {
      console.error(e);
    }
  }

  async function handleSave() {
    if (!student?.id) return;
    setSaving(true);
    try {
      const { monday, sunday } = getWeekBounds(weekStr);
      const payload = {
        student_id: student.id,
        student_name: student.name || student.nameUr,
        house_id: student.house_id,
        week_str: weekStr,
        week_from: monday.toISOString().split("T")[0],
        week_to: sunday.toISOString().split("T")[0],
        ...ustadData,
        ...parentData,
        ...studentData,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("hifz_weekly_review")
        .upsert(payload, { onConflict: "student_id,week_str" });

      if (error) throw error;
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      console.error(e);
      toast.warning("محفوظ کرنے میں خرابی: " + e.message);
    }
    setSaving(false);
  }

  const logsByDate = weeklyLogs.reduce((acc, l) => {
    if (!acc[l.log_date]) acc[l.log_date] = [];
    acc[l.log_date].push(l);
    return acc;
  }, {});

  const LOG_TYPE_LABELS = {
    sabaq: "سبق",
    manzil: "منزل",
    dohrai_hafta: "دہرائی",
    dohrai_mahina: "ماہانہ",
  };

  const LOG_TYPE_COLORS = {
    sabaq: C.green,
    manzil: C.goldLight,
    dohrai_hafta: C.blue,
    dohrai_mahina: C.purple,
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 2000, padding: "16px",
    }}>
      <div style={{
        ...glass,
        width: "100%", maxWidth: "680px",
        maxHeight: "90vh", overflowY: "auto",
        background: "#0f1a14",
      }}>
        {/* Sticky header */}
        <div style={{
          padding: "20px 24px 0",
          position: "sticky", top: 0, background: "#0f1a14", zIndex: 1,
          borderBottom: `1px solid ${C.border}`, paddingBottom: "16px",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ ...urdu, fontSize: "1.05rem", fontWeight: "800", color: C.goldLight }}>
                ہفتہ وار جائزہ رپورٹ
              </div>
              <div style={{ ...urdu, fontSize: "0.72rem", color: C.muted, marginTop: "2px" }}>
                {student?.nameUr || student?.name}
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                background: "rgba(255,255,255,0.06)", border: `1px solid ${C.border}`,
                borderRadius: "8px", padding: "6px 14px", color: C.muted,
                cursor: "pointer", fontSize: "0.75rem", fontFamily: "inherit",
              }}
            >
              ✕ بند
            </button>
          </div>

          {/* Week picker */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "14px" }}>
            <input
              type="week"
              value={weekStr}
              onChange={e => setWeekStr(e.target.value)}
              style={{
                padding: "6px 10px", borderRadius: "8px",
                background: "rgba(255,255,255,0.06)", border: `1px solid ${C.border}`,
                color: C.text, fontSize: "0.75rem", outline: "none", cursor: "pointer",
              }}
            />
            {weeklyLogs.length > 0 && (
              <span style={{
                fontSize: "0.62rem", padding: "2px 10px", borderRadius: "20px",
                background: "rgba(74,222,128,0.1)", color: C.green,
                border: "1px solid rgba(74,222,128,0.2)",
              }}>
                {weeklyLogs.length} اندراج
              </span>
            )}
          </div>

          {/* Tab bar */}
          <div style={{ display: "flex", gap: "6px", marginTop: "14px" }}>
            {TABS.map(t => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                style={{
                  flex: 1, padding: "9px 4px", borderRadius: "9px", border: "none",
                  cursor: "pointer", fontFamily: "inherit", fontSize: "0.68rem",
                  background: activeTab === t.key ? `${C.goldLight}14` : "rgba(255,255,255,0.04)",
                  color: activeTab === t.key ? C.goldLight : C.muted,
                  borderBottom: `2px solid ${activeTab === t.key ? C.goldLight : "transparent"}`,
                  transition: "all 0.15s",
                  ...urdu,
                }}
              >
                {t.labelUr}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        {loading ? (
          <div style={{ padding: "48px", textAlign: "center", color: C.muted }}>
            لوڈ ہو رہا ہے...
          </div>
        ) : (
          <div style={{ padding: "20px 24px 24px" }}>

            {/* ── USTAD TAB ── */}
            {activeTab === "ustad" && (
              <div>
                <div style={{ ...urdu, fontSize: "0.82rem", fontWeight: "700", color: C.goldLight, marginBottom: "16px" }}>
                  📚 استاد کا ہفتہ وار جائزہ
                </div>

                {/* Auto-summary from logs */}
                {Object.keys(logsByDate).length > 0 && (
                  <div style={{ ...glass, padding: "14px", marginBottom: "18px" }}>
                    <div style={{ ...urdu, fontSize: "0.65rem", color: C.muted, fontWeight: "700", marginBottom: "10px" }}>
                      اس ہفتے کی سرگرمیاں (خودکار)
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      {Object.entries(logsByDate).map(([day, logs]) => (
                        <div key={day} style={{
                          display: "flex", justifyContent: "space-between", alignItems: "center",
                          padding: "7px 10px", borderRadius: "8px",
                          background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}`,
                        }}>
                          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                            {logs.map((l, i) => (
                              <span key={i} style={{
                                fontSize: "0.6rem", padding: "2px 8px", borderRadius: "20px",
                                background: `${LOG_TYPE_COLORS[l.log_type] || C.muted}12`,
                                color: LOG_TYPE_COLORS[l.log_type] || C.muted,
                                border: `1px solid ${LOG_TYPE_COLORS[l.log_type] || C.muted}25`,
                              }}>
                                {LOG_TYPE_LABELS[l.log_type] || l.log_type}
                                {l.lines_count ? ` · ${l.lines_count}` : ""}
                              </span>
                            ))}
                          </div>
                          <div style={{ fontSize: "0.62rem", color: C.muted, direction: "ltr" }}>{day}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <FormField label="کل سطریں">
                    <TextInput
                      value={ustadData.total_lines}
                      onChange={v => setUstadData(p => ({ ...p, total_lines: v }))}
                      placeholder="مثلاً: 45.5"
                    />
                  </FormField>
                  <FormField label="سبق کے دن">
                    <TextInput
                      value={ustadData.sabaq_days}
                      onChange={v => setUstadData(p => ({ ...p, sabaq_days: v }))}
                      placeholder="مثلاً: 5"
                    />
                  </FormField>
                </div>

                <FormField label="اوسط معیار">
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {QUALITY_OPTS.map(q => (
                      <button
                        key={q.value}
                        onClick={() => setUstadData(p => ({ ...p, avg_quality: q.value }))}
                        style={{
                          padding: "7px 14px", borderRadius: "20px", border: "none",
                          cursor: "pointer", fontFamily: "inherit", fontSize: "0.72rem",
                          background: ustadData.avg_quality === q.value ? `${q.color}16` : "rgba(255,255,255,0.04)",
                          color: ustadData.avg_quality === q.value ? q.color : C.muted,
                          border: `1px solid ${ustadData.avg_quality === q.value ? q.color + "40" : C.border}`,
                          ...urdu,
                        }}
                      >
                        {q.label}
                      </button>
                    ))}
                  </div>
                </FormField>

                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "16px" }}>
                  {[
                    { key: "manzil_done", label: "منزل مکمل" },
                    { key: "dohrai_done", label: "دہرائی مکمل" },
                    { key: "recommend_parent_meeting", label: "والدین ملاقات ضروری", warn: true },
                  ].map(item => (
                    <label key={item.key} style={{
                      display: "flex", alignItems: "center", gap: "8px", cursor: "pointer",
                      padding: "8px 12px", borderRadius: "10px",
                      background: ustadData[item.key]
                        ? (item.warn ? "rgba(248,113,113,0.08)" : "rgba(74,222,128,0.08)")
                        : "rgba(255,255,255,0.03)",
                      border: `1px solid ${ustadData[item.key]
                        ? (item.warn ? "rgba(248,113,113,0.2)" : "rgba(74,222,128,0.2)")
                        : C.border}`,
                    }}>
                      <input
                        type="checkbox"
                        checked={!!ustadData[item.key]}
                        onChange={e => setUstadData(p => ({ ...p, [item.key]: e.target.checked }))}
                        style={{ accentColor: item.warn ? C.red : C.green, width: "15px", height: "15px" }}
                      />
                      <span style={{
                        ...urdu, fontSize: "0.7rem",
                        color: ustadData[item.key] ? (item.warn ? C.red : C.green) : C.muted,
                      }}>
                        {item.label}
                      </span>
                    </label>
                  ))}
                </div>

                <FormField label="کمزور آیات / مقامات">
                  <TextArea
                    value={ustadData.weak_ayat}
                    onChange={v => setUstadData(p => ({ ...p, weak_ayat: v }))}
                    placeholder="جن آیات میں غلطی یا کمزوری ہے..."
                    rows={2}
                  />
                </FormField>

                <FormField label="بہتری کے شعبے">
                  <TextArea
                    value={ustadData.improvement_areas}
                    onChange={v => setUstadData(p => ({ ...p, improvement_areas: v }))}
                    placeholder="تجوید، روانی، یاد — کیا بہتر کرنا ہے..."
                    rows={2}
                  />
                </FormField>

                <FormField label="اگلے ہفتے کا منصوبہ">
                  <TextArea
                    value={ustadData.next_week_plan}
                    onChange={v => setUstadData(p => ({ ...p, next_week_plan: v }))}
                    placeholder="اگلے ہفتے کا سبق اور دہرائی کا منصوبہ..."
                    rows={2}
                  />
                </FormField>

                <StarRating
                  value={ustadData.weekly_rating}
                  onChange={v => setUstadData(p => ({ ...p, weekly_rating: v }))}
                  label="ہفتہ وار مجموعی ریٹنگ"
                />

                <FormField label="استاد کا تبصرہ">
                  <TextArea
                    value={ustadData.ustad_weekly_comment}
                    onChange={v => setUstadData(p => ({ ...p, ustad_weekly_comment: v }))}
                    placeholder="اس ہفتے کی مجموعی کارکردگی پر تبصرہ..."
                    rows={3}
                  />
                </FormField>
              </div>
            )}

            {/* ── PARENTS TAB ── */}
            {activeTab === "parents" && (
              <div>
                <div style={{ ...urdu, fontSize: "0.82rem", fontWeight: "700", color: C.goldLight, marginBottom: "16px" }}>
                  👨‍👩‍👦 والدین کی رپورٹ
                </div>

                <div style={{
                  ...glass, padding: "14px", marginBottom: "18px",
                  borderRight: `3px solid ${C.goldLight}`,
                }}>
                  <div style={{ ...urdu, fontSize: "0.72rem", color: C.muted, lineHeight: 1.8 }}>
                    یہ حصہ والدین گھر پر بچے کا مشاہدہ کر کے بھریں۔
                    گھر پر مشق اور تلاوت کے بارے میں معلومات دیں۔
                  </div>
                </div>

                <StarRating
                  value={parentData.home_practice_rating}
                  onChange={v => setParentData(p => ({ ...p, home_practice_rating: v }))}
                  label="گھر پر مشق کی ریٹنگ"
                />

                <FormField label="گھر پر مشق کا حال">
                  <TextArea
                    value={parentData.home_practice_notes}
                    onChange={v => setParentData(p => ({ ...p, home_practice_notes: v }))}
                    placeholder="بچہ گھر پر کتنا وقت دیتا ہے، روزانہ کیا کرتا ہے..."
                    rows={2}
                  />
                </FormField>

                <FormField label="تلاوت کا معیار (گھر پر)">
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {QUALITY_OPTS.map(q => (
                      <button
                        key={q.value}
                        onClick={() => setParentData(p => ({ ...p, recitation_accuracy: q.value }))}
                        style={{
                          padding: "7px 14px", borderRadius: "20px", border: "none",
                          cursor: "pointer", fontFamily: "inherit", fontSize: "0.72rem",
                          background: parentData.recitation_accuracy === q.value ? `${q.color}16` : "rgba(255,255,255,0.04)",
                          color: parentData.recitation_accuracy === q.value ? q.color : C.muted,
                          border: `1px solid ${parentData.recitation_accuracy === q.value ? q.color + "40" : C.border}`,
                          ...urdu,
                        }}
                      >
                        {q.label}
                      </button>
                    ))}
                  </div>
                </FormField>

                <FormField label="والدین کے خدشات">
                  <TextArea
                    value={parentData.parent_concerns}
                    onChange={v => setParentData(p => ({ ...p, parent_concerns: v }))}
                    placeholder="کوئی پریشانی یا خدشہ ہو تو بیان کریں..."
                    rows={2}
                  />
                </FormField>

                <FormField label="والدین کی تجاویز">
                  <TextArea
                    value={parentData.parent_suggestions}
                    onChange={v => setParentData(p => ({ ...p, parent_suggestions: v }))}
                    placeholder="استاد یا ادارے کے لیے کوئی تجویز..."
                    rows={2}
                  />
                </FormField>

                <StarRating
                  value={parentData.parent_rating}
                  onChange={v => setParentData(p => ({ ...p, parent_rating: v }))}
                  label="والدین کی طرف سے مجموعی ریٹنگ"
                />

                <FormField label="والدین کا تبصرہ">
                  <TextArea
                    value={parentData.parent_comment}
                    onChange={v => setParentData(p => ({ ...p, parent_comment: v }))}
                    placeholder="اس ہفتے بچے کی گھر میں کارکردگی..."
                    rows={3}
                  />
                </FormField>
              </div>
            )}

            {/* ── STUDENT SELF-REFLECTION TAB ── */}
            {activeTab === "student" && (
              <div>
                <div style={{ ...urdu, fontSize: "0.82rem", fontWeight: "700", color: C.goldLight, marginBottom: "16px" }}>
                  🌟 طالب علم کا خود جائزہ
                </div>

                <div style={{
                  ...glass, padding: "14px", marginBottom: "18px",
                  borderRight: `3px solid ${C.purple}`,
                }}>
                  <div style={{ ...urdu, fontSize: "0.72rem", color: C.muted, lineHeight: 1.8 }}>
                    یہ حصہ طالب علم خود سوچ کر بھرے۔ ایمانداری سے اپنے بارے میں لکھیں۔
                  </div>
                </div>

                <FormField label="اس ہفتے کی بہترین آیت">
                  <TextInput
                    value={studentData.best_ayat_today}
                    onChange={v => setStudentData(p => ({ ...p, best_ayat_today: v }))}
                    placeholder="کونسی آیت سب سے اچھی یاد ہوئی..."
                  />
                </FormField>

                <FormField label="اس ہفتے کیا سیکھا؟">
                  <TextArea
                    value={studentData.what_i_learned}
                    onChange={v => setStudentData(p => ({ ...p, what_i_learned: v }))}
                    placeholder="نئی چیز جو سیکھی — تجوید، معنی، یا کوئی اور..."
                    rows={2}
                  />
                </FormField>

                <FormField label="کیا مشکل لگا؟">
                  <TextArea
                    value={studentData.difficulties}
                    onChange={v => setStudentData(p => ({ ...p, difficulties: v }))}
                    placeholder="کونسی آیت یا مقام مشکل تھا..."
                    rows={2}
                  />
                </FormField>

                <FormField label="کس چیز پر فخر ہے؟">
                  <TextArea
                    value={studentData.proud_of}
                    onChange={v => setStudentData(p => ({ ...p, proud_of: v }))}
                    placeholder="اس ہفتے کی کوئی خاص کامیابی..."
                    rows={2}
                  />
                </FormField>

                <FormField label="اگلے ہفتے کا ہدف">
                  <TextInput
                    value={studentData.next_goal}
                    onChange={v => setStudentData(p => ({ ...p, next_goal: v }))}
                    placeholder="اگلے ہفتے کیا حاصل کرنا چاہتے ہیں..."
                  />
                </FormField>

                <FormField label="مجموعی تجربہ">
                  <TextArea
                    value={studentData.student_experience}
                    onChange={v => setStudentData(p => ({ ...p, student_experience: v }))}
                    placeholder="اس ہفتے کے بارے میں مجموعی احساس..."
                    rows={2}
                  />
                </FormField>

                <StarRating
                  value={studentData.self_rating}
                  onChange={v => setStudentData(p => ({ ...p, self_rating: v }))}
                  label="اپنے آپ کو ریٹنگ دیں"
                />

                {/* Motivational ayah */}
                <div style={{
                  ...glass, padding: "16px", marginTop: "8px", textAlign: "center",
                  background: "rgba(167,139,250,0.05)",
                  border: `1px solid rgba(167,139,250,0.15)`,
                }}>
                  <div style={{ fontSize: "1.4rem", marginBottom: "6px" }}>🤲</div>
                  <div style={{ ...urdu, fontSize: "0.85rem", color: C.purple, fontWeight: "700", lineHeight: 1.8 }}>
                    وَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ
                  </div>
                  <div style={{ fontSize: "0.62rem", color: C.muted, marginTop: "4px", direction: "ltr" }}>
                    "And We have certainly made the Quran easy for remembrance" — Al-Qamar 54:17
                  </div>
                </div>
              </div>
            )}

            {/* Save / Cancel */}
            <div style={{ marginTop: "22px", display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button
                onClick={onClose}
                style={{
                  padding: "10px 20px", borderRadius: "10px", border: `1px solid ${C.border}`,
                  background: "transparent", color: C.muted, cursor: "pointer",
                  fontFamily: "inherit", fontSize: "0.75rem",
                }}
              >
                منسوخ
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  padding: "10px 28px", borderRadius: "10px", border: "none",
                  background: saved
                    ? "rgba(74,222,128,0.15)"
                    : `linear-gradient(135deg,${C.primary},#2d6a4f)`,
                  color: saved ? C.green : "#fff",
                  border: `1px solid ${saved ? "rgba(74,222,128,0.3)" : "transparent"}`,
                  cursor: saving ? "default" : "pointer",
                  fontFamily: "inherit", fontSize: "0.75rem", fontWeight: "700",
                  opacity: saving ? 0.7 : 1, transition: "all 0.2s",
                  ...urdu,
                }}
              >
                {saving ? "محفوظ ہو رہا ہے..." : saved ? "✓ محفوظ ہو گیا" : "💾 محفوظ کریں"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
