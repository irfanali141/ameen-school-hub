/* eslint-disable */
import { useState } from "react";
import letterhead from "../../assets/letterhead.png";

// Print styles
const PRINT_STYLE = `
@media print {
  body * { visibility: hidden !important; }
  #report-print-area, #report-print-area * { visibility: visible !important; }
  #report-print-area {
    position: fixed !important;
    top: 0; left: 0;
    width: 100%;
    background: white;
    padding: 0;
    margin: 0;
  }
  .no-print { display: none !important; }
  @page { margin: 0; size: A4; }
}
`;

// ===================== REPORTS HUB =====================
const REPORT_CATS = [
  {
    id: "student",
    label: "🎓 طلبا رپورٹس",
    labelEn: "Student Reports",
    color: "#166534",
    reports: [
      { id: "attendance_summary", label: "حاضری خلاصہ", labelEn: "Attendance Summary", icon: "✅" },
      { id: "result_summary", label: "نتائج خلاصہ", labelEn: "Results Summary", icon: "📊" },
      { id: "fees_status", label: "فیس صورتحال", labelEn: "Fees Status", icon: "💰" },
      { id: "hifz_progress", label: "حفظ پیشرفت", labelEn: "Hifz Progress", icon: "📖" },
      { id: "student_list", label: "طلبا فہرست", labelEn: "Student List", icon: "📋" },
      { id: "health_report", label: "صحت رپورٹ", labelEn: "Health Report", icon: "🏥" },
      { id: "hostel_report", label: "ہوسٹل رپورٹ", labelEn: "Hostel Report", icon: "🏠" },
      { id: "transport_report", label: "ٹرانسپورٹ رپورٹ", labelEn: "Transport Report", icon: "🚌" },
      { id: "welfare_report", label: "فلاح رپورٹ", labelEn: "Welfare Report", icon: "💬" },
      { id: "hpri_report", label: "HPRI رپورٹ", labelEn: "HPRI Report", icon: "⚠️" },
    ]
  },
  {
    id: "staff",
    label: "👨‍🏫 اساتذہ رپورٹس",
    labelEn: "Staff Reports",
    color: "#7c3aed",
    reports: [
      { id: "teacher_list", label: "اساتذہ فہرست", labelEn: "Teacher List", icon: "👨‍🏫" },
      { id: "salary_report", label: "تنخواہ رپورٹ", labelEn: "Salary Report", icon: "💼" },
      { id: "leave_report", label: "چھٹی رپورٹ", labelEn: "Leave Report", icon: "🏖️" },
      { id: "staff_performance", label: "کارکردگی رپورٹ", labelEn: "Performance Report", icon: "📈" },
      { id: "lesson_plans", label: "سبق منصوبہ رپورٹ", labelEn: "Lesson Plans Report", icon: "📅" },
      { id: "faculty_dev", label: "فیکلٹی ترقی", labelEn: "Faculty Development", icon: "👩‍🏫" },
    ]
  },
  {
    id: "house",
    label: "🏆 ہاؤس رپورٹس",
    labelEn: "House Reports",
    color: "#854d0e",
    reports: [
      { id: "hvs_summary", label: "HVS خلاصہ", labelEn: "HVS Summary", icon: "🏅" },
      { id: "house_standings", label: "ہاؤس درجہ بندی", labelEn: "House Standings", icon: "🏆" },
      { id: "tarbiyah_report", label: "تربیت رپورٹ", labelEn: "Tarbiyah Report", icon: "🌟" },
      { id: "ethics_report", label: "اخلاق رپورٹ", labelEn: "Ethics Report", icon: "🌟" },
      { id: "pride_report", label: "پرائیڈ پیغامات", labelEn: "Pride Messages", icon: "💌" },
    ]
  },
  {
    id: "finance",
    label: "💰 مالی رپورٹس",
    labelEn: "Finance Reports",
    color: "#0d9488",
    reports: [
      { id: "fees_collected", label: "جمع فیس", labelEn: "Fees Collected", icon: "✅" },
      { id: "fees_pending", label: "باقی فیس", labelEn: "Fees Pending", icon: "⏳" },
      { id: "salary_disbursement", label: "تنخواہ ادائیگی", labelEn: "Salary Disbursement", icon: "💳" },
      { id: "donations_report", label: "عطیات رپورٹ", labelEn: "Donations Report", icon: "🤲" },
      { id: "finance_summary", label: "مالی خلاصہ", labelEn: "Finance Summary", icon: "📊" },
    ]
  },
  {
    id: "academic",
    label: "📚 تعلیمی رپورٹس",
    labelEn: "Academic Reports",
    color: "#1e40af",
    reports: [
      { id: "exam_report", label: "امتحان رپورٹ", labelEn: "Exam Report", icon: "📝" },
      { id: "marks_report", label: "نمبرات رپورٹ", labelEn: "Marks Report", icon: "✏️" },
      { id: "class_analytics", label: "کلاس تجزیہ", labelEn: "Class Analytics", icon: "📊" },
      { id: "library_report", label: "لائبریری رپورٹ", labelEn: "Library Report", icon: "📚" },
      { id: "curriculum_report", label: "نصاب رپورٹ", labelEn: "Curriculum Report", icon: "📚" },
      { id: "timetable_report", label: "ٹائم ٹیبل رپورٹ", labelEn: "Timetable Report", icon: "🗓️" },
    ]
  },
  {
    id: "admin",
    label: "🏛️ انتظامی رپورٹس",
    labelEn: "Admin Reports",
    color: "#991b1b",
    reports: [
      { id: "visitor_report", label: "زائرین رپورٹ", labelEn: "Visitor Report", icon: "🔒" },
      { id: "meeting_minutes", label: "میٹنگ منٹس", labelEn: "Meeting Minutes", icon: "📝" },
      { id: "assets_report", label: "اثاثے رپورٹ", labelEn: "Assets Report", icon: "🏗️" },
      { id: "noticeboard_report", label: "نوٹس رپورٹ", labelEn: "Notice Board Report", icon: "📌" },
      { id: "events_report", label: "ایونٹس رپورٹ", labelEn: "Events Report", icon: "🎭" },
    ]
  },
  {
    id: "madrasa",
    label: "🕌 مدرسہ رپورٹس",
    labelEn: "Madrasa Reports",
    color: "#065f46",
    reports: [
      { id: "madrasa_report", label: "درس نظامی رپورٹ", labelEn: "Madrasa Report", icon: "🕌" },
      { id: "wifaq_report", label: "وفاق رپورٹ", labelEn: "Wifaq Report", icon: "🕌" },
    ]
  },
];

