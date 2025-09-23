---
applyTo: '**'
---

// This file provides guidance for working with npm workspaces

You are in an npm workspaces project using npm as the package manager.

Follow these guidelines to best help the user:

# General Guidelines
- When answering questions, first understand the workspace architecture by examining package.json workspaces configuration
- For questions around npm workspaces configuration and best practices, refer to npm documentation
- Help users understand how to work with multiple packages in a single repository
- Guide users on proper dependency management between workspace packages

# Package Management Guidelines
When working with packages in the workspace:

- Use `npm install <package> --workspace=<workspace-name>` to install dependencies to specific packages
- Use `npm run <script> --workspace=<workspace-name>` to run scripts in specific packages
- Use `npm run <script> --workspaces` to run scripts across all workspaces
- Use relative paths (e.g., `../shared`) to link local packages together
- Remember that npm workspaces automatically handles symlinking between local packages

# Development Workflow
- Each package should have its own package.json with appropriate scripts
- Use the root package.json for workspace-wide scripts and coordination
- Build shared packages before consuming packages when needed
- Use workspace dependencies to reference other packages in the monorepo

# Project Structure
- Use `packages/` directory to organize workspace packages
- Each package in `packages/` should be a complete npm package
- Shared code should be in its own package (e.g., `packages/shared`)
- Applications should be separate packages (e.g., `packages/game-client`, `packages/game-server`)

# Common Commands
- Install all dependencies: `npm install`
- Install to specific workspace: `npm install <package> --workspace=<name>`
- Run script in workspace: `npm run <script> --workspace=<name>`
- Run script in all workspaces: `npm run <script> --workspaces`
- List workspaces: `npm ls --workspaces`

# TypeScript Integration
- Each package can have its own tsconfig.json
- Use TypeScript project references for better build performance
- Shared packages should build to dist/ directories
- Reference shared packages via their built output or source depending on setup