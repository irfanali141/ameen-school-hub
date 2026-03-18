/* eslint-disable */
const fs = require('fs');
const path = 'e:/app pic/AII Main Project/ameen-school-hub/src/App.js';
let content = fs.readFileSync(path, 'utf8');
const origLen = content.length;

// Dark theme tokens
const G = '"#d4af37"';
const THEME_BLOCK = `  const G="#d4af37"; const N="#0f172a"; const N2="#1e293b";
  const glass={background:"rgba(255,255,255,0.07)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:"16px"};
  const inp={width:"100%",padding:"10px 14px",borderRadius:"10px",border:"1px solid rgba(212,175,55,0.25)",background:"rgba(255,255,255,0.06)",color:"#f1f5f9",fontSize:"0.8rem",fontFamily:"'Public Sans',sans-serif",outline:"none",boxSizing:"border-box",direction:"rtl",colorScheme:"dark"};
  const lbl={fontSize:"0.7rem",color:"rgba(212,175,55,0.8)",marginBottom:"6px",display:"block",fontWeight:"600"};`;

const WRAPPER_START = `<div style={{minHeight:"100vh",background:"linear-gradient(160deg,#0f172a 0%,#0d1f3c 50%,#0a1628 100%)",padding:"24px 20px",fontFamily:"'Public Sans',sans-serif",direction:"rtl"}}>`;

function makeHeader(icon, title, subtitle) {
  return `<div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"24px"}}>
      <div style={{width:"44px",height:"44px",borderRadius:"12px",background:"linear-gradient(135deg,#d4af37,#b8960a)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 20px rgba(212,175,55,0.4)"}}>
        <span className="material-symbols-rounded" style={{fontSize:"24px",color:"#0f172a"}}>${icon}</span>
      </div>
      <div>
        <h2 style={{margin:0,fontSize:"1.4rem",fontWeight:"800",color:"#f1f5f9"}}>${title}</h2>
        <p style={{margin:0,fontSize:"0.72rem",color:"rgba(212,175,55,0.7)"}}>${subtitle}</p>
      </div>
    </div>`;
}

function makeAddBtn(label, icon = 'add_circle') {
  return `<button style={{display:"flex",alignItems:"center",gap:"8px",padding:"10px 20px",borderRadius:"12px",border:"1px solid #d4af37",background:"transparent",color:"#d4af37",fontWeight:"700",fontSize:"0.82rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif"}} onClick={()=>setShow(!show)}>
        <span className="material-symbols-rounded" style={{fontSize:"18px"}}>${icon}</span>${label}
      </button>`;
}

function makeSaveBtn(label, onClick = 'add') {
  return `<button style={{background:"linear-gradient(135deg,#d4af37,#b8960a)",color:"#0f172a",border:"none",borderRadius:"12px",padding:"11px 26px",fontSize:"0.82rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif",fontWeight:"700"}} onClick={${onClick}}>${label}</button>`;
}

function makeGlass(extra = '') {
  return `{{background:"rgba(255,255,255,0.07)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:"16px"${extra}}}`;
}

let replacements = 0;

function replace(old, neu) {
  if (content.includes(old)) {
    content = content.split(old).join(neu);
    replacements++;
    return true;
  }
  return false;
}

// ===================== HVSEntry =====================
replace(
  `  return <div style={S.page}>\n    <div style={{fontSize:"1.1rem",fontWeight:"700",color:C.navy,marginBottom:"16px"}}>🏅 HVS اندراج</div>\n    {done&&<div style={{background:"#dcfce7",border:\`2px solid \${C.green}\`,borderRadius:"14px",padding:"14px",marginBottom:"16px",textAlign:"center",fontSize:"0.78rem",fontWeight:"700",color:C.green}}>✅ کامیابی سے محفوظ ہو گیا!</div>}`,
  `
  const G="#d4af37"; const N="#0f172a"; const N2="#1e293b";
  const glass={background:"rgba(255,255,255,0.07)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:"16px"};
  const inp={width:"100%",padding:"10px 14px",borderRadius:"10px",border:"1px solid rgba(212,175,55,0.25)",background:"rgba(255,255,255,0.06)",color:"#f1f5f9",fontSize:"0.8rem",fontFamily:"'Public Sans',sans-serif",outline:"none",boxSizing:"border-box",direction:"rtl",colorScheme:"dark"};
  const lbl={fontSize:"0.7rem",color:"rgba(212,175,55,0.8)",marginBottom:"6px",display:"block",fontWeight:"600"};
  return <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#0f172a 0%,#0d1f3c 50%,#0a1628 100%)",padding:"24px 20px",fontFamily:"'Public Sans',sans-serif",direction:"rtl"}}>
    <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"24px"}}>
      <div style={{width:"44px",height:"44px",borderRadius:"12px",background:"linear-gradient(135deg,#d4af37,#b8960a)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 20px rgba(212,175,55,0.4)"}}>
        <span className="material-symbols-rounded" style={{fontSize:"24px",color:N}}>emoji_events</span>
      </div>
      <div><h2 style={{margin:0,fontSize:"1.4rem",fontWeight:"800",color:"#f1f5f9"}}>HVS اندراج</h2><p style={{margin:0,fontSize:"0.72rem",color:"rgba(212,175,55,0.7)"}}>House Values Scoring</p></div>
    </div>
    {done&&<div style={{...glass,padding:"14px 20px",marginBottom:"16px",textAlign:"center",border:"1px solid rgba(74,222,128,0.3)",background:"rgba(74,222,128,0.1)"}}>
      <span style={{color:"#4ade80",fontWeight:"700",fontSize:"0.82rem"}}>✓ کامیابی سے محفوظ ہو گیا!</span>
    </div>}`
);

