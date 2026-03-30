/* eslint-disable */
import { useState, useEffect } from "react";
import { getData } from "../../supabase";
import letterhead from "../../assets/letterhead.png";
import { C, S, HOUSES } from "../../constants";

const G = C.gold; const N = C.navy; const W = C.white;

const ROLES = [
  { id:"housemaster",     labelUr:"House Master",       labelEn:"House Master",       pts:10 },
  { id:"vicemaster",      labelUr:"Deputy House Master",  labelEn:"Vice Master",        pts:8  },
  { id:"moralityhead",    labelUr:"Morality Head",   labelEn:"Morality Head",      pts:6  },
  { id:"societyhead",     labelUr:"Society Head",    labelEn:"Society Head",       pts:6  },
  { id:"cleanlinesshead", labelUr:"Cleanliness Head",      labelEn:"Cleanliness Head",   pts:5  },
  { id:"captain",         labelUr:"Student Captain",   labelEn:"Student Captain",    pts:5  },
  { id:"monitor",         labelUr:"Class Monitor",       labelEn:"Class Monitor",      pts:4  },
];
const MAX_MONTH  = 40;
const WEEK_MAX   = ROLES.reduce((s,r)=>s+r.pts, 0); // 44

function getWeekLabel(d=new Date()){
  const jan1=new Date(d.getFullYear(),0,1);
  const wk=Math.ceil(((d-jan1)/86400000+jan1.getDay()+1)/7);
  return `${d.getFullYear()}-W${String(wk).padStart(2,"0")}`;
}
function getMonthLabel(d=new Date()){
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
}
function ratingOf(pct){ return pct>=90?"Excellent":pct>=70?"Good":pct>=50?"Fair":"Weak"; }
function ratingColor(r){ return r==="Excellent"?C.green:r==="Good"?G:r==="Fair"?C.amber:C.red; }
function badge(color){ return {display:"inline-block",padding:"3px 10px",borderRadius:"12px",background:color+"22",color,fontSize:"0.65rem",fontWeight:"700",border:`1px solid ${color}40`}; }

const glass = { background:"rgba(255,255,255,0.07)", backdropFilter:"blur(20px)", borderRadius:"18px", border:"1px solid rgba(255,255,255,0.12)", padding:"20px" };

