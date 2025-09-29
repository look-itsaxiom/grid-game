import { Schema, MapSchema } from '@colyseus/schema';
import { PlayerColor, CellState, Direction } from './types.js';
export declare class Player extends Schema {
    id: string;
    name: string;
    color: PlayerColor;
    x: number;
    y: number;
    lives: number;
    ready: boolean;
    alive: boolean;
    facing: Direction;
    invulnerable: boolean;
    invulnerabilityTimer: number;
}
export declare class GridCell extends Schema {
    state: CellState;
    colorTimer: number;
    charging: boolean;
    chargingTimer: number;
}
export declare class GameRoom extends Schema {
    gameState: string;
    roomName: string;
    players: MapSchema<Player, string>;
    grid: MapSchema<GridCell, string>;
    winner: string;
    gameTimer: number;
    readyCountdown: number;
}
//# sourceMappingURL=schemas.d.ts.map