/* eslint-disable */
import { useState, useEffect } from "react";
import { supabase } from "../../supabase";
import { HOUSES } from "../../constants";
import NamazAttendance  from "./NamazAttendance";
import SabaqTracker     from "./SabaqTracker";
import TajweedAssessment from "./TajweedAssessment";
import HifzVerification from "./HifzVerification";

const G  = "#d4af37";
const N  = "#0f172a";
const N2 = "#1e293b";
const glass = {
  background: "rgba(255,255,255,0.07)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: "16px",
};

const ALLOWED_ROLES = ["madrasa", "madrasaustad", "director", "admin"];

const TABS = [
  { id:"namaz",    icon:"🕌", urdu:"Namaz Attendance",      en:"Namaz Attendance"   },
  { id:"sabaq",    icon:"📖", urdu:"Lesson / Hifz",        en:"Sabaq / Hifz"       },
  { id:"tajweed",  icon:"🎙️", urdu:"Tajweed Assessment",     en:"Tajweed Assessment" },
  { id:"dini",     icon:"🏆", urdu:"Dini Awards",     en:"Dini Awards"        },
];

// Weekly workflow reminders
const WORKFLOW = [
  { day:"Monday",        dayEn:"Monday",    task:"Mark Namaz Attendance",               icon:"🕌" },
  { day:"Tuesday",       dayEn:"Tuesday",   task:"Tajweed Observation & Ranking",           icon:"🎙️" },
  { day:"Thursday",    dayEn:"Thursday",  task:"Update HVS Dini Score",          icon:"📊" },
  { day:"27-28 Date", dayEn:"Month-end", task:"Nominate for Tajweed Award",          icon:"✍️" },
];

