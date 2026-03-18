/* eslint-disable */
const fs = require('fs');
const path = 'e:/app pic/AII Main Project/ameen-school-hub/src/App.js';
let content = fs.readFileSync(path, 'utf8');
let n = 0;
function rep(o, r) { if (content.includes(o)) { content = content.split(o).join(r); n++; return true; } console.log('NOT FOUND:', o.slice(0,80)); return false; }

const N = '"#0f172a"';
const N2 = '"#1e293b"';
const G = '"#d4af37"';
const DARK_WRAP = `{minHeight:"100vh",background:"linear-gradient(160deg,#0f172a 0%,#0d1f3c 50%,#0a1628 100%)",padding:"24px 20px",fontFamily:"'Public Sans',sans-serif",direction:"rtl"}`;
const GLASS = `{background:"rgba(255,255,255,0.07)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:"16px"}`;

// ===================== TRANSPORT =====================
rep(
  `  return <div style={S.page}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
      <div><div style={{fontSize:"1.1rem",fontWeight:"700",color:C.navy}}>🚌 ٹرانسپورٹ</div></div>
      <button style={S.addBtn} onClick={()=>setShow(!show)}>+ نیا روٹ</button>
    </div>`,
  `
  const G="#d4af37"; const N="#0f172a"; const N2="#1e293b";
  const glass=${GLASS};
  const inp={width:"100%",padding:"10px 14px",borderRadius:"10px",border:"1px solid rgba(212,175,55,0.25)",background:"rgba(255,255,255,0.06)",color:"#f1f5f9",fontSize:"0.8rem",fontFamily:"'Public Sans',sans-serif",outline:"none",boxSizing:"border-box",direction:"rtl",colorScheme:"dark"};
  const lbl={fontSize:"0.7rem",color:"rgba(212,175,55,0.8)",marginBottom:"6px",display:"block",fontWeight:"600"};
  return <div style=${DARK_WRAP}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"24px",flexWrap:"wrap",gap:"12px"}}>
      <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
        <div style={{width:"44px",height:"44px",borderRadius:"12px",background:"linear-gradient(135deg,#d4af37,#b8960a)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 20px rgba(212,175,55,0.4)"}}><span className="material-symbols-rounded" style={{fontSize:"24px",color:N}}>directions_bus</span></div>
        <div><h2 style={{margin:0,fontSize:"1.4rem",fontWeight:"800",color:"#f1f5f9"}}>ٹرانسپورٹ</h2><p style={{margin:0,fontSize:"0.72rem",color:"rgba(212,175,55,0.7)"}}>روٹس اور طلبا</p></div>
      </div>
      <button style={{display:"flex",alignItems:"center",gap:"8px",padding:"10px 20px",borderRadius:"12px",border:"1px solid #d4af37",background:show?"rgba(212,175,55,0.15)":"transparent",color:"#d4af37",fontWeight:"700",fontSize:"0.82rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif"}} onClick={()=>setShow(!show)}><span className="material-symbols-rounded" style={{fontSize:"18px"}}>{show?"close":"add_circle"}</span>{show?"منسوخ":"نیا روٹ"}</button>
    </div>`
);

// Transport route cards
rep(
  `    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:"14px",marginBottom:"20px"}}>
      {routes.map(r=>{ const occ=getOccupancy(r.id); return <div key={r.id} style={S.card} className="hv-card">
        <div style={{fontSize:"1.5rem",marginBottom:"6px"}}>🚌</div>
        <div style={{fontWeight:"700",color:C.navy,marginBottom:"4px"}}>{r.routeName}</div>
        <div style={{fontSize:"0.62rem",color:"#888",marginBottom:"8px"}}>👤 {r.driverName} • {r.vehicleNo}</div>
        {pBar(occ,r.capacity||20,C.abuBakr)}
        <div style={{fontSize:"0.6rem",color:"#888",marginTop:"4px"}}>{occ}/{r.capacity} طلبا</div>
        {r.timing&&<div style={{fontSize:"0.6rem",color:C.gold,marginTop:"4px"}}>⏰ {r.timing}</div>}
      </div>; })}
    </div>`,
  `    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:"14px",marginBottom:"20px"}}>
      {routes.map(r=>{ const occ=getOccupancy(r.id); return <div key={r.id} style={{...glass,padding:"18px"}}>
        <div style={{fontSize:"1.5rem",marginBottom:"6px"}}>🚌</div>
        <div style={{fontWeight:"700",color:"#f1f5f9",marginBottom:"4px"}}>{r.routeName}</div>
        <div style={{fontSize:"0.62rem",color:"rgba(255,255,255,0.5)",marginBottom:"8px"}}>👤 {r.driverName} • {r.vehicleNo}</div>
        {pBar(occ,r.capacity||20,"#60a5fa")}
        <div style={{fontSize:"0.6rem",color:"rgba(255,255,255,0.4)",marginTop:"4px"}}>{occ}/{r.capacity} طلبا</div>
        {r.timing&&<div style={{fontSize:"0.6rem",color:G,marginTop:"4px"}}>⏰ {r.timing}</div>}
      </div>; })}
    </div>`
);

