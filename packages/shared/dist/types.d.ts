export declare const GRID_SIZE = 12;
export declare const MAX_PLAYERS = 4;
export declare const PLAYER_LIVES = 3;
export declare const INVULNERABILITY_DURATION = 5000;
export declare const LASER_CHARGE_TIME = 200;
export declare const LASER_PROGRESSION_DELAY = 100;
export declare enum PlayerColor {
    RED = "red",
    BLUE = "blue",
    GREEN = "green",
    YELLOW = "yellow"
}
export declare enum CellState {
    NEUTRAL = "neutral",
    RED = "red",
    BLUE = "blue",
    GREEN = "green",
    YELLOW = "yellow"
}
export declare enum GameState {
    LOBBY = "lobby",
    READY = "ready",
    PLAYING = "playing",
    GAME_OVER = "game_over"
}
export declare enum Direction {
    UP = "up",
    DOWN = "down",
    LEFT = "left",
    RIGHT = "right"
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
//# sourceMappingURL=types.d.ts.map