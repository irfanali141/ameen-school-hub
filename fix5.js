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

// ===================== MADRASA HUB =====================
rep(
  `  return <div style={S.page}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
      <div><div style={{fontSize:"1.1rem",fontWeight:"700",color:C.navy}}>🕌 درس نظامی ہب</div><div style={{fontSize:"0.62rem",color:"#888",marginTop:"2px"}}>اسلامی علوم — نصاب و پیشرفت</div></div>
      <button style={S.addBtn} onClick={()=>setShow(!show)}>+ نیا مضمون</button>
    </div>`,
  `${THEME_VARS}
  return <div style=${DARK_WRAP}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"24px",flexWrap:"wrap",gap:"12px"}}>
      <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
        <div style={{width:"44px",height:"44px",borderRadius:"12px",background:"linear-gradient(135deg,#d4af37,#b8960a)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 20px rgba(212,175,55,0.4)"}}><span className="material-symbols-rounded" style={{fontSize:"24px",color:N}}>mosque</span></div>
        <div><h2 style={{margin:0,fontSize:"1.4rem",fontWeight:"800",color:"#f1f5f9"}}>درس نظامی ہب</h2><p style={{margin:0,fontSize:"0.72rem",color:"rgba(212,175,55,0.7)"}}>اسلامی علوم — نصاب و پیشرفت</p></div>
      </div>
      <button style={{display:"flex",alignItems:"center",gap:"8px",padding:"10px 20px",borderRadius:"12px",border:"1px solid #d4af37",background:show?"rgba(212,175,55,0.15)":"transparent",color:"#d4af37",fontWeight:"700",fontSize:"0.82rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif"}} onClick={()=>setShow(!show)}><span className="material-symbols-rounded" style={{fontSize:"18px"}}>{show?"close":"add_circle"}</span>{show?"منسوخ":"نیا مضمون"}</button>
    </div>`
);

// Madrasa stats
rep(
  `      {LEVELS.map(l=>{ const cnt=classes.filter(c=>c.level===l).length; return <div key={l} style={{background:\`linear-gradient(135deg,\${C.gold}12,\${C.gold}05)\`,borderRadius:"16px",padding:"16px",border:\`2px solid \${C.gold}20\`,textAlign:"center"}}><div style={{fontSize:"0.75rem",fontWeight:"800",color:C.goldDark}}>{LEVEL_UR[l]}</div><div style={{fontSize:"1.8rem",fontWeight:"900",color:C.gold,marginTop:"4px"}}>{cnt}</div><div style={{fontSize:"0.58rem",color:"#888"}}>مضامین</div></div>; })}`,
  `      {LEVELS.map(l=>{ const cnt=classes.filter(c=>c.level===l).length; return <div key={l} style={{background:"rgba(212,175,55,0.08)",borderRadius:"16px",padding:"16px",border:"1px solid rgba(212,175,55,0.2)",textAlign:"center"}}><div style={{fontSize:"0.75rem",fontWeight:"800",color:"#d4af37"}}>{LEVEL_UR[l]}</div><div style={{fontSize:"1.8rem",fontWeight:"900",color:"#d4af37",marginTop:"4px"}}>{cnt}</div><div style={{fontSize:"0.58rem",color:"rgba(255,255,255,0.5)"}}>مضامین</div></div>; })}`
);

// Madrasa add form
rep(
  `    {show&&<div className="hv-card" style={{...S.card,marginBottom:"20px",background:\`linear-gradient(135deg,\${C.goldLight},#fdf8ee)\`}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>مضمون *</label><select style={S.inpSm} value={f.subject} onChange={e=>setF({...f,subject:e.target.value})}><option value="">-- منتخب کریں --</option>{islamicSubjects.map(s=><option key={s}>{s}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>درجہ</label><select style={S.inpSm} value={f.level} onChange={e=>setF({...f,level:e.target.value})}>{LEVELS.map(l=><option key={l} value={l}>{LEVEL_UR[l]}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>استاد</label><input style={S.inpSm} value={f.teacher} onChange={e=>setF({...f,teacher:e.target.value})} placeholder="استاد کا نام..."/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>کتاب</label><input style={S.inpSm} value={f.kitab} onChange={e=>setF({...f,kitab:e.target.value})} placeholder="ہدایہ، نورالانوار..."/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>کل دروس</label><input style={{...S.inpSm,direction:"ltr"}} type="number" value={f.totalDars} onChange={e=>setF({...f,totalDars:e.target.value})}/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>شیڈول</label><input style={S.inpSm} value={f.schedule} onChange={e=>setF({...f,schedule:e.target.value})} placeholder="صبح 8-9..."/></div>
      </div>
      <button style={S.saveBtn} onClick={add}>✅ محفوظ کریں</button>
    </div>}`,
  `    {show&&<div style={{...glass,padding:"24px",marginBottom:"20px",borderColor:"rgba(212,175,55,0.3)"}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div><label style={lbl}>مضمون *</label><select style={inp} value={f.subject} onChange={e=>setF({...f,subject:e.target.value})}><option value="" style={{background:N2}}>-- منتخب کریں --</option>{islamicSubjects.map(s=><option key={s} style={{background:N2}}>{s}</option>)}</select></div>
        <div><label style={lbl}>درجہ</label><select style={inp} value={f.level} onChange={e=>setF({...f,level:e.target.value})}>{LEVELS.map(l=><option key={l} value={l} style={{background:N2}}>{LEVEL_UR[l]}</option>)}</select></div>
        <div><label style={lbl}>استاد</label><input style={inp} value={f.teacher} onChange={e=>setF({...f,teacher:e.target.value})} placeholder="استاد کا نام..."/></div>
        <div><label style={lbl}>کتاب</label><input style={inp} value={f.kitab} onChange={e=>setF({...f,kitab:e.target.value})} placeholder="ہدایہ، نورالانوار..."/></div>
        <div><label style={lbl}>کل دروس</label><input style={{...inp,direction:"ltr",colorScheme:"dark"}} type="number" value={f.totalDars} onChange={e=>setF({...f,totalDars:e.target.value})}/></div>
        <div><label style={lbl}>شیڈول</label><input style={inp} value={f.schedule} onChange={e=>setF({...f,schedule:e.target.value})} placeholder="صبح 8-9..."/></div>
      </div>
      <button style=${SAVE_BTN} onClick={add}>محفوظ کریں</button>
    </div>}`
);

// Madrasa tabs
rep(
  `    <div style={{display:"flex",gap:"8px",marginBottom:"16px"}}>{[["classes","📚 مضامین"],["progress","📊 پیشرفت"],["add_prog","➕ پیشرفت درج"]].map(([t,l])=><button key={t} onClick={()=>setTab(t)} style={{padding:"8px 14px",borderRadius:"10px",border:"none",cursor:"pointer",fontSize:"0.65rem",fontWeight:tab===t?"700":"400",background:tab===t?\`linear-gradient(135deg,\${C.gold},\${C.goldDark})\`:C.white,color:tab===t?C.white:"#888",fontFamily:"inherit"}}>{l}</button>)}</div>`,
  `    <div style={{display:"flex",gap:"8px",marginBottom:"16px"}}>{[["classes","📚 مضامین"],["progress","📊 پیشرفت"],["add_prog","➕ پیشرفت درج"]].map(([t,l])=><button key={t} onClick={()=>setTab(t)} style={{padding:"8px 14px",borderRadius:"10px",border:tab===t?"none":"1px solid rgba(255,255,255,0.1)",cursor:"pointer",fontSize:"0.65rem",fontWeight:tab===t?"700":"400",background:tab===t?"linear-gradient(135deg,#d4af37,#b8960a)":"rgba(255,255,255,0.04)",color:tab===t?"#0f172a":"rgba(255,255,255,0.6)",fontFamily:"inherit"}}>{l}</button>)}</div>`
);

