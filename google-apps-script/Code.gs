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

    updateSummary(ss, sheet);

    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

/**
 * Maintain a "Summary" tab that aggregates the Leads sheet:
 * total submissions, a breakdown by type, and the last-updated time.
 */
function updateSummary(ss, leadsSheet) {
  var summary = ss.getSheetByName('Summary') || ss.insertSheet('Summary');
  var lastRow = leadsSheet.getLastRow();

  var counts = {};
  var total = 0;
  if (lastRow > 1) {
    var typeCol = HEADERS.indexOf('type') + 1;
    var values = leadsSheet.getRange(2, typeCol, lastRow - 1, 1).getValues();
    values.forEach(function (r) {
      var t = r[0] || 'unknown';
      counts[t] = (counts[t] || 0) + 1;
      total++;
    });
  }

  var rows = [['Metric', 'Value'], ['Total submissions', total]];
  ['contact', 'survey', 'statement', 'welcome', 'chat'].forEach(function (t) {
    rows.push([t.charAt(0).toUpperCase() + t.slice(1) + ' submissions', counts[t] || 0]);
  });
  // include any unexpected types so nothing is hidden
  Object.keys(counts).forEach(function (t) {
    if (['contact', 'survey', 'statement', 'welcome', 'chat'].indexOf(t) === -1) {
      rows.push([t + ' submissions', counts[t]]);
    }
  });
  rows.push(['Last updated', new Date()]);

  summary.clear();
  summary.getRange(1, 1, rows.length, 2).setValues(rows);
  summary.getRange(1, 1, 1, 2).setFontWeight('bold');
}

function doGet() {
  return ContentService.createTextOutput('Pro Commerce lead endpoint is live.');
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