// Transport add form
rep(
  `    {show&&<div className="hv-card" style={{...S.card,marginBottom:"20px",background:\`linear-gradient(135deg,\${C.goldLight},#fdf8ee)\`}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>روٹ کا نام *</label><input style={S.inpSm} value={f.routeName} onChange={e=>setF({...f,routeName:e.target.value})} placeholder="سوات — مدین روٹ..."/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>ڈرائیور</label><input style={S.inpSm} value={f.driverName} onChange={e=>setF({...f,driverName:e.target.value})} placeholder="ڈرائیور کا نام..."/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>گاڑی نمبر</label><input style={{...S.inpSm,direction:"ltr"}} value={f.vehicleNo} onChange={e=>setF({...f,vehicleNo:e.target.value})} placeholder="ABC-123"/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>گنجائش</label><input style={{...S.inpSm,direction:"ltr"}} type="number" value={f.capacity} onChange={e=>setF({...f,capacity:e.target.value})}/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>وقت</label><input style={S.inpSm} value={f.timing} onChange={e=>setF({...f,timing:e.target.value})} placeholder="صبح 7:30، واپسی 2:00"/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>اسٹاپس</label><input style={S.inpSm} value={f.stops} onChange={e=>setF({...f,stops:e.target.value})} placeholder="مین بازار، پل، مسجد..."/></div>
      </div>
      <button style={S.saveBtn} onClick={addRoute}>✅ محفوظ کریں</button>
    </div>}`,
  `    {show&&<div style={{...glass,padding:"24px",marginBottom:"20px",borderColor:"rgba(212,175,55,0.3)"}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div><label style={lbl}>روٹ کا نام *</label><input style={inp} value={f.routeName} onChange={e=>setF({...f,routeName:e.target.value})} placeholder="سوات — مدین روٹ..."/></div>
        <div><label style={lbl}>ڈرائیور</label><input style={inp} value={f.driverName} onChange={e=>setF({...f,driverName:e.target.value})} placeholder="ڈرائیور کا نام..."/></div>
        <div><label style={lbl}>گاڑی نمبر</label><input style={{...inp,direction:"ltr"}} value={f.vehicleNo} onChange={e=>setF({...f,vehicleNo:e.target.value})} placeholder="ABC-123"/></div>
        <div><label style={lbl}>گنجائش</label><input style={{...inp,direction:"ltr",colorScheme:"dark"}} type="number" value={f.capacity} onChange={e=>setF({...f,capacity:e.target.value})}/></div>
        <div><label style={lbl}>وقت</label><input style={inp} value={f.timing} onChange={e=>setF({...f,timing:e.target.value})} placeholder="صبح 7:30، واپسی 2:00"/></div>
        <div><label style={lbl}>اسٹاپس</label><input style={inp} value={f.stops} onChange={e=>setF({...f,stops:e.target.value})} placeholder="مین بازار، پل، مسجد..."/></div>
      </div>
      <button style={{background:"linear-gradient(135deg,#d4af37,#b8960a)",color:N,border:"none",borderRadius:"12px",padding:"11px 26px",fontSize:"0.82rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif",fontWeight:"700"}} onClick={addRoute}>محفوظ کریں</button>
    </div>}`
);

