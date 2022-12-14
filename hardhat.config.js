/* hardhat.config.js */
require("@nomiclabs/hardhat-waffle")
require("dotenv").config()
const fs = require("fs")
const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x"
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || "https://rpc-mumbai.matic.today"

module.exports = {
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            chainId: 31337,
        },
        localhost: {
            chainId: 31337,
        },
        mumbai: {
            url: RPC_URL,
            accounts: [PRIVATE_KEY],
        },
    },
    solidity: {
        version: "0.8.4",
        settings: {
            optimizer: {
                enabled: true,
                runs: 200,
            },
        },
    },
}
