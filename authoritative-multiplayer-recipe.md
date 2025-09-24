
# Step-by-Step Recipe: 2-Player Grid Game (Authoritative Multiplayer) with Phaser 3, Vite, TypeScript, and npm Workspaces


This guide outlines the steps to build a simple 2-player competitive game: each player hops around a 12x12 grid, can "fire" to color squares, and tries to catch the other player in their color to win. The server is authoritative, and the project uses Phaser 3 (frontend), a Node backend, TypeScript, Vite, and npm workspaces for monorepo management.

**Additional screens and flow:**
- Start screen (title, play button)
- Lobby finder screen (find/join/create a game lobby)
- Ready up screen (both players must ready before game starts)
- Game over screen (show winner, option to play again or return to lobby)
- Credits screen (your name, asset credits if needed)

**Assets:**
- All assets will be custom and simple (colored squares, basic shapes, minimal art)

---

## 1. **Project Planning: Game Rules**
- 2 players: one red, one blue, each starts with 3 lives.
- 12x12 grid, each cell can be neutral (white), red, or blue.
- Players move from square to square (no diagonals unless you want to add them).
- Players can "fire" in the direction they face; after a short delay, all squares in that direction turn their color for a moment, then revert to neutral.
- If a player is on a square that turns the other player's color, they lose a life.
- When a player loses all lives, the other wins.
- All game logic (movement, firing, color changes, win/loss) is enforced by the server.


## 2. **Monorepo Setup with npm Workspaces**
- **Create a new npm workspaces project:**
	- Open a terminal and run:
		```sh
		mkdir my-multiplayer-game
		cd my-multiplayer-game
		npm init -y
		```
		(Replace `my-multiplayer-game` with your folder name.)
	- Edit the `package.json` to enable workspaces:
		```json
		{
			"name": "my-multiplayer-game",
			"version": "1.0.0",
			"private": true,
			"workspaces": [
				"packages/*"
			],
			"scripts": {
				"dev:client": "npm run dev --workspace=game-client",
				"dev:server": "npm run dev --workspace=game-server",
				"dev:shared": "npm run dev --workspace=shared",
				"build:shared": "npm run build --workspace=shared",
				"build:client": "npm run build --workspace=game-client",
				"build:server": "npm run build --workspace=game-server",
				"build:all": "npm run build:shared && npm run build --workspaces --if-present",
				"install:all": "npm install"
			}
		}
		```
	- Create the packages directory:
		```sh
		mkdir packages
		```
	- Create a root TypeScript configuration for project references:
		```sh
		touch tsconfig.json
		```
	- Add the following to the root `tsconfig.json`:
		```json
		{
			"files": [],
			"references": [
				{ "path": "./packages/shared" },
				{ "path": "./packages/game-server" },
				{ "path": "./packages/game-client" }
			]
		}
		```
- **Project structure:**
	- `packages/game-client` — Phaser frontend (Vite app)
	- `packages/game-server` — Node backend (Colyseus server)
	- `packages/shared` — Shared types, Colyseus schemas, and logic

---



## 3. **Frontend: Phaser 3 + Vite + TypeScript**
- **Create the frontend package:**
	- Create the directory:
		```sh
		mkdir packages/game-client
		```
	- Navigate to the packages directory and create the Vite project:
		```sh
		cd packages
		npm create vite@latest game-client -- --template vanilla-ts
		```
	- Return to root and install dependencies:
		```sh
		cd ..
		npm install
		```
- **Install Phaser and types:**
	- In the root directory, run:
		```sh
		npm install phaser --workspace=game-client
		npm install --save-dev @types/phaser --workspace=game-client
		```
- **Install Colyseus client:**
	- Install the Colyseus client for networking:
		```sh
		npm install colyseus.js --workspace=game-client
		```
- **Configure TypeScript for Phaser:**
	- Update your `packages/game-client/tsconfig.json` to include Phaser types and proper configuration:
		```json
		{
			"compilerOptions": {
				"target": "ES2022",
				"useDefineForClassFields": true,
				"module": "ESNext",
				"lib": ["ES2022", "DOM", "DOM.Iterable"],
				"types": ["vite/client"],
				"skipLibCheck": true,
				"moduleResolution": "bundler",
				"allowImportingTsExtensions": true,
				"verbatimModuleSyntax": true,
				"moduleDetection": "force",
				"noEmit": true,
				"strict": true,
				"noUnusedLocals": true,
				"noUnusedParameters": true,
				"erasableSyntaxOnly": true,
				"noFallthroughCasesInSwitch": true,
				"noUncheckedSideEffectImports": true
			},
			"include": ["src"],
			"references": [{ "path": "../shared" }]
		}
		```
	- Add Phaser types by updating the types array to include "phaser":
		```json
		"types": ["vite/client", "phaser"]
		```
	- Install Phaser types if not already installed:
		```sh
		npm install --save-dev @types/phaser --workspace=game-client
		```
- **Set up Phaser application structure:**
	- Create `packages/game-client/src/main.ts` as your entry point:
		```typescript
		import Phaser from 'phaser';
		import { StartScene } from './scenes/StartScene';
		import { LobbyScene } from './scenes/LobbyScene';
		import { GameScene } from './scenes/GameScene';
		
		const config: Phaser.Types.Core.GameConfig = {
			type: Phaser.AUTO,
			width: 800,
			height: 600,
			backgroundColor: '#2c3e50',
			scene: [StartScene, LobbyScene, GameScene],
			physics: {
				default: 'arcade',
				arcade: {
					gravity: { y: 0 },
					debug: false
				}
			}
		};
		
		new Phaser.Game(config);
		```
	- Update `packages/game-client/index.html` to include a proper canvas container and remove default Vite content.

- **Implement Phaser scenes step-by-step:**

	**Start Scene (`packages/game-client/src/scenes/StartScene.ts`):**
	- Extend `Phaser.Scene` and implement `preload()`, `create()`, and basic UI
	- Add a title text using `this.add.text()` with proper styling
	- Create a "Play" button using `this.add.rectangle()` and `setInteractive()`
	- Handle button clicks to transition to lobby scene: `this.scene.start('LobbyScene')`
	- Example structure:
		```typescript
		export class StartScene extends Phaser.Scene {
			constructor() {
				super({ key: 'StartScene' });
			}
			
			create() {
				// Add title, play button, handle interactions
				// Use this.scene.start('LobbyScene') for transitions
			}
		}
		```

	**Lobby Scene (`packages/game-client/src/scenes/LobbyScene.ts`):**
	- Initialize Colyseus client connection in `create()` method
	- Create UI for joining/creating rooms using Phaser text and interactive rectangles
	- Use Colyseus `client.joinOrCreate()` method to handle room joining
	- Display connection status and room information
	- Add "Ready" button that sends ready state to server
	- Listen for room state changes to know when both players are ready
	- Transition to game scene when match starts

	**Game Scene (`packages/game-client/src/scenes/GameScene.ts`):**
	- Create 12x12 grid using `this.add.grid()` or individual rectangles
	- Draw player avatars as colored circles using `this.add.circle()`
	- Implement grid coordinate system (convert pixel positions to grid positions)
	- Render grid cell colors based on server state
	- Show player lives using `this.add.text()` positioned at screen corners
	- Display game timer if needed
	- Example grid creation:
		```typescript
		// Create 12x12 grid of rectangles
		for (let x = 0; x < 12; x++) {
			for (let y = 0; y < 12; y++) {
				const cell = this.add.rectangle(
					x * CELL_SIZE + OFFSET_X, 
					y * CELL_SIZE + OFFSET_Y, 
					CELL_SIZE - 2, 
					CELL_SIZE - 2, 
					0xffffff
				);
				// Store cell reference for later color updates
			}
		}
		```

