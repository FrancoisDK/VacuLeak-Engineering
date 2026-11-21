import React from 'react';
import { GASKET_MATERIALS, VESSEL_MATERIALS } from '../utils/vacuumLeakage';

export const StandardsReference: React.FC = () => {
  return (
    <section
      id="standards-equations"
      className="bg-white border border-slate-200 rounded-lg p-5 space-y-6"
    >
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-base font-semibold text-slate-900">
          Industry-Standard Leakage Models &amp; Physical Equations
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Governing correlations, choked-flow gas dynamics, and material multipliers used in vacuum distillation design
        </p>
      </div>

      {/* 4 Calculation Models */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-md">
          <div className="text-xs font-semibold text-slate-900">
            01. HEI Standard Method (Heat Exchange Institute)
          </div>
          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
            Correlates allowable air leakage with evacuated volume{' '}
            <span className="font-mono text-slate-800">V</span> and operating
            pressure tier for commercially tight systems. Lower design
            pressures carry tighter leakage allowances because deep-vacuum
            columns require welded construction and bellows-sealed valves.
          </p>
          <div className="mt-2.5 p-2 bg-white border border-slate-200 rounded font-mono text-[11px] text-slate-800">
            W_air [lb/h] = C_HEI(P) · V_ft³^0.667 · Φ(P) · M_mat · M_int
          </div>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-md">
          <div className="text-xs font-semibold text-slate-900">
            02. Seider–Seader–Lewin / Ludwig Correlation
          </div>
          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
            Continuous log-polynomial fit widely used in distillation column and
            steam ejector sizing. Includes a baseline fixed allowance (scaled
            below 100 ft³ for pilot units) plus a pressure-dependent volume term.
          </p>
          <div className="mt-2.5 p-2 bg-white border border-slate-200 rounded font-mono text-[11px] text-slate-800">
            W [lb/h] = 5 + [0.0298 + 0.03088·ln(P) - 0.0005733·(ln P)²] · V^0.66
          </div>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-md">
          <div className="text-xs font-semibold text-slate-900">
            03. Ryans &amp; Roper Power-Law Correlation
          </div>
          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
            Empirical correlation from <em>Process Vacuum System Design</em>{' '}
            capturing gradual leakage variation with design pressure and total
            evacuated volume across industrial chemical equipment.
          </p>
          <div className="mt-2.5 p-2 bg-white border border-slate-200 rounded font-mono text-[11px] text-slate-800">
            W_air [lb/h] = 0.085 · P_Torr^0.25 · V_ft³^0.60 · Φ(P) · M_mat
          </div>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-md">
          <div className="text-xs font-semibold text-slate-900">
            04. Component Inventory &amp; Sonic Choked Flow
          </div>
          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
            Sums physical air ingress across flanges, valves, manways, and
            shaft seals. For air (γ = 1.4), orifice flow chokes at{' '}
            <span className="font-mono text-slate-800">
              P_crit = 0.528 × 1013.25 = 535.3 mbar
            </span>
            : below 535.3 mbar, mass flow through any fixed crack is independent
            of vacuum level, while actual volumetric flow{' '}
            <span className="font-mono text-slate-800">Q = ṁ / ρ(P,T)</span>{' '}
            rises inversely with pressure.
          </p>
          <div className="mt-2.5 p-2 bg-white border border-slate-200 rounded font-mono text-[11px] text-slate-800">
            Φ(P) = 1.0 for P ≤ 535.3 mbar · Q_actual [m³/h] = ṁ_air / ρ_air(P, T)
          </div>
        </div>
      </div>

      {/* Material Factor Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2.5">
            Vessel &amp; Piping Construction Multipliers
          </h3>
          <div className="border border-slate-200 rounded-md overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <tr>
                  <th className="py-2 px-3 font-medium">Material</th>
                  <th className="py-2 px-3 font-medium text-right">Factor</th>
                  <th className="py-2 px-3 font-medium">Engineering Basis</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {VESSEL_MATERIALS.map((m) => (
                  <tr key={m.id}>
                    <td className="py-2 px-3 font-medium text-slate-900 whitespace-nowrap">
                      {m.shortName}
                    </td>
                    <td className="py-2 px-3 font-mono tabular-nums text-right text-slate-900">
                      {m.factor.toFixed(2)}×
                    </td>
                    <td className="py-2 px-3 text-slate-600">{m.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2.5">
            Gasket &amp; Seal Multipliers
          </h3>
          <div className="border border-slate-200 rounded-md overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <tr>
                  <th className="py-2 px-3 font-medium">Seal Type</th>
                  <th className="py-2 px-3 font-medium text-right">Factor</th>
                  <th className="py-2 px-3 font-medium">Engineering Basis</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {GASKET_MATERIALS.map((g) => (
                  <tr key={g.id}>
                    <td className="py-2 px-3 font-medium text-slate-900 whitespace-nowrap">
                      {g.shortName}
                    </td>
                    <td className="py-2 px-3 font-mono tabular-nums text-right text-slate-900">
                      {g.factor.toFixed(2)}×
                    </td>
                    <td className="py-2 px-3 text-slate-600">{g.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};
