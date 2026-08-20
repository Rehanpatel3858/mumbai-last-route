import Phaser from 'phaser';
import { Vehicle } from '../entities/Vehicle';
import { Hazard } from '../entities/Hazard';
import { Civilian, type CivilianType } from '../entities/Civilian';
import { SafeZone } from '../entities/SafeZone';
import { Door } from '../entities/Door';

export class MapGenerator {
  public static generate(
    scene: Phaser.Scene,
    mapWidth: number,
    mapHeight: number,
    obstaclesGroup: Phaser.Physics.Arcade.StaticGroup,
    civiliansGroup: Phaser.GameObjects.Group,
    hazardsGroup: Phaser.Physics.Arcade.Group,
    doors: Door[]
  ): SafeZone {
    // Fill base with road texture
    for (let x = 0; x < mapWidth; x += 64) {
      for (let y = 0; y < mapHeight; y += 64) {
        scene.add.image(x + 32, y + 32, 'road-tile');
      }
    }

    // DISTRICT A: Hindmata Market (Dense shops, food carts) [Top Left: 0 to 1200, 0 to 1200]
    this.generateMarketDistrict(scene, 0, 0, 1200, 1200, obstaclesGroup, doors);

    // DISTRICT B: Chawl / Residential (Narrow lanes) [Bottom Left: 0 to 1200, 1200 to 2400]
    this.generateResidentialDistrict(scene, 0, 1200, 1200, 1200, obstaclesGroup, doors);

    // DISTRICT C: Railway Area [Top Right: 1200 to 3200, 0 to 800]
    this.generateRailwayDistrict(scene, 1200, 0, 2000, 800, obstaclesGroup);

    // DISTRICT D: Flyover & Main Road [Center Right: 1200 to 3200, 800 to 1600]
    this.generateMainRoad(scene, 1200, 800, 2000, 800, obstaclesGroup);

    // DISTRICT E: Flooded Lowlands [Bottom Right: 1200 to 3200, 1600 to 2400]
    this.generateLowlands(scene, 1200, 1600, 2000, 800, obstaclesGroup, doors);

    // Scatted Props globally
    for(let i=0; i<30; i++) {
      const b = scene.add.image(Math.random() * mapWidth, Math.random() * mapHeight, 'barricade');
      scene.physics.add.existing(b, true);
      obstaclesGroup.add(b);
    }

    // Vehicles
    for(let i=0; i<6; i++) new Vehicle(scene, 1200 + Math.random() * 2000, 800 + Math.random() * 800, 'BUS');
    for(let i=0; i<15; i++) new Vehicle(scene, Math.random() * mapWidth, Math.random() * mapHeight, 'RICKSHAW');
    for(let i=0; i<10; i++) new Vehicle(scene, Math.random() * mapWidth, Math.random() * mapHeight, 'TAXI');
    for(let i=0; i<15; i++) new Vehicle(scene, Math.random() * mapWidth, Math.random() * mapHeight, 'SCOOTER');

    // Hazards
    for(let i=0; i<12; i++) {
      const h = new Hazard(scene, Math.random() * mapWidth, Math.random() * mapHeight, 'MANHOLE');
      hazardsGroup.add(h);
    }
    for(let i=0; i<10; i++) {
      const h = new Hazard(scene, Math.random() * mapWidth, Math.random() * mapHeight, 'ELECTRICAL');
      hazardsGroup.add(h);
    }
    for(let i=0; i<15; i++) {
      const h = new Hazard(scene, Math.random() * mapWidth, Math.random() * mapHeight, 'DEBRIS');
      hazardsGroup.add(h);
    }

    // Safe Zone (Top Right corner near Railway)
    const safeZoneObj = new SafeZone(scene, 2800, 400);

    // Civilians
    const civSpawns = [
      { x: 300, y: 300, type: 'NORMAL', label: 'Shopkeeper' }, // Market
      { x: 800, y: 800, type: 'CHILD', label: 'Child' }, // Market
      { x: 400, y: 1600, type: 'ELDERLY', label: 'Resident' }, // Chawl
      { x: 800, y: 2000, type: 'NORMAL', label: 'Resident' }, // Chawl
      { x: 1800, y: 300, type: 'NORMAL', label: 'Commuter' }, // Railway
      { x: 2600, y: 500, type: 'INJURED', label: 'Commuter' }, // Railway
      { x: 1600, y: 1200, type: 'NORMAL', label: 'Driver' }, // Flyover
      { x: 2800, y: 1400, type: 'ELDERLY', label: 'Pedestrian' }, // Flyover
      { x: 1600, y: 2000, type: 'INJURED', label: 'Worker' }, // Lowlands
      { x: 2600, y: 2200, type: 'CHILD', label: 'Stranded Child' }, // Lowlands
    ];

    civSpawns.forEach((c) => {
      const civ = new Civilian(scene, c.x, c.y, c.type as CivilianType, c.label);
      civiliansGroup.add(civ);
    });

    return safeZoneObj;
  }

