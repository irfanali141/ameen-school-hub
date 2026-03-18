/* eslint-disable */
import { useState, useEffect } from "react";
import { C, S, hBadge, HOUSES } from "../../constants";


function Teachers({teachers,addData}){
  const G="#d4af37"; const N="#0f172a"; const N2="#1e293b";
  const glass={background:"rgba(255,255,255,0.07)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:"16px"};
  const [show,setShow]=useState(false); const [q,setQ]=useState("");
  const [filterGrade,setFilterGrade]=useState("all"); const [filterStatus,setFilterStatus]=useState("all");
  const [f,setF]=useState({name:"",subject:"",grade:"Grade 7",employeeCode:"",houseId:"abuBakr",isActive:true,phone:"",qualification:""});
  const add=async()=>{ if(!f.name)return; await addData("teachers",{...f}); setShow(false); setF({name:"",subject:"",grade:"Grade 7",employeeCode:"",houseId:"abuBakr",isActive:true,phone:"",qualification:""}); };
  const filtered=teachers.filter(t=>{
    const matchQ=!q||t.name?.includes(q)||t.subject?.includes(q)||t.employeeCode?.includes(q);
    const matchG=filterGrade==="all"||t.grade===filterGrade;
    const matchS=filterStatus==="all"||(filterStatus==="active"?t.isActive!==false:t.isActive===false);
    return matchQ&&matchG&&matchS;
  });
  const activeCount=teachers.filter(t=>t.isActive!==false).length;
  const inactiveCount=teachers.length-activeCount;
  const inp={width:"100%",padding:"10px 14px",borderRadius:"10px",border:"1px solid rgba(212,175,55,0.25)",background:"rgba(255,255,255,0.06)",color:"#f1f5f9",fontSize:"0.8rem",fontFamily:"'Public Sans',sans-serif",outline:"none",boxSizing:"border-box",direction:"rtl"};
  const lbl={fontSize:"0.7rem",color:"rgba(212,175,55,0.8)",marginBottom:"6px",display:"block",fontWeight:"600"};
  return (
    <div style={{minHeight:"100vh",background:`linear-gradient(160deg,${N} 0%,#0d1f3c 50%,#0a1628 100%)`,padding:"24px 20px",fontFamily:"'Public Sans',sans-serif",direction:"rtl"}}>
      {/* ── Header ── */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"28px",flexWrap:"wrap",gap:"12px"}}>
        <div>
          <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"6px"}}>
            <div style={{width:"44px",height:"44px",borderRadius:"12px",background:`linear-gradient(135deg,${G},#b8960a)`,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 4px 20px rgba(212,175,55,0.4)`}}>
              <span className="material-symbols-rounded" style={{fontSize:"24px",color:N}}>school</span>
            </div>
            <div>
              <h1 style={{margin:0,fontSize:"1.5rem",fontWeight:"800",color:"#f1f5f9",letterSpacing:"-0.5px"}}>اساتذہ</h1>
              <p style={{margin:0,fontSize:"0.75rem",color:"rgba(212,175,55,0.7)",fontWeight:"500"}}>Faculty Management</p>
            </div>
          </div>
        </div>
        <button onClick={()=>setShow(!show)} style={{display:"flex",alignItems:"center",gap:"8px",padding:"11px 22px",borderRadius:"12px",border:`1px solid ${G}`,background:show?`rgba(212,175,55,0.15)`:"transparent",color:G,fontWeight:"700",fontSize:"0.85rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif",transition:"all 0.2s"}}>
          <span className="material-symbols-rounded" style={{fontSize:"20px"}}>{show?"close":"person_add"}</span>
          {show?"منسوخ":"نیا استاد"}
        </button>
      </div>

      {/* ── Stats Bar ── */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:"14px",marginBottom:"28px"}}>
        {[
          {icon:"groups",label:"کل اساتذہ",val:teachers.length,color:G},
          {icon:"check_circle",label:"فعال",val:activeCount,color:"#22c55e"},
          {icon:"cancel",label:"غیر فعال",val:inactiveCount,color:"#f87171"},
          {icon:"class",label:"جماعتیں",val:[...new Set(teachers.map(t=>t.grade))].length,color:"#60a5fa"},
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
            <span style={{color:G,fontWeight:"700",fontSize:"1rem"}}>نئے استاد کا اندراج</span>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px",marginBottom:"16px"}}>
            <div><label style={lbl}>نام *</label><input style={inp} value={f.name} onChange={e=>setF({...f,name:e.target.value})} placeholder="استاد کا نام..."/></div>
            <div><label style={lbl}>مضمون</label><input style={inp} value={f.subject} onChange={e=>setF({...f,subject:e.target.value})} placeholder="Mathematics..."/></div>
            <div><label style={lbl}>جماعت</label><select style={inp} value={f.grade} onChange={e=>setF({...f,grade:e.target.value})}>{["Grade 6","Grade 7","Grade 8","Grade 9","All Grades"].map(g=><option key={g} style={{background:N2}}>{g}</option>)}</select></div>
            <div><label style={lbl}>ہاؤس</label><select style={inp} value={f.houseId} onChange={e=>setF({...f,houseId:e.target.value})}>{HOUSES.map(h=><option key={h.id} value={h.id} style={{background:N2}}>{h.emoji} {h.nameEn}</option>)}</select></div>
            <div><label style={lbl}>ملازم کوڈ</label><input style={{...inp,direction:"ltr"}} value={f.employeeCode} onChange={e=>setF({...f,employeeCode:e.target.value})} placeholder="TCH-005"/></div>
            <div><label style={lbl}>فون</label><input style={{...inp,direction:"ltr"}} value={f.phone} onChange={e=>setF({...f,phone:e.target.value})} placeholder="0300-1234567"/></div>
            <div style={{gridColumn:"1/-1"}}><label style={lbl}>تعلیمی قابلیت</label><input style={inp} value={f.qualification} onChange={e=>setF({...f,qualification:e.target.value})} placeholder="M.A Islamiyat..."/></div>
            <div style={{gridColumn:"1/-1",display:"flex",alignItems:"center",gap:"10px"}}>
              <label style={{...lbl,margin:0}}>حیثیت:</label>
              {[{v:true,l:"فعال"},{v:false,l:"غیر فعال"}].map(o=>(
                <button key={String(o.v)} onClick={()=>setF({...f,isActive:o.v})} style={{padding:"7px 16px",borderRadius:"8px",border:`1px solid ${f.isActive===o.v?G:"rgba(255,255,255,0.15)"}`,background:f.isActive===o.v?`rgba(212,175,55,0.15)`:"transparent",color:f.isActive===o.v?G:"rgba(241,245,249,0.5)",fontWeight:"600",fontSize:"0.78rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif"}}>{o.l}</button>
              ))}
            </div>
          </div>
          <div style={{display:"flex",gap:"10px",justifyContent:"flex-end"}}>
            <button onClick={()=>setShow(false)} style={{padding:"10px 20px",borderRadius:"10px",border:"1px solid rgba(255,255,255,0.15)",background:"transparent",color:"rgba(241,245,249,0.6)",fontWeight:"600",fontSize:"0.82rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif"}}>منسوخ</button>
            <button onClick={add} style={{display:"flex",alignItems:"center",gap:"8px",padding:"10px 24px",borderRadius:"10px",border:"none",background:`linear-gradient(135deg,${G},#b8960a)`,color:N,fontWeight:"700",fontSize:"0.82rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif"}}>
              <span className="material-symbols-rounded" style={{fontSize:"18px"}}>save</span>محفوظ کریں
            </button>
          </div>
        </div>
      )}

      {/* ── Search & Filter ── */}
      <div style={{...glass,padding:"16px 20px",marginBottom:"24px",display:"flex",gap:"12px",flexWrap:"wrap",alignItems:"center"}}>
        <div style={{flex:"1",minWidth:"200px",position:"relative"}}>
          <span className="material-symbols-rounded" style={{position:"absolute",right:"12px",top:"50%",transform:"translateY(-50%)",color:"rgba(212,175,55,0.6)",fontSize:"20px",pointerEvents:"none"}}>search</span>
          <input style={{...inp,paddingRight:"40px"}} placeholder="نام، مضمون یا کوڈ سے تلاش کریں..." value={q} onChange={e=>setQ(e.target.value)}/>
        </div>
        <select style={{...inp,width:"auto",minWidth:"130px",direction:"rtl"}} value={filterGrade} onChange={e=>setFilterGrade(e.target.value)}>
          <option value="all" style={{background:N2}}>تمام جماعتیں</option>
          {["Grade 6","Grade 7","Grade 8","Grade 9","All Grades"].map(g=><option key={g} value={g} style={{background:N2}}>{g}</option>)}
        </select>
        <select style={{...inp,width:"auto",minWidth:"120px",direction:"rtl"}} value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}>
          <option value="all" style={{background:N2}}>تمام</option>
          <option value="active" style={{background:N2}}>فعال</option>
          <option value="inactive" style={{background:N2}}>غیر فعال</option>
        </select>
        <div style={{color:"rgba(241,245,249,0.4)",fontSize:"0.75rem",whiteSpace:"nowrap"}}>{filtered.length} نتائج</div>
      </div>

      {/* ── Teacher Cards Grid ── */}
      {filtered.length===0?(
        <div style={{...glass,padding:"60px 20px",textAlign:"center"}}>
          <span className="material-symbols-rounded" style={{fontSize:"48px",color:"rgba(212,175,55,0.3)",display:"block",marginBottom:"12px"}}>person_search</span>
          <div style={{color:"rgba(241,245,249,0.4)",fontSize:"0.9rem"}}>کوئی استاد نہیں ملا</div>
        </div>
      ):(
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:"16px"}}>
          {filtered.map(t=>{
            const h=HOUSES.find(x=>x.id===t.houseId)||{};
            const initials=(t.name||"؟").split(" ").map(w=>w[0]).slice(0,2).join("");
            const isActive=t.isActive!==false;
            return (
              <div key={t.id} className="hv-card" style={{...glass,padding:"20px",borderTop:`3px solid ${h.color||G}`,position:"relative",overflow:"hidden"}}>
                {/* Subtle accent blob */}
                <div style={{position:"absolute",top:"-20px",left:"-20px",width:"80px",height:"80px",borderRadius:"50%",background:`${h.color||G}15`,pointerEvents:"none"}}/>
                {/* Status badge */}
                <div style={{position:"absolute",top:"14px",left:"14px"}}>
                  <span style={{padding:"3px 10px",borderRadius:"20px",fontSize:"0.6rem",fontWeight:"700",background:isActive?"rgba(34,197,94,0.15)":"rgba(248,113,113,0.15)",color:isActive?"#4ade80":"#f87171",border:`1px solid ${isActive?"rgba(34,197,94,0.3)":"rgba(248,113,113,0.3)"}`}}>
                    {isActive?"فعال":"غیر فعال"}
                  </span>
                </div>
                {/* Avatar */}
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",marginBottom:"16px",marginTop:"20px"}}>
                  <div style={{width:"64px",height:"64px",borderRadius:"50%",background:`linear-gradient(135deg,${h.color||G}40,${h.color||G}20)`,border:`2px solid ${h.color||G}60`,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:"10px",fontSize:"1.3rem",fontWeight:"800",color:h.color||G,direction:"rtl"}}>
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
                    {icon:"class",label:"جماعت",val:t.grade||"—"},
                    {icon:"home",label:"ہاؤس",val:`${h.emoji||""} ${h.nameEn||"—"}`},
                    {icon:"badge",label:"کوڈ",val:t.employeeCode||"—",ltr:true},
                    {icon:"phone",label:"فون",val:t.phone||"—",ltr:true},
                    {icon:"school",label:"قابلیت",val:t.qualification||"—"},
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
