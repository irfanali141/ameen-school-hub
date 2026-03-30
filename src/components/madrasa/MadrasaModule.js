/* eslint-disable */
import { useState, useEffect } from "react";
import { supabase } from "../../supabase";

// Sub-modules
import HifzDashboard     from "./HifzDashboard";
import MadrasaUstad      from "./MadrasaUstad";
import MadrasaHub        from "./MadrasaHub";
import WifaqCompliance   from "./WifaqCompliance";

// ── Design tokens ────────────────────────────────────────────────────────────
const G   = "#d4af37";
const N   = "#0f172a";
const N2  = "#1e293b";
const glass = {
  background: "rgba(255,255,255,0.07)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: "16px",
};

// ── Module tabs ───────────────────────────────────────────────────────────────
const TABS = [
  { id: "overview", icon: "📊", urdu: "مرکزی جائزہ",    en: "Overview"        },
  { id: "hifz",     icon: "📖", urdu: "حفظ",            en: "Hifz Dashboard"  },
  { id: "ustad",    icon: "👨‍🏫", urdu: "استاد پورٹل",   en: "Ustad Portal"    },
  { id: "dars",     icon: "🕌", urdu: "درس نظامی",      en: "Dars-e-Nizami"   },
  { id: "wifaq",    icon: "✅", urdu: "وفاق",           en: "Wifaq Compliance" },
];

