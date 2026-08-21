import { useEffect, useState } from 'react';

interface Props {
  onStart: () => void;
  onHowTo: () => void;
  onInfo: () => void;
  onSettings: () => void;
  audioOn: boolean;
  onToggleAudio: () => void;
}

export function MainMenu({ onStart, onHowTo, onInfo, onSettings, audioOn, onToggleAudio }: Props) {
  const [glitch, setGlitch] = useState(false);
  useEffect(() => {
    const id = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 130);
    }, 5200);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="fixed inset-0 z-20 flex flex-col items-center justify-center fade-in pointer-events-none">
      {/* atmospheric gradient over canvas */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#07111F]/72 via-[#07111F]/35 to-[#07111F]/88" />
      {/* top/bottom cinematic bars */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-[#07111F] to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#07111F] to-transparent" />

      {/* Audio toggle */}
      <button
        onClick={onToggleAudio}
        className="absolute top-4 right-4 pointer-events-auto glass rounded-lg px-3 py-2 text-[10px] font-display tracking-[0.15em] text-white/70 hover:text-cyan-300 transition"
      >
        {audioOn ? '♪ AUDIO ON' : '♪ AUDIO OFF'}
      </button>

      {/* emergency status top-left */}
      <div className="absolute top-4 left-4 pointer-events-none flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#FF0055] blink" />
        <span className="font-display text-[10px] tracking-[0.3em] text-[#FF0055]/85">LIVE · MONSOON CRISIS</span>
      </div>

      {/* Title block */}
      <div className="relative z-10 flex flex-col items-center pointer-events-auto px-4">
        <div className="mb-3 flex items-center gap-3">
          <span className="h-px w-10 bg-gradient-to-r from-transparent to-cyan-400/60" />
          <span className="font-display text-[10px] tracking-[0.4em] text-cyan-300/80">EMERGENCY RESPONSE</span>
          <span className="h-px w-10 bg-gradient-to-l from-transparent to-cyan-400/60" />
        </div>

        <h1
          className={`font-display font-black text-center leading-[0.88] ${glitch ? 'translate-x-[2px]' : ''}`}
          style={{ fontSize: 'clamp(2.8rem, 8.5vw, 5.8rem)' }}
        >
          <span className="block neon-cyan title-glow">MUMBAI:</span>
          <span className="block text-white" style={{ textShadow: '0 0 18px rgba(139,92,246,0.55), 0 0 44px rgba(0,153,255,0.3)' }}>LAST ROUTE</span>
        </h1>

        <p className="mt-5 font-display text-center text-[11px] sm:text-sm tracking-[0.2em] text-white/72 max-w-md leading-relaxed">
          SURVIVE THE MONSOON.<br />
          SAVE THE STRANDED.<br />
          <span className="neon-cyan">REACH THE SAFE ZONE.</span>
        </p>

        {/* Buttons */}
        <div className="mt-9 flex flex-col gap-3 w-[270px]">
          <button className="btn-game pulse-glow" onClick={onStart}>
            <span>▶</span> START MISSION
          </button>
          <button className="btn-game" onClick={onHowTo}>HOW TO PLAY</button>
          <button className="btn-game" onClick={onSettings}>SETTINGS</button>
          <button className="btn-game" onClick={onInfo}>GAME INFO</button>
        </div>

        <p className="mt-7 font-display text-[9px] tracking-[0.3em] text-white/30">
          v1.0 · COLLEGE TECH COMPETITION PROTOTYPE
        </p>
      </div>

      <CornerBrackets />
    </div>
  );
}

function CornerBrackets() {
  const c = 'absolute w-12 h-12 border-cyan-400/35 pointer-events-none';
  return (
    <>
      <div className={`${c} top-6 left-6 border-t-2 border-l-2`} />
      <div className={`${c} top-6 right-6 border-t-2 border-r-2`} />
      <div className={`${c} bottom-6 left-6 border-b-2 border-l-2`} />
      <div className={`${c} bottom-6 right-6 border-b-2 border-r-2`} />
    </>
  );
}
