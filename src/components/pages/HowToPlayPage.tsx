import React from 'react';
import { useGameState } from '../../context/GameStateContext';

export const HowToPlayPage: React.FC = () => {
  const { setCurrentView } = useGameState();

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
      <h1 className="text-center text-cyan" style={{ marginBottom: '0.5rem' }}>HOW TO PLAY</h1>
      <h3 className="text-center text-muted" style={{ marginBottom: '2rem' }}>RESCUE. NAVIGATE. SURVIVE.</h3>

      <div className="game-panel" style={{ maxWidth: '800px', margin: '0 auto 2rem' }}>
        <h2 className="text-cyan" style={{ marginBottom: '1.5rem', borderBottom: '2px solid var(--panel-border)', paddingBottom: '0.5rem' }}>CONTROLS</h2>
        
        <div className="flex-column gap-3" style={{ maxWidth: '400px', margin: '0 auto' }}>
          <div className="flex-between">
            <div className="pixel-text" style={{ fontSize: '1.5rem' }}>
              <span className="game-button" style={{ padding: '0.2rem 0.5rem', cursor: 'default' }}>W</span><br/>
              <span className="game-button" style={{ padding: '0.2rem 0.5rem', cursor: 'default' }}>A</span>
              <span className="game-button" style={{ padding: '0.2rem 0.5rem', cursor: 'default' }}>S</span>
              <span className="game-button" style={{ padding: '0.2rem 0.5rem', cursor: 'default' }}>D</span>
            </div>
            <span className="pixel-text text-muted" style={{ fontSize: '1.5rem' }}>MOVE</span>
          </div>
          
          <div className="flex-between">
            <span className="game-button" style={{ padding: '0.2rem 0.5rem', cursor: 'default' }}>E</span>
            <span className="pixel-text text-muted" style={{ fontSize: '1.5rem' }}>RESCUE CIVILIAN</span>
          </div>
          
          <div className="flex-between">
            <span className="game-button" style={{ padding: '0.2rem 0.5rem', cursor: 'default' }}>M</span>
            <span className="pixel-text text-muted" style={{ fontSize: '1.5rem' }}>OPEN MAP</span>
          </div>

          <div className="flex-between">
            <span className="game-button" style={{ padding: '0.2rem 0.5rem', cursor: 'default' }}>ESC</span>
            <span className="pixel-text text-muted" style={{ fontSize: '1.5rem' }}>PAUSE</span>
          </div>
        </div>
      </div>

      <div className="flex-column gap-2" style={{ maxWidth: '800px', margin: '0 auto 2rem' }}>
        <div className="game-panel">
          <h2 className="text-cyan">01 — EXPLORE</h2>
          <p className="pixel-text text-muted">Move around the flooded Mumbai neighborhood. Find stranded civilians.</p>
        </div>

        <div className="game-panel">
          <h2 className="text-cyan">02 — RESCUE</h2>
          <p className="pixel-text text-muted">Approach a civilian and press E. The civilian will follow you.</p>
        </div>

        <div className="game-panel">
          <h2 className="text-cyan">03 — WATCH THE FLOOD</h2>
          <p className="pixel-text text-muted">Water continuously rises. Some roads will become dangerous or blocked.</p>
        </div>

        <div className="game-panel">
          <h2 className="text-cyan">04 — CHOOSE YOUR ROUTE</h2>
          <p className="pixel-text text-muted">Take a fast dangerous route or a safer longer route.</p>
        </div>

        <div className="game-panel">
          <h2 className="text-cyan">05 — AVOID HAZARDS</h2>
          <p className="pixel-text text-muted">Avoid: open manholes, electrical hazards, vehicles, debris, and flood surges.</p>
        </div>

        <div className="game-panel">
          <h2 className="text-cyan">06 — REACH SAFETY</h2>
          <p className="pixel-text text-muted">Escort rescued civilians to the elevated safe zone. Reach it before the flood becomes critical.</p>
        </div>
      </div>

      <div className="game-panel" style={{ maxWidth: '800px', margin: '0 auto 2rem' }}>
        <h2 className="text-cyan text-center" style={{ marginBottom: '1.5rem' }}>FLOOD SYSTEM</h2>
        
        <div className="flex-between text-center pixel-text gap-2">
          <div style={{ flex: 1, backgroundColor: 'rgba(76, 201, 240, 0.1)', border: '2px solid var(--accent-cyan)', padding: '1rem' }}>
            <div className="text-cyan" style={{ fontSize: '1.5rem' }}>LOW</div>
            <div className="text-muted">0–25%</div>
          </div>
          <div style={{ flex: 1, backgroundColor: 'rgba(67, 97, 238, 0.1)', border: '2px solid var(--accent-blue)', padding: '1rem' }}>
            <div className="text-cyan" style={{ fontSize: '1.5rem' }}>RISING</div>
            <div className="text-muted">25–50%</div>
          </div>
          <div style={{ flex: 1, backgroundColor: 'rgba(255, 119, 0, 0.1)', border: '2px solid var(--orange-warning)', padding: '1rem' }}>
            <div className="text-cyan" style={{ fontSize: '1.5rem' }}>HIGH</div>
            <div className="text-muted">50–80%</div>
          </div>
          <div style={{ flex: 1, backgroundColor: 'rgba(247, 37, 133, 0.1)', border: '2px solid var(--accent-red)', padding: '1rem' }}>
            <div className="text-red" style={{ fontSize: '1.5rem' }}>CRITICAL</div>
            <div className="text-muted">80–100%</div>
          </div>
        </div>
        
        <p className="pixel-text text-center text-muted" style={{ marginTop: '1rem' }}>
          "The higher the flood level, the fewer safe routes remain."
        </p>
      </div>

      <div className="game-panel text-center" style={{ maxWidth: '800px', margin: '0 auto 2rem', borderColor: 'var(--accent-cyan)' }}>
        <h3 className="text-cyan" style={{ marginBottom: '0.5rem' }}>YOUR MAIN OBJECTIVE</h3>
        <p className="pixel-text" style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>
          RESCUE CIVILIANS AND REACH THE SAFE ZONE BEFORE THE FLOOD TAKES OVER.
        </p>
        
        <h3 className="text-red" style={{ marginBottom: '0.5rem' }}>REMEMBER</h3>
        <p className="pixel-text text-muted" style={{ fontSize: '1.2rem' }}>
          The fastest route is not always the safest route.
        </p>
      </div>

      <div className="text-center">
        <button className="game-button" onClick={() => setCurrentView('mission-select')}>PLAY NOW</button>
      </div>
    </div>
  );
};