// Madrasa subject cards
rep(
  `    {tab==="classes"&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:"14px"}}>
      {classes.map(c=><div key={c.id} className="hv-card" style={{...S.card,borderRight:\`4px solid \${C.gold}\`}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:"8px"}}><div style={{fontSize:"0.85rem",fontWeight:"700",color:C.navy}}>🕌 {c.subject}</div><span style={hBadge(C.gold,C.goldLight)}>{LEVEL_UR[c.level]||c.level}</span></div>
        {c.kitab&&<div style={{fontSize:"0.65rem",color:"#888",marginBottom:"4px"}}>📖 {c.kitab}</div>}
        {c.teacher&&<div style={{fontSize:"0.65rem",color:"#888",marginBottom:"4px"}}>👤 {c.teacher}</div>}
        {c.schedule&&<div style={{fontSize:"0.65rem",color:C.gold}}>⏰ {c.schedule}</div>}
        <div style={{marginTop:"8px"}}>{pBar(0,c.totalDars||100,C.gold)}<div style={{fontSize:"0.58rem",color:"#aaa",marginTop:"2px"}}>کل {c.totalDars} دروس</div></div>
      </div>)}
      {classes.length===0&&<div className="hv-card" style={{...S.card,textAlign:"center",color:"#bbb",padding:"40px",gridColumn:"1/-1"}}>کوئی مضمون نہیں</div>}
    </div>}`,
  `    {tab==="classes"&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:"14px"}}>
      {classes.map(c=><div key={c.id} style={{...glass,padding:"18px",borderRight:"3px solid #d4af37"}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:"8px"}}><div style={{fontSize:"0.85rem",fontWeight:"700",color:"#f1f5f9"}}>🕌 {c.subject}</div><span style={{padding:"3px 8px",borderRadius:"20px",fontSize:"0.6rem",fontWeight:"700",background:"rgba(212,175,55,0.15)",color:"#d4af37"}}>{LEVEL_UR[c.level]||c.level}</span></div>
        {c.kitab&&<div style={{fontSize:"0.65rem",color:"rgba(255,255,255,0.5)",marginBottom:"4px"}}>📖 {c.kitab}</div>}
        {c.teacher&&<div style={{fontSize:"0.65rem",color:"rgba(255,255,255,0.5)",marginBottom:"4px"}}>👤 {c.teacher}</div>}
        {c.schedule&&<div style={{fontSize:"0.65rem",color:"#d4af37"}}>⏰ {c.schedule}</div>}
        <div style={{marginTop:"8px"}}>{pBar(0,c.totalDars||100,"#d4af37")}<div style={{fontSize:"0.58rem",color:"rgba(255,255,255,0.35)",marginTop:"2px"}}>کل {c.totalDars} دروس</div></div>
      </div>)}
      {classes.length===0&&<div style={{...glass,textAlign:"center",color:"rgba(255,255,255,0.3)",padding:"40px",gridColumn:"1/-1"}}>کوئی مضمون نہیں</div>}
    </div>}`
);

// Madrasa progress form
rep(
  `    {tab==="add_prog"&&<div className="hv-card" style={{...S.card,background:\`linear-gradient(135deg,\${C.goldLight},#fdf8ee)\`}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>طالب علم</label><select style={S.inpSm} value={progF.studentId} onChange={e=>setProgF({...progF,studentId:e.target.value})}><option value="">-- منتخب کریں --</option>{students.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>مضمون</label><select style={S.inpSm} value={progF.subjectId} onChange={e=>setProgF({...progF,subjectId:e.target.value})}><option value="">-- منتخب کریں --</option>{classes.map(c=><option key={c.id} value={c.id}>{c.subject}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>مکمل دروس</label><input style={{...S.inpSm,direction:"ltr"}} type="number" value={progF.darsCompleted} onChange={e=>setProgF({...progF,darsCompleted:e.target.value})}/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>گریڈ</label><select style={S.inpSm} value={progF.grade} onChange={e=>setProgF({...progF,grade:e.target.value})}><option value="">-- منتخب کریں --</option>{["ممتاز","جید جداً","جید","مقبول","ناکام"].map(g=><option key={g}>{g}</option>)}</select></div>
      </div>
      <button style={S.saveBtn} onClick={addProg}>✅ پیشرفت درج کریں</button>
    </div>}`,
  `    {tab==="add_prog"&&<div style={{...glass,padding:"24px"}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div><label style={lbl}>طالب علم</label><select style={inp} value={progF.studentId} onChange={e=>setProgF({...progF,studentId:e.target.value})}><option value="" style={{background:N2}}>-- منتخب کریں --</option>{students.map(s=><option key={s.id} value={s.id} style={{background:N2}}>{s.name}</option>)}</select></div>
        <div><label style={lbl}>مضمون</label><select style={inp} value={progF.subjectId} onChange={e=>setProgF({...progF,subjectId:e.target.value})}><option value="" style={{background:N2}}>-- منتخب کریں --</option>{classes.map(c=><option key={c.id} value={c.id} style={{background:N2}}>{c.subject}</option>)}</select></div>
        <div><label style={lbl}>مکمل دروس</label><input style={{...inp,direction:"ltr",colorScheme:"dark"}} type="number" value={progF.darsCompleted} onChange={e=>setProgF({...progF,darsCompleted:e.target.value})}/></div>
        <div><label style={lbl}>گریڈ</label><select style={inp} value={progF.grade} onChange={e=>setProgF({...progF,grade:e.target.value})}><option value="" style={{background:N2}}>-- منتخب کریں --</option>{["ممتاز","جید جداً","جید","مقبول","ناکام"].map(g=><option key={g} style={{background:N2}}>{g}</option>)}</select></div>
      </div>
      <button style=${SAVE_BTN} onClick={addProg}>پیشرفت درج کریں</button>
    </div>}`
);

