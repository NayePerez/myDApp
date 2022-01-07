// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract MyCoin{
    string public name;
    string public symbol;
    uint8 public decimals;
    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf; //Para checar el saldo de cada address
    mapping(address => mapping(address => uint256)) public allowance; //Saber cuantos tokens mios puede gestionar otra cuenta.

    constructor(){
        name = "MediCoin";
        symbol = "MC";
        decimals = 10;
        totalSupply = 1000 * (uint256(10) ** decimals); //cantidad total
        balanceOf[msg.sender] = totalSupply;
    }

    event Transfer(address indexed _from, address indexed _to, uint256 _value);
    event Approval(address indexed _owner, address indexed _spender, uint256 _value);

    function transfer(address _to, uint256 _value) public returns (bool success){
        require(balanceOf[msg.sender] >= _value);
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;
        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    function approve (address _spender, uint256 _value) public returns (bool success){
        allowance[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success){
        //El dueño tenga los tokens
        require(balanceOf[_from] >= _value);
        //Quien manda a llamar la funcion esta autorizado a manejar estos tokens
        require(allowance[_from][msg.sender] >= _value); 
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
        allowance[_from][msg.sender] -= _value;
        emit Transfer(_from, _to, _value);
        return true;
    }

}