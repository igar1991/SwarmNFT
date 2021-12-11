require('dotenv').config();
const HDWalletProvider = require("truffle-hdwallet-provider");

module.exports = {
    networks: {
        development: {
            host: "localhost",
            port: 7545,
            gas: 5000000,
            network_id: "*", // Match any network id
        },
        poa: {
            provider: function () {
                return new HDWalletProvider(process.env.PRIVATE_KEY, "https://sokol.poa.network")
            },
            network_id: 77,
            gas: 12500000,
            gasPrice: 1000000000
        },
        xdai: {
            provider: function () {
                return new HDWalletProvider(process.env.PRIVATE_KEY, "https://dai.poa.network")
            },
            network_id: 100,
            gas: 500000,
            gasPrice: 1000000000
        },
    },
    mocha: {
        reporter: "eth-gas-reporter",
        reporterOptions: {
            currency: "USD",
            gasPrice: 2,
        },
    },
    compilers: {
        solc: {
            version: "^0.8.0",
            settings: {
                optimizer: {
                    enabled: true,
                    runs: 20   // Optimize for how many times you intend to run the code
                },
            },
        },
    },
    plugins: [
        'truffle-plugin-verify'
    ],
    api_keys: {
        etherscan: 'ETHERSCAN_API_KEY_FOR_VERIFICATION'
    }
};
