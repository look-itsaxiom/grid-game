import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Server } = require('colyseus');

import { createServer } from 'http';
import express from 'express';
import cors from 'cors';
import { GridGameRoom } from './GameRoom.js';

const port = Number(process.env.PORT || 3000);
const app = express();

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

// Register the game room
gameServer.define('grid_game', GridGameRoom);

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
    // For now, return a simple response indicating no rooms API available
    // In production, you'd typically implement room listing via presence or database
    res.json({ 
      success: true,
      rooms: [],
      totalRooms: 0,
      message: 'Room listing available - join/create rooms through the game client'
    });
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ error: 'Failed to fetch rooms' });
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