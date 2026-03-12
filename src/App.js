import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, collection, getDocs, addDoc as fbAddDoc, doc, setDoc, updateDoc, onSnapshot, serverTimestamp, query, orderBy, limit, where } from "firebase/firestore";

const firebaseConfig = { apiKey: "AIzaSyAfGiUY0NlV1t2O99aaSvnqESrGBzr9PnE", authDomain: "ameen-school-hub.firebaseapp.com", projectId: "ameen-school-hub", storageBucket: "ameen-school-hub.firebasestorage.app", messagingSenderId: "793128969005", appId: "1:793128969005:web:12483cc66233eb7cdbe9a4" };
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const C = { gold:"#b7860b", goldLight:"#f5e9c8", goldDark:"#7a5807", goldGlow:"rgba(183,134,11,0.3)", navy:"#1e293b", navyDark:"#0f172a", navyMid:"#1e3a5f", bg:"#f0ede8", white:"#ffffff", red:"#dc2626", green:"#16a34a", amber:"#d97706", abuBakr:"#1e40af", umar:"#166534", uthman:"#854d0e", ali:"#991b1b", abuBakrLight:"#dbeafe", umarLight:"#dcfce7", uthmanLight:"#fef3c7", aliLight:"#fee2e2" };

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
  { name:"احمد علی", fatherName:"علی احمد", grade:"Grade 7", section:"Orchid", houseId:"abuBakr", studentCode:"AII-2026-001", canteenBalance:150, talent:"تقریر" },
  { name:"محمد عمر", fatherName:"عمر محمود", grade:"Grade 8", section:"Lily", houseId:"umar", studentCode:"AII-2026-002", canteenBalance:200, talent:"کرکٹ" },
  { name:"عبداللہ", fatherName:"رحیم بخش", grade:"Grade 7", section:"Jasmine", houseId:"uthman", studentCode:"AII-2026-003", canteenBalance:80, talent:"نعت خوانی" },
  { name:"یوسف خان", fatherName:"خان محمد", grade:"Grade 9", section:"Rose", houseId:"ali", studentCode:"AII-2026-004", canteenBalance:320, talent:"کوئز" },
  { name:"حمزہ راشد", fatherName:"راشد علی", grade:"Grade 6", section:"Orchid", houseId:"abuBakr", studentCode:"AII-2026-005", canteenBalance:95, talent:"فٹ بال" },
  { name:"زید احمد", fatherName:"احمد بخش", grade:"Grade 8", section:"Lily", houseId:"umar", studentCode:"AII-2026-006", canteenBalance:175, talent:"خطاطی" },
  { name:"سعد خان", fatherName:"خان صاحب", grade:"Grade 7", section:"Rose", houseId:"uthman", studentCode:"AII-2026-007", canteenBalance:120, talent:"تلاوت" },
  { name:"عمران علی", fatherName:"علی جان", grade:"Grade 9", section:"Jasmine", houseId:"ali", studentCode:"AII-2026-008", canteenBalance:260, talent:"ریاضی" }
];

const SEED_T = [
  { name:"سر ابراہیم قریشی", subject:"Quran/Hifz", grade:"All Grades", employeeCode:"TCH-001", houseId:"abuBakr" },
  { name:"سر عمر شیخ", subject:"Mathematics", grade:"Grade 8", employeeCode:"TCH-002", houseId:"umar" },
  { name:"سر فاطمہ حسن", subject:"Islamic Studies", grade:"Grade 7", employeeCode:"TCH-003", houseId:"uthman" },
  { name:"سر عائشہ ملک", subject:"English", grade:"Grade 6", employeeCode:"TCH-004", houseId:"ali" }
];

const MONTHS = ["Month 1: نظم و ضبط","Month 2: صفائی و پاکیزگی","Month 3: سیرت و اخلاق","Month 4: تعلیمی معیار","Month 5: سماجی خدمت","Month 6: قیادت","Month 7: کھیل اور صحت","Month 8: تخلیقی صلاحیت","Month 9: بزنس ہاؤس","Month 10: روحانیت","Month 11: تکمیل و جائزہ","Month 12: جشنِ کامیابی"];

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
  inpSm:{padding:"10px 14px",border:`2px solid ${C.goldLight}`,borderRadius:"10px",fontSize:"0.72rem",outline:"none",fontFamily:"inherit",background:"#fffdf8",width:"100%",boxSizing:"border-box"},
  th:{padding:"14px 12px",textAlign:"right",fontSize:"0.62rem",color:"#999",borderBottom:`2px solid ${C.goldLight}`,fontWeight:"700",letterSpacing:"0.02em"},
  td:{padding:"12px",fontSize:"0.68rem",borderBottom:`1px solid rgba(245,233,200,0.4)`,color:C.navy}
};

