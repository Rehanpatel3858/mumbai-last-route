import Phaser from 'phaser';

export type HazardType = 'MANHOLE' | 'ELECTRICAL' | 'DEBRIS';

export class Hazard extends Phaser.Physics.Arcade.Sprite {
  public hazardType: HazardType;
  public isActiveState: boolean = true;

  constructor(scene: Phaser.Scene, x: number, y: number, type: HazardType) {
    let texture = 'manhole-pixel';
    if (type === 'ELECTRICAL') texture = 'electric-pixel';
    if (type === 'DEBRIS') texture = 'debris-pixel';

    super(scene, x, y, texture);
    this.hazardType = type;
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDepth(6);
  }
}
