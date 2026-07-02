/**
 * Pro Commerce Solutions — AI Chatbot + Google Sheets Lead System backend.
 * Implements the Google Sheets structure from the chatbot/lead specification:
 *   Tab 1: Chatbot Leads      (type: "chat")
 *   Tab 2: Statement Uploads  (type: "statement")  — file saved privately to Drive
 *   Tab 3: Calculator Quotes  (type: "quote")
 *   Tab 4: Form Leads         (type: "contact" | "survey" | "welcome")
 *   Tab 5: Lead Status Tracker (reference lists for statuses/priorities)
 *   Tab 6: Pricing Config      (internal pricing data, seeded once)
 *   Tab 7: Summary             (auto-updated totals)
 *
 * Setup:
 *  1. Open your Google Sheet → Extensions → Apps Script, paste this file.
 *  2. Set NOTIFY_EMAIL below (high-priority lead alerts go there).
 *  3. Deploy → New deployment → Web app: Execute as Me, access: Anyone.
 *  4. Put the /exec URL in the site's NEXT_PUBLIC_SHEETS_ENDPOINT and rebuild.
 *  5. After any edit here: Manage deployments → edit → New version (required!).
 */

var NOTIFY_EMAIL = 'procommercesolutions@gmail.com'; // high-priority alerts
var DRIVE_FOLDER = 'ProCommerce Statement Uploads';  // private uploads folder

// ---------------------------------------------------------------- tab schemas

