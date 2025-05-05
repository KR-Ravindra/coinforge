const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers")
const { expect } = require("chai")
const { ethers } = require("hardhat")

describe("Factory", function () {
  // Factory contract variables
  const FEE = ethers.parseUnits("0.01", 18)

  async function deployFactoryFixture() {
    // Get accounts
    const [deployer, creator, buyer] = await ethers.getSigners()

    // Deploy factory
    const Factory = await ethers.getContractFactory("Factory")
    const factory = await Factory.deploy(FEE)

    // Create token
    const transaction = await factory.connect(creator).create("DAPP Uni", "DAPP", { value: FEE })
    await transaction.wait()

    // Get token address
    const tokenAddress = await factory.tokens(0)
    const token = await ethers.getContractAt("Token", tokenAddress)

    // Return values
    return { factory, token, deployer, creator, buyer }
  }

  async function buyTokenFixture() {
    const { factory, token, creator, buyer, userOwnedTokens } = await deployFactoryFixture()

    const AMOUNT = ethers.parseUnits("10000", 18)
    const COST = ethers.parseUnits("1", 18)

    // Buy tokens
    const transaction = await factory.connect(buyer).buy(await token.getAddress(), AMOUNT, { value: COST })
    await transaction.wait()

    //Buy another token
    const {factory: factory2, token: token2} = await deployFactoryFixture()
    const transaction2 = await factory2.connect(buyer).buy(await token2.getAddress(), AMOUNT, { value: COST })
    await transaction2.wait()
    console.log("Token2: ", await token2.getAddress())

    return { factory, token, creator, buyer, userOwnedTokens }
  }

  describe("Deployment", function () {
    it("Should set the fee", async function () {
      const { factory } = await loadFixture(deployFactoryFixture)
      expect(await factory.fee()).to.equal(FEE)
    })

    it("Should set the owner", async function () {
      const { factory, deployer } = await loadFixture(deployFactoryFixture)
      expect(await factory.owner()).to.equal(deployer.address)
    })
  })

  describe("Creating", function () {
    it("Should set the owner", async function () {
      const { factory, token } = await loadFixture(deployFactoryFixture)
      expect(await token.owner()).to.equal(await factory.getAddress())
    })

    it("Should set the creator", async function () {
      const { token, creator } = await loadFixture(deployFactoryFixture)
      expect(await token.creator()).to.equal(creator.address)
    })

    it("Should set the supply", async function () {
      const { factory, token } = await loadFixture(deployFactoryFixture)

      const totalSupply = ethers.parseUnits("1000000", 18)

      expect(await token.balanceOf(await factory.getAddress())).to.equal(totalSupply)
    })

    it("Should update ETH balance", async function () {
      const { factory } = await loadFixture(deployFactoryFixture)

      const balance = await ethers.provider.getBalance(await factory.getAddress())

      expect(balance).to.equal(FEE)
    })

    it("Should create the sale", async function () {
      const { factory, token, creator } = await loadFixture(deployFactoryFixture)

      const count = await factory.totalTokens()
      expect(count).to.equal(1)

      const sale = await factory.getTokenSale(0)

      expect(sale.token).to.equal(await token.getAddress())
      expect(sale.creator).to.equal(creator.address)
      expect(sale.sold).to.equal(0)
      expect(sale.raised).to.equal(0)
      expect(sale.isOpen).to.equal(true)
    })
  })

  describe("Buying", function () {
    const AMOUNT = ethers.parseUnits("10000", 18)
    const COST = ethers.parseUnits("1", 18)

    it("Should update ETH balance", async function () {
      const { factory } = await loadFixture(buyTokenFixture)

      const balance = await ethers.provider.getBalance(await factory.getAddress())

      // Remember the fee to initially create the token + someone who bought
      expect(balance).to.equal(FEE + COST)
    })

    it("Should update token balances", async function () {
      const { token, buyer } = await loadFixture(buyTokenFixture)

      const balance = await token.balanceOf(buyer.address)

      expect(balance).to.equal(AMOUNT)
    })

    it("Should update token sale", async function () {
      const { factory, token } = await loadFixture(buyTokenFixture)

      const sale = await factory.tokenToSale(await token.getAddress())

      expect(sale.sold).to.equal(AMOUNT)
      expect(sale.raised).to.equal(COST)
      expect(sale.isOpen).to.equal(true)
    })

    it("Should increase base cost", async function () {
      const { factory, token } = await loadFixture(buyTokenFixture)

      const sale = await factory.tokenToSale(await token.getAddress())
      const cost = await factory.getCost(sale.sold)

      expect(cost).to.be.equal(ethers.parseUnits("0.0002"))
    })
  })

  describe("Depositing", function () {
    const AMOUNT = ethers.parseUnits("10000", 18)
    const COST = ethers.parseUnits("2", 18)

    it("Sale should be closed and successfully deposits", async function () {
      const { factory, token, creator, buyer } = await loadFixture(buyTokenFixture)

      // Buy tokens again to reach target
      const buyTx = await factory.connect(buyer).buy(await token.getAddress(), AMOUNT, { value: COST })
      await buyTx.wait()

      const sale = await factory.tokenToSale(await token.getAddress())
      expect(sale.isOpen).to.equal(false)

      const depositTx = await factory.connect(creator).deposit(await token.getAddress())
      await depositTx.wait()

      const balance = await token.balanceOf(creator.address)
      expect(balance).to.equal(ethers.parseUnits("980000", 18))
    })
  })

  describe("Withdrawing Fees", function () {
    it("Should update ETH balances", async function () {
      const { factory, deployer } = await loadFixture(deployFactoryFixture)

      const transaction = await factory.connect(deployer).withdraw(FEE)
      await transaction.wait()

      const balance = await ethers.provider.getBalance(await factory.getAddress())

      expect(balance).to.equal(0)
    })
  })

  describe("User to Token List functionalities", function () {
    it("Should correctly manage user-owned tokens", async function () {
    const [deployer, creator, buyer] = await ethers.getSigners()

    // Deploy factory
    const Factory = await ethers.getContractFactory("Factory")
    const factory = await Factory.deploy(FEE)

    // Create token
    const transaction = await factory.connect(deployer).create("DAPP Uni", "DAPP", { value: FEE })
    await transaction.wait()
    const transaction2 = await factory.connect(deployer).create("DAPP Uni 2", "DAPP", { value: FEE })
    await transaction2.wait()
    
    console.log("User Owned Tokens: ", await factory.getTokensOwnedByUser(deployer.address))
    });
  })

  it("Transfer ownership of token as token.owner()", async function () {
    const { factory, token, creator, buyer } = await loadFixture(buyTokenFixture);

    const currentOwner = await token.owner();
    const buyerAddress = await buyer.address;
    const tokenAddress = await token.getAddress();
    console.log("Current Owner: ", currentOwner);
    console.log("Buyer Address: ",  buyerAddress);
    console.log("Token Address: ", tokenAddress);
    console.log("Token on current owner: ", await factory.getTokensOwnedByUser(currentOwner));
    console.log("Token on buyer: ", await factory.getTokensOwnedByUser(buyerAddress));


    const transaction = await factory.connect(creator).transferToken(tokenAddress, buyerAddress);
    await transaction.wait();
    const newOwner = await token.owner();
    console.log("New Owner: ", newOwner);
    expect(newOwner).to.equal(buyer.address);

    console.log("Token on old owner: ", await factory.getTokensOwnedByUser(currentOwner));
    console.log("Token on buyer: ", await factory.getTokensOwnedByUser(buyerAddress));

});

it("Should transfer token ownership", async function () {
  const { factory, token, creator, buyer } = await loadFixture(buyTokenFixture);

  const tokenAddress = await token.getAddress();

  // Ensure the creator is the current owner
  const sale = await factory.tokenToSale(tokenAddress);
  expect(sale.creator).to.equal(creator.address);

  // Transfer ownership
  await factory.connect(creator).transferToken(tokenAddress, buyer.address);

  // Verify the new owner
  const updatedSale = await factory.tokenToSale(tokenAddress);
  expect(updatedSale.creator).to.equal(buyer.address);
});
})
