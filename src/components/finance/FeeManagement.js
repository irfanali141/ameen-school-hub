/* eslint-disable */
import { useState, useEffect } from "react";
import { C, S, hBadge, sLabel } from "../../constants";
import letterhead from "../../assets/letterhead.png";

const RECEIPT_PRINT_STYLE = `
@media print {
  body * { visibility: hidden !important; }
  #fee-receipt-print-area, #fee-receipt-print-area * { visibility: visible !important; }
  #fee-receipt-print-area {
    position: fixed !important;
    top: 0; left: 0;
    width: 100%;
    background: white;
    padding: 0;
    margin: 0;
  }
  .no-print { display: none !important; }
  @page { margin: 0; size: A4; }
}
`;



function FeeManagement({students,addData,updateData,fees:feesProp=[]}){
  const G="#d4af37";const N="#0f172a";const N2="#1e293b";
  const glass={background:"rgba(255,255,255,0.07)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:"16px"};
  const [fees,setFees]=useState(feesProp);const [show,setShow]=useState(false);const [q,setQ]=useState("");const [filterStatus,setFilterStatus]=useState("all");
  const [selectedFee,setSelectedFee]=useState(null);
  useEffect(()=>{setFees(feesProp);},[feesProp]);

  const printReceipt=(fee)=>{
    setSelectedFee(fee);
    if(!document.getElementById("fee-receipt-print-style")){
      const s=document.createElement("style");s.id="fee-receipt-print-style";s.innerHTML=RECEIPT_PRINT_STYLE;document.head.appendChild(s);
    }
    setTimeout(()=>window.print(),50);
  };
  const [f,setF]=useState({studentId:"",feeType:"monthly",amount:3000,month:"",dueDate:"",status:"pending",notes:""});
  const [bulkShow,setBulkShow]=useState(false);
  const [bulkResult,setBulkResult]=useState(null);

  const handleBulkCSV=async(e)=>{
    const file=e.target.files[0]; if(!file)return;
    const text=await file.text();
    const lines=text.split("\n").map(l=>l.trim()).filter(Boolean);
    // Skip header row if it starts with non-numeric / student name header
    const dataLines=lines[0]?.toLowerCase().includes("name")||lines[0]?.toLowerCase().includes("student")?lines.slice(1):lines;
    let ok=0,skip=0,errs=[];
    for(const line of dataLines){
      const [nameOrCode,amtStr,typeStr,monthStr]= line.split(",").map(s=>s?.trim());
      if(!nameOrCode||!amtStr){skip++;continue;}
      // Match student by name (partial, case-insensitive) or studentCode
      const st=students.find(s=>
        s.name?.toLowerCase().includes(nameOrCode.toLowerCase())||
        s.studentCode?.toLowerCase()===nameOrCode.toLowerCase()
      );
      if(!st){errs.push(`نہیں ملا: ${nameOrCode}`);skip++;continue;}
      const [yr,mo]=monthStr?monthStr.split("-").map(Number):[new Date().getFullYear(),new Date().getMonth()+1];
      try{
        await addData("fees",{
          student_id:st.id, student_name:st.name,
          amount:parseFloat(amtStr)||0,
          type:typeStr||"monthly",
          month:mo||new Date().getMonth()+1,
          year:yr||new Date().getFullYear(),
          status:"pending",
        });
        ok++;
      }catch(err){errs.push(`خرابی ${st.name}: ${err.message}`);skip++;}
    }
    setBulkResult({ok,skip,errs});
    e.target.value="";
  };
  
  const add=async()=>{
    if(!f.studentId||!f.amount)return;
    const st=students.find(s=>s.id===f.studentId);
    // Parse month string "YYYY-MM" → integer month and year
    const [yr,mo]=f.month?f.month.split("-").map(Number):[new Date().getFullYear(),new Date().getMonth()+1];
    await addData("fees",{
      student_id: f.studentId,
      student_name: st?.name||"",
      amount: Number(f.amount),
      type: f.feeType,
      month: mo||null,
      year: yr||new Date().getFullYear(),
      status: f.status,
      due_date: f.dueDate||null,
    });
    setShow(false);setF({studentId:"",feeType:"monthly",amount:3000,month:"",dueDate:"",status:"pending",notes:""});
  };
  const markPaid=async(id)=>{ try{ await updateData("fees",id,{status:"paid",paid_date:new Date().toISOString().slice(0,10)}); setFees(prev=>prev.map(f=>f.id===id?{...f,status:"paid",paid_date:new Date().toISOString().slice(0,10)}:f)); }catch(e){ console.error("markPaid error:",e.message); } };
  const filtered=fees.filter(fe=>{ const st=students.find(s=>s.id===fe.studentId); const matchQ=!q||st?.name?.includes(q)||st?.studentCode?.includes(q); const matchS=filterStatus==="all"||fe.status===filterStatus; return matchQ&&matchS; });
  const totalPending=fees.filter(fe=>fe.status==="pending").reduce((s,fe)=>s+(fe.amount||0),0);
  const totalPaid=fees.filter(fe=>fe.status==="paid").reduce((s,fe)=>s+(fe.amount||0),0);
  const feeTypes={"monthly":"Monthly Fee","admission":"Admission Fee","exam":"Exam Fee","canteen":"Canteen","hostel":"Hostel","transport":"Transport","other":"Other"};
  const inp={width:"100%",padding:"10px 14px",borderRadius:"10px",border:"1px solid rgba(212,175,55,0.25)",background:"rgba(255,255,255,0.06)",color:"#f1f5f9",fontSize:"0.8rem",fontFamily:"'Public Sans',sans-serif",outline:"none",boxSizing:"border-box",direction:"ltr",colorScheme:"dark"};
  const lbl={fontSize:"0.7rem",color:"rgba(212,175,55,0.8)",marginBottom:"6px",display:"block",fontWeight:"600"};
  return (
    <div style={{minHeight:"100vh",background:`linear-gradient(160deg,${N} 0%,#0d1f3c 50%,#0a1628 100%)`,padding:"24px 20px",fontFamily:"'Public Sans',sans-serif",direction:"ltr"}}>
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"28px",flexWrap:"wrap",gap:"12px"}}>
        <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
          <div style={{width:"44px",height:"44px",borderRadius:"12px",background:`linear-gradient(135deg,${G},#b8960a)`,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 4px 20px rgba(212,175,55,0.4)`}}>
            <span className="material-symbols-rounded" style={{fontSize:"24px",color:N}}>payments</span>
          </div>
          <div>
            <h1 style={{margin:0,fontSize:"1.5rem",fontWeight:"800",color:"#f1f5f9"}}>Fee Management</h1>
            <p style={{margin:0,fontSize:"0.75rem",color:"rgba(212,175,55,0.7)",fontWeight:"500"}}>Track and manage student fees</p>
          </div>
        </div>
        <div style={{display:"flex",gap:"10px",flexWrap:"wrap"}}>
          <label style={{display:"flex",alignItems:"center",gap:"8px",padding:"11px 18px",borderRadius:"12px",border:"1px solid rgba(99,202,183,0.5)",background:"rgba(99,202,183,0.08)",color:"#63cab7",fontWeight:"700",fontSize:"0.82rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif"}}>
            <span className="material-symbols-rounded" style={{fontSize:"18px"}}>upload_file</span>CSV Upload
            <input type="file" accept=".csv,.txt" style={{display:"none"}} onChange={handleBulkCSV}/>
          </label>
          <button onClick={()=>setBulkShow(!bulkShow)} style={{padding:"11px 16px",borderRadius:"12px",border:"1px solid rgba(99,202,183,0.3)",background:"rgba(99,202,183,0.06)",color:"rgba(99,202,183,0.8)",fontWeight:"600",fontSize:"0.75rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif"}}>? Format</button>
          <button onClick={()=>setShow(!show)} style={{display:"flex",alignItems:"center",gap:"8px",padding:"11px 22px",borderRadius:"12px",border:`1px solid ${G}`,background:show?"rgba(212,175,55,0.15)":"transparent",color:G,fontWeight:"700",fontSize:"0.85rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif"}}>
            <span className="material-symbols-rounded" style={{fontSize:"20px"}}>{show?"close":"add_circle"}</span>{show?"Cancel":"New Fee"}
          </button>
        </div>
      </div>

      {/* CSV Format Guide */}
      {bulkShow&&<div style={{background:"rgba(99,202,183,0.08)",border:"1px solid rgba(99,202,183,0.3)",borderRadius:"12px",padding:"16px 20px",marginBottom:"16px",fontSize:"0.78rem",color:"#63cab7"}}>
        <div style={{fontWeight:"700",marginBottom:"8px"}}>📄 CSV فائل کا format (کوما سے الگ):</div>
        <code style={{display:"block",background:"rgba(0,0,0,0.3)",padding:"10px",borderRadius:"8px",color:"#a3e6dc",direction:"ltr",fontFamily:"monospace",lineHeight:"1.8"}}>
          student_name,amount,type,YYYY-MM<br/>
          Ahmad Ali,3000,monthly,2024-04<br/>
          Bilal Khan,2500,monthly,2024-04<br/>
          Sara Noor,3000,admission,
        </code>
        <div style={{marginTop:"8px",opacity:0.7}}>• پہلی row header ہو سکتی ہے (خود پہچانے گا) • type: monthly/admission/exam/hostel • YYYY-MM optional</div>
      </div>}

      {/* Bulk Result */}
      {bulkResult&&<div style={{background: bulkResult.skip===0?"rgba(74,222,128,0.1)":"rgba(251,146,60,0.1)",border:`1px solid ${bulkResult.skip===0?"rgba(74,222,128,0.3)":"rgba(251,146,60,0.3)"}`,borderRadius:"12px",padding:"14px 18px",marginBottom:"16px",fontSize:"0.8rem"}}>
        <span style={{color:"#4ade80",fontWeight:"700"}}>✅ {bulkResult.ok} کامیاب</span>
        {bulkResult.skip>0&&<span style={{color:"#fb923c",fontWeight:"700",marginLeft:"16px"}}>⚠️ {bulkResult.skip} ناکام</span>}
        {bulkResult.errs.length>0&&<div style={{marginTop:"8px",color:"#fca5a5",fontSize:"0.72rem"}}>{bulkResult.errs.slice(0,5).join(" • ")}</div>}
        <button onClick={()=>setBulkResult(null)} style={{marginLeft:"16px",background:"none",border:"none",color:"#94a3b8",cursor:"pointer",fontSize:"0.75rem"}}>✕</button>
      </div>}

      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:"14px",marginBottom:"24px"}}>
        {[
          {icon:"warning",label:"Pending Amount",val:`Rs. ${totalPending.toLocaleString()}`,color:"#f87171"},
          {icon:"check_circle",label:"Collected",val:`Rs. ${totalPaid.toLocaleString()}`,color:"#4ade80"},
          {icon:"pending",label:"Pending Students",val:fees.filter(fe=>fe.status==="pending").length,color:"#fb923c"},
          {icon:"receipt_long",label:"Total Entries",val:fees.length,color:G},
        ].map(s=>(
          <div key={s.label} className="hv-stat" style={{...glass,padding:"18px 16px",display:"flex",alignItems:"center",gap:"14px"}}>
            <div style={{width:"40px",height:"40px",borderRadius:"10px",background:`${s.color}20`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <span className="material-symbols-rounded" style={{fontSize:"22px",color:s.color}}>{s.icon}</span>
            </div>
            <div><div style={{fontSize:"1.1rem",fontWeight:"800",color:"#f1f5f9",lineHeight:1.1}}>{s.val}</div><div style={{fontSize:"0.65rem",color:"rgba(241,245,249,0.45)",marginTop:"3px"}}>{s.label}</div></div>
          </div>
        ))}
      </div>
      {/* Add Form */}
      {show&&(
        <div style={{...glass,padding:"24px",marginBottom:"24px",borderColor:"rgba(212,175,55,0.3)"}}>
          <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"20px"}}>
            <span className="material-symbols-rounded" style={{color:G,fontSize:"22px"}}>add_circle</span>
            <span style={{color:G,fontWeight:"700",fontSize:"1rem"}}>New Fee Entry</span>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px",marginBottom:"16px"}}>
            <div><label style={lbl}>Student *</label><select style={inp} value={f.studentId} onChange={e=>setF({...f,studentId:e.target.value})}><option value="" style={{background:N2}}>-- Select --</option>{students.map(s=><option key={s.id} value={s.id} style={{background:N2}}>{sLabel(s)}</option>)}</select></div>
            <div><label style={lbl}>Type</label><select style={inp} value={f.feeType} onChange={e=>setF({...f,feeType:e.target.value})}>{Object.entries(feeTypes).map(([k,v])=><option key={k} value={k} style={{background:N2}}>{v}</option>)}</select></div>
            <div><label style={lbl}>Amount (Rs) *</label><input style={{...inp,direction:"ltr"}} type="number" value={f.amount} onChange={e=>setF({...f,amount:e.target.value})}/></div>
            <div><label style={lbl}>Month</label><input style={{...inp,direction:"ltr"}} type="month" value={f.month} onChange={e=>setF({...f,month:e.target.value})}/></div>
            <div><label style={lbl}>Due Date</label><input style={{...inp,direction:"ltr"}} type="date" value={f.dueDate} onChange={e=>setF({...f,dueDate:e.target.value})}/></div>
            <div><label style={lbl}>Status</label><select style={inp} value={f.status} onChange={e=>setF({...f,status:e.target.value})}><option value="pending" style={{background:N2}}>Pending</option><option value="paid" style={{background:N2}}>Paid</option></select></div>
            <div style={{gridColumn:"1/-1"}}><label style={lbl}>Notes</label><input style={inp} value={f.notes} onChange={e=>setF({...f,notes:e.target.value})} placeholder="نوٹس"/></div>
          </div>
          <div style={{display:"flex",gap:"10px",justifyContent:"flex-end"}}>
            <button onClick={()=>setShow(false)} style={{padding:"10px 20px",borderRadius:"10px",border:"1px solid rgba(255,255,255,0.15)",background:"transparent",color:"rgba(241,245,249,0.6)",fontWeight:"600",fontSize:"0.82rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif"}}>Cancel</button>
            <button onClick={add} style={{display:"flex",alignItems:"center",gap:"8px",padding:"10px 24px",borderRadius:"10px",border:"none",background:`linear-gradient(135deg,${G},#b8960a)`,color:N,fontWeight:"700",fontSize:"0.82rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif"}}>
              <span className="material-symbols-rounded" style={{fontSize:"18px"}}>save</span>Save
            </button>
          </div>
        </div>
      )}
      {/* Search & Filter */}
      <div style={{...glass,padding:"14px 18px",marginBottom:"20px",display:"flex",gap:"10px",flexWrap:"wrap",alignItems:"center"}}>
        <div style={{flex:1,minWidth:"200px",position:"relative"}}>
          <span className="material-symbols-rounded" style={{position:"absolute",right:"12px",top:"50%",transform:"translateY(-50%)",color:"rgba(212,175,55,0.6)",fontSize:"20px",pointerEvents:"none"}}>search</span>
          <input style={{...inp,paddingRight:"40px"}} placeholder="Search by name or code..." value={q} onChange={e=>setQ(e.target.value)}/>
        </div>
        {[["all","سب"],["pending","باقی"],["paid","ادا"]].map(([v,l])=>(
          <button key={v} onClick={()=>setFilterStatus(v)} style={{padding:"9px 16px",borderRadius:"9px",border:`1px solid ${filterStatus===v?G:"rgba(255,255,255,0.1)"}`,background:filterStatus===v?"rgba(212,175,55,0.15)":"transparent",color:filterStatus===v?G:"rgba(241,245,249,0.5)",fontWeight:filterStatus===v?"700":"500",fontSize:"0.78rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif"}}>{l}</button>
        ))}
        <div style={{color:"rgba(241,245,249,0.35)",fontSize:"0.72rem"}}>{filtered.length} Results</div>
      </div>
      {/* Table */}
      <div style={{...glass,overflow:"hidden"}}><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead><tr style={{background:"rgba(255,255,255,0.04)"}}>
          {["Receipt No.","Student","Type","Amount","Month","Status","Action"].map(h=><th key={h} style={{padding:"12px 16px",textAlign:"left",fontSize:"0.68rem",fontWeight:"700",color:"rgba(212,175,55,0.8)",borderBottom:"1px solid rgba(255,255,255,0.08)"}}>{h}</th>)}
        </tr></thead>
        <tbody>{filtered.map((fee,i)=>{ const st=students.find(s=>s.id===fee.studentId); const paid=fee.status==="paid"; return (
          <tr key={fee.id} style={{borderBottom:"1px solid rgba(255,255,255,0.05)",background:i%2===0?"rgba(255,255,255,0.02)":"transparent"}}>
            <td style={{padding:"11px 16px",fontFamily:"'Courier New',monospace",fontWeight:"700",color:G,fontSize:"0.72rem",letterSpacing:"0.04em",direction:"ltr",whiteSpace:"nowrap"}}>{fee.receipt_no||"—"}</td>
            <td style={{padding:"11px 16px",fontWeight:"700",color:"#f1f5f9",fontSize:"0.82rem"}}>{st?.name||"—"}</td>
            <td style={{padding:"11px 16px",color:"rgba(241,245,249,0.6)",fontSize:"0.75rem"}}>{feeTypes[fee.type||fee.feeType]||fee.type||fee.feeType}</td>
            <td style={{padding:"11px 16px",fontWeight:"800",color:G,fontSize:"0.85rem",direction:"ltr"}}>Rs. {(fee.amount||0).toLocaleString()}</td>
            <td style={{padding:"11px 16px",direction:"ltr",fontFamily:"monospace",color:"rgba(241,245,249,0.45)",fontSize:"0.68rem"}}>{fee.month||"—"}</td>
            <td style={{padding:"11px 16px"}}><span style={{padding:"3px 10px",borderRadius:"20px",fontSize:"0.62rem",fontWeight:"700",background:paid?"rgba(74,222,128,0.15)":"rgba(251,146,60,0.15)",color:paid?"#4ade80":"#fb923c",border:`1px solid ${paid?"rgba(74,222,128,0.3)":"rgba(251,146,60,0.3)"}`}}>{paid?"ادا":"باقی"}</span></td>
            <td style={{padding:"11px 16px",display:"flex",gap:"6px",alignItems:"center"}}>
              {!paid&&<button onClick={()=>markPaid(fee.id)} style={{padding:"6px 14px",borderRadius:"8px",border:"none",background:`linear-gradient(135deg,${G},#b8960a)`,color:N,fontWeight:"700",fontSize:"0.68rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif"}} className="ur">ادا ✓</button>}
              {paid&&<button onClick={()=>printReceipt(fee)} style={{padding:"6px 12px",borderRadius:"8px",border:"1px solid rgba(74,222,128,0.4)",background:"rgba(74,222,128,0.12)",color:"#4ade80",fontWeight:"700",fontSize:"0.68rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif",display:"flex",alignItems:"center",gap:"4px"}}>🖨️ Receipt</button>}
            </td>
          </tr>
        ); })}
        {filtered.length===0&&<tr><td colSpan={7} style={{padding:"50px",textAlign:"center",color:"rgba(241,245,249,0.3)"}}>
          <span className="material-symbols-rounded" style={{fontSize:"40px",display:"block",marginBottom:"10px",color:"rgba(212,175,55,0.2)"}}>payments</span><span className="ur">کوئی اندراج نہیں</span>
        </td></tr>}
        </tbody>
      </table></div></div>

      {/* ── Receipt print area (hidden on screen, visible on print) ── */}
      <div id="fee-receipt-print-area" style={{position:"absolute",left:"-9999px",top:0,width:"210mm"}}>
        {selectedFee&&(()=>{
          const st=students.find(s=>s.id===selectedFee.studentId);
          const receiptNo=selectedFee.receipt_no||selectedFee.id?.slice(0,8).toUpperCase()||"—";
          const dateStr=selectedFee.date||selectedFee.created_at?.slice(0,10)||new Date().toISOString().slice(0,10);
          return (
            <div style={{background:"#fff",padding:"0",fontFamily:"'Segoe UI',Arial,serif",direction:"ltr",color:"#0f172a"}}>
              {/* Letterhead */}
              <img src={letterhead} alt="" style={{width:"100%",display:"block"}}/>

              {/* Receipt title */}
              <div style={{textAlign:"center",padding:"18px 40px 10px",borderBottom:"2px solid #b7860b"}}>
                <div style={{fontSize:"1.3rem",fontWeight:"800",color:"#7a5807",fontFamily:"'Noto Nastaliq Urdu',serif"}}>فیس رسید</div>
                <div style={{fontSize:"0.75rem",color:"#888",fontFamily:"'Public Sans',sans-serif",marginTop:"2px"}}>Ameen Islamic Institute</div>
              </div>

              {/* Receipt details table */}
              <div style={{padding:"24px 48px"}}>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:"0.88rem"}}>
                  <tbody>
                    {[
                      ["رسید نمبر",   receiptNo,          true],
                      ["تاریخ",               dateStr,            true],
                      ["طالب علم",  st?.name||"—",      false],
                      ["جماعت",              st?.grade||"—",     false],
                      ["فیس مہینہ",          selectedFee.month||"—", false],
                      ["فیس کی قسم",      feeTypes[selectedFee.feeType]||selectedFee.feeType||"—", false],
                      ["رقم",               `Rs. ${(selectedFee.amount||0).toLocaleString()}`, true],
                      ["حیثیت",           "✅ ادا", false],
                    ].map(([label,val,mono],i)=>(
                      <tr key={i} style={{background:i%2===0?"#fffdf8":"#fff"}}>
                        <td style={{padding:"10px 14px",fontWeight:"700",color:"#7a5807",width:"45%",borderBottom:"1px solid #f5e9c8",fontSize:"0.82rem"}}>{label}</td>
                        <td style={{padding:"10px 14px",color:"#1e293b",borderBottom:"1px solid #f5e9c8",fontFamily:mono?"'Courier New',monospace":"inherit",fontWeight:mono?"800":"500",direction:"ltr",textAlign:"left",fontSize:"0.85rem"}}>{val}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Amount in words placeholder */}
                <div style={{margin:"18px 0",padding:"12px 16px",background:"#fffdf8",border:"1px solid #f5e9c8",borderRadius:"8px",fontSize:"0.78rem",color:"#555"}}>
                  <span style={{fontWeight:"700",color:"#7a5807",fontFamily:"'Noto Nastaliq Urdu',serif"}}>الفاظ میں: </span>
                  <span style={{direction:"ltr",display:"inline-block"}}>{(selectedFee.amount||0).toLocaleString()}</span>
                </div>

                {/* Signature lines */}
                <div style={{display:"flex",justifyContent:"space-between",marginTop:"48px",paddingTop:"8px"}}>
                  <div style={{textAlign:"center",minWidth:"160px"}}>
                    <div style={{borderTop:"1.5px solid #0f172a",paddingTop:"8px",fontSize:"0.75rem",color:"#444",fontWeight:"600",fontFamily:"'Noto Nastaliq Urdu',serif",direction:"rtl"}}>کیشیئر کا دستخط</div>
                  </div>
                  <div style={{textAlign:"center",minWidth:"160px"}}>
                    <div style={{borderTop:"1.5px solid #0f172a",paddingTop:"8px",fontSize:"0.75rem",color:"#444",fontWeight:"600",fontFamily:"'Noto Nastaliq Urdu',serif",direction:"rtl"}}>پرنسپل کا دستخط</div>
                  </div>
                </div>

                {/* Footer note */}
                <div style={{marginTop:"32px",textAlign:"center",fontSize:"0.65rem",color:"#aaa",borderTop:"1px solid #f0ede8",paddingTop:"10px",fontFamily:"'Public Sans',sans-serif"}}>
                  Ameen Islamic Institute • Shin, Nawa Kalay, Swat
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

export default FeeManagement;
