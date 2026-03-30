/* eslint-disable */
import { useState, useEffect } from "react";
import { C, S, hBadge } from "../../constants";
import { supabase, getData } from "../../supabase";
import { printSalarySlip } from "../../utils/print";

function SalaryManagement({teachers,addData}){
  const G="#d4af37"; const N="#0f172a"; const N2="#1e293b";
  const glass={background:"rgba(255,255,255,0.07)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:"16px"};
  const inp={width:"100%",padding:"10px 14px",borderRadius:"10px",border:"1px solid rgba(212,175,55,0.25)",background:"rgba(255,255,255,0.06)",color:"#f1f5f9",fontSize:"0.8rem",fontFamily:"'Public Sans',sans-serif",outline:"none",boxSizing:"border-box",direction:"ltr",colorScheme:"dark"};
  const lbl={fontSize:"0.7rem",color:"rgba(212,175,55,0.8)",marginBottom:"6px",display:"block",fontWeight:"600"};
  const [salaries,setSalaries]=useState([]); const [show,setShow]=useState(false);
  const [f,setF]=useState({teacherId:"",month:"",basicSalary:25000,allowances:5000,deductions:0,notes:""});
  useEffect(()=>{ getData("salaries").then(data=>setSalaries(data||[])); },[]);
  const add=async()=>{ if(!f.teacherId||!f.month)return; const net=Number(f.basicSalary)+Number(f.allowances)-Number(f.deductions); await addData("salaries",{...f,basicSalary:Number(f.basicSalary),allowances:Number(f.allowances),deductions:Number(f.deductions),netSalary:net,status:"paid"}); setShow(false); setF({teacherId:"",month:"",basicSalary:25000,allowances:5000,deductions:0,notes:""}); };
  const net=Number(f.basicSalary)+Number(f.allowances)-Number(f.deductions);
  const teacherSummary=teachers.map(t=>{ const tSal=salaries.filter(s=>s.teacherId===t.id); const totalPaid=tSal.reduce((s,x)=>s+(x.netSalary||0),0); return {...t,totalPaid,months:tSal.length}; });
  return <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#0f172a 0%,#0d1f3c 50%,#0a1628 100%)",padding:"24px 20px",fontFamily:"'Public Sans',sans-serif",direction:"ltr"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"24px",flexWrap:"wrap",gap:"12px"}}>
      <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
        <div style={{width:"44px",height:"44px",borderRadius:"12px",background:"linear-gradient(135deg,#d4af37,#b8960a)",display:"flex",alignItems:"center",justifyContent:"center"}}><span className="material-symbols-rounded" style={{fontSize:"24px",color:N}}>account_balance_wallet</span></div>
        <div><h2 style={{margin:0,fontSize:"1.4rem",fontWeight:"800",color:"#f1f5f9"}}>Salary Management</h2><p style={{margin:0,fontSize:"0.72rem",color:"rgba(212,175,55,0.7)"}}>Salary Management</p></div>
      </div>
      <button style={{display:"flex",alignItems:"center",gap:"8px",padding:"10px 20px",borderRadius:"12px",border:"1px solid #d4af37",background:show?"rgba(212,175,55,0.15)":"transparent",color:"#d4af37",fontWeight:"700",fontSize:"0.82rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif"}} onClick={()=>setShow(!show)}><span className="material-symbols-rounded" style={{fontSize:"18px"}}>{show?"close":"add_circle"}</span>{show?"Cancel":"Salary Enter"}</button>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:"14px",marginBottom:"20px"}}>
      {teacherSummary.map(t=><div key={t.id} style={{...glass,padding:"16px"}}>
        <div style={{fontWeight:"700",color:"#f1f5f9",marginBottom:"4px"}}>{t.name}</div>
        <div style={{fontSize:"0.62rem",color:"rgba(255,255,255,0.5)",marginBottom:"8px"}}>{t.subject}</div>
        <div style={{fontSize:"1.2rem",fontWeight:"900",color:"#4ade80"}}>Rs. {t.totalPaid.toLocaleString()}</div>
        <div style={{fontSize:"0.6rem",color:"rgba(255,255,255,0.4)"}}>{t.months} Month Paid</div>
      </div>)}
    </div>
    {show&&<div style={{...glass,padding:"24px",marginBottom:"20px",borderColor:"rgba(212,175,55,0.3)"}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div><label style={lbl}>Teacher *</label><select style={inp} value={f.teacherId} onChange={e=>setF({...f,teacherId:e.target.value})}><option value="" style={{background:N2}}>-- Select --</option>{teachers.map(t=><option key={t.id} value={t.id} style={{background:N2}}>{t.name}</option>)}</select></div>
        <div><label style={lbl}>Month *</label><input style={{...inp,direction:"ltr",colorScheme:"dark"}} type="month" value={f.month} onChange={e=>setF({...f,month:e.target.value})}/></div>
        <div><label style={lbl}>Basic Salary</label><input style={{...inp,direction:"ltr",colorScheme:"dark"}} type="number" value={f.basicSalary} onChange={e=>setF({...f,basicSalary:e.target.value})}/></div>
        <div><label style={lbl}>Allowances</label><input style={{...inp,direction:"ltr",colorScheme:"dark"}} type="number" value={f.allowances} onChange={e=>setF({...f,allowances:e.target.value})}/></div>
        <div><label style={lbl}>Deduction</label><input style={{...inp,direction:"ltr",colorScheme:"dark"}} type="number" value={f.deductions} onChange={e=>setF({...f,deductions:e.target.value})}/></div>
      </div>
      <div style={{background:"rgba(74,222,128,0.1)",border:"1px solid rgba(74,222,128,0.2)",borderRadius:"10px",padding:"12px 16px",marginBottom:"12px",textAlign:"center"}}>
        <div style={{fontSize:"0.62rem",color:"rgba(255,255,255,0.5)"}}>Net Salary</div>
        <div style={{fontSize:"1.5rem",fontWeight:"900",color:"#4ade80"}}>Rs. {net.toLocaleString()}</div>
      </div>
      <button style={{background:"linear-gradient(135deg,#d4af37,#b8960a)",color:N,border:"none",borderRadius:"12px",padding:"11px 26px",fontSize:"0.82rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif",fontWeight:"700"}} onClick={add}>Save</button>
    </div>}
    <div style={{...glass,overflow:"hidden"}}><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}>
      <thead><tr style={{background:"rgba(255,255,255,0.04)"}}>{["Teacher","Month","Basic","Allowance","Deduction","Net","Print"].map(h=><th key={h} style={{padding:"12px 14px",textAlign:"left",fontSize:"0.65rem",color:"rgba(212,175,55,0.8)",fontWeight:"700"}}>{h}</th>)}</tr></thead>
      <tbody>{salaries.map((s,ri)=>{ const t=teachers.find(x=>x.id===s.teacherId); return <tr key={s.id} style={{background:ri%2===0?"rgba(255,255,255,0.02)":"transparent"}}>
        <td style={{padding:"11px 14px",fontSize:"0.75rem",color:"#f1f5f9",fontWeight:"700",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>{t?.name||"—"}</td>
        <td style={{padding:"11px 14px",fontFamily:"monospace",direction:"ltr",fontSize:"0.6rem",color:"rgba(255,255,255,0.6)",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>{s.month}</td>
        <td style={{padding:"11px 14px",fontSize:"0.75rem",color:"rgba(255,255,255,0.7)",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>Rs. {(s.basicSalary||0).toLocaleString()}</td>
        <td style={{padding:"11px 14px",fontSize:"0.75rem",color:"#4ade80",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>+{(s.allowances||0).toLocaleString()}</td>
        <td style={{padding:"11px 14px",fontSize:"0.75rem",color:"#f87171",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>-{(s.deductions||0).toLocaleString()}</td>
        <td style={{padding:"11px 14px",fontWeight:"900",color:"#4ade80",fontSize:"0.78rem",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>Rs. {(s.netSalary||0).toLocaleString()}</td>
        <td style={{padding:"11px 14px",borderBottom:"1px solid rgba(255,255,255,0.05)"}}><button onClick={()=>printSalarySlip(t||{},s)} style={{background:"rgba(212,175,55,0.1)",color:"#d4af37",border:"1px solid rgba(212,175,55,0.3)",borderRadius:"8px",padding:"4px 10px",fontSize:"0.58rem",cursor:"pointer",fontFamily:"inherit",fontWeight:"700"}}>🖨️ Print</button></td>
      </tr>; })}{salaries.length===0&&<tr><td colSpan={7} style={{padding:"40px",textAlign:"center",color:"rgba(255,255,255,0.3)"}}><span className="ur">کوئی اندراج نہیں</span></td></tr>}</tbody>
    </table></div></div>
  </div>;
}

export default SalaryManagement;
