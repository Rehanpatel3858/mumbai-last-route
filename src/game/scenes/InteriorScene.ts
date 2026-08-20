import Phaser from 'phaser';

export class InteriorScene extends Phaser.Scene {
  private type!: 'SHOP' | 'CLINIC' | 'APARTMENT';
  private wasd!: { F: Phaser.Input.Keyboard.Key };

  constructor() {
    super('InteriorScene');
  }

  public init(data: { type: 'SHOP' | 'CLINIC' | 'APARTMENT', playerX: number, playerY: number }) {
    this.type = data.type || 'SHOP';
  }

  public create() {
    // Small room
    this.cameras.main.setBackgroundColor('#0f172a');
    
    // Room floor
    this.add.rectangle(400, 300, 400, 300, 0x1e293b).setOrigin(0.5);

    // Props based on type
    if (this.type === 'SHOP') {
      this.add.rectangle(400, 200, 200, 40, 0xfbbf24).setOrigin(0.5); // Counter
      this.add.text(350, 190, 'SHOPKEEPER', { fontSize: '12px', color: '#000' });
    } else if (this.type === 'CLINIC') {
      this.add.rectangle(300, 250, 60, 100, 0xffffff).setOrigin(0.5); // Bed
      this.add.rectangle(500, 200, 80, 40, 0x94a3b8).setOrigin(0.5); // Cabinet
    } else {
      this.add.rectangle(300, 200, 80, 80, 0x78350f).setOrigin(0.5); // Bed
    }

    // Door / Exit marker at bottom
    this.add.rectangle(400, 430, 80, 20, 0x475569).setOrigin(0.5); // Door mat
    this.add.text(400, 410, '[F] EXIT', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 4, y: 2 }
    }).setOrigin(0.5).setVisible(true);

    this.add.sprite(400, 380, 'player-pixel');

    if (this.input.keyboard) {
      this.wasd = {
        F: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F)
      };
    }
  }

  public update() {
    if (this.wasd && Phaser.Input.Keyboard.JustDown(this.wasd.F)) {
      // Exit back to MainGameScene
      this.scene.stop();
      this.scene.resume('MainGameScene');
    }
  }
}
