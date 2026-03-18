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
const TV = `
  const G="#d4af37"; const N="#0f172a"; const N2="#1e293b";
  const glass=${GLASS};
  const inp={width:"100%",padding:"10px 14px",borderRadius:"10px",border:"1px solid rgba(212,175,55,0.25)",background:"rgba(255,255,255,0.06)",color:"#f1f5f9",fontSize:"0.8rem",fontFamily:"'Public Sans',sans-serif",outline:"none",boxSizing:"border-box",direction:"rtl",colorScheme:"dark"};
  const lbl={fontSize:"0.7rem",color:"rgba(212,175,55,0.8)",marginBottom:"6px",display:"block",fontWeight:"600"};`;
const SB = `{background:"linear-gradient(135deg,#d4af37,#b8960a)",color:N,border:"none",borderRadius:"12px",padding:"11px 26px",fontSize:"0.82rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif",fontWeight:"700"}`;

// ===================== LESSON PLANS =====================
rep(
  `  return <div style={S.page}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
      <div><div style={{fontSize:"1.1rem",fontWeight:"700",color:C.navy}}>📅 سبق کا منصوبہ</div><div style={{fontSize:"0.62rem",color:"#888",marginTop:"2px"}}>Lesson Plans — مضامین اور اہداف</div></div>
      <button style={S.addBtn} onClick={()=>setShow(!show)}>+ نیا منصوبہ</button>
    </div>`,
  `${TV}
  return <div style=${DARK_WRAP}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"24px",flexWrap:"wrap",gap:"12px"}}>
      <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
        <div style={{width:"44px",height:"44px",borderRadius:"12px",background:"linear-gradient(135deg,#d4af37,#b8960a)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 20px rgba(212,175,55,0.4)"}}><span className="material-symbols-rounded" style={{fontSize:"24px",color:N}}>assignment</span></div>
        <div><h2 style={{margin:0,fontSize:"1.4rem",fontWeight:"800",color:"#f1f5f9"}}>سبق کا منصوبہ</h2><p style={{margin:0,fontSize:"0.72rem",color:"rgba(212,175,55,0.7)"}}>Lesson Plans — مضامین اور اہداف</p></div>
      </div>
      <button style={{display:"flex",alignItems:"center",gap:"8px",padding:"10px 20px",borderRadius:"12px",border:"1px solid #d4af37",background:show?"rgba(212,175,55,0.15)":"transparent",color:"#d4af37",fontWeight:"700",fontSize:"0.82rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif"}} onClick={()=>setShow(!show)}><span className="material-symbols-rounded" style={{fontSize:"18px"}}>{show?"close":"add_circle"}</span>{show?"منسوخ":"نیا منصوبہ"}</button>
    </div>`
);

rep(
  `      {[{c:C.abuBakr,i:"📅",n:plans.length,l:"کل منصوبے"},{c:C.green,i:"📖",n:[...new Set(plans.map(p=>p.subject))].length,l:"مضامین"},{c:C.gold,i:"👨‍🏫",n:[...new Set(plans.map(p=>p.teacherId))].filter(Boolean).length,l:"اساتذہ"},{c:C.amber,i:"⏱️",n:plans.reduce((s,p)=>s+(p.duration||0),0),l:"کل منٹ"}].map((x,i)=><div key={i} style={{background:\`linear-gradient(135deg,\${x.c}12,\${x.c}05)\`,borderRadius:"16px",padding:"16px",border:\`2px solid \${x.c}20\`,textAlign:"center"}}><div style={{fontSize:"1.3rem"}}>{x.i}</div><div style={{fontSize:"1.4rem",fontWeight:"900",color:x.c}}>{x.n}</div><div style={{fontSize:"0.6rem",color:"#888"}}>{x.l}</div></div>)}`,
  `      {[{c:"#60a5fa",i:"📅",n:plans.length,l:"کل منصوبے"},{c:"#4ade80",i:"📖",n:[...new Set(plans.map(p=>p.subject))].length,l:"مضامین"},{c:"#d4af37",i:"👨‍🏫",n:[...new Set(plans.map(p=>p.teacherId))].filter(Boolean).length,l:"اساتذہ"},{c:"#fb923c",i:"⏱️",n:plans.reduce((s,p)=>s+(p.duration||0),0),l:"کل منٹ"}].map((x,i)=><div key={i} style={{background:\`\${x.c}15\`,borderRadius:"16px",padding:"16px",border:\`1px solid \${x.c}30\`,textAlign:"center"}}><div style={{fontSize:"1.3rem"}}>{x.i}</div><div style={{fontSize:"1.4rem",fontWeight:"900",color:x.c}}>{x.n}</div><div style={{fontSize:"0.6rem",color:"rgba(255,255,255,0.5)"}}>{x.l}</div></div>)}`
);

