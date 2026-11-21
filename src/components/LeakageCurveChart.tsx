import React, { useMemo, useState } from 'react';
import {
  SystemInputs,
  EstimationSummary,
  VESSEL_MATERIALS,
  GASKET_MATERIALS,
  INTEGRITY_CLASSES,
  P_CRIT_MBAR,
  R_AIR_SPECIFIC,
  calcHEIAirLeakageKgH,
  calcSeiderSeaderLewinKgH,
  calcRyansRoperKgH,
  calcComponentInventoryBreakdown,
} from '../utils/vacuumLeakage';

interface LeakageCurveChartProps {
  inputs: SystemInputs;
  summary: EstimationSummary;
  onSelectPressure?: (pressureMbar: number) => void;
}

type ChartMode = 'mass' | 'volumetric';

interface CurveSample {
  pMbar: number;
  hei: number;
  ssl: number;
  rr: number;
  inv: number;
}

const CHART_WIDTH = 760;
const CHART_HEIGHT = 330;
const PAD = { top: 24, right: 24, bottom: 44, left: 66 };
const PLOT_W = CHART_WIDTH - PAD.left - PAD.right;
const PLOT_H = CHART_HEIGHT - PAD.top - PAD.bottom;

const MIN_P = 0.2;
const MAX_P = 950;
const PRESSURE_TICKS = [0.2, 0.5, 1, 2, 5, 10, 25, 50, 100, 250, 535, 950];

function formatNumberCompact(val: number): string {
  if (!Number.isFinite(val)) return '—';
  if (val >= 1000) return val.toFixed(0);
  if (val >= 100) return val.toFixed(1);
  if (val >= 10) return val.toFixed(2);
  if (val >= 1) return val.toFixed(2);
  return val.toFixed(3);
}

