import Phaser from 'phaser';

export function generatePixelTextures(scene: Phaser.Scene) {
  const textures = scene.textures;

  const createPixelCanvas = (key: string, width: number, height: number, drawFn: (ctx: CanvasRenderingContext2D) => void) => {
    if (textures.exists(key)) return;
    const canvas = textures.createCanvas(key, width, height);
    if (!canvas) return;
    const ctx = canvas.getContext();
    ctx.imageSmoothingEnabled = false;
    drawFn(ctx);
    canvas.refresh();
  };

  // 1. PLAYER SPRITESHEET (128x32 - 4 directions: Down, Up, Left, Right; 32x32 per frame)
  createPixelCanvas('player-pixel', 128, 32, (ctx) => {
    for (let dir = 0; dir < 4; dir++) {
      const oX = dir * 32;
      
      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.fillRect(oX + 8, 26, 16, 4);

      // Body / Raincoat
      ctx.fillStyle = '#f97316'; // orange raincoat
      ctx.fillRect(oX + 10, 10, 12, 14);
      // Coat shading
      ctx.fillStyle = '#c2410c';
      ctx.fillRect(oX + 10, 10, 2, 14);
      ctx.fillRect(oX + 20, 10, 2, 14);

      // Rescue Backpack (dark gray)
      if (dir === 1 || dir === 2 || dir === 3) {
        ctx.fillStyle = '#334155';
        if (dir === 1) ctx.fillRect(oX + 9, 10, 14, 10); // UP
        if (dir === 2) ctx.fillRect(oX + 18, 10, 6, 10); // LEFT
        if (dir === 3) ctx.fillRect(oX + 8, 10, 6, 10); // RIGHT
      }

      // Reflective Strips (Neon Cyan)
      ctx.fillStyle = '#00f0ff';
      if (dir === 0) { // Down
        ctx.fillRect(oX + 12, 14, 8, 2);
        ctx.fillRect(oX + 12, 20, 8, 2);
      } else if (dir === 2 || dir === 3) { // Left / Right
        ctx.fillRect(oX + 12, 14, 8, 2);
      }

      // Head / Helmet (Yellow)
      ctx.fillStyle = '#facc15';
      ctx.fillRect(oX + 11, 4, 10, 7);
      ctx.fillStyle = '#a16207'; // helmet rim shadow
      ctx.fillRect(oX + 10, 9, 12, 2); 

      // Face/Visor
      if (dir === 0) {
        ctx.fillStyle = '#fcd34d'; // skin
        ctx.fillRect(oX + 13, 7, 6, 3);
      } else if (dir === 2) {
        ctx.fillStyle = '#fcd34d';
        ctx.fillRect(oX + 10, 7, 4, 3);
      } else if (dir === 3) {
        ctx.fillStyle = '#fcd34d';
        ctx.fillRect(oX + 18, 7, 4, 3);
      }

      // Boots
      ctx.fillStyle = '#1e293b';
      if (dir === 0 || dir === 1) {
        ctx.fillRect(oX + 11, 24, 4, 4);
        ctx.fillRect(oX + 17, 24, 4, 4);
      } else if (dir === 2) {
        ctx.fillRect(oX + 13, 24, 5, 4);
      } else if (dir === 3) {
        ctx.fillRect(oX + 14, 24, 5, 4);
      }
    }
  });

  // 2. CIVILIANS (32x32)
  const drawCivBase = (ctx: CanvasRenderingContext2D, shirt: string, pant: string, hair: string) => {
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(10, 26, 12, 4); // shadow
    ctx.fillStyle = pant;
    ctx.fillRect(11, 20, 10, 6);
    ctx.fillStyle = shirt;
    ctx.fillRect(10, 10, 12, 10);
    ctx.fillStyle = '#fcd34d'; // skin
    ctx.fillRect(11, 5, 10, 6);
    ctx.fillStyle = hair;
    ctx.fillRect(11, 3, 10, 3);
    ctx.fillStyle = '#1e293b'; // shoes
    ctx.fillRect(11, 26, 4, 2);
    ctx.fillRect(17, 26, 4, 2);
  };

  createPixelCanvas('civilian-normal', 32, 32, (ctx) => drawCivBase(ctx, '#3b82f6', '#334155', '#451a03'));
  createPixelCanvas('civilian-elderly', 32, 32, (ctx) => {
    drawCivBase(ctx, '#059669', '#e2e8f0', '#cbd5e1'); // green kurta, white pants/hair
    ctx.fillStyle = '#78350f'; // cane
    ctx.fillRect(23, 12, 2, 16);
  });
  createPixelCanvas('civilian-injured', 32, 32, (ctx) => {
    drawCivBase(ctx, '#dc2626', '#1e293b', '#451a03'); // red shirt
    ctx.fillStyle = '#ffffff'; // bandage
    ctx.fillRect(10, 4, 12, 3);
  });
  createPixelCanvas('civilian-child', 32, 32, (ctx) => {
    // scale down slightly
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(12, 24, 8, 4);
    ctx.fillStyle = '#8b5cf6'; // purple jacket
    ctx.fillRect(12, 12, 8, 8);
    ctx.fillStyle = '#fcd34d';
    ctx.fillRect(12, 7, 8, 6);
    ctx.fillStyle = '#f43f5e'; // red cap
    ctx.fillRect(11, 5, 10, 3);
    ctx.fillStyle = '#0f172a'; // boots
    ctx.fillRect(12, 20, 3, 4);
    ctx.fillRect(17, 20, 3, 4);
  });

  // 3. BUILDINGS (Detailed Modular Tiles - 128x128)
  const drawWindow = (ctx: CanvasRenderingContext2D, x: number, y: number, lit: boolean) => {
    ctx.fillStyle = '#1e293b'; // frame
    ctx.fillRect(x, y, 16, 20);
    ctx.fillStyle = lit ? '#fef08a' : '#0f172a'; // glass
    ctx.fillRect(x + 2, y + 2, 5, 7);
    ctx.fillRect(x + 9, y + 2, 5, 7);
    ctx.fillRect(x + 2, y + 11, 5, 7);
    ctx.fillRect(x + 9, y + 11, 5, 7);
    // AC unit
    if (Math.random() > 0.5) {
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(x + 2, y + 20, 12, 8);
      ctx.fillStyle = '#475569'; // vent
      ctx.fillRect(x + 4, y + 22, 8, 4);
    }
  };

  createPixelCanvas('building-shop', 128, 128, (ctx) => {
    // Concrete base with weathering
    ctx.fillStyle = '#64748b'; // darker concrete
    ctx.fillRect(0, 0, 128, 128);
    // Stains and weathering
    ctx.fillStyle = '#475569';
    for(let i=0; i<30; i++) {
      ctx.fillRect(Math.random()*128, Math.random()*80, Math.random()*20+5, Math.random()*4+1);
    }
    // Brick pattern exposed
    ctx.fillStyle = '#92400e';
    for (let by = 16; by < 64; by += 8) {
      for (let bx = (by % 16 === 0 ? 10 : 18); bx < 118; bx += 24) {
        if(Math.random() > 0.6) ctx.fillRect(bx, by, 10, 4);
      }
    }
    
    // Roof Parapet and Water Tank
    ctx.fillStyle = '#334155';
    ctx.fillRect(0, 0, 128, 8); // roof edge
    ctx.fillStyle = '#0f172a'; // black water tank
    ctx.fillRect(16, 0, 20, 16);
    ctx.fillStyle = '#1e293b'; 
    ctx.fillRect(18, 2, 16, 14);
    ctx.fillStyle = '#f8fafc'; // Sintex logo squiggle
    ctx.fillRect(22, 6, 8, 2);
    // Satellite dish
    ctx.fillStyle = '#cbd5e1';
    ctx.beginPath(); ctx.arc(100, 8, 8, Math.PI, 0); ctx.fill();
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(99, 4, 2, 8);

    // Upper floor windows (Second Floor)
    drawWindow(ctx, 16, 20, Math.random() > 0.5);
    drawWindow(ctx, 56, 20, Math.random() > 0.5);
    drawWindow(ctx, 96, 20, Math.random() > 0.5);
    
    // Middle floor windows with balcony
    ctx.fillStyle = '#334155'; // balcony base
    ctx.fillRect(12, 66, 104, 6);
    drawWindow(ctx, 16, 50, Math.random() > 0.5);
    drawWindow(ctx, 56, 50, Math.random() > 0.5);
    drawWindow(ctx, 96, 50, Math.random() > 0.5);
    // Balcony railing
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(12, 60, 104, 2);
    for(let i=12; i<116; i+=8) ctx.fillRect(i, 60, 2, 6);
    
    // Hanging clothes
    ctx.fillStyle = '#ef4444'; ctx.fillRect(20, 60, 8, 8);
    ctx.fillStyle = '#3b82f6'; ctx.fillRect(32, 60, 10, 10);
    ctx.fillStyle = '#facc15'; ctx.fillRect(80, 60, 6, 8);

    // Wires and AC pipes
    ctx.fillStyle = '#020617';
    ctx.beginPath(); ctx.moveTo(0, 40); ctx.quadraticCurveTo(64, 50, 128, 40); ctx.stroke();
    
    // Ground Floor Shop
    ctx.fillStyle = '#0f172a'; // dark interior
    ctx.fillRect(10, 96, 108, 32);
    // Shop counter / goods
    ctx.fillStyle = '#fbbf24'; ctx.fillRect(16, 110, 40, 18);
    ctx.fillStyle = '#ef4444'; ctx.fillRect(20, 100, 10, 10); // boxes
    ctx.fillStyle = '#3b82f6'; ctx.fillRect(35, 104, 10, 6);
    ctx.fillStyle = '#10b981'; ctx.fillRect(80, 100, 16, 28); // fridge
    ctx.fillStyle = '#e2e8f0'; ctx.fillRect(82, 102, 12, 14); // glass
    
    // Shop sign
    ctx.fillStyle = '#1d4ed8'; // blue sign
    ctx.fillRect(8, 82, 112, 14);
    ctx.fillStyle = '#ffffff'; // text squiggle
    ctx.fillRect(14, 86, 40, 6);
    ctx.fillRect(60, 86, 40, 6);
    
    // Postered wall
    ctx.fillStyle = '#f8fafc'; ctx.fillRect(118, 96, 10, 14);
    ctx.fillStyle = '#ef4444'; ctx.fillRect(120, 98, 6, 4);
  });

  createPixelCanvas('building-res', 128, 128, (ctx) => {
    // Plaster wall
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(0, 0, 128, 128);
    // Peeling plaster / moss at bottom
    ctx.fillStyle = '#94a3b8'; // weathering
    ctx.fillRect(0, 0, 10, 128);
    ctx.fillRect(118, 0, 10, 128);
    ctx.fillStyle = '#4d7c0f'; // mossy bottom
    ctx.fillRect(0, 118, 128, 10);
    for(let i=0; i<40; i++) ctx.fillRect(Math.random()*128, 100+Math.random()*28, Math.random()*8, Math.random()*8);

    // Roof details
    ctx.fillStyle = '#64748b';
    ctx.fillRect(0, 0, 128, 6);
    ctx.fillStyle = '#3b82f6'; // blue tarp
    ctx.fillRect(40, 0, 30, 12);
    
    // 3 floors of windows
    for(let r = 0; r < 3; r++) {
      for(let c = 0; c < 3; c++) {
        drawWindow(ctx, 20 + c * 36, 12 + r * 36, Math.random() > 0.4);
        
        // Random AC units or potted plants per window
        if(Math.random() > 0.7) {
          ctx.fillStyle = '#84cc16'; // plant
          ctx.fillRect(20 + c * 36, 28 + r * 36, 6, 4);
          ctx.fillStyle = '#78350f'; // pot
          ctx.fillRect(20 + c * 36, 32 + r * 36, 6, 4);
        }
      }
    }

    // Huge tangled wire mess across the building
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1;
    for(let i=0; i<5; i++) {
      ctx.beginPath();
      ctx.moveTo(0, 30 + i * 15);
      ctx.quadraticCurveTo(64, 40 + i * 20, 128, 20 + i * 10);
      ctx.stroke();
    }

    // Main Pipe
    ctx.fillStyle = '#334155';
    ctx.fillRect(110, 0, 6, 128); // thick main pipe
    // Pipe brackets
    ctx.fillStyle = '#0f172a';
    for(let i=10; i<128; i+=20) ctx.fillRect(108, i, 10, 2);
    
    // Entrance / Ground door
    ctx.fillStyle = '#78350f'; // wooden door
    ctx.fillRect(54, 96, 20, 32);
    ctx.fillStyle = '#facc15'; // door handle
    ctx.fillRect(70, 112, 2, 4);
    // Electrical box
    ctx.fillStyle = '#64748b';
    ctx.fillRect(20, 100, 12, 16);
    ctx.fillStyle = '#ef4444'; // danger sign
    ctx.fillRect(24, 104, 4, 4);
  });

  // 4. ROADS, SIDEWALKS & WATER
  createPixelCanvas('road-tile', 64, 64, (ctx) => {
    ctx.fillStyle = '#1e293b'; // dark asphalt
    ctx.fillRect(0, 0, 64, 64);
    // Mud and dirt patches
    ctx.fillStyle = '#3f271d'; // dark wet mud
    for(let i=0; i<8; i++) ctx.fillRect(Math.random()*64, Math.random()*64, Math.random()*16+8, Math.random()*8+4);
    // Cracks / texture (NO CIRCLES)
    ctx.fillStyle = '#0f172a';
    for(let i=0; i<40; i++) {
      ctx.fillRect(Math.random()*64, Math.random()*64, Math.random()*6+2, Math.random()*2+1);
    }
    // Minor lighter pebbles / garbage
    ctx.fillStyle = '#475569';
    for(let i=0; i<20; i++) ctx.fillRect(Math.random()*64, Math.random()*64, 2, 2);
    ctx.fillStyle = '#e2e8f0'; // white paper litter
    for(let i=0; i<2; i++) ctx.fillRect(Math.random()*64, Math.random()*64, 3, 2);
  });

  createPixelCanvas('road-line-v', 64, 64, (ctx) => {
    ctx.fillStyle = 'rgba(0,0,0,0)'; // transparent base so it overlays road
    ctx.fillRect(0, 0, 64, 64);
    ctx.fillStyle = 'rgba(250, 204, 21, 0.7)'; // faded yellow dashed line
    ctx.fillRect(30, 0, 4, 20);
    ctx.fillRect(30, 36, 4, 20);
  });

  createPixelCanvas('road-line-h', 64, 64, (ctx) => {
    ctx.fillStyle = 'rgba(0,0,0,0)'; 
    ctx.fillRect(0, 0, 64, 64);
    ctx.fillStyle = 'rgba(250, 204, 21, 0.7)';
    ctx.fillRect(0, 30, 20, 4);
    ctx.fillRect(36, 30, 20, 4);
  });

  createPixelCanvas('sidewalk-tile', 64, 64, (ctx) => {
    ctx.fillStyle = '#64748b'; // concrete
    ctx.fillRect(0, 0, 64, 64);
    ctx.fillStyle = '#475569'; // pavement lines
    ctx.fillRect(0, 0, 64, 2); ctx.fillRect(0, 32, 64, 2);
    ctx.fillRect(0, 0, 2, 64); ctx.fillRect(32, 0, 2, 64);
    // Mud on sidewalk
    ctx.fillStyle = '#3f271d';
    ctx.fillRect(10, 10, 12, 6); ctx.fillRect(40, 40, 16, 8);
    // Curb edge (bottom)
    ctx.fillStyle = '#facc15'; // yellow curb
    ctx.fillRect(0, 58, 64, 6);
    ctx.fillStyle = '#0f172a'; // black curb stripes
    for(let x=0; x<64; x+=16) ctx.fillRect(x, 58, 8, 6);
  });

  createPixelCanvas('water-anim', 256, 64, (ctx) => {
    for (let f = 0; f < 4; f++) {
      const oX = f * 64;
      ctx.fillStyle = 'rgba(12, 74, 110, 0.85)'; // extremely deep blue/teal
      ctx.fillRect(oX, 0, 64, 64);
      
      // Moving wave highlights
      ctx.fillStyle = 'rgba(56, 189, 248, 0.4)'; // cyan ripples
      const s = f * 8;
      
      // Long sweeping wave lines
      ctx.fillRect(oX + ((10 + s) % 64), 16, 24, 2);
      ctx.fillRect(oX + ((40 + s) % 64), 32, 32, 2);
      ctx.fillRect(oX + ((5 + s) % 64), 48, 16, 2);
      
      // Small turbulent ripples
      ctx.fillStyle = 'rgba(125, 211, 252, 0.5)';
      ctx.fillRect(oX + ((24 + s*1.5) % 64), 20, 6, 2);
      ctx.fillRect(oX + ((54 + s*1.2) % 64), 38, 8, 2);
      
      // Floating debris (leaves, plastic)
      ctx.fillStyle = '#65a30d'; // green leaf
      ctx.fillRect(oX + ((18 + s*0.5) % 64), 28, 4, 2);
      ctx.fillStyle = '#f8fafc'; // white plastic
      ctx.fillRect(oX + ((45 + s*0.6) % 64), 52, 6, 4);
    }
  });

  // 5. VEHICLES & PROPS
  createPixelCanvas('bus-detailed', 128, 64, (ctx) => {
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(8, 54, 112, 10); // shadow

    // Body (BEST Red)
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(10, 8, 108, 48);
    // Lower body dark trim
    ctx.fillStyle = '#991b1b';
    ctx.fillRect(10, 42, 108, 14);
    // Yellow stripe
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(10, 38, 108, 4);

    // Roof details
    ctx.fillStyle = '#fca5a5'; ctx.fillRect(10, 8, 108, 2); // highlight
    ctx.fillStyle = '#94a3b8'; ctx.fillRect(40, 4, 20, 4); // vent

    // Windows
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(14, 16, 100, 16);
    ctx.fillStyle = '#64748b'; // pillars
    for(let i=0; i<7; i++) ctx.fillRect(24 + i*16, 16, 4, 16);

    // Reflections
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.beginPath(); ctx.moveTo(20, 16); ctx.lineTo(16, 32); ctx.lineTo(30, 32); ctx.lineTo(34, 16); ctx.fill();
    ctx.beginPath(); ctx.moveTo(60, 16); ctx.lineTo(56, 32); ctx.lineTo(70, 32); ctx.lineTo(74, 16); ctx.fill();

    // Wheels
    ctx.fillStyle = '#020617';
    ctx.fillRect(24, 52, 16, 12);
    ctx.fillRect(88, 52, 16, 12);
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(28, 54, 8, 8);
    ctx.fillRect(92, 54, 8, 8);

    // Lights & Sign
    ctx.fillStyle = '#fef08a'; ctx.fillRect(116, 46, 4, 8); // headlight
    ctx.fillStyle = '#ef4444'; ctx.fillRect(10, 46, 4, 8); // taillight
    ctx.fillStyle = '#000000'; ctx.fillRect(110, 18, 4, 12); // route board
    ctx.fillStyle = '#1e293b'; ctx.fillRect(44, 4, 40, 8); // side sign
    ctx.fillStyle = '#ffffff'; ctx.fillRect(48, 6, 32, 4);
  });

  createPixelCanvas('auto-rickshaw', 48, 32, (ctx) => {
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(4, 26, 40, 6);
    
    // Canvas roof
    ctx.fillStyle = '#eab308'; // yellow
    ctx.beginPath(); ctx.moveTo(6, 18); ctx.lineTo(8, 4); ctx.lineTo(40, 4); ctx.lineTo(42, 18); ctx.fill();
    ctx.fillStyle = '#fef08a'; ctx.fillRect(10, 4, 28, 2); // highlight
    
    // Black lower body
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(6, 18, 36, 10);
    
    // Driver cabin / Windshield
    ctx.fillStyle = '#1e293b'; ctx.fillRect(36, 10, 6, 8); // frame
    ctx.fillStyle = '#e2e8f0'; ctx.fillRect(38, 12, 4, 6); // glass
    
    // Passenger cabin open window
    ctx.fillStyle = '#020617'; ctx.fillRect(10, 8, 20, 10); // inside
    ctx.fillStyle = '#334155'; ctx.fillRect(14, 12, 8, 6); // seat
    
    // Wheels (3 wheeler layout)
    ctx.fillStyle = '#000000';
    ctx.fillRect(12, 26, 8, 8); // rear
    ctx.fillRect(38, 26, 6, 6); // front
    ctx.fillStyle = '#94a3b8'; ctx.fillRect(14, 28, 4, 4); // rim
    
    ctx.fillStyle = '#fef08a'; ctx.fillRect(42, 22, 2, 4); // headlight
  });

  createPixelCanvas('taxi-pixel', 64, 32, (ctx) => {
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(4, 26, 56, 6);
    
    // Black lower body
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(6, 16, 52, 10);
    // Yellow roof (Premier Padmini style)
    ctx.fillStyle = '#eab308';
    ctx.beginPath(); ctx.moveTo(6, 16); ctx.lineTo(16, 6); ctx.lineTo(48, 6); ctx.lineTo(58, 16); ctx.fill();
    ctx.fillStyle = '#fde047'; ctx.fillRect(20, 6, 20, 2); // highlight

    // Windows
    ctx.fillStyle = '#1e293b'; ctx.fillRect(18, 8, 12, 8); ctx.fillRect(34, 8, 12, 8); // glass
    ctx.fillStyle = '#020617'; // B-pillar
    ctx.fillRect(30, 8, 4, 8);
    
    // Luggage rack
    ctx.fillStyle = '#475569';
    ctx.fillRect(20, 2, 24, 4);
    ctx.fillStyle = '#92400e'; // luggage box
    ctx.fillRect(24, 0, 16, 4);

    // Details
    ctx.fillStyle = '#94a3b8'; ctx.fillRect(6, 22, 52, 2); // chrome bumper
    ctx.fillStyle = '#000000'; ctx.fillRect(12, 26, 10, 8); ctx.fillRect(42, 26, 10, 8); // wheels
    ctx.fillStyle = '#e2e8f0'; ctx.fillRect(14, 28, 6, 4); ctx.fillRect(44, 28, 6, 4); // hubcaps
    ctx.fillStyle = '#fef08a'; ctx.fillRect(58, 18, 4, 4); // circular headlight
  });

  createPixelCanvas('car-pixel', 64, 32, (ctx) => {
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(4, 26, 56, 6);
    // Dark metallic grey/blue body
    ctx.fillStyle = '#334155';
    ctx.fillRect(6, 16, 52, 10);
    ctx.beginPath(); ctx.moveTo(6, 16); ctx.lineTo(20, 8); ctx.lineTo(44, 8); ctx.lineTo(58, 16); ctx.fill();
    ctx.fillStyle = '#64748b'; ctx.fillRect(20, 8, 20, 2); // highlight

    // Windows
    ctx.fillStyle = '#0f172a'; ctx.fillRect(22, 10, 10, 6); ctx.fillRect(34, 10, 8, 6);
    // Wheels
    ctx.fillStyle = '#000000'; ctx.fillRect(12, 26, 10, 8); ctx.fillRect(42, 26, 10, 8);
    ctx.fillStyle = '#fef08a'; ctx.fillRect(58, 18, 2, 4); // headlight
    ctx.fillStyle = '#ef4444'; ctx.fillRect(6, 18, 2, 4); // taillight
  });

  createPixelCanvas('scooter-pixel', 32, 24, (ctx) => {
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(4, 20, 24, 4);
    // Body (white/silver)
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(8, 14, 16, 6); // base
    ctx.fillRect(20, 8, 4, 6); // front shield
    // Seat
    ctx.fillStyle = '#1e293b'; ctx.fillRect(6, 12, 10, 4);
    // Handle
    ctx.fillStyle = '#0f172a'; ctx.fillRect(20, 6, 6, 2);
    // Wheels
    ctx.fillStyle = '#000000'; ctx.fillRect(6, 18, 6, 6); ctx.fillRect(20, 18, 6, 6);
    ctx.fillStyle = '#fef08a'; ctx.fillRect(24, 12, 2, 4); // headlight
  });

  // 6. HAZARDS & PROPS
  createPixelCanvas('manhole-pixel', 32, 32, (ctx) => {
    ctx.fillStyle = '#334155'; // concrete rim
    ctx.beginPath(); ctx.arc(16, 16, 14, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#020617'; // dark hole
    ctx.beginPath(); ctx.arc(16, 16, 12, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#ef4444'; // warning tape
    ctx.fillRect(0, 14, 32, 4);
    // Whirlpool water effect
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(10, 10, 12, 2);
    ctx.fillRect(12, 20, 10, 2);
    ctx.fillRect(20, 12, 2, 8);
  });

  createPixelCanvas('electric-pixel', 32, 32, (ctx) => {
    ctx.fillStyle = 'rgba(14, 165, 233, 0.4)'; // water pool
    ctx.fillRect(0, 0, 32, 32);
    ctx.fillStyle = '#334155'; // fallen pole/box
    ctx.fillRect(4, 12, 24, 8);
    // sparks
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(14, 2, 4, 8);
    ctx.fillRect(10, 10, 8, 4);
    ctx.fillRect(16, 20, 4, 8);
  });

  createPixelCanvas('debris-pixel', 32, 32, (ctx) => {
    ctx.fillStyle = '#78350f'; ctx.fillRect(4, 4, 24, 24);
    ctx.fillStyle = '#b45309'; ctx.fillRect(6, 6, 20, 20);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(6, 6, 4, 20); ctx.fillRect(22, 6, 4, 20);
    ctx.fillRect(6, 6, 20, 4); ctx.fillRect(6, 22, 20, 4);
  });

  createPixelCanvas('tree-pixel', 64, 64, (ctx) => {
    // shadow
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath(); ctx.ellipse(32, 54, 16, 6, 0, 0, Math.PI*2); ctx.fill();
    // Trunk
    ctx.fillStyle = '#451a03';
    ctx.fillRect(28, 30, 8, 26);
    ctx.fillStyle = '#78350f';
    ctx.fillRect(28, 30, 4, 26); // highlight

    // Leaves (Clustered rectangles, NO CIRCLES)
    const drawLeafCluster = (x: number, y: number, w: number, h: number, dark: boolean) => {
      ctx.fillStyle = dark ? '#064e3b' : '#047857';
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = '#10b981'; // highlight
      ctx.fillRect(x, y, w, 4);
    };

    drawLeafCluster(16, 16, 32, 24, false);
    drawLeafCluster(8, 24, 24, 20, true);
    drawLeafCluster(32, 20, 24, 24, true);
    drawLeafCluster(20, 8, 24, 16, false);
    
    // Noise dots for texture
    ctx.fillStyle = '#34d399';
    for(let i=0; i<20; i++) {
      ctx.fillRect(12 + Math.random()*40, 12 + Math.random()*32, 4, 4);
    }
  });

  createPixelCanvas('safezone-pixel', 128, 128, (ctx) => {
    // Concrete Platform
    ctx.fillStyle = '#334155';
    ctx.fillRect(8, 8, 112, 112);
    ctx.fillStyle = '#475569';
    ctx.fillRect(12, 12, 104, 104);
    // Green safety glow
    ctx.fillStyle = 'rgba(34, 197, 94, 0.2)';
    ctx.fillRect(24, 24, 80, 80);
    // Helipad marking
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(48, 44, 8, 40);
    ctx.fillRect(72, 44, 8, 40);
    ctx.fillRect(56, 60, 16, 8);
    // Text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px monospace';
    ctx.fillText('SAFE ZONE', 40, 30);
    ctx.fillStyle = '#f59e0b';
    ctx.fillText('EVACUATION', 36, 110);
  });

  // 7. NEW 2.5D MUMBAI SPECIFIC BUILDINGS
  createPixelCanvas('building-shop', 128, 128, (ctx) => {
    // Roof (Top 64px)
    ctx.fillStyle = '#475569';
    ctx.fillRect(0, 0, 128, 64);
    ctx.fillStyle = '#334155'; // Roof border
    ctx.fillRect(0, 0, 128, 4);
    ctx.fillRect(0, 60, 128, 4);
    ctx.fillRect(0, 0, 4, 64);
    ctx.fillRect(124, 0, 4, 64);
    // Roof details (AC, Water tank)
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(20, 20, 24, 24);
    ctx.fillStyle = '#000000'; // Sintex
    ctx.beginPath(); ctx.arc(90, 30, 12, 0, Math.PI*2); ctx.fill();

    // Facade (Bottom 64px)
    ctx.fillStyle = '#e2e8f0'; // plaster
    ctx.fillRect(0, 64, 128, 64);
    
    // Shutters / Shops
    ctx.fillStyle = '#64748b'; // metal shutter
    ctx.fillRect(10, 80, 40, 48);
    for(let i=80; i<128; i+=4) {
      ctx.fillStyle = '#475569';
      ctx.fillRect(10, i, 40, 2);
    }
    // Signboard
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(10, 68, 108, 12);
    ctx.fillStyle = '#fef08a';
    ctx.font = '8px monospace';
    ctx.fillText('GENERAL STORES', 14, 76);

    // Second shop (open)
    ctx.fillStyle = '#0f172a'; // dark interior
    ctx.fillRect(60, 80, 58, 48);
    ctx.fillStyle = '#facc15'; // light
    ctx.fillRect(60, 80, 58, 4);
    // Shelves inside
    ctx.fillStyle = '#78350f';
    ctx.fillRect(64, 90, 50, 4);
    ctx.fillRect(64, 100, 50, 4);
    ctx.fillRect(64, 110, 50, 4);
  });

  createPixelCanvas('building-chawl', 256, 192, (ctx) => {
    // 2.5D Chawl. Top 64px is roof, Bottom 128px is facade (2 floors)
    // Roof Parapet
    ctx.fillStyle = '#334155';
    ctx.fillRect(0, 0, 256, 64);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, 256, 4); // border
    
    // Multiple Tanks and Antennas
    ctx.fillStyle = '#000000';
    ctx.fillRect(40, 10, 30, 20);
    ctx.fillStyle = '#f8fafc'; ctx.fillRect(48, 16, 14, 2); // logo
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(180, 20, 24, 24);
    ctx.fillRect(200, 10, 16, 30);
    // Clotheslines on roof
    ctx.fillStyle = '#94a3b8'; ctx.fillRect(80, 30, 60, 1);
    ctx.fillStyle = '#ef4444'; ctx.fillRect(84, 31, 8, 8);
    ctx.fillStyle = '#facc15'; ctx.fillRect(100, 31, 6, 10);
    ctx.fillStyle = '#3b82f6'; ctx.fillRect(120, 31, 10, 12);

    // Facade Base Plaster
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(0, 64, 256, 128);
    
    // Weathering / Moss
    ctx.fillStyle = '#94a3b8';
    for(let i=0; i<80; i++) ctx.fillRect(Math.random()*256, 64+Math.random()*128, Math.random()*20, Math.random()*6);
    ctx.fillStyle = '#4d7c0f'; // moss near pipes and bottom
    for(let i=0; i<50; i++) ctx.fillRect(Math.random()*256, 180+Math.random()*12, Math.random()*8, Math.random()*4);
    
    // Floor 1 (Y: 64 to 128)
    // Floor 2 (Y: 128 to 192)
    for (let r = 0; r < 2; r++) {
      const y = 64 + r * 64;
      // Shadow behind balcony railing
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(10, y + 24, 236, 40);
      
      // Railing Structure
      ctx.fillStyle = '#64748b'; // stone railing
      ctx.fillRect(10, y + 20, 236, 6);
      for (let x = 10; x < 246; x += 16) {
        ctx.fillRect(x, y + 20, 4, 44);
        // Peeling paint on pillars
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(x, y + 30, 4, 10);
        ctx.fillStyle = '#64748b';
      }

      // Doors and details in shadow
      for (let d = 0; d < 6; d++) {
        const x = 20 + d * 38;
        ctx.fillStyle = '#78350f'; // wood door
        ctx.fillRect(x, y + 24, 18, 40);
        ctx.fillStyle = '#facc15'; // light bulb
        ctx.fillRect(x - 6, y + 28, 4, 4);
        ctx.fillStyle = 'rgba(250, 204, 21, 0.2)'; // glow
        ctx.beginPath(); ctx.arc(x - 4, y + 30, 16, 0, Math.PI*2); ctx.fill();

        // Clothes hanging outside doors
        if (Math.random() > 0.3) {
          ctx.fillStyle = Math.random() > 0.5 ? '#ef4444' : '#3b82f6';
          ctx.fillRect(x + 10, y + 10, 12, 16);
          ctx.fillStyle = '#475569'; // wire
          ctx.fillRect(x + 10, y + 10, 12, 1);
        }
      }
    }
    
    // Outer tangled main electrical wires
    ctx.strokeStyle = '#020617';
    ctx.lineWidth = 1;
    for(let i=0; i<4; i++) {
      ctx.beginPath(); ctx.moveTo(0, 100 + i*15); ctx.quadraticCurveTo(128, 140 + i*5, 256, 110 + i*10); ctx.stroke();
    }
    // Main vertical pipe
    ctx.fillStyle = '#334155'; ctx.fillRect(240, 64, 8, 128);
    ctx.fillStyle = '#0f172a'; for(let i=70; i<192; i+=20) ctx.fillRect(238, i, 12, 4);
  });

  createPixelCanvas('building-res', 128, 128, (ctx) => {
    // Roof
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, 128, 64);
    // Facade
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(0, 64, 128, 64);
    // Window
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(20, 80, 24, 32);
    ctx.fillStyle = '#cbd5e1'; // grills
    ctx.fillRect(30, 80, 2, 32);
    ctx.fillRect(20, 96, 24, 2);
    // Door
    ctx.fillStyle = '#78350f';
    ctx.fillRect(70, 76, 30, 52);
  });

  createPixelCanvas('railway-platform', 256, 128, (ctx) => {
    // 2.5D Platform. Top 64 is roof, bottom 64 is platform floor + train?
    // Platform Floor
    ctx.fillStyle = '#64748b';
    ctx.fillRect(0, 0, 256, 128);
    // Yellow edge
    ctx.fillStyle = '#facc15';
    ctx.fillRect(0, 116, 256, 12);
    // Roof Overhang (Top 64)
    ctx.fillStyle = '#334155';
    ctx.fillRect(0, 0, 256, 64);
    // Pillars
    ctx.fillStyle = '#475569';
    for(let x=20; x<256; x+=80) ctx.fillRect(x, 64, 12, 52);
    // Station Sign
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(100, 20, 56, 20);
    ctx.fillStyle = '#000000';
    ctx.font = '10px monospace';
    ctx.fillText('STATION', 104, 34);
  });

  // 8. NEW MUMBAI PROPS & VEHICLES
  createPixelCanvas('food-cart', 48, 48, (ctx) => {
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath(); ctx.arc(24, 44, 16, 0, Math.PI*2); ctx.fill();
    // Umbrella
    ctx.fillStyle = '#ef4444'; // red/yellow umbrella
    ctx.beginPath(); ctx.arc(24, 16, 20, Math.PI, 0); ctx.fill();
    ctx.fillStyle = '#facc15';
    ctx.beginPath(); ctx.arc(24, 16, 10, Math.PI, 0); ctx.fill();
    // Pole
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(23, 16, 2, 16);
    // Cart Body (Wooden)
  // 2. PLAYER & NPCs
  // 2.5D Player (Head, shoulders, backpack) - 96x128 spritesheet (3 frames wide x 4 directions tall, 32x32 each)
  createPixelCanvas('player-pixel', 96, 128, (ctx) => {
    const drawPlayerFrame = (fx: number, fy: number, dir: 'down'|'up'|'left'|'right', isWalking: boolean, legState: number) => {
      const px = fx * 32;
      const py = fy * 32;
      
      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.beginPath(); ctx.ellipse(px + 16, py + 28, 10, 4, 0, 0, Math.PI * 2); ctx.fill();

      // Legs (Walking animation)
      ctx.fillStyle = '#0f172a'; // dark pants/boots
      if (isWalking) {
        if (legState === 1) { // Left leg forward
          ctx.fillRect(px + 12, py + 24, 4, 6);
          ctx.fillRect(px + 18, py + 22, 4, 6);
        } else { // Right leg forward
          ctx.fillRect(px + 10, py + 22, 4, 6);
          ctx.fillRect(px + 16, py + 24, 4, 6);
        }
      } else {
        ctx.fillRect(px + 12, py + 24, 4, 6);
        ctx.fillRect(px + 16, py + 24, 4, 6);
      }

      // Backpack (drawn before torso if facing up or side)
      if (dir === 'up' || dir === 'left' || dir === 'right') {
        ctx.fillStyle = '#b45309';
        ctx.fillRect(px + 8, py + 12, 16, 12);
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(px + 8, py + 12, 16, 2);
      }

      // Torso (Raincoat)
      ctx.fillStyle = '#ea580c';
      ctx.fillRect(px + 10, py + 14, 12, 10);
      
      // Backpack (drawn after torso if facing down)
      if (dir === 'down') {
        ctx.fillStyle = '#b45309';
        ctx.fillRect(px + 8, py + 12, 16, 12);
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(px + 8, py + 12, 16, 2);
      }

      // Head
      ctx.fillStyle = '#fcd34d'; // skin
      ctx.beginPath(); ctx.arc(px + 16, py + 10, 6, 0, Math.PI * 2); ctx.fill();
      // Hair
      ctx.fillStyle = '#0f172a';
      if (dir === 'up') {
        ctx.beginPath(); ctx.arc(px + 16, py + 10, 6, 0, Math.PI * 2); ctx.fill();
      } else if (dir === 'left') {
        ctx.fillRect(px + 10, py + 4, 6, 10);
      } else if (dir === 'right') {
        ctx.fillRect(px + 16, py + 4, 6, 10);
      } else {
        ctx.beginPath(); ctx.arc(px + 16, py + 8, 6, 0, Math.PI, true); ctx.fill();
      }

      // Flashlight (Only visible if facing down or side)
      if (dir !== 'up') {
        const lx = dir === 'left' ? px + 8 : px + 22;
        ctx.fillStyle = '#334155';
        ctx.fillRect(lx, py + 16, 4, 6);
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(lx + 1, py + 22, 2, 2);
      }
    };

    // Draw grid of frames
    const dirs: ('down'|'up'|'left'|'right')[] = ['down', 'up', 'left', 'right'];
    dirs.forEach((dir, row) => {
      drawPlayerFrame(0, row, dir, false, 0); // Idle
      drawPlayerFrame(1, row, dir, true, 1);  // Walk 1
      drawPlayerFrame(2, row, dir, true, 2);  // Walk 2
    });
  });

  // 2.5D Civilians
  const createCivilian25D = (id: string, color: string, skin: string, hasUmbrella: boolean, hasBag: boolean) => {
    createPixelCanvas(id, 32, 32, (ctx) => {
      // shadow
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.beginPath(); ctx.ellipse(16, 28, 8, 3, 0, 0, Math.PI * 2); ctx.fill();
      
      // Torso
      ctx.fillStyle = color;
      ctx.fillRect(11, 14, 10, 10);
      ctx.fillStyle = 'rgba(0,0,0,0.2)'; // wet/shadow
      ctx.fillRect(11, 20, 10, 4);

      // Legs
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(12, 24, 3, 4);
      ctx.fillRect(17, 24, 3, 4);
      
      // Head
      ctx.fillStyle = skin;
      ctx.beginPath(); ctx.arc(16, 10, 5, 0, Math.PI * 2); ctx.fill();
      
      // Hair
      ctx.fillStyle = '#1e293b';
      if (!hasUmbrella) {
        ctx.beginPath(); ctx.arc(16, 8, 5, 0, Math.PI, true); ctx.fill();
      }

      // Bag
      if (hasBag) {
        ctx.fillStyle = '#78350f'; // brown bag
        ctx.fillRect(6, 16, 6, 8);
        ctx.fillStyle = '#d97706';
        ctx.fillRect(6, 16, 6, 2);
      }

      // Umbrella
      if (hasUmbrella) {
        ctx.fillStyle = '#0f172a'; // stick
        ctx.fillRect(18, 12, 2, 10);
        ctx.fillStyle = '#ef4444'; // red umbrella
        ctx.beginPath(); ctx.arc(16, 6, 12, Math.PI, 0); ctx.fill();
        ctx.fillStyle = '#fca5a5'; // highlight
        ctx.fillRect(8, 2, 16, 2);
      }
    });
  };

  createCivilian25D('civilian-normal', '#3b82f6', '#fcd34d', true, false);
  createCivilian25D('civilian-child', '#22c55e', '#fde68a', false, true);
  createCivilian25D('civilian-injured', '#ef4444', '#f87171', false, false);
  createCivilian25D('civilian-elderly', '#a855f7', '#d1d5db', true, true);

  // 3. INTERACTABLES
  createPixelCanvas('door-pixel', 32, 48, (ctx) => {
    // Wall cutout
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, 32, 48);
    // Door frame
    ctx.fillStyle = '#78350f';
    ctx.fillRect(2, 2, 28, 46);
    // Door
    ctx.fillStyle = '#92400e';
    ctx.fillRect(4, 4, 24, 44);
    // Panels
    ctx.fillStyle = '#78350f';
    ctx.fillRect(6, 6, 20, 16);
    ctx.fillRect(6, 24, 20, 20);
    // Handle
    ctx.fillStyle = '#fcd34d';
    ctx.beginPath(); ctx.arc(24, 24, 2, 0, Math.PI * 2); ctx.fill();
  });
    ctx.fillRect(8, 32, 32, 2); // Counter top
    // Wheels
    ctx.fillStyle = '#0f172a';
    ctx.beginPath(); ctx.arc(14, 44, 4, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(34, 44, 4, 0, Math.PI*2); ctx.fill();
    // Pans / Food / Vada Pav
    ctx.fillStyle = '#475569';
    ctx.fillRect(12, 30, 10, 2); // pan
    ctx.fillStyle = '#eab308'; // vada pav / bhajiya
    ctx.fillRect(14, 28, 6, 2);
    ctx.fillStyle = '#f97316'; // chutney
    ctx.fillRect(26, 30, 4, 2);
  });

  createPixelCanvas('street-light', 32, 64, (ctx) => {
    // Base
    ctx.fillStyle = '#334155';
    ctx.fillRect(12, 56, 8, 8);
    // Pole
    ctx.fillStyle = '#64748b';
    ctx.fillRect(14, 8, 4, 48);
    // Arm
    ctx.fillRect(14, 8, 14, 4);
    // Light
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(24, 12, 6, 4);
    // Glow
    ctx.fillStyle = 'rgba(254, 240, 138, 0.2)';
    ctx.beginPath(); ctx.moveTo(27, 16); ctx.lineTo(10, 64); ctx.lineTo(44, 64); ctx.fill();
  });

  createPixelCanvas('barricade', 48, 32, (ctx) => {
    // Mumbai Police style yellow barricade
    ctx.fillStyle = '#facc15';
    ctx.fillRect(4, 8, 40, 20);
    ctx.fillStyle = '#0f172a'; // black text/stripes
    ctx.fillRect(8, 12, 32, 4);
    ctx.fillRect(8, 20, 32, 4);
    // Legs
    ctx.fillStyle = '#64748b';
    ctx.fillRect(6, 28, 4, 4);
    ctx.fillRect(38, 28, 4, 4);
  });

  createPixelCanvas('taxi-pixel', 64, 32, (ctx) => {
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(4, 26, 56, 6);
    // Kaali-Peeli Taxi
    ctx.fillStyle = '#0f172a'; // black bottom
    ctx.fillRect(6, 16, 52, 10);
    // Highlight
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(6, 16, 52, 2);
    ctx.fillStyle = '#facc15'; // yellow top
    ctx.fillRect(14, 4, 34, 12);
    // Windows
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(18, 6, 10, 8);
    ctx.fillRect(32, 6, 12, 8);
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.fillRect(20, 6, 4, 8);
    // Wheels
    ctx.fillStyle = '#020617';
    ctx.fillRect(12, 24, 8, 8);
    ctx.fillRect(44, 24, 8, 8);
  });

  createPixelCanvas('scooter-pixel', 32, 32, (ctx) => {
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(2, 28, 28, 4);
    // Body (white/gray scooter)
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(6, 16, 20, 8);
    ctx.fillStyle = '#e2e8f0'; // shading
    ctx.fillRect(6, 20, 20, 4);
    ctx.fillRect(22, 10, 6, 10); // front panel
    // Seat
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(8, 14, 12, 4);
    // Handlebar
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(24, 8, 2, 2);
    // Wheels
    ctx.fillStyle = '#020617';
    ctx.beginPath(); ctx.arc(8, 26, 4, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(24, 26, 4, 0, Math.PI*2); ctx.fill();
  });
}