rep(
  `    {show&&<div className="hv-card" style={{...S.card,marginBottom:"20px",background:\`linear-gradient(135deg,\${C.goldLight},#fdf8ee)\`,border:\`2px solid \${C.gold}30\`}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div style={{gridColumn:"1/-1"}}><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>عنوان *</label><input style={S.inpSm} value={f.title} onChange={e=>setF({...f,title:e.target.value})} placeholder="سبق کا عنوان..."/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>مضمون *</label><select style={S.inpSm} value={f.subject} onChange={e=>setF({...f,subject:e.target.value})}><option value="">-- منتخب کریں --</option>{subjects.map(s=><option key={s}>{s}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>جماعت</label><input style={S.inpSm} value={f.grade} onChange={e=>setF({...f,grade:e.target.value})} placeholder="جماعت..."/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>استاد</label><select style={S.inpSm} value={f.teacherId} onChange={e=>setF({...f,teacherId:e.target.value})}><option value="">-- منتخب کریں --</option>{teachers.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>تاریخ</label><input style={{...S.inpSm,direction:"ltr"}} type="date" value={f.date} onChange={e=>setF({...f,date:e.target.value})}/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>دورانیہ (منٹ)</label><input style={{...S.inpSm,direction:"ltr"}} type="number" value={f.duration} onChange={e=>setF({...f,duration:e.target.value})}/></div>
        <div style={{gridColumn:"1/-1"}}><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>اہداف</label><textarea style={{...S.inpSm,minHeight:"60px",resize:"vertical"}} value={f.objectives} onChange={e=>setF({...f,objectives:e.target.value})} placeholder="سبق کے اہداف..."/></div>
        <div style={{gridColumn:"1/-1"}}><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>سرگرمیاں</label><textarea style={{...S.inpSm,minHeight:"60px",resize:"vertical"}} value={f.activities} onChange={e=>setF({...f,activities:e.target.value})} placeholder="کلاس میں سرگرمیاں..."/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>مواد</label><input style={S.inpSm} value={f.materials} onChange={e=>setF({...f,materials:e.target.value})} placeholder="کتاب، بورڈ..."/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>گھر کا کام</label><input style={S.inpSm} value={f.homework} onChange={e=>setF({...f,homework:e.target.value})} placeholder="ہوم ورک..."/></div>
      </div>
      <button style={S.saveBtn} onClick={add}>✅ منصوبہ محفوظ کریں</button>
    </div>}`,
  `    {show&&<div style={{...glass,padding:"24px",marginBottom:"20px",borderColor:"rgba(212,175,55,0.3)"}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div style={{gridColumn:"1/-1"}}><label style={lbl}>عنوان *</label><input style={inp} value={f.title} onChange={e=>setF({...f,title:e.target.value})} placeholder="سبق کا عنوان..."/></div>
        <div><label style={lbl}>مضمون *</label><select style={inp} value={f.subject} onChange={e=>setF({...f,subject:e.target.value})}><option value="" style={{background:N2}}>-- منتخب کریں --</option>{subjects.map(s=><option key={s} style={{background:N2}}>{s}</option>)}</select></div>
        <div><label style={lbl}>جماعت</label><input style={inp} value={f.grade} onChange={e=>setF({...f,grade:e.target.value})} placeholder="جماعت..."/></div>
        <div><label style={lbl}>استاد</label><select style={inp} value={f.teacherId} onChange={e=>setF({...f,teacherId:e.target.value})}><option value="" style={{background:N2}}>-- منتخب کریں --</option>{teachers.map(t=><option key={t.id} value={t.id} style={{background:N2}}>{t.name}</option>)}</select></div>
        <div><label style={lbl}>تاریخ</label><input style={{...inp,direction:"ltr",colorScheme:"dark"}} type="date" value={f.date} onChange={e=>setF({...f,date:e.target.value})}/></div>
        <div><label style={lbl}>دورانیہ (منٹ)</label><input style={{...inp,direction:"ltr",colorScheme:"dark"}} type="number" value={f.duration} onChange={e=>setF({...f,duration:e.target.value})}/></div>
        <div style={{gridColumn:"1/-1"}}><label style={lbl}>اہداف</label><textarea style={{...inp,minHeight:"60px",resize:"vertical"}} value={f.objectives} onChange={e=>setF({...f,objectives:e.target.value})} placeholder="سبق کے اہداف..."/></div>
        <div style={{gridColumn:"1/-1"}}><label style={lbl}>سرگرمیاں</label><textarea style={{...inp,minHeight:"60px",resize:"vertical"}} value={f.activities} onChange={e=>setF({...f,activities:e.target.value})} placeholder="کلاس میں سرگرمیاں..."/></div>
        <div><label style={lbl}>مواد</label><input style={inp} value={f.materials} onChange={e=>setF({...f,materials:e.target.value})} placeholder="کتاب، بورڈ..."/></div>
        <div><label style={lbl}>گھر کا کام</label><input style={inp} value={f.homework} onChange={e=>setF({...f,homework:e.target.value})} placeholder="ہوم ورک..."/></div>
      </div>
      <button style=${SB} onClick={add}>منصوبہ محفوظ کریں</button>
    </div>}`
);

rep(
  `      {plans.map(p=>{ const t=teachers.find(x=>x.id===p.teacherId); return <div key={p.id} className="hv-card" style={{...S.card,borderTop:\`4px solid \${C.gold}\`}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:"8px"}}><div><div style={{fontSize:"0.85rem",fontWeight:"700",color:C.navy}}>{p.title}</div><div style={{fontSize:"0.62rem",color:"#888"}}>{p.subject} • {p.grade} • {t?.name||"—"}</div></div><div style={{fontSize:"0.62rem",color:"#aaa",fontFamily:"monospace",direction:"ltr"}}>{p.date}</div></div>
        {p.objectives&&<div style={{background:"#f0fdf4",borderRadius:"8px",padding:"8px 12px",fontSize:"0.62rem",color:C.green,marginBottom:"6px"}}>🎯 {p.objectives.slice(0,100)}</div>}
        {p.homework&&<div style={{fontSize:"0.6rem",color:C.amber,fontWeight:"600"}}>📝 {p.homework}</div>}
      </div>; })}
      {plans.length===0&&<div className="hv-card" style={{...S.card,textAlign:"center",color:"#bbb",padding:"40px",gridColumn:"1/-1"}}>کوئی منصوبہ نہیں</div>}`,
  `      {plans.map(p=>{ const t=teachers.find(x=>x.id===p.teacherId); return <div key={p.id} style={{...glass,padding:"18px",borderTop:"3px solid #d4af37"}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:"8px"}}><div><div style={{fontSize:"0.85rem",fontWeight:"700",color:"#f1f5f9"}}>{p.title}</div><div style={{fontSize:"0.62rem",color:"rgba(255,255,255,0.5)"}}>{p.subject} • {p.grade} • {t?.name||"—"}</div></div><div style={{fontSize:"0.62rem",color:"rgba(255,255,255,0.35)",fontFamily:"monospace",direction:"ltr"}}>{p.date}</div></div>
        {p.objectives&&<div style={{background:"rgba(74,222,128,0.08)",borderRadius:"8px",padding:"8px 12px",fontSize:"0.62rem",color:"#4ade80",marginBottom:"6px",border:"1px solid rgba(74,222,128,0.15)"}}>🎯 {p.objectives.slice(0,100)}</div>}
        {p.homework&&<div style={{fontSize:"0.6rem",color:"#fb923c",fontWeight:"600"}}>📝 {p.homework}</div>}
      </div>; })}
      {plans.length===0&&<div style={{...glass,textAlign:"center",color:"rgba(255,255,255,0.3)",padding:"40px",gridColumn:"1/-1"}}>کوئی منصوبہ نہیں</div>}`
);

