interface Props { onBack: () => void; }

const Key = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded border border-cyan-400/40 bg-cyan-400/10 font-display font-bold text-xs neon-cyan">
    {children}
  </span>
);

const Row = ({ k, label }: { k: React.ReactNode; label: string }) => (
  <div className="flex items-center gap-3 py-1.5">
    <div className="flex gap-1 w-[150px]">{k}</div>
    <span className="text-white/80 text-sm">{label}</span>
  </div>
);

export function HowTo({ onBack }: Props) {
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center fade-in p-4">
      <div className="absolute inset-0 bg-[#07111F]/88 backdrop-blur-sm" />
      <div className="relative glass rounded-2xl p-6 sm:p-8 max-w-2xl w-full max-h-[88vh] overflow-y-auto slide-up">
        <h2 className="font-display font-black text-2xl sm:text-3xl neon-cyan mb-1">HOW TO PLAY</h2>
        <p className="text-white/60 text-xs font-display tracking-wider mb-5">CONTROLS & MISSION BRIEFING</p>

        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <h3 className="font-display text-sm neon-cyan mb-2 tracking-wider">CONTROLS</h3>
            <Row k={<><Key>W</Key><Key>A</Key><Key>S</Key><Key>D</Key></>} label="Move" />
            <Row k={<><Key>↑</Key><Key>↓</Key><Key>←</Key><Key>→</Key></>} label="Move (arrows)" />
            <Row k={<Key>SHIFT</Key>} label="Sprint (drains stamina)" />
            <Row k={<Key>E</Key>} label="Rescue civilian" />
          </div>
          <div>
            <h3 className="font-display text-sm neon-cyan mb-2 tracking-wider">OBJECTIVE</h3>
            <ul className="text-white/80 text-sm space-y-2 leading-snug">
              <li>• Explore the flooded neighborhood.</li>
              <li>• Find <span className="neon-cyan">6 stranded civilians</span> and press <span className="neon-cyan">E</span> to rescue.</li>
              <li>• Civilians will follow you in a line.</li>
              <li>• Escort them to the elevated <span className="neon-green">Safe Zone</span>.</li>
              <li>• Reach the Safe Zone with all 6 saved before time runs out.</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 grid sm:grid-cols-3 gap-3">
          <InfoCard color="#00F3FF" title="ROUTE A" sub="Direct Highway" body="Shortest path. Floods at 50%." />
          <InfoCard color="#8B5CF6" title="ROUTE B" sub="Market Causeway" body="Medium path. Floods at 90%." />
          <InfoCard color="#10B981" title="ROUTE C" sub="Elevated Flyover" body="Longest but safest. Stays open." />
        </div>

        <div className="mt-6 grid sm:grid-cols-3 gap-3">
          <HazardCard icon="◉" color="#FFB703" title="OPEN MANHOLE" body="-15 HP · slowdown" />
          <HazardCard icon="⚡" color="#00F3FF" title="LIVE WIRE" body="-25 HP · screen shake" />
          <HazardCard icon="≋" color="#0099FF" title="DEEP CURRENT" body="Pushes you · drains HP at 80%+" />
        </div>

        <div className="mt-6 flex justify-end">
          <button className="btn-game" onClick={onBack}>◀ BACK</button>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ color, title, sub, body }: { color: string; title: string; sub: string; body: string }) {
  return (
    <div className="glass rounded-lg p-3" style={{ borderColor: `${color}55` }}>
      <p className="font-display font-bold text-sm" style={{ color, textShadow: `0 0 8px ${color}80` }}>{title}</p>
      <p className="font-display text-[10px] text-white/60 tracking-wider mt-0.5">{sub}</p>
      <p className="text-white/70 text-xs mt-1.5 leading-snug">{body}</p>
    </div>
  );
}

function HazardCard({ icon, color, title, body }: { icon: string; color: string; title: string; body: string }) {
  return (
    <div className="glass rounded-lg p-3 flex items-center gap-3" style={{ borderColor: `${color}55` }}>
      <span className="text-2xl" style={{ color, textShadow: `0 0 10px ${color}` }}>{icon}</span>
      <div>
        <p className="font-display font-bold text-xs" style={{ color }}>{title}</p>
        <p className="text-white/60 text-[11px] mt-0.5">{body}</p>
      </div>
    </div>
  );
}
