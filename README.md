# 4-Player Grid Game

A competitive multiplayer grid game where up to 4 players battle using colored lasers on a 12x12 grid. Built with authoritative server architecture using Colyseus and Phaser 3.

![Game Screenshot](https://github.com/user-attachments/assets/d1b81aa9-5d8e-4cc4-894e-a9ae12b62897)

## Game Features

### Core Gameplay
- **4-Player Support**: Red, Blue, Green, and Yellow players
- **12x12 Grid Battle Arena**: Strategic movement and positioning
- **Life System**: Each player starts with 3 lives
- **Directional Firing**: Shoot colored lasers in the direction you're facing
- **Collision Detection**: Get caught in enemy colors to lose a life
- **Last Player Standing**: Win by eliminating all other players

### Game Flow
1. **Start Screen** - Welcome screen with play and credits options
2. **Lobby Finder** - Create or join a game lobby 
3. **Ready Up** - All players must ready before game starts
4. **Main Game** - Real-time 12x12 grid battle
5. **Game Over** - Winner announcement and replay options
6. **Credits** - Development and technology information

### Technical Features
- **Authoritative Server**: All game logic runs on the server
- **Real-time Multiplayer**: Powered by Colyseus WebSocket framework
- **Type-safe Development**: Full TypeScript implementation
- **Monorepo Architecture**: Clean separation of client, server, and shared code
- **Modern Web Stack**: Vite, Phaser 3, Node.js

## Project Structure

```
grid-game/
├── packages/
│   ├── game-client/     # Phaser 3 frontend (Vite + TypeScript)
│   ├── game-server/     # Colyseus backend (Node.js + TypeScript)
│   └── shared/          # Shared types and schemas
├── package.json         # Workspace configuration
└── README.md
```

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm 7+

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd grid-game

# Install all dependencies
npm install

# Build shared package
npm run build:shared
```

### Development

#### Start the Game Server
```bash
npm run dev:server
```
Server runs on `http://localhost:3000` with WebSocket endpoint at `ws://localhost:3000`

#### Start the Game Client  
```bash
npm run dev:client
```
Client runs on `http://localhost:5173`

### Testing Multiplayer
1. Open multiple browser tabs to `http://localhost:5173`
2. Click "PLAY" in each tab to join the same lobby
3. Click "READY" when all players have joined
4. Game starts automatically when everyone is ready

## Game Controls

- **WASD** or **Arrow Keys**: Move player
- **Space**: Fire laser in facing direction
- **Mouse**: Navigate menus and UI

## Game Rules

1. **Movement**: Players move one square at a time (no diagonal movement)
2. **Firing**: Lasers travel in straight lines until they hit a wall
3. **Color System**: Lasers temporarily color squares in the player's color
4. **Damage**: Players lose a life when caught on enemy-colored squares
5. **Victory**: Last player alive wins the round
6. **Lobby Return**: After game over, players return to lobby for another round

## Building for Production

```bash
# Build all packages
npm run build

# Start production server
npm run start:server

# Serve built client (use a static server like nginx)
npm run build:client && serve packages/game-client/dist
```

## Technology Stack

- **Frontend**: Phaser 3, Vite, TypeScript
- **Backend**: Node.js, Colyseus, TypeScript  
- **Shared**: TypeScript, Colyseus Schema
- **Build Tools**: npm Workspaces, Vite
- **Real-time Communication**: WebSockets (via Colyseus)

## Development

### Workspace Commands
```bash
# Run client development server
npm run dev:client

# Run server development server  
npm run dev:server

# Build shared types
npm run build:shared

# Build everything
npm run build
```

### Package Dependencies
- `shared` package is used by both `game-client` and `game-server`
- Automatic workspace linking via npm workspaces
- TypeScript project references for type checking

## Architecture

### Authoritative Server Design
- **Server Authority**: All game logic runs on the server
- **Client Prediction**: Clients only send input and render server state
- **State Synchronization**: Colyseus automatically syncs game state
- **Validation**: Server validates all player actions

### Networking
- **WebSocket Connection**: Real-time bidirectional communication
- **Room Management**: Automatic lobby creation and player matching
- **State Management**: Schema-based state synchronization
- **Message Handling**: Type-safe input/output messages

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test multiplayer functionality
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Credits

Built with ❤️ using:
- [Phaser 3](https://phaser.io) - Game engine
- [Colyseus](https://colyseus.io) - Multiplayer framework
- [Vite](https://vitejs.dev) - Build tool
- [TypeScript](https://typescriptlang.org) - Type safety