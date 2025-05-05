import { ethers } from "ethers"

function Token({ toggleTrade, token }) {

  return (
    <button onClick={() => toggleTrade(token)} className="token">
      <div className="token__details">
        <img src={`https://kr-r.me/files/${token.image}.png?token=12345`} alt="token image" width={256} height={256} />
        <p>Creator: {token.creator.slice(0, 6) + '...' + token.creator.slice(38, 42)}</p>
        <p>Market Cap: {ethers.formatUnits(token.raised, 18)} eth</p>
        <p className="name">{token.name}</p>
      </div>
    </button>
  );
}

export default Token;