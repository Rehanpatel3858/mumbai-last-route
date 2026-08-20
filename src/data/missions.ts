export interface Mission {
  id: string;
  code: string;
  name: string;
  location: string;
  difficulty: 'MODERATE' | 'SEVERE' | 'EXTREME';
  durationSeconds: number;
  targetCivilians: number;
  isUnlocked: boolean;
  isPlayable: boolean;
  weatherStatus: string;
  sectorRisk: string;
  description: string;
  briefing: {
    overview: string;
    primaryObjective: string;
    secondaryObjective: string;
    hazardAlerts: string[];
    tacticalTip: string;
  };
}

export const MISSIONS: Mission[] = [
  {
    id: 'mission-01',
    code: 'OPS-HINDMATA-01',
    name: 'Operation Hindmata Evacuation',
    location: 'Hindmata Lowland Sector to Dadar Flyover Safe Zone',
    difficulty: 'MODERATE',
    durationSeconds: 390, // 6 minutes 30 seconds
    targetCivilians: 10,
    isUnlocked: true,
    isPlayable: true,
    weatherStatus: 'IMMINENT DELUGE / 140mm PER HOUR',
    sectorRisk: 'CRITICAL INUNDATION ZONE',
    description: 'Hindmata bowl sector is submerging rapidly. Escort stranded shopkeepers and commuters to the Dadar Flyover high platform before all road links are cut off.',
    briefing: {
      overview: 'BMC Weather Radar reports unprecedented cloudburst over Central Mumbai. Hindmata junction is acting as a catch basin with water levels escalating at 15cm per minute. Roads to Dadar are closing rapidly.',
      primaryObjective: 'Locate and rescue at least 8 out of 10 stranded civilians and safely escort them to Dadar Flyover elevated zone.',
      secondaryObjective: 'Evacuate high-priority marooned civilians from rooftop market stalls before water reaches waist level.',
      hazardAlerts: [
        'Open storm drains and overflow manholes near Hindmata Cinema',
        'Fallen live high-voltage cables near Dadar station East road',
        'Stalled BEST buses blocking narrow alleyways'
      ],
      tacticalTip: 'Use your flashlight cone to spot panicked civilians stranded in deep water. Stranded citizens will join your escort chain when you press [E] nearby.'
    }
  },
  {
    id: 'mission-02',
    code: 'OPS-KURLA-02',
    name: 'Kurla West Mithi Surge',
    location: 'LBS Marg & Mithi River Bank Sector',
    difficulty: 'SEVERE',
    durationSeconds: 420,
    targetCivilians: 14,
    isUnlocked: false,
    isPlayable: false,
    weatherStatus: 'RIVER OVERFLOW / FLASH SURGE',
    sectorRisk: 'CATASTROPIC FLUID SURGE',
    description: 'The Mithi River has breached embankments along LBS Marg. Fast-moving flood surges drag vehicles and debris through narrow residential chawls.',
    briefing: {
      overview: 'Mithi river sluice gates are over-capacity. A 2-meter surge wave is barreling down Kurla West. Rescuers must navigate floating auto-rickshaws and strong current vectors.',
      primaryObjective: 'Rescue 12 stranded residents and escort them to the Kurla Station Foot Over Bridge.',
      secondaryObjective: 'Collect emergency medical kits from flooded dispensary.',
      hazardAlerts: [
        'Periodic flood surges pushing player southward',
        'Submerged metal sheet debris with high collision damage',
        'Collapsing chawl walls'
      ],
      tacticalTip: 'Stay close to building walls during flood surge warnings to avoid getting dragged back.'
    }
  },
  {
    id: 'mission-03',
    code: 'OPS-BANDRA-03',
    name: 'Bandra-Saki Naka Night Inundation',
    location: 'SV Road & Creek Platform',
    difficulty: 'EXTREME',
    durationSeconds: 450,
    targetCivilians: 18,
    isUnlocked: false,
    isPlayable: false,
    weatherStatus: 'HIGH TIDE COMBINED CLOUDBURST',
    sectorRisk: 'TOTAL INFRASTRUCTURE FAILURE',
    description: 'A 4.8m high tide coupled with a cloudburst has paralyzed SV Road. High voltage grid failure has electrified submerged streets in pitch-black monsoon darkness.',
    briefing: {
      overview: 'Sub-station Transformer 4 exploded. Water pools in Bandra West are electrified. Rescuers must work in total darkness using emergency beacons to guide evacuees to Bandra Fort elevated grounds.',
      primaryObjective: 'Rescue 15 citizens in zero-visibility conditions and guide them to Bandra Fort high ground.',
      secondaryObjective: 'Disengage emergency sub-station circuit breaker.',
      hazardAlerts: [
        'Widespread electrified water pools',
        'Zero ambient light / visibility restricted to flashlight beam',
        'Submerged manholes swirling rapidly'
      ],
      tacticalTip: 'Follow emergency cyan beacon flares placed along high-ground escape routes.'
    }
  }
];
