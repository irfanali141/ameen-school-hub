/* eslint-disable */
import { useState, useEffect } from "react";
import { DEMO, HOUSES } from "../../constants";
import { getData } from "../../supabase";

// ── Wizard step definitions ──
const STEPS = [
  { id:1, icon:"📋", label:"Incident Report",  labelEn:"Incident Report"  },
  { id:2, icon:"🔍", label:"Evidence",          labelEn:"Evidence"         },
  { id:3, icon:"🎤", label:"Interview",        labelEn:"Interview"        },
  { id:4, icon:"📅", label:"Timeline",      labelEn:"Timeline"         },
  { id:5, icon:"📊", label:"CAF Analysis",      labelEn:"CAF Analysis"     },
  { id:6, icon:"✅", label:"Follow-up",        labelEn:"Follow-up"        },
];

const INCIDENT_TYPES = ["تعلیمی","طرز عمل","ماحول","دیگر"];
const ROOT_CAUSES    = [
  { id:"P", label:"P — Performance (Performance)" },
  { id:"B", label:"B — Behavior (Behaviour)"       },
  { id:"E", label:"E — Environment"    },
  { id:"T", label:"T — Teaching"       },
];
const STATUS_OPTS = ["کھلا","زیر تحقیق","بند"];

const EMPTY_FORM = () => ({
  houseId:"abuBakr", incidentType:"تعلیمی",
  date:"", time:"", location:"", persons:"", description:"", immediateAction:"",
  evidence:    [{ type:"", location:"", collectedBy:"", description:"", photoRef:"" }],
  interviews:  [{ name:"", role:"", statement:"", notes:"" }],
  timeline:    [{ time:"", event:"", responsible:"", notes:"" }],
  rootCause:"P", facts:"", findings:"", recommendation:"",
  status:"کھلا", outcome:"", reviewDate:"",
});

// ── Shared styles ──
const G="#d4af37"; const N="#0f172a"; const N2="#1e293b";
const glass = { background:"rgba(255,255,255,0.06)", backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"16px" };
const inp   = { width:"100%", padding:"10px 14px", borderRadius:"10px", border:"1px solid rgba(212,175,55,0.25)", background:"rgba(255,255,255,0.06)", color:"#f1f5f9", fontSize:"0.78rem", fontFamily:"inherit", outline:"none", boxSizing:"border-box", direction:"ltr", colorScheme:"dark" };
const lbl   = { fontSize:"0.68rem", color:"rgba(212,175,55,0.8)", marginBottom:"5px", display:"block", fontWeight:"700" };
const sec   = { marginBottom:"14px" };

function Field({ label, children }) {
  return <div style={sec}><label style={lbl}>{label}</label>{children}</div>;
}

// ── Dynamic row list (Evidence / Interview / Timeline) ──
function DynList({ rows, onAdd, onRemove, onChange, renderRow, addLabel }) {
  return (
    <div>
      {rows.map((row, i) => (
        <div key={i} style={{ background:"rgba(255,255,255,0.03)", borderRadius:"12px", padding:"14px", border:"1px solid rgba(255,255,255,0.07)", marginBottom:"10px", position:"relative" }}>
          <div style={{ fontSize:"0.6rem", color:G, fontWeight:"800", marginBottom:"10px", display:"flex", justifyContent:"space-between" }}>
            <span>#{i+1}</span>
            {rows.length>1 && <button onClick={()=>onRemove(i)} style={{ background:"rgba(220,38,38,0.2)", border:"1px solid rgba(220,38,38,0.3)", borderRadius:"6px", color:"#f87171", fontSize:"0.6rem", padding:"2px 8px", cursor:"pointer", fontFamily:"inherit" }}>✕ Delete</button>}
          </div>
          {renderRow(row, i, (field, val) => onChange(i, field, val))}
        </div>
      ))}
      <button onClick={onAdd} style={{ width:"100%", padding:"10px", border:"1px dashed rgba(212,175,55,0.35)", borderRadius:"10px", background:"rgba(212,175,55,0.05)", color:G, fontSize:"0.72rem", cursor:"pointer", fontFamily:"inherit", fontWeight:"700" }}>
        + {addLabel}
      </button>
    </div>
  );
}

