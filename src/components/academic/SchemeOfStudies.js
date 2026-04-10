/* eslint-disable */
import { useState, useEffect } from "react";
import { confirm } from '../ui/ConfirmDialog';
import { supabase, updateData, deleteData } from "../../supabase";

const G = "#d4af37", N = "#0f172a";
const GRADES = ["Nursery","Prep","1","2","3","4","5","6","7","8","9","10","11","12"];
const SUBJECTS_LIST = [
  "قرآن / حفظ","تجوید","اسلامیات","عربی","اردو","انگریزی","ریاضی",
  "سائنس","فزکس","کیمسٹری","حیاتیات","معاشرتی علوم","تاریخ",
  "پاکستان اسٹڈیز","کمپیوٹر","آرٹ","پی ای","درسِ نظامی","فقہ","حدیث",
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

export default function SchemeOfStudies({ addData }) {
  const [data, setData]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [editId, setEditId]       = useState(null);
  const [filterGrade, setFilter]  = useState("All");
  const [f, setF]                 = useState({ grade:"6", subject:"", periods_per_week:5, teacher_name:"" });

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const { data: rows } = await supabase.from("scheme_of_studies").select("*").order("grade").order("subject");
    setData(rows || []);
    setLoading(false);
  };

  const save = async () => {
    if (!f.grade || !f.subject) return;
    if (editId) {
      await updateData("scheme_of_studies", editId, f);
    } else {
      await addData("scheme_of_studies", f);
    }
    setShowForm(false); setEditId(null);
    setF({ grade:"6", subject:"", periods_per_week:5, teacher_name:"" });
    load();
  };

  const startEdit = (row) => {
    setF({ grade:row.grade, subject:row.subject, periods_per_week:row.periods_per_week, teacher_name:row.teacher_name||"" });
    setEditId(row.id);
    setShowForm(true);
  };

  const remove = async (id) => {
    if (!await confirm("کیا آپ یہ حذف کرنا چاہتے ہیں؟")) return;
    await deleteData("scheme_of_studies", id);
    load();
  };

  const filtered = filterGrade === "All" ? data : data.filter(d => d.grade === filterGrade);
  const grades   = ["All", ...GRADES.filter(g => data.some(d => d.grade === g))];

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(160deg,#0f172a 0%,#0d1f3c 60%,#0f172a 100%)",
      padding:"24px 20px", fontFamily:"'Public Sans',sans-serif", direction:"rtl" }}>

      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
        <div>
          <h1 style={{ color:G, margin:"0 0 4px", fontSize:22 }}>📋 اسکیم آف اسٹڈیز</h1>
          <p style={{ color:"#64748b", margin:0, fontSize:13 }}>ہر جماعت کے مضامین اور پیریڈز کا شیڈول</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditId(null); setF({ grade:"6", subject:"", periods_per_week:5, teacher_name:"" }); }}
          style={{ background:G, color:N, border:"none", borderRadius:10, padding:"10px 20px",
            fontWeight:700, cursor:"pointer", fontSize:14 }}>
          + مضمون شامل کریں
        </button>
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:20 }}>
        {[
          ["کل مضامین", data.length, "#60a5fa"],
          ["جماعتیں", new Set(data.map(d=>d.grade)).size, G],
          ["اوسط پیریڈز", data.length ? Math.round(data.reduce((s,d)=>s+(d.periods_per_week||0),0)/data.length) : 0, "#4ade80"],
        ].map(([label, val, color]) => (
          <div key={label} style={{ ...glass, padding:"14px 18px", textAlign:"center" }}>
            <div style={{ color, fontSize:24, fontWeight:700 }}>{val}</div>
            <div style={{ color:"#64748b", fontSize:12, marginTop:4 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Grade filter */}
      <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:20 }}>
        {grades.map(g => (
          <button key={g} onClick={() => setFilter(g)}
            style={{ border:"none", borderRadius:20, padding:"6px 16px", cursor:"pointer",
              fontSize:13, fontWeight:600,
              background: filterGrade===g ? G : "rgba(255,255,255,0.07)",
              color: filterGrade===g ? N : "#94a3b8" }}>
            {g === "All" ? "تمام" : `جماعت ${g}`}
          </button>
        ))}
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div style={{ ...glass, padding:20, marginBottom:20 }}>
          <h3 style={{ color:G, margin:"0 0 16px", fontSize:16 }}>
            {editId ? "✏️ ترمیم" : "+ نیا مضمون"}
          </h3>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:12 }}>
            <div>
              <label style={lbl}>جماعت *</label>
              <select value={f.grade} onChange={e=>setF(x=>({...x,grade:e.target.value}))} style={{...inp,appearance:"none"}}>
                {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>مضمون *</label>
              <select value={f.subject} onChange={e=>setF(x=>({...x,subject:e.target.value}))} style={{...inp,appearance:"none"}}>
                <option value="">— منتخب کریں —</option>
                {SUBJECTS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>پیریڈز فی ہفتہ</label>
              <input type="number" min={1} max={10} value={f.periods_per_week}
                onChange={e=>setF(x=>({...x,periods_per_week:parseInt(e.target.value)||1}))}
                style={{...inp,direction:"ltr"}}/>
            </div>
            <div>
              <label style={lbl}>استاد کا نام</label>
              <input value={f.teacher_name} onChange={e=>setF(x=>({...x,teacher_name:e.target.value}))}
                placeholder="اختیاری" style={inp}/>
            </div>
          </div>
          <div style={{ display:"flex", gap:10, marginTop:14, justifyContent:"flex-end" }}>
            <button onClick={() => { setShowForm(false); setEditId(null); }}
              style={{ background:"#334155", color:"#f1f5f9", border:"none", borderRadius:8,
                padding:"9px 18px", cursor:"pointer", fontWeight:600 }}>
              منسوخ
            </button>
            <button onClick={save} disabled={!f.grade||!f.subject}
              style={{ background: (!f.grade||!f.subject) ? "#334155" : G,
                color: (!f.grade||!f.subject) ? "#64748b" : N,
                border:"none", borderRadius:8, padding:"9px 18px",
                cursor: (!f.grade||!f.subject) ? "not-allowed" : "pointer", fontWeight:700 }}>
              ✅ محفوظ کریں
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <p style={{ color:"#64748b", textAlign:"center", padding:40 }}>لوڈ ہو رہا ہے...</p>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign:"center", padding:60 }}>
          <div style={{ fontSize:48, marginBottom:12 }}>📋</div>
          <p style={{ color:"#64748b" }}>کوئی مضمون نہیں ملا</p>
        </div>
      ) : (
        <div style={{ ...glass, overflow:"hidden" }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ background:"rgba(212,175,55,0.1)" }}>
                {["مضمون","جماعت","پیریڈز/ہفتہ","استاد","عمل"].map(h => (
                  <th key={h} style={{ color:G, padding:"12px 16px", textAlign:"right",
                    fontSize:12, fontWeight:700 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => (
                <tr key={row.id} style={{ background: i%2 ? "rgba(255,255,255,0.02)" : "transparent",
                  borderTop:"1px solid rgba(255,255,255,0.05)" }}>
                  <td style={{ color:"#f1f5f9", padding:"11px 16px", fontSize:14 }}>{row.subject}</td>
                  <td style={{ padding:"11px 16px" }}>
                    <span style={{ background:"rgba(212,175,55,0.12)", color:G,
                      padding:"2px 10px", borderRadius:20, fontSize:12 }}>
                      جماعت {row.grade}
                    </span>
                  </td>
                  <td style={{ color:"#60a5fa", padding:"11px 16px", fontSize:14, fontWeight:700 }}>
                    {row.periods_per_week}
                  </td>
                  <td style={{ color:"#94a3b8", padding:"11px 16px", fontSize:13 }}>
                    {row.teacher_name || "—"}
                  </td>
                  <td style={{ padding:"11px 16px" }}>
                    <div style={{ display:"flex", gap:8 }}>
                      <button onClick={() => startEdit(row)}
                        style={{ background:"rgba(96,165,250,0.12)", color:"#60a5fa",
                          border:"none", borderRadius:7, padding:"5px 12px",
                          cursor:"pointer", fontSize:12, fontWeight:600 }}>✏️</button>
                      <button onClick={() => remove(row.id)}
                        style={{ background:"rgba(248,113,113,0.12)", color:"#f87171",
                          border:"none", borderRadius:7, padding:"5px 12px",
                          cursor:"pointer", fontSize:12, fontWeight:600 }}>🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
