import { useEffect, useRef, useState } from 'react';
import { Game } from './game/engine';
import { PublicState, GameScreen } from './game/constants';
import { sfx, resumeAudio, setVolume, setToggle } from './game/audio';
import { HUD } from './components/HUD';
import { MainMenu } from './components/MainMenu';
import { HowTo } from './components/HowTo';
import { GameInfo } from './components/GameInfo';
import { GameOverScreen } from './components/GameOverScreen';
import { WinScreen } from './components/WinScreen';
import { IntroOverlay } from './components/IntroOverlay';
import { MobileControls } from './components/MobileControls';
import { TacticalMap } from './components/TacticalMap';
import { SettingsScreen } from './components/SettingsScreen';
import { OrientationLock } from './components/OrientationLock';
import { LevelSelectScreen } from './components/LevelSelectScreen';

const INITIAL: PublicState = {
  screen: 'menu',
  health: 100,
  stamina: 100,
  rescued: 0,
  saved: 0,
  flood: 10,
  timeLeft: 300,
  objective: 'Rescue 3 stranded civilians and reach the elevated Safe Zone.',
  alert: null,
  routeABlocked: false,
  routeBBlocked: false,
  playerInSafe: false,
};

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<Game | null>(null);
  const [state, setState] = useState<PublicState>(INITIAL);
  const [screen, setScreen] = useState<GameScreen>('menu');
  const [alert, setAlert] = useState<string | null>(null);
  const [showIntro, setShowIntro] = useState(false);
  const [isTouch, setIsTouch] = useState(false);
  const [showMap, setShowMap] = useState(false);

  // Load audio settings from localStorage or default values
  const [audioState, setAudioState] = useState(() => {
    const getLocal = (k: string, def: number) => {
      const v = localStorage.getItem(k);
      return v ? parseFloat(v) : def;
    };
    const getLocalBool = (k: string, def: boolean) => {
      const v = localStorage.getItem(k);
      return v !== null ? v === 'true' : def;
    };
    return {
      masterVol: getLocal('mumbai_last_route_audio_master', 0.6),
      musicVol: getLocal('mumbai_last_route_audio_music', 0.5),
      sfxVol: getLocal('mumbai_last_route_audio_sfx', 0.6),
      ambienceVol: getLocal('mumbai_last_route_audio_ambience', 0.5),
      musicEnabled: getLocalBool('mumbai_last_route_audio_music_enabled', true),
      sfxEnabled: getLocalBool('mumbai_last_route_audio_sfx_enabled', true),
      ambienceEnabled: getLocalBool('mumbai_last_route_audio_ambience_enabled', true),
    };
  });

  const handleSetVolume = (type: 'master' | 'music' | 'sfx' | 'ambience', val: number) => {
    setVolume(type, val);
    setAudioState(s => ({ ...s, [`${type}Vol`]: val }));
    localStorage.setItem(`mumbai_last_route_audio_${type}`, val.toString());
  };

  const handleSetToggle = (type: 'music' | 'sfx' | 'ambience', val: boolean) => {
    setToggle(type, val);
    setAudioState(s => ({ ...s, [`${type}Enabled`]: val }));
    localStorage.setItem(`mumbai_last_route_audio_${type}_enabled`, val.toString());
  };

  const [levelUnlocked, setLevelUnlocked] = useState(() => {
    const v = localStorage.getItem('mumbai_last_route_level_unlocked');
    return v ? parseInt(v, 10) : 1;
  });

  const handleScreenChange = (s: GameScreen) => {
    setScreen(s);
    if (s === 'won') {
      setLevelUnlocked(prev => {
        const next = Math.max(prev, 2);
        localStorage.setItem('mumbai_last_route_level_unlocked', next.toString());
        return next;
      });
    }
  };

  // Auto-detect touchscreen dynamically/statically and persist settings
  const isTouchDevice = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
  const [controlMode, setControlMode] = useState<'keyboard' | 'mobile'>(() => {
    const saved = localStorage.getItem('mumbai_last_route_control_mode');
    if (saved === 'keyboard' || saved === 'mobile') return saved;
    return isTouchDevice ? 'mobile' : 'keyboard';
  });

  const handleSetControlMode = (mode: 'keyboard' | 'mobile') => {
    setControlMode(mode);
    localStorage.setItem('mumbai_last_route_control_mode', mode);
  };

  useEffect(() => {
    if (!canvasRef.current) return;
    const game = new Game(canvasRef.current, {
      onState: setState,
      onScreen: handleScreenChange,
      onAlert: setAlert,
    });
    gameRef.current = game;

    // Apply persisted audio engine volumes/toggles on mount
    setVolume('master', audioState.masterVol);
    setVolume('music', audioState.musicVol);
    setVolume('sfx', audioState.sfxVol);
    setVolume('ambience', audioState.ambienceVol);
    setToggle('music', audioState.musicEnabled);
    setToggle('sfx', audioState.sfxEnabled);
    setToggle('ambience', audioState.ambienceEnabled);

    // start in menu (rendering ambient menu background)
    game.running = true;
    game.screen = 'menu';
    game.lastTime = performance.now();
    game.loop(game.lastTime);

    const onResize = () => game.resize();
    window.addEventListener('resize', onResize);
    
    const onTouch = () => setIsTouch(true);
    window.addEventListener('touchstart', onTouch, { once: true });
    
    // Tap to resume/unlock Web Audio on mobile
    const unlock = () => {
      resumeAudio();
    };
    window.addEventListener('pointerdown', unlock);
    
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('touchstart', onTouch);
      window.removeEventListener('pointerdown', unlock);
      game.stop();
    };
  }, []);

  // keyboard input -> game
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault();
      resumeAudio();
      if (e.code === 'KeyM') setShowMap(m => !m);
      if (e.code === 'Escape') {
        if (showMap) setShowMap(false);
        else gameRef.current?.togglePause();
      }
      gameRef.current?.setKey(e.code, true);
    };
    const up = (e: KeyboardEvent) => gameRef.current?.setKey(e.code, false);
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);

  const startMission = () => {
    sfx.click();
    resumeAudio();
    setShowIntro(true);
    setTimeout(() => {
      setShowIntro(false);
      gameRef.current?.start();
    }, 1800);
  };

  const goScreen = (s: GameScreen) => {
    sfx.click();
    if (s === 'menu') {
      gameRef.current?.goMenu();
    } else {
      setScreen(s);
    }
  };

  const restart = () => {
    sfx.click();
    setShowIntro(true);
    setTimeout(() => {
      setShowIntro(false);
      gameRef.current?.start();
    }, 1400);
  };

  const toggleAudio = () => {
    const next = !audioState.musicEnabled;
    handleSetToggle('music', next);
    handleSetToggle('sfx', next);
    handleSetToggle('ambience', next);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#07111F] no-select" 
         style={{ touchAction: 'none' }}>
      <canvas ref={canvasRef} className="absolute inset-0 block touch-none" />

      {/* subtle scanline overlay for CRT game feel */}
      <div className="pointer-events-none absolute inset-0 scanlines" />

      {/* Portrait mode orientation overlay block */}
      <OrientationLock />

      {screen === 'playing' && <HUD state={state} isTouch={controlMode === 'mobile'} />}

      {showIntro && <IntroOverlay />}

      {screen === 'menu' && (
        <MainMenu
          onStart={() => goScreen('levelselect')}
          onHowTo={() => goScreen('howto')}
          onSettings={() => goScreen('settings')}
          onInfo={() => goScreen('info')}
          audioOn={audioState.musicEnabled && audioState.sfxEnabled}
          onToggleAudio={toggleAudio}
        />
      )}
      {screen === 'levelselect' && (
        <LevelSelectScreen
          onBack={() => goScreen('menu')}
          onSelectLevel={(id) => {
            if (id === 1) startMission();
          }}
          levelUnlocked={levelUnlocked}
        />
      )}
      {screen === 'howto' && <HowTo onBack={() => goScreen('menu')} />}
      {screen === 'settings' && (
        <SettingsScreen
          onBack={() => goScreen('menu')}
          controlMode={controlMode}
          onSetControlMode={handleSetControlMode}
          audioState={audioState}
          onSetVolume={handleSetVolume}
          onSetToggle={handleSetToggle}
        />
      )}
      {screen === 'info' && <GameInfo onBack={() => goScreen('menu')} />}

      {screen === 'lost' && (
        <GameOverScreen saved={state.saved} rescued={state.rescued} maxFlood={state.flood} onRetry={restart} onMenu={() => goScreen('menu')} />
      )}
      {screen === 'won' && <WinScreen saved={state.saved} onPlayAgain={restart} onMenu={() => goScreen('menu')} />}

      {/* alert banner during play */}
      {screen === 'playing' && alert && <AlertBanner text={alert} />}
      
      {screen === 'playing' && controlMode === 'mobile' && (
        <MobileControls 
          state={state} 
          onJoystick={(v) => gameRef.current?.setJoystick(v)} 
          onRescue={() => gameRef.current?.tryRescue()}
          onEnter={() => gameRef.current?.tryEnter()}
          onMap={() => setShowMap(m => !m)}
          onPause={() => gameRef.current?.togglePause()}
        />
      )}
      
      {showMap && screen === 'playing' && <TacticalMap state={state} onClose={() => setShowMap(false)} />}
      
      {state.paused && !showMap && screen === 'playing' && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm flex items-center justify-center pointer-events-none">
          <div className="text-center slide-up pointer-events-auto">
            <h1 className="font-display font-black text-5xl neon-cyan mb-4">PAUSED</h1>
            <button className="btn-game" onClick={() => gameRef.current?.togglePause()}>RESUME</button>
          </div>
        </div>
      )}
    </div>
  );
}

