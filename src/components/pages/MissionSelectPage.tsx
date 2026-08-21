import React from 'react';
import { useGameState } from '../../context/GameStateContext';
import { MISSIONS } from '../../data/missions';

export const MissionSelectPage: React.FC = () => {
  const { setCurrentView, setSelectedMission } = useGameState();

  const handleSelect = (mission: typeof MISSIONS[0]) => {
    if (mission.isUnlocked) {
      setSelectedMission(mission);
      setCurrentView('briefing');
    }
  };

  return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      <h1 className="text-cyan text-center" style={{ marginBottom: '2rem' }}>MISSION SELECT</h1>
      
      <div className="flex-column gap-2" style={{ maxWidth: '600px', margin: '0 auto' }}>
        {MISSIONS.map((mission) => (
          <div 
            key={mission.id} 
            className="game-panel" 
            style={{ 
              opacity: !mission.isUnlocked ? 0.6 : 1, 
              borderColor: !mission.isUnlocked ? 'var(--text-secondary)' : 'var(--panel-border)'
            }}
          >
            <div className="flex-between" style={{ marginBottom: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.2rem', margin: 0, color: !mission.isUnlocked ? 'var(--text-secondary)' : '#fff' }}>
                  {mission.id.toUpperCase()}
                </h2>
                <h3 className="text-cyan" style={{ fontSize: '1.5rem', margin: 0 }}>
                  {mission.name.toUpperCase()}
                </h3>
              </div>
              <div className="text-muted pixel-text text-right">
                {mission.difficulty}<br/>
                Civilians: {mission.targetCivilians}<br/>
                Time: ~6-7 min
              </div>
            </div>
            
            <button
              onClick={() => handleSelect(mission)}
              className="game-button"
              disabled={!mission.isUnlocked}
              style={{ width: '100%', fontSize: '1.2rem', backgroundColor: !mission.isUnlocked ? 'var(--text-secondary)' : 'var(--accent-blue)' }}
            >
              {!mission.isUnlocked ? 'LOCKED' : 'START MISSION'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
