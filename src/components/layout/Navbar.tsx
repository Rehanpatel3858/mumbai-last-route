import React from 'react';
import { useGameState } from '../../context/GameStateContext';

export const Navbar: React.FC = () => {
  const { currentView, setCurrentView } = useGameState();

  const handleStartQuickPlay = () => {
    setCurrentView('briefing');
  };

  return (
    <header className="navbar">
      <div 
        onClick={() => setCurrentView('landing')}
        className="navbar-brand"
      >
        MUMBAI: <span className="text-cyan">LAST SAFE ROUTE</span>
      </div>

      <nav className="navbar-nav">
        <button
          onClick={() => setCurrentView('landing')}
          className={`nav-link ${currentView === 'landing' ? 'active' : ''}`}
        >
          HOME
        </button>
        <button
          onClick={() => setCurrentView('mission-select')}
          className={`nav-link ${currentView === 'mission-select' ? 'active' : ''}`}
        >
          MISSIONS
        </button>
        <button
          onClick={() => setCurrentView('how-to-play')}
          className={`nav-link ${currentView === 'how-to-play' ? 'active' : ''}`}
        >
          HOW TO PLAY
        </button>
        <button
          onClick={() => setCurrentView('leaderboard')}
          className={`nav-link ${currentView === 'leaderboard' ? 'active' : ''}`}
        >
          LEADERBOARD
        </button>
      </nav>

      <button
        onClick={handleStartQuickPlay}
        className="game-button"
        style={{ fontSize: '1rem', padding: '0.4rem 1rem' }}
      >
        PLAY NOW
      </button>
    </header>
  );
};