export const LeakageCurveChart: React.FC<LeakageCurveChartProps> = ({
  inputs,
  summary,
  onSelectPressure,
}) => {
  const [chartMode, setChartMode] = useState<ChartMode>('mass');
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const vesselFactor =
    VESSEL_MATERIALS.find((m) => m.id === inputs.vesselMaterial)?.factor ?? 1.0;
  const gasketFactor =
    GASKET_MATERIALS.find((g) => g.id === inputs.gasketMaterial)?.factor ?? 1.0;
  const integrityFactor =
    INTEGRITY_CLASSES.find((c) => c.id === inputs.integrityClass)?.factor ?? 1.0;
  const combinedMult = vesselFactor * gasketFactor * integrityFactor;

  const samples = useMemo<CurveSample[]>(() => {
    const count = 84;
    const minLog = Math.log10(MIN_P);
    const maxLog = Math.log10(MAX_P);
    const tempK = inputs.suctionTempC + 273.15;

    const pts: CurveSample[] = [];
    for (let i = 0; i <= count; i++) {
      const p = Math.pow(10, minLog + (i / count) * (maxLog - minLog));
      const rho = (p * 100) / (R_AIR_SPECIFIC * tempK);

      const heiMass = calcHEIAirLeakageKgH(inputs.volumeM3, p) * combinedMult;
      const sslMass = calcSeiderSeaderLewinKgH(inputs.volumeM3, p) * combinedMult;
      const rrMass = calcRyansRoperKgH(inputs.volumeM3, p) * combinedMult;
      const invMass = calcComponentInventoryBreakdown(
        inputs.componentCounts,
        p,
        vesselFactor,
        gasketFactor,
        integrityFactor
      ).totalKgH;

      pts.push({
        pMbar: p,
        hei: chartMode === 'mass' ? heiMass : heiMass / rho,
        ssl: chartMode === 'mass' ? sslMass : sslMass / rho,
        rr: chartMode === 'mass' ? rrMass : rrMass / rho,
        inv: chartMode === 'mass' ? invMass : invMass / rho,
      });
    }
    return pts;
  }, [
    inputs.volumeM3,
    inputs.suctionTempC,
    inputs.componentCounts,
    combinedMult,
    vesselFactor,
    gasketFactor,
    integrityFactor,
    chartMode,
  ]);

  const { yMin, yMax, yTicks } = useMemo(() => {
    let maxVal = 0;
    let minVal = Infinity;
    for (const s of samples) {
      maxVal = Math.max(maxVal, s.hei, s.ssl, s.rr, s.inv);
      minVal = Math.min(minVal, s.hei, s.ssl, s.rr, s.inv);
    }

    if (chartMode === 'volumetric') {
      const logMin = Math.floor(Math.log10(Math.max(0.01, minVal)));
      const logMax = Math.ceil(Math.log10(Math.max(1, maxVal * 1.15)));
      const ticks: number[] = [];
      for (let e = logMin; e <= logMax; e++) {
        ticks.push(Math.pow(10, e));
      }
      return {
        yMin: Math.pow(10, logMin),
        yMax: Math.pow(10, logMax),
        yTicks: ticks,
      };
    }

    // Linear axis for mass leakage
    const paddedMax = Math.max(0.1, maxVal * 1.12);
    const roughStep = paddedMax / 5;
    const pow10 = Math.pow(10, Math.floor(Math.log10(roughStep)));
    const norm = roughStep / pow10;
    const niceNorm = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10;
    const step = niceNorm * pow10;
    const niceMax = Math.ceil(paddedMax / step) * step;

    const ticks: number[] = [];
    for (let v = 0; v <= niceMax + step * 0.001; v += step) {
      ticks.push(v);
    }
    return { yMin: 0, yMax: niceMax, yTicks: ticks };
  }, [samples, chartMode]);

  const xScale = (p: number) => {
    const clamped = Math.max(MIN_P, Math.min(MAX_P, p));
    const t =
      (Math.log10(clamped) - Math.log10(MIN_P)) /
      (Math.log10(MAX_P) - Math.log10(MIN_P));
    return PAD.left + t * PLOT_W;
  };

  const yScale = (val: number) => {
    if (chartMode === 'volumetric') {
      const clamped = Math.max(yMin, Math.min(yMax, val));
      const t =
        (Math.log10(clamped) - Math.log10(yMin)) /
        Math.max(0.0001, Math.log10(yMax) - Math.log10(yMin));
      return PAD.top + PLOT_H - t * PLOT_H;
    }
    const clamped = Math.max(0, Math.min(yMax, val));
    const t = clamped / Math.max(0.0001, yMax);
    return PAD.top + PLOT_H - t * PLOT_H;
  };

  const buildPath = (key: keyof Omit<CurveSample, 'pMbar'>) => {
    return samples
      .map((s, idx) => {
        const x = xScale(s.pMbar).toFixed(1);
        const y = yScale(s[key]).toFixed(1);
        return `${idx === 0 ? 'M' : 'L'}${x},${y}`;
      })
      .join(' ');
  };

  const opX = xScale(inputs.pressureMbar);
  const critX = xScale(P_CRIT_MBAR);

  const activeSample = hoverIdx !== null ? samples[hoverIdx] : null;
  const activeOpValues = useMemo(() => {
    const byId = (id: 'hei' | 'ssl' | 'ryans_roper' | 'component_inventory') => {
      const m = summary.models.find((item) => item.id === id);
      if (!m) return 0;
      return chartMode === 'mass' ? m.adjustedAirKgH : m.actualFlowM3H;
    };
    return {
      hei: byId('hei'),
      ssl: byId('ssl'),
      rr: byId('ryans_roper'),
      inv: byId('component_inventory'),
    };
  }, [summary.models, chartMode]);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const scaleX = CHART_WIDTH / rect.width;
    const svgX = (e.clientX - rect.left) * scaleX;
    if (svgX < PAD.left || svgX > PAD.left + PLOT_W) {
      setHoverIdx(null);
      return;
    }
    const ratio = (svgX - PAD.left) / PLOT_W;
    const idx = Math.min(
      samples.length - 1,
      Math.max(0, Math.round(ratio * (samples.length - 1)))
    );
    setHoverIdx(idx);
  };

  const handleClick = () => {
    if (hoverIdx !== null && onSelectPressure) {
      const clickedP = samples[hoverIdx].pMbar;
      onSelectPressure(Number(clickedP.toFixed(clickedP < 10 ? 2 : 1)));
    }
  };

  return (
    <section
      id="model-comparison"
      className="bg-white border border-slate-200 rounded-lg p-5"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Air Leakage vs. Vacuum Pressure Curves
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Log-pressure sweep ({MIN_P}–{MAX_P} mbar) at{' '}
            <span className="font-mono tabular-nums text-slate-700">
              {inputs.volumeM3.toFixed(2)} m³
            </span>{' '}
            ·{' '}
            <span className="font-mono tabular-nums text-slate-700">
              {summary.combinedMultiplier.toFixed(2)}×
            </span>{' '}
            material & integrity factor · Click curve to set operating pressure
          </p>
        </div>

        <div
          className="inline-flex items-center p-1 bg-slate-100 rounded-lg shrink-0 self-start sm:self-auto"
          role="group"
          aria-label="Chart y-axis unit mode"
        >
          <button
            type="button"
            onClick={() => setChartMode('mass')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              chartMode === 'mass'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Mass Rate (kg/h)
          </button>
          <button
            type="button"
            onClick={() => setChartMode('volumetric')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              chartMode === 'volumetric'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Suction Flow (m³/h)
          </button>
        </div>
      </div>

      {/* Legend Strip */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-600 mb-3 pb-3 border-b border-slate-100">
        <span className="inline-flex items-center gap-2">
          <svg width="20" height="4" aria-hidden="true">
            <line x1="0" y1="2" x2="20" y2="2" stroke="#0284c7" strokeWidth="2.5" />
          </svg>
          <span>HEI Standard</span>
        </span>
        <span className="inline-flex items-center gap-2">
          <svg width="20" height="4" aria-hidden="true">
            <line
              x1="0"
              y1="2"
              x2="20"
              y2="2"
              stroke="#0d9488"
              strokeWidth="2"
              strokeDasharray="5 3"
            />
          </svg>
          <span>Seider–Seader–Lewin</span>
        </span>
        <span className="inline-flex items-center gap-2">
          <svg width="20" height="4" aria-hidden="true">
            <line
              x1="0"
              y1="2"
              x2="20"
              y2="2"
              stroke="#d97706"
              strokeWidth="2"
              strokeDasharray="2 3"
            />
          </svg>
          <span>Ryans & Roper</span>
        </span>
        <span className="inline-flex items-center gap-2">
          <svg width="20" height="4" aria-hidden="true">
            <line x1="0" y1="2" x2="20" y2="2" stroke="#334155" strokeWidth="2" />
          </svg>
          <span>Component Inventory</span>
        </span>
      </div>

      <div className="relative">
        <svg
          viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
          className="w-full h-auto cursor-crosshair select-none"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverIdx(null)}
          onClick={handleClick}
          role="img"
          aria-label="Vacuum air leakage comparison chart across pressure range"
        >
          {/* Choked flow shaded zone (< 535.3 mbar) */}
          <rect
            x={PAD.left}
            y={PAD.top}
            width={Math.max(0, critX - PAD.left)}
            height={PLOT_H}
            fill="#f8fafc"
          />

          {/* Horizontal Y gridlines */}
          {yTicks.map((tick) => {
            const y = yScale(tick);
            return (
              <g key={tick}>
                <line
                  x1={PAD.left}
                  y1={y}
                  x2={PAD.left + PLOT_W}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeWidth="1"
                />
                <text
                  x={PAD.left - 8}
                  y={y + 3.5}
                  textAnchor="end"
                  className="fill-slate-500 text-[10px] font-mono tabular-nums"
                >
                  {formatNumberCompact(tick)}
                </text>
              </g>
            );
          })}

          {/* Vertical X gridlines */}
          {PRESSURE_TICKS.map((tick) => {
            const x = xScale(tick);
            const isCrit = tick === 535;
            return (
              <g key={tick}>
                <line
                  x1={x}
                  y1={PAD.top}
                  x2={x}
                  y2={PAD.top + PLOT_H}
                  stroke={isCrit ? '#94a3b8' : '#f1f5f9'}
                  strokeWidth="1"
                  strokeDasharray={isCrit ? '4 3' : undefined}
                />
                <text
                  x={x}
                  y={PAD.top + PLOT_H + 16}
                  textAnchor="middle"
                  className={`text-[10px] font-mono tabular-nums ${
                    isCrit ? 'fill-slate-700 font-semibold' : 'fill-slate-500'
                  }`}
                >
                  {tick}
                </text>
              </g>
            );
          })}

          {/* Critical Sonic Boundary Label */}
          <text
            x={critX - 6}
            y={PAD.top + 12}
            textAnchor="end"
            className="fill-slate-500 text-[9px] font-mono"
          >
            Sonic Choked (&lt;535.3 mbar)
          </text>
          <text
            x={critX + 6}
            y={PAD.top + 12}
            textAnchor="start"
            className="fill-slate-400 text-[9px] font-mono"
          >
            Subsonic
          </text>

          {/* Axes frame */}
          <rect
            x={PAD.left}
            y={PAD.top}
            width={PLOT_W}
            height={PLOT_H}
            fill="none"
            stroke="#cbd5e1"
            strokeWidth="1"
          />

          {/* Axis labels */}
          <text
            x={PAD.left + PLOT_W / 2}
            y={CHART_HEIGHT - 6}
            textAnchor="middle"
            className="fill-slate-600 text-[11px] font-medium"
          >
            Operating Suction Pressure (mbar abs, log scale)
          </text>
          <text
            x={16}
            y={PAD.top + PLOT_H / 2}
            textAnchor="middle"
            transform={`rotate(-90 16 ${PAD.top + PLOT_H / 2})`}
            className="fill-slate-600 text-[11px] font-medium"
          >
            {chartMode === 'mass'
              ? 'Air In-Leakage (kg/h)'
              : 'Actual Suction Flow (m³/h)'}
          </text>

          {/* Model Curves */}
          <path
            d={buildPath('inv')}
            fill="none"
            stroke="#334155"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d={buildPath('rr')}
            fill="none"
            stroke="#d97706"
            strokeWidth="2"
            strokeDasharray="2 3"
            strokeLinejoin="round"
          />
          <path
            d={buildPath('ssl')}
            fill="none"
            stroke="#0d9488"
            strokeWidth="2"
            strokeDasharray="5 3"
            strokeLinejoin="round"
          />
          <path
            d={buildPath('hei')}
            fill="none"
            stroke="#0284c7"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Current Operating Pressure Marker */}
          <line
            x1={opX}
            y1={PAD.top}
            x2={opX}
            y2={PAD.top + PLOT_H}
            stroke="#0284c7"
            strokeWidth="1.5"
            strokeOpacity="0.6"
          />
          <circle
            cx={opX}
            cy={yScale(activeOpValues.hei)}
            r="4.5"
            fill="#0284c7"
            stroke="#ffffff"
            strokeWidth="1.5"
          />
          <circle
            cx={opX}
            cy={yScale(activeOpValues.ssl)}
            r="4"
            fill="#0d9488"
            stroke="#ffffff"
            strokeWidth="1.5"
          />
          <circle
            cx={opX}
            cy={yScale(activeOpValues.rr)}
            r="4"
            fill="#d97706"
            stroke="#ffffff"
            strokeWidth="1.5"
          />
          <circle
            cx={opX}
            cy={yScale(activeOpValues.inv)}
            r="4"
            fill="#334155"
            stroke="#ffffff"
            strokeWidth="1.5"
          />

          {/* Crosshair Hover Line */}
          {activeSample && (
            <g>
              <line
                x1={xScale(activeSample.pMbar)}
                y1={PAD.top}
                x2={xScale(activeSample.pMbar)}
                y2={PAD.top + PLOT_H}
                stroke="#475569"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
              <circle
                cx={xScale(activeSample.pMbar)}
                cy={yScale(activeSample.hei)}
                r="3.5"
                fill="#0284c7"
              />
              <circle
                cx={xScale(activeSample.pMbar)}
                cy={yScale(activeSample.ssl)}
                r="3.5"
                fill="#0d9488"
              />
              <circle
                cx={xScale(activeSample.pMbar)}
                cy={yScale(activeSample.rr)}
                r="3.5"
                fill="#d97706"
              />
              <circle
                cx={xScale(activeSample.pMbar)}
                cy={yScale(activeSample.inv)}
                r="3.5"
                fill="#334155"
              />
            </g>
          )}
        </svg>

        {/* Monospace Coordinate HUD */}
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3 px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-xs font-mono tabular-nums">
          <div className="text-slate-700">
            {activeSample ? (
              <span>
                PROBE P ={' '}
                <strong className="text-slate-900">
                  {activeSample.pMbar.toFixed(activeSample.pMbar < 10 ? 2 : 1)} mbar
                </strong>
              </span>
            ) : (
              <span>
                OPERATING P ={' '}
                <strong className="text-sky-700">
                  {inputs.pressureMbar.toFixed(inputs.pressureMbar < 10 ? 2 : 1)} mbar
                </strong>
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="text-sky-700">
              HEI:{' '}
              {formatNumberCompact(
                activeSample ? activeSample.hei : activeOpValues.hei
              )}{' '}
              {chartMode === 'mass' ? 'kg/h' : 'm³/h'}
            </span>
            <span className="text-teal-700">
              SSL:{' '}
              {formatNumberCompact(
                activeSample ? activeSample.ssl : activeOpValues.ssl
              )}{' '}
              {chartMode === 'mass' ? 'kg/h' : 'm³/h'}
            </span>
            <span className="text-amber-700">
              R&amp;R:{' '}
              {formatNumberCompact(
                activeSample ? activeSample.rr : activeOpValues.rr
              )}{' '}
              {chartMode === 'mass' ? 'kg/h' : 'm³/h'}
            </span>
            <span className="text-slate-700">
              INV:{' '}
              {formatNumberCompact(
                activeSample ? activeSample.inv : activeOpValues.inv
              )}{' '}
              {chartMode === 'mass' ? 'kg/h' : 'm³/h'}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
