/* eslint-disable */
import { useState, useEffect } from "react";
import { supabase } from "../../supabase";
import { HOUSES, sLabel } from "../../constants";

const G = "#d4af37"; const N = "#0f172a"; const N2 = "#1e293b";
const glass = { background:"rgba(255,255,255,0.07)", backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:"16px" };

export default function HifzVerification({ students = [], hifzLogs = [], role }) {
  const [hifzData, setHifzData]   = useState([]);   // hifz_progress rows
  const [verifying, setVerifying] = useState({});   // { studentId: boolean }
  const [view, setView]           = useState("pending"); // "pending" | "verified"

  useEffect(() => { loadHifzProgress(); }, [students]);

  const loadHifzProgress = async () => {
    try {
      const { data } = await supabase.from("hifz_progress").select("*");
      setHifzData(data || []);
    } catch (e) { console.error("hifz_progress load:", e.message); }
  };

  // Merge hifz_progress with students
  const enriched = students.map(s => {
    const hp = hifzData.find(h => h.student_id === s.id || h.studentId === s.id);
    // Also check hifz_logs passed from App.js
    const logs = hifzLogs.filter(l => l.studentId === s.id || l.student_id === s.id);
    const latestLog = logs.sort((a,b) => new Date(b.created_at||0) - new Date(a.created_at||0))[0];
    const manzil = hp?.manzil ?? latestLog?.manzil ?? 0;
    const percent = hp?.percent ?? latestLog?.percent ?? manzil;
    const ustadVerified = hp?.ustad_verified || false;
    return { ...s, manzil, percent, hp, ustadVerified, streakDays: hp?.streak_days || latestLog?.streak_days || 0 };
  });

  // Students approaching 100% (>= 80%) and not yet verified
  const approaching = enriched.filter(s => s.manzil >= 80 && !s.ustadVerified)
    .sort((a,b) => b.manzil - a.manzil);

  // Already verified Huffaz
  const verified = enriched.filter(s => s.ustadVerified)
    .sort((a,b) => b.manzil - a.manzil);

  // ── Verify Complete ────────────────────────────────────────────────────────
  const verifyComplete = async (s) => {
    setVerifying(p => ({ ...p, [s.id]: true }));
    try {
      // Update hifz_progress
      if (s.hp?.id) {
        await supabase.from("hifz_progress").update({ ustad_verified: true, manzil: 100 }).eq("id", s.hp.id);
      } else {
        await supabase.from("hifz_progress").insert([{
          student_id:     s.id,
          student_name:   s.name,
          manzil:         100,
          ustad_verified: true,
          streak_days:    s.streakDays || 0,
          created_at:     new Date().toISOString(),
        }]);
      }
      // ── Auto-nominate Hafiz-e-Quran award ─────────────────────────────────
      const hInfo = HOUSES.find(h => h.id === s.houseId);
      await supabase.from("award_nominations").insert([{
        award_key:    "hafiz",
        award_title:  "Hafiz Award",
        student_id:   s.id,
        student_name: s.name,
        house_id:     s.houseId || null,
        house_name:   hInfo?.nameEn || null,
        reason:       "Madrasa Teacher confirmed Hifz-ul-Quran completion — Auto Nomination",
        period:       "dini",
        status:       "pending",
        nominated_by: "madrasa_ustad_verification",
        created_at:   new Date().toISOString(),
      }]);
      loadHifzProgress();
    } catch (e) { console.error("محفوظ نہیں ہو سکا:", e.message); }
    setVerifying(p => ({ ...p, [s.id]: false }));
  };

  // ── Progress bar ───────────────────────────────────────────────────────────
  const ManzilBar = ({ val }) => {
    const pct = Math.min(100, val);
    const color = pct >= 100 ? "#4ade80" : pct >= 90 ? G : pct >= 80 ? "#fb923c" : "#60a5fa";
    return (
      <div style={{ height:"6px", background:"rgba(255,255,255,0.08)", borderRadius:"3px", overflow:"hidden", marginTop:"4px" }}>
        <div style={{ width:`${pct}%`, height:"100%", background:color, borderRadius:"3px", transition:"width 0.5s" }} />
      </div>
    );
  };

  return (
    <div style={{ direction:"ltr", fontFamily:"'Public Sans',sans-serif" }}>

      {/* Tab toggle */}
      <div style={{ display:"flex", gap:"6px", marginBottom:"18px" }}>
        {[
          ["pending",  `⏳ Approaching (${approaching.length})`],
          ["verified", `✅ Completed Huffaz (${verified.length})`],
        ].map(([v,l]) => (
          <button key={v} onClick={() => setView(v)}
            style={{ padding:"8px 18px", borderRadius:"10px", border:"none", cursor:"pointer",
              fontFamily:"inherit", fontSize:"0.72rem", fontWeight:view===v?"700":"400",
              background:view===v?`linear-gradient(135deg,${G},#b8960a)`:"rgba(255,255,255,0.06)",
              color:view===v?N:"rgba(255,255,255,0.5)" }}>
            {l}
          </button>
        ))}
      </div>

      {/* ── PENDING / APPROACHING VIEW ────────────────────────────────────── */}
      {view === "pending" && (
        <>
          <div style={{ fontSize:"0.68rem", color:"rgba(255,255,255,0.4)", marginBottom:"14px" }}>
            80%+ Complete Students — Pending Confirmation
          </div>
          {approaching.length === 0 && (
            <div style={{ ...glass, padding:"40px", textAlign:"center", color:"rgba(255,255,255,0.3)", fontSize:"0.75rem" }}>
              <span className="ur">ابھی کوئی طالب علم ۸۰٪ کے قریب نہیں</span>
            </div>
          )}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:"14px" }}>
            {approaching.map(s => {
              const hInfo = HOUSES.find(h => h.id === s.houseId);
              const isComplete = s.manzil >= 100;
              const isVerifying = verifying[s.id];
              return (
                <div key={s.id} style={{ ...glass, padding:"18px",
                  borderTop:`3px solid ${isComplete ? "#4ade80" : G}`, position:"relative" }}>
                  {/* Student header */}
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"12px" }}>
                    <div>
                      <div style={{ fontSize:"0.88rem", fontWeight:"800", color:"#f1f5f9" }}>{s.name}</div>
                      <div style={{ fontSize:"0.6rem", color:"rgba(255,255,255,0.35)", marginTop:"2px" }}>
                        {s.grade}
                        {hInfo && <span style={{ color:hInfo.color, marginRight:"6px" }}> • {hInfo.nameEn}</span>}
                      </div>
                    </div>
                    <div style={{ fontSize:"1.8rem", fontWeight:"900",
                      color:isComplete?"#4ade80":G, lineHeight:1 }}>
                      {s.manzil}%
                    </div>
                  </div>
                  {/* Progress bar */}
                  <ManzilBar val={s.manzil} />
                  <div style={{ fontSize:"0.58rem", color:"rgba(255,255,255,0.3)", marginTop:"3px", marginBottom:"12px" }}>
                    Hifz Progress — {s.manzil}/100 Manzils
                    {s.streakDays > 0 && <span style={{ marginRight:"8px", color:G }}> • 🔥 {s.streakDays} days</span>}
                  </div>
                  {/* Verify button */}
                  {isComplete ? (
                    <button onClick={() => verifyComplete(s)} disabled={isVerifying}
                      style={{ width:"100%", padding:"10px", borderRadius:"10px", border:"none",
                        cursor:isVerifying?"not-allowed":"pointer", fontFamily:"inherit",
                        fontSize:"0.78rem", fontWeight:"800",
                        background:`linear-gradient(135deg,#4ade80,#16a34a)`,
                        color:N, opacity:isVerifying?0.6:1 }}>
                      {isVerifying ? "Confirming..." : "✅ Confirm Hifz Complete"}
                    </button>
                  ) : (
                    <div style={{ padding:"8px 12px", borderRadius:"8px",
                      background:"rgba(212,175,55,0.06)", fontSize:"0.65rem",
                      color:"rgba(255,255,255,0.4)", textAlign:"center" }}>
                      {100 - s.manzil}% remaining — confirmation possible when complete
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ── VERIFIED HUFFAZ VIEW ──────────────────────────────────────────── */}
      {view === "verified" && (
        <>
          <div style={{ fontSize:"0.68rem", color:"rgba(255,255,255,0.4)", marginBottom:"14px" }}>
            List of Confirmed Huffaz
          </div>
          {verified.length === 0 && (
            <div style={{ ...glass, padding:"40px", textAlign:"center", color:"rgba(255,255,255,0.3)", fontSize:"0.75rem" }}>
              No confirmed hafiz yet
            </div>
          )}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:"12px" }}>
            {verified.map((s, i) => {
              const hInfo = HOUSES.find(h => h.id === s.houseId);
              const rankLabels = ["🥇","🥈","🥉","✨"];
              return (
                <div key={s.id} style={{ ...glass, padding:"18px",
                  background:"rgba(74,222,128,0.05)", borderTop:"3px solid #4ade80" }}>
                  <div style={{ fontSize:"1.5rem", marginBottom:"6px" }}>
                    {rankLabels[i] || "📖"}
                  </div>
                  <div style={{ fontSize:"0.88rem", fontWeight:"800", color:"#f1f5f9", marginBottom:"3px" }}>{s.name}</div>
                  <div style={{ fontSize:"0.6rem", color:"rgba(255,255,255,0.4)", marginBottom:"10px" }}>
                    {s.grade}
                    {hInfo && <span style={{ color:hInfo.color, marginRight:"6px" }}> • {hInfo.nameEn}</span>}
                  </div>
                  <div style={{ display:"flex", gap:"6px", flexWrap:"wrap" }}>
                    <span style={{ padding:"3px 10px", borderRadius:"20px", fontSize:"0.6rem", fontWeight:"800",
                      background:"rgba(74,222,128,0.15)", color:"#4ade80", border:"1px solid rgba(74,222,128,0.3)" }}>
                      ✅ Hafiz-ul-Quran
                    </span>
                    {s.streakDays > 0 && (
                      <span style={{ padding:"3px 10px", borderRadius:"20px", fontSize:"0.6rem", fontWeight:"700",
                        background:"rgba(212,175,55,0.12)", color:G }}>
                        🔥 {s.streakDays} day streak
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