- **Input handling and networking:**
	
	**Keyboard Input Setup:**
	- Use `this.input.keyboard.createCursorKeys()` for arrow keys
	- Add WASD support using `this.input.keyboard.addKeys('W,S,A,D')`
	- Add spacebar for firing: `this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)`
	- Handle input in scene's `update()` method, but only send to server when keys are pressed (not held)
	
	**Colyseus Client Integration:**
	- Install and import: `import { Client } from 'colyseus.js'`
	- Create a configuration file for environment-specific settings:
		```typescript
		// packages/game-client/src/config/server-config.ts
		const SERVER_CONFIG = {
			development: {
				protocol: 'ws',
				hostname: 'localhost',
				port: 2567
			},
			production: {
				protocol: 'wss', // Use secure WebSocket in production
				hostname: 'your-game-server.com',
				port: 443 // Standard HTTPS port
			}
		};
		
		const isDevelopment = import.meta.env.MODE === 'development';
		const config = isDevelopment ? SERVER_CONFIG.development : SERVER_CONFIG.production;
		
		export const SERVER_URL = `${config.protocol}://${config.hostname}:${config.port}`;
		```
	- Create client instance: `const client = new Client(SERVER_URL)`
	- Join room with error handling:
		```typescript
		try {
			this.room = await client.joinOrCreate('GameRoom');
			console.log('Connected to room:', this.room.id);
		} catch (error) {
			console.error('Failed to join room:', error);
			// Handle connection failure (show error message, retry logic)
		}
		```
	- Send player input as messages: `this.room.send('move', { direction: 'up' })`
	- Listen for state changes with type safety:
		```typescript
		this.room.onStateChange((state: GameState) => {
			this.renderGameState(state);
		});
		```
	- Handle connection events:
		```typescript
		this.room.onLeave((code) => {
			console.log('Left room with code:', code);
			// Handle disconnection
		});
		
		this.room.onError((code, message) => {
			console.error('Room error:', code, message);
			// Handle room errors
		});
		```
	- Example input handling:
		```typescript
		update() {
			if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
				this.room?.send('move', { direction: 'up' });
			}
			if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
				this.room?.send('fire', {});
			}
		}
		```
	
	**State Rendering (Client-side prediction disabled for authoritative server):**
	- Never modify game state locally - only render what server sends
	- Update player positions when server state changes
	- Update grid colors when server broadcasts color changes
	- Show/hide UI elements based on game phase (lobby, playing, game over)

- **UI implementation:**
	- **Lives Display:** Use `this.add.text()` positioned at screen corners showing "Player 1: ❤❤❤"
	- **Game Status:** Show current game phase, winner announcement, connection status
	- **Simple Button Creation:** Use `this.add.rectangle()` + `this.add.text()` + `setInteractive()` for clickable buttons
	- **Responsive Layout:** Position UI elements relative to `this.cameras.main.width/height` for different screen sizes
	- Example UI setup:
		```typescript
		// Lives display
		this.player1Lives = this.add.text(16, 16, 'Player 1: ❤❤❤', {
			fontSize: '20px',
			color: '#ff0000'
		});
		
		// Game status
		this.statusText = this.add.text(400, 50, 'Waiting for players...', {
			fontSize: '18px',
			color: '#ffffff'
		}).setOrigin(0.5);
		```

---



## 4. **Backend: Authoritative Game Server with Colyseus**
- **Create the backend package:**
	- Create the directory and navigate to it:
		```sh
		mkdir packages/game-server
		cd packages/game-server
		```
	- Initialize a Node.js package:
		```sh
		npm init -y
		```
	- Update the package.json to ensure proper module configuration:
		```json
		{
			"name": "game-server",
			"version": "1.0.0",
			"type": "module",
			"main": "dist/server.js",
			"scripts": {
				"dev": "tsx watch src/server.ts",
				"build": "tsc",
				"start": "node dist/server.js"
			},
			"dependencies": {},
			"devDependencies": {}
		}
		```
	- Return to root:
		```sh
		cd ../..
		```
- **Install Colyseus and tools:**
	- From the root directory, run:
		```sh
		npm install colyseus @colyseus/schema @colyseus/tools express --workspace=game-server
		npm install --save-dev typescript @types/node tsx --workspace=game-server
		```
- **TypeScript config:**
	- Create `packages/game-server/tsconfig.json`:
		```json
		{
			"compilerOptions": {
				"target": "ES2020",
				"module": "ESNext",
				"moduleResolution": "node",
				"experimentalDecorators": true,
				"emitDecoratorMetadata": true,
				"outDir": "./dist",
				"rootDir": "./src",
				"strict": true,
				"esModuleInterop": true,
				"allowSyntheticDefaultImports": true,
				"skipLibCheck": true,
				"forceConsistentCasingInFileNames": true,
				"declaration": true,
				"declarationMap": true,
				"sourceMap": true
			},
			"include": ["src/**/*"],
			"exclude": ["node_modules", "dist"],
			"references": [{ "path": "../shared" }]
		}
		```
- **Create the main server file:**
	- Create `packages/game-server/src/server.ts`:
		```typescript
		import { Server } from 'colyseus';
		import { createServer } from 'http';
		import express from 'express';
		import { GameRoom } from './rooms/GameRoom';
		
		const app = express();
		const gameServer = new Server({
			server: createServer(app)
		});
		
		// Register room handlers
		gameServer.define('GameRoom', GameRoom);
		
		// Optional: Express routes for health checks
		app.get('/', (req, res) => {
			res.send('Game server is running!');
		});
		
		gameServer.listen(2567);
		console.log('Game server listening on port 2567');
		```

- **Create the Game Room class:**
	- Create `packages/game-server/src/rooms/GameRoom.ts`:
		```typescript
		import { Room, Client } from 'colyseus';
		import { GameState, Player } from 'shared';
		
		export class GameRoom extends Room<GameState> {
			maxClients = 2;
			
			onCreate() {
				this.setState(new GameState());
				this.setupMessageHandlers();
				this.setupGameLoop();
			}
			
			onJoin(client: Client, options: any) {
				// Add player to game state
				// Handle lobby logic, ready states
			}
			
			onLeave(client: Client) {
				// Remove player, handle disconnections
			}
			
			setupMessageHandlers() {
				this.onMessage('move', (client, message) => {
					// Validate and apply player movement
				});
				
				this.onMessage('fire', (client, message) => {
					// Handle firing logic
				});
			}
			
			setupGameLoop() {
				// Set up interval for game tick updates
			}
		}
		```

- **Implement authoritative game logic:**

	**Player Movement Validation:**
	- Validate move requests against current player position
	- Check grid boundaries (0-11 for 12x12 grid)
	- Ensure players can't move diagonally (unless game rules allow)
	- Update player position in state only if valid
	- Example movement validation:
		```typescript
		onMessage('move', (client, message) => {
			const player = this.state.players.get(client.sessionId);
			if (!player || this.state.gamePhase !== 'playing') return;
			
			const { direction } = message;
			let newX = player.x;
			let newY = player.y;
			
			switch (direction) {
				case 'up': newY--; break;
				case 'down': newY++; break;
				case 'left': newX--; break;
				case 'right': newX++; break;
			}
			
			// Validate bounds
			if (newX >= 0 && newX < 12 && newY >= 0 && newY < 12) {
				player.x = newX;
				player.y = newY;
				player.direction = direction; // Store facing direction for firing
			}
		});
		```

	**Firing and Color Mechanics:**
	- Implement firing logic that colors squares in the direction player faces
	- Set timers for color duration (e.g., 3 seconds)
	- Check for hits when colors are applied
	- Handle life reduction and win conditions
	- Example firing implementation:
		```typescript
		onMessage('fire', (client, message) => {
			const player = this.state.players.get(client.sessionId);
			if (!player || player.canFire === false) return;
			
			// Color squares in facing direction
			this.colorSquaresInDirection(player.x, player.y, player.direction, player.color);
			
			// Set cooldown
			player.canFire = false;
			this.clock.setTimeout(() => {
				player.canFire = true;
			}, 2000); // 2 second cooldown
		});
		```

	**Game State Management:**
	- Track game phases: 'lobby', 'ready', 'playing', 'game_over'
	- Handle ready-up logic requiring both players to be ready
	- Implement win condition checking (when player loses all lives)
	- Manage room lifecycle (auto-dispose when empty)

- **Set up game loop with Colyseus Clock:**
	- Use `this.clock.setInterval()` for regular game ticks
	- Update color timers and revert squares to neutral
	- Check for collisions between players and colored squares
	- Example game loop:
		```typescript
		setupGameLoop() {
			this.clock.setInterval(() => {
				if (this.state.gamePhase !== 'playing') return;
				
				// Update color timers
				this.updateColorTimers();
				
				// Check for player hits
				this.checkPlayerHits();
				
				// Check win conditions
				this.checkWinConditions();
			}, 100); // 10 FPS game logic updates
		}
		```

- **Lobby and matchmaking implementation:**
	- Handle player ready states in `onMessage('ready')`
	- Start game when both players are ready
	- Implement reconnection logic for dropped connections
	- Add spectator support if desired
	- Example ready logic:
		```typescript
		onMessage('ready', (client, message) => {
			const player = this.state.players.get(client.sessionId);
			if (player) {
				player.isReady = true;
				
				// Check if all players are ready
				const allReady = Array.from(this.state.players.values())
					.every(p => p.isReady);
				
				if (allReady && this.state.players.size === 2) {
					this.startGame();
				}
			}
		});
		```

- **Error handling and validation:**
	- Validate all client inputs before applying to game state
	- Handle edge cases like rapid-fire attempts or invalid moves
	- Log errors for debugging: `console.error()` or use proper logging library
	- Implement rate limiting for message handling if needed

- **Optional Express routes:**
	- Add health check endpoint: `app.get('/health', (req, res) => res.json({ status: 'ok' }))`
	- Add room statistics: `app.get('/stats', (req, res) => res.json({ rooms: gameServer.presence.channels.size }))`
	- Serve static files if hosting client from same server

- **npm workspaces workflow:**
	- Use npm workspace commands to run/build the server:
		```sh
		npm run dev:server    # Runs tsx watch for hot reloading
		npm run build:server  # Compiles TypeScript to dist/
		npm run start --workspace=game-server  # Runs built server
		```

---


## 5. **Shared Types and Logic**
- **Create shared library:**
	- Create the directory and navigate to it:
		```sh
		mkdir packages/shared
		cd packages/shared
		```
	- Initialize the package:
		```sh
		npm init -y
		```
	- Update the package.json:
		```json
		{
			"name": "shared",
			"version": "1.0.0",
			"type": "module",
			"main": "dist/index.js",
			"types": "dist/index.d.ts",
			"exports": {
				".": {
					"types": "./dist/index.d.ts",
					"import": "./dist/index.js"
				}
			},
			"scripts": {
				"build": "tsc",
				"dev": "tsc --watch"
			}
		}
		```
	- Create `packages/shared/tsconfig.json`:
		```json
		{
			"compilerOptions": {
				"target": "ES2020",
				"module": "ESNext",
				"moduleResolution": "node",
				"experimentalDecorators": true,
				"emitDecoratorMetadata": true,
				"declaration": true,
				"declarationMap": true,
				"sourceMap": true,
				"outDir": "./dist",
				"rootDir": "./src",
				"strict": true,
				"esModuleInterop": true,
				"allowSyntheticDefaultImports": true,
				"skipLibCheck": true,
				"forceConsistentCasingInFileNames": true,
				"composite": true
			},
			"include": ["src/**/*"],
			"exclude": ["node_modules", "dist"]
		}
		```
	- Return to root:
		```sh
		cd ../..
		```
- **Install dependencies:**
	- From the root directory, run:
		```sh
		npm install @colyseus/schema --workspace=shared
		npm install --save-dev typescript --workspace=shared
		```
- **Create directory structure:**
	- Create `packages/shared/src/` directory structure:
		```
		packages/shared/src/
		├── index.ts          # Main export file
		├── schemas/          # Colyseus schema classes
		│   ├── GameState.ts
		│   ├── Player.ts
		│   └── GridCell.ts
		├── types/            # TypeScript type definitions
		│   └── game-types.ts
		└── constants/        # Game constants
		    └── game-constants.ts
		```

- **Define game constants:**
	- Create `packages/shared/src/constants/game-constants.ts`:
		```typescript
		export const GAME_CONFIG = {
			GRID_SIZE: 12,
			MAX_LIVES: 3,
			FIRE_COOLDOWN: 2000, // milliseconds
			COLOR_DURATION: 3000, // milliseconds
			TICK_RATE: 100 // milliseconds between game updates
		} as const;
		
		export enum GamePhase {
			LOBBY = 'lobby',
			READY = 'ready', 
			PLAYING = 'playing',
			GAME_OVER = 'game_over'
		}
		
		export enum PlayerColor {
			RED = 'red',
			BLUE = 'blue'
		}
		
		export enum Direction {
			UP = 'up',
			DOWN = 'down', 
			LEFT = 'left',
			RIGHT = 'right'
		}
		```

- **Define Colyseus Schema classes:**

	**Player Schema (`packages/shared/src/schemas/Player.ts`):**
	```typescript
	import { Schema, type } from '@colyseus/schema';
	import { PlayerColor, Direction } from '../constants/game-constants';
	
	export class Player extends Schema {
		@type('string') id: string = '';
		@type('string') color: PlayerColor = PlayerColor.RED;
		@type('number') x: number = 0;
		@type('number') y: number = 0;
		@type('string') direction: Direction = Direction.UP;
		@type('number') lives: number = 3;
		@type('boolean') isReady: boolean = false;
		@type('boolean') canFire: boolean = true;
		@type('boolean') isConnected: boolean = true;
	
		constructor(id: string, color: PlayerColor, startX: number, startY: number) {
			super();
			this.id = id;
			this.color = color;
			this.x = startX;
			this.y = startY;
		}
	}
	```

	**Grid Cell Schema (`packages/shared/src/schemas/GridCell.ts`):**
	```typescript
	import { Schema, type } from '@colyseus/schema';
	import { PlayerColor } from '../constants/game-constants';
	
	export class GridCell extends Schema {
		@type('number') x: number = 0;
		@type('number') y: number = 0;
		@type('string') color: PlayerColor | 'neutral' = 'neutral';
		@type('number') colorTimer: number = 0; // milliseconds remaining
	
		constructor(x: number, y: number) {
			super();
			this.x = x;
			this.y = y;
		}
	
		setColor(color: PlayerColor, duration: number) {
			this.color = color;
			this.colorTimer = duration;
		}
	
		updateTimer(deltaTime: number): boolean {
			if (this.colorTimer > 0) {
				this.colorTimer -= deltaTime;
				if (this.colorTimer <= 0) {
					this.color = 'neutral';
					this.colorTimer = 0;
					return true; // Color expired
				}
			}
			return false;
		}
	}
	```

	**Game State Schema (`packages/shared/src/schemas/GameState.ts`):**
	```typescript
	import { Schema, MapSchema, type } from '@colyseus/schema';
	import { Player } from './Player';
	import { GridCell } from './GridCell';
	import { GamePhase, GAME_CONFIG, PlayerColor } from '../constants/game-constants';
	
	export class GameState extends Schema {
		@type({ map: Player }) players = new MapSchema<Player>();
		@type({ map: GridCell }) grid = new MapSchema<GridCell>();
		@type('string') gamePhase: GamePhase = GamePhase.LOBBY;
		@type('number') gameTimer: number = 0;
		@type('string') winner: string = '';
		@type('number') lastUpdate: number = Date.now();
	
		constructor() {
			super();
			this.initializeGrid();
		}
	
		private initializeGrid() {
			// Create 12x12 grid
			for (let x = 0; x < GAME_CONFIG.GRID_SIZE; x++) {
				for (let y = 0; y < GAME_CONFIG.GRID_SIZE; y++) {
					const key = `${x},${y}`;
					this.grid.set(key, new GridCell(x, y));
				}
			}
		}
	
		addPlayer(sessionId: string): Player {
			const playerCount = this.players.size;
			const color = playerCount === 0 ? PlayerColor.RED : PlayerColor.BLUE;
			
			// Set starting positions (corners of grid)
			const startX = playerCount === 0 ? 0 : GAME_CONFIG.GRID_SIZE - 1;
			const startY = playerCount === 0 ? 0 : GAME_CONFIG.GRID_SIZE - 1;
			
			const player = new Player(sessionId, color, startX, startY);
			this.players.set(sessionId, player);
			
			return player;
		}
	
		removePlayer(sessionId: string) {
			this.players.delete(sessionId);
		}
	
		getGridCell(x: number, y: number): GridCell | undefined {
			return this.grid.get(`${x},${y}`);
		}
	
		startGame() {
			this.gamePhase = GamePhase.PLAYING;
			this.gameTimer = 0;
		}
	
		endGame(winnerId: string) {
			this.gamePhase = GamePhase.GAME_OVER;
			this.winner = winnerId;
		}
	}
	```

- **Define TypeScript types for client use:**
	- Create `packages/shared/src/types/game-types.ts`:
		```typescript
		import { PlayerColor, Direction, GamePhase } from '../constants/game-constants';
		
		// Message types for client-server communication
		export interface MoveMessage {
			direction: Direction;
		}
		
		export interface FireMessage {
			// Empty for now, could include targeting info later
		}
		
		export interface ReadyMessage {
			isReady: boolean;
		}
		
		// Client-side type definitions
		export interface ClientGameState {
			players: { [sessionId: string]: ClientPlayer };
			grid: { [key: string]: ClientGridCell };
			gamePhase: GamePhase;
			gameTimer: number;
			winner: string;
		}
		
		export interface ClientPlayer {
			id: string;
			color: PlayerColor;
			x: number;
			y: number;
			direction: Direction;
			lives: number;
			isReady: boolean;
			canFire: boolean;
			isConnected: boolean;
		}
		
		export interface ClientGridCell {
			x: number;
			y: number;
			color: PlayerColor | 'neutral';
			colorTimer: number;
		}
		
		// Utility types
		export type GridPosition = {
			x: number;
			y: number;
		};
		
		export type GameEventHandlers = {
			onPlayerJoin: (player: ClientPlayer) => void;
			onPlayerLeave: (playerId: string) => void;
			onGameStart: () => void;
			onGameEnd: (winner: string) => void;
			onPlayerHit: (playerId: string, newLives: number) => void;
		};
		```

- **Create main export file:**
	- Create `packages/shared/src/index.ts`:
		```typescript
		// Export schemas
		export { GameState } from './schemas/GameState';
		export { Player } from './schemas/Player';
		export { GridCell } from './schemas/GridCell';
		
		// Export constants
		export { GAME_CONFIG, GamePhase, PlayerColor, Direction } from './constants/game-constants';
		
		// Export types
		export type {
			MoveMessage,
			FireMessage,
			ReadyMessage,
			ClientGameState,
			ClientPlayer,
			ClientGridCell,
			GridPosition,
			GameEventHandlers
		} from './types/game-types';
		```

- **Type safety and workspace linking:**
	- Add the shared package as a dependency to other packages:
		```sh
		# Add to game-client dependencies
		npm install shared@* --workspace=game-client
		
		# Add to game-server dependencies  
		npm install shared@* --workspace=game-server
		```
	- npm workspaces will automatically link the local packages.
	- Import shared types in your client and server code:
		```typescript
		// In game-client
		import { GameState, PlayerColor, MoveMessage } from 'shared';
		
		// In game-server  
		import { GameState, Player, GAME_CONFIG } from 'shared';
		```

- **Schema compilation and usage:**
	- Colyseus schemas are automatically compiled and synchronized
	- Use schema instances on server: `this.setState(new GameState())`
	- Listen to schema changes on client: `room.onStateChange((state: GameState) => { ... })`
	- Access nested properties: `state.players.get(sessionId).lives`
	- Listen to specific changes: `room.state.players.onAdd = (player, sessionId) => { ... }`

---



## 6. **Game Loop and Networking**
- **Server-side game loop implementation:**

	**Main Game Tick Loop:**
	- Set up the primary game loop in your GameRoom class:
		```typescript
		setupGameLoop() {
			this.gameLoopInterval = this.clock.setInterval(() => {
				if (this.state.gamePhase !== GamePhase.PLAYING) return;
				
				const deltaTime = GAME_CONFIG.TICK_RATE;
				this.updateGame(deltaTime);
			}, GAME_CONFIG.TICK_RATE);
		}
		
		updateGame(deltaTime: number) {
			// Update color timers and revert expired colors
			this.updateGridColors(deltaTime);
			
			// Check for player collisions with colored squares
			this.checkPlayerCollisions();
			
			// Update game timer
			this.state.gameTimer += deltaTime;
			
			// Check win conditions
			this.checkWinConditions();
			
			// Update last update timestamp
			this.state.lastUpdate = Date.now();
		}
		```

	**Grid Color Management:**
	- Implement color timing and collision detection:
		```typescript
		updateGridColors(deltaTime: number) {
			this.state.grid.forEach((cell, key) => {
				if (cell.updateTimer(deltaTime)) {
					// Color expired, check if any players were affected
					this.checkCellColorExpiry(cell);
				}
			});
		}
		
		colorSquaresInDirection(startX: number, startY: number, direction: Direction, color: PlayerColor) {
			const cells = this.getSquaresInDirection(startX, startY, direction);
			
			cells.forEach(cell => {
				cell.setColor(color, GAME_CONFIG.COLOR_DURATION);
			});
		}
		
		getSquaresInDirection(startX: number, startY: number, direction: Direction): GridCell[] {
			const cells: GridCell[] = [];
			let x = startX;
			let y = startY;
			
			// Move in direction until hitting boundary
			while (true) {
				switch (direction) {
					case Direction.UP: y--; break;
					case Direction.DOWN: y++; break;
					case Direction.LEFT: x--; break;
					case Direction.RIGHT: x++; break;
				}
				
				if (x < 0 || x >= GAME_CONFIG.GRID_SIZE || y < 0 || y >= GAME_CONFIG.GRID_SIZE) {
					break;
				}
				
				const cell = this.state.getGridCell(x, y);
				if (cell) cells.push(cell);
			}
			
			return cells;
		}
		```

	**Collision Detection and Life Management:**
	- Check for player hits and manage lives:
		```typescript
		checkPlayerCollisions() {
			this.state.players.forEach((player, sessionId) => {
				const cell = this.state.getGridCell(player.x, player.y);
				if (!cell || cell.color === 'neutral' || cell.color === player.color) return;
				
				// Player hit by opponent's color
				this.handlePlayerHit(player, sessionId);
			});
		}
		
		handlePlayerHit(player: Player, sessionId: string) {
			player.lives--;
			
			// Broadcast hit event
			this.broadcast('player_hit', { 
				playerId: sessionId, 
				newLives: player.lives 
			});
			
			if (player.lives <= 0) {
				// Player eliminated
				this.handlePlayerElimination(sessionId);
			} else {
				// Respawn player at start position  
				this.respawnPlayer(player);
			}
		}
		
		respawnPlayer(player: Player) {
			// Move player back to starting corner with brief invincibility
			const startX = player.color === PlayerColor.RED ? 0 : GAME_CONFIG.GRID_SIZE - 1;
			const startY = player.color === PlayerColor.RED ? 0 : GAME_CONFIG.GRID_SIZE - 1;
			
			player.x = startX;
			player.y = startY;
		}
		```

- **Client-server networking patterns:**

	**Client-side State Management:**
	- Handle server state updates without client-side prediction:
		```typescript
		// In your Phaser scene
		initializeNetworking() {
			this.room.onStateChange((state: GameState) => {
				this.renderGameState(state);
			});
			
			// Listen for specific events
			this.room.onMessage('player_hit', (data) => {
				this.showHitEffect(data.playerId);
				this.updateLivesDisplay(data.playerId, data.newLives);
			});
			
			this.room.onMessage('game_start', () => {
				this.transitionToGameplay();
			});
			
			this.room.onMessage('game_end', (data) => {
				this.showGameOverScreen(data.winner);
			});
		}
		
		renderGameState(state: GameState) {
			// Update player positions
			state.players.forEach((player, sessionId) => {
				this.updatePlayerVisual(sessionId, player.x, player.y);
			});
			
			// Update grid colors
			state.grid.forEach((cell, key) => {
				this.updateCellColor(cell.x, cell.y, cell.color);
			});
			
			// Update UI
			this.updateGameUI(state);
		}
		```

	**Input Validation and Rate Limiting:**
	- Implement server-side input validation:
		```typescript
		// In GameRoom
		onMessage('move', (client, message: MoveMessage) => {
			const player = this.state.players.get(client.sessionId);
			if (!this.validateMoveInput(player, message)) return;
			
			this.processPlayerMove(player, message.direction);
		});
		
		validateMoveInput(player: Player | undefined, message: MoveMessage): boolean {
			if (!player) return false;
			if (this.state.gamePhase !== GamePhase.PLAYING) return false;
			if (!Object.values(Direction).includes(message.direction)) return false;
			
			// Check for rate limiting (prevent spam)
			const now = Date.now();
			if (now - player.lastMoveTime < 100) return false; // Max 10 moves per second
			
			return true;
		}
		```

	**Message Broadcasting Patterns:**
	- Use different broadcast methods for different events:
		```typescript
		// Broadcast to all clients
		this.broadcast('game_start', { timestamp: Date.now() });
		
		// Send to specific client
		this.send(client, 'invalid_move', { reason: 'Out of bounds' });
		
		// Broadcast to others (exclude sender)
		this.broadcast('player_joined', { playerId: client.sessionId }, { except: client });
		```

- **State synchronization best practices:**

	**Authoritative Server Pattern:**
	- Server is the single source of truth for all game state
	- Clients only send input commands, never state changes
	- Server validates all inputs before applying to game state
	- Clients render exactly what the server sends, no local prediction

	**Efficient State Updates:**
	- Use Colyseus automatic state synchronization for frequent updates
	- Send discrete events for important game moments (hits, powerups, etc.)
	- Example efficient state management:
		```typescript
		// Server only sends what changed
		// Colyseus automatically handles delta compression
		
		// For immediate feedback, send explicit messages
		onMessage('fire', (client, message) => {
			if (this.validateFireInput(client)) {
				this.processFiring(client);
				
				// Send immediate feedback to shooter
				this.send(client, 'fire_confirmed', { 
					cooldownDuration: GAME_CONFIG.FIRE_COOLDOWN 
				});
			}
		});
		```

	**Handling Disconnections:**
	- Implement graceful disconnection handling:
		```typescript
		onLeave(client: Client, consented: boolean) {
			const player = this.state.players.get(client.sessionId);
			if (player) {
				player.isConnected = false;
				
				// Give time for reconnection
				this.clock.setTimeout(() => {
					if (!player.isConnected) {
						this.state.removePlayer(client.sessionId);
						
						// End game if only one player remains
						if (this.state.players.size < 2) {
							this.endGameDueToDisconnection();
						}
					}
				}, 30000); // 30 second grace period
			}
		}
		
		onJoin(client: Client, options: any) {
			// Handle reconnection
			if (options.reconnect && this.state.players.has(client.sessionId)) {
				const player = this.state.players.get(client.sessionId);
				player.isConnected = true;
				this.send(client, 'reconnected', { gameState: this.state });
			} else {
				// New player
				this.addNewPlayer(client);
			}
		}
		```

- **Performance optimization:**
	- Use efficient update frequencies: 10Hz for game logic, 60Hz for rendering
	- Batch state changes within single tick
	- Only send relevant state to each client (if implementing spectator mode)
	- Use Colyseus built-in serialization optimizations

- **Error handling and debugging:**
	- Add comprehensive error logging:
		```typescript
		try {
			this.processPlayerMove(player, direction);
		} catch (error) {
			console.error('Move processing error:', error);
			this.send(client, 'error', { message: 'Move failed' });
		}
		```
	- Use Colyseus monitor for real-time debugging: `npm install --global @colyseus/monitor`
	- Add game state logging for debugging: `console.log('Game state:', JSON.stringify(this.state))`

---


## 7. **Development Workflow**
- **Build order matters:**
	- Always build the shared package first since other packages depend on it:
		```sh
		npm run build:shared
		```
	- Then build other packages:
		```sh
		npm run build:all
		```
- **Run apps:**
	- Use npm workspace commands to run and build both apps independently or together:
		```sh
		npm run dev:client    # Run frontend dev server
		npm run dev:server    # Run backend dev server
		npm run dev:shared    # Run shared package in watch mode
		npm run build:all     # Build all packages in correct order
		```
	- Or run directly in specific workspaces:
		```sh
		npm run dev --workspace=game-client
		npm run dev --workspace=game-server
		npm run dev --workspace=shared
		```
- **Install dependencies:**
	- Install to specific workspace:
		```sh
		npm install <package> --workspace=game-client
		npm install <package> --workspace=game-server
		```
	- Install to all workspaces:
		```sh
		npm install --workspaces
		```
- **Build and link shared package:**
	- When you make changes to shared types, build the shared package first:
		```sh
		npm run build:shared
		```
	- Or use the watch mode for development:
		```sh
		npm run dev:shared
		```
	- The other packages will automatically use the updated shared code via npm workspaces linking.
- **Debugging:**
	- Use Colyseus's playground or monitor tools for debugging rooms and state.
- **Package management:**
	- npm workspaces automatically handles linking between packages in the monorepo.
	- Use relative imports to reference shared code from client and server packages.
- **Troubleshooting:**
	- If you get import errors, ensure you've built the shared package first: `npm run build:shared`
	- If TypeScript can't find types, check that project references are properly set up in tsconfig.json files
	- Use `npm ls --workspaces` to verify all packages are properly linked

---


## 8. **Testing and Iteration**

- **Development testing workflow:**

	**Local Multi-client Testing:**
	- Run both client and server in development mode:
		```sh
		# Terminal 1: Build shared package
		npm run dev:shared
		
		# Terminal 2: Start server
		npm run dev:server
		
		# Terminal 3: Start client
		npm run dev:client
		```
	- Open multiple browser tabs (or different browsers) to `http://localhost:5173` (default Vite port)
	- Use different browsers or incognito windows to simulate different players
	- Use browser developer tools Network tab to monitor WebSocket connections

	**Mobile and Cross-platform Testing:**
	- Test on different devices by accessing your local dev server from other devices on the same network
	- Find your local IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
	- Update Vite config to bind to all interfaces: `vite --host 0.0.0.0`
	- Access from mobile device: `http://[YOUR_LOCAL_IP]:5173`

