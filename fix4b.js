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

// Fix transport assign tab (missed in fix4a)
rep(
  `   {tab==="assign"&&<div className="hv-card" style={{...S.card,marginBottom:"16px",background:\`linear-gradient(135deg,\${C.goldLight},#fdf8ee)\`}}>`,
  `   {tab==="assign"&&<div style={{...glass,padding:"24px",marginBottom:"16px"}}>`
);
rep(
  `        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>طالب علم</label><select style={S.inpSm} value={assignF.studentId} onChange={e=>setAssignF({...assignF,studentId:e.target.value})}><option value="">-- منتخب کریں --</option>{students.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>روٹ</label><select style={S.inpSm} value={assignF.routeId} onChange={e=>setAssignF({...assignF,routeId:e.target.value})}><option value="">-- منتخب کریں --</option>{routes.map(r=><option key={r.id} value={r.id}>{r.routeName}</option>)}</select></div>`,
  `        <div><label style={lbl}>طالب علم</label><select style={inp} value={assignF.studentId} onChange={e=>setAssignF({...assignF,studentId:e.target.value})}><option value="" style={{background:N2}}>-- منتخب کریں --</option>{students.map(s=><option key={s.id} value={s.id} style={{background:N2}}>{s.name}</option>)}</select></div>
        <div><label style={lbl}>روٹ</label><select style={inp} value={assignF.routeId} onChange={e=>setAssignF({...assignF,routeId:e.target.value})}><option value="" style={{background:N2}}>-- منتخب کریں --</option>{routes.map(r=><option key={r.id} value={r.id} style={{background:N2}}>{r.routeName}</option>)}</select></div>`
);

console.log('Transport assign fix:', n);

// ===================== HOSTEL MANAGEMENT =====================
rep(
  `  return <div style={S.page}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
      <div><div style={{fontSize:"1.1rem",fontWeight:"700",color:C.navy}}>🏠 ہوسٹل مینجمنٹ</div><div style={{fontSize:"0.62rem",color:"#888",marginTop:"2px"}}>رہائشی طلبا — کمرے اور سہولیات</div></div>
      <button style={S.addBtn} onClick={()=>setShow(!show)}>+ نیا کمرہ</button>
    </div>`,
  `
  const G="#d4af37"; const N="#0f172a"; const N2="#1e293b";
  const glass=${GLASS};
  const inp={width:"100%",padding:"10px 14px",borderRadius:"10px",border:"1px solid rgba(212,175,55,0.25)",background:"rgba(255,255,255,0.06)",color:"#f1f5f9",fontSize:"0.8rem",fontFamily:"'Public Sans',sans-serif",outline:"none",boxSizing:"border-box",direction:"rtl",colorScheme:"dark"};
  const lbl={fontSize:"0.7rem",color:"rgba(212,175,55,0.8)",marginBottom:"6px",display:"block",fontWeight:"600"};
  return <div style=${DARK_WRAP}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"24px",flexWrap:"wrap",gap:"12px"}}>
      <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
        <div style={{width:"44px",height:"44px",borderRadius:"12px",background:"linear-gradient(135deg,#d4af37,#b8960a)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 20px rgba(212,175,55,0.4)"}}><span className="material-symbols-rounded" style={{fontSize:"24px",color:N}}>night_shelter</span></div>
        <div><h2 style={{margin:0,fontSize:"1.4rem",fontWeight:"800",color:"#f1f5f9"}}>ہوسٹل مینجمنٹ</h2><p style={{margin:0,fontSize:"0.72rem",color:"rgba(212,175,55,0.7)"}}>رہائشی طلبا — کمرے اور سہولیات</p></div>
      </div>
      <button style={{display:"flex",alignItems:"center",gap:"8px",padding:"10px 20px",borderRadius:"12px",border:"1px solid #d4af37",background:show?"rgba(212,175,55,0.15)":"transparent",color:"#d4af37",fontWeight:"700",fontSize:"0.82rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif"}} onClick={()=>setShow(!show)}><span className="material-symbols-rounded" style={{fontSize:"18px"}}>{show?"close":"add_circle"}</span>{show?"منسوخ":"نیا کمرہ"}</button>
    </div>`
);

