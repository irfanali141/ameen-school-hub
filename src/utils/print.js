/* eslint-disable */
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import logoImg from "../logo.png";
import { HOUSES, HVS_TOTAL } from "../constants";

// ===== LOGO LOADER =====
function loadLogoBase64() {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      canvas.getContext("2d").drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/jpeg"));
    };
    img.onerror = () => resolve(null);
    img.src = logoImg;
  });
}

// ===== PRINT UTILITY FUNCTION =====
async function printReport(title, contentHtml, subtitle = "") {
  const logo = await loadLogoBase64();
  const printWindow = window.open("", "_blank", "width=900,height=700");
  printWindow.document.write(`
    <!DOCTYPE html>
    <html dir="rtl" lang="ur">
    <head>
      <meta charset="UTF-8"/>
      <title>${title}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;700&family=Cinzel:wght@700&display=swap');
        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family:'Noto Nastaliq Urdu','Arial',sans-serif; direction:rtl; background:#fff; color:#1e293b; padding:20px; }
        .header { background:linear-gradient(135deg,#0f172a,#1e3a5f); color:white; padding:20px 30px; border-radius:12px; margin-bottom:20px; display:flex; align-items:center; justify-content:space-between; }
        .header-right { text-align:right; }
        .school-name { font-size:1.4rem; font-weight:800; color:#b7860b; }
        .school-sub { font-size:0.7rem; opacity:0.7; font-family:'Cinzel',serif; letter-spacing:0.1em; margin-top:4px; }
        .report-title { font-size:1.1rem; font-weight:700; color:white; margin-top:8px; }
        .report-subtitle { font-size:0.75rem; opacity:0.6; margin-top:4px; }
        .header-left { text-align:left; }
        .seal { width:70px; height:70px; background:conic-gradient(#b7860b,#e4b030,#b7860b,#e4b030,#b7860b); border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:1.5rem; }
        .date-box { background:rgba(183,134,11,0.2); border:1px solid #b7860b; border-radius:8px; padding:6px 14px; font-size:0.7rem; color:#b7860b; margin-top:8px; direction:ltr; text-align:center; }
        .content { margin-top:0; }
        table { width:100%; border-collapse:collapse; margin-bottom:16px; }
        th { background:#1e293b; color:#b7860b; padding:10px 12px; font-size:0.72rem; text-align:right; }
        td { padding:9px 12px; font-size:0.68rem; border-bottom:1px solid #f0ede8; }
        tr:nth-child(even) td { background:#fafafa; }
        .badge { display:inline-block; padding:3px 10px; border-radius:20px; font-size:0.62rem; font-weight:700; }
        .badge-green { background:#dcfce7; color:#16a34a; }
        .badge-red { background:#fee2e2; color:#dc2626; }
        .badge-amber { background:#fef3c7; color:#d97706; }
        .badge-blue { background:#dbeafe; color:#1e40af; }
        .stat-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; margin-bottom:16px; }
        .stat-card { background:#f8fafc; border-radius:10px; padding:14px; text-align:center; border:1px solid #e2e8f0; }
        .stat-num { font-size:1.4rem; font-weight:900; }
        .stat-label { font-size:0.6rem; color:#888; margin-top:4px; }
        .section-title { font-size:0.85rem; font-weight:700; color:#1e293b; padding:10px 0; border-bottom:2px solid #f5e9c8; margin-bottom:12px; }
        .footer { margin-top:30px; padding-top:16px; border-top:2px solid #f5e9c8; display:flex; justify-content:space-between; align-items:center; }
        .footer-text { font-size:0.6rem; color:#888; }
        .signature-box { border-top:1px solid #1e293b; width:150px; text-align:center; padding-top:6px; font-size:0.6rem; color:#888; }
        .pct-bar { height:6px; background:#e2e8f0; border-radius:3px; overflow:hidden; margin-top:4px; }
        .pct-fill { height:100%; border-radius:3px; }
        @media print {
          body { padding:10px; }
          .no-print { display:none !important; }
          button { display:none !important; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="header-right">
          <div class="school-name">امین اسلامک انسٹی ٹیوٹ</div>
          <div class="school-sub">AMEEN ISLAMIC INSTITUTE • SWAT</div>
          <div class="report-title">${title}</div>
          ${subtitle ? `<div class="report-subtitle">${subtitle}</div>` : ""}
          <div class="date-box">تاریخ: ${new Date().toLocaleDateString("ur-PK")}</div>
        </div>
        <div class="header-left">
          ${logo ? `<img src="${logo}" style="width:95px;height:95px;border-radius:10px;object-fit:contain;background:white;padding:4px;" />` : `<div class="seal">☪</div>`}
        </div>
      </div>

      <div class="content">${contentHtml}</div>

      <div class="footer">
        <div class="footer-text">امین اسلامک انسٹی ٹیوٹ — سوات • یہ دستاویز AmeenSchoolHub سے تیار کی گئی ہے</div>
        <div style="display:flex;gap:30px;">
          <div class="signature-box">پرنسپل دستخط</div>
          <div class="signature-box">مہر</div>
        </div>
      </div>

      <div class="no-print" style="text-align:center;margin-top:20px;display:flex;gap:10px;justify-content:center;">
        <button onclick="window.print()" style="background:#1e293b;color:#b7860b;border:none;padding:12px 30px;border-radius:10px;font-size:1rem;cursor:pointer;font-family:inherit;">🖨️ پرنٹ کریں</button>
        <button onclick="window.close()" style="background:#f1f5f9;color:#666;border:none;padding:12px 30px;border-radius:10px;font-size:1rem;cursor:pointer;">✕ بند کریں</button>
      </div>

      <script>
        setTimeout(()=>{ window.print(); }, 800);
      <\/script>
    </body>
    </html>
  `);
  printWindow.document.close();
}