// Madrasa progress table
rep(
  `    {tab==="progress"&&<div style={S.card} className="hv-card"><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}>
      <thead><tr><th style={S.th}>طالب علم</th><th style={S.th}>مضمون</th><th style={S.th}>دروس</th><th style={S.th}>گریڈ</th></tr></thead>
      <tbody>{progress.map(p=>{ const st=students.find(s=>s.id===p.studentId); const subj=classes.find(c=>c.id===p.subjectId); const pct=subj?Math.round((p.darsCompleted/subj.totalDars)*100):0; return <tr key={p.id}>
        <td style={{...S.td,fontWeight:"700"}}>{st?.name||"—"}</td>
        <td style={S.td}>{subj?.subject||"—"}</td>
        <td style={S.td}><div style={{display:"flex",alignItems:"center",gap:"6px"}}><div style={{flex:1,minWidth:"60px"}}>{pBar(p.darsCompleted,subj?.totalDars||100,C.gold)}</div><span style={{fontSize:"0.6rem",color:C.gold,fontWeight:"700"}}>{pct}%</span></div></td>
        <td style={S.td}><span style={{...hBadge(C.gold,C.goldLight),fontSize:"0.6rem"}}>{p.grade||"—"}</span></td>
      </tr>; })}{progress.length===0&&<tr><td colSpan={4} style={{...S.td,textAlign:"center",color:"#bbb",padding:"40px"}}>کوئی ریکارڈ نہیں</td></tr>}</tbody>
    </table></div></div>}`,
  `    {tab==="progress"&&<div style={{...glass,overflow:"hidden"}}><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}>
      <thead><tr style={{background:"rgba(255,255,255,0.04)"}}>{["طالب علم","مضمون","دروس","گریڈ"].map(h=><th key={h} style={{padding:"12px 14px",textAlign:"right",fontSize:"0.65rem",color:"rgba(212,175,55,0.8)",fontWeight:"700"}}>{h}</th>)}</tr></thead>
      <tbody>{progress.map((p,ri)=>{ const st=students.find(s=>s.id===p.studentId); const subj=classes.find(c=>c.id===p.subjectId); const pct=subj?Math.round((p.darsCompleted/subj.totalDars)*100):0; return <tr key={p.id} style={{background:ri%2===0?"rgba(255,255,255,0.02)":"transparent"}}>
        <td style={{padding:"11px 14px",color:"#f1f5f9",fontWeight:"700",fontSize:"0.75rem",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>{st?.name||"—"}</td>
        <td style={{padding:"11px 14px",color:"rgba(255,255,255,0.7)",fontSize:"0.75rem",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>{subj?.subject||"—"}</td>
        <td style={{padding:"11px 14px",borderBottom:"1px solid rgba(255,255,255,0.05)"}}><div style={{display:"flex",alignItems:"center",gap:"6px"}}><div style={{flex:1,minWidth:"60px"}}>{pBar(p.darsCompleted,subj?.totalDars||100,"#d4af37")}</div><span style={{fontSize:"0.6rem",color:"#d4af37",fontWeight:"700"}}>{pct}%</span></div></td>
        <td style={{padding:"11px 14px",borderBottom:"1px solid rgba(255,255,255,0.05)"}}><span style={{padding:"3px 8px",borderRadius:"20px",fontSize:"0.6rem",fontWeight:"700",background:"rgba(212,175,55,0.15)",color:"#d4af37"}}>{p.grade||"—"}</span></td>
      </tr>; })}{progress.length===0&&<tr><td colSpan={4} style={{padding:"40px",textAlign:"center",color:"rgba(255,255,255,0.3)"}}>کوئی ریکارڈ نہیں</td></tr>}</tbody>
    </table></div></div>}`
);

console.log('MadrasaHub done:', n);

// ===================== DONATION HUB =====================
rep(
  `  return <div style={S.page}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
      <div><div style={{fontSize:"1.1rem",fontWeight:"700",color:C.navy}}>🤲 عطیات و صدقات</div><div style={{fontSize:"0.62rem",color:"#888",marginTop:"2px"}}>صدقہ، زکات، خیرات، وقف</div></div>
      <button style={S.addBtn} onClick={()=>setShow(!show)}>+ نیا عطیہ</button>
    </div>`,
  `${THEME_VARS}
  return <div style=${DARK_WRAP}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"24px",flexWrap:"wrap",gap:"12px"}}>
      <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
        <div style={{width:"44px",height:"44px",borderRadius:"12px",background:"linear-gradient(135deg,#d4af37,#b8960a)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 20px rgba(212,175,55,0.4)"}}><span className="material-symbols-rounded" style={{fontSize:"24px",color:N}}>volunteer_activism</span></div>
        <div><h2 style={{margin:0,fontSize:"1.4rem",fontWeight:"800",color:"#f1f5f9"}}>عطیات و صدقات</h2><p style={{margin:0,fontSize:"0.72rem",color:"rgba(212,175,55,0.7)"}}>صدقہ، زکات، خیرات، وقف</p></div>
      </div>
      <button style={{display:"flex",alignItems:"center",gap:"8px",padding:"10px 20px",borderRadius:"12px",border:"1px solid #d4af37",background:show?"rgba(212,175,55,0.15)":"transparent",color:"#d4af37",fontWeight:"700",fontSize:"0.82rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif"}} onClick={()=>setShow(!show)}><span className="material-symbols-rounded" style={{fontSize:"18px"}}>{show?"close":"add_circle"}</span>{show?"منسوخ":"نیا عطیہ"}</button>
    </div>`
);

// Donation type stat cards
rep(
  `      {Object.entries(types).map(([k,v])=><div key={k} style={{background:\`linear-gradient(135deg,\${v.c}12,\${v.c}05)\`,borderRadius:"16px",padding:"16px",border:\`2px solid \${v.c}20\`,textAlign:"center"}}><div style={{fontSize:"1.4rem"}}>{v.i}</div><div style={{fontSize:"0.72rem",fontWeight:"800",color:v.c,marginTop:"4px"}}>{v.l}</div><div style={{fontSize:"1rem",fontWeight:"900",color:v.c}}>Rs. {(totalByType(k)/1000).toFixed(1)}K</div></div>)}`,
  `      {Object.entries(types).map(([k,v])=><div key={k} style={{background:\`\${v.c}12\`,borderRadius:"16px",padding:"16px",border:\`1px solid \${v.c}30\`,textAlign:"center"}}><div style={{fontSize:"1.4rem"}}>{v.i}</div><div style={{fontSize:"0.72rem",fontWeight:"800",color:v.c,marginTop:"4px"}}>{v.l}</div><div style={{fontSize:"1rem",fontWeight:"900",color:v.c}}>Rs. {(totalByType(k)/1000).toFixed(1)}K</div></div>)}`
);

// Donation grand total
rep(
  `    <div className="hv-card" style={{...S.card,marginBottom:"20px",background:\`linear-gradient(135deg,\${C.goldLight},#fdf8ee)\`,textAlign:"center"}}>
      <div style={{fontSize:"0.65rem",color:"#888"}}>کل وصول شدہ عطیات</div>
      <div style={{fontSize:"2.5rem",fontWeight:"900",color:C.gold}}>Rs. {grandTotal.toLocaleString()}</div>
      <div style={{fontSize:"0.62rem",color:"#888",marginTop:"4px"}}>{donations.length} عطیات</div>
    </div>`,
  `    <div style={{...glass,padding:"20px",marginBottom:"20px",textAlign:"center",borderColor:"rgba(212,175,55,0.3)"}}>
      <div style={{fontSize:"0.65rem",color:"rgba(255,255,255,0.5)"}}>کل وصول شدہ عطیات</div>
      <div style={{fontSize:"2.5rem",fontWeight:"900",color:"#d4af37"}}>Rs. {grandTotal.toLocaleString()}</div>
      <div style={{fontSize:"0.62rem",color:"rgba(255,255,255,0.4)",marginTop:"4px"}}>{donations.length} عطیات</div>
    </div>`
);

