/**
 * DXF Core Module — Multi-version support
 * Supports R12 (AC1009), R2000 (AC1015), R2010 (AC1024)
 * Compatible with AutoCAD, Intermac, Bottero, Bavelloni, DraftSight, LibreCAD
 */

// ── Types ──

export type DxfVersion = 'R12' | 'R2000' | 'R2010';

const ACADVER_MAP: Record<DxfVersion, string> = {
  R12: 'AC1009',
  R2000: 'AC1015',
  R2010: 'AC1024',
};

export interface DxfLayer {
  name: string;
  color: number;
  lineWeight: number;
  lineType?: string;
}

export interface DxfVertex {
  x: number;
  y: number;
  bulge?: number;
}

export interface DxfDocument {
  addLayer(layer: DxfLayer): void;
  addLwPolyline(vertices: DxfVertex[], closed: boolean, layer: string): void;
  addLine(x1: number, y1: number, x2: number, y2: number, layer: string): void;
  addCircle(cx: number, cy: number, radius: number, layer: string): void;
  addArc(cx: number, cy: number, radius: number, startAngle: number, endAngle: number, layer: string): void;
  addText(x: number, y: number, height: number, text: string, layer: string): void;
  addRect(x: number, y: number, w: number, h: number, layer: string): void;
  addStadiumCutout(vertices: DxfVertex[], layer: string): void;
  toString(): string;
}

// ── Standard colors ──
export const DXF_COLORS = {
  WHITE: 7,
  RED: 1,
  YELLOW: 2,
  GREEN: 3,
  CYAN: 4,
  BLUE: 5,
  MAGENTA: 6,
  GRAY: 8,
  LIGHT_GRAY: 9,
} as const;

// ── Bulge helpers ──

export function bulge90(): number {
  return Math.tan(Math.PI / 8);
}

export function bulgeFromAngle(angleDeg: number): number {
  return Math.tan((angleDeg * Math.PI) / (180 * 4));
}

// ── Handle Manager ──

let _handle = 0x100;
function nextHandle(): string {
  return (_handle++).toString(16).toUpperCase();
}

// ── R12 polyline builder (POLYLINE/VERTEX/SEQEND) ──

function buildR12Polyline(vertices: DxfVertex[], closed: boolean, layer: string): string {
  const lines = [
    '0', 'POLYLINE',
    '8', layer,
    '66', '1',
    '70', closed ? '1' : '0',
  ];
  for (const v of vertices) {
    lines.push('0', 'VERTEX', '8', layer);
    lines.push('10', v.x.toFixed(4), '20', v.y.toFixed(4), '30', '0.0');
    if (v.bulge !== undefined && v.bulge !== 0) {
      lines.push('42', v.bulge.toFixed(6));
    }
  }
  lines.push('0', 'SEQEND', '8', layer);
  return lines.join('\n');
}

// ── R2000+ LWPOLYLINE builder ──

function buildLwPolyline(vertices: DxfVertex[], closed: boolean, layer: string, useHandles: boolean): string {
  const lines = [
    '0', 'LWPOLYLINE',
    ...(useHandles ? ['5', nextHandle()] : []),
    '100', 'AcDbEntity',
    '8', layer,
    '100', 'AcDbPolyline',
    '90', vertices.length.toString(),
    '70', closed ? '1' : '0',
    '43', '0.0',
  ];
  for (const v of vertices) {
    lines.push('10', v.x.toFixed(4), '20', v.y.toFixed(4));
    if (v.bulge !== undefined && v.bulge !== 0) {
      lines.push('42', v.bulge.toFixed(6));
    }
  }
  return lines.join('\n');
}

// ── Builder ──

