const { ethers, network } = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Updates or inserts a KEY=VALUE line in a .env file.
 * Preserves all other lines unchanged.
 */
function writeEnvVar(envPath, key, value) {
  if (!fs.existsSync(envPath)) return;

  const content = fs.readFileSync(envPath, "utf8");
  const lines = content.split("\n");
  const idx = lines.findIndex((l) => l.startsWith(`${key}=`));

  if (idx !== -1) {
    lines[idx] = `${key}=${value}`;
  } else {
    lines.push(`${key}=${value}`);
  }

  fs.writeFileSync(envPath, lines.join("\n"));
}

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log(`Network  : ${network.name}`);
  console.log(`Deployer : ${deployer.address}`);
  console.log(
    `Balance  : ${ethers.formatEther(
      await ethers.provider.getBalance(deployer.address)
    )} ETH\n`
  );

  const RoomRegistry = await ethers.getContractFactory("RoomRegistry");
  const registry = await RoomRegistry.deploy(deployer.address);
  await registry.waitForDeployment();

  const contractAddress = await registry.getAddress();
  console.log(`RoomRegistry deployed to: ${contractAddress}`);

  // ── Write to blockchain/.env ──────────────────────────────────────────────
  const blockchainEnv = path.join(__dirname, "../.env");
  writeEnvVar(blockchainEnv, "CONTRACT_ADDRESS", contractAddress);
  console.log(`\nUpdated blockchain/.env  → CONTRACT_ADDRESS=${contractAddress}`);

  // ── Write to backend/.env ─────────────────────────────────────────────────
  const backendEnv = path.join(__dirname, "../../backend/.env");
  if (fs.existsSync(backendEnv)) {
    writeEnvVar(backendEnv, "CONTRACT_ADDRESS", contractAddress);
    console.log(`Updated backend/.env     → CONTRACT_ADDRESS=${contractAddress}`);
  } else {
    console.log(`backend/.env not found — set CONTRACT_ADDRESS=${contractAddress} manually`);
  }

  // ── Write deployments.json ────────────────────────────────────────────────
  const deploymentsPath = path.join(__dirname, "../deployments.json");
  const existing = fs.existsSync(deploymentsPath)
    ? JSON.parse(fs.readFileSync(deploymentsPath, "utf8"))
    : {};

  existing[network.name] = {
    contractAddress,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
  };

  fs.writeFileSync(deploymentsPath, JSON.stringify(existing, null, 2));
  console.log(`\nDeployment saved to blockchain/deployments.json`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
