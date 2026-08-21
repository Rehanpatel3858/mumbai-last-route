import Phaser from 'phaser';

export function generateGameTextures(scene: Phaser.Scene) {
  const textures = scene.textures;

  // 1. Player Sprite (48x48)
  if (!textures.exists('player')) {
    const canvas = scene.textures.createCanvas('player', 48, 48);
    if (canvas) {
      const ctx = canvas.getContext();
      // Outer glow
      const grad = ctx.createRadialGradient(24, 24, 4, 24, 24, 22);
      grad.addColorStop(0, '#00f0ff');
      grad.addColorStop(0.7, 'rgba(0, 136, 255, 0.4)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(24, 24, 22, 0, Math.PI * 2);
      ctx.fill();

      // Main body (Rescuer Jacket)
      ctx.fillStyle = '#0a192f';
      ctx.beginPath();
      ctx.arc(24, 24, 14, 0, Math.PI * 2);
      ctx.fill();

      // Neon Cyan Safety Vest
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(24, 24, 12, 0, Math.PI * 2);
      ctx.stroke();

      // Head / Helmet
      ctx.fillStyle = '#ff7700';
      ctx.beginPath();
      ctx.arc(24, 24, 7, 0, Math.PI * 2);
      ctx.fill();

      // Directional Flashlight Indicator Notch
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(22, 4, 4, 8);

      canvas.refresh();
    }
  }

  // 2. Civilian Stranded (40x40)
  if (!textures.exists('civilian-stranded')) {
    const canvas = scene.textures.createCanvas('civilian-stranded', 40, 40);
    if (canvas) {
      const ctx = canvas.getContext();
      // Panicked Red Pulsing Ring
      ctx.strokeStyle = '#ff2a5f';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(20, 20, 18, 0, Math.PI * 2);
      ctx.stroke();

      // Body
      ctx.fillStyle = '#ff7700';
      ctx.beginPath();
      ctx.arc(20, 20, 11, 0, Math.PI * 2);
      ctx.fill();

      // SOS Mark
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('!', 20, 20);

      canvas.refresh();
    }
  }

  // 3. Civilian Rescued / Following (40x40)
  if (!textures.exists('civilian-rescued')) {
    const canvas = scene.textures.createCanvas('civilian-rescued', 40, 40);
    if (canvas) {
      const ctx = canvas.getContext();
      // Calm Green/Cyan Ring
      ctx.strokeStyle = '#00ff88';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(20, 20, 17, 0, Math.PI * 2);
      ctx.stroke();

      // Body
      ctx.fillStyle = '#0088ff';
      ctx.beginPath();
      ctx.arc(20, 20, 10, 0, Math.PI * 2);
      ctx.fill();

      // Checkmark
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('✓', 20, 20);

      canvas.refresh();
    }
  }

  // 4. BEST Bus Obstacle (120x50)
  if (!textures.exists('bus')) {
    const canvas = scene.textures.createCanvas('bus', 120, 50);
    if (canvas) {
      const ctx = canvas.getContext();
      // Red Mumbai BEST Bus Body
      ctx.fillStyle = '#d32f2f';
      ctx.fillRect(4, 4, 112, 42);
      ctx.strokeStyle = '#ffcc00';
      ctx.lineWidth = 2;
      ctx.strokeRect(4, 4, 112, 42);

      // Roof & Windows
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(15, 10, 90, 30);

      ctx.fillStyle = '#94a3b8';
      for (let i = 0; i < 6; i++) {
        ctx.fillRect(20 + i * 14, 14, 10, 22);
      }

      // Banner Text: BEST - HINDMATA
      ctx.fillStyle = '#ffcc00';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('B.E.S.T. MUMBAI', 60, 8);

      canvas.refresh();
    }
  }

  // 5. Auto-Rickshaw Obstacle (60x40)
  if (!textures.exists('rickshaw')) {
    const canvas = scene.textures.createCanvas('rickshaw', 60, 40);
    if (canvas) {
      const ctx = canvas.getContext();
      // Yellow top
      ctx.fillStyle = '#eab308';
      ctx.fillRect(4, 4, 52, 32);
      // Black bottom
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(4, 20, 52, 16);
      ctx.strokeStyle = '#e2e8f0';
      ctx.strokeRect(4, 4, 52, 32);

      canvas.refresh();
    }
  }

  // 6. Open Manhole (50x50)
  if (!textures.exists('manhole')) {
    const canvas = scene.textures.createCanvas('manhole', 50, 50);
    if (canvas) {
      const ctx = canvas.getContext();
      // Outer warning ring
      ctx.strokeStyle = '#ff2a5f';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(25, 25, 22, 0, Math.PI * 2);
      ctx.stroke();

      // Dark swirling hole
      const grad = ctx.createRadialGradient(25, 25, 2, 25, 25, 20);
      grad.addColorStop(0, '#000000');
      grad.addColorStop(0.7, '#07152b');
      grad.addColorStop(1, '#ff2a5f');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(25, 25, 20, 0, Math.PI * 2);
      ctx.fill();

      // Whirlpool spirals
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(25, 25, 12, 0, Math.PI * 1.3);
      ctx.stroke();

      canvas.refresh();
    }
  }

  // 7. Live Wire Hazard (60x60)
  if (!textures.exists('electric')) {
    const canvas = scene.textures.createCanvas('electric', 60, 60);
    if (canvas) {
      const ctx = canvas.getContext();
      // Sparking pool
      const grad = ctx.createRadialGradient(30, 30, 5, 30, 30, 28);
      grad.addColorStop(0, 'rgba(255, 204, 0, 0.8)');
      grad.addColorStop(0.5, 'rgba(0, 240, 255, 0.4)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(30, 30, 28, 0, Math.PI * 2);
      ctx.fill();

      // Lightning symbol
      ctx.fillStyle = '#ffcc00';
      ctx.beginPath();
      ctx.moveTo(32, 12);
      ctx.lineTo(22, 32);
      ctx.lineTo(30, 32);
      ctx.lineTo(26, 48);
      ctx.lineTo(38, 28);
      ctx.lineTo(30, 28);
      ctx.closePath();
      ctx.fill();

      canvas.refresh();
    }
  }

  // 8. Floating Debris (40x40)
  if (!textures.exists('debris')) {
    const canvas = scene.textures.createCanvas('debris', 40, 40);
    if (canvas) {
      const ctx = canvas.getContext();
      // Wooden crate
      ctx.fillStyle = '#854d0e';
      ctx.fillRect(6, 6, 28, 28);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.strokeRect(6, 6, 28, 28);
      // X cross
      ctx.beginPath();
      ctx.moveTo(6, 6);
      ctx.lineTo(34, 34);
      ctx.moveTo(34, 6);
      ctx.lineTo(6, 34);
      ctx.stroke();

      canvas.refresh();
    }
  }

  // 9. Dadar Safe Zone Helipad/Beacon (140x140)
  if (!textures.exists('safezone')) {
    const canvas = scene.textures.createCanvas('safezone', 140, 140);
    if (canvas) {
      const ctx = canvas.getContext();
      // Concentric glowing cyan rings
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(70, 70, 66, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = '#00ff88';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(70, 70, 50, 0, Math.PI * 2);
      ctx.stroke();

      // Center pad
      ctx.fillStyle = 'rgba(0, 240, 255, 0.2)';
      ctx.beginPath();
      ctx.arc(70, 70, 48, 0, Math.PI * 2);
      ctx.fill();

      // Sign text: SAFE ZONE - DADAR
      ctx.fillStyle = '#00ff88';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('EVACUATION ZONE', 70, 60);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText('DADAR FLYOVER', 70, 78);

      canvas.refresh();
    }
  }
}
