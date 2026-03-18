/* eslint-disable */
import { useState, useEffect } from "react";
import "./hover.css";
import { supabase, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, addData as sbAddData, getData, updateData, subscribeToTable } from "./supabase";
import { C, S, hBadge, pBar, HOUSES, HVS_CATS, HVS_TOTAL, RATING, DEMO, ROLE_PAGES, SEED_S, SEED_T, MONTHS, TIMETABLE, DAYS, DAYS_UR } from "./constants";
import seedDB from "./utils/seedDB";

// Auth components
import Login, { AIILogo, HouseBadge } from "./components/auth/Login";

// Academic components
import Dashboard from "./components/academic/Dashboard";
import Students from "./components/academic/Students";
import Hifz from "./components/academic/Hifz";
import Attendance from "./components/academic/Attendance";
import Results from "./components/academic/Results";
import Notifications from "./components/academic/Notifications";
import Timetable from "./components/academic/Timetable";
import Events from "./components/academic/Events";
import Library from "./components/academic/Library";
import ExamSchedule from "./components/academic/ExamSchedule";
import ExamSeating from "./components/academic/ExamSeating";
import ClassAnalytics from "./components/academic/ClassAnalytics";
import TranscriptRequest from "./components/academic/TranscriptRequest";
import ReportCard from "./components/academic/ReportCard";
import DMC from "./components/academic/DMC";
import CurriculumHub from "./components/academic/CurriculumHub";
import MarksEntry from "./components/academic/MarksEntry";
import Reports from "./components/academic/Reports";

// House components
import Houses from "./components/houses/Houses";
import HVSEntry from "./components/houses/HVSEntry";
import TarbiyahEthics from "./components/houses/TarbiyahEthics";
import TarbiyahDiary from "./components/houses/TarbiyahDiary";
import SuperHouseDashboard from "./components/houses/SuperHouseDashboard";

// Finance components
import FeeManagement from "./components/finance/FeeManagement";
import SalaryManagement from "./components/finance/SalaryManagement";
import SalarySlips from "./components/finance/SalarySlips";
import DonationHub from "./components/finance/DonationHub";

// Staff components
import Teachers from "./components/staff/Teachers";
import StaffPerformance from "./components/staff/StaffPerformance";
import LessonPlans from "./components/staff/LessonPlans";
import TeacherLeave from "./components/staff/TeacherLeave";
import LearningMaterials from "./components/staff/LearningMaterials";
import FacultyDevelopment from "./components/staff/FacultyDevelopment";

// Admin components
import Transport from "./components/admin/Transport";
import NoticeBoard from "./components/admin/NoticeBoard";
import HostelManagement from "./components/admin/HostelManagement";
import MeetingMinutes from "./components/admin/MeetingMinutes";
import LogisticsTracker from "./components/admin/LogisticsTracker";
import VisitorHub from "./components/admin/VisitorHub";
import RegistrarHub from "./components/admin/RegistrarHub";

// Portal components
import ParentPortal from "./components/portals/ParentPortal";
import DirectorPortal from "./components/portals/DirectorPortal";
import AlumniPortal from "./components/portals/AlumniPortal";

// Welfare components
import StudentHealth from "./components/welfare/StudentHealth";
import WelfareFeedback from "./components/welfare/WelfareFeedback";
import PrideMessages from "./components/welfare/PrideMessages";
import HPRISystem from "./components/welfare/HPRISystem";

// Madrasa components
import MadrasaHub from "./components/madrasa/MadrasaHub";
import WifaqCompliance from "./components/madrasa/WifaqCompliance";


