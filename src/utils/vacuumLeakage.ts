export type VesselMaterialId =
  | 'carbon_steel'
  | 'stainless_steel'
  | 'nickel_alloy'
  | 'glass_lined'
  | 'borosilicate_glass'
  | 'graphite_frp';

export type GasketMaterialId =
  | 'spiral_wound'
  | 'viton_fkm'
  | 'ptfe_envelope'
  | 'epdm_silicone'
  | 'cnaf_fiber';

export type IntegrityClassId = 'tight' | 'standard' | 'aged';

export type SizingMethodId = 'hei' | 'ssl' | 'ryans_roper' | 'component_inventory';

export type VaporSpeciesId = 'dry_air_only' | 'water' | 'methanol' | 'toluene' | 'n_hexane';

export interface VesselMaterialSpec {
  id: VesselMaterialId;
  name: string;
  shortName: string;
  factor: number;
  notes: string;
}

export interface GasketMaterialSpec {
  id: GasketMaterialId;
  name: string;
  shortName: string;
  factor: number;
  notes: string;
}

export interface IntegrityClassSpec {
  id: IntegrityClassId;
  name: string;
  factor: number;
  description: string;
}

export interface ComponentCounts {
  flanges: number;
  manways: number;
  packedValves: number;
  bellowsValves: number;
  mechSeals: number;
  stuffingBoxes: number;
  threadedFittings: number;
}

export interface SystemInputs {
  presetId: string;
  volumeM3: number;
  pressureMbar: number;
  suctionTempC: number;
  vesselMaterial: VesselMaterialId;
  gasketMaterial: GasketMaterialId;
  integrityClass: IntegrityClassId;
  primaryModel: SizingMethodId;
  designMargin: number;
  componentCounts: ComponentCounts;
  vaporSpecies: VaporSpeciesId;
  condenserTempC: number;
}

export interface ModelResult {
  id: SizingMethodId;
  name: string;
  reference: string;
  baseAirKgH: number;
  adjustedAirKgH: number;
  adjustedAirLbH: number;
  actualFlowM3H: number;
  actualFlowACFM: number;
  applicabilityNote: string;
}

export interface ComponentLeakBreakdown {
  key: keyof ComponentCounts;
  label: string;
  count: number;
  unitRateKgH: number;
  totalKgH: number;
  sharePercent: number;
}

export interface VaporCarryoverResult {
  speciesName: string;
  vaporPressureMbar: number;
  isChokedByVapor: boolean;
  vaporCarryoverKgH: number;
  totalGasMassKgH: number;
  totalActualFlowM3H: number;
}

export interface VacuumTrainRecommendation {
  technology: string;
  stages: string;
  estimatedPowerKw: number;
  motiveSteamKgH: number | null;
  rationale: string;
}

export interface EstimationSummary {
  pressureTorr: number;
  pressureKpa: number;
  volumeFt3: number;
  airDensityKgM3: number;
  isSonicChoked: boolean;
  orificeFlowFactor: number;
  materialMultiplier: number;
  combinedMultiplier: number;
  models: ModelResult[];
  selectedModel: ModelResult;
  designAirKgH: number;
  designAirLbH: number;
  designActualFlowM3H: number;
  designActualFlowACFM: number;
  componentBreakdown: ComponentLeakBreakdown[];
  vaporCarryover: VaporCarryoverResult;
  recommendedTrain: VacuumTrainRecommendation;
  pumpDownMinutes: number;
}

export const P_ATM_MBAR = 1013.25;
export const P_CRIT_MBAR = 535.28; // 0.52828 * 1013.25 mbar (gamma = 1.4)
export const M_AIR = 28.97; // kg/kmol
export const R_AIR_SPECIFIC = 287.05; // J/(kg*K)
export const M3_TO_FT3 = 35.314667;
export const MBAR_TO_TORR = 0.75006168;
export const KG_TO_LB = 2.2046226;
export const M3H_TO_ACFM = 0.5885778;