// Hostel stats cards
rep(
  `    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:"12px",marginBottom:"20px"}}>
      {[{c:C.abuBakr,i:"🏠",n:rooms.length,l:"کمرے"},{c:C.green,i:"👥",n:totalResidents,l:"رہائشی"},{c:C.amber,i:"🛏️",n:totalCapacity-totalResidents,l:"خالی"},{c:C.gold,i:"💰",n:\`Rs.\${(residents.filter(r=>r.status==="active").reduce((s,r)=>s+(r.monthlyFee||0),0)/1000).toFixed(0)}K\`,l:"ماہانہ آمدن"}].map((x,i)=><div key={i} style={{background:\`linear-gradient(135deg,\${x.c}12,\${x.c}05)\`,borderRadius:"16px",padding:"16px",border:\`2px solid \${x.c}20\`,textAlign:"center"}}><div style={{fontSize:"1.3rem"}}>{x.i}</div><div style={{fontSize:"1.4rem",fontWeight:"900",color:x.c}}>{x.n}</div><div style={{fontSize:"0.6rem",color:"#888"}}>{x.l}</div></div>)}
    </div>`,
  `    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:"12px",marginBottom:"20px"}}>
      {[{c:"#60a5fa",i:"🏠",n:rooms.length,l:"کمرے"},{c:"#4ade80",i:"👥",n:totalResidents,l:"رہائشی"},{c:"#fb923c",i:"🛏️",n:totalCapacity-totalResidents,l:"خالی"},{c:"#d4af37",i:"💰",n:\`Rs.\${(residents.filter(r=>r.status==="active").reduce((s,r)=>s+(r.monthlyFee||0),0)/1000).toFixed(0)}K\`,l:"ماہانہ آمدن"}].map((x,i)=><div key={i} style={{background:\`\${x.c}15\`,borderRadius:"16px",padding:"16px",border:\`1px solid \${x.c}30\`,textAlign:"center"}}><div style={{fontSize:"1.3rem"}}>{x.i}</div><div style={{fontSize:"1.4rem",fontWeight:"900",color:x.c}}>{x.n}</div><div style={{fontSize:"0.6rem",color:"rgba(255,255,255,0.5)"}}>{x.l}</div></div>)}
    </div>`
);

// Hostel add room form
rep(
  `    {show&&<div className="hv-card" style={{...S.card,marginBottom:"20px",background:\`linear-gradient(135deg,\${C.goldLight},#fdf8ee)\`}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>کمرہ نمبر *</label><input style={{...S.inpSm,direction:"ltr"}} value={f.roomNo} onChange={e=>setF({...f,roomNo:e.target.value})} placeholder="101, 202..."/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>منزل</label><select style={S.inpSm} value={f.floor} onChange={e=>setF({...f,floor:e.target.value})}>{["Ground","First","Second","Third"].map(fl=><option key={fl}>{fl}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>گنجائش</label><input style={{...S.inpSm,direction:"ltr"}} type="number" value={f.capacity} onChange={e=>setF({...f,capacity:e.target.value})}/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>قسم</label><select style={S.inpSm} value={f.type} onChange={e=>setF({...f,type:e.target.value})}><option value="standard">معیاری</option><option value="ac">AC</option><option value="vip">VIP</option></select></div>
      </div>
      <button style={S.saveBtn} onClick={addRoom}>✅ کمرہ شامل کریں</button>
    </div>}`,
  `    {show&&<div style={{...glass,padding:"24px",marginBottom:"20px",borderColor:"rgba(212,175,55,0.3)"}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div><label style={lbl}>کمرہ نمبر *</label><input style={{...inp,direction:"ltr"}} value={f.roomNo} onChange={e=>setF({...f,roomNo:e.target.value})} placeholder="101, 202..."/></div>
        <div><label style={lbl}>منزل</label><select style={inp} value={f.floor} onChange={e=>setF({...f,floor:e.target.value})}>{["Ground","First","Second","Third"].map(fl=><option key={fl} style={{background:N2}}>{fl}</option>)}</select></div>
        <div><label style={lbl}>گنجائش</label><input style={{...inp,direction:"ltr",colorScheme:"dark"}} type="number" value={f.capacity} onChange={e=>setF({...f,capacity:e.target.value})}/></div>
        <div><label style={lbl}>قسم</label><select style={inp} value={f.type} onChange={e=>setF({...f,type:e.target.value})}><option value="standard" style={{background:N2}}>معیاری</option><option value="ac" style={{background:N2}}>AC</option><option value="vip" style={{background:N2}}>VIP</option></select></div>
      </div>
      <button style={{background:"linear-gradient(135deg,#d4af37,#b8960a)",color:N,border:"none",borderRadius:"12px",padding:"11px 26px",fontSize:"0.82rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif",fontWeight:"700"}} onClick={addRoom}>کمرہ شامل کریں</button>
    </div>}`
);

