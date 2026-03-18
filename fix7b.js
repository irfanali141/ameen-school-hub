/* eslint-disable */
const fs = require('fs');
const path = 'e:/app pic/AII Main Project/ameen-school-hub/src/App.js';
let content = fs.readFileSync(path, 'utf8');
let n = 0;
function rep(o, r) { if (content.includes(o)) { content = content.split(o).join(r); n++; return true; } console.log('NOT FOUND:', o.slice(0,100)); return false; }

const N2 = '"#1e293b"';
const GLASS = `{background:"rgba(255,255,255,0.07)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:"16px"}`;

// LessonPlans - fix form (different placeholder in actual file: "8، 9..." not "جماعت...")
rep(
  `    {show&&<div className="hv-card" style={{...S.card,marginBottom:"20px",background:\`linear-gradient(135deg,\${C.goldLight},#fdf8ee)\`,border:\`2px solid \${C.gold}30\`}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div style={{gridColumn:"1/-1"}}><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>عنوان *</label><input style={S.inpSm} value={f.title} onChange={e=>setF({...f,title:e.target.value})} placeholder="سبق کا عنوان..."/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>مضمون *</label><select style={S.inpSm} value={f.subject} onChange={e=>setF({...f,subject:e.target.value})}><option value="">-- منتخب کریں --</option>{subjects.map(s=><option key={s}>{s}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>جماعت</label><input style={S.inpSm} value={f.grade} onChange={e=>setF({...f,grade:e.target.value})} placeholder="8، 9..."/>`,
  `    {show&&<div style={{...glass,padding:"24px",marginBottom:"20px",borderColor:"rgba(212,175,55,0.3)"}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div style={{gridColumn:"1/-1"}}><label style={lbl}>عنوان *</label><input style={inp} value={f.title} onChange={e=>setF({...f,title:e.target.value})} placeholder="سبق کا عنوان..."/></div>
        <div><label style={lbl}>مضمون *</label><select style={inp} value={f.subject} onChange={e=>setF({...f,subject:e.target.value})}><option value="" style={{background:N2}}>-- منتخب کریں --</option>{subjects.map(s=><option key={s} style={{background:N2}}>{s}</option>)}</select></div>
        <div><label style={lbl}>جماعت</label><input style={inp} value={f.grade} onChange={e=>setF({...f,grade:e.target.value})} placeholder="8، 9..."/>`
);

// Continue LessonPlans form
rep(
  `        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>استاد</label><select style={S.inpSm} value={f.teacherId} onChange={e=>setF({...f,teacherId:e.target.value})}><option value="">-- منتخب کریں --</option>{teachers.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>تاریخ</label><input style={{...S.inpSm,direction:"ltr"}} type="date" value={f.date} onChange={e=>setF({...f,date:e.target.value})}/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>دورانیہ (منٹ)</label><input style={{...S.inpSm,direction:"ltr"}} type="number" value={f.duration} onChange={e=>setF({...f,duration:e.target.value})}/></div>
        <div style={{gridColumn:"1/-1"}}><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>اہداف</label><textarea style={{...S.inpSm,minHeight:"60px",resize:"vertical"}} value={f.objectives} onChange={e=>setF({...f,objectives:e.target.value})} placeholder="سبق کے اہداف..."/></div>
        <div style={{gridColumn:"1/-1"}}><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>سرگرمیاں</label><textarea style={{...S.inpSm,minHeight:"60px",resize:"vertical"}} value={f.activities} onChange={e=>setF({...f,activities:e.target.value})} placeholder="کلاس میں سرگرمیاں..."/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>مواد</label><input style={S.inpSm} value={f.materials} onChange={e=>setF({...f,materials:e.target.value})} placeholder="کتاب، بورڈ..."/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>گھر کا کام</label><input style={S.inpSm} value={f.homework} onChange={e=>setF({...f,homework:e.target.value})} placeholder="ہوم ورک..."/></div>
      </div>
      <button style={S.saveBtn} onClick={add}>✅ منصوبہ محفوظ کریں</button>
    </div>}`,
  `        <div><label style={lbl}>استاد</label><select style={inp} value={f.teacherId} onChange={e=>setF({...f,teacherId:e.target.value})}><option value="" style={{background:N2}}>-- منتخب کریں --</option>{teachers.map(t=><option key={t.id} value={t.id} style={{background:N2}}>{t.name}</option>)}</select></div>
        <div><label style={lbl}>تاریخ</label><input style={{...inp,direction:"ltr",colorScheme:"dark"}} type="date" value={f.date} onChange={e=>setF({...f,date:e.target.value})}/></div>
        <div><label style={lbl}>دورانیہ (منٹ)</label><input style={{...inp,direction:"ltr",colorScheme:"dark"}} type="number" value={f.duration} onChange={e=>setF({...f,duration:e.target.value})}/></div>
        <div style={{gridColumn:"1/-1"}}><label style={lbl}>اہداف</label><textarea style={{...inp,minHeight:"60px",resize:"vertical"}} value={f.objectives} onChange={e=>setF({...f,objectives:e.target.value})} placeholder="سبق کے اہداف..."/></div>
        <div style={{gridColumn:"1/-1"}}><label style={lbl}>سرگرمیاں</label><textarea style={{...inp,minHeight:"60px",resize:"vertical"}} value={f.activities} onChange={e=>setF({...f,activities:e.target.value})} placeholder="کلاس میں سرگرمیاں..."/></div>
        <div><label style={lbl}>مواد</label><input style={inp} value={f.materials} onChange={e=>setF({...f,materials:e.target.value})} placeholder="کتاب، بورڈ..."/></div>
        <div><label style={lbl}>گھر کا کام</label><input style={inp} value={f.homework} onChange={e=>setF({...f,homework:e.target.value})} placeholder="ہوم ورک..."/></div>
      </div>
      <button style={{background:"linear-gradient(135deg,#d4af37,#b8960a)",color:"#0f172a",border:"none",borderRadius:"12px",padding:"11px 26px",fontSize:"0.82rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif",fontWeight:"700"}} onClick={add}>منصوبہ محفوظ کریں</button>
    </div>}`
);

