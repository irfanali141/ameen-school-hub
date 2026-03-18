/* eslint-disable */

const C = { gold:"#b7860b", goldLight:"#f5e9c8", goldDark:"#7a5807", goldGlow:"rgba(183,134,11,0.3)", navy:"#1e293b", navyDark:"#0f172a", navyMid:"#1e3a5f", bg:"#f0ede8", white:"#ffffff", red:"#dc2626", green:"#16a34a", amber:"#d97706", purple:"#7c3aed", teal:"#0d9488", abuBakr:"#1e40af", umar:"#166534", uthman:"#854d0e", ali:"#991b1b", abuBakrLight:"#dbeafe", umarLight:"#dcfce7", uthmanLight:"#fef3c7", aliLight:"#fee2e2" };

const S = {
  app:{minHeight:"100vh",background:C.bg,fontFamily:"'Noto Nastaliq Urdu','Amiri',serif",direction:"rtl",display:"flex",flexDirection:"column",overflowX:"hidden"},
  lp:{minHeight:"100vh",background:`linear-gradient(135deg,${C.navyDark} 0%,${C.navyMid} 50%,${C.navy} 100%)`,display:"flex",alignItems:"center",justifyContent:"center",padding:"20px",position:"relative",overflow:"hidden"},
  lc:{background:"rgba(255,255,255,0.97)",borderRadius:"28px",padding:"44px 40px",width:"100%",maxWidth:"420px",boxShadow:"0 30px 80px rgba(0,0,0,0.5)",backdropFilter:"blur(20px)",border:"1px solid rgba(183,134,11,0.2)"},
  seal:{width:"88px",height:"88px",background:`conic-gradient(${C.gold},#e4b030,${C.gold},#e4b030,${C.gold})`,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px",boxShadow:`0 0 0 5px ${C.goldLight},0 12px 32px rgba(183,134,11,0.4)`},
  title:{fontSize:"1.4rem",fontWeight:"800",background:`linear-gradient(135deg,${C.goldDark},${C.gold})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",textAlign:"center"},
  inp:{width:"100%",padding:"13px 16px",border:`2px solid ${C.goldLight}`,borderRadius:"14px",fontSize:"0.85rem",outline:"none",marginBottom:"12px",background:"#fffdf8",fontFamily:"inherit",direction:"ltr",boxSizing:"border-box",transition:"border-color 0.2s"},
  btn:{width:"100%",padding:"15px",background:`linear-gradient(135deg,${C.gold},${C.goldDark})`,color:C.white,border:"none",borderRadius:"14px",fontSize:"1rem",fontWeight:"700",cursor:"pointer",fontFamily:"inherit",marginTop:"8px",boxShadow:`0 8px 24px ${C.goldGlow}`},
  hdr:{background:`linear-gradient(135deg,${C.navyDark},${C.navy})`,padding:"10px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100,boxShadow:"0 4px 20px rgba(0,0,0,0.3)",minHeight:"56px"},
  nav:{background:C.white,borderBottom:`3px solid ${C.goldLight}`,display:"flex",flexWrap:"wrap",padding:"0 4px",boxShadow:"0 2px 8px rgba(0,0,0,0.05)"},
  page:{padding:"20px 16px",maxWidth:"1400px",margin:"0 auto",width:"100%",boxSizing:"border-box"},
  card:{background:C.white,borderRadius:"20px",padding:"22px",boxShadow:"0 4px 20px rgba(0,0,0,0.07)",border:`1px solid ${C.goldLight}`},
  addBtn:{background:`linear-gradient(135deg,${C.gold},${C.goldDark})`,color:C.white,border:"none",borderRadius:"12px",padding:"11px 22px",fontSize:"0.8rem",cursor:"pointer",fontFamily:"inherit",fontWeight:"700",boxShadow:`0 4px 12px ${C.goldGlow}`},
  saveBtn:{background:`linear-gradient(135deg,${C.green},#15803d)`,color:C.white,border:"none",borderRadius:"12px",padding:"11px 26px",fontSize:"0.8rem",cursor:"pointer",fontFamily:"inherit",fontWeight:"700"},
  dangerBtn:{background:`linear-gradient(135deg,${C.red},#b91c1c)`,color:C.white,border:"none",borderRadius:"12px",padding:"11px 22px",fontSize:"0.8rem",cursor:"pointer",fontFamily:"inherit",fontWeight:"700"},
  inpSm:{padding:"10px 14px",border:`2px solid ${C.goldLight}`,borderRadius:"10px",fontSize:"0.8rem",outline:"none",fontFamily:"inherit",background:"#fffdf8",width:"100%",boxSizing:"border-box"},
  th:{padding:"12px 14px",textAlign:"right",fontSize:"0.72rem",color:"#888",borderBottom:`2px solid ${C.goldLight}`,fontWeight:"700",letterSpacing:"0.02em"},
  td:{padding:"11px 14px",fontSize:"0.75rem",borderBottom:`1px solid rgba(245,233,200,0.4)`,color:C.navy}
};

function hBadge(color,light){ return {display:"inline-block",padding:"4px 12px",borderRadius:"20px",background:light||color+"15",color:color,fontSize:"0.58rem",fontWeight:"700",border:`1px solid ${color}30`}; }
function pBar(val,max,color){ const pct=Math.min(100,Math.round((val/max)*100)); return <div style={{height:"6px",background:"#eee",borderRadius:"3px",overflow:"hidden",marginTop:"4px"}}><div style={{width:`${pct}%`,height:"100%",background:color,borderRadius:"3px",transition:"width 0.5s ease"}}/></div>; }

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
  { email:"director@ameen.edu",    password:"ameen2026", role:"director",    name:"Director Sahib"   },
  { email:"admin@ameen.edu",       password:"ameen2026", role:"admin",       name:"Admin Sahib"      },
  { email:"teacher@ameen.edu",     password:"ameen2026", role:"teacher",     name:"Ustad Ji"         },
  { email:"finance@ameen.edu",     password:"ameen2026", role:"finance",     name:"Finance Officer"  },
  { email:"registrar@ameen.edu",   password:"ameen2026", role:"registrar",   name:"Registrar Sahib"  },
  { email:"housemaster@ameen.edu", password:"ameen2026", role:"housemaster", name:"House Master"     },
  { email:"parent@ameen.edu",      password:"ameen2026", role:"parent",      name:"Parent"           },
  { email:"student@ameen.edu",     password:"ameen2026", role:"student",     name:"Talba"            },
];

// null = all pages; array = allowed page IDs only
const ROLE_PAGES = {
  director:    null,
  admin:       ["dashboard","attendance","timetable","notifications","noticeboard","events",
                "students","hifz","results","marks","reportcard","dmc","transcript","welfare","hpri","health","hostel","transport",
                "houses","hvs","superhouse","tarbiyah","ethics","pride",
                "teachers","salary","slips","leave","staffperf","faculty_dev","lessons","curriculum","lmaterials",
                "exams","seating","analytics","library","madrasa","wifaq","fees","reports",
                "director","registrar","parents","alumni","visitors","meetings","assets","donations"],
  teacher:     ["dashboard","timetable","attendance","notifications","noticeboard",
                "marks","hifz","results","students","lessons","curriculum","lmaterials","leave"],
  finance:     ["dashboard","fees","salary","slips","donations","reports"],
  registrar:   ["dashboard","students","registrar","transcript","reportcard","dmc",
                "results","marks","analytics","notifications","noticeboard","attendance"],
  housemaster: ["dashboard","students","houses","hvs","superhouse","tarbiyah","ethics","pride",
                "notifications","attendance"],
  parent:      ["parents"],
  student:     ["parents"],
};

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

export { C, S, hBadge, pBar, HOUSES, HVS_CATS, HVS_TOTAL, RATING, DEMO, ROLE_PAGES, SEED_S, SEED_T, MONTHS, TIMETABLE, DAYS, DAYS_UR };
