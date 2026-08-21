import { Rect } from './constants';

export type BuildingKind = 'chawl' | 'commercial' | 'market' | 'substation' | 'wall';

export interface Building extends Rect {
  kind: BuildingKind;
  hue?: string;
  roof?: string;
}

export interface Vehicle extends Rect {
  type: 'rickshaw' | 'bus' | 'car';
}

export interface HazardDef {
  x: number; y: number; r: number;
  type: 'manhole' | 'electric' | 'current';
  dir?: { x: number; y: number };
}

export interface CivilianDef {
  id: number; x: number; y: number; name: string; color: string; hint: string;
}

export interface RouteBarrierDef {
  id: 'A' | 'B';
  rect: Rect;
  blockFlood: number;
  headline: string;
  sub: string;
}

// Road corridors (visual + define walkable space). Collision = buildings + barriers + world bounds.
export interface Road extends Rect {
  kind: 'highway' | 'causeway' | 'flyover' | 'street' | 'plaza';
}

const ROADS: Road[] = [
  // Route C — elevated flyover (top), always open
  { x: 120, y: 100, w: 2600, h: 160, kind: 'flyover' },
  // Left vertical road (Route C entrance)
  { x: 120, y: 120, w: 180, h: 1640, kind: 'street' },
  // Route A — highway (horizontal), blocked at 50%
  { x: 300, y: 600, w: 2120, h: 180, kind: 'highway' },
  // rightV connects highway east end up to flyover (part of Route A)
  { x: 1900, y: 260, w: 220, h: 360, kind: 'highway' },
  // Route B — causeway (vertical), blocked at 90%
  { x: 1020, y: 260, w: 220, h: 1160, kind: 'causeway' },
  // Mid vertical roads for exploration
  { x: 560, y: 780, w: 160, h: 840, kind: 'street' },     // midV1
  { x: 1480, y: 780, w: 160, h: 720, kind: 'street' },     // midV2
  // Mid horizontal road (market level)
  { x: 560, y: 1000, w: 1860, h: 120, kind: 'street' },
  // Market plaza (open)
  { x: 820, y: 1100, w: 420, h: 320, kind: 'plaza' },
  // Bottom road
  { x: 120, y: 1620, w: 2300, h: 140, kind: 'street' },
  // East Causeway in the expanded map area
  { x: 2420, y: 260, w: 220, h: 1360, kind: 'causeway' },
  // Narrow vertical street connecting Route A to bottom road
  { x: 2120, y: 780, w: 120, h: 840, kind: 'street' },
];

// Build buildings to flank corridors. Helper to fill a band with blocks, leaving gaps.
function blocks(x0: number, y0: number, x1: number, y1: number, bw: number, bh: number, gap: number, kind: BuildingKind = 'chawl'): Building[] {
  const out: Building[] = [];
  for (let y = y0; y + bh <= y1 + 1; y += bh + gap) {
    for (let x = x0; x + bw <= x1 + 1; x += bw + gap) {
      out.push({ x, y, w: bw, h: bh, kind });
    }
  }
  return out;
}

const BUILDINGS: Building[] = [];

// North wall (above flyover) — stops at safe zone opening
BUILDINGS.push({ x: 0, y: 0, w: 2720, h: 100, kind: 'wall' });
BUILDINGS.push({ x: 2960, y: 0, w: 40, h: 100, kind: 'wall' });
// South wall
BUILDINGS.push({ x: 0, y: 1760, w: 3000, h: 40, kind: 'wall' });
// West wall
BUILDINGS.push({ x: 0, y: 100, w: 120, h: 1660, kind: 'wall' });
// East wall — gap for Safe Zone (y180-380)
BUILDINGS.push({ x: 2720, y: 100, w: 280, h: 80, kind: 'wall' });
BUILDINGS.push({ x: 2720, y: 380, w: 280, h: 1380, kind: 'wall' });

// Expanded eastern area building blocks (x 2120 to 2720)
BUILDINGS.push(...blocks(2240, 260, 2420, 600, 180, 170, 0, 'chawl'));
BUILDINGS.push(...blocks(2240, 780, 2420, 1000, 180, 110, 0, 'commercial'));
BUILDINGS.push(...blocks(2240, 1120, 2420, 1620, 180, 160, 0, 'chawl'));
BUILDINGS.push(...blocks(2640, 260, 2720, 1620, 80, 200, 0, 'chawl'));

// North band (between flyover y260 and highway y600)
BUILDINGS.push(...blocks(300, 260, 560, 600, 130, 170, 0, 'chawl'));
BUILDINGS.push(...blocks(720, 260, 1020, 600, 150, 170, 0, 'commercial'));
BUILDINGS.push(...blocks(1240, 260, 1900, 600, 160, 170, 0, 'chawl'));

// Mid band (between highway y780 and midH y1000)
BUILDINGS.push(...blocks(300, 780, 560, 1000, 130, 110, 0, 'chawl'));
BUILDINGS.push(...blocks(720, 780, 1020, 1000, 150, 110, 0, 'chawl'));
BUILDINGS.push(...blocks(1240, 780, 1480, 1000, 120, 110, 0, 'chawl'));
// electrical alley pocket: x[1640,1900] y[780,1000] is open (no buildings) — substation inside
BUILDINGS.push(...blocks(1900, 780, 2120, 1000, 110, 110, 0, 'commercial')); // east of alley? alley is x1640-1900; 1900-2120 is... wait rightV is x1900-2120 y260-600 only. Below highway y780, x1900-2120 is buildings.
BUILDINGS.push(...blocks(1900, 780, 2120, 1000, 110, 110, 0, 'chawl'));

