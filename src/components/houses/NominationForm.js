/* eslint-disable */
import { useState } from "react";
import { HOUSES, sLabel } from "../../constants";
import { supabase } from "../../supabase";

const G  = "#d4af37";
const N  = "#0f172a";
const N2 = "#1e293b";

const ALL_AWARDS = [
  { key: "akhlaq_month",  titleUr: "Akhlaq Champion",            titleEn: "Akhlaq Champion",       period: "monthly"  },
  { key: "academic_term", titleUr: "Best Academic Student",  titleEn: "Best Academic Student", period: "term"     },
  { key: "sports_term",   titleUr: "Best Sportsman",            titleEn: "Best Sportsman",        period: "term"     },
  { key: "stoy",          titleUr: "Student of the Year",      titleEn: "Student of the Year",   period: "annual"   },
  { key: "best_teacher",  titleUr: "Best Teacher",              titleEn: "Best Teacher",          period: "annual"   },
  { key: "best_reader",   titleUr: "Best Reader",               titleEn: "Best Reader",           period: "annual"   },
  { key: "dini_akhlaq",   titleUr: "Dini Akhlaq",                titleEn: "Dini Akhlaq Award",     period: "dini"     },
];

/**
 * NominationForm
 * Props:
 *   students          — array of student objects
 *   preselectedAward  — { key, titleUr, titleEn } | null
 *   period            — current tab string
 *   onClose           — () => void
 *   onSubmit          — () => void  (called after successful submit)
 */