// LessonPlans plan cards
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

console.log('LessonPlans fixed:', n);

// ClassAnalytics - use global replace approach for S.card refs
// Read the ClassAnalytics section
const caStart = content.indexOf('// ===================== CLASS ANALYTICS');
const caEnd = content.indexOf('// ===================== TRANSCRIPT REQUEST');
let caSection = content.slice(caStart, caEnd);

// Replace all old-style S.card in ClassAnalytics section
caSection = caSection
  .replace(/style={S\.card} className="hv-card"/g, `style=${GLASS}`)
  .replace(/\{c:C\.navy,i:"👥"/g, `{c:"#60a5fa",i:"👥"`)
  .replace(/c:overallAvg>=70\?C\.green:C\.amber/g, `c:overallAvg>=70?"#4ade80":"#fb923c"`)
  .replace(/\`linear-gradient\(135deg,\${x\.c}12,\${x\.c}05\)\`/g, '`${x.c}15`')
  .replace(/border:\`2px solid \${x\.c}20\`/g, 'border:`1px solid ${x.c}30`')
  .replace(/color:"#888"\}\}>\{x\.l\}/g, `color:"rgba(255,255,255,0.5)"}>{x.l}`)
  .replace(/color:C\.navy\}\}>\{h\.nameEn\}/g, `color:"#f1f5f9"}>{h.nameEn}`)
  .replace(/color:h\.color\|\|C\.gold\}\}>\{h\.avg\}%/g, `color:h.color||"#d4af37"}>{h.avg}%`)
  .replace(/color:C\.gold\}\}>\{h\.avg\}%/g, `color:"#d4af37"}>{h.avg}%`)
  .replace(/pBar\(h\.avg,100,h\.color\|\|C\.gold\)/g, `pBar(h.avg,100,h.color||"#d4af37")`)
  .replace(/fontSize:"0\.58rem",color:"#aaa"/g, `fontSize:"0.58rem",color:"rgba(255,255,255,0.35)"`)
  .replace(/color:C\.navy,marginBottom:"16px"\}\}>\{h\.emoji\}\{h\.nameEn\}/g, `color:"#f1f5f9",marginBottom:"16px"}>{h.emoji}{h.nameEn}`)
  // top students card
  .replace(/fontWeight:"700",color:C\.navy\}\}>\{s\.name\}/g, `fontWeight:"700",color:"#f1f5f9"}>{s.name}`)
  .replace(/fontSize:"0\.58rem",color:"#888"\}\}>\{s\.grade\}/g, `fontSize:"0.58rem",color:"rgba(255,255,255,0.45)"}>{s.grade}`)
  // subject performance
  .replace(/fontWeight:"700",color:C\.navy\}\}>\{sub\}/g, `fontWeight:"700",color:"#f1f5f9"}>{sub}`)
  .replace(/avg>=70\?C\.green:avg>=50\?C\.amber:C\.red\}\}>\{avg\}%/g, `avg>=70?"#4ade80":avg>=50?"#fb923c":"#f87171"}>{avg}%`)
  .replace(/pBar\(avg,100,avg>=70\?C\.green:avg>=50\?C\.amber:C\.red\)/g, `pBar(avg,100,avg>=70?"#4ade80":avg>=50?"#fb923c":"#f87171")`)
  .replace(/fontSize:"0\.58rem",color:"#aaa",marginTop:"2px"\}\}>\{data\.count\} نتائج/g, `fontSize:"0.58rem",color:"rgba(255,255,255,0.35)",marginTop:"2px"}>{data.count} نتائج`)
  // header label
  .replace(/fontSize:"1\.1rem",fontWeight:"700",color:C\.navy,marginBottom:"6px"\}\}>📊 کلاس تجزیہ/g, `fontSize:"1.4rem",fontWeight:"800",color:"#f1f5f9"}>📊 کلاس تجزیہ`)
  // dark "تعلیمی تجزیہ" header colors
  .replace(/fontWeight:"700",color:C\.navy,marginBottom:"16px"\}\}>[🏠🏆📚]/g, (m) => m.replace(`color:C.navy`, `color:"#d4af37"`));

content = content.slice(0, caStart) + caSection + content.slice(caEnd);
n++;
console.log('ClassAnalytics done:', n);

// TranscriptRequest - find via different search
const trIdx = content.indexOf('📜 ٹرانسکرپٹ درخواست');
if(trIdx >= 0) {
  // fix header area
  const chunk = content.slice(trIdx-200, trIdx+100);
  console.log('TranscriptRequest header found, fixing inline...');

  // Replace the entire TranscriptRequest section inline
  const trSection_start = content.indexOf('// ===================== TRANSCRIPT REQUEST');
  const trSection_end = content.indexOf('// ===================== TEACHER LEAVE');
  let trSection = content.slice(trSection_start, trSection_end);

  trSection = trSection
    .replace(/return <div style={S\.page}>/g, `
  const G="#d4af37"; const N="#0f172a"; const N2="#1e293b";
  const glass=${GLASS};
  const inp={width:"100%",padding:"10px 14px",borderRadius:"10px",border:"1px solid rgba(212,175,55,0.25)",background:"rgba(255,255,255,0.06)",color:"#f1f5f9",fontSize:"0.8rem",fontFamily:"'Public Sans',sans-serif",outline:"none",boxSizing:"border-box",direction:"rtl",colorScheme:"dark"};
  const lbl={fontSize:"0.7rem",color:"rgba(212,175,55,0.8)",marginBottom:"6px",display:"block",fontWeight:"600"};
  return <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#0f172a 0%,#0d1f3c 50%,#0a1628 100%)",padding:"24px 20px",fontFamily:"'Public Sans',sans-serif",direction:"rtl"}}>`)
    .replace(/fontSize:"1\.1rem",fontWeight:"700",color:C\.navy\}\}>📜 ٹرانسکرپٹ درخواست<\/div><div style=\{.*?\}\}>Transcript Requests — دستاویزات<\/div><\/div>/g,
      `fontSize:"1.4rem",fontWeight:"800",color:"#f1f5f9"}}>ٹرانسکرپٹ درخواست</h2><p style={{margin:0,fontSize:"0.72rem",color:"rgba(212,175,55,0.7)"}}>Transcript Requests</p></div>`)
    .replace(/className="hv-card" style=\{\{\.\.\.S\.card,marginBottom:"20px",background:`linear-gradient\(135deg,\$\{C\.goldLight\},#fdf8ee\)`,border:`2px solid \$\{C\.gold\}30`\}\}>/g,
      `style={{...glass,padding:"24px",marginBottom:"20px",borderColor:"rgba(212,175,55,0.3)"}}>`)
    .replace(/style=\{S\.inpSm\}/g, `style={inp}`)
    .replace(/style=\{\{\.\.\.S\.inpSm,/g, `style={{...inp,`)
    .replace(/fontSize:"0\.62rem",color:"#888",marginBottom:"4px",display:"block"\}/g, `...lbl}`)
    .replace(/style=\{S\.saveBtn\}/g, `style={{background:"linear-gradient(135deg,#d4af37,#b8960a)",color:"#0f172a",border:"none",borderRadius:"12px",padding:"11px 26px",fontSize:"0.82rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif",fontWeight:"700"}}`)
    .replace(/className="hv-card" style=\{\{\.\.\.S\.card,borderRight:`4px solid \$\{p\.c\}`\}\}/g,
      `style={{...glass,padding:"18px 20px",borderRight:\`3px solid \${p.c}\`}}`)
    .replace(/fontSize:"0\.82rem",fontWeight:"700",color:C\.navy\}\}>\{st\?\.name\|\|"—"\}/g,
      `fontSize:"0.82rem",fontWeight:"700",color:"#f1f5f9"}>{st?.name||"—"}`)
    .replace(/fontSize:"0\.6rem",color:"#888"\}\}>\{p\.l\}/g,
      `fontSize:"0.6rem",color:"rgba(255,255,255,0.5)"}>{p.l}`)
    .replace(/\.\.\.S\.saveBtn,padding:"6px 14px",fontSize:"0\.65rem"\}/g,
      `background:"linear-gradient(135deg,#d4af37,#b8960a)",color:"#0f172a",border:"none",borderRadius:"8px",padding:"6px 14px",fontSize:"0.65rem",cursor:"pointer",fontWeight:"700"}`)
    .replace(/className="hv-card" style=\{\{\.\.\.S\.card,textAlign:"center",color:"#bbb",padding:"60px"\}\}>/g,
      `style={{...glass,textAlign:"center",color:"rgba(255,255,255,0.3)",padding:"60px"}}>`)
    .replace(/<option key=\{k\} value=\{k\}>/g, `<option key={k} value={k} style={{background:N2}}>`)
    .replace(/<option value="">-- منتخب کریں --<\/option>/g, `<option value="" style={{background:N2}}>-- منتخب کریں --</option>`);

  content = content.slice(0, trSection_start) + trSection + content.slice(trSection_end);
  n++;
  console.log('TranscriptRequest section replaced:', n);
}