// Hostel tabs
rep(
  `    <div style={{display:"flex",gap:"8px",marginBottom:"16px"}}>{[["rooms","🏠 کمرے"],["residents","👥 رہائشی"],["assign","➕ داخلہ"]].map(([t,l])=><button key={t} onClick={()=>setTab(t)} style={{padding:"8px 14px",borderRadius:"10px",border:"none",cursor:"pointer",fontSize:"0.65rem",fontWeight:tab===t?"700":"400",background:tab===t?\`linear-gradient(135deg,\${C.gold},\${C.goldDark})\`:C.white,color:tab===t?C.white:"#888",fontFamily:"inherit"}}>{l}</button>)}</div>`,
  `    <div style={{display:"flex",gap:"8px",marginBottom:"16px"}}>{[["rooms","🏠 کمرے"],["residents","👥 رہائشی"],["assign","➕ داخلہ"]].map(([t,l])=><button key={t} onClick={()=>setTab(t)} style={{padding:"8px 14px",borderRadius:"10px",border:tab===t?"none":"1px solid rgba(255,255,255,0.1)",cursor:"pointer",fontSize:"0.65rem",fontWeight:tab===t?"700":"400",background:tab===t?"linear-gradient(135deg,#d4af37,#b8960a)":"rgba(255,255,255,0.04)",color:tab===t?"#0f172a":"rgba(255,255,255,0.6)",fontFamily:"inherit"}}>{l}</button>)}</div>`
);

// Hostel room cards
rep(
  `    {tab==="rooms"&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:"14px"}}>
      {rooms.map(r=>{ const occ=getOccupancy(r.id); const full=occ>=r.capacity; return <div key={r.id} className="hv-card" style={{...S.card,borderTop:\`4px solid \${full?C.red:occ>0?C.amber:C.green}\`}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:"8px"}}><div style={{fontSize:"1.2rem",fontWeight:"800",color:C.navy}}>🏠 {r.roomNo}</div><span style={{...hBadge(full?C.red:occ>0?C.amber:C.green,full?"#fee2e2":occ>0?"#fef3c7":"#dcfce7")}}>{full?"بھرا":occ>0?"جزوی":"خالی"}</span></div>
        <div style={{fontSize:"0.62rem",color:"#888",marginBottom:"8px"}}>{r.floor} Floor • {r.type}</div>
        {pBar(occ,r.capacity||1,full?C.red:C.green)}
        <div style={{fontSize:"0.6rem",color:"#888",marginTop:"4px"}}>{occ}/{r.capacity} رہائشی</div>
      </div>; })}
      {rooms.length===0&&<div className="hv-card" style={{...S.card,textAlign:"center",color:"#bbb",padding:"40px",gridColumn:"1/-1"}}>کوئی کمرہ نہیں</div>}
    </div>}`,
  `    {tab==="rooms"&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:"14px"}}>
      {rooms.map(r=>{ const occ=getOccupancy(r.id); const full=occ>=r.capacity; return <div key={r.id} style={{...glass,padding:"18px",borderTop:\`3px solid \${full?"#f87171":occ>0?"#fb923c":"#4ade80"}\`}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:"8px"}}><div style={{fontSize:"1.2rem",fontWeight:"800",color:"#f1f5f9"}}>🏠 {r.roomNo}</div><span style={{padding:"3px 8px",borderRadius:"20px",fontSize:"0.55rem",fontWeight:"700",background:"rgba(255,255,255,0.1)",color:full?"#f87171":occ>0?"#fb923c":"#4ade80"}}>{full?"بھرا":occ>0?"جزوی":"خالی"}</span></div>
        <div style={{fontSize:"0.62rem",color:"rgba(255,255,255,0.5)",marginBottom:"8px"}}>{r.floor} Floor • {r.type}</div>
        {pBar(occ,r.capacity||1,full?"#f87171":"#4ade80")}
        <div style={{fontSize:"0.6rem",color:"rgba(255,255,255,0.4)",marginTop:"4px"}}>{occ}/{r.capacity} رہائشی</div>
      </div>; })}
      {rooms.length===0&&<div style={{...glass,textAlign:"center",color:"rgba(255,255,255,0.3)",padding:"40px",gridColumn:"1/-1"}}>کوئی کمرہ نہیں</div>}
    </div>}`
);

