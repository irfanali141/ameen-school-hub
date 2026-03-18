/* eslint-disable */
const fs = require('fs');
const path = 'e:/app pic/AII Main Project/ameen-school-hub/src/App.js';
let content = fs.readFileSync(path, 'utf8');
let n = 0;
function rep(o, r) { if (content.includes(o)) { content = content.split(o).join(r); n++; return true; } console.log('NOT FOUND:', o.slice(0,100)); return false; }

const N = '"#0f172a"';
const N2 = '"#1e293b"';
const GLASS = `{background:"rgba(255,255,255,0.07)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:"16px"}`;
const DARK_WRAP = `{minHeight:"100vh",background:"linear-gradient(160deg,#0f172a 0%,#0d1f3c 50%,#0a1628 100%)",padding:"24px 20px",fontFamily:"'Public Sans',sans-serif",direction:"rtl"}`;
const THEME_VARS = `
  const G="#d4af37"; const N="#0f172a"; const N2="#1e293b";
  const glass=${GLASS};
  const inp={width:"100%",padding:"10px 14px",borderRadius:"10px",border:"1px solid rgba(212,175,55,0.25)",background:"rgba(255,255,255,0.06)",color:"#f1f5f9",fontSize:"0.8rem",fontFamily:"'Public Sans',sans-serif",outline:"none",boxSizing:"border-box",direction:"rtl",colorScheme:"dark"};
  const lbl={fontSize:"0.7rem",color:"rgba(212,175,55,0.8)",marginBottom:"6px",display:"block",fontWeight:"600"};`;
const SAVE_BTN = `{background:"linear-gradient(135deg,#d4af37,#b8960a)",color:N,border:"none",borderRadius:"12px",padding:"11px 26px",fontSize:"0.82rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif",fontWeight:"700"}`;

// ===================== STAFF PERFORMANCE =====================
rep(
  `  return <div style={S.page}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
      <div><div style={{fontSize:"1.1rem",fontWeight:"700",color:C.navy}}>📊 اسٹاف کارکردگی</div><div style={{fontSize:"0.62rem",color:"#888",marginTop:"2px"}}>ماہانہ جائزہ و تشخیص</div></div>
      <button style={S.addBtn} onClick={()=>setShow(!show)}>+ نیا جائزہ</button>
    </div>`,
  `${THEME_VARS}
  return <div style=${DARK_WRAP}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"24px",flexWrap:"wrap",gap:"12px"}}>
      <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
        <div style={{width:"44px",height:"44px",borderRadius:"12px",background:"linear-gradient(135deg,#d4af37,#b8960a)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 20px rgba(212,175,55,0.4)"}}><span className="material-symbols-rounded" style={{fontSize:"24px",color:N}}>analytics</span></div>
        <div><h2 style={{margin:0,fontSize:"1.4rem",fontWeight:"800",color:"#f1f5f9"}}>اسٹاف کارکردگی</h2><p style={{margin:0,fontSize:"0.72rem",color:"rgba(212,175,55,0.7)"}}>ماہانہ جائزہ و تشخیص</p></div>
      </div>
      <button style={{display:"flex",alignItems:"center",gap:"8px",padding:"10px 20px",borderRadius:"12px",border:"1px solid #d4af37",background:show?"rgba(212,175,55,0.15)":"transparent",color:"#d4af37",fontWeight:"700",fontSize:"0.82rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif"}} onClick={()=>setShow(!show)}><span className="material-symbols-rounded" style={{fontSize:"18px"}}>{show?"close":"add_circle"}</span>{show?"منسوخ":"نیا جائزہ"}</button>
    </div>`
);

// Staff teacher score cards
rep(
  `      {teacherScores.map((t,i)=>{ const h=HOUSES.find(x=>x.id===t.houseId)||{}; return <div key={t.id} className="hv-card" style={{...S.card,borderTop:\`4px solid \${i===0?C.gold:h.color||C.navy}\`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"8px"}}>
          <div><div style={{fontSize:"0.82rem",fontWeight:"700",color:C.navy}}>{t.name}</div><div style={{fontSize:"0.6rem",color:"#888"}}>{t.subject}</div></div>
          <div style={{background:i===0?\`linear-gradient(135deg,\${C.gold},\${C.goldDark})\`:"#eee",color:i===0?C.white:"#aaa",padding:"4px 10px",borderRadius:"20px",fontSize:"0.65rem",fontWeight:"900"}}>{i===0?"👑":\`\${i+1}\`}</div>
        </div>
        <div style={{fontSize:"2rem",fontWeight:"900",color:t.avgScore>=80?C.green:t.avgScore>=60?C.amber:t.avgScore>0?C.red:"#ddd"}}>{t.avgScore>0?\`\${t.avgScore}%\`:"—"}</div>
        {pBar(t.avgScore,100,t.avgScore>=80?C.green:t.avgScore>=60?C.amber:C.red)}
        <div style={{fontSize:"0.58rem",color:"#aaa",marginTop:"4px"}}>{t.reviews} جائزے</div>
      </div>; })}`,
  `      {teacherScores.map((t,i)=>{ const h=HOUSES.find(x=>x.id===t.houseId)||{}; return <div key={t.id} style={{...glass,padding:"18px",borderTop:\`3px solid \${i===0?"#d4af37":h.color||"#60a5fa"}\`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"8px"}}>
          <div><div style={{fontSize:"0.82rem",fontWeight:"700",color:"#f1f5f9"}}>{t.name}</div><div style={{fontSize:"0.6rem",color:"rgba(255,255,255,0.5)"}}>{t.subject}</div></div>
          <div style={{background:i===0?"linear-gradient(135deg,#d4af37,#b8960a)":"rgba(255,255,255,0.08)",color:i===0?"#0f172a":"rgba(255,255,255,0.4)",padding:"4px 10px",borderRadius:"20px",fontSize:"0.65rem",fontWeight:"900"}}>{i===0?"👑":\`\${i+1}\`}</div>
        </div>
        <div style={{fontSize:"2rem",fontWeight:"900",color:t.avgScore>=80?"#4ade80":t.avgScore>=60?"#fb923c":t.avgScore>0?"#f87171":"rgba(255,255,255,0.2)"}}>{t.avgScore>0?\`\${t.avgScore}%\`:"—"}</div>
        {pBar(t.avgScore,100,t.avgScore>=80?"#4ade80":t.avgScore>=60?"#fb923c":"#f87171")}
        <div style={{fontSize:"0.58rem",color:"rgba(255,255,255,0.35)",marginTop:"4px"}}>{t.reviews} جائزے</div>
      </div>; })}`
);

