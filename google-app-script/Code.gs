/**
 * Trigger GitHub Action (workflow_dispatch) on Google Sheet edits.
 * Event: Installable "On edit" trigger (From spreadsheet → On edit)
 *
 * ====== REQUIRED SCRIPT PROPERTIES (Project Settings → Script Properties) ======
 * GITHUB_TOKEN   = <GitHub PAT with "repo" scope>
 * GITHUB_OWNER   = <owner or org>
 * GITHUB_REPO    = <repo name>
 * GITHUB_BRANCH  = main
 * WORKFLOW_FILE  = .github/workflows/sheets-sync.yml
 *
 * ====== OPTIONAL SCRIPT PROPERTIES ======
 * SHEET_NAME            = <only fire when this tab is edited> (optional)
 * DEBOUNCE_SECONDS      = 30
 * WORKFLOW_INPUTS_JSON  = {"source":"google-sheets"}   // merged with auto inputs
 * SPREADSHEET_ID        = <target spreadsheet id> (only if this is a standalone script)
 */

const CFG = (() => {
  const p = PropertiesService.getScriptProperties();
  return {
    token: p.getProperty('GITHUB_TOKEN'),
    owner: p.getProperty('GITHUB_OWNER'),
    repo:  p.getProperty('GITHUB_REPO'),
    branch: p.getProperty('GITHUB_BRANCH') || 'main',
    workflowFile: p.getProperty('WORKFLOW_FILE') || null,
    sheetName: p.getProperty('SHEET_NAME') || null,
    debounceSeconds: parseInt(p.getProperty('DEBOUNCE_SECONDS') || '30', 10),
    staticInputsJSON: p.getProperty('WORKFLOW_INPUTS_JSON') || '{}',
    spreadsheetId: p.getProperty('SPREADSHEET_ID') || null
  };
})();

/** === MAIN: Installable On-edit trigger handler === */
function onSheetEdit(e) {
  try {
    if (!shouldRunNow_()) return;

    const ss = (e && e.source) ? e.source : SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) throw new Error('No active spreadsheet.');

    const range = e && e.range ? e.range : null;
    const sheet = range ? range.getSheet() : ss.getActiveSheet();

    // Optional: only fire for a specific sheet (tab)
    if (CFG.sheetName && sheet && sheet.getName() !== CFG.sheetName) {
      console.log(`Skipped (sheet "${sheet.getName()}" != "${CFG.sheetName}")`);
      return;
    }

    const editedA1 = range ? range.getA1Notation() : '';
    const activeSheetName = sheet ? sheet.getName() : '';
    const actorEmail = (function(){ try { return Session.getActiveUser().getEmail() || ''; } catch(_){ return ''; } })();

    const inputs = mergeInputs_(CFG.staticInputsJSON, {
      sheet_name:       activeSheetName,
      spreadsheet_id:   ss.getId(),
      spreadsheet_name: ss.getName(),
      change_type:      'EDIT',
      edited_a1:        editedA1,
      actor_email:      actorEmail,
      source:           'google-sheets'
    });

    dispatchWorkflow_(inputs);
    console.log(`Dispatched ${CFG.workflowFile} for ${ss.getName()} [${activeSheetName} ${editedA1}]`);
  } catch (err) {
    console.error('workflow dispatch failed:', err);
    try { SpreadsheetApp.getActive().toast(`GitHub Action dispatch failed: ${safeStr_(err.message)}`); } catch (_){}
  }
}

/** Manual test: run once to authorize & verify config. */
function testDispatch() {
  const ss = getSpreadsheet_();
  const sheet = ss.getActiveSheet();
  const activeSheetName = sheet ? sheet.getName() : '';
  const inputs = mergeInputs_(CFG.staticInputsJSON, {
    sheet_name:       activeSheetName,
    spreadsheet_id:   ss.getId(),
    spreadsheet_name: ss.getName(),
    change_type:      'MANUAL_TEST',
    edited_a1:        (sheet && sheet.getActiveRange()) ? sheet.getActiveRange().getA1Notation() : '',
    actor_email:      (function(){ try { return Session.getActiveUser().getEmail() || ''; } catch(_){ return ''; } })(),
    source:           'google-sheets'
  });
  dispatchWorkflow_(inputs);
  try { SpreadsheetApp.getActive().toast('GitHub Action dispatched (check Actions).'); } catch (_){}
}

/** === Deployment helpers === */

