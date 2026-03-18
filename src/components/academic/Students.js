/* eslint-disable */
import { useState } from "react";
import { HOUSES } from "../../constants";
import { supabase } from "../../supabase";

function Students({students,addData,results=[],fees=[],hifzLogs=[]}){
  const G="#d4af37";const N="#0f172a";
  const glass={background:"rgba(255,255,255,0.07)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:"16px"};
  const [show,setShow]=useState(false);
  const [profileStudent,setProfileStudent]=useState(null);
  const [q,setQ]=useState("");
  const [filter,setFilter]=useState("all");
  const [filterGrade,setFilterGrade]=useState("all");
  const [f,setF]=useState({name:"",fatherName:"",grade:"Grade 7",section:"Orchid",houseId:"abuBakr",studentCode:"",canteenBalance:0,talent:"",phone:"",enrollmentStatus:"active",photoUrl:""});
  const [uploading,setUploading]=useState(false);
  const [uploadError,setUploadError]=useState(null);
  const [photoPreview,setPhotoPreview]=useState(null);

  const uploadStudentPhoto=async(event)=>{
    if(!event.target.files||event.target.files.length===0){setUploadError("براہ کرم تصویر منتخب کریں");return;}
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
    if(!f.name){alert("براہ کرم طالب علم کا نام درج کریں");return;}
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
    setF({name:"",fatherName:"",grade:"Grade 7",section:"Orchid",houseId:"abuBakr",studentCode:"",canteenBalance:0,talent:"",phone:"",enrollmentStatus:"active",photoUrl:""});
    setPhotoPreview(null);setUploadError(null);
  };

  const filtered=students.filter(s=>{
    const matchQ=!q||s.name?.includes(q)||s.studentCode?.includes(q)||s.fatherName?.includes(q)||s.roll_no?.includes(q);
    const matchF=filter==="all"||(filter==="active"&&s.enrollmentStatus==="active")||(filter==="inactive"&&s.enrollmentStatus!=="active");
    const matchG=filterGrade==="all"||s.grade===filterGrade;
    return matchQ&&matchF&&matchG;
  });

  const grades=["Grade 6","Grade 7","Grade 8","Grade 9","Grade 10"];
  const sections=["Orchid","Lily","Jasmine","Rose","Tulip"];
  const inp={width:"100%",padding:"10px 14px",borderRadius:"10px",border:"1px solid rgba(212,175,55,0.25)",background:"rgba(255,255,255,0.06)",color:"#f1f5f9",fontSize:"0.8rem",fontFamily:"'Public Sans',sans-serif",outline:"none",boxSizing:"border-box",direction:"rtl"};
  const lbl={fontSize:"0.7rem",color:"rgba(212,175,55,0.8)",marginBottom:"6px",display:"block",fontWeight:"600"};
  const activeCount=students.filter(s=>s.enrollmentStatus==="active").length;

  function getInitials(name){
    if(!name)return "?";
    const parts=name.trim().split(" ");
    return parts.length>1?(parts[0][0]+parts[1][0]).toUpperCase():parts[0][0].toUpperCase();
  }

  const displayPhoto=photoPreview||f.photoUrl;

  return(
    <div style={{padding:"16px",maxWidth:"1100px",margin:"0 auto"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"20px",flexWrap:"wrap",gap:"12px"}}>
        <div>
          <div style={{fontSize:"1.3rem",fontWeight:800,color:"#f1f5f9"}}>🎓 طلبا</div>
          <div style={{fontSize:"0.75rem",color:"rgba(255,255,255,0.5)"}}>Students — کل: {students.length} | فعال: {activeCount}</div>
        </div>
        <button onClick={()=>setShow(true)} style={{background:G,color:N,border:"none",borderRadius:"12px",padding:"10px 20px",fontSize:"0.82rem",fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
          + نیا طالب علم
        </button>
      </div>

      <div style={{display:"flex",gap:"10px",marginBottom:"16px",flexWrap:"wrap"}}>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="🔍 نام، کوڈ، والد نام سے تلاش..."
          style={{...inp,flex:1,minWidth:"200px",background:"rgba(255,255,255,0.08)"}}/>
        <select value={filter} onChange={e=>setFilter(e.target.value)} style={{...inp,width:"140px",background:"rgba(255,255,255,0.08)"}}>
          <option value="all">سب طلبا</option>
          <option value="active">فعال</option>
          <option value="inactive">غیر فعال</option>
        </select>
        <select value={filterGrade} onChange={e=>setFilterGrade(e.target.value)} style={{...inp,width:"140px",background:"rgba(255,255,255,0.08)"}}>
          <option value="all">تمام جماعتیں</option>
          {grades.map(g=><option key={g} value={g}>{g}</option>)}
        </select>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:"14px"}}>
        {filtered.length===0&&<div style={{color:"rgba(255,255,255,0.4)",padding:"40px",textAlign:"center",gridColumn:"1/-1"}}>کوئی طالب علم نہیں ملا</div>}
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
                <div style={{color:"rgba(255,255,255,0.5)",fontSize:"0.72rem",marginBottom:"2px"}}>والد: {s.fatherName||"—"}</div>
                <div style={{display:"flex",gap:"6px",flexWrap:"wrap",marginTop:"6px"}}>
                  <span style={{background:"rgba(212,175,55,0.15)",color:G,borderRadius:"8px",padding:"2px 8px",fontSize:"0.65rem",fontWeight:600}}>{s.grade||"—"}</span>
                  {s.section&&<span style={{background:"rgba(255,255,255,0.08)",color:"rgba(255,255,255,0.6)",borderRadius:"8px",padding:"2px 8px",fontSize:"0.65rem"}}>{s.section}</span>}
                  <span style={{background:s.enrollmentStatus==="active"?"rgba(34,197,94,0.15)":"rgba(239,68,68,0.15)",color:s.enrollmentStatus==="active"?"#4ade80":"#f87171",borderRadius:"8px",padding:"2px 8px",fontSize:"0.65rem",fontWeight:600}}>
                    {s.enrollmentStatus==="active"?"فعال":"غیر فعال"}
                  </span>
                  {house&&<span style={{background:house.color+"30",color:house.color,borderRadius:"8px",padding:"2px 8px",fontSize:"0.65rem",fontWeight:600}}>{house.name}</span>}
                </div>
                {s.phone&&<div style={{color:"rgba(255,255,255,0.4)",fontSize:"0.68rem",marginTop:"4px"}}>📞 {s.phone}</div>}
                <button onClick={()=>setProfileStudent(s)} style={{marginTop:"10px",width:"100%",padding:"7px",borderRadius:"9px",border:`1px solid rgba(212,175,55,0.35)`,background:"rgba(212,175,55,0.08)",color:G,fontSize:"0.68rem",fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
                  👁 پروفائل دیکھیں
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {profileStudent&&<StudentProfile student={profileStudent} results={results} fees={fees} hifzLogs={hifzLogs} onClose={()=>setProfileStudent(null)}/>}

      {show&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:"16px"}}
          onClick={e=>{if(e.target===e.currentTarget)setShow(false);}}>
          <div style={{...glass,padding:"24px",width:"100%",maxWidth:"500px",maxHeight:"90vh",overflowY:"auto"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"20px"}}>
              <div style={{color:G,fontSize:"1.1rem",fontWeight:800}}>نیا طالب علم شامل کریں</div>
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
                {uploading?"اپ لوڈ ہو رہا ہے...":(displayPhoto?"تصویر بدلیں":"تصویر اپ لوڈ کریں")}
              </label>
              {displayPhoto&&<button onClick={removePhoto} style={{background:"rgba(248,113,113,0.1)",border:"1px solid rgba(248,113,113,0.3)",color:"#f87171",borderRadius:"8px",padding:"4px 10px",fontSize:"0.68rem",cursor:"pointer",fontFamily:"inherit"}}>تصویر ہٹائیں</button>}
              {uploadError&&<div style={{color:"#f87171",fontSize:"0.7rem"}}>{uploadError}</div>}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px"}}>
              <div style={{gridColumn:"1/-1"}}>
                <label style={lbl}>نام *</label>
                <input style={inp} placeholder="طالب علم کا نام" value={f.name} onChange={e=>setF({...f,name:e.target.value})}/>
              </div>
              <div style={{gridColumn:"1/-1"}}>
                <label style={lbl}>والد کا نام</label>
                <input style={inp} placeholder="والد کا نام" value={f.fatherName} onChange={e=>setF({...f,fatherName:e.target.value})}/>
              </div>
              <div>
                <label style={lbl}>جماعت</label>
                <select style={inp} value={f.grade} onChange={e=>setF({...f,grade:e.target.value})}>
                  {grades.map(g=><option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>سیکشن</label>
                <select style={inp} value={f.section} onChange={e=>setF({...f,section:e.target.value})}>
                  {sections.map(s=><option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>ہاؤس</label>
                <select style={inp} value={f.houseId} onChange={e=>setF({...f,houseId:e.target.value})}>
                  {(HOUSES||[]).map(h=><option key={h.id} value={h.id}>{h.name}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>صورتحال</label>
                <select style={inp} value={f.enrollmentStatus} onChange={e=>setF({...f,enrollmentStatus:e.target.value})}>
                  <option value="active">فعال</option>
                  <option value="inactive">غیر فعال</option>
                  <option value="graduated">فارغ التحصیل</option>
                </select>
              </div>
              <div>
                <label style={lbl}>طالب علم کوڈ</label>
                <input style={inp} placeholder="کوڈ" value={f.studentCode} onChange={e=>setF({...f,studentCode:e.target.value})}/>
              </div>
              <div>
                <label style={lbl}>فون نمبر</label>
                <input style={inp} placeholder="03XXXXXXXXX" value={f.phone} onChange={e=>setF({...f,phone:e.target.value})}/>
              </div>
              <div>
                <label style={lbl}>کینٹین بیلنس</label>
                <input style={inp} type="number" placeholder="0" value={f.canteenBalance} onChange={e=>setF({...f,canteenBalance:e.target.value})}/>
              </div>
              <div>
                <label style={lbl}>خصوصی صلاحیت</label>
                <input style={inp} placeholder="مثلاً: حافظ، کھیل" value={f.talent} onChange={e=>setF({...f,talent:e.target.value})}/>
              </div>
            </div>
            <button onClick={add} style={{width:"100%",marginTop:"20px",background:G,color:N,border:"none",borderRadius:"12px",padding:"12px",fontSize:"0.9rem",fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
              ✅ طالب علم شامل کریں
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function StudentProfile({student,results,fees,hifzLogs,onClose}){
  const G="#d4af37"; const N="#0f172a";
  const house=HOUSES.find(h=>h.id===student.houseId);
  const sid=student.id;
  const gc=p=>p>=80?"#4ade80":p>=60?"#fb923c":"#f87171";
  function getInitials(name){ if(!name)return"?"; const p=name.trim().split(" "); return(p.length>1?p[0][0]+p[1][0]:p[0][0]).toUpperCase(); }

  // filter + sort helpers — handle both camelCase and snake_case field names
  const sResults=[...results].filter(r=>(r.studentId||r.student_id)===sid)
    .sort((a,b)=>new Date(b.date||b.created_at||0)-new Date(a.date||a.created_at||0)).slice(0,5);
  const sFees=[...fees].filter(f=>(f.studentId||f.student_id)===sid)
    .sort((a,b)=>new Date(b.date||b.created_at||0)-new Date(a.date||a.created_at||0));
  const sHifz=[...hifzLogs].filter(h=>(h.studentId||h.student_id)===sid)
    .sort((a,b)=>new Date(b.date||b.created_at||0)-new Date(a.date||a.created_at||0)).slice(0,5);
  const paidFees=sFees.filter(f=>f.status==="paid");
  const pendingFees=sFees.filter(f=>f.status!=="paid");
  const paidTotal=paidFees.reduce((s,f)=>s+(f.amount||0),0);
  const pendingTotal=pendingFees.reduce((s,f)=>s+(f.amount||0),0);
  const avgPct=sResults.length?Math.round(sResults.reduce((s,r)=>s+(r.percentage||0),0)/sResults.length):null;

  const glass={background:"rgba(255,255,255,0.06)",borderRadius:"12px",border:"1px solid rgba(255,255,255,0.08)",padding:"14px"};
  const secTitle={fontSize:"0.65rem",fontWeight:700,color:G,letterSpacing:"0.1em",marginBottom:"10px"};
  const pill=(bg,col,txt)=><span style={{background:bg,color:col,borderRadius:"8px",padding:"3px 10px",fontSize:"0.65rem",fontWeight:600}}>{txt}</span>;

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.88)",zIndex:2000,overflowY:"auto",display:"flex",alignItems:"flex-start",justifyContent:"center",padding:"20px"}}
      onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{background:"linear-gradient(160deg,#0f172a 0%,#0d1f3c 60%,#0a1628 100%)",borderRadius:"20px",width:"100%",maxWidth:"660px",border:"1px solid rgba(212,175,55,0.2)",overflow:"hidden",marginBottom:"20px"}}>

        {/* ── Hero ── */}
        <div style={{background:"rgba(212,175,55,0.05)",padding:"24px",display:"flex",gap:"18px",alignItems:"flex-start",borderBottom:"1px solid rgba(255,255,255,0.07)",position:"relative"}}>
          <button onClick={onClose} style={{position:"absolute",top:"14px",left:"14px",background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:"8px",color:"rgba(255,255,255,0.55)",width:"32px",height:"32px",cursor:"pointer",fontSize:"1.1rem",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
          {student.photoUrl
            ?<img src={student.photoUrl} alt={student.name} style={{width:"82px",height:"82px",borderRadius:"16px",objectFit:"cover",border:`2px solid ${G}`,flexShrink:0}}/>
            :<div style={{width:"82px",height:"82px",borderRadius:"16px",background:"rgba(212,175,55,0.15)",color:G,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"2.2rem",fontWeight:700,border:`2px solid rgba(212,175,55,0.3)`,flexShrink:0}}>{getInitials(student.name)}</div>
          }
          <div style={{flex:1,paddingTop:"4px"}}>
            <div style={{color:"#f1f5f9",fontSize:"1.15rem",fontWeight:800,marginBottom:"4px"}}>{student.name||"—"}</div>
            <div style={{color:"rgba(255,255,255,0.4)",fontSize:"0.72rem",marginBottom:"10px"}}>والد: {student.fatherName||"—"}</div>
            <div style={{display:"flex",gap:"6px",flexWrap:"wrap"}}>
              {pill("rgba(212,175,55,0.15)",G,student.grade||"—")}
              {student.section&&pill("rgba(255,255,255,0.08)","rgba(255,255,255,0.6)",student.section)}
              {pill(student.enrollmentStatus==="active"?"rgba(34,197,94,0.15)":"rgba(239,68,68,0.15)",student.enrollmentStatus==="active"?"#4ade80":"#f87171",student.enrollmentStatus==="active"?"فعال":"غیر فعال")}
              {house&&<span style={{background:house.color+"20",color:house.color,borderRadius:"8px",padding:"3px 10px",fontSize:"0.65rem",fontWeight:700,border:`1px solid ${house.color}35`}}>{house.emoji} {house.nameEn}</span>}
            </div>
            {student.studentCode&&<div style={{color:"rgba(255,255,255,0.25)",fontSize:"0.6rem",marginTop:"6px",fontFamily:"monospace",direction:"ltr"}}>{student.studentCode}</div>}
          </div>
        </div>

        <div style={{padding:"20px",display:"flex",flexDirection:"column",gap:"18px"}}>

          {/* ── Personal Info ── */}
          <section>
            <div style={secTitle}>👤 ذاتی معلومات</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px"}}>
              {[["📞 فون",student.phone||"—"],["📋 رول نمبر",student.roll_no||"—"],["🏦 کینٹین بیلنس",`Rs ${student.canteenBalance||0}`],["🌟 صلاحیت",student.talent||"—"]].map(([lbl,val])=>(
                <div key={lbl} style={glass}>
                  <div style={{fontSize:"0.58rem",color:"rgba(255,255,255,0.3)",marginBottom:"3px"}}>{lbl}</div>
                  <div style={{fontSize:"0.78rem",fontWeight:600,color:"#f1f5f9"}}>{val}</div>
                </div>
              ))}
              {house&&(
                <div style={{gridColumn:"1/-1",background:`${house.color}0f`,borderRadius:"12px",padding:"12px 14px",border:`1px solid ${house.color}25`,display:"flex",alignItems:"center",gap:"12px"}}>
                  <span style={{fontSize:"1.6rem"}}>{house.emoji}</span>
                  <div>
                    <div style={{fontWeight:700,color:house.color,fontSize:"0.82rem"}}>{house.nameEn} — {house.name}</div>
                    <div style={{fontSize:"0.58rem",color:"rgba(255,255,255,0.3)",marginTop:"2px"}}>{house.slogan}</div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* ── Latest 5 Results ── */}
          <section>
            <div style={{...secTitle,display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"10px"}}>
              <span>📊 حالیہ نتائج</span>
              {avgPct!==null&&<span style={{color:gc(avgPct),fontWeight:700,fontSize:"0.68rem"}}>اوسط: {avgPct}%</span>}
            </div>
            {sResults.length===0
              ?<div style={{...glass,textAlign:"center",color:"rgba(255,255,255,0.2)",fontSize:"0.72rem",padding:"20px"}}>کوئی نتیجہ نہیں</div>
              :<div style={{display:"flex",flexDirection:"column",gap:"5px"}}>
                {sResults.map((r,i)=>{
                  const pct=r.percentage||Math.round(((r.obtainedMarks||0)/(r.totalMarks||1))*100)||0;
                  return(
                    <div key={i} style={{display:"flex",alignItems:"center",gap:"10px",background:"rgba(255,255,255,0.04)",borderRadius:"10px",padding:"9px 12px",border:"1px solid rgba(255,255,255,0.06)"}}>
                      <div style={{flex:1}}>
                        <div style={{fontSize:"0.76rem",fontWeight:600,color:"#f1f5f9"}}>{r.subject||"—"}</div>
                        <div style={{fontSize:"0.6rem",color:"rgba(255,255,255,0.3)"}}>{r.exam||"—"}</div>
                      </div>
                      <div style={{fontSize:"0.7rem",color:"rgba(255,255,255,0.4)",direction:"ltr"}}>{r.obtainedMarks||"—"}/{r.totalMarks||"—"}</div>
                      <div style={{fontWeight:800,fontSize:"0.82rem",color:gc(pct),minWidth:"46px",textAlign:"center"}}>{pct}%</div>
                    </div>
                  );
                })}
              </div>
            }
          </section>

          {/* ── Fee Payment Status ── */}
          <section>
            <div style={secTitle}>💰 فیس صورتحال</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px",marginBottom:"8px"}}>
              <div style={{background:"rgba(74,222,128,0.07)",borderRadius:"12px",padding:"12px",border:"1px solid rgba(74,222,128,0.2)",textAlign:"center"}}>
                <div style={{fontSize:"0.58rem",color:"rgba(255,255,255,0.35)",marginBottom:"4px"}}>✅ ادا شدہ</div>
                <div style={{fontSize:"1.05rem",fontWeight:800,color:"#4ade80"}}>Rs {paidTotal.toLocaleString()}</div>
                <div style={{fontSize:"0.58rem",color:"rgba(74,222,128,0.5)",marginTop:"2px"}}>{paidFees.length} ادائیگیاں</div>
              </div>
              <div style={{background:"rgba(251,146,60,0.07)",borderRadius:"12px",padding:"12px",border:"1px solid rgba(251,146,60,0.2)",textAlign:"center"}}>
                <div style={{fontSize:"0.58rem",color:"rgba(255,255,255,0.35)",marginBottom:"4px"}}>⏳ باقی</div>
                <div style={{fontSize:"1.05rem",fontWeight:800,color:"#fb923c"}}>Rs {pendingTotal.toLocaleString()}</div>
                <div style={{fontSize:"0.58rem",color:"rgba(251,146,60,0.5)",marginTop:"2px"}}>{pendingFees.length} باقی</div>
              </div>
            </div>
            {sFees.slice(0,3).map((f,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 12px",background:"rgba(255,255,255,0.03)",borderRadius:"9px",border:"1px solid rgba(255,255,255,0.05)",marginBottom:"4px"}}>
                <div style={{fontSize:"0.7rem",color:"rgba(255,255,255,0.55)"}}>{f.feeType||"فیس"}{f.month?` — ${f.month}`:""}</div>
                <div style={{display:"flex",gap:"8px",alignItems:"center"}}>
                  <span style={{fontSize:"0.7rem",fontWeight:700,color:G}}>Rs {(f.amount||0).toLocaleString()}</span>
                  <span style={{fontSize:"0.58rem",padding:"2px 8px",borderRadius:"12px",fontWeight:700,background:f.status==="paid"?"rgba(74,222,128,0.15)":"rgba(251,146,60,0.15)",color:f.status==="paid"?"#4ade80":"#fb923c"}}>{f.status==="paid"?"ادا":"باقی"}</span>
                </div>
              </div>
            ))}
            {sFees.length===0&&<div style={{...glass,textAlign:"center",color:"rgba(255,255,255,0.2)",fontSize:"0.72rem",padding:"16px"}}>کوئی فیس ریکارڈ نہیں</div>}
          </section>

          {/* ── Hifz Summary ── */}
          <section>
            <div style={secTitle}>📖 حفظ خلاصہ</div>
            {sHifz.length===0
              ?<div style={{...glass,textAlign:"center",color:"rgba(255,255,255,0.2)",fontSize:"0.72rem",padding:"20px"}}>کوئی حفظ ریکارڈ نہیں</div>
              :<div style={{display:"flex",flexDirection:"column",gap:"5px"}}>
                {sHifz.map((h,i)=>(
                  <div key={i} style={{display:"flex",gap:"12px",alignItems:"center",background:"rgba(255,255,255,0.04)",borderRadius:"10px",padding:"9px 12px",border:"1px solid rgba(255,255,255,0.06)"}}>
                    <span style={{fontSize:"1.1rem",flexShrink:0}}>📖</span>
                    <div style={{flex:1}}>
                      <div style={{fontSize:"0.76rem",fontWeight:600,color:"#f1f5f9"}}>{h.surah||h.para||h.lesson||"سبق"}</div>
                      <div style={{fontSize:"0.6rem",color:"rgba(255,255,255,0.3)"}}>{h.type||""}{h.type&&(h.date||h.created_at)?" — ":""}{h.date||h.created_at?.slice(0,10)||""}</div>
                    </div>
                    {h.marks!=null&&<div style={{fontSize:"0.78rem",fontWeight:700,color:G}}>{h.marks}</div>}
                    {h.status&&<span style={{fontSize:"0.6rem",padding:"2px 8px",borderRadius:"12px",background:"rgba(212,175,55,0.12)",color:G,fontWeight:600}}>{h.status}</span>}
                  </div>
                ))}
              </div>
            }
          </section>

        </div>
      </div>
    </div>
  );
}

export default Students;
