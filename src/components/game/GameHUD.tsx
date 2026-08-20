import React from 'react';
import type { FloodPhase } from '../../game/systems/FloodSystem';

interface GameHUDProps {
  timeRemainingSeconds: number;
  health: number;
  currentPhase: FloodPhase;
  rescuedCount: number;
  totalCivilians: number;
  latestAlert: { sender: string; title: string; message: string; severity: string } | null;
  onPause: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  timeRemainingSeconds,
  health,
  currentPhase,
  rescuedCount,
  totalCivilians,
  latestAlert,
  onPause,
}) => {
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const floodPercentage = Math.min(100, Math.floor(((330 - timeRemainingSeconds) / 330) * 100));

  // Calculate health bar visuals
  const healthBars = Math.floor(health / 10);
  const healthBarString = '█'.repeat(healthBars) + ' '.repeat(10 - healthBars);
  let healthColor = 'var(--accent-green)';
  if (health <= 50) healthColor = 'var(--accent-orange)';
  if (health <= 20) healthColor = 'var(--accent-red)';

  return (
    <div className="hud-container" style={{ pointerEvents: 'none' }}>
      
      {/* Top Header Row */}
      <div className="flex-between" style={{ alignItems: 'flex-start', marginBottom: '1rem', padding: '1rem' }}>
        
        {/* Top Left: Title & Health */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <h1 className="text-white" style={{ fontSize: '1.2rem', margin: 0, lineHeight: 1.1 }}>
            MUMBAI:<br/>
            <span className="text-cyan">LAST SAFE ROUTE</span>
          </h1>
          <div className="game-panel" style={{ width: 'fit-content', padding: '0.4rem 0.8rem' }}>
            <div style={{ fontSize: '1rem', color: healthColor, fontFamily: 'monospace', whiteSpace: 'pre' }}>
              {healthBarString} <span style={{fontSize: '0.8rem'}}>{health}%</span>
            </div>
          </div>
        </div>

        {/* Top Center: Flood Level */}
        <div className="game-panel" style={{ flex: 1, padding: '0.5rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ flex: 1 }}>
            <div className="text-white" style={{ fontSize: '0.8rem', marginBottom: '0.2rem', fontFamily: 'monospace' }}>FLOOD LEVEL</div>
            <div style={{ height: '6px', backgroundColor: 'var(--panel-border)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: `${floodPercentage}%`, height: '100%', backgroundColor: 'var(--orange-warning)' }}></div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-white" style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{floodPercentage}%</div>
            <div className="text-orange" style={{ fontSize: '0.7rem', fontFamily: 'monospace' }}>{currentPhase.name.toUpperCase()}</div>
          </div>
        </div>

        {/* Top Right: Time & Pause */}
        <div className="flex-between" style={{ flex: 1, justifyContent: 'flex-end', gap: '1rem' }}>
          <div className="game-panel" style={{ padding: '0.5rem 1rem', textAlign: 'center' }}>
            <div className="text-cyan" style={{ fontSize: '0.7rem', fontFamily: 'monospace' }}>TIME LEFT</div>
            <div className="text-cyan" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{formatTime(timeRemainingSeconds)}</div>
          </div>
          <button 
            onClick={onPause}
            className="game-button game-button-secondary" 
            style={{ pointerEvents: 'auto', padding: '0.5rem 1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            PAUSE <span style={{ backgroundColor: 'var(--bg-color)', padding: '0.1rem 0.3rem', borderRadius: '4px', fontSize: '0.7rem' }}>ESC</span>
          </button>
        </div>
      </div>

      {/* Main Grid Area */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 1rem', height: 'calc(100% - 160px)' }}>
        
        {/* Left Column: Mission Objectives & Minimap */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '280px' }}>
          {/* Mission Panel */}
          <div className="game-panel" style={{ padding: '1rem' }}>
            <h3 className="text-white" style={{ fontSize: '1rem', marginBottom: '1rem' }}>MISSION 01: HINDMATA</h3>
            <div className="text-muted" style={{ fontSize: '0.8rem', fontFamily: 'monospace', marginBottom: '0.5rem' }}>OBJECTIVES</div>
            
            <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
              <div className="text-white" style={{ fontSize: '0.9rem' }}>
                <span style={{ color: rescuedCount >= 3 ? 'var(--accent-green)' : 'var(--text-secondary)' }}>
                  {rescuedCount >= 3 ? '☑' : '☐'}
                </span> Rescue 3 Citizens
              </div>
              <div className="text-orange" style={{ fontWeight: 'bold' }}>{rescuedCount} / 3</div>
            </div>
            
            <div>
              <div className="text-white" style={{ fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>☐</span> Reach the Safe Zone
              </div>
            </div>
          </div>

          {/* Minimap Placeholder */}
          <div className="game-panel" style={{ padding: '1rem' }}>
            <div className="text-white" style={{ fontSize: '0.8rem', fontFamily: 'monospace', marginBottom: '0.5rem' }}>MINIMAP</div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              {/* Fake Map Grid */}
              <div style={{ width: '100px', height: '100px', backgroundColor: 'var(--bg-color)', border: '1px solid var(--panel-border)', position: 'relative' }}>
                 <div style={{ position: 'absolute', top: '50%', left: '50%', width: '6px', height: '6px', backgroundColor: 'var(--accent-blue)', borderRadius: '50%', transform: 'translate(-50%, -50%)' }}></div>
                 <div style={{ position: 'absolute', top: '20%', left: '80%', width: '6px', height: '6px', backgroundColor: 'var(--accent-green)', borderRadius: '50%' }}></div>
                 <div style={{ position: 'absolute', top: '30%', left: '30%', width: '6px', height: '6px', backgroundColor: 'var(--orange-warning)' }}></div>
                 <div style={{ position: 'absolute', top: '70%', left: '20%', width: '6px', height: '6px', backgroundColor: 'var(--accent-red)' }}></div>
                 <div style={{ position: 'absolute', bottom: '10%', right: '10%', color: 'var(--accent-red)', fontSize: '10px' }}>✕</div>
              </div>
              <div style={{ flex: 1, fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ color: 'var(--accent-blue)' }}>●</span> You</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ color: 'var(--orange-warning)' }}>■</span> Civilian</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ color: 'var(--accent-green)' }}>▲</span> Safe Zone</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ color: 'var(--accent-red)' }}>●</span> Hazard</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ color: 'var(--accent-red)' }}>✕</span> Blocked Route</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Right Small Controls Overlay (Desktop) */}
      <div className="desktop-controls" style={{ position: 'absolute', bottom: '1rem', right: '1rem', display: 'flex', gap: '1rem', padding: '0.5rem 1rem', backgroundColor: 'rgba(29, 45, 68, 0.9)', border: '2px solid var(--panel-border)', borderRadius: '4px', zIndex: 40, pointerEvents: 'none' }}>
        <div className="text-muted" style={{ fontSize: '0.7rem', fontFamily: 'monospace' }}>
          <span className="text-white">WASD</span> MOVE
        </div>
        <div className="text-muted" style={{ fontSize: '0.7rem', fontFamily: 'monospace' }}>
          <span className="text-white">E</span> RESCUE
        </div>
        <div className="text-muted" style={{ fontSize: '0.7rem', fontFamily: 'monospace' }}>
          <span className="text-white">M</span> MAP
        </div>
        <div className="text-muted" style={{ fontSize: '0.7rem', fontFamily: 'monospace' }}>
          <span className="text-white">ESC</span> PAUSE
        </div>
      </div>

      {/* Bottom Right Mobile Controls */}
      <div className="mobile-controls" style={{ position: 'absolute', bottom: '2rem', right: '2rem', zIndex: 50 }}>
        <div style={{ display: 'flex', gap: '1rem', alignSelf: 'flex-end', marginBottom: '1rem' }}>
          <button 
            className="game-button game-button-primary" 
            style={{ padding: '1.2rem', fontSize: '1.2rem', borderRadius: '50%', width: '80px', height: '80px', border: '3px solid var(--accent-orange)' }}
            onClick={() => window.dispatchEvent(new Event('mobile-action-enter'))}
          >
            ENTER
          </button>
          <button 
            className="game-button game-button-primary" 
            style={{ padding: '1.2rem', fontSize: '1.2rem', borderRadius: '50%', width: '80px', height: '80px', border: '3px solid var(--accent-cyan)' }}
            onClick={() => window.dispatchEvent(new Event('mobile-action-rescue'))}
          >
            RESCUE
          </button>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            className="game-button game-button-secondary" 
            style={{ padding: '1rem', fontSize: '1rem', borderRadius: '12px', flex: 1 }}
            onClick={() => window.dispatchEvent(new Event('mobile-action-map'))}
          >
            MAP
          </button>
          <button 
            className="game-button game-button-secondary" 
            style={{ padding: '1rem', fontSize: '1rem', borderRadius: '12px', flex: 1 }}
            onClick={() => window.dispatchEvent(new Event('mobile-action-pause'))}
          >
            PAUSE
          </button>
        </div>
      </div>

      {/* Bottom Center Stats Panel */}
      <div style={{ position: 'absolute', bottom: '1rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '1rem' }}>
        <div className="game-panel" style={{ width: '180px', padding: '1rem', textAlign: 'center' }}>
          <div className="text-white" style={{ fontSize: '0.8rem', fontFamily: 'monospace', marginBottom: '0.5rem' }}>CIVILIANS</div>
          <div className="text-white" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>👤 {rescuedCount} / {totalCivilians}</div>
        </div>
        <div className="game-panel" style={{ width: '180px', padding: '1rem', textAlign: 'center' }}>
          <div className="text-orange" style={{ fontSize: '0.8rem', fontFamily: 'monospace', marginBottom: '0.5rem' }}>HAZARDS AVOIDED</div>
          <div className="text-white" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>💀 0</div>
        </div>
        <div className="game-panel" style={{ width: '180px', padding: '1rem', textAlign: 'center' }}>
          <div className="text-orange" style={{ fontSize: '0.8rem', fontFamily: 'monospace', marginBottom: '0.5rem' }}>SCORE</div>
          <div className="text-white" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>⭐ {rescuedCount * 100}</div>
        </div>
      </div>

      {latestAlert && (
        <div className="alert-box" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 100 }}>
          <h3 className="text-red" style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>{latestAlert.title}</h3>
          <p>{latestAlert.message}</p>
        </div>
      )}
    </div>
  );
};