console.log('LessonPlans done:', n);

// ===================== CLASS ANALYTICS =====================
rep(
  `  return <div style={S.page}>
    <div style={{fontSize:"1.1rem",fontWeight:"700",color:C.navy,marginBottom:"6px"}}>📊 کلاس تجزیہ</div>`,
  `${TV}
  return <div style=${DARK_WRAP}>
    <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"24px"}}>
      <div style={{width:"44px",height:"44px",borderRadius:"12px",background:"linear-gradient(135deg,#d4af37,#b8960a)",display:"flex",alignItems:"center",justifyContent:"center"}}><span className="material-symbols-rounded" style={{fontSize:"24px",color:N}}>insights</span></div>
      <div><h2 style={{margin:0,fontSize:"1.4rem",fontWeight:"800",color:"#f1f5f9"}}>کلاس تجزیہ</h2></div>
    </div>
    <div style={{marginBottom:"4px",display:"none"}}>`
);

// ClassAnalytics old stats
rep(
  `      {[{c:C.navy,i:"👥",n:filtered.length,l:"طلبا"},{c:overallAvg>=70?C.green:C.amber,i:"📈",n:\`\${overallAvg}%\`,l:"اوسط نتیجہ"}].map((x,i)=><div key={i} style={{background:\`linear-gradient(135deg,\${x.c}12,\${x.c}05)\`,borderRadius:"16px",padding:"16px",border:\`2px solid \${x.c}20\`,textAlign:"center"}}><div style={{fontSize:"1.3rem"}}>{x.i}</div><div style={{fontSize:"1.4rem",fontWeight:"900",color:x.c}}>{x.n}</div><div style={{fontSize:"0.6rem",color:"#888"}}>{x.l}</div></div>)}`,
  `      {[{c:"#60a5fa",i:"👥",n:filtered.length,l:"طلبا"},{c:overallAvg>=70?"#4ade80":"#fb923c",i:"📈",n:\`\${overallAvg}%\`,l:"اوسط نتیجہ"}].map((x,i)=><div key={i} style={{background:\`\${x.c}15\`,borderRadius:"16px",padding:"16px",border:\`1px solid \${x.c}30\`,textAlign:"center"}}><div style={{fontSize:"1.3rem"}}>{x.i}</div><div style={{fontSize:"1.4rem",fontWeight:"900",color:x.c}}>{x.n}</div><div style={{fontSize:"0.6rem",color:"rgba(255,255,255,0.5)"}}>{x.l}</div></div>)}`
);

// ClassAnalytics cards
rep(
  `      <div style={S.card} className="hv-card"><div style={{fontSize:"0.85rem",fontWeight:"700",color:C.navy,marginBottom:"16px"}}>🏠 ہاؤس کارکردگی`,
  `      <div style={{...glass,padding:"20px"}}><div style={{fontSize:"0.85rem",fontWeight:"700",color:"#d4af37",marginBottom:"16px"}}>🏠 ہاؤس کارکردگی`
);

rep(
  `        {houseData.map(h=><div key={h.id} style={{marginBottom:"14px"}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:"4px"}}><span style={{fontSize:"0.72rem",fontWeight:"700"}}>{h.emoji} {h.nameEn}</span><span style={{fontSize:"0.72rem",fontWeight:"800",color:h.color||C.gold}}>{h.avg}%</span></div>{pBar(h.avg,100,h.color||C.gold)}<div style={{fontSize:"0.58rem",color:"#aaa",marginTop:"2px"}}>{h.count} طلبا</div></div>)}
      </div>`,
  `        {houseData.map(h=><div key={h.id} style={{marginBottom:"14px"}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:"4px"}}><span style={{fontSize:"0.72rem",fontWeight:"700",color:"#f1f5f9"}}>{h.emoji} {h.nameEn}</span><span style={{fontSize:"0.72rem",fontWeight:"800",color:h.color||"#d4af37"}}>{h.avg}%</span></div>{pBar(h.avg,100,h.color||"#d4af37")}<div style={{fontSize:"0.58rem",color:"rgba(255,255,255,0.35)",marginTop:"2px"}}>{h.count} طلبا</div></div>)}
      </div>`
);

rep(
  `      <div style={S.card} className="hv-card"><div style={{fontSize:"0.85rem",fontWeight:"700",color:C.navy,marginBottom:"16px"}}>🏆 سرفہرست طلبا`,
  `      <div style={{...glass,padding:"20px"}}><div style={{fontSize:"0.85rem",fontWeight:"700",color:"#d4af37",marginBottom:"16px"}}>🏆 سرفہرست طلبا`
);

rep(
  `          <span>{h.emoji||"👤"}</span><div style={{flex:1}}><div style={{fontSize:"0.68rem",fontWeight:"700",color:C.navy}}>{s.name}</div><div style={{fontSize:"0.58rem",color:"#888"}}>{s.grade}</div></div>`,
  `          <span>{h.emoji||"👤"}</span><div style={{flex:1}}><div style={{fontSize:"0.68rem",fontWeight:"700",color:"#f1f5f9"}}>{s.name}</div><div style={{fontSize:"0.58rem",color:"rgba(255,255,255,0.45)"}}>{s.grade}</div></div>`
);

rep(
  `    <div style={S.card} className="hv-card"><div style={{fontSize:"0.85rem",fontWeight:"700",color:C.navy,marginBottom:"16px"}}>📚 مضمون کارکردگی`,
  `    <div style={{...glass,padding:"20px"}}><div style={{fontSize:"0.85rem",fontWeight:"700",color:"#d4af37",marginBottom:"16px"}}>📚 مضمون کارکردگی`
);

