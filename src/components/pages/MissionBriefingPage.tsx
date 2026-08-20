import React from 'react';
import { useGameState } from '../../context/GameStateContext';

export const MissionBriefingPage: React.FC = () => {
  const { currentView, setCurrentView, selectedMission } = useGameState();

  if (currentView !== 'briefing' || !selectedMission) return null;

  return (
    <div className="container flex-center" style={{ minHeight: '80vh' }}>
      <div className="game-panel" style={{ maxWidth: '600px', width: '100%' }}>
        <h2 className="text-center text-cyan" style={{ marginBottom: '1.5rem' }}>MISSION BRIEFING</h2>
        
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ color: '#fff' }}>{selectedMission.id.toUpperCase()}</h3>
          <h1 className="text-cyan" style={{ fontSize: '2rem', marginBottom: '1rem' }}>{selectedMission.name.toUpperCase()}</h1>
          
          <p className="pixel-text" style={{ marginBottom: '1.5rem' }}>
            Heavy rainfall has flooded the area. Several civilians are stranded.
          </p>

          <div style={{ backgroundColor: 'var(--bg-color)', padding: '1rem', border: '2px solid var(--panel-border)' }}>
            <h4 className="text-red" style={{ marginBottom: '0.5rem' }}>OBJECTIVES:</h4>
            <ul className="pixel-text text-muted" style={{ listStyleType: 'none', marginLeft: 0 }}>
              <li>✓ Rescue civilians</li>
              <li>✓ Avoid hazards</li>
              <li>✓ Reach the safe zone</li>
            </ul>
          </div>
          
          <div className="text-center pixel-text text-cyan" style={{ marginTop: '1.5rem' }}>
            ESTIMATED TIME: 6-7 MINUTES
          </div>
        </div>

        <button
          onClick={() => setCurrentView('game')}
          className="game-button"
          style={{ width: '100%' }}
        >
          START MISSION
        </button>
      </div>
    </div>
  );
};
