
# Step-by-Step Recipe: 2-Player Grid Game (Authoritative Multiplayer) with Phaser 3, Vite, TypeScript, and Nx Monorepo


This guide outlines the steps to build a simple 2-player competitive game: each player hops around a 12x12 grid, can "fire" to color squares, and tries to catch the other player in their color to win. The server is authoritative, and the project uses Phaser 3 (frontend), a Node backend, TypeScript, Vite, and Nx for monorepo management.

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


## 2. **Monorepo Setup with Nx**
- **Create a new Nx workspace:**
	- Open a terminal and run:
		```sh
		npx create-nx-workspace@latest my-multiplayer-game --preset=apps --packageManager=npm
		```
		(Replace `my-multiplayer-game` with your folder name.)
	- Choose "empty" or "apps" preset for maximum flexibility.
	- `cd` into your workspace directory.
- **Enable Nx workspaces support** (if not already):
	- Nx uses `apps/` and `libs/` folders by default for projects and shared code.
- **Project structure:**
	- `apps/game-client` — Phaser frontend (Vite app)
	- `apps/game-server` — Node backend (Colyseus server)
	- `libs/shared` — Shared types, Colyseus schemas, and logic

---



## 3. **Frontend: Phaser 3 + Vite + TypeScript**
- **Generate the frontend app:**
	- Run:
		```sh
		nx g @nx/vite:app game-client
		```
- **Install Phaser and types:**
	- In `apps/game-client`, run:
		```sh
		npm install phaser
		npm install --save-dev @types/phaser
		```
- **Configure TypeScript for Phaser:**
	- Ensure your `tsconfig.app.json` includes:
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
- **Generate the backend app:**
	- Run:
		```sh
		nx g @nx/node:app game-server
		```
- **Install Colyseus and tools:**
	- In `apps/game-server`, run:
		```sh
		npm install colyseus @colyseus/schema @colyseus/tools
		```
- **TypeScript config:**
	- Ensure `experimentalDecorators` is enabled in `tsconfig.json`:
		```json
		{
			"compilerOptions": {
				"experimentalDecorators": true
			}
		}
		```
- **Colyseus setup:**
	- Create a Room class for your game logic (handles player join/leave, ready, game loop, win/loss, etc.).
	- Define a Schema for the game state (players, grid, timers, etc.) in `libs/shared` for type safety on both client and server.
	- Use Colyseus's built-in lobby/matchmaking or implement your own for lobby finder and ready-up screens.
	- Broadcast state changes to clients automatically via Colyseus.
- **Optional:**
	- Integrate Express routes for health checks or credits.
- **Nx workflow:**
	- Use Nx to run/build the server as part of your monorepo workflow:
		```sh
		nx serve game-server
		nx build game-server
		```

---


## 5. **Shared Types and Logic**
- **Create shared library:**
	- Run:
		```sh
		nx g @nx/js:lib shared
		```
- **Define Colyseus Schema classes:**
	- In `libs/shared`, create TypeScript files for:
		- Player state (position, color, lives)
		- Grid state (cell colors, timers)
		- Game state (all players, grid, timers, game status)
	- Use `@colyseus/schema` decorators for schema classes.
- **Type safety:**
	- Import and use these schemas/types in both frontend and backend for state sync and validation.

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
	- Use Nx to run and build both apps independently or together:
		```sh
		nx serve game-client
		nx serve game-server
		```
- **Visualize dependencies:**
	- Run `nx graph` to see project dependencies.
- **Efficient builds:**
	- Use Nx caching and affected commands for fast builds/tests.
- **Debugging:**
	- Use Colyseus's playground or monitor tools for debugging rooms and state.

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
- Explore Nx plugins for linting, testing, and CI/CD.
- Read Phaser and Nx docs for advanced features.

---

**Tip:** Keep the game logic on the server as the single source of truth. The client should only send input and render the state from the server.

**References:**
- [Nx Monorepo Docs](https://nx.dev)
- [Phaser 3 Docs](https://phaser.io)
- [Vite Docs](https://vitejs.dev)
- [TypeScript Project References](https://www.typescriptlang.org/docs/handbook/project-references.html)

---

This recipe gives you a clear, step-by-step path to building your 2-player grid-based multiplayer game with best practices for monorepo and TypeScript development.