export const VESSEL_MATERIALS: VesselMaterialSpec[] = [
  {
    id: 'carbon_steel',
    name: 'Welded Carbon Steel (ASME)',
    shortName: 'Carbon Steel',
    factor: 1.0,
    notes: 'Baseline industrial vacuum construction; standard machined raised-face flanges.',
  },
  {
    id: 'stainless_steel',
    name: 'Stainless Steel (304L / 316L)',
    shortName: '316L Stainless',
    factor: 0.92,
    notes: 'Precision-machined flange surfaces and clean TIG/orbital welds reduce micro-leakage.',
  },
  {
    id: 'nickel_alloy',
    name: 'High-Nickel Alloy / Titanium',
    shortName: 'Alloy / Ti',
    factor: 0.9,
    notes: 'High-integrity welded alloy vessels typically fabricated to strict helium-test tolerances.',
  },
  {
    id: 'glass_lined',
    name: 'Glass-Lined Steel (Reactor / Column)',
    shortName: 'Glass-Lined',
    factor: 1.65,
    notes: 'Higher nozzle waviness requires thick PTFE envelope gaskets and periodic re-torquing.',
  },
  {
    id: 'borosilicate_glass',
    name: 'Borosilicate Glass (Pilot / Lab)',
    shortName: 'Borosilicate Glass',
    factor: 1.85,
    notes: 'Numerous beaded-pipe or ground-glass joints per unit volume increase seal perimeter.',
  },
  {
    id: 'graphite_frp',
    name: 'Impervious Graphite / FRP',
    shortName: 'Graphite / FRP',
    factor: 2.1,
    notes: 'Resin-impregnated porosity and cemented joints exhibit higher baseline permeation.',
  },
];

export const GASKET_MATERIALS: GasketMaterialSpec[] = [
  {
    id: 'spiral_wound',
    name: 'Spiral-Wound Metal + Flexible Graphite',
    shortName: 'Spiral-Wound',
    factor: 0.8,
    notes: 'Lowest leak rate and highest thermal-cycle resilience for metal flanges.',
  },
  {
    id: 'viton_fkm',
    name: 'Fluoroelastomer O-Ring (Viton / FKM)',
    shortName: 'Viton (FKM)',
    factor: 0.95,
    notes: 'Low gas permeation and strong chemical/temperature resistance up to 200 °C.',
  },
  {
    id: 'ptfe_envelope',
    name: 'PTFE / ePTFE Envelope Gasket',
    shortName: 'PTFE / ePTFE',
    factor: 1.15,
    notes: 'Broad chemical compatibility; susceptible to cold-flow creep across thermal cycles.',
  },
  {
    id: 'epdm_silicone',
    name: 'EPDM / Silicone Elastomer',
    shortName: 'EPDM / Silicone',
    factor: 1.35,
    notes: 'Higher gas permeation coefficient in deep vacuum (<10 mbar) service.',
  },
  {
    id: 'cnaf_fiber',
    name: 'Compressed Non-Asbestos Fiber (CNAF)',
    shortName: 'CNAF Fiber',
    factor: 1.75,
    notes: 'Porous fiber matrix; generally discouraged below 50 mbar due to diffuse weepage.',
  },
];

export const INTEGRITY_CLASSES: IntegrityClassSpec[] = [
  {
    id: 'tight',
    name: 'Commercially Tight',
    factor: 1.0,
    description: 'New or pressure/helium-tested plant; bellows valves & mechanical seals.',
  },
  {
    id: 'standard',
    name: 'Standard Industrial',
    factor: 1.35,
    description: 'Typical operating distillation unit with routine gasket maintenance.',
  },
  {
    id: 'aged',
    name: 'Aged / High Allowance',
    factor: 1.9,
    description: 'Older plant with thermal cycling, packed valves, or conservative sizing margin.',
  },
];

export interface SystemPreset {
  id: string;
  name: string;
  summary: string;
  inputs: Partial<SystemInputs>;
}

