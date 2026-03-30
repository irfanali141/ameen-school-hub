/* eslint-disable */

const G = "#d4af37";
const N = "#0f172a";

// Returns { label, color, bg, icon } based on due date & submission status
export function getHWStatus(hw, mySubmission){
  const today  = new Date(); today.setHours(0,0,0,0);
  const due    = new Date(hw.due_date); due.setHours(0,0,0,0);
  const diff   = Math.ceil((due - today) / 86400000); // days remaining

  if(mySubmission?.status === "graded")
    return { label:"مکمل و نمبر",  icon:"🏆", color:"#4ade80", bg:"rgba(74,222,128,0.08)",  border:"rgba(74,222,128,0.25)"  };
  if(mySubmission?.status === "submitted")
    return { label:"جمع شدہ",     icon:"✅", color:"#38bdf8", bg:"rgba(56,189,248,0.08)",  border:"rgba(56,189,248,0.25)"  };
  if(diff < 0)
    return { label:"میعاد گزری",   icon:"⛔", color:"#f87171", bg:"rgba(248,113,113,0.08)", border:"rgba(248,113,113,0.3)"  };
  if(diff === 0)
    return { label:"آج آخری دن",   icon:"🔴", color:"#fb923c", bg:"rgba(251,146,60,0.08)",  border:"rgba(251,146,60,0.3)"   };
  if(diff === 1)
    return { label:"کل آخری دن",   icon:"🟠", color:"#facc15", bg:"rgba(250,204,21,0.08)",  border:"rgba(250,204,21,0.25)"  };
  return   { label:"فعال",         icon:"📘", color:"#60a5fa", bg:"rgba(96,165,250,0.06)",  border:"rgba(96,165,250,0.2)"   };
}

// Subject color map
const SUBJ_COLORS = {
  "قرآن / حفظ":"#f59e0b","تجوید":"#f59e0b","اسلامیات":"#10b981","عربی":"#14b8a6",
  "اردو":"#8b5cf6","انگریزی":"#3b82f6","ریاضی":"#ef4444","سائنس":"#06b6d4",
  "معاشرتی علوم":"#f97316","کمپیوٹر":"#6366f1","درسِ نظامی":"#d97706",
  "فقہ":"#059669","حدیث":"#dc2626","دیگر":"#94a3b8",
};

