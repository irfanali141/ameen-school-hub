/* eslint-disable */
import { useState } from "react";

// ─── 7-Level House Reporting Chain ────────────────────────────────────────────

const CHAIN = [
  {
    level: 1,
    role: "Class Monitor",
    roleEn: "Class Monitor",
    reportsTo: "Section Head",
    reportsToEn: "Section Head",
    freq: "Daily",
    freqEn: "Daily",
    freqColor: "#f87171",
    sheet: "Class Discipline Sheet",
    sheetUr: "Class Discipline Sheet",
    icon: "⭐",
    color: "#dc2626",
    desc: "Ensure daily class discipline and report to Section Head",
  },
  {
    level: 2,
    role: "Student Captain",
    roleEn: "Student Captain",
    reportsTo: "Deputy Master",
    reportsToEn: "Vice Master",
    freq: "Weekly",
    freqEn: "Weekly",
    freqColor: "#fb923c",
    sheet: "Team Task Sheet",
    sheetUr: "Team Task Sheet",
    icon: "🏅",
    color: "#ea580c",
    desc: "Organize team activities and submit weekly performance report",
  },
  {
    level: 3,
    role: "Section Head",
    roleEn: "Section Head",
    reportsTo: "House Master",
    reportsToEn: "House Master",
    freq: "Weekly",
    freqEn: "Weekly",
    freqColor: "#fb923c",
    sheet: "Section Evaluation",
    sheetUr: "Section Assessment Form",
    icon: "📋",
    color: "#d97706",
    desc: "Review section total performance and send to House Master",
  },
  {
    level: 4,
    role: "Deputy House Master",
    roleEn: "Vice House Master",
    reportsTo: "House Master",
    reportsToEn: "House Master",
    freq: "Daily",
    freqEn: "Daily",
    freqColor: "#f87171",
    sheet: "Attendance Sheet",
    sheetUr: "Attendance Sheet",
    icon: "📊",
    color: "#854d0e",
    desc: "Record daily attendance and notify House Master",
  },
  {
    level: 5,
    role: "House Master",
    roleEn: "House Master",
    reportsTo: "Coordinator",
    reportsToEn: "Coordinator",
    freq: "Weekly",
    freqEn: "Weekly",
    freqColor: "#fb923c",
    sheet: "Weekly House Report",
    sheetUr: "Weekly House Report",
    icon: "🏆",
    color: "#92400e",
    desc: "Weekly review of entire House and report to Coordinator",
  },
  {
    level: 6,
    role: "Coordinator",
    roleEn: "Coordinator",
    reportsTo: "Head Panel",
    reportsToEn: "Head Panel",
    freq: "Monthly",
    freqEn: "Monthly",
    freqColor: "#a78bfa",
    sheet: "Consolidated Report",
    sheetUr: "Total Report",
    icon: "🔗",
    color: "#6d28d9",
    desc: "Prepare total report for all Houses and present to Head Panel",
  },
  {
    level: 7,
    role: "Head Panel",
    roleEn: "Head Panel",
    reportsTo: "Principal / Director",
    reportsToEn: "Principal / Director",
    freq: "Quarterly",
    freqEn: "Quarterly",
    freqColor: "#34d399",
    sheet: "Grand Evaluation",
    sheetUr: "Grand Assessment",
    icon: "👑",
    color: "#1e40af",
    desc: "Quarterly grand assessment — Annual review of all results",
  },
];

const STATUS_CFG = {
  submitted: { labelUr: "جمع ✓",      labelEn: "Submitted", color: "#4ade80", bg: "rgba(74,222,128,0.1)",  border: "rgba(74,222,128,0.35)"  },
  pending:   { labelUr: "زیر التواء ⏳", labelEn: "Pending",   color: "#fb923c", bg: "rgba(251,146,60,0.1)",  border: "rgba(251,146,60,0.35)"  },
  overdue:   { labelUr: "تاخیر ⚠",   labelEn: "Overdue",   color: "#f87171", bg: "rgba(248,113,113,0.1)", border: "rgba(248,113,113,0.35)" },
};

