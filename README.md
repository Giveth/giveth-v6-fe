# Giveth v6 Frontend

Next.js 16 implementation of the new Giveth Quadratic Funding experience.

## Tech stack

- **Next.js 16** (App Router, React 19, Turbopack dev server)
- **Tailwind CSS v4** with theme tokens that mirror the legacy `@giveth/ui-design-system`
- **Radix UI** primitives + custom components for consistent accessibility
- **Zustand** for lightweight client stores (theme, wallet UI, onboarding)
- **React Query 5** + GraphQL Codegen + `graphql-request` for data fetching
- **Thirdweb + Viem** for wallet connectivity and on-chain interactions
- **Vitest + Testing Library + Playwright** for unit and end-to-end coverage

## Getting started

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Key scripts:

| Command | Description |
| --- | --- |
| `pnpm dev` | Run Next.js locally with Turbopack |
| `pnpm build` / `pnpm start` | Production build & serve |
| `pnpm lint` | ESLint (Core Web Vitals rules) |
| `pnpm lint:fix` | Auto-fix lint issues where possible |
| `pnpm type-check` | Strict TypeScript diagnostics |
| `pnpm test` / `pnpm test:watch` | Vitest + Testing Library |
| `pnpm test:e2e` | Playwright regression suite |
| `pnpm codegen` | GraphQL artifacts from `codegen.ts` |

## Structure

- `src/app` – route groups (marketing, dashboard, donation, etc.) + root layout
- `src/components` – layout primitives, UI kit (Radix + Tailwind), feature slices
- `src/lib` – platform helpers (env, GraphQL client, React Query, Thirdweb)
- `src/store` – Zustand stores with persistence
- `docs/` – migration audit notes & future specifications

## Environment

See `.env.example` for required variables:

- `NEXT_PUBLIC_GRAPHQL_ENDPOINT`
- `NEXT_PUBLIC_THIRDWEB_CLIENT_ID`
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` (optional)
- `GRAPHQL_CODEGEN_ENDPOINT` (optional override for codegen CLI)

## Testing & quality

- Vitest runs in `jsdom` with Testing Library + MSW hooks (see `src/test/setup.ts`)
- Playwright config lives at `playwright.config.ts`
- React Query Devtools automatically load in `development`

## Additional docs

- `docs/qf-audit.md` – inventory of legacy pages/components/utilities that must be reimplemented here.
