interface Props { onBack: () => void; }

export function GameInfo({ onBack }: Props) {
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center fade-in p-4">
      <div className="absolute inset-0 bg-[#07111F]/88 backdrop-blur-sm" />
      <div className="relative glass rounded-2xl p-6 sm:p-8 max-w-2xl w-full max-h-[88vh] overflow-y-auto slide-up">
        <h2 className="font-display font-black text-2xl sm:text-3xl neon-cyan mb-1">GAME INFO</h2>
        <p className="text-white/60 text-xs font-display tracking-wider mb-5">CRISIS BACKGROUND</p>

        <div className="space-y-4 text-white/80 text-sm leading-relaxed">
          <p>
            <span className="neon-cyan font-display">MUMBAI: LAST ROUTE</span> is a 2D top-down survival & rescue game
            set during an extreme monsoon. A Mumbai-inspired neighborhood is rapidly flooding. You are an
            emergency responder tasked with finding stranded civilians and escorting them to an elevated
            Safe Zone before the area is fully submerged.
          </p>

          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div className="glass rounded-lg p-4">
              <p className="font-display text-xs neon-cyan tracking-wider mb-2">MISSION TIMELINE</p>
              <ul className="text-xs space-y-1 font-display">
                <li><span className="text-white/50">0:00</span> · Flood 10%</li>
                <li><span className="text-white/50">1:00</span> · Flood 30%</li>
                <li><span className="text-white/50">2:00</span> · Flood 50% · Route A blocked</li>
                <li><span className="text-white/50">3:00</span> · Flood 70% · swimming begins</li>
                <li><span className="text-white/50">4:00</span> · Flood 90% · Route B blocked</li>
                <li><span className="text-[#FF0055]">5:00</span> · Flood 100% · EVACUATION FAILED</li>
              </ul>
            </div>
            <div className="glass rounded-lg p-4">
              <p className="font-display text-xs neon-cyan tracking-wider mb-2">THE WORLD</p>
              <ul className="text-xs space-y-1">
                <li>• Dense chawls & commercial blocks</li>
                <li>• Local market with stranded civilians</li>
                <li>• Stalled BEST bus & autorickshaws</li>
                <li>• Electrical substation alley</li>
                <li>• Three evacuation routes</li>
                <li>• Elevated Safe Zone (upper-right)</li>
              </ul>
            </div>
          </div>

          <div className="glass rounded-lg p-4 mt-2">
            <p className="font-display text-xs neon-cyan tracking-wider mb-2">RESCUED vs SAVED</p>
            <p className="text-xs">
              <span className="neon-cyan font-bold">RESCUED</span> = found & picked up.
              <span className="neon-green font-bold ml-3">SAVED</span> = actually reached the Safe Zone.
              Only saved civilians count toward victory. If time runs out, you keep only what reached the Safe Zone.
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button className="btn-game" onClick={onBack}>◀ BACK</button>
        </div>
      </div>
    </div>
  );
}
