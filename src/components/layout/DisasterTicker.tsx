import React, { useState, useEffect } from 'react';
import { ShieldAlert, Radio, Volume2, VolumeX } from 'lucide-react';
import { useGameState } from '../../context/GameStateContext';

export const DisasterTicker: React.FC = () => {
  const { isMuted, toggleMute } = useGameState();
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const timer = setInterval(() => {
      const d = new Date();
      setTime(d.toLocaleTimeString('en-IN', { hour12: false }));
    }, 1000);
    setTime(new Date().toLocaleTimeString('en-IN', { hour12: false }));
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full bg-slate-950/90 border-b border-cyan-500/20 px-4 py-1.5 flex items-center justify-between text-xs font-mono text-slate-300 z-50">
      <div className="flex items-center gap-3 overflow-hidden whitespace-nowrap">
        <div className="flex items-center gap-1.5 text-rose-400 font-bold bg-rose-950/60 px-2 py-0.5 rounded border border-rose-500/40 animate-pulse">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>BMC DISASTER CELL</span>
        </div>
        <div className="flex items-center gap-2 text-cyan-400">
          <Radio className="w-3.5 h-3.5 text-cyan-400 animate-ping" />
          <span>LIVE BROADCAST: HINDMATA SECTOR INUNDATION ALERT LEVEL 4</span>
        </div>
        <span className="text-slate-600">|</span>
        <span className="text-amber-400">RAINFALL: 145mm/hr</span>
        <span className="text-slate-600">|</span>
        <span className="text-rose-400">MITHI RIVER: 3.8m ABOVE DANGER MARK</span>
      </div>

      <div className="flex items-center gap-4 shrink-0 pl-4 border-l border-slate-800">
        <div className="flex items-center gap-1.5 text-cyan-300">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>{time} IST</span>
        </div>

        <button
          onClick={toggleMute}
          className="flex items-center gap-1 text-slate-400 hover:text-cyan-400 transition-colors"
          title="Toggle Ambient Audio"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          <span>{isMuted ? 'AUDIO OFF' : 'AUDIO ON'}</span>
        </button>
      </div>
    </div>
  );
};
