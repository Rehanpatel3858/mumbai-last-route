import { C, WORLD, PLAYER, FLOOD, RESCUE, SAFE_ZONE, ROUTE_A_BLOCK_FLOOD, ROUTE_B_BLOCK_FLOOD, PublicState, GameScreen, Vec } from './constants';
import { WORLD_DEF, START, ROUTE_MARKERS } from './world';
import { sfx, playFootstep, triggerLightningThunder, setFloodLevel, startRain, startMusic, stopAllGameplaySounds, enterSafeZone, playEffort, playHeartbeat } from './audio';

const { buildings, vehicles, hazards, civilians, barriers, roads } = WORLD_DEF;

interface RainDrop { x: number; y: number; len: number; speed: number; slant: number; alpha: number; layer: number; }
interface Ripple { x: number; y: number; r: number; maxR: number; alpha: number; color: string; width: number; }
interface Particle { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; color: string; size: number; gravity?: number; kind?: 'spark' | 'debris' | 'splash' | 'dot'; rot?: number; vr?: number; }
interface FloatText { x: number; y: number; text: string; life: number; color: string; vy: number; }
interface Debris { x: number; y: number; vx: number; vy: number; rot: number; vr: number; size: number; kind: number; alpha: number; }
interface LampPost { x: number; y: number; }
interface Wire { x1: number; y1: number; x2: number; y2: number; }

interface Civilian {
  id: number;
  x: number; y: number;
  rescued: boolean;
  saved: boolean;
  color: string;
  name: string;
  wadePhase: number;
  walkPhase: number;
  idlePhase: number;
}

export interface Callbacks {
  onState: (s: PublicState) => void;
  onScreen: (s: GameScreen) => void;
  onAlert: (text: string | null) => void;
}

// Pre-computed decorative props (visual only, no collision)
const LAMP_POSTS: LampPost[] = [];
const OVERHEAD_WIRES: Wire[] = [];
const FLOATING_DEBRIS_SPAWNS = [
  { x: 620, y: 880 }, { x: 1100, y: 1080 }, { x: 1500, y: 1240 }, { x: 820, y: 1500 },
  { x: 1750, y: 1500 }, { x: 400, y: 1100 }, { x: 1300, y: 900 },
];
(function buildDecor() {
  // Lamp posts along horizontal roads
  for (const r of roads) {
    if (r.w >= r.h) {
      for (let x = r.x + 40; x < r.x + r.w - 20; x += 160) {
        LAMP_POSTS.push({ x, y: r.y + 6 });
      }
    } else {
      for (let y = r.y + 40; y < r.y + r.h - 20; y += 160) {
        LAMP_POSTS.push({ x: r.x + 6, y });
      }
    }
  }
  // Overhead wires between a few lamp posts
  for (let i = 0; i < LAMP_POSTS.length - 1; i += 3) {
    const a = LAMP_POSTS[i], b = LAMP_POSTS[i + 1];
    if (a && b && Math.hypot(a.x - b.x, a.y - b.y) < 220) {
      OVERHEAD_WIRES.push({ x1: a.x, y1: a.y - 28, x2: b.x, y2: b.y - 28 });
    }
  }
})();

export class Game {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  cb: Callbacks;

  screen: GameScreen = 'menu';
  running = false;

  cam = { x: 0, y: 0 };
  camTarget = { x: 0, y: 0 };

  player = {
    x: START.x, y: START.y,
    vx: 0, vy: 0,
    facing: { x: 0, y: 1 },
    moving: false,
    health: PLAYER.maxHealth,
    stamina: PLAYER.maxStamina,
    sprinting: false,
    wadePhase: 0,
    walkPhase: 0,
    invuln: 0,
  };

  civilians: Civilian[] = civilians.map(c => ({
    id: c.id, x: c.x, y: c.y, rescued: false, saved: false, color: c.color, name: c.name,
    wadePhase: Math.random() * 6, walkPhase: Math.random() * 6, idlePhase: Math.random() * 6,
  }));

  rescuedCount = 0;
  savedCount = 0;
  effortTimer = 0;
  heartbeatTimer = 0;

  flood = FLOOD.start;
  timeLeft = FLOOD.durationSec;
  elapsed = 0;

  routeABlocked = false;
  routeBBlocked = false;

  alert: string | null = null;
  alertTimer = 0;

  rain: RainDrop[] = [];
  ripples: Ripple[] = [];
  particles: Particle[] = [];
  floats: FloatText[] = [];
  debris: Debris[] = [];

  lightning = 0;
  lightningCooldown = 3 + Math.random() * 6;
  lightningBolt: { pts: { x: number; y: number }[]; life: number } | null = null;
  shake = 0;

  keys: Record<string, boolean> = {};

  lastTime = 0;
  rafId = 0;

  playerInSafe = false;
  currentTick = 0;
  vignetteAlpha = 0;

  paused = false;
  joystick: { x: number; y: number } | null = null;
  canRescue = false;
  canEnter = false;
  stepTimer = 0;
  safeZoneAudioTriggered = false;

  // ambient menu camera drift
  menuCamT = 0;

