# CoinForge

## Technology Stack & Tools

- Solidity (Writing Smart Contracts & Tests)
- Javascript (Next.js & Testing)
- [Hardhat](https://hardhat.org/) (Development Framework)
- [Ethers.js](https://docs.ethers.io/v5/) (Blockchain Interaction)
- [Next.js](https://nextjs.org/) (Frontend Framework)

## Requirements For Initial Setup
- Install [NodeJS](https://nodejs.org/en/). We recommend using an LTS (long-term-support) version, and preferably installing NodeJS via [NVM](https://github.com/nvm-sh/nvm#intro).

## Setting Up
### 1. Clone/Download the Repository

### 2. Install Dependencies:
`$ npm install`

### 3. Run tests
`$ npx hardhat test`

### 4. Start Hardhat node
`$ npx hardhat node`

### 5. Run deployment script
In a separate terminal execute for local test:

`$ npx hardhat ignition deploy ignition/modules/Factory.js --network localhost`

If you have previously deployed you may want to append `--reset` at the end:

`$ npx hardhat ignition deploy ignition/modules/Factory.js --network localhost --reset`

If you want to make changes at remote, use `--network remote`

### 6. Start frontend
`$ npm run dev`


## About porject

This project, CoinForge, aims to create a decentralized marketplace for the simplified
creation and immediate trading of novel digital assets.

This project is to build a decentralized marketplace, CoinForge, where users can easily
define and launch new digital assets. The marketplace's core features will be:

1. Streamlined Asset Definition: An intuitive interface for users to specify the
properties of their digital asset for listing on the marketplace
2. Automated Trading Mechanism: Implementing an innovative contract-based
system that facilitates the immediate buying and selling of these assets within
the marketplace based on a predefined algorithm or model.
3. Basic Marketplace Interface: A web interface allowing users to connect their
wallets and interact with the marketplace's asset creation and trading
functionalities.

The initial scope will concentrate on these fundamental marketplace aspects, with
potential future expansions considering features like asset discovery, community
engagement, and enhanced trading tools.

