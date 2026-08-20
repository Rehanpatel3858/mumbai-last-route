import React from 'react';
import { X, MapPin, AlertTriangle, ShieldCheck, Waves } from 'lucide-react';

interface MinimapModalProps {
  onClose: () => void;
  rescuedCount: number;
  totalCivilians: number;
  floodPhaseName: string;
}

export const MinimapModal: React.FC<MinimapModalProps> = ({
  onClose,
  rescuedCount,
  totalCivilians,
  floodPhaseName,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-6">
      <div className="glass-panel p-6 rounded-2xl max-w-2xl w-full border-cyan-500/50 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-cyan-400" />
            <h3 className="font-heading text-lg font-bold text-white">TACTICAL SECTOR OVERVIEW</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Map Diagram Canvas Preview */}
        <div className="relative aspect-video w-full rounded-xl bg-slate-950 border border-cyan-500/30 overflow-hidden p-4 grid-bg flex flex-col justify-between font-mono text-xs">
          {/* Top Row: Dadar Flyover Safe Zone */}
          <div className="flex justify-between items-start">
            <div className="p-2.5 rounded bg-emerald-950/80 border border-emerald-500/50 text-emerald-400 font-bold flex items-center gap-2 shadow-[0_0_15px_rgba(0,255,136,0.3)]">
              <ShieldCheck className="w-4 h-4 animate-bounce" />
              <span>DADAR FLYOVER SAFE ZONE (ELEVATED)</span>
            </div>
            <span className="text-[10px] text-slate-400">SECTOR N-01</span>
          </div>

          {/* Center Row: Blocked Main Avenue & East Alleyway */}
          <div className="grid grid-cols-3 gap-4 text-center my-auto">
            <div className="p-3 rounded bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="text-slate-400 block text-[10px]">WEST RESIDENTIAL</span>
              <span className="text-cyan-300 font-bold">BLOCK B CHAWLS</span>
            </div>

            <div className="p-3 rounded bg-rose-950/60 border border-rose-500/50 text-rose-300 space-y-1">
              <AlertTriangle className="w-4 h-4 text-rose-400 mx-auto" />
              <span className="font-bold text-[11px] block">MAIN AVENUE (BLOCKED)</span>
              <span className="text-[9px] text-slate-400">SUBMERGED & STALLED BUSES</span>
            </div>

            <div className="p-3 rounded bg-cyan-950/80 border border-cyan-400/50 text-cyan-300 space-y-1">
              <Waves className="w-4 h-4 text-cyan-400 mx-auto" />
              <span className="font-bold text-[11px] block">EAST ALLEYWAY</span>
              <span className="text-[9px] text-slate-400">OPEN EVACUATION DETOUR</span>
            </div>
          </div>

          {/* Bottom Row: Hindmata Market Start */}
          <div className="flex justify-between items-end">
            <div className="p-2.5 rounded bg-slate-900 border border-slate-700 text-slate-300 font-bold">
              📍 START: HINDMATA LOWLAND MARKET
            </div>
            <div className="text-right">
              <div className="text-cyan-400 font-bold">STATUS: {floodPhaseName}</div>
              <div className="text-slate-400 text-[10px]">CIVILIANS RESCUED: {rescuedCount}/{totalCivilians}</div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-around gap-4 text-xs font-mono text-slate-300 pt-2">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block"></span>
            <span>Safe Zone</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500 inline-block"></span>
            <span>Blocked Avenue</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-cyan-400 inline-block"></span>
            <span>Evacuation Detour</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-400 inline-block"></span>
            <span>Electric Wires</span>
          </div>
        </div>
      </div>
    </div>
  );
};