export default function NominationForm({ students = [], preselectedAward, period, onClose, onSubmit }) {
  const [awardKey, setAwardKey] = useState(preselectedAward?.key || "");
  const [search,   setSearch]   = useState("");
  const [selected, setSelected] = useState(null);   // student object
  const [reason,   setReason]   = useState("");
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState("");

  const filtered = search.trim().length > 0
    ? students.filter(s => s.name?.toLowerCase().includes(search.toLowerCase()) || s.studentCode?.toLowerCase().includes(search.toLowerCase()))
    : [];

  const chosenAward = ALL_AWARDS.find(a => a.key === awardKey) || preselectedAward;

  const handleSubmit = async () => {
    if (!awardKey)    return setError("Award Select");
    if (!selected)    return setError("Student Select");
    if (!reason.trim()) return setError("Enter a reason");

    setSaving(true);
    setError("");
    try {
      const hInfo = HOUSES.find(h => h.id === selected.houseId);
      await supabase.from("award_nominations").insert([{
        award_key:      awardKey,
        award_title:    chosenAward?.titleUr || awardKey,
        student_id:     selected.id,
        student_name:   selected.name,
        house_id:       selected.houseId || null,
        house_name:     hInfo?.nameEn || null,
        reason:         reason.trim(),
        period:         chosenAward?.period || period || "general",
        status:         "pending",
        nominated_by:   "current_user", // replaced by real auth if available
        created_at:     new Date().toISOString(),
      }]);
      onSubmit();
    } catch (e) {
      setError("Calligraphy: " + e.message);
    }
    setSaving(false);
  };

  const inp = {
    width: "100%", padding: "11px 14px",
    border: "1px solid rgba(212,175,55,0.3)",
    borderRadius: "10px", fontSize: "0.8rem",
    outline: "none", fontFamily: "inherit",
    background: "rgba(255,255,255,0.06)",
    color: "#f1f5f9", direction:"ltr",
    boxSizing: "border-box",
  };

  return (
    <div style={{
      background: N2, borderRadius: "20px", padding: "28px", width: "100%", maxWidth: "480px",
      boxShadow: "0 20px 60px rgba(0,0,0,0.6)", direction:"ltr",
      fontFamily: "'Public Sans',sans-serif",
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <div style={{ fontSize: "0.6rem", color: `rgba(212,175,55,0.6)`, fontWeight: "700", letterSpacing: "0.1em" }}>AWARD NOMINATION</div>
          <div style={{ fontSize: "1.15rem", fontWeight: "800", color: "#f1f5f9" }}>✍️ Nomination Form</div>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: "1.3rem", lineHeight: 1 }}>✕</button>
      </div>

      {/* Award category dropdown */}
      <div style={{ marginBottom: "14px" }}>
        <label style={{ fontSize: "0.68rem", color: "rgba(212,175,55,0.7)", fontWeight: "700", display: "block", marginBottom: "5px" }}>Award Type</label>
        <select
          value={awardKey}
          onChange={e => setAwardKey(e.target.value)}
          disabled={!!preselectedAward}
          style={{ ...inp, colorScheme: "dark" }}
        >
          <option value="">— Select —</option>
          {ALL_AWARDS.map(a => (
            <option key={a.key} value={a.key}>{a.titleUr} ({a.titleEn})</option>
          ))}
        </select>
      </div>

      {/* Student search */}
      <div style={{ marginBottom: "10px" }}>
        <label style={{ fontSize: "0.68rem", color: "rgba(212,175,55,0.7)", fontWeight: "700", display: "block", marginBottom: "5px" }}>Student Search</label>
        {selected ? (
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "10px 14px", borderRadius: "10px",
            background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.25)",
          }}>
            <div>
              <div style={{ fontSize: "0.85rem", fontWeight: "700", color: "#f1f5f9" }}>{selected.name}</div>
              <div style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.4)" }}>{selected.grade} — {selected.studentCode}</div>
            </div>
            <button onClick={() => { setSelected(null); setSearch(""); }}
              style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: "1rem" }}>✕</button>
          </div>
        ) : (
          <>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or code…"
              style={inp}
            />
            {filtered.length > 0 && (
              <div style={{
                maxHeight: "180px", overflowY: "auto",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "10px", marginTop: "4px",
                background: "#1a2a40",
              }}>
                {filtered.map(s => {
                  const hInfo = HOUSES.find(h => h.id === s.houseId);
                  return (
                    <div key={s.id || s.studentCode}
                      onClick={() => { setSelected(s); setSearch(""); }}
                      style={{
                        padding: "10px 14px", cursor: "pointer", borderBottom: "1px solid rgba(255,255,255,0.05)",
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      <div>
                        <div style={{ fontSize: "0.8rem", color: "#f1f5f9", fontWeight: "600" }}>{s.name}</div>
                        <div style={{ fontSize: "0.58rem", color: "rgba(255,255,255,0.35)" }}>{s.grade}</div>
                      </div>
                      {hInfo && (
                        <span style={{ padding: "2px 8px", borderRadius: "12px", fontSize: "0.55rem", background: `${hInfo.color}20`, color: hInfo.color, fontWeight: "700" }}>
                          {hInfo.emoji} {hInfo.nameEn}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            {search.trim().length > 0 && filtered.length === 0 && (
              <div style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.3)", padding: "8px 0" }} className="ur">کوئی نتیجہ نہیں</div>
            )}
          </>
        )}
      </div>

      {/* Reason textarea */}
      <div style={{ marginBottom: "18px" }}>
        <label style={{ fontSize: "0.68rem", color: "rgba(212,175,55,0.7)", fontWeight: "700", display: "block", marginBottom: "5px" }}>Reason / Justification</label>
        <textarea
          value={reason}
          onChange={e => setReason(e.target.value)}
          rows={3}
          placeholder="Write the reason for this nomination…"
          style={{ ...inp, resize: "vertical", minHeight: "70px" }}
        />
      </div>

      {/* Error */}
      {error && (
        <div style={{ padding: "8px 12px", borderRadius: "8px", background: "rgba(239,68,68,0.12)", color: "#f87171", fontSize: "0.7rem", marginBottom: "12px", border: "1px solid rgba(239,68,68,0.25)" }}>
          ⚠️ {error}
        </div>
      )}

      {/* Submit button */}
      <button
        onClick={handleSubmit}
        disabled={saving}
        style={{
          width: "100%", padding: "13px", borderRadius: "12px", border: "none",
          cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit",
          fontSize: "0.85rem", fontWeight: "800",
          background: saving ? "rgba(212,175,55,0.3)" : `linear-gradient(135deg,${G},#b8960a)`,
          color: N, opacity: saving ? 0.7 : 1,
        }}
      >
        {saving ? "Submitting…" : "📨 Nomination Submit"}
      </button>

      <div style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.2)", textAlign: "center", marginTop: "10px" }}>
        Nomination will go to Director for approval
      </div>
    </div>
  );
}
