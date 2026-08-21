import React from 'react';
import { useGameState } from '../../context/GameStateContext';
import { MISSIONS } from '../../data/missions';

export const LandingPage: React.FC = () => {
  const { setCurrentView, setSelectedMission } = useGameState();

  const handleStartMission01 = () => {
    setSelectedMission(MISSIONS[0]);
    setCurrentView('briefing');
  };

  return (
    <div className="container" style={{ paddingBottom: '3rem' }}>
      <section className="hero-section">
        <div style={{ maxWidth: '800px' }}>
          <h1 className="hero-title">
            MUMBAI:<br/>
            <span className="text-cyan">LAST SAFE ROUTE</span>
          </h1>
          <p className="hero-subtitle" style={{ margin: '0 auto' }}>
            THE CITY IS FLOODING.<br/>EVERY SECOND MATTERS.
          </p>
        </div>

        <div className="flex-center gap-2" style={{ marginTop: '2rem' }}>
          <button
            onClick={handleStartMission01}
            className="game-button"
          >
            PLAY NOW
          </button>

          <button
            onClick={() => setCurrentView('how-to-play')}
            className="game-button game-button-secondary"
          >
            HOW TO PLAY
          </button>
        </div>
      </section>

      <section className="flex-center" style={{ marginTop: '2rem' }}>
        <div className="game-panel text-center" style={{ maxWidth: '800px', width: '100%' }}>
          <h2 className="text-cyan" style={{ marginBottom: '1rem' }}>URBAN FLOOD SURVIVAL</h2>
          <p className="pixel-text text-muted">
            You are a single rescue responder navigating the flooded streets of Mumbai. 
            Find stranded civilians, avoid deadly hazards, and escort everyone to the 
            elevated safe zone before the waters take over completely. 
            Choose your routes wisely.
          </p>
        </div>
      </section>
    </div>
  );
};