// Donation add form
rep(
  `    {show&&<div className="hv-card" style={{...S.card,marginBottom:"20px",background:\`linear-gradient(135deg,\${C.goldLight},#fdf8ee)\`,border:\`2px solid \${C.gold}30\`}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>عطیہ دہندہ</label><input style={S.inpSm} value={f.donorName} onChange={e=>setF({...f,donorName:e.target.value})} placeholder="نام (اختیاری)"/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>رقم *</label><input style={{...S.inpSm,direction:"ltr"}} type="number" value={f.amount} onChange={e=>setF({...f,amount:e.target.value})}/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>قسم</label><select style={S.inpSm} value={f.type} onChange={e=>setF({...f,type:e.target.value})}>{Object.entries(types).map(([k,v])=><option key={k} value={k}>{v.i} {v.l}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>مقصد</label><input style={S.inpSm} value={f.purpose} onChange={e=>setF({...f,purpose:e.target.value})} placeholder="تعمیر، تعلیم..."/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>تاریخ</label><input style={{...S.inpSm,direction:"ltr"}} type="date" value={f.date} onChange={e=>setF({...f,date:e.target.value})}/></div>
        <div style={{display:"flex",alignItems:"center",gap:"8px",paddingTop:"20px"}}><input type="checkbox" checked={f.anonymous} onChange={e=>setF({...f,anonymous:e.target.checked})} id="anon"/><label htmlFor="anon" style={{fontSize:"0.68rem",color:C.navy,cursor:"pointer"}}>گمنام عطیہ</label></div>
      </div>
      <button style={S.saveBtn} onClick={add}>🤲 عطیہ درج کریں</button>
    </div>}`,
  `    {show&&<div style={{...glass,padding:"24px",marginBottom:"20px",borderColor:"rgba(212,175,55,0.3)"}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div><label style={lbl}>عطیہ دہندہ</label><input style={inp} value={f.donorName} onChange={e=>setF({...f,donorName:e.target.value})} placeholder="نام (اختیاری)"/></div>
        <div><label style={lbl}>رقم *</label><input style={{...inp,direction:"ltr",colorScheme:"dark"}} type="number" value={f.amount} onChange={e=>setF({...f,amount:e.target.value})}/></div>
        <div><label style={lbl}>قسم</label><select style={inp} value={f.type} onChange={e=>setF({...f,type:e.target.value})}>{Object.entries(types).map(([k,v])=><option key={k} value={k} style={{background:N2}}>{v.i} {v.l}</option>)}</select></div>
        <div><label style={lbl}>مقصد</label><input style={inp} value={f.purpose} onChange={e=>setF({...f,purpose:e.target.value})} placeholder="تعمیر، تعلیم..."/></div>
        <div><label style={lbl}>تاریخ</label><input style={{...inp,direction:"ltr",colorScheme:"dark"}} type="date" value={f.date} onChange={e=>setF({...f,date:e.target.value})}/></div>
        <div style={{display:"flex",alignItems:"center",gap:"8px"}}><input type="checkbox" checked={f.anonymous} onChange={e=>setF({...f,anonymous:e.target.checked})} id="anon"/><label htmlFor="anon" style={{fontSize:"0.68rem",color:"#f1f5f9",cursor:"pointer"}}>گمنام عطیہ</label></div>
      </div>
      <button style=${SAVE_BTN} onClick={add}>عطیہ درج کریں</button>
    </div>}`
);

// Donation table
rep(
  `    <div style={S.card} className="hv-card"><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}>
      <thead><tr><th style={S.th}>عطیہ دہندہ</th><th style={S.th}>قسم</th><th style={S.th}>رقم</th><th style={S.th}>مقصد</th><th style={S.th}>تاریخ</th></tr></thead>
      <tbody>{donations.map(d=>{ const tc=types[d.type]||types.other; return <tr key={d.id}>
        <td style={{...S.td,fontWeight:"700"}}>{d.anonymous?"گمنام":d.donorName||"—"}</td>
        <td style={S.td}><span style={hBadge(tc.c,tc.bg)}>{tc.i} {tc.l}</span></td>
        <td style={{...S.td,fontWeight:"800",color:C.green}}>Rs. {(d.amount||0).toLocaleString()}</td>
        <td style={S.td}>{d.purpose||"—"}</td>
        <td style={{...S.td,fontFamily:"monospace",direction:"ltr",fontSize:"0.6rem"}}>{d.date}</td>
      </tr>; })}{donations.length===0&&<tr><td colSpan={5} style={{...S.td,textAlign:"center",color:"#bbb",padding:"40px"}}>کوئی ریکارڈ نہیں</td></tr>}</tbody>
    </table></div></div>`,
  `    <div style={{...glass,overflow:"hidden"}}><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}>
      <thead><tr style={{background:"rgba(255,255,255,0.04)"}}>{["عطیہ دہندہ","قسم","رقم","مقصد","تاریخ"].map(h=><th key={h} style={{padding:"12px 14px",textAlign:"right",fontSize:"0.65rem",color:"rgba(212,175,55,0.8)",fontWeight:"700"}}>{h}</th>)}</tr></thead>
      <tbody>{donations.map((d,ri)=>{ const tc=types[d.type]||types.other; return <tr key={d.id} style={{background:ri%2===0?"rgba(255,255,255,0.02)":"transparent"}}>
        <td style={{padding:"11px 14px",color:"#f1f5f9",fontWeight:"700",fontSize:"0.75rem",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>{d.anonymous?"گمنام":d.donorName||"—"}</td>
        <td style={{padding:"11px 14px",borderBottom:"1px solid rgba(255,255,255,0.05)"}}><span style={{padding:"3px 8px",borderRadius:"20px",fontSize:"0.6rem",fontWeight:"700",background:\`\${tc.c}20\`,color:tc.c}}>{tc.i} {tc.l}</span></td>
        <td style={{padding:"11px 14px",fontWeight:"800",color:"#4ade80",fontSize:"0.75rem",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>Rs. {(d.amount||0).toLocaleString()}</td>
        <td style={{padding:"11px 14px",color:"rgba(255,255,255,0.7)",fontSize:"0.75rem",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>{d.purpose||"—"}</td>
        <td style={{padding:"11px 14px",fontFamily:"monospace",direction:"ltr",fontSize:"0.6rem",color:"rgba(255,255,255,0.6)",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>{d.date}</td>
      </tr>; })}{donations.length===0&&<tr><td colSpan={5} style={{padding:"40px",textAlign:"center",color:"rgba(255,255,255,0.3)"}}>کوئی ریکارڈ نہیں</td></tr>}</tbody>
    </table></div></div>`
);

console.log('DonationHub done:', n);