export const SYSTEM_PRESETS: SystemPreset[] = [
  {
    id: 'pilot_glass',
    name: 'Pilot Glass Still (0.35 m³ · 5 mbar)',
    summary: 'Borosilicate pilot column with PTFE couplings',
    inputs: {
      volumeM3: 0.35,
      pressureMbar: 5,
      suctionTempC: 25,
      vesselMaterial: 'borosilicate_glass',
      gasketMaterial: 'ptfe_envelope',
      integrityClass: 'tight',
      componentCounts: {
        flanges: 14,
        manways: 0,
        packedValves: 2,
        bellowsValves: 4,
        mechSeals: 1,
        stuffingBoxes: 0,
        threadedFittings: 4,
      },
    },
  },
  {
    id: 'fine_chem',
    name: 'Fine Chemical Batch Column (14 m³ · 15 mbar)',
    summary: '316L stainless tower with overhead condenser',
    inputs: {
      volumeM3: 14,
      pressureMbar: 15,
      suctionTempC: 35,
      vesselMaterial: 'stainless_steel',
      gasketMaterial: 'spiral_wound',
      integrityClass: 'tight',
      componentCounts: {
        flanges: 36,
        manways: 3,
        packedValves: 6,
        bellowsValves: 8,
        mechSeals: 2,
        stuffingBoxes: 0,
        threadedFittings: 6,
      },
    },
  },
  {
    id: 'glass_lined_api',
    name: 'Glass-Lined Pharma Reactor (8 m³ · 25 mbar)',
    summary: 'Glass-lined vessel with PTFE envelope gaskets',
    inputs: {
      volumeM3: 8,
      pressureMbar: 25,
      suctionTempC: 30,
      vesselMaterial: 'glass_lined',
      gasketMaterial: 'ptfe_envelope',
      integrityClass: 'standard',
      componentCounts: {
        flanges: 28,
        manways: 2,
        packedValves: 5,
        bellowsValves: 6,
        mechSeals: 2,
        stuffingBoxes: 0,
        threadedFittings: 4,
      },
    },
  },
  {
    id: 'refinery_vdu',
    name: 'Refinery Vacuum Tower (220 m³ · 40 mbar)',
    summary: 'Large welded carbon steel VDU + condensers',
    inputs: {
      volumeM3: 220,
      pressureMbar: 40,
      suctionTempC: 45,
      vesselMaterial: 'carbon_steel',
      gasketMaterial: 'spiral_wound',
      integrityClass: 'standard',
      componentCounts: {
        flanges: 110,
        manways: 8,
        packedValves: 22,
        bellowsValves: 4,
        mechSeals: 4,
        stuffingBoxes: 0,
        threadedFittings: 12,
      },
    },
  },
];

export function estimateDefaultComponents(volumeM3: number): ComponentCounts {
  const v = Math.max(0.05, volumeM3);
  const scale = Math.pow(v, 0.45);
  return {
    flanges: Math.max(6, Math.round(14 * scale)),
    manways: v < 1.5 ? 0 : Math.max(1, Math.round(1.2 * Math.pow(v, 0.35))),
    packedValves: Math.max(2, Math.round(3.5 * scale)),
    bellowsValves: Math.max(2, Math.round(2.5 * scale)),
    mechSeals: v < 1 ? 1 : Math.max(1, Math.round(0.9 * Math.pow(v, 0.3))),
    stuffingBoxes: 0,
    threadedFittings: Math.max(2, Math.round(2.5 * scale)),
  };
}

/**
 * Compressible orifice subsonic/choked flow factor Phi(P).
 * Returns 1.0 for P <= P_crit (535.28 mbar), smoothly decaying to 0 at 1013.25 mbar.
 */
export function getOrificeFlowFactor(pressureMbar: number): number {
  const p = Math.max(0.05, Math.min(P_ATM_MBAR, pressureMbar));
  if (p <= P_CRIT_MBAR) return 1.0;

  const gamma = 1.4;
  const r = p / P_ATM_MBAR;
  const rCrit = P_CRIT_MBAR / P_ATM_MBAR;

  const term = Math.max(0, Math.pow(r, 2 / gamma) - Math.pow(r, (gamma + 1) / gamma));
  const termCrit = Math.pow(rCrit, 2 / gamma) - Math.pow(rCrit, (gamma + 1) / gamma);

  return Math.sqrt(term / termCrit);
}

/**
 * Model 1: Heat Exchange Institute (HEI) Standards for Steam Jet Vacuum Systems.
 * Uses canonical anchor points on the HEI Commercially Tight curve (lb/h = C(P) * V_ft3^0.667)
 * with smooth log-linear interpolation across pressure bands, plus subsonic rolloff above 535.3 mbar.
 */
