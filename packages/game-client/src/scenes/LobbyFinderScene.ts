import { GameService } from '../services/GameService';

export class LobbyFinderScene extends Phaser.Scene {
  private gameService: GameService;
  private statusText?: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'LobbyFinderScene' });
    this.gameService = GameService.getInstance();
  }

  create() {
    console.log('LobbyFinderScene created');
    const { width, height } = this.cameras.main;

    // Title
    this.add.text(width / 2, 80, 'Find a Game', {
      fontSize: '36px',
      color: '#ecf0f1'
    }).setOrigin(0.5);

    // Status text
    this.statusText = this.add.text(width / 2, 180, 'Click to join or create a game', {
      fontSize: '18px',
      color: '#bdc3c7'
    }).setOrigin(0.5);

    // Join Game button
    const joinButton = this.add.rectangle(width / 2, height / 2, 250, 60, 0x27ae60);
    joinButton.setInteractive({ useHandCursor: true });
    
    this.add.text(width / 2, height / 2, 'JOIN/CREATE GAME', {
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Back button
    const backButton = this.add.rectangle(width / 2, height / 2 + 100, 150, 50, 0x95a5a6);
    backButton.setInteractive({ useHandCursor: true });
    
    this.add.text(width / 2, height / 2 + 100, 'BACK', {
      fontSize: '18px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Button interactions
    joinButton.on('pointerup', async () => {
      this.statusText!.setText('Connecting to server...');
      try {
        await this.gameService.connect();
        await this.gameService.joinRoom();
        this.scene.start('ReadyScene');
      } catch (error) {
        console.error('Failed to join game:', error);
        this.statusText!.setText('Failed to connect. Try again?');
      }
    });

    backButton.on('pointerup', () => {
      this.scene.start('StartScene');
    });

    // Hover effects
    joinButton.on('pointerover', () => {
      joinButton.setFillStyle(0x2ecc71);
    });

    joinButton.on('pointerout', () => {
      joinButton.setFillStyle(0x27ae60);
    });

    backButton.on('pointerover', () => {
      backButton.setFillStyle(0xa4b0b0);
    });

    backButton.on('pointerout', () => {
      backButton.setFillStyle(0x95a5a6);
    });
  }
}