var TABS = {
  chat: {
    sheet: 'Chatbot Leads',
    idPrefix: 'L',
    headers: [
      'Timestamp', 'Lead ID', 'First Name', 'Last Name', 'Email', 'Phone',
      'Business Name', 'Business Type', 'Industry', 'City', 'State',
      'Number of Locations', 'Current Processor', 'Current POS System',
      'Monthly Revenue', 'Estimated Monthly Card Volume', 'Main Need',
      'Interested Plan', 'Interested Hardware', 'Timeline',
      'Statement Uploaded', 'Statement File Link', 'Human Requested',
      'Preferred Contact Method', 'Best Time to Contact', 'Lead Source',
      'Lead Status', 'Lead Score', 'Chatbot Summary', 'Full Transcript',
      'Internal Notes', 'Assigned To', 'Last Follow-up Date', 'Next Follow-up Date'
    ],
    map: function (d, id) {
      return [
        new Date(), id, d.firstName || '', d.lastName || '', d.email || '', d.phone || '',
        d.businessName || '', d.businessType || '', d.industry || '', d.city || '', d.state || '',
        d.numLocations || '', d.currentProcessor || '', d.currentPOS || '',
        d.monthlyRevenue || '', d.cardVolume || '', d.mainNeed || '',
        d.interestedPlan || '', join([d.checkoutSetup, d.deviceCount]), d.timeline || '',
        d.statementUploaded || 'No', d.statementFileLink || '', d.humanRequested || 'No',
        d.preferredContact || '', d.bestTime || '', d.leadSource || 'Chatbot',
        d.leadStatus || 'New Lead', d.leadScore || d.priority || 'Low',
        d.chatSummary || '', d.transcript || '',
        '', (d.humanRequested === 'Yes' || d.priority === 'High') ? 'Dominique' : '', '', ''
      ];
    }
  },

  statement: {
    sheet: 'Statement Uploads',
    idPrefix: 'U',
    headers: [
      'Timestamp', 'Upload ID', 'Lead ID', 'Business Name', 'Contact Name',
      'Email', 'Phone', 'Current Processor', 'Monthly Card Volume',
      'Number of Locations', 'File Name', 'Private Google Drive Link',
      'Upload Status', 'Review Status', 'Notes', 'Lead Status'
    ],
    map: function (d, id) {
      return [
        new Date(), id, d.leadId || '', d.businessName || '', join([d.firstName, d.lastName]) || d.contactName || '',
        d.email || '', d.phone || '', d.currentProcessor || '', d.monthlyVolume || d.cardVolume || '',
        d.numLocations || '', d.fileName || '', d.driveLink || '',
        d.driveLink ? 'Received' : (d.fileName ? 'Name only (no file)' : 'None'),
        'Pending review',
        joinNotes([d.notes, d.monthlyFees ? 'Monthly fees: ' + d.monthlyFees : '']),
        'Statement Received'
      ];
    }
  },

  quote: {
    sheet: 'Calculator Quotes',
    idPrefix: 'Q',
    headers: [
      'Timestamp', 'Quote ID', 'Lead ID', 'Business Name', 'Email', 'Phone',
      'Business Type', 'Locations', 'Selected Plan', 'Register Quantity',
      'Terminal Quantity', 'Stand Quantity', 'Handheld Quantity',
      'Kiosk Quantity', 'Reader Quantity', 'KDS Devices', 'Kiosk App Devices',
      'Estimated Monthly Software Cost', 'Estimated Monthly Hardware Cost',
      'Estimated Add-on Cost', 'Estimated One-time Cost',
      'Total Estimated Monthly Cost', 'Quote Requested', 'Chatbot Summary', 'Lead Status'
    ],
    map: function (d, id) {
      return [
        new Date(), id, d.leadId || '', d.businessName || '', d.email || '', d.phone || '',
        d.businessType || '', d.locations || '', d.selectedPlan || '', n(d.registerQty),
        n(d.terminalQty), n(d.standQty), n(d.handheldQty),
        n(d.kioskQty), n(d.readerQty), n(d.kdsQty), n(d.kioskAppQty),
        money(d.softwareMonthly), money(d.hardwareMonthly),
        money(d.addonMonthly), money(d.onetimeTotal),
        money(d.totalMonthly), 'Yes', d.summary || '', 'New Lead'
      ];
    }
  },

  form: {
    sheet: 'Form Leads',
    idPrefix: 'F',
    headers: [
      'Timestamp', 'Lead ID', 'Type', 'First Name', 'Last Name', 'Email', 'Phone',
      'Business Name', 'Business Type', 'Industry', 'Monthly Revenue',
      'Projected Volume', 'Interested Plan', 'DBA Name', 'Legal Name',
      'Street Address', 'City', 'State', 'Zip', 'Message', 'File Name',
      'Page URL', 'Lead Status'
    ],
    map: function (d, id) {
      return [
        new Date(), id, d.type || '', d.firstName || '', d.lastName || '', d.email || '', d.phone || '',
        d.businessName || '', d.businessType || '', d.industry || '', d.monthlyRevenue || '',
        d.projectedVolume || '', d.interestedPlan || '', d.dbaName || '', d.legalName || '',
        d.streetAddress || '', d.city || '', d.state || '', d.zipCode || '', d.message || '', d.fileName || '',
        d.pageUrl || '', 'New Lead'
      ];
    }
  }
};