- **Colyseus development tools:**

	**Colyseus Monitor (Real-time Room Debugging):**
	- Install the monitor globally:
		```sh
		npm install --global @colyseus/monitor
		```
	- Start monitor (runs on port 2567 by default):
		```sh
		colyseus-monitor
		```
	- Access monitor at `http://localhost:2567/colyseus` to view:
		- Active rooms and their states
		- Connected clients
		- Real-time state changes
		- Room lifecycle events

	**Custom Debug Messages:**
	- Add comprehensive logging in your GameRoom:
		```typescript
		// In GameRoom.ts
		onJoin(client: Client) {
			console.log(`Player ${client.sessionId} joined`);
			console.log(`Room now has ${this.clients.length} players`);
		}
		
		onMessage('move', (client, message) => {
			console.log(`Player ${client.sessionId} moved ${message.direction}`);
			// Log current game state for debugging
			console.log('Current positions:', 
				Array.from(this.state.players.values()).map(p => ({id: p.id, x: p.x, y: p.y}))
			);
		}
		```

	**State Inspection Utilities:**
	- Add development-only state dump commands:
		```typescript
		// Debug message handler (remove in production)
		this.onMessage('debug_state', (client, message) => {
			if (process.env.NODE_ENV === 'development') {
				console.log('=== GAME STATE DEBUG ===');
				console.log('Game Phase:', this.state.gamePhase);
				console.log('Players:', this.state.players.toJSON());
				console.log('Grid:', Array.from(this.state.grid.values())
					.filter(cell => cell.color !== 'neutral')
					.map(cell => ({x: cell.x, y: cell.y, color: cell.color}))
				);
				console.log('========================');
			}
		});
		```

