import React from 'react';
import { Shield, AlertTriangle, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-slate-950 border-t border-slate-800/80 py-10 px-6 mt-20 relative z-10 text-slate-400 font-mono text-xs">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-3 md:col-span-2">
          <div className="flex items-center gap-2 text-cyan-400 font-heading text-base font-bold">
            <Shield className="w-5 h-5" />
            <span>MUMBAI: LAST SAFE ROUTE</span>
          </div>
          <p className="text-slate-400 leading-relaxed pr-6 text-xs font-body">
            A high-stakes 2D disaster simulation game built using Phaser 3 and React. Dedicated to the resilience of Mumbai's citizens, municipal first responders, and emergency task force officers who brave torrential cloudbursts every monsoon season.
          </p>
          <div className="flex items-center gap-2 text-rose-400 text-[11px] pt-1">
            <AlertTriangle className="w-4 h-4" />
            <span>Educational & Simulation Competition Project</span>
          </div>
        </div>

        <div>
          <h4 className="font-heading text-cyan-400 text-sm font-semibold mb-3">COMMAND SECTORS</h4>
          <ul className="space-y-2 text-xs">
            <li className="hover:text-cyan-300 transition-colors">Mission 01: Hindmata Lowland</li>
            <li className="hover:text-cyan-300 transition-colors">Mission 02: Kurla West Mithi Surge</li>
            <li className="hover:text-cyan-300 transition-colors">Mission 03: Bandra Flash Inundation</li>
            <li className="hover:text-cyan-300 transition-colors">BMC Disaster Control Protocols</li>
          </ul>
        </div>

        <div>
          <h4 className="font-heading text-cyan-400 text-sm font-semibold mb-3">TELEMETRY & TECH</h4>
          <ul className="space-y-2 text-xs">
            <li>Engine: Phaser 3.80 + Canvas 2D</li>
            <li>Framework: React + Vite + TypeScript</li>
            <li>Audio: Web Audio Synthesizer</li>
            <li>Styling: Dark Monsoon Cyan System</li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 mt-8 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between text-[11px] text-slate-500">
        <p>© 2026 Mumbai: Last Safe Route. Disaster Management Simulation Task Force.</p>
        <p className="flex items-center gap-1">
          Made with <Heart className="w-3.5 h-3.5 text-rose-500 fill-current" /> for Mumbai Resilience Game Competition
        </p>
      </div>
    </footer>
  );
};