function hBadge(color,light){ return {display:"inline-block",padding:"4px 12px",borderRadius:"20px",background:light||color+"15",color:color,fontSize:"0.58rem",fontWeight:"700",border:`1px solid ${color}30`}; }
function pBar(val,max,color){ const pct=Math.min(100,Math.round((val/max)*100)); return <div style={{height:"6px",background:"#eee",borderRadius:"3px",overflow:"hidden",marginTop:"4px"}}><div style={{width:`${pct}%`,height:"100%",background:color,borderRadius:"3px",transition:"width 0.5s ease"}}/></div>; }

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

function Dashboard({students,teachers,houses,hvsLogs}){
  const sorted=[...houses].sort((a,b)=>(b.points||0)-(a.points||0));
  const max=Math.max(...houses.map(h=>h.points||0),1);
  const leader=sorted[0]; const lInfo=HOUSES.find(x=>x.id===leader?.id);
  const thisWeek=hvsLogs.filter(l=>{ const d=l.createdAt?.toDate?.(); if(!d)return false; const now=new Date(); const diff=(now-d)/(1000*60*60*24); return diff<7; });
  const houseTotals={};
  thisWeek.forEach(l=>{ houseTotals[l.houseId]=(houseTotals[l.houseId]||0)+(l.total||0); });
  return <div style={S.page}>
    <div style={{fontSize:"1.1rem",fontWeight:"700",color:C.navy,marginBottom:"24px"}}>📊 ڈیش بورڈ — امین اسلامک انسٹی ٹیوٹ</div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:"16px",marginBottom:"28px"}}>
      {[
        {c:C.abuBakr,i:"🎓",n:students.length,l:"کل طلبا"},
        {c:C.umar,i:"👨‍🏫",n:teachers.length,l:"کل اساتذہ"},
        {c:C.gold,i:"🏠",n:4,l:"ہاؤسز"},
        {c:lInfo?.color||C.gold,i:"👑",n:lInfo?.nameEn||"—",l:"سپر ہاؤس"}
      ].map((x,i)=><div key={i} style={{background:`linear-gradient(135deg,${x.c}12,${x.c}05)`,borderRadius:"18px",padding:"22px",border:`2px solid ${x.c}25`,textAlign:"center"}}>
        <div style={{fontSize:"1.6rem"}}>{x.i}</div>
        <div style={{fontSize:"2rem",fontWeight:"900",color:x.c,marginTop:"4px"}}>{x.n}</div>
        <div style={{fontSize:"0.65rem",color:"#888",marginTop:"4px"}}>{x.l}</div>
      </div>)}
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"20px",marginBottom:"24px"}}>
      <div style={S.card}>
        <div style={{fontSize:"0.85rem",fontWeight:"700",color:C.navy,marginBottom:"20px"}}>🏆 ہاؤس لیڈر بورڈ (کل پوائنٹس)</div>
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
        <div style={{fontSize:"0.85rem",fontWeight:"700",color:C.navy,marginBottom:"20px"}}>📈 اس ہفتے HVS اسکور (160 مارکس)</div>
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
        <div style={{fontSize:"0.6rem",color:"#aaa",marginTop:"8px",textAlign:"center"}}>HVS = 160 Marks Weekly System</div>
      </div>
    </div>
    <div style={S.card}>
      <div style={{fontSize:"0.85rem",fontWeight:"700",color:C.navy,marginBottom:"16px"}}>🏠 ہاؤس کارڈز — خصوصیات</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:"16px"}}>
        {HOUSES.map((h,i)=>{ const hd=sorted.find(x=>x.id===h.id)||{}; return <div key={h.id} style={{background:h.gradient,borderRadius:"18px",padding:"20px",color:C.white,position:"relative",overflow:"hidden"}}>
          {i===0&&sorted[0]?.id===h.id&&<div style={{position:"absolute",top:"10px",left:"12px",fontSize:"1.4rem"}}>👑</div>}
          <div style={{fontSize:"2rem",marginBottom:"6px"}}>{h.emoji}</div>
          <div style={{fontSize:"0.9rem",fontWeight:"800",marginBottom:"2px"}}>{h.nameEn} House</div>
          <div style={{fontSize:"0.65rem",opacity:0.85,marginBottom:"12px",lineHeight:"1.6"}}>{h.slogan}</div>
          <div style={{fontSize:"2rem",fontWeight:"900",opacity:0.9}}>{hd.points||0}</div>
          <div style={{fontSize:"0.6rem",opacity:0.7}}>کل پوائنٹس</div>
        </div>; })}
      </div>
    </div>
  </div>;
}

