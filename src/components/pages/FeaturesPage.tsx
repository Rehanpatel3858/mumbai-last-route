import React from 'react';
import { Waves, Navigation, Users, AlertCircle, Award, Compass } from 'lucide-react';
import { HAZARDS_DATA } from '../../data/hazards';

export const FeaturesPage: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-12">
      <div className="space-y-3 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 font-mono text-xs">
          <Compass className="w-4 h-4" />
          <span>SYSTEM MECHANICS & FEATURES</span>
        </div>
        <h1 className="font-heading text-4xl font-bold text-white">GAMEPLAY SYSTEMS</h1>
        <p className="text-slate-400 max-w-2xl mx-auto text-sm font-body">
          Explore the core tactical simulation mechanics that drive the disaster rescue gameplay.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-panel p-6 rounded-xl space-y-4 border-cyan-500/30">
          <div className="flex items-center gap-3 text-cyan-400 font-heading text-xl font-bold">
            <Waves className="w-6 h-6 text-cyan-400" />
            <span>4-STAGE DYNAMIC FLOOD SYSTEM</span>
          </div>
          <p className="text-slate-300 text-xs leading-relaxed">
            The game world evolves over ~6.5 minutes through 4 distinct flood states:
          </p>
          <div className="space-y-2 text-xs font-mono">
            <div className="p-2.5 rounded bg-slate-900/80 border border-cyan-500/20 text-cyan-300">
              <div className="font-bold">STAGE 1: ANKLE DEEP (0:00 - 1:30)</div>
              <div className="text-[11px] text-slate-400">Light rain. Main avenues open. 100% movement speed.</div>
            </div>
            <div className="p-2.5 rounded bg-slate-900/80 border border-blue-500/20 text-blue-300">
              <div className="font-bold">STAGE 2: KNEE DEEP (1:30 - 3:15)</div>
              <div className="text-[11px] text-slate-400">Electrical cables snap! Electrified pools active. 85% speed.</div>
            </div>
            <div className="p-2.5 rounded bg-slate-900/80 border border-amber-500/20 text-amber-300">
              <div className="font-bold">STAGE 3: WAIST DEEP (3:15 - 5:00)</div>
              <div className="text-[11px] text-slate-400">Main avenue submerged & blocked by buses. Alleyway navigation required. 70% speed.</div>
            </div>
            <div className="p-2.5 rounded bg-slate-900/80 border border-rose-500/30 text-rose-300">
              <div className="font-bold">STAGE 4: TORRENTIAL INUNDATION (5:00 - 6:30)</div>
              <div className="text-[11px] text-slate-400">Torrential flood surges drag units. Dadar Flyover safe zone active! 55% speed.</div>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-xl space-y-4 border-cyan-500/30">
          <div className="flex items-center gap-3 text-cyan-400 font-heading text-xl font-bold">
            <Navigation className="w-6 h-6 text-amber-400" />
            <span>ROUTE RISK & ETA SYSTEM</span>
          </div>
          <p className="text-slate-300 text-xs leading-relaxed">
            The HUD telemetry dynamically calculates path danger levels and estimated time to safe zone based on player coordinates, flood phase severity, and road blockages.
          </p>
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
            <div className="flex justify-between items-center text-cyan-400">
              <span>ROUTE RISK LEVEL</span>
              <span className="font-bold">DYNAMIC (0% - 100%)</span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden border border-slate-700">
              <div className="bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-500 h-full w-3/4"></div>
            </div>
            <p className="text-[11px] text-slate-400">
              As flood levels rise, main roads get blocked, driving risk up and requiring alternative alleyway navigation.
            </p>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-xl space-y-4 border-cyan-500/30">
          <div className="flex items-center gap-3 text-cyan-400 font-heading text-xl font-bold">
            <Users className="w-6 h-6 text-emerald-400" />
            <span>CIVILIAN ESCORT & FOLLOW CHAIN</span>
          </div>
          <p className="text-slate-300 text-xs leading-relaxed">
            Stranded citizens wait on flooded pavements. Approach them and press <span className="text-cyan-400 font-mono font-bold">[E]</span> to initiate rescue. Rescued citizens follow in line formation behind the player.
          </p>
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2 text-xs font-mono">
            <div className="text-emerald-400 font-bold">✓ ESCORT CAPACITY: UP TO 10 CITIZENS</div>
            <div className="text-slate-400 text-[11px]">
              Keep your evacuees close! High flood surges or debris collisions can temporarily disorient your follower line.
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-xl space-y-4 border-cyan-500/30">
          <div className="flex items-center gap-3 text-cyan-400 font-heading text-xl font-bold">
            <Award className="w-6 h-6 text-purple-400" />
            <span>RANK & RESCUE SCORING ENGINE</span>
          </div>
          <p className="text-slate-300 text-xs leading-relaxed">
            Upon reaching Dadar Flyover Safe Zone, your final rescue operations score is calculated with multi-tier badges and rankings:
          </p>
          <div className="grid grid-cols-5 gap-2 text-center font-heading font-bold text-xs">
            <div className="p-2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">RANK S<br/><span className="text-[9px] font-mono">9000+</span></div>
            <div className="p-2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">RANK A<br/><span className="text-[9px] font-mono">7500+</span></div>
            <div className="p-2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40">RANK B<br/><span className="text-[9px] font-mono">6000+</span></div>
            <div className="p-2 rounded bg-yellow-500/20 text-yellow-300 border border-yellow-500/40">RANK C<br/><span className="text-[9px] font-mono">4500+</span></div>
            <div className="p-2 rounded bg-slate-700/50 text-slate-300 border border-slate-600">RANK D<br/><span className="text-[9px] font-mono">&lt;4500</span></div>
          </div>
        </div>
      </div>

      <div className="glass-panel p-8 rounded-2xl space-y-6">
        <h2 className="font-heading text-2xl font-bold text-white flex items-center gap-2">
          <AlertCircle className="w-6 h-6 text-rose-400" />
          <span>ENVIRONMENTAL HAZARDS COMPENDIUM</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {HAZARDS_DATA.map((h) => (
            <div key={h.id} className="p-4 rounded-lg bg-slate-900/90 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-heading font-bold text-sm text-white">{h.name}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-500/30">
                  {h.severity}
                </span>
              </div>
              <p className="text-slate-400 text-xs font-body leading-relaxed">{h.description}</p>
              <div className="text-[11px] font-mono text-cyan-400 pt-1 border-t border-slate-800">
                💡 {h.survivalTip}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