// Staff review form
rep(
  `    {show&&<div className="hv-card" style={{...S.card,marginBottom:"20px",background:\`linear-gradient(135deg,\${C.goldLight},#fdf8ee)\`}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"16px"}}>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>استاد *</label><select style={S.inpSm} value={f.teacherId} onChange={e=>setF({...f,teacherId:e.target.value})}><option value="">-- منتخب کریں --</option>{teachers.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>مہینہ *</label><input style={{...S.inpSm,direction:"ltr"}} type="month" value={f.month} onChange={e=>setF({...f,month:e.target.value})}/></div>
      </div>
      {criteria.map(c=><div key={c.id} style={{background:C.white,borderRadius:"12px",padding:"12px 16px",marginBottom:"10px",border:\`1px solid \${C.goldLight}\`}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:"6px"}}><span style={{fontSize:"0.72rem",fontWeight:"700",color:C.navy}}>{c.l}</span><span style={{fontSize:"0.68rem",fontWeight:"700",color:C.gold}}>{f[c.id]}/5</span></div>
        <div style={{display:"flex",gap:"6px"}}>{[1,2,3,4,5].map(star=><button key={star} onClick={()=>setF({...f,[c.id]:star})} style={{fontSize:"1.3rem",background:"none",border:"none",cursor:"pointer",color:star<=f[c.id]?C.gold:"#ddd"}}>★</button>)}</div>
      </div>)}
      <div style={{background:C.white,padding:"10px 16px",borderRadius:"10px",marginBottom:"12px",textAlign:"center"}}><div style={{fontSize:"0.62rem",color:"#888"}}>مجموعی اسکور</div><div style={{fontSize:"1.8rem",fontWeight:"900",color:calcTotal(f)>=80?C.green:calcTotal(f)>=60?C.amber:C.red}}>{calcTotal(f)}%</div></div>
      <div style={{marginBottom:"12px"}}><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>تبصرہ</label><textarea style={{...S.inpSm,minHeight:"60px",resize:"vertical"}} value={f.comments} onChange={e=>setF({...f,comments:e.target.value})} placeholder="تبصرہ..."/></div>
      <button style={S.saveBtn} onClick={add}>✅ جائزہ محفوظ کریں</button>
    </div>}`,
  `    {show&&<div style={{...glass,padding:"24px",marginBottom:"20px",borderColor:"rgba(212,175,55,0.3)"}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"16px"}}>
        <div><label style={lbl}>استاد *</label><select style={inp} value={f.teacherId} onChange={e=>setF({...f,teacherId:e.target.value})}><option value="" style={{background:N2}}>-- منتخب کریں --</option>{teachers.map(t=><option key={t.id} value={t.id} style={{background:N2}}>{t.name}</option>)}</select></div>
        <div><label style={lbl}>مہینہ *</label><input style={{...inp,direction:"ltr",colorScheme:"dark"}} type="month" value={f.month} onChange={e=>setF({...f,month:e.target.value})}/></div>
      </div>
      {criteria.map(c=><div key={c.id} style={{background:"rgba(255,255,255,0.04)",borderRadius:"12px",padding:"12px 16px",marginBottom:"10px",border:"1px solid rgba(255,255,255,0.08)"}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:"6px"}}><span style={{fontSize:"0.72rem",fontWeight:"700",color:"#f1f5f9"}}>{c.l}</span><span style={{fontSize:"0.68rem",fontWeight:"700",color:"#d4af37"}}>{f[c.id]}/5</span></div>
        <div style={{display:"flex",gap:"6px"}}>{[1,2,3,4,5].map(star=><button key={star} onClick={()=>setF({...f,[c.id]:star})} style={{fontSize:"1.3rem",background:"none",border:"none",cursor:"pointer",color:star<=f[c.id]?"#d4af37":"rgba(255,255,255,0.15)"}}>★</button>)}</div>
      </div>)}
      <div style={{background:"rgba(212,175,55,0.1)",padding:"10px 16px",borderRadius:"10px",marginBottom:"12px",textAlign:"center",border:"1px solid rgba(212,175,55,0.2)"}}><div style={{fontSize:"0.62rem",color:"rgba(255,255,255,0.5)"}}>مجموعی اسکور</div><div style={{fontSize:"1.8rem",fontWeight:"900",color:calcTotal(f)>=80?"#4ade80":calcTotal(f)>=60?"#fb923c":"#f87171"}}>{calcTotal(f)}%</div></div>
      <div style={{marginBottom:"12px"}}><label style={lbl}>تبصرہ</label><textarea style={{...inp,minHeight:"60px",resize:"vertical"}} value={f.comments} onChange={e=>setF({...f,comments:e.target.value})} placeholder="تبصرہ..."/></div>
      <button style=${SAVE_BTN} onClick={add}>جائزہ محفوظ کریں</button>
    </div>}`
);

