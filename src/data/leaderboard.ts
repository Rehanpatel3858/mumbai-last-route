export interface LeaderboardEntry {
  id: string;
  rank: number;
  playerName: string;
  missionId: string;
  missionName: string;
  civiliansSaved: number;
  maxCivilians: number;
  timeRemainingSeconds: number;
  score: number;
  grade: 'S' | 'A' | 'B' | 'C' | 'D';
  badge: string;
  date: string;
}

const STORAGE_KEY = 'mumbai_last_route_leaderboard';

export const INITIAL_LEADERBOARD: LeaderboardEntry[] = [
  {
    id: 'lb-1',
    rank: 1,
    playerName: 'Rescuer Alpha (NDRF-01)',
    missionId: 'mission-01',
    missionName: 'Operation Hindmata Evacuation',
    civiliansSaved: 10,
    maxCivilians: 10,
    timeRemainingSeconds: 142,
    score: 11420,
    grade: 'S',
    badge: 'MONSOON VETERAN',
    date: '2026-08-19'
  },
  {
    id: 'lb-2',
    rank: 2,
    playerName: 'Captain R. Deshmukh',
    missionId: 'mission-01',
    missionName: 'Operation Hindmata Evacuation',
    civiliansSaved: 10,
    maxCivilians: 10,
    timeRemainingSeconds: 98,
    score: 10980,
    grade: 'S',
    badge: 'DISASTER SPECIALIST',
    date: '2026-08-18'
  },
  {
    id: 'lb-3',
    rank: 3,
    playerName: 'FireBrigade_Team7',
    missionId: 'mission-01',
    missionName: 'Operation Hindmata Evacuation',
    civiliansSaved: 9,
    maxCivilians: 10,
    timeRemainingSeconds: 85,
    score: 9850,
    grade: 'A',
    badge: 'FIRST RESPONDER',
    date: '2026-08-18'
  },
  {
    id: 'lb-4',
    rank: 4,
    playerName: 'Aarav Mehta',
    missionId: 'mission-01',
    missionName: 'Operation Hindmata Evacuation',
    civiliansSaved: 8,
    maxCivilians: 10,
    timeRemainingSeconds: 60,
    score: 8600,
    grade: 'A',
    badge: 'CIVIC GUARDIAN',
    date: '2026-08-17'
  },
  {
    id: 'lb-5',
    rank: 5,
    playerName: 'BMC_Volunteer_Kunal',
    missionId: 'mission-01',
    missionName: 'Operation Hindmata Evacuation',
    civiliansSaved: 7,
    maxCivilians: 10,
    timeRemainingSeconds: 32,
    score: 7320,
    grade: 'B',
    badge: 'CITY SAVIOR',
    date: '2026-08-16'
  }
];

export function getLeaderboard(): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to load leaderboard from localStorage', e);
  }
  return INITIAL_LEADERBOARD;
}

export function saveScoreToLeaderboard(entry: Omit<LeaderboardEntry, 'id' | 'rank' | 'date'>): LeaderboardEntry[] {
  const current = getLeaderboard();
  const newEntry: LeaderboardEntry = {
    ...entry,
    id: `lb-${Date.now()}`,
    rank: 0,
    date: new Date().toISOString().split('T')[0]
  };

  const updated = [...current, newEntry];
  // Sort descending by score
  updated.sort((a, b) => b.score - a.score);
  // Re-index ranks
  updated.forEach((item, index) => {
    item.rank = index + 1;
  });

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated.slice(0, 50)));
  } catch (e) {
    console.warn('Failed to save score to localStorage', e);
  }

  return updated;
}
