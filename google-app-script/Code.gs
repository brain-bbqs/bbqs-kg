/**
 * Google Apps Script — Trigger GitHub Action (workflow_dispatch) on Google Sheet changes.
 * Event: Installable "On change" trigger (From spreadsheet → On change)
 *
 * ====== REQUIRED SCRIPT PROPERTIES (Project Settings → Script Properties) ======
 * GITHUB_TOKEN   = <GitHub PAT with "repo" scope>
 * GITHUB_OWNER   = <owner or org>
 * GITHUB_REPO    = <repo name>
 * GITHUB_BRANCH  = main                          (or your branch/tag)
 * WORKFLOW_FILE  = .github/workflows/sheets-sync.yml   (or your workflow filename)
 *
 * ====== OPTIONAL SCRIPT PROPERTIES ======
 * SHEET_NAME            = <only trigger when this tab is active> (optional)
 * ALLOWED_CHANGE_TYPES  = EDIT,FORMAT,INSERT_ROW,INSERT_COLUMN,REMOVE_ROW,REMOVE_COLUMN,OTHER   (CSV)
 * DEBOUNCE_SECONDS      = 30
 * WORKFLOW_INPUTS_JSON  = {"source":"google-sheets"}   // merged with auto inputs
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
    allowedChangeTypes: (p.getProperty('ALLOWED_CHANGE_TYPES') || '')
      .split(',').map(s => s.trim().toUpperCase()).filter(Boolean),
    debounceSeconds: parseInt(p.getProperty('DEBOUNCE_SECONDS') || '30', 10),
    staticInputsJSON: p.getProperty('WORKFLOW_INPUTS_JSON') || '{}'
  };
})();

/** Installable "On change" trigger entrypoint. */
function onSpreadsheetChange(e) {
  try {
    if (!shouldRunNow_()) return;

    const changeType = (e && e.changeType) ? String(e.changeType).toUpperCase() : 'OTHER';
    if (CFG.allowedChangeTypes.length && !CFG.allowedChangeTypes.includes(changeType)) {
      console.log(`Skipped (changeType=${changeType} not allowed).`);
      return;
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) throw new Error('No active spreadsheet.');

    const activeSheet = ss.getActiveSheet();
    const activeSheetName = activeSheet ? activeSheet.getName() : '';

    if (CFG.sheetName && activeSheetName && CFG.sheetName !== activeSheetName) {
      console.log(`Skipped (sheet "${activeSheetName}" != "${CFG.sheetName}")`);
      return;
    }

    // Best-effort capture of edited range (onChange doesn’t always include it)
    let editedA1 = '';
    try {
      const rng = ss.getActiveRange();
      if (rng) editedA1 = rng.getA1Notation();
    } catch (_ignored) {}

    let actorEmail = '';
    try {
      actorEmail = Session.getActiveUser().getEmail() || '';
    } catch (_ignored) {}

    // Build workflow_dispatch inputs (strings only)
    const autoInputs = {
      sheet_name:       activeSheetName || '',
      spreadsheet_id:   ss.getId(),
      spreadsheet_name: ss.getName(),
      change_type:      changeType,
      edited_a1:        editedA1,
      actor_email:      actorEmail,
      source:           'google-sheets'
    };
    const inputs = mergeInputs_(CFG.staticInputsJSON, autoInputs);

    dispatchWorkflow_(inputs);

    console.log(
      `Dispatched ${CFG.workflowFile} for ${ss.getName()} [sheet=${activeSheetName}, changeType=${changeType}, edited=${editedA1}]`
    );
  } catch (err) {
    console.error('workflow dispatch failed:', err);
    try { SpreadsheetApp.getActive().toast(`GitHub Action dispatch failed: ${safeStr_(err.message)}`); } catch (_){}
  }
}

/** Manual test: run once to authorize & verify config. */
function testDispatch() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();
  const inputs = mergeInputs_(CFG.staticInputsJSON, {
    sheet_name:       sheet ? sheet.getName() : '',
    spreadsheet_id:   ss.getId(),
    spreadsheet_name: ss.getName(),
    change_type:      'MANUAL_TEST',
    edited_a1:        (sheet && sheet.getActiveRange()) ? sheet.getActiveRange().getA1Notation() : '',
    actor_email:      (function(){ try { return Session.getActiveUser().getEmail() || ''; } catch(_){ return ''; } })(),
    source:           'google-sheets',
     out_format:       'csv',                                 // or 'json'
  out_path:         `data/sheets/${activeSheetName}.csv`,  // customize
  });
  dispatchWorkflow_(inputs);
  try { SpreadsheetApp.getActive().toast('✅ GitHub Action dispatched (check Actions).'); } catch (_){}
}

/** GitHub workflow_dispatch call. */
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

/** Helpers */
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
  Object.keys(merged).forEach(k => { // GitHub requires strings
    const v = merged[k];
    merged[k] = (v === null || v === undefined) ? '' : String(v);
  });
  return merged;
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