// Staff reviews table
rep(
  `    <div style={S.card} className="hv-card"><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}>
      <thead><tr><th style={S.th}>استاد</th><th style={S.th}>مہینہ</th><th style={S.th}>وقت</th><th style={S.th}>تدریس</th><th style={S.th}>اسکور</th></tr></thead>
      <tbody>{reviews.map(r=>{ const t=teachers.find(x=>x.id===r.teacherId); const sc=r.score||0; return <tr key={r.id}>
        <td style={{...S.td,fontWeight:"700"}}>{t?.name||"—"}</td>
        <td style={{...S.td,fontFamily:"monospace",direction:"ltr",fontSize:"0.6rem"}}>{r.month}</td>
        <td style={S.td}><span style={{color:C.gold}}>{"★".repeat(r.punctuality||0)}</span></td>
        <td style={S.td}><span style={{color:C.gold}}>{"★".repeat(r.teaching||0)}</span></td>
        <td style={S.td}><span style={{padding:"4px 10px",borderRadius:"20px",fontSize:"0.62rem",fontWeight:"800",background:sc>=80?"#dcfce7":sc>=60?"#fef3c7":"#fee2e2",color:sc>=80?C.green:sc>=60?C.amber:C.red}}>{sc}%</span></td>
      </tr>; })}{reviews.length===0&&<tr><td colSpan={5} style={{...S.td,textAlign:"center",color:"#bbb",padding:"40px"}}>کوئی جائزہ نہیں</td></tr>}</tbody>
    </table></div></div>`,
  `    <div style={{...glass,overflow:"hidden"}}><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}>
      <thead><tr style={{background:"rgba(255,255,255,0.04)"}}>{["استاد","مہینہ","وقت","تدریس","اسکور"].map(h=><th key={h} style={{padding:"12px 14px",textAlign:"right",fontSize:"0.65rem",color:"rgba(212,175,55,0.8)",fontWeight:"700"}}>{h}</th>)}</tr></thead>
      <tbody>{reviews.map((r,ri)=>{ const t=teachers.find(x=>x.id===r.teacherId); const sc=r.score||0; return <tr key={r.id} style={{background:ri%2===0?"rgba(255,255,255,0.02)":"transparent"}}>
        <td style={{padding:"11px 14px",color:"#f1f5f9",fontWeight:"700",fontSize:"0.75rem",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>{t?.name||"—"}</td>
        <td style={{padding:"11px 14px",fontFamily:"monospace",direction:"ltr",fontSize:"0.6rem",color:"rgba(255,255,255,0.6)",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>{r.month}</td>
        <td style={{padding:"11px 14px",borderBottom:"1px solid rgba(255,255,255,0.05)"}}><span style={{color:"#d4af37"}}>{"★".repeat(r.punctuality||0)}</span></td>
        <td style={{padding:"11px 14px",borderBottom:"1px solid rgba(255,255,255,0.05)"}}><span style={{color:"#d4af37"}}>{"★".repeat(r.teaching||0)}</span></td>
        <td style={{padding:"11px 14px",borderBottom:"1px solid rgba(255,255,255,0.05)"}}><span style={{padding:"4px 10px",borderRadius:"20px",fontSize:"0.62rem",fontWeight:"800",background:sc>=80?"rgba(74,222,128,0.15)":sc>=60?"rgba(251,191,36,0.15)":"rgba(248,113,113,0.15)",color:sc>=80?"#4ade80":sc>=60?"#fbbf24":"#f87171"}}>{sc}%</span></td>
      </tr>; })}{reviews.length===0&&<tr><td colSpan={5} style={{padding:"40px",textAlign:"center",color:"rgba(255,255,255,0.3)"}}>کوئی جائزہ نہیں</td></tr>}</tbody>
    </table></div></div>`
);

console.log('StaffPerformance done:', n);

// ===================== PARENT PORTAL =====================
rep(
  `    return <div style={S.page}>
      <button style={{...S.addBtn,marginBottom:"20px",background:"#eee",color:C.navy,boxShadow:"none"}} onClick={()=>setSelStudent(null)}>← واپس</button>
      <div style={{background:h.gradient||`,
  `
    const G="#d4af37"; const N="#0f172a"; const N2="#1e293b";
    const glass=${GLASS};
    const inp={width:"100%",padding:"10px 14px",borderRadius:"10px",border:"1px solid rgba(212,175,55,0.25)",background:"rgba(255,255,255,0.06)",color:"#f1f5f9",fontSize:"0.8rem",fontFamily:"'Public Sans',sans-serif",outline:"none",boxSizing:"border-box",direction:"rtl",colorScheme:"dark"};
    const lbl={fontSize:"0.7rem",color:"rgba(212,175,55,0.8)",marginBottom:"6px",display:"block",fontWeight:"600"};
    return <div style=${DARK_WRAP}>
      <button style={{padding:"8px 16px",borderRadius:"10px",border:"1px solid rgba(255,255,255,0.15)",background:"transparent",color:"rgba(255,255,255,0.7)",fontSize:"0.75rem",cursor:"pointer",marginBottom:"20px",fontFamily:"'Public Sans',sans-serif"}} onClick={()=>setSelStudent(null)}>← واپس</button>
      <div style={{background:h.gradient||`
);