// Hostel assign resident form
rep(
  `    {tab==="assign"&&<div className="hv-card" style={{...S.card,background:\`linear-gradient(135deg,\${C.goldLight},#fdf8ee)\`}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>طالب علم *</label><select style={S.inpSm} value={resF.studentId} onChange={e=>setResF({...resF,studentId:e.target.value})}><option value="">-- منتخب کریں --</option>{students.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>کمرہ *</label><select style={S.inpSm} value={resF.roomId} onChange={e=>setResF({...resF,roomId:e.target.value})}><option value="">-- منتخب کریں --</option>{rooms.filter(r=>getOccupancy(r.id)<r.capacity).map(r=><option key={r.id} value={r.id}>{r.roomNo} ({getOccupancy(r.id)}/{r.capacity})</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>چیک ان تاریخ</label><input style={{...S.inpSm,direction:"ltr"}} type="date" value={resF.checkIn} onChange={e=>setResF({...resF,checkIn:e.target.value})}/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>ماہانہ فیس</label><input style={{...S.inpSm,direction:"ltr"}} type="number" value={resF.monthlyFee} onChange={e=>setResF({...resF,monthlyFee:e.target.value})}/></div>
      </div>
      <button style={S.saveBtn} onClick={addResident}>✅ رہائشی شامل کریں</button>
    </div>}`,
  `    {tab==="assign"&&<div style={{...glass,padding:"24px"}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div><label style={lbl}>طالب علم *</label><select style={inp} value={resF.studentId} onChange={e=>setResF({...resF,studentId:e.target.value})}><option value="" style={{background:N2}}>-- منتخب کریں --</option>{students.map(s=><option key={s.id} value={s.id} style={{background:N2}}>{s.name}</option>)}</select></div>
        <div><label style={lbl}>کمرہ *</label><select style={inp} value={resF.roomId} onChange={e=>setResF({...resF,roomId:e.target.value})}><option value="" style={{background:N2}}>-- منتخب کریں --</option>{rooms.filter(r=>getOccupancy(r.id)<r.capacity).map(r=><option key={r.id} value={r.id} style={{background:N2}}>{r.roomNo} ({getOccupancy(r.id)}/{r.capacity})</option>)}</select></div>
        <div><label style={lbl}>چیک ان تاریخ</label><input style={{...inp,direction:"ltr",colorScheme:"dark"}} type="date" value={resF.checkIn} onChange={e=>setResF({...resF,checkIn:e.target.value})}/></div>
        <div><label style={lbl}>ماہانہ فیس</label><input style={{...inp,direction:"ltr",colorScheme:"dark"}} type="number" value={resF.monthlyFee} onChange={e=>setResF({...resF,monthlyFee:e.target.value})}/></div>
      </div>
      <button style={{background:"linear-gradient(135deg,#d4af37,#b8960a)",color:N,border:"none",borderRadius:"12px",padding:"11px 26px",fontSize:"0.82rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif",fontWeight:"700"}} onClick={addResident}>رہائشی شامل کریں</button>
    </div>}`
);