export default function MadrasaUstad({ students = [], hifzLogs = [], userRole, addData }) {
  const [tab, setTab]           = useState("namaz");
  const [nominations, setNominations] = useState([]);
  const [statsLoaded, setStatsLoaded] = useState(false);
  const [stats, setStats]       = useState({ namaz:0, sabaq:0, hafiz:0, pendingNom:0 });

  // ── Role guard ────────────────────────────────────────────────────────────
  if (!ALLOWED_ROLES.includes(userRole)) {
    return (
      <div style={{ minHeight:"60vh", display:"flex", alignItems:"center", justifyContent:"center",
        fontFamily:"'Public Sans',sans-serif", direction:"ltr" }}>
        <div style={{ textAlign:"center", color:"#f87171", fontSize:"1rem", fontWeight:"700" }}>
          ⛔ You do not have access to the Madrasa Teacher portal
          <div style={{ fontSize:"0.72rem", color:"rgba(255,255,255,0.3)", marginTop:"8px", fontWeight:"400" }}>
            Only Madrasa Teachers can access this page
          </div>
        </div>
      </div>
    );
  }

  // ── Load summary stats ────────────────────────────────────────────────────
  useEffect(() => { loadStats(); }, [students]);

  const loadStats = async () => {
    try {
      const today = new Date().toISOString().slice(0,10);
      const thisMonth = new Date().toISOString().slice(0,7);

      const [namazRes, sabaqRes, hafizRes, nomRes] = await Promise.all([
        supabase.from("namaz_attendance").select("student_id", { count:"exact" }).eq("date", today),
        supabase.from("sabaq_streaks").select("student_id", { count:"exact" }).gt("current_streak", 0),
        supabase.from("hifz_progress").select("student_id", { count:"exact" }).eq("ustad_verified", true),
        supabase.from("award_nominations").select("id", { count:"exact" }).eq("status","pending"),
      ]);
      setStats({
        namaz:      namazRes.count || 0,
        sabaq:      sabaqRes.count || 0,
        hafiz:      hafizRes.count || 0,
        pendingNom: nomRes.count   || 0,
      });
      setStatsLoaded(true);
    } catch (e) { console.error("stats:", e.message); }
  };

  // ── Dini nominations (pending) ────────────────────────────────────────────
  useEffect(() => { if (tab === "dini") loadNominations(); }, [tab]);

  const loadNominations = async () => {
    try {
      const { data } = await supabase
        .from("award_nominations")
        .select("*")
        .in("period", ["dini","weekly","monthly"])
        .order("created_at", { ascending:false });
      setNominations(data || []);
    } catch (e) { console.error("nominations:", e.message); }
  };

  // ── Today's day name ──────────────────────────────────────────────────────
  const dayNames = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Week"];
  const todayDay = dayNames[new Date().getDay()];

  return (
    <div style={{ minHeight:"100vh",
      background:"linear-gradient(160deg,#0f172a 0%,#0d1f3c 50%,#0a1628 100%)",
      padding:"24px 20px", fontFamily:"'Public Sans',sans-serif", direction:"ltr" }}>

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start",
        marginBottom:"24px", flexWrap:"wrap", gap:"12px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
          <div style={{ width:"48px", height:"48px", borderRadius:"14px",
            background:`linear-gradient(135deg,${G},#b8960a)`,
            display:"flex", alignItems:"center", justifyContent:"center",
            boxShadow:`0 4px 20px rgba(212,175,55,0.4)`, fontSize:"1.5rem" }}>
            🕌
          </div>
          <div>
            <h1 style={{ margin:0, fontSize:"1.45rem", fontWeight:"900", color:"#f1f5f9" }}>Madrasa Teacher Portal</h1>
            <p style={{ margin:0, fontSize:"0.7rem", color:`rgba(212,175,55,0.65)`, fontWeight:"500" }}>
              Madrasa Ustad Dashboard • Today: {todayDay}
            </p>
          </div>
        </div>
      </div>

      {/* ── Stats cards ────────────────────────────────────────────────────── */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))", gap:"12px", marginBottom:"24px" }}>
        {[
          { label:"Today Namaz", labelEn:"Today Namaz", value:stats.namaz, icon:"🕌", color:"#60a5fa" },
          { label:"Active Streaks", labelEn:"Active Streaks", value:stats.sabaq, icon:"🔥", color:"#fb923c" },
          { label:"Huffaz",      labelEn:"Huffaz",         value:stats.hafiz, icon:"📖", color:"#4ade80" },
          { label:"Pending", labelEn:"Pending Noms",  value:stats.pendingNom, icon:"⏳", color:G },
        ].map(c => (
          <div key={c.label} style={{ ...glass, padding:"16px", textAlign:"center",
            borderTop:`3px solid ${c.color}30`, borderBottom:"none" }}>
            <div style={{ fontSize:"1.6rem", marginBottom:"4px" }}>{c.icon}</div>
            <div style={{ fontSize:"1.8rem", fontWeight:"900", color:c.color, lineHeight:1 }}>{c.value}</div>
            <div style={{ fontSize:"0.6rem", color:"rgba(255,255,255,0.5)", marginTop:"3px" }}>{c.label}</div>
            <div style={{ fontSize:"0.5rem", color:"rgba(255,255,255,0.2)" }}>{c.labelEn}</div>
          </div>
        ))}
      </div>

      {/* ── Weekly workflow reminder ──────────────────────────────────────── */}
      <div style={{ ...glass, padding:"14px 18px", marginBottom:"22px", borderRight:`3px solid ${G}` }}>
        <div style={{ fontSize:"0.6rem", color:`rgba(212,175,55,0.6)`, fontWeight:"700", letterSpacing:"0.1em", marginBottom:"8px" }}>
          Weekly Workflow — WEEKLY WORKFLOW
        </div>
        <div style={{ display:"flex", gap:"10px", flexWrap:"wrap" }}>
          {WORKFLOW.map(w => (
            <div key={w.day} style={{ padding:"8px 14px", borderRadius:"10px",
              background: w.day === todayDay ? `rgba(212,175,55,0.15)` : "rgba(255,255,255,0.04)",
              border:`1px solid ${w.day === todayDay ? "rgba(212,175,55,0.4)" : "rgba(255,255,255,0.07)"}`,
              flex:"1", minWidth:"120px" }}>
              <div style={{ fontSize:"0.62rem", fontWeight:"800",
                color: w.day === todayDay ? G : "rgba(255,255,255,0.5)", marginBottom:"3px" }}>
                {w.icon} {w.day}
                {w.day === todayDay && <span style={{ marginRight:"4px", fontSize:"0.52rem" }}> ← Today</span>}
              </div>
              <div style={{ fontSize:"0.6rem", color:"rgba(255,255,255,0.4)" }}>{w.task}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Tab bar ────────────────────────────────────────────────────────── */}
      <div style={{ display:"flex", gap:"6px", flexWrap:"wrap", marginBottom:"22px" }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ padding:"10px 20px", borderRadius:"12px", border:"none", cursor:"pointer",
              fontFamily:"inherit", fontSize:"0.75rem", fontWeight:tab===t.id?"800":"400",
              background:tab===t.id?`linear-gradient(135deg,${G},#b8960a)`:"rgba(255,255,255,0.06)",
              color:tab===t.id?N:"rgba(255,255,255,0.55)",
              display:"flex", alignItems:"center", gap:"6px" }}>
            <span>{t.icon}</span>
            <div>
              <div>{t.urdu}</div>
              <div style={{ fontSize:"0.5rem", opacity:0.6, fontWeight:"400" }}>{t.en}</div>
            </div>
          </button>
        ))}
      </div>

      {/* ── Tab content ────────────────────────────────────────────────────── */}
      <div>
        {tab === "namaz" && (
          <NamazAttendance students={students} role={userRole} />
        )}

        {tab === "sabaq" && (
          <SabaqTracker students={students} role={userRole} />
        )}

        {tab === "tajweed" && (
          <TajweedAssessment students={students} role={userRole} />
        )}

        {tab === "dini" && (
          <DiniAwardsTab
            students={students}
            hifzLogs={hifzLogs}
            nominations={nominations}
            userRole={userRole}
            onRefresh={loadNominations}
          />
        )}
      </div>
    </div>
  );
}

