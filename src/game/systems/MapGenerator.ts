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
    doors: Door[],
    vehiclesGroup: Phaser.Physics.Arcade.StaticGroup
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
      if (x < 1400 || x > 1700) {
        validVehicleSpots.push({ x, y: 1150 });
        validVehicleSpots.push({ x, y: 1250 });
      }
    }
    for(let y=200; y<2200; y+=200) {
      if (y < 1000 || y > 1300) {
        validVehicleSpots.push({ x: 1550, y });
        validVehicleSpots.push({ x: 1650, y });
      }
    }

    // DISTRICT A: Hindmata Market [Top Left: 0 to 1500, 0 to 1100]
    this.generateMarketDistrict(scene, 0, 0, 1500, 1100, obstaclesGroup, doors, validVehicleSpots);

    // DISTRICT B: Chawl / Residential [Bottom Left: 0 to 1500, 1300 to 2400]
    this.generateResidentialDistrict(scene, 0, 1300, 1500, 1100, obstaclesGroup, doors, validVehicleSpots);

    // DISTRICT C: Railway Area [Top Right: 1700 to 3200, 0 to 1100]
    this.generateRailwayDistrict(scene, 1700, 0, 1500, 1100, obstaclesGroup);

    // DISTRICT D: Flooded Lowlands [Bottom Right: 1700 to 3200, 1300 to 2400]
    this.generateLowlands(scene, 1700, 1300, 1500, 1100, obstaclesGroup, doors, validVehicleSpots);

    // Scatted Environmental Props (Trees, Barricades, Food Carts)
    for(let i=0; i<80; i++) {
      const px = Math.random() * mapWidth;
      const py = Math.random() * mapHeight;
      if (!this.isInsideBuilding(px, py)) {
        const rand = Math.random();
        let type = 'barricade';
        if (rand > 0.6) type = 'tree-pixel';
        if (rand > 0.85) type = 'food-cart';
        
        const b = scene.add.image(px, py, type).setDepth(type === 'tree-pixel' ? 25 : 5);
        scene.physics.add.existing(b, true);
        obstaclesGroup.add(b);
      }
    }

    // Vehicles (Spawned safely on roads as obstacles)
    this.spawnVehicles(scene, validVehicleSpots, 8, 'BUS', vehiclesGroup);
    this.spawnVehicles(scene, validVehicleSpots, 15, 'RICKSHAW', vehiclesGroup);
    this.spawnVehicles(scene, validVehicleSpots, 12, 'TAXI', vehiclesGroup);
    this.spawnVehicles(scene, validVehicleSpots, 20, 'SCOOTER', vehiclesGroup);

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
      { x: 400, y: 400, type: 'NORMAL', label: 'Shopkeeper' }, 
      { x: 1000, y: 800, type: 'CHILD', label: 'Child' },
      { x: 600, y: 1600, type: 'ELDERLY', label: 'Resident' },
      { x: 1200, y: 2000, type: 'NORMAL', label: 'Resident' },
      { x: 2200, y: 500, type: 'NORMAL', label: 'Commuter' },
      { x: 2800, y: 800, type: 'INJURED', label: 'Commuter' },
      { x: 1550, y: 1200, type: 'NORMAL', label: 'Driver' },
      { x: 2000, y: 1800, type: 'INJURED', label: 'Worker' },
      { x: 2600, y: 2200, type: 'CHILD', label: 'Stranded Child' },
      { x: 2800, y: 1800, type: 'ELDERLY', label: 'Resident' },
    ];

    civSpawns.forEach((c) => {
      if (!this.isInsideBuilding(c.x, c.y)) {
        civiliansGroup.add(new Civilian(scene, c.x, c.y, c.type as CivilianType, c.label));
      }
    });

    return safeZoneObj;
  }

  private static spawnVehicles(scene: Phaser.Scene, spots: {x: number, y: number}[], count: number, type: any, vehiclesGroup: Phaser.Physics.Arcade.StaticGroup) {
    for(let i=0; i<count; i++) {
      if (spots.length === 0) break;
      const index = Math.floor(Math.random() * spots.length);
      const spot = spots.splice(index, 1)[0];
      // Jitter a bit
      const px = spot.x + (Math.random() * 20 - 10);
      const py = spot.y + (Math.random() * 20 - 10);
      const v = new Vehicle(scene, px, py, type);
      vehiclesGroup.add(v);
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
    const cx = x + w / 2;
    const cy = y + h / 2;
    const b = scene.add.image(cx, cy, texture).setDepth(15); // Buildings overlap player
    
    scene.physics.add.existing(b, true);
    const body = b.body as Phaser.Physics.Arcade.StaticBody;
    // Tweak body size to match the facade floor footprint (assume bottom 64px is solid)
    if (texture === 'building-shop' || texture === 'building-res') {
      body.setSize(w, h/2);
      body.setOffset(0, h/2);
    } else if (texture === 'building-chawl') {
      body.setSize(w, 128);
      body.setOffset(0, 64);
    } else {
      body.setSize(w, h);
    }
    
    obstaclesGroup.add(b);
    this.geometry.buildings.push({ x, y, w, h });
  }

  private static generateMarketDistrict(scene: Phaser.Scene, startX: number, startY: number, width: number, height: number, obstaclesGroup: Phaser.Physics.Arcade.StaticGroup, doors: Door[], spots: {x:number,y:number}[]) {
    const blockSize = 128;
    const roadWidth = 80;
    
    for (let x = startX + roadWidth; x < startX + width - blockSize; x += blockSize + roadWidth) {
      for (let y = startY + roadWidth; y < startY + height - blockSize; y += blockSize + roadWidth) {
        this.addBuilding(scene, x, y, blockSize, blockSize, 'building-shop', obstaclesGroup);

        if (Math.random() > 0.4) {
          doors.push(new Door(scene, x + 64, y + 128 + 20, 40, 20, `shop-${x}-${y}`, 'SHOP'));
        }

        if (Math.random() > 0.5) {
          const cart = scene.add.image(x - 20, y + 64, 'food-cart').setDepth(14);
          scene.physics.add.existing(cart, true);
          obstaclesGroup.add(cart);
        }

        spots.push({ x: x - roadWidth/2, y: y + blockSize/2 });
        spots.push({ x: x + blockSize/2, y: y - roadWidth/2 });
      }
    }
  }

  private static generateResidentialDistrict(scene: Phaser.Scene, startX: number, startY: number, width: number, height: number, obstaclesGroup: Phaser.Physics.Arcade.StaticGroup, doors: Door[], spots: {x:number,y:number}[]) {
    const chawlWidth = 256;
    const chawlHeight = 192;
    const passage = 80; 

    for (let y = startY + passage; y < startY + height - chawlHeight; y += chawlHeight + passage) {
      for (let x = startX + passage; x < startX + width - chawlWidth; x += chawlWidth + passage) {
        this.addBuilding(scene, x, y, chawlWidth, chawlHeight, 'building-chawl', obstaclesGroup);

        if (Math.random() > 0.3) {
          doors.push(new Door(scene, x + 128, y + chawlHeight + 20, 40, 20, `chawl-${x}-${y}`, 'APARTMENT'));
        }

        if (Math.random() > 0.3) {
          const light = scene.add.image(x - 20, y + 100, 'street-light').setDepth(16);
          scene.physics.add.existing(light, true);
          obstaclesGroup.add(light);
        }

        spots.push({ x: x + chawlWidth/2, y: y - passage/2 });
      }
    }
  }

  private static generateRailwayDistrict(scene: Phaser.Scene, startX: number, startY: number, width: number, _height: number, obstaclesGroup: Phaser.Physics.Arcade.StaticGroup) {
    for (let x = startX + 100; x < startX + width - 256; x += 256) {
      this.addBuilding(scene, x, startY + 200, 256, 128, 'railway-platform', obstaclesGroup);
      this.addBuilding(scene, x, startY + 600, 256, 128, 'railway-platform', obstaclesGroup);
    }
  }

  private static checkOverlap(px: number, py: number, bw: number, bh: number, padding: number): boolean {
    for (const b of this.geometry.buildings) {
      // Expanded bounding box check with padding
      const left = b.x - padding;
      const right = b.x + b.w + padding;
      const top = b.y - padding;
      const bottom = b.y + b.h + padding;

      if (px + bw > left && px < right && py + bh > top && py < bottom) {
        return true;
      }
    }
    return false;
  }

  private static generateLowlands(scene: Phaser.Scene, startX: number, startY: number, width: number, height: number, obstaclesGroup: Phaser.Physics.Arcade.StaticGroup, doors: Door[], spots: {x:number,y:number}[]) {
    let attempts = 0;
    let placed = 0;
    const padding = 60; // Minimum distance between buildings for alleys/roads
    
    while (placed < 25 && attempts < 500) {
      attempts++;
      const bw = 128;
      const bh = 128;
      const px = startX + 100 + Math.random() * (width - 300 - bw);
      const py = startY + 100 + Math.random() * (height - 300 - bh);
      
      if (!this.checkOverlap(px, py, bw, bh, padding)) {
        this.addBuilding(scene, px, py, bw, bh, 'building-res', obstaclesGroup);
        if (Math.random() > 0.5) {
          doors.push(new Door(scene, px + 64, py + 128 + 20, 40, 20, `clinic-${placed}`, 'CLINIC'));
        }
        spots.push({ x: px - 50, y: py + 64 });
        placed++;
      }
    }
  }
}
