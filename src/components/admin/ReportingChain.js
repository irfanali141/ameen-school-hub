/* eslint-disable */
import { useState } from "react";
import { C, DEMO } from "../../constants";

const CHAIN_LEVELS = [
  {
    level: 7, role: "director", title: "Director", titleEn: "Director", icon: "👨‍💼",
    color: "#b7860b", light: "#fef9e7",
    desc: "Senior Administrative Head — Center of all decisions",
    responsibilities: ["Policy Making","Annual Budget Approval","Strategic Planning","Full Institute Supervision"],
    reportsTo: null, manages: "All Staff & Students",
    email: "director@ameen.edu",
  },
  {
    level: 6, role: "admin", title: "Principal / Admin", titleEn: "Principal / Admin", icon: "🏛️",
    color: "#1e40af", light: "#eff6ff",
    desc: "Daily administrative matters — reports to Director",
    responsibilities: ["Teacher Supervision","Student Discipline","Parent Meetings","Monthly Report"],
    reportsTo: "Director", manages: "All Staff",
    email: "admin@ameen.edu",
  },
  {
    level: 5, role: "finance", title: "Finance Officer", titleEn: "Finance Officer", icon: "💼",
    color: "#166534", light: "#f0fdf4",
    desc: "Financial management — reports to Principal",
    responsibilities: ["Fee Collection & Record","Salary Distribution","Monthly Financial Report","Budget Supervision"],
    reportsTo: "Principal / Admin", manages: "Financial Records",
    email: "finance@ameen.edu",
  },
  {
    level: 4, role: "registrar", title: "Registrar", titleEn: "Registrar", icon: "📋",
    color: "#7c3aed", light: "#f5f3ff",
    desc: "Student Records & Admission — reports to Principal",
    responsibilities: ["Admission Management","DMC & Transcripts","Student Records","Document Verification"],
    reportsTo: "Principal / Admin", manages: "Student Records",
    email: "registrar@ameen.edu",
  },
  {
    level: 3, role: "housemaster", title: "House Master", titleEn: "House Master", icon: "🏆",
    color: "#854d0e", light: "#fffbeb",
    desc: "House system & Training — reports to Principal",
    responsibilities: ["HVS Score Entry","Weekly Duty Check","Training Activities","House Competition Management"],
    reportsTo: "Principal / Admin", manages: "4 Houses, Class Monitors",
    email: "housemaster@ameen.edu",
  },
  {
    level: 2, role: "teacher", title: "Class Teacher", titleEn: "Class Teacher", icon: "👨‍🏫",
    color: "#0d9488", light: "#f0fdfa",
    desc: "Teaching & Attendance — reports to House Master",
    responsibilities: ["Daily Teaching","Attendance Record","Homework Check","Weekly Report"],
    reportsTo: "House Master", manages: "Class Monitors, Students",
    email: "teacher@ameen.edu",
  },
  {
    level: 1, role: "student", title: "Class Monitor", titleEn: "Class Monitor", icon: "⭐",
    color: "#dc2626", light: "#fff5f5",
    desc: "Class discipline — reports to Class Teacher",
    responsibilities: ["Record Attendance","Class Discipline","Notify Teacher","Guide Classmates"],
    reportsTo: "Class Teacher", manages: "Class Students",
    email: null,
  },
];

