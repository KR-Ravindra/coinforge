import { useEffect, useState } from "react";
import { ethers } from "ethers";


function Trade({ toggleTrade, token, provider, factory }) {
  const [target, setTarget] = useState(0);
  const [limit, setLimit] = useState(0);
  const [cost, setCost] = useState(0);
  const [showTransfer, setShowTransfer] = useState(false); // State to toggle transfer form
  const [transferAddress, setTransferAddress] = useState(""); // State to store the recipient address

  async function buyHandler(form) {
    const amount = form.get("amount");

    const cost = await factory.getCost(token.sold);
    const totalCost = cost * BigInt(amount);

    const signer = await provider.getSigner();
    try {
      const transaction = await factory.connect(signer).buy(
        token.token,
        ethers.parseUnits(amount, 18),
        { value: totalCost }
      );
      await transaction.wait();
    } catch (error) {
      alert(error.reason);
      return;
    } finally {
      toggleTrade();
      loadBlockchainData();
    }
  }

  async function transferHandler(event) {
    event.preventDefault();

    if (!ethers.isAddress(transferAddress)) {
      alert("Invalid address");
      return;
    }

    const signer = await provider.getSigner();
    try {
      const transaction = await factory.connect(signer).transferToken(token.token, transferAddress);
      await transaction.wait();
      alert("Token ownership transferred successfully!");
    } catch (error) {
      console.error("Error transferring token:", error);
      alert(error.reason );
    } finally {
      toggleTrade();
    }
  }

  async function getSaleDetails() {
    const target = await factory.TARGET();
    setTarget(target);

    const limit = await factory.TOKEN_LIMIT();
    setLimit(limit);

    const cost = await factory.getCost(token.sold);
    setCost(cost);
  }

  async function targetReached(token) {
    const signer = await provider.getSigner();
    try {
      const transaction = await factory.connect(signer).deposit(token.token);
      await transaction.wait();
      alert("Funds deposited successfully!");
    } catch (error) {
      console.error("Error depositing funds:", error);
      alert(error.reason);
    } finally {
      toggleTrade();
    }

  }

  useEffect(() => {
    getSaleDetails();
  }, []);

  return (
    <div className="trade">
      <h2>trade</h2>

      <div className="token__details">
        <p className="name">{token.name}</p>
        <p>Creator: {token.creator.slice(0, 6) + "..." + token.creator.slice(38, 42)}</p>
        <img src={`https://kr-r.me/files/${token.image}.png?token=12345`} alt="Pepe" width={256} height={256} />
        <p>Token: {token.token}</p>
        <p>Market Cap: {ethers.formatUnits(token.raised, 18)} ETH</p>
        <p>Base Cost: {ethers.formatUnits(cost, 18)} ETH</p>
      </div>

      {token.sold >= limit || token.raised >= target ? (
        <button className="btn--fancy" onClick={() => targetReached(token)}>Target Reached, Take your funds now!</button>

      ) : (
        <form action={buyHandler}>
          <input type="number" name="amount" min={1} max={10000} placeholder="1" defaultValue={1} />
          <input type="submit" value="[ buy ]" />
        </form>
      )}

      <button onClick={() => setShowTransfer(!showTransfer)} className="btn--fancy">
        [ transfer ]
      </button>

      {showTransfer && (
        <form onSubmit={transferHandler} className="transfer-form">
          <input
            type="text"
            placeholder="Recipient Address"
            value={transferAddress}
            onChange={(e) => setTransferAddress(e.target.value)}
          />
          <input type="submit" value="[ submit transfer ]" />
        </form>
      )}

      <button onClick={toggleTrade} className="btn--fancy">
        [ cancel ]
      </button>
    </div>
  );
}

export default Trade;