// ===================== REPORT DETAIL VIEW =====================
function ReportView({ reportId, students, teachers, houses, hvsLogs, fees, results, onBack }) {
  const allReports = REPORT_CATS.flatMap(c => c.reports);
  const report = allReports.find(r => r.id === reportId);
  const cat = REPORT_CATS.find(c => c.reports.some(r => r.id === reportId));

  const handlePrint = () => {
    // inject print style if not already there
    if (!document.getElementById("report-print-style")) {
      const style = document.createElement("style");
      style.id = "report-print-style";
      style.innerHTML = PRINT_STYLE;
      document.head.appendChild(style);
    }
    window.print();
  };

  // Returns { headers: string[], rows: string[][] } for CSV — plain text only, no JSX.
  // Returns null for reports that have no tabular data yet.
  const getCsvData = () => {
    switch (reportId) {
      case "student_list":
        return {
          headers: ["#", "نام", "جماعت", "رول نمبر", "والد کا نام", "صورتحال"],
          rows: students.map((s, i) => [
            i + 1, s.name || "-", s.grade || "-", s.roll_no || "-",
            s.father_name || "-", s.status === "active" ? "فعال" : "غیر فعال",
          ]),
        };
      case "fees_status":
        return {
          headers: ["#", "طالب علم", "جماعت", "رقم", "صورتحال", "تاریخ"],
          rows: fees.map((f, i) => [
            i + 1,
            students.find(s => s.id === f.student_id)?.name || f.student_id || "-",
            students.find(s => s.id === f.student_id)?.grade || "-",
            f.amount || 0,
            f.status === "paid" ? "ادا" : "باقی",
            f.date || f.created_at?.slice(0, 10) || "-",
          ]),
        };
      case "fees_collected": {
        const paid = fees.filter(f => f.status === "paid");
        return {
          headers: ["#", "طالب علم", "رقم", "تاریخ"],
          rows: paid.map((f, i) => [
            i + 1,
            students.find(s => s.id === f.student_id)?.name || "-",
            f.amount || 0,
            f.date || f.created_at?.slice(0, 10) || "-",
          ]),
        };
      }
      case "fees_pending": {
        const pending = fees.filter(f => f.status !== "paid");
        return {
          headers: ["#", "طالب علم", "جماعت", "رقم", "تاریخ"],
          rows: pending.map((f, i) => [
            i + 1,
            students.find(s => s.id === f.student_id)?.name || "-",
            students.find(s => s.id === f.student_id)?.grade || "-",
            f.amount || 0,
            f.date || f.created_at?.slice(0, 10) || "-",
          ]),
        };
      }
      case "teacher_list":
        return {
          headers: ["#", "نام", "مضمون", "تجربہ (سال)", "رابطہ"],
          rows: teachers.map((t, i) => [
            i + 1, t.name || "-", t.subject || "-", t.experience || "-", t.phone || "-",
          ]),
        };
      case "salary_report":
        return {
          headers: ["#", "استاد", "بنیادی تنخواہ", "الاؤنس", "کٹوتی", "خالص تنخواہ"],
          rows: teachers.map((t, i) => [
            i + 1, t.name || "-",
            t.salary || 0, t.allowance || 0, t.deduction || 0,
            (t.salary || 0) + (t.allowance || 0) - (t.deduction || 0),
          ]),
        };
      case "result_summary":
        return {
          headers: ["#", "طالب علم", "جماعت", "مضمون", "نمبر", "گریڈ"],
          rows: results.map((r, i) => [
            i + 1,
            students.find(s => s.id === r.student_id)?.name || "-",
            students.find(s => s.id === r.student_id)?.grade || "-",
            r.subject || "-", r.marks || "-", r.grade || "-",
          ]),
        };
      case "house_standings": {
        const sorted = [...houses].sort((a, b) => (b.points || 0) - (a.points || 0));
        return {
          headers: ["درجہ", "ہاؤس", "پوائنٹس", "HVS کل", "ہفتے"],
          rows: sorted.map((h, i) => [
            `#${i + 1}`, h.name || "-", h.points || 0, h.hvs_total || 0, h.hvs_weeks || 0,
          ]),
        };
      }
      case "hvs_summary":
        return {
          headers: ["#", "طالب علم", "ہاؤس", "زمرہ", "پوائنٹس", "تاریخ"],
          rows: hvsLogs.slice(0, 50).map((h, i) => [
            i + 1,
            students.find(s => s.id === h.student_id)?.name || "-",
            houses.find(hs => hs.id === h.house_id)?.name || "-",
            h.category || "-", h.points || 0,
            h.created_at?.slice(0, 10) || "-",
          ]),
        };
      default:
        return null;
    }
  };

  const handleExportCsv = () => {
    const data = getCsvData();
    if (!data) return;
    const escape = val => {
      const s = String(val ?? "");
      return s.includes(",") || s.includes('"') || s.includes("\n")
        ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const csv = [data.headers, ...data.rows]
      .map(row => row.map(escape).join(","))
      .join("\n");
    // UTF-8 BOM so Excel renders Urdu text correctly
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${report?.labelEn || reportId}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderTable = (headers, rows) => (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
        <thead>
          <tr style={{ background: cat?.color + "20" }}>
            {headers.map((h, i) => (
              <th key={i} style={{ padding: "10px 14px", textAlign: "right", borderBottom: `2px solid ${cat?.color}40`, color: cat?.color, fontWeight: "700" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0
            ? <tr><td colSpan={headers.length} style={{ padding: "20px", textAlign: "center", color: "#888" }}>کوئی ڈیٹا نہیں</td></tr>
            : rows.map((row, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? "#f9fafb" : "#fff", borderBottom: "1px solid #f0f0f0" }}>
                {row.map((cell, j) => (
                  <td key={j} style={{ padding: "9px 14px", textAlign: "right", color: "#333" }}>{cell}</td>
                ))}
              </tr>
            ))
          }
        </tbody>
      </table>
    </div>
  );

  const renderContent = () => {
    switch (reportId) {
      case "student_list":
        return renderTable(
          ["#", "نام", "جماعت", "رول نمبر", "والد کا نام", "صورتحال"],
          students.map((s, i) => [i + 1, s.name || "-", s.grade || "-", s.roll_no || "-", s.father_name || "-",
            <span style={{ color: s.status === "active" ? "#166534" : "#991b1b", fontWeight: 700 }}>{s.status === "active" ? "✅ فعال" : "❌ غیر فعال"}</span>])
        );

      case "fees_status":
        return renderTable(
          ["#", "طالب علم", "جماعت", "رقم", "صورتحال", "تاریخ"],
          fees.map((f, i) => [i + 1, students.find(s => s.id === f.student_id)?.name || f.student_id || "-",
            students.find(s => s.id === f.student_id)?.grade || "-",
            `Rs ${f.amount || 0}`,
            <span style={{ color: f.status === "paid" ? "#166534" : "#991b1b", fontWeight: 700 }}>{f.status === "paid" ? "✅ ادا" : "⏳ باقی"}</span>,
            f.date || f.created_at?.slice(0, 10) || "-"])
        );

      case "fees_collected":
        const paid = fees.filter(f => f.status === "paid");
        return (
          <div>
            <div style={{ display: "flex", gap: "16px", marginBottom: "20px", flexWrap: "wrap" }}>
              <div style={{ background: "#dcfce7", border: "1px solid #86efac", borderRadius: "12px", padding: "16px 24px", flex: 1, minWidth: "140px" }}>
                <div style={{ color: "#166534", fontSize: "0.75rem", fontWeight: 700 }}>جمع فیس</div>
                <div style={{ color: "#166534", fontSize: "1.5rem", fontWeight: 800 }}>Rs {paid.reduce((a, f) => a + (f.amount || 0), 0).toLocaleString()}</div>
                <div style={{ color: "#166534", fontSize: "0.7rem" }}>{paid.length} ادائیگیاں</div>
              </div>
              <div style={{ background: "#fef9c3", border: "1px solid #fde047", borderRadius: "12px", padding: "16px 24px", flex: 1, minWidth: "140px" }}>
                <div style={{ color: "#854d0e", fontSize: "0.75rem", fontWeight: 700 }}>باقی فیس</div>
                <div style={{ color: "#854d0e", fontSize: "1.5rem", fontWeight: 800 }}>Rs {fees.filter(f => f.status !== "paid").reduce((a, f) => a + (f.amount || 0), 0).toLocaleString()}</div>
                <div style={{ color: "#854d0e", fontSize: "0.7rem" }}>{fees.filter(f => f.status !== "paid").length} باقی</div>
              </div>
            </div>
            {renderTable(["#", "طالب علم", "رقم", "تاریخ"], paid.map((f, i) => [i + 1, students.find(s => s.id === f.student_id)?.name || "-", `Rs ${f.amount || 0}`, f.date || f.created_at?.slice(0, 10) || "-"]))}
          </div>
        );

      case "fees_pending":
        const pending = fees.filter(f => f.status !== "paid");
        return renderTable(
          ["#", "طالب علم", "جماعت", "رقم", "تاریخ"],
          pending.map((f, i) => [i + 1, students.find(s => s.id === f.student_id)?.name || "-", students.find(s => s.id === f.student_id)?.grade || "-", `Rs ${f.amount || 0}`, f.date || f.created_at?.slice(0, 10) || "-"])
        );

      case "teacher_list":
        return renderTable(
          ["#", "نام", "مضمون", "تجربہ", "رابطہ"],
          teachers.map((t, i) => [i + 1, t.name || "-", t.subject || "-", t.experience ? `${t.experience} سال` : "-", t.phone || "-"])
        );

      case "salary_report":
        return renderTable(
          ["#", "استاد", "بنیادی تنخواہ", "الاؤنس", "کٹوتی", "خالص تنخواہ"],
          teachers.map((t, i) => [i + 1, t.name || "-", `Rs ${t.salary || 0}`, `Rs ${t.allowance || 0}`, `Rs ${t.deduction || 0}`, `Rs ${(t.salary || 0) + (t.allowance || 0) - (t.deduction || 0)}`])
        );

      case "result_summary":
        return renderTable(
          ["#", "طالب علم", "جماعت", "مضمون", "نمبر", "گریڈ"],
          results.map((r, i) => [i + 1, students.find(s => s.id === r.student_id)?.name || "-", students.find(s => s.id === r.student_id)?.grade || "-", r.subject || "-", r.marks || "-", r.grade || "-"])
        );

      case "house_standings":
        const sorted = [...houses].sort((a, b) => (b.points || 0) - (a.points || 0));
        return renderTable(
          ["درجہ", "ہاؤس", "پوائنٹس", "HVS کل", "ہفتے"],
          sorted.map((h, i) => [
            <span style={{ fontSize: "1.2rem" }}>{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}</span>,
            h.name || "-", h.points || 0, h.hvs_total || 0, h.hvs_weeks || 0
          ])
        );

      case "hvs_summary":
        return renderTable(
          ["#", "طالب علم", "ہاؤس", "زمرہ", "پوائنٹس", "تاریخ"],
          hvsLogs.slice(0, 50).map((h, i) => [i + 1, students.find(s => s.id === h.student_id)?.name || "-", houses.find(hs => hs.id === h.house_id)?.name || "-", h.category || "-", h.points || 0, h.created_at?.slice(0, 10) || "-"])
        );

      case "attendance_summary":
        return (
          <div style={{ textAlign: "center", padding: "40px", color: "#888" }}>
            <div style={{ fontSize: "3rem" }}>📊</div>
            <div style={{ marginTop: "12px", fontSize: "0.9rem" }}>حاضری ڈیٹا Attendance سیکشن سے آتا ہے</div>
            <div style={{ fontSize: "0.75rem", marginTop: "6px", color: "#aaa" }}>براہ کرم Attendance صفحہ دیکھیں</div>
          </div>
        );

      default:
        return (
          <div style={{ textAlign: "center", padding: "40px", color: "#888" }}>
            <div style={{ fontSize: "3rem" }}>{report?.icon}</div>
            <div style={{ marginTop: "12px", fontSize: "0.9rem" }}>یہ رپورٹ جلد آ رہی ہے</div>
            <div style={{ fontSize: "0.75rem", marginTop: "6px", color: "#aaa" }}>Coming Soon</div>
          </div>
        );
    }
  };

  return (
    <div style={{ background: "#fff", borderRadius: "16px", padding: "20px", margin: "0 4px" }}>
      {/* Screen-only header buttons */}
      <div className="no-print" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
        <button onClick={onBack} style={{ background: "#f3f4f6", border: "none", borderRadius: "10px", padding: "8px 16px", cursor: "pointer", fontSize: "0.8rem", color: "#555", fontFamily: "inherit" }}>
          ← واپس
        </button>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "1.1rem", fontWeight: 800, color: cat?.color }}>{report?.icon} {report?.label}</div>
          <div style={{ fontSize: "0.7rem", color: "#888" }}>{report?.labelEn}</div>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          {getCsvData() && (
            <button onClick={handleExportCsv} style={{ background: "#0d9488", color: "#fff", border: "none", borderRadius: "10px", padding: "8px 16px", cursor: "pointer", fontSize: "0.8rem", fontFamily: "inherit", fontWeight: 700 }}>
              ⬇️ CSV
            </button>
          )}
          <button onClick={handlePrint} style={{ background: cat?.color, color: "#fff", border: "none", borderRadius: "10px", padding: "8px 16px", cursor: "pointer", fontSize: "0.8rem", fontFamily: "inherit", fontWeight: 700 }}>
            🖨️ پرنٹ
          </button>
        </div>
      </div>

      {/* Print area — letterhead + content */}
      <div id="report-print-area">
        {/* Letterhead */}
        <img src={letterhead} alt="letterhead" style={{ width: "100%", display: "block", marginBottom: "10px" }} />
        {/* Report title inside print */}
        <div style={{ textAlign: "right", padding: "0 20px 10px", borderBottom: `2px solid ${cat?.color}40`, marginBottom: "12px" }}>
          <div style={{ fontSize: "1rem", fontWeight: 800, color: cat?.color }}>{report?.icon} {report?.label}</div>
          <div style={{ fontSize: "0.7rem", color: "#888" }}>{report?.labelEn} — {new Date().toLocaleDateString("ur-PK")}</div>
        </div>
        {/* Report content */}
        <div style={{ padding: "0 10px" }}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

// ===================== MAIN REPORTS COMPONENT =====================
export default function Reports({ students = [], teachers = [], houses = [], hvsLogs = [], fees = [], results = [] }) {
  const [activeReport, setActiveReport] = useState(null);
  const [search, setSearch] = useState("");

  if (activeReport) {
    return <ReportView reportId={activeReport} students={students} teachers={teachers} houses={houses} hvsLogs={hvsLogs} fees={fees} results={results} onBack={() => setActiveReport(null)} />;
  }

  const filtered = search
    ? REPORT_CATS.map(c => ({ ...c, reports: c.reports.filter(r => r.label.includes(search) || r.labelEn.toLowerCase().includes(search.toLowerCase())) })).filter(c => c.reports.length > 0)
    : REPORT_CATS;

  return (
    <div style={{ padding: "16px", maxWidth: "1100px", margin: "0 auto" }}>
      {/* Title */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#1e293b" }}>📊 رپورٹس مرکز</div>
          <div style={{ fontSize: "0.75rem", color: "#888" }}>Reports Hub — تمام رپورٹس ایک جگہ</div>
        </div>
        {/* Search */}
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="🔍 رپورٹ تلاش کریں..."
          style={{ border: "1.5px solid #e2e8f0", borderRadius: "10px", padding: "9px 14px", fontSize: "0.82rem", fontFamily: "inherit", width: "220px", outline: "none", direction: "rtl" }}
        />
      </div>

      {/* Stats Row */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
        {[
          { label: "کل طلبا", value: students.length, icon: "🎓", color: "#166534", bg: "#dcfce7" },
          { label: "کل اساتذہ", value: teachers.length, icon: "👨‍🏫", color: "#7c3aed", bg: "#ede9fe" },
          { label: "جمع فیس", value: `Rs ${fees.filter(f => f.status === "paid").reduce((a, f) => a + (f.amount || 0), 0).toLocaleString()}`, icon: "💰", color: "#0d9488", bg: "#ccfbf1" },
          { label: "باقی فیس", value: fees.filter(f => f.status !== "paid").length, icon: "⏳", color: "#991b1b", bg: "#fee2e2" },
        ].map((s, i) => (
          <div key={i} style={{ background: s.bg, borderRadius: "12px", padding: "12px 18px", flex: 1, minWidth: "120px", textAlign: "right" }}>
            <div style={{ fontSize: "0.7rem", color: s.color, fontWeight: 700 }}>{s.icon} {s.label}</div>
            <div style={{ fontSize: "1.2rem", fontWeight: 800, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Categories */}
      {filtered.map(cat => (
        <div key={cat.id} style={{ marginBottom: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px", borderBottom: `2px solid ${cat.color}30`, paddingBottom: "8px" }}>
            <div style={{ width: "4px", height: "20px", background: cat.color, borderRadius: "2px" }} />
            <div style={{ fontWeight: 800, fontSize: "0.95rem", color: cat.color }}>{cat.label}</div>
            <div style={{ fontSize: "0.7rem", color: "#aaa" }}>{cat.labelEn}</div>
            <div style={{ marginRight: "auto", background: cat.color + "15", color: cat.color, borderRadius: "20px", padding: "2px 10px", fontSize: "0.68rem", fontWeight: 700 }}>{cat.reports.length} رپورٹس</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "10px" }}>
            {cat.reports.map(r => (
              <button key={r.id} onClick={() => setActiveReport(r.id)}
                style={{ background: "#fff", border: `1.5px solid ${cat.color}25`, borderRadius: "12px", padding: "14px 16px", cursor: "pointer", textAlign: "right", fontFamily: "inherit", transition: "all 0.15s", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = cat.color; e.currentTarget.style.background = cat.color + "08"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = cat.color + "25"; e.currentTarget.style.background = "#fff"; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                <div style={{ fontSize: "1.4rem", marginBottom: "6px" }}>{r.icon}</div>
                <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#1e293b", marginBottom: "2px" }}>{r.label}</div>
                <div style={{ fontSize: "0.65rem", color: "#888" }}>{r.labelEn}</div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