// 1. Student Attendance Report
function printStudentAttendance(students, records) {
  const rows = students.map(s => {
    const recs = records.filter(r => r.studentId === s.id && r.type !== "teacher");
    const present = recs.filter(r => r.status === "present").length;
    const absent = recs.filter(r => r.status === "absent").length;
    const late = recs.filter(r => r.status === "late").length;
    const total = recs.length;
    const pct = total > 0 ? Math.round((present / total) * 100) : 0;
    const cls = pct >= 75 ? "badge-green" : pct >= 50 ? "badge-amber" : "badge-red";
    return `<tr>
      <td style="font-weight:700">${s.name}</td>
      <td>${s.fatherName || "—"}</td>
      <td>${s.grade}</td>
      <td style="color:#16a34a;font-weight:700">${present}</td>
      <td style="color:#dc2626;font-weight:700">${absent}</td>
      <td style="color:#d97706;font-weight:700">${late}</td>
      <td>${total}</td>
      <td><span class="badge ${cls}">${pct}%</span><div class="pct-bar"><div class="pct-fill" style="width:${pct}%;background:${pct>=75?"#16a34a":pct>=50?"#d97706":"#dc2626"}"></div></div></td>
    </tr>`;
  }).join("");

  const totalPresent = records.filter(r => r.status === "present" && r.type !== "teacher").length;
  const totalAbsent = records.filter(r => r.status === "absent" && r.type !== "teacher").length;

  const html = `
    <div class="stat-grid">
      <div class="stat-card"><div class="stat-num" style="color:#1e40af">${students.length}</div><div class="stat-label">کل طلبا</div></div>
      <div class="stat-card"><div class="stat-num" style="color:#16a34a">${totalPresent}</div><div class="stat-label">کل حاضری</div></div>
      <div class="stat-card"><div class="stat-num" style="color:#dc2626">${totalAbsent}</div><div class="stat-label">کل غیر حاضری</div></div>
      <div class="stat-card"><div class="stat-num" style="color:#b7860b">${records.filter(r=>r.type!=="teacher").length}</div><div class="stat-label">کل اندراجات</div></div>
    </div>
    <div class="section-title">📊 طلبا حاضری رپورٹ</div>
    <table>
      <thead><tr><th>نام</th><th>والد</th><th>جماعت</th><th>حاضر</th><th>غیر حاضر</th><th>دیر</th><th>کل</th><th>فیصد</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`;

  printReport("طلبا حاضری رپورٹ", html, `کل طلبا: ${students.length}`);
}