export function calcHEIAirLeakageKgH(volumeM3: number, pressureMbar: number): number {
  const vFt3 = Math.max(0.5, volumeM3 * M3_TO_FT3);
  const pTorr = Math.max(0.05, Math.min(P_CRIT_MBAR * MBAR_TO_TORR, pressureMbar * MBAR_TO_TORR));

  // Canonical HEI anchor points: [Torr, C = W_lbh / V_ft3^0.667]
  const anchors: [number, number][] = [
    [0.1, 0.014],
    [0.5, 0.021],
    [1.0, 0.035],
    [3.0, 0.068],
    [20.0, 0.120],
    [90.0, 0.195],
    [401.5, 0.195],
  ];

  let c = anchors[anchors.length - 1][1];
  if (pTorr <= anchors[0][0]) {
    c = anchors[0][1];
  } else {
    for (let i = 0; i < anchors.length - 1; i++) {
      const [p1, c1] = anchors[i];
      const [p2, c2] = anchors[i + 1];
      if (pTorr >= p1 && pTorr <= p2) {
        const t = (Math.log(pTorr) - Math.log(p1)) / (Math.log(p2) - Math.log(p1));
        c = c1 + t * (c2 - c1);
        break;
      }
    }
  }

  const wLbH = c * Math.pow(vFt3, 0.667) * getOrificeFlowFactor(pressureMbar);
  return wLbH / KG_TO_LB;
}

/**
 * Model 2: Seider-Seader-Lewin / Ludwig Correlation (Process Design Principles).
 * W_lbh = 5*scale + (0.0298 + 0.03088*ln(P_torr) - 0.0005733*(ln(P_torr))^2) * V_ft3^0.66
 * Note: For small pilot rigs (<100 ft3), the fixed 5 lb/h offset is scaled by (V_ft3/100)^0.66
 * to prevent unphysical over-prediction on bench-scale columns.
 */
export function calcSeiderSeaderLewinKgH(volumeM3: number, pressureMbar: number): number {
  const vFt3 = Math.max(0.5, volumeM3 * M3_TO_FT3);
  const pTorr = Math.max(0.1, Math.min(P_CRIT_MBAR * MBAR_TO_TORR, pressureMbar * MBAR_TO_TORR));
  const lnP = Math.log(Math.max(1.0, pTorr));

  let coeff = 0.0298 + 0.03088 * lnP - 0.0005733 * lnP * lnP;
  if (pTorr < 1.0) {
    // Smooth low-pressure continuation below 1 Torr
    coeff = 0.0298 * Math.pow(pTorr, 0.35);
  }

  const baselineOffset = vFt3 < 100 ? 5.0 * Math.pow(vFt3 / 100, 0.66) : 5.0;
  const wLbH = (baselineOffset + coeff * Math.pow(vFt3, 0.66)) * getOrificeFlowFactor(pressureMbar);
  return wLbH / KG_TO_LB;
}

/**
 * Model 3: Ryans & Roper Continuous Power-Law Correlation.
 * W_lbh = 0.085 * P_torr^0.25 * V_ft3^0.60 (for commercially tight systems).
 */
export function calcRyansRoperKgH(volumeM3: number, pressureMbar: number): number {
  const vFt3 = Math.max(0.5, volumeM3 * M3_TO_FT3);
  const pTorr = Math.max(0.05, Math.min(P_CRIT_MBAR * MBAR_TO_TORR, pressureMbar * MBAR_TO_TORR));

  const wLbH = 0.085 * Math.pow(pTorr, 0.25) * Math.pow(vFt3, 0.60) * getOrificeFlowFactor(pressureMbar);
  return wLbH / KG_TO_LB;
}

/**
 * Model 4: Perry's / Ryans & Roper Component & Seal Inventory Model.
 * Computes exact physical air leakage across individual seals, valves, flanges, and shafts,
 * applying vessel/gasket factors to flanged & cover seals and choked-flow physics above 535.3 mbar.
 */