// HVSEntry card -> glass
replace(
  `    <div className="hv-card" style={{...S.card,marginBottom:"16px"}}>\n      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>\n        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>ہاؤس</label>\n          <select style={S.inpSm} value={houseId} onChange={e=>setHouseId(e.target.value)}>\n            {HOUSES.map(h=><option key={h.id} value={h.id}>{h.emoji} {h.nameEn}</option>)}`,
  `    <div style={{...glass,padding:"20px",marginBottom:"16px"}}>\n      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>\n        <div><label style={lbl}>ہاؤس</label>\n          <select style={inp} value={houseId} onChange={e=>setHouseId(e.target.value)}>\n            {HOUSES.map(h=><option key={h.id} value={h.id} style={{background:N2}}>{h.emoji} {h.nameEn}</option>)}`
);

replace(
  `        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>ہفتہ *</label>\n          <input style={{...S.inpSm,direction:"ltr"}} placeholder="2026-W12" value={week} onChange={e=>setWeek(e.target.value)}/>`,
  `        <div><label style={lbl}>ہفتہ *</label>\n          <input style={{...inp,direction:"ltr",colorScheme:"dark"}} placeholder="2026-W12" value={week} onChange={e=>setWeek(e.target.value)}/>`
);

replace(
  `      {(()=>{ const h=HOUSES.find(x=>x.id===houseId)||{}; return <div style={{background:h.color+"10",borderRadius:"12px",padding:"12px",border:\`1px solid \${h.color}30\`,display:"flex",alignItems:"center",gap:"12px"}}>\n        <span style={{fontSize:"2rem"}}>{h.emoji}</span>\n        <div><div style={{fontWeight:"700",color:h.color}}>{h.name}</div><div style={{fontSize:"0.6rem",color:"#888"}}>{h.slogan}</div><div style={{fontSize:"0.6rem",color:"#aaa",marginTop:"2px"}}>{houseStudents.length} طلبا</div></div>\n      </div>; })()}\n    </div>`,
  `      {(()=>{ const h=HOUSES.find(x=>x.id===houseId)||{}; return <div style={{background:"rgba(255,255,255,0.05)",borderRadius:"12px",padding:"12px",border:\`1px solid \${h.color||"#d4af37"}30\`,display:"flex",alignItems:"center",gap:"12px"}}>\n        <span style={{fontSize:"2rem"}}>{h.emoji}</span>\n        <div><div style={{fontWeight:"700",color:h.color||G}}>{h.name}</div><div style={{fontSize:"0.6rem",color:"rgba(255,255,255,0.5)"}}>{h.slogan}</div><div style={{fontSize:"0.6rem",color:"rgba(255,255,255,0.4)",marginTop:"2px"}}>{houseStudents.length} طلبا</div></div>\n      </div>; })()}\n    </div>`
);

replace(
  `    <div style={S.card} className="hv-card">\n      <div style={{fontSize:"0.85rem",fontWeight:"700",color:C.navy,marginBottom:"14px"}}>📊 اسکور درج کریں (کل: {HVS_TOTAL})</div>\n      {HVS_CATS.map(cat=><div key={cat.id} style={{marginBottom:"16px",paddingBottom:"16px",borderBottom:\`1px solid \${C.goldLight}\`}}>`,
  `    <div style={{...glass,padding:"24px"}}>\n      <div style={{fontSize:"0.9rem",fontWeight:"700",color:G,marginBottom:"16px"}}>📊 اسکور درج کریں (کل: {HVS_TOTAL})</div>\n      {HVS_CATS.map(cat=><div key={cat.id} style={{marginBottom:"16px",paddingBottom:"16px",borderBottom:"1px solid rgba(255,255,255,0.08)"}}>`,
);