  private static generateMarketDistrict(scene: Phaser.Scene, startX: number, startY: number, width: number, height: number, obstaclesGroup: Phaser.Physics.Arcade.StaticGroup, doors: Door[]) {
    const blockSize = 200;
    const roadWidth = 100;
    for (let x = startX + roadWidth; x < startX + width; x += blockSize + roadWidth) {
      for (let y = startY + roadWidth; y < startY + height; y += blockSize + roadWidth) {
        const b = scene.add.image(x + 64, y + 64, 'building-shop');
        scene.physics.add.existing(b, true);
        obstaclesGroup.add(b);

        if (Math.random() > 0.6) {
          const door = new Door(scene, x + 64, y + 128, 40, 20, `shop-${x}-${y}`, 'SHOP');
          doors.push(door);
        }

        // Add street food carts on the edges
        if (Math.random() > 0.5) {
          const cart = scene.add.image(x - 20, y + 64, 'food-cart');
          scene.physics.add.existing(cart, true);
          obstaclesGroup.add(cart);
        }
      }
    }
  }

  private static generateResidentialDistrict(scene: Phaser.Scene, startX: number, startY: number, width: number, height: number, obstaclesGroup: Phaser.Physics.Arcade.StaticGroup, doors: Door[]) {
    // Chawls are long and dense with narrow passages
    const chawlWidth = 256;
    const chawlHeight = 128;
    const passage = 64; // Narrow lanes
    for (let y = startY + passage; y < startY + height - chawlHeight; y += chawlHeight + passage) {
      for (let x = startX + passage; x < startX + width - chawlWidth; x += chawlWidth + passage) {
        const b = scene.add.image(x + chawlWidth / 2, y + chawlHeight / 2, 'building-chawl');
        scene.physics.add.existing(b, true);
        obstaclesGroup.add(b);

        if (Math.random() > 0.5) {
          const door = new Door(scene, x + 128, y + chawlHeight, 40, 20, `chawl-${x}-${y}`, 'APARTMENT');
          doors.push(door);
        }

        // Scatter trash bins and street lights in lanes
        if (Math.random() > 0.3) {
          const light = scene.add.image(x - 20, y, 'street-light');
          scene.physics.add.existing(light, true);
          obstaclesGroup.add(light);
        }
      }
    }
  }

  private static generateRailwayDistrict(scene: Phaser.Scene, startX: number, startY: number, width: number, _height: number, obstaclesGroup: Phaser.Physics.Arcade.StaticGroup) {
    for (let x = startX; x < startX + width; x += 256) {
      const p = scene.add.image(x + 128, startY + 200, 'railway-platform');
      scene.physics.add.existing(p, true);
      obstaclesGroup.add(p);
      
      const p2 = scene.add.image(x + 128, startY + 500, 'railway-platform');
      scene.physics.add.existing(p2, true);
      obstaclesGroup.add(p2);
    }
  }

  private static generateMainRoad(scene: Phaser.Scene, startX: number, startY: number, width: number, height: number, obstaclesGroup: Phaser.Physics.Arcade.StaticGroup) {
    // Just a wide open area, we'll block the sides with buildings
    for (let x = startX; x < startX + width; x += 128) {
      const b1 = scene.add.image(x + 64, startY + 64, 'building-res');
      scene.physics.add.existing(b1, true);
      obstaclesGroup.add(b1);

      const b2 = scene.add.image(x + 64, startY + height - 64, 'building-res');
      scene.physics.add.existing(b2, true);
      obstaclesGroup.add(b2);
    }
  }

  private static generateLowlands(scene: Phaser.Scene, startX: number, startY: number, width: number, height: number, obstaclesGroup: Phaser.Physics.Arcade.StaticGroup, doors: Door[]) {
    // Irregular blocks
    for (let i = 0; i < 15; i++) {
      const px = startX + Math.random() * width;
      const py = startY + Math.random() * height;
      const b = scene.add.image(px, py, 'building-chawl');
      scene.physics.add.existing(b, true);
      obstaclesGroup.add(b);

      if (Math.random() > 0.5) {
        const door = new Door(scene, px, py + 64, 40, 20, `clinic-${i}`, 'CLINIC');
        doors.push(door);
      }
    }
  }
}
