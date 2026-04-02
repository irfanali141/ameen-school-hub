/* eslint-disable */
import { useState, useEffect } from "react";
import { supabase } from "../../supabase";
import { HOUSES, sLabel } from "../../constants";
import SabaqEntry    from "./SabaqEntry";
import HifzProgress  from "./HifzProgress";
import HifzWeeklyReport from "./HifzWeeklyReport";
import HifzCurriculum   from "./HifzCurriculum";

// ── Design tokens ────────────────────────────────────────────
const G = "#d4af37"; const N = "#0f172a"; const N2 = "#1e293b";
const P = "#1B4332"; const PL = "#2D6A4F";
const glass = { background:"rgba(255,255,255,0.07)", backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:"16px" };

// Classes derived dynamically from students prop — no hardcoded values

const DASHBOARD_TABS = [
  { id:"today",     icon:"📅", label:"آج کا سبق" },
  { id:"progress",  icon:"📈", label:"پیشرفت"    },
  { id:"weekly",    icon:"📋", label:"ہفتہ وار"  },
  { id:"curriculum",icon:"📚", label:"نصاب"      },
];

const today = () => new Date().toISOString().slice(0,10);
const weekNum = (d=new Date()) => {
  const jan1=new Date(d.getFullYear(),0,1);
  return Math.ceil(((d-jan1)/86400000+jan1.getDay()+1)/7);
};

// Offline queue helpers
const offlineQ = {
  push: (d) => { const k="hifz_offline_"+Date.now(); localStorage.setItem(k,JSON.stringify(d)); },
  all:  ()  => Object.keys(localStorage).filter(k=>k.startsWith("hifz_offline_")).map(k=>JSON.parse(localStorage.getItem(k)||"{}")),
  clear:(k) => localStorage.removeItem(k),
  keys: ()  => Object.keys(localStorage).filter(k=>k.startsWith("hifz_offline_")),
};