// Parent portal student header card
rep(
  `\`linear-gradient(135deg,\${C.navy},\${C.navyMid})\`,borderRadius:"22px",padding:"24px",marginBottom:"20px",color:C.white}}>
        <div style={{display:"flex",alignItems:"center",gap:"16px"}}>
          <div style={{width:"64px",height:"64px",borderRadius:"50%",background:"rgba(255,255,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"2rem"}}>{h.emoji||"👤"}</div>
          <div><div style={{fontSize:"1.3rem",fontWeight:"800"}}>{selStudent.name}</div><div style={{fontSize:"0.7rem",opacity:0.8,marginTop:"2px"}}>والد: {selStudent.fatherName}</div><div style={{fontSize:"0.65rem",opacity:0.7,fontFamily:"monospace",direction:"ltr",marginTop:"2px"}}>{selStudent.studentCode}</div></div>
        </div>
      </div>`,
  `\`linear-gradient(135deg,#0d1f3c,#1e3a5f)\`,borderRadius:"22px",padding:"24px",marginBottom:"20px",border:"1px solid rgba(212,175,55,0.2)"}}>
        <div style={{display:"flex",alignItems:"center",gap:"16px"}}>
          <div style={{width:"64px",height:"64px",borderRadius:"50%",background:"rgba(212,175,55,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"2rem"}}>{h.emoji||"👤"}</div>
          <div><div style={{fontSize:"1.3rem",fontWeight:"800",color:"#f1f5f9"}}>{selStudent.name}</div><div style={{fontSize:"0.7rem",color:"rgba(212,175,55,0.7)",marginTop:"2px"}}>والد: {selStudent.fatherName}</div><div style={{fontSize:"0.65rem",color:"rgba(255,255,255,0.4)",fontFamily:"monospace",direction:"ltr",marginTop:"2px"}}>{selStudent.studentCode}</div></div>
        </div>
      </div>`
);

// Parent stats mini cards
rep(
  `        {[{c:C.abuBakr,i:"📚",n:selStudent.grade,l:"جماعت"},{c:h.color||C.gold,i:h.emoji||"🏠",n:h.nameEn||"—",l:"ہاؤس"},{c:C.green,i:"📊",n:\`\${avgResult}%\`,l:"اوسط نتیجہ"},{c:C.red,i:"💰",n:pendingFees.length,l:"واجب الادا فیس"}].map((x,i)=><div key={i} style={{background:\`linear-gradient(135deg,\${x.c}12,\${x.c}05)\`,borderRadius:"16px",padding:"16px",border:\`2px solid \${x.c}20\`,textAlign:"center"}}><div style={{fontSize:"1.4rem"}}>{x.i}</div><div style={{fontSize:"1.1rem",fontWeight:"900",color:x.c,marginTop:"4px"}}>{x.n}</div><div style={{fontSize:"0.6rem",color:"#888",marginTop:"2px"}}>{x.l}</div></div>)}`,
  `        {[{c:"#60a5fa",i:"📚",n:selStudent.grade,l:"جماعت"},{c:h.color||"#d4af37",i:h.emoji||"🏠",n:h.nameEn||"—",l:"ہاؤس"},{c:"#4ade80",i:"📊",n:\`\${avgResult}%\`,l:"اوسط نتیجہ"},{c:"#f87171",i:"💰",n:pendingFees.length,l:"واجب الادا فیس"}].map((x,i)=><div key={i} style={{background:\`\${x.c}12\`,borderRadius:"16px",padding:"16px",border:\`1px solid \${x.c}30\`,textAlign:"center"}}><div style={{fontSize:"1.4rem"}}>{x.i}</div><div style={{fontSize:"1.1rem",fontWeight:"900",color:x.c,marginTop:"4px"}}>{x.n}</div><div style={{fontSize:"0.6rem",color:"rgba(255,255,255,0.5)",marginTop:"2px"}}>{x.l}</div></div>)}`
);

