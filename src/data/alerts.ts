export interface EmergencyAlert {
  id: string;
  phaseIndex: number;
  timestamp: string;
  sender: string;
  title: string;
  message: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
}

export const PHASE_ALERTS: EmergencyAlert[] = [
  {
    id: 'alt-1',
    phaseIndex: 0,
    timestamp: '00:05',
    sender: 'BMC DISASTER CELL',
    title: 'RED ALERT ISSUED',
    message: 'Extreme rainfall detected over Hindmata. Wading depth: 15cm. Locate stranded shopkeepers immediately.',
    severity: 'INFO'
  },
  {
    id: 'alt-2',
    phaseIndex: 1,
    timestamp: '01:30',
    sender: 'MUMBAI TRAFFIC POLICE',
    title: 'MAIN AVENUE SUBMERGING',
    message: 'Water level reached Knee-Deep (40cm). High-voltage overhead cable snapped near market junction!',
    severity: 'WARNING'
  },
  {
    id: 'alt-3',
    phaseIndex: 2,
    timestamp: '03:15',
    sender: 'BMC EMERGENCY TASK FORCE',
    title: 'MAIN ROAD BLOCKED - EVACUATE VIA ALLEYWAY',
    message: 'Waist-deep water (75cm) has submerged Hindmata Main Road. Main avenue choked with debris. Take alternative alleyway route!',
    severity: 'CRITICAL'
  },
  {
    id: 'alt-4',
    phaseIndex: 3,
    timestamp: '05:00',
    sender: 'NATIONAL DISASTER RESPONSE FORCE (NDRF)',
    title: 'FINAL EVACUATION CALL - DADAR FLYOVER OPEN',
    message: 'Torrential Inundation! Flood surges active. Dadar Flyover elevated beacon active. Guide all evacuees to safe zone NOW!',
    severity: 'CRITICAL'
  }
];
