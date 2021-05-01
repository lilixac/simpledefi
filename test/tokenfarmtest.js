const MyToken = artifacts.require("./MyToken.sol");
const DaiToken = artifacts.require("./DaiToken.sol");
const TokenFarm = artifacts.require("./TokenFarm.sol");

function toWei(n) {
	return web3.utils.toWei(n, "ether");
}

contract("DAI Token", async (accounts) => {
	before(async () => {
		daiToken = await DaiToken.new();
		myToken = await MyToken.new();
		tokenFarm = await TokenFarm.new(myToken.address, daiToken.address);

		await myToken.transfer(tokenFarm.address, toWei("1000000"));
		await daiToken.transfer(accounts[1], toWei("100"), {
			from: accounts[0],
		});
	});

	it("DAI Token is deployed successfully", async () => {
		const name = await daiToken.name();
		const symbol = await daiToken.symbol();
		assert.equal(name, "Dai Token");
		assert.equal(symbol, "DAI");
	});

	it("My Token is deployed successfully", async () => {
		const name = await myToken.name();
		const symbol = await myToken.symbol();
		assert.equal(name, "My Token");
		assert.equal(symbol, "MAI");
	});

	describe("TokenFarm deployment", async () => {
		it("has a name", async () => {
			const name = await tokenFarm.name();
			assert.equal(name, "Token Farm");
		});

		it("contract has tokens", async () => {
			const balance = await myToken.balanceOf(tokenFarm.address);
			assert.equal(balance.toString(), toWei("1000000"));
		});
	});
});
