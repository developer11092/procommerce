// Reference AI proxy for the Pro Commerce chatbot (GPT-4o-mini).
//
// WHY a proxy: the site is a static export, so the OpenAI key must never reach
// the browser. Deploy this tiny function to Vercel / Netlify (Node functions),
// set OPENAI_API_KEY in the platform env, then point the site's
// NEXT_PUBLIC_CHAT_ENDPOINT at the deployed URL.
//
// Contract (matches src/lib/chat.js):
//   POST { system: string, messages: [{role, content}], model? }
//   ->   { reply: string }
//
// Vercel: drop this at /api/chat.js. Netlify: wrap with the functions handler.
// Cloudflare Workers: port the body to a fetch-style `export default { fetch }`.

export default async function handler(req, res) {
  // CORS — the static site is served from a different origin.
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const key = process.env.OPENAI_API_KEY;
  if (!key) return res.status(500).json({ error: "OPENAI_API_KEY not configured" });

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const { system, messages, model } = body;

    const chat = [
      { role: "system", content: system || "You are a helpful assistant." },
      ...(Array.isArray(messages) ? messages : [])
    ].slice(-25); // cap context for cost/safety

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`
      },
      body: JSON.stringify({
        model: model || "gpt-4o-mini",
        messages: chat,
        max_tokens: 250,
        temperature: 0.4
      })
    });

    const data = await openaiRes.json();
    const reply = data?.choices?.[0]?.message?.content?.trim() || "";
    return res.status(200).json({ reply });
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
}
