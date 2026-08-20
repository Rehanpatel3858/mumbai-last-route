import Phaser from 'phaser';
import { generatePixelTextures } from '../utils/PixelTextureGenerator';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  public preload() {
    generatePixelTextures(this);
  }

  public create(data: object) {
    // Add frames to player-pixel manually since it was generated on canvas
    const playerTex = this.textures.get('player-pixel');
    if (playerTex && !playerTex.has('f_0_0')) {
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 3; c++) {
          playerTex.add(`f_${r}_${c}`, 0, c * 32, r * 32, 32, 32);
        }
      }
    }

    const dirs = ['down', 'up', 'left', 'right'];
    dirs.forEach((dir, row) => {
      if (!this.anims.exists(`player-walk-${dir}`)) {
        this.anims.create({
          key: `player-walk-${dir}`,
          frames: [
            { key: 'player-pixel', frame: `f_${row}_0` },
            { key: 'player-pixel', frame: `f_${row}_1` },
            { key: 'player-pixel', frame: `f_${row}_0` },
            { key: 'player-pixel', frame: `f_${row}_2` },
          ],
          frameRate: 8,
          repeat: -1,
        });
      }
    });

    this.scene.start('MainGameScene', data);
  }
}