- **Game balance and tuning:**

	**Timing Adjustments:**
	- Test different values for game constants and adjust in `game-constants.ts`:
		```typescript
		// Experiment with these values during testing:
		export const GAME_CONFIG = {
			GRID_SIZE: 12,
			MAX_LIVES: 3,
			FIRE_COOLDOWN: 2000,    // Try 1500, 2500, 3000
			COLOR_DURATION: 3000,   // Try 2000, 4000, 5000  
			TICK_RATE: 100,         // Try 50, 150, 200
			MOVE_COOLDOWN: 150      // Add to prevent movement spam
		} as const;
		```

	**Playtesting Checklist:**
	- [ ] Can both players join and see each other?
	- [ ] Do movement controls feel responsive?
	- [ ] Is the firing cooldown appropriate?
	- [ ] Are color durations long enough to be strategic but not overpowered?
	- [ ] Do players understand when they've been hit?
	- [ ] Is the game length appropriate (not too short/long)?
	- [ ] Do win/loss conditions work correctly?
	- [ ] Can players easily start a new game?

	**Performance Testing:**
	- Monitor browser performance during gameplay:
		- Open browser DevTools → Performance tab
		- Record while playing to identify frame drops
		- Check for memory leaks during extended play
	- Server performance monitoring:
		```typescript
		// Add performance monitoring in GameRoom
		setupGameLoop() {
			let frameCount = 0;
			const startTime = Date.now();
			
			this.gameLoopInterval = this.clock.setInterval(() => {
				const tickStart = performance.now();
				
				// Your game logic here
				this.updateGame(GAME_CONFIG.TICK_RATE);
				
				const tickDuration = performance.now() - tickStart;
				frameCount++;
				
				// Log performance every 10 seconds
				if (frameCount % 100 === 0) {
					console.log(`Tick ${frameCount}: ${tickDuration.toFixed(2)}ms`);
				}
			}, GAME_CONFIG.TICK_RATE);
		}
		```

