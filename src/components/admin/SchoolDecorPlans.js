/* eslint-disable */
import { useState, useEffect } from "react";
import { supabase, updateData, deleteData } from "../../supabase";

const G = "#d4af37", N = "#0f172a";

const OCCASIONS = [
  "یومِ آزادی","عیدالفطر","عیدالاضحی","میلادالنبی ﷺ","یومِ قائداعظم",
  "یومِ اقبال","سالانہ جلسہ","اسپورٹس ڈے","سائنس فیئر","پرائز ڈے",
  "نئے تعلیمی سال کا آغاز","والدین کا دن","استقبالِ رمضان","ختمِ قرآن","کھیلوں کا میلہ","دیگر"
];

const STATUS_CONFIG = {
  planning:    { label:"منصوبہ بندی", color:"#f59e0b", bg:"rgba(245,158,11,0.12)"  },
  inprogress:  { label:"جاری",        color:"#60a5fa", bg:"rgba(96,165,250,0.12)"  },
  ready:       { label:"تیار",        color:"#4ade80", bg:"rgba(74,222,128,0.12)"  },
  completed:   { label:"مکمل",        color:"#94a3b8", bg:"rgba(148,163,184,0.1)"  },
};

const DECOR_ITEMS = [
  "جھنڈیاں / بنٹنگ","بینر / فلیکس","سٹیج سجاوٹ","پھول / گلدستے",
  "بیلون","لائٹنگ","دروازے کی سجاوٹ","کلاس رومز کی سجاوٹ",
  "داخلی دروازہ","آڈیو سسٹم","پروجیکٹر / اسکرین","خیمہ / کینوپی",
  "کرسیاں / میزیں","کارپٹ / دری","فوٹو بوتھ","سٹیج کرٹن",
];

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

