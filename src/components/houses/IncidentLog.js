/* eslint-disable */
import { useState, useEffect } from "react";
import { DEMO, HOUSES } from "../../constants";
import { getData } from "../../supabase";
import letterhead from "../../assets/letterhead.png";

// ── Cause type config ──
const CAUSES = [
  { id:"P", label:"P — Performance", labelEn:"Performance", color:"#3b82f6", bg:"#eff6ff" },
  { id:"B", label:"B — Behavior",     labelEn:"Behaviour",   color:"#f97316", bg:"#fff7ed" },
  { id:"E", label:"E — Environment",    labelEn:"Environment",  color:"#22c55e", bg:"#f0fdf4" },
  { id:"T", label:"T — Teaching",    labelEn:"Teaching",    color:"#a855f7", bg:"#faf5ff" },
];

const STATUS_OPTS = ["Open","Resolved"];

const EMPTY = () => ({
  houseId:"abuBakr", date: new Date().toISOString().slice(0,10),
  description:"", evidenceNotes:"", rootCause:"B",
  actionTaken:"", outcome:"", status:"Open",
});

// Shared dark styles
const G="#d4af37"; const N="#0f172a"; const N2="#1e293b";
const glass = { background:"rgba(255,255,255,0.06)", backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"16px" };
const inp   = { width:"100%", padding:"10px 14px", borderRadius:"10px", border:"1px solid rgba(212,175,55,0.25)", background:"rgba(255,255,255,0.06)", color:"#f1f5f9", fontSize:"0.78rem", fontFamily:"inherit", outline:"none", boxSizing:"border-box", colorScheme:"dark" };
const lbl   = { fontSize:"0.68rem", color:"rgba(212,175,55,0.8)", marginBottom:"5px", display:"block", fontWeight:"700" };

function CauseBadge({ id, inline }) {
  const c = CAUSES.find(x=>x.id===id)||CAUSES[0];
  return (
    <span style={{
      background: inline ? c.color+"20" : c.bg,
      color: c.color,
      border: `1px solid ${c.color}40`,
      borderRadius:"6px", padding:"2px 8px",
      fontSize: inline?"0.58rem":"0.65rem", fontWeight:"800",
      whiteSpace:"nowrap",
    }}>
      {c.id} {c.labelEn}
    </span>
  );
}

function StatusBadge({ s }) {
  const col = s==="Resolved" ? "#22c55e" : "#f97316";
  return (
    <span style={{ background:`${col}18`, color:col, border:`1px solid ${col}40`, borderRadius:"20px", padding:"3px 10px", fontSize:"0.6rem", fontWeight:"700", whiteSpace:"nowrap" }}>
      {s==="Resolved" ? "✅ حل شدہ" : "🔴 کھلا"}
    </span>
  );
}

const injectPrint = () => {
  if(!document.getElementById("inc-print-style")){
    const s=document.createElement("style");
    s.id="inc-print-style";
    s.innerHTML=`@media print{body *{visibility:hidden!important}#inc-print-area,#inc-print-area *{visibility:visible!important}#inc-print-area{position:fixed!important;top:0;left:0;width:100%;background:white;padding:0;margin:0;color:#000;font-family:serif}@page{margin:0;size:A4}.no-print{display:none!important}}`;
    document.head.appendChild(s);
  }
  window.print();
};