// ===================== MEETING MINUTES =====================
rep(
  `  return <div style={S.page}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
      <div><div style={{fontSize:"1.1rem",fontWeight:"700",color:C.navy}}>📝 میٹنگ منٹس</div><div style={{fontSize:"0.62rem",color:"#888",marginTop:"2px"}}>اجلاس کا ریکارڈ اور فیصلے</div></div>
      <button style={S.addBtn} onClick={()=>setShow(!show)}>+ نئی میٹنگ</button>
    </div>`,
  `${THEME_VARS}
  return <div style=${DARK_WRAP}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"24px",flexWrap:"wrap",gap:"12px"}}>
      <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
        <div style={{width:"44px",height:"44px",borderRadius:"12px",background:"linear-gradient(135deg,#d4af37,#b8960a)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 20px rgba(212,175,55,0.4)"}}><span className="material-symbols-rounded" style={{fontSize:"24px",color:N}}>meeting_room</span></div>
        <div><h2 style={{margin:0,fontSize:"1.4rem",fontWeight:"800",color:"#f1f5f9"}}>میٹنگ منٹس</h2><p style={{margin:0,fontSize:"0.72rem",color:"rgba(212,175,55,0.7)"}}>اجلاس کا ریکارڈ اور فیصلے</p></div>
      </div>
      <button style={{display:"flex",alignItems:"center",gap:"8px",padding:"10px 20px",borderRadius:"12px",border:"1px solid #d4af37",background:show?"rgba(212,175,55,0.15)":"transparent",color:"#d4af37",fontWeight:"700",fontSize:"0.82rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif"}} onClick={()=>setShow(!show)}><span className="material-symbols-rounded" style={{fontSize:"18px"}}>{show?"close":"add_circle"}</span>{show?"منسوخ":"نئی میٹنگ"}</button>
    </div>`
);

// Meeting form
rep(
  `    {show&&<div className="hv-card" style={{...S.card,marginBottom:"20px",background:\`linear-gradient(135deg,\${C.goldLight},#fdf8ee)\`,border:\`2px solid \${C.gold}30\`}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div style={{gridColumn:"1/-1"}}><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>میٹنگ کا عنوان *</label><input style={S.inpSm} value={f.title} onChange={e=>setF({...f,title:e.target.value})} placeholder="ماہانہ اسٹاف میٹنگ..."/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>تاریخ</label><input style={{...S.inpSm,direction:"ltr"}} type="date" value={f.date} onChange={e=>setF({...f,date:e.target.value})}/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>قسم</label><select style={S.inpSm} value={f.type} onChange={e=>setF({...f,type:e.target.value})}>{Object.entries(types).map(([k,v])=><option key={k} value={k}>{v.i} {v.l}</option>)}</select></div>
        <div style={{gridColumn:"1/-1"}}><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>شرکاء</label><input style={S.inpSm} value={f.attendees} onChange={e=>setF({...f,attendees:e.target.value})} placeholder="ناموں کی فہرست..."/></div>
        <div style={{gridColumn:"1/-1"}}><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>ایجنڈا</label><textarea style={{...S.inpSm,minHeight:"60px",resize:"vertical"}} value={f.agenda} onChange={e=>setF({...f,agenda:e.target.value})} placeholder="اجلاس کے نکات..."/></div>
        <div style={{gridColumn:"1/-1"}}><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>کارروائی (منٹس)</label><textarea style={{...S.inpSm,minHeight:"80px",resize:"vertical"}} value={f.minutes} onChange={e=>setF({...f,minutes:e.target.value})} placeholder="اجلاس کی مکمل کارروائی..."/></div>
        <div style={{gridColumn:"1/-1"}}><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>فیصلے</label><textarea style={{...S.inpSm,minHeight:"60px",resize:"vertical"}} value={f.decisions} onChange={e=>setF({...f,decisions:e.target.value})} placeholder="اہم فیصلے اور احکامات..."/></div>
      </div>
      <button style={S.saveBtn} onClick={add}>✅ منٹس محفوظ کریں</button>
    </div>}`,
  `    {show&&<div style={{...glass,padding:"24px",marginBottom:"20px",borderColor:"rgba(212,175,55,0.3)"}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div style={{gridColumn:"1/-1"}}><label style={lbl}>میٹنگ کا عنوان *</label><input style={inp} value={f.title} onChange={e=>setF({...f,title:e.target.value})} placeholder="ماہانہ اسٹاف میٹنگ..."/></div>
        <div><label style={lbl}>تاریخ</label><input style={{...inp,direction:"ltr",colorScheme:"dark"}} type="date" value={f.date} onChange={e=>setF({...f,date:e.target.value})}/></div>
        <div><label style={lbl}>قسم</label><select style={inp} value={f.type} onChange={e=>setF({...f,type:e.target.value})}>{Object.entries(types).map(([k,v])=><option key={k} value={k} style={{background:N2}}>{v.i} {v.l}</option>)}</select></div>
        <div style={{gridColumn:"1/-1"}}><label style={lbl}>شرکاء</label><input style={inp} value={f.attendees} onChange={e=>setF({...f,attendees:e.target.value})} placeholder="ناموں کی فہرست..."/></div>
        <div style={{gridColumn:"1/-1"}}><label style={lbl}>ایجنڈا</label><textarea style={{...inp,minHeight:"60px",resize:"vertical"}} value={f.agenda} onChange={e=>setF({...f,agenda:e.target.value})} placeholder="اجلاس کے نکات..."/></div>
        <div style={{gridColumn:"1/-1"}}><label style={lbl}>کارروائی (منٹس)</label><textarea style={{...inp,minHeight:"80px",resize:"vertical"}} value={f.minutes} onChange={e=>setF({...f,minutes:e.target.value})} placeholder="اجلاس کی مکمل کارروائی..."/></div>
        <div style={{gridColumn:"1/-1"}}><label style={lbl}>فیصلے</label><textarea style={{...inp,minHeight:"60px",resize:"vertical"}} value={f.decisions} onChange={e=>setF({...f,decisions:e.target.value})} placeholder="اہم فیصلے اور احکامات..."/></div>
      </div>
      <button style=${SAVE_BTN} onClick={add}>منٹس محفوظ کریں</button>
    </div>}`
);

