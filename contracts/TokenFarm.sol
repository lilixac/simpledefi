// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.0;

import "./MyToken.sol";
import "./DaiToken.sol";

contract TokenFarm {
	string public name = "Token Farm";
	address public owner;
	MyToken public myToken;
	DaiToken public daiToken;

	address[] public stakers;
	mapping(address => uint) public stakingBalance;
	mapping(address => bool) public hasStaked;
	mapping(address => bool) public isStaking;

	event TokensStaked(address staker, uint amount);
	event TokensUnstaked(address unstaker, uint amount);
	event TokensIssued();

	constructor(MyToken _myToken, DaiToken _daiToken) public {
		myToken = _myToken;
		daiToken = _daiToken;
		owner = msg.sender;
	}

	modifier ownerOnly() public {
		require(msg.sender == owner);
		_;
	}

	function stakeTokens(uint _amount) public {
		require(_amount > 0, "Amount cannot be zero");

		// transfer dai from msg.sender to contract.
		daiToken.transferFrom(msg.sender, address(this), _amount);

		// keep track of total balance staked by msg.sender
		stakingBalance[msg.sender] = stakingBalance[msg.sender] + _amount;

		// add msg.sender to list of stakers.
		if (!hasStaked[msg.sender]) {
			stakers.push(msg.sender);
		}

		// staking status
		hasStaked[msg.sender] = true;
		isStaking[msg.sender] = true;

		// trigger an event
		emit TokensStaked(msg.sender, _amount)
	}

	function unstakeTokens(uint _amount) public {
		// get staked balance
		uint balance = stakingBalance[msg.sender];
		// check if staking was done
		require(balance > 0, "Should have staked balance");
		// check if the amount to unstake is greater than staked balance
		require(balance >= _amount, "Staked amount should be higher than amount to unstake");
		//transfer staked balance back to owner
		daiToken.transfer(msg.sender, _amount);
		// set staking balance to none.
		stakingBalance[msg.sender] -= _amount;
		// update 
		if (stakingBalance[msg.sender] <= 0) {
			isStaking[msg.sender] = false;
		}
		// trigger event
		emit TokensUnstaked(msg.sender, _amount);
	}

	function issueTokens() public ownerOnly {
		for (uint i = 0; i < stakers.length; i++) {
			// get balance of all stakers
			uint balance = stakingBalance[stakers[i]];
			// check if they still stake some DAI.
			// if they dom transfer equivalent amount of dappTokens.
			if (balance > 0) {
				myToken.transfer(stakers[i], balance);
			}
		}
		// trigger event
		emit TokensIssued();
	}
}