- **Debugging common issues:**

	**Connection Problems:**
	- Client can't connect to server:
		- Check if server is running: `curl http://localhost:2567`
		- Verify WebSocket URL in client matches server port
		- Check firewall settings
		- Try different browsers

	**State Synchronization Issues:**
	- Players not seeing each other's moves:
		- Verify schema decorators on all properties
		- Check that state changes are applied to schema instances
		- Use Colyseus monitor to verify state updates
		- Add logging to `onStateChange` in client

	**Input Lag or Stuttering:**
	- Reduce tick rate if server can't keep up
	- Check network latency with browser DevTools
		- Open Network tab, filter by WS (WebSocket)
		- Monitor message frequency and sizes
	- Consider input validation optimizations

	**Memory Leaks:**
	- Check for proper cleanup in Phaser scenes:
		```typescript
		// In Phaser scene
		destroy() {
			// Clean up Colyseus listeners
			this.room?.removeAllListeners();
			
			// Clean up Phaser objects
			this.children.removeAll(true);
			
			super.destroy();
		}
		```

- **Automated testing setup (optional):**

	**Unit Testing for Shared Logic:**
	- Install testing framework:
		```sh
		npm install --save-dev vitest --workspace=shared
		```
	- Test game constants and utility functions:
		```typescript
		// packages/shared/src/__tests__/game-logic.test.ts
		import { describe, it, expect } from 'vitest';
		import { GAME_CONFIG, GamePhase } from '../constants/game-constants';
		
		describe('Game Constants', () => {
			it('should have valid grid size', () => {
				expect(GAME_CONFIG.GRID_SIZE).toBeGreaterThan(0);
				expect(GAME_CONFIG.GRID_SIZE).toBeLessThanOrEqual(20);
			});
		});
		```

	**Integration Testing for Server:**
	- Test room creation and basic functionality:
		```typescript
		// packages/game-server/src/__tests__/GameRoom.test.ts
		import { ColyseusTestServer, boot } from '@colyseus/testing';
		import { GameRoom } from '../rooms/GameRoom';
		
		describe('GameRoom', () => {
			let colyseus: ColyseusTestServer;
			
			beforeAll(async () => {
				colyseus = await boot({
					rooms: [GameRoom]
				});
			});
			
			it('should create room and accept players', async () => {
				const room = await colyseus.createRoom('GameRoom');
				const client1 = await colyseus.connectTo(room);
				const client2 = await colyseus.connectTo(room);
				
				expect(room.clients.length).toBe(2);
			});
		});
		```

