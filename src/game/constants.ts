export const C = {
  bg: '#07111F',
  bg2: '#0B1525',
  cyan: '#00F3FF',
  blue: '#0099FF',
  purple: '#8B5CF6',
  magenta: '#FF0055',
  warn: '#FFB703',
  success: '#10B981',
};

export const WORLD = {
  width: 3000,
  height: 1800,
};

export const PLAYER = {
  radius: 13,
  speed: 2.5,
  sprintSpeed: 4.2,
  maxStamina: 100,
  staminaDrain: 28, // per sec
  staminaRegen: 18, // per sec
  maxHealth: 100,
};

export const FLOOD = {
  durationSec: 300, // 5 minutes
  start: 10,
  step: 20,
  stepIntervalSec: 60,
};

export const RESCUE = {
  radius: 48,
  rescueKey: 'e',
};

export const SAFE_ZONE = {
  x: 2720,
  y: 180,
  w: 280,
  h: 200,
};

export const ROUTE_A_BLOCK_FLOOD = 50;
export const ROUTE_B_BLOCK_FLOOD = 90;

export type Vec = { x: number; y: number };
export type Rect = { x: number; y: number; w: number; h: number };

export type GameScreen = 'menu' | 'howto' | 'info' | 'settings' | 'levelselect' | 'playing' | 'won' | 'lost';

export interface PublicState {
  screen: GameScreen;
  health: number;
  stamina: number;
  rescued: number;
  saved: number;
  flood: number;
  timeLeft: number;
  objective: string;
  alert: string | null;
  routeABlocked: boolean;
  routeBBlocked: boolean;
  playerInSafe: boolean;
  paused: boolean;
  canRescue: boolean;
  canEnter: boolean;
}
