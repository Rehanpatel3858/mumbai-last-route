import { useState } from 'react';

interface Props {
  onBack: () => void;
  controlMode: 'keyboard' | 'mobile';
  onSetControlMode: (mode: 'keyboard' | 'mobile') => void;
  
  // Audio state & updates
  audioState: {
    masterVol: number;
    musicVol: number;
    sfxVol: number;
    ambienceVol: number;
    musicEnabled: boolean;
    sfxEnabled: boolean;
    ambienceEnabled: boolean;
  };
  onSetVolume: (type: 'master' | 'music' | 'sfx' | 'ambience', val: number) => void;
  onSetToggle: (type: 'music' | 'sfx' | 'ambience', val: boolean) => void;
}

const Key = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded border border-cyan-400/40 bg-cyan-400/10 font-display font-bold text-xs neon-cyan">
    {children}
  </span>
);

const Row = ({ k, label }: { k: React.ReactNode; label: string }) => (
  <div className="flex items-center gap-3 py-1.5 border-b border-white/5 last:border-0">
    <div className="flex gap-1 w-[160px] shrink-0">{k}</div>
    <span className="text-white/80 text-sm tracking-wide">{label}</span>
  </div>
);

const VolumeSlider = ({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) => (
  <div className="flex flex-col gap-1.5 w-full">
    <div className="flex justify-between text-xs font-display tracking-wider text-white/70">
      <span>{label}</span>
      <span className="text-cyan-300 font-bold">{Math.round(value * 100)}%</span>
    </div>
    <input
      type="range"
      min="0"
      max="1"
      step="0.05"
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-white/10 rounded-lg appearance-none"
    />
  </div>
);

const MuteToggle = ({ label, enabled, onToggle }: { label: string; enabled: boolean; onToggle: () => void }) => (
  <div className="flex justify-between items-center w-full py-1.5 border-b border-white/5 last:border-0">
    <span className="text-xs font-display tracking-wider text-white/70">{label}</span>
    <button
      onClick={onToggle}
      className={`px-4 py-1.5 rounded font-display text-[10px] tracking-widest border transition-all ${
        enabled
          ? 'bg-cyan-400/20 border-cyan-400 text-cyan-300 shadow-[0_0_8px_rgba(0,243,255,0.25)] font-bold'
          : 'border-white/20 text-white/50 hover:border-white/40'
      }`}
    >
      {enabled ? 'ON' : 'OFF'}
    </button>
  </div>
);

export function SettingsScreen({ 
  onBack, 
  controlMode, 
  onSetControlMode, 
  audioState,
  onSetVolume,
  onSetToggle
}: Props) {
  const [activeTab, setActiveTab] = useState<'controls' | 'display' | 'audio'>('controls');

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center fade-in p-4">
      <div className="absolute inset-0 bg-[#07111F]/88 backdrop-blur-sm" />
      <div className="relative glass rounded-2xl p-6 sm:p-8 max-w-2xl w-full max-h-[88vh] overflow-y-auto slide-up flex flex-col">
        
        {/* Header */}
        <div>
          <h2 className="font-display font-black text-2xl sm:text-3xl neon-cyan mb-1">SETTINGS</h2>
          <p className="text-white/60 text-xs font-display tracking-wider mb-6">GAMEPLAY & INTERFACE CONFIGURATION</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-cyan-400/20 mb-6 gap-2">
          {(['controls', 'display', 'audio'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-display text-xs tracking-widest uppercase transition-all border-b-2 -mb-[2px] ${
                activeTab === tab
                  ? 'border-cyan-400 text-cyan-300 font-bold neon-cyan'
                  : 'border-transparent text-white/50 hover:text-white/80'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 min-h-[260px] overflow-y-auto">
          {activeTab === 'controls' && (
            <div className="space-y-6">
              {/* Mode Selector */}
              <div className="flex flex-col gap-2">
                <span className="text-white/60 text-xs font-display tracking-wider">ACTIVE CONTROL SCHEME</span>
                <div className="flex gap-3">
                  <button
                    onClick={() => onSetControlMode('keyboard')}
                    className={`flex-1 py-2.5 rounded font-display text-xs tracking-widest border transition-all ${
                      controlMode === 'keyboard'
                        ? 'bg-cyan-400/25 border-cyan-400 text-cyan-300 font-bold shadow-[0_0_15px_rgba(0,243,255,0.25)]'
                        : 'border-white/20 text-white/60 hover:border-white/40'
                    }`}
                  >
                    [ KEYBOARD ]
                  </button>
                  <button
                    onClick={() => onSetControlMode('mobile')}
                    className={`flex-1 py-2.5 rounded font-display text-xs tracking-widest border transition-all ${
                      controlMode === 'mobile'
                        ? 'bg-cyan-400/25 border-cyan-400 text-cyan-300 font-bold shadow-[0_0_15px_rgba(0,243,255,0.25)]'
                        : 'border-white/20 text-white/60 hover:border-white/40'
                    }`}
                  >
                    [ MOBILE ]
                  </button>
                </div>
              </div>

              {/* Control Guides */}
              <div>
                <h3 className="font-display text-sm neon-cyan mb-3 tracking-wider uppercase">{controlMode} Guide</h3>
                
                {controlMode === 'keyboard' && (
                  <div className="space-y-1">
                    <Row k={<><Key>W</Key><Key>A</Key><Key>S</Key><Key>D</Key></>} label="Move player around neighborhood" />
                    <Row k={<><Key>↑</Key><Key>↓</Key><Key>←</Key><Key>→</Key></>} label="Move player (arrow keys)" />
                    <Row k={<Key>SHIFT</Key>} label="Sprint (moves faster, drains stamina)" />
                    <Row k={<Key>E</Key>} label="Rescue civilian / interact near building" />
                    <Row k={<Key>M</Key>} label="Open or close tactical map" />
                    <Row k={<Key>ESC</Key>} label="Pause gameplay simulation" />
                  </div>
                )}

                {controlMode === 'mobile' && (
                  <div className="space-y-1">
                    <Row k={<Key>JOYSTICK</Key>} label="Drag bottom-left virtual joystick to move" />
                    <Row k={<Key>RESCUE</Key>} label="Rescue civilian (appears near stranded people)" />
                    <Row k={<Key>ENTER</Key>} label="Enter building / interact (appears near chawls)" />
                    <Row k={<Key>MAP</Key>} label="Open tactical map overlay" />
                    <Row k={<Key>PAUSE</Key>} label="Pause gameplay simulation" />
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'display' && (
            <div className="space-y-4">
              <div className="glass border-cyan-400/35 rounded-lg p-4">
                <h3 className="font-display text-xs neon-cyan mb-1 tracking-wider">MOBILE ORIENTATION</h3>
                <p className="text-white/80 text-xs leading-relaxed">
                  Mumbai: Last Route mobile gameplay requires <span className="neon-cyan">LANDSCAPE</span> orientation mode.
                  If you load the game on a phone in portrait mode, you will be prompted to rotate it. Ensure system auto-rotate is enabled.
                </p>
              </div>

              <div className="glass border-cyan-400/35 rounded-lg p-4">
                <h3 className="font-display text-xs neon-cyan mb-1 tracking-wider">CANVAS SCALING</h3>
                <p className="text-white/80 text-xs leading-relaxed">
                  The rendering system adjusts the aspect ratio and zoom automatically. No black bars or aspect ratio distortion will be present.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'audio' && (
            <div className="grid sm:grid-cols-2 gap-6 p-1">
              {/* Sliders Column */}
              <div className="space-y-4">
                <h3 className="font-display text-sm neon-cyan mb-2 tracking-wider uppercase">Volume Settings</h3>
                <VolumeSlider 
                  label="MASTER VOLUME" 
                  value={audioState.masterVol} 
                  onChange={(v) => onSetVolume('master', v)} 
                />
                <VolumeSlider 
                  label="MUSIC VOLUME" 
                  value={audioState.musicVol} 
                  onChange={(v) => onSetVolume('music', v)} 
                />
                <VolumeSlider 
                  label="SFX VOLUME" 
                  value={audioState.sfxVol} 
                  onChange={(v) => onSetVolume('sfx', v)} 
                />
                <VolumeSlider 
                  label="AMBIENCE VOLUME" 
                  value={audioState.ambienceVol} 
                  onChange={(v) => onSetVolume('ambience', v)} 
                />
              </div>

              {/* Toggles Column */}
              <div className="space-y-4">
                <h3 className="font-display text-sm neon-cyan mb-2 tracking-wider uppercase">Toggles</h3>
                <div className="space-y-2">
                  <MuteToggle 
                    label="MUSIC" 
                    enabled={audioState.musicEnabled} 
                    onToggle={() => onSetToggle('music', !audioState.musicEnabled)} 
                  />
                  <MuteToggle 
                    label="SOUND EFFECTS" 
                    enabled={audioState.sfxEnabled} 
                    onToggle={() => onSetToggle('sfx', !audioState.sfxEnabled)} 
                  />
                  <MuteToggle 
                    label="AMBIENCE (RAIN & CITY)" 
                    enabled={audioState.ambienceEnabled} 
                    onToggle={() => onSetToggle('ambience', !audioState.ambienceEnabled)} 
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 flex justify-end">
          <button className="btn-game" onClick={onBack}>◀ BACK</button>
        </div>
      </div>
    </div>
  );
}
