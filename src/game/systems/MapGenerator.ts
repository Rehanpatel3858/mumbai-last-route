import Phaser from 'phaser';
import { Vehicle } from '../entities/Vehicle';
import { Hazard } from '../entities/Hazard';
import { Civilian, type CivilianType } from '../entities/Civilian';
import { SafeZone } from '../entities/SafeZone';
import { Door } from '../entities/Door';

export interface MapGeometry {
  buildings: { x: number, y: number, w: number, h: number }[];
  roads: { x: number, y: number, w: number, h: number }[];
}

export class MapGenerator {
  public static geometry: MapGeometry = { buildings: [], roads: [] };

  public static generate(
    scene: Phaser.Scene,
    mapWidth: number,
    mapHeight: number,
    obstaclesGroup: Phaser.Physics.Arcade.StaticGroup,
    civiliansGroup: Phaser.GameObjects.Group,
    hazardsGroup: Phaser.Physics.Arcade.Group,
    doors: Door[]
  ): SafeZone {
    this.geometry = { buildings: [], roads: [] };

    // Fill base with road texture (default ground is road/pavement)
    for (let x = 0; x < mapWidth; x += 64) {
      for (let y = 0; y < mapHeight; y += 64) {
        scene.add.image(x + 32, y + 32, 'road-tile').setDepth(0);
      }
    }

    const validVehicleSpots: {x: number, y: number}[] = [];

    // Define main road cross
    this.geometry.roads.push({ x: 0, y: 1100, w: 3200, h: 200 }); // Horizontal Main Road
    this.geometry.roads.push({ x: 1500, y: 0, w: 200, h: 2400 }); // Vertical Main Road

    // Populate main roads with valid vehicle spots
    for(let x=200; x<3000; x+=200) {
      validVehicleSpots.push({ x, y: 1150 });
      validVehicleSpots.push({ x, y: 1250 });
    }
    for(let y=200; y<2200; y+=200) {
      validVehicleSpots.push({ x: 1550, y });
      validVehicleSpots.push({ x: 1650, y });
    }

    // DISTRICT A: Hindmata Market (Dense shops, food carts) [Top Left: 0 to 1500, 0 to 1100]
    this.generateMarketDistrict(scene, 0, 0, 1500, 1100, obstaclesGroup, doors, validVehicleSpots);

    // DISTRICT B: Chawl / Residential (Narrow lanes) [Bottom Left: 0 to 1500, 1300 to 2400]
    this.generateResidentialDistrict(scene, 0, 1300, 1500, 1100, obstaclesGroup, doors, validVehicleSpots);

    // DISTRICT C: Railway Area [Top Right: 1700 to 3200, 0 to 1100]
    this.generateRailwayDistrict(scene, 1700, 0, 1500, 1100, obstaclesGroup);

    // DISTRICT D: Flooded Lowlands [Bottom Right: 1700 to 3200, 1300 to 2400]
    this.generateLowlands(scene, 1700, 1300, 1500, 1100, obstaclesGroup, doors, validVehicleSpots);

    // Scatted Props globally
    for(let i=0; i<40; i++) {
      const px = Math.random() * mapWidth;
      const py = Math.random() * mapHeight;
      if (!this.isInsideBuilding(px, py)) {
        const b = scene.add.image(px, py, 'barricade').setDepth(5);
        scene.physics.add.existing(b, true);
        obstaclesGroup.add(b);
      }
    }

    // Vehicles (Spawned safely on roads)
    this.spawnVehicles(scene, validVehicleSpots, 8, 'BUS');
    this.spawnVehicles(scene, validVehicleSpots, 15, 'RICKSHAW');
    this.spawnVehicles(scene, validVehicleSpots, 12, 'TAXI');
    this.spawnVehicles(scene, validVehicleSpots, 20, 'SCOOTER');

    // Hazards
    for(let i=0; i<40; i++) {
      const px = Math.random() * mapWidth;
      const py = Math.random() * mapHeight;
      if (!this.isInsideBuilding(px, py)) {
        const types = ['MANHOLE', 'ELECTRICAL', 'DEBRIS'];
        const type = types[Math.floor(Math.random()*types.length)] as any;
        hazardsGroup.add(new Hazard(scene, px, py, type));
      }
    }

    // Safe Zone (Top Right corner near Railway)
    const safeZoneObj = new SafeZone(scene, 2800, 400);

    // Civilians
    const civSpawns = [
      { x: 400, y: 400, type: 'NORMAL', label: 'Shopkeeper' }, // Market
      { x: 1000, y: 800, type: 'CHILD', label: 'Child' }, // Market
      { x: 600, y: 1600, type: 'ELDERLY', label: 'Resident' }, // Chawl
      { x: 1200, y: 2000, type: 'NORMAL', label: 'Resident' }, // Chawl
      { x: 2200, y: 500, type: 'NORMAL', label: 'Commuter' }, // Railway
      { x: 2800, y: 800, type: 'INJURED', label: 'Commuter' }, // Railway
      { x: 1550, y: 1200, type: 'NORMAL', label: 'Driver' }, // Main intersection
      { x: 2000, y: 1800, type: 'INJURED', label: 'Worker' }, // Lowlands
      { x: 2600, y: 2200, type: 'CHILD', label: 'Stranded Child' }, // Lowlands
      { x: 2800, y: 1800, type: 'ELDERLY', label: 'Resident' }, // Lowlands
    ];

    civSpawns.forEach((c) => {
      if (!this.isInsideBuilding(c.x, c.y)) {
        civiliansGroup.add(new Civilian(scene, c.x, c.y, c.type as CivilianType, c.label));
      }
    });

    return safeZoneObj;
  }

