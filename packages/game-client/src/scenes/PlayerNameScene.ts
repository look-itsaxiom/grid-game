export class PlayerNameScene extends Phaser.Scene {
  private nameInput?: HTMLInputElement;
  
  constructor() {
    super({ key: 'PlayerNameScene' });
  }

  create() {
    const { width, height } = this.cameras.main;

    // Title
    this.add.text(width / 2, height / 3 - 50, 'Enter Your Name', {
      fontSize: '32px',
      color: '#ecf0f1'
    }).setOrigin(0.5);

    // Get stored name if it exists
    const storedName = localStorage.getItem('gridGamePlayerName') || '';

    // Name input background
    const inputBg = this.add.rectangle(width / 2, height / 2, 300, 50, 0x34495e);
    inputBg.setStrokeStyle(2, 0x3498db);

    // Create HTML input element
    this.nameInput = document.createElement('input');
    this.nameInput.type = 'text';
    this.nameInput.placeholder = 'Enter your name...';
    this.nameInput.value = storedName;
    this.nameInput.maxLength = 20;
    this.nameInput.style.position = 'absolute';
    this.nameInput.style.left = (width / 2 - 150) + 'px';
    this.nameInput.style.top = (height / 2 - 25) + 'px';
    this.nameInput.style.width = '300px';
    this.nameInput.style.height = '50px';
    this.nameInput.style.fontSize = '18px';
    this.nameInput.style.textAlign = 'center';
    this.nameInput.style.border = 'none';
    this.nameInput.style.borderRadius = '5px';
    this.nameInput.style.backgroundColor = '#34495e';
    this.nameInput.style.color = '#ecf0f1';
    this.nameInput.style.outline = 'none';
    this.nameInput.style.zIndex = '1000';

    document.body.appendChild(this.nameInput);
    this.nameInput.focus();

    // Continue button
    const continueButton = this.add.rectangle(width / 2, height / 2 + 80, 200, 50, 0x27ae60);
    continueButton.setInteractive({ useHandCursor: true });
    
    this.add.text(width / 2, height / 2 + 80, 'CONTINUE', {
      fontSize: '18px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Instructions
    this.add.text(width / 2, height / 2 + 140, 'Your name will be shown to other players', {
      fontSize: '14px',
      color: '#bdc3c7'
    }).setOrigin(0.5);

    // Button interactions
    continueButton.on('pointerup', () => {
      this.saveName();
    });

    // Handle Enter key
    this.nameInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        this.saveName();
      }
    });

    // Hover effects
    continueButton.on('pointerover', () => {
      continueButton.setFillStyle(0x2ecc71);
    });

    continueButton.on('pointerout', () => {
      continueButton.setFillStyle(0x27ae60);
    });
  }

  private saveName() {
    if (!this.nameInput) return;
    
    const name = this.nameInput.value.trim();
    if (name.length === 0) {
      // Show error or use default name
      const playerName = 'Anonymous Player';
      localStorage.setItem('gridGamePlayerName', playerName);
    } else {
      localStorage.setItem('gridGamePlayerName', name);
    }
    
    // Clean up HTML input
    document.body.removeChild(this.nameInput);
    this.nameInput = undefined;
    
    // Proceed to start scene
    this.scene.start('StartScene');
  }

  cleanup() {
    // Clean up HTML input if scene is destroyed
    if (this.nameInput && document.body.contains(this.nameInput)) {
      document.body.removeChild(this.nameInput);
      this.nameInput = undefined;
    }
  }
}