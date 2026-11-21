import {
  GASKET_MATERIALS,
  INTEGRITY_CLASSES,
  SYSTEM_PRESETS,
  SystemInputs,
  VESSEL_MATERIALS,
} from './vacuumLeakage';
import { SavedPreset } from './presetStorage';

/**
 * Generates a 100% self-contained, zero-dependency, offline-capable single HTML file
 * containing the complete Vacuum Distillation Air Leakage Estimator with offline PDF,
 * CSV, and localStorage preset support.
 */
export function generateStandaloneHtml(
  initialInputs: SystemInputs,
  initialSavedPresets: SavedPreset[] = []
): string {
  const safeStateJson = JSON.stringify(initialInputs).replace(/<\//g, '<\\/');
  const safePresetsJson = JSON.stringify(SYSTEM_PRESETS).replace(/<\//g, '<\\/');
  const safeSavedPresetsJson = JSON.stringify(initialSavedPresets).replace(/<\//g, '<\\/');
  const safeVesselsJson = JSON.stringify(VESSEL_MATERIALS).replace(/<\//g, '<\\/');
  const safeGasketsJson = JSON.stringify(GASKET_MATERIALS).replace(/<\//g, '<\\/');
  const safeIntegrityJson = JSON.stringify(INTEGRITY_CLASSES).replace(/<\//g, '<\\/');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Vacuum Distillation Air Leakage Estimator (Offline)</title>
  <style>
    :root {
      --bg: #f8fafc;
      --surface: #ffffff;
      --surface-muted: #f1f5f9;
      --border: #e2e8f0;
      --border-strong: #cbd5e1;
      --text: #0f172a;
      --text-muted: #475569;
      --text-soft: #64748b;
      --accent: #0284c7;
      --accent-dark: #0369a1;
      --teal: #0d9488;
      --amber: #d97706;
      --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    }
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; background: var(--bg); color: var(--text); font-family: var(--font-sans); font-size: 14px; line-height: 1.45; -webkit-font-smoothing: antialiased; }
    .mono { font-family: var(--font-mono); font-variant-numeric: tabular-nums; }
    header { position: sticky; top: 0; z-index: 20; background: var(--surface); border-bottom: 1px solid var(--border); }
    .header-inner { max-width: 1400px; margin: 0 auto; padding: 0 20px; height: 54px; display: flex; align-items: center; justify-content: space-between; gap: 24px; }
    .brand { font-weight: 700; font-size: 15px; color: var(--text); text-decoration: none; white-space: nowrap; }
    nav { display: flex; gap: 22px; }
    nav a { color: var(--text-muted); text-decoration: none; font-size: 13px; font-weight: 500; white-space: nowrap; }
    nav a:hover { color: var(--text); text-decoration: underline; text-underline-offset: 4px; }
    .btn { display: inline-flex; align-items: center; gap: 6px; padding: 7px 14px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; border: 1px solid transparent; white-space: nowrap; transition: background-color 150ms ease, border-color 150ms ease; }
    .btn-primary { background: var(--accent-dark); color: #fff; }
    .btn-primary:hover { background: #075985; }
    .btn-secondary { background: var(--surface); color: var(--text); border-color: var(--border-strong); }
    .btn-secondary:hover { background: var(--surface-muted); }
    .container { max-width: 1400px; margin: 0 auto; padding: 20px; }
    .page-head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 12px; margin-bottom: 20px; }
    h1 { margin: 0; font-size: 22px; font-weight: 600; letter-spacing: -0.01em; }
    .subtitle { margin: 4px 0 0; font-size: 13px; color: var(--text-muted); max-width: 680px; }
    .layout { display: grid; grid-template-columns: 360px 1fr; gap: 20px; align-items: start; }
    @media (max-width: 1024px) { .layout { grid-template-columns: 1fr; } nav { display: none; } }
    .card { background: var(--surface); border: 1px solid var(--border); border-radius: 8px; }
    .sidebar { overflow: hidden; }
    .side-sec { padding: 14px 16px; border-bottom: 1px solid var(--border); }
    .side-sec:last-child { border-bottom: none; }
    .sec-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-soft); margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between; }
    .field-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 8px; }
    .field-label { font-size: 12px; color: var(--text-muted); }
    select, input[type="number"] { height: 32px; padding: 0 8px; font-size: 12px; background: var(--bg); border: 1px solid var(--border-strong); border-radius: 5px; color: var(--text); font-family: inherit; }
    input[type="number"] { font-family: var(--font-mono); font-variant-numeric: tabular-nums; text-align: right; width: 92px; }
    select { width: 100%; }
    input[type="range"] { width: 100%; accent-color: var(--accent); cursor: pointer; margin: 4px 0; }
    .bounds { display: flex; justify-content: space-between; font-size: 11px; color: var(--text-soft); font-family: var(--font-mono); }
    .hint { font-size: 11px; color: var(--text-soft); margin-top: 4px; line-height: 1.35; }
    .seg-ctrl { display: inline-flex; padding: 2px; background: var(--surface-muted); border-radius: 6px; gap: 2px; }
    .seg-btn { border: none; background: transparent; padding: 4px 8px; font-size: 11px; font-weight: 500; color: var(--text-muted); border-radius: 4px; cursor: pointer; white-space: nowrap; }
    .seg-btn.active { background: var(--surface); color: var(--text); box-shadow: 0 1px 2px rgba(15,23,42,0.08); }
    .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
    .grid-3 input { width: 100%; text-align: left; }
    .main-col { display: flex; flex-direction: column; gap: 20px; min-width: 0; }
    .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
    @media (max-width: 900px) { .kpi-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 520px) { .kpi-grid { grid-template-columns: 1fr; } }
    .kpi { padding: 14px 16px; }
    .kpi-title { font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-soft); }
    .kpi-val { margin-top: 6px; font-size: 24px; font-weight: 600; font-family: var(--font-mono); font-variant-numeric: tabular-nums; }
    .kpi-unit { font-size: 12px; font-weight: 400; color: var(--text-soft); margin-left: 4px; }
    .kpi-sub { margin-top: 4px; font-size: 11px; color: var(--text-soft); font-family: var(--font-mono); }
    .card-pad { padding: 18px; }
    .card-head { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 12px; }
    h2 { margin: 0; font-size: 15px; font-weight: 600; }
    .legend { display: flex; flex-wrap: wrap; gap: 16px; font-size: 12px; color: var(--text-muted); padding-bottom: 10px; margin-bottom: 10px; border-bottom: 1px solid var(--surface-muted); }
    .legend-item { display: inline-flex; align-items: center; gap: 6px; }
    .hud { margin-top: 8px; padding: 8px 12px; background: var(--bg); border: 1px solid var(--border); border-radius: 6px; display: flex; flex-wrap: wrap; justify-content: space-between; gap: 12px; font-size: 12px; font-family: var(--font-mono); }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th { background: var(--bg); text-align: left; padding: 9px 12px; font-weight: 600; color: var(--text-muted); border-bottom: 1px solid var(--border); white-space: nowrap; }
    th.num, td.num { text-align: right; font-family: var(--font-mono); font-variant-numeric: tabular-nums; }
    td { padding: 10px 12px; border-bottom: 1px solid var(--surface-muted); vertical-align: middle; }
    tr.model-row { cursor: pointer; }
    tr.model-row:hover { background: var(--bg); }
    tr.model-row.selected { background: #f0f9ff; }
    .split-2 { display: grid; grid-template-columns: 7fr 5fr; gap: 20px; }
    @media (max-width: 1024px) { .split-2 { grid-template-columns: 1fr; } }
    .bar-track { width: 100%; height: 6px; background: var(--surface-muted); border-radius: 99px; overflow: hidden; margin-top: 4px; }
    .bar-fill { height: 100%; background: var(--accent); }
    .warn-box { margin-top: 12px; padding: 10px 12px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 6px; font-size: 12px; color: #78350f; }
    .train-box { margin-top: 12px; padding: 12px 14px; background: var(--bg); border: 1px solid var(--border); border-radius: 6px; }
    .eq-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; }
    @media (max-width: 800px) { .eq-grid { grid-template-columns: 1fr; } }
    .eq-card { padding: 12px 14px; background: var(--bg); border: 1px solid var(--border); border-radius: 6px; }
    .eq-formula { margin-top: 8px; padding: 6px 8px; background: var(--surface); border: 1px solid var(--border); border-radius: 4px; font-family: var(--font-mono); font-size: 11px; }
    footer { margin-top: 32px; background: var(--surface); border-top: 1px solid var(--border); padding: 14px 20px; font-size: 12px; color: var(--text-soft); }
    .footer-inner { max-width: 1400px; margin: 0 auto; display: flex; flex-wrap: wrap; justify-content: space-between; gap: 8px; }
    .hidden { display: none !important; }
    @media print {
      header, .sidebar, .no-print { display: none !important; }
      body { background: #fff; }
      .layout { grid-template-columns: 1fr !important; }
      .card { break-inside: avoid; border-color: #cbd5e1; }
    }
  </style>
</head>
<body>
  <header>
    <div class="header-inner">
      <a href="#estimator" class="brand">Vacuum Air Leakage</a>
      <nav aria-label="Primary sections">
        <a href="#estimator">Estimator</a>
        <a href="#curves">Model Curves</a>
        <a href="#sizing">Equipment Sizing</a>
        <a href="#standards">Standards</a>
      </nav>
      <button type="button" id="btn-export-pdf" class="btn btn-primary">Export PDF Report</button>
    </div>
  </header>

  <main id="estimator" class="container">
    <div class="page-head">
      <div>
        <h1>Vacuum Distillation Air Leakage Estimator</h1>
        <p class="subtitle">Standalone offline calculator for air in-leakage rates, suction capacity, and vacuum equipment sizing across HEI, Seider–Seader–Lewin, Ryans &amp; Roper, and Component Inventory models.</p>
      </div>
      <div class="no-print" style="display:flex; flex-wrap:wrap; align-items:center; gap:8px;">
        <button type="button" id="btn-export-csv" class="btn btn-secondary">Export CSV</button>
        <button type="button" id="btn-print" class="btn btn-secondary">Print Sheet</button>
      </div>
    </div>

    <div class="layout">
      <!-- Left Sidebar -->
      <aside class="card sidebar">
        <div class="side-sec">
          <div class="sec-label">
            <span>System Preset</span>
            <button type="button" id="btn-reset" class="btn btn-secondary" style="padding:3px 8px; font-size:11px;">Reset</button>
          </div>
          <select id="sel-preset"></select>
          <div style="margin-top:8px; display:flex; align-items:center; justify-content:space-between; gap:8px;">
            <button type="button" id="btn-save-preset" style="border:none; background:none; padding:0; color:var(--accent-dark); font-size:11px; font-weight:600; cursor:pointer;">+ Save Current Preset</button>
            <button type="button" id="btn-del-preset" class="hidden" style="border:none; background:none; padding:0; color:#be123c; font-size:11px; font-weight:600; cursor:pointer;">Delete</button>
          </div>
          <div id="preset-form" class="hidden" style="margin-top:8px;">
            <input type="text" id="inp-preset-name" maxlength="60" placeholder="Preset name (e.g. Tower T-201)" style="width:100%; height:30px; padding:0 8px; font-size:12px; border:1px solid var(--border-strong); border-radius:5px;" />
            <div style="display:flex; justify-content:flex-end; gap:6px; margin-top:6px;">
              <button type="button" id="btn-cancel-preset" class="btn btn-secondary" style="padding:3px 8px; font-size:11px;">Cancel</button>
              <button type="button" id="btn-confirm-preset" class="btn btn-primary" style="padding:3px 10px; font-size:11px;">Save</button>
            </div>
          </div>
        </div>

        <div class="side-sec">
          <div class="sec-label">
            <span>System Size (Volume)</span>
            <div class="seg-ctrl">
              <button type="button" id="tab-direct" class="seg-btn active">Direct m³</button>
              <button type="button" id="tab-geom" class="seg-btn">Column D×H</button>
            </div>
          </div>
          <div id="panel-direct">
            <div class="field-row">
              <span class="field-label">Evacuated Volume</span>
              <div style="display:flex; align-items:center; gap:5px;">
                <input type="number" id="inp-volume" min="0.05" max="2000" step="any" />
                <span class="mono" style="font-size:12px; color:var(--text-soft);">m³</span>
              </div>
            </div>
            <input type="range" id="rng-volume" min="0" max="1000" />
            <div class="bounds">
              <span>0.05 m³</span>
              <span id="lbl-vol-ft3">0 ft³</span>
              <span>500 m³</span>
            </div>
          </div>
          <div id="panel-geom" class="hidden">
            <div class="grid-3">
              <div>
                <div class="field-label" style="font-size:11px; margin-bottom:3px;">Diam (m)</div>
                <input type="number" id="inp-diam" min="0.1" max="15" step="0.1" value="1.2" />
              </div>
              <div>
                <div class="field-label" style="font-size:11px; margin-bottom:3px;">Height (m)</div>
                <input type="number" id="inp-height" min="0.2" max="60" step="0.5" value="9.5" />
              </div>
              <div>
                <div class="field-label" style="font-size:11px; margin-bottom:3px;">Piping +(%)</div>
                <input type="number" id="inp-allow" min="0" max="200" step="5" value="30" />
              </div>
            </div>
            <div class="bounds" style="margin-top:8px; padding:6px 8px; background:var(--bg); border:1px solid var(--border); border-radius:4px;">
              <span>Computed Total:</span>
              <strong id="lbl-geom-vol" style="color:var(--text);">14.00 m³</strong>
            </div>
          </div>
        </div>

        <div class="side-sec">
          <div class="sec-label"><span>Vacuum Level &amp; Suction Temp</span></div>
          <div class="field-row">
            <span class="field-label">Operating Pressure</span>
            <div style="display:flex; align-items:center; gap:5px;">
              <input type="number" id="inp-pressure" min="0.1" max="980" step="any" />
              <span class="mono" style="font-size:12px; color:var(--text-soft);">mbar</span>
            </div>
          </div>
          <input type="range" id="rng-pressure" min="0" max="1000" />
          <div class="bounds">
            <span>0.2 mbar</span>
            <span id="lbl-press-conv">0 Torr · 0 kPa</span>
            <span>950 mbar</span>
          </div>
          <div class="field-row" style="margin-top:10px; margin-bottom:0;">
            <span class="field-label">Suction Gas Temp</span>
            <div style="display:flex; align-items:center; gap:5px;">
              <input type="number" id="inp-temp" min="-20" max="150" step="1" />
              <span class="mono" style="font-size:12px; color:var(--text-soft);">°C</span>
            </div>
          </div>
        </div>

        <div class="side-sec">
          <div class="sec-label"><span>Material Type &amp; Sealing</span></div>
          <div style="margin-bottom:10px;">
            <div class="field-row" style="margin-bottom:4px;">
              <span class="field-label" style="font-weight:600; color:var(--text);">Vessel &amp; Piping Material</span>
              <span id="lbl-vessel-factor" class="mono" style="font-size:11px; color:var(--text-soft);">1.00×</span>
            </div>
            <select id="sel-vessel"></select>
            <div id="lbl-vessel-note" class="hint"></div>
          </div>
          <div style="margin-bottom:10px;">
            <div class="field-row" style="margin-bottom:4px;">
              <span class="field-label" style="font-weight:600; color:var(--text);">Gasket / Seal Material</span>
              <span id="lbl-gasket-factor" class="mono" style="font-size:11px; color:var(--text-soft);">1.00×</span>
            </div>
            <select id="sel-gasket"></select>
            <div id="lbl-gasket-note" class="hint"></div>
          </div>
          <div>
            <div class="field-label" style="font-weight:600; color:var(--text); margin-bottom:5px;">Plant Mechanical Integrity</div>
            <div class="seg-ctrl" style="width:100%; display:grid; grid-template-columns:repeat(3,1fr);">
              <button type="button" class="seg-btn" data-integrity="tight">Tight 1.0×</button>
              <button type="button" class="seg-btn" data-integrity="standard">Std 1.35×</button>
              <button type="button" class="seg-btn" data-integrity="aged">Aged 1.9×</button>
            </div>
          </div>
        </div>

        <div class="side-sec">
          <div class="sec-label" style="margin-bottom:0; cursor:pointer;" id="btn-toggle-comp">
            <span>Fitting &amp; Seal Inventory</span>
            <span id="lbl-comp-count" class="mono" style="font-size:11px;">0 joints ▸</span>
          </div>
          <div id="panel-comp" class="hidden" style="margin-top:10px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
              <span style="font-size:11px; color:var(--text-soft);">Component Inventory model inputs</span>
              <button type="button" id="btn-autoscale" style="border:none; background:none; color:var(--accent-dark); font-size:11px; font-weight:600; cursor:pointer;">Auto-scale V</button>
            </div>
            <div id="comp-fields"></div>
          </div>
        </div>
      </aside>

      <!-- Main Stage -->
      <div class="main-col">
        <div class="kpi-grid">
          <div class="card kpi">
            <div class="kpi-title">Design Air In-Leakage</div>
            <div class="kpi-val"><span id="kpi-air">0.00</span><span class="kpi-unit">kg/h</span></div>
            <div class="kpi-sub" id="kpi-air-sub">0.00 lb/h</div>
          </div>
          <div class="card kpi">
            <div class="kpi-title">Total Suction Capacity</div>
            <div class="kpi-val" style="color:var(--accent-dark);"><span id="kpi-flow">0.0</span><span class="kpi-unit">m³/h</span></div>
            <div class="kpi-sub" id="kpi-flow-sub">0.0 ACFM</div>
          </div>
          <div class="card kpi">
            <div class="kpi-title">Leakage Flow Regime</div>
            <div style="margin-top:8px; font-size:14px; font-weight:600;" id="kpi-regime">● Sonic Choked</div>
            <div class="kpi-sub" id="kpi-regime-sub" style="margin-top:6px;">ρ = 0 kg/m³</div>
          </div>
          <div class="card kpi">
            <div class="kpi-title">Recommended Vacuum Train</div>
            <div style="margin-top:8px; font-size:13px; font-weight:600;" id="kpi-train">—</div>
            <div class="kpi-sub" id="kpi-train-sub" style="margin-top:6px;">0.0 kW shaft</div>
          </div>
        </div>

        <!-- SVG Chart -->
        <section id="curves" class="card card-pad">
          <div class="card-head">
            <div>
              <h2>Air Leakage vs. Vacuum Pressure Curves</h2>
              <div id="chart-sub" style="font-size:12px; color:var(--text-soft); margin-top:2px;"></div>
            </div>
            <div class="seg-ctrl">
              <button type="button" id="btn-mode-mass" class="seg-btn active">Mass Rate (kg/h)</button>
              <button type="button" id="btn-mode-vol" class="seg-btn">Suction Flow (m³/h)</button>
            </div>
          </div>

          <div class="legend">
            <span class="legend-item"><svg width="20" height="4"><line x1="0" y1="2" x2="20" y2="2" stroke="#0284c7" stroke-width="2.5"/></svg>HEI Standard</span>
            <span class="legend-item"><svg width="20" height="4"><line x1="0" y1="2" x2="20" y2="2" stroke="#0d9488" stroke-width="2" stroke-dasharray="5 3"/></svg>Seider–Seader–Lewin</span>
            <span class="legend-item"><svg width="20" height="4"><line x1="0" y1="2" x2="20" y2="2" stroke="#d97706" stroke-width="2" stroke-dasharray="2 3"/></svg>Ryans &amp; Roper</span>
            <span class="legend-item"><svg width="20" height="4"><line x1="0" y1="2" x2="20" y2="2" stroke="#334155" stroke-width="2"/></svg>Component Inventory</span>
          </div>

          <svg id="leak-chart" viewBox="0 0 760 330" style="width:100%; height:auto; cursor:crosshair; display:block;"></svg>
          <div class="hud" id="chart-hud"></div>
        </section>

        <!-- Comparison Table -->
        <section class="card" style="overflow:hidden;">
          <div class="card-pad" style="padding-bottom:12px; border-bottom:1px solid var(--surface-muted); display:flex; flex-wrap:wrap; justify-content:space-between; gap:8px;">
            <div>
              <h2>Industry Model Comparison</h2>
              <div style="font-size:12px; color:var(--text-soft); margin-top:2px;">Click any row to select the primary sizing basis</div>
            </div>
            <div id="lbl-comb-factor" class="mono" style="font-size:12px; color:var(--text-soft);"></div>
          </div>
          <div style="overflow-x:auto;">
            <table>
              <thead>
                <tr>
                  <th>Sizing Basis</th>
                  <th class="num">Base Air (kg/h)</th>
                  <th class="num">Adjusted (kg/h)</th>
                  <th class="num">Adjusted (lb/h)</th>
                  <th class="num">Suction (m³/h)</th>
                  <th class="num">Suction (ACFM)</th>
                </tr>
              </thead>
              <tbody id="model-tbody"></tbody>
            </table>
          </div>
        </section>

        <!-- Equipment Sizing & Component Share -->
        <section id="sizing" class="split-2">
          <div class="card card-pad">
            <div class="card-head" style="border-bottom:1px solid var(--surface-muted); padding-bottom:10px;">
              <div>
                <h2>Vacuum Pump &amp; Condenser Sizing Basis</h2>
                <div style="font-size:12px; color:var(--text-soft); margin-top:2px;">Design safety factor &amp; Dalton&apos;s law saturation carryover</div>
              </div>
            </div>

            <div class="grid-3" style="margin-bottom:14px;">
              <div>
                <div class="field-label" style="margin-bottom:4px; font-weight:600;">Design Margin</div>
                <select id="sel-margin">
                  <option value="1">1.00× (Nominal)</option>
                  <option value="1.25">1.25× (Tight Pilot)</option>
                  <option value="1.5">1.50× (Standard Plant)</option>
                  <option value="2">2.00× (HEI / API Conservative)</option>
                </select>
              </div>
              <div>
                <div class="field-label" style="margin-bottom:4px; font-weight:600;">Vapor Carryover</div>
                <select id="sel-vapor">
                  <option value="dry_air_only">Dry Air Only</option>
                  <option value="water">Water Vapor (Steam)</option>
                  <option value="methanol">Methanol</option>
                  <option value="toluene">Toluene</option>
                  <option value="n_hexane">n-Hexane</option>
                </select>
              </div>
              <div>
                <div class="field-label" style="margin-bottom:4px; font-weight:600;">Condenser Temp (°C)</div>
                <input type="number" id="inp-cond-temp" min="-30" max="80" step="1" />
              </div>
            </div>

            <div id="vapor-warn" class="warn-box hidden"></div>

            <div class="kpi-grid" style="grid-template-columns:repeat(4,1fr); gap:12px; margin-top:12px;">
              <div>
                <div class="kpi-title">Design Air Load</div>
                <div class="mono" style="font-size:17px; font-weight:600; margin-top:3px;" id="sz-air">0.00 kg/h</div>
                <div class="kpi-sub" id="sz-air-lb">0.00 lb/h</div>
              </div>
              <div>
                <div class="kpi-title">Vapor Carryover</div>
                <div class="mono" style="font-size:17px; font-weight:600; margin-top:3px;" id="sz-vap">0.00 kg/h</div>
                <div class="kpi-sub" id="sz-pvap">P_vap: 0 mbar</div>
              </div>
              <div>
                <div class="kpi-title">Total Suction</div>
                <div class="mono" style="font-size:17px; font-weight:600; color:var(--accent-dark); margin-top:3px;" id="sz-flow">0.0 m³/h</div>
                <div class="kpi-sub" id="sz-acfm">0.0 ACFM</div>
              </div>
              <div>
                <div class="kpi-title">Est. Pump-Down</div>
                <div class="mono" style="font-size:17px; font-weight:600; margin-top:3px;" id="sz-pumpdown">0 min</div>
                <div class="kpi-sub" id="sz-pdown-sub">1013 → 15 mbar</div>
              </div>
            </div>

            <div class="train-box">
              <div style="display:flex; flex-wrap:wrap; justify-content:space-between; gap:8px;">
                <div>
                  <div class="kpi-title">Recommended Vacuum Train</div>
                  <div id="sz-train-tech" style="font-weight:600; margin-top:2px;">—</div>
                </div>
                <div id="sz-train-stats" class="mono" style="font-size:12px;"></div>
              </div>
              <p id="sz-train-rat" style="margin:8px 0 0; font-size:12px; color:var(--text-muted);"></p>
            </div>
          </div>

          <div class="card card-pad">
            <div style="border-bottom:1px solid var(--surface-muted); padding-bottom:10px; margin-bottom:12px;">
              <h2>Component Seal Leakage Share</h2>
              <div style="font-size:12px; color:var(--text-soft); margin-top:2px;">Perry&apos;s / Ryans &amp; Roper fitting inventory contribution</div>
            </div>
            <div id="comp-bars" style="display:flex; flex-direction:column; gap:10px;"></div>
          </div>
        </section>

        <!-- Equations Reference -->
        <section id="standards" class="card card-pad">
          <h2 style="margin-bottom:12px;">Industry-Standard Models &amp; Governing Equations</h2>
          <div class="eq-grid">
            <div class="eq-card">
              <strong style="font-size:12px;">01. HEI Standard Method</strong>
              <p class="hint">Correlates allowable air leakage with volume V and operating pressure tier for commercially tight systems.</p>
              <div class="eq-formula">W_air [lb/h] = C_HEI(P) · V_ft³^0.667 · Φ(P) · M_mat · M_int</div>
            </div>
            <div class="eq-card">
              <strong style="font-size:12px;">02. Seider–Seader–Lewin / Ludwig</strong>
              <p class="hint">Continuous log-polynomial correlation widely used in distillation tower and ejector sizing.</p>
              <div class="eq-formula">W [lb/h] = 5 + [0.0298 + 0.03088·ln(P) - 0.0005733·(ln P)²] · V^0.66</div>
            </div>
            <div class="eq-card">
              <strong style="font-size:12px;">03. Ryans &amp; Roper Power Law</strong>
              <p class="hint">Empirical power-law curve capturing gradual variation with operating pressure and vessel volume.</p>
              <div class="eq-formula">W_air [lb/h] = 0.085 · P_Torr^0.25 · V_ft³^0.60 · Φ(P) · M_mat</div>
            </div>
            <div class="eq-card">
              <strong style="font-size:12px;">04. Choked Sonic Orifice Physics</strong>
              <p class="hint">For air (γ = 1.4), flow through leak orifices chokes below P_crit = 535.3 mbar (Φ = 1.0); actual volumetric flow scales inversely with density.</p>
              <div class="eq-formula">Q_actual [m³/h] = ṁ_air / ρ_air(P, T)</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </main>

  <footer>
    <div class="footer-inner">
      <span>Standalone Offline Vacuum Distillation Air Leakage Estimator</span>
      <span>Correlations: HEI Steam Jet Standards · Seider–Seader–Lewin · Ryans &amp; Roper · Perry&apos;s Ch. 10</span>
    </div>
  </footer>

  <script>
  (function () {
    const P_ATM = 1013.25;
    const P_CRIT = 535.28;
    const M_AIR = 28.97;
    const R_AIR = 287.05;
    const M3_FT3 = 35.314667;
    const MBAR_TORR = 0.75006168;
    const KG_LB = 2.2046226;
    const M3H_ACFM = 0.5885778;

    const PRESETS = ${safePresetsJson};
    const VESSELS = ${safeVesselsJson};
    const GASKETS = ${safeGasketsJson};
    const INTEGRITIES = ${safeIntegrityJson};
    const VAPOR_SPECS = {
      water: { name: 'Water Vapor (Steam)', mw: 18.015, A: 8.07131, B: 1730.63, C: 233.426 },
      methanol: { name: 'Methanol', mw: 32.04, A: 8.08097, B: 1582.271, C: 239.726 },
      toluene: { name: 'Toluene', mw: 92.14, A: 6.95464, B: 1344.8, C: 219.482 },
      n_hexane: { name: 'n-Hexane', mw: 86.18, A: 6.87601, B: 1171.17, C: 224.41 }
    };
    const COMP_DEFS = [
      { key: 'flanges', label: 'Standard Flanged Joints', rate: 0.022, mat: true },
      { key: 'manways', label: 'Manways & Sight Glasses', rate: 0.110, mat: true },
      { key: 'packedValves', label: 'Packed Stem Valves', rate: 0.068, mat: false },
      { key: 'bellowsValves', label: 'Bellows / Diaphragm Valves', rate: 0.002, mat: false },
      { key: 'mechSeals', label: 'Mechanical Shaft Seals', rate: 0.045, mat: false },
      { key: 'stuffingBoxes', label: 'Packed Stuffing Boxes', rate: 0.450, mat: false },
      { key: 'threadedFittings', label: 'Threaded / Instrument Joints', rate: 0.060, mat: false }
    ];

    let state = ${safeStateJson};
    let chartMode = 'mass';
    let hoverIdx = null;
    let lastSamples = [];

    function phi(pMbar) {
      const p = Math.max(0.05, Math.min(P_ATM, pMbar));
      if (p <= P_CRIT) return 1.0;
      const g = 1.4, r = p / P_ATM, rc = P_CRIT / P_ATM;
      const t = Math.max(0, Math.pow(r, 2/g) - Math.pow(r, (g+1)/g));
      const tc = Math.pow(rc, 2/g) - Math.pow(rc, (g+1)/g);
      return Math.sqrt(t / tc);
    }

    function calcHEI(vM3, pMbar) {
      const vFt3 = Math.max(0.5, vM3 * M3_FT3);
      const pTorr = Math.max(0.05, Math.min(P_CRIT * MBAR_TORR, pMbar * MBAR_TORR));
      const anchors = [[0.1,0.014],[0.5,0.021],[1.0,0.035],[3.0,0.068],[20.0,0.120],[90.0,0.195],[401.5,0.195]];
      let c = anchors[anchors.length - 1][1];
      if (pTorr <= anchors[0][0]) c = anchors[0][1];
      else {
        for (let i = 0; i < anchors.length - 1; i++) {
          const [p1, c1] = anchors[i], [p2, c2] = anchors[i+1];
          if (pTorr >= p1 && pTorr <= p2) {
            const t = (Math.log(pTorr) - Math.log(p1)) / (Math.log(p2) - Math.log(p1));
            c = c1 + t * (c2 - c1);
            break;
          }
        }
      }
      return (c * Math.pow(vFt3, 0.667) * phi(pMbar)) / KG_LB;
    }

    function calcSSL(vM3, pMbar) {
      const vFt3 = Math.max(0.5, vM3 * M3_FT3);
      const pTorr = Math.max(0.1, Math.min(P_CRIT * MBAR_TORR, pMbar * MBAR_TORR));
      const lnP = Math.log(Math.max(1.0, pTorr));
      let coeff = pTorr < 1.0 ? 0.0298 * Math.pow(pTorr, 0.35) : (0.0298 + 0.03088 * lnP - 0.0005733 * lnP * lnP);
      const offset = vFt3 < 100 ? 5.0 * Math.pow(vFt3 / 100, 0.66) : 5.0;
      return ((offset + coeff * Math.pow(vFt3, 0.66)) * phi(pMbar)) / KG_LB;
    }

    function calcRR(vM3, pMbar) {
      const vFt3 = Math.max(0.5, vM3 * M3_FT3);
      const pTorr = Math.max(0.05, Math.min(P_CRIT * MBAR_TORR, pMbar * MBAR_TORR));
      return (0.085 * Math.pow(pTorr, 0.25) * Math.pow(vFt3, 0.60) * phi(pMbar)) / KG_LB;
    }

    function calcInv(counts, pMbar, vf, gf, inf) {
      const ff = phi(pMbar), fm = vf * gf;
      let total = 0;
      const rows = COMP_DEFS.map(d => {
        const cnt = Math.max(0, counts[d.key] || 0);
        const tot = cnt * d.rate * (d.mat ? fm : 1.0) * inf * ff;
        total += tot;
        return { key: d.key, label: d.label, count: cnt, totalKgH: tot };
      });
      return {
        totalKgH: total,
        rows: rows.map(r => ({ ...r, share: total > 0 ? (r.totalKgH / total) * 100 : 0 }))
      };
    }

    function toLog(val, min, max) {
      const c = Math.max(min, Math.min(max, val));
      return ((Math.log10(c) - Math.log10(min)) / (Math.log10(max) - Math.log10(min))) * 1000;
    }
    function fromLog(pos, min, max) {
      return Math.pow(10, Math.log10(min) + (Math.max(0, Math.min(1000, pos)) / 1000) * (Math.log10(max) - Math.log10(min)));
    }
    function fmt(v) {
      if (!Number.isFinite(v)) return '—';
      if (v >= 1000) return v.toFixed(0);
      if (v >= 100) return v.toFixed(1);
      if (v >= 1) return v.toFixed(2);
      return v.toFixed(3);
    }

    const el = (id) => document.getElementById(id);
    const STORAGE_KEY = 'vaculeak_saved_presets_v1';
    const embeddedSaved = ${safeSavedPresetsJson};

    function loadSaved() {
      let local = [];
      try {
        if (window.localStorage) {
          const raw = window.localStorage.getItem(STORAGE_KEY);
          if (raw) {
            const arr = JSON.parse(raw);
            if (Array.isArray(arr)) local = arr;
          }
        }
      } catch (e) {}
      const merged = [...local];
      embeddedSaved.forEach(ep => {
        if (!merged.some(lp => lp.id === ep.id || lp.name.toLowerCase() === ep.name.toLowerCase())) {
          merged.push(ep);
        }
      });
      return merged;
    }

    let savedPresets = loadSaved();

    function populatePresetDropdown() {
      const sel = el('sel-preset');
      sel.innerHTML = '';
      const g1 = document.createElement('optgroup');
      g1.label = 'Standard Industry Presets';
      PRESETS.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.id; opt.textContent = p.name;
        g1.appendChild(opt);
      });
      sel.appendChild(g1);

      if (savedPresets.length > 0) {
        const g2 = document.createElement('optgroup');
        g2.label = 'Saved Configurations';
        savedPresets.forEach(sp => {
          const opt = document.createElement('option');
          opt.value = sp.id;
          opt.textContent = sp.name + ' (' + sp.inputs.volumeM3 + ' m³ · ' + sp.inputs.pressureMbar + ' mbar)';
          g2.appendChild(opt);
        });
        sel.appendChild(g2);
      }

      if (state.presetId === 'custom') {
        const cOpt = document.createElement('option');
        cOpt.value = 'custom'; cOpt.textContent = 'Custom Engineering Parameters';
        sel.appendChild(cOpt);
      }
      sel.value = state.presetId;
      const isSavedActive = savedPresets.some(sp => sp.id === state.presetId);
      el('btn-del-preset').classList.toggle('hidden', !isSavedActive);
    }

    populatePresetDropdown();

    VESSELS.forEach(v => {
      const opt = document.createElement('option');
      opt.value = v.id; opt.textContent = v.name + ' (' + v.factor.toFixed(2) + '×)';
      el('sel-vessel').appendChild(opt);
    });
    GASKETS.forEach(g => {
      const opt = document.createElement('option');
      opt.value = g.id; opt.textContent = g.name + ' (' + g.factor.toFixed(2) + '×)';
      el('sel-gasket').appendChild(opt);
    });

    // Build component inputs
    COMP_DEFS.forEach(d => {
      const row = document.createElement('div');
      row.className = 'field-row';
      row.innerHTML = '<span class="field-label">' + d.label + '</span><input type="number" min="0" max="500" step="1" data-comp="' + d.key + '" style="width:74px; height:26px;" />';
      el('comp-fields').appendChild(row);
    });

    function computeAll() {
      const vSpec = VESSELS.find(x => x.id === state.vesselMaterial) || VESSELS[0];
      const gSpec = GASKETS.find(x => x.id === state.gasketMaterial) || GASKETS[0];
      const iSpec = INTEGRITIES.find(x => x.id === state.integrityClass) || INTEGRITIES[0];
      const pMbar = Math.max(0.1, Math.min(980, state.pressureMbar));
      const vM3 = Math.max(0.05, state.volumeM3);
      const tK = state.suctionTempC + 273.15;
      const rho = (pMbar * 100) / (R_AIR * tK);
      const ff = phi(pMbar);
      const comb = vSpec.factor * gSpec.factor * iSpec.factor;

      const heiB = calcHEI(vM3, pMbar), sslB = calcSSL(vM3, pMbar), rrB = calcRR(vM3, pMbar);
      const invR = calcInv(state.componentCounts, pMbar, vSpec.factor, gSpec.factor, iSpec.factor);

      const models = [
        { id: 'hei', name: 'HEI Standard Method', ref: 'Heat Exchange Institute', base: heiB, adj: heiB * comb },
        { id: 'ssl', name: 'Seider–Seader–Lewin', ref: 'Process Design Principles', base: sslB, adj: sslB * comb },
        { id: 'ryans_roper', name: 'Ryans & Roper Power Law', ref: 'Process Vacuum Design', base: rrB, adj: rrB * comb },
        { id: 'component_inventory', name: 'Component & Seal Inventory', ref: "Perry's Ch. 10 / Fitting Count", base: invR.totalKgH / Math.max(0.1, comb), adj: invR.totalKgH }
      ].map(m => ({ ...m, lb: m.adj * KG_LB, flow: m.adj / rho, acfm: (m.adj / rho) * M3H_ACFM }));

      const sel = models.find(m => m.id === state.primaryModel) || models[0];
      const dAir = sel.adj * state.designMargin;
      const dLb = dAir * KG_LB;

      let pVap = 0, vapCarry = 0, chokedVap = false, totFlow = dAir / rho;
      if (state.vaporSpecies !== 'dry_air_only') {
        const vs = VAPOR_SPECS[state.vaporSpecies];
        pVap = Math.pow(10, vs.A - vs.B / (state.condenserTempC + vs.C)) / MBAR_TORR;
        const effP = Math.min(pVap, pMbar * 0.92);
        chokedVap = pVap >= pMbar * 0.92;
        vapCarry = dAir * (vs.mw / M_AIR) * (effP / Math.max(0.05, pMbar - effP));
        totFlow = ((dAir / M_AIR + vapCarry / vs.mw) * 8314.46 * tK) / (pMbar * 100);
      }

      const compRatio = P_ATM / Math.max(0.1, pMbar);
      const isoKw = ((pMbar * 100 * (totFlow / 3600)) * Math.log(compRatio)) / 1000;
      let pwr = Math.max(0.35, isoKw / 0.42);
      let tech = 'Single-Stage Liquid Ring Pump', stages = '1-Stage LRVP', steam = null, rat = 'Rough vacuum (>120 mbar) suits liquid ring pumps.';
      if (pMbar < 120 && pMbar >= 30) { tech = '2-Stage Liquid Ring Pump or Dry Screw'; stages = '2-Stage LRVP / Dry Screw'; rat = 'Medium vacuum (30–120 mbar) matches 2-stage LRVP or dry screw.'; }
      else if (pMbar < 30 && pMbar >= 4) { tech = 'Dry Screw Pump or 2–3 Stage Steam Ejector'; stages = 'Dry Screw / 2–3 Stage Ejector'; steam = dAir * (pMbar < 12 ? 9.5 : 6.2); rat = 'Fine vacuum (4–30 mbar); use dry screw or multi-stage steam ejector.'; }
      else if (pMbar < 4 && pMbar >= 0.8) { tech = 'Roots Booster + Dry Screw Backing Pump'; stages = 'Roots + Dry Screw'; pwr *= 1.15; steam = dAir * 15.0; rat = 'Deep vacuum (0.8–4 mbar) requires Roots booster + dry backing stage.'; }
      else if (pMbar < 0.8) { tech = 'Multi-Stage Roots Train or 4–5 Stage Ejector'; stages = '2× Roots + Dry Backing'; pwr *= 1.35; steam = dAir * 24.0; rat = 'High vacuum (<0.8 mbar) demands multi-stage Roots or 4–5 stage ejector.'; }

      const pDown = ((vM3 / Math.max(1.0, totFlow * 1.15)) * Math.log(P_ATM / pMbar) * 60 * 1.18);

      return { vSpec, gSpec, iSpec, pMbar, vM3, rho, ff, comb, models, sel, dAir, dLb, pVap, vapCarry, chokedVap, totFlow, tech, stages, pwr, steam, rat, pDown, invRows: invR.rows };
    }

    function render() {
      const s = computeAll();
      el('sel-preset').value = state.presetId;
      el('inp-volume').value = state.volumeM3;
      el('rng-volume').value = toLog(state.volumeM3, 0.05, 500);
      el('lbl-vol-ft3').textContent = (state.volumeM3 * M3_FT3).toFixed(1) + ' ft³';
      el('inp-pressure').value = state.pressureMbar;
      el('rng-pressure').value = toLog(state.pressureMbar, 0.2, 950);
      el('lbl-press-conv').textContent = (state.pressureMbar * MBAR_TORR).toFixed(1) + ' Torr · ' + (state.pressureMbar * 0.1).toFixed(2) + ' kPa';
      el('inp-temp').value = state.suctionTempC;
      el('sel-vessel').value = state.vesselMaterial;
      el('lbl-vessel-factor').textContent = s.vSpec.factor.toFixed(2) + '×';
      el('lbl-vessel-note').textContent = s.vSpec.notes;
      el('sel-gasket').value = state.gasketMaterial;
      el('lbl-gasket-factor').textContent = s.gSpec.factor.toFixed(2) + '×';
      el('lbl-gasket-note').textContent = s.gSpec.notes;
      el('sel-margin').value = String(state.designMargin);
      el('sel-vapor').value = state.vaporSpecies;
      el('inp-cond-temp').value = state.condenserTempC;
      el('inp-cond-temp').disabled = state.vaporSpecies === 'dry_air_only';

      document.querySelectorAll('[data-integrity]').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-integrity') === state.integrityClass);
      });

      let totalJoints = 0;
      document.querySelectorAll('[data-comp]').forEach(inp => {
        const k = inp.getAttribute('data-comp');
        const val = state.componentCounts[k] || 0;
        inp.value = val;
        totalJoints += val;
      });
      const openComp = !el('panel-comp').classList.contains('hidden');
      el('lbl-comp-count').textContent = totalJoints + ' joints ' + (openComp ? '▾' : '▸');

      el('kpi-air').textContent = s.dAir.toFixed(2);
      el('kpi-air-sub').textContent = s.dLb.toFixed(2) + ' lb/h · ' + state.designMargin.toFixed(2) + '× margin';
      el('kpi-flow').textContent = s.totFlow.toFixed(1);
      el('kpi-flow-sub').textContent = (s.totFlow * M3H_ACFM).toFixed(1) + ' ACFM · incl. vapor';
      el('kpi-regime').innerHTML = s.pMbar <= P_CRIT ? '<span style="color:var(--accent-dark);">● Sonic Choked Orifice</span>' : '<span style="color:var(--amber);">▲ Subsonic Compressible</span>';
      el('kpi-regime-sub').textContent = 'ρ_air = ' + s.rho.toFixed(4) + ' kg/m³ · Φ = ' + s.ff.toFixed(2);
      el('kpi-train').textContent = s.stages;
      el('kpi-train-sub').textContent = 'Est. ' + s.pwr.toFixed(1) + ' kW shaft · ' + s.comb.toFixed(2) + '× mat';

      el('lbl-comb-factor').textContent = 'Combined Factor: ' + s.comb.toFixed(2) + '× (Vessel × Gasket × Integrity)';
      el('model-tbody').innerHTML = s.models.map(m => {
        const sel = m.id === state.primaryModel;
        return '<tr class="model-row ' + (sel ? 'selected' : '') + '" data-model="' + m.id + '">' +
          '<td><label style="display:flex; align-items:center; gap:8px; cursor:pointer;"><input type="radio" name="pmod" ' + (sel ? 'checked' : '') + ' /><div><div style="font-weight:600;">' + m.name + '</div><div style="font-size:11px; color:var(--text-soft);">' + m.ref + '</div></div></label></td>' +
          '<td class="num">' + m.base.toFixed(3) + '</td>' +
          '<td class="num" style="font-weight:600;">' + m.adj.toFixed(3) + '</td>' +
          '<td class="num">' + m.lb.toFixed(3) + '</td>' +
          '<td class="num" style="font-weight:600; color:var(--accent-dark);">' + m.flow.toFixed(1) + '</td>' +
          '<td class="num">' + m.acfm.toFixed(1) + '</td>' +
        '</tr>';
      }).join('');

      document.querySelectorAll('[data-model]').forEach(tr => {
        tr.addEventListener('click', () => {
          state.primaryModel = tr.getAttribute('data-model');
          render();
        });
      });

      const warnEl = el('vapor-warn');
      if (s.chokedVap && state.vaporSpecies !== 'dry_air_only') {
        warnEl.classList.remove('hidden');
        warnEl.textContent = '▲ Condenser Limit Reached: Vapor pressure (' + s.pVap.toFixed(1) + ' mbar) approaches operating vacuum (' + s.pMbar + ' mbar). Lower vent condenser temperature.';
      } else {
        warnEl.classList.add('hidden');
      }

      el('sz-air').textContent = s.dAir.toFixed(2) + ' kg/h';
      el('sz-air-lb').textContent = s.dLb.toFixed(2) + ' lb/h';
      el('sz-vap').textContent = s.vapCarry.toFixed(2) + ' kg/h';
      el('sz-pvap').textContent = 'P_vap: ' + s.pVap.toFixed(1) + ' mbar';
      el('sz-flow').textContent = s.totFlow.toFixed(1) + ' m³/h';
      el('sz-acfm').textContent = (s.totFlow * M3H_ACFM).toFixed(1) + ' ACFM';
      el('sz-pumpdown').textContent = s.pDown.toFixed(0) + ' min';
      el('sz-pdown-sub').textContent = '1013 → ' + s.pMbar + ' mbar';
      el('sz-train-tech').textContent = s.tech;
      el('sz-train-stats').innerHTML = 'Est. Shaft: <strong>' + s.pwr.toFixed(1) + ' kW</strong>' + (s.steam !== null ? ' · Motive Steam: <strong>~' + s.steam.toFixed(0) + ' kg/h</strong>' : '');
      el('sz-train-rat').textContent = s.rat;

      el('comp-bars').innerHTML = s.invRows.map(r =>
        '<div><div style="display:flex; justify-content:space-between; font-size:12px;"><span>' + r.label + ' <span class="mono" style="color:var(--text-soft);">(×' + r.count + ')</span></span><span class="mono">' + r.totalKgH.toFixed(3) + ' kg/h <span style="color:var(--text-soft);">(' + r.share.toFixed(0) + '%)</span></span></div><div class="bar-track"><div class="bar-fill" style="width:' + Math.min(100, r.share) + '%"></div></div></div>'
      ).join('');

      renderChart(s);
    }

    function renderChart(s) {
      el('chart-sub').textContent = 'Log-pressure sweep (0.2–950 mbar) at ' + state.volumeM3.toFixed(2) + ' m³ · ' + s.comb.toFixed(2) + '× material & integrity factor · Click curve to set pressure';
      const W = 760, H = 330, PAD = { t: 24, r: 24, b: 44, l: 66 };
      const PW = W - PAD.l - PAD.r, PH = H - PAD.t - PAD.b;
      const MINP = 0.2, MAXP = 950;
      const tK = state.suctionTempC + 273.15;
      const samples = [];
      let maxVal = 0, minVal = Infinity;
      for (let i = 0; i <= 84; i++) {
        const p = Math.pow(10, Math.log10(MINP) + (i / 84) * (Math.log10(MAXP) - Math.log10(MINP)));
        const rho = (p * 100) / (R_AIR * tK);
        const h = calcHEI(state.volumeM3, p) * s.comb;
        const ss = calcSSL(state.volumeM3, p) * s.comb;
        const rr = calcRR(state.volumeM3, p) * s.comb;
        const inv = calcInv(state.componentCounts, p, s.vSpec.factor, s.gSpec.factor, s.iSpec.factor).totalKgH;
        const row = {
          p,
          hei: chartMode === 'mass' ? h : h / rho,
          ssl: chartMode === 'mass' ? ss : ss / rho,
          rr: chartMode === 'mass' ? rr : rr / rho,
          inv: chartMode === 'mass' ? inv : inv / rho
        };
        maxVal = Math.max(maxVal, row.hei, row.ssl, row.rr, row.inv);
        minVal = Math.min(minVal, row.hei, row.ssl, row.rr, row.inv);
        samples.push(row);
      }
      lastSamples = samples;

      let yMin = 0, yMax = 1, yTicks = [];
      if (chartMode === 'volumetric') {
        const lMin = Math.floor(Math.log10(Math.max(0.01, minVal)));
        const lMax = Math.ceil(Math.log10(Math.max(1, maxVal * 1.15)));
        yMin = Math.pow(10, lMin); yMax = Math.pow(10, lMax);
        for (let e = lMin; e <= lMax; e++) yTicks.push(Math.pow(10, e));
      } else {
        const pMax = Math.max(0.1, maxVal * 1.12);
        const rStep = pMax / 5;
        const p10 = Math.pow(10, Math.floor(Math.log10(rStep)));
        const n = rStep / p10;
        const step = (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p10;
        yMax = Math.ceil(pMax / step) * step;
        for (let v = 0; v <= yMax + step * 0.001; v += step) yTicks.push(v);
      }

      const xS = (p) => PAD.l + ((Math.log10(Math.max(MINP, Math.min(MAXP, p))) - Math.log10(MINP)) / (Math.log10(MAXP) - Math.log10(MINP))) * PW;
      const yS = (v) => {
        if (chartMode === 'volumetric') {
          const c = Math.max(yMin, Math.min(yMax, v));
          return PAD.t + PH - ((Math.log10(c) - Math.log10(yMin)) / Math.max(0.0001, Math.log10(yMax) - Math.log10(yMin))) * PH;
        }
        return PAD.t + PH - (Math.max(0, Math.min(yMax, v)) / Math.max(0.0001, yMax)) * PH;
      };
      const pathOf = (k) => samples.map((pt, i) => (i === 0 ? 'M' : 'L') + xS(pt.p).toFixed(1) + ',' + yS(pt[k]).toFixed(1)).join(' ');

      const critX = xS(P_CRIT), opX = xS(state.pressureMbar);
      const pTicks = [0.2, 0.5, 1, 2, 5, 10, 25, 50, 100, 250, 535, 950];
      const opVals = {
        hei: chartMode === 'mass' ? s.models[0].adj : s.models[0].flow,
        ssl: chartMode === 'mass' ? s.models[1].adj : s.models[1].flow,
        rr: chartMode === 'mass' ? s.models[2].adj : s.models[2].flow,
        inv: chartMode === 'mass' ? s.models[3].adj : s.models[3].flow
      };

      let svg = '<rect x="' + PAD.l + '" y="' + PAD.t + '" width="' + Math.max(0, critX - PAD.l) + '" height="' + PH + '" fill="#f8fafc" />';
      yTicks.forEach(t => {
        const y = yS(t);
        svg += '<line x1="' + PAD.l + '" y1="' + y + '" x2="' + (PAD.l + PW) + '" y2="' + y + '" stroke="#e2e8f0" />';
        svg += '<text x="' + (PAD.l - 8) + '" y="' + (y + 3.5) + '" text-anchor="end" font-size="10" font-family="monospace" fill="#64748b">' + fmt(t) + '</text>';
      });
      pTicks.forEach(t => {
        const x = xS(t), isC = t === 535;
        svg += '<line x1="' + x + '" y1="' + PAD.t + '" x2="' + x + '" y2="' + (PAD.t + PH) + '" stroke="' + (isC ? '#94a3b8' : '#f1f5f9') + '"' + (isC ? ' stroke-dasharray="4 3"' : '') + ' />';
        svg += '<text x="' + x + '" y="' + (PAD.t + PH + 16) + '" text-anchor="middle" font-size="10" font-family="monospace" fill="' + (isC ? '#334155' : '#64748b') + '" font-weight="' + (isC ? '600' : '400') + '">' + t + '</text>';
      });
      svg += '<text x="' + (critX - 6) + '" y="' + (PAD.t + 12) + '" text-anchor="end" font-size="9" font-family="monospace" fill="#64748b">Sonic Choked (&lt;535.3 mbar)</text>';
      svg += '<text x="' + (critX + 6) + '" y="' + (PAD.t + 12) + '" text-anchor="start" font-size="9" font-family="monospace" fill="#94a3b8">Subsonic</text>';
      svg += '<rect x="' + PAD.l + '" y="' + PAD.t + '" width="' + PW + '" height="' + PH + '" fill="none" stroke="#cbd5e1" />';
      svg += '<text x="' + (PAD.l + PW/2) + '" y="' + (H - 6) + '" text-anchor="middle" font-size="11" fill="#475569">Operating Suction Pressure (mbar abs, log scale)</text>';
      svg += '<text x="16" y="' + (PAD.t + PH/2) + '" text-anchor="middle" transform="rotate(-90 16 ' + (PAD.t + PH/2) + ')" font-size="11" fill="#475569">' + (chartMode === 'mass' ? 'Air In-Leakage (kg/h)' : 'Actual Suction Flow (m³/h)') + '</text>';
      svg += '<path d="' + pathOf('inv') + '" fill="none" stroke="#334155" stroke-width="2" />';
      svg += '<path d="' + pathOf('rr') + '" fill="none" stroke="#d97706" stroke-width="2" stroke-dasharray="2 3" />';
      svg += '<path d="' + pathOf('ssl') + '" fill="none" stroke="#0d9488" stroke-width="2" stroke-dasharray="5 3" />';
      svg += '<path d="' + pathOf('hei') + '" fill="none" stroke="#0284c7" stroke-width="2.5" />';
      svg += '<line x1="' + opX + '" y1="' + PAD.t + '" x2="' + opX + '" y2="' + (PAD.t + PH) + '" stroke="#0284c7" stroke-width="1.5" stroke-opacity="0.6" />';
      svg += '<circle cx="' + opX + '" cy="' + yS(opVals.hei) + '" r="4.5" fill="#0284c7" stroke="#fff" stroke-width="1.5" />';
      svg += '<circle cx="' + opX + '" cy="' + yS(opVals.ssl) + '" r="4" fill="#0d9488" stroke="#fff" stroke-width="1.5" />';
      svg += '<circle cx="' + opX + '" cy="' + yS(opVals.rr) + '" r="4" fill="#d97706" stroke="#fff" stroke-width="1.5" />';
      svg += '<circle cx="' + opX + '" cy="' + yS(opVals.inv) + '" r="4" fill="#334155" stroke="#fff" stroke-width="1.5" />';

      const act = hoverIdx !== null ? samples[hoverIdx] : null;
      if (act) {
        const hx = xS(act.p);
        svg += '<line x1="' + hx + '" y1="' + PAD.t + '" x2="' + hx + '" y2="' + (PAD.t + PH) + '" stroke="#475569" stroke-dasharray="2 2" />';
        svg += '<circle cx="' + hx + '" cy="' + yS(act.hei) + '" r="3.5" fill="#0284c7" />';
        svg += '<circle cx="' + hx + '" cy="' + yS(act.ssl) + '" r="3.5" fill="#0d9488" />';
        svg += '<circle cx="' + hx + '" cy="' + yS(act.rr) + '" r="3.5" fill="#d97706" />';
        svg += '<circle cx="' + hx + '" cy="' + yS(act.inv) + '" r="3.5" fill="#334155" />';
      }
      el('leak-chart').innerHTML = svg;

      const u = chartMode === 'mass' ? 'kg/h' : 'm³/h';
      const vals = act || opVals;
      const pDisp = act ? act.p : state.pressureMbar;
      el('chart-hud').innerHTML =
        '<span>' + (act ? 'PROBE' : 'OPERATING') + ' P = <strong>' + pDisp.toFixed(pDisp < 10 ? 2 : 1) + ' mbar</strong></span>' +
        '<span style="display:flex; flex-wrap:wrap; gap:14px;">' +
          '<span style="color:#0369a1;">HEI: ' + fmt(vals.hei) + ' ' + u + '</span>' +
          '<span style="color:#0f766e;">SSL: ' + fmt(vals.ssl) + ' ' + u + '</span>' +
          '<span style="color:#b45309;">R&amp;R: ' + fmt(vals.rr) + ' ' + u + '</span>' +
          '<span style="color:#334155;">INV: ' + fmt(vals.inv) + ' ' + u + '</span>' +
        '</span>';
    }

    // Pure-JS Zero-Dependency PDF 1.4 Binary Writer (A4 Engineering Datasheet)
    function buildOfflinePdfBytes(s) {
      const PW = 595.28, PH = 841.89, MM = 2.83464567;
      const cmds = [];
      const pdfSafe = (str) => String(str)
        .replace(/[^\\x20-\\x7E]/g, (ch) => {
          if (ch === '°') return ' deg ';
          if (ch === '³') return '3';
          if (ch === '×') return 'x';
          if (ch === '·') return '|';
          if (ch === '–' || ch === '—') return '-';
          if (ch === '→') return '->';
          if (ch === '≤') return '<=';
          if (ch === 'Φ') return 'Phi';
          if (ch === 'ρ') return 'rho';
          return '';
        })
        .replace(/\\\\/g, '\\\\\\\\')
        .replace(/\\(/g, '\\\\(')
        .replace(/\\)/g, '\\\\)');

      const py = (topMm) => PH - topMm * MM;
      const px = (leftMm) => leftMm * MM;
      const fillRect = (xMm, yMm, wMm, hMm, r, g, b) => {
        cmds.push((r/255).toFixed(3) + ' ' + (g/255).toFixed(3) + ' ' + (b/255).toFixed(3) + ' rg ' +
          px(xMm).toFixed(2) + ' ' + py(yMm + hMm).toFixed(2) + ' ' + (wMm*MM).toFixed(2) + ' ' + (hMm*MM).toFixed(2) + ' re f');
      };
      const strokeRect = (xMm, yMm, wMm, hMm, r, g, b, lw) => {
        cmds.push((lw || 0.5).toFixed(2) + ' w ' + (r/255).toFixed(3) + ' ' + (g/255).toFixed(3) + ' ' + (b/255).toFixed(3) + ' RG ' +
          px(xMm).toFixed(2) + ' ' + py(yMm + hMm).toFixed(2) + ' ' + (wMm*MM).toFixed(2) + ' ' + (hMm*MM).toFixed(2) + ' re S');
      };
      const txt = (str, xMm, yMm, size, bold, r, g, b) => {
        cmds.push('BT /' + (bold ? 'F2' : 'F1') + ' ' + size + ' Tf ' +
          (r/255).toFixed(3) + ' ' + (g/255).toFixed(3) + ' ' + (b/255).toFixed(3) + ' rg ' +
          px(xMm).toFixed(2) + ' ' + py(yMm).toFixed(2) + ' Td (' + pdfSafe(str) + ') Tj ET');
      };
      const drawTable = (startY, headers, rows, colXs, rightCols) => {
        let y = startY;
        const rowH = 6.2;
        fillRect(14, y, 182, rowH, 241, 245, 249);
        strokeRect(14, y, 182, rowH, 203, 213, 225, 0.4);
        headers.forEach((h, i) => {
          txt(h, colXs[i] + 1.5, y + 4.3, 7.8, true, 51, 65, 85);
        });
        y += rowH;
        rows.forEach((row, rIdx) => {
          const isHighlight = row._highlight;
          if (isHighlight) fillRect(14, y, 182, rowH, 240, 249, 255);
          else if (rIdx % 2 === 1) fillRect(14, y, 182, rowH, 248, 250, 252);
          strokeRect(14, y, 182, rowH, 226, 232, 240, 0.35);
          row.cells.forEach((cell, i) => {
            const isB = isHighlight && (i === 0 || i === 2);
            txt(cell, colXs[i] + 1.5, y + 4.3, 7.6, isB, 30, 41, 59);
          });
          y += rowH;
        });
        return y;
      };

      // Header Banner
      fillRect(0, 0, 210, 26, 15, 23, 42);
      txt('Vacuum Distillation Air Leakage Report', 14, 10.5, 13.5, true, 255, 255, 255);
      txt('Air In-Leakage Estimation & Vacuum System Sizing Datasheet (Offline)', 14, 17, 9, false, 203, 213, 225);
      txt('Generated: ' + new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC', 135, 10.5, 7.5, false, 148, 163, 184);
      txt('Basis: ' + s.sel.name, 135, 17, 7.5, false, 148, 163, 184);

      // KPI Strip
      const kpis = [
        { t: 'DESIGN AIR LEAKAGE', v: s.dAir.toFixed(2) + ' kg/h', sub: s.dLb.toFixed(2) + ' lb/h (' + state.designMargin.toFixed(2) + 'x)' },
        { t: 'TOTAL SUCTION FLOW', v: s.totFlow.toFixed(1) + ' m3/h', sub: (s.totFlow * M3H_ACFM).toFixed(1) + ' ACFM (incl. vapor)' },
        { t: 'FLOW REGIME', v: s.pMbar <= P_CRIT ? 'Sonic Choked' : 'Subsonic', sub: 'rho=' + s.rho.toFixed(4) + ' | Phi=' + s.ff.toFixed(2) },
        { t: 'RECOMMENDED TRAIN', v: s.stages.slice(0, 22), sub: 'Est. ' + s.pwr.toFixed(1) + ' kW shaft' }
      ];
      kpis.forEach((k, idx) => {
        const x = 14 + idx * 46.2;
        fillRect(x, 31, 43.4, 19, 248, 250, 252);
        strokeRect(x, 31, 43.4, 19, 226, 232, 240, 0.5);
        txt(k.t, x + 2.5, 35.8, 6.4, true, 100, 116, 139);
        txt(k.v, x + 2.5, 42.2, 9.5, true, 15, 23, 42);
        txt(k.sub, x + 2.5, 47.4, 6.5, false, 71, 85, 105);
      });

      // Section 1: Process Conditions & Materials
      let y = 58;
      txt('1. Process Conditions & Construction Materials', 14, y, 10, true, 15, 23, 42);
      y = drawTable(y + 3, ['Parameter', 'Value', 'Material / Integrity Spec', 'Factor / Detail'], [
        { cells: ['Evacuated Volume', state.volumeM3.toFixed(2) + ' m3 (' + (state.volumeM3*M3_FT3).toFixed(1) + ' ft3)', 'Vessel Material', s.vSpec.shortName + ' (' + s.vSpec.factor.toFixed(2) + 'x)'] },
        { cells: ['Operating Vacuum', state.pressureMbar.toFixed(2) + ' mbar (' + (state.pressureMbar*MBAR_TORR).toFixed(1) + ' Torr)', 'Gasket / Seal', s.gSpec.shortName + ' (' + s.gSpec.factor.toFixed(2) + 'x)'] },
        { cells: ['Suction Temp', state.suctionTempC.toFixed(1) + ' deg C', 'Integrity Class', s.iSpec.name + ' (' + s.iSpec.factor.toFixed(2) + 'x)'] },
        { cells: ['Suction Air Density', s.rho.toFixed(4) + ' kg/m3', 'Combined Factor', s.comb.toFixed(3) + 'x'] }
      ], [14, 52, 95, 138]);

      // Section 2: Model Comparison
      y += 7;
      txt('2. Industry-Standard Air Leakage Model Comparison', 14, y, 10, true, 15, 23, 42);
      y = drawTable(y + 3, ['Model', 'Base (kg/h)', 'Adj. (kg/h)', 'Adj. (lb/h)', 'Flow (m3/h)', 'Flow (ACFM)'],
        s.models.map(m => ({
          _highlight: m.id === state.primaryModel,
          cells: [
            m.name + (m.id === state.primaryModel ? ' [SEL]' : ''),
            m.base.toFixed(3),
            m.adj.toFixed(3),
            m.lb.toFixed(3),
            m.flow.toFixed(1),
            m.acfm.toFixed(1)
          ]
        })),
        [14, 72, 97, 122, 147, 172]
      );

      // Section 3: Auxiliary Sizing
      y += 7;
      txt('3. Vacuum System & Auxiliary Equipment Sizing Basis', 14, y, 10, true, 15, 23, 42);
      const vLabel = state.vaporSpecies === 'dry_air_only' ? 'Dry Air Only' : (VAPOR_SPECS[state.vaporSpecies].name + ' @ ' + state.condenserTempC + 'C');
      y = drawTable(y + 3, ['Sizing Parameter', 'Calculated Value', 'Engineering Context'], [
        { cells: ['Design Dry Air Load', s.dAir.toFixed(3) + ' kg/h (' + s.dLb.toFixed(3) + ' lb/h)', s.sel.name + ' x ' + state.designMargin.toFixed(2) + 'x margin'] },
        { cells: ['Vapor Carryover', s.vapCarry.toFixed(3) + ' kg/h (Pvap ' + s.pVap.toFixed(1) + ' mbar)', vLabel] },
        { cells: ['Total Suction Load', (s.dAir + s.vapCarry).toFixed(3) + ' kg/h | ' + s.totFlow.toFixed(1) + ' m3/h', (s.totFlow * M3H_ACFM).toFixed(1) + ' ACFM total load'] },
        { cells: ['Pump-Down Estimate', s.pDown.toFixed(0) + ' min (1013 -> ' + state.pressureMbar + ' mbar)', 'Recommended: ' + s.tech] }
      ], [14, 58, 122]);

      // Section 4: Component Inventory
      y += 7;
      txt('4. Component & Seal Inventory Leakage Breakdown', 14, y, 10, true, 15, 23, 42);
      y = drawTable(y + 3, ['Component / Seal Type', 'Qty', 'Total (kg/h)', 'Share (%)'],
        s.invRows.map(r => ({
          cells: [r.label, String(r.count), r.totalKgH.toFixed(4), r.share.toFixed(1) + '%']
        })),
        [14, 105, 130, 165]
      );

      txt('Basis: Orifice air leakage is sonic-choked below 535.3 mbar (Phi = 1.0). Suction volume uses Ideal Gas Law at suction P and T.', 14, y + 7, 7.2, false, 100, 116, 139);
      txt('Vacuum Distillation Sizing Report (Offline Export)  |  Page 1 of 1', 64, 286, 7.5, false, 148, 163, 184);

      const stream = cmds.join('\\n');
      const objs = [
        '1 0 obj\\n<< /Type /Catalog /Pages 2 0 R >>\\nendobj\\n',
        '2 0 obj\\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\\nendobj\\n',
        '3 0 obj\\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>\\nendobj\\n',
        '4 0 obj\\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\\nendobj\\n',
        '5 0 obj\\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>\\nendobj\\n',
        '6 0 obj\\n<< /Length ' + stream.length + ' >>\\nstream\\n' + stream + '\\nendstream\\nendobj\\n'
      ];
      let pdf = '%PDF-1.4\\n';
      const offsets = [0];
      objs.forEach(o => {
        offsets.push(pdf.length);
        pdf += o;
      });
      const xrefPos = pdf.length;
      pdf += 'xref\\n0 ' + (objs.length + 1) + '\\n0000000000 65535 f \\n';
      for (let i = 1; i < offsets.length; i++) {
        pdf += String(offsets[i]).padStart(10, '0') + ' 00000 n \\n';
      }
      pdf += 'trailer\\n<< /Size ' + (objs.length + 1) + ' /Root 1 0 R >>\\nstartxref\\n' + xrefPos + '\\n%%EOF';
      return pdf;
    }

    // Event bindings
    el('sel-preset').addEventListener('change', (e) => {
      const id = e.target.value;
      const p = PRESETS.find(x => x.id === id);
      if (p) {
        state = { ...state, ...p.inputs, presetId: p.id };
        populatePresetDropdown(); render(); return;
      }
      const sp = savedPresets.find(x => x.id === id);
      if (sp) {
        state = { ...sp.inputs, componentCounts: { ...sp.inputs.componentCounts }, presetId: sp.id };
        populatePresetDropdown(); render();
      }
    });
    el('btn-save-preset').addEventListener('click', () => {
      const cur = savedPresets.find(x => x.id === state.presetId);
      el('inp-preset-name').value = cur ? cur.name : '';
      el('preset-form').classList.remove('hidden');
      el('inp-preset-name').focus();
    });
    el('btn-cancel-preset').addEventListener('click', () => { el('preset-form').classList.add('hidden'); });
    el('btn-confirm-preset').addEventListener('click', () => {
      const name = el('inp-preset-name').value.trim().slice(0, 60);
      if (!name) return;
      const idx = savedPresets.findIndex(p => p.name.toLowerCase() === name.toLowerCase());
      const id = idx >= 0 ? savedPresets[idx].id : ('user_' + Date.now());
      const entry = { id, name, savedAt: new Date().toISOString(), inputs: { ...state, presetId: id, componentCounts: { ...state.componentCounts } } };
      if (idx >= 0) savedPresets[idx] = entry; else savedPresets.unshift(entry);
      try { if (window.localStorage) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(savedPresets)); } catch (err) {}
      state.presetId = id;
      el('preset-form').classList.add('hidden');
      populatePresetDropdown(); render();
    });
    el('btn-del-preset').addEventListener('click', () => {
      savedPresets = savedPresets.filter(p => p.id !== state.presetId);
      try { if (window.localStorage) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(savedPresets)); } catch (err) {}
      state.presetId = 'custom';
      populatePresetDropdown(); render();
    });
    el('btn-reset').addEventListener('click', () => { state = ${safeStateJson}; populatePresetDropdown(); render(); });
    el('tab-direct').addEventListener('click', () => {
      el('tab-direct').classList.add('active'); el('tab-geom').classList.remove('active');
      el('panel-direct').classList.remove('hidden'); el('panel-geom').classList.add('hidden');
    });
    el('tab-geom').addEventListener('click', () => {
      el('tab-geom').classList.add('active'); el('tab-direct').classList.remove('active');
      el('panel-geom').classList.remove('hidden'); el('panel-direct').classList.add('hidden');
      updateGeom();
    });
    function updateGeom() {
      const d = Math.max(0.1, Number(el('inp-diam').value) || 0.1);
      const h = Math.max(0.2, Number(el('inp-height').value) || 0.2);
      const a = Math.max(0, Number(el('inp-allow').value) || 0);
      const v = Number((Math.PI * Math.pow(d / 2, 2) * h * (1 + a / 100)).toFixed(2));
      state.volumeM3 = Math.max(0.05, v);
      state.presetId = 'custom';
      el('lbl-geom-vol').textContent = state.volumeM3.toFixed(2) + ' m³ (' + (state.volumeM3 * M3_FT3).toFixed(1) + ' ft³)';
      populatePresetDropdown(); render();
    }
    ['inp-diam', 'inp-height', 'inp-allow'].forEach(id => el(id).addEventListener('input', updateGeom));
    el('inp-volume').addEventListener('input', (e) => {
      state.volumeM3 = Math.max(0.05, Math.min(2000, Number(e.target.value) || 0.05));
      state.presetId = 'custom'; populatePresetDropdown(); render();
    });
    el('rng-volume').addEventListener('input', (e) => {
      const v = fromLog(Number(e.target.value), 0.05, 500);
      state.volumeM3 = v < 1 ? Number(v.toFixed(2)) : v < 20 ? Number(v.toFixed(1)) : Math.round(v);
      state.presetId = 'custom'; populatePresetDropdown(); render();
    });
    el('inp-pressure').addEventListener('input', (e) => {
      state.pressureMbar = Math.max(0.1, Math.min(980, Number(e.target.value) || 0.1));
      state.presetId = 'custom'; populatePresetDropdown(); render();
    });
    el('rng-pressure').addEventListener('input', (e) => {
      const p = fromLog(Number(e.target.value), 0.2, 950);
      state.pressureMbar = p < 5 ? Number(p.toFixed(2)) : p < 50 ? Number(p.toFixed(1)) : Math.round(p);
      state.presetId = 'custom'; populatePresetDropdown(); render();
    });
    el('inp-temp').addEventListener('input', (e) => { state.suctionTempC = Math.max(-20, Math.min(150, Number(e.target.value) || 20)); render(); });
    el('sel-vessel').addEventListener('change', (e) => { state.vesselMaterial = e.target.value; state.presetId = 'custom'; populatePresetDropdown(); render(); });
    el('sel-gasket').addEventListener('change', (e) => { state.gasketMaterial = e.target.value; state.presetId = 'custom'; populatePresetDropdown(); render(); });
    document.querySelectorAll('[data-integrity]').forEach(btn => {
      btn.addEventListener('click', () => { state.integrityClass = btn.getAttribute('data-integrity'); state.presetId = 'custom'; populatePresetDropdown(); render(); });
    });
    el('btn-toggle-comp').addEventListener('click', () => { el('panel-comp').classList.toggle('hidden'); render(); });
    el('btn-autoscale').addEventListener('click', () => {
      const v = Math.max(0.05, state.volumeM3), sc = Math.pow(v, 0.45);
      state.componentCounts = {
        flanges: Math.max(6, Math.round(14 * sc)),
        manways: v < 1.5 ? 0 : Math.max(1, Math.round(1.2 * Math.pow(v, 0.35))),
        packedValves: Math.max(2, Math.round(3.5 * sc)),
        bellowsValves: Math.max(2, Math.round(2.5 * sc)),
        mechSeals: v < 1 ? 1 : Math.max(1, Math.round(0.9 * Math.pow(v, 0.3))),
        stuffingBoxes: 0,
        threadedFittings: Math.max(2, Math.round(2.5 * sc))
      };
      state.presetId = 'custom'; populatePresetDropdown(); render();
    });
    document.querySelectorAll('[data-comp]').forEach(inp => {
      inp.addEventListener('input', (e) => {
        state.componentCounts[inp.getAttribute('data-comp')] = Math.max(0, Math.round(Number(e.target.value) || 0));
        state.presetId = 'custom'; populatePresetDropdown(); render();
      });
    });
    el('btn-mode-mass').addEventListener('click', () => { chartMode = 'mass'; el('btn-mode-mass').classList.add('active'); el('btn-mode-vol').classList.remove('active'); render(); });
    el('btn-mode-vol').addEventListener('click', () => { chartMode = 'volumetric'; el('btn-mode-vol').classList.add('active'); el('btn-mode-mass').classList.remove('active'); render(); });
    el('sel-margin').addEventListener('change', (e) => { state.designMargin = Number(e.target.value); render(); });
    el('sel-vapor').addEventListener('change', (e) => { state.vaporSpecies = e.target.value; render(); });
    el('inp-cond-temp').addEventListener('input', (e) => { state.condenserTempC = Math.max(-30, Math.min(80, Number(e.target.value) || 0)); render(); });

    el('leak-chart').addEventListener('mousemove', (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const svgX = (e.clientX - rect.left) * (760 / rect.width);
      if (svgX < 66 || svgX > 736 || lastSamples.length === 0) { hoverIdx = null; }
      else { hoverIdx = Math.min(lastSamples.length - 1, Math.max(0, Math.round(((svgX - 66) / 670) * (lastSamples.length - 1)))); }
      renderChart(computeAll());
    });
    el('leak-chart').addEventListener('mouseleave', () => { hoverIdx = null; renderChart(computeAll()); });
    el('leak-chart').addEventListener('click', () => {
      if (hoverIdx !== null && lastSamples[hoverIdx]) {
        const p = lastSamples[hoverIdx].p;
        state.pressureMbar = Number(p.toFixed(p < 10 ? 2 : 1));
        state.presetId = 'custom'; populatePresetDropdown(); render();
      }
    });

    el('btn-export-pdf').addEventListener('click', () => {
      const s = computeAll();
      const pdfStr = buildOfflinePdfBytes(s);
      const bytes = new Uint8Array(pdfStr.length);
      for (let i = 0; i < pdfStr.length; i++) bytes[i] = pdfStr.charCodeAt(i) & 0xff;
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'vacuum-leakage-report-' + state.volumeM3 + 'm3-' + state.pressureMbar + 'mbar.pdf';
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });

    el('btn-print').addEventListener('click', () => { window.print(); });

    el('btn-export-csv').addEventListener('click', () => {
      const s = computeAll();
      const lines = [
        'Vacuum Distillation Air Leakage & Equipment Sizing Report',
        'Volume (m3),' + state.volumeM3,
        'Pressure (mbar abs),' + state.pressureMbar,
        'Vessel Material,"' + s.vSpec.name + '"',
        'Gasket Material,"' + s.gSpec.name + '"',
        'Integrity Class,"' + s.iSpec.name + '"',
        'Design Margin,' + state.designMargin,
        '',
        'Model,Base Air (kg/h),Adjusted (kg/h),Adjusted (lb/h),Suction Flow (m3/h),Suction Flow (ACFM)',
        ...s.models.map(m => '"' + m.name + '",' + m.base.toFixed(4) + ',' + m.adj.toFixed(4) + ',' + m.lb.toFixed(4) + ',' + m.flow.toFixed(2) + ',' + m.acfm.toFixed(2)),
        '',
        'Design Dry Air (kg/h),' + s.dAir.toFixed(3),
        'Vapor Carryover (kg/h),' + s.vapCarry.toFixed(3),
        'Total Suction Flow Required (m3/h),' + s.totFlow.toFixed(2),
        'Recommended Vacuum Train,"' + s.tech + '"'
      ].join('\\n');
      const blob = new Blob([lines], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'vacuum_air_leakage_sizing_' + state.volumeM3 + 'm3_' + state.pressureMbar + 'mbar.csv';
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });

    render();
  })();
  </script>
</body>
</html>`;
}