// ===================== TRANSLATIONS =====================
const TRANS = {
  ur: {
    dir: "rtl",
    appName: "امین اسکول ہب",
    logout: "لاگ آؤٹ",
    feesPending: "فیس باقی",
    loading: "لوڈ ہو رہا ہے...",
    nav: {
      main: "🏠 مرکزی", talba: "🎓 طلبا", house: "🏆 ہاؤس",
      asatza: "👨‍🏫 اساتذہ", taleem: "📚 تعلیم", idara: "🏛️ ادارہ"
    },
    pages: {
      dashboard:"📊 ڈیش بورڈ", attendance:"✅ حاضری", timetable:"🗓️ ٹائم ٹیبل",
      notifications:"📱 اطلاعات", noticeboard:"📌 نوٹس", events:"🎭 ایونٹس",
      students:"🎓 طلبا", hifz:"📖 حفظ", results:"📊 نتائج", marks:"✏️ نمبرات",
      reportcard:"📋 رپورٹ کارڈ", dmc:"🎓 DMC", transcript:"📜 ٹرانسکرپٹ",
      welfare:"💬 طالب فلاح", hpri:"⚠️ HPRI", health:"🏥 صحت",
      hostel:"🏠 ہوسٹل", transport:"🚌 ٹرانسپورٹ", houses:"🏠 ہاؤس",
      hvs:"🏅 HVS", superhouse:"🏆 سپر ہاؤس", tarbiyah:"🌟 تربیت",
      ethics:"🌟 اخلاق", pride:"💌 پرائیڈ", teachers:"👨‍🏫 اساتذہ",
      salary:"💼 تنخواہ", slips:"💳 تنخواہ سلپ", leave:"🏖️ چھٹی",
      staffperf:"📊 اسٹاف", faculty_dev:"👩‍🏫 استاد ترقی", lessons:"📅 سبق منصوبہ",
      curriculum:"📚 نصابی وسائل", lmaterials:"📚 تعلیمی مواد", exams:"📝 امتحان",
      seating:"🪑 نشست بندی", analytics:"📊 تجزیہ", library:"📚 لائبریری",
      madrasa:"🕌 درس نظامی", wifaq:"🕌 وفاق", fees:"💰 فیس",
      director:"👨‍💼 ڈائریکٹر", registrar:"📋 رجسٹرار", parents:"👪 والدین",
      alumni:"🎓 سابق طلبا", visitors:"🔒 سیکیورٹی", meetings:"📝 میٹنگ",
      assets:"🏗️ اثاثے", donations:"🤲 عطیات",
      reports:"📊 رپورٹس"
    }
  },
  en: {
    dir: "ltr",
    appName: "Ameen School Hub",
    logout: "Logout",
    feesPending: "Fees Pending",
    loading: "Loading...",
    nav: {
      main: "🏠 Main", talba: "🎓 Students", house: "🏆 House",
      asatza: "👨‍🏫 Teachers", taleem: "📚 Academic", idara: "🏛️ Admin"
    },
    pages: {
      dashboard:"📊 Dashboard", attendance:"✅ Attendance", timetable:"🗓️ Timetable",
      notifications:"📱 Notifications", noticeboard:"📌 Notice Board", events:"🎭 Events",
      students:"🎓 Students", hifz:"📖 Hifz", results:"📊 Results", marks:"✏️ Marks",
      reportcard:"📋 Report Card", dmc:"🎓 DMC", transcript:"📜 Transcript",
      welfare:"💬 Welfare", hpri:"⚠️ HPRI", health:"🏥 Health",
      hostel:"🏠 Hostel", transport:"🚌 Transport", houses:"🏠 Houses",
      hvs:"🏅 HVS", superhouse:"🏆 Super House", tarbiyah:"🌟 Tarbiyah",
      ethics:"🌟 Ethics", pride:"💌 Pride", teachers:"👨‍🏫 Teachers",
      salary:"💼 Salary", slips:"💳 Salary Slips", leave:"🏖️ Leave",
      staffperf:"📊 Staff", faculty_dev:"👩‍🏫 Faculty Dev", lessons:"📅 Lesson Plans",
      curriculum:"📚 Curriculum", lmaterials:"📚 Materials", exams:"📝 Exams",
      seating:"🪑 Seating", analytics:"📊 Analytics", library:"📚 Library",
      madrasa:"🕌 Madrasa", wifaq:"🕌 Wifaq", fees:"💰 Fees",
      director:"👨‍💼 Director", registrar:"📋 Registrar", parents:"👪 Parents",
      alumni:"🎓 Alumni", visitors:"🔒 Visitors", meetings:"📝 Meetings",
      assets:"🏗️ Assets", donations:"🤲 Donations",
      reports:"📊 Reports"
    }
  },
  ar: {
    dir: "rtl",
    appName: "مركز مدرسة أمين",
    logout: "تسجيل الخروج",
    feesPending: "الرسوم المعلقة",
    loading: "جارٍ التحميل...",
    nav: {
      main: "🏠 الرئيسية", talba: "🎓 الطلاب", house: "🏆 البيت",
      asatza: "👨‍🏫 المعلمون", taleem: "📚 الأكاديمية", idara: "🏛️ الإدارة"
    },
    pages: {
      dashboard:"📊 لوحة التحكم", attendance:"✅ الحضور", timetable:"🗓️ الجدول",
      notifications:"📱 الإشعارات", noticeboard:"📌 لوحة الإعلانات", events:"🎭 الفعاليات",
      students:"🎓 الطلاب", hifz:"📖 الحفظ", results:"📊 النتائج", marks:"✏️ الدرجات",
      reportcard:"📋 كشف الدرجات", dmc:"🎓 DMC", transcript:"📜 السجل",
      welfare:"💬 الرعاية", hpri:"⚠️ HPRI", health:"🏥 الصحة",
      hostel:"🏠 السكن", transport:"🚌 المواصلات", houses:"🏠 البيوت",
      hvs:"🏅 HVS", superhouse:"🏆 سوبر هاوس", tarbiyah:"🌟 التربية",
      ethics:"🌟 الأخلاق", pride:"💌 الفخر", teachers:"👨‍🏫 المعلمون",
      salary:"💼 الراتب", slips:"💳 قسائم الراتب", leave:"🏖️ الإجازة",
      staffperf:"📊 الأداء", faculty_dev:"👩‍🏫 تطوير الكادر", lessons:"📅 خطط الدروس",
      curriculum:"📚 المناهج", lmaterials:"📚 المواد", exams:"📝 الامتحانات",
      seating:"🪑 ترتيب الجلوس", analytics:"📊 التحليل", library:"📚 المكتبة",
      madrasa:"🕌 المدرسة", wifaq:"🕌 الوفاق", fees:"💰 الرسوم",
      director:"👨‍💼 المدير", registrar:"📋 المسجل", parents:"👪 الآباء",
      alumni:"🎓 الخريجون", visitors:"🔒 الزوار", meetings:"📝 الاجتماعات",
      assets:"🏗️ الأصول", donations:"🤲 التبرعات",
      reports:"📊 التقارير"
    }
  }
};
// ===================== MAIN APP =====================
export default function App(){
  const [user,setUser]=useState(null); const [loading,setLoading]=useState(true);
  const [err,setErr]=useState(""); const [lLoading,setLL]=useState(false);
  const [page,setPage]=useState("dashboard");
  const [openGroup, setOpenGroup] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileGroup, setMobileGroup] = useState(null);
  const [lang, setLang] = useState("ur");
  const [students,setStudents]=useState([]); const [teachers,setTeachers]=useState([]);
  const [houses,setHouses]=useState([]); const [hvs,setHvs]=useState([]);
  const [fees,setFees]=useState([]); const [results,setResults]=useState([]); const [hifzLogs,setHifzLogs]=useState([]);

  useEffect(()=>{ return onAuthStateChanged(async u=>{ setUser(u); setLoading(false); if(u){ await seedDB(); } }); },[]);
  useEffect(()=>{
    if(!user)return;
    const role=DEMO.find(d=>d.email===user?.email)?.role||"teacher";
    const allowed=ROLE_PAGES[role]??ROLE_PAGES.teacher;
    if(allowed!==null&&!allowed.includes(page)){ setPage(allowed[0]||"dashboard"); }
  },[user]);
  useEffect(()=>{ if(!user)return;
    const s1=subscribeToTable("students",setStudents);
    const s2=subscribeToTable("teachers",setTeachers);
    const s3=subscribeToTable("houses",setHouses);
    const s4=subscribeToTable("hvs_logs",setHvs);
    const s5=subscribeToTable("fees",setFees);
    const s6=subscribeToTable("results",setResults); const s7=subscribeToTable("hifz_logs",setHifzLogs);
    return()=>{s1();s2();s3();s4();s5();s6();s7();};
  },[user]);

  const login=async(email,pass)=>{ setLL(true); setErr(""); try{ try{ await signInWithEmailAndPassword(email,pass); }catch{ await createUserWithEmailAndPassword(email,pass); } }catch(e){ setErr("غلط ای میل یا پاس ورڈ"); } setLL(false); };
  const logout=()=>signOut();
  const addData=async(col,data)=>{ try{ await sbAddData(col,data); }catch(e){ console.error("addData:",e.message); } };
  const updateHousePoints=async(houseId,pts)=>{ try{ const hd=houses.find(h=>h.id===houseId); await updateData("houses",houseId,{points:(hd?.points||0)+pts,hvs_total:(hd?.hvs_total||0)+pts,hvs_weeks:(hd?.hvs_weeks||0)+1}); }catch(e){ console.error("updatePts:",e.message); } };
  const t=TRANS[lang];
