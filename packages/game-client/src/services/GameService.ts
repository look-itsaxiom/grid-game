import * as Colyseus from 'colyseus.js';
import { GameRoom } from 'shared';
import type { InputMessage } from 'shared';

export class GameService {
  private static instance: GameService;
  private client?: Colyseus.Client;
  private room?: Colyseus.Room<GameRoom>;
  
  private constructor() {}
  
  static getInstance(): GameService {
    if (!GameService.instance) {
      GameService.instance = new GameService();
    }
    return GameService.instance;
  }

  async connect(): Promise<void> {
    const serverUrl = import.meta.env.VITE_SERVER_URL || 'ws://localhost:3000';
    this.client = new Colyseus.Client(serverUrl);
  }

  async joinRoom(): Promise<void> {
    if (!this.client) {
      throw new Error('Client not connected');
    }
    
    this.room = await this.client.joinOrCreate<GameRoom>('grid_game');
  }

  getRoom(): Colyseus.Room<GameRoom> | undefined {
    return this.room;
  }

  sendInput(message: InputMessage): void {
    if (this.room) {
      this.room.send('input', message);
    }
  }

  leave(): void {
    if (this.room) {
      this.room.leave();
      this.room = undefined;
    }
    this.client = undefined;
  }
}