function HVSEntry({students,houses,addData,updateHousePoints}){
  const [show,setShow]=useState(false);
  const [houseId,setHouseId]=useState("abuBakr");
  const [week,setWeek]=useState(new Date().toISOString().split("T")[0]);
  const [scores,setScores]=useState({});
  const [logs,setLogs]=useState([]);
  const [saving,setSaving]=useState(false);
  useEffect(()=>{
    const q2=query(collection(db,"hvs_logs"),orderBy("createdAt","desc"),limit(30));
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
  return <div style={S.page}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"24px"}}>
      <div>
        <div style={{fontSize:"1.1rem",fontWeight:"700",color:C.navy}}>📊 HVS اسکورنگ سسٹم</div>
        <div style={{fontSize:"0.65rem",color:"#888",marginTop:"2px"}}>ہاؤس ویلیو اسکور — 160 مارکس فریم ورک</div>
      </div>
      <button style={S.addBtn} onClick={()=>setShow(!show)}>+ نیا HVS اسکور</button>
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
          </tr></thead>
          <tbody>{logs.map(l=>{ const info=HOUSES.find(x=>x.id===l.houseId)||{}; return <tr key={l.id}>
            <td style={S.td}><span style={hBadge(info.color,info.light)}>{info.emoji} {info.nameEn}</span></td>
            <td style={{...S.td,fontFamily:"monospace",direction:"ltr",fontSize:"0.6rem"}}>{l.week}</td>
            {HVS_CATS.slice(0,4).map(c=><td key={c.id} style={S.td}>{l.scores?.[c.id]||0}/{c.max}</td>)}
            <td style={{...S.td,fontWeight:"800",color:l.total>=120?C.green:l.total>=80?C.gold:C.red}}>{l.total||0}/{HVS_TOTAL}</td>
          </tr>; })}{logs.length===0&&<tr><td colSpan={7} style={{...S.td,textAlign:"center",color:"#bbb",padding:"40px"}}>ابھی تک کوئی HVS لاگ نہیں — اوپر + بٹن سے شروع کریں!</td></tr>}</tbody>
        </table>
      </div>
    </div>
    <div style={{...S.card,marginTop:"20px"}}>
      <div style={{fontSize:"0.85rem",fontWeight:"700",color:C.navy,marginBottom:"16px"}}>📖 HVS ریٹنگ گائیڈ</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:"12px",marginBottom:"16px"}}>
        {RATING.map(r=><div key={r.val} style={{background:r.bg,borderRadius:"12px",padding:"14px",border:`1px solid ${r.color}30`}}>
          <div style={{fontSize:"1.2rem",fontWeight:"900",color:r.color}}>{r.val}</div>
          <div style={{fontSize:"0.7rem",fontWeight:"700",color:r.color}}>{r.label} ({r.labelEn})</div>
          <div style={{fontSize:"0.6rem",color:"#888",marginTop:"4px"}}>{r.pct}% — {r.val===4?"مثالی کارکردگی":r.val===3?"اچھی لیکن بہتری ممکن":r.val===2?"اوسط، محنت ضروری":"فوری اصلاح درکار"}</div>
        </div>)}
      </div>
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

