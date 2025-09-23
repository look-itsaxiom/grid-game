
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
				"target": "ES2020",
				"lib": ["ES2020", "DOM", "DOM.Iterable"],
				"module": "ESNext",
				"skipLibCheck": true,
				"moduleResolution": "bundler",
				"allowImportingTsExtensions": true,
				"resolveJsonModule": true,
				"isolatedModules": true,
				"noEmit": true,
				"strict": true,
				"noUnusedLocals": true,
				"noUnusedParameters": true,
				"noFallthroughCasesInSwitch": true,
				"types": ["phaser"]
			},
			"include": ["src"],
			"references": [{ "path": "../shared" }]
		}
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
	- Create client instance: `const client = new Client('ws://localhost:2567')`
	- Join room and store reference: `this.room = await client.joinOrCreate('GameRoom')`
	- Send player input as messages: `this.room.send('move', { direction: 'up' })`
	- Listen for state changes: `this.room.onStateChange((state) => { /* update visuals */ })`
	- Example input handling:
		```typescript
		update() {
			if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
				this.room.send('move', { direction: 'up' });
			}
			if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
				this.room.send('fire', {});
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
- **Local testing:**
	- Open two browser tabs or devices to simulate two players.
- **Colyseus playground:**
	- Use Colyseus's playground for manual room testing and state inspection.
- **Debugging:**
	- Add simple logging/debugging tools as needed.
- **Tuning:**
	- Tune timing for color changes and firing for best feel.
- **Iteration:**
	- Iterate on rules and UX as needed based on playtesting.

---

## 9. **Deployment (Optional)**
- Build production versions of both apps.
- Deploy backend to a server or cloud platform.
- Deploy frontend as static files or serve from backend.

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
