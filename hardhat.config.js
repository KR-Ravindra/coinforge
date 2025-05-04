require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.27",
  networks: {
    remote: {
      chainId: 31337,
      url: "http://143.198.55.51:8545", // Ensure this is a valid URL
      forking: {
        url: "http://143.198.55.51:8545", // Ensure this is a valid URL
      },
    },
    localhost: {
      chainId: 31337,
      url: "http://localhost:8545", // Ensure this is a valid URL
      forking: {
        url: "http://localhost:8545", // Ensure this is a valid URL
      },
    },
  },
};