  private static spawnVehicles(scene: Phaser.Scene, spots: {x: number, y: number}[], count: number, type: any) {
    for(let i=0; i<count; i++) {
      if (spots.length === 0) break;
      const index = Math.floor(Math.random() * spots.length);
      const spot = spots.splice(index, 1)[0];
      // Jitter a bit
      const px = spot.x + (Math.random() * 40 - 20);
      const py = spot.y + (Math.random() * 40 - 20);
      new Vehicle(scene, px, py, type);
    }
  }

  private static isInsideBuilding(x: number, y: number): boolean {
    for (const b of this.geometry.buildings) {
      if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) {
        return true;
      }
    }
    return false;
  }

  private static addBuilding(scene: Phaser.Scene, x: number, y: number, w: number, h: number, texture: string, obstaclesGroup: Phaser.Physics.Arcade.StaticGroup) {
    // We add an image. Origin is center.
    const cx = x + w / 2;
    const cy = y + h / 2;
    const b = scene.add.image(cx, cy, texture).setDepth(4);
    
    // Scale image to fit requested w/h if necessary, or just rely on asset sizes.
    // Our assets are 128x128 for shop/res, 256x128 for chawl
    scene.physics.add.existing(b, true);
    
    // The visual physics body is exact
    const body = b.body as Phaser.Physics.Arcade.StaticBody;
    body.setSize(w, h);
    
    obstaclesGroup.add(b);
    this.geometry.buildings.push({ x, y, w, h });
  }

  private static generateMarketDistrict(scene: Phaser.Scene, startX: number, startY: number, width: number, height: number, obstaclesGroup: Phaser.Physics.Arcade.StaticGroup, doors: Door[], spots: {x:number,y:number}[]) {
    const blockSize = 128;
    const roadWidth = 100;
    
    for (let x = startX + roadWidth; x < startX + width - blockSize; x += blockSize + roadWidth) {
      for (let y = startY + roadWidth; y < startY + height - blockSize; y += blockSize + roadWidth) {
        this.addBuilding(scene, x, y, blockSize, blockSize, 'building-shop', obstaclesGroup);

        if (Math.random() > 0.4) {
          doors.push(new Door(scene, x + 64, y + 128 + 20, 40, 20, `shop-${x}-${y}`, 'SHOP'));
        }

        // Add street food carts on sidewalks (not inside building)
        if (Math.random() > 0.5) {
          const cart = scene.add.image(x - 20, y + 64, 'food-cart').setDepth(4);
          scene.physics.add.existing(cart, true);
          obstaclesGroup.add(cart);
        }

        // Add to valid vehicle parking spots (streets between blocks)
        spots.push({ x: x - roadWidth/2, y: y + blockSize/2 });
        spots.push({ x: x + blockSize/2, y: y - roadWidth/2 });
      }
    }
  }

  private static generateResidentialDistrict(scene: Phaser.Scene, startX: number, startY: number, width: number, height: number, obstaclesGroup: Phaser.Physics.Arcade.StaticGroup, doors: Door[], spots: {x:number,y:number}[]) {
    const chawlWidth = 256;
    const chawlHeight = 128;
    const passage = 80; 

    for (let y = startY + passage; y < startY + height - chawlHeight; y += chawlHeight + passage) {
      for (let x = startX + passage; x < startX + width - chawlWidth; x += chawlWidth + passage) {
        this.addBuilding(scene, x, y, chawlWidth, chawlHeight, 'building-chawl', obstaclesGroup);

        if (Math.random() > 0.3) {
          doors.push(new Door(scene, x + 128, y + chawlHeight + 20, 40, 20, `chawl-${x}-${y}`, 'APARTMENT'));
        }

        if (Math.random() > 0.3) {
          const light = scene.add.image(x - 20, y, 'street-light').setDepth(6);
          scene.physics.add.existing(light, true);
          obstaclesGroup.add(light);
        }

        spots.push({ x: x + chawlWidth/2, y: y - passage/2 });
      }
    }
  }

  private static generateRailwayDistrict(scene: Phaser.Scene, startX: number, startY: number, width: number, _height: number, obstaclesGroup: Phaser.Physics.Arcade.StaticGroup) {
    for (let x = startX + 100; x < startX + width - 256; x += 256) {
      // Platform 1
      this.addBuilding(scene, x, startY + 200, 256, 128, 'railway-platform', obstaclesGroup);
      // Platform 2
      this.addBuilding(scene, x, startY + 600, 256, 128, 'railway-platform', obstaclesGroup);
    }
  }

  private static generateLowlands(scene: Phaser.Scene, startX: number, startY: number, width: number, height: number, obstaclesGroup: Phaser.Physics.Arcade.StaticGroup, doors: Door[], spots: {x:number,y:number}[]) {
    // Scattered irregular shanties
    for (let i = 0; i < 25; i++) {
      const px = startX + 100 + Math.random() * (width - 300);
      const py = startY + 100 + Math.random() * (height - 300);
      
      // Avoid overlap
      if (!this.isInsideBuilding(px, py) && !this.isInsideBuilding(px+128, py+128)) {
        this.addBuilding(scene, px, py, 128, 128, 'building-res', obstaclesGroup);
        if (Math.random() > 0.5) {
          doors.push(new Door(scene, px + 64, py + 128 + 20, 40, 20, `clinic-${i}`, 'CLINIC'));
        }
        spots.push({ x: px - 50, y: py + 64 });
      }
    }
  }
}