rep(
  `        {Object.entries(subjectData).map(([sub,data])=>{ const avg=Math.round(data.total/data.count); return <div key={sub} style={{marginBottom:"12px"}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:"4px"}}><span style={{fontSize:"0.7rem",fontWeight:"700",color:C.navy}}>{sub}</span><span style={{fontSize:"0.7rem",fontWeight:"800",color:avg>=70?C.green:avg>=50?C.amber:C.red}}>{avg}%</span></div>{pBar(avg,100,avg>=70?C.green:avg>=50?C.amber:C.red)}<div style={{fontSize:"0.58rem",color:"#aaa",marginTop:"2px"}}>{data.count} نتائج</div></div>; })}`,
  `        {Object.entries(subjectData).map(([sub,data])=>{ const avg=Math.round(data.total/data.count); return <div key={sub} style={{marginBottom:"12px"}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:"4px"}}><span style={{fontSize:"0.7rem",fontWeight:"700",color:"#f1f5f9"}}>{sub}</span><span style={{fontSize:"0.7rem",fontWeight:"800",color:avg>=70?"#4ade80":avg>=50?"#fb923c":"#f87171"}}>{avg}%</span></div>{pBar(avg,100,avg>=70?"#4ade80":avg>=50?"#fb923c":"#f87171")}<div style={{fontSize:"0.58rem",color:"rgba(255,255,255,0.35)",marginTop:"2px"}}>{data.count} نتائج</div></div>; })}`
);

console.log('ClassAnalytics done:', n);

// ===================== TRANSCRIPT REQUEST =====================
rep(
  `  return <div style={S.page}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
      <div><div style={{fontSize:"1.1rem",fontWeight:"700",color:C.navy}}>📜 ٹرانسکرپٹ درخواست</div><div style={{fontSize:"0.62rem",color:"#888",marginTop:"2px"}}>Transcript Requests — دستاویزات</div></div>
      <button style={S.addBtn} onClick={()=>setShow(!show)}>+ نئی درخواست</button>
    </div>`,
  `${TV}
  return <div style=${DARK_WRAP}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"24px",flexWrap:"wrap",gap:"12px"}}>
      <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
        <div style={{width:"44px",height:"44px",borderRadius:"12px",background:"linear-gradient(135deg,#d4af37,#b8960a)",display:"flex",alignItems:"center",justifyContent:"center"}}><span className="material-symbols-rounded" style={{fontSize:"24px",color:N}}>description</span></div>
        <div><h2 style={{margin:0,fontSize:"1.4rem",fontWeight:"800",color:"#f1f5f9"}}>ٹرانسکرپٹ درخواست</h2><p style={{margin:0,fontSize:"0.72rem",color:"rgba(212,175,55,0.7)"}}>دستاویزات</p></div>
      </div>
      <button style={{display:"flex",alignItems:"center",gap:"8px",padding:"10px 20px",borderRadius:"12px",border:"1px solid #d4af37",background:show?"rgba(212,175,55,0.15)":"transparent",color:"#d4af37",fontWeight:"700",fontSize:"0.82rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif"}} onClick={()=>setShow(!show)}><span className="material-symbols-rounded" style={{fontSize:"18px"}}>{show?"close":"add_circle"}</span>{show?"منسوخ":"نئی درخواست"}</button>
    </div>`
);

rep(
  `    {show&&<div className="hv-card" style={{...S.card,marginBottom:"20px",background:\`linear-gradient(135deg,\${C.goldLight},#fdf8ee)\`,border:\`2px solid \${C.gold}30\`}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>طالب علم *</label><select style={S.inpSm} value={f.studentId} onChange={e=>setF({...f,studentId:e.target.value})}><option value="">-- منتخب کریں --</option>{students.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>مقصد</label><select style={S.inpSm} value={f.purpose} onChange={e=>setF({...f,purpose:e.target.value})}>{Object.entries(purposes).map(([k,v])=><option key={k} value={k}>{v.i} {v.l}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>ادارہ</label><input style={S.inpSm} value={f.institution} onChange={e=>setF({...f,institution:e.target.value})} placeholder="جامعہ، کالج..."/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>عجلت</label><select style={S.inpSm} value={f.urgency} onChange={e=>setF({...f,urgency:e.target.value})}>{Object.entries(urgencies).map(([k,v])=><option key={k} value={k}>{v.l}</option>)}</select></div>
        <div style={{gridColumn:"1/-1"}}><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>نوٹ</label><textarea style={{...S.inpSm,minHeight:"60px",resize:"vertical"}} value={f.notes} onChange={e=>setF({...f,notes:e.target.value})} placeholder="اضافی معلومات..."/></div>
      </div>
      <button style={S.saveBtn} onClick={add}>✅ درخواست جمع کریں</button>
    </div>}`,
  `    {show&&<div style={{...glass,padding:"24px",marginBottom:"20px",borderColor:"rgba(212,175,55,0.3)"}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div><label style={lbl}>طالب علم *</label><select style={inp} value={f.studentId} onChange={e=>setF({...f,studentId:e.target.value})}><option value="" style={{background:N2}}>-- منتخب کریں --</option>{students.map(s=><option key={s.id} value={s.id} style={{background:N2}}>{s.name}</option>)}</select></div>
        <div><label style={lbl}>مقصد</label><select style={inp} value={f.purpose} onChange={e=>setF({...f,purpose:e.target.value})}>{Object.entries(purposes).map(([k,v])=><option key={k} value={k} style={{background:N2}}>{v.i} {v.l}</option>)}</select></div>
        <div><label style={lbl}>ادارہ</label><input style={inp} value={f.institution} onChange={e=>setF({...f,institution:e.target.value})} placeholder="جامعہ، کالج..."/></div>
        <div><label style={lbl}>عجلت</label><select style={inp} value={f.urgency} onChange={e=>setF({...f,urgency:e.target.value})}>{Object.entries(urgencies).map(([k,v])=><option key={k} value={k} style={{background:N2}}>{v.l}</option>)}</select></div>
        <div style={{gridColumn:"1/-1"}}><label style={lbl}>نوٹ</label><textarea style={{...inp,minHeight:"60px",resize:"vertical"}} value={f.notes} onChange={e=>setF({...f,notes:e.target.value})} placeholder="اضافی معلومات..."/></div>
      </div>
      <button style=${SB} onClick={add}>درخواست جمع کریں</button>
    </div>}`
);