// Transport tabs
rep(
  `    <div style={{display:"flex",gap:"8px",marginBottom:"16px"}}>{[["routes","🚌 روٹس"],["assign","👥 طالب علم شامل کریں"]].map(([t,l])=><button key={t} onClick={()=>setTab(t)} style={{padding:"8px 14px",borderRadius:"10px",border:"none",cursor:"pointer",fontSize:"0.65rem",fontWeight:tab===t?"700":"400",background:tab===t?\`linear-gradient(135deg,\${C.gold},\${C.goldDark})\`:C.white,color:tab===t?C.white:"#888",fontFamily:"inherit"}}>{l}</button>)}</div>`,
  `    <div style={{display:"flex",gap:"8px",marginBottom:"16px"}}>{[["routes","🚌 روٹس"],["assign","👥 طالب علم شامل کریں"]].map(([t,l])=><button key={t} onClick={()=>setTab(t)} style={{padding:"8px 14px",borderRadius:"10px",border:tab===t?"none":"1px solid rgba(255,255,255,0.1)",cursor:"pointer",fontSize:"0.65rem",fontWeight:tab===t?"700":"400",background:tab===t?"linear-gradient(135deg,#d4af37,#b8960a)":"rgba(255,255,255,0.04)",color:tab===t?"#0f172a":"rgba(255,255,255,0.6)",fontFamily:"inherit"}}>{l}</button>)}</div>`
);

// Transport assign form
rep(
  `    {tab==="assign"&&<div className="hv-card" style={{...S.card,marginBottom:"16px",background:\`linear-gradient(135deg,\${C.goldLight},#fdf8ee)\`}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>طالب علم</label><select style={S.inpSm} value={assignF.studentId} onChange={e=>setAssignF({...assignF,studentId:e.target.value})}><option value="">-- منتخب کریں --</option>{students.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>روٹ</label><select style={S.inpSm} value={assignF.routeId} onChange={e=>setAssignF({...assignF,routeId:e.target.value})}><option value="">-- منتخب کریں --</option>{routes.map(r=><option key={r.id} value={r.id}>{r.routeName}</option>)}</select></div>
      </div></div>}`,
  `    {tab==="assign"&&<div style={{...glass,padding:"24px",marginBottom:"16px"}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div><label style={lbl}>طالب علم</label><select style={inp} value={assignF.studentId} onChange={e=>setAssignF({...assignF,studentId:e.target.value})}><option value="" style={{background:N2}}>-- منتخب کریں --</option>{students.map(s=><option key={s.id} value={s.id} style={{background:N2}}>{s.name}</option>)}</select></div>
        <div><label style={lbl}>روٹ</label><select style={inp} value={assignF.routeId} onChange={e=>setAssignF({...assignF,routeId:e.target.value})}><option value="" style={{background:N2}}>-- منتخب کریں --</option>{routes.map(r=><option key={r.id} value={r.id} style={{background:N2}}>{r.routeName}</option>)}</select></div>
      </div></div>}`
);

// Transport assign button
rep(
  `      <button style={S.saveBtn} onClick={assign}>✅ شامل کریں</button>`,
  `      <button style={{background:"linear-gradient(135deg,#d4af37,#b8960a)",color:N,border:"none",borderRadius:"12px",padding:"11px 26px",fontSize:"0.82rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif",fontWeight:"700"}} onClick={assign}>شامل کریں</button>`
);

