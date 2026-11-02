# AGENTS.md

## Project state
Weather CLI implemented with Bun/TypeScript. `index.ts` is the entry point and delegates to `src/`:

- `src/api.ts`: OpenMeteo geocoding (`geocoding-api.open-meteo.com/v1/search`) and forecast (`api.open-meteo.com/v1/forecast`) clients.
- `src/config.ts`: persistence of cities and settings in `~/.weather-cli.json`.
- `src/ui.ts`: menu, prompts, weather card and Spanish WMO descriptions.
- `src/tipos.ts`: shared types.

The menu follows the mock in `README.md` (options 1–5, 8, 9).

## Commands
- Install: `bun install` (Bun 1.4.4+; `bun.lock` is the lockfile — do not use npm/pnpm).
- Run: `bun index.ts` (or `bun run index.ts`).
- Typecheck: `bun run typecheck` → `bun check` (Bun's native checker, strict `tsconfig.json`).
- Single-file typecheck: `bun check index.ts`.
- Build a standalone binary: `bun run build` → `bun build --compile ./index.ts --outfile weather` (creates `weather.exe` on Windows).

There are **no** `dev`, `start`, `test`, or `lint` scripts in `package.json`, even though `bun-instructions.md` claims them. Trust `package.json`. No automated tests are committed; the app has been verified with `bun run typecheck` and manual end-to-end runs of every menu option.

## Toolchain notes
- Bun executes TypeScript directly; there is no build step for development and `tsconfig.json` sets `noEmit`.
- Config uses `module: "Preserve"`, `moduleResolution: "bundler"`, `allowImportingTsExtensions`, and `verbatimModuleSyntax` — use ESM `import`/`export` and `import type` for type-only imports.
- Strict mode includes `noUncheckedIndexedAccess`; account for `undefined` on array/index access.
- `types: ["bun"]`, so Bun globals (`Bun`, `fetch`, etc.) are available without Node types.

## Conventions
- Keep user-facing text, comments, and commit messages in Spanish (per `bun-instructions.md` and the README). Code identifiers can stay in English.
- Keep functions small and single-purpose.
- `node_modules`, `dist/`, `out/`, and `.env*` are gitignored. No `.env.example` exists yet; add one if introducing required environment variables.