export default function IncidentLog({ addData, user }) {
  const [form,    setFormSt] = useState(EMPTY());
  const [logs,    setLogs]   = useState([]);
  const [saving,  setSaving] = useState(false);
  const [done,    setDone]   = useState(false);
  const [showForm,setShowForm]= useState(true);
  const [filter,  setFilter] = useState({ house:"", cause:"", dateFrom:"", dateTo:"", search:"", status:"" });
  const [printMonth, setPrintMonth] = useState(new Date().toISOString().slice(0,7));

  const uRole   = DEMO.find(d=>d.email===user?.email)?.role||"teacher";
  const isAdmin = uRole==="director"||uRole==="admin";

  const set = (f,v) => setFormSt(prev=>({...prev,[f]:v}));
  const setF = (f,v) => setFilter(prev=>({...prev,[f]:v}));

  const loadLogs = async () => {
    try {
      const data = await getData("investigation_cases");
      const incidents = (data||[])
        .filter(d=>d.caseType==="incident")
        .sort((a,b)=>new Date(b.date||b.created_at||0)-new Date(a.date||a.created_at||0));
      setLogs(isAdmin ? incidents : incidents.filter(l=>l.houseId===form.houseId));
    } catch(e){ console.error("loadLogs:",e.message); }
  };

  useEffect(()=>{ loadLogs(); },[form.houseId, isAdmin]);

  const save = async () => {
    if(!form.description.trim()){ alert("واقعہ کی تفصیل درج کریں"); return; }
    setSaving(true);
    const h = HOUSES.find(h=>h.id===form.houseId)||{};
    const year = new Date().getFullYear();
    const existing = logs.filter(l=>(l.caseId||"").startsWith(`INC-${year}-`));
    const caseId = `INC-${year}-${String(existing.length+1).padStart(3,"0")}`;
    try {
      await addData("investigation_cases",{
        ...form, caseId, caseType:"incident", houseName:h.nameEn,
        createdAt: new Date().toISOString(),
      });
      await loadLogs();
      setFormSt(EMPTY()); setDone(true); setTimeout(()=>setDone(false),3000);
      setShowForm(false);
    } catch(e){ console.error("save:",e.message); }
    setSaving(false);
  };

  // Apply filters
  const filtered = logs.filter(l=>{
    if(filter.house  && l.houseId!==filter.house)  return false;
    if(filter.cause  && l.rootCause!==filter.cause) return false;
    if(filter.status && l.status!==filter.status)   return false;
    if(filter.dateFrom && l.date<filter.dateFrom)   return false;
    if(filter.dateTo   && l.date>filter.dateTo)     return false;
    if(filter.search){
      const q=filter.search.toLowerCase();
      if(!(l.description||"").toLowerCase().includes(q)&&
         !(l.actionTaken||"").toLowerCase().includes(q)&&
         !(l.houseName||"").toLowerCase().includes(q)) return false;
    }
    return true;
  });

  // Logs for print (filter by month)
  const printLogs = logs.filter(l=>(l.date||"").startsWith(printMonth));

  const causeColor = id => CAUSES.find(c=>c.id===id)?.color||G;

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(160deg,#0f172a 0%,#0d1f3c 50%,#0a1628 100%)", padding:"24px 20px", fontFamily:"'Segoe UI',Arial,serif", direction:"ltr" }}>

      {/* ── Header ── */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"20px", flexWrap:"wrap", gap:"12px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
          <div style={{ width:"44px", height:"44px", borderRadius:"12px", background:"linear-gradient(135deg,#f97316,#c2410c)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.4rem", boxShadow:"0 4px 20px rgba(249,115,22,0.4)" }}>📝</div>
          <div>
            <h2 style={{ margin:0, fontSize:"1.3rem", fontWeight:"800", color:"#f1f5f9" }}>Incident Log — Incident Log</h2>
            <p style={{ margin:0, fontSize:"0.68rem", color:"rgba(212,175,55,0.7)" }}>Quick daily logging of incidents</p>
          </div>
        </div>
        <button
          onClick={()=>setShowForm(v=>!v)}
          style={{ padding:"10px 20px", borderRadius:"10px", border:"none", background:showForm?"rgba(255,255,255,0.08)":"linear-gradient(135deg,#d4af37,#b8960a)", color:showForm?"rgba(255,255,255,0.6)":N, fontSize:"0.75rem", cursor:"pointer", fontFamily:"inherit", fontWeight:"800" }}
        >
          {showForm ? "✕ فارم بند کریں" : "+ نیا واقعہ"}
        </button>
      </div>

      {/* ── Success ── */}
      {done&&<div style={{ ...glass, padding:"12px 20px", marginBottom:"16px", textAlign:"center", border:"1px solid rgba(74,222,128,0.3)", background:"rgba(74,222,128,0.08)" }}>
        <span style={{ color:"#4ade80", fontWeight:"700", fontSize:"0.8rem" }}>✓ Incident recorded successfully!</span>
      </div>}

      {/* ══ QUICK FORM ══ */}
      {showForm&&(
        <div style={{ ...glass, padding:"22px", marginBottom:"20px" }}>
          <div style={{ color:G, fontWeight:"800", fontSize:"0.88rem", marginBottom:"16px", paddingBottom:"12px", borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
            📋 نیا واقعہ درج کریں
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px", marginBottom:"12px" }}>
            <div>
              <label style={lbl}>گھر</label>
              <select style={{ ...inp, direction:"ltr" }} value={form.houseId} onChange={e=>set("houseId",e.target.value)}>
                {HOUSES.map(h=><option key={h.id} value={h.id} style={{ background:N2 }}>{h.emoji} {h.nameEn}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>تاریخ</label>
              <input style={{ ...inp, direction:"ltr" }} type="date" value={form.date} onChange={e=>set("date",e.target.value)}/>
            </div>
          </div>

          <div style={{ marginBottom:"12px" }}>
            <label style={lbl}>واقعہ کی تفصیل *</label>
            <textarea style={{ ...inp, minHeight:"72px", resize:"vertical" }} placeholder="کیا ہوا؟ مختصر اور واضح تفصیل..." value={form.description} onChange={e=>set("description",e.target.value)}/>
          </div>

          <div style={{ marginBottom:"12px" }}>
            <label style={lbl}>ثبوت کے نوٹس</label>
            <textarea style={{ ...inp, minHeight:"52px", resize:"vertical" }} placeholder="کوئی ثبوت، گواہ، یا مشاہدہ..." value={form.evidenceNotes} onChange={e=>set("evidenceNotes",e.target.value)}/>
          </div>

          {/* Root cause + action in 2 cols */}
          <div style={{ display:"grid", gridTemplateColumns:"auto 1fr", gap:"16px", marginBottom:"12px", alignItems:"start" }}>
            <div>
              <label style={lbl}>بنیادی وجہ</label>
              <div style={{ display:"flex", flexDirection:"column", gap:"6px" }}>
                {CAUSES.map(c=>(
                  <button key={c.id} onClick={()=>set("rootCause",c.id)} style={{ padding:"7px 14px", borderRadius:"8px", border:`2px solid ${form.rootCause===c.id?c.color:c.color+"30"}`, background:form.rootCause===c.id?c.color+"18":"rgba(255,255,255,0.03)", color:form.rootCause===c.id?c.color:"rgba(255,255,255,0.4)", fontWeight:form.rootCause===c.id?"800":"500", fontSize:"0.7rem", cursor:"pointer", fontFamily:"inherit", textAlign:"left", whiteSpace:"nowrap" }}>
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
              <div>
                <label style={lbl}>اٹھایا گیا اقدام</label>
                <textarea style={{ ...inp, minHeight:"68px", resize:"vertical" }} placeholder="کیا اقدام اٹھایا گیا؟" value={form.actionTaken} onChange={e=>set("actionTaken",e.target.value)}/>
              </div>
              <div>
                <label style={lbl}>نتیجہ / حاصل</label>
                <input style={inp} placeholder="نتیجہ یا اگلے اقدامات..." value={form.outcome} onChange={e=>set("outcome",e.target.value)}/>
              </div>
              <div>
                <label style={lbl}>حیثیت</label>
                <div style={{ display:"flex", gap:"8px" }}>
                  {STATUS_OPTS.map(s=>{
                    const col = s==="Resolved"?"#22c55e":"#f97316";
                    return <button key={s} onClick={()=>set("status",s)} style={{ flex:1, padding:"8px", borderRadius:"8px", border:`2px solid ${form.status===s?col:col+"30"}`, background:form.status===s?col+"18":"rgba(255,255,255,0.03)", color:form.status===s?col:"rgba(255,255,255,0.4)", fontWeight:form.status===s?"800":"500", fontSize:"0.7rem", cursor:"pointer", fontFamily:"inherit" }}>
                      {s==="Resolved"?"✅ حل شدہ":"🔴 کھلا"}
                    </button>;
                  })}
                </div>
              </div>
            </div>
          </div>

          <button onClick={save} disabled={saving} style={{ width:"100%", padding:"12px", fontSize:"0.8rem", background:"linear-gradient(135deg,#d4af37,#b8960a)", color:N, border:"none", borderRadius:"12px", cursor:saving?"not-allowed":"pointer", fontWeight:"800", fontFamily:"inherit", marginTop:"4px" }}>
            {saving?"محفوظ ہو رہا ہے...":"📝 واقعہ محفوظ کریں"}
          </button>
        </div>
      )}

      {/* ══ FILTER BAR ══ */}
      <div style={{ ...glass, padding:"14px 18px", marginBottom:"16px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))", gap:"10px", marginBottom:"10px" }}>
          {/* Search */}
          <div style={{ gridColumn:"1 / -1" }}>
            <input style={{ ...inp, background:"rgba(255,255,255,0.08)" }} placeholder="🔍 Search — keyword search..." value={filter.search} onChange={e=>setF("search",e.target.value)}/>
          </div>
          {/* House */}
          <div>
            <label style={lbl}>گھر</label>
            <select style={{ ...inp, direction:"ltr", fontSize:"0.7rem" }} value={filter.house} onChange={e=>setF("house",e.target.value)}>
              <option value="" style={{ background:N2 }}>All Houses</option>
              {HOUSES.map(h=><option key={h.id} value={h.id} style={{ background:N2 }}>{h.emoji} {h.nameEn}</option>)}
            </select>
          </div>
          {/* Cause */}
          <div>
            <label style={lbl}>وجہ</label>
            <select style={{ ...inp, direction:"ltr", fontSize:"0.7rem" }} value={filter.cause} onChange={e=>setF("cause",e.target.value)}>
              <option value="" style={{ background:N2 }}>All Types</option>
              {CAUSES.map(c=><option key={c.id} value={c.id} style={{ background:N2 }}>{c.id} — {c.labelEn}</option>)}
            </select>
          </div>
          {/* Status */}
          <div>
            <label style={lbl}>حیثیت</label>
            <select style={{ ...inp, direction:"ltr", fontSize:"0.7rem" }} value={filter.status} onChange={e=>setF("status",e.target.value)}>
              <option value="" style={{ background:N2 }}>All</option>
              {STATUS_OPTS.map(s=><option key={s} value={s} style={{ background:N2 }}>{s==="Open"?"کھلا":"حل شدہ"}</option>)}
            </select>
          </div>
          {/* Date from */}
          <div>
            <label style={lbl}>From Date</label>
            <input style={{ ...inp, direction:"ltr", fontSize:"0.7rem" }} type="date" value={filter.dateFrom} onChange={e=>setF("dateFrom",e.target.value)}/>
          </div>
          {/* Date to */}
          <div>
            <label style={lbl}>To Date</label>
            <input style={{ ...inp, direction:"ltr", fontSize:"0.7rem" }} type="date" value={filter.dateTo} onChange={e=>setF("dateTo",e.target.value)}/>
          </div>
        </div>
        {/* Cause quick-filter buttons */}
        <div style={{ display:"flex", gap:"6px", flexWrap:"wrap", alignItems:"center" }}>
          <span style={{ fontSize:"0.62rem", color:"rgba(255,255,255,0.35)" }}>Reason Filter:</span>
          <button onClick={()=>setF("cause","")} style={{ padding:"4px 12px", borderRadius:"20px", border:`1px solid ${!filter.cause?G+"60":"rgba(255,255,255,0.1)"}`, background:!filter.cause?"rgba(212,175,55,0.12)":"transparent", color:!filter.cause?G:"rgba(255,255,255,0.35)", fontSize:"0.62rem", cursor:"pointer", fontFamily:"inherit" }}>
            All ({logs.length})
          </button>
          {CAUSES.map(c=>{
            const cnt=logs.filter(l=>l.rootCause===c.id).length;
            const act=filter.cause===c.id;
            return <button key={c.id} onClick={()=>setF("cause",act?"":c.id)} style={{ padding:"4px 12px", borderRadius:"20px", border:`1px solid ${act?c.color:c.color+"30"}`, background:act?c.color+"18":"transparent", color:act?c.color:c.color+"80", fontSize:"0.62rem", cursor:"pointer", fontFamily:"inherit", fontWeight:act?"800":"500" }}>
              {c.id} ({cnt})
            </button>;
          })}
          <span style={{ marginRight:"auto" }}/>
          <span style={{ fontSize:"0.62rem", color:"rgba(255,255,255,0.3)" }}>{filtered.length} Results</span>
        </div>
      </div>

      {/* ══ LOG TABLE ══ */}
      <div style={{ ...glass, padding:"0", overflow:"hidden", marginBottom:"20px" }}>
        {/* Table header */}
        <div style={{ display:"grid", gridTemplateColumns:"100px 1fr 60px 1fr 90px 90px", gap:"0", background:"rgba(212,175,55,0.08)", borderBottom:"1px solid rgba(255,255,255,0.08)", padding:"10px 16px" }}>
          {["تاریخ","واقعہ/ہاؤس","وجہ","عمل","نتیجہ","صورتحال"].map(h=>(
            <div key={h} style={{ fontSize:"0.62rem", color:"rgba(212,175,55,0.7)", fontWeight:"700" }}>{h}</div>
          ))}
        </div>

        {filtered.length===0&&(
          <div style={{ padding:"40px", textAlign:"center", color:"rgba(255,255,255,0.2)", fontSize:"0.8rem" }}>
            کوئی واقعہ نہیں ملا
          </div>
        )}

        {filtered.map((log, i) => {
          const h = HOUSES.find(x=>x.id===log.houseId)||{};
          const col = causeColor(log.rootCause);
          return (
            <div key={log.caseId||log.id||i} style={{ display:"grid", gridTemplateColumns:"100px 1fr 60px 1fr 90px 90px", gap:"0", padding:"11px 16px", borderBottom:"1px solid rgba(255,255,255,0.05)", background:i%2?"rgba(255,255,255,0.015)":"transparent", borderRight:`3px solid ${col}` }}>
              {/* Date */}
              <div style={{ fontSize:"0.65rem", color:"rgba(255,255,255,0.5)", direction:"ltr" }}>
                {log.date||"—"}
                <div style={{ fontSize:"0.55rem", color:"rgba(255,255,255,0.25)", marginTop:"2px" }}>{log.caseId||""}</div>
              </div>
              {/* Incident + House */}
              <div style={{ fontSize:"0.72rem", color:"#f1f5f9", paddingLeft:"8px", paddingRight:"8px" }}>
                <div style={{ fontWeight:"600", lineHeight:1.4, marginBottom:"3px" }}>
                  {(log.description||"").slice(0,80)}{(log.description||"").length>80?"...":""}
                </div>
                <div style={{ fontSize:"0.58rem", color:h.color||G }}>{h.emoji} {h.name}</div>
              </div>
              {/* Cause */}
              <div><CauseBadge id={log.rootCause} inline/></div>
              {/* Action */}
              <div style={{ fontSize:"0.65rem", color:"rgba(255,255,255,0.55)", paddingLeft:"8px", paddingRight:"8px", lineHeight:1.4 }}>
                {(log.actionTaken||"—").slice(0,60)}{(log.actionTaken||"").length>60?"...":""}
              </div>
              {/* Outcome */}
              <div style={{ fontSize:"0.62rem", color:"rgba(255,255,255,0.4)" }}>
                {(log.outcome||"—").slice(0,40)}
              </div>
              {/* Status */}
              <div><StatusBadge s={log.status||"Open"}/></div>
            </div>
          );
        })}
      </div>

      {/* ══ PRINT SECTION ══ */}
      <div style={{ ...glass, padding:"16px 20px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"14px", flexWrap:"wrap" }}>
          <div style={{ fontSize:"0.78rem", color:G, fontWeight:"700" }}>🖨️ Monthly Report Print</div>
          <div>
            <input style={{ ...inp, width:"140px", direction:"ltr" }} type="month" value={printMonth} onChange={e=>setPrintMonth(e.target.value)}/>
          </div>
          <div style={{ fontSize:"0.65rem", color:"rgba(255,255,255,0.35)" }}>
            {printLogs.length} Incidents — {printMonth}
          </div>
          <button onClick={injectPrint} style={{ padding:"9px 22px", borderRadius:"10px", border:"none", background:"linear-gradient(135deg,#d4af37,#b8960a)", color:N, fontSize:"0.72rem", cursor:"pointer", fontFamily:"inherit", fontWeight:"800" }}>
            🖨️ Print
          </button>
        </div>
      </div>

      {/* ══ PRINT AREA (hidden on screen) ══ */}
      <div id="inc-print-area" style={{ display:"none" }}>
        <img src={letterhead} alt="letterhead" style={{ width:"100%", display:"block" }}/>
        <div style={{ padding:"20px 30px", fontFamily:"'Segoe UI',Arial,serif", direction:"ltr", color:"#1e293b" }}>
          <h2 style={{ textAlign:"center", fontSize:"1.1rem", fontWeight:"800", marginBottom:"4px" }}>Incident Log — Incident Log Report</h2>
          <p style={{ textAlign:"center", fontSize:"0.75rem", color:"#64748b", marginBottom:"20px" }}>Month: {printMonth} | Total Incidents: {printLogs.length}</p>

          {/* Stats row */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"10px", marginBottom:"20px" }}>
            {CAUSES.map(c=>(
              <div key={c.id} style={{ border:`1px solid ${c.color}40`, borderRadius:"8px", padding:"8px", textAlign:"center" }}>
                <div style={{ color:c.color, fontWeight:"800", fontSize:"1rem" }}>
                  {printLogs.filter(l=>l.rootCause===c.id).length}
                </div>
                <div style={{ fontSize:"0.62rem", color:"#64748b" }}>{c.id} — {c.labelEn}</div>
              </div>
            ))}
          </div>

          {/* Table */}
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"0.7rem" }}>
            <thead>
              <tr style={{ background:"#f8f4eb" }}>
                {["#","تاریخ","ہاؤس","واقعہ","وجہ","عمل","صورتحال"].map(h=>(
                  <th key={h} style={{ padding:"8px 10px", textAlign:"left", borderBottom:"2px solid #e5e7eb", fontWeight:"700", color:"#1e293b" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {printLogs.map((log,i)=>{
                const h=HOUSES.find(x=>x.id===log.houseId)||{};
                const c=CAUSES.find(x=>x.id===log.rootCause)||CAUSES[0];
                return (
                  <tr key={log.caseId||i} style={{ borderBottom:"1px solid #f1f5f9" }}>
                    <td style={{ padding:"8px 10px" }}>{i+1}</td>
                    <td style={{ padding:"8px 10px", direction:"ltr" }}>{log.date}</td>
                    <td style={{ padding:"8px 10px" }}>{h.nameEn}</td>
                    <td style={{ padding:"8px 10px", maxWidth:"180px" }}>{log.description}</td>
                    <td style={{ padding:"8px 10px" }}><span style={{ color:c.color, fontWeight:"700" }}>{c.id}</span></td>
                    <td style={{ padding:"8px 10px", maxWidth:"140px" }}>{log.actionTaken||"—"}</td>
                    <td style={{ padding:"8px 10px" }}>{log.status}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <p style={{ marginTop:"30px", fontSize:"0.62rem", color:"#94a3b8", textAlign:"center" }}>
            Ameen Islamic Institute • Shin, Nawa Kalay, Swat — Confidential
          </p>
        </div>
      </div>
    </div>
  );
}