// Parent results card
rep(
  `        <div style={S.card} className="hv-card">
          <div style={{fontSize:"0.82rem",fontWeight:"700",color:C.navy,marginBottom:"12px"}}>📊 حالیہ نتائج</div>
          {sResults.slice(0,5).map(r=><div key={r.id} style={{display:"flex",justifyContent:"space-between",marginBottom:"8px",padding:"6px 10px",background:"#fafaf8",borderRadius:"8px"}}>
            <span style={{fontSize:"0.65rem",fontWeight:"600",color:C.navy}}>{r.subject}</span>
            <span style={{fontSize:"0.65rem",fontWeight:"800",color:r.percentage>=70?C.green:r.percentage>=50?C.amber:C.red}}>{r.grade} ({r.percentage}%)</span>
          </div>)}
          {sResults.length===0&&<div style={{textAlign:"center",color:"#bbb",fontSize:"0.62rem",padding:"20px"}}>کوئی نتیجہ نہیں</div>}
        </div>
        <div style={S.card} className="hv-card">
          <div style={{fontSize:"0.82rem",fontWeight:"700",color:C.navy,marginBottom:"12px"}}>💰 فیس صورتحال</div>
          {pendingFees.length>0&&<div style={{background:"#fee2e2",borderRadius:"10px",padding:"10px 14px",marginBottom:"10px"}}><div style={{fontSize:"0.65rem",fontWeight:"700",color:C.red}}>⚠️ {pendingFees.length} فیس باقی ہے</div><div style={{fontSize:"1rem",fontWeight:"900",color:C.red}}>Rs. {pendingFees.reduce((s,f)=>s+(f.amount||0),0).toLocaleString()}</div></div>}
          {sFees.filter(f=>f.status==="paid").slice(0,3).map(f=><div key={f.id} style={{display:"flex",justifyContent:"space-between",marginBottom:"6px",padding:"6px 10px",background:"#dcfce7",borderRadius:"8px"}}>
            <span style={{fontSize:"0.62rem",color:C.green}}>✅ {f.month||f.type}</span>
            <span style={{fontSize:"0.62rem",fontWeight:"700",color:C.green}}>Rs. {(f.amount||0).toLocaleString()}</span>
          </div>)}
          {sFees.length===0&&<div style={{textAlign:"center",color:"#bbb",fontSize:"0.62rem",padding:"20px"}}>کوئی فیس ریکارڈ نہیں</div>}
        </div>`,
  `        <div style={{...glass,padding:"18px"}}>
          <div style={{fontSize:"0.82rem",fontWeight:"700",color:"#d4af37",marginBottom:"12px"}}>📊 حالیہ نتائج</div>
          {sResults.slice(0,5).map(r=><div key={r.id} style={{display:"flex",justifyContent:"space-between",marginBottom:"8px",padding:"6px 10px",background:"rgba(255,255,255,0.04)",borderRadius:"8px"}}>
            <span style={{fontSize:"0.65rem",fontWeight:"600",color:"#f1f5f9"}}>{r.subject}</span>
            <span style={{fontSize:"0.65rem",fontWeight:"800",color:r.percentage>=70?"#4ade80":r.percentage>=50?"#fb923c":"#f87171"}}>{r.grade} ({r.percentage}%)</span>
          </div>)}
          {sResults.length===0&&<div style={{textAlign:"center",color:"rgba(255,255,255,0.3)",fontSize:"0.62rem",padding:"20px"}}>کوئی نتیجہ نہیں</div>}
        </div>
        <div style={{...glass,padding:"18px"}}>
          <div style={{fontSize:"0.82rem",fontWeight:"700",color:"#d4af37",marginBottom:"12px"}}>💰 فیس صورتحال</div>
          {pendingFees.length>0&&<div style={{background:"rgba(248,113,113,0.12)",borderRadius:"10px",padding:"10px 14px",marginBottom:"10px",border:"1px solid rgba(248,113,113,0.2)"}}><div style={{fontSize:"0.65rem",fontWeight:"700",color:"#f87171"}}>⚠️ {pendingFees.length} فیس باقی ہے</div><div style={{fontSize:"1rem",fontWeight:"900",color:"#f87171"}}>Rs. {pendingFees.reduce((s,f)=>s+(f.amount||0),0).toLocaleString()}</div></div>}
          {sFees.filter(f=>f.status==="paid").slice(0,3).map(f=><div key={f.id} style={{display:"flex",justifyContent:"space-between",marginBottom:"6px",padding:"6px 10px",background:"rgba(74,222,128,0.08)",borderRadius:"8px",border:"1px solid rgba(74,222,128,0.15)"}}>
            <span style={{fontSize:"0.62rem",color:"#4ade80"}}>✅ {f.month||f.type}</span>
            <span style={{fontSize:"0.62rem",fontWeight:"700",color:"#4ade80"}}>Rs. {(f.amount||0).toLocaleString()}</span>
          </div>)}
          {sFees.length===0&&<div style={{textAlign:"center",color:"rgba(255,255,255,0.3)",fontSize:"0.62rem",padding:"20px"}}>کوئی فیس ریکارڈ نہیں</div>}
        </div>`
);

// Parent portal search view
rep(
  `  return <div style={S.page}>
    <div style={{fontSize:"1.1rem",fontWeight:"700",color:C.navy,marginBottom:"6px"}}>👪 والدین پورٹل</div>
    <div style={{fontSize:"0.62rem",color:"#888",marginBottom:"20px"}}>طالب علم کا نام یا کوڈ لکھ کر تلاش کریں</div>
    <div style={{marginBottom:"20px"}}><input style={{...S.inpSm,fontSize:"0.8rem",padding:"14px 18px"}} placeholder="🔍 نام یا کوڈ لکھیں..." value={q} onChange={e=>setQ(e.target.value)}/></div>`,
  `  return <div style=${DARK_WRAP}>
    <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"24px"}}>
      <div style={{width:"44px",height:"44px",borderRadius:"12px",background:"linear-gradient(135deg,#d4af37,#b8960a)",display:"flex",alignItems:"center",justifyContent:"center"}}><span className="material-symbols-rounded" style={{fontSize:"24px",color:N}}>family_restroom</span></div>
      <div><h2 style={{margin:0,fontSize:"1.4rem",fontWeight:"800",color:"#f1f5f9"}}>والدین پورٹل</h2><p style={{margin:0,fontSize:"0.72rem",color:"rgba(212,175,55,0.7)"}}>طالب علم کا نام یا کوڈ لکھ کر تلاش کریں</p></div>
    </div>
    <div style={{marginBottom:"20px"}}><input style={{width:"100%",padding:"14px 18px",borderRadius:"12px",border:"1px solid rgba(212,175,55,0.25)",background:"rgba(255,255,255,0.06)",color:"#f1f5f9",fontSize:"0.85rem",fontFamily:"'Public Sans',sans-serif",outline:"none",boxSizing:"border-box",direction:"rtl",colorScheme:"dark"}} placeholder="🔍 نام یا کوڈ لکھیں..." value={q} onChange={e=>setQ(e.target.value)}/></div>`
);

