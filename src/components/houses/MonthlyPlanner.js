/* eslint-disable */
import { useState, useEffect } from "react";
import { getData } from "../../supabase";
import letterhead from "../../assets/letterhead.png";

const PRINT_STYLE = `
@media print {
  body * { visibility: hidden !important; }
  #mp-print-area, #mp-print-area * { visibility: visible !important; }
  #mp-print-area { position: fixed !important; top:0; left:0; width:100%; background:white; padding:0; margin:0; }
  .no-print { display: none !important; }
  @page { margin: 0; size: A4; }
}
`;

const MONTHS = [
  { no:1,  titleEn:"Launch & Orientation",       titleUr:"Launch & Orientation",          focusUr:"New year welcome, house assignments and goals setting", focusEn:"Welcome new year, assign houses, set annual goals" },
  { no:2,  titleEn:"Practice & Adjustment",       titleUr:"Practice & Adjustment",            focusUr:"Practical practice of HVS system and initial fixing weaknesses",   focusEn:"Practice HVS system and fix early weaknesses" },
  { no:3,  titleEn:"Regular Implementation",      titleUr:"Regular Implementation",             focusUr:"Regular HVS entry, parent sessions, Monthly Report",        focusEn:"Regular HVS logging, parent meeting, monthly report" },
  { no:4,  titleEn:"Strengthening & Mid-Term",    titleUr:"Strengthening & Mid-Term",      focusUr:"Mid-year exam preparation, Speech Competition",             focusEn:"Mid-term prep, speech competition, mid-year review" },
  { no:5,  titleEn:"Advanced Competitions",       titleUr:"Advanced Competitions",             focusUr:"Academic Competitions, Quiz, Debate, inter-house competition",           focusEn:"Academic competitions, quiz, debate, inter-house" },
  { no:6,  titleEn:"Talent Enhancement",          titleUr:"Talent Enhancement",         focusUr:"Discover hidden talents, talent show,art",       focusEn:"Discover hidden talents, talent show, art competitions" },
  { no:7,  titleEn:"Community Service",           titleUr:"Community Service",             focusUr:"Cleanliness Campaign, Tree planting, serving elders",                   focusEn:"Cleanliness drive, tree planting, serving elders" },
  { no:8,  titleEn:"Discipline & Academic",       titleUr:"Discipline & Academic",     focusUr:"Uniform campaign, academic week, district competitions preparation",       focusEn:"Uniform campaign, academic week, district prep" },
  { no:9,  titleEn:"Technology & Innovation",     titleUr:"Technology & Innovation",     focusUr:"Computer skills, digital project, innovative ideas",       focusEn:"Computer skills, digital projects, innovative ideas" },
  { no:10, titleEn:"Sports & Physical Fitness",   titleUr:"Sports & Physical Fitness", focusUr:"Inter-house sports, exercise campaign, health awareness",                   focusEn:"Inter-house sports, exercise campaign, health awareness" },
  { no:11, titleEn:"Reading & Literacy",          titleUr:"Reading & Literacy",       focusUr:"Reading challenge, book report, Library campaignpaign",                 focusEn:"Reading challenge, book reports, library campaign" },
  { no:12, titleEn:"Islamic Character Building",  titleUr:"Islamic Character Building",        focusUr:"Seerah program, Quran competition, Ethics Workshop",               focusEn:"Seerah program, Quran competition, akhlaq workshop" },
  { no:13, titleEn:"Annual Awards Ceremony",      titleUr:"Annual Award Event",     focusUr:"Annual event, awards ceremony, report Year Plan",  focusEn:"Annual ceremony, awards, report, next year planning" },
];

