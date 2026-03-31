/* eslint-disable */

const C = {
  primary:"#1B4332", primaryLight:"#2D6A4F", primaryDark:"#0D2818",
  gold:"#B8860B", goldLight:"#F0C040", goldBg:"rgba(184,134,11,0.12)",
  bg:"#F8F6F0", bgCard:"#FFFFFF", bgDark:"#0D2818",
  white:"#FFFFFF", border:"#E2D9C5", shadow:"rgba(27,67,50,0.12)",
  navy:"#1A1A2E", textSecondary:"#4A5568",
  red:"#C53030", green:"#22543D", amber:"#B7791F",
  abuBakr:"#1e40af", umar:"#166534", uthman:"#854d0e", ali:"#991b1b",
  abuBakrLight:"#dbeafe", umarLight:"#dcfce7", uthmanLight:"#fef3c7", aliLight:"#fee2e2",
  goldDark:"#7a5807", goldGlow:"rgba(183,134,11,0.3)",
  navyDark:"#0f172a", navyMid:"#1e3a5f", purple:"#7c3aed", teal:"#0d9488"
};

const S = {
  app:{height:"100vh",background:C.bg,fontFamily:"'DM Sans','Segoe UI',Arial,sans-serif",direction:"ltr",display:"flex",flexDirection:"row",overflow:"hidden"},
  lp:{minHeight:"100vh",background:`linear-gradient(135deg,${C.primaryDark} 0%,${C.primaryLight} 60%,${C.primary} 100%)`,display:"flex",alignItems:"center",justifyContent:"center",padding:"20px",position:"relative",overflow:"hidden"},
  lc:{background:"rgba(255,255,255,0.98)",borderRadius:"20px",padding:"44px 40px",width:"100%",maxWidth:"420px",boxShadow:"0 24px 64px rgba(27,67,50,0.35)",border:"1px solid #E2D9C5"},
  seal:{width:"80px",height:"80px",background:`conic-gradient(${C.gold},${C.goldLight},${C.gold},${C.goldLight},${C.gold})`,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px",boxShadow:`0 0 0 4px #F8F6F0,0 8px 24px rgba(184,134,11,0.35)`},
  title:{fontSize:"1.4rem",fontWeight:"700",background:`linear-gradient(135deg,${C.primary},${C.primaryLight})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",textAlign:"center",fontFamily:"'Playfair Display',Georgia,serif"},
  inp:{width:"100%",padding:"12px 16px",border:"2px solid #E2D9C5",borderRadius:"10px",fontSize:"0.85rem",outline:"none",marginBottom:"12px",background:"#FAFAF7",fontFamily:"inherit",direction:"ltr",boxSizing:"border-box",transition:"border-color 0.2s"},
  btn:{width:"100%",padding:"13px",background:C.primary,color:"#FFFFFF",border:"none",borderRadius:"10px",fontSize:"0.95rem",fontWeight:"700",cursor:"pointer",fontFamily:"inherit",marginTop:"8px",boxShadow:"0 4px 16px rgba(27,67,50,0.3)",transition:"background 0.2s"},
  hdr:{background:C.primaryDark,padding:"10px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",zIndex:100,boxShadow:"0 2px 12px rgba(0,0,0,0.25)",minHeight:"52px"},
  nav:{background:C.white,borderBottom:`2px solid ${C.border}`,display:"flex",flexWrap:"nowrap",padding:"0 8px",boxShadow:"0 1px 4px rgba(27,67,50,0.06)"},
  page:{padding:"24px clamp(16px, 2.5vw, 40px)",maxWidth:"1400px",margin:"0 auto",width:"100%",boxSizing:"border-box"},
  card:{background:"#FFFFFF",borderRadius:"12px",padding:"20px",boxShadow:"0 2px 12px rgba(27,67,50,0.08)",border:"1px solid #E2D9C5"},
  addBtn:{background:C.primary,color:"#FFFFFF",border:"none",borderRadius:"8px",padding:"10px 20px",fontSize:"0.8rem",cursor:"pointer",fontFamily:"inherit",fontWeight:"600",boxShadow:"0 2px 8px rgba(27,67,50,0.2)",transition:"background 0.2s"},
  saveBtn:{background:C.green,color:"#FFFFFF",border:"none",borderRadius:"8px",padding:"10px 20px",fontSize:"0.8rem",cursor:"pointer",fontFamily:"inherit",fontWeight:"600",transition:"background 0.2s"},
  dangerBtn:{background:C.red,color:"#FFFFFF",border:"none",borderRadius:"8px",padding:"10px 20px",fontSize:"0.8rem",cursor:"pointer",fontFamily:"inherit",fontWeight:"600",transition:"background 0.2s"},
  inpSm:{padding:"9px 12px",border:"1.5px solid #E2D9C5",borderRadius:"8px",fontSize:"0.8rem",outline:"none",fontFamily:"inherit",background:"#FAFAF7",width:"100%",boxSizing:"border-box",transition:"border-color 0.2s"},
  th:{padding:"11px 14px",textAlign:"left",fontSize:"0.72rem",color:"#FFFFFF",background:C.primary,fontWeight:"600",letterSpacing:"0.02em"},
  td:{padding:"11px 14px",fontSize:"0.76rem",borderBottom:"1px solid #E2D9C5",color:"#1A1A2E"}
};

function hBadge(color,light){ return {display:"inline-block",padding:"4px 12px",borderRadius:"20px",background:light||color+"15",color:color,fontSize:"0.58rem",fontWeight:"700",border:`1px solid ${color}30`}; }
function pBar(val,max,color){ const pct=Math.min(100,Math.round((val/max)*100)); return <div style={{height:"6px",background:"#eee",borderRadius:"3px",overflow:"hidden",marginTop:"4px"}}><div style={{width:`${pct}%`,height:"100%",background:color,borderRadius:"3px",transition:"width 0.5s ease"}}/></div>; }

const HOUSES = [
  { id:"abuBakr", name:"Abu Bakr", nameEn:"Abu Bakr", color:C.abuBakr, light:C.abuBakrLight, emoji:"🔵", slogan:"صدیقِ اکبر — سچائی کی علامت", gradient:"linear-gradient(135deg,#1e40af,#1d4ed8)" },
  { id:"umar", name:"Umar", nameEn:"Umar", color:C.umar, light:C.umarLight, emoji:"🟢", slogan:"فاروقِ اعظم — عدل کی میزان", gradient:"linear-gradient(135deg,#166534,#15803d)" },
  { id:"uthman", name:"Uthman", nameEn:"Uthman", color:C.uthman, light:C.uthmanLight, emoji:"🟤", slogan:"ذوالنورین — حیا کا پیکر", gradient:"linear-gradient(135deg,#854d0e,#a16207)" },
  { id:"ali", name:"Ali", nameEn:"Ali", color:C.ali, light:C.aliLight, emoji:"🔴", slogan:"شیرِ خدا — شجاعت کا نمونہ", gradient:"linear-gradient(135deg,#991b1b,#b91c1c)" }
];

const HVS_CATS = [
  { id:"attendance", label:"حاضری", labelEn:"Attendance", max:10, icon:"✅", desc:"اسمبلی وقت پر، غیر حاضری نہ ہو",
    subs:[{id:"assembly",label:"اسمبلی حاضری",max:4},{id:"punctuality",label:"وقت پر آمد",max:3},{id:"regularity",label:"باقاعدگی بونس",max:3}] },
  { id:"discipline", label:"نظم و ضبط", labelEn:"Discipline", max:15, icon:"⚔️", desc:"قطار، خاموشی، یونیفارم، ادب",
    subs:[{id:"queue",label:"قطار و صف",max:4},{id:"silence",label:"خاموشی",max:4},{id:"uniform",label:"یونیفارم",max:4},{id:"adab",label:"ادب و احترام",max:3}] },
  { id:"morality", label:"اخلاقیات", labelEn:"Morality", max:15, icon:"💎", desc:"گفتگو، سچائی، مدد، روحانی ٹریکر",
    subs:[{id:"speech",label:"گفتگو کا معیار",max:4},{id:"honesty",label:"سچائی",max:4},{id:"helping",label:"دوسروں کی مدد",max:4},{id:"spiritual",label:"روحانی ٹریکر",max:3}] },
  { id:"education", label:"تعلیم", labelEn:"Education", max:25, icon:"📚", desc:"سوالات، ہوم ورک، ٹیسٹ، ریڈنگ",
    subs:[{id:"questions",label:"کلاس سوالات",max:6},{id:"homework",label:"ہوم ورک",max:6},{id:"tests",label:"ٹیسٹ نتائج",max:8},{id:"reading",label:"ریڈنگ",max:5}] },
  { id:"cleanliness", label:"صفائی", labelEn:"Cleanliness", max:15, icon:"🧹", desc:"ناخن، بال، ڈیسک، فرش",
    subs:[{id:"nails",label:"ناخن و بال",max:4},{id:"desk",label:"ڈیسک صفائی",max:4},{id:"floor",label:"فرش صفائی",max:4},{id:"personal",label:"ذاتی صفائی",max:3}] },
  { id:"leadership", label:"قیادت", labelEn:"Leadership", max:10, icon:"👑", desc:"کیپٹن/مانیٹرز کی ڈیوٹی",
    subs:[{id:"captain",label:"کیپٹن کارکردگی",max:5},{id:"monitors",label:"مانیٹرز ڈیوٹی",max:5}] },
  { id:"spirit", label:"گھر کا جذبہ", labelEn:"House Spirit", max:10, icon:"🔥", desc:"نعرہ، جوش، ٹیم ورک",
    subs:[{id:"chant",label:"گھر نعرہ",max:3},{id:"enthusiasm",label:"جوش و ولولہ",max:4},{id:"teamwork",label:"ٹیم ورک",max:3}] },
  { id:"activities", label:"سرگرمیاں", labelEn:"Activities", max:60, icon:"🎭", desc:"بزمِ ادب، نعت، تقریر، کوئز، اسپورٹس",
    subs:[{id:"literary",label:"بزمِ ادب",max:12},{id:"naat",label:"نعت و حمد",max:12},{id:"speech_act",label:"تقریر",max:12},{id:"quiz",label:"کوئز",max:12},{id:"sports",label:"اسپورٹس",max:12}] },
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
  // housemaster must exist for the Housemaster role to work in demo login
  { email:"housemaster@ameen.edu", password:"ameen2026", role:"housemaster", name:"House Master Sahib"  },
  { email:"madrasa@ameen.edu",     password:"ameen2026", role:"madrasa",     name:"Madrasa Ustad Sahib" },
  { email:"parent@ameen.edu",      password:"ameen2026", role:"parent",      name:"Parent"              },
  { email:"student@ameen.edu",     password:"ameen2026", role:"student",     name:"Talba"            },
];

// null = all pages; array = allowed page IDs only
const ROLE_PAGES = {
  director:    null,
  admin:       ["dashboard","attendance","timetable","notifications","noticeboard","events",
                "classrooms","students","hifz","results","marks","reportcard","dmc","transcript","evaluationscales","welfare","hpri","health","hostel","transport",
                "houses","hvs","superhouse","duties","grandtotal","superannual","tarbiyah","ethics","pride",
                "teachers","salary","slips","leave","staffperf","faculty_dev","lessons","curriculum","lmaterials",
                "exams","seating","analytics","library","madrasa","fees","reports",
                "director","registrar","reportchain","housereportchain","investigationhub","invcase","incidentlog","weaknessmatrix","monthlyplanner","societysystem","leadershiproles","housetemplates","housebazaar","sitaraameen","parents","messaging","homeworkhub","aiassistant","quizhub","schemeofstudies","academiccalendar","termbreakup","schooldecor","chat","etube","alumni","visitors","meetings","assets","donations","phase2plan","watchlist"],
  teacher:     ["dashboard","timetable","attendance","notifications","noticeboard",
                "marks","hifz","results","students","lessons","curriculum","lmaterials","leave","evaluationscales","homeworkhub","aiassistant","quizhub","schemeofstudies","academiccalendar","termbreakup","chat","etube"],
  finance:     ["dashboard","fees","salary","slips","donations","reports"],
  registrar:   ["dashboard","students","registrar","transcript","reportcard","dmc",
                "results","marks","analytics","notifications","noticeboard","attendance"],
  housemaster: ["dashboard","students","houses","hvs","superhouse","duties","grandtotal","superannual","investigationhub","invcase","incidentlog","weaknessmatrix","monthlyplanner","societysystem","leadershiproles","housetemplates","housebazaar","sitaraameen","tarbiyah","ethics","pride",
                "notifications","attendance","watchlist","housereportchain"],
  madrasa:     ["dashboard","madrasa","notifications","students"],
  parent:      ["parents","messaging","homeworkhub","quizhub","etube"],
  student:     ["parents","homeworkhub","quizhub","etube"],
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

const MONTHS = ["Month 1: نظم و ضبط","Month 2: صفائی و پاکیزگی","Month 3: سیرت و اخلاق","Month 4: تعلیمی Standard","Month 5: سماجی Service","Month 6: قیادت","Month 7: کھیل اور صحت","Month 8: تخلیقی صلاحیت","Month 9: بزنس House","Month 10: روحانیت","Month 11: تLowیل و جائزہ","Month 12: جشنِ Success"];

const TIMETABLE = {
  "Grade 6": { Monday:["Quran (7:30)","Math (8:15)","Urdu (9:00)","Break","English (10:00)","Science (10:45)","Islamic Studies (11:30)"], Tuesday:["Hifz (7:30)","English (8:15)","Math (9:00)","Break","Urdu (10:00)","Social Studies (10:45)","PE (11:30)"], Wednesday:["Quran (7:30)","Science (8:15)","English (9:00)","Break","Math (10:00)","Art (10:45)","Islamic Studies (11:30)"], Thursday:["Hifz (7:30)","Urdu (8:15)","Social Studies (9:00)","Break","English (10:00)","Math (10:45)","Assembly (11:30)"], Friday:["Quran (7:30)","Islamic Studies (8:15)","Urdu (9:00)","Break","English (10:00)","Dua & Closing (11:00)"] },
  "Grade 7": { Monday:["Quran (7:30)","Math (8:15)","English (9:00)","Break","Science (10:00)","Urdu (10:45)","Islamic Studies (11:30)"], Tuesday:["Hifz (7:30)","Science (8:15)","Math (9:00)","Break","English (10:00)","History (10:45)","PE (11:30)"], Wednesday:["Quran (7:30)","English (8:15)","Urdu (9:00)","Break","Math (10:00)","Computer (10:45)","Islamic Studies (11:30)"], Thursday:["Hifz (7:30)","Math (8:15)","History (9:00)","Break","Science (10:00)","English (10:45)","House Activity (11:30)"], Friday:["Quran (7:30)","Islamic Studies (8:15)","Urdu (9:00)","Break","Math (10:00)","Dua & Closing (11:00)"] },
  "Grade 8": { Monday:["Quran (7:30)","Physics (8:15)","Math (9:00)","Break","English (10:00)","Chemistry (10:45)","Islamic Studies (11:30)"], Tuesday:["Hifz (7:30)","Math (8:15)","English (9:00)","Break","Biology (10:00)","Urdu (10:45)","PE (11:30)"], Wednesday:["Quran (7:30)","Chemistry (8:15)","Math (9:00)","Break","English (10:00)","Computer (10:45)","Islamic Studies (11:30)"], Thursday:["Hifz (7:30)","Physics (8:15)","Biology (9:00)","Break","Math (10:00)","English (10:45)","House Activity (11:30)"], Friday:["Quran (7:30)","Islamic Studies (8:15)","Urdu (9:00)","Break","Math (10:00)","Dua & Closing (11:00)"] },
  "Grade 9": { Monday:["Quran (7:30)","Physics (8:15)","Math (9:00)","Break","English (10:00)","Chemistry (10:45)","Pakistan Studies (11:30)"], Tuesday:["Hifz (7:30)","Math (8:15)","Biology (9:00)","Break","English (10:00)","Urdu (10:45)","PE (11:30)"], Wednesday:["Quran (7:30)","Chemistry (8:15)","Math (9:00)","Break","Pakistan Studies (10:00)","Computer (10:45)","Islamic Studies (11:30)"], Thursday:["Hifz (7:30)","Physics (8:15)","Biology (9:00)","Break","Math (10:00)","English (10:45)","House Activity (11:30)"], Friday:["Quran (7:30)","Islamic Studies (8:15)","Urdu (9:00)","Break","Math (10:00)","Dua & Closing (11:00)"] }
};

const EXAM_NAMES = [
  // Monthly Assessments (12 months)
  "Monthly Assessment 1 — January","Monthly Assessment 2 — February","Monthly Assessment 3 — March",
  "Monthly Assessment 4 — April","Monthly Assessment 5 — May","Monthly Assessment 6 — June",
  "Monthly Assessment 7 — July","Monthly Assessment 8 — August","Monthly Assessment 9 — September",
  "Monthly Assessment 10 — October","Monthly Assessment 11 — November","Monthly Assessment 12 — December",
  // Monthly Tests
  "Monthly Test 1","Monthly Test 2","Monthly Test 3","Monthly Test 4",
  "Monthly Test 5","Monthly Test 6","Monthly Test 7","Monthly Test 8",
  // Mid-Term
  "Mid-Term Exam 1","Mid-Term Exam 2",
  // Half Yearly
  "Half Yearly Exam",
  // Annual / Final
  "Annual Exam","Final Exam","Pre-Board Exam",
  // Unit Tests
  "Unit Test 1","Unit Test 2","Unit Test 3","Unit Test 4","Unit Test 5","Unit Test 6",
  // Quizzes
  "Quiz 1","Quiz 2","Quiz 3","Quiz 4","Quiz 5","Quiz 6","Quiz 7","Quiz 8","Quiz 9","Quiz 10",
  // Special
  "Class Test","Speed Test","Oral Test","Hifz Test","Tajweed Test",
];

const SUBJECTS = [
  "Quran","Hifz","Islamic Studies","Urdu","English","Mathematics",
  "Science","Physics","Chemistry","Biology","Pakistan Studies",
  "Social Studies","History","Computer","Art","PE","Arabic"
];

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday"];
const DAYS_UR = { Monday:"Monday", Tuesday:"Tuesday", Wednesday:"Wednesday", Thursday:"Totalرات", Friday:"Totalہ" };

// Student display label with grade+section to distinguish duplicates
const sLabel = (s) => s.name + (s.grade ? ' — ' + s.grade : '') + (s.section ? ' (' + s.section + ')' : '');

export { C, S, hBadge, pBar, HOUSES, HVS_CATS, HVS_TOTAL, RATING, DEMO, ROLE_PAGES, SEED_S, SEED_T, MONTHS, TIMETABLE, DAYS, DAYS_UR, SUBJECTS, EXAM_NAMES, sLabel };
