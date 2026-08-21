import { useState } from 'react';

interface Props {
  onBack: () => void;
  onSelectLevel: (levelId: number) => void;
  levelUnlocked: number; // 1 to 4
}

export function LevelSelectScreen({ onBack, onSelectLevel, levelUnlocked }: Props) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const levels = [
    {
      id: 1,
      num: '01',
      title: 'THE RISING STREETS',
      sub: 'Monsoon crisis response. Rescue 6 civilians.',
      status: 'AVAILABLE',
    },
    {
      id: 2,
      num: '02',
      title: 'THE FLOODED MARKET',
      sub: 'Market Causeways submerged. Extreme currents.',
      status: 'LOCKED',
    },
    {
      id: 3,
      num: '03',
      title: 'THE SUBMERGED ALLEY',
      sub: 'Narrow side streets. Electrocution hazard warning.',
      status: 'LOCKED',
    },
    {
      id: 4,
      num: '04',
      title: 'THE LAST FLYOVER',
      sub: 'Safe zone evacuation. Critical flood timing.',
      status: 'LOCKED',
    },
  ];

  const handleLevelClick = (id: number) => {
    if (id > levelUnlocked) {
      setErrorMsg('COMPLETE THE PREVIOUS MISSION TO UNLOCK');
      setTimeout(() => setErrorMsg(null), 3000);
      return;
    }
    onSelectLevel(id);
  };

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center fade-in p-4">
      {/* atmospheric gradient over canvas */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#07111F]/72 via-[#07111F]/35 to-[#07111F]/88" />
      
      <div className="relative glass rounded-2xl p-6 sm:p-8 max-w-lg w-full slide-up select-none flex flex-col">
        {/* Title */}
        <div className="mb-5 flex flex-col items-center text-center">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 blink" />
            <span className="font-display text-[10px] tracking-[0.4em] text-cyan-300/80">TACTICAL DEPLOYMENT</span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 blink" />
          </div>
          <h2 className="font-display font-black text-2xl sm:text-3xl text-white tracking-wider mt-1.5 leading-none">
            SELECT LEVEL
          </h2>
        </div>

        {/* Error Alert Display */}
        {errorMsg && (
          <div className="mb-4 py-2 px-3 rounded bg-[#FF0055]/15 border border-[#FF0055]/40 text-center animate-pulse">
            <span className="font-display text-[10px] tracking-wider text-[#FF0055] font-bold">
              {errorMsg}
            </span>
          </div>
        )}

        {/* Level List */}
        <div className="space-y-3 flex-1">
          {levels.map((level) => {
            const isUnlocked = level.id <= levelUnlocked;
            return (
              <button
                key={level.id}
                onClick={() => handleLevelClick(level.id)}
                className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between group ${
                  isUnlocked
                    ? 'glass glass-cyan border-cyan-400/30 hover:border-cyan-400/60 active:scale-[0.98]'
                    : 'bg-black/25 border-white/5 opacity-50 cursor-not-allowed'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display font-black text-xs text-cyan-300">
                      LEVEL {level.num}
                    </span>
                    <span className="text-white/20 text-xs">•</span>
                    <span className={`font-display text-[9px] tracking-widest ${isUnlocked ? 'text-green-400' : 'text-white/30'}`}>
                      {isUnlocked ? '★ AVAILABLE' : '🔒 LOCKED'}
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-sm sm:text-base text-white/90 mt-0.5 tracking-wide">
                    {level.title}
                  </h3>
                  <p className="text-white/50 text-[10px] sm:text-xs leading-normal mt-0.5">
                    {level.sub}
                  </p>
                </div>
                
                {isUnlocked ? (
                  <span className="text-cyan-400/60 group-hover:text-cyan-300 transition-colors text-lg pr-1">
                    ▶
                  </span>
                ) : (
                  <span className="text-white/20 text-lg pr-1">
                    🔒
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Back Button */}
        <div className="mt-6 flex justify-end">
          <button className="btn-game" onClick={onBack}>
            ◀ BACK
          </button>
        </div>
      </div>
    </div>
  );
}
