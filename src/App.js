import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, collection, getDocs, addDoc as fbAddDoc, doc, setDoc, updateDoc, onSnapshot, serverTimestamp, query, orderBy, limit, where, deleteDoc } from "firebase/firestore";

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
  "Grade 6": {
    Monday: ["Quran (7:30)", "Math (8:15)", "Urdu (9:00)", "Break", "English (10:00)", "Science (10:45)", "Islamic Studies (11:30)"],
    Tuesday: ["Hifz (7:30)", "English (8:15)", "Math (9:00)", "Break", "Urdu (10:00)", "Social Studies (10:45)", "PE (11:30)"],
    Wednesday: ["Quran (7:30)", "Science (8:15)", "English (9:00)", "Break", "Math (10:00)", "Art (10:45)", "Islamic Studies (11:30)"],
    Thursday: ["Hifz (7:30)", "Urdu (8:15)", "Social Studies (9:00)", "Break", "English (10:00)", "Math (10:45)", "Assembly (11:30)"],
    Friday: ["Quran (7:30)", "Islamic Studies (8:15)", "Urdu (9:00)", "Break", "English (10:00)", "Dua & Closing (11:00)"]
  },
  "Grade 7": {
    Monday: ["Quran (7:30)", "Math (8:15)", "English (9:00)", "Break", "Science (10:00)", "Urdu (10:45)", "Islamic Studies (11:30)"],
    Tuesday: ["Hifz (7:30)", "Science (8:15)", "Math (9:00)", "Break", "English (10:00)", "History (10:45)", "PE (11:30)"],
    Wednesday: ["Quran (7:30)", "English (8:15)", "Urdu (9:00)", "Break", "Math (10:00)", "Computer (10:45)", "Islamic Studies (11:30)"],
    Thursday: ["Hifz (7:30)", "Math (8:15)", "History (9:00)", "Break", "Science (10:00)", "English (10:45)", "House Activity (11:30)"],
    Friday: ["Quran (7:30)", "Islamic Studies (8:15)", "Urdu (9:00)", "Break", "Math (10:00)", "Dua & Closing (11:00)"]
  },
  "Grade 8": {
    Monday: ["Quran (7:30)", "Physics (8:15)", "Math (9:00)", "Break", "English (10:00)", "Chemistry (10:45)", "Islamic Studies (11:30)"],
    Tuesday: ["Hifz (7:30)", "Math (8:15)", "English (9:00)", "Break", "Biology (10:00)", "Urdu (10:45)", "PE (11:30)"],
    Wednesday: ["Quran (7:30)", "Chemistry (8:15)", "Math (9:00)", "Break", "English (10:00)", "Computer (10:45)", "Islamic Studies (11:30)"],
    Thursday: ["Hifz (7:30)", "Physics (8:15)", "Biology (9:00)", "Break", "Math (10:00)", "English (10:45)", "House Activity (11:30)"],
    Friday: ["Quran (7:30)", "Islamic Studies (8:15)", "Urdu (9:00)", "Break", "Math (10:00)", "Dua & Closing (11:00)"]
  },
  "Grade 9": {
    Monday: ["Quran (7:30)", "Physics (8:15)", "Math (9:00)", "Break", "English (10:00)", "Chemistry (10:45)", "Pakistan Studies (11:30)"],
    Tuesday: ["Hifz (7:30)", "Math (8:15)", "Biology (9:00)", "Break", "English (10:00)", "Urdu (10:45)", "PE (11:30)"],
    Wednesday: ["Quran (7:30)", "Chemistry (8:15)", "Math (9:00)", "Break", "Pakistan Studies (10:00)", "Computer (10:45)", "Islamic Studies (11:30)"],
    Thursday: ["Hifz (7:30)", "Physics (8:15)", "Biology (9:00)", "Break", "Math (10:00)", "English (10:45)", "House Activity (11:30)"],
    Friday: ["Quran (7:30)", "Islamic Studies (8:15)", "Urdu (9:00)", "Break", "Math (10:00)", "Dua & Closing (11:00)"]
  }
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

    {/* Stats Row */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:"14px",marginBottom:"24px"}}>
      {[
        {c:C.abuBakr,i:"🎓",n:students.length,l:"کل طلبا",sub:"فعال"},
        {c:C.umar,i:"👨‍🏫",n:teachers.length,l:"کل اساتذہ",sub:"فعال"},
        {c:C.gold,i:"🏠",n:4,l:"ہاؤسز",sub:"چاروں فعال"},
        {c:lInfo?.color||C.gold,i:"👑",n:lInfo?.nameEn||"—",l:"سپر ہاؤس",sub:`${leader?.points||0} pts`},
        {c:C.green,i:"💰",n:`${feesPct}%`,l:"فیس وصولی",sub:`${pendingFees} زیر التواء`},
        {c:C.purple,i:"📊",n:`${avgResult}%`,l:"اوسط نتیجہ",sub:`${results.length} امتحانات`}
      ].map((x,i)=><div key={i} style={{background:`linear-gradient(135deg,${x.c}12,${x.c}05)`,borderRadius:"18px",padding:"18px",border:`2px solid ${x.c}25`,textAlign:"center"}}>
        <div style={{fontSize:"1.4rem"}}>{x.i}</div>
        <div style={{fontSize:"1.6rem",fontWeight:"900",color:x.c,marginTop:"4px"}}>{x.n}</div>
        <div style={{fontSize:"0.62rem",color:"#888",marginTop:"2px"}}>{x.l}</div>
        <div style={{fontSize:"0.55rem",color:x.c,marginTop:"2px",opacity:0.8}}>{x.sub}</div>
      </div>)}
    </div>

    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"20px",marginBottom:"24px"}}>
      {/* House Leaderboard */}
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

      {/* This week HVS */}
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

    {/* Fee & Result Summary */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"20px",marginBottom:"24px"}}>
      <div style={S.card}>
        <div style={{fontSize:"0.85rem",fontWeight:"700",color:C.navy,marginBottom:"16px"}}>💰 فیس خلاصہ</div>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:"8px"}}>
          <span style={{fontSize:"0.68rem",color:"#888"}}>کل فیس</span>
          <span style={{fontSize:"0.72rem",fontWeight:"700",color:C.navy}}>Rs. {totalFeesDue.toLocaleString()}</span>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:"8px"}}>
          <span style={{fontSize:"0.68rem",color:"#888"}}>وصول شدہ</span>
          <span style={{fontSize:"0.72rem",fontWeight:"700",color:C.green}}>Rs. {totalFeesPaid.toLocaleString()}</span>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:"12px"}}>
          <span style={{fontSize:"0.68rem",color:"#888"}}>باقی</span>
          <span style={{fontSize:"0.72rem",fontWeight:"700",color:C.red}}>Rs. {(totalFeesDue-totalFeesPaid).toLocaleString()}</span>
        </div>
        {pBar(totalFeesPaid,totalFeesDue||1,C.green)}
        <div style={{fontSize:"0.6rem",color:"#aaa",marginTop:"6px",textAlign:"center"}}>{feesPct}% وصول ہوئی</div>
      </div>
      <div style={S.card}>
        <div style={{fontSize:"0.85rem",fontWeight:"700",color:C.navy,marginBottom:"16px"}}>📊 نتائج خلاصہ</div>
        {results.length===0?<div style={{textAlign:"center",color:"#bbb",fontSize:"0.65rem",padding:"20px"}}>ابھی کوئی نتیجہ نہیں</div>:
        <>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:"8px"}}>
            <span style={{fontSize:"0.68rem",color:"#888"}}>کل امتحانات</span>
            <span style={{fontSize:"0.72rem",fontWeight:"700",color:C.navy}}>{results.length}</span>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:"8px"}}>
            <span style={{fontSize:"0.68rem",color:"#888"}}>اوسط نمبر</span>
            <span style={{fontSize:"0.72rem",fontWeight:"700",color:avgResult>=70?C.green:avgResult>=50?C.amber:C.red}}>{avgResult}%</span>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:"12px"}}>
            <span style={{fontSize:"0.68rem",color:"#888"}}>پاس / فیل</span>
            <span style={{fontSize:"0.72rem",fontWeight:"700"}}>
              <span style={{color:C.green}}>{results.filter(r=>r.percentage>=50).length}</span>
              <span style={{color:"#aaa"}}>/</span>
              <span style={{color:C.red}}>{results.filter(r=>r.percentage<50).length}</span>
            </span>
          </div>
          {pBar(avgResult,100,avgResult>=70?C.green:avgResult>=50?C.amber:C.red)}
        </>}
      </div>
    </div>

    {/* House Cards */}
    <div style={S.card}>
      <div style={{fontSize:"0.85rem",fontWeight:"700",color:C.navy,marginBottom:"16px"}}>🏠 ہاؤس کارڈز</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:"16px"}}>
        {HOUSES.map((h,i)=>{ const hd=sorted.find(x=>x.id===h.id)||{}; const studs=students.filter(s=>s.houseId===h.id); return <div key={h.id} style={{background:h.gradient,borderRadius:"18px",padding:"20px",color:C.white,position:"relative",overflow:"hidden"}}>
          {i===0&&sorted[0]?.id===h.id&&<div style={{position:"absolute",top:"10px",left:"12px",fontSize:"1.4rem"}}>👑</div>}
          <div style={{fontSize:"2rem",marginBottom:"6px"}}>{h.emoji}</div>
          <div style={{fontSize:"0.9rem",fontWeight:"800",marginBottom:"2px"}}>{h.nameEn} House</div>
          <div style={{fontSize:"0.65rem",opacity:0.85,marginBottom:"12px",lineHeight:"1.6"}}>{h.slogan}</div>
          <div style={{fontSize:"2rem",fontWeight:"900",opacity:0.9}}>{hd.points||0}</div>
          <div style={{fontSize:"0.6rem",opacity:0.7}}>کل پوائنٹس • {studs.length} طلبا</div>
        </div>; })}
      </div>
    </div>
  </div>;
}

