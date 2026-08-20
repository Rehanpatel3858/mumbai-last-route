import React from 'react';
import { Info, Cpu, AlertTriangle, Layers } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-12">
      <div className="space-y-3 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 font-mono text-xs">
          <Info className="w-4 h-4" />
          <span>PROJECT BACKGROUND & ARCHITECTURE</span>
        </div>
        <h1 className="font-heading text-4xl md:text-5xl font-bold text-white">ABOUT THE SIMULATION</h1>
        <p className="text-slate-400 max-w-2xl mx-auto text-sm font-body">
          Honoring the spirit of Mumbai citizens and first responders who navigate catastrophic urban monsoons.
        </p>
      </div>

      <div className="glass-panel p-8 rounded-2xl space-y-6">
        <h2 className="font-heading text-2xl font-bold text-cyan-400 flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-amber-400" />
          <span>THE CONTEXT: MUMBAI MONSOONS & RESILIENCE</span>
        </h2>
        <p className="text-slate-300 text-sm leading-relaxed">
          Every monsoon season between June and September, Mumbai receives over 2,200mm of rainfall. Low-lying topographies like Hindmata, Kurla, Saki Naka, and Milan Subway act as natural rainwater catch basins. Coupled with high tides from the Arabian Sea, stormwater drainage channels reach over-capacity in minutes.
        </p>
        <p className="text-slate-300 text-sm leading-relaxed">
          In this game, players step into the boots of a Disaster Management Cell First Rescuer. Rather than a standard timer, gameplay flows dynamically across 4 distinct flood states—wading through rising waters, managing panicking evacuees, dodging live electrical wires, and charting elevated escape routes before roads drown.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-xl space-y-4">
          <div className="flex items-center gap-3 text-cyan-400 font-heading text-lg font-bold">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <span>GAME ENGINE & RENDERING</span>
          </div>
          <ul className="space-y-2 text-xs font-mono text-slate-300">
            <li className="flex items-center justify-between border-b border-slate-800 pb-1.5">
              <span>2D Physics Engine</span>
              <span className="text-cyan-400">Phaser 3.80 Arcade</span>
            </li>
            <li className="flex items-center justify-between border-b border-slate-800 pb-1.5">
              <span>Texture Synthesis</span>
              <span className="text-cyan-400">Canvas 2D Procedural</span>
            </li>
            <li className="flex items-center justify-between border-b border-slate-800 pb-1.5">
              <span>Audio Synthesis</span>
              <span className="text-cyan-400">Web Audio API Synth</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Particle Systems</span>
              <span className="text-cyan-400">Phaser Rain Emitters</span>
            </li>
          </ul>
        </div>

        <div className="glass-panel p-6 rounded-xl space-y-4">
          <div className="flex items-center gap-3 text-cyan-400 font-heading text-lg font-bold">
            <Layers className="w-5 h-5 text-purple-400" />
            <span>FRONTEND ARCHITECTURE</span>
          </div>
          <ul className="space-y-2 text-xs font-mono text-slate-300">
            <li className="flex items-center justify-between border-b border-slate-800 pb-1.5">
              <span>UI Framework</span>
              <span className="text-purple-400">React + TypeScript</span>
            </li>
            <li className="flex items-center justify-between border-b border-slate-800 pb-1.5">
              <span>Build Tool</span>
              <span className="text-purple-400">Vite Engine</span>
            </li>
            <li className="flex items-center justify-between border-b border-slate-800 pb-1.5">
              <span>Icons & HUD</span>
              <span className="text-purple-400">Lucide React Icons</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Data Persistence</span>
              <span className="text-purple-400">Browser localStorage</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
