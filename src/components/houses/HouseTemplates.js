/* eslint-disable */
import { useState, useEffect } from "react";
import { getData } from "../../supabase";
import letterhead from "../../assets/letterhead.png";
import { C, S, HOUSES } from "../../constants";

const G = C.gold; const W = C.white;

const glass  = { background:"rgba(255,255,255,0.07)", backdropFilter:"blur(20px)", borderRadius:"18px", border:"1px solid rgba(255,255,255,0.1)", padding:"20px" };
const cellIn = { padding:"7px 10px", border:"1px solid rgba(255,255,255,0.12)", borderRadius:"8px", background:"rgba(255,255,255,0.05)", color:W, fontFamily:"inherit", fontSize:"0.72rem", width:"100%", boxSizing:"border-box", outline:"none" };
const TH     = { padding:"10px 12px", textAlign:"left", fontSize:"0.67rem", color:"rgba(255,255,255,0.5)", borderBottom:"2px solid rgba(255,255,255,0.08)", fontWeight:"700", whiteSpace:"nowrap" };
const TD     = { padding:"8px 10px", borderBottom:"1px solid rgba(255,255,255,0.05)", verticalAlign:"middle" };

const TABS = [
  { id:"monthly",    labelUr:"📅 Monthly Report",    labelEn:"Monthly Report"    },
  { id:"meeting",    labelUr:"📝 Meeting Record",    labelEn:"Meeting Record"    },
  { id:"progress",   labelUr:"📈 Student Progress",   labelEn:"Student Progress"  },
  { id:"discipline", labelUr:"⚖️ Discipline Log",  labelEn:"Discipline Log"    },
  { id:"events",     labelUr:"🏆 Event Scoring",   labelEn:"Event Scoring"     },
];

const BLANK = {
  monthly:    ()=>({ month:new Date().toISOString().slice(0,7), houseId:HOUSES[0].id, points:"", rank:"", hmComment:"", headRemark:"", _new:true }),
  meeting:    ()=>({ date:new Date().toISOString().slice(0,10), chairedBy:"", agenda:"", decisions:"", followup:"", _new:true }),
  progress:   ()=>({ studentName:"", houseId:HOUSES[0].id, strength:"", improvement:"", target:"", remarks:"", _new:true }),
  discipline: ()=>({ date:new Date().toISOString().slice(0,10), studentName:"", incident:"", action:"", parentInformed:"No", remarks:"", status:"open", _new:true }),
  events:     ()=>({ event:"", criteria:"", maxMarks:"", abuBakr:"", umar:"", uthman:"", ali:"", _new:true }),
};

const PRE_EVENTS = [
  { event:"Nazm Khwani / Poetry", criteria:"Voice, Delivery, Memorization", maxMarks:"30", abuBakr:"", umar:"", uthman:"", ali:"", _new:true },
  { event:"Speech", criteria:"Topic, Fluency, Impact",   maxMarks:"30", abuBakr:"", umar:"", uthman:"", ali:"", _new:true },
  { event:"Sports", criteria:"Win, Participation, Spirit",      maxMarks:"40", abuBakr:"", umar:"", uthman:"", ali:"", _new:true },
];

function getMonthLabel(d=new Date()){
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
}

function printWith(title, headersHtml, rowsHtml, footNote=""){
  const w=window.open("","_blank","width=950,height=750");
  w.document.write(`<!DOCTYPE html><html dir="ltr"><body style="font-family:serif;padding:24px;direction:rtl;background:#fff;color:#1e293b">
    <img src="${letterhead}" style="width:100%;max-width:700px;display:block;margin:0 auto 16px" onerror="this.style.display='none'"/>
    <h2 style="text-align:center;color:#1e293b;margin-bottom:4px">${title}</h2>
    ${footNote?`<p style="text-align:center;font-size:12px;color:#64748b;margin-top:0">${footNote}</p>`:""}
    <table border="1" cellpadding="8" style="width:100%;border-collapse:collapse;font-size:12px;margin-top:12px">
      <tr style="background:#1e293b;color:#fff">${headersHtml}</tr>
      ${rowsHtml}
    </table>
    <div style="margin-top:50px;display:flex;justify-content:space-between;align-items:flex-end">
      <div style="text-align:center;min-width:180px">
        <div style="border-top:1.5px solid #0f172a;padding-top:6px;font-size:13px">House Master Signature<br/>ure</div>
      </div>
      <div style="font-size:11px;color:#64748b">Printed: ${new Date().toLocaleDateString("en-PK",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</div>
    </div>
    <script>window.print();window.close();<\/script>
  </body></html>`);
}

