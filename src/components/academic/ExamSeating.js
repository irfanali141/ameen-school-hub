/* eslint-disable */
import { useState, useEffect } from "react";
import { C, S, hBadge } from "../../constants";
import { supabase } from "../../supabase";

function ExamSeating({students,addData}){
  const [plans,setPlans]=useState([]); const [show,setShow]=useState(false); const [sel,setSel]=useState(null);
  const [f,setF]=useState({examName:"",date:"",venue:"",rows:5,cols:6,subject:"",examClass:""});
  useEffect(()=>{ const load=async()=>{ const {data}=await supabase.from("exam_seating").select("*").order("created_at",{ascending:false}).limit(20); setPlans(data||[]); }; load(); },[]);
  const create=async()=>{ if(!f.examName)return;
    const rows=Number(f.rows); const cols=Number(f.cols);
    const classStudents=students.filter(s=>!f.examClass||s.grade===f.examClass);
    const shuffled=[...classStudents].sort(()=>Math.random()-0.5);
    const seats=[];
    for(let r=1;r<=rows;r++){ for(let c=1;c<=cols;c++){ const idx=(r-1)*cols+(c-1); const st=shuffled[idx]; seats.push({row:r,col:c,seatNo:`R${r}C${c}`,studentId:st?.id||null,studentName:st?.name||null,studentCode:st?.studentCode||null}); }}
    await addData("exam_seating",{...f,rows,cols,seats,totalSeats:rows*cols,assignedSeats:shuffled.length});
    setShow(false); setF({examName:"",date:"",venue:"",rows:5,cols:6,subject:"",examClass:""});
  };
  if(sel){ return <div style={S.page}>
    <button style={{...S.addBtn,marginBottom:"16px",background:"#eee",color:C.navy,boxShadow:"none"}} onClick={()=>setSel(null)}>← Back</button>
    <div className="hv-card" style={{...S.card,marginBottom:"20px",background:`linear-gradient(135deg,${C.navy},${C.navyMid})`,color:C.white}}>
      <div style={{fontSize:"1rem",fontWeight:"800"}}>{sel.examName}</div>
      <div style={{fontSize:"0.62rem",opacity:0.7,marginTop:"4px"}}>{sel.subject} • {sel.venue} • {sel.date}</div>
      <div style={{fontSize:"0.68rem",color:C.gold,marginTop:"8px"}}>{sel.assignedSeats}/{sel.totalSeats} seats assigned</div>
    </div>
    <div style={{overflowX:"auto"}}><div style={{display:"grid",gridTemplateColumns:`repeat(${sel.cols},1fr)`,gap:"6px",minWidth:`${sel.cols*80}px`}}>
      {(sel.seats||[]).map((seat,i)=><div key={i} style={{background:seat.studentId?"linear-gradient(135deg,#dbeafe,#eff6ff)":"#f9fafb",borderRadius:"8px",padding:"8px 6px",textAlign:"center",border:`1px solid ${seat.studentId?C.abuBakr+"40":"#e5e7eb"}`,minHeight:"64px",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
        <div style={{fontSize:"0.55rem",color:"#aaa",marginBottom:"2px"}}>{seat.seatNo}</div>
        {seat.studentName?<div><div style={{fontSize:"0.58rem",fontWeight:"700",color:C.navy,lineHeight:"1.3"}}>{seat.studentName.split(" ")[0]}</div><div style={{fontSize:"0.5rem",color:C.abuBakr,fontFamily:"monospace",direction:"ltr"}}>{seat.studentCode}</div></div>:<div style={{fontSize:"0.6rem",color:"#ddd"}}>Empty</div>}
      </div>)}
    </div></div>
  </div>; }
  return <div style={S.page}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
      <div><div style={{fontSize:"1.1rem",fontWeight:"700",color:C.navy}}>🪑 Exam Seating Plan</div><div style={{fontSize:"0.62rem",color:"#888",marginTop:"2px"}}>Seating Plan — Auto Order</div></div>
      <button style={S.addBtn} onClick={()=>setShow(!show)}>+ New Plan</button>
    </div>
    {show&&<div className="hv-card" style={{...S.card,marginBottom:"20px",background:`linear-gradient(135deg,${C.goldLight},#fdf8ee)`,border:`2px solid ${C.gold}30`}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div style={{gridColumn:"1/-1"}}><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>Exam Name *</label><input style={S.inpSm} value={f.examName} onChange={e=>setF({...f,examName:e.target.value})} placeholder="Annual Exam 2026..."/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>Subject</label><input style={S.inpSm} value={f.subject} onChange={e=>setF({...f,subject:e.target.value})} placeholder="Mathematics, Urdu..."/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>Hall / Room</label><input style={S.inpSm} value={f.venue} onChange={e=>setF({...f,venue:e.target.value})} placeholder="Hall A..."/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>Date</label><input style={{...S.inpSm,direction:"ltr"}} type="date" value={f.date} onChange={e=>setF({...f,date:e.target.value})}/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>Grade (blank = All)</label><input style={S.inpSm} value={f.examClass} onChange={e=>setF({...f,examClass:e.target.value})} placeholder="8, 9, 10..."/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>Rows</label><input style={{...S.inpSm,direction:"ltr"}} type="number" min="1" max="20" value={f.rows} onChange={e=>setF({...f,rows:e.target.value})}/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>Columns</label><input style={{...S.inpSm,direction:"ltr"}} type="number" min="1" max="20" value={f.cols} onChange={e=>setF({...f,cols:e.target.value})}/></div>
      </div>
      <div style={{background:C.white,borderRadius:"10px",padding:"10px 14px",marginBottom:"12px",fontSize:"0.65rem",color:"#888"}}>ℹ️ Students will be seated in random order — Total {Number(f.rows)*Number(f.cols)} seats</div>
      <button style={S.saveBtn} onClick={create}>🪑 Create Plan</button>
    </div>}
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:"14px"}}>
      {plans.map(p=><div key={p.id} className="hv-card" style={{...S.card,cursor:"pointer",borderTop:`4px solid ${C.gold}`}} onClick={()=>setSel(p)}>
        <div style={{fontSize:"0.85rem",fontWeight:"700",color:C.navy,marginBottom:"6px"}}>🪑 {p.examName}</div>
        <div style={{fontSize:"0.65rem",color:"#888",marginBottom:"8px"}}>{p.subject} • {p.venue}</div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:"0.62rem",color:C.gold,fontFamily:"monospace",direction:"ltr"}}>{p.date}</span>
          <span style={hBadge(C.abuBakr,"#dbeafe")}>{p.assignedSeats}/{p.totalSeats} Students</span>
        </div>
        <div style={{marginTop:"10px",fontSize:"0.6rem",color:C.abuBakr,fontWeight:"600"}}>👁️ View Plan ←</div>
      </div>)}
      {plans.length===0&&<div className="hv-card" style={{...S.card,textAlign:"center",color:"#bbb",padding:"40px",gridColumn:"1/-1"}}>No plans yet</div>}
    </div>
  </div>;
}

export default ExamSeating;
