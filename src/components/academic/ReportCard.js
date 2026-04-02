/* eslint-disable */
import { useState, useEffect } from "react";
import { C, S, hBadge, pBar, HOUSES, sLabel } from "../../constants";

function ReportCard({students,results,fees,addData}){
  const [selStudent,setSelStudent]=useState(null); const [q,setQ]=useState(""); const [term,setTerm]=useState("Annual 2026");
  const filtered=students.filter(s=>s.name?.includes(q)||s.studentCode?.includes(q));
  if(selStudent){
    const h=HOUSES.find(x=>x.id===selStudent.houseId)||{};
    const sResults=results.filter(r=>r.studentId===selStudent.id);
    const sFees=fees.filter(f=>f.studentId===selStudent.id);
    const paidFees=sFees.filter(f=>f.status==="paid").reduce((s,f)=>s+(f.amount||0),0);
    const pendingFees=sFees.filter(f=>f.status==="pending").reduce((s,f)=>s+(f.amount||0),0);
    const avgPct=sResults.length>0?Math.round(sResults.reduce((s,r)=>s+(r.percentage||0),0)/sResults.length):0;
    const overallGrade=avgPct>=90?"A+":avgPct>=80?"A":avgPct>=70?"B":avgPct>=60?"C":avgPct>=50?"D":"F";
    const totalObtained=sResults.reduce((s,r)=>s+(r.obtained||0),0);
    const totalMarks=sResults.reduce((s,r)=>s+(r.total||100),0);
    return <div style={S.page}>
      <div style={{display:"flex",gap:"10px",marginBottom:"20px",flexWrap:"wrap"}}>
        <button style={{...S.addBtn,background:"#eee",color:C.navy,boxShadow:"none"}} onClick={()=>setSelStudent(null)}>← Back</button>
        <button style={{...S.saveBtn,fontSize:"0.65rem"}} onClick={()=>window.print()}>🖨️ Print / PDF</button>
      </div>
      <div style={{background:C.white,borderRadius:"22px",overflow:"hidden",boxShadow:"0 8px 32px rgba(0,0,0,0.12)",maxWidth:"800px",margin:"0 auto"}}>
        <div style={{background:`linear-gradient(160deg,#0a1628 0%,#0f2044 50%,#0a1628 100%)`,padding:"32px 24px",color:C.white,textAlign:"center",position:"relative",overflow:"hidden"}}>
          {/* decorative circles */}
          <div style={{position:"absolute",top:"-40px",right:"-40px",width:"180px",height:"180px",borderRadius:"50%",background:"rgba(212,175,55,0.06)",pointerEvents:"none"}}/>
          <div style={{position:"absolute",bottom:"-30px",left:"-30px",width:"140px",height:"140px",borderRadius:"50%",background:"rgba(212,175,55,0.04)",pointerEvents:"none"}}/>
          {/* emblem */}
          <div style={{width:"64px",height:"64px",borderRadius:"50%",background:`linear-gradient(135deg,${C.gold},#b8960a)`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px",fontSize:"1.8rem",boxShadow:`0 0 0 6px rgba(212,175,55,0.15),0 8px 24px rgba(0,0,0,0.4)`}}>
            ☪
          </div>
          <div style={{fontFamily:"'Cinzel Decorative','Cinzel',serif",fontSize:"1.4rem",fontWeight:"900",color:C.gold,letterSpacing:"0.06em",marginBottom:"4px",textShadow:"0 2px 12px rgba(212,175,55,0.4)"}}>
            AMEEN SCHOOL HUB
          </div>
          <div style={{fontSize:"0.62rem",letterSpacing:"0.22em",color:"rgba(255,255,255,0.45)",marginBottom:"20px",fontFamily:"'Public Sans',sans-serif"}}>
            AMEEN ISLAMIC INSTITUTE &nbsp;•&nbsp; SWAT, KPK
          </div>
          <div style={{display:"inline-flex",alignItems:"center",gap:"8px",background:"rgba(212,175,55,0.12)",border:"1px solid rgba(212,175,55,0.3)",borderRadius:"30px",padding:"8px 20px"}}>
            <span style={{fontSize:"0.78rem",fontWeight:"800",color:C.gold,letterSpacing:"0.04em"}}>📋 Report Card — {term}</span>
          </div>
        </div>
        <div style={{padding:"20px 24px",borderBottom:`2px solid ${C.goldLight}`,display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px"}}>
          {[["نام",selStudent.name],["والد کا نام",selStudent.fatherName||"—"],["داخلہ نمبر",selStudent.studentCode||"—"],["جماعت",selStudent.grade||"—"],["گھر",`${h.emoji||""} ${h.nameEn||"—"}`],["سیکشن",selStudent.section||"A"]].map(([l,v])=><div key={l} style={{display:"flex",gap:"8px",alignItems:"center"}}><span style={{fontSize:"0.62rem",color:"#888",minWidth:"80px"}}>{l}:</span><span style={{fontSize:"0.72rem",fontWeight:"700",color:C.navy}}>{v}</span></div>)}
        </div>
        <div style={{padding:"20px 24px"}}>
          <div style={{fontSize:"0.82rem",fontWeight:"700",color:C.navy,marginBottom:"14px",borderBottom:`2px solid ${C.goldLight}`,paddingBottom:"8px",fontFamily:"'Noto Nastaliq Urdu',serif"}}>📊 نتائج</div>
          <table style={{width:"100%",borderCollapse:"collapse",marginBottom:"20px"}}>
            <thead><tr style={{background:`linear-gradient(135deg,${C.navy},${C.navyMid})`,color:C.white}}>{["مضمون","کل","حاصل کردہ","فیصد","گریڈ"].map(h=><th key={h} style={{padding:"10px 12px",fontSize:"0.65rem",textAlign:"left",fontWeight:"700"}}>{h}</th>)}</tr></thead>
            <tbody>{sResults.map((r,i)=><tr key={r.id} style={{background:i%2===0?"#fafaf8":C.white}}>
              <td style={{...S.td,fontWeight:"600"}}>{r.subject}</td><td style={S.td}>{r.total||100}</td>
              <td style={{...S.td,fontWeight:"700",color:r.percentage>=50?C.navy:C.red}}>{r.obtained||0}</td>
              <td style={S.td}><div style={{display:"flex",alignItems:"center",gap:"6px"}}><div style={{flex:1}}>{pBar(r.percentage||0,100,r.percentage>=70?C.green:r.percentage>=50?C.amber:C.red)}</div><span style={{fontSize:"0.6rem",fontWeight:"700",color:r.percentage>=70?C.green:r.percentage>=50?C.amber:C.red}}>{r.percentage}%</span></div></td>
              <td style={S.td}><span style={{padding:"3px 10px",borderRadius:"20px",fontSize:"0.65rem",fontWeight:"800",background:r.grade==="A+"||r.grade==="A"?"#dcfce7":r.grade==="B"?"#dbeafe":"#fef3c7",color:r.grade==="A+"||r.grade==="A"?C.green:r.grade==="B"?C.abuBakr:C.amber}}>{r.grade||"—"}</span></td>
            </tr>)}{sResults.length===0&&<tr><td colSpan={5} style={{...S.td,textAlign:"center",color:"#bbb",padding:"30px"}}><span className="ur">کوئی نتائج نہیں</span></td></tr>}</tbody>
            {sResults.length>0&&<tfoot><tr style={{background:C.goldLight}}><td style={{...S.td,fontWeight:"800",color:C.navy}}>کل</td><td style={{...S.td,fontWeight:"800"}}>{totalMarks}</td><td style={{...S.td,fontWeight:"800"}}>{totalObtained}</td><td style={S.td}><span style={{fontWeight:"800",color:avgPct>=70?C.green:avgPct>=50?C.amber:C.red}}>{avgPct}%</span></td><td style={S.td}><span style={{padding:"4px 12px",borderRadius:"20px",fontSize:"0.72rem",fontWeight:"900",background:`linear-gradient(135deg,${C.gold},${C.goldDark})`,color:C.white}}>{overallGrade}</span></td></tr></tfoot>}
          </table>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px",marginBottom:"20px"}}>
            <div style={{background:"#fafaf8",borderRadius:"12px",padding:"14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><div style={{fontSize:"0.72rem",fontWeight:"700",color:C.navy,marginBottom:"4px",fontFamily:"'Noto Nastaliq Urdu',serif"}}>💰 فیس</div><div style={{fontSize:"0.62rem",color:"#888",fontFamily:"'Noto Nastaliq Urdu',serif"}}>ادا: Rs. {paidFees.toLocaleString()}</div></div><span style={{...hBadge(pendingFees>0?C.red:C.green,pendingFees>0?"#fee2e2":"#dcfce7"),fontSize:"0.62rem",fontFamily:"'Noto Nastaliq Urdu',serif"}}>{pendingFees>0?`⚠️ Rs.${pendingFees.toLocaleString()} باقی`:"✅ صاف"}</span></div>
            <div style={{background:"#fafaf8",borderRadius:"12px",padding:"14px",textAlign:"center"}}><div style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",fontFamily:"'Noto Nastaliq Urdu',serif"}}>مجموعی گریڈ</div><div style={{fontSize:"2rem",fontWeight:"900",color:C.gold}}>{overallGrade}</div></div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"20px",marginTop:"30px"}}>{["کلاس ٹیچر","پرنسپل","والدین"].map(r=><div key={r} style={{textAlign:"center"}}><div style={{borderTop:`2px solid #ddd`,paddingTop:"8px",fontSize:"0.6rem",color:"#888",fontFamily:"'Noto Nastaliq Urdu',serif"}}>{r} دستخط</div></div>)}</div>
        </div>
      </div>
    </div>;
  }
  return <div style={S.page}>
    <div style={{fontSize:"1.1rem",fontWeight:"700",color:C.navy,marginBottom:"6px"}}>📋 Report Card</div>
    <div style={{fontSize:"0.62rem",color:"#888",marginBottom:"16px"}}>Student Search</div>
    <div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:"10px",marginBottom:"20px"}}><input style={{...S.inpSm,fontSize:"0.8rem",padding:"14px 18px"}} placeholder="🔍 Search by name or code..." value={q} onChange={e=>setQ(e.target.value)}/><input style={{...S.inpSm,direction:"ltr",minWidth:"140px"}} value={term} onChange={e=>setTerm(e.target.value)} placeholder="Term..."/></div>
    {q&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:"14px"}}>
      {filtered.map(s=>{ const h=HOUSES.find(x=>x.id===s.houseId)||{}; const sRes=results.filter(r=>r.studentId===s.id); const avg=sRes.length>0?Math.round(sRes.reduce((sum,r)=>sum+(r.percentage||0),0)/sRes.length):0; return <div key={s.id} onClick={()=>setSelStudent(s)} className="hv-card" style={{...S.card,cursor:"pointer",borderRight:`4px solid ${h.color||C.gold}`}}>
        <div style={{display:"flex",alignItems:"center",gap:"12px"}}><div style={{width:"48px",height:"48px",borderRadius:"50%",background:h.gradient||`linear-gradient(135deg,${C.gold},${C.goldDark})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.4rem"}}>{h.emoji||"🎓"}</div><div><div style={{fontSize:"0.85rem",fontWeight:"700",color:C.navy}}>{s.name}</div><div style={{fontSize:"0.62rem",color:"#888"}}>{s.grade} • {h.nameEn||"—"}</div>{sRes.length>0&&<div style={{fontSize:"0.65rem",fontWeight:"700",color:avg>=70?C.green:avg>=50?C.amber:C.red}}>Average: {avg}%</div>}</div></div>
      </div>; })}
      {filtered.length===0&&<div className="hv-card" style={{...S.card,textAlign:"center",color:"#bbb",padding:"40px",gridColumn:"1/-1"}} className="ur">کوئی نتائج نہیں</div>}
    </div>}
    {!q&&<div className="hv-card" style={{...S.card,textAlign:"center",padding:"60px"}}><div style={{fontSize:"3rem",marginBottom:"12px"}}>📋</div><div style={{fontSize:"0.85rem",fontWeight:"700",color:C.navy,fontFamily:"'Noto Nastaliq Urdu',serif"}}>رپورٹ کارڈ</div><div style={{fontSize:"0.65rem",color:"#888",marginTop:"8px",fontFamily:"'Noto Nastaliq Urdu',serif"}}>اوپر طالب علم کا نام تلاش کریں</div></div>}
  </div>;
}

export default ReportCard;