function Students({students,addData}){
  const [show,setShow]=useState(false);
  const [f,setF]=useState({name:"",fatherName:"",grade:"Grade 7",houseId:"abuBakr",studentCode:"",section:"Orchid",canteenBalance:100,talent:""});
  const [q,setQ]=useState("");
  const filtered=students.filter(s=>s.name?.includes(q)||s.studentCode?.includes(q)||s.houseId?.includes(q));
  const add=async()=>{ if(!f.name)return; await addData("students",{...f,enrollmentStatus:"active"}); setShow(false); setF({name:"",fatherName:"",grade:"Grade 7",houseId:"abuBakr",studentCode:"",section:"Orchid",canteenBalance:100,talent:""}); };
  const houseStudents=(hid)=>students.filter(s=>s.houseId===hid).length;
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
        <div><label style={{fontSize:"0.62rem",color:"#888",marginBottom:"4px",display:"block"}}>ہنر (Talent)</label><input style={S.inpSm} value={f.talent} onChange={e=>setF({...f,talent:e.target.value})} placeholder="تقریر، نعت، کرکٹ..."/></div>
      </div>
      <button style={S.saveBtn} onClick={add}>✅ محفوظ کریں</button>
    </div>}
    <div style={{marginBottom:"16px"}}><input style={{...S.inpSm,direction:"rtl"}} placeholder="🔍 تلاش — نام، کوڈ، ہاؤس..." value={q} onChange={e=>setQ(e.target.value)}/></div>
    <div style={S.card}>
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr><th style={S.th}>نام</th><th style={S.th}>والد</th><th style={S.th}>کوڈ</th><th style={S.th}>جماعت</th><th style={S.th}>ہاؤس</th><th style={S.th}>ہنر</th><th style={S.th}>بیلنس</th></tr></thead>
          <tbody>{filtered.map(s=>{ const h=HOUSES.find(x=>x.id===s.houseId); return <tr key={s.id} style={{"&:hover":{background:"#fafaf8"}}}>
            <td style={{...S.td,fontWeight:"700"}}>{s.name}</td>
            <td style={S.td}>{s.fatherName}</td>
            <td style={{...S.td,fontFamily:"monospace",direction:"ltr",fontSize:"0.6rem",color:C.gold}}>{s.studentCode}</td>
            <td style={S.td}>{s.grade}</td>
            <td style={S.td}>{h&&<span style={hBadge(h.color,h.light)}>{h.emoji} {h.nameEn}</span>}</td>
            <td style={S.td}><span style={{fontSize:"0.62rem",color:C.navy}}>{s.talent||"—"}</span></td>
            <td style={{...S.td,fontWeight:"700",color:(s.canteenBalance||0)<50?C.red:C.green}}>AED {s.canteenBalance||0}</td>
          </tr>; })}{filtered.length===0&&<tr><td colSpan={7} style={{...S.td,textAlign:"center",color:"#bbb",padding:"40px"}}>کوئی طالب علم نہیں ملا</td></tr>}</tbody>
        </table>
      </div>
    </div>
  </div>;
}

function Teachers({teachers,addData}){
  const [show,setShow]=useState(false);
  const [f,setF]=useState({name:"",subject:"",grade:"Grade 7",employeeCode:"",houseId:"abuBakr"});
  const add=async()=>{ if(!f.name)return; await addData("teachers",{...f,isActive:true}); setShow(false); setF({name:"",subject:"",grade:"Grade 7",employeeCode:"",houseId:"abuBakr"}); };
  return <div style={S.page}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"20px"}}>
      <div style={{fontSize:"1.1rem",fontWeight:"700",color:C.navy}}>👨‍🏫 اساتذہ و ہاؤس ماسٹرز ({teachers.length})</div>
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
        <div style={{fontSize:"0.62rem",color:"#888",marginTop:"2px"}}>روزانہ حفظ کی کارکردگی — خودکار ہاؤس پوائنٹس</div>
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
      <div style={{fontSize:"0.7rem",color:C.goldDark,marginBottom:"12px",background:C.white,padding:"10px 14px",borderRadius:"10px",border:`1px solid ${C.goldLight}`}}>🏆 خودکار پوائنٹس: <strong>{f.performanceRating==="EXCELLENT"?"+10 pts ممتاز!":f.performanceRating==="GOOD"?"+5 pts اچھا":f.performanceRating==="AVERAGE"?"0 pts":"-2 pts کمزور"}</strong></div>
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