// TeacherLeave - similar approach
const tlSection_start = content.indexOf('// ===================== TEACHER LEAVE');
const tlSection_end = content.indexOf('// ===================== LEARNING MATERIALS');
let tlSection = content.slice(tlSection_start, tlSection_end);

tlSection = tlSection
  .replace(/return <div style={S\.page}>/g, `
  const G="#d4af37"; const N="#0f172a"; const N2="#1e293b";
  const glass=${GLASS};
  const inp={width:"100%",padding:"10px 14px",borderRadius:"10px",border:"1px solid rgba(212,175,55,0.25)",background:"rgba(255,255,255,0.06)",color:"#f1f5f9",fontSize:"0.8rem",fontFamily:"'Public Sans',sans-serif",outline:"none",boxSizing:"border-box",direction:"rtl",colorScheme:"dark"};
  const lbl={fontSize:"0.7rem",color:"rgba(212,175,55,0.8)",marginBottom:"6px",display:"block",fontWeight:"600"};
  return <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#0f172a 0%,#0d1f3c 50%,#0a1628 100%)",padding:"24px 20px",fontFamily:"'Public Sans',sans-serif",direction:"rtl"}}>`)
  .replace(/className="hv-card" style=\{\{\.\.\.S\.card,marginBottom:"20px",background:"linear-gradient\(135deg,#fef3c7,#fffbeb\)"\}\}>/g,
    `style={{...glass,padding:"20px",marginBottom:"20px",borderColor:"rgba(251,191,36,0.3)"}}>`)
  .replace(/fontSize:"0\.82rem",fontWeight:"700",color:C\.amber,marginBottom:"12px"\}\}>⏳ منظوری درکار/g,
    `fontSize:"0.82rem",fontWeight:"700",color:"#fbbf24",marginBottom:"12px"}}>⏳ منظوری درکار`)
  .replace(/fontSize:"0\.75rem",fontWeight:"700",color:C\.navy\}\}>\{tp\.i\}/g,
    `fontSize:"0.75rem",fontWeight:"700",color:"#f1f5f9"}>{tp.i}`)
  .replace(/fontSize:"0\.62rem",color:"#888"\}\}>\{l\.startDate\}/g,
    `fontSize:"0.62rem",color:"rgba(255,255,255,0.5)"}>{l.startDate}`)
  .replace(/\{\.\.\.S\.saveBtn,padding:"6px 12px",fontSize:"0\.62rem"\}\}>✅ منظور<\/button><button onClick=\{\(\)=>approve\(l\.id,"rejected"\)\} style=\{\{\.\.\.S\.saveBtn,padding:"6px 12px",fontSize:"0\.62rem",background:`linear-gradient\(135deg,\$\{C\.red\},#b91c1c\)`\}\}>❌ مسترد<\/button>/g,
    `background:"linear-gradient(135deg,#4ade80,#16a34a)",color:"#0f172a",border:"none",borderRadius:"8px",padding:"6px 12px",fontSize:"0.62rem",cursor:"pointer",fontWeight:"700"}}>منظور</button><button onClick={()=>approve(l.id,"rejected")} style={{background:"linear-gradient(135deg,#f87171,#b91c1c)",color:"#fff",border:"none",borderRadius:"8px",padding:"6px 12px",fontSize:"0.62rem",cursor:"pointer",fontWeight:"700"}}>مسترد</button>`)
  .replace(/className="hv-card" style=\{\{\.\.\.S\.card,marginBottom:"20px",background:`linear-gradient\(135deg,\$\{C\.goldLight\},#fdf8ee\)`,border:`2px solid \$\{C\.gold\}30`\}\}>\n      <div style=\{\{display:"grid",gridTemplateColumns:"1fr 1fr"/g,
    `style={{...glass,padding:"24px",marginBottom:"20px",borderColor:"rgba(212,175,55,0.3)"}}>\n      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr"`)
  .replace(/style=\{S\.inpSm\}/g, `style={inp}`)
  .replace(/style=\{\{\.\.\.S\.inpSm,direction:"ltr"\}\}/g, `style={{...inp,direction:"ltr",colorScheme:"dark"}}`)
  .replace(/fontSize:"0\.62rem",color:"#888",marginBottom:"4px",display:"block"\}\}>/g, `...lbl}>`)
  .replace(/style=\{S\.saveBtn\} onClick=\{add\}>✅ درخواست جمع کریں/g,
    `style={{background:"linear-gradient(135deg,#d4af37,#b8960a)",color:"#0f172a",border:"none",borderRadius:"12px",padding:"11px 26px",fontSize:"0.82rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif",fontWeight:"700"}} onClick={add}>درخواست جمع کریں`)
  .replace(/style={S\.card} className="hv-card"><div style=\{\{overflowX:"auto"\}\}>/g,
    `style={{...glass,overflow:"hidden"}}><div style={{overflowX:"auto"}}>`)
  .replace(/style=\{S\.th\}>/g, `style={{padding:"12px 14px",textAlign:"right",fontSize:"0.65rem",color:"rgba(212,175,55,0.8)",fontWeight:"700"}}>`)
  .replace(/style=\{\{\.\.\.S\.td,fontWeight:"700"\}\}>/g, `style={{padding:"11px 14px",color:"#f1f5f9",fontWeight:"700",fontSize:"0.75rem",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>`)
  .replace(/style=\{S\.td\}>/g, `style={{padding:"11px 14px",color:"rgba(255,255,255,0.7)",fontSize:"0.75rem",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>`)
  .replace(/background:l\.status==="approved"\?"#dcfce7":l\.status==="rejected"\?"#fee2e2":"#fef3c7",color:l\.status==="approved"\?C\.green:l\.status==="rejected"\?C\.red:C\.amber/g,
    `background:l.status==="approved"?"rgba(74,222,128,0.15)":l.status==="rejected"?"rgba(248,113,113,0.15)":"rgba(251,191,36,0.15)",color:l.status==="approved"?"#4ade80":l.status==="rejected"?"#f87171":"#fbbf24"`)
  .replace(/\{\.\.\.S\.td,textAlign:"center",color:"#bbb",padding:"40px"\}/g,
    `{padding:"40px",textAlign:"center",color:"rgba(255,255,255,0.3)"}`)
  .replace(/<option key=\{k\} value=\{k\}>/g, `<option key={k} value={k} style={{background:N2}}>`)
  .replace(/<option value="">-- منتخب کریں --<\/option>/g, `<option value="" style={{background:N2}}>-- منتخب کریں --</option>`);

content = content.slice(0, tlSection_start) + tlSection + content.slice(tlSection_end);
n++;
console.log('TeacherLeave section replaced:', n);

fs.writeFileSync(path, content, 'utf8');
console.log('Saved. Total replacements:', n);