export default function LeadershipRoles({ addData }) {
  const [selHouse,  setSelHouse]  = useState(HOUSES[0].id);
  const [selMonth,  setSelMonth]  = useState(getMonthLabel());
  const [weekLabel, setWeekLabel] = useState(getWeekLabel());
  const [lrTab,     setLrTab]     = useState("assign");   // assign | weekly | log
  const [entries,   setEntries]   = useState([]);
  const [assignments, setAssignments] = useState({});     // "houseId_roleId" -> holderName
  const [weekForm,  setWeekForm]  = useState(()=>{ const f={}; ROLES.forEach(r=>{ f[r.id]={pts:r.pts,notes:""}; }); return f; });
  const [saving,    setSaving]    = useState(false);
  const [saved,     setSaved]     = useState(false);

  useEffect(()=>{
    getData("leadership_roles").then(d=>{ if(d&&!d.error) setEntries(d); });
  },[]);

  // Rebuild assignments map from sentinel entries (week="assign")
  useEffect(()=>{
    const map={};
    entries.filter(e=>e.week==="assign").forEach(e=>{
      const key=`${e.house_id}_${e.role_id}`;
      // keep latest by created_at
      if(!map[key]||e.created_at>map[key].created_at) map[key]=e;
    });
    const names={};
    Object.entries(map).forEach(([k,v])=>{ names[k]=v.holder_name||""; });
    setAssignments(names);
  },[entries]);

  const saveAssignment=async(houseId,roleId,holderName)=>{
    const rec={ house_id:houseId, role_id:roleId, holder_name:holderName,
                week:"assign", month:"assign", points_earned:0, rating:"", notes:"" };
    await addData("leadership_roles", rec);
    setEntries(prev=>[...prev, {...rec, id:Date.now(), created_at:new Date().toISOString()}]);
  };

  // Helpers
  const monthEntries = entries.filter(e=>e.house_id===selHouse && e.month===selMonth && e.week!=="assign");
  const roleMonthTotal = (roleId) => monthEntries.filter(e=>e.role_id===roleId).reduce((s,e)=>s+(e.points_earned||0),0);
  const houseMonthTotal = () => Math.min(ROLES.reduce((s,r)=>s+roleMonthTotal(r.id),0), MAX_MONTH);

  const saveWeek=async()=>{
    setSaving(true);
    const newEntries=[];
    for(const r of ROLES){
      const pts=parseInt(weekForm[r.id]?.pts??r.pts);
      const pct=Math.round((pts/r.pts)*100);
      const rating=ratingOf(pct);
      const holder=assignments[`${selHouse}_${r.id}`]||"";
      const rec={ house_id:selHouse, role_id:r.id, holder_name:holder,
                  week:weekLabel, month:selMonth, points_earned:pts, rating, notes:weekForm[r.id]?.notes||"" };
      await addData("leadership_roles", rec);
      newEntries.push({...rec, id:Date.now()+Math.random(), created_at:new Date().toISOString()});
    }
    setEntries(prev=>[...prev, ...newEntries]);
    setSaving(false); setSaved(true); setTimeout(()=>setSaved(false),2200);
  };

  const wfPts = (roleId) => parseInt(weekForm[roleId]?.pts ?? ROLES.find(r=>r.id===roleId)?.pts ?? 0);

  const houseObj  = HOUSES.find(h=>h.id===selHouse)||HOUSES[0];
  const monthly   = houseMonthTotal();
  const monthPct  = Math.round((monthly/MAX_MONTH)*100);
  const monthRating = ratingOf(monthPct);

  // Print
  const doPrint=()=>{
    const w=window.open("","_blank","width=900,height=700");
    const rows=ROLES.map(r=>{
      const tot=roleMonthTotal(r.id);
      const holder=assignments[`${selHouse}_${r.id}`]||"—";
      const pct=Math.round((tot/(r.pts*4))*100);
      return `<tr>
        <td>${r.labelUr}</td><td>${r.labelEn}</td><td>${holder}</td>
        <td style="text-align:center">${r.pts}/wk</td>
        <td style="text-align:center;font-weight:700;color:#b7860b">${tot}</td>
        <td style="text-align:center">${ratingOf(pct)}</td>
      </tr>`;
    }).join("");
    w.document.write(`<!DOCTYPE html><html dir="ltr"><body style="font-family:serif;padding:20px;direction:rtl">
      <img src="${letterhead}" style="width:100%;max-width:700px;display:block;margin:0 auto 16px" onerror="this.style.display='none'"/>
      <h2 style="text-align:center;color:#1e293b">Leadership & Character — ${houseObj.nameEn} House — ${selMonth}</h2>
      <p style="text-align:center;font-size:14px">Monthly Total: <strong>${monthly}/40</strong> &nbsp;|&nbsp; Rank: <strong>${monthRating}</strong></p>
      <table border="1" cellpadding="8" style="width:100%;border-collapse:collapse;font-size:13px;margin-top:12px">
        <tr style="background:#1e293b;color:#fff">
          <th>Role</th><th>Role</th><th>Responsible</th><th>Max/Wk</th><th>Monthly Total</th><th>Rank</th>
        </tr>
        ${rows}
        <tr style="background:#fef3c7;font-weight:700">
          <td colspan="4" style="text-align:center">Total (Max 40)</td>
          <td style="text-align:center;color:#b7860b">${monthly}</td>
          <td style="text-align:center">${monthRating}</td>
        </tr>
      </table>
      <div style="margin-top:50px;display:flex;justify-content:space-between;align-items:flex-end">
        <div style="text-align:center;min-width:180px">
          <div style="border-top:1.5px solid #0f172a;padding-top:6px;font-size:13px">House Master Signature<br/>ure</div>
        </div>
        <div style="font-size:12px;color:#666">Printed: ${new Date().toLocaleDateString("en-PK",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</div>
      </div>
      <script>window.print();window.close();<\/script>
    </body></html>`);
  };

  return (
    <div style={{background:`linear-gradient(135deg,${C.navyDark} 0%,${C.navyMid} 60%,${C.navy} 100%)`,minHeight:"100vh",padding:"20px",direction:"ltr"}}>

      {/* Header */}
      <div style={{...glass,marginBottom:"18px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"12px"}}>
        <div>
          <div style={{fontSize:"1.3rem",fontWeight:"800",color:G}}>👑 Leadership & Character</div>
          <div style={{fontSize:"0.75rem",color:"rgba(255,255,255,0.5)",marginTop:"3px"}}>Leadership & Roles — Max 40 Points / Month per House</div>
        </div>
        <div style={{display:"flex",gap:"10px",alignItems:"center",flexWrap:"wrap"}}>
          <input type="month" value={selMonth} onChange={e=>setSelMonth(e.target.value)}
            style={{padding:"8px 12px",borderRadius:"10px",border:`1px solid ${G}40`,background:"rgba(255,255,255,0.08)",color:W,fontSize:"0.8rem",outline:"none"}}/>
          <button onClick={doPrint} style={{...S.addBtn,padding:"8px 16px",fontSize:"0.75rem"}}>🖨️ Print</button>
        </div>
      </div>

      {/* House Tabs */}
      <div style={{display:"flex",gap:"8px",marginBottom:"18px",flexWrap:"wrap"}}>
        {HOUSES.map(h=>(
          <button key={h.id} onClick={()=>setSelHouse(h.id)}
            style={{padding:"10px 22px",borderRadius:"12px",border:`2px solid ${h.color}`,
              background:selHouse===h.id?h.gradient:"transparent",
              color:selHouse===h.id?W:h.color,fontFamily:"inherit",fontSize:"0.82rem",
              fontWeight:"700",cursor:"pointer",transition:"all 0.2s"}}>
            {h.emoji} {h.name}
          </button>
        ))}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"290px 1fr",gap:"18px",alignItems:"start"}}>

        {/* ─── Left Panel ─── */}
        <div style={{display:"flex",flexDirection:"column",gap:"14px"}}>

          {/* Big Score Card */}
          <div style={{...glass,textAlign:"center"}}>
            <div style={{fontSize:"0.68rem",color:"rgba(255,255,255,0.45)",marginBottom:"6px"}}>{houseObj.emoji} {houseObj.name} — {selMonth}</div>
            <div style={{fontSize:"3rem",fontWeight:"900",color:houseObj.color,lineHeight:1}}>{monthly}</div>
            <div style={{fontSize:"0.8rem",color:"rgba(255,255,255,0.4)",marginBottom:"10px"}}>/ {MAX_MONTH} Monthly Maximum</div>
            <div style={{height:"8px",background:"rgba(255,255,255,0.08)",borderRadius:"4px",overflow:"hidden",marginBottom:"8px"}}>
              <div style={{width:`${monthPct}%`,height:"100%",background:houseObj.gradient,borderRadius:"4px",transition:"width 0.5s"}}/>
            </div>
            <span style={badge(ratingColor(monthRating))}>{monthRating}</span>
            <div style={{fontSize:"0.62rem",color:"rgba(255,255,255,0.35)",marginTop:"6px"}}>{monthPct}% of max</div>
          </div>

          {/* 300-Mark Feed */}
          <div style={{...glass}}>
            <div style={{fontSize:"0.72rem",color:G,fontWeight:"700",marginBottom:"10px"}}>📊 Part of 300 Marks Grand Total</div>
            <div style={{fontSize:"0.65rem",lineHeight:2,color:"rgba(255,255,255,0.55)"}}>
              🏅 HVS Weekly: <span style={{color:"rgba(255,255,255,0.3)"}}>— /160</span><br/>
              📋 Duty: <span style={{color:"rgba(255,255,255,0.3)"}}>— /60</span><br/>
              💎 Training: <span style={{color:"rgba(255,255,255,0.3)"}}>— /40</span><br/>
              🎭 Activities: <span style={{color:"rgba(255,255,255,0.3)"}}>— /40</span><br/>
              <span style={{borderTop:"1px solid rgba(255,255,255,0.1)",display:"block",paddingTop:"6px",marginTop:"4px"}}>
                👑 Leadership: <span style={{color:houseObj.color,fontWeight:"800"}}>{monthly}</span><span style={{color:"rgba(255,255,255,0.3)"}}>/40</span>
              </span>
            </div>
            <div style={{height:"5px",background:"rgba(255,255,255,0.06)",borderRadius:"3px",marginTop:"8px",overflow:"hidden"}}>
              <div style={{width:`${(monthly/40)*100}%`,height:"100%",background:houseObj.color,borderRadius:"3px"}}/>
            </div>
          </div>

          {/* Per-Role Monthly Bars */}
          <div style={{...glass}}>
            <div style={{fontSize:"0.72rem",color:G,fontWeight:"700",marginBottom:"12px"}}>Role-wise Monthly Summary</div>
            {ROLES.map(r=>{
              const tot=roleMonthTotal(r.id);
              const approxMax=r.pts*4;
              const pct=Math.min(100,Math.round((tot/approxMax)*100));
              const holder=assignments[`${selHouse}_${r.id}`];
              return (
                <div key={r.id} style={{marginBottom:"10px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:"0.63rem",color:"rgba(255,255,255,0.65)",marginBottom:"3px"}}>
                    <span>{r.labelUr} {holder&&<span style={{color:"rgba(255,255,255,0.35)"}}>— {holder}</span>}</span>
                    <span style={{color:G,direction:"ltr"}}>{tot}</span>
                  </div>
                  <div style={{height:"4px",background:"rgba(255,255,255,0.07)",borderRadius:"2px",overflow:"hidden"}}>
                    <div style={{width:`${pct}%`,height:"100%",background:houseObj.color,borderRadius:"2px",transition:"width 0.4s"}}/>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── Right Panel ─── */}
        <div>
          {/* Inner Tabs */}
          <div style={{display:"flex",gap:"6px",marginBottom:"14px"}}>
            {[["assign","📋 Assign Roles"],["weekly","📅 Weekly Ranking"],["log","📜 Log"]].map(([id,lbl])=>(
              <button key={id} onClick={()=>setLrTab(id)}
                style={{padding:"9px 18px",borderRadius:"10px",fontFamily:"inherit",fontSize:"0.78rem",fontWeight:"700",cursor:"pointer",
                  border:`1px solid ${lrTab===id?G:"rgba(255,255,255,0.12)"}`,
                  background:lrTab===id?"rgba(183,134,11,0.18)":"transparent",
                  color:lrTab===id?G:W}}>
                {lbl}
              </button>
            ))}
          </div>

          {/* ── TAB: Assign Roles ── */}
          {lrTab==="assign"&&(
            <div style={glass}>
              <div style={{fontSize:"0.88rem",color:G,fontWeight:"700",marginBottom:"6px"}}>Role Holders — {houseObj.nameEn} House</div>
              <div style={{fontSize:"0.68rem",color:"rgba(255,255,255,0.4)",marginBottom:"16px"}}>Director assigns roles. Write name and save.</div>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead>
                  <tr>
                    {["Role","Role (En)","Max/Wk","Responsible Student",""].map((h,i)=>(
                      <th key={i} style={{...S.th,background:"rgba(255,255,255,0.04)",color:"rgba(255,255,255,0.55)",padding:"10px 14px"}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ROLES.map(r=>{
                    const key=`${selHouse}_${r.id}`;
                    const holder=assignments[key]||"";
                    return (
                      <tr key={r.id} style={{borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
                        <td style={{...S.td,color:W,padding:"10px 14px"}}>{r.labelUr}</td>
                        <td style={{...S.td,color:"rgba(255,255,255,0.45)",direction:"ltr",padding:"10px 14px",fontSize:"0.68rem"}}>{r.labelEn}</td>
                        <td style={{...S.td,color:G,fontWeight:"800",padding:"10px 14px",direction:"ltr",textAlign:"center"}}>{r.pts}</td>
                        <td style={{padding:"8px 14px"}}>
                          <input placeholder="Write student name" value={holder}
                            onChange={e=>setAssignments(prev=>({...prev,[key]:e.target.value}))}
                            style={{...S.inpSm,background:"rgba(255,255,255,0.06)",color:W,border:"1px solid rgba(255,255,255,0.14)",width:"180px"}}/>
                        </td>
                        <td style={{padding:"8px 14px"}}>
                          <button onClick={()=>saveAssignment(selHouse,r.id,assignments[key]||"")}
                            style={{padding:"6px 14px",borderRadius:"8px",border:"none",background:`${G}20`,color:G,fontSize:"0.7rem",fontWeight:"700",cursor:"pointer",fontFamily:"inherit"}}>
                            Saved
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* ── TAB: Weekly Ratings ── */}
          {lrTab==="weekly"&&(
            <div style={glass}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px",flexWrap:"wrap",gap:"10px"}}>
                <div>
                  <div style={{fontSize:"0.88rem",color:G,fontWeight:"700"}}>Weekly Performance — {houseObj.name}</div>
                  <div style={{fontSize:"0.67rem",color:"rgba(255,255,255,0.4)",marginTop:"3px"}}>House Master gives weekly points to every role holder</div>
                </div>
                <div style={{display:"flex",gap:"10px",alignItems:"center"}}>
                  <input type="week" value={weekLabel} onChange={e=>setWeekLabel(e.target.value)}
                    style={{padding:"7px 12px",borderRadius:"10px",border:`1px solid ${G}40`,background:"rgba(255,255,255,0.08)",color:W,fontSize:"0.75rem",outline:"none"}}/>
                  <button onClick={saveWeek} disabled={saving}
                    style={{...S.saveBtn,padding:"9px 20px",fontSize:"0.75rem",opacity:saving?0.6:1}}>
                    {saving?"Saving...":saved?"✅ Saved!":"✔ Save"}
                  </button>
                </div>
              </div>

              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead>
                  <tr>
                    {["Role","Responsible","Max","Earned Points","Rank","Notes"].map((h,i)=>(
                      <th key={i} style={{...S.th,background:"rgba(255,255,255,0.04)",color:"rgba(255,255,255,0.55)",padding:"10px 14px"}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ROLES.map(r=>{
                    const holder=assignments[`${selHouse}_${r.id}`]||"—";
                    const pts=wfPts(r.id);
                    const pct=Math.round((pts/r.pts)*100);
                    const rating=ratingOf(pct);
                    return (
                      <tr key={r.id} style={{borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
                        <td style={{...S.td,color:W,padding:"10px 14px"}}>
                          <div style={{fontWeight:"700"}}>{r.labelUr}</div>
                          <div style={{fontSize:"0.6rem",color:"rgba(255,255,255,0.35)"}}>{r.labelEn}</div>
                        </td>
                        <td style={{...S.td,color:"rgba(255,255,255,0.65)",padding:"10px 14px",fontSize:"0.72rem"}}>{holder}</td>
                        <td style={{...S.td,color:G,fontWeight:"800",padding:"10px 14px",direction:"ltr",textAlign:"center"}}>{r.pts}</td>
                        <td style={{padding:"8px 14px"}}>
                          <input type="number" min={0} max={r.pts} value={weekForm[r.id]?.pts??r.pts}
                            onChange={e=>{
                              const v=Math.min(r.pts,Math.max(0,parseInt(e.target.value)||0));
                              setWeekForm(prev=>({...prev,[r.id]:{...prev[r.id],pts:v}}));
                            }}
                            style={{...S.inpSm,width:"64px",textAlign:"center",background:"rgba(255,255,255,0.06)",color:W,border:"1px solid rgba(255,255,255,0.14)"}}/>
                        </td>
                        <td style={{padding:"10px 14px"}}>
                          <span style={badge(ratingColor(rating))}>{rating}</span>
                        </td>
                        <td style={{padding:"8px 14px"}}>
                          <input placeholder="Notes" value={weekForm[r.id]?.notes||""}
                            onChange={e=>setWeekForm(prev=>({...prev,[r.id]:{...prev[r.id],notes:e.target.value}}))}
                            style={{...S.inpSm,background:"rgba(255,255,255,0.06)",color:W,border:"1px solid rgba(255,255,255,0.14)",width:"130px"}}/>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Week total bar */}
              <div style={{marginTop:"14px",padding:"10px 16px",borderRadius:"10px",background:"rgba(255,255,255,0.04)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:"0.7rem",color:"rgba(255,255,255,0.45)"}}>Week Total</span>
                <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
                  <div style={{width:"160px",height:"6px",background:"rgba(255,255,255,0.08)",borderRadius:"3px",overflow:"hidden"}}>
                    <div style={{width:`${Math.min(100,Math.round((ROLES.reduce((s,r)=>s+wfPts(r.id),0)/WEEK_MAX)*100))}%`,height:"100%",background:houseObj.gradient,borderRadius:"3px"}}/>
                  </div>
                  <span style={{fontSize:"0.72rem",color:G,fontWeight:"800",direction:"ltr"}}>
                    {ROLES.reduce((s,r)=>s+wfPts(r.id),0)} / {WEEK_MAX}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB: Log ── */}
          {lrTab==="log"&&(
            <div style={glass}>
              <div style={{fontSize:"0.88rem",color:G,fontWeight:"700",marginBottom:"14px"}}>
                Weekly Log — {houseObj.nameEn} — {selMonth}
              </div>
              {monthEntries.length===0
                ? <div style={{textAlign:"center",padding:"50px 20px",color:"rgba(255,255,255,0.25)",fontSize:"0.85rem"}} className="ur">اس ماہ کوئی اندراج نہیں</div>
                : (
                  <table style={{width:"100%",borderCollapse:"collapse"}}>
                    <thead>
                      <tr>
                        {["Week","Role","Responsible","Earned","Max","Rank","Notes"].map((h,i)=>(
                          <th key={i} style={{...S.th,background:"rgba(255,255,255,0.04)",color:"rgba(255,255,255,0.55)",padding:"10px 14px"}}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[...monthEntries].sort((a,b)=>(a.week>b.week?-1:1)).map((e,i)=>{
                        const role=ROLES.find(r=>r.id===e.role_id)||{};
                        const pct=role.pts?Math.round((e.points_earned/role.pts)*100):0;
                        const rating=e.rating||ratingOf(pct);
                        return (
                          <tr key={i} style={{borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
                            <td style={{...S.td,color:"rgba(255,255,255,0.4)",direction:"ltr",padding:"9px 14px",fontSize:"0.68rem"}}>{e.week}</td>
                            <td style={{...S.td,color:W,padding:"9px 14px",fontSize:"0.72rem"}}>
                              <div>{role.labelUr||e.role_id}</div>
                              <div style={{fontSize:"0.58rem",color:"rgba(255,255,255,0.3)"}}>{role.labelEn||""}</div>
                            </td>
                            <td style={{...S.td,color:"rgba(255,255,255,0.65)",padding:"9px 14px",fontSize:"0.72rem"}}>{e.holder_name||"—"}</td>
                            <td style={{...S.td,color:G,fontWeight:"800",padding:"9px 14px",direction:"ltr",textAlign:"center"}}>{e.points_earned}</td>
                            <td style={{...S.td,color:"rgba(255,255,255,0.35)",padding:"9px 14px",direction:"ltr",textAlign:"center"}}>{role.pts||"—"}</td>
                            <td style={{padding:"9px 14px"}}><span style={badge(ratingColor(rating))}>{rating}</span></td>
                            <td style={{...S.td,color:"rgba(255,255,255,0.4)",padding:"9px 14px",fontSize:"0.68rem"}}>{e.notes||"—"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr style={{background:"rgba(183,134,11,0.1)"}}>
                        <td colSpan={3} style={{...S.td,color:G,fontWeight:"700",padding:"10px 14px"}}>Monthly Total (Max 40)</td>
                        <td style={{...S.td,color:G,fontWeight:"900",padding:"10px 14px",direction:"ltr",textAlign:"center",fontSize:"0.85rem"}}>{monthly}</td>
                        <td style={{...S.td,color:"rgba(255,255,255,0.35)",padding:"10px 14px",direction:"ltr",textAlign:"center"}}>{MAX_MONTH}</td>
                        <td style={{padding:"10px 14px"}}><span style={badge(ratingColor(monthRating))}>{monthRating}</span></td>
                        <td/>
                      </tr>
                    </tfoot>
                  </table>
                )
              }
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