// ── Step content renders ──
function Step1({ form, set }) {
  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
        <Field label="House">
          <select style={inp} value={form.houseId} onChange={e=>set("houseId",e.target.value)}>
            {HOUSES.map(h=><option key={h.id} value={h.id} style={{background:N2}}>{h.emoji} {h.nameEn}</option>)}
          </select>
        </Field>
        <Field label="Incident Type">
          <select style={inp} value={form.incidentType} onChange={e=>set("incidentType",e.target.value)}>
            {INCIDENT_TYPES.map(t=><option key={t} value={t} style={{background:N2}}>{t}</option>)}
          </select>
        </Field>
        <Field label="Date (Date)">
          <input style={{...inp,direction:"ltr",colorScheme:"dark"}} type="date" value={form.date} onChange={e=>set("date",e.target.value)}/>
        </Field>
        <Field label="Time (Time)">
          <input style={{...inp,direction:"ltr",colorScheme:"dark"}} type="time" value={form.time} onChange={e=>set("time",e.target.value)}/>
        </Field>
      </div>
      <Field label="Location">
        <input style={inp} placeholder="e.g. Class 7A, Ground" value={form.location} onChange={e=>set("location",e.target.value)}/>
      </Field>
      <Field label="Persons Involved">
        <input style={inp} placeholder="Enter name and role" value={form.persons} onChange={e=>set("persons",e.target.value)}/>
      </Field>
      <Field label="Short Details (Description)">
        <textarea style={{...inp,minHeight:"80px",resize:"vertical"}} placeholder="Complete incident details..." value={form.description} onChange={e=>set("description",e.target.value)}/>
      </Field>
      <Field label="Immediate Action Taken">
        <textarea style={{...inp,minHeight:"60px",resize:"vertical"}} placeholder="What immediate action was taken?" value={form.immediateAction} onChange={e=>set("immediateAction",e.target.value)}/>
      </Field>
    </div>
  );
}

function Step2({ form, set }) {
  const update = (i, field, val) => {
    const ev = [...form.evidence]; ev[i]={...ev[i],[field]:val}; set("evidence",ev);
  };
  return (
    <DynList
      rows={form.evidence}
      onAdd={()=>set("evidence",[...form.evidence,{type:"",location:"",collectedBy:"",description:"",photoRef:""}])}
      onRemove={i=>{ const ev=[...form.evidence]; ev.splice(i,1); set("evidence",ev); }}
      onChange={update}
      addLabel="Add Evidence"
      renderRow={(row,i,ch)=>(
        <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px"}}>
            <Field label="Evidence Type"><input style={inp} placeholder="Document, Witness, Photo..." value={row.type} onChange={e=>ch("type",e.target.value)}/></Field>
            <Field label="Found Location"><input style={inp} placeholder="Room/Area" value={row.location} onChange={e=>ch("location",e.target.value)}/></Field>
          </div>
          <Field label="Collected By"><input style={inp} placeholder="Name" value={row.collectedBy} onChange={e=>ch("collectedBy",e.target.value)}/></Field>
          <Field label="Details (Description)"><textarea style={{...inp,minHeight:"52px",resize:"vertical"}} value={row.description} onChange={e=>ch("description",e.target.value)}/></Field>
          <Field label="Photo Reference (text only)"><input style={{...inp,direction:"ltr"}} placeholder="photo-001.jpg or folder path" value={row.photoRef} onChange={e=>ch("photoRef",e.target.value)}/></Field>
        </div>
      )}
    />
  );
}

function Step3({ form, set }) {
  const update = (i, field, val) => {
    const iv=[...form.interviews]; iv[i]={...iv[i],[field]:val}; set("interviews",iv);
  };
  return (
    <DynList
      rows={form.interviews}
      onAdd={()=>set("interviews",[...form.interviews,{name:"",role:"",statement:"",notes:""}])}
      onRemove={i=>{ const iv=[...form.interviews]; iv.splice(i,1); set("interviews",iv); }}
      onChange={update}
      addLabel="Add Interview"
      renderRow={(row,i,ch)=>(
        <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px"}}>
            <Field label="Interviewee Name"><input style={inp} placeholder="Name" value={row.name} onChange={e=>ch("name",e.target.value)}/></Field>
            <Field label="Role / Relation"><input style={inp} placeholder="Student, Parent, Teacher..." value={row.role} onChange={e=>ch("role",e.target.value)}/></Field>
          </div>
          <Field label="Statement Summary"><textarea style={{...inp,minHeight:"68px",resize:"vertical"}} value={row.statement} onChange={e=>ch("statement",e.target.value)}/></Field>
          <Field label="Extra Notes (Additional Notes)"><input style={inp} value={row.notes} onChange={e=>ch("notes",e.target.value)}/></Field>
        </div>
      )}
    />
  );
}