// -------------------------------------------------------------------- doPost

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    // Honeypot spam protection: real visitors never fill the hidden "website"
    // field. Accept silently (so bots learn nothing) but store nothing.
    if (data.website) {
      return json({ ok: true });
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();

    ensureReferenceTabs(ss);

    // Statement files arrive base64-encoded; store privately in Drive and keep
    // only the private link in the sheet (spec: never store files publicly).
    if (data.type === 'statement' && data.fileData && data.fileName) {
      try {
        data.driveLink = saveToDrive(data.fileName, data.fileData, data.fileMime);
      } catch (fileErr) {
        data.driveLink = '';
        data.notes = 'File save failed: ' + fileErr;
      }
      delete data.fileData;
    }

    var cfg = TABS[data.type] || TABS.form;
    var sheet = getSheet(ss, cfg.sheet, cfg.headers);
    var id = cfg.idPrefix + '-' + Utilities.formatDate(new Date(), 'GMT', 'yyMMddHHmmss') +
             '-' + Math.floor(Math.random() * 900 + 100);
    sheet.appendRow(cfg.map(data, id));

    updateSummary(ss);
    maybeNotify(data, id);

    return json({ ok: true, id: id });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

function doGet() {
  return ContentService.createTextOutput('Pro Commerce lead endpoint is live.');
}

// ------------------------------------------------------------------- helpers

function getSheet(ss, name, headers) {
  var sheet = ss.getSheetByName(name) || ss.insertSheet(name);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function saveToDrive(fileName, base64, mime) {
  var folders = DriveApp.getFoldersByName(DRIVE_FOLDER);
  var folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(DRIVE_FOLDER);
  var blob = Utilities.newBlob(Utilities.base64Decode(base64), mime || 'application/octet-stream', fileName);
  var file = folder.createFile(blob);
  return file.getUrl(); // private link — visible only to the account owner/shared users
}

// Email Dominique for high-priority leads (spec §10 step 9). Per the lead
// scoring rules (§6), statement uploads AND final-quote requests are High.
function maybeNotify(d, id) {
  try {
    var high = d.priority === 'High' || d.leadScore === 'High' ||
               d.humanRequested === 'Yes' || d.type === 'statement' ||
               d.type === 'quote';
    if (!high || !NOTIFY_EMAIL) return;
    var subject = '[ProCommerce] High-priority lead ' + id + (d.humanRequested === 'Yes' ? ' — HUMAN REQUESTED' : '');
    var body =
      'Type: ' + (d.type || '') + '\n' +
      'Name: ' + join([d.firstName, d.lastName]) + '\n' +
      'Email: ' + (d.email || '') + '\n' +
      'Phone: ' + (d.phone || '') + '\n' +
      'Business: ' + (d.businessName || '') + ' (' + (d.businessType || '') + ')\n' +
      'Preferred contact: ' + (d.preferredContact || '') + ' ' + (d.bestTime || '') + '\n' +
      'Summary: ' + (d.chatSummary || d.summary || '') + '\n' +
      (d.driveLink ? 'Statement: ' + d.driveLink + '\n' : '') +
      '\nOpen the Google Sheet for full details.';
    MailApp.sendEmail(NOTIFY_EMAIL, subject, body);
  } catch (mailErr) { /* never block the row on a mail failure */ }
}

// Reference tabs: Lead Status Tracker + Pricing Config (seeded once, spec §5).
function ensureReferenceTabs(ss) {
  if (!ss.getSheetByName('Lead Status Tracker')) {
    var t = ss.insertSheet('Lead Status Tracker');
    t.getRange(1, 1, 1, 3).setValues([['Lead Statuses', 'Priorities', 'Flags']]).setFontWeight('bold');
    var rows = [
      ['New Lead', 'Low', 'Human Requested: Yes / No'],
      ['Contacted', 'Medium', 'Follow-up Needed: Yes / No'],
      ['Statement Received', 'High', ''],
      ['Quote Prepared', '', ''],
      ['Onboarding Sent', '', ''],
      ['Closed Won', '', ''],
      ['Closed Lost', '', '']
    ];
    t.getRange(2, 1, rows.length, 3).setValues(rows);
  }

  if (!ss.getSheetByName('Pricing Config')) {
    var p = ss.insertSheet('Pricing Config');
    var head = ['Item Type', 'Item Name', 'One-time Cost', 'Monthly Cost', 'Financing Months', 'Best Fit Use Case', 'Product URL', 'Active', 'Notes'];
    p.getRange(1, 1, 1, head.length).setValues([head]).setFontWeight('bold');
    var items = [
      ['Plan', 'Square Free', '', 0, '', 'Basic POS tools, processing fees apply', '', 'Yes', 'Per location'],
      ['Plan', 'Square Plus', '', 49, '', 'Growing businesses, staff & inventory tools', '', 'Yes', 'Per location'],
      ['Plan', 'Square Premium', '', 149, '', 'High volume / custom review over $250k/yr', '', 'Yes', 'Per location'],
      ['Hardware', 'Square Register (2nd gen)', 899, 44, 24, 'High-volume counter checkout', 'https://squareup.com/us/en/hardware/register', 'Yes', ''],
      ['Hardware', 'Square Handheld', 399, 37, 12, 'Tableside / mobile checkout', 'https://squareup.com/us/en/hardware/handheld', 'Yes', ''],
      ['Hardware', 'Square Terminal', 299, 27, 12, 'Countertop card device with printer', 'https://squareup.com/us/en/hardware/terminal', 'Yes', ''],
      ['Hardware', 'Square Stand', 149, 14, 12, 'iPad countertop checkout', 'https://squareup.com/us/en/hardware/stand', 'Yes', ''],
      ['Hardware', 'Square Kiosk', 149, 14, 12, 'Self-service ordering', 'https://squareup.com/us/en/hardware/kiosk', 'Yes', ''],
      ['Hardware', 'Square Reader (Contactless + Chip)', 59, '', '', 'Pocket reader, phone checkout', 'https://squareup.com/us/en/hardware/reader', 'Yes', 'One-time'],
      ['Hardware', 'Square Stand Mount', 149, '', '', 'Fixed iPad mount', 'https://squareup.com/us/en/hardware/stand-mount', 'Yes', 'One-time'],
      ['Hardware', 'Square Dock for Handheld', 99, '', '', 'Countertop dock for Handheld', 'https://squareup.com/us/en/hardware/handheld', 'Yes', 'One-time'],
      ['Hardware', 'Square Reader for Magstripe', 10, '', '', 'Swipe backup reader', 'https://squareup.com/us/en/hardware/reader', 'Yes', 'One-time'],
      ['Hardware', 'Square Accessories Kit', 89, '', '', 'Printers, drawers, scanners', 'https://squareup.com/shop/hardware/v2/us/en/products/accessories', 'Yes', 'From $89'],
      ['Add-on', 'Square KDS (per device)', '', 30, '', 'Kitchen display — Plus $30 / Premium $20', '', 'Yes', 'Not in Free'],
      ['Add-on', 'Square Kiosk app (per device)', '', 50, '', 'Self-order app — Plus $50 / Premium $30', '', 'Yes', 'Not in Free']
    ];
    p.getRange(2, 1, items.length, head.length).setValues(items);
  }
}

function updateSummary(ss) {
  var summary = ss.getSheetByName('Summary') || ss.insertSheet('Summary');
  var rows = [['Metric', 'Value']];
  var total = 0;
  [['Chatbot Leads', 'Chatbot leads'], ['Statement Uploads', 'Statement uploads'],
   ['Calculator Quotes', 'Calculator quotes'], ['Form Leads', 'Form submissions']].forEach(function (pair) {
    var s = ss.getSheetByName(pair[0]);
    var c = s ? Math.max(0, s.getLastRow() - 1) : 0;
    rows.push([pair[1], c]);
    total += c;
  });
  // High-priority chatbot leads — resolve the column by header name so the
  // summary can't silently break if columns are ever added or reordered.
  var chat = ss.getSheetByName('Chatbot Leads');
  if (chat && chat.getLastRow() > 1) {
    var scoreCol = TABS.chat.headers.indexOf('Lead Score') + 1;
    if (scoreCol > 0) {
      var scores = chat.getRange(2, scoreCol, chat.getLastRow() - 1, 1).getValues();
      var high = scores.filter(function (r) { return r[0] === 'High'; }).length;
      rows.push(['High-priority chatbot leads', high]);
    }
  }
  rows.splice(1, 0, ['Total submissions', total]);
  rows.push(['Last updated', new Date()]);
  summary.clear();
  summary.getRange(1, 1, rows.length, 2).setValues(rows);
  summary.getRange(1, 1, 1, 2).setFontWeight('bold');
}

function join(arr) {
  return (arr || []).filter(function (x) { return x; }).join(' ');
}
function joinNotes(arr) {
  return (arr || []).filter(function (x) { return x; }).join(' | ');
}
function n(v) { return v === undefined || v === null || v === '' ? 0 : Number(v) || 0; }
function money(v) { return v === undefined || v === null || v === '' ? '' : '$' + (Number(v) || 0); }
function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
