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

    default:
      return `براہ کرم مندرجہ ذیل کے بارے میں اردو میں مدد کریں:\n${JSON.stringify(data)}`;
  }
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "GROQ_API_KEY not configured in Vercel" });

  const { task, data } = req.body || {};
  if (!task || !data) return res.status(400).json({ error: "task and data required" });

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
