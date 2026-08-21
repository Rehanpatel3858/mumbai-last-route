import Phaser from 'phaser';

export type VehicleType = 'BUS' | 'RICKSHAW' | 'CAR' | 'TAXI' | 'SCOOTER';

export class Vehicle extends Phaser.Physics.Arcade.Sprite {
  public vehicleType: VehicleType;

  constructor(scene: Phaser.Scene, x: number, y: number, type: VehicleType) {
    let textureKey = 'car-pixel';
    if (type === 'BUS') textureKey = 'bus-detailed';
    if (type === 'RICKSHAW') textureKey = 'auto-rickshaw';
    if (type === 'TAXI') textureKey = 'taxi-pixel';
    if (type === 'SCOOTER') textureKey = 'scooter-pixel';

    super(scene, x, y, textureKey);
    this.vehicleType = type;

    scene.add.existing(this);
    scene.physics.add.existing(this, true); // static body
    this.setDepth(12);

    // Precise hitboxes for different vehicles
    const body = this.body as Phaser.Physics.Arcade.StaticBody;
    if (type === 'BUS') body.setSize(108, 30);
    if (type === 'RICKSHAW') body.setSize(36, 16);
    if (type === 'TAXI' || type === 'CAR') body.setSize(52, 20);
    if (type === 'SCOOTER') body.setSize(20, 10);
  }
}
