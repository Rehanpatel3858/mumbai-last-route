import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Civilian } from '../entities/Civilian';
import { Hazard } from '../entities/Hazard';
import { SafeZone } from '../entities/SafeZone';
import { Door } from '../entities/Door';
import { FLOOD_PHASES, type FloodPhase, getPhaseForTime } from '../systems/FloodSystem';
import { type ScoreBreakdown, calculateScore } from '../systems/ScoreSystem';
import { soundSynth } from '../utils/SoundSynth';
import { MapGenerator } from '../systems/MapGenerator';

export interface GameBridgeEvents {
  onTimeUpdate: (seconds: number) => void;
  onPhaseUpdate: (phase: FloodPhase) => void;
  onCiviliansUpdate: (rescued: number, total: number) => void;
  onAlert: (sender: string, title: string, msg: string, severity: 'INFO' | 'WARNING' | 'CRITICAL') => void;
  onGameOver: (victory: boolean, score: ScoreBreakdown) => void;
  onToggleMap: (isOpen: boolean) => void;
  onMapUpdate: (data: any) => void;
}

export class MainGameScene extends Phaser.Scene {
  private eventsBridge!: GameBridgeEvents;

  private player!: Player;
  private civiliansGroup!: Phaser.GameObjects.Group;
  private hazardsGroup!: Phaser.Physics.Arcade.Group;
  private obstaclesGroup!: Phaser.Physics.Arcade.StaticGroup;
  private safeZoneObj!: SafeZone;
  private waterOverlayGraphics!: Phaser.GameObjects.Graphics;

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key; S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key; E: Phaser.Input.Keyboard.Key; M: Phaser.Input.Keyboard.Key; ESC: Phaser.Input.Keyboard.Key; };

  private totalDurationSeconds = 420;
  private timeRemainingSeconds = 420;
  private timerEvent!: Phaser.Time.TimerEvent;

  private currentPhaseIndex = 0;
  private totalCivilians = 10;
  private rescuedCivilians: Civilian[] = [];
  private hazardHits = 0;

  private isPaused = false;
  private isGameOver = false;

  private mapOpen = false;
  private mapUpdateTimer = 0;

  private doors: Door[] = [];

  private waterAnimTimer = 0;
  private waterFrame = 0;

  constructor() {
    super('MainGameScene');
  }

  public init(data: { eventsBridge: GameBridgeEvents }) {
    this.eventsBridge = data.eventsBridge;
  }

  public create() {
    // Large map for exploration
    const mapWidth = 3200;
    const mapHeight = 2400;
    this.physics.world.setBounds(0, 0, mapWidth, mapHeight);
    this.cameras.main.setBounds(0, 0, mapWidth, mapHeight);

    this.obstaclesGroup = this.physics.add.staticGroup();
    this.civiliansGroup = this.add.group();
    this.hazardsGroup = this.physics.add.group();

    this.safeZoneObj = MapGenerator.generate(
      this,
      mapWidth,
      mapHeight,
      this.obstaclesGroup,
      this.civiliansGroup,
      this.hazardsGroup,
      this.doors
    );

    // Spawn player alone in an empty street intersection
    this.player = new Player(this, 1600, 2000);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(1.8); // Much closer, pixel-art RPG style

    this.createRainEffect(mapWidth);

    this.waterOverlayGraphics = this.add.graphics();
    this.waterOverlayGraphics.setDepth(15);

    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.wasd = {
        W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
        E: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E),
        M: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M),
        ESC: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC),
      };
    }

    this.physics.add.collider(this.player, this.obstaclesGroup);
    this.physics.add.overlap(this.player, this.hazardsGroup, this.handleHazardOverlap, undefined, this);

    soundSynth.playRain();

    this.timerEvent = this.time.addEvent({ delay: 1000, callback: this.onSecondTick, callbackScope: this, loop: true });

    this.eventsBridge.onTimeUpdate(this.timeRemainingSeconds);
    this.eventsBridge.onPhaseUpdate(FLOOD_PHASES[0]);
    this.eventsBridge.onCiviliansUpdate(0, this.totalCivilians);

    this.eventsBridge.onAlert('COMMAND', 'MISSION START', 'You are alone. Search the streets to find and rescue stranded civilians before the flood rises.', 'INFO');
  }



  private createRainEffect(mapWidth: number) {
    const rainParticles = this.add.particles(0, 0, 'debris-pixel', {
      x: { min: 0, max: mapWidth },
      y: 0,
      lifespan: 1500,
      speedY: { min: 600, max: 1000 },
      speedX: { min: -150, max: -250 },
      scale: { start: 0.1, end: 0.02 },
      quantity: 12, // Heavy rain
      blendMode: 'ADD',
      tint: 0x94a3b8
    });
    rainParticles.setDepth(20);
  }

  private onSecondTick() {
    if (this.isPaused || this.isGameOver) return;

    this.timeRemainingSeconds--;
    this.eventsBridge.onTimeUpdate(this.timeRemainingSeconds);

    const elapsed = this.totalDurationSeconds - this.timeRemainingSeconds;
    const currentPhase = getPhaseForTime(elapsed);

    if (currentPhase.index !== this.currentPhaseIndex) {
      this.currentPhaseIndex = currentPhase.index;
      this.eventsBridge.onPhaseUpdate(currentPhase);
      soundSynth.playAlert();
    }

    if (this.timeRemainingSeconds <= 0) {
      this.finishGame(false);
    }
  }

  public update(time: number, delta: number) {
    if (this.isGameOver) return;

    if (Phaser.Input.Keyboard.JustDown(this.wasd.ESC)) {
      if (this.mapOpen) {
        this.mapOpen = false;
        this.eventsBridge.onToggleMap(this.mapOpen);
        return;
      }
      this.isPaused = !this.isPaused;
      if (this.isPaused) {
        this.physics.pause();
        this.timerEvent.paused = true;
      } else {
        this.physics.resume();
        this.timerEvent.paused = false;
      }
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.wasd.M)) {
      this.mapOpen = !this.mapOpen;
      this.eventsBridge.onToggleMap(this.mapOpen);
    }

    if (this.isPaused) return;

    // Door check
    let activeDoor: Door | null = null;
    for (const door of this.doors) {
      door.checkProximity(this.player);
      if (door.canEnter()) activeDoor = door;
    }

    if (activeDoor && Phaser.Input.Keyboard.JustDown(this.wasd.E)) {
      this.scene.pause();
      this.scene.launch('InteriorScene', { 
        type: activeDoor.destScene, 
        playerX: this.player.x, 
        playerY: this.player.y 
      });
      return;
    }
    if (this.mapOpen) {
      this.mapUpdateTimer += delta;
      if (this.mapUpdateTimer > 150) {
        this.mapUpdateTimer = 0;
        this.eventsBridge.onMapUpdate({
          player: { x: this.player.x, y: this.player.y },
          civilians: this.civiliansGroup.getChildren().map(c => ({ x: (c as Civilian).x, y: (c as Civilian).y, isRescued: (c as Civilian).isRescued })),
          hazards: this.hazardsGroup.getChildren().map(h => ({ x: (h as Hazard).x, y: (h as Hazard).y, type: (h as Hazard).hazardType })),
          safeZone: { x: this.safeZoneObj.x, y: this.safeZoneObj.y, width: 256, height: 256 },
          mapWidth: this.physics.world.bounds.width,
          mapHeight: this.physics.world.bounds.height
        });
      }
    }

    if (this.isPaused) return;

    const currentPhase = FLOOD_PHASES[this.currentPhaseIndex];
    this.player.updateControls(this.wasd, this.cursors, currentPhase.speedPenalty);

    // Water flooding overlay logic
    this.waterAnimTimer += delta;
    if (this.waterAnimTimer > 300) {
      this.waterAnimTimer = 0;
      this.waterFrame = (this.waterFrame + 1) % 4;
    }

    if (this.currentPhaseIndex > 0) {
      this.waterOverlayGraphics.clear();
      const floodHeight = (this.currentPhaseIndex / 4) * 0.5; // Up to 50% opacity
      this.waterOverlayGraphics.fillStyle(0x0c4a6e, floodHeight);
      
      // Flood Lowlands (Bottom Right)
      this.waterOverlayGraphics.fillRect(1200, 1600, this.physics.world.bounds.width - 1200, this.physics.world.bounds.height - 1600);
      
      // Flood Chawls (Bottom Left) but slightly less deep visually
      this.waterOverlayGraphics.fillStyle(0x0c4a6e, floodHeight * 0.7);
      this.waterOverlayGraphics.fillRect(0, 1200, 1200, this.physics.world.bounds.height - 1200);

      // Light puddles in Market
      this.waterOverlayGraphics.fillStyle(0x0c4a6e, floodHeight * 0.3);
      this.waterOverlayGraphics.fillRect(0, 0, 1200, 1200);
      
      // Moving water ripples based on waterAnimTimer
      const px = this.cameras.main.scrollX;
      const py = this.cameras.main.scrollY;
      this.waterOverlayGraphics.fillStyle(0x38bdf8, floodHeight + 0.1);
      
      for(let i=0; i<20; i++) {
        const rx = px + ((time/2 + i*200) % this.cameras.main.width);
        const ry = py + ((time/3 + i*150) % this.cameras.main.height);
        this.waterOverlayGraphics.fillRect(rx, ry, (i%2===0)? 16:32, 2);
      }
    }

    // Civilian Rescue logic
    const px = this.player.x;
    const py = this.player.y;

    if (Phaser.Input.Keyboard.JustDown(this.wasd.E)) {
      const closeCiv = this.civiliansGroup.getChildren().find((c) => {
        const civ = c as Civilian;
        return !civ.isRescued && Phaser.Math.Distance.Between(px, py, civ.x, civ.y) < 80;
      }) as Civilian | undefined;

      if (closeCiv) {
        closeCiv.rescue(this);
        this.rescuedCivilians.push(closeCiv);
        this.eventsBridge.onCiviliansUpdate(this.rescuedCivilians.length, this.totalCivilians);
        soundSynth.playRescue();
      }
    }

    // Follow logic for ALL rescued civilians - trailing behind player
    for (let i = 0; i < this.rescuedCivilians.length; i++) {
      const civ = this.rescuedCivilians[i];
      const targetIndex = (i + 1) * 20; // Distance apart
      if (this.player.positionHistory.length > targetIndex) {
        const targetPos = this.player.positionHistory[targetIndex];
        civ.updateFollowPosition(targetPos);
      } else {
        civ.updateFollowPosition({ x: this.player.x, y: this.player.y });
      }
    }

    // Check Safe Zone
    if (Phaser.Math.Distance.Between(px, py, this.safeZoneObj.x, this.safeZoneObj.y) < 100) {
      if (this.rescuedCivilians.length > 0) {
        this.finishGame(true);
      }
    }
  }

  private handleHazardOverlap(_player: any, hazardObj: any) {
    if (this.isGameOver) return;
    const h = hazardObj as Hazard;
    if (h.hazardType === 'MANHOLE') {
      this.finishGame(false);
    } else {
      this.hazardHits++;
      h.disableBody(true, true);
      soundSynth.playDamage();
    }
  }

  private finishGame(victory: boolean) {
    this.isGameOver = true;
    this.physics.pause();
    this.timerEvent.paused = true;
    
    const s = calculateScore(
      this.rescuedCivilians.length,
      this.totalCivilians,
      this.timeRemainingSeconds,
      this.player.health,
      this.hazardHits
    );
    this.eventsBridge.onGameOver(victory, s);
  }
}