// 2. Teacher Attendance Report
function printTeacherAttendance(teachers, records) {
  const rows = teachers.map(t => {
    const recs = records.filter(r => r.teacherId === t.id);
    const present = recs.filter(r => r.status === "present").length;
    const absent = recs.filter(r => r.status === "absent").length;
    const late = recs.filter(r => r.status === "late").length;
    const leave = recs.filter(r => r.status === "leave").length;
    const total = recs.length;
    const pct = total > 0 ? Math.round((present / total) * 100) : 0;
    const cls = pct >= 75 ? "badge-green" : pct >= 50 ? "badge-amber" : "badge-red";
    return `<tr>
      <td style="font-weight:700">${t.name}</td>
      <td>${t.subject || "—"}</td>
      <td style="color:#16a34a;font-weight:700">${present}</td>
      <td style="color:#dc2626;font-weight:700">${absent}</td>
      <td style="color:#d97706;font-weight:700">${late}</td>
      <td style="color:#7c3aed;font-weight:700">${leave}</td>
      <td>${total}</td>
      <td><span class="badge ${cls}">${pct}%</span></td>
    </tr>`;
  }).join("");

  const html = `
    <div class="section-title">👨‍🏫 اساتذہ حاضری رپورٹ</div>
    <table>
      <thead><tr><th>نام</th><th>مضمون</th><th>حاضر</th><th>غیر حاضر</th><th>دیر</th><th>چھٹی</th><th>کل</th><th>فیصد</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`;

  printReport("اساتذہ حاضری رپورٹ", html, `کل اساتذہ: ${teachers.length}`);
}

// 3. Fee Receipt
function printFeeReceipt(student, fee) {
  const html = `
    <div style="max-width:500px;margin:0 auto;border:2px solid #b7860b;border-radius:16px;padding:24px;">
      <div class="section-title">💰 فیس رسید</div>
      <table>
        <tr><td style="font-weight:700;color:#888">طالب علم</td><td style="font-weight:800">${student?.name || "—"}</td></tr>
        <tr><td style="font-weight:700;color:#888">والد کا نام</td><td>${student?.fatherName || "—"}</td></tr>
        <tr><td style="font-weight:700;color:#888">جماعت</td><td>${student?.grade || "—"}</td></tr>
        <tr><td style="font-weight:700;color:#888">کوڈ</td><td style="direction:ltr;font-family:monospace">${student?.studentCode || "—"}</td></tr>
        <tr><td style="font-weight:700;color:#888">فیس کی قسم</td><td>${fee?.feeType || "—"}</td></tr>
        <tr><td style="font-weight:700;color:#888">مہینہ</td><td style="direction:ltr">${fee?.month || "—"}</td></tr>
        <tr><td style="font-weight:700;color:#888">رقم</td><td style="font-size:1.2rem;font-weight:900;color:#16a34a">Rs. ${(fee?.amount || 0).toLocaleString()}</td></tr>
        <tr><td style="font-weight:700;color:#888">حال</td><td><span class="badge ${fee?.status === "paid" ? "badge-green" : "badge-amber"}">${fee?.status === "paid" ? "ادا شدہ ✅" : "باقی ⏳"}</span></td></tr>
      </table>
      <div style="text-align:center;margin-top:20px;padding:16px;background:#f5e9c8;border-radius:10px;">
        <div style="font-size:0.65rem;color:#888">رسید نمبر</div>
        <div style="font-size:1rem;font-weight:900;color:#b7860b;font-family:monospace;direction:ltr">${fee?.id?.slice(0,8)?.toUpperCase() || "—"}</div>
      </div>
    </div>`;

  printReport("فیس رسید", html, student?.name);
}

