/* eslint-disable */
import { useState, useEffect } from "react";
import { confirm } from '../ui/ConfirmDialog';
import { supabase, deleteData } from "../../supabase";

const G = "#d4af37", N = "#0f172a";

const TYPE_CONFIG = {
  holiday:  { color:"#f87171", bg:"rgba(248,113,113,0.12)", label:"چھٹی",      icon:"🏖️" },
  exam:     { color:"#fb923c", bg:"rgba(251,146,60,0.12)",  label:"امتحان",     icon:"📝" },
  activity: { color:"#60a5fa", bg:"rgba(96,165,250,0.12)",  label:"سرگرمی",     icon:"🎭" },
  meeting:  { color:"#a78bfa", bg:"rgba(167,139,250,0.12)", label:"ملاقات",     icon:"👥" },
};

const MONTHS_UR = ["جنوری","فروری","مارچ","اپریل","مئی","جون","جولائی","اگست","ستمبر","اکتوبر","نومبر","دسمبر"];
const DAYS_UR   = ["اتوار","پیر","منگل","بدھ","جمعرات","جمعہ","ہفتہ"];

const glass = {
  background:"rgba(255,255,255,0.05)",
  border:"1px solid rgba(255,255,255,0.1)",
  borderRadius:14,
};
const inp = {
  width:"100%", padding:"10px 13px", borderRadius:9,
  border:"1px solid rgba(212,175,55,0.25)",
  background:"rgba(255,255,255,0.06)", color:"#f1f5f9",
  fontSize:"0.8rem", outline:"none", fontFamily:"inherit",
  boxSizing:"border-box", colorScheme:"dark",
};
const lbl = {
  fontSize:"0.68rem", color:"rgba(212,175,55,0.8)",
  marginBottom:5, display:"block", fontWeight:700,
};

