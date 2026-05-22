import jsPDF from 'jspdf';
import { CuttingResult } from '@/lib/cutting/guillotineCut';

const COLORS = [
  [180, 210, 240], [170, 220, 190], [240, 220, 170],
  [210, 180, 220], [240, 180, 180], [180, 220, 210],
  [230, 230, 170], [220, 180, 210], [190, 220, 180],
  [190, 200, 230],
];

export function exportCuttingPdf(result: CuttingResult, sheetName: string) {
  const doc = new jsPDF('landscape', 'mm', 'a4');
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 15;

  result.sheets.forEach((sheet, si) => {
    if (si > 0) doc.addPage();

    // Title
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`Plan Debitare — ${sheetName}`, margin, margin);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Coala ${si + 1} / ${result.totalSheets} — ${sheet.panels.length} panouri`, margin, margin + 7);

    const sheetArea = result.sheetWidth * result.sheetHeight;
    const wastePercent = Math.round(((sheetArea - sheet.usedArea) / sheetArea) * 10000) / 100;
    doc.text(`Pierderi coală: ${wastePercent}% | Dimensiune coală: ${result.sheetWidth} × ${result.sheetHeight} mm`, margin, margin + 13);

    // Draw sheet
    const drawY = margin + 20;
    const availW = pageW - margin * 2;
    const availH = pageH - drawY - margin - 25;
    const scale = Math.min(availW / result.sheetWidth, availH / result.sheetHeight);
    const sw = result.sheetWidth * scale;
    const sh = result.sheetHeight * scale;
    const ox = margin + (availW - sw) / 2;

    // Sheet border
    doc.setDrawColor(100);
    doc.setLineWidth(0.5);
    doc.rect(ox, drawY, sw, sh);

    // Panels
    sheet.panels.forEach((p, pi) => {
      const px = ox + p.x * scale;
      const py = drawY + p.y * scale;
      const pw = p.w * scale;
      const ph = p.h * scale;
      const c = COLORS[pi % COLORS.length];

      doc.setFillColor(c[0], c[1], c[2]);
      doc.setDrawColor(50);
      doc.setLineWidth(0.3);
      doc.rect(px, py, pw, ph, 'FD');

      const fontSize = Math.min(pw, ph) > 15 ? 7 : 5;
      doc.setFontSize(fontSize);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30);
      doc.text(p.label, px + pw / 2, py + ph / 2 - 1, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(fontSize * 0.85);
      doc.text(`${p.w}×${p.h}${p.rotated ? ' ↻' : ''}`, px + pw / 2, py + ph / 2 + fontSize * 0.5, { align: 'center' });
    });

    // Dimension labels
    doc.setFontSize(9);
    doc.setTextColor(0);
    doc.text(`${result.sheetWidth} mm`, ox + sw / 2, drawY - 3, { align: 'center' });
    doc.text(`${result.sheetHeight} mm`, ox - 5, drawY + sh / 2, { angle: 90 });

    // Panel list table at bottom
    const tableY = drawY + sh + 8;
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text('Nr.', margin, tableY);
    doc.text('Etichetă', margin + 8, tableY);
    doc.text('Dimensiuni (mm)', margin + 60, tableY);
    doc.text('Rotit', margin + 110, tableY);

    doc.setFont('helvetica', 'normal');
    sheet.panels.forEach((p, pi) => {
      const y = tableY + 4 + pi * 3.5;
      if (y > pageH - margin) return;
      doc.text(`${pi + 1}`, margin, y);
      doc.text(p.label, margin + 8, y);
      doc.text(`${p.w} × ${p.h}`, margin + 60, y);
      doc.text(p.rotated ? 'Da' : 'Nu', margin + 110, y);
    });
  });

  // Summary on last page
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  const sumY = pageH - margin - 5;
  doc.text(`Total: ${result.totalSheets} coli | Pierderi totale: ${result.totalWastePercent}%`, margin, sumY);

  doc.save(`plan-debitare-${sheetName.toLowerCase().replace(/\s+/g, '-')}.pdf`);
}
