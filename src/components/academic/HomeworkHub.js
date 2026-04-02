/* eslint-disable */
import { useState, useEffect } from "react";
import { supabase } from "../../supabase";
import AddHomework  from "./AddHomework";
import HomeworkCard, { getHWStatus } from "./HomeworkCard";
import SubmissionView from "./SubmissionView";

const N  = "#0f172a";
const G  = "#d4af37";

// ─── Categorise homework for tabs ────────────────────────────────────────────
function categorise(hw, submissions, studentId, isTeacher){
  const today = new Date(); today.setHours(0,0,0,0);
  const due   = new Date(hw.due_date); due.setHours(0,0,0,0);
  const daysLeft = Math.ceil((due - today)/86400000);

  if(isTeacher){
    const hwSubs    = submissions.filter(s=>s.homework_id===hw.id);
    const hasGraded = hwSubs.some(s=>s.status==="graded");
    const overdue   = daysLeft < 0;
    if(hasGraded) return "completed";
    if(overdue)   return "overdue";
    const hasSubs = hwSubs.some(s=>["submitted","graded"].includes(s.status));
    if(hasSubs)   return "submitted";
    return "active";
  } else {
    const mySub = submissions.find(s=>s.homework_id===hw.id && s.student_id===studentId);
    if(mySub?.status==="graded")    return "completed";
    if(mySub?.status==="submitted") return "submitted";
    if(daysLeft < 0)                return "overdue";
    return "active";
  }
}

// ─── Tab config ──────────────────────────────────────────────────────────────
const TABS = [
  { id:"active",    label:"فعال",     icon:"📘", color:"#60a5fa" },
  { id:"submitted", label:"جمع شدہ",  icon:"✅", color:"#38bdf8" },
  { id:"overdue",   label:"میعاد گزری",icon:"⛔",color:"#f87171" },
  { id:"completed", label:"مکمل",     icon:"🏆", color:"#4ade80" },
];