export function calcComponentInventoryBreakdown(
  counts: ComponentCounts,
  pressureMbar: number,
  vesselFactor: number,
  gasketFactor: number,
  integrityFactor: number
): { totalKgH: number; breakdown: ComponentLeakBreakdown[] } {
  const flowFactor = getOrificeFlowFactor(pressureMbar);
  const flangeMatFactor = vesselFactor * gasketFactor;

  const definitions: {
    key: keyof ComponentCounts;
    label: string;
    baseUnitKgH: number;
    usesFlangeMat: boolean;
  }[] = [
    { key: 'flanges', label: 'Standard Flanged Joints', baseUnitKgH: 0.022, usesFlangeMat: true },
    { key: 'manways', label: 'Manways & Sight Glasses', baseUnitKgH: 0.110, usesFlangeMat: true },
    { key: 'packedValves', label: 'Packed Stem Valves', baseUnitKgH: 0.068, usesFlangeMat: false },
    { key: 'bellowsValves', label: 'Bellows / Diaphragm Valves', baseUnitKgH: 0.002, usesFlangeMat: false },
    { key: 'mechSeals', label: 'Mechanical Shaft Seals', baseUnitKgH: 0.045, usesFlangeMat: false },
    { key: 'stuffingBoxes', label: 'Packed Stuffing Boxes', baseUnitKgH: 0.450, usesFlangeMat: false },
    { key: 'threadedFittings', label: 'Threaded / Instrument Joints', baseUnitKgH: 0.060, usesFlangeMat: false },
  ];

  const rows = definitions.map((def) => {
    const count = Math.max(0, counts[def.key]);
    const matMult = def.usesFlangeMat ? flangeMatFactor : 1.0;
    const unitRateKgH = def.baseUnitKgH * matMult * integrityFactor * flowFactor;
    const totalKgH = count * unitRateKgH;
    return {
      key: def.key,
      label: def.label,
      count,
      unitRateKgH,
      totalKgH,
      sharePercent: 0,
    };
  });

  const totalKgH = rows.reduce((sum, r) => sum + r.totalKgH, 0);
  const breakdown = rows.map((r) => ({
    ...r,
    sharePercent: totalKgH > 0 ? (r.totalKgH / totalKgH) * 100 : 0,
  }));

  return { totalKgH, breakdown };
}

interface VaporSpec {
  name: string;
  mw: number;
  // Antoine constants for log10(P_mmHg) = A - B / (T_C + C)
  A: number;
  B: number;
  C: number;
}

const VAPOR_SPECS: Record<Exclude<VaporSpeciesId, 'dry_air_only'>, VaporSpec> = {
  water: { name: 'Water Vapor (Steam)', mw: 18.015, A: 8.07131, B: 1730.63, C: 233.426 },
  methanol: { name: 'Methanol', mw: 32.04, A: 8.08097, B: 1582.271, C: 239.726 },
  toluene: { name: 'Toluene', mw: 92.14, A: 6.95464, B: 1344.8, C: 219.482 },
  n_hexane: { name: 'n-Hexane', mw: 86.18, A: 6.87601, B: 1171.17, C: 224.41 },
};

export function calcVaporCarryover(
  airMassKgH: number,
  pressureMbar: number,
  condenserTempC: number,
  speciesId: VaporSpeciesId,
  suctionTempC: number
): VaporCarryoverResult {
  const tempK = suctionTempC + 273.15;
  const airDensity = (pressureMbar * 100) / (R_AIR_SPECIFIC * tempK);

  if (speciesId === 'dry_air_only') {
    return {
      speciesName: 'Dry Air Only',
      vaporPressureMbar: 0,
      isChokedByVapor: false,
      vaporCarryoverKgH: 0,
      totalGasMassKgH: airMassKgH,
      totalActualFlowM3H: airMassKgH / airDensity,
    };
  }

  const spec = VAPOR_SPECS[speciesId];
  const pMmHg = Math.pow(10, spec.A - spec.B / (condenserTempC + spec.C));
  const pVapMbar = pMmHg / MBAR_TO_TORR;

  // If condenser vapor pressure approaches or exceeds operating total pressure, condenser cannot condense effectively
  const effectivePVap = Math.min(pVapMbar, pressureMbar * 0.92);
  const isChokedByVapor = pVapMbar >= pressureMbar * 0.92;

  const partialAirMbar = Math.max(0.05, pressureMbar - effectivePVap);
  const vaporCarryoverKgH = airMassKgH * (spec.mw / M_AIR) * (effectivePVap / partialAirMbar);

  const totalGasMassKgH = airMassKgH + vaporCarryoverKgH;
  // Dalton's law molar volume sum at total P, T
  const molarFlowTotalKmolH = airMassKgH / M_AIR + vaporCarryoverKgH / spec.mw;
  const totalActualFlowM3H = (molarFlowTotalKmolH * 8314.46 * tempK) / (pressureMbar * 100);

  return {
    speciesName: spec.name,
    vaporPressureMbar: pVapMbar,
    isChokedByVapor,
    vaporCarryoverKgH,
    totalGasMassKgH,
    totalActualFlowM3H,
  };
}

