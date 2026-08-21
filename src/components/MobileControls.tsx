import { useEffect, useRef, useState } from 'react';
import { PublicState } from '../game/constants';

interface Props {
  state: PublicState;
  onJoystick: (v: { x: number; y: number } | null) => void;
  onRescue: () => void;
  onEnter: () => void;
  onMap: () => void;
  onPause: () => void;
}

export function MobileControls({ state, onJoystick, onRescue, onEnter, onMap, onPause }: Props) {
  const [joystickPos, setJoystickPos] = useState<{ x: number; y: number } | null>(null);
  const joystickRef = useRef<HTMLDivElement>(null);

  // Virtual Joystick logic
  const handlePointerDown = (e: React.PointerEvent) => {
    e.target.setPointerCapture(e.pointerId);
    handlePointerMove(e);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!e.target.hasPointerCapture(e.pointerId) || !joystickRef.current) return;
    const rect = joystickRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    
    let dx = e.clientX - cx;
    let dy = e.clientY - cy;
    
    const maxR = rect.width / 2;
    const dist = Math.hypot(dx, dy);
    
    if (dist > maxR) {
      dx = (dx / dist) * maxR;
      dy = (dy / dist) * maxR;
    }
    
    setJoystickPos({ x: dx, y: dy });
    
    // Normalize for engine (-1 to 1)
    const nx = dx / maxR;
    const ny = dy / maxR;
    onJoystick({ x: nx, y: ny });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    e.target.releasePointerCapture(e.pointerId);
    setJoystickPos(null);
    onJoystick(null);
  };

  // Map contextual buttons based on state
  return (
    <div className="fixed inset-0 z-20 pointer-events-none select-none" style={{ touchAction: 'none' }}>
      
      {/* Joystick Wrapper (Bottom Left) */}
      <div className="absolute bottom-0 left-0 pointer-events-auto touch-none p-6"
           style={{
             paddingLeft: 'calc(env(safe-area-inset-left, 16px) + 16px)',
             paddingBottom: 'calc(env(safe-area-inset-bottom, 16px) + 16px)'
           }}>
        <div className="w-32 h-32 rounded-full border-2 border-white/20 bg-black/20 relative"
             ref={joystickRef}
             onPointerDown={handlePointerDown}
             onPointerMove={handlePointerMove}
             onPointerUp={handlePointerUp}
             onPointerCancel={handlePointerUp}>
          {joystickPos && (
            <div className="absolute w-12 h-12 rounded-full bg-cyan-400/50 border border-cyan-300 shadow-[0_0_15px_rgba(0,243,255,0.4)] pointer-events-none"
                 style={{
                   left: `calc(50% + ${joystickPos.x}px)`,
                   top: `calc(50% + ${joystickPos.y}px)`,
                   transform: 'translate(-50%, -50%)'
                 }} />
          )}
        </div>
      </div>

      {/* Action Buttons Wrapper (Bottom Right) */}
      <div className="absolute bottom-0 right-0 flex flex-col items-end gap-3 pointer-events-auto p-6"
           style={{
             paddingRight: 'calc(env(safe-area-inset-right, 16px) + 16px)',
             paddingBottom: 'calc(env(safe-area-inset-bottom, 16px) + 16px)'
           }}>
        
        {/* Top row of action buttons (Map & Pause) */}
        <div className="flex gap-3 mb-2">
          <button 
            className="w-12 h-12 rounded-full bg-black/40 border border-white/20 flex items-center justify-center text-white/80 active:bg-white/20 touch-none"
            onClick={(e) => { e.preventDefault(); onMap(); }}>
            M
          </button>
          <button 
            className="w-12 h-12 rounded-full bg-black/40 border border-white/20 flex items-center justify-center text-white/80 active:bg-white/20 touch-none"
            onClick={(e) => { e.preventDefault(); onPause(); }}>
            II
          </button>
        </div>

        {/* Contextual Action Button (Enter / Rescue) */}
        {state.canRescue && (
          <button 
            className="w-20 h-20 rounded-full bg-[#10B981]/80 border-2 border-[#10B981] flex flex-col items-center justify-center text-white font-bold shadow-[0_0_20px_rgba(16,185,129,0.5)] active:scale-95 transition-transform touch-none"
            onClick={(e) => { e.preventDefault(); onRescue(); }}>
            <span className="text-xl">🙌</span>
            <span className="text-[10px] mt-1">RESCUE</span>
          </button>
        )}
        
        {state.canEnter && !state.canRescue && (
          <button 
            className="w-20 h-20 rounded-full bg-[#00F3FF]/80 border-2 border-[#00F3FF] flex flex-col items-center justify-center text-black font-bold shadow-[0_0_20px_rgba(0,243,255,0.5)] active:scale-95 transition-transform touch-none"
            onClick={(e) => { e.preventDefault(); onEnter(); }}>
            <span className="text-xl">🚪</span>
            <span className="text-[10px] mt-1">ENTER</span>
          </button>
        )}
      </div>
    </div>
  );
}
