// Game constants and types
export const GRID_SIZE = 12;
export const MAX_PLAYERS = 4;
export const PLAYER_LIVES = 3;

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