rep(
  `      {requests.map(r=>{ const p=purposes[r.purpose]||purposes.personal; const u=urgencies[r.urgency]||urgencies.normal; const st=students.find(x=>x.id===r.studentId); return <div key={r.id} className="hv-card" style={{...S.card,borderRight:\`4px solid \${p.c}\`}}>`,
  `      {requests.map(r=>{ const p=purposes[r.purpose]||purposes.personal; const u=urgencies[r.urgency]||urgencies.normal; const st=students.find(x=>x.id===r.studentId); return <div key={r.id} style={{...glass,padding:"18px 20px",borderRight:\`3px solid \${p.c}\`}}>`
);

rep(
  `          <div><div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"4px"}}><span>{p.i}</span><span style={{fontSize:"0.82rem",fontWeight:"700",color:C.navy}}>{st?.name||"—"}</span></div><div style={{fontSize:"0.6rem",color:"#888"}}>{p.l} • {r.institution||"—"}</div></div>`,
  `          <div><div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"4px"}}><span>{p.i}</span><span style={{fontSize:"0.82rem",fontWeight:"700",color:"#f1f5f9"}}>{st?.name||"—"}</span></div><div style={{fontSize:"0.6rem",color:"rgba(255,255,255,0.5)"}}>{p.l} • {r.institution||"—"}</div></div>`
);

rep(
  `        {r.status==="pending"&&<button onClick={()=>approve(r.id)} style={{...S.saveBtn,padding:"6px 14px",fontSize:"0.65rem"}}>✅ منظور کریں</button>}`,
  `        {r.status==="pending"&&<button onClick={()=>approve(r.id)} style={{background:"linear-gradient(135deg,#d4af37,#b8960a)",color:N,border:"none",borderRadius:"8px",padding:"6px 14px",fontSize:"0.65rem",cursor:"pointer",fontWeight:"700"}}>منظور کریں</button>}`
);

rep(
  `      {requests.length===0&&<div className="hv-card" style={{...S.card,textAlign:"center",color:"#bbb",padding:"60px"}}>کوئی درخواست نہیں</div>}`,
  `      {requests.length===0&&<div style={{...glass,textAlign:"center",color:"rgba(255,255,255,0.3)",padding:"60px"}}>کوئی درخواست نہیں</div>}`
);

console.log('TranscriptRequest done:', n);

// ===================== TEACHER LEAVE =====================
rep(
  `  return <div style={S.page}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
      <div><div style={{fontSize:"1.1rem",fontWeight:"700",color:C.navy}}>🏖️ چھٹی درخواست</div><div style={{fontSize:"0.62rem",color:"#888",marginTop:"2px"}}>اساتذہ کی چھٹی — اجازت و منظوری</div></div>
      <button style={S.addBtn} onClick={()=>setShow(!show)}>+ نئی درخواست</button>
    </div>`,
  `${TV}
  return <div style=${DARK_WRAP}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"24px",flexWrap:"wrap",gap:"12px"}}>
      <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
        <div style={{width:"44px",height:"44px",borderRadius:"12px",background:"linear-gradient(135deg,#d4af37,#b8960a)",display:"flex",alignItems:"center",justifyContent:"center"}}><span className="material-symbols-rounded" style={{fontSize:"24px",color:N}}>beach_access</span></div>
        <div><h2 style={{margin:0,fontSize:"1.4rem",fontWeight:"800",color:"#f1f5f9"}}>چھٹی درخواست</h2><p style={{margin:0,fontSize:"0.72rem",color:"rgba(212,175,55,0.7)"}}>اساتذہ کی چھٹی — اجازت و منظوری</p></div>
      </div>
      <button style={{display:"flex",alignItems:"center",gap:"8px",padding:"10px 20px",borderRadius:"12px",border:"1px solid #d4af37",background:show?"rgba(212,175,55,0.15)":"transparent",color:"#d4af37",fontWeight:"700",fontSize:"0.82rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif"}} onClick={()=>setShow(!show)}><span className="material-symbols-rounded" style={{fontSize:"18px"}}>{show?"close":"add_circle"}</span>{show?"منسوخ":"نئی درخواست"}</button>
    </div>`
);

rep(
  `    {pending.length>0&&<div className="hv-card" style={{...S.card,marginBottom:"20px",background:"linear-gradient(135deg,#fef3c7,#fffbeb)"}}>
      <div style={{fontSize:"0.82rem",fontWeight:"700",color:C.amber,marginBottom:"12px"}}>⏳ منظوری درکار ({pending.length})</div>`,
  `    {pending.length>0&&<div style={{...glass,padding:"20px",marginBottom:"20px",borderColor:"rgba(251,191,36,0.3)"}}>
      <div style={{fontSize:"0.82rem",fontWeight:"700",color:"#fbbf24",marginBottom:"12px"}}>⏳ منظوری درکار ({pending.length})</div>`
);

rep(
  `        <div><div style={{fontSize:"0.75rem",fontWeight:"700",color:C.navy}}>{tp.i} {t?.name||"—"}</div><div style={{fontSize:"0.62rem",color:"#888"}}>{l.startDate} — {l.endDate}</div></div>`,
  `        <div><div style={{fontSize:"0.75rem",fontWeight:"700",color:"#f1f5f9"}}>{tp.i} {t?.name||"—"}</div><div style={{fontSize:"0.62rem",color:"rgba(255,255,255,0.5)"}}>{l.startDate} — {l.endDate}</div></div>`
);

rep(
  `        <div style={{display:"flex",gap:"6px"}}><button onClick={()=>approve(l.id,"approved")} style={{...S.saveBtn,padding:"6px 12px",fontSize:"0.62rem"}}>✅ منظور</button><button onClick={()=>approve(l.id,"rejected")} style={{...S.saveBtn,padding:"6px 12px",fontSize:"0.62rem",background:\`linear-gradient(135deg,\${C.red},#b91c1c)\`}}>❌ مسترد</button></div>`,
  `        <div style={{display:"flex",gap:"6px"}}><button onClick={()=>approve(l.id,"approved")} style={{background:"linear-gradient(135deg,#4ade80,#16a34a)",color:"#0f172a",border:"none",borderRadius:"8px",padding:"6px 12px",fontSize:"0.62rem",cursor:"pointer",fontWeight:"700"}}>منظور</button><button onClick={()=>approve(l.id,"rejected")} style={{background:"linear-gradient(135deg,#f87171,#b91c1c)",color:"#fff",border:"none",borderRadius:"8px",padding:"6px 12px",fontSize:"0.62rem",cursor:"pointer",fontWeight:"700"}}>مسترد</button></div>`
);

