import Phaser from 'phaser';

export function createGameConfig(containerId: string): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent: containerId,
    width: 1280,
    height: 720,
    backgroundColor: '#050914',
    render: {
      pixelArt: true,
      roundPixels: true,
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { x: 0, y: 0 },
        debug: false,
      },
    },
  };
}
