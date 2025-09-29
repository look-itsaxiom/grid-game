// Game constants and types
export const GRID_SIZE = 12;
export const MAX_PLAYERS = 4;
export const PLAYER_LIVES = 3;
export var PlayerColor;
(function (PlayerColor) {
    PlayerColor["RED"] = "red";
    PlayerColor["BLUE"] = "blue";
    PlayerColor["GREEN"] = "green";
    PlayerColor["YELLOW"] = "yellow";
})(PlayerColor || (PlayerColor = {}));
export var CellState;
(function (CellState) {
    CellState["NEUTRAL"] = "neutral";
    CellState["RED"] = "red";
    CellState["BLUE"] = "blue";
    CellState["GREEN"] = "green";
    CellState["YELLOW"] = "yellow";
})(CellState || (CellState = {}));
export var GameState;
(function (GameState) {
    GameState["LOBBY"] = "lobby";
    GameState["READY"] = "ready";
    GameState["PLAYING"] = "playing";
    GameState["GAME_OVER"] = "game_over";
})(GameState || (GameState = {}));
export var Direction;
(function (Direction) {
    Direction["UP"] = "up";
    Direction["DOWN"] = "down";
    Direction["LEFT"] = "left";
    Direction["RIGHT"] = "right";
})(Direction || (Direction = {}));
//# sourceMappingURL=types.js.map