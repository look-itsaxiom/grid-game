import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Room, Client } = require('colyseus');

import { GameRoom, Player, GridCell } from 'shared';
import { 
  GRID_SIZE, MAX_PLAYERS, PLAYER_LIVES, 
  PlayerColor, CellState, GameState, Direction, 
  InputMessage, Position 
} from 'shared';

const FIRE_DELAY = 500; // ms
const COLOR_DURATION = 2000; // ms  
const READY_COUNTDOWN = 3000; // ms

export class GridGameRoom extends Room<GameRoom> {
  private gameLoopInterval?: NodeJS.Timeout;
  private colorTimers: Map<string, NodeJS.Timeout> = new Map();
  
  onCreate() {
    this.setState(new GameRoom());
    this.initializeGrid();
    this.maxClients = MAX_PLAYERS;
    
    // Set room metadata for lobby browser
    this.setMetadata({
      gameState: GameState.LOBBY,
      playerCount: 0,
      maxPlayers: MAX_PLAYERS
    });
    
    this.onMessage('input', (client: any, message: InputMessage) => {
      this.handleInput(client, message);
    });
    
    // Game loop for color timing and transitions
    this.gameLoopInterval = setInterval(() => {
      this.gameLoop();
    }, 16); // ~60fps
  }

  onJoin(client: any) {
    console.log(`Player ${client.sessionId} joined`);
    
    // Check if room is already full
    const currentPlayerCount = this.state.players.size;
    if (currentPlayerCount >= MAX_PLAYERS) {
      console.log(`Room is full (${currentPlayerCount}/${MAX_PLAYERS}), rejecting player ${client.sessionId}`);
      throw new Error('Room is full');
    }
    
    const player = new Player();
    player.id = client.sessionId;
    player.color = this.getNextAvailableColor();
    player.lives = PLAYER_LIVES;
    player.alive = true;
    player.ready = false;
    
    // Set starting position based on current player count
    const startPos = this.getStartingPosition(currentPlayerCount);
    player.x = startPos.x;
    player.y = startPos.y;
    
    this.state.players.set(client.sessionId, player);
    
    // Update room metadata
    this.setMetadata({
      gameState: this.state.gameState,
      playerCount: this.state.players.size,
      maxPlayers: MAX_PLAYERS
    });
    
    console.log(`Player ${client.sessionId} added successfully. Room now has ${this.state.players.size}/${MAX_PLAYERS} players`);
  }

  onLeave(client: any) {
    console.log(`Player ${client.sessionId} left`);
    
    // Only delete if the player actually exists in the room
    if (this.state.players.has(client.sessionId)) {
      this.state.players.delete(client.sessionId);
      
      // Update room metadata
      this.setMetadata({
        gameState: this.state.gameState,
        playerCount: this.state.players.size,
        maxPlayers: MAX_PLAYERS
      });
      
      console.log(`Player ${client.sessionId} removed. Room now has ${this.state.players.size}/${MAX_PLAYERS} players`);
    } else {
      console.log(`Player ${client.sessionId} was not in the players list`);
    }
    
    // If game was in progress and not enough players, end game
    if (this.state.gameState === GameState.PLAYING && this.state.players.size < 2) {
      this.endGame();
    }
  }

  onDispose() {
    if (this.gameLoopInterval) {
      clearInterval(this.gameLoopInterval);
    }
    this.colorTimers.forEach(timer => clearTimeout(timer));
  }

  private initializeGrid() {
    for (let x = 0; x < GRID_SIZE; x++) {
      for (let y = 0; y < GRID_SIZE; y++) {
        const cell = new GridCell();
        cell.state = CellState.NEUTRAL;
        this.state.grid.set(`${x},${y}`, cell);
      }
    }
  }

  private getNextAvailableColor(): PlayerColor {
    const usedColors = Array.from(this.state.players.values()).map((p: any) => p.color);
    const colors = [PlayerColor.RED, PlayerColor.BLUE, PlayerColor.GREEN, PlayerColor.YELLOW];
    return colors.find(color => !usedColors.includes(color)) || PlayerColor.RED;
  }

  private getStartingPosition(playerIndex: number): Position {
    const positions = [
      { x: 1, y: 1 },           // Red - top left
      { x: GRID_SIZE - 2, y: GRID_SIZE - 2 }, // Blue - bottom right  
      { x: 1, y: GRID_SIZE - 2 },             // Green - bottom left
      { x: GRID_SIZE - 2, y: 1 }              // Yellow - top right
    ];
    return positions[playerIndex] || { x: 0, y: 0 };
  }

  private handleInput(client: any, message: InputMessage) {
    const player = this.state.players.get(client.sessionId);
    if (!player) return;

    switch (message.type) {
      case 'ready':
        this.handleReady(client);
        break;
      case 'move':
        if (this.state.gameState === GameState.PLAYING && message.direction) {
          this.handleMove(client, message.direction);
        }
        break;
      case 'fire':
        if (this.state.gameState === GameState.PLAYING) {
          this.handleFire(client);
        }
        break;
    }
  }

  private handleReady(client: any) {
    const player = this.state.players.get(client.sessionId);
    if (!player || this.state.gameState !== GameState.LOBBY) return;

    player.ready = !player.ready;
    
    // Check if all players are ready
    const allPlayers = Array.from(this.state.players.values());
    if (allPlayers.length >= 2 && allPlayers.every((p: any) => p.ready)) {
      this.startReadyCountdown();
    }
  }

