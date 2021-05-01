const MyToken = artifacts.require("./MyToken.sol");
const DaiToken = artifacts.require("./DaiToken.sol");
const TokenFarm = artifacts.require("./TokenFarm.sol");

function toWei(n) {
	return web3.utils.toWei(n, "ether");
}

contract("TokenFarm", async (accounts) => {
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

	describe("Farming Tokens", async () => {
		it("rewards investors for staking DAI Tokens", async () => {
			let result;
			result = await daiToken.balanceOf(accounts[1]);
			// check balance before staking tokens
			assert.equal(
				result.toString(),
				toWei("100"),
				"investor balance correct before deploying."
			);
			// now investor stakes the tokens
			// first, need to approve tokenFarm address to spend account[1]'s tokens.
			await daiToken.approve(tokenFarm.address, toWei("100"), {
				from: accounts[1],
			});
			await tokenFarm.stakeTokens(toWei("50"), { from: accounts[1] });

			var invBal = await daiToken.balanceOf(accounts[1]);
			assert.equal(
				invBal.toString(),
				toWei("50"),
				"investor staked 50 DAI out of 100, so 50 DAI should be left."
			);

			var tokenFarmBal = await daiToken.balanceOf(tokenFarm.address);
			assert.equal(
				tokenFarmBal.toString(),
				toWei("50"),
				"investor staked 50 dais to TokenFarm contract."
			);

			var isStaking = await tokenFarm.isStaking(accounts[1]);
			assert.equal(
				isStaking.toString(),
				"true",
				"staking status is correct"
			);

			var hasStaked = await tokenFarm.hasStaked(accounts[1]);
			assert.equal(
				hasStaked.toString(),
				"true",
				"staking status is correct"
			);

			// investor unstakes their tokens
			// await tokenFarm.unstakeTokens(toWei("50"), { from: accounts[1] });

			// tokenFarmBal = await daiToken.balanceOf(tokenFarm.address);
			// assert.equal(
			// 	tokenFarmBal.toString(),
			// 	toWei("0"),
			// 	"investor took all back, contract has 0 dai."
			// );

			// isStaking = await tokenFarm.isStaking(accounts[1]);
			// assert.equal(
			// 	isStaking.toString(),
			// 	"false",
			// 	"staking status is correct"
			// );

			// investor unstakes some of their tokens
			await tokenFarm.unstakeTokens(toWei("20"), { from: accounts[1] });

			tokenFarmBal = await daiToken.balanceOf(tokenFarm.address);
			assert.equal(
				tokenFarmBal.toString(),
				toWei("30"),
				"investor took 20 DAI back, contract has 30 DAI."
			);

			isStaking = await tokenFarm.isStaking(accounts[1]);
			assert.equal(
				isStaking.toString(),
				"true",
				"staking status is correct"
			);

			// issue MyToken to investors
			await tokenFarm.issueTokens({ from: accounts[0] });
			var invMyTok = await myToken.balanceOf(accounts[1]);
			assert.equal(
				invMyTok.toString(),
				toWei("30"),
				"got 30 MAI as reward"
			);

			// investor unstakes all of their tokens
			await tokenFarm.unstakeTokens(toWei("30"), { from: accounts[1] });

			tokenFarmBal = await daiToken.balanceOf(tokenFarm.address);
			assert.equal(
				tokenFarmBal.toString(),
				toWei("0"),
				"investor took all DAI back, contract has 0 DAI."
			);

			isStaking = await tokenFarm.isStaking(accounts[1]);
			assert.equal(
				isStaking.toString(),
				"false",
				"staking status is correct"
			);

			// issue MyToken to investors, this time investor has unstaked all, so should recieve 0 dai.
			await tokenFarm.issueTokens({ from: accounts[0] });
			invMyTok = await myToken.balanceOf(accounts[1]);
			// balance should be 30 MAI, obtained previously.
			assert.equal(
				invMyTok.toString(),
				toWei("30"),
				"did not get reward for unstaked tokens."
			);

		});
	});
});
