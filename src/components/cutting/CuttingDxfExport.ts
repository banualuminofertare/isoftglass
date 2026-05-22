import { CuttingResult } from '@/lib/cutting/guillotineCut';
import { createDxfDocument, DXF_COLORS, DxfVersion } from '@/lib/dxf/dxfCore';

const SHEET_GAP = 50; // mm gap between sheets vertically

export function exportCuttingDxf(result: CuttingResult, sheetName: string, version: DxfVersion = 'R2010') {
  const doc = createDxfDocument(version);
  doc.addLayer({ name: 'SHEET', color: DXF_COLORS.WHITE, lineWeight: 35 });
  doc.addLayer({ name: 'PANEL', color: DXF_COLORS.GREEN, lineWeight: 25 });
  doc.addLayer({ name: 'DIMS', color: DXF_COLORS.CYAN, lineWeight: 15 });

  let offsetY = 0;

  result.sheets.forEach((sheet, si) => {
    // Sheet border (LWPOLYLINE)
    doc.addRect(0, offsetY, result.sheetWidth, result.sheetHeight, 'SHEET');

    // Sheet label
    doc.addText(0, offsetY - 15, 8, `Coala ${si + 1} / ${result.totalSheets} — ${sheetName}`, 'DIMS');

    // Panels
    sheet.panels.forEach(p => {
      doc.addRect(p.x, offsetY + p.y, p.w, p.h, 'PANEL');
      // Label inside panel
      doc.addText(p.x + p.w / 2 - 20, offsetY + p.y + p.h / 2 - 4, 6, p.label, 'DIMS');
      // Dimensions
      doc.addText(
        p.x + p.w / 2 - 20,
        offsetY + p.y + p.h / 2 + 4,
        5,
        `${p.w}x${p.h}${p.rotated ? ' R' : ''}`,
        'DIMS'
      );
    });

    offsetY += result.sheetHeight + SHEET_GAP;
  });

  const dxfContent = doc.toString();
  const blob = new Blob([dxfContent], { type: 'application/dxf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `debitare-${sheetName.toLowerCase().replace(/\s+/g, '-')}.dxf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
