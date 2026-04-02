// ═══════════════════════════════════════════════
// Ameen School Hub — Voice Transcription
// Vercel: /api/transcribe  (POST)
// Provider: Groq Whisper (whisper-large-v3-turbo)
// ═══════════════════════════════════════════════

const handler = async function (req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { audio, mimeType } = req.body || {};
  if (!audio) return res.status(400).json({ error: "audio missing" });

  const GROQ_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_KEY) return res.status(500).json({ error: "GROQ_API_KEY not set" });

  try {
    const buffer = Buffer.from(audio, "base64");
    const fileType = mimeType || "audio/webm";
    const ext = fileType.includes("mp4") ? "mp4" : fileType.includes("ogg") ? "ogg" : "webm";

    const blob = new Blob([buffer], { type: fileType });

    const formData = new FormData();
    formData.append("file", blob, `recording.${ext}`);
    formData.append("model", "whisper-large-v3-turbo");
    formData.append("language", "ur");
    formData.append("response_format", "json");

    const groqRes = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${GROQ_KEY}` },
      body: formData,
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      throw new Error(`Groq: ${errText}`);
    }

    const data = await groqRes.json();
    res.json({ text: data.text || "" });

  } catch (err) {
    console.error("Transcribe error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

handler.config = { api: { bodyParser: { sizeLimit: "15mb" } } };
module.exports = handler;
