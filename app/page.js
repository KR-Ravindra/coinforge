"use client"

import { useEffect, useState } from "react"
import { ethers } from 'ethers'

// Components
import Header from "./components/Header"
import List from "./components/List"
import Token from "./components/Token"
import Trade from "./components/Trade"
import UserToken from "./components/UserToken";  

// ABIs & Config
import Factory from "./abis/Factory.json"
import config from "./config.json"

export default function Home() {
  const [provider, setProvider] = useState(null)
  const [account, setAccount] = useState(null)
  const [factory, setFactory] = useState(null)
  const [fee, setFee] = useState(0)
  const [tokens, setTokens] = useState([])
  const [token, setToken] = useState(null)
  const [showCreate, setShowCreate] = useState(false)
  const [showTrade, setShowTrade] = useState(false)
  const [userOwnedTokens, setUserOwnedTokens] = useState([])
  const [showUserOwnedTokens, setShowUserOwnedTokens] = useState(false)

  function toggleCreate() {
    showCreate ? setShowCreate(false) : setShowCreate(true)
  }

  function toggleTrade(token) {
    setToken(token)
    showTrade ? setShowTrade(false) : setShowTrade(true)
  }

  async function loadBlockchainData() {
    // Use MetaMask for our connection
    const provider = new ethers.BrowserProvider(window.ethereum)
    setProvider(provider)

    // Get the current network
    const network = await provider.getNetwork()

    // Create reference to Factory contract
    const factory = new ethers.Contract(config[network.chainId].factory.address, Factory, provider)
    setFactory(factory)

    // Fetch the fee
    const fee = await factory.fee()
    setFee(fee)

    // Prepare to fetch token details
    const totalTokens = await factory.totalTokens()
    const tokens = []

    // We'll get the first 6 tokens listed
    for (let i = 0; i < totalTokens; i++) {
      if (i == 600) {
        break
      }

      const tokenSale = await factory.getTokenSale(i)

      // We create our own object to store extra fields
      // like images
      const token = {
        token: tokenSale.token,
        name: tokenSale.name,
        creator: tokenSale.creator,
        sold: tokenSale.sold,
        raised: tokenSale.raised,
        isOpen: tokenSale.isOpen,
        image: `image-${tokenSale.name}`,
      }

      tokens.push(token)
    }

    // We reverse the array so we can get the most
    // recent token listed to display first
    setTokens(tokens.reverse())
  }

  async function updateUserOwnedTokens() {
    console.log("Account: ", account)
    const tokenListByUser = await factory.getTokensOwnedByUser(account)
    console.log("User Owned Tokens: ", tokenListByUser)
    setUserOwnedTokens(tokenListByUser)
  }

  useEffect(() => {
    loadBlockchainData()
    updateUserOwnedTokens()
  }, [showCreate, showTrade, showUserOwnedTokens])

  return (
    <div className="page">
      <Header account={account} setAccount={setAccount} />

      <main>
        <div className="create">
          <button onClick={factory && account && toggleCreate} className="btn--fancy" >
            {!factory ? (
              "❓ contract not deployed ❓"
            ) : !account ? (
              "⌛ Wallet Connection Pending... "
            ) : (
              "⛏💎  Forge a new token  ⛏💎"
            )}
          </button>
        </div>
        {account && (
          <div className="listings">
            <div className="userOwnedTokensContainer">
              <button
                onClick={() => {
                  updateUserOwnedTokens();
                  if (userOwnedTokens.length > 0) {
                    setShowUserOwnedTokens(!showUserOwnedTokens);
                  } else {
                    console.log("No tokens owned");
                  }
                }}
                className="btn--fancy"
              >
                <p>🔭  View your tokens  </p>
              </button>

              {showUserOwnedTokens && (
                <div className="tokens">
                  {userOwnedTokens.map((token, index) => (
                    <UserToken
                      token = {token.token}
                      amount = {token.amount ? token.amount : 1}
                      name = {token.name}
                      image = {`image-${token.name}`}
                      key = {index}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
          
        )}
       { account && (
        <div className="listings">
          <p className="brand">🔥  All Tokens on the Launchpad 🔥</p>

          <div className="tokens">
            {!account ? (
              <p className="brand"> 👀 Awaiting wallet connection... </p>
            ) : tokens.length === 0 ? (
              <p className="brand">No tokens listed 📭</p>
            ) : (
              tokens.map((token, index) => (
                <Token
                  toggleTrade={toggleTrade}
                  token={token}
                  key={index}
                />
              ))
            )}
          </div>
        </div>
        )}

        {showCreate && (
          <List toggleCreate={toggleCreate} fee={fee} provider={provider} factory={factory} />
        )}

        {showTrade && (
          <Trade toggleTrade={toggleTrade} token={token} provider={provider} factory={factory} />
        )}

        
      </main>
    </div>
  );
}
