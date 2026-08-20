export interface RouteOption {
  id: 'ROUTE_A' | 'ROUTE_B' | 'ROUTE_C';
  name: string;
  type: 'FAST' | 'BALANCED' | 'SAFE';
  etaSeconds: number;
  riskPercent: number;
  waterLevelPercent: number;
  description: string;
  pathDescription: string;
}

export const ROUTE_OPTIONS: RouteOption[] = [
  {
    id: 'ROUTE_A',
    name: 'ROUTE A — HINDMATA MAIN AVENUE',
    type: 'FAST',
    etaSeconds: 35,
    riskPercent: 85,
    waterLevelPercent: 78,
    description: 'Fastest direct path along main road. High water depth & stalled BEST buses!',
    pathDescription: 'Main Road (Direct) → Flyover Ramp'
  },
  {
    id: 'ROUTE_B',
    name: 'ROUTE B — CHAWL ALLEYWAY DETOUR',
    type: 'BALANCED',
    etaSeconds: 55,
    riskPercent: 50,
    waterLevelPercent: 52,
    description: 'Balanced alleyway navigation. Moderate water depth with floating debris.',
    pathDescription: 'East Alleyway → Power Station → Ramp'
  },
  {
    id: 'ROUTE_C',
    name: 'ROUTE C — RAILWAY PLATFORM HIGH GROUND',
    type: 'SAFE',
    etaSeconds: 85,
    riskPercent: 20,
    waterLevelPercent: 31,
    description: 'Safest elevated railway tracks path. Longer distance but low water level.',
    pathDescription: 'Railway Platform → Station Overbridge → Safe Zone'
  }
];

export function calculateRouteRisk(
  playerX: number,
  playerY: number,
  targetX: number,
  targetY: number,
  floodStageIndex: number
): { riskPercent: number; etaSeconds: number } {
  const dist = Math.hypot(targetX - playerX, targetY - playerY);
  const baseSpeed = 160 * (1 - floodStageIndex * 0.15);
  const etaSeconds = Math.ceil(dist / baseSpeed) + floodStageIndex * 12;
  const riskPercent = Math.min(100, Math.floor(floodStageIndex * 25 + dist / 32));
  return { riskPercent, etaSeconds };
}