replace(
  `            <span style={{fontSize:"0.78rem",fontWeight:"700",color:C.navy}}>{cat.icon} {cat.label}</span>\n            <span style={{fontSize:"0.55rem",color:"#aaa",marginRight:"8px"}}> — {cat.desc}</span>`,
  `            <span style={{fontSize:"0.78rem",fontWeight:"700",color:"#f1f5f9"}}>{cat.icon} {cat.label}</span>\n            <span style={{fontSize:"0.55rem",color:"rgba(255,255,255,0.4)",marginRight:"8px"}}> — {cat.desc}</span>`
);

replace(
  `            <input style={{...S.inpSm,width:"60px",textAlign:"center",direction:"ltr"}} type="number" min={0} max={cat.max} value={scores[cat.id]||0} onChange={e=>setScore(cat.id,e.target.value)}/>
            <span style={{fontSize:"0.62rem",color:"#888",minWidth:"30px"}}>/{cat.max}</span>`,
  `            <input style={{...inp,width:"60px",textAlign:"center",direction:"ltr",colorScheme:"dark"}} type="number" min={0} max={cat.max} value={scores[cat.id]||0} onChange={e=>setScore(cat.id,e.target.value)}/>
            <span style={{fontSize:"0.62rem",color:"rgba(255,255,255,0.4)",minWidth:"30px"}}>/{cat.max}</span>`
);

replace(
  `      <div style={{background:\`linear-gradient(135deg,\${C.navy},\${C.navyMid})\`,borderRadius:"14px",padding:"16px",display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"14px"}}>
        <span style={{color:"rgba(255,255,255,0.8)",fontSize:"0.78rem",fontWeight:"700"}}>کل اسکور</span>
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:"2rem",fontWeight:"900",color:C.gold}}>{total}</div>
          <div style={{fontSize:"0.55rem",color:"rgba(255,255,255,0.5)"}}>/{HVS_TOTAL}</div>
        </div>
        <div style={{fontSize:"1.2rem",fontWeight:"800",color:total>=120?C.green:total>=80?C.amber:C.red}}>{total>=120?"شاندار":total>=80?"اچھا":"کمزور"}</div>
      </div>
      {pBar(total,HVS_TOTAL,total>=120?C.green:total>=80?C.amber:C.red)}
      <button style={{...S.saveBtn,width:"100%",marginTop:"16px",padding:"14px",fontSize:"0.78rem"}} onClick={save} disabled={saving}>{saving?"محفوظ ہو رہا ہے...":"✅ HVS محفوظ کریں"}</button>`,
  `      <div style={{background:"rgba(212,175,55,0.1)",borderRadius:"14px",padding:"16px",display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"14px",border:"1px solid rgba(212,175,55,0.2)"}}>
        <span style={{color:"rgba(255,255,255,0.8)",fontSize:"0.78rem",fontWeight:"700"}}>کل اسکور</span>
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:"2rem",fontWeight:"900",color:G}}>{total}</div>
          <div style={{fontSize:"0.55rem",color:"rgba(255,255,255,0.4)"}}>/{HVS_TOTAL}</div>
        </div>
        <div style={{fontSize:"1.2rem",fontWeight:"800",color:total>=120?"#4ade80":total>=80?"#fb923c":"#f87171"}}>{total>=120?"شاندار":total>=80?"اچھا":"کمزور"}</div>
      </div>
      {pBar(total,HVS_TOTAL,total>=120?"#4ade80":total>=80?"#fb923c":"#f87171")}
      <button style={{width:"100%",marginTop:"16px",padding:"14px",fontSize:"0.82rem",background:"linear-gradient(135deg,#d4af37,#b8960a)",color:N,border:"none",borderRadius:"12px",cursor:"pointer",fontWeight:"700",fontFamily:"'Public Sans',sans-serif"}} onClick={save} disabled={saving}>{saving?"محفوظ ہو رہا ہے...":"HVS محفوظ کریں"}</button>`
);

console.log(`Replacements so far: ${replacements}`);
fs.writeFileSync(path, content, 'utf8');
console.log('Saved. New size:', content.length);