// Parent portal student cards
rep(
  `      {filtered.map(s=>{ const h=HOUSES.find(x=>x.id===s.houseId)||{}; return <div key={s.id} onClick={()=>setSelStudent(s)} className="hv-card" style={{...S.card,cursor:"pointer",borderRight:\`4px solid \${h.color||C.gold}\`}}>
        <div style={{display:"flex",alignItems:"center",gap:"14px"}}>
          <div style={{width:"48px",height:"48px",borderRadius:"50%",background:h.gradient||\`linear-gradient(135deg,\${C.navy},#2563eb)\`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.4rem"}}>{h.emoji||"👤"}</div>
          <div><div style={{fontSize:"0.85rem",fontWeight:"700",color:C.navy}}>{s.name}</div><div style={{fontSize:"0.62rem",color:"#888"}}>{s.grade} • {h.nameEn||"—"}</div><div style={{fontSize:"0.6rem",color:C.gold,fontFamily:"monospace",direction:"ltr"}}>{s.studentCode}</div></div>
        </div>
      </div>; })}
      {filtered.length===0&&<div className="hv-card" style={{...S.card,textAlign:"center",color:"#bbb",padding:"40px",gridColumn:"1/-1"}}>"{q}" کوئی نتیجہ نہیں</div>}
    </div>}
    {!q&&<div className="hv-card" style={{...S.card,textAlign:"center",padding:"60px"}}><div style={{fontSize:"3rem",marginBottom:"12px"}}>👪</div><div style={{fontSize:"0.85rem",fontWeight:"700",color:C.navy,marginBottom:"8px"}}>والدین پورٹل میں خوش آمدید</div><div style={{fontSize:"0.65rem",color:"#888"}}>اپنے بچے کا نام یا داخلہ نمبر تلاش کریں</div></div>}`,
  `      {filtered.map(s=>{ const h=HOUSES.find(x=>x.id===s.houseId)||{}; return <div key={s.id} onClick={()=>setSelStudent(s)} style={{...glass,padding:"18px",cursor:"pointer",borderRight:\`3px solid \${h.color||"#d4af37"}\`}}>
        <div style={{display:"flex",alignItems:"center",gap:"14px"}}>
          <div style={{width:"48px",height:"48px",borderRadius:"50%",background:h.gradient||"linear-gradient(135deg,#1e3a5f,#2563eb)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.4rem"}}>{h.emoji||"👤"}</div>
          <div><div style={{fontSize:"0.85rem",fontWeight:"700",color:"#f1f5f9"}}>{s.name}</div><div style={{fontSize:"0.62rem",color:"rgba(255,255,255,0.5)"}}>{s.grade} • {h.nameEn||"—"}</div><div style={{fontSize:"0.6rem",color:"#d4af37",fontFamily:"monospace",direction:"ltr"}}>{s.studentCode}</div></div>
        </div>
      </div>; })}
      {filtered.length===0&&<div style={{...glass,textAlign:"center",color:"rgba(255,255,255,0.3)",padding:"40px",gridColumn:"1/-1"}}>"{q}" کوئی نتیجہ نہیں</div>}
    </div>}
    {!q&&<div style={{...glass,textAlign:"center",padding:"60px"}}><div style={{fontSize:"3rem",marginBottom:"12px"}}>👪</div><div style={{fontSize:"0.85rem",fontWeight:"700",color:"#f1f5f9",marginBottom:"8px"}}>والدین پورٹل میں خوش آمدید</div><div style={{fontSize:"0.65rem",color:"rgba(255,255,255,0.5)"}}>اپنے بچے کا نام یا داخلہ نمبر تلاش کریں</div></div>}`
);

console.log('ParentPortal done:', n);

// ===================== DIRECTOR PORTAL =====================
rep(
  `  return <div style={S.page}>
    <div style={{fontSize:"1.1rem",fontWeight:"700",color:C.navy,marginBottom:"6px"}}>👨‍💼 ڈائریکٹر پورٹل</div>
    <div style={{fontSize:"0.62rem",color:"#888",marginBottom:"20px"}}>مکمل ادارہ — اعلیٰ نظریہ</div>
    <div style={{background:\`linear-gradient(135deg,\${C.navyDark},\${C.navyMid})\``,
  `${THEME_VARS}
  return <div style=${DARK_WRAP}>
    <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"24px"}}>
      <div style={{width:"44px",height:"44px",borderRadius:"12px",background:"linear-gradient(135deg,#d4af37,#b8960a)",display:"flex",alignItems:"center",justifyContent:"center"}}><span className="material-symbols-rounded" style={{fontSize:"24px",color:N}}>admin_panel_settings</span></div>
      <div><h2 style={{margin:0,fontSize:"1.4rem",fontWeight:"800",color:"#f1f5f9"}}>ڈائریکٹر پورٹل</h2><p style={{margin:0,fontSize:"0.72rem",color:"rgba(212,175,55,0.7)"}}>مکمل ادارہ — اعلیٰ نظریہ</p></div>
    </div>
    <div style={{background:"linear-gradient(135deg,#0d1f3c,#0a1628)"`
);