function Step4({ form, set }) {
  const update = (i, field, val) => {
    const tl=[...form.timeline]; tl[i]={...tl[i],[field]:val}; set("timeline",tl);
  };
  return (
    <DynList
      rows={form.timeline}
      onAdd={()=>set("timeline",[...form.timeline,{time:"",event:"",responsible:"",notes:""}])}
      onRemove={i=>{ const tl=[...form.timeline]; tl.splice(i,1); set("timeline",tl); }}
      onChange={update}
      addLabel="Incident Add"
      renderRow={(row,i,ch)=>(
        <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px"}}>
            <Field label="Time (Time)"><input style={{...inp,direction:"ltr",colorScheme:"dark"}} type="time" value={row.time} onChange={e=>ch("time",e.target.value)}/></Field>
            <Field label="Responsible (Responsible Person)"><input style={inp} placeholder="Name" value={row.responsible} onChange={e=>ch("responsible",e.target.value)}/></Field>
          </div>
          <Field label="Event"><input style={inp} placeholder="What happened?" value={row.event} onChange={e=>ch("event",e.target.value)}/></Field>
          <Field label="Notes (Notes)"><input style={inp} value={row.notes} onChange={e=>ch("notes",e.target.value)}/></Field>
        </div>
      )}
    />
  );
}

function Step5({ form, set }) {
  return (
    <div>
      <Field label="Root Cause Type">
        <div style={{ display:"flex", gap:"8px", flexWrap:"wrap", marginBottom:"4px" }}>
          {ROOT_CAUSES.map(rc=>(
            <button key={rc.id} onClick={()=>set("rootCause",rc.id)} style={{ padding:"8px 16px", borderRadius:"10px", border:`2px solid ${form.rootCause===rc.id?G:"rgba(255,255,255,0.1)"}`, background:form.rootCause===rc.id?"rgba(212,175,55,0.15)":"rgba(255,255,255,0.03)", color:form.rootCause===rc.id?G:"rgba(255,255,255,0.55)", fontWeight:form.rootCause===rc.id?"800":"500", fontSize:"0.72rem", cursor:"pointer", fontFamily:"inherit" }}>
              {rc.label}
            </button>
          ))}
        </div>
      </Field>
      <Field label="Facts Collected">
        <textarea style={{...inp,minHeight:"72px",resize:"vertical"}} placeholder="Facts uncovered during investigation..." value={form.facts} onChange={e=>set("facts",e.target.value)}/>
      </Field>
      <Field label="Initial Results (Preliminary Findings)">
        <textarea style={{...inp,minHeight:"72px",resize:"vertical"}} placeholder="Initial analysis and findings..." value={form.findings} onChange={e=>set("findings",e.target.value)}/>
      </Field>
      <Field label="Recommended Action">
        <textarea style={{...inp,minHeight:"72px",resize:"vertical"}} placeholder="What should be done next?" value={form.recommendation} onChange={e=>set("recommendation",e.target.value)}/>
      </Field>
    </div>
  );
}