const DEFAULT_WEEKS = {
  1:  [{a:"Welcome Event",d:"Welcome students, start of new year",r:"Principal"},{a:"House assignments",d:"Assign students to four houses ",r:"House Master"},{a:"Rules and Goals",d:"House rules and annual goals",r:"House Master"},{a:"First HVS Entry",d:"Practical HVS system training",r:"Teacher"}],
  2:  [{a:"Practical practice",d:"Regular practice of HVS system",r:"House Master"},{a:"Identify weaknesses",d:"First month weaknesses",r:"House Master"},{a:"Reform Actions",d:"Addressing weaknesses",r:"Teacher"},{a:"Progress Review",d:"First two months review",r:"Principal"}],
  3:  [{a:"Regular HVS Entry",d:"Regularly every week",r:"House Master"},{a:"Students' supervision",d:"Performance supervision",r:"Teacher"},{a:"Parent Session",d:"Inform parents of progress",r:"House Master"},{a:"Monthly Report",d:"Monthly Performance Report",r:"Principal"}],
  4:  [{a:"Mid-Term Preparation",d:"Mid-year exam preparation",r:"Teacher"},{a:"Speech Competition",d:"Inter-house speech competition",r:"House Master"},{a:"HVS strengthening",d:"Improvement in weak areas",r:"House Master"},{a:"Mid-year Review",d:"First four months total review",r:"Principal"}],
  5:  [{a:"Academic Competitions",d:"Quiz, Debate, Subject writing",r:"Teacher"},{a:"Talent/skill exhibition",d:"Students' talent/skill exhibition",r:"House Master"},{a:"Inter-House Competition",d:"Competition among all four Houses",r:"Principal"},{a:"Winner Team Award",d:"Reward for winner team",r:"Principal"}],
  6:  [{a:"Talent search",d:"Discover hidden talents",r:"Teacher"},{a:"Talent show",d:"Talent show arrangement",r:"House Master"},{a:"Calligraphy & Art",d:"Calligraphy and art competitions",r:"Teacher"},{a:"Talent/Skilled Students Award",d:"Award for talented/skilled students",r:"Principal"}],
  7:  [{a:"Cleanliness Campaign",d:"School and surroundings cleanliness",r:"House Master"},{a:"Tree planting",d:"Environmental — tree Planting",r:"Students"},{a:"Service to elders",d:"Service to local elders",r:"House Master"},{a:"Community Report",d:"Report of service activities",r:"Principal"}],
  8:  [{a:"Discipline Campaign",d:"Uniform, punctuality, manners",r:"House Master"},{a:"Academic Week",d:"Special academic activities",r:"Teacher"},{a:"Student self-assessment",d:"Students evaluate their performance",r:"Students"},{a:"District Level Preparation",d:"Preparation for district competitions",r:"Teacher"}],
  9:  [{a:"Computer skills",d:"Basic computer skills training",r:"Teacher"},{a:"Digital Project",d:"Students' digital projects",r:"Students"},{a:"Technology Competition",d:"Technology-based competition",r:"Teacher"},{a:"innovative ideas",d:"Exhibition of innovative ideas",r:"House Master"}],
  10: [{a:"Sports day",d:"Inter-house Sports day",r:"PE Teacher"},{a:"Exercise campaign",d:"Daily exercise campaign",r:"House Master"},{a:"Health awareness",d:"Awareness on health and nutrition",r:"Teacher"},{a:"Sports Award",d:"Best Sportsman Award",r:"Principal"}],
  11: [{a:"Reading challenge",d:"Every student at least one book",r:"Teacher"},{a:"Book Report",d:"Report on book read",r:"Students"},{a:"Library Campaign",d:"Increase library usage",r:"House Master"},{a:"Best Reader Award",d:"Award for student who read the most books",r:"Principal"}],
  12: [{a:"Islamic Event",d:"Special program on Seerah of the Prophet",r:"House Master"},{a:"Quran Competition",d:"Tajweed & Hifz Competitionmpetition",r:"Quran Teacher"},{a:"Ethics Workshop",d:"Islamic Ethics & Manners Workshop",r:"Teacher"},{a:"Role/Character building report",d:"Annual Role/Character building report",r:"Principal"}],
  13: [{a:"Annual Event Preparation",d:"Annual event preparation",r:"All Teachers"},{a:"Awards Ceremony",d:"Annual awards ceremonyrrangement",r:"Principal"},{a:"Annual Report",d:"Full year total report",r:"House Master"},{a:"Next Year Plan",d:"Initial plan for next year",r:"Principal"}],
};

