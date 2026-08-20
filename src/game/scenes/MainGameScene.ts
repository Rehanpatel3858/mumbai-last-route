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
  onHealthUpdate: (health: number) => void;
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
  private wasd!: { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key; S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key; E: Phaser.Input.Keyboard.Key; F: Phaser.Input.Keyboard.Key; M: Phaser.Input.Keyboard.Key; ESC: Phaser.Input.Keyboard.Key; ENTER: Phaser.Input.Keyboard.Key; };

  private totalDurationSeconds = 330;
  private timeRemainingSeconds = 330;
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
  
  private vehiclesGroup!: Phaser.Physics.Arcade.StaticGroup;

  private isMobile = false;
  private joystickBase!: Phaser.GameObjects.Graphics;
  private joystickKnob!: Phaser.GameObjects.Graphics;
  private joystickActive = false;
  private joystickVector = new Phaser.Math.Vector2(0, 0);

  private floodWater!: Phaser.GameObjects.TileSprite;

  constructor() {
    super('MainGameScene');
  }

  public init(data: { eventsBridge: GameBridgeEvents }) {
    this.eventsBridge = data.eventsBridge;
    this.timeRemainingSeconds = 330;
    this.isGameOver = false;
    this.isPaused = false;
    this.rescuedCivilians = [];
    this.hazardHits = 0;
    this.currentPhaseIndex = 0;
    this.doors = [];
    this.mapOpen = false;
    // Clear old physics state if restarting
    if (this.physics.world) {
      this.physics.resume();
    }
  }

  public create() {
    // Large map for exploration
    const mapWidth = 3200;
    const mapHeight = 2400;
    this.physics.world.setBounds(0, 0, mapWidth, mapHeight);
    this.cameras.main.setBounds(0, 0, mapWidth, mapHeight);

    this.obstaclesGroup = this.physics.add.staticGroup();
    this.vehiclesGroup = this.physics.add.staticGroup();
    this.civiliansGroup = this.add.group();
    this.hazardsGroup = this.physics.add.group();

    this.safeZoneObj = MapGenerator.generate(
      this,
      mapWidth,
      mapHeight,
      this.obstaclesGroup,
      this.civiliansGroup,
      this.hazardsGroup,
      this.doors,
      this.vehiclesGroup
    );

    // Spawn player alone in an empty street intersection
    this.player = new Player(this, 1600, 2000);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(1.8); // Much closer, pixel-art RPG style

    this.createRainEffect(mapWidth);

    // Dynamic Physical Flood Water Layer
    this.floodWater = this.add.tileSprite(0, 0, mapWidth, mapHeight, 'water-anim');
    this.floodWater.setOrigin(0, 0);
    this.floodWater.setDepth(1); // Above roads (0), below player (10) and buildings (15)
    this.floodWater.setAlpha(0);
    this.floodWater.setBlendMode(Phaser.BlendModes.SCREEN);

    this.waterOverlayGraphics = this.add.graphics();
    this.waterOverlayGraphics.setDepth(20); // Above ground, below UI

    // Stormy Darkness Overlay (Fixed to not crush world visibility)
    const darkness = this.add.rectangle(0, 0, mapWidth, mapHeight, 0x0f172a, 0.7);
    darkness.setOrigin(0, 0);
    darkness.setDepth(22);
    darkness.setBlendMode(Phaser.BlendModes.NORMAL);

    if (this.input.keyboard) {
      // Remove old listener if any
      this.input.keyboard.removeAllKeys();
      this.cursors = this.input.keyboard.createCursorKeys();
      this.wasd = {
        W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
        E: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E),
        F: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F),
        M: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M),
        ESC: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC),
        ENTER: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER),
      };
    }

    this.isMobile = this.sys.game.device.os.android || this.sys.game.device.os.iOS || this.sys.game.device.os.iPad || this.sys.game.device.os.windowsPhone;
    if (this.isMobile) {
      this.input.addPointer(2);
      this.joystickBase = this.add.graphics().setScrollFactor(0).setDepth(100);
      this.joystickBase.fillStyle(0x000000, 0.4);
      this.joystickBase.fillCircle(100, this.cameras.main.height - 100, 60);

      this.joystickKnob = this.add.graphics().setScrollFactor(0).setDepth(101);
      this.joystickKnob.fillStyle(0x38bdf8, 0.8);
      this.joystickKnob.fillCircle(100, this.cameras.main.height - 100, 30);

      this.input.on('pointerdown', this.handleJoystick, this);
      this.input.on('pointermove', this.handleJoystick, this);
      this.input.on('pointerup', this.handleJoystickEnd, this);
    }

    // Player Collision
    this.physics.add.collider(this.player, this.obstaclesGroup);
    this.physics.add.collider(this.player, this.vehiclesGroup);
    this.physics.add.overlap(this.player, this.hazardsGroup, this.handleHazardOverlap, undefined, this);

    soundSynth.playRain();

    this.timerEvent = this.time.addEvent({ delay: 1000, callback: this.onSecondTick, callbackScope: this, loop: true });

    this.eventsBridge.onTimeUpdate(this.timeRemainingSeconds);
    this.eventsBridge.onPhaseUpdate(FLOOD_PHASES[0]);
    this.eventsBridge.onCiviliansUpdate(0, this.totalCivilians);

    this.eventsBridge.onAlert('COMMAND', 'MISSION START', 'You are alone. Search the streets to find and rescue stranded civilians before the flood rises.', 'INFO');

    this.scheduleNextLightning();

    // Mobile Action Listeners
    window.addEventListener('mobile-action-rescue', this.handleMobileRescue.bind(this));
    window.addEventListener('mobile-action-enter', this.handleMobileEnter.bind(this));
    window.addEventListener('mobile-action-map', this.handleMobileMap.bind(this));
    window.addEventListener('mobile-action-pause', this.handleMobilePause.bind(this));
    this.events.on('destroy', () => {
      window.removeEventListener('mobile-action-rescue', this.handleMobileRescue.bind(this));
      window.removeEventListener('mobile-action-enter', this.handleMobileEnter.bind(this));
      window.removeEventListener('mobile-action-map', this.handleMobileMap.bind(this));
      window.removeEventListener('mobile-action-pause', this.handleMobilePause.bind(this));
    });
  }

  private handleMobilePause = () => {
    if (this.isGameOver) return;
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
  };

  private handleMobileMap = () => {
    if (this.isGameOver || this.isPaused) return;
    this.mapOpen = !this.mapOpen;
    this.eventsBridge.onToggleMap(this.mapOpen);
  };

  private handleMobileRescue = () => {
    if (this.isGameOver || this.isPaused) return;
    // We simulate the E key logic by doing the proximity check here
    const px = this.player.x;
    const py = this.player.y;
    let closestCivilian: Civilian | null = null;
    let minCivDist = 80;

    for (const c of this.civiliansGroup.getChildren()) {
      const civ = c as Civilian;
      if (!civ.isRescued) {
        const d = Phaser.Math.Distance.Between(px, py, civ.x, civ.y);
        if (d < minCivDist) {
          minCivDist = d;
          closestCivilian = civ;
        }
      }
    }

    if (closestCivilian) {
      closestCivilian.rescue(this);
      this.rescuedCivilians.push(closestCivilian);
      this.eventsBridge.onCiviliansUpdate(this.rescuedCivilians.length, this.totalCivilians);
      soundSynth.playRescue();
    }
  };

  private handleMobileEnter = () => {
    if (this.isGameOver || this.isPaused) return;
    const px = this.player.x;
    const py = this.player.y;
    let closestDoor: Door | null = null;
    let minDoorDist = 60;

    for (const d of this.doors) {
      const dist = Phaser.Math.Distance.Between(px, py, d.x, d.y);
      if (dist < minDoorDist) {
        minDoorDist = dist;
        closestDoor = d;
      }
    }

    if (closestDoor) {
      this.scene.pause();
      this.scene.launch('InteriorScene', { 
        type: closestDoor.destScene, 
        playerX: px, 
        playerY: py 
      });
    }
  };

  private handleJoystick(pointer: Phaser.Input.Pointer) {
    if (!this.isMobile) return;
    if (pointer.x < this.cameras.main.width / 2) {
      if (pointer.isDown) {
        this.joystickActive = true;
        const centerX = 100;
        const centerY = this.cameras.main.height - 100;
        const distance = Phaser.Math.Distance.Between(centerX, centerY, pointer.x, pointer.y);
        const angle = Phaser.Math.Angle.Between(centerX, centerY, pointer.x, pointer.y);
        
        const maxDist = 60;
        const knobDist = Math.min(distance, maxDist);
        
        this.joystickKnob.clear();
        this.joystickKnob.fillStyle(0x38bdf8, 0.8);
        this.joystickKnob.fillCircle(centerX + Math.cos(angle) * knobDist, centerY + Math.sin(angle) * knobDist, 30);

        this.joystickVector.set(Math.cos(angle), Math.sin(angle));
        if (distance < 10) this.joystickVector.set(0, 0);
      }
    }
  }

  private handleJoystickEnd(pointer: Phaser.Input.Pointer) {
    if (!this.isMobile) return;
    if (pointer.x < this.cameras.main.width / 2) {
      this.joystickActive = false;
      this.joystickVector.set(0, 0);
      this.joystickKnob.clear();
      this.joystickKnob.fillStyle(0x38bdf8, 0.8);
      this.joystickKnob.fillCircle(100, this.cameras.main.height - 100, 30);
    }
  }

  private createRainEffect(mapWidth: number) {
    const mapHeight = 2400;

    // Fast moving rain streaks
    const rainParticles = this.add.particles(0, 0, 'debris-pixel', {
      x: { min: 0, max: mapWidth },
      y: { min: 0, max: mapHeight },
      quantity: 12,
      lifespan: 600,
      speedY: { min: 800, max: 1200 },
      speedX: { min: -100, max: -200 },
      scale: { start: 0.8, end: 0.2 },
      alpha: { start: 0.6, end: 0 },
      tint: 0x94a3b8,
      blendMode: 'ADD'
    });
    rainParticles.setDepth(20);

    // Water Splash Ripples (Rain hitting the flood water)
    const splashParticles = this.add.particles(0, 0, 'debris-pixel', {
      x: { min: 0, max: mapWidth },
      y: { min: 0, max: mapHeight },
      quantity: 6,
      lifespan: 300,
      scale: { start: 0.2, end: 1.5 },
      alpha: { start: 0.4, end: 0 },
      tint: 0x38bdf8,
      blendMode: 'ADD'
    });
    splashParticles.setDepth(2); // Just above the water
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

  private scheduleNextLightning() {
    if (this.isGameOver) return;
    const delay = Phaser.Math.Between(35000, 40000);
    this.time.addEvent({
      delay,
      callback: this.triggerLightning,
      callbackScope: this
    });
  }

  private triggerLightning() {
    if (this.isGameOver) return;
    
    if (!this.isPaused) {
      // 1. Flash Camera
      this.cameras.main.flash(200, 230, 240, 255);
      
      // 2. Play Thunder Sound with short delay
      this.time.delayedCall(Phaser.Math.Between(200, 600), () => {
        soundSynth.playThunder();
      });
    }

    // Schedule the next one
    this.scheduleNextLightning();
  }

  public update(_time: number, delta: number) {
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

    // --- Interaction Priority Check ---
    const px = this.player.x;
    const py = this.player.y;

    let closestCivilian: Civilian | null = null;
    let minCivDist = 80;

    for (const c of this.civiliansGroup.getChildren()) {
      const civ = c as Civilian;
      if (!civ.isRescued) {
        const d = Phaser.Math.Distance.Between(px, py, civ.x, civ.y);
        if (d < minCivDist) {
          minCivDist = d;
          closestCivilian = civ;
        }
      }
    }

    let closestDoor: Door | null = null;
    let minDoorDist = 60;

    for (const d of this.doors) {
      d.checkProximity(this.player); // updates its internal state and prompt, wait we need to hide them if they aren't the primary
      const dist = Phaser.Math.Distance.Between(px, py, d.x, d.y);
      if (dist < minDoorDist) {
        minDoorDist = dist;
        closestDoor = d;
      }
    }

    // Hide all prompts first
    for (const d of this.doors) d['promptText'].setVisible(false);
    for (const c of this.civiliansGroup.getChildren()) {
      const civ = c as Civilian;
      if (!civ.isRescued) civ.labelText.setText(civ.nameLabelStr);
    }

    let activeInteractable: 'CIVILIAN' | 'DOOR' | null = null;

    if (closestCivilian && closestDoor) {
      if (minCivDist <= minDoorDist) activeInteractable = 'CIVILIAN';
      else activeInteractable = 'DOOR';
    } else if (closestCivilian) {
      activeInteractable = 'CIVILIAN';
    } else if (closestDoor) {
      activeInteractable = 'DOOR';
    }

    if (activeInteractable === 'CIVILIAN' && closestCivilian) {
      closestCivilian.labelText.setText(`[E] RESCUE ${closestCivilian.nameLabelStr}`);
      if (Phaser.Input.Keyboard.JustDown(this.wasd.E)) {
        closestCivilian.rescue(this);
        this.rescuedCivilians.push(closestCivilian);
        this.eventsBridge.onCiviliansUpdate(this.rescuedCivilians.length, this.totalCivilians);
        soundSynth.playRescue();
      }
    } else if (activeInteractable === 'DOOR' && closestDoor) {
      closestDoor['promptText'].setVisible(true);
      if (Phaser.Input.Keyboard.JustDown(this.wasd.ENTER)) {
        this.scene.pause();
        this.scene.launch('InteriorScene', { 
          type: closestDoor.destScene, 
          playerX: px, 
          playerY: py 
        });
        return;
      }
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
          mapHeight: this.physics.world.bounds.height,
          geometry: MapGenerator.geometry,
          currentPhaseIndex: this.currentPhaseIndex
        });
      }
    }

    if (this.isPaused) return;

    const currentPhase = FLOOD_PHASES[this.currentPhaseIndex];
    this.player.updateControls(
      this.wasd, 
      this.cursors, 
      currentPhase.speedPenalty, 
      this.joystickActive ? this.joystickVector : undefined
    );

    // Dynamic Physical Flood Water Logic
    const floodPercentage = ((330 - this.timeRemainingSeconds) / 330);
    this.floodWater.setAlpha(floodPercentage * 0.95); // Fade in dynamically up to 95% opacity
    this.floodWater.tilePositionX -= 1; // Directional flow
    this.floodWater.tilePositionY += 0.5;

    // Vehicle Submergence Overlay
    this.waterOverlayGraphics.clear();
    if (this.currentPhaseIndex > 0) {
      const submergeRatio = this.currentPhaseIndex * 0.15; // 0.15 to 0.6
      this.waterOverlayGraphics.fillStyle(0x082f49, floodPercentage * 0.8 + 0.2);
      for (const child of this.children.list) {
        if (child.constructor.name === 'Vehicle') {
          const v = child as Phaser.GameObjects.Sprite;
          const vBottom = v.y + v.displayHeight/2;
          const subHeight = v.displayHeight * submergeRatio;
          this.waterOverlayGraphics.fillRect(v.x - v.displayWidth/2, vBottom - subHeight, v.displayWidth, subHeight);
        }
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
      
      // Damage Logic
      this.player.health -= 20;
      this.eventsBridge.onHealthUpdate(this.player.health);
      
      // Screen Flash
      this.cameras.main.flash(300, 255, 0, 0);
      
      // Player Tint Flash
      this.player.setTint(0xff0000);
      this.time.delayedCall(200, () => {
        if (!this.isGameOver) this.player.clearTint();
      });

      if (this.player.health <= 0) {
        this.finishGame(false);
      }
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
