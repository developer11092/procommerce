# Chatbot + lead capture → Google Sheets

This site has no backend (it's a Next.js static export). The guided chatbot's
leads, form submissions, statement uploads, and calculator quotes are captured
into a **Google Sheet** via a **Google Apps Script Web App**. Nothing is sent
anywhere until you wire up the endpoint below — until then submissions are
logged to the browser console so the UX still works.

## Sheet tabs (created automatically by `Code.gs`)

| Tab | Fed by | `type` |
| --- | --- | --- |
| **Chatbot Leads** | guided chatbot — scored lead + summary + full transcript | `chat` |
| **Statement Uploads** | statement uploader — file stored privately in Drive, link recorded | `statement` |
| **Calculator Quotes** | "Request Final Quote" on the cost calculator | `quote` |
| **Form Leads** | contact form, 3-step survey, welcome popup | `contact` / `survey` / `welcome` |
| **Lead Status Tracker** | reference lists: statuses, priorities, flags | — |
| **Pricing Config** | internal pricing data (seeded once; edit freely) | — |
| **Summary** | auto-updated totals, incl. high-priority lead count | — |

## The guided chatbot (spec implementation)

- **Button-based first, free-text second.** 7 opening options (Square POS,
  Hardware pricing, Restaurant/café, Retail/service, Compare processor, Upload
  statement, Speak with a human), each a step-by-step guided flow defined in
  `src/data/chatFlows.js`.
- **Lead capture happens inside the conversation** (name → email → phone →
  business name → city/state → preferred contact), not as a form dump.
- **Lead scoring** (High / Medium / Low) per the spec rules: human requested,
  statement uploaded, $25k+/mo volume, urgent timeline, or multi-location ⇒ High.
- **Chatbot summary** — a one-line digest for Dominique is generated and saved
  with every lead, alongside the full transcript.
- **Human handoff** — a "Speak with a human" button is always visible inside
  flows; that path saves `Human Requested = Yes`, `Priority = High`,
  `Assigned To = Dominique`.
- **Abandoned chats are still captured** on close / tab-unload (sendBeacon),
  marked as partial, and never double-logged.
- Free-typed questions go to **GPT-4o-mini** (via the proxy below) with the
  spec's answering rules and tone baked into the system prompt; if AI is not
  configured it falls back to built-in replies.

## Statement files → private Google Drive

Files up to **8 MB** are sent base64-encoded with the upload form. `Code.gs`
stores them in a private Drive folder (**ProCommerce Statement Uploads**,
created automatically) and writes only the **private link** into the sheet —
never a public URL.

## High-priority email alerts

Set `NOTIFY_EMAIL` at the top of `Code.gs`. Any lead that is high priority
(human requested, statement uploaded, high volume/urgency) sends Dominique an
email with the lead's summary and, where present, the private statement link.

## One-time setup

1. Create (or open) the Google Sheet that should hold the leads.
2. **Extensions → Apps Script**. Replace `Code.gs` with the contents of
   [`google-apps-script/Code.gs`](../google-apps-script/Code.gs). Set
   `NOTIFY_EMAIL`. Save.
3. **Deploy → New deployment → Web app**: **Execute as: Me**, **Who has
   access: Anyone**. Authorize when prompted (Sheets + Drive + Mail scopes).
4. Copy the generated **Web app URL** (ends in `/exec`).
5. In the project root create `.env.local` (see `.env.local.example`):
   ```
   NEXT_PUBLIC_SHEETS_ENDPOINT=https://script.google.com/macros/s/AKfyc.../exec
   ```
6. Rebuild / redeploy the site.
7. **After any later edit to `Code.gs`**: Manage deployments → ✎ → **New
   version** — editing alone does not update the live web app.

## AI chatbot (GPT-4o-mini)

Because this is a static site, the OpenAI key must stay server-side, so the
widget talks to a small proxy:

1. Deploy [`serverless/chat-proxy.js`](../serverless/chat-proxy.js) to Vercel or
   Netlify (Node function). Set `OPENAI_API_KEY` in that platform's env —
   **never** in the site's env.
2. Put the function **URL** in `.env.local`:
   ```
   NEXT_PUBLIC_CHAT_ENDPOINT=https://your-app.vercel.app/api/chat
   ```
3. Rebuild. Free-typed chat messages now get GPT-4o-mini answers (system prompt
   in `src/lib/chat.js`); the guided button flows work with or without AI.

## Notes

- Sheet requests use `mode: "no-cors"` + `text/plain` to work around Apps
  Script's lack of CORS/preflight support. The response is opaque, so the UI
  optimistically shows success; verify rows in the sheet itself.
- To change stored columns, edit the tab schema in `Code.gs` (`TABS`) and add
  the matching field to the payload in `src/lib/sheets.js` / `chatFlows.js`.
- Rotating either endpoint: redeploy and update the env var. No code change.
- Security (per spec §14): no public Sheet/Drive links, no API keys in frontend
  JS, no card numbers or passwords collected anywhere in the flows.