  private startReadyCountdown() {
    this.state.gameState = GameState.READY;
    this.state.readyCountdown = READY_COUNTDOWN;
    
    this.setMetadata({
      gameState: this.state.gameState,
      playerCount: this.state.players.size,
      maxPlayers: MAX_PLAYERS
    });
    
    setTimeout(() => {
      this.startGame();
    }, READY_COUNTDOWN);
  }

  private startGame() {
    this.state.gameState = GameState.PLAYING;
    this.state.readyCountdown = 0;
    
    this.setMetadata({
      gameState: this.state.gameState,
      playerCount: this.state.players.size,
      maxPlayers: MAX_PLAYERS
    });
    
    // Reset all players
    Array.from(this.state.players.values()).forEach((player: any) => {
      player.lives = PLAYER_LIVES;
      player.alive = true;
      player.ready = false;
    });
  }

  private handleMove(client: any, direction: Direction) {
    const player = this.state.players.get(client.sessionId);
    if (!player || !player.alive) return;

    const newPos = this.getNewPosition(player, direction);
    if (this.isValidPosition(newPos)) {
      player.x = newPos.x;
      player.y = newPos.y;
      player.facing = direction;
      
      // Check if player is on an enemy colored cell
      this.checkPlayerCollision(player);
    }
  }

  private getNewPosition(player: Player, direction: Direction): Position {
    const pos = { x: player.x, y: player.y };
    
    switch (direction) {
      case Direction.UP:
        pos.y -= 1;
        break;
      case Direction.DOWN:
        pos.y += 1;
        break;
      case Direction.LEFT:
        pos.x -= 1;
        break;
      case Direction.RIGHT:
        pos.x += 1;
        break;
    }
    
    return pos;
  }

  private isValidPosition(pos: Position): boolean {
    return pos.x >= 0 && pos.x < GRID_SIZE && pos.y >= 0 && pos.y < GRID_SIZE;
  }

  private handleFire(client: any) {
    const player = this.state.players.get(client.sessionId);
    if (!player || !player.alive) return;

    setTimeout(() => {
      this.fireLaser(player);
    }, FIRE_DELAY);
  }

  private fireLaser(player: Player) {
    const direction = player.facing;
    const startPos = { x: player.x, y: player.y };
    const affectedCells: string[] = [];

    // Fire in the direction the player is facing
    let currentPos = { ...startPos };
    
    while (true) {
      const nextPos = this.getNewPosition({ 
        x: currentPos.x, 
        y: currentPos.y, 
        facing: direction 
      } as Player, direction);
      
      if (!this.isValidPosition(nextPos)) break;
      
      currentPos = nextPos;
      const cellKey = `${currentPos.x},${currentPos.y}`;
      const cell = this.state.grid.get(cellKey);
      if (cell) {
        cell.state = player.color as any as CellState;
        affectedCells.push(cellKey);
        
        // Check if any players are hit
        this.checkPlayersAtPosition(currentPos, player.color);
      }
    }

    // Set timer to revert cells back to neutral
    affectedCells.forEach(cellKey => {
      const existingTimer = this.colorTimers.get(cellKey);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }
      
      const timer = setTimeout(() => {
        const cell = this.state.grid.get(cellKey);
        if (cell) {
          cell.state = CellState.NEUTRAL;
        }
        this.colorTimers.delete(cellKey);
      }, COLOR_DURATION);
      
      this.colorTimers.set(cellKey, timer);
    });
  }

  private checkPlayersAtPosition(pos: Position, attackerColor: PlayerColor) {
    Array.from(this.state.players.values()).forEach((player: any) => {
      if (player.x === pos.x && player.y === pos.y && 
          player.color !== attackerColor && player.alive) {
        this.hitPlayer(player);
      }
    });
  }

  private checkPlayerCollision(player: Player) {
    const cellKey = `${player.x},${player.y}`;
    const cell = this.state.grid.get(cellKey);
    
    if (cell && cell.state !== CellState.NEUTRAL && cell.state !== (player.color as any)) {
      this.hitPlayer(player);
    }
  }

  private hitPlayer(player: Player) {
    player.lives -= 1;
    
    if (player.lives <= 0) {
      player.alive = false;
      
      // Check for game over
      const alivePlayers = Array.from(this.state.players.values()).filter((p: any) => p.alive);
      if (alivePlayers.length <= 1) {
        this.endGame(alivePlayers[0] as any);
      }
    }
  }

  private endGame(winner?: Player) {
    this.state.gameState = GameState.GAME_OVER;
    this.state.winner = winner?.id || '';
    
    this.setMetadata({
      gameState: this.state.gameState,
      playerCount: this.state.players.size,
      maxPlayers: MAX_PLAYERS
    });
    
    // Return to lobby after delay
    setTimeout(() => {
      this.returnToLobby();
    }, 5000);
  }

  private returnToLobby() {
    this.state.gameState = GameState.LOBBY;
    this.state.winner = '';
    
    this.setMetadata({
      gameState: this.state.gameState,
      playerCount: this.state.players.size,
      maxPlayers: MAX_PLAYERS
    });
    
    // Reset grid
    this.initializeGrid();
    
    // Reset players
    Array.from(this.state.players.values()).forEach((player: any) => {
      player.ready = false;
      player.alive = true;
      player.lives = PLAYER_LIVES;
      
      // Reset positions
      const playerIndex = Array.from(this.state.players.keys()).indexOf(player.id);
      const startPos = this.getStartingPosition(playerIndex);
      player.x = startPos.x;
      player.y = startPos.y;
    });
  }

  private gameLoop() {
    if (this.state.readyCountdown > 0) {
      this.state.readyCountdown = Math.max(0, this.state.readyCountdown - 16);
    }
  }
}