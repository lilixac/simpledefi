var TokenFarm = artifacts.require("./TokenFarm.sol");
var MyToken = artifacts.require("./MyToken.sol");
var DaiToken = artifacts.require("./DaiToken.sol");

module.exports = async function (deployer, network, accounts) {
	// deploy MyToken
	await deployer.deploy(MyToken);
	const myToken = await MyToken.deployed();

	// deploy DaiToken
	await deployer.deploy(DaiToken);
	const daiToken = DaiToken.deployed();

	// deploy TokenFarm
	await deployer.deploy(TokenFarm, myToken.address, daiToken.address);
	const tokenFarm = TokenFarm.deployed();

	// Transfer all MyToken supply to TokenFarm contract
	await myToken.transfer(tokenFarm.address, '1000000000000000000000000');
	// Transfer 100 DAI to account[1], second a/c in ganache to stake.
	await daiToken.transfer(accounts[1], '100000000000000000000');
};