// Meeting cards
rep(
  `      {meetings.map(m=>{ const tc=types[m.type]||types.staff; return <div key={m.id} className="hv-card" style={{...S.card,borderRight:\`4px solid \${tc.c}\`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"10px"}}>
          <div><div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"4px"}}><span style={{fontSize:"1rem"}}>{tc.i}</span><span style={{fontSize:"0.85rem",fontWeight:"700",color:C.navy}}>{m.title}</span></div><div style={{fontSize:"0.6rem",color:"#aaa",fontFamily:"monospace",direction:"ltr"}}>{m.date}</div></div>
          <span style={hBadge(tc.c,tc.bg)}>{tc.l}</span>
        </div>
        {m.attendees&&<div style={{fontSize:"0.62rem",color:"#888",marginBottom:"8px"}}>👥 {m.attendees}</div>}
        {m.decisions&&<div style={{background:"#fef3c7",borderRadius:"10px",padding:"10px 14px",marginBottom:"8px"}}><div style={{fontSize:"0.62rem",fontWeight:"700",color:C.amber,marginBottom:"4px"}}>⚡ فیصلے</div><div style={{fontSize:"0.65rem",color:"#555",lineHeight:"1.6"}}>{m.decisions}</div></div>}
        {m.minutes&&<div style={{fontSize:"0.65rem",color:"#666",lineHeight:"1.6"}}>{m.minutes.slice(0,200)}{m.minutes.length>200?"...":""}</div>}
      </div>; })}
      {meetings.length===0&&<div className="hv-card" style={{...S.card,textAlign:"center",color:"#bbb",padding:"60px"}}>کوئی میٹنگ ریکارڈ نہیں</div>}`,
  `      {meetings.map(m=>{ const tc=types[m.type]||types.staff; return <div key={m.id} style={{...glass,padding:"18px 20px",borderRight:\`3px solid \${tc.c}\`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"10px"}}>
          <div><div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"4px"}}><span style={{fontSize:"1rem"}}>{tc.i}</span><span style={{fontSize:"0.85rem",fontWeight:"700",color:"#f1f5f9"}}>{m.title}</span></div><div style={{fontSize:"0.6rem",color:"rgba(255,255,255,0.4)",fontFamily:"monospace",direction:"ltr"}}>{m.date}</div></div>
          <span style={{padding:"3px 8px",borderRadius:"20px",fontSize:"0.6rem",fontWeight:"700",background:\`\${tc.c}20\`,color:tc.c}}>{tc.l}</span>
        </div>
        {m.attendees&&<div style={{fontSize:"0.62rem",color:"rgba(255,255,255,0.5)",marginBottom:"8px"}}>👥 {m.attendees}</div>}
        {m.decisions&&<div style={{background:"rgba(251,191,36,0.1)",borderRadius:"10px",padding:"10px 14px",marginBottom:"8px",border:"1px solid rgba(251,191,36,0.2)"}}><div style={{fontSize:"0.62rem",fontWeight:"700",color:"#fbbf24",marginBottom:"4px"}}>⚡ فیصلے</div><div style={{fontSize:"0.65rem",color:"rgba(255,255,255,0.65)",lineHeight:"1.6"}}>{m.decisions}</div></div>}
        {m.minutes&&<div style={{fontSize:"0.65rem",color:"rgba(255,255,255,0.5)",lineHeight:"1.6"}}>{m.minutes.slice(0,200)}{m.minutes.length>200?"...":""}</div>}
      </div>; })}
      {meetings.length===0&&<div style={{...glass,textAlign:"center",color:"rgba(255,255,255,0.3)",padding:"60px"}}>کوئی میٹنگ ریکارڈ نہیں</div>}`
);

console.log('MeetingMinutes done:', n);

// ===================== LOGISTICS TRACKER =====================
rep(
  `  return <div style={S.page}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
      <div><div style={{fontSize:"1.1rem",fontWeight:"700",color:C.navy}}>🏗️ اثاثہ ٹریکر</div><div style={{fontSize:"0.62rem",color:"#888",marginTop:"2px"}}>سامان، فرنیچر، الیکٹرونکس</div></div>
      <button style={S.addBtn} onClick={()=>setShow(!show)}>+ نیا اثاثہ</button>
    </div>`,
  `${THEME_VARS}
  return <div style=${DARK_WRAP}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"24px",flexWrap:"wrap",gap:"12px"}}>
      <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
        <div style={{width:"44px",height:"44px",borderRadius:"12px",background:"linear-gradient(135deg,#d4af37,#b8960a)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 20px rgba(212,175,55,0.4)"}}><span className="material-symbols-rounded" style={{fontSize:"24px",color:N}}>inventory_2</span></div>
        <div><h2 style={{margin:0,fontSize:"1.4rem",fontWeight:"800",color:"#f1f5f9"}}>اثاثہ ٹریکر</h2><p style={{margin:0,fontSize:"0.72rem",color:"rgba(212,175,55,0.7)"}}>سامان، فرنیچر، الیکٹرونکس</p></div>
      </div>
      <button style={{display:"flex",alignItems:"center",gap:"8px",padding:"10px 20px",borderRadius:"12px",border:"1px solid #d4af37",background:show?"rgba(212,175,55,0.15)":"transparent",color:"#d4af37",fontWeight:"700",fontSize:"0.82rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif"}} onClick={()=>setShow(!show)}><span className="material-symbols-rounded" style={{fontSize:"18px"}}>{show?"close":"add_circle"}</span>{show?"منسوخ":"نیا اثاثہ"}</button>
    </div>`
);

// Logistics stats
rep(
  `      {[{c:C.navy,i:"📦",n:assets.length,l:"کل اثاثے"},{c:C.green,i:"✅",n:assets.filter(a=>a.condition==="good").length,l:"اچھی حالت"},{c:C.red,i:"⚠️",n:maintenance.filter(m=>m.status==="open").length,l:"زیر مرمت"},{c:C.gold,i:"💰",n:\`Rs.\${(totalValue/1000).toFixed(0)}K\`,l:"کل مالیت"}].map((x,i)=><div key={i} style={{background:\`linear-gradient(135deg,\${x.c}12,\${x.c}05)\`,borderRadius:"16px",padding:"16px",border:\`2px solid \${x.c}20\`,textAlign:"center"}}><div style={{fontSize:"1.3rem"}}>{x.i}</div><div style={{fontSize:"1.2rem",fontWeight:"900",color:x.c}}>{x.n}</div><div style={{fontSize:"0.6rem",color:"#888"}}>{x.l}</div></div>)}`,
  `      {[{c:"#60a5fa",i:"📦",n:assets.length,l:"کل اثاثے"},{c:"#4ade80",i:"✅",n:assets.filter(a=>a.condition==="good").length,l:"اچھی حالت"},{c:"#f87171",i:"⚠️",n:maintenance.filter(m=>m.status==="open").length,l:"زیر مرمت"},{c:"#d4af37",i:"💰",n:\`Rs.\${(totalValue/1000).toFixed(0)}K\`,l:"کل مالیت"}].map((x,i)=><div key={i} style={{background:\`\${x.c}15\`,borderRadius:"16px",padding:"16px",border:\`1px solid \${x.c}30\`,textAlign:"center"}}><div style={{fontSize:"1.3rem"}}>{x.i}</div><div style={{fontSize:"1.2rem",fontWeight:"900",color:x.c}}>{x.n}</div><div style={{fontSize:"0.6rem",color:"rgba(255,255,255,0.5)"}}>{x.l}</div></div>)}`
);