export function recommendVacuumTrain(
  pressureMbar: number,
  designActualFlowM3H: number,
  designAirKgH: number
): VacuumTrainRecommendation {
  // Heuristic shaft power estimate based on isothermal compression + typical mechanical efficiency
  const compressionRatio = P_ATM_MBAR / Math.max(0.1, pressureMbar);
  const isothermalKw =
    ((pressureMbar * 100 * (designActualFlowM3H / 3600)) * Math.log(compressionRatio)) / 1000;
  const estimatedPowerKw = Math.max(0.35, isothermalKw / 0.42);

  if (pressureMbar >= 120) {
    return {
      technology: 'Single-Stage Liquid Ring Pump',
      stages: '1-Stage LRVP',
      estimatedPowerKw,
      motiveSteamKgH: null,
      rationale: 'Rough vacuum regime (>120 mbar) suits robust single-stage liquid ring pumps with vapor tolerance.',
    };
  }
  if (pressureMbar >= 30) {
    return {
      technology: '2-Stage Liquid Ring Pump or Dry Screw',
      stages: '2-Stage LRVP / Dry Screw',
      estimatedPowerKw,
      motiveSteamKgH: null,
      rationale: 'Medium vacuum (30–120 mbar) matches 2-stage liquid ring or dry claw/screw pumps.',
    };
  }
  if (pressureMbar >= 4) {
    const steamEst = designAirKgH * (pressureMbar < 12 ? 9.5 : 6.2);
    return {
      technology: 'Dry Screw Pump or 2–3 Stage Steam Ejector',
      stages: 'Dry Screw / 2–3 Stage Ejector',
      estimatedPowerKw,
      motiveSteamKgH: steamEst,
      rationale: 'Fine vacuum (4–30 mbar); LRVP loses capacity to seal-fluid vapor pressure—use dry screw or multi-stage ejector.',
    };
  }
  if (pressureMbar >= 0.8) {
    const steamEst = designAirKgH * 15.0;
    return {
      technology: 'Roots Booster + Dry Screw Backing Pump',
      stages: 'Roots + Dry Screw (or 4-Stage Ejector)',
      estimatedPowerKw: estimatedPowerKw * 1.15,
      motiveSteamKgH: steamEst,
      rationale: 'Deep vacuum (0.8–4 mbar) requires high volumetric pumping speed via Roots blower + dry backing stage.',
    };
  }
  const steamEst = designAirKgH * 24.0;
  return {
    technology: 'Multi-Stage Roots Train or 4–5 Stage Steam Ejector',
    stages: '2× Roots + Dry Backing / 5-Stage Ejector',
    estimatedPowerKw: estimatedPowerKw * 1.35,
    motiveSteamKgH: steamEst,
    rationale: 'High vacuum (<0.8 mbar) demands multi-stage Roots boosters or 4–5 stage steam ejector with intercondensers.',
  };
}

