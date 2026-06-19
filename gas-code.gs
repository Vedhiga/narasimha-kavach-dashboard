/**
 * Narasimha Kavach Dashboard — Google Apps Script
 *
 * SETUP:
 * 1. Open your Google Sheet
 * 2. Extensions → Apps Script
 * 3. Paste this code
 * 4. Deploy → New deployment → Web app (Execute as: Me, Access: Anyone)
 * 5. Copy the web app URL
 * 6. In Script Properties, set WEBHOOK_URL = https://your-server.com/api/webhook/sheets
 * 7. Set up a time trigger for pushToWebhook()
 *
 * Sheet columns:
 *   Date | Devotee Name | Chanting | Narasimha Kavach | Tulasi Parikrama | Tulasi Offered
 */

const SHEET_NAME = "Sheet1";

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) return ss.insertSheet(SHEET_NAME);
  return sheet;
}

function ensureHeaders() {
  const sheet = getSheet();
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, 6).setValues([
      ["Date", "Devotee Name", "Chanting", "Narasimha Kavach", "Tulasi Parikrama", "Tulasi Offered"]
    ]);
    sheet.getRange(1, 1, 1, 6).setFontWeight("bold");
  }
}

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

function buildRow(data) {
  return [
    data.date || "",
    data.devotee_name || data.devoteeName || "",
    data.chanting || 0,
    data.narasimha_kavach || data.narasimhaKavach || 0,
    data.tulasi_parikrama || data.tulasiParikrama || 0,
    data.tulasi_offered || data.tulasiOffered || 0,
  ];
}

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
  sheet.appendRow(buildRow(data));
  return ContentService.createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

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
    muteHttpExceptions: true,
  };

  UrlFetchApp.fetch(webhookUrl, options);
}

function setWebhookUrl(url) {
  ScriptProperties.setProperty("WEBHOOK_URL", url);
}

function setupSheet() {
  ensureHeaders();
}

function testPush() {
  pushToWebhook();
}
