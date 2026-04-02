/* eslint-disable */
import { useState, useRef } from "react";
import { supabase } from "../../supabase";

const G = "#d4af37", N = "#0f172a";

const ROLE_ACTIONS = {
  director:    ["add_fee","mark_fee_paid","add_result","add_marks","add_house_points","add_attendance","update_student"],
  admin:       ["add_fee","mark_fee_paid","add_result","add_marks","add_house_points","add_attendance","update_student"],
  teacher:     ["add_result","add_marks","add_attendance"],
  finance:     ["add_fee","mark_fee_paid"],
  housemaster: ["add_house_points","add_hvs"],
};

const ACTION_ICON = {
  add_fee:"💰", mark_fee_paid:"✅", add_result:"📊",
  add_marks:"✏️", add_house_points:"🏆", add_attendance:"📋",
  update_student:"🎓", add_hvs:"🏅",
};

const inp = {
  width:"100%", padding:"11px 14px", borderRadius:10,
  border:"1px solid rgba(212,175,55,0.25)",
  background:"rgba(255,255,255,0.06)", color:"#f1f5f9",
  fontSize:"0.85rem", outline:"none", fontFamily:"inherit",
  boxSizing:"border-box", colorScheme:"dark",
};

export default function AICommandCenter({ students, teachers, houses, userRole, addData, updateData }) {
  const [command, setCommand] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);
  const [history, setHistory] = useState([]);
  const [executing, setExec]  = useState(false);
  const [done, setDone]       = useState(false);
  const [error, setError]     = useState("");
  const [activeTab, setActiveTab] = useState("ai");
  const [csvResult, setCsvResult] = useState(null);
  const [csvLoading, setCsvLoading] = useState(false);
  const [csvProgress, setCsvProgress] = useState({ done: 0, total: 0 });
  const [streamDots, setStreamDots] = useState("");
  const mediaRecRef = useRef(null);
  const [listening, setListening] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [micError, setMicError] = useState("");
  const [interimText, setInterimText] = useState("");

  const TODAY = new Date().toISOString().split("T")[0];

  // ── CSV Template download ──
  const TEMPLATES = {
    fees:       `student_name,amount,type,YYYY-MM\nAhmad Ali,3000,monthly,${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,"0")}\nBilal Khan,2500,monthly,${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,"0")}`,
    students:   "name,fatherName,grade,section,studentCode,phone,talent,status\nAhmad Ali,Usman Ali,7,A,S001,0300-1234567,cricket,active\nBilal Khan,Tariq Khan,8,B,S002,,,active",
    teachers:   "name,subject,grade,employeeCode,phone,qualification\nFatima Noor,Mathematics,7-9,T001,0301-1234567,MSc Math\nAli Hassan,Urdu,6-8,T002,0302-9876543,MA Urdu",
    results:    `studentName,exam,subject,totalMarks,obtainedMarks,date\nAhmad Ali,Mid Term,Math,100,85,${TODAY}\nBilal Khan,Mid Term,Urdu,50,42,${TODAY}`,
    attendance: `studentName,date,status\nAhmad Ali,${TODAY},present\nBilal Khan,${TODAY},absent\nSara Noor,${TODAY},late`,
    hifz:       `studentName,surah,ayahs,type,rating,date\nAhmad Ali,Al-Baqarah,1-5,sabaq,4,${TODAY}\nBilal Khan,Al-Imran,10-15,sabqi,3,`,
    homework:   `grade,subject,title,description,due_date,total_marks\nGrade 7,ریاضی,صفحہ 15-18 حل کریں,مسائل حل کریں,${new Date(Date.now()+3*86400000).toISOString().split("T")[0]},10\nGrade 8,اردو,مضمون لکھیں,,${new Date(Date.now()+5*86400000).toISOString().split("T")[0]},20`,
  };
  const downloadTemplate = (type) => {
    const blob = new Blob([TEMPLATES[type]], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${type}_template.csv`;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  // ── Role-based CSV tab visibility ──
  const CSV_TABS_FOR_ROLE = {
    director:    ["fees","students","teachers","results","attendance","hifz","homework"],
    admin:       ["fees","students","teachers","results","attendance","hifz","homework"],
    teacher:     ["results","attendance","hifz","homework"],
    finance:     ["fees"],
    housemaster: ["hifz"],
  };
  const allowedCsvTabs = CSV_TABS_FOR_ROLE[userRole] || ["fees","students","teachers","results","attendance","hifz","homework"];

  const findStudent = (nameOrCode) =>
    students.find(s =>
      s.name?.toLowerCase().includes(nameOrCode.toLowerCase()) ||
      s.studentCode?.toLowerCase() === nameOrCode.toLowerCase()
    );

  const calcGrade = (pct) =>
    pct >= 90 ? "A+" : pct >= 80 ? "A" : pct >= 70 ? "B" : pct >= 60 ? "C" : pct >= 50 ? "D" : "F";

  const runCSV = async (file, handler) => {
    setCsvLoading(true); setCsvResult(null); setCsvProgress({ done: 0, total: 0 });
    const text = await file.text();
    const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
    const header = lines[0]?.toLowerCase();
    const dataLines = (header?.includes("name") || header?.includes("student") ||
      header?.includes("teacher") || header?.includes("date"))
      ? lines.slice(1) : lines;
    setCsvProgress({ done: 0, total: dataLines.length });
    let ok = 0, skip = 0, errs = [];
    for (let i = 0; i < dataLines.length; i++) {
      const cols = dataLines[i].split(",").map(s => s?.trim());
      const res = await handler(cols);
      if (res === true) ok++;
      else { skip++; if (typeof res === "string") errs.push(res); }
      setCsvProgress({ done: i + 1, total: dataLines.length });
    }
    setCsvResult({ ok, skip, errs });
    setCsvLoading(false);
  };

  // ── Fees CSV ──
  const handleFeeCSV = (e) => {
    const file = e.target.files[0]; if (!file) return;
    e.target.value = "";
    runCSV(file, async ([nameOrCode, amtStr, typeStr, monthStr]) => {
      if (!nameOrCode || !amtStr) return false;
      const st = findStudent(nameOrCode);
      if (!st) return `نہیں ملا: ${nameOrCode}`;
      const [yr, mo] = monthStr ? monthStr.split("-").map(Number)
        : [new Date().getFullYear(), new Date().getMonth() + 1];
      try {
        await addData("fees", {
          student_id: st.id, student_name: st.name,
          amount: parseFloat(amtStr) || 0,
          type: typeStr || "monthly",
          month: mo || new Date().getMonth() + 1,
          year: yr || new Date().getFullYear(),
          status: "pending",
        });
        return true;
      } catch (err) { return `${st.name}: ${err.message}`; }
    });
  };

  // ── Students CSV ──
  const handleStudentsCSV = (e) => {
    const file = e.target.files[0]; if (!file) return;
    e.target.value = "";
    runCSV(file, async ([name, fatherName, grade, section, studentCode, phone, talent, status]) => {
      if (!name) return false;
      // Duplicate check
      const dup = students.find(s =>
        s.name?.toLowerCase() === name.toLowerCase() ||
        (studentCode && s.studentCode?.toLowerCase() === studentCode.toLowerCase())
      );
      if (dup) return `duplicate — پہلے سے موجود: ${name}`;
      try {
        await addData("students", {
          name, fatherName: fatherName || "", grade: grade || "",
          section: section || "", studentCode: studentCode || "",
          phone: phone || "", talent: talent || "",
          enrollmentStatus: status || "active", canteenBalance: 0,
        });
        return true;
      } catch (err) { return `${name}: ${err.message}`; }
    });
  };

  // ── Teachers CSV ──
  const handleTeachersCSV = (e) => {
    const file = e.target.files[0]; if (!file) return;
    e.target.value = "";
    runCSV(file, async ([name, subject, grade, employeeCode, phone, qualification]) => {
      if (!name) return false;
      // Duplicate check
      const dup = teachers.find(t =>
        t.name?.toLowerCase() === name.toLowerCase() ||
        (employeeCode && t.employeeCode?.toLowerCase() === employeeCode.toLowerCase())
      );
      if (dup) return `duplicate — پہلے سے موجود: ${name}`;
      try {
        await addData("teachers", {
          name, subject: subject || "", grade: grade || "",
          employeeCode: employeeCode || "", phone: phone || "",
          qualification: qualification || "", status: "active",
        });
        return true;
      } catch (err) { return `${name}: ${err.message}`; }
    });
  };

  // ── Results CSV ──
  const handleResultsCSV = (e) => {
    const file = e.target.files[0]; if (!file) return;
    e.target.value = "";
    runCSV(file, async ([nameOrCode, exam, subject, totalStr, obtainedStr, date]) => {
      if (!nameOrCode || !totalStr || !obtainedStr) return false;
      const st = findStudent(nameOrCode);
      if (!st) return `نہیں ملا: ${nameOrCode}`;
      const total = parseFloat(totalStr) || 100;
      const obtained = parseFloat(obtainedStr) || 0;
      const pct = Math.round((obtained / total) * 100);
      try {
        await addData("results", {
          studentId: st.id, exam: exam || "ٹیسٹ", subject: subject || "عام",
          totalMarks: total, obtainedMarks: obtained,
          percentage: pct, grade: calcGrade(pct),
          date: date || TODAY,
        });
        return true;
      } catch (err) { return `${st.name}: ${err.message}`; }
    });
  };

  // ── Attendance CSV ──
  const handleAttendanceCSV = (e) => {
    const file = e.target.files[0]; if (!file) return;
    e.target.value = "";
    runCSV(file, async ([nameOrCode, date, statusStr]) => {
      if (!nameOrCode) return false;
      const st = findStudent(nameOrCode);
      if (!st) return `نہیں ملا: ${nameOrCode}`;
      const validStatus = ["present","absent","late","leave"].includes(statusStr?.toLowerCase())
        ? statusStr.toLowerCase() : "present";
      try {
        await addData("attendance", {
          studentId: st.id, studentName: st.name,
          date: date || TODAY, status: validStatus,
          grade: st.grade || "", type: "student",
        });
        return true;
      } catch (err) { return `${st.name}: ${err.message}`; }
    });
  };

  // ── Homework CSV ──
  const handleHomeworkCSV = (e) => {
    const file = e.target.files[0]; if (!file) return;
    e.target.value = "";
    runCSV(file, async ([grade, subject, title, description, due_date, total_marks]) => {
      if (!grade || !subject || !title || !due_date) return `مکمل نہیں: ${title||"؟"}`;
      try {
        const { supabase: sb } = await import("../../supabase");
        const { error } = await sb.from("homework").insert({
          grade, subject, title,
          description: description || "",
          due_date,
          total_marks: parseInt(total_marks) || 10,
          assigned_by: "csv_upload",
          created_at: new Date().toISOString(),
        });
        if (error) throw new Error(error.message);
        return true;
      } catch (err) { return `${title}: ${err.message}`; }
    });
  };

  // ── Hifz CSV ──
  const handleHifzCSV = (e) => {
    const file = e.target.files[0]; if (!file) return;
    e.target.value = "";
    runCSV(file, async ([nameOrCode, surah, ayahs, type, ratingStr, date]) => {
      if (!nameOrCode || !surah) return false;
      const st = findStudent(nameOrCode);
      if (!st) return `نہیں ملا: ${nameOrCode}`;
      const validType = ["sabaq","sabqi","manzil"].includes(type?.toLowerCase())
        ? type.toLowerCase() : "sabaq";
      try {
        await addData("hifz_logs", {
          studentId: st.id, surah, ayahs: ayahs || "",
          type: validType, rating: parseInt(ratingStr) || 3,
          date: date || TODAY, notes: "",
        });
        return true;
      } catch (err) { return `${st.name}: ${err.message}`; }
    });
  };

  const allowedActions = ROLE_ACTIONS[userRole] || [];

  const sendCommand = async () => {
    if (!command.trim()) return;
    setLoading(true); setResult(null); setDone(false); setError(""); setStreamDots("");
    const dotsInterval = setInterval(() => setStreamDots(d => d.length >= 3 ? "" : d + "·"), 400);

    try {
      const resp = await fetch("/api/ai", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          task: "ai_command",
          data: {
            command: command.trim(),
            role: userRole,
            students: students || [],
            teachers: teachers || [],
            houses: houses || [],
          }
        })
      });

      if (!resp.ok) throw new Error("Server error");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done: d, value } = await reader.read();
        if (d) break;
        const chunk = decoder.decode(value);
        for (const line of chunk.split("\n")) {
          if (!line.startsWith("data: ")) continue;
          try {
            const json = JSON.parse(line.slice(6));
            if (json.text) fullText += json.text;
          } catch {}
        }
      }

      // Extract JSON from response — strip markdown code blocks first
      let clean = fullText
        .replace(/```json/gi, "").replace(/```/g, "").trim();
      const jsonMatch = clean.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("AI نے غلط format میں جواب دیا");
      let jsonStr = jsonMatch[0]
        .replace(/[\u0000-\u001F\u007F]/g, " ") // remove control chars
        .replace(/,\s*}/g, "}").replace(/,\s*]/g, "]"); // trailing commas
      const parsed = JSON.parse(jsonStr);
      setResult(parsed);

    } catch (e) {
      setError("⚠️ خرابی: " + e.message);
    }
    clearInterval(dotsInterval);
    setLoading(false);
  };

  const executeAction = async () => {
    if (!result || !result.action) return;
    setExec(true);
    const p = result.params || {};

    try {
      let msg = "";
      // Resolve student name from students list if AI didn't return it
      const resolveStudent = (id, name) => {
        if (name && name !== "undefined") return name;
        return students.find(s => s.id === id)?.name || id || "طالب علم";
      };

      if (result.action === "add_fee") {
        // Use exact DB column names: student_id, type, month(int), year, due_date
        const feeMonth = p.month ? parseInt(p.month) : new Date().getMonth() + 1;
        await addData("fees", {
          student_id: p.student_id,
          student_name: resolveStudent(p.student_id, p.student_name),
          amount: parseFloat(p.amount) || 0,
          type: p.fee_type || p.type || "monthly",
          month: isNaN(feeMonth) ? new Date().getMonth() + 1 : feeMonth,
          year: new Date().getFullYear(),
          status: "pending",
          due_date: p.due_date || p.dueDate || null,
        });
        msg = `✅ ${resolveStudent(p.student_id, p.student_name)} کی ${p.amount} روپے فیس شامل ہوگئی`;
      }

      else if (result.action === "mark_fee_paid") {
        // DB uses snake_case column names in direct queries
        const { data: pendingFees } = await supabase.from("fees")
          .select("id").eq("student_id", p.student_id).eq("status","pending").limit(1);
        if (pendingFees && pendingFees.length > 0) {
          await updateData("fees", pendingFees[0].id, { status:"paid", paid_date: new Date().toISOString().split("T")[0] });
          msg = `✅ ${resolveStudent(p.student_id, p.student_name)} کی فیس paid مارک ہوگئی`;
        } else {
          msg = `⚠️ ${resolveStudent(p.student_id, p.student_name)} کی کوئی pending فیس نہیں ملی`;
        }
      }

      else if (result.action === "add_result") {
        await addData("results", {
          studentId: p.student_id,
          studentName: resolveStudent(p.student_id, p.student_name),
          subject: p.subject || "عام",
          examName: p.exam_name || p.examName || "ٹیسٹ",
          marks: parseFloat(p.marks) || 0,
          totalMarks: parseFloat(p.total_marks) || 100,
          grade: p.result_grade || p.grade || "",
          examDate: new Date().toISOString().split("T")[0],
        });
        msg = `✅ ${resolveStudent(p.student_id, p.student_name)} کا نتیجہ (${p.marks}/${p.total_marks}) شامل ہوگیا`;
      }

      else if (result.action === "add_marks") {
        await addData("marks_entries", {
          studentId: p.student_id,
          studentName: resolveStudent(p.student_id, p.student_name),
          subject: p.subject || "",
          marks: parseFloat(p.marks) || 0,
          totalMarks: parseFloat(p.total_marks) || 100,
          examType: p.exam_type || p.examType || "ٹیسٹ",
          grade: p.grade || "",
          date: new Date().toISOString().split("T")[0],
        });
        msg = `✅ ${resolveStudent(p.student_id, p.student_name)} کے ${p.marks} نمبرات شامل ہوگئے`;
      }

      else if (result.action === "add_house_points") {
        const house = houses.find(h =>
          h.id === p.house_id ||
          h.name?.toLowerCase().includes((p.house_name||"").toLowerCase())
        );
        if (house) {
          await updateData("houses", house.id, {
            points: (house.points || 0) + (parseFloat(p.points) || 0)
          });
          msg = `✅ ${p.house_name || house.name} کو ${p.points} پوائنٹ دیے گئے`;
        } else {
          msg = `⚠️ گھر نہیں ملا: ${p.house_name}`;
        }
      }

      else if (result.action === "add_attendance") {
        await addData("attendance", {
          studentId: p.student_id,
          studentName: resolveStudent(p.student_id, p.student_name),
          status: p.status || "present",
          date: p.date || new Date().toISOString().split("T")[0],
          grade: p.grade || "",
        });
        msg = `✅ ${resolveStudent(p.student_id, p.student_name)} کی حاضری (${p.status}) لگ گئی`;
      }

      else if (result.action === "update_student") {
        const updates = {};
        if (p.phone) updates.phone = p.phone;
        if (p.canteenBalance !== undefined) updates.canteenBalance = p.canteenBalance;
        if (p.talent) updates.talent = p.talent;
        if (p.section) updates.section = p.section;
        await updateData("students", p.student_id, updates);
        msg = `✅ ${resolveStudent(p.student_id, p.student_name)} کی معلومات update ہوگئی`;
      }

      else {
        msg = `⚠️ یہ action ابھی support نہیں ہے: ${result.action}`;
      }

      setHistory(prev => [
        { command, result, msg, time: new Date().toLocaleTimeString("ur") },
        ...prev.slice(0, 9)
      ]);
      setDone(true);
      setResult(prev => ({ ...prev, _successMsg: msg }));
      setCommand("");

    } catch (e) {
      setError("⚠️ عمل ناکام: " + e.message);
    }
    setExec(false);
  };

  const cancel = () => { setResult(null); setDone(false); setError(""); };

  // ── Voice Input ──
  // ── Voice: MediaRecorder → Groq Whisper (Google پر depend نہیں) ──
  const startListening = () => {
    setMicError(""); setInterimText("");
    if (!navigator.mediaDevices?.getUserMedia) {
      setMicError("آپ کا browser recording support نہیں کرتا — Chrome/Edge استعمال کریں"); return;
    }
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        // بہترین format جو browser support کرے
        const mimeType = ["audio/webm;codecs=opus","audio/webm","audio/ogg","audio/mp4"]
          .find(t => MediaRecorder.isTypeSupported(t)) || "";
        const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});
        const chunks = [];
        setListening(true);
        recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
        recorder.onstop = async () => {
          stream.getTracks().forEach(t => t.stop());
          setListening(false);
          setTranscribing(true);
          try {
            const blob = new Blob(chunks, { type: mimeType || "audio/webm" });
            // blob → base64
            const base64 = await new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result.split(",")[1]);
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            });
            const resp = await fetch("/api/ai", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ task: "transcribe", data: { audio: base64, mimeType: blob.type } }),
            });
            const contentType = resp.headers.get("content-type") || "";
            if (contentType.includes("text/html")) {
              // npm start میں API کام نہیں کرتی
              setMicError("⚠️ آواز کے لیے terminal میں: vercel dev چلائیں (npm start کی جگہ)");
              setTranscribing(false);
              return;
            }
            const data = await resp.json();
            if (data.text) {
              setCommand(prev => prev ? prev + " " + data.text : data.text);
            } else {
              setMicError(data.error || "آواز سمجھ نہیں آئی، دوبارہ کوشش کریں");
            }
          } catch (err) {
            setMicError("خرابی: " + err.message);
          }
          setTranscribing(false);
        };
        recorder.start(1000); // ہر سیکنڈ chunk بھیجے — memory میں اکٹھا نہ ہو
        mediaRecRef.current = recorder;
        // 15 سیکنڈ بعد خود بخود بند — بہت بڑی فائل نہ بنے
        setTimeout(() => { if (mediaRecRef.current?.state === "recording") mediaRecRef.current.stop(); }, 15000);
      })
      .catch(err => {
        setMicError(err.name === "NotAllowedError"
          ? "Microphone کی اجازت دیں — browser کے address bar میں 🔒 icon پر click کریں"
          : "Microphone نہیں ملا: " + err.message);
      });
  };

  const stopListening = () => {
    mediaRecRef.current?.stop();
  };

  const EXAMPLES = [
    "احمد علی کی 5000 روپے ماہانہ فیس شامل کرو",
    "محمد عمر کی فیس paid مارک کرو",
    "Grade 7 کے یوسف خان کو ریاضی میں 85 نمبر دو",
    "Abu Bakr house کو 15 پوائنٹ دو",
    "حمزہ راشد کی آج حاضری لگاؤ",
    "عبداللہ کا فون نمبر 0300-1234567 کرو",
  ];

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(160deg,#0f172a 0%,#0d1f3c 60%,#0f172a 100%)",
      padding:"24px 20px", fontFamily:"'Public Sans',sans-serif", direction:"rtl" }}>

      {/* Header */}
      <div style={{ marginBottom:24 }}>
        <h1 style={{ color:G, margin:"0 0 4px", fontSize:22 }}>🤖 AI کمانڈ سینٹر</h1>
        <p style={{ color:"#64748b", margin:0, fontSize:13 }}>
          اردو میں حکم دیں — AI سمجھ کر data ڈال دے گا
        </p>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginTop:10 }}>
          {(allowedActions).map(a => (
            <span key={a} style={{ background:"rgba(212,175,55,0.1)", color:G,
              padding:"2px 12px", borderRadius:20, fontSize:11, fontWeight:600 }}>
              {ACTION_ICON[a]} {a}
            </span>
          ))}
        </div>
      </div>

      {/* Tab Toggle */}
      <div style={{ display:"flex", gap:6, marginBottom:16, flexWrap:"wrap" }}>
        {[
          { id:"ai",         label:"🤖 AI حکم",   always: true },
          { id:"fees",       label:"💰 Fees",      always: false },
          { id:"students",   label:"🎓 طلبہ",      always: false },
          { id:"teachers",   label:"👩‍🏫 اساتذہ",   always: false },
          { id:"results",    label:"📊 نتائج",     always: false },
          { id:"attendance", label:"📋 حاضری",     always: false },
          { id:"hifz",       label:"📖 حفظ",       always: false },
          { id:"homework",   label:"📝 ہوم ورک",   always: false },
        ].filter(tab => tab.always || allowedCsvTabs.includes(tab.id))
         .map(tab => (
          <button key={tab.id} onClick={() => { setActiveTab(tab.id); setCsvResult(null); }}
            style={{ padding:"8px 16px", borderRadius:9, border:"none", cursor:"pointer",
              fontFamily:"inherit", fontWeight:700, fontSize:12,
              background: activeTab === tab.id ? G : "rgba(255,255,255,0.06)",
              color: activeTab === tab.id ? N : "#64748b" }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* CSV Upload Panels */}
      {activeTab !== "ai" && (() => {
        const PANELS = {
          fees: {
            title: "💰 CSV فائل سے ایک ساتھ fees ڈالیں",
            desc: "سارے طلبہ کی fees ایک CSV میں لکھ کر upload کریں",
            format: `student_name,amount,type,YYYY-MM\nAhmad Ali,3000,monthly,2024-04\nBilal Khan,2500,monthly,2024-04\nSara Noor,3000,admission,`,
            notes: "• type: monthly / admission / exam / hostel / transport\n• YYYY-MM optional — نہ لکھیں تو آج کا مہینہ",
            handler: handleFeeCSV,
            okLabel: "fees",
          },
          students: {
            title: "🎓 CSV فائل سے طلبہ شامل کریں",
            desc: "نئے طلبہ کی فہرست CSV میں بنا کر ایک ساتھ upload کریں",
            format: `name,fatherName,grade,section,studentCode,phone,talent,status\nAhmad Ali,Usman Ali,7,A,S001,0300-1234567,cricket,active\nBilal Khan,Tariq Khan,8,B,S002,,,active`,
            notes: "• status: active / inactive (default: active)\n• studentCode optional",
            handler: handleStudentsCSV,
            okLabel: "طلبہ",
          },
          teachers: {
            title: "👩‍🏫 CSV فائل سے اساتذہ شامل کریں",
            desc: "اساتذہ کی فہرست CSV میں بنا کر upload کریں",
            format: `name,subject,grade,employeeCode,phone,qualification\nFatima Noor,Mathematics,7-9,T001,0301-1234567,MSc Math\nAli Hassan,Urdu,6-8,T002,0302-9876543,MA Urdu`,
            notes: "• grade: teaching grade range\n• qualification optional",
            handler: handleTeachersCSV,
            okLabel: "اساتذہ",
          },
          results: {
            title: "📊 CSV فائل سے نتائج شامل کریں",
            desc: "امتحانی نتائج ایک CSV میں لکھ کر upload کریں",
            format: `studentName,exam,subject,totalMarks,obtainedMarks,date\nAhmad Ali,Mid Term,Math,100,85,2024-04-10\nBilal Khan,Mid Term,Urdu,50,42,2024-04-10`,
            notes: "• grade خود calculate ہو گا (A+/A/B/C/D/F)\n• date optional — نہ لکھیں تو آج کی تاریخ",
            handler: handleResultsCSV,
            okLabel: "نتائج",
          },
          attendance: {
            title: "📋 CSV فائل سے حاضری ڈالیں",
            desc: "ایک دن کی پوری کلاس کی حاضری CSV سے ڈالیں",
            format: `studentName,date,status\nAhmad Ali,2024-04-10,present\nBilal Khan,2024-04-10,absent\nSara Noor,2024-04-10,late`,
            notes: "• status: present / absent / late / leave\n• date optional — نہ لکھیں تو آج",
            handler: handleAttendanceCSV,
            okLabel: "حاضری records",
          },
          hifz: {
            title: "📖 CSV فائل سے حفظ logs ڈالیں",
            desc: "حفظ کی روزانہ entries CSV سے ڈالیں",
            format: `studentName,surah,ayahs,type,rating,date\nAhmad Ali,Al-Baqarah,1-5,sabaq,4,2024-04-10\nBilal Khan,Al-Imran,10-15,sabqi,3,`,
            notes: "• type: sabaq / sabqi / manzil\n• rating: 1-5 (default 3)\n• date optional — نہ لکھیں تو آج",
            handler: handleHifzCSV,
            okLabel: "حفظ records",
          },
          homework: {
            title: "📝 CSV فائل سے ہوم ورک شامل کریں",
            desc: "ایک ساتھ کئی جماعتوں کا ہوم ورک CSV سے ڈالیں",
            format: `grade,subject,title,description,due_date,total_marks\nGrade 7,ریاضی,صفحہ 15-18 حل کریں,مسائل حل کریں,2024-04-20,10\nGrade 8,اردو,مضمون لکھیں,,2024-04-22,20`,
            notes: "• due_date: YYYY-MM-DD format\n• total_marks optional (default 10)\n• description optional",
            handler: handleHomeworkCSV,
            okLabel: "ہوم ورک",
          },
        };
        const p = PANELS[activeTab];
        if (!p) return null;
        return (
          <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(212,175,55,0.2)",
            borderRadius:14, padding:20, marginBottom:20 }}>
            <div style={{ color:G, fontWeight:700, fontSize:15, marginBottom:4 }}>{p.title}</div>
            <div style={{ color:"#64748b", fontSize:12, marginBottom:16 }}>{p.desc}</div>

            {/* Format guide */}
            <div style={{ background:"rgba(99,202,183,0.06)", border:"1px solid rgba(99,202,183,0.2)",
              borderRadius:10, padding:"12px 16px", marginBottom:16, direction:"ltr" }}>
              <div style={{ color:"#63cab7", fontWeight:700, fontSize:12, marginBottom:8 }}>📄 CSV Format:</div>
              <code style={{ display:"block", background:"rgba(0,0,0,0.4)", padding:"10px 14px",
                borderRadius:8, color:"#a3e6dc", fontFamily:"monospace", fontSize:11.5, lineHeight:1.9,
                whiteSpace:"pre-wrap", wordBreak:"break-all" }}>
                {p.format}
              </code>
              <div style={{ color:"#64748b", fontSize:11, marginTop:8, whiteSpace:"pre-line" }}>
                {p.notes}{"\n"}• Header row ہو یا نہ ہو — خود سمجھ جائے گا
              </div>
            </div>

            {/* Buttons row: Upload + Template Download */}
            <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>
              <label style={{ display:"inline-flex", alignItems:"center", gap:10,
                padding:"12px 24px", borderRadius:10, cursor: csvLoading ? "not-allowed" : "pointer",
                background: csvLoading ? "#334155" : `linear-gradient(135deg,${G},#b8960a)`,
                color: csvLoading ? "#64748b" : N,
                fontWeight:700, fontSize:14, fontFamily:"inherit" }}>
                {csvLoading ? `⏳ ${csvProgress.done}/${csvProgress.total} ہو رہا ہے...` : "📂 CSV فائل منتخب کریں"}
                <input type="file" accept=".csv,.txt" style={{display:"none"}}
                  onChange={p.handler} disabled={csvLoading}/>
              </label>
              <button onClick={() => downloadTemplate(activeTab)}
                style={{ padding:"12px 20px", borderRadius:10, border:"1px solid rgba(99,202,183,0.4)",
                  background:"rgba(99,202,183,0.08)", color:"#63cab7",
                  fontWeight:700, fontSize:13, fontFamily:"inherit", cursor:"pointer" }}>
                📥 Template Download
              </button>
            </div>

            {/* Progress bar */}
            {csvLoading && csvProgress.total > 0 && (
              <div style={{ marginTop:12, background:"rgba(255,255,255,0.06)", borderRadius:6, height:8, overflow:"hidden" }}>
                <div style={{
                  height:"100%", borderRadius:6, transition:"width 0.2s",
                  background:`linear-gradient(90deg,${G},#4ade80)`,
                  width: `${Math.round((csvProgress.done / csvProgress.total) * 100)}%`
                }}/>
              </div>
            )}

            {/* Result */}
            {csvResult && (
              <div style={{ marginTop:14, padding:"14px 18px", borderRadius:10,
                background: csvResult.skip===0 ? "rgba(74,222,128,0.1)" : "rgba(251,146,60,0.1)",
                border: `1px solid ${csvResult.skip===0 ? "rgba(74,222,128,0.3)" : "rgba(251,146,60,0.3)"}` }}>
                <div style={{ fontWeight:700, fontSize:14 }}>
                  <span style={{ color:"#4ade80" }}>✅ {csvResult.ok} {p.okLabel} کامیابی سے شامل ہوگئے</span>
                  {csvResult.skip > 0 && <span style={{ color:"#fb923c", marginRight:16 }}> ⚠️ {csvResult.skip} ناکام</span>}
                </div>
                {csvResult.errs.length > 0 && (
                  <div style={{ color:"#fca5a5", fontSize:12, marginTop:10,
                    maxHeight:140, overflowY:"auto", lineHeight:1.9,
                    background:"rgba(0,0,0,0.2)", borderRadius:8, padding:"8px 12px" }}>
                    {csvResult.errs.map((e, i) => (
                      <div key={i}>• {e}</div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })()}

      {/* Command Input */}
      {activeTab === "ai" && <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(212,175,55,0.2)",
        borderRadius:14, padding:20, marginBottom:20 }}>

        {/* Label row */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
          <label style={{ fontSize:13, color:"rgba(212,175,55,0.8)", fontWeight:700 }}>
            📝 اردو میں حکم لکھیں یا بولیں
          </label>
          {/* Mic button — click to start, click again to stop */}
          <button
            onClick={listening ? stopListening : startListening}
            disabled={loading || transcribing}
            title={listening ? "روکیں" : transcribing ? "AI سمجھ رہا ہے..." : "آواز سے حکم دیں"}
            style={{
              width:44, height:44, borderRadius:"50%", border:"none",
              cursor: (loading || transcribing) ? "not-allowed" : "pointer",
              background: listening ? "rgba(239,68,68,0.25)" : transcribing ? "rgba(212,175,55,0.15)" : "rgba(212,175,55,0.12)",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:20, transition:"all 0.2s",
              boxShadow: listening ? "0 0 0 6px rgba(239,68,68,0.2)" : "none",
            }}>
            {transcribing ? "⏳" : listening ? "⏹️" : "🎙️"}
          </button>
        </div>

        {/* Listening / Transcribing indicator */}
        {(listening || transcribing) && (
          <div style={{ background: transcribing ? "rgba(212,175,55,0.08)" : "rgba(239,68,68,0.08)",
            border: `1px solid ${transcribing ? "rgba(212,175,55,0.3)" : "rgba(239,68,68,0.3)"}`,
            borderRadius:9, padding:"12px 16px", marginBottom:10 }}>
            {listening && (
              <div style={{ color:"#f87171", fontSize:13, fontWeight:600, marginBottom: interimText ? 8 : 0 }}>
                🔴 سن رہا ہوں — بولیں &nbsp;
                <span style={{ color:"#64748b", fontWeight:400, fontSize:11 }}>(⏹️ button سے روکیں)</span>
              </div>
            )}
            {transcribing && (
              <div style={{ color:G, fontSize:13, fontWeight:600 }}>
                ⏳ Whisper AI آواز سمجھ رہا ہے…
              </div>
            )}
            {interimText && (
              <div style={{ color:"#94a3b8", fontSize:13, fontStyle:"italic", direction:"rtl" }}>
                {interimText}…
              </div>
            )}
          </div>
        )}

        {/* Mic error */}
        {micError && (
          <div style={{ background:"rgba(251,146,60,0.1)", border:"1px solid rgba(251,146,60,0.3)",
            borderRadius:9, padding:"8px 14px", marginBottom:10,
            color:"#fb923c", fontSize:12 }}>
            ⚠️ {micError}
          </div>
        )}

        <textarea value={command} onChange={e => setCommand(e.target.value)}
          rows={3} placeholder="مثال: احمد علی کی 5000 روپے فیس شامل کرو..."
          onKeyDown={e => { if(e.key==="Enter" && e.ctrlKey) sendCommand(); }}
          style={{ ...inp, resize:"none", lineHeight:1.6,
            border: listening ? "1px solid rgba(239,68,68,0.5)" : "1px solid rgba(212,175,55,0.25)" }}/>

        <div style={{ display:"flex", justifyContent:"space-between",
          alignItems:"center", marginTop:10 }}>
          <span style={{ color:"#475569", fontSize:11 }}>Ctrl+Enter سے بھیجیں • 🎙️ سے بولیں</span>
          <button onClick={sendCommand} disabled={!command.trim() || loading}
            style={{ background:(!command.trim()||loading)?"#334155":G,
              color:(!command.trim()||loading)?"#64748b":N,
              border:"none", borderRadius:9, padding:"10px 24px",
              fontWeight:700, cursor:(!command.trim()||loading)?"not-allowed":"pointer",
              fontSize:14, fontFamily:"inherit" }}>
            {loading ? `⏳ سوچ رہا ہے${streamDots}` : "🤖 AI سے پوچھیں"}
          </button>
        </div>
      </div>}

      {/* Error */}
      {activeTab === "ai" && error && (
        <div style={{ background:"rgba(248,113,113,0.1)", border:"1px solid rgba(248,113,113,0.3)",
          borderRadius:10, padding:"12px 16px", marginBottom:16, color:"#f87171", fontSize:13 }}>
          {error}
        </div>
      )}

      {/* AI Result — Confirmation */}
      {activeTab === "ai" && result && !done && (
        <div style={{ background:"rgba(255,255,255,0.05)", border:`1px solid ${G}40`,
          borderRadius:14, padding:20, marginBottom:20 }}>

          <div style={{ fontSize:13, color:"#94a3b8", marginBottom:12 }}>
            🤖 AI کا جواب:
          </div>

          {/* Understood */}
          <div style={{ background:"rgba(212,175,55,0.08)", borderRadius:9,
            padding:"10px 14px", marginBottom:12 }}>
            <span style={{ color:G, fontWeight:700, fontSize:13 }}>سمجھا: </span>
            <span style={{ color:"#f1f5f9", fontSize:13 }}>{result.understood}</span>
          </div>

          {/* Action */}
          {result.action && result.allowed !== false && (
            <div style={{ background:"rgba(74,222,128,0.08)",
              border:"1px solid rgba(74,222,128,0.2)",
              borderRadius:9, padding:"10px 14px", marginBottom:12 }}>
              <div style={{ color:"#4ade80", fontWeight:700, fontSize:12,
                marginBottom:6 }}>
                {ACTION_ICON[result.action]} عمل: {result.action}
              </div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                {Object.entries(result.params || {}).map(([k,v]) => v && (
                  <span key={k} style={{ background:"rgba(255,255,255,0.06)",
                    color:"#94a3b8", padding:"3px 10px", borderRadius:6, fontSize:11 }}>
                    <span style={{ color:"#64748b" }}>{k}: </span>
                    <span style={{ color:"#e2e8f0" }}>{String(v)}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Not allowed */}
          {result.allowed === false && (
            <div style={{ background:"rgba(248,113,113,0.1)",
              border:"1px solid rgba(248,113,113,0.3)",
              borderRadius:9, padding:"10px 14px", marginBottom:12,
              color:"#f87171", fontSize:13 }}>
              ⛔ آپ کے role ({userRole}) کو یہ کام کرنے کی اجازت نہیں ہے
            </div>
          )}

          {/* Error from AI */}
          {result.error && (
            <div style={{ background:"rgba(251,146,60,0.1)",
              border:"1px solid rgba(251,146,60,0.3)",
              borderRadius:9, padding:"10px 14px", marginBottom:12,
              color:"#fb923c", fontSize:13 }}>
              ⚠️ {result.error}
            </div>
          )}

          {/* Confirmation question */}
          <div style={{ background:"rgba(96,165,250,0.08)",
            border:"1px solid rgba(96,165,250,0.2)",
            borderRadius:9, padding:"12px 14px", marginBottom:16,
            color:"#93c5fd", fontSize:14, fontWeight:600, lineHeight:1.6 }}>
            ❓ {result.confirmation}
          </div>

          {/* Buttons */}
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
            <button onClick={cancel}
              style={{ background:"#334155", color:"#94a3b8", border:"none",
                borderRadius:8, padding:"10px 20px", cursor:"pointer",
                fontWeight:600, fontFamily:"inherit" }}>
              ❌ منسوخ
            </button>
            {result.action && result.allowed !== false && !result.error && (
              <button onClick={executeAction} disabled={executing}
                style={{ background:executing?"#334155":"#22c55e",
                  color:executing?"#64748b":"#fff", border:"none",
                  borderRadius:8, padding:"10px 24px",
                  cursor:executing?"wait":"pointer",
                  fontWeight:700, fontFamily:"inherit", fontSize:14 }}>
                {executing ? "⏳ عمل جاری..." : "✅ تصدیق کریں"}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Success */}
      {activeTab === "ai" && done && result?._successMsg && (
        <div style={{ background:"rgba(74,222,128,0.1)",
          border:"1px solid rgba(74,222,128,0.3)",
          borderRadius:12, padding:"16px 20px", marginBottom:20,
          display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ color:"#4ade80", fontSize:15, fontWeight:700 }}>
            {result._successMsg}
          </span>
          <button onClick={cancel}
            style={{ background:"rgba(74,222,128,0.15)", color:"#4ade80",
              border:"none", borderRadius:8, padding:"8px 16px",
              cursor:"pointer", fontWeight:600, fontFamily:"inherit" }}>
            نیا حکم
          </button>
        </div>
      )}

      {/* Examples */}
      {activeTab === "ai" && !result && !loading && (
        <div style={{ background:"rgba(255,255,255,0.03)",
          border:"1px solid rgba(255,255,255,0.07)",
          borderRadius:12, padding:16, marginBottom:20 }}>
          <div style={{ color:"#64748b", fontSize:12, fontWeight:700,
            marginBottom:10 }}>💡 مثالیں — click کریں</div>
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {EXAMPLES.map((ex, i) => (
              <button key={i} onClick={() => setCommand(ex)}
                style={{ background:"rgba(255,255,255,0.04)",
                  border:"1px solid rgba(255,255,255,0.07)",
                  borderRadius:8, padding:"8px 14px", cursor:"pointer",
                  color:"#94a3b8", fontSize:12, textAlign:"right",
                  fontFamily:"inherit", transition:"all 0.15s" }}
                onMouseEnter={e => { e.target.style.background="rgba(212,175,55,0.08)"; e.target.style.color=G; }}
                onMouseLeave={e => { e.target.style.background="rgba(255,255,255,0.04)"; e.target.style.color="#94a3b8"; }}>
                {ex}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* History */}
      {activeTab === "ai" && history.length > 0 && (
        <div>
          <div style={{ color:"#64748b", fontSize:12, fontWeight:700,
            marginBottom:10 }}>📜 حالیہ احکامات</div>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {history.map((h, i) => (
              <div key={i} style={{ background:"rgba(255,255,255,0.03)",
                border:"1px solid rgba(255,255,255,0.06)",
                borderRadius:9, padding:"10px 14px",
                display:"flex", justifyContent:"space-between",
                alignItems:"center", gap:10 }}>
                <div>
                  <div style={{ color:"#94a3b8", fontSize:12 }}>{h.command}</div>
                  <div style={{ color:"#4ade80", fontSize:11, marginTop:3 }}>{h.msg}</div>
                </div>
                <span style={{ color:"#475569", fontSize:10,
                  whiteSpace:"nowrap" }}>{h.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
