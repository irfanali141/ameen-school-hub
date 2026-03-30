/* eslint-disable */
import { useState } from "react";

const N = "#0f172a";
const G = "#d4af37";

const SUBJECTS = [
  "قرآن / حفظ","تجوید","اسلامیات","عربی","اردو",
  "انگریزی","ریاضی","سائنس","معاشرتی علوم","کمپیوٹر",
  "درسِ نظامی","فقہ","حدیث","دیگر"
];

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

const OPTION_KEYS = ["A","B","C","D"];
const OPTION_COLORS = { A:"#60a5fa", B:"#4ade80", C:"#f59e0b", D:"#f87171" };

function emptyQuestion(n){
  return { id:Date.now()+n, text:"", options:{ A:"", B:"", C:"", D:"" }, correct:"A", marks:1 };
}

export default function QuizBuilder({ students, onSave, onClose, aiGenerating, onAIGenerate }){
  const grades = [...new Set(students.map(s=>s.grade).filter(Boolean))].sort();

  const [meta, setMeta] = useState({
    title:"", subject:"", grade:"", duration:30, pass_marks:50,
  });
  const [questions, setQuestions] = useState([emptyQuestion(0)]);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [activeQ, setActiveQ] = useState(0);

  const setM = (k,v) => setMeta(f=>({...f,[k]:v}));

  // Question helpers
  const setQ = (idx, k, v) => setQuestions(qs=>qs.map((q,i)=>i===idx?{...q,[k]:v}:q));
  const setOpt = (idx, key, v) => setQuestions(qs=>qs.map((q,i)=>i===idx
    ?{...q,options:{...q.options,[key]:v}}:q));
  const addQ = () => {
    setQuestions(qs=>[...qs, emptyQuestion(qs.length)]);
    setActiveQ(questions.length);
  };
  const removeQ = (idx) => {
    if(questions.length===1) return;
    setQuestions(qs=>qs.filter((_,i)=>i!==idx));
    setActiveQ(Math.max(0,idx-1));
  };
  const duplicateQ = (idx) => {
    const copy = { ...questions[idx], id:Date.now(),
      options:{...questions[idx].options} };
    const next = [...questions];
    next.splice(idx+1,0,copy);
    setQuestions(next);
    setActiveQ(idx+1);
  };

  // Apply AI-generated questions
  const applyAI = (aiQuestions) => {
    if(aiQuestions?.length) setQuestions(aiQuestions);
  };

  const validate = () => {
    if(!meta.title.trim()) return "عنوان درج کریں";
    if(!meta.subject)      return "مضمون منتخب کریں";
    if(!meta.grade)        return "جماعت منتخب کریں";
    for(let i=0;i<questions.length;i++){
      const q = questions[i];
      if(!q.text.trim()) return `سوال ${i+1} خالی ہے`;
      for(const k of OPTION_KEYS){
        if(!q.options[k].trim()) return `سوال ${i+1} — آپشن ${k} خالی ہے`;
      }
    }
    return "";
  };

  const save = async () => {
    const e = validate();
    if(e){ setErr(e); return; }
    setSaving(true); setErr("");
    await onSave({ ...meta, questions,
      total_marks: questions.reduce((s,q)=>s+(q.marks||1),0) });
    setSaving(false);
    onClose();
  };

  const totalMarks = questions.reduce((s,q)=>s+(Number(q.marks)||1),0);
  const q = questions[activeQ];

  return (
    <div style={{position:"fixed",inset:0,zIndex:1000,
      background:"rgba(0,0,0,0.75)",backdropFilter:"blur(6px)",
      display:"flex",alignItems:"stretch",justifyContent:"center",
      padding:"12px",overflow:"hidden"}}>
      <div style={{width:"100%",maxWidth:"860px",display:"flex",flexDirection:"column",
        background:`linear-gradient(160deg,${N} 0%,#0d1f3c 100%)`,
        borderRadius:"18px",border:"1px solid rgba(255,255,255,0.1)",
        overflow:"hidden",maxHeight:"100%"}}>

        {/* ── Header ── */}
        <div style={{padding:"14px 18px",borderBottom:"1px solid rgba(255,255,255,0.07)",
          display:"flex",alignItems:"center",justifyContent:"space-between",direction:"rtl",
          flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
            <div style={{width:"36px",height:"36px",borderRadius:"9px",
              background:`linear-gradient(135deg,${G},#b8960a)`,
              display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:"1.1rem"}}>📝</div>
            <div>
              <div style={{fontSize:"1rem",fontWeight:"800",color:"#f1f5f9"}}>نیا ٹیسٹ بنائیں</div>
              <div style={{fontSize:"0.6rem",color:"rgba(212,175,55,0.6)"}}>
                {questions.length} سوالات • {totalMarks} کل نمبر
              </div>
            </div>
          </div>
          <div style={{display:"flex",gap:"8px",alignItems:"center"}}>
            {/* AI Generate button */}
            <button
              disabled={!meta.subject||!meta.grade||aiGenerating}
              onClick={()=>onAIGenerate(meta,applyAI)}
              title={!meta.subject||!meta.grade?"پہلے مضمون اور جماعت منتخب کریں":"AI سے سوالات بنائیں"}
              style={{padding:"7px 13px",borderRadius:"8px",border:"none",
                background:(!meta.subject||!meta.grade||aiGenerating)
                  ?"rgba(255,255,255,0.05)":"rgba(212,175,55,0.15)",
                color:(!meta.subject||!meta.grade||aiGenerating)
                  ?"rgba(255,255,255,0.25)":G,
                fontSize:"0.68rem",fontWeight:"700",cursor:"pointer",fontFamily:"inherit"}}>
              {aiGenerating?"✨ بن رہا ہے...":"✨ AI سوالات"}
            </button>
            <button onClick={onClose}
              style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",
                borderRadius:"8px",width:"30px",height:"30px",cursor:"pointer",
                color:"rgba(255,255,255,0.5)",display:"flex",
                alignItems:"center",justifyContent:"center",fontSize:"0.9rem"}}>✕</button>
          </div>
        </div>

        <div style={{display:"flex",flex:1,overflow:"hidden"}}>

          {/* ── LEFT: Meta + Q list ── */}
          <div style={{width:"240px",flexShrink:0,display:"flex",flexDirection:"column",
            borderLeft:"1px solid rgba(255,255,255,0.06)",overflow:"hidden"}}>

            {/* Meta fields */}
            <div style={{padding:"14px",borderBottom:"1px solid rgba(255,255,255,0.06)",
              display:"flex",flexDirection:"column",gap:"10px",flexShrink:0}}>
              <div><label style={lbl}>عنوان *</label>
                <input value={meta.title} onChange={e=>setM("title",e.target.value)}
                  placeholder="مثال: فقہ ٹیسٹ نمبر ۱" style={inp}/>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px"}}>
                <div><label style={lbl}>مضمون</label>
                  <select value={meta.subject} onChange={e=>setM("subject",e.target.value)}
                    style={{...inp,padding:"8px 10px",appearance:"none",fontSize:"0.72rem"}}>
                    <option value="">مضمون</option>
                    {SUBJECTS.map(s=><option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div><label style={lbl}>جماعت</label>
                  <select value={meta.grade} onChange={e=>setM("grade",e.target.value)}
                    style={{...inp,padding:"8px 10px",appearance:"none",fontSize:"0.72rem"}}>
                    <option value="">جماعت</option>
                    {grades.map(g=><option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px"}}>
                <div><label style={lbl}>مدت (منٹ)</label>
                  <input type="number" min={5} max={180} value={meta.duration}
                    onChange={e=>setM("duration",e.target.value)}
                    style={{...inp,direction:"ltr",padding:"8px 10px"}}/>
                </div>
                <div><label style={lbl}>پاس نمبر %</label>
                  <input type="number" min={1} max={100} value={meta.pass_marks}
                    onChange={e=>setM("pass_marks",e.target.value)}
                    style={{...inp,direction:"ltr",padding:"8px 10px"}}/>
                </div>
              </div>
            </div>

            {/* Question list */}
            <div style={{flex:1,overflowY:"auto",padding:"8px"}}>
              <div style={{fontSize:"0.62rem",color:"rgba(255,255,255,0.3)",
                padding:"4px 6px",marginBottom:"4px",direction:"rtl"}}>سوالات</div>
              {questions.map((q,i)=>(
                <div key={q.id} onClick={()=>setActiveQ(i)}
                  style={{padding:"8px 10px",borderRadius:"8px",cursor:"pointer",
                    marginBottom:"3px",direction:"rtl",
                    background:activeQ===i?"rgba(212,175,55,0.14)":"rgba(255,255,255,0.03)",
                    border:`1px solid ${activeQ===i?"rgba(212,175,55,0.3)":"rgba(255,255,255,0.05)"}`,
                    borderRight:`3px solid ${activeQ===i?G:"transparent"}`}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span style={{fontSize:"0.72rem",fontWeight:"700",
                      color:activeQ===i?G:"rgba(255,255,255,0.6)"}}>
                      سوال {i+1}
                    </span>
                    <span style={{fontSize:"0.58rem",color:"rgba(255,255,255,0.25)"}}>
                      {q.marks||1} نمبر
                    </span>
                  </div>
                  <div style={{fontSize:"0.6rem",color:"rgba(255,255,255,0.3)",marginTop:"2px",
                    overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                    {q.text||"(خالی)"}
                  </div>
                </div>
              ))}
              <button onClick={addQ}
                style={{width:"100%",padding:"8px",borderRadius:"8px",border:"none",
                  background:"rgba(96,165,250,0.08)",color:"#60a5fa",
                  fontSize:"0.68rem",fontWeight:"700",cursor:"pointer",
                  fontFamily:"inherit",marginTop:"4px",direction:"rtl"}}>
                + سوال شامل کریں
              </button>
            </div>
          </div>

          {/* ── RIGHT: Question editor ── */}
          <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
            <div style={{flex:1,overflowY:"auto",padding:"16px"}}>

              {/* Question header */}
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
                marginBottom:"14px",direction:"rtl"}}>
                <span style={{fontSize:"0.85rem",fontWeight:"700",color:G}}>
                  سوال {activeQ+1} / {questions.length}
                </span>
                <div style={{display:"flex",gap:"6px"}}>
                  <button onClick={()=>duplicateQ(activeQ)}
                    style={{padding:"5px 10px",borderRadius:"7px",border:"none",
                      background:"rgba(96,165,250,0.1)",color:"#60a5fa",
                      fontSize:"0.62rem",cursor:"pointer",fontFamily:"inherit",fontWeight:"700"}}>
                    کاپی
                  </button>
                  <button onClick={()=>removeQ(activeQ)} disabled={questions.length===1}
                    style={{padding:"5px 10px",borderRadius:"7px",border:"none",
                      background:"rgba(248,113,113,0.1)",color:"#f87171",
                      fontSize:"0.62rem",cursor:"pointer",fontFamily:"inherit",fontWeight:"700",
                      opacity:questions.length===1?0.3:1}}>
                    حذف
                  </button>
                </div>
              </div>

              {/* Question text */}
              <div style={{marginBottom:"14px"}}>
                <label style={lbl}>سوال *</label>
                <textarea value={q.text} onChange={e=>setQ(activeQ,"text",e.target.value)}
                  placeholder="سوال یہاں لکھیں..."
                  rows={3}
                  style={{...inp,resize:"none",lineHeight:"1.6"}}/>
              </div>

              {/* Options */}
              <div style={{marginBottom:"14px"}}>
                <label style={lbl}>آپشنز * (درست جواب منتخب کریں)</label>
                <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
                  {OPTION_KEYS.map(key=>{
                    const isCorrect = q.correct===key;
                    const col = OPTION_COLORS[key];
                    return (
                      <div key={key} style={{display:"flex",alignItems:"center",gap:"8px"}}>
                        {/* Correct answer selector */}
                        <button onClick={()=>setQ(activeQ,"correct",key)}
                          style={{width:"32px",height:"32px",borderRadius:"50%",border:"none",
                            flexShrink:0,cursor:"pointer",fontWeight:"900",fontSize:"0.72rem",
                            background:isCorrect?col:`${col}18`,
                            color:isCorrect?"#0f172a":col,
                            transition:"all 0.13s",
                            boxShadow:isCorrect?`0 0 0 3px ${col}50`:"none"}}>
                          {key}
                        </button>
                        <input value={q.options[key]}
                          onChange={e=>setOpt(activeQ,key,e.target.value)}
                          placeholder={`آپشن ${key}`}
                          style={{...inp,borderColor:isCorrect?`${col}50`:"rgba(255,255,255,0.12)",
                            background:isCorrect?`${col}10`:"rgba(255,255,255,0.06)"}}/>
                        {isCorrect&&<span style={{color:col,fontSize:"0.8rem",flexShrink:0}}>✓</span>}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Marks */}
              <div style={{maxWidth:"140px"}}>
                <label style={lbl}>اس سوال کے نمبر</label>
                <input type="number" min={1} max={20} value={q.marks||1}
                  onChange={e=>setQ(activeQ,"marks",Number(e.target.value))}
                  style={{...inp,direction:"ltr"}}/>
              </div>

              {/* Navigation arrows */}
              <div style={{display:"flex",gap:"8px",marginTop:"16px",direction:"rtl"}}>
                <button onClick={()=>setActiveQ(i=>Math.max(0,i-1))} disabled={activeQ===0}
                  style={{padding:"7px 16px",borderRadius:"8px",border:"none",
                    background:"rgba(255,255,255,0.05)",color:"rgba(255,255,255,0.5)",
                    fontSize:"0.72rem",cursor:"pointer",fontFamily:"inherit",
                    opacity:activeQ===0?0.3:1}}>← پچھلا</button>
                <button onClick={()=>setActiveQ(i=>Math.min(questions.length-1,i+1))}
                  disabled={activeQ===questions.length-1}
                  style={{padding:"7px 16px",borderRadius:"8px",border:"none",
                    background:"rgba(255,255,255,0.05)",color:"rgba(255,255,255,0.5)",
                    fontSize:"0.72rem",cursor:"pointer",fontFamily:"inherit",
                    opacity:activeQ===questions.length-1?0.3:1}}>اگلا →</button>
              </div>
            </div>

            {/* ── Footer: error + save ── */}
            <div style={{padding:"12px 16px",borderTop:"1px solid rgba(255,255,255,0.06)",
              flexShrink:0,direction:"rtl"}}>
              {err&&<div style={{fontSize:"0.7rem",color:"#f87171",marginBottom:"8px",
                padding:"7px 11px",borderRadius:"7px",
                background:"rgba(248,113,113,0.08)"}}>⚠️ {err}</div>}
              <div style={{display:"flex",gap:"8px",justifyContent:"flex-end"}}>
                <button onClick={onClose}
                  style={{padding:"9px 18px",borderRadius:"9px",
                    border:"1px solid rgba(255,255,255,0.1)",
                    background:"rgba(255,255,255,0.04)",color:"rgba(255,255,255,0.5)",
                    fontSize:"0.75rem",cursor:"pointer",fontFamily:"inherit"}}>
                  منسوخ
                </button>
                <button onClick={save} disabled={saving}
                  style={{padding:"9px 22px",borderRadius:"9px",border:"none",
                    background:saving?"rgba(212,175,55,0.3)":G,
                    color:saving?"rgba(255,255,255,0.4)":N,
                    fontSize:"0.75rem",fontWeight:"800",cursor:"pointer",fontFamily:"inherit"}}>
                  {saving?"محفوظ ہو رہا ہے...":"✓ ٹیسٹ محفوظ کریں"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