// Transport routes table
rep(
  `    {tab==="routes"&&<div style={S.card} className="hv-card"><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}>
      <thead><tr><th style={S.th}>روٹ</th><th style={S.th}>ڈرائیور</th><th style={S.th}>گاڑی</th><th style={S.th}>گنجائش</th><th style={S.th}>مسافر</th></tr></thead>
      <tbody>{routes.map(r=>{ const occ=getOccupancy(r.id); return <tr key={r.id}>
        <td style={{...S.td,fontWeight:"700"}}>{r.routeName}</td><td style={S.td}>{r.driverName||"—"}</td>
        <td style={{...S.td,fontFamily:"monospace",direction:"ltr",fontSize:"0.6rem"}}>{r.vehicleNo||"—"}</td>
        <td style={S.td}>{r.capacity}</td>
        <td style={S.td}><span style={{color:occ>=r.capacity?C.red:C.green,fontWeight:"700"}}>{occ}/{r.capacity}</span></td>
      </tr>; })}{routes.length===0&&<tr><td colSpan={5} style={{...S.td,textAlign:"center",color:"#bbb",padding:"40px"}}>کوئی روٹ نہیں</td></tr>}</tbody>
    </table></div></div>}`,
  `    {tab==="routes"&&<div style={{...glass,overflow:"hidden"}}><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}>
      <thead><tr style={{background:"rgba(255,255,255,0.04)"}}><th style={{padding:"12px 14px",textAlign:"right",fontSize:"0.65rem",color:"rgba(212,175,55,0.8)",fontWeight:"700"}}>روٹ</th><th style={{padding:"12px 14px",textAlign:"right",fontSize:"0.65rem",color:"rgba(212,175,55,0.8)",fontWeight:"700"}}>ڈرائیور</th><th style={{padding:"12px 14px",textAlign:"right",fontSize:"0.65rem",color:"rgba(212,175,55,0.8)",fontWeight:"700"}}>گاڑی</th><th style={{padding:"12px 14px",textAlign:"right",fontSize:"0.65rem",color:"rgba(212,175,55,0.8)",fontWeight:"700"}}>گنجائش</th><th style={{padding:"12px 14px",textAlign:"right",fontSize:"0.65rem",color:"rgba(212,175,55,0.8)",fontWeight:"700"}}>مسافر</th></tr></thead>
      <tbody>{routes.map((r,ri)=>{ const occ=getOccupancy(r.id); return <tr key={r.id} style={{background:ri%2===0?"rgba(255,255,255,0.02)":"transparent"}}>
        <td style={{padding:"11px 14px",color:"#f1f5f9",fontWeight:"700",fontSize:"0.75rem",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>{r.routeName}</td>
        <td style={{padding:"11px 14px",color:"rgba(255,255,255,0.7)",fontSize:"0.75rem",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>{r.driverName||"—"}</td>
        <td style={{padding:"11px 14px",fontFamily:"monospace",direction:"ltr",fontSize:"0.6rem",color:"rgba(255,255,255,0.6)",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>{r.vehicleNo||"—"}</td>
        <td style={{padding:"11px 14px",color:"rgba(255,255,255,0.7)",fontSize:"0.75rem",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>{r.capacity}</td>
        <td style={{padding:"11px 14px",borderBottom:"1px solid rgba(255,255,255,0.05)"}}><span style={{color:occ>=r.capacity?"#f87171":"#4ade80",fontWeight:"700",fontSize:"0.75rem"}}>{occ}/{r.capacity}</span></td>
      </tr>; })}{routes.length===0&&<tr><td colSpan={5} style={{padding:"40px",textAlign:"center",color:"rgba(255,255,255,0.3)"}}>کوئی روٹ نہیں</td></tr>}</tbody>
    </table></div></div>}`
);

console.log('Transport done:', n);

// ===================== NOTICE BOARD =====================
rep(
  `  return <div style={S.page}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
      <div><div style={{fontSize:"1.1rem",fontWeight:"700",color:C.navy}}>📌 نوٹس بورڈ</div><div style={{fontSize:"0.62rem",color:"#888",marginTop:"2px"}}>اطلاعات، احکامات، اعلانات</div></div>
      <button style={S.addBtn} onClick={()=>setShow(!show)}>+ نیا نوٹس</button>
    </div>`,
  `
  const G="#d4af37"; const N="#0f172a"; const N2="#1e293b";
  const glass=${GLASS};
  const inp={width:"100%",padding:"10px 14px",borderRadius:"10px",border:"1px solid rgba(212,175,55,0.25)",background:"rgba(255,255,255,0.06)",color:"#f1f5f9",fontSize:"0.8rem",fontFamily:"'Public Sans',sans-serif",outline:"none",boxSizing:"border-box",direction:"rtl",colorScheme:"dark"};
  const lbl={fontSize:"0.7rem",color:"rgba(212,175,55,0.8)",marginBottom:"6px",display:"block",fontWeight:"600"};
  return <div style=${DARK_WRAP}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"24px",flexWrap:"wrap",gap:"12px"}}>
      <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
        <div style={{width:"44px",height:"44px",borderRadius:"12px",background:"linear-gradient(135deg,#d4af37,#b8960a)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 20px rgba(212,175,55,0.4)"}}><span className="material-symbols-rounded" style={{fontSize:"24px",color:N}}>campaign</span></div>
        <div><h2 style={{margin:0,fontSize:"1.4rem",fontWeight:"800",color:"#f1f5f9"}}>نوٹس بورڈ</h2><p style={{margin:0,fontSize:"0.72rem",color:"rgba(212,175,55,0.7)"}}>اطلاعات، احکامات، اعلانات</p></div>
      </div>
      <button style={{display:"flex",alignItems:"center",gap:"8px",padding:"10px 20px",borderRadius:"12px",border:"1px solid #d4af37",background:show?"rgba(212,175,55,0.15)":"transparent",color:"#d4af37",fontWeight:"700",fontSize:"0.82rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif"}} onClick={()=>setShow(!show)}><span className="material-symbols-rounded" style={{fontSize:"18px"}}>{show?"close":"add_circle"}</span>{show?"منسوخ":"نیا نوٹس"}</button>
    </div>`
);