// Logistics add form
rep(
  `    {show&&<div className="hv-card" style={{...S.card,marginBottom:"20px",background:\`linear-gradient(135deg,\${C.goldLight},#fdf8ee)\`}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>نام *</label><input style={S.inpSm} value={f.name} onChange={e=>setF({...f,name:e.target.value})} placeholder="کرسی، کمپیوٹر..."/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>زمرہ</label><select style={S.inpSm} value={f.category} onChange={e=>setF({...f,category:e.target.value})}>{Object.entries(cats).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>تعداد</label><input style={{...S.inpSm,direction:"ltr"}} type="number" value={f.quantity} onChange={e=>setF({...f,quantity:e.target.value})}/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>حالت</label><select style={S.inpSm} value={f.condition} onChange={e=>setF({...f,condition:e.target.value})}>{Object.entries(condConfig).map(([k,v])=><option key={k} value={k}>{v.l}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>مقام</label><input style={S.inpSm} value={f.location} onChange={e=>setF({...f,location:e.target.value})} placeholder="کمرہ 101..."/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>قیمت</label><input style={{...S.inpSm,direction:"ltr"}} type="number" value={f.purchasePrice} onChange={e=>setF({...f,purchasePrice:e.target.value})}/></div>
      </div>
      <button style={S.saveBtn} onClick={add}>✅ محفوظ کریں</button>
    </div>}`,
  `    {show&&<div style={{...glass,padding:"24px",marginBottom:"20px",borderColor:"rgba(212,175,55,0.3)"}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div><label style={lbl}>نام *</label><input style={inp} value={f.name} onChange={e=>setF({...f,name:e.target.value})} placeholder="کرسی، کمپیوٹر..."/></div>
        <div><label style={lbl}>زمرہ</label><select style={inp} value={f.category} onChange={e=>setF({...f,category:e.target.value})}>{Object.entries(cats).map(([k,v])=><option key={k} value={k} style={{background:N2}}>{v}</option>)}</select></div>
        <div><label style={lbl}>تعداد</label><input style={{...inp,direction:"ltr",colorScheme:"dark"}} type="number" value={f.quantity} onChange={e=>setF({...f,quantity:e.target.value})}/></div>
        <div><label style={lbl}>حالت</label><select style={inp} value={f.condition} onChange={e=>setF({...f,condition:e.target.value})}>{Object.entries(condConfig).map(([k,v])=><option key={k} value={k} style={{background:N2}}>{v.l}</option>)}</select></div>
        <div><label style={lbl}>مقام</label><input style={inp} value={f.location} onChange={e=>setF({...f,location:e.target.value})} placeholder="کمرہ 101..."/></div>
        <div><label style={lbl}>قیمت</label><input style={{...inp,direction:"ltr",colorScheme:"dark"}} type="number" value={f.purchasePrice} onChange={e=>setF({...f,purchasePrice:e.target.value})}/></div>
      </div>
      <button style=${SAVE_BTN} onClick={add}>محفوظ کریں</button>
    </div>}`
);

// Logistics tabs
rep(
  `    <div style={{display:"flex",gap:"8px",marginBottom:"16px"}}>{[["assets","📦 اثاثے"],["maintenance","🔧 مرمت"],["report","⚠️ مسئلہ رپورٹ"]].map(([t,l])=><button key={t} onClick={()=>setTab(t)} style={{padding:"8px 14px",borderRadius:"10px",border:"none",cursor:"pointer",fontSize:"0.65rem",fontWeight:tab===t?"700":"400",background:tab===t?\`linear-gradient(135deg,\${C.gold},\${C.goldDark})\`:C.white,color:tab===t?C.white:"#888",fontFamily:"inherit"}}>{l}</button>)}</div>`,
  `    <div style={{display:"flex",gap:"8px",marginBottom:"16px"}}>{[["assets","📦 اثاثے"],["maintenance","🔧 مرمت"],["report","⚠️ مسئلہ رپورٹ"]].map(([t,l])=><button key={t} onClick={()=>setTab(t)} style={{padding:"8px 14px",borderRadius:"10px",border:tab===t?"none":"1px solid rgba(255,255,255,0.1)",cursor:"pointer",fontSize:"0.65rem",fontWeight:tab===t?"700":"400",background:tab===t?"linear-gradient(135deg,#d4af37,#b8960a)":"rgba(255,255,255,0.04)",color:tab===t?"#0f172a":"rgba(255,255,255,0.6)",fontFamily:"inherit"}}>{l}</button>)}</div>`
);

// Logistics assets table
rep(
  `    {tab==="assets"&&<div style={S.card} className="hv-card"><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}>
      <thead><tr><th style={S.th}>نام</th><th style={S.th}>زمرہ</th><th style={S.th}>تعداد</th><th style={S.th}>مقام</th><th style={S.th}>حالت</th><th style={S.th}>قیمت</th></tr></thead>
      <tbody>{assets.map(a=>{ const cc=condConfig[a.condition]||condConfig.good; return <tr key={a.id}>
        <td style={{...S.td,fontWeight:"700"}}>{a.name}</td><td style={S.td}>{cats[a.category]||a.category}</td><td style={S.td}>{a.quantity}</td><td style={S.td}>{a.location||"—"}</td>
        <td style={S.td}><span style={hBadge(cc.c,cc.c+"15")}>{cc.l}</span></td>
        <td style={{...S.td,color:C.gold,fontWeight:"700"}}>{a.purchasePrice>0?\`Rs. \${a.purchasePrice.toLocaleString()}\`:"—"}</td>
      </tr>; })}{assets.length===0&&<tr><td colSpan={6} style={{...S.td,textAlign:"center",color:"#bbb",padding:"40px"}}>کوئی اثاثہ نہیں</td></tr>}</tbody>
    </table></div></div>}`,
  `    {tab==="assets"&&<div style={{...glass,overflow:"hidden"}}><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}>
      <thead><tr style={{background:"rgba(255,255,255,0.04)"}}>{["نام","زمرہ","تعداد","مقام","حالت","قیمت"].map(h=><th key={h} style={{padding:"12px 14px",textAlign:"right",fontSize:"0.65rem",color:"rgba(212,175,55,0.8)",fontWeight:"700"}}>{h}</th>)}</tr></thead>
      <tbody>{assets.map((a,ri)=>{ const cc=condConfig[a.condition]||condConfig.good; return <tr key={a.id} style={{background:ri%2===0?"rgba(255,255,255,0.02)":"transparent"}}>
        <td style={{padding:"11px 14px",color:"#f1f5f9",fontWeight:"700",fontSize:"0.75rem",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>{a.name}</td>
        <td style={{padding:"11px 14px",color:"rgba(255,255,255,0.7)",fontSize:"0.75rem",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>{cats[a.category]||a.category}</td>
        <td style={{padding:"11px 14px",color:"rgba(255,255,255,0.7)",fontSize:"0.75rem",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>{a.quantity}</td>
        <td style={{padding:"11px 14px",color:"rgba(255,255,255,0.7)",fontSize:"0.75rem",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>{a.location||"—"}</td>
        <td style={{padding:"11px 14px",borderBottom:"1px solid rgba(255,255,255,0.05)"}}><span style={{padding:"3px 8px",borderRadius:"20px",fontSize:"0.6rem",fontWeight:"700",background:\`\${cc.c}20\`,color:cc.c}}>{cc.l}</span></td>
        <td style={{padding:"11px 14px",color:"#d4af37",fontWeight:"700",fontSize:"0.75rem",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>{a.purchasePrice>0?\`Rs. \${a.purchasePrice.toLocaleString()}\`:"—"}</td>
      </tr>; })}{assets.length===0&&<tr><td colSpan={6} style={{padding:"40px",textAlign:"center",color:"rgba(255,255,255,0.3)"}}>کوئی اثاثہ نہیں</td></tr>}</tbody>
    </table></div></div>}`
);

