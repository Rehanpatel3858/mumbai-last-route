import { useEffect, useState } from 'react';

interface Props {
  saved: number;
  onPlayAgain: () => void;
  onMenu: () => void;
}

export function WinScreen({ saved, onPlayAgain, onMenu }: Props) {
  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setRevealed(true), 350);
    return () => clearTimeout(id);
  }, []);

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center fade-in p-4">
      <div className="absolute inset-0 bg-[#06121c]/93" />
      <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 50% 42%, rgba(16,185,129,0.3), rgba(0,243,255,0.12) 40%, transparent 65%)' }} />
      {/* rising celebration particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 24 }).map((_, i) => (
          <span
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${(i * 41) % 100}%`,
              bottom: `-10px`,
              width: `${2 + (i % 3)}px`,
              height: `${2 + (i % 3)}px`,
              background: i % 2 ? '#00F3FF' : '#10B981',
              opacity: 0.3 + (i % 4) * 0.12,
              transform: `translateY(${revealed ? -380 - (i % 5) * 60 : 0}px)`,
              transition: `transform ${3 + (i % 4)}s linear ${i * 0.08}s`,
              boxShadow: `0 0 8px ${i % 2 ? '#00F3FF' : '#10B981'}`,
            }}
          />
        ))}
      </div>

      <div className="relative slide-up flex flex-col items-center text-center max-w-md w-full">
        <div className="mb-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#10B981] blink" />
          <span className="font-display text-[10px] tracking-[0.4em] text-[#10B981]/90">MISSION SUCCESS</span>
          <span className="w-2 h-2 rounded-full bg-[#10B981] blink" />
        </div>

        <h1 className="font-display font-black text-4xl sm:text-6xl neon-green leading-[0.9] mb-1">MISSION</h1>
        <h1 className="font-display font-black text-4xl sm:text-6xl text-[#10B981] leading-[0.9]" style={{ textShadow: '0 0 28px rgba(16,185,129,0.8), 0 0 60px rgba(0,243,255,0.35)' }}>COMPLETE</h1>

        <p className="mt-5 font-display text-sm tracking-[0.2em] text-white/80">EVACUATION SUCCESSFUL</p>

        <div className={`mt-8 glass glass-green rounded-xl px-6 py-5 w-full transition-all duration-500 ${revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="flex items-center justify-between py-2 border-b border-[#10B981]/20">
            <span className="font-display text-xs tracking-[0.18em] text-white/70">CIVILIANS SAVED</span>
            <span className="font-display font-black text-3xl neon-green">{saved}/6</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="font-display text-xs tracking-[0.18em] text-white/70">HERO RANK</span>
            <span className="font-display font-black text-4xl neon-cyan rank-pop" style={{ textShadow: '0 0 22px rgba(0,243,255,0.8)' }}>A</span>
          </div>
        </div>

        <div className="flex flex-col gap-3 mt-8 w-full">
          <button className="btn-game green" onClick={onPlayAgain}>▶ PLAY AGAIN</button>
          <button className="btn-game bg-black/40 text-white border-white/20 hover:border-white/40" onClick={onMenu}>≡ MAIN MENU</button>
        </div>
      </div>
    </div>
  );
}
