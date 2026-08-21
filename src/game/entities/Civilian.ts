import Phaser from 'phaser';

export type CivilianType = 'NORMAL' | 'ELDERLY' | 'INJURED' | 'CHILD';

export class Civilian extends Phaser.Physics.Arcade.Sprite {
  public civilianType: CivilianType;
  public isRescued: boolean = false;
  public labelText: Phaser.GameObjects.Text;
  public nameLabelStr: string;

  constructor(scene: Phaser.Scene, x: number, y: number, type: CivilianType, nameLabel: string) {
    let textureKey = 'civilian-normal';
    if (type === 'ELDERLY') textureKey = 'civilian-elderly';
    if (type === 'INJURED') textureKey = 'civilian-injured';
    if (type === 'CHILD') textureKey = 'civilian-child';

    super(scene, x, y, textureKey);
    this.civilianType = type;

    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDepth(8);

    // Label above head
    this.nameLabelStr = nameLabel;
    this.labelText = scene.add.text(x, y - 22, nameLabel, {
      fontSize: '11px',
      color: '#ff2a5f',
      backgroundColor: '#000000bb',
      padding: { x: 4, y: 2 },
    });
    this.labelText.setOrigin(0.5);
    this.labelText.setDepth(20);

    // Pulse animation before rescue
    scene.tweens.add({
      targets: this,
      scale: { from: 1.0, to: 1.15 },
      duration: 800,
      yoyo: true,
      repeat: -1,
    });
  }

  public rescue(scene: Phaser.Scene) {
    if (this.isRescued) return;
    this.isRescued = true;

    // Change label style to Green checkmark
    this.labelText.setText(`✓ RESCUED`);
    this.labelText.setColor('#00ff88');
    this.setAlpha(0.9);

    // Floating +100 SCORE score popup animation
    const popup = scene.add.text(this.x, this.y - 30, '+100 RESCUE', {
      fontFamily: 'sans-serif',
      fontSize: '13px',
      color: '#00f0ff',
      backgroundColor: '#000000ff',
      padding: { x: 6, y: 3 },
    });
    popup.setOrigin(0.5);
    popup.setDepth(30);

    scene.tweens.add({
      targets: popup,
      y: this.y - 70,
      alpha: 0,
      duration: 1200,
      onComplete: () => popup.destroy(),
    });
  }

  public updateFollowPosition(targetPos: { x: number; y: number }) {
    if (!this.isRescued) return;
    this.x = Phaser.Math.Linear(this.x, targetPos.x, 0.2);
    this.y = Phaser.Math.Linear(this.y, targetPos.y, 0.2);
    this.labelText.x = this.x;
    this.labelText.y = this.y - 22;
  }
}