// NoticeBoard form
rep(
  `    {show&&<div className="hv-card" style={{...S.card,marginBottom:"20px",background:\`linear-gradient(135deg,\${C.goldLight},#fdf8ee)\`,border:\`2px solid \${C.gold}30\`}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div style={{gridColumn:"1/-1"}}><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>عنوان *</label><input style={S.inpSm} value={f.title} onChange={e=>setF({...f,title:e.target.value})} placeholder="نوٹس کا عنوان..."/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>زمرہ</label><select style={S.inpSm} value={f.category} onChange={e=>setF({...f,category:e.target.value})}>{Object.entries(catConfig).map(([k,v])=><option key={k} value={k}>{v.i} {v.l}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>ترجیح</label><select style={S.inpSm} value={f.priority} onChange={e=>setF({...f,priority:e.target.value})}><option value="normal">عام</option><option value="high">اہم</option><option value="urgent">فوری</option></select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>میعاد ختم</label><input style={{...S.inpSm,direction:"ltr"}} type="date" value={f.expiryDate} onChange={e=>setF({...f,expiryDate:e.target.value})}/></div>
        <div style={{display:"flex",alignItems:"center",gap:"8px",paddingTop:"20px"}}><input type="checkbox" checked={f.pinned} onChange={e=>setF({...f,pinned:e.target.checked})} id="pin"/><label htmlFor="pin" style={{fontSize:"0.68rem",color:C.navy,cursor:"pointer"}}>📌 اوپر پن کریں</label></div>
        <div style={{gridColumn:"1/-1"}}><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>مواد *</label><textarea style={{...S.inpSm,minHeight:"100px",resize:"vertical"}} value={f.content} onChange={e=>setF({...f,content:e.target.value})} placeholder="نوٹس کا مکمل متن..."/></div>
      </div>
      <button style={S.saveBtn} onClick={add}>📌 شائع کریں</button>
    </div>}`,
  `    {show&&<div style={{...glass,padding:"24px",marginBottom:"20px",borderColor:"rgba(212,175,55,0.3)"}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div style={{gridColumn:"1/-1"}}><label style={lbl}>عنوان *</label><input style={inp} value={f.title} onChange={e=>setF({...f,title:e.target.value})} placeholder="نوٹس کا عنوان..."/></div>
        <div><label style={lbl}>زمرہ</label><select style={inp} value={f.category} onChange={e=>setF({...f,category:e.target.value})}>{Object.entries(catConfig).map(([k,v])=><option key={k} value={k} style={{background:N2}}>{v.i} {v.l}</option>)}</select></div>
        <div><label style={lbl}>ترجیح</label><select style={inp} value={f.priority} onChange={e=>setF({...f,priority:e.target.value})}><option value="normal" style={{background:N2}}>عام</option><option value="high" style={{background:N2}}>اہم</option><option value="urgent" style={{background:N2}}>فوری</option></select></div>
        <div><label style={lbl}>میعاد ختم</label><input style={{...inp,direction:"ltr",colorScheme:"dark"}} type="date" value={f.expiryDate} onChange={e=>setF({...f,expiryDate:e.target.value})}/></div>
        <div style={{display:"flex",alignItems:"center",gap:"8px"}}><input type="checkbox" checked={f.pinned} onChange={e=>setF({...f,pinned:e.target.checked})} id="pin"/><label htmlFor="pin" style={{fontSize:"0.68rem",color:"#f1f5f9",cursor:"pointer"}}>📌 اوپر پن کریں</label></div>
        <div style={{gridColumn:"1/-1"}}><label style={lbl}>مواد *</label><textarea style={{...inp,minHeight:"100px",resize:"vertical"}} value={f.content} onChange={e=>setF({...f,content:e.target.value})} placeholder="نوٹس کا مکمل متن..."/></div>
      </div>
      <button style={{background:"linear-gradient(135deg,#d4af37,#b8960a)",color:N,border:"none",borderRadius:"12px",padding:"11px 26px",fontSize:"0.82rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif",fontWeight:"700"}} onClick={add}>شائع کریں</button>
    </div>}`
);

// NoticeBoard pinned section header
rep(
  `      <div style={{fontSize:"0.72rem",fontWeight:"700",color:C.gold,marginBottom:"10px"}}>📌 پن شدہ نوٹسز</div>`,
  `      <div style={{fontSize:"0.72rem",fontWeight:"700",color:"#d4af37",marginBottom:"10px"}}>📌 پن شدہ نوٹسز</div>`
);

