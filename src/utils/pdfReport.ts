import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  EstimationSummary,
  GASKET_MATERIALS,
  INTEGRITY_CLASSES,
  SystemInputs,
  VESSEL_MATERIALS,
} from './vacuumLeakage';

type DocWithAutoTable = jsPDF & {
  lastAutoTable?: {
    finalY: number;
  };
};

function getLastY(doc: jsPDF, fallbackY: number): number {
  const typed = doc as DocWithAutoTable;
  return typed.lastAutoTable?.finalY ?? fallbackY;
}

export function exportSizingPdfReport(
  inputs: SystemInputs,
  summary: EstimationSummary
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const vesselSpec =
    VESSEL_MATERIALS.find((m) => m.id === inputs.vesselMaterial) ??
    VESSEL_MATERIALS[0];
  const gasketSpec =
    GASKET_MATERIALS.find((g) => g.id === inputs.gasketMaterial) ??
    GASKET_MATERIALS[0];
  const integritySpec =
    INTEGRITY_CLASSES.find((c) => c.id === inputs.integrityClass) ??
    INTEGRITY_CLASSES[0];

  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 14;
  const contentWidth = pageWidth - marginX * 2;
  const generatedAt = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';

  // Header Banner
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Vacuum Distillation Air Leakage Report', marginX, 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(203, 213, 225);
  doc.text(
    'Air In-Leakage Estimation & Vacuum System Sizing Datasheet',
    marginX,
    17.5
  );

  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(`Generated: ${generatedAt}`, pageWidth - marginX, 11, {
    align: 'right',
  });
  doc.text(
    `Primary Basis: ${summary.selectedModel.name}`,
    pageWidth - marginX,
    17.5,
    { align: 'right' }
  );

  // KPI Highlight Strip
  let y = 34;
  const kpiW = (contentWidth - 9) / 4;
  const kpis = [
    {
      label: 'DESIGN AIR LEAKAGE',
      value: `${summary.designAirKgH.toFixed(2)} kg/h`,
      sub: `${summary.designAirLbH.toFixed(2)} lb/h (${inputs.designMargin.toFixed(2)}x)`,
    },
    {
      label: 'TOTAL SUCTION CAPACITY',
      value: `${summary.vaporCarryover.totalActualFlowM3H.toFixed(1)} m3/h`,
      sub: `${(summary.vaporCarryover.totalActualFlowM3H * 0.58858).toFixed(1)} ACFM (incl. vapor)`,
    },
    {
      label: 'FLOW REGIME',
      value: summary.isSonicChoked ? 'Sonic Choked' : 'Subsonic',
      sub: `rho = ${summary.airDensityKgM3.toFixed(4)} kg/m3 | Phi = ${summary.orificeFlowFactor.toFixed(2)}`,
    },
    {
      label: 'RECOMMENDED TRAIN',
      value: summary.recommendedTrain.stages,
      sub: `Est. ${summary.recommendedTrain.estimatedPowerKw.toFixed(1)} kW shaft`,
    },
  ];

  kpis.forEach((kpi, idx) => {
    const x = marginX + idx * (kpiW + 3);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, y, kpiW, 20, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(100, 116, 139);
    doc.text(kpi.label, x + 3, y + 5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42);
    doc.text(kpi.value, x + 3, y + 12, { maxWidth: kpiW - 6 });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(71, 85, 105);
    doc.text(kpi.sub, x + 3, y + 17, { maxWidth: kpiW - 6 });
  });

  // Section 1: System & Material Parameters
  y += 27;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text('1. Process Conditions & Construction Materials', marginX, y);

  autoTable(doc, {
    startY: y + 3,
    margin: { left: marginX, right: marginX },
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 8,
      cellPadding: 2.2,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: [241, 245, 249],
      textColor: [51, 65, 85],
      fontStyle: 'bold',
    },
    head: [['Parameter', 'Value', 'Material / Integrity Spec', 'Factor / Value']],
    body: [
      [
        'Evacuated System Volume',
        `${inputs.volumeM3.toFixed(2)} m3 (${summary.volumeFt3.toFixed(1)} ft3)`,
        'Vessel & Piping Material',
        `${vesselSpec.name} (${vesselSpec.factor.toFixed(2)}x)`,
      ],
      [
        'Operating Suction Pressure',
        `${inputs.pressureMbar.toFixed(2)} mbar abs (${summary.pressureTorr.toFixed(2)} Torr)`,
        'Gasket / Flange Seal',
        `${gasketSpec.name} (${gasketSpec.factor.toFixed(2)}x)`,
      ],
      [
        'Suction Gas Temperature',
        `${inputs.suctionTempC.toFixed(1)} deg C (${(inputs.suctionTempC + 273.15).toFixed(1)} K)`,
        'Mechanical Integrity Class',
        `${integritySpec.name} (${integritySpec.factor.toFixed(2)}x)`,
      ],
      [
        'Air Density at Suction',
        `${summary.airDensityKgM3.toFixed(4)} kg/m3`,
        'Combined Material Multiplier',
        `${summary.combinedMultiplier.toFixed(3)}x`,
      ],
    ],
  });

  // Section 2: Model Comparison Table
  y = getLastY(doc, y + 32) + 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text('2. Industry-Standard Air Leakage Model Comparison', marginX, y);

  autoTable(doc, {
    startY: y + 3,
    margin: { left: marginX, right: marginX },
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 8,
      cellPadding: 2.3,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: [241, 245, 249],
      textColor: [51, 65, 85],
      fontStyle: 'bold',
    },
    columnStyles: {
      2: { halign: 'right' },
      3: { halign: 'right', fontStyle: 'bold' },
      4: { halign: 'right' },
      5: { halign: 'right', fontStyle: 'bold' },
      6: { halign: 'right' },
    },
    head: [
      [
        'Model',
        'Reference',
        'Base (kg/h)',
        'Adj. (kg/h)',
        'Adj. (lb/h)',
        'Flow (m3/h)',
        'Flow (ACFM)',
      ],
    ],
    body: summary.models.map((m) => [
      m.id === inputs.primaryModel ? `${m.name} [SELECTED]` : m.name,
      m.reference,
      m.baseAirKgH.toFixed(3),
      m.adjustedAirKgH.toFixed(3),
      m.adjustedAirLbH.toFixed(3),
      m.actualFlowM3H.toFixed(1),
      m.actualFlowACFM.toFixed(1),
    ]),
    didParseCell: (data) => {
      if (
        data.section === 'body' &&
        summary.models[data.row.index]?.id === inputs.primaryModel
      ) {
        data.cell.styles.fillColor = [240, 249, 255];
      }
    },
  });

  // Section 3: Auxiliary Equipment Sizing & Condenser Carryover
  y = getLastY(doc, y + 36) + 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text('3. Vacuum System & Auxiliary Equipment Sizing Basis', marginX, y);

  const steamText =
    summary.recommendedTrain.motiveSteamKgH !== null
      ? `~${summary.recommendedTrain.motiveSteamKgH.toFixed(0)} kg/h motive steam (if steam ejector)`
      : 'Mechanical pump recommended';

  autoTable(doc, {
    startY: y + 3,
    margin: { left: marginX, right: marginX },
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 8,
      cellPadding: 2.2,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: [241, 245, 249],
      textColor: [51, 65, 85],
      fontStyle: 'bold',
    },
    head: [['Sizing Metric', 'Calculated Value', 'Engineering Context']],
    body: [
      [
        'Design Dry Air Leakage',
        `${summary.designAirKgH.toFixed(3)} kg/h (${summary.designAirLbH.toFixed(3)} lb/h)`,
        `${summary.selectedModel.name} x ${inputs.designMargin.toFixed(2)}x design safety margin`,
      ],
      [
        'Vent Condenser Vapor Carryover',
        `${summary.vaporCarryover.vaporCarryoverKgH.toFixed(3)} kg/h`,
        `${summary.vaporCarryover.speciesName} at ${inputs.condenserTempC.toFixed(1)} deg C (P_vap = ${summary.vaporCarryover.vaporPressureMbar.toFixed(1)} mbar)`,
      ],
      [
        'Total Gas Load & Suction Volume',
        `${summary.vaporCarryover.totalGasMassKgH.toFixed(3)} kg/h | ${summary.vaporCarryover.totalActualFlowM3H.toFixed(1)} m3/h`,
        `${(summary.vaporCarryover.totalActualFlowM3H * 0.58858).toFixed(1)} ACFM total non-condensable + saturated vapor`,
      ],
      [
        'Estimated Evacuation Pump-Down',
        `${summary.pumpDownMinutes.toFixed(0)} min`,
        `1013.25 mbar -> ${inputs.pressureMbar.toFixed(1)} mbar for ${inputs.volumeM3.toFixed(2)} m3`,
      ],
      [
        'Recommended Vacuum Train',
        summary.recommendedTrain.technology,
        `Est. Shaft Power: ${summary.recommendedTrain.estimatedPowerKw.toFixed(1)} kW | ${steamText}`,
      ],
    ],
  });

  // Section 4: Component Inventory Breakdown
  y = getLastY(doc, y + 40) + 8;
  if (y > 235) {
    doc.addPage();
    y = 18;
  }
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text('4. Component & Seal Inventory Leakage Breakdown', marginX, y);

  autoTable(doc, {
    startY: y + 3,
    margin: { left: marginX, right: marginX },
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 8,
      cellPadding: 2.1,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: [241, 245, 249],
      textColor: [51, 65, 85],
      fontStyle: 'bold',
    },
    columnStyles: {
      1: { halign: 'right' },
      2: { halign: 'right' },
      3: { halign: 'right', fontStyle: 'bold' },
      4: { halign: 'right' },
    },
    head: [
      [
        'Component / Seal Type',
        'Quantity',
        'Unit Rate (kg/h)',
        'Total (kg/h)',
        'Share (%)',
      ],
    ],
    body: summary.componentBreakdown.map((c) => [
      c.label,
      String(c.count),
      c.unitRateKgH.toFixed(4),
      c.totalKgH.toFixed(4),
      `${c.sharePercent.toFixed(1)}%`,
    ]),
  });

  // Engineering Notes & Page Footers
  const notesY = getLastY(doc, y + 45) + 7;
  if (notesY < 275) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(
      'Basis Notes: Orifice air in-leakage is sonic-choked below P_crit = 535.3 mbar (Phi = 1.0) and scales via isentropic compressible flow above 535.3 mbar. Volumetric suction capacity uses Ideal Gas Law at suction P and T.',
      marginX,
      notesY,
      { maxWidth: contentWidth }
    );
  }

  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Vacuum Distillation Sizing Report  |  Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 8,
      { align: 'center' }
    );
  }

  doc.save(
    `vacuum-leakage-report-${inputs.volumeM3}m3-${inputs.pressureMbar}mbar.pdf`
  );
}
