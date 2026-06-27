/**
 * Pro Commerce Solutions — lead + chat capture to Google Sheets.
 *
 * Setup:
 *  1. Open your Google Sheet → Extensions → Apps Script.
 *  2. Paste this file in (replace the default Code.gs).
 *  3. Deploy → New deployment → type "Web app".
 *       - Execute as: Me
 *       - Who has access: Anyone
 *  4. Copy the Web App URL (ends in /exec) into the site's
 *     NEXT_PUBLIC_SHEETS_ENDPOINT env var, then rebuild/redeploy the site.
 *
 * Every form submission and chat transcript becomes one row in the "Leads" tab.
 */

var SHEET_NAME = 'Leads';

// Column order written to the sheet. Add fields here to capture more.
var HEADERS = [
  'submittedAt', 'type',
  'firstName', 'lastName', 'email', 'phone',
  'businessName', 'businessType', 'industry',
  'monthlyRevenue', 'projectedVolume', 'interestedPlan',
  'currentProcessor', 'monthlyVolume', 'numLocations', 'monthlyFees',
  'dbaName', 'legalName', 'streetAddress', 'city', 'state', 'zipCode',
  'message', 'transcript', 'fileName',
  'pageUrl', 'referrer', 'userAgent'
];

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    // Bound to a Sheet (recommended). For a standalone script use:
    // var ss = SpreadsheetApp.openById('YOUR_SHEET_ID');
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
    }

    var row = HEADERS.map(function (h) {
      return data[h] !== undefined && data[h] !== null ? data[h] : '';
    });
    sheet.appendRow(row);

    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

function doGet() {
  return ContentService.createTextOutput('Pro Commerce lead endpoint is live.');
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
