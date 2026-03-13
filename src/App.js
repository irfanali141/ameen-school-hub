/* eslint-disable */
import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, collection, getDocs, addDoc as fbAddDoc, doc, setDoc, updateDoc, onSnapshot, serverTimestamp, query, orderBy, limit } from "firebase/firestore";

const firebaseConfig = { apiKey: "AIzaSyAfGiUY0NlV1t2O99aaSvnqESrGBzr9PnE", authDomain: "ameen-school-hub.firebaseapp.com", projectId: "ameen-school-hub", storageBucket: "ameen-school-hub.firebasestorage.app", messagingSenderId: "793128969005", appId: "1:793128969005:web:12483cc66233eb7cdbe9a4" };
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const C = { gold:"#b7860b", goldLight:"#f5e9c8", goldDark:"#7a5807", goldGlow:"rgba(183,134,11,0.3)", navy:"#1e293b", navyDark:"#0f172a", navyMid:"#1e3a5f", bg:"#f0ede8", white:"#ffffff", red:"#dc2626", green:"#16a34a", amber:"#d97706", purple:"#7c3aed", teal:"#0d9488", abuBakr:"#1e40af", umar:"#166534", uthman:"#854d0e", ali:"#991b1b", abuBakrLight:"#dbeafe", umarLight:"#dcfce7", uthmanLight:"#fef3c7", aliLight:"#fee2e2" };

const HOUSES = [
  { id:"abuBakr", name:"ابو بکرؓ", nameEn:"Abu Bakr", color:C.abuBakr, light:C.abuBakrLight, emoji:"🔵", slogan:"صدیقِ اکبر — سچائی کی علامت", gradient:"linear-gradient(135deg,#1e40af,#1d4ed8)" },
  { id:"umar", name:"عمرؓ", nameEn:"Umar", color:C.umar, light:C.umarLight, emoji:"🟢", slogan:"فاروقِ اعظم — عدل کی میزان", gradient:"linear-gradient(135deg,#166534,#15803d)" },
  { id:"uthman", name:"عثمانؓ", nameEn:"Uthman", color:C.uthman, light:C.uthmanLight, emoji:"🟤", slogan:"ذوالنورین — حیا کا پیکر", gradient:"linear-gradient(135deg,#854d0e,#a16207)" },
  { id:"ali", name:"علیؓ", nameEn:"Ali", color:C.ali, light:C.aliLight, emoji:"🔴", slogan:"شیرِ خدا — شجاعت کا نمونہ", gradient:"linear-gradient(135deg,#991b1b,#b91c1c)" }
];

const HVS_CATS = [
  { id:"attendance", label:"حاضری", labelEn:"Attendance", max:10, icon:"✅", desc:"اسمبلی وقت پر، غیر حاضری نہ ہو" },
  { id:"discipline", label:"نظم و ضبط", labelEn:"Discipline", max:15, icon:"⚔️", desc:"قطار، خاموشی، یونیفارم، ادب" },
  { id:"morality", label:"اخلاقیات", labelEn:"Morality", max:15, icon:"💎", desc:"گفتگو، سچائی، مدد، Spiritual Tracker" },
  { id:"education", label:"تعلیم", labelEn:"Education", max:25, icon:"📚", desc:"سوالات، ہوم ورک، ٹیسٹ، ریڈنگ" },
  { id:"cleanliness", label:"صفائی", labelEn:"Cleanliness", max:15, icon:"🧹", desc:"ناخن، بال، ڈیسک، فرش" },
  { id:"leadership", label:"قیادت", labelEn:"Leadership", max:10, icon:"👑", desc:"کیپٹن/مانیٹرز کی ڈیوٹی" },
  { id:"spirit", label:"ہاؤس اسپرٹ", labelEn:"House Spirit", max:10, icon:"🔥", desc:"نعرہ، جوش، ٹیم ورک" },
  { id:"activities", label:"سرگرمیاں", labelEn:"Activities", max:60, icon:"🎭", desc:"بزمِ ادب، نعت، تقریر، کوئز، اسپورٹس" }
];
const HVS_TOTAL = 160;

const RATING = [
  { val:4, label:"شاندار", labelEn:"Excellent", pct:100, color:C.green, bg:"#dcfce7" },
  { val:3, label:"اچھا", labelEn:"Good", pct:75, color:C.abuBakr, bg:"#dbeafe" },
  { val:2, label:"مناسب", labelEn:"Fair", pct:50, color:C.amber, bg:"#fef3c7" },
  { val:1, label:"کمزور", labelEn:"Weak", pct:25, color:C.red, bg:"#fee2e2" }
];

const DEMO = [
  { email:"director@ameen.edu", password:"ameen2026", role:"director", name:"Director Sahib" },
  { email:"teacher@ameen.edu", password:"ameen2026", role:"teacher", name:"Ustad Ji" },
  { email:"student@ameen.edu", password:"ameen2026", role:"student", name:"Talba" }
];

const SEED_S = [
  { name:"احمد علی", fatherName:"علی احمد", grade:"Grade 7", section:"Orchid", houseId:"abuBakr", studentCode:"AII-2026-001", canteenBalance:150, talent:"تقریر", phone:"0300-1234567" },
  { name:"محمد عمر", fatherName:"عمر محمود", grade:"Grade 8", section:"Lily", houseId:"umar", studentCode:"AII-2026-002", canteenBalance:200, talent:"کرکٹ", phone:"0301-2345678" },
  { name:"عبداللہ", fatherName:"رحیم بخش", grade:"Grade 7", section:"Jasmine", houseId:"uthman", studentCode:"AII-2026-003", canteenBalance:80, talent:"نعت خوانی", phone:"0302-3456789" },
  { name:"یوسف خان", fatherName:"خان محمد", grade:"Grade 9", section:"Rose", houseId:"ali", studentCode:"AII-2026-004", canteenBalance:320, talent:"کوئز", phone:"0303-4567890" },
  { name:"حمزہ راشد", fatherName:"راشد علی", grade:"Grade 6", section:"Orchid", houseId:"abuBakr", studentCode:"AII-2026-005", canteenBalance:95, talent:"فٹ بال", phone:"0304-5678901" },
  { name:"زید احمد", fatherName:"احمد بخش", grade:"Grade 8", section:"Lily", houseId:"umar", studentCode:"AII-2026-006", canteenBalance:175, talent:"خطاطی", phone:"0305-6789012" },
  { name:"سعد خان", fatherName:"خان صاحب", grade:"Grade 7", section:"Rose", houseId:"uthman", studentCode:"AII-2026-007", canteenBalance:120, talent:"تلاوت", phone:"0306-7890123" },
  { name:"عمران علی", fatherName:"علی جان", grade:"Grade 9", section:"Jasmine", houseId:"ali", studentCode:"AII-2026-008", canteenBalance:260, talent:"ریاضی", phone:"0307-8901234" }
];

const SEED_T = [
  { name:"سر ابراہیم قریشی", subject:"Quran/Hifz", grade:"All Grades", employeeCode:"TCH-001", houseId:"abuBakr" },
  { name:"سر عمر شیخ", subject:"Mathematics", grade:"Grade 8", employeeCode:"TCH-002", houseId:"umar" },
  { name:"سر فاطمہ حسن", subject:"Islamic Studies", grade:"Grade 7", employeeCode:"TCH-003", houseId:"uthman" },
  { name:"سر عائشہ ملک", subject:"English", grade:"Grade 6", employeeCode:"TCH-004", houseId:"ali" }
];

const MONTHS = ["Month 1: نظم و ضبط","Month 2: صفائی و پاکیزگی","Month 3: سیرت و اخلاق","Month 4: تعلیمی معیار","Month 5: سماجی خدمت","Month 6: قیادت","Month 7: کھیل اور صحت","Month 8: تخلیقی صلاحیت","Month 9: بزنس ہاؤس","Month 10: روحانیت","Month 11: تکمیل و جائزہ","Month 12: جشنِ کامیابی"];

const TIMETABLE = {
  "Grade 6": { Monday:["Quran (7:30)","Math (8:15)","Urdu (9:00)","Break","English (10:00)","Science (10:45)","Islamic Studies (11:30)"], Tuesday:["Hifz (7:30)","English (8:15)","Math (9:00)","Break","Urdu (10:00)","Social Studies (10:45)","PE (11:30)"], Wednesday:["Quran (7:30)","Science (8:15)","English (9:00)","Break","Math (10:00)","Art (10:45)","Islamic Studies (11:30)"], Thursday:["Hifz (7:30)","Urdu (8:15)","Social Studies (9:00)","Break","English (10:00)","Math (10:45)","Assembly (11:30)"], Friday:["Quran (7:30)","Islamic Studies (8:15)","Urdu (9:00)","Break","English (10:00)","Dua & Closing (11:00)"] },
  "Grade 7": { Monday:["Quran (7:30)","Math (8:15)","English (9:00)","Break","Science (10:00)","Urdu (10:45)","Islamic Studies (11:30)"], Tuesday:["Hifz (7:30)","Science (8:15)","Math (9:00)","Break","English (10:00)","History (10:45)","PE (11:30)"], Wednesday:["Quran (7:30)","English (8:15)","Urdu (9:00)","Break","Math (10:00)","Computer (10:45)","Islamic Studies (11:30)"], Thursday:["Hifz (7:30)","Math (8:15)","History (9:00)","Break","Science (10:00)","English (10:45)","House Activity (11:30)"], Friday:["Quran (7:30)","Islamic Studies (8:15)","Urdu (9:00)","Break","Math (10:00)","Dua & Closing (11:00)"] },
  "Grade 8": { Monday:["Quran (7:30)","Physics (8:15)","Math (9:00)","Break","English (10:00)","Chemistry (10:45)","Islamic Studies (11:30)"], Tuesday:["Hifz (7:30)","Math (8:15)","English (9:00)","Break","Biology (10:00)","Urdu (10:45)","PE (11:30)"], Wednesday:["Quran (7:30)","Chemistry (8:15)","Math (9:00)","Break","English (10:00)","Computer (10:45)","Islamic Studies (11:30)"], Thursday:["Hifz (7:30)","Physics (8:15)","Biology (9:00)","Break","Math (10:00)","English (10:45)","House Activity (11:30)"], Friday:["Quran (7:30)","Islamic Studies (8:15)","Urdu (9:00)","Break","Math (10:00)","Dua & Closing (11:00)"] },
  "Grade 9": { Monday:["Quran (7:30)","Physics (8:15)","Math (9:00)","Break","English (10:00)","Chemistry (10:45)","Pakistan Studies (11:30)"], Tuesday:["Hifz (7:30)","Math (8:15)","Biology (9:00)","Break","English (10:00)","Urdu (10:45)","PE (11:30)"], Wednesday:["Quran (7:30)","Chemistry (8:15)","Math (9:00)","Break","Pakistan Studies (10:00)","Computer (10:45)","Islamic Studies (11:30)"], Thursday:["Hifz (7:30)","Physics (8:15)","Biology (9:00)","Break","Math (10:00)","English (10:45)","House Activity (11:30)"], Friday:["Quran (7:30)","Islamic Studies (8:15)","Urdu (9:00)","Break","Math (10:00)","Dua & Closing (11:00)"] }
};

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday"];
const DAYS_UR = { Monday:"پیر", Tuesday:"منگل", Wednesday:"بدھ", Thursday:"جمعرات", Friday:"جمعہ" };

async function seedDB() {
  try {
    const s = await getDocs(collection(db,"students"));
    if (!s.empty) return;
    for (const x of SEED_S) await fbAddDoc(collection(db,"students"),{...x,enrollmentStatus:"active",createdAt:serverTimestamp()});
    for (const x of SEED_T) await fbAddDoc(collection(db,"teachers"),{...x,isActive:true,createdAt:serverTimestamp()});
    for (const h of HOUSES) await setDoc(doc(db,"houses",h.id),{id:h.id,points:0,hvs_total:0,hvs_weeks:0,updatedAt:serverTimestamp()});
  } catch(e){ console.log("seed:",e.message); }
}

const S = {
  app:{minHeight:"100vh",background:C.bg,fontFamily:"'Noto Nastaliq Urdu','Amiri',serif",direction:"rtl"},
  lp:{minHeight:"100vh",background:`linear-gradient(135deg,${C.navyDark} 0%,${C.navyMid} 50%,${C.navy} 100%)`,display:"flex",alignItems:"center",justifyContent:"center",padding:"20px",position:"relative",overflow:"hidden"},
  lc:{background:"rgba(255,255,255,0.97)",borderRadius:"28px",padding:"44px 40px",width:"100%",maxWidth:"420px",boxShadow:"0 30px 80px rgba(0,0,0,0.5)",backdropFilter:"blur(20px)",border:"1px solid rgba(183,134,11,0.2)"},
  seal:{width:"88px",height:"88px",background:`conic-gradient(${C.gold},#e4b030,${C.gold},#e4b030,${C.gold})`,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px",boxShadow:`0 0 0 5px ${C.goldLight},0 12px 32px rgba(183,134,11,0.4)`},
  title:{fontSize:"1.4rem",fontWeight:"800",background:`linear-gradient(135deg,${C.goldDark},${C.gold})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",textAlign:"center"},
  inp:{width:"100%",padding:"13px 16px",border:`2px solid ${C.goldLight}`,borderRadius:"14px",fontSize:"0.85rem",outline:"none",marginBottom:"12px",background:"#fffdf8",fontFamily:"inherit",direction:"ltr",boxSizing:"border-box",transition:"border-color 0.2s"},
  btn:{width:"100%",padding:"15px",background:`linear-gradient(135deg,${C.gold},${C.goldDark})`,color:C.white,border:"none",borderRadius:"14px",fontSize:"1rem",fontWeight:"700",cursor:"pointer",fontFamily:"inherit",marginTop:"8px",boxShadow:`0 8px 24px ${C.goldGlow}`},
  hdr:{background:`linear-gradient(135deg,${C.navyDark},${C.navy})`,padding:"14px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100,boxShadow:"0 4px 20px rgba(0,0,0,0.3)"},
  nav:{background:C.white,borderBottom:`3px solid ${C.goldLight}`,display:"flex",overflowX:"auto",padding:"0 8px",boxShadow:"0 2px 8px rgba(0,0,0,0.05)"},
  page:{padding:"24px 20px",maxWidth:"1100px",margin:"0 auto"},
  card:{background:C.white,borderRadius:"20px",padding:"24px",boxShadow:"0 4px 20px rgba(0,0,0,0.07)",border:`1px solid ${C.goldLight}`},
  addBtn:{background:`linear-gradient(135deg,${C.gold},${C.goldDark})`,color:C.white,border:"none",borderRadius:"12px",padding:"11px 22px",fontSize:"0.72rem",cursor:"pointer",fontFamily:"inherit",fontWeight:"700",boxShadow:`0 4px 12px ${C.goldGlow}`},
  saveBtn:{background:`linear-gradient(135deg,${C.green},#15803d)`,color:C.white,border:"none",borderRadius:"12px",padding:"11px 26px",fontSize:"0.72rem",cursor:"pointer",fontFamily:"inherit",fontWeight:"700"},
  dangerBtn:{background:`linear-gradient(135deg,${C.red},#b91c1c)`,color:C.white,border:"none",borderRadius:"12px",padding:"11px 22px",fontSize:"0.72rem",cursor:"pointer",fontFamily:"inherit",fontWeight:"700"},
  inpSm:{padding:"10px 14px",border:`2px solid ${C.goldLight}`,borderRadius:"10px",fontSize:"0.72rem",outline:"none",fontFamily:"inherit",background:"#fffdf8",width:"100%",boxSizing:"border-box"},
  th:{padding:"14px 12px",textAlign:"right",fontSize:"0.62rem",color:"#999",borderBottom:`2px solid ${C.goldLight}`,fontWeight:"700",letterSpacing:"0.02em"},
  td:{padding:"12px",fontSize:"0.68rem",borderBottom:`1px solid rgba(245,233,200,0.4)`,color:C.navy}
};

function hBadge(color,light){ return {display:"inline-block",padding:"4px 12px",borderRadius:"20px",background:light||color+"15",color:color,fontSize:"0.58rem",fontWeight:"700",border:`1px solid ${color}30`}; }
function pBar(val,max,color){ const pct=Math.min(100,Math.round((val/max)*100)); return <div style={{height:"6px",background:"#eee",borderRadius:"3px",overflow:"hidden",marginTop:"4px"}}><div style={{width:`${pct}%`,height:"100%",background:color,borderRadius:"3px",transition:"width 0.5s ease"}}/></div>; }

// ===================== LOGIN =====================
function Login({onLogin,err,loading}){
  const [e,setE]=useState(""); const [p,setP]=useState("");
  return <div style={S.lp}>
    <div style={{position:"absolute",top:0,left:0,right:0,bottom:0,backgroundImage:"radial-gradient(circle at 20% 50%, rgba(183,134,11,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(30,64,175,0.1) 0%, transparent 40%)"}}/>
    <div style={S.lc}>
      <div style={{textAlign:"center",marginBottom:"32px"}}>
        <div style={S.seal}><span style={{fontSize:"2rem"}}>☪</span></div>
        <div style={S.title}>امین اسکول ہب</div>
        <div style={{fontSize:"0.65rem",color:"#888",marginTop:"6px",fontFamily:"'Cinzel',serif",letterSpacing:"0.15em"}}>AMEEN ISLAMIC INSTITUTE</div>
        <div style={{fontSize:"0.6rem",color:C.gold,marginTop:"4px"}}>ایمان • نظم • برتری</div>
      </div>
      <input style={S.inp} type="email" placeholder="Email" value={e} onChange={x=>setE(x.target.value)}/>
      <input style={S.inp} type="password" placeholder="Password" value={p} onChange={x=>setP(x.target.value)}/>
      {err&&<div style={{color:C.red,fontSize:"0.68rem",textAlign:"center",marginBottom:"8px",padding:"8px",background:"#fee2e2",borderRadius:"8px"}}>{err}</div>}
      <button style={S.btn} onClick={()=>onLogin(e,p)} disabled={loading}>{loading?"لاگ ان ہو رہا ہے...":"🔐 لاگ ان"}</button>
      <div style={{background:`linear-gradient(135deg,${C.goldLight},#fdf8ee)`,borderRadius:"14px",padding:"16px",marginTop:"20px",border:`1px solid ${C.goldLight}`}}>
        <div style={{fontSize:"0.62rem",color:C.goldDark,fontWeight:"700",marginBottom:"10px"}}>🔑 Demo Credentials — کلک کر کے لاگ ان:</div>
        {DEMO.map(u=><div key={u.email} style={{fontSize:"0.58rem",color:"#555",marginBottom:"6px",fontFamily:"monospace",direction:"ltr",cursor:"pointer",padding:"6px 10px",background:"rgba(255,255,255,0.7)",borderRadius:"8px",border:"1px solid rgba(183,134,11,0.1)"}} onClick={()=>{setE(u.email);setP(u.password);}}>
          [{u.role}] {u.email} / {u.password}
        </div>)}
      </div>
    </div>
  </div>;
}

// ===================== DASHBOARD =====================
function Dashboard({students,teachers,houses,hvsLogs,fees,results}){
  const sorted=[...houses].sort((a,b)=>(b.points||0)-(a.points||0));
  const max=Math.max(...houses.map(h=>h.points||0),1);
  const leader=sorted[0]; const lInfo=HOUSES.find(x=>x.id===leader?.id);
  const thisWeek=hvsLogs.filter(l=>{ const d=l.createdAt?.toDate?.(); if(!d)return false; const now=new Date(); const diff=(now-d)/(1000*60*60*24); return diff<7; });
  const houseTotals={};
  thisWeek.forEach(l=>{ houseTotals[l.houseId]=(houseTotals[l.houseId]||0)+(l.total||0); });
  const totalFeesDue=fees.reduce((s,f)=>s+(f.amount||0),0);
  const totalFeesPaid=fees.filter(f=>f.status==="paid").reduce((s,f)=>s+(f.amount||0),0);
  const feesPct=totalFeesDue>0?Math.round((totalFeesPaid/totalFeesDue)*100):0;
  const pendingFees=fees.filter(f=>f.status==="pending").length;
  const avgResult=results.length>0?Math.round(results.reduce((s,r)=>s+(r.percentage||0),0)/results.length):0;
  return <div style={S.page}>
    <div style={{fontSize:"1.1rem",fontWeight:"700",color:C.navy,marginBottom:"6px"}}>📊 ڈیش بورڈ</div>
    <div style={{fontSize:"0.62rem",color:"#888",marginBottom:"20px"}}>امین اسلامک انسٹی ٹیوٹ، سوات — خوش آمدید</div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:"14px",marginBottom:"24px"}}>
      {[{c:C.abuBakr,i:"🎓",n:students.length,l:"کل طلبا",sub:"فعال"},{c:C.umar,i:"👨‍🏫",n:teachers.length,l:"کل اساتذہ",sub:"فعال"},{c:C.gold,i:"🏠",n:4,l:"ہاؤسز",sub:"چاروں فعال"},{c:lInfo?.color||C.gold,i:"👑",n:lInfo?.nameEn||"—",l:"سپر ہاؤس",sub:`${leader?.points||0} pts`},{c:C.green,i:"💰",n:`${feesPct}%`,l:"فیس وصولی",sub:`${pendingFees} زیر التواء`},{c:C.purple,i:"📊",n:`${avgResult}%`,l:"اوسط نتیجہ",sub:`${results.length} امتحانات`}].map((x,i)=><div key={i} style={{background:`linear-gradient(135deg,${x.c}12,${x.c}05)`,borderRadius:"18px",padding:"18px",border:`2px solid ${x.c}25`,textAlign:"center"}}>
        <div style={{fontSize:"1.4rem"}}>{x.i}</div>
        <div style={{fontSize:"1.6rem",fontWeight:"900",color:x.c,marginTop:"4px"}}>{x.n}</div>
        <div style={{fontSize:"0.62rem",color:"#888",marginTop:"2px"}}>{x.l}</div>
        <div style={{fontSize:"0.55rem",color:x.c,marginTop:"2px",opacity:0.8}}>{x.sub}</div>
      </div>)}
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"20px",marginBottom:"24px"}}>
      <div style={S.card}>
        <div style={{fontSize:"0.85rem",fontWeight:"700",color:C.navy,marginBottom:"20px"}}>🏆 ہاؤس لیڈر بورڈ</div>
        {sorted.map((h,i)=>{ const info=HOUSES.find(x=>x.id===h.id)||{}; return <div key={h.id} style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"16px"}}>
          <span style={{width:"28px",height:"28px",borderRadius:"50%",background:i===0?`linear-gradient(135deg,${C.gold},${C.goldDark})`:"#eee",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.65rem",fontWeight:"900",color:i===0?C.white:"#aaa"}}>{i+1}</span>
          <span style={{fontSize:"1.3rem"}}>{info.emoji}</span>
          <div style={{flex:1}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:"6px"}}>
              <span style={{fontSize:"0.7rem",fontWeight:"700",color:C.navy}}>{info.nameEn}</span>
              <span style={{fontSize:"0.7rem",fontWeight:"800",color:info.color}}>{h.points||0} pts</span>
            </div>
            {pBar(h.points||0,max,info.color||C.gold)}
          </div>
        </div>; })}
      </div>
      <div style={S.card}>
        <div style={{fontSize:"0.85rem",fontWeight:"700",color:C.navy,marginBottom:"20px"}}>📈 اس ہفتے HVS (160)</div>
        {HOUSES.map(info=>{ const pts=houseTotals[info.id]||0; return <div key={info.id} style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"16px"}}>
          <span style={{fontSize:"1.3rem"}}>{info.emoji}</span>
          <div style={{flex:1}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:"6px"}}>
              <span style={{fontSize:"0.7rem",fontWeight:"700",color:C.navy}}>{info.nameEn}</span>
              <span style={{fontSize:"0.7rem",fontWeight:"800",color:info.color}}>{pts}/{HVS_TOTAL}</span>
            </div>
            {pBar(pts,HVS_TOTAL,info.color)}
          </div>
        </div>; })}
      </div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"20px",marginBottom:"24px"}}>
      <div style={S.card}>
        <div style={{fontSize:"0.85rem",fontWeight:"700",color:C.navy,marginBottom:"16px"}}>💰 فیس خلاصہ</div>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:"8px"}}><span style={{fontSize:"0.68rem",color:"#888"}}>کل فیس</span><span style={{fontSize:"0.72rem",fontWeight:"700",color:C.navy}}>Rs. {totalFeesDue.toLocaleString()}</span></div>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:"8px"}}><span style={{fontSize:"0.68rem",color:"#888"}}>وصول شدہ</span><span style={{fontSize:"0.72rem",fontWeight:"700",color:C.green}}>Rs. {totalFeesPaid.toLocaleString()}</span></div>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:"12px"}}><span style={{fontSize:"0.68rem",color:"#888"}}>باقی</span><span style={{fontSize:"0.72rem",fontWeight:"700",color:C.red}}>Rs. {(totalFeesDue-totalFeesPaid).toLocaleString()}</span></div>
        {pBar(totalFeesPaid,totalFeesDue||1,C.green)}
        <div style={{fontSize:"0.6rem",color:"#aaa",marginTop:"6px",textAlign:"center"}}>{feesPct}% وصول ہوئی</div>
      </div>
      <div style={S.card}>
        <div style={{fontSize:"0.85rem",fontWeight:"700",color:C.navy,marginBottom:"16px"}}>📊 نتائج خلاصہ</div>
        {results.length===0?<div style={{textAlign:"center",color:"#bbb",fontSize:"0.65rem",padding:"20px"}}>ابھی کوئی نتیجہ نہیں</div>:<>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:"8px"}}><span style={{fontSize:"0.68rem",color:"#888"}}>کل امتحانات</span><span style={{fontSize:"0.72rem",fontWeight:"700",color:C.navy}}>{results.length}</span></div>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:"8px"}}><span style={{fontSize:"0.68rem",color:"#888"}}>اوسط نمبر</span><span style={{fontSize:"0.72rem",fontWeight:"700",color:avgResult>=70?C.green:avgResult>=50?C.amber:C.red}}>{avgResult}%</span></div>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:"12px"}}><span style={{fontSize:"0.68rem",color:"#888"}}>پاس / فیل</span><span style={{fontSize:"0.72rem",fontWeight:"700"}}><span style={{color:C.green}}>{results.filter(r=>r.percentage>=50).length}</span><span style={{color:"#aaa"}}>/</span><span style={{color:C.red}}>{results.filter(r=>r.percentage<50).length}</span></span></div>
          {pBar(avgResult,100,avgResult>=70?C.green:avgResult>=50?C.amber:C.red)}
        </>}
      </div>
    </div>
    <div style={S.card}>
      <div style={{fontSize:"0.85rem",fontWeight:"700",color:C.navy,marginBottom:"16px"}}>🏠 ہاؤس کارڈز</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:"16px"}}>
        {HOUSES.map((h,i)=>{ const hd=sorted.find(x=>x.id===h.id)||{}; const studs=students.filter(s=>s.houseId===h.id); return <div key={h.id} style={{background:h.gradient,borderRadius:"18px",padding:"20px",color:C.white,position:"relative",overflow:"hidden"}}>
          {i===0&&sorted[0]?.id===h.id&&<div style={{position:"absolute",top:"10px",left:"12px",fontSize:"1.4rem"}}>👑</div>}
          <div style={{fontSize:"2rem",marginBottom:"6px"}}>{h.emoji}</div>
          <div style={{fontSize:"0.9rem",fontWeight:"800",marginBottom:"2px"}}>{h.nameEn} House</div>
          <div style={{fontSize:"0.65rem",opacity:0.85,marginBottom:"4px"}}>{h.slogan}</div>
          <div style={{fontSize:"2rem",fontWeight:"900",opacity:0.9}}>{hd.points||0}</div>
          <div style={{fontSize:"0.6rem",opacity:0.7}}>کل پوائنٹس • {studs.length} طلبا</div>
        </div>; })}
      </div>
    </div>
  </div>;
}

// ===================== HVS ENTRY =====================
function HVSEntry({students,houses,addData,updateHousePoints}){
  const [show,setShow]=useState(false); const [houseId,setHouseId]=useState("abuBakr");
  const [week,setWeek]=useState(new Date().toISOString().split("T")[0]);
  const [scores,setScores]=useState({}); const [logs,setLogs]=useState([]); const [saving,setSaving]=useState(false);
  useEffect(()=>{ return onSnapshot(query(collection(db,"hvs_logs"),orderBy("createdAt","desc"),limit(50)),s=>setLogs(s.docs.map(d=>({id:d.id,...d.data()})))); },[]);
  const setScore=(cat,val)=>setScores({...scores,[cat]:val});
  const calcScore=(r,max)=>Math.round((r/4)*max);
  const total=HVS_CATS.reduce((sum,cat)=>sum+(calcScore(scores[cat.id]||0,cat.max)),0);
  const hInfo=HOUSES.find(h=>h.id===houseId)||{};
  const save=async()=>{ setSaving(true); const catScores={}; HVS_CATS.forEach(cat=>{ catScores[cat.id]=calcScore(scores[cat.id]||0,cat.max); }); await addData("hvs_logs",{houseId,week,ratings:scores,scores:catScores,total,maxTotal:HVS_TOTAL}); await updateHousePoints(houseId,total); setScores({}); setShow(false); setSaving(false); };
  const houseSummary=HOUSES.map(h=>{ const hLogs=logs.filter(l=>l.houseId===h.id); const tot=hLogs.reduce((s,l)=>s+(l.total||0),0); const avg=hLogs.length>0?Math.round(tot/hLogs.length):0; return {...h,logCount:hLogs.length,totalPts:tot,avgScore:avg}; }).sort((a,b)=>b.totalPts-a.totalPts);
  return <div style={S.page}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"24px"}}>
      <div><div style={{fontSize:"1.1rem",fontWeight:"700",color:C.navy}}>📊 HVS اسکورنگ سسٹم</div><div style={{fontSize:"0.65rem",color:"#888",marginTop:"2px"}}>ہاؤس ویلیو اسکور — 160 مارکس فریم ورک</div></div>
      <button style={S.addBtn} onClick={()=>setShow(!show)}>+ نیا HVS اسکور</button>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:"14px",marginBottom:"24px"}}>
      {houseSummary.map((h,i)=><div key={h.id} style={{background:h.gradient,borderRadius:"16px",padding:"18px",color:C.white,position:"relative"}}>
        {i===0&&<div style={{position:"absolute",top:"10px",left:"10px",fontSize:"1rem"}}>👑</div>}
        <div style={{fontSize:"1.5rem"}}>{h.emoji}</div>
        <div style={{fontSize:"0.8rem",fontWeight:"800",marginTop:"4px"}}>{h.nameEn}</div>
        <div style={{fontSize:"1.8rem",fontWeight:"900",marginTop:"8px"}}>{h.totalPts}</div>
        <div style={{fontSize:"0.55rem",opacity:0.75}}>کل HVS پوائنٹس</div>
        <div style={{fontSize:"0.6rem",marginTop:"6px",opacity:0.85}}>اوسط: {h.avgScore}/{HVS_TOTAL} | {h.logCount} ہفتے</div>
      </div>)}
    </div>
    {show&&<div style={{...S.card,marginBottom:"24px",background:`linear-gradient(135deg,${C.goldLight},#fdf8ee)`,border:`2px solid ${C.gold}30`}}>
      <div style={{fontSize:"0.9rem",fontWeight:"700",color:C.navy,marginBottom:"20px"}}>📝 ہفتہ وار HVS رپورٹ درج کریں</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"20px"}}>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>ہاؤس منتخب کریں</label><select style={{...S.inpSm,borderColor:hInfo.color||C.gold}} value={houseId} onChange={e=>setHouseId(e.target.value)}>{HOUSES.map(h=><option key={h.id} value={h.id}>{h.emoji} {h.nameEn}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>ہفتے کی تاریخ</label><input style={{...S.inpSm,direction:"ltr"}} type="date" value={week} onChange={e=>setWeek(e.target.value)}/></div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px",marginBottom:"20px"}}>
        {HVS_CATS.map(cat=>{ const rating=scores[cat.id]||0; const earned=calcScore(rating,cat.max); return <div key={cat.id} style={{background:C.white,borderRadius:"14px",padding:"16px",border:`1px solid ${C.goldLight}`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"8px"}}>
            <div><div style={{fontSize:"0.75rem",fontWeight:"700",color:C.navy}}>{cat.icon} {cat.label}</div><div style={{fontSize:"0.55rem",color:"#aaa",marginTop:"2px"}}>{cat.desc}</div></div>
            <div style={{textAlign:"left",direction:"ltr"}}><div style={{fontSize:"0.65rem",fontWeight:"700",color:hInfo.color||C.gold}}>{earned}/{cat.max}</div></div>
          </div>
          <div style={{display:"flex",gap:"6px"}}>
            {RATING.map(r=><button key={r.val} onClick={()=>setScore(cat.id,r.val)} style={{flex:1,padding:"6px 2px",borderRadius:"8px",border:"none",cursor:"pointer",fontSize:"0.55rem",fontWeight:"700",background:scores[cat.id]===r.val?r.bg:"#f5f5f5",color:scores[cat.id]===r.val?r.color:"#bbb",transition:"all 0.15s"}}>{r.val}<br/><span style={{fontSize:"0.45rem"}}>{r.labelEn}</span></button>)}
          </div>
        </div>; })}
      </div>
      <div style={{background:C.white,borderRadius:"14px",padding:"16px",marginBottom:"16px",textAlign:"center",border:`2px solid ${total>=120?C.green:total>=80?C.gold:C.red}30`}}>
        <div style={{fontSize:"0.65rem",color:"#888",marginBottom:"4px"}}>کل اسکور</div>
        <div style={{fontSize:"2.5rem",fontWeight:"900",color:total>=120?C.green:total>=80?C.gold:C.red}}>{total}</div>
        <div style={{fontSize:"0.65rem",color:"#aaa"}}>/ {HVS_TOTAL} مارکس</div>
        {pBar(total,HVS_TOTAL,total>=120?C.green:total>=80?C.gold:C.red)}
      </div>
      <button style={{...S.saveBtn,width:"100%"}} onClick={save} disabled={saving}>{saving?"محفوظ ہو رہا ہے...":"✅ HVS اسکور محفوظ کریں"}</button>
    </div>}
    <div style={S.card}>
      <div style={{fontSize:"0.85rem",fontWeight:"700",color:C.navy,marginBottom:"16px"}}>📋 HVS لاگ</div>
      <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead><tr><th style={S.th}>ہاؤس</th><th style={S.th}>ہفتہ</th>{HVS_CATS.slice(0,4).map(c=><th key={c.id} style={S.th}>{c.icon}</th>)}<th style={S.th}>کل</th><th style={S.th}>گریڈ</th></tr></thead>
        <tbody>{logs.map(l=>{ const info=HOUSES.find(x=>x.id===l.houseId)||{}; const grade=l.total>=140?"A+":l.total>=120?"A":l.total>=100?"B":l.total>=80?"C":"D"; const gc=l.total>=120?C.green:l.total>=80?C.amber:C.red; return <tr key={l.id}>
          <td style={S.td}><span style={hBadge(info.color,info.light)}>{info.emoji} {info.nameEn}</span></td>
          <td style={{...S.td,fontFamily:"monospace",direction:"ltr",fontSize:"0.6rem"}}>{l.week}</td>
          {HVS_CATS.slice(0,4).map(c=><td key={c.id} style={S.td}>{l.scores?.[c.id]||0}/{c.max}</td>)}
          <td style={{...S.td,fontWeight:"800",color:gc}}>{l.total||0}/{HVS_TOTAL}</td>
          <td style={S.td}><span style={{padding:"3px 10px",borderRadius:"20px",background:gc+"15",color:gc,fontSize:"0.62rem",fontWeight:"800"}}>{grade}</span></td>
        </tr>; })}{logs.length===0&&<tr><td colSpan={8} style={{...S.td,textAlign:"center",color:"#bbb",padding:"40px"}}>ابھی تک کوئی HVS لاگ نہیں</td></tr>}</tbody>
      </table></div>
    </div>
  </div>;
}

