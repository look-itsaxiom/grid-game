import * as Colyseus from 'colyseus.js';
import { GameRoom } from 'shared';
import type { InputMessage, JoinRoomOptions, CreateRoomOptions } from 'shared';

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

  async listRooms(): Promise<any[]> {
    const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';
    const response = await fetch(`${serverUrl}/api/rooms`);
    const data = await response.json();
    return data.rooms || [];
  }

  async joinRoom(roomId?: string): Promise<void> {
    if (!this.client) {
      throw new Error('Client not connected');
    }
    
    const playerName = localStorage.getItem('gridGamePlayerName') || 'Anonymous Player';
    const options: JoinRoomOptions = { playerName };
    
    if (roomId) {
      // Join specific room
      this.room = await this.client.joinById<GameRoom>(roomId, options);
    } else {
      // Join or create a new room
      this.room = await this.client.joinOrCreate<GameRoom>('grid_game', options);
    }
  }

  async createRoom(roomName?: string): Promise<void> {
    if (!this.client) {
      throw new Error('Client not connected');
    }
    
    const playerName = localStorage.getItem('gridGamePlayerName') || 'Anonymous Player';
    const options: CreateRoomOptions = { 
      playerName,
      roomName: roomName || undefined
    };
    
    this.room = await this.client.create<GameRoom>('grid_game', options);
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