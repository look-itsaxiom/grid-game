import { Schema, MapSchema } from '@colyseus/schema';
import { PlayerColor, CellState, Direction } from './types.js';
export declare class Player extends Schema {
    id: string;
    color: PlayerColor;
    x: number;
    y: number;
    lives: number;
    ready: boolean;
    alive: boolean;
    facing: Direction;
}
export declare class GridCell extends Schema {
    state: CellState;
    colorTimer: number;
}
export declare class GameRoom extends Schema {
    gameState: string;
    players: MapSchema<Player, string>;
    grid: MapSchema<GridCell, string>;
    winner: string;
    gameTimer: number;
    readyCountdown: number;
}
//# sourceMappingURL=schemas.d.ts.map