// ===================== HVS ENTRY =====================
function HVSEntry({students,houses,addData,updateHousePoints}){
  const [show,setShow]=useState(false);
  const [houseId,setHouseId]=useState("abuBakr");
  const [week,setWeek]=useState(new Date().toISOString().split("T")[0]);
  const [scores,setScores]=useState({});
  const [logs,setLogs]=useState([]);
  const [saving,setSaving]=useState(false);
  const [selLog,setSelLog]=useState(null);

  useEffect(()=>{
    const q2=query(collection(db,"hvs_logs"),orderBy("createdAt","desc"),limit(50));
    return onSnapshot(q2,s=>setLogs(s.docs.map(d=>({id:d.id,...d.data()}))));
  },[]);

  const setScore=(cat,val)=>setScores({...scores,[cat]:val});
  const getMax=(cat)=>HVS_CATS.find(c=>c.id===cat)?.max||10;
  const calcScore=(r,max)=>Math.round((r/4)*max);
  const total=HVS_CATS.reduce((sum,cat)=>sum+(calcScore(scores[cat.id]||0,cat.max)),0);
  const hInfo=HOUSES.find(h=>h.id===houseId)||{};

  const save=async()=>{
    setSaving(true);
    const catScores={};
    HVS_CATS.forEach(cat=>{ catScores[cat.id]=calcScore(scores[cat.id]||0,cat.max); });
    await addData("hvs_logs",{houseId,week,ratings:scores,scores:catScores,total,maxTotal:HVS_TOTAL});
    await updateHousePoints(houseId,total);
    setScores({}); setShow(false); setSaving(false);
  };

  const rInfo=(val)=>RATING.find(r=>r.val===val)||{};

  // Per-house weekly summary
  const houseSummary=HOUSES.map(h=>{
    const hLogs=logs.filter(l=>l.houseId===h.id);
    const total=hLogs.reduce((s,l)=>s+(l.total||0),0);
    const avg=hLogs.length>0?Math.round(total/hLogs.length):0;
    return {...h,logCount:hLogs.length,totalPts:total,avgScore:avg};
  }).sort((a,b)=>b.totalPts-a.totalPts);

  return <div style={S.page}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"24px"}}>
      <div>
        <div style={{fontSize:"1.1rem",fontWeight:"700",color:C.navy}}>📊 HVS اسکورنگ سسٹم</div>
        <div style={{fontSize:"0.65rem",color:"#888",marginTop:"2px"}}>ہاؤس ویلیو اسکور — 160 مارکس فریم ورک</div>
      </div>
      <button style={S.addBtn} onClick={()=>setShow(!show)}>+ نیا HVS اسکور</button>
    </div>

    {/* House HVS summary cards */}
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
        <div>
          <label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>ہاؤس منتخب کریں</label>
          <select style={{...S.inpSm,borderColor:hInfo.color||C.gold}} value={houseId} onChange={e=>setHouseId(e.target.value)}>
            {HOUSES.map(h=><option key={h.id} value={h.id}>{h.emoji} {h.nameEn}</option>)}
          </select>
        </div>
        <div>
          <label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>ہفتے کی تاریخ</label>
          <input style={{...S.inpSm,direction:"ltr"}} type="date" value={week} onChange={e=>setWeek(e.target.value)}/>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px",marginBottom:"20px"}}>
        {HVS_CATS.map(cat=>{
          const rating=scores[cat.id]||0;
          const ri=rInfo(rating);
          const earned=calcScore(rating,cat.max);
          return <div key={cat.id} style={{background:C.white,borderRadius:"14px",padding:"16px",border:`1px solid ${C.goldLight}`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"8px"}}>
              <div>
                <div style={{fontSize:"0.75rem",fontWeight:"700",color:C.navy}}>{cat.icon} {cat.label}</div>
                <div style={{fontSize:"0.55rem",color:"#aaa",marginTop:"2px"}}>{cat.desc}</div>
              </div>
              <div style={{textAlign:"left",direction:"ltr"}}>
                <div style={{fontSize:"0.65rem",fontWeight:"700",color:hInfo.color||C.gold}}>{earned}/{cat.max}</div>
              </div>
            </div>
            <div style={{display:"flex",gap:"6px"}}>
              {RATING.map(r=><button key={r.val} onClick={()=>setScore(cat.id,r.val)} style={{flex:1,padding:"6px 2px",borderRadius:"8px",border:"none",cursor:"pointer",fontSize:"0.55rem",fontWeight:"700",background:scores[cat.id]===r.val?r.bg:"#f5f5f5",color:scores[cat.id]===r.val?r.color:"#bbb",transition:"all 0.15s"}}>
                {r.val}<br/><span style={{fontSize:"0.45rem"}}>{r.labelEn}</span>
              </button>)}
            </div>
          </div>;
        })}
      </div>
      <div style={{background:C.white,borderRadius:"14px",padding:"16px",marginBottom:"16px",textAlign:"center",border:`2px solid ${total>=120?C.green:total>=80?C.gold:C.red}30`}}>
        <div style={{fontSize:"0.65rem",color:"#888",marginBottom:"4px"}}>کل اسکور</div>
        <div style={{fontSize:"2.5rem",fontWeight:"900",color:total>=120?C.green:total>=80?C.gold:C.red}}>{total}</div>
        <div style={{fontSize:"0.65rem",color:"#aaa"}}>/ {HVS_TOTAL} مارکس</div>
        {pBar(total,HVS_TOTAL,total>=120?C.green:total>=80?C.gold:C.red)}
        <div style={{fontSize:"0.6rem",color:"#888",marginTop:"8px"}}>{total>=120?"🟢 شاندار کارکردگی!":total>=80?"🟡 اچھا، مزید بہتری ممکن ہے":"🔴 بہتری کی ضرورت ہے"}</div>
      </div>
      <button style={{...S.saveBtn,width:"100%"}} onClick={save} disabled={saving}>{saving?"محفوظ ہو رہا ہے...":"✅ HVS اسکور محفوظ کریں"}</button>
    </div>}

    <div style={S.card}>
      <div style={{fontSize:"0.85rem",fontWeight:"700",color:C.navy,marginBottom:"16px"}}>📋 HVS لاگ — حالیہ اسکورز</div>
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr>
            <th style={S.th}>ہاؤس</th>
            <th style={S.th}>ہفتہ</th>
            {HVS_CATS.slice(0,4).map(c=><th key={c.id} style={S.th}>{c.icon}</th>)}
            <th style={S.th}>کل</th>
            <th style={S.th}>گریڈ</th>
          </tr></thead>
          <tbody>{logs.map(l=>{ const info=HOUSES.find(x=>x.id===l.houseId)||{}; const grade=l.total>=140?"A+":l.total>=120?"A":l.total>=100?"B":l.total>=80?"C":"D"; const gc=l.total>=120?C.green:l.total>=80?C.amber:C.red; return <tr key={l.id}>
            <td style={S.td}><span style={hBadge(info.color,info.light)}>{info.emoji} {info.nameEn}</span></td>
            <td style={{...S.td,fontFamily:"monospace",direction:"ltr",fontSize:"0.6rem"}}>{l.week}</td>
            {HVS_CATS.slice(0,4).map(c=><td key={c.id} style={S.td}>{l.scores?.[c.id]||0}/{c.max}</td>)}
            <td style={{...S.td,fontWeight:"800",color:gc}}>{l.total||0}/{HVS_TOTAL}</td>
            <td style={S.td}><span style={{padding:"3px 10px",borderRadius:"20px",background:gc+"15",color:gc,fontSize:"0.62rem",fontWeight:"800"}}>{grade}</span></td>
          </tr>; })}{logs.length===0&&<tr><td colSpan={8} style={{...S.td,textAlign:"center",color:"#bbb",padding:"40px"}}>ابھی تک کوئی HVS لاگ نہیں</td></tr>}</tbody>
        </table>
      </div>
    </div>

    {/* HVS Guide */}
    <div style={{...S.card,marginTop:"20px"}}>
      <div style={{fontSize:"0.85rem",fontWeight:"700",color:C.navy,marginBottom:"16px"}}>📖 HVS گائیڈ</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:"10px"}}>
        {HVS_CATS.map(cat=><div key={cat.id} style={{display:"flex",alignItems:"center",gap:"10px",padding:"10px 14px",background:"#fafaf8",borderRadius:"10px",border:`1px solid ${C.goldLight}`}}>
          <span style={{fontSize:"1.2rem"}}>{cat.icon}</span>
          <div>
            <div style={{fontSize:"0.65rem",fontWeight:"700",color:C.navy}}>{cat.label}</div>
            <div style={{fontSize:"0.55rem",color:C.gold,fontWeight:"600"}}>{cat.max} مارکس</div>
          </div>
        </div>)}
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:"10px 14px",background:`linear-gradient(135deg,${C.goldLight},#fdf8ee)`,borderRadius:"10px",border:`2px solid ${C.gold}50`}}>
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:"1.5rem",fontWeight:"900",color:C.gold}}>160</div>
            <div style={{fontSize:"0.55rem",color:C.goldDark,fontWeight:"700"}}>کل مارکس</div>
          </div>
        </div>
      </div>
    </div>
  </div>;
}

