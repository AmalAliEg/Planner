require('@nomicfoundation/hardhat-toolbox');
const { assertTestnetOnly } = require('./scripts/network-guardrail');

/**
 * Hardhat Configuration strictly locked to Testnets (Amoy, Fuji)
 * Never exposes or connects to Mainnets.
 */

// Load burner testnet private key from CI/Environment (Never commit real keys!)
const TESTNET_DEPLOYER_KEY = process.env.TESTNET_PRIVATE_KEY || '0x0000000000000000000000000000000000000000000000000000000000000001';

// Pre-flight assertion hook
const targetNetwork = process.env.HARDHAT_NETWORK || 'hardhat';
if (targetNetwork === 'amoy') {
  assertTestnetOnly('Polygon Amoy', 80002, process.env.POLYGON_AMOY_RPC || 'https://rpc-amoy.polygon.technology');
} else if (targetNetwork === 'fuji') {
  assertTestnetOnly('Avalanche Fuji', 43113, process.env.AVALANCHE_FUJI_RPC || 'https://api.avax-test.network/ext/bc/C/rpc');
}

module.exports = {
  solidity: {
    version: '0.8.24',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  defaultNetwork: 'hardhat',
  networks: {
    // 1. Local Mock Sandbox (Free, instantaneous, runs in memory in GitHub Actions)
    hardhat: {
      chainId: 31337,
      mining: { auto: true },
    },

    // 2. Polygon Amoy Testnet (Free Faucet via https://faucet.polygon.technology)
    amoy: {
      url: process.env.POLYGON_AMOY_RPC || 'https://rpc-amoy.polygon.technology',
      chainId: 80002,
      accounts: [TESTNET_DEPLOYER_KEY],
      gasPrice: 'auto',
    },

    // 3. Avalanche Fuji Testnet (Free Faucet via https://faucet.avax.network)
    fuji: {
      url: process.env.AVALANCHE_FUJI_RPC || 'https://api.avax-test.network/ext/bc/C/rpc',
      chainId: 43113,
      accounts: [TESTNET_DEPLOYER_KEY],
      gasPrice: 25000000000, // 25 nAVAX
    },
    // NOTE: Mainnets (Ethereum 1, Polygon 137, Avalanche 43114) are DELIBERATELY OMITTED.
  },
  paths: {
    sources: './contracts',
    tests: './test',
    cache: './cache',
    artifacts: './artifacts',
  },
};
