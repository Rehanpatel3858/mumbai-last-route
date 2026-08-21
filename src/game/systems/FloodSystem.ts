export interface FloodPhase {
  index: number;
  name: string;
  waterLevelCm: number;
  waterColor: number;
  speedPenalty: number;
  mainRoadBlocked: boolean;
  electricalHazardsActive: boolean;
  surgesActive: boolean;
  description: string;
}

export const FLOOD_PHASES: FloodPhase[] = [
  {
    index: 0,
    name: 'ANKLE DEEP (WATCH)',
    waterLevelCm: 15,
    waterColor: 0x00f0ff,
    speedPenalty: 1.0,
    mainRoadBlocked: false,
    electricalHazardsActive: false,
    surgesActive: false,
    description: 'Light standing water. Main avenues clear for evacuation.'
  },
  {
    index: 1,
    name: 'KNEE DEEP (ADVISORY)',
    waterLevelCm: 40,
    waterColor: 0x00a8ff,
    speedPenalty: 0.85,
    mainRoadBlocked: false,
    electricalHazardsActive: true,
    surgesActive: false,
    description: 'Submerged pavements. Fallen cables electrify standing water pools.'
  },
  {
    index: 2,
    name: 'WAIST DEEP (SEVERE ALERT)',
    waterLevelCm: 75,
    waterColor: 0x074496,
    speedPenalty: 0.70,
    mainRoadBlocked: true,
    electricalHazardsActive: true,
    surgesActive: false,
    description: 'Hindmata Main Road submerged & blocked by stalled BEST buses! Navigate alternative alleyways.'
  },
  {
    index: 3,
    name: 'TORRENTIAL INUNDATION (EVACUATE)',
    waterLevelCm: 120,
    waterColor: 0x051b3d,
    speedPenalty: 0.55,
    mainRoadBlocked: true,
    electricalHazardsActive: true,
    surgesActive: true,
    description: 'Catastrophic deluge. Strong flood surges active. Reach Dadar Elevated Safe Zone NOW!'
  }
];

export function getPhaseForTime(elapsedSeconds: number): FloodPhase {
  if (elapsedSeconds < 90) return FLOOD_PHASES[0];
  if (elapsedSeconds < 195) return FLOOD_PHASES[1];
  if (elapsedSeconds < 300) return FLOOD_PHASES[2];
  return FLOOD_PHASES[3];
}