function Houses({houses,hvsLogs,students}){
  const sorted=[...houses].sort((a,b)=>(b.points||0)-(a.points||0));
  const max=Math.max(...sorted.map(h=>h.points||0),1);
  const allLogs=hvsLogs;
  const [selMonth,setSelMonth]=useState(0);
  const catTotals=(hid)=>{ const hLogs=allLogs.filter(l=>l.houseId===hid); const totals={}; HVS_CATS.forEach(c=>{ totals[c.id]=hLogs.reduce((s,l)=>s+(l.scores?.[c.id]||0),0); }); return totals; };
  const hStudents=(hid)=>students.filter(s=>s.houseId===hid);
  return <div style={S.page}>
    <div style={{fontSize:"1.1rem",fontWeight:"700",color:C.navy,marginBottom:"24px"}}>🏠 ہاؤس سسٹم — امین اسلامک انسٹی ٹیوٹ</div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:"20px",marginBottom:"28px"}}>
      {sorted.map((h,i)=>{ const info=HOUSES.find(x=>x.id===h.id)||{}; const totals=catTotals(h.id); const studs=hStudents(h.id);
        return <div key={h.id} style={{background:info.gradient,borderRadius:"22px",padding:"24px",color:C.white,position:"relative",overflow:"hidden",boxShadow:`0 8px 32px ${info.color||C.navy}40`}}>
          <div style={{position:"absolute",top:0,right:0,bottom:0,left:0,backgroundImage:"radial-gradient(circle at 80% 20%, rgba(255,255,255,0.08) 0%, transparent 60%)"}}/>
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
          <div style={{display:"flex",gap:"8px",fontSize:"0.6rem",opacity:0.85}}>
            <span>👥 {studs.length} طلبا</span>
            <span>📊 {allLogs.filter(l=>l.houseId===h.id).length} HVS لاگ</span>
          </div>
        </div>; })}
    </div>
    <div style={S.card}>
      <div style={{fontSize:"0.85rem",fontWeight:"700",color:C.navy,marginBottom:"20px"}}>📊 HVS کیٹیگری وار تجزیہ (کل)</div>
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr>
            <th style={S.th}>کیٹیگری</th>
            {HOUSES.map(h=><th key={h.id} style={{...S.th,color:h.color}}>{h.emoji} {h.nameEn}</th>)}
          </tr></thead>
          <tbody>{HVS_CATS.map(cat=><tr key={cat.id}>
            <td style={{...S.td,fontWeight:"600"}}>{cat.icon} {cat.label} <span style={{fontSize:"0.55rem",color:"#aaa"}}>/{cat.max}</span></td>
            {HOUSES.map(h=>{ const ct=catTotals(h.id); const val=ct[cat.id]||0; return <td key={h.id} style={{...S.td,fontWeight:"700",color:h.color,textAlign:"center"}}>{val}</td>; })}
          </tr>)}</tbody>
        </table>
      </div>
    </div>
    <div style={{...S.card,marginTop:"20px"}}>
      <div style={{fontSize:"0.85rem",fontWeight:"700",color:C.navy,marginBottom:"16px"}}>📅 سالانہ کیلنڈر — تھیم بیسڈ پلاننگ</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:"10px"}}>
        {MONTHS.map((m,i)=><div key={i} style={{padding:"12px 14px",borderRadius:"12px",background:i===selMonth?`linear-gradient(135deg,${C.gold},${C.goldDark})`:"#fafaf8",color:i===selMonth?C.white:C.navy,cursor:"pointer",border:`1px solid ${i===selMonth?C.gold:C.goldLight}`,fontSize:"0.62rem",fontWeight:i===selMonth?"700":"400",transition:"all 0.2s"}} onClick={()=>setSelMonth(i)}>
          {m}
        </div>)}
      </div>
    </div>
  </div>;
}

