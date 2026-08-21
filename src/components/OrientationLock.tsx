import { useEffect, useState } from 'react';

export function OrientationLock() {
  return (
    <div className="orientation-lock-overlay fixed inset-0 z-[999] flex flex-col items-center justify-center bg-[#07111F] text-center p-6 touch-none select-none">
      {/* Animated Phone Rotate Icon */}
      <div className="relative w-24 h-24 mb-6 flex items-center justify-center">
        <div className="absolute inset-0 border-2 border-dashed border-cyan-400/30 rounded-full animate-[spin_8s_linear_infinite]" />
        
        {/* Visual phone rotation animation */}
        <div className="w-10 h-16 border-2 border-cyan-400 rounded-lg relative flex items-center justify-center animate-[rotatePhone_2.4s_ease-in-out_infinite]">
          {/* Home Button */}
          <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-cyan-400" />
          {/* Speaker */}
          <div className="absolute top-1.5 w-3 h-0.5 rounded bg-cyan-400/60" />
          {/* Screen Content */}
          <div className="w-6 h-10 bg-cyan-400/10 rounded flex flex-col gap-1 items-center justify-center p-1">
            <div className="w-full h-1 bg-cyan-300/40 rounded" />
            <div className="w-3/4 h-1 bg-cyan-300/30 rounded" />
          </div>
        </div>
      </div>

      <h1 className="font-display font-black text-2xl sm:text-3xl text-[#FF0055] tracking-widest uppercase mb-3 title-glow">
        ROTATE YOUR PHONE
      </h1>
      
      <p className="font-display text-white/70 text-xs sm:text-sm tracking-wider max-w-xs leading-relaxed">
        Please rotate your device to <span className="neon-cyan font-bold">landscape mode</span> to play Mumbai: Last Route.
      </p>

      {/* Embedded keyframe animations and media queries */}
      <style>{`
        @media (orientation: landscape) {
          .orientation-lock-overlay {
            display: none !important;
          }
        }
        @media (orientation: portrait) {
          .orientation-lock-overlay {
            display: flex !important;
          }
        }
        @keyframes rotatePhone {
          0%, 100% {
            transform: rotate(0deg);
          }
          40%, 60% {
            transform: rotate(-90deg);
          }
        }
      `}</style>
    </div>
  );
}