rep(
  `    {show&&<div className="hv-card" style={{...S.card,marginBottom:"20px",background:\`linear-gradient(135deg,\${C.goldLight},#fdf8ee)\`,border:\`2px solid \${C.gold}30\`}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>استاد *</label><select style={S.inpSm} value={f.teacherId} onChange={e=>setF({...f,teacherId:e.target.value})}><option value="">-- منتخب کریں --</option>{teachers.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>قسم</label><select style={S.inpSm} value={f.type} onChange={e=>setF({...f,type:e.target.value})}>{Object.entries(leaveTypes).map(([k,v])=><option key={k} value={k}>{v.i} {v.l}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>شروع *</label><input style={{...S.inpSm,direction:"ltr"}} type="date" value={f.startDate} onChange={e=>setF({...f,startDate:e.target.value})}/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>ختم</label><input style={{...S.inpSm,direction:"ltr"}} type="date" value={f.endDate} onChange={e=>setF({...f,endDate:e.target.value})}/></div>
        <div style={{gridColumn:"1/-1"}}><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>وجہ</label><textarea style={{...S.inpSm,minHeight:"60px",resize:"vertical"}} value={f.reason} onChange={e=>setF({...f,reason:e.target.value})} placeholder="چھٹی کی وجہ..."/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>متبادل استاد</label><input style={S.inpSm} value={f.substitute} onChange={e=>setF({...f,substitute:e.target.value})} placeholder="متبادل استاد کا نام..."/></div>
      </div>
      <button style={S.saveBtn} onClick={add}>✅ درخواست جمع کریں</button>
    </div>}`,
  `    {show&&<div style={{...glass,padding:"24px",marginBottom:"20px",borderColor:"rgba(212,175,55,0.3)"}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div><label style={lbl}>استاد *</label><select style={inp} value={f.teacherId} onChange={e=>setF({...f,teacherId:e.target.value})}><option value="" style={{background:N2}}>-- منتخب کریں --</option>{teachers.map(t=><option key={t.id} value={t.id} style={{background:N2}}>{t.name}</option>)}</select></div>
        <div><label style={lbl}>قسم</label><select style={inp} value={f.type} onChange={e=>setF({...f,type:e.target.value})}>{Object.entries(leaveTypes).map(([k,v])=><option key={k} value={k} style={{background:N2}}>{v.i} {v.l}</option>)}</select></div>
        <div><label style={lbl}>شروع *</label><input style={{...inp,direction:"ltr",colorScheme:"dark"}} type="date" value={f.startDate} onChange={e=>setF({...f,startDate:e.target.value})}/></div>
        <div><label style={lbl}>ختم</label><input style={{...inp,direction:"ltr",colorScheme:"dark"}} type="date" value={f.endDate} onChange={e=>setF({...f,endDate:e.target.value})}/></div>
        <div style={{gridColumn:"1/-1"}}><label style={lbl}>وجہ</label><textarea style={{...inp,minHeight:"60px",resize:"vertical"}} value={f.reason} onChange={e=>setF({...f,reason:e.target.value})} placeholder="چھٹی کی وجہ..."/></div>
        <div><label style={lbl}>متبادل استاد</label><input style={inp} value={f.substitute} onChange={e=>setF({...f,substitute:e.target.value})} placeholder="متبادل استاد کا نام..."/></div>
      </div>
      <button style=${SB} onClick={add}>درخواست جمع کریں</button>
    </div>}`
);

rep(
  `    <div style={S.card} className="hv-card"><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}>
      <thead><tr><th style={S.th}>استاد</th><th style={S.th}>قسم</th><th style={S.th}>تاریخ</th><th style={S.th}>حال</th>`,
  `    <div style={{...glass,overflow:"hidden"}}><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}>
      <thead><tr style={{background:"rgba(255,255,255,0.04)"}}><th style={{padding:"12px 14px",textAlign:"right",fontSize:"0.65rem",color:"rgba(212,175,55,0.8)",fontWeight:"700"}}>استاد</th><th style={{padding:"12px 14px",textAlign:"right",fontSize:"0.65rem",color:"rgba(212,175,55,0.8)",fontWeight:"700"}}>قسم</th><th style={{padding:"12px 14px",textAlign:"right",fontSize:"0.65rem",color:"rgba(212,175,55,0.8)",fontWeight:"700"}}>تاریخ</th><th style={{padding:"12px 14px",textAlign:"right",fontSize:"0.65rem",color:"rgba(212,175,55,0.8)",fontWeight:"700"}}>حال</th>`
);

// Find and read TeacherLeave table body
rep(
  `      <tbody>{leaves.map(l=>{ const t=teachers.find(x=>x.id===l.teacherId); const tp=leaveTypes[l.type]||leaveTypes.sick; return <tr key={l.id}>
        <td style={{...S.td,fontWeight:"700"}}>{t?.name||"—"}</td>
        <td style={S.td}><span>{tp.i} {tp.l}</span></td>
        <td style={{...S.td,fontFamily:"monospace",direction:"ltr",fontSize:"0.6rem"}}>{l.startDate} → {l.endDate}</td>
        <td style={S.td}><span style={{padding:"3px 8px",borderRadius:"20px",fontSize:"0.55rem",fontWeight:"700",background:l.status==="approved"?"#dcfce7":l.status==="rejected"?"#fee2e2":"#fef3c7",color:l.status==="approved"?C.green:l.status==="rejected"?C.red:C.amber}}>{l.status==="approved"?"✅ منظور":l.status==="rejected"?"❌ مسترد":"⏳ زیرغور"}</span></td>
      </tr>; })}{leaves.length===0&&<tr><td colSpan={4} style={{...S.td,textAlign:"center",color:"#bbb",padding:"40px"}}>کوئی درخواست نہیں</td></tr>}</tbody>`,
  `      <tbody>{leaves.map((l,ri)=>{ const t=teachers.find(x=>x.id===l.teacherId); const tp=leaveTypes[l.type]||leaveTypes.sick; return <tr key={l.id} style={{background:ri%2===0?"rgba(255,255,255,0.02)":"transparent"}}>
        <td style={{padding:"11px 14px",color:"#f1f5f9",fontWeight:"700",fontSize:"0.75rem",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>{t?.name||"—"}</td>
        <td style={{padding:"11px 14px",color:"rgba(255,255,255,0.7)",fontSize:"0.75rem",borderBottom:"1px solid rgba(255,255,255,0.05)"}}><span>{tp.i} {tp.l}</span></td>
        <td style={{padding:"11px 14px",fontFamily:"monospace",direction:"ltr",fontSize:"0.6rem",color:"rgba(255,255,255,0.6)",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>{l.startDate} → {l.endDate}</td>
        <td style={{padding:"11px 14px",borderBottom:"1px solid rgba(255,255,255,0.05)"}}><span style={{padding:"3px 8px",borderRadius:"20px",fontSize:"0.55rem",fontWeight:"700",background:l.status==="approved"?"rgba(74,222,128,0.15)":l.status==="rejected"?"rgba(248,113,113,0.15)":"rgba(251,191,36,0.15)",color:l.status==="approved"?"#4ade80":l.status==="rejected"?"#f87171":"#fbbf24"}}>{l.status==="approved"?"✅ منظور":l.status==="rejected"?"❌ مسترد":"⏳ زیرغور"}</span></td>
      </tr>; })}{leaves.length===0&&<tr><td colSpan={4} style={{padding:"40px",textAlign:"center",color:"rgba(255,255,255,0.3)"}}>کوئی درخواست نہیں</td></tr>}</tbody>`
);

