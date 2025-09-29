import { GameService } from '../services/GameService';
import { Player } from 'shared';
import { GRID_SIZE, GameState, Direction, CellState } from 'shared';

export class GameScene extends Phaser.Scene {
  private gameService: GameService;
  private gridGraphics?: Phaser.GameObjects.Graphics;
  private playerSprites: Map<string, Phaser.GameObjects.Rectangle> = new Map();
  private playerDirIndicators: Map<string, Phaser.GameObjects.Triangle> = new Map();
  private cellSize = 40;
  private gridOffsetX = 100;
  private gridOffsetY = 80;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasdKeys?: { W: Phaser.Input.Keyboard.Key, A: Phaser.Input.Keyboard.Key, S: Phaser.Input.Keyboard.Key, D: Phaser.Input.Keyboard.Key };
  private spaceKey?: Phaser.Input.Keyboard.Key;
  private uiTexts: Phaser.GameObjects.Text[] = [];

  constructor() {
    super({ key: 'GameScene' });
    this.gameService = GameService.getInstance();
  }

  create() {
    const { width } = this.cameras.main;

    // Create input
    this.cursors = this.input.keyboard?.createCursorKeys();
    this.wasdKeys = this.input.keyboard?.addKeys('W,S,A,D') as any;
    this.spaceKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // Title
    this.add.text(width / 2, 30, '4-Player Grid Battle', {
      fontSize: '24px',
      color: '#ecf0f1'
    }).setOrigin(0.5);

    // Instructions
    this.add.text(width - 150, 70, 'WASD/Arrows: Move\nSpace: Fire', {
      fontSize: '12px',
      color: '#bdc3c7',
      align: 'center'
    }).setOrigin(0.5);

    // Setup graphics for grid
    this.gridGraphics = this.add.graphics();
    
    // Setup room listeners
    this.setupRoomListeners();
    
    // Draw initial state
    this.drawGrid();
    this.updatePlayers();
    this.updateUI();
  }

  update() {
    this.handleInput();
  }

