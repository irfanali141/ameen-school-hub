/* eslint-disable */
import { useState, useEffect, lazy, Suspense } from "react";
import "./hover.css";
import { useSchool } from "./contexts/SchoolContext";
import { C, S, hBadge, pBar, HOUSES, HVS_CATS, HVS_TOTAL, RATING, DEMO, ROLE_PAGES, SEED_S, SEED_T, MONTHS, TIMETABLE, DAYS, DAYS_UR } from "./constants";
import ModuleShell from "./components/ui/ModuleShell";

// Always-needed (auth screen + sidebar logo — never lazy)
import Login, { AIILogo, HouseBadge } from "./components/auth/Login";
import NotificationBell from "./components/NotificationBell";

// Lazy-loaded page components (loaded only when the page is first visited)
const Dashboard        = lazy(() => import("./components/academic/Dashboard"));
const Students         = lazy(() => import("./components/academic/Students"));
const Hifz             = lazy(() => import("./components/academic/Hifz"));
const Attendance       = lazy(() => import("./components/academic/Attendance"));
const Results          = lazy(() => import("./components/academic/Results"));
const Notifications    = lazy(() => import("./components/academic/Notifications"));
const Timetable        = lazy(() => import("./components/academic/Timetable"));
const Events           = lazy(() => import("./components/academic/Events"));
const Library          = lazy(() => import("./components/academic/Library"));
const ExamSchedule     = lazy(() => import("./components/academic/ExamSchedule"));
const ExamSeating      = lazy(() => import("./components/academic/ExamSeating"));
const ClassAnalytics   = lazy(() => import("./components/academic/ClassAnalytics"));
const TranscriptRequest= lazy(() => import("./components/academic/TranscriptRequest"));
const ReportCard       = lazy(() => import("./components/academic/ReportCard"));
const EvaluationScales = lazy(() => import("./components/academic/EvaluationScales"));
const EvaluationCenter = lazy(() => import("./components/evaluation/EvaluationCenter"));
const ClassesAndSections=lazy(() => import("./components/academic/ClassesAndSections"));
const DMC              = lazy(() => import("./components/academic/DMC"));
const CurriculumHub    = lazy(() => import("./components/academic/CurriculumHub"));
const MarksEntry       = lazy(() => import("./components/academic/MarksEntry"));
const Reports          = lazy(() => import("./components/academic/Reports"));
const HomeworkHub      = lazy(() => import("./components/academic/HomeworkHub"));
const QuizHub          = lazy(() => import("./components/academic/QuizHub"));
const SchemeOfStudies  = lazy(() => import("./components/academic/SchemeOfStudies"));
const AcademicCalendar = lazy(() => import("./components/academic/AcademicCalendar"));
const TermBreakup      = lazy(() => import("./components/academic/TermBreakup"));
const ETube            = lazy(() => import("./components/academic/ETube"));

const Houses           = lazy(() => import("./components/houses/Houses"));
const HVSEntry         = lazy(() => import("./components/houses/HVSEntry"));
const TarbiyahEthics   = lazy(() => import("./components/houses/TarbiyahEthics"));
const TarbiyahDiary    = lazy(() => import("./components/houses/TarbiyahDiary"));
const SuperHouseDashboard=lazy(()=> import("./components/houses/SuperHouseDashboard"));
const WeeklyDutyChecklist=lazy(()=> import("./components/houses/WeeklyDutyChecklist"));
const GrandTotalDashboard=lazy(()=> import("./components/houses/GrandTotalDashboard"));
const SuperHouseAnnual = lazy(() => import("./components/houses/SuperHouseAnnual"));
const InvestigationHub = lazy(() => import("./components/houses/InvestigationHub"));
const InvestigationCase= lazy(() => import("./components/houses/InvestigationCase"));
const IncidentLog      = lazy(() => import("./components/houses/IncidentLog"));
const WeaknessMatrix   = lazy(() => import("./components/houses/WeaknessMatrix"));
const MonthlyPlanner   = lazy(() => import("./components/houses/MonthlyPlanner"));
const SocietySystem    = lazy(() => import("./components/houses/SocietySystem"));
const LeadershipRoles  = lazy(() => import("./components/houses/LeadershipRoles"));
const HouseTemplates   = lazy(() => import("./components/houses/HouseTemplates"));
const HouseBazaar      = lazy(() => import("./components/houses/HouseBazaar"));
const SitaraAmeen      = lazy(() => import("./components/houses/SitaraAmeen"));
const WatchList        = lazy(() => import("./components/houses/WatchList"));
const HouseReportingChain=lazy(()=> import("./components/houses/HouseReportingChain"));

