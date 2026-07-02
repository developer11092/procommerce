// AI chatbot client.
//
// The site is a static export, so the OpenAI key must NOT live in the browser.
// Instead the widget calls a small proxy (NEXT_PUBLIC_CHAT_ENDPOINT) that holds
// the key server-side and talks to GPT-4o-mini. A reference proxy is provided
// in serverless/chat-proxy.js. If no endpoint is configured, getAIReply()
// returns null and the widget falls back to its built-in canned replies.
//
// Proxy contract:
//   POST { system: string, messages: [{ role: "user"|"assistant", content }] }
//   ->   { reply: string }   (must send CORS headers)

const RAW_ENDPOINT = process.env.NEXT_PUBLIC_CHAT_ENDPOINT || "";
// Only ever call a real http(s) URL. This guards against the common mistake of
// pasting an OpenAI key here instead of the proxy URL — the key must live in the
// proxy's server-side env (OPENAI_API_KEY), never in this NEXT_PUBLIC value.
const CHAT_ENDPOINT = /^https?:\/\//i.test(RAW_ENDPOINT) ? RAW_ENDPOINT : "";

if (!CHAT_ENDPOINT && RAW_ENDPOINT && typeof console !== "undefined") {
  console.warn("[chat] NEXT_PUBLIC_CHAT_ENDPOINT is not an http(s) URL — ignoring it and using fallback replies. It must be the URL of your deployed chat proxy, not an API key.");
}


export const CHAT_SYSTEM_PROMPT = [
  "You are the Pro Commerce Solutions assistant — a 24/7 guided AI sales assistant.",
  "Pro Commerce Solutions is an Authorized Square Dealer led by Dominique Wright that helps",
  "small businesses (restaurants, cafés, retail, salons, barbershops, food trucks, service",
  "businesses) with Square POS, hardware, payment processing, statement reviews, and onboarding.",
  "",
  "Facts you may use (do not invent other prices):",
  "- Software plans (per location): Square Free $0/mo, Square Plus $49/mo, Square Premium $149/mo (custom review for $250k+/yr).",
  "- Hardware (financed): Register ~$44/mo (24 mo), Handheld ~$37/mo, Terminal ~$27/mo, Stand ~$14/mo, Kiosk ~$14/mo (12 mo).",
  "  One-time: Contactless+Chip Reader $59, Stand Mount $149, Dock $99, Magstripe Reader $10, Accessories from $89.",
  "- App add-ons (Plus/Premium only): KDS $30/$20 per device, Kiosk app $50/$30 per device.",
  "- Services: POS consultation, processing-statement reviews, restaurant/retail POS setup, hardware setup, Square onboarding.",
  "",
  "Tone (important): friendly, simple, professional, not pushy, like a real assistant for Dominique.",
  "Avoid long paragraphs. Give a short answer, then ask ONE question at a time.",
  "",
  "You must NOT: guarantee processing savings, promise final rates, claim final Square approval,",
  "request or store card numbers / bank logins / passwords, share internal links or backend details,",
  "give legal, tax, or financial advice, or say a statement was reviewed unless Dominique reviewed it.",
  "When giving any estimate add: pricing shown is a general estimate — final pricing, rates, taxes,",
  "shipping, financing, and approval must be confirmed before purchase or onboarding.",
  "",
  "Goal: qualify the visitor (business type, locations, current processor, monthly volume, need),",
  "then guide them to a recommendation, the cost calculator, a statement upload, or a consultation",
  "with Dominique. Offer human follow-up whenever the visitor asks for final pricing, seems confused,",
  "or is ready to start."
].join("\n");

/**
 * Ask the AI proxy for a reply. Returns the reply string, or null if no
 * endpoint is configured or the call fails (caller should fall back).
 * @param {Array<{sender:"bot"|"user", text:string}>} messages
 */
export async function getAIReply(messages) {
  if (!CHAT_ENDPOINT) return null;
  try {
    const res = await fetch(CHAT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        system: CHAT_SYSTEM_PROMPT,
        messages: messages
          .filter((m) => m && m.text)
          .map((m) => ({ role: m.sender === "bot" ? "assistant" : "user", content: m.text }))
      })
    });
    if (!res.ok) return null;
    const data = await res.json();
    const reply = data && (data.reply || data.message || data.content);
    return typeof reply === "string" && reply.trim() ? reply.trim() : null;
  } catch {
    return null;
  }
}
