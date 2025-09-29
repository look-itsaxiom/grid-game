export class StartScene extends Phaser.Scene {
  constructor() {
    super({ key: 'StartScene' });
  }

  create() {
    const { width, height } = this.cameras.main;

    // Title
    this.add.text(width / 2, height / 3, '4-Player Grid Game', {
      fontSize: '48px',
      color: '#ecf0f1'
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(width / 2, height / 3 + 80, 'Battle on the grid with colors!', {
      fontSize: '24px',
      color: '#bdc3c7'
    }).setOrigin(0.5);

    // Play button
    const playButton = this.add.rectangle(width / 2, height / 2 + 80, 200, 60, 0x3498db);
    playButton.setInteractive({ useHandCursor: true });
    
    this.add.text(width / 2, height / 2 + 80, 'PLAY', {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Credits button
    const creditsButton = this.add.rectangle(width / 2, height / 2 + 160, 200, 50, 0x95a5a6);
    creditsButton.setInteractive({ useHandCursor: true });
    
    this.add.text(width / 2, height / 2 + 160, 'CREDITS', {
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Button interactions
    playButton.on('pointerdown', () => {
      playButton.setFillStyle(0x2980b9);
    });

    playButton.on('pointerup', () => {
      playButton.setFillStyle(0x3498db);
      console.log('PLAY button clicked - transitioning to LobbyFinderScene');
      this.scene.start('LobbyFinderScene');
    });

    creditsButton.on('pointerdown', () => {
      creditsButton.setFillStyle(0x7f8c8d);
    });

    creditsButton.on('pointerup', () => {
      creditsButton.setFillStyle(0x95a5a6);
      console.log('CREDITS button clicked - transitioning to CreditsScene');
      this.scene.start('CreditsScene');
    });

    // Hover effects
    playButton.on('pointerover', () => {
      playButton.setFillStyle(0x5dade2);
    });

    playButton.on('pointerout', () => {
      playButton.setFillStyle(0x3498db);
    });

    creditsButton.on('pointerover', () => {
      creditsButton.setFillStyle(0xa4b0b0);
    });

    creditsButton.on('pointerout', () => {
      creditsButton.setFillStyle(0x95a5a6);
    });
  }
}