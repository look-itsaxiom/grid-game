// copilot.instructions.md
// This file summarizes user preferences and project context for Copilot in this workspace.

# Project Overview
- 2-player grid-based multiplayer game (12x12 grid, color/firing mechanics, lives, win/loss)
- Tech stack: npm workspaces monorepo, TypeScript, Vite, Phaser 3 (frontend), Colyseus (authoritative backend)
- npm workspaces structure: `packages/game-client` (Phaser), `packages/game-server` (Colyseus/Node), `packages/shared` (Colyseus Schema/types)
- Minimal custom assets (colored squares, basic shapes)

# User Preferences
- Wants actionable, step-by-step guidance (not code, but commands, config hints, and reasoning)
- Prefers recipes and instructions that balance high-level planning with concrete next steps
- Enjoys learning by trying first, then asking for help after 5–10 minutes
- Wants explanations for npm workspaces, TypeScript, Phaser, and Colyseus setup and integration
- Prefers server-authoritative logic (all game rules enforced on backend)
- Wants clear separation of frontend, backend, and shared code
- Values type safety and shared schemas between client/server
- Likes to see how npm workspaces features (package linking, script coordination) fit into workflow
- Wants the recipe/instructions to evolve as requirements change

# Copilot Guidance
- When asked for help, provide actionable, context-aware steps (not code, but steps to solve the problem, config tips, guidance on best practices, etc.)
- Always respect the user's desire to try first before giving full solutions
- Keep the instructions/recipe up to date as the project evolves

# References
- npm Workspaces: https://docs.npmjs.com/cli/v7/using-npm/workspaces
- Phaser 3: https://phaser.io
- Vite: https://vitejs.dev
- Colyseus: https://colyseus.io
- TypeScript: https://www.typescriptlang.org/

// End of copilot.instructions.md
