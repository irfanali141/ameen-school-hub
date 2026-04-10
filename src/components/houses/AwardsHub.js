/* eslint-disable */
import { useState, useEffect } from "react";
import { HOUSES } from "../../constants";
import { supabase } from "../../supabase";
import AwardCard from "./AwardCard";
import NominationForm from "./NominationForm";

const G = "#d4af37";
const N = "#0f172a";
const N2 = "#1e293b";
const glass = {
  background: "rgba(255,255,255,0.06)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "16px",
};

// ── Award definitions per period ──────────────────────────────────────────────
const WEEKLY_AWARDS = [
  // star_of_week: auto calculates TOP HOUSE, but HM must nominate the individual student
  // from that house. auto:false so Nominate button shows for individual selection.
  { key: "star_of_week",     titleUr: "Star of the Week",        titleEn: "Star of the Week",      icon: "⭐", auto: false, basis: "HM nominates best student from top-scoring house" },
  { key: "safai_champion",   titleUr: "Cleanliness Champion",       titleEn: "Cleanliness Champion",   icon: "🧹", auto: true,  basis: "best safai sub-score" },
  { key: "best_discipline",  titleUr: "Best Discipline",    titleEn: "Best Discipline",        icon: "⚔️", auto: true,  basis: "highest discipline avg" },
];

const MONTHLY_AWARDS = [
  { key: "most_improved",    titleUr: "Most Improved",    titleEn: "Most Improved",          icon: "📈", auto: true,  basis: "biggest score jump vs last month" },
  { key: "haziri_100",       titleUr: "100% Attendance",          titleEn: "100% Attendance",        icon: "✅", auto: true,  basis: "zero absent in month" },
  { key: "akhlaq_month",     titleUr: "Akhlaq Champion",        titleEn: "Akhlaq Champion",        icon: "💎", auto: false, basis: "manual nomination" },
];

const TERM_AWARDS = [
  { key: "top_house_term",   titleUr: "Best House (Term)",  titleEn: "Best House of Term",     icon: "🏠", auto: true,  basis: "highest HVS avg for term" },
  { key: "academic_term",    titleUr: "Best Academic Student", titleEn: "Best Academic Student", icon: "📚", auto: false, basis: "manual nomination" },
  { key: "sports_term",      titleUr: "Best Sportsman",       titleEn: "Best Sportsman",         icon: "⚽", auto: false, basis: "manual nomination" },
];

const ANNUAL_AWARDS = [
  { key: "superhouse_year",  titleUr: "Super House of the Year",    titleEn: "Super House of the Year", icon: "🏆", auto: true,  basis: "highest 400-mark total" },
  { key: "stoy",             titleUr: "Student of the Year", titleEn: "Student of the Year",     icon: "🌟", auto: false, basis: "manual nomination" },
  { key: "best_teacher",     titleUr: "Best Teacher",         titleEn: "Best Teacher",            icon: "👨‍🏫", auto: false, basis: "manual nomination" },
  { key: "best_reader",      titleUr: "Best Reader",           titleEn: "Best Reader",             icon: "📗", auto: false, basis: "manual nomination" },
];

const DINI_AWARDS = [
  { key: "hafiz",            titleUr: "Hafiz Award",           titleEn: "Hafiz Award",             icon: "📖", auto: true,  basis: "hifz_progress manzil = 100%" },
  { key: "namaz_star",       titleUr: "Namaz Star",            titleEn: "Namaz Star",              icon: "🕌", auto: true,  basis: "100% namaz attendance" },
  { key: "sabaq_streak",     titleUr: "Sabaq Streak",            titleEn: "Sabaq Streak Champion",   icon: "🔥", auto: true,  basis: "longest sabaq streak" },
  { key: "dini_akhlaq",      titleUr: "Dini Akhlaq",            titleEn: "Dini Akhlaq Award",        icon: "🕊️", auto: false, basis: "manual nomination" },
];