const FeeManagement    = lazy(() => import("./components/finance/FeeManagement"));
const SalaryManagement = lazy(() => import("./components/finance/SalaryManagement"));
const SalarySlips      = lazy(() => import("./components/finance/SalarySlips"));
const DonationHub      = lazy(() => import("./components/finance/DonationHub"));

const Teachers         = lazy(() => import("./components/staff/Teachers"));
const StaffPerformance = lazy(() => import("./components/staff/StaffPerformance"));
const LessonPlans      = lazy(() => import("./components/staff/LessonPlans"));
const TeacherLeave     = lazy(() => import("./components/staff/TeacherLeave"));
const LearningMaterials= lazy(() => import("./components/staff/LearningMaterials"));
const FacultyDevelopment=lazy(() => import("./components/staff/FacultyDevelopment"));

const Transport        = lazy(() => import("./components/admin/Transport"));
const NoticeBoard      = lazy(() => import("./components/admin/NoticeBoard"));
const HostelManagement = lazy(() => import("./components/admin/HostelManagement"));
const MeetingMinutes   = lazy(() => import("./components/admin/MeetingMinutes"));
const LogisticsTracker = lazy(() => import("./components/admin/LogisticsTracker"));
const VisitorHub       = lazy(() => import("./components/admin/VisitorHub"));
const RegistrarHub     = lazy(() => import("./components/admin/RegistrarHub"));
const ReportingChain   = lazy(() => import("./components/admin/ReportingChain"));
const SchoolDecorPlans = lazy(() => import("./components/admin/SchoolDecorPlans"));
const Phase2Plan       = lazy(() => import("./components/admin/Phase2Plan"));

const ParentPortal     = lazy(() => import("./components/portals/ParentPortal"));
const DirectorPortal   = lazy(() => import("./components/portals/DirectorPortal"));
const AlumniPortal     = lazy(() => import("./components/portals/AlumniPortal"));
const ParentMessaging  = lazy(() => import("./components/portals/ParentMessaging"));

const AIAssistant      = lazy(() => import("./components/ai/AIAssistant"));
const AICommandCenter  = lazy(() => import("./components/ai/AICommandCenter"));

const ChatSystem       = lazy(() => import("./components/communication/ChatSystem"));

const StudentHealth    = lazy(() => import("./components/welfare/StudentHealth"));
const WelfareFeedback  = lazy(() => import("./components/welfare/WelfareFeedback"));
const PrideMessages    = lazy(() => import("./components/welfare/PrideMessages"));
const HPRISystem       = lazy(() => import("./components/welfare/HPRISystem"));

