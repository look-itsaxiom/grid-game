declare const Room: any;
import { GameRoom } from 'shared';
export declare class GridGameRoom extends Room<GameRoom> {
    private gameLoopInterval?;
    private colorTimers;
    onCreate(): void;
    onJoin(client: any): void;
    onLeave(client: any): void;
    onDispose(): void;
    private initializeGrid;
    private getNextAvailableColor;
    private getStartingPosition;
    private handleInput;
    private handleReady;
    private startReadyCountdown;
    private startGame;
    private handleMove;
    private getNewPosition;
    private isValidPosition;
    private handleFire;
    private fireLaser;
    private checkPlayersAtPosition;
    private checkPlayerCollision;
    private hitPlayer;
    private endGame;
    private returnToLobby;
    private gameLoop;
}
export {};
//# sourceMappingURL=GameRoom.d.ts.map