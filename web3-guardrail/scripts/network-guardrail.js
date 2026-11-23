/**
 * Network Guardrail Script (حاجز الأمان الصارم لمنع الاتصال بالـ Mainnet)
 * 
 * WHY:
 * This script runs in the CI/CD pipeline before ANY test or contract deployment.
 * It inspects the RPC URL, Chain ID, and Environment variables.
 * If ANY Mainnet signature is detected, it ABORTS IMMEDIATELY with exit code 1.
 */

const FORBIDDEN_MAINNET_CHAIN_IDS = new Set([
  1,        // Ethereum Mainnet
  137,      // Polygon PoS Mainnet
  43114,    // Avalanche C-Chain Mainnet
  101,      // Solana Mainnet-Beta
  56,       // BNB Smart Chain Mainnet
  42161,    // Arbitrum One Mainnet
  10,       // Optimism Mainnet
  8453,     // Base Mainnet
]);

const ALLOWED_TESTNET_CHAIN_IDS = new Set([
  80002,    // Polygon Amoy Testnet (Free Faucet)
  43113,    // Avalanche Fuji Testnet (Free Faucet)
  11155111, // Ethereum Sepolia Testnet
  31337,    // Local Hardhat Network (Local Mock)
  1337,     // Local Ganache / Anvil
]);

const FORBIDDEN_RPC_KEYWORDS = [
  'mainnet',
  'polygon-rpc.com',
  'api.avax.network',
  'mainnet-beta',
  'infura.io/v3/[^/]+$', // Without testnet prefix
];

function assertTestnetOnly(networkName, chainId, rpcUrl) {
  console.log(`\n🔍 [Pre-Flight Guardrail] Checking Network: "${networkName}" | Chain ID: ${chainId}`);

  // 1. Check Chain ID
  if (FORBIDDEN_MAINNET_CHAIN_IDS.has(Number(chainId))) {
    console.error(`\n🚨 FATAL ERROR: Mainnet Chain ID (${chainId}) detected!`);
    console.error(`❌ Testing or deploying on Mainnet is STRICTLY PROHIBITED.`);
    console.error(`👉 Allowed Testnets: Polygon Amoy (80002), Avalanche Fuji (43113), Local (31337).\n`);
    process.exit(1);
  }

  // 2. Check Allowed List
  if (!ALLOWED_TESTNET_CHAIN_IDS.has(Number(chainId))) {
    console.error(`\n⚠️ REJECTED: Chain ID (${chainId}) is not in the whitelist of permitted Testnets.`);
    process.exit(1);
  }

  // 3. Check RPC URL Keywords
  if (rpcUrl) {
    const lowerUrl = rpcUrl.toLowerCase();
    for (const keyword of FORBIDDEN_RPC_KEYWORDS) {
      if (lowerUrl.includes(keyword)) {
        console.error(`\n🚨 FATAL ERROR: Forbidden Mainnet RPC URL keyword found: "${keyword}" in "${rpcUrl}"`);
        process.exit(1);
      }
    }
  }

  console.log(`✅ [GUARDRAIL PASSED]: Network is verified as a safe Testnet (Chain ID: ${chainId}).`);
}

module.exports = { assertTestnetOnly, FORBIDDEN_MAINNET_CHAIN_IDS, ALLOWED_TESTNET_CHAIN_IDS };

// Standalone CLI execution
if (require.main === module) {
  const chainId = process.env.CHAIN_ID || process.argv[2];
  const rpcUrl = process.env.RPC_URL || process.argv[3];
  const networkName = process.env.NETWORK_NAME || 'CI-Network';

  if (!chainId) {
    console.error('Usage: node network-guardrail.js <chain_id> [rpc_url]');
    process.exit(1);
  }

  assertTestnetOnly(networkName, chainId, rpcUrl);
}
