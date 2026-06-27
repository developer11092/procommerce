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

const CHAT_ENDPOINT = process.env.NEXT_PUBLIC_CHAT_ENDPOINT || "";

export function isAIChatConfigured() {
  return Boolean(CHAT_ENDPOINT);
}

export const CHAT_SYSTEM_PROMPT = [
  "You are the Pro Commerce Solutions assistant — a friendly, concise B2B advisor.",
  "Pro Commerce Solutions is an Authorized Square Dealer led by Dominique Wright that helps",
  "small businesses choose Square POS, hardware, and payment processing.",
  "",
  "Facts you may use (do not invent other prices):",
  "- Software plans (per location): Square Free $0/mo, Square Plus $49/mo, Square Premium $149/mo.",
  "- Hardware (financed): Register ~$44/mo, Handheld ~$37/mo, Terminal ~$27/mo, Stand ~$14/mo, Kiosk ~$14/mo.",
  "  One-time: Contactless+Chip Reader $59, Stand Mount $149, Dock $99, Magstripe Reader $10, Accessories from $89.",
  "- App add-ons (Plus/Premium only): KDS $30/$20 per device, Kiosk app $50/$30 per device.",
  "- Services: POS consultation, processing-statement reviews, hardware setup, 1-on-1 onboarding. No long-term contracts.",
  "",
  "Guidance: keep replies short (1-3 sentences). Help the visitor pick a setup, then encourage them to",
  "complete the Business Survey, upload a processing statement, or book a free consultation. If asked",
  "anything off-topic or that you are unsure of, steer back to Square/payments and offer a human follow-up.",
  "Never claim to finalize pricing — final pricing is subject to Square approval."
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
