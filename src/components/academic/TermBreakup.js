/* eslint-disable */
import { useState, useEffect } from "react";
import { confirm } from '../ui/ConfirmDialog';
import { supabase, updateData, deleteData } from "../../supabase";

const G = "#d4af37", N = "#0f172a";
const YEARS = ["2024-2025","2025-2026","2026-2027"];

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
  boxSizing:"border-box", colorScheme:"dark", direction:"ltr",
};
const lbl = {
  fontSize:"0.68rem", color:"rgba(212,175,55,0.8)",
  marginBottom:5, display:"block", fontWeight:700,
};

export default function TermBreakup({ addData }) {
  const [terms, setTerms]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId]     = useState(null);
  const [year, setYear]         = useState("2025-2026");
  const [f, setF]               = useState({ term_name:"", start_date:"", end_date:"", academic_year:"2025-2026", description:"" });

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("term_breakup").select("*").order("start_date");
    setTerms(data || []);
    setLoading(false);
  };

  const save = async () => {
    if (!f.term_name || !f.start_date || !f.end_date) return;
    if (editId) {
      await updateData("term_breakup", editId, f);
    } else {
      await addData("term_breakup", f);
    }
    setShowForm(false); setEditId(null);
    setF({ term_name:"", start_date:"", end_date:"", academic_year:year, description:"" });
    load();
  };

  const startEdit = (t) => {
    setF({ term_name:t.term_name, start_date:t.start_date, end_date:t.end_date,
      academic_year:t.academic_year, description:t.description||"" });
    setEditId(t.id); setShowForm(true);
  };

  const remove = async (id) => {
    if (!await confirm("کیا آپ یہ ٹرم حذف کرنا چاہتے ہیں؟")) return;
    await deleteData("term_breakup", id);
    load();
  };

  const getProgress = (term) => {
    const start = new Date(term.start_date).getTime();
    const end   = new Date(term.end_date).getTime();
    const now   = Date.now();
    if (now < start) return 0;
    if (now > end)   return 100;
    return Math.round(((now - start) / (end - start)) * 100);
  };

  const getDaysLeft = (term) => {
    const diff = new Date(term.end_date) - Date.now();
    return Math.max(0, Math.ceil(diff / 86400000));
  };

  const getDuration = (term) => {
    const diff = new Date(term.end_date) - new Date(term.start_date);
    const days = Math.ceil(diff / 86400000);
    const weeks = Math.round(days / 7);
    return `${weeks} ہفتے (${days} دن)`;
  };

  const getStatus = (term) => {
    const now = Date.now();
    const start = new Date(term.start_date).getTime();
    const end   = new Date(term.end_date).getTime();
    if (now < start) return { label:"آنے والا", color:"#f59e0b", bg:"rgba(245,158,11,0.12)", border:"rgba(245,158,11,0.3)" };
    if (now > end)   return { label:"مکمل",    color:"#94a3b8", bg:"rgba(148,163,184,0.08)", border:"rgba(148,163,184,0.2)" };
    return { label:"جاری ٹرم", color:"#4ade80", bg:"rgba(74,222,128,0.12)", border:"rgba(74,222,128,0.4)" };
  };

  const filtered = terms.filter(t => t.academic_year === year);

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(160deg,#0f172a 0%,#0d1f3c 60%,#0f172a 100%)",
      padding:"24px 20px", fontFamily:"'Public Sans',sans-serif", direction:"rtl" }}>

      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
        <div>
          <h1 style={{ color:G, margin:"0 0 4px", fontSize:22 }}>🗓️ ٹرم تقسیم</h1>
          <p style={{ color:"#64748b", margin:0, fontSize:13 }}>تعلیمی سال کی ٹرم وار تقسیم</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditId(null); setF({ term_name:"", start_date:"", end_date:"", academic_year:year, description:"" }); }}
          style={{ background:G, color:N, border:"none", borderRadius:10, padding:"10px 20px",
            fontWeight:700, cursor:"pointer", fontSize:14 }}>
          + نئی ٹرم
        </button>
      </div>

      {/* Year selector */}
      <div style={{ display:"flex", gap:8, marginBottom:20 }}>
        {YEARS.map(y => (
          <button key={y} onClick={() => setYear(y)}
            style={{ border:"none", borderRadius:20, padding:"7px 18px", cursor:"pointer",
              fontSize:13, fontWeight:600,
              background: year===y ? G : "rgba(255,255,255,0.07)",
              color: year===y ? N : "#94a3b8" }}>
            {y}
          </button>
        ))}
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div style={{ ...glass, padding:20, marginBottom:20 }}>
          <h3 style={{ color:G, margin:"0 0 16px", fontSize:16 }}>
            {editId ? "✏️ ترمیم" : "+ نئی ٹرم"}
          </h3>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:12 }}>
            <div>
              <label style={lbl}>ٹرم کا نام *</label>
              <input value={f.term_name} onChange={e=>setF(x=>({...x,term_name:e.target.value}))}
                placeholder="مثال: پہلی ٹرم" style={{...inp,direction:"rtl"}}/>
            </div>
            <div>
              <label style={lbl}>شروع تاریخ *</label>
              <input type="date" value={f.start_date} onChange={e=>setF(x=>({...x,start_date:e.target.value}))} style={inp}/>
            </div>
            <div>
              <label style={lbl}>ختم تاریخ *</label>
              <input type="date" value={f.end_date} onChange={e=>setF(x=>({...x,end_date:e.target.value}))} style={inp}/>
            </div>
            <div>
              <label style={lbl}>تعلیمی سال</label>
              <select value={f.academic_year} onChange={e=>setF(x=>({...x,academic_year:e.target.value}))} style={{...inp,appearance:"none"}}>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginTop:12 }}>
            <label style={lbl}>تفصیل (اختیاری)</label>
            <input value={f.description} onChange={e=>setF(x=>({...x,description:e.target.value}))}
              placeholder="ٹرم کے بارے میں..." style={{...inp,direction:"rtl"}}/>
          </div>
          <div style={{ display:"flex", gap:10, marginTop:14, justifyContent:"flex-end" }}>
            <button onClick={() => { setShowForm(false); setEditId(null); }}
              style={{ background:"#334155", color:"#f1f5f9", border:"none", borderRadius:8,
                padding:"9px 18px", cursor:"pointer", fontWeight:600 }}>منسوخ</button>
            <button onClick={save} disabled={!f.term_name||!f.start_date||!f.end_date}
              style={{ background:(!f.term_name||!f.start_date||!f.end_date)?"#334155":G,
                color:(!f.term_name||!f.start_date||!f.end_date)?"#64748b":N,
                border:"none", borderRadius:8, padding:"9px 18px",
                cursor:(!f.term_name||!f.start_date||!f.end_date)?"not-allowed":"pointer", fontWeight:700 }}>
              ✅ محفوظ کریں
            </button>
          </div>
        </div>
      )}

      {/* Terms list */}
      {loading ? (
        <p style={{ color:"#64748b", textAlign:"center", padding:40 }}>لوڈ ہو رہا ہے...</p>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign:"center", padding:60 }}>
          <div style={{ fontSize:48, marginBottom:12 }}>🗓️</div>
          <p style={{ color:"#64748b" }}>اس سال کی کوئی ٹرم نہیں — اوپر بٹن سے شامل کریں</p>
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          {filtered.map(term => {
            const status   = getStatus(term);
            const progress = getProgress(term);
            const daysLeft = getDaysLeft(term);
            const isCurrent = status.label === "جاری ٹرم";
            return (
              <div key={term.id} style={{
                ...glass, padding:20,
                border:`1px solid ${status.border}`,
                boxShadow: isCurrent ? `0 0 20px ${status.bg}` : "none",
              }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:10 }}>
                      <h3 style={{ color:"#f1f5f9", margin:0, fontSize:18 }}>{term.term_name}</h3>
                      <span style={{ background:status.bg, color:status.color,
                        padding:"3px 12px", borderRadius:20, fontSize:12, fontWeight:700 }}>
                        {status.label}
                      </span>
                      <span style={{ background:"rgba(212,175,55,0.1)", color:G,
                        padding:"3px 12px", borderRadius:20, fontSize:12 }}>
                        {term.academic_year}
                      </span>
                    </div>

                    <div style={{ display:"flex", gap:20, fontSize:13, color:"#94a3b8", marginBottom:12 }}>
                      <span>📅 {term.start_date} — {term.end_date}</span>
                      <span>⏱ {getDuration(term)}</span>
                      {isCurrent && <span style={{ color:"#4ade80", fontWeight:600 }}>🕐 {daysLeft} دن باقی</span>}
                    </div>

                    {term.description && (
                      <p style={{ color:"#64748b", fontSize:13, margin:"0 0 12px" }}>{term.description}</p>
                    )}

                    {/* Progress bar */}
                    <div>
                      <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"#64748b", marginBottom:5 }}>
                        <span>پیشرفت</span>
                        <span>{progress}%</span>
                      </div>
                      <div style={{ height:8, background:"rgba(255,255,255,0.08)", borderRadius:4, overflow:"hidden" }}>
                        <div style={{
                          height:"100%", borderRadius:4,
                          width:`${progress}%`,
                          background: isCurrent
                            ? `linear-gradient(90deg, #4ade80, #22c55e)`
                            : progress===100 ? "#475569" : G,
                          transition:"width .5s",
                        }}/>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display:"flex", gap:8, marginRight:16 }}>
                    <button onClick={() => startEdit(term)}
                      style={{ background:"rgba(96,165,250,0.12)", color:"#60a5fa",
                        border:"none", borderRadius:8, padding:"7px 14px",
                        cursor:"pointer", fontSize:13, fontWeight:600 }}>✏️</button>
                    <button onClick={() => remove(term.id)}
                      style={{ background:"rgba(248,113,113,0.12)", color:"#f87171",
                        border:"none", borderRadius:8, padding:"7px 14px",
                        cursor:"pointer", fontSize:13, fontWeight:600 }}>🗑</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
