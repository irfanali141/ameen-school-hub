/* eslint-disable */
import { useState, useEffect } from "react";
import { C, S, hBadge } from "../../constants";
import { db, collection, onSnapshot, query, orderBy, limit } from "../../firebase";

function MarksEntry({students,addData}){
  const G="#d4af37"; const N="#0f172a"; const N2="#1e293b";
  const glass={background:"rgba(255,255,255,0.07)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:"16px"};
  const [exams,setExams]=useState([]); const [marks,setMarks]=useState([]);
  const [show,setShow]=useState(false); const [selExam,setSelExam]=useState(null); const [tab,setTab]=useState("exams");
  const [f,setF]=useState({title:"",subject:"",grade:"",date:"",totalMarks:100,type:"monthly"});
  const [bulk,setBulk]=useState({}); const [saving,setSaving]=useState(false);
  useEffect(()=>{
    const u1=onSnapshot(query(collection(db,"assessments"),orderBy("createdAt","desc"),limit(30)),s=>setExams(s.docs.map(d=>({id:d.id,...d.data()}))));
    const u2=onSnapshot(query(collection(db,"assessment_marks"),orderBy("createdAt","desc"),limit(200)),s=>setMarks(s.docs.map(d=>({id:d.id,...d.data()}))));
    return()=>{u1();u2();};
  },[]);
  const addExam=async()=>{ if(!f.title)return; await addData("assessments",{...f,totalMarks:Number(f.totalMarks)}); setShow(false); setF({title:"",subject:"",grade:"",date:"",totalMarks:100,type:"monthly"}); };
  const saveBulkMarks=async()=>{
    if(!selExam)return; setSaving(true);
    const saves=Object.entries(bulk).filter(([,v])=>v!=="").map(([sid,ob])=>{ const pct=Math.round((Number(ob)/selExam.totalMarks)*100); const gr=pct>=90?"A+":pct>=80?"A":pct>=70?"B":pct>=60?"C":pct>=50?"D":"F"; return addData("assessment_marks",{examId:selExam.id,studentId:sid,obtained:Number(ob),total:selExam.totalMarks,percentage:pct,grade:gr}); });
    await Promise.all(saves); setBulk({}); setSaving(false);
  };
  const classStudents=selExam?students.filter(s=>!selExam.grade||s.grade===selExam.grade):[];
  const types={monthly:{c:"#60a5fa",l:"ماہانہ"},midterm:{c:"#fb923c",l:"وسط سال"},annual:{c:G,l:"سالانہ"},unit:{c:"#4ade80",l:"یونٹ"},quiz:{c:"#a78bfa",l:"کوئز"}};
  const gradeColor=(pct)=>pct>=70?"#4ade80":pct>=50?"#fb923c":"#f87171";
  const gradeGlow=(pct)=>pct>=70?"rgba(74,222,128,0.2)":pct>=50?"rgba(251,146,60,0.2)":"rgba(248,113,113,0.2)";
  const inp={width:"100%",padding:"10px 14px",borderRadius:"10px",border:"1px solid rgba(212,175,55,0.25)",background:"rgba(255,255,255,0.06)",color:"#f1f5f9",fontSize:"0.8rem",fontFamily:"'Public Sans',sans-serif",outline:"none",boxSizing:"border-box",direction:"rtl",colorScheme:"dark"};
  const lbl={fontSize:"0.7rem",color:"rgba(212,175,55,0.8)",marginBottom:"6px",display:"block",fontWeight:"600"};

  /* derived stats for selected exam */
  const selMarks=selExam?marks.filter(m=>m.examId===selExam.id):[];
  const pcts=selMarks.map(m=>m.percentage||0);
  const statAvg=pcts.length?Math.round(pcts.reduce((a,b)=>a+b,0)/pcts.length):null;
  const statHigh=pcts.length?Math.max(...pcts):null;
  const statLow=pcts.length?Math.min(...pcts):null;
  const enteredCount=classStudents.filter(s=>marks.some(m=>m.examId===selExam?.id&&m.studentId===s.id)).length;

  return (
    <div style={{minHeight:"100vh",background:`linear-gradient(160deg,${N} 0%,#0d1f3c 50%,#0a1628 100%)`,padding:"24px 20px",fontFamily:"'Public Sans',sans-serif",direction:"rtl"}}>

      {/* ── Header ── */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"28px",flexWrap:"wrap",gap:"12px"}}>
        <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
          <div style={{width:"44px",height:"44px",borderRadius:"12px",background:`linear-gradient(135deg,${G},#b8960a)`,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 4px 20px rgba(212,175,55,0.4)`}}>
            <span className="material-symbols-rounded" style={{fontSize:"24px",color:N}}>edit_square</span>
          </div>
          <div>
            <h1 style={{margin:0,fontSize:"1.5rem",fontWeight:"800",color:"#f1f5f9",letterSpacing:"-0.5px"}}>نمبرات درج</h1>
            <p style={{margin:0,fontSize:"0.75rem",color:"rgba(212,175,55,0.7)",fontWeight:"500"}}>Marks Entry & Assessment</p>
          </div>
        </div>
        <button onClick={()=>setShow(!show)} style={{display:"flex",alignItems:"center",gap:"8px",padding:"11px 22px",borderRadius:"12px",border:`1px solid ${G}`,background:show?"rgba(212,175,55,0.15)":"transparent",color:G,fontWeight:"700",fontSize:"0.85rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif"}}>
          <span className="material-symbols-rounded" style={{fontSize:"20px"}}>{show?"close":"add_circle"}</span>
          {show?"منسوخ":"نیا امتحان"}
        </button>
      </div>

      {/* ── Add Exam Form ── */}
      {show&&(
        <div style={{...glass,padding:"24px",marginBottom:"24px",borderColor:"rgba(212,175,55,0.3)"}}>
          <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"20px"}}>
            <span className="material-symbols-rounded" style={{color:G,fontSize:"22px"}}>add_circle</span>
            <span style={{color:G,fontWeight:"700",fontSize:"1rem"}}>نئے امتحان کا اندراج</span>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px",marginBottom:"16px"}}>
            <div style={{gridColumn:"1/-1"}}><label style={lbl}>امتحان کا نام *</label><input style={inp} value={f.title} onChange={e=>setF({...f,title:e.target.value})} placeholder="ماہانہ ٹیسٹ — اپریل..."/></div>
            <div><label style={lbl}>مضمون</label><input style={inp} value={f.subject} onChange={e=>setF({...f,subject:e.target.value})} placeholder="ریاضی..."/></div>
            <div><label style={lbl}>جماعت</label><select style={inp} value={f.grade} onChange={e=>setF({...f,grade:e.target.value})}>
              <option value="" style={{background:N2}}>-- تمام جماعتیں --</option>
              {["Grade 6","Grade 7","Grade 8","Grade 9"].map(g=><option key={g} value={g} style={{background:N2}}>{g}</option>)}
            </select></div>
            <div><label style={lbl}>تاریخ</label><input style={{...inp,direction:"ltr"}} type="date" value={f.date} onChange={e=>setF({...f,date:e.target.value})}/></div>
            <div><label style={lbl}>کل نمبر</label><input style={{...inp,direction:"ltr"}} type="number" value={f.totalMarks} onChange={e=>setF({...f,totalMarks:e.target.value})}/></div>
            <div style={{gridColumn:"1/-1"}}><label style={lbl}>قسم</label>
              <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
                {Object.entries(types).map(([k,v])=>(
                  <button key={k} onClick={()=>setF({...f,type:k})} style={{padding:"8px 16px",borderRadius:"8px",border:`1px solid ${f.type===k?v.c:"rgba(255,255,255,0.12)"}`,background:f.type===k?`${v.c}20`:"transparent",color:f.type===k?v.c:"rgba(241,245,249,0.5)",fontWeight:"600",fontSize:"0.78rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif"}}>{v.l}</button>
                ))}
              </div>
            </div>
          </div>
          <div style={{display:"flex",gap:"10px",justifyContent:"flex-end"}}>
            <button onClick={()=>setShow(false)} style={{padding:"10px 20px",borderRadius:"10px",border:"1px solid rgba(255,255,255,0.15)",background:"transparent",color:"rgba(241,245,249,0.6)",fontWeight:"600",fontSize:"0.82rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif"}}>منسوخ</button>
            <button onClick={addExam} style={{display:"flex",alignItems:"center",gap:"8px",padding:"10px 24px",borderRadius:"10px",border:"none",background:`linear-gradient(135deg,${G},#b8960a)`,color:N,fontWeight:"700",fontSize:"0.82rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif"}}>
              <span className="material-symbols-rounded" style={{fontSize:"18px"}}>save</span>امتحان شامل کریں
            </button>
          </div>
        </div>
      )}

      {/* ── Tabs ── */}
      <div style={{display:"flex",gap:"6px",marginBottom:"24px",background:"rgba(255,255,255,0.04)",borderRadius:"12px",padding:"4px",width:"fit-content"}}>
        {[["exams","library_books","امتحانات"],["entry","edit","نمبرات درج"]].map(([t,ic,l])=>(
          <button key={t} onClick={()=>setTab(t)} style={{display:"flex",alignItems:"center",gap:"6px",padding:"9px 18px",borderRadius:"9px",border:"none",cursor:"pointer",fontWeight:tab===t?"700":"500",fontSize:"0.8rem",background:tab===t?`linear-gradient(135deg,${G},#b8960a)`:"transparent",color:tab===t?N:"rgba(241,245,249,0.5)",fontFamily:"'Public Sans',sans-serif",transition:"all 0.2s"}}>
            <span className="material-symbols-rounded" style={{fontSize:"17px"}}>{ic}</span>{l}
          </button>
        ))}
      </div>

      {/* ── Exams Grid Tab ── */}
      {tab==="exams"&&(
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(270px,1fr))",gap:"16px"}}>
          {exams.map(ex=>{
            const tc=types[ex.type]||types.monthly;
            const exMarks=marks.filter(m=>m.examId===ex.id);
            const avg=exMarks.length>0?Math.round(exMarks.reduce((s,m)=>s+(m.percentage||0),0)/exMarks.length):null;
            return (
              <div key={ex.id} className="hv-card" style={{...glass,padding:"20px",cursor:"pointer",borderTop:`3px solid ${tc.c}`,position:"relative",overflow:"hidden"}} onClick={()=>{setSelExam(ex);setTab("entry");}}>
                <div style={{position:"absolute",top:"-15px",left:"-15px",width:"70px",height:"70px",borderRadius:"50%",background:`${tc.c}12`,pointerEvents:"none"}}/>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"10px"}}>
                  <div style={{flex:1,marginLeft:"8px"}}>
                    <div style={{fontSize:"0.9rem",fontWeight:"700",color:"#f1f5f9",marginBottom:"4px"}}>{ex.title}</div>
                    <div style={{fontSize:"0.68rem",color:"rgba(241,245,249,0.4)"}}>{ex.subject||"—"}{ex.grade?` • ${ex.grade}`:""}</div>
                  </div>
                  <span style={{padding:"4px 10px",borderRadius:"20px",fontSize:"0.6rem",fontWeight:"700",background:`${tc.c}20`,color:tc.c,border:`1px solid ${tc.c}40`,flexShrink:0}}>{tc.l}</span>
                </div>
                {avg!==null&&(
                  <div style={{marginBottom:"12px"}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:"5px"}}>
                      <span style={{fontSize:"0.62rem",color:"rgba(241,245,249,0.4)"}}>اوسط کارکردگی</span>
                      <span style={{fontSize:"0.72rem",fontWeight:"700",color:gradeColor(avg)}}>{avg}%</span>
                    </div>
                    <div style={{height:"5px",borderRadius:"3px",background:"rgba(255,255,255,0.08)",overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${avg}%`,borderRadius:"3px",background:`linear-gradient(90deg,${gradeColor(avg)},${gradeColor(avg)}aa)`}}/>
                    </div>
                  </div>
                )}
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <div style={{fontSize:"0.65rem",color:"rgba(212,175,55,0.6)"}}>{exMarks.length} طلبا کے نمبر</div>
                  <div style={{display:"flex",alignItems:"center",gap:"4px",fontSize:"0.65rem",color:`rgba(${tc.c.replace("#","").match(/.{2}/g).map(h=>parseInt(h,16)).join(",")},0.8)`}}>
                    <span className="material-symbols-rounded" style={{fontSize:"14px"}}>arrow_back</span>نمبرات درج
                  </div>
                </div>
              </div>
            );
          })}
          {exams.length===0&&(
            <div style={{...glass,padding:"60px 20px",textAlign:"center",gridColumn:"1/-1"}}>
              <span className="material-symbols-rounded" style={{fontSize:"48px",color:"rgba(212,175,55,0.3)",display:"block",marginBottom:"12px"}}>library_books</span>
              <div style={{color:"rgba(241,245,249,0.4)",fontSize:"0.9rem"}}>کوئی امتحان نہیں — اوپر "+ نیا امتحان" بٹن سے شامل کریں</div>
            </div>
          )}
        </div>
      )}

      {/* ── Marks Entry Tab ── */}
      {tab==="entry"&&(
        <div>
          {/* Exam selector */}
          <div style={{...glass,padding:"16px 20px",marginBottom:"20px",display:"flex",gap:"12px",alignItems:"center",flexWrap:"wrap"}}>
            <span className="material-symbols-rounded" style={{color:`rgba(212,175,55,0.7)`,fontSize:"20px",flexShrink:0}}>search</span>
            <select style={{...inp,flex:1,minWidth:"220px"}} value={selExam?.id||""} onChange={e=>setSelExam(exams.find(x=>x.id===e.target.value)||null)}>
              <option value="" style={{background:N2}}>-- امتحان منتخب کریں --</option>
              {exams.map(ex=><option key={ex.id} value={ex.id} style={{background:N2}}>{ex.title}{ex.grade?` (${ex.grade})`:""}</option>)}
            </select>
          </div>

          {!selExam&&(
            <div style={{...glass,padding:"60px 20px",textAlign:"center"}}>
              <span className="material-symbols-rounded" style={{fontSize:"48px",color:"rgba(212,175,55,0.3)",display:"block",marginBottom:"12px"}}>edit_square</span>
              <div style={{color:"rgba(241,245,249,0.4)",fontSize:"0.9rem"}}>اوپر سے امتحان منتخب کریں</div>
            </div>
          )}

          {selExam&&(
            <div>
              {/* Exam info banner */}
              <div style={{...glass,padding:"18px 20px",marginBottom:"16px",borderColor:`rgba(212,175,55,0.3)`,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"12px"}}>
                <div>
                  <div style={{fontSize:"1rem",fontWeight:"700",color:"#f1f5f9",marginBottom:"4px"}}>{selExam.title}</div>
                  <div style={{fontSize:"0.72rem",color:"rgba(212,175,55,0.7)"}}>{selExam.subject||"—"}{selExam.grade?` • ${selExam.grade}`:""} • کل نمبر: {selExam.totalMarks}</div>
                </div>
                <div style={{display:"flex",gap:"10px"}}>
                  <div style={{textAlign:"center"}}>
                    <div style={{fontSize:"0.6rem",color:"rgba(241,245,249,0.4)",marginBottom:"2px"}}>مکمل</div>
                    <div style={{fontSize:"1.1rem",fontWeight:"800",color:"#4ade80"}}>{enteredCount}/{classStudents.length}</div>
                  </div>
                </div>
              </div>

              {/* Stats cards — only show when marks exist */}
              {selMarks.length>0&&(
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"12px",marginBottom:"20px"}}>
                  {[
                    {icon:"trending_up",label:"اعلی نمبر",val:`${statHigh}%`,color:"#4ade80"},
                    {icon:"show_chart",label:"اوسط",val:`${statAvg}%`,color:G},
                    {icon:"trending_down",label:"کم نمبر",val:`${statLow}%`,color:"#f87171"},
                  ].map(s=>(
                    <div key={s.label} className="hv-stat" style={{...glass,padding:"16px",textAlign:"center"}}>
                      <span className="material-symbols-rounded" style={{fontSize:"22px",color:s.color,display:"block",marginBottom:"6px"}}>{s.icon}</span>
                      <div style={{fontSize:"1.3rem",fontWeight:"800",color:s.color,marginBottom:"3px"}}>{s.val}</div>
                      <div style={{fontSize:"0.65rem",color:"rgba(241,245,249,0.4)"}}>{s.label}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Marks entry table */}
              <div style={{...glass,overflow:"hidden"}}>
                <div style={{padding:"16px 20px",borderBottom:"1px solid rgba(255,255,255,0.08)",display:"flex",alignItems:"center",gap:"8px"}}>
                  <span className="material-symbols-rounded" style={{color:G,fontSize:"20px"}}>edit</span>
                  <span style={{color:"#f1f5f9",fontWeight:"700",fontSize:"0.9rem"}}>نمبرات درج کریں</span>
                </div>
                <div style={{overflowX:"auto"}}>
                  <table style={{width:"100%",borderCollapse:"collapse"}}>
                    <thead>
                      <tr style={{background:"rgba(255,255,255,0.04)"}}>
                        <th style={{padding:"12px 20px",textAlign:"right",fontSize:"0.68rem",fontWeight:"700",color:"rgba(212,175,55,0.8)",borderBottom:"1px solid rgba(255,255,255,0.08)"}}>طالب علم</th>
                        <th style={{padding:"12px 12px",textAlign:"center",fontSize:"0.68rem",fontWeight:"700",color:"rgba(212,175,55,0.8)",borderBottom:"1px solid rgba(255,255,255,0.08)",direction:"ltr"}}>کوڈ</th>
                        <th style={{padding:"12px 20px",textAlign:"center",fontSize:"0.68rem",fontWeight:"700",color:"rgba(212,175,55,0.8)",borderBottom:"1px solid rgba(255,255,255,0.08)"}}>نمبر / {selExam.totalMarks}</th>
                        <th style={{padding:"12px 20px",textAlign:"center",fontSize:"0.68rem",fontWeight:"700",color:"rgba(212,175,55,0.8)",borderBottom:"1px solid rgba(255,255,255,0.08)"}}>فیصد / گریڈ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {classStudents.map((s,i)=>{
                        const existing=marks.find(m=>m.examId===selExam.id&&m.studentId===s.id);
                        const bulkVal=bulk[s.id]||"";
                        const previewPct=bulkVal!==""?Math.round((Number(bulkVal)/selExam.totalMarks)*100):null;
                        const previewGr=previewPct!=null?(previewPct>=90?"A+":previewPct>=80?"A":previewPct>=70?"B":previewPct>=60?"C":previewPct>=50?"D":"F"):null;
                        return (
                          <tr key={s.id} style={{borderBottom:"1px solid rgba(255,255,255,0.05)",background:existing?"rgba(74,222,128,0.04)":i%2===0?"rgba(255,255,255,0.02)":"transparent",transition:"background 0.15s"}}>
                            <td style={{padding:"12px 20px"}}>
                              <div style={{fontWeight:"700",color:"#f1f5f9",fontSize:"0.82rem"}}>{s.name}</div>
                              <div style={{fontSize:"0.6rem",color:"rgba(241,245,249,0.35)",marginTop:"2px"}}>{s.grade}</div>
                            </td>
                            <td style={{padding:"12px",textAlign:"center",fontFamily:"monospace",fontSize:"0.65rem",color:"rgba(212,175,55,0.6)",direction:"ltr"}}>{s.studentCode||"—"}</td>
                            <td style={{padding:"12px 20px",textAlign:"center"}}>
                              {existing?(
                                <div style={{display:"inline-flex",alignItems:"center",gap:"6px",padding:"6px 14px",borderRadius:"8px",background:gradeGlow(existing.percentage),border:`1px solid ${gradeColor(existing.percentage)}40`}}>
                                  <span style={{fontWeight:"800",color:gradeColor(existing.percentage),fontSize:"0.9rem",direction:"ltr"}}>{existing.obtained}</span>
                                  <span style={{color:"rgba(241,245,249,0.3)",fontSize:"0.7rem"}}>/{selExam.totalMarks}</span>
                                  <span className="material-symbols-rounded" style={{fontSize:"14px",color:"#4ade80"}}>check_circle</span>
                                </div>
                              ):(
                                <input
                                  type="number" min="0" max={selExam.totalMarks}
                                  placeholder="—"
                                  value={bulkVal}
                                  onChange={e=>setBulk({...bulk,[s.id]:e.target.value})}
                                  style={{width:"80px",padding:"8px 10px",borderRadius:"8px",border:`1px solid ${bulkVal?`rgba(212,175,55,0.5)`:"rgba(255,255,255,0.12)"}`,background:"rgba(255,255,255,0.06)",color:"#f1f5f9",fontSize:"0.85rem",fontFamily:"monospace",outline:"none",textAlign:"center",direction:"ltr",colorScheme:"dark"}}
                                />
                              )}
                            </td>
                            <td style={{padding:"12px 20px",textAlign:"center"}}>
                              {existing?(
                                <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"3px"}}>
                                  <span style={{fontWeight:"700",color:gradeColor(existing.percentage),fontSize:"0.8rem"}}>{existing.percentage}%</span>
                                  <span style={{padding:"2px 8px",borderRadius:"6px",fontSize:"0.6rem",fontWeight:"700",background:`${gradeColor(existing.percentage)}20`,color:gradeColor(existing.percentage)}}>{existing.grade}</span>
                                </div>
                              ):previewPct!=null?(
                                <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"3px",opacity:0.7}}>
                                  <span style={{fontWeight:"700",color:gradeColor(previewPct),fontSize:"0.8rem"}}>{previewPct}%</span>
                                  <span style={{padding:"2px 8px",borderRadius:"6px",fontSize:"0.6rem",fontWeight:"700",background:`${gradeColor(previewPct)}20`,color:gradeColor(previewPct)}}>{previewGr}</span>
                                </div>
                              ):(
                                <span style={{color:"rgba(241,245,249,0.2)",fontSize:"0.75rem"}}>—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                      {classStudents.length===0&&(
                        <tr><td colSpan={4} style={{padding:"50px 20px",textAlign:"center",color:"rgba(241,245,249,0.3)",fontSize:"0.85rem"}}>
                          <span className="material-symbols-rounded" style={{fontSize:"40px",display:"block",marginBottom:"10px",color:"rgba(212,175,55,0.2)"}}>person_search</span>
                          اس جماعت میں کوئی طالب علم نہیں
                        </td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {classStudents.length>0&&Object.keys(bulk).some(k=>bulk[k]!=="")&&(
                  <div style={{padding:"16px 20px",borderTop:"1px solid rgba(255,255,255,0.08)"}}>
                    <button onClick={saveBulkMarks} disabled={saving} style={{display:"flex",alignItems:"center",gap:"10px",padding:"13px 28px",borderRadius:"12px",border:"none",background:saving?"rgba(212,175,55,0.4)":`linear-gradient(135deg,${G},#b8960a)`,color:N,fontWeight:"700",fontSize:"0.88rem",cursor:saving?"not-allowed":"pointer",fontFamily:"'Public Sans',sans-serif",boxShadow:`0 4px 20px rgba(212,175,55,0.3)`,transition:"all 0.2s"}}>
                      <span className="material-symbols-rounded" style={{fontSize:"20px"}}>{saving?"hourglass_empty":"save"}</span>
                      {saving?"محفوظ ہو رہا ہے...":"تمام نمبرات محفوظ کریں"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default MarksEntry;
