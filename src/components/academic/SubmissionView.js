/* eslint-disable */
import { useState } from "react";
import { supabase } from "../../supabase";

const N  = "#0f172a";
const G  = "#d4af37";

const inp = {
  padding:"8px 11px", borderRadius:"8px",
  border:"1px solid rgba(255,255,255,0.12)",
  background:"rgba(255,255,255,0.06)", color:"#f1f5f9",
  fontSize:"0.75rem", outline:"none", fontFamily:"inherit",
};

export default function SubmissionView({ hw, submissions, students, onBack, onRefresh }){
  // Students in this homework's grade
  const gradeStudents = students.filter(s=>s.grade===hw.grade);
  const hwSubs = submissions.filter(s=>s.homework_id===hw.id);

  const [marks,   setMarks]   = useState({}); // { studentId: markValue }
  const [remarks, setRemarks] = useState({}); // { studentId: remarkText }
  const [saving,  setSaving]  = useState({});  // { studentId: bool }
  const [search,  setSearch]  = useState("");
  const [filter,  setFilter]  = useState("all"); // all | submitted | pending | graded

  const getSub = (sid) => hwSubs.find(s=>s.student_id===sid);

  // Mark student as submitted + optionally give marks
  const markSubmitted = async (student) => {
    const sub = getSub(student.id);
    setSaving(p=>({...p,[student.id]:true}));
    try {
      if(!sub){
        // Create submission record
        await supabase.from("homework_submissions").insert({
          homework_id:  hw.id,
          student_id:   student.id,
          status:       "submitted",
          submitted_at: new Date().toISOString(),
        });
      } else {
        await supabase.from("homework_submissions")
          .update({ status:"submitted", submitted_at:new Date().toISOString() })
          .eq("id", sub.id);
      }
      onRefresh();
    } catch(e){ console.warn(e); }
    setSaving(p=>({...p,[student.id]:false}));
  };

  const giveMarks = async (student) => {
    const sub = getSub(student.id);
    const m = Number(marks[student.id]);
    if(!sub || isNaN(m) || m < 0) return;
    setSaving(p=>({...p,[student.id]:true}));
    try {
      await supabase.from("homework_submissions")
        .update({
          status:  "graded",
          marks:   m,
          remarks: remarks[student.id]||"",
        })
        .eq("id", sub.id);
      onRefresh();
    } catch(e){ console.warn(e); }
    setSaving(p=>({...p,[student.id]:false}));
  };

  // Filtered list
  const filtered = gradeStudents.filter(s=>{
    const q = search.toLowerCase();
    if(q && !s.name?.toLowerCase().includes(q)) return false;
    const sub = getSub(s.id);
    if(filter==="submitted") return sub?.status==="submitted";
    if(filter==="graded")    return sub?.status==="graded";
    if(filter==="pending")   return !sub || sub.status==="pending";
    return true;
  });

  // Summary counts
  const submittedCount = gradeStudents.filter(s=>["submitted","graded"].includes(getSub(s.id)?.status)).length;
  const gradedCount    = gradeStudents.filter(s=>getSub(s.id)?.status==="graded").length;
  const pendingCount   = gradeStudents.length - submittedCount;
  const pct = gradeStudents.length>0 ? Math.round((submittedCount/gradeStudents.length)*100) : 0;

  return (
    <div style={{minHeight:"100vh",
      background:`linear-gradient(160deg,${N} 0%,#0d1f3c 60%,${N} 100%)`,
      fontFamily:"'Public Sans',sans-serif",padding:"20px",direction:"rtl"}}>

      {/* Back + Title */}
      <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"18px"}}>
        <button onClick={onBack}
          style={{padding:"7px 14px",borderRadius:"9px",border:"1px solid rgba(255,255,255,0.1)",
            background:"rgba(255,255,255,0.05)",color:"rgba(255,255,255,0.6)",
            fontSize:"0.75rem",cursor:"pointer",fontFamily:"inherit",fontWeight:"600"}}>
          ← واپس
        </button>
        <div style={{flex:1}}>
          <div style={{fontSize:"1rem",fontWeight:"800",color:"#f1f5f9"}}>{hw.title}</div>
          <div style={{fontSize:"0.62rem",color:"rgba(212,175,55,0.6)"}}>
            {hw.subject} • {hw.grade} • آخری تاریخ: {new Date(hw.due_date).toLocaleDateString("en-PK")}
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"10px",marginBottom:"18px"}}>
        {[
          { label:"کل طلبہ",   val:gradeStudents.length, color:"#60a5fa" },
          { label:"جمع شدہ",   val:submittedCount,       color:"#38bdf8" },
          { label:"نمبر دیے",  val:gradedCount,          color:"#4ade80" },
          { label:"باقی",      val:pendingCount,         color:"#f87171" },
        ].map(x=>(
          <div key={x.label} style={{
            background:`${x.color}10`,border:`1px solid ${x.color}25`,
            borderRadius:"12px",padding:"12px",textAlign:"center"}}>
            <div style={{fontSize:"1.3rem",fontWeight:"900",color:x.color}}>{x.val}</div>
            <div style={{fontSize:"0.6rem",color:"rgba(255,255,255,0.45)",marginTop:"3px"}}>{x.label}</div>
          </div>
        ))}
      </div>

      {/* Overall progress bar */}
      <div style={{marginBottom:"18px",padding:"12px 16px",
        background:"rgba(255,255,255,0.04)",borderRadius:"10px",
        border:"1px solid rgba(255,255,255,0.06)"}}>
        <div style={{display:"flex",justifyContent:"space-between",
          alignItems:"center",marginBottom:"7px"}}>
          <span style={{fontSize:"0.68rem",color:"rgba(255,255,255,0.5)"}}>مجموعی جمع کاری</span>
          <span style={{fontSize:"0.75rem",fontWeight:"800",
            color:pct===100?"#4ade80":pct>=60?"#facc15":"#f87171"}}>{pct}%</span>
        </div>
        <div style={{height:"6px",background:"rgba(255,255,255,0.08)",borderRadius:"3px",overflow:"hidden"}}>
          <div style={{height:"100%",borderRadius:"3px",transition:"width 0.5s ease",
            width:`${pct}%`,
            background:pct===100?"#4ade80":pct>=60?"#facc15":"#60a5fa"}}/>
        </div>
      </div>

      {/* Search + Filter */}
      <div style={{display:"flex",gap:"10px",marginBottom:"14px",flexWrap:"wrap"}}>
        <input value={search} onChange={e=>setSearch(e.target.value)}
          placeholder="🔍 نام تلاش کریں..."
          style={{...inp,flex:1,minWidth:"180px",direction:"rtl"}}/>
        <div style={{display:"flex",gap:"5px"}}>
          {[["all","سب"],["submitted","جمع شدہ"],["graded","نمبر دیے"],["pending","باقی"]].map(([v,l])=>(
            <button key={v} onClick={()=>setFilter(v)}
              style={{padding:"6px 12px",borderRadius:"8px",border:"none",fontSize:"0.62rem",
                cursor:"pointer",fontWeight:"700",transition:"all 0.13s",
                background:filter===v?"rgba(212,175,55,0.2)":"rgba(255,255,255,0.05)",
                color:filter===v?G:"rgba(255,255,255,0.4)"}}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Student list */}
      <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
        {filtered.map((s,i)=>{
          const sub  = getSub(s.id);
          const stat = sub?.status;
          const isSaving = saving[s.id];
          const mk = marks[s.id] ?? (sub?.marks ?? "");
          const rm = remarks[s.id] ?? (sub?.remarks ?? "");

          // Row color by status
          const rowColor = stat==="graded"  ? "#4ade80"
                         : stat==="submitted"? "#38bdf8"
                         : "#f87171";
          const rowBg    = stat==="graded"  ? "rgba(74,222,128,0.06)"
                         : stat==="submitted"? "rgba(56,189,248,0.06)"
                         : "rgba(248,113,113,0.05)";

          return (
            <div key={s.id} style={{
              background:rowBg,border:`1px solid ${rowColor}25`,
              borderRadius:"12px",padding:"12px 16px",
              borderRight:`3px solid ${rowColor}`,direction:"rtl"}}>

              <div style={{display:"flex",alignItems:"center",gap:"12px",flexWrap:"wrap"}}>
                {/* Rank */}
                <div style={{width:"26px",height:"26px",borderRadius:"50%",
                  background:"rgba(255,255,255,0.06)",flexShrink:0,
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:"0.65rem",color:"rgba(255,255,255,0.35)",fontWeight:"700"}}>
                  {i+1}
                </div>

                {/* Name + grade */}
                <div style={{flex:1,minWidth:"120px"}}>
                  <div style={{fontSize:"0.82rem",fontWeight:"700",color:"#f1f5f9"}}>{s.name}</div>
                  <div style={{fontSize:"0.58rem",color:"rgba(255,255,255,0.35)"}}>
                    {s.studentCode||""} {s.grade&&`• ${s.grade}`}
                  </div>
                </div>

                {/* Status badge */}
                <span style={{padding:"3px 10px",borderRadius:"20px",fontSize:"0.6rem",
                  fontWeight:"800",background:`${rowColor}20`,color:rowColor,
                  border:`1px solid ${rowColor}35`,flexShrink:0,direction:"rtl"}}>
                  {stat==="graded"?"🏆 نمبر دیے":stat==="submitted"?"✅ جمع شدہ":"⛔ باقی"}
                </span>

                {/* Mark submitted button — if not yet submitted */}
                {!stat||stat==="pending" ? (
                  <button disabled={isSaving} onClick={()=>markSubmitted(s)}
                    style={{padding:"6px 12px",borderRadius:"8px",border:"none",
                      background:"rgba(56,189,248,0.15)",color:"#38bdf8",
                      fontSize:"0.65rem",fontWeight:"700",cursor:"pointer",
                      fontFamily:"inherit",flexShrink:0}}>
                    {isSaving?"...":"✓ جمع ہوا"}
                  </button>
                ) : null}

                {/* Give marks — if submitted but not graded */}
                {stat==="submitted"&&(
                  <div style={{display:"flex",gap:"6px",alignItems:"center",flexShrink:0}}>
                    <input type="number" min={0} max={hw.total_marks||100}
                      value={mk}
                      onChange={e=>setMarks(p=>({...p,[s.id]:e.target.value}))}
                      placeholder={`/${hw.total_marks||10}`}
                      style={{...inp,width:"60px",direction:"ltr",textAlign:"center",padding:"5px 8px"}}/>
                    <input value={rm} placeholder="ریمارک"
                      onChange={e=>setRemarks(p=>({...p,[s.id]:e.target.value}))}
                      style={{...inp,width:"100px"}}/>
                    <button disabled={isSaving} onClick={()=>giveMarks(s)}
                      style={{padding:"6px 10px",borderRadius:"8px",border:"none",
                        background:"rgba(74,222,128,0.15)",color:"#4ade80",
                        fontSize:"0.65rem",fontWeight:"700",cursor:"pointer",
                        fontFamily:"inherit"}}>
                      {isSaving?"...":"نمبر دیں"}
                    </button>
                  </div>
                )}

                {/* Graded — show marks */}
                {stat==="graded"&&(
                  <div style={{direction:"rtl",flexShrink:0}}>
                    <span style={{fontSize:"0.78rem",fontWeight:"800",color:"#4ade80"}}>
                      {sub.marks}/{hw.total_marks||10}
                    </span>
                    {sub.remarks&&<span style={{fontSize:"0.6rem",color:"rgba(255,255,255,0.35)",
                      marginRight:"6px"}}> "{sub.remarks}"</span>}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {filtered.length===0&&(
          <div style={{textAlign:"center",padding:"60px",
            color:"rgba(255,255,255,0.25)",fontSize:"0.8rem"}}>
            کوئی نتیجہ نہیں
          </div>
        )}
      </div>
    </div>
  );
}
