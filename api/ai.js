// ═══════════════════════════════════════════════════════════
// Ameen School Hub — AI Assistant Serverless Function
// Vercel: /api/ai  (POST)
// Provider: Groq (free tier — 14,400 req/day)
// Requires: GROQ_API_KEY env variable in Vercel dashboard
// ═══════════════════════════════════════════════════════════

const SYSTEM = `آپ امین اسلامک اسکول کے AI معاون ہیں۔
آپ ایک ماہر اسلامی تعلیمی مشیر ہیں جو:
- اردو میں جواب دیتے ہیں
- اسلامی اقدار کو مدنظر رکھتے ہیں
- پاکستانی نصابِ تعلیم (Wifaq ul Madaris + اسکول) سے واقف ہیں
- عملی، مختصر اور مفید تجاویز دیتے ہیں
ہمیشہ بسم اللہ سے شروع کریں۔`;

function buildPrompt(task, data) {
  switch (task) {
    case "lesson_plan":
      return `سبق منصوبہ تیار کریں:
مضمون: ${data.subject}
جماعت: ${data.grade}
موضوع: ${data.topic}
مدت: ${data.duration || "45"} منٹ
استاد کا نوٹ: ${data.notes || "کوئی نہیں"}

براہ کرم مکمل سبق منصوبہ بنائیں جس میں شامل ہو:
1. مقاصد (3 نقاط)
2. آغاز / تمہید (5 منٹ)
3. درسی سرگرمیاں مرحلہ وار
4. سوالات و جوابات
5. خلاصہ
6. ہوم ورک
اردو میں تفصیل سے لکھیں۔`;

    case "mistake_analysis":
      return `حفظ کی غلطیوں کا تجزیہ کریں:
طالب علم: ${data.studentName}
پارہ نمبر: ${data.paraNum}
غلطیاں: ${JSON.stringify(data.mistakes)}

براہ کرم بتائیں:
1. سب سے زیادہ کون سی غلطیاں ہیں؟
2. اس کی وجہ کیا ہو سکتی ہے؟
3. استاد کے لیے عملی تجاویز
4. مخصوص مشق جو اس طالب علم کو کرنی چاہیے
5. والدین کو کیا بتائیں؟
اردو میں تفصیل سے لکھیں۔`;

    case "parent_report":
      return `والدین کے لیے سہ ماہی رپورٹ تیار کریں:
طالب علم: ${data.studentName}
جماعت: ${data.grade}
حاضری: ${data.attendance}%
اوسط نتیجہ: ${data.avgResult}%
تربیت نوٹ: ${data.tarbiyahNote || "اچھا طرزِ عمل"}
خصوصی کامیابی: ${data.achievement || "کوئی نہیں"}
بہتری کا شعبہ: ${data.improvement || "کوئی نہیں"}

ایک رسمی، گرمجوش اردو خط لکھیں جو:
- عزت و احترام سے شروع ہو
- طالب علم کی تعریف کرے
- بہتری کی تجاویز دے
- والدین کو حوصلہ افزائی کرے
- اگلے ماہ کا ہدف بتائے`;

    case "homework_suggestion":
      return `ہوم ورک تجاویز دیں:
مضمون: ${data.subject}
جماعت: ${data.grade}
حالیہ موضوع: ${data.topic}
مشکل درجہ: ${data.difficulty || "درمیانہ"}

5 تخلیقی اور مفید ہوم ورک تجاویز دیں جن میں:
1. ہر کام کا عنوان
2. واضح ہدایات
3. وقت کا تخمینہ (منٹ میں)
4. والدین کا کردار
5. کام جمع کرانے کا طریقہ
اردو میں لکھیں، آسان اور قابلِ عمل ہوں۔`;

    case "class_summary":
      return `جماعت کا خلاصہ تیار کریں:
جماعت: ${data.grade}
مضمون: ${data.subject}
اوسط نمبر: ${data.avgMarks}%
کمزور طلبہ: ${data.weakCount}
ہوم ورک نہ کرنے والے: ${data.hwMissing}

براہ کرم بتائیں:
1. جماعت کی مجموعی صورتحال
2. اہم چیلنجز
3. آنے والے ہفتے کی حکمت عملی
4. کمزور طلبہ کے لیے خصوصی منصوبہ
5. والدین کو کیا پیغام بھیجیں؟`;

    case "ai_command":
      return `آپ امین اسلامک اسکول کے AI ڈیٹا منیجر ہیں۔
آپ کا کام یہ ہے کہ اردو میں دیے گئے حکم کو سمجھیں اور ایک JSON action واپس کریں۔

صارف کا کردار: ${data.role}
موجود طلبہ: ${JSON.stringify((data.students||[]).map(s=>({id:s.id,name:s.name,grade:s.grade})))}
موجود اساتذہ: ${JSON.stringify((data.teachers||[]).map(t=>({id:t.id,name:t.name})))}
موجود گھر: ${JSON.stringify((data.houses||[]).map(h=>({id:h.id,name:h.name})))}

صارف کا حکم: "${data.command}"

Role کے مطابق اجازت:
- director/admin: add_fee, mark_fee_paid, add_result, add_house_points, update_student, add_attendance, add_marks
- teacher: add_result, add_marks, add_attendance
- finance: add_fee, mark_fee_paid
- housemaster: add_house_points, add_hvs

IMPORTANT: صرف JSON واپس کریں۔ کوئی explanation نہیں، کوئی markdown code block نہیں — صرف خالص JSON object:

{
  "understood": "مختصر وضاحت کیا سمجھا",
  "action": "action_name یا null اگر سمجھ نہ آئے",
  "allowed": true یا false,
  "params": { متعلقہ data fields },
  "confirmation": "اردو میں تصدیقی سوال",
  "error": "اگر کوئی مسئلہ ہو تو وضاحت، ورنہ null"
}

ممکنہ actions: add_fee, mark_fee_paid, add_result, add_marks, add_house_points, add_attendance, update_student
params میں student_id، student_name، amount، grade وغیرہ موضوع کے مطابق شامل کریں۔
student_id وہی ہو جو students list میں ہے۔`;

    case "quiz_questions":
      return `MCQ سوالات بنائیں:
مضمون: ${data.subject}
جماعت: ${data.grade}
موضوع: ${data.title || data.subject}
سوالات کی تعداد: ${data.count || 10}

بالکل اس JSON format میں جواب دیں (صرف JSON array، کوئی اضافی متن نہیں):
[
  {
    "text": "سوال کا متن اردو میں",
    "options": { "A": "پہلا آپشن", "B": "دوسرا آپشن", "C": "تیسرا آپشن", "D": "چوتھا آپشن" },
    "correct": "A",
    "marks": 1
  }
]
اسلامی تعلیمی معیار کے مطابق ${data.count || 10} سوالات بنائیں۔ صرف JSON array واپس کریں۔`;

    case "behavior_report":
      return `طالب علم کی رویہ رپورٹ تیار کریں:
طالب علم: ${data.studentName}
جماعت: ${data.grade}
مسئلہ: ${data.issue}
تکرار: ${data.frequency || "کبھی کبھار"}
مثبت پہلو: ${data.positive || "کوئی نہیں"}

براہ کرم بتائیں:
1. اس رویے کی ممکنہ وجوہات
2. استاد کے لیے عملی اقدامات (3 نقاط)
3. والدین کے ساتھ گفتگو کا طریقہ
4. اسلامی تربیتی نقطہ نظر
5. اگلے مہینے کا مشاہداتی منصوبہ
اردو میں تفصیل سے لکھیں۔`;

    case "exam_questions":
      return `امتحانی سوالات بنائیں:
مضمون: ${data.subject}
جماعت: ${data.grade}
موضوع: ${data.topic}
سوالات کی تعداد: ${data.count || 10}
قسم: ${data.qtype || "مختلف اقسام"}

براہ کرم یہ سوالات بنائیں:
- مختصر جوابی سوالات (Short Questions)
- طویل جوابی سوالات (Long Questions)
- خالی جگہ بھریں (Fill in the blanks)
- سچ/جھوٹ (True/False)
اردو میں، اسلامی تعلیمی معیار کے مطابق۔`;

    case "tarbiyah_plan":
      return `تربیتی منصوبہ بنائیں:
طالب علم: ${data.studentName || "طالب علم"}
جماعت: ${data.grade}
مسئلہ / ہدف: ${data.goal}
مدت: ${data.duration || "ایک ماہ"}

براہ کرم مکمل تربیتی منصوبہ بنائیں:
1. ہفتہ وار اہداف (4 ہفتے)
2. روزانہ کی سرگرمیاں
3. قرآن و سنت سے رہنمائی
4. والدین کا کردار
5. استاد کا کردار
6. پیشرفت جانچنے کا طریقہ
اردو میں تفصیل سے لکھیں۔`;

    case "parent_message":
      return `والدین کے لیے مختصر پیغام لکھیں:
طالب علم: ${data.studentName}
پیغام کی نوعیت: ${data.msgType || "عام اطلاع"}
موضوع: ${data.topic}
لہجہ: ${data.tone || "گرمجوش اور رسمی"}

ایک مختصر (5-7 سطریں) اردو پیغام لکھیں جو:
- احترام سے شروع ہو
- واضح اور سمجھ میں آئے
- مثبت لہجے میں ہو
- والدین کو عمل کی دعوت دے
SMS/WhatsApp کے لیے موزوں ہو۔`;

    case "house_speech":
      return `تقریر لکھیں:
موضوع: ${data.topic}
جماعت / عمر: ${data.grade || "درمیانہ"}
مدت: ${data.duration || "3"} منٹ
مناسبت: ${data.occasion || "عام اسمبلی"}

ایک عمدہ اردو تقریر لکھیں جس میں:
1. پرجوش آغاز
2. قرآن یا حدیث کا حوالہ
3. مرکزی خیال (3 نقاط)
4. ایک متاثر کن واقعہ/مثال
5. یادگار اختتام
بچوں کے لہجے میں، آسان اردو میں۔`;

    case "certificate_text":
      return `سرٹیفکیٹ کا متن لکھیں:
طالب علم: ${data.studentName}
کامیابی: ${data.achievement}
مناسبت: ${data.occasion || "سالانہ تقریبِ انعامات"}
تاریخ: ${data.date || "2025"}

ایک رسمی، شاندار اردو سرٹیفکیٹ متن لکھیں جس میں:
- اسکول کا نام: امین اسلامک اسکول
- طالب علم کی تعریف
- کامیابی کا ذکر
- دعا اور حوصلہ افزائی
مختصر، پروفیشنل اور پرشکوہ انداز میں۔`;

    case "newsletter":
      return `ماہانہ نیوز لیٹر تیار کریں:
مہینہ: ${data.month || "جنوری"}
اہم واقعات: ${data.events || "کوئی واقعہ نہیں"}
کامیابیاں: ${data.achievements || "کوئی نہیں"}
آئندہ پروگرام: ${data.upcoming || "کوئی نہیں"}

امین اسلامک اسکول کا ماہانہ نیوز لیٹر لکھیں:
1. صدر کا پیغام (3 سطریں)
2. اس ماہ کی جھلکیاں
3. طلبہ کی کامیابیاں
4. اساتذہ کی خبریں
5. آئندہ ماہ کے پروگرام
6. والدین کے لیے پیغام
خوبصورت اردو میں، اسلامی انداز میں۔`;

    default:
      return `براہ کرم مندرجہ ذیل کے بارے میں اردو میں مدد کریں:\n${JSON.stringify(data)}`;
  }
}