const NAV_GROUPS = [
  // using t.nav and t.pages for labels

  {
    id: "main", label: t.nav.main, color: "#1e40af",
    pages: [
      {id:"dashboard",label:t.pages.dashboard},
      {id:"attendance",label:t.pages.attendance},
      {id:"timetable",label:t.pages.timetable},
      {id:"notifications",label:t.pages.notifications},
      {id:"noticeboard",label:t.pages.noticeboard},
      {id:"events",label:t.pages.events},
    ]
  },
  {
    id: "talba", label: t.nav.talba, color: "#166534",
    pages: [
      {id:"students",label:t.pages.students},
      {id:"hifz",label:t.pages.hifz},
      {id:"results",label:t.pages.results},
      {id:"marks",label:t.pages.marks},
      {id:"reportcard",label:t.pages.reportcard},
      {id:"dmc",label:t.pages.dmc},
      {id:"transcript",label:t.pages.transcript},
      {id:"welfare",label:t.pages.welfare},
      {id:"hpri",label:t.pages.hpri},
      {id:"health",label:t.pages.health},
      {id:"hostel",label:t.pages.hostel},
      {id:"transport",label:t.pages.transport},
    ]
  },
  {
    id: "house", label: t.nav.house, color: "#854d0e",
    pages: [
      {id:"houses",label:t.pages.houses},
      {id:"hvs",label:t.pages.hvs},
      {id:"superhouse",label:t.pages.superhouse},
      {id:"tarbiyah",label:t.pages.tarbiyah},
      {id:"ethics",label:t.pages.ethics},
      {id:"pride",label:t.pages.pride},
    ]
  },
  {
    id: "asatza", label: "👨‍🏫 اساتذہ", color: "#7c3aed",
    pages: [
      {id:"teachers",label:t.pages.teachers},
      {id:"salary",label:t.pages.salary},
      {id:"slips",label:t.pages.slips},
      {id:"leave",label:t.pages.leave},
      {id:"staffperf",label:t.pages.staffperf},
      {id:"faculty_dev",label:t.pages.faculty_dev},
      {id:"lessons",label:t.pages.lessons},
      {id:"curriculum",label:t.pages.curriculum},
      {id:"lmaterials",label:t.pages.lmaterials},
    ]
  },
  {
    id: "taleem", label: t.nav.taleem, color: "#0d9488",
    pages: [
      {id:"exams",label:t.pages.exams},
      {id:"seating",label:t.pages.seating},
      {id:"analytics",label:t.pages.analytics},
      {id:"library",label:t.pages.library},
      {id:"madrasa",label:t.pages.madrasa},
      {id:"wifaq",label:t.pages.wifaq},
      {id:"fees",label:t.pages.fees},
      {id:"reports",label:t.pages.reports},
    ]
  },
  {
    id: "idara", label: t.nav.idara, color: "#991b1b",
    pages: [
      {id:"director",label:t.pages.director},
      {id:"registrar",label:t.pages.registrar},
      {id:"parents",label:t.pages.parents},
      {id:"alumni",label:t.pages.alumni},
      {id:"visitors",label:t.pages.visitors},
      {id:"meetings",label:t.pages.meetings},
      {id:"assets",label:t.pages.assets},
      {id:"donations",label:t.pages.donations},
    ]
  },
];
  const PAGES=[
    {id:"dashboard",label:t.pages.dashboard},{id:"hvs",label:t.pages.hvs},{id:"students",label:t.pages.students},
    {id:"teachers",label:t.pages.teachers},{id:"hifz",label:t.pages.hifz},{id:"houses",label:t.pages.houses},
    {id:"timetable",label:t.pages.timetable},{id:"fees",label:t.pages.fees},{id:"results",label:t.pages.results},
    {id:"events",label:t.pages.events},{id:"attendance",label:t.pages.attendance},{id:"notifications",label:t.pages.notifications},
    {id:"library",label:t.pages.library},{id:"salary",label:t.pages.salary},{id:"exams",label:t.pages.exams},
    {id:"transport",label:t.pages.transport},{id:"tarbiyah",label:t.pages.tarbiyah},{id:"superhouse",label:t.pages.superhouse},
    {id:"hpri",label:t.pages.hpri},{id:"registrar",label:t.pages.registrar},
    {id:"noticeboard",label:t.pages.noticeboard},{id:"hostel",label:t.pages.hostel},
    {id:"health",label:t.pages.health},{id:"madrasa",label:t.pages.madrasa},
    {id:"donations",label:t.pages.donations},{id:"meetings",label:t.pages.meetings},
    {id:"assets",label:t.pages.assets},{id:"staffperf",label:t.pages.staffperf},
    {id:"parents",label:t.pages.parents},{id:"director",label:t.pages.director},
    {id:"alumni",label:t.pages.alumni},{id:"visitors",label:t.pages.visitors},
    {id:"seating",label:t.pages.seating},{id:"faculty_dev",label:t.pages.faculty_dev},
    {id:"curriculum",label:t.pages.curriculum},{id:"marks",label:t.pages.marks},
    {id:"reportcard",label:t.pages.reportcard},{id:"dmc",label:t.pages.dmc},{id:"welfare",label:t.pages.welfare},
    {id:"pride",label:t.pages.pride},{id:"wifaq",label:t.pages.wifaq},
    {id:"ethics",label:t.pages.ethics},
    {id:"lessons",label:t.pages.lessons},{id:"analytics",label:t.pages.analytics},
    {id:"transcript",label:t.pages.transcript},{id:"leave",label:t.pages.leave},
    {id:"slips",label:t.pages.slips},{id:"lmaterials",label:t.pages.lmaterials},
  ];

  const uName=DEMO.find(d=>d.email===user?.email)?.name||user?.email||"";
  const uRole=DEMO.find(d=>d.email===user?.email)?.role||"teacher";
  const allowedPages=ROLE_PAGES[uRole]??ROLE_PAGES.teacher;
  const canAccess=(pid)=>allowedPages===null||allowedPages.includes(pid);
  const visibleNavGroups=NAV_GROUPS.map(g=>({...g,pages:g.pages.filter(p=>canAccess(p.id))})).filter(g=>g.pages.length>0);
  const pendingFeesCount=fees.filter(f=>f.status==="pending").length;

  if(loading)return <div style={{...S.lp,color:C.white,fontSize:"1rem",flexDirection:"column",gap:"16px"}}><div style={{fontSize:"2rem"}}>☪</div>{TRANS[lang].loading}</div>;
  if(!user)return <Login onLogin={login} err={err} loading={lLoading}/>;

  return <div style={S.app}>
    <style>{`
      .hamburger-btn { display: none !important; }
      .desktop-nav { display: flex !important; }
      @media (max-width: 767px) {
        .hamburger-btn { display: flex !important; }
        .desktop-nav { display: none !important; }
        .hdr-lang { display: none !important; }
        .hdr-fees { display: none !important; }
      }
    `}</style>
    <div style={S.hdr}>
      <div className="hv-brand" style={{display:"flex",alignItems:"center",gap:"12px"}}>
        <AIILogo size={40}/>
        <div><div style={{color:C.gold,fontSize:"1.05rem",fontWeight:"800"}}>{t.appName}</div><div style={{color:"rgba(255,255,255,0.5)",fontSize:"0.6rem",fontFamily:"'Cinzel',serif",letterSpacing:"0.08em"}}>AMEEN ISLAMIC INSTITUTE • SWAT</div></div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:"12px",flexWrap:"wrap",justifyContent:"flex-end"}}>
        <div className="hdr-fees">{pendingFeesCount>0&&<div style={{background:C.amber+"20",border:`1px solid ${C.amber}`,borderRadius:"20px",padding:"5px 12px",fontSize:"0.7rem",color:C.amber,fontWeight:"700"}}>💰 {pendingFeesCount} {t.feesPending}</div>}</div>
        <div style={{textAlign:"left",direction:"ltr"}}><div style={{color:C.gold,fontSize:"0.75rem",fontWeight:"600"}}>{uName}</div><div style={{color:"rgba(255,255,255,0.5)",fontSize:"0.62rem"}}>{uRole}</div></div>
        <div className="hdr-lang" style={{display:"flex",gap:"4px"}}>
        {["ur","en","ar"].map(l=><button key={l} onClick={()=>setLang(l)} style={{background:lang===l?"rgba(212,175,55,0.3)":"rgba(255,255,255,0.1)",color:lang===l?"#d4af37":"rgba(255,255,255,0.7)",border:`1px solid ${lang===l?"#d4af37":"rgba(255,255,255,0.2)"}`,borderRadius:"8px",padding:"5px 10px",fontSize:"0.65rem",cursor:"pointer",fontWeight:"700"}}>{l==="ur"?"اردو":l==="en"?"EN":"عربي"}</button>)}
        </div>
        <button style={{background:"rgba(255,255,255,0.1)",color:"rgba(255,255,255,0.85)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:"10px",padding:"8px 16px",fontSize:"0.72rem",cursor:"pointer",fontFamily:"inherit",fontWeight:"600"}} onClick={logout}>{t.logout}</button>
        <button className="hamburger-btn" onClick={()=>setMobileOpen(true)} style={{alignItems:"center",justifyContent:"center",width:"38px",height:"38px",borderRadius:"10px",border:"1px solid rgba(255,255,255,0.2)",background:"rgba(255,255,255,0.1)",color:"#fff",fontSize:"1.3rem",cursor:"pointer",flexShrink:0}}>☰</button>
      </div>
    </div>
  <div className="desktop-nav" style={{background:C.white,borderBottom:`3px solid ${C.goldLight}`,flexWrap:"wrap",padding:"0 6px",boxShadow:"0 2px 8px rgba(0,0,0,0.05)",position:"sticky",top:"56px",zIndex:99}} onClick={e=>e.stopPropagation()}>
  {visibleNavGroups.map(grp=>{
    const isOpen=openGroup===grp.id;
    const isActive=grp.pages.some(p=>p.id===page);
    return <div key={grp.id} style={{position:"relative"}}>
      <button onClick={()=>setOpenGroup(isOpen?null:grp.id)} style={{padding:"11px 14px",border:"none",background:"none",color:isActive?grp.color:"#666",fontWeight:isActive?"800":"600",fontSize:"0.78rem",cursor:"pointer",borderBottom:isActive?`3px solid ${grp.color}`:"3px solid transparent",fontFamily:"inherit",whiteSpace:"nowrap",transition:"color 0.2s",display:"flex",alignItems:"center",gap:"5px"}}>
        {grp.label}<span style={{fontSize:"0.55rem",opacity:0.6}}>{isOpen?"▲":"▼"}</span>
      </button>
      {isOpen&&<div style={{position:"absolute",top:"100%",right:0,background:C.white,borderRadius:"14px",boxShadow:"0 8px 32px rgba(0,0,0,0.15)",border:`2px solid ${grp.color}20`,minWidth:"170px",zIndex:200,padding:"8px",display:"flex",flexDirection:"column",gap:"2px"}}>
        {grp.pages.map(p=><button key={p.id} onClick={()=>{setPage(p.id);setOpenGroup(null);}} style={{padding:"10px 14px",border:"none",background:page===p.id?`${grp.color}15`:C.white,color:page===p.id?grp.color:"#444",fontWeight:page===p.id?"700":"400",fontSize:"0.75rem",cursor:"pointer",borderRadius:"10px",fontFamily:"inherit",textAlign:"right",whiteSpace:"nowrap"}}>{p.label}</button>)}
      </div>}
    </div>;
  })}
</div>
    {/* Mobile sidebar overlay */}
    {mobileOpen&&<div style={{position:"fixed",inset:0,zIndex:500,background:"rgba(0,0,0,0.65)"}} onClick={()=>setMobileOpen(false)}>
      <div style={{position:"absolute",right:0,top:0,bottom:0,width:"82%",maxWidth:"320px",background:"#0f172a",overflowY:"auto",display:"flex",flexDirection:"column",boxShadow:"-4px 0 24px rgba(0,0,0,0.4)"}} onClick={e=>e.stopPropagation()}>
        {/* Sidebar header */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 18px",borderBottom:"1px solid rgba(255,255,255,0.1)",background:"rgba(212,175,55,0.08)"}}>
          <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
            <AIILogo size={32}/>
            <div style={{color:"#d4af37",fontSize:"0.85rem",fontWeight:"800"}}>{t.appName}</div>
          </div>
          <button onClick={()=>setMobileOpen(false)} style={{background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:"8px",color:"#fff",fontSize:"1.1rem",width:"32px",height:"32px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
        </div>
        {/* User info */}
        <div style={{padding:"14px 18px",borderBottom:"1px solid rgba(255,255,255,0.07)",display:"flex",alignItems:"center",gap:"10px"}}>
          <div style={{width:"36px",height:"36px",borderRadius:"50%",background:"rgba(212,175,55,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1rem"}}>👤</div>
          <div><div style={{color:"#d4af37",fontSize:"0.8rem",fontWeight:"700"}}>{uName}</div><div style={{color:"rgba(255,255,255,0.4)",fontSize:"0.65rem"}}>{uRole}</div></div>
          {pendingFeesCount>0&&<div style={{marginRight:"auto",background:C.amber+"20",border:`1px solid ${C.amber}`,borderRadius:"16px",padding:"3px 10px",fontSize:"0.62rem",color:C.amber,fontWeight:"700"}}>💰 {pendingFeesCount}</div>}
        </div>
        {/* Nav groups accordion */}
        <div style={{flex:1,padding:"10px 10px",overflowY:"auto"}}>
          {visibleNavGroups.map(grp=>{
            const isExpanded=mobileGroup===grp.id;
            const isActive=grp.pages.some(p=>p.id===page);
            return <div key={grp.id} style={{marginBottom:"4px"}}>
              <button onClick={()=>setMobileGroup(isExpanded?null:grp.id)} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"11px 14px",borderRadius:"10px",border:"none",background:isActive?`${grp.color}20`:"rgba(255,255,255,0.04)",color:isActive?grp.color:"rgba(255,255,255,0.75)",fontWeight:isActive?"800":"600",fontSize:"0.82rem",cursor:"pointer",fontFamily:"inherit",textAlign:"right"}}>
                <span style={{fontSize:"0.55rem",opacity:0.6}}>{isExpanded?"▲":"▼"}</span>
                <span>{grp.label}</span>
              </button>
              {isExpanded&&<div style={{marginTop:"3px",paddingRight:"8px",display:"flex",flexDirection:"column",gap:"2px"}}>
                {grp.pages.map(p=><button key={p.id} onClick={()=>{setPage(p.id);setMobileOpen(false);setMobileGroup(null);}} style={{padding:"10px 14px",border:"none",background:page===p.id?`${grp.color}25`:"rgba(255,255,255,0.03)",color:page===p.id?grp.color:"rgba(255,255,255,0.55)",fontWeight:page===p.id?"700":"400",fontSize:"0.78rem",cursor:"pointer",borderRadius:"9px",fontFamily:"inherit",textAlign:"right",borderRight:page===p.id?`3px solid ${grp.color}`:"3px solid transparent"}}>{p.label}</button>)}
              </div>}
            </div>;
          })}
        </div>
        {/* Language switcher + logout at bottom */}
        <div style={{padding:"14px 16px",borderTop:"1px solid rgba(255,255,255,0.08)",display:"flex",flexDirection:"column",gap:"10px"}}>
          <div style={{display:"flex",gap:"6px",justifyContent:"center"}}>
            {["ur","en","ar"].map(l=><button key={l} onClick={()=>setLang(l)} style={{flex:1,background:lang===l?"rgba(212,175,55,0.25)":"rgba(255,255,255,0.07)",color:lang===l?"#d4af37":"rgba(255,255,255,0.6)",border:`1px solid ${lang===l?"#d4af37":"rgba(255,255,255,0.15)"}`,borderRadius:"8px",padding:"7px 4px",fontSize:"0.68rem",cursor:"pointer",fontWeight:"700"}}>{l==="ur"?"اردو":l==="en"?"EN":"عربي"}</button>)}
          </div>
          <button onClick={()=>{logout();setMobileOpen(false);}} style={{width:"100%",padding:"10px",borderRadius:"10px",border:"1px solid rgba(255,255,255,0.15)",background:"rgba(255,255,255,0.07)",color:"rgba(255,255,255,0.8)",fontSize:"0.78rem",cursor:"pointer",fontFamily:"inherit",fontWeight:"600"}}>{t.logout} ↩</button>
        </div>
      </div>
    </div>}
    <div style={{flex:1,overflowY:"auto",overflowX:"hidden"}}>
      {!canAccess(page)&&<div style={{padding:"60px",textAlign:"center",color:C.red,fontSize:"1.1rem",fontWeight:"700"}}>⛔ آپ کو اس صفحے تک رسائی نہیں ہے</div>}
      {canAccess(page)&&<>
      {page==="dashboard"&&<Dashboard students={students} teachers={teachers} houses={houses} hvsLogs={hvs} fees={fees} results={results} setPage={setPage}/>}
      {page==="hvs"&&<HVSEntry students={students} houses={houses} addData={addData} updateHousePoints={updateHousePoints}/>}
      {page==="students"&&<Students students={students} addData={addData} results={results} fees={fees} hifzLogs={hifzLogs}/>}
      {page==="teachers"&&<Teachers teachers={teachers} addData={addData}/>}
      {page==="hifz"&&<Hifz students={students} addData={addData} hifzLogs={hifzLogs}/>}
      {page==="houses"&&<Houses houses={houses} hvsLogs={hvs} students={students}/>}
      {page==="timetable"&&<Timetable/>}
      {page==="fees"&&<FeeManagement students={students} addData={addData}/>}
      {page==="results"&&<Results students={students} addData={addData}/>}
      {page==="events"&&<Events addData={addData} houses={houses} updateHousePoints={updateHousePoints}/>}
      {page==="attendance"&&<Attendance students={students} addData={addData} teachers={teachers}/>}
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
      {page==="dmc"&&<DMC students={students} results={results} fees={fees}/>}
      {page==="welfare"&&<WelfareFeedback students={students} addData={addData}/>}
      {page==="pride"&&<PrideMessages students={students} teachers={teachers} addData={addData}/>}
      {page==="wifaq"&&<WifaqCompliance addData={addData}/>}
      {page==="ethics"&&<TarbiyahEthics students={students} addData={addData}/>}
      {page==="lessons"&&<LessonPlans teachers={teachers} addData={addData}/>}
      {page==="analytics"&&<ClassAnalytics students={students} results={results}/>}
      {page==="transcript"&&<TranscriptRequest students={students} addData={addData}/>}
      {page==="leave"&&<TeacherLeave teachers={teachers} addData={addData}/>}
      {page==="slips"&&<SalarySlips teachers={teachers} addData={addData}/>}
      {page==="lmaterials"&&<LearningMaterials teachers={teachers} addData={addData}/>}
      {page==="reports"&&<Reports students={students} teachers={teachers} houses={houses} hvsLogs={hvs} fees={fees} results={results}/>}
      </>}
    </div>
  </div>;
}
