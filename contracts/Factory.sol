// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.27;

import {Token} from "./Token.sol";

import "hardhat/console.sol";

contract Factory {
    uint256 public constant TARGET = 3 ether;
    uint256 public constant TOKEN_LIMIT = 500_000 ether;
    uint256 public immutable fee;
    address public owner;

    uint256 public totalTokens;
    address[] public tokens;
    mapping(address => TokenSale) public tokenToSale;

    struct UserOwnedTokens {
        string name;
        address token;
        uint256 amount;
    }

    mapping(address => UserOwnedTokens[]) public userOwnedTokensMapping;

    struct TokenSale {
        address token;
        string name;
        address creator;
        uint256 sold;
        uint256 raised;
        bool isOpen;
    }

    event Created(address indexed token);
    event Buy(address indexed token, uint256 amount);

    constructor(uint256 _fee) {
        fee = _fee;
        owner = msg.sender;
    }

    function getTokenSale(
        uint256 _index
    ) public view returns (TokenSale memory) {
        return tokenToSale[tokens[_index]];
    }

    function getCost(uint256 _sold) public pure returns (uint256) {
        uint256 floor = 0.0001 ether;
        uint256 step = 0.0001 ether;
        uint256 increment = 10000 ether;

        uint256 cost = (step * (_sold / increment)) + floor;
        return cost;
    }

    function create(
        string memory _name,
        string memory _symbol
    ) external payable {
        require(msg.value >= fee, "Factory: Creator fee not met");

        Token token = new Token(msg.sender, _name, _symbol, 1_000_000 ether);

        // Store token address
        tokens.push(address(token));

        // Increment total tokens
        totalTokens++;

        // Create the sale.
        TokenSale memory sale = TokenSale(
            address(token),
            _name,
            msg.sender,
            0,
            0,
            true
        );

        addTokenToUser(msg.sender, address(token), TOKEN_LIMIT, _name);

        // Save the sale to mapping.
        tokenToSale[address(token)] = sale;

        emit Created(address(token));
    }

    function buy(address _token, uint256 _amount) external payable {
    
        TokenSale storage sale = tokenToSale[_token];

        require(sale.isOpen == true, "Factory: Buying closed");
        require(msg.sender != sale.creator, "Factory: Creator cannot buy unless token is transferred");
        require(_amount >= 1 ether, "Factory: Amount too low");
        require(_amount <= 10000 ether, "Factory: Amount exceeded");

        // Calculate the price of 1 token based on the total bought.
        uint256 cost = getCost(sale.sold);

        // Determine the total price for X amount.
        uint256 price = cost * (_amount / 10 ** 18);

        // Check to ensure enough ETH is sent.
        require(msg.value >= price, "Factory: Insufficient ETH received");

        // Update contract states.
        sale.sold += _amount;
        sale.raised += price;

        // If we have reached our ETH goal OR buy limit, stop allowing buys.
        if (sale.sold >= TOKEN_LIMIT || sale.raised >= TARGET) {
            sale.isOpen = false;
        }

        // Transfer tokens to buyer.
        Token(_token).transfer(msg.sender, _amount);

        updateCreatorTokenAmount(sale.creator, _token, _amount);
        addTokenToUser(msg.sender, _token, _amount, sale.name);

        emit Buy(_token, _amount);
    }


    function updateCreatorTokenAmount(
        address _creator,
        address _token,
        uint256 _amount
    ) internal {
        require(msg.sender != _creator, "Factory: Creator cannot buy unless token is transferred");


        for (uint256 i = 0; i < userOwnedTokensMapping[_creator].length; i++) {
            if (userOwnedTokensMapping[_creator][i].token == _token) {
                userOwnedTokensMapping[_creator][i].amount -= _amount;
                break;
            }
        }
        
    }

    function addTokenToUser(
        address _user,
        address _token,
        uint256 _amount,
        string memory _name
    ) internal {
        UserOwnedTokens memory userOwnedToken = UserOwnedTokens(
            _name,
            _token,
            _amount
        );

        bool tokenFound = false;

        for (uint256 i = 0; i < userOwnedTokensMapping[_user].length; i++) {
            if (userOwnedTokensMapping[_user][i].token == _token) {
                userOwnedTokensMapping[_user][i].amount += _amount;
                tokenFound = true;
                break;
            }
        }

        if (!tokenFound) {
            userOwnedTokensMapping[_user].push(userOwnedToken);
        }
    }

    function deposit(address _token) external {
        // The remaining token balance and the ETH raised
        // would go into a liquidity pool like Uniswap V3.
        // For simplicity we'll just transfer remaining
        // tokens and ETH raised to the creator.

        Token token = Token(_token);
        TokenSale memory sale = tokenToSale[_token];

        require(sale.isOpen == false, "Factory: Target not reached");

        // Transfer tokens
        token.transfer(sale.creator, token.balanceOf(address(this)));

        // Transfer ETH raised
        (bool success, ) = payable(sale.creator).call{value: sale.raised}("");
        require(success, "Factory: ETH transfer failed");
    }

    function withdraw(uint256 _amount) external {
        require(msg.sender == owner, "Factory: Not owner");

        (bool success, ) = payable(owner).call{value: _amount}("");
        require(success, "Factory: ETH transfer failed");
    }
function transferToken(address _token, address _newOwner) external payable {
    TokenSale storage sale = tokenToSale[_token];

    require(msg.sender == sale.creator, "Factory: Only the creator can transfer ownership");
    require(msg.sender != _newOwner, "Factory: Cannot transfer to self");

    Token token = Token(_token);

    token.transferOwnership(payable(_newOwner));
    sale.creator = _newOwner;

    // Update the userOwnedTokensMapping
    // Remove the token from the current owner's mapping
    for (uint256 i = 0; i < userOwnedTokensMapping[msg.sender].length; i++) {
        if (userOwnedTokensMapping[msg.sender][i].token == _token) {
            // Remove the token from the current owner
            userOwnedTokensMapping[msg.sender][i] = userOwnedTokensMapping[msg.sender][userOwnedTokensMapping[msg.sender].length - 1];
            userOwnedTokensMapping[msg.sender].pop();
            break;
        }
    }
    addTokenToUser(_newOwner, _token, TOKEN_LIMIT, sale.name);

}

    function getTokensOwnedByUser(address _user) external view returns (UserOwnedTokens[] memory) {
        return userOwnedTokensMapping[_user];
    }


}
