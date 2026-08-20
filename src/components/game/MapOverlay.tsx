import React from 'react';

export interface MapData {
  player: { x: number; y: number };
  civilians: { x: number; y: number; isRescued: boolean }[];
  hazards: { x: number; y: number; type: string }[];
  safeZone: { x: number; y: number; width: number; height: number };
  mapWidth: number;
  mapHeight: number;
}

interface MapOverlayProps {
  data: MapData | null;
}

export const MapOverlay: React.FC<MapOverlayProps> = ({ data }) => {
  if (!data) return null;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: 'rgba(13, 19, 33, 0.95)',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}
    >
      <h2 style={{ fontFamily: 'var(--font-pixel-heading)', color: 'var(--accent-cyan)', marginBottom: '1rem' }}>
        MUMBAI — MISSION SECTOR
      </h2>
      
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '800px',
          aspectRatio: `${data.mapWidth} / ${data.mapHeight}`,
          backgroundColor: '#0f172a',
          border: '4px solid var(--panel-border)',
          overflow: 'hidden',
        }}
      >
        {/* Render Safe Zone */}
        <div
          style={{
            position: 'absolute',
            left: `${(data.safeZone.x / data.mapWidth) * 100}%`,
            top: `${(data.safeZone.y / data.mapHeight) * 100}%`,
            width: `${(data.safeZone.width / data.mapWidth) * 100}%`,
            height: `${(data.safeZone.height / data.mapHeight) * 100}%`,
            backgroundColor: 'rgba(74, 222, 128, 0.2)',
            border: '2px solid var(--accent-green)',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span style={{ color: 'var(--accent-green)', fontSize: '0.8rem', fontWeight: 'bold' }}>▲</span>
        </div>

        {/* Render Hazards */}
        {data.hazards.map((h, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${(h.x / data.mapWidth) * 100}%`,
              top: `${(h.y / data.mapHeight) * 100}%`,
              color: 'var(--accent-red)',
              transform: 'translate(-50%, -50%)',
              fontSize: '12px',
              fontWeight: 'bold',
            }}
          >
            ✕
          </div>
        ))}

        {/* Render Civilians */}
        {data.civilians.map((c, i) => {
          if (c.isRescued) return null; // Don't show rescued ones
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: `${(c.x / data.mapWidth) * 100}%`,
                top: `${(c.y / data.mapHeight) * 100}%`,
                color: '#facc15', // yellow for civilians
                transform: 'translate(-50%, -50%)',
                fontSize: '14px',
              }}
            >
              ●
            </div>
          );
        })}

        {/* Render Player */}
        <div
          style={{
            position: 'absolute',
            left: `${(data.player.x / data.mapWidth) * 100}%`,
            top: `${(data.player.y / data.mapHeight) * 100}%`,
            color: 'var(--accent-cyan)',
            transform: 'translate(-50%, -50%)',
            fontSize: '16px',
            textShadow: '0 0 5px var(--accent-cyan)',
          }}
        >
          ●
        </div>
      </div>

      <div style={{ marginTop: '1rem', fontFamily: 'var(--font-pixel)', color: 'var(--text-secondary)', display: 'flex', gap: '2rem' }}>
        <span><span style={{ color: 'var(--accent-cyan)' }}>●</span> YOU</span>
        <span><span style={{ color: '#facc15' }}>●</span> CIVILIAN</span>
        <span><span style={{ color: 'var(--accent-red)' }}>✕</span> HAZARD</span>
        <span><span style={{ color: 'var(--accent-green)' }}>▲</span> SAFE ZONE</span>
      </div>
      
      <div style={{ marginTop: '2rem', fontFamily: 'var(--font-pixel)', color: 'var(--text-secondary)' }}>
        PRESS M OR ESC TO CLOSE
      </div>
    </div>
  );
};
