import { GameService } from '../services/GameService';

export class GameOverScene extends Phaser.Scene {
  private gameService: GameService;
  
  constructor() {
    super({ key: 'GameOverScene' });
    this.gameService = GameService.getInstance();
  }

  create(data: { winner?: string }) {
    const { width, height } = this.cameras.main;

    // Title
    this.add.text(width / 2, 150, 'Game Over!', {
      fontSize: '48px',
      color: '#ecf0f1'
    }).setOrigin(0.5);

    // Winner announcement
    if (data.winner) {
      const room = this.gameService.getRoom();
      let winnerName = 'Unknown Player';
      
      if (room) {
        const winnerPlayer = room.state.players.get(data.winner);
        if (winnerPlayer) {
          winnerName = winnerPlayer.name || `${winnerPlayer.color.toUpperCase()} Player`;
        }
      }

      const isMyWin = room?.sessionId === data.winner;
      const displayText = isMyWin ? 'You Win!' : `${winnerName} Wins!`;
      
      this.add.text(width / 2, 220, displayText, {
          fontSize: '32px',
          color: isMyWin ? '#27ae60' : '#e74c3c'
        }).setOrigin(0.5);
    } else {
      this.add.text(width / 2, 220, 'No Winner', {
        fontSize: '32px',
        color: '#f39c12'
      }).setOrigin(0.5);
    }

    // Play Again button
    const playAgainButton = this.add.rectangle(width / 2, height / 2 + 50, 200, 60, 0x3498db);
    playAgainButton.setInteractive({ useHandCursor: true });
    
    this.add.text(width / 2, height / 2 + 50, 'PLAY AGAIN', {
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Return to Lobby button
    const lobbyButton = this.add.rectangle(width / 2, height / 2 + 130, 200, 50, 0x27ae60);
    lobbyButton.setInteractive({ useHandCursor: true });
    
    this.add.text(width / 2, height / 2 + 130, 'NEW GAME', {
      fontSize: '18px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Main Menu button
    const menuButton = this.add.rectangle(width / 2, height / 2 + 190, 150, 40, 0x95a5a6);
    menuButton.setInteractive({ useHandCursor: true });
    
    this.add.text(width / 2, height / 2 + 190, 'MAIN MENU', {
      fontSize: '16px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Button interactions
    playAgainButton.on('pointerup', () => {
      // Stay in the same room, return to ready scene
      this.scene.start('ReadyScene');
    });

    lobbyButton.on('pointerup', () => {
      this.gameService.leave();
      this.scene.start('LobbyFinderScene');
    });

    menuButton.on('pointerup', () => {
      this.gameService.leave();
      this.scene.start('StartScene');
    });

    // Hover effects
    playAgainButton.on('pointerover', () => {
      playAgainButton.setFillStyle(0x5dade2);
    });

    playAgainButton.on('pointerout', () => {
      playAgainButton.setFillStyle(0x3498db);
    });

    lobbyButton.on('pointerover', () => {
      lobbyButton.setFillStyle(0x2ecc71);
    });

    lobbyButton.on('pointerout', () => {
      lobbyButton.setFillStyle(0x27ae60);
    });

    menuButton.on('pointerover', () => {
      menuButton.setFillStyle(0xa4b0b0);
    });

    menuButton.on('pointerout', () => {
      menuButton.setFillStyle(0x95a5a6);
    });

    // Auto-return to lobby after 10 seconds
    this.time.delayedCall(10000, () => {
      this.scene.start('ReadyScene');
    });
  }
}