- **Performance optimization iteration:**
	- Profile and optimize based on testing results
	- Consider reducing state update frequency for non-critical updates
	- Batch multiple state changes within single tick
	- Use object pooling for frequently created/destroyed objects

- **User experience iteration:**
	- Add visual and audio feedback for important events
	- Implement smooth transitions between game states
	- Add loading states and connection status indicators
	- Consider adding tutorial or help screen based on user feedback

---

## 9. **Deployment and Production Setup**

- **Build production versions:**

	**Build all packages for production:**
	```sh
	# From root directory
	npm run build:all
	```
	This will:
	1. Build shared package first (creates types and compiled JS)
	2. Build game-server (compiles TypeScript to dist/)
	3. Build game-client (creates optimized Vite build in dist/)

	**Verify builds:**
	```sh
	# Check that all dist directories exist
	ls packages/*/dist/
	
	# Test production server locally
	cd packages/game-server && npm start
	
	# Test production client (serve static files)
	cd packages/game-client && npx serve dist/
	```

- **Backend deployment options:**

	**Option 1: Traditional VPS/Cloud Server (DigitalOcean, AWS EC2, etc.):**
	
	1. **Prepare server environment:**
		```sh
		# Install Node.js (version 18+ recommended)
		curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
		sudo apt-get install -y nodejs
		
		# Install PM2 for process management
		npm install -g pm2
		```

	2. **Deploy server code:**
		```sh
		# Upload your built server code to server
		scp -r packages/game-server/dist/ user@yourserver:/var/www/game-server/
		scp packages/game-server/package.json user@yourserver:/var/www/game-server/
		
		# On server, install production dependencies
		cd /var/www/game-server
		npm install --production
		```

	3. **Configure PM2:**
		```js
		// ecosystem.config.js
		module.exports = {
			apps: [{
				name: 'game-server',
				script: './dist/server.js',
				instances: 1,
				env: {
					NODE_ENV: 'production',
					PORT: 2567
				},
				env_production: {
					NODE_ENV: 'production',
					PORT: 2567
				}
			}]
		};
		```

	4. **Start with PM2:**
		```sh
		pm2 start ecosystem.config.js --env production
		pm2 save
		pm2 startup
		```

	**Option 2: Docker Deployment:**
	
	1. **Create Dockerfile for server:**
		```dockerfile
		# packages/game-server/Dockerfile
		FROM node:18-alpine
		
		WORKDIR /app
		
		# Copy package files
		COPY package*.json ./
		RUN npm ci --only=production
		
		# Copy built application
		COPY dist/ ./dist/
		
		EXPOSE 2567
		
		CMD ["node", "dist/server.js"]
		```

	2. **Build and run Docker image:**
		```sh
		# Build image
		cd packages/game-server
		docker build -t game-server .
		
		# Run container
		docker run -d -p 2567:2567 --name game-server-instance game-server
		```

	**Option 3: Platform-as-a-Service (Heroku, Railway, Render):**
	
	- **Heroku example:**
		1. Create `Procfile` in server package:
			```
			web: node dist/server.js
			```
		2. Set environment variables:
			```sh
			heroku config:set NODE_ENV=production
			heroku config:set PORT=$PORT
			```
		3. Deploy:
			```sh
			git subtree push --prefix packages/game-server heroku main
			```

