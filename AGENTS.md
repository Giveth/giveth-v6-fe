# Repository Guidelines

## Project Structure & Module Organization
This is a Next.js 16 App Router frontend (`src/app`) for Giveth QF. Keep feature logic close to its domain:
- `src/app`: routes, layouts, and API route handlers (`src/app/api/...`).
- `src/components`: reusable UI and feature components (account, cart, project, qf, etc.).
- `src/lib`: shared utilities, env parsing, GraphQL client/codegen output, web3 helpers.
- `src/hooks`, `src/context`, `src/store` and `src/stores`: stateful client logic.
- `src/test/setup.ts`: global unit-test setup.
- `tests/e2e`: Playwright end-to-end specs.
- `public/`: static assets, `docs/`: project notes/spec references.

## Build, Test, and Development Commands
Use Node `>=20.11` and `pnpm`.

```bash
pnpm install
pnpm dev            # local dev server (Turbopack)
pnpm build && pnpm start
pnpm lint           # ESLint + Prettier rules
pnpm lint:fix
pnpm type-check     # tsc --noEmit
pnpm test           # Vitest run
pnpm test:watch
pnpm test:coverage
pnpm test:e2e       # Playwright against local web server
pnpm codegen        # GraphQL artifacts via codegen.ts
```

## Coding Style & Naming Conventions
- TypeScript-first (`.ts/.tsx`), 2-space indentation, single quotes, no semicolons, trailing commas.
- Respect ESLint import ordering; keep imports grouped and alphabetized.
- Prefer `@/` alias imports for `src`.
- Components: `PascalCase.tsx`; hooks: `useX.ts`; route folders: lowercase (Next.js conventions).
- Avoid `any`; prefix intentionally unused variables with `_`.
- Do not leave `console.log`; only `console.warn`/`console.error` are allowed.

## Testing Guidelines
- Unit/integration: Vitest + Testing Library (`jsdom` environment).
- Test files use `*.test.ts` / `*.test.tsx`, typically near the feature (example: `src/components/ui/__tests__/button.test.tsx`).
- E2E tests belong in `tests/e2e`.
- Run `pnpm test:coverage` for changed areas; coverage is collected from `src/**/*.{ts,tsx}` (no enforced global threshold yet).

## Commit & Pull Request Guidelines
- Follow the repo’s concise, imperative style (example: `Fix create project styles`).
- Keep commits focused; prefer clear subjects like `<area>: <change>` (example: `wallet: handle signer fallback`).
- Include a short problem/solution summary in each PR.
- Link related issue(s) and include UI screenshots/recordings for visual changes.
- List verification commands you ran (`pnpm lint`, `pnpm type-check`, and relevant tests).

## Environment & Security Tips
- Copy `.env.example` to `.env.local` and fill required values before running locally.
- Never commit API keys, wallet secrets, or private endpoints.
