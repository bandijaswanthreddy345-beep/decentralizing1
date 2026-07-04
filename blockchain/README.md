# EtherX Meet — Blockchain Decentralization Layer

On-chain room registry for EtherX Meet. Tracks room ownership and host verification using a Solidity smart contract deployed on Polygon Amoy testnet (or a local Hardhat node for development).

---

## Folder Structure

```
decentralizing1/
├── blockchain/                        # Hardhat project (this layer)
│   ├── contracts/
│   │   └── RoomRegistry.sol           # Core smart contract
│   ├── scripts/
│   │   └── deploy.js                  # Deployment script
│   ├── artifacts/                     # Auto-generated after compile (gitignored)
│   ├── deployments.json               # Auto-generated after deploy (gitignored)
│   ├── hardhat.config.js              # Hardhat + network configuration
│   ├── .env                           # Your local secrets (never commit)
│   ├── .env.example                   # Template — copy to .env and fill in
│   └── package.json
│
└── backend/
    └── src/
        ├── services/
        │   └── blockchainService.js   # ethers.js contract interface
        ├── middleware/
        │   ├── auth.js                # Existing JWT middleware (unchanged)
        │   └── blockchainAuth.js      # New: on-chain ownership/host checks
        └── routes/
            └── livekit.js             # Updated: guarded by auth + verifyHost
```

---

## Environment Variables

### `blockchain/.env`

Copy `blockchain/.env.example` to `blockchain/.env` and fill in:

| Variable | Description |
|---|---|
| `PRIVATE_KEY` | Private key of the deployer wallet (no `0x` prefix required) |
| `POLYGON_RPC_URL` | Alchemy / Infura RPC URL for Polygon Amoy testnet |
| `CONTRACT_ADDRESS` | Deployed contract address — populated after running deploy |

### `backend/.env`

Add these to the existing backend `.env`:

| Variable | Description |
|---|---|
| `BLOCKCHAIN_RPC_URL` | RPC URL the backend uses to read/write the contract (`http://127.0.0.1:8545` for local) |
| `PRIVATE_KEY` | Same deployer wallet private key — backend signer for `createRoom` / `transferOwnership` |
| `CONTRACT_ADDRESS` | Same deployed contract address as above |

---

## Setup

### 1. Install dependencies

```bash
cd blockchain
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env and fill in PRIVATE_KEY and POLYGON_RPC_URL
```

### 3. Install backend ethers dependency

```bash
cd ../backend
npm install ethers
```

---

## Compile

Compiles `RoomRegistry.sol` and outputs ABI + bytecode to `blockchain/artifacts/`.
The backend service reads the ABI directly from this folder.

```bash
cd blockchain
npx hardhat compile
```

---

## Deploy

### Local Hardhat node (development)

Terminal 1 — start the local node:
```bash
cd blockchain
npx hardhat node
```

Terminal 2 — deploy:
```bash
npx hardhat run scripts/deploy.js --network localhost
```

### Polygon Amoy Testnet

Ensure `PRIVATE_KEY` and `POLYGON_RPC_URL` are set in `blockchain/.env`, then:

```bash
npx hardhat run scripts/deploy.js --network amoy
```

After deployment, the contract address is printed to the console and saved to `deployments.json`.
Copy it into both `blockchain/.env` and `backend/.env` as `CONTRACT_ADDRESS`.

---

## Backend Integration

### How it works

```
Frontend request
    │
    ▼
POST /api/livekit/token
  { roomName, participantName, walletAddress }
    │
    ├─► auth middleware          — verifies JWT, populates req.user
    │
    ├─► verifyHost middleware    — calls RoomRegistry.isHost(roomId, walletAddress)
    │       ├── 400  missing roomId or walletAddress
    │       ├── 403  caller is not the on-chain host
    │       └── 500  blockchain node unreachable
    │
    └─► token handler            — generates LiveKit JWT (existing logic, unchanged)
```

### blockchainService functions

| Function | Description |
|---|---|
| `isUserHost(roomId, address)` | Returns `true` if address is the on-chain host of the room |
| `ownsRoom(roomId, address)` | Returns `true` if address owns the room |
| `createRoom(roomId, address)` | Registers a new room on-chain, emits `RoomCreated` |
| `transferOwnership(roomId, newOwner)` | Transfers room ownership, emits `RoomOwnershipTransferred` |

### blockchainAuth middleware

```js
const { verifyRoomOwnership, verifyHost } = require('../middleware/blockchainAuth');

// Protect any route — place after auth (JWT) middleware
router.post('/some-route', auth, verifyHost, handler);
router.post('/other-route', auth, verifyRoomOwnership, handler);
```

### Wallet address resolution

The middleware resolves the caller's wallet address in this order:
1. `req.user.walletAddress` — embedded in the JWT at login time (preferred)
2. `req.body.walletAddress` — passed explicitly in the request body (fallback)

Ensure your auth flow stores `walletAddress` in the JWT payload, or the frontend passes it in every protected request body.

---

## Testing

### Run Hardhat tests

```bash
cd blockchain
npx hardhat test
```

### Manual contract interaction (local node)

```bash
npx hardhat console --network localhost
```

```js
const Registry = await ethers.getContractFactory("RoomRegistry");
const registry = await Registry.attach("YOUR_CONTRACT_ADDRESS");

// Create a room
await registry.createRoom(ethers.encodeBytes32String("room-001"));

// Check ownership
await registry.ownsRoom(ethers.encodeBytes32String("room-001"), "YOUR_ADDRESS");
```

---

## Contract Reference

**`RoomRegistry.sol`**

| Function | Type | Description |
|---|---|---|
| `createRoom(bytes32 roomId)` | external | Register a new room; caller becomes owner |
| `transferRoomOwnership(bytes32 roomId, address newOwner)` | external | Transfer room to new owner |
| `getRoomOwner(bytes32 roomId)` | view | Returns owner address of a room |
| `ownsRoom(bytes32 roomId, address account)` | view | Returns true if account owns the room |
| `isHost(bytes32 roomId, address account)` | view | Returns true if account is the room host |
| `getOwnedRooms(address account)` | view | Returns all roomIds owned by account |

| Event | Description |
|---|---|
| `RoomCreated(bytes32 roomId, address owner)` | Emitted on successful room creation |
| `RoomOwnershipTransferred(bytes32 roomId, address previousOwner, address newOwner)` | Emitted on ownership transfer |

---

## Notes

- `roomId` is stored as `bytes32` on-chain. The backend service handles the `string → bytes32` conversion via `ethers.encodeBytes32String()` transparently.
- The `blockchain/` folder is a fully independent Node.js project. It does not share `node_modules` with the backend.
- `artifacts/` and `deployments.json` are generated files — add them to `.gitignore` if you don't want to commit compiled output.
- For production, consider a meta-transaction / gas relayer pattern so end users pay their own gas instead of the backend wallet.
