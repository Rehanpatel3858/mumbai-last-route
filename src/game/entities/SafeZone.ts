import Phaser from 'phaser';

export class SafeZone extends Phaser.GameObjects.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'safezone-pixel');
    scene.add.existing(this);
    this.setDepth(5);

    // Flashing green beacon tween
    scene.tweens.add({
      targets: this,
      scale: { from: 0.96, to: 1.06 },
      alpha: { from: 0.85, to: 1.0 },
      duration: 1000,
      yoyo: true,
      repeat: -1,
    });
  }
}