const FREQ_COLORS = {
  Daily:     "#f87171",
  Weekly:    "#fb923c",
  Monthly:   "#a78bfa",
  Quarterly: "#34d399",
};

const LS_KEY = "house_reportchain_statuses";

export default function HouseReportingChain({ userRole = "teacher" }) {
  const G = "#d4af37";
  const N = "#0f172a";
  const glass = {
    background: "rgba(255,255,255,0.06)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "16px",
  };

  const isDirector = userRole === "director" || userRole === "admin";
  const isHM       = userRole === "housemaster";
  const canEdit    = isDirector || isHM;

  // Director sees all 7; House Master sees levels 1–5 only
  const visibleLevels = isDirector ? CHAIN : CHAIN.filter(l => l.level <= 5);

  const [statuses, setStatuses] = useState(() => {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || "{}"); }
    catch { return {}; }
  });
  const [expanded, setExpanded] = useState(null);

  const setStatus = (level, status) => {
    const next = { ...statuses, [level]: status };
    setStatuses(next);
    localStorage.setItem(LS_KEY, JSON.stringify(next));
  };

  // Summary counts
  const submitted = Object.values(statuses).filter(s => s === "submitted").length;
  const pending   = Object.values(statuses).filter(s => s === "pending").length;
  const overdue   = Object.values(statuses).filter(s => s === "overdue").length;

  return (
    <div style={{
      minHeight: "100vh",
      background: `linear-gradient(160deg,${N} 0%,#0d1f3c 50%,#0a1628 100%)`,
      padding: "24px 16px",
      fontFamily: "'Public Sans',sans-serif",
      direction:"ltr",
    }}>

      {/* ── Header ── */}
      <div style={{ ...glass, padding: "20px 24px", marginBottom: "24px", borderTop: `3px solid ${G}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "14px", flexWrap: "wrap" }}>
          <div style={{
            width: "46px", height: "46px", borderRadius: "12px",
            background: `linear-gradient(135deg,${G},#b8960a)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: `0 4px 20px rgba(212,175,55,0.35)`, flexShrink: 0,
          }}>
            <span style={{ fontSize: "1.4rem" }}>🏛️</span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ color: "#f1f5f9", fontSize: "1.1rem", fontWeight: "800" }}>House Reporting Chain</div>
            <div style={{ color: "rgba(212,175,55,0.65)", fontSize: "0.65rem", direction: "ltr", textAlign: "right" }}>
              7-Level House Reporting Chain • Ameen Islamic Institute, Swat
            </div>
          </div>
          {/* Access indicator */}
          {!isDirector && (
            <div style={{
              background: "rgba(167,139,250,0.12)", border: "1px solid rgba(167,139,250,0.3)",
              borderRadius: "10px", padding: "5px 14px",
              fontSize: "0.62rem", color: "#a78bfa", fontWeight: "700",
            }}>
              {isHM ? "Level 1–5 (HM Access)" : "View Only"}
            </div>
          )}
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {[
            { label: "Total / Submitted",  val: submitted, color: "#4ade80" },
            { label: "Pending / Pending",    val: pending,   color: "#fb923c" },
            { label: "Overdue",  val: overdue,   color: "#f87171" },
            { label: "Total Levels",         val: visibleLevels.length, color: G },
          ].map(s => (
            <div key={s.label} style={{
              background: "rgba(255,255,255,0.04)", border: `1px solid ${s.color}25`,
              borderRadius: "10px", padding: "8px 16px",
              textAlign: "center", flex: "1 1 80px",
            }}>
              <div style={{ color: s.color, fontSize: "1.3rem", fontWeight: "900", lineHeight: 1 }}>{s.val}</div>
              <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.58rem", marginTop: "3px" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Legend ── */}
      <div style={{ ...glass, padding: "12px 20px", marginBottom: "20px", display: "flex", gap: "20px", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.62rem", fontWeight: "700" }}>Frequency:</div>
        {Object.entries(FREQ_COLORS).map(([f, c]) => (
          <div key={f} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: c }} />
            <span style={{ color: c, fontSize: "0.62rem", fontWeight: "700" }}>{f}</span>
          </div>
        ))}
        <div style={{ marginRight: "auto", display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {Object.entries(STATUS_CFG).map(([k, sc]) => (
            <div key={k} style={{
              background: sc.bg, border: `1px solid ${sc.border}`,
              borderRadius: "6px", padding: "2px 8px",
              fontSize: "0.58rem", color: sc.color, fontWeight: "700",
            }}>
              {sc.labelEn}
            </div>
          ))}
        </div>
      </div>

      {/* ── Chain Cards ── */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        {visibleLevels.map((lv, idx) => {
          const status = statuses[lv.level] || "pending";
          const sc     = STATUS_CFG[status];
          const isExp  = expanded === lv.level;

          return (
            <div key={lv.level} style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>

              {/* ─ Card ─ */}
              <div
                style={{
                  width: "100%", maxWidth: "700px",
                  background: isExp
                    ? `linear-gradient(135deg,rgba(255,255,255,0.09),rgba(255,255,255,0.05))`
                    : "rgba(255,255,255,0.05)",
                  border: `1.5px solid ${isExp ? lv.color + "80" : lv.color + "35"}`,
                  borderTop: `3px solid ${lv.color}`,
                  borderRadius: isExp ? "16px 16px 0 0" : "16px",
                  overflow: "hidden",
                  cursor: "pointer",
                  transition: "border-color 0.2s, background 0.2s",
                  boxShadow: isExp ? `0 0 0 1px ${lv.color}30, 0 8px 32px ${lv.color}15` : "none",
                }}
                onClick={() => setExpanded(isExp ? null : lv.level)}
              >
                {/* Main row */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px 18px" }}>

                  {/* Level badge */}
                  <div style={{
                    width: "36px", height: "36px", borderRadius: "50%", flexShrink: 0,
                    background: `linear-gradient(135deg,${lv.color},${lv.color}cc)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontSize: "0.82rem", fontWeight: "900",
                    boxShadow: `0 4px 12px ${lv.color}40`,
                  }}>
                    {lv.level}
                  </div>

                  {/* Icon */}
                  <div style={{ fontSize: "1.5rem", flexShrink: 0 }}>{lv.icon}</div>

                  {/* Role info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "0.9rem", fontWeight: "800", color: "#f1f5f9" }}>{lv.role}</div>
                    <div style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.38)", marginTop: "2px", display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                      <span style={{ direction: "ltr" }}>{lv.roleEn}</span>
                      <span style={{ color: "rgba(255,255,255,0.2)" }}>→</span>
                      <span style={{ color: lv.color + "cc" }}>{lv.reportsToEn}</span>
                    </div>
                  </div>

                  {/* Sheet name */}
                  <div style={{
                    display: "flex", flexDirection: "column", alignItems: "flex-end",
                    flexShrink: 0, maxWidth: "140px",
                  }}>
                    <div style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.3)" }}>📄 Form</div>
                    <div style={{ fontSize: "0.62rem", color: "rgba(255,255,255,0.55)", textAlign: "left", direction: "ltr", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "130px" }}>
                      {lv.sheet}
                    </div>
                  </div>

                  {/* Frequency badge */}
                  <div style={{
                    background: `${lv.freqColor}15`,
                    border: `1px solid ${lv.freqColor}45`,
                    borderRadius: "8px", padding: "4px 10px",
                    fontSize: "0.6rem", fontWeight: "700", color: lv.freqColor,
                    flexShrink: 0, whiteSpace: "nowrap",
                  }}>
                    {lv.freqEn}
                  </div>

                  {/* Status badge */}
                  <div style={{
                    background: sc.bg, border: `1px solid ${sc.border}`,
                    borderRadius: "8px", padding: "4px 10px",
                    fontSize: "0.6rem", fontWeight: "700", color: sc.color,
                    flexShrink: 0, whiteSpace: "nowrap",
                  }}>
                    {sc.labelEn}
                  </div>

                  {/* Expand chevron */}
                  <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.55rem", flexShrink: 0, transition: "transform 0.2s", transform: isExp ? "rotate(180deg)" : "none" }}>
                    ▼
                  </div>
                </div>
              </div>

              {/* ─ Expanded Detail Panel ─ */}
              {isExp && (
                <div style={{
                  width: "100%", maxWidth: "700px",
                  background: "rgba(0,0,0,0.25)",
                  border: `1.5px solid ${lv.color}40`,
                  borderTop: "none",
                  borderRadius: "0 0 16px 16px",
                  padding: "18px 20px",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                }}
                  onClick={e => e.stopPropagation()}
                >
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>

                    {/* Left: reporting details */}
                    <div>
                      <div style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.3)", fontWeight: "700", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "5px", marginBottom: "10px" }}>
                        📊 Reporting Details
                      </div>

                      <div style={{ marginBottom: "10px" }}>
                        <div style={{ fontSize: "0.58rem", color: "rgba(255,255,255,0.3)", marginBottom: "3px" }}>Reports To:</div>
                        <div style={{ fontSize: "0.82rem", fontWeight: "800", color: lv.color }}>↑ {lv.reportsTo}</div>
                        <div style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.35)", direction: "ltr", textAlign: "right" }}>{lv.reportsToEn}</div>
                      </div>

                      <div style={{ marginBottom: "10px" }}>
                        <div style={{ fontSize: "0.58rem", color: "rgba(255,255,255,0.3)", marginBottom: "3px" }}>Frequency:</div>
                        <div style={{
                          display: "inline-block",
                          background: `${lv.freqColor}15`,
                          border: `1px solid ${lv.freqColor}45`,
                          borderRadius: "8px", padding: "4px 12px",
                          fontSize: "0.68rem", fontWeight: "800", color: lv.freqColor,
                        }}>
                          {lv.freq} — {lv.freqEn}
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: "0.58rem", color: "rgba(255,255,255,0.3)", marginBottom: "3px" }}>Form / Sheet:</div>
                        <div style={{ fontSize: "0.75rem", color: "#f1f5f9", fontWeight: "700" }}>📄 {lv.sheetUr}</div>
                        <div style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.35)", direction: "ltr", textAlign: "right", marginTop: "2px" }}>{lv.sheet}</div>
                      </div>

                      {/* Description */}
                      <div style={{
                        marginTop: "12px",
                        background: "rgba(255,255,255,0.04)",
                        border: `1px solid ${lv.color}20`,
                        borderRadius: "10px", padding: "10px 12px",
                      }}>
                        <div style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.5)", fontStyle: "italic" }}>
                          💬 {lv.desc}
                        </div>
                      </div>
                    </div>

                    {/* Right: status update */}
                    <div>
                      <div style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.3)", fontWeight: "700", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "5px", marginBottom: "10px" }}>
                        🔄 Status — Status
                      </div>

                      {/* Current status indicator */}
                      <div style={{
                        background: sc.bg, border: `1.5px solid ${sc.border}`,
                        borderRadius: "12px", padding: "10px 14px",
                        display: "flex", alignItems: "center", gap: "10px",
                        marginBottom: "14px",
                      }}>
                        <div style={{
                          width: "10px", height: "10px", borderRadius: "50%",
                          background: sc.color, flexShrink: 0,
                          boxShadow: `0 0 8px ${sc.color}`,
                        }} />
                        <div>
                          <div style={{ fontSize: "0.8rem", fontWeight: "800", color: sc.color }}>{sc.labelUr}</div>
                          <div style={{ fontSize: "0.58rem", color: "rgba(255,255,255,0.35)" }}>{sc.labelEn}</div>
                        </div>
                      </div>

                      {canEdit ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <div style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.3)", marginBottom: "4px" }}>
                            Status Change:
                          </div>
                          {Object.entries(STATUS_CFG).map(([k, s]) => (
                            <button
                              key={k}
                              onClick={() => setStatus(lv.level, k)}
                              style={{
                                padding: "9px 14px",
                                borderRadius: "10px",
                                border: `1.5px solid ${status === k ? s.border : "rgba(255,255,255,0.1)"}`,
                                background: status === k ? s.bg : "rgba(255,255,255,0.04)",
                                color: status === k ? s.color : "rgba(255,255,255,0.45)",
                                fontSize: "0.72rem",
                                fontWeight: status === k ? "800" : "500",
                                cursor: "pointer",
                                fontFamily: "inherit",
                                textAlign: "right",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                transition: "all 0.15s",
                              }}
                            >
                              <span style={{
                                width: "8px", height: "8px", borderRadius: "50%",
                                background: s.color, flexShrink: 0,
                                boxShadow: status === k ? `0 0 6px ${s.color}` : "none",
                              }} />
                              <span>{s.labelUr}</span>
                              <span style={{ fontSize: "0.58rem", color: "rgba(255,255,255,0.3)", marginRight: "auto" }}>{s.labelEn}</span>
                              {status === k && <span style={{ fontSize: "0.65rem" }}>✓</span>}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div style={{
                          background: "rgba(255,255,255,0.03)",
                          border: "1px solid rgba(255,255,255,0.07)",
                          borderRadius: "10px", padding: "12px",
                          textAlign: "center",
                        }}>
                          <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.3)" }}>
                            Only Director / HM can change
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ─ Arrow Connector ─ */}
              {idx < visibleLevels.length - 1 && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "2px 0" }}>
                  <div style={{
                    width: "2px", height: "16px",
                    background: `linear-gradient(to bottom,${lv.color}70,${visibleLevels[idx + 1].color}70)`,
                  }} />
                  <div style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.09)",
                    borderRadius: "20px", padding: "3px 14px",
                    fontSize: "0.55rem", color: "rgba(255,255,255,0.25)",
                    whiteSpace: "nowrap",
                  }}>
                    ↓ Reports To
                  </div>
                  <div style={{
                    width: "2px", height: "16px",
                    background: `linear-gradient(to bottom,${lv.color}70,${visibleLevels[idx + 1].color}70)`,
                  }} />
                </div>
              )}

            </div>
          );
        })}
      </div>

      {/* ── Flow Summary Bar ── */}
      <div style={{ ...glass, padding: "16px 20px", marginTop: "28px" }}>
        <div style={{ color: G, fontSize: "0.75rem", fontWeight: "800", textAlign: "center", marginBottom: "14px" }}>
          📊 Reporting Flow — Bottom to Top
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", justifyContent: "center", alignItems: "center" }}>
          {visibleLevels.map((lv, i) => (
            <div key={lv.level} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{
                background: `${lv.color}18`,
                border: `1px solid ${lv.color}45`,
                borderRadius: "8px", padding: "5px 10px",
                fontSize: "0.6rem", color: lv.color, fontWeight: "700",
                whiteSpace: "nowrap",
              }}>
                {lv.icon} {lv.roleEn}
              </div>
              {i < visibleLevels.length - 1 && (
                <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "0.8rem" }}>→</span>
              )}
            </div>
          ))}
        </div>
        <div style={{ color: "rgba(255,255,255,0.28)", fontSize: "0.6rem", textAlign: "center", marginTop: "10px" }}>
          Every level reports to the level above — from Class Monitor to Head Panel
        </div>
      </div>

    </div>
  );
}