// Hostel residents table
rep(
  `    {tab==="residents"&&<div style={S.card} className="hv-card"><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}>
      <thead><tr><th style={S.th}>طالب علم</th><th style={S.th}>کمرہ</th><th style={S.th}>چیک ان</th><th style={S.th}>ماہانہ فیس</th><th style={S.th}>حال</th></tr></thead>
      <tbody>{residents.map(r=>{ const st=students.find(s=>s.id===r.studentId); const rm=rooms.find(x=>x.id===r.roomId); return <tr key={r.id}>
        <td style={{...S.td,fontWeight:"700"}}>{st?.name||"—"}</td>
        <td style={S.td}>{rm?.roomNo||"—"}</td>
        <td style={{...S.td,fontFamily:"monospace",direction:"ltr",fontSize:"0.6rem"}}>{r.checkIn}</td>
        <td style={{...S.td,fontWeight:"700",color:C.green}}>Rs. {(r.monthlyFee||0).toLocaleString()}</td>
        <td style={S.td}><span style={{padding:"3px 8px",borderRadius:"20px",fontSize:"0.55rem",fontWeight:"700",background:r.status==="active"?"#dcfce7":"#f3f4f6",color:r.status==="active"?C.green:"#888"}}>{r.status==="active"?"فعال":"غیر فعال"}</span></td>
      </tr>; })}{residents.length===0&&<tr><td colSpan={5} style={{...S.td,textAlign:"center",color:"#bbb",padding:"40px"}}>کوئی رہائشی نہیں</td></tr>}</tbody>
    </table></div></div>}`,
  `    {tab==="residents"&&<div style={{...glass,overflow:"hidden"}}><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}>
      <thead><tr style={{background:"rgba(255,255,255,0.04)"}}>{["طالب علم","کمرہ","چیک ان","ماہانہ فیس","حال"].map(h=><th key={h} style={{padding:"12px 14px",textAlign:"right",fontSize:"0.65rem",color:"rgba(212,175,55,0.8)",fontWeight:"700"}}>{h}</th>)}</tr></thead>
      <tbody>{residents.map((r,ri)=>{ const st=students.find(s=>s.id===r.studentId); const rm=rooms.find(x=>x.id===r.roomId); return <tr key={r.id} style={{background:ri%2===0?"rgba(255,255,255,0.02)":"transparent"}}>
        <td style={{padding:"11px 14px",color:"#f1f5f9",fontWeight:"700",fontSize:"0.75rem",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>{st?.name||"—"}</td>
        <td style={{padding:"11px 14px",color:"rgba(255,255,255,0.7)",fontSize:"0.75rem",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>{rm?.roomNo||"—"}</td>
        <td style={{padding:"11px 14px",fontFamily:"monospace",direction:"ltr",fontSize:"0.6rem",color:"rgba(255,255,255,0.6)",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>{r.checkIn}</td>
        <td style={{padding:"11px 14px",fontWeight:"700",color:"#4ade80",fontSize:"0.75rem",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>Rs. {(r.monthlyFee||0).toLocaleString()}</td>
        <td style={{padding:"11px 14px",borderBottom:"1px solid rgba(255,255,255,0.05)"}}><span style={{padding:"3px 8px",borderRadius:"20px",fontSize:"0.55rem",fontWeight:"700",background:r.status==="active"?"rgba(74,222,128,0.15)":"rgba(255,255,255,0.06)",color:r.status==="active"?"#4ade80":"rgba(255,255,255,0.4)"}}>{r.status==="active"?"فعال":"غیر فعال"}</span></td>
      </tr>; })}{residents.length===0&&<tr><td colSpan={5} style={{padding:"40px",textAlign:"center",color:"rgba(255,255,255,0.3)"}}>کوئی رہائشی نہیں</td></tr>}</tbody>
    </table></div></div>}`
);

console.log('Hostel done:', n);