export function calculateVacuumLeakage(inputs: SystemInputs): EstimationSummary {
  const vesselSpec = VESSEL_MATERIALS.find((m) => m.id === inputs.vesselMaterial) ?? VESSEL_MATERIALS[0];
  const gasketSpec = GASKET_MATERIALS.find((g) => g.id === inputs.gasketMaterial) ?? GASKET_MATERIALS[0];
  const integritySpec = INTEGRITY_CLASSES.find((c) => c.id === inputs.integrityClass) ?? INTEGRITY_CLASSES[0];

  const pressureMbar = Math.max(0.1, Math.min(980, inputs.pressureMbar));
  const volumeM3 = Math.max(0.05, inputs.volumeM3);
  const suctionTempK = inputs.suctionTempC + 273.15;

  const pressureTorr = pressureMbar * MBAR_TO_TORR;
  const pressureKpa = pressureMbar * 0.1;
  const volumeFt3 = volumeM3 * M3_TO_FT3;
  const airDensityKgM3 = (pressureMbar * 100) / (R_AIR_SPECIFIC * suctionTempK);
  const isSonicChoked = pressureMbar <= P_CRIT_MBAR;
  const orificeFlowFactor = getOrificeFlowFactor(pressureMbar);

  const materialMultiplier = vesselSpec.factor * gasketSpec.factor;
  const combinedMultiplier = materialMultiplier * integritySpec.factor;

  const heiBase = calcHEIAirLeakageKgH(volumeM3, pressureMbar);
  const sslBase = calcSeiderSeaderLewinKgH(volumeM3, pressureMbar);
  const rrBase = calcRyansRoperKgH(volumeM3, pressureMbar);

  const invResult = calcComponentInventoryBreakdown(
    inputs.componentCounts,
    pressureMbar,
    vesselSpec.factor,
    gasketSpec.factor,
    integritySpec.factor
  );

  const makeModelResult = (
    id: SizingMethodId,
    name: string,
    reference: string,
    baseKgH: number,
    adjKgH: number,
    note: string
  ): ModelResult => {
    const actualFlowM3H = adjKgH / airDensityKgM3;
    return {
      id,
      name,
      reference,
      baseAirKgH: baseKgH,
      adjustedAirKgH: adjKgH,
      adjustedAirLbH: adjKgH * KG_TO_LB,
      actualFlowM3H,
      actualFlowACFM: actualFlowM3H * M3H_TO_ACFM,
      applicabilityNote: note,
    };
  };

  const models: ModelResult[] = [
    makeModelResult(
      'hei',
      'HEI Standard Method',
      'Heat Exchange Institute',
      heiBase,
      heiBase * combinedMultiplier,
      'Industry standard for vacuum distillation design; scales as V^0.667 across tightness pressure tiers.'
    ),
    makeModelResult(
      'ssl',
      'Seider–Seader–Lewin / Ludwig',
      'Process Design Principles',
      sslBase,
      sslBase * combinedMultiplier,
      'Continuous log-polynomial correlation widely used in petrochemical column & ejector sizing.'
    ),
    makeModelResult(
      'ryans_roper',
      'Ryans & Roper Power Law',
      'Process Vacuum Design',
      rrBase,
      rrBase * combinedMultiplier,
      'Empirical power-law curve (P^0.25 · V^0.60) suited for operating industrial vacuum vessels.'
    ),
    makeModelResult(
      'component_inventory',
      'Component & Seal Inventory',
      "Perry's Ch. 10 / Fitting Count",
      invResult.totalKgH / Math.max(0.1, combinedMultiplier),
      invResult.totalKgH,
      'Bottom-up summation of flanges, valves, manways, and shaft seals under choked orifice flow.'
    ),
  ];

  const selectedModel = models.find((m) => m.id === inputs.primaryModel) ?? models[0];
  const designAirKgH = selectedModel.adjustedAirKgH * inputs.designMargin;
  const designAirLbH = designAirKgH * KG_TO_LB;
  const designActualFlowM3H = designAirKgH / airDensityKgM3;
  const designActualFlowACFM = designActualFlowM3H * M3H_TO_ACFM;

  const vaporCarryover = calcVaporCarryover(
    designAirKgH,
    pressureMbar,
    inputs.condenserTempC,
    inputs.vaporSpecies,
    inputs.suctionTempC
  );

  const recommendedTrain = recommendVacuumTrain(
    pressureMbar,
    vaporCarryover.totalActualFlowM3H,
    designAirKgH
  );

  // Rough pump-down time estimate from atmospheric to operating pressure: t = (V / S_eff) * ln(P_atm / P)
  // Assuming pump sized for 2.5x normal continuous air leakage actual volumetric flow (typical hogging/evacuation ratio)
  const effectivePumpSpeedM3H = Math.max(1.0, vaporCarryover.totalActualFlowM3H * 1.15);
  // Accounting for air in-leakage drag during evacuation (approx factor 1.18)
  const pumpDownMinutes = ((volumeM3 / effectivePumpSpeedM3H) * Math.log(P_ATM_MBAR / pressureMbar) * 60 * 1.18);

  return {
    pressureTorr,
    pressureKpa,
    volumeFt3,
    airDensityKgM3,
    isSonicChoked,
    orificeFlowFactor,
    materialMultiplier,
    combinedMultiplier,
    models,
    selectedModel,
    designAirKgH,
    designAirLbH,
    designActualFlowM3H,
    designActualFlowACFM,
    componentBreakdown: invResult.breakdown,
    vaporCarryover,
    recommendedTrain,
    pumpDownMinutes,
  };
}

