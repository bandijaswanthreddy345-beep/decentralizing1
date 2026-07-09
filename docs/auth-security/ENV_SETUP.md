# Environment Setup Guide

This covers every environment variable the backend (and eventually frontend)
needs. Variables already used by existing code are documented from the actual
source; variables for pieces still being built (Web3Auth UI, Polygon
contract) are marked **TBD** — fill those in once Jaswanth/Yogashree finalize
their configs, and update this file rather than letting `.env.example` drift.

## How to use this
1. Copy the backend block below into `backend/.env` (never commit this file).
2. Fill in real values for your local/dev setup.
3. For anything marked TBD, ping the teammate listed and update this doc once
   it's confirmed.

---

## Backend — `backend/.env`

### Server
| Variable | Required | Description |
|---|---|---|
| `PORT` | No (default `5000`) | Port the Express server listens on. |
| `CLIENT_URL` | Yes | Origin of the frontend, used for CORS and for building redirect/reset URLs. e.g. `http://localhost:3000` in dev. |
| `NODE_ENV` | No | Set to `production` in deployment; leave unset/`development` locally. Tests set this to `test` automatically. |

### Database
| Variable | Required | Description |
|---|---|---|
| `MONGODB_URI` (or `MONGO_URI`) | Yes | MongoDB Atlas connection string. `src/config/db.js` checks both names — pick one and be consistent. **Never** point this at a shared/production cluster from a local dev machine; use a personal or sandbox cluster. |

### JWT
| Variable | Required | Description |
|---|---|---|
| `JWT_SECRET` | Yes | Long random secret used to sign session tokens. Generate with e.g. `openssl rand -hex 32`. Must be identical across all backend instances in an environment, but different between dev/staging/prod. |
| `JWT_EXPIRES_IN` | No (default `7d`) | Token lifetime, e.g. `1h`, `7d`. |

### Password reset email (EmailJS)
| Variable | Required | Description |
|---|---|---|
| `EMAILJS_SERVICE_ID` | Yes (for forgot-password to work) | EmailJS service ID. |
| `EMAILJS_TEMPLATE_ID` | Yes | EmailJS template ID used for the reset email. |
| `EMAILJS_PUBLIC_KEY` | Yes | EmailJS public key. |
| `EMAILJS_PRIVATE_KEY` | Yes | EmailJS private key — treat as a secret, don't expose client-side. |

### Google OAuth
| Variable | Required | Description |
|---|---|---|
| `GOOGLE_CLIENT_ID` | Only if Google login is enabled | From Google Cloud Console OAuth credentials. |
| `GOOGLE_CLIENT_SECRET` | Only if Google login is enabled | Same. |
| `GOOGLE_CALLBACK_URL` | Only if Google login is enabled | Must exactly match the redirect URI registered in Google Cloud Console, e.g. `http://localhost:5000/api/auth/google/callback`. |

If these three are unset, `configurePassport()` just logs a warning and skips
registering the Google strategy — the rest of the app still works.

### Web3Auth
| Variable | Required | Description |
|---|---|---|
| `WEB3AUTH_CLIENT_ID` | Yes (for Web3Auth login to work) | The **audience** the backend verifies idTokens against, in `src/services/web3authVerifier.js`. This must match the Client ID configured in the Web3Auth (MetaMask Embedded Wallets) dashboard for this project — same value Jaswanth configures on the frontend SDK init. |

**TBD / confirm with Jaswanth:**
- Which Web3Auth network (mainnet/testnet/sapphire_devnet, etc.) the frontend
  SDK is initialized against — the backend's JWKS endpoint
  (`https://api.web3auth.io/citadel-service/.well-known/jwks.json`) is
  currently hardcoded and network-agnostic for Citadel-issued tokens, but
  confirm this matches whatever login provider/chain config Jaswanth sets up.
- If a nonce-based flow gets added (see `THREAT_MODEL.md` §2.4), a new env
  var may be needed for nonce store TTL — add it here when that lands.

### Rate limiting
| Variable | Required | Description |
|---|---|---|
| `AUTH_RATE_LIMIT_MAX` | No (default `10`) | Max requests per window per IP against `/api/auth/*`. |
| `AUTH_RATE_LIMIT_WINDOW_MS` | No (default `900000` = 15 min) | Window size in milliseconds. |

### Polygon / decentralization layer — **TBD (owner: Yogashree)**
Not implemented yet. Once the contract is deployed, this section should be
filled in with something like:

| Variable | Required | Description |
|---|---|---|
| `POLYGON_RPC_URL` | TBD | RPC endpoint (Alchemy/Infura/public RPC or local Hardhat node) the backend's `ethers` client connects to. |
| `POLYGON_CHAIN_ID` | TBD | e.g. `80002` for Amoy testnet, `137` for mainnet — confirm which network is actually being deployed to. |
| `CONTRACT_ADDRESS` | TBD | Deployed address of the room/role contract. |
| `CONTRACT_DEPLOYER_PRIVATE_KEY` | TBD, **handle carefully** | Only needed if the backend itself submits transactions (vs. just reading state). If so, this must never be committed, logged, or reused between environments — consider a dedicated low-value key for testnet and a properly secured signer (e.g. a KMS or hardware wallet) for anything touching mainnet. |

**Action item for Yogashree:** once Hardhat/deployment scripts exist, update
this table with real variable names and confirm whether the backend needs
write access (a funded signer key) or read-only access (just an RPC URL).

---

## Frontend — `frontend/.env` — **TBD (owner: Jaswanth)**

Not fully specified yet since the Web3Auth UI wiring isn't built. Expected to
include at minimum:

| Variable | Description |
|---|---|
| `VITE_WEB3AUTH_CLIENT_ID` (or equivalent, depending on build tool) | Must match `WEB3AUTH_CLIENT_ID` on the backend — same Web3Auth app. |
| `VITE_API_BASE_URL` | Backend base URL, e.g. `http://localhost:5000`. |
| Web3Auth chain config (network, chain namespace, RPC target for the embedded wallet) | Depends on which chain/network Web3Auth is configured for — should match whatever Yogashree deploys the contract to, if the frontend needs to read on-chain state directly. |

**Action item for Jaswanth:** once `Web3AuthLogin.jsx`/SDK init is written,
fill in the exact variable names your bundler expects (Vite prefixes with
`VITE_`, CRA with `REACT_APP_`, etc.) so this doc matches reality.

---

## Notes on secrets hygiene
- Never commit a populated `.env` — only commit `.env.example` with variable
  names and placeholder values.
- Use different `JWT_SECRET`, EmailJS keys, and OAuth credentials per
  environment (local/dev/prod) so a leak in one doesn't compromise another.
- If `CONTRACT_DEPLOYER_PRIVATE_KEY` (or any signer key) ends up needed, keep
  it out of `.env` entirely for anything beyond local testnet experiments —
  prefer a secrets manager for shared/deployed environments.