export default function SchoolDecorPlans({ addData }) {
  const [plans, setPlans]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId]     = useState(null);
  const [filterStatus, setFilter] = useState("all");
  const [expandedId, setExpanded] = useState(null);
  const [f, setF] = useState({
    occasion:"یومِ آزادی", event_date:"", theme:"", colors:"سبز، سفید",
    responsible_person:"", budget:"", status:"planning", notes:"",
    decor_items:[]
  });

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("school_decor_plans")
      .select("*").order("event_date", { ascending: true });
    setPlans(data || []);
    setLoading(false);
  };

  const save = async () => {
    if (!f.occasion || !f.event_date) return;
    const payload = { ...f, decor_items: JSON.stringify(f.decor_items) };
    if (editId) {
      await updateData("school_decor_plans", editId, payload);
    } else {
      await addData("school_decor_plans", payload);
    }
    setShowForm(false); setEditId(null);
    setF({ occasion:"یومِ آزادی", event_date:"", theme:"", colors:"سبز، سفید",
      responsible_person:"", budget:"", status:"planning", notes:"", decor_items:[] });
    load();
  };

  const startEdit = (p) => {
    const items = typeof p.decor_items === "string"
      ? JSON.parse(p.decor_items || "[]") : (p.decor_items || []);
    setF({ occasion:p.occasion, event_date:p.event_date, theme:p.theme||"",
      colors:p.colors||"", responsible_person:p.responsible_person||"",
      budget:p.budget||"", status:p.status||"planning", notes:p.notes||"",
      decor_items: items });
    setEditId(p.id); setShowForm(true);
  };

  const remove = async (id) => {
    if (!window.confirm("کیا آپ یہ پلان حذف کرنا چاہتے ہیں؟")) return;
    await deleteData("school_decor_plans", id);
    load();
  };

  const updateStatus = async (id, newStatus) => {
    await updateData("school_decor_plans", id, { status: newStatus });
    load();
  };

  const toggleItem = (item) => {
    setF(x => ({
      ...x,
      decor_items: x.decor_items.includes(item)
        ? x.decor_items.filter(i => i !== item)
        : [...x.decor_items, item]
    }));
  };

  const getDaysLeft = (dateStr) => {
    const diff = new Date(dateStr) - Date.now();
    const days = Math.ceil(diff / 86400000);
    if (days < 0) return { text: `${Math.abs(days)} دن پہلے`, color: "#94a3b8" };
    if (days === 0) return { text: "آج!", color: "#f87171" };
    if (days <= 7) return { text: `${days} دن باقی`, color: "#fb923c" };
    return { text: `${days} دن باقی`, color: "#4ade80" };
  };

  const filtered = filterStatus === "all" ? plans : plans.filter(p => p.status === filterStatus);

  const stats = {
    total: plans.length,
    planning: plans.filter(p => p.status === "planning").length,
    inprogress: plans.filter(p => p.status === "inprogress").length,
    ready: plans.filter(p => p.status === "ready").length,
  };

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(160deg,#0f172a 0%,#0d1f3c 60%,#0f172a 100%)",
      padding:"24px 20px", fontFamily:"'Public Sans',sans-serif", direction:"rtl" }}>

      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
        <div>
          <h1 style={{ color:G, margin:"0 0 4px", fontSize:22 }}>🎨 اسکول سجاوٹ منصوبے</h1>
          <p style={{ color:"#64748b", margin:0, fontSize:13 }}>تقریبات کی سجاوٹ کی منصوبہ بندی</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditId(null);
          setF({ occasion:"یومِ آزادی", event_date:"", theme:"", colors:"سبز، سفید",
            responsible_person:"", budget:"", status:"planning", notes:"", decor_items:[] }); }}
          style={{ background:G, color:N, border:"none", borderRadius:10, padding:"10px 20px",
            fontWeight:700, cursor:"pointer", fontSize:14 }}>
          + نیا پلان
        </button>
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:20 }}>
        {[
          ["کل پلان",    stats.total,      "#f1f5f9"],
          ["منصوبہ بندی", stats.planning,   "#f59e0b"],
          ["جاری",       stats.inprogress,  "#60a5fa"],
          ["تیار",       stats.ready,       "#4ade80"],
        ].map(([label, val, color]) => (
          <div key={label} style={{ ...glass, padding:"14px 18px", textAlign:"center" }}>
            <div style={{ color, fontSize:26, fontWeight:700 }}>{val}</div>
            <div style={{ color:"#64748b", fontSize:12, marginTop:4 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Status filter */}
      <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:20 }}>
        <button onClick={() => setFilter("all")}
          style={{ border:"none", borderRadius:20, padding:"6px 16px", cursor:"pointer",
            fontSize:12, fontWeight:600,
            background: filterStatus==="all" ? G : "rgba(255,255,255,0.07)",
            color: filterStatus==="all" ? N : "#94a3b8" }}>تمام</button>
        {Object.entries(STATUS_CONFIG).map(([k, v]) => (
          <button key={k} onClick={() => setFilter(k)}
            style={{ border:"none", borderRadius:20, padding:"6px 16px", cursor:"pointer",
              fontSize:12, fontWeight:600,
              background: filterStatus===k ? v.color : v.bg,
              color: filterStatus===k ? "#fff" : v.color }}>
            {v.label}
          </button>
        ))}
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div style={{ ...glass, padding:20, marginBottom:20 }}>
          <h3 style={{ color:G, margin:"0 0 16px", fontSize:16 }}>
            {editId ? "✏️ پلان میں ترمیم" : "+ نیا سجاوٹ پلان"}
          </h3>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:12, marginBottom:12 }}>
            <div>
              <label style={lbl}>تقریب *</label>
              <select value={f.occasion} onChange={e=>setF(x=>({...x,occasion:e.target.value}))}
                style={{...inp, appearance:"none", direction:"rtl"}}>
                {OCCASIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>تاریخ *</label>
              <input type="date" value={f.event_date} onChange={e=>setF(x=>({...x,event_date:e.target.value}))} style={inp}/>
            </div>
            <div>
              <label style={lbl}>تھیم</label>
              <input value={f.theme} onChange={e=>setF(x=>({...x,theme:e.target.value}))}
                placeholder="مثال: قومی رنگ، اسلامی" style={{...inp,direction:"rtl"}}/>
            </div>
            <div>
              <label style={lbl}>رنگ</label>
              <input value={f.colors} onChange={e=>setF(x=>({...x,colors:e.target.value}))}
                placeholder="مثال: سبز، سفید" style={{...inp,direction:"rtl"}}/>
            </div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, marginBottom:16 }}>
            <div>
              <label style={lbl}>ذمہ دار شخص</label>
              <input value={f.responsible_person} onChange={e=>setF(x=>({...x,responsible_person:e.target.value}))}
                placeholder="استاد کا نام" style={{...inp,direction:"rtl"}}/>
            </div>
            <div>
              <label style={lbl}>بجٹ (روپے)</label>
              <input type="number" value={f.budget} onChange={e=>setF(x=>({...x,budget:e.target.value}))}
                placeholder="5000" style={{...inp,direction:"ltr"}}/>
            </div>
            <div>
              <label style={lbl}>حیثیت</label>
              <select value={f.status} onChange={e=>setF(x=>({...x,status:e.target.value}))}
                style={{...inp, appearance:"none"}}>
                {Object.entries(STATUS_CONFIG).map(([k,v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Decor items checklist */}
          <div style={{ marginBottom:14 }}>
            <label style={lbl}>سجاوٹ کی اشیاء (جو چاہیں منتخب کریں)</label>
            <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
              {DECOR_ITEMS.map(item => {
                const selected = f.decor_items.includes(item);
                return (
                  <button key={item} onClick={() => toggleItem(item)}
                    style={{ border:`1px solid ${selected ? G : "rgba(212,175,55,0.2)"}`,
                      borderRadius:20, padding:"5px 14px", cursor:"pointer", fontSize:12,
                      background: selected ? "rgba(212,175,55,0.2)" : "rgba(255,255,255,0.04)",
                      color: selected ? G : "#94a3b8", fontWeight: selected ? 700 : 400 }}>
                    {selected ? "✓ " : ""}{item}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ marginBottom:14 }}>
            <label style={lbl}>نوٹس (اختیاری)</label>
            <textarea value={f.notes} onChange={e=>setF(x=>({...x,notes:e.target.value}))}
              rows={2} placeholder="اضافی ہدایات یا یادداشت..."
              style={{...inp, resize:"vertical", direction:"rtl"}}/>
          </div>

          <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
            <button onClick={() => { setShowForm(false); setEditId(null); }}
              style={{ background:"#334155", color:"#f1f5f9", border:"none", borderRadius:8,
                padding:"9px 18px", cursor:"pointer", fontWeight:600 }}>منسوخ</button>
            <button onClick={save} disabled={!f.occasion||!f.event_date}
              style={{ background:(!f.occasion||!f.event_date)?"#334155":G,
                color:(!f.occasion||!f.event_date)?"#64748b":N,
                border:"none", borderRadius:8, padding:"9px 18px",
                cursor:(!f.occasion||!f.event_date)?"not-allowed":"pointer", fontWeight:700 }}>
              ✅ محفوظ کریں
            </button>
          </div>
        </div>
      )}

      {/* Plans List */}
      {loading ? (
        <p style={{ color:"#64748b", textAlign:"center", padding:40 }}>لوڈ ہو رہا ہے...</p>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign:"center", padding:60 }}>
          <div style={{ fontSize:48, marginBottom:12 }}>🎨</div>
          <p style={{ color:"#64748b" }}>کوئی پلان نہیں — اوپر بٹن سے شامل کریں</p>
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          {filtered.map(plan => {
            const st = STATUS_CONFIG[plan.status] || STATUS_CONFIG.planning;
            const dl = plan.event_date ? getDaysLeft(plan.event_date) : null;
            const items = typeof plan.decor_items === "string"
              ? JSON.parse(plan.decor_items || "[]") : (plan.decor_items || []);
            const isExpanded = expandedId === plan.id;

            return (
              <div key={plan.id} style={{ ...glass, padding:0, overflow:"hidden",
                borderRight:`3px solid ${st.color}` }}>

                {/* Main row */}
                <div style={{ padding:"16px 20px", display:"flex",
                  justifyContent:"space-between", alignItems:"center" }}>

                  <div style={{ flex:1, cursor:"pointer" }} onClick={() => setExpanded(isExpanded ? null : plan.id)}>
                    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6, flexWrap:"wrap" }}>
                      <span style={{ color:"#f1f5f9", fontSize:16, fontWeight:700 }}>
                        🎨 {plan.occasion}
                      </span>
                      <span style={{ background:st.bg, color:st.color,
                        padding:"2px 12px", borderRadius:20, fontSize:12, fontWeight:600 }}>
                        {st.label}
                      </span>
                      {dl && (
                        <span style={{ color:dl.color, fontSize:12, fontWeight:600 }}>
                          📅 {dl.text}
                        </span>
                      )}
                    </div>

                    <div style={{ display:"flex", gap:20, fontSize:13, color:"#94a3b8", flexWrap:"wrap" }}>
                      {plan.event_date && <span>📅 {plan.event_date}</span>}
                      {plan.theme && <span>🎭 {plan.theme}</span>}
                      {plan.colors && <span>🎨 {plan.colors}</span>}
                      {plan.responsible_person && <span>👤 {plan.responsible_person}</span>}
                      {plan.budget && <span>💰 {plan.budget} روپے</span>}
                    </div>
                  </div>

                  {/* Status quick-change */}
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginRight:12 }}>
                    <select value={plan.status}
                      onChange={e => updateStatus(plan.id, e.target.value)}
                      style={{ background:"rgba(255,255,255,0.07)", color:st.color,
                        border:`1px solid ${st.color}50`, borderRadius:8,
                        padding:"5px 10px", fontSize:12, cursor:"pointer",
                        outline:"none", appearance:"none", fontFamily:"inherit" }}>
                      {Object.entries(STATUS_CONFIG).map(([k,v]) => (
                        <option key={k} value={k}>{v.label}</option>
                      ))}
                    </select>
                    <button onClick={() => startEdit(plan)}
                      style={{ background:"rgba(96,165,250,0.12)", color:"#60a5fa",
                        border:"none", borderRadius:8, padding:"7px 12px",
                        cursor:"pointer", fontSize:13 }}>✏️</button>
                    <button onClick={() => remove(plan.id)}
                      style={{ background:"rgba(248,113,113,0.12)", color:"#f87171",
                        border:"none", borderRadius:8, padding:"7px 12px",
                        cursor:"pointer", fontSize:13 }}>🗑</button>
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div style={{ padding:"0 20px 16px",
                    borderTop:"1px solid rgba(255,255,255,0.06)" }}>

                    {items.length > 0 && (
                      <div style={{ marginTop:14 }}>
                        <div style={{ color:"#94a3b8", fontSize:12, fontWeight:700,
                          marginBottom:10 }}>📦 سجاوٹ کی فہرست</div>
                        <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                          {items.map(item => (
                            <span key={item} style={{ background:"rgba(212,175,55,0.1)",
                              color:G, padding:"4px 14px", borderRadius:20, fontSize:12 }}>
                              ✓ {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {plan.notes && (
                      <div style={{ marginTop:12, background:"rgba(255,255,255,0.03)",
                        borderRadius:8, padding:"10px 14px" }}>
                        <div style={{ color:"#64748b", fontSize:12 }}>
                          📝 {plan.notes}
                        </div>
                      </div>
                    )}

                    {/* Progress bar based on status */}
                    <div style={{ marginTop:14 }}>
                      <div style={{ display:"flex", justifyContent:"space-between",
                        fontSize:11, color:"#64748b", marginBottom:5 }}>
                        <span>پیشرفت</span>
                        <span>{
                          plan.status==="planning" ? "25%" :
                          plan.status==="inprogress" ? "60%" :
                          plan.status==="ready" ? "90%" : "100%"
                        }</span>
                      </div>
                      <div style={{ height:6, background:"rgba(255,255,255,0.08)",
                        borderRadius:3, overflow:"hidden" }}>
                        <div style={{
                          height:"100%", borderRadius:3, transition:"width .5s",
                          width: plan.status==="planning" ? "25%" :
                                 plan.status==="inprogress" ? "60%" :
                                 plan.status==="ready" ? "90%" : "100%",
                          background: st.color,
                        }}/>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
