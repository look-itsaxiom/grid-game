export class StartScene extends Phaser.Scene {
  constructor() {
    super({ key: 'StartScene' });
  }

  create() {
    const { width, height } = this.cameras.main;

    // Get player name
    const playerName = localStorage.getItem('gridGamePlayerName') || 'Anonymous Player';

    // Welcome message
    this.add.text(width / 2, height / 3 - 50, `Welcome, ${playerName}!`, {
      fontSize: '24px',
      color: '#bdc3c7'
    }).setOrigin(0.5);

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

    // Change Name button
    const changeNameButton = this.add.rectangle(width / 2, height / 2 + 160, 200, 50, 0xf39c12);
    changeNameButton.setInteractive({ useHandCursor: true });
    
    this.add.text(width / 2, height / 2 + 160, 'CHANGE NAME', {
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Credits button
    const creditsButton = this.add.rectangle(width / 2, height / 2 + 230, 200, 50, 0x95a5a6);
    creditsButton.setInteractive({ useHandCursor: true });
    
    this.add.text(width / 2, height / 2 + 230, 'CREDITS', {
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

    changeNameButton.on('pointerdown', () => {
      changeNameButton.setFillStyle(0xe67e22);
    });

    changeNameButton.on('pointerup', () => {
      changeNameButton.setFillStyle(0xf39c12);
      console.log('CHANGE NAME button clicked - transitioning to PlayerNameScene');
      this.scene.start('PlayerNameScene');
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

    changeNameButton.on('pointerover', () => {
      changeNameButton.setFillStyle(0xf8c471);
    });

    changeNameButton.on('pointerout', () => {
      changeNameButton.setFillStyle(0xf39c12);
    });

    creditsButton.on('pointerover', () => {
      creditsButton.setFillStyle(0xa4b0b0);
    });

    creditsButton.on('pointerout', () => {
      creditsButton.setFillStyle(0x95a5a6);
    });
  }
}