// Director exec summary card content
rep(
  `,borderRadius:"22px",padding:"24px",marginBottom:"24px",color:C.white}}>
      <div style={{fontSize:"0.65rem",opacity:0.6,marginBottom:"8px",letterSpacing:"0.15em"}}>EXECUTIVE SUMMARY</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:"16px"}}>
        {[{i:"🎓",n:students.length,l:"طلبا"},{i:"👨‍🏫",n:teachers.length,l:"اساتذہ"},{i:"📊",n:\`\${avgResult}%\`,l:"اوسط نتیجہ"},{i:"💰",n:\`\${totalFees>0?Math.round((paidFees/totalFees)*100):0}%\`,l:"فیس وصولی"},{i:"🏆",n:winnerInfo?.nameEn||"—",l:"سپر ہاؤس"},{i:"📈",n:hvsLogs.length,l:"HVS لاگز"}].map((x,i)=><div key={i} style={{textAlign:"center"}}><div style={{fontSize:"1.6rem"}}>{x.i}</div><div style={{fontSize:"1.4rem",fontWeight:"900",color:C.gold,marginTop:"4px"}}>{x.n}</div><div style={{fontSize:"0.58rem",opacity:0.7,marginTop:"2px"}}>{x.l}</div></div>)}
      </div>
    </div>`,
  `,borderRadius:"22px",padding:"24px",marginBottom:"24px",border:"1px solid rgba(212,175,55,0.2)"}}>
      <div style={{fontSize:"0.65rem",color:"rgba(212,175,55,0.6)",marginBottom:"8px",letterSpacing:"0.15em"}}>EXECUTIVE SUMMARY</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:"16px"}}>
        {[{i:"🎓",n:students.length,l:"طلبا"},{i:"👨‍🏫",n:teachers.length,l:"اساتذہ"},{i:"📊",n:\`\${avgResult}%\`,l:"اوسط نتیجہ"},{i:"💰",n:\`\${totalFees>0?Math.round((paidFees/totalFees)*100):0}%\`,l:"فیس وصولی"},{i:"🏆",n:winnerInfo?.nameEn||"—",l:"سپر ہاؤس"},{i:"📈",n:hvsLogs.length,l:"HVS لاگز"}].map((x,i)=><div key={i} style={{textAlign:"center"}}><div style={{fontSize:"1.6rem"}}>{x.i}</div><div style={{fontSize:"1.4rem",fontWeight:"900",color:"#d4af37",marginTop:"4px"}}>{x.n}</div><div style={{fontSize:"0.58rem",color:"rgba(255,255,255,0.5)",marginTop:"2px"}}>{x.l}</div></div>)}
      </div>
    </div>`
);