// ===================== STUDENT HEALTH =====================
rep(
  `  return <div style={S.page}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
      <div><div style={{fontSize:"1.1rem",fontWeight:"700",color:C.navy}}>🏥 صحت و تندرستی</div><div style={{fontSize:"0.62rem",color:"#888",marginTop:"2px"}}>طلبا کی صحت کا ریکارڈ</div></div>
      <button style={S.addBtn} onClick={()=>setShow(!show)}>+ نیا ریکارڈ</button>
    </div>`,
  `
  const G="#d4af37"; const N="#0f172a"; const N2="#1e293b";
  const glass=${GLASS};
  const inp={width:"100%",padding:"10px 14px",borderRadius:"10px",border:"1px solid rgba(212,175,55,0.25)",background:"rgba(255,255,255,0.06)",color:"#f1f5f9",fontSize:"0.8rem",fontFamily:"'Public Sans',sans-serif",outline:"none",boxSizing:"border-box",direction:"rtl",colorScheme:"dark"};
  const lbl={fontSize:"0.7rem",color:"rgba(212,175,55,0.8)",marginBottom:"6px",display:"block",fontWeight:"600"};
  return <div style=${DARK_WRAP}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"24px",flexWrap:"wrap",gap:"12px"}}>
      <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
        <div style={{width:"44px",height:"44px",borderRadius:"12px",background:"linear-gradient(135deg,#d4af37,#b8960a)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 20px rgba(212,175,55,0.4)"}}><span className="material-symbols-rounded" style={{fontSize:"24px",color:N}}>health_and_safety</span></div>
        <div><h2 style={{margin:0,fontSize:"1.4rem",fontWeight:"800",color:"#f1f5f9"}}>صحت و تندرستی</h2><p style={{margin:0,fontSize:"0.72rem",color:"rgba(212,175,55,0.7)"}}>طلبا کی صحت کا ریکارڈ</p></div>
      </div>
      <button style={{display:"flex",alignItems:"center",gap:"8px",padding:"10px 20px",borderRadius:"12px",border:"1px solid #d4af37",background:show?"rgba(212,175,55,0.15)":"transparent",color:"#d4af37",fontWeight:"700",fontSize:"0.82rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif"}} onClick={()=>setShow(!show)}><span className="material-symbols-rounded" style={{fontSize:"18px"}}>{show?"close":"add_circle"}</span>{show?"منسوخ":"نیا ریکارڈ"}</button>
    </div>`
);

// Health stats
rep(
  `    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:"12px",marginBottom:"20px"}}>
      {[{c:C.abuBakr,i:"📋",n:records.length,l:"کل وزٹ"},{c:C.red,i:"🤒",n:records.filter(r=>r.type==="sick").length,l:"بیماری"},{c:C.amber,i:"🤕",n:records.filter(r=>r.type==="injury").length,l:"چوٹ"},{c:C.green,i:"✅",n:records.filter(r=>r.type==="checkup").length,l:"چیک اپ"}].map((x,i)=><div key={i} style={{background:\`linear-gradient(135deg,\${x.c}12,\${x.c}05)\`,borderRadius:"16px",padding:"16px",border:\`2px solid \${x.c}20\`,textAlign:"center"}}><div style={{fontSize:"1.3rem"}}>{x.i}</div><div style={{fontSize:"1.4rem",fontWeight:"900",color:x.c}}>{x.n}</div><div style={{fontSize:"0.6rem",color:"#888"}}>{x.l}</div></div>)}
    </div>`,
  `    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:"12px",marginBottom:"20px"}}>
      {[{c:"#60a5fa",i:"📋",n:records.length,l:"کل وزٹ"},{c:"#f87171",i:"🤒",n:records.filter(r=>r.type==="sick").length,l:"بیماری"},{c:"#fb923c",i:"🤕",n:records.filter(r=>r.type==="injury").length,l:"چوٹ"},{c:"#4ade80",i:"✅",n:records.filter(r=>r.type==="checkup").length,l:"چیک اپ"}].map((x,i)=><div key={i} style={{background:\`\${x.c}15\`,borderRadius:"16px",padding:"16px",border:\`1px solid \${x.c}30\`,textAlign:"center"}}><div style={{fontSize:"1.3rem"}}>{x.i}</div><div style={{fontSize:"1.4rem",fontWeight:"900",color:x.c}}>{x.n}</div><div style={{fontSize:"0.6rem",color:"rgba(255,255,255,0.5)"}}>{x.l}</div></div>)}
    </div>`
);

