/* eslint-disable */
import { useState, useEffect } from "react";
import { getData } from "../../supabase";
import letterhead from "../../assets/letterhead.png";
import { C, S, HOUSES } from "../../constants";

const G = C.gold; const W = C.white;

const SCALES = [
  { id:"performance", labelUr:"کارکردگی پیمانہ",   labelEn:"Performance Scale",    icon:"📈", color:"#f472b6",
    subs:["Academic Results","Effort","Improvement","Creativity"] },
  { id:"discipline",  labelUr:"ضبط و نظم",          labelEn:"Discipline Scale",     icon:"⚔️",  color:"#60a5fa",
    subs:["یونیفارم","اطاعت","وقت کا انتظام","ساتھیوں سے سلوک"] },
  { id:"academic",    labelUr:"علمی کامیابی",        labelEn:"Academic Achievement", icon:"📚", color:"#4ade80",
    subs:["ٹیسٹ","گھر کا کام","کلاس شرکت","تصورات"] },
  { id:"social",      labelUr:"Social Interaction",       labelEn:"Social Interaction",   icon:"🤝", color:"#fb923c",
    subs:["Teamwork","Helping","Cooperation","Communication"] },
  { id:"quran",       labelUr:"Quranic Behaviour",          labelEn:"Quranic Behaviour",    icon:"📖", color:"#a78bfa",
    subs:["Tajweed","Memorization","Respect","Adab"] },
  { id:"motivation",  labelUr:"Motivation",        labelEn:"Motivation Scale",     icon:"🚀", color:"#34d399",
    subs:["Initiative","Curiosity","Consistency","Positivity"] },
  { id:"emotional",   labelUr:"Emotional Stability",      labelEn:"Emotional Stability",  icon:"💫", color:"#fbbf24",
    subs:["Anger Control","Patience","Confidence","Adjustment"] },
  { id:"leadership",  labelUr:"Leadership Scale",        labelEn:"Leadership Scale",     icon:"👑", color:G,
    subs:["Decision Making","Guidance","Initiative","Accountability"] },
];

// ── Radar Chart Math ──────────────────────────────────────────────
const CX=190, CY=190, R=145, N=8;
const ang  = i => -Math.PI/2 + i*(2*Math.PI/N);
const rPt  = (i,v,max=5) => { const r=(v/max)*R; return [CX+r*Math.cos(ang(i)), CY+r*Math.sin(ang(i))]; };
const grid = f => SCALES.map((_,i)=>{ const r=f*R; return `${CX+r*Math.cos(ang(i))},${CY+r*Math.sin(ang(i))}`; }).join(" ");
const lPt  = i => { const r=R+32; return [CX+r*Math.cos(ang(i)), CY+r*Math.sin(ang(i))]; };
const poly = rt => SCALES.map((s,i)=>{ const [x,y]=rPt(i,rt[s.id]||0); return `${x},${y}`; }).join(" ");

