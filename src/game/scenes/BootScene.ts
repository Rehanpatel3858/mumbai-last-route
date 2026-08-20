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
    if (playerTex && !playerTex.has(1)) {
      playerTex.add(0, 0, 0, 0, 32, 32);
      playerTex.add(1, 0, 32, 0, 32, 32);
      playerTex.add(2, 0, 64, 0, 32, 32);
      playerTex.add(3, 0, 96, 0, 32, 32);
    }

    if (!this.anims.exists('player-walk-down')) {
      this.anims.create({
        key: 'player-walk-down',
        frames: [{ key: 'player-pixel', frame: 0 }],
        frameRate: 6,
        repeat: -1,
      });
    }

    if (!this.anims.exists('player-walk-up')) {
      this.anims.create({
        key: 'player-walk-up',
        frames: [{ key: 'player-pixel', frame: 1 }],
        frameRate: 6,
        repeat: -1,
      });
    }

    if (!this.anims.exists('player-walk-left')) {
      this.anims.create({
        key: 'player-walk-left',
        frames: [{ key: 'player-pixel', frame: 2 }],
        frameRate: 6,
        repeat: -1,
      });
    }

    if (!this.anims.exists('player-walk-right')) {
      this.anims.create({
        key: 'player-walk-right',
        frames: [{ key: 'player-pixel', frame: 3 }],
        frameRate: 6,
        repeat: -1,
      });
    }

    this.scene.start('MainGameScene', data);
  }
}
