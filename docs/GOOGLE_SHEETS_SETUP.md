# Lead capture → Google Sheets

This site has no backend (it's a Next.js static export). Form submissions and
chat transcripts are captured into a **Google Sheet** via a **Google Apps Script
Web App**. Nothing is sent anywhere until you wire up the endpoint below — until
then submissions are logged to the browser console so the UX still works.

## What gets captured

| Source | `type` | Notable fields |
| --- | --- | --- |
| Contact "Request a consultation" | `contact` | name, email, phone, businessName, businessType, monthlyRevenue, interestedPlan, message |
| Merchant survey (3 steps) | `survey` | name, email, businessType, industry, revenue, projectedVolume, DBA/legal name, address |
| Statement upload | `statement` | businessName, email, currentProcessor, monthlyVolume, numLocations, monthlyFees, fileName |
| Welcome popup | `welcome` | name, email, phone, businessType |
| Chatbot "send chat to team" | `chat` | name/email if given, full transcript |

> Uploaded **files** are not transmitted (a static site can't store them); only
> the file name is recorded. Hook up Drive upload separately if needed.

## One-time setup

1. Create (or open) the Google Sheet that should hold the leads.
2. **Extensions → Apps Script**. Replace `Code.gs` with the contents of
   [`google-apps-script/Code.gs`](../google-apps-script/Code.gs). Save.
3. **Deploy → New deployment → Web app**:
   - **Execute as:** Me
   - **Who has access:** Anyone
4. Copy the generated **Web app URL** (ends in `/exec`).
5. In the project root create `.env.local` (see `.env.local.example`):
   ```
   NEXT_PUBLIC_SHEETS_ENDPOINT=https://script.google.com/macros/s/AKfyc.../exec
   ```
6. Rebuild / redeploy the site. New submissions now append a row to the
   **Leads** tab (created automatically with headers on first write).

## Notes

- The browser sends the request with `mode: "no-cors"` and `text/plain` so it
  works around Apps Script's lack of CORS/preflight support. The response is
  opaque, so the UI optimistically shows success once the request is sent.
- To change which columns are stored, edit the `HEADERS` array in `Code.gs`
  (and add the matching field to the form payload in `src/lib/sheets.js`).
- Rotating the endpoint: redeploy the Apps Script (new version) and update the
  env var. No code change required.