const STATUS_OPTS = ["pending","inprogress","done"];
const STATUS_LABEL = { pending:"زیر التواء",inprogress:"جاری",done:"مکمل" };
const STATUS_COLOR = { pending:"#fb923c",inprogress:"#60a5fa",done:"#4ade80" };

function blankWeeks(mo){
  return (DEFAULT_WEEKS[mo]||[{a:"",d:"",r:""},{a:"",d:"",r:""},{a:"",d:"",r:""},{a:"",d:"",r:""}]).map((w,i)=>({
    weekNo:i+1, activity:w.a, description:w.d, responsible:w.r,
    targetDate:"", status:"pending", remarks:""
  }));
}

function MonthlyPlanner({addData, houses=[]}){
  const G="#d4af37";const N="#0f172a";const N2="#1e293b";
  const glass={background:"rgba(255,255,255,0.07)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:"16px"};
  const inp={padding:"7px 10px",borderRadius:"8px",border:"1px solid rgba(212,175,55,0.2)",background:"rgba(255,255,255,0.05)",color:"#f1f5f9",fontSize:"0.72rem",fontFamily:"'Public Sans',sans-serif",outline:"none",width:"100%",boxSizing:"border-box",colorScheme:"dark"};

  const HOUSE_OPTS=[{id:"all",nameEn:"All Houses",emoji:"🏠"},...(houses.length?houses:[{id:"abuBakr",nameEn:"Abu Bakr",emoji:"🔵"},{id:"umar",nameEn:"Umar",emoji:"🟢"},{id:"uthman",nameEn:"Uthman",emoji:"🟡"},{id:"ali",nameEn:"Ali",emoji:"🔴"}])];
  const [selHouse,setSelHouse]=useState("all");
  const [selMo,setSelMo]=useState(1);
  const [planData,setPlanData]=useState({}); // {mo: weeks[]}
  const [saving,setSaving]=useState(false);
  const [saved,setSaved]=useState(false);

  useEffect(()=>{
    getData("monthly_plans").then(rows=>{
      if(!rows||!rows.length)return;
      const map={};
      // group by month, take latest
      rows.forEach(r=>{if(r.month&&r.weeks){if(!map[r.month])map[r.month]=r.weeks;}});
      setPlanData(map);
    }).catch(()=>{});
  },[]);

  const weeks=(mo)=>planData[mo]||blankWeeks(mo);
  const setWeek=(mo,wi,field,val)=>{
    setPlanData(prev=>{
      const wks=[...(prev[mo]||blankWeeks(mo))];
      wks[wi]={...wks[wi],[field]:val};
      return {...prev,[mo]:wks};
    });
  };

  const saveMonth=async(mo)=>{
    setSaving(true);
    await addData("monthly_plans",{month:mo,weeks:weeks(mo)});
    setSaving(false);setSaved(true);setTimeout(()=>setSaved(false),2500);
  };

  const doneCount=(mo)=>(planData[mo]||[]).filter(w=>w.status==="done").length;

  const doPrint=()=>{
    if(!document.getElementById("mp-print-style")){
      const s=document.createElement("style");s.id="mp-print-style";s.innerHTML=PRINT_STYLE;document.head.appendChild(s);
    }
    window.print();
  };

  const mo=MONTHS.find(m=>m.no===selMo)||MONTHS[0];
  const currentWeeks=weeks(selMo);
  const done=currentWeeks.filter(w=>w.status==="done").length;
  const inprog=currentWeeks.filter(w=>w.status==="inprogress").length;

  return (
    <div style={{minHeight:"100vh",background:`linear-gradient(160deg,${N} 0%,#0d1f3c 50%,#0a1628 100%)`,padding:"24px 20px",fontFamily:"'Public Sans',sans-serif",direction:"ltr"}}>

      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"24px",flexWrap:"wrap",gap:"12px"}}>
        <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
          <div style={{width:"44px",height:"44px",borderRadius:"12px",background:`linear-gradient(135deg,${G},#b8960a)`,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 4px 20px rgba(212,175,55,0.4)`}}>
            <span className="material-symbols-rounded" style={{fontSize:"24px",color:N}}>calendar_month</span>
          </div>
          <div>
            <h1 style={{margin:0,fontSize:"1.4rem",fontWeight:"800",color:"#f1f5f9"}}>13-Month Plan</h1>
            <p style={{margin:0,fontSize:"0.72rem",color:"rgba(212,175,55,0.7)"}}>13-Month Action Plan Tracker</p>
          </div>
        </div>
        <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
          {saved&&<div style={{padding:"9px 16px",borderRadius:"10px",background:"rgba(74,222,128,0.12)",border:"1px solid rgba(74,222,128,0.3)",color:"#4ade80",fontSize:"0.72rem",fontWeight:"700"}}>✓ Saved!</div>}
          <button onClick={doPrint} style={{display:"flex",alignItems:"center",gap:"6px",padding:"9px 18px",borderRadius:"10px",border:"1px solid rgba(74,222,128,0.4)",background:"rgba(74,222,128,0.08)",color:"#4ade80",fontSize:"0.72rem",cursor:"pointer",fontFamily:"inherit",fontWeight:"700"}}>
            <span className="material-symbols-rounded" style={{fontSize:"16px"}}>print</span>Print
          </button>
          <button onClick={()=>saveMonth(selMo)} disabled={saving} style={{display:"flex",alignItems:"center",gap:"6px",padding:"9px 18px",borderRadius:"10px",border:"none",background:`linear-gradient(135deg,${G},#b8960a)`,color:N,fontSize:"0.72rem",cursor:"pointer",fontFamily:"inherit",fontWeight:"700"}}>
            <span className="material-symbols-rounded" style={{fontSize:"16px"}}>save</span>{saving?"Saved...":"Save"}
          </button>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"200px 1fr",gap:"18px",alignItems:"start"}}>

        {/* ── Month Sidebar ── */}
        <div style={{...glass,padding:"10px",position:"sticky",top:"80px"}}>
          {/* House filter */}
          <div style={{marginBottom:"10px",padding:"6px 8px"}}>
            <div style={{fontSize:"0.6rem",color:"rgba(212,175,55,0.7)",fontWeight:"700",marginBottom:"5px",letterSpacing:"0.08em"}}>🏠 HOUSE</div>
            <select value={selHouse} onChange={e=>setSelHouse(e.target.value)} style={{...inp,fontSize:"0.68rem"}}>
              {HOUSE_OPTS.map(h=><option key={h.id} value={h.id} style={{background:N2}}>{h.emoji} {h.nameEn}</option>)}
            </select>
          </div>
          <div style={{fontSize:"0.62rem",color:"rgba(212,175,55,0.7)",fontWeight:"700",padding:"6px 8px",letterSpacing:"0.1em",textTransform:"uppercase"}}>MONTHS</div>
          {MONTHS.map(m=>{
            const dc=doneCount(m.no);
            const isSel=selMo===m.no;
            return (
              <button key={m.no} onClick={()=>setSelMo(m.no)} style={{width:"100%",textAlign:"left",padding:"9px 10px",borderRadius:"10px",border:"none",background:isSel?"rgba(212,175,55,0.15)":"transparent",cursor:"pointer",fontFamily:"inherit",marginBottom:"2px",borderRight:isSel?`3px solid ${G}`:"3px solid transparent",transition:"all 0.15s"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{background:isSel?"rgba(212,175,55,0.2)":"rgba(255,255,255,0.06)",color:isSel?G:"rgba(255,255,255,0.35)",borderRadius:"6px",padding:"1px 6px",fontSize:"0.58rem",fontWeight:"700",fontFamily:"'Public Sans',sans-serif"}}>{m.no}</span>
                  {dc>0&&<span style={{background:"rgba(74,222,128,0.15)",color:"#4ade80",borderRadius:"6px",padding:"1px 6px",fontSize:"0.55rem",fontWeight:"700"}}>{dc}/4</span>}
                </div>
                <div style={{fontSize:"0.68rem",fontWeight:isSel?"700":"500",color:isSel?G:"rgba(241,245,249,0.65)",marginTop:"4px",lineHeight:1.3}}>{m.titleUr}</div>
                <div style={{fontSize:"0.55rem",color:"rgba(255,255,255,0.25)",fontFamily:"'Public Sans',sans-serif",marginTop:"2px"}}>{m.titleEn}</div>
                {dc>0&&<div style={{marginTop:"5px",height:"2px",background:"rgba(255,255,255,0.06)",borderRadius:"1px",overflow:"hidden"}}>
                  <div style={{width:`${(dc/4)*100}%`,height:"100%",background:`linear-gradient(90deg,#4ade80,#22c55e)`,borderRadius:"1px"}}/>
                </div>}
              </button>
            );
          })}
        </div>

        {/* ── Main Content ── */}
        <div>
          {/* Month Header */}
          <div style={{...glass,padding:"20px",marginBottom:"18px",borderTop:`3px solid ${G}`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:"12px"}}>
              <div>
                <div style={{color:"rgba(255,255,255,0.3)",fontSize:"0.6rem",fontWeight:"700",letterSpacing:"0.15em",marginBottom:"4px"}}>MONTH {mo.no} OF 13</div>
                <div style={{color:G,fontSize:"1.1rem",fontWeight:"800",marginBottom:"3px"}}>{mo.titleUr}</div>
                <div style={{color:"rgba(255,255,255,0.45)",fontSize:"0.72rem",fontFamily:"'Public Sans',sans-serif"}}>{mo.titleEn}</div>
                <div style={{color:"rgba(241,245,249,0.6)",fontSize:"0.72rem",marginTop:"6px"}}>{mo.focusUr}</div>
              </div>
              {/* Progress */}
              <div style={{textAlign:"center",minWidth:"120px"}}>
                <div style={{fontSize:"0.58rem",color:"rgba(255,255,255,0.35)",marginBottom:"6px"}}>Weekly Progress</div>
                <div style={{display:"flex",gap:"4px",marginBottom:"6px"}}>
                  {[1,2,3,4].map(w=>{
                    const wk=currentWeeks[w-1];
                    const col=wk?.status==="done"?"#4ade80":wk?.status==="inprogress"?"#60a5fa":"rgba(255,255,255,0.1)";
                    return <div key={w} style={{flex:1,height:"6px",borderRadius:"3px",background:col,transition:"background 0.3s"}}/>;
                  })}
                </div>
                <div style={{fontSize:"0.72rem",fontWeight:"800",color:"#4ade80"}}>{done}/4 <span style={{fontWeight:"400",color:"rgba(255,255,255,0.35)"}}>Complete</span></div>
                {inprog>0&&<div style={{fontSize:"0.6rem",color:"#60a5fa"}}>{inprog} Ongoing</div>}
              </div>
            </div>
          </div>

          {/* Week Table */}
          <div style={{...glass,overflow:"hidden"}}>
            <div style={{padding:"14px 18px",borderBottom:"1px solid rgba(255,255,255,0.08)",display:"flex",alignItems:"center",gap:"8px"}}>
              <span className="material-symbols-rounded" style={{color:G,fontSize:"18px"}}>table_view</span>
              <span style={{color:"#f1f5f9",fontWeight:"700",fontSize:"0.88rem"}}>4-Week Plan</span>
            </div>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",minWidth:"780px"}}>
                <thead>
                  <tr style={{background:"rgba(255,255,255,0.04)"}}>
                    {["Week","Key Activity","Details","Responsible","Date","Status","Remarks"].map(h=>(
                      <th key={h} style={{padding:"10px 12px",textAlign:"left",fontSize:"0.62rem",fontWeight:"700",color:"rgba(212,175,55,0.8)",borderBottom:"1px solid rgba(255,255,255,0.08)",whiteSpace:"nowrap"}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {currentWeeks.map((wk,wi)=>(
                    <tr key={wi} style={{borderBottom:"1px solid rgba(255,255,255,0.05)",background:wi%2===0?"rgba(255,255,255,0.02)":"transparent"}}>

                      {/* Week No */}
                      <td style={{padding:"10px 12px",textAlign:"center",width:"52px"}}>
                        <div style={{width:"28px",height:"28px",borderRadius:"50%",background:`linear-gradient(135deg,${G},#b8960a)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.72rem",fontWeight:"800",color:N,margin:"0 auto"}}>{wk.weekNo}</div>
                      </td>

                      {/* Activity */}
                      <td style={{padding:"8px 10px",minWidth:"130px"}}>
                        <input style={inp} value={wk.activity} onChange={e=>setWeek(selMo,wi,"activity",e.target.value)} placeholder="Activity name..."/>
                      </td>

                      {/* Description */}
                      <td style={{padding:"8px 10px",minWidth:"160px"}}>
                        <input style={inp} value={wk.description} onChange={e=>setWeek(selMo,wi,"description",e.target.value)} placeholder="Short Details..."/>
                      </td>

                      {/* Responsible */}
                      <td style={{padding:"8px 10px",minWidth:"100px"}}>
                        <input style={inp} value={wk.responsible} onChange={e=>setWeek(selMo,wi,"responsible",e.target.value)} placeholder="Responsible..."/>
                      </td>

                      {/* Target Date */}
                      <td style={{padding:"8px 10px",minWidth:"120px"}}>
                        <input style={{...inp,direction:"ltr",colorScheme:"dark"}} type="date" value={wk.targetDate} onChange={e=>setWeek(selMo,wi,"targetDate",e.target.value)}/>
                      </td>

                      {/* Status */}
                      <td style={{padding:"8px 10px",minWidth:"100px"}}>
                        <select style={{...inp,color:STATUS_COLOR[wk.status]||"#f1f5f9"}} value={wk.status} onChange={e=>setWeek(selMo,wi,"status",e.target.value)}>
                          {STATUS_OPTS.map(s=><option key={s} value={s} style={{background:N2,color:STATUS_COLOR[s]}}>{STATUS_LABEL[s]}</option>)}
                        </select>
                      </td>

                      {/* Remarks */}
                      <td style={{padding:"8px 10px",minWidth:"130px"}}>
                        <input style={inp} value={wk.remarks} onChange={e=>setWeek(selMo,wi,"remarks",e.target.value)} placeholder="Remarks..."/>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Status summary bar */}
            <div style={{padding:"12px 18px",background:"rgba(255,255,255,0.02)",borderTop:"1px solid rgba(255,255,255,0.06)",display:"flex",gap:"16px",flexWrap:"wrap"}}>
              {STATUS_OPTS.map(s=>{
                const cnt=currentWeeks.filter(w=>w.status===s).length;
                return <div key={s} style={{display:"flex",alignItems:"center",gap:"6px"}}>
                  <div style={{width:"8px",height:"8px",borderRadius:"50%",background:STATUS_COLOR[s]}}/>
                  <span style={{fontSize:"0.65rem",color:"rgba(255,255,255,0.4)"}}>{STATUS_LABEL[s]}</span>
                  <span style={{fontSize:"0.72rem",fontWeight:"700",color:STATUS_COLOR[s],fontFamily:"'Public Sans',sans-serif"}}>{cnt}</span>
                </div>;
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Print Area ── */}
      <div id="mp-print-area" style={{position:"absolute",left:"-9999px",top:0,width:"210mm"}}>
        <div style={{background:"#fff",fontFamily:"'Segoe UI','Public Sans',sans-serif",direction:"ltr",color:"#0f172a"}}>
          <img src={letterhead} alt="" style={{width:"100%",display:"block"}}/>
          <div style={{padding:"14px 40px 8px",borderBottom:"2px solid #b7860b",textAlign:"center"}}>
            <div style={{fontSize:"1.1rem",fontWeight:"800",color:"#7a5807"}}>13-Month Plan — Month {mo.no}: {mo.titleEn}</div>
            <div style={{fontSize:"0.72rem",color:"#888",fontFamily:"'Public Sans',sans-serif",marginTop:"3px"}}>Month {mo.no} of 13 — {mo.titleEn}</div>
            <div style={{fontSize:"0.68rem",color:"#555",marginTop:"4px"}}>{mo.focusUr}</div>
          </div>
          <div style={{padding:"16px 40px"}}>
            {/* Progress summary */}
            <div style={{display:"flex",gap:"20px",marginBottom:"14px",padding:"10px 14px",background:"#fffdf8",borderRadius:"8px",border:"1px solid #f5e9c8"}}>
              {STATUS_OPTS.map(s=>{
                const cnt=currentWeeks.filter(w=>w.status===s).length;
                const col=s==="done"?"#16a34a":s==="inprogress"?"#1d4ed8":"#d97706";
                return <div key={s} style={{textAlign:"center"}}>
                  <div style={{fontWeight:"800",fontSize:"1.1rem",color:col,fontFamily:"'Public Sans',sans-serif"}}>{cnt}</div>
                  <div style={{fontSize:"0.6rem",color:"#666"}}>{STATUS_LABEL[s]}</div>
                </div>;
              })}
              <div style={{marginRight:"auto",textAlign:"left"}}>
                <div style={{fontSize:"0.68rem",color:"#555"}}>Progress: <strong style={{color:done===4?"#16a34a":"#d97706"}}>{done}/4 Complete</strong></div>
              </div>
            </div>
            {/* Table */}
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:"0.78rem"}}>
              <thead>
                <tr style={{background:"#f5e9c8"}}>
                  {["Week","Key Activity","Details","Responsible","Date","Status","Remarks"].map(h=>(
                    <th key={h} style={{padding:"7px 8px",textAlign:"left",fontWeight:"700",color:"#7a5807",border:"1px solid #f0ede8",fontSize:"0.68rem"}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentWeeks.map((wk,wi)=>{
                  const sCol=wk.status==="done"?"#16a34a":wk.status==="inprogress"?"#1d4ed8":"#d97706";
                  return (
                    <tr key={wi} style={{background:wi%2===0?"#fffdf8":"#fff",borderBottom:"1px solid #f5e9c8"}}>
                      <td style={{padding:"7px 8px",textAlign:"center",fontWeight:"800",color:"#7a5807",border:"1px solid #f0ede8"}}>{wk.weekNo}</td>
                      <td style={{padding:"7px 8px",fontWeight:"600",border:"1px solid #f0ede8"}}>{wk.activity||"—"}</td>
                      <td style={{padding:"7px 8px",color:"#555",fontSize:"0.68rem",border:"1px solid #f0ede8"}}>{wk.description||"—"}</td>
                      <td style={{padding:"7px 8px",border:"1px solid #f0ede8"}}>{wk.responsible||"—"}</td>
                      <td style={{padding:"7px 8px",direction:"ltr",fontFamily:"monospace",fontSize:"0.65rem",border:"1px solid #f0ede8"}}>{wk.targetDate||"—"}</td>
                      <td style={{padding:"7px 8px",fontWeight:"700",color:sCol,border:"1px solid #f0ede8",textAlign:"center"}}>{STATUS_LABEL[wk.status]}</td>
                      <td style={{padding:"7px 8px",color:"#555",fontSize:"0.65rem",border:"1px solid #f0ede8"}}>{wk.remarks||"—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {/* Footer */}
            <div style={{marginTop:"36px",display:"flex",justifyContent:"space-between",paddingTop:"10px",borderTop:"1px solid #f0ede8"}}>
              <div style={{textAlign:"center",minWidth:"160px"}}>
                <div style={{borderTop:"1.5px solid #0f172a",paddingTop:"8px",fontSize:"0.68rem",color:"#444",fontWeight:"600"}}>House Master Signature</div>
              </div>
              <div style={{textAlign:"center",fontSize:"0.6rem",color:"#aaa",fontFamily:"'Public Sans',sans-serif",alignSelf:"flex-end"}}>
                Printed on: {new Date().toLocaleDateString("en-PK",{year:"numeric",month:"long",day:"numeric"})}
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

export default MonthlyPlanner;
