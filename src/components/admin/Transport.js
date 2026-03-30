/* eslint-disable */
import { useState, useEffect } from "react";
import { C, S, hBadge, pBar, sLabel } from "../../constants";
import { supabase } from "../../supabase";

function Transport({students,addData}){
  const [routes,setRoutes]=useState([]); const [assignments,setAssignments]=useState([]); const [show,setShow]=useState(false); const [tab,setTab]=useState("routes");
  const [f,setF]=useState({routeName:"",driverName:"",vehicleNo:"",capacity:20,stops:"",timing:""});
  const [assignF,setAssignF]=useState({studentId:"",routeId:""});
  useEffect(()=>{ const load=async()=>{ const {data:r}=await supabase.from("transport_routes").select("*"); setRoutes(r||[]); const {data:a}=await supabase.from("transport_assignments").select("*"); setAssignments(a||[]); }; load(); },[]);
  const addRoute=async()=>{ if(!f.routeName)return; await addData("transport_routes",{...f,capacity:Number(f.capacity)}); setShow(false); setF({routeName:"",driverName:"",vehicleNo:"",capacity:20,stops:"",timing:""}); };
  const assign=async()=>{ if(!assignF.studentId||!assignF.routeId)return; await addData("transport_assignments",{...assignF}); setAssignF({studentId:"",routeId:""}); };
  const getOccupancy=(routeId)=>assignments.filter(a=>a.routeId===routeId).length;

  const G="#d4af37"; const N="#0f172a"; const N2="#1e293b";
  const glass={background:"rgba(255,255,255,0.07)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:"16px"};
  const inp={width:"100%",padding:"10px 14px",borderRadius:"10px",border:"1px solid rgba(212,175,55,0.25)",background:"rgba(255,255,255,0.06)",color:"#f1f5f9",fontSize:"0.8rem",fontFamily:"'Public Sans',sans-serif",outline:"none",boxSizing:"border-box",direction:"ltr",colorScheme:"dark"};
  const lbl={fontSize:"0.7rem",color:"rgba(212,175,55,0.8)",marginBottom:"6px",display:"block",fontWeight:"600"};
  return <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#0f172a 0%,#0d1f3c 50%,#0a1628 100%)",padding:"24px 20px",fontFamily:"'Public Sans',sans-serif",direction:"ltr"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"24px",flexWrap:"wrap",gap:"12px"}}>
      <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
        <div style={{width:"44px",height:"44px",borderRadius:"12px",background:"linear-gradient(135deg,#d4af37,#b8960a)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 20px rgba(212,175,55,0.4)"}}><span className="material-symbols-rounded" style={{fontSize:"24px",color:N}}>directions_bus</span></div>
        <div><h2 style={{margin:0,fontSize:"1.4rem",fontWeight:"800",color:"#f1f5f9"}}>Transport</h2><p style={{margin:0,fontSize:"0.72rem",color:"rgba(212,175,55,0.7)"}}>Routes & Students</p></div>
      </div>
      <button style={{display:"flex",alignItems:"center",gap:"8px",padding:"10px 20px",borderRadius:"12px",border:"1px solid #d4af37",background:show?"rgba(212,175,55,0.15)":"transparent",color:"#d4af37",fontWeight:"700",fontSize:"0.82rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif"}} onClick={()=>setShow(!show)}><span className="material-symbols-rounded" style={{fontSize:"18px"}}>{show?"close":"add_circle"}</span>{show?"Cancel":"New Route"}</button>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:"14px",marginBottom:"20px"}}>
      {routes.map(r=>{ const occ=getOccupancy(r.id); return <div key={r.id} style={{...glass,padding:"18px"}}>
        <div style={{fontSize:"1.5rem",marginBottom:"6px"}}>🚌</div>
        <div style={{fontWeight:"700",color:"#f1f5f9",marginBottom:"4px"}}>{r.routeName}</div>
        <div style={{fontSize:"0.62rem",color:"rgba(255,255,255,0.5)",marginBottom:"8px"}}>👤 {r.driverName} • {r.vehicleNo}</div>
        {pBar(occ,r.capacity||20,"#60a5fa")}
        <div style={{fontSize:"0.6rem",color:"rgba(255,255,255,0.4)",marginTop:"4px"}}>{occ}/{r.capacity} Students</div>
        {r.timing&&<div style={{fontSize:"0.6rem",color:G,marginTop:"4px"}}>⏰ {r.timing}</div>}
      </div>; })}
    </div>
    {show&&<div style={{...glass,padding:"24px",marginBottom:"20px",borderColor:"rgba(212,175,55,0.3)"}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div><label style={lbl}>روٹ کا نام *</label><input style={inp} value={f.routeName} onChange={e=>setF({...f,routeName:e.target.value})} placeholder="سوات — مدین روٹ..."/></div>
        <div><label style={lbl}>ڈرائیور</label><input style={inp} value={f.driverName} onChange={e=>setF({...f,driverName:e.target.value})} placeholder="ڈرائیور کا نام..."/></div>
        <div><label style={lbl}>گاڑی نمبر</label><input style={{...inp,direction:"ltr"}} value={f.vehicleNo} onChange={e=>setF({...f,vehicleNo:e.target.value})} placeholder="ABC-123"/></div>
        <div><label style={lbl}>گنجائش</label><input style={{...inp,direction:"ltr",colorScheme:"dark"}} type="number" value={f.capacity} onChange={e=>setF({...f,capacity:e.target.value})}/></div>
        <div><label style={lbl}>وقت</label><input style={inp} value={f.timing} onChange={e=>setF({...f,timing:e.target.value})} placeholder="صبح 7:30، واپسی 2:00"/></div>
        <div><label style={lbl}>پڑاؤ</label><input style={inp} value={f.stops} onChange={e=>setF({...f,stops:e.target.value})} placeholder="مین بازار، پل، مسجد..."/></div>
      </div>
      <button style={{background:"linear-gradient(135deg,#d4af37,#b8960a)",color:N,border:"none",borderRadius:"12px",padding:"11px 26px",fontSize:"0.82rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif",fontWeight:"700"}} onClick={addRoute}>Save</button>
    </div>}
    <div style={{display:"flex",gap:"8px",marginBottom:"16px"}}>{[["routes","🚌 Routes"],["assign","👥 Student Add"]].map(([t,l])=><button key={t} onClick={()=>setTab(t)} style={{padding:"8px 14px",borderRadius:"10px",border:tab===t?"none":"1px solid rgba(255,255,255,0.1)",cursor:"pointer",fontSize:"0.65rem",fontWeight:tab===t?"700":"400",background:tab===t?"linear-gradient(135deg,#d4af37,#b8960a)":"rgba(255,255,255,0.04)",color:tab===t?"#0f172a":"rgba(255,255,255,0.6)",fontFamily:"inherit"}}>{l}</button>)}</div>
    {tab==="assign"&&<div style={{...glass,padding:"24px",marginBottom:"16px"}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div><label style={lbl}>طالب علم</label><select style={inp} value={assignF.studentId} onChange={e=>setAssignF({...assignF,studentId:e.target.value})}><option value="" style={{background:N2}}>-- منتخب کریں --</option>{students.map(s=><option key={s.id} value={s.id} style={{background:N2}}>{sLabel(s)}</option>)}</select></div>
        <div><label style={lbl}>روٹ</label><select style={inp} value={assignF.routeId} onChange={e=>setAssignF({...assignF,routeId:e.target.value})}><option value="" style={{background:N2}}>-- منتخب کریں --</option>{routes.map(r=><option key={r.id} value={r.id} style={{background:N2}}>{r.routeName}</option>)}</select></div>
      </div>
      <button style={{background:"linear-gradient(135deg,#d4af37,#b8960a)",color:N,border:"none",borderRadius:"12px",padding:"11px 26px",fontSize:"0.82rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif",fontWeight:"700"}} onClick={assign}>شامل کریں</button>
    </div>}
    {tab==="routes"&&<div style={{...glass,overflow:"hidden"}}><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}>
      <thead><tr style={{background:"rgba(255,255,255,0.04)"}}><th style={{padding:"12px 14px",textAlign:"left",fontSize:"0.65rem",color:"rgba(212,175,55,0.8)",fontWeight:"700"}}>روٹ</th><th style={{padding:"12px 14px",textAlign:"left",fontSize:"0.65rem",color:"rgba(212,175,55,0.8)",fontWeight:"700"}}>ڈرائیور</th><th style={{padding:"12px 14px",textAlign:"left",fontSize:"0.65rem",color:"rgba(212,175,55,0.8)",fontWeight:"700"}}>گاڑی</th><th style={{padding:"12px 14px",textAlign:"left",fontSize:"0.65rem",color:"rgba(212,175,55,0.8)",fontWeight:"700"}}>گنجائش</th><th style={{padding:"12px 14px",textAlign:"left",fontSize:"0.65rem",color:"rgba(212,175,55,0.8)",fontWeight:"700"}}>مسافر</th></tr></thead>
      <tbody>{routes.map((r,ri)=>{ const occ=getOccupancy(r.id); return <tr key={r.id} style={{background:ri%2===0?"rgba(255,255,255,0.02)":"transparent"}}>
        <td style={{padding:"11px 14px",color:"#f1f5f9",fontWeight:"700",fontSize:"0.75rem",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>{r.routeName}</td>
        <td style={{padding:"11px 14px",color:"rgba(255,255,255,0.7)",fontSize:"0.75rem",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>{r.driverName||"—"}</td>
        <td style={{padding:"11px 14px",fontFamily:"monospace",direction:"ltr",fontSize:"0.6rem",color:"rgba(255,255,255,0.6)",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>{r.vehicleNo||"—"}</td>
        <td style={{padding:"11px 14px",color:"rgba(255,255,255,0.7)",fontSize:"0.75rem",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>{r.capacity}</td>
        <td style={{padding:"11px 14px",borderBottom:"1px solid rgba(255,255,255,0.05)"}}><span style={{color:occ>=r.capacity?"#f87171":"#4ade80",fontWeight:"700",fontSize:"0.75rem"}}>{occ}/{r.capacity}</span></td>
      </tr>; })}{routes.length===0&&<tr><td colSpan={5} style={{padding:"40px",textAlign:"center",color:"rgba(255,255,255,0.3)"}}>کوئی روٹ نہیں</td></tr>}</tbody>
    </table></div></div>}
  </div>;
}

export default Transport;
