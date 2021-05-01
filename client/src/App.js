import React, { useState, useEffect } from "react";
import TokenFarmContract from "./contracts/TokenFarm.json";
import DaiTokenContract from "./contracts/DaiToken.json";
import MyTokenContract from "./contracts/MyToken.json";
import getWeb3 from "./getWeb3";
import {
  FormControl,
  Row,
  Col,
  Button,
  Nav,
  Card,
  Navbar,
  Container,
  ListGroup,
  InputGroup,
  Spinner,
} from "react-bootstrap";

import "./App.css";

const App = () => {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [tokenFarm, setTokenFarm] = useState(null);
  const [daiToken, setDaiToken] = useState(null);
  const [maiToken, setMaiToken] = useState(null);
  const [daiBalance, setDaiBalance] = useState(0);
  const [maiBalance, setMaiBalance] = useState(0);
  const [stakingBalance, setStakingBalance] = useState(0);
  const [unstakingBalance, setUntakingBalance] = useState(0);
  const [stakedBalance, setStakedBalance] = useState(0);

  useEffect(() => {
    async function fetchData() {
      try {
        // Get network provider and web3 instance.
        const web3 = await getWeb3();
        setWeb3(web3);

        // Use web3 to get the user's accounts.
        const accounts = await web3.eth.getAccounts();
        setAccount(accounts[0]);

        const toEther = (n) => {
          return web3.utils.fromWei(n, "ether");
        };

        // Get the contract instance.
        const networkId = await web3.eth.net.getId();
        const deployedNetwork = TokenFarmContract.networks[networkId];
        const instance = new web3.eth.Contract(
          TokenFarmContract.abi,
          deployedNetwork && deployedNetwork.address
        );

        setStakedBalance(
          toEther(await instance.methods.stakedTokens(accounts[0]).call())
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

        var daiBalance = await daiInstance.methods
          .balanceOf(accounts[0])
          .call();
        setDaiBalance(toEther(daiBalance.toString()));

        var maiBalance = await maiInstance.methods
          .balanceOf(accounts[0])
          .call();
        setMaiBalance(toEther(maiBalance.toString()));
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

  const toEther = (n) => {
    return web3.utils.fromWei(n.toString(), "ether");
  };

  const toWei = (n) => {
    return web3.utils.toWei(n, "ether");
  };

  const stakeTokens = async () => {
    await daiToken.methods
      .approve(tokenFarm._address, toWei(stakingBalance.toString()))
      .send({ from: account })
      .then(async () => {
        await tokenFarm.methods
          .stakeTokens(toWei(stakingBalance.toString()))
          .send({ from: account });
      });
    updateStatus();
  };

  const unstakeTokens = async () => {
    await tokenFarm.methods
      .unstakeTokens(toWei(unstakingBalance.toString()))
      .send({ from: account });
    updateStatus();
  };

  const updateStatus = async () => {
    setStakedBalance(
      toEther(await tokenFarm.methods.stakedTokens(account).call())
    );
    setMaiBalance(toEther(await maiToken.methods.balanceOf(account).call()));
    setDaiBalance(toEther(await daiToken.methods.balanceOf(account).call()));
  };

  return (
    <div>
      {!web3 ? (
        <Spinner animation="border" />
      ) : (
        <div className="App">
          <Navbar bg="dark" variant="dark">
            <Navbar.Brand href="#home">Simple Defi</Navbar.Brand>
            <Nav className="mr-auto"></Nav>
            <Nav className="whiten">{account}</Nav>
          </Navbar>
          <br />
          <Container style={{ width: "40%" }}>
            <ListGroup>
              <ListGroup.Item>
                <Container>
                  <Row style={{ height: "4em" }}>
                    <Col>
                      <u>Available Balance</u>
                      <br /> {daiBalance} DAI
                    </Col>
                    <Col>
                      <u>Reward Balance</u>
                      <br /> {maiBalance} MAI
                    </Col>
                  </Row>
                </Container>
              </ListGroup.Item>
              <ListGroup.Item>
                <Container>
                  <Row style={{ height: "6em" }}>
                    <Col></Col>
                    <Card body border="dark">
                      <Col>
                        <u>Staked Balance</u> <br /> {stakedBalance} DAI
                      </Col>
                    </Card>
                    <Col></Col>
                  </Row>
                </Container>
              </ListGroup.Item>
              <ListGroup.Item>
                <InputGroup className="mb-2">
                  <InputGroup.Prepend>
                    <InputGroup.Text>DAI</InputGroup.Text>
                  </InputGroup.Prepend>
                  <FormControl
                    onChange={(e) => setStakingBalance(e.target.value)}
                    placeholder="Number of tokens to stake"
                  />
                  <InputGroup.Append>
                    <Button onClick={stakeTokens} variant="dark">
                      Stake Tokens
                    </Button>
                  </InputGroup.Append>
                </InputGroup>
              </ListGroup.Item>
              <ListGroup.Item>
                <InputGroup className="mb-2">
                  <InputGroup.Prepend>
                    <InputGroup.Text>DAI</InputGroup.Text>
                  </InputGroup.Prepend>
                  <FormControl
                    onChange={(e) => setUntakingBalance(e.target.value)}
                    placeholder="Number of tokens to unstake"
                  />
                  <InputGroup.Append>
                    <Button onClick={unstakeTokens} variant="dark">
                      Unstake Tokens
                    </Button>
                  </InputGroup.Append>
                </InputGroup>
              </ListGroup.Item>
            </ListGroup>
          </Container>
        </div>
      )}
    </div>
  );
};

export default App;