/** Create (or replace) the installable On-edit trigger for this project. */
function installOnEditTrigger() {
  const ss = getSpreadsheet_();
  // Remove existing triggers for this function first (idempotent)
  ScriptApp.getProjectTriggers()
    .filter(t => t.getHandlerFunction() === 'onSheetEdit')
    .forEach(t => ScriptApp.deleteTrigger(t));

  ScriptApp.newTrigger('onSheetEdit')
    .forSpreadsheet(ss)   // binds to target spreadsheet
    .onEdit()
    .create();

  Logger.log(`On-edit trigger installed for spreadsheet: ${ss.getName()} (${ss.getId()})`);
}

/** If standalone script, use SPREADSHEET_ID; else use bound spreadsheet. */
function getSpreadsheet_() {
  if (CFG.spreadsheetId) return SpreadsheetApp.openById(CFG.spreadsheetId);
  const bound = SpreadsheetApp.getActiveSpreadsheet();
  if (!bound) throw new Error('No active spreadsheet. Set SPREADSHEET_ID in Script Properties for standalone scripts.');
  return bound;
}

/** === GitHub call === */
function dispatchWorkflow_(inputsObj) {
  validateConfig_();

  const url = `https://api.github.com/repos/${encodeURIComponent(CFG.owner)}/${encodeURIComponent(CFG.repo)}/actions/workflows/${encodeURIComponent(CFG.workflowFile)}/dispatches`;
  const payload = { ref: CFG.branch, inputs: inputsObj || {} };

  const resp = ghFetch_(url, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });

  const code = resp.getResponseCode();
  if (code !== 204) {
    throw new Error(`workflow_dispatch failed (${code}): ${resp.getContentText()}`);
  }
}

/** === Utilities === */
function ghFetch_(url, options) {
  if (!CFG.token) throw new Error('Missing GITHUB_TOKEN.');
  const headers = Object.assign({}, options && options.headers, {
    'Authorization': `Bearer ${CFG.token}`,
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'Google-Apps-Script'
  });
  return UrlFetchApp.fetch(url, Object.assign({}, options, { headers }));
}

function mergeInputs_(jsonStr, auto) {
  let staticInputs = {};
  try { staticInputs = JSON.parse(jsonStr || '{}') || {}; }
  catch (e) { console.warn('Invalid WORKFLOW_INPUTS_JSON; ignoring.'); }
  const merged = Object.assign({}, staticInputs, auto);
  Object.keys(merged).forEach(k => {
    const v = merged[k];
    merged[k] = (v === null || v === undefined) ? '' : String(v);
  });
  return merged;
}

function debugListWorkflows() {
  validateConfig_();
  const url = `https://api.github.com/repos/${encodeURIComponent(CFG.owner)}/${encodeURIComponent(CFG.repo)}/actions/workflows`;
  const resp = ghFetch_(url, { method: 'get', muteHttpExceptions: true });
  Logger.log(resp.getResponseCode() + ' ' + resp.getContentText());
}

function debugGetWorkflowByName() {
  validateConfig_();
  const wf = CFG.workflowFile; // what you set in Script Properties
  const url = `https://api.github.com/repos/${encodeURIComponent(CFG.owner)}/${encodeURIComponent(CFG.repo)}/actions/workflows/${encodeURIComponent(wf)}`;
  const resp = ghFetch_(url, { method: 'get', muteHttpExceptions: true });
  Logger.log(`GET /workflows/${wf} -> ` + resp.getResponseCode() + ' ' + resp.getContentText());
}


function validateConfig_() {
  const missing = [];
  if (!CFG.token) missing.push('GITHUB_TOKEN');
  if (!CFG.owner) missing.push('GITHUB_OWNER');
  if (!CFG.repo)  missing.push('GITHUB_REPO');
  if (!CFG.branch) missing.push('GITHUB_BRANCH');
  if (!CFG.workflowFile) missing.push('WORKFLOW_FILE');
  if (missing.length) throw new Error('Missing Script Properties: ' + missing.join(', '));
}

function shouldRunNow_() {
  const cache = CacheService.getScriptCache();
  const key = 'gs_to_github_action_debounce';
  const existing = cache.get(key);
  if (existing) { console.log('Debounced (recent dispatch).'); return false; }
  cache.put(key, '1', Math.max(5, CFG.debounceSeconds));
  return true;
}

function safeStr_(s) { try { return String(s); } catch (_){ return ''; } }