// ── Dini Awards Tab ────────────────────────────────────────────────────────────
// Shows HifzVerification + nominations list
function DiniAwardsTab({ students, hifzLogs, nominations, userRole, onRefresh }) {
  const [diniView, setDiniView] = useState("hifz"); // "hifz" | "nominations"
  const pendingDini = nominations.filter(n => n.status === "pending");
  const approvedDini = nominations.filter(n => n.status === "approved");

  const approveNomination = async (nom) => {
    try {
      await supabase.from("award_nominations").update({ status:"approved" }).eq("id", nom.id);
      await supabase.from("award_winners").insert([{
        award_key:   nom.award_key,
        award_title: nom.award_title,
        winner_name: nom.student_name,
        house_id:    nom.house_id,
        period:      nom.period || "dini",
        reason:      nom.reason,
        created_at:  new Date().toISOString(),
      }]);
      onRefresh();
    } catch (e) { console.error("محفوظ نہیں ہو سکا:", e.message); }
  };

  const glass = { background:"rgba(255,255,255,0.07)", backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:"16px" };

  return (
    <div style={{ direction:"ltr", fontFamily:"'Public Sans',sans-serif" }}>
      {/* Sub tabs */}
      <div style={{ display:"flex", gap:"6px", marginBottom:"18px" }}>
        {[
          ["hifz",         "📖 Hifz Confirm"],
          ["nominations",  `✍️ Nominations (${pendingDini.length})`],
          ["approved",     `✅ Approved (${approvedDini.length})`],
        ].map(([v,l]) => (
          <button key={v} onClick={() => setDiniView(v)}
            style={{ padding:"8px 16px", borderRadius:"10px", border:"none", cursor:"pointer",
              fontFamily:"inherit", fontSize:"0.72rem", fontWeight:diniView===v?"700":"400",
              background:diniView===v?`linear-gradient(135deg,${G},#b8960a)`:"rgba(255,255,255,0.06)",
              color:diniView===v?N:"rgba(255,255,255,0.5)" }}>
            {l}
          </button>
        ))}
      </div>

      {diniView === "hifz" && (
        <HifzVerification students={students} hifzLogs={hifzLogs} role={userRole} />
      )}

      {diniView === "nominations" && (
        <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
          {pendingDini.length === 0 && (
            <div style={{ ...glass, padding:"40px", textAlign:"center", color:"rgba(255,255,255,0.3)", fontSize:"0.75rem" }}>
              Any Pending Nomination No
            </div>
          )}
          {pendingDini.map(nom => {
            const hInfo = HOUSES.find(h => h.id === nom.house_id);
            return (
              <div key={nom.id} style={{ ...glass, padding:"16px",
                display:"flex", justifyContent:"space-between", alignItems:"center", gap:"12px", flexWrap:"wrap" }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:"0.58rem", color:"rgba(212,175,55,0.6)", fontWeight:"700", marginBottom:"3px" }}>
                    {nom.award_title || nom.award_key} — {nom.period}
                  </div>
                  <div style={{ fontSize:"0.88rem", fontWeight:"800", color:"#f1f5f9" }}>{nom.student_name}</div>
                  {hInfo && (
                    <span style={{ display:"inline-block", marginTop:"4px", padding:"2px 8px", borderRadius:"12px",
                      fontSize:"0.55rem", background:`${hInfo.color}20`, color:hInfo.color, fontWeight:"700" }}>
                      {hInfo.emoji} {hInfo.nameEn}
                    </span>
                  )}
                  {nom.reason && (
                    <div style={{ fontSize:"0.65rem", color:"rgba(255,255,255,0.35)", marginTop:"6px", lineHeight:1.5 }}>
                      {nom.reason}
                    </div>
                  )}
                  <div style={{ fontSize:"0.55rem", color:"rgba(255,255,255,0.2)", marginTop:"4px" }}>
                    By: {nom.nominated_by || "—"} • {new Date(nom.created_at).toLocaleDateString("en")}
                  </div>
                </div>
                {["director","admin"].includes(userRole) && (
                  <button onClick={() => approveNomination(nom)}
                    style={{ padding:"8px 16px", borderRadius:"9px", border:"none", cursor:"pointer",
                      fontFamily:"inherit", fontSize:"0.7rem", fontWeight:"700",
                      background:"rgba(74,222,128,0.15)", color:"#4ade80",
                      border:"1px solid rgba(74,222,128,0.25)" }}>
                    ✅ Approved
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {diniView === "approved" && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:"12px" }}>
          {approvedDini.length === 0 && (
            <div style={{ ...glass, padding:"40px", textAlign:"center", color:"rgba(255,255,255,0.3)", fontSize:"0.75rem", gridColumn:"1/-1" }}>
              No approved nominations yet
            </div>
          )}
          {approvedDini.map((nom, i) => {
            const hInfo = HOUSES.find(h => h.id === nom.house_id);
            return (
              <div key={nom.id} style={{ ...glass, padding:"16px",
                background:"rgba(74,222,128,0.04)", borderTop:"3px solid #4ade80" }}>
                <div style={{ fontSize:"0.58rem", color:"rgba(74,222,128,0.6)", fontWeight:"700", marginBottom:"4px" }}>
                  ✅ Approved — {nom.period}
                </div>
                <div style={{ fontSize:"0.85rem", fontWeight:"800", color:"#f1f5f9" }}>{nom.student_name}</div>
                <div style={{ fontSize:"0.7rem", color:G, fontWeight:"700", marginTop:"3px" }}>
                  {nom.award_title || nom.award_key}
                </div>
                {hInfo && (
                  <span style={{ display:"inline-block", marginTop:"6px", padding:"2px 8px", borderRadius:"12px",
                    fontSize:"0.55rem", background:`${hInfo.color}20`, color:hInfo.color }}>
                    {hInfo.emoji} {hInfo.nameEn}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
