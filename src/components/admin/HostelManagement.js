/* eslint-disable */
import { useState, useEffect } from "react";
import { C, S, hBadge, pBar } from "../../constants";
import { db, collection, onSnapshot, query, orderBy, limit } from "../../firebase";

function HostelManagement({students,addData}){
  const [rooms,setRooms]=useState([]); const [residents,setResidents]=useState([]); const [show,setShow]=useState(false); const [tab,setTab]=useState("rooms");
  const [f,setF]=useState({roomNo:"",floor:"Ground",capacity:4,type:"standard",amenities:""});
  const [resF,setResF]=useState({studentId:"",roomId:"",checkIn:new Date().toISOString().split("T")[0],monthlyFee:3000,notes:""});
  useEffect(()=>{
    const u1=onSnapshot(collection(db,"hostel_rooms"),s=>setRooms(s.docs.map(d=>({id:d.id,...d.data()}))));
    const u2=onSnapshot(collection(db,"hostel_residents"),s=>setResidents(s.docs.map(d=>({id:d.id,...d.data()}))));
    return()=>{u1();u2();};
  },[]);
  const addRoom=async()=>{ if(!f.roomNo)return; await addData("hostel_rooms",{...f,capacity:Number(f.capacity),occupied:0}); setShow(false); setF({roomNo:"",floor:"Ground",capacity:4,type:"standard",amenities:""}); };
  const addResident=async()=>{ if(!resF.studentId||!resF.roomId)return; await addData("hostel_residents",{...resF,status:"active",monthlyFee:Number(resF.monthlyFee)}); setResF({studentId:"",roomId:"",checkIn:new Date().toISOString().split("T")[0],monthlyFee:3000,notes:""}); };
  const getOccupancy=(roomId)=>residents.filter(r=>r.roomId===roomId&&r.status==="active").length;
  const totalResidents=residents.filter(r=>r.status==="active").length;
  const totalCapacity=rooms.reduce((s,r)=>s+(r.capacity||0),0);

  const G="#d4af37"; const N="#0f172a"; const N2="#1e293b";
  const glass={background:"rgba(255,255,255,0.07)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:"16px"};
  const inp={width:"100%",padding:"10px 14px",borderRadius:"10px",border:"1px solid rgba(212,175,55,0.25)",background:"rgba(255,255,255,0.06)",color:"#f1f5f9",fontSize:"0.8rem",fontFamily:"'Public Sans',sans-serif",outline:"none",boxSizing:"border-box",direction:"rtl",colorScheme:"dark"};
  const lbl={fontSize:"0.7rem",color:"rgba(212,175,55,0.8)",marginBottom:"6px",display:"block",fontWeight:"600"};
  return <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#0f172a 0%,#0d1f3c 50%,#0a1628 100%)",padding:"24px 20px",fontFamily:"'Public Sans',sans-serif",direction:"rtl"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"24px",flexWrap:"wrap",gap:"12px"}}>
      <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
        <div style={{width:"44px",height:"44px",borderRadius:"12px",background:"linear-gradient(135deg,#d4af37,#b8960a)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 20px rgba(212,175,55,0.4)"}}><span className="material-symbols-rounded" style={{fontSize:"24px",color:N}}>night_shelter</span></div>
        <div><h2 style={{margin:0,fontSize:"1.4rem",fontWeight:"800",color:"#f1f5f9"}}>ہوسٹل مینجمنٹ</h2><p style={{margin:0,fontSize:"0.72rem",color:"rgba(212,175,55,0.7)"}}>رہائشی طلبا — کمرے اور سہولیات</p></div>
      </div>
      <button style={{display:"flex",alignItems:"center",gap:"8px",padding:"10px 20px",borderRadius:"12px",border:"1px solid #d4af37",background:show?"rgba(212,175,55,0.15)":"transparent",color:"#d4af37",fontWeight:"700",fontSize:"0.82rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif"}} onClick={()=>setShow(!show)}><span className="material-symbols-rounded" style={{fontSize:"18px"}}>{show?"close":"add_circle"}</span>{show?"منسوخ":"نیا کمرہ"}</button>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:"12px",marginBottom:"20px"}}>
      {[{c:"#60a5fa",i:"🏠",n:rooms.length,l:"کمرے"},{c:"#4ade80",i:"👥",n:totalResidents,l:"رہائشی"},{c:"#fb923c",i:"🛏️",n:totalCapacity-totalResidents,l:"خالی"},{c:"#d4af37",i:"💰",n:`Rs.${(residents.filter(r=>r.status==="active").reduce((s,r)=>s+(r.monthlyFee||0),0)/1000).toFixed(0)}K`,l:"ماہانہ آمدن"}].map((x,i)=><div key={i} style={{background:`${x.c}15`,borderRadius:"16px",padding:"16px",border:`1px solid ${x.c}30`,textAlign:"center"}}><div style={{fontSize:"1.3rem"}}>{x.i}</div><div style={{fontSize:"1.4rem",fontWeight:"900",color:x.c}}>{x.n}</div><div style={{fontSize:"0.6rem",color:"rgba(255,255,255,0.5)"}}>{x.l}</div></div>)}
    </div>
    {show&&<div style={{...glass,padding:"24px",marginBottom:"20px",borderColor:"rgba(212,175,55,0.3)"}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div><label style={lbl}>کمرہ نمبر *</label><input style={{...inp,direction:"ltr"}} value={f.roomNo} onChange={e=>setF({...f,roomNo:e.target.value})} placeholder="101, 202..."/></div>
        <div><label style={lbl}>منزل</label><select style={inp} value={f.floor} onChange={e=>setF({...f,floor:e.target.value})}>{["Ground","First","Second","Third"].map(fl=><option key={fl} style={{background:N2}}>{fl}</option>)}</select></div>
        <div><label style={lbl}>گنجائش</label><input style={{...inp,direction:"ltr",colorScheme:"dark"}} type="number" value={f.capacity} onChange={e=>setF({...f,capacity:e.target.value})}/></div>
        <div><label style={lbl}>قسم</label><select style={inp} value={f.type} onChange={e=>setF({...f,type:e.target.value})}><option value="standard" style={{background:N2}}>معیاری</option><option value="ac" style={{background:N2}}>AC</option><option value="vip" style={{background:N2}}>VIP</option></select></div>
      </div>
      <button style={{background:"linear-gradient(135deg,#d4af37,#b8960a)",color:N,border:"none",borderRadius:"12px",padding:"11px 26px",fontSize:"0.82rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif",fontWeight:"700"}} onClick={addRoom}>کمرہ شامل کریں</button>
    </div>}
    <div style={{display:"flex",gap:"8px",marginBottom:"16px"}}>{[["rooms","🏠 کمرے"],["residents","👥 رہائشی"],["assign","➕ داخلہ"]].map(([t,l])=><button key={t} onClick={()=>setTab(t)} style={{padding:"8px 14px",borderRadius:"10px",border:tab===t?"none":"1px solid rgba(255,255,255,0.1)",cursor:"pointer",fontSize:"0.65rem",fontWeight:tab===t?"700":"400",background:tab===t?"linear-gradient(135deg,#d4af37,#b8960a)":"rgba(255,255,255,0.04)",color:tab===t?"#0f172a":"rgba(255,255,255,0.6)",fontFamily:"inherit"}}>{l}</button>)}</div>
    {tab==="rooms"&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:"14px"}}>
      {rooms.map(r=>{ const occ=getOccupancy(r.id); const full=occ>=r.capacity; return <div key={r.id} style={{...glass,padding:"18px",borderTop:`3px solid ${full?"#f87171":occ>0?"#fb923c":"#4ade80"}`}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:"8px"}}><div style={{fontSize:"1.2rem",fontWeight:"800",color:"#f1f5f9"}}>🏠 {r.roomNo}</div><span style={{padding:"3px 8px",borderRadius:"20px",fontSize:"0.55rem",fontWeight:"700",background:"rgba(255,255,255,0.1)",color:full?"#f87171":occ>0?"#fb923c":"#4ade80"}}>{full?"بھرا":occ>0?"جزوی":"خالی"}</span></div>
        <div style={{fontSize:"0.62rem",color:"rgba(255,255,255,0.5)",marginBottom:"8px"}}>{r.floor} Floor • {r.type}</div>
        {pBar(occ,r.capacity||1,full?"#f87171":"#4ade80")}
        <div style={{fontSize:"0.6rem",color:"rgba(255,255,255,0.4)",marginTop:"4px"}}>{occ}/{r.capacity} رہائشی</div>
      </div>; })}
      {rooms.length===0&&<div style={{...glass,textAlign:"center",color:"rgba(255,255,255,0.3)",padding:"40px",gridColumn:"1/-1"}}>کوئی کمرہ نہیں</div>}
    </div>}
    {tab==="assign"&&<div style={{...glass,padding:"24px"}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div><label style={lbl}>طالب علم *</label><select style={inp} value={resF.studentId} onChange={e=>setResF({...resF,studentId:e.target.value})}><option value="" style={{background:N2}}>-- منتخب کریں --</option>{students.map(s=><option key={s.id} value={s.id} style={{background:N2}}>{s.name}</option>)}</select></div>
        <div><label style={lbl}>کمرہ *</label><select style={inp} value={resF.roomId} onChange={e=>setResF({...resF,roomId:e.target.value})}><option value="" style={{background:N2}}>-- منتخب کریں --</option>{rooms.filter(r=>getOccupancy(r.id)<r.capacity).map(r=><option key={r.id} value={r.id} style={{background:N2}}>{r.roomNo} ({getOccupancy(r.id)}/{r.capacity})</option>)}</select></div>
        <div><label style={lbl}>چیک ان تاریخ</label><input style={{...inp,direction:"ltr",colorScheme:"dark"}} type="date" value={resF.checkIn} onChange={e=>setResF({...resF,checkIn:e.target.value})}/></div>
        <div><label style={lbl}>ماہانہ فیس</label><input style={{...inp,direction:"ltr",colorScheme:"dark"}} type="number" value={resF.monthlyFee} onChange={e=>setResF({...resF,monthlyFee:e.target.value})}/></div>
      </div>
      <button style={{background:"linear-gradient(135deg,#d4af37,#b8960a)",color:N,border:"none",borderRadius:"12px",padding:"11px 26px",fontSize:"0.82rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif",fontWeight:"700"}} onClick={addResident}>رہائشی شامل کریں</button>
    </div>}
    {tab==="residents"&&<div style={{...glass,overflow:"hidden"}}><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}>
      <thead><tr style={{background:"rgba(255,255,255,0.04)"}}>{["طالب علم","کمرہ","چیک ان","ماہانہ فیس","حال"].map(h=><th key={h} style={{padding:"12px 14px",textAlign:"right",fontSize:"0.65rem",color:"rgba(212,175,55,0.8)",fontWeight:"700"}}>{h}</th>)}</tr></thead>
      <tbody>{residents.map((r,ri)=>{ const st=students.find(s=>s.id===r.studentId); const rm=rooms.find(x=>x.id===r.roomId); return <tr key={r.id} style={{background:ri%2===0?"rgba(255,255,255,0.02)":"transparent"}}>
        <td style={{padding:"11px 14px",color:"#f1f5f9",fontWeight:"700",fontSize:"0.75rem",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>{st?.name||"—"}</td>
        <td style={{padding:"11px 14px",color:"rgba(255,255,255,0.7)",fontSize:"0.75rem",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>{rm?.roomNo||"—"}</td>
        <td style={{padding:"11px 14px",fontFamily:"monospace",direction:"ltr",fontSize:"0.6rem",color:"rgba(255,255,255,0.6)",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>{r.checkIn}</td>
        <td style={{padding:"11px 14px",fontWeight:"700",color:"#4ade80",fontSize:"0.75rem",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>Rs. {(r.monthlyFee||0).toLocaleString()}</td>
        <td style={{padding:"11px 14px",borderBottom:"1px solid rgba(255,255,255,0.05)"}}><span style={{padding:"3px 8px",borderRadius:"20px",fontSize:"0.55rem",fontWeight:"700",background:r.status==="active"?"rgba(74,222,128,0.15)":"rgba(255,255,255,0.06)",color:r.status==="active"?"#4ade80":"rgba(255,255,255,0.4)"}}>{r.status==="active"?"فعال":"غیر فعال"}</span></td>
      </tr>; })}{residents.length===0&&<tr><td colSpan={5} style={{padding:"40px",textAlign:"center",color:"rgba(255,255,255,0.3)"}}>کوئی رہائشی نہیں</td></tr>}</tbody>
    </table></div></div>}
  </div>;
}

export default HostelManagement;
