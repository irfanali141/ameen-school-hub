/* eslint-disable */
import { useState, useEffect } from "react";
import { HOUSES } from "../../constants";
import { getData } from "../../supabase";

// ══ 300-Mark Framework ══════════════════════════════════════
const PILLARS = [
  { id:"hvs",      label:"ایچ وی ایس سکور",       labelEn:"HVS Score",      icon:"🏅", max:160, color:"#d4af37" },
  { id:"duties",   label:"ہفتہ وار فرض",  labelEn:"Weekly Duties",  icon:"📋", max:60,  color:"#60a5fa" },
  { id:"tarbiyah", label:"تربیہ و اخلاق",   labelEn:"Tarbiyah",       icon:"💎", max:40,  color:"#4ade80" },
  { id:"events",   label:"خصوصی سرگرمیاں", labelEn:"Events & Acts",  icon:"🎭", max:40,  color:"#f472b6" },
];
const GRAND_MAX = 300; // 160 + 60 + 40 + 40

function GrandTotalDashboard({ hvsLogs = [], houses = [], students = [] }) {
  const [dutyLogs, setDutyLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selWeek, setSelWeek] = useState("latest");

  useEffect(() => {
    getData("duty_logs").then(d => { setDutyLogs(d || []); setLoading(false); });
  }, []);

  // Current ISO week
  const currentWeek = (() => {
    const d = new Date(); const jan4 = new Date(d.getFullYear(), 0, 4);
    const wk = Math.ceil(((d - jan4) / 86400000 + jan4.getDay() + 1) / 7);
    return `${d.getFullYear()}-W${String(wk).padStart(2, "0")}`;
  })();

  // All available weeks from both log sources
  const allWeeks = [...new Set([
    ...hvsLogs.map(l => l.week),
    ...dutyLogs.map(l => l.week),
  ].filter(Boolean))].sort().reverse();

  const activeWeek = selWeek === "latest" ? (allWeeks[0] || currentWeek) : selWeek;

  // ── Per-house per-pillar scores ──
  const hvsScore   = id => Math.min(160, hvsLogs.filter(l => l.houseId===id && l.week===activeWeek).reduce((s,l) => s+(l.totalScore||0), 0));
  const dutyScore  = id => Math.min(60,  dutyLogs.filter(l => l.houseId===id && l.week===activeWeek).reduce((s,l) => s+(l.totalScore||0), 0));
  const tarbScore  = id => Math.min(40,  (houses.find(h => h.id===id)?.tarbiyah_pts||0));
  const eventScore = id => Math.min(40,  (houses.find(h => h.id===id)?.event_pts||0));
  const grand      = id => hvsScore(id) + dutyScore(id) + tarbScore(id) + eventScore(id);

  const houseData = [...HOUSES]
    .map(h => ({
      ...h,
      scores: {
        hvs:      hvsScore(h.id),
        duties:   dutyScore(h.id),
        tarbiyah: tarbScore(h.id),
        events:   eventScore(h.id),
      },
      grand:    grand(h.id),
      students: students.filter(s => s.houseId === h.id).length,
    }))
    .sort((a, b) => b.grand - a.grand);

  const champion = houseData[0];
  const medal = i => i===0?"🥇":i===1?"🥈":i===2?"🥉":`#${i+1}`;

  const G = "#d4af37"; const N = "#0f172a";
  const glass = { background:"rgba(255,255,255,0.07)", backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:"16px" };

  // Segmented bar: shows 4 pillars proportionally inside one bar
  const SegBar = ({ hd }) => {
    const total = hd.grand || 0;
    return (
      <div style={{ height:"10px", borderRadius:"5px", overflow:"hidden", background:"rgba(255,255,255,0.06)", display:"flex" }}>
        {PILLARS.map(p => {
          const w = total > 0 ? (hd.scores[p.id] / GRAND_MAX) * 100 : 0;
          return <div key={p.id} style={{ width:`${w}%`, background:p.color, transition:"width 0.5s ease", height:"100%" }}/>;
        })}
      </div>
    );
  };

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(160deg,#0f172a 0%,#0d1f3c 50%,#0a1628 100%)", padding:"24px 20px", fontFamily:"'Public Sans',sans-serif", direction:"ltr" }}>

      {/* ══ HEADER ══ */}
      <div style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"24px" }}>
        <div style={{ width:"48px", height:"48px", borderRadius:"14px", background:"linear-gradient(135deg,#d4af37,#b8960a)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 4px 24px rgba(212,175,55,0.45)", flexShrink:0 }}>
          <span style={{ fontSize:"24px" }}>🏆</span>
        </div>
        <div>
          <h2 style={{ margin:0, fontSize:"1.4rem", fontWeight:"800", color:"#f1f5f9" }}>گرینڈ ٹوٹل — ۳۰۰ نمبر</h2>
          <p style={{ margin:0, fontSize:"0.72rem", color:"rgba(212,175,55,0.7)" }}>ہاؤس گرینڈ ٹوٹل ڈیش بورڈ — ۴ ستون × {GRAND_MAX} نمبر</p>
        </div>
      </div>

      {/* ══ PILLAR KEY ══ */}
      <div style={{ ...glass, padding:"14px 18px", marginBottom:"20px" }}>
        <div style={{ fontSize:"0.62rem", color:"rgba(255,255,255,0.4)", marginBottom:"10px", fontWeight:"600" }}>۳۰۰ نمبر کی تفصیل:</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))", gap:"8px" }}>
          {PILLARS.map(p => (
            <div key={p.id} style={{ display:"flex", alignItems:"center", gap:"8px", background:"rgba(255,255,255,0.04)", borderRadius:"10px", padding:"8px 10px", border:`1px solid ${p.color}30` }}>
              <div style={{ width:"8px", height:"8px", borderRadius:"50%", background:p.color, flexShrink:0 }}/>
              <div>
                <div style={{ fontSize:"0.6rem", color:"rgba(255,255,255,0.5)" }}>{p.icon} {p.label}</div>
                <div style={{ fontSize:"0.72rem", fontWeight:"800", color:p.color }}>{p.max} pts</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop:"10px", display:"flex", alignItems:"center", gap:"6px" }}>
          <div style={{ height:"2px", flex:1, background:"rgba(255,255,255,0.06)", borderRadius:"1px" }}/>
          <span style={{ fontSize:"0.7rem", color:G, fontWeight:"800" }}>= {GRAND_MAX} Total</span>
          <div style={{ height:"2px", flex:1, background:"rgba(255,255,255,0.06)", borderRadius:"1px" }}/>
        </div>
      </div>

      {/* ══ WEEK SELECTOR ══ */}
      <div style={{ ...glass, padding:"14px 18px", marginBottom:"20px", display:"flex", alignItems:"center", gap:"12px", flexWrap:"wrap" }}>
        <span style={{ fontSize:"0.72rem", color:"rgba(212,175,55,0.7)", fontWeight:"600", flexShrink:0 }}>📅 ہفتہ:</span>
        <div style={{ display:"flex", gap:"6px", flexWrap:"wrap" }}>
          <button onClick={() => setSelWeek("latest")} style={{ padding:"6px 14px", borderRadius:"8px", border:"none", background:selWeek==="latest"?"rgba(212,175,55,0.25)":"rgba(255,255,255,0.05)", color:selWeek==="latest"?G:"rgba(255,255,255,0.45)", fontWeight:selWeek==="latest"?"700":"500", fontSize:"0.68rem", cursor:"pointer", fontFamily:"'Public Sans',sans-serif" }}>
            تازہ ترین
          </button>
          {allWeeks.slice(0,6).map(w => (
            <button key={w} onClick={() => setSelWeek(w)} style={{ padding:"6px 14px", borderRadius:"8px", border:"none", background:selWeek===w?"rgba(212,175,55,0.25)":"rgba(255,255,255,0.05)", color:selWeek===w?G:"rgba(255,255,255,0.45)", fontWeight:selWeek===w?"700":"500", fontSize:"0.65rem", cursor:"pointer", fontFamily:"monospace" }}>
              {w}
            </button>
          ))}
        </div>
        <span style={{ fontSize:"0.6rem", color:"rgba(255,255,255,0.25)", fontFamily:"monospace", marginRight:"auto" }}>{activeWeek}</span>
      </div>

      {/* ══ CHAMPION BANNER ══ */}
      {champion && champion.grand > 0 && (() => {
        const info = HOUSES.find(h => h.id === champion.id) || champion;
        const pct = Math.round((champion.grand / GRAND_MAX) * 100);
        return (
          <div style={{ background:info.gradient||`linear-gradient(135deg,${info.color},${info.color}cc)`, borderRadius:"22px", padding:"28px 24px", marginBottom:"24px", color:"#fff", position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", top:"-20px", left:"-20px", width:"150px", height:"150px", borderRadius:"50%", background:"rgba(255,255,255,0.05)" }}/>
            <div style={{ position:"absolute", bottom:"-30px", right:"-10px", width:"120px", height:"120px", borderRadius:"50%", background:"rgba(255,255,255,0.04)" }}/>
            <div style={{ position:"relative" }}>
              <div style={{ fontSize:"0.65rem", opacity:0.75, letterSpacing:"0.2em", marginBottom:"6px" }}>👑 گرینڈ چیمپئن — {activeWeek}</div>
              <div style={{ fontSize:"2rem", fontWeight:"900", marginBottom:"4px" }}>{info.emoji} {info.nameEn} House</div>
              <div style={{ fontSize:"0.75rem", opacity:0.85, marginBottom:"16px", fontStyle:"italic" }}>{info.slogan}</div>
              {/* Big score */}
              <div style={{ display:"flex", alignItems:"flex-end", gap:"8px", marginBottom:"12px" }}>
                <div style={{ fontSize:"4rem", fontWeight:"900", lineHeight:1 }}>{champion.grand}</div>
                <div style={{ fontSize:"1.2rem", opacity:0.7, marginBottom:"8px" }}>/{GRAND_MAX}</div>
                <div style={{ fontSize:"1.4rem", fontWeight:"800", marginBottom:"6px", background:"rgba(255,255,255,0.2)", borderRadius:"10px", padding:"4px 12px" }}>{pct}%</div>
              </div>
              {/* Segmented progress */}
              <div style={{ height:"12px", borderRadius:"6px", overflow:"hidden", background:"rgba(255,255,255,0.15)", display:"flex", marginBottom:"8px" }}>
                {PILLARS.map(p => {
                  const w = (champion.scores[p.id] / GRAND_MAX) * 100;
                  return <div key={p.id} style={{ width:`${w}%`, background:p.color, height:"100%", transition:"width 0.6s ease" }}/>;
                })}
              </div>
              {/* Pillar breakdown */}
              <div style={{ display:"flex", gap:"12px", flexWrap:"wrap" }}>
                {PILLARS.map(p => (
                  <div key={p.id} style={{ background:"rgba(255,255,255,0.15)", borderRadius:"8px", padding:"4px 10px", fontSize:"0.6rem" }}>
                    <span style={{ opacity:0.8 }}>{p.icon} {p.label}: </span>
                    <span style={{ fontWeight:"800", color:p.color }}>{champion.scores[p.id]}</span>
                    <span style={{ opacity:0.5 }}>/{p.max}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ══ 4 HOUSE CARDS ══ */}
      {loading ? (
        <div style={{ ...glass, padding:"40px", textAlign:"center", color:"rgba(255,255,255,0.3)", fontSize:"0.8rem" }}>لوڈ ہو رہا ہے...</div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:"16px", marginBottom:"24px" }}>
          {houseData.map((h, i) => {
            const info = HOUSES.find(x => x.id === h.id) || h;
            const grandPct = Math.round((h.grand / GRAND_MAX) * 100);
            const gradeColor = grandPct >= 70 ? "#4ade80" : grandPct >= 40 ? "#fb923c" : "#f87171";
            const grade = grandPct >= 80 ? "A+" : grandPct >= 70 ? "A" : grandPct >= 60 ? "B+" : grandPct >= 50 ? "B" : grandPct >= 40 ? "C" : "D";
            return (
              <div key={h.id} style={{ ...glass, padding:"20px", borderTop:`3px solid ${info.color}`, position:"relative", overflow:"hidden" }}>
                {/* Rank badge */}
                <div style={{ position:"absolute", top:"12px", left:"12px", fontSize:i===0?"1.4rem":"0.9rem", fontWeight:"800" }}>{medal(i)}</div>

                {/* House identity */}
                <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"16px", paddingRight:"0" }}>
                  <div style={{ width:"40px", height:"40px", borderRadius:"10px", background:info.gradient||info.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.3rem", flexShrink:0 }}>{info.emoji}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:"800", fontSize:"0.9rem", color:info.color }}>{info.nameEn}</div>
                    <div style={{ fontSize:"0.58rem", color:"rgba(255,255,255,0.4)" }}>{info.name} • {h.students} Students</div>
                  </div>
                  {/* Grade */}
                  <div style={{ background:`${gradeColor}20`, borderRadius:"10px", padding:"6px 10px", border:`1px solid ${gradeColor}40`, textAlign:"center" }}>
                    <div style={{ fontWeight:"900", fontSize:"1.1rem", color:gradeColor }}>{grade}</div>
                    <div style={{ fontSize:"0.52rem", color:"rgba(255,255,255,0.4)" }}>درجہ</div>
                  </div>
                </div>

                {/* Grand total */}
                <div style={{ display:"flex", alignItems:"flex-end", gap:"4px", marginBottom:"10px" }}>
                  <span style={{ fontSize:"2.6rem", fontWeight:"900", color:i===0?G:info.color, lineHeight:1 }}>{h.grand}</span>
                  <span style={{ fontSize:"0.9rem", color:"rgba(255,255,255,0.3)", marginBottom:"6px" }}>/{GRAND_MAX}</span>
                  <span style={{ fontSize:"0.75rem", fontWeight:"700", color:gradeColor, marginBottom:"8px", marginRight:"auto" }}>{grandPct}%</span>
                </div>

                {/* Segmented grand total bar */}
                <SegBar hd={h} />

                {/* Pillar legend */}
                <div style={{ display:"flex", gap:"4px", marginTop:"5px", marginBottom:"14px" }}>
                  {PILLARS.map(p => (
                    <div key={p.id} style={{ flex:1, height:"3px", borderRadius:"2px", background:p.color, opacity: h.scores[p.id]>0 ? 1 : 0.15 }}/>
                  ))}
                </div>

                {/* Per-pillar rows */}
                <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
                  {PILLARS.map(p => {
                    const pct = Math.round((h.scores[p.id] / p.max) * 100);
                    return (
                      <div key={p.id}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"3px" }}>
                          <span style={{ fontSize:"0.6rem", color:"rgba(255,255,255,0.6)" }}>{p.icon} {p.label}</span>
                          <div style={{ display:"flex", alignItems:"center", gap:"4px" }}>
                            <span style={{ fontSize:"0.68rem", fontWeight:"700", color:p.color }}>{h.scores[p.id]}</span>
                            <span style={{ fontSize:"0.55rem", color:"rgba(255,255,255,0.3)" }}>/{p.max}</span>
                          </div>
                        </div>
                        <div style={{ height:"5px", background:"rgba(255,255,255,0.06)", borderRadius:"3px", overflow:"hidden" }}>
                          <div style={{ width:`${pct}%`, height:"100%", background:p.color, borderRadius:"3px", transition:"width 0.5s ease" }}/>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Status note for pending pillars */}
                {(h.scores.tarbiyah === 0 || h.scores.events === 0) && (
                  <div style={{ marginTop:"10px", fontSize:"0.55rem", color:"rgba(255,255,255,0.2)", fontStyle:"italic" }}>
                    {h.scores.tarbiyah===0 && "💎 تربیاتی نمبر زیر التواء "}
                    {h.scores.events===0 && "🎭 سرگرمی نمبر زیر التواء"}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ══ COMPARISON TABLE ══ */}
      <div style={{ ...glass, padding:"20px" }}>
        <div style={{ fontSize:"0.85rem", fontWeight:"700", color:G, marginBottom:"16px" }}>📊 مکمل موازنہ — {activeWeek}</div>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", direction:"ltr" }}>
            <thead>
              <tr style={{ borderBottom:"1px solid rgba(255,255,255,0.08)" }}>
                {["درجہ","ہاؤس","🏅 ایچ وی ایس /160","📋 فرض /60","💎 تربیہ /40","🎭 سرگرمی /40","گرینڈ ٹوٹل /300","گریڈ"].map((h,i) => (
                  <th key={i} style={{ padding:"10px 12px", textAlign:"left", fontSize:"0.62rem", color:"rgba(212,175,55,0.7)", fontWeight:"700", whiteSpace:"nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {houseData.map((h, i) => {
                const info = HOUSES.find(x => x.id === h.id) || h;
                const pct = Math.round((h.grand / GRAND_MAX) * 100);
                const gradeColor = pct>=70?"#4ade80":pct>=40?"#fb923c":"#f87171";
                const grade = pct>=80?"A+":pct>=70?"A":pct>=60?"B+":pct>=50?"B":pct>=40?"C":"D";
                return (
                  <tr key={h.id} style={{ borderBottom:"1px solid rgba(255,255,255,0.04)", background:i===0?`${info.color}08`:undefined }}>
                    <td style={{ padding:"12px", fontSize:"0.82rem" }}>{medal(i)}</td>
                    <td style={{ padding:"12px" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                        <span style={{ fontSize:"1.1rem" }}>{info.emoji}</span>
                        <div>
                          <div style={{ fontSize:"0.72rem", fontWeight:"700", color:info.color }}>{info.nameEn}</div>
                          <div style={{ fontSize:"0.55rem", color:"rgba(255,255,255,0.3)" }}>{info.name}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding:"12px", textAlign:"center" }}>
                      <span style={{ fontSize:"0.78rem", fontWeight:"700", color:"#d4af37" }}>{h.scores.hvs}</span>
                      <div style={{ height:"3px", background:"rgba(255,255,255,0.06)", borderRadius:"2px", marginTop:"3px" }}>
                        <div style={{ width:`${(h.scores.hvs/160)*100}%`, height:"100%", background:"#d4af37", borderRadius:"2px" }}/>
                      </div>
                    </td>
                    <td style={{ padding:"12px", textAlign:"center" }}>
                      <span style={{ fontSize:"0.78rem", fontWeight:"700", color:"#60a5fa" }}>{h.scores.duties}</span>
                      <div style={{ height:"3px", background:"rgba(255,255,255,0.06)", borderRadius:"2px", marginTop:"3px" }}>
                        <div style={{ width:`${(h.scores.duties/60)*100}%`, height:"100%", background:"#60a5fa", borderRadius:"2px" }}/>
                      </div>
                    </td>
                    <td style={{ padding:"12px", textAlign:"center" }}>
                      <span style={{ fontSize:"0.78rem", fontWeight:"700", color:"#4ade80" }}>{h.scores.tarbiyah}</span>
                      {h.scores.tarbiyah===0 && <div style={{ fontSize:"0.5rem", color:"rgba(255,255,255,0.2)" }}>زیر التواء</div>}
                    </td>
                    <td style={{ padding:"12px", textAlign:"center" }}>
                      <span style={{ fontSize:"0.78rem", fontWeight:"700", color:"#f472b6" }}>{h.scores.events}</span>
                      {h.scores.events===0 && <div style={{ fontSize:"0.5rem", color:"rgba(255,255,255,0.2)" }}>زیر التواء</div>}
                    </td>
                    <td style={{ padding:"12px", textAlign:"center" }}>
                      <div style={{ fontSize:"1.1rem", fontWeight:"900", color:i===0?G:info.color }}>{h.grand}</div>
                      <div style={{ height:"4px", background:"rgba(255,255,255,0.06)", borderRadius:"2px", marginTop:"3px", width:"60px", margin:"3px auto 0" }}>
                        <div style={{ width:`${pct}%`, height:"100%", background:gradeColor, borderRadius:"2px" }}/>
                      </div>
                    </td>
                    <td style={{ padding:"12px", textAlign:"center" }}>
                      <span style={{ background:`${gradeColor}20`, color:gradeColor, fontSize:"0.72rem", fontWeight:"800", padding:"3px 10px", borderRadius:"6px", border:`1px solid ${gradeColor}40` }}>{grade}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div style={{ marginTop:"16px", padding:"12px", background:"rgba(255,255,255,0.03)", borderRadius:"10px", display:"flex", gap:"16px", flexWrap:"wrap" }}>
          {[["🏅","#d4af37","ایچ وی ایس",160],["📋","#60a5fa","فرض",60],["💎","#4ade80","تربیہ",40],["🎭","#f472b6","سرگرمیاں",40]].map(([icon,c,l,m]) => (
            <div key={l} style={{ display:"flex", alignItems:"center", gap:"6px" }}>
              <div style={{ width:"10px", height:"10px", borderRadius:"3px", background:c }}/>
              <span style={{ fontSize:"0.58rem", color:"rgba(255,255,255,0.45)" }}>{icon} {l}</span>
              <span style={{ fontSize:"0.62rem", fontWeight:"700", color:c }}>/{m}</span>
            </div>
          ))}
          <div style={{ fontSize:"0.6rem", color:"rgba(255,255,255,0.25)", marginRight:"auto" }}>
            تربیہ و سرگرمیاں: Supabase houses ٹیبل کے <code style={{color:"#f472b6"}}>tarbiyah_pts</code> اور <code style={{color:"#4ade80"}}>event_pts</code> کالمز سے
          </div>
        </div>
      </div>
    </div>
  );
}

export default GrandTotalDashboard;
