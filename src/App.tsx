import React from 'react';
import { GameStateProvider, useGameState } from './context/GameStateContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';

// Pages
import { LandingPage } from './components/pages/LandingPage';
import { AboutPage } from './components/pages/AboutPage';
import { FeaturesPage } from './components/pages/FeaturesPage';
import { MissionSelectPage } from './components/pages/MissionSelectPage';
import { MissionBriefingPage } from './components/pages/MissionBriefingPage';
import { HowToPlayPage } from './components/pages/HowToPlayPage';
import { LeaderboardPage } from './components/pages/LeaderboardPage';
import { ProfilePage } from './components/pages/ProfilePage';
import { GameContainer } from './components/game/GameContainer';

const AppContent: React.FC = () => {
  const { currentView } = useGameState();

  const renderView = () => {
    switch (currentView) {
      case 'landing':
        return <LandingPage />;
      case 'about':
        return <AboutPage />;
      case 'features':
        return <FeaturesPage />;
      case 'mission-select':
        return <MissionSelectPage />;
      case 'briefing':
        return <MissionBriefingPage />;
      case 'how-to-play':
        return <HowToPlayPage />;
      case 'leaderboard':
        return <LeaderboardPage />;
      case 'profile':
        return <ProfilePage />;
      case 'game':
        return <GameContainer />;
      default:
        return <LandingPage />;
    }
  };

  const isGameView = currentView === 'game';

  React.useEffect(() => {
    if (isGameView) {
      document.body.classList.add('game-mode');
    } else {
      document.body.classList.remove('game-mode');
    }
    return () => document.body.classList.remove('game-mode');
  }, [isGameView]);

  if (isGameView) {
    return (
      <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <main style={{ flex: 1, position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column' }}>{renderView()}</main>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
      {/* Main Navbar */}
      <Navbar />

      {/* Page Content Container */}
      <main style={{ flex: 1, position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column' }}>{renderView()}</main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export function App() {
  return (
    <GameStateProvider>
      <AppContent />
    </GameStateProvider>
  );
}

export default App;
