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

  // Helper for drawing 2.5D boxes (buildings/vehicles)
  const drawBox = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, depth: number, topColor: string, frontColor: string, sideColor?: string) => {
    // Front face
    ctx.fillStyle = frontColor;
    ctx.fillRect(x, y, w, h);
    // Top face
    ctx.fillStyle = topColor;
    ctx.fillRect(x, y - depth, w, depth);
    // Side face (optional, if angled)
    if (sideColor) {
      ctx.fillStyle = sideColor;
      ctx.fillRect(x + w, y - depth, depth * 0.5, h + depth);
    }
  };

  // 1. PLAYER SPRITESHEET (128x32 - 4 directions: Down, Up, Left, Right; 32x32 per frame)
  // HIGH QUALITY 2.5D RESCUE WORKER
  createPixelCanvas('player-pixel', 128, 32, (ctx) => {
    for (let dir = 0; dir < 4; dir++) {
      const oX = dir * 32;
      
      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.beginPath(); ctx.ellipse(oX + 16, 28, 8, 3, 0, 0, Math.PI*2); ctx.fill();

      // Boots
      ctx.fillStyle = '#1e293b'; // dark slate
      if (dir === 0) { ctx.fillRect(oX + 11, 24, 4, 4); ctx.fillRect(oX + 17, 24, 4, 4); }
      if (dir === 1) { ctx.fillRect(oX + 11, 24, 4, 4); ctx.fillRect(oX + 17, 24, 4, 4); }
      if (dir === 2) { ctx.fillRect(oX + 12, 24, 6, 4); }
      if (dir === 3) { ctx.fillRect(oX + 14, 24, 6, 4); }

      // Body / Raincoat (Orange)
      ctx.fillStyle = '#f97316';
      ctx.fillRect(oX + 10, 12, 12, 14);
      // Coat shading
      ctx.fillStyle = '#c2410c';
      ctx.fillRect(oX + 10, 12, 2, 14); // left shadow
      ctx.fillRect(oX + 20, 12, 2, 14); // right shadow

      // Reflective Strips (Neon Cyan)
      ctx.fillStyle = '#22d3ee';
      if (dir === 0 || dir === 1) {
        ctx.fillRect(oX + 10, 16, 12, 2);
        ctx.fillRect(oX + 10, 22, 12, 2);
      } else {
        ctx.fillRect(oX + 12, 16, 8, 2);
      }

      // Backpack (Dark Grey)
      ctx.fillStyle = '#334155';
      if (dir === 1) { ctx.fillRect(oX + 8, 10, 16, 12); } // UP
      if (dir === 2) { ctx.fillRect(oX + 18, 10, 6, 10); } // LEFT
      if (dir === 3) { ctx.fillRect(oX + 8, 10, 6, 10); } // RIGHT

      // Head / Helmet (Yellow)
      ctx.fillStyle = '#eab308';
      ctx.fillRect(oX + 10, 4, 12, 9);
      // Helmet highlight
      ctx.fillStyle = '#fde047';
      ctx.fillRect(oX + 12, 4, 6, 2);
      // Helmet rim
      ctx.fillStyle = '#854d0e';
      if (dir === 0) ctx.fillRect(oX + 9, 11, 14, 2);

      // Face/Skin
      ctx.fillStyle = '#fcd34d'; // skin
      if (dir === 0) {
        ctx.fillRect(oX + 13, 8, 6, 4);
        ctx.fillStyle = '#451a03'; // eyes
        ctx.fillRect(oX + 14, 9, 1, 1);
        ctx.fillRect(oX + 17, 9, 1, 1);
      } else if (dir === 2) {
        ctx.fillRect(oX + 10, 8, 4, 4);
        ctx.fillStyle = '#451a03'; ctx.fillRect(oX + 11, 9, 1, 1);
      } else if (dir === 3) {
        ctx.fillRect(oX + 18, 8, 4, 4);
        ctx.fillStyle = '#451a03'; ctx.fillRect(oX + 20, 9, 1, 1);
      }
    }
  });

  // 2. CIVILIANS (32x32) - More variety and depth
  const drawCivBase = (ctx: CanvasRenderingContext2D, shirt: string, pant: string, hair: string, hasUmbrella: boolean = false) => {
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath(); ctx.ellipse(16, 28, 8, 3, 0, 0, Math.PI*2); ctx.fill();

    ctx.fillStyle = pant;
    ctx.fillRect(12, 20, 8, 8); // pants
    ctx.fillStyle = 'rgba(0,0,0,0.2)'; // pant shade
    ctx.fillRect(16, 20, 4, 8);

    ctx.fillStyle = shirt;
    ctx.fillRect(11, 11, 10, 10); // shirt
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(11, 11, 2, 10);

    ctx.fillStyle = '#fcd34d'; // skin
    ctx.fillRect(12, 6, 8, 6);
    
    ctx.fillStyle = hair; // hair
    ctx.fillRect(12, 4, 8, 3);
    ctx.fillRect(12, 4, 2, 5);

    if (hasUmbrella) {
      ctx.fillStyle = '#1d4ed8'; // blue umbrella
      ctx.beginPath(); ctx.arc(16, 8, 12, Math.PI, 0); ctx.fill();
      ctx.fillStyle = '#2563eb';
      ctx.beginPath(); ctx.arc(16, 8, 10, Math.PI, 0); ctx.fill();
      ctx.fillStyle = '#0f172a'; // stick
      ctx.fillRect(15, 8, 2, 8);
    }
  };

  createPixelCanvas('civilian-normal', 32, 32, (ctx) => drawCivBase(ctx, '#3b82f6', '#334155', '#451a03'));
  createPixelCanvas('civilian-elderly', 32, 32, (ctx) => drawCivBase(ctx, '#059669', '#e2e8f0', '#cbd5e1', true));
  createPixelCanvas('civilian-injured', 32, 32, (ctx) => drawCivBase(ctx, '#dc2626', '#1e293b', '#171717'));
  createPixelCanvas('civilian-child', 32, 32, (ctx) => {
    ctx.scale(0.8, 0.8);
    drawCivBase(ctx, '#facc15', '#0ea5e9', '#451a03');
    ctx.scale(1.25, 1.25);
  });

  // 3. VEHICLES (High Quality 2.5D)
  // Auto Rickshaw (Yellow/Black)
  createPixelCanvas('auto-rickshaw', 64, 48, (ctx) => {
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(6, 36, 52, 10);
    
    // Front wheel
    ctx.fillStyle = '#171717'; ctx.fillRect(12, 38, 6, 8);
    // Back wheels
    ctx.fillRect(44, 38, 6, 8);
    ctx.fillRect(44, 28, 6, 8);
    
    // Body (Yellow)
    ctx.fillStyle = '#eab308';
    ctx.fillRect(8, 20, 48, 18);
    // Top roof (Black)
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(10, 4, 44, 16);
    
    // Side Window
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(24, 10, 20, 10);
    // Front Windshield
    ctx.fillStyle = '#0ea5e9';
    ctx.fillRect(10, 10, 10, 12);
    
    // Headlight
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(6, 26, 4, 6);
  });

  // BEST Bus (Red)
  createPixelCanvas('bus-red', 128, 64, (ctx) => {
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(10, 52, 108, 12);
    
    // Wheels
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(24, 50, 12, 14);
    ctx.fillRect(90, 50, 12, 14);

    // Main Body
    ctx.fillStyle = '#b91c1c'; // deep red
    ctx.fillRect(10, 20, 108, 32);
    ctx.fillStyle = '#dc2626'; // upper half lighter red
    ctx.fillRect(10, 8, 108, 12);

    // Roof
    ctx.fillStyle = '#f87171';
    ctx.fillRect(10, 2, 108, 6);

    // Windows
    ctx.fillStyle = '#0284c7';
    for(let i=0; i<6; i++) {
      ctx.fillRect(16 + (i * 16), 10, 12, 12);
    }

    // Front Window
    ctx.fillStyle = '#0369a1';
    ctx.fillRect(110, 10, 6, 12);

    // Doors
    ctx.fillStyle = '#e5e5e5';
    ctx.fillRect(20, 24, 12, 26);
    ctx.fillRect(80, 24, 12, 26);

    // Highlights & Stripes
    ctx.fillStyle = '#fde047'; // yellow stripe
    ctx.fillRect(10, 36, 108, 2);
  });

  // Private Car (Sedan)
  createPixelCanvas('car-white', 64, 48, (ctx) => {
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(6, 36, 52, 10);
    
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(14, 38, 8, 8); ctx.fillRect(42, 38, 8, 8);

    ctx.fillStyle = '#e2e8f0'; // body
    ctx.fillRect(8, 24, 48, 16);
    ctx.fillStyle = '#f8fafc'; // roof
    ctx.fillRect(16, 12, 32, 12);

    ctx.fillStyle = '#38bdf8'; // windows
    ctx.fillRect(18, 14, 12, 10);
    ctx.fillRect(32, 14, 12, 10);

    ctx.fillStyle = '#fbbf24'; // headlight
    ctx.fillRect(6, 28, 4, 6);
    ctx.fillStyle = '#ef4444'; // taillight
    ctx.fillRect(54, 28, 4, 6);
  });

  // 4. BUILDINGS (2.5D Highly Detailed)
  const drawDetailedBuilding = (ctx: CanvasRenderingContext2D, w: number, h: number, facadeColor: string, roofColor: string, hasAwning: boolean = false) => {
    const depth = 40; // fake roof depth

    // Facade
    ctx.fillStyle = facadeColor;
    ctx.fillRect(0, depth, w, h - depth);
    // Shade left edge
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(0, depth, 16, h - depth);

    // Roof
    ctx.fillStyle = roofColor;
    ctx.fillRect(0, 0, w, depth);
    // Roof Parapet / Border
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(0, 0, w, 4);
    ctx.fillRect(0, depth - 4, w, 4);

    // Windows (Mumbai style with grills)
    for(let wy = depth + 20; wy < h - 40; wy += 40) {
      for(let wx = 20; wx < w - 30; wx += 50) {
        // Window frame
        ctx.fillStyle = '#475569';
        ctx.fillRect(wx, wy, 24, 24);
        // Glass
        ctx.fillStyle = '#0ea5e9';
        ctx.fillRect(wx+2, wy+2, 20, 20);
        // Grills
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(wx+10, wy, 2, 24);
        ctx.fillRect(wx, wy+10, 24, 2);
        // AC Unit below window
        if (Math.random() > 0.5) {
          ctx.fillStyle = '#cbd5e1';
          ctx.fillRect(wx+4, wy+26, 16, 10);
          ctx.fillStyle = '#64748b'; // AC fan
          ctx.beginPath(); ctx.arc(wx+12, wy+31, 3, 0, Math.PI*2); ctx.fill();
        }
      }
    }

    // Shop Awning at bottom
    if (hasAwning) {
      // Striped Awning
      const cols = ['#ef4444', '#f8fafc'];
      for(let i=0; i<w/10; i++) {
        ctx.fillStyle = cols[i % 2];
        ctx.fillRect(i*10, h - 30, 10, 20);
      }
      // Shop interior
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(10, h - 10, w - 20, 10);
    }
  };

  createPixelCanvas('building-chawl', 256, 192, (ctx) => {
    drawDetailedBuilding(ctx, 256, 192, '#fca5a5', '#991b1b');
    // Add hanging clothes
    ctx.fillStyle = '#3b82f6'; ctx.fillRect(40, 80, 8, 12);
    ctx.fillStyle = '#fde047'; ctx.fillRect(52, 80, 10, 14);
  });
  
  createPixelCanvas('building-block', 384, 256, (ctx) => {
    drawDetailedBuilding(ctx, 384, 256, '#cbd5e1', '#64748b', true);
  });

  createPixelCanvas('building-office', 256, 256, (ctx) => {
    drawDetailedBuilding(ctx, 256, 256, '#0ea5e9', '#334155');
  });

  createPixelCanvas('railway-platform', 256, 128, (ctx) => {
    // Platform
    ctx.fillStyle = '#64748b';
    ctx.fillRect(0, 20, 256, 108);
    // Yellow edge
    ctx.fillStyle = '#eab308';
    ctx.fillRect(0, 108, 256, 8);
    // Roof
    ctx.fillStyle = '#334155';
    ctx.fillRect(0, 0, 256, 20);
    // Pillars
    ctx.fillStyle = '#475569';
    for(let px=20; px<250; px+=60) {
      ctx.fillRect(px, 20, 8, 80);
    }
  });

  // 5. ROAD TEXTURE (Highly textured asphalt)
  createPixelCanvas('road-texture', 256, 256, (ctx) => {
    // Base dark asphalt
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, 256, 256);
    
    // Noise loop for asphalt
    for(let i=0; i<2000; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? '#334155' : '#0f172a';
      ctx.fillRect(Math.random()*256, Math.random()*256, 2, 2);
    }

    // Faded Yellow Lane Markings
    ctx.fillStyle = 'rgba(250, 204, 21, 0.4)';
    for(let i=0; i<256; i+=40) {
      ctx.fillRect(124, i, 8, 24);
    }

    // Potholes
    ctx.fillStyle = '#020617';
    ctx.beginPath(); ctx.ellipse(40, 60, 12, 6, 0, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(200, 180, 20, 10, 0, 0, Math.PI*2); ctx.fill();

    // Small puddles (reflective)
    ctx.fillStyle = 'rgba(14, 165, 233, 0.3)';
    ctx.beginPath(); ctx.ellipse(42, 62, 10, 5, 0, 0, Math.PI*2); ctx.fill();
  });

  // 6. WATER / FLOOD TEXTURE (Detailed waves)
  createPixelCanvas('water-texture', 128, 128, (ctx) => {
    // Base dirty flood water
    ctx.fillStyle = 'rgba(8, 145, 178, 0.85)';
    ctx.fillRect(0, 0, 128, 128);

    // Wave ripples
    ctx.fillStyle = 'rgba(34, 211, 238, 0.4)';
    for(let i=0; i<40; i++) {
      const wx = Math.random() * 128;
      const wy = Math.random() * 128;
      ctx.fillRect(wx, wy, Math.random()*16 + 8, 2);
    }

    // Darker depth patches
    ctx.fillStyle = 'rgba(15, 23, 42, 0.4)';
    for(let i=0; i<10; i++) {
      ctx.beginPath();
      ctx.ellipse(Math.random()*128, Math.random()*128, 20, 10, 0, 0, Math.PI*2);
      ctx.fill();
    }
  });

  // 7. VEGETATION
  createPixelCanvas('tree-pixel', 64, 80, (ctx) => {
    // shadow
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath(); ctx.ellipse(32, 70, 20, 8, 0, 0, Math.PI*2); ctx.fill();
    
    // Trunk
    ctx.fillStyle = '#451a03'; 
    ctx.fillRect(28, 40, 8, 34);
    ctx.fillStyle = '#78350f'; 
    ctx.fillRect(28, 40, 4, 34);

    // Detailed Pixel Leaves
    const drawLeafBlock = (x: number, y: number, w: number, h: number) => {
      ctx.fillStyle = '#064e3b';
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = '#047857';
      for(let i=0; i<12; i++) ctx.fillRect(x + Math.random()*(w-4), y + Math.random()*(h-4), 4, 4);
      ctx.fillStyle = '#10b981';
      for(let i=0; i<6; i++) ctx.fillRect(x + Math.random()*(w-2), y + Math.random()*(h-2), 2, 2);
    };

    drawLeafBlock(12, 10, 40, 30);
    drawLeafBlock(4, 20, 24, 20);
    drawLeafBlock(36, 16, 24, 24);
    drawLeafBlock(20, 2, 24, 16);
  });

  createPixelCanvas('grass-patch', 48, 48, (ctx) => {
    ctx.fillStyle = '#14532d'; // Mud base
    ctx.beginPath(); ctx.ellipse(24, 24, 20, 10, 0, 0, Math.PI*2); ctx.fill();

    for (let i = 0; i < 40; i++) {
      const gx = 8 + Math.random() * 32;
      const gy = 16 + Math.random() * 16;
      const gh = 4 + Math.random() * 8;
      ctx.fillStyle = Math.random() > 0.5 ? '#065f46' : '#10b981'; 
      ctx.fillRect(Math.floor(gx), Math.floor(gy) - Math.floor(gh), 2, Math.floor(gh));
    }
  });

  // 8. PROPS
  createPixelCanvas('barricade', 48, 32, (ctx) => {
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(4, 28, 40, 4);
    ctx.fillStyle = '#facc15'; ctx.fillRect(4, 8, 40, 16);
    ctx.fillStyle = '#1e293b'; // black stripes
    ctx.fillRect(8, 8, 6, 16); ctx.fillRect(20, 8, 6, 16); ctx.fillRect(32, 8, 6, 16);
    ctx.fillStyle = '#94a3b8'; // legs
    ctx.fillRect(6, 24, 4, 6); ctx.fillRect(38, 24, 4, 6);
  });

  createPixelCanvas('food-cart', 48, 48, (ctx) => {
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(6, 40, 36, 6); // shadow
    ctx.fillStyle = '#d97706'; ctx.fillRect(8, 24, 32, 16); // wood cart base
    ctx.fillStyle = '#1e293b'; ctx.fillRect(10, 36, 8, 8); ctx.fillRect(30, 36, 8, 8); // wheels
    ctx.fillStyle = '#0ea5e9'; ctx.fillRect(4, 4, 40, 12); // blue tarp roof
    ctx.fillStyle = '#94a3b8'; ctx.fillRect(8, 16, 2, 8); ctx.fillRect(38, 16, 2, 8); // poles
  });

  // Additional props
  createPixelCanvas('debris-pixel', 32, 32, (ctx) => {
    ctx.fillStyle = '#475569';
    for(let i=0; i<8; i++) {
      ctx.fillRect(Math.random()*24, Math.random()*24, 8, 8);
    }
  });

  createPixelCanvas('safezone-pixel', 128, 128, (ctx) => {
    ctx.fillStyle = '#334155'; ctx.fillRect(8, 8, 112, 112);
    ctx.fillStyle = '#475569'; ctx.fillRect(12, 12, 104, 104);
    ctx.fillStyle = 'rgba(34, 197, 94, 0.3)'; ctx.fillRect(24, 24, 80, 80);
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(56, 32, 16, 64);
    ctx.fillRect(32, 56, 64, 16);
  });
}