function Attendance({students,addData}){
  const [att,setAtt]=useState({}); const [saved,setSaved]=useState(false);
  const today=new Date().toISOString().split("T")[0];
  const markAll=s=>{ const a={}; students.forEach(x=>{a[x.id]=s;}); setAtt(a); };
  const save=async()=>{ for(const[sid,status] of Object.entries(att)) await addData("attendance",{studentId:sid,status,date:today}); setSaved(true); setTimeout(()=>setSaved(false),3000); };
  const counts={present:Object.values(att).filter(x=>x==="present").length,absent:Object.values(att).filter(x=>x==="absent").length,late:Object.values(att).filter(x=>x==="late").length};
  return <div style={S.page}>
    <div style={{fontSize:"1.1rem",fontWeight:"700",color:C.navy,marginBottom:"8px"}}>✅ حاضری</div>
    <div style={{fontSize:"0.65rem",color:"#888",marginBottom:"20px",direction:"ltr"}}>{today}</div>
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
        </tr>; })}{students.length===0&&<tr><td colSpan={4} style={{...S.td,textAlign:"center",color:"#bbb",padding:"40px"}}>طلبا موجود نہیں</td></tr>}</tbody>
      </table>
    </div>
  </div>;
}

function Events({addData,houses}){
  const [events,setEvents]=useState([]); const [show,setShow]=useState(false);
  const [f,setF]=useState({name:"",type:"competition",houseId:"abuBakr",points:0,month:1,notes:""});
  useEffect(()=>{ return onSnapshot(query(collection(db,"events"),orderBy("createdAt","desc"),limit(20)),s=>setEvents(s.docs.map(d=>({id:d.id,...d.data()})))); },[]);
  const add=async()=>{ if(!f.name)return; await addData("events",{...f,points:Number(f.points)}); setShow(false); setF({name:"",type:"competition",houseId:"abuBakr",points:0,month:1,notes:""}); };
  const evTypes={"competition":"🏆 مقابلہ","sports":"⚽ کھیل","academic":"📚 تعلیمی","cultural":"🎭 ثقافتی","service":"🌱 سماجی"};
  return <div style={S.page}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"24px"}}>
      <div>
        <div style={{fontSize:"1.1rem",fontWeight:"700",color:C.navy}}>🎭 ایونٹس و مقابلے</div>
        <div style={{fontSize:"0.62rem",color:"#888",marginTop:"2px"}}>سرگرمیاں — 60 مارکس (HVS Activities)</div>
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
      {events.length===0&&<div style={{...S.card,textAlign:"center",color:"#bbb",padding:"60px"}}>ابھی کوئی ایونٹ نہیں — اوپر سے شروع کریں!</div>}
    </div>
  </div>;
}

