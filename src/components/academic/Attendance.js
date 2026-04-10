/* eslint-disable */
import { useState, useEffect } from "react";
import { C, S, hBadge, HOUSES, sLabel } from "../../constants";
import { supabase, getData } from "../../supabase";
import { PrintBtn, printStudentAttendance, printTeacherAttendance } from "../../utils/print";
import EmptyState from "../ui/EmptyState";

function Attendance({students,addData,teachers}){
  /* ── All original state & Firebase logic unchanged ── */
  const [mainTab, setMainTab] = useState("students");
  const [sRecords, setSRecords] = useState([]);
  const [sDate, setSDate] = useState(new Date().toISOString().split("T")[0]);
  const [sAttendance, setSAttendance] = useState({});
  const [sSaved, setSSaved] = useState(false);
  const [sTab, setSTab] = useState("mark");
  const [sQ, setSQ] = useState("");
  useEffect(()=>{ getData("attendance").then(data=>setSRecords(data||[])); },[]);
  const setSStatus=(sid,val)=>setSAttendance(prev=>({...prev,[sid]:val}));
  const saveStudents=async()=>{ for(const s of students){ const status=sAttendance[s.id]||"present"; await addData("attendance",{studentId:s.id,studentName:s.name,date:sDate,status,houseId:s.houseId,grade:s.grade,type:"student"}); } setSSaved(true); setTimeout(()=>setSSaved(false),3000); };
  const sTodayRecords=sRecords.filter(r=>r.date===sDate&&r.type!=="teacher");
  const sPresentToday=sTodayRecords.filter(r=>r.status==="present").length;
  const sAbsentToday=sTodayRecords.filter(r=>r.status==="absent").length;
  const sLateToday=sTodayRecords.filter(r=>r.status==="late").length;
  const getStudentReport=(sid)=>{ const recs=sRecords.filter(r=>r.studentId===sid&&r.type!=="teacher"); const present=recs.filter(r=>r.status==="present").length; const absent=recs.filter(r=>r.status==="absent").length; const late=recs.filter(r=>r.status==="late").length; const total=recs.length; const pct=total>0?Math.round((present/total)*100):0; return {present,absent,late,total,pct}; };
  const [tRecords, setTRecords] = useState([]);
  const [tDate, setTDate] = useState(new Date().toISOString().split("T")[0]);
  const [tAttendance, setTAttendance] = useState({});
  const [tSaved, setTSaved] = useState(false);
  const [tTab, setTTab] = useState("mark");
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  useEffect(()=>{ getData("teacher_attendance").then(data=>setTRecords(data||[])); },[]);
  const setTStatus=(tid,val)=>setTAttendance(prev=>({...prev,[tid]:val}));
  const saveTeachers=async()=>{ for(const t of teachers){ const status=tAttendance[t.id]||"present"; await addData("teacher_attendance",{teacherId:t.id,teacherName:t.name,subject:t.subject||"",date:tDate,status,type:"teacher"}); } setTSaved(true); setTimeout(()=>setTSaved(false),3000); };
  const tTodayRecords=tRecords.filter(r=>r.date===tDate);
  const tPresentToday=tTodayRecords.filter(r=>r.status==="present").length;
  const tAbsentToday=tTodayRecords.filter(r=>r.status==="absent").length;
  const tLateToday=tTodayRecords.filter(r=>r.status==="late").length;
  const tLeaveToday=tTodayRecords.filter(r=>r.status==="leave").length;
  const getTeacherReport=(tid)=>{ const recs=tRecords.filter(r=>r.teacherId===tid); const present=recs.filter(r=>r.status==="present").length; const absent=recs.filter(r=>r.status==="absent").length; const late=recs.filter(r=>r.status==="late").length; const leave=recs.filter(r=>r.status==="leave").length; const total=recs.length; const pct=total>0?Math.round((present/total)*100):0; return {present,absent,late,leave,total,pct}; };
  const getTeacherLateHistory=(tid)=>tRecords.filter(r=>r.teacherId===tid&&r.status==="late").slice(0,10);

  /* ── CSV Bulk Upload ── */
  const [csvLoading,setCsvLoading]=useState(false);
  const [csvResult,setCsvResult]=useState(null);
  const [showCsvGuide,setShowCsvGuide]=useState(false);

  const handleAttendanceCSV=async(e)=>{
    const file=e.target.files[0]; if(!file)return;
    setCsvLoading(true); setCsvResult(null);
    const text=await file.text();
    const lines=text.split("\n").map(l=>l.trim()).filter(Boolean);
    const isHeader=lines[0]?.toLowerCase().includes("name")||lines[0]?.toLowerCase().includes("student")||lines[0]?.toLowerCase().includes("date");
    const dataLines=isHeader?lines.slice(1):lines;
    let ok=0,skip=0,errs=[];
    for(const line of dataLines){
      const [nameOrCode,date,status]=line.split(",").map(s=>s?.trim());
      if(!nameOrCode||!date){skip++;continue;}
      const st=students.find(s=>s.name?.toLowerCase().includes(nameOrCode.toLowerCase())||(s.studentCode||s.student_code)?.toLowerCase()===nameOrCode.toLowerCase());
      if(!st){errs.push(`نہیں ملا: ${nameOrCode}`);skip++;continue;}
      const validStatus=["present","absent","late"].includes(status)?status:"present";
      try{
        await addData("attendance",{studentId:st.id,studentName:st.name,date,status:validStatus,houseId:st.houseId,grade:st.grade,type:"student"});
        ok++;
      }catch(err){errs.push(`${st.name}: ${err.message}`);skip++;}
    }
    setCsvResult({ok,skip,errs});
    setCsvLoading(false); e.target.value="";
  };

  /* ── Design tokens (same as Dashboard) ── */
  const G="#d4af37";
  const glass={background:"rgba(255,255,255,0.07)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",border:"1px solid rgba(212,175,55,0.18)",borderRadius:"20px"};
  const glassDeep={background:"rgba(255,255,255,0.04)",backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"16px"};

  /* ── Reusable status badge ── */
  const StatusBadge=({status})=>{
    const cfg={present:{bg:"rgba(52,211,153,0.15)",color:"#34d399",border:"rgba(52,211,153,0.3)",label:"Present",icon:"check_circle"},absent:{bg:"rgba(248,113,113,0.15)",color:"#f87171",border:"rgba(248,113,113,0.3)",label:"Absent",icon:"cancel"},late:{bg:"rgba(251,191,36,0.15)",color:"#fbbf24",border:"rgba(251,191,36,0.3)",label:"Late",icon:"schedule"},leave:{bg:"rgba(167,139,250,0.15)",color:"#a78bfa",border:"rgba(167,139,250,0.3)",label:"Leave",icon:"beach_access"}};
    const s=cfg[status]||cfg.absent;
    return <span style={{display:"inline-flex",alignItems:"center",gap:"4px",padding:"4px 10px",borderRadius:"20px",fontSize:"0.62rem",fontWeight:"700",background:s.bg,color:s.color,border:`1px solid ${s.border}`,fontFamily:"'Public Sans',sans-serif",direction:"ltr",whiteSpace:"nowrap"}}>
      <span className="material-symbols-rounded" style={{fontSize:"12px"}}>{s.icon}</span>{s.label}
    </span>;
  };

  /* ── Mark-attendance row button set ── */
  const StatusPicker=({current,onChange,options})=>(
    <div style={{display:"flex",gap:"5px",flexWrap:"wrap",justifyContent:"flex-end"}}>
      {options.map(([v,icon,label,col])=>(
        <button key={v} onClick={()=>onChange(v)} style={{padding:"5px 10px",borderRadius:"10px",border:`1px solid ${current===v?col+"80":"rgba(255,255,255,0.1)"}`,background:current===v?col+"25":"rgba(255,255,255,0.05)",color:current===v?col:"rgba(255,255,255,0.35)",fontSize:"0.6rem",cursor:"pointer",fontFamily:"inherit",fontWeight:current===v?"700":"400",transition:"all 0.15s ease"}}>
          {icon} {label}
        </button>
      ))}
    </div>
  );

  /* ── Shared table header cell ── */
  const TH=({children})=><th style={{padding:"12px 14px",textAlign:"left",fontSize:"0.65rem",color:"rgba(212,175,55,0.7)",borderBottom:"1px solid rgba(212,175,55,0.15)",fontWeight:"600",letterSpacing:"0.05em",whiteSpace:"nowrap",fontFamily:"'Public Sans',sans-serif"}}>{children}</th>;
  const TD=({children,style={}})=><td style={{padding:"11px 14px",fontSize:"0.72rem",borderBottom:"1px solid rgba(255,255,255,0.05)",color:"rgba(255,255,255,0.8)",...style}}>{children}</td>;

  const isStudents=mainTab==="students";
  const activeDate=isStudents?sDate:tDate;
  const presentN=isStudents?sPresentToday:tPresentToday;
  const absentN=isStudents?sAbsentToday:tAbsentToday;
  const lateN=isStudents?sLateToday:tLateToday;
  const totalN=isStudents?students.length:teachers.length;
  const selT=selectedTeacher?teachers.find(x=>x.id===selectedTeacher):null;
  const selTR=selectedTeacher?getTeacherReport(selectedTeacher):null;

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#0f172a 0%,#13203a 45%,#1a2c4a 100%)",direction:"ltr",fontFamily:"'Public Sans','Segoe UI',sans-serif",overflowX:"hidden"}}>
      <div style={{position:"sticky",top:0,left:0,right:0,height:"3px",background:"linear-gradient(90deg,transparent,#d4af37,#f5e4a1,#d4af37,transparent)",zIndex:10}}/>

      <div style={{padding:"28px 32px",maxWidth:"1400px",margin:"0 auto"}}>

        {/* ══ PAGE HEADER ══ */}
        <div style={{...glass,padding:"24px 32px",marginBottom:"24px",display:"flex",flexWrap:"wrap",justifyContent:"space-between",alignItems:"center",gap:"16px"}}>
          <div>
            <div style={{color:G,fontSize:"0.65rem",fontWeight:"700",letterSpacing:"0.2em",textTransform:"uppercase",fontFamily:"'Public Sans',sans-serif",direction:"ltr",marginBottom:"6px",display:"flex",alignItems:"center",gap:"6px"}}>
              <span className="material-symbols-rounded" style={{fontSize:"14px"}}>fact_check</span> Attendance Management
            </div>
            <div style={{color:"white",fontSize:"1.6rem",fontWeight:"800",lineHeight:1.1}}>✅ Attendance</div>
            <div style={{color:"rgba(255,255,255,0.4)",fontSize:"0.68rem",marginTop:"4px"}}>{new Date(activeDate).toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:"10px",alignItems:"flex-end"}}>
            {/* Main tab switcher */}
            <div style={{display:"flex",gap:"8px",background:"rgba(255,255,255,0.05)",padding:"5px",borderRadius:"14px",border:"1px solid rgba(255,255,255,0.08)"}}>
              {[["students","school","Students"],["teachers","supervisor_account","Teachers"]].map(([t,icon,l])=>(
                <button key={t} onClick={()=>setMainTab(t)} style={{padding:"10px 20px",borderRadius:"10px",border:"none",cursor:"pointer",fontSize:"0.72rem",fontWeight:mainTab===t?"700":"500",background:mainTab===t?`linear-gradient(135deg,${G},#b8960a)`:"transparent",color:mainTab===t?"#0f172a":"rgba(255,255,255,0.5)",fontFamily:"inherit",display:"flex",alignItems:"center",gap:"6px",transition:"all 0.2s ease"}}>
                  <span className="material-symbols-rounded" style={{fontSize:"16px"}}>{icon}</span>{l}
                </button>
              ))}
            </div>
            {/* CSV Upload row */}
            <div style={{display:"flex",gap:"8px"}}>
              <button onClick={()=>setShowCsvGuide(!showCsvGuide)} style={{background:"rgba(99,202,183,0.1)",color:"#63cab7",border:"1px solid rgba(99,202,183,0.3)",borderRadius:"9px",padding:"7px 12px",fontSize:"0.72rem",fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>📋 CSV Format</button>
              <label style={{display:"inline-flex",alignItems:"center",gap:"5px",background:"rgba(99,202,183,0.12)",color:"#63cab7",border:"1px solid rgba(99,202,183,0.4)",borderRadius:"9px",padding:"7px 14px",fontSize:"0.78rem",fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
                {csvLoading?"⏳":"📂"} CSV Upload
                <input type="file" accept=".csv,.txt" style={{display:"none"}} onChange={handleAttendanceCSV} disabled={csvLoading}/>
              </label>
            </div>
          </div>
        </div>

        {/* CSV Guide & Result */}
        {showCsvGuide&&<div style={{background:"rgba(99,202,183,0.06)",border:"1px solid rgba(99,202,183,0.25)",borderRadius:"12px",padding:"14px 18px",marginBottom:"16px",direction:"ltr"}}>
          <div style={{color:"#63cab7",fontWeight:700,fontSize:"13px",marginBottom:"8px"}}>📄 Attendance CSV Format (پرانا data enter کرنے کے لیے):</div>
          <code style={{display:"block",background:"rgba(0,0,0,0.4)",padding:"10px",borderRadius:"8px",color:"#a3e6dc",fontFamily:"monospace",fontSize:"12px",lineHeight:"2",overflowX:"auto"}}>
            studentName,date,status<br/>
            Ahmad Ali,2024-04-01,present<br/>
            Bilal Khan,2024-04-01,absent<br/>
            Sara Noor,2024-04-01,late
          </code>
          <div style={{color:"#64748b",fontSize:"11px",marginTop:"8px"}}>• status: present / absent / late &nbsp;•&nbsp; date: YYYY-MM-DD &nbsp;•&nbsp; header row optional</div>
        </div>}
        {csvResult&&<div style={{background:csvResult.skip===0?"rgba(74,222,128,0.08)":"rgba(251,146,60,0.08)",border:`1px solid ${csvResult.skip===0?"rgba(74,222,128,0.3)":"rgba(251,146,60,0.3)"}`,borderRadius:"10px",padding:"12px 16px",marginBottom:"16px",display:"flex",alignItems:"center",gap:"12px",flexWrap:"wrap"}}>
          <span style={{color:"#4ade80",fontWeight:700}}>✅ {csvResult.ok} حاضری records شامل ہوگئے</span>
          {csvResult.skip>0&&<span style={{color:"#fb923c",fontWeight:700}}>⚠️ {csvResult.skip} ناکام</span>}
          {csvResult.errs.length>0&&<span style={{color:"#fca5a5",fontSize:"12px"}}>{csvResult.errs.slice(0,3).join(" • ")}</span>}
          <button onClick={()=>setCsvResult(null)} style={{background:"none",border:"none",color:"#64748b",cursor:"pointer",marginLeft:"auto"}}>✕</button>
        </div>}

        {/* ══ STAT CARDS ══ */}
        <div style={{display:"grid",gridTemplateColumns:`repeat(${isStudents?4:5},1fr)`,gap:"14px",marginBottom:"24px"}}>
          {[
            {icon:"check_circle",label:"Present",labelEn:"Present",value:presentN,accent:"#34d399"},
            {icon:"cancel",label:"Absent",labelEn:"Absent",value:absentN,accent:"#f87171"},
            {icon:"schedule",label:"Late",labelEn:"Late",value:lateN,accent:"#fbbf24"},
            {icon:"group",label:"Total",labelEn:"Total",value:totalN,accent:"#60a5fa"},
            ...(!isStudents?[{icon:"beach_access",label:"Leave",labelEn:"On Leave",value:tLeaveToday,accent:"#a78bfa"}]:[]),
          ].map((s,i)=>(
            <div key={i} className="hv-stat" style={{...glass,padding:"20px 22px",position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",top:"-15px",left:"-15px",width:"70px",height:"70px",borderRadius:"50%",background:`${s.accent}18`,pointerEvents:"none"}}/>
              <div style={{background:`${s.accent}20`,borderRadius:"12px",padding:"8px",display:"inline-flex",alignItems:"center",marginBottom:"12px"}}>
                <span className="material-symbols-rounded" style={{fontSize:"20px",color:s.accent}}>{s.icon}</span>
              </div>
              <div style={{color:"white",fontSize:"2rem",fontWeight:"800",fontFamily:"'Public Sans',sans-serif",lineHeight:1,marginBottom:"4px"}}>{s.value}</div>
              <div style={{color:"rgba(255,255,255,0.5)",fontSize:"0.68rem"}}>{s.label}</div>
              <div style={{position:"absolute",bottom:0,right:0,left:0,height:"2px",background:`linear-gradient(90deg,transparent,${s.accent}60,transparent)`}}/>
            </div>
          ))}
        </div>

        {/* ══ STUDENTS PANEL ══ */}
        {isStudents&&<div>
          {sSaved&&<div style={{...glass,padding:"14px 20px",marginBottom:"16px",textAlign:"center",border:"1px solid rgba(52,211,153,0.3)",background:"rgba(52,211,153,0.1)"}}>
            <span className="material-symbols-rounded" style={{fontSize:"16px",color:"#34d399",verticalAlign:"middle",marginLeft:"6px"}}>check_circle</span>
            <span style={{color:"#34d399",fontWeight:"700",fontSize:"0.8rem"}}>Student attendance saved successfully!</span>
          </div>}

          {/* Sub-tab bar */}
          <div style={{display:"flex",gap:"8px",marginBottom:"20px",flexWrap:"wrap"}}>
            {[["mark","edit","Mark"],["history","history","History"],["report","analytics","Report"]].map(([t,icon,l])=>(
              <button key={t} onClick={()=>setSTab(t)} style={{padding:"9px 18px",borderRadius:"12px",border:`1px solid ${sTab===t?"rgba(212,175,55,0.5)":"rgba(255,255,255,0.1)"}`,cursor:"pointer",fontSize:"0.72rem",fontWeight:sTab===t?"700":"500",background:sTab===t?"rgba(212,175,55,0.15)":"rgba(255,255,255,0.05)",color:sTab===t?G:"rgba(255,255,255,0.5)",fontFamily:"inherit",display:"flex",alignItems:"center",gap:"6px",transition:"all 0.2s"}}>
                <span className="material-symbols-rounded" style={{fontSize:"15px"}}>{icon}</span>{l}
              </button>
            ))}
          </div>

          {/* Mark attendance */}
          {sTab==="mark"&&<div style={{...glass,padding:"24px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"20px",flexWrap:"wrap",gap:"12px"}}>
              <div>
                <div style={{color:G,fontSize:"0.62rem",fontWeight:"700",letterSpacing:"0.15em",direction:"ltr",marginBottom:"4px"}}>MARK ATTENDANCE</div>
                <div style={{color:"white",fontSize:"0.95rem",fontWeight:"700"}}>{students.length} Students</div>
              </div>
              <input type="date" value={sDate} onChange={e=>setSDate(e.target.value)} style={{background:"rgba(255,255,255,0.08)",border:"1px solid rgba(212,175,55,0.3)",borderRadius:"10px",padding:"9px 14px",color:"white",fontSize:"0.78rem",fontFamily:"'Public Sans',sans-serif",direction:"ltr",outline:"none",cursor:"pointer",colorScheme:"dark"}}/>
            </div>
            <input value={sQ} onChange={e=>setSQ(e.target.value)} placeholder="🔍 Search student..." style={{width:"100%",padding:"9px 14px",borderRadius:"10px",border:"1px solid rgba(212,175,55,0.25)",background:"rgba(255,255,255,0.06)",color:"#f1f5f9",fontSize:"0.78rem",fontFamily:"'Public Sans',sans-serif",outline:"none",boxSizing:"border-box",colorScheme:"dark",marginBottom:"14px"}}/>
            <div style={{display:"flex",flexDirection:"column",gap:"2px"}}>
              {students.filter(s=>!sQ||s.name?.toLowerCase().includes(sQ.toLowerCase())).map(s=>{ const status=sAttendance[s.id]||"present"; const h=HOUSES.find(x=>x.id===s.houseId)||{}; return (
                <div key={s.id} className="hv-row" style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 16px",borderRadius:"12px",border:"1px solid transparent",transition:"all 0.15s ease"}}>
                  <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
                    <div style={{width:"34px",height:"34px",borderRadius:"50%",background:`${h.color||G}20`,border:`2px solid ${h.color||G}40`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.7rem",fontWeight:"700",color:h.color||G,fontFamily:"'Public Sans',sans-serif",flexShrink:0}}>{s.name?.[0]||"?"}</div>
                    <div>
                      <div style={{fontSize:"0.8rem",fontWeight:"600",color:"rgba(255,255,255,0.9)"}}>{s.name}</div>
                      <div style={{fontSize:"0.6rem",color:"rgba(255,255,255,0.35)",fontFamily:"'Public Sans',sans-serif"}}>{s.grade} • <span style={{color:h.color||G}}>{h.nameEn}</span></div>
                    </div>
                  </div>
                  <StatusPicker current={status} onChange={v=>setSStatus(s.id,v)} options={[["present","✅","Present","#34d399"],["late","⏰","Late","#fbbf24"],["absent","❌","Absent","#f87171"]]}/>
                </div>
              );})}
            </div>
            <button onClick={saveStudents} style={{width:"100%",marginTop:"20px",padding:"14px",borderRadius:"14px",border:"none",background:`linear-gradient(135deg,${G},#b8960a)`,color:"#0f172a",fontSize:"0.82rem",fontWeight:"800",cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:"8px"}}>
              <span className="material-symbols-rounded" style={{fontSize:"18px"}}>save</span>✅ All Save
            </button>
          </div>}

          {/* History table */}
          {sTab==="history"&&<div style={{...glass,padding:"24px"}}>
            <div style={{color:G,fontSize:"0.62rem",fontWeight:"700",letterSpacing:"0.15em",direction:"ltr",marginBottom:"16px"}}>ATTENDANCE HISTORY</div>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead><tr style={{background:"rgba(212,175,55,0.06)"}}><TH>Name</TH><TH>Date</TH><TH>Grade</TH><TH>Status</TH></tr></thead>
                <tbody>
                  {sRecords.filter(r=>r.type!=="teacher").slice(0,50).map(r=>(
                    <tr key={r.id} style={{transition:"background 0.15s"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.04)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                      <TD style={{fontWeight:"600",color:"rgba(255,255,255,0.9)"}}>{r.studentName||"—"}</TD>
                      <TD style={{direction:"ltr",fontFamily:"'Public Sans',monospace",fontSize:"0.68rem",color:"rgba(255,255,255,0.45)"}}>{r.date}</TD>
                      <TD style={{color:"rgba(255,255,255,0.55)",fontSize:"0.68rem"}}>{r.grade||"—"}</TD>
                      <TD><StatusBadge status={r.status}/></TD>
                    </tr>
                  ))}
                  {sRecords.length===0&&<tr><td colSpan={4}><EmptyState icon="📋" title="کوئی حاضری اندراج نہیں" subtitle="آج کی حاضری ابھی نہیں لگائی گئی" compact/></td></tr>}
                </tbody>
              </table>
            </div>
          </div>}

          {/* Report table */}
          {sTab==="report"&&<div style={{...glass,padding:"24px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"20px",flexWrap:"wrap",gap:"12px"}}>
              <div style={{color:G,fontSize:"0.62rem",fontWeight:"700",letterSpacing:"0.15em",direction:"ltr"}}>STUDENT ATTENDANCE REPORT</div>
              <PrintBtn onClick={()=>printStudentAttendance(students,sRecords)} label="Attendance Report PDF"/>
            </div>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead><tr style={{background:"rgba(212,175,55,0.06)"}}><TH>Name</TH><TH>Grade</TH><TH>Present</TH><TH>Absent</TH><TH>Late</TH><TH>Percentage</TH></tr></thead>
                <tbody>
                  {students.map(s=>{ const r=getStudentReport(s.id); const col=r.pct>=75?"#34d399":r.pct>=50?"#fbbf24":"#f87171"; return (
                    <tr key={s.id} onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.04)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"} style={{transition:"background 0.15s"}}>
                      <TD style={{fontWeight:"600",color:"rgba(255,255,255,0.9)"}}>{s.name}</TD>
                      <TD style={{color:"rgba(255,255,255,0.5)",fontSize:"0.68rem",fontFamily:"'Public Sans',sans-serif"}}>{s.grade}</TD>
                      <TD style={{color:"#34d399",fontWeight:"700",fontFamily:"'Public Sans',sans-serif"}}>{r.present}</TD>
                      <TD style={{color:"#f87171",fontWeight:"700",fontFamily:"'Public Sans',sans-serif"}}>{r.absent}</TD>
                      <TD style={{color:"#fbbf24",fontWeight:"700",fontFamily:"'Public Sans',sans-serif"}}>{r.late}</TD>
                      <TD>
                        <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
                          <div style={{flex:1,height:"5px",background:"rgba(255,255,255,0.08)",borderRadius:"3px",overflow:"hidden",minWidth:"50px"}}>
                            <div style={{width:`${r.pct}%`,height:"100%",background:col,borderRadius:"3px",transition:"width 0.4s ease"}}/>
                          </div>
                          <span style={{color:col,fontWeight:"800",fontSize:"0.72rem",fontFamily:"'Public Sans',sans-serif",minWidth:"36px",textAlign:"left"}}>{r.pct}%</span>
                        </div>
                      </TD>
                    </tr>
                  );})}
                </tbody>
              </table>
            </div>
          </div>}
        </div>}

        {/* ══ TEACHERS PANEL ══ */}
        {!isStudents&&<div>
          {tSaved&&<div style={{...glass,padding:"14px 20px",marginBottom:"16px",textAlign:"center",border:"1px solid rgba(52,211,153,0.3)",background:"rgba(52,211,153,0.1)"}}>
            <span className="material-symbols-rounded" style={{fontSize:"16px",color:"#34d399",verticalAlign:"middle",marginLeft:"6px"}}>check_circle</span>
            <span style={{color:"#34d399",fontWeight:"700",fontSize:"0.8rem"}}>Teacher attendance saved successfully!</span>
          </div>}

          {/* Sub-tab bar */}
          <div style={{display:"flex",gap:"8px",marginBottom:"20px",flexWrap:"wrap"}}>
            {[["mark","edit","Mark"],["history","history","History"],["report","analytics","Report"],["late","schedule","Late History"]].map(([t,icon,l])=>(
              <button key={t} onClick={()=>setTTab(t)} style={{padding:"9px 18px",borderRadius:"12px",border:`1px solid ${tTab===t?"rgba(212,175,55,0.5)":"rgba(255,255,255,0.1)"}`,cursor:"pointer",fontSize:"0.72rem",fontWeight:tTab===t?"700":"500",background:tTab===t?"rgba(212,175,55,0.15)":"rgba(255,255,255,0.05)",color:tTab===t?G:"rgba(255,255,255,0.5)",fontFamily:"inherit",display:"flex",alignItems:"center",gap:"6px",transition:"all 0.2s"}}>
                <span className="material-symbols-rounded" style={{fontSize:"15px"}}>{icon}</span>{l}
              </button>
            ))}
          </div>

          {/* Mark attendance */}
          {tTab==="mark"&&<div style={{...glass,padding:"24px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"20px",flexWrap:"wrap",gap:"12px"}}>
              <div>
                <div style={{color:G,fontSize:"0.62rem",fontWeight:"700",letterSpacing:"0.15em",direction:"ltr",marginBottom:"4px"}}>MARK ATTENDANCE</div>
                <div style={{color:"white",fontSize:"0.95rem",fontWeight:"700"}}>{teachers.length} Teachers</div>
              </div>
              <input type="date" value={tDate} onChange={e=>setTDate(e.target.value)} style={{background:"rgba(255,255,255,0.08)",border:"1px solid rgba(212,175,55,0.3)",borderRadius:"10px",padding:"9px 14px",color:"white",fontSize:"0.78rem",fontFamily:"'Public Sans',sans-serif",direction:"ltr",outline:"none",colorScheme:"dark"}}/>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:"2px"}}>
              {teachers.map(t=>{ const status=tAttendance[t.id]||"present"; return (
                <div key={t.id} className="hv-row" style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 16px",borderRadius:"12px",border:"1px solid transparent",transition:"all 0.15s ease"}}>
                  <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
                    <div style={{width:"34px",height:"34px",borderRadius:"50%",background:"rgba(212,175,55,0.15)",border:"2px solid rgba(212,175,55,0.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.7rem",fontWeight:"700",color:G,flexShrink:0}}>{t.name?.[0]||"?"}</div>
                    <div>
                      <div style={{fontSize:"0.8rem",fontWeight:"600",color:"rgba(255,255,255,0.9)"}}>{t.name}</div>
                      <div style={{fontSize:"0.6rem",color:"rgba(255,255,255,0.35)",fontFamily:"'Public Sans',sans-serif"}}>{t.subject||"—"}</div>
                    </div>
                  </div>
                  <StatusPicker current={status} onChange={v=>setTStatus(t.id,v)} options={[["present","✅","Present","#34d399"],["late","⏰","Late","#fbbf24"],["absent","❌","Absent","#f87171"],["leave","🏖️","Leave","#a78bfa"]]}/>
                </div>
              );})}
            </div>
            <button onClick={saveTeachers} style={{width:"100%",marginTop:"20px",padding:"14px",borderRadius:"14px",border:"none",background:`linear-gradient(135deg,${G},#b8960a)`,color:"#0f172a",fontSize:"0.82rem",fontWeight:"800",cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:"8px"}}>
              <span className="material-symbols-rounded" style={{fontSize:"18px"}}>save</span>✅ All Save
            </button>
          </div>}

          {/* History */}
          {tTab==="history"&&<div style={{...glass,padding:"24px"}}>
            <div style={{color:G,fontSize:"0.62rem",fontWeight:"700",letterSpacing:"0.15em",direction:"ltr",marginBottom:"16px"}}>TEACHER ATTENDANCE HISTORY</div>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead><tr style={{background:"rgba(212,175,55,0.06)"}}><TH>Name</TH><TH>Subject</TH><TH>Date</TH><TH>Status</TH></tr></thead>
                <tbody>
                  {tRecords.slice(0,50).map(r=>(
                    <tr key={r.id} onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.04)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"} style={{transition:"background 0.15s"}}>
                      <TD style={{fontWeight:"600",color:"rgba(255,255,255,0.9)"}}>{r.teacherName||"—"}</TD>
                      <TD style={{color:"rgba(255,255,255,0.45)",fontSize:"0.68rem"}}>{r.subject||"—"}</TD>
                      <TD style={{direction:"ltr",fontFamily:"'Public Sans',monospace",fontSize:"0.68rem",color:"rgba(255,255,255,0.35)"}}>{r.date}</TD>
                      <TD><StatusBadge status={r.status}/></TD>
                    </tr>
                  ))}
                  {tRecords.length===0&&<tr><td colSpan={4}><EmptyState icon="👨‍🏫" title="کوئی اندراج نہیں" subtitle="اساتذہ کی حاضری ابھی درج نہیں" compact/></td></tr>}
                </tbody>
              </table>
            </div>
          </div>}

          {/* Report */}
          {tTab==="report"&&<div style={{...glass,padding:"24px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"20px",flexWrap:"wrap",gap:"12px"}}>
              <div style={{color:G,fontSize:"0.62rem",fontWeight:"700",letterSpacing:"0.15em",direction:"ltr"}}>TEACHER ATTENDANCE REPORT</div>
              <PrintBtn onClick={()=>printTeacherAttendance(teachers,tRecords)} label="Teachers Report PDF"/>
            </div>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead><tr style={{background:"rgba(212,175,55,0.06)"}}><TH>Name</TH><TH>Subject</TH><TH>Present</TH><TH>Absent</TH><TH>Late</TH><TH>Leave</TH><TH>Percentage</TH></tr></thead>
                <tbody>
                  {teachers.map(t=>{ const r=getTeacherReport(t.id); const col=r.pct>=75?"#34d399":r.pct>=50?"#fbbf24":"#f87171"; const isSelected=selectedTeacher===t.id; return (
                    <tr key={t.id} onClick={()=>setSelectedTeacher(isSelected?null:t.id)} style={{cursor:"pointer",background:isSelected?"rgba(212,175,55,0.08)":"transparent",transition:"background 0.15s"}} onMouseEnter={e=>{if(!isSelected)e.currentTarget.style.background="rgba(255,255,255,0.04)"}} onMouseLeave={e=>{if(!isSelected)e.currentTarget.style.background="transparent"}}>
                      <TD style={{fontWeight:"600",color:"rgba(255,255,255,0.9)"}}>{t.name}</TD>
                      <TD style={{color:"rgba(255,255,255,0.45)",fontSize:"0.68rem"}}>{t.subject||"—"}</TD>
                      <TD style={{color:"#34d399",fontWeight:"700",fontFamily:"'Public Sans',sans-serif"}}>{r.present}</TD>
                      <TD style={{color:"#f87171",fontWeight:"700",fontFamily:"'Public Sans',sans-serif"}}>{r.absent}</TD>
                      <TD style={{color:"#fbbf24",fontWeight:"700",fontFamily:"'Public Sans',sans-serif"}}>{r.late}</TD>
                      <TD style={{color:"#a78bfa",fontWeight:"700",fontFamily:"'Public Sans',sans-serif"}}>{r.leave}</TD>
                      <TD>
                        <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
                          <div style={{flex:1,height:"5px",background:"rgba(255,255,255,0.08)",borderRadius:"3px",overflow:"hidden",minWidth:"40px"}}>
                            <div style={{width:`${r.pct}%`,height:"100%",background:col,borderRadius:"3px"}}/>
                          </div>
                          <span style={{color:col,fontWeight:"800",fontSize:"0.72rem",fontFamily:"'Public Sans',sans-serif"}}>{r.pct}%</span>
                        </div>
                      </TD>
                    </tr>
                  );})}
                </tbody>
              </table>
            </div>
            {/* Teacher detail panel */}
            {selectedTeacher&&selT&&selTR&&(
              <div style={{marginTop:"20px",...glassDeep,padding:"20px",border:"1px solid rgba(212,175,55,0.2)"}}>
                <div style={{color:G,fontSize:"0.62rem",fontWeight:"700",letterSpacing:"0.15em",direction:"ltr",marginBottom:"14px",display:"flex",alignItems:"center",gap:"6px"}}>
                  <span className="material-symbols-rounded" style={{fontSize:"14px"}}>person</span> {selT.name} — DETAILED REPORT
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(100px,1fr))",gap:"10px"}}>
                  {[{c:"#34d399",n:selTR.present,l:"Present"},{c:"#f87171",n:selTR.absent,l:"Absent"},{c:"#fbbf24",n:selTR.late,l:"Late"},{c:"#a78bfa",n:selTR.leave,l:"Leave"},{c:"#60a5fa",n:selTR.total,l:"Total Days"},{c:selTR.pct>=75?"#34d399":"#f87171",n:`${selTR.pct}%`,l:"Attendance"}].map((x,i)=>(
                    <div key={i} style={{background:`${x.c}12`,borderRadius:"12px",padding:"12px",textAlign:"center",border:`1px solid ${x.c}25`}}>
                      <div style={{fontSize:"1.2rem",fontWeight:"800",color:x.c,fontFamily:"'Public Sans',sans-serif"}}>{x.n}</div>
                      <div style={{fontSize:"0.58rem",color:"rgba(255,255,255,0.4)",marginTop:"3px"}}>{x.l}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>}

          {/* Late history */}
          {tTab==="late"&&<div>
            <div style={{color:"rgba(255,255,255,0.35)",fontSize:"0.68rem",marginBottom:"16px",fontFamily:"'Public Sans',sans-serif"}}>Click on a teacher card to view late history</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:"12px",marginBottom:"20px"}}>
              {teachers.map(t=>{ const lateCount=tRecords.filter(r=>r.teacherId===t.id&&r.status==="late").length; const col=lateCount>5?"#f87171":lateCount>2?"#fbbf24":"#34d399"; return (
                <div key={t.id} onClick={()=>setSelectedTeacher(selectedTeacher===t.id?null:t.id)} style={{...glassDeep,padding:"16px",cursor:"pointer",borderLeft:`3px solid ${col}`,background:selectedTeacher===t.id?"rgba(212,175,55,0.1)":"rgba(255,255,255,0.04)",transition:"all 0.2s ease"}}>
                  <div style={{fontWeight:"600",color:"rgba(255,255,255,0.85)",marginBottom:"3px",fontSize:"0.82rem"}}>{t.name}</div>
                  <div style={{fontSize:"0.62rem",color:"rgba(255,255,255,0.35)",fontFamily:"'Public Sans',sans-serif",marginBottom:"10px"}}>{t.subject||"—"}</div>
                  <div style={{fontSize:"1.6rem",fontWeight:"800",color:col,fontFamily:"'Public Sans',sans-serif",lineHeight:1}}>{lateCount}</div>
                  <div style={{fontSize:"0.58rem",color:"rgba(255,255,255,0.3)",fontFamily:"'Public Sans',sans-serif"}}>late arrivals</div>
                </div>
              );})}
            </div>
            {selectedTeacher&&<div style={{...glass,padding:"24px"}}>
              <div style={{color:"#fbbf24",fontSize:"0.78rem",fontWeight:"700",marginBottom:"16px",display:"flex",alignItems:"center",gap:"8px"}}>
                <span className="material-symbols-rounded" style={{fontSize:"18px"}}>schedule</span>
                {teachers.find(t=>t.id===selectedTeacher)?.name} — Late History
              </div>
              {getTeacherLateHistory(selectedTeacher).length===0
                ? <div style={{textAlign:"center",color:"rgba(255,255,255,0.2)",padding:"30px",fontSize:"0.78rem"}}>Any Late No — Well Done! 🎉</div>
                : <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
                    {getTeacherLateHistory(selectedTeacher).map((r,i)=>(
                      <div key={r.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"11px 16px",background:"rgba(251,191,36,0.06)",borderRadius:"10px",border:"1px solid rgba(251,191,36,0.15)"}}>
                        <span style={{fontSize:"0.72rem",fontWeight:"700",color:"#fbbf24",fontFamily:"'Public Sans',sans-serif",direction:"ltr"}}>#{i+1} — {r.date}</span>
                        <span style={{fontSize:"0.65rem",color:"rgba(255,255,255,0.35)"}}>{r.teacherName}</span>
                      </div>
                    ))}
                  </div>
              }
            </div>}
          </div>}
        </div>}

      </div>
    </div>
  );
}

export default Attendance;
