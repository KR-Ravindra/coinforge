import { useEffect, useState } from "react";
import {ethers} from "ethers";

function UserToken({ token, amount, name, image }) {
  return (
    <div className="token__details">
     
      <img src={`http://kr-r.me/files/${image}.png?token=12345`} alt={name} width={128} height={128} />
      <p>Token: {token.slice(0, 6) + "..." + token.slice(38, 42)}</p>
      <p>Amount: {amount}</p>
      <p className="name">{name}</p>
    </div>
  );
}

export default UserToken;