
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
				"build:client": "npm run build --workspace=game-client",
				"build:server": "npm run build --workspace=game-server",
				"build:all": "npm run build --workspaces",
				"install:all": "npm install"
			}
		}
		```
	- Create the packages directory:
		```sh
		mkdir packages
		```
- **Project structure:**
	- `packages/game-client` — Phaser frontend (Vite app)
	- `packages/game-server` — Node backend (Colyseus server)
	- `packages/shared` — Shared types, Colyseus schemas, and logic

---



## 3. **Frontend: Phaser 3 + Vite + TypeScript**
- **Create the frontend package:**
	- Create the directory and navigate to it:
		```sh
		mkdir packages/game-client
		cd packages/game-client
		```
	- Initialize a Vite + TypeScript project:
		```sh
		npm create vite@latest . -- --template vanilla-ts
		```
	- Return to root and install dependencies:
		```sh
		cd ../..
		npm install
		```
- **Install Phaser and types:**
	- In the root directory, run:
		```sh
		npm install phaser --workspace=game-client
		npm install --save-dev @types/phaser --workspace=game-client
		```
- **Configure TypeScript for Phaser:**
	- Ensure your `packages/game-client/tsconfig.json` includes:
		```json
		{
			"compilerOptions": {
				"types": ["phaser"]
			}
		}
		```
- **Implement screens/scenes:**
	- Start with a basic Phaser scene for each screen:
		- Start screen (title, play button)
		- Lobby finder (list/join/create lobbies)
		- Ready up (show both players, ready status)
		- Main game (12x12 grid, player avatars, color changes, input handling)
		- Game over (winner, play again, return to lobby)
		- Credits (your name, asset info)
	- Use simple colored rectangles for grid and avatars.
- **Input and networking:**
	- Capture keyboard/gamepad input for movement and firing.
	- Use Colyseus client to connect to backend (see below).
	- Only send input to server; render state received from server.
- **UI:**
	- Show lives, win/lose state, and simple UI overlays.

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
	- Update the package.json:
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
			}
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
				"skipLibCheck": true,
				"forceConsistentCasingInFileNames": true
			},
			"include": ["src/**/*"],
			"exclude": ["node_modules", "dist"]
		}
		```
- **Colyseus setup:**
	- Create a Room class for your game logic (handles player join/leave, ready, game loop, win/loss, etc.).
	- Define a Schema for the game state (players, grid, timers, etc.) in `packages/shared` for type safety on both client and server.
	- Use Colyseus's built-in lobby/matchmaking or implement your own for lobby finder and ready-up screens.
	- Broadcast state changes to clients automatically via Colyseus.
- **Optional:**
	- Integrate Express routes for health checks or credits.
- **npm workspaces workflow:**
	- Use npm workspace commands to run/build the server:
		```sh
		npm run dev:server
		npm run build:server
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
				"outDir": "./dist",
				"rootDir": "./src",
				"strict": true,
				"esModuleInterop": true,
				"skipLibCheck": true,
				"forceConsistentCasingInFileNames": true
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
- **Define Colyseus Schema classes:**
	- In `packages/shared/src`, create TypeScript files for:
		- Player state (position, color, lives)
		- Grid state (cell colors, timers)
		- Game state (all players, grid, timers, game status)
	- Use `@colyseus/schema` decorators for schema classes.
- **Type safety:**
	- Import and use these schemas/types in both frontend and backend for state sync and validation.
	- Link the shared package to other packages:
		```sh
		npm install ../shared --workspace=game-client
		npm install ../shared --workspace=game-server
		```

---



## 6. **Game Loop and Networking**
- **Game loop:**
	- Implement a tick/update loop in your Colyseus Room to handle color timing and state transitions.
- **Networking:**
	- On player input, Colyseus receives messages, validates, and updates state.
	- Colyseus automatically syncs state to all clients.
- **State management:**
	- Server manages lobby, ready, and game over states and transitions.
	- Clients only send input and render the state sent by the server.

---


## 7. **Development Workflow**
- **Run apps:**
	- Use npm workspace commands to run and build both apps independently or together:
		```sh
		npm run dev:client    # Run frontend dev server
		npm run dev:server    # Run backend dev server
		npm run build:all     # Build all packages
		```
	- Or run directly in specific workspaces:
		```sh
		npm run dev --workspace=game-client
		npm run dev --workspace=game-server
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
	- When you make changes to shared types:
		```sh
		npm run build --workspace=shared
		```
- **Debugging:**
	- Use Colyseus's playground or monitor tools for debugging rooms and state.
- **Package management:**
	- npm workspaces automatically handles linking between packages in the monorepo.
	- Use relative imports to reference shared code from client and server packages.

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
- Explore npm scripts and workspace features for automation.
- Read Phaser and npm workspaces docs for advanced features.
- Consider adding tools like:
  - ESLint with shared configurations across packages
  - Prettier for consistent code formatting
  - Husky for git hooks
  - Simple scripts for coordinated testing across packages

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
