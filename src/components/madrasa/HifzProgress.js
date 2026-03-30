/* eslint-disable */
import { useState, useEffect } from "react";
import { sLabel } from "../../constants";
import { supabase } from "../../supabase";

const G = "#d4af37"; const N = "#0f172a"; const N2 = "#1e293b"; const P = "#1B4332"; const PL = "#2D6A4F";
const glass = { background:"rgba(255,255,255,0.07)", backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:"16px" };

// ── Quran constants ──────────────────────────────────────────
// Standard Madani mushaf: 604 pages (excluding fihrist)
const QURAN_PAGES = 604;
// 30 paras (juz) with names
const JUZAA = [
  "الم","سيقول","تلك الرسل","لن تنالوا","والمحصنات","لا يحب الله","وإذا سمعوا","ولو أننا",
  "قال الملأ","واعلموا","يعتذرون","وما من دابة","وما أبرئ","ربما","سبحان الذي","قال ألم",
  "اقترب","قد أفلح","وقال الذين","أمن خلق","اتل ما أوحي","ومن يقنت","وما لي",
  "فمن أظلم","إليه يرد","حم","قال فما خطبكم","قد سمع الله","تبارك الذي","عم يتساءلون"
];

function streakBadge(n) {
  if (n >= 90) return { icon:"🥇", label:"Gold 90+",  color:"#fbbf24" };
  if (n >= 30) return { icon:"🥈", label:"Silver 30+", color:"#94a3b8" };
  if (n >= 7)  return { icon:"🥉", label:"Bronze 7+",  color:"#cd7f32" };
  return null;
}

// Completion calculator: given lines/day → years+months to finish
function calcCompletion(linesPerDay, linesPerPage) {
  if (!linesPerDay || linesPerDay <= 0) return null;
  const totalLines   = QURAN_PAGES * linesPerPage;
  const daysNeeded   = totalLines / linesPerDay;
  const years        = Math.floor(daysNeeded / 365);
  const months       = Math.floor((daysNeeded % 365) / 30);
  const days         = Math.round(daysNeeded % 30);
  const completionDate = new Date(Date.now() + daysNeeded * 86400000);
  return { totalLines, daysNeeded: Math.round(daysNeeded), years, months, days, completionDate };
}

