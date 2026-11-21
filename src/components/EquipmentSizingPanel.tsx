import React from 'react';
import {
  EstimationSummary,
  SystemInputs,
  VaporSpeciesId,
} from '../utils/vacuumLeakage';

interface EquipmentSizingPanelProps {
  inputs: SystemInputs;
  summary: EstimationSummary;
  onChangeVaporSpecies: (species: VaporSpeciesId) => void;
  onChangeCondenserTemp: (tempC: number) => void;
  onChangeDesignMargin: (margin: number) => void;
}

const VAPOR_OPTIONS: { id: VaporSpeciesId; label: string }[] = [
  { id: 'dry_air_only', label: 'Dry Air Only (No Vapor Carryover)' },
  { id: 'water', label: 'Water Vapor (Steam / Aqueous)' },
  { id: 'methanol', label: 'Methanol (Light Alcohol)' },
  { id: 'toluene', label: 'Toluene (Aromatic Solvent)' },
  { id: 'n_hexane', label: 'n-Hexane (Light Hydrocarbon)' },
];

export const EquipmentSizingPanel: React.FC<EquipmentSizingPanelProps> = ({
  inputs,
  summary,
  onChangeVaporSpecies,
  onChangeCondenserTemp,
  onChangeDesignMargin,
}) => {
  const { vaporCarryover, recommendedTrain, componentBreakdown } = summary;

  return (
    <section
      id="equipment-sizing"
      className="grid grid-cols-1 lg:grid-cols-12 gap-6"
    >
      {/* Auxiliary Condenser & Vacuum Pump Sizing */}
      <div className="lg:col-span-7 bg-white border border-slate-200 rounded-lg p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Vacuum Pump &amp; Condenser Sizing Basis
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Applies design margin and Dalton&apos;s law saturation carryover at the overhead vent condenser
            </p>
          </div>
          <div className="text-right font-mono tabular-nums text-xs text-slate-600">
            Basis: <span className="font-semibold text-slate-900">{summary.selectedModel.name}</span>
          </div>
        </div>

        {/* Controls row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4 border-b border-slate-100">
          <div>
            <label
              htmlFor="design-margin-select"
              className="block text-xs font-medium text-slate-700 mb-1.5"
            >
              Design Safety Margin
            </label>
            <select
              id="design-margin-select"
              value={inputs.designMargin}
              onChange={(e) => onChangeDesignMargin(Number(e.target.value))}
              className="w-full h-9 px-2.5 text-xs font-mono bg-slate-50 border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:border-sky-600"
            >
              <option value={1.0}>1.00× (Nominal / Unfactored)</option>
              <option value={1.25}>1.25× (Tight Pilot Design)</option>
              <option value={1.5}>1.50× (Standard Plant Design)</option>
              <option value={2.0}>2.00× (HEI / API Conservative)</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="vapor-species-select"
              className="block text-xs font-medium text-slate-700 mb-1.5"
            >
              Condenser Vapor Carryover
            </label>
            <select
              id="vapor-species-select"
              value={inputs.vaporSpecies}
              onChange={(e) =>
                onChangeVaporSpecies(e.target.value as VaporSpeciesId)
              }
              className="w-full h-9 px-2.5 text-xs bg-slate-50 border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:border-sky-600"
            >
              {VAPOR_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="condenser-temp-input"
              className="block text-xs font-medium text-slate-700 mb-1.5"
            >
              Vent Condenser Temp (°C)
            </label>
            <div className="flex items-center gap-2">
              <input
                id="condenser-temp-input"
                type="number"
                min={-30}
                max={80}
                step={1}
                disabled={inputs.vaporSpecies === 'dry_air_only'}
                value={inputs.condenserTempC}
                onChange={(e) =>
                  onChangeCondenserTemp(
                    Math.max(-30, Math.min(80, Number(e.target.value) || 0))
                  )
                }
                className="w-full h-9 px-2.5 text-xs font-mono tabular-nums bg-slate-50 border border-slate-300 rounded-md text-slate-900 disabled:opacity-50 focus:outline-none focus:border-sky-600"
              />
            </div>
          </div>
        </div>

        {/* Vapor Warning if Condenser Temp too warm for operating vacuum */}
        {vaporCarryover.isChokedByVapor && inputs.vaporSpecies !== 'dry_air_only' && (
          <div className="mt-4 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-md text-xs text-amber-900">
            <span className="font-semibold">▲ Condenser Limit Reached:</span>{' '}
            At {inputs.condenserTempC} °C, {vaporCarryover.speciesName} vapor pressure (
            <span className="font-mono tabular-nums">
              {vaporCarryover.vaporPressureMbar.toFixed(1)} mbar
            </span>
            ) exceeds or approaches the {inputs.pressureMbar} mbar column pressure. Lower vent condenser temperature or add a chilled post-condenser.
          </div>
        )}

        {/* Sizing Results Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-slate-500">
              Design Air Load
            </div>
            <div className="mt-1 text-lg font-mono font-semibold tabular-nums text-slate-900">
              {summary.designAirKgH.toFixed(2)}
              <span className="text-xs font-normal text-slate-500 ml-1">kg/h</span>
            </div>
            <div className="text-[11px] font-mono tabular-nums text-slate-500">
              {summary.designAirLbH.toFixed(2)} lb/h
            </div>
          </div>

          <div>
            <div className="text-[11px] uppercase tracking-wider text-slate-500">
              Vapor Carryover
            </div>
            <div className="mt-1 text-lg font-mono font-semibold tabular-nums text-slate-900">
              {vaporCarryover.vaporCarryoverKgH.toFixed(2)}
              <span className="text-xs font-normal text-slate-500 ml-1">kg/h</span>
            </div>
            <div className="text-[11px] font-mono tabular-nums text-slate-500">
              P_vap: {vaporCarryover.vaporPressureMbar.toFixed(1)} mbar
            </div>
          </div>

          <div>
            <div className="text-[11px] uppercase tracking-wider text-slate-500">
              Total Suction Flow
            </div>
            <div className="mt-1 text-lg font-mono font-semibold tabular-nums text-sky-700">
              {vaporCarryover.totalActualFlowM3H.toFixed(1)}
              <span className="text-xs font-normal text-slate-500 ml-1">m³/h</span>
            </div>
            <div className="text-[11px] font-mono tabular-nums text-slate-500">
              {(vaporCarryover.totalActualFlowM3H * 0.58858).toFixed(1)} ACFM
            </div>
          </div>

          <div>
            <div className="text-[11px] uppercase tracking-wider text-slate-500">
              Est. Pump-Down
            </div>
            <div className="mt-1 text-lg font-mono font-semibold tabular-nums text-slate-900">
              {summary.pumpDownMinutes.toFixed(0)}
              <span className="text-xs font-normal text-slate-500 ml-1">min</span>
            </div>
            <div className="text-[11px] font-mono tabular-nums text-slate-500">
              1013 → {inputs.pressureMbar} mbar
            </div>
          </div>
        </div>

        {/* Recommended Train Block */}
        <div className="mt-2 p-4 bg-slate-50 border border-slate-200 rounded-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-slate-500">
                Recommended Vacuum Equipment Train
              </div>
              <div className="text-sm font-semibold text-slate-900 mt-0.5">
                {recommendedTrain.technology}
              </div>
            </div>
            <div className="flex items-center gap-4 font-mono tabular-nums text-xs">
              <div>
                <span className="text-slate-500">Est. Shaft Power: </span>
                <strong className="text-slate-900">
                  {recommendedTrain.estimatedPowerKw.toFixed(1)} kW
                </strong>
              </div>
              {recommendedTrain.motiveSteamKgH !== null && (
                <div>
                  <span className="text-slate-500">Or Motive Steam: </span>
                  <strong className="text-slate-900">
                    ~{recommendedTrain.motiveSteamKgH.toFixed(0)} kg/h
                  </strong>
                </div>
              )}
            </div>
          </div>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
            {recommendedTrain.rationale}
          </p>
        </div>
      </div>

      {/* Component Inventory Breakdown */}
      <div className="lg:col-span-5 bg-white border border-slate-200 rounded-lg p-5">
        <div className="pb-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-900">
            Component Seal Leakage Share
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Physical leakage contribution from the Perry&apos;s / Ryans &amp; Roper fitting inventory
          </p>
        </div>

        <div className="mt-4 space-y-3">
          {componentBreakdown.map((item) => (
            <div key={item.key}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-700 font-medium truncate pr-2">
                  {item.label}{' '}
                  <span className="text-slate-400 font-mono tabular-nums">
                    (×{item.count})
                  </span>
                </span>
                <span className="font-mono tabular-nums text-slate-900 shrink-0">
                  {item.totalKgH.toFixed(3)} kg/h{' '}
                  <span className="text-slate-400">
                    ({item.sharePercent.toFixed(0)}%)
                  </span>
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-sky-600 transition-all duration-200"
                  style={{ width: `${Math.min(100, item.sharePercent)}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500">Inventory Total (Unfactored Margin)</span>
          <span className="font-mono font-semibold tabular-nums text-slate-900">
            {componentBreakdown
              .reduce((acc, c) => acc + c.totalKgH, 0)
              .toFixed(3)}{' '}
            kg/h
          </span>
        </div>
      </div>
    </section>
  );
};
