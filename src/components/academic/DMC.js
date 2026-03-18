/* eslint-disable */
import { useState, useEffect } from "react";
import { C, S, hBadge, pBar, HOUSES } from "../../constants";

function DMC({students,results,fees}){
  const [q,setQ]=useState("");
  const [selStudent,setSelStudent]=useState(null);
  const [term,setTerm]=useState("سالانہ امتحان 2026");

  const filtered=students.filter(s=>s.name?.includes(q)||s.studentCode?.includes(q));

  const printDMC=()=>{
    const el=document.getElementById("dmc-print-area");
    if(!el)return;
    const win=window.open("","_blank","width=900,height=1100");
    win.document.write(`<!DOCTYPE html><html dir="rtl" lang="ur"><head><meta charset="UTF-8"/><title>DMC — ${selStudent?.name||"Student"}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'Segoe UI',sans-serif;direction:rtl;background:white;color:#1e293b;padding:8mm 12mm;}
h1{text-align:center;color:#b7860b;font-size:20px;margin-bottom:4px;}
.sub{text-align:center;font-size:10px;color:#888;letter-spacing:0.2em;margin-bottom:10px;}
.title-box{text-align:center;border:2px solid #b7860b;display:inline-block;padding:4px 24px;border-radius:4px;margin:8px auto;display:block;width:fit-content;}
.title-box p{font-size:14px;font-weight:900;color:#1e293b;}
.info{display:grid;grid-template-columns:1fr 1fr;gap:5px 20px;padding:10px 14px;background:#fafaf8;border:1px solid #e9e4d8;border-radius:8px;margin:12px 0;}
.info-row{display:flex;gap:6px;font-size:12px;}
.lbl{color:#888;min-width:100px;}
.val{font-weight:700;}
.summary{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:12px 0;}
.sum-box{text-align:center;padding:10px 6px;border:2px solid #e9e4d8;border-radius:8px;}
.sum-big{font-size:20px;font-weight:900;color:#b7860b;}
.sum-lbl{font-size:10px;color:#888;margin-top:2px;}
table{width:100%;border-collapse:collapse;margin:12px 0;font-size:12px;}
thead tr{background:#1e293b;color:white;}
th{padding:8px 10px;text-align:right;font-weight:700;}
td{padding:7px 10px;text-align:right;border-bottom:1px solid #eee;}
tr:nth-child(even) td{background:#fafaf8;}
tfoot tr{background:#f5e9c8;font-weight:900;}
.remarks{background:#fafaf8;border:1px solid #e9e4d8;border-radius:8px;padding:10px 14px;margin:10px 0;font-size:12px;line-height:1.8;}
.sig{display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px;margin-top:28px;}
.sig-box{text-align:center;}
.sig-line{height:40px;border-bottom:2px solid #ccc;margin-bottom:5px;}
.sig-lbl{font-size:10px;color:#888;}
.footer{margin-top:14px;padding-top:8px;border-top:2px double #b7860b;text-align:center;font-size:9px;color:#bbb;letter-spacing:0.15em;}
.pass{color:#16a34a;font-weight:700;} .fail{color:#dc2626;font-weight:700;}
@media print{body{padding:5mm 8mm;}}
</style></head><body>
<h1>☪ AMEEN ISLAMIC INSTITUTE</h1>
<div class="sub">SWAT • KHYBER PAKHTUNKHWA • امین اسلامک انسٹیٹیوٹ</div>
<div class="title-box"><p>تفصیلی نمبرات سند / DETAIL MARKS CERTIFICATE</p></div>
<div style="text-align:center;font-size:12px;color:#666;margin-bottom:10px;">${term}</div>
<div class="info">
  <div class="info-row"><span class="lbl">نام / Name:</span><span class="val">${selStudent?.name||"—"}</span></div>
  <div class="info-row"><span class="lbl">والد / Father:</span><span class="val">${selStudent?.fatherName||"—"}</span></div>
  <div class="info-row"><span class="lbl">داخلہ نمبر / Adm:</span><span class="val">${selStudent?.studentCode||"—"}</span></div>
  <div class="info-row"><span class="lbl">جماعت / Class:</span><span class="val">${selStudent?.grade||"—"}</span></div>
  <div class="info-row"><span class="lbl">سیکشن / Section:</span><span class="val">${selStudent?.section||"—"}</span></div>
  <div class="info-row"><span class="lbl">تاریخ / Date:</span><span class="val">${new Date().toLocaleDateString("ur-PK")}</span></div>
</div>
${(()=>{
  const sR=results.filter(r=>r.studentId===selStudent?.id);
  const totO=sR.reduce((s,r)=>s+(r.obtained||0),0);
  const totM=sR.reduce((s,r)=>s+(r.total||100),0);
  const pct=totM>0?Math.round((totO/totM)*100):0;
  const grade=pct>=90?"A+":pct>=80?"A":pct>=70?"B":pct>=60?"C":pct>=50?"D":"F";
  const passed=pct>=40;
  const rows=sR.map((r,i)=>{
    const p=r.percentage||Math.round(((r.obtained||0)/(r.total||100))*100);
    return `<tr><td>${i+1}</td><td><strong>${r.subject}</strong></td><td>${r.total||100}</td><td style="color:${p>=40?"#1e293b":"#dc2626"};font-weight:700">${r.obtained||0}</td><td style="color:${p>=70?"#16a34a":p>=50?"#d97706":"#dc2626"};font-weight:700">${p}%</td><td>${r.grade||"—"}</td><td class="${p>=40?"pass":"fail"}">${p>=40?"✅ پاس":"❌ فیل"}</td></tr>`;
  }).join("");
  const remarks=pct>=80?"ماشاءاللہ! طالب علم نے نہایت اعلیٰ کارکردگی کا مظاہرہ کیا۔ Excellent performance!":pct>=60?"طالب علم کی کارکردگی اطمینان بخش ہے۔ Satisfactory performance.":pct>=40?"طالب علم کو مزید محنت کی ضرورت ہے۔ Needs more effort.":"طالب علم فیل ہے۔ فوری توجہ ضروری ہے۔ Failed — immediate attention required.";
  return `<div class="summary">
    <div class="sum-box"><div class="sum-big" style="color:${pct>=50?"#16a34a":"#dc2626"}">${grade}</div><div class="sum-lbl">مجموعی گریڈ</div></div>
    <div class="sum-box"><div class="sum-big" style="color:${pct>=50?"#16a34a":"#dc2626"}">${pct}%</div><div class="sum-lbl">فیصد</div></div>
    <div class="sum-box"><div class="sum-big">${totO}/${totM}</div><div class="sum-lbl">نمبر</div></div>
    <div class="sum-box"><div class="sum-big" style="color:${passed?"#16a34a":"#dc2626"}">${passed?"پاس":"فیل"}</div><div class="sum-lbl">نتیجہ</div></div>
  </div>
  <table><thead><tr><th>#</th><th>مضمون</th><th>کل</th><th>حاصل</th><th>فیصد</th><th>گریڈ</th><th>نتیجہ</th></tr></thead>
  <tbody>${rows||"<tr><td colspan='7' style='text-align:center;color:#bbb;padding:20px'>کوئی نتیجہ درج نہیں</td></tr>"}</tbody>
  <tfoot><tr><td colspan="2">مجموعہ / Total</td><td>${totM}</td><td>${totO}</td><td>${pct}%</td><td>${grade}</td><td class="${passed?"pass":"fail"}">${passed?"✅ پاس":"❌ فیل"}</td></tr></tfoot></table>
  <div class="remarks">📝 ریمارکس: ${remarks}</div>`;
})()}
<div class="sig">
  <div class="sig-box"><div class="sig-line"></div><div class="sig-lbl">کلاس ٹیچر / Class Teacher</div></div>
  <div class="sig-box"><div class="sig-line"></div><div class="sig-lbl">پرنسپل / Principal</div></div>
  <div class="sig-box"><div class="sig-line"></div><div class="sig-lbl">والدین / Parents</div></div>