// 4. Result Card
function printResultCard(student, results) {
  const studentResults = results.filter(r => r.studentId === student?.id);
  const avgPct = studentResults.length > 0
    ? Math.round(studentResults.reduce((s, r) => s + (r.percentage || 0), 0) / studentResults.length)
    : 0;
  const getGrade = (p) => p>=90?"A+":p>=80?"A":p>=70?"B":p>=60?"C":p>=50?"D":"F";

  const rows = studentResults.map(r => `<tr>
    <td style="font-weight:700">${r.exam || "—"}</td>
    <td>${r.subject || "—"}</td>
    <td>${r.obtainedMarks || 0}/${r.totalMarks || 0}</td>
    <td style="font-weight:800;color:${r.percentage>=80?"#16a34a":r.percentage>=50?"#d97706":"#dc2626"}">${r.percentage || 0}%</td>
    <td><span class="badge ${r.percentage>=80?"badge-green":r.percentage>=50?"badge-amber":"badge-red"}">${getGrade(r.percentage || 0)}</span></td>
  </tr>`).join("");

  const html = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">
      <div style="background:#f8fafc;border-radius:10px;padding:14px;border:1px solid #e2e8f0;">
        <div class="section-title">👤 طالب علم کی معلومات</div>
        <table>
          <tr><td style="color:#888;font-weight:700">نام</td><td style="font-weight:800">${student?.name || "—"}</td></tr>
          <tr><td style="color:#888;font-weight:700">والد</td><td>${student?.fatherName || "—"}</td></tr>
          <tr><td style="color:#888;font-weight:700">جماعت</td><td>${student?.grade || "—"}</td></tr>
          <tr><td style="color:#888;font-weight:700">کوڈ</td><td style="direction:ltr;font-family:monospace">${student?.studentCode || "—"}</td></tr>
        </table>
      </div>
      <div style="background:${avgPct>=80?"#dcfce7":avgPct>=50?"#fef3c7":"#fee2e2"};border-radius:10px;padding:14px;text-align:center;border:2px solid ${avgPct>=80?"#16a34a":avgPct>=50?"#d97706":"#dc2626"}">
        <div style="font-size:0.7rem;color:#888;margin-bottom:8px">مجموعی کارکردگی</div>
        <div style="font-size:3rem;font-weight:900;color:${avgPct>=80?"#16a34a":avgPct>=50?"#d97706":"#dc2626"}">${avgPct}%</div>
        <div style="font-size:1.2rem;font-weight:700;color:${avgPct>=80?"#16a34a":avgPct>=50?"#d97706":"#dc2626"}">${getGrade(avgPct)}</div>
        <div style="font-size:0.65rem;color:#888;margin-top:4px">${avgPct>=80?"شاندار 🌟":avgPct>=70?"بہت اچھا ✅":avgPct>=50?"مناسب 👍":"محنت کریں 📚"}</div>
      </div>
    </div>
    <div class="section-title">📊 مضمون وار نتائج</div>
    <table>
      <thead><tr><th>امتحان</th><th>مضمون</th><th>نمبر</th><th>فیصد</th><th>گریڈ</th></tr></thead>
      <tbody>${rows || '<tr><td colspan="5" style="text-align:center;color:#bbb;padding:20px">کوئی نتیجہ نہیں</td></tr>'}</tbody>
    </table>`;

  printReport("رزلٹ کارڈ", html, student?.name + " — " + student?.grade);
}

// 5. HVS House Report
function printHVSReport(houses, hvsLogs, students) {
  const houseRows = HOUSES.map(info => {
    const hd = houses.find(h => h.id === info.id) || {};
    const studs = students.filter(s => s.houseId === info.id);
    const logs = hvsLogs.filter(l => l.houseId === info.id);
    const avg = logs.length ? Math.round(logs.reduce((s, l) => s + (l.totalScore || 0), 0) / logs.length) : 0;
    const best = logs.length ? Math.max(...logs.map(l => l.totalScore || 0)) : 0;
    return `<tr>
      <td style="font-weight:800">${info.emoji} ${info.nameEn}</td>
      <td style="font-weight:900;color:${info.color};font-size:1rem">${hd.points || 0}</td>
      <td>${studs.length}</td>
      <td>${logs.length}</td>
      <td>${avg}/${HVS_TOTAL}</td>
      <td style="color:#16a34a;font-weight:700">${best}</td>
    </tr>`;
  }).join("");

  const sorted = [...HOUSES].map(info => ({
    ...info, points: (houses.find(h => h.id === info.id) || {}).points || 0
  })).sort((a, b) => b.points - a.points);

  const html = `
    <div class="stat-grid">
      ${sorted.slice(0, 4).map((h, i) => `<div class="stat-card" style="border-top:3px solid ${h.color}">
        <div style="font-size:1.5rem">${i===0?"👑":i===1?"🥈":i===2?"🥉":"4️⃣"}</div>
        <div style="font-size:1rem;font-weight:800;color:${h.color}">${h.emoji} ${h.nameEn}</div>
        <div class="stat-num" style="color:${h.color}">${h.points}</div>
        <div class="stat-label">پوائنٹس</div>
      </div>`).join("")}
    </div>
    <div class="section-title">🏆 ہاؤس موازنہ</div>
    <table>
      <thead><tr><th>ہاؤس</th><th>پوائنٹس</th><th>طلبا</th><th>HVS اندراجات</th><th>اوسط HVS</th><th>بہترین</th></tr></thead>
      <tbody>${houseRows}</tbody>
    </table>`;

  printReport("HVS ہاؤس رپورٹ", html, `کل ہاوسز: ${HOUSES.length}`);
}

// 6. Salary Slip
async function printSalarySlip(teacher, salary) {
  const allowances = salary?.allowances !== undefined
    ? salary.allowances
    : (salary?.houseRent || 0) + (salary?.medicalAllowance || 0) + (salary?.transport || 0) + (salary?.bonus || 0);
  const deductions = (salary?.deductions || 0) + (salary?.tax || 0);
  const net = salary?.net !== undefined ? salary.net : ((salary?.basicSalary || 0) + allowances - deductions);

  const div = document.createElement("div");
  div.style.cssText = "position:fixed;top:-9999px;left:-9999px;width:580px;direction:rtl;font-family:Noto Nastaliq Urdu,Amiri,serif;background:white;padding:28px;box-sizing:border-box;";
  div.innerHTML = `
    <div style="border:2px solid #b7860b;border-radius:16px;padding:24px;background:white;">
      <div style="text-align:center;margin-bottom:16px;">
        <div style="font-size:1.1rem;font-weight:900;color:#b7860b;">امین اسکول ہب</div>
        <div style="font-size:0.62rem;color:#888;letter-spacing:0.1em;margin-bottom:6px;">AMEEN ISLAMIC INSTITUTE &bull; SWAT</div>
        <div style="font-size:0.85rem;font-weight:700;color:#1e293b;border-bottom:2px solid #b7860b40;padding-bottom:8px;">💼 تنخواہ سلپ</div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">
        <div style="background:#f8fafc;padding:12px;border-radius:10px;">
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="color:#888;font-size:0.62rem;padding:3px 4px;">نام</td><td style="font-weight:800;font-size:0.68rem;padding:3px 4px;">${teacher?.name || "—"}</td></tr>
            <tr><td style="color:#888;font-size:0.62rem;padding:3px 4px;">مضمون</td><td style="font-size:0.68rem;padding:3px 4px;">${teacher?.subject || "—"}</td></tr>
            <tr><td style="color:#888;font-size:0.62rem;padding:3px 4px;">کوڈ</td><td style="direction:ltr;font-family:monospace;font-size:0.68rem;padding:3px 4px;">${teacher?.employeeCode || "—"}</td></tr>
            <tr><td style="color:#888;font-size:0.62rem;padding:3px 4px;">مہینہ</td><td style="direction:ltr;font-size:0.68rem;padding:3px 4px;">${salary?.month || "—"} ${salary?.year || ""}</td></tr>
          </table>
        </div>
        <div style="background:#f8fafc;padding:12px;border-radius:10px;">
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="color:#888;font-size:0.62rem;padding:3px 4px;">بنیادی تنخواہ</td><td style="font-weight:700;font-size:0.68rem;padding:3px 4px;">Rs. ${(salary?.basicSalary || 0).toLocaleString()}</td></tr>
            ${salary?.houseRent > 0 ? `<tr><td style="color:#16a34a;font-size:0.62rem;padding:3px 4px;">مکان کرایہ</td><td style="color:#16a34a;font-weight:700;font-size:0.68rem;padding:3px 4px;">+ Rs. ${Number(salary.houseRent).toLocaleString()}</td></tr>` : ""}
            ${salary?.medicalAllowance > 0 ? `<tr><td style="color:#16a34a;font-size:0.62rem;padding:3px 4px;">طبی الاؤنس</td><td style="color:#16a34a;font-weight:700;font-size:0.68rem;padding:3px 4px;">+ Rs. ${Number(salary.medicalAllowance).toLocaleString()}</td></tr>` : ""}
            ${salary?.transport > 0 ? `<tr><td style="color:#16a34a;font-size:0.62rem;padding:3px 4px;">ٹرانسپورٹ</td><td style="color:#16a34a;font-weight:700;font-size:0.68rem;padding:3px 4px;">+ Rs. ${Number(salary.transport).toLocaleString()}</td></tr>` : ""}
            ${salary?.bonus > 0 ? `<tr><td style="color:#16a34a;font-size:0.62rem;padding:3px 4px;">بونس</td><td style="color:#16a34a;font-weight:700;font-size:0.68rem;padding:3px 4px;">+ Rs. ${Number(salary.bonus).toLocaleString()}</td></tr>` : ""}
            ${salary?.allowances > 0 ? `<tr><td style="color:#16a34a;font-size:0.62rem;padding:3px 4px;">الاؤنسز</td><td style="color:#16a34a;font-weight:700;font-size:0.68rem;padding:3px 4px;">+ Rs. ${Number(salary.allowances).toLocaleString()}</td></tr>` : ""}
            ${salary?.deductions > 0 ? `<tr><td style="color:#dc2626;font-size:0.62rem;padding:3px 4px;">کٹوتی</td><td style="color:#dc2626;font-weight:700;font-size:0.68rem;padding:3px 4px;">- Rs. ${Number(salary.deductions).toLocaleString()}</td></tr>` : ""}
            ${salary?.tax > 0 ? `<tr><td style="color:#dc2626;font-size:0.62rem;padding:3px 4px;">ٹیکس</td><td style="color:#dc2626;font-weight:700;font-size:0.68rem;padding:3px 4px;">- Rs. ${Number(salary.tax).toLocaleString()}</td></tr>` : ""}
          </table>
        </div>
      </div>
      <div style="background:linear-gradient(135deg,#0f172a,#1e3a5f);border-radius:12px;padding:20px;text-align:center;">
        <div style="color:rgba(255,255,255,0.6);font-size:0.7rem;">خالص تنخواہ</div>
        <div style="font-size:2rem;font-weight:900;color:#b7860b;">Rs. ${net.toLocaleString()}</div>
        <div style="color:rgba(255,255,255,0.4);font-size:0.6rem;margin-top:4px;">${salary?.month || ""} ${salary?.year || ""}</div>
      </div>
      ${salary?.notes ? `<div style="margin-top:12px;padding:10px;background:#fef3c7;border-radius:8px;font-size:0.62rem;color:#92400e;">نوٹ: ${salary.notes}</div>` : ""}
    </div>`;

  const [logo] = await Promise.all([loadLogoBase64(), Promise.resolve()]);

  document.body.appendChild(div);
  try {
    const canvas = await html2canvas(div, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const logoSize = 25;
    const logoX = 8;
    const logoY = 5;
    const contentY = 38;
    const imgWidth = pageWidth - 20;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Navy header bar
    pdf.setFillColor(15, 23, 42);
    pdf.rect(0, 0, pageWidth, contentY - 2, "F");

    // Logo at top left using jsPDF addImage
    if (logo) pdf.addImage(logo, "JPEG", logoX, logoY, logoSize, logoSize);

    // School name text to the right of the logo
    const textX = logoX + logoSize + 4;
    pdf.setTextColor(183, 134, 11);
    pdf.setFontSize(11);
    pdf.text("AMEEN ISLAMIC INSTITUTE", textX, 15);
    pdf.setTextColor(180, 180, 180);
    pdf.setFontSize(7);
    pdf.text("SWAT  •  Salary Slip", textX, 23);

    // Salary slip content below header
    pdf.addImage(imgData, "PNG", 10, contentY, imgWidth, imgHeight);

    const fileName = `salary-slip-${teacher?.name || "teacher"}-${salary?.month || "month"}.pdf`;
    pdf.save(fileName);
  } finally {
    document.body.removeChild(div);
  }
}

// Print Button Component
function PrintBtn({ onClick, label = "🖨️ پرنٹ / PDF" }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: `linear-gradient(135deg,#1e293b,#1e3a5f)`,
        color: "#b7860b",
        border: `1px solid #b7860b40`,
        borderRadius: "12px",
        padding: "10px 20px",
        fontSize: "0.65rem",
        cursor: "pointer",
        fontFamily: "inherit",
        fontWeight: "700",
        display: "flex",
        alignItems: "center",
        gap: "6px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
      }}
    >
      🖨️ {label}
    </button>
  );
}

export { printReport, printStudentAttendance, printTeacherAttendance, printFeeReceipt, printResultCard, printHVSReport, printSalarySlip, PrintBtn };