export function createDxfDocument(version: DxfVersion = 'R2010'): DxfDocument {
  _handle = 0x100;
  const isR12 = version === 'R12';
  const useHandles = !isR12;

  const layers: DxfLayer[] = [];
  const entities: string[] = [];
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  function trackPoint(x: number, y: number) {
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }

  function addLayer(layer: DxfLayer) {
    layers.push(layer);
  }

  function addLwPolyline(vertices: DxfVertex[], closed: boolean, layer: string) {
    vertices.forEach(v => trackPoint(v.x, v.y));
    if (isR12) {
      entities.push(buildR12Polyline(vertices, closed, layer));
    } else {
      entities.push(buildLwPolyline(vertices, closed, layer, useHandles));
    }
  }

  function addLine(x1: number, y1: number, x2: number, y2: number, layer: string) {
    trackPoint(x1, y1);
    trackPoint(x2, y2);
    if (isR12) {
      entities.push(['0', 'LINE', '8', layer,
        '10', x1.toFixed(4), '20', y1.toFixed(4), '30', '0.0',
        '11', x2.toFixed(4), '21', y2.toFixed(4), '31', '0.0',
      ].join('\n'));
    } else {
      entities.push(['0', 'LINE',
        '5', nextHandle(),
        '100', 'AcDbEntity', '8', layer,
        '100', 'AcDbLine',
        '10', x1.toFixed(4), '20', y1.toFixed(4), '30', '0.0',
        '11', x2.toFixed(4), '21', y2.toFixed(4), '31', '0.0',
      ].join('\n'));
    }
  }

  function addCircle(cx: number, cy: number, radius: number, layer: string) {
    trackPoint(cx - radius, cy - radius);
    trackPoint(cx + radius, cy + radius);
    if (isR12) {
      entities.push(['0', 'CIRCLE', '8', layer,
        '10', cx.toFixed(4), '20', cy.toFixed(4), '30', '0.0',
        '40', radius.toFixed(4),
      ].join('\n'));
    } else {
      entities.push(['0', 'CIRCLE',
        '5', nextHandle(),
        '100', 'AcDbEntity', '8', layer,
        '100', 'AcDbCircle',
        '10', cx.toFixed(4), '20', cy.toFixed(4), '30', '0.0',
        '40', radius.toFixed(4),
      ].join('\n'));
    }
  }

  function addArc(cx: number, cy: number, radius: number, startAngle: number, endAngle: number, layer: string) {
    trackPoint(cx - radius, cy - radius);
    trackPoint(cx + radius, cy + radius);
    if (isR12) {
      entities.push(['0', 'ARC', '8', layer,
        '10', cx.toFixed(4), '20', cy.toFixed(4), '30', '0.0',
        '40', radius.toFixed(4),
        '50', startAngle.toFixed(4), '51', endAngle.toFixed(4),
      ].join('\n'));
    } else {
      entities.push(['0', 'ARC',
        '5', nextHandle(),
        '100', 'AcDbEntity', '8', layer,
        '100', 'AcDbCircle',
        '10', cx.toFixed(4), '20', cy.toFixed(4), '30', '0.0',
        '40', radius.toFixed(4),
        '100', 'AcDbArc',
        '50', startAngle.toFixed(4), '51', endAngle.toFixed(4),
      ].join('\n'));
    }
  }

  function addText(x: number, y: number, height: number, text: string, layer: string) {
    trackPoint(x, y);
    if (isR12) {
      entities.push(['0', 'TEXT', '8', layer,
        '10', x.toFixed(4), '20', y.toFixed(4), '30', '0.0',
        '40', height.toFixed(4),
        '1', text,
      ].join('\n'));
    } else {
      entities.push(['0', 'TEXT',
        '5', nextHandle(),
        '100', 'AcDbEntity', '8', layer,
        '100', 'AcDbText',
        '10', x.toFixed(4), '20', y.toFixed(4), '30', '0.0',
        '40', height.toFixed(4),
        '1', text,
        '100', 'AcDbText',
      ].join('\n'));
    }
  }

  function addRect(x: number, y: number, w: number, h: number, layer: string) {
    addLwPolyline([
      { x, y },
      { x: x + w, y },
      { x: x + w, y: y + h },
      { x, y: y + h },
    ], true, layer);
  }

  function addStadiumCutout(vertices: DxfVertex[], layer: string) {
    addLwPolyline(vertices, true, layer);
  }

  // ── Section builders ──

  function buildHeader(): string {
    const eMinX = minX === Infinity ? 0 : minX;
    const eMinY = minY === Infinity ? 0 : minY;
    const eMaxX = maxX === -Infinity ? 1000 : maxX;
    const eMaxY = maxY === -Infinity ? 1000 : maxY;
    const acadVer = ACADVER_MAP[version];

    if (isR12) {
      return [
        '0', 'SECTION', '2', 'HEADER',
        '9', '$ACADVER', '1', acadVer,
        '9', '$INSUNITS', '70', '4',
        '9', '$EXTMIN',
        '10', eMinX.toFixed(4), '20', eMinY.toFixed(4), '30', '0.0',
        '9', '$EXTMAX',
        '10', eMaxX.toFixed(4), '20', eMaxY.toFixed(4), '30', '0.0',
        '0', 'ENDSEC',
      ].join('\n');
    }

    return [
      '0', 'SECTION', '2', 'HEADER',
      '9', '$ACADVER', '1', acadVer,
      '9', '$INSUNITS', '70', '4',
      '9', '$EXTMIN',
      '10', eMinX.toFixed(4), '20', eMinY.toFixed(4), '30', '0.0',
      '9', '$EXTMAX',
      '10', eMaxX.toFixed(4), '20', eMaxY.toFixed(4), '30', '0.0',
      '9', '$LIMMIN',
      '10', eMinX.toFixed(4), '20', eMinY.toFixed(4),
      '9', '$LIMMAX',
      '10', eMaxX.toFixed(4), '20', eMaxY.toFixed(4),
      '0', 'ENDSEC',
    ].join('\n');
  }

  function buildTables(): string {
    if (isR12) {
      const parts: string[] = ['0', 'SECTION', '2', 'TABLES'];
      // Simple LTYPE
      parts.push('0', 'TABLE', '2', 'LTYPE', '70', '1',
        '0', 'LTYPE', '2', 'CONTINUOUS', '70', '0', '3', 'Solid line', '72', '65', '73', '0', '40', '0.0',
        '0', 'ENDTAB');
      // LAYER
      const allLayers = layers.length > 0 ? layers : [{ name: '0', color: 7, lineWeight: 25 }];
      parts.push('0', 'TABLE', '2', 'LAYER', '70', allLayers.length.toString());
      for (const l of allLayers) {
        parts.push('0', 'LAYER', '2', l.name, '70', '0', '62', l.color.toString(), '6', l.lineType || 'CONTINUOUS');
      }
      parts.push('0', 'ENDTAB');
      parts.push('0', 'ENDSEC');
      return parts.join('\n');
    }

    // R2000 / R2010
    const parts: string[] = ['0', 'SECTION', '2', 'TABLES'];

    // VPORT
    parts.push('0', 'TABLE', '2', 'VPORT', '5', nextHandle(), '70', '1',
      '0', 'VPORT', '5', nextHandle(), '2', '*ACTIVE', '70', '0',
      '10', '0.0', '20', '0.0', '11', '1.0', '21', '1.0',
      '40', '1000.0', '41', '1.5',
      '0', 'ENDTAB');

    // LTYPE
    parts.push('0', 'TABLE', '2', 'LTYPE', '5', nextHandle(), '70', '2',
      '0', 'LTYPE', '5', nextHandle(), '2', 'CONTINUOUS', '70', '0', '3', 'Solid line', '72', '65', '73', '0', '40', '0.0',
      '0', 'LTYPE', '5', nextHandle(), '2', 'DASHED', '70', '0', '3', 'Dashed line', '72', '65', '73', '2', '40', '6.0',
      '49', '3.0', '74', '0', '49', '-3.0', '74', '0',
      '0', 'ENDTAB');

    // LAYER
    const allLayers = layers.length > 0 ? layers : [{ name: '0', color: 7, lineWeight: 25 }];
    parts.push('0', 'TABLE', '2', 'LAYER', '5', nextHandle(), '70', allLayers.length.toString());
    for (const l of allLayers) {
      parts.push('0', 'LAYER', '5', nextHandle(),
        '100', 'AcDbTableRecord', '100', 'AcDbLayerTableRecord',
        '2', l.name, '70', '0', '62', l.color.toString(),
        '6', l.lineType || 'CONTINUOUS', '370', l.lineWeight.toString());
    }
    parts.push('0', 'ENDTAB');

    // STYLE
    parts.push('0', 'TABLE', '2', 'STYLE', '5', nextHandle(), '70', '1',
      '0', 'STYLE', '5', nextHandle(),
      '100', 'AcDbTableRecord', '100', 'AcDbTextStyleTableRecord',
      '2', 'STANDARD', '70', '0', '40', '0.0', '41', '1.0', '3', 'txt',
      '0', 'ENDTAB');

    parts.push('0', 'ENDSEC');
    return parts.join('\n');
  }

  function buildBlocks(): string {
    if (isR12) {
      return ['0', 'SECTION', '2', 'BLOCKS', '0', 'ENDSEC'].join('\n');
    }
    return [
      '0', 'SECTION', '2', 'BLOCKS',
      '0', 'BLOCK', '5', nextHandle(),
      '100', 'AcDbEntity', '8', '0', '100', 'AcDbBlockBegin',
      '2', '*MODEL_SPACE', '70', '0', '10', '0.0', '20', '0.0', '30', '0.0',
      '0', 'ENDBLK', '5', nextHandle(),
      '100', 'AcDbEntity', '8', '0', '100', 'AcDbBlockEnd',
      '0', 'BLOCK', '5', nextHandle(),
      '100', 'AcDbEntity', '8', '0', '100', 'AcDbBlockBegin',
      '2', '*PAPER_SPACE', '70', '0', '10', '0.0', '20', '0.0', '30', '0.0',
      '0', 'ENDBLK', '5', nextHandle(),
      '100', 'AcDbEntity', '8', '0', '100', 'AcDbBlockEnd',
      '0', 'ENDSEC',
    ].join('\n');
  }

  function buildEntities(): string {
    return ['0', 'SECTION', '2', 'ENTITIES', ...entities, '0', 'ENDSEC'].join('\n');
  }

  function buildObjects(): string {
    if (isR12) return '';
    const dictHandle = nextHandle();
    return [
      '0', 'SECTION', '2', 'OBJECTS',
      '0', 'DICTIONARY', '5', dictHandle, '100', 'AcDbDictionary', '281', '1',
      '0', 'ENDSEC',
    ].join('\n');
  }

  return {
    addLayer,
    addLwPolyline,
    addLine,
    addCircle,
    addArc,
    addText,
    addRect,
    addStadiumCutout,
    toString() {
      const sections = [buildHeader(), buildTables(), buildBlocks(), buildEntities()];
      const obj = buildObjects();
      if (obj) sections.push(obj);
      sections.push('0\nEOF');
      return sections.join('\n');
    },
  };
}

// ── Download helper ──

export function downloadDxfFile(content: string, filename: string) {
  const blob = new Blob([content], { type: 'application/dxf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.dxf') ? filename : `${filename}.dxf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