export default function ReportingChain({ students = [], teachers = [] }) {
  const [selected, setSelected] = useState(null);

  const getPersonName = (lv) => {
    if (lv.email) {
      const d = DEMO.find(d => d.email === lv.email);
      return d?.name || lv.titleEn;
    }
    return "Class Monitors";
  };

  const getCount = (lv) => {
    if (lv.role === "teacher") return teachers.length || 4;
    if (lv.role === "student") return students.length > 0 ? Math.ceil(students.length / 4) : 8;
    if (lv.role === "housemaster") return 4;
    return 1;
  };

  const getCountLabel = (lv) => {
    const n = getCount(lv);
    if (lv.role === "teacher") return `${n} Teachers`;
    if (lv.role === "student") return `${n} Monitors`;
    if (lv.role === "housemaster") return "4 Houses";
    return "1 Person";
  };

  // Pyramid width: Director (level 7) = narrowest at top, Monitor (level 1) = widest at bottom
  const getIndent = (level) => {
    // level 7 → 120px each side; level 1 → 0px each side
    return (level - 1) * 20;
  };

  return (
    <div style={{ padding: "20px 16px", maxWidth: "920px", margin: "0 auto", fontFamily: "'Segoe UI',Arial,serif", direction:"ltr" }}>

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg,#0f172a,#1e293b)", borderRadius: "20px", padding: "24px 28px", marginBottom: "28px", border: "1px solid rgba(183,134,11,0.3)", boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "16px" }}>
          <div style={{ fontSize: "2.2rem" }}>🏛️</div>
          <div>
            <div style={{ color: "#d4af37", fontSize: "1.25rem", fontWeight: "800" }}>7-Level Reporting Chain</div>
            <div style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.68rem", direction: "ltr", textAlign: "right" }}>
              7-Level Reporting Chain • Ameen Islamic Institute, Swat
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {[
            { label: "Total Levels", val: "7", color: "#d4af37" },
            { label: "Total Teachers", val: teachers.length || "4+", color: "#60a5fa" },
            { label: "Total Students", val: students.length || "300+", color: "#4ade80" },
            { label: "Houses", val: "4", color: "#fb923c" },
          ].map(s => (
            <div key={s.label} style={{ background: "rgba(255,255,255,0.05)", borderRadius: "12px", padding: "10px 18px", textAlign: "center", border: `1px solid ${s.color}30`, flex: "1 1 80px" }}>
              <div style={{ color: s.color, fontSize: "1.3rem", fontWeight: "800" }}>{s.val}</div>
              <div style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.62rem" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Chain */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0" }}>
        {CHAIN_LEVELS.map((lv, idx) => {
          const isSel = selected === lv.level;
          const name = getPersonName(lv);
          const indent = getIndent(lv.level);
          const widthPct = 100 - (lv.level - 1) * 7; // level 7 = 58%, level 1 = 100%

          return (
            <div key={lv.level} style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>

              {/* Level card */}
              <div
                onClick={() => setSelected(isSel ? null : lv.level)}
                style={{
                  width: `${widthPct}%`,
                  background: isSel ? `linear-gradient(135deg,${lv.light},white)` : "white",
                  border: `2px solid ${isSel ? lv.color : lv.color + "50"}`,
                  borderRadius: "16px",
                  padding: "14px 18px",
                  cursor: "pointer",
                  transition: "all 0.22s",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  boxShadow: isSel ? `0 6px 24px ${lv.color}25` : "0 2px 10px rgba(0,0,0,0.06)",
                }}
              >
                {/* Level number badge */}
                <div style={{
                  background: `linear-gradient(135deg,${lv.color},${lv.color}cc)`,
                  color: "white", borderRadius: "50%", width: "38px", height: "38px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.85rem", fontWeight: "800", flexShrink: 0,
                  boxShadow: `0 4px 12px ${lv.color}40`
                }}>
                  {lv.level}
                </div>

                {/* Icon */}
                <div style={{ fontSize: "1.6rem", flexShrink: 0 }}>{lv.icon}</div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "0.88rem", fontWeight: "800", color: lv.color }}>{lv.title}</div>
                  <div style={{ fontSize: "0.62rem", color: "#888", marginTop: "2px" }}>{lv.titleEn} — {name}</div>
                </div>

                {/* Count badge */}
                <div style={{
                  background: lv.light, color: lv.color,
                  borderRadius: "20px", padding: "4px 12px",
                  fontSize: "0.62rem", fontWeight: "700",
                  border: `1px solid ${lv.color}30`, flexShrink: 0,
                  whiteSpace: "nowrap"
                }}>
                  {getCountLabel(lv)}
                </div>

                {/* Expand */}
                <div style={{ color: lv.color, fontSize: "0.6rem", opacity: 0.6, flexShrink: 0 }}>{isSel ? "▲" : "▼"}</div>
              </div>

              {/* Expanded detail panel */}
              {isSel && (
                <div style={{
                  width: `${widthPct}%`,
                  background: lv.light,
                  border: `2px solid ${lv.color}40`,
                  borderTop: "none",
                  borderRadius: "0 0 16px 16px",
                  padding: "16px 20px",
                }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    {/* Responsibilities */}
                    <div>
                      <div style={{ fontSize: "0.68rem", color: "#999", marginBottom: "8px", fontWeight: "700", borderBottom: `1px solid ${lv.color}20`, paddingBottom: "4px" }}>
                        ✅ Responsibilities
                      </div>
                      {lv.responsibilities.map(r => (
                        <div key={r} style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "5px", fontSize: "0.72rem", color: "#444" }}>
                          <span style={{ color: lv.color, fontSize: "0.55rem", flexShrink: 0 }}>◉</span>
                          {r}
                        </div>
                      ))}
                    </div>

                    {/* Reporting info */}
                    <div>
                      <div style={{ fontSize: "0.68rem", color: "#999", marginBottom: "8px", fontWeight: "700", borderBottom: `1px solid ${lv.color}20`, paddingBottom: "4px" }}>
                        📊 Reporting Information
                      </div>
                      <div style={{ marginBottom: "10px" }}>
                        <div style={{ fontSize: "0.62rem", color: "#aaa" }}>Reports To:</div>
                        <div style={{ fontSize: "0.78rem", color: lv.color, fontWeight: "700" }}>
                          {lv.reportsTo ? `↑ ${lv.reportsTo}` : "— Top Level"}
                        </div>
                      </div>
                      <div style={{ marginBottom: "10px" }}>
                        <div style={{ fontSize: "0.62rem", color: "#aaa" }}>Manages:</div>
                        <div style={{ fontSize: "0.72rem", color: "#444", fontWeight: "600" }}>{lv.manages}</div>
                      </div>
                      {lv.email && (
                        <div>
                          <div style={{ fontSize: "0.62rem", color: "#aaa" }}>Email:</div>
                          <div style={{ fontSize: "0.62rem", color: "#666", direction: "ltr", textAlign: "right" }}>{lv.email}</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <div style={{ marginTop: "12px", padding: "10px 14px", background: "white", borderRadius: "10px", border: `1px solid ${lv.color}20` }}>
                    <div style={{ fontSize: "0.72rem", color: "#555", fontStyle: "italic" }}>💬 {lv.desc}</div>
                  </div>
                </div>
              )}

              {/* Connector arrow */}
              {idx < CHAIN_LEVELS.length - 1 && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", height: "32px", position: "relative" }}>
                  <div style={{
                    width: "2px", height: "100%",
                    background: `linear-gradient(to bottom,${lv.color}80,${CHAIN_LEVELS[idx + 1].color}80)`
                  }} />
                  <div style={{
                    position: "absolute", top: "50%", transform: "translateY(-50%)",
                    background: "white", border: `1px solid #eee`,
                    borderRadius: "20px", padding: "2px 10px",
                    fontSize: "0.6rem", color: "#aaa", whiteSpace: "nowrap"
                  }}>
                    ↓ Report
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Flow bar at bottom */}
      <div style={{ marginTop: "28px", background: "linear-gradient(135deg,#0f172a,#1e293b)", borderRadius: "16px", padding: "20px 24px", border: "1px solid rgba(183,134,11,0.2)" }}>
        <div style={{ color: "#d4af37", fontSize: "0.82rem", fontWeight: "800", marginBottom: "14px", textAlign: "center" }}>
          📊 Reporting Flow — Bottom to Top
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center", justifyContent: "center" }}>
          {[...CHAIN_LEVELS].reverse().map((lv, i, arr) => (
            <div key={lv.level} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{
                background: `${lv.color}20`, border: `1px solid ${lv.color}50`,
                borderRadius: "8px", padding: "5px 10px",
                fontSize: "0.62rem", color: lv.color, fontWeight: "700", whiteSpace: "nowrap"
              }}>
                {lv.icon} {lv.title}
              </div>
              {i < arr.length - 1 && (
                <span style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.75rem" }}>→</span>
              )}
            </div>
          ))}
        </div>
        <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.62rem", textAlign: "center", marginTop: "10px" }}>
          Every level reports to the level above — from Class Monitor to Director
        </div>
      </div>
    </div>
  );
}