export default function HomeworkCard({
  hw, submissions, students, userRole,
  studentId,          // for student view — filter their submission
  onViewSubs,         // teacher: click to open SubmissionView
  onDelete,           // teacher: delete this HW
}){
  const isTeacher = !["parent","student"].includes(userRole);

  // Student's own submission (for student/parent view)
  const mySubmission = submissions.find(s=>s.homework_id===hw.id && s.student_id===studentId);

  // Teacher stats
  const hwSubs    = submissions.filter(s=>s.homework_id===hw.id);
  const gradeStudents = students.filter(s=>s.grade===hw.grade);
  const submitted  = hwSubs.filter(s=>["submitted","graded"].includes(s.status)).length;
  const graded     = hwSubs.filter(s=>s.status==="graded").length;
  const total      = gradeStudents.length;
  const pct        = total>0 ? Math.round((submitted/total)*100) : 0;

  const status = getHWStatus(hw, isTeacher ? null : mySubmission);
  const subjColor = SUBJ_COLORS[hw.subject] || "#94a3b8";

  const today = new Date(); today.setHours(0,0,0,0);
  const due   = new Date(hw.due_date); due.setHours(0,0,0,0);
  const daysLeft = Math.ceil((due - today)/86400000);

  return (
    <div style={{
      background: status.bg,
      border:`1px solid ${status.border}`,
      borderRadius:"14px",
      borderRight:`4px solid ${status.color}`,
      padding:"16px 18px",
      transition:"transform 0.13s,box-shadow 0.13s",
      cursor: isTeacher ? "pointer" : "default",
      position:"relative",
    }}
    className="hw-card"
    onClick={isTeacher ? ()=>onViewSubs(hw) : undefined}
    >
      {/* Subject pill + Status badge */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
        marginBottom:"10px",direction:"rtl",flexWrap:"wrap",gap:"6px"}}>
        <div style={{display:"flex",alignItems:"center",gap:"7px",flexWrap:"wrap"}}>
          <span style={{padding:"3px 10px",borderRadius:"20px",fontSize:"0.6rem",
            fontWeight:"700",background:`${subjColor}20`,color:subjColor,
            border:`1px solid ${subjColor}40`}}>
            {hw.subject}
          </span>
          <span style={{padding:"3px 10px",borderRadius:"20px",fontSize:"0.6rem",
            fontWeight:"700",background:"rgba(255,255,255,0.05)",
            color:"rgba(255,255,255,0.45)",border:"1px solid rgba(255,255,255,0.08)"}}>
            {hw.grade}
          </span>
        </div>
        <span style={{padding:"3px 10px",borderRadius:"20px",fontSize:"0.62rem",
          fontWeight:"800",background:`${status.color}20`,color:status.color,
          border:`1px solid ${status.color}40`,direction:"rtl"}}>
          {status.icon} {status.label}
        </span>
      </div>

      {/* Title */}
      <div style={{fontSize:"0.9rem",fontWeight:"800",color:"#f1f5f9",
        marginBottom:"6px",direction:"rtl",lineHeight:"1.4"}}>
        {hw.title}
      </div>

      {/* Description */}
      {hw.description&&<div style={{fontSize:"0.7rem",color:"rgba(255,255,255,0.45)",
        marginBottom:"10px",direction:"rtl",lineHeight:"1.5"}}>
        {hw.description}
      </div>}

      {/* Due date row */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
        direction:"rtl",flexWrap:"wrap",gap:"8px"}}>
        <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
          <span style={{fontSize:"0.65rem",color:"rgba(255,255,255,0.35)"}}>
            📅 {new Date(hw.due_date).toLocaleDateString("en-PK",{day:"2-digit",month:"short",year:"numeric"})}
          </span>
          <span style={{fontSize:"0.6rem",fontWeight:"700",
            color:daysLeft<0?"#f87171":daysLeft<=1?"#fb923c":daysLeft<=3?"#facc15":"#4ade80"}}>
            {daysLeft<0?`${Math.abs(daysLeft)} دن گزر گئے`:
             daysLeft===0?"آج":daysLeft===1?"کل":`${daysLeft} دن باقی`}
          </span>
        </div>
        <span style={{fontSize:"0.62rem",color:"rgba(255,255,255,0.3)"}}>
          📋 {hw.total_marks||10} نمبر
        </span>
      </div>

      {/* ── TEACHER: progress bar + stats ── */}
      {isTeacher&&(
        <div style={{marginTop:"12px",paddingTop:"10px",
          borderTop:"1px solid rgba(255,255,255,0.06)"}}>
          <div style={{display:"flex",justifyContent:"space-between",
            alignItems:"center",marginBottom:"5px",direction:"rtl"}}>
            <span style={{fontSize:"0.62rem",color:"rgba(255,255,255,0.4)"}}>
              جمع شدہ: {submitted}/{total}
              {graded>0&&<span style={{color:"#4ade80",marginRight:"6px"}}> · نمبر دیے: {graded}</span>}
            </span>
            <span style={{fontSize:"0.65rem",fontWeight:"800",
              color:pct===100?"#4ade80":pct>=60?"#facc15":"#f87171"}}>{pct}%</span>
          </div>
          {/* Progress bar */}
          <div style={{height:"4px",background:"rgba(255,255,255,0.06)",
            borderRadius:"2px",overflow:"hidden"}}>
            <div style={{height:"100%",borderRadius:"2px",transition:"width 0.5s ease",
              width:`${pct}%`,
              background:pct===100?"#4ade80":pct>=60?"#facc15":"#60a5fa"}}/>
          </div>
          <div style={{marginTop:"6px",fontSize:"0.58rem",
            color:"rgba(212,175,55,0.5)",direction:"rtl",textAlign:"left"}}>
            👆 تفصیل دیکھنے کے لیے کلک کریں
          </div>
        </div>
      )}

      {/* ── STUDENT: my submission status ── */}
      {!isTeacher&&mySubmission&&(
        <div style={{marginTop:"10px",paddingTop:"8px",
          borderTop:"1px solid rgba(255,255,255,0.06)",direction:"rtl"}}>
          {mySubmission.status==="graded"&&(
            <div style={{display:"flex",gap:"12px",alignItems:"center"}}>
              <span style={{fontSize:"0.7rem",color:"#4ade80",fontWeight:"700"}}>
                🏆 نمبر: {mySubmission.marks}/{hw.total_marks||10}
              </span>
              {mySubmission.remarks&&<span style={{fontSize:"0.65rem",color:"rgba(255,255,255,0.4)"}}>
                "{mySubmission.remarks}"
              </span>}
            </div>
          )}
          {mySubmission.status==="submitted"&&(
            <span style={{fontSize:"0.68rem",color:"#38bdf8",fontWeight:"600"}}>
              ✅ جمع کر دیا — نمبر آنے کا انتظار کریں
            </span>
          )}
        </div>
      )}
      {!isTeacher&&!mySubmission&&(
        <div style={{marginTop:"10px",paddingTop:"8px",
          borderTop:"1px solid rgba(255,255,255,0.06)",direction:"rtl"}}>
          <span style={{fontSize:"0.68rem",
            color:daysLeft<0?"#f87171":"rgba(255,255,255,0.35)",fontWeight:"600"}}>
            {daysLeft<0?"⛔ جمع نہیں ہوا":"⏳ ابھی جمع نہیں ہوا"}
          </span>
        </div>
      )}

      {/* Delete button (teacher only, top-right corner) */}
      {isTeacher&&onDelete&&(
        <button onClick={e=>{e.stopPropagation();onDelete(hw.id)}}
          style={{position:"absolute",top:"10px",left:"10px",
            width:"26px",height:"26px",borderRadius:"6px",
            background:"rgba(248,113,113,0.1)",border:"1px solid rgba(248,113,113,0.2)",
            color:"#f87171",fontSize:"0.7rem",cursor:"pointer",
            display:"flex",alignItems:"center",justifyContent:"center"}}>
          🗑
        </button>
      )}
    </div>
  );
}
