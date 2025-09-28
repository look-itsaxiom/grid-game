import { Schema, type, MapSchema } from '@colyseus/schema';
import { PlayerColor, CellState, Direction } from './types.js';

export class Player extends Schema {
  @type('string') id: string = '';
  @type('string') color: PlayerColor = PlayerColor.RED;
  @type('number') x: number = 0;
  @type('number') y: number = 0;
  @type('number') lives: number = 3;
  @type('boolean') ready: boolean = false;
  @type('boolean') alive: boolean = true;
  @type('string') facing: Direction = Direction.UP;
}

export class GridCell extends Schema {
  @type('string') state: CellState = CellState.NEUTRAL;
  @type('number') colorTimer: number = 0;
}

export class GameRoom extends Schema {
  @type('string') gameState: string = 'lobby';
  @type({ map: Player }) players = new MapSchema<Player>();
  @type({ map: GridCell }) grid = new MapSchema<GridCell>();
  @type('string') winner: string = '';
  @type('number') gameTimer: number = 0;
  @type('number') readyCountdown: number = 0;
}