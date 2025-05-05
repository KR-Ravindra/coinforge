import {ethers} from "ethers";

function UserToken({ token, amount, name, image }) {
  return (
    <button onClick={() => toggleTrade(token)} className="token">
    <div className="token__details" >
     
      <img src={`https://kr-r.me/files/${image}.png?token=12345`} alt={name} width={128} height={128} />
      <p className="subtext">Token: {token.slice(0, 6) + "..." + token.slice(38, 42)}</p>
      <p className="subtext">Amount: {ethers.formatUnits(amount,18)}</p>
      <p className="name">{name}</p>
    </div>
    </button>
  );
}

export default UserToken;