  constructor(canvas: HTMLCanvasElement, cb: Callbacks) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false })!;
    this.cb = cb;
    this.resize();
    this.initRain();
    this.initDebris();
  }

  // ---------- lifecycle ----------
  start() {
    this.resetGameState();
    this.screen = 'playing';
    this.running = true;
    this.cb.onScreen('playing');
    this.lastTime = performance.now();
    this.pushState();

    // Start monsoon rain and step sequencer
    startRain();
    startMusic();
    setFloodLevel(this.flood);

    this.loop(this.lastTime);
  }

  resetGameState() {
    this.player.x = START.x; this.player.y = START.y;
    this.player.vx = 0; this.player.vy = 0;
    this.player.health = PLAYER.maxHealth;
    this.player.stamina = PLAYER.maxStamina;
    this.player.facing = { x: 0, y: 1 };
    this.player.invuln = 0;
    this.civilians = civilians.map(c => ({
      id: c.id, x: c.x, y: c.y, rescued: false, saved: false, color: c.color, name: c.name,
      wadePhase: Math.random() * 6, walkPhase: Math.random() * 6, idlePhase: Math.random() * 6,
    }));
    this.rescuedCount = 0;
    this.savedCount = 0;
    this.flood = FLOOD.start;
    this.timeLeft = FLOOD.durationSec;
    this.elapsed = 0;
    this.routeABlocked = false;
    this.routeBBlocked = false;
    this.alert = null;
    this.alertTimer = 0;
    this.ripples = [];
    this.particles = [];
    this.floats = [];
    this.shake = 0;
    this.camTarget = { x: this.player.x - this.canvas.width / 2, y: this.player.y - this.canvas.height / 2 };
    this.cam = { ...this.camTarget };
    this.playerInSafe = false;
    this.paused = false;
    this.joystick = null;
    this.canRescue = false;
    this.canEnter = false;
    this.stepTimer = 0;
    this.safeZoneAudioTriggered = false;
    this.effortTimer = 0;
    this.heartbeatTimer = 0;
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.rafId);
    stopAllGameplaySounds();
  }

  goMenu() {
    this.stop();
    stopAllGameplaySounds();
    this.resetGameState();
    this.screen = 'menu';
    this.cb.onScreen('menu');
    this.pushState();
    // Restart loop for ambient menu background
    this.running = true;
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  setKey(code: string, down: boolean) {
    this.keys[code] = down;
    if (down && code === 'KeyE') {
      if (this.canRescue) this.tryRescue();
      else if (this.canEnter) this.tryEnter();
      else {
        // Fallback or generic interact
        this.tryRescue();
        this.tryEnter();
      }
    }
  }

  setJoystick(v: { x: number; y: number } | null) {
    this.joystick = v;
  }

  togglePause() {
    if (this.screen === 'playing') {
      this.paused = !this.paused;
      this.pushState();
    }
  }

  tryEnter() {
    if (this.screen !== 'playing' || this.paused) return;
    if (this.canEnter) {
      this.triggerAlert('SHELTERING IN BUILDING... (Safe from currents)');
      this.spawnRipple(this.player.x, this.player.y, 60, 1, 'rgba(0,243,255,0.7)');
      sfx.rescue(); // placeholder sound
    }
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.canvas.width = Math.floor(w * dpr);
    this.canvas.height = Math.floor(h * dpr);
    this.canvas.style.width = w + 'px';
    this.canvas.style.height = h + 'px';
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.initRain();
  }

  initRain() {
    const w = window.innerWidth, h = window.innerHeight;
    this.rain = [];
    // background layer (slower, thinner) + foreground (faster, thicker)
    for (let i = 0; i < 180; i++) {
      const layer = Math.random() < 0.4 ? 0 : 1;
      this.rain.push({
        x: Math.random() * w,
        y: Math.random() * h,
        len: layer ? (10 + Math.random() * 18) : (5 + Math.random() * 8),
        speed: layer ? (9 + Math.random() * 9) : (4 + Math.random() * 4),
        slant: 2.2 + Math.random() * 1.6,
        alpha: layer ? (0.35 + Math.random() * 0.45) : (0.12 + Math.random() * 0.2),
        layer,
      });
    }
  }

  initDebris() {
    this.debris = [];
    for (const s of FLOATING_DEBRIS_SPAWNS) {
      this.debris.push({
        x: s.x + (Math.random() - 0.5) * 80,
        y: s.y + (Math.random() - 0.5) * 80,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.08,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.02,
        size: 8 + Math.random() * 14,
        kind: Math.floor(Math.random() * 3),
        alpha: 0.5 + Math.random() * 0.3,
      });
    }
  }

  loop = (t: number) => {
    if (!this.running) return;
    const dt = Math.min(0.05, (t - this.lastTime) / 1000);
    this.lastTime = t;
    this.update(dt);
    this.render();
    this.rafId = requestAnimationFrame(this.loop);
  };

  // ---------- update (LOGIC UNCHANGED) ----------
  update(dt: number) {
    if (this.screen !== 'playing') {
      this.menuCamT += dt;
      // gentle camera drift over the map for menu ambience
      const cw = window.innerWidth, ch = window.innerHeight;
      this.cam.x = 200 + Math.sin(this.menuCamT * 0.08) * 280;
      this.cam.y = 1200 + Math.cos(this.menuCamT * 0.06) * 180;
      this.cam.x = Math.max(0, Math.min(WORLD.width - cw, this.cam.x));
      this.cam.y = Math.max(0, Math.min(WORLD.height - ch, this.cam.y));
      // ambient flood for menu visuals
      this.flood = 30;
      this.updateRain(dt);
      this.updateEffects(dt);
      this.updateLightning(dt);
      this.updateDebris(dt);
      this.render();
      return;
    }

    if (this.paused) {
      // Keep rendering, but skip logic update
      return;
    }

    this.elapsed += dt;
    this.timeLeft = Math.max(0, FLOOD.durationSec - this.elapsed);

    const steps = Math.floor(this.elapsed / FLOOD.stepIntervalSec);
    this.flood = Math.min(100, FLOOD.start + steps * FLOOD.step);
    setFloodLevel(this.flood);

    if (!this.routeABlocked && this.flood >= ROUTE_A_BLOCK_FLOOD) {
      this.routeABlocked = true;
      this.triggerAlert('ROUTE A BLOCKED — DIRECT HIGHWAY SUBMERGED. USE ROUTE B OR ROUTE C.');
      sfx.alarm();
      this.shake = 12;
    }
    if (!this.routeBBlocked && this.flood >= ROUTE_B_BLOCK_FLOOD) {
      this.routeBBlocked = true;
      this.triggerAlert('ROUTE B BLOCKED — MARKET CAUSEWAY SUBMERGED. ROUTE C IS THE FINAL EVACUATION PATH.');
      sfx.alarm();
      this.shake = 12;
    }

    this.handleMovement(dt);

    const cw = window.innerWidth, ch = window.innerHeight;
    this.camTarget.x = this.player.x - cw / 2;
    this.camTarget.y = this.player.y - ch / 2;
    this.camTarget.x = Math.max(0, Math.min(WORLD.width - cw, this.camTarget.x));
    this.camTarget.y = Math.max(0, Math.min(WORLD.height - ch, this.camTarget.y));
    this.cam.x += (this.camTarget.x - this.cam.x) * Math.min(1, dt * 6);
    this.cam.y += (this.camTarget.y - this.cam.y) * Math.min(1, dt * 6);

    this.updateFollow(dt);
    this.updateSafeZone();
    this.updateHazards(dt);

    if (this.player.invuln > 0) this.player.invuln -= dt;

    if (this.flood > 50 && this.player.moving && Math.random() < dt * 6) {
      this.spawnRipple(this.player.x, this.player.y, 22, 0.5, 'rgba(0,243,255,0.5)');
      // splash particles
      if (this.flood > 60 && Math.random() < 0.5) {
        for (let i = 0; i < 2; i++) {
          this.particles.push({ x: this.player.x, y: this.player.y + 6, vx: (Math.random() - 0.5) * 2, vy: -1 - Math.random() * 1.5, life: 0.5, maxLife: 0.5, color: 'rgba(150,220,255,0.8)', size: 2, gravity: 0.12, kind: 'splash' });
        }
      }
    }
    for (const c of this.civilians) {
      if (c.rescued && !c.saved && Math.random() < dt * 2) {
        this.spawnRipple(c.x, c.y, 16, 0.4, 'rgba(0,243,255,0.4)');
      }
      c.idlePhase += dt * 2;
    }

    this.updateLightning(dt);
    this.shake = Math.max(0, this.shake - dt * 18);

    this.updateRain(dt);
    this.updateEffects(dt);
    this.updateDebris(dt);
    this.updateAlert(dt);

    this.updateContextActions();

    // Heartbeat logic for low health (<30 HP)
    if (this.player.health < 30 && this.player.health > 0) {
      this.heartbeatTimer = (this.heartbeatTimer ?? 0) + dt;
      const rate = this.player.health < 15 ? 0.7 : 1.3;
      if (this.heartbeatTimer >= rate) {
        this.heartbeatTimer = 0;
        playHeartbeat();
      }
    } else {
      this.heartbeatTimer = 0;
    }

    if (this.player.health <= 0) { this.lose('HEALTH DEPLETED'); return; }
    if (this.timeLeft <= 0) { this.lose('FLOOD CRITICAL'); return; }
    if (this.savedCount >= 6 && this.playerInSafe) { this.win(); return; }

    this.pushState();
  }

  updateContextActions() {
    this.canRescue = false;
    for (const c of this.civilians) {
      if (!c.rescued && Math.hypot(c.x - this.player.x, c.y - this.player.y) < RESCUE.radius) {
        this.canRescue = true;
        break;
      }
    }
    
    this.canEnter = false;
    for (const b of buildings) {
      if (b.kind === 'chawl' || b.kind === 'commercial') {
        const d = Math.max(b.x - this.player.x, this.player.x - (b.x + b.w), b.y - this.player.y, this.player.y - (b.y + b.h));
        if (d < 40) { // close enough to enter
          this.canEnter = true;
          break;
        }
      }
    }
  }

  handleMovement(dt: number) {
    const k = this.keys;
    let ix = 0, iy = 0;
    
    if (this.joystick) {
      ix = this.joystick.x;
      iy = this.joystick.y;
    } else {
      if (k['KeyW'] || k['ArrowUp']) iy -= 1;
      if (k['KeyS'] || k['ArrowDown']) iy += 1;
      if (k['KeyA'] || k['ArrowLeft']) ix -= 1;
      if (k['KeyD'] || k['ArrowRight']) ix += 1;
    }

    const mag = Math.hypot(ix, iy);
    if (mag > 0) { ix /= mag; iy /= mag; }

    const wantSprint = !!k['ShiftLeft'] || !!k['ShiftRight'];
    const canSprint = wantSprint && this.player.stamina > 1 && mag > 0;
    let speed = canSprint ? PLAYER.sprintSpeed : PLAYER.speed;

    if (this.flood >= 70) speed *= 0.72;
    if (this.flood >= 90) speed *= 0.85;
    if (canSprint && this.flood >= 70) speed *= 0.85;

    this.player.sprinting = canSprint;

    if (canSprint) {
      this.player.stamina = Math.max(0, this.player.stamina - PLAYER.staminaDrain * dt);
    } else {
      this.player.stamina = Math.min(PLAYER.maxStamina, this.player.stamina + PLAYER.staminaRegen * dt);
    }

    const nx = this.player.x + ix * speed * dt * 60;
    const ny = this.player.y + iy * speed * dt * 60;

    if (!this.collidesAt(nx, this.player.y)) this.player.x = nx;
    if (!this.collidesAt(this.player.x, ny)) this.player.y = ny;

    this.player.moving = mag > 0;
    if (mag > 0) this.player.facing = { x: ix, y: iy };
    this.player.walkPhase += dt * (this.player.moving ? 10 : 0);
    this.player.wadePhase += dt * 4;

    // Wet/Splash Footsteps trigger based on speed and flood depth
    if (this.player.moving) {
      this.stepTimer = (this.stepTimer ?? 0) + dt * speed;
      const threshold = canSprint ? 1.4 : 0.8;
      if (this.stepTimer >= threshold) {
        this.stepTimer = 0;
        playFootstep(this.flood, canSprint);
      }

      // Exertion/Breathing Audio Trigger
      this.effortTimer = (this.effortTimer ?? 0) + dt;
      const isInDeepWater = this.flood >= 50;
      let effortThreshold = 6.0 + Math.random() * 4.0; // 6-10 seconds
      let intensity: 'walk' | 'sprint' | 'deep' = 'walk';
      if (canSprint) {
        effortThreshold = 2.0 + Math.random() * 1.5; // 2-3.5 seconds
        intensity = 'sprint';
      } else if (isInDeepWater) {
        effortThreshold = 1.5 + Math.random() * 1.0; // 1.5-2.5 seconds
        intensity = 'deep';
      }
      if (this.effortTimer >= effortThreshold) {
        this.effortTimer = 0;
        playEffort(intensity);
      }
    } else {
      this.stepTimer = 0;
      this.effortTimer = 0;
    }
  }

  collidesAt(x: number, y: number): boolean {
    const r = PLAYER.radius;
    if (x < r || y < r || x > WORLD.width - r || y > WORLD.height - r) return true;
    for (const b of buildings) {
      if (x + r > b.x && x - r < b.x + b.w && y + r > b.y && y - r < b.y + b.h) return true;
    }
    for (const v of vehicles) {
      if (x + r > v.x && x - r < v.x + v.w && y + r > v.y && y - r < v.y + v.h) return true;
    }
    for (const bar of barriers) {
      const blocked = bar.id === 'A' ? this.routeABlocked : bar.id === 'B' ? this.routeBBlocked : false;
      if (!blocked) continue;
      const r2 = bar.rect;
      if (x + r > r2.x && x - r < r2.x + r2.w && y + r > r2.y && y - r < r2.y + r2.h) return true;
    }
    return false;
  }

  tryRescue() {
    if (this.screen !== 'playing') return;
    for (const c of this.civilians) {
      if (c.rescued) continue;
      const d = Math.hypot(c.x - this.player.x, c.y - this.player.y);
      if (d < RESCUE.radius) {
        c.rescued = true;
        this.rescuedCount++;
        sfx.rescue();
        this.spawnRipple(c.x, c.y, 60, 1, 'rgba(16,185,129,0.7)');
        for (let i = 0; i < 18; i++) {
          const a = Math.random() * Math.PI * 2;
          this.particles.push({ x: c.x, y: c.y, vx: Math.cos(a) * 2.8, vy: Math.sin(a) * 2.8 - 0.5, life: 0.9, maxLife: 0.9, color: '#10B981', size: 3, gravity: 0.05, kind: 'spark' });
        }
        this.floats.push({ x: c.x, y: c.y - 20, text: 'RESCUED', life: 1.4, color: '#10B981', vy: -22 });
        if (this.rescuedCount >= 6) {
          this.triggerAlert('ALL CIVILIANS RESCUED — REACH THE SAFE ZONE.');
        } else {
          this.triggerAlert(`CIVILIAN RESCUED — ${this.rescuedCount}/6 SECURED.`);
        }
        this.pushState();
        return;
      }
    }
  }

  updateFollow(dt: number) {
    const leaders: Vec[] = [{ x: this.player.x, y: this.player.y }];
    let idx = 0;
    for (const c of this.civilians) {
      if (!c.rescued || c.saved) continue;
      idx++;
      const leader = leaders[leaders.length - 1];
      const offset = 34 * idx;
      const fx = -this.player.facing.x, fy = -this.player.facing.y;
      const fl = Math.hypot(fx, fy) || 1;
      const tx = leader.x + (fx / fl) * offset;
      const ty = leader.y + (fy / fl) * offset;
      const dx = tx - c.x, dy = ty - c.y;
      const dist = Math.hypot(dx, dy);
      const followSpeed = (this.player.sprinting ? PLAYER.sprintSpeed * 0.85 : PLAYER.speed) * 60 * dt;
      if (dist > 6) {
        const mv = Math.min(dist, followSpeed);
        const ux = dx / dist, uy = dy / dist;
        const nx = c.x + ux * mv;
        const ny = c.y + uy * mv;
        if (!this.collidesAt(nx, c.y)) c.x = nx;
        if (!this.collidesAt(c.x, ny)) c.y = ny;
        c.walkPhase += dt * 10;
      }
      c.wadePhase += dt * 4;
      leaders.push({ x: c.x, y: c.y });
    }
  }

  updateSafeZone() {
    const inSafe = this.player.x > SAFE_ZONE.x && this.player.x < SAFE_ZONE.x + SAFE_ZONE.w
      && this.player.y > SAFE_ZONE.y && this.player.y < SAFE_ZONE.y + SAFE_ZONE.h;
    this.playerInSafe = inSafe;

    if (inSafe && !this.safeZoneAudioTriggered) {
      this.safeZoneAudioTriggered = true;
      enterSafeZone();
    }

    for (const c of this.civilians) {
      if (!c.rescued || c.saved) continue;
      const cinSafe = c.x > SAFE_ZONE.x && c.x < SAFE_ZONE.x + SAFE_ZONE.w
        && c.y > SAFE_ZONE.y && c.y < SAFE_ZONE.y + SAFE_ZONE.h;
      if (cinSafe) {
        c.saved = true;
        this.savedCount++;
        sfx.saved();
        this.spawnRipple(c.x, c.y, 50, 1, 'rgba(0,243,255,0.7)');
        for (let i = 0; i < 16; i++) {
          const a = Math.random() * Math.PI * 2;
          this.particles.push({ x: c.x, y: c.y, vx: Math.cos(a) * 2.4, vy: Math.sin(a) * 2.4 - 1.5, life: 1.2, maxLife: 1.2, color: '#00F3FF', size: 3, gravity: 0.04, kind: 'spark' });
        }
        this.floats.push({ x: c.x, y: c.y - 20, text: 'SAVED ✓', life: 1.6, color: '#00F3FF', vy: -24 });
        this.triggerAlert(`CIVILIAN SAVED — ${this.savedCount}/6 EVACUATED.`);
      }
    }
  }

  updateHazards(dt: number) {
    for (const h of hazards) {
      const d = Math.hypot(h.x - this.player.x, h.y - this.player.y);
      if (h.type === 'manhole' && d < h.r + PLAYER.radius && this.player.invuln <= 0) {
        this.damage(15);
        this.player.invuln = 1.2;
        sfx.hazard();
        this.shake = 8;
        this.spawnRipple(h.x, h.y, 40, 1, 'rgba(255,183,3,0.7)');
        const a = Math.atan2(this.player.y - h.y, this.player.x - h.x);
        this.player.x += Math.cos(a) * 20;
        this.player.y += Math.sin(a) * 20;
      } else if (h.type === 'electric' && d < h.r + PLAYER.radius && this.player.invuln <= 0) {
        this.damage(25);
        this.player.invuln = 1.4;
        sfx.electric();
        this.shake = 14;
        for (let i = 0; i < 14; i++) {
          const a = Math.random() * Math.PI * 2;
          this.particles.push({ x: h.x, y: h.y, vx: Math.cos(a) * 3.5, vy: Math.sin(a) * 3.5, life: 0.5, maxLife: 0.5, color: '#aef6ff', size: 2, kind: 'spark' });
        }
      } else if (h.type === 'current') {
        if (d < h.r + PLAYER.radius + 20) {
          const push = 0.5 * 60 * dt;
          if (h.dir) {
            const nx = this.player.x + h.dir.x * push;
            const ny = this.player.y + h.dir.y * push;
            if (!this.collidesAt(nx, this.player.y)) this.player.x = nx;
            if (!this.collidesAt(this.player.x, ny)) this.player.y = ny;
          }
        }
        if (this.flood >= 80 && d < h.r + 60) {
          this.currentTick += dt;
          if (this.currentTick > 1) {
            this.currentTick = 0;
            this.damage(3);
          }
        }
      }
    }
  }

  damage(n: number) {
    this.player.health = Math.max(0, this.player.health - n);
    this.floats.push({ x: this.player.x, y: this.player.y - 24, text: '-' + n, life: 0.9, color: '#FF0055', vy: -28 });
  }

  triggerAlert(text: string) {
    this.alert = text;
    this.alertTimer = 3.2;
    this.cb.onAlert(text);
  }
  updateAlert(dt: number) {
    if (this.alert) {
      this.alertTimer -= dt;
      if (this.alertTimer <= 0) {
        this.alert = null;
        this.cb.onAlert(null);
      }
    }
  }

  spawnRipple(x: number, y: number, maxR: number, alpha: number, color: string) {
    this.ripples.push({ x, y, r: 4, maxR, alpha, color, width: 2 });
  }

  updateLightning(dt: number) {
    this.lightningCooldown -= dt;
    if (this.lightningCooldown <= 0) {
      this.lightning = 1;
      this.lightningCooldown = 7 + Math.random() * 13;
      triggerLightningThunder();
      this.shake = Math.max(this.shake, 4);
      // generate bolt
      const cw = window.innerWidth, ch = window.innerHeight;
      const pts: { x: number; y: number }[] = [];
      let bx = Math.random() * cw, by = 0;
      pts.push({ x: bx, y: by });
      while (by < ch * 0.7) {
        bx += (Math.random() - 0.5) * 60;
        by += 20 + Math.random() * 30;
        pts.push({ x: bx, y: by });
      }
      this.lightningBolt = { pts, life: 0.4 };
    }
    if (this.lightning > 0) this.lightning = Math.max(0, this.lightning - dt * 3.5);
    if (this.lightningBolt) {
      this.lightningBolt.life -= dt;
      if (this.lightningBolt.life <= 0) this.lightningBolt = null;
    }
  }

  updateRain(dt: number) {
    const w = window.innerWidth, h = window.innerHeight;
    const intensity = 1 + this.flood / 100;
    for (const d of this.rain) {
      d.y += d.speed * intensity * dt * 60;
      d.x += d.slant * intensity * dt * 60;
      if (d.y > h) {
        d.y = -10; d.x = Math.random() * w;
        // ground splash ripple occasionally
        if (d.layer && Math.random() < 0.15) {
          this.ripples.push({ x: d.x + this.cam.x, y: h + this.cam.y - 2, r: 2, maxR: 8, alpha: 0.4, color: 'rgba(150,200,255,0.5)', width: 1 });
        }
      }
      if (d.x > w) d.x = 0;
    }
  }

  updateDebris(dt: number) {
    const fl = this.flood / 100;
    for (const d of this.debris) {
      d.x += d.vx + Math.sin(performance.now() / 1200 + d.rot) * 0.05;
      d.y += d.vy + Math.cos(performance.now() / 1400 + d.rot) * 0.04;
      d.rot += d.vr;
      // keep near spawn
      // drift slowly; wrap minimally
    }
    // only show debris above flood threshold
    void fl;
  }

  updateEffects(dt: number) {
    for (let i = this.ripples.length - 1; i >= 0; i--) {
      const r = this.ripples[i];
      r.r += dt * 40;
      r.alpha -= dt * 0.8;
      if (r.alpha <= 0 || r.r > r.maxR) this.ripples.splice(i, 1);
    }
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx; p.y += p.vy;
      if (p.gravity) p.vy += p.gravity;
      if (p.vr) p.rot = (p.rot ?? 0) + p.vr;
      p.life -= dt;
      if (p.life <= 0) this.particles.splice(i, 1);
    }
    for (let i = this.floats.length - 1; i >= 0; i--) {
      const f = this.floats[i];
      f.y += f.vy * dt;
      f.life -= dt;
      if (f.life <= 0) this.floats.splice(i, 1);
    }
    this.vignetteAlpha = 0.25 + (this.flood / 100) * 0.45;
  }

  lose(reason: string) {
    if (this.screen !== 'playing') return;
    this.screen = 'lost';
    this.running = false;
    this.loseReason = reason;
    sfx.gameover();
    this.cb.onScreen('lost');
    this.pushState();
  }
  loseReason = 'FLOOD CRITICAL';

  win() {
    if (this.screen !== 'playing') return;
    this.screen = 'won';
    this.running = false;
    sfx.victory();
    this.cb.onScreen('won');
    this.pushState();
  }

  pushState() {
    const objective = this.rescuedCount >= 6
      ? 'All civilians rescued! Get them to the Safe Zone.'
      : 'Rescue 6 stranded civilians and reach the elevated Safe Zone.';
    this.cb.onState({
      screen: this.screen,
      health: this.player.health,
      stamina: this.player.stamina,
      rescued: this.rescuedCount,
      saved: this.savedCount,
      flood: this.flood,
      timeLeft: this.timeLeft,
      objective,
      alert: this.alert,
      routeABlocked: this.routeABlocked,
      routeBBlocked: this.routeBBlocked,
      playerInSafe: this.playerInSafe,
      paused: this.paused,
      canRescue: this.canRescue,
      canEnter: this.canEnter,
    });
  }

  // ================= RENDER (UPGRADED) =================
  render() {
    const ctx = this.ctx;
    const cw = window.innerWidth, ch = window.innerHeight;
    ctx.save();
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, cw, ch);

    if (this.shake > 0) {
      ctx.translate((Math.random() - 0.5) * this.shake, (Math.random() - 0.5) * this.shake);
    }

    ctx.save();
    ctx.translate(-this.cam.x, -this.cam.y);

    this.renderGround(ctx);
    this.renderRoads(ctx);
    this.renderRoadDetails(ctx);
    this.renderBuildings(ctx);
    this.renderOverheadWires(ctx);
    this.renderLampPosts(ctx);
    this.renderVehicles(ctx);
    this.renderPuddles(ctx);
    this.renderSafeZone(ctx);
    this.renderRouteMarkers(ctx);
    this.renderBarriers(ctx);
    this.renderHazards(ctx);
    this.renderFloatingDebris(ctx);
    this.renderCivilians(ctx);
    this.renderPlayer(ctx);
    this.renderWater(ctx);
    this.renderRipples(ctx);
    this.renderParticles(ctx);
    this.renderFloats(ctx);

    ctx.restore();

    // lightning illuminates the whole scene briefly
    this.renderLightningScene(ctx);
    this.renderRain(ctx);
    this.renderLightningBolt(ctx);
    this.renderFog(ctx);
    this.renderVignette(ctx);

    ctx.restore();
  }

  renderGround(ctx: CanvasRenderingContext2D) {
    // base ground gradient
    const g = ctx.createLinearGradient(0, 0, 0, WORLD.height);
    g.addColorStop(0, '#0a1626');
    g.addColorStop(1, '#0b1a2c');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, WORLD.width, WORLD.height);
    // subtle tile texture
    ctx.strokeStyle = 'rgba(120,160,200,0.025)';
    ctx.lineWidth = 1;
    for (let x = 0; x < WORLD.width; x += 80) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, WORLD.height); ctx.stroke();
    }
    for (let y = 0; y < WORLD.height; y += 80) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(WORLD.width, y); ctx.stroke();
    }
  }

  renderRoads(ctx: CanvasRenderingContext2D) {
    for (const r of roads) {
      const isFly = r.kind === 'flyover';
      // asphalt with subtle gradient
      const g = ctx.createLinearGradient(r.x, r.y, r.x, r.y + r.h);
      if (isFly) { g.addColorStop(0, '#1c2638'); g.addColorStop(1, '#161e2c'); }
      else { g.addColorStop(0, '#161f2e'); g.addColorStop(1, '#101824'); }
      ctx.fillStyle = g;
      ctx.fillRect(r.x, r.y, r.w, r.h);
      // edge curbs
      ctx.fillStyle = 'rgba(60,80,110,0.5)';
      if (r.w >= r.h) {
        ctx.fillRect(r.x, r.y, r.w, 3);
        ctx.fillRect(r.x, r.y + r.h - 3, r.w, 3);
      } else {
        ctx.fillRect(r.x, r.y, 3, r.h);
        ctx.fillRect(r.x + r.w - 3, r.y, 3, r.h);
      }
      // edge glow for flyover
      if (isFly) {
        ctx.strokeStyle = 'rgba(16,185,129,0.4)';
        ctx.lineWidth = 2;
        ctx.strokeRect(r.x + 1, r.y + 1, r.w - 2, r.h - 2);
      }
      // center dashed markings
      ctx.strokeStyle = isFly ? 'rgba(16,185,129,0.65)' : 'rgba(255,235,180,0.32)';
      ctx.lineWidth = 3;
      ctx.setLineDash([20, 18]);
      const horiz = r.w >= r.h;
      if (horiz) {
        const y = r.y + r.h / 2;
        ctx.beginPath(); ctx.moveTo(r.x + 8, y); ctx.lineTo(r.x + r.w - 8, y); ctx.stroke();
      } else {
        const x = r.x + r.w / 2;
        ctx.beginPath(); ctx.moveTo(x, r.y + 8); ctx.lineTo(x, r.y + r.h - 8); ctx.stroke();
      }
      ctx.setLineDash([]);
      // side white lines
      ctx.strokeStyle = 'rgba(255,255,255,0.12)';
      ctx.lineWidth = 1.5;
      if (horiz) {
        ctx.beginPath(); ctx.moveTo(r.x + 8, r.y + 8); ctx.lineTo(r.x + r.w - 8, r.y + 8); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(r.x + 8, r.y + r.h - 8); ctx.lineTo(r.x + r.w - 8, r.y + r.h - 8); ctx.stroke();
      } else {
        ctx.beginPath(); ctx.moveTo(r.x + 8, r.y + 8); ctx.lineTo(r.x + 8, r.y + r.h - 8); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(r.x + r.w - 8, r.y + 8); ctx.lineTo(r.x + r.w - 8, r.y + r.h - 8); ctx.stroke();
      }
    }
  }

  renderRoadDetails(ctx: CanvasRenderingContext2D) {
    // zebra crossings at a few intersections, plus street-side electrical boxes & bins
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    const crossings = [
      { x: 300, y: 600, vert: true }, { x: 1020, y: 780, vert: true }, { x: 1480, y: 780, vert: true },
    ];
    for (const c of crossings) {
      if (c.vert) {
        for (let i = 0; i < 5; i++) {
          ctx.fillRect(c.x + i * 10, c.y + 40, 6, 40);
        }
      }
    }
    // electrical boxes & bins near buildings (decorative, no collision change)
    const boxes = [
      { x: 290, y: 770, c: '#1a2a3a' }, { x: 700, y: 990, c: '#1a2a3a' }, { x: 1230, y: 990, c: '#1a2a3a' },
      { x: 1640, y: 1090, c: '#1a2a3a' }, { x: 290, y: 1600, c: '#1a2a3a' },
    ];
    for (const b of boxes) {
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.fillRect(b.x + 2, b.y + 3, 16, 22);
      ctx.fillStyle = b.c;
      ctx.fillRect(b.x, b.y, 16, 22);
      ctx.strokeStyle = 'rgba(255,183,3,0.3)';
      ctx.lineWidth = 1;
      ctx.strokeRect(b.x, b.y, 16, 22);
      // warning dot
      ctx.fillStyle = '#FFB703';
      ctx.beginPath(); ctx.arc(b.x + 8, b.y + 6, 1.5, 0, Math.PI * 2); ctx.fill();
    }
    // garbage bins
    const bins = [{ x: 690, y: 1140 }, { x: 1500, y: 1140 }, { x: 1800, y: 1490 }];
    for (const b of bins) {
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(b.x + 2, b.y + 2, 18, 20);
      ctx.fillStyle = '#1f5d3a';
      ctx.fillRect(b.x, b.y, 18, 20);
      ctx.fillStyle = '#2a7a4d';
      ctx.fillRect(b.x, b.y, 18, 4);
    }
    // parked scooters
    const scooters = [{ x: 580, y: 1650 }, { x: 1500, y: 1660 }];
    for (const s of scooters) {
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(s.x + 1, s.y + 2, 26, 14);
      ctx.fillStyle = '#2a3a4a';
      ctx.fillRect(s.x, s.y, 26, 14);
      ctx.fillStyle = '#0a0a0a';
      ctx.beginPath(); ctx.arc(s.x + 5, s.y + 14, 4, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(s.x + 21, s.y + 14, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#888';
      ctx.fillRect(s.x + 8, s.y - 8, 4, 10);
    }
  }

  renderBuildings(ctx: CanvasRenderingContext2D) {
    const floodLevel = this.flood / 100;
    const t = performance.now() / 1000;
    for (const b of buildings) {
      if (b.kind === 'wall') {
        // outer boundary — concrete seawall feel
        ctx.fillStyle = '#0a1422';
        ctx.fillRect(b.x, b.y, b.w, b.h);
        ctx.fillStyle = 'rgba(80,110,150,0.18)';
        for (let i = 0; i < b.w; i += 24) ctx.fillRect(b.x + i, b.y, 2, b.h);
        ctx.strokeStyle = 'rgba(0,153,255,0.18)';
        ctx.lineWidth = 2;
        ctx.strokeRect(b.x, b.y, b.w, b.h);
        continue;
      }

      // drop shadow
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(b.x + 5, b.y + 7, b.w, b.h);

      const isSub = b.kind === 'substation';
      const isComm = b.kind === 'commercial';
      const isMarket = b.kind === 'market';

      // facade base with vertical gradient
      const fg = ctx.createLinearGradient(b.x, b.y, b.x, b.y + b.h);
      if (isSub) { fg.addColorStop(0, '#222c3c'); fg.addColorStop(1, '#161e2c'); }
      else if (isComm) { fg.addColorStop(0, '#1d2838'); fg.addColorStop(1, '#121a28'); }
      else if (isMarket) { fg.addColorStop(0, '#2a2218'); fg.addColorStop(1, '#1a1610'); }
      else { fg.addColorStop(0, '#1a2434'); fg.addColorStop(1, '#0f1824'); }
      ctx.fillStyle = fg;
      ctx.fillRect(b.x, b.y, b.w, b.h);

      // rooftop band (lighter)
      ctx.fillStyle = 'rgba(120,150,190,0.12)';
      ctx.fillRect(b.x, b.y, b.w, 5);

      // edge highlight
      ctx.strokeStyle = isSub ? 'rgba(255,183,3,0.45)' : isComm ? 'rgba(0,153,255,0.25)' : 'rgba(120,150,190,0.22)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(b.x + 0.5, b.y + 0.5, b.w - 1, b.h - 1);

      // rooftop details: water tanks + AC units (only on bigger buildings)
      if (b.w > 90 && b.h > 90 && !isMarket) {
        // water tank (iconic Mumbai blue drum)
        const tx = b.x + 8, ty = b.y + 8;
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.fillRect(tx + 1, ty + 2, 14, 14);
        ctx.fillStyle = '#2a4a6a';
        ctx.fillRect(tx, ty, 14, 14);
        ctx.strokeStyle = 'rgba(0,153,255,0.4)';
        ctx.lineWidth = 1;
        ctx.strokeRect(tx, ty, 14, 14);
        // AC unit
        if (b.w > 120) {
          ctx.fillStyle = '#2a3340';
          ctx.fillRect(b.x + b.w - 22, b.y + 8, 14, 10);
          ctx.fillStyle = 'rgba(120,150,190,0.3)';
          ctx.fillRect(b.x + b.w - 20, b.y + 10, 10, 6);
        }
      }

      // windows with warm glow
      const wPad = 7, hPad = isMarket ? 16 : 12;
      const colW = isMarket ? 26 : 20;
      const rowH = isMarket ? 30 : 22;
      const cols = Math.max(1, Math.floor((b.w - 14) / colW));
      const rows = Math.max(1, Math.floor((b.h - 24) / rowH));
      for (let rr = 0; rr < rows; rr++) {
        for (let cc = 0; cc < cols; cc++) {
          const lit = (rr * 7 + cc * 3 + (isSub ? 1 : 0)) % 5 !== 0;
          const wx = b.x + wPad + cc * colW;
          const wy = b.y + hPad + rr * rowH;
          // submerge windows partially at high flood
          const submerged = wy > b.y + b.h * (1 - floodLevel * 0.35);
          if (submerged && floodLevel > 0.45) continue;
          // window frame
          ctx.fillStyle = 'rgba(8,14,24,0.9)';
          ctx.fillRect(wx, wy, 11, 14);
          if (lit) {
            // warm interior glow, flicker slightly
            const flick = 0.7 + 0.3 * Math.sin(t * 3 + rr * 2 + cc);
            ctx.fillStyle = isSub
              ? `rgba(255,183,3,${0.5 * flick})`
              : isComm
                ? `rgba(120,200,255,${0.4 * flick})`
                : `rgba(255,200,110,${0.55 * flick})`;
            ctx.fillRect(wx + 1, wy + 1, 9, 12);
            // soft halo
            ctx.fillStyle = `rgba(255,200,110,${0.08 * flick})`;
            ctx.fillRect(wx - 2, wy - 2, 15, 18);
          }
        }
      }

      // balconies on chawl/commercial (small ledges)
      if (!isMarket && !isSub && b.h > 70) {
        ctx.fillStyle = 'rgba(140,170,210,0.15)';
        for (let rr = 0; rr < rows; rr++) {
          const wy = b.y + hPad + rr * rowH + 14;
          if (wy > b.y + b.h - 6) break;
          ctx.fillRect(b.x + 2, wy, b.w - 4, 2);
        }
      }

      // market awnings
      if (isMarket) {
        ctx.fillStyle = '#c0392b';
        ctx.fillRect(b.x - 2, b.y + 6, b.w + 4, 8);
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        for (let i = 0; i < b.w + 4; i += 8) ctx.fillRect(b.x - 2 + i, b.y + 6, 4, 8);
        // shop sign
        ctx.fillStyle = '#FFB703';
        ctx.font = 'bold 8px Orbitron';
        ctx.textAlign = 'center';
        ctx.fillText('SHOP', b.x + b.w / 2, b.y + 13);
        ctx.textAlign = 'left';
      }

      // substation warning signage
      if (isSub) {
        ctx.fillStyle = '#FFB703';
        ctx.font = 'bold 14px Orbitron';
        ctx.textAlign = 'center';
        ctx.fillText('⚡ HV', b.x + b.w / 2, b.y + 22);
        ctx.textAlign = 'left';
        // danger chevrons
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(b.x + 4, b.y + b.h - 14, b.w - 8, 10);
        ctx.fillStyle = '#FFB703';
        for (let i = 0; i < b.w - 10; i += 8) {
          ctx.beginPath();
          ctx.moveTo(b.x + 4 + i, b.y + b.h - 12);
          ctx.lineTo(b.x + 8 + i, b.y + b.h - 6);
          ctx.lineTo(b.x + 12 + i, b.y + b.h - 12);
          ctx.fill();
        }
      }

      // flood line on building base (water stain)
      if (floodLevel > 0.2) {
        const stainH = Math.min(b.h * 0.4, floodLevel * b.h * 0.5);
        ctx.fillStyle = `rgba(0,60,110,${0.35 + floodLevel * 0.25})`;
        ctx.fillRect(b.x, b.y + b.h - stainH, b.w, stainH);
        ctx.strokeStyle = `rgba(0,243,255,${0.15 + floodLevel * 0.2})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(b.x, b.y + b.h - stainH);
        ctx.lineTo(b.x + b.w, b.y + b.h - stainH);
        ctx.stroke();
      }
    }
  }

  renderOverheadWires(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = 'rgba(20,20,20,0.6)';
    ctx.lineWidth = 1.5;
    for (const w of OVERHEAD_WIRES) {
      // sag
      const mx = (w.x1 + w.x2) / 2, my = (w.y1 + w.y2) / 2 + 8;
      ctx.beginPath();
      ctx.moveTo(w.x1, w.y1);
      ctx.quadraticCurveTo(mx, my, w.x2, w.y2);
      ctx.stroke();
    }
  }

  renderLampPosts(ctx: CanvasRenderingContext2D) {
    const fl = this.flood / 100;
    const t = performance.now() / 1000;
    for (const lp of LAMP_POSTS) {
      // only draw if on screen
      if (lp.x < this.cam.x - 40 || lp.x > this.cam.x + window.innerWidth + 40) continue;
      if (lp.y < this.cam.y - 40 || lp.y > this.cam.y + window.innerHeight + 40) continue;
      // pole
      ctx.fillStyle = '#1a2230';
      ctx.fillRect(lp.x - 2, lp.y - 30, 4, 30);
      // arm
      ctx.fillRect(lp.x - 2, lp.y - 30, 12, 3);
      // lamp head
      const flick = 0.85 + 0.15 * Math.sin(t * 5 + lp.x);
      ctx.fillStyle = `rgba(255,210,140,${0.9 * flick})`;
      ctx.beginPath(); ctx.arc(lp.x + 10, lp.y - 27, 3, 0, Math.PI * 2); ctx.fill();
      // halo
      const g = ctx.createRadialGradient(lp.x + 10, lp.y - 27, 2, lp.x + 10, lp.y - 27, 36);
      g.addColorStop(0, `rgba(255,210,140,${0.32 * flick})`);
      g.addColorStop(1, 'rgba(255,210,140,0)');
      ctx.fillStyle = g;
      ctx.fillRect(lp.x - 26, lp.y - 63, 72, 72);
      // ground light pool
      if (fl < 0.6) {
        const g2 = ctx.createRadialGradient(lp.x + 6, lp.y + 4, 2, lp.x + 6, lp.y + 4, 40);
        g2.addColorStop(0, `rgba(255,210,140,${0.12 * flick})`);
        g2.addColorStop(1, 'rgba(255,210,140,0)');
        ctx.fillStyle = g2;
        ctx.fillRect(lp.x - 34, lp.y - 36, 80, 80);
      }
    }
  }

  renderVehicles(ctx: CanvasRenderingContext2D) {
    const fl = this.flood / 100;
    const t = performance.now() / 1000;
    for (const v of vehicles) {
      ctx.save();
      // reflection beneath (grows with flood)
      if (fl > 0.25) {
        const rg = ctx.createLinearGradient(v.x, v.y + v.h, v.x, v.y + v.h + 26);
        rg.addColorStop(0, `rgba(0,153,255,${0.25 * fl})`);
        rg.addColorStop(1, 'rgba(0,153,255,0)');
        ctx.fillStyle = rg;
        ctx.fillRect(v.x - 4, v.y + v.h, v.w + 8, 26);
      }
      // shadow
      ctx.fillStyle = 'rgba(0,0,0,0.45)';
      ctx.fillRect(v.x + 3, v.y + 4, v.w, v.h);

      if (v.type === 'rickshaw') {
        // yellow-black autorickshaw
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(v.x, v.y + v.h - 8, v.w, 8); // tires
        // body yellow
        ctx.fillStyle = '#FFB703';
        ctx.beginPath();
        ctx.moveTo(v.x + 2, v.y + 24);
        ctx.lineTo(v.x + v.w - 2, v.y + 24);
        ctx.lineTo(v.x + v.w - 4, v.y + v.h - 4);
        ctx.lineTo(v.x + 4, v.y + v.h - 4);
        ctx.closePath();
        ctx.fill();
        // black canopy
        ctx.fillStyle = '#0B1525';
        ctx.beginPath();
        ctx.moveTo(v.x + 4, v.y + 22);
        ctx.lineTo(v.x + v.w / 2, v.y);
        ctx.lineTo(v.x + v.w - 4, v.y + 22);
        ctx.closePath();
        ctx.fill();
        // windshield
        ctx.fillStyle = 'rgba(120,180,220,0.5)';
        ctx.fillRect(v.x + 8, v.y + 8, v.w - 16, 12);
        // headlight
        ctx.fillStyle = `rgba(255,240,180,${0.7 + 0.3 * Math.sin(t * 4)})`;
        ctx.beginPath(); ctx.arc(v.x + v.w / 2, v.y + v.h - 8, 2.5, 0, Math.PI * 2); ctx.fill();
        // yellow-black stripe
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(v.x + 2, v.y + v.h - 14, v.w - 4, 4);
      } else if (v.type === 'bus') {
        // BEST-style red bus
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(v.x, v.y + v.h - 8, v.w, 8);
        // body
        ctx.fillStyle = '#c1121f';
        ctx.fillRect(v.x, v.y, v.w, v.h - 4);
        // roof highlight
        ctx.fillStyle = '#e0213a';
        ctx.fillRect(v.x, v.y, v.w, 6);
        // windows row
        for (let i = 0; i < 4; i++) {
          ctx.fillStyle = 'rgba(140,200,230,0.55)';
          ctx.fillRect(v.x + 6 + i * 20, v.y + 8, 16, 16);
          ctx.strokeStyle = '#0B1525';
          ctx.lineWidth = 1;
          ctx.strokeRect(v.x + 6 + i * 20, v.y + 8, 16, 16);
        }
        // yellow band
        ctx.fillStyle = '#FFB703';
        ctx.fillRect(v.x, v.y + 30, v.w, 6);
        // destination board
        ctx.fillStyle = '#0B1525';
        ctx.fillRect(v.x + v.w / 2 - 16, v.y + v.h - 18, 32, 12);
        ctx.fillStyle = '#FFB703';
        ctx.font = 'bold 8px Orbitron';
        ctx.textAlign = 'center';
        ctx.fillText('BEST', v.x + v.w / 2, v.y + v.h - 9);
        ctx.textAlign = 'left';
        // headlight glow
        ctx.fillStyle = `rgba(255,240,180,${0.6})`;
        const hg = ctx.createRadialGradient(v.x + v.w / 2, v.y + v.h, 2, v.x + v.w / 2, v.y + v.h, 30);
        hg.addColorStop(0, 'rgba(255,240,180,0.25)');
        hg.addColorStop(1, 'rgba(255,240,180,0)');
        ctx.fillStyle = hg;
        ctx.fillRect(v.x - 10, v.y + v.h - 20, v.w + 20, 40);
      } else {
        // car
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(v.x, v.y + v.h - 6, v.w, 6);
        ctx.fillStyle = '#3a4a5a';
        ctx.fillRect(v.x, v.y + 4, v.w, v.h - 8);
        // cabin
        ctx.fillStyle = '#243240';
        ctx.fillRect(v.x + 6, v.y + 14, v.w - 12, v.h - 30);
        ctx.fillStyle = 'rgba(140,200,230,0.5)';
        ctx.fillRect(v.x + 8, v.y + 16, v.w - 16, v.h - 34);
        // headlights
        ctx.fillStyle = `rgba(255,240,180,${0.6})`;
        ctx.fillRect(v.x + 3, v.y + v.h - 8, 6, 3);
        ctx.fillRect(v.x + v.w - 9, v.y + v.h - 8, 6, 3);
      }

      // flood water over vehicle lower portion
      if (fl > 0.35) {
        const waterLine = v.y + v.h * (1 - fl * 0.55);
        ctx.fillStyle = `rgba(0,90,150,${0.4 + fl * 0.3})`;
        ctx.fillRect(v.x - 2, waterLine, v.w + 4, v.y + v.h - waterLine + 4);
        // ripple at waterline
        ctx.strokeStyle = `rgba(0,243,255,${0.4 * fl})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(v.x - 4, waterLine + Math.sin(t * 4) * 2);
        ctx.lineTo(v.x + v.w + 4, waterLine + Math.sin(t * 4 + 1) * 2);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  renderPuddles(ctx: CanvasRenderingContext2D) {
    const fl = this.flood / 100;
    if (fl > 0.5) return; // puddles merge into flood
    const t = performance.now() / 1000;
    // a few static puddles that shimmer
    const puddles = [
      { x: 700, y: 690, w: 60, h: 30 }, { x: 1300, y: 1050, w: 80, h: 36 },
      { x: 1700, y: 1500, w: 50, h: 24 }, { x: 420, y: 1660, w: 70, h: 28 },
    ];
    for (const p of puddles) {
      ctx.fillStyle = `rgba(40,80,130,${0.3 + fl * 0.5})`;
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, p.w, p.h, 0, 0, Math.PI * 2);
      ctx.fill();
      // shimmer
      ctx.strokeStyle = `rgba(0,243,255,${0.15 + 0.1 * Math.sin(t * 3 + p.x)})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, p.w * 0.7, p.h * 0.7, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  renderSafeZone(ctx: CanvasRenderingContext2D) {
    const s = SAFE_ZONE;
    const t = performance.now();
    const pulse = 0.5 + 0.5 * Math.sin(t / 400);
    const cx = s.x + s.w / 2, cy = s.y + s.h / 2;

    // elevated platform shadow
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(s.x + 6, s.y + 8, s.w, s.h);

    // platform base with raised-edge gradient
    const pg = ctx.createLinearGradient(s.x, s.y, s.x, s.y + s.h);
    pg.addColorStop(0, '#16324a');
    pg.addColorStop(0.5, '#0e2236');
    pg.addColorStop(1, '#0a1a2a');
    ctx.fillStyle = pg;
    ctx.fillRect(s.x, s.y, s.w, s.h);

    // raised curb edge
    ctx.fillStyle = 'rgba(0,243,255,0.25)';
    ctx.fillRect(s.x, s.y, s.w, 4);
    ctx.fillRect(s.x, s.y + s.h - 4, s.w, 4);
    ctx.fillRect(s.x, s.y, 4, s.h);
    ctx.fillRect(s.x + s.w - 4, s.y, 4, s.h);

    // glowing perimeter
    ctx.strokeStyle = `rgba(0,243,255,${0.55 + pulse * 0.4})`;
    ctx.lineWidth = 3;
    ctx.strokeRect(s.x, s.y, s.w, s.h);
    ctx.shadowColor = '#00F3FF';
    ctx.shadowBlur = 28 * (0.6 + pulse * 0.6);
    ctx.strokeRect(s.x, s.y, s.w, s.h);
    ctx.shadowBlur = 0;

    // grid floor with perspective lines
    ctx.strokeStyle = 'rgba(0,243,255,0.2)';
    ctx.lineWidth = 1;
    for (let x = s.x; x < s.x + s.w; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, s.y); ctx.lineTo(x, s.y + s.h); ctx.stroke();
    }
    for (let y = s.y; y < s.y + s.h; y += 40) {
      ctx.beginPath(); ctx.moveTo(s.x, y); ctx.lineTo(s.x + s.w, y); ctx.stroke();
    }

    // central beacon radial glow
    const grad = ctx.createRadialGradient(cx, cy, 6, cx, cy, 120);
    grad.addColorStop(0, `rgba(0,243,255,${0.5 + pulse * 0.3})`);
    grad.addColorStop(0.5, `rgba(0,153,255,${0.2 + pulse * 0.15})`);
    grad.addColorStop(1, 'rgba(0,243,255,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(s.x - 20, s.y - 20, s.w + 40, s.h + 40);

    // rotating beacon beam
    const beamAng = t / 800;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(beamAng);
    const bg = ctx.createLinearGradient(0, 0, 160, 0);
    bg.addColorStop(0, 'rgba(0,243,255,0.5)');
    bg.addColorStop(1, 'rgba(0,243,255,0)');
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(160, -10);
    ctx.lineTo(160, 10);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(beamAng + Math.PI);
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(160, -10);
    ctx.lineTo(160, 10);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // beacon pillar
    ctx.fillStyle = `rgba(0,243,255,${0.7 + pulse * 0.3})`;
    ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI * 2); ctx.fill();
    ctx.shadowColor = '#00F3FF';
    ctx.shadowBlur = 20;
    ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;

    // SAFE ZONE sign banner at top
    ctx.fillStyle = 'rgba(7,17,31,0.85)';
    ctx.fillRect(s.x + 30, s.y + 10, s.w - 60, 26);
    ctx.strokeStyle = `rgba(0,243,255,${0.6 + pulse * 0.3})`;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(s.x + 30, s.y + 10, s.w - 60, 26);
    ctx.fillStyle = '#00F3FF';
    ctx.font = 'bold 16px Orbitron';
    ctx.textAlign = 'center';
    ctx.fillText('SAFE ZONE', cx, s.y + 28);

    // evacuation cross
    ctx.strokeStyle = `rgba(0,243,255,${0.8 + pulse * 0.2})`;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(cx - 16, cy + 30); ctx.lineTo(cx + 16, cy + 30);
    ctx.moveTo(cx, cy + 14); ctx.lineTo(cx, cy + 46);
    ctx.stroke();

    // rescue arrows pointing in at bottom
    ctx.strokeStyle = `rgba(16,185,129,${0.5 + pulse * 0.4})`;
    ctx.lineWidth = 3;
    for (let i = 0; i < 4; i++) {
      const ax = s.x + 30 + i * ((s.w - 60) / 3);
      const ay = s.y + s.h - 16;
      ctx.beginPath();
      ctx.moveTo(ax - 6, ay - 4);
      ctx.lineTo(ax, ay + 4);
      ctx.lineTo(ax + 6, ay - 4);
      ctx.stroke();
    }
    ctx.textAlign = 'left';

    // ambient rising particles
    if (Math.random() < 0.3) {
      this.particles.push({
        x: s.x + Math.random() * s.w, y: s.y + s.h - 6,
        vx: (Math.random() - 0.5) * 0.3, vy: -0.4 - Math.random() * 0.5,
        life: 1.5, maxLife: 1.5, color: 'rgba(0,243,255,0.6)', size: 2, kind: 'dot',
      });
    }
  }

  renderRouteMarkers(ctx: CanvasRenderingContext2D) {
    const t = performance.now();
    for (const m of ROUTE_MARKERS) {
      const blocked = (m.label === 'A' && this.routeABlocked) || (m.label === 'B' && this.routeBBlocked);
      const col = blocked ? '#FF0055' : m.color;
      const pulse = 0.5 + 0.5 * Math.sin(t / 400 + m.x);
      ctx.save();
      ctx.translate(m.x, m.y);
      // glowing disc
      ctx.shadowColor = col;
      ctx.shadowBlur = 14 * pulse;
      ctx.fillStyle = `${col}22`;
      ctx.beginPath(); ctx.arc(0, 0, 18, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = col;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(0, 0, 18, 0, Math.PI * 2); ctx.stroke();
      ctx.shadowBlur = 0;
      // inner ring
      ctx.strokeStyle = `${col}88`;
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(0, 0, 13, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = col;
      ctx.font = 'bold 16px Orbitron';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(m.label, 0, 1);
      // route name under
      ctx.font = 'bold 7px Orbitron';
      ctx.fillStyle = `${col}cc`;
      const name = m.label === 'A' ? 'HIGHWAY' : m.label === 'B' ? 'CAUSEWAY' : 'FLYOVER';
      ctx.fillText(name, 0, 28);
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.restore();
    }
  }

  renderBarriers(ctx: CanvasRenderingContext2D) {
    const t = performance.now();
    for (const bar of barriers) {
      const blocked = bar.id === 'A' ? this.routeABlocked : bar.id === 'B' ? this.routeBBlocked : false;
      const r = bar.rect;
      if (!blocked) {
        // faint route outline
        ctx.strokeStyle = bar.id === 'A' ? 'rgba(0,243,255,0.16)' : 'rgba(139,92,246,0.16)';
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 10]);
        ctx.strokeRect(r.x, r.y, r.w, r.h);
        ctx.setLineDash([]);
        continue;
      }
      const pulse = 0.5 + 0.5 * Math.sin(t / 200);

      // submerged road look
      const wg = ctx.createLinearGradient(r.x, r.y, r.x, r.y + r.h);
      wg.addColorStop(0, `rgba(0,90,160,${0.45 + pulse * 0.1})`);
      wg.addColorStop(1, `rgba(0,60,120,${0.55 + pulse * 0.1})`);
      ctx.fillStyle = wg;
      ctx.fillRect(r.x, r.y, r.w, r.h);

      // glowing red border
      ctx.strokeStyle = `rgba(255,0,85,${0.7 + pulse * 0.3})`;
      ctx.lineWidth = 4;
      ctx.strokeRect(r.x, r.y, r.w, r.h);
      ctx.shadowColor = '#FF0055';
      ctx.shadowBlur = 22;
      ctx.strokeRect(r.x, r.y, r.w, r.h);
      ctx.shadowBlur = 0;

      // barricade posts at edges
      ctx.fillStyle = '#FFB703';
      const posts = [r.x + 6, r.x + r.w - 14];
      for (const px of posts) {
        ctx.fillRect(px, r.y + 4, 8, r.h - 8);
        ctx.fillStyle = '#1a1a1a';
        for (let i = 0; i < r.h - 12; i += 8) ctx.fillRect(px, r.y + 6 + i, 8, 4);
        ctx.fillStyle = '#FFB703';
      }

      // hazard stripes diagonals
      ctx.strokeStyle = '#FFB703';
      ctx.lineWidth = 5;
      for (let i = -r.h; i < r.w; i += 26) {
        ctx.beginPath();
        ctx.moveTo(r.x + i, r.y);
        ctx.lineTo(r.x + i + r.h, r.y + r.h);
        ctx.stroke();
      }

      // water current swirls
      ctx.strokeStyle = `rgba(0,243,255,${0.4 + pulse * 0.2})`;
      ctx.lineWidth = 2;
      for (let i = 0; i < 8; i++) {
        const sx = r.x + 20 + (i * 50 + t * 0.05) % (r.w - 40);
        const sy = r.y + 20 + (i * 40) % (r.h - 40);
        ctx.beginPath();
        ctx.arc(sx, sy, 9, t / 300 + i, t / 300 + i + Math.PI * 1.4);
        ctx.stroke();
      }

      // floating debris in barrier
      ctx.fillStyle = 'rgba(80,60,40,0.6)';
      for (let i = 0; i < 4; i++) {
        const dx = r.x + 30 + ((i * 60 + t * 0.02) % (r.w - 60));
        const dy = r.y + r.h * 0.5 + Math.sin(t / 600 + i) * 10;
        ctx.save();
        ctx.translate(dx, dy);
        ctx.rotate(t / 800 + i);
        ctx.fillRect(-6, -3, 12, 6);
        ctx.restore();
      }

      // BLOCKED sign
      ctx.fillStyle = 'rgba(7,17,31,0.9)';
      ctx.fillRect(r.x + r.w / 2 - 50, r.y + r.h / 2 - 12, 100, 24);
      ctx.strokeStyle = `rgba(255,0,85,${0.8 + pulse * 0.2})`;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(r.x + r.w / 2 - 50, r.y + r.h / 2 - 12, 100, 24);
      ctx.fillStyle = '#FF0055';
      ctx.font = 'bold 13px Orbitron';
      ctx.textAlign = 'center';
      ctx.fillText('BLOCKED', r.x + r.w / 2, r.y + r.h / 2 + 4);
      ctx.textAlign = 'left';
    }
  }

  renderHazards(ctx: CanvasRenderingContext2D) {
    const t = performance.now();
    for (const h of hazards) {
      if (h.type === 'manhole') {
        // outer warning ring
        const pulse = 0.5 + 0.5 * Math.sin(t / 250);
        ctx.strokeStyle = `rgba(255,0,85,${0.3 + pulse * 0.3})`;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(h.x, h.y, h.r + 8, 0, Math.PI * 2); ctx.stroke();
        // hole
        const mg = ctx.createRadialGradient(h.x, h.y, 2, h.x, h.y, h.r);
        mg.addColorStop(0, '#000');
        mg.addColorStop(0.7, '#050a12');
        mg.addColorStop(1, '#0a1018');
        ctx.fillStyle = mg;
        ctx.beginPath(); ctx.arc(h.x, h.y, h.r, 0, Math.PI * 2); ctx.fill();
        // metal rim
        ctx.strokeStyle = '#5a6a7a';
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(h.x, h.y, h.r, 0, Math.PI * 2); ctx.stroke();
        // swirling water inside
        ctx.strokeStyle = `rgba(0,243,255,${0.4 + pulse * 0.3})`;
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.arc(h.x, h.y, h.r * (0.4 + i * 0.2), t / 300 + i, t / 300 + i + Math.PI * 1.5);
          ctx.stroke();
        }
        // grate bars
        ctx.strokeStyle = 'rgba(120,140,170,0.5)';
        ctx.lineWidth = 1.5;
        for (let i = -h.r + 4; i <= h.r - 4; i += 7) {
          ctx.beginPath();
          ctx.moveTo(h.x - Math.sqrt(h.r * h.r - i * i), h.y + i);
          ctx.lineTo(h.x + Math.sqrt(h.r * h.r - i * i), h.y + i);
          ctx.stroke();
        }
        // warning triangle above
        ctx.fillStyle = `rgba(255,183,3,${0.8 + pulse * 0.2})`;
        ctx.beginPath();
        ctx.moveTo(h.x, h.y - h.r - 12);
        ctx.lineTo(h.x - 8, h.y - h.r - 2);
        ctx.lineTo(h.x + 8, h.y - h.r - 2);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#1a1a1a';
        ctx.font = 'bold 10px Orbitron';
        ctx.textAlign = 'center';
        ctx.fillText('!', h.x, h.y - h.r - 3);
        ctx.textAlign = 'left';
        // ripple
        if (Math.random() < 0.1) this.spawnRipple(h.x, h.y, h.r + 6, 0.5, 'rgba(255,183,3,0.5)');
      } else if (h.type === 'electric') {
        const pulse = 0.5 + 0.5 * Math.sin(t / 80);
        // wooden pole
        ctx.fillStyle = '#2a2018';
        ctx.fillRect(h.x - 3, h.y - h.r - 30, 6, h.r + 30);
        // crossbar
        ctx.fillRect(h.x - 14, h.y - h.r - 28, 28, 4);
        // insulators
        ctx.fillStyle = '#6a5a4a';
        ctx.beginPath(); ctx.arc(h.x - 10, h.y - h.r - 24, 2.5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(h.x + 10, h.y - h.r - 24, 2.5, 0, Math.PI * 2); ctx.fill();
        // broken cable dangling into water
        ctx.strokeStyle = '#1a1a1a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(h.x + 10, h.y - h.r - 24);
        ctx.quadraticCurveTo(h.x + 14, h.y - h.r / 2, h.x + 4, h.y);
        ctx.stroke();
        // danger zone glow
        const eg = ctx.createRadialGradient(h.x, h.y, 4, h.x, h.y, h.r + 10);
        eg.addColorStop(0, `rgba(0,243,255,${0.3 + pulse * 0.35})`);
        eg.addColorStop(1, 'rgba(0,243,255,0)');
        ctx.fillStyle = eg;
        ctx.fillRect(h.x - h.r - 10, h.y - h.r - 10, h.r * 2 + 20, h.r * 2 + 20);
        // electrical arcs
        ctx.strokeStyle = `rgba(180,240,255,${0.5 + pulse * 0.5})`;
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 5; i++) {
          const a = Math.random() * Math.PI * 2;
          const len = 8 + Math.random() * 14;
          ctx.beginPath();
          ctx.moveTo(h.x, h.y);
          const segs = 3;
          let px = h.x, py = h.y;
          for (let s = 1; s <= segs; s++) {
            const f = s / segs;
            const jx = h.x + Math.cos(a) * len * f + (Math.random() - 0.5) * 6;
            const jy = h.y + Math.sin(a) * len * f + (Math.random() - 0.5) * 6;
            ctx.lineTo(jx, jy);
            px = jx; py = jy;
          }
          ctx.stroke();
        }
        // sparks
        if (Math.random() < 0.3) {
          const a = Math.random() * Math.PI * 2;
          this.particles.push({ x: h.x, y: h.y, vx: Math.cos(a) * 2, vy: Math.sin(a) * 2, life: 0.3, maxLife: 0.3, color: '#aef6ff', size: 1.5, kind: 'spark' });
        }
        // warning sign
        ctx.fillStyle = `rgba(255,183,3,${0.9})`;
        ctx.font = 'bold 12px Orbitron';
        ctx.textAlign = 'center';
        ctx.fillText('⚡', h.x, h.y + 5);
        ctx.textAlign = 'left';
      } else {
        // deep current — directional flow
        const dir = h.dir;
        // base pool
        const cg = ctx.createRadialGradient(h.x, h.y, 4, h.x, h.y, h.r + 10);
        cg.addColorStop(0, `rgba(0,153,255,0.35)`);
        cg.addColorStop(1, 'rgba(0,153,255,0)');
        ctx.fillStyle = cg;
        ctx.fillRect(h.x - h.r - 10, h.y - h.r - 10, h.r * 2 + 20, h.r * 2 + 20);
        // flowing arrows
        const tt = t / 200;
        ctx.strokeStyle = 'rgba(0,243,255,0.6)';
        ctx.lineWidth = 2.5;
        for (let i = 0; i < 10; i++) {
          const a = tt + i * 0.7;
          ctx.beginPath();
          ctx.arc(h.x, h.y, h.r * (0.4 + (i % 3) * 0.2), a, a + 0.6);
          ctx.stroke();
        }
        // directional indicator
        if (dir) {
          ctx.strokeStyle = 'rgba(0,243,255,0.5)';
          ctx.lineWidth = 2;
          for (let i = 0; i < 6; i++) {
            const fx = h.x + dir.x * (i * 12 - 30);
            const fy = h.y + dir.y * (i * 12 - 30);
            ctx.beginPath();
            ctx.moveTo(fx - dir.x * 4 + dir.y * 4, fy - dir.y * 4 - dir.x * 4);
            ctx.lineTo(fx + dir.x * 4, fy + dir.y * 4);
            ctx.lineTo(fx - dir.x * 4 - dir.y * 4, fy - dir.y * 4 + dir.x * 4);
            ctx.stroke();
          }
        }
        // floating debris caught in current
        for (let i = 0; i < 3; i++) {
          const ang = tt * 0.5 + i * 2;
          const dx = h.x + Math.cos(ang) * h.r * 0.6;
          const dy = h.y + Math.sin(ang) * h.r * 0.6;
          ctx.fillStyle = 'rgba(80,60,40,0.6)';
          ctx.save();
          ctx.translate(dx, dy);
          ctx.rotate(ang);
          ctx.fillRect(-4, -2, 8, 4);
          ctx.restore();
        }
      }
    }
  }

  renderFloatingDebris(ctx: CanvasRenderingContext2D) {
    const fl = this.flood / 100;
    if (fl < 0.3) return;
    for (const d of this.debris) {
      ctx.save();
      ctx.translate(d.x, d.y);
      ctx.rotate(d.rot);
      ctx.globalAlpha = d.alpha * Math.min(1, (fl - 0.25) * 2);
      ctx.fillStyle = '#3a2e22';
      if (d.kind === 0) {
        // plank
        ctx.fillRect(-d.size, -3, d.size * 2, 6);
        ctx.strokeStyle = 'rgba(0,0,0,0.4)';
        ctx.lineWidth = 1;
        ctx.strokeRect(-d.size, -3, d.size * 2, 6);
      } else if (d.kind === 1) {
        // crate
        ctx.fillRect(-d.size / 2, -d.size / 2, d.size, d.size);
        ctx.strokeStyle = 'rgba(0,0,0,0.4)';
        ctx.lineWidth = 1;
        ctx.strokeRect(-d.size / 2, -d.size / 2, d.size, d.size);
        ctx.beginPath();
        ctx.moveTo(-d.size / 2, -d.size / 2); ctx.lineTo(d.size / 2, d.size / 2);
        ctx.moveTo(d.size / 2, -d.size / 2); ctx.lineTo(-d.size / 2, d.size / 2);
        ctx.stroke();
      } else {
        // tire
        ctx.fillStyle = '#1a1a1a';
        ctx.beginPath(); ctx.arc(0, 0, d.size / 2, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#0a0a0a';
        ctx.beginPath(); ctx.arc(0, 0, d.size / 3, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }

  renderCivilians(ctx: CanvasRenderingContext2D) {
    const fl = this.flood / 100;
    const deep = fl >= 0.75;
    for (const c of this.civilians) {
      if (c.saved) continue;
      const d = Math.hypot(c.x - this.player.x, c.y - this.player.y);
      if (!c.rescued) {
        // pulsing marker beam + ring
        const pulse = 0.5 + 0.5 * Math.sin(performance.now() / 300 + c.id);
        const ringR = 24 + pulse * 8;
        ctx.fillStyle = `${c.color}22`;
        ctx.beginPath(); ctx.arc(c.x, c.y, ringR, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = `${c.color}aa`;
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(c.x, c.y, ringR, 0, Math.PI * 2); ctx.stroke();
        // vertical light beam
        const bg = ctx.createLinearGradient(c.x, c.y - 60, c.x, c.y);
        bg.addColorStop(0, `${c.color}00`);
        bg.addColorStop(1, `${c.color}55`);
        ctx.fillStyle = bg;
        ctx.fillRect(c.x - 3, c.y - 60, 6, 60);

        if (d < RESCUE.radius) {
          // polished interaction prompt bubble
          this.drawPrompt(ctx, c.x, c.y - 34, '[E] RESCUE', '#00F3FF');
        } else if (d < RESCUE.radius * 1.6) {
          this.drawPrompt(ctx, c.x, c.y - 34, 'CIVILIAN', c.color);
        } else {
          // distant marker chevron
          ctx.fillStyle = c.color;
          ctx.font = 'bold 9px Orbitron';
          ctx.textAlign = 'center';
          const yo = Math.sin(performance.now() / 400 + c.id) * 2;
          ctx.fillText('▼', c.x, c.y - 28 + yo);
          ctx.textAlign = 'left';
        }
      }
      this.drawCharacter(ctx, c.x, c.y, c.color, deep, c.wadePhase, c.walkPhase, c.idlePhase, false, false, c.id);
      // rescued outline indicator
      if (c.rescued) {
        ctx.strokeStyle = `rgba(0,243,255,${0.5 + 0.3 * Math.sin(performance.now() / 300)})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(c.x, c.y, 16, 0, Math.PI * 2); ctx.stroke();
        // follow splash
        if (this.player.moving && this.flood > 50 && Math.random() < 0.08) {
          for (let i = 0; i < 2; i++) {
            this.particles.push({ x: c.x, y: c.y + 6, vx: (Math.random() - 0.5) * 1.5, vy: -0.8 - Math.random(), life: 0.4, maxLife: 0.4, color: 'rgba(150,220,255,0.7)', size: 1.5, gravity: 0.1, kind: 'splash' });
          }
        }
      }
    }
  }

  drawPrompt(ctx: CanvasRenderingContext2D, x: number, y: number, text: string, color: string) {
    ctx.font = 'bold 11px Orbitron';
    const w = ctx.measureText(text).width + 18;
    const h = 20;
    // bg
    ctx.fillStyle = 'rgba(7,17,31,0.85)';
    this.roundRect(ctx, x - w / 2, y - h, w, h, 5);
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    this.roundRect(ctx, x - w / 2, y - h, w, h, 5);
    ctx.stroke();
    // pointer
    ctx.fillStyle = 'rgba(7,17,31,0.85)';
    ctx.beginPath();
    ctx.moveTo(x - 5, y);
    ctx.lineTo(x + 5, y);
    ctx.lineTo(x, y + 6);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x - 5, y);
    ctx.lineTo(x, y + 6);
    ctx.lineTo(x + 5, y);
    ctx.stroke();
    // text
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y - h / 2 + 1);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
  }

  roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  renderPlayer(ctx: CanvasRenderingContext2D) {
    const fl = this.flood / 100;
    const deep = fl >= 0.75;
    // flashlight cone
    const fx = this.player.facing.x, fy = this.player.facing.y;
    const flen = 130;
    const ang = Math.atan2(fy, fx);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const grad = ctx.createRadialGradient(this.player.x, this.player.y, 6, this.player.x, this.player.y, flen);
    grad.addColorStop(0, 'rgba(0,243,255,0.4)');
    grad.addColorStop(0.5, 'rgba(0,153,255,0.15)');
    grad.addColorStop(1, 'rgba(0,243,255,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(this.player.x, this.player.y);
    ctx.arc(this.player.x, this.player.y, flen, ang - 0.5, ang + 0.5);
    ctx.closePath();
    ctx.fill();
    // bright core
    const grad2 = ctx.createRadialGradient(this.player.x, this.player.y, 2, this.player.x, this.player.y, 40);
    grad2.addColorStop(0, 'rgba(180,240,255,0.25)');
    grad2.addColorStop(1, 'rgba(0,243,255,0)');
    ctx.fillStyle = grad2;
    ctx.beginPath(); ctx.arc(this.player.x, this.player.y, 40, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    const flicker = this.player.invuln > 0 && Math.floor(performance.now() / 80) % 2 === 0;
    this.drawCharacter(ctx, this.player.x, this.player.y, '#00F3FF', deep, this.player.wadePhase, this.player.walkPhase, 0, true, flicker, 0);
  }

  drawCharacter(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, deep: boolean, wadePhase: number, walkPhase: number, idlePhase: number, isPlayer: boolean, flicker: boolean, civId: number) {
    if (flicker) return;
    const fl = this.flood / 100;
    const moving = isPlayer ? this.player.moving : (walkPhase > 0 && Math.sin(walkPhase) !== 0);
    const bob = deep ? Math.sin(wadePhase) * 3 : (moving ? Math.sin(walkPhase) * 2 : Math.sin(idlePhase) * 0.6);
    ctx.save();
    ctx.translate(x, y + bob);

    // shadow
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.beginPath(); ctx.ellipse(0, 9, 12, 5, 0, 0, Math.PI * 2); ctx.fill();

    // legs (hidden when deep)
    if (!deep) {
      const legSwing = moving ? Math.sin(walkPhase) * 4 : 0;
      ctx.fillStyle = isPlayer ? '#0a1a2a' : '#1a2230';
      ctx.fillRect(-6, 2, 4, 11 + legSwing);
      ctx.fillRect(2, 2, 4, 11 - legSwing);
      // boots
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(-7, 11 + legSwing, 6, 3);
      ctx.fillRect(1, 11 - legSwing, 6, 3);
    }

    // body / raincoat
    const bodyCol = isPlayer ? '#0a3a5a' : color;
    ctx.fillStyle = bodyCol;
    ctx.fillRect(-7, -9, 14, 15);
    // raincoat gradient overlay
    const cg = ctx.createLinearGradient(0, -9, 0, 6);
    cg.addColorStop(0, isPlayer ? 'rgba(0,243,255,0.35)' : `${color}55`);
    cg.addColorStop(1, 'rgba(0,0,0,0.2)');
    ctx.fillStyle = cg;
    ctx.fillRect(-7, -9, 14, 15);

    if (isPlayer) {
      // reflective stripes (rescue)
      ctx.fillStyle = '#FFB703';
      ctx.fillRect(-7, -3, 14, 2);
      ctx.fillRect(-7, 1, 14, 2);
      // backpack
      ctx.fillStyle = '#0a2a3a';
      ctx.fillRect(-8, -7, 3, 11);
      ctx.fillStyle = '#00F3FF';
      ctx.fillRect(-7.5, -5, 2, 2);
    } else {
      // civilian clothing variations (6 distinct IDs)
      if (civId === 1) {
        // VENDOR (Local Market) - apron & basket
        ctx.fillStyle = '#c0392b';
        ctx.fillRect(-6, -4, 12, 8);
        ctx.fillStyle = '#8B5A2B';
        ctx.fillRect(5, -2, 4, 4);
      } else if (civId === 2) {
        // COMMUTER (Stalled BEST Bus) - white shirt & briefcase/shoulder bag
        ctx.fillStyle = '#2a4a6a';
        ctx.fillRect(-6, -5, 12, 9);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-2, -5, 4, 9);
        ctx.strokeStyle = '#1a1a1a';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(-6, -5); ctx.lineTo(6, 4); ctx.stroke();
      } else if (civId === 3) {
        // WORKER (Electrical Alley) - uniform shirt & black tie
        ctx.fillStyle = '#34495e';
        ctx.fillRect(-6, -5, 12, 9);
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(-1, -5, 2, 6);
      } else if (civId === 4) {
        // ELDERLY (Residential Lane) - white kurta and walking stick
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(-6, -6, 12, 10);
        ctx.strokeStyle = '#8B5A2B';
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(6, -6); ctx.lineTo(10, 11); ctx.stroke();
      } else if (civId === 5) {
        // STUDENT (Flooded Shop Area) - uniform with small school bag on back
        ctx.fillStyle = '#1e3799';
        ctx.fillRect(-6, -5, 12, 9);
        ctx.fillStyle = '#fa983a';
        ctx.fillRect(-8, -4, 3, 7);
      } else {
        // SHOPKEEPER (Narrow Side Street) - dhoti & green vest
        ctx.fillStyle = '#27ae60';
        ctx.fillRect(-6, -5, 12, 5);
        ctx.fillStyle = '#f1f2f6';
        ctx.fillRect(-6, 0, 12, 5);
      }
    }

    // arms
    ctx.fillStyle = isPlayer ? '#0a2a3a' : bodyCol;
    const armSwing = moving ? Math.sin(walkPhase) * 2 : 0;
    ctx.fillRect(-9, -7, 3, 8 + armSwing);
    ctx.fillRect(6, -7, 3, 8 - armSwing);

    // head
    ctx.fillStyle = '#e0b48c';
    ctx.beginPath(); ctx.arc(0, -13, 6, 0, Math.PI * 2); ctx.fill();
    // hair
    ctx.fillStyle = civId === 4 ? '#d1d8e0' : '#1a1208'; // grey/white hair for elderly
    ctx.beginPath(); ctx.arc(0, -14, 6, Math.PI * 1.1, Math.PI * 1.9); ctx.fill();

    if (isPlayer) {
      // rescue helmet
      ctx.fillStyle = '#0099FF';
      ctx.beginPath(); ctx.arc(0, -14, 6.8, Math.PI, 0); ctx.fill();
      ctx.fillRect(-6.8, -14, 13.6, 2.5);
      // helmet light
      ctx.fillStyle = `rgba(0,243,255,${0.7 + 0.3 * Math.sin(performance.now() / 300)})`;
      ctx.beginPath(); ctx.arc(0, -18, 2, 0, Math.PI * 2); ctx.fill();
      // helmet glow
      ctx.shadowColor = '#00F3FF';
      ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.arc(0, -18, 2, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
    }

    // glow ring
    ctx.strokeStyle = `${color}55`;
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(0, 0, 14, 0, Math.PI * 2); ctx.stroke();

    // deep water: cover lower body
    if (deep) {
      ctx.fillStyle = `rgba(0,90,150,${0.5 + fl * 0.3})`;
      ctx.fillRect(-11, 2, 22, 12);
      // waterline shimmer
      ctx.strokeStyle = `rgba(0,243,255,${0.3 + fl * 0.2})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-11, 2 + Math.sin(wadePhase * 2) * 1);
      ctx.lineTo(11, 2 + Math.sin(wadePhase * 2 + 1) * 1);
      ctx.stroke();
    }
    ctx.restore();
  }

  renderWater(ctx: CanvasRenderingContext2D) {
    const fl = this.flood / 100;
    if (fl <= 0.05) return;
    const t = performance.now() / 1000;
    const vx = this.cam.x - 10, vy = this.cam.y - 10;
    const vw = window.innerWidth + 20, vh = window.innerHeight + 20;

    ctx.save();
    // base translucent water layer
    const wg = ctx.createLinearGradient(0, vy, 0, vy + vh);
    wg.addColorStop(0, `rgba(0,70,130,${fl * 0.4})`);
    wg.addColorStop(1, `rgba(0,50,100,${fl * 0.5})`);
    ctx.fillStyle = wg;
    ctx.fillRect(vx, vy, vw, vh);

    // animated wave layers (3 depths)
    for (let layer = 0; layer < 3; layer++) {
      const amp = (3 + layer * 2) * fl;
      const spacing = 50 - layer * 12;
      const alpha = (0.1 + layer * 0.06) * fl;
      ctx.strokeStyle = `rgba(0,243,255,${alpha})`;
      ctx.lineWidth = 1.5 - layer * 0.3;
      const yStart = Math.floor(vy / spacing) * spacing;
      for (let y = yStart; y < vy + vh + spacing; y += spacing) {
        ctx.beginPath();
        for (let x = vx - 60; x <= vx + vw + 60; x += 12) {
          const yy = y + Math.sin((x + t * (60 + layer * 30)) * 0.02 + layer) * amp;
          if (x === vx - 60) ctx.moveTo(x, yy); else ctx.lineTo(x, yy);
        }
        ctx.stroke();
      }
    }

    // moving highlights / shimmer
    if (fl > 0.3) {
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = `rgba(120,220,255,${(fl - 0.3) * 0.25})`;
      ctx.lineWidth = 1;
      for (let i = 0; i < 30; i++) {
        const sx = vx + ((i * 137 + t * 40) % vw);
        const sy = vy + ((i * 89 + t * 20) % vh);
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx + 6 + Math.sin(t + i) * 3, sy);
        ctx.stroke();
      }
      ctx.globalCompositeOperation = 'source-over';
    }

    // deep shimmer overlay
    if (fl > 0.5) {
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = `rgba(0,243,255,${(fl - 0.5) * 0.12})`;
      ctx.fillRect(vx, vy, vw, vh);
      ctx.globalCompositeOperation = 'source-over';
    }

    // edge blend near buildings (water lapping) — simple darkening at building bases done in renderBuildings
    ctx.restore();
  }

  renderRipples(ctx: CanvasRenderingContext2D) {
    for (const r of this.ripples) {
      const m = r.color.match(/rgba?\(([^)]+)\)/);
      let base = '0,243,255';
      if (m) base = m[1].split(',').slice(0, 3).join(',').trim();
      ctx.strokeStyle = `rgba(${base},${Math.max(0, r.alpha)})`;
      ctx.lineWidth = r.width;
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
      ctx.stroke();
      // inner faint ring
      if (r.r > 8) {
        ctx.strokeStyle = `rgba(${base},${Math.max(0, r.alpha * 0.5)})`;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.r * 0.6, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  }

  renderParticles(ctx: CanvasRenderingContext2D) {
    for (const p of this.particles) {
      const a = Math.max(0, p.life / p.maxLife);
      ctx.globalAlpha = a;
      if (p.kind === 'spark') {
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        ctx.shadowBlur = 0;
      } else if (p.kind === 'splash') {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      }
    }
    ctx.globalAlpha = 1;
  }

  renderFloats(ctx: CanvasRenderingContext2D) {
    for (const f of this.floats) {
      ctx.globalAlpha = Math.min(1, f.life);
      ctx.fillStyle = 'rgba(7,17,31,0.7)';
      ctx.font = 'bold 13px Orbitron';
      const w = ctx.measureText(f.text).width + 10;
      ctx.fillRect(f.x - w / 2, f.y - 12, w, 16);
      ctx.fillStyle = f.color;
      ctx.textAlign = 'center';
      ctx.fillText(f.text, f.x, f.y);
      ctx.textAlign = 'left';
    }
    ctx.globalAlpha = 1;
  }

  renderRain(ctx: CanvasRenderingContext2D) {
    const intensity = 1 + this.flood / 100;
    for (const d of this.rain) {
      ctx.globalAlpha = d.alpha;
      ctx.strokeStyle = d.layer ? 'rgba(170,210,255,0.6)' : 'rgba(150,190,230,0.4)';
      ctx.lineWidth = d.layer ? 1.2 : 0.8;
      ctx.beginPath();
      ctx.moveTo(d.x, d.y);
      ctx.lineTo(d.x - d.slant * intensity, d.y + d.len);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  renderLightningScene(ctx: CanvasRenderingContext2D) {
    if (this.lightning <= 0) return;
    // illuminate the whole scene
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = `rgba(150,190,235,${this.lightning * 0.18})`;
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
    ctx.globalCompositeOperation = 'source-over';
  }

  renderLightningBolt(ctx: CanvasRenderingContext2D) {
    if (!this.lightningBolt) return;
    const b = this.lightningBolt;
    const a = Math.min(1, b.life * 3);
    ctx.strokeStyle = `rgba(200,225,255,${a})`;
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#bcd5ff';
    ctx.shadowBlur = 16;
    ctx.beginPath();
    for (let i = 0; i < b.pts.length; i++) {
      if (i === 0) ctx.moveTo(b.pts[i].x, b.pts[i].y);
      else ctx.lineTo(b.pts[i].x, b.pts[i].y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
    // bright core
    ctx.strokeStyle = `rgba(255,255,255,${a * 0.8})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < b.pts.length; i++) {
      if (i === 0) ctx.moveTo(b.pts[i].x, b.pts[i].y);
      else ctx.lineTo(b.pts[i].x, b.pts[i].y);
    }
    ctx.stroke();
  }

  renderFog(ctx: CanvasRenderingContext2D) {
    const fl = this.flood / 100;
    if (fl > 0.4) {
      const fg = ctx.createLinearGradient(0, 0, 0, window.innerHeight);
      fg.addColorStop(0, `rgba(120,150,180,${(fl - 0.4) * 0.1})`);
      fg.addColorStop(0.5, `rgba(120,150,180,${(fl - 0.4) * 0.05})`);
      fg.addColorStop(1, `rgba(120,150,180,${(fl - 0.4) * 0.08})`);
      ctx.fillStyle = fg;
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
    }
    // moving fog wisps at high flood
    if (fl > 0.6) {
      const t = performance.now() / 2000;
      ctx.globalAlpha = (fl - 0.6) * 0.3;
      ctx.fillStyle = 'rgba(160,180,200,0.15)';
      for (let i = 0; i < 4; i++) {
        const fx = ((t * 30 + i * 400) % (window.innerWidth + 400)) - 200;
        const fy = window.innerHeight * (0.3 + i * 0.15);
        ctx.fillRect(fx, fy, 300, 40);
      }
      ctx.globalAlpha = 1;
    }
  }

  renderVignette(ctx: CanvasRenderingContext2D) {
    const grad = ctx.createRadialGradient(
      window.innerWidth / 2, window.innerHeight / 2, window.innerHeight * 0.28,
      window.innerWidth / 2, window.innerHeight / 2, window.innerHeight * 0.78
    );
    grad.addColorStop(0, 'rgba(7,17,31,0)');
    grad.addColorStop(1, `rgba(7,17,31,${this.vignetteAlpha})`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
  }
}
