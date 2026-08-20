import Phaser from 'phaser';

export class Door extends Phaser.GameObjects.Zone {
  public id: string;
  public destScene: string;
  private promptText: Phaser.GameObjects.Text;
  private isPlayerNear = false;

  constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, id: string, destScene: string) {
    super(scene, x, y, width, height);
    this.id = id;
    this.destScene = destScene;

    scene.add.existing(this);
    scene.physics.add.existing(this, true); // static body

    this.promptText = scene.add.text(x, y - 40, '[F] ENTER', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 4, y: 2 }
    }).setOrigin(0.5).setDepth(100).setVisible(false);
  }

  public checkProximity(player: Phaser.GameObjects.Sprite) {
    const dist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
    if (dist < 60) {
      this.isPlayerNear = true;
      this.promptText.setVisible(true);
    } else {
      this.isPlayerNear = false;
      this.promptText.setVisible(false);
    }
  }

  public canEnter(): boolean {
    return this.isPlayerNear;
  }
}
