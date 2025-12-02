## Legacy QF Frontend Audit

### Route Inventory
- `/` (`pages/index.tsx`): marketing hero, featured projects, uses `ProjectsIndex`, global banners, and pulls copy/meta from `src/content`.
- `/projects/[slug]`, `/project/[projectIdSlug]/index.tsx`: listing & single project flows powered by `ProjectsIndex`, `ProjectCard`, detail tabs (Updates, Milestones, Donors, QF tab minus GIVpower requirement).
- `/qf`, `/qf/[slug]`, `/qf-archive`, `/qf-archive/[slug]`: QF hub, round detail, and archive pages. Driven by `QFRoundsProvider`, `QFRoundsIndex`, `QFRoundCard`, and `ProjectsIndex` with QF-only filters.
- `/donate/[slug]`: donation experience via `DonateProvider` and `DonateIndex` (multi-step form, QR donations, wallet gating).
- `/account`, `/user/[address]`, `/cause/*`: dashboard routes for profile, owned projects, causes, donations; rely on contexts (`ProjectsProvider`, Redux slices) and modals for project creation/edit.
- `/cause/[causeIdSlug]/donate`: cause-specific donation wrappers calling same donation components.

### Key Components & Contexts
- `src/components/views/QFRounds/*`: cards, banners, filters; expect `IQFRound` objects from GraphQL with hero images (bannerFull/Mobile) and matching pool metadata.
- `src/components/views/projects/ProjectsIndex.tsx`: central listing supporting infinite scroll, QF banners/stats, filter/sort containers, and route-aware dataset fetching (`fetchProjects` service).
- `src/components/views/donate/*`: `DonateHeader`, `DonationCard`, `SuccessView`, `OneTime/SelectTokenModal`, `Recurring` tabs, QR donation detail panels, sanction/project-owner modals.
- Context providers: `QFRoundsProvider`, `ProjectsProvider`, `DonateProvider`, `generalWalletProvider`. Legacy Redux slices for user/general/modal will be replaced by Zustand stores.

### Data & GraphQL Dependencies
- GraphQL client: Apollo (`src/apollo/apolloClient.ts`) consuming `graphql` endpoint defined in `src/configuration.ts`.
- QF queries/mutations (`src/apollo/gql/gqlQF.ts`):
  - `FETCH_QF_ROUNDS_QUERY`: returns QF metadata.
  - `FETCH_ARCHIVED_QF_ROUNDS`: archive listing.
  - `FETCH_QF_PROJECTS`: filtered project list per round.
  - `FETCH_QF_ROUND_STATS`, `FETCH_DOES_DONATED_PROJECT_IN_ROUND`, `FETCH_QF_ROUND_SMART_SELECT`, `FETCH_PROJECT_QF_ROUNDS`.
- Donation queries (`src/apollo/gql/gqlDonations.ts`, `gqlProjects.ts`): `FETCH_PROJECT_BY_SLUG_DONATION`, `FETCH_DONATION_BY_ID`, `CREATE_DONATION`, `VERIFY_DONATION`, plus Stellar draft-donation helpers (`src/services/donation.ts`).
- User/projects mutations: `createProject`, `updateProject`, wallet linking, etc. Align with `giveth-v6-core` modules (`project`, `donation`, `user`, `qf-round`).

### Hooks & Utilities
- `src/lib/helpers/qfroundHelpers.ts`: React Query hooks (`useFetchQFRounds`, `useFetchLast3ArchivedQFRounds`), helpers for hero imagery & SSR slug lookup.
- `src/components/views/projects/services.ts`: orchestrates GraphQL fetch logic for listings (filters, pagination, qfRoundId).
- `src/hooks` (selected):
  - `useAlreadyDonatedToProject` (eligibility gating),
  - `useDetectDevice`, `useMediaQuery` (responsive),
  - `useQRCodeDonation`, `useIsSafeEnvironment`, wallet detection hooks.
- `src/services/donation.ts`: handles on-chain validation (OFAC, draft donations).

### Styling & Assets
- Legacy styling = `@giveth/ui-design-system` tokens + styled-components + global CSS in `styles/globals.css`.
- Assets under `public/images` mirrored in `public/assets` plus translation strings in `lang/*.json`.
- Need to capture brand colors (e.g., `brandColors`, `neutralColors`, `semanticColors`) and typography scales from the design system to rebuild as Tailwind tokens + Radix themes.

### Migration Notes
- Replace Apollo client usage with a shared GraphQL codegen + React Query integration.
- All contexts need to be rebuilt via app-router providers (server + client components).
- Wallet stack currently Wagmi + custom providers for EVM/Solana; new stack must rely on Thirdweb + Viem for EVM, with strategy for Stellar/Solana parity if required by QF rounds.
- Maintain feature parity: Passport gating, donation success flows, QR drafts, project management modals, dashboards; skip GIVpower-only components.
## Legacy QF Frontend Audit