export default function AcademicCalendar({ addData }) {
  const [events, setEvents]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [viewMode, setView]     = useState("month");
  const [filterType, setFilter] = useState("all");
  const [curDate, setCurDate]   = useState(new Date());
  const [f, setF]               = useState({ title:"", event_date:"", event_type:"activity", grade:"All", description:"" });

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("academic_calendar").select("*").order("event_date");
    setEvents(data || []);
    setLoading(false);
  };

  const save = async () => {
    if (!f.title || !f.event_date) return;
    await addData("academic_calendar", f);
    setShowForm(false);
    setF({ title:"", event_date:"", event_type:"activity", grade:"All", description:"" });
    load();
  };

  const remove = async (id) => {
    if (!await confirm("کیا آپ یہ حذف کرنا چاہتے ہیں؟")) return;
    await deleteData("academic_calendar", id);
    load();
  };

  // ── Calendar helpers ──────────────────────────────────────────────────────────
  const year  = curDate.getFullYear();
  const month = curDate.getMonth();
  const firstDay   = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayStr   = new Date().toISOString().split("T")[0];

  const eventsInMonth = events.filter(e => {
    const d = new Date(e.event_date);
    return d.getFullYear() === year && d.getMonth() === month;
  });

  const eventsOnDay = (day) => {
    const dateStr = `${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
    return eventsInMonth.filter(e => e.event_date === dateStr);
  };

  // ── List view filtered events ─────────────────────────────────────────────────
  const listEvents = filterType === "all" ? events : events.filter(e => e.event_type === filterType);

  // Group by month
  const grouped = {};
  listEvents.forEach(e => {
    const d = new Date(e.event_date);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (!grouped[key]) grouped[key] = { label:`${MONTHS_UR[d.getMonth()]} ${d.getFullYear()}`, items:[] };
    grouped[key].items.push(e);
  });

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(160deg,#0f172a 0%,#0d1f3c 60%,#0f172a 100%)",
      padding:"24px 20px", fontFamily:"'Public Sans',sans-serif", direction:"rtl" }}>

      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
        <div>
          <h1 style={{ color:G, margin:"0 0 4px", fontSize:22 }}>📅 تعلیمی کیلنڈر</h1>
          <p style={{ color:"#64748b", margin:0, fontSize:13 }}>چھٹیاں، امتحانات اور سرگرمیاں</p>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          {/* View toggle */}
          <div style={{ display:"flex", background:"rgba(255,255,255,0.05)", borderRadius:8, overflow:"hidden" }}>
            {[["month","📅 ماہانہ"],["list","📋 فہرست"]].map(([v,l]) => (
              <button key={v} onClick={() => setView(v)}
                style={{ border:"none", padding:"8px 16px", cursor:"pointer", fontSize:13,
                  background: viewMode===v ? G : "transparent",
                  color: viewMode===v ? N : "#94a3b8", fontWeight:600 }}>
                {l}
              </button>
            ))}
          </div>
          <button onClick={() => setShowForm(true)}
            style={{ background:G, color:N, border:"none", borderRadius:10, padding:"10px 20px",
              fontWeight:700, cursor:"pointer", fontSize:14 }}>
            + نئی تقریب
          </button>
        </div>
      </div>

      {/* Type legend */}
      <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:20 }}>
        <button onClick={() => setFilter("all")}
          style={{ border:"none", borderRadius:20, padding:"5px 14px", cursor:"pointer", fontSize:12,
            background: filterType==="all" ? G : "rgba(255,255,255,0.07)",
            color: filterType==="all" ? N : "#94a3b8", fontWeight:600 }}>تمام</button>
        {Object.entries(TYPE_CONFIG).map(([k,v]) => (
          <button key={k} onClick={() => setFilter(k)}
            style={{ border:"none", borderRadius:20, padding:"5px 14px", cursor:"pointer", fontSize:12,
              background: filterType===k ? v.color : v.bg,
              color: filterType===k ? "#fff" : v.color, fontWeight:600 }}>
            {v.icon} {v.label}
          </button>
        ))}
      </div>

      {/* Add Form */}
      {showForm && (
        <div style={{ ...glass, padding:20, marginBottom:20 }}>
          <h3 style={{ color:G, margin:"0 0 16px", fontSize:16 }}>+ نئی تقریب</h3>
          <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr", gap:12 }}>
            <div>
              <label style={lbl}>عنوان *</label>
              <input value={f.title} onChange={e=>setF(x=>({...x,title:e.target.value}))}
                placeholder="مثال: عید کی چھٹی" style={{...inp,direction:"rtl"}}/>
            </div>
            <div>
              <label style={lbl}>تاریخ *</label>
              <input type="date" value={f.event_date} onChange={e=>setF(x=>({...x,event_date:e.target.value}))} style={inp}/>
            </div>
            <div>
              <label style={lbl}>قسم</label>
              <select value={f.event_type} onChange={e=>setF(x=>({...x,event_type:e.target.value}))} style={{...inp,appearance:"none"}}>
                {Object.entries(TYPE_CONFIG).map(([k,v]) => (
                  <option key={k} value={k}>{v.icon} {v.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={lbl}>جماعت</label>
              <input value={f.grade} onChange={e=>setF(x=>({...x,grade:e.target.value}))}
                placeholder="All" style={{...inp,direction:"rtl"}}/>
            </div>
          </div>
          <div style={{ marginTop:12 }}>
            <label style={lbl}>تفصیل (اختیاری)</label>
            <input value={f.description} onChange={e=>setF(x=>({...x,description:e.target.value}))}
              placeholder="مزید معلومات..." style={{...inp,direction:"rtl"}}/>
          </div>
          <div style={{ display:"flex", gap:10, marginTop:14, justifyContent:"flex-end" }}>
            <button onClick={() => setShowForm(false)}
              style={{ background:"#334155", color:"#f1f5f9", border:"none", borderRadius:8,
                padding:"9px 18px", cursor:"pointer", fontWeight:600 }}>منسوخ</button>
            <button onClick={save} disabled={!f.title||!f.event_date}
              style={{ background:(!f.title||!f.event_date)?"#334155":G,
                color:(!f.title||!f.event_date)?"#64748b":N,
                border:"none", borderRadius:8, padding:"9px 18px",
                cursor:(!f.title||!f.event_date)?"not-allowed":"pointer", fontWeight:700 }}>
              ✅ محفوظ کریں
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p style={{ color:"#64748b", textAlign:"center", padding:40 }}>لوڈ ہو رہا ہے...</p>
      ) : viewMode === "month" ? (
        /* ── MONTH VIEW ── */
        <div style={glass}>
          {/* Month navigation */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"16px 20px",
            borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
            <button onClick={() => setCurDate(new Date(year, month-1, 1))}
              style={{ background:"rgba(255,255,255,0.07)", color:"#f1f5f9", border:"none",
                borderRadius:8, width:36, height:36, cursor:"pointer", fontSize:16 }}>←</button>
            <h3 style={{ color:G, margin:0, fontSize:18 }}>
              {MONTHS_UR[month]} {year}
            </h3>
            <button onClick={() => setCurDate(new Date(year, month+1, 1))}
              style={{ background:"rgba(255,255,255,0.07)", color:"#f1f5f9", border:"none",
                borderRadius:8, width:36, height:36, cursor:"pointer", fontSize:16 }}>→</button>
          </div>

          {/* Day headers */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", padding:"8px 10px 0" }}>
            {DAYS_UR.map(d => (
              <div key={d} style={{ color:"#64748b", fontSize:11, textAlign:"center", padding:"6px 0", fontWeight:700 }}>
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:2, padding:"4px 10px 12px" }}>
            {/* Empty cells before first day */}
            {Array(firstDay).fill(null).map((_, i) => (
              <div key={`e${i}`} style={{ minHeight:70 }}/>
            ))}
            {/* Day cells */}
            {Array(daysInMonth).fill(null).map((_, i) => {
              const day     = i + 1;
              const dateStr = `${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
              const dayEvts = eventsOnDay(day);
              const isToday = dateStr === todayStr;
              return (
                <div key={day} style={{
                  minHeight:70, padding:6, borderRadius:8,
                  background: isToday ? "rgba(212,175,55,0.1)" : "rgba(255,255,255,0.02)",
                  border: isToday ? `1px solid rgba(212,175,55,0.4)` : "1px solid rgba(255,255,255,0.04)",
                }}>
                  <div style={{ color: isToday ? G : "#94a3b8", fontSize:12, fontWeight: isToday ? 700 : 400,
                    marginBottom:4, direction:"ltr" }}>
                    {day}
                  </div>
                  {dayEvts.slice(0,2).map(e => {
                    const tc = TYPE_CONFIG[e.event_type] || TYPE_CONFIG.activity;
                    return (
                      <div key={e.id} title={e.title}
                        style={{ background:tc.bg, color:tc.color, fontSize:10, padding:"2px 5px",
                          borderRadius:4, marginBottom:2, overflow:"hidden", whiteSpace:"nowrap",
                          textOverflow:"ellipsis", cursor:"default" }}>
                        {tc.icon} {e.title}
                      </div>
                    );
                  })}
                  {dayEvts.length > 2 && (
                    <div style={{ color:"#64748b", fontSize:9 }}>+{dayEvts.length-2} مزید</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* ── LIST VIEW ── */
        <div>
          {Object.keys(grouped).length === 0 ? (
            <div style={{ textAlign:"center", padding:60 }}>
              <div style={{ fontSize:48, marginBottom:12 }}>📅</div>
              <p style={{ color:"#64748b" }}>کوئی تقریب نہیں — اوپر بٹن سے شامل کریں</p>
            </div>
          ) : (
            Object.values(grouped).map(group => (
              <div key={group.label} style={{ marginBottom:24 }}>
                <h4 style={{ color:"#94a3b8", fontSize:13, fontWeight:700, margin:"0 0 10px",
                  paddingBottom:6, borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
                  📅 {group.label}
                </h4>
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {group.items.map(e => {
                    const tc = TYPE_CONFIG[e.event_type] || TYPE_CONFIG.activity;
                    return (
                      <div key={e.id} style={{ ...glass, padding:"12px 16px",
                        borderRight:`3px solid ${tc.color}`, display:"flex",
                        justifyContent:"space-between", alignItems:"center" }}>
                        <div>
                          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                            <span style={{ background:tc.bg, color:tc.color, fontSize:11,
                              padding:"2px 10px", borderRadius:20, fontWeight:600 }}>
                              {tc.icon} {tc.label}
                            </span>
                            <span style={{ color:"#f1f5f9", fontSize:14, fontWeight:600 }}>{e.title}</span>
                            {e.grade && e.grade !== "All" && (
                              <span style={{ color:"#64748b", fontSize:12 }}>جماعت {e.grade}</span>
                            )}
                          </div>
                          {e.description && (
                            <p style={{ color:"#64748b", fontSize:12, margin:"4px 0 0" }}>{e.description}</p>
                          )}
                        </div>
                        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                          <span style={{ color:"#94a3b8", fontSize:12, direction:"ltr" }}>{e.event_date}</span>
                          <button onClick={() => remove(e.id)}
                            style={{ background:"rgba(248,113,113,0.12)", color:"#f87171",
                              border:"none", borderRadius:7, padding:"5px 10px",
                              cursor:"pointer", fontSize:12 }}>🗑</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