- **Frontend deployment options:**

	**Option 1: Static File Hosting (Netlify, Vercel, GitHub Pages):**
	
	1. **Configure build output:**
		```js
		// packages/game-client/vite.config.ts
		import { defineConfig } from 'vite';
		
		export default defineConfig({
			base: '/', // Adjust if deploying to subdirectory
			build: {
				outDir: 'dist',
				assetsDir: 'assets',
				sourcemap: false, // Disable for production
			},
			server: {
				host: true, // Allow external connections in dev
			}
		});
		```

	2. **Update server URL for production:**
		```typescript
		// packages/game-client/src/config.ts
		export const SERVER_URL = process.env.NODE_ENV === 'production' 
			? 'wss://your-game-server.com'
			: 'ws://localhost:2567';
		```

	3. **Deploy to Netlify:**
		```sh
		# Install Netlify CLI
		npm install -g netlify-cli
		
		# Deploy from client dist directory
		cd packages/game-client
		netlify deploy --prod --dir=dist
		```

	**Option 2: Serve from Backend (Express Static Files):**
	
	- Modify your server to serve client files:
		```typescript
		// packages/game-server/src/server.ts
		import express from 'express';
		import path from 'path';
		
		const app = express();
		
		// Serve static files from client build
		const clientPath = path.join(__dirname, '../../game-client/dist');
		app.use(express.static(clientPath));
		
		// Catch-all handler for SPA
		app.get('*', (req, res) => {
			res.sendFile(path.join(clientPath, 'index.html'));
		});
		
		// Create HTTP server and attach Colyseus
		const server = createServer(app);
		const gameServer = new Server({ server });
		```

