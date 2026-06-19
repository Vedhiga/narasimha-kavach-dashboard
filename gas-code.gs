/**
 * Narasimha Kavach Dashboard — Google Apps Script
 * 
 * SETUP:
 * 1. Open your Google Sheet
 * 2. Extensions → Apps Script
 * 3. Paste this code
 * 4. Save → Deploy → New deployment → Web app
 * 5. Set "Execute as: Me" and "Who has access: Anyone"
 * 6. Copy the web app URL
 * 7. Add it to your .env as SHEETS_WEBHOOK_URL
 * 8. In Apps Script, set a trigger: Clock → Timer trigger → Hourly
 */

const SHEET_NAME = "Sheet1";

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    return ss.insertSheet(SHEET_NAME);
  }
  return sheet;
}

function ensureHeaders() {
  const sheet = getSheet();
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, 6).setValues([["Date", "Devotees", "Chanting", "Narasimha Kavach", "Tulasi Parikrama", "Tulasi offered"]]);
    sheet.getRange(1, 1, 1, 6).setFontWeight("bold");
  }
}

// GET / — returns HTML
function doGet() {
  ensureHeaders();
  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const rows = data.slice(1).filter(r => r[0]).map(r => {
    const obj = {};
    headers.forEach((h, i) => { obj[h.toLowerCase().replace(/\s+/g, '_')] = r[i]; });
    return obj;
  });
  
  const json = JSON.stringify(rows, null, 2);
  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}

// POST / — receives data push (from trigger or manual)
function doPost(e) {
  ensureHeaders();
  const sheet = getSheet();
  
  let data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({ error: "Invalid JSON" }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  const row = [
    data.date || "",
    data.devotees || 0,
    data.chanting || 0,
    data.narasimha_kavach || 0,
    data.tulasi_parikrama || 0,
    data.tulasi_offered || 0
  ];
  
  sheet.appendRow(row);
  
  return ContentService.createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

// Run this on a time trigger to push data to your server
function pushToWebhook() {
  const webhookUrl = ScriptProperties.getProperty("WEBHOOK_URL");
  if (!webhookUrl) return;
  
  ensureHeaders();
  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const rows = data.slice(1).filter(r => r[0]).map(r => {
    const obj = {};
    headers.forEach((h, i) => { obj[h.toLowerCase().replace(/\s+/g, '_')] = r[i]; });
    return obj;
  });
  
  const payload = JSON.stringify({ rows, source: "google_sheets" });
  const options = {
    method: "post",
    contentType: "application/json",
    payload: payload,
    muteHttpExceptions: true
  };
  
  UrlFetchApp.fetch(webhookUrl, options);
}

// Run this once to set up the sheet
function setupSheet() {
  ensureHeaders();
}

// Add this to script properties
function setWebhookUrl(url) {
  ScriptProperties.setProperty("WEBHOOK_URL", url);
}

// Test function
function testPush() {
  pushToWebhook();
}
