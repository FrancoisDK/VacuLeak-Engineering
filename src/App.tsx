import React, { useMemo, useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Download,
  RotateCcw,
} from 'lucide-react';
import {
  ComponentCounts,
  GASKET_MATERIALS,
  GasketMaterialId,
  INTEGRITY_CLASSES,
  IntegrityClassId,
  M3_TO_FT3,
  MBAR_TO_TORR,
  SizingMethodId,
  SYSTEM_PRESETS,
  SystemInputs,
  VESSEL_MATERIALS,
  VaporSpeciesId,
  VesselMaterialId,
  calculateVacuumLeakage,
  estimateDefaultComponents,
  generateCsvReport,
} from './utils/vacuumLeakage';
import { LeakageCurveChart } from './components/LeakageCurveChart';
import { EquipmentSizingPanel } from './components/EquipmentSizingPanel';
import { StandardsReference } from './components/StandardsReference';

const DEFAULT_INPUTS: SystemInputs = {
  presetId: 'fine_chem',
  volumeM3: 14,
  pressureMbar: 15,
  suctionTempC: 35,
  vesselMaterial: 'stainless_steel',
  gasketMaterial: 'spiral_wound',
  integrityClass: 'tight',
  primaryModel: 'hei',
  designMargin: 1.5,
  componentCounts: {
    flanges: 36,
    manways: 3,
    packedValves: 6,
    bellowsValves: 8,
    mechSeals: 2,
    stuffingBoxes: 0,
    threadedFittings: 6,
  },
  vaporSpecies: 'water',
  condenserTempC: 25,
};

const MIN_VOL = 0.05;
const MAX_VOL = 500;
const MIN_P = 0.2;
const MAX_P = 950;

function toLogSlider(value: number, min: number, max: number): number {
  const clamped = Math.max(min, Math.min(max, value));
  return (
    ((Math.log10(clamped) - Math.log10(min)) /
      (Math.log10(max) - Math.log10(min))) *
    1000
  );
}

function fromLogSlider(pos: number, min: number, max: number): number {
  const ratio = Math.max(0, Math.min(1, pos / 1000));
  return Math.pow(
    10,
    Math.log10(min) + ratio * (Math.log10(max) - Math.log10(min))
  );
}

