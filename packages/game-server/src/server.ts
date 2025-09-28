import { Server } from 'colyseus';
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
    // Simple room count - in a real app you'd implement proper room listing
    res.json({ message: 'Room listing not implemented yet' });
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});

gameServer.listen(port).then(() => {
  console.log(`🎮 Grid Game Server listening on port ${port}`);
  console.log(`📡 WebSocket endpoint: ws://localhost:${port}`);
  console.log(`🌐 Health check: http://localhost:${port}`);
}).catch((error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});