// ===================== STUDENTS =====================
function Students({students,addData}){
  const [show,setShow]=useState(false);
  const [f,setF]=useState({name:"",fatherName:"",grade:"Grade 7",houseId:"abuBakr",studentCode:"",section:"Orchid",canteenBalance:100,talent:"",phone:""});
  const [q,setQ]=useState(""); const [selStudent,setSelStudent]=useState(null);
  const filtered=students.filter(s=>s.name?.includes(q)||s.studentCode?.includes(q)||s.grade?.includes(q));
  const add=async()=>{ if(!f.name)return; await addData("students",{...f,enrollmentStatus:"active"}); setShow(false); setF({name:"",fatherName:"",grade:"Grade 7",houseId:"abuBakr",studentCode:"",section:"Orchid",canteenBalance:100,talent:"",phone:""}); };
  if(selStudent){ const h=HOUSES.find(x=>x.id===selStudent.houseId)||{}; return <div style={S.page}>
    <button style={{...S.addBtn,marginBottom:"20px",background:"#eee",color:C.navy,boxShadow:"none"}} onClick={()=>setSelStudent(null)}>← واپس</button>
    <div style={{...S.card,background:h.gradient,color:C.white,marginBottom:"20px"}}><div style={{display:"flex",alignItems:"center",gap:"20px"}}><div style={{width:"70px",height:"70px",borderRadius:"50%",background:"rgba(255,255,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"2rem"}}>{h.emoji||"👤"}</div><div><div style={{fontSize:"1.2rem",fontWeight:"800"}}>{selStudent.name}</div><div style={{fontSize:"0.7rem",opacity:0.85,marginTop:"4px"}}>والد: {selStudent.fatherName}</div><div style={{fontSize:"0.65rem",opacity:0.7,fontFamily:"monospace",direction:"ltr",marginTop:"2px"}}>{selStudent.studentCode}</div></div></div></div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px"}}>{[{label:"جماعت",val:selStudent.grade,icon:"📚"},{label:"ہاؤس",val:h.nameEn||"—",icon:h.emoji||"🏠"},{label:"سیکشن",val:selStudent.section||"—",icon:"🏫"},{label:"ہنر",val:selStudent.talent||"—",icon:"⭐"},{label:"فون",val:selStudent.phone||"—",icon:"📱"},{label:"کینٹین بیلنس",val:`Rs. ${selStudent.canteenBalance||0}`,icon:"💰"}].map((item,i)=><div key={i} style={S.card}><div style={{fontSize:"1.2rem"}}>{item.icon}</div><div style={{fontSize:"0.62rem",color:"#888",marginTop:"6px"}}>{item.label}</div><div style={{fontSize:"0.85rem",fontWeight:"700",color:C.navy,marginTop:"2px"}}>{item.val}</div></div>)}</div>
  </div>; }
  return <div style={S.page}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"8px"}}>
      <div style={{fontSize:"1.1rem",fontWeight:"700",color:C.navy}}>🎓 طلبا ({students.length})</div>
      <button style={S.addBtn} onClick={()=>setShow(!show)}>+ نیا طالب علم</button>
    </div>
    {show&&<div style={{...S.card,margin:"16px 0",background:`linear-gradient(135deg,${C.goldLight},#fdf8ee)`,border:`2px solid ${C.gold}30`}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>نام *</label><input style={S.inpSm} value={f.name} onChange={e=>setF({...f,name:e.target.value})} placeholder="طالب علم کا نام"/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>والد کا نام</label><input style={S.inpSm} value={f.fatherName} onChange={e=>setF({...f,fatherName:e.target.value})} placeholder="والد کا نام"/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>جماعت</label><select style={S.inpSm} value={f.grade} onChange={e=>setF({...f,grade:e.target.value})}>{["Grade 1","Grade 2","Grade 3","Grade 4","Grade 5","Grade 6","Grade 7","Grade 8","Grade 9","Grade 10"].map(g=><option key={g}>{g}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>ہاؤس</label><select style={S.inpSm} value={f.houseId} onChange={e=>setF({...f,houseId:e.target.value})}>{HOUSES.map(h=><option key={h.id} value={h.id}>{h.emoji} {h.nameEn}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>کوڈ</label><input style={{...S.inpSm,direction:"ltr"}} value={f.studentCode} onChange={e=>setF({...f,studentCode:e.target.value})} placeholder="AII-2026-XXX"/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>فون</label><input style={{...S.inpSm,direction:"ltr"}} value={f.phone} onChange={e=>setF({...f,phone:e.target.value})} placeholder="0300-1234567"/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>ہنر</label><input style={S.inpSm} value={f.talent} onChange={e=>setF({...f,talent:e.target.value})} placeholder="تقریر، نعت، کرکٹ..."/></div>
      </div>
      <button style={S.saveBtn} onClick={add}>✅ محفوظ کریں</button>
    </div>}
    <div style={{marginBottom:"16px"}}><input style={{...S.inpSm,direction:"rtl"}} placeholder="🔍 تلاش..." value={q} onChange={e=>setQ(e.target.value)}/></div>
    <div style={S.card}><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}>
      <thead><tr><th style={S.th}>نام</th><th style={S.th}>والد</th><th style={S.th}>کوڈ</th><th style={S.th}>جماعت</th><th style={S.th}>ہاؤس</th><th style={S.th}>ہنر</th><th style={S.th}>بیلنس</th><th style={S.th}>پروفائل</th></tr></thead>
      <tbody>{filtered.map(s=>{ const h=HOUSES.find(x=>x.id===s.houseId); return <tr key={s.id}>
        <td style={{...S.td,fontWeight:"700"}}>{s.name}</td><td style={S.td}>{s.fatherName}</td>
        <td style={{...S.td,fontFamily:"monospace",direction:"ltr",fontSize:"0.6rem",color:C.gold}}>{s.studentCode}</td>
        <td style={S.td}>{s.grade}</td>
        <td style={S.td}>{h&&<span style={hBadge(h.color,h.light)}>{h.emoji} {h.nameEn}</span>}</td>
        <td style={S.td}>{s.talent||"—"}</td>
        <td style={{...S.td,fontWeight:"700",color:(s.canteenBalance||0)<50?C.red:C.green}}>Rs. {s.canteenBalance||0}</td>
        <td style={S.td}><button onClick={()=>setSelStudent(s)} style={{...S.addBtn,padding:"5px 12px",fontSize:"0.58rem"}}>دیکھیں</button></td>
      </tr>; })}{filtered.length===0&&<tr><td colSpan={8} style={{...S.td,textAlign:"center",color:"#bbb",padding:"40px"}}>کوئی طالب علم نہیں ملا</td></tr>}</tbody>
    </table></div></div>
  </div>;
}

// ===================== TEACHERS =====================
function Teachers({teachers,addData}){
  const [show,setShow]=useState(false);
  const [f,setF]=useState({name:"",subject:"",grade:"Grade 7",employeeCode:"",houseId:"abuBakr"});
  const add=async()=>{ if(!f.name)return; await addData("teachers",{...f,isActive:true}); setShow(false); setF({name:"",subject:"",grade:"Grade 7",employeeCode:"",houseId:"abuBakr"}); };
  return <div style={S.page}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"20px"}}>
      <div style={{fontSize:"1.1rem",fontWeight:"700",color:C.navy}}>👨‍🏫 اساتذہ ({teachers.length})</div>
      <button style={S.addBtn} onClick={()=>setShow(!show)}>+ نیا استاد</button>
    </div>
    {show&&<div style={{...S.card,marginBottom:"20px",background:`linear-gradient(135deg,${C.goldLight},#fdf8ee)`}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>نام</label><input style={S.inpSm} value={f.name} onChange={e=>setF({...f,name:e.target.value})} placeholder="استاد کا نام"/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>مضمون</label><input style={S.inpSm} value={f.subject} onChange={e=>setF({...f,subject:e.target.value})} placeholder="مضمون"/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>کوڈ</label><input style={{...S.inpSm,direction:"ltr"}} value={f.employeeCode} onChange={e=>setF({...f,employeeCode:e.target.value})} placeholder="TCH-XXX"/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>ہاؤس ماسٹر</label><select style={S.inpSm} value={f.houseId} onChange={e=>setF({...f,houseId:e.target.value})}>{HOUSES.map(h=><option key={h.id} value={h.id}>{h.emoji} {h.nameEn}</option>)}</select></div>
      </div>
      <button style={S.saveBtn} onClick={add}>✅ محفوظ کریں</button>
    </div>}
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:"16px"}}>
      {teachers.map(t=>{ const h=HOUSES.find(x=>x.id===t.houseId)||{}; return <div key={t.id} style={{...S.card,borderTop:`4px solid ${h.color||C.gold}`}}>
        <div style={{display:"flex",alignItems:"center",gap:"14px",marginBottom:"14px"}}>
          <div style={{width:"52px",height:"52px",borderRadius:"50%",background:h.gradient||`linear-gradient(135deg,${C.navy},#2563eb)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.4rem",flexShrink:0}}>👤</div>
          <div><div style={{fontWeight:"700",color:C.navy,fontSize:"0.85rem"}}>{t.name}</div><div style={{fontSize:"0.6rem",color:"#999",marginTop:"2px"}}>{t.employeeCode}</div></div>
        </div>
        <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}><span style={hBadge(C.navy,C.abuBakrLight)}>{t.subject}</span><span style={hBadge(C.gold,C.goldLight)}>{t.grade}</span>{h.id&&<span style={hBadge(h.color,h.light)}>{h.emoji} ہاؤس ماسٹر</span>}</div>
      </div>; })}
    </div>
  </div>;
}

// ===================== HIFZ =====================
function Hifz({students,addData}){
  const [logs,setLogs]=useState([]); const [show,setShow]=useState(false);
  const [f,setF]=useState({studentId:"",surah:"",performanceRating:"GOOD",revisionType:"new"});
  useEffect(()=>{ return onSnapshot(query(collection(db,"hifz_logs"),orderBy("createdAt","desc"),limit(30)),s=>setLogs(s.docs.map(d=>({id:d.id,...d.data()})))); },[]);
  const add=async()=>{ if(!f.studentId||!f.surah)return; const pts={EXCELLENT:10,GOOD:5,AVERAGE:0,WEAK:-2}[f.performanceRating]||0; await addData("hifz_logs",{...f,housePointsAwarded:pts}); setShow(false); setF({studentId:"",surah:"",performanceRating:"GOOD",revisionType:"new"}); };
  const rColor={EXCELLENT:C.green,GOOD:C.abuBakr,AVERAGE:C.amber,WEAK:C.red}; const rBg={EXCELLENT:"#dcfce7",GOOD:"#dbeafe",AVERAGE:"#fef3c7",WEAK:"#fee2e2"};
  return <div style={S.page}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"24px"}}>
      <div><div style={{fontSize:"1.1rem",fontWeight:"700",color:C.navy}}>📖 حفظ لاگ</div></div>
      <button style={S.addBtn} onClick={()=>setShow(!show)}>+ نیا لاگ</button>
    </div>
    {show&&<div style={{...S.card,marginBottom:"24px",background:`linear-gradient(135deg,${C.goldLight},#fdf8ee)`}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>طالب علم</label><select style={S.inpSm} value={f.studentId} onChange={e=>setF({...f,studentId:e.target.value})}><option value="">-- منتخب کریں --</option>{students.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>سورہ / پارہ</label><input style={S.inpSm} value={f.surah} onChange={e=>setF({...f,surah:e.target.value})} placeholder="سورہ بقرہ..."/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>کارکردگی</label><select style={S.inpSm} value={f.performanceRating} onChange={e=>setF({...f,performanceRating:e.target.value})}>{["EXCELLENT","GOOD","AVERAGE","WEAK"].map(r=><option key={r}>{r}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>نوعیت</label><select style={S.inpSm} value={f.revisionType} onChange={e=>setF({...f,revisionType:e.target.value})}>{["new","revision","sabqi","manzil"].map(r=><option key={r}>{r}</option>)}</select></div>
      </div>
      <button style={S.saveBtn} onClick={add}>✅ محفوظ کریں</button>
    </div>}
    <div style={S.card}><table style={{width:"100%",borderCollapse:"collapse"}}>
      <thead><tr><th style={S.th}>طالب علم</th><th style={S.th}>سورہ</th><th style={S.th}>نوعیت</th><th style={S.th}>کارکردگی</th><th style={S.th}>پوائنٹس</th></tr></thead>
      <tbody>{logs.map(l=>{ const st=students.find(s=>s.id===l.studentId); return <tr key={l.id}>
        <td style={{...S.td,fontWeight:"700"}}>{st?.name||"—"}</td><td style={S.td}>{l.surah}</td><td style={S.td}>{l.revisionType}</td>
        <td style={S.td}><span style={{padding:"4px 10px",borderRadius:"20px",fontSize:"0.58rem",fontWeight:"700",background:rBg[l.performanceRating]||"#eee",color:rColor[l.performanceRating]||"#888"}}>{l.performanceRating}</span></td>
        <td style={{...S.td,fontWeight:"800",color:(l.housePointsAwarded||0)>0?C.green:(l.housePointsAwarded||0)<0?C.red:"#888"}}>{(l.housePointsAwarded||0)>0?"+":""}{l.housePointsAwarded||0}</td>
      </tr>; })}{logs.length===0&&<tr><td colSpan={5} style={{...S.td,textAlign:"center",color:"#bbb",padding:"40px"}}>ابھی کوئی لاگ نہیں</td></tr>}</tbody>
    </table></div>
  </div>;
}

// ===================== HOUSES =====================
function Houses({houses,hvsLogs,students}){
  const sorted=[...houses].sort((a,b)=>(b.points||0)-(a.points||0));
  const max=Math.max(...sorted.map(h=>h.points||0),1);
  const [selMonth,setSelMonth]=useState(0);
  const catTotals=(hid)=>{ const hLogs=hvsLogs.filter(l=>l.houseId===hid); const totals={}; HVS_CATS.forEach(c=>{ totals[c.id]=hLogs.reduce((s,l)=>s+(l.scores?.[c.id]||0),0); }); return totals; };
  const hStudents=(hid)=>students.filter(s=>s.houseId===hid);
  return <div style={S.page}>
    <div style={{fontSize:"1.1rem",fontWeight:"700",color:C.navy,marginBottom:"24px"}}>🏠 ہاؤس سسٹم</div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:"20px",marginBottom:"28px"}}>
      {sorted.map((h,i)=>{ const info=HOUSES.find(x=>x.id===h.id)||{}; const studs=hStudents(h.id); return <div key={h.id} style={{background:info.gradient,borderRadius:"22px",padding:"24px",color:C.white,position:"relative",overflow:"hidden"}}>
        {i===0&&<div style={{position:"absolute",top:"12px",left:"14px",fontSize:"1.6rem"}}>👑</div>}
        <div style={{position:"absolute",top:"12px",right:"14px",fontSize:"0.65rem",background:"rgba(255,255,255,0.2)",padding:"4px 10px",borderRadius:"20px",fontWeight:"700"}}>#{i+1}</div>
        <div style={{fontSize:"2.2rem",marginBottom:"8px"}}>{info.emoji}</div>
        <div style={{fontSize:"1rem",fontWeight:"800",marginBottom:"2px"}}>{info.nameEn} House</div>
        <div style={{fontSize:"0.55rem",opacity:0.7,marginBottom:"16px",fontStyle:"italic"}}>{info.slogan}</div>
        <div style={{fontSize:"2.8rem",fontWeight:"900",opacity:0.95}}>{h.points||0}</div>
        <div style={{fontSize:"0.6rem",opacity:0.7,marginBottom:"16px"}}>کل پوائنٹس</div>
        <div style={{fontSize:"0.6rem",opacity:0.85}}>👥 {studs.length} طلبا • 📊 {hvsLogs.filter(l=>l.houseId===h.id).length} HVS</div>
      </div>; })}
    </div>
    <div style={S.card}>
      <div style={{fontSize:"0.85rem",fontWeight:"700",color:C.navy,marginBottom:"16px"}}>📅 سالانہ تھیم پلاننگ</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:"10px"}}>
        {MONTHS.map((m,i)=><div key={i} style={{padding:"12px 14px",borderRadius:"12px",background:i===selMonth?`linear-gradient(135deg,${C.gold},${C.goldDark})`:"#fafaf8",color:i===selMonth?C.white:C.navy,cursor:"pointer",border:`1px solid ${i===selMonth?C.gold:C.goldLight}`,fontSize:"0.62rem",fontWeight:i===selMonth?"700":"400"}} onClick={()=>setSelMonth(i)}>{m}</div>)}
      </div>
    </div>
  </div>;
}

// ===================== ATTENDANCE =====================
function Attendance({students,addData}){
  const [att,setAtt]=useState({}); const [saved,setSaved]=useState(false);
  const [attLogs,setAttLogs]=useState([]); const [tab,setTab]=useState("today");
  const today=new Date().toISOString().split("T")[0];
  useEffect(()=>{ return onSnapshot(query(collection(db,"attendance"),orderBy("createdAt","desc"),limit(100)),s=>setAttLogs(s.docs.map(d=>({id:d.id,...d.data()})))); },[]);
  const markAll=s=>{ const a={}; students.forEach(x=>{a[x.id]=s;}); setAtt(a); };
  const save=async()=>{ for(const[sid,status] of Object.entries(att)) await addData("attendance",{studentId:sid,status,date:today}); setSaved(true); setTimeout(()=>setSaved(false),3000); };
  const counts={present:Object.values(att).filter(x=>x==="present").length,absent:Object.values(att).filter(x=>x==="absent").length,late:Object.values(att).filter(x=>x==="late").length};
  const studentReport=students.map(s=>{ const sLogs=attLogs.filter(l=>l.studentId===s.id); const present=sLogs.filter(l=>l.status==="present").length; const absent=sLogs.filter(l=>l.status==="absent").length; const late=sLogs.filter(l=>l.status==="late").length; const total=sLogs.length; const pct=total>0?Math.round((present/total)*100):0; return {...s,present,absent,late,total,pct}; });
  return <div style={S.page}>
    <div style={{fontSize:"1.1rem",fontWeight:"700",color:C.navy,marginBottom:"16px"}}>✅ حاضری</div>
    <div style={{display:"flex",gap:"8px",marginBottom:"20px"}}>{["today","report"].map(t=><button key={t} onClick={()=>setTab(t)} style={{padding:"8px 18px",borderRadius:"10px",border:"none",cursor:"pointer",fontSize:"0.68rem",fontWeight:tab===t?"700":"400",background:tab===t?`linear-gradient(135deg,${C.gold},${C.goldDark})`:C.white,color:tab===t?C.white:"#888",fontFamily:"inherit"}}>{t==="today"?"آج کی حاضری":"رپورٹ"}</button>)}</div>
    {tab==="today"&&<>
      <div style={{display:"flex",gap:"12px",marginBottom:"20px",flexWrap:"wrap"}}>
        <div style={{background:"#dcfce7",borderRadius:"12px",padding:"12px 20px",textAlign:"center"}}><div style={{fontSize:"1.4rem",fontWeight:"800",color:C.green}}>{counts.present}</div><div style={{fontSize:"0.6rem",color:C.green}}>حاضر</div></div>
        <div style={{background:"#fee2e2",borderRadius:"12px",padding:"12px 20px",textAlign:"center"}}><div style={{fontSize:"1.4rem",fontWeight:"800",color:C.red}}>{counts.absent}</div><div style={{fontSize:"0.6rem",color:C.red}}>غائب</div></div>
        <div style={{background:"#fef3c7",borderRadius:"12px",padding:"12px 20px",textAlign:"center"}}><div style={{fontSize:"1.4rem",fontWeight:"800",color:C.amber}}>{counts.late}</div><div style={{fontSize:"0.6rem",color:C.amber}}>دیر</div></div>
      </div>
      <div style={{display:"flex",gap:"10px",marginBottom:"20px",flexWrap:"wrap"}}>
        <button style={{...S.addBtn,background:`linear-gradient(135deg,${C.green},#15803d)`}} onClick={()=>markAll("present")}>سب حاضر ✅</button>
        <button style={{...S.addBtn,background:`linear-gradient(135deg,${C.red},#b91c1c)`}} onClick={()=>markAll("absent")}>سب غائب ❌</button>
        <button style={S.addBtn} onClick={save}>{saved?"✅ محفوظ ہوگیا!":"💾 محفوظ کریں"}</button>
      </div>
      <div style={S.card}><table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead><tr><th style={S.th}>نام</th><th style={S.th}>ہاؤس</th><th style={S.th}>جماعت</th><th style={S.th}>حاضری</th></tr></thead>
        <tbody>{students.map(s=>{ const h=HOUSES.find(x=>x.id===s.houseId); return <tr key={s.id}>
          <td style={{...S.td,fontWeight:"700"}}>{s.name}</td>
          <td style={S.td}>{h&&<span style={hBadge(h.color,h.light)}>{h.emoji}</span>}</td>
          <td style={S.td}>{s.grade}</td>
          <td style={S.td}><div style={{display:"flex",gap:"6px"}}>{["present","absent","late"].map(status=><button key={status} onClick={()=>setAtt({...att,[s.id]:status})} style={{padding:"5px 10px",borderRadius:"8px",border:"none",cursor:"pointer",fontSize:"0.58rem",fontWeight:"700",background:att[s.id]===status?(status==="present"?C.green:status==="absent"?C.red:C.amber):"#eee",color:att[s.id]===status?C.white:"#aaa"}}>{status==="present"?"✅":status==="absent"?"❌":"⏰"}</button>)}</div></td>
        </tr>; })}</tbody>
      </table></div>
    </>}
    {tab==="report"&&<div style={S.card}><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}>
      <thead><tr><th style={S.th}>نام</th><th style={S.th}>حاضر</th><th style={S.th}>غائب</th><th style={S.th}>فیصد</th></tr></thead>
      <tbody>{studentReport.map(s=><tr key={s.id}>
        <td style={{...S.td,fontWeight:"700"}}>{s.name}</td>
        <td style={{...S.td,color:C.green,fontWeight:"700"}}>{s.present}</td>
        <td style={{...S.td,color:C.red,fontWeight:"700"}}>{s.absent}</td>
        <td style={S.td}><span style={{fontSize:"0.65rem",fontWeight:"700",color:s.pct>=80?C.green:s.pct>=60?C.amber:C.red}}>{s.pct}%</span></td>
      </tr>)}</tbody>
    </table></div></div>}
  </div>;
}

// ===================== FEE MANAGEMENT =====================
function FeeManagement({students,addData}){
  const [fees,setFees]=useState([]); const [show,setShow]=useState(false);
  const [f,setF]=useState({studentId:"",amount:3000,month:"",type:"monthly",status:"pending",notes:""});
  const [q,setQ]=useState(""); const [filterStatus,setFilterStatus]=useState("all");
  useEffect(()=>{ return onSnapshot(query(collection(db,"fees"),orderBy("createdAt","desc"),limit(100)),s=>setFees(s.docs.map(d=>({id:d.id,...d.data()})))); },[]);
  const add=async()=>{ if(!f.studentId)return; await addData("fees",{...f,amount:Number(f.amount)}); setShow(false); setF({studentId:"",amount:3000,month:"",type:"monthly",status:"pending",notes:""}); };
  const markPaid=async(feeId)=>{ await updateDoc(doc(db,"fees",feeId),{status:"paid",paidAt:serverTimestamp()}); };
  const filtered=fees.filter(fee=>{ const st=students.find(s=>s.id===fee.studentId); return (!q||st?.name?.includes(q))&&(filterStatus==="all"||fee.status===filterStatus); });
  const totalDue=fees.reduce((s,f)=>s+(f.amount||0),0); const totalPaid=fees.filter(f=>f.status==="paid").reduce((s,f)=>s+(f.amount||0),0);
  const feeTypes={monthly:"ماہانہ",admission:"داخلہ",exam:"امتحان",transport:"ٹرانسپورٹ",other:"دیگر"};
  return <div style={S.page}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
      <div><div style={{fontSize:"1.1rem",fontWeight:"700",color:C.navy}}>💰 فیس مینجمنٹ</div></div>
      <button style={S.addBtn} onClick={()=>setShow(!show)}>+ نئی فیس</button>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:"14px",marginBottom:"20px"}}>
      {[{c:C.navy,i:"💰",n:`Rs.${(totalDue/1000).toFixed(1)}K`,l:"کل فیس"},{c:C.green,i:"✅",n:`Rs.${(totalPaid/1000).toFixed(1)}K`,l:"وصول"},{c:C.red,i:"⏳",n:`Rs.${((totalDue-totalPaid)/1000).toFixed(1)}K`,l:"باقی"},{c:C.amber,i:"📋",n:fees.filter(f=>f.status==="pending").length,l:"زیر التواء"}].map((x,i)=><div key={i} style={{background:`linear-gradient(135deg,${x.c}12,${x.c}05)`,borderRadius:"16px",padding:"16px",border:`2px solid ${x.c}20`,textAlign:"center"}}><div style={{fontSize:"1.3rem"}}>{x.i}</div><div style={{fontSize:"1.4rem",fontWeight:"900",color:x.c}}>{x.n}</div><div style={{fontSize:"0.6rem",color:"#888",marginTop:"2px"}}>{x.l}</div></div>)}
    </div>
    {show&&<div style={{...S.card,marginBottom:"20px",background:`linear-gradient(135deg,${C.goldLight},#fdf8ee)`}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>طالب علم *</label><select style={S.inpSm} value={f.studentId} onChange={e=>setF({...f,studentId:e.target.value})}><option value="">-- منتخب کریں --</option>{students.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>رقم</label><input style={{...S.inpSm,direction:"ltr"}} type="number" value={f.amount} onChange={e=>setF({...f,amount:e.target.value})}/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>قسم</label><select style={S.inpSm} value={f.type} onChange={e=>setF({...f,type:e.target.value})}>{Object.entries(feeTypes).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>مہینہ</label><input style={{...S.inpSm,direction:"ltr"}} type="month" value={f.month} onChange={e=>setF({...f,month:e.target.value})}/></div>
      </div>
      <button style={S.saveBtn} onClick={add}>✅ محفوظ کریں</button>
    </div>}
    <div style={{display:"flex",gap:"8px",marginBottom:"16px",flexWrap:"wrap"}}>
      <input style={{...S.inpSm,maxWidth:"200px"}} placeholder="🔍 نام..." value={q} onChange={e=>setQ(e.target.value)}/>
      {["all","pending","paid"].map(s=><button key={s} onClick={()=>setFilterStatus(s)} style={{padding:"8px 14px",borderRadius:"10px",border:"none",cursor:"pointer",fontSize:"0.62rem",fontWeight:filterStatus===s?"700":"400",background:filterStatus===s?`linear-gradient(135deg,${C.gold},${C.goldDark})`:C.white,color:filterStatus===s?C.white:"#888",fontFamily:"inherit"}}>{s==="all"?"سب":s==="pending"?"باقی":"ادا"}</button>)}
    </div>
    <div style={S.card}><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}>
      <thead><tr><th style={S.th}>طالب علم</th><th style={S.th}>قسم</th><th style={S.th}>مہینہ</th><th style={S.th}>رقم</th><th style={S.th}>حال</th><th style={S.th}>عمل</th></tr></thead>
      <tbody>{filtered.map(fee=>{ const st=students.find(s=>s.id===fee.studentId); return <tr key={fee.id}>
        <td style={{...S.td,fontWeight:"700"}}>{st?.name||"—"}</td><td style={S.td}>{feeTypes[fee.type]||fee.type}</td>
        <td style={{...S.td,fontFamily:"monospace",direction:"ltr",fontSize:"0.6rem"}}>{fee.month||"—"}</td>
        <td style={{...S.td,fontWeight:"700"}}>Rs. {(fee.amount||0).toLocaleString()}</td>
        <td style={S.td}><span style={{padding:"4px 10px",borderRadius:"20px",fontSize:"0.58rem",fontWeight:"700",background:fee.status==="paid"?"#dcfce7":"#fef3c7",color:fee.status==="paid"?C.green:C.amber}}>{fee.status==="paid"?"✅ ادا":"⏳ باقی"}</span></td>
        <td style={S.td}>{fee.status==="pending"&&<button onClick={()=>markPaid(fee.id)} style={{...S.saveBtn,padding:"5px 12px",fontSize:"0.58rem"}}>ادا ✓</button>}</td>
      </tr>; })}{filtered.length===0&&<tr><td colSpan={6} style={{...S.td,textAlign:"center",color:"#bbb",padding:"40px"}}>کوئی ریکارڈ نہیں</td></tr>}</tbody>
    </table></div></div>
  </div>;
}

// ===================== RESULTS =====================
function Results({students,addData}){
  const [results,setResults]=useState([]); const [show,setShow]=useState(false);
  const [f,setF]=useState({studentId:"",subject:"",examType:"monthly",totalMarks:100,obtainedMarks:0,examDate:""});
  const [q,setQ]=useState("");
  useEffect(()=>{ return onSnapshot(query(collection(db,"results"),orderBy("createdAt","desc"),limit(100)),s=>setResults(s.docs.map(d=>({id:d.id,...d.data()})))); },[]);
  const calcGrade=(ob,tot)=>{ const p=Math.round((ob/tot)*100); return p>=90?"A+":p>=80?"A":p>=70?"B":p>=60?"C":p>=50?"D":"F"; };
  const add=async()=>{ if(!f.studentId||!f.subject)return; const pct=Math.round((Number(f.obtainedMarks)/Number(f.totalMarks))*100); const grade=calcGrade(Number(f.obtainedMarks),Number(f.totalMarks)); await addData("results",{...f,obtainedMarks:Number(f.obtainedMarks),totalMarks:Number(f.totalMarks),percentage:pct,grade}); setShow(false); setF({studentId:"",subject:"",examType:"monthly",totalMarks:100,obtainedMarks:0,examDate:""}); };
  const filtered=results.filter(r=>{ const st=students.find(s=>s.id===r.studentId); return !q||st?.name?.includes(q)||r.subject?.includes(q); });
  const gradeColor={"A+":C.green,A:C.green,B:C.abuBakr,C:C.amber,D:C.amber,F:C.red};
  const gradeBg={"A+":"#dcfce7",A:"#dcfce7",B:"#dbeafe",C:"#fef3c7",D:"#fef3c7",F:"#fee2e2"};
  return <div style={S.page}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
      <div style={{fontSize:"1.1rem",fontWeight:"700",color:C.navy}}>📊 نتائج و مارکس</div>
      <button style={S.addBtn} onClick={()=>setShow(!show)}>+ نیا نتیجہ</button>
    </div>
    {show&&<div style={{...S.card,marginBottom:"20px",background:`linear-gradient(135deg,${C.goldLight},#fdf8ee)`}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>طالب علم *</label><select style={S.inpSm} value={f.studentId} onChange={e=>setF({...f,studentId:e.target.value})}><option value="">-- منتخب کریں --</option>{students.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>مضمون *</label><input style={S.inpSm} value={f.subject} onChange={e=>setF({...f,subject:e.target.value})} placeholder="ریاضی، انگریزی..."/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>کل مارکس</label><input style={{...S.inpSm,direction:"ltr"}} type="number" value={f.totalMarks} onChange={e=>setF({...f,totalMarks:e.target.value})}/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>حاصل مارکس</label><input style={{...S.inpSm,direction:"ltr"}} type="number" value={f.obtainedMarks} onChange={e=>setF({...f,obtainedMarks:e.target.value})}/></div>
      </div>
      <button style={S.saveBtn} onClick={add}>✅ محفوظ کریں</button>
    </div>}
    <div style={{marginBottom:"16px"}}><input style={{...S.inpSm,direction:"rtl"}} placeholder="🔍 نام یا مضمون..." value={q} onChange={e=>setQ(e.target.value)}/></div>
    <div style={S.card}><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}>
      <thead><tr><th style={S.th}>طالب علم</th><th style={S.th}>مضمون</th><th style={S.th}>مارکس</th><th style={S.th}>فیصد</th><th style={S.th}>گریڈ</th></tr></thead>
      <tbody>{filtered.map(r=>{ const st=students.find(s=>s.id===r.studentId); const gc=gradeColor[r.grade]||C.gold; return <tr key={r.id}>
        <td style={{...S.td,fontWeight:"700"}}>{st?.name||"—"}</td><td style={S.td}>{r.subject}</td>
        <td style={{...S.td,fontFamily:"monospace",direction:"ltr"}}>{r.obtainedMarks}/{r.totalMarks}</td>
        <td style={S.td}><span style={{fontSize:"0.62rem",fontWeight:"700",color:gc}}>{r.percentage}%</span></td>
        <td style={S.td}><span style={{padding:"4px 10px",borderRadius:"20px",fontSize:"0.65rem",fontWeight:"800",background:gradeBg[r.grade]||"#eee",color:gc}}>{r.grade}</span></td>
      </tr>; })}{filtered.length===0&&<tr><td colSpan={5} style={{...S.td,textAlign:"center",color:"#bbb",padding:"40px"}}>کوئی نتیجہ نہیں</td></tr>}</tbody>
    </table></div></div>
  </div>;
}

// ===================== TIMETABLE =====================
function Timetable(){
  const [selGrade,setSelGrade]=useState("Grade 7"); const [selDay,setSelDay]=useState("Monday");
  const gradeData=TIMETABLE[selGrade]||{}; const dayData=gradeData[selDay]||[];
  const periodColors=["#dbeafe","#dcfce7","#fef3c7","#f3f4f6","#fee2e2","#ede9fe","#fce7f3","#ccfbf1"];
  const periodBorder=[C.abuBakr,C.umar,C.amber,"#6b7280",C.red,C.purple,C.teal,"#0d9488"];
  return <div style={S.page}>
    <div style={{fontSize:"1.1rem",fontWeight:"700",color:C.navy,marginBottom:"20px"}}>🗓️ ٹائم ٹیبل</div>
    <div style={{display:"flex",gap:"8px",marginBottom:"16px",flexWrap:"wrap"}}>{Object.keys(TIMETABLE).map(g=><button key={g} onClick={()=>setSelGrade(g)} style={{padding:"9px 16px",borderRadius:"12px",border:"none",cursor:"pointer",fontSize:"0.68rem",fontWeight:selGrade===g?"700":"400",background:selGrade===g?`linear-gradient(135deg,${C.navy},${C.navyMid})`:C.white,color:selGrade===g?C.white:"#888",fontFamily:"inherit"}}>{g}</button>)}</div>
    <div style={{display:"flex",gap:"8px",marginBottom:"20px",flexWrap:"wrap"}}>{DAYS.map(d=><button key={d} onClick={()=>setSelDay(d)} style={{padding:"9px 16px",borderRadius:"12px",border:"none",cursor:"pointer",fontSize:"0.68rem",fontWeight:selDay===d?"700":"400",background:selDay===d?`linear-gradient(135deg,${C.gold},${C.goldDark})`:C.white,color:selDay===d?C.white:"#888",fontFamily:"inherit"}}>{DAYS_UR[d]}</button>)}</div>
    <div style={S.card}>
      <div style={{fontSize:"0.85rem",fontWeight:"700",color:C.navy,marginBottom:"16px"}}>{selGrade} — {DAYS_UR[selDay]}</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:"12px"}}>
        {dayData.map((period,i)=>{ const isBreak=period.toLowerCase().includes("break"); const isQuran=period.toLowerCase().includes("quran")||period.toLowerCase().includes("hifz"); return <div key={i} style={{padding:"14px 16px",borderRadius:"14px",background:isBreak?"#f5f5f5":isQuran?`linear-gradient(135deg,${C.goldLight},#fdf8ee)`:periodColors[i%periodColors.length],border:`2px solid ${isBreak?"#ddd":isQuran?C.gold:periodBorder[i%periodBorder.length]}30`,position:"relative"}}>
          <div style={{position:"absolute",top:"8px",left:"10px",fontSize:"0.55rem",fontWeight:"800",color:isBreak?"#aaa":isQuran?C.gold:periodBorder[i%periodBorder.length],fontFamily:"monospace"}}>{i===3?"BREAK":`P${i+1}`}</div>
          <div style={{marginTop:"16px",fontSize:"0.75rem",fontWeight:"700",color:isBreak?"#aaa":C.navy}}>{period}</div>
        </div>; })}
      </div>
    </div>
  </div>;
}

