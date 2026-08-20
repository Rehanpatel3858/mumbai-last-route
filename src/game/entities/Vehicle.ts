import Phaser from 'phaser';

export type VehicleType = 'BUS' | 'RICKSHAW' | 'CAR';

export class Vehicle extends Phaser.Physics.Arcade.Sprite {
  public vehicleType: VehicleType;

  constructor(scene: Phaser.Scene, x: number, y: number, type: VehicleType) {
    const texture = type === 'BUS' ? 'bus-pixel' : 'rickshaw-pixel';
    super(scene, x, y, texture);
    this.vehicleType = type;

    scene.add.existing(this);
    scene.physics.add.existing(this, true); // static body
    this.setDepth(7);
  }
}