console.log('TeacherLeave done:', n);

// ===================== LEARNING MATERIALS =====================
rep(
  `  return <div style={S.page}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
      <div><div style={{fontSize:"1.1rem",fontWeight:"700",color:C.navy}}>📚 تعلیمی مواد</div><div style={{fontSize:"0.62rem",color:"#888",marginTop:"2px"}}>ڈاؤنلوڈ، ویڈیو، اسائنمنٹ</div></div>
      <button style={S.addBtn} onClick={()=>setShow(!show)}>+ نیا مواد</button>
    </div>`,
  `${TV}
  return <div style=${DARK_WRAP}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"24px",flexWrap:"wrap",gap:"12px"}}>
      <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
        <div style={{width:"44px",height:"44px",borderRadius:"12px",background:"linear-gradient(135deg,#d4af37,#b8960a)",display:"flex",alignItems:"center",justifyContent:"center"}}><span className="material-symbols-rounded" style={{fontSize:"24px",color:N}}>menu_book</span></div>
        <div><h2 style={{margin:0,fontSize:"1.4rem",fontWeight:"800",color:"#f1f5f9"}}>تعلیمی مواد</h2><p style={{margin:0,fontSize:"0.72rem",color:"rgba(212,175,55,0.7)"}}>ڈاؤنلوڈ، ویڈیو، اسائنمنٹ</p></div>
      </div>
      <button style={{display:"flex",alignItems:"center",gap:"8px",padding:"10px 20px",borderRadius:"12px",border:"1px solid #d4af37",background:show?"rgba(212,175,55,0.15)":"transparent",color:"#d4af37",fontWeight:"700",fontSize:"0.82rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif"}} onClick={()=>setShow(!show)}><span className="material-symbols-rounded" style={{fontSize:"18px"}}>{show?"close":"add_circle"}</span>{show?"منسوخ":"نیا مواد"}</button>
    </div>`
);

rep(
  `    <div style={{display:"flex",gap:"8px",marginBottom:"16px",flexWrap:"wrap"}}>
      {[["all","📦 سب"],...Object.entries(types).map(([k,v])=>[k,\`\${v.i} \${v.l}\`])].map(([t,l])=><button key={t} onClick={()=>setFilter(t)} style={{padding:"6px 12px",borderRadius:"20px",border:"none",cursor:"pointer",fontSize:"0.62rem",fontWeight:filter===t?"700":"400",background:filter===t?\`linear-gradient(135deg,\${C.gold},\${C.goldDark})\`:C.white,color:filter===t?C.white:"#888",fontFamily:"inherit"}}>{l}</button>)}
    </div>`,
  `    <div style={{display:"flex",gap:"8px",marginBottom:"16px",flexWrap:"wrap"}}>
      {[["all","📦 سب"],...Object.entries(types).map(([k,v])=>[k,\`\${v.i} \${v.l}\`])].map(([t,l])=><button key={t} onClick={()=>setFilter(t)} style={{padding:"6px 12px",borderRadius:"20px",border:filter===t?"none":"1px solid rgba(255,255,255,0.1)",cursor:"pointer",fontSize:"0.62rem",fontWeight:filter===t?"700":"400",background:filter===t?"linear-gradient(135deg,#d4af37,#b8960a)":"rgba(255,255,255,0.04)",color:filter===t?"#0f172a":"rgba(255,255,255,0.6)",fontFamily:"inherit"}}>{l}</button>)}
    </div>`
);

