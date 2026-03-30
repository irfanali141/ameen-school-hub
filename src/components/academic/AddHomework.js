/* eslint-disable */
import { useState } from "react";
import { C } from "../../constants";

const SUBJECTS = [
  "قرآن / حفظ","تجوید","اسلامیات","عربی","اردو",
  "انگریزی","ریاضی","سائنس","معاشرتی علوم","کمپیوٹر",
  "درسِ نظامی","فقہ","حدیث","دیگر"
];

const N  = "#0f172a";
const N2 = "#1e293b";
const G  = "#d4af37";

const inp = {
  width:"100%", padding:"10px 13px", borderRadius:"9px",
  border:"1px solid rgba(255,255,255,0.12)",
  background:"rgba(255,255,255,0.06)", color:"#f1f5f9",
  fontSize:"0.8rem", outline:"none", fontFamily:"inherit",
  boxSizing:"border-box", direction:"rtl",
};
const lbl = {
  fontSize:"0.68rem", color:"rgba(212,175,55,0.8)",
  marginBottom:"5px", display:"block", fontWeight:"700", direction:"rtl",
};
const row = { marginBottom:"14px" };

export default function AddHomework({ students, onSave, onClose }){
  const today = new Date().toISOString().split("T")[0];

  // Derive unique grades/classes from students
  const grades = [...new Set(students.map(s=>s.grade).filter(Boolean))].sort();

  const [form, setForm] = useState({
    grade:"", subject:"", title:"", description:"", due_date:"", total_marks:10,
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr]       = useState("");

  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const validate = () => {
    if(!form.grade)       return "جماعت منتخب کریں";
    if(!form.subject)     return "مضمون منتخب کریں";
    if(!form.title.trim())return "عنوان درج کریں";
    if(!form.due_date)    return "آخری تاریخ درج کریں";
    if(form.due_date < today) return "آخری تاریخ گزشتہ نہیں ہو سکتی";
    return "";
  };

  const save = async () => {
    const e = validate();
    if(e){ setErr(e); return; }
    setSaving(true); setErr("");
    await onSave({ ...form, total_marks: Number(form.total_marks)||10 });
    setSaving(false);
    onClose();
  };

  // Days until due
  const daysLeft = form.due_date
    ? Math.ceil((new Date(form.due_date) - new Date()) / 86400000)
    : null;
  const dueColor = daysLeft===null?"#94a3b8":daysLeft<0?"#f87171":daysLeft<=1?"#fb923c":daysLeft<=3?"#facc15":"#4ade80";

  return (
    <div style={{position:"fixed",inset:0,zIndex:1000,
      background:"rgba(0,0,0,0.7)",backdropFilter:"blur(6px)",
      display:"flex",alignItems:"center",justifyContent:"center",padding:"16px"}}>
      <div style={{width:"100%",maxWidth:"480px",
        background:`linear-gradient(160deg,${N} 0%,#0d1f3c 100%)`,
        borderRadius:"18px",border:"1px solid rgba(255,255,255,0.1)",
        boxShadow:"0 24px 64px rgba(0,0,0,0.5)",overflow:"hidden"}}>

        {/* Header */}
        <div style={{padding:"16px 20px",
          borderBottom:"1px solid rgba(255,255,255,0.07)",
          display:"flex",alignItems:"center",justifyContent:"space-between",direction:"rtl"}}>
          <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
            <div style={{width:"36px",height:"36px",borderRadius:"9px",
              background:`linear-gradient(135deg,${G},#b8960a)`,
              display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:"1.1rem"}}>📝</div>
            <div>
              <div style={{fontSize:"1rem",fontWeight:"800",color:"#f1f5f9"}}>نیا ہوم ورک</div>
              <div style={{fontSize:"0.62rem",color:"rgba(212,175,55,0.6)"}}>سبق / اسائنمنٹ شامل کریں</div>
            </div>
          </div>
          <button onClick={onClose}
            style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",
              borderRadius:"8px",width:"32px",height:"32px",cursor:"pointer",
              color:"rgba(255,255,255,0.5)",fontSize:"1rem",display:"flex",
              alignItems:"center",justifyContent:"center"}}>✕</button>
        </div>

        {/* Form */}
        <div style={{padding:"20px",maxHeight:"70vh",overflowY:"auto"}}>

          {/* Grade + Subject row */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"14px"}}>
            <div>
              <label style={lbl}>جماعت *</label>
              <select value={form.grade} onChange={e=>set("grade",e.target.value)}
                style={{...inp,appearance:"none"}}>
                <option value="">— منتخب کریں —</option>
                {grades.map(g=><option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>مضمون *</label>
              <select value={form.subject} onChange={e=>set("subject",e.target.value)}
                style={{...inp,appearance:"none"}}>
                <option value="">— منتخب کریں —</option>
                {SUBJECTS.map(s=><option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Title */}
          <div style={row}>
            <label style={lbl}>عنوان *</label>
            <input value={form.title} onChange={e=>set("title",e.target.value)}
              placeholder="مثال: صفحہ ۱۵ تا ۱۸ حل کریں"
              style={inp}/>
          </div>

          {/* Description */}
          <div style={row}>
            <label style={lbl}>تفصیل (اختیاری)</label>
            <textarea value={form.description} onChange={e=>set("description",e.target.value)}
              placeholder="ہوم ورک کی مزید وضاحت..."
              rows={3}
              style={{...inp,resize:"none",lineHeight:"1.5"}}/>
          </div>

          {/* Due date + Marks */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"14px"}}>
            <div>
              <label style={lbl}>آخری تاریخ *</label>
              <input type="date" min={today} value={form.due_date}
                onChange={e=>set("due_date",e.target.value)}
                style={{...inp,direction:"ltr",colorScheme:"dark"}}/>
              {daysLeft!==null&&<div style={{fontSize:"0.6rem",marginTop:"4px",
                color:dueColor,fontWeight:"700",direction:"rtl"}}>
                {daysLeft<0?"⛔ تاریخ گزر گئی":
                 daysLeft===0?"🔴 آج آخری دن":
                 daysLeft===1?"🟠 کل آخری دن":
                 `🟢 ${daysLeft} دن باقی`}
              </div>}
            </div>
            <div>
              <label style={lbl}>کل نمبر</label>
              <input type="number" min={1} max={100} value={form.total_marks}
                onChange={e=>set("total_marks",e.target.value)}
                style={{...inp,direction:"ltr"}}/>
            </div>
          </div>

          {/* Students count preview */}
          {form.grade&&(
            <div style={{padding:"10px 14px",borderRadius:"9px",marginBottom:"14px",
              background:"rgba(96,165,250,0.08)",border:"1px solid rgba(96,165,250,0.15)",
              direction:"rtl"}}>
              <span style={{fontSize:"0.7rem",color:"#60a5fa",fontWeight:"700"}}>
                👥 {students.filter(s=>s.grade===form.grade).length} طلبہ
              </span>
              <span style={{fontSize:"0.65rem",color:"rgba(255,255,255,0.4)",marginRight:"6px"}}>
                — {form.grade} جماعت
              </span>
            </div>
          )}

          {err&&<div style={{padding:"10px 14px",borderRadius:"8px",marginBottom:"12px",
            background:"rgba(248,113,113,0.1)",border:"1px solid rgba(248,113,113,0.2)",
            fontSize:"0.72rem",color:"#f87171",direction:"rtl"}}>⚠️ {err}</div>}

          {/* Buttons */}
          <div style={{display:"flex",gap:"10px",justifyContent:"flex-end"}}>
            <button onClick={onClose}
              style={{padding:"10px 20px",borderRadius:"9px",
                border:"1px solid rgba(255,255,255,0.1)",
                background:"rgba(255,255,255,0.04)",color:"rgba(255,255,255,0.5)",
                fontSize:"0.78rem",cursor:"pointer",fontFamily:"inherit",fontWeight:"600"}}>
              منسوخ
            </button>
            <button onClick={save} disabled={saving}
              style={{padding:"10px 24px",borderRadius:"9px",border:"none",
                background:saving?"rgba(212,175,55,0.3)":G,
                color:saving?"rgba(255,255,255,0.4)":N,
                fontSize:"0.78rem",fontWeight:"800",cursor:"pointer",fontFamily:"inherit",
                transition:"all 0.14s"}}>
              {saving?"محفوظ ہو رہا ہے...":"✓ محفوظ کریں"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