// ── Tab 1: Monthly Report ────────────────────────────────────────
function TabMonthly({ addData }){
  const [rows, setRows] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(()=>{ getData("house_monthly_reports").then(d=>{ if(d&&!d.error) setRows(d.map(r=>({...r}))); }); },[]);

  const addRow = () => setRows(p=>[BLANK.monthly(),...p]);
  const upd = (i,k,v) => setRows(p=>p.map((r,ri)=>ri===i?{...r,[k]:v}:r));

  const saveNew = async()=>{
    setSaving(true);
    const newOnes=rows.filter(r=>r._new);
    for(const r of newOnes){
      const {_new,...rec}=r;
      await addData("house_monthly_reports",rec);
    }
    setRows(p=>p.map(r=>{const {_new,...rest}=r;return rest;}));
    setSaving(false);
  };

  const doPrint=()=>{
    const hdrs=["Month","House","Total Points","Rank","HM Notes","Head Remarks"].map(h=>`<th>${h}</th>`).join("");
    const rws=rows.map(r=>{
      const hi=HOUSES.find(h=>h.id===r.houseId);
      return `<tr><td>${r.month||"—"}</td><td>${hi?hi.nameEn:r.houseId||"—"}</td><td style="text-align:center;font-weight:700">${r.points||"—"}</td><td style="text-align:center">${r.rank||"—"}</td><td>${r.hmComment||"—"}</td><td>${r.headRemark||"—"}</td></tr>`;
    }).join("");
    printWith("Monthly House Report", hdrs, rws);
  };

  return (
    <div>
      <ActionBar label="Monthly Report" onAdd={addRow} onSave={saveNew} onPrint={doPrint} saving={saving}/>
      {rows.length===0
        ? <Empty/>
        : <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",minWidth:"800px"}}>
              <thead><tr>{["Month","House","Total Points","Rank","HM Notes","Head Remarks"].map(h=><th key={h} style={TH}>{h}</th>)}</tr></thead>
              <tbody>
                {rows.map((r,i)=>(
                  <tr key={i} style={{background:r._new?"rgba(183,134,11,0.06)":"transparent"}}>
                    <td style={TD}><input type="month" value={r.month||""} onChange={e=>upd(i,"month",e.target.value)} style={{...cellIn,width:"130px"}}/></td>
                    <td style={TD}>
                      <select value={r.houseId||""} onChange={e=>upd(i,"houseId",e.target.value)} style={{...cellIn,width:"110px"}}>
                        {HOUSES.map(h=><option key={h.id} value={h.id} style={{background:C.navyDark}}>{h.nameEn}</option>)}
                      </select>
                    </td>
                    <td style={TD}><input type="number" value={r.points||""} onChange={e=>upd(i,"points",e.target.value)} placeholder="300" style={{...cellIn,width:"80px"}}/></td>
                    <td style={TD}><input type="number" value={r.rank||""} onChange={e=>upd(i,"rank",e.target.value)} placeholder="1" style={{...cellIn,width:"60px"}}/></td>
                    <td style={TD}><input value={r.hmComment||""} onChange={e=>upd(i,"hmComment",e.target.value)} placeholder="HM Notes" style={cellIn}/></td>
                    <td style={TD}><input value={r.headRemark||""} onChange={e=>upd(i,"headRemark",e.target.value)} placeholder="Head Remarks" style={cellIn}/></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
      }
    </div>
  );
}

// ── Tab 2: Meeting Record ────────────────────────────────────────
function TabMeeting({ addData }){
  const [rows,setRows]=useState([]);
  const [saving,setSaving]=useState(false);

  useEffect(()=>{ getData("house_meetings").then(d=>{ if(d&&!d.error) setRows(d.map(r=>({...r}))); }); },[]);

  const addRow=()=>setRows(p=>[BLANK.meeting(),...p]);
  const upd=(i,k,v)=>setRows(p=>p.map((r,ri)=>ri===i?{...r,[k]:v}:r));

  const saveNew=async()=>{
    setSaving(true);
    for(const r of rows.filter(r=>r._new)){
      const {_new,...rec}=r; await addData("house_meetings",rec);
    }
    setRows(p=>p.map(r=>{const{_new,...rest}=r;return rest;}));
    setSaving(false);
  };

  const doPrint=()=>{
    const hdrs=["Date","Chair","Agenda/Topic","Key Decisions","Next Actions"].map(h=>`<th>${h}</th>`).join("");
    const rws=rows.map(r=>`<tr><td>${r.date||"—"}</td><td>${r.chairedBy||"—"}</td><td>${r.agenda||"—"}</td><td>${r.decisions||"—"}</td><td>${r.followup||"—"}</td></tr>`).join("");
    printWith("Meeting Record — House Meeting Record", hdrs, rws);
  };

  return (
    <div>
      <ActionBar label="Meeting Record" onAdd={addRow} onSave={saveNew} onPrint={doPrint} saving={saving}/>
      {rows.length===0
        ? <Empty/>
        : <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",minWidth:"900px"}}>
              <thead><tr>{["Date","Chairperson","Agenda / Topic","Key Decisions","Next Actions"].map(h=><th key={h} style={TH}>{h}</th>)}</tr></thead>
              <tbody>
                {rows.map((r,i)=>(
                  <tr key={i} style={{background:r._new?"rgba(183,134,11,0.06)":"transparent"}}>
                    <td style={TD}><input type="date" value={r.date||""} onChange={e=>upd(i,"date",e.target.value)} style={{...cellIn,width:"130px"}}/></td>
                    <td style={TD}><input value={r.chairedBy||""} onChange={e=>upd(i,"chairedBy",e.target.value)} placeholder="Name" style={{...cellIn,width:"130px"}}/></td>
                    <td style={TD}><textarea value={r.agenda||""} onChange={e=>upd(i,"agenda",e.target.value)} placeholder="Agenda / Topic" rows={2} style={{...cellIn,resize:"vertical",minWidth:"160px"}}/></td>
                    <td style={TD}><textarea value={r.decisions||""} onChange={e=>upd(i,"decisions",e.target.value)} placeholder="Decisions" rows={2} style={{...cellIn,resize:"vertical",minWidth:"160px"}}/></td>
                    <td style={TD}><textarea value={r.followup||""} onChange={e=>upd(i,"followup",e.target.value)} placeholder="Next actions" rows={2} style={{...cellIn,resize:"vertical",minWidth:"160px"}}/></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
      }
    </div>
  );
}

// ── Tab 3: Student Progress ──────────────────────────────────────
function TabProgress({ addData, students=[] }){
  const [rows,setRows]=useState([]);
  const [saving,setSaving]=useState(false);

  useEffect(()=>{ getData("student_progress_logs").then(d=>{ if(d&&!d.error) setRows(d.map(r=>({...r}))); }); },[]);

  const addRow=()=>setRows(p=>[BLANK.progress(),...p]);
  const upd=(i,k,v)=>setRows(p=>p.map((r,ri)=>ri===i?{...r,[k]:v}:r));

  const saveNew=async()=>{
    setSaving(true);
    for(const r of rows.filter(r=>r._new)){
      const {_new,...rec}=r; await addData("student_progress_logs",rec);
    }
    setRows(p=>p.map(r=>{const{_new,...rest}=r;return rest;}));
    setSaving(false);
  };

  const doPrint=()=>{
    const hdrs=["Student","House","Area of Strength","Area for Improvement","Target","Remarks"].map(h=>`<th>${h}</th>`).join("");
    const rws=rows.map(r=>{
      const hi=HOUSES.find(h=>h.id===r.houseId);
      return `<tr><td>${r.studentName||"—"}</td><td>${hi?hi.nameEn:r.houseId||"—"}</td><td>${r.strength||"—"}</td><td>${r.improvement||"—"}</td><td>${r.target||"—"}</td><td>${r.remarks||"—"}</td></tr>`;
    }).join("");
    printWith("Student Progress Report — Student Progress Log", hdrs, rws);
  };

  return (
    <div>
      <ActionBar label="Student Progress" onAdd={addRow} onSave={saveNew} onPrint={doPrint} saving={saving}/>
      {rows.length===0
        ? <Empty/>
        : <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",minWidth:"900px"}}>
              <thead><tr>{["Student","House","Area of Strength","Area for Improvement","Target","Remarks"].map(h=><th key={h} style={TH}>{h}</th>)}</tr></thead>
              <tbody>
                {rows.map((r,i)=>(
                  <tr key={i} style={{background:r._new?"rgba(183,134,11,0.06)":"transparent"}}>
                    <td style={TD}>
                      {students.length>0
                        ? <select value={r.studentName||""} onChange={e=>{ const st=students.find(s=>s.name===e.target.value); upd(i,"studentName",e.target.value); if(st)upd(i,"houseId",st.houseId); }} style={{...cellIn,width:"140px"}}>
                            <option value="">— Select —</option>
                            {students.map(st=><option key={st.id} value={st.name} style={{background:C.navyDark}}>{st.name}</option>)}
                          </select>
                        : <input value={r.studentName||""} onChange={e=>upd(i,"studentName",e.target.value)} placeholder="Name" style={{...cellIn,width:"130px"}}/>
                      }
                    </td>
                    <td style={TD}>
                      <select value={r.houseId||""} onChange={e=>upd(i,"houseId",e.target.value)} style={{...cellIn,width:"100px"}}>
                        {HOUSES.map(h=><option key={h.id} value={h.id} style={{background:C.navyDark}}>{h.nameEn}</option>)}
                      </select>
                    </td>
                    <td style={TD}><input value={r.strength||""} onChange={e=>upd(i,"strength",e.target.value)} placeholder="Strength" style={cellIn}/></td>
                    <td style={TD}><input value={r.improvement||""} onChange={e=>upd(i,"improvement",e.target.value)} placeholder="Improvement" style={cellIn}/></td>
                    <td style={TD}><input value={r.target||""} onChange={e=>upd(i,"target",e.target.value)} placeholder="Target" style={cellIn}/></td>
                    <td style={TD}><input value={r.remarks||""} onChange={e=>upd(i,"remarks",e.target.value)} placeholder="Remarks" style={cellIn}/></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
      }
    </div>
  );
}

// ── Tab 4: Discipline Log ────────────────────────────────────────
function TabDiscipline({ addData }){
  const [rows,setRows]=useState([]);
  const [saving,setSaving]=useState(false);

  useEffect(()=>{ getData("discipline_logs").then(d=>{ if(d&&!d.error) setRows(d.map(r=>({...r}))); }); },[]);

  const addRow=()=>setRows(p=>[BLANK.discipline(),...p]);
  const upd=(i,k,v)=>setRows(p=>p.map((r,ri)=>ri===i?{...r,[k]:v}:r));

  const saveNew=async()=>{
    setSaving(true);
    for(const r of rows.filter(r=>r._new)){
      const {_new,...rec}=r; await addData("discipline_logs",rec);
    }
    setRows(p=>p.map(r=>{const{_new,...rest}=r;return rest;}));
    setSaving(false);
  };

  const doPrint=()=>{
    const hdrs=["Date","Student","Incident","Action","Parents Notified","Remarks","Status"].map(h=>`<th>${h}</th>`).join("");
    const rws=rows.map(r=>`<tr>
      <td>${r.date||"—"}</td><td>${r.studentName||"—"}</td><td>${r.incident||"—"}</td>
      <td>${r.action||"—"}</td><td>${r.parentInformed||"—"}</td><td>${r.remarks||"—"}</td>
      <td style="font-weight:700;color:${r.status==="resolved"?"#16a34a":"#dc2626"}">${r.status==="resolved"?"Resolved":"Open"}</td>
    </tr>`).join("");
    printWith("Discipline Log", hdrs, rws);
  };

  return (
    <div>
      <ActionBar label="Discipline Log" onAdd={addRow} onSave={saveNew} onPrint={doPrint} saving={saving}/>
      {rows.length===0
        ? <Empty/>
        : <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",minWidth:"950px"}}>
              <thead><tr>{["Date","Student","Incident / Concern","Action","Parents Notified","Remarks","Status"].map(h=><th key={h} style={TH}>{h}</th>)}</tr></thead>
              <tbody>
                {rows.map((r,i)=>{
                  const isOpen=r.status==="open"||!r.status;
                  return (
                    <tr key={i} style={{background:r._new?"rgba(183,134,11,0.06)":isOpen?"rgba(220,38,38,0.04)":"rgba(22,163,74,0.04)"}}>
                      <td style={TD}><input type="date" value={r.date||""} onChange={e=>upd(i,"date",e.target.value)} style={{...cellIn,width:"125px"}}/></td>
                      <td style={TD}><input value={r.studentName||""} onChange={e=>upd(i,"studentName",e.target.value)} placeholder="Name" style={{...cellIn,width:"120px"}}/></td>
                      <td style={TD}><textarea value={r.incident||""} onChange={e=>upd(i,"incident",e.target.value)} placeholder="Incident/Concern" rows={2} style={{...cellIn,resize:"vertical",minWidth:"150px"}}/></td>
                      <td style={TD}><textarea value={r.action||""} onChange={e=>upd(i,"action",e.target.value)} placeholder="Action" rows={2} style={{...cellIn,resize:"vertical",minWidth:"140px"}}/></td>
                      <td style={TD}>
                        <select value={r.parentInformed||"No"} onChange={e=>upd(i,"parentInformed",e.target.value)} style={{...cellIn,width:"85px"}}>
                          <option style={{background:C.navyDark}}>No</option>
                          <option style={{background:C.navyDark}}>Yes</option>
                        </select>
                      </td>
                      <td style={TD}><input value={r.remarks||""} onChange={e=>upd(i,"remarks",e.target.value)} placeholder="Remarks" style={cellIn}/></td>
                      <td style={TD}>
                        <select value={r.status||"open"} onChange={e=>upd(i,"status",e.target.value)}
                          style={{...cellIn,width:"90px",color:isOpen?C.red:C.green,fontWeight:"700"}}>
                          <option value="open"   style={{background:C.navyDark,color:C.red}}>Open</option>
                          <option value="resolved" style={{background:C.navyDark,color:C.green}}>Resolved</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
      }
    </div>
  );
}

// ── Tab 5: Event Scoring ─────────────────────────────────────────
function TabEvents({ addData }){
  const [rows,setRows]=useState([...PRE_EVENTS.map(r=>({...r}))]);
  const [saving,setSaving]=useState(false);
  const [loaded,setLoaded]=useState(false);

  useEffect(()=>{
    getData("event_scores").then(d=>{
      if(d&&!d.error&&d.length>0){ setRows(d.map(r=>({...r}))); }
      setLoaded(true);
    });
  },[]);

  const addRow=()=>setRows(p=>[...p,BLANK.events()]);
  const upd=(i,k,v)=>setRows(p=>p.map((r,ri)=>ri===i?{...r,[k]:v}:r));

  const saveNew=async()=>{
    setSaving(true);
    for(const r of rows.filter(r=>r._new)){
      const {_new,...rec}=r; await addData("event_scores",rec);
    }
    setRows(p=>p.map(r=>{const{_new,...rest}=r;return rest;}));
    setSaving(false);
  };

  const winner=(r)=>{
    const scores={abuBakr:+r.abuBakr||0,umar:+r.umar||0,uthman:+r.uthman||0,ali:+r.ali||0};
    const max=Math.max(...Object.values(scores));
    if(max===0) return null;
    const winners=Object.entries(scores).filter(([,v])=>v===max).map(([k])=>HOUSES.find(h=>h.id===k));
    return winners;
  };

  const totalScores=()=>{
    const t={abuBakr:0,umar:0,uthman:0,ali:0};
    rows.forEach(r=>{ t.abuBakr+=+r.abuBakr||0; t.umar+=+r.umar||0; t.uthman+=+r.uthman||0; t.ali+=+r.ali||0; });
    return t;
  };
  const totals=totalScores();
  const grandWinner=()=>{
    const max=Math.max(totals.abuBakr,totals.umar,totals.uthman,totals.ali);
    if(max===0) return null;
    return HOUSES.filter(h=>totals[h.id]===max);
  };

  const doPrint=()=>{
    const hdrs=["Event","Criteria","Max Marks","Abu Bakr","Umar","Uthman","Ali","Winner"].map(h=>`<th>${h}</th>`).join("");
    const rws=rows.map(r=>{
      const w=winner(r);
      const wLabel=w?w.map(h=>h.nameEn).join("/"):"—";
      return `<tr>
        <td>${r.event||"—"}</td><td>${r.criteria||"—"}</td><td style="text-align:center">${r.maxMarks||"—"}</td>
        <td style="text-align:center;color:#1e40af;font-weight:700">${r.abuBakr||"—"}</td>
        <td style="text-align:center;color:#166534;font-weight:700">${r.umar||"—"}</td>
        <td style="text-align:center;color:#854d0e;font-weight:700">${r.uthman||"—"}</td>
        <td style="text-align:center;color:#991b1b;font-weight:700">${r.ali||"—"}</td>
        <td style="font-weight:700">${wLabel}</td>
      </tr>`;
    }).join("");
    const gw=grandWinner();
    const totalRow=`<tr style="background:#fef3c7;font-weight:700">
      <td colspan="3" style="text-align:center">Total Total</td>
      <td style="text-align:center;color:#1e40af">${totals.abuBakr}</td>
      <td style="text-align:center;color:#166534">${totals.umar}</td>
      <td style="text-align:center;color:#854d0e">${totals.uthman}</td>
      <td style="text-align:center;color:#991b1b">${totals.ali}</td>
      <td style="font-weight:800;color:#b7860b">${gw?gw.map(h=>h.nameEn).join("/"):"—"} 🏆</td>
    </tr>`;
    printWith("Event Scoring Sheet", hdrs, rws+totalRow);
  };

  return (
    <div>
      <ActionBar label="Event Scoring" onAdd={addRow} onSave={saveNew} onPrint={doPrint} saving={saving}/>

      {/* Grand Winner Banner */}
      {(()=>{const gw=grandWinner();return gw&&(
        <div style={{marginBottom:"14px",padding:"12px 18px",borderRadius:"12px",background:`linear-gradient(135deg,${gw[0].color}22,${gw[0].color}11)`,border:`1px solid ${gw[0].color}44`,display:"flex",alignItems:"center",gap:"12px"}}>
          <span style={{fontSize:"1.5rem"}}>🏆</span>
          <div>
            <div style={{fontSize:"0.8rem",fontWeight:"800",color:gw[0].color}}>{gw.map(h=>h.name).join(" / ")} — Overall Winner</div>
            <div style={{fontSize:"0.65rem",color:"rgba(255,255,255,0.45)"}}>{gw.map(h=>`${h.nameEn}: ${totals[h.id]} pts`).join(" · ")}</div>
          </div>
        </div>
      );})()}

      {/* Totals Row */}
      <div style={{display:"flex",gap:"10px",marginBottom:"14px",flexWrap:"wrap"}}>
        {HOUSES.map(h=>(
          <div key={h.id} style={{padding:"10px 18px",borderRadius:"12px",background:`${h.color}15`,border:`1px solid ${h.color}33`,textAlign:"center",minWidth:"100px"}}>
            <div style={{fontSize:"0.65rem",color:"rgba(255,255,255,0.5)"}}>{h.emoji} {h.nameEn}</div>
            <div style={{fontSize:"1.3rem",fontWeight:"900",color:h.color}}>{totals[h.id]}</div>
          </div>
        ))}
      </div>

      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",minWidth:"800px"}}>
          <thead>
            <tr>
              {["Event","Criteria","Maximum"].map(h=><th key={h} style={TH}>{h}</th>)}
              {HOUSES.map(h=><th key={h.id} style={{...TH,color:h.color}}>{h.emoji} {h.nameEn}</th>)}
              <th style={{...TH,color:G}}>🏆 Winner</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r,i)=>{
              const w=winner(r);
              return (
                <tr key={i} style={{background:r._new?"rgba(183,134,11,0.06)":"transparent",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
                  <td style={TD}><input value={r.event||""} onChange={e=>upd(i,"event",e.target.value)} placeholder="Event name" style={{...cellIn,minWidth:"160px"}}/></td>
                  <td style={TD}><input value={r.criteria||""} onChange={e=>upd(i,"criteria",e.target.value)} placeholder="Standard" style={{...cellIn,minWidth:"130px"}}/></td>
                  <td style={TD}><input type="number" value={r.maxMarks||""} onChange={e=>upd(i,"maxMarks",e.target.value)} placeholder="30" style={{...cellIn,width:"65px"}}/></td>
                  {HOUSES.map(h=>(
                    <td key={h.id} style={TD}>
                      <input type="number" min={0} max={r.maxMarks||999} value={r[h.id]||""} onChange={e=>upd(i,h.id,e.target.value)} placeholder="0"
                        style={{...cellIn,width:"60px",color:h.color,fontWeight:"700",textAlign:"center"}}/>
                    </td>
                  ))}
                  <td style={{...TD,textAlign:"center"}}>
                    {w?w.map(h=>(
                      <span key={h.id} style={{display:"inline-block",padding:"3px 8px",borderRadius:"8px",background:h.color+"22",color:h.color,fontSize:"0.65rem",fontWeight:"700",marginRight:"2px"}}>{h.emoji}</span>
                    )):"—"}
                  </td>
                </tr>
              );
            })}
            {/* Totals row */}
            <tr style={{background:"rgba(183,134,11,0.08)",borderTop:"2px solid rgba(183,134,11,0.3)"}}>
              <td colSpan={3} style={{...TD,color:G,fontWeight:"700",fontSize:"0.75rem"}}>Total Total</td>
              {HOUSES.map(h=>(
                <td key={h.id} style={{...TD,color:h.color,fontWeight:"900",textAlign:"center",fontSize:"0.88rem"}}>{totals[h.id]}</td>
              ))}
              <td style={TD}/>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Shared Helpers ───────────────────────────────────────────────
function ActionBar({ label, onAdd, onSave, onPrint, saving }){
  return (
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px",flexWrap:"wrap",gap:"10px"}}>
      <div style={{fontSize:"0.88rem",fontWeight:"700",color:G}}>{label}</div>
      <div style={{display:"flex",gap:"8px"}}>
        <button onClick={onAdd} style={{...S.addBtn,padding:"8px 16px",fontSize:"0.75rem"}}>+ Queue Added</button>
        <button onClick={onSave} disabled={saving} style={{...S.saveBtn,padding:"8px 18px",fontSize:"0.75rem",opacity:saving?0.6:1}}>
          {saving?"Saving...":"✔ Save"}
        </button>
        <button onClick={onPrint} style={{padding:"8px 16px",borderRadius:"10px",border:`1px solid ${G}55`,background:"rgba(183,134,11,0.12)",color:G,fontSize:"0.75rem",fontWeight:"700",cursor:"pointer",fontFamily:"inherit"}}>🖨️ Print</button>
      </div>
    </div>
  );
}
function Empty(){ return <div style={{textAlign:"center",padding:"50px",color:"rgba(255,255,255,0.2)",fontSize:"0.85rem"}} className="ur">کوئی اندراج نہیں</div>; }

// ── Main Component ───────────────────────────────────────────────
export default function HouseTemplates({ addData, students=[] }){
  const [tab,setTab]=useState("monthly");

  return (
    <div style={{background:`linear-gradient(135deg,${C.navyDark} 0%,${C.navyMid} 60%,${C.navy} 100%)`,minHeight:"100vh",padding:"20px",direction:"ltr"}}>

      {/* Header */}
      <div style={{...glass,marginBottom:"18px"}}>
        <div style={{fontSize:"1.3rem",fontWeight:"800",color:G}}>📋 5 House Template Sheets</div>
        <div style={{fontSize:"0.72rem",color:"rgba(255,255,255,0.5)",marginTop:"3px"}}>5 House Template Sheets — Monthly · Meeting · Progress · Discipline · Events</div>
      </div>

      {/* Tab Bar */}
      <div style={{display:"flex",gap:"6px",marginBottom:"18px",flexWrap:"wrap"}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            style={{padding:"10px 18px",borderRadius:"12px",fontFamily:"inherit",fontSize:"0.78rem",fontWeight:"700",cursor:"pointer",transition:"all 0.2s",
              border:`1.5px solid ${tab===t.id?G:"rgba(255,255,255,0.1)"}`,
              background:tab===t.id?"rgba(183,134,11,0.18)":"rgba(255,255,255,0.04)",
              color:tab===t.id?G:W}}>
            {t.labelUr}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={glass}>
        {tab==="monthly"    && <TabMonthly    addData={addData}/>}
        {tab==="meeting"    && <TabMeeting    addData={addData}/>}
        {tab==="progress"   && <TabProgress   addData={addData} students={students}/>}
        {tab==="discipline" && <TabDiscipline addData={addData}/>}
        {tab==="events"     && <TabEvents     addData={addData}/>}
      </div>
    </div>
  );
}
