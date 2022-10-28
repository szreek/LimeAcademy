import { HardhatUserConfig, subtask, task } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-etherscan";
require('dotenv').config({path: './process.env'});


const config: HardhatUserConfig = {
  solidity: "0.8.17",
};

const { GOERLI_URL, PRIVATE_KEY, ETHERSCAN_API_KEY } = process.env;

task("deploy", "Deploys contract on a provided network")
    .addParam("libraryName", "Please provide the Library Name")
    .setAction(async ({libraryName}) => {
         const deployLibrary = require("./scripts/deploy");
          await deployLibrary(libraryName);
});

task("deploy-mainnet", "Deploys contract on a provided network")
    .addParam("libraryName", "Please provide the Library Name")
    .addParam("privateKey", "Please provide the private key")
    .setAction(async ({libraryName, privateKey}) => {
         const deployLibrary = require("./scripts/deploy-mainnet");
          await deployLibrary(libraryName, privateKey);
});

subtask("print", "Prints a message")
    .addParam("message", "The message to print")
    .setAction(async (taskArgs) => {console.log(taskArgs.message);
});      

module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.7.4",
      },
      {
        version: "0.8.4",
      },
    ],
  },
};

module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
    },
    goerli: {
      url: GOERLI_URL,
      accounts: [PRIVATE_KEY]
    }
  },

  etherscan: {
    // Your API key for Etherscan
    // Obtain one at <https://etherscan.io/>
    apiKey: ETHERSCAN_API_KEY
  },

  solidity: {
    version: "0.8.0",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
}

allowUnlimitedContractSize: true
export default config;