// ── Overview Dashboard ────────────────────────────────────────────────────────
function OverviewDashboard({ students = [], hifzLogs = [], setTab }) {
  const [stats, setStats] = useState({
    totalStudents: 0,
    huffaz: 0,
    namazToday: 0,
    activeSabaqs: 0,
    wifaqSubjects: 0,
    wifaqAvgPct: 0,
    tajweedThisMonth: 0,
    pendingNoms: 0,
  });
  const [recentLogs, setRecentLogs] = useState([]);

  useEffect(() => {
    loadStats();
  }, [students, hifzLogs]);

  const loadStats = async () => {
    try {
      const today     = new Date().toISOString().slice(0, 10);
      const thisMonth = new Date().toISOString().slice(0, 7);
      const [m, y]    = thisMonth.split("-").map(Number);

      const [namazRes, streakRes, wifaqRes, tajweedRes, nomRes, hifzProgRes] = await Promise.all([
        supabase.from("namaz_attendance").select("student_id", { count: "exact", head: true }).eq("date", today),
        supabase.from("sabaq_streaks").select("student_id", { count: "exact", head: true }).gt("current_streak", 0),
        supabase.from("wifaq_compliance").select("syllabus_completed,total_syllabus"),
        supabase.from("tajweed_assessments").select("student_id", { count: "exact", head: true }).eq("month", m).eq("year", y),
        supabase.from("award_nominations").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("hifz_progress").select("student_id", { count: "exact", head: true }).eq("ustad_verified", true),
      ]);

      const wRows     = wifaqRes.data || [];
      const wifaqAvg  = wRows.length
        ? Math.round(wRows.reduce((s, r) => s + Math.round(((r.syllabus_completed||0) / (r.total_syllabus||100)) * 100), 0) / wRows.length)
        : 0;

      // recent hifz logs
      const { data: rl } = await supabase
        .from("hifz_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(6);

      setRecentLogs(rl || []);
      setStats({
        totalStudents: students.length,
        huffaz:        hifzProgRes.count || 0,
        namazToday:    namazRes.count    || 0,
        activeSabaqs:  streakRes.count   || 0,
        wifaqSubjects: wRows.length,
        wifaqAvgPct:   wifaqAvg,
        tajweedThisMonth: tajweedRes.count || 0,
        pendingNoms:   nomRes.count      || 0,
      });
    } catch (e) {
      console.error("MadrasaModule overview stats:", e.message);
    }
  };

  const statCards = [
    { label: "کل طلبہ",         labelEn: "Total Students",     value: stats.totalStudents, icon: "🎓", color: "#60a5fa" },
    { label: "حفاظ",            labelEn: "Huffaz (Verified)",  value: stats.huffaz,        icon: "📖", color: "#4ade80" },
    { label: "آج نماز حاضری",   labelEn: "Namaz Today",        value: stats.namazToday,    icon: "🕌", color: G        },
    { label: "فعال سبق chains", labelEn: "Active Streaks",     value: stats.activeSabaqs,  icon: "🔥", color: "#fb923c" },
    { label: "وفاق مضامین",     labelEn: "Wifaq Subjects",     value: stats.wifaqSubjects, icon: "✅", color: "#a78bfa" },
    { label: "وفاق تکمیل",      labelEn: "Wifaq Completion",   value: `${stats.wifaqAvgPct}%`, icon: "📊", color: "#f472b6" },
    { label: "تجوید اس ماہ",    labelEn: "Tajweed This Month", value: stats.tajweedThisMonth, icon: "🎙️", color: "#34d399" },
    { label: "Pending انعامات", labelEn: "Pending Awards",     value: stats.pendingNoms,   icon: "🏆", color: "#fbbf24" },
  ];

  const quickLinks = [
    { tab: "hifz",  icon: "📖", title: "حفظ درج کریں",    sub: "روزانہ سبق اندراج"      },
    { tab: "ustad", icon: "🕌", title: "نماز حاضری",      sub: "پانچ وقت حاضری"         },
    { tab: "ustad", icon: "📚", title: "سبق ٹریکر",       sub: "سبق chain اپڈیٹ"        },
    { tab: "ustad", icon: "🎙️", title: "تجوید تشخیص",    sub: "ماہانہ تجوید نمبر"      },
    { tab: "dars",  icon: "🕌", title: "نیا مضمون",       sub: "درس نظامی مضمون شامل"  },
    { tab: "wifaq", icon: "✅", title: "وفاق تکمیل",      sub: "نصاب مکمل کریں"         },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ margin: 0, fontSize: "1.3rem", fontWeight: "900", color: "#f1f5f9",
          fontFamily: "'Noto Nastaliq Urdu', serif", direction: "rtl" }}>
          مدرسہ نظام — مرکزی جائزہ
        </h2>
        <p style={{ margin: "4px 0 0", fontSize: "0.7rem", color: `rgba(212,175,55,0.65)` }}>
          Madrasa Management System • Complete Islamic Education Overview
        </p>
      </div>

      {/* Stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: "12px", marginBottom: "28px" }}>
        {statCards.map(c => (
          <div key={c.labelEn} style={{ ...glass, padding: "18px", textAlign: "center",
            borderTop: `3px solid ${c.color}35` }}>
            <div style={{ fontSize: "1.6rem", marginBottom: "6px" }}>{c.icon}</div>
            <div style={{ fontSize: "1.9rem", fontWeight: "900", color: c.color, lineHeight: 1 }}>{c.value}</div>
            <div style={{ fontSize: "0.62rem", color: "rgba(255,255,255,0.55)", marginTop: "5px",
              fontFamily: "'Noto Nastaliq Urdu', serif", direction: "rtl" }}>{c.label}</div>
            <div style={{ fontSize: "0.52rem", color: "rgba(255,255,255,0.25)", marginTop: "2px" }}>{c.labelEn}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div style={{ ...glass, padding: "20px", marginBottom: "24px", borderRight: `3px solid ${G}` }}>
        <div style={{ fontSize: "0.62rem", color: `rgba(212,175,55,0.7)`, fontWeight: "700",
          letterSpacing: "0.08em", marginBottom: "14px" }}>
          QUICK ACTIONS — فوری اقدامات
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: "10px" }}>
          {quickLinks.map((q, i) => (
            <button key={i} onClick={() => setTab(q.tab)}
              style={{ ...glass, padding: "14px 16px", textAlign: "right", border: "1px solid rgba(255,255,255,0.08)",
                cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
                display: "flex", alignItems: "center", gap: "12px", background: "rgba(255,255,255,0.04)" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", flexShrink: 0,
                background: `linear-gradient(135deg,${G},#b8960a)`,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem" }}>
                {q.icon}
              </div>
              <div style={{ textAlign: "right", flex: 1 }}>
                <div style={{ fontSize: "0.78rem", fontWeight: "700", color: "#f1f5f9",
                  fontFamily: "'Noto Nastaliq Urdu', serif", direction: "rtl" }}>{q.title}</div>
                <div style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.35)", direction: "rtl",
                  fontFamily: "'Noto Nastaliq Urdu', serif" }}>{q.sub}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent hifz activity */}
      <div style={{ ...glass, overflow: "hidden" }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(255,255,255,0.07)",
          display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: "0.7rem", fontWeight: "700", color: G }}>📖 حالیہ حفظ اندراجات</div>
          <button onClick={() => setTab("hifz")}
            style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.4)", background: "none", border: "none",
              cursor: "pointer", fontFamily: "inherit" }}>
            سب دیکھیں →
          </button>
        </div>
        {recentLogs.length === 0 ? (
          <div style={{ padding: "32px", textAlign: "center", color: "rgba(255,255,255,0.25)", fontSize: "0.72rem" }}>
            ابھی تک کوئی اندراج نہیں
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.03)" }}>
                  {["طالب علم", "پارہ", "آیات", "معیار", "تاریخ"].map(h => (
                    <th key={h} style={{ padding: "10px 14px", textAlign: "right", fontSize: "0.62rem",
                      color: `rgba(212,175,55,0.7)`, fontWeight: "700",
                      fontFamily: "'Noto Nastaliq Urdu', serif", direction: "rtl" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentLogs.map((l, i) => (
                  <tr key={l.id || i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)",
                    background: i % 2 === 0 ? "rgba(255,255,255,0.01)" : "transparent" }}>
                    <td style={{ padding: "10px 14px", fontSize: "0.75rem", fontWeight: "600", color: "#f1f5f9",
                      textAlign: "right", fontFamily: "'Noto Nastaliq Urdu', serif", direction: "rtl" }}>
                      {l.student_name || l.studentName || "—"}
                    </td>
                    <td style={{ padding: "10px 14px", fontSize: "0.72rem", color: "rgba(255,255,255,0.6)", textAlign: "right" }}>
                      {l.para || l.surah || "—"}
                    </td>
                    <td style={{ padding: "10px 14px", fontSize: "0.72rem", color: G, fontWeight: "700", textAlign: "right" }}>
                      {l.ayaat || l.verses || "—"}
                    </td>
                    <td style={{ padding: "10px 14px", textAlign: "right" }}>
                      <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "0.6rem", fontWeight: "700",
                        background: l.rating >= 4 ? "rgba(74,222,128,0.15)" : l.rating >= 3 ? "rgba(212,175,55,0.15)" : "rgba(248,113,113,0.12)",
                        color:       l.rating >= 4 ? "#4ade80"               : l.rating >= 3 ? G                        : "#f87171" }}>
                        {l.rating === 4 ? "ممتاز" : l.rating === 3 ? "اچھا" : l.rating === 2 ? "مناسب" : l.grade || "—"}
                      </span>
                    </td>
                    <td style={{ padding: "10px 14px", fontSize: "0.62rem", color: "rgba(255,255,255,0.3)", textAlign: "right" }}>
                      {l.created_at ? new Date(l.created_at).toLocaleDateString("en-PK") : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main MadrasaModule ────────────────────────────────────────────────────────
export default function MadrasaModule({ students = [], hifzLogs = [], userRole = "madrasa", addData }) {
  const [tab, setTab] = useState("overview");

  const activeTab = TABS.find(t => t.id === tab) || TABS[0];

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg,#0f172a 0%,#0d1f3c 50%,#0a1628 100%)",
      fontFamily: "'Public Sans','DM Sans',sans-serif",
      direction: "ltr",
    }}>

      {/* ── Module Header ──────────────────────────────────────────────────── */}
      <div style={{
        background: "rgba(0,0,0,0.35)",
        borderBottom: "1px solid rgba(212,175,55,0.15)",
        padding: "16px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "12px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{
            width: "48px", height: "48px", borderRadius: "14px",
            background: `linear-gradient(135deg,${G},#b8960a)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: `0 4px 24px rgba(212,175,55,0.35)`,
            fontSize: "1.6rem", flexShrink: 0,
          }}>
            🕌
          </div>
          <div>
            <div style={{ fontSize: "1.35rem", fontWeight: "900", color: "#f1f5f9",
              fontFamily: "'Noto Nastaliq Urdu', serif", direction: "rtl" }}>
              مدرسہ نظام
            </div>
            <div style={{ fontSize: "0.68rem", color: `rgba(212,175,55,0.65)`, fontWeight: "500" }}>
              Complete Islamic Education Management
            </div>
          </div>
        </div>

        {/* Section breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px",
          background: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.2)",
          borderRadius: "10px", padding: "8px 16px" }}>
          <span style={{ fontSize: "1rem" }}>{activeTab.icon}</span>
          <div>
            <div style={{ fontSize: "0.75rem", fontWeight: "700", color: G }}>{activeTab.en}</div>
            <div style={{ fontSize: "0.58rem", color: "rgba(255,255,255,0.35)",
              fontFamily: "'Noto Nastaliq Urdu', serif", direction: "rtl" }}>{activeTab.urdu}</div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", height: "calc(100vh - 100px)" }}>

        {/* ── Left Tab Sidebar ──────────────────────────────────────────────── */}
        <div style={{
          width: "200px",
          minWidth: "200px",
          background: "rgba(0,0,0,0.25)",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          padding: "12px 8px",
          overflowY: "auto",
          flexShrink: 0,
        }}>
          {TABS.map(t => {
            const isActive = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "11px 12px",
                  marginBottom: "3px",
                  borderRadius: "10px",
                  border: "none",
                  background: isActive ? `rgba(212,175,55,0.15)` : "transparent",
                  color: isActive ? G : "rgba(255,255,255,0.5)",
                  fontWeight: isActive ? "700" : "400",
                  fontSize: "0.75rem",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  textAlign: "left",
                  borderLeft: isActive ? `3px solid ${G}` : "3px solid transparent",
                  transition: "all 0.14s",
                }}>
                <span style={{ fontSize: "1rem", flexShrink: 0 }}>{t.icon}</span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.en}</div>
                  <div style={{
                    fontSize: "0.58rem",
                    color: isActive ? `rgba(212,175,55,0.6)` : "rgba(255,255,255,0.22)",
                    fontFamily: "'Noto Nastaliq Urdu', serif",
                    direction: "rtl",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}>{t.urdu}</div>
                </div>
              </button>
            );
          })}

          {/* Version / info */}
          <div style={{ marginTop: "20px", padding: "10px 12px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ fontSize: "0.55rem", color: "rgba(255,255,255,0.2)", lineHeight: 1.6 }}>
              Ameen Islamic Institute<br/>
              Madrasa Management v2.0
            </div>
          </div>
        </div>

        {/* ── Content Area ─────────────────────────────────────────────────── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>

          {tab === "overview" && (
            <OverviewDashboard
              students={students}
              hifzLogs={hifzLogs}
              setTab={setTab}
            />
          )}

          {tab === "hifz" && (
            <HifzDashboard
              students={students}
              userRole={userRole}
              addData={addData}
            />
          )}

          {tab === "ustad" && (
            <MadrasaUstad
              students={students}
              hifzLogs={hifzLogs}
              userRole={userRole}
              addData={addData}
            />
          )}

          {tab === "dars" && (
            <MadrasaHub
              students={students}
              addData={addData}
            />
          )}

          {tab === "wifaq" && (
            <WifaqCompliance
              addData={addData}
            />
          )}

        </div>
      </div>
    </div>
  );
}
