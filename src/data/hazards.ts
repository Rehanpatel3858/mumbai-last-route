export interface HazardInfo {
  id: string;
  name: string;
  type: 'MANHOLE' | 'ELECTRICAL' | 'STALLED_VEHICLE' | 'DEBRIS' | 'FLOOD_SURGE';
  severity: 'WARNING' | 'DANGER' | 'LETHAL';
  icon: string;
  description: string;
  survivalTip: string;
  color: string;
}

export const HAZARDS_DATA: HazardInfo[] = [
  {
    id: 'h-manhole',
    name: 'Open Storm Drain / Manhole',
    type: 'MANHOLE',
    severity: 'LETHAL',
    icon: 'AlertCircle',
    description: 'During severe inundation, displaced manhole covers create swirling whirlpool suction traps capable of pulling rescuers and civilians under.',
    survivalTip: 'Watch for swirling circular water ripples and suction sound. Steer clear of water vortexes!',
    color: '#ff2a5f'
  },
  {
    id: 'h-electric',
    name: 'Live Wire / Electrified Pool',
    type: 'ELECTRICAL',
    severity: 'LETHAL',
    icon: 'Zap',
    description: 'Fallen overhead cables and flooded junction boxes electrify water pools with high voltage, causing rapid health drain.',
    survivalTip: 'Electrified water flashes yellow/cyan with electrical sparks. Wait for voltage pulse cycles before wading across.',
    color: '#ffcc00'
  },
  {
    id: 'h-vehicle',
    name: 'Stalled BEST Bus & Auto-Rickshaws',
    type: 'STALLED_VEHICLE',
    severity: 'WARNING',
    icon: 'Truck',
    description: 'Submerged buses, cars, and rickshaws choke narrow lanes, forcing rescuers to take higher-risk water detour routes.',
    survivalTip: 'Use stalled vehicle roofs as temporary dry platforms for stranded civilians.',
    color: '#ff7700'
  },
  {
    id: 'h-debris',
    name: 'Floating Debris & Wooden Logs',
    type: 'DEBRIS',
    severity: 'WARNING',
    icon: 'Box',
    description: 'Debris drifting in the flood current can knock down rescuers and temporarily scatter escorted civilian lines.',
    survivalTip: 'Sidestep incoming drifting objects. If hit, press [E] quickly to re-regroup scattered evacuees.',
    color: '#a855f7'
  },
  {
    id: 'h-surge',
    name: 'Torrential Flood Surge',
    type: 'FLOOD_SURGE',
    severity: 'DANGER',
    icon: 'Waves',
    description: 'Periodic tidal surges and river sluice breaches release powerful current waves that drag units downstream.',
    survivalTip: 'When BMC Surge Warning sounds, anchor against concrete walls or high elevated platforms.',
    color: '#00f0ff'
  }
];
