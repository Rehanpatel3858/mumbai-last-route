import React from 'react';
import { useGameState } from '../../context/GameStateContext';

interface FailureModalProps {
  rescuedCount: number;
  totalCivilians: number;
  onRetry: () => void;
}

export const FailureModal: React.FC<FailureModalProps> = ({ rescuedCount, totalCivilians, onRetry }) => {
  const { setCurrentView } = useGameState();

  return (
    <div className="hud-container flex-center" style={{ backgroundColor: 'rgba(255, 42, 95, 0.15)', pointerEvents: 'auto', backdropFilter: 'blur(4px)' }}>
      <div className="game-panel text-center" style={{ width: '500px', borderColor: 'var(--accent-red)' }}>
        <h1 className="text-red" style={{ marginBottom: '1rem', textShadow: '2px 2px 0 #000' }}>MISSION FAILED</h1>
        <p className="pixel-text text-muted" style={{ marginBottom: '2rem' }}>THE FLOOD HAS TAKEN OVER.</p>
        
        <div className="pixel-text" style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="flex-between">
            <span className="text-muted">CIVILIANS RESCUED</span>
            <span>{rescuedCount} / {totalCivilians}</span>
          </div>
        </div>
        
        <div className="flex-column gap-2">
          <button className="game-button" style={{ backgroundColor: 'var(--accent-red)' }} onClick={onRetry}>RETRY</button>
          <button className="game-button game-button-secondary" onClick={() => setCurrentView('landing')}>MAIN MENU</button>
        </div>
      </div>
    </div>
  );
};