### Route Inventory
- `/` (`pages/index.tsx`): marketing hero, featured projects, uses `ProjectsIndex`, global banners, and pulls copy/meta from `src/content`.
- `/projects/[slug]`, `/project/[projectIdSlug]/index.tsx`: listing & single project flows powered by `ProjectsIndex`, `ProjectCard`, detail tabs (Updates, Milestones, Donors, QF tab minus GIVpower requirement).
- `/qf`, `/qf/[slug]`, `/qf-archive`, `/qf-archive/[slug]`: QF hub, round detail, and archive pages. Driven by `QFRoundsProvider`, `QFRoundsIndex`, `QFRoundCard`, and `ProjectsIndex` with QF-only filters.
- `/donate/[slug]`: donation experience via `DonateProvider` and `DonateIndex` (multi-step form, QR donations, wallet gating).
- `/account`, `/user/[address]`, `/cause/*`: dashboard routes for profile, owned projects, causes, donations; rely on contexts (`ProjectsProvider`, Redux slices) and modals for project creation/edit.
- `/cause/[causeIdSlug]/donate`: cause-specific donation wrappers calling same donation components.

### Key Components & Contexts
- `src/components/views/QFRounds/*`: cards, banners, filters; expect `IQFRound` objects from GraphQL with hero images (bannerFull/Mobile) and matching pool metadata.
- `src/components/views/projects/ProjectsIndex.tsx`: central listing supporting infinite scroll, QF banners/stats, filter/sort containers, and route-aware dataset fetching (`fetchProjects` service).
- `src/components/views/donate/*`: `DonateHeader`, `DonationCard`, `SuccessView`, `OneTime/SelectTokenModal`, `Recurring` tabs, QR donation detail panels, sanction/project-owner modals.
- Context providers: `QFRoundsProvider`, `ProjectsProvider`, `DonateProvider`, `generalWalletProvider`. Legacy Redux slices for user/general/modal will be replaced by Zustand stores.

### Data & GraphQL Dependencies
- GraphQL client: Apollo (`src/apollo/apolloClient.ts`) consuming `graphql` endpoint defined in `src/configuration.ts`.
- QF queries/mutations (`src/apollo/gql/gqlQF.ts`):
  - `FETCH_QF_ROUNDS_QUERY`: returns QF metadata.
  - `FETCH_ARCHIVED_QF_ROUNDS`: archive listing.
  - `FETCH_QF_PROJECTS`: filtered project list per round.
  - `FETCH_QF_ROUND_STATS`, `FETCH_DOES_DONATED_PROJECT_IN_ROUND`, `FETCH_QF_ROUND_SMART_SELECT`, `FETCH_PROJECT_QF_ROUNDS`.
- Donation queries (`src/apollo/gql/gqlDonations.ts`, `gqlProjects.ts`): `FETCH_PROJECT_BY_SLUG_DONATION`, `FETCH_DONATION_BY_ID`, `CREATE_DONATION`, `VERIFY_DONATION`, plus Stellar draft-donation helpers (`src/services/donation.ts`).
- User/projects mutations: `createProject`, `updateProject`, wallet linking, etc. Align with `giveth-v6-core` modules (`project`, `donation`, `user`, `qf-round`).

### Hooks & Utilities
- `src/lib/helpers/qfroundHelpers.ts`: React Query hooks (`useFetchQFRounds`, `useFetchLast3ArchivedQFRounds`), helpers for hero imagery & SSR slug lookup.
- `src/components/views/projects/services.ts`: orchestrates GraphQL fetch logic for listings (filters, pagination, qfRoundId).
- `src/hooks` (selected):
  - `useAlreadyDonatedToProject` (eligibility gating),
  - `useDetectDevice`, `useMediaQuery` (responsive),
  - `useQRCodeDonation`, `useIsSafeEnvironment`, wallet detection hooks.
- `src/services/donation.ts`: handles on-chain validation (OFAC, draft donations).

### Styling & Assets
- Legacy styling = `@giveth/ui-design-system` tokens + styled-components + global CSS in `styles/globals.css`.
- Assets under `public/images` mirrored in `public/assets` plus translation strings in `lang/*.json`.
- Need to capture brand colors (e.g., `brandColors`, `neutralColors`, `semanticColors`) and typography scales from the design system to rebuild as Tailwind tokens + Radix themes.

### Migration Notes
- Replace Apollo client usage with a shared GraphQL codegen + React Query integration.
- All contexts need to be rebuilt via app-router providers (server + client components).
- Wallet stack currently Wagmi + custom providers for EVM/Solana; new stack must rely on Thirdweb + Viem for EVM, with strategy for Stellar/Solana parity if required by QF rounds.
- Maintain feature parity: Passport gating, donation success flows, QR drafts, project management modals, dashboards; skip GIVpower-only components.

