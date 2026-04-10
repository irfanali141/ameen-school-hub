/* eslint-disable */
import { useState, useRef, useEffect } from "react";
import { supabase } from "../../supabase";

const N  = "#0f172a";
const G  = "#d4af37";

const SUBJECTS = [
  "قرآن / حفظ","تجوید","اسلامیات","عربی","اردو",
  "انگریزی","ریاضی","سائنس","معاشرتی علوم","کمپیوٹر",
  "درسِ نظامی","فقہ","حدیث","دیگر"
];

const TABS = [
  { id:"lesson_plan",        icon:"📅", label:"سبق منصوبہ",    color:"#60a5fa",  desc:"AI کی مدد سے مکمل سبق منصوبہ بنائیں" },
  { id:"mistake_analysis",   icon:"📖", label:"حفظ تجزیہ",     color:"#f59e0b",  desc:"حفظ ٹریکر سے غلطیاں لائیں اور AI تجزیہ کریں" },
  { id:"parent_report",      icon:"👪", label:"والدین رپورٹ",   color:"#4ade80",  desc:"والدین کے لیے پروفیشنل اردو رپورٹ" },
  { id:"homework_suggestion",icon:"📝", label:"ہوم ورک تجاویز", color:"#a78bfa",  desc:"مضمون کے مطابق تخلیقی ہوم ورک آئیڈیاز" },
  { id:"class_summary",      icon:"📊", label:"جماعت خلاصہ",   color:"#38bdf8",  desc:"جماعت کی مجموعی صورتحال اور حکمت عملی" },
  { id:"behavior_report",    icon:"🏥", label:"رویہ رپورٹ",     color:"#f87171",  desc:"طالب علم کے رویے کا تجزیہ اور تربیتی منصوبہ" },
  { id:"exam_questions",     icon:"📋", label:"امتحانی سوالات", color:"#fb923c",  desc:"کسی بھی مضمون کے امتحانی سوالات تیار کریں" },
  { id:"tarbiyah_plan",      icon:"🌟", label:"تربیت پلان",     color:"#a3e635",  desc:"ماہانہ تربیتی منصوبہ اسلامی اصولوں کے مطابق" },
  { id:"parent_message",     icon:"💬", label:"والدین پیغام",   color:"#34d399",  desc:"WhatsApp/SMS کے لیے مختصر والدین پیغام" },
  { id:"house_speech",       icon:"🏆", label:"تقریر",          color:"#c084fc",  desc:"کسی بھی موضوع پر عمدہ اردو تقریر" },
  { id:"certificate_text",   icon:"📜", label:"سرٹیفکیٹ",       color:"#fbbf24",  desc:"انعامی سرٹیفکیٹ کا رسمی متن" },
  { id:"newsletter",         icon:"📆", label:"نیوز لیٹر",      color:"#22d3ee",  desc:"ماہانہ اسکول نیوز لیٹر اردو میں" },
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
const row = { marginBottom:"14px" };

// ── Hifz Analysis Form (with Supabase integration) ───────────────────────────
function HifzForm({ students, onGenerate }) {
  const [selectedStudent, setSelectedStudent] = useState("");
  const [ma, setMa] = useState({ studentName:"", paraNum:"", mistakeTypes:[], mistakesCount:0, quality:"" });
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [hifzSummary, setHifzSummary] = useState(null);

  const MISTAKE_LABELS = ["وقف","مخارج","مد","غنہ","ادغام/اخفاء/اظہار","ترتیب"];
  const toggleMistake = (m) => setMa(f=>({
    ...f, mistakeTypes: f.mistakeTypes.includes(m)
      ? f.mistakeTypes.filter(x=>x!==m)
      : [...f.mistakeTypes, m]
  }));

  const fetchHifzData = async () => {
    if (!selectedStudent) return;
    setLoading(true);
    setFetched(false);

    const student = students.find(s => s.id === selectedStudent);

    // Get last 7 days of hifz logs for this student
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: logs } = await supabase
      .from("hifz_daily_log")
      .select("log_type, surah_name, ayat_from, ayat_to, manzil_para, quality, mistakes_count, ustad_notes, log_date")
      .eq("student_id", selectedStudent)
      .gte("log_date", sevenDaysAgo.toISOString().split("T")[0])
      .order("log_date", { ascending: false });

    if (logs && logs.length > 0) {
      // Aggregate mistake types from quality patterns
      const totalMistakes = logs.reduce((s, l) => s + (parseInt(l.mistakes_count) || 0), 0);
      const avgMistakes = Math.round(totalMistakes / logs.length);
      const latestLog = logs[0];
      const para = latestLog.manzil_para || "1";

      // Determine mistake types from quality
      const types = [];
      logs.forEach(l => {
        if ((l.mistakes_count || 0) > 5) types.push("ترتیب");
        if (l.quality === "poor" || l.quality === "weak") {
          types.push("مخارج");
          types.push("وقف");
        }
        if (l.ustad_notes) {
          if (l.ustad_notes.includes("مد")) types.push("مد");
          if (l.ustad_notes.includes("غن")) types.push("غنہ");
          if (l.ustad_notes.includes("ادغام") || l.ustad_notes.includes("اخفاء")) types.push("ادغام/اخفاء/اظہار");
        }
      });
      const uniqueTypes = [...new Set(types)].slice(0, 4);

      setHifzSummary({
        days: logs.length,
        totalMistakes,
        avgMistakes,
        latestSurah: latestLog.surah_name,
        quality: latestLog.quality,
        para,
      });

      setMa({
        studentName: student?.name || "",
        paraNum: para,
        mistakeTypes: uniqueTypes.length > 0 ? uniqueTypes : ["مخارج"],
        mistakesCount: avgMistakes,
        quality: latestLog.quality || "",
      });
      setFetched(true);
    } else {
      setMa(f => ({ ...f, studentName: student?.name || "" }));
      setHifzSummary(null);
      setFetched(true);
    }
    setLoading(false);
  };

  return (
    <div>
      {/* Student selector */}
      <div style={row}>
        <label style={lbl}>طالب علم منتخب کریں *</label>
        <select value={selectedStudent}
          onChange={e => { setSelectedStudent(e.target.value); setFetched(false); setHifzSummary(null); }}
          style={{ ...inp, appearance:"none" }}>
          <option value="">— منتخب کریں —</option>
          {students.map(s => (
            <option key={s.id} value={s.id}>{s.name} — {s.grade}</option>
          ))}
        </select>
      </div>

      {/* Fetch button */}
      {selectedStudent && !fetched && (
        <button onClick={fetchHifzData} disabled={loading}
          style={{ width:"100%", padding:"10px", borderRadius:"9px", border:"none",
            background:"rgba(245,158,11,0.15)", color:"#f59e0b",
            cursor: loading ? "wait" : "pointer", fontSize:"0.8rem",
            fontWeight:"700", fontFamily:"inherit", marginBottom:"14px",
            border:"1px solid rgba(245,158,11,0.3)" }}>
          {loading ? "⏳ ڈیٹا لایا جا رہا ہے..." : "📊 حفظ ٹریکر سے ڈیٹا لائیں"}
        </button>
      )}

      {/* Hifz summary card */}
      {hifzSummary && (
        <div style={{ background:"rgba(245,158,11,0.08)", border:"1px solid rgba(245,158,11,0.2)",
          borderRadius:"10px", padding:"12px 14px", marginBottom:"14px", direction:"rtl" }}>
          <div style={{ fontSize:"0.7rem", fontWeight:"700", color:"#f59e0b", marginBottom:"8px" }}>
            📊 گزشتہ {hifzSummary.days} دن کا حفظ ریکارڈ
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"8px" }}>
            {[
              ["کل غلطیاں", hifzSummary.totalMistakes],
              ["اوسط غلطیاں", hifzSummary.avgMistakes],
              ["آخری سورہ", hifzSummary.latestSurah || "-"],
            ].map(([k,v]) => (
              <div key={k} style={{ background:"rgba(0,0,0,0.2)", borderRadius:"7px", padding:"7px 10px", textAlign:"center" }}>
                <div style={{ color:"#f1f5f9", fontWeight:"700", fontSize:"0.8rem" }}>{v}</div>
                <div style={{ color:"rgba(255,255,255,0.4)", fontSize:"0.58rem", marginTop:"2px" }}>{k}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {fetched && !hifzSummary && (
        <div style={{ background:"rgba(248,113,113,0.08)", border:"1px solid rgba(248,113,113,0.2)",
          borderRadius:"9px", padding:"10px 14px", marginBottom:"14px", fontSize:"0.7rem", color:"#f87171" }}>
          ⚠️ اس طالب علم کا گزشتہ 7 دن میں کوئی حفظ ریکارڈ نہیں ملا
        </div>
      )}

      {/* Manual fields */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px", marginBottom:"14px" }}>
        <div><label style={lbl}>طالب علم کا نام *</label>
          <input value={ma.studentName}
            onChange={e => setMa(f=>({...f,studentName:e.target.value}))}
            placeholder="نام درج کریں" style={inp}/>
        </div>
        <div><label style={lbl}>پارہ نمبر *</label>
          <input type="number" min={1} max={30} value={ma.paraNum}
            onChange={e => setMa(f=>({...f,paraNum:e.target.value}))}
            style={{ ...inp, direction:"ltr" }}/>
        </div>
      </div>

      <div style={row}>
        <label style={lbl}>غلطیوں کی قسم * (ایک یا زیادہ)</label>
        <div style={{ display:"flex", flexWrap:"wrap", gap:"7px", direction:"rtl" }}>
          {MISTAKE_LABELS.map(m => (
            <button key={m} onClick={() => toggleMistake(m)}
              style={{ padding:"6px 13px", borderRadius:"20px", border:"none", cursor:"pointer",
                fontFamily:"inherit", fontSize:"0.72rem", fontWeight:"700",
                background: ma.mistakeTypes.includes(m) ? "rgba(245,158,11,0.25)" : "rgba(255,255,255,0.06)",
                color: ma.mistakeTypes.includes(m) ? "#f59e0b" : "rgba(255,255,255,0.45)",
                border:`1px solid ${ma.mistakeTypes.includes(m) ? "rgba(245,158,11,0.4)" : "rgba(255,255,255,0.08)"}` }}>
              {m}
            </button>
          ))}
        </div>
      </div>

      <button onClick={() => onGenerate("mistake_analysis", { ...ma, mistakes: ma.mistakeTypes })}
        disabled={!ma.studentName || !ma.paraNum || !ma.mistakeTypes.length}
        style={{ width:"100%", padding:"12px", borderRadius:"10px", border:"none",
          background: (!ma.studentName || !ma.paraNum || !ma.mistakeTypes.length)
            ? "rgba(212,175,55,0.15)" : `linear-gradient(135deg,${G},#b8960a)`,
          color: (!ma.studentName || !ma.paraNum || !ma.mistakeTypes.length)
            ? "rgba(255,255,255,0.25)" : N,
          fontSize:"0.85rem", fontWeight:"800",
          cursor: (!ma.studentName || !ma.paraNum || !ma.mistakeTypes.length) ? "not-allowed" : "pointer",
          fontFamily:"inherit", marginTop:"4px",
          boxShadow: (!ma.studentName || !ma.paraNum || !ma.mistakeTypes.length)
            ? "none" : "0 4px 16px rgba(212,175,55,0.3)" }}>
        ✨ AI سے تجزیہ کریں
      </button>
    </div>
  );
}

// ── Generic form for other tasks ──────────────────────────────────────────────
function TaskForm({ taskId, students, onGenerate }){
  const grades = [...new Set(students.map(s=>s.grade).filter(Boolean))].sort();

  const [lp, setLp] = useState({ subject:"", grade:"", topic:"", duration:"45", notes:"" });
  const [pr, setPr] = useState({ studentName:"", grade:"", attendance:"", avgResult:"", tarbiyahNote:"", achievement:"", improvement:"" });
  const [hw, setHw] = useState({ subject:"", grade:"", topic:"", difficulty:"درمیانہ" });
  const [cs, setCs] = useState({ grade:"", subject:"", avgMarks:"", weakCount:"", hwMissing:"" });
  const [br, setBr] = useState({ studentName:"", grade:"", issue:"", frequency:"کبھی کبھار", positive:"" });
  const [eq, setEq] = useState({ subject:"", grade:"", topic:"", count:"10", qtype:"مختلف اقسام" });
  const [tp, setTp] = useState({ studentName:"", grade:"", goal:"", duration:"ایک ماہ" });
  const [pm, setPm] = useState({ studentName:"", msgType:"عام اطلاع", topic:"", tone:"گرمجوش" });
  const [hs, setHs] = useState({ topic:"", grade:"", duration:"3", occasion:"عام اسمبلی" });
  const [ct, setCt] = useState({ studentName:"", achievement:"", occasion:"سالانہ تقریبِ انعامات", date:"2025" });
  const [nl, setNl] = useState({ month:"", events:"", achievements:"", upcoming:"" });

  if(taskId==="mistake_analysis") return (
    <HifzForm students={students} onGenerate={onGenerate}/>
  );

  if(taskId==="lesson_plan") return (
    <div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"14px"}}>
        <div><label style={lbl}>مضمون *</label>
          <select value={lp.subject} onChange={e=>setLp(f=>({...f,subject:e.target.value}))} style={{...inp,appearance:"none"}}>
            <option value="">— منتخب کریں —</option>
            {SUBJECTS.map(s=><option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div><label style={lbl}>جماعت *</label>
          <select value={lp.grade} onChange={e=>setLp(f=>({...f,grade:e.target.value}))} style={{...inp,appearance:"none"}}>
            <option value="">— منتخب کریں —</option>
            {grades.map(g=><option key={g} value={g}>{g}</option>)}
          </select>
        </div>
      </div>
      <div style={row}><label style={lbl}>موضوع *</label>
        <input value={lp.topic} onChange={e=>setLp(f=>({...f,topic:e.target.value}))} placeholder="مثال: جمع، تقسیم، نماز کی اہمیت..." style={inp}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"14px"}}>
        <div><label style={lbl}>مدت (منٹ)</label>
          <input type="number" value={lp.duration} onChange={e=>setLp(f=>({...f,duration:e.target.value}))} style={{...inp,direction:"ltr"}}/>
        </div>
        <div><label style={lbl}>خصوصی نوٹ (اختیاری)</label>
          <input value={lp.notes} onChange={e=>setLp(f=>({...f,notes:e.target.value}))} placeholder="کوئی خاص ہدایت..." style={inp}/>
        </div>
      </div>
      <GenBtn disabled={!lp.subject||!lp.grade||!lp.topic} onClick={()=>onGenerate("lesson_plan",lp)}/>
    </div>
  );

  if(taskId==="parent_report") return (
    <div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"14px"}}>
        <div><label style={lbl}>طالب علم کا نام *</label>
          <input value={pr.studentName} onChange={e=>setPr(f=>({...f,studentName:e.target.value}))} placeholder="نام" style={inp}/>
        </div>
        <div><label style={lbl}>جماعت *</label>
          <select value={pr.grade} onChange={e=>setPr(f=>({...f,grade:e.target.value}))} style={{...inp,appearance:"none"}}>
            <option value="">— منتخب کریں —</option>
            {grades.map(g=><option key={g} value={g}>{g}</option>)}
          </select>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"14px"}}>
        <div><label style={lbl}>حاضری % *</label>
          <input type="number" min={0} max={100} value={pr.attendance} onChange={e=>setPr(f=>({...f,attendance:e.target.value}))} style={{...inp,direction:"ltr"}}/>
        </div>
        <div><label style={lbl}>اوسط نتیجہ % *</label>
          <input type="number" min={0} max={100} value={pr.avgResult} onChange={e=>setPr(f=>({...f,avgResult:e.target.value}))} style={{...inp,direction:"ltr"}}/>
        </div>
      </div>
      <div style={row}><label style={lbl}>کامیابی (اختیاری)</label>
        <input value={pr.achievement} onChange={e=>setPr(f=>({...f,achievement:e.target.value}))} placeholder="مثال: تقریری مقابلہ میں انعام..." style={inp}/>
      </div>
      <div style={row}><label style={lbl}>بہتری کا شعبہ (اختیاری)</label>
        <input value={pr.improvement} onChange={e=>setPr(f=>({...f,improvement:e.target.value}))} placeholder="مثال: حاضری، ہوم ورک..." style={inp}/>
      </div>
      <GenBtn disabled={!pr.studentName||!pr.grade||!pr.attendance||!pr.avgResult}
        onClick={()=>onGenerate("parent_report",pr)}/>
    </div>
  );

  if(taskId==="homework_suggestion") return (
    <div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"14px"}}>
        <div><label style={lbl}>مضمون *</label>
          <select value={hw.subject} onChange={e=>setHw(f=>({...f,subject:e.target.value}))} style={{...inp,appearance:"none"}}>
            <option value="">— منتخب کریں —</option>
            {SUBJECTS.map(s=><option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div><label style={lbl}>جماعت *</label>
          <select value={hw.grade} onChange={e=>setHw(f=>({...f,grade:e.target.value}))} style={{...inp,appearance:"none"}}>
            <option value="">— منتخب کریں —</option>
            {grades.map(g=><option key={g} value={g}>{g}</option>)}
          </select>
        </div>
      </div>
      <div style={row}><label style={lbl}>حالیہ موضوع *</label>
        <input value={hw.topic} onChange={e=>setHw(f=>({...f,topic:e.target.value}))} placeholder="مثال: کسر، نماز کے ارکان..." style={inp}/>
      </div>
      <div style={row}><label style={lbl}>مشکل درجہ</label>
        <div style={{display:"flex",gap:"7px",direction:"rtl"}}>
          {["آسان","درمیانہ","مشکل"].map(d=>(
            <button key={d} onClick={()=>setHw(f=>({...f,difficulty:d}))}
              style={{flex:1,padding:"8px",borderRadius:"8px",border:"none",cursor:"pointer",
                fontFamily:"inherit",fontSize:"0.72rem",fontWeight:"700",
                background:hw.difficulty===d?"rgba(167,139,250,0.2)":"rgba(255,255,255,0.04)",
                color:hw.difficulty===d?"#a78bfa":"rgba(255,255,255,0.4)",
                border:`1px solid ${hw.difficulty===d?"rgba(167,139,250,0.35)":"rgba(255,255,255,0.07)"}`}}>
              {d}
            </button>
          ))}
        </div>
      </div>
      <GenBtn disabled={!hw.subject||!hw.grade||!hw.topic} onClick={()=>onGenerate("homework_suggestion",hw)}/>
    </div>
  );

  if(taskId==="class_summary") return (
    <div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"14px"}}>
        <div><label style={lbl}>جماعت *</label>
          <select value={cs.grade} onChange={e=>setCs(f=>({...f,grade:e.target.value}))} style={{...inp,appearance:"none"}}>
            <option value="">— منتخب کریں —</option>
            {grades.map(g=><option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div><label style={lbl}>مضمون *</label>
          <select value={cs.subject} onChange={e=>setCs(f=>({...f,subject:e.target.value}))} style={{...inp,appearance:"none"}}>
            <option value="">— منتخب کریں —</option>
            {SUBJECTS.map(s=><option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"10px",marginBottom:"14px"}}>
        <div><label style={lbl}>اوسط نمبر %</label>
          <input type="number" value={cs.avgMarks} onChange={e=>setCs(f=>({...f,avgMarks:e.target.value}))} style={{...inp,direction:"ltr"}} placeholder="75"/>
        </div>
        <div><label style={lbl}>کمزور طلبہ</label>
          <input type="number" value={cs.weakCount} onChange={e=>setCs(f=>({...f,weakCount:e.target.value}))} style={{...inp,direction:"ltr"}} placeholder="5"/>
        </div>
        <div><label style={lbl}>ہوم ورک غیر حاضر</label>
          <input type="number" value={cs.hwMissing} onChange={e=>setCs(f=>({...f,hwMissing:e.target.value}))} style={{...inp,direction:"ltr"}} placeholder="3"/>
        </div>
      </div>
      <GenBtn disabled={!cs.grade||!cs.subject} onClick={()=>onGenerate("class_summary",cs)}/>
    </div>
  );

  if(taskId==="behavior_report") return (
    <div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"14px"}}>
        <div><label style={lbl}>طالب علم کا نام *</label>
          <input value={br.studentName} onChange={e=>setBr(f=>({...f,studentName:e.target.value}))} placeholder="نام" style={inp}/>
        </div>
        <div><label style={lbl}>جماعت *</label>
          <select value={br.grade} onChange={e=>setBr(f=>({...f,grade:e.target.value}))} style={{...inp,appearance:"none"}}>
            <option value="">— منتخب کریں —</option>
            {grades.map(g=><option key={g} value={g}>{g}</option>)}
          </select>
        </div>
      </div>
      <div style={row}><label style={lbl}>مسئلہ / رویہ *</label>
        <input value={br.issue} onChange={e=>setBr(f=>({...f,issue:e.target.value}))} placeholder="مثال: کلاس میں شور، ہوم ورک نہ کرنا..." style={inp}/>
      </div>
      <div style={row}><label style={lbl}>تکرار</label>
        <div style={{display:"flex",gap:"7px"}}>
          {["روزانہ","ہفتہ وار","کبھی کبھار"].map(d=>(
            <button key={d} onClick={()=>setBr(f=>({...f,frequency:d}))}
              style={{flex:1,padding:"8px",borderRadius:"8px",border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:"0.72rem",fontWeight:"700",
                background:br.frequency===d?"rgba(248,113,113,0.2)":"rgba(255,255,255,0.04)",
                color:br.frequency===d?"#f87171":"rgba(255,255,255,0.4)",
                border:`1px solid ${br.frequency===d?"rgba(248,113,113,0.35)":"rgba(255,255,255,0.07)"}`}}>
              {d}
            </button>
          ))}
        </div>
      </div>
      <div style={row}><label style={lbl}>مثبت پہلو (اختیاری)</label>
        <input value={br.positive} onChange={e=>setBr(f=>({...f,positive:e.target.value}))} placeholder="مثال: ذہین، مددگار..." style={inp}/>
      </div>
      <GenBtn disabled={!br.studentName||!br.grade||!br.issue} onClick={()=>onGenerate("behavior_report",br)}/>
    </div>
  );

  if(taskId==="exam_questions") return (
    <div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"14px"}}>
        <div><label style={lbl}>مضمون *</label>
          <select value={eq.subject} onChange={e=>setEq(f=>({...f,subject:e.target.value}))} style={{...inp,appearance:"none"}}>
            <option value="">— منتخب کریں —</option>
            {SUBJECTS.map(s=><option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div><label style={lbl}>جماعت *</label>
          <select value={eq.grade} onChange={e=>setEq(f=>({...f,grade:e.target.value}))} style={{...inp,appearance:"none"}}>
            <option value="">— منتخب کریں —</option>
            {grades.map(g=><option key={g} value={g}>{g}</option>)}
          </select>
        </div>
      </div>
      <div style={row}><label style={lbl}>موضوع *</label>
        <input value={eq.topic} onChange={e=>setEq(f=>({...f,topic:e.target.value}))} placeholder="مثال: نماز کے ارکان، کسر..." style={inp}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"14px"}}>
        <div><label style={lbl}>سوالات کی تعداد</label>
          <input type="number" value={eq.count} onChange={e=>setEq(f=>({...f,count:e.target.value}))} style={{...inp,direction:"ltr"}} min="5" max="30"/>
        </div>
        <div><label style={lbl}>قسم</label>
          <select value={eq.qtype} onChange={e=>setEq(f=>({...f,qtype:e.target.value}))} style={{...inp,appearance:"none"}}>
            {["مختلف اقسام","مختصر جوابی","طویل جوابی","MCQ","خالی جگہ"].map(q=><option key={q} value={q}>{q}</option>)}
          </select>
        </div>
      </div>
      <GenBtn disabled={!eq.subject||!eq.grade||!eq.topic} onClick={()=>onGenerate("exam_questions",eq)}/>
    </div>
  );

  if(taskId==="tarbiyah_plan") return (
    <div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"14px"}}>
        <div><label style={lbl}>طالب علم (اختیاری)</label>
          <input value={tp.studentName} onChange={e=>setTp(f=>({...f,studentName:e.target.value}))} placeholder="نام یا 'پوری جماعت'" style={inp}/>
        </div>
        <div><label style={lbl}>جماعت *</label>
          <select value={tp.grade} onChange={e=>setTp(f=>({...f,grade:e.target.value}))} style={{...inp,appearance:"none"}}>
            <option value="">— منتخب کریں —</option>
            {grades.map(g=><option key={g} value={g}>{g}</option>)}
          </select>
        </div>
      </div>
      <div style={row}><label style={lbl}>تربیتی ہدف *</label>
        <input value={tp.goal} onChange={e=>setTp(f=>({...f,goal:e.target.value}))} placeholder="مثال: نماز کی پابندی، سچ بولنا، ادب..." style={inp}/>
      </div>
      <div style={row}><label style={lbl}>مدت</label>
        <div style={{display:"flex",gap:"7px"}}>
          {["ایک ہفتہ","ایک ماہ","ایک سہ ماہی"].map(d=>(
            <button key={d} onClick={()=>setTp(f=>({...f,duration:d}))}
              style={{flex:1,padding:"8px",borderRadius:"8px",border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:"0.68rem",fontWeight:"700",
                background:tp.duration===d?"rgba(163,230,53,0.2)":"rgba(255,255,255,0.04)",
                color:tp.duration===d?"#a3e635":"rgba(255,255,255,0.4)",
                border:`1px solid ${tp.duration===d?"rgba(163,230,53,0.35)":"rgba(255,255,255,0.07)"}`}}>
              {d}
            </button>
          ))}
        </div>
      </div>
      <GenBtn disabled={!tp.grade||!tp.goal} onClick={()=>onGenerate("tarbiyah_plan",tp)}/>
    </div>
  );

  if(taskId==="parent_message") return (
    <div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"14px"}}>
        <div><label style={lbl}>طالب علم کا نام *</label>
          <input value={pm.studentName} onChange={e=>setPm(f=>({...f,studentName:e.target.value}))} placeholder="نام" style={inp}/>
        </div>
        <div><label style={lbl}>پیغام کی نوعیت</label>
          <select value={pm.msgType} onChange={e=>setPm(f=>({...f,msgType:e.target.value}))} style={{...inp,appearance:"none"}}>
            {["عام اطلاع","فیس یاددہانی","غیر حاضری","تعریفی پیغام","میٹنگ دعوت","امتحان اطلاع"].map(m=><option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>
      <div style={row}><label style={lbl}>پیغام کا موضوع *</label>
        <input value={pm.topic} onChange={e=>setPm(f=>({...f,topic:e.target.value}))} placeholder="مثال: کل امتحان ہے، فیس جمع کرائیں..." style={inp}/>
      </div>
      <GenBtn disabled={!pm.studentName||!pm.topic} onClick={()=>onGenerate("parent_message",pm)}/>
    </div>
  );

  if(taskId==="house_speech") return (
    <div>
      <div style={row}><label style={lbl}>تقریر کا موضوع *</label>
        <input value={hs.topic} onChange={e=>setHs(f=>({...f,topic:e.target.value}))} placeholder="مثال: یومِ آزادی، ایمانداری، وقت کی اہمیت..." style={inp}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"10px",marginBottom:"14px"}}>
        <div><label style={lbl}>جماعت/عمر</label>
          <select value={hs.grade} onChange={e=>setHs(f=>({...f,grade:e.target.value}))} style={{...inp,appearance:"none"}}>
            <option value="">عام</option>
            {grades.map(g=><option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div><label style={lbl}>مدت (منٹ)</label>
          <input type="number" value={hs.duration} onChange={e=>setHs(f=>({...f,duration:e.target.value}))} style={{...inp,direction:"ltr"}} min="1" max="15"/>
        </div>
        <div><label style={lbl}>مناسبت</label>
          <select value={hs.occasion} onChange={e=>setHs(f=>({...f,occasion:e.target.value}))} style={{...inp,appearance:"none"}}>
            {["عام اسمبلی","یومِ آزادی","عیدالفطر","میلادالنبی ﷺ","سالانہ جلسہ","دیگر"].map(o=><option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      </div>
      <GenBtn disabled={!hs.topic} onClick={()=>onGenerate("house_speech",hs)}/>
    </div>
  );

  if(taskId==="certificate_text") return (
    <div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"14px"}}>
        <div><label style={lbl}>طالب علم کا نام *</label>
          <input value={ct.studentName} onChange={e=>setCt(f=>({...f,studentName:e.target.value}))} placeholder="نام" style={inp}/>
        </div>
        <div><label style={lbl}>کامیابی *</label>
          <input value={ct.achievement} onChange={e=>setCt(f=>({...f,achievement:e.target.value}))} placeholder="مثال: اول انعام، حفظ مکمل..." style={inp}/>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"14px"}}>
        <div><label style={lbl}>مناسبت</label>
          <input value={ct.occasion} onChange={e=>setCt(f=>({...f,occasion:e.target.value}))} placeholder="سالانہ تقریبِ انعامات" style={inp}/>
        </div>
        <div><label style={lbl}>سال</label>
          <input value={ct.date} onChange={e=>setCt(f=>({...f,date:e.target.value}))} placeholder="2025" style={{...inp,direction:"ltr"}}/>
        </div>
      </div>
      <GenBtn disabled={!ct.studentName||!ct.achievement} onClick={()=>onGenerate("certificate_text",ct)}/>
    </div>
  );

  if(taskId==="newsletter") return (
    <div>
      <div style={row}><label style={lbl}>مہینہ *</label>
        <input value={nl.month} onChange={e=>setNl(f=>({...f,month:e.target.value}))} placeholder="مثال: جنوری 2025" style={inp}/>
      </div>
      <div style={row}><label style={lbl}>اس ماہ کے اہم واقعات</label>
        <input value={nl.events} onChange={e=>setNl(f=>({...f,events:e.target.value}))} placeholder="مثال: سائنس فیئر، اسپورٹس ڈے..." style={inp}/>
      </div>
      <div style={row}><label style={lbl}>کامیابیاں</label>
        <input value={nl.achievements} onChange={e=>setNl(f=>({...f,achievements:e.target.value}))} placeholder="مثال: احمد نے ضلعی مقابلہ جیتا..." style={inp}/>
      </div>
      <div style={row}><label style={lbl}>آئندہ ماہ کے پروگرام</label>
        <input value={nl.upcoming} onChange={e=>setNl(f=>({...f,upcoming:e.target.value}))} placeholder="مثال: امتحانات، والدین کا دن..." style={inp}/>
      </div>
      <GenBtn disabled={!nl.month} onClick={()=>onGenerate("newsletter",nl)}/>
    </div>
  );

  return null;
}

