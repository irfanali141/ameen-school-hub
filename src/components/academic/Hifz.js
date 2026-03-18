/* eslint-disable */
import { useState, useEffect } from "react";
import { C, S, hBadge, RATING, HOUSES } from "../../constants";


const SURAHS=["الفاتحة","البقرة","آل عمران","النساء","المائدة","الأنعام","الأعراف","الأنفال","التوبة","يونس","هود","يوسف","الرعد","إبراهيم","الحجر","النحل","الإسراء","الكهف","مريم","طه","الأنبياء","الحج","المؤمنون","النور","الفرقان","الشعراء","النمل","القصص","العنكبوت","الروم","لقمان","السجدة","الأحزاب","سبأ","فاطر","يس","الصافات","ص","الزمر","غافر","فصلت","الشورى","الزخرف","الدخان","الجاثية","الأحقاف","محمد","الفتح","الحجرات","ق","الذاريات","الطور","النجم","القمر","الرحمن","الواقعة","الحديد","المجادلة","الحشر","الممتحنة","الصف","الجمعة","المنافقون","التغابن","الطلاق","التحريم","الملك","القلم","الحاقة","المعارج","نوح","الجن","المزمل","المدثر","القيامة","الإنسان","المرسلات","النبأ","النازعات","عبس","التكوير","الانفطار","المطففين","الانشقاق","البروج","الطارق","الأعلى","الغاشية","الفجر","البلد","الشمس","الليل","الضحى","الشرح","التين","العلق","القدر","البينة","الزلزلة","العاديات","القارعة","التكاثر","العصر","الهمزة","الفيل","قريش","الماعون","الكوثر","الكافرون","النصر","المسد","الإخلاص","الفلق","الناس"];
function Hifz({students,addData,hifzLogs:logsProp=[]}){
  const G="#d4af37";const N="#0f172a";const N2="#1e293b";
  const glass={background:"rgba(255,255,255,0.07)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:"16px"};
  const [logs,setLogs]=useState(logsProp); if(JSON.stringify(logs)!==JSON.stringify(logsProp))setLogs(logsProp);const [show,setShow]=useState(false);
  const [f,setF]=useState({studentId:"",surah:"",ayahs:"",rating:3,notes:"",date:new Date().toISOString().split("T")[0]});
  
  const add=async()=>{ if(!f.studentId||!f.surah)return; await addData("hifz_logs",{...f,rating:Number(f.rating)}); setShow(false); setF({studentId:"",surah:"",ayahs:"",rating:3,notes:"",date:new Date().toISOString().split("T")[0]}); };
  const studentLogs=(sid)=>logs.filter(l=>l.studentId===sid);
  const avgRating=(sid)=>{ const sl=studentLogs(sid); if(!sl.length)return 0; return (sl.reduce((s,l)=>s+(l.rating||0),0)/sl.length).toFixed(1); };
  const inp={width:"100%",padding:"10px 14px",borderRadius:"10px",border:"1px solid rgba(212,175,55,0.25)",background:"rgba(255,255,255,0.06)",color:"#f1f5f9",fontSize:"0.8rem",fontFamily:"'Public Sans',sans-serif",outline:"none",boxSizing:"border-box",direction:"rtl",colorScheme:"dark"};
  const lbl={fontSize:"0.7rem",color:"rgba(212,175,55,0.8)",marginBottom:"6px",display:"block",fontWeight:"600"};
  return (
    <div style={{minHeight:"100vh",background:`linear-gradient(160deg,${N} 0%,#0d1f3c 50%,#0a1628 100%)`,padding:"24px 20px",fontFamily:"'Public Sans',sans-serif",direction:"rtl"}}>
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"28px",flexWrap:"wrap",gap:"12px"}}>
        <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
          <div style={{width:"44px",height:"44px",borderRadius:"12px",background:`linear-gradient(135deg,${G},#b8960a)`,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 4px 20px rgba(212,175,55,0.4)`}}>
            <span className="material-symbols-rounded" style={{fontSize:"24px",color:N}}>menu_book</span>
          </div>
          <div>
            <h1 style={{margin:0,fontSize:"1.5rem",fontWeight:"800",color:"#f1f5f9"}}>حفظ ٹریکر</h1>
            <p style={{margin:0,fontSize:"0.75rem",color:"rgba(212,175,55,0.7)",fontWeight:"500"}}>Hifz Progress Tracker • {logs.length} اندراجات</p>
          </div>
        </div>
        <button onClick={()=>setShow(!show)} style={{display:"flex",alignItems:"center",gap:"8px",padding:"11px 22px",borderRadius:"12px",border:`1px solid ${G}`,background:show?"rgba(212,175,55,0.15)":"transparent",color:G,fontWeight:"700",fontSize:"0.85rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif"}}>
          <span className="material-symbols-rounded" style={{fontSize:"20px"}}>{show?"close":"add_circle"}</span>{show?"منسوخ":"نئی تلاوت"}
        </button>
      </div>
      {/* Add Form */}
      {show&&(
        <div style={{...glass,padding:"24px",marginBottom:"24px",borderColor:"rgba(212,175,55,0.3)"}}>
          <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"20px"}}>
            <span className="material-symbols-rounded" style={{color:G,fontSize:"22px"}}>add_circle</span>
            <span style={{color:G,fontWeight:"700",fontSize:"1rem"}}>نئی تلاوت کا اندراج</span>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px",marginBottom:"16px"}}>
            <div><label style={lbl}>طالب علم *</label><select style={inp} value={f.studentId} onChange={e=>setF({...f,studentId:e.target.value})}><option value="" style={{background:N2}}>-- منتخب کریں --</option>{students.map(s=><option key={s.id} value={s.id} style={{background:N2}}>{s.name}</option>)}</select></div>
            <div><label style={lbl}>سورۃ *</label><select style={inp} value={f.surah} onChange={e=>setF({...f,surah:e.target.value})}><option value="" style={{background:N2}}>-- سورۃ منتخب کریں --</option>{SURAHS.map(s=><option key={s} value={s} style={{background:N2}}>{s}</option>)}</select></div>
            <div><label style={lbl}>آیات</label><input style={inp} value={f.ayahs} onChange={e=>setF({...f,ayahs:e.target.value})} placeholder="1-10"/></div>
            <div><label style={lbl}>تاریخ</label><input style={{...inp,direction:"ltr"}} type="date" value={f.date} onChange={e=>setF({...f,date:e.target.value})}/></div>
            <div><label style={lbl}>معیار</label><select style={inp} value={f.rating} onChange={e=>setF({...f,rating:e.target.value})}>{RATING.map(r=><option key={r.val} value={r.val} style={{background:N2}}>{r.label} ({r.labelEn})</option>)}</select></div>
            <div><label style={lbl}>نوٹس</label><input style={inp} value={f.notes} onChange={e=>setF({...f,notes:e.target.value})} placeholder="تلفظ اچھا تھا..."/></div>
          </div>
          <div style={{display:"flex",gap:"10px",justifyContent:"flex-end"}}>
            <button onClick={()=>setShow(false)} style={{padding:"10px 20px",borderRadius:"10px",border:"1px solid rgba(255,255,255,0.15)",background:"transparent",color:"rgba(241,245,249,0.6)",fontWeight:"600",fontSize:"0.82rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif"}}>منسوخ</button>
            <button onClick={add} style={{display:"flex",alignItems:"center",gap:"8px",padding:"10px 24px",borderRadius:"10px",border:"none",background:`linear-gradient(135deg,${G},#b8960a)`,color:N,fontWeight:"700",fontSize:"0.82rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif"}}>
              <span className="material-symbols-rounded" style={{fontSize:"18px"}}>save</span>محفوظ کریں
            </button>
          </div>
        </div>
      )}
      {/* Student Summary Cards */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:"14px",marginBottom:"28px"}}>
        {students.map(s=>{ const cnt=studentLogs(s.id).length; const avg=avgRating(s.id); const h=HOUSES.find(x=>x.id===s.houseId)||{}; return (
          <div key={s.id} className="hv-card" style={{...glass,padding:"16px",borderRight:`3px solid ${h.color||G}`}}>
            <div style={{fontWeight:"700",color:"#f1f5f9",marginBottom:"3px",fontSize:"0.88rem"}}>{s.name}</div>
            <div style={{fontSize:"0.65rem",color:"rgba(212,175,55,0.6)",marginBottom:"12px"}}>{s.grade}</div>
            <div style={{display:"flex",gap:"8px"}}>
              <div style={{background:"rgba(96,165,250,0.12)",borderRadius:"8px",padding:"8px 10px",textAlign:"center",flex:1,border:"1px solid rgba(96,165,250,0.2)"}}>
                <div style={{fontSize:"1.1rem",fontWeight:"900",color:"#60a5fa"}}>{cnt}</div>
                <div style={{fontSize:"0.55rem",color:"rgba(241,245,249,0.4)"}}>سبق</div>
              </div>
              <div style={{background:"rgba(212,175,55,0.12)",borderRadius:"8px",padding:"8px 10px",textAlign:"center",flex:1,border:"1px solid rgba(212,175,55,0.2)"}}>
                <div style={{fontSize:"1.1rem",fontWeight:"900",color:G}}>{avg}</div>
                <div style={{fontSize:"0.55rem",color:"rgba(241,245,249,0.4)"}}>اوسط</div>
              </div>
            </div>
          </div>
        ); })}
      </div>
      {/* Logs Table */}
      <div style={{...glass,overflow:"hidden"}}>
        <div style={{padding:"14px 20px",borderBottom:"1px solid rgba(255,255,255,0.08)",display:"flex",alignItems:"center",gap:"8px"}}>
          <span className="material-symbols-rounded" style={{color:G,fontSize:"20px"}}>history</span>
          <span style={{color:"#f1f5f9",fontWeight:"700",fontSize:"0.9rem"}}>حالیہ اندراجات</span>
        </div>
        <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr style={{background:"rgba(255,255,255,0.04)"}}>
            {["طالب علم","سورۃ","آیات","تاریخ","معیار"].map(h=><th key={h} style={{padding:"12px 16px",textAlign:"right",fontSize:"0.68rem",fontWeight:"700",color:"rgba(212,175,55,0.8)",borderBottom:"1px solid rgba(255,255,255,0.08)"}}>{h}</th>)}
          </tr></thead>
          <tbody>{logs.slice(0,30).map((l,i)=>{ const st=students.find(s=>s.id===l.studentId); const r=RATING.find(x=>x.val===l.rating)||RATING[1]; return (
            <tr key={l.id} style={{borderBottom:"1px solid rgba(255,255,255,0.05)",background:i%2===0?"rgba(255,255,255,0.02)":"transparent"}}>
              <td style={{padding:"11px 16px",fontWeight:"700",color:"#f1f5f9",fontSize:"0.8rem"}}>{st?.name||"—"}</td>
              <td style={{padding:"11px 16px",color:"rgba(241,245,249,0.75)",fontSize:"0.78rem"}}>{l.surah}</td>
              <td style={{padding:"11px 16px",direction:"ltr",fontFamily:"monospace",color:"rgba(212,175,55,0.7)",fontSize:"0.72rem"}}>{l.ayahs||"—"}</td>
              <td style={{padding:"11px 16px",direction:"ltr",fontFamily:"monospace",color:"rgba(241,245,249,0.45)",fontSize:"0.68rem"}}>{l.date||"—"}</td>
              <td style={{padding:"11px 16px"}}><span style={{padding:"3px 10px",borderRadius:"20px",fontSize:"0.62rem",fontWeight:"700",background:r.bg,color:r.color,border:`1px solid ${r.color}40`}}>{r.label}</span></td>
            </tr>
          ); })}
          {logs.length===0&&<tr><td colSpan={5} style={{padding:"50px",textAlign:"center",color:"rgba(241,245,249,0.3)"}}>
            <span className="material-symbols-rounded" style={{fontSize:"40px",display:"block",marginBottom:"10px",color:"rgba(212,175,55,0.2)"}}>menu_book</span>کوئی ریکارڈ نہیں
          </td></tr>}
          </tbody>
        </table></div>
      </div>
    </div>
  );
}

export default Hifz;
