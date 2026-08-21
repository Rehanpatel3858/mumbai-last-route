import { PublicState, WORLD, SAFE_ZONE, ROUTE_A_BLOCK_FLOOD, ROUTE_B_BLOCK_FLOOD } from '../game/constants';
import { WORLD_DEF } from '../game/world';

export function TacticalMap({ state, onClose }: { state: PublicState; onClose: () => void }) {
  // We'll draw a simplified SVG map based on WORLD dimensions
  return (
    <div className="fixed inset-0 z-50 bg-[#07111F]/95 flex flex-col touch-none p-4 pb-8">
      <div className="flex items-center justify-between mb-4 mt-2 px-2">
        <h2 className="font-display font-black text-xl text-[#00F3FF] tracking-widest">TACTICAL MAP</h2>
        <button 
          onClick={onClose}
          className="w-10 h-10 rounded bg-[#FF0055]/20 text-[#FF0055] border border-[#FF0055]/50 flex items-center justify-center font-bold">
          ✕
        </button>
      </div>

      <div className="flex-1 relative w-full h-full border border-[#00F3FF]/30 rounded-xl overflow-hidden bg-[#0A1626]">
        {/* SVG Viewport mapping WORLD -> Screen */}
        <svg viewBox={`0 0 ${WORLD.width} ${WORLD.height}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
          
          {/* Roads */}
          {WORLD_DEF.roads.map((r, i) => (
            <rect key={i} x={r.x} y={r.y} width={r.w} height={r.h} fill="#1a2538" />
          ))}

          {/* Buildings */}
          {WORLD_DEF.buildings.map((b, i) => (
            <rect key={i} x={b.x} y={b.y} width={b.w} height={b.h} fill={b.kind === 'wall' ? '#111824' : '#223047'} stroke="#2c3e5a" strokeWidth="2" />
          ))}

          {/* Safe Zone */}
          <rect x={SAFE_ZONE.x} y={SAFE_ZONE.y} width={SAFE_ZONE.w} height={SAFE_ZONE.h} fill="rgba(16,185,129,0.2)" stroke="#10B981" strokeWidth="6" />
          <text x={SAFE_ZONE.x + SAFE_ZONE.w/2} y={SAFE_ZONE.y + SAFE_ZONE.h/2} fill="#10B981" fontSize="40" textAnchor="middle" dominantBaseline="middle" fontWeight="bold">SAFE ZONE</text>

          {/* Route Blocks */}
          {WORLD_DEF.barriers.map(bar => {
            const blocked = (bar.id === 'A' && state.flood >= ROUTE_A_BLOCK_FLOOD) || (bar.id === 'B' && state.flood >= ROUTE_B_BLOCK_FLOOD);
            if (!blocked) return null;
            return (
              <g key={bar.id}>
                <rect x={bar.rect.x} y={bar.rect.y} width={bar.rect.w} height={bar.rect.h} fill="rgba(255,0,85,0.4)" stroke="#FF0055" strokeWidth="4" />
                <text x={bar.rect.x + bar.rect.w/2} y={bar.rect.y + bar.rect.h/2} fill="#FF0055" fontSize="30" textAnchor="middle" dominantBaseline="middle" fontWeight="bold">BLOCKED</text>
              </g>
            );
          })}

          {/* Civilians (Placeholder logic, since actual locations are in engine) */}
          {WORLD_DEF.civilians.map(c => (
            <g key={c.id}>
              <circle cx={c.x} cy={c.y} r="20" fill={c.color} opacity="0.6" />
              <circle cx={c.x} cy={c.y} r="8" fill="#fff" />
            </g>
          ))}
          
        </svg>

        {/* Note: The actual player position and live civilian positions are managed inside engine.ts, 
            so a true live map requires passing those coordinates up to state. For now, this shows the static layout 
            and objectives. */}
        <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none">
          <p className="font-display text-[#00F3FF]/70 text-[10px] tracking-widest bg-black/40 inline-block px-3 py-1 rounded">
            ROADS IN BLUE • SAFE ZONE IN GREEN • BLOCKED IN RED
          </p>
        </div>
      </div>
    </div>
  );
}
