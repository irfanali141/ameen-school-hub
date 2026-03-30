/* eslint-disable */
import { useState, useEffect } from "react";
import { HOUSES } from "../../constants";
import { supabase, getData, addData as sbAdd } from "../../supabase";
import letterhead from "../../assets/letterhead.png";

function Students({students,addData,results=[],fees=[],hifzLogs=[],classes=[],sections=[]}){
  const G="#d4af37";const N="#0f172a";
  const glass={background:"rgba(255,255,255,0.07)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:"16px"};
  const [show,setShow]=useState(false);
  const [profileStudent,setProfileStudent]=useState(null);
  const [portfolioStudent,setPortfolioStudent]=useState(null);
  const [q,setQ]=useState("");
  const [filter,setFilter]=useState("all");
  const [filterGrade,setFilterGrade]=useState("all");
  const [f,setF]=useState({name:"",fatherName:"",grade:"",section:"",houseId:"abuBakr",studentCode:"",canteenBalance:0,talent:"",phone:"",enrollmentStatus:"active",photoUrl:""});
  const [uploading,setUploading]=useState(false);
  const [uploadError,setUploadError]=useState(null);
  const [photoPreview,setPhotoPreview]=useState(null);

  const uploadStudentPhoto=async(event)=>{
    if(!event.target.files||event.target.files.length===0){setUploadError("Please select a photo");return;}
    setUploading(true);setUploadError(null);
    const file=event.target.files[0];
    const fileExt=file.name.split('.').pop();
    const fileName=`${Date.now()}-${Math.random().toString(36).substring(2,15)}.${fileExt}`;
    const {error:upErr}=await supabase.storage.from('student-photos').upload(fileName,file);
    if(upErr){setUploadError(upErr.message);setUploading(false);}
    else{
      const {data}=supabase.storage.from('student-photos').getPublicUrl(fileName);
      setF(prev=>({...prev,photoUrl:data.publicUrl}));
      setPhotoPreview(data.publicUrl);
      setUploading(false);
    }
  };

  const handleFileChange=(event)=>{
    const file=event.target.files[0];
    if(file){setPhotoPreview(URL.createObjectURL(file));uploadStudentPhoto(event);}
  };

  const removePhoto=()=>{setF(prev=>({...prev,photoUrl:""}));setPhotoPreview(null);};

  const add=async()=>{
    if(!f.name){alert("طالب علم کا نام درج کریں");return;}
    const payload = {
      name: f.name,
      fatherName: f.fatherName,
      grade: f.grade,
      section: f.section,
      houseId: f.houseId,
      studentCode: f.studentCode,
      canteenBalance: Number(f.canteenBalance),
      talent: f.talent,
      phone: f.phone,
      enrollmentStatus: f.enrollmentStatus,
      // photoUrl is not stored in the DB schema (causes schema cache errors),
      // so we omit it here.
    };
    await addData("students", payload);
    setShow(false);
    setF({name:"",fatherName:"",grade:"",section:"",houseId:"abuBakr",studentCode:"",canteenBalance:0,talent:"",phone:"",enrollmentStatus:"active",photoUrl:""});
    setPhotoPreview(null);setUploadError(null);
  };

  const filtered=students.filter(s=>{
    const ql=q.toLowerCase();
    const matchQ=!q||s.name?.toLowerCase().includes(ql)||(s.studentCode||s.student_code)?.toLowerCase().includes(ql)||(s.fatherName||s.father_name)?.toLowerCase().includes(ql)||s.roll_no?.toLowerCase().includes(ql);
    const matchF=filter==="all"||(filter==="active"&&s.enrollmentStatus==="active")||(filter==="inactive"&&s.enrollmentStatus!=="active");
    const matchG=filterGrade==="all"||s.grade===filterGrade;
    return matchQ&&matchF&&matchG;
  });

  // Use dynamic classes/sections from DB; fall back to hardcoded if none created yet
  const FALLBACK_GRADES=["Grade 6","Grade 7","Grade 8","Grade 9","Grade 10"];
  const FALLBACK_SECTIONS=["A","B","C","Orchid","Lily"];
  const gradeOptions = classes.length>0 ? classes.map(c=>c.name) : FALLBACK_GRADES;
  // Sections filtered by selected class (if DB-driven), else all sections or fallback
  const selectedClass = classes.find(c=>c.name===f.grade);
  const sectionOptions = classes.length>0
    ? (selectedClass ? sections.filter(s=>s.class_id===selectedClass.id).map(s=>s.name) : [])
    : FALLBACK_SECTIONS;
  // For filter dropdown use all unique grades present in students list + gradeOptions
  const grades = [...new Set([...gradeOptions, ...students.map(s=>s.grade).filter(Boolean)])];
  const inp={width:"100%",padding:"10px 14px",borderRadius:"10px",border:"1px solid rgba(212,175,55,0.25)",background:"rgba(255,255,255,0.06)",color:"#f1f5f9",fontSize:"0.8rem",fontFamily:"'Public Sans',sans-serif",outline:"none",boxSizing:"border-box",direction:"ltr"};
  const lbl={fontSize:"0.7rem",color:"rgba(212,175,55,0.8)",marginBottom:"6px",display:"block",fontWeight:"600"};
  const activeCount=students.filter(s=>s.enrollmentStatus==="active").length;

  function getInitials(name){
    if(!name)return "?";
    const parts=name.trim().split(" ");
    return parts.length>1?(parts[0][0]+parts[1][0]).toUpperCase():parts[0][0].toUpperCase();
  }

  const displayPhoto=photoPreview||f.photoUrl;

  return(
    <div style={{padding:"16px",maxWidth:"1100px",margin:"0 auto",minHeight:"100vh",background:"linear-gradient(160deg,#0f172a 0%,#0d1f3c 50%,#0a1628 100%)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"20px",flexWrap:"wrap",gap:"12px"}}>
        <div>
          <div style={{fontSize:"1.3rem",fontWeight:800,color:"#f1f5f9"}}>🎓 Students</div>
          <div style={{fontSize:"0.75rem",color:"rgba(255,255,255,0.5)"}}>Total: {students.length} | Active: {activeCount}</div>
        </div>
        <button onClick={()=>setShow(true)} style={{background:G,color:N,border:"none",borderRadius:"12px",padding:"10px 20px",fontSize:"0.82rem",fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
          + New Student
        </button>
      </div>

      <div style={{display:"flex",gap:"10px",marginBottom:"16px",flexWrap:"wrap"}}>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="🔍 Search by name, code, father's name..."
          style={{...inp,flex:1,minWidth:"200px",background:"rgba(255,255,255,0.08)"}}/>
        <select value={filter} onChange={e=>setFilter(e.target.value)} style={{...inp,width:"140px",background:"rgba(255,255,255,0.08)"}}>
          <option value="all">All Students</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <select value={filterGrade} onChange={e=>setFilterGrade(e.target.value)} style={{...inp,width:"140px",background:"rgba(255,255,255,0.08)"}}>
          <option value="all">All Grades</option>
          {grades.map(g=><option key={g} value={g}>{g}</option>)}
        </select>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:"14px"}}>
        {filtered.length===0&&<div style={{color:"rgba(255,255,255,0.4)",padding:"40px",textAlign:"center",gridColumn:"1/-1"}} className="ur">کوئی طالب علم نہیں ملا</div>}
        {filtered.map(s=>{
          const house=HOUSES?.find(h=>h.id===s.houseId);
          return(
            <div key={s.id} style={{...glass,padding:"16px",display:"flex",gap:"14px",alignItems:"flex-start"}}>
              <div style={{flexShrink:0}}>
                {s.photoUrl?(
                  <img src={s.photoUrl} alt={s.name} style={{width:"52px",height:"52px",borderRadius:"50%",objectFit:"cover",border:`2px solid ${G}`}}/>
                ):(
                  <div style={{width:"52px",height:"52px",borderRadius:"50%",background:"rgba(212,175,55,0.2)",color:G,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.3rem",fontWeight:700,border:"2px solid rgba(212,175,55,0.3)"}}>
                    {getInitials(s.name)}
                  </div>
                )}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{color:"#f1f5f9",fontWeight:700,fontSize:"0.9rem",marginBottom:"4px"}}>{s.name||"—"}</div>
                <div style={{color:"rgba(255,255,255,0.5)",fontSize:"0.72rem",marginBottom:"2px"}}>Father: {s.fatherName||s.father_name||"—"}</div>
                <div style={{display:"flex",gap:"6px",flexWrap:"wrap",marginTop:"6px"}}>
                  <span style={{background:"rgba(212,175,55,0.15)",color:G,borderRadius:"8px",padding:"2px 8px",fontSize:"0.65rem",fontWeight:600}}>{s.grade||"—"}</span>
                  {s.section&&<span style={{background:"rgba(255,255,255,0.08)",color:"rgba(255,255,255,0.6)",borderRadius:"8px",padding:"2px 8px",fontSize:"0.65rem"}}>{s.section}</span>}
                  <span style={{background:s.enrollmentStatus==="active"?"rgba(34,197,94,0.15)":"rgba(239,68,68,0.15)",color:s.enrollmentStatus==="active"?"#4ade80":"#f87171",borderRadius:"8px",padding:"2px 8px",fontSize:"0.65rem",fontWeight:600}}>
                    {s.enrollmentStatus==="active"?"Active":"Inactive"}
                  </span>
                  {house&&<span style={{background:house.color+"30",color:house.color,borderRadius:"8px",padding:"2px 8px",fontSize:"0.65rem",fontWeight:600}}>{house.nameEn}</span>}
                </div>
                {s.phone&&<div style={{color:"rgba(255,255,255,0.4)",fontSize:"0.68rem",marginTop:"4px"}}>📞 {s.phone}</div>}
                <div style={{display:"flex",gap:"6px",marginTop:"10px"}}>
                  <button onClick={()=>setProfileStudent(s)} style={{flex:1,padding:"7px",borderRadius:"9px",border:`1px solid rgba(212,175,55,0.35)`,background:"rgba(212,175,55,0.08)",color:G,fontSize:"0.65rem",fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
                    👁 Profile
                  </button>
                  <button onClick={()=>setPortfolioStudent(s)} style={{flex:1,padding:"7px",borderRadius:"9px",border:`1px solid rgba(74,222,128,0.35)`,background:"rgba(74,222,128,0.08)",color:"#4ade80",fontSize:"0.65rem",fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
                    🏆 Portfolio
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {profileStudent&&<StudentProfile student={profileStudent} results={results} fees={fees} hifzLogs={hifzLogs} onClose={()=>setProfileStudent(null)}/>}
      {portfolioStudent&&<StudentPortfolio student={portfolioStudent} results={results} onClose={()=>setPortfolioStudent(null)}/>}

      {show&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:"16px"}}
          onClick={e=>{if(e.target===e.currentTarget)setShow(false);}}>
          <div style={{...glass,padding:"24px",width:"100%",maxWidth:"500px",maxHeight:"90vh",overflowY:"auto"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"20px"}}>
              <div style={{color:G,fontSize:"1.1rem",fontWeight:800}}>Add New Student</div>
              <button onClick={()=>setShow(false)} style={{background:"none",border:"none",color:"rgba(255,255,255,0.5)",fontSize:"1.2rem",cursor:"pointer"}}>✕</button>
            </div>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",marginBottom:"20px",gap:"10px"}}>
              <input type="file" id="photo-upload" accept="image/*" onChange={handleFileChange} disabled={uploading} style={{display:"none"}}/>
              {displayPhoto?(
                <img src={displayPhoto} alt="preview" style={{width:"80px",height:"80px",borderRadius:"50%",objectFit:"cover",border:`2px solid ${G}`,cursor:"pointer"}} onClick={()=>document.getElementById('photo-upload').click()}/>
              ):(
                <div onClick={()=>document.getElementById('photo-upload').click()}
                  style={{width:"80px",height:"80px",borderRadius:"50%",background:"rgba(212,175,55,0.15)",color:G,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.8rem",fontWeight:700,cursor:"pointer",border:"2px dashed rgba(212,175,55,0.4)"}}>
                  {getInitials(f.name)||"📷"}
                </div>
              )}
              <label htmlFor="photo-upload" style={{color:G,fontSize:"0.72rem",cursor:"pointer",fontWeight:600}}>
                {uploading?"Uploading...":(displayPhoto?"Change Photo":"Upload Photo")}
              </label>
              {displayPhoto&&<button onClick={removePhoto} style={{background:"rgba(248,113,113,0.1)",border:"1px solid rgba(248,113,113,0.3)",color:"#f87171",borderRadius:"8px",padding:"4px 10px",fontSize:"0.68rem",cursor:"pointer",fontFamily:"inherit"}}>Remove Photo</button>}
              {uploadError&&<div style={{color:"#f87171",fontSize:"0.7rem"}}>{uploadError}</div>}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px"}}>
              <div style={{gridColumn:"1/-1"}}>
                <label style={lbl}>Name *</label>
                <input style={inp} placeholder="طالب علم کا نام" value={f.name} onChange={e=>setF({...f,name:e.target.value})}/>
              </div>
              <div style={{gridColumn:"1/-1"}}>
                <label style={lbl}>Father's Name</label>
                <input style={inp} placeholder="والد کا نام" value={f.fatherName} onChange={e=>setF({...f,fatherName:e.target.value})}/>
              </div>
              <div>
                <label style={lbl}>Class *</label>
                <select style={inp} value={f.grade} onChange={e=>setF({...f,grade:e.target.value,section:""})}>
                  <option value="">— Select Class —</option>
                  {gradeOptions.map(g=><option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Section *</label>
                <select style={inp} value={f.section} onChange={e=>setF({...f,section:e.target.value})}
                  disabled={classes.length>0 && !f.grade}>
                  <option value="">— Select Section —</option>
                  {sectionOptions.map(s=><option key={s} value={s}>{s}</option>)}
                </select>
                {classes.length>0 && !f.grade && (
                  <div style={{fontSize:"0.65rem",color:"rgba(255,255,255,0.35)",marginTop:"4px"}}>Select a class first</div>
                )}
              </div>
              <div>
                <label style={lbl}>House</label>
                <select style={inp} value={f.houseId} onChange={e=>setF({...f,houseId:e.target.value})}>
                  {(HOUSES||[]).map(h=><option key={h.id} value={h.id}>{h.nameEn}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Status</label>
                <select style={inp} value={f.enrollmentStatus} onChange={e=>setF({...f,enrollmentStatus:e.target.value})}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="graduated">Graduated</option>
                </select>
              </div>
              <div>
                <label style={lbl}>Student Code</label>
                <input style={inp} placeholder="کوڈ" value={f.studentCode} onChange={e=>setF({...f,studentCode:e.target.value})}/>
              </div>
              <div>
                <label style={lbl}>Phone Number</label>
                <input style={inp} placeholder="03XXXXXXXXX" value={f.phone} onChange={e=>setF({...f,phone:e.target.value})}/>
              </div>
              <div>
                <label style={lbl}>Canteen Balance</label>
                <input style={inp} type="number" placeholder="0" value={f.canteenBalance} onChange={e=>setF({...f,canteenBalance:e.target.value})}/>
              </div>
              <div>
                <label style={lbl}>خصوصی صلاحیت</label>
                <input style={inp} placeholder="e.g. Hifz, Sports" value={f.talent} onChange={e=>setF({...f,talent:e.target.value})}/>
              </div>
            </div>
            <button onClick={add} style={{width:"100%",marginTop:"20px",background:G,color:N,border:"none",borderRadius:"12px",padding:"12px",fontSize:"0.9rem",fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
              ✅ Add Student
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function StudentProfile({student,results=[],fees=[],hifzLogs=[],onClose}){
  const G="#d4af37"; const N="#0f172a";
  const house=HOUSES.find(h=>h.id===student.houseId)||HOUSES[0];
  const sid=student.id;
  const gc=p=>p>=80?"#4ade80":p>=60?"#fb923c":"#f87171";
  const gl=(bg,col,txt)=><span style={{background:bg,color:col,borderRadius:"8px",padding:"3px 10px",fontSize:"0.65rem",fontWeight:700}}>{txt}</span>;
  function getInitials(n){ if(!n)return"?"; const p=n.trim().split(" "); return(p.length>1?p[0][0]+p[1][0]:p[0][0]).toUpperCase(); }

  const [tab,      setTab]      = useState("overview");
  const [attLogs,  setAttLogs]  = useState([]);
  const [hvsLogs,  setHvsLogs]  = useState([]);

  useEffect(()=>{
    getData("attendance").then(d=>{ if(d&&!d.error) setAttLogs(d.filter(a=>(a.studentId||a.student_id)===sid)); });
    getData("hvs_logs").then(d=>{ if(d&&!d.error) setHvsLogs(d.filter(l=>l.houseId===student.houseId||l.house_id===student.houseId)); });
  },[]);

  // ── Derived data ──────────────────────────────────────────────
  const sResults=[...results].filter(r=>(r.studentId||r.student_id)===sid)
    .sort((a,b)=>new Date(b.date||b.created_at||0)-new Date(a.date||a.created_at||0));
  const sFees=[...fees].filter(f=>(f.studentId||f.student_id)===sid)
    .sort((a,b)=>new Date(b.date||b.created_at||0)-new Date(a.date||a.created_at||0));
  const sHifz=[...hifzLogs].filter(h=>(h.studentId||h.student_id)===sid)
    .sort((a,b)=>new Date(b.date||b.created_at||0)-new Date(a.date||a.created_at||0));
  const paidFees=sFees.filter(f=>f.status==="paid");
  const pendingFees=sFees.filter(f=>f.status!=="paid");
  const pendingTotal=pendingFees.reduce((s,f)=>s+(f.amount||0),0);

  // Attendance
  const attPct=attLogs.length?Math.round((attLogs.filter(a=>a.status==="present").length/attLogs.length)*100):null;

  // Class position from results
  const classResults=results.filter(r=>r.grade===student.grade||(r.studentId||r.student_id)===sid);
  const avgOf=(sid)=>{ const rs=results.filter(r=>(r.studentId||r.student_id)===sid); return rs.length?rs.reduce((s,r)=>s+(r.percentage||0),0)/rs.length:0; };
  const classPos=(()=>{
    const peers=[...new Set(results.map(r=>r.studentId||r.student_id))];
    const ranked=[...peers].sort((a,b)=>avgOf(b)-avgOf(a));
    const pos=ranked.indexOf(sid)+1; return pos>0?pos:null;
  })();

  // HVS this week / this month
  const now=new Date();
  const thisMonthStr=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;
  const jan1=new Date(now.getFullYear(),0,1);
  const wkNum=Math.ceil(((now-jan1)/86400000+jan1.getDay()+1)/7);
  const thisWkStr=`${now.getFullYear()}-W${String(wkNum).padStart(2,"0")}`;
  const wkEntries=hvsLogs.filter(l=>l.week===thisWkStr);
  const wkScore=wkEntries.reduce((s,l)=>s+(l.totalScore||l.total_score||0),0);
  const moEntries=hvsLogs.filter(l=>(l.created_at||"").startsWith(thisMonthStr));
  const moTotal=moEntries.reduce((s,l)=>s+(l.totalScore||l.total_score||0),0);
  const moCount=moEntries.length||1;
  const moAvg=Math.round(moTotal/moCount);

  // Active HVS alerts (latest entry below 50% for any category)
  const latestEntry=hvsLogs.length?[...hvsLogs].sort((a,b)=>new Date(b.created_at)-new Date(a.created_at))[0]:null;
  const THRESHOLDS={attendance:5,discipline:8,morality:8,education:12,cleanliness:8,leadership:5,spirit:5};
  const alerts=latestEntry?.subScores?Object.entries(THRESHOLDS).filter(([cat,thr])=>(latestEntry.subScores?.[cat]?.total||0)<thr).map(([cat])=>cat):[];

  // Hifz type counts
  const sabaqCount=sHifz.filter(h=>h.type==="sabaq"||h.type==="Sabaq").length;
  const sabaqiCount=sHifz.filter(h=>h.type==="sabaqi"||h.type==="Sabaqi").length;
  const manzilCount=sHifz.filter(h=>h.type==="manzil"||h.type==="Manzil").length;
  const enrollYear=student.created_at?new Date(student.created_at).getFullYear():null;

  // ── Print ─────────────────────────────────────────────────────
  const doPrint=()=>{
    const resRows=sResults.slice(0,3).map(r=>{
      const pct=r.percentage||Math.round(((r.obtainedMarks||0)/(r.totalMarks||1))*100)||0;
      return `<tr><td>${r.subject||"—"}</td><td>${r.exam||"—"}</td><td style="text-align:center">${r.obtainedMarks||"—"}/${r.totalMarks||"—"}</td><td style="text-align:center;font-weight:700">${pct}%</td></tr>`;
    }).join("")||`<tr><td colspan="4" style="text-align:center;color:#94a3b8">کوئی نتائج نہیں</td></tr>`;
    const feeRows=sFees.slice(0,3).map(f=>`<tr><td>${f.feeType||"فیس"}</td><td>${f.month||"—"}</td><td>Rs ${(f.amount||0).toLocaleString()}</td><td style="font-weight:700;color:${f.status==="paid"?"#16a34a":"#dc2626"}">${f.status==="paid"?"ادا":"باقی"}</td></tr>`).join("")||`<tr><td colspan="4" style="text-align:center;color:#94a3b8">کوئی فیس اندراج نہیں</td></tr>`;
    const hifzRows=sHifz.slice(0,4).map(h=>`<tr><td>${h.surah||h.para||h.lesson||"سبق"}</td><td>${h.type||"—"}</td><td>${h.marks!=null?h.marks:"—"}</td><td>${h.date||h.created_at?.slice(0,10)||"—"}</td></tr>`).join("")||`<tr><td colspan="4" style="text-align:center;color:#94a3b8">کوئی حفظ اندراج نہیں</td></tr>`;
    const w=window.open("","_blank","width=900,height=750");
    w.document.write(`<!DOCTYPE html><html dir="ltr"><body style="font-family:serif;padding:24px;direction:ltr;background:#fff;color:#1e293b">
      <img src="${letterhead}" style="width:100%;max-width:700px;display:block;margin:0 auto 16px" onerror="this.style.display='none'"/>
      <h2 style="text-align:center;color:#1e293b;margin-bottom:4px">Student Profile Sheet</h2>
      <div style="display:flex;gap:24px;flex-wrap:wrap;background:#f8fafc;padding:14px 18px;border-radius:10px;margin-bottom:18px;font-size:13px">
        <div><strong>Name:</strong> ${student.name||"—"}</div>
        <div><strong>Father:</strong> ${student.fatherName||"—"}</div>
        <div><strong>Class:</strong> ${student.grade||"—"} ${student.section?`(${student.section})`:""}</div>
        <div><strong>House:</strong> ${house.nameEn}</div>
        <div><strong>Code:</strong> ${student.studentCode||"—"}</div>
        <div><strong>Attendance:</strong> ${attPct!=null?attPct+"%":"—"}</div>
        ${classPos?`<div><strong>Position:</strong> ${classPos}</div>`:""}
        <div><strong>Status:</strong> ${student.enrollmentStatus==="active"?"Active":"Inactive"}</div>
        ${enrollYear?`<div><strong>Enrolled:</strong> ${enrollYear}</div>`:""}
        <div><strong>Phone:</strong> ${student.phone||"—"}</div>
      </div>
      <h4 style="color:#1e293b;margin-bottom:6px">📊 Recent Results</h4>
      <table border="1" cellpadding="7" style="width:100%;border-collapse:collapse;font-size:12px;margin-bottom:16px">
        <tr style="background:#1e293b;color:#fff"><th>Subject</th><th>Exam</th><th>Marks</th><th>%</th></tr>${resRows}
      </table>
      <h4 style="color:#1e293b;margin-bottom:6px">💰 Fee History</h4>
      <table border="1" cellpadding="7" style="width:100%;border-collapse:collapse;font-size:12px;margin-bottom:16px">
        <tr style="background:#1e293b;color:#fff"><th>Type</th><th>Month</th><th>Amount</th><th>Status</th></tr>${feeRows}
      </table>
      <h4 style="color:#1e293b;margin-bottom:6px">📖 Hifz / Islamic Studies</h4>
      <table border="1" cellpadding="7" style="width:100%;border-collapse:collapse;font-size:12px;margin-bottom:16px">
        <tr style="background:#1e293b;color:#fff"><th>Lesson / Para</th><th>Type</th><th>Marks</th><th>Date</th></tr>${hifzRows}
      </table>
      <h4 style="color:#1e293b;margin-bottom:6px">🏠 House Performance</h4>
      <div style="padding:12px 16px;background:#f8fafc;border-radius:8px;font-size:13px">
        House: <strong>${house.nameEn}</strong> &nbsp;|&nbsp; This Week HVS: <strong>${wkScore}</strong> &nbsp;|&nbsp; Monthly Avg: <strong>${moAvg}</strong>
      </div>
      <div style="margin-top:50px;display:flex;justify-content:space-between;align-items:flex-end">
        <div style="text-align:center;min-width:180px"><div style="border-top:1.5px solid #0f172a;padding-top:6px;font-size:13px">Class Teacher Signature</div></div>
        <div style="font-size:11px;color:#64748b">Printed: ${new Date().toLocaleDateString("en-PK",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</div>
      </div>
      <script>window.print();window.close();<\/script>
    </body></html>`);
  };

  // ── Shared styles ─────────────────────────────────────────────
  const card={background:"rgba(255,255,255,0.05)",borderRadius:"12px",border:"1px solid rgba(255,255,255,0.07)",padding:"12px 14px"};
  const secHdr={fontSize:"0.67rem",fontWeight:700,color:G,letterSpacing:"0.08em",marginBottom:"12px"};
  const TABS=[["overview","👤 Overview"],["academic","📊 Academic"],["fees","💰 Fees"],["hifz","📖 Hifz"],["house","🏠 House"]];

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.9)",zIndex:2000,overflowY:"auto",display:"flex",alignItems:"flex-start",justifyContent:"center",padding:"16px",backdropFilter:"blur(4px)"}}
      onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{background:"linear-gradient(160deg,#0f172a 0%,#0d1f3c 60%,#0a1628 100%)",borderRadius:"20px",width:"100%",maxWidth:"720px",border:`1px solid ${house.color}33`,overflow:"hidden",marginBottom:"20px"}}>

        {/* ── Hero ── */}
        <div style={{background:`linear-gradient(135deg,${house.color}15,rgba(255,255,255,0.02))`,padding:"18px 20px",display:"flex",gap:"16px",alignItems:"flex-start",borderBottom:"1px solid rgba(255,255,255,0.07)",position:"relative"}}>
          <button onClick={onClose} style={{position:"absolute",top:"12px",left:"12px",background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:"8px",color:"rgba(255,255,255,0.5)",width:"30px",height:"30px",cursor:"pointer",fontSize:"1rem",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
          <button onClick={doPrint} style={{position:"absolute",top:"12px",left:"50px",background:`${G}18`,border:`1px solid ${G}40`,borderRadius:"8px",color:G,padding:"5px 11px",cursor:"pointer",fontSize:"0.65rem",fontWeight:700,fontFamily:"inherit"}}>🖨️ Print</button>
          {student.photoUrl
            ?<img src={student.photoUrl} alt={student.name} style={{width:"76px",height:"76px",borderRadius:"14px",objectFit:"cover",border:`2px solid ${house.color}`,flexShrink:0}}/>
            :<div style={{width:"76px",height:"76px",borderRadius:"14px",background:`${house.color}22`,color:house.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"2rem",fontWeight:700,border:`2px solid ${house.color}44`,flexShrink:0}}>{getInitials(student.name)}</div>
          }
          <div style={{flex:1,paddingTop:"2px"}}>
            <div style={{color:"#f1f5f9",fontSize:"1.1rem",fontWeight:800,marginBottom:"3px"}}>{student.name||"—"}</div>
            <div style={{color:"rgba(255,255,255,0.4)",fontSize:"0.7rem",marginBottom:"8px"}}>Father: {student.fatherName||"—"}</div>
            <div style={{display:"flex",gap:"5px",flexWrap:"wrap"}}>
              {gl(`${house.color}20`,house.color,`${house.emoji} ${house.nameEn}`)}
              {gl("rgba(212,175,55,0.15)",G,student.grade||"—")}
              {student.section&&gl("rgba(255,255,255,0.07)","rgba(255,255,255,0.55)",student.section)}
              {gl(student.enrollmentStatus==="active"?"rgba(34,197,94,0.15)":"rgba(239,68,68,0.15)",student.enrollmentStatus==="active"?"#4ade80":"#f87171",student.enrollmentStatus==="active"?"Active":"Inactive")}
            </div>
          </div>
        </div>

        {/* ── Tab Bar ── */}
        <div style={{display:"flex",borderBottom:"1px solid rgba(255,255,255,0.07)",background:"rgba(0,0,0,0.2)",overflowX:"auto"}}>
          {TABS.map(([id,lbl])=>(
            <button key={id} onClick={()=>setTab(id)}
              style={{padding:"11px 16px",background:"transparent",border:"none",borderBottom:`2px solid ${tab===id?G:"transparent"}`,color:tab===id?G:"rgba(255,255,255,0.45)",fontFamily:"inherit",fontSize:"0.72rem",fontWeight:700,cursor:"pointer",whiteSpace:"nowrap",transition:"all 0.15s"}}>
              {lbl}
            </button>
          ))}
        </div>

        {/* ── Tab Content ── */}
        <div style={{padding:"18px 20px",minHeight:"320px"}}>

          {/* TAB 1 — Overview */}
          {tab==="overview"&&(
            <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
              {/* House card */}
              <div style={{...card,background:`linear-gradient(135deg,${house.color}18,${house.color}08)`,border:`1px solid ${house.color}30`,display:"flex",alignItems:"center",gap:"14px"}}>
                <span style={{fontSize:"2rem"}}>{house.emoji}</span>
                <div>
                  <div style={{fontSize:"0.85rem",fontWeight:800,color:house.color}}>{house.nameEn}</div>
                </div>
              </div>
              {/* Info grid */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px"}}>
                {[
                  ["📋 Roll No",student.roll_no||"—"],
                  ["🔖 Code",student.studentCode||"—"],
                  ["📞 Phone",student.phone||"—"],
                  ["🌟 Talent",student.talent||"—"],
                  ["🏦 Canteen",`Rs ${(student.canteenBalance||0).toLocaleString()}`],
                  ["📅 Enrolled",enrollYear?`${enrollYear} (${new Date().getFullYear()-enrollYear} yrs)`:"—"],
                ].map(([lbl,val])=>(
                  <div key={lbl} style={card}>
                    <div style={{fontSize:"0.58rem",color:"rgba(255,255,255,0.3)",marginBottom:"3px"}}>{lbl}</div>
                    <div style={{fontSize:"0.76rem",fontWeight:600,color:"#f1f5f9"}}>{val}</div>
                  </div>
                ))}
              </div>
              {/* Attendance + position mini cards */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px"}}>
                <div style={{...card,textAlign:"center",background:attPct!=null&&attPct>=95?"rgba(74,222,128,0.07)":"rgba(251,146,60,0.07)"}}>
                  <div style={{fontSize:"0.6rem",color:"rgba(255,255,255,0.35)",marginBottom:"4px"}}>✅ Attendance</div>
                  <div style={{fontSize:"1.4rem",fontWeight:900,color:attPct!=null&&attPct>=95?"#4ade80":"#fb923c"}}>{attPct!=null?attPct+"%":"—"}</div>
                  <div style={{fontSize:"0.58rem",color:"rgba(255,255,255,0.3)",marginTop:"2px"}}>{attLogs.length} records</div>
                </div>
                <div style={{...card,textAlign:"center"}}>
                  <div style={{fontSize:"0.6rem",color:"rgba(255,255,255,0.35)",marginBottom:"4px"}}>🏅 Rank</div>
                  <div style={{fontSize:"1.4rem",fontWeight:900,color:classPos===1?"#d4af37":classPos&&classPos<=3?"#94a3b8":"rgba(255,255,255,0.6)"}}>{classPos||"—"}</div>
                  <div style={{fontSize:"0.58rem",color:"rgba(255,255,255,0.3)",marginTop:"2px"}}>this term</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2 — Academic */}
          {tab==="academic"&&(
            <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
              {/* Stats row */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"8px"}}>
                {[
                  ["📊 Avg",sResults.length?Math.round(sResults.reduce((s,r)=>s+(r.percentage||0),0)/sResults.length)+"%":"—","#60a5fa"],
                  ["✅ Attendance",attPct!=null?attPct+"%":"—",attPct>=95?"#4ade80":"#fb923c"],
                  ["🏅 Rank",classPos||"—",classPos===1?"#d4af37":"rgba(255,255,255,0.6)"],
                ].map(([lbl,val,col])=>(
                  <div key={lbl} style={{...card,textAlign:"center"}}>
                    <div style={{fontSize:"0.6rem",color:"rgba(255,255,255,0.35)",marginBottom:"4px"}}>{lbl}</div>
                    <div style={{fontSize:"1.3rem",fontWeight:900,color:col}}>{val}</div>
                  </div>
                ))}
              </div>
              {/* Results table */}
              <div style={card}>
                <div style={secHdr}>Last 3 Results</div>
                {sResults.length===0
                  ?<div style={{textAlign:"center",color:"rgba(255,255,255,0.2)",padding:"20px",fontSize:"0.75rem"}}>کوئی نتائج نہیں</div>
                  :sResults.slice(0,3).map((r,i)=>{
                    const pct=r.percentage||Math.round(((r.obtainedMarks||0)/(r.totalMarks||1))*100)||0;
                    return(
                      <div key={i} style={{display:"flex",alignItems:"center",gap:"10px",padding:"9px 0",borderBottom:i<2?"1px solid rgba(255,255,255,0.05)":"none"}}>
                        <div style={{flex:1}}>
                          <div style={{fontSize:"0.76rem",fontWeight:600,color:"#f1f5f9"}}>{r.subject||"—"}</div>
                          <div style={{fontSize:"0.6rem",color:"rgba(255,255,255,0.3)"}}>{r.exam||"—"} · {r.date||r.created_at?.slice(0,10)||""}</div>
                        </div>
                        <div style={{fontSize:"0.7rem",color:"rgba(255,255,255,0.4)",direction:"ltr"}}>{r.obtainedMarks||"—"}/{r.totalMarks||"—"}</div>
                        <div style={{minWidth:"44px",textAlign:"center"}}>
                          <div style={{fontSize:"0.82rem",fontWeight:800,color:gc(pct)}}>{pct}%</div>
                          <div style={{height:"3px",background:"rgba(255,255,255,0.07)",borderRadius:"2px",marginTop:"3px",overflow:"hidden"}}>
                            <div style={{width:`${pct}%`,height:"100%",background:gc(pct),borderRadius:"2px"}}/>
                          </div>
                        </div>
                      </div>
                    );
                  })
                }
              </div>
              {/* Attendance bar */}
              {attLogs.length>0&&(
                <div style={card}>
                  <div style={secHdr}>Attendance Summary</div>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:"6px",fontSize:"0.68rem",color:"rgba(255,255,255,0.5)"}}>
                    <span>Present: {attLogs.filter(a=>a.status==="present").length}</span>
                    <span>Absent: {attLogs.filter(a=>a.status!=="present").length}</span>
                    <span>Total: {attLogs.length}</span>
                  </div>
                  <div style={{height:"8px",background:"rgba(255,255,255,0.07)",borderRadius:"4px",overflow:"hidden"}}>
                    <div style={{width:`${attPct||0}%`,height:"100%",background:attPct>=95?"#4ade80":"#fb923c",borderRadius:"4px",transition:"width 0.4s"}}/>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3 — Fees */}
          {tab==="fees"&&(
            <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
              {/* Summary */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px"}}>
                <div style={{...card,textAlign:"center",background:"rgba(74,222,128,0.06)",border:"1px solid rgba(74,222,128,0.15)"}}>
                  <div style={{fontSize:"0.6rem",color:"rgba(255,255,255,0.35)",marginBottom:"4px"}}>✅ Paid</div>
                  <div style={{fontSize:"1.2rem",fontWeight:800,color:"#4ade80"}}>Rs {paidFees.reduce((s,f)=>s+(f.amount||0),0).toLocaleString()}</div>
                  <div style={{fontSize:"0.6rem",color:"rgba(74,222,128,0.5)",marginTop:"2px"}}>{paidFees.length} payments</div>
                </div>
                <div style={{...card,textAlign:"center",background:"rgba(251,146,60,0.06)",border:`1px solid rgba(251,146,60,${pendingTotal>0?0.3:0.1})`}}>
                  <div style={{fontSize:"0.6rem",color:"rgba(255,255,255,0.35)",marginBottom:"4px"}}>⏳ Pending</div>
                  <div style={{fontSize:"1.2rem",fontWeight:800,color:pendingTotal>0?"#fb923c":"rgba(255,255,255,0.3)"}}>Rs {pendingTotal.toLocaleString()}</div>
                  <div style={{fontSize:"0.6rem",color:"rgba(251,146,60,0.5)",marginTop:"2px"}}>{pendingFees.length} pending</div>
                </div>
              </div>
              {/* This month status */}
              {(()=>{
                const curMo=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;
                const moFee=sFees.find(f=>f.month===curMo);
                return moFee&&(
                  <div style={{...card,display:"flex",justifyContent:"space-between",alignItems:"center",background:moFee.status==="paid"?"rgba(74,222,128,0.06)":"rgba(220,38,38,0.06)"}}>
                    <span style={{fontSize:"0.72rem",color:"rgba(255,255,255,0.6)"}}>This month's fee ({curMo})</span>
                    <span style={{padding:"4px 12px",borderRadius:"10px",fontSize:"0.68rem",fontWeight:700,background:moFee.status==="paid"?"rgba(74,222,128,0.15)":"rgba(220,38,38,0.15)",color:moFee.status==="paid"?"#4ade80":"#f87171"}}>
                      {moFee.status==="paid"?"✅ Paid":"❌ Pending"}
                    </span>
                  </div>
                );
              })()}
              {/* Last 3 payments */}
              <div style={card}>
                <div style={secHdr}>آخری ۳ ادائیگیاں</div>
                {sFees.length===0
                  ?<div style={{textAlign:"center",color:"rgba(255,255,255,0.2)",padding:"20px",fontSize:"0.75rem"}} className="ur">کوئی فیس اندراج نہیں</div>
                  :sFees.slice(0,3).map((f,i)=>(
                    <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:i<2?"1px solid rgba(255,255,255,0.05)":"none"}}>
                      <div>
                        <div style={{fontSize:"0.73rem",color:"#f1f5f9"}}>{f.feeType||"Fee"}{f.month?` — ${f.month}`:""}</div>
                        <div style={{fontSize:"0.6rem",color:"rgba(255,255,255,0.3)"}}>{f.receipt_no||""}</div>
                      </div>
                      <div style={{display:"flex",gap:"8px",alignItems:"center"}}>
                        <span style={{fontSize:"0.75rem",fontWeight:700,color:G}}>Rs {(f.amount||0).toLocaleString()}</span>
                        <span style={{padding:"2px 8px",borderRadius:"10px",fontSize:"0.6rem",fontWeight:700,background:f.status==="paid"?"rgba(74,222,128,0.15)":"rgba(251,146,60,0.15)",color:f.status==="paid"?"#4ade80":"#fb923c"}}>{f.status==="paid"?"Paid":"Pending"}</span>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          )}

          {/* TAB 4 — Hifz */}
          {tab==="hifz"&&(
            <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
              {/* Type counts */}
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"8px"}}>
                {[["📖 Sabaq",sabaqCount,"#60a5fa"],["🔄 Sabaqi",sabaqiCount,"#4ade80"],["📚 Manzil",manzilCount,"#a78bfa"]].map(([lbl,cnt,col])=>(
                  <div key={lbl} style={{...card,textAlign:"center"}}>
                    <div style={{fontSize:"0.6rem",color:"rgba(255,255,255,0.35)",marginBottom:"4px"}}>{lbl}</div>
                    <div style={{fontSize:"1.4rem",fontWeight:900,color:col}}>{cnt}</div>
                  </div>
                ))}
              </div>
              {/* Latest entry */}
              {sHifz[0]&&(
                <div style={{...card,background:"rgba(167,139,250,0.07)",border:"1px solid rgba(167,139,250,0.2)"}}>
                  <div style={{fontSize:"0.6rem",color:"rgba(255,255,255,0.35)",marginBottom:"4px"}}>Latest Lesson</div>
                  <div style={{fontSize:"0.85rem",fontWeight:700,color:"#f1f5f9"}}>{sHifz[0].surah||sHifz[0].para||sHifz[0].lesson||"Lesson"}</div>
                  <div style={{display:"flex",gap:"8px",marginTop:"6px",flexWrap:"wrap"}}>
                    {sHifz[0].type&&<span style={{background:"rgba(167,139,250,0.15)",color:"#a78bfa",borderRadius:"6px",padding:"2px 8px",fontSize:"0.62rem",fontWeight:700}}>{sHifz[0].type}</span>}
                    {sHifz[0].marks!=null&&<span style={{background:`${G}15`,color:G,borderRadius:"6px",padding:"2px 8px",fontSize:"0.62rem",fontWeight:700}}>{sHifz[0].marks} pts</span>}
                    {sHifz[0].status&&<span style={{background:"rgba(74,222,128,0.12)",color:"#4ade80",borderRadius:"6px",padding:"2px 8px",fontSize:"0.62rem",fontWeight:700}}>{sHifz[0].status}</span>}
                  </div>
                </div>
              )}
              {/* List */}
              <div style={card}>
                <div style={secHdr}>Hifz History</div>
                {sHifz.length===0
                  ?<div style={{textAlign:"center",color:"rgba(255,255,255,0.2)",padding:"20px",fontSize:"0.75rem"}}>کوئی حفظ اندراج نہیں</div>
                  :sHifz.slice(0,5).map((h,i)=>(
                    <div key={i} style={{display:"flex",gap:"10px",alignItems:"center",padding:"8px 0",borderBottom:i<Math.min(sHifz.length,5)-1?"1px solid rgba(255,255,255,0.05)":"none"}}>
                      <span style={{fontSize:"1rem",flexShrink:0}}>📖</span>
                      <div style={{flex:1}}>
                        <div style={{fontSize:"0.73rem",fontWeight:600,color:"#f1f5f9"}}>{h.surah||h.para||h.lesson||"Lesson"}</div>
                        <div style={{fontSize:"0.6rem",color:"rgba(255,255,255,0.3)"}}>{h.type||""}{h.type?" · ":""}{h.date||h.created_at?.slice(0,10)||""}</div>
                      </div>
                      {h.marks!=null&&<span style={{fontSize:"0.73rem",fontWeight:700,color:G}}>{h.marks}</span>}
                    </div>
                  ))
                }
              </div>
            </div>
          )}

          {/* TAB 5 — House Performance */}
          {tab==="house"&&(
            <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
              {/* House banner */}
              <div style={{...card,background:`linear-gradient(135deg,${house.color}20,${house.color}08)`,border:`1px solid ${house.color}33`,display:"flex",alignItems:"center",gap:"16px",padding:"16px"}}>
                <div style={{width:"54px",height:"54px",borderRadius:"14px",background:house.gradient,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.6rem",flexShrink:0}}>{house.emoji}</div>
                <div>
                  <div style={{fontSize:"0.95rem",fontWeight:800,color:house.color}}>{house.nameEn} House</div>
                </div>
              </div>
              {/* HVS scores */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px"}}>
                <div style={{...card,textAlign:"center"}}>
                  <div style={{fontSize:"0.6rem",color:"rgba(255,255,255,0.35)",marginBottom:"4px"}}>🏅 This Week HVS</div>
                  <div style={{fontSize:"1.5rem",fontWeight:900,color:house.color}}>{wkScore}</div>
                  <div style={{fontSize:"0.58rem",color:"rgba(255,255,255,0.3)",marginTop:"2px"}}>{wkEntries.length} entries</div>
                </div>
                <div style={{...card,textAlign:"center"}}>
                  <div style={{fontSize:"0.6rem",color:"rgba(255,255,255,0.35)",marginBottom:"4px"}}>📅 Monthly Avg</div>
                  <div style={{fontSize:"1.5rem",fontWeight:900,color:house.color}}>{moAvg}</div>
                  <div style={{fontSize:"0.58rem",color:"rgba(255,255,255,0.3)",marginTop:"2px"}}>{moEntries.length} entries</div>
                </div>
              </div>
              {/* Active alerts */}
              <div style={card}>
                <div style={secHdr}>⚠️ Active Alerts</div>
                {alerts.length===0
                  ?<div style={{display:"flex",alignItems:"center",gap:"10px",color:"#4ade80",fontSize:"0.75rem"}}><span style={{fontSize:"1.2rem"}}>✅</span> No active alerts</div>
                  :alerts.map(cat=>(
                    <div key={cat} style={{display:"flex",gap:"8px",alignItems:"center",padding:"7px 10px",borderRadius:"8px",background:"rgba(220,38,38,0.1)",border:"1px solid rgba(220,38,38,0.2)",marginBottom:"6px"}}>
                      <span style={{fontSize:"0.9rem"}}>⚠️</span>
                      <div style={{fontSize:"0.7rem",color:"#f87171",fontWeight:600}}>{cat} — persistent weakness</div>
                    </div>
                  ))
                }
              </div>
              {/* Latest HVS entry */}
              {latestEntry&&(
                <div style={card}>
                  <div style={secHdr}>Latest HVS Entry</div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span style={{fontSize:"0.68rem",color:"rgba(255,255,255,0.45)"}}>{latestEntry.week||latestEntry.created_at?.slice(0,10)||"—"}</span>
                    <span style={{fontSize:"1.1rem",fontWeight:900,color:house.color}}>{latestEntry.totalScore||latestEntry.total_score||0}</span>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// ── Student Achievement Portfolio ────────────────────────────────
function StudentPortfolio({ student, results=[], onClose }) {
  const G="#d4af37"; const N="#0f172a";
  const house = HOUSES.find(h=>h.id===student.houseId)||HOUSES[0];
  const sid   = student.id;

  const [hvsLogs,   setHvsLogs]   = useState([]);
  const [lroles,    setLroles]    = useState([]);
  const [awards,    setAwards]    = useState([]);
  const [noteText,  setNoteText]  = useState("");
  const [noteSaving,setNoteSaving]= useState(false);
  const [noteSaved, setNoteSaved] = useState(false);

  useEffect(()=>{
    getData("hvs_logs").then(d=>{ if(d&&!d.error) setHvsLogs(d.filter(l=>l.houseId===student.houseId||l.house_id===student.houseId)); });
    getData("leadership_roles").then(d=>{ if(d&&!d.error) setLroles(d.filter(l=>l.holder_name===student.name&&l.week!=="assign")); });
    getData("student_awards").then(d=>{ if(d&&!d.error) setAwards(d.filter(a=>(a.student_id===sid||a.studentId===sid))); });
    getData("portfolio_notes").then(d=>{ if(d&&!d.error){ const n=d.filter(n=>(n.student_id===sid||n.studentId===sid)).sort((a,b)=>new Date(b.created_at)-new Date(a.created_at))[0]; if(n) setNoteText(n.note||""); }});
  },[]);

  const saveNote=async()=>{
    setNoteSaving(true);
    await sbAdd("portfolio_notes",{student_id:sid,note:noteText,updated_at:new Date().toISOString()});
    setNoteSaving(false); setNoteSaved(true); setTimeout(()=>setNoteSaved(false),2000);
  };

  // ── HVS monthly chart data ────────────────────────────────────
  const monthMap={};
  hvsLogs.forEach(l=>{
    const mo = l.created_at ? l.created_at.slice(0,7) : (l.week&&l.week!=="assign" ? l.week.split("-W")[0]+"-"+(Math.ceil(parseInt(l.week.split("-W")[1])/4.33)).toString().padStart(2,"0") : null);
    if(!mo) return;
    if(!monthMap[mo]) monthMap[mo]=0;
    monthMap[mo]+=(l.totalScore||l.total_score||0);
  });
  const monthEntries=Object.entries(monthMap).sort(([a],[b])=>a.localeCompare(b)).slice(-12);
  const maxHvs=Math.max(...monthEntries.map(([,v])=>v),1);
  const bestMo=monthEntries.reduce((best,[mo,v])=>v>best[1]?[mo,v]:best,["",0]);

  // ── Ordinal helpers ───────────────────────────────────────────
  const ROLES_MAP={housemaster:"House Master",vicemaster:"Vice Master",moralityhead:"Morality Head",societyhead:"Society Head",cleanlinesshead:"Cleanliness Head",captain:"Student Captain",monitor:"Class Monitor"};
  const roleMonths=[...new Set(lroles.map(r=>r.month))].sort().reverse();

  // ── Years at Ameen ────────────────────────────────────────────
  const enrollYear = student.created_at ? new Date(student.created_at).getFullYear() : null;
  const yearsHere  = enrollYear ? (new Date().getFullYear()-enrollYear+1) : null;

  // ── Styles ───────────────────────────────────────────────────
  const secHdr={fontSize:"0.7rem",fontWeight:800,color:G,letterSpacing:"0.08em",marginBottom:"12px",paddingBottom:"6px",borderBottom:"1px solid rgba(255,255,255,0.07)",display:"flex",alignItems:"center",gap:"8px"};
  const card  ={background:"rgba(255,255,255,0.05)",borderRadius:"12px",border:"1px solid rgba(255,255,255,0.07)",padding:"12px"};

  // ── Student results for portfolio ─────────────────────────────
  const stuResults=[...results].filter(r=>(r.studentId||r.student_id)===sid)
    .sort((a,b)=>new Date(b.date||b.created_at||0)-new Date(a.date||a.created_at||0));
  const avgPct=stuResults.length?Math.round(stuResults.reduce((s,r)=>s+(r.percentage||0),0)/stuResults.length):null;

  // ── Print ─────────────────────────────────────────────────────
  const doPrint=()=>{
    const hvsRows=monthEntries.map(([mo,v])=>`<tr${mo===bestMo[0]?' style="background:#fef3c7;font-weight:700"':''}><td>${mo}</td><td style="text-align:center">${v}</td><td>${mo===bestMo[0]?"⭐ Best Month":""}</td></tr>`).join("");
    const roleRows=lroles.map(r=>`<tr><td>${ROLES_MAP[r.role_id]||r.role_id}</td><td>${r.month}</td><td style="text-align:center">${r.points_earned}/${r.points_possible||"—"}</td><td>${r.rating||"—"}</td></tr>`).join("");
    const awardRows=awards.length?awards.map(a=>`<tr><td>${a.award_name||a.name||"—"}</td><td>${a.month||a.date||"—"}</td><td>${a.notes||"—"}</td></tr>`).join(""):`<tr><td colspan="3" style="text-align:center;color:#94a3b8">No awards</td></tr>`;
    const w=window.open("","_blank","width=900,height=750");
    w.document.write(`<!DOCTYPE html><html dir="ltr"><body style="font-family:serif;padding:24px;direction:ltr;background:#fff;color:#1e293b">
      <img src="${letterhead}" style="width:100%;max-width:700px;display:block;margin:0 auto 16px" onerror="this.style.display='none'"/>
      <h2 style="text-align:center;color:#1e293b;margin-bottom:2px">Student Achievement Portfolio</h2>
      <h3 style="text-align:center;color:#b7860b;margin-top:0">Ameen Islamic Institute</h3>
      <div style="display:flex;justify-content:space-between;background:#f8fafc;padding:12px 16px;border-radius:8px;margin-bottom:20px;font-size:13px;flex-wrap:wrap;gap:8px">
        <div><strong>Name:</strong> ${student.name||"—"}</div>
        <div><strong>Father:</strong> ${student.fatherName||"—"}</div>
        <div><strong>Class:</strong> ${student.grade||"—"}</div>
        <div><strong>House:</strong> ${house.nameEn}</div>
        <div><strong>Code:</strong> ${student.studentCode||"—"}</div>
        ${yearsHere?`<div><strong>Years:</strong> ${yearsHere}</div>`:""}
        ${avgPct!==null?`<div><strong>Avg Result:</strong> ${avgPct}%</div>`:""}
      </div>
      <h4 style="color:#1e293b;margin-bottom:6px">📊 HVS Monthly Performance</h4>
      <table border="1" cellpadding="7" style="width:100%;border-collapse:collapse;font-size:12px;margin-bottom:20px">
        <tr style="background:#1e293b;color:#fff"><th>Month</th><th>Score</th><th>Note</th></tr>
        ${hvsRows||'<tr><td colspan="3" style="text-align:center;color:#94a3b8">No data</td></tr>'}
      </table>
      <h4 style="color:#1e293b;margin-bottom:6px">🏅 Awards &amp; Badges</h4>
      <table border="1" cellpadding="7" style="width:100%;border-collapse:collapse;font-size:12px;margin-bottom:20px">
        <tr style="background:#1e293b;color:#fff"><th>Award</th><th>Month/Date</th><th>Notes</th></tr>
        ${awardRows}
      </table>
      <h4 style="color:#1e293b;margin-bottom:6px">👑 Leadership &amp; Roles</h4>
      <table border="1" cellpadding="7" style="width:100%;border-collapse:collapse;font-size:12px;margin-bottom:20px">
        <tr style="background:#1e293b;color:#fff"><th>Role</th><th>Month</th><th>Points</th><th>Rating</th></tr>
        ${roleRows||'<tr><td colspan="4" style="text-align:center;color:#94a3b8">No records</td></tr>'}
      </table>
      <h4 style="color:#1e293b;margin-bottom:6px">📝 House Master Note</h4>
      <div style="border:1px solid #e2e8f0;border-radius:8px;padding:14px;min-height:80px;font-size:13px;color:#475569">${noteText||"— No note —"}</div>
      <div style="margin-top:50px;display:flex;justify-content:space-between;align-items:flex-end">
        <div style="text-align:center;min-width:180px"><div style="border-top:1.5px solid #0f172a;padding-top:6px;font-size:13px">House Master Signature</div></div>
        <div style="font-size:11px;color:#64748b">Printed: ${new Date().toLocaleDateString("en-PK",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</div>
      </div>
      <script>window.print();window.close();<\/script>
    </body></html>`);
  };

  function getInitials(name){ if(!name)return"?"; const p=name.trim().split(" "); return(p.length>1?p[0][0]+p[1][0]:p[0][0]).toUpperCase(); }

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.9)",zIndex:3000,overflowY:"auto",display:"flex",alignItems:"flex-start",justifyContent:"center",padding:"20px",backdropFilter:"blur(6px)"}}
      onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{background:"linear-gradient(160deg,#0f172a 0%,#0d1f3c 60%,#0a1628 100%)",borderRadius:"22px",width:"100%",maxWidth:"740px",border:`1px solid ${house.color}33`,overflow:"hidden",marginBottom:"20px"}}>

        {/* ── Hero Header ── */}
        <div style={{background:`linear-gradient(135deg,${house.color}18,rgba(255,255,255,0.03))`,padding:"22px 24px",borderBottom:"1px solid rgba(255,255,255,0.07)",display:"flex",gap:"18px",alignItems:"flex-start",position:"relative"}}>
          <button onClick={onClose} style={{position:"absolute",top:"14px",left:"14px",background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:"8px",color:"rgba(255,255,255,0.55)",width:"32px",height:"32px",cursor:"pointer",fontSize:"1rem",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
          <button onClick={doPrint} style={{position:"absolute",top:"14px",left:"54px",background:`${G}20`,border:`1px solid ${G}44`,borderRadius:"8px",color:G,padding:"6px 12px",cursor:"pointer",fontSize:"0.68rem",fontWeight:700,fontFamily:"inherit"}}>🖨️ Print</button>

          {student.photoUrl
            ?<img src={student.photoUrl} alt={student.name} style={{width:"86px",height:"86px",borderRadius:"16px",objectFit:"cover",border:`2px solid ${house.color}`,flexShrink:0}}/>
            :<div style={{width:"86px",height:"86px",borderRadius:"16px",background:`${house.color}25`,color:house.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"2.2rem",fontWeight:700,border:`2px solid ${house.color}44`,flexShrink:0}}>{getInitials(student.name)}</div>
          }
          <div style={{flex:1,paddingTop:"4px"}}>
            <div style={{color:"#f1f5f9",fontSize:"1.18rem",fontWeight:800,marginBottom:"3px"}}>{student.name||"—"}</div>
            <div style={{color:"rgba(255,255,255,0.4)",fontSize:"0.7rem",marginBottom:"10px"}}>Father: {student.fatherName||"—"}{yearsHere?` · ${yearsHere} yrs at Ameen`:""}</div>
            <div style={{display:"flex",gap:"6px",flexWrap:"wrap"}}>
              <span style={{background:`${house.color}20`,color:house.color,borderRadius:"8px",padding:"3px 10px",fontSize:"0.65rem",fontWeight:700,border:`1px solid ${house.color}35`}}>{house.emoji} {house.nameEn}</span>
              <span style={{background:"rgba(212,175,55,0.15)",color:G,borderRadius:"8px",padding:"3px 10px",fontSize:"0.65rem",fontWeight:700}}>{student.grade||"—"}</span>
              {student.section&&<span style={{background:"rgba(255,255,255,0.08)",color:"rgba(255,255,255,0.55)",borderRadius:"8px",padding:"3px 10px",fontSize:"0.65rem"}}>{student.section}</span>}
              {student.studentCode&&<span style={{background:"rgba(255,255,255,0.05)",color:"rgba(255,255,255,0.3)",borderRadius:"8px",padding:"3px 10px",fontSize:"0.6rem",fontFamily:"monospace",direction:"ltr"}}>{student.studentCode}</span>}
              {avgPct!==null&&<span style={{background:"rgba(74,222,128,0.12)",color:"#4ade80",borderRadius:"8px",padding:"3px 10px",fontSize:"0.65rem",fontWeight:700}}>📊 {avgPct}% avg</span>}
            </div>
          </div>
        </div>

        <div style={{padding:"20px",display:"flex",flexDirection:"column",gap:"20px"}}>

          {/* ── Section 2: HVS Monthly Bar Chart ── */}
          <section>
            <div style={secHdr}><span>📊</span> HVS Monthly Performance — {house.nameEn} House</div>
            {monthEntries.length===0
              ? <div style={{...card,textAlign:"center",color:"rgba(255,255,255,0.2)",padding:"24px"}}>Loading HVS data...</div>
              : (
                <div style={{...card}}>
                  <div style={{display:"flex",alignItems:"flex-end",gap:"6px",height:"90px",overflowX:"auto",paddingBottom:"4px"}}>
                    {monthEntries.map(([mo,v])=>{
                      const isBest=mo===bestMo[0];
                      const pct=Math.max(4,Math.round((v/maxHvs)*100));
                      return (
                        <div key={mo} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"3px",flexShrink:0,minWidth:"38px"}}>
                          <div style={{fontSize:"0.55rem",color:isBest?G:"rgba(255,255,255,0.5)",fontWeight:isBest?800:400}}>{v}</div>
                          <div style={{width:"28px",height:`${pct*0.7}px`,minHeight:"4px",borderRadius:"4px 4px 2px 2px",background:isBest?`linear-gradient(180deg,${G},${house.color})`:`${house.color}88`,transition:"height 0.4s",boxShadow:isBest?`0 0 8px ${G}55`:""}}/>
                          {isBest&&<div style={{fontSize:"0.55rem"}}>⭐</div>}
                          <div style={{fontSize:"0.52rem",color:"rgba(255,255,255,0.3)",direction:"ltr",writingMode:"vertical-rl",transform:"rotate(180deg)",height:"30px",whiteSpace:"nowrap"}}>{mo.slice(5)}</div>
                        </div>
                      );
                    })}
                  </div>
                  {bestMo[0]&&(
                    <div style={{marginTop:"10px",fontSize:"0.65rem",color:G,fontWeight:700}}>⭐ Best Month: {bestMo[0]} — {bestMo[1]} pts</div>
                  )}
                </div>
              )
            }
          </section>

          {/* ── Section 3: Awards & Badges ── */}
          <section>
            <div style={secHdr}><span>🏅</span> Awards &amp; Badges</div>
            {awards.length===0
              ? <div style={{...card,display:"flex",gap:"12px",alignItems:"center",padding:"16px"}}>
                  <span style={{fontSize:"1.6rem",opacity:0.3}}>🏅</span>
                  <div style={{color:"rgba(255,255,255,0.2)",fontSize:"0.72rem"}}>No award records — use the Awards module to add awards</div>
                </div>
              : <div style={{display:"flex",flexDirection:"column",gap:"6px"}}>
                  {awards.map((a,i)=>{
                    const isGold=(a.award_name||"").toLowerCase().includes("star")||(a.award_name||"").includes("Star");
                    return (
                      <div key={i} style={{...card,display:"flex",alignItems:"center",gap:"12px"}}>
                        <span style={{fontSize:"1.4rem"}}>{isGold?"⭐":"🏅"}</span>
                        <div style={{flex:1}}>
                          <div style={{fontSize:"0.78rem",fontWeight:700,color:isGold?G:"#f1f5f9"}}>{a.award_name||a.name||"Award"}</div>
                          <div style={{fontSize:"0.6rem",color:"rgba(255,255,255,0.35)",marginTop:"2px"}}>{a.month||a.date||"—"}</div>
                        </div>
                        {isGold&&<span style={{background:`${G}20`,color:G,borderRadius:"8px",padding:"3px 10px",fontSize:"0.62rem",fontWeight:700,border:`1px solid ${G}33`}}>Gold Badge</span>}
                      </div>
                    );
                  })}
                </div>
            }
          </section>

          {/* ── Section 4: Leadership Roles ── */}
          <section>
            <div style={secHdr}><span>👑</span> Leadership &amp; Roles</div>
            {lroles.length===0
              ? <div style={{...card,display:"flex",gap:"12px",alignItems:"center",padding:"16px"}}>
                  <span style={{fontSize:"1.6rem",opacity:0.3}}>👑</span>
                  <div style={{color:"rgba(255,255,255,0.2)",fontSize:"0.72rem"}}>No leadership roles found</div>
                </div>
              : (
                <div style={{overflowX:"auto"}}>
                  <table style={{width:"100%",borderCollapse:"collapse",minWidth:"420px"}}>
                    <thead>
                      <tr>{["کردار","ماہ","نمبر","ریٹنگ"].map(h=>(
                        <th key={h} style={{padding:"8px 12px",textAlign:"left",fontSize:"0.62rem",color:"rgba(255,255,255,0.4)",borderBottom:"1px solid rgba(255,255,255,0.07)",fontWeight:700}}>{h}</th>
                      ))}</tr>
                    </thead>
                    <tbody>
                      {lroles.map((r,i)=>{
                        const rColor=r.rating==="Excellent"?"#4ade80":r.rating==="Good"?G:r.rating==="Fair"?"#fb923c":"#f87171";
                        return (
                          <tr key={i} style={{borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                            <td style={{padding:"8px 12px",fontSize:"0.72rem",color:"#f1f5f9",fontWeight:600}}>{ROLES_MAP[r.role_id]||r.role_id}</td>
                            <td style={{padding:"8px 12px",fontSize:"0.68rem",color:"rgba(255,255,255,0.45)",direction:"ltr"}}>{r.month}</td>
                            <td style={{padding:"8px 12px",fontSize:"0.72rem",color:G,fontWeight:700,direction:"ltr",textAlign:"center"}}>{r.points_earned}</td>
                            <td style={{padding:"8px 12px"}}>
                              <span style={{background:rColor+"22",color:rColor,borderRadius:"8px",padding:"2px 9px",fontSize:"0.62rem",fontWeight:700}}>{r.rating||"—"}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )
            }
          </section>

          {/* ── Section 5: House Master Note ── */}
          <section>
            <div style={secHdr}><span>📝</span> House Master Note</div>
            <div style={card}>
              <div style={{fontSize:"0.62rem",color:"rgba(255,255,255,0.35)",marginBottom:"8px"}}>Recommendation / Character note — written by House Master</div>
              <textarea
                value={noteText}
                onChange={e=>setNoteText(e.target.value)}
                placeholder="e.g. This student excels in morality, diligence and leadership..."
                rows={4}
                style={{width:"100%",padding:"10px 12px",borderRadius:"10px",border:"1px solid rgba(255,255,255,0.12)",background:"rgba(255,255,255,0.05)",color:"#f1f5f9",fontSize:"0.75rem",fontFamily:"inherit",outline:"none",resize:"vertical",boxSizing:"border-box"}}/>
              <div style={{display:"flex",justifyContent:"flex-start",marginTop:"10px"}}>
                <button onClick={saveNote} disabled={noteSaving}
                  style={{padding:"8px 20px",borderRadius:"10px",border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:"0.72rem",fontWeight:700,
                    background:noteSaved?"rgba(74,222,128,0.3)":noteSaving?"rgba(255,255,255,0.1)":`linear-gradient(135deg,${G},#7a5807)`,
                    color:noteSaved?"#4ade80":"#0f172a",opacity:noteSaving?0.6:1}}>
                  {noteSaving?"Saving...":noteSaved?"✅ Saved!":"✔ Save Note"}
                </button>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}

export default Students;
