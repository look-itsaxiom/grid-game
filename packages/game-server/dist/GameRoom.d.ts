declare const Room: any;
import { GameRoom } from 'shared';
import { CreateRoomOptions, JoinRoomOptions } from 'shared';
export declare class GridGameRoom extends Room<GameRoom> {
    private gameLoopInterval?;
    private colorTimers;
    private chargingTimers;
    private invulnerabilityTimers;
    onCreate(options?: CreateRoomOptions): void;
    onJoin(client: any, options?: JoinRoomOptions): void;
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
    private startProgressiveLaser;
    private fireCellLaser;
    private checkPlayersAtPosition;
    private checkPlayerCollision;
    private hitPlayer;
    private startInvulnerability;
    private endGame;
    private returnToLobby;
    private gameLoop;
}
export {};
//# sourceMappingURL=GameRoom.d.ts.map