export default function App(){
  const [user,setUser]=useState(null); const [loading,setLoading]=useState(true);
  const [err,setErr]=useState(""); const [lLoading,setLL]=useState(false);
  const [page,setPage]=useState("dashboard");
  const [students,setStudents]=useState([]); const [teachers,setTeachers]=useState([]);
  const [houses,setHouses]=useState([]); const [hvs,setHvs]=useState([]);

  useEffect(()=>{ return onAuthStateChanged(auth,async u=>{ setUser(u); setLoading(false); if(u){ await seedDB(); } }); },[]);
  useEffect(()=>{ if(!user)return;
    const s1=onSnapshot(collection(db,"students"),s=>setStudents(s.docs.map(d=>({id:d.id,...d.data()}))));
    const s2=onSnapshot(collection(db,"teachers"),s=>setTeachers(s.docs.map(d=>({id:d.id,...d.data()}))));
    const s3=onSnapshot(collection(db,"houses"),s=>setHouses(s.docs.map(d=>({id:d.id,...d.data()}))));
    const s4=onSnapshot(query(collection(db,"hvs_logs"),orderBy("createdAt","desc"),limit(50)),s=>setHvs(s.docs.map(d=>({id:d.id,...d.data()}))));
    return()=>{s1();s2();s3();s4();};
  },[user]);

  const login=async(email,pass)=>{ setLL(true); setErr(""); try{ try{ await signInWithEmailAndPassword(auth,email,pass); }catch{ await createUserWithEmailAndPassword(auth,email,pass); } }catch(e){ setErr("غلط ای میل یا پاس ورڈ"); } setLL(false); };
  const logout=()=>signOut(auth);
  const addData=async(col,data)=>{ try{ await fbAddDoc(collection(db,col),{...data,createdAt:serverTimestamp()}); }catch(e){ console.error("addData:",e.message); } };
  const updateHousePoints=async(houseId,pts)=>{ try{ const ref=doc(db,"houses",houseId); const hd=houses.find(h=>h.id===houseId); await setDoc(ref,{id:houseId,points:(hd?.points||0)+pts,hvs_total:(hd?.hvs_total||0)+pts,hvs_weeks:(hd?.hvs_weeks||0)+1,updatedAt:serverTimestamp()},{merge:true}); }catch(e){ console.error("updatePts:",e.message); } };

  const PAGES=[
    {id:"dashboard",label:"📊 ڈیش بورڈ"},
    {id:"hvs",label:"🏅 HVS اسکور"},
    {id:"students",label:"🎓 طلبا"},
    {id:"teachers",label:"👨‍🏫 اساتذہ"},
    {id:"hifz",label:"📖 حفظ"},
    {id:"houses",label:"🏠 ہاؤس"},
    {id:"events",label:"🎭 ایونٹس"},
    {id:"attendance",label:"✅ حاضری"}
  ];

  const uName=DEMO.find(d=>d.email===user?.email)?.name||user?.email||"";
  const uRole=DEMO.find(d=>d.email===user?.email)?.role||"teacher";

  if(loading)return <div style={{...S.lp,color:C.white,fontSize:"1rem",flexDirection:"column",gap:"16px"}}><div style={{fontSize:"2rem"}}>☪</div>لوڈ ہو رہا ہے... ⏳</div>;
  if(!user)return <Login onLogin={login} err={err} loading={lLoading}/>;

  return <div style={S.app}>
    <div style={S.hdr}>
      <div style={{display:"flex",alignItems:"center",gap:"14px"}}>
        <div style={{...S.seal,width:"44px",height:"44px",margin:0}}><span style={{fontSize:"1.1rem"}}>☪</span></div>
        <div>
          <div style={{color:C.gold,fontSize:"1rem",fontWeight:"800"}}>امین اسکول ہب</div>
          <div style={{color:"rgba(255,255,255,0.4)",fontSize:"0.5rem",fontFamily:"'Cinzel',serif",letterSpacing:"0.1em"}}>AMEEN ISLAMIC INSTITUTE • ایمان • نظم • برتری</div>
        </div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:"14px"}}>
        <div style={{textAlign:"left",direction:"ltr"}}>
          <div style={{color:C.gold,fontSize:"0.68rem",fontWeight:"600"}}>{uName}</div>
          <div style={{color:"rgba(255,255,255,0.4)",fontSize:"0.55rem"}}>{uRole}</div>
        </div>
        <button style={{background:"rgba(255,255,255,0.08)",color:"rgba(255,255,255,0.7)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:"10px",padding:"7px 14px",fontSize:"0.62rem",cursor:"pointer",fontFamily:"inherit"}} onClick={logout}>لاگ آؤٹ</button>
      </div>
    </div>
    <div style={S.nav}>
      {PAGES.map(p=><button key={p.id} style={{padding:"13px 14px",border:"none",background:"none",color:page===p.id?C.gold:"#999",fontWeight:page===p.id?"800":"400",fontSize:"0.65rem",cursor:"pointer",borderBottom:page===p.id?`3px solid ${C.gold}`:"3px solid transparent",fontFamily:"inherit",whiteSpace:"nowrap",transition:"color 0.2s"}} onClick={()=>setPage(p.id)}>{p.label}</button>)}
    </div>
    <div>
      {page==="dashboard"&&<Dashboard students={students} teachers={teachers} houses={houses} hvsLogs={hvs}/>}
      {page==="hvs"&&<HVSEntry students={students} houses={houses} addData={addData} updateHousePoints={updateHousePoints}/>}
      {page==="students"&&<Students students={students} addData={addData}/>}
      {page==="teachers"&&<Teachers teachers={teachers} addData={addData}/>}
      {page==="hifz"&&<Hifz students={students} addData={addData}/>}
      {page==="houses"&&<Houses houses={houses} hvsLogs={hvs} students={students}/>}
      {page==="events"&&<Events addData={addData} houses={houses} updateHousePoints={updateHousePoints}/>}
      {page==="attendance"&&<Attendance students={students} addData={addData}/>}
    </div>
  </div>;
}