- **Production environment configuration:**

	**Environment Variables:**
	```sh
	# Server environment variables
	NODE_ENV=production
	PORT=2567
	CORS_ORIGIN=https://yourgame.com
	DATABASE_URL=postgresql://... # If using database
	REDIS_URL=redis://... # If using Redis for scaling
	```

	**Production server configuration:**
	```typescript
	// packages/game-server/src/server.ts
	import { Server } from 'colyseus';
	import express from 'express';
	
	const app = express();
	
	// Production middleware
	if (process.env.NODE_ENV === 'production') {
		// Enable trust proxy for load balancers
		app.set('trust proxy', 1);
		
		// Add security headers
		app.use((req, res, next) => {
			res.setHeader('X-Content-Type-Options', 'nosniff');
			res.setHeader('X-Frame-Options', 'DENY');
			res.setHeader('X-XSS-Protection', '1; mode=block');
			next();
		});
	}
	
	const gameServer = new Server({
		server: createServer(app),
		engine: process.env.NODE_ENV === 'production' ? 'ws' : undefined,
	});
	```

- **SSL/HTTPS setup:**

	**Option 1: Let's Encrypt with Nginx:**
	```nginx
	# /etc/nginx/sites-available/game-server
	server {
		listen 80;
		server_name yourgame.com;
		return 301 https://$server_name$request_uri;
	}
	
	server {
		listen 443 ssl http2;
		server_name yourgame.com;
		
		ssl_certificate /etc/letsencrypt/live/yourgame.com/fullchain.pem;
		ssl_certificate_key /etc/letsencrypt/live/yourgame.com/privkey.pem;
		
		location / {
			proxy_pass http://localhost:2567;
			proxy_http_version 1.1;
			proxy_set_header Upgrade $http_upgrade;
			proxy_set_header Connection 'upgrade';
			proxy_set_header Host $host;
			proxy_set_header X-Real-IP $remote_addr;
			proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
			proxy_set_header X-Forwarded-Proto $scheme;
			proxy_cache_bypass $http_upgrade;
		}
	}
	```

	**Option 2: Cloudflare (Automatic SSL):**
	- Point your domain to your server IP
	- Enable Cloudflare proxy (orange cloud)
	- SSL/TLS mode: "Full (strict)" for best security

- **Scaling considerations:**

	**Horizontal Scaling with Redis:**
	```typescript
	// For multiple server instances
	import { RedisPresence } from '@colyseus/redis-presence';
	
	const gameServer = new Server({
		presence: new RedisPresence({
			host: process.env.REDIS_HOST,
			port: parseInt(process.env.REDIS_PORT || '6379'),
		}),
	});
	```

	**Load Balancing:**
	- Use sticky sessions for WebSocket connections
	- Configure load balancer to route based on session ID
	- Consider using a service mesh for microservices architecture

- **Monitoring and logging:**

	**Basic Production Logging:**
	```typescript
	// packages/game-server/src/server.ts
	import winston from 'winston';
	
	const logger = winston.createLogger({
		level: 'info',
		format: winston.format.combine(
			winston.format.timestamp(),
			winston.format.json()
		),
		transports: [
			new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
			new winston.transports.File({ filename: 'logs/combined.log' }),
		],
	});
	
	if (process.env.NODE_ENV !== 'production') {
		logger.add(new winston.transports.Console({
			format: winston.format.simple()
		}));
	}
	```

	**Health Check Endpoint:**
	```typescript
	// Add to server.ts
	app.get('/health', (req, res) => {
		res.json({
			status: 'ok',
			timestamp: new Date().toISOString(),
			uptime: process.uptime(),
			memory: process.memoryUsage(),
			rooms: gameServer.presence.channels.size
		});
	});
	```

- **Production deployment checklist:**
	- [ ] Environment variables properly configured
	- [ ] SSL certificate installed and working
	- [ ] Server restart mechanism in place (PM2, Docker restart policies)
	- [ ] Database migrations applied (if using database)
	- [ ] Monitoring and logging configured
	- [ ] Health checks responding correctly
	- [ ] Client build points to production server URL
	- [ ] CORS settings allow your frontend domain
	- [ ] Firewall rules allow necessary ports
	- [ ] Regular backups configured (if storing persistent data)

## 10. **Next Steps and Learning**
- Add features: power-ups, more players, different grid sizes, etc.
- Experiment with latency compensation or cheat prevention.
- Explore npm workspaces features for automation:
  - Set up workspace scripts for coordinated testing
  - Use `npm run <script> --workspaces --if-present` for conditional script execution
  - Implement workspace-wide linting and formatting with shared configurations
- Read Phaser and npm workspaces docs for advanced features.
- Consider adding tools like:
  - ESLint with shared configurations across packages (`npm install eslint --workspace=shared`)
  - Prettier for consistent code formatting
  - Husky for git hooks
  - Jest or Vitest for testing across packages
  - TypeScript project references for better build performance (already set up in this recipe)

---

**Tip:** Keep the game logic on the server as the single source of truth. The client should only send input and render the state from the server.

**References:**
- [npm Workspaces Docs](https://docs.npmjs.com/cli/v7/using-npm/workspaces)
- [Phaser 3 Docs](https://phaser.io)
- [Vite Docs](https://vitejs.dev)
- [TypeScript Project References](https://www.typescriptlang.org/docs/handbook/project-references.html)
- [Colyseus Docs](https://colyseus.io)

---

This recipe gives you a clear, step-by-step path to building your 2-player grid-based multiplayer game with best practices for npm workspaces and TypeScript development.
