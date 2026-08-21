import React, { useState } from 'react';
import { useGameState } from '../../context/GameStateContext';
import { User, Award, Shield, Check, Edit2, Users, Trophy, Play } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { playerProfile, updateProfileName, setCurrentView } = useGameState();
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(playerProfile.name);

  const handleSaveName = () => {
    if (tempName.trim()) {
      updateProfileName(tempName.trim());
      setIsEditing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-3 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 font-mono text-xs">
          <User className="w-4 h-4" />
          <span>BMC DISASTER CELL FIRST RESPONDER CARD</span>
        </div>
        <h1 className="font-heading text-4xl font-bold text-white">RESCUER PROFILE</h1>
      </div>

      {/* Main Profile Card */}
      <div className="glass-panel p-8 rounded-2xl border-cyan-500/40 space-y-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-slate-800 pb-8">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border-2 border-cyan-400 flex items-center justify-center text-cyan-400 shadow-[0_0_25px_rgba(0,240,255,0.3)]">
              <Shield className="w-10 h-10" />
            </div>

            <div className="space-y-1 text-center md:text-left">
              <div className="flex items-center gap-3">
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      className="bg-slate-900 border border-cyan-400 rounded px-3 py-1 text-sm font-mono text-white focus:outline-none"
                    />
                    <button
                      onClick={handleSaveName}
                      className="p-1.5 rounded bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <h2 className="font-heading text-2xl font-bold text-white">{playerProfile.name}</h2>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-slate-400 hover:text-cyan-400 transition-colors"
                      title="Edit Name"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
              <div className="inline-block px-2.5 py-0.5 rounded bg-cyan-950 text-cyan-400 font-mono text-xs border border-cyan-500/30 font-bold">
                {playerProfile.badge}
              </div>
            </div>
          </div>

          <button
            onClick={() => setCurrentView('briefing')}
            className="btn-primary py-3 px-6 text-xs font-bold"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>DEPLOY TO MISSION 01</span>
          </button>
        </div>

        {/* Career Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-center">
            <Users className="w-6 h-6 text-emerald-400 mx-auto" />
            <div className="font-mono text-3xl font-bold text-emerald-400">{playerProfile.totalRescued}</div>
            <div className="text-xs font-heading text-slate-400">TOTAL CIVILIANS RESCUED</div>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-center">
            <Trophy className="w-6 h-6 text-amber-400 mx-auto" />
            <div className="font-mono text-3xl font-bold text-amber-400">{playerProfile.bestRank}</div>
            <div className="text-xs font-heading text-slate-400">HIGHEST RANK ACHIEVED</div>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-center">
            <Award className="w-6 h-6 text-cyan-400 mx-auto" />
            <div className="font-mono text-3xl font-bold text-cyan-400">{playerProfile.playCount}</div>
            <div className="text-xs font-heading text-slate-400">OPERATIONS COMPLETED</div>
          </div>
        </div>
      </div>
    </div>
  );
};