function AlertBanner({ text }: { text: string }) {
  const isRouteA = text.includes('ROUTE A');
  const isRouteB = text.includes('ROUTE B');
  const isSaved = text.includes('SAVED');
  const isRescued = text.includes('RESCUED');
  const color = (isRouteA || isRouteB) ? 'magenta' : isSaved ? 'green' : isRescued ? 'cyan' : 'cyan';
  const icon = (isRouteA || isRouteB) ? '⚠' : isSaved ? '✓' : isRescued ? '◆' : '◉';
  return (
    <div className="pointer-events-none fixed top-[88px] left-1/2 -translate-x-1/2 z-30 alert-in">
      <div className={`glass ${color === 'magenta' ? 'glass-magenta' : color === 'green' ? 'glass-green' : ''} px-5 py-3 rounded-xl text-center max-w-[92vw] flex items-center gap-3`}>
        <span className={`text-xl ${color === 'magenta' ? 'neon-magenta' : color === 'green' ? 'neon-green' : 'neon-cyan'} ${color === 'magenta' ? 'blink' : ''}`}>{icon}</span>
        <p className={`font-display font-bold text-xs sm:text-sm tracking-[0.1em] ${color === 'magenta' ? 'neon-magenta' : color === 'green' ? 'neon-green' : 'neon-cyan'} ${color === 'magenta' ? 'shake-alert' : ''}`}>
          {text}
        </p>
      </div>
    </div>
  );
}

export default App;
