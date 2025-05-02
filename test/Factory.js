const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers")
const { expect } = require("chai")
const { ethers } = require("hardhat")

describe("Factory", function () {

    const FEE = ethers.parseUnits("0.01", 18)
    async function deployFactoryFixture() {
        // Fetch accounts
        const [deployer, creator, buyer] = await ethers.getSigners()

        // Fetch the contract
        const Factory = await ethers.getContractFactory("Factory")
        // Deploy the contract
        const factory = await Factory.deploy(FEE)

        // Create token
        const transaction = await factory.connect(creator).create("Cortex", "CORTEX", {value: FEE})
        await transaction.wait()
        const tokenAddress = await factory.tokens(0)
        const token = await ethers.getContractAt("Token", tokenAddress)

        return { factory, token, deployer, creator, transaction, buyer }
    }
    async function buyTokenFixture() {
        const { factory, token, creator, buyer } = await deployFactoryFixture()
        const AMOUNT = ethers.parseUnits("10000", 18)
        const COST = ethers.parseUnits("1", 18)
        const transaction = await factory.connect(buyer).buy(await token.getAddress(), AMOUNT, { value: COST })
        await transaction.wait()
        return { factory, token, creator, buyer, AMOUNT, COST }
    }

    describe("Deployment", function () {
        it("Should set the right fee", async function () {
            const { factory } = await loadFixture(deployFactoryFixture)
            expect(await factory.fee()).to.equal(FEE)
        })
        it("Should set the right owner", async function () {
            const { factory, deployer } = await loadFixture(deployFactoryFixture)
            expect(await factory.owner()).to.equal(deployer)
        })
    })
    describe("Creating Tokens", function () {
        it("Should set the owner", async function () {
            const { factory, token } = await loadFixture(deployFactoryFixture)
            expect(await token.owner()).to.equal(await factory.getAddress())

        })
        it("Should set the creator", async function () {
            const { factory, token, creator } = await loadFixture(deployFactoryFixture)
            expect(await token.creator()).to.equal(creator.address)
        }
        )
        it("Should set the name", async function () {
            const { factory, token } = await loadFixture(deployFactoryFixture)
            expect(await token.name()).to.equal("Cortex")
        })
        it("Should set the symbol", async function () {
            const { factory, token } = await loadFixture(deployFactoryFixture)
            expect(await token.symbol()).to.equal("CORTEX")
        })
        it("Should set the total supply", async function () {
            const { factory, token } = await loadFixture(deployFactoryFixture)
            expect(await token.balanceOf(await factory.getAddress())).to.equal(ethers.parseUnits("1000000", 18))
        })
        it("Should update the ETH balance of the factory", async function () {
            const { factory, creator } = await loadFixture(deployFactoryFixture)
            expect(await ethers.provider.getBalance(factory.getAddress())).to.equal(FEE)
        }
        )
        it("Should create the sale ", async function () {
            const { factory, token, creator } = await loadFixture(deployFactoryFixture)
            const count = await factory.totalTokens()
            expect(count).to.equal(1)

            const sale = await factory.getTokenSale(0);
            expect(sale.token).to.equal(await token.getAddress())
            expect(sale.creator).to.equal(creator.address)
            expect(sale.sold).to.equal(0)
            expect(sale.raised).to.equal(0)
            expect(sale.isOpen).to.equal(true)

        })
    })
    describe("Buying Tokens", function () {
        const AMOUNT = ethers.parseUnits("10000", 18)
        const COST = ethers.parseUnits("1", 18)
        it("Should update the ETH balance of the factory", async function () {
            const { factory} = await loadFixture(buyTokenFixture)
            console.log("ether balance", ethers.provider.getBalance(factory.getAddress()))
            expect(await ethers.provider.getBalance(factory.getAddress())).to.equal(FEE + COST)
        })
        it("Should update the token balance of the buyer", async function () {
            const { token, buyer, AMOUNT } = await loadFixture(buyTokenFixture)
            expect(await token.balanceOf(buyer.getAddress())).to.equal(AMOUNT)
        })
        it("Should update the token balance of the factory", async function () {
            const { token, factory } = await loadFixture(buyTokenFixture)
            const sale = await factory.tokenToSale(await token.getAddress())
            expect(sale.sold).to.equal(AMOUNT)
        })
        it("Should update token sale", async function () {
            const { factory, token } = await loadFixture(buyTokenFixture)
            const sale = await factory.tokenToSale(await token.getAddress())
            expect(sale.sold).to.equal(AMOUNT)
            expect(sale.isOpen).to.equal(true)

        })
        it("Should increase the base price", async function () {
            const { factory, token } = await loadFixture(buyTokenFixture)
            const sale = await factory.tokenToSale(await token.getAddress())
            const cost = await factory.getCost(sale.sold)
            expect(cost).to.be.equal(ethers.parseUnits("0.0002", 18))
        })
})
})