</div>
<div class="footer">AMEEN ISLAMIC INSTITUTE • SWAT • یہ سند مہر و دستخط کے بغیر معتبر نہیں</div>
<script>window.onload=function(){window.print();setTimeout(function(){window.close();},2000);};<\/script>
</body></html>`);
    win.document.close();
  };

  if(selStudent){
    const h=HOUSES.find(x=>x.id===selStudent.houseId)||{};
    const sResults=results.filter(r=>r.studentId===selStudent.id);
    const sFees=fees.filter(f=>f.studentId===selStudent.id);
    const pendingFees=sFees.filter(f=>f.status==="pending").reduce((s,f)=>s+(f.amount||0),0);
    const totalObtained=sResults.reduce((s,r)=>s+(r.obtained||0),0);
    const totalMarks=sResults.reduce((s,r)=>s+(r.total||100),0);
    const avgPct=totalMarks>0?Math.round((totalObtained/totalMarks)*100):0;
    const overallGrade=avgPct>=90?"A+":avgPct>=80?"A":avgPct>=70?"B":avgPct>=60?"C":avgPct>=50?"D":"F";
    const passed=avgPct>=40;
    const gradeColor=overallGrade==="A+"||overallGrade==="A"?C.green:overallGrade==="B"?C.abuBakr:overallGrade==="C"||overallGrade==="D"?C.amber:C.red;
    return <div style={S.page}>
      <div style={{display:"flex",gap:"10px",marginBottom:"20px",flexWrap:"wrap"}}>
        <button style={{...S.addBtn,background:"#eee",color:C.navy,boxShadow:"none"}} onClick={()=>setSelStudent(null)}>← واپس</button>
        <button style={{...S.saveBtn,fontSize:"0.65rem"}} onClick={printDMC}>🖨️ DMC پرنٹ / ڈاؤن لوڈ</button>
      </div>
      <div id="dmc-print-area" style={{background:C.white,borderRadius:"20px",overflow:"hidden",boxShadow:"0 8px 32px rgba(0,0,0,0.12)",maxWidth:"820px",margin:"0 auto",padding:"24px 28px",border:`3px solid ${C.gold}40`}}>
        <div style={{textAlign:"center",borderBottom:`3px double ${C.gold}`,paddingBottom:"14px",marginBottom:"16px"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:"16px",marginBottom:"8px"}}>
            <div style={{width:"50px",height:"50px",borderRadius:"50%",background:`conic-gradient(${C.gold},#e4b030,${C.gold})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.3rem"}}>☪</div>
            <div>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:"1.1rem",fontWeight:"900",color:C.gold}}>AMEEN ISLAMIC INSTITUTE</div>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:"0.55rem",color:"#888",letterSpacing:"0.2em"}}>SWAT • KPK • PAKISTAN</div>
              <div style={{fontSize:"0.75rem",fontWeight:"700",color:C.navy,marginTop:"2px"}}>امین اسلامک انسٹیٹیوٹ</div>
            </div>
            <div style={{width:"50px",height:"50px",borderRadius:"50%",background:h.gradient||`linear-gradient(135deg,${C.gold},${C.goldDark})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.4rem"}}>{h.emoji||"🏫"}</div>
          </div>
          <div style={{display:"inline-block",border:`2px solid ${C.gold}`,padding:"4px 24px",borderRadius:"4px"}}>
            <div style={{fontSize:"0.82rem",fontWeight:"900",color:C.navy}}>تفصیلی نمبرات سند / DETAIL MARKS CERTIFICATE</div>
          </div>
          <div style={{fontSize:"0.62rem",color:"#666",marginTop:"6px"}}>{term}</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"6px 24px",padding:"12px 16px",background:"#fafaf8",borderRadius:"10px",border:`1px solid ${C.goldLight}`,marginBottom:"16px"}}>
          {[["نام / Name",selStudent.name],["والد / Father",selStudent.fatherName||"—"],["داخلہ نمبر",selStudent.studentCode||"—"],["جماعت / Class",selStudent.grade||"—"],["سیکشن",selStudent.section||"—"],["ہاؤس",`${h.emoji||""} ${h.nameEn||"—"}`]].map(([l,v])=>(
            <div key={l} style={{display:"flex",gap:"6px",alignItems:"baseline"}}>
              <span style={{fontSize:"0.6rem",color:"#888",minWidth:"100px",flexShrink:0}}>{l}:</span>
              <span style={{fontSize:"0.7rem",fontWeight:"700",color:C.navy}}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"10px",marginBottom:"16px"}}>
          {[{icon:"🏆",label:"گریڈ",val:overallGrade,color:gradeColor},{icon:"📊",label:"فیصد",val:`${avgPct}%`,color:avgPct>=50?C.green:C.red},{icon:"📝",label:"نمبر",val:`${totalObtained}/${totalMarks}`,color:C.navy},{icon:passed?"✅":"❌",label:"نتیجہ",val:passed?"پاس":"فیل",color:passed?C.green:C.red}].map((item,i)=>(
            <div key={i} style={{textAlign:"center",padding:"12px 8px",border:`2px solid ${item.color}20`,borderRadius:"10px",background:`${item.color}08`}}>
              <div style={{fontSize:"1.1rem",marginBottom:"4px"}}>{item.icon}</div>
              <div style={{fontSize:"1.3rem",fontWeight:"900",color:item.color,lineHeight:1}}>{item.val}</div>
              <div style={{fontSize:"0.58rem",color:"#888",marginTop:"3px"}}>{item.label}</div>
            </div>
          ))}
        </div>
        <div style={{fontSize:"0.75rem",fontWeight:"800",color:C.navy,marginBottom:"10px"}}>📋 تفصیلی نمبرات / Subject-wise Marks</div>
        <table style={{width:"100%",borderCollapse:"collapse",marginBottom:"16px",fontSize:"0.67rem"}}>
          <thead><tr style={{background:`linear-gradient(135deg,${C.navy},${C.navyMid})`,color:C.white}}>{["#","مضمون","کل","حاصل","فیصد","گریڈ","نتیجہ"].map(h=><th key={h} style={{padding:"8px 10px",textAlign:"right",fontWeight:"700"}}>{h}</th>)}</tr></thead>
          <tbody>{sResults.map((r,i)=>{const p=r.percentage||Math.round(((r.obtained||0)/(r.total||100))*100);return <tr key={r.id} style={{background:i%2===0?"#fafaf8":C.white}}>
            <td style={{...S.td,color:"#aaa"}}>{i+1}</td>
            <td style={{...S.td,fontWeight:"700"}}>{r.subject}</td>
            <td style={S.td}>{r.total||100}</td>
            <td style={{...S.td,fontWeight:"800",color:p>=40?C.navy:C.red}}>{r.obtained||0}</td>
            <td style={S.td}><span style={{fontWeight:"700",color:p>=70?C.green:p>=50?C.amber:C.red}}>{p}%</span></td>
            <td style={S.td}><span style={{padding:"2px 8px",borderRadius:"20px",fontSize:"0.6rem",fontWeight:"800",background:r.grade==="A+"||r.grade==="A"?"#dcfce7":r.grade==="B"?"#dbeafe":"#fef3c7",color:r.grade==="A+"||r.grade==="A"?C.green:r.grade==="B"?C.abuBakr:C.amber}}>{r.grade||"—"}</span></td>
            <td style={S.td}><span style={{fontWeight:"700",color:p>=40?C.green:C.red,fontSize:"0.62rem"}}>{p>=40?"✅ پاس":"❌ فیل"}</span></td>
          </tr>;})}
          {sResults.length===0&&<tr><td colSpan={7} style={{...S.td,textAlign:"center",color:"#bbb",padding:"30px"}}>کوئی نتیجہ درج نہیں</td></tr>}
          </tbody>
          {sResults.length>0&&<tfoot><tr style={{background:C.goldLight}}>
            <td colSpan={2} style={{...S.td,fontWeight:"900",color:C.navy}}>مجموعہ / Total</td>
            <td style={{...S.td,fontWeight:"900"}}>{totalMarks}</td>
            <td style={{...S.td,fontWeight:"900"}}>{totalObtained}</td>
            <td style={S.td}><span style={{fontWeight:"900",color:avgPct>=50?C.green:C.red}}>{avgPct}%</span></td>
            <td style={S.td}><span style={{padding:"3px 10px",borderRadius:"20px",fontSize:"0.68rem",fontWeight:"900",background:`linear-gradient(135deg,${C.gold},${C.goldDark})`,color:C.white}}>{overallGrade}</span></td>
            <td style={S.td}><span style={{fontWeight:"900",color:passed?C.green:C.red}}>{passed?"✅ پاس":"❌ فیل"}</span></td>
          </tr></tfoot>}
        </table>
        {pendingFees>0&&<div style={{background:"#fff7ed",border:`2px solid ${C.amber}30`,borderRadius:"10px",padding:"10px 14px",marginBottom:"14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:"0.68rem",color:C.amber,fontWeight:"700"}}>⚠️ فیس باقی ہے</span>
          <span style={{fontSize:"0.72rem",fontWeight:"900",color:C.red}}>Rs. {pendingFees.toLocaleString()}</span>
        </div>}
        <div style={{background:`linear-gradient(135deg,${C.goldLight},#fdf8ee)`,borderRadius:"10px",padding:"12px 16px",marginBottom:"20px",border:`1px solid ${C.gold}30`}}>
          <div style={{fontSize:"0.65rem",fontWeight:"800",color:C.navy,marginBottom:"4px"}}>📝 ریمارکس</div>
          <div style={{fontSize:"0.63rem",color:C.navy,lineHeight:"1.9"}}>{avgPct>=80?"ماشاءاللہ! طالب علم نے نہایت اعلیٰ کارکردگی کا مظاہرہ کیا۔ Excellent!":avgPct>=60?"طالب علم کی کارکردگی اطمینان بخش ہے۔ Satisfactory.":avgPct>=40?"طالب علم کو مزید محنت کی ضرورت ہے۔ Needs improvement.":"طالب علم فیل ہے۔ فوری توجہ ضروری ہے۔ Failed."}</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"24px",paddingTop:"16px"}}>
          {["کلاس ٹیچر\nClass Teacher","پرنسپل\nPrincipal","والدین\nParents"].map(r=>(
            <div key={r} style={{textAlign:"center"}}><div style={{height:"44px",borderBottom:`2px solid #ccc`,marginBottom:"6px"}}/><div style={{fontSize:"0.58rem",color:"#888",whiteSpace:"pre-line",lineHeight:"1.6"}}>{r}</div></div>
          ))}
        </div>
        <div style={{marginTop:"16px",paddingTop:"10px",borderTop:`2px double ${C.gold}`,textAlign:"center"}}>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:"0.55rem",color:"#bbb",letterSpacing:"0.15em"}}>AMEEN ISLAMIC INSTITUTE • SWAT • یہ سند مہر و دستخط کے بغیر معتبر نہیں</div>
        </div>
      </div>
    </div>;
  }

  return <div style={S.page}>
    <div style={{fontSize:"1.1rem",fontWeight:"700",color:C.navy,marginBottom:"4px"}}>🎓 تفصیلی نمبرات سند (DMC)</div>
    <div style={{fontSize:"0.62rem",color:"#888",marginBottom:"16px"}}>Detail Marks Certificate — طالب علم منتخب کریں</div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px",marginBottom:"20px"}}>
      <input style={{...S.inpSm,fontSize:"0.8rem",padding:"14px 18px"}} placeholder="🔍 نام یا داخلہ نمبر..." value={q} onChange={e=>setQ(e.target.value)}/>
      <input style={{...S.inpSm,direction:"ltr"}} value={term} onChange={e=>setTerm(e.target.value)} placeholder="Exam Term..."/>
    </div>
    {q&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:"14px"}}>
      {filtered.map(s=>{const h=HOUSES.find(x=>x.id===s.houseId)||{};const sRes=results.filter(r=>r.studentId===s.id);const tot=sRes.reduce((x,r)=>x+(r.obtained||0),0);const max=sRes.reduce((x,r)=>x+(r.total||100),0);const pct=max>0?Math.round((tot/max)*100):0;const grade=pct>=90?"A+":pct>=80?"A":pct>=70?"B":pct>=60?"C":pct>=50?"D":sRes.length>0?"F":"—";return(
        <div key={s.id} onClick={()=>setSelStudent(s)} className="hv-card" style={{...S.card,cursor:"pointer",borderRight:`4px solid ${h.color||C.gold}`}}>
          <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
            <div style={{width:"50px",height:"50px",borderRadius:"50%",background:h.gradient||`linear-gradient(135deg,${C.gold},${C.goldDark})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.3rem",flexShrink:0}}>{h.emoji||"🎓"}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:"0.85rem",fontWeight:"700",color:C.navy}}>{s.name}</div>
              <div style={{fontSize:"0.62rem",color:"#888"}}>{s.grade} • {s.studentCode}</div>
              <div style={{display:"flex",gap:"8px",marginTop:"4px"}}>
                {sRes.length>0&&<span style={{fontSize:"0.62rem",fontWeight:"700",color:pct>=50?C.green:C.red}}>{pct}%</span>}
                {grade!=="—"&&<span style={{padding:"2px 8px",borderRadius:"10px",fontSize:"0.6rem",fontWeight:"800",background:grade==="A+"||grade==="A"?"#dcfce7":"#fef3c7",color:grade==="A+"||grade==="A"?C.green:C.amber}}>{grade}</span>}
              </div>
            </div>
            <span style={{fontSize:"0.7rem",color:"#ccc"}}>←</span>
          </div>
        </div>
      );})}
      {filtered.length===0&&<div className="hv-card" style={{...S.card,textAlign:"center",color:"#bbb",padding:"40px",gridColumn:"1/-1"}}><div style={{fontSize:"2rem",marginBottom:"8px"}}>🔍</div>کوئی طالب علم نہیں ملا</div>}
    </div>}
    {!q&&<div className="hv-card" style={{...S.card,textAlign:"center",padding:"60px"}}>
      <div style={{fontSize:"3rem",marginBottom:"12px"}}>🎓</div>
      <div style={{fontSize:"0.85rem",fontWeight:"700",color:C.navy}}>تفصیلی نمبرات سند / DMC</div>
      <div style={{fontSize:"0.62rem",color:"#888",marginTop:"8px",lineHeight:"1.8"}}>Detail Marks Certificate<br/>اوپر طالب علم کا نام لکھیں</div>
    </div>}
  </div>;
}

export default DMC;
