import Phaser from 'phaser';

export type VehicleType = 'BUS' | 'RICKSHAW' | 'CAR' | 'TAXI' | 'SCOOTER';

export class Vehicle extends Phaser.Physics.Arcade.Sprite {
  public vehicleType: VehicleType;

  constructor(scene: Phaser.Scene, x: number, y: number, type: VehicleType) {
    let texture = 'car-pixel';
    if (type === 'BUS') texture = 'bus-detailed';
    else if (type === 'RICKSHAW') texture = 'auto-rickshaw';
    else if (type === 'TAXI') texture = 'taxi-pixel';
    else if (type === 'SCOOTER') texture = 'scooter-pixel';

    super(scene, x, y, texture);
    this.vehicleType = type;

    scene.add.existing(this);
    scene.physics.add.existing(this, true); // static body
    this.setDepth(7);
  }
}
