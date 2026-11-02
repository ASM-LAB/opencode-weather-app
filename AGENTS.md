# AGENTS.md

## Project state
Early Bun/TypeScript scaffold for a Spanish-language weather CLI ("WEATHER CLI"). `index.ts` is the only source file and still prints `Hello via Bun!`. Planned flow: OpenMeteo geocoding (`geocoding-api.open-meteo.com/v1/search`) to get lat/lon, then `api.open-meteo.com/v1/forecast?current=temperature_2m`. README describes the target menu and features; see `README.md` for the exact API URLs and UI mock.

## Commands
- Install: `bun install` (Bun 1.4.4+; `bun.lock` is the lockfile — do not use npm/pnpm).
- Run: `bun index.ts` (or `bun run index.ts`).
- Typecheck: `bun run typecheck` → `bun check` (Bun's native checker, strict `tsconfig.json`).
- Single-file typecheck: `bun check index.ts`.
- Build a standalone binary (end goal, no script yet): `bun build --compile ./index.ts --outfile weather`.

There are **no** `dev`, `start`, `test`, or `lint` scripts in `package.json`, even though `bun-instructions.md` claims them. Trust `package.json`. No tests exist yet.

## Toolchain notes
- Bun executes TypeScript directly; there is no build step for development and `tsconfig.json` sets `noEmit`.
- Config uses `module: "Preserve"`, `moduleResolution: "bundler"`, `allowImportingTsExtensions`, and `verbatimModuleSyntax` — use ESM `import`/`export` and `import type` for type-only imports.
- Strict mode includes `noUncheckedIndexedAccess`; account for `undefined` on array/index access.
- `types: ["bun"]`, so Bun globals (`Bun`, `fetch`, etc.) are available without Node types.

## Conventions
- Keep user-facing text, comments, and commit messages in Spanish (per `bun-instructions.md` and the README). Code identifiers can stay in English.
- Keep functions small and single-purpose.
- `node_modules`, `dist/`, `out/`, and `.env*` are gitignored. No `.env.example` exists yet; add one if introducing required environment variables.