function RadarChart({ ratings, houseColor, size=380 }) {
  const pts  = poly(ratings);
  const dots = SCALES.map((s,i)=>rPt(i,ratings[s.id]||0));
  const lbls = SCALES.map((_,i)=>lPt(i));
  const GRIDS=[0.2,0.4,0.6,0.8,1];
  return (
    <svg width={size} height={size} viewBox={`0 0 ${CX*2} ${CY*2}`} style={{display:"block"}}>
      {/* grid octagons */}
      {GRIDS.map(f=>(
        <polygon key={f} points={grid(f)} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1"/>
      ))}
      {/* grid value labels (1-5) */}
      {GRIDS.map((f,fi)=>(
        <text key={fi} x={CX+2} y={CY-(f*R)+3} fontSize="8" fill="rgba(255,255,255,0.3)" textAnchor="middle">{fi+1}</text>
      ))}
      {/* axis lines */}
      {SCALES.map((_,i)=>{
        const [ax,ay]=rPt(i,5);
        return <line key={i} x1={CX} y1={CY} x2={ax} y2={ay} stroke="rgba(255,255,255,0.12)" strokeWidth="1"/>;
      })}
      {/* data fill */}
      <polygon points={pts} fill={houseColor+"33"} stroke={houseColor} strokeWidth="2.5" strokeLinejoin="round"/>
      {/* dots */}
      {dots.map(([dx,dy],i)=>(
        <circle key={i} cx={dx} cy={dy} r="5" fill={houseColor} stroke={W} strokeWidth="1.5"/>
      ))}
      {/* axis icons + labels */}
      {SCALES.map((s,i)=>{
        const [lx,ly]=lbls[i];
        return (
          <g key={i}>
            <text x={lx} y={ly-7}   fontSize="13" textAnchor="middle" dominantBaseline="middle">{s.icon}</text>
            <text x={lx} y={ly+9}   fontSize="7.5" fill="rgba(255,255,255,0.65)" textAnchor="middle" fontFamily="Arial">{s.labelEn.split(" ")[0]}</text>
          </g>
        );
      })}
      {/* center dot */}
      <circle cx={CX} cy={CY} r="3" fill="rgba(255,255,255,0.2)"/>
    </svg>
  );
}

function RatingPicker({ value, onChange, color }) {
  return (
    <div style={{display:"flex",gap:"5px"}}>
      {[1,2,3,4,5].map(n=>(
        <button key={n} onClick={()=>onChange(n)}
          style={{width:"30px",height:"30px",borderRadius:"7px",border:"none",cursor:"pointer",
            background:n<=value?color:"rgba(255,255,255,0.07)",
            color:n<=value?W:"rgba(255,255,255,0.3)",
            fontWeight:"800",fontSize:"0.78rem",transition:"all 0.15s",
            boxShadow:n===value?`0 0 8px ${color}66`:"none"}}>
          {n}
        </button>
      ))}
    </div>
  );
}

function getMonthLabel(d=new Date()){
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
}
function overallScore(rt){ return Math.round((SCALES.reduce((s,sc)=>s+(rt[sc.id]||0),0)/(N*5))*100); }
function grade(pct){ return pct>=90?"A+":pct>=80?"A":pct>=70?"B+":pct>=60?"B":pct>=50?"C":"D"; }
function gradeColor(pct){ return pct>=70?C.green:pct>=50?G:C.red; }

const glass={background:"rgba(255,255,255,0.07)",backdropFilter:"blur(20px)",borderRadius:"18px",border:"1px solid rgba(255,255,255,0.1)",padding:"20px"};

