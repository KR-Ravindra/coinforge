import {ethers} from "ethers";

function UserToken({ token, amount, name, image }) {
    console.log(ethers.utils)
  return (
   
      <div className="token__details">
        <img src={image} alt="token image" width={128} height={128} />
        <p>Token: {token.slice(0, 6) + '...' + token.slice(38, 42)}</p>
        
        <p className="name">{name}</p>
      </div>

  );
}

export default UserToken;