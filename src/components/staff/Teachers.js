/* eslint-disable */
import { useState, useEffect } from "react";
import { C, S, hBadge, HOUSES } from "../../constants";
import useClasses from "../../hooks/useClasses";
import EmptyState from "../ui/EmptyState";


function Teachers({teachers,addData}){
  const { gradeOptions } = useClasses();
  const G="#d4af37"; const N="#0f172a"; const N2="#1e293b";
  const glass={background:"rgba(255,255,255,0.07)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:"16px"};
  const [show,setShow]=useState(false); const [q,setQ]=useState("");
  const [filterGrade,setFilterGrade]=useState("all"); const [filterStatus,setFilterStatus]=useState("all");
  const [f,setF]=useState({name:"",subject:"",grade:"Grade 7",employeeCode:"",houseId:"abuBakr",isActive:true,phone:"",qualification:""});
  const add=async()=>{ if(!f.name)return; await addData("teachers",{...f}); setShow(false); setF({name:"",subject:"",grade:"Grade 7",employeeCode:"",houseId:"abuBakr",isActive:true,phone:"",qualification:""}); };
  const [csvLoading,setCsvLoading]=useState(false);
  const [csvResult,setCsvResult]=useState(null);
  const [showCsvGuide,setShowCsvGuide]=useState(false);
  const HOUSE_MAP={"abu bakr":"abuBakr","abubakr":"abuBakr","abubakr":"abuBakr","umar":"umar","uthman":"uthman","ali":"ali"};
  const resolveHouse=(h="")=>HOUSE_MAP[h.toLowerCase().replace(/\s+/g,"")] || HOUSE_MAP[h.toLowerCase()] || "abuBakr";
  const handleTeachersCSV=async(e)=>{
    const file=e.target.files[0]; if(!file)return;
    setCsvLoading(true); setCsvResult(null);
    const text=await file.text();
    const lines=text.split("\n").map(l=>l.trim()).filter(Boolean);
    const isHeader=lines[0]?.toLowerCase().includes("name")||lines[0]?.toLowerCase().includes("teacher");
    const dataLines=isHeader?lines.slice(1):lines;
    let ok=0,skip=0,errs=[];
    for(const line of dataLines){
      const [name,subject,grade,employeeCode,house,phone,qualification]=line.split(",").map(s=>s?.trim());
      if(!name){skip++;continue;}
      try{
        await addData("teachers",{
          name, subject:subject||"",
          grade:grade||"Grade 7",
          employeeCode:employeeCode||"",
          houseId:resolveHouse(house),
          phone:phone||"",
          qualification:qualification||"",
          isActive:true,
        });
        ok++;
      }catch(err){errs.push(`${name}: ${err.message}`);skip++;}
    }
    setCsvResult({ok,skip,errs});
    setCsvLoading(false); e.target.value="";
  };
  const filtered=teachers.filter(t=>{
    const matchQ=!q||t.name?.includes(q)||t.subject?.includes(q)||t.employeeCode?.includes(q);
    const matchG=filterGrade==="all"||t.grade===filterGrade;
    const matchS=filterStatus==="all"||(filterStatus==="active"?t.isActive!==false:t.isActive===false);
    return matchQ&&matchG&&matchS;
  });
  const activeCount=teachers.filter(t=>t.isActive!==false).length;
  const inactiveCount=teachers.length-activeCount;
  const inp={width:"100%",padding:"10px 14px",borderRadius:"10px",border:"1px solid rgba(212,175,55,0.25)",background:"rgba(255,255,255,0.06)",color:"#f1f5f9",fontSize:"0.8rem",fontFamily:"'Public Sans',sans-serif",outline:"none",boxSizing:"border-box",direction:"ltr"};
  const lbl={fontSize:"0.7rem",color:"rgba(212,175,55,0.8)",marginBottom:"6px",display:"block",fontWeight:"600"};
  return (
    <div style={{minHeight:"100vh",background:`linear-gradient(160deg,${N} 0%,#0d1f3c 50%,#0a1628 100%)`,padding:"24px 20px",fontFamily:"'Public Sans',sans-serif",direction:"ltr"}}>
      {/* ── Header ── */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"28px",flexWrap:"wrap",gap:"12px"}}>
        <div>
          <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"6px"}}>
            <div style={{width:"44px",height:"44px",borderRadius:"12px",background:`linear-gradient(135deg,${G},#b8960a)`,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 4px 20px rgba(212,175,55,0.4)`}}>
              <span className="material-symbols-rounded" style={{fontSize:"24px",color:N}}>school</span>
            </div>
            <div>
              <h1 style={{margin:0,fontSize:"1.5rem",fontWeight:"800",color:"#f1f5f9",letterSpacing:"-0.5px"}}>Teachers</h1>
              <p style={{margin:0,fontSize:"0.75rem",color:"rgba(212,175,55,0.7)",fontWeight:"500"}}>Faculty Management</p>
            </div>
          </div>
        </div>
        <div style={{display:"flex",gap:"8px",flexWrap:"wrap",alignItems:"center"}}>
          <button onClick={()=>setShowCsvGuide(!showCsvGuide)} style={{background:"rgba(99,202,183,0.1)",color:"#63cab7",border:"1px solid rgba(99,202,183,0.3)",borderRadius:"10px",padding:"9px 14px",fontSize:"0.75rem",fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>📋 CSV Format</button>
          <label style={{display:"inline-flex",alignItems:"center",gap:"6px",background:"rgba(99,202,183,0.12)",color:"#63cab7",border:"1px solid rgba(99,202,183,0.4)",borderRadius:"10px",padding:"9px 16px",fontSize:"0.82rem",fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
            {csvLoading?"⏳ upload...":"📂 CSV Upload"}
            <input type="file" accept=".csv,.txt" style={{display:"none"}} onChange={handleTeachersCSV} disabled={csvLoading}/>
          </label>
          <button onClick={()=>setShow(!show)} style={{display:"flex",alignItems:"center",gap:"8px",padding:"11px 22px",borderRadius:"12px",border:`1px solid ${G}`,background:show?`rgba(212,175,55,0.15)`:"transparent",color:G,fontWeight:"700",fontSize:"0.85rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif",transition:"all 0.2s"}}>
            <span className="material-symbols-rounded" style={{fontSize:"20px"}}>{show?"close":"person_add"}</span>
            {show?"Cancel":"New Teacher"}
          </button>
        </div>
      </div>

      {/* CSV Format Guide */}
      {showCsvGuide&&<div style={{background:"rgba(99,202,183,0.06)",border:"1px solid rgba(99,202,183,0.25)",borderRadius:"12px",padding:"14px 18px",marginBottom:"16px",direction:"ltr"}}>
        <div style={{color:"#63cab7",fontWeight:700,fontSize:"13px",marginBottom:"8px"}}>📄 Teachers CSV Format (comma separated):</div>
        <code style={{display:"block",background:"rgba(0,0,0,0.4)",padding:"10px",borderRadius:"8px",color:"#a3e6dc",fontFamily:"monospace",fontSize:"12px",lineHeight:"2",overflowX:"auto"}}>
          name,subject,grade,employeeCode,house,phone,qualification<br/>
          Muhammad Iqbal,Mathematics,Grade 7,TCH-001,Abu Bakr,0311-1111111,B.Ed<br/>
          Abdullah Rehman,Quran,all,TCH-002,Umar,0322-2222222,<br/>
          Fatima Noor,Science,Grade 8,TCH-003,Uthman,,M.Sc
        </code>
        <div style={{color:"#64748b",fontSize:"11px",marginTop:"8px"}}>
          • house: Abu Bakr / Umar / Uthman / Ali &nbsp;•&nbsp; grade: Grade 6 / Grade 7 / all etc<br/>
          • employeeCode, phone, qualification — optional &nbsp;•&nbsp; header row optional
        </div>
      </div>}

      {/* CSV Result */}
      {csvResult&&<div style={{background:csvResult.skip===0?"rgba(74,222,128,0.08)":"rgba(251,146,60,0.08)",border:`1px solid ${csvResult.skip===0?"rgba(74,222,128,0.3)":"rgba(251,146,60,0.3)"}`,borderRadius:"10px",padding:"12px 16px",marginBottom:"16px",display:"flex",alignItems:"center",gap:"12px",flexWrap:"wrap"}}>
        <span style={{color:"#4ade80",fontWeight:700}}>✅ {csvResult.ok} اساتذہ شامل ہوگئے</span>
        {csvResult.skip>0&&<span style={{color:"#fb923c",fontWeight:700}}>⚠️ {csvResult.skip} ناکام</span>}
        {csvResult.errs.length>0&&<span style={{color:"#fca5a5",fontSize:"12px"}}>{csvResult.errs.slice(0,3).join(" • ")}</span>}
        <button onClick={()=>setCsvResult(null)} style={{background:"none",border:"none",color:"#64748b",cursor:"pointer",marginLeft:"auto"}}>✕</button>
      </div>}

      {/* ── Stats Bar ── */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:"14px",marginBottom:"28px"}}>
        {[
          {icon:"groups",label:"Total Teachers",val:teachers.length,color:G},
          {icon:"check_circle",label:"Active",val:activeCount,color:"#22c55e"},
          {icon:"cancel",label:"Inactive",val:inactiveCount,color:"#f87171"},
          {icon:"class",label:"Grades",val:[...new Set(teachers.map(t=>t.grade))].length,color:"#60a5fa"},
        ].map(s=>(
          <div key={s.label} className="hv-stat" style={{...glass,padding:"18px 16px",display:"flex",alignItems:"center",gap:"14px"}}>
            <div style={{width:"42px",height:"42px",borderRadius:"10px",background:`rgba(${s.color==="rgba(212,175,55,0.15)"?"212,175,55":s.color==="#22c55e"?"34,197,94":s.color==="#f87171"?"248,113,113":"96,165,250"},0.15)`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <span className="material-symbols-rounded" style={{fontSize:"22px",color:s.color}}>{s.icon}</span>
            </div>
            <div>
              <div style={{fontSize:"1.5rem",fontWeight:"800",color:"#f1f5f9",lineHeight:1}}>{s.val}</div>
              <div style={{fontSize:"0.68rem",color:"rgba(241,245,249,0.5)",marginTop:"3px"}}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Add Form ── */}
      {show&&(
        <div style={{...glass,padding:"24px",marginBottom:"24px",borderColor:`rgba(212,175,55,0.3)`}}>
          <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"20px"}}>
            <span className="material-symbols-rounded" style={{color:G,fontSize:"22px"}}>person_add</span>
            <span style={{color:G,fontWeight:"700",fontSize:"1rem"}}>New Teacher Entry</span>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px",marginBottom:"16px"}}>
            <div><label style={lbl}>Name *</label><input style={inp} value={f.name} onChange={e=>setF({...f,name:e.target.value})} placeholder="Teacher name..."/></div>
            <div><label style={lbl}>Subject</label><input style={inp} value={f.subject} onChange={e=>setF({...f,subject:e.target.value})} placeholder="Mathematics..."/></div>
            <div><label style={lbl}>Grade</label><select style={inp} value={f.grade} onChange={e=>setF({...f,grade:e.target.value})}>{[...gradeOptions,"All Grades"].map(g=><option key={g} style={{background:N2}}>{g}</option>)}</select></div>
            <div><label style={lbl}>House</label><select style={inp} value={f.houseId} onChange={e=>setF({...f,houseId:e.target.value})}>{HOUSES.map(h=><option key={h.id} value={h.id} style={{background:N2}}>{h.emoji} {h.nameEn}</option>)}</select></div>
            <div><label style={lbl}>Employee Code</label><input style={{...inp,direction:"ltr"}} value={f.employeeCode} onChange={e=>setF({...f,employeeCode:e.target.value})} placeholder="TCH-005"/></div>
            <div><label style={lbl}>Phone</label><input style={{...inp,direction:"ltr"}} value={f.phone} onChange={e=>setF({...f,phone:e.target.value})} placeholder="0300-1234567"/></div>
            <div style={{gridColumn:"1/-1"}}><label style={lbl}>Educational Qualification</label><input style={inp} value={f.qualification} onChange={e=>setF({...f,qualification:e.target.value})} placeholder="M.A Islamiyat..."/></div>
            <div style={{gridColumn:"1/-1",display:"flex",alignItems:"center",gap:"10px"}}>
              <label style={{...lbl,margin:0}}>Status:</label>
              {[{v:true,l:"Active"},{v:false,l:"Inactive"}].map(o=>(
                <button key={String(o.v)} onClick={()=>setF({...f,isActive:o.v})} style={{padding:"7px 16px",borderRadius:"8px",border:`1px solid ${f.isActive===o.v?G:"rgba(255,255,255,0.15)"}`,background:f.isActive===o.v?`rgba(212,175,55,0.15)`:"transparent",color:f.isActive===o.v?G:"rgba(241,245,249,0.5)",fontWeight:"600",fontSize:"0.78rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif"}}>{o.l}</button>
              ))}
            </div>
          </div>
          <div style={{display:"flex",gap:"10px",justifyContent:"flex-end"}}>
            <button onClick={()=>setShow(false)} style={{padding:"10px 20px",borderRadius:"10px",border:"1px solid rgba(255,255,255,0.15)",background:"transparent",color:"rgba(241,245,249,0.6)",fontWeight:"600",fontSize:"0.82rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif"}}>Cancel</button>
            <button onClick={add} style={{display:"flex",alignItems:"center",gap:"8px",padding:"10px 24px",borderRadius:"10px",border:"none",background:`linear-gradient(135deg,${G},#b8960a)`,color:N,fontWeight:"700",fontSize:"0.82rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif"}}>
              <span className="material-symbols-rounded" style={{fontSize:"18px"}}>save</span>Save
            </button>
          </div>
        </div>
      )}

      {/* ── Search & Filter ── */}
      <div style={{...glass,padding:"16px 20px",marginBottom:"24px",display:"flex",gap:"12px",flexWrap:"wrap",alignItems:"center"}}>
        <div style={{flex:"1",minWidth:"200px",position:"relative"}}>
          <span className="material-symbols-rounded" style={{position:"absolute",right:"12px",top:"50%",transform:"translateY(-50%)",color:"rgba(212,175,55,0.6)",fontSize:"20px",pointerEvents:"none"}}>search</span>
          <input style={{...inp,paddingRight:"40px"}} placeholder="Search by name, subject, or code..." value={q} onChange={e=>setQ(e.target.value)}/>
        </div>
        <select style={{...inp,width:"auto",minWidth:"130px",direction:"ltr"}} value={filterGrade} onChange={e=>setFilterGrade(e.target.value)}>
          <option value="all" style={{background:N2}}>All Grades</option>
          {[...gradeOptions,"All Grades"].map(g=><option key={g} value={g} style={{background:N2}}>{g}</option>)}
        </select>
        <select style={{...inp,width:"auto",minWidth:"120px",direction:"ltr"}} value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}>
          <option value="all" style={{background:N2}}>All</option>
          <option value="active" style={{background:N2}}>Active</option>
          <option value="inactive" style={{background:N2}}>Inactive</option>
        </select>
        <div style={{color:"rgba(241,245,249,0.4)",fontSize:"0.75rem",whiteSpace:"nowrap"}}>{filtered.length} Results</div>
      </div>

      {/* ── Teacher Cards Grid ── */}
      {filtered.length===0?(
        <div style={{...glass,padding:"60px 20px",textAlign:"center"}}>
          <span className="material-symbols-rounded" style={{fontSize:"48px",color:"rgba(212,175,55,0.3)",display:"block",marginBottom:"12px"}}>person_search</span>
          <div style={{color:"rgba(241,245,249,0.4)",fontSize:"0.9rem"}} className="ur">کوئی استاذ نہیں ملا</div>
        </div>
      ):(
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:"16px"}}>
          {filtered.length===0&&<div style={{gridColumn:"1/-1"}}><EmptyState icon="👨‍🏫" title="کوئی استاد نہیں ملا" subtitle={teachers.length===0?"ابھی کوئی استاد شامل نہیں — اوپر Add Teacher سے شامل کریں":"فلٹر سے کوئی نتیجہ نہیں ملا"}/></div>}
          {filtered.map(t=>{
            const h=HOUSES.find(x=>x.id===t.houseId)||{};
            const initials=(t.name||"?").split(" ").map(w=>w[0]).slice(0,2).join("");
            const isActive=t.isActive!==false;
            return (
              <div key={t.id} className="hv-card" style={{...glass,padding:"20px",borderTop:`3px solid ${h.color||G}`,position:"relative",overflow:"hidden"}}>
                {/* Subtle accent blob */}
                <div style={{position:"absolute",top:"-20px",left:"-20px",width:"80px",height:"80px",borderRadius:"50%",background:`${h.color||G}15`,pointerEvents:"none"}}/>
                {/* Status badge */}
                <div style={{position:"absolute",top:"14px",left:"14px"}}>
                  <span style={{padding:"3px 10px",borderRadius:"20px",fontSize:"0.6rem",fontWeight:"700",background:isActive?"rgba(34,197,94,0.15)":"rgba(248,113,113,0.15)",color:isActive?"#4ade80":"#f87171",border:`1px solid ${isActive?"rgba(34,197,94,0.3)":"rgba(248,113,113,0.3)"}`}}>
                    {isActive?"Active":"Inactive"}
                  </span>
                </div>
                {/* Avatar */}
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",marginBottom:"16px",marginTop:"20px"}}>
                  <div style={{width:"64px",height:"64px",borderRadius:"50%",background:`linear-gradient(135deg,${h.color||G}40,${h.color||G}20)`,border:`2px solid ${h.color||G}60`,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:"10px",fontSize:"1.3rem",fontWeight:"800",color:h.color||G,direction:"ltr"}}>
                    {initials}
                  </div>
                  <div style={{textAlign:"center"}}>
                    <div style={{fontWeight:"700",color:"#f1f5f9",fontSize:"0.95rem",marginBottom:"3px"}}>{t.name}</div>
                    <div style={{fontSize:"0.72rem",color:`rgba(212,175,55,0.8)`,fontWeight:"500"}}>{t.subject||"—"}</div>
                  </div>
                </div>
                {/* Details */}
                <div style={{borderTop:"1px solid rgba(255,255,255,0.08)",paddingTop:"14px",display:"flex",flexDirection:"column",gap:"8px"}}>
                  {[
                    {icon:"class",label:"Grade",val:t.grade||"—"},
                    {icon:"home",label:"House",val:`${h.emoji||""} ${h.nameEn||"—"}`},
                    {icon:"badge",label:"Code",val:t.employeeCode||"—",ltr:true},
                    {icon:"phone",label:"Phone",val:t.phone||"—",ltr:true},
                    {icon:"school",label:"Qualification",val:t.qualification||"—"},
                  ].filter(r=>r.val&&r.val!=="—").map(r=>(
                    <div key={r.label} style={{display:"flex",alignItems:"center",gap:"8px"}}>
                      <span className="material-symbols-rounded" style={{fontSize:"15px",color:`rgba(212,175,55,0.5)`,flexShrink:0}}>{r.icon}</span>
                      <span style={{fontSize:"0.65rem",color:"rgba(241,245,249,0.4)",flexShrink:0}}>{r.label}:</span>
                      <span style={{fontSize:"0.72rem",color:"rgba(241,245,249,0.8)",fontWeight:"500",direction:r.ltr?"ltr":"rtl",marginRight:"auto"}}>{r.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Teachers;
