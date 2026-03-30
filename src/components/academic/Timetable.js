/* eslint-disable */
import { useState } from "react";
import letterhead from "../../assets/letterhead.png";

const TT_PRINT_STYLE = `
@media print {
  body * { visibility: hidden !important; }
  #tt-print-area, #tt-print-area * { visibility: visible !important; }
  #tt-print-area {
    position: fixed !important;
    top: 0; left: 0;
    width: 100%;
    background: white;
    padding: 0; margin: 0;
  }
  .no-print { display: none !important; }
  @page { margin: 0; size: A4 landscape; }
}
`;

function Timetable() {
  const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const DAYS_UR = { Monday:"پیر", Tuesday:"منگل", Wednesday:"بدھ", Thursday:"جمعرات", Friday:"جمعہ", Saturday:"ہفتہ" };

  const DEFAULT_CLASSES = [
    "Play Group","Nursery","KG","Grade 1","Grade 2","Grade 3",
    "Grade 4","Grade 5","Grade 6","Grade 7","Grade 8","Grade 9",
    "Grade 10 (Matric)","F.A/F.Sc Part 1","F.A/F.Sc Part 2"
  ];

  const DEFAULT_SUBJECTS = [
    "Quran Kareem","Hifz","Islamic Studies","Arabic","Urdu","English",
    "Mathematics","Science","Physics","Chemistry","Biology",
    "Computer","Social Studies","Pakistan Studies","History",
    "Geography","PE/Sports","Art","Assembly","Break","Dua & End"
  ];

  const DEFAULT_TIMES = [
    "7:30","8:15","9:00","9:45","10:30","11:15","12:00","12:45","1:30"
  ];

  // State
  const [classes, setClasses] = useState(DEFAULT_CLASSES);
  const [subjects, setSubjects] = useState(DEFAULT_SUBJECTS);
  const [times, setTimes] = useState(DEFAULT_TIMES);
  const [schedule, setSchedule] = useState({}); // {className: {day: [{time, subject}]}}
  const [selectedClass, setSelectedClass] = useState("Grade 6");
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [tab, setTab] = useState("view"); // view | edit | manage

  // New class/subject inputs
  const [newClass, setNewClass] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [newTime, setNewTime] = useState("");

  // Edit period
  const [editPeriods, setEditPeriods] = useState([]);

  // Load schedule for selected class+day into editPeriods
  const loadEdit = () => {
    const existing = schedule[selectedClass]?.[selectedDay] || [];
    if (existing.length > 0) {
      setEditPeriods([...existing]);
    } else {
      setEditPeriods([{ time: times[0], subject: subjects[0] }]);
    }
    setTab("edit");
  };

  // Save edited periods
  const saveSchedule = () => {
    const filtered = editPeriods.filter(p => p.subject && p.time);
    setSchedule(prev => ({
      ...prev,
      [selectedClass]: {
        ...(prev[selectedClass] || {}),
        [selectedDay]: filtered
      }
    }));
    setTab("view");
  };

  // Add period row
  const addPeriod = () => {
    setEditPeriods(prev => [...prev, { time: times[0] || "8:00", subject: subjects[0] || "" }]);
  };

  // Remove period row
  const removePeriod = (i) => {
    setEditPeriods(prev => prev.filter((_, idx) => idx !== i));
  };

  // Update period
  const updatePeriod = (i, field, val) => {
    setEditPeriods(prev => prev.map((p, idx) => idx === i ? { ...p, [field]: val } : p));
  };

  // Get periods for view
  const getPeriods = (cls, day) => schedule[cls]?.[day] || [];
  const currentPeriods = getPeriods(selectedClass, selectedDay);

  // Count filled days for a class
  const filledDays = (cls) => DAYS.filter(d => (schedule[cls]?.[d]||[]).length > 0).length;

  // Add new class
  const addClass = () => {
    if (!newClass.trim() || classes.includes(newClass.trim())) return;
    setClasses(prev => [...prev, newClass.trim()]);
    setNewClass("");
  };

  // Add new subject
  const addSubject = () => {
    if (!newSubject.trim() || subjects.includes(newSubject.trim())) return;
    setSubjects(prev => [...prev, newSubject.trim()]);
    setNewSubject("");
  };

  // Add new time
  const addTime = () => {
    if (!newTime.trim() || times.includes(newTime.trim())) return;
    setTimes(prev => [...prev, newTime.trim()].sort());
    setNewTime("");
  };

  // Remove class
  const removeClass = (cls) => {
    setClasses(prev => prev.filter(c => c !== cls));
    if (selectedClass === cls) setSelectedClass(classes[0] || "");
  };

  // Remove subject
  const removeSubject = (sub) => {
    setSubjects(prev => prev.filter(s => s !== sub));
  };


  const handlePrint = () => {
    if (!document.getElementById("tt-print-style")) {
      const s = document.createElement("style");
      s.id = "tt-print-style";
      s.innerHTML = TT_PRINT_STYLE;
      document.head.appendChild(s);
    }
    window.print();
  };

  const G="#d4af37"; const N="#0f172a"; const N2="#1e293b";
  const inp={width:"100%",padding:"10px 14px",borderRadius:"10px",border:"1px solid rgba(212,175,55,0.25)",background:"rgba(255,255,255,0.06)",color:"#f1f5f9",fontSize:"0.8rem",fontFamily:"'Public Sans',sans-serif",outline:"none",boxSizing:"border-box",direction:"ltr",colorScheme:"dark"};
  return (
    <>
    <div className="no-print" style={{minHeight:"100vh",background:"linear-gradient(160deg,#0f172a 0%,#0d1f3c 50%,#0a1628 100%)",padding:"24px 20px",fontFamily:"'Public Sans',sans-serif",direction:"ltr"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"24px",flexWrap:"wrap",gap:"12px"}}>
        <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
          <div style={{width:"44px",height:"44px",borderRadius:"12px",background:"linear-gradient(135deg,#d4af37,#b8960a)",display:"flex",alignItems:"center",justifyContent:"center"}}><span className="material-symbols-rounded" style={{fontSize:"24px",color:N}}>schedule</span></div>
          <div><h2 style={{margin:0,fontSize:"1.4rem",fontWeight:"800",color:"#f1f5f9"}}>Timetable</h2><p style={{margin:0,fontSize:"0.72rem",color:"rgba(212,175,55,0.7)"}}>{classes.length} Classes • {subjects.length} Subjects</p></div>
        </div>
        <div style={{display:"flex",gap:"6px",background:"rgba(255,255,255,0.05)",padding:"4px",borderRadius:"12px",border:"1px solid rgba(255,255,255,0.08)"}}>
          {[["view","visibility","دیکھیں"],["edit","edit","ترتیب"],["manage","settings","منظم"]].map(([t,ic,l]) =>
            <button key={t} onClick={() => setTab(t)} style={{display:"flex",alignItems:"center",gap:"5px",padding:"8px 14px",borderRadius:"9px",border:"none",cursor:"pointer",fontSize:"0.72rem",fontWeight:tab===t?"700":"400",background:tab===t?"linear-gradient(135deg,#d4af37,#b8960a)":"transparent",color:tab===t?N:"rgba(255,255,255,0.5)",fontFamily:"inherit"}}><span className="material-symbols-rounded" style={{fontSize:"15px"}}>{ic}</span>{l}</button>
          )}
        </div>
      </div>

      {/* Class Selector */}
      <div style={{background:"rgba(255,255,255,0.07)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:"16px",marginBottom:"14px",padding:"16px"}}>
        <div style={{fontSize:"0.65rem",color:"rgba(212,175,55,0.7)",marginBottom:"8px",fontWeight:"700"}}>📚 جماعت منتخب کریں</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:"6px"}}>
          {classes.map(cls => (
            <button key={cls} onClick={() => setSelectedClass(cls)} style={{
              padding:"6px 12px",borderRadius:"20px",border:`1px solid ${selectedClass===cls?"#d4af37":"rgba(255,255,255,0.15)"}`,
              background:selectedClass===cls?"linear-gradient(135deg,#d4af37,#b8960a)":"rgba(255,255,255,0.05)",
              color:selectedClass===cls?N:"rgba(255,255,255,0.7)",fontSize:"0.62rem",cursor:"pointer",fontFamily:"inherit",
              fontWeight:selectedClass===cls?"700":"400"
            }}>
              {cls}
              {filledDays(cls) > 0 && <span style={{ marginRight:"4px", fontSize:"0.5rem", opacity:0.8 }}>({filledDays(cls)}d)</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Day Selector */}
      <div style={{display:"flex",gap:"6px",marginBottom:"14px",flexWrap:"wrap"}}>
        {DAYS.map(d => (
          <button key={d} onClick={() => setSelectedDay(d)} style={{
            padding:"8px 14px",borderRadius:"10px",cursor:"pointer",fontSize:"0.65rem",
            fontWeight:selectedDay===d?"700":"400",
            background:selectedDay===d?"linear-gradient(135deg,#d4af37,#b8960a)":"rgba(255,255,255,0.05)",
            color:selectedDay===d?N:"rgba(255,255,255,0.6)",fontFamily:"inherit",
            border:`1px solid ${selectedDay===d?"#d4af37":"rgba(255,255,255,0.12)"}`
          }}>{DAYS_UR[d]}</button>
        ))}
      </div>

      {/* ======= VIEW TAB ======= */}
      {tab==="view" && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"12px" }}>
            <div style={{fontSize:"0.78rem",fontWeight:"700",color:"#f1f5f9"}}>{selectedClass} — {DAYS_UR[selectedDay]}</div>
            <div style={{display:"flex",gap:"8px"}}>
              <button onClick={handlePrint} style={{display:"flex",alignItems:"center",gap:"6px",padding:"8px 16px",borderRadius:"10px",border:"1px solid rgba(74,222,128,0.5)",background:"rgba(74,222,128,0.08)",color:"#4ade80",fontSize:"0.72rem",cursor:"pointer",fontFamily:"inherit",fontWeight:"700"}}><span className="material-symbols-rounded" style={{fontSize:"16px"}}>print</span>Print</button>
              <button onClick={loadEdit} style={{display:"flex",alignItems:"center",gap:"6px",padding:"8px 16px",borderRadius:"10px",border:"1px solid #d4af37",background:"transparent",color:"#d4af37",fontSize:"0.72rem",cursor:"pointer",fontFamily:"inherit",fontWeight:"700"}}><span className="material-symbols-rounded" style={{fontSize:"16px"}}>edit</span>ترمیم کریں</button>
            </div>
          </div>

          {/* Periods */}
          {currentPeriods.length === 0 ? (
            <div style={{background:"rgba(255,255,255,0.07)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:"16px",textAlign:"center",padding:"60px"}}>
              <span className="material-symbols-rounded" style={{fontSize:"48px",color:"rgba(212,175,55,0.3)",display:"block",marginBottom:"12px"}}>event_note</span>
              <div style={{fontSize:"0.72rem",color:"rgba(255,255,255,0.4)"}}>ابھی کوئی پیریڈ نہیں</div>
              <button onClick={loadEdit} style={{marginTop:"16px",padding:"8px 18px",borderRadius:"10px",border:"1px solid #d4af37",background:"transparent",color:"#d4af37",fontSize:"0.72rem",cursor:"pointer",fontFamily:"inherit",fontWeight:"700"}}>+ پیریڈ شامل کریں</button>
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
              {currentPeriods.map((p, i) => {
                const isBreak = p.subject.includes("Break") || p.subject.includes("Break") || p.subject.includes("Dua") || p.subject.includes("Assembly");
                return (
                  <div key={i} style={{display:"flex",alignItems:"center",gap:"14px",background:isBreak?"rgba(212,175,55,0.1)":"rgba(255,255,255,0.06)",borderRadius:"12px",padding:"12px 16px",border:`1px solid ${isBreak?"rgba(212,175,55,0.4)":"rgba(255,255,255,0.1)"}`}}>
                    <div style={{width:"32px",height:"32px",borderRadius:"50%",background:isBreak?"#d4af37":"rgba(96,165,250,0.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.65rem",fontWeight:"800",color:isBreak?N:"#60a5fa",flexShrink:0}}>{i+1}</div>
                    <div style={{background:isBreak?"rgba(212,175,55,0.2)":"rgba(96,165,250,0.1)",borderRadius:"8px",padding:"4px 10px",fontSize:"0.6rem",fontWeight:"700",color:isBreak?"#d4af37":"#60a5fa",direction:"ltr",minWidth:"50px",textAlign:"center"}}>{p.time}</div>
                    <div style={{fontSize:"0.75rem",fontWeight:isBreak?"700":"600",color:isBreak?"#d4af37":"#f1f5f9"}}>{p.subject}</div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Full Week Table */}
          <div style={{background:"rgba(255,255,255,0.07)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:"16px",marginTop:"20px",overflow:"hidden"}}>
            <div style={{fontSize:"0.78rem",fontWeight:"700",color:G,marginBottom:"14px",padding:"16px 16px 0"}}>{selectedClass} — مکمل ہفتہ</div>
            <div style={{overflowX:"auto"}}>
              <table style={{ width:"100%", borderCollapse:"collapse", minWidth:"500px" }}>
                <thead>
                  <tr>
                    <th style={{padding:"12px 14px",textAlign:"left",fontSize:"0.65rem",color:"rgba(212,175,55,0.8)",background:"rgba(255,255,255,0.04)",fontWeight:"700"}}>پیریڈ</th>
                    {DAYS.map(d => <th key={d} style={{padding:"12px 14px",textAlign:"left",fontSize:"0.65rem",color:"rgba(212,175,55,0.8)",background:"rgba(255,255,255,0.04)",fontWeight:"700"}}>{DAYS_UR[d]}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {[0,1,2,3,4,5,6,7].map(i => (
                    <tr key={i} style={{background:i%2===0?"rgba(255,255,255,0.03)":"transparent"}}>
                      <td style={{padding:"10px 14px",textAlign:"center",color:G,fontWeight:"800",fontSize:"0.65rem"}}>{i+1}</td>
                      {DAYS.map(d => {
                        const p = (schedule[selectedClass]?.[d]||[])[i];
                        return <td key={d} style={{padding:"10px 14px",fontSize:"0.6rem",textAlign:"center",color:"rgba(255,255,255,0.7)",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>{p ? `${p.subject} (${p.time})` : "—"}</td>;
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======= EDIT TAB ======= */}
      {tab==="edit" && (
        <div style={{background:"rgba(255,255,255,0.07)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",border:"1px solid rgba(212,175,55,0.3)",borderRadius:"16px",padding:"24px"}}>
          <div style={{fontSize:"0.9rem",fontWeight:"700",color:G,marginBottom:"16px"}}>✏️ {selectedClass} — {DAYS_UR[selectedDay]} — پیریڈ ترتیب</div>
          {editPeriods.map((p, i) => (
            <div key={i} style={{display:"flex",gap:"8px",alignItems:"center",marginBottom:"10px"}}>
              <div style={{width:"28px",height:"28px",borderRadius:"50%",background:"linear-gradient(135deg,#d4af37,#b8960a)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.6rem",fontWeight:"800",color:N,flexShrink:0}}>{i+1}</div>
              <select value={p.time} onChange={e => updatePeriod(i,"time",e.target.value)} style={{...inp,width:"90px",direction:"ltr",fontSize:"0.65rem"}}>
                {times.map(t => <option key={t} value={t} style={{background:N2}}>{t}</option>)}
              </select>
              <select value={p.subject} onChange={e => updatePeriod(i,"subject",e.target.value)} style={{...inp,flex:1,fontSize:"0.65rem"}}>
                {subjects.map(s => <option key={s} value={s} style={{background:N2}}>{s}</option>)}
              </select>
              <button onClick={() => removePeriod(i)} style={{background:"rgba(248,113,113,0.15)",color:"#f87171",border:"1px solid rgba(248,113,113,0.3)",borderRadius:"8px",padding:"6px 10px",cursor:"pointer",fontSize:"0.7rem",flexShrink:0}}>✕</button>
            </div>
          ))}
          <div style={{display:"flex",gap:"10px",marginTop:"14px"}}>
            <button onClick={addPeriod} style={{flex:1,padding:"10px",borderRadius:"10px",border:"1px solid #d4af37",background:"transparent",color:"#d4af37",fontWeight:"700",cursor:"pointer",fontFamily:"inherit",fontSize:"0.75rem"}}>+ پیریڈ شامل کریں</button>
            <button onClick={saveSchedule} style={{flex:1,background:"linear-gradient(135deg,#d4af37,#b8960a)",color:N,border:"none",borderRadius:"10px",padding:"10px",cursor:"pointer",fontWeight:"700",fontFamily:"inherit",fontSize:"0.75rem"}}>✓ محفوظ کریں</button>
          </div>
        </div>
      )}

      {/* ======= MANAGE TAB ======= */}
      {tab==="manage" && (
        <div style={{display:"flex",flexDirection:"column",gap:"14px"}}>
          <div style={{background:"rgba(255,255,255,0.07)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:"16px",padding:"20px"}}>
            <div style={{fontSize:"0.78rem",fontWeight:"700",color:G,marginBottom:"12px"}}>📚 جماعتیں</div>
            <div style={{display:"flex",gap:"8px",marginBottom:"12px"}}>
              <input style={{...inp,flex:1}} value={newClass} onChange={e=>setNewClass(e.target.value)} placeholder="نئی جماعت مثلاً گریڈ 11"/>
              <button onClick={addClass} style={{background:"linear-gradient(135deg,#d4af37,#b8960a)",color:N,border:"none",borderRadius:"10px",padding:"8px 16px",cursor:"pointer",fontWeight:"700",fontFamily:"inherit"}}>+ شامل کریں</button>
            </div>
            <div style={{display:"flex",flexWrap:"wrap",gap:"6px"}}>
              {classes.map(cls => (
                <div key={cls} style={{display:"flex",alignItems:"center",gap:"4px",background:"rgba(96,165,250,0.1)",borderRadius:"20px",padding:"4px 10px",border:"1px solid rgba(96,165,250,0.3)"}}>
                  <span style={{fontSize:"0.62rem",color:"#60a5fa",fontWeight:"600"}}>{cls}</span>
                  <button onClick={() => removeClass(cls)} style={{background:"none",border:"none",color:"#f87171",cursor:"pointer",fontSize:"0.6rem",padding:"0 2px"}}>✕</button>
                </div>
              ))}
            </div>
          </div>

          <div style={{background:"rgba(255,255,255,0.07)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:"16px",padding:"20px"}}>
            <div style={{fontSize:"0.78rem",fontWeight:"700",color:G,marginBottom:"12px"}}>📖 مضامین</div>
            <div style={{display:"flex",gap:"8px",marginBottom:"12px"}}>
              <input style={{...inp,flex:1}} value={newSubject} onChange={e=>setNewSubject(e.target.value)} placeholder="نیا مضمون مثلاً عربی گرامر"/>
              <button onClick={addSubject} style={{background:"linear-gradient(135deg,#d4af37,#b8960a)",color:N,border:"none",borderRadius:"10px",padding:"8px 16px",cursor:"pointer",fontWeight:"700",fontFamily:"inherit"}}>+ شامل کریں</button>
            </div>
            <div style={{display:"flex",flexWrap:"wrap",gap:"6px"}}>
              {subjects.map(sub => (
                <div key={sub} style={{display:"flex",alignItems:"center",gap:"4px",background:"rgba(20,184,166,0.1)",borderRadius:"20px",padding:"4px 10px",border:"1px solid rgba(20,184,166,0.3)"}}>
                  <span style={{fontSize:"0.62rem",color:"#2dd4bf",fontWeight:"600"}}>{sub}</span>
                  <button onClick={() => removeSubject(sub)} style={{background:"none",border:"none",color:"#f87171",cursor:"pointer",fontSize:"0.6rem",padding:"0 2px"}}>✕</button>
                </div>
              ))}
            </div>
          </div>

          <div style={{background:"rgba(255,255,255,0.07)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:"16px",padding:"20px"}}>
            <div style={{fontSize:"0.78rem",fontWeight:"700",color:G,marginBottom:"12px"}}>⏰ اوقات</div>
            <div style={{display:"flex",gap:"8px",marginBottom:"12px"}}>
              <input style={{...inp,flex:1,direction:"ltr"}} value={newTime} onChange={e=>setNewTime(e.target.value)} placeholder="نیا وقت مثلاً 2:00"/>
              <button onClick={addTime} style={{background:"linear-gradient(135deg,#d4af37,#b8960a)",color:N,border:"none",borderRadius:"10px",padding:"8px 16px",cursor:"pointer",fontWeight:"700",fontFamily:"inherit"}}>+ شامل کریں</button>
            </div>
            <div style={{display:"flex",flexWrap:"wrap",gap:"6px"}}>
              {times.map(t => (
                <span key={t} style={{background:"rgba(212,175,55,0.15)",borderRadius:"20px",padding:"4px 12px",fontSize:"0.62rem",color:G,fontWeight:"600",border:"1px solid rgba(212,175,55,0.3)"}}>{t}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>

    {/* ── Hidden print area ── */}
    <div id="tt-print-area" style={{position:"absolute",left:"-9999px",top:0,width:"297mm",background:"#fff",fontFamily:"'Segoe UI',Arial,serif",direction:"ltr",color:"#0f172a"}}>
      <img src={letterhead} alt="" style={{width:"100%",display:"block"}}/>
      <div style={{padding:"12px 32px 28px"}}>
        <div style={{textAlign:"center",borderBottom:"2px solid #b7860b",paddingBottom:"10px",marginBottom:"16px"}}>
          <div style={{fontSize:"1.1rem",fontWeight:"800",color:"#7a5807",fontFamily:"'Noto Nastaliq Urdu',serif"}}>نظام الاوقات — {selectedClass} — {new Date().getFullYear()}-{new Date().getFullYear()+1}</div>
          <div style={{fontSize:"0.68rem",color:"#888",fontFamily:"'Public Sans',sans-serif",marginTop:"3px"}}>تعلیمی سال {new Date().getFullYear()}-{new Date().getFullYear()+1}</div>
        </div>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead>
            <tr style={{background:"#f5e9c8"}}>
              <th style={{padding:"8px 10px",border:"1px solid #b7860b",fontSize:"0.68rem",textAlign:"center",color:"#7a5807",fontWeight:"800"}}>پیریڈ</th>
              {DAYS.map(d=><th key={d} style={{padding:"8px 10px",border:"1px solid #b7860b",fontSize:"0.68rem",color:"#7a5807",fontWeight:"800",textAlign:"center"}}>{DAYS_UR[d]}</th>)}
            </tr>
          </thead>
          <tbody>
            {[0,1,2,3,4,5,6,7].map(i=>(
              <tr key={i} style={{background:i%2===0?"#fffdf8":"#fff"}}>
                <td style={{padding:"7px 10px",border:"1px solid #f0ede8",textAlign:"center",fontWeight:"800",color:"#b7860b",fontSize:"0.68rem"}}>{i+1}</td>
                {DAYS.map(d=>{
                  const p=(schedule[selectedClass]?.[d]||[])[i];
                  const isBreak=p&&(p.subject.includes("Break")||p.subject.includes("Dua")||p.subject.includes("Assembly"));
                  return <td key={d} style={{padding:"7px 10px",border:"1px solid #f0ede8",textAlign:"center",fontSize:"0.65rem",color:isBreak?"#7a5807":"#1e293b",fontWeight:isBreak?"700":"400",background:isBreak?"#fef9e7":"inherit"}}>{p?`${p.subject} (${p.time})`:"—"}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{marginTop:"40px",display:"flex",justifyContent:"space-between",alignItems:"flex-end",paddingTop:"10px",borderTop:"1px solid #f0ede8"}}>
          <div style={{textAlign:"center",minWidth:"180px"}}>
            <div style={{borderTop:"1.5px solid #0f172a",paddingTop:"8px",fontSize:"0.68rem",color:"#444",fontWeight:"600",fontFamily:"'Noto Nastaliq Urdu',serif"}}>پرنسپل کا دستخط</div>
          </div>
          <div style={{textAlign:"center",fontSize:"0.6rem",color:"#aaa",fontFamily:"'Public Sans',sans-serif"}}>
            <div>Printed on: {new Date().toLocaleDateString("en-PK",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</div>
            <div style={{marginTop:"4px"}}>Ameen Islamic Institute • Shin, Nawa Kalay, Swat</div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

export default Timetable;