// ── Role visibility ────────────────────────────────────────────────────────────
const CAN_NOMINATE  = ["director", "housemaster", "teacher", "madrasa"];
const CAN_APPROVE   = ["director"];
const CAN_SEE_HIST  = ["director", "admin", "housemaster", "teacher", "madrasa"];

export default function AwardsHub({ role, students = [], hvsLogs = [], hifzLogs = [] }) {
  const [activeTab, setActiveTab] = useState("weekly");
  const [winners, setWinners]     = useState([]);
  const [nominations, setNominations] = useState([]);
  const [loading, setLoading]     = useState(false);
  const [showNomForm, setShowNomForm] = useState(false);
  const [selectedAward, setSelectedAward] = useState(null);
  const [certStudent, setCertStudent] = useState(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const [monthOffset, setMonthOffset] = useState(0);

  // ── Fetch DB data ──────────────────────────────────────────────────────────
  useEffect(() => {
    loadWinners();
    loadNominations();
  }, []);

  const loadWinners = async () => {
    setLoading(true);
    try {
      const { data } = await supabase.from("award_winners").select("*").order("created_at", { ascending: false });
      setWinners(data || []);
    } catch (e) { console.error("award_winners:", e.message); }
    setLoading(false);
  };

  const loadNominations = async () => {
    try {
      const { data } = await supabase.from("award_nominations").select("*").order("created_at", { ascending: false });
      setNominations(data || []);
    } catch (e) { console.error("award_nominations:", e.message); }
  };

  // ── Auto-calculate: Star of Week ──────────────────────────────────────────
  const getStarOfWeek = () => {
    const now = new Date();
    const weekAgo = new Date(now - (weekOffset + 1) * 7 * 86400000);
    const weekStart = new Date(now - weekOffset * 7 * 86400000);
    const weekLogs = hvsLogs.filter(l => {
      const d = new Date(l.created_at || 0);
      return d >= weekAgo && d < weekStart;
    });
    const ranked = HOUSES.map(h => {
      const logs = weekLogs.filter(l => (l.houseId || l.house_id) === h.id);
      const avg = logs.length ? Math.round(logs.reduce((s, l) => s + (l.totalScore || 0), 0) / logs.length) : 0;
      return { ...h, avg };
    }).sort((a, b) => b.avg - a.avg);
    return ranked[0] || null;
  };

  // ── Auto-calculate: Safai Champion ────────────────────────────────────────
  const getSafaiChampion = () => {
    const ranked = HOUSES.map(h => {
      const logs = hvsLogs.filter(l => (l.houseId || l.house_id) === h.id);
      const avg = logs.length
        ? Math.round(logs.reduce((s, l) => s + (l.scores?.cleanliness || l.subScores?.cleanliness?.total || 0), 0) / logs.length)
        : 0;
      return { ...h, avg };
    }).sort((a, b) => b.avg - a.avg);
    return ranked[0] || null;
  };

  // ── Auto-calculate: Best Discipline ──────────────────────────────────────
  const getBestDiscipline = () => {
    const ranked = HOUSES.map(h => {
      const logs = hvsLogs.filter(l => (l.houseId || l.house_id) === h.id);
      const avg = logs.length
        ? Math.round(logs.reduce((s, l) => s + (l.scores?.discipline || 0), 0) / logs.length)
        : 0;
      return { ...h, avg };
    }).sort((a, b) => b.avg - a.avg);
    return ranked[0] || null;
  };

  // ── Auto-calculate: Most Improved (score jump vs last month) ──────────────
  const getMostImproved = () => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear  = now.getFullYear();
    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
    const lastYear  = thisMonth === 0 ? thisYear - 1 : thisYear;

    const avgForMonth = (hId, m, y) => {
      const logs = hvsLogs.filter(l => {
        const d = new Date(l.created_at || 0);
        return (l.houseId || l.house_id) === hId && d.getMonth() === m && d.getFullYear() === y;
      });
      return logs.length ? logs.reduce((s, l) => s + (l.totalScore || 0), 0) / logs.length : 0;
    };

    const ranked = HOUSES.map(h => {
      const curr = avgForMonth(h.id, thisMonth, thisYear);
      const prev = avgForMonth(h.id, lastMonth, lastYear);
      return { ...h, jump: curr - prev };
    }).sort((a, b) => b.jump - a.jump);
    return ranked[0] || null;
  };

  // ── Auto-calculate: Hafiz Award (manzil = 100%) ───────────────────────────
  const getHafizAward = () => {
    return hifzLogs.filter(l => l.manzil >= 100 || l.percent >= 100).map(l => {
      const st = students.find(s => s.id === (l.student_id || l.studentId));
      return { name: st?.name || l.student_name || "—", houseId: st?.houseId || l.houseId };
    });
  };

  // ── Auto-calculate: Sabaq Streak ──────────────────────────────────────────
  const getSabaqStreak = async () => {
    // Returns top 3 from DB; used on mount
    try {
      const { data } = await supabase.from("sabaq_streaks").select("*").order("streak_days", { ascending: false }).limit(3);
      return data || [];
    } catch { return []; }
  };

  // ── Approve nomination ────────────────────────────────────────────────────
  const approveNomination = async (nom) => {
    if (!CAN_APPROVE.includes(role)) return;
    try {
      await supabase.from("award_nominations").update({ status: "approved" }).eq("id", nom.id);
      await supabase.from("award_winners").insert([{
        award_key:    nom.award_key,
        award_title:  nom.award_title,
        winner_name:  nom.student_name,
        house_id:     nom.house_id,
        period:       nom.period || activeTab,
        reason:       nom.reason,
        created_at:   new Date().toISOString(),
      }]);
      loadWinners();
      loadNominations();
    } catch (e) { console.error("خرابی:", e.message); }
  };

  const rejectNomination = async (nom) => {
    if (!CAN_APPROVE.includes(role)) return;
    try {
      await supabase.from("award_nominations").update({ status: "rejected" }).eq("id", nom.id);
      loadNominations();
    } catch (e) { console.error("خرابی:", e.message); }
  };

  // ── Tab definitions ───────────────────────────────────────────────────────
  const TABS = [
    { id: "weekly",  labelUr: "Weekly",  labelEn: "Weekly",  icon: "📅" },
    { id: "monthly", labelUr: "Monthly",    labelEn: "Monthly", icon: "🗓️" },
    { id: "term",    labelUr: "Term",       labelEn: "Term",    icon: "📆" },
    { id: "annual",  labelUr: "Annual",    labelEn: "Annual",  icon: "🏆" },
    { id: "dini",    labelUr: "Dini",      labelEn: "Dini",    icon: "📖" },
    { id: "history", labelUr: "Date",     labelEn: "History", icon: "📜", restricted: !CAN_SEE_HIST.includes(role) },
  ].filter(t => !t.restricted);

  const awardsByTab = { weekly: WEEKLY_AWARDS, monthly: MONTHLY_AWARDS, term: TERM_AWARDS, annual: ANNUAL_AWARDS, dini: DINI_AWARDS };

  // ── Build auto winner data for a given award key ──────────────────────────
  const getAutoWinner = (key) => {
    switch (key) {
      case "star_of_week":    { const w = getStarOfWeek();    return w ? { winnerName: w.nameEn, winnerNameUr: w.name, houseId: w.id, houseColor: w.color, extra: `Average: ${w.avg}` } : null; }
      case "safai_champion":  { const w = getSafaiChampion(); return w ? { winnerName: w.nameEn, winnerNameUr: w.name, houseId: w.id, houseColor: w.color, extra: `Average: ${w.avg}` } : null; }
      case "best_discipline": { const w = getBestDiscipline();return w ? { winnerName: w.nameEn, winnerNameUr: w.name, houseId: w.id, houseColor: w.color, extra: `Average: ${w.avg}` } : null; }
      case "most_improved":   { const w = getMostImproved();  return w ? { winnerName: w.nameEn, winnerNameUr: w.name, houseId: w.id, houseColor: w.color, extra: `Add: +${w.jump.toFixed(1)}` } : null; }
      case "top_house_term":  { const w = getStarOfWeek();    return w ? { winnerName: w.nameEn, winnerNameUr: w.name, houseId: w.id, houseColor: w.color } : null; }
      case "superhouse_year": {
        const ranked = [...HOUSES].map(h => {
          const logs = hvsLogs.filter(l => (l.houseId || l.house_id) === h.id);
          const avg  = logs.length ? logs.reduce((s, l) => s + (l.totalScore || 0), 0) / logs.length : 0;
          return { ...h, avg };
        }).sort((a, b) => b.avg - a.avg);
        const w = ranked[0];
        return w ? { winnerName: w.nameEn, winnerNameUr: w.name, houseId: w.id, houseColor: w.color } : null;
      }
      default: return null;
    }
  };

  // ── Get manual winner from DB ─────────────────────────────────────────────
  const getDBWinner = (key) => {
    return winners.find(w => w.award_key === key && w.period === activeTab) || null;
  };

  // ── 100% Haziri list ──────────────────────────────────────────────────────
  const haziri100 = (() => {
    const now = new Date();
    const m = now.getMonth();
    const y = now.getFullYear();
    const monthStudents = students.map(s => {
      // absent_count stored in attendance or derived
      return s; // placeholder — real query done via DB
    });
    return []; // auto-populated below via DB query
  })();

  // ── Pending nominations count (for director badge) ────────────────────────
  const pendingCount = nominations.filter(n => n.status === "pending").length;

  return (
    <div style={{ fontFamily: "'Public Sans',sans-serif", direction:"ltr" }}>

      {/* ── Tab bar ──────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginBottom: "20px" }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            style={{
              padding: "8px 16px", borderRadius: "10px", border: "none", cursor: "pointer",
              fontFamily: "inherit", fontSize: "0.75rem", fontWeight: activeTab === t.id ? "700" : "400",
              background: activeTab === t.id ? `linear-gradient(135deg,${G},#b8960a)` : "rgba(255,255,255,0.06)",
              color: activeTab === t.id ? N : "rgba(255,255,255,0.55)",
              position: "relative",
            }}>
            {t.icon} {t.labelUr}
            {t.id === "history" && pendingCount > 0 && CAN_APPROVE.includes(role) && (
              <span style={{ position: "absolute", top: "-4px", left: "-4px", background: "#ef4444", color: "#fff", borderRadius: "50%", width: "16px", height: "16px", fontSize: "0.55rem", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800" }}>{pendingCount}</span>
            )}
          </button>
        ))}

        {/* Nominate button */}
        {CAN_NOMINATE.includes(role) && activeTab !== "history" && (
          <button onClick={() => { setSelectedAward(null); setShowNomForm(true); }}
            style={{ marginRight: "auto", padding: "8px 18px", borderRadius: "10px", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: "0.75rem", fontWeight: "700", background: "rgba(74,222,128,0.15)", color: "#4ade80" }}>
            ✍️ Nomination
          </button>
        )}
      </div>

      {/* ── Award grid (non-history tabs) ────────────────────────────────── */}
      {activeTab !== "history" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: "16px" }}>
          {(awardsByTab[activeTab] || []).map(award => {
            const autoWinner = award.auto ? getAutoWinner(award.key) : null;
            const dbWinner   = getDBWinner(award.key);
            const winner     = autoWinner || (dbWinner ? {
              winnerName: dbWinner.winner_name,
              winnerNameUr: dbWinner.winner_name,
              houseId: dbWinner.house_id,
              houseColor: HOUSES.find(h => h.id === dbWinner.house_id)?.color,
              extra: dbWinner.reason,
            } : null);

            // Special case: Hafiz — multiple winners
            if (award.key === "hafiz") {
              const hafizList = getHafizAward();
              return (
                <div key={award.key} style={{ ...glass, padding: "18px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                    <div>
                      <div style={{ fontSize: "0.6rem", color: "rgba(212,175,55,0.6)", fontWeight: "700", letterSpacing: "0.08em" }}>AUTO</div>
                      <div style={{ fontSize: "1.1rem", fontWeight: "800", color: "#f1f5f9" }}>{award.icon} {award.titleUr}</div>
                      <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.35)" }}>{award.titleEn}</div>
                    </div>
                    <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "0.58rem", background: "rgba(74,222,128,0.15)", color: "#4ade80", fontWeight: "700" }}>Auto</span>
                  </div>
                  {hafizList.length === 0
                    ? <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.72rem" }}>None yet</div>
                    : hafizList.map((h, i) => {
                        const hInfo = HOUSES.find(x => x.id === h.houseId);
                        return (
                          <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                            <span style={{ fontSize: "1rem" }}>📖</span>
                            <span style={{ fontSize: "0.78rem", color: "#f1f5f9", fontWeight: "600" }}>{h.name}</span>
                            {hInfo && <span style={{ padding: "2px 8px", borderRadius: "12px", fontSize: "0.55rem", background: `${hInfo.color}20`, color: hInfo.color }}>{hInfo.nameEn}</span>}
                          </div>
                        );
                      })
                  }
                </div>
              );
            }

            // For star_of_week, compute top house hint to show in card
            const topHouseSuggestion = award.key === "star_of_week" ? getStarOfWeek() : null;

            return (
              <AwardCard
                key={award.key}
                award={award}
                winner={winner}
                role={role}
                students={students}
                topHouseSuggestion={topHouseSuggestion}
                onNominate={() => { setSelectedAward(award); setShowNomForm(true); }}
                onCertificate={winner ? () => setCertStudent({ award, winner }) : null}
              />
            );
          })}
        </div>
      )}

      {/* ── History / Pending tab ─────────────────────────────────────────── */}
      {activeTab === "history" && (
        <HistoryTab
          winners={winners}
          nominations={nominations}
          role={role}
          onApprove={approveNomination}
          onReject={rejectNomination}
          loading={loading}
        />
      )}

      {/* ── Nomination modal ──────────────────────────────────────────────── */}
      {showNomForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <NominationForm
            students={students}
            preselectedAward={selectedAward}
            period={activeTab}
            onClose={() => { setShowNomForm(false); setSelectedAward(null); }}
            onSubmit={() => { setShowNomForm(false); loadNominations(); }}
          />
        </div>
      )}

      {/* ── Certificate modal ─────────────────────────────────────────────── */}
      {certStudent && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <CertOverlay cert={certStudent} onClose={() => setCertStudent(null)} />
        </div>
      )}
    </div>
  );
}