// NoticeBoard pinned cards
rep(
  `      {pinned.map(n=>{ const cc=catConfig[n.category]||catConfig.general; return <div key={n.id} className="hv-card" style={{...S.card,marginBottom:"10px",borderRight:\`4px solid \${cc.c}\`,background:\`linear-gradient(135deg,\${cc.bg},#fff)\`,borderTop:\`2px solid \${C.gold}30\`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"8px"}}>
          <div style={{flex:1}}><div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"4px"}}><span style={{fontSize:"1rem"}}>{cc.i}</span><span style={{fontSize:"0.85rem",fontWeight:"700",color:C.navy}}>{n.title}</span><span style={{fontSize:"0.55rem",color:C.gold}}>📌</span></div></div>
          <span style={{...hBadge(cc.c,cc.bg),fontSize:"0.55rem"}}>{cc.l}</span>
        </div>
        <div style={{fontSize:"0.7rem",color:"#555",lineHeight:"1.7"}}>{n.content}</div>
      </div>; })}`,
  `      {pinned.map(n=>{ const cc=catConfig[n.category]||catConfig.general; return <div key={n.id} style={{...glass,padding:"16px 20px",marginBottom:"10px",borderRight:\`4px solid \${cc.c}\`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"8px"}}>
          <div style={{flex:1}}><div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"4px"}}><span style={{fontSize:"1rem"}}>{cc.i}</span><span style={{fontSize:"0.85rem",fontWeight:"700",color:"#f1f5f9"}}>{n.title}</span><span style={{fontSize:"0.55rem",color:"#d4af37"}}>📌</span></div></div>
          <span style={{padding:"3px 8px",borderRadius:"20px",fontSize:"0.55rem",fontWeight:"700",background:"rgba(255,255,255,0.1)",color:"rgba(255,255,255,0.7)"}}>{cc.l}</span>
        </div>
        <div style={{fontSize:"0.7rem",color:"rgba(255,255,255,0.6)",lineHeight:"1.7"}}>{n.content}</div>
      </div>; })}`
);

// NoticeBoard regular cards
rep(
  `      {regular.map(n=>{ const cc=catConfig[n.category]||catConfig.general; return <div key={n.id} className="hv-card" style={{...S.card,borderRight:\`4px solid \${cc.c}\`,padding:"16px 20px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"8px"}}>
          <div style={{flex:1}}><div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"4px"}}><span style={{fontSize:"1rem"}}>{cc.i}</span><span style={{fontSize:"0.82rem",fontWeight:"700",color:C.navy}}>{n.title}</span></div></div>
          <span style={{...hBadge(cc.c,cc.bg),fontSize:"0.55rem"}}>{cc.l}</span>
        </div>
        <div style={{fontSize:"0.68rem",color:"#555",lineHeight:"1.7"}}>{n.content}</div>
      </div>; })}
      {notices.length===0&&<div className="hv-card" style={{...S.card,textAlign:"center",color:"#bbb",padding:"60px"}}>ابھی کوئی نوٹس نہیں!</div>}`,
  `      {regular.map(n=>{ const cc=catConfig[n.category]||catConfig.general; return <div key={n.id} style={{...glass,padding:"16px 20px",borderRight:\`4px solid \${cc.c}\`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"8px"}}>
          <div style={{flex:1}}><div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"4px"}}><span style={{fontSize:"1rem"}}>{cc.i}</span><span style={{fontSize:"0.82rem",fontWeight:"700",color:"#f1f5f9"}}>{n.title}</span></div></div>
          <span style={{padding:"3px 8px",borderRadius:"20px",fontSize:"0.55rem",fontWeight:"700",background:"rgba(255,255,255,0.1)",color:"rgba(255,255,255,0.7)"}}>{cc.l}</span>
        </div>
        <div style={{fontSize:"0.68rem",color:"rgba(255,255,255,0.55)",lineHeight:"1.7"}}>{n.content}</div>
      </div>; })}
      {notices.length===0&&<div style={{...glass,textAlign:"center",color:"rgba(255,255,255,0.3)",padding:"60px"}}><span className="material-symbols-rounded" style={{fontSize:"48px",display:"block",marginBottom:"12px",color:"rgba(212,175,55,0.3)"}}>campaign</span>ابھی کوئی نوٹس نہیں!</div>}`
);

console.log('NoticeBoard done:', n);
fs.writeFileSync(path, content, 'utf8');
console.log('Saved. Replacements:', n);
