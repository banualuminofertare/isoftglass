/**
 * Minimal DXF parser — extracts CIRCLE, LINE, LWPOLYLINE, ARC entities
 * from the ENTITIES section of a DXF file (text-based, AC1015+).
 */

export interface DxfCircle {
  type: 'CIRCLE';
  x: number;
  y: number;
  radius: number;
  layer?: string;
}

export interface DxfLine {
  type: 'LINE';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  layer?: string;
}

export interface DxfArc {
  type: 'ARC';
  x: number;
  y: number;
  radius: number;
  startAngle: number; // degrees
  endAngle: number;
  layer?: string;
}

export interface DxfVertex {
  x: number;
  y: number;
  bulge: number;
}

export interface DxfLwPolyline {
  type: 'LWPOLYLINE';
  closed: boolean;
  vertices: DxfVertex[];
  layer?: string;
}

export type DxfEntity = DxfCircle | DxfLine | DxfArc | DxfLwPolyline;

/** Parse a DXF text file and return entities */
export function parseDxf(content: string): DxfEntity[] {
  const lines = content.split(/\r?\n/);
  const entities: DxfEntity[] = [];

  // Find ENTITIES section
  let i = 0;
  while (i < lines.length) {
    if (lines[i].trim() === 'ENTITIES') break;
    i++;
  }
  if (i >= lines.length) return entities;
  i++; // skip ENTITIES line

  while (i < lines.length - 1) {
    const code = parseInt(lines[i].trim(), 10);
    const value = lines[i + 1]?.trim() ?? '';

    if (code === 0 && value === 'ENDSEC') break;

    if (code === 0) {
      const entityType = value;
      i += 2;
      const entityLines: Array<{ code: number; value: string }> = [];

      // Collect all group codes until next entity (code 0)
      while (i < lines.length - 1) {
        const c = parseInt(lines[i].trim(), 10);
        if (isNaN(c)) { i++; continue; }
        const v = lines[i + 1]?.trim() ?? '';
        if (c === 0) break; // next entity
        entityLines.push({ code: c, value: v });
        i += 2;
      }

      const entity = parseEntity(entityType, entityLines);
      if (entity) entities.push(entity);
    } else {
      i += 2;
    }
  }

  return entities;
}

function parseEntity(
  type: string,
  groups: Array<{ code: number; value: string }>
): DxfEntity | null {
  const get = (code: number) => {
    const g = groups.find(g => g.code === code);
    return g ? g.value : undefined;
  };
  const getNum = (code: number, def = 0) => {
    const v = get(code);
    return v !== undefined ? parseFloat(v) : def;
  };
  const getAll = (code: number) => groups.filter(g => g.code === code).map(g => g.value);
  const layer = get(8);

  switch (type) {
    case 'CIRCLE':
      return {
        type: 'CIRCLE',
        x: getNum(10),
        y: getNum(20),
        radius: getNum(40),
        layer,
      };

    case 'LINE':
      return {
        type: 'LINE',
        x1: getNum(10),
        y1: getNum(20),
        x2: getNum(11),
        y2: getNum(21),
        layer,
      };

    case 'ARC':
      return {
        type: 'ARC',
        x: getNum(10),
        y: getNum(20),
        radius: getNum(40),
        startAngle: getNum(50),
        endAngle: getNum(51),
        layer,
      };

    case 'LWPOLYLINE': {
      // LWPOLYLINE stores vertices as repeated group codes 10/20/42
      const xs = getAll(10).map(Number);
      const ys = getAll(20).map(Number);
      const bulges = getAll(42).map(Number);
      const closed = (parseInt(get(70) ?? '0', 10) & 1) !== 0;

      const vertices: DxfVertex[] = xs.map((x, idx) => ({
        x,
        y: ys[idx] ?? 0,
        bulge: bulges[idx] ?? 0,
      }));

      if (vertices.length < 2) return null;

      return {
        type: 'LWPOLYLINE',
        closed,
        vertices,
        layer,
      };
    }

    default:
      return null;
  }
}

/** Get bounding box of all entities */
export function getEntitiesBounds(entities: DxfEntity[]): {
  minX: number; minY: number; maxX: number; maxY: number;
  width: number; height: number;
} {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  for (const e of entities) {
    switch (e.type) {
      case 'CIRCLE':
        minX = Math.min(minX, e.x - e.radius);
        minY = Math.min(minY, e.y - e.radius);
        maxX = Math.max(maxX, e.x + e.radius);
        maxY = Math.max(maxY, e.y + e.radius);
        break;
      case 'LINE':
        minX = Math.min(minX, e.x1, e.x2);
        minY = Math.min(minY, e.y1, e.y2);
        maxX = Math.max(maxX, e.x1, e.x2);
        maxY = Math.max(maxY, e.y1, e.y2);
        break;
      case 'ARC':
        // Approximate with circle bounds
        minX = Math.min(minX, e.x - e.radius);
        minY = Math.min(minY, e.y - e.radius);
        maxX = Math.max(maxX, e.x + e.radius);
        maxY = Math.max(maxY, e.y + e.radius);
        break;
      case 'LWPOLYLINE':
        for (const v of e.vertices) {
          minX = Math.min(minX, v.x);
          minY = Math.min(minY, v.y);
          maxX = Math.max(maxX, v.x);
          maxY = Math.max(maxY, v.y);
        }
        break;
    }
  }

  return {
    minX, minY, maxX, maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
}
