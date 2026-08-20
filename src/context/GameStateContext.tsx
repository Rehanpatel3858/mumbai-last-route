import React, { createContext, useContext, useState } from 'react';
import { MISSIONS, type Mission } from '../data/missions';
import type { ScoreBreakdown } from '../game/systems/ScoreSystem';
import { saveScoreToLeaderboard } from '../data/leaderboard';
import { soundSynth } from '../game/utils/SoundSynth';

export type AppView = 
  | 'landing'
  | 'about'
  | 'features'
  | 'mission-select'
  | 'briefing'
  | 'how-to-play'
  | 'leaderboard'
  | 'profile'
  | 'game';

export interface PlayerProfile {
  name: string;
  badge: string;
  totalRescued: number;
  bestRank: 'S' | 'A' | 'B' | 'C' | 'D' | 'NONE';
  playCount: number;
}

interface GameStateContextType {
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  selectedMission: Mission;
  setSelectedMission: (mission: Mission) => void;
  activeScore: ScoreBreakdown | null;
  setActiveScore: (score: ScoreBreakdown | null) => void;
  gameStatus: 'IDLE' | 'PLAYING' | 'VICTORY' | 'FAILURE';
  setGameStatus: (status: 'IDLE' | 'PLAYING' | 'VICTORY' | 'FAILURE') => void;
  isMuted: boolean;
  toggleMute: () => void;
  playerProfile: PlayerProfile;
  updateProfileName: (name: string) => void;
  handleGameOver: (victory: boolean, score: ScoreBreakdown) => void;
}

const PROFILE_KEY = 'mumbai_last_route_profile';

const DEFAULT_PROFILE: PlayerProfile = {
  name: 'First Rescuer',
  badge: 'NDRF CADET',
  totalRescued: 0,
  bestRank: 'NONE',
  playCount: 0,
};

const GameStateContext = createContext<GameStateContextType | undefined>(undefined);

export const GameStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [selectedMission, setSelectedMission] = useState<Mission>(MISSIONS[0]);
  const [activeScore, setActiveScore] = useState<ScoreBreakdown | null>(null);
  const [gameStatus, setGameStatus] = useState<'IDLE' | 'PLAYING' | 'VICTORY' | 'FAILURE'>('IDLE');
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const [playerProfile, setPlayerProfile] = useState<PlayerProfile>(() => {
    try {
      const raw = localStorage.getItem(PROFILE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn('Failed to parse profile', e);
    }
    return DEFAULT_PROFILE;
  });

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundSynth.setMuted(next);
  };

  const updateProfileName = (name: string) => {
    const updated = { ...playerProfile, name };
    setPlayerProfile(updated);
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save profile', e);
    }
  };

  const handleGameOver = (victory: boolean, score: ScoreBreakdown) => {
    setActiveScore(score);
    setGameStatus(victory ? 'VICTORY' : 'FAILURE');

    if (victory) {
      const updated: PlayerProfile = {
        ...playerProfile,
        totalRescued: playerProfile.totalRescued + score.civiliansSaved,
        playCount: playerProfile.playCount + 1,
        bestRank: getBetterRank(playerProfile.bestRank, score.rank),
        badge: getBadgeForRank(score.rank),
      };
      setPlayerProfile(updated);
      try {
        localStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to update profile stats', e);
      }

      saveScoreToLeaderboard({
        playerName: playerProfile.name,
        missionId: selectedMission.id,
        missionName: selectedMission.name,
        civiliansSaved: score.civiliansSaved,
        maxCivilians: score.totalCivilians,
        timeRemainingSeconds: score.timeRemainingSeconds,
        score: score.totalScore,
        grade: score.rank,
        badge: updated.badge,
      });
    }
  };

  return (
    <GameStateContext.Provider
      value={{
        currentView,
        setCurrentView,
        selectedMission,
        setSelectedMission,
        activeScore,
        setActiveScore,
        gameStatus,
        setGameStatus,
        isMuted,
        toggleMute,
        playerProfile,
        updateProfileName,
        handleGameOver,
      }}
    >
      {children}
    </GameStateContext.Provider>
  );
};

export const useGameState = () => {
  const ctx = useContext(GameStateContext);
  if (!ctx) throw new Error('useGameState must be used within GameStateProvider');
  return ctx;
};

function getBetterRank(
  current: 'S' | 'A' | 'B' | 'C' | 'D' | 'NONE',
  next: 'S' | 'A' | 'B' | 'C' | 'D'
): 'S' | 'A' | 'B' | 'C' | 'D' {
  const order = ['S', 'A', 'B', 'C', 'D', 'NONE'];
  const curIndex = order.indexOf(current);
  const nextIndex = order.indexOf(next);
  return nextIndex < curIndex ? next : (current as 'S' | 'A' | 'B' | 'C' | 'D');
}

function getBadgeForRank(rank: 'S' | 'A' | 'B' | 'C' | 'D'): string {
  switch (rank) {
    case 'S':
      return 'MONSOON VETERAN';
    case 'A':
      return 'DISASTER SPECIALIST';
    case 'B':
      return 'FIRST RESPONDER';
    case 'C':
      return 'CIVIC GUARDIAN';
    default:
      return 'CITY VOLUNTEER';
  }
}