const MadrasaModule    = lazy(() => import("./components/madrasa/MadrasaModule"));
const HifzDashboard    = lazy(() => import("./components/madrasa/HifzDashboard"));
const MadrasaUstad     = lazy(() => import("./components/madrasa/MadrasaUstad"));
const AwardsHub        = lazy(() => import("./components/houses/AwardsHub"));


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
      aicommand:"🤖 AI کمانڈ",
      awardshub:"🏆 ایوارڈز ہب"
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
      aicommand:"🤖 AI Command",
      awardshub:"🏆 Awards Hub"
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
      aicommand:"🤖 مركز الأوامر",
      awardshub:"🏆 مركز الجوائز"
    }
  }
};
// ===================== MAIN APP =====================
export default function App(){
  // ── All shared data & auth from SchoolContext ──
  const {
    user, loading, authErr, role: uRole,
    login: ctxLogin, logout,
    students, teachers, houses, hvsLogs: hvs, fees, results,
    hifzLogs, attendance, evalScales, dbClasses, dbSections,
    feeReceipts, unreadMsgCount,
    addData, updateData: updateDataWrapped, updateHousePoints,
  } = useSchool();

  // ── UI-only state (belongs in App, not in context) ──
  const [err, setErr] = useState("");
  const [lLoading, setLL] = useState(false);
  const [page, setPageState] = useState(()=>{const h=window.location.hash.slice(1);return h||"dashboard";});
  const setPage = (p)=>{window.location.hash=p; setPageState(p);};
  const [openGroup, setOpenGroup] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileGroup, setMobileGroup] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [lang, setLang] = useState("en");
  const [localUnread, setLocalUnread] = useState(unreadMsgCount);

  // Keep local unread in sync with context (for badge clearing on nav)
  useEffect(()=>{ setLocalUnread(unreadMsgCount); }, [unreadMsgCount]);

  useEffect(()=>{const onHash=()=>{const p=window.location.hash.slice(1)||"dashboard";setPageState(p);};window.addEventListener("hashchange",onHash);return()=>window.removeEventListener("hashchange",onHash);},[]);

  // Redirect to allowed page on role change
  useEffect(()=>{
    if(!user||!uRole)return;
    const allowed=ROLE_PAGES[uRole]??ROLE_PAGES.teacher;
    if(allowed!==null&&!allowed.includes(page)){ setPage(allowed[0]||"dashboard"); }
  },[user, uRole, page]);

  const login = async(email,pass)=>{
    setLL(true); setErr("");
    try { await ctxLogin(email,pass); }
    catch { setErr("Invalid email or password"); }
    setLL(false);
  };

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
      {id:"awardshub",label:t.pages.awardshub},
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
      {id:"hifzdashboard",label:t.pages.hifzdashboard},
      {id:"madrasaustad",label:t.pages.madrasaustad},
      {id:"hifz",label:t.pages.hifz},
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
    {id:"hifzdashboard",label:t.pages.hifzdashboard},
    {id:"madrasaustad",label:t.pages.madrasaustad},
    {id:"awardshub",label:t.pages.awardshub},
  ];

  // (uName, uRole, isDemoUser, allowedPages etc. are derived above near the loading check)

  const uName=DEMO.find(d=>d.email===user?.email)?.name||user?.email||"";
  const isDemoUser=DEMO.some(d=>d.email===user?.email);
  const allowedPages=ROLE_PAGES[uRole]??ROLE_PAGES.teacher;
  const canAccess=(pid)=>allowedPages===null||allowedPages.includes(pid);
  const visibleNavGroups=NAV_GROUPS.map(g=>({...g,pages:g.pages.filter(p=>canAccess(p.id))})).filter(g=>g.pages.length>0);
  const pendingFeesCount=fees.filter(f=>f.status==="pending").length;
  const _today=new Date().toISOString().slice(0,10);
  const overdueFeesCount=fees.filter(f=>f.status==="pending"&&f.due_date&&f.due_date<_today).length;

  if(loading)return (
    <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#0f172a 0%,#0d1f3c 60%,#0a1628 100%)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:"24px",fontFamily:"'Public Sans',sans-serif"}}>
      {/* Logo pulse */}
      <div style={{position:"relative"}}>
        <div style={{width:"72px",height:"72px",borderRadius:"50%",background:"linear-gradient(135deg,#d4af37,#b8960a)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"2rem",boxShadow:"0 0 0 0 rgba(212,175,55,0.4)",animation:"aii-pulse 1.8s infinite"}}>☪</div>
      </div>
      {/* Skeleton bars */}
      <div style={{width:"280px",display:"flex",flexDirection:"column",gap:"10px"}}>
        {[100,75,90,60].map((w,i)=>(
          <div key={i} style={{height:"12px",borderRadius:"6px",background:"rgba(255,255,255,0.08)",width:`${w}%`,animation:`aii-shimmer 1.5s ${i*0.15}s infinite`}}/>
        ))}
      </div>
      <div style={{color:"rgba(212,175,55,0.7)",fontSize:"0.8rem",fontWeight:"600",letterSpacing:"0.1em"}}>AMEEN SCHOOL HUB</div>
      <style>{`
        @keyframes aii-pulse{0%,100%{box-shadow:0 0 0 0 rgba(212,175,55,0.4)}50%{box-shadow:0 0 0 16px rgba(212,175,55,0)}}
        @keyframes aii-shimmer{0%,100%{opacity:0.4}50%{opacity:0.9}}
      `}</style>
    </div>
  );
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
        .hdr-username{display:none!important;}
        .hdr-topbar{padding:0 10px!important;}
        html,body,#root{height:100svh!important;height:100dvh!important;}
      }
      @media(max-width:480px){
        .hdr-breadcrumb .hdr-bc-group{display:none!important;}
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
        {overdueFeesCount>0&&<div style={{background:"rgba(220,38,38,0.2)",border:"1px solid rgba(220,38,38,0.5)",borderRadius:"10px",padding:"2px 7px",fontSize:"0.58rem",color:"#f87171",fontWeight:"700",flexShrink:0}} title="Overdue fees">🚨{overdueFeesCount}</div>}
        {overdueFeesCount===0&&pendingFeesCount>0&&<div style={{background:"rgba(217,119,6,0.2)",border:"1px solid rgba(217,119,6,0.4)",borderRadius:"10px",padding:"2px 7px",fontSize:"0.58rem",color:"#f0a040",fontWeight:"700",flexShrink:0}}>💰{pendingFeesCount}</div>}
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
                  transition:"all 0.12s",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <span style={{whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{p.label}</span>
                {p.id==="messaging"&&unreadMsgCount>0&&<span style={{background:"#ef4444",color:"#fff",borderRadius:"10px",padding:"1px 6px",fontSize:"0.55rem",fontWeight:"800",flexShrink:0,marginLeft:"4px"}}>{unreadMsgCount>99?"99+":unreadMsgCount}</span>}
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
      <div className="hdr-topbar" style={{background:"#FFFFFF",borderBottom:"1px solid #E2D9C5",padding:"0 18px",height:"52px",
        display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0,
        boxShadow:"0 1px 4px rgba(27,67,50,0.07)"}}>
        <div style={{display:"flex",alignItems:"center",gap:"10px",minWidth:0,flex:1}}>
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
            return <div className="hdr-breadcrumb" style={{display:"flex",alignItems:"center",gap:"5px",fontSize:"0.76rem",minWidth:0,overflow:"hidden"}}>
              <span className="hdr-bc-group" style={{color:"#94a3b8",whiteSpace:"nowrap",flexShrink:0}}>{ag.label.replace(/^\S+\s/,"")}</span>
              <span className="hdr-bc-group" style={{color:"#d1d5db",flexShrink:0}}>›</span>
              <span style={{color:"#1B4332",fontWeight:"700",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{ap.label.replace(/^\S+\s/,"")}</span>
            </div>;
          })()}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:"10px",flexShrink:0}}>
          <div className="hdr-fees" style={{display:"flex",gap:"6px"}}>
            {overdueFeesCount>0&&<div onClick={()=>setPage("fees")} style={{background:"rgba(220,38,38,0.12)",border:"1px solid rgba(220,38,38,0.4)",borderRadius:"14px",padding:"3px 10px",fontSize:"0.67rem",color:"#f87171",fontWeight:"700",whiteSpace:"nowrap",cursor:"pointer"}} title="Overdue fees — click to view">🚨 {overdueFeesCount} Overdue</div>}
            {pendingFeesCount>overdueFeesCount&&<div style={{background:"rgba(183,121,31,0.1)",border:"1px solid rgba(183,121,31,0.3)",borderRadius:"14px",padding:"3px 10px",fontSize:"0.67rem",color:"#B7791F",fontWeight:"700",whiteSpace:"nowrap"}}>💰 {pendingFeesCount} {t.feesPending}</div>}
          </div>
          <NotificationBell role={uRole} setPage={setPage} unreadMsgCount={unreadMsgCount} onMsgClick={()=>setPage("messaging")}/>
          <div className="hdr-username" style={{color:"#4A5568",fontSize:"0.73rem",fontWeight:"600",whiteSpace:"nowrap",borderLeft:"1px solid #E2D9C5",paddingLeft:"10px"}}>
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
          {overdueFeesCount>0&&<div style={{marginLeft:"auto",background:"rgba(220,38,38,0.2)",border:"1px solid rgba(220,38,38,0.5)",borderRadius:"16px",padding:"3px 10px",fontSize:"0.62rem",color:"#f87171",fontWeight:"700"}}>🚨 {overdueFeesCount} Overdue</div>}
          {overdueFeesCount===0&&pendingFeesCount>0&&<div style={{marginLeft:"auto",background:C.amber+"20",border:`1px solid ${C.amber}`,borderRadius:"16px",padding:"3px 10px",fontSize:"0.62rem",color:C.amber,fontWeight:"700"}}>💰 {pendingFeesCount}</div>}
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
    <div className="aii-page-wrap" style={{flex:1,overflowY:"auto",overflowX:"hidden",background:"#F8F6F0"}}>
      {isDemoUser&&["director","admin"].includes(uRole)&&<div style={{background:"#fefce8",borderBottom:"2px solid #fbbf24",padding:"7px 18px",display:"flex",alignItems:"center",gap:"10px",flexWrap:"wrap"}}>
        <span style={{fontSize:"1rem"}}>⚠️</span>
        <span style={{fontSize:"0.72rem",fontWeight:"700",color:"#92400e"}}>Demo Mode — You are logged in with a demo account.</span>
        <span style={{fontSize:"0.68rem",color:"#a16207"}}>Before going live: remove demo accounts, create real staff logins, and assign roles.</span>
        <a href="/PRODUCTION_SETUP.md" target="_blank" rel="noreferrer" style={{fontSize:"0.68rem",color:"#b45309",fontWeight:"700",textDecoration:"underline",marginLeft:"auto",whiteSpace:"nowrap"}}>View Setup Guide →</a>
      </div>}
      {!canAccess(page)&&<div style={{padding:"60px",textAlign:"center",color:C.red,fontSize:"1.1rem",fontWeight:"700"}}>⛔ You do not have access to this page</div>}
      {canAccess(page)&&<Suspense fallback={
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"60vh",flexDirection:"column",gap:"14px"}}>
          <div style={{width:"40px",height:"40px",borderRadius:"50%",border:"3px solid rgba(184,134,11,0.2)",borderTop:"3px solid #B8860B",animation:"spin 0.8s linear infinite"}}/>
          <div style={{color:"#94a3b8",fontSize:"0.8rem",fontWeight:"600"}}>Loading...</div>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      }>
      <>
      {page==="dashboard"&&<ModuleShell name="Dashboard"><Dashboard students={students} teachers={teachers} houses={houses} hvsLogs={hvs} fees={fees} results={results} setPage={setPage} userRole={uRole}/></ModuleShell>}
      {page==="hvs"&&<ModuleShell name="HVS"><HVSEntry students={students} houses={houses} addData={addData} updateHousePoints={updateHousePoints} hvsLogs={hvs} userRole={uRole} results={results} hifzLogsData={hifzLogs} attendanceLogs={attendance}/></ModuleShell>}
      {page==="evalcenter"&&<ModuleShell name="Evaluation Center"><EvaluationCenter students={students} houses={houses} addData={addData} updateHousePoints={updateHousePoints} hvsLogs={hvs} userRole={uRole} results={results} hifzLogsData={hifzLogs} attendanceLogs={attendance} evalScales={evalScales}/></ModuleShell>}
      {page==="classrooms"&&<ModuleShell name="Classes & Sections"><ClassesAndSections/></ModuleShell>}
      {page==="students"&&<ModuleShell name="Students"><Students students={students} addData={addData} results={results} fees={fees} hifzLogs={hifzLogs} classes={dbClasses} sections={dbSections}/></ModuleShell>}
      {page==="teachers"&&<ModuleShell name="Teachers"><Teachers teachers={teachers} addData={addData}/></ModuleShell>}
      {page==="hifz"&&<ModuleShell name="Hifz"><Hifz students={students} addData={addData} hifzLogs={hifzLogs}/></ModuleShell>}
      {page==="houses"&&<ModuleShell name="Houses"><Houses houses={houses} hvsLogs={hvs} students={students} userRole={uRole}/></ModuleShell>}
      {page==="timetable"&&<ModuleShell name="Timetable"><Timetable/></ModuleShell>}
      {page==="fees"&&<ModuleShell name="Fee Management"><FeeManagement students={students} addData={addData} fees={fees} updateData={updateDataWrapped} teachers={teachers} feeReceipts={feeReceipts}/></ModuleShell>}
      {page==="results"&&<ModuleShell name="Results"><Results students={students} addData={addData} results={results}/></ModuleShell>}
      {page==="events"&&<ModuleShell name="Events"><Events addData={addData} houses={houses} updateHousePoints={updateHousePoints}/></ModuleShell>}
      {page==="attendance"&&<ModuleShell name="Attendance"><Attendance students={students} addData={addData} teachers={teachers}/></ModuleShell>}
      {page==="notifications"&&<ModuleShell name="Notifications"><Notifications students={students} addData={addData}/></ModuleShell>}
      {page==="library"&&<ModuleShell name="Library"><Library students={students} addData={addData}/></ModuleShell>}
      {page==="salary"&&<ModuleShell name="Salary"><SalaryManagement teachers={teachers} addData={addData}/></ModuleShell>}
      {page==="exams"&&<ModuleShell name="Exam Schedule"><ExamSchedule addData={addData}/></ModuleShell>}
      {page==="transport"&&<ModuleShell name="Transport"><Transport students={students} addData={addData}/></ModuleShell>}
      {page==="tarbiyah"&&<ModuleShell name="Tarbiyah"><TarbiyahDiary students={students} addData={addData} updateHousePoints={updateHousePoints}/></ModuleShell>}
      {page==="superhouse"&&<ModuleShell name="Super House"><SuperHouseDashboard houses={houses} hvsLogs={hvs} students={students}/></ModuleShell>}
      {page==="duties"&&<ModuleShell name="Duty Checklist"><WeeklyDutyChecklist students={students} addData={addData} updateHousePoints={updateHousePoints}/></ModuleShell>}
      {page==="grandtotal"&&<ModuleShell name="Grand Total"><GrandTotalDashboard hvsLogs={hvs} houses={houses} students={students}/></ModuleShell>}
      {page==="superannual"&&<ModuleShell name="Annual Awards"><SuperHouseAnnual hvsLogs={hvs} houses={houses} students={students} addData={addData}/></ModuleShell>}
      {page==="investigationhub"&&<ModuleShell name="Investigation Hub"><InvestigationHub students={students} hvsLogs={hvs} attendance={attendance}/></ModuleShell>}
      {page==="invcase"&&<ModuleShell name="Investigation Case"><InvestigationCase addData={addData} user={user} students={students} houses={houses}/></ModuleShell>}
      {page==="incidentlog"&&<ModuleShell name="Incident Log"><IncidentLog addData={addData} user={user} students={students} houses={houses}/></ModuleShell>}
      {page==="weaknessmatrix"&&<ModuleShell name="Weakness Matrix"><WeaknessMatrix addData={addData} hvsLogs={hvs} houses={houses} students={students}/></ModuleShell>}
      {page==="monthlyplanner"&&<ModuleShell name="Monthly Planner"><MonthlyPlanner addData={addData} houses={houses}/></ModuleShell>}
      {page==="societysystem"&&<ModuleShell name="Society System"><SocietySystem addData={addData} students={students} updateHousePoints={updateHousePoints}/></ModuleShell>}
      {page==="leadershiproles"&&<ModuleShell name="Leadership Roles"><LeadershipRoles addData={addData}/></ModuleShell>}
      {page==="housetemplates"&&<ModuleShell name="House Templates"><HouseTemplates addData={addData} students={students}/></ModuleShell>}
      {page==="housebazaar"&&<ModuleShell name="House Bazaar"><HouseBazaar addData={addData} students={students}/></ModuleShell>}
      {page==="sitaraameen"&&<ModuleShell name="Sitara-e-Ameen"><SitaraAmeen addData={addData} students={students}/></ModuleShell>}
      {page==="hpri"&&<ModuleShell name="HPRI"><HPRISystem students={students} addData={addData}/></ModuleShell>}
      {page==="registrar"&&<ModuleShell name="Registrar"><RegistrarHub students={students} addData={addData}/></ModuleShell>}
      {page==="reportchain"&&<ModuleShell name="Reporting Chain"><ReportingChain students={students} teachers={teachers}/></ModuleShell>}
      {page==="noticeboard"&&<ModuleShell name="Notice Board"><NoticeBoard addData={addData} user={user}/></ModuleShell>}
      {page==="hostel"&&<ModuleShell name="Hostel"><HostelManagement students={students} addData={addData}/></ModuleShell>}
      {page==="health"&&<ModuleShell name="Health"><StudentHealth students={students} addData={addData}/></ModuleShell>}
      {page==="madrasa"&&<ModuleShell name="Madrasa"><MadrasaModule students={students} hifzLogs={hifzLogs} userRole={uRole} addData={addData}/></ModuleShell>}
      {page==="hifzdashboard"&&<ModuleShell name="Hifz Dashboard"><HifzDashboard students={students} userRole={uRole} addData={addData}/></ModuleShell>}
      {page==="madrasaustad"&&<ModuleShell name="Madrasa Ustad"><MadrasaUstad students={students} hifzLogs={hifzLogs} userRole={uRole} addData={addData}/></ModuleShell>}
      {page==="awardshub"&&<ModuleShell name="Awards Hub"><AwardsHub students={students} hvsLogs={hvs} hifzLogs={hifzLogs} role={uRole}/></ModuleShell>}
      {page==="donations"&&<ModuleShell name="Donations"><DonationHub addData={addData}/></ModuleShell>}
      {page==="meetings"&&<ModuleShell name="Meetings"><MeetingMinutes addData={addData}/></ModuleShell>}
      {page==="assets"&&<ModuleShell name="Assets"><LogisticsTracker addData={addData}/></ModuleShell>}
      {page==="staffperf"&&<ModuleShell name="Staff Performance"><StaffPerformance teachers={teachers} addData={addData}/></ModuleShell>}
      {page==="parents"&&<ModuleShell name="Parent Portal"><ParentPortal students={students} fees={fees} results={results} evalScales={evalScales} hvsLogs={hvs} attendance={attendance}/></ModuleShell>}
      {page==="director"&&<ModuleShell name="Director Portal"><DirectorPortal students={students} teachers={teachers} houses={houses} fees={fees} results={results} hvsLogs={hvs}/></ModuleShell>}
      {page==="alumni"&&<ModuleShell name="Alumni"><AlumniPortal addData={addData}/></ModuleShell>}
      {page==="visitors"&&<ModuleShell name="Visitors"><VisitorHub addData={addData}/></ModuleShell>}
      {page==="seating"&&<ModuleShell name="Exam Seating"><ExamSeating students={students} addData={addData}/></ModuleShell>}
      {page==="faculty_dev"&&<ModuleShell name="Faculty Development"><FacultyDevelopment teachers={teachers} addData={addData}/></ModuleShell>}
      {page==="curriculum"&&<ModuleShell name="Curriculum"><CurriculumHub teachers={teachers} addData={addData}/></ModuleShell>}
      {page==="marks"&&<ModuleShell name="Marks Entry"><MarksEntry students={students} addData={addData}/></ModuleShell>}
      {page==="reportcard"&&<ModuleShell name="Report Card"><ReportCard students={students} results={results} fees={fees} addData={addData} evalScales={evalScales}/></ModuleShell>}
      {page==="dmc"&&<ModuleShell name="DMC"><DMC students={students} results={results} fees={fees}/></ModuleShell>}
      {page==="evaluationscales"&&<ModuleShell name="Evaluation Scales"><EvaluationScales addData={addData} students={students}/></ModuleShell>}
      {page==="welfare"&&<ModuleShell name="Welfare"><WelfareFeedback students={students} addData={addData}/></ModuleShell>}
      {page==="pride"&&<ModuleShell name="Pride Messages"><PrideMessages students={students} teachers={teachers} addData={addData}/></ModuleShell>}
      {page==="ethics"&&<ModuleShell name="Ethics"><TarbiyahEthics students={students} addData={addData}/></ModuleShell>}
      {page==="lessons"&&<ModuleShell name="Lesson Plans"><LessonPlans teachers={teachers} addData={addData}/></ModuleShell>}
      {page==="analytics"&&<ModuleShell name="Analytics"><ClassAnalytics students={students} results={results}/></ModuleShell>}
      {page==="transcript"&&<ModuleShell name="Transcript"><TranscriptRequest students={students} addData={addData}/></ModuleShell>}
      {page==="leave"&&<ModuleShell name="Teacher Leave"><TeacherLeave teachers={teachers} addData={addData}/></ModuleShell>}
      {page==="slips"&&<ModuleShell name="Salary Slips"><SalarySlips teachers={teachers} addData={addData}/></ModuleShell>}
      {page==="lmaterials"&&<ModuleShell name="Learning Materials"><LearningMaterials teachers={teachers} addData={addData}/></ModuleShell>}
      {page==="reports"&&<ModuleShell name="Reports"><Reports students={students} teachers={teachers} houses={houses} hvsLogs={hvs} fees={fees} results={results}/></ModuleShell>}
      {page==="phase2plan"&&<ModuleShell name="Phase 2 Plan"><Phase2Plan/></ModuleShell>}
      {page==="watchlist"&&<ModuleShell name="Watch List"><WatchList students={students} addData={addData} userRole={uRole}/></ModuleShell>}
      {page==="housereportchain"&&<ModuleShell name="House Reporting Chain"><HouseReportingChain userRole={uRole}/></ModuleShell>}
      {page==="messaging"&&<ModuleShell name="Parent Messaging"><ParentMessaging students={students} user={user} userRole={uRole}/></ModuleShell>}
      {page==="homeworkhub"&&<ModuleShell name="Homework Hub"><HomeworkHub students={students} user={user} userRole={uRole} teachers={teachers}/></ModuleShell>}
      {page==="aiassistant"&&<ModuleShell name="AI Assistant"><AIAssistant students={students} userRole={uRole}/></ModuleShell>}
      {page==="quizhub"&&<ModuleShell name="Quiz Hub"><QuizHub user={user} role={uRole}/></ModuleShell>}
      {page==="schemeofstudies"&&<ModuleShell name="Scheme of Studies"><SchemeOfStudies addData={addData}/></ModuleShell>}
      {page==="academiccalendar"&&<ModuleShell name="Academic Calendar"><AcademicCalendar addData={addData}/></ModuleShell>}
      {page==="termbreakup"&&<ModuleShell name="Term Breakup"><TermBreakup addData={addData}/></ModuleShell>}
      {page==="schooldecor"&&<ModuleShell name="School Decor"><SchoolDecorPlans addData={addData}/></ModuleShell>}
      {page==="chat"&&<ModuleShell name="Chat"><ChatSystem user={user} userRole={uRole}/></ModuleShell>}
      {page==="etube"&&<ModuleShell name="E-Tube"><ETube addData={addData} userRole={uRole}/></ModuleShell>}
      {page==="aicommand"&&<ModuleShell name="AI Command"><AICommandCenter students={students} teachers={teachers} houses={houses} userRole={uRole} addData={addData} updateData={updateDataWrapped}/></ModuleShell>}
      </></Suspense>}
    </div>
  </div>
</div>;
}