// Health form
rep(
  `    {show&&<div className="hv-card" style={{...S.card,marginBottom:"20px",background:\`linear-gradient(135deg,#dcfce7,#f0fdf4)\`,border:\`2px solid \${C.green}20\`}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>طالب علم *</label><select style={S.inpSm} value={f.studentId} onChange={e=>setF({...f,studentId:e.target.value})}><option value="">-- منتخب کریں --</option>{students.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>تاریخ</label><input style={{...S.inpSm,direction:"ltr"}} type="date" value={f.date} onChange={e=>setF({...f,date:e.target.value})}/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>قسم</label><select style={S.inpSm} value={f.type} onChange={e=>setF({...f,type:e.target.value})}>{Object.entries(types).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>شدت</label><select style={S.inpSm} value={f.severity} onChange={e=>setF({...f,severity:e.target.value})}><option value="low">معمولی</option><option value="medium">درمیانہ</option><option value="high">سنگین</option></select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>بیماری / مسئلہ</label><input style={S.inpSm} value={f.condition} onChange={e=>setF({...f,condition:e.target.value})} placeholder="بخار، سر درد..."/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>علاج</label><input style={S.inpSm} value={f.treatment} onChange={e=>setF({...f,treatment:e.target.value})} placeholder="دوائی، آرام..."/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>ڈاکٹر</label><input style={S.inpSm} value={f.doctor} onChange={e=>setF({...f,doctor:e.target.value})} placeholder="ڈاکٹر کا نام..."/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>فالو اپ تاریخ</label><input style={{...S.inpSm,direction:"ltr"}} type="date" value={f.followUp} onChange={e=>setF({...f,followUp:e.target.value})}/></div>
      </div>
      <button style={{...S.saveBtn,background:\`linear-gradient(135deg,\${C.green},#15803d)\`}} onClick={add}>✅ ریکارڈ محفوظ کریں</button>
    </div>}`,
  `    {show&&<div style={{...glass,padding:"24px",marginBottom:"20px",borderColor:"rgba(212,175,55,0.3)"}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div><label style={lbl}>طالب علم *</label><select style={inp} value={f.studentId} onChange={e=>setF({...f,studentId:e.target.value})}><option value="" style={{background:N2}}>-- منتخب کریں --</option>{students.map(s=><option key={s.id} value={s.id} style={{background:N2}}>{s.name}</option>)}</select></div>
        <div><label style={lbl}>تاریخ</label><input style={{...inp,direction:"ltr",colorScheme:"dark"}} type="date" value={f.date} onChange={e=>setF({...f,date:e.target.value})}/></div>
        <div><label style={lbl}>قسم</label><select style={inp} value={f.type} onChange={e=>setF({...f,type:e.target.value})}>{Object.entries(types).map(([k,v])=><option key={k} value={k} style={{background:N2}}>{v}</option>)}</select></div>
        <div><label style={lbl}>شدت</label><select style={inp} value={f.severity} onChange={e=>setF({...f,severity:e.target.value})}><option value="low" style={{background:N2}}>معمولی</option><option value="medium" style={{background:N2}}>درمیانہ</option><option value="high" style={{background:N2}}>سنگین</option></select></div>
        <div><label style={lbl}>بیماری / مسئلہ</label><input style={inp} value={f.condition} onChange={e=>setF({...f,condition:e.target.value})} placeholder="بخار، سر درد..."/></div>
        <div><label style={lbl}>علاج</label><input style={inp} value={f.treatment} onChange={e=>setF({...f,treatment:e.target.value})} placeholder="دوائی، آرام..."/></div>
        <div><label style={lbl}>ڈاکٹر</label><input style={inp} value={f.doctor} onChange={e=>setF({...f,doctor:e.target.value})} placeholder="ڈاکٹر کا نام..."/></div>
        <div><label style={lbl}>فالو اپ تاریخ</label><input style={{...inp,direction:"ltr",colorScheme:"dark"}} type="date" value={f.followUp} onChange={e=>setF({...f,followUp:e.target.value})}/></div>
      </div>
      <button style={{background:"linear-gradient(135deg,#d4af37,#b8960a)",color:N,border:"none",borderRadius:"12px",padding:"11px 26px",fontSize:"0.82rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif",fontWeight:"700"}} onClick={add}>ریکارڈ محفوظ کریں</button>
    </div>}`
);

// Health two-column cards
rep(
  `    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"20px"}}>
      <div style={S.card} className="hv-card">
        <div style={{fontSize:"0.85rem",fontWeight:"700",color:C.navy,marginBottom:"16px"}}>📋 حالیہ ریکارڈ</div>
        {recent.map(r=>{ const st=students.find(s=>s.id===r.studentId); const sev=sevConfig[r.severity]||sevConfig.low; return <div key={r.id} style={{display:"flex",gap:"10px",marginBottom:"12px",padding:"10px",background:"#fafaf8",borderRadius:"10px",border:\`1px solid \${sev.c}20\`}}>`,
  `    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"20px"}}>
      <div style={{...glass,padding:"20px"}}>
        <div style={{fontSize:"0.85rem",fontWeight:"700",color:"#d4af37",marginBottom:"16px"}}>📋 حالیہ ریکارڈ</div>
        {recent.map(r=>{ const st=students.find(s=>s.id===r.studentId); const sev=sevConfig[r.severity]||sevConfig.low; return <div key={r.id} style={{display:"flex",gap:"10px",marginBottom:"12px",padding:"10px",background:"rgba(255,255,255,0.04)",borderRadius:"10px",border:"1px solid rgba(255,255,255,0.08)"}}>`
);