  private handleInput() {
    if (!this.cursors || !this.wasdKeys || !this.spaceKey) return;

    // Movement
    if (Phaser.Input.Keyboard.JustDown(this.cursors.up!) || Phaser.Input.Keyboard.JustDown(this.wasdKeys.W)) {
      console.log('Sending move UP input');
      this.gameService.sendInput({ type: 'move', direction: Direction.UP });
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.down!) || Phaser.Input.Keyboard.JustDown(this.wasdKeys.S)) {
      console.log('Sending move DOWN input');
      this.gameService.sendInput({ type: 'move', direction: Direction.DOWN });
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.left!) || Phaser.Input.Keyboard.JustDown(this.wasdKeys.A)) {
      console.log('Sending move LEFT input');
      this.gameService.sendInput({ type: 'move', direction: Direction.LEFT });
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.right!) || Phaser.Input.Keyboard.JustDown(this.wasdKeys.D)) {
      console.log('Sending move RIGHT input');
      this.gameService.sendInput({ type: 'move', direction: Direction.RIGHT });
    }

    // Firing
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      console.log('Sending fire input');
      this.gameService.sendInput({ type: 'fire' });
    }
  }

  private setupRoomListeners() {
    const room = this.gameService.getRoom();
    if (!room) return;

    room.onStateChange(() => {
      this.drawGrid();
      this.updatePlayers();
      this.updateUI();
      this.checkGameState();
    });
  }

  private drawGrid() {
    if (!this.gridGraphics) return;
    
    this.gridGraphics.clear();
    
    const room = this.gameService.getRoom();
    if (!room) return;

    // Draw grid cells
    for (let x = 0; x < GRID_SIZE; x++) {
      for (let y = 0; y < GRID_SIZE; y++) {
        const cellKey = `${x},${y}`;
        const cell = room.state.grid.get(cellKey);
        
        let color = 0x34495e; // neutral/dark gray
        let strokeColor = 0x7f8c8d; // normal border
        
        if (cell) {
          // Handle charging state
          if (cell.charging) {
            color = 0xffffff; // White for charging
            strokeColor = 0xf39c12; // Orange border for charging
          } else {
            // Handle colored states
            switch (cell.state) {
              case CellState.RED:
                color = 0xe74c3c;
                break;
              case CellState.BLUE:
                color = 0x3498db;
                break;
              case CellState.GREEN:
                color = 0x27ae60;
                break;
              case CellState.YELLOW:
                color = 0xf1c40f;
                break;
            }
          }
        }

        const screenX = this.gridOffsetX + (x * this.cellSize);
        const screenY = this.gridOffsetY + (y * this.cellSize);

        this.gridGraphics.fillStyle(color);
        this.gridGraphics.fillRect(screenX, screenY, this.cellSize - 2, this.cellSize - 2);
        
        // Grid lines with appropriate color
        this.gridGraphics.lineStyle(cell?.charging ? 2 : 1, strokeColor);
        this.gridGraphics.strokeRect(screenX, screenY, this.cellSize - 2, this.cellSize - 2);
      }
    }
  }

  private updatePlayers() {
    const room = this.gameService.getRoom();
    if (!room) return;

    // Clear existing player sprites and direction indicators
    this.playerSprites.forEach(sprite => sprite.destroy());
    this.playerSprites.clear();
    this.playerDirIndicators.forEach(indicator => indicator.destroy());
    this.playerDirIndicators.clear();

    // Create new player sprites
    room.state.players.forEach((player: Player, playerId: string) => {
      if (!player.alive) return;

      const screenX = this.gridOffsetX + (player.x * this.cellSize) + (this.cellSize / 2);
      const screenY = this.gridOffsetY + (player.y * this.cellSize) + (this.cellSize / 2);

      let color = 0xffffff;
      switch (player.color) {
        case 'red':
          color = 0xff6b6b;
          break;
        case 'blue':
          color = 0x74b9ff;
          break;
        case 'green':
          color = 0x55a3ff;
          break;
        case 'yellow':
          color = 0xfdcb6e;
          break;
      }

      const sprite = this.add.rectangle(screenX, screenY, this.cellSize - 10, this.cellSize - 10, color);
      
      // Add direction indicator
      const dirIndicator = this.add.triangle(
        screenX, 
        screenY - (this.cellSize / 4), 
        0, -8, 
        -6, 8, 
        6, 8, 
        0x000000
      );
      
      // Rotate based on facing direction
      switch (player.facing) {
        case Direction.UP:
          dirIndicator.setRotation(0);
          break;
        case Direction.DOWN:
          dirIndicator.setRotation(Math.PI);
          break;
        case Direction.LEFT:
          dirIndicator.setRotation(-Math.PI / 2);
          break;
        case Direction.RIGHT:
          dirIndicator.setRotation(Math.PI / 2);
          break;
      }

      // Apply blinking effect if invulnerable
      if (player.invulnerable) {
        // Create blinking tween
        this.tweens.add({
          targets: [sprite, dirIndicator],
          alpha: 0.3,
          duration: 250,
          yoyo: true,
          repeat: -1,
          ease: 'Power2'
        });
      }

      this.playerSprites.set(playerId, sprite);
      this.playerDirIndicators.set(playerId, dirIndicator);
    });
  }

  private updateUI() {
    // Clear existing UI texts
    this.uiTexts.forEach(text => text.destroy());
    this.uiTexts = [];

    const room = this.gameService.getRoom();
    if (!room) return;

    // Display player lives
    const players = Array.from(room.state.players.values());
    let yOffset = 0;
    
    players.forEach((player: Player) => {
      const color = this.getPlayerDisplayColor(player.color);
      const livesText = this.add.text(20, 100 + yOffset, 
        `${player.color.toUpperCase()}: ${player.lives} lives`, {
          fontSize: '14px',
          color: color
        });
      
      if (!player.alive) {
        livesText.setText(`${player.color.toUpperCase()}: ELIMINATED`);
        livesText.setAlpha(0.6);
      }
      
      this.uiTexts.push(livesText);
      yOffset += 25;
    });
  }

  private getPlayerDisplayColor(playerColor: string): string {
    switch (playerColor) {
      case 'red': return '#e74c3c';
      case 'blue': return '#3498db';
      case 'green': return '#27ae60';
      case 'yellow': return '#f1c40f';
      default: return '#ffffff';
    }
  }

  private checkGameState() {
    const room = this.gameService.getRoom();
    if (!room) return;

    if (room.state.gameState === GameState.GAME_OVER) {
      this.time.delayedCall(1000, () => {
        this.scene.start('GameOverScene', { winner: room.state.winner });
      });
    }
  }
}