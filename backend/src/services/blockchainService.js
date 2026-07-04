const { ethers } = require("ethers");
const path = require("path");
const fs = require("fs");

// ─── ABI Loader ──────────────────────────────────────────────────────────────
const artifactPath = path.resolve(
  __dirname,
  "../../../blockchain/artifacts/contracts/RoomRegistry.sol/RoomRegistry.json"
);

function loadABI() {
  if (!fs.existsSync(artifactPath)) {
    throw new Error(
      `RoomRegistry artifact not found.\nRun: cd blockchain && npx hardhat compile`
    );
  }
  return JSON.parse(fs.readFileSync(artifactPath, "utf8")).abi;
}

// ─── Contract Singleton ───────────────────────────────────────────────────────
let _contract = null;

function getContract() {
  if (_contract) return _contract;

  const rpcUrl = process.env.BLOCKCHAIN_RPC_URL || "http://127.0.0.1:8545";
  const privateKey = process.env.PRIVATE_KEY;
  const contractAddress = process.env.CONTRACT_ADDRESS;

  if (
    !contractAddress ||
    contractAddress === "0x0000000000000000000000000000000000000000"
  ) {
    throw new Error("CONTRACT_ADDRESS is not configured in backend .env");
  }

  if (!privateKey) {
    throw new Error("PRIVATE_KEY is not configured in backend .env");
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const signer = new ethers.Wallet(privateKey, provider);

  _contract = new ethers.Contract(contractAddress, loadABI(), signer);
  return _contract;
}

/** Resets the singleton — used in tests to reinitialise with different env vars. */
function resetContract() {
  _contract = null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Converts a plain string roomId to bytes32.
 * Throws a clear error if the string exceeds 31 bytes (bytes32 limit).
 */
function toBytes32(roomId) {
  if (!roomId || typeof roomId !== "string") {
    throw new Error("roomId must be a non-empty string");
  }
  if (Buffer.byteLength(roomId, "utf8") > 31) {
    throw new Error(
      `roomId "${roomId}" exceeds 31 bytes — shorten it or use a hashed identifier`
    );
  }
  return ethers.encodeBytes32String(roomId);
}

// ─── Public Service Functions ─────────────────────────────────────────────────

/**
 * Returns true if `address` is the on-chain host of the room.
 * @param {string} roomId   Plain string room identifier (max 31 bytes)
 * @param {string} address  Ethereum address to verify
 */
async function isUserHost(roomId, address) {
  return getContract().isHost(toBytes32(roomId), address);
}

/**
 * Returns true if `address` owns the given room.
 * @param {string} roomId   Plain string room identifier (max 31 bytes)
 * @param {string} address  Ethereum address to verify
 */
async function ownsRoom(roomId, address) {
  return getContract().ownsRoom(toBytes32(roomId), address);
}

/**
 * Registers a new room on-chain. The backend signer wallet becomes the owner.
 * Sends a transaction — costs gas.
 * @param {string} roomId   Plain string room identifier (max 31 bytes)
 * @param {string} address  Informational — the user address (logged only; signer pays gas)
 */
async function createRoom(roomId, address) {
  const tx = await getContract().createRoom(toBytes32(roomId));
  const receipt = await tx.wait();
  return { txHash: receipt.hash, roomId, owner: address };
}

/**
 * Transfers room ownership to `newOwner` on-chain.
 * The backend signer wallet must currently own the room.
 * @param {string} roomId    Plain string room identifier (max 31 bytes)
 * @param {string} newOwner  Ethereum address of the new owner
 */
async function transferOwnership(roomId, newOwner) {
  const tx = await getContract().transferRoomOwnership(toBytes32(roomId), newOwner);
  const receipt = await tx.wait();
  return { txHash: receipt.hash, roomId, newOwner };
}

module.exports = { isUserHost, ownsRoom, createRoom, transferOwnership, resetContract };