rep(
  `    {show&&<div className="hv-card" style={{...S.card,marginBottom:"20px",background:\`linear-gradient(135deg,\${C.goldLight},#fdf8ee)\`,border:\`2px solid \${C.gold}30\`}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div style={{gridColumn:"1/-1"}}><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>عنوان *</label><input style={S.inpSm} value={f.title} onChange={e=>setF({...f,title:e.target.value})} placeholder="مواد کا نام..."/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>قسم</label><select style={S.inpSm} value={f.type} onChange={e=>setF({...f,type:e.target.value})}>{Object.entries(types).map(([k,v])=><option key={k} value={k}>{v.i} {v.l}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>مضمون</label><input style={S.inpSm} value={f.subject} onChange={e=>setF({...f,subject:e.target.value})} placeholder="ریاضی..."/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>جماعت</label><input style={S.inpSm} value={f.grade} onChange={e=>setF({...f,grade:e.target.value})} placeholder="8..."/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>استاد</label><select style={S.inpSm} value={f.teacherId} onChange={e=>setF({...f,teacherId:e.target.value})}><option value="">-- منتخب کریں --</option>{teachers.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
        <div style={{gridColumn:"1/-1"}}><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>لنک</label><input style={{...S.inpSm,direction:"ltr"}} value={f.link} onChange={e=>setF({...f,link:e.target.value})} placeholder="https://..."/></div>
        <div style={{gridColumn:"1/-1"}}><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>تفصیل</label><textarea style={{...S.inpSm,minHeight:"60px",resize:"vertical"}} value={f.description} onChange={e=>setF({...f,description:e.target.value})} placeholder="مختصر تفصیل..."/></div>
      </div>
      <button style={S.saveBtn} onClick={add}>✅ شامل کریں</button>
    </div>}`,
  `    {show&&<div style={{...glass,padding:"24px",marginBottom:"20px",borderColor:"rgba(212,175,55,0.3)"}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div style={{gridColumn:"1/-1"}}><label style={lbl}>عنوان *</label><input style={inp} value={f.title} onChange={e=>setF({...f,title:e.target.value})} placeholder="مواد کا نام..."/></div>
        <div><label style={lbl}>قسم</label><select style={inp} value={f.type} onChange={e=>setF({...f,type:e.target.value})}>{Object.entries(types).map(([k,v])=><option key={k} value={k} style={{background:N2}}>{v.i} {v.l}</option>)}</select></div>
        <div><label style={lbl}>مضمون</label><input style={inp} value={f.subject} onChange={e=>setF({...f,subject:e.target.value})} placeholder="ریاضی..."/></div>
        <div><label style={lbl}>جماعت</label><input style={inp} value={f.grade} onChange={e=>setF({...f,grade:e.target.value})} placeholder="8..."/></div>
        <div><label style={lbl}>استاد</label><select style={inp} value={f.teacherId} onChange={e=>setF({...f,teacherId:e.target.value})}><option value="" style={{background:N2}}>-- منتخب کریں --</option>{teachers.map(t=><option key={t.id} value={t.id} style={{background:N2}}>{t.name}</option>)}</select></div>
        <div style={{gridColumn:"1/-1"}}><label style={lbl}>لنک</label><input style={{...inp,direction:"ltr"}} value={f.link} onChange={e=>setF({...f,link:e.target.value})} placeholder="https://..."/></div>
        <div style={{gridColumn:"1/-1"}}><label style={lbl}>تفصیل</label><textarea style={{...inp,minHeight:"60px",resize:"vertical"}} value={f.description} onChange={e=>setF({...f,description:e.target.value})} placeholder="مختصر تفصیل..."/></div>
      </div>
      <button style=${SB} onClick={add}>شامل کریں</button>
    </div>}`
);

rep(
  `      {filtered.map(m=>{ const tc=types[m.type]||types.link; const t=teachers.find(x=>x.id===m.teacherId); return <div key={m.id} className="hv-card" style={{...S.card,borderTop:\`4px solid \${tc.c}\`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"8px"}}><div style={{flex:1,display:"flex",alignItems:"center",gap:"6px"}}><span style={{fontSize:"1.1rem"}}>{tc.i}</span><span style={{fontSize:"0.8rem",fontWeight:"700",color:C.navy}}>{m.title}</span></div><span style={hBadge(tc.c,tc.bg)}>{tc.l}</span></div>
        {m.subject&&<div style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px"}}>📖 {m.subject}{m.grade&&\` • جماعت \${m.grade}\`}</div>}
        {t&&<div style={{fontSize:"0.62rem",color:"#888",marginBottom:"6px"}}>👤 {t.name}</div>}
        {m.description&&<div style={{fontSize:"0.62rem",color:"#666",lineHeight:"1.5",marginBottom:"8px"}}>{m.description.slice(0,80)}</div>}
        {m.link&&<a href={m.link} target="_blank" rel="noreferrer" style={{display:"inline-block",background:\`linear-gradient(135deg,\${tc.c},\${tc.c}cc)\`,color:C.white,padding:"6px 14px",borderRadius:"8px",fontSize:"0.62rem",fontWeight:"700",textDecoration:"none",direction:"ltr"}}>⬇️ کھولیں</a>}
      </div>; })}
      {filtered.length===0&&<div className="hv-card" style={{...S.card,textAlign:"center",color:"#bbb",padding:"40px",gridColumn:"1/-1"}}>کوئی مواد نہیں</div>}`,
  `      {filtered.map(m=>{ const tc=types[m.type]||types.link; const t=teachers.find(x=>x.id===m.teacherId); return <div key={m.id} style={{...glass,padding:"18px",borderTop:\`3px solid \${tc.c}\`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"8px"}}><div style={{flex:1,display:"flex",alignItems:"center",gap:"6px"}}><span style={{fontSize:"1.1rem"}}>{tc.i}</span><span style={{fontSize:"0.8rem",fontWeight:"700",color:"#f1f5f9"}}>{m.title}</span></div><span style={{padding:"3px 8px",borderRadius:"20px",fontSize:"0.6rem",fontWeight:"700",background:\`\${tc.c}20\`,color:tc.c}}>{tc.l}</span></div>
        {m.subject&&<div style={{fontSize:"0.62rem",color:"rgba(255,255,255,0.5)",marginBottom:"4px"}}>📖 {m.subject}{m.grade&&\` • جماعت \${m.grade}\`}</div>}
        {t&&<div style={{fontSize:"0.62rem",color:"rgba(255,255,255,0.5)",marginBottom:"6px"}}>👤 {t.name}</div>}
        {m.description&&<div style={{fontSize:"0.62rem",color:"rgba(255,255,255,0.45)",lineHeight:"1.5",marginBottom:"8px"}}>{m.description.slice(0,80)}</div>}
        {m.link&&<a href={m.link} target="_blank" rel="noreferrer" style={{display:"inline-block",background:\`linear-gradient(135deg,\${tc.c},\${tc.c}cc)\`,color:"#fff",padding:"6px 14px",borderRadius:"8px",fontSize:"0.62rem",fontWeight:"700",textDecoration:"none",direction:"ltr"}}>⬇️ کھولیں</a>}
      </div>; })}
      {filtered.length===0&&<div style={{...glass,textAlign:"center",color:"rgba(255,255,255,0.3)",padding:"40px",gridColumn:"1/-1"}}>کوئی مواد نہیں</div>}`
);

console.log('LearningMaterials done:', n);
fs.writeFileSync(path, content, 'utf8');
console.log('Saved. Total:', n);
