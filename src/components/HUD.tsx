import { useEffect, useState } from 'react';
import { PublicState } from '@/game/constants';

function fmtTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
}

function Bar({ value, max, color, glow, height = 9 }: { value: number; max: number; color: string; glow: string; height?: number }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="bar-track w-full" style={{ height }}>
      <div className="bar-fill" style={{ width: `${pct}%`, background: color, boxShadow: `0 0 10px ${glow}` }} />
    </div>
  );
}

function FloodBar({ value }: { value: number }) {
  const pct = Math.round(value);
  const color =
    value >= 90 ? 'linear-gradient(90deg,#FF0055,#FFB703)' :
    value >= 70 ? 'linear-gradient(90deg,#FF0055,#8B5CF6)' :
    value >= 50 ? 'linear-gradient(90deg,#FFB703,#8B5CF6)' :
    value >= 30 ? 'linear-gradient(90deg,#0099FF,#00F3FF)' :
    'linear-gradient(90deg,#00F3FF,#0099FF)';
  const glow =
    value >= 90 ? 'rgba(255,0,85,0.7)' :
    value >= 70 ? 'rgba(255,0,85,0.5)' :
    value >= 50 ? 'rgba(255,183,3,0.5)' :
    'rgba(0,243,255,0.5)';
  const labelColor =
    value >= 90 ? '#FF0055' : value >= 70 ? '#FF6b9a' : value >= 50 ? '#FFB703' : '#00F3FF';
  return (
    <div className="flex flex-col gap-1 min-w-[150px] flex-1 max-w-[230px]">
      <div className="flex items-center justify-between text-[10px] font-display tracking-[0.15em]">
        <span className="text-white/65 flex items-center gap-1">
          <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: labelColor, boxShadow: `0 0 6px ${glow}` }} />
          FLOOD LEVEL
        </span>
        <span className="font-bold" style={{ color: labelColor, textShadow: `0 0 8px ${glow}` }}>{pct}%</span>
      </div>
      <Bar value={value} max={100} color={color} glow={glow} />
    </div>
  );
}

function StatChip({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-[9px] text-white/55 font-display tracking-wider">{label}</span>
      <span className="font-display font-bold text-sm" style={{ color, textShadow: `0 0 8px ${color}80` }}>{value}</span>
    </div>
  );
}