export default function HifzDashboard({ students=[], userRole, addData }) {
  // Derive unique grades from students, sorted
  const grades = [...new Set(students.map(s => s.grade).filter(Boolean))].sort();
  const CLASSES = grades.length ? grades : ["Grade 6","Grade 7","Grade 8"];

  const [tab,       setTab]       = useState("today");
  const [classTab,  setClassTab]  = useState("");
  const [todayLogs, setTodayLogs] = useState([]);
  const [streaks,   setStreaks]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [entryStudent, setEntryStudent] = useState(null);  // open SabaqEntry modal
  const [progressStudent, setProgressStudent] = useState(null);
  const [isOnline,  setIsOnline]  = useState(navigator.onLine);
  const [offlineCount, setOfflineCount] = useState(offlineQ.keys().length);
  const [syncing,   setSyncing]   = useState(false);
  const [syncMsg,   setSyncMsg]   = useState("");
  const [csvLoading,setCsvLoading]= useState(false);
  const [csvResult, setCsvResult] = useState(null);
  const [showCsvFmt,setShowCsvFmt]= useState(false);
  const TODAY_STR = new Date().toISOString().split("T")[0];

  // Online/offline listeners
  useEffect(() => {
    const on  = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener("online",  on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online",on); window.removeEventListener("offline",off); };
  }, []);

  // Set default classTab once grades are known
  useEffect(() => { if (!classTab && CLASSES.length) setClassTab(CLASSES[0]); }, [CLASSES.length]);
  useEffect(() => { if (classTab) loadData(); }, [classTab]);

  // ── CSV bulk upload ──────────────────────────────────────────────────────────
  const handleCSV = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    e.target.value = "";
    setCsvLoading(true); setCsvResult(null);
    const text = await file.text();
    const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
    const header = lines[0]?.toLowerCase();
    const dataLines = (header.includes("name")||header.includes("student")||header.includes("surah"))
      ? lines.slice(1) : lines;
    let ok=0, skip=0, errs=[];
    for (const line of dataLines) {
      const [nameOrCode, surah, ayahs, type, ratingStr, date] = line.split(",").map(s=>s?.trim());
      if (!nameOrCode || !surah) { skip++; continue; }
      const st = students.find(s =>
        s.name?.toLowerCase().includes(nameOrCode.toLowerCase()) ||
        (s.studentCode||s.student_code)?.toLowerCase() === nameOrCode.toLowerCase()
      );
      if (!st) { errs.push(`نہیں ملا: ${nameOrCode}`); skip++; continue; }
      const validType = ["sabaq","sabqi","manzil"].includes(type?.toLowerCase()) ? type.toLowerCase() : "sabaq";
      const { error } = await supabase.from("hifz_logs").insert({
        student_id: st.id, surah, ayahs: ayahs||"",
        type: validType, rating: parseInt(ratingStr)||3,
        date: date||TODAY_STR, notes: "",
      });
      if (error) { errs.push(`${st.name}: ${error.message}`); skip++; }
      else ok++;
    }
    setCsvResult({ ok, skip, errs });
    setCsvLoading(false);
  };

  // ── Class Report print ───────────────────────────────────────────────────────
  const printClassReport = () => {
    const classStudents = students.filter(s => s.grade === classTab);
    const rows = classStudents.map(s => {
      const log = todayLogs.find(l => l.student_id === s.id);
      const streak = streaks.find(st => st.student_id === s.id);
      return `<tr style="border-bottom:1px solid #eee">
        <td style="padding:6px 10px">${s.name||"—"}</td>
        <td style="padding:6px 10px">${log?.surah||"—"}</td>
        <td style="padding:6px 10px">${log?.ayahs||"—"}</td>
        <td style="padding:6px 10px">${log?.type||"—"}</td>
        <td style="padding:6px 10px;text-align:center">${log?.rating||"—"}</td>
        <td style="padding:6px 10px;text-align:center">${streak?.current_streak||0} 🔥</td>
      </tr>`;
    }).join("");
    const win = window.open("","_blank");
    win.document.write(`
      <html><head><title>Hifz Report - ${classTab}</title>
      <style>body{font-family:Arial;direction:rtl;padding:20px}
      table{width:100%;border-collapse:collapse;font-size:13px}
      th{background:#1B4332;color:#fff;padding:8px 10px}
      tr:nth-child(even){background:#f9f9f9}</style></head>
      <body>
        <h2 style="text-align:center">حفظ رپورٹ — ${classTab} — ${TODAY_STR}</h2>
        <p style="text-align:center;color:#666">امین اسلامک اسکول | کل طلبہ: ${classStudents.length}</p>
        <table>
          <thead><tr>
            <th>طالب علم</th><th>سورہ</th><th>آیات</th><th>نوع</th><th>ریٹنگ</th><th>Streak</th>
          </tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </body></html>`);
    win.document.close();
    win.print();
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const classStudents = students.filter(s => s.grade === classTab);
      if (!classStudents.length) { setLoading(false); return; }
      const ids = classStudents.map(s=>s.id);

      const [logs, stk] = await Promise.all([
        supabase.from("hifz_daily_log").select("*").eq("log_date", today()).in("student_id", ids),
        supabase.from("sabaq_streaks").select("*").in("student_id", ids),
      ]);
      setTodayLogs(logs.data || []);
      setStreaks(stk.data || []);
    } catch(e) { console.error(e); }
    setLoading(false);
  };

  // Sync offline queue to Supabase
  const syncOffline = async () => {
    const keys = offlineQ.keys();
    if (!keys.length) { setSyncMsg("کوئی آف لائن ڈیٹا نہیں"); setTimeout(()=>setSyncMsg(""),3000); return; }
    setSyncing(true);
    let ok=0, fail=0;
    for (const k of keys) {
      try {
        const data = JSON.parse(localStorage.getItem(k)||"{}");
        const { error } = await supabase.from("hifz_daily_log").upsert(data, { onConflict:"student_id,log_date,log_type" });
        if (!error) { offlineQ.clear(k); ok++; } else fail++;
      } catch { fail++; }
    }
    setSyncing(false);
    setOfflineCount(offlineQ.keys().length);
    setSyncMsg(`✅ ${ok} sync ho gaye${fail>0?`, ❌ ${fail} fail`:""}!`);
    setTimeout(()=>setSyncMsg(""),4000);
    loadData();
  };

  // Students for current class tab — direct grade match
  const classStudents = students.filter(s => s.grade === classTab);

  // Build today's status per student
  const studentStatus = classStudents.map(s => {
    const log = todayLogs.find(l => l.student_id === s.id);
    const streak = streaks.find(st => st.student_id === s.id);
    return { ...s, log, streak: streak?.streak_days || 0, verified: log?.ustad_verified || false };
  });

  const todayStr = new Date().toLocaleDateString("ur-PK",{weekday:"long",year:"numeric",month:"long",day:"numeric"});
  const present = studentStatus.filter(s=>s.log).length;
  const total   = classStudents.length;
  const verified = studentStatus.filter(s=>s.verified).length;

  return (
    <div style={{ fontFamily:"'DM Sans','Segoe UI',sans-serif", direction:"ltr", minHeight:"100vh",
      background:"linear-gradient(160deg,#0f172a 0%,#13203a 50%,#1a2c3e 100%)" }}>

      {/* Offline bar */}
      {!isOnline && (
        <div style={{ background:"rgba(239,68,68,0.2)", borderBottom:"1px solid rgba(239,68,68,0.4)",
          padding:"8px 20px", display:"flex", alignItems:"center", justifyContent:"space-between",
          fontSize:"0.72rem", color:"#f87171" }}>
          <span>📵 آف لائن موڈ — ڈیٹا مقامی طور پر محفوظ ہو رہا ہے</span>
          <span style={{ background:"rgba(239,68,68,0.3)", padding:"2px 10px", borderRadius:20 }}>{offlineCount} زیر التواء</span>
        </div>
      )}
      {isOnline && offlineCount > 0 && (
        <div style={{ background:"rgba(74,222,128,0.1)", borderBottom:"1px solid rgba(74,222,128,0.25)",
          padding:"8px 20px", display:"flex", alignItems:"center", justifyContent:"space-between",
          fontSize:"0.72rem", color:"#4ade80" }}>
          <span>🌐 آن لائن — {offlineCount} آئٹم سنک کرنے کے لیے تیار</span>
          <button onClick={syncOffline} disabled={syncing} style={{ background:"rgba(74,222,128,0.2)",
            border:"1px solid rgba(74,222,128,0.4)", color:"#4ade80", borderRadius:8,
            padding:"4px 14px", fontSize:"0.7rem", fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
            {syncing ? "سنک ہو رہا ہے…" : "ابھی سنک کریں ↑"}
          </button>
        </div>
      )}
      {syncMsg && (
        <div style={{ background:"rgba(74,222,128,0.15)", padding:"8px 20px", fontSize:"0.72rem", color:"#4ade80", fontWeight:700 }}>{syncMsg}</div>
      )}

      <div style={{ padding:"20px", maxWidth:1200, margin:"0 auto" }}>

        {/* Header */}
        <div style={{ ...glass, padding:"22px 26px", marginBottom:20, display:"flex", flexWrap:"wrap",
          justifyContent:"space-between", alignItems:"center", gap:16 }}>
          <div>
            <div style={{ color:G, fontSize:"0.62rem", fontWeight:700, letterSpacing:"0.15em", textTransform:"uppercase", marginBottom:4 }}>HIFZ DASHBOARD</div>
            <div style={{ color:"white", fontSize:"1.4rem", fontWeight:800, marginBottom:4 }}>🕌 حفظ ڈیشبورڈ</div>
            <div style={{ color:"rgba(255,255,255,0.45)", fontSize:"0.7rem", fontFamily:"'Noto Nastaliq Urdu','Segoe UI',sans-serif", direction:"rtl" }}>{todayStr}</div>
          </div>
          <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>
            {/* Stats */}
            {[
              { label:"حاضر", value:`${present}/${total}`, color:"#4ade80" },
              { label:"تصدیق شدہ", value:verified, color:G },
              { label:"آف لائن", value:offlineCount, color:offlineCount>0?"#f87171":"rgba(255,255,255,0.3)" },
            ].map(s => (
              <div key={s.label} style={{ textAlign:"center", padding:"10px 16px", borderRadius:12,
                background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", minWidth:70 }}>
                <div style={{ color:s.color, fontSize:"1.4rem", fontWeight:800 }}>{s.value}</div>
                <div style={{ color:"rgba(255,255,255,0.4)", fontSize:"0.6rem", fontFamily:"'Noto Nastaliq Urdu',sans-serif", direction:"rtl" }}>{s.label}</div>
              </div>
            ))}

            {/* Class Report button */}
            <button onClick={printClassReport}
              style={{ padding:"9px 16px", borderRadius:10, border:"1px solid rgba(212,175,55,0.35)",
                background:"rgba(212,175,55,0.08)", color:G, fontWeight:700,
                fontSize:"0.72rem", cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap" }}>
              🖨 Class Report
            </button>

            {/* CSV Format toggle */}
            <button onClick={()=>setShowCsvFmt(p=>!p)}
              style={{ padding:"9px 14px", borderRadius:10, border:"1px solid rgba(99,202,183,0.3)",
                background:"rgba(99,202,183,0.07)", color:"#63cab7", fontWeight:700,
                fontSize:"0.72rem", cursor:"pointer", fontFamily:"inherit" }}>
              📋 CSV Format
            </button>

            {/* CSV Upload */}
            <label style={{ padding:"9px 16px", borderRadius:10, cursor: csvLoading?"not-allowed":"pointer",
              background: csvLoading?"#334155":`linear-gradient(135deg,${G},#b8960a)`,
              color: csvLoading?"#64748b":N, fontWeight:700,
              fontSize:"0.72rem", fontFamily:"inherit", whiteSpace:"nowrap",
              display:"inline-flex", alignItems:"center", gap:6 }}>
              {csvLoading ? `⏳ ${csvLoading}...` : "📂 CSV Upload"}
              <input type="file" accept=".csv,.txt" style={{display:"none"}} onChange={handleCSV} disabled={csvLoading}/>
            </label>
          </div>
        </div>

        {/* CSV Format guide */}
        {showCsvFmt && (
          <div style={{ ...glass, padding:"14px 18px", marginBottom:16, direction:"ltr" }}>
            <div style={{ color:"#63cab7", fontWeight:700, fontSize:"0.75rem", marginBottom:8 }}>📄 Hifz CSV Format:</div>
            <code style={{ display:"block", background:"rgba(0,0,0,0.4)", padding:"10px 14px",
              borderRadius:8, color:"#a3e6dc", fontFamily:"monospace", fontSize:"0.7rem", lineHeight:1.9,
              whiteSpace:"pre" }}>{`studentName,surah,ayahs,type,rating,date\nAhmad Ali,البقرة,1-5,sabaq,4,${TODAY_STR}\nBilal Khan,آل عمران,10-15,sabqi,3,`}</code>
            <div style={{ color:"#64748b", fontSize:"0.65rem", marginTop:8, direction:"rtl" }}>
              • type: sabaq / sabqi / manzil &nbsp;•&nbsp; rating: 1-5 &nbsp;•&nbsp; date optional
            </div>
          </div>
        )}

        {/* CSV Result */}
        {csvResult && (
          <div style={{ marginBottom:14, padding:"12px 16px", borderRadius:10,
            background: csvResult.skip===0?"rgba(74,222,128,0.08)":"rgba(251,146,60,0.08)",
            border:`1px solid ${csvResult.skip===0?"rgba(74,222,128,0.3)":"rgba(251,146,60,0.3)"}`,
            display:"flex", alignItems:"center", gap:12, flexWrap:"wrap", direction:"rtl" }}>
            <span style={{ color:"#4ade80", fontWeight:700, fontSize:"0.8rem" }}>✅ {csvResult.ok} entries شامل ہوئے</span>
            {csvResult.skip>0 && <span style={{ color:"#fb923c", fontWeight:700, fontSize:"0.8rem" }}>⚠️ {csvResult.skip} ناکام</span>}
            {csvResult.errs.slice(0,3).map((e,i)=><span key={i} style={{ color:"#fca5a5", fontSize:"0.68rem" }}>{e}</span>)}
            <button onClick={()=>setCsvResult(null)} style={{ marginRight:"auto", background:"none", border:"none", color:"#64748b", cursor:"pointer" }}>✕</button>
          </div>
        )}

        {/* Main tabs */}
        <div style={{ display:"flex", gap:4, background:"rgba(255,255,255,0.04)", padding:4, borderRadius:12, marginBottom:20, flexWrap:"wrap" }}>
          {DASHBOARD_TABS.map(t => (
            <button key={t.id} onClick={()=>setTab(t.id)} style={{
              flex:1, minWidth:80, padding:"9px 12px", border:"none", borderRadius:9,
              background: tab===t.id ? `linear-gradient(135deg,${G},#b8960a)` : "transparent",
              color: tab===t.id ? N : "rgba(255,255,255,0.5)",
              fontWeight: tab===t.id ? 700 : 400, fontSize:"0.72rem",
              cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:4
            }}>
              <span>{t.icon}</span>
              <span style={{ fontFamily:"'Noto Nastaliq Urdu',sans-serif", direction:"rtl" }}>{t.label}</span>
            </button>
          ))}
        </div>

        {/* ══ TODAY TAB ══ */}
        {tab === "today" && (
          <div>
            {/* Class tabs — dynamic from students */}
            <div style={{ display:"flex", gap:6, marginBottom:16, flexWrap:"wrap" }}>
              {CLASSES.map(c => (
                <button key={c} onClick={()=>setClassTab(c)} style={{
                  padding:"7px 18px", borderRadius:10, border:"none", cursor:"pointer",
                  fontFamily:"inherit", fontSize:"0.72rem", fontWeight: classTab===c ? 700 : 500,
                  background: classTab===c ? `linear-gradient(135deg,${P},${PL})` : "rgba(255,255,255,0.06)",
                  color: classTab===c ? "#FFF" : "rgba(255,255,255,0.5)"
                }}>
                  📚 {c}
                </button>
              ))}
            </div>

            {loading ? (
              <div style={{ textAlign:"center", padding:60, color:"rgba(255,255,255,0.3)", fontSize:"0.85rem" }}>لوڈ ہو رہا ہے…</div>
            ) : classStudents.length === 0 ? (
              <div style={{ ...glass, padding:40, textAlign:"center", color:"rgba(255,255,255,0.3)" }}>
                <div style={{ fontSize:"2rem", marginBottom:8 }}>📭</div>
                <div style={{ fontFamily:"'Noto Nastaliq Urdu',serif", direction:"rtl" }}>{classTab} میں کوئی طالب علم نہیں</div>
                <div style={{ fontSize:"0.65rem", marginTop:6, opacity:0.6 }}>Students کے grade field میں "{classTab}" ہونا چاہیے</div>
              </div>
            ) : (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))", gap:14 }}>
                {studentStatus.map(s => {
                  const house = HOUSES.find(h=>h.id===s.house_id||h.id===s.houseId);
                  const statusColor = s.log ? (s.verified ? "#4ade80" : G) : "rgba(255,255,255,0.25)";
                  const statusIcon  = s.log ? (s.verified ? "✅" : "✍️") : "⏳";
                  const statusText  = s.log ? (s.verified ? "تصدیق شدہ" : `سبق: ${s.log.surah_name||"—"} ${s.log.ayat_from||""}–${s.log.ayat_to||""}`) : "ابھی نہیں آیا";

                  return (
                    <div key={s.id} style={{ ...glass, padding:"16px 18px",
                      borderTop:`3px solid ${statusColor}`, position:"relative" }}>
                      {/* Streak badge */}
                      {s.streak > 0 && (
                        <div style={{ position:"absolute", top:10, right:12,
                          background:s.streak>=90?"rgba(251,191,36,0.2)":s.streak>=30?"rgba(148,163,184,0.2)":"rgba(205,127,50,0.2)",
                          border:`1px solid ${s.streak>=90?"#fbbf24":s.streak>=30?"#94a3b8":"#cd7f32"}`,
                          borderRadius:20, padding:"2px 8px", fontSize:"0.6rem", fontWeight:700,
                          color:s.streak>=90?"#fbbf24":s.streak>=30?"#94a3b8":"#cd7f32" }}>
                          🔥 {s.streak}
                        </div>
                      )}

                      {/* Student info */}
                      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                        <div style={{ width:36, height:36, borderRadius:"50%",
                          background:house?`${house.color}25`:"rgba(255,255,255,0.08)",
                          display:"flex", alignItems:"center", justifyContent:"center",
                          border:`1px solid ${house?.color||"rgba(255,255,255,0.1)"}`,
                          fontSize:"1rem" }}>
                          {house?.emoji||"👤"}
                        </div>
                        <div>
                          <div style={{ color:"white", fontWeight:700, fontSize:"0.85rem" }}>{s.name}</div>
                          {house && <div style={{ color:house.color, fontSize:"0.6rem", fontWeight:600 }}>{house.nameEn} House</div>}
                        </div>
                      </div>

                      {/* Status */}
                      <div style={{ padding:"8px 12px", borderRadius:9,
                        background:s.log?"rgba(255,255,255,0.06)":"rgba(239,68,68,0.08)",
                        border:`1px solid ${s.log?"rgba(255,255,255,0.1)":"rgba(239,68,68,0.2)"}`,
                        marginBottom:10 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:"0.72rem", color:statusColor }}>
                          <span>{statusIcon}</span>
                          <span>{statusText}</span>
                        </div>
                        {s.log && (
                          <div style={{ display:"flex", gap:10, marginTop:6, flexWrap:"wrap" }}>
                            {s.log.quality && <span style={{ fontSize:"0.6rem", padding:"1px 8px", borderRadius:20,
                              background:s.log.quality==="excellent"?"rgba(74,222,128,0.12)":"rgba(251,191,36,0.12)",
                              color:s.log.quality==="excellent"?"#4ade80":G, fontWeight:700 }}>{s.log.quality}</span>}
                            {s.log.duration_minutes && <span style={{ fontSize:"0.6rem", color:"rgba(255,255,255,0.35)" }}>⏱ {s.log.duration_minutes} min</span>}
                            {s.log.ustad_rating && <span style={{ fontSize:"0.65rem", color:G }}>{"⭐".repeat(s.log.ustad_rating)}</span>}
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div style={{ display:"flex", gap:6 }}>
                        <button onClick={()=>setEntryStudent(s)} style={{
                          flex:1, padding:"8px 10px", borderRadius:9, border:"none",
                          background:`linear-gradient(135deg,${P},${PL})`,
                          color:"#FFF", fontSize:"0.68rem", fontWeight:700,
                          cursor:"pointer", fontFamily:"inherit" }}>
                          {s.log ? "✏️ ترمیم" : "📝 سبق درج"}
                        </button>
                        <button onClick={()=>setProgressStudent(s)} style={{
                          padding:"8px 10px", borderRadius:9,
                          border:"1px solid rgba(212,175,55,0.3)",
                          background:"rgba(212,175,55,0.08)",
                          color:G, fontSize:"0.68rem", fontWeight:700,
                          cursor:"pointer", fontFamily:"inherit" }}>
                          📊
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ══ PROGRESS TAB ══ */}
        {tab === "progress" && (
          <HifzProgress students={classStudents} classTab={classTab} />
        )}

        {/* ══ WEEKLY REPORT TAB ══ */}
        {tab === "weekly" && (
          <HifzWeeklyReport students={classStudents} classTab={classTab} weekNumber={weekNum()} year={new Date().getFullYear()} />
        )}

        {/* ══ CURRICULUM TAB ══ */}
        {tab === "curriculum" && (
          <HifzCurriculum classTab={classTab} setClassTab={setClassTab} />
        )}
      </div>

      {/* ══ SABAQ ENTRY MODAL ══ */}
      {entryStudent && (
        <SabaqEntry
          student={entryStudent}
          onClose={()=>setEntryStudent(null)}
          onSaved={()=>{ setEntryStudent(null); loadData(); }}
          isOnline={isOnline}
          offlinePush={offlineQ.push}
          offlineCount={offlineCount}
          setOfflineCount={setOfflineCount}
        />
      )}

      {/* ══ PROGRESS MODAL (per student) ══ */}
      {progressStudent && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", zIndex:9000,
          display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}
          onClick={()=>setProgressStudent(null)}>
          <div style={{ width:"100%", maxWidth:700, maxHeight:"90vh", overflowY:"auto",
            background:N2, borderRadius:18, padding:24, boxShadow:"0 24px 64px rgba(0,0,0,0.5)" }}
            onClick={e=>e.stopPropagation()}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:16 }}>
              <h3 style={{ color:"white", margin:0, fontSize:"1rem" }}>📊 {progressStudent.name} — پیشرفت</h3>
              <button onClick={()=>setProgressStudent(null)} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.4)", cursor:"pointer", fontSize:"1.3rem" }}>✕</button>
            </div>
            <HifzProgress students={[progressStudent]} singleStudent={progressStudent} classTab={classTab} />
          </div>
        </div>
      )}
    </div>
  );
}