// ===================== NOTIFICATIONS =====================
function Notifications({students,addData}){
  const [notifs,setNotifs]=useState([]); const [show,setShow]=useState(false);
  const [f,setF]=useState({title:"",message:"",type:"general",targetHouse:"all",priority:"normal"});
  useEffect(()=>{ return onSnapshot(query(collection(db,"notifications"),orderBy("createdAt","desc"),limit(30)),s=>setNotifs(s.docs.map(d=>({id:d.id,...d.data()})))); },[]);
  const send=async()=>{ if(!f.title||!f.message)return; await addData("notifications",{...f}); setShow(false); setF({title:"",message:"",type:"general",targetHouse:"all",priority:"normal"}); };
  const notifTypes={general:"📢 عام",fee:"💰 فیس",exam:"📝 امتحان",event:"🎭 تقریب",result:"📊 نتیجہ"};
  const priorityC={urgent:C.red,high:C.amber,normal:C.abuBakr,low:"#888"};
  return <div style={S.page}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
      <div style={{fontSize:"1.1rem",fontWeight:"700",color:C.navy}}>📱 اطلاعات</div>
      <button style={S.addBtn} onClick={()=>setShow(!show)}>+ نئی اطلاع</button>
    </div>
    {show&&<div style={{...S.card,marginBottom:"20px",background:`linear-gradient(135deg,${C.goldLight},#fdf8ee)`}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div style={{gridColumn:"1/-1"}}><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>عنوان *</label><input style={S.inpSm} value={f.title} onChange={e=>setF({...f,title:e.target.value})} placeholder="اطلاع کا عنوان..."/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>قسم</label><select style={S.inpSm} value={f.type} onChange={e=>setF({...f,type:e.target.value})}>{Object.entries(notifTypes).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>ترجیح</label><select style={S.inpSm} value={f.priority} onChange={e=>setF({...f,priority:e.target.value})}><option value="normal">عام</option><option value="high">اہم</option><option value="urgent">فوری</option></select></div>
        <div style={{gridColumn:"1/-1"}}><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>پیغام *</label><textarea style={{...S.inpSm,minHeight:"80px",resize:"vertical"}} value={f.message} onChange={e=>setF({...f,message:e.target.value})} placeholder="پیغام یہاں لکھیں..."/></div>
      </div>
      <button style={S.saveBtn} onClick={send}>📤 بھیجیں</button>
    </div>}
    <div style={{display:"flex",flexDirection:"column",gap:"14px"}}>
      {notifs.map(n=>{ const pc=priorityC[n.priority]||C.abuBakr; return <div key={n.id} style={{...S.card,borderRight:`4px solid ${pc}`,padding:"18px 20px"}}>
        <div style={{fontSize:"0.85rem",fontWeight:"700",color:C.navy,marginBottom:"6px"}}>{notifTypes[n.type]||"📢"} {n.title}</div>
        <div style={{fontSize:"0.68rem",color:"#666",lineHeight:"1.6"}}>{n.message}</div>
      </div>; })}
      {notifs.length===0&&<div style={{...S.card,textAlign:"center",color:"#bbb",padding:"60px"}}>ابھی کوئی اطلاع نہیں</div>}
    </div>
  </div>;
}

// ===================== EVENTS =====================
function Events({addData,houses,updateHousePoints}){
  const [events,setEvents]=useState([]); const [show,setShow]=useState(false);
  const [f,setF]=useState({name:"",type:"competition",houseId:"abuBakr",points:0,month:1,notes:""});
  useEffect(()=>{ return onSnapshot(query(collection(db,"events"),orderBy("createdAt","desc"),limit(20)),s=>setEvents(s.docs.map(d=>({id:d.id,...d.data()})))); },[]);
  const add=async()=>{ if(!f.name)return; const pts=Number(f.points); await addData("events",{...f,points:pts}); if(pts>0) await updateHousePoints(f.houseId,pts); setShow(false); setF({name:"",type:"competition",houseId:"abuBakr",points:0,month:1,notes:""}); };
  const evTypes={"competition":"🏆 مقابلہ","sports":"⚽ کھیل","academic":"📚 تعلیمی","cultural":"🎭 ثقافتی","service":"🌱 سماجی"};
  return <div style={S.page}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"24px"}}>
      <div style={{fontSize:"1.1rem",fontWeight:"700",color:C.navy}}>🎭 ایونٹس</div>
      <button style={S.addBtn} onClick={()=>setShow(!show)}>+ نیا ایونٹ</button>
    </div>
    {show&&<div style={{...S.card,marginBottom:"20px",background:`linear-gradient(135deg,${C.goldLight},#fdf8ee)`}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>ایونٹ کا نام</label><input style={S.inpSm} value={f.name} onChange={e=>setF({...f,name:e.target.value})} placeholder="نعت مقابلہ..."/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>قسم</label><select style={S.inpSm} value={f.type} onChange={e=>setF({...f,type:e.target.value})}>{Object.entries(evTypes).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>فاتح ہاؤس</label><select style={S.inpSm} value={f.houseId} onChange={e=>setF({...f,houseId:e.target.value})}>{HOUSES.map(h=><option key={h.id} value={h.id}>{h.emoji} {h.nameEn}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>پوائنٹس</label><input style={{...S.inpSm,direction:"ltr"}} type="number" value={f.points} onChange={e=>setF({...f,points:e.target.value})}/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>نوٹس</label><input style={S.inpSm} value={f.notes} onChange={e=>setF({...f,notes:e.target.value})} placeholder="تفصیل..."/></div>
      </div>
      <button style={S.saveBtn} onClick={add}>✅ محفوظ کریں</button>
    </div>}
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:"16px"}}>
      {events.map(ev=>{ const h=HOUSES.find(x=>x.id===ev.houseId)||{}; return <div key={ev.id} style={{...S.card,borderRight:`4px solid ${h.color||C.gold}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"10px"}}>
          <div style={{fontSize:"0.85rem",fontWeight:"700",color:C.navy}}>{ev.name}</div>
          <span style={{fontSize:"0.65rem",background:`linear-gradient(135deg,${C.gold},${C.goldDark})`,color:C.white,padding:"4px 10px",borderRadius:"20px",fontWeight:"700"}}>+{ev.points}</span>
        </div>
        <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}><span style={hBadge(h.color,h.light)}>{h.emoji} {h.nameEn}</span><span style={hBadge(C.navy,C.abuBakrLight)}>{evTypes[ev.type]||ev.type}</span></div>
        {ev.notes&&<div style={{fontSize:"0.6rem",color:"#888",marginTop:"8px"}}>{ev.notes}</div>}
      </div>; })}
      {events.length===0&&<div style={{...S.card,textAlign:"center",color:"#bbb",padding:"60px"}}>ابھی کوئی ایونٹ نہیں</div>}
    </div>
  </div>;
}

// ===================== LIBRARY =====================
function Library({students,addData}){
  const [books,setBooks]=useState([]); const [issues,setIssues]=useState([]); const [show,setShow]=useState(false); const [tab,setTab]=useState("books");
  const [f,setF]=useState({title:"",author:"",category:"Islamic",totalCopies:1,available:1});
  const [issueF,setIssueF]=useState({bookId:"",studentId:"",dueDate:""});
  useEffect(()=>{
    const u1=onSnapshot(collection(db,"library_books"),s=>setBooks(s.docs.map(d=>({id:d.id,...d.data()}))));
    const u2=onSnapshot(query(collection(db,"library_issues"),orderBy("createdAt","desc"),limit(50)),s=>setIssues(s.docs.map(d=>({id:d.id,...d.data()}))));
    return()=>{u1();u2();};
  },[]);
  const addBook=async()=>{ if(!f.title)return; await addData("library_books",{...f,totalCopies:Number(f.totalCopies),available:Number(f.totalCopies)}); setShow(false); setF({title:"",author:"",category:"Islamic",totalCopies:1,available:1}); };
  const issueBook=async()=>{ if(!issueF.bookId||!issueF.studentId)return; await addData("library_issues",{...issueF,status:"issued",issuedDate:new Date().toISOString().split("T")[0]}); await updateDoc(doc(db,"library_books",issueF.bookId),{available:Math.max(0,(books.find(b=>b.id===issueF.bookId)?.available||1)-1)}); setIssueF({bookId:"",studentId:"",dueDate:""}); };
  const returnBook=async(issue)=>{ await updateDoc(doc(db,"library_issues",issue.id),{status:"returned",returnedDate:new Date().toISOString().split("T")[0]}); await updateDoc(doc(db,"library_books",issue.bookId),{available:(books.find(b=>b.id===issue.bookId)?.available||0)+1}); };
  const cats=["Islamic","Quran","Hadith","Science","Math","Urdu","English","History","Other"];
  const overdue=issues.filter(i=>i.status==="issued"&&i.dueDate&&new Date(i.dueDate)<new Date());
  return <div style={S.page}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
      <div><div style={{fontSize:"1.1rem",fontWeight:"700",color:C.navy}}>📚 لائبریری</div></div>
      <button style={S.addBtn} onClick={()=>setShow(!show)}>+ نئی کتاب</button>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:"12px",marginBottom:"20px"}}>
      {[{c:C.abuBakr,i:"📚",n:books.length,l:"کل کتابیں"},{c:C.green,i:"✅",n:issues.filter(i=>i.status==="issued").length,l:"جاری"},{c:C.red,i:"⚠️",n:overdue.length,l:"واجب الواپسی"},{c:C.gold,i:"📖",n:books.reduce((s,b)=>s+(b.available||0),0),l:"دستیاب"}].map((x,i)=><div key={i} style={{background:`linear-gradient(135deg,${x.c}12,${x.c}05)`,borderRadius:"16px",padding:"16px",border:`2px solid ${x.c}20`,textAlign:"center"}}><div style={{fontSize:"1.3rem"}}>{x.i}</div><div style={{fontSize:"1.4rem",fontWeight:"900",color:x.c}}>{x.n}</div><div style={{fontSize:"0.6rem",color:"#888"}}>{x.l}</div></div>)}
    </div>
    {show&&<div style={{...S.card,marginBottom:"20px",background:`linear-gradient(135deg,${C.goldLight},#fdf8ee)`}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>کتاب کا نام *</label><input style={S.inpSm} value={f.title} onChange={e=>setF({...f,title:e.target.value})} placeholder="کتاب کا نام..."/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>مصنف</label><input style={S.inpSm} value={f.author} onChange={e=>setF({...f,author:e.target.value})} placeholder="مصنف کا نام..."/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>زمرہ</label><select style={S.inpSm} value={f.category} onChange={e=>setF({...f,category:e.target.value})}>{cats.map(c=><option key={c}>{c}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>کاپیاں</label><input style={{...S.inpSm,direction:"ltr"}} type="number" value={f.totalCopies} onChange={e=>setF({...f,totalCopies:e.target.value})}/></div>
      </div>
      <button style={S.saveBtn} onClick={addBook}>✅ محفوظ کریں</button>
    </div>}
    <div style={{display:"flex",gap:"8px",marginBottom:"16px"}}>{[["books","📚 کتابیں"],["issue","📤 جاری کریں"],["issued","📋 جاری شدہ"]].map(([t,l])=><button key={t} onClick={()=>setTab(t)} style={{padding:"8px 14px",borderRadius:"10px",border:"none",cursor:"pointer",fontSize:"0.65rem",fontWeight:tab===t?"700":"400",background:tab===t?`linear-gradient(135deg,${C.gold},${C.goldDark})`:C.white,color:tab===t?C.white:"#888",fontFamily:"inherit"}}>{l}</button>)}</div>
    {tab==="books"&&<div style={S.card}><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}>
      <thead><tr><th style={S.th}>کتاب</th><th style={S.th}>مصنف</th><th style={S.th}>زمرہ</th><th style={S.th}>کل</th><th style={S.th}>دستیاب</th></tr></thead>
      <tbody>{books.map(b=><tr key={b.id}><td style={{...S.td,fontWeight:"700"}}>{b.title}</td><td style={S.td}>{b.author||"—"}</td><td style={S.td}>{b.category}</td><td style={S.td}>{b.totalCopies}</td><td style={{...S.td,fontWeight:"700",color:(b.available||0)>0?C.green:C.red}}>{b.available||0}</td></tr>)}
      {books.length===0&&<tr><td colSpan={5} style={{...S.td,textAlign:"center",color:"#bbb",padding:"40px"}}>کوئی کتاب نہیں</td></tr>}</tbody>
    </table></div></div>}
    {tab==="issue"&&<div style={{...S.card,background:`linear-gradient(135deg,${C.goldLight},#fdf8ee)`}}>
      <div style={{fontSize:"0.85rem",fontWeight:"700",color:C.navy,marginBottom:"14px"}}>📤 کتاب جاری کریں</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>کتاب *</label><select style={S.inpSm} value={issueF.bookId} onChange={e=>setIssueF({...issueF,bookId:e.target.value})}><option value="">-- منتخب کریں --</option>{books.filter(b=>(b.available||0)>0).map(b=><option key={b.id} value={b.id}>{b.title} ({b.available})</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>طالب علم *</label><select style={S.inpSm} value={issueF.studentId} onChange={e=>setIssueF({...issueF,studentId:e.target.value})}><option value="">-- منتخب کریں --</option>{students.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>واپسی تاریخ</label><input style={{...S.inpSm,direction:"ltr"}} type="date" value={issueF.dueDate} onChange={e=>setIssueF({...issueF,dueDate:e.target.value})}/></div>
      </div>
      <button style={S.saveBtn} onClick={issueBook}>📤 جاری کریں</button>
    </div>}
    {tab==="issued"&&<div style={S.card}><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}>
      <thead><tr><th style={S.th}>طالب علم</th><th style={S.th}>کتاب</th><th style={S.th}>جاری تاریخ</th><th style={S.th}>واپسی</th><th style={S.th}>حال</th><th style={S.th}>عمل</th></tr></thead>
      <tbody>{issues.map(i=>{ const st=students.find(s=>s.id===i.studentId); const bk=books.find(b=>b.id===i.bookId); const od=i.status==="issued"&&i.dueDate&&new Date(i.dueDate)<new Date(); return <tr key={i.id}>
        <td style={{...S.td,fontWeight:"700"}}>{st?.name||"—"}</td><td style={S.td}>{bk?.title||"—"}</td>
        <td style={{...S.td,fontFamily:"monospace",direction:"ltr",fontSize:"0.6rem"}}>{i.issuedDate}</td>
        <td style={{...S.td,fontFamily:"monospace",direction:"ltr",fontSize:"0.6rem",color:od?C.red:"inherit"}}>{i.dueDate||"—"}</td>
        <td style={S.td}><span style={{padding:"3px 8px",borderRadius:"20px",fontSize:"0.55rem",fontWeight:"700",background:i.status==="returned"?"#dcfce7":od?"#fee2e2":"#fef3c7",color:i.status==="returned"?C.green:od?C.red:C.amber}}>{i.status==="returned"?"واپس":od?"تاخیر":"جاری"}</span></td>
        <td style={S.td}>{i.status==="issued"&&<button onClick={()=>returnBook(i)} style={{...S.saveBtn,padding:"4px 10px",fontSize:"0.55rem"}}>واپس ✓</button>}</td>
      </tr>; })}{issues.length===0&&<tr><td colSpan={6} style={{...S.td,textAlign:"center",color:"#bbb",padding:"40px"}}>کوئی ریکارڈ نہیں</td></tr>}</tbody>
    </table></div></div>}
  </div>;
}

// ===================== SALARY =====================
function SalaryManagement({teachers,addData}){
  const [salaries,setSalaries]=useState([]); const [show,setShow]=useState(false);
  const [f,setF]=useState({teacherId:"",month:"",basicSalary:25000,allowances:5000,deductions:0,notes:""});
  useEffect(()=>{ return onSnapshot(query(collection(db,"salaries"),orderBy("createdAt","desc"),limit(50)),s=>setSalaries(s.docs.map(d=>({id:d.id,...d.data()})))); },[]);
  const add=async()=>{ if(!f.teacherId||!f.month)return; const net=Number(f.basicSalary)+Number(f.allowances)-Number(f.deductions); await addData("salaries",{...f,basicSalary:Number(f.basicSalary),allowances:Number(f.allowances),deductions:Number(f.deductions),netSalary:net,status:"paid"}); setShow(false); setF({teacherId:"",month:"",basicSalary:25000,allowances:5000,deductions:0,notes:""}); };
  const net=Number(f.basicSalary)+Number(f.allowances)-Number(f.deductions);
  const teacherSummary=teachers.map(t=>{ const tSal=salaries.filter(s=>s.teacherId===t.id); const totalPaid=tSal.reduce((s,x)=>s+(x.netSalary||0),0); return {...t,totalPaid,months:tSal.length}; });
  return <div style={S.page}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
      <div><div style={{fontSize:"1.1rem",fontWeight:"700",color:C.navy}}>💼 تنخواہ مینجمنٹ</div></div>
      <button style={S.addBtn} onClick={()=>setShow(!show)}>+ تنخواہ درج کریں</button>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:"14px",marginBottom:"20px"}}>
      {teacherSummary.map(t=><div key={t.id} style={S.card}>
        <div style={{fontWeight:"700",color:C.navy,marginBottom:"4px"}}>{t.name}</div>
        <div style={{fontSize:"0.62rem",color:"#888",marginBottom:"8px"}}>{t.subject}</div>
        <div style={{fontSize:"1.2rem",fontWeight:"900",color:C.green}}>Rs. {t.totalPaid.toLocaleString()}</div>
        <div style={{fontSize:"0.6rem",color:"#888"}}>{t.months} ماہ ادا شدہ</div>
      </div>)}
    </div>
    {show&&<div style={{...S.card,marginBottom:"20px",background:`linear-gradient(135deg,${C.goldLight},#fdf8ee)`}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>استاد *</label><select style={S.inpSm} value={f.teacherId} onChange={e=>setF({...f,teacherId:e.target.value})}><option value="">-- منتخب کریں --</option>{teachers.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>مہینہ *</label><input style={{...S.inpSm,direction:"ltr"}} type="month" value={f.month} onChange={e=>setF({...f,month:e.target.value})}/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>بنیادی تنخواہ</label><input style={{...S.inpSm,direction:"ltr"}} type="number" value={f.basicSalary} onChange={e=>setF({...f,basicSalary:e.target.value})}/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>الاؤنسز</label><input style={{...S.inpSm,direction:"ltr"}} type="number" value={f.allowances} onChange={e=>setF({...f,allowances:e.target.value})}/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>کٹوتی</label><input style={{...S.inpSm,direction:"ltr"}} type="number" value={f.deductions} onChange={e=>setF({...f,deductions:e.target.value})}/></div>
      </div>
      <div style={{background:C.white,padding:"12px 16px",borderRadius:"10px",marginBottom:"12px",textAlign:"center"}}>
        <div style={{fontSize:"0.62rem",color:"#888"}}>خالص تنخواہ</div>
        <div style={{fontSize:"1.5rem",fontWeight:"900",color:C.green}}>Rs. {net.toLocaleString()}</div>
      </div>
      <button style={S.saveBtn} onClick={add}>✅ محفوظ کریں</button>
    </div>}
    <div style={S.card}><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}>
      <thead><tr><th style={S.th}>استاد</th><th style={S.th}>مہینہ</th><th style={S.th}>بنیادی</th><th style={S.th}>الاؤنس</th><th style={S.th}>کٹوتی</th><th style={S.th}>خالص</th></tr></thead>
      <tbody>{salaries.map(s=>{ const t=teachers.find(x=>x.id===s.teacherId); return <tr key={s.id}>
        <td style={{...S.td,fontWeight:"700"}}>{t?.name||"—"}</td>
        <td style={{...S.td,fontFamily:"monospace",direction:"ltr",fontSize:"0.6rem"}}>{s.month}</td>
        <td style={S.td}>Rs. {(s.basicSalary||0).toLocaleString()}</td>
        <td style={{...S.td,color:C.green}}>+{(s.allowances||0).toLocaleString()}</td>
        <td style={{...S.td,color:C.red}}>-{(s.deductions||0).toLocaleString()}</td>
        <td style={{...S.td,fontWeight:"900",color:C.green,fontSize:"0.78rem"}}>Rs. {(s.netSalary||0).toLocaleString()}</td>
      </tr>; })}{salaries.length===0&&<tr><td colSpan={6} style={{...S.td,textAlign:"center",color:"#bbb",padding:"40px"}}>کوئی ریکارڈ نہیں</td></tr>}</tbody>
    </table></div></div>
  </div>;
}

// ===================== EXAM SCHEDULE =====================
function ExamSchedule({addData}){
  const [exams,setExams]=useState([]); const [show,setShow]=useState(false);
  const [f,setF]=useState({subject:"",grade:"Grade 7",examDate:"",startTime:"09:00",duration:120,room:"Room 1",examType:"monthly"});
  useEffect(()=>{ return onSnapshot(query(collection(db,"exam_schedule"),orderBy("examDate","asc"),limit(50)),s=>setExams(s.docs.map(d=>({id:d.id,...d.data()})))); },[]);
  const add=async()=>{ if(!f.subject||!f.examDate)return; await addData("exam_schedule",{...f,duration:Number(f.duration)}); setShow(false); setF({subject:"",grade:"Grade 7",examDate:"",startTime:"09:00",duration:120,room:"Room 1",examType:"monthly"}); };
  const today=new Date().toISOString().split("T")[0];
  const upcoming=exams.filter(e=>e.examDate>=today);
  const past=exams.filter(e=>e.examDate<today);
  const examTypes={monthly:"ماہانہ",midterm:"نیم سالانہ",annual:"سالانہ",quiz:"کوئز",hifz:"حفظ"};
  return <div style={S.page}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
      <div><div style={{fontSize:"1.1rem",fontWeight:"700",color:C.navy}}>📝 امتحان شیڈول</div></div>
      <button style={S.addBtn} onClick={()=>setShow(!show)}>+ نیا امتحان</button>
    </div>
    {upcoming.length>0&&<div style={{background:"#fef3c7",border:`2px solid ${C.amber}`,borderRadius:"14px",padding:"14px 18px",marginBottom:"20px"}}>
      <div style={{fontSize:"0.75rem",fontWeight:"700",color:C.amber,marginBottom:"8px"}}>📅 آنے والے امتحانات ({upcoming.length})</div>
      {upcoming.slice(0,3).map(e=><div key={e.id} style={{fontSize:"0.65rem",color:"#555",marginBottom:"4px"}}>• {e.subject} — {e.grade} — {e.examDate} {e.startTime}</div>)}
    </div>}
    {show&&<div style={{...S.card,marginBottom:"20px",background:`linear-gradient(135deg,${C.goldLight},#fdf8ee)`}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>مضمون *</label><input style={S.inpSm} value={f.subject} onChange={e=>setF({...f,subject:e.target.value})} placeholder="ریاضی، انگریزی..."/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>جماعت</label><select style={S.inpSm} value={f.grade} onChange={e=>setF({...f,grade:e.target.value})}>{["Grade 6","Grade 7","Grade 8","Grade 9","All Grades"].map(g=><option key={g}>{g}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>تاریخ *</label><input style={{...S.inpSm,direction:"ltr"}} type="date" value={f.examDate} onChange={e=>setF({...f,examDate:e.target.value})}/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>وقت</label><input style={{...S.inpSm,direction:"ltr"}} type="time" value={f.startTime} onChange={e=>setF({...f,startTime:e.target.value})}/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>دورانیہ (منٹ)</label><input style={{...S.inpSm,direction:"ltr"}} type="number" value={f.duration} onChange={e=>setF({...f,duration:e.target.value})}/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>کمرہ</label><input style={S.inpSm} value={f.room} onChange={e=>setF({...f,room:e.target.value})} placeholder="Room 1..."/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>قسم</label><select style={S.inpSm} value={f.examType} onChange={e=>setF({...f,examType:e.target.value})}>{Object.entries(examTypes).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></div>
      </div>
      <button style={S.saveBtn} onClick={add}>✅ محفوظ کریں</button>
    </div>}
    <div style={S.card}><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}>
      <thead><tr><th style={S.th}>مضمون</th><th style={S.th}>جماعت</th><th style={S.th}>تاریخ</th><th style={S.th}>وقت</th><th style={S.th}>دورانیہ</th><th style={S.th}>کمرہ</th><th style={S.th}>حال</th></tr></thead>
      <tbody>{exams.map(e=>{ const isUp=e.examDate>=today; return <tr key={e.id} style={{background:isUp?"#fffdf8":undefined}}>
        <td style={{...S.td,fontWeight:"700"}}>{e.subject}</td><td style={S.td}>{e.grade}</td>
        <td style={{...S.td,fontFamily:"monospace",direction:"ltr",fontSize:"0.6rem",fontWeight:isUp?"700":"400",color:isUp?C.gold:"#aaa"}}>{e.examDate}</td>
        <td style={{...S.td,fontFamily:"monospace",direction:"ltr",fontSize:"0.6rem"}}>{e.startTime}</td>
        <td style={S.td}>{e.duration} min</td><td style={S.td}>{e.room}</td>
        <td style={S.td}><span style={{padding:"3px 8px",borderRadius:"20px",fontSize:"0.55rem",fontWeight:"700",background:isUp?"#fef3c7":"#f3f4f6",color:isUp?C.amber:"#888"}}>{isUp?"آنے والا":"گزرا"}</span></td>
      </tr>; })}{exams.length===0&&<tr><td colSpan={7} style={{...S.td,textAlign:"center",color:"#bbb",padding:"40px"}}>کوئی امتحان شیڈول نہیں</td></tr>}</tbody>
    </table></div></div>
  </div>;
}

// ===================== TRANSPORT =====================
function Transport({students,addData}){
  const [routes,setRoutes]=useState([]); const [assignments,setAssignments]=useState([]); const [show,setShow]=useState(false); const [tab,setTab]=useState("routes");
  const [f,setF]=useState({routeName:"",driverName:"",vehicleNo:"",capacity:20,stops:"",timing:""});
  const [assignF,setAssignF]=useState({studentId:"",routeId:""});
  useEffect(()=>{
    const u1=onSnapshot(collection(db,"transport_routes"),s=>setRoutes(s.docs.map(d=>({id:d.id,...d.data()}))));
    const u2=onSnapshot(collection(db,"transport_assignments"),s=>setAssignments(s.docs.map(d=>({id:d.id,...d.data()}))));
    return()=>{u1();u2();};
  },[]);
  const addRoute=async()=>{ if(!f.routeName)return; await addData("transport_routes",{...f,capacity:Number(f.capacity)}); setShow(false); setF({routeName:"",driverName:"",vehicleNo:"",capacity:20,stops:"",timing:""}); };
  const assign=async()=>{ if(!assignF.studentId||!assignF.routeId)return; await addData("transport_assignments",{...assignF}); setAssignF({studentId:"",routeId:""}); };
  const getOccupancy=(routeId)=>assignments.filter(a=>a.routeId===routeId).length;
  return <div style={S.page}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
      <div><div style={{fontSize:"1.1rem",fontWeight:"700",color:C.navy}}>🚌 ٹرانسپورٹ</div></div>
      <button style={S.addBtn} onClick={()=>setShow(!show)}>+ نیا روٹ</button>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:"14px",marginBottom:"20px"}}>
      {routes.map(r=>{ const occ=getOccupancy(r.id); return <div key={r.id} style={S.card}>
        <div style={{fontSize:"1.5rem",marginBottom:"6px"}}>🚌</div>
        <div style={{fontWeight:"700",color:C.navy,marginBottom:"4px"}}>{r.routeName}</div>
        <div style={{fontSize:"0.62rem",color:"#888",marginBottom:"8px"}}>👤 {r.driverName} • {r.vehicleNo}</div>
        {pBar(occ,r.capacity||20,C.abuBakr)}
        <div style={{fontSize:"0.6rem",color:"#888",marginTop:"4px"}}>{occ}/{r.capacity} طلبا</div>
        {r.timing&&<div style={{fontSize:"0.6rem",color:C.gold,marginTop:"4px"}}>⏰ {r.timing}</div>}
      </div>; })}
    </div>
    {show&&<div style={{...S.card,marginBottom:"20px",background:`linear-gradient(135deg,${C.goldLight},#fdf8ee)`}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>روٹ کا نام *</label><input style={S.inpSm} value={f.routeName} onChange={e=>setF({...f,routeName:e.target.value})} placeholder="سوات — مدین روٹ..."/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>ڈرائیور</label><input style={S.inpSm} value={f.driverName} onChange={e=>setF({...f,driverName:e.target.value})} placeholder="ڈرائیور کا نام..."/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>گاڑی نمبر</label><input style={{...S.inpSm,direction:"ltr"}} value={f.vehicleNo} onChange={e=>setF({...f,vehicleNo:e.target.value})} placeholder="ABC-123"/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>گنجائش</label><input style={{...S.inpSm,direction:"ltr"}} type="number" value={f.capacity} onChange={e=>setF({...f,capacity:e.target.value})}/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>وقت</label><input style={S.inpSm} value={f.timing} onChange={e=>setF({...f,timing:e.target.value})} placeholder="صبح 7:30، واپسی 2:00"/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>اسٹاپس</label><input style={S.inpSm} value={f.stops} onChange={e=>setF({...f,stops:e.target.value})} placeholder="مین بازار، پل، مسجد..."/></div>
      </div>
      <button style={S.saveBtn} onClick={addRoute}>✅ محفوظ کریں</button>
    </div>}
    <div style={{display:"flex",gap:"8px",marginBottom:"16px"}}>{[["routes","🚌 روٹس"],["assign","👥 طالب علم شامل کریں"]].map(([t,l])=><button key={t} onClick={()=>setTab(t)} style={{padding:"8px 14px",borderRadius:"10px",border:"none",cursor:"pointer",fontSize:"0.65rem",fontWeight:tab===t?"700":"400",background:tab===t?`linear-gradient(135deg,${C.gold},${C.goldDark})`:C.white,color:tab===t?C.white:"#888",fontFamily:"inherit"}}>{l}</button>)}</div>
    {tab==="assign"&&<div style={{...S.card,marginBottom:"16px",background:`linear-gradient(135deg,${C.goldLight},#fdf8ee)`}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>طالب علم</label><select style={S.inpSm} value={assignF.studentId} onChange={e=>setAssignF({...assignF,studentId:e.target.value})}><option value="">-- منتخب کریں --</option>{students.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>روٹ</label><select style={S.inpSm} value={assignF.routeId} onChange={e=>setAssignF({...assignF,routeId:e.target.value})}><option value="">-- منتخب کریں --</option>{routes.map(r=><option key={r.id} value={r.id}>{r.routeName}</option>)}</select></div>
      </div>
      <button style={S.saveBtn} onClick={assign}>✅ شامل کریں</button>
    </div>}
    {tab==="routes"&&<div style={S.card}><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}>
      <thead><tr><th style={S.th}>روٹ</th><th style={S.th}>ڈرائیور</th><th style={S.th}>گاڑی</th><th style={S.th}>گنجائش</th><th style={S.th}>مسافر</th></tr></thead>
      <tbody>{routes.map(r=>{ const occ=getOccupancy(r.id); return <tr key={r.id}>
        <td style={{...S.td,fontWeight:"700"}}>{r.routeName}</td><td style={S.td}>{r.driverName||"—"}</td>
        <td style={{...S.td,fontFamily:"monospace",direction:"ltr",fontSize:"0.6rem"}}>{r.vehicleNo||"—"}</td>
        <td style={S.td}>{r.capacity}</td>
        <td style={S.td}><span style={{color:occ>=r.capacity?C.red:C.green,fontWeight:"700"}}>{occ}/{r.capacity}</span></td>
      </tr>; })}{routes.length===0&&<tr><td colSpan={5} style={{...S.td,textAlign:"center",color:"#bbb",padding:"40px"}}>کوئی روٹ نہیں</td></tr>}</tbody>
    </table></div></div>}
  </div>;
}

// ===================== NOTICE BOARD =====================
function NoticeBoard({addData,user}){
  const [notices,setNotices]=useState([]); const [show,setShow]=useState(false);
  const [f,setF]=useState({title:"",content:"",category:"general",priority:"normal",pinned:false,expiryDate:""});
  useEffect(()=>{ return onSnapshot(query(collection(db,"notices"),orderBy("createdAt","desc"),limit(30)),s=>setNotices(s.docs.map(d=>({id:d.id,...d.data()}))));  },[]);
  const add=async()=>{ if(!f.title||!f.content)return; await addData("notices",{...f}); setShow(false); setF({title:"",content:"",category:"general",priority:"normal",pinned:false,expiryDate:""}); };
  const catConfig={general:{c:C.abuBakr,bg:"#dbeafe",i:"📢",l:"عام"},academic:{c:C.green,bg:"#dcfce7",i:"📚",l:"تعلیمی"},exam:{c:C.amber,bg:"#fef3c7",i:"📝",l:"امتحان"},event:{c:C.purple,bg:"#ede9fe",i:"🎭",l:"تقریب"},urgent:{c:C.red,bg:"#fee2e2",i:"🚨",l:"فوری"},hifz:{c:C.gold,bg:C.goldLight,i:"📖",l:"حفظ"}};
  const pinned=notices.filter(n=>n.pinned); const regular=notices.filter(n=>!n.pinned);
  return <div style={S.page}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
      <div><div style={{fontSize:"1.1rem",fontWeight:"700",color:C.navy}}>📌 نوٹس بورڈ</div><div style={{fontSize:"0.62rem",color:"#888",marginTop:"2px"}}>اطلاعات، احکامات، اعلانات</div></div>
      <button style={S.addBtn} onClick={()=>setShow(!show)}>+ نیا نوٹس</button>
    </div>
    {show&&<div style={{...S.card,marginBottom:"20px",background:`linear-gradient(135deg,${C.goldLight},#fdf8ee)`,border:`2px solid ${C.gold}30`}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div style={{gridColumn:"1/-1"}}><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>عنوان *</label><input style={S.inpSm} value={f.title} onChange={e=>setF({...f,title:e.target.value})} placeholder="نوٹس کا عنوان..."/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>زمرہ</label><select style={S.inpSm} value={f.category} onChange={e=>setF({...f,category:e.target.value})}>{Object.entries(catConfig).map(([k,v])=><option key={k} value={k}>{v.i} {v.l}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>ترجیح</label><select style={S.inpSm} value={f.priority} onChange={e=>setF({...f,priority:e.target.value})}><option value="normal">عام</option><option value="high">اہم</option><option value="urgent">فوری</option></select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>میعاد ختم</label><input style={{...S.inpSm,direction:"ltr"}} type="date" value={f.expiryDate} onChange={e=>setF({...f,expiryDate:e.target.value})}/></div>
        <div style={{display:"flex",alignItems:"center",gap:"8px",paddingTop:"20px"}}><input type="checkbox" checked={f.pinned} onChange={e=>setF({...f,pinned:e.target.checked})} id="pin"/><label htmlFor="pin" style={{fontSize:"0.68rem",color:C.navy,cursor:"pointer"}}>📌 اوپر پن کریں</label></div>
        <div style={{gridColumn:"1/-1"}}><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>مواد *</label><textarea style={{...S.inpSm,minHeight:"100px",resize:"vertical"}} value={f.content} onChange={e=>setF({...f,content:e.target.value})} placeholder="نوٹس کا مکمل متن..."/></div>
      </div>
      <button style={S.saveBtn} onClick={add}>📌 شائع کریں</button>
    </div>}
    {pinned.length>0&&<div style={{marginBottom:"20px"}}>
      <div style={{fontSize:"0.72rem",fontWeight:"700",color:C.gold,marginBottom:"10px"}}>📌 پن شدہ نوٹسز</div>
      {pinned.map(n=>{ const cc=catConfig[n.category]||catConfig.general; return <div key={n.id} style={{...S.card,marginBottom:"10px",borderRight:`4px solid ${cc.c}`,background:`linear-gradient(135deg,${cc.bg},#fff)`,borderTop:`2px solid ${C.gold}30`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"8px"}}>
          <div style={{flex:1}}><div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"4px"}}><span style={{fontSize:"1rem"}}>{cc.i}</span><span style={{fontSize:"0.85rem",fontWeight:"700",color:C.navy}}>{n.title}</span><span style={{fontSize:"0.55rem",color:C.gold}}>📌</span></div></div>
          <span style={{...hBadge(cc.c,cc.bg),fontSize:"0.55rem"}}>{cc.l}</span>
        </div>
        <div style={{fontSize:"0.7rem",color:"#555",lineHeight:"1.7"}}>{n.content}</div>
      </div>; })}
    </div>}
    <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
      {regular.map(n=>{ const cc=catConfig[n.category]||catConfig.general; return <div key={n.id} style={{...S.card,borderRight:`4px solid ${cc.c}`,padding:"16px 20px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"8px"}}>
          <div style={{flex:1}}><div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"4px"}}><span style={{fontSize:"1rem"}}>{cc.i}</span><span style={{fontSize:"0.82rem",fontWeight:"700",color:C.navy}}>{n.title}</span></div></div>
          <span style={{...hBadge(cc.c,cc.bg),fontSize:"0.55rem"}}>{cc.l}</span>
        </div>
        <div style={{fontSize:"0.68rem",color:"#555",lineHeight:"1.7"}}>{n.content}</div>
      </div>; })}
      {notices.length===0&&<div style={{...S.card,textAlign:"center",color:"#bbb",padding:"60px"}}>ابھی کوئی نوٹس نہیں!</div>}
    </div>
  </div>;
}

// ===================== HOSTEL MANAGEMENT =====================
function HostelManagement({students,addData}){
  const [rooms,setRooms]=useState([]); const [residents,setResidents]=useState([]); const [show,setShow]=useState(false); const [tab,setTab]=useState("rooms");
  const [f,setF]=useState({roomNo:"",floor:"Ground",capacity:4,type:"standard",amenities:""});
  const [resF,setResF]=useState({studentId:"",roomId:"",checkIn:new Date().toISOString().split("T")[0],monthlyFee:3000,notes:""});
  useEffect(()=>{
    const u1=onSnapshot(collection(db,"hostel_rooms"),s=>setRooms(s.docs.map(d=>({id:d.id,...d.data()}))));
    const u2=onSnapshot(collection(db,"hostel_residents"),s=>setResidents(s.docs.map(d=>({id:d.id,...d.data()}))));
    return()=>{u1();u2();};
  },[]);
  const addRoom=async()=>{ if(!f.roomNo)return; await addData("hostel_rooms",{...f,capacity:Number(f.capacity),occupied:0}); setShow(false); setF({roomNo:"",floor:"Ground",capacity:4,type:"standard",amenities:""}); };
  const addResident=async()=>{ if(!resF.studentId||!resF.roomId)return; await addData("hostel_residents",{...resF,status:"active",monthlyFee:Number(resF.monthlyFee)}); setResF({studentId:"",roomId:"",checkIn:new Date().toISOString().split("T")[0],monthlyFee:3000,notes:""}); };
  const getOccupancy=(roomId)=>residents.filter(r=>r.roomId===roomId&&r.status==="active").length;
  const totalResidents=residents.filter(r=>r.status==="active").length;
  const totalCapacity=rooms.reduce((s,r)=>s+(r.capacity||0),0);
  return <div style={S.page}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
      <div><div style={{fontSize:"1.1rem",fontWeight:"700",color:C.navy}}>🏠 ہوسٹل مینجمنٹ</div><div style={{fontSize:"0.62rem",color:"#888",marginTop:"2px"}}>رہائشی طلبا — کمرے اور سہولیات</div></div>
      <button style={S.addBtn} onClick={()=>setShow(!show)}>+ نیا کمرہ</button>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:"12px",marginBottom:"20px"}}>
      {[{c:C.abuBakr,i:"🏠",n:rooms.length,l:"کمرے"},{c:C.green,i:"👥",n:totalResidents,l:"رہائشی"},{c:C.amber,i:"🛏️",n:totalCapacity-totalResidents,l:"خالی"},{c:C.gold,i:"💰",n:`Rs.${(residents.filter(r=>r.status==="active").reduce((s,r)=>s+(r.monthlyFee||0),0)/1000).toFixed(0)}K`,l:"ماہانہ آمدن"}].map((x,i)=><div key={i} style={{background:`linear-gradient(135deg,${x.c}12,${x.c}05)`,borderRadius:"16px",padding:"16px",border:`2px solid ${x.c}20`,textAlign:"center"}}><div style={{fontSize:"1.3rem"}}>{x.i}</div><div style={{fontSize:"1.4rem",fontWeight:"900",color:x.c}}>{x.n}</div><div style={{fontSize:"0.6rem",color:"#888"}}>{x.l}</div></div>)}
    </div>
    {show&&<div style={{...S.card,marginBottom:"20px",background:`linear-gradient(135deg,${C.goldLight},#fdf8ee)`}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>کمرہ نمبر *</label><input style={{...S.inpSm,direction:"ltr"}} value={f.roomNo} onChange={e=>setF({...f,roomNo:e.target.value})} placeholder="101, 202..."/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>منزل</label><select style={S.inpSm} value={f.floor} onChange={e=>setF({...f,floor:e.target.value})}>{["Ground","First","Second","Third"].map(fl=><option key={fl}>{fl}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>گنجائش</label><input style={{...S.inpSm,direction:"ltr"}} type="number" value={f.capacity} onChange={e=>setF({...f,capacity:e.target.value})}/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>قسم</label><select style={S.inpSm} value={f.type} onChange={e=>setF({...f,type:e.target.value})}><option value="standard">معیاری</option><option value="ac">AC</option><option value="vip">VIP</option></select></div>
      </div>
      <button style={S.saveBtn} onClick={addRoom}>✅ کمرہ شامل کریں</button>
    </div>}
    <div style={{display:"flex",gap:"8px",marginBottom:"16px"}}>{[["rooms","🏠 کمرے"],["residents","👥 رہائشی"],["assign","➕ داخلہ"]].map(([t,l])=><button key={t} onClick={()=>setTab(t)} style={{padding:"8px 14px",borderRadius:"10px",border:"none",cursor:"pointer",fontSize:"0.65rem",fontWeight:tab===t?"700":"400",background:tab===t?`linear-gradient(135deg,${C.gold},${C.goldDark})`:C.white,color:tab===t?C.white:"#888",fontFamily:"inherit"}}>{l}</button>)}</div>
    {tab==="rooms"&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:"14px"}}>
      {rooms.map(r=>{ const occ=getOccupancy(r.id); const full=occ>=r.capacity; return <div key={r.id} style={{...S.card,borderTop:`4px solid ${full?C.red:occ>0?C.amber:C.green}`}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:"8px"}}><div style={{fontSize:"1.2rem",fontWeight:"800",color:C.navy}}>🏠 {r.roomNo}</div><span style={{...hBadge(full?C.red:occ>0?C.amber:C.green,full?"#fee2e2":occ>0?"#fef3c7":"#dcfce7")}}>{full?"بھرا":occ>0?"جزوی":"خالی"}</span></div>
        <div style={{fontSize:"0.62rem",color:"#888",marginBottom:"8px"}}>{r.floor} Floor • {r.type}</div>
        {pBar(occ,r.capacity||1,full?C.red:C.green)}
        <div style={{fontSize:"0.6rem",color:"#888",marginTop:"4px"}}>{occ}/{r.capacity} رہائشی</div>
      </div>; })}
      {rooms.length===0&&<div style={{...S.card,textAlign:"center",color:"#bbb",padding:"40px",gridColumn:"1/-1"}}>کوئی کمرہ نہیں</div>}
    </div>}
    {tab==="assign"&&<div style={{...S.card,background:`linear-gradient(135deg,${C.goldLight},#fdf8ee)`}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>طالب علم *</label><select style={S.inpSm} value={resF.studentId} onChange={e=>setResF({...resF,studentId:e.target.value})}><option value="">-- منتخب کریں --</option>{students.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>کمرہ *</label><select style={S.inpSm} value={resF.roomId} onChange={e=>setResF({...resF,roomId:e.target.value})}><option value="">-- منتخب کریں --</option>{rooms.filter(r=>getOccupancy(r.id)<r.capacity).map(r=><option key={r.id} value={r.id}>{r.roomNo} ({getOccupancy(r.id)}/{r.capacity})</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>چیک ان تاریخ</label><input style={{...S.inpSm,direction:"ltr"}} type="date" value={resF.checkIn} onChange={e=>setResF({...resF,checkIn:e.target.value})}/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>ماہانہ فیس</label><input style={{...S.inpSm,direction:"ltr"}} type="number" value={resF.monthlyFee} onChange={e=>setResF({...resF,monthlyFee:e.target.value})}/></div>
      </div>
      <button style={S.saveBtn} onClick={addResident}>✅ رہائشی شامل کریں</button>
    </div>}
    {tab==="residents"&&<div style={S.card}><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}>
      <thead><tr><th style={S.th}>طالب علم</th><th style={S.th}>کمرہ</th><th style={S.th}>چیک ان</th><th style={S.th}>ماہانہ فیس</th><th style={S.th}>حال</th></tr></thead>
      <tbody>{residents.map(r=>{ const st=students.find(s=>s.id===r.studentId); const rm=rooms.find(x=>x.id===r.roomId); return <tr key={r.id}>
        <td style={{...S.td,fontWeight:"700"}}>{st?.name||"—"}</td>
        <td style={S.td}>{rm?.roomNo||"—"}</td>
        <td style={{...S.td,fontFamily:"monospace",direction:"ltr",fontSize:"0.6rem"}}>{r.checkIn}</td>
        <td style={{...S.td,fontWeight:"700",color:C.green}}>Rs. {(r.monthlyFee||0).toLocaleString()}</td>
        <td style={S.td}><span style={{padding:"3px 8px",borderRadius:"20px",fontSize:"0.55rem",fontWeight:"700",background:r.status==="active"?"#dcfce7":"#f3f4f6",color:r.status==="active"?C.green:"#888"}}>{r.status==="active"?"فعال":"غیر فعال"}</span></td>
      </tr>; })}{residents.length===0&&<tr><td colSpan={5} style={{...S.td,textAlign:"center",color:"#bbb",padding:"40px"}}>کوئی رہائشی نہیں</td></tr>}</tbody>
    </table></div></div>}
  </div>;
}

// ===================== STUDENT HEALTH & WELLNESS =====================
function StudentHealth({students,addData}){
  const [records,setRecords]=useState([]); const [show,setShow]=useState(false);
  const [f,setF]=useState({studentId:"",date:new Date().toISOString().split("T")[0],type:"checkup",condition:"",treatment:"",doctor:"",followUp:"",notes:"",severity:"low"});
  useEffect(()=>{ return onSnapshot(query(collection(db,"health_records"),orderBy("createdAt","desc"),limit(50)),s=>setRecords(s.docs.map(d=>({id:d.id,...d.data()}))));  },[]);
  const add=async()=>{ if(!f.studentId)return; await addData("health_records",{...f}); setShow(false); setF({studentId:"",date:new Date().toISOString().split("T")[0],type:"checkup",condition:"",treatment:"",doctor:"",followUp:"",notes:"",severity:"low"}); };
  const types={checkup:"🩺 معمول چیک اپ",sick:"🤒 بیماری",injury:"🤕 چوٹ",dental:"🦷 دانت",eye:"👁️ آنکھ",mental:"🧠 ذہنی صحت",other:"📋 دیگر"};
  const sevConfig={low:{c:C.green,bg:"#dcfce7",l:"معمولی"},medium:{c:C.amber,bg:"#fef3c7",l:"درمیانہ"},high:{c:C.red,bg:"#fee2e2",l:"سنگین"}};
  const recent=records.slice(0,5);
  const studentHealth=students.map(st=>{ const stR=records.filter(r=>r.studentId===st.id); return {...st,visits:stR.length,lastVisit:stR[0]?.date||"—"}; }).filter(s=>s.visits>0).slice(0,8);
  return <div style={S.page}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
      <div><div style={{fontSize:"1.1rem",fontWeight:"700",color:C.navy}}>🏥 صحت و تندرستی</div><div style={{fontSize:"0.62rem",color:"#888",marginTop:"2px"}}>طلبا کی صحت کا ریکارڈ</div></div>
      <button style={S.addBtn} onClick={()=>setShow(!show)}>+ نیا ریکارڈ</button>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:"12px",marginBottom:"20px"}}>
      {[{c:C.abuBakr,i:"📋",n:records.length,l:"کل وزٹ"},{c:C.red,i:"🤒",n:records.filter(r=>r.type==="sick").length,l:"بیماری"},{c:C.amber,i:"🤕",n:records.filter(r=>r.type==="injury").length,l:"چوٹ"},{c:C.green,i:"✅",n:records.filter(r=>r.type==="checkup").length,l:"چیک اپ"}].map((x,i)=><div key={i} style={{background:`linear-gradient(135deg,${x.c}12,${x.c}05)`,borderRadius:"16px",padding:"16px",border:`2px solid ${x.c}20`,textAlign:"center"}}><div style={{fontSize:"1.3rem"}}>{x.i}</div><div style={{fontSize:"1.4rem",fontWeight:"900",color:x.c}}>{x.n}</div><div style={{fontSize:"0.6rem",color:"#888"}}>{x.l}</div></div>)}
    </div>
    {show&&<div style={{...S.card,marginBottom:"20px",background:`linear-gradient(135deg,#dcfce7,#f0fdf4)`,border:`2px solid ${C.green}20`}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>طالب علم *</label><select style={S.inpSm} value={f.studentId} onChange={e=>setF({...f,studentId:e.target.value})}><option value="">-- منتخب کریں --</option>{students.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>تاریخ</label><input style={{...S.inpSm,direction:"ltr"}} type="date" value={f.date} onChange={e=>setF({...f,date:e.target.value})}/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>قسم</label><select style={S.inpSm} value={f.type} onChange={e=>setF({...f,type:e.target.value})}>{Object.entries(types).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>شدت</label><select style={S.inpSm} value={f.severity} onChange={e=>setF({...f,severity:e.target.value})}><option value="low">معمولی</option><option value="medium">درمیانہ</option><option value="high">سنگین</option></select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>بیماری / مسئلہ</label><input style={S.inpSm} value={f.condition} onChange={e=>setF({...f,condition:e.target.value})} placeholder="بخار، سر درد..."/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>علاج</label><input style={S.inpSm} value={f.treatment} onChange={e=>setF({...f,treatment:e.target.value})} placeholder="دوائی، آرام..."/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>ڈاکٹر</label><input style={S.inpSm} value={f.doctor} onChange={e=>setF({...f,doctor:e.target.value})} placeholder="ڈاکٹر کا نام..."/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>فالو اپ تاریخ</label><input style={{...S.inpSm,direction:"ltr"}} type="date" value={f.followUp} onChange={e=>setF({...f,followUp:e.target.value})}/></div>
      </div>
      <button style={{...S.saveBtn,background:`linear-gradient(135deg,${C.green},#15803d)`}} onClick={add}>✅ ریکارڈ محفوظ کریں</button>
    </div>}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"20px"}}>
      <div style={S.card}>
        <div style={{fontSize:"0.85rem",fontWeight:"700",color:C.navy,marginBottom:"16px"}}>📋 حالیہ ریکارڈ</div>
        {recent.map(r=>{ const st=students.find(s=>s.id===r.studentId); const sev=sevConfig[r.severity]||sevConfig.low; return <div key={r.id} style={{display:"flex",gap:"10px",marginBottom:"12px",padding:"10px",background:"#fafaf8",borderRadius:"10px",border:`1px solid ${sev.c}20`}}>
          <div style={{width:"36px",height:"36px",borderRadius:"50%",background:sev.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1rem",flexShrink:0}}>{types[r.type]?.split(" ")[0]||"📋"}</div>
          <div style={{flex:1}}><div style={{fontSize:"0.7rem",fontWeight:"700",color:C.navy}}>{st?.name||"—"}</div><div style={{fontSize:"0.6rem",color:"#888"}}>{r.condition||types[r.type]||r.type}</div><div style={{fontSize:"0.55rem",color:"#aaa",fontFamily:"monospace",direction:"ltr"}}>{r.date}</div></div>
          <span style={{...hBadge(sev.c,sev.bg),fontSize:"0.5rem",alignSelf:"flex-start"}}>{sev.l}</span>
        </div>; })}
        {records.length===0&&<div style={{textAlign:"center",color:"#bbb",fontSize:"0.65rem",padding:"20px"}}>کوئی ریکارڈ نہیں</div>}
      </div>
      <div style={S.card}>
        <div style={{fontSize:"0.85rem",fontWeight:"700",color:C.navy,marginBottom:"16px"}}>👥 طلبا کا صحت خلاصہ</div>
        {studentHealth.map(s=>{ const h=HOUSES.find(x=>x.id===s.houseId)||{}; return <div key={s.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"10px",padding:"8px 12px",background:"#fafaf8",borderRadius:"10px"}}>
          <div><div style={{fontSize:"0.7rem",fontWeight:"700",color:C.navy}}>{s.name}</div><div style={{fontSize:"0.58rem",color:"#888"}}>آخری وزٹ: {s.lastVisit}</div></div>
          <span style={{...hBadge(h.color||C.gold,h.light||C.goldLight),fontSize:"0.55rem"}}>{s.visits} وزٹ</span>
        </div>; })}
        {studentHealth.length===0&&<div style={{textAlign:"center",color:"#bbb",fontSize:"0.65rem",padding:"20px"}}>کوئی ڈیٹا نہیں</div>}
      </div>
    </div>
  </div>;
}

// ===================== MADRASA DARS-E-NIZAMI HUB =====================
function MadrasaHub({students,addData}){
  const [classes,setClasses]=useState([]); const [progress,setProgress]=useState([]); const [show,setShow]=useState(false); const [tab,setTab]=useState("classes");
  const [f,setF]=useState({subject:"",level:"Ibtidai",teacher:"",schedule:"",kitab:"",totalDars:100});
  const [progF,setProgF]=useState({studentId:"",subjectId:"",darsCompleted:0,grade:"",notes:""});
  const LEVELS=["Ibtidai","Mutawassit","Thanawi","Aali"]; const LEVEL_UR={Ibtidai:"ابتدائی",Mutawassit:"متوسط",Thanawi:"ثانوی",Aali:"عالی"};
  useEffect(()=>{
    const u1=onSnapshot(collection(db,"madrasa_subjects"),s=>setClasses(s.docs.map(d=>({id:d.id,...d.data()}))));
    const u2=onSnapshot(query(collection(db,"madrasa_progress"),orderBy("createdAt","desc"),limit(50)),s=>setProgress(s.docs.map(d=>({id:d.id,...d.data()}))));
    return()=>{u1();u2();};
  },[]);
  const add=async()=>{ if(!f.subject)return; await addData("madrasa_subjects",{...f,totalDars:Number(f.totalDars)}); setShow(false); setF({subject:"",level:"Ibtidai",teacher:"",schedule:"",kitab:"",totalDars:100}); };
  const addProg=async()=>{ if(!progF.studentId||!progF.subjectId)return; await addData("madrasa_progress",{...progF,darsCompleted:Number(progF.darsCompleted)}); setProgF({studentId:"",subjectId:"",darsCompleted:0,grade:"",notes:""}); };
  const islamicSubjects=["تفسیر","حدیث","فقہ","عقیدہ","نحو","صرف","بلاغت","منطق","فلسفہ","تاریخ اسلام","سیرت","تجوید"];
  return <div style={S.page}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
      <div><div style={{fontSize:"1.1rem",fontWeight:"700",color:C.navy}}>🕌 درس نظامی ہب</div><div style={{fontSize:"0.62rem",color:"#888",marginTop:"2px"}}>اسلامی علوم — نصاب و پیشرفت</div></div>
      <button style={S.addBtn} onClick={()=>setShow(!show)}>+ نیا مضمون</button>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:"12px",marginBottom:"20px"}}>
      {LEVELS.map(l=>{ const cnt=classes.filter(c=>c.level===l).length; return <div key={l} style={{background:`linear-gradient(135deg,${C.gold}12,${C.gold}05)`,borderRadius:"16px",padding:"16px",border:`2px solid ${C.gold}20`,textAlign:"center"}}><div style={{fontSize:"0.75rem",fontWeight:"800",color:C.goldDark}}>{LEVEL_UR[l]}</div><div style={{fontSize:"1.8rem",fontWeight:"900",color:C.gold,marginTop:"4px"}}>{cnt}</div><div style={{fontSize:"0.58rem",color:"#888"}}>مضامین</div></div>; })}
    </div>
    {show&&<div style={{...S.card,marginBottom:"20px",background:`linear-gradient(135deg,${C.goldLight},#fdf8ee)`}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>مضمون *</label><select style={S.inpSm} value={f.subject} onChange={e=>setF({...f,subject:e.target.value})}><option value="">-- منتخب کریں --</option>{islamicSubjects.map(s=><option key={s}>{s}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>درجہ</label><select style={S.inpSm} value={f.level} onChange={e=>setF({...f,level:e.target.value})}>{LEVELS.map(l=><option key={l} value={l}>{LEVEL_UR[l]}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>استاد</label><input style={S.inpSm} value={f.teacher} onChange={e=>setF({...f,teacher:e.target.value})} placeholder="استاد کا نام..."/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>کتاب</label><input style={S.inpSm} value={f.kitab} onChange={e=>setF({...f,kitab:e.target.value})} placeholder="ہدایہ، نورالانوار..."/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>کل دروس</label><input style={{...S.inpSm,direction:"ltr"}} type="number" value={f.totalDars} onChange={e=>setF({...f,totalDars:e.target.value})}/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>شیڈول</label><input style={S.inpSm} value={f.schedule} onChange={e=>setF({...f,schedule:e.target.value})} placeholder="صبح 8-9..."/></div>
      </div>
      <button style={S.saveBtn} onClick={add}>✅ محفوظ کریں</button>
    </div>}
    <div style={{display:"flex",gap:"8px",marginBottom:"16px"}}>{[["classes","📚 مضامین"],["progress","📊 پیشرفت"],["add_prog","➕ پیشرفت درج"]].map(([t,l])=><button key={t} onClick={()=>setTab(t)} style={{padding:"8px 14px",borderRadius:"10px",border:"none",cursor:"pointer",fontSize:"0.65rem",fontWeight:tab===t?"700":"400",background:tab===t?`linear-gradient(135deg,${C.gold},${C.goldDark})`:C.white,color:tab===t?C.white:"#888",fontFamily:"inherit"}}>{l}</button>)}</div>
    {tab==="classes"&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:"14px"}}>
      {classes.map(c=><div key={c.id} style={{...S.card,borderRight:`4px solid ${C.gold}`}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:"8px"}}><div style={{fontSize:"0.85rem",fontWeight:"700",color:C.navy}}>🕌 {c.subject}</div><span style={hBadge(C.gold,C.goldLight)}>{LEVEL_UR[c.level]||c.level}</span></div>
        {c.kitab&&<div style={{fontSize:"0.65rem",color:"#888",marginBottom:"4px"}}>📖 {c.kitab}</div>}
        {c.teacher&&<div style={{fontSize:"0.65rem",color:"#888",marginBottom:"4px"}}>👤 {c.teacher}</div>}
        {c.schedule&&<div style={{fontSize:"0.65rem",color:C.gold}}>⏰ {c.schedule}</div>}
        <div style={{marginTop:"8px"}}>{pBar(0,c.totalDars||100,C.gold)}<div style={{fontSize:"0.58rem",color:"#aaa",marginTop:"2px"}}>کل {c.totalDars} دروس</div></div>
      </div>)}
      {classes.length===0&&<div style={{...S.card,textAlign:"center",color:"#bbb",padding:"40px",gridColumn:"1/-1"}}>کوئی مضمون نہیں</div>}
    </div>}
    {tab==="add_prog"&&<div style={{...S.card,background:`linear-gradient(135deg,${C.goldLight},#fdf8ee)`}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>طالب علم</label><select style={S.inpSm} value={progF.studentId} onChange={e=>setProgF({...progF,studentId:e.target.value})}><option value="">-- منتخب کریں --</option>{students.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>مضمون</label><select style={S.inpSm} value={progF.subjectId} onChange={e=>setProgF({...progF,subjectId:e.target.value})}><option value="">-- منتخب کریں --</option>{classes.map(c=><option key={c.id} value={c.id}>{c.subject}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>مکمل دروس</label><input style={{...S.inpSm,direction:"ltr"}} type="number" value={progF.darsCompleted} onChange={e=>setProgF({...progF,darsCompleted:e.target.value})}/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>گریڈ</label><select style={S.inpSm} value={progF.grade} onChange={e=>setProgF({...progF,grade:e.target.value})}><option value="">-- منتخب کریں --</option>{["ممتاز","جید جداً","جید","مقبول","ناکام"].map(g=><option key={g}>{g}</option>)}</select></div>
      </div>
      <button style={S.saveBtn} onClick={addProg}>✅ پیشرفت درج کریں</button>
    </div>}
    {tab==="progress"&&<div style={S.card}><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}>
      <thead><tr><th style={S.th}>طالب علم</th><th style={S.th}>مضمون</th><th style={S.th}>دروس</th><th style={S.th}>گریڈ</th></tr></thead>
      <tbody>{progress.map(p=>{ const st=students.find(s=>s.id===p.studentId); const subj=classes.find(c=>c.id===p.subjectId); const pct=subj?Math.round((p.darsCompleted/subj.totalDars)*100):0; return <tr key={p.id}>
        <td style={{...S.td,fontWeight:"700"}}>{st?.name||"—"}</td>
        <td style={S.td}>{subj?.subject||"—"}</td>
        <td style={S.td}><div style={{display:"flex",alignItems:"center",gap:"6px"}}><div style={{flex:1,minWidth:"60px"}}>{pBar(p.darsCompleted,subj?.totalDars||100,C.gold)}</div><span style={{fontSize:"0.6rem",color:C.gold,fontWeight:"700"}}>{pct}%</span></div></td>
        <td style={S.td}><span style={{...hBadge(C.gold,C.goldLight),fontSize:"0.6rem"}}>{p.grade||"—"}</span></td>
      </tr>; })}{progress.length===0&&<tr><td colSpan={4} style={{...S.td,textAlign:"center",color:"#bbb",padding:"40px"}}>کوئی ریکارڈ نہیں</td></tr>}</tbody>
    </table></div></div>}
  </div>;
}

// ===================== DONATION / FINANCIAL GUARD =====================
function DonationHub({addData}){
  const [donations,setDonations]=useState([]); const [show,setShow]=useState(false);
  const [f,setF]=useState({donorName:"",amount:0,type:"sadaqah",purpose:"",date:new Date().toISOString().split("T")[0],anonymous:false,notes:""});
  useEffect(()=>{ return onSnapshot(query(collection(db,"donations"),orderBy("createdAt","desc"),limit(50)),s=>setDonations(s.docs.map(d=>({id:d.id,...d.data()}))));  },[]);
  const add=async()=>{ if(!f.amount)return; await addData("donations",{...f,amount:Number(f.amount)}); setShow(false); setF({donorName:"",amount:0,type:"sadaqah",purpose:"",date:new Date().toISOString().split("T")[0],anonymous:false,notes:""}); };
  const types={sadaqah:{c:C.green,bg:"#dcfce7",i:"💝",l:"صدقہ"},zakat:{c:C.gold,bg:C.goldLight,i:"🌙",l:"زکات"},khairat:{c:C.abuBakr,bg:"#dbeafe",i:"🤲",l:"خیرات"},waqf:{c:C.purple,bg:"#ede9fe",i:"🏛️",l:"وقف"},other:{c:C.teal,bg:"#ccfbf1",i:"💰",l:"دیگر"}};
  const totalByType=(type)=>donations.filter(d=>d.type===type).reduce((s,d)=>s+(d.amount||0),0);
  const grandTotal=donations.reduce((s,d)=>s+(d.amount||0),0);
  return <div style={S.page}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
      <div><div style={{fontSize:"1.1rem",fontWeight:"700",color:C.navy}}>🤲 عطیات و صدقات</div><div style={{fontSize:"0.62rem",color:"#888",marginTop:"2px"}}>صدقہ، زکات، خیرات، وقف</div></div>
      <button style={S.addBtn} onClick={()=>setShow(!show)}>+ نیا عطیہ</button>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:"12px",marginBottom:"20px"}}>
      {Object.entries(types).map(([k,v])=><div key={k} style={{background:`linear-gradient(135deg,${v.c}12,${v.c}05)`,borderRadius:"16px",padding:"16px",border:`2px solid ${v.c}20`,textAlign:"center"}}><div style={{fontSize:"1.4rem"}}>{v.i}</div><div style={{fontSize:"0.72rem",fontWeight:"800",color:v.c,marginTop:"4px"}}>{v.l}</div><div style={{fontSize:"1rem",fontWeight:"900",color:v.c}}>Rs. {(totalByType(k)/1000).toFixed(1)}K</div></div>)}
    </div>
    <div style={{...S.card,marginBottom:"20px",background:`linear-gradient(135deg,${C.goldLight},#fdf8ee)`,textAlign:"center"}}>
      <div style={{fontSize:"0.65rem",color:"#888"}}>کل وصول شدہ عطیات</div>
      <div style={{fontSize:"2.5rem",fontWeight:"900",color:C.gold}}>Rs. {grandTotal.toLocaleString()}</div>
      <div style={{fontSize:"0.62rem",color:"#888",marginTop:"4px"}}>{donations.length} عطیات</div>
    </div>
    {show&&<div style={{...S.card,marginBottom:"20px",background:`linear-gradient(135deg,${C.goldLight},#fdf8ee)`,border:`2px solid ${C.gold}30`}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>عطیہ دہندہ</label><input style={S.inpSm} value={f.donorName} onChange={e=>setF({...f,donorName:e.target.value})} placeholder="نام (اختیاری)"/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>رقم *</label><input style={{...S.inpSm,direction:"ltr"}} type="number" value={f.amount} onChange={e=>setF({...f,amount:e.target.value})}/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>قسم</label><select style={S.inpSm} value={f.type} onChange={e=>setF({...f,type:e.target.value})}>{Object.entries(types).map(([k,v])=><option key={k} value={k}>{v.i} {v.l}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>مقصد</label><input style={S.inpSm} value={f.purpose} onChange={e=>setF({...f,purpose:e.target.value})} placeholder="تعمیر، تعلیم..."/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>تاریخ</label><input style={{...S.inpSm,direction:"ltr"}} type="date" value={f.date} onChange={e=>setF({...f,date:e.target.value})}/></div>
        <div style={{display:"flex",alignItems:"center",gap:"8px",paddingTop:"20px"}}><input type="checkbox" checked={f.anonymous} onChange={e=>setF({...f,anonymous:e.target.checked})} id="anon"/><label htmlFor="anon" style={{fontSize:"0.68rem",color:C.navy,cursor:"pointer"}}>گمنام عطیہ</label></div>
      </div>
      <button style={S.saveBtn} onClick={add}>🤲 عطیہ درج کریں</button>
    </div>}
    <div style={S.card}><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}>
      <thead><tr><th style={S.th}>عطیہ دہندہ</th><th style={S.th}>قسم</th><th style={S.th}>رقم</th><th style={S.th}>مقصد</th><th style={S.th}>تاریخ</th></tr></thead>
      <tbody>{donations.map(d=>{ const tc=types[d.type]||types.other; return <tr key={d.id}>
        <td style={{...S.td,fontWeight:"700"}}>{d.anonymous?"گمنام":d.donorName||"—"}</td>
        <td style={S.td}><span style={hBadge(tc.c,tc.bg)}>{tc.i} {tc.l}</span></td>
        <td style={{...S.td,fontWeight:"800",color:C.green}}>Rs. {(d.amount||0).toLocaleString()}</td>
        <td style={S.td}>{d.purpose||"—"}</td>
        <td style={{...S.td,fontFamily:"monospace",direction:"ltr",fontSize:"0.6rem"}}>{d.date}</td>
      </tr>; })}{donations.length===0&&<tr><td colSpan={5} style={{...S.td,textAlign:"center",color:"#bbb",padding:"40px"}}>کوئی ریکارڈ نہیں</td></tr>}</tbody>
    </table></div></div>
  </div>;
}

// ===================== MEETING MINUTES =====================
function MeetingMinutes({addData}){
  const [meetings,setMeetings]=useState([]); const [show,setShow]=useState(false);
  const [f,setF]=useState({title:"",date:new Date().toISOString().split("T")[0],type:"staff",attendees:"",agenda:"",minutes:"",decisions:"",nextMeeting:""});
  useEffect(()=>{ return onSnapshot(query(collection(db,"meetings"),orderBy("createdAt","desc"),limit(30)),s=>setMeetings(s.docs.map(d=>({id:d.id,...d.data()}))));  },[]);
  const add=async()=>{ if(!f.title)return; await addData("meetings",{...f}); setShow(false); setF({title:"",date:new Date().toISOString().split("T")[0],type:"staff",attendees:"",agenda:"",minutes:"",decisions:"",nextMeeting:""}); };
  const types={staff:{c:C.abuBakr,bg:"#dbeafe",i:"👨‍🏫",l:"اسٹاف"},parents:{c:C.green,bg:"#dcfce7",i:"👪",l:"والدین"},board:{c:C.gold,bg:C.goldLight,i:"🏛️",l:"بورڈ"},emergency:{c:C.red,bg:"#fee2e2",i:"🚨",l:"ہنگامی"},academic:{c:C.purple,bg:"#ede9fe",i:"📚",l:"تعلیمی"}};
  return <div style={S.page}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
      <div><div style={{fontSize:"1.1rem",fontWeight:"700",color:C.navy}}>📝 میٹنگ منٹس</div><div style={{fontSize:"0.62rem",color:"#888",marginTop:"2px"}}>اجلاس کا ریکارڈ اور فیصلے</div></div>
      <button style={S.addBtn} onClick={()=>setShow(!show)}>+ نئی میٹنگ</button>
    </div>
    {show&&<div style={{...S.card,marginBottom:"20px",background:`linear-gradient(135deg,${C.goldLight},#fdf8ee)`,border:`2px solid ${C.gold}30`}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div style={{gridColumn:"1/-1"}}><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>میٹنگ کا عنوان *</label><input style={S.inpSm} value={f.title} onChange={e=>setF({...f,title:e.target.value})} placeholder="ماہانہ اسٹاف میٹنگ..."/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>تاریخ</label><input style={{...S.inpSm,direction:"ltr"}} type="date" value={f.date} onChange={e=>setF({...f,date:e.target.value})}/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>قسم</label><select style={S.inpSm} value={f.type} onChange={e=>setF({...f,type:e.target.value})}>{Object.entries(types).map(([k,v])=><option key={k} value={k}>{v.i} {v.l}</option>)}</select></div>
        <div style={{gridColumn:"1/-1"}}><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>شرکاء</label><input style={S.inpSm} value={f.attendees} onChange={e=>setF({...f,attendees:e.target.value})} placeholder="ناموں کی فہرست..."/></div>
        <div style={{gridColumn:"1/-1"}}><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>ایجنڈا</label><textarea style={{...S.inpSm,minHeight:"60px",resize:"vertical"}} value={f.agenda} onChange={e=>setF({...f,agenda:e.target.value})} placeholder="اجلاس کے نکات..."/></div>
        <div style={{gridColumn:"1/-1"}}><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>کارروائی (منٹس)</label><textarea style={{...S.inpSm,minHeight:"80px",resize:"vertical"}} value={f.minutes} onChange={e=>setF({...f,minutes:e.target.value})} placeholder="اجلاس کی مکمل کارروائی..."/></div>
        <div style={{gridColumn:"1/-1"}}><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>فیصلے</label><textarea style={{...S.inpSm,minHeight:"60px",resize:"vertical"}} value={f.decisions} onChange={e=>setF({...f,decisions:e.target.value})} placeholder="اہم فیصلے اور احکامات..."/></div>
      </div>
      <button style={S.saveBtn} onClick={add}>✅ منٹس محفوظ کریں</button>
    </div>}
    <div style={{display:"flex",flexDirection:"column",gap:"14px"}}>
      {meetings.map(m=>{ const tc=types[m.type]||types.staff; return <div key={m.id} style={{...S.card,borderRight:`4px solid ${tc.c}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"10px"}}>
          <div><div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"4px"}}><span style={{fontSize:"1rem"}}>{tc.i}</span><span style={{fontSize:"0.85rem",fontWeight:"700",color:C.navy}}>{m.title}</span></div><div style={{fontSize:"0.6rem",color:"#aaa",fontFamily:"monospace",direction:"ltr"}}>{m.date}</div></div>
          <span style={hBadge(tc.c,tc.bg)}>{tc.l}</span>
        </div>
        {m.attendees&&<div style={{fontSize:"0.62rem",color:"#888",marginBottom:"8px"}}>👥 {m.attendees}</div>}
        {m.decisions&&<div style={{background:"#fef3c7",borderRadius:"10px",padding:"10px 14px",marginBottom:"8px"}}><div style={{fontSize:"0.62rem",fontWeight:"700",color:C.amber,marginBottom:"4px"}}>⚡ فیصلے</div><div style={{fontSize:"0.65rem",color:"#555",lineHeight:"1.6"}}>{m.decisions}</div></div>}
        {m.minutes&&<div style={{fontSize:"0.65rem",color:"#666",lineHeight:"1.6"}}>{m.minutes.slice(0,200)}{m.minutes.length>200?"...":""}</div>}
      </div>; })}
      {meetings.length===0&&<div style={{...S.card,textAlign:"center",color:"#bbb",padding:"60px"}}>کوئی میٹنگ ریکارڈ نہیں</div>}
    </div>
  </div>;
}

// ===================== LOGISTICS & ASSET TRACKER =====================
function LogisticsTracker({addData}){
  const [assets,setAssets]=useState([]); const [show,setShow]=useState(false); const [tab,setTab]=useState("assets");
  const [f,setF]=useState({name:"",category:"furniture",quantity:1,condition:"good",location:"",purchaseDate:"",purchasePrice:0,notes:""});
  const [mainF,setMainF]=useState({assetId:"",issue:"",reportedBy:"",priority:"normal",date:new Date().toISOString().split("T")[0]});
  const [maintenance,setMaintenance]=useState([]);
  useEffect(()=>{
    const u1=onSnapshot(collection(db,"assets"),s=>setAssets(s.docs.map(d=>({id:d.id,...d.data()}))));
    const u2=onSnapshot(query(collection(db,"maintenance"),orderBy("createdAt","desc"),limit(30)),s=>setMaintenance(s.docs.map(d=>({id:d.id,...d.data()}))));
    return()=>{u1();u2();};
  },[]);
  const add=async()=>{ if(!f.name)return; await addData("assets",{...f,quantity:Number(f.quantity),purchasePrice:Number(f.purchasePrice)}); setShow(false); setF({name:"",category:"furniture",quantity:1,condition:"good",location:"",purchaseDate:"",purchasePrice:0,notes:""}); };
  const addMaint=async()=>{ if(!mainF.assetId||!mainF.issue)return; await addData("maintenance",{...mainF,status:"open"}); setMainF({assetId:"",issue:"",reportedBy:"",priority:"normal",date:new Date().toISOString().split("T")[0]}); };
  const resolveM=async(id)=>{ await updateDoc(doc(db,"maintenance",id),{status:"resolved",resolvedAt:serverTimestamp()}); };
  const cats={furniture:"🪑 فرنیچر",electronics:"💻 الیکٹرونکس",sports:"⚽ کھیل",kitchen:"🍽️ باورچی خانہ",classroom:"📚 کلاس",other:"📦 دیگر"};
  const condConfig={good:{c:C.green,l:"اچھی"},fair:{c:C.amber,l:"ٹھیک"},poor:{c:C.red,l:"خراب"},broken:{c:"#888",l:"ٹوٹا"}};
  const totalValue=assets.reduce((s,a)=>s+(a.purchasePrice||0),0);
  return <div style={S.page}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
      <div><div style={{fontSize:"1.1rem",fontWeight:"700",color:C.navy}}>🏗️ اثاثہ ٹریکر</div><div style={{fontSize:"0.62rem",color:"#888",marginTop:"2px"}}>سامان، فرنیچر، الیکٹرونکس</div></div>
      <button style={S.addBtn} onClick={()=>setShow(!show)}>+ نیا اثاثہ</button>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:"12px",marginBottom:"20px"}}>
      {[{c:C.navy,i:"📦",n:assets.length,l:"کل اثاثے"},{c:C.green,i:"✅",n:assets.filter(a=>a.condition==="good").length,l:"اچھی حالت"},{c:C.red,i:"⚠️",n:maintenance.filter(m=>m.status==="open").length,l:"زیر مرمت"},{c:C.gold,i:"💰",n:`Rs.${(totalValue/1000).toFixed(0)}K`,l:"کل مالیت"}].map((x,i)=><div key={i} style={{background:`linear-gradient(135deg,${x.c}12,${x.c}05)`,borderRadius:"16px",padding:"16px",border:`2px solid ${x.c}20`,textAlign:"center"}}><div style={{fontSize:"1.3rem"}}>{x.i}</div><div style={{fontSize:"1.2rem",fontWeight:"900",color:x.c}}>{x.n}</div><div style={{fontSize:"0.6rem",color:"#888"}}>{x.l}</div></div>)}
    </div>
    {show&&<div style={{...S.card,marginBottom:"20px",background:`linear-gradient(135deg,${C.goldLight},#fdf8ee)`}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>نام *</label><input style={S.inpSm} value={f.name} onChange={e=>setF({...f,name:e.target.value})} placeholder="کرسی، کمپیوٹر..."/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>زمرہ</label><select style={S.inpSm} value={f.category} onChange={e=>setF({...f,category:e.target.value})}>{Object.entries(cats).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>تعداد</label><input style={{...S.inpSm,direction:"ltr"}} type="number" value={f.quantity} onChange={e=>setF({...f,quantity:e.target.value})}/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>حالت</label><select style={S.inpSm} value={f.condition} onChange={e=>setF({...f,condition:e.target.value})}>{Object.entries(condConfig).map(([k,v])=><option key={k} value={k}>{v.l}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>مقام</label><input style={S.inpSm} value={f.location} onChange={e=>setF({...f,location:e.target.value})} placeholder="کمرہ 101..."/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>قیمت</label><input style={{...S.inpSm,direction:"ltr"}} type="number" value={f.purchasePrice} onChange={e=>setF({...f,purchasePrice:e.target.value})}/></div>
      </div>
      <button style={S.saveBtn} onClick={add}>✅ محفوظ کریں</button>
    </div>}
    <div style={{display:"flex",gap:"8px",marginBottom:"16px"}}>{[["assets","📦 اثاثے"],["maintenance","🔧 مرمت"],["report","⚠️ مسئلہ رپورٹ"]].map(([t,l])=><button key={t} onClick={()=>setTab(t)} style={{padding:"8px 14px",borderRadius:"10px",border:"none",cursor:"pointer",fontSize:"0.65rem",fontWeight:tab===t?"700":"400",background:tab===t?`linear-gradient(135deg,${C.gold},${C.goldDark})`:C.white,color:tab===t?C.white:"#888",fontFamily:"inherit"}}>{l}</button>)}</div>
    {tab==="assets"&&<div style={S.card}><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}>
      <thead><tr><th style={S.th}>نام</th><th style={S.th}>زمرہ</th><th style={S.th}>تعداد</th><th style={S.th}>مقام</th><th style={S.th}>حالت</th><th style={S.th}>قیمت</th></tr></thead>
      <tbody>{assets.map(a=>{ const cc=condConfig[a.condition]||condConfig.good; return <tr key={a.id}>
        <td style={{...S.td,fontWeight:"700"}}>{a.name}</td><td style={S.td}>{cats[a.category]||a.category}</td><td style={S.td}>{a.quantity}</td><td style={S.td}>{a.location||"—"}</td>
        <td style={S.td}><span style={hBadge(cc.c,cc.c+"15")}>{cc.l}</span></td>
        <td style={{...S.td,color:C.gold,fontWeight:"700"}}>{a.purchasePrice>0?`Rs. ${a.purchasePrice.toLocaleString()}`:"—"}</td>
      </tr>; })}{assets.length===0&&<tr><td colSpan={6} style={{...S.td,textAlign:"center",color:"#bbb",padding:"40px"}}>کوئی اثاثہ نہیں</td></tr>}</tbody>
    </table></div></div>}
    {tab==="report"&&<div style={{...S.card,background:"linear-gradient(135deg,#fee2e2,#fff5f5)"}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>اثاثہ</label><select style={S.inpSm} value={mainF.assetId} onChange={e=>setMainF({...mainF,assetId:e.target.value})}><option value="">-- منتخب کریں --</option>{assets.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>ترجیح</label><select style={S.inpSm} value={mainF.priority} onChange={e=>setMainF({...mainF,priority:e.target.value})}><option value="normal">عام</option><option value="high">اہم</option><option value="urgent">فوری</option></select></div>
        <div style={{gridColumn:"1/-1"}}><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>مسئلہ</label><textarea style={{...S.inpSm,minHeight:"60px",resize:"vertical"}} value={mainF.issue} onChange={e=>setMainF({...mainF,issue:e.target.value})} placeholder="مسئلے کی تفصیل..."/></div>
      </div>
      <button style={{...S.saveBtn,background:`linear-gradient(135deg,${C.amber},#b45309)`}} onClick={addMaint}>⚠️ مسئلہ رپورٹ کریں</button>
    </div>}
    {tab==="maintenance"&&<div style={S.card}><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}>
      <thead><tr><th style={S.th}>اثاثہ</th><th style={S.th}>مسئلہ</th><th style={S.th}>ترجیح</th><th style={S.th}>حال</th><th style={S.th}>عمل</th></tr></thead>
      <tbody>{maintenance.map(m=>{ const a=assets.find(x=>x.id===m.assetId); const pc=m.priority==="urgent"?C.red:m.priority==="high"?C.amber:C.abuBakr; return <tr key={m.id}>
        <td style={{...S.td,fontWeight:"700"}}>{a?.name||"—"}</td><td style={S.td}>{m.issue?.slice(0,50)||"—"}</td>
        <td style={S.td}><span style={hBadge(pc,pc+"15")}>{m.priority==="urgent"?"فوری":m.priority==="high"?"اہم":"عام"}</span></td>
        <td style={S.td}><span style={{padding:"3px 8px",borderRadius:"20px",fontSize:"0.55rem",fontWeight:"700",background:m.status==="resolved"?"#dcfce7":"#fef3c7",color:m.status==="resolved"?C.green:C.amber}}>{m.status==="resolved"?"✅ حل":"⏳ کھلا"}</span></td>
        <td style={S.td}>{m.status==="open"&&<button onClick={()=>resolveM(m.id)} style={{...S.saveBtn,padding:"4px 10px",fontSize:"0.55rem"}}>✅ حل</button>}</td>
      </tr>; })}{maintenance.length===0&&<tr><td colSpan={5} style={{...S.td,textAlign:"center",color:"#bbb",padding:"40px"}}>کوئی مرمت ریکارڈ نہیں</td></tr>}</tbody>
    </table></div></div>}
  </div>;
}

// ===================== STAFF PERFORMANCE =====================
function StaffPerformance({teachers,addData}){
  const [reviews,setReviews]=useState([]); const [show,setShow]=useState(false);
  const [f,setF]=useState({teacherId:"",month:"",punctuality:3,teaching:3,discipline:3,islamic:3,teamwork:3,comments:"",reviewedBy:""});
  useEffect(()=>{ return onSnapshot(query(collection(db,"staff_reviews"),orderBy("createdAt","desc"),limit(50)),s=>setReviews(s.docs.map(d=>({id:d.id,...d.data()}))));  },[]);
  const calcTotal=(f)=>Math.round(((f.punctuality+f.teaching+f.discipline+f.islamic+f.teamwork)/25)*100);
  const add=async()=>{ if(!f.teacherId||!f.month)return; const score=calcTotal(f); await addData("staff_reviews",{...f,score}); setShow(false); setF({teacherId:"",month:"",punctuality:3,teaching:3,discipline:3,islamic:3,teamwork:3,comments:"",reviewedBy:""}); };
  const criteria=[{id:"punctuality",l:"وقت کی پابندی"},{id:"teaching",l:"تدریسی معیار"},{id:"discipline",l:"نظم و ضبط"},{id:"islamic",l:"اسلامی کردار"},{id:"teamwork",l:"ٹیم ورک"}];
  const teacherScores=teachers.map(t=>{ const tR=reviews.filter(r=>r.teacherId===t.id); const avgScore=tR.length>0?Math.round(tR.reduce((s,r)=>s+(r.score||0),0)/tR.length):0; return {...t,avgScore,reviews:tR.length}; }).sort((a,b)=>b.avgScore-a.avgScore);
  return <div style={S.page}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
      <div><div style={{fontSize:"1.1rem",fontWeight:"700",color:C.navy}}>📊 اسٹاف کارکردگی</div><div style={{fontSize:"0.62rem",color:"#888",marginTop:"2px"}}>ماہانہ جائزہ و تشخیص</div></div>
      <button style={S.addBtn} onClick={()=>setShow(!show)}>+ نیا جائزہ</button>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:"14px",marginBottom:"20px"}}>
      {teacherScores.map((t,i)=>{ const h=HOUSES.find(x=>x.id===t.houseId)||{}; return <div key={t.id} style={{...S.card,borderTop:`4px solid ${i===0?C.gold:h.color||C.navy}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"8px"}}>
          <div><div style={{fontSize:"0.82rem",fontWeight:"700",color:C.navy}}>{t.name}</div><div style={{fontSize:"0.6rem",color:"#888"}}>{t.subject}</div></div>
          <div style={{background:i===0?`linear-gradient(135deg,${C.gold},${C.goldDark})`:"#eee",color:i===0?C.white:"#aaa",padding:"4px 10px",borderRadius:"20px",fontSize:"0.65rem",fontWeight:"900"}}>{i===0?"👑":`${i+1}`}</div>
        </div>
        <div style={{fontSize:"2rem",fontWeight:"900",color:t.avgScore>=80?C.green:t.avgScore>=60?C.amber:t.avgScore>0?C.red:"#ddd"}}>{t.avgScore>0?`${t.avgScore}%`:"—"}</div>
        {pBar(t.avgScore,100,t.avgScore>=80?C.green:t.avgScore>=60?C.amber:C.red)}
        <div style={{fontSize:"0.58rem",color:"#aaa",marginTop:"4px"}}>{t.reviews} جائزے</div>
      </div>; })}
    </div>
    {show&&<div style={{...S.card,marginBottom:"20px",background:`linear-gradient(135deg,${C.goldLight},#fdf8ee)`}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"16px"}}>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>استاد *</label><select style={S.inpSm} value={f.teacherId} onChange={e=>setF({...f,teacherId:e.target.value})}><option value="">-- منتخب کریں --</option>{teachers.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>مہینہ *</label><input style={{...S.inpSm,direction:"ltr"}} type="month" value={f.month} onChange={e=>setF({...f,month:e.target.value})}/></div>
      </div>
      {criteria.map(c=><div key={c.id} style={{background:C.white,borderRadius:"12px",padding:"12px 16px",marginBottom:"10px",border:`1px solid ${C.goldLight}`}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:"6px"}}><span style={{fontSize:"0.72rem",fontWeight:"700",color:C.navy}}>{c.l}</span><span style={{fontSize:"0.68rem",fontWeight:"700",color:C.gold}}>{f[c.id]}/5</span></div>
        <div style={{display:"flex",gap:"6px"}}>{[1,2,3,4,5].map(star=><button key={star} onClick={()=>setF({...f,[c.id]:star})} style={{fontSize:"1.3rem",background:"none",border:"none",cursor:"pointer",color:star<=f[c.id]?C.gold:"#ddd"}}>★</button>)}</div>
      </div>)}
      <div style={{background:C.white,padding:"10px 16px",borderRadius:"10px",marginBottom:"12px",textAlign:"center"}}><div style={{fontSize:"0.62rem",color:"#888"}}>مجموعی اسکور</div><div style={{fontSize:"1.8rem",fontWeight:"900",color:calcTotal(f)>=80?C.green:calcTotal(f)>=60?C.amber:C.red}}>{calcTotal(f)}%</div></div>
      <div style={{marginBottom:"12px"}}><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>تبصرہ</label><textarea style={{...S.inpSm,minHeight:"60px",resize:"vertical"}} value={f.comments} onChange={e=>setF({...f,comments:e.target.value})} placeholder="تبصرہ..."/></div>
      <button style={S.saveBtn} onClick={add}>✅ جائزہ محفوظ کریں</button>
    </div>}
    <div style={S.card}><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}>
      <thead><tr><th style={S.th}>استاد</th><th style={S.th}>مہینہ</th><th style={S.th}>وقت</th><th style={S.th}>تدریس</th><th style={S.th}>اسکور</th></tr></thead>
      <tbody>{reviews.map(r=>{ const t=teachers.find(x=>x.id===r.teacherId); const sc=r.score||0; return <tr key={r.id}>
        <td style={{...S.td,fontWeight:"700"}}>{t?.name||"—"}</td>
        <td style={{...S.td,fontFamily:"monospace",direction:"ltr",fontSize:"0.6rem"}}>{r.month}</td>
        <td style={S.td}><span style={{color:C.gold}}>{"★".repeat(r.punctuality||0)}</span></td>
        <td style={S.td}><span style={{color:C.gold}}>{"★".repeat(r.teaching||0)}</span></td>
        <td style={S.td}><span style={{padding:"4px 10px",borderRadius:"20px",fontSize:"0.62rem",fontWeight:"800",background:sc>=80?"#dcfce7":sc>=60?"#fef3c7":"#fee2e2",color:sc>=80?C.green:sc>=60?C.amber:C.red}}>{sc}%</span></td>
      </tr>; })}{reviews.length===0&&<tr><td colSpan={5} style={{...S.td,textAlign:"center",color:"#bbb",padding:"40px"}}>کوئی جائزہ نہیں</td></tr>}</tbody>
    </table></div></div>
  </div>;
}

// ===================== STUDENT PARENT PORTAL =====================
function ParentPortal({students,fees,results}){
  const [selStudent,setSelStudent]=useState(null); const [q,setQ]=useState("");
  const filtered=students.filter(s=>s.name?.includes(q)||s.studentCode?.includes(q));
  if(selStudent){
    const h=HOUSES.find(x=>x.id===selStudent.houseId)||{};
    const sFees=fees.filter(f=>f.studentId===selStudent.id);
    const sResults=results.filter(r=>r.studentId===selStudent.id);
    const pendingFees=sFees.filter(f=>f.status==="pending");
    const avgResult=sResults.length>0?Math.round(sResults.reduce((s,r)=>s+(r.percentage||0),0)/sResults.length):0;
    return <div style={S.page}>
      <button style={{...S.addBtn,marginBottom:"20px",background:"#eee",color:C.navy,boxShadow:"none"}} onClick={()=>setSelStudent(null)}>← واپس</button>
      <div style={{background:h.gradient||`linear-gradient(135deg,${C.navy},${C.navyMid})`,borderRadius:"22px",padding:"24px",marginBottom:"20px",color:C.white}}>
        <div style={{display:"flex",alignItems:"center",gap:"16px"}}>
          <div style={{width:"64px",height:"64px",borderRadius:"50%",background:"rgba(255,255,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"2rem"}}>{h.emoji||"👤"}</div>
          <div><div style={{fontSize:"1.3rem",fontWeight:"800"}}>{selStudent.name}</div><div style={{fontSize:"0.7rem",opacity:0.8,marginTop:"2px"}}>والد: {selStudent.fatherName}</div><div style={{fontSize:"0.65rem",opacity:0.7,fontFamily:"monospace",direction:"ltr",marginTop:"2px"}}>{selStudent.studentCode}</div></div>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:"14px",marginBottom:"20px"}}>
        {[{c:C.abuBakr,i:"📚",n:selStudent.grade,l:"جماعت"},{c:h.color||C.gold,i:h.emoji||"🏠",n:h.nameEn||"—",l:"ہاؤس"},{c:C.green,i:"📊",n:`${avgResult}%`,l:"اوسط نتیجہ"},{c:C.red,i:"💰",n:pendingFees.length,l:"واجب الادا فیس"}].map((x,i)=><div key={i} style={{background:`linear-gradient(135deg,${x.c}12,${x.c}05)`,borderRadius:"16px",padding:"16px",border:`2px solid ${x.c}20`,textAlign:"center"}}><div style={{fontSize:"1.4rem"}}>{x.i}</div><div style={{fontSize:"1.1rem",fontWeight:"900",color:x.c,marginTop:"4px"}}>{x.n}</div><div style={{fontSize:"0.6rem",color:"#888",marginTop:"2px"}}>{x.l}</div></div>)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px"}}>
        <div style={S.card}>
          <div style={{fontSize:"0.82rem",fontWeight:"700",color:C.navy,marginBottom:"12px"}}>📊 حالیہ نتائج</div>
          {sResults.slice(0,5).map(r=><div key={r.id} style={{display:"flex",justifyContent:"space-between",marginBottom:"8px",padding:"6px 10px",background:"#fafaf8",borderRadius:"8px"}}>
            <span style={{fontSize:"0.65rem",fontWeight:"600",color:C.navy}}>{r.subject}</span>
            <span style={{fontSize:"0.65rem",fontWeight:"800",color:r.percentage>=70?C.green:r.percentage>=50?C.amber:C.red}}>{r.grade} ({r.percentage}%)</span>
          </div>)}
          {sResults.length===0&&<div style={{textAlign:"center",color:"#bbb",fontSize:"0.62rem",padding:"20px"}}>کوئی نتیجہ نہیں</div>}
        </div>
        <div style={S.card}>
          <div style={{fontSize:"0.82rem",fontWeight:"700",color:C.navy,marginBottom:"12px"}}>💰 فیس صورتحال</div>
          {pendingFees.length>0&&<div style={{background:"#fee2e2",borderRadius:"10px",padding:"10px 14px",marginBottom:"10px"}}><div style={{fontSize:"0.65rem",fontWeight:"700",color:C.red}}>⚠️ {pendingFees.length} فیس باقی ہے</div><div style={{fontSize:"1rem",fontWeight:"900",color:C.red}}>Rs. {pendingFees.reduce((s,f)=>s+(f.amount||0),0).toLocaleString()}</div></div>}
          {sFees.filter(f=>f.status==="paid").slice(0,3).map(f=><div key={f.id} style={{display:"flex",justifyContent:"space-between",marginBottom:"6px",padding:"6px 10px",background:"#dcfce7",borderRadius:"8px"}}>
            <span style={{fontSize:"0.62rem",color:C.green}}>✅ {f.month||f.type}</span>
            <span style={{fontSize:"0.62rem",fontWeight:"700",color:C.green}}>Rs. {(f.amount||0).toLocaleString()}</span>
          </div>)}
          {sFees.length===0&&<div style={{textAlign:"center",color:"#bbb",fontSize:"0.62rem",padding:"20px"}}>کوئی فیس ریکارڈ نہیں</div>}
        </div>
      </div>
    </div>;
  }
  return <div style={S.page}>
    <div style={{fontSize:"1.1rem",fontWeight:"700",color:C.navy,marginBottom:"6px"}}>👪 والدین پورٹل</div>
    <div style={{fontSize:"0.62rem",color:"#888",marginBottom:"20px"}}>طالب علم کا نام یا کوڈ لکھ کر تلاش کریں</div>
    <div style={{marginBottom:"20px"}}><input style={{...S.inpSm,fontSize:"0.8rem",padding:"14px 18px"}} placeholder="🔍 نام یا کوڈ لکھیں..." value={q} onChange={e=>setQ(e.target.value)}/></div>
    {q&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:"14px"}}>
      {filtered.map(s=>{ const h=HOUSES.find(x=>x.id===s.houseId)||{}; return <div key={s.id} onClick={()=>setSelStudent(s)} style={{...S.card,cursor:"pointer",borderRight:`4px solid ${h.color||C.gold}`}}>
        <div style={{display:"flex",alignItems:"center",gap:"14px"}}>
          <div style={{width:"48px",height:"48px",borderRadius:"50%",background:h.gradient||`linear-gradient(135deg,${C.navy},#2563eb)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.4rem"}}>{h.emoji||"👤"}</div>
          <div><div style={{fontSize:"0.85rem",fontWeight:"700",color:C.navy}}>{s.name}</div><div style={{fontSize:"0.62rem",color:"#888"}}>{s.grade} • {h.nameEn||"—"}</div><div style={{fontSize:"0.6rem",color:C.gold,fontFamily:"monospace",direction:"ltr"}}>{s.studentCode}</div></div>
        </div>
      </div>; })}
      {filtered.length===0&&<div style={{...S.card,textAlign:"center",color:"#bbb",padding:"40px",gridColumn:"1/-1"}}>"{q}" کوئی نتیجہ نہیں</div>}
    </div>}
    {!q&&<div style={{...S.card,textAlign:"center",padding:"60px"}}><div style={{fontSize:"3rem",marginBottom:"12px"}}>👪</div><div style={{fontSize:"0.85rem",fontWeight:"700",color:C.navy,marginBottom:"8px"}}>والدین پورٹل میں خوش آمدید</div><div style={{fontSize:"0.65rem",color:"#888"}}>اپنے بچے کا نام یا داخلہ نمبر تلاش کریں</div></div>}
  </div>;
}

// ===================== DIRECTOR PORTAL =====================
function DirectorPortal({students,teachers,houses,fees,results,hvsLogs}){
  const totalFees=fees.reduce((s,f)=>s+(f.amount||0),0);
  const paidFees=fees.filter(f=>f.status==="paid").reduce((s,f)=>s+(f.amount||0),0);
  const sortedHouses=[...houses].sort((a,b)=>(b.points||0)-(a.points||0));
  const winner=sortedHouses[0]; const winnerInfo=HOUSES.find(x=>x.id===winner?.id);
  const avgResult=results.length>0?Math.round(results.reduce((s,r)=>s+(r.percentage||0),0)/results.length):0;
  return <div style={S.page}>
    <div style={{fontSize:"1.1rem",fontWeight:"700",color:C.navy,marginBottom:"6px"}}>👨‍💼 ڈائریکٹر پورٹل</div>
    <div style={{fontSize:"0.62rem",color:"#888",marginBottom:"20px"}}>مکمل ادارہ — اعلیٰ نظریہ</div>
    <div style={{background:`linear-gradient(135deg,${C.navyDark},${C.navyMid})`,borderRadius:"22px",padding:"24px",marginBottom:"24px",color:C.white}}>
      <div style={{fontSize:"0.65rem",opacity:0.6,marginBottom:"8px",letterSpacing:"0.15em"}}>EXECUTIVE SUMMARY</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:"16px"}}>
        {[{i:"🎓",n:students.length,l:"طلبا"},{i:"👨‍🏫",n:teachers.length,l:"اساتذہ"},{i:"📊",n:`${avgResult}%`,l:"اوسط نتیجہ"},{i:"💰",n:`${totalFees>0?Math.round((paidFees/totalFees)*100):0}%`,l:"فیس وصولی"},{i:"🏆",n:winnerInfo?.nameEn||"—",l:"سپر ہاؤس"},{i:"📈",n:hvsLogs.length,l:"HVS لاگز"}].map((x,i)=><div key={i} style={{textAlign:"center"}}><div style={{fontSize:"1.6rem"}}>{x.i}</div><div style={{fontSize:"1.4rem",fontWeight:"900",color:C.gold,marginTop:"4px"}}>{x.n}</div><div style={{fontSize:"0.58rem",opacity:0.7,marginTop:"2px"}}>{x.l}</div></div>)}
      </div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"20px",marginBottom:"20px"}}>
      <div style={S.card}>
        <div style={{fontSize:"0.85rem",fontWeight:"700",color:C.navy,marginBottom:"16px"}}>🏆 ہاؤس رینکنگ</div>
        {sortedHouses.map((h,i)=>{ const info=HOUSES.find(x=>x.id===h.id)||{}; return <div key={h.id} style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"12px"}}>
          <div style={{width:"28px",height:"28px",borderRadius:"50%",background:i===0?`linear-gradient(135deg,${C.gold},${C.goldDark})`:"#eee",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.65rem",fontWeight:"900",color:i===0?C.white:"#aaa",flexShrink:0}}>{i===0?"👑":`${i+1}`}</div>
          <span style={{fontSize:"1.2rem"}}>{info.emoji}</span>
          <div style={{flex:1}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:"4px"}}><span style={{fontSize:"0.7rem",fontWeight:"700",color:C.navy}}>{info.nameEn}</span><span style={{fontSize:"0.7rem",fontWeight:"800",color:info.color||C.gold}}>{h.points||0}</span></div>{pBar(h.points||0,Math.max(...houses.map(x=>x.points||0),1),info.color||C.gold)}</div>
        </div>; })}
      </div>
      <div style={S.card}>
        <div style={{fontSize:"0.85rem",fontWeight:"700",color:C.navy,marginBottom:"16px"}}>💰 مالی خلاصہ</div>
        <div style={{marginBottom:"16px"}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:"6px"}}><span style={{fontSize:"0.68rem",color:"#888"}}>کل فیس</span><span style={{fontSize:"0.72rem",fontWeight:"700"}}>Rs. {totalFees.toLocaleString()}</span></div>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:"6px"}}><span style={{fontSize:"0.68rem",color:"#888"}}>وصول</span><span style={{fontSize:"0.72rem",fontWeight:"700",color:C.green}}>Rs. {paidFees.toLocaleString()}</span></div>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:"10px"}}><span style={{fontSize:"0.68rem",color:"#888"}}>باقی</span><span style={{fontSize:"0.72rem",fontWeight:"700",color:C.red}}>Rs. {(totalFees-paidFees).toLocaleString()}</span></div>
          {pBar(paidFees,totalFees||1,C.green)}
        </div>
        <div style={{background:"#fafaf8",borderRadius:"12px",padding:"12px"}}><div style={{fontSize:"0.65rem",color:"#888",marginBottom:"4px"}}>وصولی کا تناسب</div><div style={{fontSize:"2rem",fontWeight:"900",color:totalFees>0&&(paidFees/totalFees)>=0.8?C.green:C.amber}}>{totalFees>0?Math.round((paidFees/totalFees)*100):0}%</div></div>
      </div>
    </div>
    <div style={S.card}>
      <div style={{fontSize:"0.85rem",fontWeight:"700",color:C.navy,marginBottom:"16px"}}>📊 نتائج تجزیہ</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:"12px"}}>
        {[["A+",results.filter(r=>r.grade==="A+").length,C.green],["A",results.filter(r=>r.grade==="A").length,C.green],["B",results.filter(r=>r.grade==="B").length,C.abuBakr],["C",results.filter(r=>r.grade==="C").length,C.amber],["D",results.filter(r=>r.grade==="D").length,C.amber],["F",results.filter(r=>r.grade==="F").length,C.red]].map(([g,n,c])=><div key={g} style={{background:`${c}12`,borderRadius:"12px",padding:"12px",textAlign:"center",border:`1px solid ${c}20`}}><div style={{fontSize:"1.2rem",fontWeight:"900",color:c}}>{g}</div><div style={{fontSize:"1.4rem",fontWeight:"900",color:c}}>{n}</div><div style={{fontSize:"0.6rem",color:"#888"}}>طلبا</div></div>)}
      </div>
    </div>
  </div>;
}

// ===================== STUDENT REPORT CARD =====================
function ReportCard({students,results,fees,addData}){
  const [selStudent,setSelStudent]=useState(null); const [q,setQ]=useState(""); const [term,setTerm]=useState("سالانہ 2026");
  const filtered=students.filter(s=>s.name?.includes(q)||s.studentCode?.includes(q));
  if(selStudent){
    const h=HOUSES.find(x=>x.id===selStudent.houseId)||{};
    const sResults=results.filter(r=>r.studentId===selStudent.id);
    const sFees=fees.filter(f=>f.studentId===selStudent.id);
    const paidFees=sFees.filter(f=>f.status==="paid").reduce((s,f)=>s+(f.amount||0),0);
    const pendingFees=sFees.filter(f=>f.status==="pending").reduce((s,f)=>s+(f.amount||0),0);
    const avgPct=sResults.length>0?Math.round(sResults.reduce((s,r)=>s+(r.percentage||0),0)/sResults.length):0;
    const overallGrade=avgPct>=90?"A+":avgPct>=80?"A":avgPct>=70?"B":avgPct>=60?"C":avgPct>=50?"D":"F";
    const totalObtained=sResults.reduce((s,r)=>s+(r.obtained||0),0);
    const totalMarks=sResults.reduce((s,r)=>s+(r.total||100),0);
    return <div style={S.page}>
      <div style={{display:"flex",gap:"10px",marginBottom:"20px",flexWrap:"wrap"}}>
        <button style={{...S.addBtn,background:"#eee",color:C.navy,boxShadow:"none"}} onClick={()=>setSelStudent(null)}>← واپس</button>
        <button style={{...S.saveBtn,fontSize:"0.65rem"}} onClick={()=>window.print()}>🖨️ پرنٹ / PDF</button>
      </div>
      <div style={{background:C.white,borderRadius:"22px",overflow:"hidden",boxShadow:"0 8px 32px rgba(0,0,0,0.12)",maxWidth:"800px",margin:"0 auto"}}>
        <div style={{background:`linear-gradient(135deg,${C.navyDark},${C.navyMid})`,padding:"24px",color:C.white,textAlign:"center"}}>
          <div style={{fontSize:"1.4rem",fontWeight:"900",color:C.gold,marginBottom:"4px"}}>امین اسکول ہب</div>
          <div style={{fontSize:"0.65rem",letterSpacing:"0.15em",opacity:0.7,marginBottom:"16px"}}>AMEEN ISLAMIC INSTITUTE • SWAT</div>
          <div style={{background:"rgba(255,255,255,0.1)",borderRadius:"12px",padding:"12px",display:"inline-block"}}><div style={{fontSize:"0.85rem",fontWeight:"700",color:C.gold}}>رپورٹ کارڈ — {term}</div></div>
        </div>
        <div style={{padding:"20px 24px",borderBottom:`2px solid ${C.goldLight}`,display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px"}}>
          {[["نام",selStudent.name],["والد کا نام",selStudent.fatherName||"—"],["داخلہ نمبر",selStudent.studentCode||"—"],["جماعت",selStudent.grade||"—"],["ہاؤس",`${h.emoji||""} ${h.nameEn||"—"}`],["سیکشن",selStudent.section||"A"]].map(([l,v])=><div key={l} style={{display:"flex",gap:"8px",alignItems:"center"}}><span style={{fontSize:"0.62rem",color:"#888",minWidth:"80px"}}>{l}:</span><span style={{fontSize:"0.72rem",fontWeight:"700",color:C.navy}}>{v}</span></div>)}
        </div>
        <div style={{padding:"20px 24px"}}>
          <div style={{fontSize:"0.82rem",fontWeight:"700",color:C.navy,marginBottom:"14px",borderBottom:`2px solid ${C.goldLight}`,paddingBottom:"8px"}}>📊 نتائج</div>
          <table style={{width:"100%",borderCollapse:"collapse",marginBottom:"20px"}}>
            <thead><tr style={{background:`linear-gradient(135deg,${C.navy},${C.navyMid})`,color:C.white}}>{["مضمون","کل","حاصل","فیصد","گریڈ"].map(h=><th key={h} style={{padding:"10px 12px",fontSize:"0.65rem",textAlign:"right",fontWeight:"700"}}>{h}</th>)}</tr></thead>
            <tbody>{sResults.map((r,i)=><tr key={r.id} style={{background:i%2===0?"#fafaf8":C.white}}>
              <td style={{...S.td,fontWeight:"600"}}>{r.subject}</td><td style={S.td}>{r.total||100}</td>
              <td style={{...S.td,fontWeight:"700",color:r.percentage>=50?C.navy:C.red}}>{r.obtained||0}</td>
              <td style={S.td}><div style={{display:"flex",alignItems:"center",gap:"6px"}}><div style={{flex:1}}>{pBar(r.percentage||0,100,r.percentage>=70?C.green:r.percentage>=50?C.amber:C.red)}</div><span style={{fontSize:"0.6rem",fontWeight:"700",color:r.percentage>=70?C.green:r.percentage>=50?C.amber:C.red}}>{r.percentage}%</span></div></td>
              <td style={S.td}><span style={{padding:"3px 10px",borderRadius:"20px",fontSize:"0.65rem",fontWeight:"800",background:r.grade==="A+"||r.grade==="A"?"#dcfce7":r.grade==="B"?"#dbeafe":"#fef3c7",color:r.grade==="A+"||r.grade==="A"?C.green:r.grade==="B"?C.abuBakr:C.amber}}>{r.grade||"—"}</span></td>
            </tr>)}{sResults.length===0&&<tr><td colSpan={5} style={{...S.td,textAlign:"center",color:"#bbb",padding:"30px"}}>کوئی نتیجہ نہیں</td></tr>}</tbody>
            {sResults.length>0&&<tfoot><tr style={{background:C.goldLight}}><td style={{...S.td,fontWeight:"800",color:C.navy}}>مجموعہ</td><td style={{...S.td,fontWeight:"800"}}>{totalMarks}</td><td style={{...S.td,fontWeight:"800"}}>{totalObtained}</td><td style={S.td}><span style={{fontWeight:"800",color:avgPct>=70?C.green:avgPct>=50?C.amber:C.red}}>{avgPct}%</span></td><td style={S.td}><span style={{padding:"4px 12px",borderRadius:"20px",fontSize:"0.72rem",fontWeight:"900",background:`linear-gradient(135deg,${C.gold},${C.goldDark})`,color:C.white}}>{overallGrade}</span></td></tr></tfoot>}
          </table>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px",marginBottom:"20px"}}>
            <div style={{background:"#fafaf8",borderRadius:"12px",padding:"14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><div style={{fontSize:"0.72rem",fontWeight:"700",color:C.navy,marginBottom:"4px"}}>💰 فیس</div><div style={{fontSize:"0.62rem",color:"#888"}}>ادا: Rs. {paidFees.toLocaleString()}</div></div><span style={{...hBadge(pendingFees>0?C.red:C.green,pendingFees>0?"#fee2e2":"#dcfce7"),fontSize:"0.62rem"}}>{pendingFees>0?`⚠️ Rs.${pendingFees.toLocaleString()} باقی`:"✅ کلیئر"}</span></div>
            <div style={{background:"#fafaf8",borderRadius:"12px",padding:"14px",textAlign:"center"}}><div style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px"}}>مجموعی گریڈ</div><div style={{fontSize:"2rem",fontWeight:"900",color:C.gold}}>{overallGrade}</div></div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"20px",marginTop:"30px"}}>{["کلاس ٹیچر","پرنسپل","والدین"].map(r=><div key={r} style={{textAlign:"center"}}><div style={{borderTop:`2px solid #ddd`,paddingTop:"8px",fontSize:"0.6rem",color:"#888"}}>{r} کے دستخط</div></div>)}</div>
        </div>
      </div>
    </div>;
  }
  return <div style={S.page}>
    <div style={{fontSize:"1.1rem",fontWeight:"700",color:C.navy,marginBottom:"6px"}}>📋 رپورٹ کارڈ</div>
    <div style={{fontSize:"0.62rem",color:"#888",marginBottom:"16px"}}>طالب علم تلاش کریں</div>
    <div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:"10px",marginBottom:"20px"}}><input style={{...S.inpSm,fontSize:"0.8rem",padding:"14px 18px"}} placeholder="🔍 نام یا کوڈ..." value={q} onChange={e=>setQ(e.target.value)}/><input style={{...S.inpSm,direction:"ltr",minWidth:"140px"}} value={term} onChange={e=>setTerm(e.target.value)} placeholder="Term..."/></div>
    {q&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:"14px"}}>
      {filtered.map(s=>{ const h=HOUSES.find(x=>x.id===s.houseId)||{}; const sRes=results.filter(r=>r.studentId===s.id); const avg=sRes.length>0?Math.round(sRes.reduce((sum,r)=>sum+(r.percentage||0),0)/sRes.length):0; return <div key={s.id} onClick={()=>setSelStudent(s)} style={{...S.card,cursor:"pointer",borderRight:`4px solid ${h.color||C.gold}`}}>
        <div style={{display:"flex",alignItems:"center",gap:"12px"}}><div style={{width:"48px",height:"48px",borderRadius:"50%",background:h.gradient||`linear-gradient(135deg,${C.gold},${C.goldDark})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.4rem"}}>{h.emoji||"🎓"}</div><div><div style={{fontSize:"0.85rem",fontWeight:"700",color:C.navy}}>{s.name}</div><div style={{fontSize:"0.62rem",color:"#888"}}>{s.grade} • {h.nameEn||"—"}</div>{sRes.length>0&&<div style={{fontSize:"0.65rem",fontWeight:"700",color:avg>=70?C.green:avg>=50?C.amber:C.red}}>اوسط: {avg}%</div>}</div></div>
      </div>; })}
      {filtered.length===0&&<div style={{...S.card,textAlign:"center",color:"#bbb",padding:"40px",gridColumn:"1/-1"}}>کوئی نتیجہ نہیں</div>}
    </div>}
    {!q&&<div style={{...S.card,textAlign:"center",padding:"60px"}}><div style={{fontSize:"3rem",marginBottom:"12px"}}>📋</div><div style={{fontSize:"0.85rem",fontWeight:"700",color:C.navy}}>رپورٹ کارڈ جنریٹر</div><div style={{fontSize:"0.65rem",color:"#888",marginTop:"8px"}}>اوپر نام لکھیں</div></div>}
  </div>;
}

// ===================== STUDENT WELFARE FEEDBACK =====================
function WelfareFeedback({students,addData}){
  const [feedbacks,setFeedbacks]=useState([]); const [show,setShow]=useState(false);
  const [f,setF]=useState({studentId:"",type:"academic",severity:"low",description:"",actionTaken:"",followUpDate:"",reportedBy:"",anonymous:false});
  useEffect(()=>{ return onSnapshot(query(collection(db,"welfare_feedback"),orderBy("createdAt","desc"),limit(50)),s=>setFeedbacks(s.docs.map(d=>({id:d.id,...d.data()}))));  },[]);
  const add=async()=>{ if(!f.studentId&&!f.anonymous)return; await addData("welfare_feedback",{...f}); setShow(false); setF({studentId:"",type:"academic",severity:"low",description:"",actionTaken:"",followUpDate:"",reportedBy:"",anonymous:false}); };
  const types={academic:{c:C.abuBakr,bg:"#dbeafe",i:"📚",l:"تعلیمی"},behavioral:{c:C.amber,bg:"#fef3c7",i:"😤",l:"رویہ"},emotional:{c:C.purple,bg:"#ede9fe",i:"💭",l:"جذباتی"},health:{c:C.red,bg:"#fee2e2",i:"🏥",l:"صحت"},family:{c:C.green,bg:"#dcfce7",i:"👪",l:"خاندان"},bullying:{c:"#dc2626",bg:"#fee2e2",i:"⚠️",l:"ہراسانی"},suggestion:{c:C.gold,bg:C.goldLight,i:"💡",l:"تجویز"}};
  const sevConfig={low:{c:C.green,l:"کم"},medium:{c:C.amber,l:"درمیانہ"},high:{c:C.red,l:"زیادہ"},critical:{c:"#dc2626",l:"نازک"}};
  return <div style={S.page}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
      <div><div style={{fontSize:"1.1rem",fontWeight:"700",color:C.navy}}>💬 طالب علم فلاح</div><div style={{fontSize:"0.62rem",color:"#888",marginTop:"2px"}}>فیڈ بیک، مشکلات، تجاویز</div></div>
      <button style={S.addBtn} onClick={()=>setShow(!show)}>+ نئی رپورٹ</button>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:"12px",marginBottom:"20px"}}>
      {[{c:C.red,i:"⚠️",n:feedbacks.filter(f=>!f.resolved).length,l:"کھلی"},{c:C.amber,i:"😤",n:feedbacks.filter(f=>f.type==="behavioral").length,l:"رویہ"},{c:C.purple,i:"💭",n:feedbacks.filter(f=>f.type==="emotional").length,l:"جذباتی"},{c:C.gold,i:"💡",n:feedbacks.filter(f=>f.type==="suggestion").length,l:"تجاویز"}].map((x,i)=><div key={i} style={{background:`linear-gradient(135deg,${x.c}12,${x.c}05)`,borderRadius:"16px",padding:"16px",border:`2px solid ${x.c}20`,textAlign:"center"}}><div style={{fontSize:"1.3rem"}}>{x.i}</div><div style={{fontSize:"1.4rem",fontWeight:"900",color:x.c}}>{x.n}</div><div style={{fontSize:"0.6rem",color:"#888"}}>{x.l}</div></div>)}
    </div>
    {show&&<div style={{...S.card,marginBottom:"20px",background:`linear-gradient(135deg,${C.goldLight},#fdf8ee)`,border:`2px solid ${C.gold}30`}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>طالب علم</label><select style={S.inpSm} value={f.studentId} onChange={e=>setF({...f,studentId:e.target.value})} disabled={f.anonymous}><option value="">-- منتخب کریں --</option>{students.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
        <div style={{display:"flex",alignItems:"center",gap:"8px",paddingTop:"20px"}}><input type="checkbox" checked={f.anonymous} onChange={e=>setF({...f,anonymous:e.target.checked,studentId:""})} id="anon2"/><label htmlFor="anon2" style={{fontSize:"0.68rem",color:C.navy,cursor:"pointer"}}>گمنام رپورٹ</label></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>قسم</label><select style={S.inpSm} value={f.type} onChange={e=>setF({...f,type:e.target.value})}>{Object.entries(types).map(([k,v])=><option key={k} value={k}>{v.i} {v.l}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>شدت</label><select style={S.inpSm} value={f.severity} onChange={e=>setF({...f,severity:e.target.value})}>{Object.entries(sevConfig).map(([k,v])=><option key={k} value={k}>{v.l}</option>)}</select></div>
        <div style={{gridColumn:"1/-1"}}><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>تفصیل</label><textarea style={{...S.inpSm,minHeight:"80px",resize:"vertical"}} value={f.description} onChange={e=>setF({...f,description:e.target.value})} placeholder="مسئلے کی تفصیل..."/></div>
        <div style={{gridColumn:"1/-1"}}><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>کارروائی</label><textarea style={{...S.inpSm,minHeight:"60px",resize:"vertical"}} value={f.actionTaken} onChange={e=>setF({...f,actionTaken:e.target.value})} placeholder="کیا قدم اٹھایا..."/></div>
      </div>
      <button style={S.saveBtn} onClick={add}>✅ رپورٹ درج کریں</button>
    </div>}
    <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
      {feedbacks.map(fb=>{ const tc=types[fb.type]||types.suggestion; const sc=sevConfig[fb.severity]||sevConfig.low; const st=students.find(s=>s.id===fb.studentId); return <div key={fb.id} style={{...S.card,borderRight:`4px solid ${tc.c}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"8px"}}><div style={{display:"flex",alignItems:"center",gap:"8px"}}><span style={{fontSize:"1rem"}}>{tc.i}</span><span style={{fontSize:"0.8rem",fontWeight:"700",color:C.navy}}>{fb.anonymous?"گمنام":st?.name||"—"}</span></div><div style={{display:"flex",gap:"6px"}}><span style={hBadge(tc.c,tc.bg)}>{tc.l}</span><span style={hBadge(sc.c,sc.c+"15")}>{sc.l}</span></div></div>
        <div style={{fontSize:"0.68rem",color:"#555",lineHeight:"1.6",marginBottom:"8px"}}>{fb.description}</div>
        {fb.actionTaken&&<div style={{background:"#f0fdf4",borderRadius:"8px",padding:"8px 12px",fontSize:"0.62rem",color:C.green}}>✅ {fb.actionTaken}</div>}
      </div>; })}
      {feedbacks.length===0&&<div style={{...S.card,textAlign:"center",color:"#bbb",padding:"60px"}}>کوئی فیڈ بیک نہیں</div>}
    </div>
  </div>;
}

// ===================== PRIDE MESSAGE PORTAL =====================
function PrideMessages({students,teachers,addData}){
  const [messages,setMessages]=useState([]); const [show,setShow]=useState(false);
  const [f,setF]=useState({studentId:"",type:"pride",message:"",from:"",sendToParent:true,housePoints:0});
  useEffect(()=>{ return onSnapshot(query(collection(db,"pride_messages"),orderBy("createdAt","desc"),limit(50)),s=>setMessages(s.docs.map(d=>({id:d.id,...d.data()}))));  },[]);
  const add=async()=>{ if(!f.studentId||!f.message)return; await addData("pride_messages",{...f,housePoints:Number(f.housePoints)}); setShow(false); setF({studentId:"",type:"pride",message:"",from:"",sendToParent:true,housePoints:0}); };
  const types={pride:{c:C.gold,bg:C.goldLight,i:"🌟",l:"فخر"},achievement:{c:C.green,bg:"#dcfce7",i:"🏆",l:"کامیابی"},improvement:{c:C.abuBakr,bg:"#dbeafe",i:"📈",l:"بہتری"},warning:{c:C.amber,bg:"#fef3c7",i:"⚠️",l:"انتباہ"},concern:{c:C.red,bg:"#fee2e2",i:"😟",l:"تشویش"},islamic:{c:C.purple,bg:"#ede9fe",i:"🕌",l:"اسلامی"}};
  const selStudent=students.find(s=>s.id===f.studentId);
  const getTemplate=(type)=>{ const n=selStudent?.name||"طالب علم"; return type==="pride"?`بسم اللہ الرحمن الرحیم\n\nمحترم والدین!\n\nآپ کے فرزند ${n} نے شاندار کارکردگی کا مظاہرہ کیا ہے۔ ادارہ آپ پر فخر محسوس کرتا ہے۔\n\nجزاکم اللہ خیراً\nامین اسکول ہب`:`بسم اللہ الرحمن الرحیم\n\nمحترم والدین!\n\n${n} نے آج قابل ذکر کامیابی حاصل کی ہے۔\n\nجزاکم اللہ خیراً`; };
  return <div style={S.page}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
      <div><div style={{fontSize:"1.1rem",fontWeight:"700",color:C.navy}}>💌 پرائیڈ میسج پورٹل</div><div style={{fontSize:"0.62rem",color:"#888",marginTop:"2px"}}>والدین کو پیغام — فخر، کامیابی، انتباہ</div></div>
      <button style={S.addBtn} onClick={()=>setShow(!show)}>+ نیا پیغام</button>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:"12px",marginBottom:"20px"}}>
      {[{c:C.gold,i:"🌟",n:messages.filter(m=>m.type==="pride").length,l:"فخر"},{c:C.green,i:"🏆",n:messages.filter(m=>m.type==="achievement").length,l:"کامیابی"},{c:C.amber,i:"⚠️",n:messages.filter(m=>m.type==="warning").length,l:"انتباہ"},{c:C.abuBakr,i:"💌",n:messages.length,l:"کل"}].map((x,i)=><div key={i} style={{background:`linear-gradient(135deg,${x.c}12,${x.c}05)`,borderRadius:"16px",padding:"16px",border:`2px solid ${x.c}20`,textAlign:"center"}}><div style={{fontSize:"1.3rem"}}>{x.i}</div><div style={{fontSize:"1.4rem",fontWeight:"900",color:x.c}}>{x.n}</div><div style={{fontSize:"0.6rem",color:"#888"}}>{x.l}</div></div>)}
    </div>
    {show&&<div style={{...S.card,marginBottom:"20px",background:`linear-gradient(135deg,${C.goldLight},#fdf8ee)`,border:`2px solid ${C.gold}30`}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>طالب علم *</label><select style={S.inpSm} value={f.studentId} onChange={e=>setF({...f,studentId:e.target.value})}><option value="">-- منتخب کریں --</option>{students.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>قسم</label><select style={S.inpSm} value={f.type} onChange={e=>setF({...f,type:e.target.value})}>{Object.entries(types).map(([k,v])=><option key={k} value={k}>{v.i} {v.l}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>از</label><select style={S.inpSm} value={f.from} onChange={e=>setF({...f,from:e.target.value})}><option value="">-- منتخب کریں --</option>{teachers.map(t=><option key={t.id} value={t.name}>{t.name}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>ہاؤس پوائنٹس</label><input style={{...S.inpSm,direction:"ltr"}} type="number" value={f.housePoints} onChange={e=>setF({...f,housePoints:e.target.value})}/></div>
        <div style={{gridColumn:"1/-1",display:"flex",gap:"8px"}}><button onClick={()=>setF({...f,message:getTemplate("pride")})} style={{...hBadge(C.gold,C.goldLight),cursor:"pointer",border:"none",padding:"6px 12px",borderRadius:"8px",fontSize:"0.6rem"}}>🌟 فخر ٹیمپلیٹ</button><button onClick={()=>setF({...f,message:getTemplate("achievement")})} style={{...hBadge(C.green,"#dcfce7"),cursor:"pointer",border:"none",padding:"6px 12px",borderRadius:"8px",fontSize:"0.6rem"}}>🏆 کامیابی ٹیمپلیٹ</button></div>
        <div style={{gridColumn:"1/-1"}}><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>پیغام *</label><textarea style={{...S.inpSm,minHeight:"120px",resize:"vertical",lineHeight:"1.8"}} value={f.message} onChange={e=>setF({...f,message:e.target.value})} placeholder="پیغام لکھیں..."/></div>
      </div>
      <button style={S.saveBtn} onClick={add}>💌 پیغام بھیجیں</button>
    </div>}
    <div style={{display:"flex",flexDirection:"column",gap:"14px"}}>
      {messages.map(m=>{ const tc=types[m.type]||types.pride; const st=students.find(s=>s.id===m.studentId); return <div key={m.id} style={{...S.card,borderRight:`4px solid ${tc.c}`,background:`linear-gradient(135deg,${tc.bg},#fff)`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"10px"}}><div><div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"4px"}}><span style={{fontSize:"1.2rem"}}>{tc.i}</span><span style={{fontSize:"0.85rem",fontWeight:"700",color:C.navy}}>{st?.name||"—"}</span></div>{m.from&&<div style={{fontSize:"0.6rem",color:"#888"}}>از: {m.from}</div>}</div><span style={hBadge(tc.c,tc.bg)}>{tc.l}</span></div>
        <div style={{fontSize:"0.68rem",color:"#555",lineHeight:"1.8",whiteSpace:"pre-line"}}>{m.message}</div>
        {m.housePoints>0&&<div style={{marginTop:"8px"}}><span style={hBadge(C.gold,C.goldLight)}>+{m.housePoints} ہاؤس پوائنٹس</span></div>}
      </div>; })}
      {messages.length===0&&<div style={{...S.card,textAlign:"center",color:"#bbb",padding:"60px"}}><div style={{fontSize:"3rem",marginBottom:"12px"}}>💌</div>کوئی پیغام نہیں</div>}
    </div>
  </div>;
}

// ===================== WIFAQ COMPLIANCE PORTAL =====================
function WifaqCompliance({addData}){
  const [records,setRecords]=useState([]); const [show,setShow]=useState(false);
  const [f,setF]=useState({subject:"",class:"",teacher:"",syllabusCompleted:0,totalSyllabus:100,examDate:"",examType:"internal",status:"in_progress",notes:""});
  useEffect(()=>{ return onSnapshot(query(collection(db,"wifaq_compliance"),orderBy("createdAt","desc"),limit(50)),s=>setRecords(s.docs.map(d=>({id:d.id,...d.data()}))));  },[]);
  const add=async()=>{ if(!f.subject)return; await addData("wifaq_compliance",{...f,syllabusCompleted:Number(f.syllabusCompleted),totalSyllabus:Number(f.totalSyllabus)}); setShow(false); setF({subject:"",class:"",teacher:"",syllabusCompleted:0,totalSyllabus:100,examDate:"",examType:"internal",status:"in_progress",notes:""}); };
  const subjects=["تفسیر","حدیث","فقہ","عقیدہ","نحو","صرف","بلاغت","منطق","فلسفہ","سیرت","تجوید","اردو","انگریزی","ریاضی"];
  const statConfig={in_progress:{c:C.amber,l:"جاری"},completed:{c:C.green,l:"مکمل"},delayed:{c:C.red,l:"تاخیر"},pending:{c:"#888",l:"زیر التوا"}};
  const overallPct=records.length>0?Math.round(records.reduce((s,r)=>s+Math.round((r.syllabusCompleted/r.totalSyllabus)*100),0)/records.length):0;
  return <div style={S.page}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
      <div><div style={{fontSize:"1.1rem",fontWeight:"700",color:C.navy}}>🕌 وفاق کمپلائنس</div><div style={{fontSize:"0.62rem",color:"#888",marginTop:"2px"}}>نصاب تکمیل — وفاق المدارس معیار</div></div>
      <button style={S.addBtn} onClick={()=>setShow(!show)}>+ نیا مضمون</button>
    </div>
    <div style={{...S.card,marginBottom:"20px",background:`linear-gradient(135deg,${C.navyDark},${C.navyMid})`,color:C.white,textAlign:"center"}}>
      <div style={{fontSize:"0.65rem",opacity:0.6,marginBottom:"8px"}}>مجموعی نصاب تکمیل</div>
      <div style={{fontSize:"3rem",fontWeight:"900",color:C.gold}}>{overallPct}%</div>
      <div style={{marginTop:"12px",background:"rgba(255,255,255,0.1)",borderRadius:"20px",height:"8px",overflow:"hidden"}}><div style={{height:"100%",background:`linear-gradient(90deg,${C.gold},${C.goldDark})`,width:`${overallPct}%`,borderRadius:"20px"}}/></div>
      <div style={{fontSize:"0.6rem",opacity:0.6,marginTop:"8px"}}>{records.length} مضامین</div>
    </div>
    {show&&<div style={{...S.card,marginBottom:"20px",background:`linear-gradient(135deg,${C.goldLight},#fdf8ee)`}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>مضمون *</label><select style={S.inpSm} value={f.subject} onChange={e=>setF({...f,subject:e.target.value})}><option value="">-- منتخب کریں --</option>{subjects.map(s=><option key={s}>{s}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>جماعت</label><input style={S.inpSm} value={f.class} onChange={e=>setF({...f,class:e.target.value})} placeholder="ثانیہ، ثالثہ..."/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>استاد</label><input style={S.inpSm} value={f.teacher} onChange={e=>setF({...f,teacher:e.target.value})} placeholder="نام..."/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>حال</label><select style={S.inpSm} value={f.status} onChange={e=>setF({...f,status:e.target.value})}>{Object.entries(statConfig).map(([k,v])=><option key={k} value={k}>{v.l}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>مکمل دروس</label><input style={{...S.inpSm,direction:"ltr"}} type="number" value={f.syllabusCompleted} onChange={e=>setF({...f,syllabusCompleted:e.target.value})}/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>کل دروس</label><input style={{...S.inpSm,direction:"ltr"}} type="number" value={f.totalSyllabus} onChange={e=>setF({...f,totalSyllabus:e.target.value})}/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>امتحان تاریخ</label><input style={{...S.inpSm,direction:"ltr"}} type="date" value={f.examDate} onChange={e=>setF({...f,examDate:e.target.value})}/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>قسم</label><select style={S.inpSm} value={f.examType} onChange={e=>setF({...f,examType:e.target.value})}><option value="internal">اندرونی</option><option value="wifaq">وفاق</option><option value="board">بورڈ</option></select></div>
      </div>
      <button style={S.saveBtn} onClick={add}>✅ محفوظ کریں</button>
    </div>}
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:"14px"}}>
      {records.map(r=>{ const sc=statConfig[r.status]||statConfig.in_progress; const pct=Math.round((r.syllabusCompleted/(r.totalSyllabus||1))*100); return <div key={r.id} style={{...S.card,borderTop:`4px solid ${sc.c}`}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:"8px"}}><div><div style={{fontSize:"0.82rem",fontWeight:"700",color:C.navy}}>🕌 {r.subject}</div><div style={{fontSize:"0.6rem",color:"#888",marginTop:"2px"}}>{r.class} • {r.teacher}</div></div><span style={hBadge(sc.c,sc.c+"15")}>{sc.l}</span></div>
        <div style={{marginBottom:"6px"}}>{pBar(r.syllabusCompleted,r.totalSyllabus||1,pct>=80?C.green:pct>=50?C.amber:C.red)}</div>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:"0.62rem"}}><span style={{color:"#888"}}>{r.syllabusCompleted}/{r.totalSyllabus} دروس</span><span style={{fontWeight:"700",color:pct>=80?C.green:pct>=50?C.amber:C.red}}>{pct}%</span></div>
        {r.examDate&&<div style={{fontSize:"0.58rem",color:C.gold,marginTop:"6px",fontFamily:"monospace",direction:"ltr"}}>امتحان: {r.examDate}</div>}
      </div>; })}
      {records.length===0&&<div style={{...S.card,textAlign:"center",color:"#bbb",padding:"40px",gridColumn:"1/-1"}}>کوئی ریکارڈ نہیں</div>}
    </div>
  </div>;
}

// ===================== TARBIYAH ETHICS MONITOR =====================
function TarbiyahEthics({students,addData}){
  const [logs,setLogs]=useState([]); const [show,setShow]=useState(false);
  const [f,setF]=useState({studentId:"",date:new Date().toISOString().split("T")[0],category:"adab",description:"",points:5,type:"positive"});
  useEffect(()=>{ return onSnapshot(query(collection(db,"ethics_logs"),orderBy("createdAt","desc"),limit(100)),s=>setLogs(s.docs.map(d=>({id:d.id,...d.data()}))));  },[]);
  const add=async()=>{ if(!f.studentId)return; await addData("ethics_logs",{...f,points:Number(f.points)}); setShow(false); setF({studentId:"",date:new Date().toISOString().split("T")[0],category:"adab",description:"",points:5,type:"positive"}); };
  const cats={adab:{c:C.gold,bg:C.goldLight,i:"🌟",l:"ادب"},prayer:{c:C.purple,bg:"#ede9fe",i:"🕌",l:"نماز"},quran:{c:C.green,bg:"#dcfce7",i:"📖",l:"قرآن"},honesty:{c:C.abuBakr,bg:"#dbeafe",i:"✨",l:"صداقت"},discipline:{c:C.navy,bg:"#e0e7ff",i:"⚡",l:"نظم"},helping:{c:C.teal,bg:"#ccfbf1",i:"🤝",l:"تعاون"},misconduct:{c:C.red,bg:"#fee2e2",i:"⚠️",l:"خلاف ورزی"}};
  const studentPoints=students.map(s=>{ const sL=logs.filter(l=>l.studentId===s.id); const pos=sL.filter(l=>l.type==="positive").reduce((sum,l)=>sum+(l.points||0),0); const neg=sL.filter(l=>l.type==="negative").reduce((sum,l)=>sum+(l.points||0),0); return {...s,points:pos-neg,logs:sL.length}; }).sort((a,b)=>b.points-a.points);
  return <div style={S.page}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
      <div><div style={{fontSize:"1.1rem",fontWeight:"700",color:C.navy}}>🌟 تربیت اخلاق مانیٹر</div><div style={{fontSize:"0.62rem",color:"#888",marginTop:"2px"}}>کردار، ادب، اخلاق کا ریکارڈ</div></div>
      <button style={S.addBtn} onClick={()=>setShow(!show)}>+ نئی انٹری</button>
    </div>
    {show&&<div style={{...S.card,marginBottom:"20px",background:`linear-gradient(135deg,${C.goldLight},#fdf8ee)`,border:`2px solid ${C.gold}30`}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>طالب علم *</label><select style={S.inpSm} value={f.studentId} onChange={e=>setF({...f,studentId:e.target.value})}><option value="">-- منتخب کریں --</option>{students.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>قسم</label><select style={S.inpSm} value={f.type} onChange={e=>setF({...f,type:e.target.value})}><option value="positive">✅ مثبت</option><option value="negative">❌ منفی</option></select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>زمرہ</label><select style={S.inpSm} value={f.category} onChange={e=>setF({...f,category:e.target.value})}>{Object.entries(cats).map(([k,v])=><option key={k} value={k}>{v.i} {v.l}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>پوائنٹس</label><input style={{...S.inpSm,direction:"ltr"}} type="number" min="1" max="50" value={f.points} onChange={e=>setF({...f,points:e.target.value})}/></div>
        <div style={{gridColumn:"1/-1"}}><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>تفصیل</label><textarea style={{...S.inpSm,minHeight:"60px",resize:"vertical"}} value={f.description} onChange={e=>setF({...f,description:e.target.value})} placeholder="واقعے کی تفصیل..."/></div>
      </div>
      <button style={{...S.saveBtn,background:f.type==="positive"?`linear-gradient(135deg,${C.green},#15803d)`:`linear-gradient(135deg,${C.red},#991b1b)`}} onClick={add}>{f.type==="positive"?"✅ مثبت درج":"❌ منفی درج"}</button>
    </div>}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"20px"}}>
      <div style={S.card}>
        <div style={{fontSize:"0.85rem",fontWeight:"700",color:C.navy,marginBottom:"16px"}}>🏆 اخلاق لیڈر بورڈ</div>
        {studentPoints.slice(0,10).map((s,i)=>{ const h=HOUSES.find(x=>x.id===s.houseId)||{}; return <div key={s.id} style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"10px",padding:"8px 10px",background:i===0?"linear-gradient(135deg,#fef3c7,#fff)":"#fafaf8",borderRadius:"10px"}}>
          <div style={{width:"26px",height:"26px",borderRadius:"50%",background:i===0?`linear-gradient(135deg,${C.gold},${C.goldDark})`:"#eee",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.6rem",fontWeight:"900",color:i===0?C.white:"#aaa",flexShrink:0}}>{i===0?"👑":i+1}</div>
          <span style={{fontSize:"1rem"}}>{h.emoji||"👤"}</span>
          <div style={{flex:1}}><div style={{fontSize:"0.7rem",fontWeight:"700",color:C.navy}}>{s.name}</div><div style={{fontSize:"0.55rem",color:"#888"}}>{s.logs} انٹری</div></div>
          <span style={{fontSize:"0.82rem",fontWeight:"900",color:s.points>=0?C.green:C.red}}>{s.points>0?"+":""}{s.points}</span>
        </div>; })}
        {studentPoints.length===0&&<div style={{textAlign:"center",color:"#bbb",padding:"20px"}}>کوئی ڈیٹا نہیں</div>}
      </div>
      <div style={S.card}>
        <div style={{fontSize:"0.85rem",fontWeight:"700",color:C.navy,marginBottom:"16px"}}>📋 حالیہ انٹریاں</div>
        {logs.slice(0,8).map(l=>{ const tc=cats[l.category]||cats.adab; const st=students.find(s=>s.id===l.studentId); return <div key={l.id} style={{display:"flex",gap:"10px",marginBottom:"10px",padding:"8px 10px",background:l.type==="positive"?"#f0fdf4":"#fff5f5",borderRadius:"10px"}}>
          <span style={{fontSize:"1.1rem"}}>{tc.i}</span>
          <div style={{flex:1}}><div style={{fontSize:"0.68rem",fontWeight:"700",color:C.navy}}>{st?.name||"—"}</div><div style={{fontSize:"0.58rem",color:"#888"}}>{l.description?.slice(0,50)}</div></div>
          <span style={{fontSize:"0.7rem",fontWeight:"800",color:l.type==="positive"?C.green:C.red}}>{l.type==="positive"?"+":"-"}{l.points}</span>
        </div>; })}
        {logs.length===0&&<div style={{textAlign:"center",color:"#bbb",padding:"20px"}}>کوئی انٹری نہیں</div>}
      </div>
    </div>
  </div>;
}

// ===================== ALUMNI PORTAL =====================
function AlumniPortal({addData}){
  const [alumni,setAlumni]=useState([]); const [show,setShow]=useState(false);
  const [f,setF]=useState({name:"",graduationYear:"",field:"",university:"",job:"",phone:"",achievement:"",houseId:"",notes:""});
  useEffect(()=>{ return onSnapshot(query(collection(db,"alumni"),orderBy("createdAt","desc"),limit(50)),s=>setAlumni(s.docs.map(d=>({id:d.id,...d.data()}))));  },[]);
  const add=async()=>{ if(!f.name)return; await addData("alumni",{...f}); setShow(false); setF({name:"",graduationYear:"",field:"",university:"",job:"",phone:"",achievement:"",houseId:"",notes:""}); };
  const fields={medicine:"🏥 طب",engineering:"⚙️ انجینئرنگ",islamic:"🕌 اسلامی علوم",teaching:"👨‍🏫 تدریس",business:"💼 تجارت",government:"🏛️ سرکاری",other:"📋 دیگر"};
  const byYear=alumni.reduce((acc,a)=>{ const y=a.graduationYear||"نامعلوم"; if(!acc[y])acc[y]=[]; acc[y].push(a); return acc; },{});
  return <div style={S.page}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
      <div><div style={{fontSize:"1.1rem",fontWeight:"700",color:C.navy}}>🎓 سابق طلبا پورٹل</div><div style={{fontSize:"0.62rem",color:"#888",marginTop:"2px"}}>فارغ التحصیل — کامیابیاں و رابطہ</div></div>
      <button style={S.addBtn} onClick={()=>setShow(!show)}>+ نیا سابق طالب علم</button>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:"12px",marginBottom:"20px"}}>
      {[{c:C.gold,i:"🎓",n:alumni.length,l:"کل سابق طلبا"},{c:C.green,i:"🏥",n:alumni.filter(a=>a.field==="medicine").length,l:"ڈاکٹر"},{c:C.abuBakr,i:"⚙️",n:alumni.filter(a=>a.field==="engineering").length,l:"انجینئر"},{c:C.purple,i:"🕌",n:alumni.filter(a=>a.field==="islamic").length,l:"عالم دین"}].map((x,i)=><div key={i} style={{background:`linear-gradient(135deg,${x.c}12,${x.c}05)`,borderRadius:"16px",padding:"16px",border:`2px solid ${x.c}20`,textAlign:"center"}}><div style={{fontSize:"1.3rem"}}>{x.i}</div><div style={{fontSize:"1.4rem",fontWeight:"900",color:x.c}}>{x.n}</div><div style={{fontSize:"0.6rem",color:"#888"}}>{x.l}</div></div>)}
    </div>
    {show&&<div style={{...S.card,marginBottom:"20px",background:`linear-gradient(135deg,${C.goldLight},#fdf8ee)`,border:`2px solid ${C.gold}30`}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>نام *</label><input style={S.inpSm} value={f.name} onChange={e=>setF({...f,name:e.target.value})} placeholder="مکمل نام..."/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>فراغت سال</label><input style={{...S.inpSm,direction:"ltr"}} value={f.graduationYear} onChange={e=>setF({...f,graduationYear:e.target.value})} placeholder="2020"/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>شعبہ</label><select style={S.inpSm} value={f.field} onChange={e=>setF({...f,field:e.target.value})}><option value="">-- منتخب کریں --</option>{Object.entries(fields).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>ہاؤس</label><select style={S.inpSm} value={f.houseId} onChange={e=>setF({...f,houseId:e.target.value})}><option value="">-- منتخب کریں --</option>{HOUSES.map(h=><option key={h.id} value={h.id}>{h.emoji} {h.nameEn}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>یونیورسٹی</label><input style={S.inpSm} value={f.university} onChange={e=>setF({...f,university:e.target.value})} placeholder="یونیورسٹی کا نام..."/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>موجودہ عہدہ</label><input style={S.inpSm} value={f.job} onChange={e=>setF({...f,job:e.target.value})} placeholder="ڈاکٹر، استاد..."/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>فون</label><input style={{...S.inpSm,direction:"ltr"}} value={f.phone} onChange={e=>setF({...f,phone:e.target.value})} placeholder="03xx-xxxxxxx"/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>نمایاں کامیابی</label><input style={S.inpSm} value={f.achievement} onChange={e=>setF({...f,achievement:e.target.value})} placeholder="اہم کامیابی..."/></div>
      </div>
      <button style={S.saveBtn} onClick={add}>✅ محفوظ کریں</button>
    </div>}
    <div style={{display:"flex",flexDirection:"column",gap:"20px"}}>
      {Object.entries(byYear).sort((a,b)=>b[0].localeCompare(a[0])).map(([year,list])=><div key={year}>
        <div style={{fontSize:"0.75rem",fontWeight:"800",color:C.gold,marginBottom:"12px",borderBottom:`2px solid ${C.goldLight}`,paddingBottom:"6px"}}>🎓 {year} — {list.length} فارغ التحصیل</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:"12px"}}>
          {list.map(a=>{ const h=HOUSES.find(x=>x.id===a.houseId)||{}; const fi=fields[a.field]||fields.other; return <div key={a.id} style={{...S.card,borderRight:`4px solid ${h.color||C.gold}`}}>
            <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"10px"}}>
              <div style={{width:"44px",height:"44px",borderRadius:"50%",background:h.gradient||`linear-gradient(135deg,${C.gold},${C.goldDark})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.2rem",flexShrink:0}}>{h.emoji||"🎓"}</div>
              <div><div style={{fontSize:"0.82rem",fontWeight:"700",color:C.navy}}>{a.name}</div><div style={{fontSize:"0.6rem",color:"#888"}}>{fi}</div></div>
            </div>
            {a.university&&<div style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px"}}>🏫 {a.university}</div>}
            {a.job&&<div style={{fontSize:"0.62rem",color:C.abuBakr,marginBottom:"4px",fontWeight:"600"}}>💼 {a.job}</div>}
            {a.achievement&&<div style={{background:C.goldLight,borderRadius:"8px",padding:"6px 10px",fontSize:"0.6rem",color:C.goldDark}}>⭐ {a.achievement}</div>}
          </div>; })}
        </div>
      </div>)}
      {alumni.length===0&&<div style={{...S.card,textAlign:"center",color:"#bbb",padding:"60px"}}><div style={{fontSize:"3rem",marginBottom:"12px"}}>🎓</div>ابھی کوئی سابق طالب علم نہیں</div>}
    </div>
  </div>;
}

// ===================== CAMPUS SECURITY / VISITOR HUB =====================
function VisitorHub({addData}){
  const [visitors,setVisitors]=useState([]); const [show,setShow]=useState(false);
  const [f,setF]=useState({name:"",cnic:"",phone:"",purpose:"meeting",meetingWith:"",vehicleNo:"",checkIn:new Date().toTimeString().slice(0,5),date:new Date().toISOString().split("T")[0]});
  useEffect(()=>{ return onSnapshot(query(collection(db,"visitors"),orderBy("createdAt","desc"),limit(50)),s=>setVisitors(s.docs.map(d=>({id:d.id,...d.data()}))));  },[]);
  const add=async()=>{ if(!f.name)return; await addData("visitors",{...f,status:"inside"}); setShow(false); setF({name:"",cnic:"",phone:"",purpose:"meeting",meetingWith:"",vehicleNo:"",checkIn:new Date().toTimeString().slice(0,5),date:new Date().toISOString().split("T")[0]}); };
  const checkout=async(id)=>{ await updateDoc(doc(db,"visitors",id),{status:"left",checkOut:new Date().toTimeString().slice(0,5)}); };
  const purposes={meeting:{c:C.abuBakr,i:"🤝",l:"ملاقات"},delivery:{c:C.amber,i:"📦",l:"ڈیلیوری"},maintenance:{c:C.teal,i:"🔧",l:"مرمت"},parent:{c:C.green,i:"👪",l:"والدین"},official:{c:C.gold,i:"🏛️",l:"سرکاری"},other:{c:"#888",i:"👤",l:"دیگر"}};
  const inside=visitors.filter(v=>v.status==="inside");
  return <div style={S.page}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
      <div><div style={{fontSize:"1.1rem",fontWeight:"700",color:C.navy}}>🔒 سیکیورٹی / وزیٹر ہب</div><div style={{fontSize:"0.62rem",color:"#888",marginTop:"2px"}}>آنے جانے والوں کا ریکارڈ</div></div>
      <button style={S.addBtn} onClick={()=>setShow(!show)}>+ نیا وزیٹر</button>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:"12px",marginBottom:"20px"}}>
      {[{c:C.green,i:"✅",n:inside.length,l:"ابھی اندر"},{c:C.abuBakr,i:"👥",n:visitors.filter(v=>v.date===new Date().toISOString().split("T")[0]).length,l:"آج کے وزیٹر"},{c:C.gold,i:"📋",n:visitors.length,l:"کل ریکارڈ"},{c:C.amber,i:"🚗",n:visitors.filter(v=>v.vehicleNo&&v.status==="inside").length,l:"گاڑیاں اندر"}].map((x,i)=><div key={i} style={{background:`linear-gradient(135deg,${x.c}12,${x.c}05)`,borderRadius:"16px",padding:"16px",border:`2px solid ${x.c}20`,textAlign:"center"}}><div style={{fontSize:"1.3rem"}}>{x.i}</div><div style={{fontSize:"1.4rem",fontWeight:"900",color:x.c}}>{x.n}</div><div style={{fontSize:"0.6rem",color:"#888"}}>{x.l}</div></div>)}
    </div>
    {inside.length>0&&<div style={{...S.card,marginBottom:"20px",background:"linear-gradient(135deg,#dcfce7,#f0fdf4)",border:`2px solid ${C.green}20`}}>
      <div style={{fontSize:"0.78rem",fontWeight:"700",color:C.green,marginBottom:"12px"}}>✅ ابھی کیمپس میں ({inside.length})</div>
      {inside.map(v=>{ const p=purposes[v.purpose]||purposes.other; return <div key={v.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"10px",background:C.white,borderRadius:"10px",padding:"10px 14px"}}>
        <div><div style={{fontSize:"0.75rem",fontWeight:"700",color:C.navy}}>{p.i} {v.name}</div><div style={{fontSize:"0.6rem",color:"#888"}}>{p.l} {v.meetingWith&&`• ${v.meetingWith}`}</div><div style={{fontSize:"0.58rem",color:C.green,fontFamily:"monospace",direction:"ltr"}}>داخل: {v.checkIn}</div></div>
        <button onClick={()=>checkout(v.id)} style={{...S.dangerBtn,padding:"6px 12px",fontSize:"0.6rem"}}>🚪 خروج</button>
      </div>; })}
    </div>}
    {show&&<div style={{...S.card,marginBottom:"20px",background:`linear-gradient(135deg,${C.goldLight},#fdf8ee)`,border:`2px solid ${C.gold}30`}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>نام *</label><input style={S.inpSm} value={f.name} onChange={e=>setF({...f,name:e.target.value})} placeholder="وزیٹر کا نام..."/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>فون</label><input style={{...S.inpSm,direction:"ltr"}} value={f.phone} onChange={e=>setF({...f,phone:e.target.value})} placeholder="03xx-xxxxxxx"/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>مقصد</label><select style={S.inpSm} value={f.purpose} onChange={e=>setF({...f,purpose:e.target.value})}>{Object.entries(purposes).map(([k,v])=><option key={k} value={k}>{v.i} {v.l}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>ملاقات کس سے</label><input style={S.inpSm} value={f.meetingWith} onChange={e=>setF({...f,meetingWith:e.target.value})} placeholder="استاد / افسر..."/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>CNIC</label><input style={{...S.inpSm,direction:"ltr"}} value={f.cnic} onChange={e=>setF({...f,cnic:e.target.value})} placeholder="xxxxx-xxxxxxx-x"/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>گاڑی نمبر</label><input style={{...S.inpSm,direction:"ltr"}} value={f.vehicleNo} onChange={e=>setF({...f,vehicleNo:e.target.value})} placeholder="LEA-xxx"/></div>
      </div>
      <button style={S.saveBtn} onClick={add}>✅ وزیٹر رجسٹر کریں</button>
    </div>}
    <div style={S.card}><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}>
      <thead><tr><th style={S.th}>نام</th><th style={S.th}>مقصد</th><th style={S.th}>داخل</th><th style={S.th}>حال</th><th style={S.th}>عمل</th></tr></thead>
      <tbody>{visitors.slice(0,30).map(v=>{ const p=purposes[v.purpose]||purposes.other; return <tr key={v.id}>
        <td style={{...S.td,fontWeight:"700"}}>{v.name}</td>
        <td style={S.td}><span style={hBadge(p.c,p.c+"15")}>{p.i} {p.l}</span></td>
        <td style={{...S.td,fontFamily:"monospace",direction:"ltr",fontSize:"0.6rem"}}>{v.checkIn}</td>
        <td style={S.td}><span style={{padding:"3px 8px",borderRadius:"20px",fontSize:"0.55rem",fontWeight:"700",background:v.status==="inside"?"#dcfce7":"#f3f4f6",color:v.status==="inside"?C.green:"#888"}}>{v.status==="inside"?"اندر":"باہر"}</span></td>
        <td style={S.td}>{v.status==="inside"&&<button onClick={()=>checkout(v.id)} style={{...S.dangerBtn,padding:"4px 8px",fontSize:"0.55rem"}}>خروج</button>}</td>
      </tr>; })}{visitors.length===0&&<tr><td colSpan={5} style={{...S.td,textAlign:"center",color:"#bbb",padding:"40px"}}>کوئی ریکارڈ نہیں</td></tr>}</tbody>
    </table></div></div>
  </div>;
}

// ===================== EXAM SEATING MANAGEMENT =====================
function ExamSeating({students,addData}){
  const [plans,setPlans]=useState([]); const [show,setShow]=useState(false); const [sel,setSel]=useState(null);
  const [f,setF]=useState({examName:"",date:"",venue:"",rows:5,cols:6,subject:"",examClass:""});
  useEffect(()=>{ return onSnapshot(query(collection(db,"exam_seating"),orderBy("createdAt","desc"),limit(20)),s=>setPlans(s.docs.map(d=>({id:d.id,...d.data()}))));  },[]);
  const create=async()=>{ if(!f.examName)return;
    const rows=Number(f.rows); const cols=Number(f.cols);
    const classStudents=students.filter(s=>!f.examClass||s.grade===f.examClass);
    const shuffled=[...classStudents].sort(()=>Math.random()-0.5);
    const seats=[];
    for(let r=1;r<=rows;r++){ for(let c=1;c<=cols;c++){ const idx=(r-1)*cols+(c-1); const st=shuffled[idx]; seats.push({row:r,col:c,seatNo:`R${r}C${c}`,studentId:st?.id||null,studentName:st?.name||null,studentCode:st?.studentCode||null}); }}
    await addData("exam_seating",{...f,rows,cols,seats,totalSeats:rows*cols,assignedSeats:shuffled.length});
    setShow(false); setF({examName:"",date:"",venue:"",rows:5,cols:6,subject:"",examClass:""});
  };
  if(sel){ return <div style={S.page}>
    <button style={{...S.addBtn,marginBottom:"16px",background:"#eee",color:C.navy,boxShadow:"none"}} onClick={()=>setSel(null)}>← واپس</button>
    <div style={{...S.card,marginBottom:"20px",background:`linear-gradient(135deg,${C.navy},${C.navyMid})`,color:C.white}}>
      <div style={{fontSize:"1rem",fontWeight:"800"}}>{sel.examName}</div>
      <div style={{fontSize:"0.62rem",opacity:0.7,marginTop:"4px"}}>{sel.subject} • {sel.venue} • {sel.date}</div>
      <div style={{fontSize:"0.68rem",color:C.gold,marginTop:"8px"}}>{sel.assignedSeats}/{sel.totalSeats} نشستیں مختص</div>
    </div>
    <div style={{overflowX:"auto"}}><div style={{display:"grid",gridTemplateColumns:`repeat(${sel.cols},1fr)`,gap:"6px",minWidth:`${sel.cols*80}px`}}>
      {(sel.seats||[]).map((seat,i)=><div key={i} style={{background:seat.studentId?"linear-gradient(135deg,#dbeafe,#eff6ff)":"#f9fafb",borderRadius:"8px",padding:"8px 6px",textAlign:"center",border:`1px solid ${seat.studentId?C.abuBakr+"40":"#e5e7eb"}`,minHeight:"64px",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
        <div style={{fontSize:"0.55rem",color:"#aaa",marginBottom:"2px"}}>{seat.seatNo}</div>
        {seat.studentName?<><div style={{fontSize:"0.58rem",fontWeight:"700",color:C.navy,lineHeight:"1.3"}}>{seat.studentName.split(" ")[0]}</div><div style={{fontSize:"0.5rem",color:C.abuBakr,fontFamily:"monospace",direction:"ltr"}}>{seat.studentCode}</div></>:<div style={{fontSize:"0.6rem",color:"#ddd"}}>خالی</div>}
      </div>)}
    </div></div>
  </div>; }
  return <div style={S.page}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
      <div><div style={{fontSize:"1.1rem",fontWeight:"700",color:C.navy}}>🪑 امتحان نشست بندی</div><div style={{fontSize:"0.62rem",color:"#888",marginTop:"2px"}}>سیٹنگ پلان — خودکار ترتیب</div></div>
      <button style={S.addBtn} onClick={()=>setShow(!show)}>+ نیا پلان</button>
    </div>
    {show&&<div style={{...S.card,marginBottom:"20px",background:`linear-gradient(135deg,${C.goldLight},#fdf8ee)`,border:`2px solid ${C.gold}30`}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div style={{gridColumn:"1/-1"}}><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>امتحان کا نام *</label><input style={S.inpSm} value={f.examName} onChange={e=>setF({...f,examName:e.target.value})} placeholder="سالانہ امتحان 2026..."/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>مضمون</label><input style={S.inpSm} value={f.subject} onChange={e=>setF({...f,subject:e.target.value})} placeholder="ریاضی، اردو..."/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>ہال / کمرہ</label><input style={S.inpSm} value={f.venue} onChange={e=>setF({...f,venue:e.target.value})} placeholder="ہال A..."/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>تاریخ</label><input style={{...S.inpSm,direction:"ltr"}} type="date" value={f.date} onChange={e=>setF({...f,date:e.target.value})}/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>جماعت (خالی = سب)</label><input style={S.inpSm} value={f.examClass} onChange={e=>setF({...f,examClass:e.target.value})} placeholder="8, 9, 10..."/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>قطاریں</label><input style={{...S.inpSm,direction:"ltr"}} type="number" min="1" max="20" value={f.rows} onChange={e=>setF({...f,rows:e.target.value})}/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>کالم</label><input style={{...S.inpSm,direction:"ltr"}} type="number" min="1" max="20" value={f.cols} onChange={e=>setF({...f,cols:e.target.value})}/></div>
      </div>
      <div style={{background:C.white,borderRadius:"10px",padding:"10px 14px",marginBottom:"12px",fontSize:"0.65rem",color:"#888"}}>ℹ️ طلبا خودبخود random ترتیب سے بیٹھیں گے — کل {Number(f.rows)*Number(f.cols)} نشستیں</div>
      <button style={S.saveBtn} onClick={create}>🪑 پلان بنائیں</button>
    </div>}
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:"14px"}}>
      {plans.map(p=><div key={p.id} style={{...S.card,cursor:"pointer",borderTop:`4px solid ${C.gold}`}} onClick={()=>setSel(p)}>
        <div style={{fontSize:"0.85rem",fontWeight:"700",color:C.navy,marginBottom:"6px"}}>🪑 {p.examName}</div>
        <div style={{fontSize:"0.65rem",color:"#888",marginBottom:"8px"}}>{p.subject} • {p.venue}</div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:"0.62rem",color:C.gold,fontFamily:"monospace",direction:"ltr"}}>{p.date}</span>
          <span style={hBadge(C.abuBakr,"#dbeafe")}>{p.assignedSeats}/{p.totalSeats} طلبا</span>
        </div>
        <div style={{marginTop:"10px",fontSize:"0.6rem",color:C.abuBakr,fontWeight:"600"}}>👁️ پلان دیکھیں ←</div>
      </div>)}
      {plans.length===0&&<div style={{...S.card,textAlign:"center",color:"#bbb",padding:"40px",gridColumn:"1/-1"}}>کوئی پلان نہیں</div>}
    </div>
  </div>;
}

// ===================== FACULTY PROFESSIONAL DEVELOPMENT =====================
function FacultyDevelopment({teachers,addData}){
  const [programs,setPrograms]=useState([]); const [enrollments,setEnrollments]=useState([]); const [show,setShow]=useState(false); const [tab,setTab]=useState("programs");
  const [f,setF]=useState({title:"",type:"training",trainer:"",startDate:"",endDate:"",hours:0,description:"",certificate:false});
  const [enrF,setEnrF]=useState({teacherId:"",programId:"",status:"enrolled",score:"",notes:""});
  useEffect(()=>{
    const u1=onSnapshot(collection(db,"faculty_programs"),s=>setPrograms(s.docs.map(d=>({id:d.id,...d.data()}))));
    const u2=onSnapshot(collection(db,"faculty_enrollments"),s=>setEnrollments(s.docs.map(d=>({id:d.id,...d.data()}))));
    return()=>{u1();u2();};
  },[]);
  const add=async()=>{ if(!f.title)return; await addData("faculty_programs",{...f,hours:Number(f.hours)}); setShow(false); setF({title:"",type:"training",trainer:"",startDate:"",endDate:"",hours:0,description:"",certificate:false}); };
  const enroll=async()=>{ if(!enrF.teacherId||!enrF.programId)return; await addData("faculty_enrollments",{...enrF}); setEnrF({teacherId:"",programId:"",status:"enrolled",score:"",notes:""}); };
  const types={training:{c:C.abuBakr,bg:"#dbeafe",i:"🎓",l:"تربیت"},workshop:{c:C.green,bg:"#dcfce7",i:"🔧",l:"ورکشاپ"},seminar:{c:C.purple,bg:"#ede9fe",i:"🎤",l:"سیمینار"},online:{c:C.teal,bg:"#ccfbf1",i:"💻",l:"آن لائن"},islamic:{c:C.gold,bg:C.goldLight,i:"🕌",l:"اسلامی"}};
  return <div style={S.page}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
      <div><div style={{fontSize:"1.1rem",fontWeight:"700",color:C.navy}}>👩‍🏫 استاد ترقی پروگرام</div><div style={{fontSize:"0.62rem",color:"#888",marginTop:"2px"}}>تربیتی پروگرام، ورکشاپ، سند</div></div>
      <button style={S.addBtn} onClick={()=>setShow(!show)}>+ نیا پروگرام</button>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:"12px",marginBottom:"20px"}}>
      {[{c:C.abuBakr,i:"📋",n:programs.length,l:"پروگرام"},{c:C.green,i:"✅",n:enrollments.filter(e=>e.status==="completed").length,l:"مکمل"},{c:C.amber,i:"⏳",n:enrollments.filter(e=>e.status==="enrolled").length,l:"جاری"},{c:C.gold,i:"🏆",n:enrollments.filter(e=>e.status==="completed"&&e.score).length,l:"سند یافتہ"}].map((x,i)=><div key={i} style={{background:`linear-gradient(135deg,${x.c}12,${x.c}05)`,borderRadius:"16px",padding:"16px",border:`2px solid ${x.c}20`,textAlign:"center"}}><div style={{fontSize:"1.3rem"}}>{x.i}</div><div style={{fontSize:"1.4rem",fontWeight:"900",color:x.c}}>{x.n}</div><div style={{fontSize:"0.6rem",color:"#888"}}>{x.l}</div></div>)}
    </div>
    {show&&<div style={{...S.card,marginBottom:"20px",background:`linear-gradient(135deg,${C.goldLight},#fdf8ee)`}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div style={{gridColumn:"1/-1"}}><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>پروگرام کا نام *</label><input style={S.inpSm} value={f.title} onChange={e=>setF({...f,title:e.target.value})} placeholder="Modern Teaching Methods..."/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>قسم</label><select style={S.inpSm} value={f.type} onChange={e=>setF({...f,type:e.target.value})}>{Object.entries(types).map(([k,v])=><option key={k} value={k}>{v.i} {v.l}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>ٹرینر</label><input style={S.inpSm} value={f.trainer} onChange={e=>setF({...f,trainer:e.target.value})} placeholder="ٹرینر کا نام..."/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>شروع</label><input style={{...S.inpSm,direction:"ltr"}} type="date" value={f.startDate} onChange={e=>setF({...f,startDate:e.target.value})}/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>اختتام</label><input style={{...S.inpSm,direction:"ltr"}} type="date" value={f.endDate} onChange={e=>setF({...f,endDate:e.target.value})}/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>گھنٹے</label><input style={{...S.inpSm,direction:"ltr"}} type="number" value={f.hours} onChange={e=>setF({...f,hours:e.target.value})}/></div>
        <div style={{display:"flex",alignItems:"center",gap:"8px",paddingTop:"20px"}}><input type="checkbox" checked={f.certificate} onChange={e=>setF({...f,certificate:e.target.checked})} id="cert"/><label htmlFor="cert" style={{fontSize:"0.68rem",color:C.navy,cursor:"pointer"}}>🏆 سند دی جائے گی</label></div>
      </div>
      <button style={S.saveBtn} onClick={add}>✅ پروگرام شامل کریں</button>
    </div>}
    <div style={{display:"flex",gap:"8px",marginBottom:"16px"}}>{[["programs","📋 پروگرام"],["enroll","➕ اندراج"],["history","📊 تاریخ"]].map(([t,l])=><button key={t} onClick={()=>setTab(t)} style={{padding:"8px 14px",borderRadius:"10px",border:"none",cursor:"pointer",fontSize:"0.65rem",fontWeight:tab===t?"700":"400",background:tab===t?`linear-gradient(135deg,${C.gold},${C.goldDark})`:C.white,color:tab===t?C.white:"#888",fontFamily:"inherit"}}>{l}</button>)}</div>
    {tab==="programs"&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:"14px"}}>
      {programs.map(p=>{ const tc=types[p.type]||types.training; const enrolled=enrollments.filter(e=>e.programId===p.id).length; return <div key={p.id} style={{...S.card,borderTop:`4px solid ${tc.c}`}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:"8px"}}><div style={{fontSize:"0.82rem",fontWeight:"700",color:C.navy}}>{tc.i} {p.title}</div><span style={hBadge(tc.c,tc.bg)}>{tc.l}</span></div>
        {p.trainer&&<div style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px"}}>👤 {p.trainer}</div>}
        <div style={{fontSize:"0.6rem",color:"#aaa",marginBottom:"8px",fontFamily:"monospace",direction:"ltr"}}>{p.startDate} → {p.endDate}</div>
        <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}><span style={{fontSize:"0.62rem",color:C.abuBakr}}>⏱️ {p.hours} گھنٹے</span><span style={hBadge(C.green,"#dcfce7")}>{enrolled} شرکاء</span>{p.certificate&&<span style={hBadge(C.gold,C.goldLight)}>🏆 سند</span>}</div>
      </div>; })}
      {programs.length===0&&<div style={{...S.card,textAlign:"center",color:"#bbb",padding:"40px",gridColumn:"1/-1"}}>کوئی پروگرام نہیں</div>}
    </div>}
    {tab==="enroll"&&<div style={{...S.card,background:`linear-gradient(135deg,${C.goldLight},#fdf8ee)`}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>استاد</label><select style={S.inpSm} value={enrF.teacherId} onChange={e=>setEnrF({...enrF,teacherId:e.target.value})}><option value="">-- منتخب کریں --</option>{teachers.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>پروگرام</label><select style={S.inpSm} value={enrF.programId} onChange={e=>setEnrF({...enrF,programId:e.target.value})}><option value="">-- منتخب کریں --</option>{programs.map(p=><option key={p.id} value={p.id}>{p.title}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>حال</label><select style={S.inpSm} value={enrF.status} onChange={e=>setEnrF({...enrF,status:e.target.value})}><option value="enrolled">اندراج</option><option value="completed">مکمل</option><option value="dropped">چھوڑا</option></select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>اسکور</label><input style={S.inpSm} value={enrF.score} onChange={e=>setEnrF({...enrF,score:e.target.value})} placeholder="A, 90%..."/></div>
      </div>
      <button style={S.saveBtn} onClick={enroll}>✅ اندراج کریں</button>
    </div>}
    {tab==="history"&&<div style={S.card}><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}>
      <thead><tr><th style={S.th}>استاد</th><th style={S.th}>پروگرام</th><th style={S.th}>حال</th><th style={S.th}>اسکور</th></tr></thead>
      <tbody>{enrollments.map(e=>{ const t=teachers.find(x=>x.id===e.teacherId); const p=programs.find(x=>x.id===e.programId); return <tr key={e.id}>
        <td style={{...S.td,fontWeight:"700"}}>{t?.name||"—"}</td><td style={S.td}>{p?.title||"—"}</td>
        <td style={S.td}><span style={{padding:"3px 8px",borderRadius:"20px",fontSize:"0.55rem",fontWeight:"700",background:e.status==="completed"?"#dcfce7":e.status==="dropped"?"#fee2e2":"#fef3c7",color:e.status==="completed"?C.green:e.status==="dropped"?C.red:C.amber}}>{e.status==="completed"?"✅ مکمل":e.status==="dropped"?"❌ چھوڑا":"⏳ جاری"}</span></td>
        <td style={S.td}>{e.score||"—"}</td>
      </tr>; })}{enrollments.length===0&&<tr><td colSpan={4} style={{...S.td,textAlign:"center",color:"#bbb",padding:"40px"}}>کوئی ریکارڈ نہیں</td></tr>}</tbody>
    </table></div></div>}
  </div>;
}

// ===================== CURRICULUM RESOURCE REPOSITORY =====================
function CurriculumHub({teachers,addData}){
  const [resources,setResources]=useState([]); const [show,setShow]=useState(false); const [filter,setFilter]=useState("all");
  const [f,setF]=useState({title:"",subject:"",grade:"",type:"notes",description:"",link:"",uploadedBy:"",tags:""});
  useEffect(()=>{ return onSnapshot(query(collection(db,"curriculum_resources"),orderBy("createdAt","desc"),limit(100)),s=>setResources(s.docs.map(d=>({id:d.id,...d.data()}))));  },[]);
  const add=async()=>{ if(!f.title)return; await addData("curriculum_resources",{...f}); setShow(false); setF({title:"",subject:"",grade:"",type:"notes",description:"",link:"",uploadedBy:"",tags:""}); };
  const types={notes:{c:C.abuBakr,bg:"#dbeafe",i:"📝",l:"نوٹس"},book:{c:C.navy,bg:"#e0e7ff",i:"📚",l:"کتاب"},video:{c:C.red,bg:"#fee2e2",i:"🎬",l:"ویڈیو"},worksheet:{c:C.green,bg:"#dcfce7",i:"📋",l:"ورک شیٹ"},exam_paper:{c:C.amber,bg:"#fef3c7",i:"📄",l:"پرچہ"},islamic:{c:C.gold,bg:C.goldLight,i:"🕌",l:"اسلامی"},other:{c:"#888",bg:"#f3f4f6",i:"📦",l:"دیگر"}};
  const filtered=filter==="all"?resources:resources.filter(r=>r.type===filter);
  return <div style={S.page}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
      <div><div style={{fontSize:"1.1rem",fontWeight:"700",color:C.navy}}>📚 نصابی وسائل</div><div style={{fontSize:"0.62rem",color:"#888",marginTop:"2px"}}>نوٹس، کتب، ویڈیو، پرچہ جات</div></div>
      <button style={S.addBtn} onClick={()=>setShow(!show)}>+ نیا وسیلہ</button>
    </div>
    <div style={{display:"flex",gap:"8px",marginBottom:"16px",flexWrap:"wrap"}}>
      {[["all","📦 سب"],["notes","📝 نوٹس"],["book","📚 کتاب"],["video","🎬 ویڈیو"],["worksheet","📋 ورک"],["exam_paper","📄 پرچہ"],["islamic","🕌 اسلامی"]].map(([t,l])=><button key={t} onClick={()=>setFilter(t)} style={{padding:"6px 12px",borderRadius:"20px",border:"none",cursor:"pointer",fontSize:"0.62rem",fontWeight:filter===t?"700":"400",background:filter===t?`linear-gradient(135deg,${C.gold},${C.goldDark})`:C.white,color:filter===t?C.white:"#888",fontFamily:"inherit"}}>{l}</button>)}
    </div>
    {show&&<div style={{...S.card,marginBottom:"20px",background:`linear-gradient(135deg,${C.goldLight},#fdf8ee)`,border:`2px solid ${C.gold}30`}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div style={{gridColumn:"1/-1"}}><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>عنوان *</label><input style={S.inpSm} value={f.title} onChange={e=>setF({...f,title:e.target.value})} placeholder="وسیلے کا نام..."/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>قسم</label><select style={S.inpSm} value={f.type} onChange={e=>setF({...f,type:e.target.value})}>{Object.entries(types).map(([k,v])=><option key={k} value={k}>{v.i} {v.l}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>مضمون</label><input style={S.inpSm} value={f.subject} onChange={e=>setF({...f,subject:e.target.value})} placeholder="ریاضی، اردو..."/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>جماعت</label><input style={S.inpSm} value={f.grade} onChange={e=>setF({...f,grade:e.target.value})} placeholder="8، 9، 10..."/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>اپلوڈ کنندہ</label><select style={S.inpSm} value={f.uploadedBy} onChange={e=>setF({...f,uploadedBy:e.target.value})}><option value="">-- منتخب کریں --</option>{teachers.map(t=><option key={t.id} value={t.name}>{t.name}</option>)}</select></div>
        <div style={{gridColumn:"1/-1"}}><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>لنک (اختیاری)</label><input style={{...S.inpSm,direction:"ltr"}} value={f.link} onChange={e=>setF({...f,link:e.target.value})} placeholder="https://..."/></div>
        <div style={{gridColumn:"1/-1"}}><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>تفصیل</label><textarea style={{...S.inpSm,minHeight:"60px",resize:"vertical"}} value={f.description} onChange={e=>setF({...f,description:e.target.value})} placeholder="مختصر تفصیل..."/></div>
      </div>
      <button style={S.saveBtn} onClick={add}>✅ شامل کریں</button>
    </div>}
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:"14px"}}>
      {filtered.map(r=>{ const tc=types[r.type]||types.other; return <div key={r.id} style={{...S.card,borderTop:`4px solid ${tc.c}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"8px"}}><div style={{flex:1}}><div style={{display:"flex",alignItems:"center",gap:"6px",marginBottom:"4px"}}><span style={{fontSize:"1.1rem"}}>{tc.i}</span><span style={{fontSize:"0.8rem",fontWeight:"700",color:C.navy}}>{r.title}</span></div></div><span style={hBadge(tc.c,tc.bg)}>{tc.l}</span></div>
        {r.subject&&<div style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px"}}>📖 {r.subject}{r.grade&&` • جماعت ${r.grade}`}</div>}
        {r.uploadedBy&&<div style={{fontSize:"0.62rem",color:"#888",marginBottom:"6px"}}>👤 {r.uploadedBy}</div>}
        {r.description&&<div style={{fontSize:"0.62rem",color:"#666",lineHeight:"1.5",marginBottom:"8px"}}>{r.description.slice(0,100)}</div>}
        {r.link&&<a href={r.link} target="_blank" rel="noreferrer" style={{fontSize:"0.62rem",color:C.abuBakr,fontWeight:"600",direction:"ltr",display:"block"}}>🔗 لنک کھولیں</a>}
      </div>; })}
      {filtered.length===0&&<div style={{...S.card,textAlign:"center",color:"#bbb",padding:"40px",gridColumn:"1/-1"}}>کوئی وسیلہ نہیں</div>}
    </div>
  </div>;
}

// ===================== ASSESSMENT MARKS ENTRY =====================
function MarksEntry({students,addData}){
  const [exams,setExams]=useState([]); const [marks,setMarks]=useState([]); const [show,setShow]=useState(false); const [selExam,setSelExam]=useState(null); const [tab,setTab]=useState("exams");
  const [f,setF]=useState({title:"",subject:"",grade:"",date:"",totalMarks:100,type:"monthly"});
  const [bulk,setBulk]=useState({});
  useEffect(()=>{
    const u1=onSnapshot(query(collection(db,"assessments"),orderBy("createdAt","desc"),limit(30)),s=>setExams(s.docs.map(d=>({id:d.id,...d.data()}))));
    const u2=onSnapshot(query(collection(db,"assessment_marks"),orderBy("createdAt","desc"),limit(200)),s=>setMarks(s.docs.map(d=>({id:d.id,...d.data()}))));
    return()=>{u1();u2();};
  },[]);
  const addExam=async()=>{ if(!f.title)return; await addData("assessments",{...f,totalMarks:Number(f.totalMarks)}); setShow(false); setF({title:"",subject:"",grade:"",date:"",totalMarks:100,type:"monthly"}); };
  const saveBulkMarks=async()=>{
    if(!selExam)return;
    const saves=Object.entries(bulk).map(([sid,ob])=>{ const pct=Math.round((Number(ob)/selExam.totalMarks)*100); const gr=pct>=90?"A+":pct>=80?"A":pct>=70?"B":pct>=60?"C":pct>=50?"D":"F"; return addData("assessment_marks",{examId:selExam.id,studentId:sid,obtained:Number(ob),total:selExam.totalMarks,percentage:pct,grade:gr}); });
    await Promise.all(saves); setBulk({});
  };
  const classStudents=selExam?students.filter(s=>!selExam.grade||s.grade===selExam.grade):[];
  const types={monthly:{c:C.abuBakr,l:"ماہانہ"},midterm:{c:C.amber,l:"وسط سال"},annual:{c:C.gold,l:"سالانہ"},unit:{c:C.green,l:"یونٹ"},quiz:{c:C.teal,l:"کوئز"}};
  return <div style={S.page}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
      <div><div style={{fontSize:"1.1rem",fontWeight:"700",color:C.navy}}>📝 نمبرات درج</div><div style={{fontSize:"0.62rem",color:"#888",marginTop:"2px"}}>امتحانات اور نمبرات کا ریکارڈ</div></div>
      <button style={S.addBtn} onClick={()=>setShow(!show)}>+ نیا امتحان</button>
    </div>
    {show&&<div style={{...S.card,marginBottom:"20px",background:`linear-gradient(135deg,${C.goldLight},#fdf8ee)`}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div style={{gridColumn:"1/-1"}}><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>امتحان کا نام *</label><input style={S.inpSm} value={f.title} onChange={e=>setF({...f,title:e.target.value})} placeholder="ماہانہ ٹیسٹ..."/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>مضمون</label><input style={S.inpSm} value={f.subject} onChange={e=>setF({...f,subject:e.target.value})} placeholder="ریاضی..."/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>جماعت</label><input style={S.inpSm} value={f.grade} onChange={e=>setF({...f,grade:e.target.value})} placeholder="8..."/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>تاریخ</label><input style={{...S.inpSm,direction:"ltr"}} type="date" value={f.date} onChange={e=>setF({...f,date:e.target.value})}/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>کل نمبر</label><input style={{...S.inpSm,direction:"ltr"}} type="number" value={f.totalMarks} onChange={e=>setF({...f,totalMarks:e.target.value})}/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>قسم</label><select style={S.inpSm} value={f.type} onChange={e=>setF({...f,type:e.target.value})}>{Object.entries(types).map(([k,v])=><option key={k} value={k}>{v.l}</option>)}</select></div>
      </div>
      <button style={S.saveBtn} onClick={addExam}>✅ امتحان شامل کریں</button>
    </div>}
    <div style={{display:"flex",gap:"8px",marginBottom:"16px"}}>{[["exams","📋 امتحانات"],["entry","✏️ نمبرات درج"]].map(([t,l])=><button key={t} onClick={()=>setTab(t)} style={{padding:"8px 14px",borderRadius:"10px",border:"none",cursor:"pointer",fontSize:"0.65rem",fontWeight:tab===t?"700":"400",background:tab===t?`linear-gradient(135deg,${C.gold},${C.goldDark})`:C.white,color:tab===t?C.white:"#888",fontFamily:"inherit"}}>{l}</button>)}</div>
    {tab==="exams"&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:"14px"}}>
      {exams.map(ex=>{ const tc=types[ex.type]||types.monthly; const exMarks=marks.filter(m=>m.examId===ex.id); const avg=exMarks.length>0?Math.round(exMarks.reduce((s,m)=>s+(m.percentage||0),0)/exMarks.length):0; return <div key={ex.id} style={{...S.card,cursor:"pointer",borderTop:`4px solid ${tc.c}`}} onClick={()=>{setSelExam(ex);setTab("entry");}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:"8px"}}><div style={{fontSize:"0.82rem",fontWeight:"700",color:C.navy}}>{ex.title}</div><span style={hBadge(tc.c,tc.c+"15")}>{tc.l}</span></div>
        <div style={{fontSize:"0.62rem",color:"#888",marginBottom:"8px"}}>{ex.subject} • جماعت {ex.grade}</div>
        {exMarks.length>0&&<><div style={{display:"flex",justifyContent:"space-between",marginBottom:"4px"}}><span style={{fontSize:"0.6rem",color:"#888"}}>اوسط</span><span style={{fontSize:"0.68rem",fontWeight:"700",color:avg>=70?C.green:avg>=50?C.amber:C.red}}>{avg}%</span></div>{pBar(avg,100,avg>=70?C.green:avg>=50?C.amber:C.red)}</>}
        <div style={{fontSize:"0.6rem",color:C.abuBakr,marginTop:"8px"}}>{exMarks.length} طلبا • نمبرات درج کریں ←</div>
      </div>; })}
      {exams.length===0&&<div style={{...S.card,textAlign:"center",color:"#bbb",padding:"40px",gridColumn:"1/-1"}}>کوئی امتحان نہیں</div>}
    </div>}
    {tab==="entry"&&<div>
      <div style={{marginBottom:"12px"}}><select style={{...S.inpSm,maxWidth:"400px"}} value={selExam?.id||""} onChange={e=>setSelExam(exams.find(x=>x.id===e.target.value)||null)}><option value="">-- امتحان منتخب کریں --</option>{exams.map(ex=><option key={ex.id} value={ex.id}>{ex.title}</option>)}</select></div>
      {selExam&&<div style={S.card}>
        <div style={{fontSize:"0.82rem",fontWeight:"700",color:C.navy,marginBottom:"16px"}}>{selExam.title} — کل نمبر: {selExam.totalMarks}</div>
        {classStudents.map(s=>{ const existing=marks.find(m=>m.examId===selExam.id&&m.studentId===s.id); return <div key={s.id} style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"10px",padding:"10px 14px",background:existing?"#f0fdf4":"#fafaf8",borderRadius:"10px"}}>
          <div style={{flex:1}}><div style={{fontSize:"0.72rem",fontWeight:"700",color:C.navy}}>{s.name}</div><div style={{fontSize:"0.58rem",color:"#888"}}>{s.studentCode}</div></div>
          {existing?<div style={{direction:"ltr"}}><span style={{fontSize:"0.82rem",fontWeight:"800",color:existing.percentage>=70?C.green:existing.percentage>=50?C.amber:C.red}}>{existing.obtained}/{selExam.totalMarks}</span><span style={hBadge(existing.percentage>=70?C.green:C.amber,existing.percentage>=70?"#dcfce7":"#fef3c7")}> {existing.grade}</span></div>:<input style={{...S.inpSm,width:"80px",direction:"ltr",textAlign:"center"}} type="number" min="0" max={selExam.totalMarks} placeholder="0" value={bulk[s.id]||""} onChange={e=>setBulk({...bulk,[s.id]:e.target.value})}/>}
        </div>; })}
        {classStudents.length>0&&<button style={{...S.saveBtn,marginTop:"12px",width:"100%"}} onClick={saveBulkMarks}>✅ سب نمبرات محفوظ کریں</button>}
        {classStudents.length===0&&<div style={{textAlign:"center",color:"#bbb",padding:"30px"}}>کوئی طالب علم نہیں</div>}
      </div>}
    </div>}
  </div>;
}

// ===================== TARBIYAH DIARY =====================
function TarbiyahDiary({students,addData,updateHousePoints}){
  const [logs,setLogs]=useState([]); const [show,setShow]=useState(false); const [tab,setTab]=useState("entry");
  const [f,setF]=useState({studentId:"",date:new Date().toISOString().split("T")[0],fajr:false,dhuhr:false,asr:false,maghrib:false,isha:false,adabRating:3,selfReflection:false,notes:""});
  const [saving,setSaving]=useState(false);
  useEffect(()=>{ return onSnapshot(query(collection(db,"tarbiyah_logs"),orderBy("createdAt","desc"),limit(50)),s=>setLogs(s.docs.map(d=>({id:d.id,...d.data()}))));  },[]);
  const calcPoints=(f)=>{ const n=[f.fajr,f.dhuhr,f.asr,f.maghrib,f.isha].filter(Boolean).length; return n*4+(f.adabRating>=4?5:f.adabRating>=3?3:1)+(f.selfReflection?5:0); };
  const save=async()=>{ if(!f.studentId)return; setSaving(true); const pts=calcPoints(f); const student=students.find(s=>s.id===f.studentId); await addData("tarbiyah_logs",{...f,points:pts,houseId:student?.houseId||""}); if(student?.houseId&&pts>0) await updateHousePoints(student.houseId,Math.floor(pts/5)); setShow(false); setF({studentId:"",date:new Date().toISOString().split("T")[0],fajr:false,dhuhr:false,asr:false,maghrib:false,isha:false,adabRating:3,selfReflection:false,notes:""}); setSaving(false); };
  const SALAH=["fajr","dhuhr","asr","maghrib","isha"]; const SALAH_UR={fajr:"فجر",dhuhr:"ظہر",asr:"عصر",maghrib:"مغرب",isha:"عشاء"};
  const todayLogs=logs.filter(l=>l.date===new Date().toISOString().split("T")[0]);
  const studentSummary=students.map(st=>{ const stL=logs.filter(l=>l.studentId===st.id); const totalPts=stL.reduce((s,l)=>s+(l.points||0),0); const namazAvg=stL.length>0?Math.round(stL.reduce((s,l)=>s+[l.fajr,l.dhuhr,l.asr,l.maghrib,l.isha].filter(Boolean).length,0)/stL.length):0; return {...st,totalPts,namazAvg,entries:stL.length}; }).sort((a,b)=>b.totalPts-a.totalPts);
  return <div style={S.page}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
      <div><div style={{fontSize:"1.1rem",fontWeight:"700",color:C.navy}}>📖 تربیت ڈائری</div><div style={{fontSize:"0.62rem",color:"#888",marginTop:"2px"}}>نماز، ادب، اور روزانہ کارکردگی</div></div>
      <button style={S.addBtn} onClick={()=>setShow(!show)}>+ نئی اندراج</button>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:"12px",marginBottom:"20px"}}>
      {[{c:C.navy,i:"📋",n:logs.length,l:"کل اندراجات"},{c:C.gold,i:"📅",n:todayLogs.length,l:"آج"},{c:C.green,i:"🎓",n:students.length,l:"کل طلبا"}].map((x,i)=><div key={i} style={{background:`linear-gradient(135deg,${x.c}12,${x.c}05)`,borderRadius:"16px",padding:"16px",border:`2px solid ${x.c}20`,textAlign:"center"}}><div style={{fontSize:"1.3rem"}}>{x.i}</div><div style={{fontSize:"1.4rem",fontWeight:"900",color:x.c}}>{x.n}</div><div style={{fontSize:"0.6rem",color:"#888",marginTop:"2px"}}>{x.l}</div></div>)}
    </div>
    {show&&<div style={{...S.card,marginBottom:"20px",background:`linear-gradient(135deg,${C.goldLight},#fdf8ee)`,border:`2px solid ${C.gold}30`}}>
      <div style={{fontSize:"0.85rem",fontWeight:"700",color:C.navy,marginBottom:"16px"}}>📖 روزانہ تربیت اندراج</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"14px"}}>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>طالب علم *</label><select style={S.inpSm} value={f.studentId} onChange={e=>setF({...f,studentId:e.target.value})}><option value="">-- منتخب کریں --</option>{students.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>تاریخ</label><input style={{...S.inpSm,direction:"ltr"}} type="date" value={f.date} onChange={e=>setF({...f,date:e.target.value})}/></div>
      </div>
      <div style={{background:C.white,borderRadius:"14px",padding:"14px",marginBottom:"12px",border:`1px solid ${C.goldLight}`}}>
        <div style={{fontSize:"0.75rem",fontWeight:"700",color:C.navy,marginBottom:"10px"}}>🕌 5 وقت کی نماز</div>
        <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
          {SALAH.map(s=><button key={s} onClick={()=>setF({...f,[s]:!f[s]})} style={{padding:"8px 14px",borderRadius:"12px",border:"none",cursor:"pointer",fontSize:"0.68rem",fontWeight:"700",fontFamily:"inherit",background:f[s]?`linear-gradient(135deg,${C.green},#15803d)`:"#f3f4f6",color:f[s]?C.white:"#888",transition:"all 0.2s"}}>{f[s]?"✅":"⬜"} {SALAH_UR[s]}</button>)}
        </div>
        <div style={{marginTop:"8px",fontSize:"0.65rem",color:C.gold,fontWeight:"700"}}>{[f.fajr,f.dhuhr,f.asr,f.maghrib,f.isha].filter(Boolean).length}/5 نماز</div>
      </div>
      <div style={{background:C.white,borderRadius:"14px",padding:"14px",marginBottom:"12px",border:`1px solid ${C.goldLight}`}}>
        <div style={{fontSize:"0.72rem",fontWeight:"700",color:C.navy,marginBottom:"8px"}}>💎 ادب ریٹنگ</div>
        <div style={{display:"flex",gap:"6px"}}>{[1,2,3,4,5].map(star=><button key={star} onClick={()=>setF({...f,adabRating:star})} style={{fontSize:"1.4rem",background:"none",border:"none",cursor:"pointer",color:star<=f.adabRating?C.gold:"#ddd",transition:"color 0.15s"}}>★</button>)}</div>
      </div>
      <div style={{background:C.white,borderRadius:"14px",padding:"12px",marginBottom:"12px",border:`1px solid ${C.goldLight}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{fontSize:"0.72rem",fontWeight:"700",color:C.navy}}>🪞 خود احتسابی</div>
        <button onClick={()=>setF({...f,selfReflection:!f.selfReflection})} style={{padding:"6px 14px",borderRadius:"20px",border:"none",cursor:"pointer",fontSize:"0.62rem",fontWeight:"700",fontFamily:"inherit",background:f.selfReflection?`linear-gradient(135deg,${C.gold},${C.goldDark})`:"#f3f4f6",color:f.selfReflection?C.white:"#888"}}>{f.selfReflection?"✅ ہاں":"⬜ نہیں"}</button>
      </div>
      <div style={{background:C.white,borderRadius:"12px",padding:"12px",marginBottom:"12px",textAlign:"center",border:`2px solid ${C.gold}20`}}>
        <div style={{fontSize:"0.62rem",color:"#888"}}>کل پوائنٹس</div>
        <div style={{fontSize:"2rem",fontWeight:"900",color:C.gold}}>{calcPoints(f)}</div>
      </div>
      <button style={{...S.saveBtn,width:"100%"}} onClick={save} disabled={saving}>{saving?"محفوظ ہو رہا ہے...":"✅ تربیت اندراج محفوظ کریں"}</button>
    </div>}
    <div style={{display:"flex",gap:"8px",marginBottom:"16px"}}>{[["entry","📋 اندراجات"],["report","📊 رپورٹ"]].map(([t,l])=><button key={t} onClick={()=>setTab(t)} style={{padding:"8px 14px",borderRadius:"10px",border:"none",cursor:"pointer",fontSize:"0.65rem",fontWeight:tab===t?"700":"400",background:tab===t?`linear-gradient(135deg,${C.gold},${C.goldDark})`:C.white,color:tab===t?C.white:"#888",fontFamily:"inherit"}}>{l}</button>)}</div>
    {tab==="entry"&&<div style={S.card}><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}>
      <thead><tr><th style={S.th}>طالب علم</th><th style={S.th}>تاریخ</th><th style={S.th}>نماز</th><th style={S.th}>ادب</th><th style={S.th}>پوائنٹس</th></tr></thead>
      <tbody>{logs.map(l=>{ const st=students.find(s=>s.id===l.studentId); const nc=[l.fajr,l.dhuhr,l.asr,l.maghrib,l.isha].filter(Boolean).length; return <tr key={l.id}>
        <td style={{...S.td,fontWeight:"700"}}>{st?.name||"—"}</td>
        <td style={{...S.td,fontFamily:"monospace",direction:"ltr",fontSize:"0.6rem"}}>{l.date}</td>
        <td style={S.td}><span style={{color:nc>=4?C.green:nc>=2?C.amber:C.red,fontWeight:"700"}}>{nc}/5</span></td>
        <td style={S.td}><span style={{color:C.gold}}>{"★".repeat(l.adabRating||0)}</span></td>
        <td style={{...S.td,fontWeight:"800",color:C.gold}}>{l.points||0}</td>
      </tr>; })}{logs.length===0&&<tr><td colSpan={5} style={{...S.td,textAlign:"center",color:"#bbb",padding:"40px"}}>ابھی کوئی اندراج نہیں</td></tr>}</tbody>
    </table></div></div>}
    {tab==="report"&&<div style={S.card}><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}>
      <thead><tr><th style={S.th}>#</th><th style={S.th}>طالب علم</th><th style={S.th}>اندراجات</th><th style={S.th}>اوسط نماز</th><th style={S.th}>کل پوائنٹس</th></tr></thead>
      <tbody>{studentSummary.map((st,i)=><tr key={st.id} style={{background:i===0?`${C.gold}08`:undefined}}>
        <td style={{...S.td,fontWeight:"800",color:i===0?C.gold:"#aaa"}}>{i===0?"👑":i+1}</td>
        <td style={{...S.td,fontWeight:"700"}}>{st.name}</td>
        <td style={S.td}>{st.entries}</td>
        <td style={S.td}><span style={{color:st.namazAvg>=4?C.green:st.namazAvg>=2?C.amber:C.red,fontWeight:"700"}}>{st.namazAvg}/5</span></td>
        <td style={{...S.td,fontWeight:"900",color:C.gold}}>{st.totalPts}</td>
      </tr>)}</tbody>
    </table></div></div>}
  </div>;
}

// ===================== SUPER HOUSE DASHBOARD =====================
function SuperHouseDashboard({houses,hvsLogs,students}){
  const sorted=[...houses].sort((a,b)=>(b.points||0)-(a.points||0));
  const winner=sorted[0]; const winnerInfo=HOUSES.find(x=>x.id===winner?.id);
  const [selHouse,setSelHouse]=useState(null);
  const houseStats=HOUSES.map(h=>{ const hd=houses.find(x=>x.id===h.id)||{}; const studs=students.filter(s=>s.houseId===h.id); const hLogs=hvsLogs.filter(l=>l.houseId===h.id); const avgHvs=hLogs.length>0?Math.round(hLogs.reduce((s,l)=>s+(l.total||0),0)/hLogs.length):0; const bestWeek=hLogs.length>0?Math.max(...hLogs.map(l=>l.total||0)):0; const rank=sorted.findIndex(x=>x.id===h.id)+1; return {...h,...hd,studs,hLogs,avgHvs,bestWeek,rank}; });
  const selectedStats=selHouse?houseStats.find(x=>x.id===selHouse):null;
  const selectedInfo=HOUSES.find(x=>x.id===selHouse);
  return <div style={S.page}>
    <div style={{fontSize:"1.1rem",fontWeight:"700",color:C.navy,marginBottom:"6px"}}>🏆 سپر ہاؤس ڈیش بورڈ</div>
    <div style={{fontSize:"0.62rem",color:"#888",marginBottom:"20px"}}>تفصیلی ہاؤس تجزیہ و کارکردگی</div>
    {winner&&winnerInfo&&<div style={{background:winnerInfo.gradient,borderRadius:"22px",padding:"28px",marginBottom:"24px",color:C.white,textAlign:"center",position:"relative",overflow:"hidden"}}>
      <div style={{fontSize:"3rem",marginBottom:"8px"}}>👑</div>
      <div style={{fontSize:"0.7rem",opacity:0.8,letterSpacing:"0.2em",marginBottom:"6px"}}>سپر ہاؤس — موجودہ لیڈر</div>
      <div style={{fontSize:"2rem",fontWeight:"900"}}>{winnerInfo.emoji} {winnerInfo.nameEn} House</div>
      <div style={{fontSize:"0.75rem",opacity:0.85,margin:"8px 0",fontStyle:"italic"}}>{winnerInfo.slogan}</div>
      <div style={{fontSize:"3rem",fontWeight:"900"}}>{winner.points||0}</div>
    </div>}
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:"16px",marginBottom:"24px"}}>
      {houseStats.map((h,i)=>{ const info=HOUSES.find(x=>x.id===h.id)||{}; const isSel=selHouse===h.id; return <div key={h.id} onClick={()=>setSelHouse(isSel?null:h.id)} style={{...S.card,cursor:"pointer",borderTop:`4px solid ${info.color||C.gold}`,border:isSel?`2px solid ${info.color}`:undefined,transform:isSel?"scale(1.02)":"scale(1)",transition:"all 0.2s"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"10px"}}>
          <div><div style={{fontSize:"1.5rem"}}>{info.emoji}</div><div style={{fontSize:"0.85rem",fontWeight:"800",color:info.color||C.navy,marginTop:"4px"}}>{info.nameEn}</div></div>
          <div style={{background:h.rank===1?`linear-gradient(135deg,${C.gold},${C.goldDark})`:"#eee",color:h.rank===1?C.white:"#aaa",width:"32px",height:"32px",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.7rem",fontWeight:"900"}}>{h.rank===1?"👑":`#${h.rank}`}</div>
        </div>
        <div style={{fontSize:"2rem",fontWeight:"900",color:info.color||C.navy}}>{h.points||0}</div>
        {pBar(h.points||0,Math.max(...houses.map(x=>x.points||0),1),info.color||C.gold)}
        <div style={{display:"flex",justifyContent:"space-between",marginTop:"8px"}}>
          <span style={{fontSize:"0.6rem",color:"#888"}}>👥 {h.studs?.length||0}</span>
          <span style={{fontSize:"0.6rem",color:"#888"}}>📊 avg {h.avgHvs}</span>
        </div>
      </div>; })}
    </div>
    {selectedStats&&selectedInfo&&<div style={{...S.card,marginBottom:"20px",borderTop:`4px solid ${selectedInfo.color}`}}>
      <div style={{fontSize:"0.9rem",fontWeight:"700",color:C.navy,marginBottom:"16px"}}>{selectedInfo.emoji} {selectedInfo.nameEn} House — تفصیل</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:"10px",marginBottom:"16px"}}>
        {[{l:"کل پوائنٹس",v:selectedStats.points||0,c:selectedInfo.color},{l:"طلبا",v:selectedStats.studs?.length||0,c:C.abuBakr},{l:"HVS اندراجات",v:selectedStats.hLogs?.length||0,c:C.teal},{l:"اوسط HVS",v:`${selectedStats.avgHvs}/${HVS_TOTAL}`,c:C.amber},{l:"بہترین",v:selectedStats.bestWeek,c:C.green},{l:"درجہ",v:`#${selectedStats.rank}`,c:C.gold}].map((x,i)=><div key={i} style={{background:`${x.c}10`,borderRadius:"12px",padding:"12px",border:`1px solid ${x.c}20`,textAlign:"center"}}><div style={{fontSize:"1.2rem",fontWeight:"800",color:x.c}}>{x.v}</div><div style={{fontSize:"0.6rem",color:"#888",marginTop:"2px"}}>{x.l}</div></div>)}
      </div>
      <div style={{fontSize:"0.72rem",fontWeight:"700",color:C.navy,marginBottom:"10px"}}>👥 طلبا</div>
      <div style={{display:"flex",flexWrap:"wrap",gap:"8px"}}>
        {selectedStats.studs?.map(s=><span key={s.id} style={{...hBadge(selectedInfo.color,selectedInfo.light),fontSize:"0.65rem"}}>{s.name}</span>)}
      </div>
    </div>}
    <div style={S.card}>
      <div style={{fontSize:"0.85rem",fontWeight:"700",color:C.navy,marginBottom:"16px"}}>📊 ہاؤس موازنہ</div>
      <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead><tr><th style={S.th}>ہاؤس</th><th style={S.th}>درجہ</th><th style={S.th}>پوائنٹس</th><th style={S.th}>طلبا</th><th style={S.th}>اوسط HVS</th><th style={S.th}>بہترین</th></tr></thead>
        <tbody>{houseStats.map((h,i)=>{ const info=HOUSES.find(x=>x.id===h.id)||{}; return <tr key={h.id} style={{background:i===0?`${info.color}08`:undefined}}>
          <td style={S.td}><span style={hBadge(info.color,info.light)}>{info.emoji} {info.nameEn}</span></td>
          <td style={{...S.td,fontWeight:"800",color:i===0?C.gold:"#888"}}>{i===0?"👑 1st":`#${i+1}`}</td>
          <td style={{...S.td,fontWeight:"800",color:info.color}}>{h.points||0}</td>
          <td style={S.td}>{h.studs?.length||0}</td>
          <td style={S.td}>{h.avgHvs}/{HVS_TOTAL}</td>
          <td style={{...S.td,color:C.green,fontWeight:"700"}}>{h.bestWeek}</td>
        </tr>; })}
        </tbody>
      </table></div>
    </div>
  </div>;
}

// ===================== HPRI RISK SYSTEM =====================
function HPRISystem({students,addData}){
  const [risks,setRisks]=useState([]); const [show,setShow]=useState(false);
  const [f,setF]=useState({studentId:"",riskType:"attendance",severity:"medium",description:"",actionRequired:"",assignedTo:"",dueDate:"",status:"open"});
  const [filterStatus,setFilterStatus]=useState("all");
  useEffect(()=>{ return onSnapshot(query(collection(db,"hpri_risks"),orderBy("createdAt","desc"),limit(50)),s=>setRisks(s.docs.map(d=>({id:d.id,...d.data()}))));  },[]);
  const add=async()=>{ if(!f.studentId||!f.description)return; await addData("hpri_risks",{...f}); setShow(false); setF({studentId:"",riskType:"attendance",severity:"medium",description:"",actionRequired:"",assignedTo:"",dueDate:"",status:"open"}); };
  const resolveRisk=async(id)=>{ await updateDoc(doc(db,"hpri_risks",id),{status:"resolved",resolvedAt:serverTimestamp()}); };
  const riskTypes={attendance:"✅ حاضری",academic:"📚 تعلیمی",behavioral:"⚠️ رویہ",hifz:"📖 حفظ",fee:"💰 فیس",family:"🏠 خاندانی"};
  const sevConfig={high:{c:C.red,bg:"#fee2e2",l:"زیادہ خطرہ"},medium:{c:C.amber,bg:"#fef3c7",l:"درمیانہ"},low:{c:C.green,bg:"#dcfce7",l:"کم"}};
  const filtered=risks.filter(r=>filterStatus==="all"||r.status===filterStatus);
  const openCount=risks.filter(r=>r.status==="open").length;
  const highCount=risks.filter(r=>r.severity==="high"&&r.status==="open").length;
  return <div style={S.page}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
      <div><div style={{fontSize:"1.1rem",fontWeight:"700",color:C.navy}}>⚠️ HPRI رسک سسٹم</div><div style={{fontSize:"0.62rem",color:"#888",marginTop:"2px"}}>High Priority Risk Intervention</div></div>
      <button style={{...S.addBtn,background:`linear-gradient(135deg,${C.red},#b91c1c)`}} onClick={()=>setShow(!show)}>+ نیا رسک</button>
    </div>
    {highCount>0&&<div style={{background:"#fee2e2",border:`2px solid ${C.red}`,borderRadius:"14px",padding:"14px 18px",marginBottom:"20px",display:"flex",alignItems:"center",gap:"12px"}}><span style={{fontSize:"1.5rem"}}>🚨</span><div><div style={{fontSize:"0.78rem",fontWeight:"700",color:C.red}}>فوری توجہ درکار!</div><div style={{fontSize:"0.62rem",color:"#888"}}>{highCount} طلبا کو فوری مداخلت کی ضرورت</div></div></div>}
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:"12px",marginBottom:"20px"}}>
      {[{c:C.red,i:"🚨",n:highCount,l:"فوری"},{c:C.amber,i:"⚠️",n:openCount,l:"کھلے"},{c:C.green,i:"✅",n:risks.filter(r=>r.status==="resolved").length,l:"حل شدہ"},{c:C.navy,i:"📋",n:risks.length,l:"کل"}].map((x,i)=><div key={i} style={{background:`linear-gradient(135deg,${x.c}12,${x.c}05)`,borderRadius:"16px",padding:"16px",border:`2px solid ${x.c}20`,textAlign:"center"}}><div style={{fontSize:"1.3rem"}}>{x.i}</div><div style={{fontSize:"1.4rem",fontWeight:"900",color:x.c}}>{x.n}</div><div style={{fontSize:"0.6rem",color:"#888"}}>{x.l}</div></div>)}
    </div>
    {show&&<div style={{...S.card,marginBottom:"20px",background:"linear-gradient(135deg,#fee2e2,#fff5f5)",border:`2px solid ${C.red}20`}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>طالب علم *</label><select style={S.inpSm} value={f.studentId} onChange={e=>setF({...f,studentId:e.target.value})}><option value="">-- منتخب کریں --</option>{students.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>قسم</label><select style={S.inpSm} value={f.riskType} onChange={e=>setF({...f,riskType:e.target.value})}>{Object.entries(riskTypes).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>شدت</label><select style={S.inpSm} value={f.severity} onChange={e=>setF({...f,severity:e.target.value})}><option value="high">🔴 زیادہ</option><option value="medium">🟡 درمیانہ</option><option value="low">🟢 کم</option></select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>ذمہ دار</label><input style={S.inpSm} value={f.assignedTo} onChange={e=>setF({...f,assignedTo:e.target.value})} placeholder="استاد کا نام..."/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>آخری تاریخ</label><input style={{...S.inpSm,direction:"ltr"}} type="date" value={f.dueDate} onChange={e=>setF({...f,dueDate:e.target.value})}/></div>
        <div style={{gridColumn:"1/-1"}}><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>تفصیل *</label><textarea style={{...S.inpSm,minHeight:"60px",resize:"vertical"}} value={f.description} onChange={e=>setF({...f,description:e.target.value})} placeholder="مسئلے کی تفصیل..."/></div>
        <div style={{gridColumn:"1/-1"}}><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>مطلوبہ اقدام</label><textarea style={{...S.inpSm,minHeight:"50px",resize:"vertical"}} value={f.actionRequired} onChange={e=>setF({...f,actionRequired:e.target.value})} placeholder="کیا کرنا ضروری ہے..."/></div>
      </div>
      <button style={{...S.saveBtn,background:`linear-gradient(135deg,${C.red},#b91c1c)`}} onClick={add}>⚠️ رسک درج کریں</button>
    </div>}
    <div style={{display:"flex",gap:"8px",marginBottom:"16px"}}>{[["all","سب"],["open","کھلے"],["resolved","حل"]].map(([v,l])=><button key={v} onClick={()=>setFilterStatus(v)} style={{padding:"7px 14px",borderRadius:"10px",border:"none",cursor:"pointer",fontSize:"0.62rem",fontWeight:filterStatus===v?"700":"400",background:filterStatus===v?`linear-gradient(135deg,${C.red},#b91c1c)`:C.white,color:filterStatus===v?C.white:"#888",fontFamily:"inherit"}}>{l}</button>)}</div>
    <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
      {filtered.map(r=>{ const st=students.find(s=>s.id===r.studentId); const h=HOUSES.find(x=>x.id===st?.houseId); const sev=sevConfig[r.severity]||sevConfig.medium; const isOD=r.dueDate&&r.status==="open"&&new Date(r.dueDate)<new Date(); return <div key={r.id} style={{...S.card,borderRight:`4px solid ${sev.c}`,padding:"16px 20px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"8px"}}>
          <div><div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"4px"}}><span style={{fontSize:"0.85rem",fontWeight:"700",color:C.navy}}>{st?.name||"—"}</span>{h&&<span style={hBadge(h.color,h.light)}>{h.emoji}</span>}<span style={{padding:"3px 8px",borderRadius:"20px",fontSize:"0.58rem",fontWeight:"700",background:sev.bg,color:sev.c}}>{sev.l}</span>{isOD&&<span style={{padding:"3px 8px",borderRadius:"20px",fontSize:"0.55rem",fontWeight:"700",background:"#fee2e2",color:C.red}}>⏰ تاخیر</span>}</div><div style={{fontSize:"0.62rem",color:"#888"}}>{riskTypes[r.riskType]}</div></div>
          <span style={{padding:"4px 10px",borderRadius:"20px",fontSize:"0.58rem",fontWeight:"700",background:r.status==="resolved"?"#dcfce7":"#fef3c7",color:r.status==="resolved"?C.green:C.amber}}>{r.status==="resolved"?"✅ حل":"⏳ کھلا"}</span>
        </div>
        <div style={{fontSize:"0.68rem",color:"#555",marginBottom:"8px",lineHeight:"1.6"}}>{r.description}</div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{display:"flex",gap:"8px"}}>{r.assignedTo&&<span style={{fontSize:"0.6rem",color:"#888"}}>👤 {r.assignedTo}</span>}{r.dueDate&&<span style={{fontSize:"0.6rem",color:isOD?C.red:"#888",fontFamily:"monospace",direction:"ltr"}}>{r.dueDate}</span>}</div>
          {r.status==="open"&&<button onClick={()=>resolveRisk(r.id)} style={{...S.saveBtn,padding:"5px 14px",fontSize:"0.6rem"}}>✅ حل کریں</button>}
        </div>
      </div>; })}
      {filtered.length===0&&<div style={{...S.card,textAlign:"center",color:"#bbb",padding:"60px"}}>{filterStatus==="open"?"✅ کوئی کھلا رسک نہیں!":"کوئی ریکارڈ نہیں"}</div>}
    </div>
  </div>;
}

// ===================== REGISTRAR HUB =====================
function RegistrarHub({students,addData}){
  const [admissions,setAdmissions]=useState([]); const [show,setShow]=useState(false);
  const [f,setF]=useState({studentName:"",fatherName:"",dob:"",address:"",phone:"",grade:"Grade 1",previousSchool:"",admissionDate:new Date().toISOString().split("T")[0],admissionNo:"",status:"pending",documents:""});
  const [q,setQ]=useState("");
  useEffect(()=>{ return onSnapshot(query(collection(db,"admissions"),orderBy("createdAt","desc"),limit(50)),s=>setAdmissions(s.docs.map(d=>({id:d.id,...d.data()}))));  },[]);
  const add=async()=>{ if(!f.studentName||!f.phone)return; await addData("admissions",{...f}); setShow(false); setF({studentName:"",fatherName:"",dob:"",address:"",phone:"",grade:"Grade 1",previousSchool:"",admissionDate:new Date().toISOString().split("T")[0],admissionNo:"",status:"pending",documents:""}); };
  const updateStatus=async(id,status)=>{ await updateDoc(doc(db,"admissions",id),{status,updatedAt:serverTimestamp()}); };
  const statusConfig={pending:{c:C.amber,bg:"#fef3c7",l:"زیر التواء"},approved:{c:C.green,bg:"#dcfce7",l:"منظور"},rejected:{c:C.red,bg:"#fee2e2",l:"مسترد"},enrolled:{c:C.abuBakr,bg:"#dbeafe",l:"داخل"}};
  const filtered=admissions.filter(a=>!q||a.studentName?.includes(q)||a.admissionNo?.includes(q));
  return <div style={S.page}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
      <div><div style={{fontSize:"1.1rem",fontWeight:"700",color:C.navy}}>📋 رجسٹرار ہب</div><div style={{fontSize:"0.62rem",color:"#888",marginTop:"2px"}}>داخلہ، دستاویزات، سرکاری ریکارڈ</div></div>
      <button style={S.addBtn} onClick={()=>setShow(!show)}>+ نیا داخلہ</button>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:"12px",marginBottom:"20px"}}>
      {[{c:C.amber,i:"⏳",n:admissions.filter(a=>a.status==="pending").length,l:"زیر التواء"},{c:C.green,i:"✅",n:admissions.filter(a=>a.status==="approved").length,l:"منظور"},{c:C.abuBakr,i:"🎓",n:admissions.filter(a=>a.status==="enrolled").length,l:"داخل"},{c:C.navy,i:"📋",n:admissions.length,l:"کل"}].map((x,i)=><div key={i} style={{background:`linear-gradient(135deg,${x.c}12,${x.c}05)`,borderRadius:"16px",padding:"16px",border:`2px solid ${x.c}20`,textAlign:"center"}}><div style={{fontSize:"1.3rem"}}>{x.i}</div><div style={{fontSize:"1.4rem",fontWeight:"900",color:x.c}}>{x.n}</div><div style={{fontSize:"0.6rem",color:"#888"}}>{x.l}</div></div>)}
    </div>
    {show&&<div style={{...S.card,marginBottom:"20px",background:`linear-gradient(135deg,${C.goldLight},#fdf8ee)`,border:`2px solid ${C.gold}30`}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>طالب علم کا نام *</label><input style={S.inpSm} value={f.studentName} onChange={e=>setF({...f,studentName:e.target.value})} placeholder="مکمل نام..."/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>والد کا نام</label><input style={S.inpSm} value={f.fatherName} onChange={e=>setF({...f,fatherName:e.target.value})} placeholder="والد کا نام..."/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>جماعت</label><select style={S.inpSm} value={f.grade} onChange={e=>setF({...f,grade:e.target.value})}>{["Grade 1","Grade 2","Grade 3","Grade 4","Grade 5","Grade 6","Grade 7","Grade 8","Grade 9","Grade 10"].map(g=><option key={g}>{g}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>فون *</label><input style={{...S.inpSm,direction:"ltr"}} value={f.phone} onChange={e=>setF({...f,phone:e.target.value})} placeholder="0300-1234567"/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>داخلہ نمبر</label><input style={{...S.inpSm,direction:"ltr"}} value={f.admissionNo} onChange={e=>setF({...f,admissionNo:e.target.value})} placeholder="ADM-2026-001"/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>داخلہ تاریخ</label><input style={{...S.inpSm,direction:"ltr"}} type="date" value={f.admissionDate} onChange={e=>setF({...f,admissionDate:e.target.value})}/></div>
        <div style={{gridColumn:"1/-1"}}><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>پتہ</label><input style={S.inpSm} value={f.address} onChange={e=>setF({...f,address:e.target.value})} placeholder="مکمل پتہ..."/></div>
      </div>
      <button style={S.saveBtn} onClick={add}>✅ درخواست محفوظ کریں</button>
    </div>}
    <div style={{marginBottom:"16px"}}><input style={{...S.inpSm,direction:"rtl"}} placeholder="🔍 نام یا داخلہ نمبر..." value={q} onChange={e=>setQ(e.target.value)}/></div>
    <div style={S.card}><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}>
      <thead><tr><th style={S.th}>نام</th><th style={S.th}>والد</th><th style={S.th}>جماعت</th><th style={S.th}>داخلہ نمبر</th><th style={S.th}>فون</th><th style={S.th}>حال</th><th style={S.th}>عمل</th></tr></thead>
      <tbody>{filtered.map(a=>{ const sc=statusConfig[a.status]||statusConfig.pending; return <tr key={a.id}>
        <td style={{...S.td,fontWeight:"700"}}>{a.studentName}</td><td style={S.td}>{a.fatherName||"—"}</td><td style={S.td}>{a.grade}</td>
        <td style={{...S.td,fontFamily:"monospace",direction:"ltr",fontSize:"0.6rem",color:C.gold}}>{a.admissionNo||"—"}</td>
        <td style={{...S.td,fontFamily:"monospace",direction:"ltr",fontSize:"0.6rem"}}>{a.phone}</td>
        <td style={S.td}><span style={{padding:"4px 10px",borderRadius:"20px",fontSize:"0.58rem",fontWeight:"700",background:sc.bg,color:sc.c}}>{sc.l}</span></td>
        <td style={S.td}>
          {a.status==="pending"&&<div style={{display:"flex",gap:"4px"}}><button onClick={()=>updateStatus(a.id,"approved")} style={{...S.saveBtn,padding:"4px 8px",fontSize:"0.55rem"}}>✅</button><button onClick={()=>updateStatus(a.id,"rejected")} style={{...S.dangerBtn,padding:"4px 8px",fontSize:"0.55rem"}}>❌</button></div>}
          {a.status==="approved"&&<button onClick={()=>updateStatus(a.id,"enrolled")} style={{...S.addBtn,padding:"4px 10px",fontSize:"0.55rem"}}>داخل 🎓</button>}
        </td>
      </tr>; })}{filtered.length===0&&<tr><td colSpan={7} style={{...S.td,textAlign:"center",color:"#bbb",padding:"40px"}}>کوئی ریکارڈ نہیں</td></tr>}</tbody>
    </table></div></div>
  </div>;
}

// ===================== MAIN APP =====================
export default function App(){
  const [user,setUser]=useState(null); const [loading,setLoading]=useState(true);
  const [err,setErr]=useState(""); const [lLoading,setLL]=useState(false);
  const [page,setPage]=useState("dashboard");
  const [students,setStudents]=useState([]); const [teachers,setTeachers]=useState([]);
  const [houses,setHouses]=useState([]); const [hvs,setHvs]=useState([]);
  const [fees,setFees]=useState([]); const [results,setResults]=useState([]);

  useEffect(()=>{ return onAuthStateChanged(auth,async u=>{ setUser(u); setLoading(false); if(u){ await seedDB(); } }); },[]);
  useEffect(()=>{ if(!user)return;
    const s1=onSnapshot(collection(db,"students"),s=>setStudents(s.docs.map(d=>({id:d.id,...d.data()}))));
    const s2=onSnapshot(collection(db,"teachers"),s=>setTeachers(s.docs.map(d=>({id:d.id,...d.data()}))));
    const s3=onSnapshot(collection(db,"houses"),s=>setHouses(s.docs.map(d=>({id:d.id,...d.data()}))));
    const s4=onSnapshot(query(collection(db,"hvs_logs"),orderBy("createdAt","desc"),limit(50)),s=>setHvs(s.docs.map(d=>({id:d.id,...d.data()}))));
    const s5=onSnapshot(query(collection(db,"fees"),orderBy("createdAt","desc"),limit(100)),s=>setFees(s.docs.map(d=>({id:d.id,...d.data()}))));
    const s6=onSnapshot(query(collection(db,"results"),orderBy("createdAt","desc"),limit(100)),s=>setResults(s.docs.map(d=>({id:d.id,...d.data()}))));
    return()=>{s1();s2();s3();s4();s5();s6();};
  },[user]);

  const login=async(email,pass)=>{ setLL(true); setErr(""); try{ try{ await signInWithEmailAndPassword(auth,email,pass); }catch{ await createUserWithEmailAndPassword(auth,email,pass); } }catch(e){ setErr("غلط ای میل یا پاس ورڈ"); } setLL(false); };
  const logout=()=>signOut(auth);
  const addData=async(col,data)=>{ try{ await fbAddDoc(collection(db,col),{...data,createdAt:serverTimestamp()}); }catch(e){ console.error("addData:",e.message); } };
  const updateHousePoints=async(houseId,pts)=>{ try{ const ref=doc(db,"houses",houseId); const hd=houses.find(h=>h.id===houseId); await setDoc(ref,{id:houseId,points:(hd?.points||0)+pts,hvs_total:(hd?.hvs_total||0)+pts,hvs_weeks:(hd?.hvs_weeks||0)+1,updatedAt:serverTimestamp()},{merge:true}); }catch(e){ console.error("updatePts:",e.message); } };

  const PAGES=[
    {id:"dashboard",label:"📊 ڈیش بورڈ"},{id:"hvs",label:"🏅 HVS"},{id:"students",label:"🎓 طلبا"},
    {id:"teachers",label:"👨‍🏫 اساتذہ"},{id:"hifz",label:"📖 حفظ"},{id:"houses",label:"🏠 ہاؤس"},
    {id:"timetable",label:"🗓️ ٹائم ٹیبل"},{id:"fees",label:"💰 فیس"},{id:"results",label:"📊 نتائج"},
    {id:"events",label:"🎭 ایونٹس"},{id:"attendance",label:"✅ حاضری"},{id:"notifications",label:"📱 اطلاعات"},
    {id:"library",label:"📚 لائبریری"},{id:"salary",label:"💼 تنخواہ"},{id:"exams",label:"📝 امتحان"},
    {id:"transport",label:"🚌 ٹرانسپورٹ"},{id:"tarbiyah",label:"🌟 تربیت"},{id:"superhouse",label:"🏆 سپر ہاؤس"},
    {id:"hpri",label:"⚠️ HPRI"},{id:"registrar",label:"📋 رجسٹرار"},
    {id:"noticeboard",label:"📌 نوٹس"},{id:"hostel",label:"🏠 ہوسٹل"},
    {id:"health",label:"🏥 صحت"},{id:"madrasa",label:"🕌 درس نظامی"},
    {id:"donations",label:"🤲 عطیات"},{id:"meetings",label:"📝 میٹنگ"},
    {id:"assets",label:"🏗️ اثاثے"},{id:"staffperf",label:"📊 اسٹاف"},
    {id:"parents",label:"👪 والدین"},{id:"director",label:"👨‍💼 ڈائریکٹر"},
    {id:"alumni",label:"🎓 سابق طلبا"},{id:"visitors",label:"🔒 سیکیورٹی"},
    {id:"seating",label:"🪑 نشست بندی"},{id:"faculty_dev",label:"👩‍🏫 استاد ترقی"},
    {id:"curriculum",label:"📚 نصابی وسائل"},{id:"marks",label:"✏️ نمبرات"},
    {id:"reportcard",label:"📋 رپورٹ کارڈ"},{id:"welfare",label:"💬 طالب علم فلاح"},
    {id:"pride",label:"💌 پرائیڈ میسج"},{id:"wifaq",label:"🕌 وفاق کمپلائنس"},
    {id:"ethics",label:"🌟 اخلاق مانیٹر"},
  ];

  const uName=DEMO.find(d=>d.email===user?.email)?.name||user?.email||"";
  const uRole=DEMO.find(d=>d.email===user?.email)?.role||"teacher";
  const pendingFeesCount=fees.filter(f=>f.status==="pending").length;

  if(loading)return <div style={{...S.lp,color:C.white,fontSize:"1rem",flexDirection:"column",gap:"16px"}}><div style={{fontSize:"2rem"}}>☪</div>لوڈ ہو رہا ہے...</div>;
  if(!user)return <Login onLogin={login} err={err} loading={lLoading}/>;

  return <div style={S.app}>
    <div style={S.hdr}>
      <div style={{display:"flex",alignItems:"center",gap:"14px"}}>
        <div style={{...S.seal,width:"44px",height:"44px",margin:0}}><span style={{fontSize:"1.1rem"}}>☪</span></div>
        <div><div style={{color:C.gold,fontSize:"1rem",fontWeight:"800"}}>امین اسکول ہب</div><div style={{color:"rgba(255,255,255,0.4)",fontSize:"0.5rem",fontFamily:"'Cinzel',serif",letterSpacing:"0.1em"}}>AMEEN ISLAMIC INSTITUTE • SWAT</div></div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:"14px"}}>
        {pendingFeesCount>0&&<div style={{background:C.amber+"20",border:`1px solid ${C.amber}`,borderRadius:"20px",padding:"4px 12px",fontSize:"0.58rem",color:C.amber,fontWeight:"700"}}>💰 {pendingFeesCount} فیس باقی</div>}
        <div style={{textAlign:"left",direction:"ltr"}}><div style={{color:C.gold,fontSize:"0.68rem",fontWeight:"600"}}>{uName}</div><div style={{color:"rgba(255,255,255,0.4)",fontSize:"0.55rem"}}>{uRole}</div></div>
        <button style={{background:"rgba(255,255,255,0.08)",color:"rgba(255,255,255,0.7)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:"10px",padding:"7px 14px",fontSize:"0.62rem",cursor:"pointer",fontFamily:"inherit"}} onClick={logout}>لاگ آؤٹ</button>
      </div>
    </div>
    <div style={S.nav}>
      {PAGES.map(p=><button key={p.id} style={{padding:"13px 14px",border:"none",background:"none",color:page===p.id?C.gold:"#999",fontWeight:page===p.id?"800":"400",fontSize:"0.65rem",cursor:"pointer",borderBottom:page===p.id?`3px solid ${C.gold}`:"3px solid transparent",fontFamily:"inherit",whiteSpace:"nowrap",transition:"color 0.2s",position:"relative"}} onClick={()=>setPage(p.id)}>
        {p.label}
        {p.id==="fees"&&pendingFeesCount>0&&<span style={{position:"absolute",top:"6px",right:"6px",width:"8px",height:"8px",background:C.red,borderRadius:"50%"}}/>}
      </button>)}
    </div>
    <div>
      {page==="dashboard"&&<Dashboard students={students} teachers={teachers} houses={houses} hvsLogs={hvs} fees={fees} results={results}/>}
      {page==="hvs"&&<HVSEntry students={students} houses={houses} addData={addData} updateHousePoints={updateHousePoints}/>}
      {page==="students"&&<Students students={students} addData={addData}/>}
      {page==="teachers"&&<Teachers teachers={teachers} addData={addData}/>}
      {page==="hifz"&&<Hifz students={students} addData={addData}/>}
      {page==="houses"&&<Houses houses={houses} hvsLogs={hvs} students={students}/>}
      {page==="timetable"&&<Timetable/>}
      {page==="fees"&&<FeeManagement students={students} addData={addData}/>}
      {page==="results"&&<Results students={students} addData={addData}/>}
      {page==="events"&&<Events addData={addData} houses={houses} updateHousePoints={updateHousePoints}/>}
      {page==="attendance"&&<Attendance students={students} addData={addData}/>}
      {page==="notifications"&&<Notifications students={students} addData={addData}/>}
      {page==="library"&&<Library students={students} addData={addData}/>}
      {page==="salary"&&<SalaryManagement teachers={teachers} addData={addData}/>}
      {page==="exams"&&<ExamSchedule addData={addData}/>}
      {page==="transport"&&<Transport students={students} addData={addData}/>}
      {page==="tarbiyah"&&<TarbiyahDiary students={students} addData={addData} updateHousePoints={updateHousePoints}/>}
      {page==="superhouse"&&<SuperHouseDashboard houses={houses} hvsLogs={hvs} students={students}/>}
      {page==="hpri"&&<HPRISystem students={students} addData={addData}/>}
      {page==="registrar"&&<RegistrarHub students={students} addData={addData}/>}
      {page==="noticeboard"&&<NoticeBoard addData={addData} user={user}/>}
      {page==="hostel"&&<HostelManagement students={students} addData={addData}/>}
      {page==="health"&&<StudentHealth students={students} addData={addData}/>}
      {page==="madrasa"&&<MadrasaHub students={students} addData={addData}/>}
      {page==="donations"&&<DonationHub addData={addData}/>}
      {page==="meetings"&&<MeetingMinutes addData={addData}/>}
      {page==="assets"&&<LogisticsTracker addData={addData}/>}
      {page==="staffperf"&&<StaffPerformance teachers={teachers} addData={addData}/>}
      {page==="parents"&&<ParentPortal students={students} fees={fees} results={results}/>}
      {page==="director"&&<DirectorPortal students={students} teachers={teachers} houses={houses} fees={fees} results={results} hvsLogs={hvs}/>}
      {page==="alumni"&&<AlumniPortal addData={addData}/>}
      {page==="visitors"&&<VisitorHub addData={addData}/>}
      {page==="seating"&&<ExamSeating students={students} addData={addData}/>}
      {page==="faculty_dev"&&<FacultyDevelopment teachers={teachers} addData={addData}/>}
      {page==="curriculum"&&<CurriculumHub teachers={teachers} addData={addData}/>}
      {page==="marks"&&<MarksEntry students={students} addData={addData}/>}
      {page==="reportcard"&&<ReportCard students={students} results={results} fees={fees} addData={addData}/>}
      {page==="welfare"&&<WelfareFeedback students={students} addData={addData}/>}
      {page==="pride"&&<PrideMessages students={students} teachers={teachers} addData={addData}/>}
      {page==="wifaq"&&<WifaqCompliance addData={addData}/>}
      {page==="ethics"&&<TarbiyahEthics students={students} addData={addData}/>}
    </div>
  </div>;
}