export function HUD({ state, isTouch = false }: { state: PublicState; isTouch?: boolean }) {
  const timeCritical = state.timeLeft <= 30;
  const timeWarn = state.timeLeft <= 60 && !timeCritical;
  const timeColor = timeCritical ? '#FF0055' : timeWarn ? '#FFB703' : '#00F3FF';
  const timeGlow = timeCritical ? 'rgba(255,0,85,0.8)' : timeWarn ? 'rgba(255,183,3,0.6)' : 'rgba(0,243,255,0.5)';

  const healthColor = state.health > 50 ? 'linear-gradient(90deg,#10B981,#00F3FF)' : state.health > 25 ? 'linear-gradient(90deg,#FFB703,#FF0055)' : 'linear-gradient(90deg,#FF0055,#8B5CF6)';
  const healthGlow = state.health > 50 ? 'rgba(16,185,129,0.5)' : state.health > 25 ? 'rgba(255,183,3,0.5)' : 'rgba(255,0,85,0.6)';

  const [pulseTick, setPulseTick] = useState(0);
  useEffect(() => {
    if (!timeCritical) return;
    const id = setInterval(() => setPulseTick(t => t + 1), 500);
    return () => clearInterval(id);
  }, [timeCritical]);
  void pulseTick;

  return (
    <>
      {/* TOP HUD */}
      <div className="fixed top-0 left-0 right-0 z-20 pointer-events-none">
        <div className="mx-auto max-w-[1500px] px-3 sm:px-5 pt-3 slide-down">
          <div className="glass rounded-xl px-4 py-2.5 flex items-center gap-3 sm:gap-5 flex-wrap">
            {/* Title badge */}
            <div className="flex flex-col leading-none shrink-0">
              <span className="font-display font-black text-[15px] sm:text-base neon-cyan tracking-wider">MUMBAI:</span>
              <span className="font-display font-bold text-[10px] sm:text-xs text-white/75 tracking-[0.22em]">LAST ROUTE</span>
            </div>

            <div className="h-8 w-px bg-cyan-400/25 shrink-0" />

            <FloodBar value={state.flood} />

            {/* Civilians */}
            <div className="flex flex-col gap-0.5 shrink-0">
              <span className="text-[10px] font-display tracking-[0.15em] text-white/65">CIVILIANS</span>
              <div className="flex items-center gap-3">
                <StatChip label="RESCUED" value={`${state.rescued}/6`} color="#00F3FF" />
                <StatChip label="SAVED" value={`${state.saved}/6`} color="#10B981" />
              </div>
            </div>

            {/* Health */}
            <div className="flex flex-col gap-1 min-w-[100px] max-w-[150px]">
              <span className="text-[10px] font-display tracking-[0.15em] text-white/65">HEALTH</span>
              <Bar value={state.health} max={100} color={healthColor} glow={healthGlow} />
            </div>

            {/* Stamina */}
            <div className="flex flex-col gap-1 min-w-[90px] max-w-[140px]">
              <span className="text-[10px] font-display tracking-[0.15em] text-white/65">STAMINA <span className="text-white/40">[SHIFT]</span></span>
              <Bar value={state.stamina} max={100} color="linear-gradient(90deg,#00F3FF,#0099FF)" glow="rgba(0,243,255,0.5)" />
            </div>

            {/* Timer */}
            <div className="flex flex-col items-center ml-auto shrink-0">
              <span className="text-[10px] font-display tracking-[0.15em] text-white/65">TIME</span>
              <span
                className={`font-display font-black text-xl sm:text-2xl leading-none mt-0.5 ${timeCritical ? 'blink' : ''}`}
                style={{ color: timeColor, textShadow: `0 0 12px ${timeGlow}` }}
              >
                {fmtTime(state.timeLeft)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mission objective bottom-left, moved up on mobile to avoid joystick */}
      <div className={`fixed ${isTouch ? 'bottom-40' : 'bottom-3'} left-3 z-20 pointer-events-none max-w-[330px] transition-all`}>
        <div className="glass rounded-lg px-3.5 py-2.5 slide-up">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center justify-center w-4 h-4 rounded border border-cyan-400/50 text-cyan-300 text-[9px]">◆</span>
            <p className="text-[9px] font-display tracking-[0.22em] text-cyan-300/85">MISSION OBJECTIVE</p>
          </div>
          <p className="text-[11px] sm:text-xs text-white/90 leading-snug">{state.objective}</p>
          <div className="mt-2.5 flex items-center gap-2 flex-wrap">
            <span className="hud-chip neon-green">SAVED {state.saved}/6</span>
            {state.routeABlocked && <span className="hud-chip neon-magenta">ROUTE A ✕</span>}
            {state.routeBBlocked && <span className="hud-chip neon-magenta">ROUTE B ✕</span>}
            {state.playerInSafe && <span className="hud-chip neon-green blink">IN SAFE ZONE</span>}
          </div>
        </div>
      </div>

      {/* Controls hint bottom-right (hidden on touch to avoid clutter with action buttons) */}
      {!isTouch && (
        <div className="fixed bottom-3 right-3 z-20 pointer-events-none">
          <div className="glass rounded-lg px-3 py-2 text-[9px] font-display tracking-[0.12em] text-white/65 flex items-center gap-2">
          <span className="neon-cyan">WASD</span> MOVE
          <span className="text-white/20">·</span>
          <span className="neon-cyan">SHIFT</span> SPRINT
          <span className="text-white/20">·</span>
          <span className="neon-cyan">E</span> RESCUE / ENTER
          <span className="text-white/20">·</span>
          <span className="neon-cyan">M</span> MAP
          <span className="text-white/20">·</span>
          <span className="neon-cyan">ESC</span> PAUSE
        </div>
      </div>
      )}
    </>
  );
}