export default function App() {
  const [inputs, setInputs] = useState<SystemInputs>(DEFAULT_INPUTS);
  const [sizeMode, setSizeMode] = useState<'direct' | 'geometry'>('direct');
  const [colDiameterM, setColDiameterM] = useState<number>(1.2);
  const [colHeightM, setColHeightM] = useState<number>(9.5);
  const [pipingAllowancePct, setPipingAllowancePct] = useState<number>(30);
  const [showComponents, setShowComponents] = useState<boolean>(false);

  const summary = useMemo(() => calculateVacuumLeakage(inputs), [inputs]);

  const activeVessel = useMemo(
    () => VESSEL_MATERIALS.find((m) => m.id === inputs.vesselMaterial)!,
    [inputs.vesselMaterial]
  );
  const activeGasket = useMemo(
    () => GASKET_MATERIALS.find((g) => g.id === inputs.gasketMaterial)!,
    [inputs.gasketMaterial]
  );

  const applyVolumeFromGeometry = (
    diam: number,
    height: number,
    allowancePct: number
  ) => {
    const vesselVol = Math.PI * Math.pow(diam / 2, 2) * height;
    const totalVol = Number(
      Math.max(MIN_VOL, vesselVol * (1 + allowancePct / 100)).toFixed(2)
    );
    setInputs((prev) => ({
      ...prev,
      presetId: 'custom',
      volumeM3: totalVol,
    }));
  };

  const handleSelectPreset = (presetId: string) => {
    const preset = SYSTEM_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setSizeMode('direct');
    setInputs((prev) => ({
      ...prev,
      ...preset.inputs,
      presetId,
    }));
  };

  const handleReset = () => {
    setSizeMode('direct');
    setColDiameterM(1.2);
    setColHeightM(9.5);
    setPipingAllowancePct(30);
    setInputs(DEFAULT_INPUTS);
  };

  const handleExportCsv = () => {
    const csv = generateCsvReport(inputs, summary);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vaculeak_sizing_${inputs.volumeM3}m3_${inputs.pressureMbar}mbar.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const updateComponentCount = (key: keyof ComponentCounts, val: number) => {
    setInputs((prev) => ({
      ...prev,
      presetId: 'custom',
      componentCounts: {
        ...prev.componentCounts,
        [key]: Math.max(0, Math.round(val)),
      },
    }));
  };

  const componentFields: { key: keyof ComponentCounts; label: string }[] = [
    { key: 'flanges', label: 'Standard Flanged Joints' },
    { key: 'manways', label: 'Manways & Sight Glasses' },
    { key: 'packedValves', label: 'Packed Stem Valves' },
    { key: 'bellowsValves', label: 'Bellows / Diaphragm Valves' },
    { key: 'mechSeals', label: 'Mechanical Shaft Seals' },
    { key: 'stuffingBoxes', label: 'Packed Stuffing Boxes' },
    { key: 'threadedFittings', label: 'Threaded / Instrument Joints' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Three-Zone Top Bar Contract */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-8">
          {/* Zone 1: Single-element Brand Wordmark */}
          <a
            href="#estimator"
            className="text-base font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
          >
            VacuLeak Engineering
          </a>

          {/* Zone 2: 4 concise single-line nav links */}
          <nav
            aria-label="Primary sections"
            className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600"
          >
            <a
              href="#estimator"
              className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Estimator
            </a>
            <a
              href="#model-comparison"
              className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Model Curves
            </a>
            <a
              href="#equipment-sizing"
              className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Equipment Sizing
            </a>
            <a
              href="#standards-equations"
              className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Standards
            </a>
          </nav>

          {/* Zone 3: 1 primary CTA */}
          <div className="shrink-0">
            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-sky-700 hover:bg-sky-800 rounded-md transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
            >
              <Download className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Export Sizing Sheet</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Asymmetric Split Console */}
      <main
        id="estimator"
        className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-6"
      >
        {/* Page Title & Context */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 text-balance">
              Vacuum Distillation Air Leakage Estimator
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              Estimate air in-leakage rates and required suction capacity from system volume, operating vacuum (mbar), and construction materials.
            </p>
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-2 shrink-0">
            <span>HEI Standards</span>
            <span aria-hidden="true">·</span>
            <span>Seider–Seader–Lewin</span>
            <span aria-hidden="true">·</span>
            <span>Ryans &amp; Roper</span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row items-start gap-6">
          {/* Left Parameter & Control Column */}
          <aside className="w-full lg:w-[370px] shrink-0 bg-white border border-slate-200 rounded-lg divide-y divide-slate-200">
            {/* 1. System Presets */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="preset-select"
                  className="text-xs font-semibold uppercase tracking-wider text-slate-600"
                >
                  System Configuration Preset
                </label>
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" aria-hidden="true" />
                  <span>Reset</span>
                </button>
              </div>
              <select
                id="preset-select"
                value={inputs.presetId}
                onChange={(e) => handleSelectPreset(e.target.value)}
                className="w-full h-9 px-2.5 text-xs bg-slate-50 border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:border-sky-600"
              >
                {SYSTEM_PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
                {inputs.presetId === 'custom' && (
                  <option value="custom">Custom Engineering Parameters</option>
                )}
              </select>
            </div>

            {/* 2. System Size / Volume */}
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                  System Size (Volume)
                </span>
                <div className="inline-flex p-0.5 bg-slate-100 rounded-md text-[11px]">
                  <button
                    type="button"
                    onClick={() => setSizeMode('direct')}
                    className={`px-2 py-1 rounded font-medium transition-colors whitespace-nowrap ${
                      sizeMode === 'direct'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Direct m³
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSizeMode('geometry');
                      applyVolumeFromGeometry(
                        colDiameterM,
                        colHeightM,
                        pipingAllowancePct
                      );
                    }}
                    className={`px-2 py-1 rounded font-medium transition-colors whitespace-nowrap ${
                      sizeMode === 'geometry'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Column D×H
                  </button>
                </div>
              </div>

              {sizeMode === 'direct' ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <label
                      htmlFor="volume-input"
                      className="text-xs text-slate-600"
                    >
                      Evacuated Volume
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        id="volume-input"
                        type="number"
                        min={MIN_VOL}
                        max={2000}
                        step="any"
                        value={inputs.volumeM3}
                        onChange={(e) => {
                          const v = Math.max(
                            MIN_VOL,
                            Math.min(2000, Number(e.target.value) || MIN_VOL)
                          );
                          setInputs((prev) => ({
                            ...prev,
                            presetId: 'custom',
                            volumeM3: v,
                          }));
                        }}
                        className="w-24 h-8 px-2 text-right text-xs font-mono tabular-nums bg-slate-50 border border-slate-300 rounded focus:outline-none focus:border-sky-600"
                      />
                      <span className="text-xs font-mono text-slate-500">
                        m³
                      </span>
                    </div>
                  </div>

                  <input
                    type="range"
                    min={0}
                    max={1000}
                    value={toLogSlider(inputs.volumeM3, MIN_VOL, MAX_VOL)}
                    onChange={(e) => {
                      const val = fromLogSlider(
                        Number(e.target.value),
                        MIN_VOL,
                        MAX_VOL
                      );
                      const rounded =
                        val < 1
                          ? Number(val.toFixed(2))
                          : val < 20
                          ? Number(val.toFixed(1))
                          : Math.round(val);
                      setInputs((prev) => ({
                        ...prev,
                        presetId: 'custom',
                        volumeM3: rounded,
                      }));
                    }}
                    aria-label="System volume logarithmic slider"
                    className="w-full"
                  />

                  <div className="flex items-center justify-between text-[11px] font-mono tabular-nums text-slate-500">
                    <span>0.05 m³</span>
                    <span>
                      {(inputs.volumeM3 * M3_TO_FT3).toFixed(1)} ft³
                    </span>
                    <span>500 m³</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label
                        htmlFor="col-diam"
                        className="block text-[11px] text-slate-600 mb-1"
                      >
                        Diam (m)
                      </label>
                      <input
                        id="col-diam"
                        type="number"
                        min={0.1}
                        max={12}
                        step={0.1}
                        value={colDiameterM}
                        onChange={(e) => {
                          const d = Math.max(0.1, Number(e.target.value) || 0.1);
                          setColDiameterM(d);
                          applyVolumeFromGeometry(
                            d,
                            colHeightM,
                            pipingAllowancePct
                          );
                        }}
                        className="w-full h-8 px-2 text-xs font-mono tabular-nums bg-slate-50 border border-slate-300 rounded focus:outline-none focus:border-sky-600"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="col-height"
                        className="block text-[11px] text-slate-600 mb-1"
                      >
                        Height (m)
                      </label>
                      <input
                        id="col-height"
                        type="number"
                        min={0.2}
                        max={60}
                        step={0.5}
                        value={colHeightM}
                        onChange={(e) => {
                          const h = Math.max(0.2, Number(e.target.value) || 0.2);
                          setColHeightM(h);
                          applyVolumeFromGeometry(
                            colDiameterM,
                            h,
                            pipingAllowancePct
                          );
                        }}
                        className="w-full h-8 px-2 text-xs font-mono tabular-nums bg-slate-50 border border-slate-300 rounded focus:outline-none focus:border-sky-600"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="piping-pct"
                        className="block text-[11px] text-slate-600 mb-1"
                      >
                        Piping +(%)
                      </label>
                      <input
                        id="piping-pct"
                        type="number"
                        min={0}
                        max={200}
                        step={5}
                        value={pipingAllowancePct}
                        onChange={(e) => {
                          const pct = Math.max(0, Number(e.target.value) || 0);
                          setPipingAllowancePct(pct);
                          applyVolumeFromGeometry(
                            colDiameterM,
                            colHeightM,
                            pct
                          );
                        }}
                        className="w-full h-8 px-2 text-xs font-mono tabular-nums bg-slate-50 border border-slate-300 rounded focus:outline-none focus:border-sky-600"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs font-mono tabular-nums">
                    <span className="text-slate-600">Computed Total Vol:</span>
                    <span className="font-semibold text-slate-900">
                      {inputs.volumeM3.toFixed(2)} m³ ({summary.volumeFt3.toFixed(1)} ft³)
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Vacuum Pressure & Suction Temperature */}
            <div className="p-4 space-y-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                Vacuum Level &amp; Suction Conditions
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <label
                    htmlFor="pressure-input"
                    className="text-xs text-slate-600"
                  >
                    Operating Pressure
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      id="pressure-input"
                      type="number"
                      min={0.1}
                      max={980}
                      step="any"
                      value={inputs.pressureMbar}
                      onChange={(e) => {
                        const p = Math.max(
                          0.1,
                          Math.min(980, Number(e.target.value) || 0.1)
                        );
                        setInputs((prev) => ({
                          ...prev,
                          presetId: 'custom',
                          pressureMbar: p,
                        }));
                      }}
                      className="w-24 h-8 px-2 text-right text-xs font-mono tabular-nums bg-slate-50 border border-slate-300 rounded focus:outline-none focus:border-sky-600"
                    />
                    <span className="text-xs font-mono text-slate-500">
                      mbar
                    </span>
                  </div>
                </div>

                <input
                  type="range"
                  min={0}
                  max={1000}
                  value={toLogSlider(inputs.pressureMbar, MIN_P, MAX_P)}
                  onChange={(e) => {
                    const val = fromLogSlider(
                      Number(e.target.value),
                      MIN_P,
                      MAX_P
                    );
                    const rounded =
                      val < 5
                        ? Number(val.toFixed(2))
                        : val < 50
                        ? Number(val.toFixed(1))
                        : Math.round(val);
                    setInputs((prev) => ({
                      ...prev,
                      presetId: 'custom',
                      pressureMbar: rounded,
                    }));
                  }}
                  aria-label="Operating vacuum pressure logarithmic slider"
                  className="w-full"
                />

                <div className="flex items-center justify-between text-[11px] font-mono tabular-nums text-slate-500">
                  <span>0.2 mbar</span>
                  <span>
                    {(inputs.pressureMbar * MBAR_TO_TORR).toFixed(1)} Torr ·{' '}
                    {(inputs.pressureMbar * 0.1).toFixed(2)} kPa
                  </span>
                  <span>950 mbar</span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-1">
                <label
                  htmlFor="suction-temp"
                  className="text-xs text-slate-600"
                >
                  Suction Gas Temp
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    id="suction-temp"
                    type="number"
                    min={-20}
                    max={150}
                    step={1}
                    value={inputs.suctionTempC}
                    onChange={(e) =>
                      setInputs((prev) => ({
                        ...prev,
                        suctionTempC: Math.max(
                          -20,
                          Math.min(150, Number(e.target.value) || 20)
                        ),
                      }))
                    }
                    className="w-24 h-8 px-2 text-right text-xs font-mono tabular-nums bg-slate-50 border border-slate-300 rounded focus:outline-none focus:border-sky-600"
                  />
                  <span className="text-xs font-mono text-slate-500">°C</span>
                </div>
              </div>
            </div>

            {/* 4. Material Type & Seal Integrity */}
            <div className="p-4 space-y-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                Material Type &amp; Sealing Class
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label
                    htmlFor="vessel-material"
                    className="text-xs text-slate-700 font-medium"
                  >
                    Vessel &amp; Piping Material
                  </label>
                  <span className="text-[11px] font-mono tabular-nums text-slate-500">
                    {activeVessel.factor.toFixed(2)}×
                  </span>
                </div>
                <select
                  id="vessel-material"
                  value={inputs.vesselMaterial}
                  onChange={(e) =>
                    setInputs((prev) => ({
                      ...prev,
                      presetId: 'custom',
                      vesselMaterial: e.target.value as VesselMaterialId,
                    }))
                  }
                  className="w-full h-9 px-2.5 text-xs bg-slate-50 border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:border-sky-600"
                >
                  {VESSEL_MATERIALS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.factor.toFixed(2)}×)
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                  {activeVessel.notes}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label
                    htmlFor="gasket-material"
                    className="text-xs text-slate-700 font-medium"
                  >
                    Gasket / Flange Seal Material
                  </label>
                  <span className="text-[11px] font-mono tabular-nums text-slate-500">
                    {activeGasket.factor.toFixed(2)}×
                  </span>
                </div>
                <select
                  id="gasket-material"
                  value={inputs.gasketMaterial}
                  onChange={(e) =>
                    setInputs((prev) => ({
                      ...prev,
                      presetId: 'custom',
                      gasketMaterial: e.target.value as GasketMaterialId,
                    }))
                  }
                  className="w-full h-9 px-2.5 text-xs bg-slate-50 border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:border-sky-600"
                >
                  {GASKET_MATERIALS.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} ({g.factor.toFixed(2)}×)
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                  {activeGasket.notes}
                </p>
              </div>

              <div>
                <span className="block text-xs text-slate-700 font-medium mb-1.5">
                  Plant Mechanical Integrity
                </span>
                <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-md">
                  {INTEGRITY_CLASSES.map((cls) => (
                    <button
                      key={cls.id}
                      type="button"
                      onClick={() =>
                        setInputs((prev) => ({
                          ...prev,
                          presetId: 'custom',
                          integrityClass: cls.id as IntegrityClassId,
                        }))
                      }
                      className={`py-1.5 px-2 text-[11px] font-medium rounded transition-colors whitespace-nowrap ${
                        inputs.integrityClass === cls.id
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {cls.id === 'tight'
                        ? 'Tight 1.0×'
                        : cls.id === 'standard'
                        ? 'Std 1.35×'
                        : 'Aged 1.9×'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 5. Collapsible Component & Fitting Inventory */}
            <div className="p-4">
              <button
                type="button"
                onClick={() => setShowComponents((s) => !s)}
                aria-expanded={showComponents}
                className="w-full flex items-center justify-between text-left"
              >
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Fitting &amp; Seal Inventory
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-mono text-slate-500">
                  <span>
                    {Object.values(inputs.componentCounts).reduce(
                      (a, b) => a + b,
                      0
                    )}{' '}
                    joints
                  </span>
                  {showComponents ? (
                    <ChevronDown className="w-4 h-4" aria-hidden="true" />
                  ) : (
                    <ChevronRight className="w-4 h-4" aria-hidden="true" />
                  )}
                </span>
              </button>

              {showComponents && (
                <div className="mt-3 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">
                      Used by Component Inventory model
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setInputs((prev) => ({
                          ...prev,
                          presetId: 'custom',
                          componentCounts: estimateDefaultComponents(
                            prev.volumeM3
                          ),
                        }))
                      }
                      className="text-[11px] font-medium text-sky-700 hover:text-sky-800 hover:underline"
                    >
                      Auto-scale from V
                    </button>
                  </div>

                  {componentFields.map((field) => (
                    <div
                      key={field.key}
                      className="flex items-center justify-between gap-2"
                    >
                      <label
                        htmlFor={`comp-${field.key}`}
                        className="text-xs text-slate-700"
                      >
                        {field.label}
                      </label>
                      <input
                        id={`comp-${field.key}`}
                        type="number"
                        min={0}
                        max={500}
                        step={1}
                        value={inputs.componentCounts[field.key]}
                        onChange={(e) =>
                          updateComponentCount(
                            field.key,
                            Number(e.target.value) || 0
                          )
                        }
                        className="w-20 h-7 px-2 text-right text-xs font-mono tabular-nums bg-slate-50 border border-slate-300 rounded focus:outline-none focus:border-sky-600"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>

          {/* Main Viewport Stage */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* 4-Column Telemetry KPI Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 rounded-lg p-4">
                <div className="text-[11px] uppercase tracking-wider text-slate-500">
                  Design Air In-Leakage
                </div>
                <div className="mt-1.5 flex items-baseline">
                  <span className="text-2xl font-mono font-semibold tabular-nums text-slate-900">
                    {summary.designAirKgH.toFixed(2)}
                  </span>
                  <span className="text-xs uppercase font-mono text-slate-500 ml-1.5">
                    kg/h
                  </span>
                </div>
                <div className="mt-1 text-xs font-mono tabular-nums text-slate-500">
                  {summary.designAirLbH.toFixed(2)} lb/h · {inputs.designMargin.toFixed(2)}× margin
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-lg p-4">
                <div className="text-[11px] uppercase tracking-wider text-slate-500">
                  Total Suction Capacity
                </div>
                <div className="mt-1.5 flex items-baseline">
                  <span className="text-2xl font-mono font-semibold tabular-nums text-sky-700">
                    {summary.vaporCarryover.totalActualFlowM3H.toFixed(1)}
                  </span>
                  <span className="text-xs uppercase font-mono text-slate-500 ml-1.5">
                    m³/h
                  </span>
                </div>
                <div className="mt-1 text-xs font-mono tabular-nums text-slate-500">
                  {(summary.vaporCarryover.totalActualFlowM3H * 0.58858).toFixed(1)} ACFM · incl. vapor
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-lg p-4">
                <div className="text-[11px] uppercase tracking-wider text-slate-500">
                  Leakage Flow Regime
                </div>
                <div className="mt-1.5 text-sm font-semibold">
                  {summary.isSonicChoked ? (
                    <span className="text-sky-700">● Sonic Choked Orifice</span>
                  ) : (
                    <span className="text-amber-700">▲ Subsonic Compressible</span>
                  )}
                </div>
                <div className="mt-2 text-xs font-mono tabular-nums text-slate-500">
                  ρ_air = {summary.airDensityKgM3.toFixed(4)} kg/m³ · Φ = {summary.orificeFlowFactor.toFixed(2)}
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-lg p-4">
                <div className="text-[11px] uppercase tracking-wider text-slate-500">
                  Recommended Vacuum Train
                </div>
                <div className="mt-1.5 text-sm font-semibold text-slate-900 truncate" title={summary.recommendedTrain.stages}>
                  {summary.recommendedTrain.stages}
                </div>
                <div className="mt-2 text-xs font-mono tabular-nums text-slate-500">
                  Est. {summary.recommendedTrain.estimatedPowerKw.toFixed(1)} kW shaft · {summary.combinedMultiplier.toFixed(2)}× mat
                </div>
              </div>
            </div>

            {/* Multi-Model Leakage Curves */}
            <LeakageCurveChart
              inputs={inputs}
              summary={summary}
              onSelectPressure={(p) =>
                setInputs((prev) => ({
                  ...prev,
                  presetId: 'custom',
                  pressureMbar: p,
                }))
              }
            />

            {/* Model Comparison & Selection Table */}
            <section className="bg-white border border-slate-200 rounded-lg overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">
                    Industry Model Comparison
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Select any row to set the active primary sizing basis for auxiliary equipment calculations
                  </p>
                </div>
                <div className="text-xs font-mono tabular-nums text-slate-500">
                  Combined Factor: {summary.combinedMultiplier.toFixed(2)}× (Vessel × Gasket × Integrity)
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                    <tr>
                      <th className="py-2.5 px-4 font-medium">Sizing Basis</th>
                      <th className="py-2.5 px-3 font-medium text-right">
                        Base Air (kg/h)
                      </th>
                      <th className="py-2.5 px-3 font-medium text-right">
                        Adjusted (kg/h)
                      </th>
                      <th className="py-2.5 px-3 font-medium text-right">
                        Adjusted (lb/h)
                      </th>
                      <th className="py-2.5 px-3 font-medium text-right">
                        Suction (m³/h)
                      </th>
                      <th className="py-2.5 px-3 font-medium text-right">
                        Suction (ACFM)
                      </th>
                      <th className="py-2.5 px-4 font-medium hidden xl:table-cell">
                        Engineering Notes
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {summary.models.map((model) => {
                      const isSelected = model.id === inputs.primaryModel;
                      return (
                        <tr
                          key={model.id}
                          onClick={() =>
                            setInputs((prev) => ({
                              ...prev,
                              primaryModel: model.id as SizingMethodId,
                            }))
                          }
                          className={`cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-sky-50/70'
                              : 'hover:bg-slate-50'
                          }`}
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <input
                                type="radio"
                                name="primary-sizing-model"
                                checked={isSelected}
                                onChange={() =>
                                  setInputs((prev) => ({
                                    ...prev,
                                    primaryModel: model.id as SizingMethodId,
                                  }))
                                }
                                aria-label={`Select ${model.name} as primary sizing basis`}
                                className="accent-sky-700"
                              />
                              <div>
                                <div className="font-semibold text-slate-900 whitespace-nowrap">
                                  {model.name}
                                </div>
                                <div className="text-[11px] text-slate-500 whitespace-nowrap">
                                  {model.reference}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-600">
                            {model.baseAirKgH.toFixed(3)}
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-semibold tabular-nums text-slate-900">
                            {model.adjustedAirKgH.toFixed(3)}
                          </td>
                          <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700">
                            {model.adjustedAirLbH.toFixed(3)}
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-semibold tabular-nums text-sky-700">
                            {model.actualFlowM3H.toFixed(1)}
                          </td>
                          <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-600">
                            {model.actualFlowACFM.toFixed(1)}
                          </td>
                          <td className="py-3 px-4 text-slate-600 hidden xl:table-cell max-w-xs">
                            {model.applicabilityNote}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Auxiliary Equipment Sizing & Component Breakdown */}
            <EquipmentSizingPanel
              inputs={inputs}
              summary={summary}
              onChangeVaporSpecies={(vaporSpecies: VaporSpeciesId) =>
                setInputs((prev) => ({ ...prev, vaporSpecies }))
              }
              onChangeCondenserTemp={(condenserTempC: number) =>
                setInputs((prev) => ({ ...prev, condenserTempC }))
              }
              onChangeDesignMargin={(designMargin: number) =>
                setInputs((prev) => ({ ...prev, designMargin }))
              }
            />

            {/* Industry Standards, Equations & Material Multipliers */}
            <StandardsReference />
          </div>
        </div>
      </main>

      <footer className="mt-10 border-t border-slate-200 bg-white">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <span>
            VacuLeak Engineering · Vacuum Distillation Air In-Leakage &amp; Equipment Sizing
          </span>
          <span>
            Correlations: HEI Steam Jet Standards · Seider–Seader–Lewin · Ryans &amp; Roper · Perry&apos;s Ch. 10
          </span>
        </div>
      </footer>
    </div>
  );
}
