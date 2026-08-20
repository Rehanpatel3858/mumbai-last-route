import Phaser from 'phaser';

export class Player extends Phaser.Physics.Arcade.Sprite {
  public health: number = 100;
  public flashlightGraphics: Phaser.GameObjects.Graphics;
  public positionHistory: { x: number; y: number }[] = [];
  public currentDirection: 'down' | 'up' | 'left' | 'right' = 'down';

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player-pixel');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
    this.setDepth(10);
    this.body?.setSize(14, 14); // Very tight for narrow alleys
    this.setScale(1.2);

    this.flashlightGraphics = scene.add.graphics();
    this.flashlightGraphics.setDepth(23); // Above darkness
    this.flashlightGraphics.setBlendMode(Phaser.BlendModes.ADD);
  }

  public updateControls(
    wasd: {
      W: Phaser.Input.Keyboard.Key;
      A: Phaser.Input.Keyboard.Key;
      S: Phaser.Input.Keyboard.Key;
      D: Phaser.Input.Keyboard.Key;
    },
    cursors: Phaser.Types.Input.Keyboard.CursorKeys,
    speedMultiplier: number,
    joystickVector?: Phaser.Math.Vector2
  ) {
    let baseSpeed = 100 * speedMultiplier; // Reduced from 160 to 100
    let vx = 0;
    let vy = 0;

    if (joystickVector && (joystickVector.x !== 0 || joystickVector.y !== 0)) {
      vx = joystickVector.x;
      vy = joystickVector.y;
      
      if (Math.abs(vx) > Math.abs(vy)) {
        this.currentDirection = vx > 0 ? 'right' : 'left';
      } else {
        this.currentDirection = vy > 0 ? 'down' : 'up';
      }
    } else {
      if (wasd.A.isDown || cursors.left?.isDown) {
        vx -= 1;
        this.currentDirection = 'left';
      } else if (wasd.D.isDown || cursors.right?.isDown) {
        vx += 1;
        this.currentDirection = 'right';
      }

      if (wasd.W.isDown || cursors.up?.isDown) {
        vy -= 1;
        this.currentDirection = 'up';
      } else if (wasd.S.isDown || cursors.down?.isDown) {
        vy += 1;
        this.currentDirection = 'down';
      }
    }

    // Normalize diagonal movement
    if (vx !== 0 || vy !== 0) {
      const len = Math.sqrt(vx * vx + vy * vy);
      vx = (vx / len) * baseSpeed;
      vy = (vy / len) * baseSpeed;
    }

    this.setVelocity(vx, vy);

    if (vx !== 0 || vy !== 0) {
      this.anims.play(`player-walk-${this.currentDirection}`, true);
      this.positionHistory.unshift({ x: this.x, y: this.y });
      if (this.positionHistory.length > 600) {
        this.positionHistory.pop();
      }
    } else {
      this.anims.stop();
      // Set to idle frame for the current direction
      if (this.currentDirection === 'down') this.setFrame(0);
      else if (this.currentDirection === 'up') this.setFrame(1);
      else if (this.currentDirection === 'left') this.setFrame(2);
      else if (this.currentDirection === 'right') this.setFrame(3);
    }

    this.drawFlashlight();
  }

  private drawFlashlight() {
    this.flashlightGraphics.clear();
    const px = this.x;
    const py = this.y;

    let startAngle = Math.PI / 2 - 0.4;
    let endAngle = Math.PI / 2 + 0.4;

    if (this.currentDirection === 'up') {
      startAngle = -Math.PI / 2 - 0.4;
      endAngle = -Math.PI / 2 + 0.4;
    } else if (this.currentDirection === 'left') {
      startAngle = Math.PI - 0.4;
      endAngle = Math.PI + 0.4;
    } else if (this.currentDirection === 'right') {
      startAngle = -0.4;
      endAngle = 0.4;
    }

    this.flashlightGraphics.fillStyle(0x00f0ff, 0.14);
    this.flashlightGraphics.beginPath();
    this.flashlightGraphics.moveTo(px, py);
    this.flashlightGraphics.arc(px, py, 200, startAngle, endAngle, false);
    this.flashlightGraphics.closePath();
    this.flashlightGraphics.fill();
  }
}