// South band (between midH y1120 and bottom road y1620)
BUILDINGS.push(...blocks(300, 1120, 560, 1620, 130, 160, 0, 'chawl'));
// market plaza is x820-1240 y1100-1420 open; buildings around it
BUILDINGS.push(...blocks(720, 1120, 820, 1420, 100, 150, 0, 'market'));
BUILDINGS.push(...blocks(1240, 1120, 1480, 1420, 120, 150, 0, 'chawl'));
BUILDINGS.push(...blocks(720, 1420, 1020, 1620, 150, 200, 0, 'chawl'));
BUILDINGS.push(...blocks(1240, 1420, 1480, 1620, 120, 200, 0, 'chawl'));
BUILDINGS.push(...blocks(1640, 1120, 1900, 1620, 130, 125, 0, 'chawl'));
BUILDINGS.push(...blocks(1900, 1000, 2120, 1620, 110, 130, 0, 'chawl'));

// Special buildings
// Substation in electrical alley
BUILDINGS.push({ x: 1660, y: 800, w: 120, h: 90, kind: 'substation' });
// Market stall bases (small, non-blocking visually but add collision fences)
const stalls: Building[] = [
  { x: 860, y: 1130, w: 70, h: 40, kind: 'market' },
  { x: 980, y: 1130, w: 70, h: 40, kind: 'market' },
  { x: 1100, y: 1130, w: 70, h: 40, kind: 'market' },
  { x: 860, y: 1340, w: 70, h: 40, kind: 'market' },
  { x: 1100, y: 1340, w: 70, h: 40, kind: 'market' },
];
BUILDINGS.push(...stalls);

const VEHICLES: Vehicle[] = [
  { x: 470, y: 640, w: 90, h: 130, type: 'bus' },     // BEST bus on highway west
  { x: 1380, y: 1020, w: 80, h: 100, type: 'bus' },   // stalled bus on midH near C2
  { x: 380, y: 1640, w: 44, h: 60, type: 'rickshaw' },
  { x: 1080, y: 1640, w: 44, h: 60, type: 'rickshaw' },
  { x: 1600, y: 1640, w: 44, h: 60, type: 'rickshaw' },
  { x: 760, y: 1640, w: 48, h: 84, type: 'car' },
  { x: 1700, y: 1480, w: 48, h: 84, type: 'car' },
];

const HAZARDS: HazardDef[] = [
  { x: 820, y: 1680, r: 22, type: 'manhole' },
  { x: 1755, y: 860, r: 26, type: 'electric' },
  { x: 1430, y: 690, r: 40, type: 'current', dir: { x: -0.6, y: 0.4 } },
  { x: 2300, y: 1680, r: 22, type: 'manhole' },
  { x: 2530, y: 900, r: 26, type: 'electric' },
];

const CIVILIANS: CivilianDef[] = [
  { id: 1, x: 950, y: 1230, name: 'VENDOR', color: '#FFB703', hint: 'Street Vendor: Local Market' },
  { id: 2, x: 1500, y: 1380, name: 'COMMUTER', color: '#10B981', hint: 'Commuter: Stalled BEST Bus' },
  { id: 3, x: 1820, y: 940, name: 'WORKER', color: '#FF0055', hint: 'Office Worker: Electrical Alley' },
  { id: 4, x: 2250, y: 1450, name: 'ELDERLY', color: '#FF9F1C', hint: 'Elderly Resident: Residential Lane' },
  { id: 5, x: 2520, y: 700, name: 'STUDENT', color: '#8ECAE6', hint: 'Student: Flooded Shop Area' },
  { id: 6, x: 2350, y: 1150, name: 'SHOPKEEPER', color: '#E07A5F', hint: 'Shopkeeper: Narrow Side Street' },
];

// Route barriers — span full corridor width, flanked by buildings so no bypass.
const BARRIERS: RouteBarrierDef[] = [
  {
    id: 'A',
    // Blocks rightV (the highway→flyover link). Flanked by east wall (x2120) and buildings west (x1900 alley buildings above y780; but rightV is y260-600, west side x<1900 is north-band buildings x1240-1900 y260-600). Good.
    rect: { x: 1880, y: 240, w: 260, h: 380 },
    blockFlood: 50,
    headline: 'ROUTE A BLOCKED',
    sub: 'DIRECT HIGHWAY SUBMERGED. USE ROUTE B OR ROUTE C.',
  },
  {
    id: 'B',
    // Blocks causeway mid-section. Flanked by buildings east (x1240) and west (x1020).
    rect: { x: 1000, y: 840, w: 260, h: 180 },
    blockFlood: 90,
    headline: 'ROUTE B BLOCKED',
    sub: 'MARKET CAUSEWAY SUBMERGED. ROUTE C IS THE FINAL EVACUATION PATH.',
  },
];

// Route indicator arrows pointing toward Safe Zone
export const ROUTE_MARKERS = [
  // Route A (highway)
  { x: 500, y: 690, label: 'A', color: '#00F3FF' },
  { x: 1600, y: 690, label: 'A', color: '#00F3FF' },
  // Route B (causeway)
  { x: 1130, y: 500, label: 'B', color: '#8B5CF6' },
  { x: 1130, y: 1300, label: 'B', color: '#8B5CF6' },
  // Route C (flyover)
  { x: 300, y: 180, label: 'C', color: '#10B981' },
  { x: 1700, y: 180, label: 'C', color: '#10B981' },
];

export const WORLD_DEF = {
  roads: ROADS,
  buildings: BUILDINGS,
  vehicles: VEHICLES,
  hazards: HAZARDS,
  civilians: CIVILIANS,
  barriers: BARRIERS,
};

// Player start
export const START = { x: 200, y: 1680 };