// Logistics report form
rep(
  `    {tab==="report"&&<div className="hv-card" style={{...S.card,background:"linear-gradient(135deg,#fee2e2,#fff5f5)"}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>اثاثہ</label><select style={S.inpSm} value={mainF.assetId} onChange={e=>setMainF({...mainF,assetId:e.target.value})}><option value="">-- منتخب کریں --</option>{assets.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>ترجیح</label><select style={S.inpSm} value={mainF.priority} onChange={e=>setMainF({...mainF,priority:e.target.value})}><option value="normal">عام</option><option value="high">اہم</option><option value="urgent">فوری</option></select></div>
        <div style={{gridColumn:"1/-1"}}><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>مسئلہ</label><textarea style={{...S.inpSm,minHeight:"60px",resize:"vertical"}} value={mainF.issue} onChange={e=>setMainF({...mainF,issue:e.target.value})} placeholder="مسئلے کی تفصیل..."/></div>
      </div>
      <button style={{...S.saveBtn,background:\`linear-gradient(135deg,\${C.amber},#b45309)\`}} onClick={addMaint}>⚠️ مسئلہ رپورٹ کریں</button>
    </div>}`,
  `    {tab==="report"&&<div style={{...glass,padding:"24px",borderColor:"rgba(248,113,113,0.3)"}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div><label style={lbl}>اثاثہ</label><select style={inp} value={mainF.assetId} onChange={e=>setMainF({...mainF,assetId:e.target.value})}><option value="" style={{background:N2}}>-- منتخب کریں --</option>{assets.map(a=><option key={a.id} value={a.id} style={{background:N2}}>{a.name}</option>)}</select></div>
        <div><label style={lbl}>ترجیح</label><select style={inp} value={mainF.priority} onChange={e=>setMainF({...mainF,priority:e.target.value})}><option value="normal" style={{background:N2}}>عام</option><option value="high" style={{background:N2}}>اہم</option><option value="urgent" style={{background:N2}}>فوری</option></select></div>
        <div style={{gridColumn:"1/-1"}}><label style={lbl}>مسئلہ</label><textarea style={{...inp,minHeight:"60px",resize:"vertical"}} value={mainF.issue} onChange={e=>setMainF({...mainF,issue:e.target.value})} placeholder="مسئلے کی تفصیل..."/></div>
      </div>
      <button style={{background:"linear-gradient(135deg,#fb923c,#b45309)",color:"#fff",border:"none",borderRadius:"12px",padding:"11px 26px",fontSize:"0.82rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif",fontWeight:"700"}} onClick={addMaint}>مسئلہ رپورٹ کریں</button>
    </div>}`
);

// Logistics maintenance table
rep(
  `    {tab==="maintenance"&&<div style={S.card} className="hv-card"><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}>
      <thead><tr><th style={S.th}>اثاثہ</th><th style={S.th}>مسئلہ</th><th style={S.th}>ترجیح</th><th style={S.th}>حال</th><th style={S.th}>عمل</th></tr></thead>
      <tbody>{maintenance.map(m=>{ const a=assets.find(x=>x.id===m.assetId); const pc=m.priority==="urgent"?C.red:m.priority==="high"?C.amber:C.abuBakr; return <tr key={m.id}>
        <td style={{...S.td,fontWeight:"700"}}>{a?.name||"—"}</td><td style={S.td}>{m.issue?.slice(0,50)||"—"}</td>
        <td style={S.td}><span style={hBadge(pc,pc+"15")}>{m.priority==="urgent"?"فوری":m.priority==="high"?"اہم":"عام"}</span></td>
        <td style={S.td}><span style={{padding:"3px 8px",borderRadius:"20px",fontSize:"0.55rem",fontWeight:"700",background:m.status==="resolved"?"#dcfce7":"#fef3c7",color:m.status==="resolved"?C.green:C.amber}}>{m.status==="resolved"?"✅ حل":"⏳ کھلا"}</span></td>
        <td style={S.td}>{m.status==="open"&&<button onClick={()=>resolveM(m.id)} style={{...S.saveBtn,padding:"4px 10px",fontSize:"0.55rem"}}>✅ حل</button>}</td>
      </tr>; })}{maintenance.length===0&&<tr><td colSpan={5} style={{...S.td,textAlign:"center",color:"#bbb",padding:"40px"}}>کوئی مرمت ریکارڈ نہیں</td></tr>}</tbody>
    </table></div></div>}`,
  `    {tab==="maintenance"&&<div style={{...glass,overflow:"hidden"}}><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}>
      <thead><tr style={{background:"rgba(255,255,255,0.04)"}}>{["اثاثہ","مسئلہ","ترجیح","حال","عمل"].map(h=><th key={h} style={{padding:"12px 14px",textAlign:"right",fontSize:"0.65rem",color:"rgba(212,175,55,0.8)",fontWeight:"700"}}>{h}</th>)}</tr></thead>
      <tbody>{maintenance.map((m,ri)=>{ const a=assets.find(x=>x.id===m.assetId); const pc=m.priority==="urgent"?"#f87171":m.priority==="high"?"#fb923c":"#60a5fa"; return <tr key={m.id} style={{background:ri%2===0?"rgba(255,255,255,0.02)":"transparent"}}>
        <td style={{padding:"11px 14px",color:"#f1f5f9",fontWeight:"700",fontSize:"0.75rem",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>{a?.name||"—"}</td>
        <td style={{padding:"11px 14px",color:"rgba(255,255,255,0.7)",fontSize:"0.75rem",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>{m.issue?.slice(0,50)||"—"}</td>
        <td style={{padding:"11px 14px",borderBottom:"1px solid rgba(255,255,255,0.05)"}}><span style={{padding:"3px 8px",borderRadius:"20px",fontSize:"0.6rem",fontWeight:"700",background:\`\${pc}20\`,color:pc}}>{m.priority==="urgent"?"فوری":m.priority==="high"?"اہم":"عام"}</span></td>
        <td style={{padding:"11px 14px",borderBottom:"1px solid rgba(255,255,255,0.05)"}}><span style={{padding:"3px 8px",borderRadius:"20px",fontSize:"0.55rem",fontWeight:"700",background:m.status==="resolved"?"rgba(74,222,128,0.15)":"rgba(251,191,36,0.15)",color:m.status==="resolved"?"#4ade80":"#fbbf24"}}>{m.status==="resolved"?"✅ حل":"⏳ کھلا"}</span></td>
        <td style={{padding:"11px 14px",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>{m.status==="open"&&<button onClick={()=>resolveM(m.id)} style={{background:"linear-gradient(135deg,#4ade80,#16a34a)",color:"#0f172a",border:"none",borderRadius:"8px",padding:"4px 10px",fontSize:"0.6rem",cursor:"pointer",fontWeight:"700"}}>حل</button>}</td>
      </tr>; })}{maintenance.length===0&&<tr><td colSpan={5} style={{padding:"40px",textAlign:"center",color:"rgba(255,255,255,0.3)"}}>کوئی مرمت ریکارڈ نہیں</td></tr>}</tbody>
    </table></div></div>}`
);

console.log('LogisticsTracker done:', n);
fs.writeFileSync(path, content, 'utf8');
console.log('Saved. Total:', n);
