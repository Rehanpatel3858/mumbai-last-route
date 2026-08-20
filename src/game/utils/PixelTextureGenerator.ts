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
    // Brick base
    ctx.fillStyle = '#78350f';
    ctx.fillRect(0, 0, 128, 128);
    ctx.fillStyle = '#92400e';
    for (let by = 0; by < 128; by += 8) {
      for (let bx = (by % 16 === 0 ? 0 : 8); bx < 128; bx += 16) {
        ctx.fillRect(bx, by, 14, 7);
      }
    }
    // Upper floor windows
    drawWindow(ctx, 16, 16, true);
    drawWindow(ctx, 48, 16, false);
    drawWindow(ctx, 80, 16, true);

    // Shop front ground floor
    ctx.fillStyle = '#0f172a'; // dark interior
    ctx.fillRect(10, 70, 108, 58);
    // Shop counter / goods
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(16, 90, 40, 20);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(20, 80, 10, 10);
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(35, 80, 10, 10);
    // Shop sign
    ctx.fillStyle = '#1d4ed8'; // blue sign
    ctx.fillRect(10, 56, 108, 14);
    ctx.fillStyle = '#ffffff'; // marathi/english text squiggle
    ctx.fillRect(14, 60, 40, 6);
    ctx.fillRect(60, 60, 40, 6);
    // Awning (Orange/White striped)
    for (let i = 0; i < 112; i += 8) {
      ctx.fillStyle = (i % 16 === 0) ? '#f97316' : '#f8fafc';
      ctx.fillRect(8 + i, 70, 8, 12);
    }
  });

  createPixelCanvas('building-res', 128, 128, (ctx) => {
    // Plaster wall
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(0, 0, 128, 128);
    ctx.fillStyle = '#94a3b8'; // weathering
    ctx.fillRect(0, 0, 10, 128);
    ctx.fillRect(118, 0, 10, 128);
    ctx.fillRect(0, 118, 128, 10);
    
    // 3x2 Window grid
    for(let r = 0; r < 3; r++) {
      for(let c = 0; c < 3; c++) {
        drawWindow(ctx, 16 + c * 36, 16 + r * 36, Math.random() > 0.3);
      }
    }
    // Pipes & wires
    ctx.fillStyle = '#334155';
    ctx.fillRect(112, 0, 4, 128); // main pipe
    ctx.fillRect(108, 40, 8, 4); // junction
  });

  // 4. ROADS, SIDEWALKS & WATER
  createPixelCanvas('road-tile', 64, 64, (ctx) => {
    ctx.fillStyle = '#1e293b'; // dark asphalt
    ctx.fillRect(0, 0, 64, 64);
    // Cracks / texture (NO CIRCLES)
    ctx.fillStyle = '#0f172a';
    for(let i=0; i<30; i++) {
      ctx.fillRect(Math.random()*64, Math.random()*64, Math.random()*4+2, Math.random()*2+1);
    }
    // Minor lighter pebbles
    ctx.fillStyle = '#334155';
    for(let i=0; i<15; i++) {
      ctx.fillRect(Math.random()*64, Math.random()*64, 2, 2);
    }
  });

  createPixelCanvas('road-line-v', 64, 64, (ctx) => {
    ctx.fillStyle = '#1e293b'; ctx.fillRect(0, 0, 64, 64); // asphalt base
    ctx.fillStyle = '#facc15'; // yellow dashed line
    ctx.fillRect(30, 0, 4, 24);
    ctx.fillRect(30, 40, 4, 24);
  });

  createPixelCanvas('road-line-h', 64, 64, (ctx) => {
    ctx.fillStyle = '#1e293b'; ctx.fillRect(0, 0, 64, 64); // asphalt base
    ctx.fillStyle = '#facc15'; // yellow dashed line
    ctx.fillRect(0, 30, 24, 4);
    ctx.fillRect(40, 30, 24, 4);
  });

  createPixelCanvas('sidewalk-tile', 64, 64, (ctx) => {
    ctx.fillStyle = '#64748b'; // concrete
    ctx.fillRect(0, 0, 64, 64);
    ctx.fillStyle = '#475569'; // pavement lines
    ctx.fillRect(0, 0, 64, 2);
    ctx.fillRect(0, 32, 64, 2);
    ctx.fillRect(0, 0, 2, 64);
    ctx.fillRect(32, 0, 2, 64);
    // Curb edge (bottom)
    ctx.fillStyle = '#facc15'; // yellow curb
    ctx.fillRect(0, 58, 64, 6);
    ctx.fillStyle = '#0f172a'; // black curb stripes
    for(let x=0; x<64; x+=16) ctx.fillRect(x, 58, 8, 6);
  });

  createPixelCanvas('water-anim', 256, 64, (ctx) => {
    for (let f = 0; f < 4; f++) {
      const oX = f * 64;
      ctx.fillStyle = 'rgba(12, 74, 110, 0.7)'; // dark flood water
      ctx.fillRect(oX, 0, 64, 64);
      
      // Moving ripples
      ctx.fillStyle = 'rgba(56, 189, 248, 0.4)'; // cyan ripples
      const s = f * 4;
      ctx.fillRect(oX + ((10 + s) % 64), 16, 16, 2);
      ctx.fillRect(oX + ((40 + s) % 64), 32, 24, 2);
      ctx.fillRect(oX + ((20 + s) % 64), 48, 12, 2);
    }
  });

  // 5. VEHICLES & PROPS
  createPixelCanvas('bus-detailed', 128, 64, (ctx) => {
    // shadow
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(8, 50, 112, 14);

    // Body
    ctx.fillStyle = '#dc2626'; // Bright RED BEST BUS
    ctx.fillRect(10, 10, 108, 44);
    // Highlight
    ctx.fillStyle = '#f87171';
    ctx.fillRect(10, 10, 108, 4);
    
    ctx.fillStyle = '#991b1b'; // lower dark body
    ctx.fillRect(10, 36, 108, 18);
    // Yellow stripe
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(10, 34, 108, 2);
    // Windows
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(16, 16, 96, 14);
    // Window reflections
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.beginPath(); ctx.moveTo(20, 16); ctx.lineTo(16, 30); ctx.lineTo(26, 30); ctx.lineTo(30, 16); ctx.fill();
    ctx.beginPath(); ctx.moveTo(50, 16); ctx.lineTo(46, 30); ctx.lineTo(56, 30); ctx.lineTo(60, 16); ctx.fill();
    
    ctx.fillStyle = '#64748b'; // pillars
    for(let i=0; i<6; i++) ctx.fillRect(26 + i*16, 16, 4, 14);
    // Wheels
    ctx.fillStyle = '#020617';
    ctx.fillRect(24, 52, 16, 10);
    ctx.fillRect(88, 52, 16, 10);
    ctx.fillStyle = '#94a3b8'; // hubcaps
    ctx.fillRect(28, 54, 8, 6);
    ctx.fillRect(92, 54, 8, 6);
    // Details
    ctx.fillStyle = '#fef08a'; // headlights
    ctx.fillRect(116, 42, 4, 6);
    ctx.fillStyle = '#ef4444'; // taillights
    ctx.fillRect(10, 42, 4, 6);
    // Sign
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(44, 4, 40, 8);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(48, 6, 32, 4); // text squiggles
  });

  createPixelCanvas('auto-rickshaw', 48, 32, (ctx) => {
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(4, 26, 40, 6);
    // Yellow top
    ctx.fillStyle = '#eab308';
    ctx.fillRect(6, 4, 36, 14);
    ctx.fillStyle = '#fde047'; // highlight
    ctx.fillRect(6, 4, 36, 2);
    // Black bottom
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(6, 18, 36, 8);
    // Windows
    ctx.fillStyle = '#0f172a'; // dark inside
    ctx.fillRect(28, 8, 10, 8);
    ctx.fillStyle = 'rgba(255,255,255,0.2)'; // reflection
    ctx.fillRect(30, 8, 4, 8);
    ctx.fillStyle = '#1e293b'; // frame
    ctx.fillRect(24, 8, 4, 10);
    // Wheels
    ctx.fillStyle = '#020617';
    ctx.fillRect(10, 26, 8, 6);
    ctx.fillRect(32, 26, 8, 6);
    // Front wheel connector
    ctx.fillStyle = '#475569';
    ctx.fillRect(36, 20, 2, 6);
  });

  createPixelCanvas('car-pixel', 64, 32, (ctx) => {
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(4, 26, 56, 6);
    // Blue body
    ctx.fillStyle = '#2563eb';
    ctx.fillRect(6, 12, 52, 14);
    ctx.fillStyle = '#60a5fa'; // highlight
    ctx.fillRect(6, 12, 52, 2);
    // Roof
    ctx.fillStyle = '#1d4ed8';
    ctx.fillRect(16, 4, 30, 8);
    // Windows
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(18, 6, 10, 6);
    ctx.fillRect(30, 6, 12, 6);
    ctx.fillStyle = 'rgba(255,255,255,0.2)'; // reflection
    ctx.fillRect(20, 6, 4, 6);
    ctx.fillRect(34, 6, 4, 6);
    // Wheels
    ctx.fillStyle = '#020617';
    ctx.fillRect(12, 26, 10, 6);
    ctx.fillRect(42, 26, 10, 6);
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
    // Roof
    ctx.fillStyle = '#334155';
    ctx.fillRect(0, 0, 256, 64);
    // Tanks
    ctx.fillStyle = '#000000';
    ctx.fillRect(40, 10, 30, 20);
    ctx.fillRect(180, 20, 24, 24);

    // Facade
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(0, 64, 256, 128);

    // Floor 1 (Y: 64 to 128)
    // Floor 2 (Y: 128 to 192)
    for (let r = 0; r < 2; r++) {
      const y = 64 + r * 64;
      // Balcony
      ctx.fillStyle = '#0f172a'; // shadow behind railing
      ctx.fillRect(10, y + 24, 236, 40);
      
      // Railing
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(10, y + 20, 236, 4);
      for (let x = 10; x < 246; x += 12) ctx.fillRect(x, y + 20, 2, 44);

      // Doors in shadow
      for (let d = 0; d < 6; d++) {
        const x = 20 + d * 38;
        ctx.fillStyle = '#78350f'; // wood door
        ctx.fillRect(x, y + 24, 18, 40);
        // Clothes hanging
        if (Math.random() > 0.4) {
          ctx.fillStyle = Math.random() > 0.5 ? '#ef4444' : '#3b82f6';
          ctx.fillRect(x + 10, y + 10, 12, 16);
          ctx.fillStyle = '#475569'; // wire
          ctx.fillRect(x + 10, y + 10, 12, 1);
        }
      }
    }
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
  // 2.5D Player (Head, shoulders, backpack)
  createPixelCanvas('player-pixel', 32, 32, (ctx) => {
    // shadow
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath(); ctx.ellipse(16, 28, 10, 4, 0, 0, Math.PI * 2); ctx.fill();
    
    // Backpack
    ctx.fillStyle = '#b45309';
    ctx.fillRect(8, 12, 16, 12);
    ctx.fillStyle = '#f59e0b'; // bag highlight
    ctx.fillRect(8, 12, 16, 2);

    // Torso (Raincoat)
    ctx.fillStyle = '#ea580c';
    ctx.fillRect(10, 14, 12, 10);

    // Head
    ctx.fillStyle = '#fcd34d'; // skin
    ctx.beginPath(); ctx.arc(16, 10, 6, 0, Math.PI * 2); ctx.fill();
    // Hair
    ctx.fillStyle = '#0f172a';
    ctx.beginPath(); ctx.arc(16, 8, 6, 0, Math.PI, true); ctx.fill();

    // Flashlight
    ctx.fillStyle = '#334155';
    ctx.fillRect(22, 16, 4, 6);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(23, 22, 2, 2);
  });

  // 2.5D Civilians
  const createCivilian25D = (id: string, color: string, skin: string) => {
    createPixelCanvas(id, 32, 32, (ctx) => {
      // shadow
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.beginPath(); ctx.ellipse(16, 28, 8, 3, 0, 0, Math.PI * 2); ctx.fill();
      
      // Torso
      ctx.fillStyle = color;
      ctx.fillRect(11, 14, 10, 10);
      
      // Head
      ctx.fillStyle = skin;
      ctx.beginPath(); ctx.arc(16, 10, 5, 0, Math.PI * 2); ctx.fill();
      // Hair
      ctx.fillStyle = '#475569';
      ctx.beginPath(); ctx.arc(16, 8, 5, 0, Math.PI, true); ctx.fill();
    });
  };

  createCivilian25D('civilian-normal', '#3b82f6', '#fcd34d');
  createCivilian25D('civilian-child', '#22c55e', '#fde68a');
  createCivilian25D('civilian-injured', '#ef4444', '#f87171');
  createCivilian25D('civilian-elderly', '#a855f7', '#d1d5db');

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