export function generateCsvReport(inputs: SystemInputs, summary: EstimationSummary): string {
  const vessel = VESSEL_MATERIALS.find((m) => m.id === inputs.vesselMaterial)?.name ?? inputs.vesselMaterial;
  const gasket = GASKET_MATERIALS.find((g) => g.id === inputs.gasketMaterial)?.name ?? inputs.gasketMaterial;
  const integrity = INTEGRITY_CLASSES.find((i) => i.id === inputs.integrityClass)?.name ?? inputs.integrityClass;

  const lines: string[] = [
    'Vacuum Distillation Air Leakage & Equipment Sizing Report',
    `Generated,${new Date().toISOString()}`,
    '',
    'SYSTEM PARAMETERS',
    `Evacuated Volume (m3),${inputs.volumeM3.toFixed(3)}`,
    `Evacuated Volume (ft3),${summary.volumeFt3.toFixed(2)}`,
    `Operating Vacuum Pressure (mbar abs),${inputs.pressureMbar.toFixed(2)}`,
    `Operating Vacuum Pressure (Torr / mmHg),${summary.pressureTorr.toFixed(2)}`,
    `Suction Gas Temperature (C),${inputs.suctionTempC.toFixed(1)}`,
    `Vessel Material,"${vessel}"`,
    `Gasket / Seal Material,"${gasket}"`,
    `Integrity Class,"${integrity}"`,
    `Combined Material & Integrity Factor,${summary.combinedMultiplier.toFixed(3)}`,
    `Design Safety Margin,${inputs.designMargin.toFixed(2)}x`,
    `Flow Regime,${summary.isSonicChoked ? 'Choked Sonic Orifice (<535.3 mbar)' : 'Subsonic Compressible (>=535.3 mbar)'}`,
    '',
    'AIR LEAKAGE MODEL COMPARISON',
    'Model,Reference,Base Dry Air (kg/h),Material-Adjusted (kg/h),Material-Adjusted (lb/h),Actual Suction Flow (m3/h),Actual Suction Flow (ACFM)',
    ...summary.models.map(
      (m) =>
        `"${m.name}","${m.reference}",${m.baseAirKgH.toFixed(4)},${m.adjustedAirKgH.toFixed(4)},${m.adjustedAirLbH.toFixed(4)},${m.actualFlowM3H.toFixed(2)},${m.actualFlowACFM.toFixed(2)}`
    ),
    '',
    'DESIGN SIZING BASIS',
    `Primary Selected Model,"${summary.selectedModel.name}"`,
    `Design Dry Air Leakage (kg/h),${summary.designAirKgH.toFixed(3)}`,
    `Design Dry Air Leakage (lb/h),${summary.designAirLbH.toFixed(3)}`,
    `Dry Air Volumetric Flow (m3/h),${summary.designActualFlowM3H.toFixed(2)}`,
    `Overhead Vapor Species,"${summary.vaporCarryover.speciesName}"`,
    `Condenser Outlet Temperature (C),${inputs.condenserTempC.toFixed(1)}`,
    `Vapor Carryover with Air (kg/h),${summary.vaporCarryover.vaporCarryoverKgH.toFixed(3)}`,
    `Total Gas Load to Vacuum System (kg/h),${summary.vaporCarryover.totalGasMassKgH.toFixed(3)}`,
    `Total Suction Capacity Required (m3/h),${summary.vaporCarryover.totalActualFlowM3H.toFixed(2)}`,
    `Recommended Vacuum Train,"${summary.recommendedTrain.technology}"`,
    `Estimated Shaft Power (kW),${summary.recommendedTrain.estimatedPowerKw.toFixed(2)}`,
    '',
    'COMPONENT INVENTORY BREAKDOWN',
    'Component Type,Quantity,Leak Rate per Unit (kg/h),Total Leakage (kg/h),Share (%)',
    ...summary.componentBreakdown.map(
      (c) =>
        `"${c.label}",${c.count},${c.unitRateKgH.toFixed(4)},${c.totalKgH.toFixed(4)},${c.sharePercent.toFixed(1)}`
    ),
  ];

  return lines.join('\n');
}
