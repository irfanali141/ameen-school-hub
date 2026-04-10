/* eslint-disable */
import { useState, useEffect, useMemo } from "react";
import { confirm } from '../ui/ConfirmDialog';
import { toast } from "../../components/ui/Toast";
import { getData, updateData } from "../../supabase";
import { C, HOUSES, sLabel } from "../../constants";

// ─── Constants ────────────────────────────────────────────────────────────────

const WL_THRESHOLDS = { zabt:8, safai:8, josh:5, qiyadat:5, ilm:12, haziri:5, akhlaq:8, dini_ilm:5 };

const CAT_INFO = {
  zabt:    { label:"Discipline & Order",    icon:"⚔️", max:15, role:"House Master" },
  safai:   { label:"Cleanliness",         icon:"🧹", max:15, role:"House Master" },
  josh:    { label:"House Spirit",     icon:"🔥", max:10, role:"House Master" },
  qiyadat: { label:"Leadership",         icon:"👑", max:10, role:"House Master" },
  ilm:     { label:"Knowledge & Education",  icon:"📚", max:25, role:"Class Teacher"  },
  haziri:  { label:"Attendance",         icon:"✅", max:10, role:"Class Teacher"  },
  akhlaq:  { label:"Morality",     icon:"💎", max:15, role:"Madrasa Ustad" },
  dini_ilm:{ label:"Islamic Studies",     icon:"📖", max:10, role:"Madrasa Ustad" },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const todayStr = () => new Date().toISOString().slice(0,10);

const daysSince = (dateStr) => {
  if (!dateStr) return 0;
  return Math.max(0, Math.floor((new Date() - new Date(dateStr)) / 86400000));
};

const urgColor = (days) => days >= 7 ? "#f87171" : days >= 3 ? "#fb923c" : "#facc15";

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ icon, label, value, color }) {
  return (
    <div style={{ background:"rgba(255,255,255,0.06)", border:`1px solid ${color}30`,
      borderTop:`3px solid ${color}`, borderRadius:"14px", padding:"14px 16px", textAlign:"center" }}>
      <div style={{ fontSize:"1.3rem", marginBottom:"4px" }}>{icon}</div>
      <div style={{ fontSize:"1.7rem", fontWeight:"900", color }}>{value}</div>
      <div style={{ fontSize:"0.62rem", color:"rgba(255,255,255,0.45)", marginTop:"2px" }}>{label}</div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function WatchList({ students=[], addData, userRole="" }) {

  const [wlData, setWlData]             = useState([]);
  const [loading, setLoading]           = useState(true);
  const [tab, setTab]                   = useState("active");
  const [houseFilter, setHouseFilter]   = useState("all");

  // Add form
  const [addSearch, setAddSearch]       = useState("");
  const [addStudent, setAddStudent]     = useState(null);
  const [addCat, setAddCat]             = useState("zabt");
  const [addReason, setAddReason]       = useState("");
  const [addSaving, setAddSaving]       = useState(false);

  // Individual daily score
  const [dailyScores, setDailyScores]   = useState({});
  const [savingKey, setSavingKey]       = useState(null);

  const [toast, setToast]               = useState("");

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2800); };

  useEffect(() => {
    setLoading(true);
    getData("watch_list").then(d => {
      if (d && !d.error) setWlData(d);
      setLoading(false);
    });
  }, []);

  // Filtered data
  const visibleData = useMemo(() => {
    if (houseFilter === "all") return wlData;
    return wlData.filter(w => w.house_id === houseFilter);
  }, [wlData, houseFilter]);

  const activeList  = visibleData.filter(w => w.status === "active");
  const removedList = visibleData.filter(w => w.status === "removed");

  // Student search for Add tab
  const filteredStudents = useMemo(() => {
    if (!addSearch.trim()) return [];
    const q = addSearch.toLowerCase();
    return students.filter(s => (s.name||"").toLowerCase().includes(q)).slice(0, 8);
  }, [addSearch, students]);

  const handleRemove = async (wl) => {
    if (!await confirm(`${wl.student_name} Remove from Watch List?`)) return;
    const key = `${wl.student_id}-${wl.category}`;
    setSavingKey(key);
    if (wl.id) {
      await updateData("watch_list", wl.id, { status:"removed", removed_date:todayStr() });
    }
    setWlData(prev => prev.map(w =>
      w.id === wl.id ? {...w, status:"removed", removed_date:todayStr()} : w
    ));
    setSavingKey(null);
    showToast(`✅ ${wl.student_name} removed from Watch List`);
  };

  const handleAdd = async () => {
    if (!addStudent) { toast.warning("طالب علم منتخب کریں"); return; }
    if (!addReason.trim()) { toast.warning("وجہ درج کریں"); return; }

    const alreadyActive = wlData.find(w =>
      w.student_id === addStudent.id && w.category === addCat && w.status === "active"
    );
    if (alreadyActive) { toast.warning("یہ طالب علم اس زمرے میں پہلے سے نگرانی کی فہرست میں ہے"); return; }

    setAddSaving(true);
    const entry = {
      student_id:   addStudent.id,
      student_name: addStudent.name,
      house_id:     addStudent.houseId,
      category:     addCat,
      reason:       addReason.trim(),
      added_date:   todayStr(),
      status:       "active",
      manual:       true,
    };
    await addData("watch_list", entry);
    setWlData(prev => [...prev, entry]);
    setAddStudent(null); setAddSearch(""); setAddReason(""); setAddSaving(false);
    setTab("active");
    showToast(`⚠️ ${addStudent.name} added to Watch List`);
  };

  const saveDailyScore = async (wl) => {
    const key = `${wl.student_id}-${wl.category}`;
    const raw = dailyScores[key];
    if (raw === undefined || raw === "") { toast.warning("اسکور درج کریں"); return; }
    setSavingKey(key);
    await addData("hvs_exceptions", {
      student_id:   wl.student_id,
      student_name: wl.student_name,
      house_id:     wl.house_id,
      category:     wl.category,
      adjustment:   Number(raw),
      reason:       "Watch List — Individual Daily Entry",
      date:         todayStr(),
      is_watchlist: true,
    });
    setSavingKey(null);
    showToast(`💾 ${wl.student_name} 's today's score saved`);
  };

  // ── Styles ──
  const G     = "#d4af37";
  const glass = { background:"rgba(255,255,255,0.06)", backdropFilter:"blur(20px)",
    WebkitBackdropFilter:"blur(20px)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:"16px" };
  const lbl   = { fontSize:"0.68rem", color:"rgba(212,175,55,0.85)", marginBottom:"6px",
    display:"block", fontWeight:"700" };
  const sel   = { padding:"10px 14px", borderRadius:"10px", border:"1px solid rgba(212,175,55,0.25)",
    background:"rgba(255,255,255,0.06)", color:"#f1f5f9", fontSize:"0.78rem",
    fontFamily:"'Public Sans',sans-serif", outline:"none", width:"100%",
    boxSizing:"border-box", colorScheme:"dark" };

  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div style={{ minHeight:"100vh",
      background:"linear-gradient(160deg,#0f172a 0%,#1a0505 40%,#0a1628 100%)",
      padding:"24px 16px", fontFamily:"'Public Sans',sans-serif", direction:"ltr" }}>

      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", gap:"14px", marginBottom:"24px" }}>
        <div style={{ width:"46px", height:"46px", borderRadius:"14px", flexShrink:0,
          background:"linear-gradient(135deg,#dc2626,#991b1b)",
          display:"flex", alignItems:"center", justifyContent:"center",
          boxShadow:"0 4px 20px rgba(220,38,38,0.45)", fontSize:"1.4rem" }}>⚠️</div>
        <div style={{ flex:1 }}>
          <h2 style={{ margin:0, fontSize:"1.3rem", fontWeight:"800", color:"#f1f5f9" }}>
            Watch List — Watch List
          </h2>
          <p style={{ margin:0, fontSize:"0.7rem", color:"rgba(248,113,113,0.8)" }}>
            Special monitoring of weak students — 3 consecutive days below threshold → auto-added
          </p>
        </div>
        {activeList.length > 0 && (
          <div style={{ background:"rgba(220,38,38,0.2)", border:"2px solid #dc2626",
            borderRadius:"12px", padding:"8px 16px", textAlign:"center" }}>
            <div style={{ fontSize:"1.8rem", fontWeight:"900", color:"#f87171",
              lineHeight:1 }}>{activeList.length}</div>
            <div style={{ fontSize:"0.55rem", color:"rgba(255,255,255,0.5)", marginTop:"2px" }}>Active</div>
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div style={{ background:"rgba(74,222,128,0.1)", border:"1px solid rgba(74,222,128,0.3)",
          borderRadius:"12px", padding:"12px 20px", marginBottom:"16px", textAlign:"center",
          fontSize:"0.8rem", color:"#4ade80", fontWeight:"700" }}>{toast}</div>
      )}

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",
        gap:"12px", marginBottom:"20px" }}>
        <StatCard icon="🚨" label="Active" value={activeList.length}   color="#f87171"/>
        <StatCard icon="✅" label="Resolved" value={removedList.length} color="#4ade80"/>
        <StatCard icon="📋" label="Total Record" value={wlData.length}   color={G}/>
        <StatCard icon="📅" label="Average Days" color="#fb923c"
          value={activeList.length
            ? Math.round(activeList.reduce((s,w) => s + daysSince(w.added_date), 0) / activeList.length)
            : 0}/>
      </div>

      {/* House filter */}
      <div style={{ display:"flex", gap:"6px", flexWrap:"wrap", marginBottom:"18px" }}>
        {[["all","🏠 All House"], ...HOUSES.map(h=>[h.id,`${h.emoji} ${h.nameEn}`])].map(([v,l]) => (
          <button key={v} onClick={() => setHouseFilter(v)} style={{
            padding:"6px 14px", borderRadius:"20px", cursor:"pointer", fontFamily:"inherit",
            border:`1px solid ${houseFilter===v?"#dc2626":"rgba(255,255,255,0.1)"}`,
            background: houseFilter===v ? "rgba(220,38,38,0.15)" : "transparent",
            color: houseFilter===v ? "#f87171" : "rgba(255,255,255,0.45)",
            fontSize:"0.7rem", fontWeight:houseFilter===v?"700":"400" }}>{l}</button>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", gap:"4px", background:"rgba(255,255,255,0.05)",
        borderRadius:"12px", padding:"4px", marginBottom:"20px" }}>
        {[
          ["active",  `⚠️ Active (${activeList.length})`],
          ["add", "✋ Manual Add"],
          ["history", `✅ Date (${removedList.length})`],
        ].map(([v,l]) => (
          <button key={v} onClick={() => setTab(v)} style={{
            flex:1, padding:"9px 6px", borderRadius:"9px", border:"none",
            cursor:"pointer", fontFamily:"inherit", fontSize:"0.72rem",
            fontWeight: tab===v ? "800" : "500",
            background: tab===v ? "rgba(220,38,38,0.25)" : "transparent",
            color: tab===v ? "#f87171" : "rgba(255,255,255,0.5)" }}>{l}</button>
        ))}
      </div>

      {/* ══════ TAB: ACTIVE ══════ */}
      {tab === "active" && (
        loading
          ? <div style={{ textAlign:"center", padding:"50px", color:"rgba(255,255,255,0.3)",
              fontSize:"0.8rem" }}>Loading...</div>
          : activeList.length === 0
          ? (
            <div style={{ ...glass, padding:"50px", textAlign:"center" }}>
              <div style={{ fontSize:"3rem", marginBottom:"12px" }}>✅</div>
              <div style={{ color:"#4ade80", fontWeight:"800", fontSize:"0.92rem", marginBottom:"6px" }}>
                <span className="ur">نگرانی کی فہرست میں کوئی طالب علم نہیں</span>
              </div>
              <div style={{ color:"rgba(255,255,255,0.35)", fontSize:"0.7rem" }}>
                All students are above the threshold
              </div>
            </div>
          )
          : activeList.map((wl, i) => {
            const house   = HOUSES.find(h => h.id === wl.house_id) || {};
            const student = students.find(s => s.id === wl.student_id) || {};
            const cat     = CAT_INFO[wl.category] || { label:wl.category, icon:"❓", max:10 };
            const days    = daysSince(wl.added_date);
            const uc      = urgColor(days);
            const key     = `${wl.student_id}-${wl.category}`;
            const scoreVal = dailyScores[key] !== undefined ? Number(dailyScores[key]) : 0;
            const isSaving = savingKey === key;

            return (
              <div key={wl.id || i} style={{ marginBottom:"14px", borderRadius:"16px",
                overflow:"hidden", border:`1px solid rgba(220,38,38,0.35)`,
                borderRight:`4px solid ${uc}`,
                background:"rgba(220,38,38,0.05)" }}>

                {/* Student row */}
                <div style={{ display:"flex", alignItems:"center", gap:"12px",
                  padding:"14px 18px", borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
                  {/* Avatar */}
                  <div style={{ width:"42px", height:"42px", borderRadius:"50%", flexShrink:0,
                    background:"rgba(220,38,38,0.2)", border:`2px solid ${uc}`,
                    display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.1rem" }}>
                    {wl.manual ? "✋" : "🤖"}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:"0.88rem", fontWeight:"800", color:"#f1f5f9" }}>
                      {wl.student_name || student.name || "Unknown"}
                    </div>
                    <div style={{ display:"flex", gap:"10px", marginTop:"3px", flexWrap:"wrap" }}>
                      <span style={{ fontSize:"0.62rem", color:house.color||G }}>
                        {house.emoji} {house.nameEn}
                      </span>
                      {student.grade && (
                        <span style={{ fontSize:"0.62rem", color:"rgba(255,255,255,0.38)" }}>
                          {student.grade}
                        </span>
                      )}
                      {wl.manual && (
                        <span style={{ fontSize:"0.58rem", color:G }}>✋ Manual</span>
                      )}
                    </div>
                  </div>
                  {/* Category */}
                  <div style={{ background:"rgba(220,38,38,0.15)", border:"1px solid rgba(220,38,38,0.4)",
                    borderRadius:"10px", padding:"6px 12px", textAlign:"center", flexShrink:0 }}>
                    <div style={{ fontSize:"0.9rem" }}>{cat.icon}</div>
                    <div style={{ fontSize:"0.62rem", fontWeight:"800", color:"#f87171",
                      marginTop:"2px" }}>{cat.label}</div>
                    <div style={{ fontSize:"0.52rem", color:"rgba(255,255,255,0.35)" }}>
                      Threshold: {WL_THRESHOLDS[wl.category]||"—"}
                    </div>
                  </div>
                  {/* Days counter */}
                  <div style={{ background:`${uc}18`, border:`1px solid ${uc}50`,
                    borderRadius:"10px", padding:"6px 12px", textAlign:"center", flexShrink:0 }}>
                    <div style={{ fontSize:"1.5rem", fontWeight:"900", color:uc, lineHeight:1 }}>{days}</div>
                    <div style={{ fontSize:"0.52rem", color:"rgba(255,255,255,0.4)", marginTop:"2px" }}>days</div>
                  </div>
                </div>

                {/* Reason */}
                <div style={{ padding:"8px 18px", borderBottom:"1px solid rgba(255,255,255,0.05)",
                  display:"flex", gap:"10px", alignItems:"center" }}>
                  <span style={{ fontSize:"0.68rem", color:"rgba(255,255,255,0.45)", flex:1 }}>
                    📝 {wl.reason || "—"}
                  </span>
                  <span style={{ fontSize:"0.58rem", color:"rgba(255,255,255,0.25)",
                    direction:"ltr", flexShrink:0 }}>{wl.added_date}</span>
                </div>

                {/* Individual daily entry (mandatory) */}
                <div style={{ padding:"14px 18px" }}>
                  <div style={{ fontSize:"0.68rem", color:"#f87171", fontWeight:"800",
                    marginBottom:"12px", display:"flex", alignItems:"center", gap:"6px" }}>
                    <span>⚡</span>
                    <span>Today's Individual Score — required</span>
                    <span style={{ background:"rgba(220,38,38,0.2)", color:"#fca5a5",
                      fontSize:"0.55rem", padding:"2px 7px", borderRadius:"6px",
                      border:"1px solid rgba(220,38,38,0.4)" }}>MANDATORY</span>
                  </div>
                  <div style={{ display:"flex", gap:"10px", alignItems:"center" }}>
                    <div style={{ flex:1 }}>
                      <style>{`input[type='range'].wl-slider::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;border-radius:50%;background:#f87171;border:2px solid #0f172a;cursor:pointer;}`}</style>
                      <input type="range" className="wl-slider"
                        min={0} max={cat.max} step={1} value={scoreVal}
                        onChange={e => setDailyScores(p => ({...p, [key]:Number(e.target.value)}))}
                        style={{ width:"100%", height:"6px", appearance:"none", WebkitAppearance:"none",
                          background:"rgba(255,255,255,0.1)", borderRadius:"3px",
                          accentColor:"#f87171", outline:"none", cursor:"pointer" }}/>
                      <div style={{ display:"flex", justifyContent:"space-between", marginTop:"3px" }}>
                        {[0, Math.round(cat.max*0.25), Math.round(cat.max*0.5),
                          Math.round(cat.max*0.75), cat.max].map(t => (
                          <span key={t} style={{ fontSize:"0.5rem",
                            color: scoreVal>=t ? "#f87171aa" : "rgba(255,255,255,0.18)" }}>{t}</span>
                        ))}
                      </div>
                    </div>
                    {/* Score display */}
                    <div style={{ background:"rgba(220,38,38,0.15)", border:"1px solid rgba(220,38,38,0.4)",
                      borderRadius:"8px", padding:"4px 10px", textAlign:"center",
                      minWidth:"50px", flexShrink:0 }}>
                      <span style={{ fontSize:"1.3rem", fontWeight:"900", color:"#f87171" }}>{scoreVal}</span>
                      <span style={{ fontSize:"0.58rem", color:"rgba(255,255,255,0.35)",
                        display:"block" }}>/{cat.max}</span>
                    </div>
                    {/* Save button */}
                    <button onClick={() => saveDailyScore(wl)} disabled={isSaving}
                      style={{ padding:"9px 14px", borderRadius:"10px", border:"none",
                        cursor: isSaving ? "not-allowed" : "pointer", fontFamily:"inherit",
                        fontSize:"0.72rem", fontWeight:"800", flexShrink:0,
                        background:"linear-gradient(135deg,#dc2626,#b91c1c)", color:"#fff",
                        opacity: isSaving ? 0.6 : 1, boxShadow:"0 2px 10px rgba(220,38,38,0.3)" }}>
                      {isSaving ? "..." : "💾 Saved"}
                    </button>
                    {/* Remove button */}
                    <button onClick={() => handleRemove(wl)} disabled={isSaving}
                      style={{ padding:"9px 12px", borderRadius:"10px", flexShrink:0,
                        border:"1px solid rgba(74,222,128,0.4)", cursor:"pointer",
                        fontFamily:"inherit", fontSize:"0.72rem", fontWeight:"800",
                        background:"rgba(74,222,128,0.1)", color:"#4ade80" }}>
                      ✅ OK
                    </button>
                  </div>
                </div>
              </div>
            );
          })
      )}

      {/* ══════ TAB: ADD MANUALLY ══════ */}
      {tab === "add" && (
        <div style={{ ...glass, padding:"22px" }}>
          <div style={{ fontSize:"0.85rem", fontWeight:"800", color:"#f87171", marginBottom:"18px" }}>
            ✋ Manually Add Student to Watch List
          </div>

          {/* Search student */}
          <div style={{ marginBottom:"14px" }}>
            <label style={lbl}>🔍 Search Student Name</label>
            <input style={{ ...sel, direction:"ltr" }}
              placeholder="Name Write..."
              value={addSearch}
              onChange={e => { setAddSearch(e.target.value); setAddStudent(null); }}/>
            {filteredStudents.length > 0 && !addStudent && (
              <div style={{ background:"#1e293b", border:"1px solid rgba(255,255,255,0.12)",
                borderRadius:"10px", marginTop:"4px", overflow:"hidden" }}>
                {filteredStudents.map(s => (
                  <button key={s.id} onClick={() => { setAddStudent(s); setAddSearch(s.name); }}
                    style={{ width:"100%", padding:"9px 14px", background:"none",
                      border:"none", borderBottom:"1px solid rgba(255,255,255,0.06)",
                      color:"#f1f5f9", fontSize:"0.75rem", cursor:"pointer",
                      fontFamily:"inherit", textAlign:"left",
                      display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <span>{s.name}</span>
                    <span style={{ fontSize:"0.62rem", color:"rgba(255,255,255,0.4)" }}>
                      {s.grade} — {HOUSES.find(h=>h.id===s.houseId)?.nameEn}
                    </span>
                  </button>
                ))}
              </div>
            )}
            {addStudent && (
              <div style={{ marginTop:"6px", padding:"8px 12px",
                background:"rgba(74,222,128,0.1)", border:"1px solid rgba(74,222,128,0.25)",
                borderRadius:"8px", fontSize:"0.72rem", color:"#4ade80", fontWeight:"700" }}>
                ✓ Select: {addStudent.name} — {addStudent.grade} — {HOUSES.find(h=>h.id===addStudent.houseId)?.nameEn}
              </div>
            )}
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px", marginBottom:"14px" }}>
            <div>
              <label style={lbl}>Category — Category</label>
              <select style={sel} value={addCat} onChange={e => setAddCat(e.target.value)}>
                {Object.entries(CAT_INFO).map(([k,v]) => (
                  <option key={k} value={k} style={{background:"#1e293b"}}>
                    {v.icon} {v.label} ({v.role})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={lbl}>Threshold</label>
              <div style={{ padding:"10px 14px", borderRadius:"10px",
                background:"rgba(220,38,38,0.1)", border:"1px solid rgba(220,38,38,0.3)",
                display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ fontSize:"0.72rem", color:"rgba(255,255,255,0.5)" }}>Minimum</span>
                <span style={{ fontSize:"1rem", fontWeight:"900", color:"#f87171" }}>
                  {WL_THRESHOLDS[addCat]||"—"}/{CAT_INFO[addCat]?.max||"—"}
                </span>
              </div>
            </div>
          </div>

          <div style={{ marginBottom:"16px" }}>
            <label style={lbl}>Reason (required)</label>
            <input style={{ ...sel, direction:"ltr" }}
              placeholder="e.g. Weak in discipline for 3 days — not standing in queue..."
              value={addReason}
              onChange={e => setAddReason(e.target.value)}/>
          </div>

          {/* Warning box */}
          <div style={{ background:"rgba(251,146,60,0.1)", border:"1px solid rgba(251,146,60,0.3)",
            borderRadius:"10px", padding:"10px 14px", marginBottom:"16px",
            fontSize:"0.68rem", color:"rgba(251,146,60,0.9)" }}>
            ⚠️ After adding to Watch List, House Master must enter this student's individual score daily
          </div>

          <button onClick={handleAdd} disabled={addSaving} style={{
            width:"100%", padding:"13px", borderRadius:"12px", border:"none",
            cursor: addSaving ? "not-allowed" : "pointer", fontFamily:"inherit",
            fontSize:"0.82rem", fontWeight:"800",
            background:"linear-gradient(135deg,#dc2626,#991b1b)", color:"#fff",
            opacity: addSaving ? 0.6 : 1,
            boxShadow:"0 4px 16px rgba(220,38,38,0.35)" }}>
            {addSaving ? "Adding..." : "⚠️ Add to Watch List"}
          </button>
        </div>
      )}

      {/* ══════ TAB: HISTORY ══════ */}
      {tab === "history" && (
        removedList.length === 0
          ? (
            <div style={{ ...glass, padding:"40px", textAlign:"center" }}>
              <div style={{ fontSize:"2rem", opacity:0.3, marginBottom:"8px" }}>📋</div>
              <div style={{ color:"rgba(255,255,255,0.3)", fontSize:"0.75rem" }}>
                <span className="ur">ابھی کوئی طالب علم ہٹایا نہیں گیا</span>
              </div>
            </div>
          )
          : (
            <div style={{ background:"rgba(255,255,255,0.04)", borderRadius:"16px",
              overflow:"hidden", border:"1px solid rgba(255,255,255,0.1)" }}>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead>
                  <tr style={{ background:"rgba(255,255,255,0.05)" }}>
                    {["Student","House","Category","Reason","Added","Resolved"].map(h => (
                      <th key={h} style={{ padding:"10px 14px", textAlign:"left",
                        fontSize:"0.62rem", fontWeight:"700", color:"rgba(212,175,55,0.8)",
                        borderBottom:"1px solid rgba(255,255,255,0.08)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {removedList.map((wl, i) => {
                    const house = HOUSES.find(h => h.id === wl.house_id) || {};
                    const cat   = CAT_INFO[wl.category] || {};
                    return (
                      <tr key={wl.id||i}
                        style={{ borderBottom:"1px solid rgba(255,255,255,0.05)",
                          background: i%2===0?"rgba(255,255,255,0.02)":"transparent" }}>
                        <td style={{ padding:"10px 14px", fontSize:"0.75rem",
                          fontWeight:"700", color:"#f1f5f9" }}>{wl.student_name}</td>
                        <td style={{ padding:"10px 14px", fontSize:"0.7rem", color:house.color||G }}>
                          {house.emoji} {house.nameEn}</td>
                        <td style={{ padding:"10px 14px" }}>
                          <span style={{ background:"rgba(74,222,128,0.1)", color:"#4ade80",
                            fontSize:"0.62rem", padding:"2px 8px", borderRadius:"8px",
                            border:"1px solid rgba(74,222,128,0.3)" }}>
                            {cat.icon} {cat.label||wl.category}
                          </span>
                        </td>
                        <td style={{ padding:"10px 14px", fontSize:"0.62rem",
                          color:"rgba(255,255,255,0.45)", maxWidth:"180px" }}>{wl.reason||"—"}</td>
                        <td style={{ padding:"10px 14px", fontSize:"0.6rem",
                          color:"rgba(255,255,255,0.35)", direction:"ltr" }}>{wl.added_date||"—"}</td>
                        <td style={{ padding:"10px 14px", fontSize:"0.6rem",
                          color:"#4ade80", direction:"ltr" }}>{wl.removed_date||"—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
      )}
    </div>
  );
}
