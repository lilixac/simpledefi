import React, { useState, useEffect } from "react";
import TokenFarmContract from "./contracts/TokenFarm.json";
import DaiTokenContract from "./contracts/DaiToken.json";
import MyTokenContract from "./contracts/MyToken.json";
import getWeb3 from "./getWeb3";

import "./App.css";

const App = () => {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [tokenFarm, setTokenFarm] = useState(null);
  const [daiToken, setDaiToken] = useState(null);
  const [maiToken, setMaiToken] = useState(null);
  const [daiBalance, setDaiBalance] = useState(0);
  const [maiBalance, setMaiBalance] = useState(0);

  useEffect(() => {
    async function fetchData() {
      try {
        // Get network provider and web3 instance.
        const web3 = await getWeb3();
        setWeb3(web3);

        // Use web3 to get the user's accounts.
        const accounts = await web3.eth.getAccounts();
        setAccount(accounts[0]);

        // Get the contract instance.
        const networkId = await web3.eth.net.getId();
        const deployedNetwork = TokenFarmContract.networks[networkId];
        const instance = new web3.eth.Contract(
          TokenFarmContract.abi,
          deployedNetwork && deployedNetwork.address
        );
        setTokenFarm(instance);

        const daiTokenNetwork = DaiTokenContract.networks[networkId];
        const daiInstance = new web3.eth.Contract(
          DaiTokenContract.abi,
          daiTokenNetwork && daiTokenNetwork.address
        );
        setDaiToken(daiInstance);

        const maiTokenNetwork = MyTokenContract.networks[networkId];
        const maiInstance = new web3.eth.Contract(
          MyTokenContract.abi,
          maiTokenNetwork && maiTokenNetwork.address
        );
        setMaiToken(maiInstance);

      } catch (error) {
        // Catch any errors for any of the above operations.
        alert(
          `Failed to load web3, accounts, or contract. Check console for details.`
        );
        console.error(error);
      }
    }
    fetchData();
  }, []);

  const getDaiBalance = async () => {
    var daiBalance = await daiToken.methods
      .balanceOf(account)
      .call();
    setDaiBalance(daiBalance.toString());
  };

  const getMaiBalance = async () => {
    var maiBalance = await maiToken.methods
      .balanceOf(account)
      .call();
    setMaiBalance(maiBalance.toString());
  };

  return (
    <div>
      {!web3 ? (
        <div>Loading Web3, accounts, and contract...</div>
      ) : (
        <div className="App">
          <p>{account}</p>
          <br />
          <button onClick={getMaiBalance}> Get Mai Token Balance </button>
          <br/>
          <button onClick={getDaiBalance}> Get Dai Token Balance </button>
          <br/>
          Current Dai balanceof this account: {daiBalance}
          <br />
          Current Mai balanceof this account: {maiBalance}
        </div>
      )}
    </div>
  );
};

export default App;
