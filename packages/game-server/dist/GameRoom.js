import { Room, ServerError } from 'colyseus';
import { GameRoom, Player, GridCell } from 'shared';
import { GRID_SIZE, MAX_PLAYERS, PLAYER_LIVES, PlayerColor, CellState, GameState, Direction } from 'shared';
const FIRE_DELAY = 500; // ms
const COLOR_DURATION = 2000; // ms  
const READY_COUNTDOWN = 3000; // ms
export class GridGameRoom extends Room {
    constructor() {
        super(...arguments);
        this.colorTimers = new Map();
    }
    onCreate() {
        this.setState(new GameRoom());
        this.initializeGrid();
        this.maxClients = MAX_PLAYERS;
        this.onMessage('input', (client, message) => {
            this.handleInput(client, message);
        });
        // Game loop for color timing and transitions
        this.gameLoopInterval = setInterval(() => {
            this.gameLoop();
        }, 16); // ~60fps
    }
    onJoin(client) {
        console.log(`Player ${client.sessionId} joined`);
        if (Object.keys(this.state.players).length >= MAX_PLAYERS) {
            throw new ServerError(400, 'Room is full');
        }
        const player = new Player();
        player.id = client.sessionId;
        player.color = this.getNextAvailableColor();
        player.lives = PLAYER_LIVES;
        // Set starting position
        const startPos = this.getStartingPosition(Object.keys(this.state.players).length);
        player.x = startPos.x;
        player.y = startPos.y;
        this.state.players.set(client.sessionId, player);
    }
    onLeave(client) {
        console.log(`Player ${client.sessionId} left`);
        this.state.players.delete(client.sessionId);
        // If game was in progress and not enough players, end game
        if (this.state.gameState === GameState.PLAYING && Object.keys(this.state.players).length < 2) {
            this.endGame();
        }
    }
    onDispose() {
        if (this.gameLoopInterval) {
            clearInterval(this.gameLoopInterval);
        }
        this.colorTimers.forEach(timer => clearTimeout(timer));
    }
    initializeGrid() {
        for (let x = 0; x < GRID_SIZE; x++) {
            for (let y = 0; y < GRID_SIZE; y++) {
                const cell = new GridCell();
                cell.state = CellState.NEUTRAL;
                this.state.grid.set(`${x},${y}`, cell);
            }
        }
    }
    getNextAvailableColor() {
        const usedColors = Array.from(this.state.players.values()).map(p => p.color);
        const colors = [PlayerColor.RED, PlayerColor.BLUE, PlayerColor.GREEN, PlayerColor.YELLOW];
        return colors.find(color => !usedColors.includes(color)) || PlayerColor.RED;
    }
    getStartingPosition(playerIndex) {
        const positions = [
            { x: 1, y: 1 }, // Red - top left
            { x: GRID_SIZE - 2, y: GRID_SIZE - 2 }, // Blue - bottom right  
            { x: 1, y: GRID_SIZE - 2 }, // Green - bottom left
            { x: GRID_SIZE - 2, y: 1 } // Yellow - top right
        ];
        return positions[playerIndex] || { x: 0, y: 0 };
    }
    handleInput(client, message) {
        const player = this.state.players.get(client.sessionId);
        if (!player)
            return;
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
    handleReady(client) {
        const player = this.state.players.get(client.sessionId);
        if (!player || this.state.gameState !== GameState.LOBBY)
            return;
        player.ready = !player.ready;
        // Check if all players are ready
        const allPlayers = Array.from(this.state.players.values());
        if (allPlayers.length >= 2 && allPlayers.every(p => p.ready)) {
            this.startReadyCountdown();
        }
    }
    startReadyCountdown() {
        this.state.gameState = GameState.READY;
        this.state.readyCountdown = READY_COUNTDOWN;
        setTimeout(() => {
            this.startGame();
        }, READY_COUNTDOWN);
    }
    startGame() {
        this.state.gameState = GameState.PLAYING;
        this.state.readyCountdown = 0;
        // Reset all players
        Array.from(this.state.players.values()).forEach(player => {
            player.lives = PLAYER_LIVES;
            player.alive = true;
            player.ready = false;
        });
    }
    handleMove(client, direction) {
        const player = this.state.players.get(client.sessionId);
        if (!player || !player.alive)
            return;
        const newPos = this.getNewPosition(player, direction);
        if (this.isValidPosition(newPos)) {
            player.x = newPos.x;
            player.y = newPos.y;
            player.facing = direction;
            // Check if player is on an enemy colored cell
            this.checkPlayerCollision(player);
        }
    }
    getNewPosition(player, direction) {
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
    isValidPosition(pos) {
        return pos.x >= 0 && pos.x < GRID_SIZE && pos.y >= 0 && pos.y < GRID_SIZE;
    }
    handleFire(client) {
        const player = this.state.players.get(client.sessionId);
        if (!player || !player.alive)
            return;
        setTimeout(() => {
            this.fireLaser(player);
        }, FIRE_DELAY);
    }
    fireLaser(player) {
        const direction = player.facing;
        const startPos = { x: player.x, y: player.y };
        const affectedCells = [];
        // Fire in the direction the player is facing
        let currentPos = { ...startPos };
        while (true) {
            const nextPos = this.getNewPosition({
                x: currentPos.x,
                y: currentPos.y,
                facing: direction
            }, direction);
            if (!this.isValidPosition(nextPos))
                break;
            currentPos = nextPos;
            const cellKey = `${currentPos.x},${currentPos.y}`;
            const cell = this.state.grid.get(cellKey);
            if (cell) {
                cell.state = player.color;
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
    checkPlayersAtPosition(pos, attackerColor) {
        Array.from(this.state.players.values()).forEach(player => {
            if (player.x === pos.x && player.y === pos.y &&
                player.color !== attackerColor && player.alive) {
                this.hitPlayer(player);
            }
        });
    }
    checkPlayerCollision(player) {
        const cellKey = `${player.x},${player.y}`;
        const cell = this.state.grid.get(cellKey);
        if (cell && cell.state !== CellState.NEUTRAL && cell.state !== player.color) {
            this.hitPlayer(player);
        }
    }
    hitPlayer(player) {
        player.lives -= 1;
        if (player.lives <= 0) {
            player.alive = false;
            // Check for game over
            const alivePlayers = Array.from(this.state.players.values()).filter(p => p.alive);
            if (alivePlayers.length <= 1) {
                this.endGame(alivePlayers[0]);
            }
        }
    }
    endGame(winner) {
        this.state.gameState = GameState.GAME_OVER;
        this.state.winner = winner?.id || '';
        // Return to lobby after delay
        setTimeout(() => {
            this.returnToLobby();
        }, 5000);
    }
    returnToLobby() {
        this.state.gameState = GameState.LOBBY;
        this.state.winner = '';
        // Reset grid
        this.initializeGrid();
        // Reset players
        Array.from(this.state.players.values()).forEach(player => {
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
    gameLoop() {
        if (this.state.readyCountdown > 0) {
            this.state.readyCountdown = Math.max(0, this.state.readyCountdown - 16);
        }
    }
}
//# sourceMappingURL=GameRoom.js.map