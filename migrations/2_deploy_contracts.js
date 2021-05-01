const TokenFarm = artifacts.require("./TokenFarm.sol");
const MyToken = artifacts.require("./MyToken.sol");
const DaiToken = artifacts.require("./DaiToken.sol");

module.exports = async function(deployer, network, accounts) {
  // Deploy DAI Token
  await deployer.deploy(DaiToken)
  const daiToken = await DaiToken.deployed()

  // Deploy MyToken
  await deployer.deploy(MyToken)
  const myToken = await MyToken.deployed()

  // Deploy TokenFarm
  await deployer.deploy(TokenFarm, myToken.address, daiToken.address)
  const tokenFarm = await TokenFarm.deployed()

  // Transfer all tokens to TokenFarm (1 million)
  await myToken.transfer(tokenFarm.address, '1000000000000000000000000')

  // Transfer 100 Mock DAI tokens to investor
  await daiToken.transfer(accounts[1], '100000000000000000000')
}
