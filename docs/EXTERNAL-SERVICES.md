# System Architecture — Frontend Perspective

> Only the external services this frontend talks to, how to talk to them, and the auth model. For frontend-internal structure, coding style, and commands see [AGENTS.md](../AGENTS.md).

## Service Map

```mermaid
graph LR
  FE["giveth-v6-fe"]

  FE -- "GraphQL · JWT" --> CORE["giveth-v6-core"]
  FE -- "GraphQL · public" --> IG["impact-graph (legacy)"]
  FE -- "REST" --> SIWE["SIWE Auth Service"]
  FE -- "Thirdweb SDK · JSON-RPC" --> CHAINS["Blockchain RPCs +<br/>DonationHandler contracts"]
  FE -- "REST · server-side only" --> OPENAI["OpenAI API"]
```

---

## 1. giveth-v6-core — Primary Backend

|            |                                                       |
| ---------- | ----------------------------------------------------- |
| Protocol   | GraphQL via `graphql-request`                         |
| Env var    | `NEXT_PUBLIC_GRAPHQL_ENDPOINT`                        |
| Production | `https://core.v6.giveth.io/graphql`                   |
| Staging    | `https://core.v6-staging.giveth.io/graphql`           |
| Local      | `http://localhost:4000/graphql`                       |
| Auth       | `Authorization: Bearer {JWT}` (JWT from SIWE service) |

Used for: projects, donations, users, QF rounds, categories, matching, staking, passport eligibility, project image uploads.

---

## 2. impact-graph — Legacy Backend

|            |                                                |
| ---------- | ---------------------------------------------- |
| Protocol   | GraphQL via `graphql-request`                  |
| Env var    | `NEXT_PUBLIC_IMPACT_GRAPH_URL`                 |
| Production | `https://mainnet.serve.giveth.io/graphql`      |
| Staging    | `https://impact-graph.serve.giveth.io/graphql` |
| Auth       | None (public)                                  |

Used for: user-exists check by wallet, creating user records (sync during auth), QF Apply flow (project data by slug).

Code: `src/lib/impact-graph/client.ts`, `src/lib/impact-graph/userSync.ts`.

> These calls should migrate to v6-core and be removed from the frontend when ready.

---

## 3. SIWE Auth Service

|          |                                     |
| -------- | ----------------------------------- |
| Protocol | REST                                |
| Env var  | `NEXT_PUBLIC_SIWE_AUTH_SERVICE_URL` |
| Default  | `https://auth.giveth.io`            |

| Method | Path                 | Purpose                        |
| ------ | -------------------- | ------------------------------ |
| GET    | `/v1/nonce`          | Get nonce to sign              |
| POST   | `/v1/authentication` | Submit signature → receive JWT |
| POST   | `/v1/logout`         | Invalidate JWT                 |

Code: `src/lib/auth/siwe.service.ts`

```mermaid
sequenceDiagram
  FE->>AUTH: GET /v1/nonce
  AUTH-->>FE: nonce
  FE->>Wallet: Sign message (EIP-191)
  Wallet-->>FE: signature
  FE->>AUTH: POST /v1/authentication
  AUTH-->>FE: JWT
  FE->>v6-core: GraphQL with Bearer JWT
```

---

## 4. OpenAI API — AI Project Creation

Server-side only (`src/app/api/ai/create-project/route.ts`). Streams structured JSON for form field extraction.

|               |                                       |
| ------------- | ------------------------------------- |
| Endpoint      | `POST {OPENAI_BASE_URL}/v1/responses` |
| Default base  | `https://api.openai.com`              |
| Default model | `gpt-4-mini`                          |
| Auth          | `Bearer {OPENAI_API_KEY}`             |

Server-only env vars: `OPENAI_API_KEY` (required), `OPENAI_MODEL`, `OPENAI_BASE_URL` (optional).

---

## 5. Thirdweb SDK — Wallets & Contracts

Client-side. Config at `src/lib/thirdweb/client.ts`, providers at `src/app/providers.tsx`.

|          |                                             |
| -------- | ------------------------------------------- |
| Env var  | `NEXT_PUBLIC_THIRDWEB_CLIENT_ID` (required) |
| Optional | `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`      |

Handles wallet connection, ENS resolution, on-chain reads/writes (DonationHandler contract, ERC-20 approvals), EIP-5792 batch transactions, and Safe multisig detection.

Supported chains and wallets are configured in code — see the files above rather than duplicating here.

For donation contract integration details (addresses, EIP-5792/7702 flows, token lists, fallback logic), see [donation-handler-integration.md](./donation-handler-integration.md).
