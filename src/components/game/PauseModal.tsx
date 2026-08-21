import React from 'react';
import { useGameState } from '../../context/GameStateContext';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({ onResume, onRestart }) => {
  const { setCurrentView } = useGameState();

  return (
    <div className="hud-container flex-center" style={{ backgroundColor: 'rgba(0,0,0,0.8)', pointerEvents: 'auto' }}>
      <div className="game-panel text-center" style={{ width: '400px' }}>
        <h1 className="text-cyan" style={{ marginBottom: '2rem' }}>PAUSED</h1>
        
        <div className="flex-column gap-2">
          <button className="game-button" onClick={onResume}>RESUME</button>
          <button className="game-button game-button-secondary" onClick={() => setCurrentView('how-to-play')}>HOW TO PLAY</button>
          <button className="game-button game-button-secondary" onClick={onRestart}>RESTART MISSION</button>
          <button className="game-button game-button-secondary" onClick={() => setCurrentView('landing')}>MAIN MENU</button>
        </div>
      </div>
    </div>
  );
};