// ── History Tab ───────────────────────────────────────────────────────────────
function HistoryTab({ winners, nominations, role, onApprove, onReject, loading }) {
  const [view, setView] = useState("winners");
  const G = "#d4af37"; const N = "#0f172a";
  const glass = { background: "rgba(255,255,255,0.06)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px" };

  const pending = nominations.filter(n => n.status === "pending");

  return (
    <div>
      <div style={{ display: "flex", gap: "6px", marginBottom: "16px" }}>
        {[["winners", "🏆 All Awards"], ["pending", `⏳ Pending (${pending.length})`]].map(([v, l]) => (
          <button key={v} onClick={() => setView(v)}
            style={{ padding: "7px 16px", borderRadius: "8px", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: "0.72rem", fontWeight: view === v ? "700" : "400", background: view === v ? `linear-gradient(135deg,${G},#b8960a)` : "rgba(255,255,255,0.06)", color: view === v ? N : "rgba(255,255,255,0.5)" }}>
            {l}
          </button>
        ))}
      </div>

      {loading && <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.78rem", textAlign: "center", padding: "40px" }}>Loading…</div>}

      {view === "winners" && !loading && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: "14px" }}>
          {winners.length === 0 && <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.78rem" }} className="ur">کوئی اندراج نہیں</div>}
          {winners.map(w => {
            const hInfo = HOUSES.find(h => h.id === w.house_id);
            return (
              <div key={w.id} style={{ ...glass, padding: "16px" }}>
                <div style={{ fontSize: "0.58rem", color: "rgba(212,175,55,0.55)", fontWeight: "700", marginBottom: "4px" }}>{w.period?.toUpperCase()} — {new Date(w.created_at).toLocaleDateString("en")}</div>
                <div style={{ fontSize: "0.9rem", fontWeight: "800", color: "#f1f5f9", marginBottom: "4px" }}>{w.award_title || w.award_key}</div>
                <div style={{ fontSize: "1.1rem", fontWeight: "900", color: G, marginBottom: "8px" }}>{w.winner_name}</div>
                {hInfo && <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "0.58rem", background: `${hInfo.color}20`, color: hInfo.color, fontWeight: "700" }}>{hInfo.emoji} {hInfo.nameEn}</span>}
                {w.reason && <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.35)", marginTop: "8px", lineHeight: 1.5 }}>{w.reason}</div>}
              </div>
            );
          })}
        </div>
      )}

      {view === "pending" && !loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {pending.length === 0 && <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.78rem" }}>Any Pending Nomination No</div>}
          {pending.map(nom => {
            const hInfo = HOUSES.find(h => h.id === nom.house_id);
            return (
              <div key={nom.id} style={{ ...glass, padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "0.58rem", color: "rgba(212,175,55,0.55)", fontWeight: "700", marginBottom: "4px" }}>{nom.award_title || nom.award_key}</div>
                  <div style={{ fontSize: "0.88rem", fontWeight: "800", color: "#f1f5f9" }}>{nom.student_name}</div>
                  {hInfo && <span style={{ padding: "2px 8px", borderRadius: "12px", fontSize: "0.55rem", background: `${hInfo.color}20`, color: hInfo.color }}>{hInfo.nameEn}</span>}
                  {nom.reason && <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.35)", marginTop: "6px" }}>{nom.reason}</div>}
                  <div style={{ fontSize: "0.58rem", color: "rgba(255,255,255,0.25)", marginTop: "4px" }}>By: {nom.nominated_by || "—"}</div>
                </div>
                {["director"].includes(role) && (
                  <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                    <button onClick={() => onApprove(nom)} style={{ padding: "7px 14px", borderRadius: "8px", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: "0.7rem", fontWeight: "700", background: "rgba(74,222,128,0.15)", color: "#4ade80" }}>✅ Approved</button>
                    <button onClick={() => onReject(nom)} style={{ padding: "7px 14px", borderRadius: "8px", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: "0.7rem", fontWeight: "700", background: "rgba(239,68,68,0.15)", color: "#f87171" }}>❌ Rejected</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Inline cert overlay (opens CertificateTemplate in a modal) ────────────────
import CertificateTemplate from "./CertificateTemplate";

function CertOverlay({ cert, onClose }) {
  return (
    <div style={{ background: "#fff", borderRadius: "16px", overflow: "hidden", maxWidth: "650px", width: "100%", maxHeight: "90vh", overflowY: "auto" }}>
      <div style={{ padding: "12px 16px", background: N2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: G, fontWeight: "700", fontSize: "0.85rem" }}>🖨️ Certificate</span>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: "1.2rem" }}>✕</button>
      </div>
      <CertificateTemplate award={cert.award} winner={cert.winner} />
    </div>
  );
}
