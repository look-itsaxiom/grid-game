export class CreditsScene extends Phaser.Scene {
  constructor() {
    super({ key: 'CreditsScene' });
  }

  create() {
    const { width, height } = this.cameras.main;

    // Title
    this.add.text(width / 2, 80, 'Credits', {
      fontSize: '36px',
      color: '#ecf0f1'
    }).setOrigin(0.5);

    // Game info
    this.add.text(width / 2, 160, '4-Player Grid Game', {
      fontSize: '24px',
      color: '#3498db'
    }).setOrigin(0.5);

    // Developer credit
    this.add.text(width / 2, 220, 'Developed by: Your Name', {
      fontSize: '18px',
      color: '#bdc3c7'
    }).setOrigin(0.5);

    // Technology stack
    const techStack = [
      'Built with:',
      '• Phaser 3 (Game Engine)',
      '• Colyseus (Multiplayer Server)',
      '• TypeScript',
      '• Vite (Build Tool)',
      '• npm Workspaces'
    ];

    techStack.forEach((text, index) => {
      this.add.text(width / 2, 280 + (index * 25), text, {
        fontSize: index === 0 ? '16px' : '14px',
        color: index === 0 ? '#f39c12' : '#95a5a6',
        align: 'center'
      }).setOrigin(0.5);
    });

    // Game rules reminder
    this.add.text(width / 2, 450, 'Game Rules: Move with WASD/Arrows, Fire with Space\nCatch enemies in your colored laser to eliminate them!', {
      fontSize: '12px',
      color: '#7f8c8d',
      align: 'center'
    }).setOrigin(0.5);

    // Back button
    const backButton = this.add.rectangle(width / 2, height - 60, 150, 50, 0x95a5a6);
    backButton.setInteractive({ useHandCursor: true });
    
    this.add.text(width / 2, height - 60, 'BACK', {
      fontSize: '18px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Button interaction
    backButton.on('pointerup', () => {
      this.scene.start('StartScene');
    });

    // Hover effect
    backButton.on('pointerover', () => {
      backButton.setFillStyle(0xa4b0b0);
    });

    backButton.on('pointerout', () => {
      backButton.setFillStyle(0x95a5a6);
    });
  }
}