import React from 'react';
import { useGameState } from '../../context/GameStateContext';
import type { ScoreBreakdown } from '../../game/systems/ScoreSystem';

interface VictoryModalProps {
  scoreBreakdown: ScoreBreakdown;
  onPlayAgain: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({ scoreBreakdown, onPlayAgain }) => {
  const { setCurrentView } = useGameState();

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="hud-container flex-center" style={{ backgroundColor: 'rgba(0, 255, 136, 0.1)', pointerEvents: 'auto', backdropFilter: 'blur(4px)' }}>
      <div className="game-panel text-center" style={{ width: '500px', borderColor: 'var(--accent-green)' }}>
        <h1 className="text-green" style={{ marginBottom: '1rem', textShadow: '2px 2px 0 #000' }}>MISSION COMPLETE</h1>
        
        <div className="pixel-text" style={{ marginBottom: '2rem', textAlign: 'left', padding: '1rem', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
            <span className="text-muted">CIVILIANS RESCUED</span>
            <span>{scoreBreakdown.civiliansSaved} / {scoreBreakdown.totalCivilians}</span>
          </div>
          <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
            <span className="text-muted">TIME REMAINING</span>
            <span>{formatTime(scoreBreakdown.timeRemainingSeconds)}</span>
          </div>
          <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
            <span className="text-muted">HAZARDS HIT</span>
            <span className="text-red">{scoreBreakdown.hazardHits}</span>
          </div>
          <div className="flex-between" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '2px solid var(--panel-border)' }}>
            <span className="text-cyan" style={{ fontSize: '1.5rem' }}>RESCUE SCORE</span>
            <span className="text-cyan" style={{ fontSize: '1.5rem' }}>{scoreBreakdown.totalScore}</span>
          </div>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <div className="text-muted pixel-text">RANK</div>
          <div style={{ fontSize: '4rem', fontFamily: 'var(--font-pixel-heading)', color: scoreBreakdown.rank === 'S' ? '#ffd700' : 'var(--accent-cyan)' }}>
            {scoreBreakdown.rank}
          </div>
        </div>
        
        <div className="flex-column gap-2">
          <button className="game-button" onClick={onPlayAgain}>PLAY AGAIN</button>
          <button className="game-button game-button-secondary" disabled>NEXT MISSION</button>
          <button className="game-button game-button-secondary" onClick={() => setCurrentView('landing')}>MAIN MENU</button>
        </div>
      </div>
    </div>
  );
};
