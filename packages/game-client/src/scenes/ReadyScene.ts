import { GameService } from '../services/GameService';
import { Player } from 'shared';
import { GameState } from 'shared';

export class ReadyScene extends Phaser.Scene {
  private gameService: GameService;
  private playerTexts: Phaser.GameObjects.Text[] = [];
  private readyButton?: Phaser.GameObjects.Rectangle;
  private readyButtonText?: Phaser.GameObjects.Text;
  private statusText?: Phaser.GameObjects.Text;
  private countdownText?: Phaser.GameObjects.Text;
  
  constructor() {
    super({ key: 'ReadyScene' });
    this.gameService = GameService.getInstance();
  }

  create() {
    const { width, height } = this.cameras.main;

    // Title
    this.add.text(width / 2, 60, 'Lobby - Get Ready!', {
      fontSize: '32px',
      color: '#ecf0f1'
    }).setOrigin(0.5);

    // Player status area
    this.add.text(width / 2, 120, 'Players:', {
      fontSize: '20px',
      color: '#bdc3c7'
    }).setOrigin(0.5);

    // Status text
    this.statusText = this.add.text(width / 2, 320, 'Waiting for players...', {
      fontSize: '18px',
      color: '#f39c12'
    }).setOrigin(0.5);

    // Countdown text (initially hidden)
    this.countdownText = this.add.text(width / 2, 360, '', {
      fontSize: '24px',
      color: '#e74c3c'
    }).setOrigin(0.5);

    // Ready button
    this.readyButton = this.add.rectangle(width / 2, height - 120, 200, 60, 0x27ae60);
    this.readyButton.setInteractive({ useHandCursor: true });
    
    this.readyButtonText = this.add.text(width / 2, height - 120, 'READY', {
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Back button
    const backButton = this.add.rectangle(width / 2, height - 50, 150, 40, 0x95a5a6);
    backButton.setInteractive({ useHandCursor: true });
    
    this.add.text(width / 2, height - 50, 'LEAVE', {
      fontSize: '16px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Button interactions
    this.readyButton.on('pointerup', () => {
      this.gameService.sendInput({ type: 'ready' });
    });

    backButton.on('pointerup', () => {
      this.gameService.leave();
      this.scene.start('LobbyFinderScene');
    });

    // Setup room state listeners
    this.setupRoomListeners();
    this.updatePlayerDisplay();
  }

  private setupRoomListeners() {
    const room = this.gameService.getRoom();
    if (!room) return;

    room.onStateChange((state) => {
      this.updatePlayerDisplay();
      this.updateGameState(state);
    });
  }

  private updatePlayerDisplay() {
    const room = this.gameService.getRoom();
    if (!room) return;

    // Clear existing player texts
    this.playerTexts.forEach(text => text.destroy());
    this.playerTexts = [];

    const players = Array.from(room.state.players.values());
    const colors = ['#e74c3c', '#3498db', '#27ae60', '#f1c40f']; // red, blue, green, yellow
    
    players.forEach((player: Player, index: number) => {
      const y = 160 + (index * 30);
      const readyStatus = player.ready ? '✓ READY' : '- Not Ready';
      const text = this.add.text(this.cameras.main.width / 2, y, 
        `Player ${index + 1} (${player.color}): ${readyStatus}`, {
          fontSize: '18px',
          color: colors[index] || '#ffffff'
        }).setOrigin(0.5);
      
      this.playerTexts.push(text);
    });

    // Update ready button based on current player's ready state
    const myPlayer = players.find(p => p.id === room.sessionId);
    if (myPlayer && this.readyButton && this.readyButtonText) {
      if (myPlayer.ready) {
        this.readyButton.setFillStyle(0xe74c3c);
        this.readyButtonText.setText('NOT READY');
      } else {
        this.readyButton.setFillStyle(0x27ae60);
        this.readyButtonText.setText('READY');
      }
    }
  }

  private updateGameState(state: any) {
    if (!this.statusText || !this.countdownText) return;

    switch (state.gameState) {
      case GameState.LOBBY:
        const allPlayers = Array.from(state.players.values());
        const readyCount = allPlayers.filter((p: any) => p.ready).length;
        const totalPlayers = allPlayers.length;
        
        if (totalPlayers < 2) {
          this.statusText.setText('Waiting for more players...');
        } else if (readyCount === totalPlayers) {
          this.statusText.setText('All players ready! Starting soon...');
        } else {
          this.statusText.setText(`${readyCount}/${totalPlayers} players ready`);
        }
        this.countdownText.setText('');
        break;
        
      case GameState.READY:
        this.statusText.setText('Starting game...');
        const countdown = Math.ceil(state.readyCountdown / 1000);
        this.countdownText.setText(`Game starts in ${countdown}`);
        break;
        
      case GameState.PLAYING:
        this.scene.start('GameScene');
        break;
    }
  }
}