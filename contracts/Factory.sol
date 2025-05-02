// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.27;

import {Token} from "./Token.sol";

contract Factory {

    uint256 public immutable fee;
    address public owner;
    address[] public tokens;
    uint256 public totalTokens;
    mapping(address => TokenSale) public tokenToSale;

    struct TokenSale {
        address token;
        string name;
        address creator;
        uint256 sold;
        uint256 raised;
        bool isOpen;
    }

    event Created(
        address indexed token,
        string name,
        address indexed creator,
        uint256 sold,
        uint256 raised,
        bool isOpen
    );

    event Buy(
        address indexed token,
        address indexed buyer,
        uint256 amount
    );

    constructor(uint256 _fee) {
        fee = _fee;
        owner = msg.sender;
    }

    function getTokenSale(uint256 _index) external view returns (TokenSale memory) {
        return tokenToSale[tokens[_index]];
    }

    function getCost(uint256 _sold) public pure returns (uint256) {
        uint256 floor = 0.0001 ether;
        uint256 step = 0.0001 ether;
        uint256 increment = 0.0001 ether;

        uint256 cost = (step * (_sold / increment)) + floor;
        return cost;
    }

    function create(string memory _name, string memory _symbol) external payable{

        require(msg.value >= fee, "Not enough ether sent");

        // Create a new token
        Token token = new Token(
            msg.sender,
            _name,
            _symbol,
            1_000_000 ether
        );
        // Save the token for later use
        tokens.push(address(token));
        totalTokens++;
        // List the token for sale 
        TokenSale memory sale = TokenSale(
            address(token),
            _name,
            msg.sender,
            0,
            0,
            true
        );

        tokenToSale[address(token)] = sale;
        // Tell people it's live
        emit Created(
            address(token),
            _name,
            msg.sender,
            0,
            0,
            true
        );
    }

    function buy(address _token, uint256 _amount) external payable {
        Token token = Token(_token);
        TokenSale storage sale = tokenToSale[_token];

        require(sale.isOpen, "Token sale is closed");
        // require(msg.value >= _amount, "Not enough ether sent");

        // Transfer the tokens to the buyer
        token.transfer(msg.sender, _amount);

        uint cost = getCost(sale.sold);
        uint price = cost * (_amount / 10 ** 18);
        // Update the sale
        sale.sold += _amount;
        sale.raised += price;
        // Emit an event
        emit Buy(
            _token,
            msg.sender,
            _amount
        );
    }

}

