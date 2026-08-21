import { useEffect, useState } from 'react';

export function IntroOverlay() {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const a = setTimeout(() => setPhase(1), 80);
    const b = setTimeout(() => setPhase(2), 700);
    const c = setTimeout(() => setPhase(3), 1300);
    return () => { clearTimeout(a); clearTimeout(b); clearTimeout(c); };
  }, []);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#07111F] fade-in">
      {/* radial atmosphere */}
      <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 50% 50%, rgba(0,243,255,0.08), transparent 60%)' }} />

      <div className="text-center relative z-10 px-4">
        <div className={`mb-4 flex items-center justify-center gap-2 transition-all duration-500 ${phase >= 1 ? 'opacity-100' : 'opacity-0'}`}>
          <span className="w-2 h-2 rounded-full bg-[#FF0055] blink" />
          <span className="font-display text-[10px] tracking-[0.4em] text-[#FF0055]/85">EMERGENCY RESPONSE INITIATED</span>
          <span className="w-2 h-2 rounded-full bg-[#FF0055] blink" />
        </div>

        <h1 className={`font-display font-black text-3xl sm:text-5xl neon-cyan transition-all duration-700 ${phase >= 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-90'} title-glow`}>
          MUMBAI: LAST ROUTE
        </h1>
        <p className={`mt-3 font-display text-xs sm:text-sm tracking-[0.3em] text-white/70 transition-opacity duration-500 ${phase >= 2 ? 'opacity-100' : 'opacity-0'}`}>
          EXTREME MONSOON EVACUATION
        </p>

        {/* loading bar */}
        <div className={`mt-8 mx-auto w-48 transition-opacity duration-500 ${phase >= 2 ? 'opacity-100' : 'opacity-0'}`}>
          <div className="bar-track h-1.5">
            <div
              className="bar-fill"
              style={{
                width: phase >= 3 ? '100%' : '40%',
                background: 'linear-gradient(90deg,#00F3FF,#0099FF)',
                boxShadow: '0 0 10px rgba(0,243,255,0.6)',
                transition: 'width 0.6s ease',
              }}
            />
          </div>
          <div className="mt-2 flex items-center justify-center gap-1.5">
            {[0, 1, 2, 3, 4].map(i => (
              <span
                key={i}
                className="w-1.5 h-5 rounded-sm bg-cyan-400/70"
                style={{ animation: `pulseGlow 0.6s ${i * 0.12}s infinite` }}
              />
            ))}
          </div>
          <p className={`mt-4 font-display text-[10px] tracking-[0.3em] text-white/55 transition-opacity duration-500 ${phase >= 3 ? 'opacity-100' : 'opacity-0'}`}>
            DEPLOYING TO SECTOR · STAND BY
          </p>
        </div>
      </div>
    </div>
  );
}