// ─── Main Component ──────────────────────────────────────────────────────────
export default function HomeworkHub({ students, user, userRole, teachers }){
  const [homework,     setHomework]     = useState([]);
  const [submissions,  setSubmissions]  = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [tab,          setTab]          = useState("active");
  const [showAdd,      setShowAdd]      = useState(false);
  const [viewingHW,    setViewingHW]    = useState(null); // SubmissionView
  const [gradeFilter,  setGradeFilter]  = useState("all");
  const [subjectFilter,setSubjectFilter]= useState("all");
  const [csvLoading,   setCsvLoading]   = useState(false);
  const [csvResult,    setCsvResult]    = useState(null);

  const isStaff   = !["parent","student"].includes(userRole);
  const isStudent = userRole === "student";
  const isParent  = userRole === "parent";

  // Current student id (for student/parent views)
  // In a real app this would be tied to login; here we use first matching student
  const myStudent = isStudent
    ? students.find(s=>s.email===user?.email) || students[0]
    : isParent
    ? students.find(s=>s.parentEmail===user?.email) || students[0]
    : null;

  // ── Fetch data ──────────────────────────────────────────────────────────────
  const load = async () => {
    setLoading(true);
    try {
      const [{ data:hw }, { data:subs }] = await Promise.all([
        supabase.from("homework").select("*").order("created_at",{ascending:false}),
        supabase.from("homework_submissions").select("*"),
      ]);
      setHomework(hw||[]);
      setSubmissions(subs||[]);
    } catch(e){ console.warn("HomeworkHub load:",e.message); }
    setLoading(false);
  };

  useEffect(()=>{ load(); },[]);

  // ── CSV bulk upload ─────────────────────────────────────────────────────────
  const handleCSV = async (e) => {
    const file = e.target.files[0]; if(!file) return;
    e.target.value = "";
    setCsvLoading(true); setCsvResult(null);
    const text = await file.text();
    const lines = text.split("\n").map(l=>l.trim()).filter(Boolean);
    const header = lines[0]?.toLowerCase();
    const dataLines = (header.includes("grade")||header.includes("subject")||header.includes("title"))
      ? lines.slice(1) : lines;
    const today = new Date().toISOString().split("T")[0];
    let ok=0, skip=0, errs=[];
    for(const line of dataLines){
      const [grade,subject,title,description,due_date,total_marks] = line.split(",").map(s=>s?.trim());
      if(!grade||!subject||!title||!due_date){ skip++; errs.push(`مکمل نہیں: ${title||line.slice(0,20)}`); continue; }
      const { error } = await supabase.from("homework").insert({
        grade, subject, title,
        description: description||"",
        due_date,
        total_marks: parseInt(total_marks)||10,
        assigned_by: user?.email||"staff",
        created_at: new Date().toISOString(),
      });
      if(error){ errs.push(`${title}: ${error.message}`); skip++; }
      else ok++;
    }
    setCsvResult({ok,skip,errs});
    setCsvLoading(false);
    if(ok>0) await load();
  };

  // ── Save new homework ────────────────────────────────────────────────────────
  const saveHomework = async (form) => {
    const { error } = await supabase.from("homework").insert({
      ...form,
      assigned_by: user?.email || "staff",
      created_at:  new Date().toISOString(),
    });
    if(!error) await load();
  };

  // ── Delete homework ──────────────────────────────────────────────────────────
  const deleteHW = async (id) => {
    if(!window.confirm("یہ ہوم ورک حذف کریں؟")) return;
    await supabase.from("homework_submissions").delete().eq("homework_id",id);
    await supabase.from("homework").delete().eq("id",id);
    await load();
  };

  // ── Filter homework for current view ────────────────────────────────────────
  let visibleHW = homework;

  // Student sees only their grade's homework
  if(myStudent) visibleHW = visibleHW.filter(hw=>hw.grade===myStudent.grade);

  // Additional filters
  if(gradeFilter!=="all")   visibleHW = visibleHW.filter(hw=>hw.grade===gradeFilter);
  if(subjectFilter!=="all") visibleHW = visibleHW.filter(hw=>hw.subject===subjectFilter);

  // Categorise into tabs
  const byTab = {};
  TABS.forEach(t=>{ byTab[t.id]=[]; });
  visibleHW.forEach(hw=>{
    const cat = categorise(hw, submissions, myStudent?.id, isStaff);
    byTab[cat]?.push(hw);
  });

  const tabHW = byTab[tab] || [];

  // ── Unique grades & subjects for filters ─────────────────────────────────────
  const grades   = [...new Set(homework.map(h=>h.grade).filter(Boolean))].sort();
  const subjects = [...new Set(homework.map(h=>h.subject).filter(Boolean))].sort();

  // ── Stat cards ───────────────────────────────────────────────────────────────
  const stats = [
    { label:"فعال",      val:byTab.active?.length||0,    color:"#60a5fa", icon:"📘" },
    { label:"جمع شدہ",  val:byTab.submitted?.length||0, color:"#38bdf8", icon:"✅" },
    { label:"میعاد گزری",val:byTab.overdue?.length||0,  color:"#f87171", icon:"⛔" },
    { label:"مکمل",      val:byTab.completed?.length||0, color:"#4ade80", icon:"🏆" },
  ];

  // ─── If viewing submissions for a specific HW ─────────────────────────────
  if(viewingHW) return (
    <SubmissionView
      hw={viewingHW}
      submissions={submissions}
      students={students}
      onBack={()=>setViewingHW(null)}
      onRefresh={load}
    />
  );

  // ─── Main view ───────────────────────────────────────────────────────────────
  return (
    <div style={{minHeight:"100vh",
      background:`linear-gradient(160deg,${N} 0%,#0d1f3c 60%,${N} 100%)`,
      fontFamily:"'Public Sans',sans-serif",padding:"20px",direction:"rtl"}}>

      <style>{`
        .hw-card:hover { transform:translateY(-2px);
          box-shadow:0 8px 24px rgba(0,0,0,0.25)!important; }
        .hw-tab-btn:hover { background:rgba(255,255,255,0.08)!important; }
      `}</style>

      {/* ── Header ── */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
        marginBottom:"20px",flexWrap:"wrap",gap:"12px"}}>
        <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
          <div style={{width:"44px",height:"44px",borderRadius:"12px",
            background:`linear-gradient(135deg,${G},#b8960a)`,
            display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.4rem"}}>
            📝
          </div>
          <div>
            <div style={{fontSize:"1.2rem",fontWeight:"800",color:"#f1f5f9"}}>
              ہوم ورک و اسائنمنٹ
            </div>
            <div style={{fontSize:"0.65rem",color:"rgba(212,175,55,0.6)"}}>
              {isStaff
                ? `${homework.length} اسائنمنٹ • ${students.length} طلبہ`
                : myStudent
                  ? `${myStudent.name} • ${myStudent.grade}`
                  : "طلبہ کا ہوم ورک"}
            </div>
          </div>
        </div>

        {isStaff&&(
          <div style={{display:"flex",gap:"8px",flexWrap:"wrap",alignItems:"center"}}>
            {/* CSV Upload */}
            <label style={{display:"inline-flex",alignItems:"center",gap:"6px",padding:"9px 14px",
              borderRadius:"10px",cursor:csvLoading?"not-allowed":"pointer",
              background:"rgba(99,202,183,0.1)",color:"#63cab7",
              border:"1px solid rgba(99,202,183,0.3)",fontSize:"0.75rem",fontWeight:700,fontFamily:"inherit"}}>
              {csvLoading?"⏳...":"📂 CSV"}
              <input type="file" accept=".csv,.txt" style={{display:"none"}} onChange={handleCSV} disabled={csvLoading}/>
            </label>
            <button onClick={()=>setShowAdd(true)}
              style={{padding:"10px 20px",borderRadius:"10px",border:"none",
                background:`linear-gradient(135deg,${G},#b8960a)`,
                color:N,fontSize:"0.8rem",fontWeight:"800",cursor:"pointer",
                fontFamily:"inherit",display:"flex",alignItems:"center",gap:"7px",
                boxShadow:"0 4px 14px rgba(212,175,55,0.3)"}}>
              <span style={{fontSize:"1rem"}}>+</span> نیا ہوم ورک
            </button>
          </div>
        )}
      </div>

      {/* ── Stats cards ── */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"10px",
        marginBottom:"20px"}}>
        {stats.map(st=>(
          <div key={st.label} onClick={()=>setTab(
            st.label==="فعال"?"active":
            st.label==="جمع شدہ"?"submitted":
            st.label==="میعاد گزری"?"overdue":"completed"
          )}
            style={{background:`${st.color}10`,border:`1px solid ${st.color}25`,
              borderRadius:"12px",padding:"14px 12px",textAlign:"center",
              cursor:"pointer",transition:"all 0.13s",
              boxShadow:tab===(st.label==="فعال"?"active":st.label==="جمع شدہ"?"submitted":
                st.label==="میعاد گزری"?"overdue":"completed")
                ?`0 0 0 2px ${st.color}60`:"none"}}>
            <div style={{fontSize:"1.4rem",marginBottom:"4px"}}>{st.icon}</div>
            <div style={{fontSize:"1.3rem",fontWeight:"900",color:st.color}}>{st.val}</div>
            <div style={{fontSize:"0.6rem",color:"rgba(255,255,255,0.4)",marginTop:"2px"}}>{st.label}</div>
          </div>
        ))}
      </div>

      {/* ── CSV result ── */}
      {csvResult&&(
        <div style={{marginBottom:"14px",padding:"12px 16px",borderRadius:"10px",
          background:csvResult.skip===0?"rgba(74,222,128,0.08)":"rgba(251,146,60,0.08)",
          border:`1px solid ${csvResult.skip===0?"rgba(74,222,128,0.3)":"rgba(251,146,60,0.3)"}`,
          display:"flex",alignItems:"center",gap:"12px",flexWrap:"wrap",direction:"rtl"}}>
          <span style={{color:"#4ade80",fontWeight:700,fontSize:"0.8rem"}}>✅ {csvResult.ok} ہوم ورک شامل ہوئے</span>
          {csvResult.skip>0&&<span style={{color:"#fb923c",fontWeight:700,fontSize:"0.8rem"}}>⚠️ {csvResult.skip} ناکام</span>}
          {csvResult.errs.slice(0,3).map((e,i)=><span key={i} style={{color:"#fca5a5",fontSize:"0.68rem"}}>{e}</span>)}
          <button onClick={()=>setCsvResult(null)} style={{marginRight:"auto",background:"none",border:"none",color:"#64748b",cursor:"pointer"}}>✕</button>
        </div>
      )}

      {/* ── CSV Format hint (collapsed) ── */}
      {isStaff&&!homework.length&&(
        <div style={{marginBottom:"14px",padding:"12px 16px",borderRadius:"10px",direction:"ltr",
          background:"rgba(99,202,183,0.05)",border:"1px solid rgba(99,202,183,0.15)"}}>
          <div style={{color:"#63cab7",fontWeight:700,fontSize:"0.72rem",marginBottom:6}}>📄 Homework CSV Format:</div>
          <code style={{display:"block",background:"rgba(0,0,0,0.3)",padding:"8px 12px",borderRadius:7,
            color:"#a3e6dc",fontFamily:"monospace",fontSize:"0.68rem",lineHeight:1.9}}>
            grade,subject,title,description,due_date,total_marks{"\n"}
            Grade 7,ریاضی,صفحہ 15-18,مسائل حل کریں,2024-04-20,10{"\n"}
            Grade 8,اردو,مضمون لکھیں,,2024-04-22,20
          </code>
        </div>
      )}

      {/* ── Subject filter pills ── */}
      {subjects.length>0&&(
        <div style={{display:"flex",gap:"6px",marginBottom:"14px",flexWrap:"wrap"}}>
          <button onClick={()=>setSubjectFilter("all")}
            style={{padding:"5px 14px",borderRadius:"20px",border:"none",cursor:"pointer",fontFamily:"inherit",
              fontSize:"0.68rem",fontWeight:700,
              background:subjectFilter==="all"?G:"rgba(255,255,255,0.06)",
              color:subjectFilter==="all"?N:"rgba(255,255,255,0.45)"}}>
            تمام مضامین
          </button>
          {subjects.map(s=>(
            <button key={s} onClick={()=>setSubjectFilter(subjectFilter===s?"all":s)}
              style={{padding:"5px 14px",borderRadius:"20px",border:"none",cursor:"pointer",fontFamily:"inherit",
                fontSize:"0.68rem",fontWeight:600,
                background:subjectFilter===s?"rgba(212,175,55,0.2)":"rgba(255,255,255,0.05)",
                color:subjectFilter===s?G:"rgba(255,255,255,0.4)",
                border:`1px solid ${subjectFilter===s?"rgba(212,175,55,0.4)":"rgba(255,255,255,0.08)"}`,
                transition:"all 0.15s"}}>
              {s}
            </button>
          ))}
        </div>
      )}

      {/* ── Tomorrow deadline reminder banner ── */}
      {(()=>{
        const tmr = homework.filter(h=>{
          const today2=new Date(); today2.setHours(0,0,0,0);
          const due2=new Date(h.due_date); due2.setHours(0,0,0,0);
          return Math.ceil((due2-today2)/86400000)===1;
        });
        return tmr.length>0&&tab!=="overdue"?(
          <div style={{marginBottom:"14px",padding:"10px 16px",borderRadius:"10px",cursor:"pointer",
            background:"rgba(250,204,21,0.07)",border:"1px solid rgba(250,204,21,0.25)",
            display:"flex",alignItems:"center",gap:"10px",direction:"rtl"}}
            onClick={()=>setTab("active")}>
            <span>🟠</span>
            <span style={{fontSize:"0.73rem",fontWeight:700,color:"#facc15"}}>
              {tmr.length} ہوم ورک کی deadline کل ہے — {tmr.map(h=>h.title).join("، ")}
            </span>
          </div>
        ):null;
      })()}

      {/* ── Filters (teacher/director only) ── */}
      {isStaff&&(homework.length>0)&&(
        <div style={{display:"flex",gap:"10px",marginBottom:"16px",flexWrap:"wrap",
          padding:"12px 14px",background:"rgba(255,255,255,0.04)",
          borderRadius:"10px",border:"1px solid rgba(255,255,255,0.06)"}}>
          <div style={{display:"flex",alignItems:"center",gap:"6px",flex:1,minWidth:"140px"}}>
            <span style={{fontSize:"0.62rem",color:"rgba(255,255,255,0.4)",flexShrink:0}}>جماعت:</span>
            <select value={gradeFilter} onChange={e=>setGradeFilter(e.target.value)}
              style={{flex:1,padding:"6px 10px",borderRadius:"7px",
                border:"1px solid rgba(255,255,255,0.1)",
                background:"rgba(255,255,255,0.06)",color:"#f1f5f9",
                fontSize:"0.72rem",outline:"none",direction:"rtl"}}>
              <option value="all">تمام</option>
              {grades.map(g=><option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:"6px",flex:1,minWidth:"140px"}}>
            <span style={{fontSize:"0.62rem",color:"rgba(255,255,255,0.4)",flexShrink:0}}>مضمون:</span>
            <select value={subjectFilter} onChange={e=>setSubjectFilter(e.target.value)}
              style={{flex:1,padding:"6px 10px",borderRadius:"7px",
                border:"1px solid rgba(255,255,255,0.1)",
                background:"rgba(255,255,255,0.06)",color:"#f1f5f9",
                fontSize:"0.72rem",outline:"none",direction:"rtl"}}>
              <option value="all">تمام</option>
              {subjects.map(s=><option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      )}

      {/* ── Tabs ── */}
      <div style={{display:"flex",gap:"4px",marginBottom:"18px",
        background:"rgba(255,255,255,0.04)",borderRadius:"12px",
        padding:"5px",border:"1px solid rgba(255,255,255,0.06)"}}>
        {TABS.map(t=>{
          const count = byTab[t.id]?.length||0;
          const active = tab===t.id;
          return (
            <button key={t.id} className="hw-tab-btn" onClick={()=>setTab(t.id)}
              style={{flex:1,padding:"9px 6px",borderRadius:"8px",border:"none",
                cursor:"pointer",fontFamily:"inherit",fontWeight:active?"700":"500",
                fontSize:"0.7rem",direction:"rtl",transition:"all 0.13s",
                background:active?`${t.color}20`:"transparent",
                color:active?t.color:"rgba(255,255,255,0.4)",
                display:"flex",alignItems:"center",justifyContent:"center",gap:"5px"}}>
              <span>{t.icon}</span>
              <span style={{display:window.innerWidth<500?"none":"inline"}}>{t.label}</span>
              {count>0&&<span style={{
                background:active?t.color:"rgba(255,255,255,0.15)",
                color:active?N:"rgba(255,255,255,0.6)",
                borderRadius:"20px",padding:"1px 7px",fontSize:"0.58rem",fontWeight:"800"}}>
                {count}
              </span>}
            </button>
          );
        })}
      </div>

      {/* ── Content ── */}
      {loading&&(
        <div style={{textAlign:"center",padding:"60px",color:"rgba(255,255,255,0.3)",
          fontSize:"0.85rem"}}>لوڈ ہو رہا ہے...</div>
      )}

      {!loading&&tabHW.length===0&&(
        <div style={{textAlign:"center",padding:"60px 20px",
          background:"rgba(255,255,255,0.03)",borderRadius:"16px",
          border:"1px solid rgba(255,255,255,0.05)"}}>
          <div style={{fontSize:"3rem",marginBottom:"12px",opacity:0.3}}>
            {TABS.find(t=>t.id===tab)?.icon}
          </div>
          <div style={{color:"rgba(255,255,255,0.3)",fontSize:"0.82rem",direction:"rtl"}}>
            {tab==="active"   ?"کوئی فعال ہوم ورک نہیں":
             tab==="submitted"?"کوئی جمع شدہ ہوم ورک نہیں":
             tab==="overdue"  ?"کوئی میعاد گزرا ہوم ورک نہیں":
                               "کوئی مکمل شدہ ہوم ورک نہیں"}
          </div>
          {isStaff&&tab==="active"&&(
            <button onClick={()=>setShowAdd(true)}
              style={{marginTop:"16px",padding:"10px 22px",borderRadius:"10px",border:"none",
                background:G,color:N,fontWeight:"700",fontSize:"0.78rem",
                cursor:"pointer",fontFamily:"inherit"}}>
              + پہلا ہوم ورک شامل کریں
            </button>
          )}
        </div>
      )}

      {!loading&&tabHW.length>0&&(
        <div style={{display:"grid",
          gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:"12px"}}>
          {tabHW.map(hw=>(
            <HomeworkCard
              key={hw.id}
              hw={hw}
              submissions={submissions}
              students={students}
              userRole={userRole}
              studentId={myStudent?.id}
              onViewSubs={setViewingHW}
              onDelete={isStaff?deleteHW:null}
            />
          ))}
        </div>
      )}

      {/* ── Overdue alert banner ── */}
      {byTab.overdue?.length>0&&tab!=="overdue"&&(
        <div onClick={()=>setTab("overdue")}
          style={{marginTop:"20px",padding:"12px 16px",borderRadius:"10px",cursor:"pointer",
            background:"rgba(248,113,113,0.08)",border:"1px solid rgba(248,113,113,0.2)",
            display:"flex",alignItems:"center",gap:"10px",direction:"rtl"}}>
          <span style={{fontSize:"1rem"}}>⛔</span>
          <span style={{fontSize:"0.75rem",fontWeight:"700",color:"#f87171"}}>
            {byTab.overdue.length} ہوم ورک کی میعاد گزر گئی — دیکھیں
          </span>
          <span style={{fontSize:"0.62rem",color:"rgba(248,113,113,0.6)",marginRight:"auto"}}>→</span>
        </div>
      )}

      {/* ── Add Homework Modal ── */}
      {showAdd&&(
        <AddHomework
          students={students}
          onSave={saveHomework}
          onClose={()=>setShowAdd(false)}
        />
      )}
    </div>
  );
}
