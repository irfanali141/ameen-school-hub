/* eslint-disable */
import { useState, useEffect } from "react";
import { toast } from "../../components/ui/Toast";
import { HOUSES } from "../../constants";
import { getData } from "../../supabase";
import houseAbuBakr from "../../assets/1769748237732.png";
import houseUmar    from "../../assets/1769748315462.png";
import houseUthman  from "../../assets/1769748410371.png";
import houseAli     from "../../assets/1769748548928.png";
const HOUSE_LOGOS = { abuBakr:houseAbuBakr, umar:houseUmar, uthman:houseUthman, ali:houseAli };
const G = "#d4af37";
const N2 = "#1e293b";

// 6 weekly duties
const DUTIES = [
  { id:"cleanliness", label:"Cleanliness Duty",   icon:"🧹", desc:"Rooms, corridor, courtyard cleanliness" },
  { id:"assembly",   label:"Assembly Duty",   icon:"🎺", desc:"Morning assembly — queue and discipline" },
  { id:"prayer",     label:"Namaz Duty",     icon:"🕌", desc:"Namaz regularity and supervision" },
  { id:"canteen",    label:"Canteen Duty",   icon:"🍽️", desc:"Lunch discipline" },
  { id:"library",    label:"Library Duty", icon:"📚", desc:"Books, silence, order" },
  { id:"monitor",    label:"Class Monitor",    icon:"👨‍🏫", desc:"Class room discipline and performance" },
];

// rating 1-4 → points (max 10 per duty × 6 duties = 60 total)
const RATING_PTS = { 1: 3, 2: 5, 3: 8, 4: 10 };
const RATING_LABELS = { 1:"Weak", 2:"Adequate", 3:"Good", 4:"Excellent" };
const RATING_COLORS = { 1:"#f87171", 2:"#fb923c", 3:"#60a5fa", 4:"#4ade80" };