export default function EvaluationScales({ addData, students=[] }) {
  const [selStu,   setSelStu]   = useState("");
  const [selMonth, setSelMonth] = useState(getMonthLabel());
  const [ratings,  setRatings]  = useState(()=>{ const r={}; SCALES.forEach(s=>r[s.id]=3); return r; });
  const [remarks,  setRemarks]  = useState({});
  const [evals,    setEvals]    = useState([]);
  const [evTab,    setEvTab]    = useState("form");
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);

  useEffect(()=>{
    getData("evaluation_scales").then(d=>{ if(d&&!d.error) setEvals(d); });
  },[]);

  const student   = students.find(s=>s.id===selStu)||null;
  const houseInfo = HOUSES.find(h=>h.id===student?.houseId)||HOUSES[0];
  const hColor    = houseInfo.color;

  const saveEval=async()=>{
    if(!selStu) return;
    setSaving(true);
    const rec={ student_id:selStu, month:selMonth, ratings, remarks,
                overall:overallScore(ratings), house_id:student?.houseId||"" };
    await addData("evaluation_scales", rec);
    setEvals(prev=>[...prev, {...rec,id:Date.now(),created_at:new Date().toISOString()}]);
    setSaving(false); setSaved(true); setTimeout(()=>setSaved(false),2200);
  };

  // History for selected student
  const history=[...evals].filter(e=>e.student_id===selStu).sort((a,b)=>b.month.localeCompare(a.month));

  // Print — serialize SVG + full report
  const doPrint=()=>{
    if(!selStu){ alert("پہلے طالب علم منتخب کریں"); return; }
    const stu=student;
    const overall=overallScore(ratings);
    const g=grade(overall);

    // Build SVG string for print
    const GRIDS_P=[0.2,0.4,0.6,0.8,1];
    const ptsStr=poly(ratings);
    const gridLines=GRIDS_P.map(f=>`<polygon points="${grid(f)}" fill="none" stroke="#e2e8f0" stroke-width="1"/>`).join("");
    const axLines=SCALES.map((_,i)=>{ const [ax,ay]=rPt(i,5); return `<line x1="${CX}" y1="${CY}" x2="${ax}" y2="${ay}" stroke="#cbd5e1" stroke-width="1"/>`; }).join("");
    const dotsStr=SCALES.map((s,i)=>{ const [dx,dy]=rPt(i,ratings[s.id]||0); return `<circle cx="${dx}" cy="${dy}" r="5" fill="${hColor}" stroke="white" stroke-width="1.5"/>`; }).join("");
    const labStr=SCALES.map((s,i)=>{ const [lx,ly]=lPt(i); return `<text x="${lx}" y="${ly}" font-size="9" text-anchor="middle" dominant-baseline="middle" fill="#475569">${s.labelEn.split(" ")[0]}</text>`; }).join("");
    const svgStr=`<svg width="340" height="340" viewBox="0 0 ${CX*2} ${CY*2}" xmlns="http://www.w3.org/2000/svg">${gridLines}${axLines}<polygon points="${ptsStr}" fill="${hColor}33" stroke="${hColor}" stroke-width="2.5"/>${dotsStr}${labStr}</svg>`;

    const scaleRows=SCALES.map(s=>`<tr>
      <td>${s.icon} ${s.labelEn}</td>
      <td style="text-align:center;font-weight:700;color:${s.color}">${ratings[s.id]||0}/5</td>
      <td>${s.subs.join(", ")}</td>
      <td style="color:#64748b;font-size:11px">${remarks[s.id]||"—"}</td>
    </tr>`).join("");

    const w=window.open("","_blank","width=900,height=700");
    w.document.write(`<!DOCTYPE html><html dir="ltr"><body style="font-family:serif;padding:20px;direction:rtl;background:#fff">
      <img src="${letterhead}" style="width:100%;max-width:700px;display:block;margin:0 auto 16px" onerror="this.style.display='none'"/>
      <h2 style="text-align:center;color:#1e293b;margin-bottom:4px">Student Assessment Report</h2>
      <h3 style="text-align:center;color:#b7860b;margin-top:0">Student Evaluation Report</h3>
      <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 20px;background:#f8fafc;border-radius:10px;margin-bottom:16px;font-size:13px">
        <div><strong>Student:</strong> ${stu?.name||selStu}</div>
        <div><strong>Class:</strong> ${stu?.grade||"—"}</div>
        <div><strong>House:</strong> ${houseInfo.nameEn}</div>
        <div><strong>Month:</strong> ${selMonth}</div>
        <div style="font-size:1.2rem;font-weight:900;color:${gradeColor(overall)}">${overall}% — ${g}</div>
      </div>
      <div style="display:flex;gap:24px;align-items:flex-start;margin-bottom:20px">
        <div>${svgStr}</div>
        <table border="1" cellpadding="7" style="flex:1;border-collapse:collapse;font-size:12px">
          <tr style="background:#1e293b;color:#fff"><th>Scale</th><th>Rank</th><th>Sub-Standard</th><th>Remarks</th></tr>
          ${scaleRows}
          <tr style="background:#fef3c7;font-weight:700">
            <td colspan="2" style="text-align:center">Total Rank: ${overall}% — ${g}</td>
            <td colspan="2"></td>
          </tr>
        </table>
      </div>
      <div style="margin-top:50px;display:flex;justify-content:space-between;align-items:flex-end">
        <div style="text-align:center;min-width:180px">
          <div style="border-top:1.5px solid #0f172a;padding-top:6px;font-size:13px">Teacher Signature</div>
        </div>
        <div style="font-size:12px;color:#64748b">Printed: ${new Date().toLocaleDateString("en-PK",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</div>
      </div>
      <script>window.print();window.close();<\/script>
    </body></html>`);
  };

  const overall=overallScore(ratings);
  const gc=gradeColor(overall);

  return (
    <div style={{background:`linear-gradient(135deg,${C.navyDark} 0%,${C.navyMid} 60%,${C.navy} 100%)`,minHeight:"100vh",padding:"20px",direction:"ltr"}}>

      {/* Header */}
      <div style={{...glass,marginBottom:"18px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"12px"}}>
        <div>
          <div style={{fontSize:"1.3rem",fontWeight:"800",color:G}}>🎯 8 Assessment Scales</div>
          <div style={{fontSize:"0.73rem",color:"rgba(255,255,255,0.5)",marginTop:"3px"}}>8 Student Evaluation Scales — Radar Chart</div>
        </div>
        <div style={{display:"flex",gap:"10px",alignItems:"center",flexWrap:"wrap"}}>
          <select value={selStu} onChange={e=>setSelStu(e.target.value)}
            style={{...S.inpSm,background:"rgba(255,255,255,0.06)",color:selStu?W:"rgba(255,255,255,0.4)",border:`1px solid ${G}40`,minWidth:"180px"}}>
            <option value="">— Student Select —</option>
            {students.map(st=>(
              <option key={st.id} value={st.id} style={{background:C.navyDark,color:W}}>{st.name} ({st.grade})</option>
            ))}
          </select>
          <input type="month" value={selMonth} onChange={e=>setSelMonth(e.target.value)}
            style={{padding:"8px 12px",borderRadius:"10px",border:`1px solid ${G}40`,background:"rgba(255,255,255,0.06)",color:W,fontSize:"0.8rem",outline:"none"}}/>
          <button onClick={doPrint} style={{...S.addBtn,padding:"8px 16px",fontSize:"0.75rem"}}>🖨️ Print</button>
        </div>
      </div>

      {/* Inner Tabs */}
      <div style={{display:"flex",gap:"6px",marginBottom:"16px"}}>
        {[["form","📝 Assessment Form"],["history","📜 Monthly History"]].map(([id,lbl])=>(
          <button key={id} onClick={()=>setEvTab(id)}
            style={{padding:"9px 20px",borderRadius:"10px",fontFamily:"inherit",fontSize:"0.78rem",fontWeight:"700",cursor:"pointer",
              border:`1px solid ${evTab===id?G:"rgba(255,255,255,0.12)"}`,
              background:evTab===id?"rgba(183,134,11,0.18)":"transparent",
              color:evTab===id?G:W}}>
            {lbl}
          </button>
        ))}
      </div>

      {/* ── TAB: Form ── */}
      {evTab==="form"&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr 360px",gap:"18px",alignItems:"start"}}>

          {/* Left: Rating Form */}
          <div style={glass}>
            <div style={{fontSize:"0.88rem",color:G,fontWeight:"700",marginBottom:"16px"}}>
              8 Scales Ranking {student&&<span style={{color:hColor,marginRight:"8px"}}>— {student.name}</span>}
            </div>
            {!selStu&&(
              <div style={{textAlign:"center",padding:"40px",color:"rgba(255,255,255,0.3)"}}>Select a student first</div>
            )}
            {selStu&&SCALES.map((sc,si)=>(
              <div key={sc.id} style={{marginBottom:"16px",padding:"14px",borderRadius:"12px",background:"rgba(255,255,255,0.04)",border:`1px solid ${sc.color}22`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"8px",flexWrap:"wrap",gap:"8px"}}>
                  <div>
                    <div style={{fontSize:"0.82rem",fontWeight:"700",color:W}}>
                      <span style={{marginLeft:"6px"}}>{sc.icon}</span>{sc.labelUr}
                      <span style={{fontSize:"0.65rem",color:"rgba(255,255,255,0.4)",marginRight:"8px"}}> — {sc.labelEn}</span>
                    </div>
                    <div style={{fontSize:"0.62rem",color:"rgba(255,255,255,0.35)",marginTop:"3px",direction:"ltr"}}>
                      {sc.subs.join(" · ")}
                    </div>
                  </div>
                  <RatingPicker value={ratings[sc.id]||3} onChange={v=>setRatings(prev=>({...prev,[sc.id]:v}))} color={sc.color}/>
                </div>
                <input placeholder={`${sc.labelEn} — Teacher remarks`} value={remarks[sc.id]||""}
                  onChange={e=>setRemarks(prev=>({...prev,[sc.id]:e.target.value}))}
                  style={{...S.inpSm,background:"rgba(255,255,255,0.05)",color:W,border:"1px solid rgba(255,255,255,0.1)",fontSize:"0.72rem"}}/>
              </div>
            ))}
            {selStu&&(
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:"6px"}}>
                <div style={{fontSize:"0.72rem",color:"rgba(255,255,255,0.4)"}}>
                  Total: <span style={{color:gc,fontWeight:"800",fontSize:"0.9rem"}}>{overall}%</span>
                  <span style={{marginRight:"8px",color:gc,fontWeight:"700"}}> — {grade(overall)}</span>
                </div>
                <button onClick={saveEval} disabled={saving}
                  style={{...S.saveBtn,padding:"10px 24px",fontSize:"0.8rem",opacity:saving?0.6:1}}>
                  {saving?"Saving...":saved?"✅ Saved!":"✔ Save"}
                </button>
              </div>
            )}
          </div>

          {/* Right: Radar Chart + Summary */}
          <div style={{display:"flex",flexDirection:"column",gap:"14px"}}>
            {/* Radar */}
            <div style={{...glass,display:"flex",flexDirection:"column",alignItems:"center",padding:"16px"}}>
              <div style={{fontSize:"0.72rem",color:G,fontWeight:"700",marginBottom:"10px",width:"100%"}}>🕸️ Radar Chart</div>
              {selStu
                ? <RadarChart ratings={ratings} houseColor={hColor} size={320}/>
                : <div style={{width:"320px",height:"320px",display:"flex",alignItems:"center",justifyContent:"center",color:"rgba(255,255,255,0.2)",fontSize:"0.8rem"}}>
                    Student Select
                  </div>
              }
            </div>

            {/* Scale legend */}
            <div style={{...glass,padding:"14px"}}>
              <div style={{fontSize:"0.7rem",color:G,fontWeight:"700",marginBottom:"10px"}}>Scales — Score</div>
              {SCALES.map(sc=>{
                const v=ratings[sc.id]||0;
                const pct=(v/5)*100;
                return (
                  <div key={sc.id} style={{marginBottom:"8px"}}>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:"0.63rem",color:"rgba(255,255,255,0.65)",marginBottom:"3px"}}>
                      <span>{sc.icon} {sc.labelEn.split(" ")[0]}</span>
                      <span style={{color:sc.color,fontWeight:"800",direction:"ltr"}}>{v}/5</span>
                    </div>
                    <div style={{height:"4px",background:"rgba(255,255,255,0.07)",borderRadius:"2px",overflow:"hidden"}}>
                      <div style={{width:`${pct}%`,height:"100%",background:sc.color,borderRadius:"2px",transition:"width 0.3s"}}/>
                    </div>
                  </div>
                );
              })}
              {selStu&&(
                <div style={{marginTop:"12px",paddingTop:"10px",borderTop:"1px solid rgba(255,255,255,0.08)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:"0.7rem",color:"rgba(255,255,255,0.5)"}}>Total</span>
                  <span style={{fontSize:"1.1rem",fontWeight:"900",color:gc}}>{overall}%</span>
                  <span style={{fontSize:"0.85rem",fontWeight:"800",color:gc}}>{grade(overall)}</span>
                </div>
              )}
            </div>

            {/* House badge */}
            {student&&(
              <div style={{...glass,padding:"12px 16px",display:"flex",alignItems:"center",gap:"12px"}}>
                <div style={{width:"40px",height:"40px",borderRadius:"10px",background:houseInfo.gradient,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.3rem",flexShrink:0}}>{houseInfo.emoji}</div>
                <div>
                  <div style={{fontSize:"0.78rem",fontWeight:"700",color:W}}>{student.name}</div>
                  <div style={{fontSize:"0.65rem",color:"rgba(255,255,255,0.45)"}}>{student.grade} · {houseInfo.name} House</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB: History ── */}
      {evTab==="history"&&(
        <div style={glass}>
          <div style={{fontSize:"0.88rem",color:G,fontWeight:"700",marginBottom:"14px"}}>
            Monthly Assessment Date {student&&<span style={{color:hColor}}>— {student.name}</span>}
          </div>
          {!selStu&&(
            <div style={{textAlign:"center",padding:"50px",color:"rgba(255,255,255,0.25)"}}>Select a student first</div>
          )}
          {selStu&&history.length===0&&(
            <div style={{textAlign:"center",padding:"50px",color:"rgba(255,255,255,0.25)"}}>No assessments found</div>
          )}
          {selStu&&history.length>0&&(
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",minWidth:"700px"}}>
                <thead>
                  <tr>
                    <th style={{...S.th,background:"rgba(255,255,255,0.04)",color:"rgba(255,255,255,0.55)",padding:"10px 12px"}}>Month</th>
                    {SCALES.map(sc=>(
                      <th key={sc.id} style={{...S.th,background:"rgba(255,255,255,0.04)",color:sc.color,padding:"10px 8px",fontSize:"0.62rem"}}>
                        {sc.icon}<br/>{sc.labelEn.split(" ")[0]}
                      </th>
                    ))}
                    <th style={{...S.th,background:"rgba(255,255,255,0.04)",color:"rgba(255,255,255,0.55)",padding:"10px 12px"}}>Total</th>
                    <th style={{...S.th,background:"rgba(255,255,255,0.04)",color:"rgba(255,255,255,0.55)",padding:"10px 12px"}}>Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((ev,i)=>{
                    const rt=ev.ratings||{};
                    const ov=ev.overall||overallScore(rt);
                    const gc2=gradeColor(ov);
                    return (
                      <tr key={i} style={{borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
                        <td style={{...S.td,color:G,fontWeight:"700",padding:"9px 12px",direction:"ltr"}}>{ev.month}</td>
                        {SCALES.map(sc=>(
                          <td key={sc.id} style={{...S.td,color:sc.color,fontWeight:"700",padding:"9px 8px",direction:"ltr",textAlign:"center"}}>{rt[sc.id]||"—"}</td>
                        ))}
                        <td style={{...S.td,color:gc2,fontWeight:"800",padding:"9px 12px",direction:"ltr",textAlign:"center"}}>{ov}%</td>
                        <td style={{padding:"9px 12px",textAlign:"center"}}>
                          <span style={{display:"inline-block",padding:"3px 10px",borderRadius:"10px",background:gc2+"22",color:gc2,fontSize:"0.7rem",fontWeight:"800",border:`1px solid ${gc2}40`}}>
                            {grade(ov)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
