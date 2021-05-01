const TokenFarm = artifacts.require("./TokenFarm.sol");

module.exports = async function (callback) {
  var tokenFarm = await TokenFarm.deployed();
  await tokenFarm.issueTokens();
  console.log("MAI Tokens issued!");
  callback();
};