function WeeklyDutyChecklist({ addData, updateHousePoints }) {
  const [houseId, setHouseId] = useState("abuBakr");
  const [week, setWeek] = useState("");
  const [ratings, setRatings] = useState({});   // { dutyId: 1-4 }
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(true);

  useEffect(() => {
    getData("duty_logs").then(d => { setLogs(d || []); setLoadingLogs(false); });
  }, []);

  const dutyScore = (id) => RATING_PTS[ratings[id]] || 0;
  const total = DUTIES.reduce((s, d) => s + dutyScore(d.id), 0);
  const allRated = DUTIES.every(d => ratings[d.id]);

  const currentWeek = (() => {
    const d = new Date(); const jan4 = new Date(d.getFullYear(), 0, 4);
    const wk = Math.ceil(((d - jan4) / 86400000 + jan4.getDay() + 1) / 7);
    return `${d.getFullYear()}-W${String(wk).padStart(2, "0")}`;
  })();

  const save = async () => {
    if (!week) { toast.warning("ہفتہ منتخب کریں"); return; }
    if (!allRated) { toast.warning("تمام ڈیوٹیوں کی درجہ بندی کریں"); return; }
    setSaving(true);
    const houseInfo = HOUSES.find(h => h.id === houseId) || {};
    const dutyScores = Object.fromEntries(DUTIES.map(d => [d.id, ratings[d.id] || 0]));
    try {
      await addData("duty_logs", { house_id: houseId, week, ratings: dutyScores, total_score: total, house_name: houseInfo.nameEn });
      if (total > 0 && updateHousePoints) await updateHousePoints(houseId, total);
      const fresh = await getData("duty_logs");
      setLogs(fresh || []);
      setRatings({}); setDone(true); setTimeout(() => setDone(false), 3000);
    } catch(e) {
      toast.warning("Save failed: " + (e.message || JSON.stringify(e)));
    }
    setSaving(false);
  };

  // Leaderboard: sum duty_logs per house
  const houseScores = HOUSES.map(h => ({
    ...h,
    pts: logs.filter(l => (l.house_id||l.houseId) === h.id).reduce((s, l) => s + (l.total_score||l.totalScore || 0), 0),
    entries: logs.filter(l => (l.house_id||l.houseId) === h.id).length,
  })).sort((a, b) => b.pts - a.pts);

  const glass = { background:"rgba(255,255,255,0.07)", backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:"16px" };
  const inp = { padding:"10px 14px", borderRadius:"10px", border:"1px solid rgba(212,175,55,0.25)", background:"rgba(255,255,255,0.06)", color:"#f1f5f9", fontSize:"0.8rem", fontFamily:"'Public Sans',sans-serif", outline:"none", boxSizing:"border-box", direction:"ltr", colorScheme:"dark", width:"100%" };
  const lbl = { fontSize:"0.7rem", color:"rgba(212,175,55,0.8)", marginBottom:"6px", display:"block", fontWeight:"600" };

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(160deg,#0f172a 0%,#0d1f3c 50%,#0a1628 100%)", padding:"24px 20px", fontFamily:"'Public Sans',sans-serif", direction:"ltr" }}>

      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"24px" }}>
        <div style={{ width:"44px", height:"44px", borderRadius:"12px", background:"linear-gradient(135deg,#d4af37,#b8960a)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 4px 20px rgba(212,175,55,0.4)" }}>
          <span style={{ fontSize:"22px" }}>📋</span>
        </div>
        <div>
          <h2 style={{ margin:0, fontSize:"1.4rem", fontWeight:"800", color:"#f1f5f9" }}>Weekly Duty Checklist</h2>
          <p style={{ margin:0, fontSize:"0.72rem", color:"rgba(212,175,55,0.7)" }}>Weekly Duty Checklist — 6 Duties × Max 10 = 60 pts</p>
        </div>
      </div>

      {done && <div style={{ ...glass, padding:"14px 20px", marginBottom:"16px", textAlign:"center", border:"1px solid rgba(74,222,128,0.3)", background:"rgba(74,222,128,0.1)" }}>
        <span style={{ color:"#4ade80", fontWeight:"700", fontSize:"0.82rem" }}>✓ Duty record saved!</span>
      </div>}

      {/* ══ LEADERBOARD ══ */}
      <div style={{ ...glass, padding:"20px", marginBottom:"20px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"16px" }}>
          <span style={{ fontSize:"20px" }}>🏆</span>
          <span style={{ color:G, fontWeight:"800", fontSize:"0.95rem" }}>Duty Leaderboard — Total</span>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
          {houseScores.map((h, i) => {
            const maxPts = houseScores[0]?.pts || 1;
            const barPct = Math.round((h.pts / maxPts) * 100);
            const isTop = i < 3;
            return (
              <div key={h.id} style={{ background:isTop?`${h.color}12`:"rgba(255,255,255,0.03)", borderRadius:"12px", padding:"12px 14px", border:`1px solid ${isTop?h.color+"30":"rgba(255,255,255,0.07)"}` }}>
                <div style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:h.pts>0?"8px":"0" }}>
                  <div style={{ fontSize:isTop?"1.3rem":"0.85rem", fontWeight:"800", minWidth:"32px", textAlign:"center", color:isTop?"inherit":"rgba(255,255,255,0.35)" }}>
                    {i===0?"🥇":i===1?"🥈":i===2?"🥉":`#${i+1}`}
                  </div>
                  <div style={{ width:"36px", height:"36px", borderRadius:"50%", overflow:"hidden", border:`2px solid ${h.color}50`, flexShrink:0 }}>
                    <img src={HOUSE_LOGOS[h.id]} alt={h.nameEn} style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:"700", fontSize:"0.82rem", color:isTop?h.color:"#f1f5f9" }}>{h.nameEn}</div>
                    <div style={{ fontSize:"0.58rem", color:"rgba(255,255,255,0.35)" }}>{h.name} • {h.entries} Weeks</div>
                  </div>
                  <div style={{ textAlign:"left", direction:"ltr" }}>
                    <div style={{ fontWeight:"900", fontSize:"1.1rem", color:isTop?h.color:G }}>{h.pts}</div>
                    <div style={{ fontSize:"0.55rem", color:"rgba(255,255,255,0.3)" }}>pts</div>
                  </div>
                </div>
                {h.pts > 0 && <div style={{ height:"4px", background:"rgba(255,255,255,0.06)", borderRadius:"2px", overflow:"hidden", marginRight:"44px" }}>
                  <div style={{ width:`${barPct}%`, height:"100%", background:`linear-gradient(90deg,${h.color},${h.color}aa)`, borderRadius:"2px", transition:"width 0.6s ease" }}/>
                </div>}
              </div>
            );
          })}
        </div>
      </div>

      {/* House & Week Selector */}
      <div style={{ ...glass, padding:"20px", marginBottom:"16px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px", marginBottom:"12px" }}>
          <div>
            <label style={lbl}>ہاؤس</label>
            <select style={inp} value={houseId} onChange={e => setHouseId(e.target.value)}>
              {HOUSES.map(h => <option key={h.id} value={h.id} style={{ background:N2 }}>{h.emoji} {h.nameEn}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>ہفتہ * <span style={{ color:"rgba(255,255,255,0.3)", fontWeight:"400" }}>({currentWeek})</span></label>
            <input style={{ ...inp, direction:"ltr" }} placeholder={currentWeek} value={week} onChange={e => setWeek(e.target.value)} />
          </div>
        </div>
        {/* House info strip */}
        {(() => { const h = HOUSES.find(x => x.id === houseId) || {};
          return <div style={{ background:"rgba(255,255,255,0.05)", borderRadius:"12px", padding:"12px", border:`1px solid ${h.color||G}30`, display:"flex", alignItems:"center", gap:"12px" }}>
            <span style={{ fontSize:"2rem" }}>{h.emoji}</span>
            <div>
              <div style={{ fontWeight:"700", color:h.color||G }}>{h.name}</div>
              <div style={{ fontSize:"0.6rem", color:"rgba(255,255,255,0.5)" }}>{h.slogan}</div>
            </div>
          </div>;
        })()}
      </div>

      {/* ══ 6 DUTY CARDS ══ */}
      <div style={{ ...glass, padding:"24px", marginBottom:"16px" }}>
        <div style={{ fontSize:"0.9rem", fontWeight:"700", color:G, marginBottom:"20px" }}>📋 Weekly Duty Rating (Every Duty max 10 pts)</div>

        {DUTIES.map((duty) => {
          const rated = ratings[duty.id];
          const pts = dutyScore(duty.id);
          const pct = Math.round((pts / 10) * 100);
          return (
            <div key={duty.id} style={{ marginBottom:"16px", background:"rgba(255,255,255,0.03)", borderRadius:"14px", padding:"16px", border:`1px solid ${rated ? RATING_COLORS[rated]+"30" : "rgba(255,255,255,0.07)"}` }}>
              {/* Duty header */}
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"12px" }}>
                <div>
                  <span style={{ fontSize:"0.82rem", fontWeight:"700", color:"#f1f5f9" }}>{duty.icon} {duty.label}</span>
                  <span style={{ fontSize:"0.58rem", color:"rgba(255,255,255,0.4)", marginRight:"8px" }}> — {duty.desc}</span>
                </div>
                <div style={{ background:rated?`${RATING_COLORS[rated]}18`:"rgba(255,255,255,0.04)", borderRadius:"8px", padding:"4px 10px", border:`1px solid ${rated?RATING_COLORS[rated]+"50":"rgba(255,255,255,0.1)"}`, flexShrink:0, minWidth:"54px", textAlign:"center" }}>
                  <span style={{ fontWeight:"900", fontSize:"1rem", color:rated?RATING_COLORS[rated]:"rgba(255,255,255,0.2)", fontFamily:"'Public Sans',sans-serif" }}>{pts}</span>
                  <span style={{ fontSize:"0.6rem", color:"rgba(255,255,255,0.3)", marginRight:"2px" }}>/10</span>
                </div>
              </div>

              {/* Rating buttons 1-4 */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"8px", marginBottom:"10px" }}>
                {[1, 2, 3, 4].map(r => (
                  <button key={r} onClick={() => setRatings(prev => ({ ...prev, [duty.id]: prev[duty.id]===r ? undefined : r }))}
                    style={{ padding:"10px 4px", borderRadius:"10px", border:`2px solid ${rated===r ? RATING_COLORS[r] : "rgba(255,255,255,0.1)"}`, background:rated===r?`${RATING_COLORS[r]}20`:"rgba(255,255,255,0.03)", color:rated===r?RATING_COLORS[r]:"rgba(255,255,255,0.4)", cursor:"pointer", fontFamily:"'Public Sans',sans-serif", fontWeight:rated===r?"800":"500", fontSize:"0.62rem", transition:"all 0.15s", textAlign:"center" }}>
                    <div style={{ fontSize:"0.72rem", marginBottom:"2px" }}>{r}</div>
                    <div style={{ fontSize:"0.55rem" }}>{RATING_LABELS[r]}</div>
                  </button>
                ))}
              </div>

              {/* Duty progress bar */}
              <div style={{ height:"4px", background:"rgba(255,255,255,0.06)", borderRadius:"2px", overflow:"hidden" }}>
                <div style={{ width:`${pct}%`, height:"100%", background:rated?RATING_COLORS[rated]:G, borderRadius:"2px", transition:"width 0.3s ease" }}/>
              </div>
            </div>
          );
        })}

        {/* ══ TOTAL ══ */}
        <div style={{ background:"rgba(212,175,55,0.1)", borderRadius:"14px", padding:"16px", display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"14px", border:"1px solid rgba(212,175,55,0.2)" }}>
          <div>
            <div style={{ color:"rgba(255,255,255,0.8)", fontSize:"0.78rem", fontWeight:"700" }}>Total Score</div>
            <div style={{ fontSize:"0.6rem", color:"rgba(255,255,255,0.35)", marginTop:"2px" }}>{DUTIES.filter(d => ratings[d.id]).length}/6 duties rated</div>
          </div>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:"2.4rem", fontWeight:"900", color:G, lineHeight:1 }}>{total}</div>
            <div style={{ fontSize:"0.6rem", color:"rgba(255,255,255,0.4)" }}>/60</div>
          </div>
          <div style={{ fontSize:"1rem", fontWeight:"800", color:total>=48?"#4ade80":total>=30?"#fb923c":"#f87171", textAlign:"center" }}>
            {total>=48?"Excellent":total>=30?"Good":"Weak"}
          </div>
        </div>

        {/* Grand progress */}
        <div style={{ height:"6px", background:"rgba(255,255,255,0.06)", borderRadius:"3px", overflow:"hidden", marginBottom:"16px" }}>
          <div style={{ width:`${Math.round((total/60)*100)}%`, height:"100%", background:`linear-gradient(90deg,${total>=48?"#4ade80":total>=30?"#fb923c":"#f87171"},${G})`, borderRadius:"3px", transition:"width 0.4s ease" }}/>
        </div>

        <button style={{ width:"100%", padding:"14px", fontSize:"0.82rem", background: allRated ? "linear-gradient(135deg,#d4af37,#b8960a)" : "rgba(255,255,255,0.1)", color: allRated ? N : "rgba(255,255,255,0.35)", border:"none", borderRadius:"12px", cursor: allRated ? "pointer" : "not-allowed", fontWeight:"700", fontFamily:"'Public Sans',sans-serif" }}
          onClick={save} disabled={saving || !allRated}>
          {saving ? "Saving..." : allRated ? "📋 Save Duty Checklist" : `${6 - DUTIES.filter(d=>ratings[d.id]).length} duties pending`}
        </button>
      </div>

      {/* ══ HISTORY ══ */}
      <div style={{ ...glass, padding:"20px" }}>
        <div style={{ fontSize:"0.85rem", fontWeight:"700", color:G, marginBottom:"14px" }}>📜 Historical Record</div>
        {loadingLogs ? (
          <div style={{ textAlign:"center", color:"rgba(255,255,255,0.3)", padding:"20px", fontSize:"0.75rem" }}>Loading...</div>
        ) : logs.length === 0 ? (
          <div style={{ textAlign:"center", color:"rgba(255,255,255,0.2)", padding:"24px", fontSize:"0.75rem" }} className="ur">ابھی کوئی اندراج نہیں</div>
        ) : (
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead>
                <tr>
                  {["ہاؤس","ہفتہ","صفائی","اسمبلی","نماز","کینٹین","لائبریری","مانیٹر","کل"].map((h,i) => (
                    <th key={i} style={{ padding:"10px 12px", textAlign:"left", fontSize:"0.62rem", color:"rgba(212,175,55,0.7)", borderBottom:"1px solid rgba(255,255,255,0.08)", fontWeight:"700", whiteSpace:"nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.slice(0, 15).map((log, i) => {
                  const hInfo = HOUSES.find(h => h.id === (log.house_id||log.houseId)) || {};
                  const r = log.ratings || {};
                  return (
                    <tr key={i} style={{ borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                      <td style={{ padding:"10px 12px", fontSize:"0.72rem" }}>
                        <span style={{ color:hInfo.color||G, fontWeight:"700" }}>{hInfo.emoji} {hInfo.nameEn||log.houseName||"—"}</span>
                      </td>
                      <td style={{ padding:"10px 12px", fontSize:"0.62rem", color:"rgba(255,255,255,0.5)", fontFamily:"monospace", direction:"ltr" }}>{log.week}</td>
                      {["cleanliness","assembly","prayer","canteen","library","monitor"].map(id => (
                        <td key={id} style={{ padding:"10px 12px", textAlign:"center", fontSize:"0.7rem" }}>
                          {r[id] ? <span style={{ color:RATING_COLORS[r[id]], fontWeight:"700" }}>{r[id]}★</span> : <span style={{ color:"rgba(255,255,255,0.2)" }}>—</span>}
                        </td>
                      ))}
                      <td style={{ padding:"10px 12px", textAlign:"center", fontWeight:"900", fontSize:"0.85rem", color:G }}>{log.total_score||log.totalScore||0}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default WeeklyDutyChecklist;
