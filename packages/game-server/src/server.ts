import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Server } = require('colyseus');

import { createServer } from 'http';
import express from 'express';
import cors from 'cors';
import { GridGameRoom } from './GameRoom.js';

const port = Number(process.env.PORT || 3000);
const app = express();

// Simple in-memory room registry for lobby browser
const roomRegistry = new Map();

// Enable CORS for cross-origin requests
app.use(cors());
app.use(express.json());

// Create HTTP server
const server = createServer(app);

// Create Colyseus server
const gameServer = new Server({
  server,
  // express: app, // optional: Colyseus can use the same Express app
});

// Register the game room with room registry hooks
gameServer.define('grid_game', GridGameRoom)
  .on('create', (room: any) => {
    console.log(`Room ${room.roomId} created`);
    roomRegistry.set(room.roomId, {
      roomId: room.roomId,
      playerCount: 0,
      maxPlayers: 4,
      gameState: 'lobby',
      created: new Date()
    });
  })
  .on('dispose', (room: any) => {
    console.log(`Room ${room.roomId} disposed`);
    roomRegistry.delete(room.roomId);
  })
  .on('join', (room: any, client: any) => {
    console.log(`Player joined room ${room.roomId}`);
    const roomInfo = roomRegistry.get(room.roomId);
    if (roomInfo) {
      roomInfo.playerCount = room.clients.length;
    }
  })
  .on('leave', (room: any, client: any) => {
    console.log(`Player left room ${room.roomId}`);
    const roomInfo = roomRegistry.get(room.roomId);
    if (roomInfo) {
      roomInfo.playerCount = room.clients.length;
    }
  });

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Grid Game Server is running!',
    port,
    timestamp: new Date().toISOString()
  });
});

// API endpoint to get room list (for lobby browser)  
app.get('/api/rooms', async (req, res) => {
  try {
    // Use our simple room registry
    const rooms = Array.from(roomRegistry.values());
    
    res.json({ 
      success: true,
      rooms: rooms,
      totalRooms: rooms.length
    });
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});

// Test endpoint to create a room programmatically (for testing purposes)
app.post('/api/test/create-room', async (req, res) => {
  try {
    console.log('Test endpoint: Creating room...');
    
    // Manually create a room entry in our registry for testing
    const roomId = `test_room_${Date.now()}`;
    roomRegistry.set(roomId, {
      roomId: roomId,
      playerCount: 0,
      maxPlayers: 4,
      gameState: 'lobby',
      created: new Date()
    });
    
    console.log(`Test room created in registry: ${roomId}`);
    
    res.json({
      success: true,
      roomId: roomId,
      message: 'Test room created successfully'
    });
  } catch (error) {
    console.error('Error creating test room:', error);
    res.status(500).json({ error: 'Failed to create test room' });
  }
});

gameServer.listen(port).then(() => {
  console.log(`🎮 Grid Game Server listening on port ${port}`);
  console.log(`📡 WebSocket endpoint: ws://localhost:${port}`);
  console.log(`🌐 Health check: http://localhost:${port}`);
}).catch((error: any) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});