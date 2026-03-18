/* eslint-disable */
import { useState, useEffect } from "react";
import { db, collection, onSnapshot, query, orderBy, limit } from "../../firebase";
import letterhead from "../../assets/letterhead.png";

const SLIP_PRINT_STYLE = `
@media print {
  body * { visibility: hidden !important; }
  #salary-slip-print-area, #salary-slip-print-area * { visibility: visible !important; }
  #salary-slip-print-area {
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

function SalarySlips({teachers,addData}){
  const [slips,setSlips]=useState([]); const [show,setShow]=useState(false); const [selSlip,setSelSlip]=useState(null);
  const [printTarget,setPrintTarget]=useState(null);
  const [f,setF]=useState({teacherId:"",month:"",year:new Date().getFullYear(),basicSalary:0,houseRent:0,medicalAllowance:0,transport:0,bonus:0,deductions:0,tax:0});

  useEffect(()=>{ return onSnapshot(query(collection(db,"salary_slips"),orderBy("createdAt","desc"),limit(50)),s=>setSlips(s.docs.map(d=>({id:d.id,...d.data()}))));  },[]);

  const add=async()=>{
    if(!f.teacherId||!f.month)return;
    const gross=Number(f.basicSalary)+Number(f.houseRent)+Number(f.medicalAllowance)+Number(f.transport)+Number(f.bonus);
    const net=gross-Number(f.deductions)-Number(f.tax);
    await addData("salary_slips",{...f,gross,net,basicSalary:Number(f.basicSalary),houseRent:Number(f.houseRent),medicalAllowance:Number(f.medicalAllowance),transport:Number(f.transport),bonus:Number(f.bonus),deductions:Number(f.deductions),tax:Number(f.tax)});
    setShow(false); setF({teacherId:"",month:"",year:new Date().getFullYear(),basicSalary:0,houseRent:0,medicalAllowance:0,transport:0,bonus:0,deductions:0,tax:0});
  };

  const printSlip=(slip)=>{
    setPrintTarget(slip);
    if(!document.getElementById("salary-slip-print-style")){
      const s=document.createElement("style");s.id="salary-slip-print-style";s.innerHTML=SLIP_PRINT_STYLE;document.head.appendChild(s);
    }
    setTimeout(()=>window.print(),50);
  };

  const months=["جنوری","فروری","مارچ","اپریل","مئی","جون","جولائی","اگست","ستمبر","اکتوبر","نومبر","دسمبر"];
  const G2="#d4af37";const N3="#0f172a";const N4="#1e293b";
  const glass2={background:"rgba(255,255,255,0.07)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:"16px"};
  const inp2={width:"100%",padding:"10px 14px",borderRadius:"10px",border:"1px solid rgba(212,175,55,0.25)",background:"rgba(255,255,255,0.06)",color:"#f1f5f9",fontSize:"0.8rem",fontFamily:"'Public Sans',sans-serif",outline:"none",boxSizing:"border-box",direction:"rtl",colorScheme:"dark"};
  const lbl2={fontSize:"0.7rem",color:"rgba(212,175,55,0.8)",marginBottom:"6px",display:"block",fontWeight:"600"};

  // ── Print area — off-screen, rendered into by printTarget state ────────────
  const printArea=(
    <div id="salary-slip-print-area" style={{position:"absolute",left:"-9999px",top:0,width:"210mm"}}>
      {printTarget&&(()=>{
        const t=teachers.find(x=>x.id===printTarget.teacherId)||{};
        const gross=Number(printTarget.gross||0);
        const totalDed=Number(printTarget.deductions||0)+Number(printTarget.tax||0);
        const net=Number(printTarget.net||0);
        return (
          <div style={{background:"#fff",fontFamily:"'Noto Nastaliq Urdu','Amiri',serif",direction:"rtl",color:"#0f172a"}}>

            {/* Letterhead */}
            <img src={letterhead} alt="" style={{width:"100%",display:"block"}}/>

            {/* Title bar */}
            <div style={{textAlign:"center",padding:"16px 40px 12px",borderBottom:"2px solid #b7860b"}}>
              <div style={{fontSize:"1.2rem",fontWeight:"800",color:"#7a5807"}}>تنخواہ سلپ</div>
              <div style={{fontSize:"0.72rem",color:"#888",fontFamily:"'Public Sans',sans-serif",marginTop:"2px"}}>Salary Slip — {printTarget.month} {printTarget.year}</div>
            </div>

            <div style={{padding:"20px 48px"}}>

              {/* Teacher info rows */}
              <table style={{width:"100%",borderCollapse:"collapse",marginBottom:"18px",fontSize:"0.82rem"}}>
                <tbody>
                  {[
                    ["نام استاد / Teacher Name", t.name||"—",      false],
                    ["عہدہ / Designation",        t.subject||"استاد", false],
                    ["مہینہ / Month",              `${printTarget.month} ${printTarget.year}`, true],
                  ].map(([label,val,mono],i)=>(
                    <tr key={i} style={{background:i%2===0?"#fffdf8":"#fff"}}>
                      <td style={{padding:"9px 14px",fontWeight:"700",color:"#7a5807",width:"45%",borderBottom:"1px solid #f5e9c8",fontSize:"0.8rem"}}>{label}</td>
                      <td style={{padding:"9px 14px",color:"#1e293b",borderBottom:"1px solid #f5e9c8",fontFamily:mono?"'Courier New',monospace":"inherit",fontWeight:mono?"800":"500",fontSize:"0.82rem",direction:mono?"ltr":"rtl"}}>{val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Earnings + Deductions side by side */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px",marginBottom:"18px"}}>

                {/* Earnings */}
                <div style={{border:"1px solid #86efac",borderRadius:"8px",overflow:"hidden"}}>
                  <div style={{background:"#dcfce7",padding:"8px 14px",fontSize:"0.75rem",fontWeight:"800",color:"#166534"}}>آمدنی — Earnings</div>
                  <table style={{width:"100%",borderCollapse:"collapse",fontSize:"0.77rem"}}>
                    <tbody>
                      {[["بنیادی تنخواہ",printTarget.basicSalary],["مکان کرایہ",printTarget.houseRent],["طبی الاؤنس",printTarget.medicalAllowance],["ٹرانسپورٹ",printTarget.transport],["بونس",printTarget.bonus]]
                        .filter(([,v])=>Number(v)>0)
                        .map(([l,v],i)=>(
                          <tr key={i} style={{borderBottom:"1px solid #f0fdf4"}}>
                            <td style={{padding:"7px 12px",color:"#444"}}>{l}</td>
                            <td style={{padding:"7px 12px",textAlign:"left",direction:"ltr",fontWeight:"600",color:"#166534"}}>Rs. {Number(v).toLocaleString()}</td>
                          </tr>
                        ))}
                      <tr style={{background:"#dcfce7",borderTop:"2px solid #86efac"}}>
                        <td style={{padding:"8px 12px",fontWeight:"800",color:"#166534"}}>مجموعی</td>
                        <td style={{padding:"8px 12px",textAlign:"left",direction:"ltr",fontWeight:"800",color:"#166534"}}>Rs. {gross.toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Deductions */}
                <div style={{border:"1px solid #fca5a5",borderRadius:"8px",overflow:"hidden"}}>
                  <div style={{background:"#fee2e2",padding:"8px 14px",fontSize:"0.75rem",fontWeight:"800",color:"#991b1b"}}>کٹوتیاں — Deductions</div>
                  <table style={{width:"100%",borderCollapse:"collapse",fontSize:"0.77rem"}}>
                    <tbody>
                      {[["کٹوتیاں",printTarget.deductions],["ٹیکس",printTarget.tax]]
                        .filter(([,v])=>Number(v)>0)
                        .map(([l,v],i)=>(
                          <tr key={i} style={{borderBottom:"1px solid #fff1f2"}}>
                            <td style={{padding:"7px 12px",color:"#444"}}>{l}</td>
                            <td style={{padding:"7px 12px",textAlign:"left",direction:"ltr",fontWeight:"600",color:"#991b1b"}}>Rs. {Number(v).toLocaleString()}</td>
                          </tr>
                        ))}
                      <tr style={{background:"#fee2e2",borderTop:"2px solid #fca5a5"}}>
                        <td style={{padding:"8px 12px",fontWeight:"800",color:"#991b1b"}}>مجموعی</td>
                        <td style={{padding:"8px 12px",textAlign:"left",direction:"ltr",fontWeight:"800",color:"#991b1b"}}>Rs. {totalDed.toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Net salary highlight */}
              <div style={{background:"linear-gradient(135deg,#b7860b,#7a5807)",borderRadius:"10px",padding:"16px",textAlign:"center",marginBottom:"28px"}}>
                <div style={{fontSize:"0.65rem",color:"rgba(255,255,255,0.75)",marginBottom:"4px",fontFamily:"'Public Sans',sans-serif",fontWeight:"700"}}>خالص تنخواہ — Net Salary</div>
                <div style={{fontSize:"2rem",fontWeight:"900",color:"#fff"}}>Rs. {net.toLocaleString()}</div>
              </div>

              {/* Three signature lines */}
              <div style={{display:"flex",justifyContent:"space-between",marginTop:"36px"}}>
                {[["دستخط استاد","Teacher Signature"],["اکاؤنٹس","Accounts Officer"],["دستخط ناظم","Principal Signature"]].map(([ur,en])=>(
                  <div key={en} style={{textAlign:"center",minWidth:"130px"}}>
                    <div style={{height:"40px"}}/>
                    <div style={{borderTop:"1.5px solid #0f172a",paddingTop:"8px",fontSize:"0.72rem",color:"#333",fontWeight:"600"}}>
                      {ur}<br/>
                      <span style={{fontSize:"0.62rem",fontFamily:"'Public Sans',sans-serif",color:"#888"}}>{en}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div style={{marginTop:"28px",textAlign:"center",fontSize:"0.62rem",color:"#aaa",borderTop:"1px solid #f0ede8",paddingTop:"10px",fontFamily:"'Public Sans',sans-serif"}}>
                امین اسلامک انسٹی ٹیوٹ • شین، نواکلے، سوات &nbsp;|&nbsp; Ameen Islamic Institute • Shin, Nawa Kalay, Swat
              </div>

            </div>
          </div>
        );
      })()}
    </div>
  );

  // ── Detail view ────────────────────────────────────────────────────────────
  if(selSlip){ const t=teachers.find(x=>x.id===selSlip.teacherId)||{}; return (
    <div style={{minHeight:"100vh",background:`linear-gradient(160deg,${N3} 0%,#0d1f3c 50%,#0a1628 100%)`,padding:"24px 20px",fontFamily:"'Public Sans',sans-serif",direction:"rtl"}}>
      <div className="no-print" style={{display:"flex",gap:"10px",marginBottom:"24px",justifyContent:"space-between",alignItems:"center"}}>
        <button onClick={()=>setSelSlip(null)} style={{display:"flex",alignItems:"center",gap:"6px",padding:"10px 18px",borderRadius:"10px",border:"1px solid rgba(255,255,255,0.15)",background:"transparent",color:"rgba(241,245,249,0.7)",fontWeight:"600",fontSize:"0.82rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif"}}>
          <span className="material-symbols-rounded" style={{fontSize:"18px"}}>arrow_forward</span>واپس
        </button>
        <button onClick={()=>printSlip(selSlip)} style={{display:"flex",alignItems:"center",gap:"8px",padding:"10px 22px",borderRadius:"10px",border:`1px solid ${G2}`,background:"rgba(212,175,55,0.12)",color:G2,fontWeight:"700",fontSize:"0.82rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif"}}>
          <span className="material-symbols-rounded" style={{fontSize:"18px"}}>print</span>🖨️ تنخواہ سلپ پرنٹ
        </button>
      </div>
      <div style={{...glass2,maxWidth:"600px",margin:"0 auto",overflow:"hidden"}}>
        <div style={{background:`linear-gradient(135deg,${N3},#1e293b)`,padding:"28px 24px",textAlign:"center",borderBottom:"1px solid rgba(212,175,55,0.2)"}}>
          <div style={{fontSize:"1.3rem",fontWeight:"900",color:G2,marginBottom:"4px"}}>امین اسکول ہب</div>
          <div style={{fontSize:"0.65rem",color:"rgba(241,245,249,0.45)",marginBottom:"14px"}}>AMEEN ISLAMIC INSTITUTE • SWAT</div>
          <div style={{background:"rgba(212,175,55,0.1)",borderRadius:"10px",padding:"10px 16px",border:"1px solid rgba(212,175,55,0.2)"}}>
            <div style={{fontSize:"0.85rem",fontWeight:"700",color:G2}}>تنخواہ سلپ — {selSlip.month} {selSlip.year}</div>
          </div>
        </div>
        <div style={{padding:"24px"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px",marginBottom:"22px",background:"rgba(255,255,255,0.04)",borderRadius:"12px",padding:"14px",border:"1px solid rgba(255,255,255,0.08)"}}>
            {[["نام",t.name||"—"],["عہدہ",t.subject||"استاد"],["مہینہ",`${selSlip.month} ${selSlip.year}`]].map(([l,v])=>(
              <div key={l}><div style={{fontSize:"0.6rem",color:"rgba(241,245,249,0.4)",marginBottom:"3px"}}>{l}</div><div style={{fontSize:"0.8rem",fontWeight:"700",color:"#f1f5f9"}}>{v}</div></div>
            ))}
          </div>
          {[
            {title:"آمدنی",items:[["بنیادی",selSlip.basicSalary],["مکان کرایہ",selSlip.houseRent],["طبی",selSlip.medicalAllowance],["ٹرانسپورٹ",selSlip.transport],["بونس",selSlip.bonus]],color:"#4ade80",totalLabel:"مجموعی آمدنی",total:selSlip.gross},
            {title:"کٹوتیاں",items:[["کٹوتیاں",selSlip.deductions],["ٹیکس",selSlip.tax]],color:"#f87171",totalLabel:"مجموعی کٹوتی",total:Number(selSlip.deductions)+Number(selSlip.tax)},
          ].map(({title,items,color,totalLabel,total})=>(
            <div key={title} style={{marginBottom:"20px",background:"rgba(255,255,255,0.03)",borderRadius:"12px",padding:"14px",border:`1px solid ${color}20`}}>
              <div style={{fontSize:"0.78rem",fontWeight:"700",color,marginBottom:"12px"}}>{title}</div>
              {items.filter(([,v])=>Number(v)>0).map(([l,v])=>(
                <div key={l} style={{display:"flex",justifyContent:"space-between",marginBottom:"8px",fontSize:"0.72rem"}}>
                  <span style={{color:"rgba(241,245,249,0.55)"}}>{l}</span>
                  <span style={{fontWeight:"600",color:"#f1f5f9",direction:"ltr"}}>Rs. {Number(v).toLocaleString()}</span>
                </div>
              ))}
              <div style={{display:"flex",justifyContent:"space-between",marginTop:"10px",paddingTop:"10px",borderTop:`1px solid ${color}30`,fontSize:"0.78rem",fontWeight:"800",color}}>
                <span>{totalLabel}</span><span style={{direction:"ltr"}}>Rs. {Number(total).toLocaleString()}</span>
              </div>
            </div>
          ))}
          <div style={{background:`linear-gradient(135deg,${G2},#b8960a)`,borderRadius:"14px",padding:"18px",textAlign:"center"}}>
            <div style={{fontSize:"0.65rem",color:N3,fontWeight:"700",opacity:0.7,marginBottom:"4px"}}>خالص تنخواہ</div>
            <div style={{fontSize:"2.2rem",fontWeight:"900",color:N3}}>Rs. {Number(selSlip.net).toLocaleString()}</div>
          </div>
        </div>
      </div>
      {printArea}
    </div>
  ); }

  // ── List view ──────────────────────────────────────────────────────────────
  return (
    <div style={{minHeight:"100vh",background:`linear-gradient(160deg,${N3} 0%,#0d1f3c 50%,#0a1628 100%)`,padding:"24px 20px",fontFamily:"'Public Sans',sans-serif",direction:"rtl"}}>
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"28px",flexWrap:"wrap",gap:"12px"}}>
        <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
          <div style={{width:"44px",height:"44px",borderRadius:"12px",background:`linear-gradient(135deg,${G2},#b8960a)`,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 4px 20px rgba(212,175,55,0.4)`}}>
            <span className="material-symbols-rounded" style={{fontSize:"24px",color:N3}}>receipt_long</span>
          </div>
          <div>
            <h1 style={{margin:0,fontSize:"1.5rem",fontWeight:"800",color:"#f1f5f9"}}>تنخواہ سلپ</h1>
            <p style={{margin:0,fontSize:"0.75rem",color:"rgba(212,175,55,0.7)",fontWeight:"500"}}>Salary Slips • {slips.length} سلپ</p>
          </div>
        </div>
        <button onClick={()=>setShow(!show)} style={{display:"flex",alignItems:"center",gap:"8px",padding:"11px 22px",borderRadius:"12px",border:`1px solid ${G2}`,background:show?"rgba(212,175,55,0.15)":"transparent",color:G2,fontWeight:"700",fontSize:"0.85rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif"}}>
          <span className="material-symbols-rounded" style={{fontSize:"20px"}}>{show?"close":"add_circle"}</span>{show?"منسوخ":"نئی سلپ"}
        </button>
      </div>
      {/* Add Form */}
      {show&&(
        <div style={{...glass2,padding:"24px",marginBottom:"24px",borderColor:"rgba(212,175,55,0.3)"}}>
          <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"20px"}}>
            <span className="material-symbols-rounded" style={{color:G2,fontSize:"22px"}}>add_circle</span>
            <span style={{color:G2,fontWeight:"700",fontSize:"1rem"}}>نئی تنخواہ سلپ</span>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px",marginBottom:"16px"}}>
            <div><label style={lbl2}>استاد *</label><select style={inp2} value={f.teacherId} onChange={e=>setF({...f,teacherId:e.target.value})}><option value="" style={{background:N4}}>-- منتخب کریں --</option>{teachers.map(t=><option key={t.id} value={t.id} style={{background:N4}}>{t.name}</option>)}</select></div>
            <div><label style={lbl2}>مہینہ *</label><select style={inp2} value={f.month} onChange={e=>setF({...f,month:e.target.value})}><option value="" style={{background:N4}}>-- منتخب کریں --</option>{months.map(m=><option key={m} style={{background:N4}}>{m}</option>)}</select></div>
            {[["بنیادی تنخواہ","basicSalary"],["مکان کرایہ","houseRent"],["طبی الاؤنس","medicalAllowance"],["ٹرانسپورٹ","transport"],["بونس","bonus"],["کٹوتیاں","deductions"],["ٹیکس","tax"]].map(([l,k])=>(
              <div key={k}><label style={lbl2}>{l} (Rs)</label><input style={{...inp2,direction:"ltr"}} type="number" value={f[k]} onChange={e=>setF({...f,[k]:e.target.value})}/></div>
            ))}
            <div style={{background:"rgba(212,175,55,0.1)",borderRadius:"12px",padding:"14px",textAlign:"center",border:"1px solid rgba(212,175,55,0.2)"}}>
              <div style={{fontSize:"0.62rem",color:"rgba(212,175,55,0.7)",marginBottom:"6px"}}>خالص تنخواہ</div>
              <div style={{fontSize:"1.5rem",fontWeight:"900",color:G2}}>Rs. {(Number(f.basicSalary)+Number(f.houseRent)+Number(f.medicalAllowance)+Number(f.transport)+Number(f.bonus)-Number(f.deductions)-Number(f.tax)).toLocaleString()}</div>
            </div>
          </div>
          <div style={{display:"flex",gap:"10px",justifyContent:"flex-end"}}>
            <button onClick={()=>setShow(false)} style={{padding:"10px 20px",borderRadius:"10px",border:"1px solid rgba(255,255,255,0.15)",background:"transparent",color:"rgba(241,245,249,0.6)",fontWeight:"600",fontSize:"0.82rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif"}}>منسوخ</button>
            <button onClick={add} style={{display:"flex",alignItems:"center",gap:"8px",padding:"10px 24px",borderRadius:"10px",border:"none",background:`linear-gradient(135deg,${G2},#b8960a)`,color:N3,fontWeight:"700",fontSize:"0.82rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif"}}>
              <span className="material-symbols-rounded" style={{fontSize:"18px"}}>save</span>سلپ بنائیں
            </button>
          </div>
        </div>
      )}
      {/* Slip Cards */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:"16px"}}>
        {slips.map(sl=>{ const t=teachers.find(x=>x.id===sl.teacherId); return (
          <div key={sl.id} className="hv-card" style={{...glass2,padding:"20px",cursor:"pointer",borderTop:`3px solid ${G2}`}} onClick={()=>setSelSlip(sl)}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"14px"}}>
              <div>
                <div style={{fontSize:"0.92rem",fontWeight:"700",color:"#f1f5f9",marginBottom:"3px"}}>{t?.name||"—"}</div>
                <div style={{fontSize:"0.65rem",color:"rgba(212,175,55,0.6)"}}>{sl.month} {sl.year}</div>
              </div>
              <span className="material-symbols-rounded" style={{fontSize:"22px",color:G2}}>receipt_long</span>
            </div>
            <div style={{borderTop:"1px solid rgba(255,255,255,0.08)",paddingTop:"12px",marginBottom:"12px"}}>
              <div style={{fontSize:"0.65rem",color:"rgba(241,245,249,0.4)",marginBottom:"4px"}}>خالص تنخواہ</div>
              <div style={{fontSize:"1.4rem",fontWeight:"900",color:G2}}>Rs. {Number(sl.net).toLocaleString()}</div>
            </div>
            <div style={{display:"flex",gap:"8px"}}>
              <button onClick={e=>{e.stopPropagation();setSelSlip(sl);}} style={{flex:1,padding:"8px",borderRadius:"9px",border:"1px solid rgba(255,255,255,0.12)",background:"transparent",color:"rgba(241,245,249,0.6)",fontSize:"0.72rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:"5px"}}>
                <span className="material-symbols-rounded" style={{fontSize:"15px"}}>visibility</span>دیکھیں
              </button>
              <button onClick={e=>{e.stopPropagation();printSlip(sl);}} style={{flex:1,padding:"8px",borderRadius:"9px",border:`1px solid ${G2}40`,background:`rgba(212,175,55,0.1)`,color:G2,fontSize:"0.72rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif",fontWeight:"600",display:"flex",alignItems:"center",justifyContent:"center",gap:"5px"}}>
                <span className="material-symbols-rounded" style={{fontSize:"15px"}}>print</span>پرنٹ
              </button>
            </div>
          </div>
        ); })}
        {slips.length===0&&(
          <div style={{...glass2,padding:"60px 20px",textAlign:"center",gridColumn:"1/-1"}}>
            <span className="material-symbols-rounded" style={{fontSize:"48px",color:"rgba(212,175,55,0.3)",display:"block",marginBottom:"12px"}}>receipt_long</span>
            <div style={{color:"rgba(241,245,249,0.4)",fontSize:"0.9rem"}}>کوئی سلپ نہیں</div>
          </div>
        )}
      </div>
      {printArea}
    </div>
  );
}

export default SalarySlips;
