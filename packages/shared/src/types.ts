// Game constants and types
export const GRID_SIZE = 12;
export const MAX_PLAYERS = 4;
export const PLAYER_LIVES = 3;
export const INVULNERABILITY_DURATION = 5000; // 5 seconds
export const LASER_CHARGE_TIME = 200; // Time each tile charges before firing
export const LASER_PROGRESSION_DELAY = 100; // Delay between each tile lighting up

export enum PlayerColor {
  RED = 'red',
  BLUE = 'blue', 
  GREEN = 'green',
  YELLOW = 'yellow'
}

export enum CellState {
  NEUTRAL = 'neutral',
  RED = 'red',
  BLUE = 'blue',
  GREEN = 'green',
  YELLOW = 'yellow'
}

export enum GameState {
  LOBBY = 'lobby',
  READY = 'ready', 
  PLAYING = 'playing',
  GAME_OVER = 'game_over'
}

export enum Direction {
  UP = 'up',
  DOWN = 'down',
  LEFT = 'left',
  RIGHT = 'right'
}

export interface Position {
  x: number;
  y: number;
}

export interface InputMessage {
  type: 'move' | 'fire' | 'ready';
  direction?: Direction;
}

export interface GameConfig {
  gridSize: number;
  maxPlayers: number;
  playerLives: number;
  fireDelay: number;
  colorDuration: number;
}