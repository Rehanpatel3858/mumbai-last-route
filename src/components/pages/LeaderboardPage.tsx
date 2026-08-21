import React, { useState, useEffect } from 'react';
import { getLeaderboard, type LeaderboardEntry } from '../../data/leaderboard';
import { Trophy, Search } from 'lucide-react';

export const LeaderboardPage: React.FC = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGrade, setFilterGrade] = useState<string>('ALL');

  useEffect(() => {
    setEntries(getLeaderboard());
  }, []);

  const filteredEntries = entries.filter((item) => {
    const matchesSearch = item.playerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGrade = filterGrade === 'ALL' || item.grade === filterGrade;
    return matchesSearch && matchesGrade;
  });

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
      <div className="space-y-3 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 font-mono text-xs">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>BMC TASK FORCE OPERATIONAL RECORDS</span>
        </div>
        <h1 className="font-heading text-4xl font-bold text-white">RESCUE LEADERBOARD</h1>
        <p className="text-slate-400 max-w-2xl mx-auto text-sm font-body">
          Top disaster response units sorted by total rescue score, civilians saved, and time remaining.
        </p>
      </div>

      <div className="glass-panel p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4 border-cyan-500/30">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search rescuer name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-slate-400">RANK GRADE:</span>
          {['ALL', 'S', 'A', 'B', 'C', 'D'].map((g) => (
            <button
              key={g}
              onClick={() => setFilterGrade(g)}
              className={`px-3 py-1 rounded font-bold transition-all ${
                filterGrade === g
                  ? 'bg-cyan-500 text-slate-950 shadow-[0_0_10px_rgba(0,240,255,0.4)]'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden border-cyan-500/30">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-heading">
                <th className="py-4 px-4">RANK</th>
                <th className="py-4 px-4">RESCUER HANDLE</th>
                <th className="py-4 px-4">MISSION</th>
                <th className="py-4 px-4">CIVILIANS SAVED</th>
                <th className="py-4 px-4">TIME REMAINING</th>
                <th className="py-4 px-4">GRADE</th>
                <th className="py-4 px-4 text-right">TOTAL SCORE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredEntries.map((row) => (
                <tr key={row.id} className="hover:bg-slate-900/60 transition-colors">
                  <td className="py-4 px-4">
                    <span
                      className={`font-bold inline-flex items-center justify-center w-7 h-7 rounded-full ${
                        row.rank === 1
                          ? 'bg-amber-400 text-slate-950 shadow-[0_0_10px_rgba(255,215,0,0.6)]'
                          : row.rank === 2
                          ? 'bg-slate-300 text-slate-950'
                          : row.rank === 3
                          ? 'bg-amber-700 text-white'
                          : 'text-slate-400 bg-slate-900 border border-slate-800'
                      }`}
                    >
                      {row.rank}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-bold text-white">
                    <div className="flex flex-col">
                      <span>{row.playerName}</span>
                      <span className="text-[10px] text-cyan-400 font-normal">{row.badge}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-slate-300">{row.missionName}</td>
                  <td className="py-4 px-4 text-emerald-400 font-bold">
                    {row.civiliansSaved}/{row.maxCivilians}
                  </td>
                  <td className="py-4 px-4 text-cyan-300">
                    {Math.floor(row.timeRemainingSeconds / 60)}:
                    {(row.timeRemainingSeconds % 60).toString().padStart(2, '0')}
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`px-2.5 py-1 rounded text-[11px] font-bold ${
                        row.grade === 'S'
                          ? 'badge-rank-s'
                          : row.grade === 'A'
                          ? 'badge-rank-a'
                          : row.grade === 'B'
                          ? 'badge-rank-b'
                          : row.grade === 'C'
                          ? 'badge-rank-c'
                          : 'badge-rank-d'
                      }`}
                    >
                      RANK {row.grade}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right font-bold text-cyan-400 text-sm">
                    {row.score.toLocaleString()} PTS
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
