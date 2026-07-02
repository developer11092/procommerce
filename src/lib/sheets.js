// Lead + chat capture to Google Sheets.
//
// The site is a static export (no server), so submissions go to a Google
// Apps Script Web App that appends a row to a Google Sheet. Configure the
// deployed web-app URL via NEXT_PUBLIC_SHEETS_ENDPOINT (see
// docs/GOOGLE_SHEETS_SETUP.md and google-apps-script/Code.gs).
//
// Notes on the request:
// - mode: "no-cors" — Apps Script web apps don't send CORS headers, so we
//   fire-and-forget. The response is opaque; absence of a thrown error is
//   treated as success (this is the standard pattern for Apps Script).
// - Content-Type text/plain avoids a CORS preflight that Apps Script can't
//   answer; the script reads the raw JSON from e.postData.contents.

const ENDPOINT = process.env.NEXT_PUBLIC_SHEETS_ENDPOINT || "";


/**
 * Send a lead/chat record to the Google Sheet.
 * @param {"contact"|"survey"|"statement"|"welcome"|"chat"} type
 * @param {Record<string, any>} data
 * @returns {Promise<{ok: boolean, reason?: string}>}
 */
export async function submitLead(type, data = {}) {
  const payload = {
    type,
    submittedAt: new Date().toISOString(),
    pageUrl: typeof window !== "undefined" ? window.location.href : "",
    referrer: typeof document !== "undefined" ? document.referrer : "",
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
    ...data
  };

  if (!ENDPOINT) {
    // No backend wired up yet — surface the captured payload for developers
    // without breaking the user-facing success flow.
    if (typeof console !== "undefined") console.info("[lead] captured (no endpoint configured):", payload);
    return { ok: false, reason: "not-configured" };
  }

  try {
    if (typeof console !== "undefined") console.info(`[lead] sending "${type}" to sheet endpoint…`);
    await fetch(ENDPOINT, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    });
    return { ok: true };
  } catch (err) {
    if (typeof console !== "undefined") console.error("[lead] submit failed:", err);
    return { ok: false, reason: "network" };
  }
}

/**
 * Fire-and-forget capture that survives page unload (uses sendBeacon).
 * Used to log an in-progress chat conversation if the visitor closes the tab.
 */
export function beaconLead(type, data = {}) {
  if (!ENDPOINT || typeof navigator === "undefined" || !navigator.sendBeacon) return false;
  const payload = {
    type,
    submittedAt: new Date().toISOString(),
    pageUrl: typeof window !== "undefined" ? window.location.href : "",
    ...data
  };
  try {
    const blob = new Blob([JSON.stringify(payload)], { type: "text/plain;charset=utf-8" });
    return navigator.sendBeacon(ENDPOINT, blob);
  } catch {
    return false;
  }
}

// Flatten a chat message array into a readable transcript for the sheet.
export function formatTranscript(messages = []) {
  return messages
    .map((m) => `${m.sender === "bot" ? "Assistant" : "Visitor"}: ${m.text}`)
    .join("\n");
}