const handler = async function (req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "GROQ_API_KEY not configured in Vercel" });

  const { task, data } = req.body || {};
  if (!task || !data) return res.status(400).json({ error: "task and data required" });

  // ── Voice transcription via Groq Whisper ──
  if (task === "transcribe") {
    try {
      const buffer = Buffer.from(data.audio, "base64");
      const fileType = data.mimeType || "audio/webm";
      const ext = fileType.includes("mp4") ? "mp4" : fileType.includes("ogg") ? "ogg" : "webm";
      const blob = new Blob([buffer], { type: fileType });
      const formData = new FormData();
      formData.append("file", blob, `rec.${ext}`);
      formData.append("model", "whisper-large-v3-turbo");
      formData.append("language", "ur");
      formData.append("response_format", "json");
      const wRes = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}` },
        body: formData,
      });
      if (!wRes.ok) { const t = await wRes.text(); throw new Error(t); }
      const wData = await wRes.json();
      return res.json({ text: wData.text || "" });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  try {
    const prompt = buildPrompt(task, data);

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user",   content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      throw new Error(errText);
    }

    const json = await groqRes.json();
    const text = json?.choices?.[0]?.message?.content || "";

    if (!text) throw new Error("Groq ne koi jawab nahi diya");

    // SSE streaming (simulate)
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const chunkSize = 100;
    for (let i = 0; i < text.length; i += chunkSize) {
      res.write(`data: ${JSON.stringify({ text: text.slice(i, i + chunkSize) })}\n\n`);
    }
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();

  } catch (err) {
    console.error("Groq error:", err.message);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    } else {
      res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      res.end();
    }
  }
};

handler.config = { api: { bodyParser: { sizeLimit: "20mb" } } };
module.exports = handler;
