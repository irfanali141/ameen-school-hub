/* eslint-disable */
import { useState } from "react";
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

  const allowedActions = ROLE_ACTIONS[userRole] || [];

  const sendCommand = async () => {
    if (!command.trim()) return;
    setLoading(true); setResult(null); setDone(false); setError("");

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
    setLoading(false);
  };

  const executeAction = async () => {
    if (!result || !result.action) return;
    setExec(true);
    const p = result.params || {};

    try {
      let msg = "";

      if (result.action === "add_fee") {
        // Use exact DB column names: student_id, type, month(int), year, due_date
        const feeMonth = p.month ? parseInt(p.month) : new Date().getMonth() + 1;
        await addData("fees", {
          student_id: p.student_id,
          student_name: p.student_name,
          amount: parseFloat(p.amount) || 0,
          type: p.fee_type || p.type || "monthly",
          month: isNaN(feeMonth) ? new Date().getMonth() + 1 : feeMonth,
          year: new Date().getFullYear(),
          status: "pending",
          due_date: p.due_date || p.dueDate || null,
        });
        msg = `✅ ${p.student_name} کی ${p.amount} روپے فیس شامل ہوگئی`;
      }

      else if (result.action === "mark_fee_paid") {
        // DB uses snake_case column names in direct queries
        const { data: pendingFees } = await supabase.from("fees")
          .select("id").eq("student_id", p.student_id).eq("status","pending").limit(1);
        if (pendingFees && pendingFees.length > 0) {
          await updateData("fees", pendingFees[0].id, { status:"paid", paidDate: new Date().toISOString().split("T")[0] });
          msg = `✅ ${p.student_name} کی فیس paid مارک ہوگئی`;
        } else {
          msg = `⚠️ ${p.student_name} کی کوئی pending فیس نہیں ملی`;
        }
      }

      else if (result.action === "add_result") {
        await addData("results", {
          studentId: p.student_id,
          studentName: p.student_name,
          subject: p.subject || "عام",
          examName: p.exam_name || p.examName || "ٹیسٹ",
          marks: parseFloat(p.marks) || 0,
          totalMarks: parseFloat(p.total_marks) || 100,
          grade: p.result_grade || p.grade || "",
          examDate: new Date().toISOString().split("T")[0],
        });
        msg = `✅ ${p.student_name} کا نتیجہ (${p.marks}/${p.total_marks}) شامل ہوگیا`;
      }

      else if (result.action === "add_marks") {
        await addData("marks_entries", {
          studentId: p.student_id,
          studentName: p.student_name,
          subject: p.subject || "",
          marks: parseFloat(p.marks) || 0,
          totalMarks: parseFloat(p.total_marks) || 100,
          examType: p.exam_type || p.examType || "ٹیسٹ",
          grade: p.grade || "",
          date: new Date().toISOString().split("T")[0],
        });
        msg = `✅ ${p.student_name} کے ${p.marks} نمبرات شامل ہوگئے`;
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
          studentName: p.student_name,
          status: p.status || "present",
          date: p.date || new Date().toISOString().split("T")[0],
          grade: p.grade || "",
        });
        msg = `✅ ${p.student_name} کی حاضری (${p.status}) لگ گئی`;
      }

      else if (result.action === "update_student") {
        const updates = {};
        if (p.phone) updates.phone = p.phone;
        if (p.canteenBalance !== undefined) updates.canteenBalance = p.canteenBalance;
        if (p.talent) updates.talent = p.talent;
        if (p.section) updates.section = p.section;
        await updateData("students", p.student_id, updates);
        msg = `✅ ${p.student_name} کی معلومات update ہوگئی`;
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

      {/* Command Input */}
      <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(212,175,55,0.2)",
        borderRadius:14, padding:20, marginBottom:20 }}>
        <label style={{ fontSize:13, color:"rgba(212,175,55,0.8)", fontWeight:700,
          marginBottom:10, display:"block" }}>
          📝 اردو میں حکم لکھیں
        </label>
        <textarea value={command} onChange={e => setCommand(e.target.value)}
          rows={3} placeholder="مثال: احمد علی کی 5000 روپے فیس شامل کرو..."
          onKeyDown={e => { if(e.key==="Enter" && e.ctrlKey) sendCommand(); }}
          style={{ ...inp, resize:"none", lineHeight:1.6 }}/>
        <div style={{ display:"flex", justifyContent:"space-between",
          alignItems:"center", marginTop:10 }}>
          <span style={{ color:"#475569", fontSize:11 }}>Ctrl+Enter سے بھیجیں</span>
          <button onClick={sendCommand} disabled={!command.trim() || loading}
            style={{ background:(!command.trim()||loading)?"#334155":G,
              color:(!command.trim()||loading)?"#64748b":N,
              border:"none", borderRadius:9, padding:"10px 24px",
              fontWeight:700, cursor:(!command.trim()||loading)?"not-allowed":"pointer",
              fontSize:14, fontFamily:"inherit" }}>
            {loading ? "⏳ سوچ رہا ہے..." : "🤖 AI سے پوچھیں"}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{ background:"rgba(248,113,113,0.1)", border:"1px solid rgba(248,113,113,0.3)",
          borderRadius:10, padding:"12px 16px", marginBottom:16, color:"#f87171", fontSize:13 }}>
          {error}
        </div>
      )}

      {/* AI Result — Confirmation */}
      {result && !done && (
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
      {done && result?._successMsg && (
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
      {!result && !loading && (
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
      {history.length > 0 && (
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
