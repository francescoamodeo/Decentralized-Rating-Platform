/**
 * Use this file to configure your truffle project. It's seeded with some
 * common settings for different networks and features like migrations,
 * compilation and testing. Uncomment the ones you need or modify
 * them to suit your project as necessary.
 *
 * More information about configuration can be found at:
 *
 * truffleframework.com/docs/advanced/configuration
 *
 * To deploy via Infura you'll need a wallet provider (like truffle-hdwallet-provider)
 * to sign your transactions before they're sent to a remote public node. Infura accounts
 * are available for free at: infura.io/register.
 *
 * You'll also need a mnemonic - the twelve word phrase the wallet uses to generate
 * public/private key pairs. If you're publishing your code to GitHub make sure you load this
 * phrase from a file you've .gitignored so it doesn't accidentally become public.
 *
 */

require('dotenv').config();
const mnemonic = process.env["MNEMONIC"];
const infura_key = process.env["INFURA_KEY3"];

const HDWalletProvider = require('@truffle/hdwallet-provider');

module.exports = {
  /**
   * Networks define how you connect to your ethereum client and let you set the
   * defaults web3 uses to send transactions. If you don't specify one truffle
   * will spin up a development blockchain for you on port 9545 when you
   * run `develop` or `test`. You can ask a truffle command to use a specific
   * network from the command line, e.g
   *
   * $ truffle test --network <network-name>
   */

  networks: {
    // Useful for testing. The `development` name is special - truffle uses it by default
    // if it's defined here and no other network is specified at the command line.
    // You should run a client (like ganache-cli, geth or parity) in a separate terminal
    // tab if you use this network and you must also set the `host`, `port` and `network_id`
    // options below to some value.
    //
    development: {
     host: "127.0.0.1",     // Localhost (default: none)
     port: 8545,            // Standard Ethereum port (default: none)
     network_id: "*",       // Any network (default: none)
     gas: 850000000
    },

    testing: {
      host: "127.0.0.1",     // Localhost (default: none)
      port: 8545,            // Standard Ethereum port (default: none)
      network_id: "*",       // Any network (default: none)
      gas: 850000000
     },

    ropsten:  {
      provider: function() {
        return new HDWalletProvider(mnemonic, "https://ropsten.infura.io/v3/"+infura_key)
      },
      network_id: 3,
      host: "127.0.0.1",
      port:  8545,
      gas:   7000000,
      gasPrice: 20000000000,
    },

    // Alias for "Ropsten", for measurements
    // ropstenmeasures: {
    //   host: "127.0.0.1",     // Localhost (default: none)
    //   port: 8545,            // Standard Ethereum port (default: none)
    //   network_id: "*",       // Any network (default: none)
    //   gas: 850000000
    //  },
 

    ropstenmeasures:  {
      provider: function() {
        return new HDWalletProvider(mnemonic, "https://ropsten.infura.io/v3/"+infura_key)
      },
      network_id: 3,
      host: "127.0.0.1",
      port:  8545,
      gas:   7000000,
      gasPrice: 20000000000,
    },

    arbitrum_local: {
      network_id: 412346,
      gas: 32000000,
      gasPrice: 100000000,
      provider: function() {
        return new HDWalletProvider([
          process.env.PRIVATE_KEY,
          process.env.L1L2LOCAL_PRIVATE_KEY,
          process.env.L2LOCAL_PRIVATE_KEY,
          ], 'http://127.0.0.1:8547', 0, 3)
      },
      networkCheckTimeout: 1000000,    
      timeoutBlocks: 200,
    },
    geth:{
      network_id: "*",
      host: "127.0.0.1",
      port: 8545,
      //gas:   30000000,
      gasPrice: 20000000000,
      provider: function() { 
        return new HDWalletProvider([
          process.env.PRIVATE_KEY,
          process.env.L1L2LOCAL_PRIVATE_KEY,
          process.env.L2LOCAL_PRIVATE_KEY,
          ], 'http://127.0.0.1:8545', 0, 3)
      },
    },  

    /*
    process.env.PRIVATE_KEY,
          "5183a3b1349183e8c6f9658872594e4b62070c96f195a6b69eacecea41d49a8a",
          "e51166d32de9d02f1ef12766b79bb412c3214d1eae7ca2eab38587a73afdf2a3",
          "39a8a13c8a2bf52dd3a350ea95b5ada528dcbdd89f4347c164b8b2cbe9ecc906",
          "1a3f0779f8fd88d87a330108658ac99864edb5c20b1ccfe75e88b6aceb232d1e",
          "d5f9311e401ecb887f899ba9e5603fc2c7d15cbccfa1a486c1ceab0b4a2fed11",
          process.env.PRIVATE_KEY_STAKER_4,
          process.env.PRIVATE_KEY_STAKER_2
    */
    arbitrum_sepolia: {
      network_id: 421614,
      provider: function() {
        return new HDWalletProvider(mnemonic, 'https://arbitrum-sepolia.infura.io/v3/'+infura_key)
      },
      networkCheckTimeout: 1000000,    
      timeoutBlocks: 200,
    },
    sepolia: {
      network_id: 11155111,
      provider: function() {
        return new HDWalletProvider(mnemonic,'https://sepolia.infura.io/v3/'+infura_key)
      },
      networkCheckTimeout: 1000000,    
      timeoutBlocks: 200,
    }
    

    // Another network with more advanced options...
    // advanced: {
      // port: 8777,             // Custom port
      // network_id: 1342,       // Custom network
      // gas: 8500000,           // Gas sent with each transaction (default: ~6700000)
      // gasPrice: 20000000000,  // 20 gwei (in wei) (default: 100 gwei)
      // from: <address>,        // Account to send txs from (default: accounts[0])
      // websockets: true        // Enable EventEmitter interface for web3 (default: false)
    // },

    // Useful for deploying to a public network.
    // NB: It's important to wrap the provider as a function.
    // ropsten: {
      // provider: () => new HDWalletProvider(mnemonic, `https://ropsten.infura.io/v3/YOUR-PROJECT-ID`),
      // network_id: 3,       // Ropsten's id
      // gas: 5500000,        // Ropsten has a lower block limit than mainnet
      // confirmations: 2,    // # of confs to wait between deployments. (default: 0)
      // timeoutBlocks: 200,  // # of blocks before a deployment times out  (minimum/default: 50)
      // skipDryRun: true     // Skip dry run before migrations? (default: false for public nets )
    // },

    // Useful for private networks
    // private: {
      // provider: () => new HDWalletProvider(mnemonic, `https://network.io`),
      // network_id: 2111,   // This network is yours, in the cloud.
      // production: true    // Treats this network as if it was a public net. (default: false)
    // }
  },

  // Set default mocha options here, use special reporters etc.
  mocha: {
    // timeout: 100000
  },

  // Configure your compilers
  compilers: {
    solc: {
      version: "0.5.13",    // Fetch exact version from solc-bin (default: truffle's version)
      // docker: true,        // Use "0.5.1" you've installed locally with docker (default: false)
      settings: {          // See the solidity docs for advice about optimization and evmVersion
       optimizer: {
         enabled: true,
         runs: 200
       },
       evmVersion: "byzantium"
      }
    }
  }
}