export default function HifzProgress({ students=[], singleStudent=null, classTab }) {
  const [streaks, setStreaks]       = useState([]);
  const [monthData, setMonthData]   = useState([]);
  const [loading,  setLoading]      = useState(true);

  // Completion calculator state
  const [calcLPD,  setCalcLPD]      = useState(""); // lines per day input
  const [calcLPP,  setCalcLPP]      = useState(15); // lines per page: 15 or 16
  const [calcView, setCalcView]     = useState("calculator"); // "calculator" | "progress"

  const targetStudents = singleStudent ? [singleStudent] : students;

  useEffect(() => {
    if (!targetStudents.length) { setLoading(false); return; }
    (async () => {
      setLoading(true);
      try {
        const ids = targetStudents.map(s=>s.id);
        const [stk, mth] = await Promise.all([
          supabase.from("sabaq_streaks").select("*").in("student_id", ids),
          supabase.from("hifz_monthly_review").select("*").in("student_id", ids).order("year",{ascending:false}).order("month",{ascending:false}).limit(6*ids.length),
        ]);
        setStreaks(stk.data || []);
        setMonthData(mth.data || []);
      } catch {}
      setLoading(false);
    })();
  }, [targetStudents.length]);

  // ── Completion calculator result ─────────────────────────────
  const calc15 = calcLPD ? calcCompletion(parseFloat(calcLPD), 15) : null;
  const calc16 = calcLPD ? calcCompletion(parseFloat(calcLPD), 16) : null;

  const fmtDate = (d) => d.toLocaleDateString("en-PK",{year:"numeric",month:"long",day:"numeric"});
  const fmtDuration = (c) => {
    if (!c) return "—";
    if (c.years > 0) return `${c.years} سال ${c.months > 0 ? c.months+" ماہ" : ""}`;
    if (c.months > 0) return `${c.months} ماہ ${c.days > 0 ? c.days+" دن" : ""}`;
    return `${c.daysNeeded} دن`;
  };

  return (
    <div style={{ direction:"ltr", fontFamily:"'DM Sans','Segoe UI',sans-serif" }}>

      {/* Sub-tab selector */}
      <div style={{ display:"flex", gap:6, marginBottom:20 }}>
        {[
          { id:"calculator", icon:"🧮", label:"حساب لگائیں" },
          { id:"progress",   icon:"📊", label:"طلبہ کی پیشرفت" },
        ].map(t => (
          <button key={t.id} onClick={()=>setCalcView(t.id)} style={{
            padding:"8px 18px", borderRadius:10, border:"none", cursor:"pointer",
            fontFamily:"inherit", fontSize:"0.72rem", fontWeight: calcView===t.id ? 700 : 500,
            background: calcView===t.id ? `linear-gradient(135deg,${G},#b8960a)` : "rgba(255,255,255,0.06)",
            color: calcView===t.id ? N : "rgba(255,255,255,0.5)",
            display:"flex", alignItems:"center", gap:5
          }}>
            <span>{t.icon}</span>
            <span style={{ fontFamily:"'Noto Nastaliq Urdu',sans-serif", direction:"rtl" }}>{t.label}</span>
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════
          QURAN COMPLETION CALCULATOR
      ══════════════════════════════════════════════════ */}
      {calcView === "calculator" && (
        <div>
          {/* Info card */}
          <div style={{ ...glass, padding:"18px 22px", marginBottom:20, borderTop:`3px solid ${G}` }}>
            <div style={{ color:G, fontSize:"0.62rem", fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:6 }}>قرآن حفظ کیلکولیٹر</div>
            <div style={{ color:"white", fontSize:"1.05rem", fontWeight:700, marginBottom:4, fontFamily:"'Noto Nastaliq Urdu',sans-serif", direction:"rtl" }}>
              روزانہ کتنی سطریں یاد کریں — مکمل کب ہو گا؟
            </div>
            <div style={{ color:"rgba(255,255,255,0.4)", fontSize:"0.65rem" }}>
              کل صفحات: {QURAN_PAGES} | 15 سطر/صفحہ = {QURAN_PAGES*15} سطریں | 16 سطر/صفحہ = {QURAN_PAGES*16} سطریں
            </div>
          </div>

          {/* Input */}
          <div style={{ ...glass, padding:"20px 22px", marginBottom:20 }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
              <div>
                <label style={{ color:"rgba(212,175,55,0.7)", fontSize:"0.65rem", fontWeight:700, display:"block", marginBottom:6 }}>
                  روزانہ سطریں (لائنیں)
                </label>
                <input
                  type="number" min={0.5} step={0.5} value={calcLPD}
                  onChange={e=>setCalcLPD(e.target.value)}
                  placeholder="مثلاً: 2.5"
                  style={{ padding:"10px 14px", borderRadius:9, border:`1px solid ${G}40`,
                    background:"rgba(255,255,255,0.06)", color:"white", fontSize:"1rem",
                    fontFamily:"inherit", outline:"none", width:"100%", boxSizing:"border-box",
                    colorScheme:"dark", fontWeight:700 }}
                />
                <div style={{ color:"rgba(255,255,255,0.3)", fontSize:"0.6rem", marginTop:4 }}>
                  1/6 صفحہ = 2.5 سطر (15/pg) یا 2.67 (16/pg)
                </div>
              </div>
              <div>
                <label style={{ color:"rgba(212,175,55,0.7)", fontSize:"0.65rem", fontWeight:700, display:"block", marginBottom:6 }}>
                  سطر فی صفحہ
                </label>
                <div style={{ display:"flex", gap:8 }}>
                  {[15,16].map(n => (
                    <button key={n} onClick={()=>setCalcLPP(n)} style={{
                      flex:1, padding:"10px", borderRadius:9, border:"none", cursor:"pointer",
                      fontFamily:"inherit", fontSize:"0.85rem", fontWeight:700,
                      background: calcLPP===n ? `linear-gradient(135deg,${P},${PL})` : "rgba(255,255,255,0.06)",
                      color: calcLPP===n ? "#FFF" : "rgba(255,255,255,0.5)"
                    }}>{n} سطر</button>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick fraction presets */}
            <div style={{ marginBottom:0 }}>
              <div style={{ color:"rgba(255,255,255,0.4)", fontSize:"0.6rem", marginBottom:6 }}>فوری انتخاب:</div>
              <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                {[
                  { label:"1/8 صفحہ", lines15:1.875, lines16:2  },
                  { label:"1/6 صفحہ", lines15:2.5,   lines16:2.67 },
                  { label:"1/4 صفحہ", lines15:3.75,  lines16:4   },
                  { label:"1/3 صفحہ", lines15:5,      lines16:5.33 },
                  { label:"1/2 صفحہ", lines15:7.5,    lines16:8   },
                  { label:"1 صفحہ",   lines15:15,     lines16:16  },
                  { label:"2 صفحہ",   lines15:30,     lines16:32  },
                ].map(p => (
                  <button key={p.label} onClick={()=>setCalcLPD(calcLPP===15 ? p.lines15 : p.lines16)} style={{
                    padding:"5px 12px", borderRadius:20, border:`1px solid rgba(255,255,255,0.12)`,
                    background:"rgba(255,255,255,0.05)", color:"rgba(255,255,255,0.6)",
                    fontSize:"0.65rem", cursor:"pointer", fontFamily:"inherit",
                    fontFamily:"'Noto Nastaliq Urdu',sans-serif", direction:"rtl"
                  }}>{p.label}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Results — both 15 and 16 */}
          {calcLPD && parseFloat(calcLPD) > 0 && (
            <div>
              <div style={{ color:"rgba(255,255,255,0.5)", fontSize:"0.65rem", marginBottom:10, fontFamily:"'Noto Nastaliq Urdu',sans-serif", direction:"rtl", textAlign:"right" }}>
                روزانہ {calcLPD} سطریں یاد کرنے پر:
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                {[
                  { lpp:15, calc:calc15, color:"#60a5fa" },
                  { lpp:16, calc:calc16, color:"#4ade80" },
                ].map(({lpp,calc,color}) => calc && (
                  <div key={lpp} style={{ ...glass, padding:"18px 20px", borderTop:`3px solid ${color}` }}>
                    <div style={{ color, fontSize:"0.7rem", fontWeight:700, letterSpacing:"0.08em", marginBottom:8 }}>
                      {lpp} سطر فی صفحہ (کل {QURAN_PAGES*lpp} سطریں)
                    </div>
                    <div style={{ color:"white", fontSize:"1.8rem", fontWeight:800, marginBottom:4, lineHeight:1,
                      fontFamily:"'Noto Nastaliq Urdu',sans-serif", direction:"rtl" }}>
                      {fmtDuration(calc)}
                    </div>
                    <div style={{ color:"rgba(255,255,255,0.4)", fontSize:"0.65rem", marginBottom:12 }}>
                      ({calc.daysNeeded.toLocaleString()} دن)
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                      {[
                        { label:"کل سطریں",  value: (QURAN_PAGES*lpp).toLocaleString() },
                        { label:"کل دن",     value: calc.daysNeeded.toLocaleString()     },
                        { label:"اختتام تاریخ", value: fmtDate(calc.completionDate).split(",")[0] },
                        { label:"سال",       value: calc.years > 0 ? calc.years : "<1"  },
                      ].map(s => (
                        <div key={s.label} style={{ textAlign:"center", padding:"8px 6px",
                          background:"rgba(255,255,255,0.04)", borderRadius:8 }}>
                          <div style={{ color, fontSize:"1rem", fontWeight:800 }}>{s.value}</div>
                          <div style={{ color:"rgba(255,255,255,0.35)", fontSize:"0.58rem",
                            fontFamily:"'Noto Nastaliq Urdu',sans-serif", direction:"rtl" }}>{s.label}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop:12, padding:"8px 10px", background:`${color}12`,
                      borderRadius:8, border:`1px solid ${color}25` }}>
                      <div style={{ color:"rgba(255,255,255,0.5)", fontSize:"0.6rem", marginBottom:2 }}>اختتام تاریخ</div>
                      <div style={{ color, fontSize:"0.72rem", fontWeight:700 }}>{fmtDate(calc.completionDate)}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Comparison table */}
              <div style={{ ...glass, padding:"18px 20px", marginTop:16 }}>
                <div style={{ color:G, fontSize:"0.65rem", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:12 }}>مختلف سطروں کا موازنہ</div>
                <div style={{ overflowX:"auto" }}>
                  <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"0.72rem" }}>
                    <thead>
                      <tr>
                        {["روزانہ سطریں", "15 سطر/صفحہ", "16 سطر/صفحہ", "حصہ"].map(h => (
                          <th key={h} style={{ padding:"8px 12px", textAlign:"center", color:"rgba(255,255,255,0.5)",
                            fontWeight:700, borderBottom:"1px solid rgba(255,255,255,0.08)",
                            fontFamily:"'Noto Nastaliq Urdu',sans-serif", direction:"rtl" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { lpd:1.25, frac:"1/12 pg" }, { lpd:1.875, frac:"1/8 pg" },
                        { lpd:2.5,  frac:"1/6 pg"  }, { lpd:3,     frac:"~1/5 pg"},
                        { lpd:3.75, frac:"1/4 pg"  }, { lpd:5,     frac:"1/3 pg" },
                        { lpd:7.5,  frac:"1/2 pg"  }, { lpd:10,    frac:"2/3 pg" },
                        { lpd:15,   frac:"1 pg"    }, { lpd:30,    frac:"2 pg"   },
                      ].map(row => {
                        const r15 = calcCompletion(row.lpd, 15);
                        const r16 = calcCompletion(row.lpd, 16);
                        const isSelected = parseFloat(calcLPD) === row.lpd;
                        return (
                          <tr key={row.lpd} onClick={()=>setCalcLPD(row.lpd)} style={{
                            cursor:"pointer",
                            background: isSelected ? `${G}18` : "transparent",
                          }}>
                            <td style={{ padding:"8px 12px", textAlign:"center", color: isSelected ? G : "white",
                              fontWeight: isSelected ? 800 : 400, borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
                              {row.lpd}
                            </td>
                            <td style={{ padding:"8px 12px", textAlign:"center", color:"#60a5fa",
                              borderBottom:"1px solid rgba(255,255,255,0.05)" }}>{fmtDuration(r15)}</td>
                            <td style={{ padding:"8px 12px", textAlign:"center", color:"#4ade80",
                              borderBottom:"1px solid rgba(255,255,255,0.05)" }}>{fmtDuration(r16)}</td>
                            <td style={{ padding:"8px 12px", textAlign:"center", color:"rgba(255,255,255,0.4)",
                              borderBottom:"1px solid rgba(255,255,255,0.05)", fontSize:"0.65rem" }}>{row.frac}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {!calcLPD && (
            <div style={{ ...glass, padding:40, textAlign:"center" }}>
              <div style={{ fontSize:"2.5rem", marginBottom:10 }}>🧮</div>
              <div style={{ color:"rgba(255,255,255,0.4)", fontFamily:"'Noto Nastaliq Urdu',sans-serif", direction:"rtl" }}>
                اوپر روزانہ سطریں درج کریں تا کہ حساب لگایا جا سکے
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          STUDENT PROGRESS VIEW
      ══════════════════════════════════════════════════ */}
      {calcView === "progress" && (
        <div>
          {loading ? (
            <div style={{ textAlign:"center", padding:50, color:"rgba(255,255,255,0.3)" }}>لوڈ ہو رہا ہے…</div>
          ) : targetStudents.length === 0 ? (
            <div style={{ textAlign:"center", padding:50, color:"rgba(255,255,255,0.3)" }}>کوئی طالب علم منتخب نہیں</div>
          ) : (
            targetStudents.map(s => {
              const stk   = streaks.find(x=>x.student_id===s.id);
              const badge = stk ? streakBadge(stk.streak_days||0) : null;
              const totalLines = stk?.total_lines_memorized || 0;
              const pct15 = Math.min(100, (totalLines/(QURAN_PAGES*15))*100);
              const pct16 = Math.min(100, (totalLines/(QURAN_PAGES*16))*100);
              const sMonths = monthData.filter(m=>m.student_id===s.id).slice(0,3);

              return (
                <div key={s.id} style={{ ...glass, padding:"18px 20px", marginBottom:16 }}>
                  {/* Student header */}
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                    <div>
                      <div style={{ color:"white", fontWeight:800, fontSize:"1rem" }}>{s.name}</div>
                      <div style={{ color:"rgba(255,255,255,0.4)", fontSize:"0.65rem" }}>{s.grade || "—"}</div>
                    </div>
                    {badge && (
                      <div style={{ background:`${badge.color}18`, border:`1px solid ${badge.color}35`,
                        borderRadius:20, padding:"4px 14px", fontSize:"0.72rem", fontWeight:700, color:badge.color }}>
                        {badge.icon} {stk?.streak_days} din streak
                      </div>
                    )}
                  </div>

                  {/* Streak fire */}
                  {stk && (
                    <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14,
                      padding:"10px 14px", background:"rgba(255,165,0,0.08)", borderRadius:10,
                      border:"1px solid rgba(255,165,0,0.2)" }}>
                      <span style={{ fontSize:"1.8rem" }}>🔥</span>
                      <div>
                        <div style={{ color:"#fb923c", fontSize:"1.2rem", fontWeight:800 }}>{stk.streak_days || 0} دن</div>
                        <div style={{ color:"rgba(255,255,255,0.35)", fontSize:"0.6rem" }}>
                          بہترین: {stk.longest||0} دن | کل: {stk.total_sabaq_days||0} دن سبق
                        </div>
                      </div>
                      <div style={{ marginRight:"auto" }}>
                        {[7,30,90].map(m => (
                          <span key={m} style={{ margin:"0 3px", fontSize:"0.8rem",
                            filter:(stk.streak_days||0)>=m?"none":"grayscale(1) opacity(0.3)" }}>
                            {m===7?"🥉":m===30?"🥈":"🥇"}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Progress bars */}
                  <div style={{ marginBottom:14 }}>
                    <div style={{ color:"rgba(255,255,255,0.5)", fontSize:"0.65rem", marginBottom:8 }}>مجموعی پیشرفت</div>
                    {[
                      { label:"15 سطر/صفحہ", pct:pct15, color:"#60a5fa" },
                      { label:"16 سطر/صفحہ", pct:pct16, color:"#4ade80" },
                    ].map(b => (
                      <div key={b.label} style={{ marginBottom:8 }}>
                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                          <span style={{ color:"rgba(255,255,255,0.45)", fontSize:"0.62rem" }}>{b.label}</span>
                          <span style={{ color:b.color, fontSize:"0.68rem", fontWeight:700 }}>{b.pct.toFixed(1)}%</span>
                        </div>
                        <div style={{ height:8, background:"rgba(255,255,255,0.08)", borderRadius:4, overflow:"hidden" }}>
                          <div style={{ width:`${b.pct}%`, height:"100%", background:`linear-gradient(90deg,${b.color},${b.color}aa)`,
                            borderRadius:4, transition:"width 0.6s ease", minWidth:b.pct>0?4:0 }}/>
                        </div>
                      </div>
                    ))}
                    <div style={{ color:"rgba(255,255,255,0.3)", fontSize:"0.6rem", marginTop:4 }}>
                      {totalLines > 0 ? `${totalLines.toFixed(1)} سطریں یاد` : "ابھی شروع نہیں"}
                    </div>
                  </div>

                  {/* 30 Para progress strip */}
                  <div style={{ marginBottom:14 }}>
                    <div style={{ color:"rgba(255,255,255,0.45)", fontSize:"0.62rem", marginBottom:6 }}>30 پارہ جات</div>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:3 }}>
                      {JUZAA.map((j,i) => {
                        const paraLines = (QURAN_PAGES*15) / 30;
                        const done = totalLines > (i+1)*paraLines;
                        const inProgress = !done && totalLines > i*paraLines;
                        return (
                          <div key={i} title={`پارہ ${i+1}: ${j}`} style={{
                            width:18, height:18, borderRadius:4, cursor:"default",
                            background: done ? "#4ade80" : inProgress ? `${G}80` : "rgba(255,255,255,0.08)",
                            border: `1px solid ${done?"#4ade8040":inProgress?`${G}40`:"rgba(255,255,255,0.06)"}`,
                            display:"flex", alignItems:"center", justifyContent:"center",
                            fontSize:"0.45rem", color: done ? N : inProgress ? G : "rgba(255,255,255,0.2)",
                            fontWeight:700
                          }}>{i+1}</div>
                        );
                      })}
                    </div>
                    <div style={{ display:"flex", gap:10, marginTop:6 }}>
                      {[{c:"#4ade80",l:"مکمل"},{c:`${G}80`,l:"جاری"},{c:"rgba(255,255,255,0.08)",l:"باقی"}].map(x=>(
                        <div key={x.l} style={{ display:"flex", alignItems:"center", gap:4 }}>
                          <div style={{ width:10, height:10, borderRadius:2, background:x.c }}/>
                          <span style={{ color:"rgba(255,255,255,0.3)", fontSize:"0.58rem" }}>{x.l}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Monthly summary */}
                  {sMonths.length > 0 && (
                    <div>
                      <div style={{ color:"rgba(255,255,255,0.45)", fontSize:"0.62rem", marginBottom:8 }}>ماہانہ خلاصہ</div>
                      <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                        {sMonths.map(m => (
                          <div key={m.id} style={{ flex:1, minWidth:100, padding:"8px 10px",
                            background:"rgba(255,255,255,0.04)", borderRadius:10, border:"1px solid rgba(255,255,255,0.06)" }}>
                            <div style={{ color:"rgba(255,255,255,0.35)", fontSize:"0.58rem" }}>{m.year}/{m.month}</div>
                            <div style={{ color:G, fontWeight:700, fontSize:"0.78rem" }}>{m.total_sabaq_days} دن</div>
                            <div style={{ color:"rgba(255,255,255,0.4)", fontSize:"0.6rem" }}>{m.total_ayat_memorized} آیات</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