// Director house ranking + finance cards
rep(
  `      <div style={S.card} className="hv-card">
        <div style={{fontSize:"0.85rem",fontWeight:"700",color:C.navy,marginBottom:"16px"}}>🏆 ہاؤس رینکنگ</div>
        {sortedHouses.map((h,i)=>{ const info=HOUSES.find(x=>x.id===h.id)||{}; return <div key={h.id} style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"12px"}}>
          <div style={{width:"28px",height:"28px",borderRadius:"50%",background:i===0?\`linear-gradient(135deg,\${C.gold},\${C.goldDark})\`:"#eee",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.65rem",fontWeight:"900",color:i===0?C.white:"#aaa",flexShrink:0}}>{i===0?"👑":\`\${i+1}\`}</div>
          <span style={{fontSize:"1.2rem"}}>{info.emoji}</span>
          <div style={{flex:1}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:"4px"}}><span style={{fontSize:"0.7rem",fontWeight:"700",color:C.navy}}>{info.nameEn}</span><span style={{fontSize:"0.7rem",fontWeight:"800",color:info.color||C.gold}}>{h.points||0}</span></div>{pBar(h.points||0,Math.max(...houses.map(x=>x.points||0),1),info.color||C.gold)}</div>
        </div>; })}
      </div>
      <div style={S.card} className="hv-card">
        <div style={{fontSize:"0.85rem",fontWeight:"700",color:C.navy,marginBottom:"16px"}}>💰 مالی خلاصہ</div>
        <div style={{marginBottom:"16px"}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:"6px"}}><span style={{fontSize:"0.68rem",color:"#888"}}>کل فیس</span><span style={{fontSize:"0.72rem",fontWeight:"700"}}>Rs. {totalFees.toLocaleString()}</span></div>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:"6px"}}><span style={{fontSize:"0.68rem",color:"#888"}}>وصول</span><span style={{fontSize:"0.72rem",fontWeight:"700",color:C.green}}>Rs. {paidFees.toLocaleString()}</span></div>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:"10px"}}><span style={{fontSize:"0.68rem",color:"#888"}}>باقی</span><span style={{fontSize:"0.72rem",fontWeight:"700",color:C.red}}>Rs. {(totalFees-paidFees).toLocaleString()}</span></div>
          {pBar(paidFees,totalFees||1,C.green)}
        </div>
        <div style={{background:"#fafaf8",borderRadius:"12px",padding:"12px"}}><div style={{fontSize:"0.65rem",color:"#888",marginBottom:"4px"}}>وصولی کا تناسب</div><div style={{fontSize:"2rem",fontWeight:"900",color:totalFees>0&&(paidFees/totalFees)>=0.8?C.green:C.amber}}>{totalFees>0?Math.round((paidFees/totalFees)*100):0}%</div></div>
      </div>`,
  `      <div style={{...glass,padding:"20px"}}>
        <div style={{fontSize:"0.85rem",fontWeight:"700",color:"#d4af37",marginBottom:"16px"}}>🏆 ہاؤس رینکنگ</div>
        {sortedHouses.map((h,i)=>{ const info=HOUSES.find(x=>x.id===h.id)||{}; return <div key={h.id} style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"12px"}}>
          <div style={{width:"28px",height:"28px",borderRadius:"50%",background:i===0?"linear-gradient(135deg,#d4af37,#b8960a)":"rgba(255,255,255,0.08)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.65rem",fontWeight:"900",color:i===0?"#0f172a":"rgba(255,255,255,0.4)",flexShrink:0}}>{i===0?"👑":\`\${i+1}\`}</div>
          <span style={{fontSize:"1.2rem"}}>{info.emoji}</span>
          <div style={{flex:1}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:"4px"}}><span style={{fontSize:"0.7rem",fontWeight:"700",color:"#f1f5f9"}}>{info.nameEn}</span><span style={{fontSize:"0.7rem",fontWeight:"800",color:info.color||"#d4af37"}}>{h.points||0}</span></div>{pBar(h.points||0,Math.max(...houses.map(x=>x.points||0),1),info.color||"#d4af37")}</div>
        </div>; })}
      </div>
      <div style={{...glass,padding:"20px"}}>
        <div style={{fontSize:"0.85rem",fontWeight:"700",color:"#d4af37",marginBottom:"16px"}}>💰 مالی خلاصہ</div>
        <div style={{marginBottom:"16px"}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:"6px"}}><span style={{fontSize:"0.68rem",color:"rgba(255,255,255,0.5)"}}>کل فیس</span><span style={{fontSize:"0.72rem",fontWeight:"700",color:"#f1f5f9"}}>Rs. {totalFees.toLocaleString()}</span></div>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:"6px"}}><span style={{fontSize:"0.68rem",color:"rgba(255,255,255,0.5)"}}>وصول</span><span style={{fontSize:"0.72rem",fontWeight:"700",color:"#4ade80"}}>Rs. {paidFees.toLocaleString()}</span></div>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:"10px"}}><span style={{fontSize:"0.68rem",color:"rgba(255,255,255,0.5)"}}>باقی</span><span style={{fontSize:"0.72rem",fontWeight:"700",color:"#f87171"}}>Rs. {(totalFees-paidFees).toLocaleString()}</span></div>
          {pBar(paidFees,totalFees||1,"#4ade80")}
        </div>
        <div style={{background:"rgba(255,255,255,0.04)",borderRadius:"12px",padding:"12px",border:"1px solid rgba(255,255,255,0.06)"}}><div style={{fontSize:"0.65rem",color:"rgba(255,255,255,0.5)",marginBottom:"4px"}}>وصولی کا تناسب</div><div style={{fontSize:"2rem",fontWeight:"900",color:totalFees>0&&(paidFees/totalFees)>=0.8?"#4ade80":"#fb923c"}}>{totalFees>0?Math.round((paidFees/totalFees)*100):0}%</div></div>
      </div>`
);

// Director results analysis card
rep(
  `    <div style={S.card} className="hv-card">
      <div style={{fontSize:"0.85rem",fontWeight:"700",color:C.navy,marginBottom:"16px"}}>📊 نتائج تجزیہ</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:"12px"}}>
        {[["A+",results.filter(r=>r.grade==="A+").length,C.green],["A",results.filter(r=>r.grade==="A").length,C.green],["B",results.filter(r=>r.grade==="B").length,C.abuBakr],["C",results.filter(r=>r.grade==="C").length,C.amber],["D",results.filter(r=>r.grade==="D").length,C.amber],["F",results.filter(r=>r.grade==="F").length,C.red]].map(([g,n,c])=><div key={g} style={{background:\`\${c}12\`,borderRadius:"12px",padding:"12px",textAlign:"center",border:\`1px solid \${c}20\`}}><div style={{fontSize:"1.2rem",fontWeight:"900",color:c}}>{g}</div><div style={{fontSize:"1.4rem",fontWeight:"900",color:c}}>{n}</div><div style={{fontSize:"0.6rem",color:"#888"}}>طلبا</div></div>)}
      </div>
    </div>`,
  `    <div style={{...glass,padding:"20px"}}>
      <div style={{fontSize:"0.85rem",fontWeight:"700",color:"#d4af37",marginBottom:"16px"}}>📊 نتائج تجزیہ</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:"12px"}}>
        {[["A+",results.filter(r=>r.grade==="A+").length,"#4ade80"],["A",results.filter(r=>r.grade==="A").length,"#4ade80"],["B",results.filter(r=>r.grade==="B").length,"#60a5fa"],["C",results.filter(r=>r.grade==="C").length,"#fb923c"],["D",results.filter(r=>r.grade==="D").length,"#fb923c"],["F",results.filter(r=>r.grade==="F").length,"#f87171"]].map(([g,n,c])=><div key={g} style={{background:\`\${c}12\`,borderRadius:"12px",padding:"12px",textAlign:"center",border:\`1px solid \${c}25\`}}><div style={{fontSize:"1.2rem",fontWeight:"900",color:c}}>{g}</div><div style={{fontSize:"1.4rem",fontWeight:"900",color:c}}>{n}</div><div style={{fontSize:"0.6rem",color:"rgba(255,255,255,0.5)"}}>طلبا</div></div>)}
      </div>
    </div>`
);

console.log('DirectorPortal done:', n);
fs.writeFileSync(path, content, 'utf8');
console.log('Saved. Total:', n);
