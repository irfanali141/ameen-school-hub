/* eslint-disable */
import { useState } from "react";
import letterhead from "../../assets/letterhead.png";

// ── CSV Export (vanilla JS, no library) ──────────────────────────────────────
const exportCSV = (data, filename) => {
  if (!data || data.length === 0) return;
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(r =>
    Object.values(r).map(v =>
      typeof v === 'string' && v.includes(',') ?
      '"' + v + '"' : v
    ).join(',')
  ).join('\n');
  // UTF-8 BOM so Excel renders Urdu correctly
  const csv = '\uFEFF' + headers + '\n' + rows;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

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
    label: "🎓 Student Reports",
    labelEn: "Student Reports",
    color: "#166534",
    reports: [
      { id: "attendance_summary", label: "Attendance Summary", labelEn: "Attendance Summary", icon: "✅" },
      { id: "result_summary", label: "Results Summary", labelEn: "Results Summary", icon: "📊" },
      { id: "fees_status", label: "Fee Status", labelEn: "Fees Status", icon: "💰" },
      { id: "hifz_progress", label: "Hifz Progress", labelEn: "Hifz Progress", icon: "📖" },
      { id: "student_list", label: "Student List", labelEn: "Student List", icon: "📋" },
      { id: "health_report", label: "Health Report", labelEn: "Health Report", icon: "🏥" },
      { id: "hostel_report", label: "Hostel Report", labelEn: "Hostel Report", icon: "🏠" },
      { id: "transport_report", label: "Transport Report", labelEn: "Transport Report", icon: "🚌" },
      { id: "welfare_report", label: "Welfare Report", labelEn: "Welfare Report", icon: "💬" },
      { id: "hpri_report", label: "HPRI Report", labelEn: "HPRI Report", icon: "⚠️" },
    ]
  },
  {
    id: "staff",
    label: "👨‍🏫 Teacher Reports",
    labelEn: "Staff Reports",
    color: "#7c3aed",
    reports: [
      { id: "teacher_list", label: "Teacher List", labelEn: "Teacher List", icon: "👨‍🏫" },
      { id: "salary_report", label: "Salary Report", labelEn: "Salary Report", icon: "💼" },
      { id: "leave_report", label: "Leave Report", labelEn: "Leave Report", icon: "🏖️" },
      { id: "staff_performance", label: "Performance Report", labelEn: "Performance Report", icon: "📈" },
      { id: "lesson_plans", label: "Lesson Plan Report", labelEn: "Lesson Plans Report", icon: "📅" },
      { id: "faculty_dev", label: "Faculty Development", labelEn: "Faculty Development", icon: "👩‍🏫" },
    ]
  },
  {
    id: "house",
    label: "🏆 House Reports",
    labelEn: "House Reports",
    color: "#854d0e",
    reports: [
      { id: "hvs_summary", label: "HVS Summary", labelEn: "HVS Summary", icon: "🏅" },
      { id: "house_standings", label: "House Ranking", labelEn: "House Standings", icon: "🏆" },
      { id: "tarbiyah_report", label: "Training Report", labelEn: "Tarbiyah Report", icon: "🌟" },
      { id: "ethics_report", label: "Ethics Report", labelEn: "Ethics Report", icon: "🌟" },
      { id: "pride_report", label: "Pride Messages", labelEn: "Pride Messages", icon: "💌" },
    ]
  },
  {
    id: "finance",
    label: "💰 Financial Reports",
    labelEn: "Finance Reports",
    color: "#0d9488",
    reports: [
      { id: "fees_collected", label: "Total Fee", labelEn: "Fees Collected", icon: "✅" },
      { id: "fees_pending", label: "Pending Fee", labelEn: "Fees Pending", icon: "⏳" },
      { id: "salary_disbursement", label: "Salary Disbursement", labelEn: "Salary Disbursement", icon: "💳" },
      { id: "donations_report", label: "Donations Report", labelEn: "Donations Report", icon: "🤲" },
      { id: "finance_summary", label: "Finance Summary", labelEn: "Finance Summary", icon: "📊" },
    ]
  },
  {
    id: "academic",
    label: "📚 Academic Reports",
    labelEn: "Academic Reports",
    color: "#1e40af",
    reports: [
      { id: "exam_report", label: "Exam Report", labelEn: "Exam Report", icon: "📝" },
      { id: "marks_report", label: "Marks Report", labelEn: "Marks Report", icon: "✏️" },
      { id: "class_analytics", label: "Class Analytics", labelEn: "Class Analytics", icon: "📊" },
      { id: "library_report", label: "Library Report", labelEn: "Library Report", icon: "📚" },
      { id: "curriculum_report", label: "Curriculum Report", labelEn: "Curriculum Report", icon: "📚" },
      { id: "timetable_report", label: "Timetable Report", labelEn: "Timetable Report", icon: "🗓️" },
    ]
  },
  {
    id: "admin",
    label: "🏛️ Administrative Reports",
    labelEn: "Admin Reports",
    color: "#991b1b",
    reports: [
      { id: "visitor_report", label: "Visitor Report", labelEn: "Visitor Report", icon: "🔒" },
      { id: "meeting_minutes", label: "Meeting Minutes", labelEn: "Meeting Minutes", icon: "📝" },
      { id: "assets_report", label: "Assets Report", labelEn: "Assets Report", icon: "🏗️" },
      { id: "noticeboard_report", label: "Notes Report", labelEn: "Notice Board Report", icon: "📌" },
      { id: "events_report", label: "Events Report", labelEn: "Events Report", icon: "🎭" },
    ]
  },
  {
    id: "madrasa",
    label: "🕌 Madrasa Reports",
    labelEn: "Madrasa Reports",
    color: "#065f46",
    reports: [
      { id: "madrasa_report", label: "Madrasa Report", labelEn: "Madrasa Report", icon: "🕌" },
      { id: "wifaq_report", label: "Wifaq Report", labelEn: "Wifaq Report", icon: "🕌" },
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

  // Returns { headers: string[], rows: string[][] } for ALL 39 reports.
  // Auto-computed from props where available; structured-empty for reports with no prop data.
  const getCsvData = () => {
    const dateToday = new Date().toISOString().slice(0, 10);
    switch (reportId) {

      // ══ STUDENT REPORTS (10) ═════════════════════════════════════════
      case "student_list":
        return {
          headers: ["#","Name","کلاس","Roll No","Father Name","Phone","ہاؤس","Status"],
          rows: students.map((s,i) => [
            i+1, s.name||"-", s.grade||"-",
            s.studentCode||s.roll_no||"-",
            s.fatherName||s.father_name||"-",
            s.phone||"-",
            houses.find(h=>h.id===s.houseId)?.nameEn||houses.find(h=>h.id===s.houseId)?.name||s.houseId||"-",
            s.enrollmentStatus==="active"?"Active":"Inactive",
          ]),
        };

      case "attendance_summary":
        return {
          headers: ["#","Name","کلاس","ہاؤس","Attendance%","Absent (days)","Late (days)"],
          rows: students.map((s,i) => [
            i+1, s.name||"-", s.grade||"-",
            houses.find(h=>h.id===s.houseId)?.nameEn||"-",
            "—","—","—",
          ]),
        };

      case "result_summary":
        return {
          headers: ["#","Student","کلاس","مضمون","Obtained","Total","کلاس"],
          rows: results.map((r,i) => [
            i+1,
            students.find(s=>s.id===r.student_id)?.name||"-",
            students.find(s=>s.id===r.student_id)?.grade||"-",
            r.subject||"-", r.marks||"-", r.total||r.outOf||100, r.grade||"-",
          ]),
        };

      case "fees_status":
        return {
          headers: ["#","Student","کلاس","رقم (Rs)","Status","تاریخ"],
          rows: fees.map((f,i) => [
            i+1,
            students.find(s=>s.id===f.student_id)?.name||f.student_id||"-",
            students.find(s=>s.id===f.student_id)?.grade||"-",
            f.amount||0,
            f.status==="paid"?"Paid":"Pending",
            f.date||f.created_at?.slice(0,10)||"-",
          ]),
        };

      case "hifz_progress":
        return {
          headers: ["#","Student","کلاس","ہاؤس","Hifz Status","Last Entry","Notes"],
          rows: students.map((s,i) => [
            i+1, s.name||"-", s.grade||"-",
            houses.find(h=>h.id===s.houseId)?.nameEn||"-",
            "—","—","—",
          ]),
        };

      case "health_report":
        return {
          headers: ["#","Student","کلاس","Blood Group","Last Checkup","Health Status","Notes"],
          rows: students.map((s,i) => [
            i+1, s.name||"-", s.grade||"-","—","—","—","—",
          ]),
        };

      case "hostel_report":
        return {
          headers: ["#","Student","کلاس","Room No","Hostel","Fee Status","Notes"],
          rows: students.map((s,i) => [
            i+1, s.name||"-", s.grade||"-","—","—","—","—",
          ]),
        };

      case "transport_report":
        return {
          headers: ["#","Student","کلاس","Route","Stop","Vehicle No","Driver"],
          rows: students.map((s,i) => [
            i+1, s.name||"-", s.grade||"-","—","—","—","—",
          ]),
        };

      case "welfare_report":
        return {
          headers: ["#","Student","کلاس","Rating","تاریخ","Issue","Resolution"],
          rows: students.map((s,i) => [
            i+1, s.name||"-", s.grade||"-","—","—","—","—",
          ]),
        };

      case "hpri_report":
        return {
          headers: ["#","Student","کلاس","HPRI Score","Risk Level","Reason","تاریخ"],
          rows: students.map((s,i) => [
            i+1, s.name||"-", s.grade||"-","—","—","—","—",
          ]),
        };

      // ══ STAFF REPORTS (6) ════════════════════════════════════════════
      case "teacher_list":
        return {
          headers: ["#","Name","مضمون","کلاس","Employee Code","Phone","ہاؤس"],
          rows: teachers.map((t,i) => [
            i+1, t.name||"-", t.subject||"-", t.grade||"-",
            t.employeeCode||"-", t.phone||"-",
            houses.find(h=>h.id===t.houseId)?.nameEn||"-",
          ]),
        };

      case "salary_report":
        return {
          headers: ["#","Teacher","Base Salary","Allowance","Deduction","Net Salary (Rs)"],
          rows: teachers.map((t,i) => [
            i+1, t.name||"-",
            t.salary||0, t.allowance||0, t.deduction||0,
            (t.salary||0)+(t.allowance||0)-(t.deduction||0),
          ]),
        };

      case "leave_report":
        return {
          headers: ["#","Teacher","مضمون","Leave Type","Start","End","Approval","Notes"],
          rows: teachers.map((t,i) => [
            i+1, t.name||"-", t.subject||"-","—","—","—","—","—",
          ]),
        };

      case "staff_performance":
        return {
          headers: ["#","Teacher","مضمون","Attendance%","Student Performance","Teaching Quality","Overall"],
          rows: teachers.map((t,i) => [
            i+1, t.name||"-", t.subject||"-","—","—","—","—",
          ]),
        };

      case "lesson_plans":
        return {
          headers: ["#","Teacher","مضمون","کلاس","Topic","تاریخ","Status"],
          rows: teachers.map((t,i) => [
            i+1, t.name||"-", t.subject||"-", t.grade||"-","—","—","—",
          ]),
        };

      case "faculty_dev":
        return {
          headers: ["#","Teacher","Training Program","تاریخ","مدت","Status","Certificate"],
          rows: teachers.map((t,i) => [
            i+1, t.name||"-","—","—","—","—","—",
          ]),
        };

      // ══ HOUSE REPORTS (5) ════════════════════════════════════════════
      case "hvs_summary":
        return {
          headers: ["#","ہاؤس","Week","Total Score","Attendance /10","Discipline /15","Morality /15","Education /25","Cleanliness /15","Leadership /10","Spirit /10","Activities /60"],
          rows: hvsLogs.slice(0,200).map((h,i) => {
            const sc = h.scores||{};
            return [
              i+1, h.houseName||h.houseId||"-", h.week||"-", h.totalScore||0,
              sc.attendance||0, sc.discipline||0, sc.morality||0, sc.education||0,
              sc.cleanliness||0, sc.leadership||0, sc.spirit||0, sc.activities||0,
            ];
          }),
        };

      case "house_standings": {
        const sorted = [...houses].sort((a,b)=>(b.points||0)-(a.points||0));
        return {
          headers: ["درجہ","ہاؤس","کل نمبر","ایچ وی ایس کل","HVS Weeks"],
          rows: sorted.map((h,i) => [
            `#${i+1}`, h.nameEn||h.name||h.id||"-", h.points||0, h.hvs_total||0, h.hvs_weeks||0,
          ]),
        };
      }

      case "tarbiyah_report":
        return {
          headers: ["#","ہاؤس","Tarbiyah Entries","Total Points","Namaz Avg","Akhlaq","Notes"],
          rows: houses.map((h,i) => [
            i+1, h.nameEn||h.name||h.id||"-","—","—","—","—","—",
          ]),
        };

      case "ethics_report":
        return {
          headers: ["#","ہاؤس","Positive","Negative","Net Points","زمرہ","Last Entry"],
          rows: houses.map((h,i) => [
            i+1, h.nameEn||h.name||h.id||"-","—","—","—","—","—",
          ]),
        };

      case "pride_report":
        return {
          headers: ["#","ہاؤس","Messages","This Week","Stars","Outstanding Student","تاریخ"],
          rows: houses.map((h,i) => [
            i+1, h.nameEn||h.name||h.id||"-","—","—","—","—","—",
          ]),
        };

      // ══ FINANCE REPORTS (5) ══════════════════════════════════════════
      case "fees_collected": {
        const paid = fees.filter(f=>f.status==="paid");
        return {
          headers: ["#","Student","کلاس","رقم (Rs)","Payment Date"],
          rows: paid.map((f,i) => [
            i+1,
            students.find(s=>s.id===f.student_id)?.name||"-",
            students.find(s=>s.id===f.student_id)?.grade||"-",
            f.amount||0,
            f.date||f.created_at?.slice(0,10)||"-",
          ]),
        };
      }

      case "fees_pending": {
        const pending = fees.filter(f=>f.status!=="paid");
        return {
          headers: ["#","Student","کلاس","رقم (Rs)","Due Date"],
          rows: pending.map((f,i) => [
            i+1,
            students.find(s=>s.id===f.student_id)?.name||"-",
            students.find(s=>s.id===f.student_id)?.grade||"-",
            f.amount||0,
            f.date||f.created_at?.slice(0,10)||"-",
          ]),
        };
      }

      case "salary_disbursement":
        return {
          headers: ["#","Teacher","Net Salary (Rs)","Month","Status"],
          rows: teachers.map((t,i) => [
            i+1, t.name||"-",
            (t.salary||0)+(t.allowance||0)-(t.deduction||0),
            new Date().toLocaleDateString("en-PK",{month:"long",year:"numeric"}),
            "Paid",
          ]),
        };

      case "donations_report":
        return {
          headers: ["#","Donor","رقم (Rs)","Purpose","تاریخ","Status"],
          rows: [],
        };

      case "finance_summary": {
        const totalCollected = fees.filter(f=>f.status==="paid").reduce((s,f)=>s+(f.amount||0),0);
        const totalPending   = fees.filter(f=>f.status!=="paid").reduce((s,f)=>s+(f.amount||0),0);
        const totalSalary    = teachers.reduce((s,t)=>s+(t.salary||0)+(t.allowance||0)-(t.deduction||0),0);
        return {
          headers: ["زمرہ","رقم","تفصیل","تاریخ"],
          rows: [
            ["Fees Collected",     totalCollected, `${fees.filter(f=>f.status==="paid").length} payments`, dateToday],
            ["Fees Pending",    totalPending,   `${fees.filter(f=>f.status!=="paid").length} pending`, dateToday],
            ["Total Salary",   totalSalary,    `${teachers.length} Teachers`, dateToday],
            ["Net Balance",  totalCollected-totalSalary, "Fees - Salary", dateToday],
          ],
        };
      }

      // ══ ACADEMIC REPORTS (6) ═════════════════════════════════════════
      case "exam_report":
        return {
          headers: ["#","Student","کلاس","مضمون","Exam Type","Obtained","Total","کلاس"],
          rows: results.map((r,i) => [
            i+1,
            students.find(s=>s.id===r.student_id)?.name||"-",
            students.find(s=>s.id===r.student_id)?.grade||"-",
            r.subject||"-", r.exam_type||r.examType||"Annual",
            r.marks||"-", r.total||r.outOf||100, r.grade||"-",
          ]),
        };

      case "marks_report":
        return {
          headers: ["#","Student","کلاس","مضمون","Obtained","Total","Percentage","کلاس"],
          rows: results.map((r,i) => {
            const pct = (r.marks && (r.total||r.outOf))
              ? `${Math.round(r.marks/(r.total||r.outOf||100)*100)}%` : "—";
            return [
              i+1,
              students.find(s=>s.id===r.student_id)?.name||"-",
              students.find(s=>s.id===r.student_id)?.grade||"-",
              r.subject||"-", r.marks||"-", r.total||r.outOf||100, pct, r.grade||"-",
            ];
          }),
        };

      case "class_analytics": {
        const gradeMap = {};
        students.forEach(s => {
          const g = s.grade||"Unknown";
          if (!gradeMap[g]) gradeMap[g] = { total:0, houses:{abuBakr:0,umar:0,uthman:0,ali:0} };
          gradeMap[g].total++;
          if (s.houseId) gradeMap[g].houses[s.houseId] = (gradeMap[g].houses[s.houseId]||0)+1;
        });
        return {
          headers: ["کلاس","کل طلباء","Abu Bakr","Umar","Uthman","Ali","Results (Total)"],
          rows: Object.entries(gradeMap).map(([g,d]) => [
            g, d.total,
            d.houses.abuBakr, d.houses.umar, d.houses.uthman, d.houses.ali,
            results.filter(r=>students.find(s=>s.id===r.student_id)?.grade===g).length,
          ]),
        };
      }

      case "library_report":
        return {
          headers: ["#","Book Title","Author","زمرہ","Total Copies","Available","Borrowed"],
          rows: [],
        };

      case "curriculum_report":
        return {
          headers: ["#","Teacher","مضمون","کلاس","Curriculum%","Weekly Lessons","Notes"],
          rows: teachers.map((t,i) => [
            i+1, t.name||"-", t.subject||"-", t.grade||"-","—","—","—",
          ]),
        };

      case "timetable_report": {
        const TT = {
          "Grade 6":  {Monday:["Quran (7:30)","Math (8:15)","Urdu (9:00)","Break","English (10:00)","Science (10:45)","Islamic Studies (11:30)"],Tuesday:["Hifz (7:30)","English (8:15)","Math (9:00)","Break","Urdu (10:00)","Social Studies (10:45)","PE (11:30)"],Wednesday:["Quran (7:30)","Science (8:15)","English (9:00)","Break","Math (10:00)","Art (10:45)","Islamic Studies (11:30)"],Thursday:["Hifz (7:30)","Urdu (8:15)","Social Studies (9:00)","Break","English (10:00)","Math (10:45)","Assembly (11:30)"],Friday:["Quran (7:30)","Islamic Studies (8:15)","Urdu (9:00)","Break","English (10:00)","Dua & Closing (11:00)","—"]},
          "Grade 7":  {Monday:["Quran (7:30)","Math (8:15)","English (9:00)","Break","Science (10:00)","Urdu (10:45)","Islamic Studies (11:30)"],Tuesday:["Hifz (7:30)","Science (8:15)","Math (9:00)","Break","English (10:00)","History (10:45)","PE (11:30)"],Wednesday:["Quran (7:30)","English (8:15)","Urdu (9:00)","Break","Math (10:00)","Computer (10:45)","Islamic Studies (11:30)"],Thursday:["Hifz (7:30)","Math (8:15)","History (9:00)","Break","Science (10:00)","English (10:45)","House Activity (11:30)"],Friday:["Quran (7:30)","Islamic Studies (8:15)","Urdu (9:00)","Break","Math (10:00)","Dua & Closing (11:00)","—"]},
          "Grade 8":  {Monday:["Quran (7:30)","Physics (8:15)","Math (9:00)","Break","English (10:00)","Chemistry (10:45)","Islamic Studies (11:30)"],Tuesday:["Hifz (7:30)","Math (8:15)","English (9:00)","Break","Biology (10:00)","Urdu (10:45)","PE (11:30)"],Wednesday:["Quran (7:30)","Chemistry (8:15)","Math (9:00)","Break","English (10:00)","Computer (10:45)","Islamic Studies (11:30)"],Thursday:["Hifz (7:30)","Physics (8:15)","Biology (9:00)","Break","Math (10:00)","English (10:45)","House Activity (11:30)"],Friday:["Quran (7:30)","Islamic Studies (8:15)","Urdu (9:00)","Break","Math (10:00)","Dua & Closing (11:00)","—"]},
          "Grade 9":  {Monday:["Quran (7:30)","Physics (8:15)","Math (9:00)","Break","English (10:00)","Chemistry (10:45)","Pakistan Studies (11:30)"],Tuesday:["Hifz (7:30)","Math (8:15)","Biology (9:00)","Break","English (10:00)","Urdu (10:45)","PE (11:30)"],Wednesday:["Quran (7:30)","Chemistry (8:15)","Math (9:00)","Break","Pakistan Studies (10:00)","Computer (10:45)","Islamic Studies (11:30)"],Thursday:["Hifz (7:30)","Physics (8:15)","Biology (9:00)","Break","Math (10:00)","English (10:45)","House Activity (11:30)"],Friday:["Quran (7:30)","Islamic Studies (8:15)","Urdu (9:00)","Break","Math (10:00)","Dua & Closing (11:00)","—"]},
        };
        const rows = [];
        Object.entries(TT).forEach(([grade,days]) => {
          Object.entries(days).forEach(([day,periods]) => {
            rows.push([grade, day, ...periods]);
          });
        });
        return {
          headers: ["کلاس","Day","Period 1","Period 2","Period 3","Break","Period 5","Period 6","Period 7"],
          rows,
        };
      }

      // ══ ADMIN REPORTS (5) ════════════════════════════════════════════
      case "visitor_report":
        return {
          headers: ["#","Visitor Name","Purpose","Meeting","Arrival","Departure","تاریخ"],
          rows: [],
        };

      case "meeting_minutes":
        return {
          headers: ["#","Meeting Title","تاریخ","Participants","Key Decisions","Next Meeting"],
          rows: [],
        };

      case "assets_report":
        return {
          headers: ["#","Asset Name","زمرہ","Quantity","Condition","Purchase Date","Value (Rs)"],
          rows: [],
        };

      case "noticeboard_report":
        return {
          headers: ["#","Title","زمرہ","Issued By","تاریخ","Expiry","Target"],
          rows: [],
        };

      case "events_report":
        return {
          headers: ["#","Event Name","تاریخ","Venue","Organizer","Participants","Outcome"],
          rows: [],
        };

      // ══ MADRASA REPORTS (2) ══════════════════════════════════════════
      case "madrasa_report":
        return {
          headers: ["#","Student","کلاس","Dars-e-Nizami مضمون","Obtained","کلاس","Notes"],
          rows: students.map((s,i) => [
            i+1, s.name||"-", s.grade||"-","—","—","—","—",
          ]),
        };

      case "wifaq_report":
        return {
          headers: ["#","Student","Wifaq","Registration No","Exam Year","Result","Marks"],
          rows: students.map((s,i) => [
            i+1, s.name||"-","Wifaq ul Madaris","—","—","—","—",
          ]),
        };

      default:
        return { headers: ["Report","Date"], rows: [[reportId, dateToday]] };
    }
  };

  const handleExportCsv = () => {
    const raw = getCsvData();
    if (!raw || raw.rows.length === 0) return;
    // Convert {headers, rows} → array of objects for exportCSV
    const data = raw.rows.map(row => {
      const obj = {};
      raw.headers.forEach((h, i) => { obj[h] = row[i] ?? ""; });
      return obj;
    });
    const date = new Date().toISOString().slice(0, 10);
    const filename = `${reportId.replace(/_/g, '-')}-${date}.csv`;
    exportCSV(data, filename);
  };

  const renderTable = (headers, rows) => (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
        <thead>
          <tr style={{ background: cat?.color + "20" }}>
            {headers.map((h, i) => (
              <th key={i} style={{ padding: "10px 14px", textAlign: "left", borderBottom: `2px solid ${cat?.color}40`, color: cat?.color, fontWeight: "700" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0
            ? <tr><td colSpan={headers.length} style={{ padding: "20px", textAlign: "center", color: "#888" }}><span className="ur">کوئی ڈیٹا نہیں</span></td></tr>
            : rows.map((row, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? "#f9fafb" : "#fff", borderBottom: "1px solid #f0f0f0" }}>
                {row.map((cell, j) => (
                  <td key={j} style={{ padding: "9px 14px", textAlign: "left", color: "#333" }}>{cell}</td>
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
          ["#", "Name", "کلاس", "Roll No", "Father's Name", "Status"],
          students.map((s, i) => [i + 1, s.name || "-", s.grade || "-", s.roll_no || "-", s.father_name || "-",
            <span style={{ color: s.status === "active" ? "#166534" : "#991b1b", fontWeight: 700 }}>{s.status === "active" ? "✅ Active" : "❌ Inactive"}</span>])
        );

      case "fees_status":
        return renderTable(
          ["#", "Student", "کلاس", "رقم", "Status", "تاریخ"],
          fees.map((f, i) => [i + 1, students.find(s => s.id === f.student_id)?.name || f.student_id || "-",
            students.find(s => s.id === f.student_id)?.grade || "-",
            `Rs ${f.amount || 0}`,
            <span style={{ color: f.status === "paid" ? "#166534" : "#991b1b", fontWeight: 700 }}>{f.status === "paid" ? "✅ Paid" : "⏳ Pending"}</span>,
            f.date || f.created_at?.slice(0, 10) || "-"])
        );

      case "fees_collected":
        const paid = fees.filter(f => f.status === "paid");
        return (
          <div>
            <div style={{ display: "flex", gap: "16px", marginBottom: "20px", flexWrap: "wrap" }}>
              <div style={{ background: "#dcfce7", border: "1px solid #86efac", borderRadius: "12px", padding: "16px 24px", flex: 1, minWidth: "140px" }}>
                <div style={{ color: "#166534", fontSize: "0.75rem", fontWeight: 700 }}>Fees Collected</div>
                <div style={{ color: "#166534", fontSize: "1.5rem", fontWeight: 800 }}>Rs {paid.reduce((a, f) => a + (f.amount || 0), 0).toLocaleString()}</div>
                <div style={{ color: "#166534", fontSize: "0.7rem" }}>{paid.length} payments</div>
              </div>
              <div style={{ background: "#fef9c3", border: "1px solid #fde047", borderRadius: "12px", padding: "16px 24px", flex: 1, minWidth: "140px" }}>
                <div style={{ color: "#854d0e", fontSize: "0.75rem", fontWeight: 700 }}>Fees Pending</div>
                <div style={{ color: "#854d0e", fontSize: "1.5rem", fontWeight: 800 }}>Rs {fees.filter(f => f.status !== "paid").reduce((a, f) => a + (f.amount || 0), 0).toLocaleString()}</div>
                <div style={{ color: "#854d0e", fontSize: "0.7rem" }}>{fees.filter(f => f.status !== "paid").length} pending</div>
              </div>
            </div>
            {renderTable(["#", "Student", "رقم", "تاریخ"], paid.map((f, i) => [i + 1, students.find(s => s.id === f.student_id)?.name || "-", `Rs ${f.amount || 0}`, f.date || f.created_at?.slice(0, 10) || "-"]))}
          </div>
        );

      case "fees_pending":
        const pending = fees.filter(f => f.status !== "paid");
        return renderTable(
          ["#", "Student", "کلاس", "رقم", "تاریخ"],
          pending.map((f, i) => [i + 1, students.find(s => s.id === f.student_id)?.name || "-", students.find(s => s.id === f.student_id)?.grade || "-", `Rs ${f.amount || 0}`, f.date || f.created_at?.slice(0, 10) || "-"])
        );

      case "teacher_list":
        return renderTable(
          ["#", "Name", "مضمون", "Experience", "Contact"],
          teachers.map((t, i) => [i + 1, t.name || "-", t.subject || "-", t.experience ? `${t.experience} yrs` : "-", t.phone || "-"])
        );

      case "salary_report":
        return renderTable(
          ["#", "Teacher", "Base Salary", "Allowance", "Deduction", "Net Salary"],
          teachers.map((t, i) => [i + 1, t.name || "-", `Rs ${t.salary || 0}`, `Rs ${t.allowance || 0}`, `Rs ${t.deduction || 0}`, `Rs ${(t.salary || 0) + (t.allowance || 0) - (t.deduction || 0)}`])
        );

      case "result_summary":
        return renderTable(
          ["#", "Student", "کلاس", "مضمون", "Marks", "کلاس"],
          results.map((r, i) => [i + 1, students.find(s => s.id === r.student_id)?.name || "-", students.find(s => s.id === r.student_id)?.grade || "-", r.subject || "-", r.marks || "-", r.grade || "-"])
        );

      case "house_standings":
        const sorted = [...houses].sort((a, b) => (b.points || 0) - (a.points || 0));
        return renderTable(
          ["درجہ", "ہاؤس", "کل نمبر", "ایچ وی ایس کل", "Weeks"],
          sorted.map((h, i) => [
            <span style={{ fontSize: "1.2rem" }}>{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}</span>,
            h.nameEn || h.name || "-", h.points || 0, h.hvs_total || 0, h.hvs_weeks || 0
          ])
        );

      case "hvs_summary":
        return renderTable(
          ["#", "Student", "ہاؤس", "زمرہ", "Points", "تاریخ"],
          hvsLogs.slice(0, 50).map((h, i) => [i + 1, students.find(s => s.id === h.student_id)?.name || "-", houses.find(hs => hs.id === h.house_id)?.nameEn || houses.find(hs => hs.id === h.house_id)?.name || "-", h.category || "-", h.points || 0, h.created_at?.slice(0, 10) || "-"])
        );

      case "attendance_summary":
        return (
          <div style={{ textAlign: "center", padding: "40px", color: "#888" }}>
            <div style={{ fontSize: "3rem" }}>📊</div>
            <div style={{ marginTop: "12px", fontSize: "0.9rem" }}>Attendance data comes from the Attendance section</div>
            <div style={{ fontSize: "0.75rem", marginTop: "6px", color: "#aaa" }}>Please view the Attendance page</div>
          </div>
        );

      default:
        return (
          <div style={{ textAlign: "center", padding: "40px", color: "#888" }}>
            <div style={{ fontSize: "3rem" }}>{report?.icon}</div>
            <div style={{ marginTop: "12px", fontSize: "0.9rem" }} className="ur">یہ رپورٹ جلد آ رہی ہے</div>
            <div style={{ fontSize: "0.75rem", marginTop: "6px", color: "#aaa" }} className="ur">جلد آ رہا ہے</div>
          </div>
        );
    }
  };

  return (
    <div style={{ background: "#fff", borderRadius: "16px", padding: "20px", margin: "0 4px" }}>
      {/* Screen-only header buttons */}
      <div className="no-print" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
        <button onClick={onBack} style={{ background: "#f3f4f6", border: "none", borderRadius: "10px", padding: "8px 16px", cursor: "pointer", fontSize: "0.8rem", color: "#555", fontFamily: "inherit" }}>
          ← Back
        </button>
        <div style={{ textAlign: "left" }}>
          <div style={{ fontSize: "1.1rem", fontWeight: 800, color: cat?.color }}>{report?.icon} {report?.labelEn}</div>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={handleExportCsv} style={{ display:"flex", alignItems:"center", gap:"5px", background:"transparent", color:"#0d9488", border:"1.5px solid #0d9488", borderRadius:"10px", padding:"7px 14px", cursor:"pointer", fontSize:"0.75rem", fontFamily:"inherit", fontWeight:700 }}>
            ⬇ Download CSV
          </button>
          <button onClick={handlePrint} style={{ background: cat?.color, color: "#fff", border: "none", borderRadius: "10px", padding: "8px 16px", cursor: "pointer", fontSize: "0.8rem", fontFamily: "inherit", fontWeight: 700 }}>
            🖨️ Print
          </button>
        </div>
      </div>

      {/* Print area — letterhead + content */}
      <div id="report-print-area">
        {/* Letterhead */}
        <img src={letterhead} alt="letterhead" style={{ width: "100%", display: "block", marginBottom: "10px" }} />
        {/* Report title inside print */}
        <div style={{ textAlign: "right", padding: "0 20px 10px", borderBottom: `2px solid ${cat?.color}40`, marginBottom: "12px" }}>
          <div style={{ fontSize: "1rem", fontWeight: 800, color: cat?.color }}>{report?.icon} {report?.labelEn}</div>
          <div style={{ fontSize: "0.7rem", color: "#888" }}>{new Date().toLocaleDateString("en-PK")}</div>
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
          <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#1e293b" }}>📊 Reports Hub</div>
          <div style={{ fontSize: "0.75rem", color: "#888" }}>All reports in one place</div>
        </div>
        {/* Search */}
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Search reports..."
          style={{ border: "1.5px solid #e2e8f0", borderRadius: "10px", padding: "9px 14px", fontSize: "0.82rem", fontFamily: "inherit", width: "220px", outline: "none", direction:"ltr" }}
        />
      </div>

      {/* Stats Row */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
        {[
          { label: "Total Students", value: students.length, icon: "🎓", color: "#166534", bg: "#dcfce7" },
          { label: "Total Teachers", value: teachers.length, icon: "👨‍🏫", color: "#7c3aed", bg: "#ede9fe" },
          { label: "Fees Collected", value: `Rs ${fees.filter(f => f.status === "paid").reduce((a, f) => a + (f.amount || 0), 0).toLocaleString()}`, icon: "💰", color: "#0d9488", bg: "#ccfbf1" },
          { label: "Fees Pending", value: fees.filter(f => f.status !== "paid").length, icon: "⏳", color: "#991b1b", bg: "#fee2e2" },
        ].map((s, i) => (
          <div key={i} style={{ background: s.bg, borderRadius: "12px", padding: "12px 18px", flex: 1, minWidth: "120px", textAlign: "left" }}>
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
            <div style={{ fontWeight: 800, fontSize: "0.95rem", color: cat.color }}>{cat.labelEn}</div>
            <div style={{ marginLeft: "auto", background: cat.color + "15", color: cat.color, borderRadius: "20px", padding: "2px 10px", fontSize: "0.68rem", fontWeight: 700 }}>{cat.reports.length} reports</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "10px" }}>
            {cat.reports.map(r => (
              <button key={r.id} onClick={() => setActiveReport(r.id)}
                style={{ background: "#fff", border: `1.5px solid ${cat.color}25`, borderRadius: "12px", padding: "14px 16px", cursor: "pointer", textAlign: "right", fontFamily: "inherit", transition: "all 0.15s", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = cat.color; e.currentTarget.style.background = cat.color + "08"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = cat.color + "25"; e.currentTarget.style.background = "#fff"; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                <div style={{ fontSize: "1.4rem", marginBottom: "6px" }}>{r.icon}</div>
                <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#1e293b", marginBottom: "2px" }}>{r.labelEn}</div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
