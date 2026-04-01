/* eslint-disable */
import { useState, useEffect } from "react";
import useClasses from "../../hooks/useClasses";
import { getData, deleteData } from "../../supabase";
import letterhead from "../../assets/letterhead.png";
import { SUBJECTS, sLabel } from "../../constants";


function Results({students,addData,results:resultsProp=[]}){
  const { gradeOptions } = useClasses();
  const G="#d4af37";const N="#0f172a";const N2="#1e293b";
  const glass={background:"rgba(255,255,255,0.07)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:"16px"};
  const [results,setResults]=useState(resultsProp); if(JSON.stringify(results)!==JSON.stringify(resultsProp))setResults(resultsProp);
  const [show,setShow]=useState(false);
  const [filterGrade,setFilterGrade]=useState("all");
  const [q,setQ]=useState("");
  const [examList,setExamList]=useState([]);
  const [manualExam,setManualExam]=useState(false);
  const [f,setF]=useState({studentId:"",exam:"",subject:"",totalMarks:100,obtainedMarks:0,grade:"",date:new Date().toISOString().split("T")[0]});
  const [csvLoading,setCsvLoading]=useState(false);
  const [csvResult,setCsvResult]=useState(null);
  const [showCsvGuide,setShowCsvGuide]=useState(false);

  const calcGrade=(pct)=>pct>=90?"A+":pct>=80?"A":pct>=70?"B":pct>=60?"C":pct>=50?"D":"F";
  const handleResultsCSV=async(e)=>{
    const file=e.target.files[0]; if(!file)return;
    setCsvLoading(true); setCsvResult(null);
    const text=await file.text();
    const lines=text.split("\n").map(l=>l.trim()).filter(Boolean);
    const isHeader=lines[0]?.toLowerCase().includes("name")||lines[0]?.toLowerCase().includes("student")||lines[0]?.toLowerCase().includes("exam");
    const dataLines=isHeader?lines.slice(1):lines;
    let ok=0,skip=0,errs=[];
    for(const line of dataLines){
      const [nameOrCode,exam,subject,totalMarksStr,obtainedMarksStr,date]=line.split(",").map(s=>s?.trim());
      if(!nameOrCode||!exam){skip++;continue;}
      const st=students.find(s=>s.name?.toLowerCase().includes(nameOrCode.toLowerCase())||(s.studentCode||s.student_code)?.toLowerCase()===nameOrCode.toLowerCase());
      if(!st){errs.push(`نہیں ملا: ${nameOrCode}`);skip++;continue;}
      const total=parseFloat(totalMarksStr)||100;
      const obtained=parseFloat(obtainedMarksStr)||0;
      if(obtained>total){errs.push(`${st.name}: حاصل (${obtained}) > کل (${total})`);skip++;continue;}
      const pct=Math.round((obtained/total)*100);
      try{
        await addData("results",{
          studentId:st.id, exam, subject:subject||"عام",
          totalMarks:total, obtainedMarks:obtained,
          percentage:pct, grade:calcGrade(pct),
          date:date||new Date().toISOString().split("T")[0],
        });
        ok++;
      }catch(err){errs.push(`${st.name}: ${err.message}`);skip++;}
    }
    setCsvResult({ok,skip,errs});
    setCsvLoading(false); e.target.value="";
  };

  useEffect(()=>{
    const ET={monthly:"ماہانہ",midterm:"وسط سال",annual:"سالانہ",quiz:"کوئز",hifz:"حفظ"};
    Promise.all([getData("exam_schedule"),getData("assessments")]).then(([es,as])=>{
      const fromES=(es||[]).map(e=>{
        const type=ET[e.exam_type]||e.exam_type||"";
        const subj=e.subject||"";
        const gr=e.grade||"";
        const dt=e.exam_date||"";
        const name=e.title||"";
        const displayName=name||[type,subj].filter(Boolean).join(" — ")||subj;
        const label=displayName+(gr?` — ${gr}`:"")+(dt?` (${dt})`:"");
        return {label,title:displayName,grade:gr,date:dt,totalMarks:100,src:"schedule"};
      });
      const fromAS=(as||[]).map(e=>({
        label:e.title+(e.grade?` — ${e.grade}`:"")+(e.date?` (${e.date})`:""),
        title:e.title||"",grade:e.grade||"",date:e.date||"",
        totalMarks:e.totalMarks||e.total_marks||100,src:"assessment"
      }));
      setExamList([...fromAS,...fromES]);
    });
  },[]);

  const handleExamSelect=(val)=>{
    if(val==="__manual"){setManualExam(true);setF(prev=>({...prev,exam:""}));return;}
    setManualExam(false);
    if(!val){setF(prev=>({...prev,exam:""}));return;}
    const ex=examList.find(e=>e.label===val);
    if(ex) setF(prev=>({...prev,exam:ex.title||val,grade:ex.grade||prev.grade,date:ex.date||prev.date,totalMarks:ex.totalMarks||prev.totalMarks}));
    else setF(prev=>({...prev,exam:val}));
  };

  const add=async()=>{
    if(!f.studentId||!f.exam)return;
    if(Number(f.obtainedMarks)>Number(f.totalMarks)){alert(`حاصل نمبر (${f.obtainedMarks}) کل نمبر (${f.totalMarks}) سے زیادہ نہیں ہو سکتے`);return;}
    const pct=Math.round((Number(f.obtainedMarks)/Number(f.totalMarks))*100);
    await addData("results",{...f,totalMarks:Number(f.totalMarks),obtainedMarks:Number(f.obtainedMarks),percentage:pct});
    setShow(false);
    setF({studentId:"",exam:"",subject:"",totalMarks:100,obtainedMarks:0,grade:"",date:new Date().toISOString().split("T")[0]});
  };
  const delResult=async(id)=>{ if(!window.confirm("کیا آپ یہ نتیجہ حذف کرنا چاہتے ہیں؟"))return; await deleteData("results",id); };

  const getGrade=(pct)=>pct>=90?"A+":pct>=80?"A":pct>=70?"B":pct>=60?"C":pct>=50?"D":"F";
  const gc=(pct)=>pct>=80?"#4ade80":pct>=60?"#fb923c":"#f87171";
  const ordinal=(n)=>{ const s=["th","st","nd","rd"]; const v=n%100; return n+(s[(v-20)%10]||s[v]||s[0]); };
  const medal=(pos)=>pos===1?"🥇":pos===2?"🥈":pos===3?"🥉":"";

  const filtered=results.filter(r=>{
    const matchG=filterGrade==="all"||r.grade===filterGrade;
    const st=students.find(s=>s.id===(r.studentId||r.student_id));
    const matchQ=!q||st?.name?.toLowerCase().includes(q.toLowerCase())||r.subject?.toLowerCase().includes(q.toLowerCase())||r.exam?.toLowerCase().includes(q.toLowerCase());
    return matchG&&matchQ;
  });
  const grades=gradeOptions;
  const inp={width:"100%",padding:"10px 14px",borderRadius:"10px",border:"1px solid rgba(212,175,55,0.25)",background:"rgba(255,255,255,0.06)",color:"#f1f5f9",fontSize:"0.8rem",fontFamily:"'Public Sans',sans-serif",outline:"none",boxSizing:"border-box",direction:"ltr",colorScheme:"dark"};
  const lbl={fontSize:"0.7rem",color:"rgba(212,175,55,0.8)",marginBottom:"6px",display:"block",fontWeight:"600"};
  const prevPct=f.totalMarks>0?Math.round((Number(f.obtainedMarks)/Number(f.totalMarks))*100):0;

  // ── DENSE_RANK position per grade×exam group ──────────────────────
  const resultMeta=(()=>{
    const groups={};
    results.forEach(r=>{ const k=`${r.grade}|${r.exam}`; if(!groups[k])groups[k]=[]; groups[k].push(r); });
    const meta={};
    Object.values(groups).forEach(arr=>{
      const pctOf=r=>r.percentage||Math.round(((r.obtainedMarks||0)/(r.totalMarks||1))*100)||0;
      const sorted=[...arr].sort((a,b)=>pctOf(b)-pctOf(a));
      const avg=Math.round(sorted.reduce((s,r)=>s+pctOf(r),0)/sorted.length);
      let rank=1;
      sorted.forEach((r,idx)=>{
        if(idx>0 && pctOf(r)<pctOf(sorted[idx-1])) rank++;
        meta[r.id]={pos:rank,total:sorted.length,avg};
      });
    });
    return meta;
  })();

  // ── Group filtered results by grade+exam ──────────────────────────
  const groupedFiltered=(()=>{
    const order=[];const groups={};
    filtered.forEach(r=>{
      const k=`${r.grade}|${r.exam}`;
      if(!groups[k]){ groups[k]=[];order.push(k); }
      groups[k].push(r);
    });
    return order.map(k=>({key:k,grade:k.split("|")[0],exam:k.split("|")[1],rows:groups[k]}));
  })();

  const [printModal,setPrintModal]=useState(null); // holds group to print

  const buildPrintHTML=(group,design)=>{
    const sortedR=[...group.rows].sort((a,b)=>(resultMeta[a.id]?.pos||99)-(resultMeta[b.id]?.pos||99));
    const avgPct=resultMeta[sortedR[0]?.id]?.avg||0;
    const pass=sortedR.filter(r=>(r.percentage||0)>=50).length;
    const fail=sortedR.length-pass;
    const medal=(p)=>p===1?"🥇":p===2?"🥈":p===3?"🥉":"";
    const ordF=(n)=>{const s=["th","st","nd","rd"];const v=n%100;return n+(s[(v-20)%10]||s[v]||s[0]);};
    const colr=(p)=>p>=80?"#16a34a":p>=60?"#d97706":"#dc2626";
    const date=new Date().toLocaleDateString("en-PK");
    const lhUrl=`${window.location.origin}${letterhead}`;
    const bgStyle=`background-image:url('${lhUrl}');background-size:100% 100%;background-repeat:no-repeat;background-position:top left;`;

    const rowsData=sortedR.map((r,i)=>{
      const st=students.find(s=>s.id===(r.studentId||r.student_id));
      const pct=r.percentage||0; const pos=resultMeta[r.id]?.pos||"—";
      return {st,pct,pos,r,i};
    });

    if(design==="classic"){
      const rows=rowsData.map(({st,pct,pos,r,i})=>`
        <tr style="background:${i%2===0?"#f9f9f9":"#fff"};border-bottom:1px solid #e5e5e5">
          <td style="padding:8px 10px;text-align:center;font-weight:700">${medal(pos)}${ordF(pos)}</td>
          <td style="padding:8px 10px;font-weight:600">${st?.name||"—"}</td>
          <td style="padding:8px 10px;color:#555">${r.subject||"—"}</td>
          <td style="padding:8px 10px;font-family:monospace">${r.obtainedMarks}/${r.totalMarks}</td>
          <td style="padding:8px 10px;font-weight:700;color:${colr(pct)}">${pct}%</td>
          <td style="padding:8px 10px;font-weight:700;color:${colr(pct)}">${getGrade(pct)}</td>
        </tr>`).join("");
      return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
        body{font-family:Arial,sans-serif;color:#000;margin:0;font-size:13px;${bgStyle}}
        .content{padding:110px 28px 28px 28px}
        h2{text-align:center;margin:0 0 4px;font-size:18px}
        .sub{text-align:center;color:#555;font-size:12px;margin-bottom:12px}
        .stats{display:flex;justify-content:center;gap:24px;margin-bottom:14px;font-size:12px;border-top:1px solid #000;border-bottom:1px solid #000;padding:6px 0}
        table{width:100%;border-collapse:collapse}
        th{background:#000;color:#fff;padding:9px 10px;text-align:left;font-size:12px}
        .avg-row{background:#f0f0f0;font-weight:700;border-top:2px solid #000}
        @page{margin:0;size:A4} @media print{body{margin:0}}
      </style></head><body>
        <div class="content">
        <h2>نتائج رپورٹ — ${group.grade}</h2>
        <div class="sub">${group.exam} • ${date}</div>
        <div class="stats">
          <span>کل طلبہ: <b>${sortedR.length}</b></span>
          <span>اوسط: <b>${avgPct}% (${getGrade(avgPct)})</b></span>
          <span style="color:green">پاس: <b>${pass}</b></span>
          <span style="color:red">فیل: <b>${fail}</b></span>
        </div>
        <table><thead><tr><th>پوزیشن</th><th>طالب علم</th><th>مضمون</th><th>نمبر</th><th>فیصد</th><th>گریڈ</th></tr></thead>
        <tbody>${rows}<tr class="avg-row"><td colspan="4" style="padding:8px 10px">📊 کلاس اوسط — ${sortedR.length} طلبہ</td><td style="padding:8px 10px;color:${colr(avgPct)}">${avgPct}%</td><td style="padding:8px 10px;color:${colr(avgPct)}">${getGrade(avgPct)}</td></tr></tbody>
        </table>
        </div>
        <script>window.onload=function(){window.print();window.onafterprint=function(){window.close()}}<\/script>
      </body></html>`;
    }

    if(design==="formal"){
      const rows=rowsData.map(({st,pct,pos,r,i})=>`
        <tr style="background:${i%2===0?"#fdfbf4":"#fff"};border-bottom:1px solid #e8d9a0">
          <td style="padding:9px 14px;text-align:center;font-weight:800;color:#7a5807;font-size:15px">${medal(pos)}</td>
          <td style="padding:9px 14px;font-weight:800;font-size:13px">${st?.name||"—"}</td>
          <td style="padding:9px 14px;color:#666;font-size:12px">${r.subject||"—"}</td>
          <td style="padding:9px 14px;font-family:monospace;font-size:12px;color:#444">${r.obtainedMarks}/${r.totalMarks}</td>
          <td style="padding:9px 14px;font-weight:800;font-size:14px;color:${colr(pct)}">${pct}%</td>
          <td style="padding:9px 14px;text-align:center"><span style="background:${colr(pct)}22;color:${colr(pct)};border:1px solid ${colr(pct)}66;padding:3px 10px;border-radius:20px;font-weight:800;font-size:12px">${getGrade(pct)}</span></td>
        </tr>`).join("");
      return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
        body{font-family:'Segoe UI',sans-serif;color:#0f172a;margin:0;padding:0;${bgStyle}}
        .spacer{height:110px}
        .title-bar{text-align:center;padding:10px 28px 6px}
        .title-bar h1{margin:0;font-size:22px;color:#0f172a;letter-spacing:1px;font-weight:900}
        .title-bar .sub{font-size:12px;color:#555;margin-top:4px}
        .stats-bar{background:rgba(248,243,232,0.9);border-top:3px solid #d4af37;border-bottom:3px solid #d4af37;padding:10px 28px;display:flex;gap:28px;font-size:12px;margin:8px 0}
        .stat{text-align:center} .stat .val{font-size:18px;font-weight:800;color:#7a5807} .stat .lbl{color:#888;font-size:10px}
        .content{padding:0 28px 28px}
        table{width:100%;border-collapse:collapse;font-size:13px}
        th{background:#0f172a;color:#d4af37;padding:10px 14px;text-align:left;font-size:11px;letter-spacing:0.5px;font-weight:700}
        .avg-row{background:#fef9ec;border-top:2px solid #d4af37;font-weight:700}
        @page{margin:0;size:A4} @media print{body{margin:0}}
      </style></head><body>
        <div class="spacer"></div>
        <div class="title-bar">
          <h1>نتائج رپورٹ</h1>
          <div class="sub">${group.grade} &nbsp;•&nbsp; ${group.exam} &nbsp;•&nbsp; ${date}</div>
        </div>
        <div class="stats-bar">
          <div class="stat"><div class="val">${sortedR.length}</div><div class="lbl">کل طلبہ</div></div>
          <div class="stat"><div class="val" style="color:${colr(avgPct)}">${avgPct}%</div><div class="lbl">کلاس اوسط</div></div>
          <div class="stat"><div class="val" style="color:#16a34a">${pass}</div><div class="lbl">پاس</div></div>
          <div class="stat"><div class="val" style="color:#dc2626">${fail}</div><div class="lbl">فیل</div></div>
          <div class="stat"><div class="val">${getGrade(avgPct)}</div><div class="lbl">کلاس گریڈ</div></div>
        </div>
        <div class="content">
          <table><thead><tr><th style="width:60px">پوزیشن</th><th>طالب علم</th><th>مضمون</th><th>نمبر</th><th>فیصد</th><th style="width:70px;text-align:center">گریڈ</th></tr></thead>
          <tbody>${rows}<tr class="avg-row"><td colspan="4" style="padding:9px 14px;color:#7a5807">📊 کلاس اوسط — ${sortedR.length} طلبہ</td><td style="padding:9px 14px;color:${colr(avgPct)}">${avgPct}%</td><td style="padding:9px 14px;text-align:center;color:${colr(avgPct)}">${getGrade(avgPct)}</td></tr></tbody>
          </table>
        </div>
        <script>window.onload=function(){window.print();window.onafterprint=function(){window.close()}}<\/script>
      </body></html>`;
    }

    // design === "colorful"
    const rows=rowsData.map(({st,pct,pos,r,i})=>{
      const bg=pct>=80?"#f0fdf4":pct>=60?"#fffbeb":pct>=50?"#fff7ed":"#fef2f2";
      const border=pct>=80?"#bbf7d0":pct>=60?"#fde68a":pct>=50?"#fed7aa":"#fecaca";
      return `<tr style="background:${bg};border-bottom:2px solid ${border}">
        <td style="padding:10px 12px;text-align:center;font-size:18px">${medal(pos)||`<span style="font-weight:800;color:#94a3b8;font-size:13px">${ordF(pos)}</span>`}</td>
        <td style="padding:10px 12px;font-weight:800;font-size:14px;color:#0f172a">${st?.name||"—"}</td>
        <td style="padding:10px 12px;font-size:12px;color:#64748b">${r.subject||"—"}</td>
        <td style="padding:10px 12px;font-family:monospace;font-size:13px;color:#475569">${r.obtainedMarks}<span style="color:#94a3b8">/${r.totalMarks}</span></td>
        <td style="padding:10px 12px"><div style="background:${colr(pct)};color:#fff;border-radius:20px;padding:4px 12px;font-weight:800;font-size:14px;display:inline-block">${pct}%</div></td>
        <td style="padding:10px 12px;text-align:center;font-weight:900;font-size:20px;color:${colr(pct)}">${getGrade(pct)}</td>
      </tr>`;}).join("");
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
      body{font-family:'Segoe UI',sans-serif;margin:0;${bgStyle}}
      .spacer{height:110px}
      .card{background:rgba(255,255,255,0.95);margin:0 16px 16px;border-radius:0 0 16px 16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)}
      .top{background:linear-gradient(135deg,rgba(30,64,175,0.92),rgba(29,78,216,0.92));padding:14px 24px;color:#fff;text-align:center}
      .top h1{margin:0;font-size:20px;font-weight:900} .top .sub{font-size:12px;opacity:0.7;margin-top:4px}
      .stats{display:grid;grid-template-columns:repeat(4,1fr);gap:0;border-bottom:1px solid #e2e8f0;background:#fff}
      .s{text-align:center;padding:12px;border-right:1px solid #e2e8f0}
      .s .v{font-size:22px;font-weight:900} .s .l{font-size:10px;color:#94a3b8;margin-top:2px;text-transform:uppercase}
      table{width:100%;border-collapse:collapse;background:#fff}
      th{padding:10px 12px;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:0.8px;color:#94a3b8;background:#f8fafc;border-bottom:2px solid #e2e8f0;font-weight:700}
      .avg{background:#f1f5f9;border-top:2px solid #e2e8f0;font-weight:700;font-size:13px}
      @page{margin:0;size:A4} @media print{body{margin:0}.card{margin:0;border-radius:0;box-shadow:none}}
    </style></head><body>
      <div class="spacer"></div>
      <div class="card">
        <div class="top"><h1>📊 نتائج رپورٹ</h1><div class="sub">${group.grade} &nbsp;|&nbsp; ${group.exam} &nbsp;|&nbsp; ${date}</div></div>
        <div class="stats">
          <div class="s"><div class="v">${sortedR.length}</div><div class="l">Total</div></div>
          <div class="s"><div class="v" style="color:${colr(avgPct)}">${avgPct}%</div><div class="l">Average</div></div>
          <div class="s"><div class="v" style="color:#16a34a">${pass}</div><div class="l">Pass ✓</div></div>
          <div class="s"><div class="v" style="color:#dc2626">${fail}</div><div class="l">Fail ✗</div></div>
        </div>
        <table><thead><tr><th>#</th><th>Student</th><th>Subject</th><th>Marks</th><th>Score</th><th>Grade</th></tr></thead>
        <tbody>${rows}<tr class="avg"><td colspan="4" style="padding:10px 12px;color:#475569">📊 Class Average — ${sortedR.length} students</td><td style="padding:10px 12px"><div style="background:${colr(avgPct)};color:#fff;border-radius:20px;padding:4px 12px;font-weight:800;font-size:14px;display:inline-block">${avgPct}%</div></td><td style="padding:10px 12px;font-weight:900;color:${colr(avgPct)};font-size:18px">${getGrade(avgPct)}</td></tr></tbody>
        </table>
      </div>
      <script>window.onload=function(){window.print();window.onafterprint=function(){window.close()}}<\/script>
    </body></html>`;
  };

  const executePrint=(design)=>{
    if(!printModal)return;
    const html=buildPrintHTML(printModal,design);
    const w=window.open("","_blank","width=850,height=650");
    if(w){w.document.write(html);w.document.close();}
    setPrintModal(null);
  };

  const doPrint=(group)=>setPrintModal(group);

  return (
    <div style={{minHeight:"100vh",background:`linear-gradient(160deg,${N} 0%,#0d1f3c 50%,#0a1628 100%)`,padding:"24px 20px",fontFamily:"'Public Sans',sans-serif",direction:"ltr"}}>

      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"28px",flexWrap:"wrap",gap:"12px"}}>
        <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
          <div style={{width:"44px",height:"44px",borderRadius:"12px",background:`linear-gradient(135deg,${G},#b8960a)`,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 4px 20px rgba(212,175,55,0.4)`}}>
            <span className="material-symbols-rounded" style={{fontSize:"24px",color:N}}>bar_chart</span>
          </div>
          <div>
            <h1 style={{margin:0,fontSize:"1.5rem",fontWeight:"800",color:"#f1f5f9"}}>Results</h1>
            <p style={{margin:0,fontSize:"0.75rem",color:"rgba(212,175,55,0.7)",fontWeight:"500"}}>Academic Results • {results.length} entries</p>
          </div>
        </div>
        <div style={{display:"flex",gap:"8px",flexWrap:"wrap",alignItems:"center"}}>
          <button onClick={()=>setShowCsvGuide(!showCsvGuide)} style={{background:"rgba(99,202,183,0.1)",color:"#63cab7",border:"1px solid rgba(99,202,183,0.3)",borderRadius:"10px",padding:"9px 14px",fontSize:"0.75rem",fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>📋 CSV Format</button>
          <label style={{display:"inline-flex",alignItems:"center",gap:"6px",background:"rgba(99,202,183,0.12)",color:"#63cab7",border:"1px solid rgba(99,202,183,0.4)",borderRadius:"10px",padding:"9px 16px",fontSize:"0.82rem",fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
            {csvLoading?"⏳ upload...":"📂 CSV Upload"}
            <input type="file" accept=".csv,.txt" style={{display:"none"}} onChange={handleResultsCSV} disabled={csvLoading}/>
          </label>
          <button onClick={()=>setShow(!show)} style={{display:"flex",alignItems:"center",gap:"8px",padding:"11px 22px",borderRadius:"12px",border:`1px solid ${G}`,background:show?"rgba(212,175,55,0.15)":"transparent",color:G,fontWeight:"700",fontSize:"0.85rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif"}}>
            <span className="material-symbols-rounded" style={{fontSize:"20px"}}>{show?"close":"add_circle"}</span>{show?"Cancel":"New Result"}
          </button>
        </div>
      </div>

      {showCsvGuide&&<div style={{background:"rgba(99,202,183,0.06)",border:"1px solid rgba(99,202,183,0.25)",borderRadius:"12px",padding:"14px 18px",marginBottom:"16px",direction:"ltr"}}>
        <div style={{color:"#63cab7",fontWeight:700,fontSize:"13px",marginBottom:"8px"}}>📄 Results CSV Format:</div>
        <code style={{display:"block",background:"rgba(0,0,0,0.4)",padding:"10px",borderRadius:"8px",color:"#a3e6dc",fontFamily:"monospace",fontSize:"12px",lineHeight:"2",overflowX:"auto"}}>
          studentName,exam,subject,totalMarks,obtainedMarks,date<br/>
          Ahmad Ali,Mid Term 2024,Mathematics,100,85,2024-04-15<br/>
          Bilal Khan,Mid Term 2024,Mathematics,100,72,2024-04-15<br/>
          Sara Noor,Mid Term 2024,English,100,90,2024-04-15
        </code>
        <div style={{color:"#64748b",fontSize:"11px",marginTop:"8px"}}>• grade خودکار A+/A/B/C/D/F بنے گا &nbsp;•&nbsp; date optional (آج کی تاریخ لگے گی) &nbsp;•&nbsp; header row optional</div>
      </div>}
      {csvResult&&<div style={{background:csvResult.skip===0?"rgba(74,222,128,0.08)":"rgba(251,146,60,0.08)",border:`1px solid ${csvResult.skip===0?"rgba(74,222,128,0.3)":"rgba(251,146,60,0.3)"}`,borderRadius:"10px",padding:"12px 16px",marginBottom:"16px",display:"flex",alignItems:"center",gap:"12px",flexWrap:"wrap"}}>
        <span style={{color:"#4ade80",fontWeight:700}}>✅ {csvResult.ok} نتائج شامل ہوگئے</span>
        {csvResult.skip>0&&<span style={{color:"#fb923c",fontWeight:700}}>⚠️ {csvResult.skip} ناکام</span>}
        {csvResult.errs.length>0&&<span style={{color:"#fca5a5",fontSize:"12px"}}>{csvResult.errs.slice(0,3).join(" • ")}</span>}
        <button onClick={()=>setCsvResult(null)} style={{background:"none",border:"none",color:"#64748b",cursor:"pointer",marginLeft:"auto"}}>✕</button>
      </div>}

      {/* Add Form */}
      {show&&(
        <div style={{...glass,padding:"24px",marginBottom:"24px",borderColor:"rgba(212,175,55,0.3)"}}>
          <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"20px"}}>
            <span className="material-symbols-rounded" style={{color:G,fontSize:"22px"}}>add_circle</span>
            <span style={{color:G,fontWeight:"700",fontSize:"1rem"}}>New Result Entry</span>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px",marginBottom:"16px"}}>
            <div><label style={lbl}>طالب علم *</label><select style={inp} value={f.studentId} onChange={e=>setF({...f,studentId:e.target.value})}><option value="" style={{background:N2}}>-- منتخب کریں --</option>{students.map(s=><option key={s.id} value={s.id} style={{background:N2}}>{sLabel(s)}</option>)}</select></div>
            <div>
              <label style={lbl}>امتحان {examList.length>0&&<span style={{color:"rgba(255,255,255,0.3)",fontWeight:400}}>({examList.length} دستیاب)</span>}</label>
              {examList.length>0&&!manualExam&&(
                <select style={inp} value={examList.find(e=>e.title===f.exam)?.label||""} onChange={e=>handleExamSelect(e.target.value)}>
                  <option value="" style={{background:N2}}>-- امتحان منتخب کریں --</option>
                  {examList.map((e,i)=><option key={i} value={e.label} style={{background:N2}}>{e.label}</option>)}
                  <option value="__manual" style={{background:N2,color:"rgba(212,175,55,0.7)"}}>✏️ خود لکھیں...</option>
                </select>
              )}
              {(manualExam||examList.length===0)&&(
                <div style={{display:"flex",gap:"6px"}}>
                  <input style={{...inp,flex:1}} value={f.exam} onChange={e=>setF({...f,exam:e.target.value})} placeholder="امتحان کا نام لکھیں..."/>
                  {manualExam&&<button onClick={()=>{setManualExam(false);setF(prev=>({...prev,exam:""}));}} style={{padding:"0 10px",borderRadius:"10px",border:"1px solid rgba(255,255,255,0.15)",background:"transparent",color:"rgba(241,245,249,0.5)",cursor:"pointer",fontSize:"0.72rem",fontFamily:"inherit",whiteSpace:"nowrap"}}>← List</button>}
                </div>
              )}
            </div>
            <div><label style={lbl}>مضمون</label><select style={inp} value={f.subject} onChange={e=>setF({...f,subject:e.target.value})}><option value="" style={{background:N2}}>-- منتخب کریں --</option>{SUBJECTS.map(s=><option key={s} value={s} style={{background:N2}}>{s}</option>)}</select></div>
            <div><label style={lbl}>جماعت</label><select style={inp} value={f.grade} onChange={e=>setF({...f,grade:e.target.value})}>{grades.map(g=><option key={g} style={{background:N2}}>{g}</option>)}</select></div>
            <div><label style={lbl}>کل نمبر</label><input style={{...inp,direction:"ltr"}} type="number" value={f.totalMarks} onChange={e=>setF({...f,totalMarks:e.target.value})}/></div>
            <div><label style={lbl}>حاصل نمبر</label><input style={{...inp,direction:"ltr"}} type="number" value={f.obtainedMarks} onChange={e=>setF({...f,obtainedMarks:e.target.value})}/></div>
            <div><label style={lbl}>تاریخ</label><input style={{...inp,direction:"ltr"}} type="date" value={f.date} onChange={e=>setF({...f,date:e.target.value})}/></div>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:`${gc(prevPct)}15`,borderRadius:"12px",padding:"12px",border:`1px solid ${gc(prevPct)}30`}}>
              <div style={{fontSize:"0.62rem",color:"rgba(241,245,249,0.5)",marginBottom:"4px"}}>فیصد</div>
              <div style={{fontSize:"1.8rem",fontWeight:"900",color:gc(prevPct)}}>{prevPct}%</div>
              <div style={{fontSize:"0.8rem",fontWeight:"700",color:gc(prevPct)}}>{getGrade(prevPct)}</div>
            </div>
          </div>
          <div style={{display:"flex",gap:"10px",justifyContent:"flex-end"}}>
            <button onClick={()=>setShow(false)} style={{padding:"10px 20px",borderRadius:"10px",border:"1px solid rgba(255,255,255,0.15)",background:"transparent",color:"rgba(241,245,249,0.6)",fontWeight:"600",fontSize:"0.82rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif"}}>Cancel</button>
            <button onClick={add} style={{display:"flex",alignItems:"center",gap:"8px",padding:"10px 24px",borderRadius:"10px",border:"none",background:`linear-gradient(135deg,${G},#b8960a)`,color:N,fontWeight:"700",fontSize:"0.82rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif"}}>
              <span className="material-symbols-rounded" style={{fontSize:"18px"}}>save</span>Save
            </button>
          </div>
        </div>
      )}

      {/* Search bar */}
      <div style={{marginBottom:"16px"}}>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="🔍 طالب علم، مضمون، یا امتحان تلاش کریں..." style={{width:"100%",maxWidth:"400px",padding:"10px 14px",borderRadius:"10px",border:"1px solid rgba(212,175,55,0.25)",background:"rgba(255,255,255,0.06)",color:"#f1f5f9",fontSize:"0.8rem",fontFamily:"'Public Sans',sans-serif",outline:"none",boxSizing:"border-box",colorScheme:"dark"}}/>
      </div>

      {/* Grade filter tabs */}
      <div style={{display:"flex",gap:"6px",marginBottom:"20px",flexWrap:"wrap"}}>
        {[["all","All"],...grades.map(g=>[g,g])].map(([v,l])=>(
          <button key={v} onClick={()=>setFilterGrade(v)} style={{padding:"9px 16px",borderRadius:"9px",border:`1px solid ${filterGrade===v?G:"rgba(255,255,255,0.1)"}`,background:filterGrade===v?"rgba(212,175,55,0.15)":"transparent",color:filterGrade===v?G:"rgba(241,245,249,0.5)",fontWeight:filterGrade===v?"700":"500",fontSize:"0.78rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif"}}>{l}</button>
        ))}
      </div>

      {/* ── Grouped Results Tables ── */}
      {groupedFiltered.length===0&&(
        <div style={{...glass,padding:"60px",textAlign:"center",color:"rgba(241,245,249,0.3)"}}>
          <span className="material-symbols-rounded" style={{fontSize:"40px",display:"block",marginBottom:"10px",color:"rgba(212,175,55,0.2)"}}>bar_chart</span>
          <span className="ur">کوئی اندراج نہیں</span>
        </div>
      )}
      {groupedFiltered.map(group=>{
        const sortedRows=[...group.rows].sort((a,b)=>(resultMeta[a.id]?.pos||99)-(resultMeta[b.id]?.pos||99));
        const groupAvg=resultMeta[sortedRows[0]?.id]?.avg||0;
        return (
          <div key={group.key} style={{...glass,overflow:"hidden",marginBottom:"20px"}}>
            {/* Group header bar */}
            <div style={{padding:"12px 20px",background:"rgba(212,175,55,0.08)",borderBottom:"1px solid rgba(255,255,255,0.08)",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"8px"}}>
              <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
                <span className="material-symbols-rounded" style={{color:G,fontSize:"18px"}}>school</span>
                <span style={{color:G,fontWeight:"800",fontSize:"0.9rem"}}>{group.grade}</span>
                <span style={{color:"rgba(255,255,255,0.3)"}}>•</span>
                <span style={{color:"rgba(241,245,249,0.8)",fontSize:"0.85rem"}}>{group.exam}</span>
                <span style={{background:"rgba(255,255,255,0.06)",borderRadius:"20px",padding:"2px 10px",color:"rgba(255,255,255,0.4)",fontSize:"0.65rem"}}>{group.rows.length} طلبہ</span>
              </div>
              <div style={{display:"flex",gap:"12px",alignItems:"center",flexWrap:"wrap"}}>
                {(()=>{const pass=group.rows.filter(r=>(r.percentage||0)>=50).length;const fail=group.rows.length-pass;return(<>
                  <div style={{display:"flex",gap:"6px"}}>
                    <span style={{padding:"3px 9px",borderRadius:"20px",fontSize:"0.62rem",fontWeight:"700",background:"rgba(74,222,128,0.12)",color:"#4ade80",border:"1px solid rgba(74,222,128,0.25)"}}>✓ {pass} پاس</span>
                    {fail>0&&<span style={{padding:"3px 9px",borderRadius:"20px",fontSize:"0.62rem",fontWeight:"700",background:"rgba(248,113,113,0.12)",color:"#f87171",border:"1px solid rgba(248,113,113,0.25)"}}>✗ {fail} فیل</span>}
                  </div>
                </>);})()}
                <div style={{textAlign:"center"}}>
                  <div style={{fontSize:"0.58rem",color:"rgba(255,255,255,0.35)",marginBottom:"1px"}}>کلاس اوسط</div>
                  <div style={{fontWeight:"800",color:gc(groupAvg),fontSize:"0.88rem",fontFamily:"'Public Sans',sans-serif"}}>{groupAvg}% <span style={{fontSize:"0.7rem",fontWeight:"600"}}>{getGrade(groupAvg)}</span></div>
                </div>
                <button onClick={()=>doPrint(group)} style={{padding:"6px 14px",borderRadius:"8px",border:"1px solid rgba(212,175,55,0.3)",background:"rgba(212,175,55,0.1)",color:G,fontSize:"0.68rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif",fontWeight:"600",display:"flex",alignItems:"center",gap:"4px"}}>
                  <span className="material-symbols-rounded" style={{fontSize:"14px"}}>print</span>Print
                </button>
              </div>
            </div>

            {/* Table */}
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead><tr style={{background:"rgba(255,255,255,0.04)"}}>
                  {["پوزیشن","نام","مضمون","نمبر","فیصد","گریڈ",""].map(h=>(
                    <th key={h} style={{padding:"10px 16px",textAlign:"left",fontSize:"0.65rem",fontWeight:"700",color:"rgba(212,175,55,0.8)",borderBottom:"1px solid rgba(255,255,255,0.08)"}}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {sortedRows.map((r,i)=>{
                    const st=students.find(s=>s.id===(r.studentId||r.student_id));
                    const pct=r.percentage||0;
                    const pos=resultMeta[r.id]?.pos||"—";
                    const isTop=pos<=3;
                    return (
                      <tr key={r.id} style={{borderBottom:"1px solid rgba(255,255,255,0.05)",background:isTop?"rgba(212,175,55,0.04)":i%2===0?"rgba(255,255,255,0.02)":"transparent"}}>
                        <td style={{padding:"10px 16px",textAlign:"center",whiteSpace:"nowrap"}}>
                          <span style={{fontSize:"1rem",marginLeft:"4px"}}>{medal(pos)}</span>
                          <span style={{fontWeight:"800",fontFamily:"'Public Sans',sans-serif",fontSize:"0.82rem",color:isTop?G:"rgba(241,245,249,0.5)"}}>{ordinal(pos)}</span>
                        </td>
                        <td style={{padding:"10px 16px",fontWeight:"700",color:"#f1f5f9",fontSize:"0.82rem"}}>{st?.name||"—"}</td>
                        <td style={{padding:"10px 16px",color:"rgba(241,245,249,0.6)",fontSize:"0.75rem"}}>{r.subject}</td>
                        <td style={{padding:"10px 16px",color:"rgba(212,175,55,0.8)",fontSize:"0.78rem",direction:"ltr",fontFamily:"'Courier New',monospace"}}>{r.obtainedMarks}/{r.totalMarks}</td>
                        <td style={{padding:"10px 16px",fontWeight:"800",color:gc(pct),fontSize:"0.85rem"}}>{pct}%</td>
                        <td style={{padding:"10px 16px"}}>
                          <span style={{padding:"3px 10px",borderRadius:"20px",fontSize:"0.65rem",fontWeight:"800",background:`${gc(pct)}20`,color:gc(pct),border:`1px solid ${gc(pct)}40`}}>{getGrade(pct)}</span>
                        </td>
                        <td style={{padding:"10px 8px",textAlign:"center"}}>
                          <button onClick={()=>delResult(r.id)} title="حذف" style={{padding:"4px 8px",borderRadius:"6px",border:"1px solid rgba(248,113,113,0.3)",background:"rgba(248,113,113,0.08)",color:"#f87171",cursor:"pointer",fontSize:"0.65rem",fontFamily:"inherit",display:"flex",alignItems:"center",gap:"3px"}}>
                            <span className="material-symbols-rounded" style={{fontSize:"13px"}}>delete</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {/* ── Class Average Summary Row ── */}
                  <tr style={{background:"rgba(212,175,55,0.06)",borderTop:"2px solid rgba(212,175,55,0.15)"}}>
                    <td colSpan={5} style={{padding:"10px 16px",fontWeight:"700",color:"rgba(212,175,55,0.7)",fontSize:"0.72rem"}}>
                      📊 کلاس اوسط — {group.rows.length} طلبہ
                    </td>
                    <td style={{padding:"10px 16px",fontWeight:"800",color:gc(groupAvg),fontSize:"0.88rem"}}>{groupAvg}%</td>
                    <td style={{padding:"10px 16px"}}>
                      <span style={{padding:"3px 10px",borderRadius:"20px",fontSize:"0.65rem",fontWeight:"800",background:`${gc(groupAvg)}20`,color:gc(groupAvg),border:`1px solid ${gc(groupAvg)}40`}}>{getGrade(groupAvg)}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );
      })}


      {/* ── Print Design Picker Modal ── */}
      {printModal&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",padding:"20px"}} onClick={()=>setPrintModal(null)}>
          <div style={{background:"#0f172a",border:"1px solid rgba(212,175,55,0.3)",borderRadius:"20px",padding:"28px",maxWidth:"680px",width:"100%",boxShadow:"0 24px 80px rgba(0,0,0,0.6)"}} onClick={e=>e.stopPropagation()}>
            {/* Modal Header */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"20px"}}>
              <div>
                <h3 style={{margin:0,color:"#f1f5f9",fontSize:"1.1rem",fontWeight:"800",fontFamily:"'Public Sans',sans-serif"}}>پرنٹ ڈیزائن منتخب کریں</h3>
                <p style={{margin:"4px 0 0",fontSize:"0.72rem",color:"rgba(212,175,55,0.6)",fontFamily:"'Public Sans',sans-serif"}}>{printModal.grade} • {printModal.exam} • {printModal.rows.length} طلبہ</p>
              </div>
              <button onClick={()=>setPrintModal(null)} style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:"10px",width:"36px",height:"36px",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"rgba(241,245,249,0.6)"}}>
                <span className="material-symbols-rounded" style={{fontSize:"20px"}}>close</span>
              </button>
            </div>
            {/* Design Cards */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"14px"}}>
              {/* Classic */}
              <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"14px",overflow:"hidden",cursor:"pointer",transition:"border-color 0.2s"}} onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(212,175,55,0.5)"} onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(255,255,255,0.1)"}>
                {/* Preview thumbnail */}
                <div style={{background:"#fff",height:"100px",padding:"10px",display:"flex",flexDirection:"column",gap:"4px",overflow:"hidden"}}>
                  <div style={{background:"#000",height:"14px",borderRadius:"2px",width:"100%"}}/>
                  <div style={{display:"flex",flexDirection:"column",gap:"3px",marginTop:"2px"}}>
                    {[80,60,45].map((w,i)=><div key={i} style={{display:"flex",gap:"4px",alignItems:"center"}}>
                      <div style={{background:i%2===0?"#f9f9f9":"#fff",border:"1px solid #eee",height:"10px",flex:1,borderRadius:"1px"}}/>
                      <div style={{background:w>=80?"#16a34a":w>=60?"#d97706":"#dc2626",width:"22px",height:"10px",borderRadius:"2px",flexShrink:0}}/>
                    </div>)}
                  </div>
                </div>
                <div style={{padding:"12px 14px"}}>
                  <div style={{color:"#f1f5f9",fontWeight:"700",fontSize:"0.78rem",fontFamily:"'Public Sans',sans-serif",marginBottom:"2px"}}>Classic</div>
                  <div style={{color:"rgba(255,255,255,0.4)",fontSize:"0.62rem",fontFamily:"'Public Sans',sans-serif",marginBottom:"12px"}}>سادہ سیاہ و سفید</div>
                  <button onClick={()=>executePrint("classic")} style={{width:"100%",padding:"8px",borderRadius:"8px",border:"none",background:"rgba(255,255,255,0.1)",color:"#f1f5f9",fontSize:"0.72rem",fontWeight:"700",cursor:"pointer",fontFamily:"'Public Sans',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:"5px"}}>
                    <span className="material-symbols-rounded" style={{fontSize:"15px"}}>print</span>Print
                  </button>
                </div>
              </div>
              {/* Formal */}
              <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(212,175,55,0.25)",borderRadius:"14px",overflow:"hidden",cursor:"pointer",transition:"border-color 0.2s"}} onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(212,175,55,0.6)"} onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(212,175,55,0.25)"}>
                <div style={{height:"100px",overflow:"hidden",display:"flex",flexDirection:"column"}}>
                  <div style={{background:"linear-gradient(135deg,#0f172a,#1e3a5f)",padding:"8px 10px",flexShrink:0}}>
                    <div style={{color:"#d4af37",fontWeight:"800",fontSize:"9px",fontFamily:"sans-serif",textAlign:"center"}}>امین اسلامک اسکول</div>
                    <div style={{color:"rgba(255,255,255,0.5)",fontSize:"7px",textAlign:"center",marginTop:"2px"}}>نتائج رپورٹ</div>
                  </div>
                  <div style={{background:"#f8f3e8",borderBottom:"2px solid #d4af37",padding:"4px 8px",display:"flex",gap:"8px",flexShrink:0}}>
                    {["طلبہ","اوسط","پاس","فیل"].map(l=><div key={l} style={{textAlign:"center",flex:1}}><div style={{fontSize:"10px",fontWeight:"800",color:"#7a5807"}}>—</div><div style={{fontSize:"7px",color:"#888"}}>{l}</div></div>)}
                  </div>
                  <div style={{flex:1,background:"#fff",padding:"4px 8px",display:"flex",flexDirection:"column",gap:"2px"}}>
                    {[0,1].map(i=><div key={i} style={{background:i%2===0?"#fdfbf4":"#fff",border:"1px solid #e8d9a0",height:"10px",borderRadius:"1px"}}/>)}
                  </div>
                </div>
                <div style={{padding:"12px 14px"}}>
                  <div style={{color:"#d4af37",fontWeight:"700",fontSize:"0.78rem",fontFamily:"'Public Sans',sans-serif",marginBottom:"2px"}}>Formal</div>
                  <div style={{color:"rgba(255,255,255,0.4)",fontSize:"0.62rem",fontFamily:"'Public Sans',sans-serif",marginBottom:"12px"}}>سرکاری انداز — سونے کا ہیڈر</div>
                  <button onClick={()=>executePrint("formal")} style={{width:"100%",padding:"8px",borderRadius:"8px",border:"none",background:"linear-gradient(135deg,#d4af37,#b8960a)",color:"#0f172a",fontSize:"0.72rem",fontWeight:"800",cursor:"pointer",fontFamily:"'Public Sans',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:"5px"}}>
                    <span className="material-symbols-rounded" style={{fontSize:"15px"}}>print</span>Print
                  </button>
                </div>
              </div>
              {/* Colorful */}
              <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(30,64,175,0.4)",borderRadius:"14px",overflow:"hidden",cursor:"pointer",transition:"border-color 0.2s"}} onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(96,165,250,0.6)"} onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(30,64,175,0.4)"}>
                <div style={{height:"100px",overflow:"hidden",display:"flex",flexDirection:"column"}}>
                  <div style={{background:"linear-gradient(135deg,#1e40af,#1d4ed8)",padding:"8px 10px",flexShrink:0}}>
                    <div style={{color:"#fff",fontWeight:"900",fontSize:"9px",fontFamily:"sans-serif"}}>📊 نتائج رپورٹ</div>
                    <div style={{color:"rgba(255,255,255,0.5)",fontSize:"7px",marginTop:"2px"}}>Grade • Exam</div>
                  </div>
                  <div style={{background:"#fff",display:"grid",gridTemplateColumns:"repeat(4,1fr)",borderBottom:"1px solid #e2e8f0",padding:"4px 0",flexShrink:0}}>
                    {["#0f172a","#16a34a","#dc2626","#d97706"].map((c,i)=><div key={i} style={{textAlign:"center"}}><div style={{color:c,fontSize:"10px",fontWeight:"900"}}>—</div></div>)}
                  </div>
                  <div style={{flex:1,background:"#f8fafc",padding:"4px 8px",display:"flex",flexDirection:"column",gap:"2px"}}>
                    {[["#f0fdf4","#bbf7d0"],["#fffbeb","#fde68a"],["#fef2f2","#fecaca"]].map(([bg,b],i)=><div key={i} style={{background:bg,border:`1px solid ${b}`,height:"10px",borderRadius:"1px"}}/>)}
                  </div>
                </div>
                <div style={{padding:"12px 14px"}}>
                  <div style={{color:"#60a5fa",fontWeight:"700",fontSize:"0.78rem",fontFamily:"'Public Sans',sans-serif",marginBottom:"2px"}}>Colorful</div>
                  <div style={{color:"rgba(255,255,255,0.4)",fontSize:"0.62rem",fontFamily:"'Public Sans',sans-serif",marginBottom:"12px"}}>رنگین جدید انداز</div>
                  <button onClick={()=>executePrint("colorful")} style={{width:"100%",padding:"8px",borderRadius:"8px",border:"none",background:"linear-gradient(135deg,#1e40af,#1d4ed8)",color:"#fff",fontSize:"0.72rem",fontWeight:"700",cursor:"pointer",fontFamily:"'Public Sans',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:"5px"}}>
                    <span className="material-symbols-rounded" style={{fontSize:"15px"}}>print</span>Print
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Results;