function GenBtn({ onClick, disabled }){
  return (
    <button onClick={onClick} disabled={disabled}
      style={{width:"100%",padding:"12px",borderRadius:"10px",border:"none",
        background:disabled?"rgba(212,175,55,0.15)":`linear-gradient(135deg,${G},#b8960a)`,
        color:disabled?"rgba(255,255,255,0.25)":N,
        fontSize:"0.85rem",fontWeight:"800",cursor:disabled?"not-allowed":"pointer",
        fontFamily:"inherit",marginTop:"4px",
        boxShadow:disabled?"none":"0 4px 16px rgba(212,175,55,0.3)",
        transition:"all 0.14s",direction:"rtl",display:"flex",
        alignItems:"center",justifyContent:"center",gap:"8px"}}>
      <span style={{fontSize:"1rem"}}>✨</span>
      AI سے تیار کریں
    </button>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function AIAssistant({ students, userRole }){
  const [tab,       setTab]      = useState("lesson_plan");
  const [output,    setOutput]   = useState("");
  const [loading,   setLoading]  = useState(false);
  const [copied,    setCopied]   = useState(false);
  const [error,     setError]    = useState("");
  const [history,   setHistory]  = useState([]);
  const [showHist,  setShowHist] = useState(false);
  const [sending,   setSending]  = useState(false);
  const [sent,      setSent]     = useState(false);
  // Store last generated context for "send to parent"
  const [lastCtx,   setLastCtx]  = useState(null); // { studentName, task }
  const outputRef = useRef(null);

  const activeTab = TABS.find(t=>t.id===tab);

  useEffect(()=>{
    if(outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight;
  },[output]);

  const generate = async (task, data) => {
    setLoading(true);
    setOutput("");
    setError("");
    setSent(false);
    setLastCtx({ studentName: data.studentName || "", task });

    try {
      const resp = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task, data }),
      });

      if(!resp.ok){
        const err = await resp.json().catch(()=>({}));
        throw new Error(err.error || `HTTP ${resp.status}`);
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let full = "";

      while(true){
        const { done, value } = await reader.read();
        if(done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");
        for(const line of lines){
          if(!line.startsWith("data: ")) continue;
          try {
            const json = JSON.parse(line.slice(6));
            if(json.text){ full += json.text; setOutput(full); }
            if(json.error) throw new Error(json.error);
            if(json.done) break;
          } catch(e){}
        }
      }

      if(full){
        const label = TABS.find(t=>t.id===task)?.label || task;
        setHistory(h=>[{ task, label, output:full, ts:new Date().toLocaleTimeString("ur") }, ...h.slice(0,9)]);
      }
    } catch(e){
      setError(e.message);
    }
    setLoading(false);
  };

  // ── Send to Parent Messages ─────────────────────────────────────────────────
  const sendToParent = async () => {
    if (!output || !lastCtx?.studentName) return;
    setSending(true);

    // Find student
    const student = students.find(s =>
      s.name === lastCtx.studentName || s.name?.includes(lastCtx.studentName)
    );

    const taskLabel = TABS.find(t => t.id === lastCtx.task)?.label || "AI رپورٹ";

    await supabase.from("parent_messages").insert({
      student_id:   student?.id || null,
      student_name: lastCtx.studentName,
      text:         output,
      msg_type:     "academic",
      subject:      `📖 AI ${taskLabel} — ${lastCtx.studentName}`,
      sender:       "ustad",
      created_at:   new Date().toISOString(),
      is_read:      false,
    });

    setSending(false);
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output).then(()=>{
      setCopied(true);
      setTimeout(()=>setCopied(false), 2000);
    });
  };

  const printOutput = () => {
    const w = window.open("","_blank");
    w.document.write(`
      <html dir="rtl"><head><meta charset="UTF-8">
      <style>body{font-family:'Noto Nastaliq Urdu',serif;direction:rtl;padding:30px;font-size:14px;line-height:2;}
      pre{white-space:pre-wrap;}</style></head>
      <body><pre>${output}</pre></body></html>`);
    w.document.close();
    w.print();
  };

  return (
    <div style={{minHeight:"100vh",
      background:`linear-gradient(160deg,${N} 0%,#0d1f3c 60%,${N} 100%)`,
      fontFamily:"'Public Sans',sans-serif",direction:"rtl"}}>

      <style>{`
        .ai-tab:hover{background:rgba(255,255,255,0.07)!important;}
        .ai-copy-btn:hover{background:rgba(255,255,255,0.1)!important;}
      `}</style>

      {/* Header */}
      <div style={{padding:"18px 24px",borderBottom:"1px solid rgba(255,255,255,0.06)",
        display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"10px"}}>
        <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
          <div style={{width:"46px",height:"46px",borderRadius:"12px",
            background:`linear-gradient(135deg,${G},#b8960a)`,
            display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.4rem",
            boxShadow:"0 4px 14px rgba(212,175,55,0.3)"}}>✨</div>
          <div>
            <div style={{fontSize:"1.2rem",fontWeight:"800",color:"#f1f5f9"}}>AI معاون</div>
            <div style={{fontSize:"0.62rem",color:"rgba(212,175,55,0.6)"}}>
              Gemini — اردو میں اسلامی تعلیمی مشیر
            </div>
          </div>
        </div>
        <button onClick={()=>setShowHist(v=>!v)}
          style={{padding:"7px 14px",borderRadius:"9px",fontSize:"0.68rem",
            fontWeight:"700",cursor:"pointer",fontFamily:"inherit",
            background:showHist?"rgba(212,175,55,0.15)":"rgba(255,255,255,0.05)",
            color:showHist?G:"rgba(255,255,255,0.45)",
            border:`1px solid ${showHist?"rgba(212,175,55,0.3)":"rgba(255,255,255,0.1)"}`}}>
          📋 سابقہ ({history.length})
        </button>
      </div>

      <div style={{display:"flex",height:"calc(100vh - 78px)",overflow:"hidden"}}>

        {/* LEFT: Form */}
        <div style={{width:"380px",flexShrink:0,display:"flex",flexDirection:"column",
          borderLeft:"1px solid rgba(255,255,255,0.06)",overflow:"hidden"}}>

          <div style={{padding:"10px 10px",borderBottom:"1px solid rgba(255,255,255,0.06)",
            display:"flex",flexDirection:"column",gap:"4px"}}>
            {TABS.map(t=>(
              <button key={t.id} className="ai-tab"
                onClick={()=>{setTab(t.id);setOutput("");setError("");setSent(false);}}
                style={{padding:"10px 13px",borderRadius:"9px",border:"none",cursor:"pointer",
                  fontFamily:"inherit",textAlign:"right",direction:"rtl",
                  background:tab===t.id?`${t.color}18`:"transparent",
                  color:tab===t.id?t.color:"rgba(255,255,255,0.45)",
                  borderRight:`3px solid ${tab===t.id?t.color:"transparent"}`,
                  transition:"all 0.13s"}}>
                <div style={{fontSize:"0.78rem",fontWeight:tab===t.id?"700":"500"}}>
                  {t.icon} {t.label}
                </div>
                <div style={{fontSize:"0.58rem",color:"rgba(255,255,255,0.3)",marginTop:"2px"}}>
                  {t.desc}
                </div>
              </button>
            ))}
          </div>

          <div style={{flex:1,overflowY:"auto",padding:"16px"}}>
            <div style={{padding:"10px 12px",borderRadius:"9px",marginBottom:"14px",
              background:`${activeTab?.color}10`,
              border:`1px solid ${activeTab?.color}25`,direction:"rtl"}}>
              <div style={{fontSize:"0.75rem",fontWeight:"700",color:activeTab?.color}}>
                {activeTab?.icon} {activeTab?.label}
              </div>
              <div style={{fontSize:"0.62rem",color:"rgba(255,255,255,0.4)",marginTop:"2px"}}>
                {activeTab?.desc}
              </div>
            </div>
            <TaskForm taskId={tab} students={students} onGenerate={generate}/>
          </div>
        </div>

        {/* RIGHT: Output */}
        <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>

          {/* Toolbar */}
          {output && (
            <div style={{padding:"10px 16px",borderBottom:"1px solid rgba(255,255,255,0.06)",
              display:"flex",alignItems:"center",gap:"8px",flexShrink:0}}>
              <span style={{fontSize:"0.68rem",color:"rgba(255,255,255,0.35)",flex:1}}>
                {activeTab?.icon} {activeTab?.label} — نتیجہ
              </span>

              {/* Send to parent button */}
              {!loading && lastCtx?.studentName && (
                <button className="ai-copy-btn" onClick={sendToParent} disabled={sending||sent}
                  style={{padding:"5px 12px",borderRadius:"7px",
                    border:`1px solid ${sent?"rgba(74,222,128,0.3)":"rgba(74,222,128,0.2)"}`,
                    background: sent?"rgba(74,222,128,0.12)":"rgba(74,222,128,0.07)",
                    color: sent?"#4ade80":"rgba(74,222,128,0.7)",
                    fontSize:"0.65rem",cursor:sending?"wait":"pointer",
                    fontFamily:"inherit",fontWeight:"600"}}>
                  {sent ? "✓ بھیج دیا" : sending ? "⏳ بھیج رہے ہیں..." : "📩 والدین کو بھیجیں"}
                </button>
              )}

              <button className="ai-copy-btn" onClick={copyOutput}
                style={{padding:"5px 12px",borderRadius:"7px",
                  border:"1px solid rgba(255,255,255,0.1)",
                  background:"rgba(255,255,255,0.05)",color:"rgba(255,255,255,0.6)",
                  fontSize:"0.65rem",cursor:"pointer",fontFamily:"inherit",fontWeight:"600"}}>
                {copied?"✓ کاپی ہوا":"📋 کاپی"}
              </button>
              <button className="ai-copy-btn" onClick={printOutput}
                style={{padding:"5px 12px",borderRadius:"7px",
                  border:"1px solid rgba(255,255,255,0.1)",
                  background:"rgba(255,255,255,0.05)",color:"rgba(255,255,255,0.6)",
                  fontSize:"0.65rem",cursor:"pointer",fontFamily:"inherit",fontWeight:"600"}}>
                🖨️ پرنٹ
              </button>
              <button className="ai-copy-btn" onClick={()=>setOutput("")}
                style={{padding:"5px 10px",borderRadius:"7px",
                  border:"1px solid rgba(248,113,113,0.2)",
                  background:"rgba(248,113,113,0.06)",color:"#f87171",
                  fontSize:"0.65rem",cursor:"pointer"}}>✕</button>
            </div>
          )}

          <div ref={outputRef} style={{flex:1,overflowY:"auto",padding:"20px 24px"}}>

            {loading&&(
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",
                justifyContent:"center",height:"100%",gap:"16px"}}>
                <div style={{width:"56px",height:"56px",borderRadius:"50%",
                  background:`linear-gradient(135deg,${G},#b8960a)`,
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:"1.6rem",animation:"pulse 1.5s ease infinite"}}>✨</div>
                <div style={{color:"rgba(212,175,55,0.8)",fontSize:"0.85rem",fontWeight:"700"}}>
                  AI سوچ رہا ہے...
                </div>
                <style>{`@keyframes pulse{0%,100%{transform:scale(1);opacity:1;}50%{transform:scale(1.1);opacity:0.8;}}`}</style>
              </div>
            )}

            {error&&!loading&&(
              <div style={{padding:"16px 20px",borderRadius:"12px",
                background:"rgba(248,113,113,0.08)",border:"1px solid rgba(248,113,113,0.2)"}}>
                <div style={{fontSize:"0.8rem",fontWeight:"700",color:"#f87171",marginBottom:"8px"}}>
                  ⚠️ خرابی پیش آئی
                </div>
                <div style={{fontSize:"0.72rem",color:"rgba(255,255,255,0.5)"}}>{error}</div>
                {(error.includes("GEMINI_API_KEY")||error.includes("API_KEY"))&&(
                  <div style={{marginTop:"10px",padding:"10px 12px",borderRadius:"8px",
                    background:"rgba(212,175,55,0.08)",border:"1px solid rgba(212,175,55,0.2)",
                    fontSize:"0.68rem",color:"rgba(212,175,55,0.7)"}}>
                    💡 Vercel Dashboard میں GEMINI_API_KEY environment variable شامل کریں
                  </div>
                )}
              </div>
            )}

            {output&&!loading&&(
              <div style={{direction:"rtl",fontFamily:"'Noto Nastaliq Urdu',serif",
                fontSize:"0.9rem",lineHeight:"2.2",color:"#e2e8f0",whiteSpace:"pre-wrap"}}>
                {output}
              </div>
            )}

            {output&&loading&&(
              <div style={{direction:"rtl",fontFamily:"'Noto Nastaliq Urdu',serif",
                fontSize:"0.9rem",lineHeight:"2.2",color:"#e2e8f0",whiteSpace:"pre-wrap"}}>
                {output}
                <span style={{display:"inline-block",width:"10px",height:"1.4em",
                  background:G,verticalAlign:"middle",
                  animation:"blink 0.7s step-end infinite",borderRadius:"2px"}}>
                  <style>{`@keyframes blink{0%,100%{opacity:1;}50%{opacity:0;}}`}</style>
                </span>
              </div>
            )}

            {!output&&!loading&&!error&&(
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",
                justifyContent:"center",height:"100%",gap:"14px",opacity:0.4}}>
                <div style={{fontSize:"4rem"}}>✨</div>
                <div style={{color:"rgba(255,255,255,0.6)",fontSize:"0.85rem",fontWeight:"700"}}>
                  بائیں سے کام منتخب کر کے شروع کریں
                </div>
                <div style={{color:"rgba(255,255,255,0.3)",fontSize:"0.65rem",textAlign:"center",maxWidth:"260px"}}>
                  AI آپ کے لیے اردو میں مکمل مواد تیار کرے گا
                </div>
              </div>
            )}
          </div>
        </div>

        {/* History sidebar */}
        {showHist&&(
          <div style={{width:"260px",flexShrink:0,borderRight:"1px solid rgba(255,255,255,0.06)",
            display:"flex",flexDirection:"column",overflow:"hidden"}}>
            <div style={{padding:"12px 14px",borderBottom:"1px solid rgba(255,255,255,0.06)",
              fontSize:"0.72rem",fontWeight:"700",color:"rgba(212,175,55,0.7)"}}>
              📋 سابقہ نتائج
            </div>
            <div style={{flex:1,overflowY:"auto",padding:"6px 8px"}}>
              {history.length===0&&(
                <div style={{textAlign:"center",padding:"40px 16px",
                  color:"rgba(255,255,255,0.2)",fontSize:"0.68rem"}}>
                  کوئی سابقہ نتیجہ نہیں
                </div>
              )}
              {history.map((h,i)=>(
                <div key={i} onClick={()=>setOutput(h.output)}
                  style={{padding:"10px 12px",borderRadius:"9px",cursor:"pointer",
                    marginBottom:"4px",transition:"background 0.12s",
                    background:"rgba(255,255,255,0.04)",
                    border:"1px solid rgba(255,255,255,0.06)"}}>
                  <div style={{fontSize:"0.7rem",fontWeight:"700",color:"#f1f5f9",direction:"rtl"}}>
                    {TABS.find(t=>t.id===h.task)?.icon} {h.label}
                  </div>
                  <div style={{fontSize:"0.58rem",color:"rgba(255,255,255,0.3)",marginTop:"2px"}}>
                    {h.ts} • {h.output.slice(0,40)}...
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