function Step6({ form, set, caseId }) {
  const h = HOUSES.find(h=>h.id===form.houseId)||{};
  return (
    <div>
      {/* Case summary */}
      <div style={{ background:"rgba(212,175,55,0.08)", borderRadius:"12px", padding:"16px", border:"1px solid rgba(212,175,55,0.2)", marginBottom:"18px" }}>
        <div style={{ color:G, fontWeight:"800", fontSize:"0.82rem", marginBottom:"10px" }}>📋 Case Summary</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px" }}>
          {[
            ["Case ID",    caseId],
            ["House",     `${h.emoji||""} ${h.name||""}`],
            ["Type",       form.incidentType],
            ["Date",    `${form.date} ${form.time}`],
            ["Location",      form.location||"—"],
            ["Root Cause",form.rootCause],
          ].map(([k,v])=>(
            <div key={k} style={{ fontSize:"0.68rem" }}>
              <div style={{ color:"rgba(255,255,255,0.4)" }}>{k}</div>
              <div style={{ color:"#f1f5f9", fontWeight:"700", marginTop:"2px" }}>{v||"—"}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop:"10px", fontSize:"0.68rem" }}>
          <div style={{ color:"rgba(255,255,255,0.4)", marginBottom:"3px" }}>Details</div>
          <div style={{ color:"rgba(255,255,255,0.75)" }}>{form.description||"—"}</div>
        </div>
        <div style={{ marginTop:"8px", display:"flex", gap:"16px", fontSize:"0.62rem", color:"rgba(255,255,255,0.4)" }}>
          <span>📎 Evidence: {form.evidence.filter(e=>e.event||e.description||e.type).length || form.evidence.length}</span>
          <span>🎤 Interviews: {form.interviews.length}</span>
          <span>📅 Timeline: {form.timeline.length} Incidents</span>
        </div>
      </div>

      <Field label="Case Status">
        <div style={{ display:"flex", gap:"8px" }}>
          {STATUS_OPTS.map(s=>{
            const colors = { "کھلا":"#fb923c", "زیر تحقیق":"#60a5fa", "بند":"#4ade80" };
            const col = colors[s]||G;
            return <button key={s} onClick={()=>set("status",s)} style={{ flex:1, padding:"9px 8px", borderRadius:"10px", border:`2px solid ${form.status===s?col:"rgba(255,255,255,0.1)"}`, background:form.status===s?`${col}18`:"rgba(255,255,255,0.03)", color:form.status===s?col:"rgba(255,255,255,0.5)", fontWeight:form.status===s?"800":"500", fontSize:"0.68rem", cursor:"pointer", fontFamily:"inherit" }}>{s}</button>;
          })}
        </div>
      </Field>
      <Field label="Final Outcome">
        <textarea style={{...inp,minHeight:"60px",resize:"vertical"}} placeholder="Final outcome of the case..." value={form.outcome} onChange={e=>set("outcome",e.target.value)}/>
      </Field>
      <Field label="Next Review (Next Review Date)">
        <input style={{...inp,direction:"ltr",colorScheme:"dark"}} type="date" value={form.reviewDate} onChange={e=>set("reviewDate",e.target.value)}/>
      </Field>
    </div>
  );
}

// ── MAIN COMPONENT ──
export default function InvestigationCase({ addData, user }) {
  const [step,   setStep]   = useState(1);
  const [form,   setFormSt] = useState(EMPTY_FORM());
  const [cases,  setCases]  = useState([]);
  const [saving, setSaving] = useState(false);
  const [done,   setDone]   = useState(false);
  const [view,   setView]   = useState("form"); // "form" | "history"
  const [selCase,setSelCase]= useState(null);

  const uRole = DEMO.find(d=>d.email===user?.email)?.role||"teacher";
  const isDirector = uRole==="director"||uRole==="admin";

  const set = (field, val) => setFormSt(prev=>({...prev,[field]:val}));

  const loadCases = async () => {
    try {
      const data = await getData("investigation_cases");
      const sorted = (data||[]).sort((a,b)=>new Date(b.created_at||0)-new Date(a.created_at||0));
      // Housemaster sees only their selected house — filter by form.houseId
      setCases(isDirector ? sorted : sorted.filter(c=>c.houseId===form.houseId));
    } catch(e) { console.error("loadCases:",e.message); }
  };

  useEffect(()=>{ loadCases(); },[form.houseId, isDirector]);

  // Generate next case ID
  const nextCaseId = () => {
    const year = new Date().getFullYear();
    const existing = cases.filter(c=>(c.caseId||"").startsWith(`INV-${year}-`));
    const nextNum = existing.length + 1;
    return `INV-${year}-${String(nextNum).padStart(3,"0")}`;
  };

  const save = async () => {
    setSaving(true);
    const h = HOUSES.find(h=>h.id===form.houseId)||{};
    const caseId = nextCaseId();
    try {
      await addData("investigation_cases", {
        ...form, caseId, houseName:h.nameEn,
        createdAt: new Date().toISOString(),
      });
      await loadCases();
      setFormSt(EMPTY_FORM()); setStep(1);
      setDone(true); setTimeout(()=>setDone(false),4000);
      setView("history");
    } catch(e) { console.error("save:",e.message); }
    setSaving(false);
  };

  const statusColor = s => ({ "کھلا":"#fb923c", "زیر تحقیق":"#60a5fa", "بند":"#4ade80" })[s]||G;

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(160deg,#0f172a 0%,#0d1f3c 50%,#0a1628 100%)", padding:"24px 20px", fontFamily:"'Segoe UI',Arial,serif", direction:"ltr" }}>

      {/* ── Header ── */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"24px", flexWrap:"wrap", gap:"12px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
          <div style={{ width:"44px", height:"44px", borderRadius:"12px", background:"linear-gradient(135deg,#dc2626,#b91c1c)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.4rem", boxShadow:"0 4px 20px rgba(220,38,38,0.4)" }}>⚖️</div>
          <div>
            <h2 style={{ margin:0, fontSize:"1.3rem", fontWeight:"800", color:"#f1f5f9" }}>Investigation Case Management</h2>
            <p style={{ margin:0, fontSize:"0.68rem", color:"rgba(212,175,55,0.7)" }}>Investigation Case Management — 6-Step Wizard</p>
          </div>
        </div>
        <div style={{ display:"flex", gap:"8px" }}>
          {["form","history"].map(v=>(
            <button key={v} onClick={()=>setView(v)} style={{ padding:"9px 18px", borderRadius:"10px", border:"none", background:view===v?"rgba(212,175,55,0.2)":"rgba(255,255,255,0.06)", color:view===v?G:"rgba(255,255,255,0.5)", fontWeight:view===v?"800":"500", fontSize:"0.72rem", cursor:"pointer", fontFamily:"inherit" }}>
              {v==="form"?"📋 New Case":"🗂️ Case History"} {v==="history"&&cases.length>0&&`(${cases.length})`}
            </button>
          ))}
        </div>
      </div>

      {/* ── Success toast ── */}
      {done&&<div style={{ ...glass, padding:"14px 20px", marginBottom:"16px", textAlign:"center", border:"1px solid rgba(74,222,128,0.3)", background:"rgba(74,222,128,0.08)" }}>
        <span style={{ color:"#4ade80", fontWeight:"700", fontSize:"0.82rem" }}>✓ Case saved successfully!</span>
      </div>}

      {/* ══ HISTORY VIEW ══ */}
      {view==="history"&&(
        <div>
          {/* Filter bar for director */}
          {isDirector&&(
            <div style={{ ...glass, padding:"14px 18px", marginBottom:"16px", display:"flex", alignItems:"center", gap:"12px", flexWrap:"wrap" }}>
              <span style={{ color:G, fontSize:"0.72rem", fontWeight:"700" }}>House Filter:</span>
              <button onClick={()=>setCases(cases)} style={{ padding:"6px 14px", borderRadius:"8px", border:"1px solid rgba(255,255,255,0.1)", background:"transparent", color:"rgba(255,255,255,0.5)", fontSize:"0.68rem", cursor:"pointer", fontFamily:"inherit" }}>All</button>
              {HOUSES.map(h=>(
                <button key={h.id} onClick={async()=>{ const d=await getData("investigation_cases"); setCases((d||[]).filter(c=>c.houseId===h.id)); }} style={{ padding:"6px 14px", borderRadius:"8px", border:`1px solid ${h.color}40`, background:`${h.color}10`, color:h.color, fontSize:"0.68rem", cursor:"pointer", fontFamily:"inherit" }}>
                  {h.emoji} {h.nameEn}
                </button>
              ))}
            </div>
          )}

          {cases.length===0&&<div style={{ ...glass, padding:"40px", textAlign:"center", color:"rgba(255,255,255,0.25)", fontSize:"0.8rem" }}>No cases yet — no cases have been recorded</div>}

          {/* Case cards */}
          <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
            {cases.map(c=>{
              const h=HOUSES.find(x=>x.id===c.houseId)||{}; const col=statusColor(c.status);
              const isOpen=selCase===c.caseId;
              return (
                <div key={c.caseId||c.id} style={{ ...glass, overflow:"hidden" }}>
                  <div onClick={()=>setSelCase(isOpen?null:c.caseId)} style={{ padding:"14px 18px", cursor:"pointer", display:"flex", alignItems:"center", gap:"12px" }}>
                    {/* Case ID badge */}
                    <div style={{ background:"rgba(255,255,255,0.08)", borderRadius:"8px", padding:"6px 10px", fontSize:"0.6rem", color:G, fontWeight:"800", flexShrink:0, direction:"ltr" }}>{c.caseId||"INV-?"}</div>
                    {/* House + type */}
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:"700", fontSize:"0.82rem", color:"#f1f5f9" }}>{h.emoji} {h.name} — {c.incidentType}</div>
                      <div style={{ fontSize:"0.62rem", color:"rgba(255,255,255,0.4)", marginTop:"2px" }}>{c.location||"—"} • {c.date||""}</div>
                    </div>
                    {/* Status */}
                    <div style={{ background:`${col}18`, border:`1px solid ${col}40`, borderRadius:"20px", padding:"4px 12px", fontSize:"0.6rem", color:col, fontWeight:"700", flexShrink:0 }}>{c.status||"کھلا"}</div>
                    <span style={{ color:"rgba(255,255,255,0.3)", fontSize:"0.6rem" }}>{isOpen?"▲":"▼"}</span>
                  </div>

                  {/* Expanded detail */}
                  {isOpen&&(
                    <div style={{ padding:"14px 18px", borderTop:"1px solid rgba(255,255,255,0.07)", background:"rgba(255,255,255,0.02)" }}>
                      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))", gap:"10px", marginBottom:"12px" }}>
                        {[["Persons Involved",c.persons],["Immediate Action",c.immediateAction],["Root Cause",c.rootCause],["Review Date",c.reviewDate]].map(([k,v])=>v&&(
                          <div key={k} style={{ fontSize:"0.68rem" }}>
                            <div style={{ color:"rgba(255,255,255,0.35)" }}>{k}</div>
                            <div style={{ color:"#f1f5f9", fontWeight:"600", marginTop:"2px" }}>{v}</div>
                          </div>
                        ))}
                      </div>
                      {c.description&&<div style={{ background:"rgba(255,255,255,0.04)", borderRadius:"10px", padding:"10px 14px", marginBottom:"10px" }}>
                        <div style={{ fontSize:"0.6rem", color:"rgba(255,255,255,0.35)", marginBottom:"4px" }}>Details</div>
                        <div style={{ fontSize:"0.72rem", color:"rgba(255,255,255,0.75)" }}>{c.description}</div>
                      </div>}
                      {c.findings&&<div style={{ background:"rgba(255,255,255,0.04)", borderRadius:"10px", padding:"10px 14px", marginBottom:"10px" }}>
                        <div style={{ fontSize:"0.6rem", color:"rgba(255,255,255,0.35)", marginBottom:"4px" }}>Results</div>
                        <div style={{ fontSize:"0.72rem", color:"rgba(255,255,255,0.75)" }}>{c.findings}</div>
                      </div>}
                      {c.recommendation&&<div style={{ background:"rgba(212,175,55,0.06)", borderRadius:"10px", padding:"10px 14px", border:"1px solid rgba(212,175,55,0.15)" }}>
                        <div style={{ fontSize:"0.6rem", color:G, marginBottom:"4px" }}>Proposal</div>
                        <div style={{ fontSize:"0.72rem", color:"rgba(255,255,255,0.75)" }}>{c.recommendation}</div>
                      </div>}
                      <div style={{ display:"flex", gap:"12px", marginTop:"10px", fontSize:"0.6rem", color:"rgba(255,255,255,0.3)" }}>
                        <span>📎 Evidence: {(c.evidence||[]).length}</span>
                        <span>🎤 Interviews: {(c.interviews||[]).length}</span>
                        <span>📅 Timeline: {(c.timeline||[]).length}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══ WIZARD FORM VIEW ══ */}
      {view==="form"&&(
        <div>
          {/* Step progress indicator */}
          <div style={{ ...glass, padding:"16px 20px", marginBottom:"20px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", position:"relative" }}>
              {/* Connector line */}
              <div style={{ position:"absolute", top:"20px", right:"24px", left:"24px", height:"2px", background:"rgba(255,255,255,0.08)", zIndex:0 }}/>
              <div style={{ position:"absolute", top:"20px", right:"24px", height:"2px", zIndex:0, background:`linear-gradient(to left,${G},${G})`, width:`${((step-1)/5)*100}%`, transition:"width 0.4s ease" }}/>

              {STEPS.map(s=>{
                const done=s.id<step; const active=s.id===step;
                return (
                  <div key={s.id} onClick={()=>s.id<step&&setStep(s.id)} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"4px", zIndex:1, cursor:s.id<step?"pointer":"default" }}>
                    <div style={{ width:"40px", height:"40px", borderRadius:"50%", background:done?"rgba(212,175,55,0.25)":active?"rgba(212,175,55,0.15)":"rgba(255,255,255,0.06)", border:`2px solid ${done||active?G:"rgba(255,255,255,0.12)"}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:done?"0.9rem":"1rem", transition:"all 0.3s", boxShadow:active?`0 0 16px rgba(212,175,55,0.4)`:"none" }}>
                      {done?"✓":s.icon}
                    </div>
                    <div style={{ fontSize:"0.52rem", color:active?G:done?"rgba(212,175,55,0.6)":"rgba(255,255,255,0.25)", fontWeight:active?"800":"500", textAlign:"center", maxWidth:"52px" }}>
                      {s.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step card */}
          <div style={{ ...glass, padding:"24px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"20px", paddingBottom:"14px", borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
              <div style={{ width:"36px", height:"36px", borderRadius:"10px", background:"rgba(212,175,55,0.15)", border:`1px solid ${G}40`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.2rem" }}>
                {STEPS[step-1].icon}
              </div>
              <div>
                <div style={{ color:G, fontWeight:"800", fontSize:"0.9rem" }}>Phase {step} of 6 — {STEPS[step-1].label}</div>
                <div style={{ color:"rgba(255,255,255,0.35)", fontSize:"0.62rem" }}>{STEPS[step-1].labelEn}</div>
              </div>
              <div style={{ marginRight:"auto", fontSize:"0.62rem", color:"rgba(255,255,255,0.25)", direction:"ltr" }}>{nextCaseId()}</div>
            </div>

            {step===1&&<Step1 form={form} set={set}/>}
            {step===2&&<Step2 form={form} set={set}/>}
            {step===3&&<Step3 form={form} set={set}/>}
            {step===4&&<Step4 form={form} set={set}/>}
            {step===5&&<Step5 form={form} set={set}/>}
            {step===6&&<Step6 form={form} set={set} caseId={nextCaseId()}/>}

            {/* Navigation */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:"24px", paddingTop:"16px", borderTop:"1px solid rgba(255,255,255,0.07)" }}>
              <button
                onClick={()=>setStep(s=>Math.max(1,s-1))}
                disabled={step===1}
                style={{ padding:"10px 22px", borderRadius:"10px", border:"1px solid rgba(255,255,255,0.12)", background:"rgba(255,255,255,0.06)", color:step===1?"rgba(255,255,255,0.2)":"rgba(255,255,255,0.7)", fontSize:"0.75rem", cursor:step===1?"not-allowed":"pointer", fontFamily:"inherit", fontWeight:"600" }}
              >
                ← Previous
              </button>

              {/* Step dots */}
              <div style={{ display:"flex", gap:"6px" }}>
                {STEPS.map(s=>(
                  <div key={s.id} style={{ width: s.id===step?"20px":"7px", height:"7px", borderRadius:"4px", background:s.id<=step?G:"rgba(255,255,255,0.1)", transition:"all 0.3s" }}/>
                ))}
              </div>

              {step<6?(
                <button
                  onClick={()=>setStep(s=>Math.min(6,s+1))}
                  style={{ padding:"10px 22px", borderRadius:"10px", border:"none", background:`linear-gradient(135deg,${G},#b8960a)`, color:N, fontSize:"0.75rem", cursor:"pointer", fontFamily:"inherit", fontWeight:"800" }}
                >
                  Next →
                </button>
              ):(
                <button
                  onClick={save}
                  disabled={saving}
                  style={{ padding:"10px 26px", borderRadius:"10px", border:"none", background:"linear-gradient(135deg,#16a34a,#15803d)", color:"white", fontSize:"0.75rem", cursor:saving?"not-allowed":"pointer", fontFamily:"inherit", fontWeight:"800" }}
                >
                  {saving?"Saving...":"✓ Save Case"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
