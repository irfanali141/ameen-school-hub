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
import EvaluationScales from "./components/academic/EvaluationScales";
import EvaluationCenter from "./components/evaluation/EvaluationCenter";
import ClassesAndSections from "./components/academic/ClassesAndSections";
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
import WeeklyDutyChecklist from "./components/houses/WeeklyDutyChecklist";
import GrandTotalDashboard from "./components/houses/GrandTotalDashboard";
import SuperHouseAnnual from "./components/houses/SuperHouseAnnual";
import InvestigationHub from "./components/houses/InvestigationHub";
import InvestigationCase from "./components/houses/InvestigationCase";
import IncidentLog from "./components/houses/IncidentLog";
import WeaknessMatrix from "./components/houses/WeaknessMatrix";
import MonthlyPlanner from "./components/houses/MonthlyPlanner";
import SocietySystem from "./components/houses/SocietySystem";
import LeadershipRoles from "./components/houses/LeadershipRoles";
import HouseTemplates from "./components/houses/HouseTemplates";
import HouseBazaar from "./components/houses/HouseBazaar";
import SitaraAmeen from "./components/houses/SitaraAmeen";
import Phase2Plan from "./components/admin/Phase2Plan";
import WatchList from "./components/houses/WatchList";
import HouseReportingChain from "./components/houses/HouseReportingChain";

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
import ReportingChain from "./components/admin/ReportingChain";

// Portal components
import ParentPortal from "./components/portals/ParentPortal";
import DirectorPortal from "./components/portals/DirectorPortal";
import AlumniPortal from "./components/portals/AlumniPortal";
import ParentMessaging from "./components/portals/ParentMessaging";
import HomeworkHub      from "./components/academic/HomeworkHub";
import AIAssistant     from "./components/ai/AIAssistant";
import QuizHub         from "./components/academic/QuizHub";
import SchemeOfStudies from "./components/academic/SchemeOfStudies";
import AcademicCalendar from "./components/academic/AcademicCalendar";
import TermBreakup     from "./components/academic/TermBreakup";
import SchoolDecorPlans from "./components/admin/SchoolDecorPlans";
import ChatSystem      from "./components/communication/ChatSystem";
import ETube           from "./components/academic/ETube";
import AICommandCenter from "./components/ai/AICommandCenter";

// Welfare components
import StudentHealth from "./components/welfare/StudentHealth";
import WelfareFeedback from "./components/welfare/WelfareFeedback";
import PrideMessages from "./components/welfare/PrideMessages";
import HPRISystem from "./components/welfare/HPRISystem";

// Madrasa components
import MadrasaModule from "./components/madrasa/MadrasaModule";

// Utility components
import NotificationBell from "./components/NotificationBell";


