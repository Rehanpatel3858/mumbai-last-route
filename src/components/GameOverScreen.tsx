import { useEffect, useState } from 'react';

interface Props {
  saved: number;
  rescued: number;
  maxFlood: number;
  onRetry: () => void;
  onMenu: () => void;
}

export function GameOverScreen({ saved, rescued, maxFlood, onRetry, onMenu }: Props) {
  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setRevealed(true), 300);
    return () => clearTimeout(id);
  }, []);

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center fade-in p-4">
      <div className="absolute inset-0 bg-[#08050a]/94" />
      <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 50% 42%, rgba(255,0,85,0.32), transparent 62%)' }} />
      {/* drifting red particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 18 }).map((_, i) => (
          <span
            key={i}
            className="absolute w-1 h-1 rounded-full bg-[#FF0055]"
            style={{
              left: `${(i * 53) % 100}%`,
              top: `${(i * 37) % 100}%`,
              opacity: 0.2 + (i % 3) * 0.15,
              transform: `translateY(${revealed ? -20 : 0}px)`,
              transition: `transform ${2 + (i % 4)}s linear ${i * 0.1}s`,
            }}
          />
        ))}
      </div>

      <div className="relative slide-up flex flex-col items-center text-center max-w-md w-full">
        <div className="mb-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#FF0055] blink" />
          <span className="font-display text-[10px] tracking-[0.4em] text-[#FF0055]/80">EVACUATION FAILURE</span>
          <span className="w-2 h-2 rounded-full bg-[#FF0055] blink" />
        </div>

        <h1 className="font-display font-black text-4xl sm:text-6xl neon-magenta leading-[0.9] mb-1">EVACUATION</h1>
        <h1 className="font-display font-black text-4xl sm:text-6xl text-[#FF0055] leading-[0.9]" style={{ textShadow: '0 0 28px rgba(255,0,85,0.8), 0 0 60px rgba(255,0,85,0.4)' }}>FAILED</h1>

        <p className="mt-5 font-display text-sm tracking-[0.2em] text-white/65">FLOOD CRITICAL</p>
        <p className="mt-1 font-game text-xs text-white/45 max-w-xs leading-snug">The neighborhood was completely submerged before evacuation.</p>

        <div className={`mt-8 glass glass-magenta rounded-xl px-6 py-5 w-full transition-all duration-500 ${revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="flex items-center justify-between py-2 border-b border-[#FF0055]/20">
            <span className="font-display text-xs tracking-[0.18em] text-white/70">CIVILIANS SAVED</span>
            <span className="font-display font-black text-3xl neon-magenta">{saved}/6</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-[#FF0055]/20">
            <span className="font-display text-xs tracking-[0.18em] text-white/50">CIVILIANS RESCUED</span>
            <span className="font-display font-bold text-lg text-white/55">{rescued}/6</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="font-display text-xs tracking-[0.18em] text-white/70">MAX FLOOD REACHED</span>
            <span className="font-display font-bold text-lg neon-magenta">{Math.round(maxFlood)}%</span>
          </div>
        </div>

        <div className="flex flex-col gap-3 mt-8 w-full">
          <button className="btn-game magenta" onClick={onRetry}>↻ TRY AGAIN</button>
          <button className="btn-game bg-black/40 text-white border-white/20 hover:border-white/40" onClick={onMenu}>≡ MAIN MENU</button>
        </div>
      </div>
    </div>
  );
}
