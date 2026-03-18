/* eslint-disable */
import { useState, useEffect } from "react";
import { C, S, hBadge } from "../../constants";



function Results({students,addData,results:resultsProp=[]}){
  const G="#d4af37";const N="#0f172a";const N2="#1e293b";
  const glass={background:"rgba(255,255,255,0.07)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:"16px"};
  const [results,setResults]=useState(resultsProp); if(JSON.stringify(results)!==JSON.stringify(resultsProp))setResults(resultsProp);const [show,setShow]=useState(false);const [filterGrade,setFilterGrade]=useState("all");
  const [f,setF]=useState({studentId:"",exam:"Monthly Test 1",subject:"Math",totalMarks:100,obtainedMarks:0,grade:"Grade 7",date:new Date().toISOString().split("T")[0]});
  
  const add=async()=>{ if(!f.studentId||!f.exam)return; const pct=Math.round((Number(f.obtainedMarks)/Number(f.totalMarks))*100); await addData("results",{...f,totalMarks:Number(f.totalMarks),obtainedMarks:Number(f.obtainedMarks),percentage:pct}); setShow(false); setF({studentId:"",exam:"Monthly Test 1",subject:"Math",totalMarks:100,obtainedMarks:0,grade:"Grade 7",date:new Date().toISOString().split("T")[0]}); };
  const getGrade=(pct)=>pct>=90?"A+":pct>=80?"A":pct>=70?"B":pct>=60?"C":pct>=50?"D":"F";
  const gc=(pct)=>pct>=80?"#4ade80":pct>=60?"#fb923c":"#f87171";
  const filtered=filterGrade==="all"?results:results.filter(r=>r.grade===filterGrade);
  const grades=["Grade 6","Grade 7","Grade 8","Grade 9"];
  const inp={width:"100%",padding:"10px 14px",borderRadius:"10px",border:"1px solid rgba(212,175,55,0.25)",background:"rgba(255,255,255,0.06)",color:"#f1f5f9",fontSize:"0.8rem",fontFamily:"'Public Sans',sans-serif",outline:"none",boxSizing:"border-box",direction:"rtl",colorScheme:"dark"};
  const lbl={fontSize:"0.7rem",color:"rgba(212,175,55,0.8)",marginBottom:"6px",display:"block",fontWeight:"600"};
  const prevPct=f.totalMarks>0?Math.round((Number(f.obtainedMarks)/Number(f.totalMarks))*100):0;

  // Compute position + class average per (grade × exam) group using full results list
  const resultMeta=(()=>{
    const groups={};
    results.forEach(r=>{ const k=`${r.grade}|${r.exam}`; if(!groups[k])groups[k]=[]; groups[k].push(r); });
    const meta={};
    Object.values(groups).forEach(arr=>{
      const sorted=[...arr].sort((a,b)=>(b.percentage||Math.round((b.obtainedMarks/b.totalMarks)*100)||0)-(a.percentage||Math.round((a.obtainedMarks/a.totalMarks)*100)||0));
      const avg=Math.round(sorted.reduce((s,r)=>s+(r.percentage||Math.round((r.obtainedMarks/r.totalMarks)*100)||0),0)/sorted.length);
      sorted.forEach((r,idx)=>{ meta[r.id]={pos:idx+1,total:sorted.length,avg}; });
    });
    return meta;
  })();
  const posLabel=(pos)=>pos===1?"🥇":pos===2?"🥈":pos===3?"🥉":`#${pos}`;

  return (
    <div style={{minHeight:"100vh",background:`linear-gradient(160deg,${N} 0%,#0d1f3c 50%,#0a1628 100%)`,padding:"24px 20px",fontFamily:"'Public Sans',sans-serif",direction:"rtl"}}>
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"28px",flexWrap:"wrap",gap:"12px"}}>
        <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
          <div style={{width:"44px",height:"44px",borderRadius:"12px",background:`linear-gradient(135deg,${G},#b8960a)`,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 4px 20px rgba(212,175,55,0.4)`}}>
            <span className="material-symbols-rounded" style={{fontSize:"24px",color:N}}>bar_chart</span>
          </div>
          <div>
            <h1 style={{margin:0,fontSize:"1.5rem",fontWeight:"800",color:"#f1f5f9"}}>نتائج</h1>
            <p style={{margin:0,fontSize:"0.75rem",color:"rgba(212,175,55,0.7)",fontWeight:"500"}}>Academic Results • {results.length} اندراجات</p>
          </div>
        </div>
        <button onClick={()=>setShow(!show)} style={{display:"flex",alignItems:"center",gap:"8px",padding:"11px 22px",borderRadius:"12px",border:`1px solid ${G}`,background:show?"rgba(212,175,55,0.15)":"transparent",color:G,fontWeight:"700",fontSize:"0.85rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif"}}>
          <span className="material-symbols-rounded" style={{fontSize:"20px"}}>{show?"close":"add_circle"}</span>{show?"منسوخ":"نیا نتیجہ"}
        </button>
      </div>
      {/* Add Form */}
      {show&&(
        <div style={{...glass,padding:"24px",marginBottom:"24px",borderColor:"rgba(212,175,55,0.3)"}}>
          <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"20px"}}>
            <span className="material-symbols-rounded" style={{color:G,fontSize:"22px"}}>add_circle</span>
            <span style={{color:G,fontWeight:"700",fontSize:"1rem"}}>نئے نتیجے کا اندراج</span>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px",marginBottom:"16px"}}>
            <div><label style={lbl}>طالب علم *</label><select style={inp} value={f.studentId} onChange={e=>setF({...f,studentId:e.target.value})}><option value="" style={{background:N2}}>-- منتخب کریں --</option>{students.map(s=><option key={s.id} value={s.id} style={{background:N2}}>{s.name}</option>)}</select></div>
            <div><label style={lbl}>امتحان</label><input style={inp} value={f.exam} onChange={e=>setF({...f,exam:e.target.value})} placeholder="Monthly Test 1"/></div>
            <div><label style={lbl}>مضمون</label><input style={inp} value={f.subject} onChange={e=>setF({...f,subject:e.target.value})} placeholder="Mathematics"/></div>
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
            <button onClick={()=>setShow(false)} style={{padding:"10px 20px",borderRadius:"10px",border:"1px solid rgba(255,255,255,0.15)",background:"transparent",color:"rgba(241,245,249,0.6)",fontWeight:"600",fontSize:"0.82rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif"}}>منسوخ</button>
            <button onClick={add} style={{display:"flex",alignItems:"center",gap:"8px",padding:"10px 24px",borderRadius:"10px",border:"none",background:`linear-gradient(135deg,${G},#b8960a)`,color:N,fontWeight:"700",fontSize:"0.82rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif"}}>
              <span className="material-symbols-rounded" style={{fontSize:"18px"}}>save</span>محفوظ کریں
            </button>
          </div>
        </div>
      )}
      {/* Grade filter tabs */}
      <div style={{display:"flex",gap:"6px",marginBottom:"20px",flexWrap:"wrap"}}>
        {[["all","سب"],...grades.map(g=>[g,g])].map(([v,l])=>(
          <button key={v} onClick={()=>setFilterGrade(v)} style={{padding:"9px 16px",borderRadius:"9px",border:`1px solid ${filterGrade===v?G:"rgba(255,255,255,0.1)"}`,background:filterGrade===v?"rgba(212,175,55,0.15)":"transparent",color:filterGrade===v?G:"rgba(241,245,249,0.5)",fontWeight:filterGrade===v?"700":"500",fontSize:"0.78rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif"}}>{l}</button>
        ))}
      </div>
      {/* Results Table */}
      <div style={{...glass,overflow:"hidden"}}>
        <div style={{padding:"14px 20px",borderBottom:"1px solid rgba(255,255,255,0.08)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
            <span className="material-symbols-rounded" style={{color:G,fontSize:"20px"}}>bar_chart</span>
            <span style={{color:"#f1f5f9",fontWeight:"700",fontSize:"0.9rem"}}>نتائج — {filtered.length} اندراجات</span>
          </div>
          
        </div>
        <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr style={{background:"rgba(255,255,255,0.04)"}}>
            {["نام","امتحان","مضمون","نمبر","فیصد","گریڈ","پوزیشن","کلاس اوسط"].map(h=><th key={h} style={{padding:"12px 16px",textAlign:"right",fontSize:"0.68rem",fontWeight:"700",color:"rgba(212,175,55,0.8)",borderBottom:"1px solid rgba(255,255,255,0.08)"}}>{h}</th>)}
          </tr></thead>
          <tbody>{filtered.map((r,i)=>{ const st=students.find(s=>s.id===r.studentId); const pct=r.percentage||0; return (
            <tr key={r.id} style={{borderBottom:"1px solid rgba(255,255,255,0.05)",background:i%2===0?"rgba(255,255,255,0.02)":"transparent"}}>
              <td style={{padding:"11px 16px",fontWeight:"700",color:"#f1f5f9",fontSize:"0.82rem"}}>{st?.name||"—"}</td>
              <td style={{padding:"11px 16px",color:"rgba(241,245,249,0.6)",fontSize:"0.75rem"}}>{r.exam}</td>
              <td style={{padding:"11px 16px",color:"rgba(241,245,249,0.6)",fontSize:"0.75rem"}}>{r.subject}</td>
              <td style={{padding:"11px 16px",color:"rgba(212,175,55,0.8)",fontSize:"0.78rem",direction:"ltr"}}>{r.obtainedMarks}/{r.totalMarks}</td>
              <td style={{padding:"11px 16px",fontWeight:"800",color:gc(pct),fontSize:"0.85rem"}}>{pct}%</td>
              <td style={{padding:"11px 16px"}}><span style={{padding:"3px 10px",borderRadius:"20px",fontSize:"0.65rem",fontWeight:"800",background:`${gc(pct)}20`,color:gc(pct),border:`1px solid ${gc(pct)}40`}}>{getGrade(pct)}</span></td>
              <td style={{padding:"11px 16px",textAlign:"center",fontSize:"0.85rem",fontWeight:"800",color:"#f1f5f9"}}>{resultMeta[r.id]?posLabel(resultMeta[r.id].pos):<span style={{color:"rgba(255,255,255,0.2)"}}>—</span>}</td>
              <td style={{padding:"11px 16px",textAlign:"center",fontWeight:"700",color:gc(resultMeta[r.id]?.avg||0),fontSize:"0.78rem"}}>{resultMeta[r.id]?`${resultMeta[r.id].avg}%`:<span style={{color:"rgba(255,255,255,0.2)"}}>—</span>}</td>
            </tr>
          ); })}
          {filtered.length===0&&<tr><td colSpan={8} style={{padding:"50px",textAlign:"center",color:"rgba(241,245,249,0.3)"}}>
            <span className="material-symbols-rounded" style={{fontSize:"40px",display:"block",marginBottom:"10px",color:"rgba(212,175,55,0.2)"}}>bar_chart</span>کوئی ریکارڈ نہیں
          </td></tr>}
          </tbody>
        </table></div>
      </div>
    </div>
  );
}

export default Results;
