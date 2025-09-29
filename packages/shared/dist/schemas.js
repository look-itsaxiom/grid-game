var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Schema, type, MapSchema } from '@colyseus/schema';
import { PlayerColor, CellState, Direction } from './types.js';
export class Player extends Schema {
    constructor() {
        super(...arguments);
        this.id = '';
        this.color = PlayerColor.RED;
        this.x = 0;
        this.y = 0;
        this.lives = 3;
        this.ready = false;
        this.alive = true;
        this.facing = Direction.UP;
        this.invulnerable = false;
        this.invulnerabilityTimer = 0;
    }
}
__decorate([
    type('string'),
    __metadata("design:type", String)
], Player.prototype, "id", void 0);
__decorate([
    type('string'),
    __metadata("design:type", String)
], Player.prototype, "color", void 0);
__decorate([
    type('number'),
    __metadata("design:type", Number)
], Player.prototype, "x", void 0);
__decorate([
    type('number'),
    __metadata("design:type", Number)
], Player.prototype, "y", void 0);
__decorate([
    type('number'),
    __metadata("design:type", Number)
], Player.prototype, "lives", void 0);
__decorate([
    type('boolean'),
    __metadata("design:type", Boolean)
], Player.prototype, "ready", void 0);
__decorate([
    type('boolean'),
    __metadata("design:type", Boolean)
], Player.prototype, "alive", void 0);
__decorate([
    type('string'),
    __metadata("design:type", String)
], Player.prototype, "facing", void 0);
__decorate([
    type('boolean'),
    __metadata("design:type", Boolean)
], Player.prototype, "invulnerable", void 0);
__decorate([
    type('number'),
    __metadata("design:type", Number)
], Player.prototype, "invulnerabilityTimer", void 0);
export class GridCell extends Schema {
    constructor() {
        super(...arguments);
        this.state = CellState.NEUTRAL;
        this.colorTimer = 0;
        this.charging = false;
        this.chargingTimer = 0;
    }
}
__decorate([
    type('string'),
    __metadata("design:type", String)
], GridCell.prototype, "state", void 0);
__decorate([
    type('number'),
    __metadata("design:type", Number)
], GridCell.prototype, "colorTimer", void 0);
__decorate([
    type('boolean'),
    __metadata("design:type", Boolean)
], GridCell.prototype, "charging", void 0);
__decorate([
    type('number'),
    __metadata("design:type", Number)
], GridCell.prototype, "chargingTimer", void 0);
export class GameRoom extends Schema {
    constructor() {
        super(...arguments);
        this.gameState = 'lobby';
        this.players = new MapSchema();
        this.grid = new MapSchema();
        this.winner = '';
        this.gameTimer = 0;
        this.readyCountdown = 0;
    }
}
__decorate([
    type('string'),
    __metadata("design:type", String)
], GameRoom.prototype, "gameState", void 0);
__decorate([
    type({ map: Player }),
    __metadata("design:type", Object)
], GameRoom.prototype, "players", void 0);
__decorate([
    type({ map: GridCell }),
    __metadata("design:type", Object)
], GameRoom.prototype, "grid", void 0);
__decorate([
    type('string'),
    __metadata("design:type", String)
], GameRoom.prototype, "winner", void 0);
__decorate([
    type('number'),
    __metadata("design:type", Number)
], GameRoom.prototype, "gameTimer", void 0);
__decorate([
    type('number'),
    __metadata("design:type", Number)
], GameRoom.prototype, "readyCountdown", void 0);
//# sourceMappingURL=schemas.js.map