// ===================== TRANSLATIONS =====================
const TRANS = {
  ur: {
    dir: "rtl",
    appName: "امین اسکول ہب",
    logout: "لاگ آؤٹ",
    feesPending: "فیس باقی",
    loading: "لوڈ ہو رہا ہے...",
    nav: {
      main: "🏠 مرکزی", talba: "🎓 طلبہ", house: "🏆 گھر",
      asatza: "👨‍🏫 اساتذہ", taleem: "📚 تعلیم", idara: "🏛️ انتظامیہ"
    },
    pages: {
      dashboard:"📊 ڈیش بورڈ", attendance:"✅ حاضری", timetable:"🗓️ ٹائم ٹیبل",
      notifications:"📱 اطلاعات", noticeboard:"📌 نوٹس بورڈ", events:"🎭 ایونٹس",
      classrooms:"🏫 جماعتیں و شعبے", students:"🎓 طلبہ", hifz:"📖 حفظ", results:"📊 نتائج", marks:"✏️ نمبرات",
      reportcard:"📋 رپورٹ کارڈ", dmc:"🎓 DMC", transcript:"📜 ٹرانسکرپٹ", evaluationscales:"🎯 تشخیصی پیمانے",
      evalcenter:"📊 تشخیص و HVS",
      welfare:"💬 طلبہ فلاح", hpri:"⚠️ HPRI", health:"🏥 صحت",
      hostel:"🏠 ہوسٹل", transport:"🚌 ٹرانسپورٹ", houses:"🏠 گھر",
      hvs:"🏅 HVS", superhouse:"🏆 سپر ہاوس", duties:"📋 ڈیوٹی چیک لسٹ", grandtotal:"🏆 ۳۰۰ مارکس", superannual:"🏆 سالانہ ۴۰۰", tarbiyah:"🌟 تربیت",
      ethics:"🌟 اخلاق", pride:"💌 پرائیڈ", teachers:"👨‍🏫 اساتذہ",
      salary:"💼 تنخواہ", slips:"💳 تنخواہ سلپ", leave:"🏖️ چھٹی",
      staffperf:"📊 اسٹاف کارکردگی", faculty_dev:"👩‍🏫 اساتذہ ترقی", lessons:"📅 سبق منصوبہ",
      curriculum:"📚 نصابی وسائل", lmaterials:"📚 تعلیمی مواد", exams:"📝 امتحانات",
      seating:"🪑 نشست بندی", analytics:"📊 تجزیہ", library:"📚 کتب خانہ",
      madrasa:"🕌 درس نظامی", wifaq:"🕌 وفاق", fees:"💰 فیس", madrasaustad:"🕌 مدرسہ استاد", hifzdashboard:"📖 حفظ ڈیش بورڈ",
      director:"👨‍💼 ڈائریکٹر", registrar:"📋 رجسٹرار", parents:"👪 والدین",
      alumni:"🎓 سابق طلبہ", visitors:"🔒 سیکیورٹی", meetings:"📝 ملاقاتیں",
      assets:"🏗️ اثاثے", donations:"🤲 عطیات",
      reports:"📊 رپورٹس", reportchain:"🏛️ رپورٹنگ چین", housereportchain:"🏛️ گھر رپورٹنگ چین", investigationhub:"🔬 تحقیقاتی ہب", invcase:"⚖️ تحقیقاتی کیس", incidentlog:"📝 واقعہ نامہ", weaknessmatrix:"📊 کمزوری میٹرکس", monthlyplanner:"📅 ماہانہ منصوبہ", societysystem:"🏛️ سوسائٹی سسٹم", leadershiproles:"👑 قیادت و کردار", housetemplates:"📋 گھر ٹیمپلیٹس", housebazaar:"🏪 گھر بازار", sitaraameen:"🌟 ستارہ امین", phase2plan:"🚀 فیز ۲ منصوبہ", watchlist:"👁️ واچ لسٹ",
      messaging:"💬 والدین پیغامات",
      homeworkhub:"📝 ہوم ورک",
      aiassistant:"✨ AI معاون",
      quizhub:"📝 آن لائن ٹیسٹ",
      schemeofstudies:"📋 اسکیم آف اسٹڈیز",
      academiccalendar:"📅 تعلیمی کیلنڈر",
      termbreakup:"🗓️ ٹرم تقسیم",
      schooldecor:"🎨 اسکول سجاوٹ",
      chat:"💬 چیٹ",
      etube:"📺 E-Tube",
      aicommand:"🤖 AI کمانڈ"
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
      classrooms:"🏫 Classes & Sections", students:"🎓 Students", hifz:"📖 Hifz", results:"📊 Results", marks:"✏️ Marks",
      reportcard:"📋 Report Card", dmc:"🎓 DMC", transcript:"📜 Transcript", evaluationscales:"🎯 Evaluation Scales",
      evalcenter:"📊 Evaluation & HVS",
      welfare:"💬 Welfare", hpri:"⚠️ HPRI", health:"🏥 Health",
      hostel:"🏠 Hostel", transport:"🚌 Transport", houses:"🏠 Houses",
      hvs:"🏅 HVS", superhouse:"🏆 Super House", duties:"📋 Duty Checklist", grandtotal:"🏆 Grand 300", superannual:"🏆 Annual 400", tarbiyah:"🌟 Tarbiyah",
      ethics:"🌟 Ethics", pride:"💌 Pride", teachers:"👨‍🏫 Teachers",
      salary:"💼 Salary", slips:"💳 Salary Slips", leave:"🏖️ Leave",
      staffperf:"📊 Staff", faculty_dev:"👩‍🏫 Faculty Dev", lessons:"📅 Lesson Plans",
      curriculum:"📚 Curriculum", lmaterials:"📚 Materials", exams:"📝 Exams",
      seating:"🪑 Seating", analytics:"📊 Analytics", library:"📚 Library",
      madrasa:"🕌 Madrasa", wifaq:"🕌 Wifaq", fees:"💰 Fees", madrasaustad:"🕌 Madrasa Ustad", hifzdashboard:"📖 Hifz Dashboard",
      director:"👨‍💼 Director", registrar:"📋 Registrar", parents:"👪 Parents",
      alumni:"🎓 Alumni", visitors:"🔒 Visitors", meetings:"📝 Meetings",
      assets:"🏗️ Assets", donations:"🤲 Donations",
      reports:"📊 Reports", reportchain:"🏛️ Reporting Chain", housereportchain:"🏛️ House Reporting Chain", investigationhub:"🔬 Investigation Hub", invcase:"⚖️ Investigation Case", incidentlog:"📝 Incident Log", weaknessmatrix:"📊 Weakness Matrix", monthlyplanner:"📅 Monthly Planner", societysystem:"🏛️ Society System", leadershiproles:"👑 Leadership & Roles", housetemplates:"📋 House Templates", housebazaar:"🏪 House Bazaar", sitaraameen:"🌟 Sitara-e-Ameen", phase2plan:"🚀 Phase 2 Plan", watchlist:"👁️ Watch List",
      messaging:"💬 Parent Messages",
      homeworkhub:"📝 Homework",
      aiassistant:"✨ AI Assistant",
      quizhub:"📝 Online Quiz",
      schemeofstudies:"📋 Scheme of Studies",
      academiccalendar:"📅 Academic Calendar",
      termbreakup:"🗓️ Term Breakup",
      schooldecor:"🎨 School Decor Plans",
      chat:"💬 Chat",
      etube:"📺 E-Tube",
      aicommand:"🤖 AI Command"
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
      classrooms:"🏫 الفصول والشعب", students:"🎓 الطلاب", hifz:"📖 الحفظ", results:"📊 النتائج", marks:"✏️ الدرجات",
      reportcard:"📋 كشف الدرجات", dmc:"🎓 DMC", transcript:"📜 السجل", evaluationscales:"🎯 مقاييس التقييم",
      evalcenter:"📊 التقييم و HVS",
      welfare:"💬 الرعاية", hpri:"⚠️ HPRI", health:"🏥 الصحة",
      hostel:"🏠 السكن", transport:"🚌 المواصلات", houses:"🏠 البيوت",
      hvs:"🏅 HVS", superhouse:"🏆 سوبر هاوس", duties:"📋 قائمة الواجبات", grandtotal:"🏆 المجموع 300", superannual:"🏆 السنوي 400", tarbiyah:"🌟 التربية",
      ethics:"🌟 الأخلاق", pride:"💌 الفخر", teachers:"👨‍🏫 المعلمون",
      salary:"💼 الراتب", slips:"💳 قسائم الراتب", leave:"🏖️ الإجازة",
      staffperf:"📊 الأداء", faculty_dev:"👩‍🏫 تطوير الكادر", lessons:"📅 خطط الدروس",
      curriculum:"📚 المناهج", lmaterials:"📚 المواد", exams:"📝 الامتحانات",
      seating:"🪑 ترتيب الجلوس", analytics:"📊 التحليل", library:"📚 المكتبة",
      madrasa:"🕌 المدرسة", wifaq:"🕌 الوفاق", fees:"💰 الرسوم", madrasaustad:"🕌 استاذ المدرسة", hifzdashboard:"📖 لوحة الحفظ",
      director:"👨‍💼 المدير", registrar:"📋 المسجل", parents:"👪 الآباء",
      alumni:"🎓 الخريجون", visitors:"🔒 الزوار", meetings:"📝 الاجتماعات",
      assets:"🏗️ الأصول", donations:"🤲 التبرعات",
      reports:"📊 التقارير", reportchain:"🏛️ سلسلة التقارير", housereportchain:"🏛️ سلسلة تقارير البيت", investigationhub:"🔬 مركز التحقيق", invcase:"⚖️ قضية التحقيق", incidentlog:"📝 سجل الحوادث", weaknessmatrix:"📊 مصفوفة الضعف", monthlyplanner:"📅 المخطط الشهري", societysystem:"🏛️ نظام الجمعيات", leadershiproles:"👑 القيادة والأدوار", housetemplates:"📋 نماذج البيوت", housebazaar:"🏪 سوق البيت", sitaraameen:"🌟 نجمة الأمين", phase2plan:"🚀 خطة المرحلة 2", watchlist:"👁️ قائمة المراقبة",
      messaging:"💬 رسائل الوالدين",
      homeworkhub:"📝 الواجبات",
      aiassistant:"✨ المساعد الذكي",
      quizhub:"📝 الاختبار الإلكتروني",
      schemeofstudies:"📋 مخطط الدراسة",
      academiccalendar:"📅 التقويم الأكاديمي",
      termbreakup:"🗓️ تقسيم الفصول",
      schooldecor:"🎨 خطط الديكور",
      chat:"💬 الدردشة",
      etube:"📺 E-Tube",
      aicommand:"🤖 مركز الأوامر"
    }
  }
};
// ===================== MAIN APP =====================
export default function App(){
  const [user,setUser]=useState(null); const [loading,setLoading]=useState(true);
  const [err,setErr]=useState(""); const [lLoading,setLL]=useState(false);
  const [page,setPageState]=useState(()=>{const h=window.location.hash.slice(1);return h||"dashboard";});
  const setPage=(p)=>{window.location.hash=p;setPageState(p);};
  const [openGroup, setOpenGroup] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileGroup, setMobileGroup] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [lang, setLang] = useState("en");
  const [students,setStudents]=useState([]); const [teachers,setTeachers]=useState([]);
  const [houses,setHouses]=useState([]); const [hvs,setHvs]=useState([]);
  const [fees,setFees]=useState([]); const [results,setResults]=useState([]); const [hifzLogs,setHifzLogs]=useState([]);
  const [dbClasses,setDbClasses]=useState([]); const [dbSections,setDbSections]=useState([]);

  useEffect(()=>{ return onAuthStateChanged(async u=>{ setUser(u); setLoading(false); if(u){ await seedDB(); } }); },[]);
  useEffect(()=>{const onHash=()=>{const p=window.location.hash.slice(1)||"dashboard";setPageState(p);};window.addEventListener("hashchange",onHash);return()=>window.removeEventListener("hashchange",onHash);},[]);
  useEffect(()=>{
    if(!user)return;
    const demoRole=DEMO.find(d=>d.email===user?.email)?.role;
    const inferredRole = user?.email?.toLowerCase().includes("housemaster") ? "housemaster"
                       : user?.email?.toLowerCase().includes("madrasa")     ? "madrasa"
                       : undefined;
    const role = demoRole || inferredRole || "teacher";
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
    const s8=subscribeToTable("classes",setDbClasses); const s9=subscribeToTable("sections",setDbSections);
    return()=>{s1();s2();s3();s4();s5();s6();s7();s8();s9();};
  },[user]);

  const login=async(email,pass)=>{ setLL(true); setErr(""); const demoUser=DEMO.find(d=>d.email===email&&d.password===pass); try{ try{ await signInWithEmailAndPassword(email,pass); }catch{ await createUserWithEmailAndPassword(email,pass); } }catch(e){ if(demoUser){ setUser({email,id:email}); setLoading(false); }else{ setErr("Invalid email or password"); } } setLL(false); };
  const logout=()=>signOut();
  const addData=async(col,data)=>{ try{ await sbAddData(col,data); }catch(e){ console.error("addData:",e.message); } };
  const updateHousePoints=async(houseId,pts)=>{ try{ const hd=houses.find(h=>h.id===houseId); if(!hd) return; await updateData("houses",houseId,{points:(hd.points||0)+pts,hvs_total:(hd.hvs_total||0)+pts,hvs_weeks:(hd.hvs_weeks||0)+1}); }catch(e){} };
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
      {id:"classrooms",label:t.pages.classrooms},
      {id:"students",label:t.pages.students},
      {id:"homeworkhub",label:t.pages.homeworkhub},
      {id:"results",label:t.pages.results},
      {id:"marks",label:t.pages.marks},
      {id:"reportcard",label:t.pages.reportcard},
      {id:"dmc",label:t.pages.dmc},
      {id:"evalcenter",label:t.pages.evalcenter},
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
      {id:"superhouse",label:t.pages.superhouse},
      {id:"duties",label:t.pages.duties},
      {id:"grandtotal",label:t.pages.grandtotal},
      {id:"superannual",label:t.pages.superannual},
      {id:"investigationhub",label:t.pages.investigationhub},
      {id:"invcase",label:t.pages.invcase},
      {id:"incidentlog",label:t.pages.incidentlog},
      {id:"weaknessmatrix",label:t.pages.weaknessmatrix},
      {id:"monthlyplanner",label:t.pages.monthlyplanner},
      {id:"societysystem",label:t.pages.societysystem},
      {id:"leadershiproles",label:t.pages.leadershiproles},
      {id:"housetemplates",label:t.pages.housetemplates},
      {id:"housebazaar",label:t.pages.housebazaar},
      {id:"sitaraameen",label:t.pages.sitaraameen},
      {id:"tarbiyah",label:t.pages.tarbiyah},
      {id:"ethics",label:t.pages.ethics},
      {id:"pride",label:t.pages.pride},
      {id:"watchlist",label:t.pages.watchlist},
      {id:"housereportchain",label:t.pages.housereportchain},
    ]
  },
  {
    id: "asatza", label: "👨‍🏫 Teachers", color: "#7c3aed",
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
      {id:"fees",label:t.pages.fees},
      {id:"reports",label:t.pages.reports},
      {id:"aiassistant",label:t.pages.aiassistant},
      {id:"quizhub",label:t.pages.quizhub},
      {id:"schemeofstudies",label:t.pages.schemeofstudies},
      {id:"academiccalendar",label:t.pages.academiccalendar},
      {id:"termbreakup",label:t.pages.termbreakup},
      {id:"etube",label:t.pages.etube},
      {id:"aicommand",label:t.pages.aicommand},
    ]
  },
  {
    id: "idara", label: t.nav.idara, color: "#991b1b",
    pages: [
      {id:"director",label:t.pages.director},
      {id:"registrar",label:t.pages.registrar},
      {id:"reportchain",label:t.pages.reportchain},
      {id:"parents",label:t.pages.parents},
      {id:"messaging",label:t.pages.messaging},
      {id:"alumni",label:t.pages.alumni},
      {id:"visitors",label:t.pages.visitors},
      {id:"meetings",label:t.pages.meetings},
      {id:"assets",label:t.pages.assets},
      {id:"donations",label:t.pages.donations},
      {id:"phase2plan",label:t.pages.phase2plan},
      {id:"schooldecor",label:t.pages.schooldecor},
      {id:"chat",label:t.pages.chat},
    ]
  },
];
  const PAGES=[
    {id:"classrooms",label:t.pages.classrooms},{id:"dashboard",label:t.pages.dashboard},{id:"hvs",label:t.pages.hvs},{id:"students",label:t.pages.students},
    {id:"teachers",label:t.pages.teachers},{id:"hifz",label:t.pages.hifz},{id:"houses",label:t.pages.houses},
    {id:"timetable",label:t.pages.timetable},{id:"fees",label:t.pages.fees},{id:"results",label:t.pages.results},
    {id:"events",label:t.pages.events},{id:"attendance",label:t.pages.attendance},{id:"notifications",label:t.pages.notifications},
    {id:"library",label:t.pages.library},{id:"salary",label:t.pages.salary},{id:"exams",label:t.pages.exams},
    {id:"transport",label:t.pages.transport},{id:"tarbiyah",label:t.pages.tarbiyah},{id:"superhouse",label:t.pages.superhouse},{id:"duties",label:t.pages.duties},{id:"grandtotal",label:t.pages.grandtotal},{id:"superannual",label:t.pages.superannual},{id:"investigationhub",label:t.pages.investigationhub},{id:"invcase",label:t.pages.invcase},{id:"incidentlog",label:t.pages.incidentlog},{id:"weaknessmatrix",label:t.pages.weaknessmatrix},{id:"monthlyplanner",label:t.pages.monthlyplanner},{id:"societysystem",label:t.pages.societysystem},{id:"leadershiproles",label:t.pages.leadershiproles},{id:"housetemplates",label:t.pages.housetemplates},{id:"housebazaar",label:t.pages.housebazaar},{id:"sitaraameen",label:t.pages.sitaraameen},
    {id:"hpri",label:t.pages.hpri},{id:"registrar",label:t.pages.registrar},
    {id:"noticeboard",label:t.pages.noticeboard},{id:"hostel",label:t.pages.hostel},
    {id:"health",label:t.pages.health},{id:"madrasa",label:t.pages.madrasa},{id:"madrasaustad",label:t.pages.madrasaustad},
    {id:"donations",label:t.pages.donations},{id:"meetings",label:t.pages.meetings},
    {id:"assets",label:t.pages.assets},{id:"staffperf",label:t.pages.staffperf},
    {id:"parents",label:t.pages.parents},{id:"director",label:t.pages.director},
    {id:"reportchain",label:t.pages.reportchain},
    {id:"alumni",label:t.pages.alumni},{id:"visitors",label:t.pages.visitors},
    {id:"seating",label:t.pages.seating},{id:"faculty_dev",label:t.pages.faculty_dev},
    {id:"curriculum",label:t.pages.curriculum},{id:"marks",label:t.pages.marks},
    {id:"reportcard",label:t.pages.reportcard},{id:"dmc",label:t.pages.dmc},{id:"evaluationscales",label:t.pages.evaluationscales},{id:"evalcenter",label:t.pages.evalcenter},{id:"welfare",label:t.pages.welfare},
    {id:"pride",label:t.pages.pride},
    {id:"ethics",label:t.pages.ethics},
    {id:"lessons",label:t.pages.lessons},{id:"analytics",label:t.pages.analytics},
    {id:"transcript",label:t.pages.transcript},{id:"leave",label:t.pages.leave},
    {id:"slips",label:t.pages.slips},{id:"lmaterials",label:t.pages.lmaterials},
    {id:"phase2plan",label:t.pages.phase2plan},
    {id:"watchlist",label:t.pages.watchlist},
    {id:"housereportchain",label:t.pages.housereportchain},
    {id:"messaging",label:t.pages.messaging},
    {id:"homeworkhub",label:t.pages.homeworkhub},
    {id:"aiassistant",label:t.pages.aiassistant},
    {id:"quizhub",label:t.pages.quizhub},
    {id:"schemeofstudies",label:t.pages.schemeofstudies},
    {id:"academiccalendar",label:t.pages.academiccalendar},
    {id:"termbreakup",label:t.pages.termbreakup},
    {id:"schooldecor",label:t.pages.schooldecor},
    {id:"chat",label:t.pages.chat},
    {id:"etube",label:t.pages.etube},
    {id:"aicommand",label:t.pages.aicommand},
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
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&family=Noto+Nastaliq+Urdu&display=swap');
      :root {
        --primary:#1B4332; --primary-light:#2D6A4F; --accent:#B8860B;
        --accent-light:#F0C040; --bg-main:#F8F6F0; --bg-card:#FFFFFF;
        --bg-dark:#0D2818; --text-primary:#1A1A2E; --text-secondary:#4A5568;
        --border:#E2D9C5; --shadow:rgba(27,67,50,0.12);
      }
      html,body,#root{height:100%;margin:0;padding:0;overflow:hidden;}
      body{font-family:'DM Sans','Segoe UI',Arial,sans-serif;}
      .aii-sidebar{width:240px;min-width:240px;transition:width 0.25s,min-width 0.25s;overflow:hidden;display:flex;flex-direction:column;flex-shrink:0;}
      .aii-sidebar.collapsed{width:0!important;min-width:0!important;}
      .hamburger-btn{display:none!important;}
      .aii-nav-item:hover{background:rgba(255,255,255,0.07)!important;}
      .aii-page-item:hover{background:rgba(184,134,11,0.14)!important;color:#F0C040!important;}
      .aii-card:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(27,67,50,0.14)!important;}
      @media(max-width:767px){
        .aii-sidebar{display:none!important;}
        .hamburger-btn{display:flex!important;}
        .sb-toggle{display:none!important;}
        .hdr-fees{display:none!important;}
      }
    `}</style>

    {/* ============ SIDEBAR ============ */}
    <div className={`aii-sidebar${sidebarCollapsed?" collapsed":""}`}
      style={{background:"#0D2818",height:"100vh",borderRight:"1px solid rgba(255,255,255,0.06)",zIndex:50}}>

      {/* Logo */}
      <div style={{padding:"16px 14px 12px",borderBottom:"1px solid rgba(255,255,255,0.07)",display:"flex",alignItems:"center",gap:"10px",flexShrink:0}}>
        <AIILogo size={32}/>
        <div style={{minWidth:0,overflow:"hidden"}}>
          <div style={{color:"#F0C040",fontSize:"0.95rem",fontWeight:"700",fontFamily:"'Playfair Display',Georgia,serif",whiteSpace:"nowrap"}}>{t.appName}</div>
          <div style={{color:"rgba(255,255,255,0.32)",fontSize:"0.68rem",fontFamily:"'Noto Nastaliq Urdu',serif",direction:"rtl",whiteSpace:"nowrap"}}>امین اسلامک</div>
        </div>
      </div>

      {/* User */}
      <div style={{padding:"10px 12px",borderBottom:"1px solid rgba(255,255,255,0.06)",display:"flex",alignItems:"center",gap:"9px",flexShrink:0}}>
        <div style={{width:32,height:32,borderRadius:"50%",background:"rgba(184,134,11,0.18)",border:"1.5px solid rgba(184,134,11,0.35)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.9rem",flexShrink:0}}>👤</div>
        <div style={{minWidth:0,flex:1}}>
          <div style={{color:"#F0C040",fontSize:"0.76rem",fontWeight:"700",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{uName||user?.email?.split("@")[0]}</div>
          <div style={{color:"rgba(255,255,255,0.38)",fontSize:"0.58rem",textTransform:"capitalize"}}>{uRole}</div>
        </div>
        {pendingFeesCount>0&&<div style={{background:"rgba(217,119,6,0.2)",border:"1px solid rgba(217,119,6,0.4)",borderRadius:"10px",padding:"2px 7px",fontSize:"0.58rem",color:"#f0a040",fontWeight:"700",flexShrink:0}}>💰{pendingFeesCount}</div>}
      </div>

      {/* Nav groups */}
      <div style={{flex:1,overflowY:"auto",padding:"6px 5px"}}>
        {visibleNavGroups.map(grp=>{
          const isExpanded=openGroup===grp.id;
          const isActive=grp.pages.some(p=>p.id===page);
          return <div key={grp.id} style={{marginBottom:"1px"}}>
            <button className="aii-nav-item" onClick={()=>setOpenGroup(isExpanded?null:grp.id)}
              style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",
                padding:"8px 10px",borderRadius:"7px",border:"none",
                background:isActive?"rgba(184,134,11,0.14)":"transparent",
                color:isActive?"#F0C040":"rgba(255,255,255,0.58)",
                fontWeight:isActive?"700":"500",fontSize:"0.79rem",cursor:"pointer",
                fontFamily:"inherit",textAlign:"left",
                borderLeft:isActive?"3px solid #B8860B":"3px solid transparent",
                transition:"all 0.14s"}}>
              <span style={{whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{grp.label}</span>
              <span style={{fontSize:"0.45rem",opacity:0.55,flexShrink:0,marginLeft:"4px",display:"inline-block",
                transform:isExpanded?"rotate(180deg)":"rotate(0deg)",transition:"transform 0.2s"}}>▼</span>
            </button>
            {isExpanded&&<div style={{marginTop:"1px",marginLeft:"8px",display:"flex",flexDirection:"column",gap:"1px"}}>
              {grp.pages.map(p=><button key={p.id} className="aii-page-item"
                onClick={()=>{setPage(p.id);setOpenGroup(null);}}
                style={{width:"100%",padding:"7px 10px",border:"none",
                  background:page===p.id?"rgba(184,134,11,0.18)":"transparent",
                  color:page===p.id?"#F0C040":"rgba(255,255,255,0.42)",
                  fontWeight:page===p.id?"700":"400",fontSize:"0.74rem",
                  cursor:"pointer",borderRadius:"6px",fontFamily:"inherit",textAlign:"left",
                  borderLeft:page===p.id?"2px solid #B8860B":"2px solid transparent",
                  transition:"all 0.12s",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
                {p.label}
              </button>)}
            </div>}
          </div>;
        })}
      </div>

      {/* Lang + Logout */}
      <div style={{padding:"8px 8px",borderTop:"1px solid rgba(255,255,255,0.07)",flexShrink:0}}>
        <div style={{display:"flex",gap:"3px",marginBottom:"7px"}}>
          {["ur","en","ar"].map(l=><button key={l} onClick={()=>setLang(l)}
            style={{flex:1,background:lang===l?"rgba(184,134,11,0.22)":"transparent",
              color:lang===l?"#F0C040":"rgba(255,255,255,0.4)",
              border:`1px solid ${lang===l?"#B8860B":"rgba(255,255,255,0.09)"}`,
              borderRadius:"5px",padding:"4px 2px",fontSize:"0.6rem",cursor:"pointer",fontWeight:"700",transition:"all 0.14s"}}>
            {l==="ur"?"اردو":l==="en"?"EN":"عربي"}
          </button>)}
        </div>
        <button onClick={logout}
          style={{width:"100%",padding:"8px",borderRadius:"7px",border:"1px solid rgba(255,255,255,0.09)",
            background:"rgba(255,255,255,0.04)",color:"rgba(255,255,255,0.5)",
            fontSize:"0.72rem",cursor:"pointer",fontFamily:"inherit",fontWeight:"600",transition:"background 0.14s"}}>
          {t.logout} ↩
        </button>
      </div>
    </div>

    {/* ============ MAIN COLUMN ============ */}
    <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0,overflow:"hidden"}}>

      {/* TOP BAR */}
      <div style={{background:"#FFFFFF",borderBottom:"1px solid #E2D9C5",padding:"0 18px",height:"52px",
        display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0,
        boxShadow:"0 1px 4px rgba(27,67,50,0.07)"}}>
        <div style={{display:"flex",alignItems:"center",gap:"10px",minWidth:0}}>
          <button className="sb-toggle" onClick={()=>setSidebarCollapsed(c=>!c)}
            style={{width:"30px",height:"30px",borderRadius:"7px",border:"1px solid #E2D9C5",
              background:"#F8F6F0",color:"#1B4332",fontSize:"0.95rem",cursor:"pointer",
              display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"background 0.15s"}}>
            ☰
          </button>
          <button className="hamburger-btn" onClick={()=>setMobileOpen(true)}
            style={{alignItems:"center",justifyContent:"center",width:"30px",height:"30px",
              borderRadius:"7px",border:"1px solid #E2D9C5",background:"#F8F6F0",
              color:"#1B4332",fontSize:"0.95rem",cursor:"pointer",flexShrink:0}}>
            ☰
          </button>
          {(()=>{
            const ag=NAV_GROUPS.find(g=>g.pages.some(p=>p.id===page));
            const ap=ag?.pages.find(p=>p.id===page);
            if(!ag||!ap)return <span style={{color:"#1B4332",fontWeight:"700",fontSize:"0.9rem",fontFamily:"'Playfair Display',Georgia,serif"}}>Dashboard</span>;
            return <div style={{display:"flex",alignItems:"center",gap:"5px",fontSize:"0.76rem",minWidth:0}}>
              <span style={{color:"#94a3b8",whiteSpace:"nowrap"}}>{ag.label.replace(/^\S+\s/,"")}</span>
              <span style={{color:"#d1d5db"}}>›</span>
              <span style={{color:"#1B4332",fontWeight:"700",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{ap.label.replace(/^\S+\s/,"")}</span>
            </div>;
          })()}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:"10px",flexShrink:0}}>
          <div className="hdr-fees">{pendingFeesCount>0&&<div style={{background:"rgba(183,121,31,0.1)",border:"1px solid rgba(183,121,31,0.3)",borderRadius:"14px",padding:"3px 10px",fontSize:"0.67rem",color:"#B7791F",fontWeight:"700",whiteSpace:"nowrap"}}>💰 {pendingFeesCount} {t.feesPending}</div>}</div>
          <NotificationBell role={uRole} setPage={setPage}/>
          <div style={{color:"#4A5568",fontSize:"0.73rem",fontWeight:"600",whiteSpace:"nowrap",borderLeft:"1px solid #E2D9C5",paddingLeft:"10px"}}>
            {uName||user?.email?.split("@")[0]}
            <span style={{color:"#94a3b8",fontSize:"0.6rem",textTransform:"capitalize",marginLeft:"4px"}}>· {uRole}</span>
          </div>
        </div>
      </div>
    {/* Mobile sidebar overlay */}
    {mobileOpen&&<div style={{position:"fixed",top:0,left:0,width:"100%",height:"100%",background:"rgba(0,0,0,0.5)",zIndex:999}} onClick={()=>setMobileOpen(false)}>
      <div style={{position:"fixed",top:0,left:0,height:"100vh",width:"280px",zIndex:1000,background:"#0f172a",overflowY:"auto",display:"flex",flexDirection:"column",boxShadow:"4px 0 24px rgba(0,0,0,0.4)"}} onClick={e=>e.stopPropagation()}>
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
              <button onClick={()=>setMobileGroup(isExpanded?null:grp.id)} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"11px 14px",borderRadius:"10px",border:"none",background:isActive?`${grp.color}20`:"rgba(255,255,255,0.04)",color:isActive?grp.color:"rgba(255,255,255,0.75)",fontWeight:isActive?"800":"600",fontSize:"0.82rem",cursor:"pointer",fontFamily:"inherit",textAlign:"left"}}>
                <span style={{fontSize:"0.55rem",opacity:0.6}}>{isExpanded?"▲":"▼"}</span>
                <span>{grp.label}</span>
              </button>
              {isExpanded&&<div style={{marginTop:"3px",paddingRight:"8px",display:"flex",flexDirection:"column",gap:"2px"}}>
                {grp.pages.map(p=><button key={p.id} onClick={()=>{setPage(p.id);setMobileOpen(false);setMobileGroup(null);}} style={{padding:"10px 14px",border:"none",background:page===p.id?`${grp.color}25`:"rgba(255,255,255,0.03)",color:page===p.id?grp.color:"rgba(255,255,255,0.55)",fontWeight:page===p.id?"700":"400",fontSize:"0.78rem",cursor:"pointer",borderRadius:"9px",fontFamily:"inherit",textAlign:"left",borderLeft:page===p.id?`3px solid ${grp.color}`:"3px solid transparent"}}>{p.label}</button>)}
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
    <div style={{flex:1,overflowY:"auto",overflowX:"hidden",background:"#F8F6F0"}}>
      {!canAccess(page)&&<div style={{padding:"60px",textAlign:"center",color:C.red,fontSize:"1.1rem",fontWeight:"700"}}>⛔ You do not have access to this page</div>}
      {canAccess(page)&&<>
      {page==="dashboard"&&<Dashboard students={students} teachers={teachers} houses={houses} hvsLogs={hvs} fees={fees} results={results} setPage={setPage}/>}
      {page==="hvs"&&<HVSEntry students={students} houses={houses} addData={addData} updateHousePoints={updateHousePoints} hvsLogs={hvs} userRole={uRole}/>}
      {page==="evalcenter"&&<EvaluationCenter students={students} houses={houses} addData={addData} updateHousePoints={updateHousePoints} hvsLogs={hvs} userRole={uRole}/>}
      {page==="classrooms"&&<ClassesAndSections/>}
      {page==="students"&&<Students students={students} addData={addData} results={results} fees={fees} hifzLogs={hifzLogs} classes={dbClasses} sections={dbSections}/>}
      {page==="teachers"&&<Teachers teachers={teachers} addData={addData}/>}
      {page==="hifz"&&(()=>{setPage("madrasa");return null;})()}
      {page==="houses"&&<Houses houses={houses} hvsLogs={hvs} students={students} userRole={uRole}/>}
      {page==="timetable"&&<Timetable/>}
      {page==="fees"&&<FeeManagement students={students} addData={addData} fees={fees} updateData={updateData}/>}
      {page==="results"&&<Results students={students} addData={addData} results={results}/>}
      {page==="events"&&<Events addData={addData} houses={houses} updateHousePoints={updateHousePoints}/>}
      {page==="attendance"&&<Attendance students={students} addData={addData} teachers={teachers}/>}
      {page==="notifications"&&<Notifications students={students} addData={addData}/>}
      {page==="library"&&<Library students={students} addData={addData}/>}
      {page==="salary"&&<SalaryManagement teachers={teachers} addData={addData}/>}
      {page==="exams"&&<ExamSchedule addData={addData}/>}
      {page==="transport"&&<Transport students={students} addData={addData}/>}
      {page==="tarbiyah"&&<TarbiyahDiary students={students} addData={addData} updateHousePoints={updateHousePoints}/>}
      {page==="superhouse"&&<SuperHouseDashboard houses={houses} hvsLogs={hvs} students={students}/>}
      {page==="duties"&&<WeeklyDutyChecklist students={students} addData={addData}/>}
      {page==="grandtotal"&&<GrandTotalDashboard hvsLogs={hvs} houses={houses} students={students}/>}
      {page==="superannual"&&<SuperHouseAnnual hvsLogs={hvs} houses={houses} students={students} addData={addData}/>}
      {page==="investigationhub"&&<InvestigationHub/>}
      {page==="invcase"&&<InvestigationCase addData={addData} user={user}/>}
      {page==="incidentlog"&&<IncidentLog addData={addData} user={user}/>}
      {page==="weaknessmatrix"&&<WeaknessMatrix addData={addData}/>}
      {page==="monthlyplanner"&&<MonthlyPlanner addData={addData}/>}
      {page==="societysystem"&&<SocietySystem addData={addData}/>}
      {page==="leadershiproles"&&<LeadershipRoles addData={addData}/>}
      {page==="housetemplates"&&<HouseTemplates addData={addData} students={students}/>}
      {page==="housebazaar"&&<HouseBazaar addData={addData} students={students}/>}
      {page==="sitaraameen"&&<SitaraAmeen addData={addData} students={students}/>}
      {page==="hpri"&&<HPRISystem students={students} addData={addData}/>}
      {page==="registrar"&&<RegistrarHub students={students} addData={addData}/>}
      {page==="reportchain"&&<ReportingChain students={students} teachers={teachers}/>}
      {page==="noticeboard"&&<NoticeBoard addData={addData} user={user}/>}
      {page==="hostel"&&<HostelManagement students={students} addData={addData}/>}
      {page==="health"&&<StudentHealth students={students} addData={addData}/>}
      {page==="madrasa"&&<MadrasaModule students={students} hifzLogs={hifzLogs} userRole={uRole} addData={addData}/>}
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
      {page==="evaluationscales"&&<EvaluationScales addData={addData} students={students}/>}

      {page==="welfare"&&<WelfareFeedback students={students} addData={addData}/>}
      {page==="pride"&&<PrideMessages students={students} teachers={teachers} addData={addData}/>}
      {page==="ethics"&&<TarbiyahEthics students={students} addData={addData}/>}
      {page==="lessons"&&<LessonPlans teachers={teachers} addData={addData}/>}
      {page==="analytics"&&<ClassAnalytics students={students} results={results}/>}
      {page==="transcript"&&<TranscriptRequest students={students} addData={addData}/>}
      {page==="leave"&&<TeacherLeave teachers={teachers} addData={addData}/>}
      {page==="slips"&&<SalarySlips teachers={teachers} addData={addData}/>}
      {page==="lmaterials"&&<LearningMaterials teachers={teachers} addData={addData}/>}
      {page==="reports"&&<Reports students={students} teachers={teachers} houses={houses} hvsLogs={hvs} fees={fees} results={results}/>}
      {page==="phase2plan"&&<Phase2Plan/>}
      {page==="watchlist"&&<WatchList students={students} addData={addData} userRole={uRole}/>}
      {page==="housereportchain"&&<HouseReportingChain userRole={uRole}/>}
      {page==="messaging"&&<ParentMessaging students={students} user={user} userRole={uRole}/>}
      {page==="homeworkhub"&&<HomeworkHub students={students} user={user} userRole={uRole} teachers={teachers}/>}
      {page==="aiassistant"&&<AIAssistant students={students} userRole={uRole}/>}
      {page==="quizhub"&&<QuizHub user={user} role={uRole}/>}
      {page==="schemeofstudies"&&<SchemeOfStudies addData={addData}/>}
      {page==="academiccalendar"&&<AcademicCalendar addData={addData}/>}
      {page==="termbreakup"&&<TermBreakup addData={addData}/>}
      {page==="schooldecor"&&<SchoolDecorPlans addData={addData}/>}
      {page==="chat"&&<ChatSystem user={user} userRole={uRole}/>}
      {page==="etube"&&<ETube addData={addData} userRole={uRole}/>}
      {page==="aicommand"&&<AICommandCenter students={students} teachers={teachers} houses={houses} userRole={uRole} addData={addData} updateData={updateData}/>}
      </>}
    </div>
  </div>
</div>;
}
