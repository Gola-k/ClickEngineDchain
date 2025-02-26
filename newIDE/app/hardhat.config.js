// const fs = require('fs');
// require('@nomiclabs/hardhat-waffle');

// const privateKey = fs
//   .readFileSync('.secret')
//   .toString()
//   .trim();

// const ALCHEMY_API_KEY_URL =
//   'https://eth-sepolia.g.alchemy.com/v2/IGJD0yiLouK86_fCJBdm-COk2pKnV2w0';

// module.exports = {
//   // networks: {
//   //   hardhat: {
//   //     chainId: 1337,
//   //   },
//   // },
//   solidity: '0.8.4',
//   networks: {
//     sepolia: {
//       url: ALCHEMY_API_KEY_URL,
//       accounts: [privateKey],
//     },
//   },
// };

require('@nomicfoundation/hardhat-toolbox');
require('dotenv').config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: '0.8.20',
  networks: {
    DCHAINtestnet: {
      url: process.env.API_URL,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};