// ===================== STUDENTS =====================
function Students({students,addData}){
  const [show,setShow]=useState(false);
  const [f,setF]=useState({name:"",fatherName:"",grade:"Grade 7",houseId:"abuBakr",studentCode:"",section:"Orchid",canteenBalance:100,talent:"",phone:""});
  const [q,setQ]=useState("");
  const [selStudent,setSelStudent]=useState(null);
  const filtered=students.filter(s=>s.name?.includes(q)||s.studentCode?.includes(q)||s.houseId?.includes(q)||s.grade?.includes(q));
  const add=async()=>{ if(!f.name)return; await addData("students",{...f,enrollmentStatus:"active"}); setShow(false); setF({name:"",fatherName:"",grade:"Grade 7",houseId:"abuBakr",studentCode:"",section:"Orchid",canteenBalance:100,talent:"",phone:""}); };
  const houseStudents=(hid)=>students.filter(s=>s.houseId===hid).length;

  if(selStudent){
    const h=HOUSES.find(x=>x.id===selStudent.houseId)||{};
    return <div style={S.page}>
      <button style={{...S.addBtn,marginBottom:"20px",background:"#eee",color:C.navy,boxShadow:"none"}} onClick={()=>setSelStudent(null)}>← واپس</button>
      <div style={{...S.card,background:h.gradient,color:C.white,marginBottom:"20px"}}>
        <div style={{display:"flex",alignItems:"center",gap:"20px"}}>
          <div style={{width:"70px",height:"70px",borderRadius:"50%",background:"rgba(255,255,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"2rem"}}>{h.emoji||"👤"}</div>
          <div>
            <div style={{fontSize:"1.2rem",fontWeight:"800"}}>{selStudent.name}</div>
            <div style={{fontSize:"0.7rem",opacity:0.85,marginTop:"4px"}}>والد: {selStudent.fatherName}</div>
            <div style={{fontSize:"0.65rem",opacity:0.7,fontFamily:"monospace",direction:"ltr",marginTop:"2px"}}>{selStudent.studentCode}</div>
          </div>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px"}}>
        {[
          {label:"جماعت",val:selStudent.grade,icon:"📚"},
          {label:"ہاؤس",val:h.nameEn||"—",icon:h.emoji||"🏠"},
          {label:"سیکشن",val:selStudent.section||"—",icon:"🏫"},
          {label:"ہنر",val:selStudent.talent||"—",icon:"⭐"},
          {label:"فون",val:selStudent.phone||"—",icon:"📱"},
          {label:"کینٹین بیلنس",val:`Rs. ${selStudent.canteenBalance||0}`,icon:"💰"},
          {label:"داخلہ",val:selStudent.enrollmentStatus||"active",icon:"✅"},
        ].map((item,i)=><div key={i} style={S.card}>
          <div style={{fontSize:"1.2rem"}}>{item.icon}</div>
          <div style={{fontSize:"0.62rem",color:"#888",marginTop:"6px"}}>{item.label}</div>
          <div style={{fontSize:"0.85rem",fontWeight:"700",color:C.navy,marginTop:"2px"}}>{item.val}</div>
        </div>)}
      </div>
    </div>;
  }

  return <div style={S.page}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"8px"}}>
      <div>
        <div style={{fontSize:"1.1rem",fontWeight:"700",color:C.navy}}>🎓 طلبا ({students.length})</div>
        <div style={{display:"flex",gap:"8px",marginTop:"8px",flexWrap:"wrap"}}>
          {HOUSES.map(h=><span key={h.id} style={{...hBadge(h.color,h.light),fontSize:"0.58rem"}}>{h.emoji} {h.nameEn}: {houseStudents(h.id)}</span>)}
        </div>
      </div>
      <button style={S.addBtn} onClick={()=>setShow(!show)}>+ نیا طالب علم</button>
    </div>

    {show&&<div style={{...S.card,margin:"16px 0",background:`linear-gradient(135deg,${C.goldLight},#fdf8ee)`,border:`2px solid ${C.gold}30`}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>نام *</label><input style={S.inpSm} value={f.name} onChange={e=>setF({...f,name:e.target.value})} placeholder="طالب علم کا نام"/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>والد کا نام</label><input style={S.inpSm} value={f.fatherName} onChange={e=>setF({...f,fatherName:e.target.value})} placeholder="والد کا نام"/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>جماعت</label><select style={S.inpSm} value={f.grade} onChange={e=>setF({...f,grade:e.target.value})}>{["Grade 1","Grade 2","Grade 3","Grade 4","Grade 5","Grade 6","Grade 7","Grade 8","Grade 9","Grade 10"].map(g=><option key={g}>{g}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>ہاؤس</label><select style={S.inpSm} value={f.houseId} onChange={e=>setF({...f,houseId:e.target.value})}>{HOUSES.map(h=><option key={h.id} value={h.id}>{h.emoji} {h.nameEn}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>کوڈ</label><input style={{...S.inpSm,direction:"ltr"}} value={f.studentCode} onChange={e=>setF({...f,studentCode:e.target.value})} placeholder="AII-2026-XXX"/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>فون (والدین)</label><input style={{...S.inpSm,direction:"ltr"}} value={f.phone} onChange={e=>setF({...f,phone:e.target.value})} placeholder="0300-1234567"/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>ہنر</label><input style={S.inpSm} value={f.talent} onChange={e=>setF({...f,talent:e.target.value})} placeholder="تقریر، نعت، کرکٹ..."/></div>
      </div>
      <button style={S.saveBtn} onClick={add}>✅ محفوظ کریں</button>
    </div>}

    <div style={{marginBottom:"16px"}}><input style={{...S.inpSm,direction:"rtl"}} placeholder="🔍 تلاش — نام، کوڈ، جماعت..." value={q} onChange={e=>setQ(e.target.value)}/></div>
    <div style={S.card}>
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr><th style={S.th}>نام</th><th style={S.th}>والد</th><th style={S.th}>کوڈ</th><th style={S.th}>جماعت</th><th style={S.th}>ہاؤس</th><th style={S.th}>ہنر</th><th style={S.th}>بیلنس</th><th style={S.th}>پروفائل</th></tr></thead>
          <tbody>{filtered.map(s=>{ const h=HOUSES.find(x=>x.id===s.houseId); return <tr key={s.id}>
            <td style={{...S.td,fontWeight:"700"}}>{s.name}</td>
            <td style={S.td}>{s.fatherName}</td>
            <td style={{...S.td,fontFamily:"monospace",direction:"ltr",fontSize:"0.6rem",color:C.gold}}>{s.studentCode}</td>
            <td style={S.td}>{s.grade}</td>
            <td style={S.td}>{h&&<span style={hBadge(h.color,h.light)}>{h.emoji} {h.nameEn}</span>}</td>
            <td style={S.td}>{s.talent||"—"}</td>
            <td style={{...S.td,fontWeight:"700",color:(s.canteenBalance||0)<50?C.red:C.green}}>Rs. {s.canteenBalance||0}</td>
            <td style={S.td}><button onClick={()=>setSelStudent(s)} style={{...S.addBtn,padding:"5px 12px",fontSize:"0.58rem"}}>دیکھیں</button></td>
          </tr>; })}{filtered.length===0&&<tr><td colSpan={8} style={{...S.td,textAlign:"center",color:"#bbb",padding:"40px"}}>کوئی طالب علم نہیں ملا</td></tr>}</tbody>
        </table>
      </div>
    </div>
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
          <div>
            <div style={{fontWeight:"700",color:C.navy,fontSize:"0.85rem"}}>{t.name}</div>
            <div style={{fontSize:"0.6rem",color:"#999",marginTop:"2px"}}>{t.employeeCode}</div>
          </div>
        </div>
        <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
          <span style={hBadge(C.navy,C.abuBakrLight)}>{t.subject}</span>
          <span style={hBadge(C.gold,C.goldLight)}>{t.grade}</span>
          {h.id&&<span style={hBadge(h.color,h.light)}>{h.emoji} ہاؤس ماسٹر</span>}
        </div>
      </div>; })}
    </div>
  </div>;
}

// ===================== HIFZ =====================
function Hifz({students,addData}){
  const [logs,setLogs]=useState([]); const [show,setShow]=useState(false);
  const [f,setF]=useState({studentId:"",surah:"",performanceRating:"GOOD",revisionType:"new"});
  useEffect(()=>{
    const q2=query(collection(db,"hifz_logs"),orderBy("createdAt","desc"),limit(30));
    return onSnapshot(q2,s=>setLogs(s.docs.map(d=>({id:d.id,...d.data()}))));
  },[]);
  const add=async()=>{ if(!f.studentId||!f.surah)return; const pts={EXCELLENT:10,GOOD:5,AVERAGE:0,WEAK:-2}[f.performanceRating]||0; await addData("hifz_logs",{...f,housePointsAwarded:pts}); setShow(false); setF({studentId:"",surah:"",performanceRating:"GOOD",revisionType:"new"}); };
  const rColor={EXCELLENT:C.green,GOOD:C.abuBakr,AVERAGE:C.amber,WEAK:C.red}; const rBg={EXCELLENT:"#dcfce7",GOOD:"#dbeafe",AVERAGE:"#fef3c7",WEAK:"#fee2e2"};
  return <div style={S.page}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"24px"}}>
      <div>
        <div style={{fontSize:"1.1rem",fontWeight:"700",color:C.navy}}>📖 حفظ لاگ</div>
        <div style={{fontSize:"0.62rem",color:"#888",marginTop:"2px"}}>روزانہ حفظ کی کارکردگی</div>
      </div>
      <button style={S.addBtn} onClick={()=>setShow(!show)}>+ نیا لاگ</button>
    </div>
    {show&&<div style={{...S.card,marginBottom:"24px",background:`linear-gradient(135deg,${C.goldLight},#fdf8ee)`}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>طالب علم</label><select style={S.inpSm} value={f.studentId} onChange={e=>setF({...f,studentId:e.target.value})}><option value="">-- منتخب کریں --</option>{students.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>سورہ / پارہ</label><input style={S.inpSm} value={f.surah} onChange={e=>setF({...f,surah:e.target.value})} placeholder="سورہ بقرہ، پارہ 1..."/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>کارکردگی</label><select style={S.inpSm} value={f.performanceRating} onChange={e=>setF({...f,performanceRating:e.target.value})}>{["EXCELLENT","GOOD","AVERAGE","WEAK"].map(r=><option key={r}>{r}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>نوعیت</label><select style={S.inpSm} value={f.revisionType} onChange={e=>setF({...f,revisionType:e.target.value})}>{["new","revision","sabqi","manzil"].map(r=><option key={r}>{r}</option>)}</select></div>
      </div>
      <div style={{fontSize:"0.7rem",color:C.goldDark,marginBottom:"12px",background:C.white,padding:"10px 14px",borderRadius:"10px"}}>🏆 پوائنٹس: <strong>{f.performanceRating==="EXCELLENT"?"+10":f.performanceRating==="GOOD"?"+5":f.performanceRating==="AVERAGE"?"0":"-2"}</strong></div>
      <button style={S.saveBtn} onClick={add}>✅ محفوظ کریں</button>
    </div>}
    <div style={S.card}>
      <table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead><tr><th style={S.th}>طالب علم</th><th style={S.th}>سورہ</th><th style={S.th}>نوعیت</th><th style={S.th}>کارکردگی</th><th style={S.th}>پوائنٹس</th></tr></thead>
        <tbody>{logs.map(l=>{ const st=students.find(s=>s.id===l.studentId); return <tr key={l.id}>
          <td style={{...S.td,fontWeight:"700"}}>{st?.name||"—"}</td>
          <td style={S.td}>{l.surah}</td>
          <td style={S.td}><span style={{fontSize:"0.6rem",color:"#888"}}>{l.revisionType}</span></td>
          <td style={S.td}><span style={{padding:"4px 10px",borderRadius:"20px",fontSize:"0.58rem",fontWeight:"700",background:rBg[l.performanceRating]||"#eee",color:rColor[l.performanceRating]||"#888"}}>{l.performanceRating}</span></td>
          <td style={{...S.td,fontWeight:"800",color:(l.housePointsAwarded||0)>0?C.green:(l.housePointsAwarded||0)<0?C.red:"#888"}}>{(l.housePointsAwarded||0)>0?"+":""}{l.housePointsAwarded||0}</td>
        </tr>; })}{logs.length===0&&<tr><td colSpan={5} style={{...S.td,textAlign:"center",color:"#bbb",padding:"40px"}}>ابھی کوئی لاگ نہیں</td></tr>}</tbody>
      </table>
    </div>
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
      {sorted.map((h,i)=>{ const info=HOUSES.find(x=>x.id===h.id)||{}; const totals=catTotals(h.id); const studs=hStudents(h.id);
        return <div key={h.id} style={{background:info.gradient,borderRadius:"22px",padding:"24px",color:C.white,position:"relative",overflow:"hidden",boxShadow:`0 8px 32px ${info.color||C.navy}40`}}>
          {i===0&&<div style={{position:"absolute",top:"12px",left:"14px",fontSize:"1.6rem"}}>👑</div>}
          <div style={{position:"absolute",top:"12px",right:"14px",fontSize:"0.65rem",background:"rgba(255,255,255,0.2)",padding:"4px 10px",borderRadius:"20px",fontWeight:"700"}}>#{i+1}</div>
          <div style={{fontSize:"2.2rem",marginBottom:"8px"}}>{info.emoji}</div>
          <div style={{fontSize:"1rem",fontWeight:"800",marginBottom:"2px"}}>{info.nameEn} House</div>
          <div style={{fontSize:"0.6rem",opacity:0.85,marginBottom:"4px"}}>{info.name}</div>
          <div style={{fontSize:"0.55rem",opacity:0.7,marginBottom:"16px",fontStyle:"italic"}}>{info.slogan}</div>
          <div style={{fontSize:"2.8rem",fontWeight:"900",opacity:0.95}}>{h.points||0}</div>
          <div style={{fontSize:"0.6rem",opacity:0.7,marginBottom:"16px"}}>کل پوائنٹس</div>
          <div style={{height:"4px",background:"rgba(255,255,255,0.2)",borderRadius:"2px",overflow:"hidden",marginBottom:"12px"}}>
            <div style={{width:`${((h.points||0)/max)*100}%`,height:"100%",background:"rgba(255,255,255,0.7)",borderRadius:"2px"}}/>
          </div>
          <div style={{fontSize:"0.6rem",opacity:0.85}}>👥 {studs.length} طلبا • 📊 {hvsLogs.filter(l=>l.houseId===h.id).length} HVS</div>
        </div>; })}
    </div>

    <div style={S.card}>
      <div style={{fontSize:"0.85rem",fontWeight:"700",color:C.navy,marginBottom:"20px"}}>📊 HVS کیٹیگری وار تجزیہ</div>
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr>
            <th style={S.th}>کیٹیگری</th>
            {HOUSES.map(h=><th key={h.id} style={{...S.th,color:h.color}}>{h.emoji} {h.nameEn}</th>)}
          </tr></thead>
          <tbody>{HVS_CATS.map(cat=><tr key={cat.id}>
            <td style={{...S.td,fontWeight:"600"}}>{cat.icon} {cat.label} <span style={{fontSize:"0.55rem",color:"#aaa"}}>/{cat.max}</span></td>
            {HOUSES.map(h=>{ const ct=catTotals(h.id); return <td key={h.id} style={{...S.td,fontWeight:"700",color:h.color,textAlign:"center"}}>{ct[cat.id]||0}</td>; })}
          </tr>)}</tbody>
        </table>
      </div>
    </div>

    <div style={{...S.card,marginTop:"20px"}}>
      <div style={{fontSize:"0.85rem",fontWeight:"700",color:C.navy,marginBottom:"16px"}}>📅 سالانہ تھیم پلاننگ</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:"10px"}}>
        {MONTHS.map((m,i)=><div key={i} style={{padding:"12px 14px",borderRadius:"12px",background:i===selMonth?`linear-gradient(135deg,${C.gold},${C.goldDark})`:"#fafaf8",color:i===selMonth?C.white:C.navy,cursor:"pointer",border:`1px solid ${i===selMonth?C.gold:C.goldLight}`,fontSize:"0.62rem",fontWeight:i===selMonth?"700":"400",transition:"all 0.2s"}} onClick={()=>setSelMonth(i)}>
          {m}
        </div>)}
      </div>
    </div>
  </div>;
}

// ===================== ATTENDANCE =====================
function Attendance({students,addData}){
  const [att,setAtt]=useState({}); const [saved,setSaved]=useState(false);
  const [attLogs,setAttLogs]=useState([]); const [tab,setTab]=useState("today");
  const today=new Date().toISOString().split("T")[0];

  useEffect(()=>{
    const q2=query(collection(db,"attendance"),orderBy("createdAt","desc"),limit(100));
    return onSnapshot(q2,s=>setAttLogs(s.docs.map(d=>({id:d.id,...d.data()}))));
  },[]);

  const markAll=s=>{ const a={}; students.forEach(x=>{a[x.id]=s;}); setAtt(a); };
  const save=async()=>{ for(const[sid,status] of Object.entries(att)) await addData("attendance",{studentId:sid,status,date:today}); setSaved(true); setTimeout(()=>setSaved(false),3000); };
  const counts={present:Object.values(att).filter(x=>x==="present").length,absent:Object.values(att).filter(x=>x==="absent").length,late:Object.values(att).filter(x=>x==="late").length};

  // Report: per student attendance summary
  const studentReport=students.map(s=>{
    const sLogs=attLogs.filter(l=>l.studentId===s.id);
    const present=sLogs.filter(l=>l.status==="present").length;
    const absent=sLogs.filter(l=>l.status==="absent").length;
    const late=sLogs.filter(l=>l.status==="late").length;
    const total=sLogs.length;
    const pct=total>0?Math.round((present/total)*100):0;
    return {...s,present,absent,late,total,pct};
  });

  return <div style={S.page}>
    <div style={{fontSize:"1.1rem",fontWeight:"700",color:C.navy,marginBottom:"16px"}}>✅ حاضری</div>
    <div style={{display:"flex",gap:"8px",marginBottom:"20px"}}>
      {["today","report"].map(t=><button key={t} onClick={()=>setTab(t)} style={{padding:"8px 18px",borderRadius:"10px",border:"none",cursor:"pointer",fontSize:"0.68rem",fontWeight:tab===t?"700":"400",background:tab===t?`linear-gradient(135deg,${C.gold},${C.goldDark})`:C.white,color:tab===t?C.white:"#888",fontFamily:"inherit"}}>{t==="today"?"آج کی حاضری":"رپورٹ / تجزیہ"}</button>)}
    </div>

    {tab==="today"&&<>
      <div style={{fontSize:"0.65rem",color:"#888",marginBottom:"16px",direction:"ltr"}}>{today}</div>
      <div style={{display:"flex",gap:"12px",marginBottom:"20px",flexWrap:"wrap"}}>
        <div style={{background:"#dcfce7",borderRadius:"12px",padding:"12px 20px",textAlign:"center"}}><div style={{fontSize:"1.4rem",fontWeight:"800",color:C.green}}>{counts.present}</div><div style={{fontSize:"0.6rem",color:C.green}}>حاضر</div></div>
        <div style={{background:"#fee2e2",borderRadius:"12px",padding:"12px 20px",textAlign:"center"}}><div style={{fontSize:"1.4rem",fontWeight:"800",color:C.red}}>{counts.absent}</div><div style={{fontSize:"0.6rem",color:C.red}}>غائب</div></div>
        <div style={{background:"#fef3c7",borderRadius:"12px",padding:"12px 20px",textAlign:"center"}}><div style={{fontSize:"1.4rem",fontWeight:"800",color:C.amber}}>{counts.late}</div><div style={{fontSize:"0.6rem",color:C.amber}}>دیر</div></div>
        <div style={{background:"#f3f4f6",borderRadius:"12px",padding:"12px 20px",textAlign:"center"}}><div style={{fontSize:"1.4rem",fontWeight:"800",color:"#888"}}>{students.length-counts.present-counts.absent-counts.late}</div><div style={{fontSize:"0.6rem",color:"#888"}}>غیر نشان</div></div>
      </div>
      <div style={{display:"flex",gap:"10px",marginBottom:"20px",flexWrap:"wrap"}}>
        <button style={{...S.addBtn,background:`linear-gradient(135deg,${C.green},#15803d)`}} onClick={()=>markAll("present")}>سب حاضر ✅</button>
        <button style={{...S.addBtn,background:`linear-gradient(135deg,${C.red},#b91c1c)`}} onClick={()=>markAll("absent")}>سب غائب ❌</button>
        <button style={S.addBtn} onClick={save}>{saved?"✅ محفوظ ہوگیا!":"💾 محفوظ کریں"}</button>
      </div>
      <div style={S.card}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr><th style={S.th}>نام</th><th style={S.th}>ہاؤس</th><th style={S.th}>جماعت</th><th style={S.th}>حاضری</th></tr></thead>
          <tbody>{students.map(s=>{ const h=HOUSES.find(x=>x.id===s.houseId); return <tr key={s.id}>
            <td style={{...S.td,fontWeight:"700"}}>{s.name}</td>
            <td style={S.td}>{h&&<span style={hBadge(h.color,h.light)}>{h.emoji}</span>}</td>
            <td style={S.td}>{s.grade}</td>
            <td style={S.td}><div style={{display:"flex",gap:"6px"}}>{["present","absent","late"].map(status=><button key={status} onClick={()=>setAtt({...att,[s.id]:status})} style={{padding:"5px 10px",borderRadius:"8px",border:"none",cursor:"pointer",fontSize:"0.58rem",fontWeight:"700",background:att[s.id]===status?(status==="present"?C.green:status==="absent"?C.red:C.amber):"#eee",color:att[s.id]===status?C.white:"#aaa",transition:"all 0.15s"}}>
              {status==="present"?"✅":status==="absent"?"❌":"⏰"}
            </button>)}</div></td>
          </tr>; })}</tbody>
        </table>
      </div>
    </>}

    {tab==="report"&&<div style={S.card}>
      <div style={{fontSize:"0.85rem",fontWeight:"700",color:C.navy,marginBottom:"16px"}}>📊 حاضری رپورٹ — ہر طالب علم</div>
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr><th style={S.th}>نام</th><th style={S.th}>ہاؤس</th><th style={S.th}>حاضر</th><th style={S.th}>غائب</th><th style={S.th}>دیر</th><th style={S.th}>فیصد</th><th style={S.th}>حال</th></tr></thead>
          <tbody>{studentReport.map(s=>{ const h=HOUSES.find(x=>x.id===s.houseId); return <tr key={s.id}>
            <td style={{...S.td,fontWeight:"700"}}>{s.name}</td>
            <td style={S.td}>{h&&<span style={hBadge(h.color,h.light)}>{h.emoji}</span>}</td>
            <td style={{...S.td,color:C.green,fontWeight:"700"}}>{s.present}</td>
            <td style={{...S.td,color:C.red,fontWeight:"700"}}>{s.absent}</td>
            <td style={{...S.td,color:C.amber,fontWeight:"700"}}>{s.late}</td>
            <td style={S.td}>
              <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
                <div style={{flex:1}}>{pBar(s.pct,100,s.pct>=80?C.green:s.pct>=60?C.amber:C.red)}</div>
                <span style={{fontSize:"0.62rem",fontWeight:"700",color:s.pct>=80?C.green:s.pct>=60?C.amber:C.red}}>{s.pct}%</span>
              </div>
            </td>
            <td style={S.td}><span style={{padding:"3px 8px",borderRadius:"20px",fontSize:"0.55rem",fontWeight:"700",background:s.pct>=80?"#dcfce7":s.pct>=60?"#fef3c7":"#fee2e2",color:s.pct>=80?C.green:s.pct>=60?C.amber:C.red}}>{s.pct>=80?"منظم":s.pct>=60?"اوسط":"خطرہ"}</span></td>
          </tr>; })}</tbody>
        </table>
      </div>
    </div>}
  </div>;
}

// ===================== FEE MANAGEMENT =====================
function FeeManagement({students,addData}){
  const [fees,setFees]=useState([]); const [show,setShow]=useState(false);
  const [f,setF]=useState({studentId:"",amount:3000,month:"",type:"monthly",status:"pending",notes:""});
  const [q,setQ]=useState(""); const [filterStatus,setFilterStatus]=useState("all");

  useEffect(()=>{
    return onSnapshot(query(collection(db,"fees"),orderBy("createdAt","desc"),limit(100)),s=>setFees(s.docs.map(d=>({id:d.id,...d.data()}))));
  },[]);

  const add=async()=>{ if(!f.studentId)return; await addData("fees",{...f,amount:Number(f.amount)}); setShow(false); setF({studentId:"",amount:3000,month:"",type:"monthly",status:"pending",notes:""}); };
  const markPaid=async(feeId)=>{ await updateDoc(doc(db,"fees",feeId),{status:"paid",paidAt:serverTimestamp()}); };

  const currentMonth=new Date().toISOString().slice(0,7);
  const filtered=fees.filter(fee=>{
    const st=students.find(s=>s.id===fee.studentId);
    const matchQ=!q||st?.name?.includes(q)||fee.month?.includes(q);
    const matchStatus=filterStatus==="all"||fee.status===filterStatus;
    return matchQ&&matchStatus;
  });

  const totalDue=fees.reduce((s,f)=>s+(f.amount||0),0);
  const totalPaid=fees.filter(f=>f.status==="paid").reduce((s,f)=>s+(f.amount||0),0);
  const pending=fees.filter(f=>f.status==="pending");

  const feeTypes={monthly:"ماہانہ فیس",admission:"داخلہ فیس",exam:"امتحان فیس",transport:"ٹرانسپورٹ",other:"دیگر"};

  return <div style={S.page}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
      <div>
        <div style={{fontSize:"1.1rem",fontWeight:"700",color:C.navy}}>💰 فیس مینجمنٹ</div>
        <div style={{fontSize:"0.62rem",color:"#888",marginTop:"2px"}}>فیس ریکارڈ، وصولی، اور رپورٹ</div>
      </div>
      <button style={S.addBtn} onClick={()=>setShow(!show)}>+ نئی فیس</button>
    </div>

    {/* Summary */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:"14px",marginBottom:"20px"}}>
      {[
        {c:C.navy,i:"💰",n:`Rs.${(totalDue/1000).toFixed(1)}K`,l:"کل فیس"},
        {c:C.green,i:"✅",n:`Rs.${(totalPaid/1000).toFixed(1)}K`,l:"وصول شدہ"},
        {c:C.red,i:"⏳",n:`Rs.${((totalDue-totalPaid)/1000).toFixed(1)}K`,l:"باقی"},
        {c:C.amber,i:"📋",n:pending.length,l:"زیر التواء"}
      ].map((x,i)=><div key={i} style={{background:`linear-gradient(135deg,${x.c}12,${x.c}05)`,borderRadius:"16px",padding:"16px",border:`2px solid ${x.c}20`,textAlign:"center"}}>
        <div style={{fontSize:"1.3rem"}}>{x.i}</div>
        <div style={{fontSize:"1.4rem",fontWeight:"900",color:x.c}}>{x.n}</div>
        <div style={{fontSize:"0.6rem",color:"#888",marginTop:"2px"}}>{x.l}</div>
      </div>)}
    </div>

    {show&&<div style={{...S.card,marginBottom:"20px",background:`linear-gradient(135deg,${C.goldLight},#fdf8ee)`,border:`2px solid ${C.gold}30`}}>
      <div style={{fontSize:"0.85rem",fontWeight:"700",color:C.navy,marginBottom:"16px"}}>💰 نئی فیس درج کریں</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>طالب علم *</label><select style={S.inpSm} value={f.studentId} onChange={e=>setF({...f,studentId:e.target.value})}><option value="">-- منتخب کریں --</option>{students.map(s=><option key={s.id} value={s.id}>{s.name} ({s.grade})</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>رقم (Rs.)</label><input style={{...S.inpSm,direction:"ltr"}} type="number" value={f.amount} onChange={e=>setF({...f,amount:e.target.value})}/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>قسم</label><select style={S.inpSm} value={f.type} onChange={e=>setF({...f,type:e.target.value})}>{Object.entries(feeTypes).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>مہینہ</label><input style={{...S.inpSm,direction:"ltr"}} type="month" value={f.month} onChange={e=>setF({...f,month:e.target.value})}/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>حال</label><select style={S.inpSm} value={f.status} onChange={e=>setF({...f,status:e.target.value})}><option value="pending">زیر التواء</option><option value="paid">ادا شدہ</option></select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>نوٹس</label><input style={S.inpSm} value={f.notes} onChange={e=>setF({...f,notes:e.target.value})} placeholder="نوٹ..."/></div>
      </div>
      <button style={S.saveBtn} onClick={add}>✅ محفوظ کریں</button>
    </div>}

    <div style={{display:"flex",gap:"10px",marginBottom:"16px",flexWrap:"wrap",alignItems:"center"}}>
      <input style={{...S.inpSm,maxWidth:"220px",direction:"rtl"}} placeholder="🔍 نام تلاش کریں..." value={q} onChange={e=>setQ(e.target.value)}/>
      {["all","pending","paid"].map(s=><button key={s} onClick={()=>setFilterStatus(s)} style={{padding:"8px 14px",borderRadius:"10px",border:"none",cursor:"pointer",fontSize:"0.62rem",fontWeight:filterStatus===s?"700":"400",background:filterStatus===s?`linear-gradient(135deg,${C.gold},${C.goldDark})`:C.white,color:filterStatus===s?C.white:"#888",fontFamily:"inherit"}}>{s==="all"?"سب":s==="pending"?"باقی":"ادا شدہ"}</button>)}
    </div>

    <div style={S.card}>
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr><th style={S.th}>طالب علم</th><th style={S.th}>جماعت</th><th style={S.th}>قسم</th><th style={S.th}>مہینہ</th><th style={S.th}>رقم</th><th style={S.th}>حال</th><th style={S.th}>عمل</th></tr></thead>
          <tbody>{filtered.map(fee=>{ const st=students.find(s=>s.id===fee.studentId); return <tr key={fee.id}>
            <td style={{...S.td,fontWeight:"700"}}>{st?.name||"—"}</td>
            <td style={S.td}>{st?.grade||"—"}</td>
            <td style={S.td}>{feeTypes[fee.type]||fee.type}</td>
            <td style={{...S.td,fontFamily:"monospace",direction:"ltr",fontSize:"0.6rem"}}>{fee.month||"—"}</td>
            <td style={{...S.td,fontWeight:"700",color:C.navy}}>Rs. {(fee.amount||0).toLocaleString()}</td>
            <td style={S.td}><span style={{padding:"4px 10px",borderRadius:"20px",fontSize:"0.58rem",fontWeight:"700",background:fee.status==="paid"?"#dcfce7":"#fef3c7",color:fee.status==="paid"?C.green:C.amber}}>{fee.status==="paid"?"✅ ادا شدہ":"⏳ باقی"}</span></td>
            <td style={S.td}>{fee.status==="pending"&&<button onClick={()=>markPaid(fee.id)} style={{...S.saveBtn,padding:"5px 12px",fontSize:"0.58rem"}}>ادا ✓</button>}</td>
          </tr>; })}{filtered.length===0&&<tr><td colSpan={7} style={{...S.td,textAlign:"center",color:"#bbb",padding:"40px"}}>کوئی ریکارڈ نہیں ملا</td></tr>}</tbody>
        </table>
      </div>
    </div>
  </div>;
}

// ===================== RESULT / MARKS =====================
function Results({students,addData}){
  const [results,setResults]=useState([]); const [show,setShow]=useState(false);
  const [f,setF]=useState({studentId:"",subject:"",examType:"monthly",totalMarks:100,obtainedMarks:0,examDate:"",grade:""});
  const [filterGrade,setFilterGrade]=useState("all"); const [q,setQ]=useState("");

  useEffect(()=>{
    return onSnapshot(query(collection(db,"results"),orderBy("createdAt","desc"),limit(100)),s=>setResults(s.docs.map(d=>({id:d.id,...d.data()}))));
  },[]);

  const calcGrade=(obtained,total)=>{ const pct=Math.round((obtained/total)*100); if(pct>=90)return "A+"; if(pct>=80)return "A"; if(pct>=70)return "B"; if(pct>=60)return "C"; if(pct>=50)return "D"; return "F"; };
  const calcPct=(obtained,total)=>total>0?Math.round((obtained/total)*100):0;

  const add=async()=>{
    if(!f.studentId||!f.subject)return;
    const pct=calcPct(Number(f.obtainedMarks),Number(f.totalMarks));
    const grade=calcGrade(Number(f.obtainedMarks),Number(f.totalMarks));
    await addData("results",{...f,obtainedMarks:Number(f.obtainedMarks),totalMarks:Number(f.totalMarks),percentage:pct,grade});
    setShow(false); setF({studentId:"",subject:"",examType:"monthly",totalMarks:100,obtainedMarks:0,examDate:"",grade:""});
  };

  const examTypes={monthly:"ماہانہ ٹیسٹ",midterm:"نیم سالانہ",annual:"سالانہ امتحان",quiz:"کوئز",hifz:"حفظ ٹیسٹ"};
  const filtered=results.filter(r=>{ const st=students.find(s=>s.id===r.studentId); const matchQ=!q||st?.name?.includes(q)||r.subject?.includes(q); const matchG=filterGrade==="all"||st?.grade===filterGrade; return matchQ&&matchG; });
  const gradeColor={A:"#15803d","A+":"#15803d",B:C.abuBakr,C:C.amber,D:C.amber,F:C.red};
  const gradeBg={"A+":"#dcfce7",A:"#dcfce7",B:"#dbeafe",C:"#fef3c7",D:"#fef3c7",F:"#fee2e2"};

  const avgPct=results.length>0?Math.round(results.reduce((s,r)=>s+(r.percentage||0),0)/results.length):0;
  const passCount=results.filter(r=>r.percentage>=50).length;

  return <div style={S.page}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
      <div>
        <div style={{fontSize:"1.1rem",fontWeight:"700",color:C.navy}}>📊 نتائج و مارکس</div>
        <div style={{fontSize:"0.62rem",color:"#888",marginTop:"2px"}}>امتحانی نتائج — گریڈ کارڈ</div>
      </div>
      <button style={S.addBtn} onClick={()=>setShow(!show)}>+ نیا نتیجہ</button>
    </div>

    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:"14px",marginBottom:"20px"}}>
      {[
        {c:C.navy,i:"📝",n:results.length,l:"کل امتحانات"},
        {c:C.green,i:"✅",n:passCount,l:"پاس"},
        {c:C.red,i:"❌",n:results.length-passCount,l:"فیل"},
        {c:C.gold,i:"📈",n:`${avgPct}%`,l:"اوسط"}
      ].map((x,i)=><div key={i} style={{background:`linear-gradient(135deg,${x.c}12,${x.c}05)`,borderRadius:"16px",padding:"16px",border:`2px solid ${x.c}20`,textAlign:"center"}}>
        <div style={{fontSize:"1.3rem"}}>{x.i}</div>
        <div style={{fontSize:"1.4rem",fontWeight:"900",color:x.c}}>{x.n}</div>
        <div style={{fontSize:"0.6rem",color:"#888",marginTop:"2px"}}>{x.l}</div>
      </div>)}
    </div>

    {show&&<div style={{...S.card,marginBottom:"20px",background:`linear-gradient(135deg,${C.goldLight},#fdf8ee)`,border:`2px solid ${C.gold}30`}}>
      <div style={{fontSize:"0.85rem",fontWeight:"700",color:C.navy,marginBottom:"16px"}}>📝 نتیجہ درج کریں</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>طالب علم *</label><select style={S.inpSm} value={f.studentId} onChange={e=>setF({...f,studentId:e.target.value})}><option value="">-- منتخب کریں --</option>{students.map(s=><option key={s.id} value={s.id}>{s.name} ({s.grade})</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>مضمون *</label><input style={S.inpSm} value={f.subject} onChange={e=>setF({...f,subject:e.target.value})} placeholder="ریاضی، انگریزی..."/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>امتحان کی قسم</label><select style={S.inpSm} value={f.examType} onChange={e=>setF({...f,examType:e.target.value})}>{Object.entries(examTypes).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>تاریخ</label><input style={{...S.inpSm,direction:"ltr"}} type="date" value={f.examDate} onChange={e=>setF({...f,examDate:e.target.value})}/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>کل مارکس</label><input style={{...S.inpSm,direction:"ltr"}} type="number" value={f.totalMarks} onChange={e=>setF({...f,totalMarks:e.target.value})}/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>حاصل مارکس</label><input style={{...S.inpSm,direction:"ltr"}} type="number" value={f.obtainedMarks} onChange={e=>setF({...f,obtainedMarks:e.target.value})}/></div>
      </div>
      {f.obtainedMarks>0&&<div style={{background:C.white,padding:"12px 16px",borderRadius:"10px",marginBottom:"12px",textAlign:"center",border:`2px solid ${gradeColor[calcGrade(Number(f.obtainedMarks),Number(f.totalMarks))]||C.gold}30`}}>
        <span style={{fontSize:"0.7rem",color:"#888"}}>گریڈ: </span>
        <span style={{fontSize:"1.2rem",fontWeight:"900",color:gradeColor[calcGrade(Number(f.obtainedMarks),Number(f.totalMarks))]||C.gold}}>{calcGrade(Number(f.obtainedMarks),Number(f.totalMarks))}</span>
        <span style={{fontSize:"0.7rem",color:"#888",marginRight:"10px"}}> • {calcPct(Number(f.obtainedMarks),Number(f.totalMarks))}%</span>
      </div>}
      <button style={S.saveBtn} onClick={add}>✅ محفوظ کریں</button>
    </div>}

    <div style={{display:"flex",gap:"10px",marginBottom:"16px",flexWrap:"wrap",alignItems:"center"}}>
      <input style={{...S.inpSm,maxWidth:"200px",direction:"rtl"}} placeholder="🔍 نام یا مضمون..." value={q} onChange={e=>setQ(e.target.value)}/>
      {["all","Grade 6","Grade 7","Grade 8","Grade 9"].map(g=><button key={g} onClick={()=>setFilterGrade(g)} style={{padding:"7px 12px",borderRadius:"10px",border:"none",cursor:"pointer",fontSize:"0.6rem",fontWeight:filterGrade===g?"700":"400",background:filterGrade===g?`linear-gradient(135deg,${C.gold},${C.goldDark})`:C.white,color:filterGrade===g?C.white:"#888",fontFamily:"inherit"}}>{g==="all"?"سب":g}</button>)}
    </div>

    <div style={S.card}>
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr><th style={S.th}>طالب علم</th><th style={S.th}>مضمون</th><th style={S.th}>قسم</th><th style={S.th}>مارکس</th><th style={S.th}>فیصد</th><th style={S.th}>گریڈ</th></tr></thead>
          <tbody>{filtered.map(r=>{ const st=students.find(s=>s.id===r.studentId); const gc=gradeColor[r.grade]||C.gold; return <tr key={r.id}>
            <td style={{...S.td,fontWeight:"700"}}>{st?.name||"—"}</td>
            <td style={S.td}>{r.subject}</td>
            <td style={S.td}><span style={{fontSize:"0.6rem",color:"#888"}}>{examTypes[r.examType]||r.examType}</span></td>
            <td style={{...S.td,fontFamily:"monospace",direction:"ltr"}}>{r.obtainedMarks}/{r.totalMarks}</td>
            <td style={S.td}>
              <div style={{display:"flex",alignItems:"center",gap:"6px"}}>
                <div style={{flex:1,minWidth:"50px"}}>{pBar(r.percentage,100,gc)}</div>
                <span style={{fontSize:"0.62rem",fontWeight:"700",color:gc}}>{r.percentage}%</span>
              </div>
            </td>
            <td style={S.td}><span style={{padding:"4px 10px",borderRadius:"20px",fontSize:"0.65rem",fontWeight:"800",background:gradeBg[r.grade]||"#eee",color:gc}}>{r.grade}</span></td>
          </tr>; })}{filtered.length===0&&<tr><td colSpan={6} style={{...S.td,textAlign:"center",color:"#bbb",padding:"40px"}}>کوئی نتیجہ نہیں</td></tr>}</tbody>
        </table>
      </div>
    </div>
  </div>;
}

// ===================== TIMETABLE =====================
function Timetable(){
  const [selGrade,setSelGrade]=useState("Grade 7");
  const [selDay,setSelDay]=useState("Monday");
  const gradeData=TIMETABLE[selGrade]||{};
  const dayData=gradeData[selDay]||[];

  const periodColors=["#dbeafe","#dcfce7","#fef3c7","#f3f4f6","#fee2e2","#ede9fe","#fce7f3","#ccfbf1"];
  const periodBorder=[C.abuBakr,C.umar,C.amber,"#6b7280",C.red,C.purple,C.teal,"#0d9488"];

  return <div style={S.page}>
    <div style={{fontSize:"1.1rem",fontWeight:"700",color:C.navy,marginBottom:"6px"}}>🗓️ ٹائم ٹیبل</div>
    <div style={{fontSize:"0.62rem",color:"#888",marginBottom:"20px"}}>امین اسلامک انسٹی ٹیوٹ — کلاس شیڈول</div>

    {/* Grade selector */}
    <div style={{display:"flex",gap:"8px",marginBottom:"16px",flexWrap:"wrap"}}>
      {Object.keys(TIMETABLE).map(g=><button key={g} onClick={()=>setSelGrade(g)} style={{padding:"9px 16px",borderRadius:"12px",border:"none",cursor:"pointer",fontSize:"0.68rem",fontWeight:selGrade===g?"700":"400",background:selGrade===g?`linear-gradient(135deg,${C.navy},${C.navyMid})`:C.white,color:selGrade===g?C.white:"#888",fontFamily:"inherit",boxShadow:selGrade===g?"0 4px 12px rgba(0,0,0,0.2)":"none",transition:"all 0.2s"}}>{g}</button>)}
    </div>

    {/* Day selector */}
    <div style={{display:"flex",gap:"8px",marginBottom:"20px",flexWrap:"wrap"}}>
      {DAYS.map(d=><button key={d} onClick={()=>setSelDay(d)} style={{padding:"9px 16px",borderRadius:"12px",border:"none",cursor:"pointer",fontSize:"0.68rem",fontWeight:selDay===d?"700":"400",background:selDay===d?`linear-gradient(135deg,${C.gold},${C.goldDark})`:C.white,color:selDay===d?C.white:"#888",fontFamily:"inherit",transition:"all 0.2s"}}>
        {DAYS_UR[d]} ({d})
      </button>)}
    </div>

    <div style={{...S.card,marginBottom:"20px"}}>
      <div style={{fontSize:"0.85rem",fontWeight:"700",color:C.navy,marginBottom:"16px"}}>
        📅 {selGrade} — {DAYS_UR[selDay]} ({selDay})
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:"12px"}}>
        {dayData.map((period,i)=>{
          const isBreak=period.toLowerCase().includes("break")||period.includes("Break");
          const isQuran=period.toLowerCase().includes("quran")||period.includes("Quran")||period.includes("Hifz");
          return <div key={i} style={{padding:"14px 16px",borderRadius:"14px",background:isBreak?"#f5f5f5":isQuran?`linear-gradient(135deg,${C.goldLight},#fdf8ee)`:periodColors[i%periodColors.length],border:`2px solid ${isBreak?"#ddd":isQuran?C.gold:periodBorder[i%periodBorder.length]}30`,position:"relative"}}>
            <div style={{position:"absolute",top:"8px",left:"10px",fontSize:"0.55rem",fontWeight:"800",color:isBreak?"#aaa":isQuran?C.gold:periodBorder[i%periodBorder.length],fontFamily:"monospace"}}>{i===3?"BREAK":`P${i+1}`}</div>
            <div style={{marginTop:"16px",fontSize:"0.75rem",fontWeight:"700",color:isBreak?"#aaa":C.navy}}>{period}</div>
          </div>;
        })}
      </div>
    </div>

    {/* Full week view */}
    <div style={S.card}>
      <div style={{fontSize:"0.85rem",fontWeight:"700",color:C.navy,marginBottom:"16px"}}>📋 {selGrade} — پورا ہفتہ</div>
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",minWidth:"600px"}}>
          <thead><tr>
            <th style={{...S.th,minWidth:"50px"}}>پیریڈ</th>
            {DAYS.map(d=><th key={d} style={{...S.th,color:d===selDay?C.gold:undefined}}>{DAYS_UR[d]}</th>)}
          </tr></thead>
          <tbody>
            {Array.from({length:Math.max(...DAYS.map(d=>(gradeData[d]||[]).length))}).map((_,pi)=><tr key={pi} style={{background:pi===3?"#fafafa":undefined}}>
              <td style={{...S.td,fontWeight:"700",color:C.gold,fontSize:"0.6rem",fontFamily:"monospace"}}>{pi===3?"☕":pi+1}</td>
              {DAYS.map(d=>{
                const p=(gradeData[d]||[])[pi]||"—";
                const isBreak=p.toLowerCase().includes("break");
                return <td key={d} style={{...S.td,fontSize:"0.6rem",fontWeight:isBreak?"400":"600",color:isBreak?"#aaa":C.navy,background:d===selDay?"#fffdf8":undefined}}>{p}</td>;
              })}
            </tr>)}
          </tbody>
        </table>
      </div>
    </div>
  </div>;
}

// ===================== NOTIFICATIONS =====================
function Notifications({students,addData}){
  const [notifs,setNotifs]=useState([]); const [show,setShow]=useState(false);
  const [f,setF]=useState({title:"",message:"",type:"general",targetHouse:"all",targetGrade:"all",priority:"normal"});

  useEffect(()=>{
    return onSnapshot(query(collection(db,"notifications"),orderBy("createdAt","desc"),limit(30)),s=>setNotifs(s.docs.map(d=>({id:d.id,...d.data()}))));
  },[]);

  const send=async()=>{ if(!f.title||!f.message)return; await addData("notifications",{...f,sentAt:new Date().toISOString()}); setShow(false); setF({title:"",message:"",type:"general",targetHouse:"all",targetGrade:"all",priority:"normal"}); };

  const notifTypes={general:"📢 عام اطلاع",fee:"💰 فیس یاددہانی",exam:"📝 امتحان",event:"🎭 تقریب",result:"📊 نتیجہ",hifz:"📖 حفظ",attendance:"✅ حاضری"};
  const priorityC={urgent:C.red,high:C.amber,normal:C.abuBakr,low:"#888"};
  const priorityBg={urgent:"#fee2e2",high:"#fef3c7",normal:"#dbeafe",low:"#f3f4f6"};

  return <div style={S.page}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
      <div>
        <div style={{fontSize:"1.1rem",fontWeight:"700",color:C.navy}}>📱 اطلاعات</div>
        <div style={{fontSize:"0.62rem",color:"#888",marginTop:"2px"}}>والدین اور طلبا کو پیغامات</div>
      </div>
      <button style={S.addBtn} onClick={()=>setShow(!show)}>+ نئی اطلاع</button>
    </div>

    {show&&<div style={{...S.card,marginBottom:"20px",background:`linear-gradient(135deg,${C.goldLight},#fdf8ee)`,border:`2px solid ${C.gold}30`}}>
      <div style={{fontSize:"0.85rem",fontWeight:"700",color:C.navy,marginBottom:"16px"}}>📢 نئی اطلاع بھیجیں</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div style={{gridColumn:"1/-1"}}><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>عنوان *</label><input style={S.inpSm} value={f.title} onChange={e=>setF({...f,title:e.target.value})} placeholder="اطلاع کا عنوان..."/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>قسم</label><select style={S.inpSm} value={f.type} onChange={e=>setF({...f,type:e.target.value})}>{Object.entries(notifTypes).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>ترجیح</label><select style={S.inpSm} value={f.priority} onChange={e=>setF({...f,priority:e.target.value})}><option value="normal">عام</option><option value="high">اہم</option><option value="urgent">فوری</option><option value="low">کم</option></select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>ہاؤس</label><select style={S.inpSm} value={f.targetHouse} onChange={e=>setF({...f,targetHouse:e.target.value})}><option value="all">سب ہاؤسز</option>{HOUSES.map(h=><option key={h.id} value={h.id}>{h.emoji} {h.nameEn}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>جماعت</label><select style={S.inpSm} value={f.targetGrade} onChange={e=>setF({...f,targetGrade:e.target.value})}><option value="all">سب جماعتیں</option>{["Grade 6","Grade 7","Grade 8","Grade 9","Grade 10"].map(g=><option key={g}>{g}</option>)}</select></div>
        <div style={{gridColumn:"1/-1"}}><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>پیغام *</label><textarea style={{...S.inpSm,minHeight:"80px",resize:"vertical"}} value={f.message} onChange={e=>setF({...f,message:e.target.value})} placeholder="پیغام یہاں لکھیں..."/></div>
      </div>
      <button style={S.saveBtn} onClick={send}>📤 بھیجیں</button>
    </div>}

    <div style={{display:"flex",flexDirection:"column",gap:"14px"}}>
      {notifs.map(n=>{ const pc=priorityC[n.priority]||C.abuBakr; const pb=priorityBg[n.priority]||"#dbeafe"; return <div key={n.id} style={{...S.card,borderRight:`4px solid ${pc}`,padding:"18px 20px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"8px"}}>
          <div style={{flex:1}}>
            <div style={{fontSize:"0.85rem",fontWeight:"700",color:C.navy}}>{notifTypes[n.type]||"📢"} {n.title}</div>
            <div style={{fontSize:"0.68rem",color:"#666",marginTop:"6px",lineHeight:"1.6"}}>{n.message}</div>
          </div>
          <span style={{padding:"4px 10px",borderRadius:"20px",fontSize:"0.55rem",fontWeight:"700",background:pb,color:pc,marginRight:"10px",flexShrink:0}}>{n.priority==="urgent"?"فوری":n.priority==="high"?"اہم":n.priority==="low"?"کم":"عام"}</span>
        </div>
        <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
          {n.targetHouse!=="all"&&<span style={hBadge(C.navy,C.abuBakrLight)}>{HOUSES.find(h=>h.id===n.targetHouse)?.emoji} {HOUSES.find(h=>h.id===n.targetHouse)?.nameEn}</span>}
          {n.targetHouse==="all"&&<span style={hBadge(C.gold,C.goldLight)}>سب ہاؤسز</span>}
          {n.targetGrade!=="all"&&<span style={hBadge(C.purple,"#ede9fe")}>{n.targetGrade}</span>}
          <span style={{fontSize:"0.55rem",color:"#aaa",marginTop:"2px"}}>{n.sentAt?.slice(0,10)||""}</span>
        </div>
      </div>; })}
      {notifs.length===0&&<div style={{...S.card,textAlign:"center",color:"#bbb",padding:"60px"}}>ابھی کوئی اطلاع نہیں — اوپر سے بھیجیں!</div>}
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
      <div>
        <div style={{fontSize:"1.1rem",fontWeight:"700",color:C.navy}}>🎭 ایونٹس و مقابلے</div>
        <div style={{fontSize:"0.62rem",color:"#888",marginTop:"2px"}}>سرگرمیاں — HVS Activities (60 مارکس)</div>
      </div>
      <button style={S.addBtn} onClick={()=>setShow(!show)}>+ نیا ایونٹ</button>
    </div>
    {show&&<div style={{...S.card,marginBottom:"20px",background:`linear-gradient(135deg,${C.goldLight},#fdf8ee)`}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>ایونٹ کا نام</label><input style={S.inpSm} value={f.name} onChange={e=>setF({...f,name:e.target.value})} placeholder="نعت مقابلہ، کوئز..."/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>قسم</label><select style={S.inpSm} value={f.type} onChange={e=>setF({...f,type:e.target.value})}>{Object.entries(evTypes).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>فاتح ہاؤس</label><select style={S.inpSm} value={f.houseId} onChange={e=>setF({...f,houseId:e.target.value})}>{HOUSES.map(h=><option key={h.id} value={h.id}>{h.emoji} {h.nameEn}</option>)}</select></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>پوائنٹس</label><input style={{...S.inpSm,direction:"ltr"}} type="number" value={f.points} onChange={e=>setF({...f,points:e.target.value})}/></div>
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>مہینہ</label><select style={S.inpSm} value={f.month} onChange={e=>setF({...f,month:Number(e.target.value)})}>{MONTHS.map((m,i)=><option key={i} value={i+1}>{m}</option>)}</select></div>
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
        <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
          <span style={hBadge(h.color,h.light)}>{h.emoji} {h.nameEn}</span>
          <span style={hBadge(C.navy,C.abuBakrLight)}>{evTypes[ev.type]||ev.type}</span>
          {ev.month&&<span style={hBadge(C.gold,C.goldLight)}>Month {ev.month}</span>}
        </div>
        {ev.notes&&<div style={{fontSize:"0.6rem",color:"#888",marginTop:"8px"}}>{ev.notes}</div>}
      </div>; })}
      {events.length===0&&<div style={{...S.card,textAlign:"center",color:"#bbb",padding:"60px"}}>ابھی کوئی ایونٹ نہیں</div>}
    </div>
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
    {id:"dashboard",label:"📊 ڈیش بورڈ"},
    {id:"hvs",label:"🏅 HVS"},
    {id:"students",label:"🎓 طلبا"},
    {id:"teachers",label:"👨‍🏫 اساتذہ"},
    {id:"hifz",label:"📖 حفظ"},
    {id:"houses",label:"🏠 ہاؤس"},
    {id:"timetable",label:"🗓️ ٹائم ٹیبل"},
    {id:"fees",label:"💰 فیس"},
    {id:"results",label:"📊 نتائج"},
    {id:"events",label:"🎭 ایونٹس"},
    {id:"attendance",label:"✅ حاضری"},
    {id:"notifications",label:"📱 اطلاعات"}
  ];

  const uName=DEMO.find(d=>d.email===user?.email)?.name||user?.email||"";
  const uRole=DEMO.find(d=>d.email===user?.email)?.role||"teacher";
  const pendingFeesCount=fees.filter(f=>f.status==="pending").length;

  if(loading)return <div style={{...S.lp,color:C.white,fontSize:"1rem",flexDirection:"column",gap:"16px"}}><div style={{fontSize:"2rem"}}>☪</div>لوڈ ہو رہا ہے... ⏳</div>;
  if(!user)return <Login onLogin={login} err={err} loading={lLoading}/>;

  return <div style={S.app}>
    <div style={S.hdr}>
      <div style={{display:"flex",alignItems:"center",gap:"14px"}}>
        <div style={{...S.seal,width:"44px",height:"44px",margin:0}}><span style={{fontSize:"1.1rem"}}>☪</span></div>
        <div>
          <div style={{color:C.gold,fontSize:"1rem",fontWeight:"800"}}>امین اسکول ہب</div>
          <div style={{color:"rgba(255,255,255,0.4)",fontSize:"0.5rem",fontFamily:"'Cinzel',serif",letterSpacing:"0.1em"}}>AMEEN ISLAMIC INSTITUTE • SWAT</div>
        </div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:"14px"}}>
        {pendingFeesCount>0&&<div style={{background:C.amber+"20",border:`1px solid ${C.amber}`,borderRadius:"20px",padding:"4px 12px",fontSize:"0.58rem",color:C.amber,fontWeight:"700"}}>💰 {pendingFeesCount} فیس باقی</div>}
        <div style={{textAlign:"left",direction:"ltr"}}>
          <div style={{color:C.gold,fontSize:"0.68rem",fontWeight:"600"}}>{uName}</div>
          <div style={{color:"rgba(255,255,255,0.4)",fontSize:"0.55rem"}}>{uRole}</div>
        </div>
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
    </div>
  </div>;
}