rep(
  `          <div style={{flex:1}}><div style={{fontSize:"0.7rem",fontWeight:"700",color:C.navy}}>{st?.name||"—"}</div><div style={{fontSize:"0.6rem",color:"#888"}}>{r.condition||types[r.type]||r.type}</div><div style={{fontSize:"0.55rem",color:"#aaa",fontFamily:"monospace",direction:"ltr"}}>{r.date}</div></div>`,
  `          <div style={{flex:1}}><div style={{fontSize:"0.7rem",fontWeight:"700",color:"#f1f5f9"}}>{st?.name||"—"}</div><div style={{fontSize:"0.6rem",color:"rgba(255,255,255,0.5)"}}>{r.condition||types[r.type]||r.type}</div><div style={{fontSize:"0.55rem",color:"rgba(255,255,255,0.35)",fontFamily:"monospace",direction:"ltr"}}>{r.date}</div></div>`
);

rep(
  `        {records.length===0&&<div style={{textAlign:"center",color:"#bbb",fontSize:"0.65rem",padding:"20px"}}>کوئی ریکارڈ نہیں</div>}
      </div>
      <div style={S.card} className="hv-card">
        <div style={{fontSize:"0.85rem",fontWeight:"700",color:C.navy,marginBottom:"16px"}}>👥 طلبا کا صحت خلاصہ</div>
        {studentHealth.map(s=>{ const h=HOUSES.find(x=>x.id===s.houseId)||{}; return <div key={s.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"10px",padding:"8px 12px",background:"#fafaf8",borderRadius:"10px"}}>
          <div><div style={{fontSize:"0.7rem",fontWeight:"700",color:C.navy}}>{s.name}</div><div style={{fontSize:"0.58rem",color:"#888"}}>آخری وزٹ: {s.lastVisit}</div></div>`,
  `        {records.length===0&&<div style={{textAlign:"center",color:"rgba(255,255,255,0.3)",fontSize:"0.65rem",padding:"20px"}}>کوئی ریکارڈ نہیں</div>}
      </div>
      <div style={{...glass,padding:"20px"}}>
        <div style={{fontSize:"0.85rem",fontWeight:"700",color:"#d4af37",marginBottom:"16px"}}>👥 طلبا کا صحت خلاصہ</div>
        {studentHealth.map(s=>{ const h=HOUSES.find(x=>x.id===s.houseId)||{}; return <div key={s.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"10px",padding:"8px 12px",background:"rgba(255,255,255,0.04)",borderRadius:"10px",border:"1px solid rgba(255,255,255,0.06)"}}>
          <div><div style={{fontSize:"0.7rem",fontWeight:"700",color:"#f1f5f9"}}>{s.name}</div><div style={{fontSize:"0.58rem",color:"rgba(255,255,255,0.5)"}}>آخری وزٹ: {s.lastVisit}</div></div>`
);

rep(
  `          <span style={{...hBadge(h.color||C.gold,h.light||C.goldLight),fontSize:"0.55rem"}}>{s.visits} وزٹ</span>
        </div>; })}
        {studentHealth.length===0&&<div style={{textAlign:"center",color:"#bbb",fontSize:"0.65rem",padding:"20px"}}>کوئی ڈیٹا نہیں</div>}`,
  `          <span style={{padding:"3px 8px",borderRadius:"20px",fontSize:"0.55rem",fontWeight:"700",background:"rgba(212,175,55,0.15)",color:"#d4af37"}}>{s.visits} وزٹ</span>
        </div>; })}
        {studentHealth.length===0&&<div style={{textAlign:"center",color:"rgba(255,255,255,0.3)",fontSize:"0.65rem",padding:"20px"}}>کوئی ڈیٹا نہیں</div>}`
);

console.log('Health done:', n);
fs.writeFileSync(path, content, 'utf8');
console.log('Saved. Total replacements:', n);
